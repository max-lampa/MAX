/*!
 * Метки на постере (Marks On Poster) — Lampa plugin
 * ----------------------------------------------------
 * Самостоятельный плагин: выводит на постерах фильмов и сериалов
 * информационные метки (озвучки, качество, HDR, IMAX, 3D, рейтинг и т.д.).
 *
 * Источник базовой логики: модуль "Marks Only" из сборки LogoMax
 * (JacRed + UaFix). В этой версии переписан, расширен функционалом
 * и оформлен как полностью независимый плагин.
 *
 * Что нового:
 *   • Главный переключатель плагина (вкл/выкл)
 *   • Больше языков озвучки (DE, FR, ES, IT, JP, KR, PL, CN)
 *   • Доп. качества: 8K, 2K, CAM/TS, BluRay
 *   • Аудио-метки: Dolby Atmos, DTS, AC3
 *   • Спец. метки: IMAX, 3D, NEW (текущий год), Premiere, 18+
 *   • Метка субтитров (SUB)
 *   • Рейтинг с цветовой индикацией (зелёный 8+, жёлтый 6-8, красный <6)
 *   • Настройка прозрачности, жирности шрифта, анимации
 *   • Настройка TTL кэша и кнопка очистки кэша
 *   • Выбор: показывать на фильмах / сериалах / везде
 *   • НОВОЕ: стиль «На постере» — кружки рейтингов (TMDB/IMDb/KP) по углам
 *     и нижняя полоса с пилюлями (4K ULTRA HD, HDR TRUE COLOR,
 *     DOLBY VISION, DOLBY ATMOS, REMUX) — данные из того же парсера JacRed
 */
(function () {
    'use strict';

    if (typeof Lampa === 'undefined') {
        try { console.error('MarksOnPoster: Lampa not found'); } catch (e) {}
        return;
    }

    // ============== КОНСТАНТЫ ==============
    var STORAGE_PREFIX = 'mop_';
    var CACHE_PREFIX   = 'mop_cache_v1_';
    var COMPONENT      = 'marks_on_poster';

    var POSITIONS = {
        'top-left':     'Сверху слева',
        'top-right':    'Сверху справа',
        'bottom-left':  'Снизу слева',
        'bottom-right': 'Снизу справа'
    };

    var SIZES = {
        'small':  'Мелкие',
        'medium': 'Средние',
        'large':  'Крупные',
        'xlarge': 'Очень крупные'
    };

    var RADIUS = {
        'square': 'Без скругления',
        'small':  'Лёгкое',
        'medium': 'Среднее',
        'large':  'Сильное',
        'pill':   'Пилюля'
    };

    var WEIGHTS = {
        '500': 'Обычный',
        '700': 'Полужирный',
        '800': 'Жирный',
        '900': 'Очень жирный'
    };

    var ANIM = {
        'none':  'Без анимации',
        'fade':  'Плавное появление',
        'slide': 'Выезжать сбоку',
        'pop':   'Всплывание'
    };

    var TARGETS = {
        'all':    'На фильмах и сериалах',
        'movie':  'Только на фильмах',
        'tv':     'Только на сериалах'
    };

    var CACHE_TTL_OPTS = {
        '6':   '6 часов',
        '12':  '12 часов',
        '24':  '1 день',
        '48':  '2 дня (по умолчанию)',
        '168': '7 дней',
        '720': '30 дней'
    };

    var OPACITY_OPTS = {
        '1.0': '100% (без прозрачности)',
        '0.9': '90%',
        '0.8': '80%',
        '0.7': '70%',
        '0.6': '60%'
    };

    // ============== ХЕЛПЕРЫ ==============
    function get(key, def) {
        try { return Lampa.Storage.get(STORAGE_PREFIX + key, def); }
        catch (e) { return def; }
    }
    function set(key, val) {
        try { Lampa.Storage.set(STORAGE_PREFIX + key, val); } catch (e) {}
    }

    function isEnabled() { return get('enabled', true); }

    // ============== ПРИМЕНЕНИЕ КЛАССОВ К BODY ==============
    function applyBodyClasses() {
        try {
            var body = document.body;
            if (!body) return;

            body.classList.toggle('mop-off', !isEnabled());
            body.classList.toggle('mop-poster-mode', isEnabled() && get('poster_style', false));
            body.classList.toggle('mop-strip-dim', get('ps_strip_dim', true));

            var pos = get('position', 'top-left');
            Object.keys(POSITIONS).forEach(function (k) {
                body.classList.toggle('mop-pos-' + k, k === pos);
            });

            var size = get('size', 'medium');
            Object.keys(SIZES).forEach(function (k) {
                body.classList.toggle('mop-size-' + k, k === size);
            });

            var rad = get('radius', 'small');
            Object.keys(RADIUS).forEach(function (k) {
                body.classList.toggle('mop-radius-' + k, k === rad);
            });

            var anim = get('anim', 'fade');
            Object.keys(ANIM).forEach(function (k) {
                body.classList.toggle('mop-anim-' + k, k === anim);
            });

            var weight = get('weight', '800');
            document.documentElement.style.setProperty('--mop-weight', weight);

            var opacity = get('opacity', '1.0');
            document.documentElement.style.setProperty('--mop-opacity', opacity);
        } catch (e) {}
    }

    // ============== ОЧИСТКА КЭША ==============
    function clearAllCache() {
        try {
            // Lampa.Storage не даёт списка ключей — обнуляем известные префиксы
            // через перечисление localStorage (если доступен).
            var prefixes = [CACHE_PREFIX, 'jacred_v3_', 'uafix_v2_', 'mop_jacred_', 'mop_uafix_'];
            if (typeof localStorage !== 'undefined') {
                var rm = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (!k) continue;
                    for (var j = 0; j < prefixes.length; j++) {
                        if (k.indexOf(prefixes[j]) === 0) { rm.push(k); break; }
                    }
                }
                rm.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
            }
            _jacredMem = {};
            _uafixMem  = {};
            try {
                Lampa.Noty && Lampa.Noty.show && Lampa.Noty.show('Метки на постере: кэш очищен');
            } catch (e) {}
        } catch (e) {}
    }

    // ============== НАСТРОЙКИ ==============
    function setupSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

        Lampa.SettingsApi.addComponent({
            component: COMPONENT,
            name: 'Метки на постере',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4.8C3 3.81 3.81 3 4.8 3H12V12L8.5 9.7L5 12V4.8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><rect x="11" y="11" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M14 16L15.5 17.5L18.5 14.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        });

        var add = function (cfg) { try { Lampa.SettingsApi.addParam(cfg); } catch (e) {} };

        // ---------- ОБЩИЕ ----------
        add({ component: COMPONENT, param: { type: 'title' }, field: { name: 'Основное' } });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'enabled', type: 'trigger', default: true },
            field: { name: 'Включить плагин', description: 'Глобальный переключатель меток на постерах' },
            onChange: applyBodyClasses
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'target', type: 'select', values: TARGETS, default: 'all' },
            field: { name: 'Где показывать', description: 'На каких карточках выводить метки' }
        });

        // ---------- ПОЛОЖЕНИЕ И ВИД ----------
        add({ component: COMPONENT, param: { type: 'title' }, field: { name: 'Положение и оформление' } });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'position', type: 'select', values: POSITIONS, default: 'top-left' },
            field: { name: 'Сторона карточки', description: 'С какой стороны постера показывать метки' },
            onChange: applyBodyClasses
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'size', type: 'select', values: SIZES, default: 'medium' },
            field: { name: 'Размер меток' },
            onChange: applyBodyClasses
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'radius', type: 'select', values: RADIUS, default: 'small' },
            field: { name: 'Скругление углов' },
            onChange: applyBodyClasses
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'weight', type: 'select', values: WEIGHTS, default: '800' },
            field: { name: 'Жирность шрифта' },
            onChange: applyBodyClasses
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'opacity', type: 'select', values: OPACITY_OPTS, default: '1.0' },
            field: { name: 'Прозрачность меток' },
            onChange: applyBodyClasses
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'anim', type: 'select', values: ANIM, default: 'fade' },
            field: { name: 'Анимация появления' },
            onChange: applyBodyClasses
        });

        // ---------- ЯЗЫКИ ОЗВУЧКИ ----------
        add({ component: COMPONENT, param: { type: 'title' }, field: { name: 'Языки озвучки' } });

        var langs = [
            ['ru', 'Русская озвучка', '🇷🇺', true],
            ['ua', 'Украинская озвучка', '🇺🇦', true],
            ['en', 'Английская озвучка', '🇬🇧', true],
            ['de', 'Немецкая озвучка', '🇩🇪', false],
            ['fr', 'Французская озвучка', '🇫🇷', false],
            ['es', 'Испанская озвучка', '🇪🇸', false],
            ['it', 'Итальянская озвучка', '🇮🇹', false],
            ['pl', 'Польская озвучка', '🇵🇱', false],
            ['jp', 'Японская озвучка', '🇯🇵', false],
            ['kr', 'Корейская озвучка', '🇰🇷', false],
            ['cn', 'Китайская озвучка', '🇨🇳', false]
        ];
        langs.forEach(function (l) {
            add({
                component: COMPONENT,
                param: { name: STORAGE_PREFIX + 'lang_' + l[0], type: 'trigger', default: l[3] },
                field: { name: l[1] + ' (' + l[2] + ')' }
            });
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'sub', type: 'trigger', default: false },
            field: { name: 'Метка субтитров (SUB)' }
        });

        // ---------- КАЧЕСТВО ----------
        add({ component: COMPONENT, param: { type: 'title' }, field: { name: 'Качество' } });

        var quals = [
            ['8k',     '8K',         true],
            ['4k',     '4K (UHD)',   true],
            ['2k',     '2K (1440p)', true],
            ['fhd',    'FHD/HD',     true],
            ['hdr',    'HDR / Dolby Vision', true],
            ['cam',    'CAM / TS (экранки)', false],
            ['bluray', 'BluRay',     false]
        ];
        quals.forEach(function (q) {
            add({
                component: COMPONENT,
                param: { name: STORAGE_PREFIX + 'q_' + q[0], type: 'trigger', default: q[2] },
                field: { name: 'Качество: ' + q[1] }
            });
        });

        // ---------- АУДИО ----------
        add({ component: COMPONENT, param: { type: 'title' }, field: { name: 'Аудио-форматы' } });

        var auds = [
            ['atmos', 'Dolby Atmos', false],
            ['dts',   'DTS',         false],
            ['ac3',   'AC3 / EAC3',  false]
        ];
        auds.forEach(function (a) {
            add({
                component: COMPONENT,
                param: { name: STORAGE_PREFIX + 'a_' + a[0], type: 'trigger', default: a[2] },
                field: { name: a[1] }
            });
        });

        // ---------- СПЕЦИАЛЬНЫЕ ----------
        add({ component: COMPONENT, param: { type: 'title' }, field: { name: 'Специальные метки' } });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 's_imax', type: 'trigger', default: false },
            field: { name: 'IMAX' }
        });
        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 's_3d', type: 'trigger', default: false },
            field: { name: '3D' }
        });
        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 's_new', type: 'trigger', default: true },
            field: { name: 'NEW (выпуск текущего года)' }
        });
        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 's_premiere', type: 'trigger', default: false },
            field: { name: 'Premiere (вышло за последние 30 дней)' }
        });
        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 's_adult', type: 'trigger', default: false },
            field: { name: '18+ (взрослый контент)' }
        });

        // ---------- РЕЙТИНГ ----------
        add({ component: COMPONENT, param: { type: 'title' }, field: { name: 'Рейтинг' } });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'rating', type: 'trigger', default: true },
            field: { name: 'Показывать рейтинг', description: 'TMDB / IMDB / KP — то, что есть в карточке' }
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'rating_color', type: 'trigger', default: true },
            field: { name: 'Цветной рейтинг', description: 'Зелёный 8+, жёлтый 6–8, красный <6' }
        });

        // ---------- КЭШ ----------
        add({ component: COMPONENT, param: { type: 'title' }, field: { name: 'Кэш данных' } });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'cache_ttl', type: 'select', values: CACHE_TTL_OPTS, default: '48' },
            field: { name: 'Срок жизни кэша', description: 'Как долго хранить ответы JacRed/UaFix' }
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'clear_cache', type: 'button' },
            field: { name: 'Очистить кэш меток', description: 'Удаляет сохранённые данные о метках для всех карточек' },
            onChange: clearAllCache
        });

        // ---------- СТИЛЬ "НА ПОСТЕРЕ" ----------
        add({ component: COMPONENT, param: { type: 'title' }, field: { name: 'Бейджи в стиле «постер»' } });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'poster_style', type: 'trigger', default: false },
            field: {
                name: 'Включить стиль «На постере»',
                description: 'Кружки с рейтингами по углам + полоса с пилюлями (4K/HDR/DV/Atmos/REMUX) снизу постера. Данные качества — из парсера JacRed.'
            },
            onChange: applyBodyClasses
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'ps_tmdb', type: 'trigger', default: true },
            field: { name: 'Кружок TMDB (сверху слева)' }
        });
        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'ps_imdb', type: 'trigger', default: true },
            field: { name: 'Кружок IMDb (под TMDB)' }
        });
        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'ps_kp', type: 'trigger', default: true },
            field: { name: 'Кружок Кинопоиска (сверху справа, со 2-й оценкой ниже)' }
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'ps_strip', type: 'trigger', default: true },
            field: { name: 'Нижняя полоса пилюль', description: 'Главный переключатель полосы снизу постера' }
        });

        add({
            component: COMPONENT,
            param: { name: STORAGE_PREFIX + 'ps_strip_dim', type: 'trigger', default: true },
            field: { name: 'Затемнение под нижней полосой', description: 'Лёгкая «подложка» под пилюлями для читаемости' }
        });

        // Отдельные переключатели для каждой пилюли
        add({ component: COMPONENT, param: { type: 'title' }, field: { name: 'Какие пилюли показывать' } });

        var pillToggles = [
            ['pill_8k',     'Пилюля: 8K ULTRA HD',  true],
            ['pill_4k',     'Пилюля: 4K ULTRA HD',  true],
            ['pill_2k',     'Пилюля: 2K (QHD)',     true],
            ['pill_fhd',    'Пилюля: FHD (1080p)',  false],
            ['pill_hd',     'Пилюля: HD (720p)',    false],
            ['pill_hdr',    'Пилюля: HDR / HDR10+', true],
            ['pill_dv',     'Пилюля: DOLBY VISION', true],
            ['pill_atmos',  'Пилюля: DOLBY ATMOS',  true],
            ['pill_truehd', 'Пилюля: TrueHD',       false],
            ['pill_dts',    'Пилюля: DTS / DTS-HD', false],
            ['pill_remux',  'Пилюля: REMUX',        true],
            ['pill_bluray', 'Пилюля: BLURAY',       false],
            ['pill_web',    'Пилюля: WEB-DL',       false]
        ];
        pillToggles.forEach(function (p) {
            add({
                component: COMPONENT,
                param: { name: STORAGE_PREFIX + p[0], type: 'trigger', default: p[2] },
                field: { name: p[1] }
            });
        });
    }

    // ============== ЗАГРУЗКА ДАННЫХ (JacRed + UaFix) ==============
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
            }, function () { tryProxies(url, callback); });
        } catch (e) { tryProxies(url, callback); }
    }

    function tryProxies(url, callback) {
        var list = (workingProxy && workingProxy !== 'direct') ? [workingProxy] : proxies;
        function tryProxy(i) {
            if (i >= list.length) { callback(new Error('No proxy')); return; }
            var p = list[i];
            var target = p.indexOf('url=') > -1 ? p + encodeURIComponent(url) : p + url;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', target, true);
            xhr.timeout = 10000;
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) { workingProxy = p; callback(null, xhr.responseText); }
                else tryProxy(i + 1);
            };
            xhr.onerror   = function () { tryProxy(i + 1); };
            xhr.ontimeout = function () { tryProxy(i + 1); };
            xhr.send();
        }
        tryProxy(0);
    }

    var _jacredMem = {};
    var _uafixMem  = {};

    function cacheTTLms() {
        var hours = parseInt(get('cache_ttl', '48'), 10);
        if (isNaN(hours) || hours <= 0) hours = 48;
        return hours * 60 * 60 * 1000;
    }

    function getJacred(card, callback) {
        if (!card || !card.id) return callback(null);
        var cacheKey = CACHE_PREFIX + 'jacred_' + card.id;
        if (_jacredMem[cacheKey]) { callback(_jacredMem[cacheKey]); return; }

        try {
            var raw = Lampa.Storage.get(cacheKey, '');
            if (raw && typeof raw === 'object' && raw._ts && (Date.now() - raw._ts < cacheTTLms())) {
                _jacredMem[cacheKey] = raw;
                callback(raw);
                return;
            }
        } catch (e) {}

        var title = (card.original_title || card.title || card.name || '').toLowerCase();
        var year  = (card.release_date || card.first_air_date || '').substr(0, 4);
        if (!title || !year) { callback(null); return; }

        var rd = new Date(card.release_date || card.first_air_date);
        if (rd && rd.getTime() > Date.now()) { callback(null); return; }

        var apiUrl = 'https://jr.maxvol.pro/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;

        fetchWithProxy(apiUrl, function (err, data) {
            if (err || !data) { callback(null); return; }
            try {
                var parsed;
                try { parsed = JSON.parse(data); } catch (e) { callback(null); return; }
                if (parsed.contents) { try { parsed = JSON.parse(parsed.contents); } catch (e) {} }
                var results = Array.isArray(parsed) ? parsed : (parsed.Results || []);
                if (!results.length) {
                    var emptyData = { empty: true, _ts: Date.now() };
                    _jacredMem[cacheKey] = emptyData;
                    try { Lampa.Storage.set(cacheKey, emptyData); } catch (e) {}
                    callback(null);
                    return;
                }

                var best = {
                    resolution: 'SD', resolutions: {},
                    langs: {},
                    hdr: false, hdr10plus: false, dolbyVision: false,
                    audio: { atmos: false, dts: false, dtsHd: false, truehd: false, ac3: false },
                    special: { imax: false, threeD: false, bluray: false, cam: false, remux: false, web: false },
                    sub: false
                };
                var resOrder = ['SD','HD','FHD','2K','4K','8K'];

                results.forEach(function (item) {
                    var t = (item.title || '').toLowerCase();

                    // Resolution
                    var cur = 'SD';
                    if (t.indexOf('8k') >= 0 || t.indexOf('4320') >= 0)                    cur = '8K';
                    else if (t.indexOf('4k') >= 0 || t.indexOf('2160') >= 0 || t.indexOf('uhd') >= 0) cur = '4K';
                    else if (t.indexOf('2k') >= 0 || t.indexOf('1440') >= 0)               cur = '2K';
                    else if (t.indexOf('1080') >= 0 || t.indexOf('fhd') >= 0 || t.indexOf('full hd') >= 0) cur = 'FHD';
                    else if (t.indexOf('720')  >= 0 || /\bhd\b/.test(t))                    cur = 'HD';
                    if (resOrder.indexOf(cur) > resOrder.indexOf(best.resolution)) best.resolution = cur;
                    best.resolutions[cur] = true;

                    // Languages
                    if (/(ukr|укр|\bua\b|ukrainian)/.test(t)) best.langs.ua = true;
                    if (/(rus|russian|\bru\b)/.test(t))       best.langs.ru = true;
                    if (/(eng|english|\ben\b|multi)/.test(t)) best.langs.en = true;
                    if (/(\bde\b|deutsch|german)/.test(t))    best.langs.de = true;
                    if (/(\bfr\b|french|francais|français)/.test(t)) best.langs.fr = true;
                    if (/(\bes\b|spanish|español|espanol)/.test(t)) best.langs.es = true;
                    if (/(\bit\b|italian|italiano)/.test(t))  best.langs.it = true;
                    if (/(\bpl\b|polish|polski)/.test(t))     best.langs.pl = true;
                    if (/(\bjp\b|japanese|jpn)/.test(t))      best.langs.jp = true;
                    if (/(\bkr\b|korean|kor)/.test(t))        best.langs.kr = true;
                    if (/(\bcn\b|chinese|chi|mandarin)/.test(t)) best.langs.cn = true;

                    // HDR / DV / HDR10+
                    if (t.indexOf('dolby vision') >= 0 || t.indexOf('dolbyvision') >= 0 || /\bdv\b/.test(t)) {
                        best.hdr = true; best.dolbyVision = true;
                    }
                    if (t.indexOf('hdr10+') >= 0 || t.indexOf('hdr10plus') >= 0) { best.hdr = true; best.hdr10plus = true; }
                    else if (t.indexOf('hdr') >= 0) best.hdr = true;

                    // Audio
                    if (t.indexOf('atmos') >= 0)                  best.audio.atmos  = true;
                    if (t.indexOf('dts-hd') >= 0 || t.indexOf('dts hd') >= 0 || t.indexOf('dts-x') >= 0 || t.indexOf('dts:x') >= 0) {
                        best.audio.dts = true; best.audio.dtsHd = true;
                    } else if (t.indexOf('dts') >= 0)             best.audio.dts    = true;
                    if (t.indexOf('truehd') >= 0 || t.indexOf('true-hd') >= 0 || t.indexOf('true hd') >= 0) best.audio.truehd = true;
                    if (t.indexOf('ac3') >= 0 || t.indexOf('eac3') >= 0 || t.indexOf('e-ac3') >= 0) best.audio.ac3 = true;

                    // Special / source
                    if (t.indexOf('imax') >= 0)                   best.special.imax   = true;
                    if (/\b3d\b/.test(t))                         best.special.threeD = true;
                    if (t.indexOf('remux') >= 0)                  best.special.remux  = true;
                    if (t.indexOf('bluray') >= 0 || t.indexOf('blu-ray') >= 0 || t.indexOf('bdrip') >= 0 || t.indexOf('bd-rip') >= 0) best.special.bluray = true;
                    if (/\b(web-?dl|webrip|web-?rip)\b/.test(t))  best.special.web    = true;
                    if (/\b(cam|camrip|ts|tsrip|hdcam)\b/.test(t)) best.special.cam   = true;

                    // Subtitles
                    if (/(\bsub\b|subbed|subtitles|sublative)/.test(t)) best.sub = true;
                });

                if (card.original_language === 'uk') best.langs.ua = true;
                if (card.original_language === 'ru') best.langs.ru = true;
                if (card.original_language === 'en') best.langs.en = true;

                best._ts = Date.now();
                _jacredMem[cacheKey] = best;
                try { Lampa.Storage.set(cacheKey, best); } catch (e) {}
                callback(best);
            } catch (e) { callback(null); }
        });
    }

    function checkUafix(movie, callback) {
        if (!movie || !movie.id) return callback(false);
        var key = CACHE_PREFIX + 'uafix_' + movie.id;
        if (_uafixMem[key] !== undefined) return callback(_uafixMem[key]);
        var v = Lampa.Storage.get(key, '');
        if (v !== '') {
            var f = (v === 'true' || v === true);
            _uafixMem[key] = f;
            return callback(f);
        }
        var query = movie.original_title || movie.original_name || movie.title || movie.name || '';
        if (!query) { _uafixMem[key] = false; return callback(false); }

        var url = 'https://uafix.net/index.php?do=search&subaction=search&story=' + encodeURIComponent(query);
        fetchWithProxy(url, function (err, html) {
            if (err || !html) { _uafixMem[key] = false; return callback(false); }
            var found = html.indexOf('знайдено') >= 0 && html.indexOf('0 відповідей') < 0;
            _uafixMem[key] = found;
            try { Lampa.Storage.set(key, found ? 'true' : 'false'); } catch (e) {}
            callback(found);
        });
    }

    // ============== ОТРИСОВКА БЕЙДЖЕЙ ==============
    function createBadge(cls, content, opts) {
        var b = document.createElement('div');
        b.classList.add('mop-mark');
        b.classList.add('mop-mark--' + cls);
        if (opts && opts.tone) b.classList.add('mop-tone-' + opts.tone);
        if (typeof content === 'string') b.textContent = content;
        else if (content) b.appendChild(content);
        return b;
    }

    function ratingTone(r) {
        if (r >= 8) return 'green';
        if (r >= 6) return 'yellow';
        return 'red';
    }

    function targetMatches(movie) {
        var t = get('target', 'all');
        if (t === 'all') return true;
        var isTv = !!(movie && (movie.first_air_date || movie.name) && !movie.release_date);
        if (t === 'tv')    return isTv;
        if (t === 'movie') return !isTv;
        return true;
    }

    function renderSpecialBadges(container, movie) {
        // NEW
        if (get('s_new', true)) {
            var year = parseInt((movie.release_date || movie.first_air_date || '').substr(0, 4), 10);
            var curYear = new Date().getFullYear();
            if (year && year === curYear) container.appendChild(createBadge('new', 'NEW'));
        }
        // Premiere (last 30 days)
        if (get('s_premiere', false)) {
            var d = new Date(movie.release_date || movie.first_air_date || '');
            if (!isNaN(d.getTime())) {
                var diff = Date.now() - d.getTime();
                if (diff >= 0 && diff < 30 * 24 * 60 * 60 * 1000) {
                    container.appendChild(createBadge('premiere', 'PREMIERE'));
                }
            }
        }
        // 18+
        if (get('s_adult', false) && movie.adult === true) {
            container.appendChild(createBadge('adult', '18+'));
        }
    }

    function renderQualityBadges(container, data) {
        if (!data) return;
        if (data.resolution === '8K' && get('q_8k', true))      container.appendChild(createBadge('8k', '8K'));
        else if (data.resolution === '4K' && get('q_4k', true)) container.appendChild(createBadge('4k', '4K'));
        else if (data.resolution === '2K' && get('q_2k', true)) container.appendChild(createBadge('2k', '2K'));
        else if (data.resolution === 'FHD' && get('q_fhd', true)) container.appendChild(createBadge('fhd', 'FHD'));
        else if (data.resolution === 'HD'  && get('q_fhd', true)) container.appendChild(createBadge('hd',  'HD'));

        if (data.hdr && get('q_hdr', true)) {
            container.appendChild(createBadge('hdr', data.dolbyVision ? 'DV' : 'HDR'));
        }
        if (data.special) {
            if (data.special.bluray && get('q_bluray', false)) container.appendChild(createBadge('bluray', 'BluRay'));
            if (data.special.cam    && get('q_cam', false))    container.appendChild(createBadge('cam', 'CAM'));
        }
    }

    function renderLangBadges(container, data) {
        if (!data || !data.langs) return;
        var map = {
            ru: '🇷🇺', ua: '🇺🇦', en: '🇬🇧',
            de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸',
            it: '🇮🇹', pl: '🇵🇱',
            jp: '🇯🇵', kr: '🇰🇷', cn: '🇨🇳'
        };
        Object.keys(map).forEach(function (k) {
            if (data.langs[k] && get('lang_' + k, k === 'ru' || k === 'ua' || k === 'en')) {
                container.appendChild(createBadge('lang lang-' + k, map[k]));
            }
        });
        if (data.sub && get('sub', false)) container.appendChild(createBadge('sub', 'SUB'));
    }

    function renderAudioBadges(container, data) {
        if (!data || !data.audio) return;
        if (data.audio.atmos && get('a_atmos', false)) container.appendChild(createBadge('atmos', 'Atmos'));
        if (data.audio.dts   && get('a_dts',   false)) container.appendChild(createBadge('dts',   'DTS'));
        if (data.audio.ac3   && get('a_ac3',   false)) container.appendChild(createBadge('ac3',   'AC3'));
    }

    function renderSpecialFromData(container, data) {
        if (!data || !data.special) return;
        if (data.special.imax   && get('s_imax', false)) container.appendChild(createBadge('imax', 'IMAX'));
        if (data.special.threeD && get('s_3d',   false)) container.appendChild(createBadge('3d',   '3D'));
    }

    function renderRating(container, movie) {
        if (!get('rating', true) || !movie) return;
        var r = parseFloat(movie.imdb_rating || movie.kp_rating || movie.vote_average || 0);
        if (!r || r <= 0) return;
        var tone = get('rating_color', true) ? ratingTone(r) : null;
        var b = document.createElement('div');
        b.classList.add('mop-mark', 'mop-mark--rating');
        if (tone) b.classList.add('mop-tone-' + tone);
        b.innerHTML = '<span class="mop-star">★</span>' + r.toFixed(1);
        container.appendChild(b);
    }

    function renderAll(container, movie, data) {
        // очищаем
        while (container.firstChild) container.removeChild(container.firstChild);

        renderSpecialBadges(container, movie);          // NEW / Premiere / 18+
        renderRating(container, movie);
        renderLangBadges(container, data);
        renderQualityBadges(container, data);
        renderAudioBadges(container, data);
        renderSpecialFromData(container, data);          // IMAX / 3D
    }

    // ============== СТИЛЬ "НА ПОСТЕРЕ" ==============
    function ratingTextColor(r) {
        if (r >= 8) return '#21c87a';
        if (r >= 6) return '#f5c518';
        return '#e53935';
    }

    function makeRatingChip(kind, rating) {
        var wrap = document.createElement('div');
        wrap.className = 'mop-rating-chip mop-rating-chip--' + kind;

        var logo = document.createElement('div');
        logo.className = 'mop-rating-chip__logo mop-rating-chip__logo--' + kind;
        if (kind === 'tmdb') {
            logo.innerHTML = '<span>TMDB</span>';
        } else if (kind === 'imdb') {
            logo.innerHTML = '<span>IMDb</span>';
        } else if (kind === 'kp' || kind === 'kp2') {
            logo.innerHTML = '<svg viewBox="0 0 24 24" width="60%" height="60%" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<circle cx="12" cy="12" r="9" stroke="#0a0a0a" stroke-width="1.4"/>' +
                '<circle cx="12" cy="12" r="2.4" fill="#0a0a0a"/>' +
                '<circle cx="6"  cy="12" r="1.4" fill="#0a0a0a"/>' +
                '<circle cx="18" cy="12" r="1.4" fill="#0a0a0a"/>' +
                '<circle cx="12" cy="6"  r="1.4" fill="#0a0a0a"/>' +
                '<circle cx="12" cy="18" r="1.4" fill="#0a0a0a"/>' +
                '</svg>';
        }
        wrap.appendChild(logo);

        var val = document.createElement('div');
        val.className = 'mop-rating-chip__val';
        val.textContent = (typeof rating === 'number' ? rating.toFixed(1) : rating);
        if (typeof rating === 'number') val.style.color = ratingTextColor(rating);
        wrap.appendChild(val);

        return wrap;
    }

    function makePosterPill(text, sub, mod) {
        var p = document.createElement('div');
        p.className = 'mop-pill mop-pill--' + (mod || 'gen');
        var main = document.createElement('div');
        main.className = 'mop-pill__main';
        main.textContent = text;
        p.appendChild(main);
        if (sub) {
            var s = document.createElement('div');
            s.className = 'mop-pill__sub';
            s.textContent = sub;
            p.appendChild(s);
        }
        return p;
    }

    function ensurePosterOverlay(cardEl) {
        var view = cardEl.querySelector('.card__view') || cardEl;
        var ov = view.querySelector('.mop-poster-overlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.className = 'mop-poster-overlay';
            ov.innerHTML =
                '<div class="mop-poster-overlay__col mop-poster-overlay__col--left"></div>' +
                '<div class="mop-poster-overlay__col mop-poster-overlay__col--right"></div>' +
                '<div class="mop-poster-overlay__strip"></div>';
            view.appendChild(ov);
        }
        return {
            left:  ov.querySelector('.mop-poster-overlay__col--left'),
            right: ov.querySelector('.mop-poster-overlay__col--right'),
            strip: ov.querySelector('.mop-poster-overlay__strip')
        };
    }

    function renderPosterOverlay(cardEl, movie, data) {
        if (!isEnabled() || !get('poster_style', false)) return;
        if (!movie) return;
        var slot = ensurePosterOverlay(cardEl);

        // ----- TOP RATINGS -----
        // Left column: TMDB then IMDb (one under another)
        slot.left.innerHTML = '';
        slot.right.innerHTML = '';

        var tmdb = parseFloat(movie.vote_average || 0);
        var imdb = parseFloat(movie.imdb_rating || 0);
        var kp   = parseFloat(movie.kp_rating || movie.kinopoisk_rating || 0);
        // Fallback "second" rating for the right column when KP is missing —
        // use imdb if available, otherwise just hide the second slot.
        var kp2  = parseFloat(movie.kp_rating_imdb || movie.imdb_rating || 0);

        if (get('ps_tmdb', true) && tmdb > 0) slot.left.appendChild(makeRatingChip('tmdb', tmdb));
        if (get('ps_imdb', true) && imdb > 0) slot.left.appendChild(makeRatingChip('imdb', imdb));

        if (get('ps_kp', true)) {
            if (kp > 0)  slot.right.appendChild(makeRatingChip('kp',  kp));
            if (kp2 > 0 && kp2 !== kp) slot.right.appendChild(makeRatingChip('kp2', kp2));
        }

        // ----- BOTTOM STRIP -----
        slot.strip.innerHTML = '';
        if (!get('ps_strip', true)) return;
        if (!data || data.empty) return;

        // Quality
        if (data.resolution === '8K' && get('pill_8k', true))       slot.strip.appendChild(makePosterPill('8K',  'ULTRA HD', 'res4k'));
        else if (data.resolution === '4K' && get('pill_4k', true))  slot.strip.appendChild(makePosterPill('4K',  'ULTRA HD', 'res4k'));
        else if (data.resolution === '2K' && get('pill_2k', true))  slot.strip.appendChild(makePosterPill('2K',  'QHD',      'res2k'));
        else if (data.resolution === 'FHD' && get('pill_fhd', false)) slot.strip.appendChild(makePosterPill('FHD', '1080p',  'resfhd'));
        else if (data.resolution === 'HD'  && get('pill_hd',  false)) slot.strip.appendChild(makePosterPill('HD',  '720p',   'reshd'));

        // HDR / Dolby Vision
        if (data.hdr && !data.dolbyVision && get('pill_hdr', true)) {
            slot.strip.appendChild(makePosterPill('HDR', data.hdr10plus ? 'HDR10+' : 'TRUE COLOR', 'hdr'));
        }
        if (data.dolbyVision && get('pill_dv', true)) {
            slot.strip.appendChild(makePosterPill('DOLBY', 'VISION', 'dv'));
        }

        // Audio
        if (data.audio && data.audio.atmos && get('pill_atmos', true))         slot.strip.appendChild(makePosterPill('DOLBY', 'ATMOS', 'atmos'));
        else if (data.audio && data.audio.truehd && get('pill_truehd', false)) slot.strip.appendChild(makePosterPill('TRUE', 'HD', 'truehd'));
        else if (data.audio && data.audio.dtsHd && get('pill_dts', false))     slot.strip.appendChild(makePosterPill('DTS', 'HD', 'dts'));
        else if (data.audio && data.audio.dts && get('pill_dts', false))       slot.strip.appendChild(makePosterPill('DTS', null, 'dts'));

        // Source
        if (data.special && data.special.remux && get('pill_remux', true))           slot.strip.appendChild(makePosterPill('REMUX', null, 'remux'));
        else if (data.special && data.special.bluray && get('pill_bluray', false))   slot.strip.appendChild(makePosterPill('BLURAY', null, 'bluray'));
        else if (data.special && data.special.web && get('pill_web', false))         slot.strip.appendChild(makePosterPill('WEB-DL', null, 'web'));
    }

    // ============== ИНТЕГРАЦИЯ С КАРТОЧКАМИ ==============
    function ensureContainer(cardEl) {
        var view = cardEl.querySelector('.card__view') || cardEl;
        var c = view.querySelector('.mop-marks');
        if (!c) {
            c = document.createElement('div');
            c.className = 'mop-marks';
            view.appendChild(c);
        }
        return c;
    }

    function processCard(cardEl) {
        if (!isEnabled()) return;
        if (cardEl.classList.contains('mop-processed')) return;
        cardEl.classList.add('mop-processed');

        var movie = cardEl.heroMovieData
            || (cardEl.card_data || cardEl.item)
            || (typeof $ !== 'undefined' ? $(cardEl).data('item') : null)
            || null;

        if (!movie || !movie.id || movie.size) return;
        if (!targetMatches(movie)) return;

        var container = ensureContainer(cardEl);

        // Сразу покажем спец. метки и рейтинг (без ожидания сети)
        renderSpecialBadges(container, movie);
        renderRating(container, movie);

        // Стиль "На постере" — кружки рейтингов сразу (на основе данных карточки)
        if (get('poster_style', false)) renderPosterOverlay(cardEl, movie, null);

        // Подтянем JacRed
        getJacred(movie, function (data) {
            if (!data) data = { empty: true };
            checkUafix(movie, function (hasUafix) {
                if (hasUafix) { data.langs = data.langs || {}; data.langs.ua = true; data.empty = false; }
                renderAll(container, movie, data);
                if (get('poster_style', false)) renderPosterOverlay(cardEl, movie, data);
            });
        });
    }

    function processAllCards() {
        if (!isEnabled()) return;
        var nodes = document.querySelectorAll('.card:not(.mop-processed)');
        for (var i = 0; i < nodes.length; i++) processCard(nodes[i]);
    }

    function observeCards() {
        try {
            var mo = new MutationObserver(function () { processAllCards(); });
            mo.observe(document.body, { childList: true, subtree: true });
            processAllCards();
        } catch (e) {}
    }

    // ============== МЕТКИ В ПОЛНОЙ КАРТОЧКЕ ==============
    function injectFullCardMarks(movie, renderEl) {
        if (!isEnabled() || !movie || !movie.id || !renderEl) return;
        if (!targetMatches(movie)) return;
        var $r = (typeof $ !== 'undefined') ? $(renderEl) : null;
        if (!$r) return;
        var rateLine = $r.find('.full-start-new__rate-line').first();
        if (!rateLine.length) return;
        if (rateLine.find('.mop-info-marks').length) return;

        var holder = document.createElement('div');
        holder.className = 'mop-info-marks';
        rateLine.prepend(holder);

        getJacred(movie, function (data) {
            if (!data || data.empty) return;
            // Используем тот же стиль, что и Lampa (.full-start__pg) — но обёрнуто в наш holder
            renderInfoLine(holder, data);
        });
    }

    function renderInfoLine(holder, data) {
        function add(text) {
            var el = document.createElement('div');
            el.className = 'full-start__pg mop-info-pg';
            el.textContent = text;
            holder.appendChild(el);
        }
        var lmap = { ru: '🇷🇺', ua: '🇺🇦', en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸', it: '🇮🇹', pl: '🇵🇱', jp: '🇯🇵', kr: '🇰🇷', cn: '🇨🇳' };
        Object.keys(lmap).forEach(function (k) {
            if (data.langs && data.langs[k] && get('lang_' + k, k === 'ru' || k === 'ua' || k === 'en')) add(lmap[k]);
        });
        if (data.resolution && data.resolution !== 'SD') {
            var r = data.resolution;
            if (r === 'FHD') r = '1080p';
            else if (r === 'HD') r = '720p';
            add(r);
        }
        if (data.hdr) add(data.dolbyVision ? 'Dolby Vision' : 'HDR');
        if (data.audio) {
            if (data.audio.atmos && get('a_atmos', false)) add('Atmos');
            if (data.audio.dts   && get('a_dts',   false)) add('DTS');
            if (data.audio.ac3   && get('a_ac3',   false)) add('AC3');
        }
        if (data.special) {
            if (data.special.imax   && get('s_imax', false)) add('IMAX');
            if (data.special.threeD && get('s_3d',   false)) add('3D');
        }
    }

    function initFullCardListener() {
        if (!Lampa.Listener || !Lampa.Listener.follow) return;
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            var movie = e.data && e.data.movie;
            var renderEl = e.object && e.object.activity && e.object.activity.render && e.object.activity.render();
            injectFullCardMarks(movie, renderEl);
        });
    }

    // ============== СТИЛИ ==============
    function injectStyles() {
        var css = '' +
        ':root { --mop-weight: 800; --mop-opacity: 1; }\n' +
        '.card .card__type { left: -0.2em !important; }\n' +
        'body.mop-off .mop-marks, body.mop-off .mop-info-marks { display: none !important; }\n' +

        '.mop-marks {\n' +
        '  position: absolute; display: flex; flex-direction: column; gap: 0.18em;\n' +
        '  z-index: 10; pointer-events: none; max-width: 75%; opacity: var(--mop-opacity);\n' +
        '}\n' +

        // Position defaults
        'body:not(.mop-pos-top-left):not(.mop-pos-top-right):not(.mop-pos-bottom-left):not(.mop-pos-bottom-right) .mop-marks,\n' +
        'body.mop-pos-top-left .mop-marks { top: 2.7em; left: -0.2em; right: auto; bottom: auto; align-items: flex-start; }\n' +
        'body.mop-pos-top-right .mop-marks { top: 2.7em; right: -0.2em; left: auto; bottom: auto; align-items: flex-end; }\n' +
        'body.mop-pos-bottom-left .mop-marks { bottom: 0.6em; left: -0.2em; right: auto; top: auto; align-items: flex-start; }\n' +
        'body.mop-pos-bottom-right .mop-marks { bottom: 0.6em; right: -0.2em; left: auto; top: auto; align-items: flex-end; }\n' +

        // No top ribbon for movies — pull marks higher
        'body:not(.mop-pos-top-left):not(.mop-pos-top-right):not(.mop-pos-bottom-left):not(.mop-pos-bottom-right) .card:not(.card--tv) .mop-marks,\n' +
        'body.mop-pos-top-left  .card:not(.card--tv) .mop-marks,\n' +
        'body.mop-pos-top-right .card:not(.card--tv) .mop-marks { top: 1.4em; }\n' +

        // Base mark
        '.mop-mark {\n' +
        '  padding: 0.35em 0.5em; font-size: 0.8em; font-weight: var(--mop-weight); line-height: 1;\n' +
        '  letter-spacing: 0.03em; border-radius: 0.3em; display: inline-flex; align-items: center;\n' +
        '  justify-content: center; align-self: flex-start; border: 1px solid rgba(255,255,255,0.18);\n' +
        '  color: #fff; background: linear-gradient(135deg, #455a64, #607d8b);\n' +
        '  white-space: nowrap;\n' +
        '}\n' +
        'body.mop-pos-top-right .mop-mark, body.mop-pos-bottom-right .mop-mark { align-self: flex-end; }\n' +

        // Sizes
        'body.mop-size-small  .mop-mark { font-size: 0.65em; padding: 0.25em 0.35em; }\n' +
        'body.mop-size-medium .mop-mark { font-size: 0.80em; padding: 0.35em 0.50em; }\n' +
        'body.mop-size-large  .mop-mark { font-size: 1.00em; padding: 0.45em 0.60em; }\n' +
        'body.mop-size-xlarge .mop-mark { font-size: 1.20em; padding: 0.55em 0.75em; }\n' +
        // Flag-language badges visually need tighter padding
        'body.mop-size-small  .mop-mark--lang { font-size: 0.85em; padding: 0.20em 0.30em; }\n' +
        'body.mop-size-medium .mop-mark--lang { font-size: 1.00em; padding: 0.25em 0.35em; }\n' +
        'body.mop-size-large  .mop-mark--lang { font-size: 1.25em; padding: 0.30em 0.45em; }\n' +
        'body.mop-size-xlarge .mop-mark--lang { font-size: 1.50em; padding: 0.35em 0.55em; }\n' +

        // Radius
        'body.mop-radius-square .mop-mark { border-radius: 0 !important; }\n' +
        'body.mop-radius-small  .mop-mark { border-radius: 0.3em !important; }\n' +
        'body.mop-radius-medium .mop-mark { border-radius: 0.55em !important; }\n' +
        'body.mop-radius-large  .mop-mark { border-radius: 0.85em !important; }\n' +
        'body.mop-radius-pill   .mop-mark { border-radius: 999px !important; }\n' +

        // Animations
        '@keyframes mop-fade { from { opacity: 0; } to { opacity: var(--mop-opacity, 1); } }\n' +
        '@keyframes mop-slide { from { opacity: 0; transform: translateX(-8px); } to { opacity: var(--mop-opacity, 1); transform: none; } }\n' +
        '@keyframes mop-pop  { 0% { opacity: 0; transform: scale(0.6); } 70% { opacity: var(--mop-opacity, 1); transform: scale(1.08); } 100% { transform: scale(1); } }\n' +
        'body.mop-anim-fade  .mop-mark { animation: mop-fade  220ms ease-out both; }\n' +
        'body.mop-anim-slide .mop-mark { animation: mop-slide 240ms ease-out both; }\n' +
        'body.mop-anim-pop   .mop-mark { animation: mop-pop   280ms cubic-bezier(.2,1.4,.4,1) both; }\n' +

        // Color variants
        '.mop-mark--lang-ru { background: linear-gradient(135deg, #b71c1c, #f44336); border-color: rgba(244,67,54,0.4); }\n' +
        '.mop-mark--lang-ua { background: linear-gradient(135deg, #1565c0, #ffd54f); color: #0a2540; border-color: rgba(255,213,79,0.45); }\n' +
        '.mop-mark--lang-en { background: linear-gradient(135deg, #1a237e, #c62828); border-color: rgba(255,255,255,0.2); }\n' +
        '.mop-mark--lang-de { background: linear-gradient(135deg, #000, #d32f2f, #fbc02d); }\n' +
        '.mop-mark--lang-fr { background: linear-gradient(135deg, #0d47a1, #fff, #c62828); color: #0a2540; }\n' +
        '.mop-mark--lang-es { background: linear-gradient(135deg, #d32f2f, #ffc107, #d32f2f); color: #2a1500; }\n' +
        '.mop-mark--lang-it { background: linear-gradient(135deg, #2e7d32, #fff, #c62828); color: #2a1500; }\n' +
        '.mop-mark--lang-pl { background: linear-gradient(135deg, #fff, #c62828); color: #2a1500; }\n' +
        '.mop-mark--lang-jp { background: linear-gradient(135deg, #fff, #c62828); color: #2a1500; }\n' +
        '.mop-mark--lang-kr { background: linear-gradient(135deg, #fff, #1565c0, #c62828); color: #0a2540; }\n' +
        '.mop-mark--lang-cn { background: linear-gradient(135deg, #b71c1c, #ffd54f); color: #2a1500; }\n' +

        '.mop-mark--8k     { background: linear-gradient(135deg, #4a148c, #ce93d8); }\n' +
        '.mop-mark--4k     { background: linear-gradient(135deg, #e65100, #ff9800); border-color: rgba(255,152,0,0.4); }\n' +
        '.mop-mark--2k     { background: linear-gradient(135deg, #6a1b9a, #ba68c8); }\n' +
        '.mop-mark--fhd    { background: linear-gradient(135deg, #4a148c, #ab47bc); border-color: rgba(171,71,188,0.4); }\n' +
        '.mop-mark--hd     { background: linear-gradient(135deg, #1b5e20, #66bb6a); border-color: rgba(102,187,106,0.4); }\n' +
        '.mop-mark--hdr    { background: linear-gradient(135deg, #f57f17, #ffeb3b); color: #000; border-color: rgba(255,235,59,0.4); }\n' +
        '.mop-mark--bluray { background: linear-gradient(135deg, #0d47a1, #42a5f5); }\n' +
        '.mop-mark--cam    { background: linear-gradient(135deg, #424242, #757575); }\n' +

        '.mop-mark--atmos  { background: linear-gradient(135deg, #1a1a1a, #424242); color: #ffd54f; }\n' +
        '.mop-mark--dts    { background: linear-gradient(135deg, #263238, #546e7a); color: #80deea; }\n' +
        '.mop-mark--ac3    { background: linear-gradient(135deg, #263238, #455a64); color: #b0bec5; }\n' +

        '.mop-mark--imax     { background: linear-gradient(135deg, #b71c1c, #ff5252); }\n' +
        '.mop-mark--3d       { background: linear-gradient(135deg, #00695c, #26a69a); }\n' +
        '.mop-mark--new      { background: linear-gradient(135deg, #2e7d32, #66bb6a); color: #fff; }\n' +
        '.mop-mark--premiere { background: linear-gradient(135deg, #ad1457, #ec407a); }\n' +
        '.mop-mark--adult    { background: linear-gradient(135deg, #b71c1c, #d50000); }\n' +
        '.mop-mark--sub      { background: linear-gradient(135deg, #37474f, #607d8b); }\n' +

        '.mop-mark--rating {\n' +
        '  background: linear-gradient(135deg, #1a1a2e, #16213e); color: #ffd700;\n' +
        '  border-color: rgba(255,215,0,0.3); font-size: 0.78em; white-space: nowrap;\n' +
        '}\n' +
        '.mop-mark--rating .mop-star { margin-right: 0.18em; font-size: 0.95em; }\n' +
        '.mop-tone-green  { background: linear-gradient(135deg, #1b5e20, #43a047) !important; color: #fff !important; }\n' +
        '.mop-tone-yellow { background: linear-gradient(135deg, #f9a825, #fbc02d) !important; color: #000 !important; }\n' +
        '.mop-tone-red    { background: linear-gradient(135deg, #b71c1c, #e53935) !important; color: #fff !important; }\n' +

        // Hide native vote when our rating is shown
        '.card.mop-processed .card__vote { display: none !important; }\n' +

        // Info-line in full card
        '.mop-info-marks { display: flex; flex-direction: row; gap: 0.5em; margin-right: 1em; align-items: center; flex-wrap: wrap; }\n' +

        // ================ POSTER STYLE ================
        // В режиме «На постере» прячем боковые столбцы меток
        'body.mop-poster-mode .mop-marks { display: none !important; }\n' +

        '.mop-poster-overlay {\n' +
        '  position: absolute; inset: 0; pointer-events: none; z-index: 9;\n' +
        '  display: none;\n' +
        '}\n' +
        'body.mop-poster-mode .mop-poster-overlay { display: block; }\n' +

        // Угловые столбики
        '.mop-poster-overlay__col {\n' +
        '  position: absolute; top: 0.7em; display: flex; flex-direction: column; gap: 0.55em;\n' +
        '}\n' +
        '.mop-poster-overlay__col--left  { left: 0.7em;  align-items: flex-start; }\n' +
        '.mop-poster-overlay__col--right { right: 0.7em; align-items: flex-end;   }\n' +

        // Кружки-рейтинги
        '.mop-rating-chip {\n' +
        '  display: flex; flex-direction: column; align-items: center;\n' +
        '  width: 3.4em; gap: 0.15em;\n' +
        '  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.55));\n' +
        '}\n' +
        '.mop-rating-chip__logo {\n' +
        '  width: 2.6em; height: 2.6em; border-radius: 50%;\n' +
        '  display: flex; align-items: center; justify-content: center;\n' +
        '  font-weight: 900; font-size: 0.6em; letter-spacing: 0.02em;\n' +
        '  color: #fff; text-align: center; line-height: 1;\n' +
        '  box-shadow: inset 0 0 0 2px rgba(0,0,0,0.25);\n' +
        '}\n' +
        '.mop-rating-chip__logo--tmdb {\n' +
        '  background: radial-gradient(circle at 30% 30%, #5fd4d4, #0d253f 70%);\n' +
        '  color: #fff;\n' +
        '}\n' +
        '.mop-rating-chip__logo--tmdb span { display: inline-block; padding: 0 0.2em; }\n' +
        '.mop-rating-chip__logo--imdb {\n' +
        '  background: #f5c518; color: #000;\n' +
        '}\n' +
        '.mop-rating-chip__logo--kp,\n' +
        '.mop-rating-chip__logo--kp2 {\n' +
        '  background: #f5c518; color: #000;\n' +
        '}\n' +
        '.mop-rating-chip__val {\n' +
        '  font-weight: 900; font-size: 0.95em; line-height: 1;\n' +
        '  background: rgba(0,0,0,0.55); padding: 0.2em 0.5em; border-radius: 999px;\n' +
        '  text-shadow: 0 1px 2px rgba(0,0,0,0.6);\n' +
        '}\n' +

        // Нижняя полоса с пилюлями
        '.mop-poster-overlay__strip {\n' +
        '  position: absolute; left: 0; right: 0; bottom: 0.45em;\n' +
        '  display: flex; flex-wrap: wrap; gap: 0.35em;\n' +
        '  justify-content: center; align-items: center;\n' +
        '  padding: 0.35em 0.4em;\n' +
        '}\n' +
        'body.mop-strip-dim .mop-poster-overlay__strip {\n' +
        '  background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0));\n' +
        '}\n' +
        '.mop-poster-overlay__strip:empty { display: none; }\n' +

        '.mop-pill {\n' +
        '  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;\n' +
        '  background: rgba(255,255,255,0.92); color: #0a0a0a;\n' +
        '  border-radius: 999px; padding: 0.35em 0.7em;\n' +
        '  font-weight: 900; line-height: 1;\n' +
        '  box-shadow: 0 1px 3px rgba(0,0,0,0.35);\n' +
        '  letter-spacing: 0.04em; text-align: center;\n' +
        '  min-width: 2.6em;\n' +
        '}\n' +
        '.mop-pill__main { font-size: 0.78em; }\n' +
        '.mop-pill__sub  { font-size: 0.5em; opacity: 0.75; margin-top: 0.1em; letter-spacing: 0.06em; }\n' +

        // Цветовые акценты
        '.mop-pill--res4k  { background: #ffffff; color: #000; }\n' +
        '.mop-pill--res2k  { background: #ffffff; color: #000; }\n' +
        '.mop-pill--resfhd { background: #ffffff; color: #000; }\n' +
        '.mop-pill--reshd  { background: #ffffff; color: #000; }\n' +
        '.mop-pill--hdr    { background: #ffffff; color: #000; }\n' +
        '.mop-pill--hdr .mop-pill__main { color: #c1991a; }\n' +
        '.mop-pill--dv     { background: #1a1a1a; color: #ffffff; }\n' +
        '.mop-pill--dv .mop-pill__main, .mop-pill--dv .mop-pill__sub { color: #ffffff; }\n' +
        '.mop-pill--atmos  { background: #1a1a1a; color: #ffffff; }\n' +
        '.mop-pill--atmos .mop-pill__main, .mop-pill--atmos .mop-pill__sub { color: #ffffff; }\n' +
        '.mop-pill--truehd { background: #1a1a1a; color: #ffffff; }\n' +
        '.mop-pill--truehd .mop-pill__main, .mop-pill--truehd .mop-pill__sub { color: #ffffff; }\n' +
        '.mop-pill--dts    { background: #1a1a1a; color: #80deea; }\n' +
        '.mop-pill--dts .mop-pill__main, .mop-pill--dts .mop-pill__sub { color: #80deea; }\n' +
        '.mop-pill--remux  { background: #d32f2f; color: #fff; }\n' +
        '.mop-pill--remux .mop-pill__main { color: #fff; }\n' +
        '.mop-pill--bluray { background: #0d47a1; color: #fff; }\n' +
        '.mop-pill--bluray .mop-pill__main { color: #fff; }\n' +
        '.mop-pill--web    { background: #455a64; color: #fff; }\n' +
        '.mop-pill--web .mop-pill__main { color: #fff; }\n' +

        // Адаптация под размер карточек на TV
        'html.is-smarttv .mop-rating-chip { width: 3em; }\n' +
        'html.is-smarttv .mop-rating-chip__logo { width: 2.3em; height: 2.3em; }\n' +
        'html.is-smarttv .mop-pill { padding: 0.3em 0.6em; }\n';

        var style = document.createElement('style');
        style.id = 'mop-styles';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    // ============== ИНИЦИАЛИЗАЦИЯ ==============
    function init() {
        try {
            setupSettings();
            injectStyles();
            applyBodyClasses();
            initFullCardListener();
            observeCards();
        } catch (e) {
            try { console.error('MarksOnPoster init error:', e); } catch (_) {}
        }
    }

    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
