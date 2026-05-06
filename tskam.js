(function () {
    'use strict';

    var plugin = {
        name: 'TorrServer Rotation',
        version: '1.2.0',
        description: 'TorrServer selection with built-in server support (fixed remote/focus + mixed-content guard)'
    };

    var config = {
        servers: [
            { url: 'http://77.38.185.156:8090',  title: 'serv 1', available: true },
            { url: 'http://194.147.148.100:8090', title: 'serv 2', available: true },
            { url: 'http://193.42.60.42:8090',   title: 'serv 3', available: true }
        ],
        builtinUrl: 'http://127.0.0.1:8090',
        checkTimeout: 8000,
        autostartSeconds: 9,
        enableLogging: true,
        showServerSelection: true,
        currentIndex: 0
    };

    var ENABLE_LOGGING = config.enableLogging;
    var TS_ROTATION = {
        log: function (msg) {
            if (ENABLE_LOGGING && window.console && console.log) {
                console.log('[TS_ROTATION]', msg);
            }
        }
    };

    var network = new Lampa.Reguest();
    var builtinServerAvailable = false;

    var pageIsHttps = (typeof location !== 'undefined' && location.protocol === 'https:');

    function isHttpUrl(url) {
        return /^http:\/\//i.test(url);
    }

    function mixedContentBlocked(url) {
        return pageIsHttps && isHttpUrl(url);
    }

    function checkAvailability(url, callback) {
        if (mixedContentBlocked(url)) {
            TS_ROTATION.log('Skip (mixed content blocked, page is HTTPS, server is HTTP): ' + url);
            callback(false);
            return;
        }

        network.timeout(config.checkTimeout);

        var head = { dataType: 'text' };
        var auth = Lampa.Storage.field('torrserver_auth');
        if (auth) {
            head.headers = {
                Authorization: 'Basic ' + Lampa.Base64.encode(
                    Lampa.Storage.get('torrserver_login') + ':' + Lampa.Storage.value('torrserver_password')
                )
            };
        }

        network.native(Lampa.Utils.checkEmptyUrl(url), function () {
            TS_ROTATION.log('Server available: ' + url);
            callback(true);
        }, function (a, c) {
            if (a && a.status === 401) {
                TS_ROTATION.log('Server available but auth failed: ' + url);
                callback(true);
            } else {
                TS_ROTATION.log('Server unavailable: ' + url + ' - ' + network.errorDecode(a, c));
                callback(false);
            }
        }, false, head);
    }

    function pickServer() {
        if (builtinServerAvailable && config.servers.length && config.servers[0].isBuiltin) {
            config.currentIndex = 0;
            Lampa.Storage.set('torrserver_url', config.servers[0].url);
            TS_ROTATION.log('Using built-in TorrServer');
            return config.servers[0].url;
        }

        var available = [];
        for (var i = 0; i < config.servers.length; i++) {
            if (config.servers[i].available) available.push({ s: config.servers[i], i: i });
        }
        if (!available.length) return null;

        var pick = available[Math.floor(Math.random() * available.length)];
        config.currentIndex = pick.i;
        Lampa.Storage.set('torrserver_url', pick.s.url);
        TS_ROTATION.log('Randomly selected TorrServer: ' + pick.s.title);
        return pick.s.url;
    }

    function checkAllServers(done) {
        var pending = config.servers.length + 1;
        TS_ROTATION.log('Checking availability of all TorrServer URLs');

        function onDone() {
            pending--;
            if (pending === 0) {
                pickServer();
                if (done) done();
            }
        }

        checkAvailability(config.builtinUrl, function (ok) {
            if (ok) {
                builtinServerAvailable = true;
                config.servers.unshift({
                    url: config.builtinUrl,
                    title: 'Встроенный',
                    available: true,
                    isBuiltin: true
                });
                TS_ROTATION.log('Built-in TorrServer available');
            }
            onDone();
        });

        for (var i = 0; i < config.servers.length; i++) {
            (function (server) {
                if (server.isBuiltin) { onDone(); return; }
                checkAvailability(server.url, function (ok) {
                    server.available = ok;
                    onDone();
                });
            })(config.servers[i]);
        }
    }

    function showServerSelection(callback) {
        var available = [];
        for (var i = 0; i < config.servers.length; i++) {
            if (config.servers[i].available) available.push(config.servers[i]);
        }

        if (!config.showServerSelection || available.length <= 1) {
            var url = pickServer() || (config.servers[config.currentIndex] && config.servers[config.currentIndex].url);
            callback(url || null);
            return;
        }

        var currentUrl = Lampa.Storage.get('torrserver_url') || (config.servers[config.currentIndex] && config.servers[config.currentIndex].url);
        var defaultIndex = 0;
        var items = [];
        for (var j = 0; j < available.length; j++) {
            var s = available[j];
            var isCurrent = s.url === currentUrl;
            if (isCurrent) defaultIndex = j;
            items.push({
                title: s.title + (isCurrent ? ' — текущий' : ''),
                subtitle: s.url + (mixedContentBlocked(s.url) ? '  ⚠ mixed content' : ''),
                url: s.url,
                index: j
            });
        }

        var enabled = Lampa.Controller.enabled().name;
        var autostartTimer = null;
        var autostartCleared = false;
        var resolved = false;

        function clearAutostart() {
            autostartCleared = true;
            if (autostartTimer) {
                clearInterval(autostartTimer);
                autostartTimer = null;
            }
            Lampa.Keypad.listener.remove('keydown', clearAutostart);
            var bar = $('.torrent-server__progress-bar');
            if (bar.length) bar.css('width', '0%');
        }

        function closeStyling() {
            $('body').removeClass('tsr-atv-open');
        }

        function finish(url) {
            if (resolved) return;
            resolved = true;
            clearAutostart();
            closeStyling();
            Lampa.Select.hide();
            callback(url);
        }

        $('body').addClass('tsr-atv-open');

        Lampa.Select.show({
            title: 'Выберите TorrServer',
            items: items,
            onBack: function () {
                if (resolved) return;
                resolved = true;
                clearAutostart();
                closeStyling();
                Lampa.Controller.toggle(enabled);
                callback(null);
            },
            onSelect: function (item) {
                finish(item.url);
            }
        });

        // Inject a slim progress bar into the just-opened select panel + tag it
        setTimeout(function () {
            var box = $('.selectbox').last();
            if (box.length) box.addClass('tsr-atv');
            var panel = $('.selectbox__content, .selectbox-content').last();
            if (panel.length && !panel.find('.torrent-server__progress').length) {
                panel.append(
                    '<div class="torrent-server__progress"><div class="torrent-server__progress-bar"></div></div>'
                );
            }
        }, 30);

        var startTime = Date.now();
        var totalMs = config.autostartSeconds * 1000;
        var autostartUrl = pickServer() || available[0].url;

        autostartTimer = setInterval(function () {
            if (autostartCleared) return;
            var elapsed = Date.now() - startTime;
            var pct = Math.min((elapsed / totalMs) * 100, 100);
            $('.torrent-server__progress-bar').css('width', pct + '%');
            if (elapsed >= totalMs) {
                finish(autostartUrl);
            }
        }, 100);

        Lampa.Keypad.listener.follow('keydown', clearAutostart);
    }

    function interceptTorrentStart() {
        if (!(window.Lampa && Lampa.Torrent && typeof Lampa.Torrent.start === 'function')) return;
        var original = Lampa.Torrent.start;
        Lampa.Torrent.start = function (element, movie) {
            var self = this;
            var args = arguments;

            if (!config.showServerSelection) {
                pickServer();
                return original.apply(self, args);
            }

            showServerSelection(function (selectedUrl) {
                if (selectedUrl) {
                    Lampa.Storage.set('torrserver_url', selectedUrl);
                    if (mixedContentBlocked(selectedUrl)) {
                        Lampa.Noty.show('Этот TorrServer использует HTTP, а Lampa открыта по HTTPS. Браузер заблокирует запросы (mixed content). Откройте Lampa по HTTP или используйте TorrServer с HTTPS.');
                    }
                    original.apply(self, args);
                } else {
                    TS_ROTATION.log('Server selection cancelled');
                }
            });
        };
    }

    function init() {
        TS_ROTATION.log('TorrServer Rotation Plugin initialized (v' + plugin.version + ')');

        if (pageIsHttps) {
            TS_ROTATION.log('Page is HTTPS — HTTP TorrServer URLs will be blocked by the browser (mixed content).');
        }

        checkAllServers();
        interceptTorrentStart();

        Lampa.Storage.listener.follow('change', function (event) {
            if (event.name === 'torrserver_url') {
                var currentUrl = event.value;
                for (var i = 0; i < config.servers.length; i++) {
                    if (config.servers[i].url === currentUrl) {
                        config.currentIndex = i;
                        TS_ROTATION.log('TorrServer URL manually changed to: ' + config.servers[i].title);
                        break;
                    }
                }
            }
        });
    }

    $('body').append(
        '<style>' +
        /* Apple TV style overlay */
        '.selectbox.tsr-atv, body.tsr-atv-open .selectbox { background: rgba(0,0,0,0.55) !important; backdrop-filter: blur(28px) saturate(160%); -webkit-backdrop-filter: blur(28px) saturate(160%); }' +
        '.selectbox.tsr-atv .selectbox__head, body.tsr-atv-open .selectbox .selectbox__head { padding: 2.2em 2.4em 1em; }' +
        '.selectbox.tsr-atv .selectbox__title, body.tsr-atv-open .selectbox .selectbox__title { font-size: 1.6em; font-weight: 600; letter-spacing: -0.01em; color: #fff; text-align: center; }' +
        '.selectbox.tsr-atv .selectbox__content, body.tsr-atv-open .selectbox .selectbox__content { width: 36em; max-width: 92vw; margin: 0 auto; background: rgba(28,28,30,0.78); border-radius: 1.4em; padding: 0.8em; box-shadow: 0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset; backdrop-filter: blur(40px) saturate(180%); -webkit-backdrop-filter: blur(40px) saturate(180%); overflow: hidden; }' +
        '.selectbox.tsr-atv .selectbox__body, body.tsr-atv-open .selectbox .selectbox__body { padding: 0.4em; }' +
        /* Rows */
        '.selectbox.tsr-atv .selectbox-item, body.tsr-atv-open .selectbox .selectbox-item { background: transparent; border: 0; border-radius: 1em; padding: 1em 1.2em; margin: 0.25em 0; transition: transform 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease; }' +
        '.selectbox.tsr-atv .selectbox-item__title, body.tsr-atv-open .selectbox .selectbox-item__title { color: #fff; font-size: 1.15em; font-weight: 500; letter-spacing: -0.005em; }' +
        '.selectbox.tsr-atv .selectbox-item__subtitle, body.tsr-atv-open .selectbox .selectbox-item__subtitle { color: rgba(235,235,245,0.6); font-size: 0.85em; margin-top: 0.25em; }' +
        '.selectbox.tsr-atv .selectbox-item.focus, body.tsr-atv-open .selectbox .selectbox-item.focus { background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(235,235,235,0.85)); transform: scale(1.04); box-shadow: 0 18px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.4) inset; }' +
        '.selectbox.tsr-atv .selectbox-item.focus .selectbox-item__title, body.tsr-atv-open .selectbox .selectbox-item.focus .selectbox-item__title { color: #111; }' +
        '.selectbox.tsr-atv .selectbox-item.focus .selectbox-item__subtitle, body.tsr-atv-open .selectbox .selectbox-item.focus .selectbox-item__subtitle { color: rgba(60,60,67,0.75); }' +
        /* Progress */
        '.torrent-server__progress { height: 0.32em; margin: 0.8em 0.6em 0.4em; background-color: rgba(255,255,255,0.12); border-radius: 5em; overflow: hidden; }' +
        '.torrent-server__progress-bar { height: 100%; background: linear-gradient(90deg, #fff, rgba(255,255,255,0.85)); width: 0%; transition: width 0.1s linear; border-radius: 5em; }' +
        '</style>'
    );

    if (window.Lampa && Lampa.Plugin) {
        Lampa.Plugin.add(plugin);
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
