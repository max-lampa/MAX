/**
 * Ліхтар Studios2 — плагін головної сторінки (Likhtar Team).
 * Кастомна головна, стрімінги, студії, підписки на студії, Кіноогляд.
 */
(function () {
    'use strict';

    window.LIKHTAR_STUDIOS_VER = '3.0';
    window.LIKHTAR_STUDIOS_LOADED = false;
    window.LIKHTAR_STUDIOS_ERROR = null;

    if (typeof Lampa === 'undefined') {
        window.LIKHTAR_STUDIOS_ERROR = 'Lampa not found (script loaded before app?)';
        return;
    }


    // =================================================================
    // CONFIGURATION & CONSTANTS
    // =================================================================

    var currentScript = document.currentScript || [].slice.call(document.getElementsByTagName('script')).filter(function (s) {
        return (s.src || '').indexOf('studios') !== -1 || (s.src || '').indexOf('fix.js') !== -1 || (s.src || '').indexOf('likhtar') !== -1;
    })[0];

    var LIKHTAR_BASE_URL = (currentScript && currentScript.src) ? currentScript.src.replace(/[#?].*$/, '').replace(/[^/]+$/, '') : 'http://127.0.0.1:3000/';
    var LIKHTAR_LOGO_FALLBACK_CDN = 'https://cdn.jsdelivr.net/gh/syvyj/studio_2@main/';

    if (LIKHTAR_BASE_URL.indexOf('raw.githubusercontent.com') !== -1) {
        LIKHTAR_BASE_URL = LIKHTAR_BASE_URL
            .replace('raw.githubusercontent.com', 'cdn.jsdelivr.net/gh')
            .replace(/\/([^@/]+\/[^@/]+)\/main\//, '/$1@main/')
            .replace(/\/([^@/]+\/[^@/]+)\/master\//, '/$1@master/');
    } else if (LIKHTAR_BASE_URL.indexOf('.github.io') !== -1) {
        // e.g. https://syvyj.github.io/studio_2/ → https://cdn.jsdelivr.net/gh/syvyj/studio_2@main/
        var gitioMatch = LIKHTAR_BASE_URL.match(/https?:\/\/([^.]+)\.github\.io\/([^/]+)\//i);
        if (gitioMatch) {
            LIKHTAR_BASE_URL = 'https://cdn.jsdelivr.net/gh/' + gitioMatch[1] + '/' + gitioMatch[2] + '@main/';
        }
    }

    var LIKHTAR_LANG = (Lampa.Storage.get('language', 'uk') || 'uk').toLowerCase();
    if (LIKHTAR_LANG === 'ua') LIKHTAR_LANG = 'uk';
    if (['uk', 'ru', 'en', 'pl'].indexOf(LIKHTAR_LANG) === -1) LIKHTAR_LANG = 'en';

    var LIKHTAR_I18N = {
        hero_row_title: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        hero_row_title_full: { uk: '🔥 Новинки прокату', ru: '🔥 Новинки проката', en: '🔥 New theatrical releases', pl: '🔥 Nowości kinowe' },
        streamings_row_title: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        streamings_row_title_full: { uk: '📺 Стрімінги', ru: '📺 Стриминги', en: '📺 Streaming', pl: '📺 Serwisy streamingowe' },
        ukrainian_feed_name: { uk: 'Українська стрічка', ru: 'Украинская лента', en: 'Ukrainian feed', pl: 'Ukraiński feed' },
        polish_feed_name: { uk: 'Польська стрічка', ru: 'Польская лента', en: 'Polish feed', pl: 'Polski feed' },
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
        settings_tab_title: { uk: 'Ліхтар', ru: 'Likhtar', en: 'Likhtar', pl: 'Likhtar' },
        settings_header_info: { uk: 'Ліхтар — кастомна головна сторінка з стрімінгами, мітками якості та українською озвучкою. Автор: Likhtar Team', ru: 'Likhtar — кастомная главная страница со стримингами, метками качества и украинской озвучкой. Автор: Likhtar Team', en: 'Likhtar — custom home screen with streamings, quality badges and Ukrainian audio. Author: Likhtar Team', pl: 'Likhtar — niestandardowa strona główna ze streamingami, oznaczeniami jakości i ukraińskim dubbingiem. Autor: Likhtar Team' },
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
        var pack = LIKHTAR_I18N[key];
        if (!pack) return key;
        return pack[LIKHTAR_LANG] || pack.uk || pack.en || key;
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
        var custom = (Lampa.Storage.get('likhtar_tmdb_apikey') || '').trim();
        return custom || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '');
    }

    /** Для рядка на головній: HBO/Prime/Paramount через watch_providers (TMDB), щоб отримувати і фільми, і серіали з актуальним контентом. */
    var SERVICE_WATCH_PROVIDERS_FOR_ROW = { hbo: '384', amazon: '119', paramount: '531' };

    // =================================================================
    // UTILS & COMPONENTS
    // =================================================================

    // Один елемент геро-рядка (backdrop + overlay). heightEm — висота банеру (напр. 28).
    function makeHeroResultItem(movie, heightEm) {
        heightEm = heightEm || 22.5;
        var pad = (heightEm / 35 * 2).toFixed(1);
        var titleEm = (heightEm / 35 * 2.5).toFixed(2);
        var descEm = (heightEm / 35 * 1.1).toFixed(2);
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
                            item.append('<div class="hero-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding: ' + pad + 'em; border-radius: 0 0 1em 1em;">' +
                                '<div class="hero-title" style="font-size: ' + titleEm + 'em; font-weight: bold; color: #fff; margin-bottom: 0.25em; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">' + (movie.title || movie.name) + '</div>' +
                                '<div class="hero-desc" style="font-size: ' + descEm + 'em; color: #ddd; max-width: 60%; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">' + (movie.overview || '') + '</div></div>');
                            item.find('.card__view').remove();
                            item.find('.card__title').remove();
                            item.find('.card__age').remove();
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
                                item.append('<div class="hero-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding: ' + pad + 'em; border-radius: 0 0 1em 1em;">' +
                                    '<div class="hero-title" style="font-size: ' + titleEm + 'em; font-weight: bold; color: #fff; margin-bottom: 0.25em; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">' + (movie.title || movie.name) + '</div>' +
                                    '<div class="hero-desc" style="font-size: ' + descEm + 'em; color: #ddd; max-width: 60%; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">' + (movie.overview || '') + '</div></div>');
                                item.find('.card__view').remove();
                                item.find('.card__title').remove();
                                item.find('.card__age').remove();
                                item[0].heroMovieData = movie;
                            }
                            // Stop default image loading
                            if (this.img) this.img.onerror = function () { };
                            if (this.img) this.img.onload = function () { };
                        } catch (e) { console.log('Hero onVisible error:', e); }
                    },
                    onlyEnter: function () {
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
        { type: 'from_global', globalKey: 'LIKHTAR_UA_MOVIES', title: tr('ua_all_movies') },
        { type: 'from_global', globalKey: 'LIKHTAR_UA_SERIES', title: tr('ua_all_series') }
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
        { type: 'from_global', globalKey: 'LIKHTAR_PL_MOVIES', title: tr('pl_all_movies') },
        { type: 'from_global', globalKey: 'LIKHTAR_PL_SERIES', title: tr('pl_all_series') },
        { type: 'from_global', globalKey: 'LIKHTAR_PL_SHOWS', title: tr('pl_all_shows') }
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
    var LikhtarStudioSubscription = (function () {
        var storageKey = 'likhtar_subscription_studios';

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
            var langSubs = { en: 'My subscriptions', ru: 'Мои подписки', uk: 'Мої підписки', be: 'Мае падпіскі' };
            Lampa.Lang.add({
                title_studios_subscription: { en: 'Subscriptions', ru: 'Подписки', uk: 'Підписки', be: 'Падпіскі' },
                likhtar_my_subscriptions: langSubs
            });

            Lampa.Component.add('studios_subscription', function (object) {
                var comp = new Lampa.InteractionMain(object);
                var limitPerChannel = 20;

                comp.create = function () {
                    var _this = this;
                    this.activity.loader(true);

                    var api = window.LikhtarKinoApi;
                    if (!api || !api.getChannels || !api.main) {
                        this.empty();
                        this.activity.loader(false);
                        return this.render();
                    }

                    var channels = api.getChannels().filter(function (c) { return c.active !== false; });
                    if (!channels.length) {
                        this.empty();
                        this.activity.loader(false);
                        return this.render();
                    }

                    api.main(function (blocks) {
                        var fulldata = [];
                        if (blocks && blocks.length) {
                            blocks.forEach(function (block) {
                                if (block.results && block.results.length) {
                                    var results = block.results.slice(0, limitPerChannel).map(function (item) {
                                        return {
                                            title: item.title,
                                            release_date: item.release_date,
                                            img: item.img,
                                            youtube_id: item.video_id
                                        };
                                    });

                                    fulldata.push({
                                        title: block.title,
                                        results: results,
                                        url: '',
                                        params: {}
                                    });
                                }
                            });
                        }

                        if (fulldata.length) {
                            _this.build(fulldata);
                        } else {
                            _this.empty();
                        }
                        _this.activity.loader(false);
                    }, function () {
                        _this.empty();
                        _this.activity.loader(false);
                    });

                    return this.render();
                };

                comp.onMore = function () { };

                return comp;
            });

            var menuLine = $('<li class="menu__item selector" data-action="studios_subscription"><div class="menu__ico"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M437 75a68 68 0 00-47.5-19.5h-267A68 68 0 0075 123.5v265A68 68 0 00122.5 456h267a68 68 0 0047.5-19.5H437A68 68 0 00456.5 388.5v-265A68 68 0 00437 75zM122.5 94h267a28 28 0 0128 28v265a28 28 0 01-28 28h-267a28 28 0 01-28-28v-265a28 28 0 0128-28z"></path></svg></div><div class="menu__text">' + (Lampa.Lang.translate('likhtar_my_subscriptions') || 'Мої підписки') + '</div></li>');
            var target = $('.menu .menu__list .menu__item[data-action="subscribes"]');
            if (target.length) target.after(menuLine);
            else $('.menu .menu__list').append(menuLine);

            menuLine.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('likhtar_my_subscriptions') || 'Мої підписки',
                    component: 'studios_subscription',
                    page: 1
                });
            });
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
                Lampa.Listener.follow('activity', function (e) {
                    if (e.type === 'start' && e.component === 'company') injectButton(e.object);
                });
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
            { id: 'netflix', name: 'Netflix', img: LIKHTAR_BASE_URL + 'logos/netflix.svg', providerId: '8' },
            { id: 'disney', name: 'Disney+', img: LIKHTAR_BASE_URL + 'logos/disney.svg', providerId: '337' },
            { id: 'hbo', name: 'HBO', img: LIKHTAR_BASE_URL + 'logos/hbo.svg', providerId: '384' },
            { id: 'apple', name: 'Apple TV+', img: LIKHTAR_BASE_URL + 'logos/apple.svg', providerId: '350' },
            { id: 'amazon', name: 'Prime Video', img: LIKHTAR_BASE_URL + 'logos/amazon.png', providerId: '119' },
            { id: 'hulu', name: 'Hulu', img: LIKHTAR_BASE_URL + 'logos/Hulu.svg', providerId: '15' },
            { id: 'paramount', name: 'Paramount+', img: LIKHTAR_BASE_URL + 'logos/paramount.svg', providerId: '531' },
            { id: 'sky_showtime', name: 'Sky Showtime', img: LIKHTAR_BASE_URL + 'logos/SkyShowtime.svg' },
            { id: 'syfy', name: 'Syfy', img: LIKHTAR_BASE_URL + 'logos/Syfy.svg', networkId: '77' },
            { id: 'educational_and_reality', name: tr('educational_title'), img: LIKHTAR_BASE_URL + 'logos/Discovery.svg' },
            { id: 'ukrainian_feed', name: tr('ukrainian_feed_name'), isUkrainianFeed: true },
            { id: 'polish_feed', name: tr('polish_feed_name'), isPolishFeed: true }
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
                                        } else {
                                            var view = item.find('.card__view');
                                            view.empty();

                                            var wrapper = $('<div class="studio-logo-wrap"></div>');
                                            var imgEl = $('<img class="studio-logo-img" alt="' + s.name + '">');
                                            var fallback = $('<div class="studio-logo-fallback"></div>').text(s.name);

                                            imgEl.attr('src', s.img || '');

                                            imgEl.on('error', function () {
                                                var $img = $(this);
                                                // Один раз пробуем подтянуть официальные SVG с CDN исходного репозитория
                                                if (!$img.data('logo-fallback-tried') && s.img) {
                                                    $img.data('logo-fallback-tried', true);
                                                    var rel = s.img.replace(LIKHTAR_BASE_URL, '');
                                                    $img.attr('src', LIKHTAR_LOGO_FALLBACK_CDN + rel);
                                                    return;
                                                }
                                                $img.hide();
                                                fallback.show();
                                            });

                                            imgEl.on('load', function () {
                                                if (this.naturalWidth === 0 || this.naturalHeight === 0) {
                                                    $(this).hide();
                                                    fallback.show();
                                                } else {
                                                    fallback.hide();
                                                }
                                            });

                                            wrapper.append(imgEl).append(fallback);
                                            view.append(wrapper);

                                            checkNewContent(s, item);
                                        }
                                        item.find('.card__age, .card__year, .card__type, .card__textbox, .card__title').remove();
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
                .likhtar-service-logo {
                    display: inline-block;
                    vertical-align: middle;
                    margin-right: 0.4em;
                    margin-bottom: 0.1em;
                }
                .likhtar-service-logo img {
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
                .likhtar-more-btn {
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
                .likhtar-more-btn:hover, .likhtar-more-btn.focus {
                    background: rgba(255, 255, 255, 0.15);
                    transform: scale(1.05);
                    box-shadow: 0 0 0 3px #fff;
                }
                .likhtar-more-btn > div {
                    text-align: center;
                }
                .likhtar-more-logo {
                    margin-bottom: 0.5em;
                }
                .likhtar-more-logo svg,
                .likhtar-more-logo img {
                    width: 3.4em;
                    height: auto;
                }

            </style>
        `);
    }

    // =================================================================
    // LIKHTAR QUALITY MARKS (Jacred)
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
            if (!movie || !movie.id || !renderEl) return;
            var $render = $(renderEl);
            var rateLine = $render.find('.full-start-new__rate-line').first();
            if (!rateLine.length) return;
            if (rateLine.find('.jacred-info-marks-v2').length) return;
            var marksContainer = $('<div class="jacred-info-marks-v2"></div>');
            rateLine.prepend(marksContainer);
            console.log('[JacRed] full card: injecting marks for', movie.id, movie.title || movie.name);
            getBestJacred(movie, function (data) {
                if (data && !data.empty) {
                    renderInfoRowBadges(marksContainer, data);
                }
            });
        }

        // ——— Повна картка: подія 'full' + обробка вже відкритої (deep link ?card=...) ———
        function initFullCardMarks() {
            if (!Lampa.Listener || !Lampa.Listener.follow) return;
            Lampa.Listener.follow('full', function (e) {
                if (e.type !== 'complite') return;
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
                } catch (err) {
                    console.warn('[JacRed] full card catch-up:', err);
                }
            }, 300);
        }

        // Картки на головній: MutationObserver тільки для .card (повну картку обробляємо через подію full)
        function processCards() {
            $('.card:not(.jacred-mark-processed-v2)').each(function () {
                var card = $(this);
                card.addClass('jacred-mark-processed-v2');

                // Hero-банери зберігають movie в heroMovieData
                var movie = card[0].heroMovieData || card.data('item') || (card[0] && (card[0].card_data || card[0].item)) || null;
                if (movie && movie.id && !movie.size) {
                    // Hero-банери не мають .card__view — додаємо прямо на елемент
                    if (card.hasClass('hero-banner')) {
                        addMarksToContainer(card, movie, null);
                    } else {
                        addMarksToContainer(card, movie, '.card__view');
                    }
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

            if (data.rus) {
                var ruTag = $('<div class="full-start__pg"></div>');
                ruTag.text('RU+');
                container.append(ruTag);
            }

            if (data.ukr) {
                var uaTag = $('<div class="full-start__pg"></div>');
                uaTag.text('UA+');
                container.append(uaTag);
            }

            if (data.eng) {
                var enTag = $('<div class="full-start__pg"></div>');
                enTag.text('EN+');
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
            if (data.rus && Lampa.Storage.get('likhtar_badge_ru', true)) container.append(createBadge('ru', '🇷🇺'));
            if (data.ukr && Lampa.Storage.get('likhtar_badge_ua', true)) container.append(createBadge('ua', '🇺🇦'));
            if (data.eng && Lampa.Storage.get('likhtar_badge_en', true)) container.append(createBadge('en', '🇬🇧'));
            if (data.resolution && data.resolution !== 'SD') {
                if (data.resolution === '4K' && Lampa.Storage.get('likhtar_badge_4k', true)) container.append(createBadge('4k', '4K'));
                else if (data.resolution === 'FHD' && Lampa.Storage.get('likhtar_badge_fhd', true)) container.append(createBadge('fhd', 'FHD'));
                else if (data.resolution === 'HD' && Lampa.Storage.get('likhtar_badge_fhd', true)) container.append(createBadge('hd', 'HD'));
                else if (Lampa.Storage.get('likhtar_badge_fhd', true)) container.append(createBadge('hd', data.resolution));
            }
            if (data.hdr && Lampa.Storage.get('likhtar_badge_hdr', true)) container.append(createBadge('hdr', 'HDR'));
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
                top: 2.7em;
                left: -0.2em;
                display: flex;
                flex-direction: column;
                gap: 0.15em;
                z-index: 10;
                pointer-events: none;
            }
            /* Якщо немає TV мітки — піднімаємо на її позицію */
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
                top: 0.4em;
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
        observeCardRows();
    }


    function addServiceRows() {
        var services = ['netflix', 'apple', 'hbo', 'amazon', 'disney', 'paramount', 'sky_showtime', 'hulu', 'syfy', 'educational_and_reality'];
        var serviceSettings = {
            netflix: 'likhtar_row_today_netflix',
            apple: 'likhtar_row_today_apple',
            hbo: 'likhtar_row_today_hbo',
            amazon: 'likhtar_row_today_prime',
            disney: 'likhtar_row_today_disney',
            paramount: 'likhtar_row_today_paramount',
            sky_showtime: 'likhtar_row_today_sky',
            hulu: 'likhtar_row_today_hulu'
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
                        if (scrollBody.length && !scrollBody.data('likhtar-more-observed')) {
                            scrollBody.data('likhtar-more-observed', true);

                            var moreLabel = tr('go_to_page');
                            var iconHtml = config.icon ? '<div class="likhtar-more-logo">' + config.icon + '</div>' : '';
                            var moreCard = $('<div class="card selector likhtar-more-btn"><div>' + iconHtml + '<div>' + moreLabel + '</div><span style="color: #90caf9; font-size: 0.85em; display: block; margin-top: 0.4em;">' + config.title + '</span></div></div>');

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

            // Те саме для Української та Польської стрічок
            $('.items-line').each(function () {
                var line = $(this);
                var titleText = line.find('.items-line__title').text().trim();
                var scrollBody = line.find('.scroll__body');
                if (!scrollBody.length) return;

                var isUA = titleText.indexOf('української стрічки') !== -1;
                var isPL = titleText.indexOf('польської стрічки') !== -1;
                if (!isUA && !isPL) return;

                var dataKey = isUA ? 'likhtar-more-ua' : 'likhtar-more-pl';
                if (scrollBody.data(dataKey)) return;
                scrollBody.data(dataKey, true);

                var label = isUA ? tr('ukrainian_feed_name') : tr('polish_feed_name');
                var comp = isUA ? 'ukrainian_feed' : 'polish_feed';

                // Додаємо order: 9999;
                var moreCard = $('<div class="card selector likhtar-more-btn"><div><br>' + tr('go_to_page') + '<br><span style="color: #ffd700; font-size: 0.85em; display: block; margin-top: 0.4em;">' + label + '</span></div></div>');

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
            component: 'likhtar_plugin',
            name: tr('settings_tab_title'),
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21h6m-3-18v1m-6.36 1.64l.7.71m12.02-.71l-.7.71M4 12H3m18 0h-1M8 12a4 4 0 108 0 4 4 0 00-8 0zm-1 5h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { type: 'title' },
            field: { name: tr('settings_header_info') }
        });

        // === API TMDB ===
        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { type: 'title' },
            field: { name: 'API TMDB' }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_tmdb_apikey', type: 'input', placeholder: tr('settings_tmdb_input_placeholder'), values: '', default: '' },
            field: { name: tr('settings_tmdb_input_name'), description: tr('settings_tmdb_input_desc') }
        });

        // === Секція: Секції головної ===
        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { type: 'title' },
            field: { name: tr('settings_sections_title') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_hero', type: 'trigger', default: true },
            field: { name: tr('settings_hero_name'), description: tr('settings_hero_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_section_streamings', type: 'trigger', default: true },
            field: { name: tr('settings_streamings_name'), description: tr('settings_streamings_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_section_mood', type: 'trigger', default: true },
            field: { name: tr('settings_mood_name'), description: tr('settings_mood_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_ru_feed', type: 'trigger', default: true },
            field: { name: tr('settings_row_ru_name'), description: tr('settings_row_ru_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_ua_feed', type: 'trigger', default: true },
            field: { name: tr('settings_row_ua_name'), description: tr('settings_row_ua_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_en_feed', type: 'trigger', default: true },
            field: { name: tr('settings_row_en_name'), description: tr('settings_row_en_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_pl_feed', type: 'trigger', default: true },
            field: { name: tr('settings_row_pl_name'), description: tr('settings_row_pl_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_kinooglad_enabled', type: 'trigger', default: true },
            field: { name: tr('settings_kinooglad_name'), description: tr('settings_kinooglad_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_today_netflix', type: 'trigger', default: true },
            field: { name: tr('settings_today_netflix_name'), description: tr('settings_today_netflix_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_today_apple', type: 'trigger', default: true },
            field: { name: tr('settings_today_apple_name'), description: tr('settings_today_apple_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_today_hbo', type: 'trigger', default: true },
            field: { name: tr('settings_today_hbo_name'), description: tr('settings_today_hbo_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_today_prime', type: 'trigger', default: true },
            field: { name: tr('settings_today_prime_name'), description: tr('settings_today_prime_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_today_disney', type: 'trigger', default: true },
            field: { name: tr('settings_today_disney_name'), description: tr('settings_today_disney_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_today_paramount', type: 'trigger', default: true },
            field: { name: tr('settings_today_paramount_name'), description: tr('settings_today_paramount_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_today_sky', type: 'trigger', default: true },
            field: { name: tr('settings_today_sky_name'), description: tr('settings_today_sky_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_row_today_hulu', type: 'trigger', default: true },
            field: { name: tr('settings_today_hulu_name'), description: tr('settings_today_hulu_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { type: 'title' },
            field: { name: tr('settings_badges_title') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_badge_ru', type: 'trigger', default: true },
            field: { name: tr('settings_badge_ru_name'), description: tr('settings_badge_ru_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_badge_ua', type: 'trigger', default: true },
            field: { name: tr('settings_badge_ua_name'), description: tr('settings_badge_ua_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_badge_en', type: 'trigger', default: true },
            field: { name: tr('settings_badge_en_name'), description: tr('settings_badge_en_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_badge_4k', type: 'trigger', default: true },
            field: { name: tr('settings_badge_4k_name'), description: tr('settings_badge_4k_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_badge_fhd', type: 'trigger', default: true },
            field: { name: tr('settings_badge_fhd_name'), description: tr('settings_badge_fhd_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_plugin',
            param: { name: 'likhtar_badge_hdr', type: 'trigger', default: true },
            field: { name: tr('settings_badge_hdr_name'), description: tr('settings_badge_hdr_desc') }
        });
    }

    function initKinoogladModule() {
        if (window.plugin_kinoohlyad_ready) return;
        window.plugin_kinoohlyad_ready = true;
        var KINO_CHANNEL_I18N_KEYS = {
            'UCHCpzrgaW9vFS4dGrmPmZNw': 'kino_ch_navkolo_kino',
            'UCXUMAOsX27mm8M_f18RpzIQ': 'kino_ch_serialy_kino',
            'UCvY63ZphoNcDKpt5WK5Nbhg': 'kino_ch_ekino_ua',
            'UCig7t6LFOjS2fKkhjbVLpjw': 'kino_ch_zagin_kinomaniv',
            'UCIwXIJlsAcEQJ2lNVva7W0A': 'kino_ch_moi_dumky',
            'UC3_JBeV9tvTb1nSRDh7ANXw': 'kino_ch_kino_navuvorit'
        };

        function getKinoChannelDisplayName(channel) {
            if (!channel || !channel.id) return channel && channel.name ? channel.name : tr('kino_channel_generic');
            var key = KINO_CHANNEL_I18N_KEYS[String(channel.id).trim()];
            if (!key) return channel.name || tr('kino_channel_generic');
            var localized = tr(key);
            return localized || channel.name || tr('kino_channel_generic');
        }

        var KinoApi = {
            proxies: [
                'https://api.allorigins.win/raw?url=',
                'https://api.allorigins.win/get?url=',
                'https://corsproxy.io/?url=',
                'https://api.codetabs.com/v1/proxy?quest=',
                'https://thingproxy.freeboard.io/fetch/'
            ],
            // Стартовий список каналів тепер порожній — користувач додає їх сам
            defaultChannels: [],
            getChannels: function () {
                var stored = Lampa.Storage.get('kino_channels', '[]');
                var channels;
                if (typeof stored === 'string') {
                    try {
                        channels = JSON.parse(stored);
                    } catch (e) {
                        channels = [];
                    }
                } else if (Array.isArray(stored)) {
                    channels = stored;
                } else {
                    channels = [];
                }
                if (!channels || !channels.length) return [];

                var removedDefaultIds = {
                    'UCHCpzrgaW9vFS4dGrmPmZNw': true,
                    'UCXUMAOsX27mm8M_f18RpzIQ': true,
                    'UCvY63ZphoNcDKpt5WK5Nbhg': true,
                    'UCig7t6LFOjS2fKkhjbVLpjw': true,
                    'UCIwXIJlsAcEQJ2lNVva7W0A': true,
                    'UC3_JBeV9tvTb1nSRDh7ANXw': true
                };

                var seen = {};
                channels = channels.filter(function (c) {
                    var raw = String(c.id || '').trim();
                    var id = raw.toLowerCase();
                    if (!raw) return false;
                    if (removedDefaultIds[raw] || removedDefaultIds[id]) return false;
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

                function tryProxy(idx) {
                    if (idx >= _this.proxies.length) {
                        callback(new Error('resolve_failed'));
                        return;
                    }
                    var proxy = _this.proxies[idx];
                    var url = proxy + (proxy.indexOf('corsproxy') > -1 ? pageUrl : encodedPage);
                    $.get(url).done(function (html) {
                        var str = typeof html === 'string' ? html : (html && html.contents) ? html.contents : '';
                        var m = str.match(/"externalId"\s*:\s*"(UC[\w-]{22})"/) ||
                            str.match(/"channelId"\s*:\s*"(UC[\w-]{22})"/) ||
                            str.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
                        if (m && m[1]) {
                            callback(null, { id: m[1], name: cleanHandle });
                        } else {
                            tryProxy(idx + 1);
                        }
                    }).fail(function () { tryProxy(idx + 1); });
                }
                tryProxy(0);
            },
            resolveVideoToChannelId: function (videoId, callback) {
                var _this = this;
                var cleanId = String(videoId).trim();
                if (!cleanId) return callback(new Error('no_video_id'));

                var pageUrl = 'https://www.youtube.com/watch?v=' + encodeURIComponent(cleanId);
                var encodedPage = encodeURIComponent(pageUrl);

                function tryProxy(idx) {
                    if (idx >= _this.proxies.length) {
                        callback(new Error('resolve_failed'));
                        return;
                    }
                    var proxy = _this.proxies[idx];
                    var url = proxy + (proxy.indexOf('corsproxy') > -1 ? pageUrl : encodedPage);
                    $.get(url).done(function (html) {
                        var str = typeof html === 'string' ? html : (html && html.contents) ? html.contents : '';
                        var m = str.match(/"channelId"\s*:\s*"(UC[\w-]{22})"/);
                        if (m && m[1]) {
                            var nameMatch = str.match(/"ownerChannelName"\s*:\s*"(.*?)"/);
                            var name = nameMatch && nameMatch[1] ? nameMatch[1] : cleanId;
                            callback(null, { id: m[1], name: name });
                        } else {
                            tryProxy(idx + 1);
                        }
                    }).fail(function () { tryProxy(idx + 1); });
                }
                tryProxy(0);
            },
            fetch: function (channel, oncomplite, onerror) {
                var _this = this;
                var id = String(channel.id).trim();
                var isChannelId = /^UC[\w-]{22}$/.test(id);

                function doFetch(feedUrl) {
                    var url = feedUrl;
                    var encodedUrl = encodeURIComponent(url);

                    function tryFetch(index) {
                        if (index >= _this.proxies.length) {
                            console.log('Kinoohlyad: All proxies failed for ' + channel.name);
                            onerror();
                            return;
                        }

                        var currentProxy = _this.proxies[index];
                        var fetchUrl = currentProxy + encodedUrl;

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
                                // console.log('Kinoohlyad: Success via ' + currentProxy);
                                oncomplite(items);
                            } else {
                                tryFetch(index + 1);
                            }
                        }).fail(function () {
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
                    var fetchUrl = currentProxy + encodedUrl;

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
                    onerror();
                    return;
                }

                var maxVideosPerChannel = 7;
                var promises = channels.map(function (channel) {
                    return new Promise(function (resolve) {
                        _this.fetch(channel, function (items) {
                            resolve({ title: channel.name, channelId: channel.id, results: items.slice(0, maxVideosPerChannel) });
                        }, function () {
                            resolve({ title: channel.name, channelId: channel.id, results: [] });
                        });
                    });
                });

                Promise.all(promises).then(function (results) {
                    var withVideos = results.filter(function (res) { return res.results.length > 0; });
                    var withoutVideos = results.filter(function (res) { return res.results.length === 0; });

                    withVideos.sort(function (a, b) {
                        var dateA = a.results[0] ? new Date(a.results[0].release_date) : 0;
                        var dateB = b.results[0] ? new Date(b.results[0].release_date) : 0;
                        return dateB - dateA;
                    });

                    var sorted = withVideos.concat(withoutVideos);
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

        if (!window.LikhtarKinoApi) {
            window.LikhtarKinoApi = KinoApi;
        }

        function KinoCard(data) {
            this.build = function () {
                this.card = Lampa.Template.get('kino_card', {});
                this.img = this.card.find('img')[0];

                this.card.find('.card__title').text(data.title);
                var date = data.release_date ? data.release_date.split('-').reverse().join('.') : '';
                this.card.find('.card__date').text(date);
            };

            this.image = function () {
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
                    if (_this.onFocus) _this.onFocus(e.target, data);
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
            var scroll = new Lampa.Scroll({ horizontal: true, step: 600 });
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
                if (data.channelId) this.appendChannelLink(data.channelId);
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

            this.appendChannelLink = function (channelId) {
                var _this = this;
                var url = /^UC[\w-]{22}$/.test(channelId)
                    ? 'https://www.youtube.com/channel/' + channelId
                    : 'https://www.youtube.com/@' + channelId;
                var cardEl = $('<div class="card selector card--wide layer--render layer--visible kino-card kino-card--channel">' +
                    '<div class="card__view"><img src="./img/img_load.svg" class="card__img" alt=""></div>' +
                    '<div class="card__title">На канал автора</div>' +
                    '<div class="card__date" style="font-size: 0.8em; opacity: 0.7; margin-top: 0.3em;">YouTube</div></div>');
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

        // Додаємо візуальний розділювач у налаштуваннях Ліхтаря
                Lampa.SettingsApi.addParam({
                    component: 'likhtar_plugin',
                    param: { type: 'title' },
                    field: { name: tr('kino_settings_title') }
                });

                Lampa.SettingsApi.addParam({
                    component: 'likhtar_plugin',
                    param: { name: 'kinooglad_add_channel', type: 'button' },
                    field: { name: tr('kino_add_channel_name'), description: tr('kino_add_channel_desc') },
                    onChange: function () {
                        Lampa.Input.edit({ title: tr('kino_add_channel_input'), value: '', free: true, nosave: true }, function (value) {
                            var parsed = parseChannelInput(value);
                            if (!parsed) return;
                            var ch = KinoApi.getChannels();
                            var rawId = String(parsed.id).trim();
                            var idNorm = rawId.toLowerCase();
                            if (ch.some(function (c) { return String(c.id).trim().toLowerCase() === idNorm; })) return;
                            var isUc = /^UC[\w-]{22}$/.test(rawId);
                            if (isUc) {
                                ch.push({ name: parsed.name, id: parsed.id, active: true });
                                KinoApi.saveChannels(ch);
                                if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                return;
                            }
                            if (rawId.indexOf('vid:') === 0) {
                                var videoId = rawId.slice(4);
                                KinoApi.resolveVideoToChannelId(videoId, function (err, resolved) {
                                    if (!err && resolved && resolved.id) {
                                        var existsById = ch.some(function (c) { return String(c.id).trim().toLowerCase() === String(resolved.id).trim().toLowerCase(); });
                                        if (!existsById) {
                                            ch.push({ name: resolved.name || parsed.name, id: resolved.id, active: true });
                                        }
                                    }
                                    KinoApi.saveChannels(ch);
                                    if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                });
                            } else {
                                KinoApi.resolveHandleToChannelId(parsed.id, function (err, resolved) {
                                    if (!err && resolved && resolved.id) {
                                        var exists = ch.some(function (c) { return String(c.id).trim() === resolved.id; });
                                        if (!exists) {
                                            ch.push({ name: resolved.name || parsed.name, id: resolved.id, active: true });
                                        }
                                    } else {
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
                    component: 'likhtar_plugin',
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
                            component: 'likhtar_plugin',
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
                            component: 'likhtar_plugin',
                            param: { name: 'kinooglad_ch_' + idx + '_delete', type: 'button' },
                            field: { name: tr('kino_channel_delete_btn') },
                            onRender: function (item) {
                                var ch = KinoApi.getChannels()[idx];
                                if (!ch) { item.hide(); return; }
                                item.show();
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
                width: 20em !important;
                margin: 0 1em 1em 0 !important;
                aspect-ratio: 16/9;
                display: inline-block !important;
                vertical-align: top;
            }
            .kino-card .card__title {
                font-size: 1em;
            }
            .kino-card .card__view {
                padding-bottom: 56.25% !important;
            }
            .kino-card .card__img {
                object-fit: cover !important;
                height: 100% !important;
                border-radius: 0.3em;
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
                var btn = $('<li class="menu__item selector" data-action="kinoohlyad"><div class="menu__ico"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg></div><div class="menu__text">' + btnTitle + '</div></li>');

                btn.on('hover:enter click', action);

                $('.menu .menu__list').eq(0).append(btn);
            }

            function addSettings() {
                // Пункт «Кіноогляд» і панель з кнопкою реєструються в setupKinoogladSettings() через SettingsApi (як Ліхтар).
                // Тут лише перевірка увімкнення плагіна для меню та панелі.
            }

            if (Lampa.Storage.get('likhtar_kinooglad_enabled', true)) {
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
        LikhtarStudioSubscription.init();

        addStyles();

        overrideApi();

        if (Lampa.Storage.get('likhtar_row_hero', true)) {
            addHeroRow();
        }
        removeShotsSection();

        if (Lampa.Storage.get('likhtar_section_streamings', true)) {
            addStudioRow();
        }

        if (Lampa.Storage.get('likhtar_section_mood', true)) {
            addMoodRow();
        }

        if (Lampa.Storage.get('likhtar_row_ru_feed', true)) {
            addRussianContentRow();
        }
        if (Lampa.Storage.get('likhtar_row_ua_feed', true)) {
            addUkrainianContentRow();
        }
        if (Lampa.Storage.get('likhtar_row_en_feed', true)) {
            addEnglishContentRow();
        }
        if (Lampa.Storage.get('likhtar_row_pl_feed', true)) {
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

    function runInit() {
        try {
            initMarksJacRed();
            init();
            window.LIKHTAR_STUDIOS_LOADED = true;
        } catch (err) {
            window.LIKHTAR_STUDIOS_ERROR = (err && err.message) ? err.message : String(err);
            if (typeof console !== 'undefined' && console.error) {
                console.error('[Likhtar Studios]', err);
            }
        }
    }

    if (window.appready) runInit();
    else if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') runInit();
        });
    } else {
        window.LIKHTAR_STUDIOS_ERROR = 'Lampa.Listener not found';
    }

})();
