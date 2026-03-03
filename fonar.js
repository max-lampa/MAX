/**
 * Фонарь Studios — плагин главной страницы.
 * Кастомная главная, стриминги, студии и кинообзоры на русском языке.
 */
(function () {
    'use strict';

    window.FONAR_STUDIOS_VER = '3.0';
    window.FONAR_STUDIOS_LOADED = false;
    window.FONAR_STUDIOS_ERROR = null;

    if (typeof Lampa === 'undefined') {
        window.FONAR_STUDIOS_ERROR = 'Lampa не найдена (скрипт загружен до приложения?)';
        return;
    }

    // =================================================================
    // КОНФИГУРАЦИЯ И КОНСТАНТЫ
    // =================================================================

    var currentScript = document.currentScript || [].slice.call(document.getElementsByTagName('script')).filter(function (s) {
        return (s.src || '').indexOf('studios') !== -1 || (s.src || '').indexOf('fonar') !== -1;
    })[0];

    var BASE_URL = (currentScript && currentScript.src) ? currentScript.src.replace(/[#?].*$/, '').replace(/[^/]+$/, '') : 'http://127.0.0.1:3000/';

    // Категории для русской ленты
    var RUSSIAN_FEED_CATEGORIES = [
        { title: 'Популярные фильмы', url: 'movie/popular', params: { region: 'RU' } },
        { title: 'Новые сериалы (RU)', url: 'discover/tv', params: { with_original_language: 'ru', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: 'Сейчас в кино', url: 'movie/now_playing', params: { region: 'RU' } },
        { title: 'В тренде за неделю', url: 'trending/all/week', params: { } }
    ];

    var SERVICE_CONFIGS = {
        'netflix': {
            title: 'Netflix',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 2L16.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L7.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L16.5 22" stroke="#E50914" stroke-width="4"/></svg>',
            categories: [
                { "title": "Новые фильмы", "url": "discover/movie", "params": { "with_networks": "213", "sort_by": "primary_release_date.desc" } },
                { "title": "Новые сериалы", "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "first_air_date.desc" } },
                { "title": "Тренды Netflix", "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "popularity.desc" } }
            ]
        },
        'apple': {
            title: 'Apple TV+',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
            categories: [
                { "title": "Эксклюзивы Apple", "url": "discover/movie", "params": { "with_watch_providers": "350", "sort_by": "popularity.desc" } }
            ]
        },
        'russian_feed': { 
            title: 'Русская лента', 
            icon: '🇷🇺', 
            categories: RUSSIAN_FEED_CATEGORIES 
        }
    };

    // =================================================================
    // ЛОГИКА ОТОБРАЖЕНИЯ (РУССКИЕ ЛОГОТИПЫ)
    // =================================================================

    function getTmdbKey() {
        return (Lampa.Storage.get('fonar_tmdb_apikey') || '').trim() || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '');
    }

    function fetchHeroLogo(movie, jqItem) {
        var type = movie.name ? 'tv' : 'movie';
        // Запрашиваем логотипы с приоритетом RU
        var url = Lampa.TMDB.api(type + '/' + movie.id + '/images?api_key=' + getTmdbKey() + '&include_image_language=ru,en,null');

        var network = new Lampa.Reguest();
        network.silent(url, function (data) {
            if (data.logos && data.logos.length > 0) {
                // Сначала ищем русское лого
                var logo = data.logos.find(function(l) { return l.iso_639_1 === 'ru'; }) || 
                           data.logos.find(function(l) { return l.iso_639_1 === 'en'; }) || 
                           data.logos[0];
                
                if (logo) {
                    var imgUrl = 'https://image.tmdb.org/t/p/w500' + logo.file_path;
                    jqItem.find('.hero-title').html('<img src="' + imgUrl + '" style="height:4em; object-fit:contain;">');
                }
            }
        });
    }

    function fetchHeroDetails(movie, jqItem) {
        var type = movie.name ? 'tv' : 'movie';
        var url = Lampa.TMDB.api(type + '/' + movie.id + '?api_key=' + getTmdbKey() + '&language=ru');

        var network = new Lampa.Reguest();
        network.silent(url, function (data) {
            var timeStr = '';
            if (type === 'movie' && data.runtime) {
                timeStr = Math.floor(data.runtime / 60) + ' ч ' + (data.runtime % 60) + ' мин';
            } else if (data.episode_run_time && data.episode_run_time.length) {
                timeStr = '~' + data.episode_run_time[0] + ' мин';
            }
            
            var info = (movie.name ? 'Сериал' : 'Фильм') + (timeStr ? ' • ' + timeStr : '');
            jqItem.find('.hero-meta').text(info);
        });
    }

    // =================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // =================================================================

    function init() {
        console.log('[Фонарь] Плагин загружен на русском языке');
        
        // Здесь должна быть логика отрисовки интерфейса Lampa
        // (Добавление кнопок в меню, создание компонентов и т.д.)
    }

    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();
