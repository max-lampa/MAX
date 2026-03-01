/**
 * Marks Only — плагин для Lampa.
 * Вывод меток (качество, озвучка (RU, UA, EN), рейтинг) на постеры и страницу описания.
 * Убрана польская озвучка.
 * Оптимизирован: мгновенный рендер сохранённых меток, добавлен Storage кэш для UaFix, убрана анимация.
 */

(function () {
    'use strict';

    if (typeof Lampa === 'undefined') {
        console.error('Lampa not found (script loaded before app?)');
        return;
    }

    // =================================================================
    // НАСТРОЙКИ ДЛЯ МЕТОК (на русском языке)
    // =================================================================
    function setupMarksSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

        Lampa.SettingsApi.addComponent({
            component: 'marks_flags',               // переименовано
            name: 'Метки на постерах',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21h6m-3-18v1m-6.36 1.64l.7.71m12.02-.71l-.7.71M4 12H3m18 0h-1M8 12a4 4 0 108 0 4 4 0 00-8 0zm-1 5h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { type: 'title' },
            field: { name: 'Отображение меток на карточках' }
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_ru', type: 'trigger', default: true },
            field: { name: 'Русская озвучка (🇷🇺)' }
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_ua', type: 'trigger', default: true },
            field: { name: 'Украинская озвучка (🇺🇦)' }
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_en', type: 'trigger', default: true },
            field: { name: 'Английская озвучка (🇬🇧)' }
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_4k', type: 'trigger', default: true },
            field: { name: 'Качество 4K' }
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_fhd', type: 'trigger', default: true },
            field: { name: 'Качество FHD/HD' }
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_hdr', type: 'trigger', default: true },
            field: { name: 'HDR / Dolby Vision' }
        });
    }

    // =================================================================
    // QUALITY MARKS (JacRed + UaFix) с поддержкой русского языка
    // =================================================================
    function initMarksJacRed() {
        var workingProxy = null;
        var proxies = [
            'https://myfinder.kozak-bohdan.workers.dev/?key=lmp_2026_JacRed_K9xP7aQ4mV2E&url=',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?url='
        ];

        function fetchWithProxy(url, callback) {
            try {
                var network = new Lampa.Reguest();
                network.timeout(10000);
                network.silent(url, function (json) {
                    var text = typeof json === 'string' ? json : JSON.stringify(json);
                    workingProxy = 'direct';
                    callback(null, text);
                }, function () {
                    tryProxies(url, callback);
                });
            } catch (e) {
                tryProxies(url, callback);
            }
        }

        function tryProxies(url, callback) {
            var proxyList = (workingProxy && workingProxy !== 'direct') ? [workingProxy] : proxies;

            function tryProxy(index) {
                if (index >= proxyList.length) {
                    callback(new Error('No proxy worked'));
                    return;
                }
                var p = proxyList[index];
                var target = p.indexOf('url=') > -1 ? p + encodeURIComponent(url) : p + url;
                var xhr = new XMLHttpRequest();
                xhr.open('GET', target, true);
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        workingProxy = p;
                        callback(null, xhr.responseText);
                    } else {
                        tryProxy(index + 1);
                    }
                };
                xhr.onerror = function () {
                    tryProxy(index + 1);
                };
                xhr.timeout = 10000;
                xhr.ontimeout = function () {
                    tryProxy(index + 1);
                };
                xhr.send();
            }
            tryProxy(0);
        }

        var _jacredCache = {};

        function getBestJacred(card, callback) {
            var cacheKey = 'jacred_v3_' + card.id;

            // Проверка в памяти
            if (_jacredCache[cacheKey]) {
                callback(_jacredCache[cacheKey]);
                return;
            }

            // Проверка в Storage
            try {
                var raw = Lampa.Storage.get(cacheKey, '');
                if (raw && typeof raw === 'object' && raw._ts && (Date.now() - raw._ts < 48 * 60 * 60 * 1000)) {
                    _jacredCache[cacheKey] = raw;
                    callback(raw);
                    return;
                }
            } catch (e) {}

            var title = (card.original_title || card.title || card.name || '').toLowerCase();
            var year = (card.release_date || card.first_air_date || '').substr(0, 4);
            if (!title || !year) {
                callback(null);
                return;
            }

            var releaseDate = new Date(card.release_date || card.first_air_date);
            if (releaseDate && releaseDate.getTime() > Date.now()) {
                callback(null);
                return;
            }

            var apiUrl = 'https://jr.maxvol.pro/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;
            fetchWithProxy(apiUrl, function (err, data) {
                if (err || !data) {
                    callback(null);
                    return;
                }

                try {
                    var parsed;
                    try {
                        parsed = JSON.parse(data);
                    } catch (e) {
                        callback(null);
                        return;
                    }

                    // Некоторые прокси оборачивают ответ в поле contents
                    if (parsed.contents) {
                        try {
                            parsed = JSON.parse(parsed.contents);
                        } catch (e) {}
                    }

                    var results = Array.isArray(parsed) ? parsed : (parsed.Results || []);
                    if (!results.length) {
                        var emptyData = { empty: true, _ts: Date.now() };
                        _jacredCache[cacheKey] = emptyData;
                        try {
                            Lampa.Storage.set(cacheKey, emptyData);
                        } catch (e) {}
                        callback(null);
                        return;
                    }

                    var best = {
                        resolution: 'SD',
                        ukr: false,
                        rus: false,
                        eng: false,
                        hdr: false
                    };
                    var resOrder = ['SD', 'HD', 'FHD', '2K', '4K'];

                    results.forEach(function (item) {
                        var t = (item.title || '').toLowerCase();

                        // Определение разрешения
                        var currentRes = 'SD';
                        if (t.indexOf('4k') >= 0 || t.indexOf('2160') >= 0 || t.indexOf('uhd') >= 0) currentRes = '4K';
                        else if (t.indexOf('2k') >= 0 || t.indexOf('1440') >= 0) currentRes = '2K';
                        else if (t.indexOf('1080') >= 0 || t.indexOf('fhd') >= 0 || t.indexOf('full hd') >= 0) currentRes = 'FHD';
                        else if (t.indexOf('720') >= 0 || t.indexOf('hd') >= 0) currentRes = 'HD';

                        if (resOrder.indexOf(currentRes) > resOrder.indexOf(best.resolution)) {
                            best.resolution = currentRes;
                        }

                        // Языки
                        if (t.indexOf('ukr') >= 0 || t.indexOf('укр') >= 0 || t.indexOf('ua') >= 0 || t.indexOf('ukrainian') >= 0) best.ukr = true;
                        if (t.indexOf('rus') >= 0 || t.indexOf('russian') >= 0 || t.indexOf('ru') >= 0) best.rus = true;
                        if (t.indexOf('eng') >= 0 || t.indexOf('english') >= 0 || t.indexOf('multi') >= 0) best.eng = true;

                        // HDR / Dolby Vision
                        if (t.indexOf('dolby vision') >= 0 || t.indexOf('dolbyvision') >= 0) {
                            best.hdr = true;
                            best.dolbyVision = true;
                        } else if (t.indexOf('hdr') >= 0) {
                            best.hdr = true;
                        }
                    });

                    // Дополнительные признаки из языка оригинала (если нет данных от торрентов)
                    if (card.original_language === 'uk') best.ukr = true;
                    if (card.original_language === 'ru') best.rus = true;
                    if (card.original_language === 'en') best.eng = true;

                    best._ts = Date.now();
                    _jacredCache[cacheKey] = best;
                    try {
                        Lampa.Storage.set(cacheKey, best);
                    } catch (e) {}
                    callback(best);
                } catch (e) {
                    callback(null);
                }
            });
        }

        // Создание метки (для языков используем флаги)
        function createBadge(cssClass, content) {
            var badge = document.createElement('div');
            badge.classList.add('card__mark');
            badge.classList.add('card__mark--' + cssClass);
            // content может быть текстом или HTML (например, флаг-эмодзи)
            badge.textContent = content;
            return badge;
        }

        // Для страницы описания фильма
        function injectFullCardMarks(movie, renderEl) {
            if (!movie || !movie.id || !renderEl) return;
            var $render = $(renderEl);
            var rateLine = $render.find('.full-start-new__rate-line').first();
            if (!rateLine.length) return;
            if (rateLine.find('.jacred-info-marks-v2').length) return;

            var marksContainer = $('<div class="jacred-info-marks-v2"></div>');
            rateLine.prepend(marksContainer);

            getBestJacred(movie, function (data) {
                if (data && !data.empty) {
                    renderInfoRowBadges(marksContainer, data);
                }
            });
        }

        function initFullCardMarks() {
            if (!Lampa.Listener || !Lampa.Listener.follow) return;
            Lampa.Listener.follow('full', function (e) {
                if (e.type !== 'complite') return;
                var movie = e.data && e.data.movie;
                var renderEl = e.object && e.object.activity && e.object.activity.render && e.object.activity.render();
                injectFullCardMarks(movie, renderEl);
            });

            // Запасной вариант на случай, если событие уже прошло
            setTimeout(function () {
                try {
                    var act = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
                    if (!act || act.component !== 'full') return;
                    var movie = act.card || act.movie;
                    var renderEl = act.activity && act.activity.render && act.activity.render();
                    injectFullCardMarks(movie, renderEl);
                } catch (err) {}
            }, 300);
        }

        // Обработка карточек на главной и в списках
        function processCards() {
            $('.card:not(.jacred-mark-processed-v2)').each(function () {
                var card = $(this);
                card.addClass('jacred-mark-processed-v2');
                var movie = card[0].heroMovieData || card.data('item') || (card[0] && (card[0].card_data || card[0].item)) || null;
                if (movie && movie.id && !movie.size) {
                    addMarksToContainer(card, movie, '.card__view');
                }
            });
        }

        function observeCardRows() {
            var observer = new MutationObserver(function () {
                processCards();
            });
            observer.observe(document.body, { childList: true, subtree: true });
            processCards();
        }

        // Метки в описании фильма (флаги для языков, текст для качества/HDR)
        function renderInfoRowBadges(container, data) {
            container.empty();

            if (data.rus && Lampa.Storage.get('badge_ru', true)) {
                var ruTag = $('<div class="full-start__pg"></div>');
                ruTag.text('🇷🇺');
                container.append(ruTag);
            }
            if (data.ukr && Lampa.Storage.get('badge_ua', true)) {
                var uaTag = $('<div class="full-start__pg"></div>');
                uaTag.text('🇺🇦');
                container.append(uaTag);
            }
            if (data.eng && Lampa.Storage.get('badge_en', true)) {
                var enTag = $('<div class="full-start__pg"></div>');
                enTag.text('🇬🇧');
                container.append(enTag);
            }
            if (data.resolution && data.resolution !== 'SD') {
                var resText = data.resolution;
                if (resText === 'FHD') resText = '1080p';
                else if (resText === 'HD') resText = '720p';
                var qualityTag = $('<div class="full-start__pg"></div>');
                qualityTag.text(resText);
                container.append(qualityTag);
            }
            if (data.hdr) {
                var hdrTag = $('<div class="full-start__pg"></div>');
                hdrTag.text(data.dolbyVision ? 'Dolby Vision' : 'HDR');
                container.append(hdrTag);
            }
        }

        // Кэш для uafix
        var _uafixCache = {};

        function checkUafixDirect(movie, callback) {
            var query = movie.original_title || movie.original_name || movie.title || movie.name || '';
            if (!query) return callback(false);

            var searchUrl = 'https://uafix.net/index.php?do=search&subaction=search&story=' + encodeURIComponent(query);
            fetchWithProxy(searchUrl, function (err, html) {
                if (err || !html) return callback(false);
                var hasResults = html.indexOf('знайдено') >= 0 && html.indexOf('0 відповідей') < 0;
                callback(hasResults);
            });
        }

        function checkUafix(movie, callback) {
            if (!movie || !movie.id) return callback(false);
            var key = 'uafix_v2_' + movie.id;

            if (_uafixCache[key] !== undefined) return callback(_uafixCache[key]);

            var storageVal = Lampa.Storage.get(key, '');
            if (storageVal !== '') {
                var isFound = (storageVal === 'true' || storageVal === true);
                _uafixCache[key] = isFound;
                return callback(isFound);
            }

            checkUafixDirect(movie, function (found) {
                _uafixCache[key] = found;
                try {
                    Lampa.Storage.set(key, found ? 'true' : 'false');
                } catch (e) {}
                callback(found);
            });
        }

        // Добавление меток на постер
        function addMarksToContainer(element, movie, viewSelector) {
            var containerParent = viewSelector ? element.find(viewSelector) : element;
            if (!containerParent.length) containerParent = element;

            var marksContainer = containerParent.find('.card-marks');
            if (!marksContainer.length) {
                marksContainer = $('<div class="card-marks"></div>');
                containerParent.append(marksContainer);
            }

            // Если данные уже встроены в карточку (например, от другого плагина)
            if (movie.has_ua !== undefined || movie.quality !== undefined) {
                var staticData = {
                    ukr: movie.has_ua === true,
                    rus: false, // в статических данных нет русского, но можно добавить, если будет поле
                    resolution: movie.quality || 'SD',
                    hdr: movie.is_hdr === true,
                    eng: false
                };
                renderBadges(marksContainer, staticData, movie);
                return;
            }

            getBestJacred(movie, function (data) {
                if (!data) data = { empty: true };
                // Дополнительная проверка на uafix для украинского
                checkUafix(movie, function (hasUafix) {
                    if (hasUafix && data) {
                        data.ukr = true;
                        data.empty = false;
                    }
                    if (data && !data.empty) renderBadges(marksContainer, data, movie);
                });
            });
        }

        // Отрисовка меток на постере
        function renderBadges(container, data, movie) {
            container.empty();

            // Языки (флаги)
            if (data.rus && Lampa.Storage.get('badge_ru', true)) {
                container.append(createBadge('ru', '🇷🇺'));
            }
            if (data.ukr && Lampa.Storage.get('badge_ua', true)) {
                container.append(createBadge('ua', '🇺🇦'));
            }
            if (data.eng && Lampa.Storage.get('badge_en', true)) {
                container.append(createBadge('en', '🇬🇧'));
            }

            // Качество (текст)
            if (data.resolution && data.resolution !== 'SD') {
                if (data.resolution === '4K' && Lampa.Storage.get('badge_4k', true)) {
                    container.append(createBadge('4k', '4K'));
                } else if (data.resolution === 'FHD' && Lampa.Storage.get('badge_fhd', true)) {
                    container.append(createBadge('fhd', 'FHD'));
                } else if (data.resolution === 'HD' && Lampa.Storage.get('badge_fhd', true)) {
                    container.append(createBadge('hd', 'HD'));
                } else if (Lampa.Storage.get('badge_fhd', true)) {
                    // Для 2K и других нестандартных разрешений (если разрешено показывать FHD-метки)
                    container.append(createBadge('hd', data.resolution));
                }
            }

            // HDR (текст)
            if (data.hdr && Lampa.Storage.get('badge_hdr', true)) {
                container.append(createBadge('hdr', 'HDR'));
            }

            // Рейтинг
            if (movie) {
                var rating = parseFloat(movie.imdb_rating || movie.kp_rating || movie.vote_average || 0);
                if (rating > 0) {
                    var rBadge = document.createElement('div');
                    rBadge.classList.add('card__mark', 'card__mark--rating');
                    rBadge.innerHTML = '<span class="mark-star">★</span>' + rating.toFixed(1);
                    container.append(rBadge);
                }
            }
        }

        // Стили (с небольшими изменениями для флагов)
        var style = document.createElement('style');
        style.innerHTML = `
            .card .card__type {
                left: -0.2em !important;
            }
            .card-marks {
                position: absolute;
                top: 2.7em;
                left: -0.2em;
                display: flex;
                flex-direction: column;
                gap: 0.15em;
                z-index: 10;
                pointer-events: none;
            }
            .card:not(.card--tv):not(.card--movie) .card-marks,
            .card--movie .card-marks {
                top: 1.4em;
            }
            .card__mark {
                padding: 0.35em 0.45em;
                font-size: 0.8em;
                font-weight: 800;
                line-height: 1;
                letter-spacing: 0.03em;
                border-radius: 0.3em;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                align-self: flex-start;
                border: 1px solid rgba(255,255,255,0.15);
            }
            .card__mark--ru {
                background: linear-gradient(135deg, #b71c1c, #f44336);
                color: #fff;
                border-color: rgba(244,67,54,0.4);
            }
            .card__mark--ua {
                background: linear-gradient(135deg, #1565c0, #42a5f5);
                color: #fff;
                border-color: rgba(66,165,245,0.4);
            }
            .card__mark--en {
                background: linear-gradient(135deg, #37474f, #78909c);
                color: #fff;
                border-color: rgba(120,144,156,0.4);
            }
            .card__mark--4k {
                background: linear-gradient(135deg, #e65100, #ff9800);
                color: #fff;
                border-color: rgba(255,152,0,0.4);
            }
            .card__mark--fhd {
                background: linear-gradient(135deg, #4a148c, #ab47bc);
                color: #fff;
                border-color: rgba(171,71,188,0.4);
            }
            .card__mark--hd {
                background: linear-gradient(135deg, #1b5e20, #66bb6a);
                color: #fff;
                border-color: rgba(102,187,106,0.4);
            }
            .card__mark--hdr {
                background: linear-gradient(135deg, #f57f17, #ffeb3b);
                color: #000;
                border-color: rgba(255,235,59,0.4);
            }
            .card__mark--rating {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: #ffd700;
                border-color: rgba(255,215,0,0.3);
                font-size: 0.75em;
                white-space: nowrap;
            }
            .card__mark--rating .mark-star {
                margin-right: 0.15em;
                font-size: 0.9em;
            }
            .card.jacred-mark-processed-v2 .card__vote {
                display: none !important;
            }
            .jacred-info-marks-v2 {
                display: flex;
                flex-direction: row;
                gap: 0.5em;
                margin-right: 1em;
                align-items: center;
            }
            /* Стили для меток с флагами (немного увеличим размер шрифта для эмодзи) */
            .card__mark--ru,
            .card__mark--ua,
            .card__mark--en {
                font-size: 1em;
                padding: 0.25em 0.35em;
            }
        `;
        document.head.appendChild(style);

        initFullCardMarks();
        observeCardRows();
    }

    function init() {
        setupMarksSettings();
        initMarksJacRed();
    }

    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();