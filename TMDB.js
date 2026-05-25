(function () {
    'use strict';

    if (window.top_ratings_plugin) return;
    window.top_ratings_plugin = true;

    var API_BASE    = 'https://api.themoviedb.org/3';
    var YEARS_BACK  = 5;
    var PAGES_TO_LOAD = 10; // 200 записей на запрос

    // ─── Категории ───────────────────────────────────────────────────────────────
    var CATEGORIES = [
        // ── Общий топ ──
        {
            title: 'Топ по популярности',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><path fill="#FFD700" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
            bg: '#1a1a2e', type: 'all'
        },
        {
            title: 'Случайный выбор',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><rect x="3" y="3" width="18" height="18" rx="3" fill="#9C27B0"/><circle fill="white" cx="8" cy="8" r="1.8"/><circle fill="white" cx="16" cy="16" r="1.8"/><circle fill="white" cx="12" cy="12" r="1.8"/></svg>',
            bg: '#150a1a', type: 'random'
        },

        // ── Фильмы ──
        {
            title: 'Топ Фильмы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><path fill="#E50914" d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
            bg: '#1a0a0a', type: 'movies'
        },
        {
            title: 'Новые Фильмы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#33C758" cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">NEW</text></svg>',
            bg: '#0a1a0a', type: 'new_movies'
        },
        {
            title: 'Фильмы 8+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#FF8C00" cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="11" font-weight="bold">8+</text></svg>',
            bg: '#1a0f00', type: 'top_movies_8'
        },
        {
            title: 'Фильмы 7+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#FFA500" cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="11" font-weight="bold">7+</text></svg>',
            bg: '#1a1200', type: 'top_movies_7'
        },
        {
            title: 'Фильмы 6+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#FFD700" cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="11" font-weight="bold">6+</text></svg>',
            bg: '#1a1500', type: 'top_movies_6'
        },

        // ── Сериалы ──
        {
            title: 'Топ Сериалы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><path fill="#4285F4" d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V7h18v10z"/></svg>',
            bg: '#0a0a1a', type: 'tv'
        },
        {
            title: 'Новые Сериалы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#4285F4" cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">NEW</text></svg>',
            bg: '#0a0a1a', type: 'new_tv'
        },
        {
            title: 'Сериалы 8+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#1565C0" cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="11" font-weight="bold">8+</text></svg>',
            bg: '#070d1a', type: 'top_tv_8'
        },
        {
            title: 'Сериалы 7+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#1976D2" cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="11" font-weight="bold">7+</text></svg>',
            bg: '#080e1a', type: 'top_tv_7'
        },
        {
            title: 'Сериалы 6+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#42A5F5" cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="11" font-weight="bold">6+</text></svg>',
            bg: '#091220', type: 'top_tv_6'
        },

        // ── По жанрам ──
        {
            title: 'Боевики',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#D32F2F" cx="12" cy="12" r="10"/><path fill="white" d="M8 12h8M12 8v8" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>',
            bg: '#1a0404', type: 'genre_action'
        },
        {
            title: 'Комедии',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#F9A825" cx="12" cy="12" r="10"/><path fill="white" d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle fill="white" cx="9" cy="10" r="1.2"/><circle fill="white" cx="15" cy="10" r="1.2"/></svg>',
            bg: '#1a1400', type: 'genre_comedy'
        },
        {
            title: 'Ужасы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#212121" cx="12" cy="12" r="10"/><path fill="white" d="M12 4c-4.4 0-8 3.6-8 8 0 2.5 1.2 4.8 3 6.2V20h10v-1.8c1.8-1.4 3-3.7 3-6.2 0-4.4-3.6-8-8-8z"/><path fill="#212121" d="M9 14h1.5v2H9zm4.5 0H15v2h-1.5z"/></svg>',
            bg: '#0d0d0d', type: 'genre_horror'
        },
        {
            title: 'Фантастика',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#0D47A1" cx="12" cy="12" r="10"/><path fill="white" d="M12 6l1.5 3.5L17 11l-2.5 2.5.5 3.5L12 15.5 9 17l.5-3.5L7 11l3.5-1.5z"/></svg>',
            bg: '#020d1a', type: 'genre_scifi'
        },
        {
            title: 'Триллеры',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#37474F" cx="12" cy="12" r="10"/><path fill="white" d="M12 7v5l3 3-1 1-3.5-3.5V7z"/></svg>',
            bg: '#0d1214', type: 'genre_thriller'
        },
        {
            title: 'Мелодрамы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#E91E63" cx="12" cy="12" r="10"/><path fill="white" d="M12 17l-1.4-1.3C7.4 12.4 5 10.3 5 7.7 5 5.6 6.6 4 8.5 4c1.1 0 2.1.5 2.8 1.3L12 6.1l.7-.8C13.4 4.5 14.4 4 15.5 4 17.4 4 19 5.6 19 7.7c0 2.6-2.4 4.7-5.6 8z"/></svg>',
            bg: '#1a0412', type: 'genre_romance'
        },
        {
            title: 'Аниме',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#FF4081" cx="12" cy="12" r="10"/><circle fill="white" cx="9" cy="11" r="2.5"/><circle fill="white" cx="15" cy="11" r="2.5"/><circle fill="#FF4081" cx="9" cy="11" r="1.2"/><circle fill="#FF4081" cx="15" cy="11" r="1.2"/><path fill="white" d="M9 15.5c0 0 1 1.5 3 1.5s3-1.5 3-1.5" stroke="white" fill="none" stroke-width="1.2" stroke-linecap="round"/></svg>',
            bg: '#1a0010', type: 'genre_anime'
        },
        {
            title: 'Документальные',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#00796B" cx="12" cy="12" r="10"/><rect fill="white" x="7" y="8" width="10" height="2" rx="1"/><rect fill="white" x="7" y="11" width="10" height="2" rx="1"/><rect fill="white" x="7" y="14" width="6" height="2" rx="1"/></svg>',
            bg: '#001a17', type: 'genre_documentary'
        },

        // ── Русский контент ──
        {
            title: 'Русские Фильмы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" width="36" height="24"><rect width="36" height="8" fill="#FFFFFF"/><rect y="8" width="36" height="8" fill="#0039A6"/><rect y="16" width="36" height="8" fill="#D52B1E"/></svg>',
            bg: '#1a0808', type: 'ru_movies'
        },
        {
            title: 'Русские Сериалы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" width="36" height="24"><rect width="36" height="8" fill="#FFFFFF"/><rect y="8" width="36" height="8" fill="#0039A6"/><rect y="16" width="36" height="8" fill="#D52B1E"/></svg>',
            bg: '#08081a', type: 'ru_tv'
        },

        // ── Свежее за 3 месяца ──
        {
            title: 'Топ за 3 мес.',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#FF6B35" cx="12" cy="12" r="10"/><path fill="white" d="M12 6v6l4 2-1 1.7-5-3V6z"/></svg>',
            bg: '#1a0f00', type: 'recent_top'
        },
        {
            title: 'Новинки 6+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle fill="#00ACC1" cx="12" cy="12" r="10"/><path fill="white" d="M12 6v6l4 2-1 1.7-5-3V6z"/><text x="12" y="22" text-anchor="middle" fill="white" font-size="5" font-weight="bold">6+</text></svg>',
            bg: '#001a1f', type: 'recent_6plus'
        },

        // ── Мировые хиты ──
        {
            title: 'Голливуд',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" width="36" height="24"><rect width="12" height="24" fill="#B22234"/><rect x="12" width="12" height="24" fill="#FFFFFF"/><rect x="24" width="12" height="24" fill="#3C3B6E"/><rect y="4" width="36" height="3" fill="white" opacity="0.8"/><rect y="11" width="36" height="3" fill="white" opacity="0.8"/><rect y="18" width="36" height="3" fill="white" opacity="0.8"/></svg>',
            bg: '#0a0a1f', type: 'us_movies'
        },
        {
            title: 'Корейские',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" width="36" height="24"><rect width="36" height="24" fill="white"/><rect y="8" width="36" height="8" fill="#CD2E3A" opacity="0.15"/><circle cx="18" cy="12" r="4" fill="#CD2E3A"/><circle cx="18" cy="12" r="2" fill="#003478"/></svg>',
            bg: '#1a0006', type: 'kr_content'
        }
    ];

    // ─── Кэш ─────────────────────────────────────────────────────────────────────
    var cache = {};

    // ─── Утилиты ─────────────────────────────────────────────────────────────────
    function shuffleArray(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function sortByDate(items) {
        return items.sort(function (a, b) {
            var dA = a.release_date || a.first_air_date || '';
            var dB = b.release_date || b.first_air_date || '';
            if (!dA) return 1; if (!dB) return -1;
            return dB.localeCompare(dA);
        });
    }

    function sortByVoteCount(items) {
        return items.sort(function (a, b) {
            var vA = a.vote_count || 0, vB = b.vote_count || 0;
            return vA === vB ? (b.vote_average || 0) - (a.vote_average || 0) : vB - vA;
        });
    }

    function sortByRating(items) {
        return items.sort(function (a, b) {
            // Взвешенный рейтинг: учитываем и оценку и количество голосов
            var scoreA = (a.vote_average || 0) * Math.log(Math.max(a.vote_count || 1, 1));
            var scoreB = (b.vote_average || 0) * Math.log(Math.max(b.vote_count || 1, 1));
            return scoreB - scoreA;
        });
    }

    function dedupe(items) {
        var seen = {};
        return items.filter(function (item) {
            var key = (item.media_type || 'x') + '_' + item.id;
            if (seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    function filterByMinVotes(items, minVotes) {
        return items.filter(function (i) { return (i.vote_count || 0) >= minVotes; });
    }

    function filterByRating(items, minRating, maxRating) {
        return items.filter(function (i) {
            var r = i.vote_average || 0;
            return r >= minRating && r <= (maxRating || 10);
        });
    }

    function filterRecent(items, yearsBack) {
        var d = new Date();
        d.setFullYear(d.getFullYear() - (yearsBack || YEARS_BACK));
        var minDate = d.toISOString().split('T')[0];
        return items.filter(function (i) {
            var date = i.release_date || i.first_air_date || '';
            return date && date >= minDate;
        });
    }

    function getDateBack(months) {
        var d = new Date();
        d.setMonth(d.getMonth() - months);
        return d.toISOString().split('T')[0];
    }

    function filterDateFrom(items, fromDate) {
        return items.filter(function (i) {
            var date = i.release_date || i.first_air_date || '';
            return date && date >= fromDate;
        });
    }

    // ─── Сеть ────────────────────────────────────────────────────────────────────
    // Загружает N страниц параллельно, добавляет media_type и рейтинг в overview
    function loadPages(network, baseUrl, mediaType, pages, callback) {
        var all = [], done = 0;

        function onDone() {
            done++;
            if (done === pages) callback(all);
        }

        for (var p = 1; p <= pages; p++) {
            (function (page) {
                network.silent(baseUrl + '&page=' + page, function (data) {
                    if (data && data.results) {
                        data.results.forEach(function (item) {
                            item.media_type = mediaType;
                            // Добавляем метку рейтинга в начало описания
                            if (item.vote_average && item.vote_count) {
                                var ri = '⭐ ' + item.vote_average.toFixed(1) +
                                         ' • 👥 ' + item.vote_count.toLocaleString('ru-RU') + ' оценок';
                                item.overview = item.overview ? ri + '\n\n' + item.overview : ri;
                            }
                        });
                        all = all.concat(data.results);
                    }
                    onDone();
                }, onDone);
            })(p);
        }
    }

    // ─── Конфигурация запросов по типу ──────────────────────────────────────────
    function getRequestConfig(type, apiKey, lang) {
        var today   = new Date().toISOString().split('T')[0];
        var date3m  = getDateBack(3);
        var date1y  = getDateBack(12);

        var base = API_BASE;
        var Q = '?api_key=' + apiKey + '&language=' + lang;

        // Вспомогательные URL
        var discoverMovie = base + '/discover/movie' + Q;
        var discoverTv    = base + '/discover/tv'    + Q;
        var popularMovie  = base + '/movie/popular'  + Q;
        var popularTv     = base + '/tv/popular'     + Q;
        var topRatedMovie = base + '/movie/top_rated'+ Q;
        var topRatedTv    = base + '/tv/top_rated'   + Q;

        var configs = {
            // ── общие ──
            'all': [
                { url: popularMovie, mt: 'movie' },
                { url: popularTv,    mt: 'tv' }
            ],
            'random': [
                { url: popularMovie, mt: 'movie' },
                { url: popularTv,    mt: 'tv' }
            ],

            // ── фильмы ──
            'movies':       [{ url: popularMovie,  mt: 'movie' }],
            'new_movies':   [{ url: topRatedMovie, mt: 'movie' }],

            // Рейтинг 8+ фильмы — discover отсортированный по vote_average
            'top_movies_8': [{
                url: discoverMovie + '&sort_by=vote_average.desc&vote_count.gte=5000&vote_average.gte=8',
                mt: 'movie'
            }],
            // Рейтинг 7+ фильмы
            'top_movies_7': [{
                url: discoverMovie + '&sort_by=vote_average.desc&vote_count.gte=2000&vote_average.gte=7&vote_average.lte=7.99',
                mt: 'movie'
            }],
            // Рейтинг 6+ фильмы
            'top_movies_6': [{
                url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=1000&vote_average.gte=6&vote_average.lte=6.99',
                mt: 'movie'
            }],

            // ── сериалы ──
            'tv':      [{ url: popularTv,  mt: 'tv' }],
            'new_tv':  [{ url: topRatedTv, mt: 'tv' }],

            // Рейтинг 8+ сериалы
            'top_tv_8': [{
                url: discoverTv + '&sort_by=vote_average.desc&vote_count.gte=3000&vote_average.gte=8',
                mt: 'tv'
            }],
            // Рейтинг 7+ сериалы
            'top_tv_7': [{
                url: discoverTv + '&sort_by=vote_average.desc&vote_count.gte=1000&vote_average.gte=7&vote_average.lte=7.99',
                mt: 'tv'
            }],
            // Рейтинг 6+ сериалы
            'top_tv_6': [{
                url: discoverTv + '&sort_by=vote_count.desc&vote_count.gte=500&vote_average.gte=6&vote_average.lte=6.99',
                mt: 'tv'
            }],

            // ── жанры (фильмы + сериалы) ──
            // 28=Action, 35=Comedy, 27=Horror, 878=SciFi, 53=Thriller
            // 10749=Romance, 16=Animation(аниме), 99=Documentary
            'genre_action': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=1000&with_genres=28', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=10759', mt: 'tv' }
            ],
            'genre_comedy': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=1000&with_genres=35', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=35',  mt: 'tv' }
            ],
            'genre_horror': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=27',  mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=200&with_genres=9648', mt: 'tv' }
            ],
            'genre_scifi': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=1000&with_genres=878', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=10765', mt: 'tv' }
            ],
            'genre_thriller': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=1000&with_genres=53', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=300&with_genres=80',  mt: 'tv' }
            ],
            'genre_romance': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=10749', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=200&with_genres=10749', mt: 'tv' }
            ],
            'genre_anime': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=16&with_origin_country=JP', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=300&with_genres=16&with_origin_country=JP', mt: 'tv' }
            ],
            'genre_documentary': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=300&with_genres=99', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=200&with_genres=99', mt: 'tv' }
            ],

            // ── Российский контент ──
            'ru_movies': [{
                url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=100&with_original_language=ru',
                mt: 'movie'
            }],
            'ru_tv': [{
                url: discoverTv + '&sort_by=vote_count.desc&vote_count.gte=50&with_original_language=ru',
                mt: 'tv'
            }],

            // ── За 3 месяца ──
            'recent_top': [
                {
                    url: discoverMovie + '&sort_by=vote_average.desc&vote_count.gte=100' +
                         '&vote_average.gte=6&primary_release_date.gte=' + date3m + '&primary_release_date.lte=' + today,
                    mt: 'movie', dateFrom: date3m
                },
                {
                    url: discoverTv + '&sort_by=vote_average.desc&vote_count.gte=100' +
                         '&vote_average.gte=6&first_air_date.gte=' + date3m + '&first_air_date.lte=' + today,
                    mt: 'tv', dateFrom: date3m
                }
            ],
            // Новинки 6+ (за 3 месяца, рейтинг >=6)
            'recent_6plus': [
                {
                    url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=50' +
                         '&vote_average.gte=6&primary_release_date.gte=' + date3m,
                    mt: 'movie', dateFrom: date3m
                },
                {
                    url: discoverTv + '&sort_by=vote_count.desc&vote_count.gte=50' +
                         '&vote_average.gte=6&first_air_date.gte=' + date3m,
                    mt: 'tv', dateFrom: date3m
                }
            ],

            // ── Голливуд / США ──
            'us_movies': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=2000&with_origin_country=US', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=1000&with_origin_country=US', mt: 'tv' }
            ],

            // ── Корейский контент ──
            'kr_content': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=200&with_origin_country=KR', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=200&with_origin_country=KR', mt: 'tv' }
            ]
        };

        return configs[type] || configs['all'];
    }

    // ─── Постобработка результатов ───────────────────────────────────────────────
    function postProcess(type, results) {
        results = dedupe(results);

        var date3m = getDateBack(3);

        switch (type) {
            case 'all':
                results = filterByMinVotes(results, 1000);
                results = sortByVoteCount(results);
                break;
            case 'random':
                results = filterByMinVotes(results, 500);
                results = shuffleArray(results);
                break;
            case 'movies':
                results = filterByMinVotes(results, 1000);
                results = sortByVoteCount(results);
                break;
            case 'new_movies':
                results = filterByMinVotes(results, 500);
                results = filterRecent(results, YEARS_BACK);
                results = sortByDate(results);
                break;
            case 'top_movies_8':
                results = filterByMinVotes(results, 1000);
                results = filterByRating(results, 8, 10);
                results = sortByRating(results);
                break;
            case 'top_movies_7':
                results = filterByMinVotes(results, 500);
                results = filterByRating(results, 7, 7.99);
                results = sortByRating(results);
                break;
            case 'top_movies_6':
                results = filterByMinVotes(results, 300);
                results = filterByRating(results, 6, 6.99);
                results = sortByRating(results);
                break;
            case 'tv':
                results = filterByMinVotes(results, 500);
                results = sortByVoteCount(results);
                break;
            case 'new_tv':
                results = filterByMinVotes(results, 200);
                results = filterRecent(results, YEARS_BACK);
                results = sortByDate(results);
                break;
            case 'top_tv_8':
                results = filterByMinVotes(results, 500);
                results = filterByRating(results, 8, 10);
                results = sortByRating(results);
                break;
            case 'top_tv_7':
                results = filterByMinVotes(results, 300);
                results = filterByRating(results, 7, 7.99);
                results = sortByRating(results);
                break;
            case 'top_tv_6':
                results = filterByMinVotes(results, 200);
                results = filterByRating(results, 6, 6.99);
                results = sortByRating(results);
                break;
            case 'recent_top':
            case 'recent_6plus':
                results = filterByMinVotes(results, 50);
                results = filterByRating(results, 6, 10);
                results = filterDateFrom(results, date3m);
                results = sortByRating(results);
                break;
            case 'ru_movies':
            case 'ru_tv':
                results = sortByVoteCount(results);
                break;
            case 'us_movies':
            case 'kr_content':
                results = filterByMinVotes(results, 200);
                results = sortByVoteCount(results);
                break;
            default:
                // Жанры
                results = filterByMinVotes(results, 200);
                results = sortByVoteCount(results);
                break;
        }

        return results;
    }

    // ─── API ─────────────────────────────────────────────────────────────────────
    var API = {
        full: function (params, success, error) {
            var type = params.type;

            if (cache[type]) {
                success(type === 'random'
                    ? { results: shuffleArray(cache[type].results), title: params.title }
                    : cache[type]
                );
                return;
            }

            var network = new Lampa.Reguest();
            var apiKey  = Lampa.TMDB.key();
            var lang    = Lampa.Storage.get('tmdb_lang', 'ru');

            var requestConfigs = getRequestConfig(type, apiKey, lang);
            var allResults = [];
            var done = 0;
            var total = requestConfigs.length;

            requestConfigs.forEach(function (cfg) {
                loadPages(network, cfg.url, cfg.mt, PAGES_TO_LOAD, function (results) {
                    allResults = allResults.concat(results);
                    done++;
                    if (done === total) {
                        var processed = postProcess(type, allResults);
                        cache[type] = { results: processed, title: params.title };
                        success({ results: processed, title: params.title });
                    }
                });
            });
        },

        clear: function () { cache = {}; }
    };

    // ─── Стили ───────────────────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('top-ratings-styles')) return;
        var s = document.createElement('style');
        s.id  = 'top-ratings-styles';
        s.textContent = [
            '.top-ratings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:14px;box-sizing:border-box}',
            '.top-ratings-section-title{grid-column:1/-1;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;padding:4px 2px 2px;margin-top:4px}',
            '.top-ratings-card{background:#1c1c1c;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px 8px;cursor:pointer;transition:background .2s,transform .15s;min-height:88px;gap:7px;position:relative}',
            '.top-ratings-card.focus,.top-ratings-card:hover{background:#2e2e2e;transform:scale(1.05)}',
            '.top-ratings-card .tr-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
            '.top-ratings-card .tr-icon svg{width:36px;height:auto}',
            '.top-ratings-card .tr-title{font-size:10.5px;color:#e0e0e0;text-align:center;line-height:1.3;font-weight:500}',
            '.top-ratings-badge{position:absolute;top:5px;right:5px;font-size:8px;font-weight:700;padding:1px 4px;border-radius:4px;line-height:1.4}'
        ].join('\n');
        document.head.appendChild(s);
    }

    // ─── Главный компонент ────────────────────────────────────────────────────────
    function createMainComponent(params) {
        var scroll = new Lampa.Scroll({ mask: true, over: true });

        // Секции с заголовками
        var sections = [
            { title: 'Общий топ',       types: ['all', 'random'] },
            { title: 'Фильмы',          types: ['movies', 'new_movies', 'top_movies_8', 'top_movies_7', 'top_movies_6'] },
            { title: 'Сериалы',         types: ['tv', 'new_tv', 'top_tv_8', 'top_tv_7', 'top_tv_6'] },
            { title: 'По жанрам',       types: ['genre_action', 'genre_comedy', 'genre_horror', 'genre_scifi', 'genre_thriller', 'genre_romance', 'genre_anime', 'genre_documentary'] },
            { title: 'Российское кино', types: ['ru_movies', 'ru_tv'] },
            { title: 'Свежее',          types: ['recent_top', 'recent_6plus'] },
            { title: 'По странам',      types: ['us_movies', 'kr_content'] }
        ];

        var catMap = {};
        CATEGORIES.forEach(function (c) { catMap[c.type] = c; });

        var grid = $('<div class="top-ratings-grid"></div>');

        sections.forEach(function (sec) {
            var titleEl = $('<div class="top-ratings-section-title">' + sec.title + '</div>');
            grid.append(titleEl);

            sec.types.forEach(function (type) {
                var cat = catMap[type];
                if (!cat) return;

                var card = $(
                    '<div class="top-ratings-card selector" tabindex="0">' +
                    '<div class="tr-icon">' + cat.icon + '</div>' +
                    '<div class="tr-title">' + cat.title + '</div>' +
                    '</div>'
                );

                card.on('hover:enter click', function () {
                    Lampa.Activity.push({
                        url: '', title: cat.title,
                        component: 'top_ratings_full',
                        type: cat.type, page: 1
                    });
                });

                grid.append(card);
            });
        });

        scroll.body().append(grid);

        this.create  = function () { this.activity.loader(false); return scroll.render(); };
        this.start   = function () { Lampa.Controller.toggle('scroll'); };
        this.pause   = function () {};
        this.stop    = function () {};
        this.render  = function () { return scroll.render(); };
        this.destroy = function () { scroll.destroy(); };
    }

    // ─── Компонент списка ─────────────────────────────────────────────────────────
    function createFullComponent(params) {
        var component = Lampa.Maker.make('Category', params);

        component.use({
            onCreate: function () {
                var self = this;
                this.activity.loader(true);
                API.full(params, function (data) {
                    self.build(data);
                    self.activity.loader(false);
                }, function () {
                    self.empty();
                    self.activity.loader(false);
                });
            },
            onUpdate: function (p) {
                var self = this;
                this.activity.loader(true);
                API.full(p, function (data) {
                    self.build(data);
                    self.activity.loader(false);
                }, function () {
                    self.empty();
                    self.activity.loader(false);
                });
            },
            onInstance: function (card, data) {
                card.use({
                    onEnter: function (item, elem) {
                        Lampa.Activity.push({
                            url: '', component: 'full',
                            id: elem.id, method: elem.media_type, card: elem
                        });
                    }
                });
            }
        });

        return component;
    }

    // ─── Запуск ───────────────────────────────────────────────────────────────────
    function startPlugin() {
        injectStyles();

        Lampa.Component.add('top_ratings',      createMainComponent);
        Lampa.Component.add('top_ratings_full', createFullComponent);

        var menuItem = $(
            '<li class="menu__item selector">' +
            '<div class="menu__ico">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
            '<path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' +
            '</svg></div>' +
            '<div class="menu__text">Топ TMDB</div></li>'
        );

        menuItem.on('hover:enter', function () {
            Lampa.Activity.push({ url: '', title: 'Топ TMDB', component: 'top_ratings', page: 1 });
        });

        $('.menu .menu__list').eq(0).append(menuItem);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();