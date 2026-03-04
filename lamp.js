/**
 * Лихтар Studios2 — плагин главной страницы (Likhtar Team).
 * Кастомная главная, стриминги, студии, подписки на студии, Кинообзор.
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

    if (LIKHTAR_BASE_URL.indexOf('raw.githubusercontent.com') !== -1) {
        LIKHTAR_BASE_URL = LIKHTAR_BASE_URL
            .replace('raw.githubusercontent.com', 'cdn.jsdelivr.net/gh')
            .replace(/\/([^@/]+\/[^@/]+)\/main\//, '/$1@main/')
            .replace(/\/([^@/]+\/[^@/]+)\/master\//, '/$1@master/');
    } else if (LIKHTAR_BASE_URL.indexOf('.github.io') !== -1) {
        var gitioMatch = LIKHTAR_BASE_URL.match(/https?:\/\/([^.]+)\.github\.io\/([^/]+)\//i);
        if (gitioMatch) {
            LIKHTAR_BASE_URL = 'https://cdn.jsdelivr.net/gh/' + gitioMatch[1] + '/' + gitioMatch[2] + '@main/';
        }
    }

    // НОВАЯ: РУССКАЯ ЛЕНТА
    var RUSSIAN_FEED_CATEGORIES = [
        { title: 'Новые русские фильмы', url: 'discover/movie', params: { with_origin_country: 'RU', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: 'Новые русские сериалы', url: 'discover/tv', params: { with_origin_country: 'RU', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: 'В тренде в России', url: 'discover/movie', params: { with_origin_country: 'RU', sort_by: 'popularity.desc' } },
        { title: 'Русские сериалы в тренде', url: 'discover/tv', params: { with_origin_country: 'RU', sort_by: 'popularity.desc' } },
        { title: 'Лучшие русские фильмы', url: 'discover/movie', params: { with_origin_country: 'RU', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } }
    ];

    var UKRAINIAN_FEED_CATEGORIES = [
        { title: 'Новые украинские фильмы', url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: 'Новые украинские сериалы', url: 'discover/tv', params: { with_origin_country: 'UA', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: 'В тренде в Украине', url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'popularity.desc' } },
        { title: 'Украинские сериалы в тренде', url: 'discover/tv', params: { with_origin_country: 'UA', sort_by: 'popularity.desc' } },
        { title: 'Лучшие украинские фильмы', url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } }
    ];

    var SERVICE_CONFIGS = {
        'netflix': {
            title: 'Netflix',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 2L16.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L7.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L16.5 22" stroke="#E50914" stroke-width="4"/></svg>',
            categories: [
                { "title": "Новые фильмы", "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "RU", "sort_by": "primary_release_date.desc", "vote_count.gte": "5" } },
                { "title": "Новые сериалы", "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "first_air_date.desc", "vote_count.gte": "5" } },
                { "title": "В тренде на Netflix", "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "popularity.desc" } },
                { "title": "Экшн и Блокбастеры", "url": "discover/movie", "params": { "with_companies": "213", "with_genres": "28,12", "sort_by": "popularity.desc" } },
                { "title": "Фантастические миры", "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "10765", "sort_by": "vote_average.desc", "vote_count.gte": "200" } },
                { "title": "K-Dramas (Корейские сериалы)", "url": "discover/tv", "params": { "with_networks": "213", "with_original_language": "ko", "sort_by": "popularity.desc" } }
            ]
        },
        'apple': {
            title: 'Apple TV+',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
            categories: [
                { "title": "Новые фильмы", "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "RU", "sort_by": "primary_release_date.desc", "vote_count.gte": "5" } },
                { "title": "Новые сериалы", "url": "discover/tv", "params": { "with_watch_providers": "350", "watch_region": "RU", "sort_by": "first_air_date.desc", "vote_count.gte": "5" } },
                { "title": "Хиты Apple TV+", "url": "discover/tv", "params": { "with_watch_providers": "350", "watch_region": "RU", "sort_by": "popularity.desc" } }
            ]
        },
        'russian_feed': { title: 'Русская лента', icon: '🇷🇺', categories: RUSSIAN_FEED_CATEGORIES },
        'ukrainian_feed': { title: 'Украинская лента', icon: '🇺🇦', categories: UKRAINIAN_FEED_CATEGORIES }
    };

    function getTmdbKey() {
        var custom = (Lampa.Storage.get('likhtar_tmdb_apikey') || '').trim();
        return custom || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '');
    }

    // --- Утилиты для вывода времени и метаданных на русском ---
    function fetchHeroDetails(movie, jqItem, metaEm) {
        var metaContainer = jqItem.find('.hero-meta-dynamic');
        if (!metaContainer.length) return;

        function renderDetails(details) {
            var html = '';
            if (details.age) html += '<span style="border: 1px solid rgba(255,255,255,0.4); padding: 0.1em 0.3em; border-radius: 0.2em; font-size: 0.9em;">' + details.age + '</span>';
            if (details.country) html += '<span>' + details.country + '</span>';
            if (details.time) html += '<span>' + details.time + '</span>';
            metaContainer.html(html);
        }

        var type = movie.name ? 'tv' : 'movie';
        var lang = Lampa.Storage.get('language', 'ru'); // Установлен ru
        var url = Lampa.TMDB.api(type + '/' + movie.id + '?api_key=' + getTmdbKey() + '&language=' + lang);

        var network = new Lampa.Reguest();
        network.silent(url, function (data) {
            var details = { age: '', country: '', time: '' };
            if (type === 'movie' && data.runtime) {
                var h = Math.floor(data.runtime / 60);
                var m = data.runtime % 60;
                details.time = (h > 0 ? h + ' ч ' : '') + m + ' мин'; // Перевод времени
            } else if (type === 'tv' && data.episode_run_time && data.episode_run_time.length) {
                details.time = '~' + data.episode_run_time[0] + ' мин';
            }
            if (data.production_countries && data.production_countries.length > 0) {
                details.country = data.production_countries[0].iso_3166_1;
            }
            renderDetails(details);
        });
    }

    function makeHeroResultItem(movie, heightEm) {
        var year = (movie.release_date || movie.first_air_date || '').substr(0, 4);
        var rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
        var typeStr = movie.name ? 'Сериал' : 'Фильм'; // Перевод типа

        var metaHtml = '<div class="hero-meta" style="...">';
        if (rating && rating !== '0.0') metaHtml += '<span>Оценка: ' + rating + '</span>';
        if (year) metaHtml += '<span>' + year + '</span>';
        metaHtml += '<span>•</span><span>' + typeStr + '</span>';
        metaHtml += '</div>';
        // ... (остальная логика рендеринга)
    }

    // Инициализация...
    function init() {
        console.log('[Likhtar Studios] Initialized in Russian');
    }

    if (window.appready) init();
})();
