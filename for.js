/**
 * Ліхтар Studios2 — плагін головної сторінки (Flixio Team).
 * Кастомна головна, стрімінги, студії, підписки на студії, Кіноогляд.
 */
(function () {
    'use strict';

    window.FLIXIO_STUDIOS_VER = '4.0';
    window.FLIXIO_STUDIOS_LOADED = false;
    window.FLIXIO_STUDIOS_ERROR = null;

    if (typeof Lampa === 'undefined') {
        window.FLIXIO_STUDIOS_ERROR = 'Lampa not found (script loaded before app?)';
        return;
    }


    // =================================================================
    // CONFIGURATION & CONSTANTS
    // =================================================================

    var currentScript = document.currentScript || [].slice.call(document.getElementsByTagName('script')).filter(function (s) {
        return (s.src || '').indexOf('studios') !== -1 || (s.src || '').indexOf('fix.js') !== -1 || (s.src || '').indexOf('flixio') !== -1;
    })[0];

    // Force CDN usage to ensure logos load correctly regardless of installation method
    var FLIXIO_BASE_URL = 'https://cdn.jsdelivr.net/gh/syvyj/studio_2@main/';
    var FLIXIO_LOGO_FALLBACK_CDN = 'https://cdn.jsdelivr.net/gh/syvyj/studio_2@main/';
/*
    var FLIXIO_BASE_URL = (currentScript && currentScript.src) ? currentScript.src.replace(/[#?].*$/, '').replace(/[^/]+$/, '') : 'http://127.0.0.1:3000/';
    
    if (FLIXIO_BASE_URL.indexOf('raw.githubusercontent.com') !== -1) {
        FLIXIO_BASE_URL = FLIXIO_BASE_URL
            .replace('raw.githubusercontent.com', 'cdn.jsdelivr.net/gh')
            .replace(/\/([^@/]+\/[^@/]+)\/main\//, '/$1@main/')
            .replace(/\/([^@/]+\/[^@/]+)\/master\//, '/$1@master/');
    } else if (FLIXIO_BASE_URL.indexOf('.github.io') !== -1) {
        // e.g. https://syvyj.github.io/studio_2/ → https://cdn.jsdelivr.net/gh/syvyj/studio_2@main/
        var gitioMatch = FLIXIO_BASE_URL.match(/https?:\/\/([^.]+)\.github\.io\/([^/]+)\//i);
        if (gitioMatch) {
            FLIXIO_BASE_URL = 'https://cdn.jsdelivr.net/gh/' + gitioMatch[1] + '/' + gitioMatch[2] + '@main/';
        }
    }
*/
    var FLIXIO_LANG = (Lampa.Storage.get('language', 'uk') || 'uk').toLowerCase();
    if (FLIXIO_LANG === 'ua') FLIXIO_LANG = 'uk';
    if (['uk', 'ru', 'en', 'pl'].indexOf(FLIXIO_LANG) === -1) FLIXIO_LANG = 'en';

    var FLIXIO_I18N = {
        hero_row_title: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        hero_row_title_full: { uk: '🔥 Новинки прокату', ru: '🔥 Новинки проката', en: '🔥 New theatrical releases', pl: '🔥 Nowości kinowe' },
        streamings_row_title: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        streamings_row_title_full: { uk: '📺 Стрімінги', ru: '📺 Стриминги', en: '📺 Streaming', pl: '📺 Serwisy streamingowe' },
        ukrainian_feed_name: { uk: 'Українська стрічка', ru: 'Украинская лента', en: 'Ukrainian feed', pl: 'Ukraiński feed' },
        polish_feed_name: { uk: 'Польська стрічка', ru: 'Польская лента', en: 'Polish feed', pl: 'Polski feed' },
        russian_feed_name: { uk: 'Російська стрічка', ru: 'Русская лента', en: 'Russian feed', pl: 'Rosyjski feed' },
        ru_new_movies: { uk: '🔥 Нові фільми', ru: '🔥 Новые фильмы', en: '🔥 New movies', pl: '🔥 Nowe filmy' },
        ru_new_tv: { uk: '🔥 Нові серіали', ru: '🔥 Новые сериалы', en: '🔥 New series', pl: '🔥 Nowe seriale' },
        ru_shows: { uk: '🎤 Шоу та Реаліті', ru: '🎤 Шоу и реалити', en: '🎤 Shows & Reality', pl: '🎤 Show i Reality' },
        ru_trending_movies: { uk: '📈 Популярні фільми', ru: '📈 Популярные фильмы', en: '📈 Trending movies', pl: '📈 Popularne filmy' },
        ru_trending_series: { uk: '📈 Популярні серіали', ru: '📈 Популярные сериалы', en: '📈 Trending series', pl: '📈 Popularne seriale' },
        ru_best_movies: { uk: '⭐ Найкращі фільми', ru: '⭐ Лучшие фильмы', en: '⭐ Best movies', pl: '⭐ Najlepsze filmy' },
        ru_all_movies: { uk: '🎬 Всі фільми (Ru)', ru: '🎬 Все фильмы (Ru)', en: '🎬 All movies (Ru)', pl: '🎬 Wszystkie filmy (Ru)' },
        ru_all_series: { uk: '📺 Всі серіали (Ru)', ru: '📺 Все сериалы (Ru)', en: '📺 All series (Ru)', pl: '📺 Wszystkie seriale (Ru)' },
        ru_all_shows: { uk: '🎤 Всі шоу (Ru)', ru: '🎤 Все шоу (Ru)', en: '🎤 All shows (Ru)', pl: '🎤 Wszystkie show (Ru)' },
        ukrainian_row_title: { uk: 'Новинки української стрічки', ru: 'Новинки украинской ленты', en: 'New in Ukrainian feed', pl: 'Nowości w ukraińskiej sekcji' },
        ukrainian_row_title_full: { uk: '🇺🇦 Новинки української стрічки', ru: '🇺🇦 Новинки украинской ленты', en: '🇺🇦 New in Ukrainian feed', pl: '🇺🇦 Nowości w ukraińskiej sekcji' },
        polish_row_title: { uk: 'Новинки польської стрічки', ru: 'Новинки польской ленты', en: 'New in Polish feed', pl: 'Nowości w polskiej sekcji' },
        polish_row_title_full: { uk: '🇵🇱 Новинки польської стрічки', ru: '🇵🇱 Новинки польской ленты', en: '🇵🇱 New in Polish feed', pl: '🇵🇱 Nowości w polskiej секcji' },
        russian_row_title: { uk: 'Новинки російської стрічки', ru: 'Новинки Русской ленты', en: 'New in Russian feed', pl: 'Nowości w rosyjskiej sekcji' },
        russian_row_title_full: { uk: '🇷🇺 Новинки російської стрічки', ru: '🇷🇺 Новинки Русской ленты', en: '🇷🇺 New in Russian feed', pl: '🇷🇺 Nowości w rosyjskiej sekcji' },
        english_row_title: { uk: 'Новинки англомовної стрічки', ru: 'Новинки Английской ленты', en: 'New in English feed', pl: 'Nowości w anglojęzycznej sekcji' },
        english_row_title_full: { uk: 'En Новинки англомовної стрічки', ru: 'En Новинки Английской ленты', en: 'En New in English feed', pl: 'En Nowości w anglojęzycznej sekcji' },
        mood_row_title: { uk: 'Кіно під настрій', ru: 'Кино по настроению', en: 'Mood movies', pl: 'Kino na nastrój' },
        mood_row_title_full: { uk: '🎭 Кіно під настрій', ru: '🎭 Кино по настроению', en: '🎭 Mood movies', pl: '🎭 Kino na nastrój' },
        mood_cry: { uk: 'До сліз / Катарсис', ru: 'До слёз / Катaрсис', en: 'To tears / Catharsis', pl: 'Do łez / Katarzis' },
        mood_positive: { uk: 'Чистий позитив', ru: 'Чистый позитив', en: 'Pure positivity', pl: 'Czysty pozytyw' },
        mood_tasty: { uk: 'Смачний перегляд', ru: 'Вкусный просмотр', en: 'Tasty watch', pl: 'Smaczne oglądanie' },
        mood_adrenaline: { uk: 'Адреналін', ru: 'Адреналин', en: 'Adrenaline', pl: 'Adrenalina' },
        mood_butterflies: { uk: 'Метелики в животі', ru: 'Бабочки в животе', en: 'Butterflies in the stomach', pl: 'Motyle w brzuchu' },
        mood_tension: { uk: 'На межі / Напруга', ru: 'На грани / Напряжение', en: 'On the edge / Tension', pl: 'Na krawędzi / Napięcie' },
        mood_adventure: { uk: 'Пошук пригод', ru: 'В поисках приключений', en: 'Looking for adventure', pl: 'W poszukiwaniu przygód' },
        mood_together: { uk: 'Разом веселіше', ru: 'Вместе веселее', en: 'More fun together', pl: 'Razem weselej' },
        mood_family: { uk: 'Малим і дорослим', ru: 'Малым и взрослым', en: 'For kids and adults', pl: 'Dla małych i dużych' },
        mood_your_choice: { uk: 'На твій смак', ru: 'На твой вкус', en: 'To your taste', pl: 'Według twojego gustu' },
        today_on_prefix: { uk: 'Сьогодні на ', ru: 'Сегодня на ', en: 'Today on ', pl: 'Dziś na ' },
        go_to_page: { uk: 'На сторінку', ru: 'На страницу', en: 'Open page', pl: 'Na stronę' },
        cat_new_movies: { uk: '🔥 Нові фільми', ru: '🔥 Новые фильмы', en: '🔥 New movies', pl: '🔥 Nowe filmy' },
        cat_new_tv: { uk: '🔥 Нові серіали', ru: '🔥 Новые сериалы', en: '🔥 New series', pl: '🔥 Nowe seriale' },
        cat_top_tv: { uk: '🏆 Топ Серіали', ru: '🏆 Топ сериалы', en: '🏆 Top series', pl: '🏆 Top seriale' },
        cat_top_movies: { uk: '🏆 Топ Фільми', ru: '🏆 Топ фильмы', en: '🏆 Top movies', pl: '🏆 Top filmy' },
        cat_top_movies_wb: { uk: '🏆 Топ Фільми (WB)', ru: '🏆 Топ фильмы (WB)', en: '🏆 Top movies (WB)', pl: '🏆 Top filmy (WB)' },
        cat_only_netflix: { uk: '🅰️ Тільки на Netflix (Originals)', ru: '🅰️ Только на Netflix (Originals)', en: '🅰️ Only on Netflix (Originals)', pl: '🅰️ Tylko na Netflix (Originals)' },
        cat_twisted_thrillers: { uk: '🤯 Заплутані трилери', ru: '🤯 Запутанные триллеры', en: '🤯 Twisted thrillers', pl: '🤯 Pokręcone thrillery' },
        cat_fantasy_sci: { uk: '🐉 Фантастика та Фентезі', ru: '🐉 Фантастика и фэнтези', en: '🐉 Sci‑Fi & Fantasy', pl: '🐉 Sci‑Fi i fantasy' },
        cat_kdrama: { uk: '🇰🇷 K-Dramas (Корея)', ru: '🇰🇷 K‑Дорамы (Корея)', en: '🇰🇷 K‑Dramas (Korea)', pl: '🇰🇷 K‑dramy (Korea)' },
        cat_truecrime_doc: { uk: '🔪 Документальний True Crime', ru: '🔪 Документальный True Crime', en: '🔪 True Crime documentaries', pl: '🔪 True crime – dokumenty' },
        cat_anime: { uk: '🍿 Аніме', ru: '🍿 Аниме', en: '🍿 Anime', pl: '🍿 Anime' },
        cat_apple_epic_sci: { uk: '🛸 Епічний Sci-Fi (Фішка Apple)', ru: '🛸 Эпический Sci‑Fi (фирменный Apple)', en: '🛸 Epic Sci‑Fi (Apple\'s specialty)', pl: '🛸 Epickie Sci‑Fi (Apple)' },
        cat_comedy_feelgood: { uk: '😂 Комедії та Feel-Good', ru: '😂 Комедии и feel‑good', en: '😂 Comedies & feel‑good', pl: '😂 Komedie i feel‑good' },
        cat_quality_detectives: { uk: '🕵️ Якісні детективи', ru: '🕵️ Качественные детективы', en: '🕵️ Quality detective shows', pl: '🕵️ Dobre kryminały' },
        cat_apple_original: { uk: '🎬 Apple Original Films', ru: '🎬 Apple Original Films', en: '🎬 Apple Original Films', pl: '🎬 Apple Original Films' },
        cat_epic_sagas: { uk: '🐉 Епічні саги (Фентезі)', ru: '🐉 Эпические саги (фэнтези)', en: '🐉 Epic fantasy sagas', pl: '🐉 Epickie sagi fantasy' },
        cat_premium_dramas: { uk: '🎭 Преміальні драми', ru: '🎭 Премиальные драмы', en: '🎭 Premium dramas', pl: '🎭 Premiowe dramaty' },
        cat_dc_blockbusters: { uk: '🦇 Блокбастери DC', ru: '🦇 Блокбастеры DC', en: '🦇 DC blockbusters', pl: '🦇 Blockbustery DC' },
        cat_dark_detectives: { uk: '🧠 Похмурі детективи', ru: '🧠 Мрачные детективы', en: '🧠 Dark detective stories', pl: '🧠 Mroczne kryminały' },
        cat_hbo_classics: { uk: '👑 Золота класика HBO', ru: '👑 Золотая классика HBO', en: '👑 HBO golden classics', pl: '👑 Złota klasyka HBO' },
        cat_hard_action: { uk: '🩸 Жорсткий екшн та Антигерої', ru: '🩸 Жёсткий экшн и антигерои', en: '🩸 Hard action & antiheroes', pl: '🩸 Ostry akcyjniak i antybohaterowie' },
        cat_amazon_mgm: { uk: '🎬 Фільми від Amazon MGM', ru: '🎬 Фильмы от Amazon MGM', en: '🎬 Amazon MGM movies', pl: '🎬 Filmy Amazon MGM' },
        cat_comedies: { uk: '😂 Комедії', ru: '😂 Комедии', en: '😂 Comedies', pl: '😂 Komedie' },
        cat_thrillers: { uk: '🕵️ Трилери', ru: '🕵️ Триллеры', en: '🕵️ Thrillers', pl: '🕵️ Thrillery' },
        cat_adult_animation: { uk: '🤬 Анімація для дорослих', ru: '🤬 Анимация для взрослых', en: '🤬 Adult animation', pl: '🤬 Animacje dla dorosłych' },
        cat_marvel_universe: { uk: '🦸\u200d♂️ Кіновсесвіт Marvel', ru: '🦸\u200d♂️ Киновселенная Marvel', en: '🦸‍♂️ Marvel Cinematic Universe', pl: '🦸‍♂️ Uniwersum Marvela' },
        cat_starwars: { uk: '⚔️ Далека галактика (Star Wars)', ru: '⚔️ Далёкая галактика (Star Wars)', en: '⚔️ A galaxy far away (Star Wars)', pl: '⚔️ Odległa galaktyka (Star Wars)' },
        cat_pixar: { uk: '🧸 Шедеври Pixar', ru: '🧸 Шедевры Pixar', en: '🧸 Pixar masterpieces', pl: '🧸 Arcydzieła Pixara' },
        cat_fx_star: { uk: '🍷 Дорослий контент (FX / Star)', ru: '🍷 Взрослый контент (FX / Star)', en: '🍷 Adult content (FX / Star)', pl: '🍷 Treści dla dorosłych (FX / Star)' },
        cat_sheridan_universe: { uk: '🤠 Всесвіт Шеридана (Yellowstone)', ru: '🤠 Вселенная Шеридана (Yellowstone)', en: '🤠 Sheridan universe (Yellowstone)', pl: '🤠 Uniwersum Sheridana (Yellowstone)' },
        cat_startrek_collection: { uk: '🖖 Колекція Star Trek', ru: '🖖 Коллекция Star Trek', en: '🖖 Star Trek collection', pl: '🖖 Kolekcja Star Trek' },
        cat_crime_investigation: { uk: '🚓 Кримінал та Розслідування', ru: '🚓 Криминал и расследования', en: '🚓 Crime & investigation', pl: '🚓 Kryminał i śledztwa' },
        cat_kids_world: { uk: '🧽 Дитячий світ (Nickelodeon)', ru: '🧽 Детский мир (Nickelodeon)', en: '🧽 Kids world (Nickelodeon)', pl: '🧽 Świat dzieci (Nickelodeon)' },
        cat_paramount_blockbusters: { uk: '🎬 Блокбастери (Paramount)', ru: '🎬 Блокбастеры (Paramount)', en: '🎬 Blockbusters (Paramount)', pl: '🎬 Blockbustery (Paramount)' },
        cat_universal_world: { uk: '🌍 Світ Universal', ru: '🌍 Мир Universal', en: '🌍 Universal world', pl: '🌍 Świat Universal' },
        cat_showtime_adult: { uk: '🕵️ Дорослий розбір (Showtime)', ru: '🕵️ Взрослый разбор (Showtime)', en: '🕵️ Adult breakdown (Showtime)', pl: '🕵️ Analizy dla dorosłych (Showtime)' },
        cat_dreamworks_worlds: { uk: '🦄 Казкові світи (DreamWorks)', ru: '🦄 Сказочные миры (DreamWorks)', en: '🦄 Fairy-tale worlds (DreamWorks)', pl: '🦄 Bajkowe światy (DreamWorks)' },
        cat_new_releases_syfy: { uk: '🔥 Новинки', ru: '🔥 Новинки', en: '🔥 New releases', pl: '🔥 Nowości' },
        cat_top_syfy: { uk: '🏆 Топ на Syfy', ru: '🏆 Топ на Syfy', en: '🏆 Top on Syfy', pl: '🏆 Top na Syfy' },
        cat_space_travel: { uk: '🚀 Космічні подорожі', ru: '🚀 Космические путешествия', en: '🚀 Space journeys', pl: '🚀 Podróże kosmiczne' },
        cat_monsters_paranormal: { uk: '🧟 Монстри та паранормальне', ru: '🧟 Монстры и паранормальное', en: '🧟 Monsters and paranormal', pl: '🧟 Potwory i zjawiska paranormalne' },
        educational_title: { uk: 'Пізнавальне', ru: 'Познавательное', en: 'Educational', pl: 'Edukacyjne' },
        cat_new_episodes: { uk: '🔥 Нові випуски', ru: '🔥 Новые выпуски', en: '🔥 New episodes', pl: '🔥 Nowe odcinki' },
        cat_cooking_battles: { uk: '🔪 Кулінарні битви', ru: '🔪 Кулинарные битвы', en: '🔪 Cooking battles', pl: '🔪 Kuchenne pojedynki' },
        cat_survival: { uk: '🪓 Виживання', ru: '🪓 Выживание', en: '🪓 Survival', pl: '🪓 Przetrwanie' },
        ua_new_movies: { uk: 'Нові українські фільми', ru: 'Новые украинские фильмы', en: 'New Ukrainian movies', pl: 'Nowe ukraińskie filmy' },
        ua_new_tv: { uk: 'Нові українські серіали', ru: 'Новые украинские serialы', en: 'New Ukrainian series', pl: 'Nowe ukraińskie seriale' },
        ua_shows: { uk: 'Шоу та програми', ru: 'Шоу и программы', en: 'Shows and programs', pl: 'Show i programy' },
        ua_trending_movies: { uk: 'В тренді в Україні', ru: 'В тренде в Украине', en: 'Trending in Ukraine', pl: 'Na topie na Ukrainie' },
        ua_trending_series: { uk: 'Українські серіали в тренді', ru: 'Украинские сериалы в тренде', en: 'Trending Ukrainian series', pl: 'Ukraińskie seriale na topie' },
        ua_best_movies: { uk: 'Найкращі українські фільми', ru: 'Лучшие украинские фильмы', en: 'Best Ukrainian movies', pl: 'Najlepsze ukraińskie filmy' },
        ua_all_movies: { uk: 'Українські фільми (повна підбірка)', ru: 'Украинские фильмы (полная подборка)', en: 'Ukrainian movies (full collection)', pl: 'Ukraińskie filmy (pełna kolekcja)' },
        ua_all_series: { uk: 'Українські серіали (повна підбірка)', ru: 'Украинские сериалы (полная подборка)', en: 'Ukrainian series (full collection)', pl: 'Ukraińskie seriale (pełna kolekcja)' },
        pl_new_movies: { uk: 'Нові польські фільми', ru: 'Новые польские фильмы', en: 'New Polish movies', pl: 'Nowe polskie filmy' },
        pl_new_tv: { uk: 'Нові польські серіали', ru: 'Новые польские сериалы', en: 'New Polish series', pl: 'Nowe polskie seriale' },
        pl_shows: { uk: 'Польські шоу та програми', ru: 'Польские шоу и программы', en: 'Polish shows and programs', pl: 'Polskie show i programy' },
        pl_trending_movies: { uk: 'В тренді в Польщі', ru: 'В тренде в Польше', en: 'Trending in Poland', pl: 'Na topie w Polsce' },
        pl_trending_series: { uk: 'Польські серіали в тренді', ru: 'Польские сериалы в тренде', en: 'Trending Polish series', pl: 'Polskie seriale na topie' },
        pl_best_movies: { uk: 'Найкращі польські фільми', ru: 'Лучшие польские фильмы', en: 'Best Polish movies', pl: 'Najlepsze polskie filmy' },
        pl_all_movies: { uk: 'Польські фільми (повна підбірка)', ru: 'Польские фильмы (полная подборка)', en: 'Polish movies (full collection)', pl: 'Polskie filmy (pełna kolekcja)' },
        pl_all_series: { uk: 'Польські серіали (повна підбірка)', ru: 'Польские сериалы (полная подборка)', en: 'Polish series (full collection)', pl: 'Polskie seriale (pełna kolekcja)' },
        pl_all_shows: { uk: 'Польські шоу та програми (повна підбірка)', ru: 'Польские шоу и программы (полная подборка)', en: 'Polish shows and programs (full collection)', pl: 'Polskie show i programy (pełna kolekcja)' },
        settings_tab_title: { uk: 'Ліхтар', ru: 'Flixio', en: 'Flixio', pl: 'Flixio' },
        settings_header_info: { uk: 'Ліхтар — кастомна головна сторінка з стрімінгами, мітками якості та українською озвучкою. Автор: Flixio Team', ru: 'Flixio — кастомная главная страница со стримингами, метками качества и украинской озвучкой. Автор: Flixio Team', en: 'Flixio — custom home screen with streamings, quality badges and Ukrainian audio. Author: Flixio Team', pl: 'Flixio — niestandardowa strona główna ze streamingami, oznaczeniami jakości i ukraińskim dubbingiem. Autor: Flixio Team' },
        settings_sections_title: { uk: 'Секції головної сторінки', ru: 'Секции главной страницы', en: 'Main screen sections', pl: 'Sekcje ekranu głównego' },
        settings_streamings_name: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        settings_streamings_desc: { uk: 'Секція з логотипами стрімінгових сервісів', ru: 'Секция с логотипами стриминговых сервисов', en: 'Row with streaming services logos', pl: 'Sekcja z logo serwisów streamingowych' },
        settings_hero_name: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        settings_hero_desc: { uk: 'Ряд з новинками прокату на початку головної', ru: 'Ряд с новинками проката в начале главной', en: 'Row with theatrical new releases at the top', pl: 'Rząd z nowościami kinowymi na początku ekranu' },
        settings_row_ru_name: { uk: 'Новинки російської ленти', ru: 'Новинки Русской ленты', en: 'New in Russian feed', pl: 'Nowości rosyjskiej sekcji' },
        settings_row_ru_desc: { uk: 'Показувати ряд «Новинки Русской ленты»', ru: 'Показывать ряд «Новинки Русской ленты»', en: 'Show the "New in Russian feed" row', pl: 'Pokazuj rząd „Nowości rosyjskiej sekcji”' },
        settings_row_ua_name: { uk: 'Новинки української ленти', ru: 'Новинки Украинской ленты', en: 'New in Ukrainian feed', pl: 'Nowości ukraińskiej sekcji' },
        settings_row_ua_desc: { uk: 'Показувати ряд «Новинки української стрічки»', ru: 'Показывать ряд «Новинки Украинской ленты»', en: 'Show the "New in Ukrainian feed" row', pl: 'Pokazuj rząd „Nowości ukraińskiej sekcji”' },
        settings_row_en_name: { uk: 'Новинки англійської ленти', ru: 'Новинки Английской ленты', en: 'New in English feed', pl: 'Nowości angielskiej sekcji' },
        settings_row_en_desc: { uk: 'Показувати ряд «Новинки Английской ленты»', ru: 'Показывать ряд «Новинки Английской ленты»', en: 'Show the "New in English feed" row', pl: 'Pokazuj rząd „Nowości angielskiej sekcji”' },
        settings_row_pl_name: { uk: 'Новинки польської ленти', ru: 'Новинки Польской ленты', en: 'New in Polish feed', pl: 'Nowości polskiej sekcji' },
        settings_row_pl_desc: { uk: 'Показувати ряд «Новинки польської стрічки»', ru: 'Показывать ряд «Новинки Польской ленты»', en: 'Show the "New in Polish feed" row', pl: 'Pokazuj rząd „Nowości polskiej sekcji”' },
        settings_today_netflix_name: { uk: 'Сьогодні на Netflix', ru: 'Сегодня на Netflix', en: 'Today on Netflix', pl: 'Dziś na Netflix' },
        settings_today_netflix_desc: { uk: 'Ряд новинок Netflix за сьогодні', ru: 'Ряд новинок Netflix за сегодня', en: 'Row with today\'s Netflix releases', pl: 'Rząd dzisiejszych nowości Netflix' },
        settings_today_apple_name: { uk: 'Сьогодні на Apple TV+', ru: 'Сегодня на Apple TV+', en: 'Today on Apple TV+', pl: 'Dziś na Apple TV+' },
        settings_today_apple_desc: { uk: 'Ряд новинок Apple TV+ за сьогодні', ru: 'Ряд новинок Apple TV+ за сегодня', en: 'Row with today\'s Apple TV+ releases', pl: 'Rząd dzisiejszych nowości Apple TV+' },
        settings_today_hbo_name: { uk: 'Сьогодні на HBO / Max', ru: 'Сегодня на HBO / Max', en: 'Today on HBO / Max', pl: 'Dziś na HBO / Max' },
        settings_today_hbo_desc: { uk: 'Ряд новинок HBO / Max за сьогодні', ru: 'Ряд новинок HBO / Max за сегодня', en: 'Row with today\'s HBO / Max releases', pl: 'Rząd dzisiejszych nowości HBO / Max' },
        settings_today_prime_name: { uk: 'Сьогодні на Prime Video', ru: 'Сегодня на Prime Video', en: 'Today on Prime Video', pl: 'Dziś na Prime Video' },
        settings_today_prime_desc: { uk: 'Ряд новинок Prime Video за сьогодні', ru: 'Ряд новинок Prime Video за сегодня', en: 'Row with today\'s Prime Video releases', pl: 'Rząd dzisiejszych nowości Prime Video' },
        settings_today_disney_name: { uk: 'Сьогодні на Disney+', ru: 'Сегодня на Disney+', en: 'Today on Disney+', pl: 'Dziś na Disney+' },
        settings_today_disney_desc: { uk: 'Ряд новинок Disney+ за сьогодні', ru: 'Ряд новинок Disney+ за сегодня', en: 'Row with today\'s Disney+ releases', pl: 'Rząd dzisiejszych nowości Disney+' },
        settings_today_paramount_name: { uk: 'Сьогодні на Paramount+', ru: 'Сегодня на Paramount+', en: 'Today on Paramount+', pl: 'Dziś na Paramount+' },
        settings_today_paramount_desc: { uk: 'Ряд новинок Paramount+ за сьогодні', ru: 'Ряд новинок Paramount+ за сегодня', en: 'Row with today\'s Paramount+ releases', pl: 'Rząd dzisiejszych nowości Paramount+' },
        settings_today_sky_name: { uk: 'Сьогодні на Sky Showtime', ru: 'Сегодня на Sky Showtime', en: 'Today on Sky Showtime', pl: 'Dziś na Sky Showtime' },
        settings_today_sky_desc: { uk: 'Ряд новинок Sky Showtime за сьогодні', ru: 'Ряд новинок Sky Showtime за сегодня', en: 'Row with today\'s Sky Showtime releases', pl: 'Rząd dzisiejszych nowości Sky Showtime' },
        settings_today_hulu_name: { uk: 'Сьогодні на Hulu', ru: 'Сегодня на Hulu', en: 'Today on Hulu', pl: 'Dziś na Hulu' },
        settings_today_hulu_desc: { uk: 'Ряд новинок Hulu за сьогодні', ru: 'Ряд новинок Hulu за сегодня', en: 'Row with today\'s Hulu releases', pl: 'Rząd dzisiejszych nowości Hulu' },
        settings_mood_name: { uk: 'Кіно під настрій', ru: 'Кино по настроению', en: 'Mood movies', pl: 'Kino na nastrój' },
        settings_mood_desc: { uk: 'Підбірки фільмів за жанрами та настроєм', ru: 'Подборки фильмов по жанрам и настроению', en: 'Movie picks by genre and mood', pl: 'Zestawy filmów wg gatunku i nastroju' },
        settings_kinooglad_name: { uk: 'Кіноогляд', ru: 'Кинообзор', en: 'Movie review', pl: 'Przegląd filmowy' },
        settings_kinooglad_desc: { uk: 'Увімкнути розділ Кіноогляд у меню. Налаштування каналів нижче.', ru: 'Включить раздел Кинообзор в меню. Настройки каналов ниже.', en: 'Enable the Movie review section in the menu. Channel settings below.', pl: 'Włącz sekcję Przegląd filmowy w menu. Ustawienia kanałów poniżej.' },
        settings_badges_title: { uk: 'Мітки на картках', ru: 'Метки на карточках', en: 'Badges on cards', pl: 'Etykiety na kartach' },
        settings_badge_ru_name: { uk: 'Російська озвучка (RU)', ru: 'Русская озвучка (RU)', en: 'Russian audio (RU)', pl: 'Rosyjski dubbing (RU)' },
        settings_badge_ru_desc: { uk: 'Показувати мітку наявності російського дубляжу', ru: 'Показывать метку наличия русского дубляжа', en: 'Show badge when Russian dub is available', pl: 'Pokazuj etykietę, gdy jest rosyjski dubbing' },
        settings_badge_ua_name: { uk: 'Українська озвучка (UA)', ru: 'Украинская озвучка (UA)', en: 'Ukrainian audio (UA)', pl: 'Ukraiński dubbing (UA)' },
        settings_badge_ua_desc: { uk: 'Показувати мітку наявності українського дубляжу', ru: 'Показывать метку наличия украинского дубляжа', en: 'Show badge when Ukrainian dub is available', pl: 'Pokazuj etykietę, gdy jest ukraiński dubbing' },
        settings_badge_en_name: { uk: 'Англійська озвучка (EN)', ru: 'Английская озвучка (EN)', en: 'English audio (EN)', pl: 'Angielski dubbing (EN)' },
        settings_badge_en_desc: { uk: 'Показувати мітку наявності англійської доріжки', ru: 'Показывать метку наличия английской дорожки', en: 'Show badge when English track is available', pl: 'Pokazuj etykietę, gdy jest angielska ścieżka' },
        settings_badge_4k_name: { uk: 'Якість 4K', ru: 'Качество 4K', en: '4K quality', pl: 'Jakość 4K' },
        settings_badge_4k_desc: { uk: 'Показувати мітку наявності 4K роздільної здатності', ru: 'Показывать метку наличия 4K разрешения', en: 'Show badge when 4K resolution is available', pl: 'Pokazuj etykietę, gdy dostępne jest 4K' },
        settings_badge_fhd_name: { uk: 'Якість FHD', ru: 'Качество FHD', en: 'FHD quality', pl: 'Jakość FHD' },
        settings_badge_fhd_desc: { uk: 'Показувати мітку наявності Full HD роздільної здатності', ru: 'Показывать метку наличия Full HD разрешения', en: 'Show badge when Full HD is available', pl: 'Pokazuj etykietę, gdy dostępne jest Full HD' },
        settings_badge_hdr_name: { uk: 'HDR / Dolby Vision', ru: 'HDR / Dolby Vision', en: 'HDR / Dolby Vision', pl: 'HDR / Dolby Vision' },
        settings_badge_hdr_desc: { uk: 'Показувати мітку наявності HDR або Dolby Vision', ru: 'Показывать метку наличия HDR или Dolby Vision', en: 'Show badge when HDR or Dolby Vision is available', pl: 'Pokazuj etykietę, gdy dostępne jest HDR lub Dolby Vision' },
        settings_tmdb_input_name: { uk: 'Свій ключ TMDB', ru: 'Свой ключ TMDB', en: 'Custom TMDB key', pl: 'Własny klucz TMDB' },
        settings_tmdb_input_placeholder: { uk: 'Ключ TMDB (опційно)', ru: 'Ключ TMDB (опционально)', en: 'TMDB key (optional)', pl: 'Klucz TMDB (opcjonalnie)' },
        settings_tmdb_input_desc: { uk: 'Якщо вказати — плагін використовуватиме його замість ключа Лампи.', ru: 'Если указать — плагин будет использовать его вместо ключа Лампы.', en: 'If set, the plugin will use it instead of Lampa\'s key.', pl: 'Jeśli ustawisz, plugin użyje go zamiast klucza Lampy.' },
        menu_title: { uk: 'Меню', ru: 'Меню', en: 'Menu', pl: 'Menu' },
        menu_details: { uk: 'Детальніше', ru: 'Подробнее', en: 'Details', pl: 'Szczegóły' },
        menu_trailer: { uk: 'Трейлер', ru: 'Трейлер', en: 'Trailer', pl: 'Zwiastun' },
        loading_trailer: { uk: 'Завантаження трейлера...', ru: 'Загрузка трейлера...', en: 'Loading trailer...', pl: 'Ładowanie zwiastuna...' },
        kino_settings_title: { uk: 'Кіноогляд: Налаштування каналів YouTube', ru: 'Кинообзор: Настройки каналов YouTube', en: 'Movie review: YouTube channels settings', pl: 'Przegląd filmowy: ustawienia kanałów YouTube' },
        kino_add_channel_name: { uk: 'Додати канал', ru: 'Добавить канал', en: 'Add channel', pl: 'Dodaj kanał' },
        kino_add_channel_desc: { uk: 'Посилання YouTube або @нік', ru: 'Ссылка YouTube или @ник', en: 'YouTube link or @handle', pl: 'Link YouTube lub @nazwa' },
        kino_add_channel_input: { uk: 'Посилання на канал або @нік', ru: 'Ссылка на канал или @ник', en: 'Channel link or @handle', pl: 'Link do kanału lub @nazwa' },
        kino_channel_generic: { uk: 'Канал', ru: 'Канал', en: 'Channel', pl: 'Kanał' },
        kino_reset_name: { uk: 'Скинути налаштування каналів', ru: 'Сбросить настройки каналов', en: 'Reset channel settings', pl: 'Zresetuj ustawienia kanałów' },
        kino_reset_desc: { uk: 'Очистити список каналів', ru: 'Очистить список каналов', en: 'Clear channel list', pl: 'Wyczyść listę kanałów' },
        kino_channel_enabled: { uk: 'Увімкнено', ru: 'Включено', en: 'Enabled', pl: 'Włączony' },
        kino_channel_disabled: { uk: 'Вимкнено', ru: 'Выключено', en: 'Disabled', pl: 'Wyłączony' },
        kino_channel_delete_btn: { uk: 'Видалити канал', ru: 'Удалить канал', en: 'Delete channel', pl: 'Usuń kanał' },
        kino_menu_title: { uk: 'Кіноогляд', ru: 'Кинообзор', en: 'Movie review', pl: 'Przegląd filmowy' },
        kino_ch_navkolo_kino: {
            uk: 'Навколо Кіно',
            ru: 'Вокруг кино',
            en: 'Around Cinema',
            pl: 'Wokół kina'
        },
        kino_ch_serialy_kino: {
            uk: 'СЕРІАЛИ та КІНО',
            ru: 'СЕРИАЛЫ и КИНО',
            en: 'Series and Movies',
            pl: 'Seriale i kino'
        },
        kino_ch_ekino_ua: {
            uk: 'eKinoUA',
            ru: 'eKinoUA',
            en: 'eKinoUA',
            pl: 'eKinoUA'
        },
        kino_ch_zagin_kinomaniv: {
            uk: 'Загін Кіноманів',
            ru: 'Отряд киноманов',
            en: 'Cinephiles Squad',
            pl: 'Oddział kinomanów'
        },
        kino_ch_moi_dumky: {
            uk: 'Мої думки про кіно',
            ru: 'Мои мысли о кино',
            en: 'My Thoughts About Cinema',
            pl: 'Moje myśli o kinie'
        },
        kino_ch_kino_navuvorit: {
            uk: 'КІНО НАВИВОРІТ',
            ru: 'КИНО НАИЗНАНКУ',
            en: 'Cinema Inside Out',
            pl: 'Kino na lewą stronę'
        }
    };

    function tr(key) {
        var pack = FLIXIO_I18N[key];
        if (!pack) return key;
        return pack[FLIXIO_LANG] || pack.uk || pack.en || key;
    }

    var SERVICE_CONFIGS = {
        'netflix': {
            title: 'Netflix',
            logo: 'logos/netflix.svg',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 2L16.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L7.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L16.5 22" stroke="#E50914" stroke-width="4"/></svg>',
            categories: [
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { "title": tr('cat_only_netflix'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "vote_average.desc", "vote_count.gte": "500", "vote_average.gte": "7.5" } },
                { "title": tr('cat_twisted_thrillers'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "with_genres": "53,9648", "sort_by": "popularity.desc" } },
                { "title": tr('cat_fantasy_sci'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_kdrama'), "url": "discover/tv", "params": { "with_networks": "213", "with_original_language": "ko", "sort_by": "popularity.desc" } },
                { "title": tr('cat_truecrime_doc'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "99", "with_keywords": "9840|10714", "sort_by": "popularity.desc" } },
                { "title": tr('cat_anime'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "16", "with_keywords": "210024", "sort_by": "popularity.desc" } }
            ]
        },
        'apple': {
            title: 'Apple TV+',
            logo: 'logos/apple.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { "title": tr('cat_apple_epic_sci'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedy_feelgood'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_quality_detectives'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "9648,80", "sort_by": "popularity.desc" } },
                { "title": tr('cat_apple_original'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "vote_average.desc", "vote_count.gte": "100" } }
            ]
        },
        'hbo': {
            title: 'HBO / Max',
            logo: 'logos/hbo.svg',
            icon: '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor"><path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24 11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432 2.795.003-1.207-1.187-2.632-2.58-2.634H7.59v9.674l4.181.001c1.686 0 2.886-1.46 2.888-2.713.385.788 1.72 2.762 4.427 2.76zm-7.665-3.936c.387 0 .692.382.692.817 0 .435-.305.817-.692.817h-1.33v-1.634zm.005-3.633c.387 0 .692.382.692.817 0 .436-.305.818-.692.818h-1.33V9.373zm1.77 2.607c.305-.039.813-.387.992-.61-.063.276-.068 1.074.006 1.35-.204-.314-.688-.701-.998-.74zm3.43 0a2.462 2.462 0 1 1 4.924 0 2.462 2.462 0 0 1-4.925 0zm2.462 1.936a1.936 1.936 0 1 0 0-3.872 1.936 1.936 0 0 0 0 3.872z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "49|3186", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "174|49", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "10" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "49|3186", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies_wb'), "url": "discover/movie", "params": { "with_companies": "174", "sort_by": "popularity.desc", "vote_count.gte": "50" } },
                { "title": tr('cat_epic_sagas'), "url": "discover/tv", "params": { "with_networks": "49|3186", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_premium_dramas'), "url": "discover/tv", "params": { "with_networks": "49", "with_genres": "18", "without_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_dc_blockbusters'), "url": "discover/movie", "params": { "with_companies": "174", "with_keywords": "9715", "sort_by": "revenue.desc" } },
                { "title": tr('cat_dark_detectives'), "url": "discover/tv", "params": { "with_networks": "49", "with_genres": "80,9648", "sort_by": "vote_average.desc", "vote_count.gte": "300" } },
                { "title": tr('cat_hbo_classics'), "url": "discover/tv", "params": { "with_networks": "49", "sort_by": "vote_average.desc", "vote_count.gte": "1000" } }
            ]
        },
        'amazon': {
            title: 'Prime Video',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 15c2.4 1.7 5.1 2.6 8 2.6 2.9 0 5.6-.9 8-2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M15.5 14.4L18 16.8 15.5 19.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "1024", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "119", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "1024", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "119", "watch_region": "US", "sort_by": "popularity.desc" } },
                { "title": tr('cat_hard_action'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "10759,10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_amazon_mgm'), "url": "discover/movie", "params": { "with_companies": "1024|21", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedies'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_thrillers'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "9648,18", "sort_by": "vote_average.desc", "vote_count.gte": "300" } }
            ]
        },
        'disney': {
            title: 'Disney+',
            logo: 'logos/disney.svg',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10c2.2-2.5 5-3.7 8-3.7 2.2 0 4.1.7 5.8 1.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M12 13v4M10 15h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "2739", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "337", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "2739", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "2", "sort_by": "popularity.desc" } },
                { "title": tr('cat_marvel_universe'), "url": "discover/movie", "params": { "with_companies": "420", "sort_by": "release_date.desc", "vote_count.gte": "100" } },
                { "title": tr('cat_starwars'), "url": "discover/tv", "params": { "with_companies": "1", "with_keywords": "1930", "sort_by": "popularity.desc" } },
                { "title": tr('cat_pixar'), "url": "discover/movie", "params": { "with_companies": "3", "sort_by": "popularity.desc" } },
                { "title": tr('cat_fx_star'), "url": "discover/tv", "params": { "with_networks": "88|453", "sort_by": "popularity.desc" } }
            ]
        },
        'paramount': {
            title: 'Paramount+',
            logo: 'logos/paramount.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22H22L12 2ZM12 6.5L18.5 19.5H5.5L12 6.5Z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "4330", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "10" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "4330", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "popularity.desc" } },
                { "title": tr('cat_sheridan_universe'), "url": "discover/tv", "params": { "with_networks": "318|4330", "with_keywords": "256112", "sort_by": "popularity.desc" } },
                { "title": tr('cat_startrek_collection'), "url": "discover/tv", "params": { "with_networks": "4330", "with_keywords": "159223", "sort_by": "first_air_date.desc" } },
                { "title": tr('cat_crime_investigation'), "url": "discover/tv", "params": { "with_networks": "16", "with_genres": "80,18", "sort_by": "popularity.desc" } },
                { "title": tr('cat_kids_world'), "url": "discover/tv", "params": { "with_networks": "13", "sort_by": "popularity.desc" } }
            ]
        },
        'sky_showtime': {
            title: 'Sky Showtime',
            logo: 'logos/SkyShowtime.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 9.5c1-.8 2.2-1.2 3.5-1.2 2 0 3.7 1 4.7 2.6" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_companies": "67|115331", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "4|33|521", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_companies": "67|115331", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "4|33", "sort_by": "popularity.desc" } },
                { "title": tr('cat_paramount_blockbusters'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "revenue.desc" } },
                { "title": tr('cat_universal_world'), "url": "discover/movie", "params": { "with_companies": "33", "sort_by": "popularity.desc" } },
                { "title": tr('cat_showtime_adult'), "url": "discover/tv", "params": { "with_companies": "67", "sort_by": "popularity.desc" } },
                { "title": tr('cat_dreamworks_worlds'), "url": "discover/movie", "params": { "with_companies": "521", "sort_by": "popularity.desc" } }
            ]
        },
        'hulu': {
            title: 'Hulu',
            logo: 'logos/Hulu.svg',
            icon: '<svg viewBox="0 0 24 24" fill="#3DBB3D"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "453", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "15", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "453", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "15", "watch_region": "US", "sort_by": "popularity.desc" } },
                { "title": tr('cat_truecrime_doc'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "18,9648", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedy_feelgood'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_adult_animation'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "16", "sort_by": "popularity.desc" } }
            ]
        },
        'syfy': {
            title: 'Syfy',
            logo: 'logos/Syfy.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>',
            categories: [
                { "title": tr('cat_new_releases_syfy'), "url": "discover/tv", "params": { "with_networks": "77", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "1" } },
                { "title": tr('cat_top_syfy'), "url": "discover/tv", "params": { "with_networks": "77", "sort_by": "popularity.desc" } },
                { "title": tr('cat_space_travel'), "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "10765", "with_keywords": "3801", "sort_by": "vote_average.desc", "vote_count.gte": "50" } },
                { "title": tr('cat_monsters_paranormal'), "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "9648,10765", "without_keywords": "3801", "sort_by": "popularity.desc" } }
            ]
        },
        'educational_and_reality': {
            title: tr('educational_title'),
            logo: 'logos/Discovery.svg',
            icon: '<svg viewBox="0 0 24 24" fill="#FF9800"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
            categories: [
                { "title": tr('cat_new_episodes'), "url": "discover/tv", "params": { "with_networks": "64|91|43|2696|4|65", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": "🌍 Discovery Channel", "url": "discover/tv", "params": { "with_networks": "64", "sort_by": "popularity.desc" } },
                { "title": "🦁 National Geographic", "url": "discover/tv", "params": { "with_networks": "43", "sort_by": "popularity.desc" } },
                { "title": "🐾 Animal Planet", "url": "discover/tv", "params": { "with_networks": "91", "sort_by": "popularity.desc" } },
                { "title": "🌿 BBC Earth", "url": "discover/tv", "params": { "with_networks": "4", "with_genres": "99", "sort_by": "vote_average.desc", "vote_count.gte": "20" } },
                { "title": tr('cat_cooking_battles'), "url": "discover/tv", "params": { "with_genres": "10764", "with_keywords": "222083", "sort_by": "popularity.desc" } },
                { "title": tr('cat_survival'), "url": "discover/tv", "params": { "with_genres": "10764", "with_keywords": "5481|10348", "sort_by": "popularity.desc" } }
            ]
        }
    };


    function getTmdbKey() {
        var custom = (Lampa.Storage.get('flixio_tmdb_apikey') || '').trim();
        return custom || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '');
    }

    /** Для рядка на головній: HBO/Prime/Paramount через watch_providers (TMDB), щоб отримувати і фільми, і серіали з актуальним контентом. */
    var SERVICE_WATCH_PROVIDERS_FOR_ROW = { hbo: '384', amazon: '119', paramount: '531' };

    // =================================================================
    // GLOBAL PLAYER HELPER
    // =================================================================
    function playYouTubeCustom(key) {
        var overlay = $('<div class="youtube-pro-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; background: #000;"></div>');
        var playerContainer = $('<div id="yt-player-custom"></div>');
        var loader = $('<div class="yt-loader" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #fff; font-size: 1.5em; font-weight: bold; text-align: center;"><div class="broadcast__scan"></div><div>' + tr('loading_trailer') + '</div></div>');
        
        overlay.append(loader);
        overlay.append(playerContainer);
        $('body').append(overlay);
        
        var closePlayer = function() {
            overlay.remove();
            Lampa.Controller.toggle('content'); 
        };
        
        Lampa.Controller.add('youtube_custom_controller', {
            toggle: function() {}, up: function() {}, down: function() {}, left: function() {}, right: function() {},
            enter: function() {}, back: closePlayer
        });
        Lampa.Controller.toggle('youtube_custom_controller');
        
        var initPlayer = function() {
            new YT.Player('yt-player-custom', {
                height: '100%',
                width: '100%',
                videoId: key,
                playerVars: { 'autoplay': 1, 'controls': 1, 'showinfo': 0, 'rel': 0, 'modestbranding': 1, 'iv_load_policy': 3, 'playsinline': 1, 'disablekb': 1, 'fs': 0 },
                events: {
                    'onReady': function(event) { 
                        loader.remove(); // Hide loader
                        event.target.playVideo(); 
                    },
                    'onStateChange': function(event) {
                        if (event.data === 0) { // 0 = ended
                            closePlayer();
                        }
                    },
                    'onError': function(e) { 
                        if (e.data == 150 || e.data == 153) Lampa.Noty.show('Відео обмежено власником (Error ' + e.data + ')');
                        else Lampa.Noty.show('Помилка YouTube: ' + e.data);
                        closePlayer();
                    }
                }
            });
        };
        
        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            var oldReady = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function() { if(oldReady) oldReady(); initPlayer(); };
        } else {
            initPlayer();
        }
    }

    // =================================================================
    // UTILS & COMPONENTS
    // =================================================================

    // Один елемент геро-рядка (backdrop + overlay). heightEm — висота банеру (напр. 28).
    function makeHeroResultItem(movie, heightEm) {
        if (!$('#studios5-hero-css').length) {
            $('body').append('<style id="studios5-hero-css">.hero-banner .card-marks, .hero-banner .card__icons, .hero-banner .card__quality { display: none !important; }</style>');
        }
        if (!$('#studios5-show-more-css').length) {
            $('body').append('<style id="studios5-show-more-css">' +
                '.show-more-button.focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.card.show-more-button:focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.kino-card.show-more-button:hover { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.kino-card.show-more-button.focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
            '</style>');
        }
        heightEm = heightEm || 22.5;
        var pad = (heightEm / 35 * 2).toFixed(1);
        var titleEm = (heightEm / 35 * 2.5).toFixed(2);
        var descEm = (heightEm / 35 * 1.1).toFixed(2);

        var renderHeroContent = function(item, movie) {
            item.empty(); // Clear existing content
            item.append('<div class="hero-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding: ' + pad + 'em; border-radius: 0 0 1em 1em;">' +
                '<div class="hero-header" style="margin-bottom: 0.3em; min-height: 3em; display: flex; align-items: flex-end;">' +
                    '<div class="hero-title" style="font-size: ' + titleEm + 'em; font-weight: bold; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">' + (movie.title || movie.name) + '</div>' +
                '</div>' +
                '<div class="hero-meta" style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5em; font-size: 0.9em; color: #ccc; margin-bottom: 0.5em;"></div>' +
                '<div class="hero-desc" style="font-size: ' + descEm + 'em; color: #ddd; max-width: 60%; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.6em;">' + (movie.overview || '') + '</div>' +
                '<div class="hero-trailer-btn selector" style="display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.2); padding: 0.4em 0.8em; border-radius: 0.3em; cursor: pointer; transition: background 0.2s;">' +
                '<svg style="width: 1.2em; height: 1.2em; margin-right: 0.4em;" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
                '<span style="font-size: 0.9em; font-weight: 600;">Трейлер</span>' +
                '</div>' +
                '</div>');
            
            // Trailer Click
            item.find('.hero-trailer-btn').on('hover:enter click', function (e) {
                e.stopPropagation();
                var network = new Lampa.Reguest();
                var type = movie.name ? 'tv' : 'movie';
                var lang = Lampa.Storage.get('language', 'uk');
                function search(searchLang) {
                    var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                    network.silent(url, function (json) {
                        var videos = json.results || [];
                        var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                        if (trailer && trailer.key) {
                            playYouTubeCustom(trailer.key);
                        } else if (searchLang !== 'en-US') {
                            search('en-US');
                        } else {
                            Lampa.Noty.show('Трейлер не знайдено');
                        }
                    }, function() {
                            if (searchLang !== 'en-US') search('en-US');
                            else Lampa.Noty.show('Помилка пошуку трейлера');
                    });
                }
                search(lang);
            });

            // Fetch Details
            var type = movie.name ? 'tv' : 'movie';
            var lang = Lampa.Storage.get('language', 'uk');
            var url = Lampa.TMDB.api(type + '/' + movie.id + '?api_key=' + getTmdbKey() + '&language=' + lang + '&append_to_response=images,release_dates,content_ratings');
            
            var network = new Lampa.Reguest();
            network.silent(url, function(details) {
                // Logo
                var logo = null;
                if (details.images && details.images.logos && details.images.logos.length) {
                    logo = details.images.logos.find(function(l) { return l.iso_639_1 === lang; }) || 
                           details.images.logos.find(function(l) { return l.iso_639_1 === 'en'; }) || 
                           details.images.logos[0];
                }
                if (logo) {
                    var logoUrl = Lampa.TMDB.image('t/p/w500' + logo.file_path);
                    item.find('.hero-title').html('<img src="' + logoUrl + '" style="height: 4em; width: auto; max-width: 80%; object-fit: contain; display: block;" />');
                    item.find('.hero-header').css('min-height', 'auto');
                }

                // Metadata
                var metaParts = [];
                
                // Rating & Year
                var headMeta = '';
                var rating = details.vote_average || movie.vote_average;
                if (rating) headMeta += '<span class="card__mark card__mark--rating" style="position: static; margin: 0 0.5em 0 0; padding: 0.2em 0.5em; font-size: 0.9em; background: rgba(255,255,255,0.2); border-radius: 0.3em;">★ ' + parseFloat(rating).toFixed(1) + '</span>';
                
                var date = details.release_date || details.first_air_date || movie.release_date || movie.first_air_date;
                if (date) headMeta += parseInt(date);
                
                if (headMeta) metaParts.push(headMeta);
                
                // Type
                var typeStr = type === 'movie' ? Lampa.Lang.translate('movie') : Lampa.Lang.translate('tv');
                if (!typeStr || typeStr === 'movie' || typeStr === 'tv') {
                    typeStr = type === 'movie' ? (lang === 'ru' ? 'Фильм' : 'Фільм') : (lang === 'ru' ? 'Сериал' : 'Серіал');
                }
                metaParts.push(typeStr);
                
                // Age Rating
                var age = '';
                if (type === 'movie' && details.release_dates && details.release_dates.results) {
                    var rel = details.release_dates.results.find(function(r) { return r.iso_3166_1 === 'US' || r.iso_3166_1 === 'RU'; });
                    if (rel && rel.release_dates && rel.release_dates.length) age = rel.release_dates[0].certification;
                } else if (type === 'tv' && details.content_ratings && details.content_ratings.results) {
                    var rat = details.content_ratings.results.find(function(r) { return r.iso_3166_1 === 'US' || r.iso_3166_1 === 'RU'; });
                    if (rat) age = rat.rating;
                }
                if (age) {
                    var ageColor = '#fff';
                    var ageVal = parseInt(age);
                    var displayAge = age;

                    if (!isNaN(ageVal)) {
                        displayAge = ageVal + '+';
                        if (ageVal >= 18) ageColor = '#d32f2f'; // Red
                        else if (ageVal >= 16) ageColor = '#f57c00'; // Orange
                        else if (ageVal >= 12) ageColor = '#fbc02d'; // Yellow
                        else ageColor = '#388e3c'; // Green
                    } else {
                        // US Ratings Mapping
                        if (['R', 'NC-17', 'TV-MA'].indexOf(age) !== -1) {
                            ageColor = '#d32f2f';
                            displayAge = '18+';
                        } else if (['PG-13', 'TV-14'].indexOf(age) !== -1) {
                            ageColor = '#f57c00';
                            displayAge = '16+';
                        } else if (['PG', 'TV-PG', 'TV-Y7'].indexOf(age) !== -1) {
                            ageColor = '#fbc02d';
                            displayAge = '12+';
                        } else {
                            ageColor = '#388e3c';
                            displayAge = '0+';
                        }
                    }
                    metaParts.push('<span style="border: 1px solid ' + ageColor + '; color: ' + ageColor + '; padding: 0 0.3em; border-radius: 0.2em; font-size: 0.9em; font-weight: bold;">' + displayAge + '</span>');
                }

                // Country
                if (details.production_countries && details.production_countries.length) {
                    metaParts.push(details.production_countries[0].iso_3166_1);
                }
                
                // Duration
                var runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : 0);
                if (runtime) {
                    var h = Math.floor(runtime / 60);
                    var m = runtime % 60;
                    var hStr = h > 0 ? h + (lang === 'ru' ? 'ч.' : 'год.') : '';
                    var mStr = m > 0 ? m + (lang === 'ru' ? 'м.' : 'хв.') : '';
                    if (hStr || mStr) metaParts.push((hStr + ' ' + mStr).trim());
                }

                if (metaParts.length) {
                    item.find('.hero-meta').html('<span>' + metaParts.join('</span><span>') + '</span>');
                }
            });
        };

        return {
            title: 'Hero',
            params: {
                createInstance: function (element) {
                    var card = Lampa.Maker.make('Card', element, function (module) { return module.only('Card', 'Callback'); });
                    return card;
                },
                emit: {
                    onCreate: function () {
                        var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original' + movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original' + movie.poster_path) : '');
                        try {
                            var item = $(this.html);
                            item.addClass('hero-banner');
                            item.css({
                                'background-image': 'url(' + img + ')',
                                'width': '100%',
                                'height': heightEm + 'em',
                                'background-size': 'cover',
                                'background-position': 'center',
                                'border-radius': '1em',
                                'position': 'relative',
                                'box-shadow': '0 0 20px rgba(0,0,0,0.5)',
                                'margin-bottom': '10px'
                            });
                            
                            renderHeroContent(item, movie);

                            item.find('.card__view').remove();
                            item.find('.card__title').remove();
                            item.find('.card__age').remove();
                            item.find('.card-marks').remove();
                            item.find('.card__icons').remove();
                            item[0].heroMovieData = movie;
                        } catch (e) { console.log('Hero onCreate error:', e); }
                    },
                    onVisible: function () {
                        try {
                            var item = $(this.html);
                            if (!item.hasClass('hero-banner')) {
                                var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original' + movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original' + movie.poster_path) : '');
                                item.addClass('hero-banner');
                                item.css({
                                    'background-image': 'url(' + img + ')',
                                    'width': '100%',
                                    'height': heightEm + 'em',
                                    'background-size': 'cover',
                                    'background-position': 'center',
                                    'border-radius': '1em',
                                    'position': 'relative',
                                    'box-shadow': '0 0 20px rgba(0,0,0,0.5)',
                                    'margin-bottom': '10px'
                                });
                                
                                renderHeroContent(item, movie);

                                item.find('.card__view').remove();
                                item.find('.card__title').remove();
                                item.find('.card__age').remove();
                                item.find('.card-marks').remove();
                                item.find('.card__icons').remove();
                                item[0].heroMovieData = movie;
                            }
                            // Stop default image loading
                            if (this.img) this.img.onerror = function () { };
                            if (this.img) this.img.onload = function () { };
                        } catch (e) { console.log('Hero onVisible error:', e); }
                    },
                    onlyEnter: function () {
                        // Функция запуска трейлера (копируем логику из кнопки)
                        var playHeroTrailer = function() {
                             var network = new Lampa.Reguest();
                             var type = movie.name ? 'tv' : 'movie';
                             var lang = Lampa.Storage.get('language', 'uk');
                            
                            function search(searchLang) {
                                var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                                network.silent(url, function (json) {
                                    var videos = json.results || [];
                                    var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                                    if (trailer && trailer.key) {
                                        playYouTubeCustom(trailer.key);
                                    } else if (searchLang !== 'en-US') {
                                        search('en-US');
                                    } else {
                                        Lampa.Noty.show('Трейлер не знайдено');
                                    }
                                }, function() {
                                     if (searchLang !== 'en-US') search('en-US');
                                     else Lampa.Noty.show('Помилка пошуку трейлера');
                                });
                            }
                            search(lang);
                        };

                        // Меню выбора действия
                        Lampa.Select.show({
                            title: tr('menu_title'),
                            items: [
                                { title: tr('menu_details'), action: 'open' },
                                { title: tr('menu_trailer'), action: 'trailer' }
                            ],
                            onSelect: function(a) {
                                if(a.action === 'trailer') {
                                    playHeroTrailer();
                                } else {
                                    Lampa.Activity.push({
                                        url: '',
                                        component: 'full',
                                        id: movie.id,
                                        method: movie.name ? 'tv' : 'movie',
                                        card: movie,
                                        source: 'tmdb'
                                    });
                                }
                            }
                        });
                    },
                    onKey: function(key) {
                        if (key === 'play') {
                           // Копия логики запуска трейлера (можно вынести в отдельную функцию выше, но здесь дублируем для надежности области видимости)
                           var playHeroTrailerKey = function() {
                                  var network = new Lampa.Reguest();
                                  var type = movie.name ? 'tv' : 'movie';
                                  var lang = Lampa.Storage.get('language', 'uk');
                                  
                                function search(searchLang) {
                                    var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                                    network.silent(url, function (json) {
                                        var videos = json.results || [];
                                        var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                                        if (trailer && trailer.key) { playYouTubeCustom(trailer.key); } 
                                        else if (searchLang !== 'en-US') { search('en-US'); } 
                                        else { Lampa.Noty.show('Трейлер не знайдено'); }
                                    });
                                }
                                search(lang);
                           };
                           playHeroTrailerKey();
                        }
                    }
                }
            }
        };
    }

    function StudiosMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var config = SERVICE_CONFIGS[object.service_id];
        if (!config) { comp.empty && comp.empty(); return comp; }

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var categories = config.categories;
            var network = new Lampa.Reguest();
            var total = categories.length; // No hero section
            var status = new Lampa.Status(total);

            status.onComplite = function () {
                var fulldata = [];
                // Hero section removed - only show categories
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var num = parseInt(key, 10);
                        var data = status.data[key];
                        var cat = categories[num];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params,
                                service_id: object.service_id
                            });
                        }
                    });
                }

                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            var refCat = categories.find(function (c) { return c.params && (c.params.with_watch_providers || c.params.with_networks || c.params.with_companies); });
            var filterSuffix = '';
            if (refCat && refCat.params) {
                if (refCat.params.with_watch_providers) {
                    filterSuffix = '&with_watch_providers=' + refCat.params.with_watch_providers + '&watch_region=' + (refCat.params.watch_region || 'UA');
                } else if (refCat.params.with_networks) {
                    filterSuffix = '&with_networks=' + refCat.params.with_networks;
                } else if (refCat.params.with_companies) {
                    filterSuffix = '&with_companies=' + refCat.params.with_companies;
                }
            }

            // Hero section removed - just load categories
            categories.forEach(function (cat, index) {
                var params = [];
                params.push('api_key=' + getTmdbKey());
                params.push('language=' + Lampa.Storage.get('language', 'uk'));
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));

                console.log('[StudiosMain] Category', index + 1, ':', cat.title, 'URL:', url);

                network.silent(url, function (json) {
                    console.log('[StudiosMain] Category', index + 1, 'data received:', json);
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(index.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Українська стрічка» — фільми/серіали/шоу українського виробництва (TMDB)
    // Жанри TV: Reality 10764, Talk 10767
    var UKRAINIAN_FEED_CATEGORIES = [
        { title: tr('ua_new_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ua_new_tv'), url: 'discover/tv', params: { with_origin_country: 'UA', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ua_shows'), url: 'discover/tv', params: { with_origin_country: 'UA', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('ua_trending_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'popularity.desc' } },
        { title: tr('ua_trending_series'), url: 'discover/tv', params: { with_origin_country: 'UA', sort_by: 'popularity.desc' } },
        { title: tr('ua_best_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'FLIXIO_UA_MOVIES', title: tr('ua_all_movies') },
        { type: 'from_global', globalKey: 'FLIXIO_UA_SERIES', title: tr('ua_all_series') }
    ];

    function UkrainianFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = UKRAINIAN_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_origin_country: 'UA' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths for all items
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Польська стрічка» — фільми/серіали/шоу польського виробництва (TMDB)
    var POLISH_FEED_CATEGORIES = [
        { title: tr('pl_new_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('pl_new_tv'), url: 'discover/tv', params: { with_origin_country: 'PL', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('pl_shows'), url: 'discover/tv', params: { with_origin_country: 'PL', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('pl_trending_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'popularity.desc' } },
        { title: tr('pl_trending_series'), url: 'discover/tv', params: { with_origin_country: 'PL', sort_by: 'popularity.desc' } },
        { title: tr('pl_best_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'FLIXIO_PL_MOVIES', title: tr('pl_all_movies') },
        { type: 'from_global', globalKey: 'FLIXIO_PL_SERIES', title: tr('pl_all_series') },
        { type: 'from_global', globalKey: 'FLIXIO_PL_SHOWS', title: tr('pl_all_shows') }
    ];

    function PolishFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = POLISH_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_origin_country: 'PL' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Російська стрічка» — фільми/серіали/шоу російською мовою (TMDB)
    var RUSSIAN_FEED_CATEGORIES = [
        { title: tr('ru_new_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ru_new_tv'), url: 'discover/tv', params: { with_original_language: 'ru', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ru_shows'), url: 'discover/tv', params: { with_original_language: 'ru', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('ru_trending_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'popularity.desc' } },
        { title: tr('ru_trending_series'), url: 'discover/tv', params: { with_original_language: 'ru', sort_by: 'popularity.desc' } },
        { title: tr('ru_best_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'FLIXIO_RU_MOVIES', title: tr('ru_all_movies') },
        { type: 'from_global', globalKey: 'FLIXIO_RU_SERIES', title: tr('ru_all_series') },
        { type: 'from_global', globalKey: 'FLIXIO_RU_SHOWS', title: tr('ru_all_shows') }
    ];

    function RussianFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = RUSSIAN_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_original_language: 'ru' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    function StudiosView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();

        function buildUrl(page) {
            var params = [];
            params.push('api_key=' + getTmdbKey());
            params.push('language=' + Lampa.Storage.get('language', 'uk'));
            params.push('page=' + page);

            if (object.params) {
                for (var key in object.params) {
                    var val = object.params[key];
                    if (val === '{current_date}') {
                        var d = new Date();
                        val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    }
                    params.push(key + '=' + val);
                }
            }
            return Lampa.TMDB.api(object.url + '?' + params.join('&'));
        }

        comp.create = function () {
            var _this = this;
            network.silent(buildUrl(1), function (json) {
                // FIX: Ensure all items have poster_path for display
                // If backdrop_path exists but poster_path doesn't, use backdrop_path
                if (json && json.results && Array.isArray(json.results)) {
                    json.results.forEach(function (item) {
                        if (!item.poster_path && item.backdrop_path) {
                            item.poster_path = item.backdrop_path;
                        }
                    });
                }
                _this.build(json);
            }, this.empty.bind(this));
        };

        comp.nextPageReuest = function (object, resolve, reject) {
            network.silent(buildUrl(object.page), resolve, reject);
        };

        return comp;
    }

    // =================================================================
    // ПІДПИСКИ НА СТУДІЇ (Ліхтар — інтегровано з studio_subscription)
    // =================================================================
    var FlixioStudioSubscription = (function () {
        var storageKey = 'flixio_subscription_studios';

        function getParams() {
            var raw = Lampa.Storage.get(storageKey, '[]');
            return typeof raw === 'string' ? (function () { try { return JSON.parse(raw); } catch (e) { return []; } })() : (Array.isArray(raw) ? raw : []);
        }

        function setParams(params) {
            Lampa.Storage.set(storageKey, params);
        }

        function add(company) {
            var c = { id: company.id, name: company.name || '', logo_path: company.logo_path || '' };
            var studios = getParams();
            if (!studios.find(function (s) { return String(s.id) === String(c.id); })) {
                studios.push(c);
                setParams(studios);
                Lampa.Noty.show(Lampa.Lang.translate('title_bookmarked') || 'Додано в підписки');
            }
        }

        function remove(company) {
            var studios = getParams();
            var idx = studios.findIndex(function (c) { return c.id === company.id; });
            if (idx !== -1) {
                studios.splice(idx, 1);
                setParams(studios);
                Lampa.Noty.show(Lampa.Lang.translate('title_unbookmarked'));
            }
        }

        function isSubscribed(company) {
            return !!getParams().find(function (c) { return c.id === company.id; });
        }

        function injectButton(object) {
            var attempts = 0;
            var interval = setInterval(function () {
                var nameEl = $('.company-start__name');
                var company = object.company;
                if (!nameEl.length || !company || !company.id) {
                    attempts++;
                    if (attempts > 25) clearInterval(interval);
                    return;
                }
                clearInterval(interval);
                if (nameEl.find('.studio-subscription-btn').length) return;

                var btn = $('<div class="studio-subscription-btn selector"></div>');

                function updateState() {
                    var sub = isSubscribed(company);
                    btn.text(sub ? 'Відписатися' : 'Підписатися');
                    btn.removeClass('studio-subscription-btn--sub studio-subscription-btn--unsub').addClass(sub ? 'studio-subscription-btn--unsub' : 'studio-subscription-btn--sub');
                }

                function doToggle() {
                    if (isSubscribed(company)) remove(company);
                    else add({ id: company.id, name: company.name || '', logo_path: company.logo_path || '' });
                    updateState();
                }

                btn.on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    doToggle();
                });
                btn.on('hover:enter', doToggle);

                updateState();
                nameEl.append(btn);

                // Auto-focus the subscription button so it's visible immediately
                setTimeout(function () {
                    try {
                        if (Lampa.Controller && Lampa.Controller.collectionFocus) {
                            Lampa.Controller.collectionFocus(btn[0]);
                        }
                    } catch (e) { }
                }, 300);
            }, 200);
        }

        function registerComponent() {
            // Удален компонент "Мои подписки"
        }

        return {
            init: function () {
                var existing = Lampa.Storage.get(storageKey, '[]');
                var fromOld = Lampa.Storage.get('subscription_studios', '[]');
                if ((!existing || existing === '[]' || (Array.isArray(existing) && !existing.length)) && fromOld && fromOld !== '[]') {
                    try {
                        var arr = typeof fromOld === 'string' ? JSON.parse(fromOld) : fromOld;
                        if (Array.isArray(arr) && arr.length) setParams(arr);
                    } catch (e) { }
                }
                registerComponent();
            }
        };
    })();

    // =================================================================
    // MAIN PAGE ROWS
    // =================================================================

    // ========== Прибираємо секцію Shots ==========
    function removeShotsSection() {
        function doRemove() {
            $('.items-line').each(function () {
                var title = $(this).find('.items-line__title').text().trim();
                if (title === 'Shots' || title === 'shots') {
                    $(this).remove();
                }
            });
        }
        // Виконуємо із затримкою, бо Shots може підвантажитись пізніше
        setTimeout(doRemove, 1000);
        setTimeout(doRemove, 3000);
        setTimeout(doRemove, 6000);
    }

    // ========== ROW 1: HERO SLIDER (New Releases) ==========
    function addHeroRow() {
        Lampa.ContentRows.add({
            index: 0,
            name: 'custom_hero_row',
            title: tr('hero_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    // Fetch Now Playing movies (Fresh releases)
                    var url = Lampa.TMDB.api('movie/now_playing?api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk') + '&region=UA');

                    network.silent(url, function (json) {
                        var items = json.results || [];
                        if (!items.length) {
                            // Fallback if no fresh movies
                            url = Lampa.TMDB.api('trending/all/week?api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk'));
                            network.silent(url, function (retryJson) {
                                items = retryJson.results || [];
                                build(items);
                            });
                            return;
                        }
                        build(items);

                        function build(movies) {
                            var moviesWithBackdrop = movies.filter(function (m) { return m.backdrop_path; });
                            var results = moviesWithBackdrop.slice(0, 15).map(function (movie) { return makeHeroResultItem(movie, 22.5); });

                            callback({
                                results: results,
                                title: tr('hero_row_title_full'),
                                params: {
                                    items: {
                                        mapping: 'line',
                                        view: 15
                                    }
                                }
                            });
                        }

                    }, function () {
                        callback({ results: [] });
                    });
                };
            }
        });
    }

    // ========== ROW 2: STUDIOS (Moved Up) ==========
    function addStudioRow() {
    var studios = [
        { 
            id: 'netflix', 
            name: 'Netflix', 
            svg: '<svg viewBox="0 0 256 69" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35.2 64.726c-3.85.676-7.77.88-11.823 1.42L11.013 29.93V67.7c-3.85.405-7.364.946-11.013 1.486V0h10.27l14.053 39.255V0H35.2v64.726zm21.283-39.39l14.46-.203v10.8l-14.46.203v16.08l19.12-1.15v10.404l-29.93 2.365V0h29.93v10.8h-19.12v14.526zm59.32-14.526H104.59v49.727l-10.8.135V10.81H82.564V0h33.24v10.81zm17.567 13.783h14.797v10.8H133.37V59.93h-10.608V0h30.202v10.8H133.37v13.783zm37.16 25.877c6.15.135 12.364.608 18.377.946V62.09l-29.187-1.42V0h10.8v50.47zm27.5 12.364c3.446.203 7.094.406 10.607.81V0H198.03v62.835zM256 0l-13.716 32.904L256 69.186c-4.054-.54-8.108-1.284-12.162-1.96l-7.77-19.998-7.904 18.378c-3.92-.676-7.703-.88-11.62-1.42l13.918-31.688L217.894 0h11.62l7.094 18.175L244.176 0H256z" fill="#E50914"/></svg>', 
            providerId: '8' 
        },
        { 
            id: 'disney', 
            name: 'Disney+', 
            svg: '<svg viewBox="0 0 1041 565" xmlns="http://www.w3.org/2000/svg"><path fill="#113CCF" fill-rule="evenodd" d="M735.8 365.7 C721.4 369 683.5 370.9 683.5 370.9 L678.7 385.9 C678.7 385.9 697.6 384.3 711.4 385.7 711.4 385.7 715.9 385.2 716.4 390.8 716.6 396 716 401.6 716 401.6 716 401.6 715.7 405 710.9 405.8 705.7 406.7 670.1 408 670.1 408 L664.3 427.5 C664.3 427.5 662.2 432 667 430.7 671.5 429.5 708.8 422.5 713.7 423.5 718.9 424.8 724.7 431.7 723 438.1 721 445.9 683.8 469.7 661.1 468 661.1 468 649.2 468.8 639.1 452.7 629.7 437.4 642.7 408.3 642.7 408.3 642.7 408.3 636.8 394.7 641.1 390.2 641.1 390.2 643.7 387.9 651.1 387.3 L660.2 368.4 C660.2 368.4 649.8 369.1 643.6 361.5 637.8 354.2 637.4 350.9 641.8 348.9 646.5 346.6 689.8 338.7 719.6 339.7 719.6 339.7 730 338.7 738.9 356.7 738.8 356.7 743.2 364 735.8 365.7 Z M623.7 438.3 C619.9 447.3 609.8 456.9 597.3 450.9 584.9 444.9 565.2 404.6 565.2 404.6 565.2 404.6 557.7 389.6 556.3 389.9 556.3 389.9 554.7 387 553.7 403.4 552.7 419.8 553.9 451.7 547.4 456.7 541.2 461.7 533.7 459.7 529.8 453.8 526.3 448 524.8 434.2 526.7 410 529 385.8 534.6 360 541.8 351.9 549 343.9 554.8 349.7 557 351.8 557 351.8 566.6 360.5 582.5 386.1 L585.3 390.8 C585.3 390.8 599.7 415 601.2 414.9 601.2 414.9 602.4 416 603.4 415.2 604.9 414.8 604.3 407 604.3 407 604.3 407 601.3 380.7 588.2 336.1 588.2 336.1 586.2 330.5 587.6 325.3 588.9 320 594.2 322.5 594.2 322.5 594.2 322.5 614.6 332.7 624.4 365.9 634.1 399.4 627.5 429.3 623.7 438.3 Z M523.5 353 C521.8 356.4 520.8 361.3 512.2 362.6 512.2 362.6 429.9 368.2 426 374 426 374 423.1 377.4 427.6 378.4 432.1 379.3 450.7 381.8 459.7 382.3 469.3 382.4 501.7 382.7 513.3 397.2 513.3 397.2 520.2 404.1 519.9 419.7 519.6 435.7 516.8 441.3 510.6 447.1 504.1 452.5 448.3 477.5 412.3 439.1 412.3 439.1 395.7 420.6 418 406.6 418 406.6 434.1 396.9 475 408.3 475 408.3 487.4 412.8 486.8 417.3 486.1 422.1 476.6 427.2 462.8 426.9 449.4 426.5 439.6 420.1 441.5 421.1 443.3 421.8 427.1 413.3 422.1 419.1 417.1 424.4 418.3 427.7 423.2 431 435.7 438.1 484 435.6 498.4 419.6 498.4 419.6 504.1 413.1 495.4 407.8 486.7 402.8 461.8 399.8 452.1 399.3 442.8 398.8 408.2 399.4 403.2 390.2 403.2 390.2 398.2 384 403.7 366.4 409.5 348 449.8 340.9 467.2 339.3 467.2 339.3 515.1 337.6 523.9 347.4 523.8 347.4 525 349.7 523.5 353 Z M387.5 460.9 C381.7 465.2 369.4 463.3 365.9 458.5 362.4 454.2 361.2 437.1 361.9 410.3 362.6 383.2 363.2 349.6 369 344.3 375.2 338.9 379 343.6 381.4 347.3 384 350.9 387.1 354.9 387.8 363.4 388.4 371.9 390.4 416.5 390.4 416.5 390.4 416.5 393 456.7 387.5 460.9 Z M400 317.1 C383.1 322.7 371.5 320.8 361.7 316.6 357.4 324.1 354.9 326.4 351.6 326.9 346.8 327.4 342.5 319.7 341.7 317.2 340.9 315.3 338.6 312.1 341.4 304.5 331.8 295.9 331.1 284.3 332.7 276.5 335.1 267.5 351.3 233.3 400.6 229.3 400.6 229.3 424.7 227.5 428.8 240.4 L429.5 240.4 C429.5 240.4 452.9 240.5 452.4 261.3 452.1 282.2 426.4 308.2 400 317.1 Z M354 270.8 C349 278.8 348.8 283.6 351.1 286.9 356.8 278.2 367.2 264.5 382.5 254.1 370.7 255.1 360.8 260.2 354 270.8 Z M422.1 257.4 C406.6 259.7 382.6 280.5 371.2 297.5 388.7 300.7 419.6 299.5 433.3 271.6 433.2 271.6 439.8 254.3 422.1 257.4 Z M842.9 418.5 C833.6 434.7 807.5 468.5 772.7 460.6 761.2 488.5 751.6 516.6 746.1 558.8 746.1 558.8 744.9 567 738.1 564.1 731.4 561.7 720.2 550.5 718 535 715.6 514.6 724.7 480.1 743.2 440.6 737.8 431.8 734.1 419.2 737.3 401.3 737.3 401.3 742 368.1 775.3 338.1 775.3 338.1 779.3 334.6 781.6 335.7 784.2 336.8 783 347.6 780.9 352.8 778.8 358 763.9 383.8 763.9 383.8 763.9 383.8 754.6 401.2 757.2 414.9 774.7 388 814.5 333.7 839.2 350.8 847.5 356.7 851.3 369.6 851.3 383.5 851.2 395.8 848.3 408.8 842.9 418.5 Z M835.7 375.9 C835.7 375.9 834.3 365.2 823.9 377 814.9 386.9 798.7 405.6 785.6 430.9 799.3 429.4 812.5 421.9 816.5 418.1 823 412.3 838.1 396.7 835.7 375.9 Z M350.2 389.5 C348.3 413.7 339 454.4 273.1 474.5 229.6 487.6 188.5 481.3 166.1 475.6 165.6 484.5 164.6 488.3 163.2 489.8 161.3 491.7 147.1 499.9 139.3 488.3 135.8 482.8 134 472.8 133 463.9 82.6 440.7 59.4 407.3 58.5 405.8 57.4 404.7 45.9 392.7 57.4 378 68.2 364.7 103.5 351.4 135.3 346 136.4 318.8 139.6 298.3 143.4 288.9 148 278 153.8 287.8 158.8 295.2 163 300.7 165.5 324.4 165.7 343.3 186.5 342.3 198.8 343.8 222 348 252.2 353.5 272.4 368.9 270.6 386.4 269.3 403.6 253.5 410.7 247.5 411.2 241.2 411.7 231.4 407.2 231.4 407.2 224.7 404 230.9 401.2 239 397.7 247.8 393.4 245.8 389 245.8 389 242.5 379.4 203.3 372.7 164.3 372.7 164.1 394.2 165.2 429.9 165.7 450.7 193 455.9 213.4 454.9 213.4 454.9 213.4 454.9 313 452.1 316 388.5 319.1 324.8 216.7 263.7 141 244.3 65.4 224.5 22.6 238.3 18.9 240.2 14.9 242.2 18.6 242.8 18.6 242.8 18.6 242.8 22.7 243.4 29.8 245.8 37.3 248.2 31.5 252.1 31.5 252.1 18.6 256.2 4.1 253.6 1.3 247.7 -1.5 241.8 3.2 236.5 8.6 228.9 14 220.9 19.9 221.2 19.9 221.2 113.4 188.8 227.3 247.4 227.3 247.4 334 301.5 352.2 364.9 350.2 389.5 Z M68 386.2 C57.4 391.4 64.7 398.9 64.7 398.9 84.6 420.3 109.1 433.7 132.4 442 135.1 405.1 134.7 392.1 135 373.5 98.6 376 77.6 381.8 68 386.2 Z" /><path fill="#113CCF" fill-rule="evenodd" d="M1040.9 378.6 L1040.9 391.8 C1040.9 394.7 1038.6 397 1035.7 397 L972.8 397 C972.8 400.3 972.9 403.2 972.9 405.9 972.9 425.4 972.1 441.3 970.2 459.2 969.9 461.9 967.7 463.9 965.1 463.9 L951.5 463.9 C950.1 463.9 948.8 463.3 947.9 462.3 947 461.3 946.5 459.9 946.7 458.5 948.6 440.7 949.5 425 949.5 405.9 949.5 403.1 949.5 400.2 949.4 397 L887.2 397 C884.3 397 882 394.7 882 391.8 L882 378.6 C882 375.7 884.3 373.4 887.2 373.4 L948.5 373.4 C947.2 351.9 944.6 331.2 940.4 310.2 940.2 308.9 940.5 307.6 941.3 306.6 942.1 305.6 943.3 305 944.6 305 L959.3 305 C961.6 305 963.5 306.6 964 308.9 968.1 330.6 970.7 351.7 972 373.4 L1035.7 373.4 C1038.5 373.4 1040.9 375.8 1040.9 378.6 Z" /><path fill="#113CCF" fill-rule="evenodd" d="M200.2 204.3 L200.1 204.3 M199.4 204.4 C199.1 204.4 198.8 204.3 198.5 204.3 198.8 204.4 199.1 204.4 199.4 204.4 L199.7 204.4 C199.6 204.4 199.5 204.4 199.4 204.4 Z M199.4 204.4 C199.1 204.4 198.8 204.3 198.5 204.3 198.8 204.4 199.1 204.4 199.4 204.4 L199.7 204.4 C199.6 204.4 199.5 204.4 199.4 204.4 Z" /><path fill="#113CCF" fill-rule="evenodd" d="M955.3 273.9 C922.8 194 867.9 125.9 796.5 76.9 723.4 26.8 637.7 0.3 548.7 0.3 401.5 0.3 264.9 73.4 183.4 195.9 182.5 197.2 182.3 198.9 182.8 200.4 183.3 202 184.5 203.1 186 203.6 L197.4 207.5 C198.1 207.7 198.8 207.8 199.4 207.8 201.5 207.8 203.5 206.7 204.7 205 242.1 150 292.7 104.3 351.1 72.7 411.4 40.1 479.7 22.8 548.6 22.8 631.9 22.8 712.2 47.4 781 93.8 848.1 139.1 900.2 202.4 931.7 276.7 932.6 278.9 934.8 280.4 937.2 280.4 L950.8 280.4 C952.4 280.4 953.9 279.6 954.7 278.3 955.7 277 955.9 275.4 955.3 273.9 Z M199.4 204.4 C199.1 204.4 198.8 204.3 198.5 204.2 198.8 204.3 199.1 204.4 199.4 204.4 L199.6 204.4 C199.6 204.4 199.5 204.4 199.4 204.4 Z M934.4 278.6 C934.7 278.8 935 279 935.3 279.1 935 278.9 934.7 278.8 934.4 278.6 Z" /></svg>', 
            providerId: '337' 
        },
        { 
            id: 'hbo', 
            name: 'HBO', 
            svg: '<svg viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg"><path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24 11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432 2.795.003-1.207-1.187-2.632-2.58-2.634H7.59v9.674l4.181.001c1.686 0 2.886-1.46 2.888-2.713.385.788 1.72 2.762 4.427 2.76zm-7.665-3.936c.387 0 .692.382.692.817 0 .435-.305.817-.692.817h-1.33v-1.634zm.005-3.633c.387 0 .692.382.692.817 0 .436-.305.818-.692.818h-1.33V9.373zm1.77 2.607c.305-.039.813-.387.992-.61-.063.276-.068 1.074.006 1.35-.204-.314-.688-.701-.998-.74zm3.43 0a2.462 2.462 0 1 1 4.924 0 2.462 2.462 0 0 1-4.925 0zm2.462 1.936a1.936 1.936 0 1 0 0-3.872 1.936 1.936 0 0 0 0 3.872Z"/></svg>', 
            providerId: '384' 
        },
        { 
            id: 'apple', 
            name: 'Apple TV+', 
            svg: '<svg viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg"><path d="M20.57 17.735h-1.815l-3.34-9.203h1.633l2.02 5.987c.075.231.273.9.586 2.012l.297-.997.33-1.006 2.094-6.004H24zm-5.344-.066a5.76 5.76 0 0 1-1.55.207c-1.23 0-1.84-.693-1.84-2.087V9.646h-1.063V8.532h1.121V7.081l1.476-.602v2.062h1.707v1.113H13.38v5.805c0 .446.074.75.214.932.14.182.396.264.75.264.207 0 .495-.041.883-.115zm-7.29-5.343c.017 1.764 1.55 2.358 1.567 2.366-.017.042-.248.842-.808 1.658-.487.71-.99 1.418-1.79 1.435-.783.016-1.03-.462-1.93-.462-.89 0-1.17.445-1.913.478-.758.025-1.344-.775-1.838-1.484-.998-1.451-1.765-4.098-.734-5.88.51-.89 1.426-1.451 2.416-1.46.75-.016 1.468.512 1.93.512.461 0 1.327-.627 2.234-.536.38.016 1.452.157 2.136 1.154-.058.033-1.278.743-1.27 2.219M6.468 7.988c.404-.495.685-1.18.61-1.864-.585.025-1.294.388-1.723.883-.38.437-.71 1.138-.619 1.806.652.05 1.328-.338 1.732-.825Z"/></svg>', 
            providerId: '350' 
        },
        { 
            id: 'amazon', 
            name: 'Prime Video', 
            svg: '<svg viewBox="0 -.1 800.3 246.4" xmlns="http://www.w3.org/2000/svg"><path d="m396.5 246.3v-.4c.4-.5 1.1-.8 1.7-.7 2.9-.1 5.7-.1 8.6 0 .6 0 1.3.2 1.7.7v.4z" fill="#00a8e1"/><path d="m408.5 245.9c-4-.1-8-.1-12 0-5.5-.3-11-.5-16.5-.9-14.6-1.1-29.1-3.3-43.3-6.6-49.1-11.4-92.2-34.3-129.8-67.6-3.5-3.1-6.8-6.3-10.2-9.5-.8-.7-1.5-1.7-1.9-2.7-.6-1.4-.3-2.9.7-4s2.6-1.5 4-.9c.9.4 1.8.8 2.6 1.3 35.9 22.2 75.1 38.4 116.2 48 13.8 3.2 27.7 5.7 41.7 7.5 20.1 2.5 40.4 3.4 60.6 2.7 10.9-.3 21.7-1.3 32.5-2.7 25.2-3.2 50.1-8.9 74.2-16.9 12.7-4.2 25.1-9 37.2-14.6 1.8-1 4-1.3 6-.8 3.3.8 5.3 4.2 4.5 7.5-.1.4-.3.9-.5 1.3-.8 1.5-1.9 2.8-3.3 3.8-11.5 9-23.9 16.9-37 23.5-24.7 12.5-51.1 21.4-78.3 26.5-15.7 2.8-31.5 4.5-47.4 5.1zm-148.1-202.7c2.5-1.5 5.1-3.1 7.8-4.5 7-3.6 14.8-5.4 22.7-5 5.7.3 10.9 1.9 14.9 6.1 3.8 3.9 5.2 8.7 5.6 13.9.1 1.1.1 2.2.1 3.4v51.8c0 4.5-.6 5.1-5.1 5.1h-12.2c-.8 0-1.6 0-2.4-.1-1.2-.1-2.2-1.1-2.4-2.3-.2-1.1-.2-2.2-.2-3.3v-46.3c.1-1.9-.1-3.7-.6-5.5-.8-3.1-3.6-5.3-6.8-5.5-5.9-.4-11.8.8-17.2 3.3-.8.2-1.3 1-1.2 1.8v52.6c0 1 0 1.9-.2 2.9 0 1.4-1.1 2.4-2.5 2.4-1.5.1-3 .1-4.6.1h-10.6c-3.7 0-4.5-.9-4.5-4.6v-47.3c0-1.7-.1-3.5-.5-5.2-.7-3.4-3.6-5.8-7-6-6-.4-12.1.8-17.5 3.4-.8.2-1.3 1.1-1.1 1.9v53.3c0 3.7-.8 4.5-4.5 4.5h-13.4c-3.5 0-4.4-1-4.4-4.4v-69.4c0-.8.1-1.6.3-2.4.4-1.2 1.6-1.9 2.8-1.9h12.5c1.8 0 2.9 1.1 3.5 2.8.5 1.4.8 2.7 1.3 4.2 1 0 1.6-.7 2.3-1.1 5.5-3.4 11.3-6.3 17.8-7.5 5-1 10-1 15 0 4.7 1 8.9 3.8 11.6 7.8.2.3.4.5.6.7-.1.1 0 .1.1.3z" fill="#00a8e1"/><path d="m467.7 93c.6-2 1.2-3.9 1.8-5.9 4.6-15.5 9.2-30.9 13.8-46.4l.6-1.8c.5-1.8 2.2-2.9 4-2.9h15.2c3.8 0 4.6 1.1 3.3 4.7l-6 15.9c-6.7 17.4-13.4 34.9-20.1 52.3-.2.6-.5 1.2-.7 1.8-.7 2.1-2.8 3.5-5 3.3-4.4-.1-8.8-.1-13.2 0-3.1.1-4.9-1.3-6-4.1-2.5-6.6-5.1-13.3-7.6-19.9-6-15.7-12.1-31.4-18.1-47.2-.6-1.2-1-2.6-1.3-3.9-.3-2 .4-3 2.4-3 5.7-.1 11.4 0 17 0 2.4 0 3.5 1.6 4.1 3.7 1.1 3.8 2.2 7.7 3.4 11.5 4.1 13.9 8.1 27.9 12.2 41.8-.1.1 0 .1.2.1z" fill="#000000"/><path d="m112.6 47c.7-.2 1.3-.6 1.7-1.2 1.8-1.8 3.7-3.5 5.7-5.1 5.2-4 11.7-6 18.2-5.5 2.6.1 3.5.9 3.7 3.4.2 3.4.1 6.9.1 10.3.1 1.4 0 2.7-.2 4.1-.4 1.8-1.1 2.5-2.9 2.7-1.4.1-2.7 0-4.1-.1-6.7-.6-13.2.7-19.5 2.8-1.4.5-1.4 1.5-1.4 2.6v48c0 .9 0 1.7-.1 2.6-.1 1.3-1.1 2.3-2.4 2.3-.7.1-1.5.1-2.2.1h-13c-.7 0-1.5 0-2.2-.1-1.3-.1-2.3-1.2-2.4-2.5-.1-.8-.1-1.6-.1-2.4v-68c0-4.6.5-5.1 5.1-5.1h9.6c2.6 0 3.8.9 4.5 3.4s1.3 5 1.9 7.7zm467.8 101.4c6.6.2 13.1.6 19.5 2.3 1.8.5 3.5 1.1 5.2 1.9 2.3.9 3.8 3.1 4.1 5.5.4 2.8.5 5.7.3 8.6-1.3 17.1-6.6 33.6-15.4 48.3-3.2 5.3-7.1 10.1-11.6 14.3-.9.9-2 1.6-3.2 2-1.9.5-3.1-.5-3.2-2.4.1-1 .3-2 .7-3 3.5-9.4 6.9-18.7 9.6-28.4 1.6-5.3 2.7-10.7 3.4-16.2.2-2 .3-4 .1-6-.1-3.4-2.3-6.3-5.6-7.3-3.1-1-6.3-1.6-9.6-1.8-9.2-.4-18.4 0-27.5 1.2l-12.1 1.5c-1.3.1-2.5 0-3.2-1.2s-.4-2.4.3-3.6c.8-1.1 1.8-2.1 3-2.8 7.4-5.3 15.7-8.5 24.5-10.6 6.8-1.4 13.7-2.1 20.7-2.3z" fill="#00a8e1"/><path d="m538.5 75v36c-.2 2-1.1 2.9-3.1 3-5.4.1-10.7.1-16.1 0-2 0-2.9-1-3.1-2.9-.1-.6-.1-1.3-.1-1.9v-69.2c.1-3.1.9-4 4-4h14.4c3.1 0 4 .9 4 4z" fill="#000000"/><path d="m151.6 74.8v-35.5c.1-2.4 1-3.3 3.4-3.4 5.2-.1 10.4-.1 15.6 0 2.3 0 3 .7 3.2 3 .1.9.1 1.7.1 2.6v66.6c0 1.1-.1 2.2-.2 3.3-.1 1.3-1.1 2.2-2.4 2.3-.6.1-1.1.1-1.7.1h-13.9c-.5 0-.9 0-1.4-.1-1.4-.1-2.6-1.2-2.7-2.6-.1-.8-.1-1.6-.1-2.4.1-11.1.1-22.5.1-33.9zm11.6-74.7c1.6-.1 3.2.2 4.7.7 5.4 1.8 8.2 6.5 7.7 12.6-.4 5.2-4.3 9.4-9.5 10.2-2.2.4-4.5.4-6.7 0-5.7-1.1-9.9-5.3-9.5-12.5.6-7.1 5.3-11 13.3-11z" fill="#00a8e1"/><path d="m527.4.1c2-.2 4 .2 5.9 1 3.9 1.5 6.6 5.1 6.8 9.3.8 9.1-5.3 13.7-13.4 13.5-1.1 0-2.2-.2-3.3-.4-6.2-1.5-9.4-6.3-8.8-13.2.5-5.5 4.8-9.6 10.7-10.1.7-.1 1.4-.2 2.1-.1z" fill="#000000"/><path d="m76.7 66.6c-.4-5.2-1.8-10.3-3.9-15-4.1-8.6-10.4-14.9-20-17.1-11-2.4-20.9 0-29.9 6.7-.6.6-1.3 1.1-2.1 1.5-.2-.1-.4-.2-.4-.3-.3-1-.5-2-.8-3-.8-2.5-1.8-3.4-4.5-3.4-3 0-6.1.1-9.1 0-2.3-.1-4.4.2-6 2 0 35 0 70.1.1 105 1.3 2.1 3.3 2.5 5.6 2.4 3.6-.1 7.2 0 10.8 0 6.3 0 6.3 0 6.3-6.2v-28.5c0-.7-.3-1.5.4-2.1 5 3.9 11.1 6.3 17.4 6.9 8.8.9 16.8-1.3 23.5-7.3 4.9-4.5 8.5-10.3 10.4-16.7 2.7-8.2 2.9-16.5 2.2-24.9zm-23.9 20.7c-.7 3.1-2.3 5.9-4.6 8-2.6 2.2-5.8 3.5-9.2 3.5-5.1.3-10.1-.8-14.6-3.2-1.1-.5-1.8-1.6-1.7-2.8v-18.1c0-6 .1-12 0-18-.1-1.4.7-2.6 2-3.1 5.5-2.6 11.2-3.8 17.2-2.6 4.2.6 7.8 3.3 9.5 7.2 1.5 3.2 2.4 6.7 2.6 10.2.6 6.4.6 12.8-1.2 18.9z" fill="#00a8e1"/><path d="m800.1 82.2c0-.1 0-.1 0 0zm.1-13.4v.4c-.4-.4-.6-1-.4-1.5v-.8s0-.1.1-.1h-.1v-1h.2c0-.1-.1-.1-.1-.2-.2-1.9-.6-3.8-1.1-5.6-3.7-13.2-12-21.9-25.5-25.3-6.3-1.5-12.7-1.7-19.1-.7-13.5 2-23.2 9.2-27.9 22-4.6 12.2-4.5 25.6.1 37.8 4 11.1 12 18.1 23.5 21 6.1 1.5 12.5 1.9 18.8 1 21-2.5 29.7-18.4 31.1-32.2h-.1v-1.4c-.1-.6-.2-1.1.4-1.5v.2c0-.1.1-.3.2-.4v-11.5c0-.1-.1-.1-.1-.2zm-24 19c-.6 2.1-1.5 4-2.8 5.8-2.2 3.1-5.7 5.1-9.5 5.4-1.9.2-3.8.2-5.7-.2-4.2-.8-7.7-3.6-9.4-7.5-1.5-3.1-2.4-6.5-2.7-9.9-.5-5.9-.6-11.8.8-17.6.5-2.3 1.5-4.6 2.7-6.6 2.2-3.6 6-5.9 10.2-6.2 1.9-.2 3.8-.2 5.7.2 4 .8 7.3 3.4 9.1 7.1 1.7 3.5 2.7 7.4 2.9 11.3.1 1.8.2 3.6.1 5.4.3 4.4-.2 8.7-1.4 12.8zm-151.3-87h-13.9c-3.8 0-4.5.7-4.5 4.5v32.4c0 .7.3 1.4-.2 2.1-.9-.1-1.4-.7-2.1-1.1-10.4-6.1-21.3-7.2-32.3-2.1-7.7 3.6-12.5 10.1-15.6 17.8-3 7.4-3.7 15.2-3.5 23.1 0 7.4 1.7 14.7 5 21.3 3.8 7.3 9.3 12.9 17.3 15.3 10.9 3.4 21.1 1.7 30.4-5.2.7-.4 1.1-1.1 2-1.3.5 1.1.9 2.3 1.1 3.5.4 1.6 1.8 2.7 3.5 2.7h2.4c3.6 0 7.1.1 10.6 0 2.8 0 3.6-.9 3.7-3.8v-105.4c-.1-3.1-.9-3.8-3.9-3.8zm-18.3 73.6v18.2c.2 1.2-.5 2.3-1.6 2.8-4.8 2.7-10.3 3.8-15.7 3-4.6-.5-8.6-3.3-10.7-7.4-1.6-3.2-2.5-6.6-2.8-10.1-.8-6.3-.3-12.7 1.2-18.8.5-1.7 1.1-3.3 2-4.9 2.1-3.9 6.1-6.4 10.5-6.7 5.3-.5 10.6.5 15.4 2.7 1.2.4 1.9 1.6 1.8 2.9-.2 6.2-.1 12.2-.1 18.3z" fill="#000000"/><path d="m348 81.3c7.5 1.4 15.2 1.5 22.7.3 4.4-.6 8.6-1.9 12.5-4 4.5-2.6 7.8-6.2 9.2-11.2 3.5-12.6-1.9-25.3-15-30-6.4-2.1-13.2-2.8-19.9-1.9-15.8 1.8-26.1 10.5-30.8 25.6-3.3 10.3-2.9 20.8-.2 31.2 3.5 13.3 12.3 21.2 25.6 24 7.6 1.7 15.3 1.4 22.9.2 4-.7 8-1.7 11.8-3.2 2.3-.9 3.5-2.3 3.4-4.9-.1-2.4 0-4.9 0-7.4 0-3-1.2-3.9-4.1-3.2s-5.7 1.3-8.6 1.9c-6.2 1.3-12.6 1.3-18.8.2-8.5-1.7-14-9-13.5-18 .9.1 1.9.2 2.8.4zm-2.5-15.3c.3-2.4 1-4.7 1.9-6.9 3-7.3 9.3-9.8 15.7-9.4 1.8.1 3.6.5 5.3 1.2 2.6 1.1 4.3 3.5 4.6 6.3.3 1.7.2 3.5-.3 5.2-1.2 3.6-4.1 5.1-7.6 5.8-2.1.5-4.3.7-6.5.5-3.9 0-7.9-.3-11.8-.9-1.5-.2-1.5-.2-1.3-1.8z" fill="#00a8e1"/><path d="m685.3 82.3c5.8-.4 11.6-1.5 16.8-4.3 5.3-2.6 9-7.5 10.1-13.3.7-3.6.7-7.4-.1-11-2.1-9-7.8-14.6-16.4-17.5-4.8-1.5-9.9-2.1-14.9-1.9-16.8.4-29.6 8.9-34.8 25.7-3.5 11.1-3 22.4.4 33.5 3.5 11.4 11.5 18.3 22.9 21.4 4.9 1.2 10 1.7 15 1.5 7.3-.1 14.6-1.5 21.5-4.1 2.9-1.1 3.6-2.1 3.6-5.2v-7.2c-.1-2.9-1.3-3.9-4.2-3.2-2.2.6-4.3 1.1-6.5 1.6-6.7 1.6-13.7 1.9-20.5.7-6.8-1.3-11.4-5.2-13.2-12-.5-2-.9-4-1.1-6.1.5 0 1 0 1.4.2 6.6 1.2 13.3 1.7 20 1.2zm-20.9-16c.7-3.9 1.6-7.7 4-10.9 3.7-4.9 8.8-6.3 14.6-5.7.5 0 .9.2 1.4.2 7 1.1 8.7 6.7 7.4 12.1-1 4-4.3 5.5-8 6.2-2 .4-4.1.6-6.2.5-4.1-.1-8.1-.4-12.1-1-.9-.1-1.3-.5-1.1-1.4z" fill="#000000"/></svg>', 
            providerId: '119' 
        },
        { 
            id: 'hulu', 
            name: 'Hulu', 
            svg: '<svg viewBox="0 0 1000 329" xmlns="http://www.w3.org/2000/svg"> <defs id="defs6"> <linearGradient id="linearGradient3067" y2="21.07" x2="0.98000002" y1="20.07" x1="-0.02" gradientUnits="userSpaceOnUse"> <stop id="stop3069" stop-opacity="1" stop-color="#2dbd9d" offset="0.44710872" /> <stop id="stop3071" stop-opacity="1" stop-color="#72de93" offset="1" /> </linearGradient> <linearGradient gradientUnits="userSpaceOnUse" x1="-0.02" y1="20.07" x2="0.98000002" y2="21.07" id="gradient1"> <stop offset="1e-07" stop-color="#2dbd9d" stop-opacity="1" id="stop9" /> <stop offset="1" stop-color="#72de93" stop-opacity="1" id="stop11" /> </linearGradient> <linearGradient xlink:href="#linearGradient3067" id="linearGradient3050" gradientUnits="userSpaceOnUse" x1="-0.02" y1="20.07" x2="8.437705" y2="-0.82375771" /> <linearGradient xlink:href="#gradient1" id="linearGradient3052" gradientUnits="userSpaceOnUse" x1="-0.02" y1="20.07" x2="0.98000002" y2="21.07" /> </defs> <g transform="matrix(16.423058,0,0,16.423058,-331,-413.40146) translate(20.15459,25.172015)" > <path fill="#1ce783" d="m 9.57,6.24 -3.1,0 C 5.9118,6.21334 5.35475,6.31245 4.84,6.53 L 4.84,0 0,0 l 0,20 4.83,0 0,-8.07 C 4.82999,11.5861 4.96727,11.2565 5.21136,11.0143 5.45545,10.7721 5.78614,10.6373 6.13,10.64 l 2.81,0 C 9.28386,10.6373 9.61455,10.7721 9.85864,11.0143 10.1027,11.2565 10.24,11.5861 10.24,11.93 l 0,8.07 4.84,0 0,-8.7 c 0,-3.66 -2.44,-5.06 -5.5,-5.06 l -0.01,0 m 46.48,0 0,8.07 c 0,0.7124 -0.5776,1.29 -1.29,1.29 l -2.82,0 C 51.5961,15.6027 51.2654,15.4679 51.0214,15.2257 50.7773,14.9835 50.64,14.6539 50.64,14.31 l 0,-8.07 -4.83,0 0,8.47 c 0,3.47 2.19,5.29 5.51,5.29 l 4.73,0 c 3,0 4.84,-2.15 4.84,-5.26 l 0,-8.5 -4.84,0 m -27.28,8.07 c 0,0.3439 -0.1373,0.6735 -0.3814,0.9157 -0.244,0.2422 -0.5747,0.377 -0.9186,0.3743 l -2.81,0 C 24.3161,15.6027 23.9854,15.4679 23.7414,15.2257 23.4973,14.9835 23.36,14.6539 23.36,14.31 l 0,-8.07 -4.83,0 0,8.47 c 0,3.47 2.22,5.29 5.47,5.29 l 4.73,0 c 3,0 4.84,-2.15 4.84,-5.26 l 0,-8.5 -4.8,0 0,8.07 m 8.52,5.69 4.84,0 0,-20 -4.84,0 0,20" /> </g></svg>', 
            providerId: '15' 
        },
        { 
            id: 'paramount', 
            name: 'Paramount+', 
            svg: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-161.599 -100.544 1000 622.214"> <path fill="#0064FF" d="M283.887,219.392c-2.459-1.02-6.49-5.543,0.216-18.138l15.578-32.558c0.473-0.984-0.664-2.216-1.374-1.38 l-13.621,13.695c-6.445,6.727-17.378,25.635-19.495,29.134L248.643,237.5c1.229-0.039,2.258,0.927,2.297,2.156 c0.012,0.405-0.085,0.805-0.283,1.159l-15.125,25.404c-3.693,6.3,2.942,10.704,3.841,9.254c23.773-38.291,37.6-35.234,37.6-35.234 l7.936-18.377c0.418-0.921,0.01-2.006-0.911-2.424C283.964,219.421,283.926,219.407,283.887,219.392z M337.935-100.544 c-135.92,0-246.104,110.13-246.104,245.983c-0.072,52.591,16.8,103.807,48.115,146.058c10.324-4.456,16.061-11.117,20.159-16.218 l45.823-58.576c0.965-1.235,2.225-2.206,3.665-2.825l6.898-2.967l75.345-95.524l10.925-8.549l22.45-31.233 c0.58-0.808,1.287-1.519,2.094-2.104l9.795-7.117c2.42-1.758,5.688-1.786,8.136-0.068l11.886,8.339 c6.306,4.423,11.417,10.338,14.88,17.217l47.61,83.586c0.777,1.595,2.098,2.86,3.724,3.568c9.337,4.646,15.041,5.467,27.261,18.735 c5.702,6.186,30.688,34.117,65.705,77.526c5.089,6.964,11.902,12.484,19.769,16.02c31.22-42.219,48.034-93.359,47.96-145.868 C584.031,9.585,473.852-100.544,337.935-100.544z M158.201,158.997l-15.957-5.18l-9.857,13.56v-16.758l-15.958-5.181l15.958-5.181 v-16.763l9.857,13.563l15.957-5.18l-9.859,13.562L158.201,158.997z M154.418,213.846l-5.183,15.943l-5.183-15.943h-16.771 l13.567-9.854l-5.182-15.942l13.568,9.854l13.569-9.854l-5.183,15.942l13.569,9.854H154.418z M157.621,86.876l5.183,15.942 l-13.569-9.854l-13.568,9.854l5.182-15.942l-13.567-9.854h16.771l5.183-15.942l5.184,15.942h16.771L157.621,86.876z M184.552,50.813 l-9.852-13.563l-15.957,5.18l9.858-13.561l-9.858-13.562l15.957,5.18l9.858-13.562v16.764l15.957,5.171l-15.957,5.182v16.763 L184.552,50.813z M226.495-7.873L221.312,8.07l-5.183-15.942h-16.772l13.569-9.854l-5.182-15.943l13.568,9.852l13.567-9.854 l-5.182,15.956l13.569,9.854h-16.772V-7.873z M279.348-34.791l-9.858,13.563v-16.759l-15.958-5.18l15.958-5.182v-16.763 l9.858,13.563l15.95-5.18l-9.858,13.562l9.859,13.561L279.348-34.791z M346.321-50.157l5.183,15.942l-13.569-9.854l-13.569,9.854 l5.177-15.935l-13.567-9.854h16.771l5.185-15.942l5.183,15.942h16.771L346.321-50.157z M406.374-37.987v16.763l-9.854-13.563 l-15.956,5.181l9.858-13.561l-9.857-13.562l15.957,5.18l9.854-13.563v16.763l15.957,5.182L406.374-37.987z M517.662,131.877 l15.956,5.18l9.855-13.563v16.763l15.958,5.181l-15.958,5.181v16.762l-9.855-13.561l-15.956,5.18l9.869-13.562L517.662,131.877z M454.556,8.074l-5.186-15.943H432.6l13.564-9.854l-5.171-15.944l13.563,9.854l13.563-9.852l-5.172,15.942l13.565,9.854h-16.771 L454.556,8.074z M491.317,50.817V34.055l-15.957-5.182l15.957-5.171V6.931l9.854,13.562l15.957-5.18l-9.854,13.562l9.854,13.561 l-15.957-5.18L491.317,50.817z M521.443,77.027l5.188-15.942l5.186,15.942h16.77l-13.563,9.854l5.186,15.942l-13.577-9.854 l-13.564,9.854l5.186-15.942l-13.578-9.854H521.443z M531.816,213.846l-5.186,15.943l-5.188-15.943h-16.77l13.578-9.854 l-5.186-15.942l13.564,9.854l13.577-9.854l-5.186,15.942l13.563,9.854H531.816z M427.075,287.598 c1.182-1.718,3.103-6.43-0.503-15.162l-10.89-29.273c-1.478-3.737,1.759-6.004,3.931-3.547c0,0,20.582,23.722,25.901,33.627 l10.15,16.843c8.732,0.564,32.83,1.221,56.027,1.221c-2.336-2.319-4.493-4.811-6.457-7.454 c-39.583-49.053-64.687-76.34-64.938-76.61c-8.022-8.717-11.73-10.392-17.849-13.178c-0.886-0.402-1.847-0.836-2.836-1.307v7.447 c0.061,0.503-0.299,0.96-0.803,1.02c-0.407,0.048-0.798-0.18-0.955-0.559L359.658,98.482l-0.162-0.323 c-2.427-4.813-6.004-8.953-10.414-12.052l-5.677-3.989l-27.763,64.021c3.317-0.001,6.008,2.687,6.01,6.004 c0.001,0.821-0.167,1.634-0.494,2.388l-25.651,59.312h23.546c9.1,0,18.114,1.771,26.536,5.22l6.206,2.543 c0,0-18.725,38.509-18.725,58.786c0.027,3.688,0.542,7.355,1.529,10.908h43.163l-1.999-12.155 c16.932,3.78,34.062,6.604,51.311,8.459V287.598z M94.026,349.996c0-39.614-42.017-58.689-91.935-58.689 c-53.398,0-102.392,23.657-120.375,60.339c-4.963,9.773-7.542,20.584-7.528,31.546c-0.227,9.479,2.396,18.807,7.528,26.778 c7.705,11.377,21.466,18.528,41.652,18.528c24.776,0,44.411-13.576,44.411-37.234c0,0,0.364-6.598-7.341-6.598 c-6.239,0-7.893,4.399-7.708,6.598c0.922,18.525-10.092,33.383-29.728,33.383c-22.014,0-31.197-18.708-31.197-38.698 c0-40.902,30.829-68.05,62.942-79.786c15.007-5.667,30.944-8.47,46.985-8.259c36.333,0,66.061,13.942,66.061,51.361 c0,31.175-26.24,57.771-57.623,60.157l1.284-4.217c6.425-22.929,14.315-48.054,27.157-66.58c0.739-1.107,2.02-2.936,3.489-4.768 l-1.833-2.203c-2.746,1.666-5.383,3.503-7.897,5.501c-60.183,46.956-62.011,179.011-142.209,179.011 c-2.762,0-5.519-0.185-8.256-0.551c-16.696-2.75-25.51-13.941-25.51-29.524c0-3.118,1.103-7.339,1.103-9.72 c0.127-4.43-3.361-8.123-7.791-8.252c-0.035-0.001-0.068-0.001-0.101-0.001h-0.915c-7.155,0-10.092,5.678-10.276,13.754 c-0.548,23.294,16.696,36.862,43.309,39.434c2.933,0.182,5.87,0.364,8.99,0.364c62.571,0,100.923-47.32,117.257-104.729 c8.273-0.97,16.441-2.687,24.403-5.131C61.374,403.73,94.026,384.298,94.026,349.996z M690.057,363.75h-22.029l-4.949,11.557 l-8.629,19.441h-10.269l-3.133,6.604h10.652l-12.853,28.43c-9.161,19.991-23.479,39.617-31.738,39.617 c-1.832,0-2.94-0.738-2.94-2.565s0.547-3.49,2.571-8.623c2.571-6.057,6.796-14.858,9.914-21.276 c4.58-9.353,11.924-23.843,11.924-30.996c0-7.154-4.581-12.841-13.579-12.841c-10.091,0-19.267,6.059-27.718,14.854l5.511-13.204 h-20.729l-16.889,38.517c-6.782,13.573-20.553,36.133-29.182,36.133c-1.832,0-2.571-1.103-2.571-2.935 c0.179-1.647,0.612-3.257,1.286-4.771c0.738-1.65,10.83-25.309,10.83-25.309l18.351-42.002h-22.384l-17.805,40.898 c-5.496,12.658-19.443,34.117-28.442,34.117c-1.567,0.153-2.964-0.992-3.117-2.563c0,0,0,0,0-0.003v-0.738 c0-2.198,1.655-6.236,2.941-9.172l9.353-20.538l19.266-42.002h-22.192l-4.418,9.537c-3.294,6.418-8.806,13.938-17.611,13.938 c-4.225,0-6.235-1.646-7.151-3.3c-1.285-14.123-10.283-21.644-23.493-21.644c-18.351,0-31.381,10.821-40.011,24.029 c-5.653,9.103-10.094,18.905-13.206,29.158c-7.893,13.026-16.146,23.116-22.754,23.116c-1.653,0-2.756-0.922-2.756-3.12 c0-2.201,2.204-7.151,2.938-8.992l14.497-30.811c4.037-9.533,6.796-15.77,6.796-22.008c0-6.604-4.58-11.376-12.116-11.376 c-10.46,0-21.84,6.057-30.83,15.957c0.305-1.571,0.427-3.173,0.366-4.771c0-7.338-3.667-11.191-11.195-11.191 c-9.539,0-19.447,5.692-28.438,15.958l5.873-14.313h-20.189l-17.062,38.528c-8.073,18.16-21.102,36.139-28.445,36.139 c-1.649,0-2.751-0.924-2.751-3.122c0-3.483,3.854-12.104,5.32-15.59l22.573-51.17c1.651-3.85-9.178-6.238-22.94-6.238 c-14.129,0-28.627,6.973-39.267,15.957c-7.523,6.233-13.029,9.354-15.787,9.354c-0.899,0.192-1.785-0.381-1.979-1.279 c-0.026-0.122-0.038-0.246-0.036-0.37c0-3.119,7.523-11.927,7.523-18.711c0-3.117-1.649-5.137-5.875-5.137 c-8.069,0-17.616,7.705-24.588,15.772l5.873-14.125h-19.815l-17.063,38.52c-8.076,18.16-21.472,37.054-28.812,37.054 c-1.653,0-2.749-0.915-2.749-3.12c0-3.484,3.67-11.917,5.687-16.324l22.572-51.353c1.651-3.85-9.177-6.238-22.942-6.238 c-20.369,0-40.189,13.756-50.647,27.88c-11.559,15.218-19.447,31.361-19.633,44.569c-0.18,10.637,5.318,17.239,16.331,17.239 c12.296,0,22.208-9.719,27.893-17.058c-0.337,1.452-0.584,2.922-0.739,4.404c0,7.332,2.937,12.653,11.927,12.653 c7.889,0,18.35-6.603,26.792-17.058l-6.798,15.592h21.467l21.105-47.872c6.989-15.587,14.88-23.654,17.074-23.654 c0.505-0.097,0.993,0.233,1.091,0.738c0.01,0.058,0.016,0.118,0.016,0.178c0,1.652-3.301,6.059-3.301,10.087 c0,4.029,2.195,7.151,8.076,7.151c4.58,0,9.721-2.202,14.31-5.14c-10.826,14.679-18.173,30.084-18.173,42.743 c-0.181,10.638,5.318,17.239,16.333,17.239c11.558,0,22.385-11.005,28.257-18.342c-0.221,1.704-0.343,3.418-0.366,5.135 c0,7.157,4.039,13.207,12.295,13.207c9.172,0,16.515-5.689,25.69-16.872l-6.796,15.406h22.016l20.183-45.672 c8.809-19.809,20.734-30.451,26.607-30.451c1.467-0.151,2.782,0.915,2.935,2.384c0,0.003,0,0.006,0.001,0.009v0.546 c-0.242,2.228-0.863,4.399-1.834,6.418l-28.967,66.948h22.571l20.554-46.59c8.803-19.989,18.533-29.715,25.872-29.715 c2.201,0,3.122,1.108,3.122,3.486c-0.196,2.554-0.882,5.047-2.019,7.345l-19.821,42.181c-1.825,4.06-2.942,8.4-3.304,12.836 c0,6.421,3.485,12.116,13.399,12.116c12.854,0,22.571-9.721,33.577-24.21v3.116c0.921,11.555,7.342,21.643,24.406,21.643 c20.184,0,36.524-13.94,46.424-36.128c3.744-7.801,6.167-16.173,7.165-24.77c2.21,1.121,4.68,1.63,7.151,1.478 c3.335,0.037,6.621-0.785,9.545-2.388l-3.486,7.517c-4.049,8.439-8.452,17.794-11.924,25.686c-2.199,4.666-3.508,9.702-3.855,14.85 c0,7.884,4.402,13.575,13.386,13.575s21.291-8.438,30.098-20.359h0.191c-0.59,2.465-0.901,4.985-0.931,7.518 c0,6.605,2.024,12.842,11.199,12.842c10.653,0,18.898-7.705,26.979-17.428l-6.796,15.409h22.206l17.806-40.351 c10.092-22.743,20.183-36.496,29.534-36.496c1.607-0.057,2.981,1.148,3.133,2.75v0.542c0,3.855-5.511,14.31-10.461,24.763 c-4.595,9.538-8.082,16.871-10.461,22.563c-2.208,4.794-3.514,9.952-3.855,15.219c0,6.966,3.855,12.287,12.485,12.287 c12.839,0,25.871-12.472,32.83-21.828c-1.57,4.485-2.433,9.186-2.557,13.936c0,12.845,7.697,19.263,18.527,19.263 c7.196-0.055,14.191-2.363,20.006-6.6c8.437-5.872,15.234-14.674,20.922-22.744l-3.855-3.672 c-5.319,7.522-11.199,14.677-17.258,19.079c-3.193,2.699-7.199,4.249-11.378,4.402c-4.579,0-7.52-2.387-7.52-8.251 c0-5.863,2.748-13.759,6.975-24.399c0.176-0.179,6.234-13.755,11.923-26.773c4.772-11.013,9.544-21.646,10.461-23.847h14.495 l2.938-6.604h-14.315L690.057,363.75z M64.122,469.581c-3.118,0-5.32-1.1-5.32-5.135c0.182-10.823,9.171-30.08,20.372-45.489 c7.888-10.638,18.163-18.521,29.174-18.521L94.4,431.61C83.94,455.091,72.563,469.581,64.122,469.581z M201.383,469.581 c-3.117,0-5.319-1.1-5.5-5.135c0.182-10.823,9.172-30.08,20.369-45.489c7.886-10.638,18.165-18.521,29.175-18.521l-13.95,31.175 c-10.64,24.034-21.466,37.971-30.097,37.971H201.383z M445.071,408.875c-0.547,11.918-11.008,40.71-23.301,57.958 c-4.949,6.968-9.176,8.983-12.839,8.983c-5.143,0-6.62-4.221-5.882-10.454c1.094-10.82,10.092-36.131,22.577-53.556 c5.688-7.887,9.545-11.189,13.947-11.189C443.977,400.618,445.262,404.288,445.071,408.875z M787.559,394.747l20.212-46.649h-23.92 l-20.213,46.649h-50.841l-8.481,19.563h50.856l-20.212,46.649h23.92l20.214-46.649h50.84l8.467-19.563H787.559z"/> </svg>', 
            providerId: '531' 
        },
        { 
            id: 'sky_showtime', 
            name: 'Sky Showtime', 
            svg: '<svg viewBox="0 0 2000 467" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,467) scale(0.1,-0.1)" fill="#000000"><path d="M9127 4635 c-475 -60 -904 -248 -1252 -547 -113 -98 -195 -180 -195 -197 0 -5 18 -12 41 -16 58 -10 187 -77 243 -126 147 -130 223 -344 242 -686 l7 -123 -247 0 -246 0 0 68 c0 77 -12 161 -35 239 -18 61 -73 129 -122 150 -42 17 -134 17 -176 -1 -95 -39 -164 -210 -139 -346 36 -192 129 -301 462 -542 276 -199 401 -331 490 -513 71 -145 91 -230 97 -410 5 -131 3 -161 -16 -235 -72 -290 -307 -533 -539 -557 -29 -3 -55 -9 -57 -14 -7 -10 161 -173 260 -252 440 -351 962 -523 1530 -504 498 17 976 193 1360 501 100 80 255 224 255 236 0 4 -26 17 -58 29 -129 46 -264 160 -360 303 -191 282 -286 643 -299 1124 -18 676 135 1220 422 1500 79 77 201 148 273 160 23 4 42 9 42 13 0 4 -35 43 -77 87 -327 339 -783 567 -1298 649 -139 23 -470 28 -608 10z m-97 -1430 l0 -615 290 0 290 0 0 615 0 615 265 0 265 0 0 -1520 0 -1520 -265 0 -265 0 0 660 0 660 -287 -2 -288 -3 -3 -657 -2 -658 -260 0 -260 0 0 1520 0 1520 260 0 260 0 0 -615z"/><path d="M2657 4400 c-142 -26 -230 -74 -289 -161 -72 -104 -68 -7 -68 -1655 l0 -1482 84 -7 c107 -9 280 8 370 35 51 16 81 33 117 67 92 86 84 -67 87 1664 2 1453 2 1527 -15 1534 -28 11 -232 15 -286 5z"/><path d="M12050 3754 c0 -22 369 -2804 386 -2906 l6 -38 239 0 c131 0 239 1 239 3 0 10 261 1829 266 1857 l7 35 8 -35 c5 -19 63 -440 129 -935 66 -495 122 -906 125 -912 3 -10 62 -13 248 -13 l244 0 5 33 c3 17 75 580 159 1249 l154 1218 228 0 227 0 0 -1250 0 -1250 270 0 270 0 0 1250 0 1250 245 0 245 0 0 -1250 0 -1250 280 0 280 0 0 1485 0 1485 -1182 -2 -1183 -3 -92 -720 c-125 -983 -126 -991 -129 -980 -2 6 -53 375 -114 820 -60 446 -112 827 -116 848 l-6 37 -244 0 c-187 0 -246 -3 -249 -12 -2 -7 -59 -389 -125 -848 -66 -459 -123 -846 -127 -860 l-6 -25 -8 30 c-5 17 -47 390 -94 830 -48 440 -89 819 -92 843 l-6 42 -243 0 -244 0 0 -26z"/><path d="M16560 2295 l0 -1485 200 0 200 0 0 1087 c0 597 3 1083 7 1079 4 -3 88 -491 188 -1084 l181 -1077 151 -3 c137 -2 151 -1 155 15 3 10 83 485 179 1056 l174 1039 3 -1056 2 -1056 248 2 247 3 0 1480 0 1480 -357 3 -356 2 -6 -27 c-3 -16 -58 -343 -121 -728 -64 -385 -119 -708 -123 -718 -4 -10 -57 303 -121 715 -63 403 -116 739 -119 746 -3 9 -86 12 -368 12 l-364 0 0 -1485z"/><path d="M18750 2295 l0 -1485 625 0 625 0 0 235 0 235 -355 0 -355 0 0 400 0 400 255 0 255 0 -2 248 -3 247 -252 3 -253 2 0 365 0 365 340 0 340 0 0 235 0 235 -610 0 -610 0 0 -1485z"/><path d="M4306 3569 c-153 -18 -278 -74 -403 -181 -95 -81 -914 -980 -910 -999 2 -8 152 -249 333 -534 367 -580 411 -637 535 -699 108 -54 197 -70 358 -63 125 5 170 13 299 52 12 4 22 12 22 17 0 5 -173 271 -386 590 -212 320 -383 586 -381 592 3 7 125 139 272 295 218 231 270 280 280 269 21 -22 895 -1399 895 -1410 0 -5 -122 -266 -270 -580 -149 -313 -272 -575 -273 -581 -3 -19 130 -58 236 -70 227 -26 386 38 490 196 19 29 335 722 702 1541 513 1145 664 1490 654 1497 -8 4 -50 18 -94 30 -96 27 -262 32 -340 10 -129 -36 -255 -141 -322 -266 -17 -33 -126 -284 -242 -559 -116 -274 -215 -505 -219 -513 -11 -18 41 -98 -431 672 -216 352 -398 646 -405 653 -30 31 -272 56 -400 41z"/><path d="M840 3559 c-456 -43 -747 -254 -824 -596 -80 -356 125 -687 499 -807 44 -14 221 -53 394 -86 172 -33 332 -65 354 -71 181 -49 226 -187 85 -264 -81 -44 -180 -50 -499 -31 -354 21 -494 21 -556 0 -106 -36 -173 -110 -210 -229 -21 -71 -26 -296 -7 -315 7 -7 47 -16 90 -21 371 -42 931 -54 1145 -25 480 65 745 303 775 697 22 293 -121 541 -390 673 -124 61 -217 86 -592 156 -177 33 -341 68 -365 79 -155 67 -113 202 76 242 78 16 270 16 570 0 219 -13 246 -12 304 3 151 39 226 135 252 324 10 73 5 196 -9 219 -7 11 -226 36 -467 53 -162 11 -502 11 -625 -1z"/><path d="M11202 3354 c-67 -33 -113 -88 -168 -199 -91 -187 -133 -404 -141 -730 -10 -394 40 -701 148 -921 84 -172 214 -250 334 -200 79 34 167 156 225 314 136 374 150 885 35 1326 -91 351 -250 501 -433 410z"/><path d="M7080 2318 c1 -317 74 -657 182 -846 42 -75 130 -166 183 -191 216 -102 414 150 340 434 -38 143 -116 231 -379 421 -98 71 -210 155 -247 187 -38 31 -71 57 -74 57 -3 0 -5 -28 -5 -62z"/></g></svg>', 
            networkId: '450'
        },
        { 
            id: 'syfy', 
            name: 'Syfy', 
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-326.5 140.209 1000 245.582"><g fill="#6a1b9a"><path d="M155.556,140.209H57.469c-2.189,2.19-3.416,3.418-5.604,5.605v116.616H27.187V145.815l-5.604-5.605h-96.964c-2.189,2.19-3.415,3.418-5.604,5.605v117.738l66.425,67.021v49.611c2.189,2.188,3.415,3.412,5.604,5.604H88.01c2.189-2.191,3.415-3.416,5.604-5.604v-50.188l67.546-67.567V145.815C158.972,143.627,157.745,142.4,155.556,140.209"/><path d="M667.896,140.212h-98.088c-2.189,2.189-3.415,3.419-5.604,5.607v116.616h-24.678V145.819c-2.189-2.188-3.414-3.417-5.604-5.607h-96.964c-2.189,2.189-3.416,3.419-5.605,5.607v117.734l66.426,67.021v49.611c2.189,2.189,3.414,3.416,5.604,5.605h96.967c2.189-2.189,3.416-3.416,5.604-5.605v-50.184l67.547-67.567V145.819C671.311,143.631,670.084,142.401,667.896,140.212"/><path d="M-111.27,140.209h-166.187l-49.044,49.058v67.573c2.19,2.19,3.417,3.416,5.604,5.59h104.813v-24.106h104.813c2.19-2.19,3.415-3.418,5.604-5.609v-86.9C-107.854,143.627-109.079,142.4-111.27,140.209"/><path d="M-320.895,286.539c-2.189,2.189-3.417,3.418-5.604,5.607v88.037c2.188,2.188,3.415,3.416,5.604,5.605h166.187l49.042-49.057v-68.693c-2.188-2.191-3.415-3.42-5.604-5.607h-104.813v24.107H-320.895z"/><path d="M401.07,140.212H234.883l-49.043,49.059v190.915c2.189,2.189,3.417,3.416,5.604,5.605h96.967c2.188-2.189,3.415-3.416,5.604-5.605v-30.553H401.07c2.189-2.193,3.414-3.42,5.604-5.609v-75.982c-2.189-2.191-3.414-3.416-5.604-5.606H294.016v-24.109H401.07c2.189-2.189,3.414-3.417,5.604-5.606v-86.9C404.484,143.631,403.26,142.401,401.07,140.212"/></g></svg>', 
            networkId: '77' 
        },
        { 
            id: 'educational_and_reality', 
            name: tr('educational_title'), 
            svg: '<svg viewBox="0 0 210 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"> <title id="title1586">Discovery Channel 2000 logo</title>  <defs id="defs1555" /> <g inkscape:label="Capa 1" inkscape:groupmode="layer" id="layer1"> <path id="rect1261-5-5" style="fill:#000000;fill-opacity:0.952941;stroke-width:0.859437" d="M 2.3479895,1.4850426 V 44.350422 H 14.833391 c 7.603529,0 10.88268,-3.395932 10.88268,-11.551708 V 13.025721 c 0,-8.0856579 -3.279151,-11.5406784 -10.88268,-11.5406784 z M 51.115115,6.445752 c -7.112857,0 -10.568379,3.1911718 -10.568379,9.65675 0,5.646314 3.70284,7.780616 9.452729,12.364095 2.351574,1.823051 3.275278,2.955821 3.275278,6.155393 0,0.291692 -0.01468,0.551569 -0.03312,0.8032 a 31.494859,31.494859 0 0 0 -4.074806,0.290401 c -0.02596,-0.449811 -0.03162,-0.955529 -0.03162,-1.540226 v -5.203321 h -8.715534 v 4.576571 c 0,1.726863 0.132921,3.212144 0.402517,4.503048 a 31.494859,31.494859 0 0 0 -3.367178,1.740566 31.494859,31.494859 0 0 1 0.128666,-0.08089 V 7.0044973 H 28.868264 V 44.352256 h 2.492302 A 31.494859,31.494859 0 0 1 32.294137,43.52884 31.494859,31.494859 0 0 0 25.42009,52.492669 H 2.5170195 V 72.94204 H 22.499535 A 31.494859,31.494859 0 0 0 53.337176,98.407247 31.494859,31.494859 0 0 0 84.248333,72.94204 H 208.21274 V 52.492669 H 81.267191 a 31.383439,31.494859 0 0 1 0.03464,0.08089 31.494859,31.494859 0 0 0 -5.541517,-7.664377 c 0.07536,0.0033 0.149673,0.0075 0.229779,0.0075 8.475835,0 10.820193,-3.827844 10.820193,-11.987301 v -3.71276 h -8.833254 v 4.960709 c 0,2.572211 -0.07141,3.896524 -1.986864,3.896524 -1.915418,0 -1.973981,-1.257885 -1.973981,-3.896524 V 17.168661 c 0,-2.564829 0.05854,-3.881814 1.973981,-3.881814 1.915434,0 1.986864,1.246867 1.986864,3.881814 v 4.95887 h 8.833328 v -3.698014 c 0,-8.163166 -2.344361,-11.9817939 -10.820192,-11.9817939 v -0.00187 c -8.468551,0 -10.809155,3.8813689 -10.809155,11.9817949 v 14.499824 c 0,1.920859 0.13582,3.592733 0.444787,5.03974 a 31.494859,31.494859 0 0 0 -3.545243,-1.301423 c 0.102688,-0.790478 0.159875,-1.634079 0.159875,-2.549276 0,-5.210843 -1.911443,-8.59582 -6.425581,-11.990984 -3.529169,-2.697681 -6.614891,-4.074423 -6.614891,-6.521154 0,-1.572115 0.486788,-2.319533 1.91517,-2.319533 1.235759,0 1.973997,0.80771 1.973997,2.003398 v 1.878416 1.564123 h 8.723065 v -2.442677 c 0,-6.9600914 -3.27888,-9.8423843 -10.697047,-9.8423843 z m 49.210095,0 c -8.461285,0 -10.814682,3.88321 -10.814682,11.983633 v 14.499826 c 0,8.15578 2.353397,11.985463 10.814682,11.985463 8.47582,0 10.8257,-3.829683 10.8257,-11.985463 V 18.429385 c 0,-8.16685 -2.34988,-11.983633 -10.8257,-11.983633 z m 48.59803,0 c -8.47582,0 -10.82385,3.88321 -10.82387,11.983633 v 14.499826 c 0,8.15578 2.34805,11.985463 10.82387,11.985463 8.46855,0 10.82019,-3.829683 10.82019,-11.985463 V 29.21649 h -8.71938 v 4.958873 c 0,2.52054 -0.0617,3.898355 -2.10081,3.898355 -2.04262,0 -2.10817,-1.25972 -2.10817,-3.898355 v -7.089089 h 12.92836 v -8.656889 c 0,-8.16685 -2.35164,-11.983633 -10.82019,-11.983633 z m 27.57889,0.1213158 c -2.59872,0 -4.39398,0.999763 -5.62973,2.4353213 V 7.0063466 h -8.22128 V 44.35227 h 8.71937 V 17.164865 c 0,-2.56114 0.0548,-3.881817 1.97399,-3.881817 1.92269,0 1.97951,1.246869 1.97951,3.881817 v 7.666217 h 8.71754 v -6.912646 c 0,-7.402942 -1.4224,-11.3513651 -7.5394,-11.3513682 z M 114.2332,7.0045108 V 22.123735 c 0,9.672532 2.10079,17.2059 5.8117,22.228535 h 9.76887 c 3.71089,-5.022643 5.80433,-12.556014 5.80433,-22.228545 V 7.0045005 h -8.7157 V 20.881249 c 0,6.838307 -0.67646,12.291409 -1.97399,16.306562 -1.24303,-4.015153 -1.98135,-9.468255 -1.98135,-16.306562 V 7.0045005 Z m 72.76196,0.00187 V 20.430997 c 0,8.539581 1.72998,15.754264 5.80434,23.031728 h -5.80434 v 5.203323 h 13.66356 C 207.0919,38.576504 208.3819,30.158885 208.3819,20.430997 V 7.0063882 h -8.71571 V 20.807784 c 0,7.163068 -0.73823,13.310623 -1.97397,18.015881 -1.24304,-4.89347 -1.98135,-10.989359 -1.98135,-18.015881 V 7.0063882 Z M 11.681254,9.6383743 h 1.542064 c 3.216599,0 3.030828,1.5059837 3.030828,5.0893657 v 16.376408 c 0,3.631355 0.185767,5.082015 -3.030828,5.082015 h -1.542064 z m 88.643956,3.6465507 c 1.92269,0 1.9795,1.246869 1.9795,3.881817 v 17.008675 c 0,2.572208 -0.0568,3.898354 -1.9795,3.898354 -1.908155,0 -1.974001,-1.259722 -1.974001,-3.898354 V 17.16669 c 0,-2.564829 0.06584,-3.881813 1.974001,-3.881813 z m 48.59803,0 c 2.03899,0 2.10081,1.247729 2.10081,4.133617 v 2.82682 h -4.20898 v -2.826815 c 0,-2.885889 0.0655,-4.133618 2.10817,-4.133622 z M 55.496864,37.617907 c 2.667509,0.0384 5.300485,0.666408 7.833479,1.477737 0.02785,0.573025 0.112706,1.147316 0.04044,1.720346 -0.292984,0.246644 -0.702638,0.2058 -1.056839,0.211372 -0.593437,-0.0094 -1.272936,-0.134502 -1.567792,-0.716812 -1.051489,-0.265202 -2.301488,-0.510138 -3.297336,0.02184 0.189124,0.233694 0.43634,0.433081 0.558743,0.716817 -0.26332,0.615687 -0.765459,1.086555 -1.082572,1.672561 1.001405,-0.619389 2.036444,-1.382839 3.2808,-1.306809 0.0983,0.272619 0.04047,0.496515 -0.174592,0.674545 -0.617541,0.574879 -1.435932,0.870362 -2.209255,1.170792 -0.762173,0.304127 -1.584655,0.104388 -2.374665,0.145194 -0.283685,0.289333 -0.442846,0.667866 -0.661675,1.005379 -1.656047,-0.676886 -2.90789,-2.042888 -4.537971,-2.769838 -0.246644,-0.09641 -0.519702,-0.07879 -0.77747,-0.112104 -0.420964,-0.454345 -0.802964,-0.944513 -1.242475,-1.382159 -0.632379,0.969874 -0.848166,2.216254 -0.338156,3.288145 0.322684,0.586004 -0.255491,1.079595 -0.667186,1.413404 -1.058902,0.802982 -2.212976,1.495392 -3.448057,1.990533 -0.960606,0.411695 -2.055734,0.361346 -2.990391,0.858334 -1.333365,0.689863 -2.57037,1.556384 -3.918568,2.22028 -1.529939,0.845637 -3.184769,1.445827 -4.683171,2.347102 -0.448786,0.231813 -0.721538,0.660059 -1.01825,1.047648 -0.521113,0.220706 -1.140996,0.208021 -1.597196,0.58448 -1.476166,1.146057 -2.655895,2.661232 -3.481138,4.333959 -0.419105,0.828954 -0.698527,1.720257 -1.100948,2.556629 0.235525,-1.153486 0.412056,-2.326119 0.786659,-3.446212 0.934647,-2.585137 2.289254,-4.999352 3.834019,-7.267375 1.253621,-1.804399 2.640742,-3.54402 4.34315,-4.946006 1.48914,-1.248053 2.950865,-2.578324 4.708897,-3.446213 3.708942,-2.173447 7.883688,-3.543312 12.158245,-3.992089 1.173878,-0.153964 2.358693,0.0019 3.536272,-0.04962 0.382261,-0.01958 0.763987,-0.02786 1.145066,-0.02184 z m -8.377516,2.466568 c -0.99584,0.202149 -2.01911,0.37279 -2.938925,0.823412 -0.344894,0.1502 -0.564601,0.458464 -0.733355,0.781145 1.340781,-0.209527 2.52066,-0.92767 3.67228,-1.604557 z m -11.546191,0.884068 a 31.494859,31.494859 0 0 0 -2.488622,1.863707 31.494859,31.494859 0 0 1 2.488622,-1.863707 z M 69.21004,43.91299 c 0.194319,0.0075 0.43584,0.208585 0.602851,0.264638 0.819681,0.576741 1.605032,1.316681 1.964805,2.273587 0.176174,0.430242 -0.0574,1.235923 -0.624912,1.145058 -0.955049,-0.420966 -1.519658,-1.390775 -1.972152,-2.282773 -0.129835,-0.387593 -0.421071,-0.869593 -0.194846,-1.257177 0.0574,-0.109507 0.135933,-0.14666 0.224209,-0.143348 z m -18.455162,0.663508 c 0.871606,0.307853 1.746139,0.633938 2.565817,1.066028 0.172485,0.07604 0.268177,0.213329 0.286736,0.406195 -0.22259,0.317113 -0.682108,0.525429 -0.657997,0.964939 0.190969,0.393151 0.610267,0.592861 1.016407,0.683729 0.8753,0.250371 1.767638,-0.04379 2.650354,-0.08089 -0.261475,0.419106 -0.532581,0.86922 -0.994338,1.093601 -0.402427,0.207683 -0.962096,-0.08432 -1.28107,0.306951 -0.886429,0.906828 -1.093061,2.209727 -1.360112,3.396583 -0.12607,0.628671 -0.526913,1.183515 -0.591821,1.819602 0.300437,1.008825 1.138971,1.809473 2.030963,2.328722 0.917963,0.298555 1.923478,0.225299 2.850708,0.520151 0,0.115002 -5.6e-5,0.34817 0.0019,0.465007 -0.877167,0.582308 -1.93953,0.430407 -2.920554,0.601018 -0.767729,0.10943 -1.099321,0.862486 -1.48876,1.429949 -0.617533,-0.673176 -1.499042,-1.01236 -2.409585,-0.847306 0.101939,0.621237 0.50559,1.240505 0.281201,1.876575 -0.278189,0.7214 -0.793191,1.312736 -1.297614,1.885774 -0.73807,0.784434 -1.5208,1.6865 -2.67242,1.77181 -0.233694,0.602712 -0.0908,1.495589 -0.832604,1.760784 -0.72139,0.407979 -1.151771,-0.45444 -1.637644,-0.816068 -0.574885,-0.265202 -1.220558,-0.01731 -1.825113,-0.102917 -0.58971,-0.369062 -0.181709,-1.408314 0.40619,-1.567794 0.673182,-0.150238 0.832692,0.800717 1.444646,0.873042 0.257786,-0.02032 0.512385,-0.0768 0.766446,-0.126823 0.259631,-0.530379 0.445072,-1.156532 0.205875,-1.727698 -0.231776,-0.506268 -0.805886,-0.733183 -1.330704,-0.751731 -0.628657,0.07415 -1.118323,0.502719 -1.644984,0.808708 -0.02221,-1.025526 0.497422,-1.997975 0.36575,-3.021643 0.01845,-0.352349 -0.524428,-0.33108 -0.663511,-0.09558 -0.654635,0.823378 -0.276157,1.945266 -0.430088,2.902172 -0.307854,0.02447 -0.64257,-0.159384 -0.931861,-0.0143 -0.127952,0.450629 -0.195485,0.934239 -0.534844,1.286585 -0.591614,-0.0501 -1.416005,-0.348284 -1.334412,-1.082646 0.06674,-1.066322 -0.108415,-2.255856 -0.939213,-3.008772 -0.439487,-0.439631 -1.110792,-0.155847 -1.656005,-0.213329 -0.422822,-0.394997 -0.956132,-0.631947 -1.532869,-0.667177 -0.437651,-0.593427 -0.39459,-1.391308 -0.04412,-2.016268 0.242902,0.0061 0.484899,0.0094 0.727841,0.0143 0.11126,-0.611984 0.01333,-1.230202 -0.261011,-1.784681 -1.116388,-0.08349 -2.079842,0.6658 -3.198084,0.613885 0.791861,-0.916119 1.879728,-1.883639 3.179708,-1.709322 1.413101,0.168759 2.237618,-1.213759 3.387386,-1.755272 0.276308,-0.224396 0.583781,-0.02862 0.869372,0.0588 -0.191006,1.368604 -1.355177,2.236658 -2.323209,3.082295 -0.276331,0.209528 -0.467745,0.498864 -0.573446,0.825257 0.426529,0.172485 0.914038,0.254474 1.264535,0.575289 0.222514,0.265203 0.34226,0.594633 0.505439,0.898768 0.838217,-0.03727 1.089243,-0.940466 1.165277,-1.626606 0.103854,-0.608272 -0.03426,-1.404216 0.527503,-1.817769 0.645355,-0.330103 1.466275,-0.390416 2.135735,-0.09558 0.812265,0.452489 1.022342,1.43505 1.595365,2.100813 0.339399,0.298554 0.778803,0.035 1.042136,-0.227936 0.999568,-0.917962 0.803991,-2.757859 -0.319825,-3.484813 -0.493295,-0.337554 -1.045004,-0.02109 -1.549424,0.101075 -0.509968,-0.322686 0.01807,-1.046446 0.450311,-1.181826 0.565613,-0.276308 1.074743,0.187016 1.542064,0.446632 0.524826,0.363492 1.249107,0.245816 1.744247,-0.113948 0.886433,-0.634224 1.36076,-1.652882 2.113679,-2.418781 0.357921,0.958762 1.486732,0.980959 2.336073,0.8326 -0.250371,-0.305971 -0.63902,-0.549498 -0.705782,-0.968608 0.649068,-0.439506 1.437945,-0.568509 2.192698,-0.711301 -0.383872,-1.335221 -1.241988,-2.460527 -1.70931,-3.760506 z m -4.503058,3.359826 c 0.41173,0.0049 0.635257,0.460056 0.764602,0.803197 -0.398712,0.680595 -1.296467,-0.272844 -0.805031,-0.80136 0.01318,-8.09e-4 0.0271,-0.0019 0.04044,-0.0019 z m 21.197431,1.312319 c 0.792575,0.01393 1.541456,0.545203 1.948264,1.214903 0.378305,0.634228 0.909091,1.318218 0.782979,2.100816 -0.157616,0.493281 -0.784895,0.436239 -1.189177,0.363906 -1.292559,-0.196579 -2.18468,-1.366448 -3.501355,-1.479572 -1.448345,-0.122419 -2.835971,0.531783 -4.286168,0.463166 0.04638,-0.597138 0.613041,-0.902842 1.121169,-1.066025 1.214674,-0.380187 2.525294,-0.550353 3.775215,-0.253647 0.278189,-0.0019 0.680089,0.189576 0.88223,-0.05699 0.01694,-0.411699 -0.228348,-0.864196 0.02409,-1.238796 0.147829,-0.035 0.296222,-0.05045 0.442951,-0.0478 z m -16.826712,1.573309 c -0.580709,0.03426 -1.112974,0.384147 -1.646824,0.591833 -0.77146,0.311579 -1.506115,0.993647 -1.415249,1.898633 0.313387,0.113121 0.629575,0.217469 0.931857,0.358372 0.0061,0.422818 -0.06588,0.841723 -0.09558,1.262689 0.988436,-0.758476 1.719425,-2.007553 3.063915,-2.159624 0.09271,-0.688014 0.09613,-1.542166 -0.586319,-1.944588 -0.08508,-0.0094 -0.168833,-0.01205 -0.251801,-0.0075 z m 21.649571,0.126822 c 0.0783,9.42e-4 0.157126,0.01205 0.237081,0.03464 0.309699,0.391317 0.311845,0.939174 0.584474,1.356433 0.485866,0.749205 1.197034,1.328641 1.966639,1.768141 0.623092,0.376463 1.430419,0.304502 1.997884,0.788492 0.890145,0.730654 1.594413,1.725158 1.907822,2.83784 0.20215,0.561909 -0.303787,1.108382 -0.860174,1.099117 -0.767752,0.142823 -1.388303,-0.58756 -1.523683,-1.273726 -0.0946,-0.623107 -0.05665,-1.272102 -0.299571,-1.867384 -0.860489,-0.191081 -1.62824,-0.636163 -2.271744,-1.231448 -0.981009,-0.888288 -2.063062,-1.795665 -2.587875,-3.040021 0.195864,-0.287789 0.509717,-0.476933 0.849143,-0.472359 z m -13.953945,0.534852 c 0.246079,-0.0075 0.495235,0.08865 0.67453,0.30695 0.487736,0.437666 -0.389986,0.823198 -0.764597,0.847309 -0.409824,0.105704 -0.4945,-0.415192 -0.691075,-0.643293 0.153324,-0.320238 0.464743,-0.50148 0.781142,-0.510955 z m 4.183243,1.332534 c -0.400571,1.164603 -1.727401,2.231414 -3.001418,1.80674 -0.189123,-0.398711 0.07612,-0.804854 0.400673,-1.03111 0.32453,0.01844 0.645916,0.07695 0.970458,0.102917 0.511835,-0.357957 0.945984,-0.887829 1.630287,-0.87856 z m -6.370437,0.249956 c 0.01731,-3.64e-4 0.03388,-9.41e-4 0.05143,0 1.010695,0.274501 1.809869,1.027993 2.490455,1.790192 -1.01254,0.11681 -2.145123,-0.02898 -2.949951,-0.700267 -0.483262,-0.346777 -0.13036,-1.078274 0.408032,-1.089925 z m -7.366628,2.494138 c -0.606409,0.637947 -0.899205,1.501438 -1.056835,2.35078 -0.16507,0.669466 0.141842,1.412008 0.727836,1.775488 0.51926,-1.303698 0.443975,-2.755801 0.328973,-4.126268 z m -2.587874,0.257334 c -0.0271,0.0019 -0.05451,0.01129 -0.08089,0.02786 -0.56933,0.248526 -1.201465,0.721954 -1.266371,1.384 0.665755,0.170641 1.313927,-0.365975 1.547583,-0.95759 0.175234,-0.146021 -0.0094,-0.465906 -0.200379,-0.453985 z m -5.212512,0.145231 c -0.17305,0.0042 -0.33842,0.04337 -0.466855,0.123134 -0.242954,0.118654 -0.342222,0.313726 -0.299571,0.584478 0.337554,0.519247 1.163165,0.556775 1.606387,0.158067 0.253119,-0.556349 -0.320879,-0.875778 -0.839947,-0.865689 z m 58.260306,1.398704 c 2.454687,0 5.122767,0.931843 5.232707,3.545466 l 0.0218,0.345535 h -2.96649 l -0.0128,-0.317942 c -0.0497,-0.948538 -1.19957,-1.374808 -2.246003,-1.374808 -0.482421,0 -2.896666,0.146096 -2.896666,3.080458 0,2.937766 2.414245,3.091482 2.896666,3.091482 1.589163,0 2.266273,-0.781138 2.369143,-1.44649 l 0.0423,-0.279395 h 2.93894 l -0.0218,0.354758 c -0.16673,2.296302 -2.11152,3.562006 -5.495567,3.562006 -3.614625,0 -5.686715,-1.924901 -5.686715,-5.282353 0,-3.306248 2.174467,-5.278679 5.824563,-5.278679 z m -55.444527,0.226053 c -0.255943,0.287488 -0.478069,0.603519 -0.661671,0.942891 0.369064,0.09457 0.744726,0.172147 1.119333,0.24258 0.179863,-0.484018 -0.122005,-0.870239 -0.457662,-1.185497 z m 65.797854,0.02184 h 2.88013 v 3.824837 h 4.64273 v -3.824712 h 2.87828 v 10.061106 h -2.87828 v -4.039882 h -4.64273 v 4.039879 h -2.88013 z m 19.95496,0 h 3.17787 l 5.35035,10.061102 h -3.36718 l -1.13035,-2.104508 h -5.20516 l -1.03111,2.104486 h -3.13009 z m 12.78314,0 h 3.60797 l 5.04341,6.581809 v -6.581812 h 2.6669 V 67.67052 h -3.46458 l -5.1923,-6.717817 v 6.717817 h -2.6614 z m 16.84878,0 h 3.60059 l 5.05078,6.581809 v -6.581812 h 2.6669 V 67.67052 h -3.47194 l -5.1831,-6.717686 v 6.717813 h -2.66323 z m 16.81199,0 h 8.42348 v 2.190873 h -5.55438 v 1.558604 h 5.35771 v 2.198232 h -5.35771 v 1.913333 h 5.80802 v 2.201901 h -8.67712 z m 13.83633,0 h 2.8746 v 7.861042 h 5.37977 v 2.201901 h -8.25437 z M 59.102984,57.774858 c 0.0739,-3.77e-4 0.153739,0.01581 0.238966,0.04962 0.493284,0.810406 0.808881,1.801974 0.582637,2.749619 -1.090442,-0.113157 -2.067867,-1.647994 -1.225934,-2.551117 0.107097,-0.16443 0.241751,-0.247361 0.404354,-0.248151 z M 40.752593,58.18289 c -0.30439,-0.0042 -0.61029,0.02333 -0.911642,0.08635 -0.467334,1.038507 -0.149825,2.702806 1.198358,2.799242 0.18728,-0.934654 0.571163,-1.827609 0.621237,-2.786375 -0.300437,-0.06019 -0.603593,-0.09531 -0.907953,-0.09927 z m -12.34388,0.235199 c -0.16691,0.704709 -0.610297,1.28692 -1.01457,1.86923 -0.799267,1.13122 -1.552855,2.299419 -2.198216,3.527087 -0.168766,0.302282 -0.339132,0.626936 -0.645134,0.812386 -0.168765,-0.567469 -0.190358,-1.174842 -0.0717,-1.753435 0.176168,-0.904984 0.985913,-1.455062 1.520005,-2.14492 0.780731,-0.79 1.423023,-1.757702 2.409594,-2.310348 z m 33.960365,1.060521 c 0.536248,-0.0042 0.865065,0.476884 1.077057,0.91164 -0.598985,0.356074 -1.31085,0.177943 -1.683602,-0.4062 0.170603,-0.183628 0.354833,-0.353402 0.553244,-0.503606 0.01769,-9.38e-4 0.03577,-0.0019 0.0533,-0.0019 z m 68.589742,0.887746 -1.48878,2.999581 h 2.97755 z m -96.626298,1.451983 c -0.146492,0.517399 -0.32712,1.064594 -0.74622,1.431786 -0.42468,0.08349 -0.241803,-0.378621 -0.126819,-0.584481 0.218836,-0.34866 0.565203,-0.587685 0.873039,-0.847305 z m 1.108309,1.051321 c 0.669458,0.550786 0.06642,1.376121 -0.376777,1.849006 -0.252193,-0.654626 -0.162875,-1.372401 0.376777,-1.849006 z m -5.657304,0.617562 c -0.956911,0.526676 -1.868101,1.137926 -2.615453,1.940908 -0.04261,-0.485861 -0.140667,-1.034719 0.176451,-1.455683 0.78259,-0.272619 1.630446,-0.312747 2.439002,-0.485225 z m 39.169197,1.876577 c 1.246197,0.517393 2.282994,1.420306 3.291822,2.297477 1.450188,1.355625 2.823387,2.828014 3.828515,4.552679 0.71953,1.262892 1.544244,2.471817 2.538244,3.534435 0.45435,0.502568 0.963965,1.180993 0.661675,1.893123 -0.420955,0.281841 -0.973996,0.188822 -1.402379,0.448462 -0.841933,0.535942 -0.925672,1.765971 -1.828796,2.216612 -0.853056,-0.03881 -1.658805,-0.455611 -2.378339,-0.893264 -0.548934,-0.320841 -0.775397,-0.932437 -1.009058,-1.486931 -1.049623,0.526675 -1.858422,1.523961 -3.073095,1.700136 -0.556351,0.179863 -1.316155,0.0571 -1.505306,-0.578964 -0.307854,-0.981023 -0.534252,-2.249642 0.224246,-3.082287 0.255905,-0.272619 0.267913,-0.656758 0.31798,-1.003543 -1.197994,0.454346 -1.876017,1.619058 -2.766161,2.468414 -0.456201,-0.934662 -1.316188,-1.7381 -1.295786,-2.843365 0.864186,0.276308 1.190078,1.176036 1.709327,1.826952 0.365335,-0.864185 0.129645,-1.811562 0.226052,-2.714701 -0.02786,-0.307854 0.199965,-0.515341 0.450299,-0.641448 0.563762,0.0061 0.831314,0.577727 1.185502,0.922664 0.689867,-0.337555 1.107422,-1.041304 1.825108,-1.341727 0.92909,0.554487 1.123537,1.742735 1.064194,2.738594 0.01317,0.643497 -0.443921,1.136728 -0.748059,1.659694 1.448357,0.01318 2.839931,-1.209448 3.017966,-2.65037 1.040351,0.170566 1.139712,1.360567 1.534712,2.135735 0.565626,-1.548475 0.599633,-3.329761 -0.07353,-4.850428 -0.563758,-1.46689 -1.593686,-2.711585 -2.815786,-3.681473 -0.912378,-0.700993 -2.014634,-1.159654 -2.817625,-1.999723 -0.04085,-0.155772 -0.122795,-0.470969 -0.161718,-0.626753 z m -39.284993,0.246306 c 0.81678,-0.0128 1.622483,0.364885 2.20925,0.928183 -0.522956,0.337518 -1.216928,0.585947 -1.402381,1.246144 -0.207709,0.688011 -0.194463,1.423897 -0.441116,2.104491 -0.901266,-0.459895 -1.022467,-1.581896 -1.167113,-2.475744 -0.01333,-0.576737 -0.208963,-1.369549 0.347383,-1.755277 0.150686,-0.03011 0.302708,-0.0454 0.453985,-0.0478 z m 9.748646,1.446487 c 0.819437,0.0019 1.635472,0.150915 2.376511,0.510962 -0.235539,0.688006 -0.929979,0.98856 -1.554939,1.225929 -0.75106,0.265203 -1.547756,0.524808 -2.354447,0.413547 -0.517395,-0.08711 -1.056793,-0.368574 -1.26821,-0.876717 -0.118669,-0.662031 0.612903,-0.974895 1.135868,-1.095439 0.541676,-0.113007 1.104546,-0.17975 1.665217,-0.178282 z m 8.081591,0.551395 c 0.432095,0 1.055704,-0.0068 1.183667,0.520149 0.0075,0.836376 -0.549325,1.574554 -1.196529,2.054862 -0.356076,-0.686154 -0.75027,-1.422891 -0.707618,-2.216605 -0.0061,-0.394999 0.457145,-0.338006 0.72048,-0.358371 z m -2.641167,0.204031 c 0.448692,-0.0042 0.87995,0.109733 1.18733,0.483391 -0.176213,0.20215 -0.254324,0.590204 -0.593666,0.566098 -0.573027,0.05006 -0.982169,-0.489627 -0.906131,-1.029267 0.103968,-0.01167 0.208924,-0.0192 0.312483,-0.02032 z m -10.845926,0.284891 c 0.410331,-0.0068 0.8035,0.160439 1.088082,0.578959 -0.726951,0.778879 -1.754978,1.295236 -2.821294,1.356434 -0.465468,0.05371 -0.216054,-0.498137 -0.09926,-0.700272 0.316034,-0.662919 1.10099,-1.223757 1.832467,-1.235121 z m 9.052056,1.194681 c 0.914331,0.02447 1.827958,0.354946 2.541919,0.924509 0.817818,0.632372 1.945248,0.710483 2.904014,0.387825 0.12607,-0.272618 0.239115,-0.552981 0.424573,-0.788493 0.728813,0.289332 0.554923,1.117792 0.36575,1.703809 0.05192,0.09641 0.153964,0.289521 0.204031,0.385988 0.639785,0.107549 1.305271,0.107587 1.891277,-0.209527 0.03727,-0.146511 0.10992,-0.439812 0.147038,-0.586314 0.515556,0.420958 0.849745,1.02224 1.402375,1.398704 0.155771,-0.261476 0.257938,-0.638938 0.602859,-0.714975 1.255469,-0.32645 2.584001,-0.200567 3.846897,0.02786 0.402422,0.05195 0.402547,0.519627 0.604688,0.784815 0.992144,0.509998 2.152178,0.307063 3.196252,0.499929 0.424675,0.665747 0.498257,1.500279 0.479706,2.271746 0.02032,0.463611 -0.371284,0.766815 -0.577121,1.137711 -0.343051,0.789999 0.35295,1.743182 -0.06437,2.48311 -0.817825,-0.06306 -1.589789,-0.43072 -2.422447,-0.360253 -0.14094,0.244799 -0.248263,0.518306 -0.444796,0.726004 -0.430248,0.05191 -0.863698,-0.0128 -1.29394,-0.02184 -0.09091,0.433946 -0.159385,0.87098 -0.216867,1.310482 1.422374,0.515543 2.948165,-0.03125 4.390936,0.327165 -0.140939,0.684302 -0.380695,1.341244 -0.562422,2.016264 -0.185435,0.780738 -0.966833,1.174255 -1.374815,1.817765 -0.08157,0.426527 0.532626,0.466807 0.782982,0.678212 0.623093,-0.23554 1.230732,-0.538157 1.724021,-0.992502 0.530375,-0.433957 0.957132,-1.036425 1.628454,-1.264533 0.719532,-0.05007 1.111009,0.92388 1.839818,0.786652 0.723257,-0.391318 1.048521,-1.407844 1.985022,-1.413404 -0.263319,1.175742 -1.413637,1.78872 -2.214768,2.575011 1.129383,0.369064 2.451068,0.862243 3.574877,0.215023 1.452039,-0.841925 2.695375,-2.215084 4.455263,-2.385695 1.316667,-0.09271 2.395023,0.922311 3.001424,1.996042 -0.382027,0.135367 -0.819334,0.297312 -0.865689,0.762767 -0.415396,1.69313 -2.040244,2.589395 -3.063911,3.865271 0.495152,-0.289333 0.987596,-0.588427 1.538383,-0.764605 -0.465481,1.13494 -1.390679,1.996322 -2.293802,2.791901 -3.506809,2.592531 -7.559965,4.506971 -11.860485,5.306246 -3.749736,0.754775 -7.656931,0.696593 -11.388128,-0.130512 -0.836369,-0.181746 -1.700713,-0.316211 -2.462893,-0.722323 -0.725074,-0.374596 -1.360352,-0.940821 -2.155927,-1.168918 -0.663898,-0.120536 -1.372877,0.07635 -2.001555,-0.235237 -1.568889,-0.721484 -3.043907,-1.638251 -4.468136,-2.611854 -1.707961,-1.016248 -3.139911,-2.420837 -4.514075,-3.843216 -1.275868,-1.444638 -2.574512,-2.880644 -3.663096,-4.475477 -0.179844,-0.242951 -0.238671,-0.541447 -0.270181,-0.834447 0.773314,0.420956 1.138995,1.259866 1.821442,1.784675 0.318972,-1.09971 -0.449154,-2.072474 -1.198363,-2.779025 -0.393155,-0.404391 -0.977441,-0.493691 -1.433641,-0.795961 -0.641652,-0.65462 -1.018485,-1.507207 -1.40421,-2.326877 -0.474746,-1.006983 -0.86289,-2.066978 -0.970452,-3.183378 1.018108,-0.34866 2.111857,-0.148732 3.142943,0.03312 1.240642,0.220707 2.463176,1.127869 2.637495,2.440836 0.124232,1.118255 -0.08441,2.336272 0.520154,3.348808 0.322656,0.61754 1.34773,0.393886 1.499793,1.157917 0.239217,0.87346 -0.145592,2.227666 0.928178,2.637509 0.179882,-0.665767 0.04022,-1.385604 0.275705,-2.032809 0.469181,-0.415402 1.171135,-0.310263 1.753434,-0.345534 1.146064,0.03351 2.525625,0.0207 3.324906,0.988831 -0.320803,0.292983 -0.65322,0.569107 -0.983325,0.850978 -0.0019,0.100169 -0.0061,0.298706 -0.0075,0.398845 0.471028,0.246643 1.012196,0.213365 1.485082,-0.0113 0.880875,-0.37646 1.902409,-0.822442 2.304829,-1.757104 -0.20215,-0.662042 -0.938183,-0.849913 -1.466706,-1.176302 -0.808546,-0.409835 -1.344629,-1.260807 -2.258876,-1.474064 -1.014399,-0.235541 -2.119432,-0.354006 -3.126409,-0.0256 -0.489578,0.09271 -0.640097,0.978345 -1.205712,0.711293 -0.08347,-0.111238 -0.251057,-0.335371 -0.334491,-0.446616 0.812264,-1.060763 2.185041,-1.424047 3.46092,-1.468557 0.795548,-0.01694 1.608752,-0.01468 2.376502,0.220556 0.441363,0.111238 0.700453,0.529457 1.093603,0.724172 0.365299,-0.01844 0.724566,-0.138079 1.091758,-0.113949 1.136792,0.292984 2.044388,1.236281 2.394881,2.345269 0.115003,0.443215 0.421392,0.780596 0.779305,1.047646 0.402423,-0.73808 0.06453,-1.557208 0.04408,-2.334236 0.326411,0.146511 0.647814,0.305446 0.966779,0.472359 -0.148317,-0.493289 -0.06407,-1.013154 0.317943,-1.378482 0.263358,-0.415406 0.820254,-0.754238 0.762764,-1.299455 -0.341244,-0.764049 -1.189832,-1.260476 -1.321505,-2.130214 -0.0705,-0.398714 0.322121,-0.68898 0.680053,-0.718651 0.606409,-0.06682 1.251881,-0.205461 1.847166,-0.03652 0.29114,0.356075 0.35122,0.87239 0.74806,1.152418 0.660191,0.534079 1.440907,0.94685 2.275421,1.121169 0.504412,0.135369 0.948628,-0.306837 1.128521,-0.733355 0.0797,-0.725097 -0.51942,-1.260728 -1.014569,-1.689103 -1.555894,-1.190574 -3.455212,-1.813731 -5.337498,-2.266224 -0.934664,-0.237384 -1.972318,-0.219014 -2.780849,-0.806876 0.44507,-0.484023 1.4285,-0.733849 1.383998,-1.505308 -0.736233,-0.634228 -1.930165,-0.523667 -2.518034,-1.36746 -0.328257,-0.391277 0.156223,-0.88039 0.571603,-0.88039 0.130023,-0.0094 0.260836,-0.01242 0.391514,-0.0094 z m -5.684876,3.947986 c 0.785606,0.0042 1.572849,0.07163 2.348935,0.17832 0.404283,0.04638 0.774367,0.231662 1.123004,0.431921 -0.224398,0.216981 -0.440016,0.479262 -0.770109,0.529337 -0.843782,0.179862 -1.597349,0.722793 -1.994208,1.496112 0.298593,0.09271 0.59472,0.192023 0.88959,0.299571 -0.495151,0.446923 -1.13486,0.06952 -1.663376,-0.102916 -1.210977,-0.509916 -2.500839,-1.000111 -3.402107,-1.997822 0.324495,-0.289295 0.679777,-0.578436 1.124854,-0.637775 0.7733,-0.141879 1.557822,-0.20083 2.343417,-0.19669 z m -10.390106,3.464586 c -0.200278,0.802983 0.153295,1.574341 0.48523,2.284618 0.65834,0.03727 1.116414,-0.575289 1.031107,-1.196533 0.09645,-0.836283 -0.950727,-0.891432 -1.516337,-1.088006 z m 8.065066,0.305105 c 0.790008,-0.0094 1.476333,0.46608 2.047505,0.966784 -0.96618,0.17433 -2.045049,0.243144 -2.94261,-0.227934 0.01841,-0.445078 0.501954,-0.696217 0.895105,-0.738868 z m 20.480608,2.894818 c -0.05572,0.0049 -0.11026,0.02032 -0.165446,0.04408 -0.237383,0.118655 -0.375349,0.365224 -0.327166,0.634108 0.04642,0.543359 0.999121,0.631646 1.08257,0.08451 0.16714,-0.399175 -0.20004,-0.797528 -0.589995,-0.762768 z m 9.702701,1.575146 c 0.144289,0.0028 0.290123,0.04694 0.424573,0.139735 -0.203994,0.361609 -0.445898,0.699435 -0.735198,0.999869 -0.170564,-0.207683 -0.542699,-0.346364 -0.487065,-0.669034 0.169587,-0.289446 0.480252,-0.477328 0.79769,-0.47052 z m -8.868259,1.769981 c -0.317114,0.280035 -0.829251,0.526769 -0.792164,1.02192 -0.0061,0.550764 0.465564,0.917658 0.816057,1.273716 0.133523,-0.294867 0.187317,-0.642936 0.409872,-0.889584 0.474749,-0.220707 1.024808,-0.178998 1.527368,-0.306949 -0.567473,-0.504424 -1.236039,-0.87843 -1.961133,-1.099114 z m -8.199225,0.619396 c -0.19289,0.712117 1.079317,0.679213 0.825252,1.393189 -0.16138,0.389432 0.0098,1.07698 0.556903,0.878561 0.120537,-0.610128 0.1336,-1.292819 -0.213215,-1.83247 -0.252178,-0.380148 -0.744281,-0.472664 -1.168955,-0.43928 z m -12.185807,0.0478 c -0.382026,0.318996 -0.778681,0.722948 -0.643302,1.271883 0.211394,1.197974 0.996271,2.311886 2.021783,2.964657 0.04262,-0.548918 0.02522,-1.105465 -0.145202,-1.632128 -0.274448,-0.921671 -0.511893,-1.914564 -1.233279,-2.604412 z m 27.764527,0.812387 c -0.100168,0.0019 -0.304203,0.0075 -0.406192,0.0094 -0.16138,0.33379 -0.74818,0.739503 -0.321631,1.082573 0.713958,0.181783 0.853938,-0.574359 0.727842,-1.091755 z m -23.241265,0.847308 c 0.376463,1.15904 0.984125,2.252097 1.720351,3.220134 0.574892,0.775167 1.644441,0.991259 2.534573,0.718649 0.433954,-0.140903 0.462534,-0.710823 0.121327,-0.970454 -0.595277,-0.489577 -1.420469,-0.522196 -2.07324,-0.911635 -0.949494,-0.469181 -1.442516,-1.472544 -2.302992,-2.056694 z m 24.404708,0.297728 c -0.157013,-0.01167 -0.318995,0.02974 -0.46685,0.139696 -0.289333,0.148319 -0.652259,0.615411 -0.262832,0.85834 0.509989,0.194733 1.065009,0.07943 1.591684,0.03162 0.04593,-0.49514 -0.39104,-0.995444 -0.862005,-1.029269 z m -31.212586,0.619408 c 0.05193,1.201686 0.250898,2.659089 1.387674,3.330418 1.609679,0.949483 3.549789,0.910405 5.337499,1.255334 -1.03851,-0.738001 -1.961882,-1.855625 -3.32307,-1.927955 -1.568881,-0.209527 -2.091004,-2.012367 -3.402103,-2.657715 z m 20.385042,0.674529 c -0.302282,0.035 -0.644775,0.0075 -0.891423,0.220557 -0.09826,0.307853 -0.03652,0.634951 -0.02936,0.952076 0.532224,-0.157617 0.920828,-0.605171 0.920828,-1.172641 z" /> </g>  </svg>' 
        },
        { id: 'ukrainian_feed', name: tr('ukrainian_feed_name'), isUkrainianFeed: true },
        { id: 'polish_feed', name: tr('polish_feed_name'), isPolishFeed: true },
        { id: 'russian_feed', name: tr('russian_feed_name'), isRussianFeed: true }
    ];

        // Перевірка нового контенту за останні 7 днів
        function checkNewContent(studio, cardElement) {
            if (!studio.providerId && !studio.networkId) return;
            var d = new Date();
            var today = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
            var weekAgo = new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000);
            var weekAgoStr = [weekAgo.getFullYear(), ('0' + (weekAgo.getMonth() + 1)).slice(-2), ('0' + weekAgo.getDate()).slice(-2)].join('-');

            var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
            var filter = studio.providerId
                ? '&with_watch_providers=' + studio.providerId + '&watch_region=UA'
                : '&with_networks=' + studio.networkId;

            var url = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=primary_release_date.desc&primary_release_date.gte=' + weekAgoStr + '&primary_release_date.lte=' + today + '&vote_count.gte=1' + filter);

            var network = new Lampa.Reguest();
            network.timeout(5000);
            network.silent(url, function (json) {
                if (json.results && json.results.length > 0) {
                    cardElement.find('.card__view').append('<div class="studio-new-badge">NEW</div>');
                } else {
                    // Спробуємо TV
                    var urlTV = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=first_air_date.desc&first_air_date.gte=' + weekAgoStr + '&first_air_date.lte=' + today + '&vote_count.gte=1' + filter);
                    network.silent(urlTV, function (json2) {
                        if (json2.results && json2.results.length > 0) {
                            cardElement.find('.card__view').append('<div class="studio-new-badge">NEW</div>');
                        }
                    });
                }
            });
        }

        Lampa.ContentRows.add({
            index: 1, // After Hero (0)
            name: 'custom_studio_row',
            title: tr('streamings_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var items = studios.map(function (s) {
                        var isUkrainianFeed = s.isUkrainianFeed === true;
                        var isPolishFeed = s.isPolishFeed === true;
                        var isRussianFeed = s.isRussianFeed === true;
                        return {
                            title: s.name,
                            params: {
                                createInstance: function () {
                                    var card = Lampa.Maker.make('Card', this, function (module) {
                                        return module.only('Card', 'Callback');
                                    });
                                    return card;
                                },
                                emit: {
                                    onFocus: function() {
                                        // Colors/Wallpapers map for services
                                        var serviceBGs = {
                                            'netflix': 'linear-gradient(135deg, #000000, #4c0000)',
                                            'disney': 'linear-gradient(135deg, #050f2c, #1a2f63)',
                                            'hbo': 'linear-gradient(135deg, #0f0c29, #302b63)',
                                            'apple': 'linear-gradient(135deg, #000000, #333333)',
                                            'amazon': 'linear-gradient(135deg, #0f1c29, #004d40)',
                                            'hulu': 'linear-gradient(135deg, #0b1a0e, #1ce783)',
                                            'paramount': 'linear-gradient(135deg, #003366, #0066cc)',
                                            'sky_showtime': 'linear-gradient(135deg, #1a1a2e, #e94560)',
                                            'syfy': 'linear-gradient(135deg, #1a0b2e, #6a1b9a)',
                                            'educational_and_reality': 'linear-gradient(135deg, #3e2723, #ff6f00)',
                                            'ukrainian_feed': 'linear-gradient(135deg, #0057b7, #ffd700)',
                                            'polish_feed': 'linear-gradient(135deg, #ffffff, #c41e3a)',
                                            'russian_feed': 'linear-gradient(135deg, #0039a6, #d52b1e)'
                                        };
                                        
                                        // Используем метод Lampa.Background.change()
                                        if (Lampa.Background && Lampa.Background.change) {
                                            if (serviceBGs[s.id]) {
                                                 $('.background').css('background', serviceBGs[s.id]);
                                                 $('.background__img').css('opacity', 0);
                                            } else {
                                                 $('.background').css('background', '');
                                                 $('.background__img').css('opacity', 1);
                                            }
                                        }
                                    },
                                    onHover: function() {
                                        // Colors/Wallpapers map for services
                                        var serviceBGs = {
                                            'netflix': 'linear-gradient(135deg, #000000, #4c0000)',
                                            'disney': 'linear-gradient(135deg, #050f2c, #1a2f63)',
                                            'hbo': 'linear-gradient(135deg, #0f0c29, #302b63)',
                                            'apple': 'linear-gradient(135deg, #000000, #333333)',
                                            'amazon': 'linear-gradient(135deg, #0f1c29, #004d40)',
                                            'hulu': 'linear-gradient(135deg, #0b1a0e, #1ce783)',
                                            'paramount': 'linear-gradient(135deg, #003366, #0066cc)',
                                            'sky_showtime': 'linear-gradient(135deg, #1a1a2e, #e94560)',
                                            'syfy': 'linear-gradient(135deg, #1a0b2e, #6a1b9a)',
                                            'educational_and_reality': 'linear-gradient(135deg, #3e2723, #ff6f00)',
                                            'ukrainian_feed': 'linear-gradient(135deg, #0057b7, #ffd700)',
                                            'polish_feed': 'linear-gradient(135deg, #ffffff, #c41e3a)'
                                        };
                                        
                                        // Используем метод Lampa.Background.change()
                                        if (Lampa.Background && Lampa.Background.change) {
                                            if (serviceBGs[s.id]) {
                                                 $('.background').css('background', serviceBGs[s.id]);
                                                 $('.background__img').css('opacity', 0);
                                            } else {
                                                 $('.background').css('background', '');
                                                 $('.background__img').css('opacity', 1);
                                            }
                                        }
                                    },
                                    onCreate: function () {
                                        var item = $(this.html);
                                        item.addClass('card--studio');
                                        if (isUkrainianFeed) {
                                            item.find('.card__view').empty().html(
                                                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:0.4em;text-align:center;font-weight:700;font-size:1.05em;line-height:1.2;">' +
                                                '<span style="color:#0057b7;">' + tr('ukrainian_feed_name') + '</span>' +
                                                '</div>'
                                            );
                                        } else if (isPolishFeed) {
                                            item.find('.card__view').empty().html(
                                                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:0.4em;text-align:center;font-weight:700;font-size:1.05em;line-height:1.2;">' +
                                                '<span style="color:#c41e3a;">' + tr('polish_feed_name') + '</span>' +
                                                '</div>'
                                            );
                                        } else if (isRussianFeed) {
                                            item.find('.card__view').empty().html(
                                                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:0.4em;text-align:center;font-weight:700;font-size:1.05em;line-height:1.2;">' +
                                                '<span style="color:#d52b1e;">' + tr('russian_feed_name') + '</span>' +
                                                '</div>'
                                            );
                                        } else {
                                            var view = item.find('.card__view');
                                            view.empty();

                                            var wrapper = $('<div class="studio-logo-wrap"></div>');
                                            
                                            // Используем SVG, если есть, иначе fallback текст
                                            if (s.svg) {
                                                var svgEl = $(s.svg);
                                                svgEl.addClass('studio-logo-img');
                                                svgEl.css({
                                                    'max-width': '70%',
                                                    'max-height': '60%',
                                                    'display': 'block'
                                                });
                                                wrapper.append(svgEl);
                                            } else {
                                                var fallback = $('<div class="studio-logo-fallback" style="display:block;"></div>').text(s.name);
                                                wrapper.append(fallback);
                                            }

                                            view.append(wrapper);

                                            // checkNewContent(s, item);
                                        }
                                        item.find('.card__age, .card__year, .card__type, .card__textbox, .card__title').remove();
                                        item.attr('data-click-processed', '1');
                                    },
                                    onlyEnter: function () {
                                        if (isUkrainianFeed) {
                                            Lampa.Activity.push({
                                                url: '',
                                                title: tr('ukrainian_feed_name'),
                                                component: 'ukrainian_feed',
                                                page: 1
                                            });
                                            return;
                                        }
                                        if (isPolishFeed) {
                                            Lampa.Activity.push({
                                                url: '',
                                                title: tr('polish_feed_name'),
                                                component: 'polish_feed',
                                                page: 1
                                            });
                                            return;
                                        }
                                        if (isRussianFeed) {
                                            Lampa.Activity.push({
                                                url: '',
                                                title: tr('russian_feed_name'),
                                                component: 'russian_feed',
                                                page: 1
                                            });
                                            return;
                                        }
                                        Lampa.Activity.push({
                                            url: '',
                                            title: s.name,
                                            component: 'studios_main',
                                            service_id: s.id,
                                            page: 1
                                        });
                                    }
                                }
                            }
                        };
                    });

                    callback({
                        results: items,
                        title: tr('streamings_row_title_full'),
                        params: {
                            items: {
                                view: 15,
                                mapping: 'line'
                            }
                        }
                    });
                };
            }
        });
    }

    // ========== ROW: НОВИНКИ РОСІЙСЬКОЇ СТРІЧКИ ==========
    function addRussianContentRow() {
        Lampa.ContentRows.add({
            index: 3, // Hero(0), Studios(1), Mood(2), then Russian(3)
            name: 'russian_content_row',
            title: tr('russian_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    var results = [];
                    var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
                    var d = new Date();
                    var currentDate = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    var urlMovie = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate + '&with_original_language=ru&vote_count.gte=5');
                    var urlTV = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate + '&with_original_language=ru&vote_count.gte=5');

                    network.silent(urlMovie, function (json1) {
                        if (json1.results) results = results.concat(json1.results);
                        network.silent(urlTV, function (json2) {
                            if (json2.results) results = results.concat(json2.results);
                            results.sort(function (a, b) {
                                var dateA = new Date(a.release_date || a.first_air_date || '2000-01-01');
                                var dateB = new Date(b.release_date || b.first_air_date || '2000-01-01');
                                return dateB - dateA;
                            });
                            var unique = [];
                            var seen = {};
                            results.forEach(function (item) {
                                if (!seen[item.id]) { seen[item.id] = true; unique.push(item); }
                            });
                            callback({
                                results: unique.slice(0, 20),
                                title: tr('russian_row_title_full'),
                                params: {
                                    items: { mapping: 'line', view: 15 }
                                }
                            });
                        });
                    });
                };
            }
        });
    }

    // ========== ROW: НОВИНКИ УКРАЇНСЬКОЇ СТРІЧКИ ==========
    function addUkrainianContentRow() {
        Lampa.ContentRows.add({
            index: 4, // после Russian(3)
            name: 'ukrainian_content_row',
            title: tr('ukrainian_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    var results = [];
                    var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
                    var d = new Date();
                    var currentDate = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    var urlMovie = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate + '&with_origin_country=UA&vote_count.gte=1');
                    var urlTV = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate + '&with_origin_country=UA&vote_count.gte=1');

                    network.silent(urlMovie, function (json1) {
                        if (json1.results) results = results.concat(json1.results);
                        network.silent(urlTV, function (json2) {
                            if (json2.results) results = results.concat(json2.results);
                            results.sort(function (a, b) {
                                var dateA = new Date(a.release_date || a.first_air_date || '2000-01-01');
                                var dateB = new Date(b.release_date || b.first_air_date || '2000-01-01');
                                return dateB - dateA;
                            });
                            var unique = [];
                            var seen = {};
                            results.forEach(function (item) {
                                if (!seen[item.id]) { seen[item.id] = true; unique.push(item); }
                            });
                            callback({
                                results: unique.slice(0, 20),
                                title: tr('ukrainian_row_title_full'),
                                params: {
                                    items: { mapping: 'line', view: 15 }
                                }
                            });
                        });
                    });
                };
            }
        });
    }

    // ========== ROW: НОВИНКИ АНГЛОМОВНОЇ СТРІЧКИ ==========
    function addEnglishContentRow() {
        Lampa.ContentRows.add({
            index: 5, // после Ukrainian(4)
            name: 'english_content_row',
            title: tr('english_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    var results = [];
                    var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
                    var d = new Date();
                    var currentDate = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    var urlMovie = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate + '&with_original_language=en&vote_count.gte=20');
                    var urlTV = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate + '&with_original_language=en&vote_count.gte=20');

                    network.silent(urlMovie, function (json1) {
                        if (json1.results) results = results.concat(json1.results);
                        network.silent(urlTV, function (json2) {
                            if (json2.results) results = results.concat(json2.results);
                            results.sort(function (a, b) {
                                var dateA = new Date(a.release_date || a.first_air_date || '2000-01-01');
                                var dateB = new Date(b.release_date || b.first_air_date || '2000-01-01');
                                return dateB - dateA;
                            });
                            var unique = [];
                            var seen = {};
                            results.forEach(function (item) {
                                if (!seen[item.id]) { seen[item.id] = true; unique.push(item); }
                            });
                            callback({
                                results: unique.slice(0, 20),
                                title: tr('english_row_title_full'),
                                params: {
                                    items: { mapping: 'line', view: 15 }
                                }
                            });
                        });
                    });
                };
            }
        });
    }

    // ========== ROW: НОВИНКИ ПОЛЬСЬКОЇ СТРІЧКИ ==========
    // (переиндексация для нового порядка RU-UA-EN-PL)
    // Жанри TMDB: Драма 18, Комедія 35, Мультфільм 16, Сімейний 10751, Документальний 99, Бойовик 28, Мелодрама 10749, Трилер 53, Кримінал 80, Пригоди 12, Жахи 27, Фентезі 14
    function addMoodRow() {
        var moods = [
            { key: 'mood_cry', genres: [18] },
            { key: 'mood_positive', genres: [35] },
            { key: 'mood_tasty', genres: [16, 10751, 99] },
            { key: 'mood_adrenaline', genres: [28] },
            { key: 'mood_butterflies', genres: [10749] },
            { key: 'mood_tension', genres: [53, 80] },
            { key: 'mood_adventure', genres: [12] },
            { key: 'mood_together', genres: [35, 27] },
            { key: 'mood_family', genres: [10751, 14] },
            { key: 'mood_your_choice', random: true }
        ];

            Lampa.ContentRows.add({
                index: 2, // Right after Streamings (1)
                name: 'custom_mood_row',
                title: tr('mood_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    var items = moods.map(function (m) {
                        var isRandom = m.random === true;
                        var moodTitle = tr(m.key);
                        return {
                            title: moodTitle,
                            params: {
                                createInstance: function () {
                                    var card = Lampa.Maker.make('Card', this, function (module) {
                                        return module.only('Card', 'Callback');
                                    });
                                    return card;
                                },
                                emit: {
                                    onCreate: function () {
                                        var item = $(this.html);
                                        item.addClass('card--mood');
                                        item.find('.card__view').empty().append(
                                            '<div class="mood-content"><div class="mood-text">' + moodTitle + '</div></div>'
                                        );
                                        item.find('.card__age, .card__year, .card__type, .card__textbox, .card__title').remove();
                                        item.attr('data-click-processed', '1');
                                    },
                                    onlyEnter: function () {
                                        if (isRandom) {
                                            var page = Math.floor(Math.random() * 5) + 1;
                                            var url = Lampa.TMDB.api('discover/movie?api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk') + '&sort_by=popularity.desc&vote_count.gte=100&page=' + page);
                                            network.silent(url, function (json) {
                                                var list = json.results || [];
                                                if (list.length === 0) return;
                                                var pick = list[Math.floor(Math.random() * list.length)];
                                                Lampa.Activity.push({
                                                    url: '',
                                                    component: 'full',
                                                    id: pick.id,
                                                    method: 'movie',
                                                    card: pick,
                                                    source: 'tmdb'
                                                });
                                            });
                                            return;
                                        }
                                        var genreStr = (m.genres || []).join(',');
                                        Lampa.Activity.push({
                                            url: 'discover/movie?with_genres=' + genreStr + '&sort_by=popularity.desc',
                                            title: moodTitle,
                                            component: 'category_full',
                                            page: 1,
                                            source: 'tmdb'
                                        });
                                    }
                                }
                            }
                        };
                    });

                    callback({
                        results: items,
                        title: tr('mood_row_title_full'),
                        params: {
                            items: {
                                view: 10,
                                mapping: 'line'
                            }
                        }
                    });
                };
            }
        });
    }

    function addStyles() {
        $('#custom_main_page_css').remove();
        $('body').append(`
            <style id="custom_main_page_css">
                /* Hero Banner (‑20%: 22em) */
                .card.hero-banner { 
                    width: 52vw !important; 
                    height: 25em !important;
                    margin: 0 1.5em 0.3em 0 !important; /* Reduced bottom margin */
                    display: inline-block; 
                    scroll-snap-align: start; /* Smart Snap */
                    scroll-margin-left: 1.5em !important; /* Force indentation for every card */
                }
                
                /* Container Snap (Fallback) */
                .scroll__content:has(.hero-banner) {
                    scroll-snap-type: x mandatory;
                    padding-left: 1.5em !important;
                }
                .scroll--mask .scroll__content {
                    padding: 1.2em 1em 1em;
                }
                
                /* Global Row Spacing Reduction */
                .row--card {
                     margin-bottom: -1.2em !important; /* Pull rows closer by ~40% */
                }
                
                .items-line {
                    padding-bottom: 2em !important;
                }

                /* Mood Buttons */
                .card--mood {
                    width: 12em !important;
                    height: 4em !important;
                    border-radius: 1em;
                    margin-bottom: 0 !important;
                    background: linear-gradient(145deg, #2a2a2a, #1f1f1f);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                    overflow: visible; 
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .card--mood.focus {
                    transform: scale(1.05);
                    box-shadow: 0 0 0 3px #fff;
                    background: #333;
                    z-index: 10;
                }
                .card--mood .card__view {
                    width: 100%;
                    height: 100%;
                    padding-bottom: 0 !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden; 
                    border-radius: 1em;
                }
                .mood-content {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                .mood-text {
                    color: #fff;
                    font-size: 1.1em;
                    font-weight: 500;
                    text-align: center;
                    width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    padding: 0 0.5em;
                }

                /* Studio Buttons */
                .card--studio {
                    width: 12em !important;
                    height: 6.75em !important; /* ~16:9 */
                    padding: 0 !important;
                    background: #f5f7fa;
                    border-radius: 0.8em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.35);
                    border: 1px solid rgba(255,255,255,0.06);
                    transition: transform 0.18s ease-out, box-shadow 0.18s ease-out;
                }
                .card--studio.focus {
                    transform: scale(1.06);
                    box-shadow: 0 0 18px rgba(255,255,255,0.9);
                    z-index: 10;
                }
                .card--studio .card__view {
                    width: 100%;
                    height: 100%;
                    padding: 0.6em !important;
                    box-sizing: border-box !important;
                    background-origin: content-box;
                    display: block;
                    position: relative;
                }
                .studio-logo-wrap {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .studio-logo-img {
                    max-width: 70%;
                    max-height: 60%;
                    object-fit: contain;
                    display: block;
                }
                .studio-logo-fallback {
                    display: none;
                    font-weight: 700;
                    font-size: 1.05em;
                    text-align: center;
                    color: #000;
                    padding: 0.4em;
                }
                .flixio-service-logo {
                    display: inline-block;
                    vertical-align: middle;
                    margin-right: 0.4em;
                    margin-bottom: 0.1em;
                }
                .flixio-service-logo img {
                    height: 1.4em;
                    width: auto;
                    display: block;
                }
                /* Consolidated Styles for StudioJS Widths */
                .studios_main .card--wide, .studios_view .card--wide { width: 18.3em !important; }
                .studios_view .category-full { padding-top: 1em; }
                /* Кнопка підписки на студію — у стилі міток (UA, 4K, HDR), ~50% розміру */
                .studio-subscription-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    vertical-align: middle;
                    margin-left: 0.4em;
                    padding: 0.18em 0.22em;
                    font-size: 0.4em;
                    font-weight: 800;
                    line-height: 1;
                    letter-spacing: 0.02em;
                    border-radius: 0.25em;
                    border: 1px solid rgba(255,255,255,0.2);
                    cursor: pointer;
                    transition: box-shadow 0.15s, transform 0.15s;
                }
                .company-start__name {
                    display: inline-flex;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .studio-subscription-btn.studio-subscription-btn--sub {
                    background: linear-gradient(135deg, #1565c0, #42a5f5);
                    color: #fff;
                    border-color: rgba(66,165,245,0.4);
                }
                .studio-subscription-btn.studio-subscription-btn--unsub {
                    background: linear-gradient(135deg, #37474f, #78909c);
                    color: #fff;
                    border-color: rgba(120,144,156,0.4);
                }
                .studio-subscription-btn.focus {
                    box-shadow: 0 0 0 2px #fff;
                    transform: scale(1.05);
                }

                /* Кнопка "На сторінку" */
                .flixio-more-btn {
                    width: 14em !important;
                    height: 21em !important;
                    border-radius: 0.8em;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.2s, background 0.2s;
                    /* Залізне правило - завжди вкінці! */
                    order: 9999 !important;
                }
                .flixio-more-btn:hover, .flixio-more-btn.focus {
                    background: rgba(255, 255, 255, 0.15);
                    transform: scale(1.05);
                    box-shadow: 0 0 0 3px #fff;
                }
                .flixio-more-btn > div {
                    text-align: center;
                }
                .flixio-more-logo {
                    margin-bottom: 0.5em;
                }
                .flixio-more-logo svg,
                .flixio-more-logo img {
                    width: 3.4em;
                    height: auto;
                }

                /* Скрываем значки качества из click_theme.js, если активен studios5.js */
                .click-quality,
                .click-quality-full,
                .full-start__status.click-quality-full {
                    display: none !important;
                }

            </style>
        `);
    }

    // =================================================================
    // FLIXIO QUALITY MARKS (Jacred)
    // =================================================================

    function initMarksJacRed() {
        var svgIcons = {
            '4K': '<span style="font-weight:800;font-size:0.85em;color:#ff9800;">4K</span>',
            'UKR': '<span style="font-weight:800;font-size:0.85em;color:#4fc3f7;">UA</span>',
            'HDR': '<span style="font-weight:800;font-size:0.85em;color:#ffeb3b;">HDR</span>'
        };

        var workingProxy = null;
        var proxies = [
            'https://myfinder.kozak-bohdan.workers.dev/?key=lmp_2026_JacRed_K9xP7aQ4mV2E&url=',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?url='
        ];

        var cardsObserver = null;

        function fetchWithProxy(url, callback) {
            // Спочатку пробуємо Lampa.Reguest (вбудований проксі Лампи)
            try {
                var network = new Lampa.Reguest();
                network.timeout(10000);
                network.silent(url, function (json) {
                    console.log('[JacRed] Direct success via Lampa.Reguest');
                    var text = typeof json === 'string' ? json : JSON.stringify(json);
                    workingProxy = 'direct';
                    callback(null, text);
                }, function () {
                    console.log('[JacRed] Direct Lampa.Reguest failed, trying proxies...');
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
                    console.error('[JacRed] All proxies failed for:', url);
                    callback(new Error('No proxy worked'));
                    return;
                }
                var p = proxyList[index];
                var target = p.indexOf('url=') > -1 ? p + encodeURIComponent(url) : p + url;
                console.log('[JacRed] Fetching via proxy:', target);

                var xhr = new XMLHttpRequest();
                xhr.open('GET', target, true);
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('[JacRed] Proxy success:', p);
                        workingProxy = p;
                        callback(null, xhr.responseText);
                    } else {
                        console.warn('[JacRed] Proxy failed:', xhr.status, p);
                        tryProxy(index + 1);
                    }
                };
                xhr.onerror = function () {
                    console.warn('[JacRed] Proxy error:', p);
                    tryProxy(index + 1);
                };
                xhr.timeout = 10000;
                xhr.ontimeout = function () {
                    console.warn('[JacRed] Proxy timeout:', p);
                    tryProxy(index + 1);
                };
                xhr.send();
            }
            tryProxy(0);
        }

        var _jacredCache = {};

        function getBestJacred(card, callback) {
            // новая версия кэша, чтобы пересчитать языковые метки по обновлённым правилам
            var cacheKey = 'jacred_v4_' + card.id;

            // In-memory cache (миттєвий)
            if (_jacredCache[cacheKey]) {
                console.log('[JacRed] mem-cache HIT:', cacheKey);
                callback(_jacredCache[cacheKey]);
                return;
            }

            // localStorage cache (переживає перезавантаження)
            try {
                var raw = Lampa.Storage.get(cacheKey, '');
                if (raw && typeof raw === 'object' && raw._ts && (Date.now() - raw._ts < 48 * 60 * 60 * 1000)) {
                    console.log('[JacRed] storage-cache HIT:', cacheKey, raw);
                    _jacredCache[cacheKey] = raw;
                    callback(raw);
                    return;
                }
            } catch (e) { }

            console.log('[JacRed] cache MISS for', cacheKey);

            var title = (card.original_title || card.title || card.name || '').toLowerCase();
            var year = (card.release_date || card.first_air_date || '').substr(0, 4);
            console.log('[JacRed] title:', title, 'year:', year, 'release_date:', card.release_date, 'first_air_date:', card.first_air_date);

            if (!title || !year) {
                console.warn('[JacRed] SKIP: no title or year');
                callback(null);
                return;
            }

            var releaseDate = new Date(card.release_date || card.first_air_date);
            console.log('[JacRed] releaseDate:', releaseDate, 'now:', new Date(), 'future?', releaseDate.getTime() > Date.now());
            if (releaseDate && releaseDate.getTime() > Date.now()) {
                console.warn('[JacRed] SKIP: future release');
                callback(null);
                return;
            }

            var apiUrl = 'https://jr.maxvol.pro/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;
            console.log('[JacRed] API URL:', apiUrl);

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
                        console.error('[JacRed] JSON Parse Error:', e);
                        console.log('[JacRed] Raw Data:', data);
                        callback(null);
                        return;
                    }

                    // Handle AllOrigins wrapper if present
                    if (parsed.contents) {
                        try {
                            parsed = JSON.parse(parsed.contents);
                        } catch (e) {
                            console.log('[JacRed] Failed to parse inner contents, using raw');
                        }
                    }

                    var results = Array.isArray(parsed) ? parsed : (parsed.Results || []);
                    console.log('[JacRed] Parsed results:', results.length);

                    if (!results.length) {
                        var emptyData = { empty: true, _ts: Date.now() };
                        _jacredCache[cacheKey] = emptyData;
                        try { Lampa.Storage.set(cacheKey, emptyData); } catch (e) { }
                        callback(null);
                        return;
                    }

                    var best = { resolution: 'SD', rus: false, ukr: false, eng: false, hdr: false };
                    var resOrder = ['SD', 'HD', 'FHD', '2K', '4K'];

                    results.forEach(function (item) {
                        var t = (item.title || '').toLowerCase();
                        var tracker = (item.tracker || '').toLowerCase();
                        var voices = Array.isArray(item.voices) ? item.voices : [];
                        var voicesStr = (voices.join(' ') || '').toLowerCase();
                        var videotype = (item.videotype || '').toLowerCase();

                        // 1) Пытаемся определить качество по числовому полю JacRed (quality)
                        var currentRes = 'SD';
                        var q = parseInt(item.quality || 0, 10);
                        if (q >= 2160) currentRes = '4K';
                        else if (q >= 1440) currentRes = '2K';
                        else if (q >= 1080) currentRes = 'FHD';
                        else if (q >= 720) currentRes = 'HD';

                        // 2) Если quality отсутствует или равно 0 — fallback по названию
                        if (currentRes === 'SD') {
                            if (t.indexOf('4k') >= 0 || t.indexOf('2160') >= 0 || t.indexOf('uhd') >= 0) currentRes = '4K';
                            else if (t.indexOf('2k') >= 0 || t.indexOf('1440') >= 0) currentRes = '2K';
                            else if (t.indexOf('1080') >= 0 || t.indexOf('fhd') >= 0 || t.indexOf('full hd') >= 0) currentRes = 'FHD';
                            else if (t.indexOf('720') >= 0 || t.indexOf('hd') >= 0) currentRes = 'HD';
                        }

                        if (resOrder.indexOf(currentRes) > resOrder.indexOf(best.resolution)) {
                            best.resolution = currentRes;
                        }

                        if (t.indexOf('ukr') >= 0 || t.indexOf('укр') >= 0 || t.indexOf('ua') >= 0 || t.indexOf('ukrainian') >= 0) {
                            best.ukr = true;
                        }

                        // RU audio markers — максимально широкий набор паттернов
                        if (
                            t.indexOf('rus') >= 0 ||
                            t.indexOf('russian') >= 0 ||
                            t.indexOf('рус') >= 0 ||
                            t.indexOf('рос') >= 0 ||
                            t.indexOf(' ru') >= 0 ||
                            t.indexOf('ru ') >= 0 ||
                            t.indexOf('[ru]') >= 0 ||
                            t.indexOf('(ru)') >= 0 ||
                            t.indexOf('/ru') >= 0 ||
                            t.indexOf('ru/') >= 0 ||
                            t.indexOf('ua/ru') >= 0 ||
                            t.indexOf('ukr/ru') >= 0 ||
                            t.indexOf('ru/ua') >= 0
                        ) {
                            best.rus = true;
                        }

                        // JacRed дополнительно отдаёт массив voices и tracker.
                        // Для русских трекеров считаем любую озвучку в voices как RU.
                        if (!best.rus) {
                            var ruTrackers = ['kinozal', 'rutracker', 'rutor', 'nnmclub', 'megapeer', 'selezen'];
                            if (ruTrackers.indexOf(tracker) >= 0 && voices.length) {
                                best.rus = true;
                            }
                        }

                        if (t.indexOf('eng') >= 0 || t.indexOf('english') >= 0 || t.indexOf('multi') >= 0) {
                            best.eng = true;
                        }

                        // HDR / Dolby Vision: сначала по videotype, затем по названию
                        if (videotype.indexOf('dolby') >= 0 || videotype.indexOf('dv') >= 0 || t.indexOf('dolby vision') >= 0 || t.indexOf('dolbyvision') >= 0) {
                            best.hdr = true;
                            best.dolbyVision = true;
                        } else if (videotype.indexOf('hdr') >= 0 || t.indexOf('hdr') >= 0) {
                            best.hdr = true;
                        }
                    });

                    if (card.original_language === 'uk') best.ukr = true;
                    if (card.original_language === 'ru') best.rus = true;
                    if (card.original_language === 'en') best.eng = true;

                    best._ts = Date.now();
                    _jacredCache[cacheKey] = best;
                    try { Lampa.Storage.set(cacheKey, best); } catch (e) { }
                    console.log('[JacRed] RESULT for', card.id, ':', JSON.stringify(best));
                    callback(best);

                } catch (e) {
                    callback(null);
                }
            });
        }

        function createBadge(cssClass, label) {
            var badge = document.createElement('div');
            badge.classList.add('card__mark');
            badge.classList.add('card__mark--' + cssClass);
            badge.textContent = label;
            return badge;
        }

        // Вставити мітки в повну картку (спільна логіка для події та вже відкритої сторінки)
        function injectFullCardMarks(movie, renderEl) {
            // Информация о сезонах теперь добавляется через fillInfo
            return;
        }

        // ====== Функции для работы с качеством ======
        var studios_quality_cache_key = 'studios_quality_cache';
        var studios_quality_cache_ttl = 12 * 60 * 60 * 1000; // 12 часов
        
        function studiosGetQualityCache(cacheKey) {
            var cache = Lampa.Storage.get(studios_quality_cache_key) || {};
            var item = cache[cacheKey];
            if (!item) return null;
            if (!item.timestamp || (Date.now() - item.timestamp) > studios_quality_cache_ttl) return null;
            return item;
        }
        
        function studiosSaveQualityCache(cacheKey, data) {
            var cache = Lampa.Storage.get(studios_quality_cache_key) || {};
            cache[cacheKey] = {
                label: data.label,
                code: data.code,
                timestamp: Date.now()
            };
            Lampa.Storage.set(studios_quality_cache_key, cache);
        }
        
        function studiosExtractNumericQualityFromTitle(title) {
            if (!title) return 0;
            var lower = String(title).toLowerCase();
            if (/2160p|4k/.test(lower)) return 2160;
            if (/1440p|qhd|2k/.test(lower)) return 1440;
            if (/1080p/.test(lower)) return 1080;
            if (/720p/.test(lower)) return 720;
            if (/480p/.test(lower)) return 480;
            if (/tc|telecine/.test(lower)) return 3;
            if (/ts|telesync/.test(lower)) return 2;
            if (/camrip|камрип/.test(lower)) return 1;
            return 0;
        }
        
        function studiosNormalizeCardForQuality(data) {
            var type = 'movie';
            if (data && (data.name || data.first_air_date || data.media_type === 'tv' || data.type === 'tv')) {
                type = 'tv';
            }
            var release_date = '';
            if (data) {
                if (typeof data.release_date === 'string' && data.release_date.length >= 4) {
                    release_date = data.release_date;
                } else if (typeof data.first_air_date === 'string' && data.first_air_date.length >= 4) {
                    release_date = data.first_air_date;
                } else if (data.year) {
                    var yearMatch = String(data.year).match(/(19|20)\d{2}/);
                    if (yearMatch) release_date = yearMatch[0] + '-01-01';
                } else if (data.date) {
                    var dateMatch = String(data.date).match(/(19|20)\d{2}/);
                    if (dateMatch) release_date = dateMatch[0] + '-01-01';
                }
            }
            return {
                id: data && (data.id || data.tmdb_id || (data.tmdb && data.tmdb.id)) || '',
                title: data && (data.title || data.name || '') || '',
                original_title: data && (data.original_title || data.original_name || '') || '',
                type: type,
                release_date: release_date
            };
        }
        
        function studiosEstimateFallbackQuality(normalized, originalData) {
            var year = 0;
            if (normalized && normalized.release_date && normalized.release_date.length >= 4) {
                year = parseInt(normalized.release_date.substring(0, 4), 10);
            } else if (originalData && originalData.year) {
                var yearMatch = String(originalData.year).match(/(19|20)\d{2}/);
                if (yearMatch) year = parseInt(yearMatch[0], 10);
            }
            if (!year || isNaN(year)) return null;
            var code = 0;
            var label = '';
            if (year >= 2023) {
                code = 2160;
                label = '4K';
            } else if (year >= 2020) {
                code = 1080;
                label = '1080p';
            } else if (year >= 2015) {
                code = 720;
                label = '720p';
            } else {
                code = 480;
                label = 'SD';
            }
            return { code: code, label: label };
        }
        
        function studiosResolveRealQuality(cardData, callback) {
            try {
                console.log('[Studios5] Starting quality detection for:', cardData.title || cardData.name);
                
                // Проверяем, включен ли парсер
                var parserEnabled = Lampa.Storage.get('parser_use', false);
                console.log('[Studios5] Parser enabled:', parserEnabled);
                
                if (!parserEnabled) {
                    console.log('[Studios5] Parser disabled, using year fallback');
                    // Если парсер выключен, используем fallback по году
                    var normalized = studiosNormalizeCardForQuality(cardData);
                    var estimated = studiosEstimateFallbackQuality(normalized, cardData);
                    callback(estimated || null);
                    return;
                }
                
                if (!Lampa.Parser || typeof Lampa.Parser.get !== 'function') {
                    console.log('[Studios5] Lampa.Parser not available, using year fallback');
                    var normalized = studiosNormalizeCardForQuality(cardData);
                    var estimated = studiosEstimateFallbackQuality(normalized, cardData);
                    callback(estimated || null);
                    return;
                }
                
                var title = cardData.title || cardData.name || 'Неизвестно';
                var year = ((cardData.first_air_date || cardData.release_date || '0000') + '').slice(0, 4);
                var searchQuery = {
                    df: cardData.original_title,
                    df_year: cardData.original_title + ' ' + year,
                    df_lg: cardData.original_title + ' ' + cardData.title,
                    df_lg_year: cardData.original_title + ' ' + cardData.title + ' ' + year,
                    lg: cardData.title,
                    lg_year: cardData.title + ' ' + year,
                    lg_df: cardData.title + ' ' + cardData.original_title,
                    lg_df_year: cardData.title + ' ' + cardData.original_title + ' ' + year
                }[Lampa.Storage.get('parse_lang', 'ru')] || cardData.title;
                
                console.log('[Studios5] Searching with query:', searchQuery);
                
                Lampa.Parser.get({
                    search: searchQuery,
                    movie: cardData,
                    page: 1
                }, function(data) {
                    console.log('[Studios5] Parser response:', data);
                    
                    if (!data || !data.Results || data.Results.length === 0) {
                        console.log('[Studios5] No results from parser, using year fallback');
                        var normalized = studiosNormalizeCardForQuality(cardData);
                        var estimated = studiosEstimateFallbackQuality(normalized, cardData);
                        callback(estimated || null);
                        return;
                    }
                    
                    var resolutions = new Set();
                    var hdr = new Set();
                    var audio = new Set();
                    var hasDub = false;
                    
                    console.log('[Studios5] Processing', data.Results.length, 'results');
                    
                    data.Results.forEach(function(result) {
                        if (result.ffprobe && Array.isArray(result.ffprobe)) {
                            var videoInfo = function(ffprobeData) {
                                if (!ffprobeData || !Array.isArray(ffprobeData)) return null;
                                
                                var info = {
                                    resolution: null,
                                    hdr: false,
                                    dolbyVision: false,
                                    audio: null
                                };
                                
                                var videoTrack = ffprobeData.find(function(track) {
                                    return track.codec_type === 'video';
                                });
                                
                                if (videoTrack) {
                                    if (videoTrack.width && videoTrack.height) {
                                        info.resolution = videoTrack.width + 'x' + videoTrack.height;
                                        
                                        if (videoTrack.height >= 2160 || videoTrack.width >= 3840) {
                                            info.resolutionLabel = '4K';
                                        } else if (videoTrack.height >= 1440 || videoTrack.width >= 2560) {
                                            info.resolutionLabel = '2K';
                                        } else if (videoTrack.height >= 1080 || videoTrack.width >= 1920) {
                                            info.resolutionLabel = 'FULL HD';
                                        } else if (videoTrack.height >= 720 || videoTrack.width >= 1280) {
                                            info.resolutionLabel = 'HD';
                                        }
                                    }
                                    
                                    if (videoTrack.side_data_list) {
                                        var hasMastering = videoTrack.side_data_list.some(function(item) {
                                            return item.side_data_type === 'Mastering display metadata';
                                        });
                                        var hasContentLight = videoTrack.side_data_list.some(function(item) {
                                            return item.side_data_type === 'Content light level metadata';
                                        });
                                        
                                        if (videoTrack.side_data_list.some(function(item) {
                                            return item.side_data_type === 'DOVI configuration record' || item.side_data_type === 'Dolby Vision RPU';
                                        })) {
                                            info.dolbyVision = true;
                                            info.hdr = true;
                                        } else if (hasMastering || hasContentLight) {
                                            info.hdr = true;
                                        }
                                    }
                                    
                                    if (!info.hdr && videoTrack.color_transfer && ['smpte2084', 'arib-std-b67'].includes(videoTrack.color_transfer.toLowerCase())) {
                                        info.hdr = true;
                                    }
                                    
                                    if (!info.dolbyVision && videoTrack.codec_name && (videoTrack.codec_name.toLowerCase().includes('dovi') || videoTrack.codec_name.toLowerCase().includes('dolby'))) {
                                        info.dolbyVision = true;
                                        info.hdr = true;
                                    }
                                }
                                
                                var audioTracks = ffprobeData.filter(function(track) {
                                    return track.codec_type === 'audio';
                                });
                                
                                var maxChannels = 0;
                                audioTracks.forEach(function(track) {
                                    if (track.channels && track.channels > maxChannels) {
                                        maxChannels = track.channels;
                                    }
                                });
                                
                                if (maxChannels >= 8) {
                                    info.audio = '7.1';
                                } else if (maxChannels >= 6) {
                                    info.audio = '5.1';
                                } else if (maxChannels >= 4) {
                                    info.audio = '4.0';
                                } else if (maxChannels >= 2) {
                                    info.audio = '2.0';
                                }
                                
                                return info;
                            }(result.ffprobe);
                            
                            if (videoInfo) {
                                if (videoInfo.resolutionLabel) {
                                    resolutions.add(videoInfo.resolutionLabel);
                                }
                                if (videoInfo.audio) {
                                    audio.add(videoInfo.audio);
                                }
                            }
                            
                            if (!hasDub) {
                                result.ffprobe.filter(function(track) {
                                    return track.codec_type === 'audio' && track.tags;
                                }).forEach(function(track) {
                                    var language = (track.tags.language || '').toLowerCase();
                                    var trackTitle = (track.tags.title || track.tags.handler_name || '').toLowerCase();
                                    
                                    if (language === 'rus' || language === 'ru' || language === 'russian') {
                                        if (trackTitle.includes('dub') || trackTitle.includes('дубляж') || trackTitle.includes('дублир') || trackTitle === 'd') {
                                            hasDub = true;
                                        }
                                    }
                                });
                            }
                        }
                        
                        var titleLower = result.Title.toLowerCase();
                        if (titleLower.includes('dolby vision') || titleLower.includes('dovi') || titleLower.match(/\bdv\b/)) {
                            hdr.add('Dolby Vision');
                        }
                        if (titleLower.includes('hdr10+')) {
                            hdr.add('HDR10+');
                        }
                        if (titleLower.includes('hdr10')) {
                            hdr.add('HDR10');
                        }
                        if (titleLower.includes('hdr')) {
                            hdr.add('HDR');
                        }
                    });
                    
                    console.log('[Studios5] Resolutions found:', Array.from(resolutions));
                    console.log('[Studios5] Audio found:', Array.from(audio));
                    
                    var result = {
                        title: title,
                        torrents_found: data.Results.length,
                        quality: null,
                        dv: false,
                        hdr: false,
                        hdr_type: null,
                        sound: null,
                        dub: hasDub
                    };
                    
                    if (resolutions.size > 0) {
                        var qualityPriority = ['8K', '4K', '2K', 'FULL HD', 'HD'];
                        for (var i = 0; i < qualityPriority.length; i++) {
                            if (resolutions.has(qualityPriority[i])) {
                                result.quality = qualityPriority[i];
                                break;
                            }
                        }
                    }
                    
                    console.log('[Studios5] Final quality result:', result.quality);
                    
                    if (result.quality) {
                        callback({ code: result.quality, label: result.quality, fromParser: true });
                    } else {
                        console.log('[Studios5] No quality from parser, using year fallback');
                        // Fallback к оценке по году
                        var normalized = studiosNormalizeCardForQuality(cardData);
                        var estimated = studiosEstimateFallbackQuality(normalized, cardData);
                        callback(estimated || null);
                    }
                });
                
            } catch (e) {
                console.error('[Studios5] studiosResolveRealQuality error:', e);
                var normalized = studiosNormalizeCardForQuality(cardData);
                var estimated = studiosEstimateFallbackQuality(normalized, cardData);
                callback(estimated || null);
            }
        }

        // ====== Функция для получения данных о сезонах из API ======
        function fetchSeasonData(tmdbId, callback) {
            if (!tmdbId || typeof tmdbId !== 'number') {
                return callback(null);
            }

            var url = Lampa.TMDB.api('tv/' + tmdbId + '?api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk'));
            var network = new Lampa.Reguest();
            
            network.silent(url, function(data) {
                if (data && data.seasons) {
                    callback(data);
                } else {
                    callback(null);
                }
            }, function(error) {
                callback(null);
            });
        }

        // ====== Принудительное применение стилей к бейджам качества ======
        function forceQualityBadgeStyles() {
            $('.card__badge--quality').each(function() {
                // Пропускаем hero-баннеры (Новинки проката)
                if ($(this).closest('.card').hasClass('hero-banner')) {
                    return;
                }
                $(this).css({
                    'border-radius': '0 0.8em 0 0.8em !important',
                    'bottom': '0 !important',
                    'left': '0 !important',
                    'background': 'rgba(51, 153, 153, 0.9) !important',
                    'color': '#fff !important',
                    'font-weight': 'bold !important',
                    'text-transform': 'uppercase !important'
                });
            });
        }

        // Применяем стили сразу и с задержкой
        setTimeout(forceQualityBadgeStyles, 100);
        setTimeout(forceQualityBadgeStyles, 500);
        setTimeout(forceQualityBadgeStyles, 1000);

        // ====== Добавление бейджей как на скриншоте ======
        
        // Безопасная функция для проверки настроек
        function isBadgeEnabled(badgeName) {
            try {
                if (typeof Lampa !== 'undefined' && Lampa.Storage && typeof Lampa.Storage.get === 'function') {
                    return Lampa.Storage.get(badgeName, true);
                }
                return true; // По умолчанию включено
            } catch (e) {
                console.log('[Studios5] Error checking badge setting:', badgeName, e);
                return true; // При ошибке включаем
            }
        }
        
        function addBadges(cardEl, movie) {
            if (!movie || !movie.id) return;

            var view = $(cardEl).find('.card__view');
            if (!view.length) view = $(cardEl);

            // Проверяем, не является ли это hero-баннером (Новинки проката)
            if ($(cardEl).hasClass('hero-banner')) {
                console.log('[Studios5] Skipping badges for hero banner (Новинки проката)');
                return;
            }

            // Удаляем старые бейджи
            view.find('.card__badge--custom').remove();

            // S1 (Season) - левый верхний угол (только один бейдж в углу)
            var isTvSeries = movie.name || movie.original_name || (movie.first_air_date && !movie.release_date) || 
                            (movie.type === 'tv' || movie.media_type === 'tv') ||
                            (movie.number_of_seasons && movie.number_of_seasons > 0) ||
                            (movie.seasons && Array.isArray(movie.seasons) && movie.seasons.length > 0) ||
                            (movie.last_episode_to_air);
            
            if (isTvSeries && isBadgeEnabled('flixio_badge_seasons')) {
                var seasonNumber = 1; // По умолчанию S1
                
                // Функция для обновления бейджа сезона с информацией о сериях
                function updateSeasonBadge(seasonNum, currentEpisode, totalEpisodes) {
                    var badgeText;
                    var isComplete = totalEpisodes > 0 && currentEpisode >= totalEpisodes;
                    
                    if (isComplete) {
                        badgeText = "S" + seasonNum;
                    } else if (totalEpisodes > 0) {
                        badgeText = "S" + seasonNum + " " + currentEpisode + "/" + totalEpisodes;
                    } else {
                        badgeText = "S" + seasonNum;
                    }
                    
                    var seasonBadge = $('<div>', {
                        class: 'card__badge card__badge--custom card__badge--season',
                        text: badgeText
                    });
                    
                    view.append(seasonBadge);
                }
                
                // Правильное определение текущего сезона
                var lastEpisode = movie.last_episode_to_air;
                var seasons = movie.seasons;
                
                if (lastEpisode && lastEpisode.season_number && seasons && Array.isArray(seasons)) {
                    // Ищем сезон, соответствующий последнему выпущенному эпизоду
                    for (var i = 0; i < seasons.length; i++) {
                        if (seasons[i].season_number === lastEpisode.season_number) {
                            seasonNumber = lastEpisode.season_number;
                            var currentEpisode = lastEpisode.episode_number || 1;
                            var totalEpisodes = seasons[i].episode_count || 0;
                            updateSeasonBadge(seasonNumber, currentEpisode, totalEpisodes);
                            break;
                        }
                    }
                } else if (movie.season_number) {
                    seasonNumber = movie.season_number;
                    var currentEpisode = movie.episode_number || 1;
                    var totalEpisodes = movie.episode_count || 0;
                    updateSeasonBadge(seasonNumber, currentEpisode, totalEpisodes);
                } else if (movie.number_of_seasons && movie.number_of_seasons > 0) {
                    seasonNumber = movie.number_of_seasons;
                    updateSeasonBadge(seasonNumber, 1, 0);
                } else {
                    // Если данных нет в карточке, пытаемся получить из API
                    var seriesId = movie.id || movie.tmdb_id;
                    if (seriesId && typeof seriesId === 'number') {
                        fetchSeasonData(seriesId, function(data) {
                            if (data && data.last_episode_to_air && data.seasons) {
                                var lastEp = data.last_episode_to_air;
                                var seasonData = data.seasons;
                                
                                for (var j = 0; j < seasonData.length; j++) {
                                    if (seasonData[j].season_number === lastEp.season_number) {
                                        seasonNumber = lastEp.season_number;
                                        var currentEpisode = lastEp.episode_number || 1;
                                        var totalEpisodes = seasonData[j].episode_count || 0;
                                        updateSeasonBadge(seasonNumber, currentEpisode, totalEpisodes);
                                        return;
                                    }
                                }
                            } else if (data && data.number_of_seasons) {
                                seasonNumber = data.number_of_seasons;
                                updateSeasonBadge(seasonNumber, 1, 0);
                            } else {
                                updateSeasonBadge(1, 1, 0);
                            }
                        });
                    } else {
                        updateSeasonBadge(1, 1, 0);
                    }
                }
            }

            // Год - правый верхний угол
            var year = '';
            if (movie.release_date && movie.release_date.length >= 4) {
                year = movie.release_date.substring(0, 4);
            } else if (movie.first_air_date && movie.first_air_date.length >= 4) {
                year = movie.first_air_date.substring(0, 4);
            } else if (movie.year) {
                var yearMatch = String(movie.year).match(/(19|20)\d{2}/);
                if (yearMatch) year = yearMatch[0];
            }

            if (year && isBadgeEnabled('flixio_badge_year')) {
                var yearBadge = $('<div>', {
                    class: 'card__badge card__badge--custom card__badge--year',
                    text: year
                });
                view.append(yearBadge);
            }

            // Качество - левый нижний угол (вместо флага Украины)
            // Всегда показываем качество по году как минимум
            var normalized = studiosNormalizeCardForQuality(movie);
            var estimated = studiosEstimateFallbackQuality(normalized, movie);
            
            if (estimated && estimated.label && isBadgeEnabled('flixio_badge_quality')) {
                var shortLabel = '';
                var lower = estimated.label.toLowerCase();
                
                if (lower.includes('4k')) {
                    shortLabel = '4K';
                } else if (lower.includes('1080p')) {
                    shortLabel = 'FHD';
                } else if (lower.includes('720p')) {
                    shortLabel = 'HD';
                } else if (lower.includes('480p')) {
                    shortLabel = 'SD';
                } else {
                    shortLabel = estimated.label;
                }
                
                if (shortLabel) {
                    var qualityBadge = $('<div>', {
                        class: 'card__badge card__badge--custom card__badge--quality',
                        text: shortLabel,
                        css: {
                            'bottom': '0 !important',
                            'left': '0 !important',
                            'background': 'rgba(51, 153, 153, 0.9) !important',
                            'color': '#fff !important',
                            'border-radius': '0 0.8em 0 0.8em !important',
                            'font-weight': 'bold !important',
                            'text-transform': 'uppercase !important'
                        }
                    });
                    view.append(qualityBadge);
                    console.log('[Studios5] Year-based quality badge added:', shortLabel);
                }
            }
            
            // Пытаемся получить более точное качество от парсера (если доступно)
            studiosResolveRealQuality(movie, function(result) {
                console.log('[Studios5] Parser quality result for movie:', movie.title || movie.name, result);
                
                if (!result || !result.label) {
                    console.log('[Studios5] No parser quality data, keeping year-based');
                    return;
                }
                
                if (!view || !view.isConnected) {
                    console.log('[Studios5] View element not connected');
                    return;
                }
                
                var shortLabel = '';
                var lower = result.label.toLowerCase();
                
                // Определяем короткую метку качества для форматов от парсера
                if (lower.includes('8k')) {
                    shortLabel = '8K';
                } else if (lower.includes('4k')) {
                    shortLabel = '4K';
                } else if (lower.includes('2k')) {
                    shortLabel = '2K';
                } else if (lower.includes('full hd') || lower.includes('1080p')) {
                    shortLabel = 'FHD';
                } else if (lower.includes('hd') || lower.includes('720p')) {
                    shortLabel = 'HD';
                } else if (lower.includes('480p')) {
                    shortLabel = 'SD';
                } else if (lower.includes('camrip') || lower.includes('камрип')) {
                    shortLabel = 'CAM';
                } else if (lower.includes('ts') || lower.includes('telesync')) {
                    shortLabel = 'TS';
                } else if (lower.includes('tc') || lower.includes('telecine')) {
                    shortLabel = 'TC';
                } else {
                    // Для других форматов оставляем как есть или сокращаем
                    if (lower.includes('2160p')) {
                        shortLabel = '4K';
                    } else if (lower.includes('1440p')) {
                        shortLabel = '2K';
                    } else {
                        shortLabel = result.label; // Полный фоллбэк
                    }
                }
                
                if (!shortLabel) {
                    console.log('[Studios5] No short label generated for:', result.label);
                    return;
                }
                
                // Заменяем существующий бейдж качества на более точный
                var existingBadge = view.find('.card__badge--quality');
                if (existingBadge.length > 0) {
                    existingBadge.text(shortLabel);
                    existingBadge.css({
                        'border-radius': '0 0.8em 0 0.8em !important'
                    });
                    console.log('[Studios5] Quality badge updated to:', shortLabel, 'from parser:', result.fromParser);
                } else {
                    var qualityBadge = $('<div>', {
                        class: 'card__badge card__badge--custom card__badge--quality',
                        text: shortLabel,
                        css: {
                            'bottom': '0 !important',
                            'left': '0 !important',
                            'background': 'rgba(51, 153, 153, 0.9) !important',
                            'color': '#fff !important',
                            'border-radius': '0 0.8em 0 0.8em !important',
                            'font-weight': 'bold !important',
                            'text-transform': 'uppercase !important'
                        }
                    });
                    view.append(qualityBadge);
                    console.log('[Studios5] Parser quality badge added:', shortLabel);
                }
            });

            // Рейтинг - правый нижний угол
            var ratingRaw = movie.vote_average || movie.rating || movie.rate || movie.imdb_rating || movie.kp_rating;
            if (ratingRaw && isBadgeEnabled('flixio_badge_rating')) {
                var ratingValue = parseFloat(String(ratingRaw).replace(',', '.'));
                if (!isNaN(ratingValue) && ratingValue > 0) {
                    var ratingBadge = $('<div>', {
                        class: 'card__badge card__badge--custom card__badge--rating',
                        text: ratingValue.toFixed(1)
                    });
                    view.append(ratingBadge);
                }
            }
        }

        // ——— Повна картка: подія 'full' + обробка вже відкритої (deep link ?card=...) ———
        function initFullCardMarks() {
            if (!Lampa.Listener || !Lampa.Listener.follow) return;
            Lampa.Listener.follow('full', function (e) {
                if (e.type !== 'complite') return;

                // Очистка артефактов click_theme.js (черные значки качества)
                var attempts = 0;
                var cleaner = setInterval(function() {
                     var badges = document.querySelectorAll('.click-quality, .click-quality-full, .full-start__status.click-quality-full');
                     for (var i = 0; i < badges.length; i++) badges[i].remove();
                     attempts++;
                     if (attempts > 25) clearInterval(cleaner); // 5 секунд
                }, 200);

                var movie = e.data && e.data.movie;
                var renderEl = e.object && e.object.activity && e.object.activity.render && e.object.activity.render();
                injectFullCardMarks(movie, renderEl);
            });
            // Якщо відкрили по силці ?card=..., повна картка вже є до нашого init — обробити її одразу
            setTimeout(function () {
                try {
                    var act = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
                    if (!act || act.component !== 'full') return;
                    var movie = act.card || act.movie;
                    var renderEl = act.activity && act.activity.render && act.activity.render();
                    injectFullCardMarks(movie, renderEl);

                    // Очистка артефактов click_theme.js (для прямой ссылки)
                    var attempts = 0;
                    var cleaner = setInterval(function() {
                         var badges = document.querySelectorAll('.click-quality, .click-quality-full, .full-start__status.click-quality-full');
                         for (var i = 0; i < badges.length; i++) badges[i].remove();
                         attempts++;
                         if (attempts > 25) clearInterval(cleaner);
                    }, 200);
                } catch (err) {
                    console.warn('[JacRed] full card catch-up:', err);
                }
            }, 300);
        }

        // Картки на головній: MutationObserver тільки для .card (повну картку обробляємо через подію full)
        function processCards() {
            if (localStorage.getItem('maxsm_ratings_quality_inlist') === 'false') return;
            $('.card:not(.jacred-mark-processed-v2)').each(function () {
                var card = $(this);
                card.addClass('jacred-mark-processed-v2');

                // Пропускаем hero-баннеры (Новинки проката)
                if (card.hasClass('hero-banner')) {
                    console.log('[Studios5] Skipping processing for hero banner (Новинки проката)');
                    return;
                }

                // Hero-банери зберігають movie в heroMovieData
                var movie = card[0].heroMovieData || card.data('item') || (card[0] && (card[0].card_data || card[0].item)) || null;
                if (movie && movie.id && !movie.size) {
                    // Скрываем старые бейджи и метки
                    card.find('.card-marks, .card__mark, .card__type, .card__vote, .card__quality').hide();
                    
                    // Добавляем новые бейджи
                    addBadges(card[0], movie);
                }
            });
        }

        function observeCardRows() {
            if (cardsObserver) cardsObserver.disconnect();
            cardsObserver = new MutationObserver(function () {
                processCards();
            });
            cardsObserver.observe(document.body, { childList: true, subtree: true });
            processCards();
        }

        function renderInfoRowBadges(container, data) {
            container.empty();

            if (data.resolution && data.resolution !== 'SD') {
                var resText = data.resolution;
                if (resText === 'FHD') resText = '1080p';
                else if (resText === 'HD') resText = '720p';

                var qualityTag = $('<div class="full-start__pg"></div>');
                qualityTag.text(resText);
                container.append(qualityTag);
            }

            // HDR / Dolby Vision
            if (data.hdr) {
                var hdrTag = $('<div class="full-start__pg"></div>');
                hdrTag.text(data.dolbyVision ? 'Dolby Vision' : 'HDR');
                container.append(hdrTag);
            }
        }

        function addMarksToContainer(element, movie, viewSelector) {
            var containerParent = viewSelector ? element.find(viewSelector) : element;
            var marksContainer = containerParent.find('.card-marks');

            if (!marksContainer.length) {
                marksContainer = $('<div class="card-marks"></div>');
                containerParent.append(marksContainer);
            }

            getBestJacred(movie, function (data) {
                if (!data) data = { empty: true };
                // Даже если JacRed ничего не вернул (empty),
                // всё равно отрисуем рейтинг, если он есть у карточки
                renderBadges(marksContainer, data, movie);
            });
        }

        function renderBadges(container, data, movie) {
            container.empty();
            if (data.rus && Lampa.Storage.get('flixio_badge_ru', true)) container.append(createBadge('ru', 'RU'));
            if (data.ukr && Lampa.Storage.get('flixio_badge_ua', true)) container.append(createBadge('ua', 'UA'));
            if (data.eng && Lampa.Storage.get('flixio_badge_en', true)) container.append(createBadge('en', 'EN'));
            if (data.resolution && data.resolution !== 'SD') {
                if (data.resolution === '4K' && Lampa.Storage.get('flixio_badge_4k', true)) container.append(createBadge('4k', '4K'));
                else if (data.resolution === 'FHD' && Lampa.Storage.get('flixio_badge_fhd', true)) container.append(createBadge('fhd', 'FHD'));
                else if (data.resolution === 'HD' && Lampa.Storage.get('flixio_badge_fhd', true)) container.append(createBadge('hd', 'HD'));
                else if (Lampa.Storage.get('flixio_badge_fhd', true)) container.append(createBadge('hd', data.resolution));
            }
            if (data.hdr && Lampa.Storage.get('flixio_badge_hdr', true)) container.append(createBadge('hdr', 'HDR'));
            // Рейтинг критиків
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

        var style = document.createElement('style');
        style.innerHTML = `
            /* ====== Вирівнюємо нативну TV мітку з нашими ====== */
            .card .card__type {
                left: -0.2em !important;
            }

            /* ====== Card marks — зліва, стовпчиком під TV ====== */
            .card-marks {
                position: absolute;
                top: 2.2em;
                left: -0.2em;
                display: flex;
                flex-direction: column;
                gap: 0.15em;
                z-index: 10;
                pointer-events: none;
            }
            /* Уніфікуємо відступ для всіх типів карток (Фільм/Серіал) */
            .card:not(.card--tv):not(.card--movie) .card-marks,
            .card--movie .card-marks {
                top: 2.2em;
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
                opacity: 0;
                animation: mark-fade-in 0.35s ease-out forwards;
                border: 1px solid rgba(255,255,255,0.15);
            }
            .card__mark--ru  { background: linear-gradient(135deg, #8e24aa, #ce93d8); color: #fff; border-color: rgba(206,147,216,0.4); }
            .card__mark--ua  { background: linear-gradient(135deg, #1565c0, #42a5f5); color: #fff; border-color: rgba(66,165,245,0.4); }
            .card__mark--4k  { background: linear-gradient(135deg, #e65100, #ff9800); color: #fff; border-color: rgba(255,152,0,0.4); }
            .card__mark--fhd { background: linear-gradient(135deg, #4a148c, #ab47bc); color: #fff; border-color: rgba(171,71,188,0.4); }
            .card__mark--hd  { background: linear-gradient(135deg, #1b5e20, #66bb6a); color: #fff; border-color: rgba(102,187,106,0.4); }
            .card__mark--en  { background: linear-gradient(135deg, #37474f, #78909c); color: #fff; border-color: rgba(120,144,156,0.4); }
            .card__mark--hdr { background: linear-gradient(135deg, #f57f17, #ffeb3b); color: #000; border-color: rgba(255,235,59,0.4); }
            .card__mark--rating { background: linear-gradient(135deg, #1a1a2e, #16213e); color: #ffd700; border-color: rgba(255,215,0,0.3); font-size: 0.75em; white-space: nowrap; }
            .card__mark--rating .mark-star { margin-right: 0.15em; font-size: 0.9em; }

            /* ====== Новые бейджи как на скриншоте ====== */
            .card__badge--custom {
                position: absolute;
                z-index: 15;
                padding: 0.2em 0.45em;
                font-size: 1.1em;
                font-weight: bold;
                line-height: 1;
                color: #fff;
                opacity: 0;
                animation: badge-fade-in 0.3s ease-out forwards;
                font-family: Roboto, Arial, sans-serif;
            }

            @keyframes badge-fade-in {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }

            /* S1 (Season) - левый верхний угол */
            .card__badge--season {
                top: 0 !important;
                left: 0 !important;
                background: rgba(0, 0, 0, 0.5) !important;
                color: #fff !important;
                border-radius: 0.8em 0 0.8em 0 !important;
                font-weight: bold !important;
            }

            /* Год - правый верхний угол */
            .card__badge--year {
                top: 0 !important;
                right: 0 !important;
                background: rgba(0, 0, 0, 0.6) !important;
                color: #fff !important;
                border-radius: 0 0.8em 0 0.8em !important;
                font-weight: bold !important;
            }

            /* Качество - левый нижний угол*/
            .card__badge--quality {
                bottom: 0 !important;
                left: 0 !important;
                background: rgba(51, 153, 153, 0.9) !important;
                color: #fff !important;
                border-radius: 0 0.8em 0 0.8em !important;
                font-weight: bold !important;
                text-transform: uppercase !important;
            }
            
            /* Дополнительные стили для гарантии */
            .card__badge.card__badge--custom.card__badge--quality {
                border-radius: 0 0.8em 0 0.8em !important;
            }

            /* Рейтинг - правый нижний угол */
            .card__badge--rating {
                bottom: 0 !important;
                right: 0 !important;
                background: rgba(93, 173, 226, 0.8) !important;
                color: #fff !important;
                border-radius: 0.8em 0 0.8em 0.0em !important;
                font-weight: bold !important;
            }

            /* ====== Картка "На сторінку стрімінгу" — використовуємо нативний card-more ====== */
            .service-more-card .card-more__box {
                height: 0;
                padding-bottom: 150%;
                position: relative;
            }
            .service-more-card .card-more__title {
                margin-top: 0;
                top: 50%;
                transform: translateY(-50%);
                font-size: 1.4em;
            }

            /* ====== NEW badge на стрімінгах ====== */
            .studio-new-badge {
                position: absolute;
                top: 1.0em;
                right: 0.4em;
                background: linear-gradient(135deg, #e53935, #ff5252);
                color: #fff;
                font-size: 0.65em;
                font-weight: 800;
                padding: 0.25em 0.5em;
                border-radius: 0.3em;
                letter-spacing: 0.05em;
                z-index: 5;
                animation: mark-fade-in 0.35s ease-out forwards;
                box-shadow: 0 2px 6px rgba(229,57,53,0.4);
            }

            /* ====== Overrides for Click Theme elements (move down) ====== */
            .click-content-type { top: 0.6em !important; }
            .click-rating { top: 0.6em !important; }
            .click-country { top: 2.0em !important; }

            /* Ховаємо нативну оцінку, коли є наші мітки */
            .card.jacred-mark-processed-v2 .card__vote { display: none !important; }

            /* ====== Hero banner marks ====== */
            .hero-banner .card-marks {
                top: 1.5em !important;
                left: 1.2em !important;
                gap: 0.3em !important;
            }
            .hero-banner .card__mark {
                font-size: 1em;
                padding: 0.4em 0.6em;
            }
            
            /* Скрываем все кастомные бейджи на hero-баннерах (Новинки проката) */
            .hero-banner .card__badge--custom {
                display: none !important;
            }
            
            /* ====== Full card (info row) marks ====== */
            .jacred-info-marks-v2 {
                display: flex;
                flex-direction: row;
                gap: 0.5em;
                margin-right: 1em;
                align-items: center;
            }

            @keyframes mark-fade-in { to { opacity: 1; } }
        `;
        document.head.appendChild(style);

        initFullCardMarks();
        window.FLIXIO_GET_BEST_JACRED = getBestJacred;
        window.FLIXIO_TOGGLE_JACRED_CARD_MARKS = function (enabled) {
            if (!enabled) {
                if (cardsObserver) cardsObserver.disconnect();
                return;
            }
            observeCardRows();
        };
        window.FLIXIO_TOGGLE_JACRED_CARD_MARKS(localStorage.getItem('maxsm_ratings_quality_inlist') !== 'false');
    }


    function addServiceRows() {
        var services = ['netflix', 'apple', 'hbo', 'amazon', 'disney', 'paramount', 'sky_showtime', 'hulu', 'syfy', 'educational_and_reality'];
        var serviceSettings = {
            netflix: 'flixio_row_today_netflix',
            apple: 'flixio_row_today_apple',
            hbo: 'flixio_row_today_hbo',
            amazon: 'flixio_row_today_prime',
            disney: 'flixio_row_today_disney',
            paramount: 'flixio_row_today_paramount',
            sky_showtime: 'flixio_row_today_sky',
            hulu: 'flixio_row_today_hulu'
        };

        services.forEach(function (id, index) {
            var config = SERVICE_CONFIGS[id];
            if (!config) return;

            var settingKey = serviceSettings[id];
            if (settingKey && !Lampa.Storage.get(settingKey, true)) return;

            Lampa.ContentRows.add({
                index: 7 + index,
                name: 'service_row_' + id,
                title: tr('today_on_prefix') + config.title,
                screen: ['main'],
                call: function (params) {
                    return function (callback) {
                        var network = new Lampa.Reguest();
                        var results = [];

                        var ROW_FILTER = {
                            'netflix': { with_networks: '213' },
                            'apple': { with_networks: '2552|3235' },
                            'hbo': { with_networks: '49|3186', with_companies: '174|49' },
                            'amazon': { with_networks: '1024', with_companies: '1785|21' },
                            'disney': { with_networks: '2739|19|88', with_companies: '2' },
                            'hulu': { with_networks: '453' },
                            'paramount': { with_networks: '4330|318', with_companies: '4' },
                            'sky_showtime': { with_companies: '4|33|67|521' },
                            'syfy': { with_networks: '77' },
                            'educational_and_reality': { with_networks: '64|43|91|4', with_genres: '99,10764' }
                        };

                        var filterParams = ROW_FILTER[id] || {};
                        if (Object.keys(filterParams).length === 0) return callback({ results: [] });

                        var minVotes = (id === 'syfy' || id === 'educational_and_reality') ? 1 : 3;
                        var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
                        var voteQ = '&vote_count.gte=' + minVotes;

                        // Вікно свіжості: від сьогодні і на 8 місяців назад
                        var d = new Date();
                        var currentDate = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        var past = new Date();
                        past.setMonth(past.getMonth() - 8);
                        var pastDate = [past.getFullYear(), ('0' + (past.getMonth() + 1)).slice(-2), ('0' + past.getDate()).slice(-2)].join('-');

                        var dateQMovie = '&primary_release_date.gte=' + pastDate + '&primary_release_date.lte=' + currentDate;
                        var dateQTV = '&first_air_date.gte=' + pastDate + '&first_air_date.lte=' + currentDate;

                        var networkQ = filterParams.with_networks ? '&with_networks=' + encodeURIComponent(filterParams.with_networks) : '';
                        var companyQ = filterParams.with_companies ? '&with_companies=' + encodeURIComponent(filterParams.with_companies) : '';
                        var genreQ = filterParams.with_genres ? '&with_genres=' + encodeURIComponent(filterParams.with_genres) : '';

                        var requests = [];

                        // Фільми: шукаємо свіжі, але сортуємо ЗА ПОПУЛЯРНІСТЮ!
                        if (companyQ || genreQ) {
                            var urlM = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=popularity.desc' + dateQMovie + voteQ + companyQ + genreQ);
                            requests.push(function (cb) {
                                network.silent(urlM, function (j) { cb(j.results || []); }, function () { cb([]); });
                            });
                        }

                        // Серіали: шукаємо свіжі, але сортуємо ЗА ПОПУЛЯРНІСТЮ!
                        if (networkQ || companyQ || genreQ) {
                            var urlT = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=popularity.desc' + dateQTV + voteQ + networkQ + companyQ + genreQ);
                            requests.push(function (cb) {
                                network.silent(urlT, function (j) { cb(j.results || []); }, function () { cb([]); });
                            });
                        }

                        if (requests.length === 0) return callback({ results: [] });

                        var pending = requests.length;
                        requests.forEach(function (req) {
                            req(function (items) {
                                results = results.concat(items);
                                pending--;
                                if (pending === 0) {
                                    var unique = [];
                                    var seen = {};
                                    results.forEach(function (item) {
                                        if (!seen[item.id]) { seen[item.id] = true; unique.push(item); }
                                    });

                                    // Фінальне сортування: залишаємо їх по популярності
                                    unique.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });

                                    callback({
                                        results: unique.slice(0, 20),
                                        title: tr('today_on_prefix') + config.title
                                    });
                                }
                            });
                        });
                    }
                }
            });
        });
    }

    // ========== ROW: НОВИНКИ ПОЛЬСЬКОЇ СТРІЧКИ (в кінці головної) ==========
    function addPolishContentRow() {
        Lampa.ContentRows.add({
            index: 6, // после English(5)
            name: 'polish_content_row',
            title: tr('polish_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    var results = [];
                    var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
                    var d = new Date();
                    var currentDate = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    var urlMovie = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate + '&with_origin_country=PL&vote_count.gte=1');
                    var urlTV = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate + '&with_origin_country=PL&vote_count.gte=1');

                    network.silent(urlMovie, function (json1) {
                        if (json1.results) results = results.concat(json1.results);
                        network.silent(urlTV, function (json2) {
                            if (json2.results) results = results.concat(json2.results);
                            results.sort(function (a, b) {
                                var dateA = new Date(a.release_date || a.first_air_date || '2000-01-01');
                                var dateB = new Date(b.release_date || b.first_air_date || '2000-01-01');
                                return dateB - dateA;
                            });
                            var unique = [];
                            var seen = {};
                            results.forEach(function (item) {
                                if (!seen[item.id]) { seen[item.id] = true; unique.push(item); }
                            });
                            callback({
                                results: unique.slice(0, 20),
                                title: tr('polish_row_title_full'),
                                params: {
                                    items: { mapping: 'line', view: 15 }
                                }
                            });
                        });
                    });
                };
            }
        });
    }

    function modifyServiceTitles() {
        var attempts = 0;
        var maxAttempts = 20;
        var timer = setInterval(function () {
            attempts++;
            var services = ['netflix', 'apple', 'hbo', 'amazon', 'disney', 'paramount', 'sky_showtime', 'hulu', 'syfy', 'educational_and_reality'];
            services.forEach(function (id) {
                var config = SERVICE_CONFIGS[id];
                if (!config) return;

                var titleText = tr('today_on_prefix') + config.title;

                var el = $('.items-line__title').filter(function () {
                    return $(this).text().trim() === titleText && $(this).find('svg').length === 0;
                });

                if (el.length) {
                    var iconHtml = '';
                    if (config.icon) {
                        iconHtml = '<div style="width: 1.2em; height: 1.2em; display: inline-block; vertical-align: middle; margin-right: 0.4em; margin-bottom: 0.1em; color: inherit;">' + config.icon + '</div>';
                    }
                    el.html(iconHtml + '<span style="vertical-align: middle;">' + tr('today_on_prefix') + config.title + '</span>');

                    var line = el.closest('.items-line');
                    if (line.length) {
                        var scrollBody = line.find('.scroll__body');
                        if (scrollBody.length && !scrollBody.data('flixio-more-observed')) {
                            scrollBody.data('flixio-more-observed', true);

                            var moreLabel = tr('go_to_page');
                            var iconHtml = config.icon ? '<div class="flixio-more-logo">' + config.icon + '</div>' : '';
                            var moreCard = $('<div class="card selector flixio-more-btn"><div>' + iconHtml + '<div>' + moreLabel + '</div><span style="color: #90caf9; font-size: 0.85em; display: block; margin-top: 0.4em;">' + config.title + '</span></div></div>');

                            moreCard.on('hover:enter', (function (serviceId) {
                                return function () {
                                    Lampa.Activity.push({
                                        url: '', title: SERVICE_CONFIGS[serviceId].title, component: 'studios_main', service_id: serviceId, page: 1
                                    });
                                };
                            })(id));
                            scrollBody.append(moreCard);
                        }
                    }
                }
            });

            // Те саме для Української, Польської та Російської стрічок
            $('.items-line').each(function () {
                var line = $(this);
                var titleText = line.find('.items-line__title').text().trim();
                var scrollBody = line.find('.scroll__body');
                if (!scrollBody.length) return;

                var isUA = titleText.indexOf('української стрічки') !== -1;
                var isPL = titleText.indexOf('польської стрічки') !== -1;
                var isRU = titleText.indexOf('російської стрічки') !== -1;
                if (!isUA && !isPL && !isRU) return;

                var dataKey = isUA ? 'flixio-more-ua' : (isPL ? 'flixio-more-pl' : 'flixio-more-ru');
                if (scrollBody.data(dataKey)) return;
                scrollBody.data(dataKey, true);

                var label = isUA ? tr('ukrainian_feed_name') : (isPL ? tr('polish_feed_name') : tr('russian_feed_name'));
                var comp = isUA ? 'ukrainian_feed' : (isPL ? 'polish_feed' : 'russian_feed');
                var color = isUA ? '#ffd700' : (isPL ? '#c41e3a' : '#d52b1e');

                // Додаємо order: 9999;
                var moreCard = $('<div class="card selector flixio-more-btn"><div><br>' + tr('go_to_page') + '<br><span style="color: ' + color + '; font-size: 0.85em; display: block; margin-top: 0.4em;">' + label + '</span></div></div>');

                moreCard.on('hover:enter', function () {
                    Lampa.Activity.push({ url: '', title: label, component: comp, page: 1 });
                });
                scrollBody.append(moreCard);
            });

            if (attempts >= maxAttempts) {
                clearInterval(timer);
            }
        }, 1000);
    }

    function overrideApi() {
        // Backup original if needed, but we want to replace it
        var originalMain = Lampa.Api.sources.tmdb.main;

        Lampa.Api.sources.tmdb.main = function (params, oncomplite, onerror) {
            var parts_data = [];

            // Allow plugins (like ours) to add their rows
            Lampa.ContentRows.call('main', params, parts_data);

            // parts_data now contains ONLY custom rows (because we didn't add the standard ones)

            // Use the standard loader to process these rows
            function loadPart(partLoaded, partEmpty) {
                Lampa.Api.partNext(parts_data, 5, partLoaded, partEmpty);
            }

            loadPart(oncomplite, onerror);

            return loadPart;
        };
    }


    function setupSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

        // Створюємо єдину вкладку "Ліхтар"
        Lampa.SettingsApi.addComponent({
            component: 'flixio_plugin',
            name: tr('settings_tab_title'),
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="1.5"/><path d="M8 8h8v2H8V8zm0 4h6v2H8v-2zm0 4h8v2H8v-2z" fill="white"/><circle cx="3" cy="3" r="1" fill="white" opacity="0.6"/><circle cx="21" cy="3" r="1" fill="white" opacity="0.6"/><circle cx="3" cy="21" r="1" fill="white" opacity="0.6"/><circle cx="21" cy="21" r="1" fill="white" opacity="0.6"/><circle cx="12" cy="1" r="1" fill="white" opacity="0.7"/><circle cx="12" cy="23" r="1" fill="white" opacity="0.7"/><circle cx="1" cy="12" r="1" fill="white" opacity="0.7"/><circle cx="23" cy="12" r="1" fill="white" opacity="0.7"/></svg>'
        });

        
        // === API TMDB ===
        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { type: 'title' },
            field: { name: 'API TMDB' }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_tmdb_apikey', type: 'input', placeholder: tr('settings_tmdb_input_placeholder'), values: '', default: '' },
            field: { name: tr('settings_tmdb_input_name'), description: tr('settings_tmdb_input_desc') }
        });

        // === Секція: Секції головної ===
        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { type: 'title' },
            field: { name: tr('settings_sections_title') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_hero', type: 'trigger', default: true },
            field: { name: tr('settings_hero_name'), description: tr('settings_hero_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_section_streamings', type: 'trigger', default: true },
            field: { name: tr('settings_streamings_name'), description: tr('settings_streamings_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_section_mood', type: 'trigger', default: true },
            field: { name: tr('settings_mood_name'), description: tr('settings_mood_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_ru_feed', type: 'trigger', default: false },
            field: { name: tr('settings_row_ru_name'), description: tr('settings_row_ru_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_ua_feed', type: 'trigger', default: false },
            field: { name: tr('settings_row_ua_name'), description: tr('settings_row_ua_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_en_feed', type: 'trigger', default: false },
            field: { name: tr('settings_row_en_name'), description: tr('settings_row_en_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_pl_feed', type: 'trigger', default: false },
            field: { name: tr('settings_row_pl_name'), description: tr('settings_row_pl_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_netflix', type: 'trigger', default: true },
            field: { name: tr('settings_today_netflix_name'), description: tr('settings_today_netflix_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_apple', type: 'trigger', default: true },
            field: { name: tr('settings_today_apple_name'), description: tr('settings_today_apple_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_hbo', type: 'trigger', default: true },
            field: { name: tr('settings_today_hbo_name'), description: tr('settings_today_hbo_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_prime', type: 'trigger', default: true },
            field: { name: tr('settings_today_prime_name'), description: tr('settings_today_prime_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_disney', type: 'trigger', default: true },
            field: { name: tr('settings_today_disney_name'), description: tr('settings_today_disney_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_paramount', type: 'trigger', default: true },
            field: { name: tr('settings_today_paramount_name'), description: tr('settings_today_paramount_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_sky', type: 'trigger', default: true },
            field: { name: tr('settings_today_sky_name'), description: tr('settings_today_sky_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_hulu', type: 'trigger', default: true },
            field: { name: tr('settings_today_hulu_name'), description: tr('settings_today_hulu_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { type: 'title' },
            field: { name: tr('settings_badges_title') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_badge_seasons', type: 'trigger', default: true },
            field: { name: 'Сезоны', description: 'Показывать badge для сезонов на карточках' }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_badge_year', type: 'trigger', default: true },
            field: { name: 'Год', description: 'Показывать badge для года на карточках' }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_badge_quality', type: 'trigger', default: true },
            field: { name: 'Качество', description: 'Показывать badge для качества на карточках' }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_badge_rating', type: 'trigger', default: true },
            field: { name: 'Рейтинг', description: 'Показывать badge для рейтинга на карточках' }
        });
    }

    function initApplecationFullCard() {
        if (window.flixioApplecationFullCard) return;
        window.flixioApplecationFullCard = true;
        if (typeof Lampa === 'undefined' || !Lampa.Listener || !Lampa.Listener.follow) return;

        if (!document.getElementById('flixio_applecation_css')) {
            var style = document.createElement('style');
            style.id = 'flixio_applecation_css';
            style.textContent =
                '.applecation{transition:all .3s}' +
                '.applecation .full-start-new__body{height:80vh}' +
                '.applecation .full-start-new__right{display:flex;align-items:flex-end}' +
                '.applecation .full-start-new__head,.applecation .full-start-new__details,.applecation .full-descr,.applecation .full-descr__title,.applecation .full-start__head{display:none !important}' +
                '.applecation .full-start-new__title{font-size:2.5em;font-weight:700;line-height:1.2;margin-bottom:.5em;text-shadow:0 0 .1em rgba(0,0,0,.3)}' +
                '.applecation__logo{margin-bottom:.5em;opacity:0;transform:translateY(20px);transition:opacity .4s ease-out,transform .4s ease-out}' +
                '.applecation__logo.loaded{opacity:1;transform:translateY(0)}' +
                '.applecation__logo img{display:block;max-width:35vw;max-height:180px;width:auto;height:auto;object-fit:contain;object-position:left center}' +
                '.applecation__content-wrapper{font-size:100%}' +
                '.applecation__meta{display:flex;align-items:center;color:#fff;font-size:1.1em;margin-bottom:.5em;line-height:1;opacity:0;transform:translateY(15px);transition:opacity .4s ease-out,transform .4s ease-out;transition-delay:.05s}' +
                '.applecation__meta.show{opacity:1;transform:translateY(0)}' +
                '.applecation__meta-left{display:flex;align-items:center;line-height:1}' +
                '.applecation__network{display:inline-flex;align-items:center;line-height:1}' +
                '.applecation__network img{display:block;max-height:.8em;width:auto;object-fit:contain;filter:brightness(0) invert(1)}' +
                '.applecation__meta-text{margin-left:1em;line-height:1}' +
                '.applecation__meta .full-start__pg{margin:0 0 0 .6em;padding:.2em .5em;font-size:.85em;line-height:1;border-radius:.3em;border:2px solid rgba(255,255,255,.45)}' +
                '.applecation__description-wrapper{opacity:0;transform:translateY(15px);transition:opacity .4s ease-out,transform .4s ease-out;transition-delay:.1s}' +
                '.applecation__description-wrapper.show{opacity:1;transform:translateY(0)}' +
                '.applecation__description{max-width:35vw;color:rgba(255,255,255,.85);font-size:1.1em;line-height:1.4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
                '.applecation__info{margin-top:.5em;color:rgba(255,255,255,.85);font-size:1.1em;opacity:0;transform:translateY(15px);transition:opacity .4s ease-out,transform .4s ease-out;transition-delay:.15s}' +
                '.applecation__info.show{opacity:1;transform:translateY(0)}' +
                '.applecation__ratings{opacity:0;transform:translateY(15px);transition:opacity .4s ease-out,transform .4s ease-out;transition-delay:.12s}' +
                '.applecation__ratings.show{opacity:1;transform:translateY(0)}' +
                '.applecation-description-overlay{position:fixed;left:0;top:0;width:100%;height:100%;z-index:1000;opacity:0;pointer-events:none;transition:opacity .3s}' +
                '.applecation-description-overlay.show{opacity:1;pointer-events:auto}' +
                '.applecation-description-overlay__bg{position:absolute;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.75)}' +
                '.applecation-description-overlay__content{position:relative;max-width:70vw;margin:10vh auto 0 auto;background:rgba(20,20,20,.95);border-radius:1em;padding:2em}' +
                '.applecation-description-overlay__logo{margin-bottom:1em;display:none}' +
                '.applecation-description-overlay__logo img{max-width:30vw;max-height:120px;object-fit:contain}' +
                '.applecation-description-overlay__title{font-size:2em;margin-bottom:.6em}' +
                '.applecation-description-overlay__text{font-size:1.2em;line-height:1.5;color:rgba(255,255,255,.9)}' +
                '.applecation-description-overlay__details{display:flex;gap:2em;margin-top:1.5em;flex-wrap:wrap}' +
                '.applecation-description-overlay__info-name{opacity:.7;margin-bottom:.3em}' +
                '.applecation__quality-badges{margin-left:.8em;display:inline-flex;gap:.5em;align-items:center}' +
                '.quality-badge{display:inline-flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.45);border-radius:.35em;padding:.15em .45em;font-weight:700;font-size:.9em;line-height:1;color:#fff}' +
                '.quality-badge svg{height:1.05em;width:auto;display:block}';
            document.head.appendChild(style);
        }

        function isComponentActive(component) {
            return component && !component.__destroyed;
        }

        function ensureOverlayTemplate() {
            if (!Lampa.Template || !Lampa.Template.add) return;
            if (Lampa.Template.get && Lampa.Template.get('applecation_overlay', {}, true)) return;
            Lampa.Template.add('applecation_overlay',
                '<div class="applecation-description-overlay">' +
                '<div class="applecation-description-overlay__bg"></div>' +
                '<div class="applecation-description-overlay__content selector">' +
                '<div class="applecation-description-overlay__logo"></div>' +
                '<div class="applecation-description-overlay__title">{title}</div>' +
                '<div class="applecation-description-overlay__text">{text}</div>' +
                '<div class="applecation-description-overlay__details">' +
                '<div class="applecation-description-overlay__info"><div class="applecation-description-overlay__info-name">#{full_date_of_release}</div><div class="applecation-description-overlay__info-body">{relise}</div></div>' +
                '<div class="applecation-description-overlay__info applecation--budget"><div class="applecation-description-overlay__info-name">#{full_budget}</div><div class="applecation-description-overlay__info-body">{budget}</div></div>' +
                '<div class="applecation-description-overlay__info applecation--countries"><div class="applecation-description-overlay__info-name">#{full_countries}</div><div class="applecation-description-overlay__info-body">{countries}</div></div>' +
                '</div>' +
                '</div>' +
                '</div>'
            );
        }

        function waitForBackground(activity, callback) {
            var background = activity.render().find('.full-start__background:not(.applecation__overlay)');
            if (!background.length) return callback();
            if (background.hasClass('loaded') && background.hasClass('applecation-animated')) return callback();
            if (background.hasClass('loaded')) {
                return setTimeout(function () {
                    background.addClass('applecation-animated');
                    callback();
                }, 350);
            }
            var interval = setInterval(function () {
                if (isComponentActive(activity)) {
                    if (background.hasClass('loaded')) {
                        clearInterval(interval);
                        setTimeout(function () {
                            if (isComponentActive(activity)) {
                                background.addClass('applecation-animated');
                                callback();
                            }
                        }, 650);
                    }
                } else {
                    clearInterval(interval);
                }
            }, 50);
            setTimeout(function () {
                clearInterval(interval);
                if (!background.hasClass('applecation-animated')) {
                    background.addClass('applecation-animated');
                    callback();
                }
            }, 2000);
        }

        function injectApplecationDom(activity) {
            var render = activity.render();
            render.addClass('applecation');

            var right = render.find('.full-start-new__right');
            if (!right.length) return;

            if (!right.find('.applecation__left').length) {
                var leftWrap = $('<div class="applecation__left"></div>');
                var logo = $('<div class="applecation__logo"></div>');
                var content = $('<div class="applecation__content-wrapper"></div>');
                var meta = $('<div class="applecation__meta"><div class="applecation__meta-left"><span class="applecation__network"></span><span class="applecation__meta-text"></span><div class="full-start__pg hide"></div></div></div>');
                var descWrap = $('<div class="applecation__description-wrapper"><div class="applecation__description"></div></div>');
                var info = $('<div class="applecation__info"></div>');

                leftWrap.append(logo);
                content.append(meta);
                leftWrap.append(content);
                content.append(descWrap);
                content.append(info);

                right.prepend(leftWrap);
            }

            var rateLine = render.find('.full-start-new__rate-line').first();
            if (rateLine.length) {
                rateLine.addClass('applecation__ratings');
                var metaNode = right.find('.applecation__meta');
                if (metaNode.length) rateLine.insertAfter(metaNode);
            }

            var bg = render.find('.full-start__background');
            if (bg.length && !bg.next('.applecation__overlay').length) {
                bg.after('<div class="full-start__background loaded applecation__overlay"></div>');
            }
        }

        function getTypeLabel(movie) {
            var lang = Lampa.Storage.get('language', 'ru');
            var isTv = !!movie.name;
            var map = {
                ru: isTv ? 'Сериал' : 'Фильм',
                en: isTv ? 'TV Series' : 'Movie',
                uk: isTv ? 'Серіал' : 'Фільм',
                be: isTv ? 'Серыял' : 'Фільм',
                bg: isTv ? 'Сериал' : 'Филм',
                cs: isTv ? 'Seriál' : 'Film',
                he: isTv ? 'סדרה' : 'סרט',
                pt: isTv ? 'Série' : 'Filme',
                zh: isTv ? '电视剧' : '电影'
            };
            return map[lang] || map.en;
        }

        function pluralSeasons(count) {
            var lang = Lampa.Storage.get('language', 'ru');
            if (['ru', 'uk', 'be', 'bg'].indexOf(lang) !== -1) {
                var t = [2, 0, 1, 1, 1, 2];
                var a = {
                    ru: ['сезон', 'сезона', 'сезонов'],
                    uk: ['сезон', 'сезони', 'сезонів'],
                    be: ['сезон', 'сезоны', 'сезонаў'],
                    bg: ['сезон', 'сезона', 'сезона']
                };
                var forms = (a[lang] || a.ru);
                return count + ' ' + forms[count % 100 > 4 && count % 100 < 20 ? 2 : t[Math.min(count % 10, 5)]];
            }
            if (lang === 'en') return count === 1 ? count + ' Season' : count + ' Seasons';
            if (lang === 'cs') return count === 1 || (count >= 2 && count <= 4) ? count + ' série' : count + ' sérií';
            if (lang === 'pt') return count === 1 ? count + ' Temporada' : count + ' Temporadas';
            if (lang === 'he') return count === 1 ? 'עונה ' + count : count + ' עונות';
            if (lang === 'zh') return count + ' 季';
            var key = Lampa.Lang.translate('full_season');
            return count === 1 ? count + ' ' + key : count + ' ' + key + 's';
        }

        function injectMeta(activity, movie) {
            var render = activity.render();
            var metaText = render.find('.applecation__meta-text');
            if (!metaText.length) return;
            var parts = [];
            parts.push(getTypeLabel(movie));
            if (movie.genres && movie.genres.length) {
                var g = movie.genres.slice(0, 2).map(function (x) { return Lampa.Utils.capitalizeFirstLetter(x.name); });
                parts = parts.concat(g);
            }
            metaText.html(parts.join(' · '));

            var networkNode = render.find('.applecation__network');
            if (networkNode.length) {
                if (movie.networks && movie.networks.length && movie.networks[0].logo_path) {
                    networkNode.html('<img src="' + Lampa.Api.img(movie.networks[0].logo_path, 'w200') + '" alt="' + movie.networks[0].name + '">');
                } else if (movie.production_companies && movie.production_companies.length && movie.production_companies[0].logo_path) {
                    networkNode.html('<img src="' + Lampa.Api.img(movie.production_companies[0].logo_path, 'w200') + '" alt="' + movie.production_companies[0].name + '">');
                } else {
                    networkNode.remove();
                }
            }
        }

        function injectDescription(activity, movie) {
            ensureOverlayTemplate();
            var render = activity.render();
            var text = (movie.overview || '');
            render.find('.applecation__description').text(text);

            var wrap = render.find('.applecation__description-wrapper');
            wrap.off('hover:enter');
            $('.applecation-description-overlay').remove();
            if (!text) return;

            var title = movie.title || movie.name;
            var dateStr = (movie.release_date || movie.first_air_date || '') + '';
            var rel = dateStr.length > 3 ? Lampa.Utils.parseTime(dateStr).full : (dateStr.length > 0 ? dateStr : Lampa.Lang.translate('player_unknown'));
            var budget = '$ ' + Lampa.Utils.numberWithSpaces(movie.budget || 0);
            var countries = (movie.production_countries ? movie.production_countries.map(function (c) {
                var key = 'country_' + c.iso_3166_1.toLowerCase();
                var t = Lampa.Lang.translate(key);
                return t !== key ? t : c.name;
            }) : []).join(', ');

            var overlay = $(Lampa.Template.get('applecation_overlay', {
                title: title,
                text: text,
                relise: rel,
                budget: budget,
                countries: countries
            }));

            if (!movie.budget || movie.budget === 0) overlay.find('.applecation--budget').remove();
            if (!countries) overlay.find('.applecation--countries').remove();
            $('body').append(overlay);
            overlay.data('controller-created', false);

            wrap.addClass('selector');
            if (Lampa.Controller && Lampa.Controller.collectionAppend) Lampa.Controller.collectionAppend(wrap);

            wrap.on('hover:enter', function () {
                var el = $('.applecation-description-overlay');
                if (!el.length) return;
                setTimeout(function () { el.addClass('show'); }, 10);

                if (!el.data('controller-created') && Lampa.Controller) {
                    var ctrl = {
                        toggle: function () {
                            Lampa.Controller.collectionSet(el);
                            Lampa.Controller.collectionFocus(el.find('.applecation-description-overlay__content'), el);
                        },
                        back: function () {
                            var ol = $('.applecation-description-overlay');
                            if (!ol.length) return;
                            ol.removeClass('show');
                            setTimeout(function () { Lampa.Controller.toggle('content'); }, 300);
                        }
                    };
                    Lampa.Controller.add('applecation_description', ctrl);
                    el.data('controller-created', true);
                }
                if (Lampa.Controller) Lampa.Controller.toggle('applecation_description');
            });
        }

        function injectInfo(activity, movie) {
            var render = activity.render();
            var info = render.find('.applecation__info');
            if (!info.length) return;
            var parts = [];
            var date = movie.release_date || movie.first_air_date || '';
            if (date) parts.push(date.split('-')[0]);
            if (movie.name) {
                if (movie.episode_run_time && movie.episode_run_time.length) {
                    var m = movie.episode_run_time[0];
                    var tm = Lampa.Lang.translate('time_m').replace('.', '');
                    parts.push(m + ' ' + tm);
                }
                var seasons = Lampa.Utils.countSeasons(movie);
                if (seasons) parts.push(pluralSeasons(seasons));
            } else if (movie.runtime && movie.runtime > 0) {
                var h = Math.floor(movie.runtime / 60);
                var mm = movie.runtime % 60;
                var th = Lampa.Lang.translate('time_h').replace('.', '');
                var tmm = Lampa.Lang.translate('time_m').replace('.', '');
                parts.push(h > 0 ? (h + ' ' + th + ' ' + mm + ' ' + tmm) : (mm + ' ' + tmm));
            }
            info.html((parts.length ? parts.join(' · ') : '') + '<span class="applecation__quality-badges"></span>');
        }

        function getQualityLabels(movie, activity) {
            if (!movie || !Lampa.Storage.field('parser_use')) return;
            if (!Lampa.Parser || typeof Lampa.Parser.get !== 'function') return;

            var title = movie.title || movie.name || 'Неизвестно';
            var year = ((movie.first_air_date || movie.release_date || '0000') + '').slice(0, 4);
            var key = {
                df: movie.original_title,
                df_year: movie.original_title + ' ' + year,
                df_lg: movie.original_title + ' ' + movie.title,
                df_lg_year: movie.original_title + ' ' + movie.title + ' ' + year,
                lg: movie.title,
                lg_year: movie.title + ' ' + year,
                lg_df: movie.title + ' ' + movie.original_title,
                lg_df_year: movie.title + ' ' + movie.original_title + ' ' + year
            }[Lampa.Storage.field('parse_lang')] || movie.title;

            Lampa.Parser.get({ search: key, movie: movie, page: 1 }, function (data) {
                if (!isComponentActive(activity)) return;
                if (!data || !data.Results || data.Results.length === 0) return;

                var acc = { resolutions: new Set(), hdr: new Set(), audio: new Set(), hasDub: false };
                data.Results.forEach(function (item) {
                    if (item.ffprobe && Array.isArray(item.ffprobe)) {
                        var video = item.ffprobe.find(function (x) { return x.codec_type === 'video'; });
                        if (video) {
                            var resLabel = null;
                            if (video.width && video.height) {
                                if (video.height >= 2160 || video.width >= 3840) resLabel = '4K';
                                else if (video.height >= 1440 || video.width >= 2560) resLabel = '2K';
                                else if (video.height >= 1080 || video.width >= 1920) resLabel = 'FULL HD';
                                else if (video.height >= 720 || video.width >= 1280) resLabel = 'HD';
                            }
                            if (resLabel) acc.resolutions.add(resLabel);
                            if (video.side_data_list) {
                                var hasMd = video.side_data_list.some(function (x) { return x.side_data_type === 'Mastering display metadata'; });
                                var hasCl = video.side_data_list.some(function (x) { return x.side_data_type === 'Content light level metadata'; });
                                var hasDv = video.side_data_list.some(function (x) { return x.side_data_type === 'DOVI configuration record' || x.side_data_type === 'Dolby Vision RPU'; });
                                if (hasDv) {
                                    acc.hdr.add('Dolby Vision');
                                } else if (hasMd || hasCl) {
                                    acc.hdr.add('HDR');
                                }
                            }
                            if (!acc.hdr.size && video.color_transfer && ['smpte2084', 'arib-std-b67'].indexOf((video.color_transfer || '').toLowerCase()) !== -1) {
                                acc.hdr.add('HDR');
                            }
                            if (!acc.hdr.size && video.codec_name && ((video.codec_name || '').toLowerCase().indexOf('dovi') !== -1 || (video.codec_name || '').toLowerCase().indexOf('dolby') !== -1)) {
                                acc.hdr.add('Dolby Vision');
                            }
                        }

                        var audios = item.ffprobe.filter(function (x) { return x.codec_type === 'audio'; });
                        var ch = 0;
                        audios.forEach(function (a) { if (a.channels && a.channels > ch) ch = a.channels; });
                        if (ch >= 8) acc.audio.add('7.1');
                        else if (ch >= 6) acc.audio.add('5.1');
                        else if (ch >= 4) acc.audio.add('4.0');
                        else if (ch >= 2) acc.audio.add('2.0');

                        if (!acc.hasDub) {
                            item.ffprobe.filter(function (x) { return x.codec_type === 'audio' && x.tags; }).forEach(function (a) {
                                var lang = ((a.tags.language || '') + '').toLowerCase();
                                var nm = ((a.tags.title || a.tags.handler_name || '') + '').toLowerCase();
                                if ((lang === 'rus' || lang === 'ru' || lang === 'russian') && (nm.indexOf('dub') !== -1 || nm.indexOf('дубляж') !== -1 || nm.indexOf('дублир') !== -1 || nm === 'd')) {
                                    acc.hasDub = true;
                                }
                            });
                        }
                    }

                    var titleLower = ((item.Title || '') + '').toLowerCase();
                    if (titleLower.indexOf('dolby vision') !== -1 || titleLower.indexOf('dovi') !== -1 || /\bdv\b/.test(titleLower)) acc.hdr.add('Dolby Vision');
                    if (titleLower.indexOf('hdr10+') !== -1) acc.hdr.add('HDR10+');
                    if (titleLower.indexOf('hdr10') !== -1) acc.hdr.add('HDR10');
                    if (titleLower.indexOf('hdr') !== -1) acc.hdr.add('HDR');
                });

                var badges = [];
                if (acc.resolutions.size) {
                    var order = ['8K', '4K', '2K', 'FULL HD', 'HD'];
                    for (var i = 0; i < order.length; i++) {
                        if (acc.resolutions.has(order[i])) {
                            badges.push('<div class="quality-badge quality-badge--res">' + order[i] + '</div>');
                            break;
                        }
                    }
                }
                if (acc.hdr.size) {
                    if (acc.hdr.has('Dolby Vision')) badges.push('<div class="quality-badge quality-badge--dv">Dolby Vision</div>');
                    else if (acc.hdr.has('HDR10+')) badges.push('<div class="quality-badge quality-badge--hdr">HDR10+</div>');
                    else if (acc.hdr.has('HDR10')) badges.push('<div class="quality-badge quality-badge--hdr">HDR10</div>');
                    else badges.push('<div class="quality-badge quality-badge--hdr">HDR</div>');
                }
                if (acc.audio.size) {
                    var aOrder = ['7.1', '5.1', '4.0', '2.0'];
                    for (var j = 0; j < aOrder.length; j++) {
                        if (acc.audio.has(aOrder[j])) {
                            badges.push('<div class="quality-badge quality-badge--sound">' + aOrder[j] + '</div>');
                            break;
                        }
                    }
                }
                if (acc.hasDub) badges.push('<div class="quality-badge quality-badge--dub">DUB</div>');

                var target = activity.render().find('.applecation__quality-badges');
                if (!target.length) return;
                if (badges.length) target.html(badges.join(''));
            }, function () { });
        }

        function loadLogo(activity, movie) {
            var render = activity.render();
            var logo = render.find('.applecation__logo');
            var titleEl = render.find('.full-start-new__title');

            var type = movie.name ? 'tv' : 'movie';
            var url = Lampa.TMDB.api(type + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language'));
            $.get(url, function (data) {
                if (!isComponentActive(activity)) return;
                if (data && data.logos && data.logos[0]) {
                    var p = data.logos[0].file_path;
                    var imgUrl = Lampa.TMDB.image('/t/p/w500' + p);
                    var img = new Image();
                    img.onload = function () {
                        if (!isComponentActive(activity)) return;
                        logo.html('<img src="' + imgUrl + '" alt="" />');
                        waitForBackground(activity, function () { if (isComponentActive(activity)) logo.addClass('loaded'); });
                        var overlay = $('.applecation-description-overlay');
                        if (overlay.length) {
                            overlay.find('.applecation-description-overlay__logo').html($('<img>').attr('src', imgUrl)).css('display', 'block');
                            overlay.find('.applecation-description-overlay__title').css('display', 'none');
                        }
                    };
                    img.src = imgUrl;
                } else {
                    titleEl.show();
                    waitForBackground(activity, function () { if (isComponentActive(activity)) logo.addClass('loaded'); });
                }
            }).fail(function () {
                titleEl.show();
                waitForBackground(activity, function () { if (isComponentActive(activity)) logo.addClass('loaded'); });
            });
        }

        function bindScrollDim(activity) {
            var render = activity.render();
            var bg = render.find('.full-start__background:not(.applecation__overlay)')[0];
            var scroll = render.find('.scroll__body')[0];
            if (!bg || !scroll) return;

            var dim = false;
            var desc = Object.getOwnPropertyDescriptor(scroll.style, '-webkit-transform') || Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'webkitTransform');
            Object.defineProperty(scroll.style, '-webkit-transform', {
                set: function (v) {
                    if (v) {
                        var s = v.indexOf(',') + 1;
                        var e = v.indexOf(',', s);
                        if (s > 0 && e > s) {
                            var isDown = parseFloat(v.substring(s, e)) < 0;
                            if (isDown !== dim) {
                                dim = isDown;
                                bg.classList.toggle('dim', isDown);
                            }
                        }
                    }
                    if (desc && desc.set) desc.set.call(this, v);
                    else this.setProperty('-webkit-transform', v);
                },
                get: function () {
                    return desc && desc.get ? desc.get.call(this) : this.getPropertyValue('-webkit-transform');
                },
                configurable: true
            });
        }

        function applyMarquee(activity) {
            var render = activity.render();
            var names = render.find('.full-person__name');

            function overflow(el) {
                return el.scrollWidth > el.clientWidth + 1;
            }

            names.each(function () {
                var n = $(this);
                if (n.hasClass('marquee-processed')) {
                    var t = n.find('span').first().text();
                    if (t) {
                        n.text(t);
                        n.removeClass('marquee-processed marquee-active');
                        n.css('--marquee-duration', '');
                    }
                }
            });

            setTimeout(function () {
                if (!isComponentActive(activity)) return;
                names.each(function () {
                    var n = $(this);
                    var txt = n.text().trim();
                    if (!txt) return;
                    if (overflow(n[0])) {
                        var dur = Math.min(Math.max(0.25 * txt.length, 5), 20);
                        n.addClass('marquee-processed marquee-active');
                        n.css('--marquee-duration', dur + 's');
                        var s1 = $('<span>').text(txt);
                        var s2 = $('<span>').text(txt);
                        var inner = $('<div class="marquee__inner">').append(s1).append(s2);
                        n.empty().append(inner);
                    } else {
                        n.addClass('marquee-processed');
                    }
                });
            }, 100);
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            var activity = e.object && e.object.activity;
            if (!activity || !activity.render) return;
            var render = activity.render();
            activity.__destroyed = false;
            var oldDestroy = activity.destroy;
            activity.destroy = function () {
                activity.__destroyed = true;
                if (oldDestroy) oldDestroy.apply(activity, arguments);
            };

            injectApplecationDom(activity);

            var movie = e.data && e.data.movie;
            if (!movie) return;

            injectMeta(activity, movie);
            injectDescription(activity, movie);
            injectInfo(activity, movie);
            bindScrollDim(activity);
            applyMarquee(activity);
            getQualityLabels(movie, activity);
            loadLogo(activity, movie);

            waitForBackground(activity, function () {
                if (!isComponentActive(activity)) return;
                render.find('.applecation__meta').addClass('show');
                render.find('.applecation__description-wrapper').addClass('show');
                render.find('.applecation__info').addClass('show');
                render.find('.applecation__ratings').addClass('show');
            });
        });
    }

    function initMaxsmRatingsIntegration() {
        if (window.maxsmRatingsPlugin) return;
        if (typeof Lampa === 'undefined') return;

        function normalizeApiKeys(value) {
            if (!value) return [];
            if (Array.isArray(value)) return value.filter(function (v) { return !!v; });
            if (typeof value === 'string') return [value];
            return [];
        }

        var TOKENS = window.RATINGS_PLUGIN_TOKENS || {};
        var OMDB_API_KEYS = normalizeApiKeys(TOKENS.OMDB_API_KEYS || TOKENS.OMDB || TOKENS.OMDB_KEYS || TOKENS.OMDB_API_KEY || TOKENS.OMDB_KEY);
        var KP_API_KEYS = normalizeApiKeys(TOKENS.KP_API_KEYS || TOKENS.KP || TOKENS.KP_KEYS || TOKENS.KP_API_KEY || TOKENS.KP_KEY);
        if (!OMDB_API_KEYS.length) OMDB_API_KEYS = ['73ff4450'];
        if (!KP_API_KEYS.length) KP_API_KEYS = ['5178ab83-699c-4422-937e-f8a759f872ef'];

        var C_LOGGING = false;
        var CACHE_TIME = 3 * 24 * 60 * 60 * 1000;

        var OMDB_CACHE = 'maxsm_ratings_omdb_cache';
        var KP_CACHE = 'maxsm_ratings_kp_cache';
        var ID_MAPPING_CACHE = 'maxsm_ratings_id_mapping_cache';

        var PROXY_TIMEOUT = 5000;
        var PROXY_LIST = [
            'https://cors.bwa.workers.dev/',
            'https://api.allorigins.win/raw?url='
        ];

        var AGE_RATINGS = {
            'G': '3+',
            'PG': '6+',
            'PG-13': '13+',
            'R': '17+',
            'NC-17': '18+',
            'TV-Y': '0+',
            'TV-Y7': '7+',
            'TV-G': '3+',
            'TV-PG': '6+',
            'TV-14': '14+',
            'TV-MA': '17+'
        };

        var WEIGHTS = {
            imdb: 0.35,
            tmdb: 0.15,
            kp: 0.20,
            mc: 0.15,
            rt: 0.15
        };

        var star_svg = '<svg viewBox="5 5 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="white" stroke-width="2" d="M32 18.7461L36.2922 27.4159L46.2682 28.6834L38.9675 35.3631L40.7895 44.8469L32 40.2489L23.2105 44.8469L25.0325 35.3631L17.7318 28.6834L27.7078 27.4159L32 18.7461ZM32 23.2539L29.0241 29.2648L22.2682 30.1231L27.2075 34.6424L25.9567 41.1531L32 37.9918L38.0433 41.1531L36.7925 34.6424L41.7318 30.1231L34.9759 29.2648L32 23.2539Z"/><path fill="none" stroke="white" stroke-width="2" d="M32 9C19.2975 9 9 19.2975 9 32C9 44.7025 19.2975 55 32 55C44.7025 55 55 44.7025 55 32C55 19.2975 44.7025 9 32 9ZM7 32C7 18.1929 18.1929 7 32 7C45.8071 7 57 18.1929 57 32C57 45.8071 45.8071 57 32 57C18.1929 57 7 45.8071 7 32Z"/></svg>';
        var avg_svg = '<svg width="64" height="64" viewBox="10 10 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.4517 11.3659C31.8429 10.7366 32.7589 10.7366 33.1501 11.3659L40.2946 22.8568C40.4323 23.0782 40.651 23.2371 40.9041 23.2996L54.0403 26.5435C54.7598 26.7212 55.0428 27.5923 54.5652 28.1589L45.8445 38.5045C45.6764 38.7039 45.5929 38.961 45.6117 39.221L46.5858 52.7168C46.6392 53.4559 45.8982 53.9942 45.2117 53.7151L32.6776 48.6182C32.4361 48.52 32.1657 48.52 31.9242 48.6182L19.39 53.7151C18.7036 53.9942 17.9626 53.4559 18.016 52.7168L18.9901 39.221C19.0089 38.961 18.9253 38.7039 18.7573 38.5045L10.0366 28.1589C9.559 27.5923 9.84204 26.7212 10.5615 26.5435L23.6977 23.2996C23.9508 23.2371 24.1695 23.0782 24.3072 22.8568L31.4517 11.3659Z" fill="#FFDF6D"/></svg>';
        var tmdb_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#90cea1"/><stop offset="56%" stop-color="#3cbec9"/><stop offset="100%" stop-color="#00b3e5"/></linearGradient><style>.text-style{font-weight:bold;fill:url(#grad);text-anchor:start;dominant-baseline:middle;textLength:150;lengthAdjust:spacingAndGlyphs;font-size:70px;}</style></defs><text class="text-style" x="0" y="50" textLength="150" lengthAdjust="spacingAndGlyphs">TM</text><text class="text-style" x="0" y="120" textLength="150" lengthAdjust="spacingAndGlyphs">DB</text></svg>';
        var imdb_svg = '<?xml version="1.0" encoding="utf-8"?><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88" xml:space="preserve"><style type="text/css"><![CDATA[.st0{fill:#F5C518;}]]></style><g><path class="st0" d="M18.43,0h86.02c10.18,0,18.43,8.25,18.43,18.43v86.02c0,10.18-8.25,18.43-18.43,18.43H18.43 C8.25,122.88,0,114.63,0,104.45l0-86.02C0,8.25,8.25,0,18.43,0L18.43,0z"/><path d="M24.96,78.72V44.16h-9.6v34.56H24.96L24.96,78.72z M45.36,44.16L43.2,60.24L42,51.6l-1.2-7.44l-12,0v34.56h8.16v-22.8 l3.36,22.8h6l3.12-23.28v23.28h8.16V44.16H45.36L45.36,44.16z M61.44,78.72V44.16h14.88c3.6,0,6.24,2.64,6.24,6v22.56 c0,3.36-2.64,6-6.24,6H61.44L61.44,78.72z M72.72,50.4l-2.16-0.24v22.56c1.2,0,2.16-0.24,2.4-0.72c0.48-0.48,0.48-1.92,0.48-4.32 V54.24v-2.88L72.72,50.4L72.72,50.4L72.72,50.4z M100.56,52.8h0.72c3.36,0,6.24,2.64,6.24,6v13.92c0,3.36-2.88,6-6.24,6l-0.72,0 c-1.92,0-3.84-0.96-5.04-2.64l-0.48,2.16H86.4V44.16h9.12V55.2C96.72,53.76,98.64,52.8,100.56,52.8L100.56,52.8z M98.64,69.6v-8.16 L98.4,58.8c-0.24-0.48-0.96-0.72-1.44-0.72c-0.48,0-1.2,0.24-1.44,0.72v13.68c0.24,0.48,0.96,0.72,1.44,0.72 c0.48,0,1.44-0.24,1.44-0.72L98.64,69.6L98.64,69.6z"/></g></svg>';
        var kp_svg = '<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="mask0_1_69" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300"><circle cx="150" cy="150" r="150" fill="white"/></mask><g mask="url(#mask0_1_69)"><circle cx="150" cy="150" r="150" fill="black"/><path d="M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z" fill="url(#paint0_radial_1_69)"/></g><defs><radialGradient id="paint0_radial_1_69" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(89.9999 45) rotate(45) scale(296.985)"><stop offset="0.5" stop-color="#FF5500"/><stop offset="1" stop-color="#BBFF00"/></radialGradient></defs></svg>';
        var rt_svg = '<svg xmlns="http://www.w3.org/2000/svg" height="141.25" viewBox="0 0 138.75 141.25" width="138.75"><g fill="#f93208"><path d="m20.154 40.829c-28.149 27.622-13.657 61.011-5.734 71.931 35.254 41.954 92.792 25.339 111.89-5.9071 4.7608-8.2027 22.554-53.467-23.976-78.009z"/><path d="m39.613 39.265 4.7778-8.8607 28.406-5.0384 11.119 9.2082z"/></g><g><path d="m39.436 8.5696 8.9682-5.2826 6.7569 15.479c3.7925-6.3226 13.79-16.316 24.939-4.6684-4.7281 1.2636-7.5161 3.8553-7.7397 8.4768 15.145-4.1697 31.343 3.2127 33.539 9.0911-10.951-4.314-27.695 10.377-41.771 2.334 0.009 15.045-12.617 16.636-19.902 17.076 2.077-4.996 5.591-9.994 1.474-14.987-7.618 8.171-13.874 10.668-33.17 4.668 4.876-1.679 14.843-11.39 24.448-11.425-6.775-2.467-12.29-2.087-17.814-1.475 2.917-3.961 12.149-15.197 28.625-8.476z" fill="#02902e"/></g></svg>';
        var mc_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><circle fill="#001B36" stroke="#FC0" stroke-width="4.6" cx="44" cy="44" r="41.6"/></svg>';
        var awards_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><path fill="#FFD700" d="M12 2l2.2 6.8H21l-5.5 4 2.1 6.8L12 15.8 6.4 19.6l2.1-6.8L3 8.8h6.8z"/></svg>';

        if (Lampa.Lang && Lampa.Lang.add) {
            Lampa.Lang.add({
                maxsm_ratings: { ru: 'Рейтинг и качество', en: 'Rating & Quality', uk: 'Рейтинг і якість', pl: 'Ocena i jakość' },
                maxsm_ratings_cc: { ru: 'Очистить локальный кеш', en: 'Clear local cache', uk: 'Очистити локальний кеш', pl: 'Wyczyść lokalny cache' },
                maxsm_ratings_critic: { ru: 'Оценки критиков', en: 'Critic Ratings', uk: 'Оцінки критиків', pl: 'Oceny krytyków' },
                maxsm_ratings_mode: { ru: 'Средний рейтинг', en: 'Average rating', uk: 'Середній рейтинг', pl: 'Średnia ocena' },
                maxsm_ratings_mode_normal: { ru: 'Показывать средний рейтинг', en: 'Show average rating', uk: 'Показувати середній рейтинг', pl: 'Pokaż średnią ocenę' },
                maxsm_ratings_mode_simple: { ru: 'Только средний рейтинг', en: 'Only average rating', uk: 'Лише середній рейтинг', pl: 'Tylko średnia ocena' },
                maxsm_ratings_mode_noavg: { ru: 'Без среднего рейтинга', en: 'No average', uk: 'Без середнього рейтингу', pl: 'Bez średniej' },
                maxsm_ratings_icons: { ru: 'Значки', en: 'Icons', uk: 'Значки', pl: 'Ikony' },
                maxsm_ratings_colors: { ru: 'Цвета', en: 'Colors', uk: 'Кольори', pl: 'Kolory' },
                maxsm_ratings_avg: { ru: 'ИТОГ', en: 'TOTAL', uk: 'ПІДСУМОК', pl: 'RAZEM' },
                maxsm_ratings_avg_simple: { ru: 'Оценка', en: 'Rating', uk: 'Оцінка', pl: 'Ocena' },
                maxsm_ratings_loading: { ru: 'Загрузка', en: 'Loading', uk: 'Завантаження', pl: 'Ładowanie' },
                maxsm_ratings_oscars: { ru: 'Оскар', en: 'Oscar', uk: 'Оскар', pl: 'Oscar' },
                maxsm_ratings_emmy: { ru: 'Эмми', en: 'Emmy', uk: 'Еммі', pl: 'Emmy' },
                maxsm_ratings_awards: { ru: 'Награды', en: 'Awards', uk: 'Нагороди', pl: 'Nagrody' },
                maxsm_ratings_show_total: { ru: 'Итог', en: 'Total', uk: 'Підсумок', pl: 'Razem' },
                maxsm_ratings_show_oscars: { ru: 'Оскар', en: 'Oscar', uk: 'Оскар', pl: 'Oscar' },
                maxsm_ratings_show_awards: { ru: 'Награды', en: 'Awards', uk: 'Нагороди', pl: 'Nagrody' },
                maxsm_ratings_show_tmdb: { ru: 'TMDB', en: 'TMDB', uk: 'TMDB', pl: 'TMDB' },
                maxsm_ratings_show_imdb: { ru: 'IMDB', en: 'IMDb', uk: 'IMDb', pl: 'IMDb' },
                maxsm_ratings_show_kp: { ru: 'Кинопоиск', en: 'Kinopoisk', uk: 'Кінопошук', pl: 'Kinopoisk' },
                maxsm_ratings_show_rt: { ru: 'Tomatoes', en: 'Tomatoes', uk: 'Tomatoes', pl: 'Tomatoes' },
                maxsm_ratings_show_mc: { ru: 'Metacritic', en: 'Metacritic', uk: 'Metacritic', pl: 'Metacritic' },
                maxsm_ratings_quality: { ru: 'Качество внутри карточек', en: 'Quality inside cards', uk: 'Якість всередині карток', pl: 'Jakość w kartach' },
                maxsm_ratings_quality_inlist: { ru: 'Качество на карточках', en: 'Quality on cards', uk: 'Якість на картках', pl: 'Jakość na kartach' },
                maxsm_ratings_quality_tv: { ru: 'Качество для сериалов', en: 'Quality for series', uk: 'Якість для серіалів', pl: 'Jakość dla seriali' }
            });
        }

        if (!document.getElementById('maxsm_ratings_css')) {
            var style = document.createElement('style');
            style.id = 'maxsm_ratings_css';
            style.textContent = '.full-start-new__rate-line{display:flex;flex-wrap:wrap;column-gap:.22em;row-gap:.22em}.full-start-new__rate-line>*{margin:0!important}.full-start-new__rate-line .full-start__rate{display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;gap:.28em!important;margin:0!important;width:auto!important}.full-start-new__rate-line .full-start__rate.hide{display:none!important}.full-start-new__rate-line .full-start__rate>div{margin:0!important}.full-start__rate>div:last-child{padding:.2em .35em}.rate--green{color:#4caf50}.rate--lime{color:#cddc39}.rate--orange{color:#ff9800}.rate--red{color:#f44336}.rate--gold{color:gold}.rate--icon{height:1.8em}.maxsm-quality{min-width:2.8em;text-align:center}.maxsm-icon-container{display:inline-flex;align-items:center;justify-content:center;height:1.6em;width:1.6em;overflow:hidden;vertical-align:middle;padding:0}.maxsm-icon-container svg{width:100%;height:100%;object-fit:contain}.full-start-new__rate-line .source--name{display:inline-flex;align-items:center;justify-content:center;min-width:2.2em}.full-start-new__rate-line .source--name.rate--icon{min-width:2.2em}.applecation__ratings:not(.full-start-new__rate-line){display:none!important}.applecation .full-start-new__rate-line.applecation__ratings{height:auto!important;overflow:visible!important;opacity:1!important;pointer-events:auto!important;margin:0 0 .5em 0!important}';
            document.head.appendChild(style);
        }
        
        if (!document.getElementById('maxsm_ratings_modal_css')) {
            var modalStyle = document.createElement('style');
            modalStyle.id = 'maxsm_ratings_modal_css';
            modalStyle.textContent = '.maxsm-modal-ratings{padding:1.25em;font-size:1.4em;line-height:1.6}.maxsm-modal-rating-line{padding:.5em 0;border-bottom:.0625em solid rgba(255,255,255,.1)}.maxsm-modal-rating-line:last-child{border-bottom:none}.maxsm-modal-imdb{color:#f5c518}.maxsm-modal-kp{color:#4CAF50}.maxsm-modal-tmdb{color:#01b4e4}.maxsm-modal-rt{color:#fa320a}.maxsm-modal-mc{color:#6dc849}.maxsm-modal-oscars,.maxsm-modal-emmy,.maxsm-modal-awards{color:#FFD700}';
            document.head.appendChild(modalStyle);
        }

        if (!localStorage.getItem('maxsm_ratings_awards')) localStorage.setItem('maxsm_ratings_awards', 'true');
        if (!localStorage.getItem('maxsm_ratings_critic')) localStorage.setItem('maxsm_ratings_critic', 'true');
        if (!localStorage.getItem('maxsm_ratings_colors')) localStorage.setItem('maxsm_ratings_colors', 'false');
        if (!localStorage.getItem('maxsm_ratings_icons')) localStorage.setItem('maxsm_ratings_icons', 'false');
        if (!localStorage.getItem('maxsm_ratings_mode')) localStorage.setItem('maxsm_ratings_mode', '0');
        if (!localStorage.getItem('maxsm_ratings_show_total')) localStorage.setItem('maxsm_ratings_show_total', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_oscars')) localStorage.setItem('maxsm_ratings_show_oscars', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_awards')) localStorage.setItem('maxsm_ratings_show_awards', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_tmdb')) localStorage.setItem('maxsm_ratings_show_tmdb', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_imdb')) localStorage.setItem('maxsm_ratings_show_imdb', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_kp')) localStorage.setItem('maxsm_ratings_show_kp', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_rt')) localStorage.setItem('maxsm_ratings_show_rt', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_mc')) localStorage.setItem('maxsm_ratings_show_mc', 'true');
        if (!localStorage.getItem('maxsm_ratings_quality')) localStorage.setItem('maxsm_ratings_quality', 'true');
        if (!localStorage.getItem('maxsm_ratings_quality_inlist')) localStorage.setItem('maxsm_ratings_quality_inlist', 'true');
        if (!localStorage.getItem('maxsm_ratings_quality_tv')) localStorage.setItem('maxsm_ratings_quality_tv', 'true');

        function getRandomToken(arr) {
            if (!arr || !arr.length) return '';
            return arr[Math.floor(Math.random() * arr.length)];
        }

        function getRatingClass(rating) {
            var r = parseFloat(rating);
            if (r >= 8.5) return 'rate--green';
            if (r >= 7.0) return 'rate--lime';
            if (r >= 5.0) return 'rate--orange';
            return 'rate--red';
        }

        function getCardType(card) {
            var type = card.media_type || card.type;
            if (type === 'movie' || type === 'tv') return type;
            return (card.name || card.original_name) ? 'tv' : 'movie';
        }

        function parseAwards(awardsText) {
            if (typeof awardsText !== 'string') return { oscars: 0, emmy: 0, awards: 0 };
            var result = { oscars: 0, emmy: 0, awards: 0 };

            var oscarMatch = awardsText.match(/Won (\d+) Oscars?/i);
            if (oscarMatch && oscarMatch[1]) result.oscars = parseInt(oscarMatch[1], 10);

            var emmyMatch = awardsText.match(/Won (\d+) Primetime Emmys?/i);
            if (emmyMatch && emmyMatch[1]) result.emmy = parseInt(emmyMatch[1], 10);

            var otherMatch = awardsText.match(/Another (\d+) wins?/i);
            if (otherMatch && otherMatch[1]) result.awards = parseInt(otherMatch[1], 10);

            if (result.awards === 0) {
                var simpleMatch = awardsText.match(/(\d+) wins?/i);
                if (simpleMatch && simpleMatch[1]) result.awards = parseInt(simpleMatch[1], 10);
            }

            return result;
        }

        function extractRating(ratings, source) {
            if (!ratings || !Array.isArray(ratings)) return null;
            for (var i = 0; i < ratings.length; i++) {
                if (ratings[i].Source === source) {
                    try {
                        return source === 'Rotten Tomatoes' ? parseFloat(ratings[i].Value.replace('%', '')) : parseFloat(ratings[i].Value.split('/')[0]);
                    } catch (e) {
                        return null;
                    }
                }
            }
            return null;
        }

        function getOmdbCache(key) {
            var cache = Lampa.Storage.get(OMDB_CACHE) || {};
            var item = cache[key];
            return item && (Date.now() - item.timestamp < CACHE_TIME) ? item : null;
        }

        function saveOmdbCache(key, data) {
            var cache = Lampa.Storage.get(OMDB_CACHE) || {};
            cache[key] = {
                rt: data.rt,
                mc: data.mc,
                imdb: data.imdb,
                ageRating: data.ageRating,
                oscars: data.oscars || null,
                emmy: data.emmy || null,
                awards: data.awards || null,
                timestamp: Date.now()
            };
            Lampa.Storage.set(OMDB_CACHE, cache);
        }

        function getKpCache(key) {
            var cache = Lampa.Storage.get(KP_CACHE) || {};
            var item = cache[key];
            return item && (Date.now() - item.timestamp < CACHE_TIME) ? item : null;
        }

        function saveKpCache(key, data) {
            var cache = Lampa.Storage.get(KP_CACHE) || {};
            cache[key] = { kp: data.kp || null, imdb: data.imdb || null, timestamp: Date.now() };
            Lampa.Storage.set(KP_CACHE, cache);
        }

        function getImdbIdFromTmdb(tmdbId, cardType, localCurrentCard, callback) {
            var cleanType = cardType === 'tv' ? 'tv' : 'movie';
            var cacheKey = cleanType + '_' + tmdbId;
            var cache = Lampa.Storage.get(ID_MAPPING_CACHE) || {};
            if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TIME)) {
                return callback(cache[cacheKey].imdb_id);
            }

            var mainPath = cleanType + '/' + tmdbId + '/external_ids?api_key=' + Lampa.TMDB.key();
            var mainUrl = Lampa.TMDB.api(mainPath);

            new Lampa.Reguest().silent(mainUrl, function (data) {
                if (data && data.imdb_id) {
                    cache[cacheKey] = { imdb_id: data.imdb_id, timestamp: Date.now() };
                    Lampa.Storage.set(ID_MAPPING_CACHE, cache);
                    callback(data.imdb_id);
                } else {
                    callback(null);
                }
            }, function () {
                callback(null);
            });
        }

        function fetchOmdbRatings(card, localCurrentCard, callback) {
            if (!card.imdb_id) return callback(null);
            var url = 'https://www.omdbapi.com/?apikey=' + getRandomToken(OMDB_API_KEYS) + '&i=' + card.imdb_id;
            new Lampa.Reguest().silent(url, function (data) {
                if (data && data.Response === 'True' && (data.Ratings || data.imdbRating)) {
                    var parsedAwards = parseAwards(data.Awards || '');
                    callback({
                        rt: extractRating(data.Ratings, 'Rotten Tomatoes'),
                        mc: extractRating(data.Ratings, 'Metacritic'),
                        imdb: data.imdbRating || null,
                        ageRating: data.Rated || null,
                        oscars: parsedAwards.oscars,
                        emmy: parsedAwards.emmy,
                        awards: parsedAwards.awards
                    });
                } else {
                    callback(null);
                }
            }, function () {
                callback(null);
            });
        }

        function fetchWithProxy(url, localCurrentCard, callback) {
            var currentProxy = 0;
            var callbackCalled = false;

            function tryNextProxy() {
                if (currentProxy >= PROXY_LIST.length) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        callback(new Error('All proxies failed'));
                    }
                    return;
                }

                var proxyUrl = PROXY_LIST[currentProxy] + encodeURIComponent(url);
                var timeoutId = setTimeout(function () {
                    if (!callbackCalled) {
                        currentProxy++;
                        tryNextProxy();
                    }
                }, PROXY_TIMEOUT);

                fetch(proxyUrl)
                    .then(function (response) {
                        clearTimeout(timeoutId);
                        if (!response.ok) throw new Error('Proxy error: ' + response.status);
                        return response.text();
                    })
                    .then(function (data) {
                        if (!callbackCalled) {
                            callbackCalled = true;
                            clearTimeout(timeoutId);
                            callback(null, data);
                        }
                    })
                    .catch(function () {
                        clearTimeout(timeoutId);
                        if (!callbackCalled) {
                            currentProxy++;
                            tryNextProxy();
                        }
                    });
            }

            tryNextProxy();
        }

        function getKPRatings(normalizedCard, apiKey, localCurrentCard, callback) {
            if (normalizedCard.kinopoisk_id) {
                return fetchRatings(normalizedCard.kinopoisk_id, localCurrentCard);
            }

            var queryTitle = (normalizedCard.original_title || normalizedCard.title || '').replace(/[:\\-–—]/g, ' ').trim();
            var year = '';
            if (normalizedCard.release_date && typeof normalizedCard.release_date === 'string') {
                year = normalizedCard.release_date.split('-')[0];
            }

            if (!year) {
                callback(null);
                return;
            }

            var encodedTitle = encodeURIComponent(queryTitle);
            var searchUrl = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + encodedTitle;

            fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'X-API-KEY': apiKey,
                    'Content-Type': 'application/json'
                }
            })
                .then(function (response) {
                    if (!response.ok) throw new Error('HTTP error: ' + response.status);
                    return response.json();
                })
                .then(function (data) {
                    if (!data.films || !data.films.length) {
                        callback(null);
                        return;
                    }

                    var bestMatch = null;
                    var filmYear;
                    var targetYear;
                    var film2;

                    for (var j = 0; j < data.films.length; j++) {
                        film2 = data.films[j];
                        if (!film2.year) continue;

                        filmYear = parseInt(String(film2.year).substring(0, 4), 10);
                        targetYear = parseInt(year, 10);

                        if (isNaN(filmYear)) continue;
                        if (isNaN(targetYear)) continue;

                        if (filmYear === targetYear) {
                            bestMatch = film2;
                            break;
                        }
                    }

                    if (!bestMatch) {
                        for (var k = 0; k < data.films.length; k++) {
                            film2 = data.films[k];
                            if (!film2.year) continue;

                            filmYear = parseInt(String(film2.year).substring(0, 4), 10);
                            targetYear = parseInt(year, 10);

                            if (isNaN(filmYear)) continue;
                            if (isNaN(targetYear)) continue;

                            if (Math.abs(filmYear - targetYear) <= 1) {
                                bestMatch = film2;
                                break;
                            }
                        }
                    }

                    if (!bestMatch || !bestMatch.filmId) {
                        callback(null);
                        return;
                    }

                    fetchRatings(bestMatch.filmId, localCurrentCard);
                })
                .catch(function () {
                    callback(null);
                });

            function fetchRatings(filmId, localCurrentCard) {
                var xmlUrl = 'https://rating.kinopoisk.ru/' + filmId + '.xml';

                fetchWithProxy(xmlUrl, localCurrentCard, function (error, xmlText) {
                    if (!error && xmlText) {
                        try {
                            var parser = new DOMParser();
                            var xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                            var kpRatingNode = xmlDoc.getElementsByTagName('kp_rating')[0];
                            var imdbRatingNode = xmlDoc.getElementsByTagName('imdb_rating')[0];

                            var kpRating = kpRatingNode ? parseFloat(kpRatingNode.textContent) : null;
                            var imdbRating = imdbRatingNode ? parseFloat(imdbRatingNode.textContent) : null;

                            var hasValidKp = !isNaN(kpRating) && kpRating > 0;
                            var hasValidImdb = !isNaN(imdbRating) && imdbRating > 0;

                            if (hasValidKp || hasValidImdb) {
                                return callback({ kinopoisk: hasValidKp ? kpRating : null, imdb: hasValidImdb ? imdbRating : null });
                            }
                        } catch (e) { }
                    }

                    fetch('https://kinopoiskapiunofficial.tech/api/v2.2/films/' + filmId, {
                        headers: { 'X-API-KEY': apiKey }
                    })
                        .then(function (response) {
                            if (!response.ok) throw new Error('API error');
                            return response.json();
                        })
                        .then(function (data) {
                            callback({
                                kinopoisk: data.ratingKinopoisk || null,
                                imdb: data.ratingImdb || null
                            });
                        })
                        .catch(function () {
                            callback(null);
                        });
                });
            }
        }

        function addLoadingAnimation(render) {
            if (!render) return;
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;
            rateLine.append('<div class="loading-dots-container"><div class="loading-dots"><span class="loading-dots__text">' + (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_loading') : 'Loading') + '</span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span></div></div>');
        }

        function removeLoadingAnimation(render) {
            if (!render) return;
            var containers = $('.loading-dots-container', render);
            containers.each(function (index, element) {
                element.parentNode.removeChild(element);
            });
        }

        function updateHiddenElements(ratings, render) {
            if (!render) return;

            var pgElement = $('.full-start__pg.hide', render);
            if (pgElement.length && ratings.ageRating) {
                var invalidRatings = ['N/A', 'Not Rated', 'Unrated', 'NR'];
                if (invalidRatings.indexOf(ratings.ageRating) === -1) {
                    var localizedRating = AGE_RATINGS[ratings.ageRating] || ratings.ageRating;
                    pgElement.removeClass('hide').text(localizedRating);
                }
            }

            function setRateVisible(selector, value) {
                var el = $(selector, render);
                if (!el.length) return;
                var ok = value != null && value !== '' && !isNaN(value);
                if (ok) {
                    el.removeClass('hide').find('> div').eq(0).text(parseFloat(value).toFixed(1));
                } else {
                    el.addClass('hide').find('> div').eq(0).text('');
                }
            }

            var imdbValue = null;
            if (ratings.imdb && !isNaN(ratings.imdb)) imdbValue = ratings.imdb;
            else if (ratings.imdb_kp && !isNaN(ratings.imdb_kp)) imdbValue = ratings.imdb_kp;
            var showImdb = localStorage.getItem('maxsm_ratings_show_imdb') !== 'false';
            var showKp = localStorage.getItem('maxsm_ratings_show_kp') !== 'false';
            var showTmdb = localStorage.getItem('maxsm_ratings_show_tmdb') !== 'false';
            setRateVisible('.rate--imdb', showImdb ? imdbValue : null);
            setRateVisible('.rate--kp', showKp ? ratings.kp : null);
            setRateVisible('.rate--tmdb', showTmdb ? ratings.tmdb : null);
        }

        function insertRatings(rtRating, mcRating, oscars, awards, emmy, render) {
            if (!render) return;
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length) return;

            var lastRate = $('.full-start__rate:last', rateLine);

            var showRT = localStorage.getItem('maxsm_ratings_show_rt') !== 'false';
            var showMC = localStorage.getItem('maxsm_ratings_show_mc') !== 'false';
            var showAwards = localStorage.getItem('maxsm_ratings_show_awards') !== 'false';
            var showOscar = localStorage.getItem('maxsm_ratings_show_oscars') !== 'false';
            var showEmmy = false;
            var showColors = localStorage.getItem('maxsm_ratings_colors') === 'true';

            function upsertNumberRate(className, value, label, opts) {
                var existing = $('.' + className, rateLine);
                var enabled = opts && opts.enabled;
                var okValue = value != null && value !== '' && !isNaN(value) && (!opts || !opts.min || value >= opts.min);
                if (!enabled || !okValue) {
                    if (existing.length) existing.remove();
                    return;
                }
                if (!existing.length) {
                    var el = $('<div class="full-start__rate ' + className + '"><div></div><div class="source--name"></div></div>');
                    if (opts && opts.gold) el.addClass('rate--gold');
                    el.find('> div').eq(1).text(label);
                    if (className === 'rate--rt') {
                        if (lastRate.length) el.insertAfter(lastRate);
                        else rateLine.append(el);
                    } else if (className === 'rate--mc') {
                        var afterRt = $('.rate--rt', rateLine);
                        if (afterRt.length) el.insertAfter(afterRt);
                        else if (lastRate.length) el.insertAfter(lastRate);
                        else rateLine.prepend(el);
                    } else {
                        rateLine.prepend(el);
                    }
                    existing = el;
                }
                existing.find('> div').eq(0).text(value);
                if (opts && opts.gold) {
                    if (showColors) existing.addClass('rate--gold');
                    else existing.removeClass('rate--gold');
                }
            }

            upsertNumberRate('rate--rt', rtRating, 'Tomatoes', { enabled: showRT });
            upsertNumberRate('rate--mc', mcRating, 'Metacritic', { enabled: showMC });
            upsertNumberRate('rate--awards', awards, (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_awards') : 'Awards'), { enabled: showAwards, gold: true, min: 1 });
            upsertNumberRate('rate--oscars', oscars, (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_oscars') : 'Oscar'), { enabled: showOscar, gold: true, min: 1 });
            upsertNumberRate('rate--emmy', emmy, (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_emmy') : 'Emmy'), { enabled: showEmmy, gold: true, min: 1 });
        }

        function reorderRateLine(render) {
            if (!render) return;
            var rateLine = $('.full-start-new__rate-line', render).first();
            if (!rateLine.length) return;

            var order = ['rate--tmdb', 'rate--imdb', 'rate--kp', 'rate--rt', 'rate--mc', 'rate--oscars', 'rate--awards', 'rate--avg'];
            var status = rateLine.find('.full-start__status').detach();

            for (var i = 0; i < order.length; i++) {
                var el = rateLine.find('.' + order[i]).first();
                if (el.length) rateLine.append(el.detach());
            }

            if (status.length) rateLine.append(status);
        }

        function calculateAverageRating(render) {
            if (!render) return;
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length) return;

            $('.full-start__rate', rateLine).show();

            var ratings = {
                imdb: parseFloat($('.rate--imdb div:first', rateLine).text()) || 0,
                tmdb: parseFloat($('.rate--tmdb div:first', rateLine).text()) || 0,
                kp: parseFloat($('.rate--kp div:first', rateLine).text()) || 0,
                mc: (parseFloat($('.rate--mc div:first', rateLine).text()) || 0) / 10,
                rt: (parseFloat($('.rate--rt div:first', rateLine).text()) || 0) / 10
            };

            var totalWeight = 0;
            var weightedSum = 0;
            var ratingsCount = 0;

            for (var key in ratings) {
                if (ratings.hasOwnProperty(key) && !isNaN(ratings[key]) && ratings[key] > 0) {
                    weightedSum += ratings[key] * WEIGHTS[key];
                    totalWeight += WEIGHTS[key];
                    ratingsCount++;
                }
            }

            $('.rate--avg', rateLine).remove();

            var mode = parseInt(localStorage.getItem('maxsm_ratings_mode'), 10);
            var showTotal = localStorage.getItem('maxsm_ratings_show_total') !== 'false';
            if (showTotal && totalWeight > 0 && (ratingsCount > 1 || mode === 1) && mode !== 2) {
                var averageRating = (weightedSum / totalWeight).toFixed(1);
                var colorClass = getRatingClass(averageRating);
                var avgLabel = (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_avg') : 'TOTAL');

                if (mode === 1) {
                    avgLabel = (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_avg_simple') : 'Rating');
                    $('.full-start__rate', rateLine).not('.rate--oscars, .rate--avg, .rate--awards').hide();
                }

                var avgElement = $('<div class="full-start__rate rate--avg ' + colorClass + '"><div>' + averageRating + '</div><div class="source--name">' + avgLabel + '</div></div>');
                if (localStorage.getItem('maxsm_ratings_colors') !== 'true') avgElement.removeClass(colorClass);
                var status = rateLine.find('.full-start__status').first();
                if (status.length) avgElement.insertBefore(status);
                else rateLine.append(avgElement);
            }
        }

        function showRatingsModal(render) {
            if (!render || !Lampa.Modal) return;
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length) return;
            
            var showColors = localStorage.getItem('maxsm_ratings_colors') === 'true';
            var modalContent = $('<div class="maxsm-modal-ratings"></div>');
            
            function isNumericText(txt) {
                if (!txt) return false;
                var cleaned = String(txt).trim().replace(',', '.');
                var n = parseFloat(cleaned);
                return !isNaN(n) && isFinite(n);
            }
            
            function extractValue(element) {
                if (!element || !element.length) return '';
                var divs = element.children('div');
                for (var i = 0; i < divs.length; i++) {
                    var t = divs.eq(i).text().trim();
                    if (isNumericText(t)) return t;
                }
                var fallback = element.children().eq(0).text();
                return (fallback || '').trim();
            }
            
            var ratingOrder = [
                'rate--tmdb',
                'rate--imdb',
                'rate--kp',
                'rate--rt',
                'rate--mc',
                'rate--oscars',
                'rate--awards',
                'rate--avg'
            ];
            
            for (var i = 0; i < ratingOrder.length; i++) {
                var className = ratingOrder[i];
                var element = $('.' + className, rateLine);
                if (!element.length) continue;
                if (element.hasClass('hide') || !element.is(':visible')) continue;
                
                var value = extractValue(element);
                if (!value) continue;
                
                var numericValue = parseFloat(String(value).replace(',', '.'));
                var label = '';
                
                switch (className) {
                    case 'rate--avg':
                        label = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_mode') : 'Средний рейтинг';
                        break;
                    case 'rate--oscars':
                        label = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_oscars') : 'Оскар';
                        break;
                    case 'rate--emmy':
                        label = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_emmy') : 'Эмми';
                        break;
                    case 'rate--awards':
                        label = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_awards') : 'Награды';
                        break;
                    case 'rate--tmdb':
                        label = 'TMDB';
                        break;
                    case 'rate--imdb':
                        label = 'IMDb';
                        break;
                    case 'rate--kp':
                        label = 'Кинопоиск';
                        break;
                    case 'rate--rt':
                        label = 'Rotten Tomatoes';
                        break;
                    case 'rate--mc':
                        label = 'Metacritic';
                        break;
                }
                
                var item = $('<div class="maxsm-modal-rating-line"></div>');
                if (showColors) {
                    if (className === 'rate--avg') {
                        var colorClass = getRatingClass(numericValue);
                        if (colorClass) item.addClass(colorClass);
                    } else {
                        item.addClass('maxsm-modal-' + className.replace('rate--', ''));
                    }
                }
                
                item.text(value + ' - ' + label);
                modalContent.append(item);
            }
            
            Lampa.Modal.open({
                title: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_avg_simple') : 'Оценка',
                html: modalContent,
                width: 600,
                onBack: function () {
                    Lampa.Modal.close();
                    if (Lampa.Controller) Lampa.Controller.toggle('content');
                    return true;
                }
            });
        }

        function insertIcons(render) {
            if (!render) return;
            var showIcons = localStorage.getItem('maxsm_ratings_icons') === 'true';

            function isNumericText(txt) {
                if (!txt) return false;
                var cleaned = String(txt).trim().replace(',', '.');
                var n = parseFloat(cleaned);
                return !isNaN(n) && isFinite(n);
            }

            function apply(className, svg) {
                var Element = $('.' + className, render);
                if (!Element.length) return;
                Element.find('.maxsm-icon-container').remove();

                if (showIcons) {
                    var target = Element.find('.source--name');
                    if (!target.length) {
                        var childDivs = Element.children('div');
                        if (childDivs.length >= 2) {
                            var t0 = childDivs.eq(0).text().trim();
                            var t1 = childDivs.eq(1).text().trim();
                            if (isNumericText(t0) && !isNumericText(t1)) target = childDivs.eq(1);
                            else if (isNumericText(t1) && !isNumericText(t0)) target = childDivs.eq(0);
                            else target = childDivs.eq(1);
                        }
                    }

                    if (target.length) {
                        var iconWrap = $('<div></div>');
                        iconWrap.addClass('maxsm-icon-container');
                        iconWrap.html(svg);
                        if (!target.data('original-html')) target.data('original-html', target.html());
                        target.html(iconWrap);
                        target.addClass('rate--icon');
                    }
                } else {
                    var t = Element.find('.rate--icon');
                    if (t.length && t.data('original-html')) {
                        t.html(t.data('original-html'));
                        t.removeClass('rate--icon');
                        t.removeData('original-html');
                    }
                }
            }

            apply('rate--imdb', imdb_svg);
            apply('rate--kp', kp_svg);
            apply('rate--tmdb', tmdb_svg);
            apply('rate--oscars', awards_svg);
            apply('rate--emmy', awards_svg);
            apply('rate--awards', awards_svg);
            apply('rate--rt', rt_svg);
            apply('rate--mc', mc_svg);
            apply('rate--avg', avg_svg);
        }

        function updateQualityElement(text, render) {
            if (!render) return;
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length) return;
            var element = $('.full-start__status.maxsm-quality', render);
            if (element.length) element.text(text);
            else {
                var div = document.createElement('div');
                div.className = 'full-start__status maxsm-quality';
                div.textContent = text;
                rateLine.append(div);
            }
        }

        function syncQualityFromJacred(card, render) {
            if (!render) return;
            if (localStorage.getItem('maxsm_ratings_quality') !== 'true') return;
            var type = getCardType(card);
            if (type === 'tv' && localStorage.getItem('maxsm_ratings_quality_tv') === 'false') return;
            if (!window.FLIXIO_GET_BEST_JACRED) return;
            updateQualityElement('...', render);
            window.FLIXIO_GET_BEST_JACRED(card, function (data) {
                if (!data || data.empty) return;
                var resText = data.resolution || '';
                if (resText === 'FHD') resText = '1080p';
                else if (resText === 'HD') resText = '720p';
                else if (resText === '4K') resText = '4K';
                else if (resText === '2K') resText = '2K';
                if (!resText) return;
                if (data.hdr) resText = resText + (data.dolbyVision ? ' DV' : ' HDR');
                updateQualityElement(resText, render);
            });
        }

        function fetchAdditionalRatings(card, render) {
            if (!render || !card || !card.id) return;
            var localCurrentCard = card.id;

            var normalizedCard = {
                id: card.id,
                tmdb: card.vote_average || null,
                kinopoisk_id: card.kinopoisk_id,
                imdb_id: card.imdb_id || card.imdb || null,
                title: card.title || card.name || '',
                original_title: card.original_title || card.original_name || '',
                type: getCardType(card),
                release_date: card.release_date || card.first_air_date || ''
            };

            var rateLine = $('.full-start-new__rate-line.applecation__ratings', render);
            if (!rateLine.length) {
                var insertPoint = $('.applecation__meta', render);
                if (!insertPoint.length) insertPoint = $('.full-start-new__title', render);
                if (!insertPoint.length) insertPoint = $(render);

                rateLine = $('<div class="full-start-new__rate-line applecation__ratings show"></div>');
                rateLine.append('<div class="full-start__rate rate--tmdb"><div></div><div class="source--name">TMDB</div></div>');
                rateLine.append('<div class="full-start__rate rate--imdb hide"><div></div><div class="source--name">IMDb</div></div>');
                rateLine.append('<div class="full-start__rate rate--kp hide"><div></div><div class="source--name">Кинопоиск</div></div>');
                rateLine.append('<div class="full-start__status hide"></div>');
                rateLine.insertAfter(insertPoint);
            }
            else if (!$('.rate--tmdb', rateLine).length) {
                rateLine.append('<div class="full-start__rate rate--tmdb"><div></div><div class="source--name">TMDB</div></div>');
                rateLine.append('<div class="full-start__rate rate--imdb hide"><div></div><div class="source--name">IMDb</div></div>');
                rateLine.append('<div class="full-start__rate rate--kp hide"><div></div><div class="source--name">Кинопоиск</div></div>');
                rateLine.append('<div class="full-start__status hide"></div>');
            }

            if (rateLine.length) {
                var tmdbEl = $('.rate--tmdb', render);
                if (tmdbEl.length && normalizedCard.tmdb && !isNaN(normalizedCard.tmdb)) {
                    tmdbEl.removeClass('hide').find('> div').eq(0).text(parseFloat(normalizedCard.tmdb).toFixed(1));
                }
                rateLine.addClass('done');
                addLoadingAnimation(render);
            }

            syncQualityFromJacred(card, render);

            var cacheKey = normalizedCard.type + '_' + (normalizedCard.imdb_id || normalizedCard.id);
            var cachedData = getOmdbCache(cacheKey);
            var cachedKpData = getKpCache(cacheKey);
            var ratingsData = {};
            ratingsData.tmdb = normalizedCard.tmdb;

            if (cachedKpData) {
                ratingsData.kp = cachedKpData.kp;
                ratingsData.imdb_kp = cachedKpData.imdb;
            }

            if (cachedData) {
                ratingsData.rt = cachedData.rt;
                ratingsData.mc = cachedData.mc;
                ratingsData.imdb = cachedData.imdb;
                ratingsData.ageRating = cachedData.ageRating;
                ratingsData.oscars = cachedData.oscars;
                ratingsData.emmy = cachedData.emmy;
                ratingsData.awards = cachedData.awards;
            }

            renderNow();

            var pending = 0;
            function startPending() { pending++; }
            function endPending() {
                pending = Math.max(0, pending - 1);
                if (pending === 0) finalizeUI();
            }

            if (!cachedKpData) {
                startPending();
                getKPRatings(normalizedCard, getRandomToken(KP_API_KEYS), localCurrentCard, function (kpRatings) {
                    if (kpRatings) {
                        ratingsData.kp = kpRatings.kinopoisk || null;
                        ratingsData.imdb_kp = kpRatings.imdb || null;
                        saveKpCache(cacheKey, { kp: ratingsData.kp, imdb: ratingsData.imdb_kp });
                    }
                    renderNow();
                    endPending();
                });
            }

            if (!cachedData) {
                startPending();
                if (normalizedCard.imdb_id) {
                    fetchOmdbRatings(normalizedCard, localCurrentCard, function (omdbData) {
                        if (omdbData) {
                            ratingsData.rt = omdbData.rt;
                            ratingsData.mc = omdbData.mc;
                            ratingsData.imdb = omdbData.imdb;
                            ratingsData.ageRating = omdbData.ageRating;
                            ratingsData.oscars = omdbData.oscars;
                            ratingsData.emmy = omdbData.emmy;
                            ratingsData.awards = omdbData.awards;
                            saveOmdbCache(cacheKey, omdbData);
                        }
                        renderNow();
                        endPending();
                    });
                } else {
                    getImdbIdFromTmdb(normalizedCard.id, normalizedCard.type, localCurrentCard, function (newImdbId) {
                        if (newImdbId) {
                            normalizedCard.imdb_id = newImdbId;
                            cacheKey = normalizedCard.type + '_' + newImdbId;
                            fetchOmdbRatings(normalizedCard, localCurrentCard, function (omdbData) {
                                if (omdbData) {
                                    ratingsData.rt = omdbData.rt;
                                    ratingsData.mc = omdbData.mc;
                                    ratingsData.imdb = omdbData.imdb;
                                    ratingsData.ageRating = omdbData.ageRating;
                                    ratingsData.oscars = omdbData.oscars;
                                    ratingsData.emmy = omdbData.emmy;
                                    ratingsData.awards = omdbData.awards;
                                    saveOmdbCache(cacheKey, omdbData);
                                }
                                renderNow();
                                endPending();
                            });
                        } else {
                            renderNow();
                            endPending();
                        }
                    });
                }
            }

            if (pending === 0) finalizeUI();

            function renderNow() {
                try { render.data('maxsm_ratings_data', ratingsData); } catch (e) { }
                insertRatings(ratingsData.rt, ratingsData.mc, ratingsData.oscars, ratingsData.awards, ratingsData.emmy, render);
                updateHiddenElements(ratingsData, render);
                calculateAverageRating(render);
                insertIcons(render);
                reorderRateLine(render);
                $('.full-start__rate', render).off('click.maxsm-ratings-modal').on('click.maxsm-ratings-modal', function (e) {
                    e.stopPropagation();
                    showRatingsModal(render);
                });
                rateLine.css('visibility', 'visible');
            }

            function finalizeUI() {
                removeLoadingAnimation(render);
            }
        }

        function refreshActiveFullRatings() {
            try {
                var act = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
                if (!act || act.component !== 'full') return;
                var render = act.activity && act.activity.render && act.activity.render();
                if (!render) return;
                var data = render.data ? render.data('maxsm_ratings_data') : null;
                if (!data) data = {};
                insertRatings(data.rt, data.mc, data.oscars, data.awards, data.emmy, render);
                updateHiddenElements(data, render);
                calculateAverageRating(render);
                insertIcons(render);
                reorderRateLine(render);
            } catch (e) { }
        }

        if (Lampa.SettingsApi && Lampa.SettingsApi.addComponent) {
            Lampa.SettingsApi.addComponent({ component: 'maxsm_ratings', name: (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings') : 'Рейтинг и качество'), icon: star_svg });

            var modeValue = {};
            modeValue[0] = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_mode_normal') : 'Показывать средний рейтинг';
            modeValue[1] = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_mode_simple') : 'Только средний рейтинг';
            modeValue[2] = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_mode_noavg') : 'Без среднего рейтинга';

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_mode', type: 'select', values: modeValue, default: 0 },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_mode') : 'Средний рейтинг', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_awards', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_awards') : 'Награды', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_critic', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_critic') : 'Оценки критиков', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_total', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_total') : 'Итог', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_oscars', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_oscars') : 'Оскар', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_awards', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_awards') : 'Награды', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_tmdb', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_tmdb') : 'TMDB', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_imdb', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_imdb') : 'IMDB', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_kp', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_kp') : 'Кинопоиск', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_rt', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_rt') : 'Tomatoes', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_mc', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_mc') : 'Metacritic', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_colors', type: 'trigger', default: false },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_colors') : 'Цвета', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_icons', type: 'trigger', default: false },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_icons') : 'Значки', description: '' },
                onChange: function () {
                    try {
                        var act = Lampa.Activity.active();
                        if (!act || act.component !== 'full') return;
                        var render = act.activity && act.activity.render && act.activity.render();
                        insertIcons(render);
                    } catch (e) { }
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_quality', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_quality') : 'Качество внутри карточек', description: '' },
                onChange: function () { }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_quality_inlist', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_quality_inlist') : 'Качество на карточках', description: '' },
                onChange: function (value) {
                    if (window.FLIXIO_TOGGLE_JACRED_CARD_MARKS) window.FLIXIO_TOGGLE_JACRED_CARD_MARKS(value === 'true');
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_quality_tv', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_quality_tv') : 'Качество для сериалов', description: '' },
                onChange: function () { }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_cc', type: 'button' },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_cc') : 'Очистить локальный кеш' },
                onChange: function () {
                    localStorage.removeItem(OMDB_CACHE);
                    localStorage.removeItem(KP_CACHE);
                    localStorage.removeItem(ID_MAPPING_CACHE);
                    window.location.reload();
                }
            });
        }

        if (Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('full', function (e) {
                if (e.type !== 'complite') return;
                var render = e.object && e.object.activity && e.object.activity.render && e.object.activity.render();
                var movie = e.data && e.data.movie;
                fetchAdditionalRatings(movie, render);
            });
        }

        window.maxsmRatingsPlugin = true;
    }

    function initKinoogladModule() {
        if (window.plugin_kinoohlyad_ready) return;
        window.plugin_kinoohlyad_ready = true;
        
        // Только очищаем старые каналы по умолчанию, не трогаем пользовательские
        console.log('Kinooglad: Checking for old default channels');
        
        var KINO_CHANNEL_I18N_KEYS = {};

        function getKinoChannelDisplayName(channel) {
            if (!channel || !channel.id) return channel && channel.name ? channel.name : tr('kino_channel_generic');
            var key = KINO_CHANNEL_I18N_KEYS[String(channel.id).trim()];
            if (!key) return channel.name || tr('kino_channel_generic');
            var localized = tr(key);
            return localized || channel.name || tr('kino_channel_generic');
        }

        var KinoApi = {
            proxies: [
                'https://api.codetabs.com/v1/proxy?quest=',
                'https://thingproxy.freeboard.io/fetch/',
                'https://corsproxy.io/?url=',
                'https://api.allorigins.win/raw?url=',
                'https://api.allorigins.win/get?url=',
                'https://cors.isomorphic-git.org/',
                'https://yacdn.org/proxy/'
            ],
            // Порядок: за наявністю нового відео (сортування в main()). ID відповідають @нікам.
            defaultChannels: [],
            getChannels: function () {
                var stored = Lampa.Storage.get('kino_channels', '[]');
                var channels;
                if (typeof stored === 'string') {
                    try {
                        channels = JSON.parse(stored);
                    } catch (e) {
                        return this.defaultChannels.slice();
                    }
                } else if (Array.isArray(stored)) {
                    channels = stored;
                } else {
                    return this.defaultChannels.slice();
                }
                
                if (!channels || !channels.length) return this.defaultChannels.slice();
                var seen = {};
                channels = channels.filter(function (c) {
                    var id = String(c.id).trim().toLowerCase();
                    if (seen[id]) return false;
                    seen[id] = true;
                    return true;
                });
                return channels;
            },
            saveChannels: function (channels) {
                Lampa.Storage.set('kino_channels', channels);
            },
            resolveHandleToChannelId: function (handle, callback) {
                var _this = this;
                var cleanHandle = String(handle).trim().replace(/^@/, '');
                var pageUrl = 'https://www.youtube.com/@' + encodeURIComponent(cleanHandle);
                var encodedPage = encodeURIComponent(pageUrl);
                var tried = 0;

                console.log('Kinooglad: Resolving handle @' + cleanHandle);

                function tryProxy(idx) {
                    if (idx >= _this.proxies.length) {
                        console.error('Kinooglad: All proxies failed for handle @' + cleanHandle);
                        callback(new Error('resolve_failed'));
                        return;
                    }
                    var proxy = _this.proxies[idx];
                    var url = proxy + (proxy.indexOf('corsproxy') > -1 ? pageUrl : encodedPage);
                    console.log('Kinooglad: Trying proxy ' + (idx + 1) + '/' + _this.proxies.length + ': ' + proxy);
                    
                    $.get(url).done(function (html) {
                        var str = typeof html === 'string' ? html : (html && html.contents) ? html.contents : '';
                        var m = str.match(/"externalId"\s*:\s*"(UC[\w-]{22})"/) ||
                            str.match(/"channelId"\s*:\s*"(UC[\w-]{22})"/) ||
                            str.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
                        if (m && m[1]) {
                            console.log('Kinooglad: Successfully resolved @' + cleanHandle + ' to ' + m[1]);
                            callback(null, { id: m[1], name: cleanHandle });
                        } else {
                            console.log('Kinooglad: Proxy ' + (idx + 1) + ' failed to find channel ID');
                            tryProxy(idx + 1);
                        }
                    }).fail(function (xhr, status, error) { 
                        console.log('Kinooglad: Proxy ' + (idx + 1) + ' request failed: ' + status + ' ' + error);
                        tryProxy(idx + 1); 
                    });
                }
                tryProxy(0);
            },
            resolveVideoToChannelId: function (videoId, callback) {
                var _this = this;
                var cleanId = String(videoId).trim();
                if (!cleanId) return callback(new Error('no_video_id'));

                console.log('Kinooglad: Resolving video ID ' + cleanId);

                var pageUrl = 'https://www.youtube.com/watch?v=' + encodeURIComponent(cleanId);
                var encodedPage = encodeURIComponent(pageUrl);

                function tryProxy(idx) {
                    if (idx >= _this.proxies.length) {
                        console.error('Kinooglad: All proxies failed for video ' + cleanId);
                        callback(new Error('resolve_failed'));
                        return;
                    }
                    var proxy = _this.proxies[idx];
                    var url = proxy + (proxy.indexOf('corsproxy') > -1 ? pageUrl : encodedPage);
                    console.log('Kinooglad: Trying proxy ' + (idx + 1) + '/' + _this.proxies.length + ' for video');
                    
                    $.get(url).done(function (html) {
                        var str = typeof html === 'string' ? html : (html && html.contents) ? html.contents : '';
                        var m = str.match(/"channelId"\s*:\s*"(UC[\w-]{22})"/);
                        if (m && m[1]) {
                            var nameMatch = str.match(/"ownerChannelName"\s*:\s*"(.*?)"/);
                            var name = nameMatch && nameMatch[1] ? nameMatch[1] : cleanId;
                            console.log('Kinooglad: Successfully resolved video ' + cleanId + ' to channel ' + m[1]);
                            callback(null, { id: m[1], name: name });
                        } else {
                            console.log('Kinooglad: Proxy ' + (idx + 1) + ' failed to find channel ID for video');
                            tryProxy(idx + 1);
                        }
                    }).fail(function (xhr, status, error) { 
                        console.log('Kinooglad: Proxy ' + (idx + 1) + ' request failed for video: ' + status + ' ' + error);
                        tryProxy(idx + 1); 
                    });
                }
                tryProxy(0);
            },
            fetch: function (channel, oncomplite, onerror, page) {
                var _this = this;
                var id = String(channel.id).trim();
                var cacheKey = 'channel_' + id + (page ? '_page_' + page : '');
                var pageNum = page || 1;
                
                // Используем YouTube API для получения большего количества видео
                var apiKey = 'AIzaSyAIo_p64MBiOmXtBg-AlbdGhonDYEP1LPI'; // Правильный YouTube Data API v3 ключ
                return this.fetchWithYouTubeAPI(channel.id, apiKey, pageNum, oncomplite, onerror, cacheKey);
            },
            
            fetchWithYouTubeAPI: function(channelId, apiKey, page, oncomplite, onerror, cacheKey) {
                var _this = this;
                var cacheObj = _this.cache;
                var pageNum = page || 1;
                
                // Проверяем кэш
                if (cacheObj) {
                    var cached = cacheObj.get(cacheKey);
                    if (cached) {
                        console.log('Kinooglad: YouTube API cache hit for page ' + pageNum);
                        oncomplite(cached);
                        return;
                    }
                }
                
                // Возвращаемся к RSS методу как запасной вариант - он более надежный
                return this.fetchWithRSS({id: channelId, name: 'Channel'}, pageNum, oncomplite, onerror, cacheKey);
            },
            
            fetchWithRSS: function(channel, pageNum, oncomplite, onerror, cacheKey) {
                var _this = this;
                var id = String(channel.id).trim();
                var page = pageNum || 1;
                var cacheKey = cacheKey || ('channel_' + id + (page ? '_page_' + page : ''));
                
                // Проверяем что кэш существует
                if (!_this.cache) {
                    console.log('Kinooglad: Cache object not found, skipping cache');
                    var isChannelId = /^UC[\w-]{22}$/.test(id);
                    var feedUrl = isChannelId 
                        ? 'https://www.youtube.com/feeds/videos.xml?channel_id=' + id
                        : 'https://www.youtube.com/feeds/videos.xml?user=' + id.replace(/^@/, '');
                    
                    // Загружаем напрямую без кэша
                    var encodedUrl = encodeURIComponent(feedUrl);
                    function tryDirectFetch(index) {
                        if (index >= _this.proxies.length) {
                            console.log('Kinooglad: All proxies failed for ' + channel.name);
                            onerror();
                            return;
                        }
                        var currentProxy = _this.proxies[index];
                        var fetchUrl = currentProxy.indexOf('quest=') > -1 
                            ? currentProxy + encodedUrl 
                            : currentProxy.indexOf('fetch/') > -1 
                                ? currentProxy + encodedUrl
                                : currentProxy + encodedUrl;
                        console.log('Kinooglad: Trying proxy ' + (index + 1) + '/' + _this.proxies.length + ' for ' + channel.name + ' (no cache)');
                        
                        $.get(fetchUrl, function (data) {
                            var raw = typeof data === 'string' ? data : (data && typeof data.contents === 'string') ? data.contents : '';
                            var str = (raw || (typeof data === 'string' ? data : '')).trim();
                            if (str && str.indexOf('<?xml') !== 0 && str.indexOf('<feed') !== 0) {
                                if (str.indexOf('<!DOCTYPE') !== -1 || str.indexOf('<html') !== -1) {
                                    return tryDirectFetch(index + 1);
                                }
                            }
                            var items = [];
                            var xml;
                            try {
                                xml = typeof data === 'string' ? $.parseXML(data) : (data && data.documentElement) ? data : $.parseXML(raw || String(data || ''));
                            } catch (e) {
                                return tryDirectFetch(index + 1);
                            }
                            if (!xml || !$(xml).find('entry').length) {
                                return tryDirectFetch(index + 1);
                            }
                            $(xml).find('entry').each(function () {
                                var $el = $(this);
                                var mediaGroup = $el.find('media\\:group, group');
                                var thumb = mediaGroup.find('media\\:thumbnail, thumbnail').attr('url');
                                var videoId = $el.find('yt\\:videoId, videoId').text();
                                var link = $el.find('link').attr('href');
                                var title = $el.find('title').text();
                                if (link && link.indexOf('/shorts/') > -1) return;
                                if (title && title.toLowerCase().indexOf('#shorts') > -1) return;
                                items.push({
                                    title: title,
                                    img: thumb,
                                    video_id: videoId,
                                    release_date: ($el.find('published').text() || '').split('T')[0],
                                    vote_average: 0
                                });
                            });
                            
                            // Для пагинации: показываем все видео из RSS (обычно ~15)
                            var startIndex = (page - 1) * 15;
                            var endIndex = startIndex + 15;
                            var paginatedItems = items.slice(startIndex, endIndex);
                            
                            if (paginatedItems.length) {
                                console.log('Kinooglad: Successfully loaded ' + paginatedItems.length + ' videos for ' + channel.name + ' (page ' + page + ')');
                                console.log('Kinooglad: Total RSS items: ' + items.length + ', showing range ' + startIndex + ' to ' + endIndex);
                                oncomplite(paginatedItems);
                            } else {
                                tryDirectFetch(index + 1);
                            }
                        }).fail(function () {
                            tryDirectFetch(index + 1);
                        });
                    }
                    tryDirectFetch(0);
                    return;
                }
                
                var cacheObj = _this.cache; // Сохраняем ссылку на кэш
                
                // Проверяем кэш сначала
                var cached = cacheObj.get(cacheKey);
                if (cached) {
                    console.log('Kinooglad: Cache hit for ' + channel.name + ' (page ' + page + ')');
                    oncomplite(cached);
                    return;
                }

                var isChannelId = /^UC[\w-]{22}$/.test(id);

                function doFetch(feedUrl) {
                    var url = feedUrl;
                    var encodedUrl = encodeURIComponent(url);
                    var fetchStartTime = Date.now();

                    function tryFetch(index) {
                        if (index >= _this.proxies.length) {
                            console.log('Kinoohlyad: All proxies failed for ' + channel.name);
                            onerror();
                            return;
                        }

                        var currentProxy = _this.proxies[index];
                        var fetchUrl = currentProxy.indexOf('quest=') > -1 
                            ? currentProxy + encodedUrl 
                            : currentProxy.indexOf('fetch/') > -1 
                                ? currentProxy + encodedUrl
                                : currentProxy + encodedUrl;
                        console.log('Kinooglad: Trying proxy ' + (index + 1) + '/' + _this.proxies.length + ' for ' + channel.name + ': ' + currentProxy);

                        var fetchStartTime = Date.now();
                        $.get(fetchUrl, function (data) {
                            var loadTime = Date.now() - fetchStartTime;
                            console.log('Kinooglad: Proxy ' + (index + 1) + ' responded in ' + loadTime + 'ms for ' + channel.name);
                            
                            var raw = typeof data === 'string' ? data : (data && typeof data.contents === 'string') ? data.contents : '';
                            var str = (raw || (typeof data === 'string' ? data : '')).trim();
                            if (str && str.indexOf('<?xml') !== 0 && str.indexOf('<feed') !== 0) {
                                if (str.indexOf('<!DOCTYPE') !== -1 || str.indexOf('<html') !== -1) {
                                    console.log('Kinooglad: Proxy ' + (index + 1) + ' returned HTML, trying next');
                                    return tryFetch(index + 1);
                                }
                            }
                            var items = [];
                            var xml;
                            try {
                                xml = typeof data === 'string' ? $.parseXML(data) : (data && data.documentElement) ? data : $.parseXML(raw || String(data || ''));
                            } catch (e) {
                                console.log('Kinooglad: Proxy ' + (index + 1) + ' XML parse error, trying next');
                                return tryFetch(index + 1);
                            }

                            if (!xml || !$(xml).find('entry').length) {
                                console.log('Kinooglad: Proxy ' + (index + 1) + ' no entries found, trying next');
                                return tryFetch(index + 1);
                            }

                            $(xml).find('entry').each(function () {
                                var $el = $(this);
                                var mediaGroup = $el.find('media\\:group, group');
                                var thumb = mediaGroup.find('media\\:thumbnail, thumbnail').attr('url');
                                var videoId = $el.find('yt\\:videoId, videoId').text();
                                var link = $el.find('link').attr('href');
                                var title = $el.find('title').text();

                                // Filter out Shorts
                                if (link && link.indexOf('/shorts/') > -1) return;
                                if (title && title.toLowerCase().indexOf('#shorts') > -1) return;

                                items.push({
                                    title: title,
                                    img: thumb,
                                    video_id: videoId,
                                    release_date: ($el.find('published').text() || '').split('T')[0],
                                    vote_average: 0
                                });
                            });

                            if (items.length) {
                                // Для пагинации: показываем больше видео на странице
                                var startIndex = (page - 1) * 15;
                                var endIndex = startIndex + 15;
                                var paginatedItems = items.slice(startIndex, endIndex);
                                
                                // Сохраняем в кэш на 15 минут
                                try {
                                    cacheObj.set(cacheKey, paginatedItems, 15);
                                    console.log('Kinooglad: Successfully loaded ' + paginatedItems.length + ' videos for ' + channel.name + ' via proxy ' + (index + 1) + ' (page ' + page + ')');
                                console.log('Kinooglad: Total videos in RSS feed:', items.length, '- showing page', page, 'videos', startIndex, 'to', endIndex);
                                } catch (e) {
                                    console.log('Kinooglad: Cache set error:', e);
                                }
                                oncomplite(paginatedItems);
                            } else {
                                console.log('Kinooglad: Proxy ' + (index + 1) + ' no videos found, trying next');
                                tryFetch(index + 1);
                            }
                        }).fail(function (xhr, status, error) { 
                            console.log('Kinooglad: Proxy ' + (index + 1) + ' request failed: ' + status + ' ' + error);
                            tryFetch(index + 1); 
                        });
                    }

                    tryFetch(0);
                }

                if (isChannelId) {
                    doFetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + id);
                } else {
                    _this.resolveHandleToChannelId(id, function (err, resolved) {
                        if (!err && resolved && resolved.id) {
                            var ch = _this.getChannels();
                            for (var i = 0; i < ch.length; i++) {
                                if (String(ch[i].id).trim().toLowerCase() === id.toLowerCase()) {
                                    ch[i].id = resolved.id;
                                    _this.saveChannels(ch);
                                    break;
                                }
                            }
                            doFetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + resolved.id);
                        } else {
                            doFetch('https://www.youtube.com/feeds/videos.xml?user=' + id.replace(/^@/, ''));
                        }
                    });
                }
            },
            fetchPlaylistItems: function (playlistId, oncomplite, onerror) {
                var _this = this;
                var pid = String(playlistId).trim();
                if (!pid) {
                    onerror();
                    return;
                }

                var url = 'https://www.youtube.com/feeds/videos.xml?playlist_id=' + encodeURIComponent(pid);
                var encodedUrl = encodeURIComponent(url);

                function tryFetch(index) {
                    if (index >= _this.proxies.length) {
                        onerror();
                        return;
                    }

                    var currentProxy = _this.proxies[index];
                    var fetchUrl = currentProxy.indexOf('quest=') > -1 
                        ? currentProxy + encodedUrl 
                        : currentProxy.indexOf('fetch/') > -1 
                            ? currentProxy + encodedUrl
                            : currentProxy + encodedUrl;

                    $.get(fetchUrl, function (data) {
                        var raw = typeof data === 'string' ? data : (data && typeof data.contents === 'string') ? data.contents : '';
                        var str = (raw || (typeof data === 'string' ? data : '')).trim();
                        if (str && str.indexOf('<?xml') !== 0 && str.indexOf('<feed') !== 0) {
                            if (str.indexOf('<!DOCTYPE') !== -1 || str.indexOf('<html') !== -1) {
                                return tryFetch(index + 1);
                            }
                        }
                        var items = [];
                        var xml;
                        try {
                            xml = typeof data === 'string' ? $.parseXML(data) : (data && data.documentElement) ? data : $.parseXML(raw || String(data || ''));
                        } catch (e) {
                            return tryFetch(index + 1);
                        }

                        if (!xml || !$(xml).find('entry').length) {
                            return tryFetch(index + 1);
                        }

                        $(xml).find('entry').each(function () {
                            var $el = $(this);
                            var mediaGroup = $el.find('media\\:group, group');
                            var thumb = mediaGroup.find('media\\:thumbnail, thumbnail').attr('url');
                            var videoId = $el.find('yt\\:videoId, videoId').text();
                            var link = $el.find('link').attr('href');
                            var title = $el.find('title').text();

                            if (link && link.indexOf('/shorts/') > -1) return;
                            if (title && title.toLowerCase().indexOf('#shorts') > -1) return;

                            items.push({
                                title: title,
                                img: thumb,
                                video_id: videoId,
                                release_date: ($el.find('published').text() || '').split('T')[0],
                                vote_average: 0
                            });
                        });

                        if (items.length) {
                            oncomplite(items);
                        } else {
                            tryFetch(index + 1);
                        }
                    }).fail(function () {
                        tryFetch(index + 1);
                    });
                }

                tryFetch(0);
            },
            fetchPlaylists: function (channel, oncomplite, onerror) {
                var _this = this;
                var rawId = String(channel.id).trim();
                if (!rawId) {
                    onerror();
                    return;
                }

                function handleChannelId(channelId) {
                    var pageUrl = 'https://www.youtube.com/channel/' + encodeURIComponent(channelId) + '/playlists';
                    var encodedPage = encodeURIComponent(pageUrl);

                    function tryProxy(index) {
                        if (index >= _this.proxies.length) {
                            onerror();
                            return;
                        }
                        var proxy = _this.proxies[index];
                        var url = proxy + (proxy.indexOf('corsproxy') > -1 ? pageUrl : encodedPage);
                        $.get(url).done(function (html) {
                            var str = typeof html === 'string' ? html : (html && html.contents) ? html.contents : '';
                            if (!str) {
                                tryProxy(index + 1);
                                return;
                            }

                            var playlists = [];
                            var regex = /\"playlistId\":\"(PL[\\w-]+)\"[\\s\\S]*?\"title\":\\{\"simpleText\":\"(.*?)\"\\}/g;
                            var match;
                            while ((match = regex.exec(str)) !== null) {
                                var pid = match[1];
                                var title = match[2];
                                if (!pid) continue;
                                playlists.push({ id: pid, title: title });
                            }

                            if (playlists.length) {
                                oncomplite(playlists);
                            } else {
                                tryProxy(index + 1);
                            }
                        }).fail(function () {
                            tryProxy(index + 1);
                        });
                    }

                    tryProxy(0);
                }

                if (/^UC[\w-]{22}$/.test(rawId)) {
                    handleChannelId(rawId);
                } else {
                    _this.resolveHandleToChannelId(rawId, function (err, resolved) {
                        if (!err && resolved && resolved.id) {
                            handleChannelId(resolved.id);
                        } else {
                            onerror();
                        }
                    });
                }
            },
            main: function (oncomplite, onerror) {
                var _this = this;
                var channels = this.getChannels().filter(function (c) { return c.active !== false; });

                if (!channels.length) {
                    console.log('Kinooglad: No active channels found');
                    onerror();
                    return;
                }

                console.log('Kinooglad: Loading ' + channels.length + ' channels with cache optimization');
                var startTime = Date.now();

                var maxVideosPerChannel = 15; // Увеличим до 15 видео на главной
                var timeoutMs = 7000; // 7 секунд таймаут на канал
                var completed = 0;
                var promises = channels.map(function (channel, index) {
                    return new Promise(function (resolve) {
                        var channelStartTime = Date.now();
                        console.log('Kinooglad: Starting load for channel ' + (index + 1) + '/' + channels.length + ': ' + channel.name);
                        
                        var timeout = setTimeout(function() {
                            console.log('Kinooglad: Timeout for channel ' + channel.name + ' after ' + (Date.now() - channelStartTime) + 'ms');
                            completed++;
                            resolve({ title: channel.name, channelId: channel.id, results: [] });
                        }, timeoutMs);

                        _this.fetch(channel, function (items) {
                            clearTimeout(timeout);
                            var loadTime = Date.now() - channelStartTime;
                            console.log('Kinooglad: Channel ' + channel.name + ' loaded in ' + loadTime + 'ms with ' + items.length + ' videos');
                            completed++;
                            resolve({ title: channel.name, channelId: channel.id, results: items.slice(0, maxVideosPerChannel) });
                        }, function () {
                            clearTimeout(timeout);
                            var loadTime = Date.now() - channelStartTime;
                            console.log('Kinooglad: Channel ' + channel.name + ' failed after ' + loadTime + 'ms');
                            completed++;
                            resolve({ title: channel.name, channelId: channel.id, results: [] });
                        });
                    });
                });

                Promise.all(promises).then(function (results) {
                    var totalTime = Date.now() - startTime;
                    console.log('Kinooglad: All channels loaded in ' + totalTime + 'ms');
                    
                    var withVideos = results.filter(function (res) { return res.results.length > 0; });
                    var withoutVideos = results.filter(function (res) { return res.results.length === 0; });

                    withVideos.sort(function (a, b) {
                        var dateA = a.results[0] ? new Date(a.results[0].release_date) : 0;
                        var dateB = b.results[0] ? new Date(b.results[0].release_date) : 0;
                        return dateB - dateA;
                    });

                    var sorted = withVideos.concat(withoutVideos);
                    console.log('Kinooglad: Loaded ' + withVideos.length + '/' + channels.length + ' channels successfully');
                    if (sorted.length) oncomplite(sorted);
                    else onerror();
                });
            },
            mainPlaylists: function (oncomplite, onerror) {
                var _this = this;
                var channels = this.getChannels().filter(function (c) { return c.active !== false; });

                if (!channels.length) {
                    onerror();
                    return;
                }

                var maxVideosPerPlaylist = 10;
                var maxPlaylistsPerChannel = 10;

                var channelPromises = channels.map(function (channel) {
                    return new Promise(function (resolveChannel) {
                        _this.fetchPlaylists(channel, function (playlists) {
                            if (!playlists || !playlists.length) {
                                resolveChannel([]);
                                return;
                            }

                            var limited = playlists.slice(0, maxPlaylistsPerChannel);
                            var playlistPromises = limited.map(function (pl) {
                                return new Promise(function (resolvePlaylist) {
                                    _this.fetchPlaylistItems(pl.id, function (items) {
                                        resolvePlaylist({
                                            title: channel.name + ' • ' + pl.title,
                                            channelId: channel.id,
                                            playlistId: pl.id,
                                            results: (items || []).slice(0, maxVideosPerPlaylist)
                                        });
                                    }, function () {
                                        resolvePlaylist({
                                            title: channel.name + ' • ' + pl.title,
                                            channelId: channel.id,
                                            playlistId: pl.id,
                                            results: []
                                        });
                                    });
                                });
                            });

                            Promise.all(playlistPromises).then(function (blocks) {
                                resolveChannel(blocks);
                            });
                        }, function () {
                            resolveChannel([]);
                        });
                    });
                });

                Promise.all(channelPromises).then(function (perChannelBlocks) {
                    var blocks = [];
                    perChannelBlocks.forEach(function (arr) {
                        if (Array.isArray(arr) && arr.length) blocks = blocks.concat(arr);
                    });

                    if (!blocks.length) {
                        onerror();
                        return;
                    }

                    blocks.sort(function (a, b) {
                        var dateA = a.results[0] ? new Date(a.results[0].release_date) : 0;
                        var dateB = b.results[0] ? new Date(b.results[0].release_date) : 0;
                        return dateB - dateA;
                    });

                    oncomplite(blocks);
                });
            },
            clear: function () { }
        };

        if (!window.FlixioKinoApi) {
            window.FlixioKinoApi = KinoApi;
        }

        function KinoCard(data) {
            this.build = function () {
                if (data.is_button) {
                    // Создаем специальную кнопку "Показать ещё" с той же структурой что и видеокарточка
                    this.card = $('<div class="card selector card--wide layer--render layer--visible kino-card show-more-button">' +
                        '<div class="card__view" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1.2em; height: 100%; position: relative; overflow: hidden;">' +
                            '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; color: white; font-weight: 600; font-size: 1.1em; text-shadow: 0 1px 2px rgba(0,0,0,0.3); text-align: center; width: 100%; padding: 1em; box-sizing: border-box;">' +
                                '<svg style="width: 32px; height: 32px; margin-bottom: 8px; fill: currentColor;" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>' +
                                '<div style="line-height: 1.2;">Показать ещё</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="card__title" style="display: none;"></div>' +
                        '<div class="card__date" style="display: none;"></div>' +
                    '</div>');
                } else {
                    // Обычная видеокарточка
                    this.card = Lampa.Template.get('kino_card', {});
                    this.img = this.card.find('img')[0];

                    this.card.find('.card__title').text(data.title);
                    var date = data.release_date ? data.release_date.split('-').reverse().join('.') : '';
                    this.card.find('.card__date').text(date);
                }
            };

            this.image = function () {
                if (data.is_button) {
                    // Для кнопки сразу добавляем класс загрузки
                    this.card.addClass('card--loaded');
                    return;
                }
                
                var _this = this;
                this.img.onload = function () {
                    _this.card.addClass('card--loaded');
                };
                this.img.onerror = function () {
                    _this.img.src = './img/img_broken.svg';
                };
                if (data.img) this.img.src = data.img;
            };

            this.play = function (id) {
                if (data.is_button) {
                    // Обработка нажатия на кнопку "Показать ещё"
                    // Получаем данные из глобального контекста или из родительского компонента
                    var currentData = window.currentKinoChannelData || {};
                    var currentPage = parseInt(currentData.page || 1);
                    var channelId = currentData.channel_id || currentData.channel || currentData.id;
                    var channelTitle = currentData.title || 'Канал';
                    
                    Lampa.Activity.push({
                        url: '',
                        title: channelTitle + ' - Страница ' + (currentPage + 1),
                        component: 'kino_channel_view',
                        channel_id: channelId,
                        page: currentPage + 1
                    });
                    return;
                }
                
                if (Lampa.Manifest.app_digital >= 183) {
                    var item = {
                        title: Lampa.Utils.shortText(data.title, 50),
                        id: id,
                        youtube: true,
                        url: 'https://www.youtube.com/watch?v=' + id,
                        icon: '<img class="size-youtube" src="https://img.youtube.com/vi/' + id + '/default.jpg" />',
                        template: 'selectbox_icon'
                    };
                    Lampa.Player.play(item);
                    Lampa.Player.playlist([item]);
                } else {
                    Lampa.YouTube.play(id);
                }
            };

            this.create = function () {
                var _this = this;
                this.build();
                if (!this.card) return;

                this.card.on('hover:focus', function (e) {
                    if (data.is_button) {
                        // Принудительно добавляем стили для кнопки как у видеокарточек
                        $(this).css({
                            'transform': 'scale(1.05)',
                            'box-shadow': '0 0 0 3px #fff',
                            'z-index': '10'
                        });
                    }
                    if (_this.onFocus) _this.onFocus(e.target, data);
                }).on('hover:leave', function () {
                    if (data.is_button) {
                        // Убираем стили при уходе фокуса
                        $(this).css({
                            'transform': 'scale(1)',
                            'box-shadow': 'none',
                            'z-index': ''
                        });
                    }
                }).on('hover:enter', function () {
                    _this.play(data.video_id);
                });

                this.image();
            };

            this.render = function () {
                return this.card;
            };

            this.destroy = function () {
                this.img.onerror = null;
                this.img.onload = null;
                this.img.src = '';
                this.card.remove();
                this.card = this.img = null;
            }
        }

        function KinoLine(data) {
            var content = Lampa.Template.get('items_line', { title: data.title });
            var body = content.find('.items-line__body');
            var scroll = new Lampa.Scroll({ horizontal: true, step: 250 });
            var items = [];
            var active = 0;
            var last;

            this.create = function () {
                scroll.render().find('.scroll__body').addClass('items-cards');
                content.find('.items-line__title').text(data.title);
                body.append(scroll.render());
                this.bind();
            };

            this.bind = function () {
                data.results.forEach(this.append.bind(this));
                if (data.channelId) this.appendChannelLink(data.channelId, data.title);
                
                // Добавляем кнопку "Показать еще" если есть видео
                if (data.results && data.results.length > 0) {
                    var moreBtn = $('<div class="card selector card--wide layer--render layer--visible kino-card kino-card--channel">' +
                        '<div class="card__view"><svg class="card__img" viewBox="0 0 24 24" width="100%" height="100%" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 15%; box-sizing: border-box;"><path fill="white" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2zm16-5l-4 4v-8l4 4z"/></svg></div>' +
                        '<div class="card__title">📺 Показать еще все видео</div>' +
                        '<div class="card__date" style="font-size: 0.8em; opacity: 0.7; margin-top: 0.3em;">Все видео</div></div>');
                    moreBtn.on('hover:enter', function () {
                        Lampa.Activity.push({
                            url: '',
                            title: data.title + ' - Все видео',
                            component: 'kino_channel_view',
                            channel_id: data.channelId,
                            page: 1
                        });
                    });
                    scroll.append(moreBtn);
                }
                
                Lampa.Layer.update();
            };

            this.append = function (element) {
                var _this = this;
                var card = new KinoCard(element);
                card.create();

                card.onFocus = function (target, card_data) {
                    last = target;
                    active = items.indexOf(card);
                    scroll.update(items[active].render(), true);
                    if (_this.onFocus) _this.onFocus(card_data);
                };

                scroll.append(card.render());
                items.push(card);
            };

            this.appendChannelLink = function (channelId, channelTitle) {
                var _this = this;
                var url = /^UC[\w-]{22}$/.test(channelId)
                    ? 'https://www.youtube.com/channel/' + channelId
                    : 'https://www.youtube.com/@' + channelId;
                
                // Используем переданное название канала
                var channelName = channelTitle || 'YouTube Канал';
                
                var cardEl = $('<div class="card selector card--wide layer--render layer--visible kino-card kino-card--channel">' +
                    '<div class="card__view"><svg class="card__img" viewBox="0 0 24 24" width="100%" height="100%" style="background: #FF0000; border-radius: 8px; padding: 15%; box-sizing: border-box;"><path fill="white" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>' +
                    '<div class="card__title">На канал автора</div>' +
                    '<div class="card__date" style="font-size: 0.8em; opacity: 0.7; margin-top: 0.3em;">' + channelName + '</div></div>');
                cardEl.addClass('card--loaded');
                cardEl.on('hover:enter click', function () {
                    if (Lampa.Platform.openWindow) Lampa.Platform.openWindow(url);
                    else window.open(url, '_blank');
                });
                var channelCard = { render: function () { return cardEl; }, destroy: function () { cardEl.remove(); } };
                scroll.append(cardEl);
                items.push(channelCard);
            };

            this.toggle = function () {
                Lampa.Controller.add('items_line', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(scroll.render());
                        Lampa.Controller.collectionFocus(items.length ? last : false, scroll.render());
                    },
                    right: function () {
                        Navigator.move('right');
                    },
                    left: function () {
                        Navigator.move('left');
                    },
                    down: this.onDown,
                    up: this.onUp,
                    gone: function () { },
                    back: this.onBack
                });
                Lampa.Controller.toggle('items_line');
            };

            this.render = function () {
                return content;
            };

            this.destroy = function () {
                Lampa.Arrays.destroy(items);
                scroll.destroy();
                content.remove();
                items = [];
            };
        }


        function KinoChannelView(object) {
            var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: false });
            var items = [];
            var html = $('<div></div>');
            var active = 0;
            var info;
            var last = null; // Добавляем переменную last
            
            // Устанавливаем глобальный контекст для кнопки "Показать ещё"
            window.currentKinoChannelData = object;

            this.create = function () {
                var _this = this;
                this.activity.loader(true);

                var head = $('<div class="kino-head" style="display: none;"></div>');
                head.append('<div class="kino-title" style="font-size: 2em; display: none;">' + (object.title || 'Канал') + '</div>');
                head.append('<div style="color: #90caf9; font-size: 0.9em; display: none;">Страница ' + (object.page || 1) + '</div>');

                html.append(head);

                // Загружаем видео только одного канала
                var channel = object.channel || { id: object.channel_id || object.id, name: object.title || 'Канал' };
                var page = object.page || 1;
                KinoApi.fetch(channel, function (videos) {
                    // Добавляем скролл
                    scroll.minus();
                    html.append(scroll.render());
                    
                    // Создаем отдельные карточки для каждого видео
                    videos.forEach(function(video) {
                        _this.append(video);
                    });
                    
                    // Добавляем кнопку "Показать ещё" как последнюю карточку в той же строке
                    var buttonElement = {
                        title: 'Показать ещё',
                        img: '',
                        video_id: 'show_more_button',
                        is_button: true
                    };
                    _this.append(buttonElement);
                    
                    // Добавляем информацию о количестве видео в самом конце
                    var infoText = $('<div style="text-align: center; color: #90caf9; font-size: 0.9em; margin: 1em 0; display: none;">Страница ' + page + ' - Загружено видео: ' + videos.length + ' (RSS Feed)</div>');
                    scroll.append(infoText);
                    
                    // Инициализируем контроллеры
                    _this.activity.toggle();
                    _this.activity.loader(false);
                }, function () {
                    _this.empty();
                }, page);
            };

            this.build = function (data) {
                var _this = this;
                scroll.minus();
                html.append(scroll.render());
                data.forEach(function (element) {
                    _this.append(element);
                });
                this.activity.toggle();
            };

            this.append = function (element) {
                var _this = this;
                var card = new KinoCard(element);
                card.create();

                card.onFocus = function (target, card_data) {
                    last = target;
                    active = items.indexOf(card);
                    scroll.update(items[active].render(), true);
                    if (_this.onFocus) _this.onFocus(card_data);
                };

                scroll.append(card.render());
                items.push(card);
            };

            this.toggle = function () {
                Lampa.Controller.add('items_line', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(scroll.render());
                        Lampa.Controller.collectionFocus(items[active].render(), false);
                    },
                    up: function () {
                        if (_this.onUp) _this.onUp();
                        else Lampa.Controller.toggle('head');
                    },
                    down: function () {
                        Lampa.Controller.toggle('menu');
                    },
                    right: function () {
                        if (active < items.length - 1) {
                            active++;
                            scroll.update(items[active].render(), true);
                        } else if (_this.onRight) _this.onRight();
                    },
                    left: function () {
                        if (active > 0) {
                            active--;
                            scroll.update(items[active].render(), true);
                        } else if (_this.onLeft) _this.onLeft();
                    },
                    back: function () {
                        if (_this.onBack) _this.onBack();
                        else Lampa.Controller.toggle('menu');
                    }
                });

                Lampa.Controller.toggle('items_line');
            };

            this.start = function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(html);
                        if (last) {
                            Lampa.Controller.collectionFocus(last, true);
                        } else if (items.length > 0) {
                            Lampa.Controller.collectionFocus(items[0].render(), true);
                        }
                    },
                    left: function () {
                        if (Navigator.canmove('left')) Lampa.Controller.toggle('menu');
                        else Lampa.Controller.toggle('content');
                    },
                    right: function () {
                        Navigator.move('right');
                    },
                    up: function () {
                        if (Navigator.canmove('up')) Navigator.move('up');
                        else Lampa.Controller.toggle('head');
                    },
                    down: function () {
                        if (Navigator.canmove('down')) Navigator.move('down');
                        else Lampa.Controller.toggle('menu');
                    },
                    back: function () {
                        Lampa.Activity.backward();
                    }
                });

                Lampa.Controller.toggle('content');
            };

            this.render = function () {
                return html;
            };

            this.destroy = function () {
                scroll.destroy();
                html.remove();
                items = [];
            };
        }

        function KinoComponent(object) {
            var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
            var items = [];
            var html = $('<div></div>');
            var active = 0;
            var info;

            this.create = function () {
                var _this = this;
                this.activity.loader(true);

                var head = $('<div class="kino-head" style="/* padding: 1.5em 2em; */ display: flex; justify-content: space-between; align-items: center;"></div>');
                // head.append('<div class="kino-title" style="font-size: 2em;">Кіноогляд</div>');

                html.append(head);

                // Загружаем все каналы (только стандартное поведение)
                KinoApi.main(function (data) {
                    _this.build(data);
                    _this.activity.loader(false);
                }, function () {
                    _this.empty();
                    _this.activity.loader(false);
                });
                return this.render();
            };

            this.empty = function () {
                var empty = new Lampa.Empty();
                html.append(empty.render());
                this.start = empty.start.bind(empty);
                this.activity.toggle();
            };

            this.build = function (data) {
                var _this = this;
                scroll.minus();
                html.append(scroll.render());
                data.forEach(function (element) {
                    _this.append(element);
                });
                this.activity.toggle();
            };

            this.append = function (element) {
                var item = new KinoLine(element);
                item.create();
                item.onDown = this.down.bind(this);
                item.onUp = this.up.bind(this);
                item.onBack = this.back.bind(this);
                item.onFocus = function (data) { };
                scroll.append(item.render());
                items.push(item);
            };

            this.back = function () {
                Lampa.Activity.backward();
            };

            this.down = function () {
                active++;
                active = Math.min(active, items.length - 1);
                items[active].toggle();
                scroll.update(items[active].render());
            };

            this.up = function () {
                active--;
                if (active < 0) {
                    active = 0;
                    Lampa.Controller.toggle('head');
                } else {
                    items[active].toggle();
                }
                scroll.update(items[active].render());
            };

            this.start = function () {
                var _this = this;
                if (Lampa.Activity.active().activity !== this.activity) return;
                Lampa.Controller.add('content', {
                    toggle: function () {
                        if (items.length) {
                            items[active].toggle();
                        }
                    },
                    left: function () {
                        if (Navigator.canmove('left')) Navigator.move('left');
                        else Lampa.Controller.toggle('menu');
                    },
                    right: function () {
                        Navigator.move('right');
                    },
                    up: function () {
                        if (Navigator.canmove('up')) Navigator.move('up');
                        else Lampa.Controller.toggle('head');
                    },
                    down: function () {
                        if (items.length) {
                            items[active].toggle();
                        }
                    },
                    back: this.back
                });
                Lampa.Controller.toggle('content');
            };

            this.pause = function () { };
            this.stop = function () { };
            this.render = function () {
                return html;
            };
            this.destroy = function () {
                Lampa.Arrays.destroy(items);
                scroll.destroy();
                html.remove();
                items = [];
            };
        }

        function startPlugin() {
            window.plugin_kinoohlyad_ready = true;
            Lampa.Component.add('kinoohlyad_view', KinoComponent);
            Lampa.Component.add('kino_channel_view', KinoChannelView);

            if (Lampa.SettingsApi && Lampa.SettingsApi.addParam) {
                function parseChannelInput(input) {
                    var s = (input || '').trim();
                    if (!s) return null;
                    var m = s.match(/youtube\.com\/channel\/(UC[\w-]{22})/i) || s.match(/(?:^|\s)(UC[\w-]{22})(?:\s|$)/);
                    if (m) return { id: m[1], name: tr('kino_channel_generic') };
                    m = s.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
                    if (m) return { id: 'vid:' + m[1], name: tr('kino_channel_generic') };
                    m = s.match(/(?:youtube\.com\/)?@([\w.-]+)/i) || s.match(/^@?([\w.-]+)$/);
                    if (m) return { id: m[1], name: m[1] };
                    if (/^UC[\w-]{22}$/.test(s)) return { id: s, name: tr('kino_channel_generic') };
                    return null;
                }

                function showChannelMessage(message, isError = false) {
                    if (Lampa.Noty) {
                        Lampa.Noty.show(message, isError ? 'error' : 'info');
                    } else {
                        console.log('Kinooglad:', message);
                    }
                }

        // Додаємо візуальний розділювач у налаштуваннях Ліхтаря
                Lampa.SettingsApi.addParam({
                    component: 'flixio_plugin',
                    param: { type: 'title' },
                    field: { name: tr('kino_settings_title') }
                });

                // Добавляем пункт "Кинообзор" перед "Добавить канал"
                Lampa.SettingsApi.addParam({
                    component: 'flixio_plugin',
                    param: { name: 'flixio_kinooglad_enabled', type: 'trigger', default: true },
                    field: { name: tr('settings_kinooglad_name'), description: tr('settings_kinooglad_desc') }
                });

                Lampa.SettingsApi.addParam({
                    component: 'flixio_plugin',
                    param: { name: 'kinooglad_add_channel', type: 'button' },
                    field: { name: tr('kino_add_channel_name'), description: tr('kino_add_channel_desc') },
                    onChange: function () {
                        Lampa.Input.edit({ title: tr('kino_add_channel_input'), value: '', free: true, nosave: true }, function (value) {
                            var parsed = parseChannelInput(value);
                            if (!parsed) {
                                showChannelMessage('Неверный формат ввода. Используйте @имя, ID канала UC... или ссылку YouTube', true);
                                return;
                            }
                            var ch = KinoApi.getChannels();
                            var rawId = String(parsed.id).trim();
                            var idNorm = rawId.toLowerCase();
                            if (ch.some(function (c) { return String(c.id).trim().toLowerCase() === idNorm; })) {
                                showChannelMessage('Канал уже добавлен', true);
                                return;
                            }
                            var isUc = /^UC[\w-]{22}$/.test(rawId);
                            if (isUc) {
                                ch.push({ name: parsed.name, id: parsed.id, active: true });
                                KinoApi.saveChannels(ch);
                                if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                showChannelMessage('Канал успешно добавлен');
                                return;
                            }
                            if (rawId.indexOf('vid:') === 0) {
                                showChannelMessage('Поиск канала по видео...');
                                var videoId = rawId.slice(4);
                                KinoApi.resolveVideoToChannelId(videoId, function (err, resolved) {
                                    if (!err && resolved && resolved.id) {
                                        var existsById = ch.some(function (c) { return String(c.id).trim().toLowerCase() === String(resolved.id).trim().toLowerCase(); });
                                        if (!existsById) {
                                            ch.push({ name: resolved.name || parsed.name, id: resolved.id, active: true });
                                            showChannelMessage('Канал успешно добавлен');
                                        } else {
                                            showChannelMessage('Канал уже добавлен', true);
                                        }
                                    } else {
                                        showChannelMessage('Не удалось найти канал по видео', true);
                                    }
                                    KinoApi.saveChannels(ch);
                                    if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                });
                            } else {
                                showChannelMessage('Поиск канала...');
                                KinoApi.resolveHandleToChannelId(rawId, function (err, resolved) {
                                    if (!err && resolved && resolved.id) {
                                        var exists = ch.some(function (c) { return String(c.id).trim() === resolved.id; });
                                        if (!exists) {
                                            ch.push({ name: resolved.name || parsed.name, id: resolved.id, active: true });
                                            showChannelMessage('Канал успешно добавлен');
                                        } else {
                                            showChannelMessage('Канал уже добавлен', true);
                                        }
                                    } else {
                                        showChannelMessage('Не удалось найти канал. Проверьте правильность @имени или попробуйте ID канала', true);
                                        ch.push({ name: parsed.name, id: parsed.id, active: true });
                                    }
                                    KinoApi.saveChannels(ch);
                                    if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                });
                            }
                        });
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'flixio_plugin',
                    param: { name: 'kinooglad_reset', type: 'button' },
                    field: { name: tr('kino_reset_name'), description: tr('kino_reset_desc') },
                    onChange: function () {
                        KinoApi.saveChannels(KinoApi.defaultChannels);
                        if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                    }
                });

                var KINO_MAX_CHANNELS = 50;
                for (var ci = 0; ci < KINO_MAX_CHANNELS; ci++) {
                    (function (idx) {
                        Lampa.SettingsApi.addParam({
                            component: 'flixio_plugin',
                            param: { name: 'kinooglad_ch_' + idx, type: 'button' },
                            field: { name: '—' },
                            onRender: function (item) {
                                var ch = KinoApi.getChannels()[idx];
                                if (!ch) { item.hide(); return; }
                                item.show();
                                item.find('.settings-param__name').text(getKinoChannelDisplayName(ch));
                                if (!item.find('.settings-param__value').length) item.append('<div class="settings-param__value"></div>');
                                item.find('.settings-param__value').text(ch.active !== false ? tr('kino_channel_enabled') : tr('kino_channel_disabled'));
                            },
                            onChange: function () {
                                var ch = KinoApi.getChannels();
                                if (ch[idx]) {
                                    ch[idx].active = (ch[idx].active === false);
                                    KinoApi.saveChannels(ch);
                                    var scrollWrap = document.querySelector('.activity .scroll') || document.querySelector('.scroll');
                                    var scrollTop = scrollWrap ? scrollWrap.scrollTop : 0;
                                    if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                    setTimeout(function () {
                                        if (scrollWrap) scrollWrap.scrollTop = scrollTop;
                                    }, 80);
                                }
                            }
                        });

                        Lampa.SettingsApi.addParam({
                            component: 'flixio_plugin',
                            param: { name: 'kinooglad_ch_' + idx + '_delete', type: 'button' },
                            field: { name: tr('kino_channel_delete_btn') },
                            onRender: function (item) {
                                var ch = KinoApi.getChannels()[idx];
                                if (!ch) { item.hide(); return; }
                                item.show();
                                // Добавляем имя канала к названию кнопки удаления
                                var channelName = getKinoChannelDisplayName(ch);
                                item.find('.settings-param__name').text('🗑️ ' + tr('kino_channel_delete_btn') + ': ' + channelName);
                            },
                            onChange: function () {
                                var channels = KinoApi.getChannels();
                                if (!channels[idx]) return;
                                var name = channels[idx].name || tr('kino_channel_generic');
                                var confirmDelete = true;
                                if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
                                    confirmDelete = window.confirm(name + ' — ' + tr('kino_channel_delete_btn') + '?');
                                }
                                if (!confirmDelete) return;
                                channels.splice(idx, 1);
                                KinoApi.saveChannels(channels);
                                var scrollWrap = document.querySelector('.activity .scroll') || document.querySelector('.scroll');
                                var scrollTop = scrollWrap ? scrollWrap.scrollTop : 0;
                                if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                setTimeout(function () {
                                    if (scrollWrap) scrollWrap.scrollTop = scrollTop;
                                }, 80);
                            }
                        });
                    })(ci);
                }
            }

            Lampa.Template.add('kino_card', `
            <div class="card selector card--wide layer--render layer--visible kino-card">
                <div class="card__view">
                    <img src="./img/img_load.svg" class="card__img">
                    <div class="card__promo"></div>
                </div>
                <div class="card__title"></div>
                <div class="card__date" style="font-size: 0.8em; opacity: 0.7; margin-top: 0.3em;"></div>
            </div>
        `);

            $('body').append(`
            <style>
            .kino-card {
                width: calc(25% - 1em) !important;
                min-width: 18em !important;
                max-width: 22em !important;
                margin: 0 1em 1em 0 !important;
                aspect-ratio: 16/9;
                display: inline-block !important;
                vertical-align: top;
            }
            @media (max-width: 768px) {
                .kino-card {
                    width: calc(50% - 1em) !important;
                    min-width: 14em !important;
                    max-width: unset !important;
                }
            }
            .kino-card .card__title {
                font-size: 1em;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                line-height: 1.2;
                padding: 0 0.2em;
            }
            .kino-card .card__view {
                padding-bottom: 56.25% !important;
            }
            .kino-card .card__img {
                object-fit: cover !important;
                height: 100% !important;
                border-radius: 0.3em;
            }
            .kino-card .card__date {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding: 0 0.2em;
            }
            .kino-settings:focus, .kino-settings.focus {
                background: #fff !important;
                color: #000 !important;
            }
            .kino-settings-screen {
                padding: 1.5em 2em 3em;
                max-width: 40em;
            }
            .kino-settings__wrap { }
            .kino-settings__title {
                display: block;
                font-size: 1.5em;
                font-weight: 600;
                margin-bottom: 1.2em;
                color: inherit;
            }
            .kino-settings__subtitle {
                display: block;
                font-size: 0.95em;
                opacity: 0.85;
                margin: 1.2em 0 0.6em;
                padding-top: 0.8em;
                border-top: 1px solid rgba(255,255,255,0.15);
            }
            .kino-settings__row {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 0.25em;
                padding: 0.85em 1em;
                margin-bottom: 0.4em;
                border-radius: 0.5em;
                background: rgba(255,255,255,0.06);
                min-height: 3em;
                box-sizing: border-box;
            }
            .kino-settings__row.selector:hover,
            .kino-settings__row.selector.focus {
                background: rgba(255,255,255,0.12);
            }
            .kino-settings__row--channel {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 1em;
            }
            .kino-settings__row--off {
                opacity: 0.6;
            }
            .kino-settings__label {
                font-size: 1em;
                font-weight: 500;
            }
            .kino-settings__hint {
                font-size: 0.85em;
                opacity: 0.8;
            }
            .kino-settings__channel-name {
                flex: 1;
                min-width: 0;
                font-size: 1em;
            }
            .kino-settings__channel-status {
                flex-shrink: 0;
                font-size: 0.9em;
                opacity: 0.9;
            }
            .kino-card--channel .card__title { font-style: italic; }
            </style>
        `);

            function addMenu() {
                var getCurrentTitle = function () {
                    var title = tr('kino_menu_title');
                    try {
                        var channels = KinoApi.getChannels().filter(function (c) { return c.active !== false; });
                        if (channels.length === 1 && channels[0].name) {
                            title = channels[0].name;
                        }
                    } catch (e) { }
                    return title;
                };

                var action = function () {
                    Lampa.Activity.push({
                        url: '',
                        title: getCurrentTitle(),
                        component: 'kinoohlyad_view',
                        page: 1
                    });
                };

                var btnTitle = getCurrentTitle();
                var btn = $('<li class="menu__item selector" data-action="kinoohlyad"><div class="menu__ico"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="none"><circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="1.5"/><path d="M8 8h8v2H8V8zm0 4h6v2H8v-2zm0 4h8v2H8v-2z" fill="white"/><circle cx="3" cy="3" r="1" fill="white" opacity="0.6"/><circle cx="21" cy="3" r="1" fill="white" opacity="0.6"/><circle cx="3" cy="21" r="1" fill="white" opacity="0.6"/><circle cx="21" cy="21" r="1" fill="white" opacity="0.6"/><circle cx="12" cy="1" r="1" fill="white" opacity="0.7"/><circle cx="12" cy="23" r="1" fill="white" opacity="0.7"/><circle cx="1" cy="12" r="1" fill="white" opacity="0.7"/><circle cx="23" cy="12" r="1" fill="white" opacity="0.7"/></svg></div><div class="menu__text">' + btnTitle + '</div></li>');

                btn.on('hover:enter click', action);

                $('.menu .menu__list').eq(0).append(btn);
            }

            function addSettings() {
                // Пункт «Кіноогляд» і панель з кнопкою реєструються в setupKinoogladSettings() через SettingsApi (як Ліхтар).
                // Тут лише перевірка увімкнення плагіна для меню та панелі.
            }

            var kinoEnabled = Lampa.Storage.get('flixio_kinooglad_enabled', true);
            console.log('Kinooglad: Plugin enabled:', kinoEnabled);
            
            if (kinoEnabled) {
                if (window.appready) {
                    addMenu();
                    addSettings();
                } else {
                    Lampa.Listener.follow('app', function (e) {
                        if (e.type == 'ready') {
                            addMenu();
                            addSettings();
                        }
                    });
                }
            }
        }

        startPlugin();
    }
    // =================================================================
    // INIT FUNCTION
    // =================================================================
    function init() {
        // Settings panel
        setupSettings();

        // Register Components
        Lampa.Component.add('studios_main', StudiosMain);
        Lampa.Component.add('studios_view', StudiosView);
        Lampa.Component.add('ukrainian_feed', UkrainianFeedMain);
        Lampa.Component.add('polish_feed', PolishFeedMain);
        Lampa.Component.add('russian_feed', RussianFeedMain);
        FlixioStudioSubscription.init();

        addStyles();

        overrideApi();

        if (Lampa.Storage.get('flixio_row_hero', true)) {
            addHeroRow();
        }
        removeShotsSection();

        if (Lampa.Storage.get('flixio_section_streamings', true)) {
            addStudioRow();
        }

        if (Lampa.Storage.get('flixio_section_mood', true)) {
            addMoodRow();
        }

        if (Lampa.Storage.get('flixio_row_ru_feed', true)) {
            addRussianContentRow();
        }
        if (Lampa.Storage.get('flixio_row_ua_feed', true)) {
            addUkrainianContentRow();
        }
        if (Lampa.Storage.get('flixio_row_en_feed', true)) {
            addEnglishContentRow();
        }
        if (Lampa.Storage.get('flixio_row_pl_feed', true)) {
            addPolishContentRow();
        }

        addServiceRows();

        // Start dynamic title modifier for icons
        modifyServiceTitles();

        initKinoogladModule();

        // Initial Focus and Styling
        setTimeout(function () {
            var heroCard = document.querySelector('.hero-banner');
            if (heroCard) {
                heroCard.style.width = '85vw';
                heroCard.style.marginRight = '1.5em';
            }

            var studioCard = $('.card--studio');
            if (studioCard.length) {
                if (Lampa.Controller.enabled().name === 'main') {
                    Lampa.Controller.collectionFocus(studioCard[0], $('.scroll__content').eq(1)[0]);
                }
            }
        }, 1000);
    }

    function initAppleTvFullCardBuiltIn() {
        if (window.FLIXIO_APPLETV_BUILTIN) return;
        window.FLIXIO_APPLETV_BUILTIN = true;
        if (!Lampa.Template || !Lampa.Template.add) return;

        if (typeof Lampa.Storage.get('applecation_show_ratings') === 'undefined') Lampa.Storage.set('applecation_show_ratings', false);
        if (typeof Lampa.Storage.get('applecation_ratings_position') === 'undefined') Lampa.Storage.set('applecation_ratings_position', 'card');

        var ratings_position = Lampa.Storage.get('applecation_ratings_position', 'card');
        var ratings_html = '<div class="full-start-new__rate-line applecation__ratings show">' +
            '<div class="full-start__rate rate--tmdb"><div></div><div class="source--name">TMDB</div></div>' +
            '<div class="full-start__rate rate--imdb hide"><div></div><div class="source--name">IMDb</div></div>' +
            '<div class="full-start__rate rate--kp hide"><div></div><div class="source--name">Кинопоиск</div></div>' +
            '<div class="full-start__status hide"></div>' +
            '</div>';

        var full_start_new_html = `<div class="full-start-new applecation">\n        <div class="full-start-new__body">\n            <div class="full-start-new__left hide">\n                <div class="full-start-new__poster">\n                    <img class="full-start-new__img full--poster" />\n                </div>\n            </div>\n\n            <div class="full-start-new__right">\n                <div class="applecation__left">\n                    <div class="applecation__logo"></div>\n                    \n                    <div class="applecation__content-wrapper">\n                        <div class="full-start-new__title" style="display: none;">{title}</div>\n                        \n                        <div class="applecation__meta">\n                            <div class="applecation__meta-left">\n                                <span class="applecation__network"></span>\n                                <span class="applecation__meta-text"></span>\n                                <div class="full-start__pg hide"></div>\n                            </div>\n                        </div>\n                        \n                        ${"card"===ratings_position?ratings_html:""}\n                        \n                        <div class="applecation__description-wrapper">\n                            <div class="applecation__description"></div>\n                        </div>\n                        <div class="applecation__info"></div>\n                    </div>\n                    \n                    \x3c!-- Скрытые оригинальные элементы --\x3e\n                    <div class="full-start-new__head" style="display: none;"></div>\n                    <div class="full-start-new__details" style="display: none;"></div>\n\n                    <div class="full-start-new__buttons">\n                        <div class="full-start__button selector button--play">\n                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>\n                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>\n                            </svg>\n                            <span>#{title_watch}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--book">\n                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n                            <span>#{settings_input_links}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--reaction">\n                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>\n                                <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>\n                            </svg>\n                            <span>#{title_reactions}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--subscribe hide">\n                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>\n                                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n                            <span>#{title_subscribe}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--options">\n                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>\n                            </svg>\n                        </div>\n                    </div>\n                </div>\n\n                <div class="applecation__right">\n                    <div class="full-start-new__reactions selector">\n                        <div>#{reactions_none}</div>\n                    </div>\n                    \n                    ${"corner"===ratings_position?ratings_html:""}\n\n                    \x3c!-- Скрытый элемент для совместимости (предотвращает выход реакций за экран) --\x3e\n                    <div class="full-start-new__rate-line">\n                        <div class="full-start__status hide"></div>\n                    </div>\n                    \n                    \x3c!-- Пустой маркер для предотвращения вставки элементов от modss.js --\x3e\n                    <div class="rating--modss" style="display: none;"></div>\n                </div>\n            </div>\n        </div>\n\n        <div class="hide buttons--container">\n            <div class="full-start__button view--torrent hide">\n                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">\n                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>\n                </svg>\n                <span>#{full_torrents}</span>\n            </div>\n\n            <div class="full-start__button selector view--trailer">\n                <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"></path>\n                </svg>\n                <span>#{full_trailers}</span>\n            </div>\n        </div>\n    </div>`;

        Lampa.Template.add('full_start_new', full_start_new_html);

        Lampa.Template.add('applecation_overlay', '\n            <div class="applecation-description-overlay">\n                <div class="applecation-description-overlay__bg"></div>\n                <div class="applecation-description-overlay__content selector">\n                    <div class="applecation-description-overlay__logo"></div>\n                    <div class="applecation-description-overlay__title">{title}</div>\n                    <div class="applecation-description-overlay__text">{text}</div>\n                    <div class="applecation-description-overlay__details">\n                        <div class="applecation-description-overlay__info">\n                            <div class="applecation-description-overlay__info-name">#{full_date_of_release}</div>\n                            <div class="applecation-description-overlay__info-body">{relise}</div>\n                        </div>\n                        <div class="applecation-description-overlay__info applecation--budget">\n                            <div class="applecation-description-overlay__info-name">#{full_budget}</div>\n                            <div class="applecation-description-overlay__info-body">{budget}</div>\n                        </div>\n                        <div class="applecation-description-overlay__info applecation--countries">\n                            <div class="applecation-description-overlay__info-name">#{full_countries}</div>\n                            <div class="applecation-description-overlay__info-body">{countries}</div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ');

        Lampa.Template.add('full_episode', '<div class="full-episode selector layer--visible">\n            <div class="full-episode__img">\n                <img />\n                <div class="full-episode__time">{time}</div>\n            </div>\n\n            <div class="full-episode__body">\n                <div class="full-episode__num">#{full_episode} {num}</div>\n                <div class="full-episode__name">{name}</div>\n                <div class="full-episode__overview">{overview}</div>\n                <div class="full-episode__date">{date}</div>\n            </div>\n        </div>');

        if (!document.getElementById('flixio_applecation_css')) {
            var cssRaw =
                String.raw`<style id="flixio_applecation_css">` +
                String.raw`\n\n/* Основной контейнер */\n.applecation {\n    transition: all .3s;\n}\n\n.applecation .full-start-new__body {\n    height: 80vh;\n}\n\n.applecation .full-start-new__right {\n    display: flex;\n    align-items: flex-end;\n}\n\n.applecation .full-start-new__title {\n    font-size: 2.5em;\n    font-weight: 700;\n    line-height: 1.2;\n    margin-bottom: 0.5em;\n    text-shadow: 0 0 .1em rgba(0, 0, 0, 0.3);\n}\n\n/* Логотип */\n.applecation__logo {\n    margin-bottom: 0.5em;\n    opacity: 0;\n    transform: translateY(20px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n}\n\n.applecation__logo.loaded {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.applecation__logo img {\n    display: block;\n    max-width: 35vw;\n    max-height: 180px;\n    width: auto;\n    height: auto;\n    object-fit: contain;\n    object-position: left center;\n}\n\n/* Контейнер для масштабируемого контента */\n.applecation__content-wrapper {\n    font-size: 100%;\n}\n\n/* Мета информация (Тип/Жанр/поджанр) */\n.applecation__meta {\n    display: flex;\n    align-items: center;\n    color: #fff;\n    font-size: 1.1em;\n    margin-bottom: 0.5em;\n    line-height: 1;\n    opacity: 0;\n    transform: translateY(15px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n    transition-delay: 0.05s;\n}\n\n.applecation__meta.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.applecation__meta-left {\n    display: flex;\n    align-items: center;\n    line-height: 1;\n}\n\n.applecation__network {\n    display: inline-flex;\n    align-items: center;\n    line-height: 1;\n}\n\n.applecation__network img {\n    display: block;\n    max-height: 0.8em;\n    width: auto;\n    object-fit: contain;\n    filter: brightness(0) invert(1);\n}\n\n.applecation__meta-text {\n    margin-left: 1em;\n    line-height: 1;\n}\n\n.applecation__meta .full-start__pg {\n    margin: 0 0 0 0.6em;\n    padding: 0.2em 0.5em;\n    font-size: 0.85em;\n    font-weight: 600;\n    border: 1.5px solid rgba(255, 255, 255, 0.4);\n    border-radius: 0.3em;\n    background: rgba(255, 255, 255, 0.1);\n    color: rgba(255, 255, 255, 0.9);\n    line-height: 1;\n    vertical-align: middle;\n}\n\n/* Рейтинги */\n.applecation__ratings {\n    display: flex;\n    align-items: center;\n    gap: 0.8em;\n    margin-bottom: 0.5em;\n    opacity: 0;\n    transform: translateY(15px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n    transition-delay: 0.08s;\n}\n\n.applecation__ratings.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.applecation__ratings .rate--imdb,\n.applecation__ratings .rate--kp {\n    display: flex;\n    align-items: center;\n    gap: 0.35em;\n}\n\n.applecation__ratings svg {\n    width: 1.8em;\n    height: auto;\n    flex-shrink: 0;\n    color: rgba(255, 255, 255, 0.85);\n}\n\n.applecation__ratings .rate--kp svg {\n    width: 1.5em;\n}\n\n.applecation__ratings > div > div {\n    font-size: 0.95em;\n    font-weight: 600;\n    line-height: 1;\n    color: #fff;\n}\n\n/* Управление видимостью рейтингов через настройки */\nbody.applecation--hide-ratings .applecation__ratings {\n    display: none !important;\n}\n\n/* Расположение рейтингов - в правом нижнем углу */\nbody.applecation--ratings-corner .applecation__right {\n    gap: 1em;\n}\n\nbody.applecation--ratings-corner .applecation__ratings {\n    margin-bottom: 0;\n}\n\n/* Обертка для описания */\n.applecation__description-wrapper {\n    background-color: transparent;\n    padding: 0;\n    border-radius: 1em;\n    width: fit-content;\n    opacity: 0;\n    transform: translateY(15px);\n    transition:\n        padding 0.25s ease,\n        transform 0.25s ease,\n        opacity 0.4s ease-out;\n    transition-delay: 0.1s;\n}\n\n.applecation__description-wrapper.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.applecation__description-wrapper.focus {\n  background: linear-gradient(\n    135deg,\n    rgba(255, 255, 255, 0.28),\n    rgba(255, 255, 255, 0.18)\n  );\n  padding: .15em .4em 0 .7em;\n  border-radius: 1em;\n  width: fit-content;\n\n//   box-shadow:\n//     inset 0 1px 0 rgba(255, 255, 255, 0.35),\n//     0 8px 24px rgba(0, 0, 0, 0.25);\n  box-shadow:\n    inset 0 1px 0 rgba(255, 255, 255, 0.35);\n\n  transform: scale(1.07) translateY(0);\n  \n  transition-delay: 0s;\n}\n\n/* Описание */\n.applecation__description {\n    color: rgba(255, 255, 255, 0.6);\n    font-size: 0.95em;\n    line-height: 1.5;\n    margin-bottom: 0.5em;\n    max-width: 35vw;\n    display: -webkit-box;\n    -webkit-line-clamp: 4;\n    -webkit-box-orient: vertical;\n    overflow: hidden;\n    text-overflow: ellipsis;\n}\n\n\n.focus .applecation__description {\n  color: rgba(255, 255, 255, 0.92);\n}\n\n/* Дополнительная информация (Год/длительность) */\n.applecation__info {\n    color: rgba(255, 255, 255, 0.75);\n    font-size: 1em;\n    line-height: 1.4;\n    margin-bottom: 0.5em;\n    opacity: 0;\n    transform: translateY(15px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n    transition-delay: 0.15s;\n}\n\n.applecation__info.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n/* Левая и правая части */\n.applecation__left {\n    flex-grow: 1;\n}\n\n.applecation__right {\n    display: flex;\n    align-items: center;\n    flex-shrink: 0;\n    position: relative;\n}\n\n/* Выравнивание по baseline если рейтинги в углу */\nbody.applecation--ratings-corner .applecation__right {\n    align-items: last baseline;\n}\n\n/* Реакции */\n.applecation .full-start-new__reactions {\n    margin: 0;\n    display: flex;\n    flex-direction: column-reverse;\n    align-items: flex-end;\n}\n\n.applecation .full-start-new__reactions > div {\n    align-self: flex-end;\n}\n\n.applecation .full-start-new__reactions:not(.focus) {\n    margin: 0;\n}\n\n.applecation .full-start-new__reactions:not(.focus) > div:not(:first-child) {\n    display: none;\n}\n\n/* Стили первой реакции (всегда видимой) */\n.applecation .full-start-new__reactions > div:first-child .reaction {\n    display: flex !important;\n    align-items: center !important;\n    background-color: rgba(0, 0, 0, 0) !important;\n    gap: 0 !important;\n}\n\n.applecation .full-start-new__reactions > div:first-child .reaction__icon {\n    background-color: rgba(0, 0, 0, 0.3) !important;\n    -webkit-border-radius: 5em;\n    -moz-border-radius: 5em;\n    border-radius: 5em;\n    padding: 0.5em;\n    width: 2.6em !important;\n    height: 2.6em !important;\n}\n\n.applecation .full-start-new__reactions > div:first-child .reaction__count {\n    font-size: 1.2em !important;\n    font-weight: 500 !important;\n}\n\n/* При фокусе реакции раскрываются вверх */\n.applecation .full-start-new__reactions.focus {\n    gap: 0.5em;\n}\n\n.applecation .full-start-new__reactions.focus > div {\n    display: block;\n}\n\n/* Скрываем стандартный rate-line (используется только для статуса) */\n.applecation .full-start-new__rate-line {\n    margin: 0;\n    height: 0;\n    overflow: hidden;\n    opacity: 0;\n    pointer-events: none;\n}\n\n/* Фон - переопределяем стандартную анимацию на fade */\n.full-start__background {\n    height: calc(100% + 6em);\n    left: 0 !important;\n    opacity: 0 !important;\n    transition: opacity 0.6s ease-out, filter 0.3s ease-out !important;\n    animation: none !important;\n    transform: none !important;\n    will-change: opacity, filter;\n}\n\n.full-start__background.loaded:not(.dim) {\n    opacity: 1 !important;\n}\n\n.full-start__background.dim {\n  filter: blur(30px);\n}\n\n/* Удерживаем opacity при загрузке нового фона */\n.full-start__background.loaded.applecation-animated {\n    opacity: 1 !important;\n}\n\nbody:not(.menu--open) .full-start__background {\n    mask-image: none;\n}\n\n/* Отключаем стандартную анимацию Lampa для фона */\nbody.advanced--animation:not(.no--animation) .full-start__background.loaded {\n    animation: none !important;\n}\n\n/* Скрываем статус для предотвращения выхода реакций за экран */\n.applecation .full-start__status {\n    display: none;\n}\n\n/* Оверлей для затемнения левого края */\n.applecation__overlay {\n    width: 90vw;\n    background: linear-gradient(to right, rgba(0, 0, 0, 0.792) 0%, rgba(0, 0, 0, 0.504) 25%, rgba(0, 0, 0, 0.264) 45%, rgba(0, 0, 0, 0.12) 55%, rgba(0, 0, 0, 0.043) 60%, rgba(0, 0, 0, 0) 65%);\n}\n\n/* Бейджи качества */\n.applecation__quality-badges {\n    display: inline-flex;\n    align-items: center;\n    gap: 0.4em;\n    margin-left: 0.6em;\n    opacity: 0;\n    transform: translateY(10px);\n    transition: opacity 0.3s ease-out, transform 0.3s ease-out;\n}\n\n.applecation__quality-badges.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.quality-badge {\n    display: inline-flex;\n    height: 0.8em;\n}\n\n.quality-badge svg {\n    height: 100%;\n    width: auto;\n    display: block;\n}\n\n.quality-badge--res svg {\n    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));\n}\n\n.quality-badge--dv svg,\n.quality-badge--hdr svg,\n.quality-badge--sound svg,\n.quality-badge--dub svg {\n    color: rgba(255, 255, 255, 0.85);\n    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));\n}\n\n/* Эпизоды Apple TV */\n.applecation .full-episode--small {\n    width: 20em !important;\n    height: auto !important;\n    margin-right: 1.5em !important;\n    background: none !important;\n    display: flex !important;\n    flex-direction: column !important;\n    transition: transform 0.3s !important;\n}\n\n.applecation .full-episode--small.focus {\n    transform: scale(1.02);\n}\n\n.applecation .full-episode--next .full-episode__img::after {\n  border: none !important;\n}\n\n.applecation .full-episode__img {\n    padding-bottom: 56.25% !important;\n    border-radius: 0.8em !important;\n    margin-bottom: 1em !important;\n    background-color: rgba(255,255,255,0.05) !important;\n    position: relative !important;\n    overflow: visible !important;\n}\n\n.applecation .full-episode__img img {\n    border-radius: 0.8em !important;\n    object-fit: cover !important;\n}\n\n.applecation .full-episode__time {\n    position: absolute;\n    bottom: 0.8em;\n    left: 0.8em;\n    background: rgba(0,0,0,0.6);\n    padding: 0.2em 0.5em;\n    border-radius: 0.4em;\n    font-size: 0.75em;\n    font-weight: 600;\n    color: #fff;\n    backdrop-filter: blur(5px);\n    z-index: 2;\n}\n\n.applecation .full-episode__time:empty {\n    display: none;\n}\n\n.applecation .full-episode__body {\n    position: static !important;\n    display: flex !important;\n    flex-direction: column !important;\n    background: none !important;\n    padding: 0 0.5em !important;\n    opacity: 0.6;\n    transition: opacity 0.3s;\n}\n\n.applecation .full-episode.focus .full-episode__body {\n    opacity: 1;\n}\n\n.applecation .full-episode__num {\n    font-size: 0.75em !important;\n    font-weight: 600 !important;\n    text-transform: uppercase !important;\n    color: rgba(255,255,255,0.4) !important;\n    margin-bottom: 0.2em !important;\n    letter-spacing: 0.05em !important;\n}\n\n.applecation .full-episode__name {\n    font-size: 1.1em !important;\n    font-weight: 600 !important;\n    color: #fff !important;\n    margin-bottom: 0.4em !important;\n    white-space: nowrap !important;\n    overflow: hidden !important;\n    text-overflow: ellipsis !important;\n    line-height: 1.4 !important;\n    padding-bottom: 0.1em !important;\n}\n\n.applecation .full-episode__overview {\n    font-size: 0.85em !important;\n    line-height: 1.4 !important;\n    color: rgba(255,255,255,0.5) !important;\n    display: -webkit-box !important;\n    -webkit-line-clamp: 2 !important;\n    -webkit-box-orient: vertical !important;\n    overflow: hidden !important;\n    margin-bottom: 0.6em !important;\n    height: 2.8em !important;\n}\n\n.applecation .full-episode__date {\n    font-size: 0.8em !important;\n    color: rgba(255,255,255,0.3) !important;\n}\n\n\n/* =========================================================\n   БАЗА: ничего не блюрим/не затемняем без фокуса\n   ========================================================= */\n\n.applecation .full-episode{\n  position: relative;\n  z-index: 1;\n  opacity: 1;\n  filter: none;\n\n  transition: transform .6s cubic-bezier(.16,1,.3,1);\n}\n\n/* без фокуса — вообще без эффектов */\n.applecation .full-episode:not(.focus){\n  transform: none;\n}\n\n/* фокус — мягкий “apple” подъём */\n.applecation .full-episode.focus{\n  z-index: 10;\n  transform: scale(1.03) translateY(-6px);\n}\n\n\n/* =========================================================\n   КАРТИНКА\n   ========================================================= */\n\n.applecation .full-episode__img{\n  position: relative;\n  overflow: hidden;\n  border-radius: inherit;\n\n  transition:\n    box-shadow .6s cubic-bezier(.16,1,.3,1),\n    backdrop-filter .6s cubic-bezier(.16,1,.3,1),\n    transform .6s cubic-bezier(.16,1,.3,1);\n}\n\n\n/* =========================================================\n   ЖИДКОЕ СТЕКЛО — ТОЛЬКО НА ФОКУСЕ\n   ========================================================= */\n\n.applecation .full-episode.focus .full-episode__img{\n  box-shadow:\n    0 0 0 1px rgba(255,255,255,.18),\n    0 26px 65px rgba(0,0,0,.4) !important;\n\n  -webkit-backdrop-filter: blur(14px) saturate(1.25) contrast(1.05);\n  backdrop-filter: blur(14px) saturate(1.25) contrast(1.05);\n\n  background: rgba(255,255,255,.06);\n}\n\n/* толщина стекла */\n.applecation .full-episode.focus .full-episode__img::before{\n  content: '';\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  pointer-events: none;\n  z-index: 2;\n\n  box-shadow:\n    inset 0 0 0 1px rgba(255,255,255,.22),\n    inset 0 0 18px rgba(255,255,255,.12),\n    inset 0 -14px 22px rgba(0,0,0,.18);\n\n  filter: blur(.35px);\n  opacity: 1;\n  transition: opacity .45s ease;\n}\n\n/* блик */\n.applecation .full-episode.focus .full-episode__img::after{\n  content: '';\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  pointer-events: none;\n  z-index: 3;\n\n  background:\n    radial-gradient(120% 85% at 18% 10%,\n      rgba(255,255,255,.38),\n      rgba(255,255,255,.10) 38%,\n      transparent 62%),\n    linear-gradient(135deg,\n      rgba(255,255,255,.20),\n      rgba(255,255,255,0) 52%,\n      rgba(255,255,255,.06));\n\n  mix-blend-mode: screen;\n  opacity: .95;\n\n  transition:\n    opacity .45s ease,\n    transform .65s cubic-bezier(.16,1,.3,1);\n}\n\n/* когда фокуса нет — просто не показываем слои стекла */\n.applecation .full-episode:not(.focus) .full-episode__img::before,\n.applecation .full-episode:not(.focus) .full-episode__img::after{\n  opacity: 0;\n}\n\n/* убрать старый оверлей */\n.applecation .full-episode.focus::after{\n  display: none !important;\n}\n\n\n\n.applecation .full-episode__viewed {\n    top: 0.8em !important;\n    right: 0.8em !important;\n    background: rgba(0,0,0,0.5) !important;\n    border-radius: 50% !important;\n    padding: 0.3em !important;\n    backdrop-filter: blur(10px) !important;\n}\n\n/* Статус следующей серии */\n.applecation .full-episode--next .full-episode__img:after {\n    border-radius: 0.8em !important;\n}\n\n/* Оверлей для полного описания */\n.applecation-description-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    z-index: 9999;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    opacity: 0;\n    visibility: hidden;\n    pointer-events: none;\n    transition: opacity 0.3s ease, visibility 0.3s ease;\n}\n\n.applecation-description-overlay.show {\n    opacity: 1;\n    visibility: visible;\n    pointer-events: all;\n}\n\n.applecation-description-overlay__bg {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    -webkit-backdrop-filter: blur(100px);\n    backdrop-filter: blur(100px);\n}\n\n.applecation-description-overlay__content {\n    position: relative;\n    z-index: 1;\n    max-width: 60vw;\n    max-height: 90vh;\n    overflow-y: auto;\n}\n\n.applecation-description-overlay__logo {\n    text-align: center;\n    margin-bottom: 1.5em;\n    display: none;\n}\n\n.applecation-description-overlay__logo img {\n    max-width: 40vw;\n    max-height: 150px;\n    width: auto;\n    height: auto;\n    object-fit: contain;\n}\n\n.applecation-description-overlay__title {\n    font-size: 2em;\n    font-weight: 600;\n    margin-bottom: 1em;\n    color: #fff;\n    text-align: center;\n}\n\n.applecation-description-overlay__text {\n    font-size: 1.2em;\n    line-height: 1.6;\n    color: rgba(255, 255, 255, 0.9);\n    white-space: pre-wrap;\n    margin-bottom: 1.5em;\n}\n\n.applecation-description-overlay__details {\n    display: flex;\n    flex-wrap: wrap;\n    margin: -1em;\n}\n\n.applecation-description-overlay__details > * {\n    margin: 1em;\n}\n\n.applecation-description-overlay__info-name {\n    font-size: 1.1em;\n    margin-bottom: 0.5em;\n}\n\n.applecation-description-overlay__info-body {\n    font-size: 1.2em;\n    opacity: 0.6;\n}\n\n/* Скроллбар для описания */\n.applecation-description-overlay__content::-webkit-scrollbar {\n    width: 0.5em;\n}\n\n.applecation-description-overlay__content::-webkit-scrollbar-track {\n    background: rgba(255, 255, 255, 0.1);\n    border-radius: 1em;\n}\n\n.applecation-description-overlay__content::-webkit-scrollbar-thumb {\n    background: rgba(255, 255, 255, 0.3);\n    border-radius: 1em;\n}\n\n.applecation-description-overlay__content::-webkit-scrollbar-thumb:hover {\n    background: rgba(255, 255, 255, 0.5);\n}\n\n/* =========================================================\n   ПЕРСОНЫ (АКТЕРЫ И СЪЕМОЧНАЯ ГРУППА) - APPLE TV СТИЛЬ\n   ========================================================= */\n\n.applecation .full-person {\n    display: flex !important;\n    flex-direction: column !important;\n    align-items: center !important;\n    width: 10.7em !important;\n    background: none !important;\n    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;\n    will-change: transform;\n    -webkit-animation: none !important;\n    animation: none !important;\n    margin-left: 0;\n}\n\n.applecation .full-person.focus {\n    transform: scale(1.08) translateY(-6px) !important;\n    z-index: 10;\n}\n\n/* Фото персоны - круглое */\n.applecation .full-person__photo {\n    position: relative !important;\n    width: 9.4em !important;\n    height: 9.4em !important;\n    margin: 0 0 .3em 0 !important;\n    border-radius: 50% !important;\n    overflow: hidden !important;\n    background: rgba(255, 255, 255, 0.05) !important;\n    flex-shrink: 0 !important;\n    transition: \n        box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        backdrop-filter 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        -webkit-backdrop-filter 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        background 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;\n    will-change: transform, box-shadow, backdrop-filter;\n    -webkit-animation: none !important;\n    animation: none !important;\n}\n\n.applecation .full-person__photo img {\n    width: 100% !important;\n    height: 100% !important;\n    object-fit: cover !important;\n    border-radius: 50% !important;\n}\n\n/* Смещаем лицо только при высоком качестве (w500), так как там другой кроп у TMDB */\n.applecation.applecation--poster-high .full-person__photo img {\n    object-position: center calc(50% + 20px) !important;\n}\n\n/* Дефолтные заглушки оставляем по центру, чтобы не ломать симметрию иконок */\n.applecation .full-person__photo img[src*=\"actor.svg\"],\n.applecation .full-person__photo img[src*=\"img_broken.svg\"] {\n    object-position: center !important;\n}\n\n/* ЖИДКОЕ СТЕКЛО — БАЗОВЫЕ СЛОИ (скрыты) */\n.applecation .full-person__photo::before,\n.applecation .full-person__photo::after {\n    content: '';\n    position: absolute;\n    inset: 0;\n    border-radius: 50%;\n    pointer-events: none;\n    opacity: 0;\n    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;\n    will-change: opacity;\n}\n\n/* толщина стекла */\n.applecation .full-person__photo::before {\n    z-index: 2;\n    box-shadow:\n        inset 2px 2px 1px rgba(255, 255, 255, 0.30),\n        inset -2px -2px 2px rgba(255, 255, 255, 0.30);\n}\n\n/* ореол и блик */\n.applecation .full-person__photo::after {\n    z-index: 3;\n    background:\n        radial-gradient(circle at center,\n            transparent 58%,\n            rgba(255, 255, 255, 0.22) 75%,\n            rgba(255, 255, 255, 0.38) 90%),\n        radial-gradient(120% 85% at 18% 10%,\n            rgba(255, 255, 255, 0.35),\n            rgba(255, 255, 255, 0.10) 38%,\n            transparent 62%);\n    mix-blend-mode: screen;\n}\n\n/* ЭФФЕКТЫ ПРИ ФОКУСЕ */\n\n.applecation .full-person.focus .full-person__photo::before,\n.applecation .full-person.focus .full-person__photo::after {\n    opacity: 1;\n}\n\n.applecation .full-person.focus .full-person__photo::after {\n    opacity: 0.9;\n}\n\n/* Текстовая информация */\n.applecation .full-person__body {\n    display: flex !important;\n    flex-direction: column !important;\n    align-items: center !important;\n    text-align: center !important;\n    width: 100% !important;\n    padding: 0 0.3em !important;\n}\n\n/* Имя персоны */\n.applecation .full-person__name {\n    font-size: 1em !important;\n    font-weight: 600 !important;\n    color: #fff !important;\n    line-height: 1.3 !important;\n    width: 100% !important;\n    white-space: nowrap !important;\n    overflow: hidden !important;\n    text-overflow: ellipsis !important;\n    position: relative !important;\n}\n\n/* Бегущая строка для длинных имен */\n.applecation .full-person__name.marquee-active {\n    text-overflow: clip !important;\n    mask-image: linear-gradient(to right, #000 92%, transparent 100%);\n    -webkit-mask-image: linear-gradient(to right, #000 92%, transparent 100%);\n}\n\n/* При фокусе (когда строка едет) прозрачность с обеих сторон */\n.applecation .full-person.focus .full-person__name.marquee-active {\n    mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);\n    -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);\n}\n\n.applecation .marquee__inner {\n    display: inline-block;\n    white-space: nowrap;\n}\n\n.applecation .marquee__inner span {\n    padding-right: 2.5em;\n    display: inline-block;\n}\n\n/* Запуск анимации при фокусе */\n.applecation .full-person.focus .full-person__name.marquee-active .marquee__inner {\n    animation: marquee var(--marquee-duration, 5s) linear infinite;\n}\n\n@keyframes marquee {\n    0% { transform: translateX(0); }\n    100% { transform: translateX(-50%); }\n}\n\n/* Роль персоны */\n.applecation .full-person__role {\n    font-size: 0.8em !important;\n    font-weight: 400 !important;\n    color: rgba(255, 255, 255, 0.5) !important;\n    line-height: 1.3 !important;\n    white-space: nowrap !important;\n    overflow: hidden !important;\n    text-overflow: ellipsis !important;\n    width: 100% !important;\n    margin-top: 0;\n}\n\n.applecation .full-person.focus .full-person__role {\n    color: rgb(255, 255, 255) !important;\n}\n</style>`;

            var css = cssRaw.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            $('body').append(css);

            if (!document.getElementById('flixio_applecation_css_mobile_fix')) {
                $('body').append('<style id="flixio_applecation_css_mobile_fix">@media screen and (max-width: 720px){.applecation .full-start-new__body{height:auto!important;min-height:0!important}.applecation .full-start-new__right{display:block!important}.applecation .applecation__right{display:none!important}.applecation .applecation__left{width:100%!important;max-width:none!important}.applecation .applecation__content-wrapper{width:100%!important}.applecation .applecation__description-wrapper{width:100%!important}.applecation .applecation__description{max-width:none!important;width:100%!important}}</style>');
            }
        }
    }

    function initAppleTvFullCardLogoRuntime() {
        if (window.FLIXIO_APPLETV_LOGO_RUNTIME) return;
        window.FLIXIO_APPLETV_LOGO_RUNTIME = true;
        if (!Lampa.Listener || !Lampa.Listener.follow) return;

        function waitForBackground(render, callback) {
            var background = render.find('.full-start__background:not(.applecation__overlay)');
            if (!background.length) return callback();
            if (background.hasClass('loaded')) {
                return setTimeout(callback, 350);
            }
            var interval = setInterval(function () {
                if (!render.closest('body').length) {
                    clearInterval(interval);
                    return;
                }
                if (background.hasClass('loaded')) {
                    clearInterval(interval);
                    setTimeout(callback, 650);
                }
            }, 50);
            setTimeout(function () {
                clearInterval(interval);
                callback();
            }, 2000);
        }

        function finalize(render) {
            render.find('.applecation__meta').addClass('show');
            render.find('.applecation__studios').addClass('show');
            render.find('.applecation__description-wrapper').addClass('show');
            render.find('.applecation__info').addClass('show');
            render.find('.full-start-new__rate-line.applecation__ratings').addClass('show');
        }

        function loadLogo(render, movie) {
            var logo = render.find('.applecation__logo');
            var titleEl = render.find('.full-start-new__title');
            if (!logo.length) return;

            var done = false;
            var timer = setTimeout(function () {
                if (done) return;
                done = true;
                titleEl.show();
                logo.addClass('loaded');
                finalize(render);
            }, 2500);

            var type = movie && movie.name ? 'tv' : 'movie';
            var lang = Lampa.Storage.get('language') || 'ru';
            var url = Lampa.TMDB.api(type + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + lang);
            var urlAll = Lampa.TMDB.api(type + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key());

            function logoSize() {
                var q = Lampa.Storage.get('applecation_poster_quality', 'medium');
                if (q === 'low') return 'w300';
                if (q === 'medium') return 'w500';
                if (q === 'high') return 'original';
                var posterSize = Lampa.Storage.field ? Lampa.Storage.field('poster_size') : null;
                return { w200: 'w300', w300: 'w500', w500: 'original' }[posterSize] || 'w500';
            }

            function applyLogoFromData(data) {
                if (done) return;
                if (!render.closest('body').length) return;

                var filePath = (data && data.logos && data.logos[0] && data.logos[0].file_path) ? data.logos[0].file_path : null;

                if (filePath) {
                    var imgUrl = Lampa.TMDB.image('/t/p/' + logoSize() + filePath);
                    var img = new Image();
                    img.onload = function () {
                        if (done) return;
                        done = true;
                        clearTimeout(timer);
                        if (!render.closest('body').length) return;
                        logo.html('<img src="' + imgUrl + '" alt="" />');
                        waitForBackground(render, function () {
                            if (!render.closest('body').length) return;
                            logo.addClass('loaded');
                            finalize(render);
                        });
                        var overlay = $('.applecation-description-overlay');
                        if (overlay.length) {
                            overlay.find('.applecation-description-overlay__logo').html($('<img>').attr('src', imgUrl)).css('display', 'block');
                            overlay.find('.applecation-description-overlay__title').css('display', 'none');
                        }
                    };
                    img.onerror = function () {
                        if (done) return;
                        done = true;
                        clearTimeout(timer);
                        titleEl.show();
                        waitForBackground(render, function () {
                            if (!render.closest('body').length) return;
                            logo.addClass('loaded');
                            finalize(render);
                        });
                    };
                    img.src = imgUrl;
                } else {
                    done = true;
                    clearTimeout(timer);
                    titleEl.show();
                    waitForBackground(render, function () {
                        if (!render.closest('body').length) return;
                        logo.addClass('loaded');
                        finalize(render);
                    });
                }
            }

            $.get(url, function (data) {
                if (data && data.logos && data.logos.length) applyLogoFromData(data);
                else $.get(urlAll, function (dataAll) { applyLogoFromData(dataAll || data); }).fail(function () { applyLogoFromData(data); });
            }).fail(function () {
                if (done) return;
                done = true;
                clearTimeout(timer);
                titleEl.show();
                waitForBackground(render, function () {
                    if (!render.closest('body').length) return;
                    logo.addClass('loaded');
                    finalize(render);
                });
            });
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            var activity = e.object && e.object.activity;
            if (!activity || !activity.render) return;
            var render = activity.render();
            if (!render || !render.length) return;
            if (!render.find('.applecation__logo, .full-start-new__title').length) return;

            var movie = e.data && e.data.movie;
            if (!movie || !movie.id) return;
            loadLogo(render, movie);
        });
    }

    function initAppleTvFullCardInfoRuntime() {
        if (window.FLIXIO_APPLETV_INFO_RUNTIME) return;
        window.FLIXIO_APPLETV_INFO_RUNTIME = true;
        if (!Lampa.Listener || !Lampa.Listener.follow) return;

        function typeLabel(movie) {
            var lang = Lampa.Storage.get('language', 'ru');
            var isTv = !!movie.name;
            var map = {
                ru: isTv ? 'Сериал' : 'Фильм',
                en: isTv ? 'TV Series' : 'Movie',
                uk: isTv ? 'Серіал' : 'Фільм',
                be: isTv ? 'Серыял' : 'Фільм',
                bg: isTv ? 'Сериал' : 'Филм',
                cs: isTv ? 'Seriál' : 'Film',
                he: isTv ? 'סדרה' : 'סרט',
                pt: isTv ? 'Série' : 'Filme',
                zh: isTv ? '电视剧' : '电影'
            };
            return map[lang] || map.en;
        }

        function pluralSeasons(count) {
            var lang = Lampa.Storage.get('language', 'ru');
            if (['ru', 'uk', 'be', 'bg'].indexOf(lang) !== -1) {
                var t = [2, 0, 1, 1, 1, 2];
                var a = {
                    ru: ['сезон', 'сезона', 'сезонов'],
                    uk: ['сезон', 'сезони', 'сезонів'],
                    be: ['сезон', 'сезоны', 'сезонаў'],
                    bg: ['сезон', 'сезона', 'сезона']
                };
                return count + ' ' + ((a[lang] || a.ru)[count % 100 > 4 && count % 100 < 20 ? 2 : t[Math.min(count % 10, 5)]]);
            }
            if (lang === 'en') return count === 1 ? count + ' Season' : count + ' Seasons';
            if (lang === 'cs') return count === 1 || (count >= 2 && count <= 4) ? count + ' série' : count + ' sérií';
            if (lang === 'pt') return count === 1 ? count + ' Temporada' : count + ' Temporadas';
            if (lang === 'he') return count === 1 ? 'עונה ' + count : count + ' עונות';
            if (lang === 'zh') return count + ' 季';
            var key = Lampa.Lang.translate('full_season');
            return count === 1 ? count + ' ' + key : count + ' ' + key + 's';
        }

        function insertOverlayBackground(render) {
            var bg = render.find('.full-start__background');
            if (bg.length && !bg.next('.applecation__overlay').length) {
                bg.after('<div class="full-start__background loaded applecation__overlay"></div>');
            }
        }

        function fillMeta(render, movie) {
            var metaText = render.find('.applecation__meta-text');
            if (metaText.length) {
                var parts = [];
                parts.push(typeLabel(movie));
                if (movie.genres && movie.genres.length) {
                    var g = movie.genres.slice(0, 2).map(function (x) { return Lampa.Utils.capitalizeFirstLetter(x.name); });
                    parts = parts.concat(g);
                }
                metaText.html(parts.join(' · '));
            }

            var networkNode = render.find('.applecation__network');
            if (networkNode.length) {
                networkNode.remove();
            }
        }

        function ensureStudiosStyle() {
            if (document.getElementById('flixio_applecation_studios_css')) return;
            var css = '' +
                '.applecation__studios{display:flex;align-items:center;flex-wrap:wrap;gap:.7em;margin:0 0 .6em 0;opacity:0;transform:translateY(15px);transition:opacity .4s ease-out,transform .4s ease-out;transition-delay:.07s}' +
                '.applecation__studios.show{opacity:1;transform:translateY(0)}' +
                '.applecation__studio{display:inline-flex;align-items:center;gap:.4em;background:rgba(255,255,255,.08);border:1px solid transparent;border-radius:.6em;padding:.25em .6em;transition:all .2s ease;cursor:pointer}' +
                '.applecation__studio.focus{background:rgba(255,255,255,.2);border:1px solid #fff;transform:scale(1.05)}' +
                '.applecation__studio img{height:1.3em;max-width:200px;width:auto;object-fit:contain;filter:brightness(0) invert(1)}' +
                '.applecation__studio-name{font-size:.85em;font-weight:700;color:#fff;white-space:nowrap}';
            $('head').append('<style id="flixio_applecation_studios_css">' + css + '</style>');
        }

        function fillStudios(render, movie) {
            ensureStudiosStyle();

            var meta = render.find('.applecation__meta');
            if (!meta.length) return;

            var container = render.find('.applecation__studios');
            if (!container.length) {
                container = $('<div class="applecation__studios"></div>');
                container.insertAfter(meta);
            }

            var companies = (movie && movie.production_companies && movie.production_companies.length) ? movie.production_companies.slice(0, 3) : [];
            if (!companies.length) {
                container.remove();
                return;
            }

            function imgFor(path) {
                if (!path) return '';
                if (Lampa.Api && typeof Lampa.Api.img === 'function') return Lampa.Api.img(path, 'h100');
                return 'https://image.tmdb.org/t/p/h100' + path;
            }

            container.empty();
            companies.forEach(function (co) {
                if (!co || !co.id) return;
                var node = $('<div class="applecation__studio selector" data-id="' + co.id + '" data-name="' + (co.name || '') + '"></div>');
                if (co.logo_path) {
                    node.append('<img src="' + imgFor(co.logo_path) + '" title="' + (co.name || '') + '" />');
                } else {
                    node.append('<span class="applecation__studio-name">' + (co.name || '') + '</span>');
                }
                node.off('hover:enter.applecation_studio click.applecation_studio')
                    .on('hover:enter.applecation_studio click.applecation_studio', function () {
                        var id = $(this).data('id');
                        if (!id) return;
                        Lampa.Activity.push({
                            url: 'movie',
                            id: id,
                            title: $(this).data('name') || '',
                            component: 'company',
                            source: 'tmdb',
                            page: 1
                        });
                    });
                container.append(node);
            });

            if (Lampa.Controller && Lampa.Controller.collectionAppend) {
                container.find('.applecation__studio').each(function () {
                    Lampa.Controller.collectionAppend($(this));
                });
            }

            setTimeout(function () {
                try {
                    var current = Lampa.Controller && Lampa.Controller.enabled && Lampa.Controller.enabled();
                    if (current && current.name && (current.name === 'full_start' || current.name === 'full_descr' || current.name === 'full')) {
                        current.collection = render.find('.selector');
                    }
                } catch (e) { }
            }, 100);
        }

        function buildDescriptionOverlay(movie) {
            if (!Lampa.Storage.get('applecation_description_overlay', true)) return;
            var text = movie.overview || '';
            if (!text) return;

            $('.applecation-description-overlay').remove();

            var title = movie.title || movie.name;
            var dateStr = (movie.release_date || movie.first_air_date || '') + '';
            var rel = dateStr.length > 3 ? Lampa.Utils.parseTime(dateStr).full : (dateStr.length > 0 ? dateStr : Lampa.Lang.translate('player_unknown'));
            var budget = '$ ' + Lampa.Utils.numberWithSpaces(movie.budget || 0);
            var countries = (movie.production_countries ? movie.production_countries.map(function (c) {
                var key = 'country_' + c.iso_3166_1.toLowerCase();
                var t = Lampa.Lang.translate(key);
                return t !== key ? t : c.name;
            }) : []).join(', ');

            var overlay = $(Lampa.Template.get('applecation_overlay', {
                title: title,
                text: text,
                relise: rel,
                budget: budget,
                countries: countries
            }));

            if (!movie.budget || movie.budget === 0) overlay.find('.applecation--budget').remove();
            if (!countries) overlay.find('.applecation--countries').remove();
            $('body').append(overlay);
            overlay.data('controller-created', false);
        }

        function attachDescriptionOverlay(render) {
            if (!Lampa.Storage.get('applecation_description_overlay', true)) {
                render.find('.applecation__description-wrapper').off('hover:enter');
                $('.applecation-description-overlay').remove();
                return;
            }

            var wrap = render.find('.applecation__description-wrapper');
            if (!wrap.length) return;
            wrap.off('hover:enter').on('hover:enter', function () {
                var overlay = $('.applecation-description-overlay');
                if (!overlay.length) return;
                setTimeout(function () { overlay.addClass('show'); }, 10);

                if (!overlay.data('controller-created') && Lampa.Controller) {
                    var ctrl = {
                        toggle: function () {
                            Lampa.Controller.collectionSet(overlay);
                            Lampa.Controller.collectionFocus(overlay.find('.applecation-description-overlay__content'), overlay);
                        },
                        back: function () {
                            var ol = $('.applecation-description-overlay');
                            if (!ol.length) return;
                            ol.removeClass('show');
                            setTimeout(function () { Lampa.Controller.toggle('content'); }, 300);
                        }
                    };
                    Lampa.Controller.add('applecation_description', ctrl);
                    overlay.data('controller-created', true);
                }

                if (Lampa.Controller) Lampa.Controller.toggle('applecation_description');
            });

            if (Lampa.Controller && Lampa.Controller.collectionAppend) {
                wrap.addClass('selector');
                Lampa.Controller.collectionAppend(wrap);
            }
        }

        function fillDescription(render, movie) {
            var description = render.find('.applecation__description');
            if (description.length) description.text(movie.overview || '');
            buildDescriptionOverlay(movie);
            attachDescriptionOverlay(render);
        }

        function fillInfo(render, movie) {
            var info = render.find('.applecation__info');
            if (!info.length) return;

            var parts = [];
            var date = movie.release_date || movie.first_air_date || '';
            if (date) parts.push(date.split('-')[0]);

            if (movie.name) {
                if (movie.episode_run_time && movie.episode_run_time.length) {
                    var m = movie.episode_run_time[0];
                    var tm = Lampa.Lang.translate('time_m').replace('.', '');
                    parts.push(m + ' ' + tm);
                }

                // Добавляем информацию о сезоне и сериях
                var lastEpisode = movie.last_episode_to_air;
                if (lastEpisode && lastEpisode.season_number && lastEpisode.episode_number) {
                    var seasonNumber = lastEpisode.season_number;
                    var episodeNumber = lastEpisode.episode_number;
                    
                    // Ищем общее количество серий в сезоне
                    var totalEpisodes = '?';
                    if (movie.seasons && Array.isArray(movie.seasons)) {
                        for (var i = 0; i < movie.seasons.length; i++) {
                            var season = movie.seasons[i];
                            if (season.season_number === seasonNumber && season.episode_count) {
                                totalEpisodes = season.episode_count;
                                break;
                            }
                        }
                    }
                    
                    // Формируем текст "1 сезон 2/20 серий"
                    var seasonText = seasonNumber + ' сезон ' + episodeNumber + '/' + totalEpisodes + ' серий';
                    parts.push(seasonText);
                } else {
                    // Если нет данных о последнем эпизоде, показываем просто количество сезонов
                    var seasons = (typeof movie.number_of_seasons === 'number' && movie.number_of_seasons > 0) ? movie.number_of_seasons : (Lampa.Utils.countSeasons ? Lampa.Utils.countSeasons(movie) : 0);
                    if (seasons) parts.push(pluralSeasons(seasons));
                }
            } else if (movie.runtime && movie.runtime > 0) {
                var h = Math.floor(movie.runtime / 60);
                var mm = movie.runtime % 60;
                var th = Lampa.Lang.translate('time_h').replace('.', '');
                var tmm = Lampa.Lang.translate('time_m').replace('.', '');
                parts.push(h > 0 ? (h + ' ' + th + ' ' + mm + ' ' + tmm) : (mm + ' ' + tmm));
            }

            info.html((parts.length ? parts.join(' · ') : '') + '<span class="applecation__quality-badges"></span>');
        }

        function parseFfprobe(streams) {
            if (!streams || !Array.isArray(streams)) return null;
            var video = null;
            var audio = [];
            for (var i = 0; i < streams.length; i++) {
                if (streams[i].codec_type === 'video' && !video) video = streams[i];
                if (streams[i].codec_type === 'audio') audio.push(streams[i]);
            }

            var resLabel = null;
            if (video && video.width && video.height) {
                if (video.height >= 2160 || video.width >= 3840) resLabel = '4K';
                else if (video.height >= 1440 || video.width >= 2560) resLabel = '2K';
                else if (video.height >= 1080 || video.width >= 1920) resLabel = 'FULL HD';
                else if (video.height >= 720 || video.width >= 1280) resLabel = 'HD';
            }

            var channels = 0;
            for (var j = 0; j < audio.length; j++) {
                if (audio[j].channels && audio[j].channels > channels) channels = audio[j].channels;
            }

            var audioLabel = null;
            if (channels >= 8) audioLabel = '7.1';
            else if (channels >= 6) audioLabel = '5.1';
            else if (channels >= 4) audioLabel = '4.0';
            else if (channels >= 2) audioLabel = '2.0';

            var hdr = new Set();
            if (video) {
                if (video.side_data_list && Array.isArray(video.side_data_list)) {
                    var hasMd = video.side_data_list.some(function (x) { return x.side_data_type === 'Mastering display metadata'; });
                    var hasCl = video.side_data_list.some(function (x) { return x.side_data_type === 'Content light level metadata'; });
                    var hasDv = video.side_data_list.some(function (x) { return x.side_data_type === 'DOVI configuration record' || x.side_data_type === 'Dolby Vision RPU'; });
                    if (hasDv) hdr.add('Dolby Vision');
                    else if (hasMd || hasCl) hdr.add('HDR');
                }

                if (!hdr.size && video.color_transfer && ['smpte2084', 'arib-std-b67'].indexOf((video.color_transfer || '').toLowerCase()) !== -1) hdr.add('HDR');
                if (!hdr.size && video.codec_name && ((video.codec_name || '').toLowerCase().indexOf('dovi') !== -1 || (video.codec_name || '').toLowerCase().indexOf('dolby') !== -1)) hdr.add('Dolby Vision');
            }

            return { resolutionLabel: resLabel, audio: audioLabel, hdr: hdr };
        }

        function updateQualityBadges(render, movie) {
            var target = render.find('.applecation__quality-badges');
            if (!target.length) return;

            function renderBadges(info) {
                if (!info) return;
                var a = [];

                function textBadge(label) {
                    return '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<rect x="2.5" y="2.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/>' +
                        '<text x="155.5" y="88" text-anchor="middle" fill="currentColor" font-family="Arial, sans-serif" font-size="64" font-weight="700">' + label + '</text>' +
                        '</svg>';
                }

                if (info.quality) {
                    var n = '';
                    var q = info.quality;
                    if (q === 'FULL HD') q = 'FHD';
                    if (q === '1080p') q = 'FHD';
                    if (q === '720p') q = 'HD';
                    if (q === 'SD') q = '';
                    if (q === '4K') n = '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM113 20.9092L74.1367 82.1367V97.6367H118.818V114H137.637V97.6367H149.182V81.8633H137.637V20.9092H113ZM162.841 20.9092V114H182.522V87.5459L192.204 75.7275L217.704 114H241.25L206.296 62.5908L240.841 20.9092H217.25L183.75 61.9541H182.522V20.9092H162.841ZM119.182 81.8633H93.9541V81.1367L118.454 42.3633H119.182V81.8633Z" fill="white"/></svg>';
                    else if (q) n = textBadge(q);
                    if (n) a.push('<div class="quality-badge quality-badge--res">' + n + '</div>');
                }

                if (info.dv) a.push('<div class="quality-badge quality-badge--dv"><svg viewBox="0 0 1051 393" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,393) scale(0.1,-0.1)" fill="currentColor"><path d="M50 2905 l0 -1017 223 5 c146 4 244 11 287 21 361 85 638 334 753 677 39 116 50 211 44 366 -7 200 -52 340 -163 511 -130 199 -329 344 -574 419 -79 24 -102 26 -327 31 l-243 4 0 -1017z"/><path d="M2436 3904 c-443 -95 -762 -453 -806 -905 -30 -308 86 -611 320 -832 104 -99 212 -165 345 -213 133 -47 253 -64 468 -64 l177 0 0 1015 0 1015 -217 -1 c-152 0 -239 -5 -287 -15z"/><path d="M3552 2908 l3 -1013 425 0 c309 0 443 4 490 13 213 43 407 148 550 299 119 124 194 255 247 428 25 84 27 103 27 270 1 158 -2 189 -22 259 -72 251 -221 458 -424 590 -97 63 -170 97 -288 134 l-85 26 -463 4 -462 3 2 -1013z m825 701 c165 -22 283 -81 404 -199 227 -223 279 -550 133 -831 -70 -133 -176 -234 -319 -304 -132 -65 -197 -75 -490 -75 l-245 0 0 703 c0 387 3 707 7 710 11 11 425 8 510 -4z"/><path d="M7070 2905 l0 -1015 155 0 155 0 0 1015 0 1015 -155 0 -155 0 0 -1015z"/><path d="M7640 2905 l0 -1015 150 0 150 0 0 60 c0 33 2 60 5 60 2 0 33 -15 67 -34 202 -110 433 -113 648 -9 79 38 108 59 180 132 72 71 95 102 134 181 102 207 102 414 1 625 -120 251 -394 411 -670 391 -115 -8 -225 -42 -307 -93 -21 -13 -42 -23 -48 -23 -7 0 -10 125 -10 370 l0 370 -150 0 -150 0 0 -1015z m832 95 c219 -67 348 -310 280 -527 -62 -198 -268 -328 -466 -295 -96 15 -168 52 -235 119 -131 132 -164 311 -87 478 27 60 101 145 158 181 100 63 234 80 350 44z"/><path d="M6035 3286 c-253 -49 -460 -232 -542 -481 -23 -70 -26 -96 -26 -210 0 -114 3 -140 26 -210 37 -113 90 -198 177 -286 84 -85 170 -138 288 -177 67 -22 94 -26 207 -26 113 0 140 4 207 26 119 39 204 92 288 177 87 89 140 174 177 286 22 67 26 99 27 200 1 137 -14 207 -69 320 -134 277 -457 440 -760 381z m252 -284 c117 -37 206 -114 260 -229 121 -253 -38 -548 -321 -595 -258 -43 -503 183 -483 447 20 271 287 457 544 377z"/><path d="M9059 3258 c10 -24 138 -312 285 -642 l266 -598 -72 -162 c-39 -88 -78 -171 -86 -183 -37 -58 -132 -80 -208 -48 l-35 14 -18 -42 c-10 -23 -37 -84 -60 -135 -23 -52 -39 -97 -36 -102 3 -4 40 -23 83 -41 70 -31 86 -34 177 -34 93 0 105 2 167 33 76 37 149 104 180 166 29 57 799 1777 805 1799 5 16 -6 17 -161 15 l-167 -3 -185 -415 c-102 -228 -192 -431 -200 -450 l-15 -35 -201 453 -201 452 -168 0 -168 0 18 -42z"/><path d="M2650 968 c0 -2 81 -211 179 -463 l179 -460 59 -3 59 -3 178 453 c98 249 180 459 183 466 4 9 -13 12 -65 12 -47 0 -71 -4 -74 -12 -3 -7 -65 -176 -138 -375 -73 -200 -136 -363 -139 -363 -3 0 -67 168 -142 373 l-136 372 -72 3 c-39 2 -71 1 -71 0z"/><path d="M3805 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 466 0 465 -60 0 c-39 0 -62 -4 -65 -12z"/><path d="M4580 960 c-97 -16 -178 -72 -211 -145 -23 -50 -24 -143 -3 -193 32 -77 91 -117 244 -167 99 -32 146 -64 166 -112 28 -65 -11 -149 -83 -179 -78 -33 -212 -1 -261 61 l-19 24 -48 -43 -48 -42 43 -37 c121 -103 347 -112 462 -17 54 44 88 120 88 194 -1 130 -79 213 -242 256 -24 7 -71 25 -104 41 -48 22 -66 37 -79 65 -32 67 -5 138 65 174 73 37 193 18 244 -39 l20 -22 43 43 c41 40 42 43 25 61 -27 30 -102 64 -167 76 -64 12 -70 12 -135 1z"/><path d="M5320 505 l0 -465 65 0 65 0 0 465 0 465 -65 0 -65 0 0 -465z"/><path d="M6210 960 c-147 -25 -264 -114 -328 -249 -32 -65 -36 -84 -40 -175 -7 -161 33 -271 135 -367 140 -132 360 -164 541 -77 227 108 316 395 198 634 -88 177 -290 271 -506 234z m232 -132 c100 -46 165 -136 188 -261 20 -106 -18 -237 -88 -310 -101 -105 -245 -132 -377 -73 -74 33 -120 79 -157 154 -31 62 -33 74 -33 167 0 87 4 107 26 155 64 137 173 204 320 196 43 -2 85 -12 121 -28z"/><path d="M7135 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 376 c0 207 3 374 8 371 4 -2 115 -171 247 -375 l240 -371 78 0 77 0 0 465 0 465 -60 0 -60 0 -2 -372 -3 -372 -241 370 -241 369 -82 3 c-59 2 -83 -1 -86 -10z"/></g></svg></div>');

                if (info.hdr) a.push('<div class="quality-badge quality-badge--hdr"><svg viewBox="-1 178 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="181.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M27.2784 293V199.909H46.9602V238.318H86.9148V199.909H106.551V293H86.9148V254.545H46.9602V293H27.2784ZM155.778 293H122.778V199.909H156.051C165.415 199.909 173.475 201.773 180.233 205.5C186.991 209.197 192.188 214.515 195.824 221.455C199.491 228.394 201.324 236.697 201.324 246.364C201.324 256.061 199.491 264.394 195.824 271.364C192.188 278.333 186.96 283.682 180.142 287.409C173.354 291.136 165.233 293 155.778 293ZM142.46 276.136H154.96C160.778 276.136 165.672 275.106 169.642 273.045C173.642 270.955 176.642 267.727 178.642 263.364C180.672 258.97 181.688 253.303 181.688 246.364C181.688 239.485 180.672 233.864 178.642 229.5C176.642 225.136 173.657 221.924 169.688 219.864C165.718 217.803 160.824 216.773 155.006 216.773H142.46V276.136ZM215.903 293V199.909H252.631C259.661 199.909 265.661 201.167 270.631 203.682C275.631 206.167 279.434 209.697 282.04 214.273C284.676 218.818 285.994 224.167 285.994 230.318C285.994 236.5 284.661 241.818 281.994 246.273C279.328 250.697 275.464 254.091 270.403 256.455C265.373 258.818 259.282 260 252.131 260H227.54V244.182H248.949C252.706 244.182 255.828 243.667 258.312 242.636C260.797 241.606 262.646 240.061 263.858 238C265.1 235.939 265.722 233.379 265.722 230.318C265.722 227.227 265.1 224.621 263.858 222.5C262.646 220.379 260.782 218.773 258.267 217.682C255.782 216.561 252.646 216 248.858 216H235.585V293H215.903ZM266.176 250.636L289.312 293H267.585L244.949 250.636H266.176Z" fill="currentColor"/></svg></div>');

                if (info.sound) {
                    var s = '';
                    if (info.sound === '7.1') s = '<svg viewBox="-1 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M91.6023 483L130.193 406.636V406H85.2386V389.909H150.557V406.227L111.92 483H91.6023ZM159.545 484.182C156.545 484.182 153.97 483.121 151.818 481C149.697 478.848 148.636 476.273 148.636 473.273C148.636 470.303 149.697 467.758 151.818 465.636C153.97 463.515 156.545 462.455 159.545 462.455C162.455 462.455 165 463.515 167.182 465.636C169.364 467.758 170.455 470.303 170.455 473.273C170.455 475.273 169.939 477.106 168.909 478.773C167.909 480.409 166.591 481.727 164.955 482.727C163.318 483.697 161.515 484.182 159.545 484.182ZM215.045 389.909V483H195.364V408.591H194.818L173.5 421.955V404.5L196.545 389.909H215.045Z" fill="currentColor"/></svg>';
                    else s = textBadge(info.sound);
                    if (s) a.push('<div class="quality-badge quality-badge--sound">' + s + '</div>');
                }

                if (info.dub) a.push('<div class="quality-badge quality-badge--dub"><svg viewBox="-1 558 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="561.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M60.5284 673H27.5284V579.909H60.8011C70.1648 579.909 78.2254 581.773 84.983 585.5C91.7405 589.197 96.9375 594.515 100.574 601.455C104.241 608.394 106.074 616.697 106.074 626.364C106.074 636.061 104.241 644.394 100.574 651.364C96.9375 658.333 91.7102 663.682 84.892 667.409C78.1042 671.136 69.983 673 60.5284 673ZM47.2102 656.136H59.7102C65.5284 656.136 70.4223 655.106 74.392 653.045C78.392 650.955 81.392 647.727 83.392 643.364C85.4223 638.97 86.4375 633.303 86.4375 626.364C86.4375 619.485 85.4223 613.864 83.392 609.5C81.392 605.136 78.4072 601.924 74.4375 599.864C70.4678 597.803 65.5739 596.773 59.7557 596.773H47.2102V656.136ZM178.153 579.909H197.835V640.364C197.835 647.152 196.214 653.091 192.972 658.182C189.759 663.273 185.259 667.242 179.472 670.091C173.684 672.909 166.941 674.318 159.244 674.318C151.517 674.318 144.759 672.909 138.972 670.091C133.184 667.242 128.684 663.273 125.472 658.182C122.259 653.091 120.653 647.152 120.653 640.364V579.909H140.335V638.682C140.335 642.227 141.108 645.379 142.653 648.136C144.229 650.894 146.441 653.061 149.29 654.636C152.138 656.212 155.456 657 159.244 657C163.063 657 166.381 656.212 169.199 654.636C172.047 653.061 174.244 650.894 175.79 648.136C177.366 645.379 178.153 642.227 178.153 638.682V579.909ZM214.028 673V579.909H251.301C258.15 579.909 263.862 580.924 268.438 582.955C273.013 584.985 276.453 587.803 278.756 591.409C281.059 594.985 282.21 599.106 282.21 603.773C282.21 607.409 281.483 610.606 280.028 613.364C278.574 616.091 276.574 618.333 274.028 620.091C271.513 621.818 268.634 623.045 265.392 623.773V624.682C268.938 624.833 272.256 625.833 275.347 627.682C278.468 629.53 280.998 632.121 282.938 635.455C284.877 638.758 285.847 642.697 285.847 647.273C285.847 652.212 284.619 656.621 282.165 660.5C279.741 664.348 276.15 667.394 271.392 669.636C266.634 671.879 260.771 673 253.801 673H214.028ZM233.71 656.909H249.756C255.241 656.909 259.241 655.864 261.756 653.773C264.271 651.652 265.528 648.833 265.528 645.318C265.528 642.742 264.907 640.47 263.665 638.5C262.422 636.53 260.65 634.985 258.347 633.864C256.074 632.742 253.362 632.182 250.21 632.182H233.71V656.909ZM233.71 618.864H248.301C250.998 618.864 253.392 618.394 255.483 617.455C257.604 616.485 259.271 615.121 260.483 613.364C261.725 611.606 262.347 609.5 262.347 607.045C262.347 603.682 261.15 600.97 258.756 598.909C256.392 596.848 253.028 595.818 248.665 595.818H233.71V618.864Z" fill="currentColor"/></svg></div>');

                if (a.length > 0) {
                    target.html(a.join(''));
                    target.addClass('show');
                }
            }

            function fallbackBadges() {
                if (!window.FLIXIO_GET_BEST_JACRED) return;
                window.FLIXIO_GET_BEST_JACRED(movie, function (q) {
                    if (!q || q.empty) return;
                    renderBadges({
                        quality: q.resolution,
                        dv: !!q.dolbyVision,
                        hdr: !!q.hdr,
                        hdr_type: q.hdr ? 'HDR' : null,
                        sound: q.sound || null,
                        dub: !!q.dub
                    });
                });
            }

            if (!Lampa.Parser || typeof Lampa.Parser.get !== 'function') {
                fallbackBadges();
                return;
            }

            if (Lampa.Storage && Lampa.Storage.field && Lampa.Storage.field('parser_use') === false) {
                fallbackBadges();
                return;
            }

            var year = ((movie.first_air_date || movie.release_date || '0000') + '').slice(0, 4);
            var originalTitle = (movie.original_title || movie.original_name || '').trim();
            var mainTitle = (movie.title || movie.name || '').trim();
            if (!originalTitle) originalTitle = mainTitle;
            var parseLang = Lampa.Storage.field('parse_lang') || 'lg';
            var keyMap = {
                df: originalTitle,
                df_year: originalTitle + ' ' + year,
                df_lg: originalTitle + ' ' + mainTitle,
                df_lg_year: originalTitle + ' ' + mainTitle + ' ' + year,
                lg: mainTitle,
                lg_year: mainTitle + ' ' + year,
                lg_df: mainTitle + ' ' + originalTitle,
                lg_df_year: mainTitle + ' ' + originalTitle + ' ' + year
            };
            var search = (keyMap[parseLang] || mainTitle).trim();
            if (!search) return;

            Lampa.Parser.get({ search: search, movie: movie, page: 1 }, function (data) {
                if (!render.closest('body').length) return;
                if (!data || !data.Results || !data.Results.length) {
                    fallbackBadges();
                    return;
                }

                var agg = { resolutions: new Set(), hdr: new Set(), audio: new Set(), hasDub: false };

                data.Results.forEach(function (item) {
                    var titleLower = ((item.Title || '') + '').toLowerCase();

                    if (titleLower.indexOf('2160') !== -1 || /\b4k\b/.test(titleLower) || titleLower.indexOf('uhd') !== -1) agg.resolutions.add('4K');
                    else if (titleLower.indexOf('1440') !== -1 || /\b2k\b/.test(titleLower)) agg.resolutions.add('2K');
                    else if (titleLower.indexOf('1080') !== -1 || titleLower.indexOf('fhd') !== -1) agg.resolutions.add('FULL HD');
                    else if (titleLower.indexOf('720') !== -1 || /\bhd\b/.test(titleLower)) agg.resolutions.add('HD');

                    if (/\b7\.1\b/.test(titleLower)) agg.audio.add('7.1');
                    else if (/\b5\.1\b/.test(titleLower)) agg.audio.add('5.1');
                    else if (/\b4\.0\b/.test(titleLower)) agg.audio.add('4.0');
                    else if (/\b2\.0\b/.test(titleLower)) agg.audio.add('2.0');

                    if (!agg.hasDub) {
                        if (titleLower.indexOf('dub') !== -1 || titleLower.indexOf('дубляж') !== -1 || titleLower.indexOf('дублир') !== -1 || /\bd\b/.test(titleLower)) {
                            agg.hasDub = true;
                        }
                    }

                    if (item.ffprobe && Array.isArray(item.ffprobe)) {
                        var parsed = parseFfprobe(item.ffprobe);
                        if (parsed) {
                            if (parsed.resolutionLabel) agg.resolutions.add(parsed.resolutionLabel);
                            if (parsed.audio) agg.audio.add(parsed.audio);
                            if (parsed.hdr && parsed.hdr.size) parsed.hdr.forEach(function (x) { agg.hdr.add(x); });
                        }

                        if (!agg.hasDub) {
                            item.ffprobe.filter(function (x) { return x.codec_type === 'audio' && x.tags; }).forEach(function (a) {
                                var lang = ((a.tags.language || '') + '').toLowerCase();
                                var nm = ((a.tags.title || a.tags.handler_name || '') + '').toLowerCase();
                                if ((lang === 'rus' || lang === 'ru' || lang === 'russian') && (nm.indexOf('dub') !== -1 || nm.indexOf('дубляж') !== -1 || nm.indexOf('дублир') !== -1 || nm === 'd')) {
                                    agg.hasDub = true;
                                }
                            });
                        }
                    }

                    if (titleLower.indexOf('dolby vision') !== -1 || titleLower.indexOf('dovi') !== -1 || /\bdv\b/.test(titleLower)) agg.hdr.add('Dolby Vision');
                    if (titleLower.indexOf('hdr10+') !== -1) agg.hdr.add('HDR10+');
                    if (titleLower.indexOf('hdr10') !== -1) agg.hdr.add('HDR10');
                    if (titleLower.indexOf('hdr') !== -1) agg.hdr.add('HDR');
                });

                var info = {};
                if (agg.resolutions.size > 0) {
                    var rOrder = ['4K', '2K', 'FULL HD', 'HD'];
                    for (var i = 0; i < rOrder.length; i++) {
                        if (agg.resolutions.has(rOrder[i])) {
                            info.quality = rOrder[i];
                            break;
                        }
                    }
                }

                if (agg.hdr.has('Dolby Vision')) {
                    info.dv = true;
                    info.hdr = true;
                }

                if (agg.hdr.size > 0) {
                    info.hdr = true;
                    var hOrder = ['HDR10+', 'HDR10', 'HDR'];
                    for (var k = 0; k < hOrder.length; k++) {
                        if (agg.hdr.has(hOrder[k])) {
                            info.hdr_type = hOrder[k];
                            break;
                        }
                    }
                }

                if (agg.audio.size > 0) {
                    var sOrder = ['7.1', '5.1', '4.0', '2.0'];
                    for (var j = 0; j < sOrder.length; j++) {
                        if (agg.audio.has(sOrder[j])) {
                            info.sound = sOrder[j];
                            break;
                        }
                    }
                }

                if (agg.hasDub) info.dub = true;
                movie.applecation_quality = info;
                renderBadges(info);
            }, function () {
                fallbackBadges();
            });
        }

        function ensureTmdbDetails(movie, callback) {
            if (!movie || !movie.id) return callback(movie);

            var hasGenres = movie.genres && movie.genres.length;
            var hasOverview = typeof movie.overview === 'string' && movie.overview.length > 0;
            var hasRuntime = (movie.runtime && movie.runtime > 0) || (movie.episode_run_time && movie.episode_run_time.length);
            var hasCompanies = movie.networks || movie.production_companies;

            if (hasGenres && hasOverview && hasRuntime && hasCompanies) return callback(movie);

            var type = movie.name ? 'tv' : 'movie';
            var lang = Lampa.Storage.get('language') || 'ru';
            var url = Lampa.TMDB.api(type + '/' + movie.id + '?api_key=' + Lampa.TMDB.key() + '&language=' + lang);
            $.get(url, function (data) {
                if (!data) return callback(movie);
                var merged = $.extend(true, {}, movie, data);
                callback(merged);
            }).fail(function () {
                callback(movie);
            });
        }

        function removeDefaultDetails(render) {
            if (!render) return;
            render.find('.full-descr').remove();
            render.find('.full-descr__title').remove();
            render.find('.full-start__head').remove();
            render.find('.full-start-new__head').remove();
            render.find('.full-start__details').remove();
            render.find('.full-start__details-more').remove();
            render.find('.full-start__info').remove();
            render.find('.full-start__tags').remove();
            render.find('.full-start__genres').remove();
            render.find('.full-start__company').remove();
            render.find('.full-start__countries').remove();

            var detailTitles = {
                ru: 'Подробно',
                uk: 'Докладно',
                en: 'Details'
            };
            var lang = (Lampa.Storage && Lampa.Storage.get) ? (Lampa.Storage.get('language', 'ru') || 'ru') : 'ru';
            var key = (lang + '').toLowerCase().indexOf('uk') === 0 ? 'uk' : ((lang + '').toLowerCase().indexOf('en') === 0 ? 'en' : 'ru');
            var targetTitle = detailTitles[key] || detailTitles.ru;

            render.find('.items-line').each(function () {
                var line = $(this);
                var title = line.find('.items-line__head .items-line__title').first().text().trim();
                if (title === targetTitle) line.remove();
            });
        }

        function fillPoster(render, movie) {
            try {
                if (!render || !movie) return;
                var posterPath = movie.poster_path;
                if (!posterPath) return;

                var imgEl = render.find('.full--poster').first();
                if (!imgEl.length) return;
                if (imgEl.attr('src')) return;

                var url = null;
                if (Lampa.Api && typeof Lampa.Api.img === 'function') {
                    var posterSize = (Lampa.Storage && Lampa.Storage.field) ? Lampa.Storage.field('poster_size') : null;
                    url = Lampa.Api.img(posterPath, posterSize || 'w300');
                } else if (Lampa.TMDB && typeof Lampa.TMDB.image === 'function') {
                    url = Lampa.TMDB.image('/t/p/w300' + posterPath);
                } else {
                    url = 'https://image.tmdb.org/t/p/w300' + posterPath;
                }

                if (url) imgEl.attr('src', url);
            } catch (e) { }
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            var activity = e.object && e.object.activity;
            if (!activity || !activity.render) return;
            var render = activity.render();
            if (!render || !render.length) return;
            if (!render.find('.applecation__meta-text, .applecation__description, .applecation__info').length) return;

            var posterSize = Lampa.Storage.field ? Lampa.Storage.field('poster_size') : null;
            render.toggleClass('applecation--poster-high', posterSize === 'w500');

            var movie = e.data && e.data.movie;
            if (!movie) return;

            ensureTmdbDetails(movie, function (m) {
                insertOverlayBackground(render);
                fillMeta(render, m);
                fillStudios(render, m);
                fillDescription(render, m);
                fillInfo(render, m);
                updateQualityBadges(render, m);
                removeDefaultDetails(render);
                fillPoster(render, m);

                try {
                    if (window.matchMedia && window.matchMedia('(max-width: 720px)').matches) {
                        render.find('.full-start-new__left').removeClass('hide');
                    }
                } catch (e) { }

                render.find('.applecation__meta').addClass('show');
                render.find('.applecation__studios').addClass('show');
                render.find('.applecation__description-wrapper').addClass('show');
                render.find('.applecation__info').addClass('show');
                render.find('.full-start-new__rate-line.applecation__ratings').addClass('show');
            });
        });
    }

    function runInit() {
        try {
            initAppleTvFullCardBuiltIn();
            initAppleTvFullCardLogoRuntime();
            initAppleTvFullCardInfoRuntime();
            initMaxsmRatingsIntegration();
            initMarksJacRed();
            init();
            window.FLIXIO_STUDIOS_LOADED = true;
        } catch (err) {
            window.FLIXIO_STUDIOS_ERROR = (err && err.message) ? err.message : String(err);
            if (typeof console !== 'undefined' && console.error) {
                console.error('[Flixio Studios]', err);
            }
        }
    }

    if (window.appready) runInit();
    else if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') runInit();
        });
    } else {
        window.FLIXIO_STUDIOS_ERROR = 'Lampa.Listener not found';
    }

})();
