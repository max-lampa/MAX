(function () {
    'use strict';

    // Защита от повторной загрузки
    if (window.mod_loaded) return;
    window.mod_loaded = true;

    // ==========================================
    // АВТОР: MaksTV
    // Плагин Mod для Lampa Player
    // ==========================================

    var MOD = 'mod_';

    function isEnabled(mod) {
        return Lampa.Storage.get(MOD + 'enable_' + mod, true);
    }

    // ==========================================
    // ИКОНКИ
    // ==========================================

    var yIcon = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-weight="900" font-size="20" fill="currentColor">Y</text></svg>';

    var mdblistSvg = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='%23ffffff' style='opacity:1;'%3E%3Cpath d='M1.928.029A2.47 2.47 0 0 0 .093 1.673c-.085.248-.09.629-.09 10.33s.005 10.08.09 10.33a2.51 2.51 0 0 0 1.512 1.558l.276.108h20.237l.277-.108a2.51 2.51 0 0 0 1.512-1.559c.085-.25.09-.63.09-10.33s-.005-10.08-.09-10.33A2.51 2.51 0 0 0 22.395.115l-.277-.109L12.117 0C6.615-.004 2.032.011 1.929.029m7.48 8.067l2.123 2.004v1.54c0 .897-.02 1.536-.043 1.527s-.92-.845-1.995-1.86c-1.071-1.01-1.962-1.84-1.977-1.84s-.024 1.91-.024 4.248v4.25H4.911V6.085h1.188l1.183.006zm9.729 3.93v5.94h-2.63l-.01-4.25l-.013-4.25l-1.907 1.795a367 367 0 0 1-1.98 1.864c-.076.056-.08-.047-.08-1.489v-1.555l2.127-1.995l2.122-1.995l1.187-.005h1.184z'/%3E%3C/svg%3E";

    var rateIcons = {
        imdb:       'https://upload.wikimedia.org/wikipedia/commons/5/53/IMDB_-_SuperTinyIcons.svg',
        rt:         'https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg',
        mc:         'https://upload.wikimedia.org/wikipedia/commons/e/e1/Metacritic_logo_Roundel.svg',
        tmdb:       'https://upload.wikimedia.org/wikipedia/commons/8/89/Tmdb.new.logo.svg',
        cub:        'https://raw.githubusercontent.com/yumata/lampa/9381985ad4371d2a7d5eb5ca8e3daf0f32669eb7/img/logo-icon.svg',
        oscar:      'https://upload.wikimedia.org/wikipedia/commons/f/f8/Oscar_gold_silhouette.svg',
        award:      'https://upload.wikimedia.org/wikipedia/commons/e/e8/Barnstar_film_3.svg',
        trakt:      'https://upload.wikimedia.org/wikipedia/commons/3/3d/Trakt.tv-favicon.svg',
        mdblist:    mdblistSvg,
        popcorn:    'https://upload.wikimedia.org/wikipedia/commons/d/da/Rotten_Tomatoes_positive_audience.svg',
        letterboxd: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Letterboxd_2023_logo.png'
    };

    var uatorIcons = {
        ua:     'https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg',
        none:   'https://upload.wikimedia.org/wikipedia/commons/2/28/White_Question_Mark.svg',
        top:    'https://upload.wikimedia.org/wikipedia/commons/3/39/Stream.svg',
        seeds:  'https://upload.wikimedia.org/wikipedia/commons/9/9e/Upload_alt_font_awesome.svg',
        audio:  'https://upload.wikimedia.org/wikipedia/commons/2/21/Speaker_Icon.svg',
        dv:     'https://upload.wikimedia.org/wikipedia/commons/0/03/Dolby_Vision_2021_logo.svg',
        hdr:    'https://upload.wikimedia.org/wikipedia/commons/4/4e/HDR10_logo.svg'
    };

    // ==========================================
    // ПОРЯДОК ОТОБРАЖЕНИЯ РЕЙТИНГОВ
    // ==========================================

    var renderOrder = {
        'oscar': 1, 'award': 2, 'tmdb': 3, 'imdb': 4, 'rt': 5,
        'mc': 6, 'trakt': 7, 'cub': 8, 'popcorn': 9, 'mdblist': 10, 'letterboxd': 11
    };

    var availableRatings = [
        { key: 'tmdb',       name: 'TMDB',                  default: true },
        { key: 'imdb',       name: 'IMDb',                  default: true },
        { key: 'rt',         name: 'Rotten Tomatoes',       default: true },
        { key: 'mc',         name: 'Metacritic',            default: true },
        { key: 'trakt',      name: 'Trakt TV',              default: true },
        { key: 'cub',        name: 'Lampa (CUB)',           default: true },
        { key: 'popcorn',    name: 'RT Зрители (Popcorn)',  default: true },
        { key: 'mdblist',    name: 'MDBList Score',         default: true },
        { key: 'letterboxd', name: 'Letterboxd',            default: true },
        { key: 'awards',     name: 'Награды (Awards)',      default: true }
    ];

    // ==========================================
    // СЛОВАРЬ СТРАН (на русском)
    // ==========================================

    var countryNames = {
        'us': 'США',         'usa': 'США',           'gb': 'Великобритания',  'uk': 'Великобритания',
        'ua': 'Украина',     'ca': 'Канада',          'hk': 'Гонконг',         'fr': 'Франция',
        'de': 'Германия',    'it': 'Италия',          'es': 'Испания',         'jp': 'Япония',
        'kr': 'Южная Корея', 'cn': 'Китай',           'pl': 'Польша',          'au': 'Австралия',
        'ie': 'Ирландия',    'be': 'Бельгия',         'dk': 'Дания',           'no': 'Норвегия',
        'se': 'Швеция',      'fi': 'Финляндия',       'tr': 'Турция',          'in': 'Индия',
        'br': 'Бразилия',    'mx': 'Мексика',         'nl': 'Нидерланды',      'at': 'Австрия',
        'ch': 'Швейцария',   'cz': 'Чехия',           'hu': 'Венгрия',         'nz': 'Новая Зеландия',
        'za': 'ЮАР',         'il': 'Израиль',         'th': 'Таиланд',         'tw': 'Тайвань',
        'ru': 'Страна-агрессор', 'pt': 'Португалия',  'gr': 'Греция',
        'is': 'Исландия',    'ro': 'Румыния',         'bg': 'Болгария',
        'ar': 'Аргентина',   'cl': 'Чили',            'co': 'Колумбия',        'pe': 'Перу',
        'id': 'Индонезия',   'my': 'Малайзия',        'ph': 'Филиппины',       'sg': 'Сингапур',
        'vn': 'Вьетнам',     'ae': 'ОАЭ',             'sa': 'Саудовская Аравия', 'eg': 'Египет'
    };

    // ==========================================
    // КЕШ
    // ==========================================

    var titleCache   = Lampa.Storage.get("title_cache_hybrid_v3") || {};
    var studiosCache = {};
    var uatorCache   = {};

    // ==========================================
    // ГЛОБАЛЬНЫЕ СТИЛИ
    // ==========================================

    var styles = `
        .mod-slogan-hidden .full-start__tagline,
        .mod-slogan-hidden [class*="tagline"],
        .mod-slogan-hidden .full-start__description + div:not([class]) {
            display: none !important; height: 0px !important; min-height: 0px !important; margin: 0px !important;
            padding: 0px !important; font-size: 0px !important; line-height: 0 !important;
            visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;
            position: absolute !important; z-index: -1;
        }
        .mod-slogan-hidden .full-start__title  { margin-bottom: 5px !important; }
        .mod-slogan-hidden .full-start__details { margin-top: 0px !important; margin-bottom: 10px !important; }

        .plugin-hybrid-title { margin-top: 5px; margin-bottom: 5px; width: 100%; position: relative; z-index: 10; text-align: left; }
        .plugin-hybrid-title__body { line-height: 1.2; font-weight: bold; display: flex; align-items: baseline; flex-wrap: wrap; justify-content: flex-start; }

        .omdb-mdb-rate { display: flex; flex-wrap: wrap; align-items: center; width: 100%; min-height: 25px; margin: 0; }
        .omdb-mdb-rate.is-bw-text .custom-rating div { color: #cccccc !important; }
        .full-start__rate.custom-rating { display: inline-flex !important; align-items: center !important; margin: 0 !important; flex-shrink: 0 !important; white-space: nowrap !important; }
        .custom-rating .rating-icon-wrap { width: 1.1em; height: 1.1em; display: flex; align-items: center; justify-content: center; }
        .custom-rating img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .custom-rating div { font-weight: bold; line-height: 1; font-size: 1em !important; }
        .omdb-api-val { margin-left: auto; font-size: 0.9em; opacity: 0.7; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-left: 10px; }

        .mod-ratings-enabled .rate--tmdb, .mod-ratings-enabled .rate--imdb,
        .mod-ratings-enabled .rate--kp,  .mod-ratings-enabled .full-start__rates { display: none !important; }

        .rate--studio.studio-logo { align-items: center; vertical-align: middle; border-radius: 8px; transition: all 0.2s ease; height: auto; cursor: pointer; }
        .rate--studio.studio-logo.focus { background: rgba(255,255,255,0.2) !important; border: 1px solid #fff; transform: scale(1.05); }
        .rate--studio.studio-logo img { max-width: 200px; width: auto; object-fit: contain; transition: filter 0.3s ease; }
        .studio-logo-text { font-size: 0.8em; font-weight: bold; color: #fff !important; white-space: nowrap; }

        .quality-badges-container { display: flex; align-items: center; }
        .qb-unified-block { display: flex; flex-wrap: nowrap; align-items: center; }
        .quality-badge { display: inline-flex; align-items: center; gap: 0.35em; color: #fff; white-space: nowrap; flex-shrink: 0; height: 1.1em; }
        .qb-text { font-weight: bold; line-height: 1.1em; height: 1.1em; display: flex; align-items: center; }
        .qb-prefix-icon { height: 1.1em !important; width: auto; display: block; object-fit: contain; margin: 0; }
        .qb-text-icon { height: 1.1em !important; line-height: 1.1em !important; font-size: 0.85em !important; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; background: #fff; color: #000; padding: 0 0.25em; border-radius: 2px; box-sizing: border-box; vertical-align: top; }
        .qb-not-found { opacity: 0.6; }

        .card .qb-unified-block { position: absolute; top: 0.5rem; left: 0.5rem; z-index: 10; flex-direction: column; align-items: flex-start; gap: 0.2rem !important; font-size: 0.7em !important; }
        .card .quality-badge { background: rgba(0, 0, 0, 0.6); padding: 2px 4px; border-radius: 4px; height: 1em; }
        .card .qb-prefix-icon, .card .qb-text-icon { height: 1em !important; }
        .card .qb-text { height: 1em; line-height: 1em; }

        .mod-gap-negative > *:not(:first-child) { margin-left: var(--mod-gap-negative, 0px) !important; }

        /* Apple Style — блоки рейтингов/студий */
        .mod-apple-container {
            display: inline-flex !important; align-items: center;
            padding: 0.21em 0.32em !important; border-radius: 999px !important;
            background: rgba(22,24,30,.28) !important; border: 1px solid rgba(255,255,255,.10) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12) !important;
            backdrop-filter: blur(18px) saturate(140%) !important; -webkit-backdrop-filter: blur(18px) saturate(140%) !important;
            width: max-content;
        }
        .mod-apple-container.is-lite {
            background: rgba(30, 32, 40, 0.98) !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.6) !important;
            backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
        }
        .mod-apple-item {
            border: 0 !important; background: transparent !important; color: rgba(255,255,255,.92) !important;
            height: 2.16em !important; min-height: 2.16em !important;
            display: inline-flex !important; align-items: center; justify-content: center;
            padding: 0 0.8em !important; border-radius: 999px !important;
            transition: background .2s ease !important; cursor: pointer; outline: none; margin: 0 !important;
        }
        .mod-apple-item.focus, .mod-apple-item.hover {
            background: rgba(255,255,255,.14) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.10) !important;
            transform: none !important;
        }
        .mod-apple-container .custom-rating { font-size: 0.92em !important; }
        .mod-apple-container .rate--studio   { padding: 0 0.8em !important; border-radius: 999px !important; }
        .mod-apple-container .quality-badge  { padding: 0 0.8em !important; }

        /* Apple Style — кнопки карточки фильма */
        body.mod-buttons-apple .full-start__buttons,
        body.mod-buttons-apple .full-start-new__buttons {
            display: inline-flex !important; align-items: center; justify-content: flex-start;
            padding: 0.35em 0.4em !important; border-radius: 999px !important; margin-top: 1em;
            background: rgba(22,24,30,.28) !important; border: 1px solid rgba(255,255,255,.10) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12) !important;
            backdrop-filter: blur(18px) saturate(140%) !important; -webkit-backdrop-filter: blur(18px) saturate(140%) !important;
            width: max-content; flex-wrap: wrap !important; gap: 0.25em !important;
            font-size: var(--mod-btn-size, 1em) !important;
        }
        body.mod-buttons-apple-lite .full-start__buttons,
        body.mod-buttons-apple-lite .full-start-new__buttons {
            background: rgba(30, 32, 40, 0.98) !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.6) !important;
            backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
        }
        body.mod-buttons-apple .full-start__button,
        body.mod-buttons-apple .full-start-new__button {
            border: 0 !important; background: transparent !important; color: rgba(255,255,255,.92) !important;
            height: 2.8em !important; min-height: 2.8em !important;
            display: inline-flex !important; align-items: center; justify-content: center;
            padding: 0 1.2em !important; border-radius: 999px !important;
            transition: background .2s ease !important; margin: 0 !important;
            font-weight: bold; font-size: inherit !important; box-shadow: none !important;
        }
        body.mod-buttons-apple .full-start__button.hidden,
        body.mod-buttons-apple .full-start-new__button.hidden,
        body.mod-buttons-apple .full-start__button.hide,
        body.mod-buttons-apple .full-start-new__button.hide,
        body.mod-buttons-apple .full-start__button[style*="display: none"],
        body.mod-buttons-apple .full-start-new__button[style*="display: none"],
        body.mod-buttons-apple .full-start__button[style*="display:none"],
        body.mod-buttons-apple .full-start-new__button[style*="display:none"] {
            display: none !important;
        }
        body.mod-buttons-apple .ua-sites-container {
            display: inline-flex !important; align-items: center; gap: 0.25em !important;
            margin: 0 !important; padding: 0 !important;
            background: transparent !important; border: none !important; box-shadow: none !important;
        }
        body.mod-buttons-apple .ua-btn-item {
            border: 0 !important; background: transparent !important; color: rgba(255,255,255,.92) !important;
            height: 2.8em !important; min-height: 2.8em !important; width: 2.8em !important;
            display: inline-flex !important; align-items: center; justify-content: center;
            border-radius: 999px !important; transition: background .2s ease !important;
            margin: 0 !important; padding: 0 !important; box-shadow: none !important; font-size: inherit !important;
        }
        body.mod-buttons-apple .full-start__button.focus,
        body.mod-buttons-apple .full-start__button:hover,
        body.mod-buttons-apple .ua-btn-item.focus,
        body.mod-buttons-apple .ua-btn-item:hover,
        body.mod-buttons-apple .ua-btn-item.active.focus {
            background: rgba(255,255,255,.14) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.10) !important;
            transform: none !important; color: #fff !important;
        }
        body.mod-buttons-apple .ua-btn-item.active { transform: none !important; }
        body.mod-buttons-apple .full-start__button svg { width: 1.2em !important; height: 1.2em !important; margin-right: 0.4em !important; }
        body.mod-buttons-apple .full-start__button.button--options svg { margin-right: 0 !important; }
        body.mod-buttons-apple .full-start__button.button--options { padding: 0 0.8em !important; }
        body.mod-buttons-apple .ua-btn-item img,
        body.mod-buttons-apple .ua-btn-item svg { width: 1.5em !important; height: 1.5em !important; border-radius: 0 !important; display: block; filter: none !important; }
        body.mod-buttons-apple .ua-btn-item.loading svg { animation: spin-badge 1.5s linear infinite !important; }

        @media screen and (orientation: portrait), screen and (max-width: 767px) {
            .plugin-hybrid-title { text-align: center !important; }
            .plugin-hybrid-title__body { justify-content: center !important; }
            .omdb-mdb-rate { justify-content: center; }
            .plugin-uk-title-combined { align-items: center !important; text-align: center !important; }
            .studio-logos-container { justify-content: center !important; }
            .quality-badges-container { width: 100%; justify-content: center; display: block !important; margin: 10px 0; clear: both; }
            .qb-unified-block { flex-wrap: wrap; justify-content: center; width: 100%; }
            .mod-apple-container { flex-wrap: wrap !important; width: 100% !important; justify-content: center !important; }
            body.mod-buttons-apple .full-start__buttons,
            body.mod-buttons-apple .full-start-new__buttons { justify-content: center !important; width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
            .card__age { text-align: center !important; width: 100% !important; display: block !important; }
            .full-start__pg { text-align: center !important; display: flex !important; justify-content: center !important; align-items: center !important; margin-left: auto !important; margin-right: auto !important; }
            .full-start-new__details, .full-start__details { justify-content: center !important; display: flex !important; flex-wrap: wrap !important; }
            .full-start-new__details > *, .full-start__details > * { text-align: center !important; margin: 0.45em !important; }
        }

        div[data-component="m_logo"],
        div[data-component="m_title"],
        div[data-component="m_ratings"],
        div[data-component="m_ratings_select"],
        div[data-component="m_studios"],
        div[data-component="m_uator"],
        div[data-component="m_buttons"] { display: none !important; }
    `;
    $('head').append('<style id="mod-global-styles">' + styles + '</style>');

    // ==========================================
    // УПРАВЛЕНИЕ КЛАССАМИ BODY
    // ==========================================

    function updateBodyClasses() {
        // Слоган
        if (isEnabled('slogan')) $('body').addClass('mod-slogan-hidden');
        else $('body').removeClass('mod-slogan-hidden');

        // Рейтинги
        if (isEnabled('ratings')) $('body').addClass('mod-ratings-enabled');
        else $('body').removeClass('mod-ratings-enabled');

        // Стиль кнопок
        var btnStyle = Lampa.Storage.get('m_button_style', 'normal');
        var btnSize  = Lampa.Storage.get('m_button_size', '1em');

        $('body').removeClass('mod-buttons-apple mod-buttons-apple-lite');
        if (btnStyle === 'apple')      $('body').addClass('mod-buttons-apple');
        if (btnStyle === 'apple_lite') $('body').addClass('mod-buttons-apple mod-buttons-apple-lite');

        document.documentElement.style.setProperty('--mod-btn-size', btnSize);
    }
    updateBodyClasses();

    // ==========================================
    // СКРЫТИЕ СЛОГАНА
    // ==========================================

    function modCleanSlogan() {
        var full = document.querySelector('.full-start');
        if (!full) return;
        full.querySelectorAll('div, span, p').forEach(function (node) {
            if (node.innerText && node.innerText.length > 3 && node.innerText.length < 150) {
                var prev = node.previousElementSibling;
                if (prev && prev.classList.contains('full-start__details')) {
                    node.style.display = 'none';
                    node.setAttribute('data-slogan-hidden', 'true');
                }
            }
        });
    }

    var sloganObserver = new MutationObserver(function () {
        if (isEnabled('slogan')) modCleanSlogan();
    });
    sloganObserver.observe(document.body, { childList: true, subtree: true });

    // ==========================================
    // АНАЛИЗ И ИНВЕРСИЯ ТЁМНЫХ ЛОГОТИПОВ
    // ==========================================

    function analyzeAndInvert(img, threshold) {
        try {
            var canvas = document.createElement('canvas');
            var ctx    = canvas.getContext('2d');
            canvas.width  = img.naturalWidth  || img.width;
            canvas.height = img.naturalHeight || img.height;
            if (canvas.width === 0 || canvas.height === 0) return;
            ctx.drawImage(img, 0, 0);
            var imageData   = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data        = imageData.data;
            var darkPixels  = 0;
            var totalPixels = 0;
            for (var i = 0; i < data.length; i += 4) {
                var alpha = data[i + 3];
                if (alpha < 10) continue;
                totalPixels++;
                var r = data[i], g = data[i + 1], b = data[i + 2];
                var brightness = (r * 299 + g * 587 + b * 114) / 1000;
                if (brightness < 120) darkPixels++;
            }
            if (totalPixels > 0 && (darkPixels / totalPixels) >= threshold) {
                img.style.filter += ' brightness(0) invert(1)';
            }
        } catch (e) {}
    }

    // ==========================================
    // МОДУЛЬ: ЛОГОТИПЫ
    // ==========================================

    // Маппинг качества логотипа (1–7)
    var logoQualityMap = {
        '1': 'w92',
        '2': 'w154',
        '3': 'w185',
        '4': 'w300',
        '5': 'w500',
        '6': 'w780',
        '7': 'original'
    };

    function handleLogo(e) {
        var TARGET_WIDTH  = '7em';
        var data          = e.data.movie;
        var type          = data.name ? 'tv' : 'movie';
        var title_elem    = e.object.activity.render().find('.full-start-new__title');
        var head_elem     = e.object.activity.render().find('.full-start-new__head');
        var details_elem  = e.object.activity.render().find('.full-start-new__details');
        var dom_title     = title_elem[0];

        if (window.innerHeight > window.innerWidth) title_elem.css('text-align', 'center');
        else title_elem.css('text-align', 'left');

        // Если режим «показать название» — выходим
        if (Lampa.Storage.get('logo_glav', '0') === '1') return;

        // Читаем настройки
        var user_lang  = Lampa.Storage.get('logo_lang', 'uk');
        var target_lang = user_lang || Lampa.Storage.get('language');
        var qualityKey  = Lampa.Storage.get('logo_quality', '7');
        var size        = logoQualityMap[qualityKey] || 'original';
        var cache_key   = 'logo_cache_v3_' + type + '_' + data.id + '_' + target_lang + '_' + size;

        // Перемещаем head (жанры и т.д.) в details
        if (head_elem.length && details_elem.length && details_elem.find('.logo-moved-head').length === 0) {
            var content = head_elem.html();
            if (content) {
                head_elem.hide();
                if (details_elem.children().length > 0)
                    details_elem.append('<span class="full-start-new__split logo-moved-separator">◎</span>');
                details_elem.append('<span class="logo-moved-head">' + content + '</span>');
            }
        }

        function startLogoAnimation(img_url, save_to_cache) {
            if (save_to_cache) Lampa.Storage.set(cache_key, img_url);
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = img_url;
            var start_text_height = dom_title ? dom_title.getBoundingClientRect().height : 0;

            img.onload = function () {
                if (dom_title) {
                    dom_title.style.height     = '';
                    dom_title.style.margin     = '0';
                    dom_title.style.padding    = '0';
                    dom_title.style.overflow   = '';
                    dom_title.style.display    = '';
                    dom_title.style.transition = 'none';
                    dom_title.style.boxSizing  = '';
                    dom_title.style.opacity    = '1';
                    if (window.innerHeight > window.innerWidth) dom_title.style.textAlign = 'center';
                    else dom_title.style.textAlign = 'left';
                }
                img.style.marginTop = img.style.marginBottom = img.style.paddingTop = img.style.paddingBottom = '0';

                var use_text_height = Lampa.Storage.get('logo_use_text_height', false);
                if (use_text_height && start_text_height) {
                    img.style.height = start_text_height + 'px';
                    img.style.width  = 'auto';
                } else {
                    if (window.innerWidth < 768) { img.style.width = '100%'; img.style.height = 'auto'; }
                    else { img.style.width = TARGET_WIDTH; img.style.height = 'auto'; }
                }

                img.style.maxWidth    = '50vw';
                img.style.maxHeight   = '15vh';
                img.style.boxSizing   = 'border-box';
                img.style.display     = 'block';
                img.style.objectFit   = 'contain';

                if (window.innerHeight > window.innerWidth) {
                    img.style.objectPosition = 'center';
                    img.style.marginLeft = img.style.marginRight = 'auto';
                } else {
                    img.style.objectPosition = 'left bottom';
                    img.style.marginLeft = img.style.marginRight = '0';
                }

                img.style.opacity    = '1';
                img.style.transition = 'none';

                var saturation = Lampa.Storage.get('logo_saturation', '1');
                img.style.filter = 'drop-shadow(3px 3px 3px rgba(0,0,0,0.5)) saturate(' + saturation + ')';

                analyzeAndInvert(img, 0.85);
                title_elem.empty().append(img);
                title_elem.css({ opacity: '1', transition: 'none' });
            };

            img.onerror = function () {
                Lampa.Storage.set(cache_key, 'none');
                title_elem.css({ opacity: '1' });
            };
        }

        // Проверяем кеш
        var cached_url = Lampa.Storage.get(cache_key);
        if (cached_url && cached_url !== 'none') {
            startLogoAnimation(cached_url, false);
            return;
        }

        // Запрашиваем TMDB
        if (data.id) {
            var url = Lampa.TMDB.api(
                type + '/' + data.id + '/images?api_key=' + Lampa.TMDB.key() +
                '&include_image_language=' + target_lang + ',en,null'
            );
            $.get(url, function (data_api) {
                var final_logo = null;
                if (data_api.logos && data_api.logos.length > 0) {
                    var found =
                        data_api.logos.find(function (l) { return l.iso_639_1 === target_lang; }) ||
                        data_api.logos.find(function (l) { return l.iso_639_1 === 'en'; });
                    if (found) final_logo = found.file_path;
                }
                if (final_logo) {
                    var img_url = Lampa.TMDB.image('/t/p/' + size + final_logo.replace('.svg', '.png'));
                    startLogoAnimation(img_url, true);
                } else {
                    Lampa.Storage.set(cache_key, 'none');
                }
            });
        }
    }

    // ==========================================
    // МОДУЛЬ: ГИБРИДНЫЕ НАЗВАНИЯ
    // ==========================================

    function getCountryRU(iso) {
        if (!iso) return '';
        var code = iso.toLowerCase().trim();
        return countryNames[code] || Lampa.Lang.translate(code) || iso;
    }

    function renderHybridTitle(render, ukTitle, enTitle, hasLogo, year, country) {
        if (!render) return;
        $('.plugin-hybrid-title', render).remove();

        var mode     = Lampa.Storage.get('hybrid_title_mode', 'smart');
        var sizeKey  = Lampa.Storage.get('hybrid_title_size', 'm');
        var displayTitle = (mode === 'smart' && hasLogo) ? enTitle : ukTitle;
        if (!displayTitle || displayTitle === 'undefined') displayTitle = '';

        var sizes = {
            'xs':    { title: '1.0em', info: '0.8em' },
            's':     { title: '1.2em', info: '0.9em' },
            'm':     { title: '1.4em', info: '1.0em' },
            'l':     { title: '1.7em', info: '1.1em' },
            'xl':    { title: '2.0em', info: '1.2em' },
            'xxl':   { title: '2.4em', info: '1.3em' },
            'giant': { title: '3.0em', info: '1.5em' }
        };
        var currentSize = sizes[sizeKey] || sizes['m'];

        var details = [];
        if (year    && year    !== 'undefined') details.push(year);
        if (country && country !== 'undefined') details.push(country);
        var secondaryInfo = details.length > 0 ? ' • ' + details.join(' • ') : '';

        var html =
            '<div class="plugin-hybrid-title">' +
                '<div class="plugin-hybrid-title__body">' +
                    '<span style="font-size:' + currentSize.title + '; color:#fff; opacity:0.8;">' + displayTitle + '</span>' +
                    '<span style="font-size:' + currentSize.info  + '; color:#fff; opacity:0.5; margin-left:6px;">' + secondaryInfo + '</span>' +
                '</div>' +
            '</div>';

        var target = $('.full-start-new__title', render);
        if (!target.length) target = $('.full-start__title', render);
        target.after(html);
    }

    function handleHybridTitle(e) {
        var card   = e.data.movie;
        var render = e.object.activity.render();
        var cached = titleCache[card.id];
        var now    = Date.now();

        if (cached && (now - cached.timestamp < 2592000000)) {
            renderHybridTitle(render, cached.ukTitle, cached.enTitle, cached.hasLogo, cached.year, cached.country);
            return;
        }

        var type = card.first_air_date ? 'tv' : 'movie';
        var url  = 'https://api.themoviedb.org/3/' + type + '/' + card.id +
                   '?api_key=' + Lampa.TMDB.key() +
                   '&append_to_response=translations,images&include_image_language=uk,en,null';

        $.getJSON(url, function (data) {
            var hasUkrainianLogo = false;
            if (data.images && data.images.logos) {
                hasUkrainianLogo = data.images.logos.some(function (l) { return l.iso_639_1 === 'uk'; });
            }

            var originalName = data.original_title || data.original_name || card.original_title || card.original_name || '';
            var enTitle      = data.title || data.name || originalName;
            var ukTitle      = enTitle;

            if (data.translations && data.translations.translations) {
                var translation = data.translations.translations.find(function (t) {
                    return t.iso_3166_1 === 'UA' || t.iso_639_1 === 'uk';
                });
                if (translation) ukTitle = translation.data.title || translation.data.name || enTitle;
            }

            var dateStr      = data.release_date || data.first_air_date || '';
            var year         = dateStr ? dateStr.split('-')[0] : '';
            var countryList  = (data.production_countries || []).map(function (c) { return getCountryRU(c.iso_3166_1); });
            var countryString = countryList.join(' / ');

            titleCache[card.id] = {
                ukTitle: ukTitle || '', enTitle: enTitle || '',
                hasLogo: hasUkrainianLogo, year: year || '',
                country: countryString || '', timestamp: now
            };
            Lampa.Storage.set('title_cache_hybrid_v3', titleCache);
            renderHybridTitle(render, ukTitle, enTitle, hasUkrainianLogo, year, countryString);
        }).fail(function () {
            var fallbackTitle = card.title || card.name || card.original_title || '';
            renderHybridTitle(render, fallbackTitle, fallbackTitle, false, '', '');
        });
    }

    // ==========================================
    // МОДУЛЬ: РЕЙТИНГИ
    // ==========================================

    function normalizeRating(val, type) {
        if (!val && val !== 0) return '0.0';
        var strVal = String(val).replace('%', '');
        var num    = parseFloat(strVal);
        if (isNaN(num)) return '0.0';
        if (type === 'letterboxd' && num <= 5) num = num * 2;
        else if (num > 10) num = num / 10;
        return num.toFixed(1);
    }

    function getRatingColor(rating) {
        var val = parseFloat(rating);
        if (!val || val === 0) return '#fff';
        if (val < 3)   return '#ff4d4d';
        if (val < 5)   return '#ff9f43';
        if (val < 7.0) return '#feca57';
        return '#2ecc71';
    }

    function addRatingBlock(container, className, iconUrl, rawValue, keyName) {
        if (keyName && !Lampa.Storage.get('omdb_rating_toggle_' + keyName, true)) return;
        if (container.find('.' + className).length > 0) return;
        if (!rawValue || rawValue === '0' || rawValue === '0.0' || rawValue === 'N/A' || rawValue === '0%') return;

        var isAward    = (keyName === 'awards');
        var finalValue = isAward ? rawValue : normalizeRating(rawValue, keyName);
        if (!isAward && finalValue === '0.0') return;

        var color = isAward ? '#feca57' : getRatingColor(finalValue);
        if (className.indexOf('oscar') > -1) color = '#feca57';
        else if (className.indexOf('award') > -1) color = '#fff';

        var orderKey = keyName;
        if (className.indexOf('oscar') > -1) orderKey = 'oscar';
        else if (className.indexOf('award') > -1) orderKey = 'award';

        var size      = Lampa.Storage.get('omdb_rating_size', '1.1em');
        var order     = renderOrder[orderKey] || 50;
        var sat       = Lampa.Storage.get('omdb_rating_saturation', '75%');
        var styleType = Lampa.Storage.get('omdb_rating_style', 'normal');
        var isApple   = (styleType === 'apple' || styleType === 'apple_lite');
        var itemClass = isApple ? ' mod-apple-item' : '';

        var block = $(
            '<div class="full-start__rate custom-rating ' + className + itemClass + '" style="font-size:' + size + '; order:' + order + ';">' +
                '<div class="rating-icon-wrap"><img src="' + iconUrl + '" style="filter:saturate(' + sat + ');" /></div>' +
                '<div style="color:' + color + '">' + finalValue + '</div>' +
            '</div>'
        );
        container.append(block);
    }

    function getCubRating(e) {
        if (!e.object || !e.object.source || !(e.object.source === 'cub' || e.object.source === 'tmdb')) return null;
        var reactionCoef = { fire: 10, nice: 7.5, think: 5, bore: 2.5, shit: 0 };
        var sum = 0, cnt = 0;
        if (e.data && e.data.reactions && e.data.reactions.result) {
            e.data.reactions.result.forEach(function (r) {
                if (r.counter) { sum += r.counter * reactionCoef[r.type]; cnt += r.counter; }
            });
        }
        if (cnt >= 20) {
            var isTv = e.object.method === 'tv';
            var avg  = isTv ? 7.436 : 6.584;
            var m    = isTv ? 69    : 274;
            return ((avg * m + sum) / (m + cnt)).toFixed(1);
        }
        return null;
    }

    function handleRatings(e) {
        var render = e.object.activity.render();
        var movie  = e.data.movie;

        var container = render.find('.omdb-mdb-rate');
        if (container.length > 1) { container.not(':first').remove(); container = render.find('.omdb-mdb-rate').first(); }

        if (container.length === 0) {
            container = $('<div class="omdb-mdb-rate"></div>');
            var cardifyLeft = render.find('.cardify__left');
            if (cardifyLeft.length > 0) {
                var localRateLine = cardifyLeft.find('.full-start-new__rate-line, .full-start__rate-line').first();
                var localTitle    = cardifyLeft.find('.full-start-new__title, .full-start__title').first();
                if (localRateLine.length > 0) container.insertBefore(localRateLine);
                else if (localTitle.length > 0) container.insertAfter(localTitle);
                else cardifyLeft.append(container);
            } else {
                var rateLine  = render.find('.full-start-new__rate-line, .full-start__rate-line').first();
                var titleLine = render.find('.full-start-new__title, .full-start__title').first();
                var infoBlock = render.find('.full-start__info');
                if (rateLine.length > 0) container.insertBefore(rateLine);
                else if (titleLine.length > 0) container.insertAfter(titleLine);
                else if (infoBlock.length > 0) infoBlock.prepend(container);
            }
        }

        var marginVal = Lampa.Storage.get('omdb_rating_margin', '10px');
        var sat       = Lampa.Storage.get('omdb_rating_saturation', '75%');
        var gapVal    = Lampa.Storage.get('omdb_rating_gap', '0.5em');
        var styleType = Lampa.Storage.get('omdb_rating_style', 'normal');
        var isApple   = (styleType === 'apple' || styleType === 'apple_lite');

        container.css({ 'margin-top': marginVal, 'margin-bottom': marginVal });

        if (gapVal.indexOf('-') !== -1) {
            container.css({ 'gap': '0px', '--mod-gap-negative': gapVal }).addClass('mod-gap-negative');
        } else {
            container.css({ 'gap': gapVal }).removeClass('mod-gap-negative');
        }

        if (isApple) {
            container.addClass('mod-apple-container');
            if (styleType === 'apple_lite') container.addClass('is-lite');
        } else {
            container.removeClass('mod-apple-container is-lite');
        }

        if (sat === '0%') container.addClass('is-bw-text');
        else container.removeClass('is-bw-text');

        if (movie.vote_average > 0) addRatingBlock(container, 'rate--tmdb-custom', rateIcons.tmdb, movie.vote_average, 'tmdb');
        var cubVal = getCubRating(e);
        if (cubVal) addRatingBlock(container, 'rate--cub-custom', rateIcons.cub, cubVal, 'cub');

        var imdb_id = movie.imdb_id || (movie.external_ids ? movie.external_ids.imdb_id : '');

        var requestMDBList = function (id) {
            var key = Lampa.Storage.get('omdb_mdblist_api_key', '');
            if (!key) return;
            $.getJSON('https://mdblist.com/api/?apikey=' + key + '&i=' + id, function (data) {
                if (!data) return;
                if (data.score) addRatingBlock(container, 'rate--mdblist-score', rateIcons.mdblist, data.score, 'mdblist');
                if (data.ratings && Array.isArray(data.ratings)) {
                    data.ratings.forEach(function (r) {
                        if (r.source === 'trakt')            addRatingBlock(container, 'rate--mdblist-trakt',  rateIcons.trakt,      r.value, 'trakt');
                        if (r.source === 'letterboxd')       addRatingBlock(container, 'rate--mdblist-lb',     rateIcons.letterboxd, r.value, 'letterboxd');
                        if (r.source === 'tomatoesaudience') addRatingBlock(container, 'rate--mdblist-popcorn',rateIcons.popcorn,    r.value, 'popcorn');
                        if (r.source === 'metacritic' && container.find('.rate--omdb-meta').length === 0)
                            addRatingBlock(container, 'rate--mdblist-meta', rateIcons.mc,   r.value, 'mc');
                        if (r.source === 'tomatoes' && container.find('.rate--omdb-rt').length === 0)
                            addRatingBlock(container, 'rate--mdblist-rt',   rateIcons.rt,   r.value, 'rt');
                        if (r.source === 'imdb' && container.find('.rate--omdb-imdb').length === 0)
                            addRatingBlock(container, 'rate--mdblist-imdb', rateIcons.imdb, r.value, 'imdb');
                    });
                }
            });
        };

        var requestOMDB = function (id) {
            var key = Lampa.Storage.get('omdb_api_key', '');
            if (!key) return requestMDBList(id);
            $.getJSON('https://www.omdbapi.com/?apikey=' + key + '&i=' + id, function (data) {
                if (data && data.Response !== 'False') {
                    if (data.Awards && data.Awards !== 'N/A') {
                        var oscars = data.Awards.match(/Won (\d+) Oscar/i);
                        var wins   = data.Awards.match(/(\d+) win/i);
                        if (oscars && parseInt(oscars[1]) > 0) addRatingBlock(container, 'rate--omdb-oscar',  rateIcons.oscar, oscars[1], 'awards');
                        if (wins   && parseInt(wins[1])   > 0) addRatingBlock(container, 'rate--omdb-awards', rateIcons.award, wins[1],   'awards');
                    }
                    if (data.Metascore && data.Metascore !== 'N/A')
                        addRatingBlock(container, 'rate--omdb-meta', rateIcons.mc, data.Metascore, 'mc');
                    var rt = (data.Ratings || []).find(function (r) { return r.Source === 'Rotten Tomatoes'; });
                    if (rt) addRatingBlock(container, 'rate--omdb-rt', rateIcons.rt, rt.Value, 'rt');
                    if (data.imdbRating && data.imdbRating !== 'N/A')
                        addRatingBlock(container, 'rate--omdb-imdb', rateIcons.imdb, data.imdbRating, 'imdb');
                }
            }).always(function () { requestMDBList(id); });
        };

        if (imdb_id) {
            requestOMDB(imdb_id);
        } else if (movie.id) {
            var type = (e.object.method === 'tv' || movie.number_of_seasons) ? 'tv' : 'movie';
            Lampa.Network.silent(
                Lampa.TMDB.api(type + '/' + movie.id + '/external_ids?api_key=' + Lampa.TMDB.key()),
                function (res) { if (res && res.imdb_id) requestOMDB(res.imdb_id); }
            );
        }
    }

    // ==========================================
    // МОДУЛЬ: СТУДИИ
    // ==========================================

    function renderStudiosTitle(render, title, movie) {
        if (!render) return;
        $('.plugin-uk-title-combined', render).remove();

        var styleType = Lampa.Storage.get('studio_logo_style', 'normal');
        var isApple   = (styleType === 'apple' || styleType === 'apple_lite');
        var showBg    = isApple ? false : Lampa.Storage.get('studio_logo_bg', true);
        var sizeEm    = Lampa.Storage.get('studio_logo_size', '0.7em');
        var gapEm     = Lampa.Storage.get('studio_logo_gap', '0.2em');
        var saturation = Lampa.Storage.get('studio_logo_saturation', '1');

        var html = '';
        if (movie && movie.production_companies) {
            movie.production_companies.slice(0, 3).forEach(function (co, index) {
                var content = co.logo_path
                    ? '<img src="https://image.tmdb.org/t/p/h100' + co.logo_path + '" title="' + co.name + '" crossorigin="anonymous" class="studio-img-check">'
                    : '<span class="studio-logo-text">' + co.name + '</span>';

                if (!showBg && !isApple && index > 0) {
                    html += '<span style="color:rgba(255,255,255,0.4); margin:0 ' + gapEm + '; font-size:0.6em; display:inline-flex; align-items:center;">◎</span>';
                }

                var itemClass = 'rate--studio studio-logo mod-studio-item' + (isApple ? ' mod-apple-item' : '');
                html += '<div class="' + itemClass + '" data-id="' + co.id + '" data-name="' + co.name + '" style="display:inline-flex; vertical-align:middle;">' + content + '</div>';
            });
        }
        if (!html) return;

        var bgCSS = '';
        if (!isApple) {
            bgCSS = showBg
                ? 'background:rgba(255,255,255,0.08) !important; padding:5px 12px !important; margin-right:' + (gapEm.indexOf('-') !== -1 ? '0px' : gapEm) + ' !important;'
                : 'background:transparent !important; border:none !important; padding:5px 0px !important; margin-bottom:0.2em !important;';
        }

        var containerClass = 'studio-logos-container' + (isApple ? ' mod-apple-container' + (styleType === 'apple_lite' ? ' is-lite' : '') : '');
        var wrapStyle = isApple ? '' : 'flex-wrap:wrap;';

        if (gapEm.indexOf('-') !== -1) {
            wrapStyle += ' gap:0px; --mod-gap-negative:' + gapEm + ';';
            containerClass += ' mod-gap-negative';
        } else {
            wrapStyle += ' gap:' + gapEm + ';';
        }

        var wrap = $(
            '<div class="plugin-uk-title-combined" style="margin-top:10px; margin-bottom:5px; text-align:left; width:100%; display:flex; flex-direction:column; align-items:flex-start;">' +
                '<div class="' + containerClass + '" style="display:flex; align-items:center; ' + wrapStyle + '">' + html + '</div>' +
            '</div>'
        );

        var target = $('.plugin-hybrid-title', render);
        if (!target.length) target = $('.full-start-new__title', render);
        if (!target.length) target = $('.full-start__title', render);
        target.after(wrap);

        if (!isApple) {
            $('.rate--studio', render).css('cssText', bgCSS + ' filter:saturate(' + saturation + ');');
        } else {
            $('.rate--studio', render).css('filter', 'saturate(' + saturation + ')');
        }

        $('.rate--studio img', render).css('cssText', 'height:' + sizeEm + ' !important; filter:brightness(1) invert(0);');

        $('.studio-img-check', render).each(function () {
            var img = this;
            if (img.complete) analyzeAndInvert(img, 0.85);
            else img.onload = function () { analyzeAndInvert(img, 0.85); };
        });

        $('.rate--studio', render).on('hover:enter', function () {
            var id = $(this).data('id');
            if (id) Lampa.Activity.push({
                url: 'movie', id: id, title: $(this).data('name'),
                component: 'company', source: 'tmdb', page: 1
            });
        });

        setTimeout(function () {
            var studios = render.find('.mod-studio-item:not(.selector)');
            if (studios.length) {
                studios.addClass('selector');
                var current = Lampa.Controller.enabled();
                if (current && (current.name === 'full_start' || current.name === 'full_descr')) {
                    current.collection = render.find('.selector');
                }
            }
        }, 1000);
    }

    function handleStudios(e) {
        var card   = e.data.movie;
        var render = e.object.activity.render();
        var now    = Date.now();
        var cached = studiosCache[card.id];

        if (cached && (now - cached.timestamp < 180000)) {
            renderStudiosTitle(render, cached.uk_title, cached.full_data);
        } else {
            var type = card.first_air_date ? 'tv' : 'movie';
            Lampa.Api.sources.tmdb.get(type + '/' + card.id + '?append_to_response=translations', {}, function (data) {
                var tr    = data.translations ? data.translations.translations : [];
                var found = tr.find(function (t) { return t.iso_3166_1 === 'UA' || t.iso_639_1 === 'uk'; });
                var uk    = found ? (found.data.title || found.data.name) : (card.title || card.name);
                studiosCache[card.id] = { uk_title: uk, full_data: data, timestamp: now };
                renderStudiosTitle(render, uk, data);
            }, function () {
                renderStudiosTitle(render, card.title || card.name, card);
            });
        }
    }

    // ==========================================
    // МОДУЛЬ: UATOR (маркеры UA-контента)
    // ==========================================

    function getResolutionLabel(width) {
        var w = parseInt(width || 0);
        if (w >= 3800) return '4K';
        if (w >= 2500) return '2K';
        if (w >= 1900) return 'FHD';
        if (w >= 1200) return 'HD';
        return 'SD';
    }

    function getBestAndPopular(results, movie) {
        if (!results || !Array.isArray(results)) return { ukr: false };

        var ukrPattern = /(^|[^а-яёіїєґa-z])(ukr|ukrainian|україн[а-яёіїєґ]*|укр|ua|укрдублаж|укрпереклад|укрмов[а-яёіїєґ]*)($|[^а-яёіїєґa-z])/i;
        var ukrResults  = [];
        var movieYear   = parseInt(movie.release_date || movie.first_air_date || movie.year || 0);
        var isTv        = !!(movie.name || movie.first_air_date);

        results.forEach(function (item) {
            var title = (item.Title || '').toLowerCase();

            if (movieYear > 0 && !isTv) {
                var yearMatch = title.match(/\b(19|20)\d{2}\b/g);
                if (yearMatch) {
                    var correctYear = yearMatch.some(function (y) { return Math.abs(parseInt(y) - movieYear) <= 1; });
                    if (!correctYear) return;
                }
            }

            var titleClean = title
                .replace(/[a-z0-9\-]+\.(ua|uk)\b/ig, '')
                .replace(/(укр[а-яёіїєґ]*|ukr[a-z]*|ua|ukrainian)[\s\.\,\_\-\|]*(sub|суб)[a-zа-яёіїєґ]*/ig, '')
                .replace(/(sub|суб)[a-zа-яёіїєґ]*[\s\.\,\_\-\|]*(укр[а-яёіїєґ]*|ukr[a-z]*|ua|ukrainian)/ig, '');

            var hasUkr = ukrPattern.test(titleClean);

            if (!hasUkr && item.ffprobe && Array.isArray(item.ffprobe)) {
                hasUkr = item.ffprobe.some(function (s) {
                    if (s.codec_type !== 'audio') return false;
                    var l = (s.tags && s.tags.language ? s.tags.language : '').toLowerCase();
                    var t = (s.tags && s.tags.title   ? s.tags.title   : '').toLowerCase();
                    return l === 'uk' || l === 'ukr' || l === 'ua' || ukrPattern.test(t);
                });
            }

            if (!hasUkr) {
                var trackerName = (item.tracker || item.Tracker || item.name || '').toLowerCase();
                if (trackerName.indexOf('toloka') !== -1 || trackerName.indexOf('mazepa') !== -1) hasUkr = true;
            }

            if (hasUkr) {
                var width = 0;
                if (item.ffprobe) {
                    item.ffprobe.forEach(function (s) {
                        if (s.codec_type === 'video' && s.width) width = Math.max(width, parseInt(s.width));
                    });
                }
                if (width === 0) {
                    if (/2160|4k|uhd/i.test(title))   width = 3840;
                    else if (/1080|fhd/i.test(title)) width = 1920;
                    else if (/720|hd/i.test(title))   width = 1280;
                    else if (/480|sd/i.test(title))   width = 720;
                    else width = 720;
                }
                item.detectedWidth  = width;
                item.seedersCount   = parseInt(item.Seeders || 0);
                ukrResults.push(item);
            }
        });

        if (ukrResults.length === 0) return { ukr: false };

        var best    = ukrResults.reduce(function (p, c) {
            if (p.detectedWidth > c.detectedWidth) return p;
            if (p.detectedWidth < c.detectedWidth) return c;
            return p.seedersCount > c.seedersCount ? p : c;
        });
        var popular = ukrResults.reduce(function (p, c) { return p.seedersCount > c.seedersCount ? p : c; });
        var tech    = { hdr: false, dv: false, audio: null };
        var maxChannels = 0;

        ukrResults.forEach(function (item) {
            if (item.ffprobe) {
                item.ffprobe.forEach(function (s) {
                    if (s.codec_type === 'audio' && s.channels) maxChannels = Math.max(maxChannels, parseInt(s.channels));
                });
            }
            var t = item.Title.toLowerCase();
            if (t.match(/7\.1|8ch/))      maxChannels = Math.max(maxChannels, 8);
            else if (t.match(/5\.1|6ch/)) maxChannels = Math.max(maxChannels, 6);
            else if (t.match(/2\.0/))     maxChannels = Math.max(maxChannels, 2);
        });

        if (maxChannels > 0) tech.audio = maxChannels >= 8 ? '7.1' : maxChannels >= 6 ? '5.1' : maxChannels >= 4 ? '4.0' : '2.0';

        if (best.ffprobe) {
            best.ffprobe.forEach(function (s) {
                if (s.codec_type === 'video') {
                    var side = JSON.stringify(s.side_data_list || []);
                    if (/vision|dovi/i.test(side)) tech.dv = true;
                    if (s.color_transfer === 'smpte2084') tech.hdr = true;
                }
            });
        }
        var bTitle = best.Title.toLowerCase();
        if (!tech.dv  && /vision|dovi/i.test(bTitle)) tech.dv  = true;
        if (!tech.hdr && /hdr/i.test(bTitle))         tech.hdr = true;

        return {
            ukr:     true,
            bestRes: getResolutionLabel(best.detectedWidth),
            popRes:  getResolutionLabel(popular.detectedWidth),
            popSeeds: popular.seedersCount,
            tech:    tech
        };
    }

    function renderUator(container, data) {
        container.find('.qb-unified-block').remove();
        if (!data) return;

        var isCard    = container.closest('.card').length > 0 || container.hasClass('card__view');
        var styleType = isCard ? 'normal' : Lampa.Storage.get('uator_style', 'normal');
        var isApple   = (styleType === 'apple' || styleType === 'apple_lite');

        var size       = Lampa.Storage.get('uator_rating_size', '1.1em');
        var saturation = Lampa.Storage.get('uator_saturation', '100%');
        var uatorGap   = Lampa.Storage.get('uator_gap', '0.45em');

        var blockClass = 'qb-unified-block' + (isApple ? ' mod-apple-container' + (styleType === 'apple_lite' ? ' is-lite' : '') : '');
        var blockStyle = 'font-size:' + size + ';';

        if (uatorGap.indexOf('-') !== -1) {
            blockStyle += ' gap:0px; --mod-gap-negative:' + uatorGap + ';';
            blockClass += ' mod-gap-negative';
        } else {
            blockStyle += ' gap:' + uatorGap + ';';
        }

        var block      = $('<div class="' + blockClass + '" style="' + blockStyle + '"></div>');
        var badgeClass = 'quality-badge' + (isApple ? ' mod-apple-item' : '');

        if (!data.ukr) {
            var noneIcon = saturation === '0%'
                ? '<span class="qb-text-icon">UA</span>'
                : '<img src="' + uatorIcons.none + '" class="qb-prefix-icon" style="filter:saturate(' + saturation + ')">';
            block.append('<div class="' + badgeClass + ' qb-not-found">' + noneIcon + '<span class="qb-text">нет</span></div>');
        } else {
            var items = [
                { i: uatorIcons.ua,    t: data.bestRes,   type: 'ua' },
                { i: uatorIcons.top,   t: data.popRes  },
                { i: uatorIcons.seeds, t: data.popSeeds }
            ];
            if (data.tech.audio) items.push({ i: uatorIcons.audio, t: data.tech.audio });
            if (data.tech.dv)    items.push({ i: uatorIcons.dv,    t: '', type: 'dv'  });
            if (data.tech.hdr)   items.push({ i: uatorIcons.hdr,   t: '', type: 'hdr' });

            items.forEach(function (it) {
                var iconHtml = '';
                if (it.i) {
                    var style = 'filter:saturate(' + saturation + ');';
                    if (it.type === 'ua' && saturation === '0%') iconHtml = '<span class="qb-text-icon">UA</span>';
                    else {
                        if (it.type === 'dv')  style = 'filter:brightness(0) invert(1);';
                        if (it.type === 'hdr') style = 'filter:grayscale(1);';
                        iconHtml = '<img src="' + it.i + '" class="qb-prefix-icon" style="' + style + '">';
                    }
                }
                var textHtml = it.t ? '<span class="qb-text">' + it.t + '</span>' : '';
                block.append('<div class="' + badgeClass + '">' + iconHtml + textHtml + '</div>');
            });
        }
        container.append(block);
    }

    function processUatorCards() {
        if (!isEnabled('uator')) return;
        $('.card:not(.qb-processed)').each(function () {
            var card  = $(this);
            var movie = card.data('item');
            if (!movie || !movie.id) return;
            card.addClass('qb-processed');

            var key        = movie.id + '_' + (movie.title || movie.name);
            var localSearch = movie.title || movie.name;
            var origSearch  = movie.original_title || movie.original_name;

            if (uatorCache[key] && uatorCache[key].ukr) {
                renderUator(card.find('.card__view'), uatorCache[key]);
                return;
            }

            Lampa.Parser.get({ search: localSearch, movie: movie, page: 1 }, function (res) {
                var data = (res && res.Results) ? getBestAndPopular(res.Results, movie) : { ukr: false };
                if (data.ukr) {
                    uatorCache[key] = data;
                    renderUator(card.find('.card__view'), data);
                } else if (origSearch && origSearch !== localSearch) {
                    Lampa.Parser.get({ search: origSearch, movie: movie, page: 1 }, function (res2) {
                        var data2 = (res2 && res2.Results) ? getBestAndPopular(res2.Results, movie) : { ukr: false };
                        uatorCache[key] = data2;
                        if (data2.ukr) renderUator(card.find('.card__view'), data2);
                    }, function () { uatorCache[key] = data; });
                } else {
                    uatorCache[key] = data;
                }
            }, function () { uatorCache[key] = { ukr: false }; });
        });
    }
    setInterval(processUatorCards, 2000);

    function handleUatorFull(e) {
        var renderTarget = e.object.activity.render();
        var isPortrait   = window.innerHeight > window.innerWidth;
        var cont = $('.quality-badges-container', renderTarget);

        if (!cont.length) {
            cont = $('<div class="quality-badges-container"></div>');
            if (isPortrait) {
                var title = $('.full-start-new__title, .full-start__title', renderTarget);
                title.after(cont);
            } else {
                var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderTarget);
                if (rateLine.length) rateLine.append(cont);
                else $('.full-start__info', renderTarget).append(cont);
            }
        }

        var movie       = e.data.movie;
        var localSearch = movie.title || movie.name;
        var origSearch  = movie.original_title || movie.original_name;

        Lampa.Parser.get({ search: localSearch, movie: movie, page: 1 }, function (res) {
            var data = (res && res.Results) ? getBestAndPopular(res.Results, movie) : { ukr: false };
            if (data.ukr) {
                renderUator(cont, data);
            } else if (origSearch && origSearch !== localSearch) {
                Lampa.Parser.get({ search: origSearch, movie: movie, page: 1 }, function (res2) {
                    var data2 = (res2 && res2.Results) ? getBestAndPopular(res2.Results, movie) : { ukr: false };
                    renderUator(cont, data2);
                }, function () { renderUator(cont, data); });
            } else {
                renderUator(cont, data);
            }
        }, function () { renderUator(cont, { ukr: false }); });
    }

    // ==========================================
    // ПОДПИСКА НА СОБЫТИЯ LAMPA
    // ==========================================

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite' || e.type === 'ready') {
            if (isEnabled('slogan')) modCleanSlogan();
        }
        if (e.type === 'complite' || e.type === 'complete') {
            if (isEnabled('logo'))    handleLogo(e);
            if (isEnabled('hybrid'))  handleHybridTitle(e);
            if (isEnabled('studios')) handleStudios(e);
            if (isEnabled('ratings')) {
                setTimeout(function () { handleRatings(e); }, 100);
                setTimeout(function () { handleRatings(e); }, 1000);
            }
            if (isEnabled('uator')) handleUatorFull(e);
        }
    });

    // ==========================================
    // СОЗДАНИЕ НАСТРОЕК
    // ==========================================

    function createSettings() {
        var MAIN_C = 'mod_main';

        // Регистрируем компоненты
        Lampa.SettingsApi.addComponent({ component: MAIN_C,             name: "Mod • MaksTV",       icon: yIcon });
        Lampa.SettingsApi.addComponent({ component: 'm_logo',           name: 'Логотипы (Smart)'                });
        Lampa.SettingsApi.addComponent({ component: 'm_title',          name: 'Дополнительное название'         });
        Lampa.SettingsApi.addComponent({ component: 'm_buttons',        name: 'Кнопки карточки'                 });
        Lampa.SettingsApi.addComponent({ component: 'm_ratings',        name: 'OMDB & MDBList'                  });
        Lampa.SettingsApi.addComponent({ component: 'm_ratings_select', name: 'Выбор рейтингов'                 });
        Lampa.SettingsApi.addComponent({ component: 'm_studios',        name: 'Логотипы студий'                 });
        Lampa.SettingsApi.addComponent({ component: 'm_uator',          name: 'Uator'                           });

        // ---- Вспомогательные функции ----

        function addStatic(comp, name, title, desc, onClick) {
            Lampa.SettingsApi.addParam({
                component: comp,
                param: { name: name, type: 'static' },
                field: { name: title, description: desc },
                onRender: function (item) { item.on('hover:enter', onClick); }
            });
        }

        function addToggle(comp, modName, title, desc) {
            Lampa.SettingsApi.addParam({
                component: comp,
                param: { name: MOD + 'enable_' + modName, type: 'trigger', default: true },
                field: { name: title, description: desc },
                onChange: function (val) {
                    Lampa.Storage.set(MOD + 'enable_' + modName, val);
                    updateBodyClasses();
                }
            });
        }

        function addSelect(comp, name, title, desc, values, def, onChange) {
            Lampa.SettingsApi.addParam({
                component: comp,
                param: { name: name, type: 'select', values: values, default: def },
                field: { name: title, description: desc },
                onChange: onChange
            });
        }

        function backTo(comp, target) {
            addStatic(comp, comp + '_back', 'Назад', 'Вернуться', function () { Lampa.Settings.create(target); });
        }

        function clearCacheBtn(comp, title, prefix) {
            addStatic(comp, comp + '_clear', title, 'Очистить кеш плагина', function () {
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.indexOf(prefix) !== -1) { localStorage.removeItem(key); i--; }
                }
                Lampa.Noty.show('Кеш очищен. Перезагрузка...');
                setTimeout(function () { window.location.reload(); }, 1000);
            });
        }

        // ---- Главная страница настроек ----

        addStatic(MAIN_C, 'm_author', 'Автор плагина', 'MaksTV — Mod для Lampa Player', function () {});

        addToggle(MAIN_C, 'slogan', 'Скрытие слогана', 'Убрать короткие слоганы под названием');

        addStatic(MAIN_C, 'm_logo_entry', 'Логотипы (Smart)', 'Настройка замены текста на логотип', function () { Lampa.Settings.create('m_logo'); });

        addStatic(MAIN_C, 'm_title_entry', 'Дополнительное название', 'Оригинальное название, год, страна', function () { Lampa.Settings.create('m_title'); });

        addStatic(MAIN_C, 'm_buttons_entry', 'Кнопки карточки', 'Внешний вид кнопок действий', function () { Lampa.Settings.create('m_buttons'); });

        addStatic(MAIN_C, 'm_ratings_entry', 'Рейтинги (OMDB / MDBList)', 'Настройка дополнительных оценок', function () { Lampa.Settings.create('m_ratings'); });

        addStatic(MAIN_C, 'm_studios_entry', 'Логотипы студий', 'Отображение производителей', function () { Lampa.Settings.create('m_studios'); });

        addStatic(MAIN_C, 'm_uator_entry', 'Uator', 'Настройка маркеров UA-контента', function () { Lampa.Settings.create('m_uator'); });

        // ---- Раздел: Логотипы ----

        backTo('m_logo', MAIN_C);
        addToggle('m_logo', 'logo', 'Включить плагин', 'Отображать графические логотипы');
        addSelect('m_logo', 'logo_glav', 'Режим замены', 'Что показывать вместо текста',
            { '1': 'Показать название', '0': 'Показать логотип' }, '0');
        addSelect('m_logo', 'logo_lang', 'Язык логотипа', 'Приоритет языка',
            { '': 'Как в Lampa', 'en': 'Английский', 'ru': 'Русский', 'uk': 'Украинский' }, 'uk');
        addSelect('m_logo', 'logo_quality', 'Качество логотипа (1–7)', 'Размер изображения с TMDB',
            {
                '1': '1 — Минимум (w92)',
                '2': '2 — Очень маленький (w154)',
                '3': '3 — Маленький (w185)',
                '4': '4 — Средний (w300)',
                '5': '5 — Хороший (w500)',
                '6': '6 — Высокий (w780)',
                '7': '7 — Оригинал (наилучший)'
            }, '7');
        addSelect('m_logo', 'logo_saturation', 'Насыщенность', '',
            { '1': '100%', '0.75': '75%', '0.5': '50%', '0.25': '25%', '0': '0% (Ч/Б)' }, '1');
        Lampa.SettingsApi.addParam({
            component: 'm_logo',
            param: { name: 'logo_use_text_height', type: 'trigger', default: false },
            field: { name: 'Логотип по высоте текста', description: 'Масштабировать под размер шрифта' }
        });
        clearCacheBtn('m_logo', 'Очистить кеш логотипов', 'logo_cache_v3_');

        // ---- Раздел: Дополнительное название ----

        backTo('m_title', MAIN_C);
        addToggle('m_title', 'hybrid', 'Включить плагин', 'Отображать дополнительную информацию');
        addSelect('m_title', 'hybrid_title_mode', 'Режим', '',
            { 'smart': 'Зависит от логотипа', 'always_ua': 'Всегда украинское' }, 'smart');
        addSelect('m_title', 'hybrid_title_size', 'Размер текста', '',
            {
                'xs': 'Очень маленький', 's': 'Маленький', 'm': 'Стандартный',
                'l': 'Большой', 'xl': 'Очень большой', 'xxl': 'Максимальный', 'giant': 'Гигантский'
            }, 'xs');
        clearCacheBtn('m_title', 'Очистить кеш названий', 'title_cache_hybrid_v3');

        // ---- Раздел: Кнопки карточки ----

        backTo('m_buttons', MAIN_C);
        addSelect('m_buttons', 'm_button_style', 'Стиль кнопок',
            'Внешний вид кнопок плеера, закладок и т.д.',
            { 'normal': 'Обычный (Lampa)', 'apple': 'Apple Style (с размытием)', 'apple_lite': 'Apple Lite (без размытия)' },
            'normal', function () { updateBodyClasses(); });
        addSelect('m_buttons', 'm_button_size', 'Размер кнопок', 'Работает для Apple-стилей',
            { '0.8em': '0.8em (Мини)', '0.9em': '0.9em (Мелкий)', '1em': '1em (Стандарт)', '1.1em': '1.1em (Больше)', '1.2em': '1.2em (Крупный)', '1.4em': '1.4em (Гигантский)' },
            '1em', function () { updateBodyClasses(); });

        // ---- Раздел: Рейтинги ----

        backTo('m_ratings', MAIN_C);
        addToggle('m_ratings', 'ratings', 'Включить плагин', 'Отображать внешние рейтинги');

        // OMDB ключ
        Lampa.SettingsApi.addParam({
            component: 'm_ratings',
            param: { name: 'omdb_api_key_set', type: 'static' },
            field: { name: 'OMDB API Key', description: 'Установить ключ' },
            onRender: function (item) {
                var valEl = $('<div class="omdb-api-val">' + (Lampa.Storage.get('omdb_api_key', '') || 'Не установлен') + '</div>');
                item.find('.settings-param__descr').after(valEl);
                item.on('hover:enter', function () {
                    Lampa.Input.edit({
                        title: 'OMDB API Key',
                        value: Lampa.Storage.get('omdb_api_key', ''),
                        free: true, nosave: true
                    }, function (newValue) {
                        Lampa.Storage.set('omdb_api_key', newValue);
                        valEl.text(newValue || 'Не установлен');
                    });
                });
            }
        });

        // MDBList ключ
        Lampa.SettingsApi.addParam({
            component: 'm_ratings',
            param: { name: 'mdblist_api_key_set', type: 'static' },
            field: { name: 'MDBList API Key', description: 'Установить ключ' },
            onRender: function (item) {
                var valEl = $('<div class="omdb-api-val">' + (Lampa.Storage.get('omdb_mdblist_api_key', '') || 'Не установлен') + '</div>');
                item.find('.settings-param__descr').after(valEl);
                item.on('hover:enter', function () {
                    Lampa.Input.edit({
                        title: 'MDBList API Key',
                        value: Lampa.Storage.get('omdb_mdblist_api_key', ''),
                        free: true, nosave: true
                    }, function (newValue) {
                        Lampa.Storage.set('omdb_mdblist_api_key', newValue);
                        valEl.text(newValue || 'Не установлен');
                    });
                });
            }
        });

        addSelect('m_ratings', 'omdb_rating_style', 'Стиль блока', 'Внешний вид контейнера рейтингов',
            { 'normal': 'Обычный', 'apple': 'Apple Style (с размытием)', 'apple_lite': 'Apple Lite (без размытия)' }, 'normal');
        addSelect('m_ratings', 'omdb_rating_size', 'Размер рейтингов', '',
            { '0.5em': 'XS', '0.8em': 'S', '1.1em': 'M (Стандарт)', '1.5em': 'L', '2.0em': 'XL' }, '1.1em');
        addSelect('m_ratings', 'omdb_rating_gap', 'Отступ между рейтингами', '',
            { '-1em': '-1em', '-0.8em': '-0.8em', '-0.5em': '-0.5em', '-0.2em': '-0.2em', '0px': '0', '0.2em': '0.2em', '0.5em': '0.5em (Стандарт)', '1em': '1em', '1.5em': '1.5em', '2em': '2em' }, '0.5em');
        addSelect('m_ratings', 'omdb_rating_margin', 'Отступ от других строк', '',
            { '-1em': '-1em', '-0.5em': '-0.5em', '0px': '0', '10px': '10px (Стандарт)', '0.5em': '0.5em', '1em': '1em', '1.5em': '1.5em', '2em': '2em' }, '10px');
        addSelect('m_ratings', 'omdb_rating_saturation', 'Насыщенность иконок', '',
            { '100%': '100% (Стандарт)', '75%': '75%', '50%': '50%', '25%': '25%', '0%': '0% (Ч/Б)' }, '75%');
        addStatic('m_ratings', 'omdb_select_ratings', 'Выбор рейтингов', 'Вкл/Выкл источников', function () { Lampa.Settings.create('m_ratings_select'); });

        // ---- Раздел: Выбор рейтингов ----

        backTo('m_ratings_select', 'm_ratings');
        availableRatings.forEach(function (rating) {
            Lampa.SettingsApi.addParam({
                component: 'm_ratings_select',
                param: { name: 'omdb_rating_toggle_' + rating.key, type: 'trigger', default: rating.default },
                field: { name: rating.name }
            });
        });

        // ---- Раздел: Студии ----

        backTo('m_studios', MAIN_C);
        addToggle('m_studios', 'studios', 'Включить плагин', 'Отображать логотипы студий');
        addSelect('m_studios', 'studio_logo_style', 'Стиль блока', 'Внешний вид',
            { 'normal': 'Обычный', 'apple': 'Apple Style (с размытием)', 'apple_lite': 'Apple Lite (без размытия)' }, 'normal');
        Lampa.SettingsApi.addParam({
            component: 'm_studios',
            param: { name: 'studio_logo_bg', type: 'trigger', default: true },
            field: { name: 'Подложка', description: 'Полупрозрачный фон (не работает для Apple Style)' }
        });
        addSelect('m_studios', 'studio_logo_size', 'Размер логотипа', '',
            { '0.5em': '0.5em', '0.6em': '0.6em', '0.7em': '0.7em (Стандарт)', '0.8em': '0.8em', '0.9em': '0.9em', '1.0em': '1.0em', '1.1em': '1.1em', '1.3em': '1.3em', '1.5em': '1.5em', '2.0em': '2.0em', '2.5em': '2.5em' }, '0.7em');
        addSelect('m_studios', 'studio_logo_gap', 'Отступ между логотипами', '',
            { '-1em': '-1em', '-0.8em': '-0.8em', '-0.5em': '-0.5em', '-0.2em': '-0.2em', '0px': '0', '0.2em': '0.2em', '0.5em': '0.5em', '1.0em': '1.0em', '1.2em': '1.2em', '1.5em': '1.5em', '2.0em': '2.0em' }, '0.2em');
        addSelect('m_studios', 'studio_logo_saturation', 'Насыщенность', '',
            { '1': '100%', '0.75': '75%', '0.5': '50%', '0.25': '25%', '0': '0% (Ч/Б)' }, '1');

        // ---- Раздел: Uator ----

        backTo('m_uator', MAIN_C);
        addToggle('m_uator', 'uator', 'Включить плагин', 'Отображать значки торрентов');
        addSelect('m_uator', 'uator_style', 'Стиль блока', 'Только для полной страницы фильма',
            { 'normal': 'Обычный', 'apple': 'Apple Style (с размытием)', 'apple_lite': 'Apple Lite (без размытия)' }, 'normal');
        addSelect('m_uator', 'uator_gap', 'Отступ между значками', '',
            { '-1em': '-1em', '-0.8em': '-0.8em', '-0.5em': '-0.5em', '-0.2em': '-0.2em', '0px': '0', '0.2em': '0.2em', '0.45em': '0.45em (Стандарт)', '0.8em': '0.8em', '1em': '1em' }, '0.45em');
        addSelect('m_uator', 'uator_saturation', 'Насыщенность', '',
            { '100%': '100% (Стандарт)', '75%': '75%', '50%': '50%', '25%': '25%', '0%': '0% (Ч/Б)' }, '100%');
        addSelect('m_uator', 'uator_rating_size', 'Размер значков', '',
            { '0.5em': 'XS', '0.8em': 'S', '1.1em': 'M (Стандарт)', '1.5em': 'L', '2.0em': 'XL' }, '1.1em');
    }

    // Запускаем настройки когда приложение готово
    if (window.appready) createSettings();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') createSettings(); });

})();