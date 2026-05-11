(function () {
    'use strict';

    var PLUGIN_NAME    = 'PosterEnhancer';
    var PLUGIN_VERSION = '1.1.0';
    var STORAGE_KEY    = 'poster_enhancer';

    /* ─── Настройки по умолчанию ──────────────────────────────────────────── */
    var DEFAULT_SETTINGS = {
        scale        : '1.35',   // масштаб постера в фокусе
        frame_color  : '#e8b923', // цвет рамки
        frame_width  : '3',      // толщина рамки (px)
        frame_radius : '8',      // скругление рамки (px)
        quality      : 'w780',   // качество TMDB
        logo_center  : 'true'    // центрировать логотип
    };

    var settings = {};

    function loadSettings() {
        try {
            if (typeof Lampa !== 'undefined' && Lampa.Storage) {
                var stored = Lampa.Storage.get(STORAGE_KEY, '{}');
                var parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
                settings = Object.assign({}, DEFAULT_SETTINGS, parsed || {});
            } else {
                try {
                    var raw = localStorage.getItem(STORAGE_KEY);
                    settings = Object.assign({}, DEFAULT_SETTINGS, raw ? JSON.parse(raw) : {});
                } catch (e) {
                    settings = Object.assign({}, DEFAULT_SETTINGS);
                }
            }
        } catch (e) {
            settings = Object.assign({}, DEFAULT_SETTINGS);
        }
    }

    function saveSetting(key, value) {
        try {
            settings[key] = value;
            var data = JSON.stringify(settings);
            if (typeof Lampa !== 'undefined' && Lampa.Storage) {
                Lampa.Storage.set(STORAGE_KEY, data);
            } else {
                localStorage.setItem(STORAGE_KEY, data);
            }
            applyDynamicCSS();
        } catch (e) {}
    }

    /* ─── Динамический CSS (зависит от настроек) ──────────────────────────── */
    function buildDynamicCSS() {
        var scale  = parseFloat(settings.scale)       || 1.35;
        var color  = settings.frame_color             || '#e8b923';
        var width  = parseInt(settings.frame_width)   || 3;
        var radius = parseInt(settings.frame_radius)  || 8;
        var logo   = settings.logo_center === 'true';

        var rules = [];

        /* Постер в фокусе — масштаб + рамка */
        rules.push(
            '.card.focus .card__img, .card--focus .card__img {' +
            '  transform: scale(' + scale + ') !important;' +
            '  transition: transform .22s ease, box-shadow .22s ease, outline .22s ease !important;' +
            '  box-shadow: 0 14px 48px rgba(0,0,0,.85) !important;' +
            '  outline: ' + width + 'px solid ' + color + ' !important;' +
            '  outline-offset: 2px !important;' +
            '  border-radius: ' + radius + 'px !important;' +
            '  z-index: 20 !important;' +
            '  position: relative !important;' +
            '}'
        );

        /* Обёртка карточки в фокусе */
        rules.push(
            '.card.focus, .card--focus {' +
            '  z-index: 20 !important;' +
            '  position: relative !important;' +
            '}'
        );

        /* Базовый переход для всех постеров */
        rules.push(
            '.card .card__img {' +
            '  transition: transform .22s ease, box-shadow .22s ease, outline .22s ease !important;' +
            '  border-radius: ' + radius + 'px !important;' +
            '}'
        );

        /* Логотип */
        if (logo) {
            rules.push(
                '.menu__logo { display:flex !important; align-items:center !important; justify-content:center !important; }',
                '.menu__logo img { margin:auto !important; display:block !important; }',
                '.head .head__logo { display:flex !important; align-items:center !important; justify-content:center !important; }',
                '.head .head__logo img { margin:auto !important; }'
            );
        }

        return rules.join('\n');
    }

    function applyDynamicCSS() {
        try {
            var el = document.getElementById('pe-dynamic-css');
            if (!el) {
                el = document.createElement('style');
                el.id = 'pe-dynamic-css';
                document.head.appendChild(el);
            }
            el.textContent = buildDynamicCSS();
        } catch (e) {}
    }

    /* ─── Статический CSS (не зависит от настроек) ────────────────────────── */
    var STATIC_CSS = [
        /* Оверлей просмотра постера */
        '#pe-overlay {',
        '  position:fixed; top:0; left:0; width:100%; height:100%;',
        '  z-index:999999; display:flex; align-items:center; justify-content:center;',
        '  background:rgba(0,0,0,.88);',
        '  opacity:0; pointer-events:none;',
        '  transition:opacity .3s ease;',
        '}',
        '#pe-overlay.pe-visible { opacity:1; pointer-events:all; }',
        '#pe-overlay img {',
        '  max-height:92vh; max-width:88vw;',
        '  border-radius:14px;',
        '  box-shadow:0 28px 90px rgba(0,0,0,.95);',
        '  object-fit:contain;',
        '  transform:scale(.82);',
        '  transition:transform .32s cubic-bezier(.34,1.56,.64,1);',
        '}',
        '#pe-overlay.pe-visible img { transform:scale(1); }',
        '#pe-overlay-close {',
        '  position:absolute; top:20px; right:28px;',
        '  font-size:30px; color:#fff; cursor:pointer;',
        '  background:rgba(255,255,255,.15); border:none; border-radius:50%;',
        '  width:50px; height:50px;',
        '  display:flex; align-items:center; justify-content:center;',
        '  transition:background .2s;',
        '}',
        '#pe-overlay-close:hover { background:rgba(255,255,255,.3); }'
    ].join('\n');

    function injectStaticCSS() {
        if (document.getElementById('pe-static-css')) return;
        try {
            var s = document.createElement('style');
            s.id = 'pe-static-css';
            s.textContent = STATIC_CSS;
            document.head.appendChild(s);
        } catch (e) {}
    }

    /* ─── Качество постеров TMDB ──────────────────────────────────────────── */
    function upgradeUrl(url) {
        if (!url || typeof url !== 'string') return url;
        var q = settings.quality || 'w780';
        return url.replace(/\/w(92|154|185|220|342|500|780)\//, '/' + q + '/');
    }

    function upgradeCardImages() {
        try {
            var imgs = document.querySelectorAll('.card__img, .card img');
            for (var i = 0; i < imgs.length; i++) {
                var img = imgs[i];
                if (img.dataset.peEnhanced) continue;
                img.dataset.peEnhanced = '1';
                var src = img.getAttribute('src') || '';
                var dataSrc = img.getAttribute('data-src') || '';
                if (src) {
                    var up = upgradeUrl(src);
                    if (up !== src) img.src = up;
                }
                if (dataSrc) {
                    var upd = upgradeUrl(dataSrc);
                    if (upd !== dataSrc) img.setAttribute('data-src', upd);
                }
            }
        } catch (e) {}
    }

    /* ─── DOM-наблюдатель ─────────────────────────────────────────────────── */
    function watchDOM() {
        try {
            var observer = new MutationObserver(function () {
                upgradeCardImages();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        } catch (e) {}
    }

    /* ─── Оверлей ──────────────────────────────────────────────────────────── */
    function buildOverlay() {
        if (document.getElementById('pe-overlay')) return;
        try {
            var overlay = document.createElement('div');
            overlay.id = 'pe-overlay';

            var img = document.createElement('img');
            img.id = 'pe-overlay-img';
            img.alt = '';

            var btn = document.createElement('button');
            btn.id = 'pe-overlay-close';
            btn.innerHTML = '&#x2715;';

            overlay.appendChild(img);
            overlay.appendChild(btn);
            document.body.appendChild(overlay);

            function hide() {
                overlay.classList.remove('pe-visible');
                setTimeout(function () { try { img.src = ''; } catch (e) {} }, 350);
            }

            btn.addEventListener('click', hide);
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) hide();
            });
            document.addEventListener('keydown', function (e) {
                if ((e.key === 'Escape' || e.key === 'Backspace') &&
                    overlay.classList.contains('pe-visible')) {
                    hide();
                    e.preventDefault();
                }
            });
        } catch (e) {}
    }

    function showOverlay(url) {
        try {
            var overlay = document.getElementById('pe-overlay');
            var img = document.getElementById('pe-overlay-img');
            if (!overlay || !img || !url) return;
            img.src = upgradeUrl(url);
            overlay.classList.add('pe-visible');
            var btn = document.getElementById('pe-overlay-close');
            if (btn) btn.focus();
        } catch (e) {}
    }

    /* ─── Карточки: клик и Enter ──────────────────────────────────────────── */
    function getPosterUrl(card) {
        try {
            var img = card.querySelector('.card__img') || card.querySelector('img');
            if (!img) return '';
            return img.getAttribute('src') || img.getAttribute('data-src') || '';
        } catch (e) { return ''; }
    }

    function getCard(el) {
        try {
            if (!el) return null;
            if (el.classList && el.classList.contains('card')) return el;
            return el.closest ? el.closest('.card') : null;
        } catch (e) { return null; }
    }

    var lastFocusedCard = null;

    function attachListeners() {
        try {
            document.addEventListener('click', function (e) {
                try {
                    var card = getCard(e.target);
                    if (!card) return;
                    if (lastFocusedCard === card) {
                        var url = getPosterUrl(card);
                        if (url) { showOverlay(url); e.stopPropagation(); }
                    } else {
                        lastFocusedCard = card;
                    }
                } catch (ex) {}
            }, true);

            document.addEventListener('keydown', function (e) {
                try {
                    if (e.key !== 'Enter') return;
                    var focused = document.querySelector('.card.focus') ||
                                  document.querySelector('.card--focus');
                    if (!focused) return;
                    var url = getPosterUrl(focused);
                    if (url) showOverlay(url);
                } catch (ex) {}
            });
        } catch (e) {}
    }

    /* ─── Настройки Lampa ─────────────────────────────────────────────────── */
    function registerSettings() {
        try {
            if (typeof Lampa === 'undefined') return;
            if (!Lampa.SettingsApi || !Lampa.SettingsApi.addParam) return;

            var comp = 'poster_enhancer';

            /* Регистрируем раздел настроек */
            Lampa.SettingsApi.addComponent({
                component : comp,
                name      : 'Poster Enhancer',
                icon      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>'
            });

            /* Масштаб постера */
            Lampa.SettingsApi.addParam({
                component : comp,
                param     : {
                    name    : 'scale',
                    type    : 'select',
                    values  : { '1.15':'Средний (×1.15)', '1.25':'Большой (×1.25)', '1.35':'Огромный (×1.35)', '1.5':'Максимальный (×1.5)' },
                    default : DEFAULT_SETTINGS.scale
                },
                field     : { name: 'Масштаб при фокусе' },
                onChange  : function (val) { saveSetting('scale', val); }
            });

            /* Цвет рамки */
            Lampa.SettingsApi.addParam({
                component : comp,
                param     : {
                    name    : 'frame_color',
                    type    : 'select',
                    values  : {
                        '#e8b923':'Золотой',
                        '#ffffff':'Белый',
                        '#00d4ff':'Голубой',
                        '#ff4b4b':'Красный',
                        '#4bff8a':'Зелёный',
                        '#c084fc':'Фиолетовый'
                    },
                    default : DEFAULT_SETTINGS.frame_color
                },
                field     : { name: 'Цвет рамки фокуса' },
                onChange  : function (val) { saveSetting('frame_color', val); }
            });

            /* Толщина рамки */
            Lampa.SettingsApi.addParam({
                component : comp,
                param     : {
                    name    : 'frame_width',
                    type    : 'select',
                    values  : { '2':'Тонкая (2px)', '3':'Средняя (3px)', '4':'Толстая (4px)', '6':'Очень толстая (6px)' },
                    default : DEFAULT_SETTINGS.frame_width
                },
                field     : { name: 'Толщина рамки' },
                onChange  : function (val) { saveSetting('frame_width', val); }
            });

            /* Скругление рамки */
            Lampa.SettingsApi.addParam({
                component : comp,
                param     : {
                    name    : 'frame_radius',
                    type    : 'select',
                    values  : { '0':'Нет (0px)', '4':'Маленькое (4px)', '8':'Среднее (8px)', '14':'Большое (14px)' },
                    default : DEFAULT_SETTINGS.frame_radius
                },
                field     : { name: 'Скругление рамки' },
                onChange  : function (val) { saveSetting('frame_radius', val); }
            });

            /* Качество постеров */
            Lampa.SettingsApi.addParam({
                component : comp,
                param     : {
                    name    : 'quality',
                    type    : 'select',
                    values  : { 'w500':'Стандартное (w500)', 'w780':'Высокое (w780)', 'w1280':'Очень высокое (w1280)', 'original':'Оригинал' },
                    default : DEFAULT_SETTINGS.quality
                },
                field     : { name: 'Качество постеров (TMDB)' },
                onChange  : function (val) {
                    saveSetting('quality', val);
                    /* Сброс кеша изображений */
                    try {
                        document.querySelectorAll('.card__img[data-pe-enhanced]').forEach(function (img) {
                            delete img.dataset.peEnhanced;
                        });
                        upgradeCardImages();
                    } catch (e) {}
                }
            });

            /* Центрирование логотипа */
            Lampa.SettingsApi.addParam({
                component : comp,
                param     : {
                    name    : 'logo_center',
                    type    : 'select',
                    values  : { 'true':'Включено', 'false':'Выключено' },
                    default : DEFAULT_SETTINGS.logo_center
                },
                field     : { name: 'Логотип по центру' },
                onChange  : function (val) { saveSetting('logo_center', val); }
            });

        } catch (e) {}
    }

    /* ─── Интеграция с Lampa API ──────────────────────────────────────────── */
    function integrateWithLampa() {
        try {
            if (typeof Lampa === 'undefined') return;

            if (Lampa.Listener) {
                Lampa.Listener.follow('full', function (event) {
                    try {
                        if (event && (event.type === 'complite' || event.type === 'ready')) {
                            upgradeCardImages();
                        }
                    } catch (e) {}
                });
            }

        } catch (e) {}
    }

    /* ─── Инициализация ───────────────────────────────────────────────────── */
    function init() {
        try {
            loadSettings();
            injectStaticCSS();
            applyDynamicCSS();
            buildOverlay();
            upgradeCardImages();
            watchDOM();
            attachListeners();
            integrateWithLampa();
            registerSettings();
        } catch (e) {}
    }

    /* Запуск */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* Повторная попытка после загрузки SPA */
    setTimeout(function () {
        try {
            loadSettings();
            applyDynamicCSS();
            upgradeCardImages();
            integrateWithLampa();
            registerSettings();
        } catch (e) {}
    }, 2500);

    /* ─── Регистрация плагина в Lampa ─────────────────────────────────────── */
    try {
        if (typeof Lampa !== 'undefined' && Lampa.Plugin) {
            Lampa.Plugin.add(PLUGIN_NAME, {
                version : PLUGIN_VERSION,
                start   : init
            });
        }
    } catch (e) {}

})();
