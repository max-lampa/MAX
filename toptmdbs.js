(function() {
    'use strict';

    if (window.top_ratings_plugin) return;
    window.top_ratings_plugin = true;

    var PLUGIN_NAME = 'top_ratings';
    var API_BASE = 'https://api.themoviedb.org/3';
    var PAGES_TO_LOAD = 8;
    var CACHE_TTL = 30 * 60 * 1000; // 30 минут
    var MIN_RATING = 6.0;
    var MIN_VOTES = 200;

    // Иконки: viewBox 200x300 (постер), цветной фон + крупный центрированный символ
    var ICON = {
        star: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' +
            '<rect width="200" height="300" fill="#1a1a2e"/>' +
            '<rect width="200" height="300" fill="#FFD700" opacity="0.15"/>' +
            '<polygon points="100,60 118,110 172,110 128,140 144,192 100,162 56,192 72,140 28,110 82,110" fill="#FFD700"/>' +
            '<text x="100" y="260" text-anchor="middle" fill="#FFD700" font-size="22" font-family="Arial,sans-serif" font-weight="bold">ТОП</text>' +
            '</svg>'
        ),
        film: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' +
            '<rect width="200" height="300" fill="#1a0a0a"/>' +
            '<rect width="200" height="300" fill="#E50914" opacity="0.2"/>' +
            '<rect x="30" y="90" width="140" height="110" rx="8" fill="#E50914"/>' +
            '<rect x="30" y="90" width="20" height="110" fill="#c00712"/>' +
            '<rect x="150" y="90" width="20" height="110" fill="#c00712"/>' +
            '<rect x="38" y="103" width="12" height="16" rx="2" fill="#fff" opacity="0.9"/>' +
            '<rect x="38" y="128" width="12" height="16" rx="2" fill="#fff" opacity="0.9"/>' +
            '<rect x="38" y="153" width="12" height="16" rx="2" fill="#fff" opacity="0.9"/>' +
            '<rect x="154" y="103" width="12" height="16" rx="2" fill="#fff" opacity="0.9"/>' +
            '<rect x="154" y="128" width="12" height="16" rx="2" fill="#fff" opacity="0.9"/>' +
            '<rect x="154" y="153" width="12" height="16" rx="2" fill="#fff" opacity="0.9"/>' +
            '<circle cx="100" cy="145" r="22" fill="#fff" opacity="0.2"/>' +
            '<polygon points="91,133 91,157 118,145" fill="#fff"/>' +
            '<text x="100" y="260" text-anchor="middle" fill="#E50914" font-size="20" font-family="Arial,sans-serif" font-weight="bold">ФИЛЬМЫ</text>' +
            '</svg>'
        ),
        tv: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' +
            '<rect width="200" height="300" fill="#0a0a1a"/>' +
            '<rect width="200" height="300" fill="#4285F4" opacity="0.2"/>' +
            '<rect x="25" y="85" width="150" height="110" rx="10" fill="#4285F4"/>' +
            '<rect x="35" y="95" width="130" height="82" rx="4" fill="#0d1b40"/>' +
            '<line x1="80" y1="195" x2="120" y2="195" stroke="#4285F4" stroke-width="6" stroke-linecap="round"/>' +
            '<circle cx="100" cy="220" r="8" fill="#4285F4" opacity="0.7"/>' +
            '<line x1="60" y1="88" x2="85" y2="65" stroke="#4285F4" stroke-width="4" stroke-linecap="round"/>' +
            '<line x1="140" y1="88" x2="115" y2="65" stroke="#4285F4" stroke-width="4" stroke-linecap="round"/>' +
            '<text x="100" y="260" text-anchor="middle" fill="#4285F4" font-size="19" font-family="Arial,sans-serif" font-weight="bold">СЕРИАЛЫ</text>' +
            '</svg>'
        ),
        newFilm: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' +
            '<rect width="200" height="300" fill="#0a1a0a"/>' +
            '<rect width="200" height="300" fill="#33C758" opacity="0.2"/>' +
            '<circle cx="100" cy="140" r="70" fill="#33C758"/>' +
            '<text x="100" y="128" text-anchor="middle" fill="#fff" font-size="30" font-family="Arial,sans-serif" font-weight="bold">NEW</text>' +
            '<text x="100" y="162" text-anchor="middle" fill="#fff" font-size="16" font-family="Arial,sans-serif">ФИЛЬМ</text>' +
            '<text x="100" y="260" text-anchor="middle" fill="#33C758" font-size="18" font-family="Arial,sans-serif" font-weight="bold">НОВИНКИ</text>' +
            '</svg>'
        ),
        newTv: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' +
            '<rect width="200" height="300" fill="#0a0d1a"/>' +
            '<rect width="200" height="300" fill="#4285F4" opacity="0.2"/>' +
            '<circle cx="100" cy="140" r="70" fill="#4285F4"/>' +
            '<text x="100" y="128" text-anchor="middle" fill="#fff" font-size="30" font-family="Arial,sans-serif" font-weight="bold">NEW</text>' +
            '<text x="100" y="162" text-anchor="middle" fill="#fff" font-size="14" font-family="Arial,sans-serif">СЕРИАЛ</text>' +
            '<text x="100" y="260" text-anchor="middle" fill="#4285F4" font-size="18" font-family="Arial,sans-serif" font-weight="bold">НОВИНКИ</text>' +
            '</svg>'
        ),
        random: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' +
            '<rect width="200" height="300" fill="#120a1a"/>' +
            '<rect width="200" height="300" fill="#9C27B0" opacity="0.2"/>' +
            '<rect x="30" y="85" width="140" height="115" rx="14" fill="#9C27B0"/>' +
            '<circle cx="65" cy="110" r="10" fill="#fff"/>' +
            '<circle cx="135" cy="110" r="10" fill="#fff"/>' +
            '<circle cx="65" cy="143" r="10" fill="#fff"/>' +
            '<circle cx="100" cy="143" r="10" fill="#fff"/>' +
            '<circle cx="135" cy="143" r="10" fill="#fff"/>' +
            '<circle cx="65" cy="176" r="10" fill="#fff"/>' +
            '<circle cx="135" cy="176" r="10" fill="#fff"/>' +
            '<text x="100" y="260" text-anchor="middle" fill="#9C27B0" font-size="18" font-family="Arial,sans-serif" font-weight="bold">СЛУЧАЙНОЕ</text>' +
            '</svg>'
        ),
        russian: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' +
            '<rect width="200" height="300" fill="#0d0d0d"/>' +
            '<rect x="0" y="75" width="200" height="50" fill="#FFFFFF"/>' +
            '<rect x="0" y="125" width="200" height="50" fill="#0039A6"/>' +
            '<rect x="0" y="175" width="200" height="50" fill="#D52B1E"/>' +
            '<rect x="0" y="75" width="200" height="150" fill="#000" opacity="0.35"/>' +
            '<text x="100" y="143" text-anchor="middle" fill="#fff" font-size="40" font-family="Arial,sans-serif" font-weight="bold">РФ</text>' +
            '<text x="100" y="260" text-anchor="middle" fill="#fff" font-size="14" font-family="Arial,sans-serif" font-weight="bold">РУССКОЕ КИНО</text>' +
            '</svg>'
        )
    };

    var CATEGORIES = [
        { title: 'Топ по популярности',        img: ICON.star,    type: 'all'        },
        { title: 'Топ Фильмы',                 img: ICON.film,    type: 'movies'     },
        { title: 'Топ Сериалы',                img: ICON.tv,      type: 'tv'         },
        { title: 'Новые Фильмы',               img: ICON.newFilm, type: 'new_movies' },
        { title: 'Новые Сериалы',              img: ICON.newTv,   type: 'new_tv'     },
        { title: 'Русские фильмы и сериалы',   img: ICON.russian, type: 'russian'    },
        { title: 'Случайный выбор',            img: ICON.random,  type: 'random'     }
    ];

    // Кэш с TTL
    var cache = {};

    function getFromCache(type) {
        var entry = cache[type];
        if (!entry) return null;
        if (Date.now() - entry.time > CACHE_TTL) {
            delete cache[type];
            return null;
        }
        return entry.data;
    }

    function setCache(type, data) {
        cache[type] = { data: data, time: Date.now() };
    }

    // Дата 3 месяца назад
    function getThreeMonthsAgo() {
        var d = new Date();
        d.setMonth(d.getMonth() - 3);
        return d.toISOString().split('T')[0];
    }

    // Сегодня
    function getToday() {
        return new Date().toISOString().split('T')[0];
    }

    function shuffleArray(array) {
        var arr = array.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    function sortByDate(items) {
        return items.sort(function(a, b) {
            var da = a.release_date || a.first_air_date || '';
            var db = b.release_date || b.first_air_date || '';
            if (!da) return 1;
            if (!db) return -1;
            return db.localeCompare(da);
        });
    }

    function sortByRating(items) {
        return items.sort(function(a, b) {
            var ra = a.vote_average || 0;
            var rb = b.vote_average || 0;
            if (rb !== ra) return rb - ra;
            return (b.vote_count || 0) - (a.vote_count || 0);
        });
    }

    // Фильтр: рейтинг >= 6, голосов >= MIN_VOTES
    function filterGood(items) {
        return items.filter(function(item) {
            return (item.vote_average || 0) >= MIN_RATING && (item.vote_count || 0) >= MIN_VOTES;
        });
    }

    // Фильтр: последние 3 месяца
    function filterThreeMonths(items) {
        var minDate = getThreeMonthsAgo();
        return items.filter(function(item) {
            var d = item.release_date || item.first_air_date || '';
            return d && d >= minDate;
        });
    }

    function processResults(data, mediaType) {
        if (!data || !data.results) return [];
        return data.results.map(function(item) {
            item.media_type = mediaType;
            if (item.vote_average && item.vote_count) {
                var rating = item.vote_average.toFixed(1);
                var votes = item.vote_count.toLocaleString('ru-RU');
                var info = '⭐ ' + rating + ' • 👥 ' + votes + ' оценок';
                item.overview = item.overview ? info + '\n\n' + item.overview : info;
            }
            return item;
        });
    }

    // Загрузка нескольких страниц параллельно
    function loadPages(baseUrl, mediaType, network, callback) {
        var all = [];
        var done = 0;
        for (var p = 1; p <= PAGES_TO_LOAD; p++) {
            (function(page) {
                var url = baseUrl + '&page=' + page;
                network.silent(url, function(data) {
                    if (data && data.results) all = all.concat(processResults(data, mediaType));
                    if (++done === PAGES_TO_LOAD) callback(all);
                }, function() {
                    if (++done === PAGES_TO_LOAD) callback(all);
                });
            })(p);
        }
    }

    var API = {
        full: function(params, success, error) {
            var type = params.type;

            var cached = getFromCache(type);
            if (cached) {
                success(type === 'random'
                    ? { results: shuffleArray(cached.results), title: params.title }
                    : cached
                );
                return;
            }

            var network = new Lampa.Reguest();
            var apiKey = Lampa.TMDB.key();
            var lang = Lampa.Storage.get('tmdb_lang', 'ru');
            var minDate = getThreeMonthsAgo();
            var today = getToday();

            function done(results, sorted) {
                var out = { results: sorted || results, title: params.title };
                setCache(type, out);
                success(type === 'random' ? { results: shuffleArray(out.results), title: params.title } : out);
            }

            // --- Русские фильмы и сериалы (за 3 месяца) ---
            if (type === 'russian') {
                var movieUrl = API_BASE + '/discover/movie?api_key=' + apiKey + '&language=' + lang +
                    '&with_original_language=ru' +
                    '&primary_release_date.gte=' + minDate +
                    '&primary_release_date.lte=' + today +
                    '&vote_count.gte=' + MIN_VOTES +
                    '&vote_average.gte=' + MIN_RATING +
                    '&sort_by=vote_average.desc';
                var tvUrl = API_BASE + '/discover/tv?api_key=' + apiKey + '&language=' + lang +
                    '&with_original_language=ru' +
                    '&first_air_date.gte=' + minDate +
                    '&first_air_date.lte=' + today +
                    '&vote_count.gte=' + MIN_VOTES +
                    '&vote_average.gte=' + MIN_RATING +
                    '&sort_by=vote_average.desc';

                var movies = [], tvs = [], c = 0;
                function check() { if (++c === 2) done(null, sortByRating(filterGood(movies.concat(tvs)))); }
                loadPages(movieUrl, 'movie', network, function(r) { movies = r; check(); });
                loadPages(tvUrl, 'tv', network, function(r) { tvs = r; check(); });
                return;
            }

            // --- Все / Случайное (популярное за 3 месяца, рейтинг >= 6) ---
            if (type === 'all' || type === 'random') {
                var mUrl = API_BASE + '/discover/movie?api_key=' + apiKey + '&language=' + lang +
                    '&primary_release_date.gte=' + minDate +
                    '&primary_release_date.lte=' + today +
                    '&vote_count.gte=' + MIN_VOTES +
                    '&vote_average.gte=' + MIN_RATING +
                    '&sort_by=popularity.desc';
                var tUrl = API_BASE + '/discover/tv?api_key=' + apiKey + '&language=' + lang +
                    '&first_air_date.gte=' + minDate +
                    '&first_air_date.lte=' + today +
                    '&vote_count.gte=' + MIN_VOTES +
                    '&vote_average.gte=' + MIN_RATING +
                    '&sort_by=popularity.desc';

                var mv = [], tv = [], cc = 0;
                function chk() { if (++cc === 2) done(null, sortByRating(mv.concat(tv))); }
                loadPages(mUrl, 'movie', network, function(r) { mv = r; chk(); });
                loadPages(tUrl, 'tv', network, function(r) { tv = r; chk(); });
                return;
            }

            // --- Топ Фильмы / Топ Сериалы (рейтинг >= 6, 3 месяца) ---
            if (type === 'movies' || type === 'tv') {
                var mt = (type === 'tv') ? 'tv' : 'movie';
                var dateField = (type === 'tv') ? 'first_air_date' : 'primary_release_date';
                var url = API_BASE + '/discover/' + mt + '?api_key=' + apiKey + '&language=' + lang +
                    '&' + dateField + '.gte=' + minDate +
                    '&' + dateField + '.lte=' + today +
                    '&vote_count.gte=' + MIN_VOTES +
                    '&vote_average.gte=' + MIN_RATING +
                    '&sort_by=vote_average.desc';
                loadPages(url, mt, network, function(r) {
                    done(null, sortByRating(filterGood(r)));
                });
                return;
            }

            // --- Новые Фильмы / Новые Сериалы (последние 3 месяца, рейтинг >= 6) ---
            if (type === 'new_movies' || type === 'new_tv') {
                var nmt = (type === 'new_tv') ? 'tv' : 'movie';
                var ndf = (type === 'new_tv') ? 'first_air_date' : 'primary_release_date';
                var nurl = API_BASE + '/discover/' + nmt + '?api_key=' + apiKey + '&language=' + lang +
                    '&' + ndf + '.gte=' + minDate +
                    '&' + ndf + '.lte=' + today +
                    '&vote_count.gte=' + MIN_VOTES +
                    '&vote_average.gte=' + MIN_RATING +
                    '&sort_by=release_date.desc';
                loadPages(nurl, nmt, network, function(r) {
                    done(null, sortByDate(filterGood(filterThreeMonths(r))));
                });
                return;
            }

            error && error();
        },

        clear: function() { cache = {}; }
    };

    function createMainComponent(params) {
        var component = Lampa.Maker.make('Category', params);
        component.use({
            onCreate: function() {
                var self = this;
                this.body.addClass('mapping--grid');
                this.body.addClass('cols--5');
                setTimeout(function() {
                    self.build({
                        results: CATEGORIES.map(function(cat) {
                            return {
                                title: cat.title,
                                img: cat.img,
                                params: { style: { name: 'collection' } },
                                data: {
                                    title: cat.title,
                                    component: 'top_ratings_full',
                                    type: cat.type,
                                    page: 1
                                }
                            };
                        })
                    });
                }, 100);
            },
            onInstance: function(card, data) {
                card.use({
                    onEnter: function() {
                        if (data && data.data) Lampa.Activity.push(data.data);
                    }
                });
            }
        });
        return component;
    }

    function createFullComponent(params) {
        var component = Lampa.Maker.make('Category', params);
        component.use({
            onCreate: function() {
                var self = this;
                this.activity.loader(true);
                API.full(params, function(data) {
                    self.build(data);
                    self.activity.loader(false);
                }, function() {
                    self.empty();
                    self.activity.loader(false);
                });
            },
            onUpdate: function(newParams) {
                var self = this;
                this.activity.loader(true);
                API.full(newParams, function(data) {
                    self.build(data);
                    self.activity.loader(false);
                }, function() {
                    self.empty();
                    self.activity.loader(false);
                });
            },
            onInstance: function(card, data) {
                card.use({
                    onEnter: function(item, elem) {
                        Lampa.Activity.push({
                            url: '',
                            component: 'full',
                            id: elem.id,
                            method: elem.media_type,
                            card: elem
                        });
                    }
                });
            }
        });
        return component;
    }

    function startPlugin() {
        var manifest = {
            type: 'video',
            version: '2.0.0',
            name: 'Топ TMDB',
            description: 'Топ фильмы и сериалы за последние 3 месяца (рейтинг 6–10)'
        };

        Lampa.Component.add('top_ratings', createMainComponent);
        Lampa.Component.add('top_ratings_full', createFullComponent);

        var menuItem = $(
            '<li class="menu__item selector">' +
                '<div class="menu__ico">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
                        '<path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu__text">Топ TMDB</div>' +
            '</li>'
        );

        menuItem.on('hover:enter', function() {
            Lampa.Activity.push({
                url: '',
                title: 'Топ TMDB',
                component: 'top_ratings',
                page: 1
            });
        });

        $('.menu .menu__list').eq(0).append(menuItem);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') startPlugin();
        });
    }
})();
