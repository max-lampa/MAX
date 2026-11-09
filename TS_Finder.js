/*
 * TS Finder для Lampa — миттєвий пошук TorrServer у локальній мережі Wi-Fi.
 *
 * Що робить плагін:
 *   - додає в меню «Налаштування → TorrServer» кнопку «Знайти TorrServer у мережі Wi-Fi»;
 *   - визначає підмережу, у якій працює телевізор/приставка (WebRTC + типові 192.168.0/1);
 *   - паралельно опитує всі адреси підмережі на порту TorrServer (за замовчуванням 8090);
 *   - упевнюється, що знайдений саме TorrServer, за відповіддю /echo (версія MatriX);
 *   - знайдену адресу одразу записує в налаштування Lampa (основну або додаткову).
 *
 * Встановлення: Налаштування → Розширення → Додати плагін → URL цього файлу.
 * Сумісно з Lampa 2.x/3.x (потрібен Lampa.SettingsApi).
 *
 * Ліцензія: MIT.
 */

(function () {
    'use strict';

    var VERSION = '1.0.0';

    var PROBE_TIMEOUT = 450;   // мс на одну адресу
    var CONCURRENCY    = 40;   // кількість паралельних запитів
    var MAX_PREFIXES   = 3;    // скільки підмереж сканувати максимум

    var DEFAULT_DESCR = 'Автоматичний пошук TorrServer у локальній мережі та запис знайденої адреси в налаштування.';

    var state = {
        scanning: false,   // чи триває сканування
        token: 0,         // ідентифікатор поточного сканування (захист від перегонів)
        buttonElem: null  // jQuery-елемент кнопки на екрані налаштувань
    };

    /* ---------- Допоміжні ---------- */

    function notify(text) {
        try {
            if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(text);
        } catch (e) { }
    }

    function storageGet(name, def) {
        try {
            return Lampa.Storage.get(name, def);
        } catch (e) {
            return def;
        }
    }

    function storageSet(name, value) {
        try {
            Lampa.Storage.set(name, value);
        } catch (e) { }
    }

    /* Показати текст під кнопкою (прогрес і результат сканування) */
    function setButtonDescr(text) {
        var elem = state.buttonElem;
        if (!elem || !elem.length) return;
        try {
            if (elem[0] && elem[0].isConnected === false) return; // екран уже закрито
        } catch (e) { }
        var descr = elem.find('.settings-param__descr');
        if (descr.length) descr.text(text);
        else elem.append('<div class="settings-param__descr">' + text + '</div>');
    }

    /* ---------- Розбір адрес і портів ---------- */

    /* «192.168.0» → true, «8.8.8» → false. Лише приватні діапазони. */
    function isPrivatePrefix(prefix) {
        if (typeof prefix !== 'string') return false;
        var parts = prefix.split('.');
        if (parts.length !== 3) return false;

        var octets = [];
        for (var i = 0; i < 3; i++) {
            var n = parseInt(parts[i], 10);
            if (isNaN(n) || n < 0 || n > 255 || String(n) !== parts[i]) return false;
            octets.push(n);
        }

        if (octets[0] === 192 && octets[1] === 168) return true;
        if (octets[0] === 10) return true;
        if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;

        return false;
    }

    /* «http://192.168.0.5:8090» або «192.168.0.5:8090» → «192.168.0» */
    function prefixFromUrlValue(value) {
        var text = (value || '').toString().trim().replace(/^https?:\/\//i, '');
        var match = /^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}/.exec(text);
        return match ? match[1] : null;
    }

    /* Підмережі з уже вказаних адрес TorrServer */
    function prefixesFromUrls() {
        var result = [];
        ['torrserver_url', 'torrserver_url_two'].forEach(function (key) {
            var prefix = prefixFromUrlValue(storageGet(key, ''));
            if (prefix && result.indexOf(prefix) === -1) result.push(prefix);
        });
        return result;
    }

    /* Порти зі налаштування «Порти для сканування», за замовчуванням 8090 */
    function collectPorts() {
        var raw = (storageGet('tsfinder_ports', '8090') || '8090').toString();
        var ports = [];

        raw.split(/[,;\s]+/).forEach(function (part) {
            var port = parseInt(part, 10);
            if (port > 0 && port < 65536 && ports.indexOf(port) === -1) ports.push(port);
        });

        if (!ports.length) ports.push(8090);
        return ports;
    }

    /* ---------- Визначення підмережі ---------- */

    /*
     * WebRTC: ICE-кандидати містять локальну IP-адресу самого пристрою.
     * У браузерах кандидат може бути прихований (mDNS .local) — тоді просто
     * повернеться порожній список і сканування піде типовими підмережами.
     */
    function detectPrefixesWebRtc(cb) {
        var found = [];
        var PC = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.msRTCPeerConnection;

        if (!PC) { cb(found); return; }

        var finished = false;
        var pc = null;

        function finish() {
            if (finished) return;
            finished = true;
            try { if (pc && pc.close) pc.close(); } catch (e) { }
            cb(found);
        }

        try {
            pc = new PC({ iceServers: [] });
            if (pc.createDataChannel) pc.createDataChannel('tsfinder');

            pc.onicecandidate = function (e) {
                if (!e || !e.candidate) { finish(); return; }
                var candidate = e.candidate.candidate || '';
                var match = /(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}/.exec(candidate);
                if (match && isPrivatePrefix(match[1]) && found.indexOf(match[1]) === -1) found.push(match[1]);
            };

            setTimeout(finish, 400);

            pc.createOffer(function (offer) {
                pc.setLocalDescription(offer, function () { }, function () { finish(); });
            }, function () { finish(); });
        } catch (e) {
            finish();
        }
    }

    /* Пріоритет: своя підмережа → WebRTC → адреси з налаштувань → типові 192.168.0/1 */
    function collectPrefixes(webrtcPrefixes) {
        var list = [];

        function add(prefix) {
            if (isPrivatePrefix(prefix) && list.indexOf(prefix) === -1) list.push(prefix);
        }

        var custom = (storageGet('tsfinder_prefix', '') || '').toString().trim();
        var match = /^https?:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3})(?:\.\d{1,3})?/i.exec(custom) ||
                    /^(\d{1,3}\.\d{1,3}\.\d{1,3})(?:\.\d{1,3})?$/.exec(custom);

        if (match) {
            add(match[1]);
            return list;
        }

        (webrtcPrefixes || []).forEach(add);
        prefixesFromUrls().forEach(add);

        if (list.length < MAX_PREFIXES) {
            add('192.168.0');
            add('192.168.1');
        }

        return list.slice(0, MAX_PREFIXES);
    }

    /* ---------- Сканування ---------- */

    /*
     * Один запит до http://IP:PORT/echo.
     * TorrServer MatriX відповідає коротким рядком версії (напр. «MatriX.147f...»).
     * Приймаємо 2xx з коротким тілом — сторонні сервери на порту 8090 майже не трапляються.
     */
    function probe(ip, port, cb) {
        var address = 'http://' + ip + ':' + port;
        var xhr = null;
        var done = false;
        var started = Date.now();
        var timer = null;

        function finish(foundInfo) {
            if (done) return;
            done = true;
            if (timer) clearTimeout(timer);
            try { if (xhr && xhr.abort) xhr.abort(); } catch (e) { }

            if (foundInfo) {
                foundInfo.address = address;
                foundInfo.time = Date.now() - started;
                cb(foundInfo);
            } else {
                cb(null);
            }
        }

        timer = setTimeout(function () { finish(null); }, PROBE_TIMEOUT);

        try {
            xhr = new XMLHttpRequest();
            xhr.open('GET', address + '/echo', true);
            if ('timeout' in xhr) xhr.timeout = PROBE_TIMEOUT;

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    var body = '';
                    try { body = (xhr.responseText || '').toString().trim(); } catch (e) { }

                    if (body && body.length <= 120) {
                        finish({ version: /matrix/i.test(body) ? body : '' });
                    } else if (xhr.status === 200) {
                        finish({ version: '' });
                    } else {
                        finish(null);
                    }
                } else {
                    finish(null);
                }
            };

            xhr.ontimeout = xhr.onerror = function () { finish(null); };

            xhr.send();
        } catch (e) {
            finish(null);
        }
    }

    /* Черга адрес: спершу сам пристрій (127.0.0.1), потім усі хости підмереж */
    function buildTasks(prefixes, ports) {
        var tasks = [];

        ports.forEach(function (port) {
            tasks.push({ ip: '127.0.0.1', port: port });
        });

        prefixes.forEach(function (prefix) {
            for (var host = 1; host <= 254; host++) {
                ports.forEach(function (port) {
                    tasks.push({ ip: prefix + '.' + host, port: port });
                });
            }
        });

        return tasks;
    }

    /* Пул запитів із обмеженою паралельністю; зупиняється на першому знайденому */
    function runScan(token, tasks) {
        var idx = 0, active = 0, checked = 0, total = tasks.length;
        var finished = false;

        function finishNone() {
            if (finished) return;
            finished = true;
            applyNotFound(token);
        }

        function pump() {
            if (finished || token !== state.token) return;

            while (active < CONCURRENCY && idx < total) {
                var task = tasks[idx++];
                active++;

                probe(task.ip, task.port, function (res) {
                    active--;
                    checked++;

                    if (finished || token !== state.token) return;

                    if (res) {
                        finished = true;
                        applyFound(token, res);
                        return;
                    }

                    if (checked % 25 === 0) setButtonDescr('Сканування: перевірено ' + checked + ' з ' + total + ' адрес…');

                    pump();
                });
            }

            if (active === 0 && idx >= total) finishNone();
        }

        pump();
    }

    /* ---------- Результати ---------- */

    function applyFound(token, res) {
        if (token !== state.token) return;
        state.scanning = false;

        var target = (storageGet('tsfinder_target', 'one') || '').toString() || 'one';
        var key = target === 'two' ? 'torrserver_url_two' : 'torrserver_url';

        storageSet(key, res.address);

        var version = (res.version || '').toString().slice(0, 40);
        setButtonDescr('Знайдено: ' + res.address + (version ? ' (' + version + ')' : '') + '. Адресу записано в налаштування.');

        /* Оновити значення поля на відкритому екрані налаштувань TorrServer */
        try {
            var field = $('div[data-name="' + key + '"]');
            if (field && field.length) field.find('.settings-param__value').text(res.address);
        } catch (e) { }

        var message = 'TorrServer знайдено: ' + res.address;
        if (version) message += ' — ' + version;
        message += '. Адресу записано (' + (target === 'two' ? 'додаткова посилання' : 'основна посилання') + ').';

        notify(message);
    }

    function applyNotFound(token) {
        if (token !== state.token) return;
        state.scanning = false;

        setButtonDescr('TorrServer не знайдено. Перевірте, що сервер запущений і пристрій у тій самій Wi-Fi мережі, та спробуйте ще раз.');
        notify('TorrServer у локальній мережі не знайдено.');
    }

    /* ---------- Обробник кнопки ---------- */

    function onScanButton() {
        if (state.scanning) {
            notify('Пошук TorrServer уже триває, зачекайте завершення.');
            return;
        }

        state.scanning = true;
        var token = ++state.token;

        setButtonDescr('Визначення підмережі Wi-Fi…');
        notify('Пошук TorrServer у локальній мережі розпочато…');

        if (typeof location !== 'undefined' && location.protocol === 'https:') {
            notify('Увага: Lampa відкрита по HTTPS — запити до локальних http-адрес може блокувати браузер.');
        }

        /* Страхувальний таймаут на випадок підвішаних запитів */
        setTimeout(function () {
            if (state.token === token && state.scanning) applyNotFound(token);
        }, 60000);

        detectPrefixesWebRtc(function (webrtcPrefixes) {
            if (token !== state.token) return;

            var ports = collectPorts();
            var prefixes = collectPrefixes(webrtcPrefixes);
            var tasks = buildTasks(prefixes, ports);

            setButtonDescr('Сканування мережі: перевірено 0 з ' + tasks.length + ' адрес…');
            runScan(token, tasks);
        });
    }

    /* ---------- Реєстрація в налаштуваннях TorrServer ---------- */

    function registerParams() {
        var Api = Lampa.SettingsApi;

        /* Кнопка пошуку — з'являється в кінці сторінки «Налаштування → TorrServer» */
        Api.addParam({
            component: 'server',
            param: {
                name: 'tsfinder_button',
                type: 'button'
            },
            field: {
                name: 'Знайти TorrServer у мережі Wi-Fi',
                description: DEFAULT_DESCR
            },
            onRender: function (item) {
                state.buttonElem = item;
            },
            onChange: onScanButton
        });

        /* Куди записати знайдену адресу */
        Api.addParam({
            component: 'server',
            param: {
                name: 'tsfinder_target',
                type: 'select',
                values: { one: 'Основну', two: 'Додаткову' },
                default: 'one'
            },
            field: {
                name: 'Записати знайдену адресу'
            }
        });

        /* Порти для сканування */
        Api.addParam({
            component: 'server',
            param: {
                name: 'tsfinder_ports',
                type: 'input',
                values: '',
                default: '8090',
                placeholder: '8090'
            },
            field: {
                name: 'Порти для сканування',
                description: 'Через кому, наприклад: 8090,8091'
            }
        });

        /* Своя підмережа, якщо автовизначення не спрацювало */
        Api.addParam({
            component: 'server',
            param: {
                name: 'tsfinder_prefix',
                type: 'input',
                values: '',
                default: '',
                placeholder: '192.168.0'
            },
            field: {
                name: 'Своя підмережа Wi-Fi',
                description: 'Наприклад: 192.168.0 — сканувати лише її'
            }
        });
    }

    /* ---------- Запуск ---------- */

    function init() {
        if (window.tsfinder_plugin) return; // плагін уже завантажено

        window.tsfinder_plugin = {
            version: VERSION,
            test: {
                isPrivatePrefix: isPrivatePrefix,
                prefixFromUrlValue: prefixFromUrlValue,
                collectPorts: collectPorts,
                collectPrefixes: collectPrefixes,
                buildTasks: buildTasks
            }
        };

        if (!Lampa.SettingsApi || typeof Lampa.SettingsApi.addParam !== 'function') {
            notify('TS Finder: ця версія Lampa не підтримує SettingsApi, плагін не активовано.');
            return;
        }

        registerParams();
    }

    if (typeof Lampa === 'undefined') return; // скрипт виконано поза Lampa

    if (window.appready) init();
    else if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) {
            if (e && e.type === 'ready') init();
        });
    }
})();