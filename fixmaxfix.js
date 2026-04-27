/**
 * Marks Only — плагин для Lampa.
 * Вывод меток (качество, озвучка (RU, UA, EN), рейтинг) на постеры и страницу описания.
 *
 * Версия 2.0:
 *  - Выбор размера бейджа (мелкий / средний / крупный)
 *  - Стиль "пилюля" в духе Apple TV (стекло + блюр + плавные градиенты)
 *  - Выбор стороны размещения: слева сверху / справа сверху / слева снизу / справа снизу
 *  - Регулировка скругления (от прямоугольника до пилюли)
 *  - Безопасное обновление стилей "на лету" без перезагрузки
 */

(function () {
    'use strict';

    if (typeof Lampa === 'undefined') {
        console.error('Lampa not found (script loaded before app?)');
        return;
    }

    // =================================================================
    // Хелперы для настроек размера / положения / скругления / стиля
    // =================================================================
    var BADGE_SIZE_MAP = {
        small:  { fs: 0.65, pad: '0.25em 0.4em',  gap: 0.12 },
        medium: { fs: 0.80, pad: '0.35em 0.55em', gap: 0.18 },
        large:  { fs: 0.95, pad: '0.45em 0.7em',  gap: 0.22 }
    };

    var BADGE_RADIUS_MAP = {
        sharp:   '0.15em',
        soft:    '0.4em',
        rounded: '0.7em',
        pill:    '999em'
    };

    // Возвращает безопасное значение настройки (никогда не undefined)
    function getOpt(key, def) {
        try {
            var v = Lampa.Storage.get(key, def);
            if (v === undefined || v === null || v === '') return def;
            return v;
        } catch (e) {
            return def;
        }
    }

    function getSizePreset() {
        var s = getOpt('badge_size', 'medium');
        return BADGE_SIZE_MAP[s] || BADGE_SIZE_MAP.medium;
    }

    function getRadius() {
        var r = getOpt('badge_radius', 'rounded');
        return BADGE_RADIUS_MAP[r] || BADGE_RADIUS_MAP.rounded;
    }

    function getPosition() {
        var p = getOpt('badge_position', 'top-left');
        // допустимые значения
        var allowed = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        if (allowed.indexOf(p) === -1) return 'top-left';
        return p;
    }

    function getAppleStyleEnabled() {
        // По умолчанию включено — это и есть основное визуальное обновление
        var v = getOpt('badge_apple_style', true);
        return v === true || v === 'true';
    }

    // =================================================================
    // НАСТРОЙКИ ДЛЯ МЕТОК (на русском языке)
    // =================================================================
    function setupMarksSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

        Lampa.SettingsApi.addComponent({
            component: 'marks_flags',
            name: 'Метки на постерах',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21h6m-3-18v1m-6.36 1.64l.7.71m12.02-.71l-.7.71M4 12H3m18 0h-1M8 12a4 4 0 108 0 4 4 0 00-8 0zm-1 5h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        });

        // -------- Внешний вид --------
        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { type: 'title' },
            field: { name: 'Внешний вид меток' }
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: {
                name: 'badge_apple_style',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Стиль "пилюля" (Apple TV)',
                description: 'Полупрозрачный фон с эффектом стекла и плавными градиентами'
            },
            onChange: function () { applyDynamicStyles(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: {
                name: 'badge_size',
                type: 'select',
                values: { small: 'Мелкий', medium: 'Средний', large: 'Крупный' },
                default: 'medium'
            },
            field: { name: 'Размер бейджа' },
            onChange: function () { applyDynamicStyles(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: {
                name: 'badge_radius',
                type: 'select',
                values: {
                    sharp:   'Прямоугольный',
                    soft:    'Слегка скруглённый',
                    rounded: 'Скруглённый',
                    pill:    'Пилюля'
                },
                default: 'rounded'
            },
            field: { name: 'Скругление углов' },
            onChange: function () { applyDynamicStyles(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: {
                name: 'badge_position',
                type: 'select',
                values: {
                    'top-left':     'Слева сверху',
                    'top-right':    'Справа сверху',
                    'bottom-left':  'Слева снизу',
                    'bottom-right': 'Справа снизу'
                },
                default: 'top-left'
            },
            field: { name: 'Положение на постере' },
            onChange: function () { applyDynamicStyles(); }
        });

        // -------- Какие метки показывать --------
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
    // QUALITY MARKS (JacRed + UaFix)
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

            if (_jacredCache[cacheKey]) {
                callback(_jacredCache[cacheKey]);
                return;
            }

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

                    if (parsed.contents) {
                        try {
                            parsed = JSON.parse(parsed.contents);
                        } catch (e) {}
                    }

                    var results = Array.isArray(parsed) ? parsed : (parsed.Results || []);
                    if (!results.length) {
                        var emptyData = { empty: true, _ts: Date.now() };
                        _jacredCache[cacheKey] = emptyData;
                        try { Lampa.Storage.set(cacheKey, emptyData); } catch (e) {}
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

                        var currentRes = 'SD';
                        if (t.indexOf('4k') >= 0 || t.indexOf('2160') >= 0 || t.indexOf('uhd') >= 0) currentRes = '4K';
                        else if (t.indexOf('2k') >= 0 || t.indexOf('1440') >= 0) currentRes = '2K';
                        else if (t.indexOf('1080') >= 0 || t.indexOf('fhd') >= 0 || t.indexOf('full hd') >= 0) currentRes = 'FHD';
                        else if (t.indexOf('720') >= 0 || t.indexOf('hd') >= 0) currentRes = 'HD';

                        if (resOrder.indexOf(currentRes) > resOrder.indexOf(best.resolution)) {
                            best.resolution = currentRes;
                        }

                        if (t.indexOf('ukr') >= 0 || t.indexOf('укр') >= 0 || t.indexOf('ua') >= 0 || t.indexOf('ukrainian') >= 0) best.ukr = true;
                        if (t.indexOf('rus') >= 0 || t.indexOf('russian') >= 0 || t.indexOf('ru') >= 0) best.rus = true;
                        if (t.indexOf('eng') >= 0 || t.indexOf('english') >= 0 || t.indexOf('multi') >= 0) best.eng = true;

                        if (t.indexOf('dolby vision') >= 0 || t.indexOf('dolbyvision') >= 0) {
                            best.hdr = true;
                            best.dolbyVision = true;
                        } else if (t.indexOf('hdr') >= 0) {
                            best.hdr = true;
                        }
                    });

                    if (card.original_language === 'uk') best.ukr = true;
                    if (card.original_language === 'ru') best.rus = true;
                    if (card.original_language === 'en') best.eng = true;

                    best._ts = Date.now();
                    _jacredCache[cacheKey] = best;
                    try { Lampa.Storage.set(cacheKey, best); } catch (e) {}
                    callback(best);
                } catch (e) {
                    callback(null);
                }
            });
        }

        // Создание метки
        function createBadge(cssClass, content) {
            var badge = document.createElement('div');
            badge.classList.add('card__mark');
            badge.classList.add('card__mark--' + cssClass);
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

        // Обработка карточек
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

        function renderInfoRowBadges(container, data) {
            container.empty();

            if (data.rus && Lampa.Storage.get('badge_ru', true)) {
                container.append($('<div class="full-start__pg"></div>').text('🇷🇺'));
            }
            if (data.ukr && Lampa.Storage.get('badge_ua', true)) {
                container.append($('<div class="full-start__pg"></div>').text('🇺🇦'));
            }
            if (data.eng && Lampa.Storage.get('badge_en', true)) {
                container.append($('<div class="full-start__pg"></div>').text('🇬🇧'));
            }
            if (data.resolution && data.resolution !== 'SD') {
                var resText = data.resolution;
                if (resText === 'FHD') resText = '1080p';
                else if (resText === 'HD') resText = '720p';
                container.append($('<div class="full-start__pg"></div>').text(resText));
            }
            if (data.hdr) {
                container.append($('<div class="full-start__pg"></div>').text(data.dolbyVision ? 'Dolby Vision' : 'HDR'));
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
                try { Lampa.Storage.set(key, found ? 'true' : 'false'); } catch (e) {}
                callback(found);
            });
        }

        function addMarksToContainer(element, movie, viewSelector) {
            var containerParent = viewSelector ? element.find(viewSelector) : element;
            if (!containerParent.length) containerParent = element;

            var marksContainer = containerParent.find('.card-marks');
            if (!marksContainer.length) {
                marksContainer = $('<div class="card-marks"></div>');
                containerParent.append(marksContainer);
            }

            if (movie.has_ua !== undefined || movie.quality !== undefined) {
                var staticData = {
                    ukr: movie.has_ua === true,
                    rus: false,
                    resolution: movie.quality || 'SD',
                    hdr: movie.is_hdr === true,
                    eng: false
                };
                renderBadges(marksContainer, staticData, movie);
                return;
            }

            getBestJacred(movie, function (data) {
                if (!data) data = { empty: true };
                checkUafix(movie, function (hasUafix) {
                    if (hasUafix && data) {
                        data.ukr = true;
                        data.empty = false;
                    }
                    if (data && !data.empty) renderBadges(marksContainer, data, movie);
                });
            });
        }

        function renderBadges(container, data, movie) {
            container.empty();

            if (data.rus && Lampa.Storage.get('badge_ru', true)) {
                container.append(createBadge('ru', '🇷🇺'));
            }
            if (data.ukr && Lampa.Storage.get('badge_ua', true)) {
                container.append(createBadge('ua', '🇺🇦'));
            }
            if (data.eng && Lampa.Storage.get('badge_en', true)) {
                container.append(createBadge('en', '🇬🇧'));
            }

            if (data.resolution && data.resolution !== 'SD') {
                if (data.resolution === '4K' && Lampa.Storage.get('badge_4k', true)) {
                    container.append(createBadge('4k', '4K'));
                } else if (data.resolution === 'FHD' && Lampa.Storage.get('badge_fhd', true)) {
                    container.append(createBadge('fhd', 'FHD'));
                } else if (data.resolution === 'HD' && Lampa.Storage.get('badge_fhd', true)) {
                    container.append(createBadge('hd', 'HD'));
                } else if (Lampa.Storage.get('badge_fhd', true)) {
                    container.append(createBadge('hd', data.resolution));
                }
            }

            if (data.hdr && Lampa.Storage.get('badge_hdr', true)) {
                container.append(createBadge('hdr', 'HDR'));
            }

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

        // Базовые стили (один раз)
        var baseStyle = document.createElement('style');
        baseStyle.id = 'marks-flags-base-style';
        baseStyle.innerHTML = ''
            + '.card .card__type { left: -0.2em !important; }'
            + '.card-marks {'
            + '  position: absolute;'
            + '  display: flex;'
            + '  z-index: 10;'
            + '  pointer-events: none;'
            + '}'
            + '.card__mark {'
            + '  display: inline-flex;'
            + '  align-items: center;'
            + '  justify-content: center;'
            + '  align-self: flex-start;'
            + '  font-weight: 700;'
            + '  line-height: 1;'
            + '  letter-spacing: 0.02em;'
            + '  white-space: nowrap;'
            + '}'
            + '.card.jacred-mark-processed-v2 .card__vote { display: none !important; }'
            + '.jacred-info-marks-v2 {'
            + '  display: flex;'
            + '  flex-direction: row;'
            + '  gap: 0.5em;'
            + '  margin-right: 1em;'
            + '  align-items: center;'
            + '}'
            + '.card__mark--rating .mark-star { margin-right: 0.2em; font-size: 0.95em; color: #ffd166; }';
        document.head.appendChild(baseStyle);

        // Динамические стили (зависят от настроек)
        function applyDynamicStyles() {
            var size = getSizePreset();
            var radius = getRadius();
            var pos = getPosition();
            var apple = getAppleStyleEnabled();

            // Раскладка контейнера в зависимости от стороны
            var posCss = '';
            if (pos === 'top-left') {
                posCss = 'top: 1.4em; left: -0.2em; right: auto; bottom: auto;'
                       + 'flex-direction: column; align-items: flex-start;';
            } else if (pos === 'top-right') {
                posCss = 'top: 1.4em; right: -0.2em; left: auto; bottom: auto;'
                       + 'flex-direction: column; align-items: flex-end;';
            } else if (pos === 'bottom-left') {
                posCss = 'bottom: 0.6em; left: -0.2em; right: auto; top: auto;'
                       + 'flex-direction: column; align-items: flex-start;';
            } else { // bottom-right
                posCss = 'bottom: 0.6em; right: -0.2em; left: auto; top: auto;'
                       + 'flex-direction: column; align-items: flex-end;';
            }

            // Стиль "Apple TV pill" — стекло + блюр + мягкие цвета
            var appleBase = apple
                ? ''
                  + '  background: rgba(255,255,255,0.14);'
                  + '  -webkit-backdrop-filter: blur(14px) saturate(160%);'
                  + '  backdrop-filter: blur(14px) saturate(160%);'
                  + '  border: 1px solid rgba(255,255,255,0.22);'
                  + '  color: #fff;'
                  + '  text-shadow: 0 1px 2px rgba(0,0,0,0.35);'
                  + '  box-shadow: 0 4px 14px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.22);'
                : ''
                  + '  background: rgba(0,0,0,0.55);'
                  + '  border: 1px solid rgba(255,255,255,0.15);'
                  + '  color: #fff;';

            // Цветовые акценты для конкретных типов меток.
            // В стиле Apple даём лёгкие тонированные градиенты, в обычном — прежние плотные.
            var tints = apple
                ? ''
                  + '.card__mark--ru   { background: linear-gradient(135deg, rgba(244,67,54,0.55),  rgba(183,28,28,0.45)); }'
                  + '.card__mark--ua   { background: linear-gradient(135deg, rgba(66,165,245,0.55), rgba(21,101,192,0.45)); }'
                  + '.card__mark--en   { background: linear-gradient(135deg, rgba(120,144,156,0.55), rgba(55,71,79,0.45)); }'
                  + '.card__mark--4k   { background: linear-gradient(135deg, rgba(255,152,0,0.6),   rgba(230,81,0,0.45)); }'
                  + '.card__mark--fhd  { background: linear-gradient(135deg, rgba(171,71,188,0.55), rgba(74,20,140,0.45)); }'
                  + '.card__mark--hd   { background: linear-gradient(135deg, rgba(102,187,106,0.55), rgba(27,94,32,0.45)); }'
                  + '.card__mark--hdr  { background: linear-gradient(135deg, rgba(255,235,59,0.7),  rgba(245,127,23,0.55)); color: #1a1300; text-shadow: none; }'
                  + '.card__mark--rating { background: linear-gradient(135deg, rgba(26,26,46,0.7), rgba(22,33,62,0.55)); color: #ffd166; }'
                : ''
                  + '.card__mark--ru   { background: linear-gradient(135deg, #b71c1c, #f44336); }'
                  + '.card__mark--ua   { background: linear-gradient(135deg, #1565c0, #42a5f5); }'
                  + '.card__mark--en   { background: linear-gradient(135deg, #37474f, #78909c); }'
                  + '.card__mark--4k   { background: linear-gradient(135deg, #e65100, #ff9800); }'
                  + '.card__mark--fhd  { background: linear-gradient(135deg, #4a148c, #ab47bc); }'
                  + '.card__mark--hd   { background: linear-gradient(135deg, #1b5e20, #66bb6a); }'
                  + '.card__mark--hdr  { background: linear-gradient(135deg, #f57f17, #ffeb3b); color: #000; }'
                  + '.card__mark--rating { background: linear-gradient(135deg, #1a1a2e, #16213e); color: #ffd700; }';

            // Для меток с эмодзи-флагами чуть увеличиваем шрифт, чтобы флаг читался
            var flagSizeBoost = ''
                + '.card__mark--ru, .card__mark--ua, .card__mark--en {'
                + '  font-size: ' + (size.fs + 0.15).toFixed(2) + 'em;'
                + '  padding: ' + size.pad + ';'
                + '}';

            var css = ''
                + '.card-marks {'
                + posCss
                + '  gap: ' + size.gap + 'em;'
                + '}'
                + '.card__mark {'
                + '  font-size: ' + size.fs + 'em;'
                + '  padding: ' + size.pad + ';'
                + '  border-radius: ' + radius + ';'
                + appleBase
                + '}'
                + tints
                + flagSizeBoost
                + '.card__mark--rating { font-size: ' + (size.fs - 0.05).toFixed(2) + 'em; }';

            var dyn = document.getElementById('marks-flags-dynamic-style');
            if (!dyn) {
                dyn = document.createElement('style');
                dyn.id = 'marks-flags-dynamic-style';
                document.head.appendChild(dyn);
            }
            dyn.innerHTML = css;
        }

        // Делаем функцию доступной для onChange настроек
        window.__marksFlagsApplyStyles = applyDynamicStyles;

        applyDynamicStyles();
        initFullCardMarks();
        observeCardRows();
    }

    // Глобальный безопасный обёрточный вызов для onChange
    function applyDynamicStyles() {
        try {
            if (typeof window.__marksFlagsApplyStyles === 'function') {
                window.__marksFlagsApplyStyles();
            }
        } catch (e) {
            console.error('marks_flags style update failed:', e);
        }
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
