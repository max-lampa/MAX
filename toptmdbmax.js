(function() {
    'use strict';

    if (window.top_ratings_plugin) return;
    window.top_ratings_plugin = true;

    var API_BASE = 'https://api.themoviedb.org/3';
    var PAGES_TO_LOAD = 8;
    var CACHE_TTL = 15 * 60 * 1000; // 15 минут
    var MIN_RATING = 6.0;
    var MIN_VOTES = 200;

    // TMDB жанры: movie / tv
    var GENRE_MAP = {
        action:      { movie: 28,  tv: 10759 },
        comedy:      { movie: 35,  tv: 35    },
        horror:      { movie: 27,  tv: 9648  },
        thriller:    { movie: 53,  tv: 80    },
        animation:   { movie: 16,  tv: 16    },
        documentary: { movie: 99,  tv: 99    }
    };

    // ── SVG иконки (200×300 постер) ────────────────────────────────────────────
    function svg(content) {
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' + content + '</svg>'
        );
    }

    var ICONS = {
        all: svg(
            '<rect width="200" height="300" fill="#0d0d20"/>' +
            '<polygon points="100,55 120,112 180,112 132,146 150,202 100,168 50,202 68,146 20,112 80,112" fill="#FFD700"/>' +
            '<text x="100" y="268" text-anchor="middle" fill="#FFD700" font-size="22" font-family="Arial" font-weight="bold">ТОП</text>'
        ),
        movies: svg(
            '<rect width="200" height="300" fill="#1a0505"/>' +
            '<rect x="20" y="85" width="160" height="115" rx="10" fill="#E50914"/>' +
            '<rect x="20" y="85" width="25" height="115" fill="#b5070f"/>' +
            '<rect x="155" y="85" width="25" height="115" fill="#b5070f"/>' +
            '<rect x="28" y="100" width="14" height="18" rx="2" fill="#fff" opacity="0.9"/>' +
            '<rect x="28" y="128" width="14" height="18" rx="2" fill="#fff" opacity="0.9"/>' +
            '<rect x="28" y="156" width="14" height="18" rx="2" fill="#fff" opacity="0.9"/>' +
            '<rect x="158" y="100" width="14" height="18" rx="2" fill="#fff" opacity="0.9"/>' +
            '<rect x="158" y="128" width="14" height="18" rx="2" fill="#fff" opacity="0.9"/>' +
            '<rect x="158" y="156" width="14" height="18" rx="2" fill="#fff" opacity="0.9"/>' +
            '<circle cx="100" cy="143" r="24" fill="#fff" opacity="0.18"/>' +
            '<polygon points="90,130 90,156 117,143" fill="#fff"/>' +
            '<text x="100" y="268" text-anchor="middle" fill="#E50914" font-size="20" font-family="Arial" font-weight="bold">ФИЛЬМЫ</text>'
        ),
        tv: svg(
            '<rect width="200" height="300" fill="#050515"/>' +
            '<rect x="20" y="80" width="160" height="118" rx="12" fill="#4285F4"/>' +
            '<rect x="33" y="92" width="134" height="84" rx="5" fill="#0a1235"/>' +
            '<rect x="78" y="198" width="44" height="8" rx="4" fill="#4285F4"/>' +
            '<circle cx="100" cy="222" r="9" fill="#4285F4" opacity="0.6"/>' +
            '<line x1="62" y1="83" x2="88" y2="58" stroke="#4285F4" stroke-width="5" stroke-linecap="round"/>' +
            '<line x1="138" y1="83" x2="112" y2="58" stroke="#4285F4" stroke-width="5" stroke-linecap="round"/>' +
            '<text x="100" y="268" text-anchor="middle" fill="#4285F4" font-size="19" font-family="Arial" font-weight="bold">СЕРИАЛЫ</text>'
        ),
        newMovies: svg(
            '<rect width="200" height="300" fill="#051505"/>' +
            '<circle cx="100" cy="138" r="72" fill="#1DB954"/>' +
            '<text x="100" y="125" text-anchor="middle" fill="#fff" font-size="32" font-family="Arial" font-weight="bold">NEW</text>' +
            '<text x="100" y="160" text-anchor="middle" fill="#fff" font-size="17" font-family="Arial">ФИЛЬМ</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#1DB954" font-size="18" font-family="Arial" font-weight="bold">НОВИНКИ</text>'
        ),
        newTv: svg(
            '<rect width="200" height="300" fill="#050515"/>' +
            '<circle cx="100" cy="138" r="72" fill="#4285F4"/>' +
            '<text x="100" y="125" text-anchor="middle" fill="#fff" font-size="32" font-family="Arial" font-weight="bold">NEW</text>' +
            '<text x="100" y="160" text-anchor="middle" fill="#fff" font-size="15" font-family="Arial">СЕРИАЛ</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#4285F4" font-size="18" font-family="Arial" font-weight="bold">НОВИНКИ</text>'
        ),
        upcoming: svg(
            '<rect width="200" height="300" fill="#100520"/>' +
            '<rect x="22" y="80" width="156" height="130" rx="10" fill="#7B2FBE"/>' +
            '<rect x="22" y="80" width="156" height="30" rx="10" fill="#9B4FDE"/>' +
            '<rect x="22" y="100" width="156" height="10" fill="#9B4FDE"/>' +
            '<rect x="38" y="90" width="18" height="30" rx="4" fill="#fff" opacity="0.9"/>' +
            '<rect x="144" y="90" width="18" height="30" rx="4" fill="#fff" opacity="0.9"/>' +
            '<text x="100" y="160" text-anchor="middle" fill="#fff" font-size="38" font-family="Arial" font-weight="bold">?</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#9B4FDE" font-size="16" font-family="Arial" font-weight="bold">СКОРО В КИНО</text>'
        ),
        trendDay: svg(
            '<rect width="200" height="300" fill="#1a0800"/>' +
            '<circle cx="100" cy="130" r="68" fill="#FF6B00"/>' +
            '<text x="100" y="118" text-anchor="middle" fill="#fff" font-size="38" font-family="Arial" font-weight="bold">🔥</text>' +
            '<text x="100" y="158" text-anchor="middle" fill="#fff" font-size="14" font-family="Arial">СЕГОДНЯ</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#FF6B00" font-size="17" font-family="Arial" font-weight="bold">ТРЕНДЫ</text>'
        ),
        trendWeek: svg(
            '<rect width="200" height="300" fill="#0a0a00"/>' +
            '<circle cx="100" cy="130" r="68" fill="#FFC107"/>' +
            '<text x="100" y="118" text-anchor="middle" fill="#fff" font-size="36" font-family="Arial" font-weight="bold">📈</text>' +
            '<text x="100" y="158" text-anchor="middle" fill="#fff" font-size="14" font-family="Arial">НЕДЕЛЯ</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#FFC107" font-size="17" font-family="Arial" font-weight="bold">ТРЕНДЫ</text>'
        ),
        action: svg(
            '<rect width="200" height="300" fill="#1a0505"/>' +
            '<circle cx="100" cy="130" r="70" fill="#D32F2F"/>' +
            '<text x="100" y="148" text-anchor="middle" fill="#fff" font-size="60" font-family="Arial" font-weight="bold">💥</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#D32F2F" font-size="20" font-family="Arial" font-weight="bold">БОЕВИКИ</text>'
        ),
        comedy: svg(
            '<rect width="200" height="300" fill="#0a0f00"/>' +
            '<circle cx="100" cy="130" r="70" fill="#FDD835"/>' +
            '<text x="100" y="148" text-anchor="middle" fill="#fff" font-size="62" font-family="Arial" font-weight="bold">😂</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#FDD835" font-size="20" font-family="Arial" font-weight="bold">КОМЕДИИ</text>'
        ),
        horror: svg(
            '<rect width="200" height="300" fill="#000"/>' +
            '<circle cx="100" cy="130" r="70" fill="#37474F"/>' +
            '<text x="100" y="148" text-anchor="middle" fill="#fff" font-size="62" font-family="Arial" font-weight="bold">👻</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#78909C" font-size="20" font-family="Arial" font-weight="bold">УЖАСЫ</text>'
        ),
        thriller: svg(
            '<rect width="200" height="300" fill="#0a0000"/>' +
            '<circle cx="100" cy="130" r="70" fill="#B71C1C"/>' +
            '<text x="100" y="148" text-anchor="middle" fill="#fff" font-size="60" font-family="Arial" font-weight="bold">🔪</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#EF5350" font-size="19" font-family="Arial" font-weight="bold">ТРИЛЛЕРЫ</text>'
        ),
        animation: svg(
            '<rect width="200" height="300" fill="#001020"/>' +
            '<circle cx="100" cy="130" r="70" fill="#00BCD4"/>' +
            '<text x="100" y="148" text-anchor="middle" fill="#fff" font-size="58" font-family="Arial" font-weight="bold">🎨</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#00BCD4" font-size="16" font-family="Arial" font-weight="bold">АНИМЕ / МУЛЬТЫ</text>'
        ),
        documentary: svg(
            '<rect width="200" height="300" fill="#050810"/>' +
            '<circle cx="100" cy="130" r="70" fill="#546E7A"/>' +
            '<text x="100" y="148" text-anchor="middle" fill="#fff" font-size="58" font-family="Arial" font-weight="bold">📽</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#90A4AE" font-size="17" font-family="Arial" font-weight="bold">ДОКУМЕНТАЛКИ</text>'
        ),
        russian: svg(
            '<rect width="200" height="300" fill="#0d0d0d"/>' +
            '<rect x="0" y="72" width="200" height="52" fill="#FFFFFF"/>' +
            '<rect x="0" y="124" width="200" height="52" fill="#0039A6"/>' +
            '<rect x="0" y="176" width="200" height="52" fill="#D52B1E"/>' +
            '<rect x="0" y="72" width="200" height="156" fill="#000" opacity="0.3"/>' +
            '<text x="100" y="155" text-anchor="middle" fill="#fff" font-size="42" font-family="Arial" font-weight="bold">РФ</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#fff" font-size="14" font-family="Arial" font-weight="bold">РУССКОЕ КИНО</text>'
        ),
        turkish: svg(
            '<rect width="200" height="300" fill="#0d0000"/>' +
            '<rect x="0" y="72" width="200" height="156" fill="#E30A17"/>' +
            '<rect x="0" y="72" width="200" height="156" fill="#000" opacity="0.25"/>' +
            '<text x="78" y="162" text-anchor="middle" fill="#fff" font-size="50" font-family="Arial">☽</text>' +
            '<text x="130" y="155" text-anchor="middle" fill="#fff" font-size="28" font-family="Arial">★</text>' +
            '<text x="100" y="268" text-anchor="middle" fill="#E30A17" font-size="15" font-family="Arial" font-weight="bold">ТУРЕЦКОЕ КИНО</text>'
        ),
        random: svg(
            '<rect width="200" height="300" fill="#100a1a"/>' +
            '<rect x="25" y="78" width="150" height="122" rx="15" fill="#7B1FA2"/>' +
            '<circle cx="62" cy="107" r="11" fill="#fff"/>' +
            '<circle cx="138" cy="107" r="11" fill="#fff"/>' +
            '<circle cx="62" cy="140" r="11" fill="#fff"/>' +
            '<circle cx="100" cy="140" r="11" fill="#fff"/>' +
            '<circle cx="138" cy="140" r="11" fill="#fff"/>' +
            '<circle cx="62" cy="173" r="11" fill="#fff"/>' +
            '<circle cx="138" cy="173" r="11" fill="#fff"/>' +
            '<text x="100" y="268" text-anchor="middle" fill="#CE93D8" font-size="17" font-family="Arial" font-weight="bold">СЛУЧАЙНОЕ</text>'
        )
    };

    var CATEGORIES = [
        { title: 'Топ по популярности',      img: ICONS.all,         type: 'all'             },
        { title: 'Топ Фильмы',               img: ICONS.movies,      type: 'movies'          },
        { title: 'Топ Сериалы',              img: ICONS.tv,          type: 'tv'              },
        { title: 'Новые Фильмы',             img: ICONS.newMovies,   type: 'new_movies'      },
        { title: 'Новые Сериалы',            img: ICONS.newTv,       type: 'new_tv'          },
        { title: 'Скоро в кино',             img: ICONS.upcoming,    type: 'upcoming'        },
        { title: 'Трендовые сегодня',        img: ICONS.trendDay,    type: 'trending_day'    },
        { title: 'Трендовые за неделю',      img: ICONS.trendWeek,   type: 'trending_week'   },
        { title: 'Боевики',                  img: ICONS.action,      type: 'genre_action'    },
        { title: 'Комедии',                  img: ICONS.comedy,      type: 'genre_comedy'    },
        { title: 'Ужасы',                    img: ICONS.horror,      type: 'genre_horror'    },
        { title: 'Триллеры',                 img: ICONS.thriller,    type: 'genre_thriller'  },
        { title: 'Аниме и Мультфильмы',      img: ICONS.animation,   type: 'genre_animation' },
        { title: 'Документальные',           img: ICONS.documentary, type: 'genre_documentary'},
        { title: 'Русские фильмы и сериалы', img: ICONS.russian,     type: 'russian'         },
        { title: 'Турецкие фильмы и сериалы',img: ICONS.turkish,     type: 'turkish'         },
        { title: 'Случайный выбор',          img: ICONS.random,      type: 'random'          }
    ];

    // ── Кэш с TTL ──────────────────────────────────────────────────────────────
    var cache = {};

    function getFromCache(type) {
        var e = cache[type];
        if (!e) return null;
        if (Date.now() - e.time > CACHE_TTL) { delete cache[type]; return null; }
        return e.data;
    }
    function setCache(type, data) { cache[type] = { data: data, time: Date.now() }; }

    // ── Утилиты дат ────────────────────────────────────────────────────────────
    function dateBack(months) {
        var d = new Date();
        d.setMonth(d.getMonth() - months);
        return d.toISOString().split('T')[0];
    }
    function today() { return new Date().toISOString().split('T')[0]; }

    // ── Сортировки ─────────────────────────────────────────────────────────────
    function sortByRating(items) {
        return items.slice().sort(function(a, b) {
            var r = (b.vote_average || 0) - (a.vote_average || 0);
            return r !== 0 ? r : (b.vote_count || 0) - (a.vote_count || 0);
        });
    }
    function sortByPopularity(items) {
        return items.slice().sort(function(a, b) {
            return (b.popularity || 0) - (a.popularity || 0);
        });
    }
    function sortByDate(items) {
        return items.slice().sort(function(a, b) {
            var da = a.release_date || a.first_air_date || '';
            var db = b.release_date || b.first_air_date || '';
            if (!da) return 1; if (!db) return -1;
            return db.localeCompare(da);
        });
    }
    function applySort(items, sort) {
        if (sort === 'date') return sortByDate(items);
        if (sort === 'popularity') return sortByPopularity(items);
        return sortByRating(items);
    }
    function shuffleArray(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    // ── Фильтры ────────────────────────────────────────────────────────────────
    function filterGood(items) {
        return items.filter(function(i) {
            return (i.vote_average || 0) >= MIN_RATING && (i.vote_count || 0) >= MIN_VOTES;
        });
    }
    function filterThreeMonths(items) {
        var min = dateBack(3);
        return items.filter(function(i) {
            var d = i.release_date || i.first_air_date || '';
            return d >= min;
        });
    }

    // ── Обработка результатов ──────────────────────────────────────────────────
    function processResults(data, mediaType) {
        if (!data || !data.results) return [];
        return data.results.map(function(item) {
            item.media_type = mediaType;
            if (item.vote_average && item.vote_count) {
                var info = '⭐ ' + item.vote_average.toFixed(1) + ' • 👥 ' + item.vote_count.toLocaleString('ru-RU') + ' оценок';
                item.overview = item.overview ? info + '\n\n' + item.overview : info;
            }
            return item;
        });
    }

    // ── Загрузка страниц ───────────────────────────────────────────────────────
    function loadPages(url, mediaType, network, cb) {
        var all = [], done = 0;
        for (var p = 1; p <= PAGES_TO_LOAD; p++) {
            (function(page) {
                network.silent(url + '&page=' + page, function(data) {
                    if (data && data.results) all = all.concat(processResults(data, mediaType));
                    if (++done === PAGES_TO_LOAD) cb(all);
                }, function() { if (++done === PAGES_TO_LOAD) cb(all); });
            })(p);
        }
    }

    // ── API ────────────────────────────────────────────────────────────────────
    var API = {
        fetch: function(params, success) {
            var type = params.type;
            var cached = getFromCache(type);
            if (cached) {
                if (type === 'random') {
                    success({ results: shuffleArray(cached.results), title: params.title, raw: cached.results });
                } else {
                    success(cached);
                }
                return;
            }

            var net = new Lampa.Reguest();
            var key = Lampa.TMDB.key();
            var lang = Lampa.Storage.get('tmdb_lang', 'ru');
            var t3 = dateBack(3);
            var td = today();

            function finish(results) {
                var out = { results: sortByRating(results), title: params.title, raw: results };
                setCache(type, out);
                if (type === 'random') {
                    success({ results: shuffleArray(results), title: params.title, raw: results });
                } else {
                    success(out);
                }
            }

            function discoverBoth(movieGenre, tvGenre, extraMovieParams, extraTvParams) {
                var mUrl = API_BASE + '/discover/movie?api_key=' + key + '&language=' + lang +
                    '&vote_count.gte=' + MIN_VOTES + '&vote_average.gte=' + MIN_RATING +
                    '&primary_release_date.gte=' + t3 + '&primary_release_date.lte=' + td +
                    (movieGenre ? '&with_genres=' + movieGenre : '') +
                    (extraMovieParams || '');
                var tUrl = API_BASE + '/discover/tv?api_key=' + key + '&language=' + lang +
                    '&vote_count.gte=' + MIN_VOTES + '&vote_average.gte=' + MIN_RATING +
                    '&first_air_date.gte=' + t3 + '&first_air_date.lte=' + td +
                    (tvGenre ? '&with_genres=' + tvGenre : '') +
                    (extraTvParams || '');
                var mv = [], tv = [], c = 0;
                function chk() { if (++c === 2) finish(mv.concat(tv)); }
                loadPages(mUrl, 'movie', net, function(r) { mv = r; chk(); });
                loadPages(tUrl, 'tv', net, function(r) { tv = r; chk(); });
            }

            // Тренды — отдельный endpoint (без фильтра дат, TMDB сам даёт актуальное)
            if (type === 'trending_day' || type === 'trending_week') {
                var period = (type === 'trending_day') ? 'day' : 'week';
                var trendUrl = API_BASE + '/trending/all/' + period + '?api_key=' + key + '&language=' + lang;
                var raw = [];
                var done = 0;
                for (var pg = 1; pg <= PAGES_TO_LOAD; pg++) {
                    (function(page) {
                        net.silent(trendUrl + '&page=' + page, function(data) {
                            if (data && data.results) {
                                data.results.forEach(function(item) {
                                    var mt = item.media_type || 'movie';
                                    processResults({ results: [item] }, mt).forEach(function(r) { raw.push(r); });
                                });
                            }
                            if (++done === PAGES_TO_LOAD) finish(filterGood(raw));
                        }, function() { if (++done === PAGES_TO_LOAD) finish(filterGood(raw)); });
                    })(pg);
                }
                return;
            }

            // Скоро в кино
            if (type === 'upcoming') {
                var upUrl = API_BASE + '/movie/upcoming?api_key=' + key + '&language=' + lang;
                loadPages(upUrl, 'movie', net, function(r) {
                    finish(r); // не фильтруем по рейтингу — контент ещё не вышел
                });
                return;
            }

            // Топ всё / Случайное
            if (type === 'all' || type === 'random') {
                discoverBoth(null, null, '&sort_by=popularity.desc', '&sort_by=popularity.desc');
                return;
            }
            // Топ фильмы
            if (type === 'movies') {
                var mOnly = API_BASE + '/discover/movie?api_key=' + key + '&language=' + lang +
                    '&vote_count.gte=' + MIN_VOTES + '&vote_average.gte=' + MIN_RATING +
                    '&primary_release_date.gte=' + t3 + '&primary_release_date.lte=' + td +
                    '&sort_by=vote_average.desc';
                loadPages(mOnly, 'movie', net, function(r) { finish(filterGood(r)); });
                return;
            }
            // Топ сериалы
            if (type === 'tv') {
                var tOnly = API_BASE + '/discover/tv?api_key=' + key + '&language=' + lang +
                    '&vote_count.gte=' + MIN_VOTES + '&vote_average.gte=' + MIN_RATING +
                    '&first_air_date.gte=' + t3 + '&first_air_date.lte=' + td +
                    '&sort_by=vote_average.desc';
                loadPages(tOnly, 'tv', net, function(r) { finish(filterGood(r)); });
                return;
            }
            // Новые фильмы / сериалы
            if (type === 'new_movies') {
                var nmUrl = API_BASE + '/discover/movie?api_key=' + key + '&language=' + lang +
                    '&vote_count.gte=' + MIN_VOTES + '&vote_average.gte=' + MIN_RATING +
                    '&primary_release_date.gte=' + t3 + '&primary_release_date.lte=' + td +
                    '&sort_by=release_date.desc';
                loadPages(nmUrl, 'movie', net, function(r) { finish(sortByDate(filterGood(r))); });
                return;
            }
            if (type === 'new_tv') {
                var ntUrl = API_BASE + '/discover/tv?api_key=' + key + '&language=' + lang +
                    '&vote_count.gte=' + MIN_VOTES + '&vote_average.gte=' + MIN_RATING +
                    '&first_air_date.gte=' + t3 + '&first_air_date.lte=' + td +
                    '&sort_by=first_air_date.desc';
                loadPages(ntUrl, 'tv', net, function(r) { finish(sortByDate(filterGood(r))); });
                return;
            }
            // Русские
            if (type === 'russian') {
                discoverBoth(null, null,
                    '&with_original_language=ru&sort_by=vote_average.desc',
                    '&with_original_language=ru&sort_by=vote_average.desc'
                );
                return;
            }
            // Турецкие
            if (type === 'turkish') {
                discoverBoth(null, null,
                    '&with_original_language=tr&sort_by=vote_average.desc',
                    '&with_original_language=tr&sort_by=vote_average.desc'
                );
                return;
            }
            // Жанры
            var genreKey = type.replace('genre_', '');
            if (GENRE_MAP[genreKey]) {
                var gm = GENRE_MAP[genreKey];
                discoverBoth(gm.movie, gm.tv, '&sort_by=vote_average.desc', '&sort_by=vote_average.desc');
                return;
            }
        },
        clear: function() { cache = {}; }
    };

    // ── Главный экран ──────────────────────────────────────────────────────────
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
                                    sort: 'rating',
                                    page: 1
                                }
                            };
                        })
                    });
                }, 100);
            },
            onInstance: function(card, data) {
                card.use({
                    onEnter: function() { if (data && data.data) Lampa.Activity.push(data.data); }
                });
            }
        });
        return component;
    }

    // ── Экран категории (с сортировкой) ────────────────────────────────────────
    function createFullComponent(params) {
        var component = Lampa.Maker.make('Category', params);
        var rawResults = [];
        var currentSort = params.sort || 'rating';
        var self;

        function rebuildSorted() {
            if (!rawResults.length) return;
            var sorted = applySort(rawResults, currentSort);
            self.build({ results: sorted, title: params.title });
        }

        function showSortMenu() {
            Lampa.Select.show({
                title: 'Сортировка',
                items: [
                    { title: (currentSort === 'rating'     ? '✓ ' : '   ') + 'По рейтингу',     sort: 'rating'     },
                    { title: (currentSort === 'date'       ? '✓ ' : '   ') + 'По дате выхода',   sort: 'date'       },
                    { title: (currentSort === 'popularity' ? '✓ ' : '   ') + 'По популярности',  sort: 'popularity' }
                ],
                onSelect: function(item) {
                    currentSort = item.sort;
                    rebuildSorted();
                },
                onBack: function() { Lampa.Controller.toggle('content'); }
            });
        }

        component.use({
            onCreate: function() {
                self = this;
                this.activity.loader(true);

                // Кнопка сортировки в заголовке
                var sortBtn = $('<div class="sort__btn selector" style="display:inline-block;padding:4px 14px;margin:0 0 8px 10px;background:rgba(255,255,255,0.12);border-radius:20px;font-size:14px;cursor:pointer;">⇅ Сортировка</div>');
                sortBtn.on('hover:enter', showSortMenu);
                this.body.before(sortBtn);

                API.fetch(params, function(data) {
                    rawResults = data.raw || data.results || [];
                    self.build(data);
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

    // ── Инициализация ──────────────────────────────────────────────────────────
    function startPlugin() {
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
            Lampa.Activity.push({ url: '', title: 'Топ TMDB', component: 'top_ratings', page: 1 });
        });
        $('.menu .menu__list').eq(0).append(menuItem);
    }

    if (window.appready) { startPlugin(); }
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
