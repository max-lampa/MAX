/*!
 * Netflix UI for Lampa  v1.0.0
 * Backend: lampac-nextgen (https://github.com/lampac-nextgen/lampac)
 * Build:   2026-09-03T11:31:45.004Z
 *
 * Установка: Lampa -> Настройки -> Расширения -> Добавить плагин
 */
(function () {
    'use strict';

    /* ---------- src/config.js ---------- */
    /**
     * Конфигурация плагина.
     * PLACEHOLDER'ы вида {localhost} / {token} подставляет lampac,
     * если файл раздаётся сервером как /netflix_ui.js. При ручной
     * установке они остаются нетронутыми и игнорируются (см. utils.host).
     */
    var NFX = {
        version: '1.0.0',
        id: 'netflix_ui',
        title: 'Netflix UI',

        // Подставляется lampac'ом
        tpl_host: '{localhost}',
        tpl_token: '{token}',

        // Заполняется в utils.detect()
        host: '',
        token: '',

        // Палитра Netflix
        color: {
            red: '#e50914',
            red_dark: '#b20710',
            bg: '#141414',
            bg_soft: '#1b1b1b',
            text: '#ffffff',
            muted: '#b3b3b3',
            grey: 'rgba(109,109,110,0.7)'
        },

        // Жанры TMDB для полок
        genres: {
            movie: [
                { id: 28,    key: 'nfx_g_action' },
                { id: 35,    key: 'nfx_g_comedy' },
                { id: 53,    key: 'nfx_g_thriller' },
                { id: 18,    key: 'nfx_g_drama' },
                { id: 27,    key: 'nfx_g_horror' },
                { id: 878,   key: 'nfx_g_scifi' },
                { id: 16,    key: 'nfx_g_animation' },
                { id: 99,    key: 'nfx_g_documentary' },
                { id: 10749, key: 'nfx_g_romance' },
                { id: 80,    key: 'nfx_g_crime' },
                { id: 12,    key: 'nfx_g_adventure' },
                { id: 14,    key: 'nfx_g_fantasy' }
            ]
        },

        // Сколько полок отдаём за один «шаг» подгрузки
        parts_limit: 5,

        // Кеш ответов TMDB, минуты
        cache: {
            short: 60 * 6,
            long: 60 * 24 * 3
        }
    };

    /* ---------- src/lang.js ---------- */
    /**
     * Локализация. Русский / английский / украинский.
     */
    function langInit(){
        Lampa.Lang.add({
            nfx_title:            { ru: 'Netflix UI',            en: 'Netflix UI',            uk: 'Netflix UI' },
            nfx_settings_descr:   { ru: 'Интерфейс в стиле Netflix', en: 'Netflix-style interface', uk: 'Інтерфейс у стилі Netflix' },

            nfx_param_theme:      { ru: 'Тема Netflix',          en: 'Netflix theme',         uk: 'Тема Netflix' },
            nfx_param_theme_d:    { ru: 'Перекрашивает весь интерфейс Lampa: тёмный фон, красные акценты, плоские карточки', en: 'Repaints the whole Lampa UI: dark background, red accents, flat cards', uk: 'Перефарбовує весь інтерфейс Lampa' },

            nfx_param_home:       { ru: 'Главная в стиле Netflix', en: 'Netflix home screen',  uk: 'Головна у стилі Netflix' },
            nfx_param_home_d:     { ru: 'Заменяет главную страницу на баннер + полки', en: 'Replaces the home page with billboard + rows', uk: 'Замінює головну сторінку' },

            nfx_param_billboard:  { ru: 'Баннер сверху',          en: 'Top billboard',         uk: 'Банер зверху' },
            nfx_param_billboard_d:{ ru: 'Большой промо-блок с трейлером-постером, описанием и кнопками', en: 'Large promo block with artwork, description and buttons', uk: 'Великий промо-блок' },

            nfx_param_rotate:     { ru: 'Автосмена баннера',      en: 'Billboard autoplay',    uk: 'Автозміна банера' },
            nfx_param_shape:      { ru: 'Форма карточек',         en: 'Card shape',            uk: 'Форма карток' },
            nfx_param_shape_wide: { ru: 'Широкие 16:9',           en: 'Wide 16:9',             uk: 'Широкі 16:9' },
            nfx_param_shape_post: { ru: 'Постеры 2:3',            en: 'Posters 2:3',           uk: 'Постери 2:3' },

            nfx_param_titles:     { ru: 'Подписи под карточками', en: 'Titles under cards',    uk: 'Підписи під картками' },

            nfx_param_pin:        { ru: 'Сквозное листание',       en: 'Pin focused card left', uk: 'Суцільне листання' },
            nfx_param_pin_d:      { ru: 'Активная карточка всегда у левого края, полка уезжает под неё — как в Netflix TV. Выключено — карточка центрируется', en: 'The focused card stays at the left edge and the row slides under it, like Netflix TV. Off — the card is centred', uk: 'Активна картка завжди біля лівого краю' },

            nfx_param_trailer:    { ru: 'Трейлер при удержании',  en: 'Trailer on dwell',      uk: 'Трейлер при утриманні' },
            nfx_param_trailer_d:  { ru: 'Если карточка остаётся активной дольше выбранного времени — внутри неё запускается трейлер с YouTube без элементов плеера. Тянет трафик, на телевизорах может не работать', en: 'If a card stays focused longer than the chosen delay, a YouTube trailer plays inside it with no player chrome. Uses traffic, may not work on TVs', uk: 'Якщо картка залишається активною довше — всередині запускається трейлер' },
            nfx_param_trailer_s:  { ru: 'Звук трейлера',          en: 'Trailer sound',         uk: 'Звук трейлера' },
            nfx_param_trailer_s_d:{ ru: 'Трейлер всегда стартует в тишине и плавно набирает громкость. Если браузер запретит звук — останется беззвучным', en: 'The trailer always starts silent and fades the volume in. If the browser blocks sound it stays silent', uk: 'Трейлер завжди стартує в тиші' },

            nfx_param_prefetch:   { ru: 'Подгружать арт заранее',  en: 'Prefetch artwork',      uk: 'Завантажувати арт заздалегідь' },
            nfx_param_prefetch_d: { ru: 'Логотипы и кадры 16:9 тянутся в фоне для соседних карточек — раскрытие происходит сразу. Выключите на медленном соединении', en: 'Logos and 16:9 stills are fetched in the background for nearby cards so expansion is instant. Turn off on a slow connection', uk: 'Логотипи та кадри 16:9 завантажуються у фоні' },

            nfx_param_font:       { ru: 'Шрифт',                  en: 'Typeface',              uk: 'Шрифт' },
            nfx_param_font_d:     { ru: 'Загружается с Google Fonts, кириллица включена. Без сети используется штатный шрифт Lampa', en: 'Loaded from Google Fonts with Cyrillic. Falls back to the stock Lampa font offline', uk: 'Завантажується з Google Fonts' },
            nfx_font_system:      { ru: 'Как в Lampa (SegoeUI)',  en: 'Lampa default (SegoeUI)', uk: 'Як у Lampa (SegoeUI)' },
            nfx_font_gm:          { ru: 'Golos Text + Montserrat (рекомендуется)', en: 'Golos Text + Montserrat (recommended)', uk: 'Golos Text + Montserrat (рекомендовано)' },
            nfx_font_golos:       { ru: 'Golos Text',             en: 'Golos Text',            uk: 'Golos Text' },
            nfx_font_manrope:     { ru: 'Manrope',                en: 'Manrope',               uk: 'Manrope' },
            nfx_font_montserrat: { ru: 'Montserrat',             en: 'Montserrat',            uk: 'Montserrat' },
            nfx_font_inter:       { ru: 'Inter',                   en: 'Inter',                 uk: 'Inter' },
            nfx_font_im:          { ru: 'Inter + Montserrat',      en: 'Inter + Montserrat',    uk: 'Inter + Montserrat' },
            nfx_font_custom:      { ru: 'Свой шрифт',              en: 'Custom',                uk: 'Свій шрифт' },
            nfx_param_font_fam:   { ru: 'Название своего шрифта',  en: 'Custom font family',    uk: 'Назва свого шрифту' },
            nfx_param_font_fam_d: { ru: 'Например Golos Sharp — точное имя семейства из @font-face', en: 'e.g. Golos Sharp — exact family name from @font-face', uk: 'Наприклад Golos Sharp' },
            nfx_param_font_css:   { ru: 'URL CSS со шрифтом',      en: 'Font CSS URL',          uk: 'URL CSS зі шрифтом' },
            nfx_param_font_css_d: { ru: 'Ссылка на css с @font-face. Можно положить файл в wwwroot Lampac', en: 'Link to a css with @font-face. You can host it in Lampac wwwroot', uk: 'Посилання на css з @font-face' },
            nfx_param_top10:      { ru: 'Полки «Топ-10»',         en: 'Top 10 rows',           uk: 'Полиці «Топ-10»' },
            nfx_param_host:       { ru: 'Адрес Lampac',           en: 'Lampac address',        uk: 'Адреса Lampac' },
            nfx_param_host_d:     { ru: 'http://host:9118 — для полок каталогов Lampac. Пусто = определить автоматически', en: 'http://host:9118 — used for Lampac catalog rows. Empty = autodetect', uk: 'http://host:9118' },
            nfx_param_lampac:     { ru: 'Полки каталогов Lampac', en: 'Lampac catalog rows',   uk: 'Полиці каталогів Lampac' },
            nfx_param_lampac_d:   { ru: 'Добавить на главную полки из модуля Catalog (rezka, filmix, kinopub…)', en: 'Add rows from the Catalog module (rezka, filmix, kinopub…)', uk: 'Додати полиці з модуля Catalog' },
            nfx_param_open:       { ru: 'Открыть главную Netflix', en: 'Open Netflix home',    uk: 'Відкрити головну Netflix' },

            nfx_tab_home:         { ru: 'Главная',                en: 'Home',                  uk: 'Головна' },
            nfx_tab_shows:        { ru: 'Сериалы',                en: 'Shows',                 uk: 'Серіали' },
            nfx_tab_movies:       { ru: 'Фильмы',                 en: 'Movies',                uk: 'Фільми' },
            nfx_tab_my:           { ru: 'Моё',                    en: 'My Netflix',            uk: 'Моє' },
            nfx_nav_menu:         { ru: 'Меню Lampa',             en: 'Lampa menu',            uk: 'Меню Lampa' },
            nfx_nav_profiles:     { ru: 'Профили',                en: 'Profiles',              uk: 'Профілі' },
            nfx_param_nav:        { ru: 'Верхнее меню',           en: 'Top navigation',        uk: 'Верхнє меню' },
            nfx_param_nav_d:      { ru: 'Панель с вкладками сверху вместо шапки Lampa. Аватар открывает меню и настройки', en: 'Top tab bar instead of the Lampa header. The avatar opens the menu and settings', uk: 'Панель із вкладками зверху' },
            nfx_param_shape_exp:  { ru: 'Раскрывающиеся (Netflix TV)', en: 'Expanding (Netflix TV)', uk: 'Розкривні (Netflix TV)' },
            nfx_more_all:         { ru: 'Показать все',           en: 'Show all',              uk: 'Показати все' },
            nfx_left:             { ru: 'Осталось %s',            en: '%s left',               uk: 'Залишилось %s' },
            nfx_min:              { ru: 'мин',                    en: 'min',                   uk: 'хв' },
            nfx_hour:             { ru: 'ч',                      en: 'h',                     uk: 'год' },

            nfx_row_continue:     { ru: 'Продолжить просмотр',    en: 'Continue Watching',     uk: 'Продовжити перегляд' },
            nfx_row_liked:        { ru: 'Вам понравилось',        en: "Movies You've Liked",   uk: 'Вам сподобалось' },
            nfx_row_wath:         { ru: 'Хочу посмотреть',        en: 'Want to Watch',         uk: 'Хочу подивитися' },
            nfx_row_history:      { ru: 'История просмотров',     en: 'Viewing History',       uk: 'Історія переглядів' },
            nfx_row_trending_tv:  { ru: 'Сериалы в тренде',       en: 'Trending Shows',        uk: 'Серіали у тренді' },
            nfx_row_trending_movie:{ ru: 'Фильмы в тренде',       en: 'Trending Movies',       uk: 'Фільми у тренді' },
            nfx_row_tv_air:       { ru: 'Сейчас выходят',         en: 'Currently Airing',      uk: 'Зараз виходять' },
            nfx_row_tv_today:     { ru: 'Серии сегодня',          en: 'Airing Today',          uk: 'Серії сьогодні' },
            nfx_row_tv_top:       { ru: 'Лучшие сериалы',         en: 'Top Rated Shows',       uk: 'Найкращі серіали' },
            nfx_row_popular:      { ru: 'Популярное',             en: 'Popular',               uk: 'Популярне' },
            nfx_row_mylist:       { ru: 'Мой список',             en: 'My List',               uk: 'Мій список' },
            nfx_row_trending:     { ru: 'Сейчас в тренде',        en: 'Trending Now',          uk: 'Зараз у тренді' },
            nfx_row_top10_movie:  { ru: 'Топ-10 фильмов сегодня', en: 'Top 10 Movies Today',   uk: 'Топ-10 фільмів сьогодні' },
            nfx_row_top10_tv:     { ru: 'Топ-10 сериалов сегодня',en: 'Top 10 TV Shows Today', uk: 'Топ-10 серіалів сьогодні' },
            nfx_row_new:          { ru: 'Новинки',                en: 'New Releases',          uk: 'Новинки' },
            nfx_row_soon:         { ru: 'Скоро',                  en: 'Coming Soon',           uk: 'Незабаром' },
            nfx_row_tv_popular:   { ru: 'Популярные сериалы',     en: 'Popular TV Shows',      uk: 'Популярні серіали' },
            nfx_row_acclaimed:    { ru: 'Признание критиков',     en: 'Critically Acclaimed',  uk: 'Визнання критиків' },
            nfx_row_because:      { ru: 'Похоже на',              en: 'Because you watched',   uk: 'Схоже на' },

            nfx_g_action:         { ru: 'Боевики',                en: 'Action',                uk: 'Бойовики' },
            nfx_g_comedy:         { ru: 'Комедии',                en: 'Comedies',              uk: 'Комедії' },
            nfx_g_thriller:       { ru: 'Триллеры',               en: 'Thrillers',             uk: 'Трилери' },
            nfx_g_drama:          { ru: 'Драмы',                  en: 'Dramas',                uk: 'Драми' },
            nfx_g_horror:         { ru: 'Ужасы',                  en: 'Horror',                uk: 'Жахи' },
            nfx_g_scifi:          { ru: 'Фантастика',             en: 'Sci-Fi',                uk: 'Фантастика' },
            nfx_g_animation:      { ru: 'Мультфильмы',            en: 'Animation',             uk: 'Мультфільми' },
            nfx_g_documentary:    { ru: 'Документальные',         en: 'Documentaries',         uk: 'Документальні' },
            nfx_g_romance:        { ru: 'Романтика',              en: 'Romance',               uk: 'Романтика' },
            nfx_g_crime:          { ru: 'Криминал',               en: 'Crime',                 uk: 'Кримінал' },
            nfx_g_adventure:      { ru: 'Приключения',            en: 'Adventure',             uk: 'Пригоди' },
            nfx_g_fantasy:        { ru: 'Фэнтези',                en: 'Fantasy',               uk: 'Фентезі' },

            nfx_play:             { ru: 'Смотреть',               en: 'Play',                  uk: 'Дивитися' },
            nfx_info:             { ru: 'Подробнее',              en: 'More Info',             uk: 'Детальніше' },
            nfx_more:             { ru: 'Все',                    en: 'All',                   uk: 'Усі' },
            nfx_match:            { ru: 'совпадение',             en: 'Match',                 uk: 'збіг' },
            nfx_series:           { ru: 'Сериал',                 en: 'Series',                uk: 'Серіал' },
            nfx_movie:            { ru: 'Фильм',                  en: 'Movie',                 uk: 'Фільм' },
            nfx_empty:            { ru: 'Не удалось загрузить каталог', en: 'Failed to load the catalog', uk: 'Не вдалося завантажити каталог' },
            nfx_empty_hint:       { ru: 'Проверьте подключение к сети и адрес Lampac', en: 'Check your network connection and the Lampac address', uk: 'Перевірте підключення та адресу Lampac' },
            nfx_empty_my:         { ru: 'Здесь пока пусто',          en: 'Nothing here yet',      uk: 'Тут поки порожньо' },
            nfx_empty_my_hint:    { ru: 'Добавляйте фильмы и сериалы в «Мой список» — они появятся на этой вкладке вместе с историей просмотров', en: 'Add movies and shows to My List — they will show up on this tab along with your viewing history', uk: 'Додавайте фільми та серіали до «Мого списку»' }
        });
    }

    /* ---------- src/utils.js ---------- */
    /**
     * Утилиты плагина.
     */

    /** Значения настроек по умолчанию (нужны до регистрации SettingsApi) */
    var NFX_DEFAULTS = {
        nfx_theme: true,
        nfx_home: true,
        nfx_nav: true,
        nfx_billboard: true,
        nfx_rotate: '12',
        nfx_shape: 'expand',
        nfx_titles: false,
        nfx_top10: true,
        nfx_prefetch: true,
        nfx_trailer: '0',
        nfx_trailer_sound: false,
        nfx_pin: true,
        nfx_lampac_rows: true,
        nfx_host: '',
        nfx_font: 'golos-montserrat',
        nfx_font_family: '',
        nfx_font_css: ''
    };

    /**
     * Прочитать настройку с безопасным фолбэком.
     * @param {string} name
     * @return {*}
     */
    function pref(name){
        var fallback = NFX_DEFAULTS[name];

        try {
            var value = Lampa.Storage.get(name, fallback + '');

            return typeof value === 'undefined' ? fallback : value;
        }
        catch(e){
            return fallback;
        }
    }

    /**
     * Не является ли строка неподставленным шаблоном lampac ({localhost}).
     * @param {string} value
     * @return {boolean}
     */
    function filled(value){
        return !!value && value.indexOf('{') === -1 && value.indexOf('}') === -1;
    }

    /**
     * Определить адрес Lampac и токен.
     * Приоритет: настройка -> подстановка lampac -> URL самого плагина -> online.js из списка плагинов.
     * @return {void}
     */
    function detectHost(){
        var host = ('' + pref('nfx_host')).trim();

        if(!host && filled(NFX.tpl_host)) host = NFX.tpl_host;

        if(!host) host = hostFromScript();

        if(!host) host = hostFromPlugins();

        NFX.host  = host ? host.replace(/\/+$/, '') : '';
        NFX.token = filled(NFX.tpl_token) ? NFX.tpl_token : '';
    }

    /**
     * Адрес из <script src="...">, которым подключён плагин.
     * @return {string}
     */
    function hostFromScript(){
        var src = '';

        if(document.currentScript && document.currentScript.src) src = document.currentScript.src;

        if(!src){
            var list = document.getElementsByTagName('script');

            for(var i = list.length - 1; i >= 0; i--){
                if(list[i].src && /netflix/i.test(list[i].src)){
                    src = list[i].src;
                    break;
                }
            }
        }

        return src ? origin(src) : '';
    }

    /**
     * Адрес из уже установленных плагинов lampac (online.js / sisi.js / tmdbproxy.js).
     * @return {string}
     */
    function hostFromPlugins(){
        var found = '';

        try {
            var plugins = Lampa.Plugins.get() || [];

            for(var i = 0; i < plugins.length; i++){
                var url = plugins[i].url || '';

                if(/(online|sisi|tmdbproxy|lampainit)(\.js|\/js\/)/i.test(url)){
                    found = origin(url);
                    break;
                }
            }
        }
        catch(e){}

        return found;
    }

    /**
     * Схема + хост + порт из полного URL.
     * @param {string} url
     * @return {string}
     */
    function origin(url){
        var match = ('' + url).match(/^(https?:)?\/\/[^\/]+/i);

        return match ? match[0] : '';
    }

    /**
     * Дописать к URL параметры авторизации lampac.
     * @param {string} url
     * @return {string}
     */
    function account(url){
        url = url + '';

        if(url.indexOf('account_email=') === -1){
            var email = Lampa.Storage.get('account_email');

            if(email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
        }

        if(url.indexOf('uid=') === -1){
            var uid = Lampa.Storage.get('lampac_unic_id', '');

            if(uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
        }

        if(url.indexOf('token=') === -1 && NFX.token){
            url = Lampa.Utils.addUrlComponent(url, 'token=' + encodeURIComponent(NFX.token));
        }

        return url;
    }

    /**
     * Картинка TMDB нужного размера через прокси Lampa/Lampac.
     * @param {string} path
     * @param {string} size
     * @return {string}
     */
    function img(path, size){
        if(!path) return '';

        if(/^https?:/i.test(path)) return path;

        try {
            return Lampa.TMDB.image('t/p/' + (size || 'w500') + path);
        }
        catch(e){
            return 'https://image.tmdb.org/t/p/' + (size || 'w500') + path;
        }
    }

    /**
     * Подобрать иллюстрацию для карточки с учётом выбранной формы.
     * @param {object} card
     * @param {boolean} wide
     * @return {string}
     */
    function cardImage(card, wide){
        if(!card) return '';

        if(wide){
            if(card.backdrop_path) return img(card.backdrop_path, 'w780');
            if(card.poster_path)   return img(card.poster_path, 'w500');
        }
        else {
            if(card.poster_path)   return img(card.poster_path, 'w500');
            if(card.backdrop_path) return img(card.backdrop_path, 'w780');
        }

        if(card.profile_path) return img(card.profile_path, 'w300');

        return card.poster || card.img || card.background_image || '';
    }

    /**
     * Крупный фон для баннера.
     * @param {object} card
     * @return {string}
     */
    function heroImage(card){
        if(!card) return '';

        if(card.backdrop_path) return img(card.backdrop_path, 'w1280');
        if(card.poster_path)   return img(card.poster_path, 'w780');

        return '';
    }

    /**
     * Название карточки.
     * @param {object} card
     * @return {string}
     */
    function cardTitle(card){
        return card.title || card.name || card.original_title || card.original_name || '';
    }

    /**
     * Год выпуска.
     * @param {object} card
     * @return {string}
     */
    function cardYear(card){
        var date = card.release_date || card.first_air_date || card.birthday || '';

        return ('' + date).slice(0, 4);
    }

    /**
     * Netflix-style «% совпадения» — считаем из рейтинга TMDB.
     * @param {object} card
     * @return {number} 0 если рейтинга нет
     */
    function matchPercent(card){
        var vote = parseFloat(card.vote_average || 0);

        if(!vote) return 0;

        // 5.0 -> 50%, 10.0 -> 99%
        return Math.max(35, Math.min(99, Math.round(vote * 9.9)));
    }

    /**
     * Возрастной рейтинг по данным TMDB (грубая оценка, если нет releases).
     * @param {object} card
     * @return {string}
     */
    function ageLimit(card){
        if(card.adult) return '18+';

        var genres = card.genre_ids || [];

        if(indexOf(genres, 27) > -1 || indexOf(genres, 53) > -1) return '18+';
        if(indexOf(genres, 16) > -1 || indexOf(genres, 10751) > -1) return '0+';
        if(indexOf(genres, 28) > -1 || indexOf(genres, 80) > -1) return '16+';

        return '12+';
    }

    /**
     * Тип карточки.
     * @param {object} card
     * @return {boolean} true если сериал
     */
    function isSerial(card){
        return !!(card.name || card.original_name || card.first_air_date || card.number_of_seasons);
    }

    /**
     * Названия жанров через запятую.
     * @param {object} card
     * @return {string}
     */
    function genreNames(card){
        var ids = card.genre_ids || [];

        if(!ids.length) return '';

        try {
            var names = Lampa.Api.sources.tmdb.getGenresNameFromIds(isSerial(card) ? 'tv' : 'movie', ids.slice(0, 3));

            return names.join(' • ');
        }
        catch(e){
            return '';
        }
    }

    /** indexOf для массива без Array.prototype.indexOf на древних движках */
    function indexOf(list, value){
        if(!list) return -1;

        for(var i = 0; i < list.length; i++){
            if(list[i] === value) return i;
        }

        return -1;
    }

    /** Уникализация карточек по id */
    function uniqueCards(list){
        var seen = {};
        var out  = [];

        for(var i = 0; i < list.length; i++){
            var card = list[i];

            if(!card) continue;

            var key = (card.id || '') + ':' + (isSerial(card) ? 'tv' : 'mv');

            if(seen[key]) continue;

            seen[key] = true;
            out.push(card);
        }

        return out;
    }

    /** Обрезать текст */
    function cut(text, limit){
        text = ('' + (text || '')).replace(/\s+/g, ' ');

        return text.length > limit ? text.slice(0, limit - 1) + '…' : text;
    }

    /** Экранирование для вставки в HTML */
    function esc(text){
        return ('' + (text || ''))
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * Открыть полную карточку. Router появился не во всех сборках Lampa.
     * @param {object} card
     */
    function openCard(card){
        // Уходим с экрана — трейлер в карточке больше не нужен
        trailerStop();

        if(Lampa.Router && typeof Lampa.Router.call === 'function'){
            return Lampa.Router.call('full', card);
        }

        Lampa.Activity.push({
            url: '',
            component: 'full',
            id: card.id,
            method: isSerial(card) ? 'tv' : 'movie',
            card: card,
            source: card.source || 'tmdb'
        });
    }

    /**
     * Порционная загрузка полок. В старых сборках Lampa.Api.partNext отсутствует.
     * @param {array} parts массив функций function(call)
     * @param {number} limit
     * @param {function} loaded
     * @param {function} empty
     */
    function partNext(parts, limit, loaded, empty){
        if(Lampa.Api && typeof Lampa.Api.partNext === 'function'){
            return Lampa.Api.partNext(parts, limit, loaded, empty);
        }

        var pieces = [];

        for(var i = 0; i < parts.length && pieces.length < limit; i++){
            if(typeof parts[i] === 'function') pieces.push(i);
        }

        if(!pieces.length) return empty();

        var results = [];
        var waiting = pieces.length;

        pieces.forEach(function(index){
            var call = parts[index];

            parts[index] = false;

            var done = function(json){
                if(json && json.results && json.results.length) results.push(json);

                waiting--;

                if(waiting) return;

                if(results.length) loaded(results);
                else partNext(parts, limit, loaded, empty);
            };

            try { call(done); }
            catch(e){ done(); }
        });
    }

    /** Перевод с фолбэком на сам ключ */
    function tr(key){
        var value = Lampa.Lang.translate(key);

        return value === key ? key : value;
    }

    /* ---------- src/theme.js ---------- */
    /**
     * Стили. Два независимых блока:
     *   nfx-core  — стили собственных компонентов плагина (всегда)
     *   nfx-theme — переоформление всего интерфейса Lampa (по настройке)
     */

    /** Собственные компоненты плагина */
    function cssCore(){
        return [
    '.nfx{position:relative;color:#fff}',
    '.nfx *{box-sizing:border-box}',

    /* главная Netflix: убираем отступ под шапку, шапка становится градиентом */
    'body.nfx--home .wrap__content{padding-top:0}',
    'body.nfx--home .head{background:linear-gradient(180deg,rgba(0,0,0,.8) 0,rgba(0,0,0,.35) 55%,rgba(0,0,0,0) 100%);border:0}',
    'body.nfx--home .background__one,body.nfx--home .background__two{opacity:0}',
    'body.nfx--home .head__title{display:none}',
    'body.nfx--nav .head{display:none}',

    /* ---------- баннер ---------- */
    '.nfx-bb{position:relative;height:72vh;min-height:24em;margin:0 0 -4.5em 0;overflow:hidden}',
    '.nfx-bb--noart{height:auto;min-height:0;margin-bottom:1em}',
    '.nfx-bb__art,.nfx-bb__art-next{position:absolute;top:0;left:0;width:100%;height:100%;background-repeat:no-repeat;background-position:center 18%;background-size:cover;transition:opacity .8s ease}',
    '.nfx-bb__art-next{opacity:0}',
    '.nfx-bb--swap .nfx-bb__art{opacity:0}',
    '.nfx-bb--swap .nfx-bb__art-next{opacity:1}',
    '.nfx-bb__scrim{position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(77deg,rgba(0,0,0,.85) 0,rgba(0,0,0,.55) 42%,rgba(0,0,0,0) 78%)}',
    '.nfx-bb__scrim-b{position:absolute;left:0;right:0;bottom:0;height:52%;background:linear-gradient(180deg,rgba(20,20,20,0) 0,rgba(20,20,20,.65) 52%,#141414 100%)}',
    '.nfx-bb__info{position:absolute;left:3em;bottom:9em;width:44%;min-width:18em;z-index:2}',
    '.nfx-bb--noart .nfx-bb__info{position:relative;left:0;bottom:0;width:auto;padding:2em 3em 0}',
    '.nfx-bb__brand{display:flex;align-items:center;font-size:.85em;letter-spacing:.24em;text-transform:uppercase;color:#e5e5e5;margin-bottom:.7em}',
    '.nfx-bb__logo{max-width:70%;max-height:6.5em;margin-bottom:.5em;display:block}',
    '.nfx-bb__title{font-size:3.4em;line-height:1.02;font-weight:900;letter-spacing:-.02em;text-shadow:0 .08em .3em rgba(0,0,0,.55);margin-bottom:.25em;max-height:2.1em;overflow:hidden}',
    '.nfx-bb__meta{display:flex;align-items:center;flex-wrap:wrap;font-size:1.15em;margin-bottom:.7em;color:#e5e5e5}',
    '.nfx-bb__meta > *{margin-right:.9em}',
    '.nfx-bb__match{color:#46d369;font-weight:700}',
    '.nfx-bb__age{border:1px solid rgba(255,255,255,.45);padding:0 .35em;font-size:.85em;line-height:1.5}',
    '.nfx-bb__descr{font-size:1.25em;line-height:1.35;color:#fff;text-shadow:0 .1em .3em rgba(0,0,0,.6);max-height:4.1em;overflow:hidden;margin-bottom:1em}',
    '.nfx-bb__buttons{display:flex;align-items:center}',
    '.nfx-bb__dots{position:absolute;right:3em;bottom:9.5em;display:flex;z-index:2}',
    '.nfx-bb__dot{width:.55em;height:.55em;border-radius:50%;background:rgba(255,255,255,.35);margin-left:.5em}',
    '.nfx-bb__dot--on{background:#e50914}',

    /* ---------- кнопки ---------- */
    '.nfx-btn{display:flex;align-items:center;height:2.7em;padding:0 1.5em;margin-right:.8em;border-radius:.22em;font-size:1.2em;font-weight:700;background:rgba(109,109,110,.75);color:#fff;white-space:nowrap}',
    '.nfx-btn svg{width:1.35em;height:1.35em;margin-right:.6em;flex-shrink:0}',
    '.nfx-btn--play{background:#fff;color:#000}',
    '.nfx-btn.focus,.nfx-btn.hover{background:#e50914;color:#fff;box-shadow:0 0 0 .16em rgba(255,255,255,.9)}',
    '.nfx-btn--play.focus,.nfx-btn--play.hover{background:rgba(255,255,255,.75);color:#000}',

    /* ---------- полки ---------- */
    '.nfx-rows{position:relative;z-index:3}',
    '.nfx-row{padding-bottom:.4em;padding-top:7em;margin-top:-7em;pointer-events:none}',
    '.nfx-row__head,.nfx-row__body,.nfx-row__meta{pointer-events:auto}',
    '.nfx-row__head{display:flex;align-items:center;padding:0 3em;margin-bottom:.35em}',
    '.nfx-row__title{font-size:1.45em;font-weight:700;color:#e5e5e5;letter-spacing:.01em;opacity:.62;transition:opacity .25s}',
    '.nfx-row--active .nfx-row__title{opacity:1}',
    '.nfx-row__more{margin-left:1em;font-size:.95em;color:#e50914;opacity:0;padding:.2em .7em;border-radius:.2em;transition:opacity .25s}',
    '.nfx-row--active .nfx-row__more{opacity:1}',
    '.nfx-row__more.focus{background:#e50914;color:#fff;opacity:1}',
    '.nfx-row__body .scroll__content{padding:.9em 3em}',
    '.nfx-row__body .scroll__body{display:flex}',

    /* ---------- верхняя панель ---------- */
    '.nfx-nav{position:absolute;top:0;left:0;right:0;height:5.4em;display:flex;align-items:center;padding:0 3em;z-index:30;background:linear-gradient(180deg,rgba(0,0,0,.9) 0,rgba(0,0,0,.45) 60%,rgba(0,0,0,0) 100%)}',
    '.nfx-nav__side{flex:0 0 auto;display:flex;align-items:center;min-width:9em}',
    '.nfx-nav__side--right{justify-content:flex-end}',
    '.nfx-nav__center{flex:1 1 auto;display:flex;align-items:center;justify-content:center}',
    '.nfx-nav__profile{display:flex;align-items:center;padding:.3em;border-radius:.3em}',
    '.nfx-nav__avatar{width:2.1em;height:2.1em;border-radius:.25em;overflow:hidden;flex-shrink:0}',
    '.nfx-nav__avatar svg,.nfx-nav__avatar img{width:100%;height:100%;display:block;object-fit:cover}',
    '.nfx-nav__caret{margin-left:.45em;font-size:.8em;color:#fff;opacity:.85}',
    '.nfx-nav__profile.focus,.nfx-nav__profile.hover{box-shadow:0 0 0 .14em #fff}',
    '.nfx-nav__item{font-size:1.3em;font-weight:500;color:#e5e5e5;padding:.42em 1.1em;margin:0 .25em;border-radius:2em;white-space:nowrap;line-height:1.2}',
    '.nfx-nav__item--icon{display:flex;align-items:center;justify-content:center;padding:.42em .7em}',
    '.nfx-nav__item--icon svg{width:1.35em;height:1.35em;display:block}',
    '.nfx-nav__item--active{background:#fff;color:#000;font-weight:700}',
    '.nfx-nav__item.focus,.nfx-nav__item.hover{background:#fff;color:#000;font-weight:700}',
    '.nfx-nav__item.focus svg,.nfx-nav__item.hover svg{color:#000}',

    /* без баннера полки начинаются под панелью */
    '.nfx--no-hero .nfx-rows{padding-top:6.4em}',

    /* ---------- карточка ---------- */
    '.nfx-card{flex-shrink:0;width:13.2em;margin-right:.5em;position:relative}',
    '.nfx-card__view{position:relative;padding-bottom:56.25%;border-radius:.25em;overflow:hidden;background:#2b2b2b;transition:transform .25s ease,box-shadow .25s ease;transform-origin:center center;will-change:transform}',
    '.nfx-card__img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .4s}',
    '.nfx-card__img--loaded{opacity:1}',
    '.nfx-card__img--fallback{object-position:center 28%}',
    '.nfx-card__grad{position:absolute;left:0;right:0;bottom:0;height:55%;background:linear-gradient(180deg,rgba(0,0,0,0) 0,rgba(0,0,0,.8) 100%);opacity:0;transition:opacity .25s}',
    '.nfx-card__label{position:absolute;left:.6em;right:.6em;bottom:.5em;font-size:.95em;font-weight:700;line-height:1.15;max-height:2.4em;overflow:hidden;opacity:0;transition:opacity .25s;text-shadow:0 1px 2px rgba(0,0,0,.8)}',
    '.nfx-card__badge{position:absolute;top:.4em;left:.4em;background:#e50914;color:#fff;font-size:.7em;font-weight:900;letter-spacing:.08em;padding:.2em .45em;border-radius:.15em}',
    '.nfx-card__vote{position:absolute;top:.4em;right:.4em;background:rgba(0,0,0,.7);color:#46d369;font-size:.8em;font-weight:700;padding:.15em .4em;border-radius:.15em}',
    '.nfx-card__progress{position:absolute;left:.5em;right:.5em;bottom:.45em;height:.22em;background:rgba(255,255,255,.3);border-radius:.2em;overflow:hidden}',
    '.nfx-card__progress > div{height:100%;background:#e50914}',
    '.nfx-card--more .nfx-card__view{background:rgba(109,109,110,.28)}',
    '.nfx-card--more.focus .nfx-card__view,.nfx-card--more.hover .nfx-card__view{background:rgba(255,255,255,.16)}',
    '.nfx-card__more-ico{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;font-size:3.2em;font-weight:300;opacity:.85}',
    '.nfx-card__title{margin-top:.45em;font-size:.95em;line-height:1.2;max-height:2.4em;overflow:hidden;color:#b3b3b3}',
    '.nfx-card.focus .nfx-card__view,.nfx-card.hover .nfx-card__view{transform:scale(1.08);box-shadow:0 0 0 .14em #fff,0 1.1em 2em rgba(0,0,0,.75);z-index:5}',
    '.nfx-card.focus .nfx-card__grad,.nfx-card.focus .nfx-card__label,.nfx-card.hover .nfx-card__grad,.nfx-card.hover .nfx-card__label{opacity:1}',
    '.nfx-card.focus .nfx-card__title{color:#fff}',

    /* ---------- expand: фокусная карточка раскрывается в 16:9 ---------- */
    /* ширину НЕ анимируем: transition ломает расчёт позиции скролла, */
    /* плавность даёт кроссфейд кадров и оверлея */
    '.nfx-row--expand .nfx-card{width:11.6em;height:17.5em;margin-right:.5em}',
    '.nfx-row--expand .nfx-card__view{position:absolute;top:0;left:0;right:0;bottom:0;padding-bottom:0;transition:box-shadow .2s ease}',
    '.nfx-row--expand .nfx-card.focus{width:31em}',

    /* мышь: раскрываем поверх соседей — полка не перекладывается,
       поэтому здесь ширину можно анимировать без вреда для скролла */
    '.nfx-row--expand .nfx-card--over.focus,.nfx-row--expand .nfx-card--over.hover{width:11.6em;z-index:20}',
    '.nfx-row--expand .nfx-card--over.focus .nfx-card__view,.nfx-row--expand .nfx-card--over.hover .nfx-card__view{width:31em;right:auto;transition:width .22s ease,box-shadow .2s ease}',
    '.nfx-row--expand .nfx-card.focus .nfx-card__view,.nfx-row--expand .nfx-card.hover .nfx-card__view{transform:none;box-shadow:0 0 0 .16em #fff,0 1.2em 2.2em rgba(0,0,0,.8)}',
    '.nfx-card__img-wide{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .3s}',
    '.nfx-row--expand .nfx-card.focus .nfx-card__img-wide.nfx-card__img--loaded{opacity:1}',
    /* трейлер: iframe масштабируем и кропаем, как object-fit:cover,
       иначе YouTube добавляет чёрные поля под свои пропорции */
    '.nfx-card__trailer{position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;z-index:2;opacity:0;transition:opacity .5s ease;pointer-events:none;background:#000}',
    '.nfx-card__trailer--on{opacity:1}',
    '.nfx-card__trailer > div,.nfx-card__trailer iframe{position:absolute;top:50%;left:50%;width:100%;height:100%;border:0;-webkit-transform:translate(-50%,-50%) scale(1.24);transform:translate(-50%,-50%) scale(1.24)}',
    '.nfx-card__shade{position:absolute;left:0;right:0;bottom:0;height:70%;background:linear-gradient(180deg,rgba(0,0,0,0) 0,rgba(0,0,0,.15) 40%,rgba(0,0,0,.85) 100%);opacity:0;transition:opacity .3s}',
    '.nfx-row--expand .nfx-card.focus .nfx-card__shade{opacity:1}',
    '.nfx-card__shade{z-index:3}',
    '.nfx-card__promo{position:absolute;left:1.1em;right:1.1em;bottom:1.1em;opacity:0;transition:opacity .3s;z-index:4}',
    '.nfx-row--expand .nfx-card.focus .nfx-card__promo{opacity:1}',
    '.nfx-card__kind{display:flex;align-items:center;font-size:.75em;letter-spacing:.22em;text-transform:uppercase;color:#e5e5e5;margin-bottom:.4em}',
    '.nfx-card__titlebox{position:relative;height:3.6em}',
    '.nfx-card__logo{position:absolute;left:0;bottom:0;height:3.6em;width:auto;max-width:70%;object-fit:contain;object-position:left bottom;opacity:0;transition:opacity .25s}',
    '.nfx-card__logo--on{opacity:1}',
    '.nfx-card__name{position:absolute;left:0;right:0;bottom:0;font-size:1.9em;font-weight:900;line-height:.98;letter-spacing:-.015em;text-transform:uppercase;max-height:2.94em;overflow:hidden;text-shadow:0 .06em .3em rgba(0,0,0,.85);transition:opacity .25s}',
    '.nfx-card__name--off{opacity:0}',
    '.nfx-card__name--long{font-size:1.5em;letter-spacing:-.01em}',
    '.nfx-card__name--xlong{font-size:1.2em;letter-spacing:0;line-height:1.05;max-height:3.15em}',
    '.nfx-row--expand .nfx-card__progress{left:0;right:0;bottom:0;height:.28em;border-radius:0;background:rgba(255,255,255,.28);z-index:5}',
    '.nfx-row--expand .nfx-card--more{width:11.6em;height:17.5em}',

    /* нет кадра 16:9: постер слева на градиенте, название справа */
    '.nfx-row--expand .nfx-card--noart.focus .nfx-card__view,.nfx-row--expand .nfx-card--noart.hover .nfx-card__view,.nfx-row--expand .nfx-card--pending.focus .nfx-card__view,.nfx-row--expand .nfx-card--pending.hover .nfx-card__view{background:linear-gradient(100deg,#232323 0,#0d0d0d 100%)}',
    '.nfx-row--expand .nfx-card--noart.focus .nfx-card__img,.nfx-row--expand .nfx-card--noart.hover .nfx-card__img,.nfx-row--expand .nfx-card--pending.focus .nfx-card__img,.nfx-row--expand .nfx-card--pending.hover .nfx-card__img{width:37.6%;right:auto}',
    '.nfx-row--expand .nfx-card--noart.focus .nfx-card__shade,.nfx-row--expand .nfx-card--noart.hover .nfx-card__shade,.nfx-row--expand .nfx-card--pending.focus .nfx-card__shade,.nfx-row--expand .nfx-card--pending.hover .nfx-card__shade{display:none}',
    '.nfx-row--expand .nfx-card--noart.focus .nfx-card__promo,.nfx-row--expand .nfx-card--noart.hover .nfx-card__promo,.nfx-row--expand .nfx-card--pending.focus .nfx-card__promo,.nfx-row--expand .nfx-card--pending.hover .nfx-card__promo{left:42%;right:1.4em;bottom:auto;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}',

    /* постер и кадр меняются кроссфейдом: переход, а не загрузка */
    '.nfx-card__img{transition:opacity .35s ease,width .35s ease}',
    '.nfx-row--expand .nfx-card.focus .nfx-card__img-wide.nfx-card__img--loaded ~ .nfx-card__shade{opacity:1}',
    '.nfx-row--expand .nfx-card.focus:not(.nfx-card--noart):not(.nfx-card--pending) .nfx-card__img,.nfx-row--expand .nfx-card.hover:not(.nfx-card--noart):not(.nfx-card--pending) .nfx-card__img{opacity:0}',

    /* строка метаданных под полкой */
    '.nfx-row__meta{padding:.7em 3em 0;min-height:4.9em}',
    '.nfx-row__meta-1{font-size:1.05em;font-weight:700;color:#fff;line-height:1.25;max-height:1.3em;overflow:hidden}',
    '.nfx-row__meta-2{font-size:1.05em;color:#b3b3b3;margin-top:.35em;line-height:1.35;max-height:2.7em;overflow:hidden}',

    /* постеры 2:3 */
    '.nfx-row--poster .nfx-card{width:10.6em}',
    '.nfx-row--poster .nfx-card__view{padding-bottom:150%}',

    /* Топ-10: номер абсолютным слоем — em внутри flex-basis считается от своего font-size, поэтому только padding/width родителя */
    '.nfx-row--top .nfx-card{width:17em;position:relative;padding-left:8.6em}',
    '.nfx-row--top .nfx-card__rank{position:absolute;left:0;top:0;bottom:0;width:9.2em;display:flex;align-items:flex-end;justify-content:flex-end;overflow:hidden;z-index:1}',
    '.nfx-row--top .nfx-card__rank > span{font-family:Arial,Helvetica,sans-serif;font-weight:900;font-size:11.6em;line-height:.8;letter-spacing:-.06em;color:#141414;-webkit-text-stroke:.028em #6d6d6e;white-space:nowrap;transition:-webkit-text-stroke-color .25s}',
    '.nfx-row--top .nfx-card__box{position:relative;z-index:2}',
    '.nfx-row--top .nfx-card__view{padding-bottom:150%}',
    '.nfx-row--top .nfx-card__title{display:none}',
    '.nfx-row--top .nfx-card.focus .nfx-card__rank > span,.nfx-row--top .nfx-card.hover .nfx-card__rank > span{-webkit-text-stroke-color:#fff}',

    /* ---------- служебное ---------- */
    '.nfx-empty{padding:7em 3em 4em;text-align:center;max-width:34em;margin:0 auto}',
    '.nfx-empty__title{font-size:2em;font-weight:800;color:#fff;margin-bottom:.5em}',
    '.nfx-empty__hint{font-size:1.2em;line-height:1.4;color:#8c8c8c}',
    '.nfx-load{padding:3em;text-align:center;color:#6d6d6e}',
    '.nfx-spinner{display:inline-block;width:1.6em;height:1.6em;border:.18em solid rgba(229,9,20,.25);border-top-color:#e50914;border-radius:50%;animation:nfx-spin .8s linear infinite}',
    '@keyframes nfx-spin{to{transform:rotate(360deg)}}',

    /* невысокие экраны: 720p ТВ и окно браузера — иначе блок уезжает под шапку */
    '@media screen and (max-height:820px){',
      '.nfx-row{padding-top:5.4em;margin-top:-5.4em}',
      '.nfx-row--expand .nfx-card{width:10.4em;height:15.6em}',
      '.nfx-row--expand .nfx-card.focus{width:27.7em}',
      '.nfx-row--expand .nfx-card--over.focus,.nfx-row--expand .nfx-card--over.hover{width:10.4em}',
      '.nfx-row--expand .nfx-card--over.focus .nfx-card__view,.nfx-row--expand .nfx-card--over.hover .nfx-card__view{width:27.7em}',
      '.nfx-row--expand .nfx-card--more{width:10.4em;height:15.6em}',
      '.nfx-bb{height:78vh}',
      '.nfx-bb__info{bottom:6em}',
      '.nfx-bb__dots{bottom:6.5em}',
      '.nfx-bb__logo{max-height:4.6em}',
      '.nfx-bb__title{font-size:2.7em}',
      '.nfx-bb__descr{font-size:1.15em;max-height:4.05em}',
    '}',

    /* мелкие экраны */
    '@media screen and (max-width:767px){',
      '.nfx-bb{height:56vh}',
      '.nfx-bb__info{left:1.5em;bottom:5em;width:80%}',
      '.nfx-bb__title{font-size:2.2em}',
      '.nfx-bb__descr{font-size:1.05em;max-height:5.4em}',
      '.nfx-row__head,.nfx-row__body .scroll__content{padding-left:1.5em;padding-right:1.5em}',
      '.nfx-card{width:11em}',
      '.nfx-nav{height:4.4em;padding:0 1.5em}',
      '.nfx-nav__side{min-width:0}',
      '.nfx-nav__item{font-size:1.1em;padding:.38em .75em;margin:0 .1em}',
      '.nfx--no-hero .nfx-rows{padding-top:5.2em}',
      '.nfx-row{padding-top:4.6em;margin-top:-4.6em}',
      '.nfx-row__meta{padding-left:1.5em;padding-right:1.5em}',
      '.nfx-row--expand .nfx-card{width:8.6em;height:12.9em}',
      '.nfx-row--expand .nfx-card.focus{width:22.9em}',
      '.nfx-row--expand .nfx-card--over.focus,.nfx-row--expand .nfx-card--over.hover{width:8.6em}',
      '.nfx-row--expand .nfx-card--over.focus .nfx-card__view,.nfx-row--expand .nfx-card--over.hover .nfx-card__view{width:22.9em}',
      '.nfx-card__titlebox{height:2.8em}',
      '.nfx-card__logo{height:2.8em}',
      '.nfx-row--expand .nfx-card--more{width:8.6em;height:12.9em}',
      '.nfx-row--top .nfx-card{width:14em;padding-left:7em}',
      '.nfx-row--top .nfx-card__rank{width:7.4em}',
      '.nfx-row--top .nfx-card__rank > span{font-size:9.2em}',
    '}'
        ].join('');
    }

    /** Глобальная тема Netflix для стандартных экранов Lampa */
    function cssTheme(){
        return [
    /* фон и типографика */
    'body.nfx--theme{background:#141414}',
    'body.nfx--theme .background__one,body.nfx--theme .background__two{filter:brightness(.55) saturate(1.05)}',
    'body.nfx--theme .activity__loader{border-top-color:#e50914 !important}',

    /* верхняя панель */
    'body.nfx--theme .head{background:linear-gradient(180deg,rgba(0,0,0,.85) 0,rgba(0,0,0,.45) 55%,rgba(0,0,0,0) 100%)}',
    'body.nfx--theme .head__action.focus,body.nfx--theme .head__action.hover{background:#e50914;color:#fff}',
    'body.nfx--theme .head__logo-icon path,body.nfx--theme .head__logo-icon [fill]{fill:#e50914}',

    /* левое меню */
    'body.nfx--theme .menu__item{border-radius:.25em;padding-top:.75em;padding-bottom:.75em}',
    'body.nfx--theme .menu__item.focus,body.nfx--theme .menu__item.traverse,body.nfx--theme .menu__item.hover{background:#e50914;color:#fff}',
    'body.nfx--theme .menu__item.focus .menu__ico > img,body.nfx--theme .menu__item.hover .menu__ico > img{filter:none}',
    'body.nfx--theme .menu__item.focus .menu__ico [stroke],body.nfx--theme .menu__item.hover .menu__ico [stroke]{stroke:#fff}',
    'body.nfx--theme .menu__item.focus .menu__ico path[fill],body.nfx--theme .menu__item.focus .menu__ico rect[fill],body.nfx--theme .menu__item.focus .menu__ico circle[fill]{fill:#fff}',
    'body.nfx--theme .menu__item.active::after,body.nfx--theme .menu__item.focus::after{content:"";position:absolute;left:0;top:.5em;bottom:.5em;width:.2em;background:#fff;border-radius:.2em}',
    'body.nfx--theme .menu__split{border-top-color:rgba(255,255,255,.12)}',

    /* стандартные карточки Lampa */
    'body.nfx--theme .card__view{border-radius:.25em;transition:transform .25s ease}',
    'body.nfx--theme .card__img{border-radius:.25em;background-color:#2b2b2b}',
    'body.nfx--theme .card.focus .card__view,body.nfx--theme .card.hover .card__view{transform:scale(1.06);box-shadow:0 0 0 .13em #fff,0 .9em 1.8em rgba(0,0,0,.7)}',
    'body.nfx--theme .card__title{color:#b3b3b3;font-size:1.15em}',
    'body.nfx--theme .card.focus .card__title{color:#fff}',
    'body.nfx--theme .card__age{color:#6d6d6e}',
    'body.nfx--theme .card__vote{background:rgba(0,0,0,.72);color:#46d369;border-radius:.2em}',
    'body.nfx--theme .card__type,body.nfx--theme .card__quality > div{border-radius:.2em;background:#e50914;color:#fff}',
    'body.nfx--theme .card__marker{border-radius:.2em}',
    'body.nfx--theme .card__promo-title{font-weight:900}',

    /* полки */
    'body.nfx--theme .items-line{padding-bottom:2.2em}',
    'body.nfx--theme .items-line__title{font-size:1.45em;font-weight:700;color:#e5e5e5}',
    'body.nfx--theme .items-line__more{border-radius:.2em;background:rgba(109,109,110,.6)}',
    'body.nfx--theme .items-line__more.focus{background:#e50914;color:#fff}',

    /* кнопки / селекторы */
    'body.nfx--theme .simple-button{border-radius:.22em;background:rgba(109,109,110,.75);font-weight:700}',
    'body.nfx--theme .simple-button.focus,body.nfx--theme .simple-button.hover{background:#e50914;color:#fff}',
    'body.nfx--theme .full-start__button{border-radius:.22em;font-weight:700}',
    'body.nfx--theme .full-start__button.focus,body.nfx--theme .full-start__button.hover{background:#e50914;color:#fff}',
    'body.nfx--theme .full-start__button.focus [fill],body.nfx--theme .full-start__button.hover [fill]{fill:#fff}',
    'body.nfx--theme .full-start__button.focus [stroke],body.nfx--theme .full-start__button.hover [stroke]{stroke:#fff}',

    /* страница фильма */
    'body.nfx--theme .full-start-new__title,body.nfx--theme .full-start__title{font-weight:900;letter-spacing:-.01em}',
    'body.nfx--theme .full-start-new__img,body.nfx--theme .full-start__poster{border-radius:.25em}',
    'body.nfx--theme .full-start-new__rate-line > div,body.nfx--theme .full-descr__tag{border-radius:.2em}',
    'body.nfx--theme .full-start-new__reactions > div.focus{background:#e50914}',
    'body.nfx--theme .full-descr__left{border-color:rgba(255,255,255,.12)}',

    /* настройки, модалки, селектбоксы */
    'body.nfx--theme .settings__content,body.nfx--theme .modal__content,body.nfx--theme .selectbox__content{background:#181818;border-radius:.3em}',
    'body.nfx--theme .settings-folder.focus,body.nfx--theme .settings-param.focus,body.nfx--theme .selectbox-item.focus,body.nfx--theme .settings-param.hover,body.nfx--theme .selectbox-item.hover{background:#e50914;color:#fff}',
    'body.nfx--theme .settings-param__value{color:#e50914}',
    'body.nfx--theme .settings-param.focus .settings-param__value{color:#fff}',
    'body.nfx--theme .settings-param__descr,body.nfx--theme .settings-folder__descr{color:#8c8c8c}',
    'body.nfx--theme .settings-param.focus .settings-param__descr,body.nfx--theme .settings-folder.focus .settings-folder__descr{color:rgba(255,255,255,.85)}',
    'body.nfx--theme .settings__head,body.nfx--theme .modal__head{border-bottom:1px solid rgba(255,255,255,.1)}',
    'body.nfx--theme .settings-param > div.settings-param__status{border-radius:.2em}',

    /* поиск и клавиатура */
    'body.nfx--theme .search-box__input,body.nfx--theme .simple-keyboard{background:#181818;border-radius:.3em}',
    'body.nfx--theme .simple-keyboard .hg-button.focus,body.nfx--theme .simple-keyboard .hg-button.hover{background:#e50914 !important;color:#fff !important}',

    /* торренты / онлайн-балансеры */
    'body.nfx--theme .torrent-item.focus,body.nfx--theme .online-prestige.focus,body.nfx--theme .online.focus,body.nfx--theme .videos__item.focus{background:#e50914 !important;color:#fff}',
    'body.nfx--theme .torrent-item__title{font-weight:700}',
    'body.nfx--theme .filter__item.focus,body.nfx--theme .explorer-card.focus{background:#e50914}',

    /* плеер */
    'body.nfx--theme .player-panel__line > div,body.nfx--theme .timeline-slider__filled{background:#e50914}',
    'body.nfx--theme .player-panel__playlist .focus,body.nfx--theme .player-panel__position{background:#e50914}',
    'body.nfx--theme .player-info__name{font-weight:700}',

    /* прочее */
    'body.nfx--theme .noty__body{background:#e50914;border-radius:.25em;font-weight:700}',
    'body.nfx--theme .navigation-bar__item.active,body.nfx--theme .navigation-bar__item.focus{color:#e50914}',
    'body.nfx--theme .empty__title,body.nfx--theme .empty__descr{color:#b3b3b3}',
    'body.nfx--theme ::-webkit-scrollbar{width:.35em;height:.35em}',
    'body.nfx--theme ::-webkit-scrollbar-thumb{background:#4d4d4d;border-radius:.2em}',
    'body.nfx--theme ::-webkit-scrollbar-track{background:transparent}'
        ].join('');
    }

    /**
     * Вставить <style> один раз, вернуть узел.
     * @param {string} id
     * @param {string} css
     * @return {HTMLElement}
     */
    function styleInject(id, css){
        var node = document.getElementById(id);

        if(!node){
            node = document.createElement('style');
            node.id = id;
            node.type = 'text/css';
            document.head.appendChild(node);
        }

        if(node.styleSheet) node.styleSheet.cssText = css;
        else node.textContent = css;

        return node;
    }

    /** Включить/выключить глобальную тему */
    function themeToggle(status){
        $('body').toggleClass('nfx--theme', !!status);
    }

    /** Инициализация стилей */
    function themeInit(){
        styleInject('nfx-core-css', cssCore());
        styleInject('nfx-theme-css', cssTheme());

        themeToggle(pref('nfx_theme'));
    }

    /* ---------- src/font.js ---------- */
    /**
     * Типографика. Шрифты подключаются с Google Fonts по требованию,
     * применяются отдельным <style> без CSS-переменных — Tizen 3 и webOS 3
     * (Chromium 38/47) их не поддерживают.
     */

    /** Базовый фолбэк — родной шрифт Lampa */
    var NFX_FONT_FALLBACK = '"SegoeUI","Helvetica Neue",Helvetica,Arial,sans-serif';

    /**
     * Пресеты. ui — интерфейс и текст, display — крупные заголовки,
     * numeric — цифры «Топ-10» (нужны плотные, иначе «10» не влезает).
     */
    var NFX_FONTS = {
        'golos-montserrat': {
            css: 'family=Golos+Text:wght@400..900&family=Montserrat:wght@600..900',
            ui: '"Golos Text"',
            display: '"Montserrat"',
            numeric: '"Montserrat"',
            caps: true
        },
        'golos': {
            css: 'family=Golos+Text:wght@400..900',
            ui: '"Golos Text"',
            display: '"Golos Text"',
            numeric: '"Golos Text"',
            caps: false
        },
        'manrope': {
            css: 'family=Manrope:wght@400..800',
            ui: '"Manrope"',
            display: '"Manrope"',
            numeric: '"Manrope"',
            caps: false
        },
        'montserrat': {
            css: 'family=Montserrat:wght@400..900',
            ui: '"Montserrat"',
            display: '"Montserrat"',
            numeric: '"Montserrat"',
            caps: true
        },
        'inter': {
            css: 'family=Inter:wght@400..900',
            ui: '"Inter"',
            display: '"Inter"',
            numeric: '"Inter"',
            caps: false
        },
        'inter-montserrat': {
            css: 'family=Inter:wght@400..900&family=Montserrat:wght@600..900',
            ui: '"Inter"',
            display: '"Montserrat"',
            numeric: '"Montserrat"',
            caps: true
        }
    };

    /**
     * Собрать описание активного шрифта.
     * @return {object|null} null — не трогать шрифт Lampa
     */
    function fontActive(){
        var key = '' + pref('nfx_font');

        if(key === 'off') return null;

        if(key === 'custom'){
            var family = ('' + pref('nfx_font_family')).trim();

            if(!family) return null;

            var quoted = /[",]/.test(family) ? family : '"' + family + '"';

            return {
                url: ('' + pref('nfx_font_css')).trim(),
                ui: quoted,
                display: quoted,
                numeric: quoted,
                caps: false
            };
        }

        var preset = NFX_FONTS[key] || NFX_FONTS['golos-montserrat'];

        return {
            url: 'https://fonts.googleapis.com/css2?' + preset.css + '&display=swap',
            ui: preset.ui,
            display: preset.display,
            numeric: preset.numeric,
            caps: preset.caps
        };
    }

    /**
     * Подключить внешний CSS со шрифтом (один <link>, переиспользуется).
     * @param {string} url пустая строка — удалить
     */
    function fontLink(url){
        var link = document.getElementById('nfx-font-link');

        if(!url){
            if(link) link.parentNode.removeChild(link);

            return;
        }

        if(!link){
            link = document.createElement('link');
            link.id = 'nfx-font-link';
            link.rel = 'stylesheet';
            link.type = 'text/css';

            // Шрифт не должен блокировать отрисовку на медленных ТВ
            link.onerror = function(){
                console.log('NetflixUI', 'font load failed:', url);
            };

            document.head.appendChild(link);
        }

        if(link.getAttribute('href') !== url) link.setAttribute('href', url);
    }

    /**
     * Правила применения шрифта.
     * @param {object} font
     * @return {string}
     */
    function cssFont(font){
        var ui   = font.ui + ',' + NFX_FONT_FALLBACK;
        var disp = font.display + ',' + font.ui + ',' + NFX_FONT_FALLBACK;
        var num  = font.numeric + ',Arial,Helvetica,sans-serif';

        var rules = [
            /* интерфейс */
            'body.nfx--font,body.nfx--font input,body.nfx--font textarea,body.nfx--font button,body.nfx--font .simple-keyboard-input{font-family:' + ui + '}',

            /* крупные заголовки плагина и Lampa */
            'body.nfx--font .nfx-bb__title,',
            'body.nfx--font .nfx-bb__brand,',
            'body.nfx--font .nfx-row__title,',
            'body.nfx--font .nfx-btn,',
            'body.nfx--font .items-line__title,',
            'body.nfx--font .full-start-new__title,',
            'body.nfx--font .full-start__title,',
            'body.nfx--font .settings__head,',
            'body.nfx--font .search-box__title,',
            'body.nfx--font .empty__title{font-family:' + disp + '}',

            /* цифры «Топ-10» */
            'body.nfx--font .nfx-card__rank > span{font-family:' + num + '}',

            /* тонкая настройка начертаний: у Golos/Montserrat есть настоящие 800-900 */
            'body.nfx--font .nfx-row__title{font-weight:800;letter-spacing:-.005em}',
            'body.nfx--font .nfx-bb__descr{font-weight:400}',
            'body.nfx--font .nfx-card__label{font-weight:600}',
            'body.nfx--font .nfx-btn{font-weight:700}'
        ];

        // Montserrat раскрывается в капсе с разрядкой — как на киноплакате
        if(font.caps){
            rules.push('body.nfx--font .nfx-bb__title{text-transform:uppercase;letter-spacing:.015em;font-weight:800}');
            rules.push('body.nfx--font .nfx-row__title{letter-spacing:.005em}');
        }
        else {
            rules.push('body.nfx--font .nfx-bb__title{font-weight:800}');
        }

        return rules.join('');
    }

    /** Применить текущую настройку шрифта */
    function fontApply(){
        var font = fontActive();

        if(!font){
            fontLink('');
            styleInject('nfx-font-css', '');
            $('body').toggleClass('nfx--font', false);

            return;
        }

        fontLink(font.url);
        styleInject('nfx-font-css', cssFont(font));
        $('body').toggleClass('nfx--font', true);
    }

    /* ---------- src/api.js ---------- */
    /**
     * Слой данных: собирает полки для главной страницы.
     * Полка = { title, results, nfx_shape, url, source, nfx_rank }
     */

    var nfx_network = null;

    /** Общий Reguest плагина */
    function net(){
        if(!nfx_network) nfx_network = new Lampa.Reguest();

        return nfx_network;
    }

    /**
     * Запрос к TMDB через штатный источник Lampa (учитывает прокси Lampac).
     * @param {string} method
     * @param {function} ok
     * @param {function} err
     * @param {number} life минуты кеша
     */
    function tmdbGet(method, ok, err, life){
        Lampa.Api.sources.tmdb.get(method, {}, ok, err, { life: life || NFX.cache.short });
    }

    /**
     * Обёртка «полка из TMDB».
     * @param {object} opts {title, method, shape, life, rank, limit, filter}
     * @return {function} часть для Lampa.Api.partNext
     */
    function partTmdb(opts){
        return function(call){
            tmdbGet(opts.method, function(json){
                var results = json.results || [];

                if(opts.filter) results = filterCards(results, opts.filter);

                results = uniqueCards(results);

                if(opts.limit) results = results.slice(0, opts.limit);

                call({
                    title: opts.title,
                    results: results,
                    url: opts.method,
                    source: 'tmdb',
                    nfx_shape: opts.shape || pref('nfx_shape'),
                    nfx_rank: !!opts.rank
                });
            }, call, opts.life);
        };
    }

    /**
     * Полка из локальных данных (закладки, история).
     * @param {object} opts {title, build:function():array, shape, url, activity}
     * @return {function}
     */
    function partLocal(opts){
        return function(call){
            var results = [];

            try { results = opts.build() || []; }
            catch(e){ results = []; }

            if(!results.length) return call();

            call({
                title: opts.title,
                results: results,
                nfx_shape: opts.shape || pref('nfx_shape'),
                nfx_meta: !!opts.meta,
                nfx_activity: opts.activity
            });
        };
    }

    /**
     * Полка из каталога Lampac (модуль Catalog: rezka, filmix, kinopub…).
     * @param {string} name имя каталога
     * @param {string} title
     * @param {string} url  относительный путь на сервере Lampac
     * @return {function}
     */
    function partLampac(name, title, url){
        return function(call){
            if(!NFX.host) return call();

            var full = NFX.host + account(url);

            net().silent(full, function(json){
                var results = (json && json.results) || [];

                if(!results.length) return call();

                for(var i = 0; i < results.length; i++){
                    if(!results[i].source) results[i].source = name;
                }

                call({
                    title: title,
                    results: results,
                    url: url,
                    source: name,
                    nfx_shape: pref('nfx_shape')
                });
            }, call);
        };
    }

    /**
     * Отсеять карточки без картинок / с мусором.
     * @param {array} list
     * @param {string} mode 'art' — требуется backdrop, 'poster' — постер
     * @return {array}
     */
    function filterCards(list, mode){
        var out = [];

        for(var i = 0; i < list.length; i++){
            var card = list[i];

            if(!card) continue;
            if(mode === 'art' && !card.backdrop_path) continue;
            if(mode === 'poster' && !card.poster_path) continue;
            if(!card.backdrop_path && !card.poster_path) continue;

            out.push(card);
        }

        return out;
    }

    /** Карточки «Продолжить просмотр» с прогрессом */
    function continueCards(){
        var movies = Lampa.Favorite.continues('movie') || [];
        var series = Lampa.Favorite.continues('tv') || [];
        var anime  = Lampa.Favorite.continues('anime') || [];

        var all = uniqueCards([].concat(series, movies, anime));

        for(var i = 0; i < all.length; i++){
            all[i].nfx_progress = watchedPercent(all[i]);
        }

        return all.slice(0, 20);
    }

    /**
     * Процент просмотра карточки из таймлайна Lampa.
     * @param {object} card
     * @return {number} 0..100
     */
    function watchedPercent(card){
        try {
            var view = Lampa.Timeline.watched(card, true);

            if(!view) return 0;

            // Для сериалов возвращается массив эпизодов
            if(view.length){
                var last = view[view.length - 1];

                return last && last.view ? Math.round(last.view.percent || 0) : 0;
            }

            return Math.round(view.percent || 0);
        }
        catch(e){
            return 0;
        }
    }

    /** Карточки «Мой список»: закладки + лайки */
    function myListCards(){
        return uniqueCards([].concat(favoriteCards('book'), favoriteCards('like'))).slice(0, 20);
    }

    /**
     * «Похоже на <последний просмотренный>» — рекомендации TMDB.
     * @return {function|null}
     */
    function partBecause(){
        var history = [];

        try { history = Lampa.Favorite.get({ type: 'history' }) || []; }
        catch(e){}

        var seed = null;

        for(var i = 0; i < history.length; i++){
            if(history[i] && history[i].id && (history[i].poster_path || history[i].backdrop_path)){
                seed = history[i];
                break;
            }
        }

        if(!seed) return null;

        var type = isSerial(seed) ? 'tv' : 'movie';

        return partTmdb({
            title: tr('nfx_row_because') + ' «' + cardTitle(seed) + '»',
            method: type + '/' + seed.id + '/recommendations',
            life: NFX.cache.short
        });
    }

    /**
     * Полка «Продолжить просмотр» — всегда в режиме раскрытия.
     * @return {function}
     */
    function partContinue(){
        return partLocal({
            title: tr('nfx_row_continue'),
            build: continueCards,
            shape: 'expand',
            meta: true,
            activity: { component: 'favorite', type: 'history', title: tr('nfx_row_continue') }
        });
    }

    /**
     * Собрать список полок для вкладки.
     * @param {string} tab home | shows | movies | my
     * @return {array} массив функций-частей
     */
    function buildParts(tab){
        tab = tab || 'home';

        if(tab === 'my')     return partsMy();
        if(tab === 'shows')  return partsShows();
        if(tab === 'movies') return partsMovies();

        return partsHome();
    }

    /** Вкладка «Главная» */
    function partsHome(){
        var parts = [];

        parts.push(partContinue());

        parts.push(partLocal({
            title: tr('nfx_row_mylist'),
            build: myListCards,
            activity: { component: 'favorite', type: 'book', title: tr('nfx_row_mylist') }
        }));

        parts.push(partTmdb({
            title: tr('nfx_row_trending'),
            method: 'trending/all/day',
            filter: 'art',
            life: 60 * 3
        }));

        pushTop10(parts, 'movie', tr('nfx_row_top10_movie'));
        pushTop10(parts, 'tv', tr('nfx_row_top10_tv'));

        var because = partBecause();

        if(because) parts.push(because);

        parts.push(partTmdb({ title: tr('nfx_row_new'),        method: 'movie/now_playing', life: NFX.cache.short }));
        parts.push(partTmdb({ title: tr('nfx_row_tv_popular'), method: 'tv/popular',        life: NFX.cache.short }));
        parts.push(partTmdb({ title: tr('nfx_row_acclaimed'),  method: 'movie/top_rated',   life: NFX.cache.long }));
        parts.push(partTmdb({ title: tr('nfx_row_soon'),       method: 'movie/upcoming',    life: NFX.cache.short }));

        pushLampac(parts);
        pushGenres(parts, 'movie');

        return parts;
    }

    /** Вкладка «Сериалы» */
    function partsShows(){
        var parts = [];

        parts.push(partContinue());

        parts.push(partTmdb({ title: tr('nfx_row_trending_tv'), method: 'trending/tv/day', filter: 'art', life: 60 * 3 }));

        pushTop10(parts, 'tv', tr('nfx_row_top10_tv'));

        parts.push(partTmdb({ title: tr('nfx_row_tv_popular'),  method: 'tv/popular',      life: NFX.cache.short }));
        parts.push(partTmdb({ title: tr('nfx_row_tv_air'),      method: 'tv/on_the_air',   life: 60 * 6 }));
        parts.push(partTmdb({ title: tr('nfx_row_tv_today'),    method: 'tv/airing_today', life: 60 * 3 }));
        parts.push(partTmdb({ title: tr('nfx_row_tv_top'),      method: 'tv/top_rated',    life: NFX.cache.long }));

        pushLampac(parts);
        pushGenres(parts, 'tv');

        return parts;
    }

    /** Вкладка «Фильмы» */
    function partsMovies(){
        var parts = [];

        parts.push(partContinue());

        parts.push(partTmdb({ title: tr('nfx_row_trending_movie'), method: 'trending/movie/day', filter: 'art', life: 60 * 3 }));

        pushTop10(parts, 'movie', tr('nfx_row_top10_movie'));

        parts.push(partTmdb({ title: tr('nfx_row_new'),       method: 'movie/now_playing', life: NFX.cache.short }));
        parts.push(partTmdb({ title: tr('nfx_row_acclaimed'), method: 'movie/top_rated',   life: NFX.cache.long }));
        parts.push(partTmdb({ title: tr('nfx_row_soon'),      method: 'movie/upcoming',    life: NFX.cache.short }));
        parts.push(partTmdb({ title: tr('nfx_row_popular'),   method: 'movie/popular',     life: NFX.cache.short }));

        pushLampac(parts);
        pushGenres(parts, 'movie');

        return parts;
    }

    /** Вкладка «Моё» — только личные списки, без баннера */
    function partsMy(){
        var parts = [];

        parts.push(partContinue());

        parts.push(partLocal({
            title: tr('nfx_row_mylist'),
            build: function(){ return favoriteCards('book'); },
            activity: { component: 'favorite', type: 'book', title: tr('nfx_row_mylist') }
        }));

        parts.push(partLocal({
            title: tr('nfx_row_liked'),
            build: function(){ return favoriteCards('like'); },
            activity: { component: 'favorite', type: 'like', title: tr('nfx_row_liked') }
        }));

        parts.push(partLocal({
            title: tr('nfx_row_wath'),
            build: function(){ return favoriteCards('wath'); },
            activity: { component: 'favorite', type: 'wath', title: tr('nfx_row_wath') }
        }));

        parts.push(partLocal({
            title: tr('nfx_row_history'),
            build: function(){ return favoriteCards('history'); },
            activity: { component: 'favorite', type: 'history', title: tr('nfx_row_history') }
        }));

        var because = partBecause();

        if(because) parts.push(because);

        return parts;
    }

    /** Полка «Топ-10», если включена в настройках */
    function pushTop10(parts, type, title){
        if(!(pref('nfx_top10') === true || pref('nfx_top10') === 'true')) return;

        parts.push(partTmdb({
            title: title,
            method: 'trending/' + type + '/day',
            shape: 'top',
            rank: true,
            limit: 10,
            filter: 'poster',
            life: 60 * 3
        }));
    }

    /** Жанровые полки */
    function pushGenres(parts, type){
        NFX.genres.movie.forEach(function(genre){
            // 16 (мультфильмы) и 10749 (романтика) у сериалов в TMDB другие, но
            // discover/tv их корректно игнорирует, полка просто окажется пустой
            parts.push(partTmdb({
                title: tr(genre.key),
                method: 'discover/' + type + '?with_genres=' + genre.id + '&sort_by=popularity.desc',
                life: NFX.cache.long
            }));
        });
    }

    /** Полки каталогов Lampac */
    function pushLampac(parts){
        if(!(pref('nfx_lampac_rows') === true || pref('nfx_lampac_rows') === 'true')) return;

        lampacParts().forEach(function(part){ parts.push(part); });
    }

    /**
     * Карточки из категории избранного.
     * @param {string} type book | like | wath | history
     * @return {array}
     */
    function favoriteCards(type){
        var list = [];

        try { list = Lampa.Favorite.get({ type: type }) || []; }
        catch(e){ list = []; }

        return uniqueCards(list).slice(0, 20);
    }

    /**
     * Полки из подключённых каталогов Lampac.
     * Каталоги регистрирует плагин Catalog в Lampa.Api.sources.
     * @return {array}
     */
    function lampacParts(){
        var parts = [];

        try {
            var sources = Lampa.Api.sources || {};

            // Каталоги регистрируются через Object.defineProperty и не видны в for..in
            var names = Object.getOwnPropertyNames(sources);

            for(var i = 0; i < names.length; i++){
                var name = names[i];

                if(name === 'tmdb' || name === 'cub') continue;

                var api = sources[name];

                if(!api || typeof api.getCatalog !== 'function') continue;

                var catalog = null;

                try { catalog = api.getCatalog(); } catch(e){ continue; }

                if(!catalog || !catalog.main) continue;

                for(var title in catalog.main){
                    parts.push(partLampac(name, title + ' · ' + name.toUpperCase(), catalog.main[title]));
                }
            }
        }
        catch(e){
            console.log('NetflixUI', 'lampac rows error:', e.message);
        }

        return parts;
    }

    /**
     * Кандидаты для баннера: топ трендов недели с фоном и описанием.
     * @param {function} oncomplite
     */
    function billboardCards(oncomplite){
        tmdbGet('trending/all/week', function(json){
            var list = filterCards(json.results || [], 'art');
            var out  = [];

            for(var i = 0; i < list.length && out.length < 6; i++){
                if(list[i].overview && cardTitle(list[i])) out.push(list[i]);
            }

            oncomplite(out);
        }, function(){
            oncomplite([]);
        }, 60 * 6);
    }

    /* ---------- арт карточек: кеш, дедупликация, фоновый префетч ---------- */

    var NFX_ART_EMPTY    = { logo: '', backdrop: '' };
    var NFX_ART_PARALLEL = 2;

    var nfx_art_cache = {};   // key -> {logo, backdrop}
    var nfx_art_wait  = {};   // key -> [callbacks] — запрос в полёте
    var nfx_art_queue = [];   // очередь префетча
    var nfx_art_busy  = 0;
    var nfx_art_size  = 0;

    /**
     * Ключ кеша арта.
     * @param {object} card
     * @return {string}
     */
    function artKey(card){
        return (isSerial(card) ? 'tv' : 'mv') + ':' + card.id;
    }

    /**
     * Готовый арт из памяти.
     * @param {object} card
     * @return {object|null}
     */
    function artCached(card){
        if(!card || !card.id) return null;

        return nfx_art_cache[artKey(card)] || null;
    }

    /**
     * Арт карточки: логотип-надпись и кадр 16:9.
     * У части фильмов backdrop_path в списках пустой, но в /images кадры есть —
     * забираем оба за один вызов, чтобы не растягивать вертикальный постер.
     * Если арт уже в памяти — колбэк вызывается синхронно, без задержки.
     * @param {object} card
     * @param {function} oncomplite вызывается с {logo, backdrop}
     */
    function artwork(card, oncomplite){
        if(!card || !card.id) return oncomplite(NFX_ART_EMPTY);

        var hit = nfx_art_cache[artKey(card)];

        if(hit) return oncomplite(hit);

        artRequest(card, oncomplite);
    }

    /**
     * Запрос арта с дедупликацией: пока запрос в полёте, новые подписчики
     * просто добавляются к нему.
     * @param {object} card
     * @param {function} oncomplite
     */
    function artRequest(card, oncomplite){
        var key = artKey(card);

        if(nfx_art_wait[key]){
            nfx_art_wait[key].push(oncomplite);
            return;
        }

        nfx_art_wait[key] = [oncomplite];

        var type = isSerial(card) ? 'tv' : 'movie';
        var lang = Lampa.Storage.field('tmdb_lang') || 'ru';

        var done = function(art){
            // Простая защита от разрастания кеша за долгую сессию
            if(nfx_art_size > 400){
                nfx_art_cache = {};
                nfx_art_size = 0;
            }

            nfx_art_cache[key] = art;
            nfx_art_size++;

            var list = nfx_art_wait[key] || [];

            delete nfx_art_wait[key];

            for(var i = 0; i < list.length; i++) list[i](art);
        };

        tmdbGet(type + '/' + card.id + '/images?include_image_language=' + lang + ',en,null', function(json){
            done({
                logo: bestLogo(json, lang),
                backdrop: bestBackdrop(json)
            });
        }, function(){
            done(NFX_ART_EMPTY);
        }, NFX.cache.long);
    }

    /**
     * Поставить карточки в очередь фоновой подгрузки арта, чтобы к моменту
     * наведения логотип уже был готов.
     * @param {array} cards
     */
    function artPrefetch(cards){
        if(!cards || !cards.length) return;
        if(!(pref('nfx_prefetch') === true || pref('nfx_prefetch') === 'true')) return;

        for(var i = 0; i < cards.length; i++){
            var card = cards[i];

            if(!card || !card.id) continue;

            var key = artKey(card);

            if(nfx_art_cache[key] || nfx_art_wait[key]) continue;
            if(indexOfKey(nfx_art_queue, key)) continue;

            nfx_art_queue.push(card);
        }

        artPump();
    }

    /** Есть ли карточка с таким ключом в очереди */
    function indexOfKey(queue, key){
        for(var i = 0; i < queue.length; i++){
            if(artKey(queue[i]) === key) return true;
        }

        return false;
    }

    /** Разбор очереди префетча с ограничением параллелизма */
    function artPump(){
        while(nfx_art_busy < NFX_ART_PARALLEL && nfx_art_queue.length){
            var card = nfx_art_queue.shift();

            nfx_art_busy++;

            artRequest(card, function(art){
                nfx_art_busy--;

                // Логотип небольшой — прогреваем всегда
                if(art && art.logo) artWarm(art.logo);

                setTimeout(artPump, 120);
            });
        }
    }

    /** Сбросить очередь префетча (смена вкладки, уход с экрана) */
    function artPrefetchClear(){
        nfx_art_queue = [];
    }

    var nfx_warm = {};

    /**
     * Прогреть картинку в кеше браузера, чтобы подмена шла без видимой загрузки.
     * @param {string} url
     */
    function artWarm(url){
        if(!url || nfx_warm[url]) return;

        nfx_warm[url] = true;

        var image = new Image();

        image.src = url;
    }

    /**
     * Прогреть кадры 16:9 у карточек рядом с курсором.
     * Кадр весит на порядок больше логотипа, поэтому окно узкое.
     * @param {array} cards
     */
    function artWarmBackdrops(cards){
        if(!cards || !cards.length) return;
        if(!(pref('nfx_prefetch') === true || pref('nfx_prefetch') === 'true')) return;

        for(var i = 0; i < cards.length; i++){
            var card = cards[i];

            if(!card) continue;

            if(card.backdrop_path){
                artWarm(img(card.backdrop_path, 'w780'));
                continue;
            }

            // Кадра в списке нет — берём из уже полученного арта, если он есть
            var art = artCached(card);

            if(art && art.backdrop) artWarm(art.backdrop);
        }
    }

    /**
     * Лучший логотип: приоритет языку интерфейса, SVG пропускаем —
     * старые webview рисуют его непредсказуемо.
     * @param {object} json ответ /images
     * @param {string} lang
     * @return {string}
     */
    function bestLogo(json, lang){
        var logos = (json && json.logos) || [];
        var best  = null;

        for(var i = 0; i < logos.length; i++){
            var logo = logos[i];

            if(('' + logo.file_path).indexOf('.svg') > -1) continue;

            if(!best) best = logo;
            else if(logo.iso_639_1 === lang && best.iso_639_1 !== lang) best = logo;
        }

        return best ? img(best.file_path, 'w500') : '';
    }

    /**
     * Лучший кадр 16:9: без надписей (iso_639_1 = null) и максимально рейтинговый.
     * @param {object} json ответ /images
     * @return {string}
     */
    function bestBackdrop(json){
        var list = (json && json.backdrops) || [];
        var best = null;

        for(var i = 0; i < list.length; i++){
            var item = list[i];

            if(!item.file_path) continue;

            // Кадры с вшитым текстом на чужом языке смотрятся хуже нейтральных
            var neutral = !item.iso_639_1;

            if(!best) best = item;
            else {
                var best_neutral = !best.iso_639_1;

                if(neutral && !best_neutral) best = item;
                else if(neutral === best_neutral && (item.vote_average || 0) > (best.vote_average || 0)) best = item;
            }
        }

        return best ? img(best.file_path, 'w780') : '';
    }

    /**
     * Логотип-надпись названия (title treatment) — для баннера.
     * @param {object} card
     * @param {function} oncomplite вызывается с url или ''
     */
    function titleLogo(card, oncomplite){
        artwork(card, function(art){
            oncomplite(art.logo);
        });
    }

    /**
     * Последний просмотренный эпизод сериала.
     * @param {object} card
     * @return {object|null} {season, episode}
     */
    function lastEpisode(card){
        try {
            var last = Lampa.Storage.get('online_watched_last', '{}') || {};
            var keys = [card.original_title, card.original_name, card.title, card.name];

            for(var i = 0; i < keys.length; i++){
                if(!keys[i]) continue;

                var found = last[Lampa.Utils.hash(keys[i])];

                if(found && found.episode) return { season: found.season || 1, episode: found.episode };
            }
        }
        catch(e){}

        // Фолбэк: последний эпизод с прогрессом из таймлайна
        try {
            var list = Lampa.Timeline.watched(card, true);

            if(list && list.length){
                var item = list[list.length - 1];

                if(item && item.ep) return { season: 1, episode: item.ep };
            }
        }
        catch(e){}

        return null;
    }

    /**
     * «Осталось 20 мин» по данным таймлайна.
     * @param {object} view {percent, time, duration}
     * @return {string} пустая строка, если данных нет
     */
    function leftTime(view){
        if(!view || !view.duration || !view.time) return '';

        var left = Math.round((view.duration - view.time) / 60);

        if(left <= 0) return '';

        if(left < 60) return tr('nfx_left').replace('%s', left + ' ' + tr('nfx_min'));

        var hours = Math.floor(left / 60);
        var mins  = left % 60;

        return tr('nfx_left').replace('%s', hours + ' ' + tr('nfx_hour') + (mins ? ' ' + mins + ' ' + tr('nfx_min') : ''));
    }

    /**
     * Строка «Жанр · Год · Сезоны · Рейтинг» — как в презентации Netflix.
     * @param {object} card
     * @return {string}
     */
    function infoLine(card){
        var parts  = [];
        var genres = genreNames(card);
        var year   = cardYear(card);

        if(genres) parts.push(genres);
        if(year) parts.push(year);

        if(card.number_of_seasons){
            parts.push(card.number_of_seasons + ' ' + seasonWord(card.number_of_seasons));
        }

        parts.push(ageLimit(card));

        return parts.join(' • ');
    }

    /**
     * Склонение слова «сезон».
     * @param {number} count
     * @return {string}
     */
    function seasonWord(count){
        if(!Lampa.Lang.selected(['ru', 'uk', 'be'])) return count === 1 ? 'season' : 'seasons';

        var last = count % 10;
        var tens = count % 100;

        if(tens > 10 && tens < 20) return 'сезонов';
        if(last === 1) return 'сезон';
        if(last >= 2 && last <= 4) return 'сезона';

        return 'сезонов';
    }

    /**
     * Название эпизода из TMDB (кешируется на неделю).
     * @param {object} card
     * @param {number} season
     * @param {number} episode
     * @param {function} oncomplite
     */
    function episodeName(card, season, episode, oncomplite){
        if(!card.id) return oncomplite('');

        tmdbGet('tv/' + card.id + '/season/' + season, function(json){
            var list = (json && json.episodes) || [];

            for(var i = 0; i < list.length; i++){
                if(list[i].episode_number == episode) return oncomplite(list[i].name || '');
            }

            oncomplite('');
        }, function(){
            oncomplite('');
        }, NFX.cache.long);
    }

    /**
     * Две строки метаданных под раскрытой карточкой — как на Netflix.
     * @param {object} card
     * @param {function} onUpdate вызывается позже, когда подтянется название эпизода
     * @return {object} {line1, line2}
     */
    function watchMeta(card, onUpdate){
        var title = cardTitle(card);
        var meta  = { line1: title, line2: '' };
        var view;

        if(isSerial(card)){
            var last = lastEpisode(card);

            if(last){
                meta.line1 = 'S' + last.season + ' E' + last.episode;

                try { view = Lampa.Timeline.watchedEpisode(card, last.season, last.episode, true); }
                catch(e){ view = null; }

                meta.line2 = leftTime(view) || title;

                if(onUpdate){
                    episodeName(card, last.season, last.episode, function(name){
                        if(name) onUpdate({ line1: meta.line1 + ' • ' + name, line2: meta.line2 });
                    });
                }

                return meta;
            }
        }
        else {
            try { view = Lampa.Timeline.watched(card, true); }
            catch(e){ view = null; }

            var left = leftTime(view);

            if(left){
                meta.line2 = left;

                return meta;
            }
        }

        // Обычная полка: как в презентации — метастрока сверху, синопсис снизу
        meta.line1 = infoLine(card);
        meta.line2 = cut(card.overview, 190);

        return meta;
    }

    /** Отменить все запросы плагина */
    function apiClear(){
        artPrefetchClear();

        if(nfx_network) nfx_network.clear();
    }

    /* ---------- src/nav.js ---------- */
    /**
     * Верхняя панель навигации в стиле Netflix TV:
     * аватар профиля, поиск, вкладки, логотип справа.
     * @param {object} params {tab:string}
     */
    function NfxNav(params){
        var _self = this;

        this.params = params || {};

        var active = this.params.tab || 'home';
        var last   = false;

        var ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L21 21"/></svg>';

        // Дефолтный аватар: красная плитка с рожицей, если нет профиля CUB
        var ICON_FACE = '<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="4" fill="#e50914"/>' +
            '<rect x="11" y="13" width="4" height="7" rx="2" fill="#fff"/>' +
            '<rect x="25" y="13" width="4" height="7" rx="2" fill="#fff"/>' +
            '<path d="M12 24c2.6 3.2 5.3 4.8 8 4.8s5.4-1.6 8-4.8" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/></svg>';

        /** Вкладки: search — не вкладка, а действие */
        var TABS = [
            { key: 'search', icon: ICON_SEARCH },
            { key: 'home',   title: 'nfx_tab_home' },
            { key: 'shows',  title: 'nfx_tab_shows' },
            { key: 'movies', title: 'nfx_tab_movies' },
            { key: 'my',     title: 'nfx_tab_my' }
        ];

        /** Собрать DOM */
        this.create = function(){
            var html = '<div class="nfx-nav">' +
                '<div class="nfx-nav__side">' +
                    '<div class="nfx-nav__profile selector">' +
                        '<div class="nfx-nav__avatar">' + ICON_FACE + '</div>' +
                        '<div class="nfx-nav__caret">▾</div>' +
                    '</div>' +
                '</div>' +
                '<div class="nfx-nav__center"></div>' +
                '<div class="nfx-nav__side nfx-nav__side--right"></div>' +
            '</div>';

            this.html = $(html);

            var center = this.html.find('.nfx-nav__center');

            TABS.forEach(function(tab){
                var item = $('<div class="nfx-nav__item' + (tab.icon ? ' nfx-nav__item--icon' : '') + ' selector" data-key="' + tab.key + '">' +
                    (tab.icon ? tab.icon : esc(tr(tab.title))) +
                '</div>');

                item.on('hover:enter', function(){
                    _self.select(tab.key);
                });

                item.on('hover:focus', function(){
                    last = item[0];
                });

                center.append(item);
            });

            this.html.find('.nfx-nav__profile')
                .on('hover:enter', function(){ _self.profile(); })
                .on('hover:focus', function(){ last = _self.html.find('.nfx-nav__profile')[0]; });

            this.avatar();
            this.setActive(active);

            return this;
        };

        /** Подставить иконку профиля CUB, если он есть */
        this.avatar = function(){
            var src = '';

            try {
                if(Lampa.Account && Lampa.Account.Profile && Lampa.Account.Permit && Lampa.Account.Permit.token){
                    src = Lampa.Account.Profile.icon();
                }
            }
            catch(e){}

            if(!src) return;

            var box = this.html.find('.nfx-nav__avatar');
            var img_el = document.createElement('img');

            img_el.onload = function(){
                box.empty();
                box.append(img_el);
            };

            img_el.src = src;
        };

        /**
         * Отметить активную вкладку.
         * @param {string} key
         */
        this.setActive = function(key){
            active = key;

            this.html.find('.nfx-nav__item').each(function(){
                $(this).toggleClass('nfx-nav__item--active', $(this).data('key') === key);
            });
        };

        /**
         * Выбор вкладки.
         * @param {string} key
         */
        this.select = function(key){
            if(key === 'search'){
                try { Lampa.Search.open({ onBack: function(){ Lampa.Controller.toggle('content'); } }); }
                catch(e){ Lampa.Controller.toggle('search'); }

                return;
            }

            if(key === active) return;

            this.setActive(key);

            if(this.onSelect) this.onSelect(key);
        };

        /** Меню профиля: доступ к тому, что спрятала шапка Lampa */
        this.profile = function(){
            var enabled = Lampa.Controller.enabled().name;
            var items   = [
                { title: tr('nfx_nav_menu'), action: 'menu' },
                { title: Lampa.Lang.translate('menu_settings'), action: 'settings' }
            ];

            var synced = false;

            try { synced = !!(Lampa.Account && Lampa.Account.Permit && Lampa.Account.Permit.token); }
            catch(e){}

            if(synced) items.push({ title: tr('nfx_nav_profiles'), action: 'profiles' });

            Lampa.Select.show({
                title: Lampa.Lang.translate('title_action'),
                items: items,
                onSelect: function(item){
                    if(item.action === 'menu'){
                        Lampa.Controller.toggle('menu');
                        return;
                    }

                    if(item.action === 'settings'){
                        Lampa.Controller.toggle('settings');
                        return;
                    }

                    if(item.action === 'profiles'){
                        Lampa.Account.Profile.select(function(){
                            Lampa.Controller.toggle(enabled);
                        });
                        return;
                    }

                    Lampa.Controller.toggle(enabled);
                },
                onBack: function(){
                    Lampa.Controller.toggle(enabled);
                }
            });
        };

        /** Забрать фокус на панель */
        this.toggle = function(){
            var box = this.html[0];

            Lampa.Controller.add('nfx_nav', {
                link: this,
                toggle: function(){
                    Lampa.Controller.collectionSet(box);
                    Lampa.Controller.collectionFocus(last || _self.html.find('.nfx-nav__item--active')[0] || false, box);
                },
                right: function(){
                    Navigator.move('right');
                },
                left: function(){
                    if(Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                up: function(){},
                down: function(){
                    if(_self.onDown) _self.onDown();
                },
                back: function(){
                    if(_self.onBack) _self.onBack();
                }
            });

            Lampa.Controller.toggle('nfx_nav');
        };

        this.render = function(js){
            return js ? this.html[0] : this.html;
        };

        this.destroy = function(){
            if(this.html) this.html.remove();

            this.html = null;
        };
    }

    /* ---------- src/trailer.js ---------- */
    /**
     * Трейлер внутри раскрытой карточки.
     * YT IFrame API Lampa по умолчанию не подключает, поэтому грузим сами.
     * Плеер создаётся на карточку и уничтожается при уходе фокуса: перенос
     * iframe между карточками в DOM вызывает его перезагрузку, так что
     * переиспользовать один инстанс нельзя.
     */

    var NFX_TR = {
        api: 'idle',     // idle | loading | ready | failed
        player: null,
        host: null,
        card: null,      // DOM-элемент карточки, на которой играет трейлер
        timer: null,
        guard: null,
        tick: null,
        ramp: null
    };

    /** Кеш ключей трейлеров: key -> videoId | '' */
    var nfx_vid_cache = {};

    /** Включён ли трейлер и с какой задержкой, мс. 0 — выключен */
    function trailerDelay(){
        var value = parseInt(pref('nfx_trailer'), 10);

        return isNaN(value) ? 0 : value * 1000;
    }

    /** Нужен ли звук */
    function trailerSound(){
        var value = pref('nfx_trailer_sound');

        return value === true || value === 'true';
    }

    /**
     * Ленивая загрузка YT IFrame API.
     * @param {function} oncomplite вызывается с true/false
     */
    function trailerApi(oncomplite){
        if(NFX_TR.api === 'ready')  return oncomplite(true);
        if(NFX_TR.api === 'failed') return oncomplite(false);

        if(window.YT && window.YT.Player){
            NFX_TR.api = 'ready';

            return oncomplite(true);
        }

        if(NFX_TR.api === 'loading'){
            // Ждём уже идущую загрузку
            var waited = 0;
            var wait = setInterval(function(){
                waited += 200;

                if(window.YT && window.YT.Player){
                    clearInterval(wait);
                    NFX_TR.api = 'ready';

                    return oncomplite(true);
                }

                if(waited > 8000 || NFX_TR.api === 'failed'){
                    clearInterval(wait);

                    oncomplite(false);
                }
            }, 200);

            return;
        }

        NFX_TR.api = 'loading';

        // Не затираем обработчик, если его уже кто-то поставил
        var previous = window.onYouTubeIframeAPIReady;

        window.onYouTubeIframeAPIReady = function(){
            if(typeof previous === 'function') previous();

            NFX_TR.api = 'ready';
        };

        var script = document.createElement('script');

        script.src = Lampa.Utils.protocol() + 'www.youtube.com/iframe_api';

        script.onerror = function(){
            NFX_TR.api = 'failed';

            console.log('NetflixUI', 'youtube api load failed');
        };

        document.head.appendChild(script);

        var spent = 0;
        var timer = setInterval(function(){
            spent += 200;

            if(NFX_TR.api === 'ready'){
                clearInterval(timer);

                return oncomplite(true);
            }

            if(spent > 8000 || NFX_TR.api === 'failed'){
                clearInterval(timer);

                NFX_TR.api = 'failed';

                oncomplite(false);
            }
        }, 200);
    }

    /**
     * Найти видео трейлера. Кешируется в памяти, запрос кеширует Lampa на неделю.
     * @param {object} card
     * @param {function} oncomplite вызывается с videoId или ''
     */
    function trailerVideo(card, oncomplite){
        if(!card || !card.id) return oncomplite('');

        var key = (isSerial(card) ? 'tv' : 'mv') + ':' + card.id;

        if(typeof nfx_vid_cache[key] !== 'undefined') return oncomplite(nfx_vid_cache[key]);

        var method = isSerial(card) ? 'tv' : 'movie';
        var lang   = Lampa.Storage.field('tmdb_lang') || 'ru';

        Lampa.Api.sources.tmdb.videos({ method: method, id: card.id }, function(json){
            var list = ((json && json.results) || []).filter(function(video){
                return video.site === 'YouTube' && video.key;
            });

            var pick = first(list, function(v){ return v.type === 'Trailer' && v.iso_639_1 === lang; })
                    || first(list, function(v){ return v.type === 'Trailer'; })
                    || first(list, function(v){ return v.type === 'Teaser'; })
                    || list[0];

            nfx_vid_cache[key] = pick ? pick.key : '';

            oncomplite(nfx_vid_cache[key]);
        }, function(){
            nfx_vid_cache[key] = '';

            oncomplite('');
        });
    }

    /** Первый элемент по условию */
    function first(list, check){
        for(var i = 0; i < list.length; i++){
            if(check(list[i])) return list[i];
        }

        return null;
    }

    /**
     * Заранее узнать ключ трейлера — вызывается при фокусе, чтобы к концу
     * выдержки ключ уже был.
     * @param {object} card
     */
    function trailerPrepare(card){
        if(!trailerDelay() || NFX_TR.api === 'failed') return;

        trailerVideo(card, function(){});
    }

    /**
     * Запросить трейлер для карточки. Любой новый запрос гасит предыдущий,
     * поэтому переключение карточек само останавливает воспроизведение.
     * @param {object} data карточка
     * @param {jQuery} html элемент карточки
     */
    function trailerRequest(data, html){
        trailerStop();

        if(!trailerDelay() || !data || !html || !html.length) return;
        if(NFX_TR.api === 'failed') return;

        NFX_TR.timer = setTimeout(function(){
            // За время выдержки фокус мог уйти
            if(!html.hasClass('focus') && !html.hasClass('hover')) return;

            trailerVideo(data, function(video){
                if(!video) return;
                if(!html.hasClass('focus') && !html.hasClass('hover')) return;

                trailerApi(function(ok){
                    if(!ok) return;
                    if(!html.hasClass('focus') && !html.hasClass('hover')) return;

                    trailerPlay(video, html);
                });
            });
        }, trailerDelay());
    }

    /**
     * Создать плеер и запустить.
     * @param {string} video id видео на YouTube
     * @param {jQuery} html элемент карточки
     */
    function trailerPlay(video, html){
        var view = html.find('.nfx-card__view');

        if(!view.length) return;

        var host = $('<div class="nfx-card__trailer"><div></div></div>');

        view.append(host);

        NFX_TR.host = host;
        NFX_TR.card = html;

        try {
            NFX_TR.player = new YT.Player(host.find('div')[0], {
                videoId: video,
                width: '100%',
                height: '100%',
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    mute: 1,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    disablekb: 1,
                    fs: 0,
                    iv_load_policy: 3,
                    cc_load_policy: 0,
                    cc_lang_pref: 'none'
                },
                events: {
                    onReady: function(e){
                        trailerNoCaptions(e.target);

                        e.target.mute();
                        e.target.playVideo();
                    },
                    onStateChange: function(e){
                        // 1 — играет, 0 — закончился
                        if(e.data === 1){
                            trailerNoCaptions(e.target);

                            if(NFX_TR.host) NFX_TR.host.addClass('nfx-card__trailer--on');
                            if(NFX_TR.card) NFX_TR.card.addClass('nfx-card--trailer');

                            trailerWatch();
                            trailerUnmute();
                        }

                        if(e.data === 0) trailerStop();
                    },
                    onError: function(){
                        trailerStop();
                    }
                }
            });
        }
        catch(e){
            console.log('NetflixUI', 'trailer error:', e.message);

            return trailerStop();
        }

        // Плеер не поднялся за 6 секунд — считаем путь недоступным на этом устройстве
        NFX_TR.guard = setTimeout(function(){
            var state = -1;

            try { state = NFX_TR.player.getPlayerState(); }
            catch(err){}

            if(state !== 1){
                NFX_TR.api = 'failed';

                console.log('NetflixUI', 'trailer unavailable, disabled for session');

                trailerStop();
            }
        }, 6000);
    }

    /**
     * Снять субтитры: cc_load_policy автосубтитры не всегда отключает.
     * @param {object} player
     */
    function trailerNoCaptions(player){
        try { player.unloadModule('captions'); } catch(e){}
        try { player.unloadModule('cc'); } catch(e){}

        try {
            player.setOption('captions', 'track', {});
        }
        catch(e){}
    }

    /**
     * Включить звук: стартуем всегда в тишине (беззвучный автозапуск разрешён
     * всегда), затем плавно поднимаем громкость и перепроверяем, что браузер
     * не запретил. Худший случай — трейлер без звука.
     */
    function trailerUnmute(){
        if(!trailerSound() || !NFX_TR.player) return;

        // Без пользовательского жеста в документе автозапуск со звуком запрещён
        if(navigator.userActivation && !navigator.userActivation.hasBeenActive) return;

        var player = NFX_TR.player;
        var step   = 0;

        clearInterval(NFX_TR.ramp);

        try {
            player.setVolume(0);
            player.unMute();
        }
        catch(e){ return; }

        NFX_TR.ramp = setInterval(function(){
            if(NFX_TR.player !== player) return clearInterval(NFX_TR.ramp);

            step += 10;

            try {
                // Браузер отклонил снятие звука — остаёмся в тишине
                if(player.isMuted() || player.getPlayerState() !== 1){
                    clearInterval(NFX_TR.ramp);

                    player.mute();

                    return;
                }

                player.setVolume(Math.min(60, step));
            }
            catch(e){
                clearInterval(NFX_TR.ramp);
            }

            if(step >= 60) clearInterval(NFX_TR.ramp);
        }, 120);
    }

    /** Не давать скринсейверу погасить экран во время трейлера */
    function trailerWatch(){
        clearInterval(NFX_TR.tick);

        NFX_TR.tick = setInterval(function(){
            if(!NFX_TR.player) return clearInterval(NFX_TR.tick);

            try { Lampa.Screensaver.resetTimer(); }
            catch(e){}
        }, 2000);
    }

    /**
     * Состояние трейлера для отладки (в том числе на телевизорах, где консоль
     * недоступна): window.nfx_trailer_state()
     * @return {object}
     */
    function trailerState(){
        var state = {
            api: NFX_TR.api,
            playing: false,
            muted: null,
            volume: null,
            time: null,
            delay: trailerDelay(),
            sound: trailerSound()
        };

        if(NFX_TR.player){
            try {
                state.playing = NFX_TR.player.getPlayerState() === 1;
                state.muted   = NFX_TR.player.isMuted();
                state.volume  = NFX_TR.player.getVolume();
                state.time    = Math.round(NFX_TR.player.getCurrentTime() * 10) / 10;
            }
            catch(e){
                state.error = e.message;
            }
        }

        return state;
    }

    /** Погасить трейлер и вернуть кадр */
    function trailerStop(){
        clearTimeout(NFX_TR.timer);
        clearTimeout(NFX_TR.guard);
        clearInterval(NFX_TR.tick);
        clearInterval(NFX_TR.ramp);

        NFX_TR.timer = null;
        NFX_TR.guard = null;

        if(NFX_TR.player){
            try { NFX_TR.player.mute(); } catch(e){}
            try { NFX_TR.player.stopVideo(); } catch(e){}
            try { NFX_TR.player.destroy(); } catch(e){}

            NFX_TR.player = null;
        }

        if(NFX_TR.card){
            NFX_TR.card.removeClass('nfx-card--trailer');
            NFX_TR.card = null;
        }

        if(NFX_TR.host){
            NFX_TR.host.remove();
            NFX_TR.host = null;
        }
    }

    /* ---------- src/card.js ---------- */
    /**
     * Карточка.
     * @param {object} data  карточка TMDB/Lampac
     * @param {object} params {shape:'expand'|'wide'|'poster'|'top', rank:number, titles:boolean}
     */
    function NfxCard(data, params){
        var _self = this;

        this.data   = data || {};
        this.params = params || {};

        var shape   = this.params.shape || 'expand';
        var expand  = shape === 'expand';
        var wide    = shape === 'wide';

        var img_el      = null;
        var img_wide_el = null;
        var logo_el     = null;
        var wide_loaded = false;
        var art_done    = false;
        var art_timer   = null;

        /** Собрать DOM */
        this.create = function(){
            var title    = cardTitle(this.data);
            var year     = cardYear(this.data);
            var match    = matchPercent(this.data);
            var progress = this.data.nfx_progress || 0;

            var html = '<div class="nfx-card selector layer--visible">';

            if(shape === 'top' && this.params.rank){
                html += '<div class="nfx-card__rank"><span>' + this.params.rank + '</span></div>';
                html += '<div class="nfx-card__box">';
            }

            html += '<div class="nfx-card__view">';
            html += '<img class="nfx-card__img" alt="" />';

            // В режиме expand фокусная карточка превращается в широкую плитку 16:9,
            // поэтому нужен второй кадр — постер под 2:3 в него не растянуть.
            if(expand){
                html += '<img class="nfx-card__img-wide" alt="" />';
                html += '<div class="nfx-card__shade"></div>';
                html += '<div class="nfx-card__promo">';
                html += '<div class="nfx-card__kind"><span>' + esc(isSerial(this.data) ? tr('nfx_series') : tr('nfx_movie')) + '</span></div>';
                html += '<div class="nfx-card__titlebox">';
                html += '<img class="nfx-card__logo" alt="" />';
                html += '<div class="nfx-card__name' + nameSize(title) + '">' + esc(title) + '</div>';
                html += '</div>';
                html += '</div>';
            }
            else {
                html += '<div class="nfx-card__grad"></div>';
                html += '<div class="nfx-card__label">' + esc(title) + (year ? ' <span style="opacity:.7">' + year + '</span>' : '') + '</div>';
            }

            if(shouldBadge()){
                if(isNew(this.data)) html += '<div class="nfx-card__badge">NEW</div>';
                else if(match && progress <= 1) html += '<div class="nfx-card__vote">' + match + '%</div>';
            }

            if(progress > 1) html += '<div class="nfx-card__progress"><div style="width:' + Math.min(100, progress) + '%"></div></div>';

            html += '</div>';

            if(shape === 'top' && this.params.rank) html += '</div>';

            if(this.params.titles && shape !== 'top' && !expand){
                html += '<div class="nfx-card__title">' + esc(title) + '</div>';
            }

            html += '</div>';

            this.html = $(html);

            this.html[0].card_data = this.data;

            img_el      = this.html.find('.nfx-card__img')[0];
            img_wide_el = expand ? this.html.find('.nfx-card__img-wide')[0] : null;
            logo_el     = expand ? this.html.find('.nfx-card__logo') : null;

            this.loadImage();
            this.bind();

            return this;
        };

        /** Бейджи NEW / рейтинг: в expand только на раскрытой плитке */
        function shouldBadge(){
            return !expand;
        }

        /** Основной кадр с фолбэком на другую ориентацию */
        this.loadImage = function(){
            if(!img_el) return;

            var tries = 0;
            var srcs  = [];

            // expand и top показывают постер 2:3, wide — кадр 16:9
            var primary   = cardImage(this.data, wide);
            var secondary = cardImage(this.data, !wide);

            if(primary) srcs.push(primary);
            if(secondary && secondary !== primary) srcs.push(secondary);

            if(!srcs.length){
                img_el.style.display = 'none';
                return;
            }

            var is_fallback = wide && !this.data.backdrop_path;

            img_el.onload = function(){
                $(img_el).addClass('nfx-card__img--loaded');

                if(is_fallback) $(img_el).addClass('nfx-card__img--fallback');
            };

            img_el.onerror = function(){
                tries++;

                if(tries < srcs.length) img_el.src = srcs[tries];
                else img_el.style.display = 'none';
            };

            img_el.src = srcs[0];
        };

        /**
         * Раскрытие карточки: широкий кадр 16:9 и логотип названия.
         * @param {string} source 'focus' — пульт, 'hover' — мышь или тач
         */
        this.expand = function(source){
            if(!expand) return;

            // Мышью раскрываем оверлеем: полка не перекладывается, контент
            // не уезжает из-под курсора и не возникает петли mouseenter
            this.html.toggleClass('nfx-card--over', source === 'hover');

            // Кадр из списка есть — ставим сразу, не дожидаясь /images
            if(!wide_loaded && img_wide_el && this.data.backdrop_path){
                wide_loaded = true;

                this.setWide(img(this.data.backdrop_path, 'w780'));
            }

            // Ключ трейлера узнаём сразу, чтобы к концу выдержки он уже был,
            // а сам запуск — по таймеру внутри trailerRequest
            trailerPrepare(this.data);
            trailerRequest(this.data, this.html);

            if(art_done) return;

            // Префетч обычно уже положил арт в память — тогда без задержки
            var cached = artCached(this.data);

            if(cached){
                art_done = true;

                return this.applyArt(cached);
            }

            clearTimeout(art_timer);

            art_timer = setTimeout(function(){
                if(!_self.html || !_self.focused() || art_done) return;

                art_done = true;

                artwork(_self.data, function(art){
                    if(_self.html) _self.applyArt(art);
                });
            }, 220);
        };

        /**
         * Применить полученный арт.
         * @param {object} art {logo, backdrop}
         */
        this.applyArt = function(art){
            if(!this.html) return;

            if(art.logo && logo_el && logo_el.length){
                var node = logo_el[0];

                node.onload = function(){
                    if(!_self.html) return;

                    logo_el.addClass('nfx-card__logo--on');
                    _self.html.find('.nfx-card__name').addClass('nfx-card__name--off');
                };

                node.src = art.logo;
            }

            // backdrop_path бывает пустым в списках, хотя кадры существуют
            if(!wide_loaded && art.backdrop){
                wide_loaded = true;

                return this.setWide(art.backdrop);
            }

            // Кадра 16:9 нет вовсе — не растягиваем постер, а собираем плитку:
            // постер слева, название справа на градиенте
            if(!wide_loaded) this.html.addClass('nfx-card--noart');
        };

        /**
         * Поставить широкий кадр.
         * Пока кадр не загружен, плитка показывает постер в своих пропорциях
         * слева на градиенте — так не видно растянутого постера, и подмена
         * выглядит как переход, а не как загрузка.
         * @param {string} src
         */
        this.setWide = function(src){
            if(!src || !img_wide_el) return;

            var ready = function(){
                if(!_self.html) return;

                $(img_wide_el).addClass('nfx-card__img--loaded');
                _self.html.removeClass('nfx-card--pending');
            };

            img_wide_el.onload = ready;

            img_wide_el.onerror = function(){
                // Кадр не открылся — остаёмся на составной плитке
                if(!_self.html) return;

                _self.html.removeClass('nfx-card--pending');
                _self.html.addClass('nfx-card--noart');
            };

            img_wide_el.src = src;

            // Кадр уже в кеше браузера (сработал прогрев) — показываем сразу,
            // иначе на один кадр мигнула бы составная раскладка
            if(img_wide_el.complete && img_wide_el.naturalWidth) ready();
            else this.html.addClass('nfx-card--pending');
        };

        /** Карточка сейчас раскрыта (пульт или мышь) */
        this.focused = function(){
            return !!this.html && (this.html.hasClass('focus') || this.html.hasClass('hover'));
        };

        /** Навигация и события */
        this.bind = function(){
            // hover:focus — пульт и клавиатура, hover:hover — мышь, hover:touch — тач.
            // Класс .focus Lampa вешает во всех трёх случаях, поэтому раскрывать
            // карточку и обновлять метаданные надо тоже во всех трёх.
            this.html.on('hover:focus', function(){
                _self.expand('focus');

                if(_self.onFocus) _self.onFocus(_self.data, _self, 'focus');
            });

            this.html.on('hover:hover hover:touch', function(){
                _self.expand('hover');

                if(_self.onFocus) _self.onFocus(_self.data, _self, 'hover');
            });

            this.html.on('hover:enter', function(){
                if(_self.onEnter) _self.onEnter(_self.data, _self);
            });

            this.html.on('hover:long', function(){
                if(_self.onLong) _self.onLong(_self.data, _self);
            });
        };

        /**
         * @param {boolean} js вернуть DOM-элемент
         * @return {jQuery|HTMLElement}
         */
        this.render = function(js){
            return js ? this.html[0] : this.html;
        };

        this.destroy = function(){
            clearTimeout(art_timer);

            if(NFX_TR.card && this.html && NFX_TR.card[0] === this.html[0]) trailerStop();

            [img_el, img_wide_el].forEach(function(el){
                if(!el) return;

                el.onload = null;
                el.onerror = null;
                el.src = '';
            });

            if(this.html) this.html.remove();

            img_el      = null;
            img_wide_el = null;
            logo_el     = null;
            this.html   = null;
            this.data   = null;
        };
    }

    /**
     * Класс кегля для текстового названия: длинные названия должны читаться
     * как надпись на плакате, а не как абзац.
     * @param {string} title
     * @return {string}
     */
    function nameSize(title){
        var length = ('' + title).length;

        if(length > 34) return ' nfx-card__name--xlong';
        if(length > 18) return ' nfx-card__name--long';

        return '';
    }

    /**
     * Свежий релиз (< 45 дней) — бейдж NEW как на Netflix.
     * @param {object} card
     * @return {boolean}
     */
    function isNew(card){
        var date = card.release_date || card.first_air_date;

        if(!date) return false;

        var time = Date.parse(('' + date).replace(/-/g, '/'));

        if(isNaN(time)) return false;

        var days = (Date.now() - time) / 86400000;

        return days >= 0 && days < 45;
    }

    /* ---------- src/row.js ---------- */
    /**
     * Горизонтальная полка.
     * @param {object} data   {title, results, url, source, nfx_shape, nfx_rank, nfx_meta, nfx_activity}
     * @param {object} params {titles:boolean}
     */
    function NfxRow(data, params){
        var _self = this;

        this.data   = data || {};
        this.params = params || {};

        var shape   = this.data.nfx_shape || 'expand';
        var expand  = shape === 'expand';
        var ranked  = !!this.data.nfx_rank;
        var meta_on = expand || !!this.data.nfx_meta;
        var tv      = Lampa.Platform.screen('tv');
        var view    = tv ? 7 : 12;
        var items   = [];
        var built   = 0;
        var active  = 0;
        var last    = false;
        var scroll  = new Lampa.Scroll({ horizontal: true, step: expand ? 500 : (shape === 'wide' ? 420 : 300) });
        var more_el = null;
        var meta_el = null;
        var meta_id = 0;
        var pos_timer = null;

        /** Собрать DOM полки */
        this.create = function(){
            var html = '<div class="nfx-row nfx-row--' + shape + ' layer--visible">' +
                       '<div class="nfx-row__head">' +
                            '<div class="nfx-row__title">' + esc(this.data.title || '') + '</div>' +
                            '<div class="nfx-row__more">' + esc(tr('nfx_more')) + ' ›</div>' +
                       '</div>' +
                       '<div class="nfx-row__body"></div>' +
                       (meta_on ? '<div class="nfx-row__meta"><div class="nfx-row__meta-1"></div><div class="nfx-row__meta-2"></div></div>' : '') +
                       '</div>';

            this.html = $(html);

            more_el = this.html.find('.nfx-row__more');
            meta_el = meta_on ? this.html.find('.nfx-row__meta') : null;

            // Заголовок «Все ›» — только для мыши; на ТВ переход делается плиткой в конце полки
            more_el.on('click', function(){
                _self.more();
            });

            scroll.body(true).addClass('nfx-row__cards');
            scroll.onScroll = this.append.bind(this);
            scroll.onWheel  = this.wheel.bind(this);

            this.html.find('.nfx-row__body').append(scroll.render(true));

            this.html.on('visible', function(){
                Lampa.Layer.visible(scroll.render(true));
            });

            this.append();

            // Первые карточки полки готовим сразу — до первого наведения
            if(expand) artPrefetch((this.data.results || []).slice(0, 3));

            return this;
        };

        /** Догрузить карточки в скролл */
        this.append = function(){
            var results = this.data.results || [];
            var need    = tv ? (Math.round(active / view) + 1) * view + 1 : results.length;

            need = Math.min(need, results.length);

            if(built === 0) need = Math.min(Math.max(need, view), results.length);

            while(built < need){
                this.push(results[built], built);
                built++;
            }

            if(built >= results.length) this.pushMoreTile();

            Lampa.Layer.visible(scroll.render(true));
        };

        /**
         * Добавить одну карточку.
         * @param {object} element
         * @param {number} index
         */
        this.push = function(element, index){
            if(!element) return;

            var card = new NfxCard(element, {
                shape: shape,
                rank: ranked ? index + 1 : 0,
                titles: this.params.titles
            });

            card.create();

            card.onFocus = function(card_data, item, source){
                var prev = active;

                last   = card.render(true);
                active = indexOfItem(card);

                // Заранее тянем арт соседей, чтобы наведение было без задержки
                _self.prefetchAround(active);

                // При наведении мышью полку не двигаем — иначе контент уезжает
                // из-под курсора. Пультом — подтягиваем как на Netflix.
                if(source !== 'hover'){
                    if(expand && pinLeft()) _self.align(card.render(true));
                    else if(active > 0 || prev > active) scroll.update(card.render(true), true);
                }

                _self.setMeta(card_data);

                if(_self.onFocus) _self.onFocus(card_data);
            };

            card.onEnter = function(card_data){
                if(_self.onEnter) _self.onEnter(card_data);
            };

            card.onLong = function(card_data){
                if(_self.onLong) _self.onLong(card_data);
            };

            var render = card.render(true);

            // Догруженные карточки нужно добавить в коллекцию навигации,
            // иначе фокус не сможет уехать дальше уже отрисованных
            $(render).on('visible', function(){
                if(Lampa.Controller.own(_self)) Lampa.Controller.collectionAppend(render);
            });

            scroll.append(render);

            items.push(card);

            if(Lampa.Controller.own(this)) Lampa.Controller.collectionAppend(render);
        };

        /**
         * Фоновая подгрузка арта вокруг индекса.
         * @param {number} index
         */
        this.prefetchAround = function(index){
            if(!expand) return;

            var results = this.data.results || [];

            artPrefetch(results.slice(Math.max(0, index - 1), index + 5));

            // Кадр 16:9 тяжёлый, поэтому прогреваем узкое окно — вперёд по ходу листания
            artWarmBackdrops(results.slice(Math.max(0, index - 1), index + 3));
        };

        /**
         * Подтянуть раскрытую карточку к левому краю полки.
         * Lampa бросает hover:focus ДО установки класса .focus, поэтому в момент
         * события ширины ещё старые — считаем позицию на следующем тике.
         * @param {HTMLElement} element
         */
        this.align = function(element){
            clearTimeout(pos_timer);

            pos_timer = setTimeout(function(){
                if(!_self.html || !element) return;

                // Фокус мог уже уехать дальше — тогда позицию посчитает следующий вызов
                if(!$(element).hasClass('focus')) return;

                scroll.update(element, false);
            }, 0);
        };

        /**
         * Обновить строки метаданных под полкой.
         * @param {object} card_data
         */
        this.setMeta = function(card_data){
            if(!meta_el || !card_data) return;

            var id = ++meta_id;

            var meta = watchMeta(card_data, function(update){
                // Ответ мог прийти, когда фокус уже уехал на другую карточку
                if(id !== meta_id || !meta_el) return;

                meta_el.find('.nfx-row__meta-1').text(update.line1);
                meta_el.find('.nfx-row__meta-2').text(update.line2);
            });

            meta_el.find('.nfx-row__meta-1').text(meta.line1);
            meta_el.find('.nfx-row__meta-2').text(meta.line2);
        };

        /** Плитка «показать все» в конце полки */
        this.pushMoreTile = function(){
            if(more_el === null || this.tile_added) return;
            if(!this.data.url && !this.data.nfx_activity) return;

            this.tile_added = true;

            var tile = $('<div class="nfx-card nfx-card--more selector">' +
                            '<div class="nfx-card__view">' +
                                '<div class="nfx-card__more-ico">›</div>' +
                            '</div>' +
                         '</div>');

            tile.on('hover:enter', function(){
                _self.more();
            });

            var tileMeta = function(){
                last = tile[0];

                if(meta_el){
                    meta_el.find('.nfx-row__meta-1').text(_self.data.title || '');
                    meta_el.find('.nfx-row__meta-2').text(tr('nfx_more_all'));
                }
            };

            tile.on('hover:focus', function(){
                tileMeta();

                if(expand && pinLeft()) _self.align(tile[0]);
                else scroll.update(tile[0], true);
            });

            tile.on('hover:hover hover:touch', tileMeta);

            scroll.append(tile);

            if(Lampa.Controller.own(this)) Lampa.Controller.collectionAppend(tile[0]);
        };

        /** Переход в полный список */
        this.more = function(){
            var data = this.data;

            if(data.nfx_activity){
                var push = {};

                for(var key in data.nfx_activity) push[key] = data.nfx_activity[key];

                push.page = 1;

                return Lampa.Activity.push(push);
            }

            if(!data.url) return;

            Lampa.Activity.push({
                url: data.url,
                title: data.title,
                component: 'category_full',
                source: data.source || 'tmdb',
                page: 1
            });
        };

        /** Прокрутка колесом мыши */
        this.wheel = function(step){
            if(!Lampa.Controller.own(this)) this.toggle();

            var controller = Lampa.Controller.enabled().controller;

            if(controller) controller[step > 0 ? 'right' : 'left']();
        };

        /** Забрать фокус на себя */
        this.toggle = function(){
            this.html.addClass('nfx-row--active');

            this.prefetchAround(active);

            Lampa.Controller.add('nfx_row', {
                link: this,
                toggle: function(){
                    Lampa.Controller.collectionSet(scroll.render(true));
                    Lampa.Controller.collectionFocus(last || false, scroll.render(true));
                },
                right: function(){
                    if(Navigator.canmove('right')) Navigator.move('right');
                },
                left: function(){
                    if(Navigator.canmove('left')) Navigator.move('left');
                    else if(_self.onLeft) _self.onLeft();
                },
                up: function(){
                    if(_self.onUp) _self.onUp();
                },
                down: function(){
                    if(_self.onDown) _self.onDown();
                },
                back: function(){
                    if(_self.onBack) _self.onBack();
                }
            });

            Lampa.Controller.toggle('nfx_row');
        };

        /** Снять подсветку заголовка */
        this.blur = function(){
            if(this.html) this.html.removeClass('nfx-row--active');
        };

        this.render = function(js){
            return js ? this.html[0] : this.html;
        };

        this.destroy = function(){
            meta_id++;

            trailerStop();

            clearTimeout(pos_timer);

            for(var i = 0; i < items.length; i++) items[i].destroy();

            items = [];

            scroll.destroy();

            if(this.html) this.html.remove();

            this.html = null;
            this.data = null;
            meta_el   = null;
        };

        /** Индекс карточки в полке */
        function indexOfItem(card){
            for(var i = 0; i < items.length; i++){
                if(items[i] === card) return i;
            }

            return 0;
        }
    }

    /** Прижимать активную карточку к левому краю (сквозное листание) */
    function pinLeft(){
        var value = pref('nfx_pin');

        return value === true || value === 'true';
    }

    /* ---------- src/billboard.js ---------- */
    /**
     * Промо-баннер (billboard) как на главной Netflix.
     * @param {object} params {titles:boolean}
     */
    function NfxBillboard(params){
        var _self = this;

        this.params = params || {};

        var cards    = [];
        var index    = 0;
        var swap     = false;
        var timer    = null;
        var logo_req = 0;

        var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3.5v17l14-8.5z"/></svg>';
        var ICON_INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.6" stroke-linecap="round"/></svg>';

        /** Собрать DOM */
        this.create = function(){
            var html = '<div class="nfx-bb layer--visible">' +
                '<div class="nfx-bb__art"></div>' +
                '<div class="nfx-bb__art-next"></div>' +
                '<div class="nfx-bb__scrim"></div>' +
                '<div class="nfx-bb__scrim-b"></div>' +
                '<div class="nfx-bb__dots"></div>' +
                '<div class="nfx-bb__info">' +
                    '<div class="nfx-bb__brand"><span class="nfx-bb__kind"></span></div>' +
                    '<img class="nfx-bb__logo" style="display:none" alt="" />' +
                    '<div class="nfx-bb__title"></div>' +
                    '<div class="nfx-bb__meta"></div>' +
                    '<div class="nfx-bb__descr"></div>' +
                    '<div class="nfx-bb__buttons">' +
                        '<div class="nfx-btn nfx-btn--play selector">' + ICON_PLAY + '<span>' + esc(tr('nfx_play')) + '</span></div>' +
                        '<div class="nfx-btn nfx-btn--info selector">' + ICON_INFO + '<span>' + esc(tr('nfx_info')) + '</span></div>' +
                    '</div>' +
                '</div>' +
            '</div>';

            this.html = $(html);

            this.html.find('.nfx-btn--play').on('hover:enter', function(){ _self.play(); });
            this.html.find('.nfx-btn--info').on('hover:enter', function(){ _self.info(); });

            // Любое касание баннера откладывает автосмену на полный интервал,
            // чтобы карточка не подменилась под нажатием «Смотреть»
            this.html.find('.nfx-btn').on('hover:focus hover:hover hover:touch', function(){
                _self.rotate();
            });

            return this;
        };

        /**
         * Задать карточки для ротации.
         * @param {array} list
         */
        this.setCards = function(list){
            cards = list || [];

            if(!cards.length){
                this.html.addClass('nfx-bb--noart');
                this.html.find('.nfx-bb__descr').text('');
                return;
            }

            this.dots();
            this.show(0, true);
            this.rotate();
        };

        /** Индикаторы-точки */
        this.dots = function(){
            var box = this.html.find('.nfx-bb__dots').empty();

            if(cards.length < 2) return;

            for(var i = 0; i < cards.length; i++){
                box.append('<div class="nfx-bb__dot' + (i === 0 ? ' nfx-bb__dot--on' : '') + '"></div>');
            }
        };

        /**
         * Показать карточку.
         * @param {number} i
         * @param {boolean} immediately без плавного перехода
         */
        this.show = function(i, immediately){
            if(!cards.length) return;

            index = (i + cards.length) % cards.length;

            var card = cards[index];
            var art  = heroImage(card);

            // Крестфейд между двумя слоями
            var target = swap ? '.nfx-bb__art' : '.nfx-bb__art-next';

            this.html.find(target).css('background-image', art ? 'url("' + art + '")' : 'none');

            if(immediately){
                this.html.find('.nfx-bb__art').css('background-image', art ? 'url("' + art + '")' : 'none');
                this.html.removeClass('nfx-bb--swap');
                swap = false;
            }
            else {
                swap = !swap;
                this.html.toggleClass('nfx-bb--swap', swap);
            }

            this.fill(card);

            this.html.find('.nfx-bb__dot').each(function(n){
                $(this).toggleClass('nfx-bb__dot--on', n === index);
            });
        };

        /**
         * Заполнить текстовый блок.
         * @param {object} card
         */
        this.fill = function(card){
            var serial = isSerial(card);
            var match  = matchPercent(card);
            var year   = cardYear(card);
            var age    = ageLimit(card);
            var genres = genreNames(card);

            this.html.find('.nfx-bb__kind').text(serial ? tr('nfx_series') : tr('nfx_movie'));
            this.html.find('.nfx-bb__title').text(cardTitle(card));
            this.html.find('.nfx-bb__descr').text(cut(card.overview, 260));

            var meta = '';

            if(match) meta += '<span class="nfx-bb__match">' + match + '% ' + esc(tr('nfx_match')) + '</span>';
            if(year)  meta += '<span>' + year + '</span>';
            meta += '<span class="nfx-bb__age">' + age + '</span>';
            if(genres) meta += '<span>' + esc(genres) + '</span>';

            this.html.find('.nfx-bb__meta').html(meta);

            // Логотип-надпись подгружаем асинхронно
            var logo  = this.html.find('.nfx-bb__logo');
            var title = this.html.find('.nfx-bb__title');
            var req   = ++logo_req;

            logo.hide();
            title.show();

            titleLogo(card, function(src){
                if(req !== logo_req || !_self.html) return;

                if(src){
                    logo.attr('src', src).show();
                    title.hide();
                }
            });
        };

        /** Автосмена баннера */
        this.rotate = function(){
            this.stop();

            var seconds = parseInt(pref('nfx_rotate'), 10);

            if(!seconds || cards.length < 2) return;

            timer = setInterval(function(){
                if(!_self.html) return _self.stop();

                _self.show(index + 1);
            }, seconds * 1000);
        };

        this.stop = function(){
            if(timer) clearInterval(timer);

            timer = null;
        };

        /** Текущая карточка */
        this.card = function(){
            return cards.length ? cards[index] : null;
        };

        /** «Смотреть» */
        this.play = function(){
            var card = this.card();

            if(!card) return;

            nfxAutoPlay(card);
        };

        /** «Подробнее» */
        this.info = function(){
            var card = this.card();

            if(!card) return;

            openCard(card);
        };

        /** Забрать фокус на кнопки баннера */
        this.toggle = function(){
            var buttons = this.html.find('.nfx-bb__buttons')[0];

            Lampa.Controller.add('nfx_billboard', {
                link: this,
                toggle: function(){
                    Lampa.Controller.collectionSet(buttons);
                    Lampa.Controller.collectionFocus(_self.html.find('.nfx-btn--play')[0], buttons);
                },
                right: function(){
                    Navigator.move('right');
                },
                left: function(){
                    if(Navigator.canmove('left')) Navigator.move('left');
                    else if(_self.onLeft) _self.onLeft();
                },
                up: function(){
                    if(_self.onUp) _self.onUp();
                },
                down: function(){
                    if(_self.onDown) _self.onDown();
                },
                back: function(){
                    if(_self.onBack) _self.onBack();
                }
            });

            Lampa.Controller.toggle('nfx_billboard');
        };

        this.render = function(js){
            return js ? this.html[0] : this.html;
        };

        this.destroy = function(){
            this.stop();

            if(this.html) this.html.remove();

            this.html = null;
            cards = [];
        };
    }

    /**
     * Открыть карточку и сразу нажать «Смотреть» — поведение Play на Netflix.
     * @param {object} card
     */
    function nfxAutoPlay(card){
        nfx_autoplay_wait = true;

        openCard(card);
    }

    /** Флаг ожидания автозапуска */
    var nfx_autoplay_wait = false;

    /** Подписка на построение полной карточки для автозапуска */
    function autoPlayInit(){
        Lampa.Listener.follow('full', function(e){
            if(!nfx_autoplay_wait) return;
            if(e.type !== 'build' || e.name !== 'start') return;

            nfx_autoplay_wait = false;

            setTimeout(function(){
                var button = e.body.find('.button--priority');

                if(!button.length) button = e.body.find('.button--play');

                if(button.length) button.trigger('hover:enter');
            }, 400);
        });

        // Если карточка не открылась — снимаем флаг
        Lampa.Listener.follow('activity', function(e){
            if(e.type === 'start' && e.component !== 'full') nfx_autoplay_wait = false;
        });
    }

    /* ---------- src/component.js ---------- */
    /**
     * Главная страница в стиле Netflix TV.
     * Регистрируется как компонент 'nfx_main' (и подменяет 'main', если включено).
     * @param {object} object параметры активности
     */
    function NfxMain(object){
        var _self = this;

        this.object = object || {};

        var scroll    = new Lampa.Scroll({ over: true, end_ratio: 2 });
        var nav       = null;
        var billboard = null;
        var rows      = [];
        var sections  = [];
        var active    = 0;
        var parts     = [];
        var next_wait = false;
        var built     = false;
        var tab       = this.object.nfx_tab || 'home';

        // Растёт при смене вкладки: отсекает ответы запросов от прошлой вкладки
        var token = 0;

        /** Создание компонента */
        this.create = function(){
            this.activity.loader(true);

            this.html = $('<div class="nfx"></div>');

            scroll.height();
            scroll.nopadding();

            scroll.onEnd   = this.loadNext.bind(this);
            scroll.onWheel = this.wheel.bind(this);

            this.rows_box = $('<div class="nfx-rows"></div>');

            if(navEnabled()){
                nav = new NfxNav({ tab: tab });
                nav.create();

                nav.onSelect = function(key){ _self.setTab(key); };
                nav.onDown   = function(){ Lampa.Controller.toggle('content'); };
                nav.onBack   = function(){ _self.back(); };

                this.html.append(nav.render(true));
            }

            this.buildBillboard();

            scroll.append(this.rows_box);

            this.html.append(scroll.render(true));

            this.reload();
        };

        /** Баннер нужен не на всех вкладках: на «Моё» его нет, как в Netflix */
        this.buildBillboard = function(){
            var need = showBillboard() && tab !== 'my';

            if(need && !billboard){
                billboard = new NfxBillboard({});
                billboard.create();

                billboard.onDown = function(){ _self.down(); };
                billboard.onUp   = function(){ _self.focusNav(); };
                billboard.onLeft = function(){ Lampa.Controller.toggle('menu'); };
                billboard.onBack = function(){ _self.back(); };

                // Баннер всегда первым в скролле
                scroll.body(true).insertBefore(billboard.render(true), scroll.body(true).firstChild);

                billboardCards(function(list){
                    if(!_self.html || !billboard) return;

                    billboard.setCards(list);
                });
            }

            if(!need && billboard){
                billboard.destroy();
                billboard = null;
            }

            this.html.toggleClass('nfx--no-hero', !billboard);
        };

        /**
         * Переключить вкладку.
         * @param {string} key
         */
        this.setTab = function(key){
            if(key === tab) return;

            tab   = key;
            token++;

            trailerStop();

            this.object.nfx_tab = key;

            apiClear();

            for(var i = 0; i < rows.length; i++) rows[i].destroy();

            rows      = [];
            sections  = [];
            active    = 0;
            built     = false;
            next_wait = false;

            this.rows_box.empty();

            this.buildBillboard();

            scroll.reset();

            this.activity.loader(true);

            this.reload();
        };

        /** Собрать полки текущей вкладки */
        this.reload = function(){
            parts = buildParts(tab);

            if(billboard) sections.push(billboard);

            this.loadPart(this.build.bind(this), this.empty.bind(this));
        };

        /**
         * Загрузить очередную порцию полок.
         * @param {function} loaded
         * @param {function} fail
         */
        this.loadPart = function(loaded, fail){
            var mine = token;

            partNext(parts, NFX.parts_limit, function(data){
                if(mine !== token) return;

                loaded(data);
            }, function(){
                if(mine !== token) return;

                fail();
            });
        };

        /**
         * Отрисовать полученные полки.
         * @param {array} data
         */
        this.build = function(data){
            if(!this.html) return;

            this.append(data);

            built = true;

            this.activity.loader(false);
            this.activity.toggle();
        };

        /** Ничего не пришло */
        this.empty = function(){
            if(!this.html || built) return;

            // На «Моё» все полки локальные: пусто — значит списки пустые, а не сбой сети
            var personal = tab === 'my';

            this.rows_box.append(
                '<div class="nfx-empty">' +
                    '<div class="nfx-empty__title">' + esc(tr(personal ? 'nfx_empty_my' : 'nfx_empty')) + '</div>' +
                    '<div class="nfx-empty__hint">' + esc(tr(personal ? 'nfx_empty_my_hint' : 'nfx_empty_hint')) + '</div>' +
                '</div>'
            );

            this.activity.loader(false);
            this.activity.toggle();
        };

        /**
         * Добавить полки в DOM.
         * @param {array} data
         */
        this.append = function(data){
            if(!data || !data.length || !this.html) return;

            var fragment = document.createDocumentFragment();

            for(var i = 0; i < data.length; i++){
                var item = data[i];

                if(!item || !item.results || !item.results.length) continue;

                var row = new NfxRow(item, { titles: showTitles() });

                row.create();

                this.bindRow(row);

                fragment.appendChild(row.render(true));

                rows.push(row);
                sections.push(row);
            }

            this.rows_box[0].appendChild(fragment);

            Lampa.Layer.visible(scroll.render(true));
        };

        /**
         * Навесить обработчики на полку.
         * @param {object} row
         */
        this.bindRow = function(row){
            row.onUp    = function(){ _self.up(); };
            row.onDown  = function(){ _self.down(); };
            row.onLeft  = function(){ Lampa.Controller.toggle('menu'); };
            row.onBack  = function(){ _self.back(); };

            row.onEnter = function(card){ openCard(card); };
            row.onLong  = function(card){ cardMenu(card); };

            row.onFocus = function(){ active = indexOfSection(row); };
        };

        /** Подгрузка следующей порции при достижении конца */
        this.loadNext = function(){
            if(next_wait || !built) return;

            next_wait = true;

            this.loadPart(function(data){
                next_wait = false;

                if(!_self.html) return;

                _self.append(data);
            }, function(){
                next_wait = false;
            });
        };

        /** Вниз по секциям */
        this.down = function(){
            if(active >= sections.length - 1){
                this.loadNext();
                return;
            }

            active++;

            this.focusSection();
        };

        /** Вверх по секциям, с первой — на верхнюю панель */
        this.up = function(){
            if(active <= 0) return this.focusNav();

            active--;

            this.focusSection();
        };

        /** Фокус на верхнюю панель (или на шапку Lampa, если панель отключена) */
        this.focusNav = function(){
            if(nav){
                scroll.reset();

                return nav.toggle();
            }

            Lampa.Controller.toggle('head');
        };

        /** Передать фокус активной секции */
        this.focusSection = function(){
            var section = sections[active];

            // Пустая вкладка: фокусировать нечего — отдаём управление панели
            if(!section) return this.focusNav();

            for(var i = 0; i < rows.length; i++){
                if(rows[i] !== section) rows[i].blur();
            }

            // Прижимаем к верху: у полки есть «якорь» высотой навбара, поэтому
            // заголовок не уезжает под панель, а баннер уходит из кадра целиком
            scroll.update(section.render(true));

            section.toggle();
        };

        /** Колесо мыши */
        this.wheel = function(step){
            if(step > 0) this.down();
            else this.up();
        };

        this.back = function(){
            Lampa.Activity.backward();
        };

        /** Старт активности */
        this.start = function(){
            $('body').addClass('nfx--home');
            $('body').toggleClass('nfx--nav', !!nav);

            if(billboard) billboard.rotate();

            Lampa.Controller.add('content', {
                link: this,
                toggle: function(){
                    scroll.restorePosition();

                    _self.focusSection();
                },
                left: function(){
                    if(Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function(){
                    Navigator.move('right');
                },
                up: function(){
                    _self.up();
                },
                down: function(){
                    _self.down();
                },
                back: function(){
                    _self.back();
                }
            });

            Lampa.Controller.toggle('content');
        };

        this.pause = function(){
            $('body').removeClass('nfx--home nfx--nav');

            trailerStop();

            if(billboard) billboard.stop();
        };

        this.stop = function(){
            $('body').removeClass('nfx--home nfx--nav');

            trailerStop();

            if(billboard) billboard.stop();
        };

        this.resize = function(){
            if(sections[active]) scroll.update(sections[active].render(true));
        };

        this.render = function(js){
            return js ? this.html[0] : this.html;
        };

        this.destroy = function(){
            $('body').removeClass('nfx--home nfx--nav');

            trailerStop();

            token++;

            apiClear();

            if(nav) nav.destroy();
            if(billboard) billboard.destroy();

            for(var i = 0; i < rows.length; i++) rows[i].destroy();

            rows     = [];
            sections = [];
            parts    = [];

            scroll.destroy();

            if(this.html) this.html.remove();

            this.html = null;
            nav       = null;
            billboard = null;
        };

        /** Индекс секции */
        function indexOfSection(section){
            for(var i = 0; i < sections.length; i++){
                if(sections[i] === section) return i;
            }

            return active;
        }
    }

    /** Показывать верхнюю панель? */
    function navEnabled(){
        var value = pref('nfx_nav');

        return value === true || value === 'true';
    }

    /** Показывать баннер? */
    function showBillboard(){
        var value = pref('nfx_billboard');

        return value === true || value === 'true';
    }

    /** Показывать подписи под карточками? */
    function showTitles(){
        var value = pref('nfx_titles');

        return value === true || value === 'true';
    }

    /**
     * Контекстное меню карточки (длинное нажатие / OK-hold).
     * @param {object} card
     */
    function cardMenu(card){
        var enabled = Lampa.Controller.enabled().name;
        var marks   = {};

        try { marks = Lampa.Favorite.check(card) || {}; }
        catch(e){}

        var items = [
            { title: tr('nfx_play'), action: 'play' },
            { title: tr('nfx_info'), action: 'info' },
            { title: (marks.book ? '- ' : '+ ') + tr('nfx_row_mylist'), action: 'book' }
        ];

        Lampa.Select.show({
            title: Lampa.Lang.translate('title_action'),
            items: items,
            onSelect: function(item){
                Lampa.Controller.toggle(enabled);

                if(item.action === 'play') nfxAutoPlay(card);
                if(item.action === 'info') openCard(card);

                if(item.action === 'book'){
                    Lampa.Favorite.toggle('book', card);
                    Lampa.Noty.show(Lampa.Lang.translate('title_book') + ': ' + cardTitle(card));
                }
            },
            onBack: function(){
                Lampa.Controller.toggle(enabled);
            }
        });
    }

    /* ---------- src/settings.js ---------- */
    /**
     * Раздел настроек плагина.
     */

    /** Иконка раздела настроек — единственное место, где остался красный знак */
    var NFX_ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M5 2h4.6l4.9 12.6V2H19v20h-4.6L9.5 9.2V22H5V2z" fill="#e50914"/></svg>';

    /** Иконка пункта в боковом меню — нейтральная */
    var NFX_MENU_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">' +
        '<rect x="3" y="4" width="7.5" height="16" rx="1.2"/>' +
        '<rect x="13.5" y="4" width="7.5" height="7" rx="1.2"/>' +
        '<rect x="13.5" y="13" width="7.5" height="7" rx="1.2"/></svg>';

    function settingsInit(){
        Lampa.SettingsApi.addComponent({
            component: 'nfx',
            name: tr('nfx_title'),
            icon: NFX_ICON
        });

        param({ name: 'nfx_head_view', type: 'title' }, { name: tr('nfx_settings_descr') });

        param(
            { name: 'nfx_theme', type: 'trigger', default: true },
            { name: tr('nfx_param_theme'), description: tr('nfx_param_theme_d') }
        );

        param(
            { name: 'nfx_home', type: 'trigger', default: true },
            { name: tr('nfx_param_home'), description: tr('nfx_param_home_d') }
        );

        param(
            { name: 'nfx_nav', type: 'trigger', default: true },
            { name: tr('nfx_param_nav'), description: tr('nfx_param_nav_d') }
        );

        param(
            { name: 'nfx_billboard', type: 'trigger', default: true },
            { name: tr('nfx_param_billboard'), description: tr('nfx_param_billboard_d') }
        );

        param(
            {
                name: 'nfx_rotate',
                type: 'select',
                default: '12',
                values: {
                    '0': Lampa.Lang.translate('settings_param_no'),
                    '8': '8 ' + secLabel(),
                    '12': '12 ' + secLabel(),
                    '20': '20 ' + secLabel(),
                    '40': '40 ' + secLabel()
                }
            },
            { name: tr('nfx_param_rotate') }
        );

        param(
            {
                name: 'nfx_shape',
                type: 'select',
                default: 'expand',
                values: {
                    expand: tr('nfx_param_shape_exp'),
                    wide: tr('nfx_param_shape_wide'),
                    poster: tr('nfx_param_shape_post')
                }
            },
            { name: tr('nfx_param_shape') }
        );

        param(
            { name: 'nfx_pin', type: 'trigger', default: true },
            { name: tr('nfx_param_pin'), description: tr('nfx_param_pin_d') }
        );

        param(
            { name: 'nfx_titles', type: 'trigger', default: false },
            { name: tr('nfx_param_titles') }
        );

        param(
            {
                name: 'nfx_font',
                type: 'select',
                default: 'golos-montserrat',
                values: {
                    'golos-montserrat': tr('nfx_font_gm'),
                    'golos': tr('nfx_font_golos'),
                    'manrope': tr('nfx_font_manrope'),
                    'montserrat': tr('nfx_font_montserrat'),
                    'inter': tr('nfx_font_inter'),
                    'inter-montserrat': tr('nfx_font_im'),
                    'custom': tr('nfx_font_custom'),
                    'off': tr('nfx_font_system')
                }
            },
            { name: tr('nfx_param_font'), description: tr('nfx_param_font_d') }
        );

        param(
            { name: 'nfx_font_family', type: 'input', values: '', default: '', placeholder: 'Golos Sharp' },
            { name: tr('nfx_param_font_fam'), description: tr('nfx_param_font_fam_d') }
        );

        param(
            { name: 'nfx_font_css', type: 'input', values: '', default: '', placeholder: 'http://127.0.0.1:9118/golos-sharp.css' },
            { name: tr('nfx_param_font_css'), description: tr('nfx_param_font_css_d') }
        );

        param(
            {
                name: 'nfx_trailer',
                type: 'select',
                default: '0',
                values: {
                    '0': Lampa.Lang.translate('settings_param_no'),
                    '2': '2 ' + secLabel(),
                    '3': '3 ' + secLabel(),
                    '5': '5 ' + secLabel()
                }
            },
            { name: tr('nfx_param_trailer'), description: tr('nfx_param_trailer_d') }
        );

        param(
            { name: 'nfx_trailer_sound', type: 'trigger', default: false },
            { name: tr('nfx_param_trailer_s'), description: tr('nfx_param_trailer_s_d') }
        );

        param(
            { name: 'nfx_prefetch', type: 'trigger', default: true },
            { name: tr('nfx_param_prefetch'), description: tr('nfx_param_prefetch_d') }
        );

        param(
            { name: 'nfx_top10', type: 'trigger', default: true },
            { name: tr('nfx_param_top10') }
        );

        param(
            { name: 'nfx_lampac_rows', type: 'trigger', default: true },
            { name: tr('nfx_param_lampac'), description: tr('nfx_param_lampac_d') }
        );

        param(
            { name: 'nfx_host', type: 'input', values: '', default: '', placeholder: 'http://127.0.0.1:9118' },
            { name: tr('nfx_param_host'), description: tr('nfx_param_host_d') }
        );

        param(
            { name: 'nfx_open', type: 'button' },
            { name: tr('nfx_param_open') },
            function(){
                Lampa.Settings.close();
                openHome();
            }
        );
    }

    /**
     * Короткая обёртка над SettingsApi.addParam.
     * @param {object} p параметр
     * @param {object} field подпись
     * @param {function} onChange
     */
    function param(p, field, onChange){
        var data = {
            component: 'nfx',
            param: p,
            field: field
        };

        if(onChange) data.onChange = onChange;

        Lampa.SettingsApi.addParam(data);
    }

    /** «сек» на языке интерфейса */
    function secLabel(){
        return Lampa.Lang.selected(['ru', 'uk', 'be', 'bg']) ? 'сек' : 'sec';
    }

    /** Открыть главную Netflix отдельной активностью */
    function openHome(){
        Lampa.Activity.push({
            url: '',
            title: tr('nfx_title'),
            component: 'nfx_main',
            page: 1
        });
    }

    /** Перестроить главную, если она сейчас открыта */
    function refreshHome(){
        var active = Lampa.Activity.active();

        if(!active) return;

        // 'main' тоже перерисовываем: при выключении подмены нужно вернуть штатный экран
        if(active.component === 'nfx_main' || active.component === 'main'){
            Lampa.Activity.replace();
        }
    }

    /* ---------- src/menu.js ---------- */
    /**
     * Пункт «Netflix» в боковом меню.
     */
    function menuInit(){
        addMenuItem();

        // Меню может быть перерисовано (смена языка, редактор меню)
        Lampa.Listener.follow('menu', function(e){
            if(e.type === 'start') setTimeout(addMenuItem, 100);
        });
    }

    /** Вставить пункт первым в списке меню */
    function addMenuItem(){
        var list = $('.menu .menu__list').eq(0);

        if(!list.length) return;
        if(list.find('[data-action="nfx"]').length) return;

        var item = $(
            '<li class="menu__item selector" data-action="nfx">' +
                '<div class="menu__ico">' + NFX_MENU_ICON + '</div>' +
                '<div class="menu__text">' + esc(tr('nfx_title')) + '</div>' +
            '</li>'
        );

        item.on('hover:enter', function(){
            openHome();
        });

        list.prepend(item);
    }

    /* ---------- src/start.js ---------- */
    /**
     * Точка входа: регистрация компонентов, темы, меню и настроек.
     */

    /** Оригинальный компонент главной страницы Lampa */
    var nfx_main_original = null;

    /** Включена ли подмена главной страницы */
    function homeEnabled(){
        var value = pref('nfx_home');

        return value === true || value === 'true';
    }

    /** Подменить/вернуть штатный компонент 'main' */
    function applyHome(){
        if(homeEnabled()) Lampa.Component.add('main', NfxMain);
        else if(nfx_main_original) Lampa.Component.add('main', nfx_main_original);
    }

    /** Настройки, требующие перерисовки главной */
    var NFX_REFRESH_PARAMS = ['nfx_nav', 'nfx_billboard', 'nfx_rotate', 'nfx_shape', 'nfx_titles', 'nfx_top10', 'nfx_prefetch', 'nfx_pin', 'nfx_lampac_rows'];

    /**
     * Реакция на изменение настроек.
     * Ловим через Storage, а не через onChange параметра — так работает
     * и синхронизация аккаунта, и изменения из других плагинов.
     */
    function watchSettings(){
        Lampa.Storage.listener.follow('change', function(e){
            if(!e || ('' + e.name).indexOf('nfx_') !== 0) return;

            if(e.name === 'nfx_theme') return themeToggle(e.value === true || e.value === 'true');

            if(e.name === 'nfx_font' || e.name === 'nfx_font_family' || e.name === 'nfx_font_css') return fontApply();

            if(e.name === 'nfx_home'){
                applyHome();

                return refreshHome();
            }

            if(e.name === 'nfx_host'){
                detectHost();

                return refreshHome();
            }

            // Трейлер не требует перерисовки — достаточно погасить текущий
            if(e.name === 'nfx_trailer' || e.name === 'nfx_trailer_sound') return trailerStop();

            if(indexOf(NFX_REFRESH_PARAMS, e.name) > -1) refreshHome();
        });
    }

    /** Инициализация плагина */
    function nfxStart(){
        if(window.nfx_plugin_started) return;

        window.nfx_plugin_started = true;

        langInit();
        settingsInit();
        detectHost();
        themeInit();
        fontApply();
        autoPlayInit();

        nfx_main_original = Lampa.Component.get('main');

        Lampa.Component.add('nfx_main', NfxMain);

        applyHome();
        menuInit();
        watchSettings();

        // Если главная уже открыта штатным компонентом — перерисовать её
        var active = Lampa.Activity.active();

        if(homeEnabled() && active && active.component === 'main'){
            Lampa.Activity.replace();
        }

        // Точка для отладки: window.nfx_trailer_state()
        window.nfx_trailer_state = trailerState;

        console.log('NetflixUI', 'started v' + NFX.version, 'lampac host:', NFX.host || '(не найден)');
    }

    /** Дождаться готовности Lampa и запуститься */
    function nfxBoot(){
        if(typeof Lampa === 'undefined'){
            var timer = setInterval(function(){
                if(typeof Lampa === 'undefined') return;

                clearInterval(timer);
                nfxBoot();
            }, 200);

            return;
        }

        if(window.appready) nfxStart();
        else {
            Lampa.Listener.follow('app', function(e){
                if(e.type === 'ready') nfxStart();
            });
        }
    }

    nfxBoot();
})();
