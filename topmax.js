(function() {
    'use strict';

    if (window.top_ratings_plugin) return;
    window.top_ratings_plugin = true;

    var API_BASE = 'https://api.themoviedb.org/3';
    var PAGES_TO_LOAD = 4;
    var MAX_ITEMS = 50;
    var CACHE_TTL = 15 * 60 * 1000;

    var GENRE_MOVIE = { action: 28, comedy: 35, horror: 27, thriller: 53, animation: 16, documentary: 99 };
    var GENRE_TV    = { action: 10759, comedy: 35, horror: 9648, thriller: 80, animation: 16, documentary: 99 };

    // ── Текстовые карточки: градиент + название ────────────────────────────────
    function card(from, to, lines, sub) {
        var rows = lines.split('|');
        var y0 = sub ? (rows.length === 1 ? 148 : rows.length === 2 ? 135 : 120) : (rows.length === 1 ? 155 : rows.length === 2 ? 140 : 125);
        var texts = rows.map(function(t, i) {
            return '<text x="100" y="' + (y0 + i * 40) + '" text-anchor="middle" fill="#fff" font-size="30" font-family="Arial,sans-serif" font-weight="bold">' + t + '</text>';
        }).join('');
        var subText = sub ? '<text x="100" y="' + (y0 + rows.length * 40 + 4) + '" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-size="16" font-family="Arial,sans-serif">' + sub + '</text>' : '';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' +
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="' + from + '"/><stop offset="100%" stop-color="' + to + '"/></linearGradient></defs>' +
            '<rect width="200" height="300" fill="url(#g)" rx="4"/>' +
            '<rect width="200" height="300" fill="#000" opacity="0.18" rx="4"/>' +
            texts + subText +
            '</svg>'
        );
    }

    var CATS = [
        { title: 'Топ по популярности',       img: card('#f7971e','#ffd200','ТОП|ПО ПОПУ-|ЛЯРНОСТИ'), type: 'all'           },
        { title: 'Топ Фильмы',                img: card('#c0392b','#8e0e00','ТОП|ФИЛЬМЫ'),            type: 'movies'        },
        { title: 'Топ Сериалы',               img: card('#1565C0','#0d47a1','ТОП|СЕРИАЛЫ'),           type: 'tv'            },
        { title: 'Новые Фильмы',              img: card('#1DB954','#0a7a34','НОВЫЕ|ФИЛЬМЫ','3 месяца'),type: 'new_movies'    },
        { title: 'Новые Сериалы',             img: card('#00695C','#004D40','НОВЫЕ|СЕРИАЛЫ','3 месяца'),type:'new_tv'        },
        { title: 'Скоро в кино',              img: card('#6A1B9A','#4A148C','СКОРО|В КИНО'),          type: 'upcoming'      },
        { title: 'Тренды сегодня',            img: card('#e65c00','#F9D423','ТРЕНДЫ|СЕГОДНЯ'),        type: 'trend_day'     },
        { title: 'Тренды за неделю',          img: card('#f7971e','#ff6b6b','ТРЕНДЫ|НЕДЕЛЯ'),         type: 'trend_week'    },
        { title: 'Боевики',                   img: card('#b71c1c','#d32f2f','БОЕВИКИ'),               type: 'g_action'      },
        { title: 'Комедии',                   img: card('#e65100','#ff9800','КОМЕДИИ'),               type: 'g_comedy'      },
        { title: 'Ужасы',                     img: card('#212121','#424242','УЖАСЫ'),                 type: 'g_horror'      },
        { title: 'Триллеры',                  img: card('#880E4F','#4A148C','ТРИЛЛЕРЫ'),              type: 'g_thriller'    },
        { title: 'Аниме и Мультфильмы',       img: card('#006064','#00ACC1','АНИМЕ|МУЛЬТЫ'),          type: 'g_animation'   },
        { title: 'Документальные',            img: card('#37474F','#546E7A','ДОКУ-|МЕНТАЛЬ-|НЫЕ'),   type: 'g_documentary' },
        { title: 'Русские фильмы и сериалы',  img: card('#0039A6','#D52B1E','РУССКОЕ|КИНО'),          type: 'russian'       },
        { title: 'Турецкие фильмы и сериалы', img: card('#E30A17','#7a0000','ТУРЕЦКОЕ|КИНО'),        type: 'turkish'       },
        { title: 'Случайный выбор',           img: card('#4a00e0','#8e2de2','СЛУЧАЙ-|НОЕ'),           type: 'random'        }
    ];

    // ── Кэш ───────────────────────────────────────────────────────────────────
    var cache = {};
    function fromCache(type) {
        var e = cache[type];
        if (!e) return null;
        if (Date.now() - e.ts > CACHE_TTL) { delete cache[type]; return null; }
        return e.list;
    }
    function toCache(type, list) { cache[type] = { list: list, ts: Date.now() }; }

    // ── Даты ──────────────────────────────────────────────────────────────────
    function ago(months) {
        var d = new Date(); d.setMonth(d.getMonth() - months);
        return d.toISOString().split('T')[0];
    }
    function today() { return new Date().toISOString().split('T')[0]; }

    // ── Сортировки ────────────────────────────────────────────────────────────
    function byRating(a, b)     { return (b.vote_average||0) - (a.vote_average||0) || (b.vote_count||0) - (a.vote_count||0); }
    function byPopularity(a, b) { return (b.popularity||0) - (a.popularity||0); }
    function byDate(a, b) {
        var da = a.release_date||a.first_air_date||'', db = b.release_date||b.first_air_date||'';
        return db > da ? 1 : db < da ? -1 : 0;
    }
    function applySort(items, s) {
        var arr = items.slice();
        if (s === 'date')       arr.sort(byDate);
        else if (s === 'pop')   arr.sort(byPopularity);
        else                    arr.sort(byRating);
        return arr.slice(0, MAX_ITEMS);
    }
    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length-1; i > 0; i--) { var j = Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; }
        return a.slice(0, MAX_ITEMS);
    }

    // ── Обработка ─────────────────────────────────────────────────────────────
    function proc(data, mt) {
        if (!data || !data.results) return [];
        return data.results.map(function(item) {
            item.media_type = item.media_type || mt;
            if (item.vote_average) {
                var info = '\u2B50 ' + item.vote_average.toFixed(1) + ' \u2022 ' + (item.vote_count||0).toLocaleString('ru-RU') + ' \u043E\u0446\u0435\u043D\u043E\u043A';
                item.overview = item.overview ? info + '\n\n' + item.overview : info;
            }
            return item;
        });
    }

    // ── Загрузка ──────────────────────────────────────────────────────────────
    function pages(url, mt, net, cb) {
        var all = [], done = 0;
        for (var p = 1; p <= PAGES_TO_LOAD; p++) {
            (function(page) {
                net.silent(url + '&page=' + page,
                    function(data) { if (data && data.results) all = all.concat(proc(data, mt)); if (++done === PAGES_TO_LOAD) cb(all); },
                    function()     { if (++done === PAGES_TO_LOAD) cb(all); }
                );
            })(p);
        }
    }
    function both(mu, tu, net, cb) {
        var mv = [], tv = [], c = 0;
        function chk() { if (++c === 2) cb(mv.concat(tv)); }
        pages(mu, 'movie', net, function(r) { mv = r; chk(); });
        pages(tu, 'tv',    net, function(r) { tv = r; chk(); });
    }

    // ── API ───────────────────────────────────────────────────────────────────
    function fetchData(type, sort, onDone) {
        var cached = fromCache(type);
        if (cached) {
            onDone(type === 'random' ? shuffle(cached) : applySort(cached, sort));
            return;
        }

        var net  = new Lampa.Reguest();
        var key  = Lampa.TMDB.key();
        var lang = Lampa.Storage.get('tmdb_lang', 'ru');
        var d3   = ago(3), d6 = ago(6), d12 = ago(12), td = today();

        function done(list) {
            toCache(type, list);
            onDone(type === 'random' ? shuffle(list) : applySort(list, sort));
        }

        // Тренды
        if (type === 'trend_day' || type === 'trend_week') {
            var period = (type === 'trend_day') ? 'day' : 'week';
            var tUrl = API_BASE + '/trending/all/' + period + '?api_key=' + key + '&language=' + lang;
            var raw = [], cnt = 0;
            for (var pg = 1; pg <= PAGES_TO_LOAD; pg++) {
                (function(page) {
                    net.silent(tUrl + '&page=' + page,
                        function(data) { if (data && data.results) raw = raw.concat(proc(data, null)); if (++cnt === PAGES_TO_LOAD) done(raw); },
                        function()     { if (++cnt === PAGES_TO_LOAD) done(raw); }
                    );
                })(pg);
            }
            return;
        }

        if (type === 'upcoming') {
            pages(API_BASE + '/movie/upcoming?api_key=' + key + '&language=' + lang, 'movie', net, done);
            return;
        }
        if (type === 'all' || type === 'random') {
            both(
                API_BASE + '/discover/movie?api_key=' + key + '&language=' + lang + '&sort_by=popularity.desc&primary_release_date.gte=' + d6 + '&primary_release_date.lte=' + td,
                API_BASE + '/discover/tv?api_key='    + key + '&language=' + lang + '&sort_by=popularity.desc&first_air_date.gte=' + d6 + '&first_air_date.lte=' + td,
                net, done
            );
            return;
        }
        if (type === 'movies') {
            pages(API_BASE + '/discover/movie?api_key=' + key + '&language=' + lang + '&sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte=' + d6 + '&primary_release_date.lte=' + td, 'movie', net, done);
            return;
        }
        if (type === 'tv') {
            pages(API_BASE + '/discover/tv?api_key=' + key + '&language=' + lang + '&sort_by=vote_average.desc&vote_count.gte=100&first_air_date.gte=' + d6 + '&first_air_date.lte=' + td, 'tv', net, done);
            return;
        }
        if (type === 'new_movies') {
            pages(API_BASE + '/discover/movie?api_key=' + key + '&language=' + lang + '&sort_by=release_date.desc&primary_release_date.gte=' + d3 + '&primary_release_date.lte=' + td, 'movie', net, done);
            return;
        }
        if (type === 'new_tv') {
            pages(API_BASE + '/discover/tv?api_key=' + key + '&language=' + lang + '&sort_by=first_air_date.desc&first_air_date.gte=' + d3 + '&first_air_date.lte=' + td, 'tv', net, done);
            return;
        }
        if (type === 'russian') {
            both(
                API_BASE + '/discover/movie?api_key=' + key + '&language=' + lang + '&with_original_language=ru&sort_by=popularity.desc&primary_release_date.gte=' + d12 + '&primary_release_date.lte=' + td,
                API_BASE + '/discover/tv?api_key='    + key + '&language=' + lang + '&with_original_language=ru&sort_by=popularity.desc&first_air_date.gte=' + d12 + '&first_air_date.lte=' + td,
                net, done
            );
            return;
        }
        if (type === 'turkish') {
            both(
                API_BASE + '/discover/movie?api_key=' + key + '&language=' + lang + '&with_original_language=tr&sort_by=popularity.desc&primary_release_date.gte=' + d12 + '&primary_release_date.lte=' + td,
                API_BASE + '/discover/tv?api_key='    + key + '&language=' + lang + '&with_original_language=tr&sort_by=popularity.desc&first_air_date.gte=' + d12 + '&first_air_date.lte=' + td,
                net, done
            );
            return;
        }
        // Жанры
        var gKey = type.replace('g_', '');
        if (GENRE_MOVIE[gKey]) {
            both(
                API_BASE + '/discover/movie?api_key=' + key + '&language=' + lang + '&with_genres=' + GENRE_MOVIE[gKey] + '&sort_by=vote_average.desc&vote_count.gte=50&primary_release_date.gte=' + d6 + '&primary_release_date.lte=' + td,
                API_BASE + '/discover/tv?api_key='    + key + '&language=' + lang + '&with_genres=' + GENRE_TV[gKey]    + '&sort_by=vote_average.desc&vote_count.gte=50&first_air_date.gte=' + d6 + '&first_air_date.lte=' + td,
                net, done
            );
        }
    }

    // ── Главный экран ─────────────────────────────────────────────────────────
    function mainComp(params) {
        var comp = Lampa.Maker.make('Category', params);
        comp.use({
            onCreate: function() {
                var self = this;
                this.body.addClass('mapping--grid');
                this.body.addClass('cols--5');
                setTimeout(function() {
                    var items = CATS.map(function(c) {
                        return {
                            title: c.title,
                            name:  c.title,
                            img:   c.img,
                            params: { style: { name: 'collection' } },
                            data: {
                                title:     c.title,
                                component: 'top_full',
                                type:      c.type,
                                sort:      'rating',
                                page:      1
                            }
                        };
                    });
                    self.build({ results: items });
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
        return comp;
    }

    // ── Экран категории ───────────────────────────────────────────────────────
    function fullComp(params) {
        var comp  = Lampa.Maker.make('Category', params);
        var raw   = [];
        var sort  = params.sort || 'rating';
        var self;

        function rebuild() {
            if (!raw.length) return;
            self.build({ results: applySort(raw, sort) });
        }

        function showSort() {
            Lampa.Select.show({
                title: '\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430',
                items: [
                    { title: (sort==='rating' ? '> ' : '') + '\u041F\u043E \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0443',        sort: 'rating' },
                    { title: (sort==='date'   ? '> ' : '') + '\u041F\u043E \u0434\u0430\u0442\u0435 \u0432\u044B\u0445\u043E\u0434\u0430', sort: 'date'   },
                    { title: (sort==='pop'    ? '> ' : '') + '\u041F\u043E \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u043E\u0441\u0442\u0438',  sort: 'pop'    }
                ],
                onSelect: function(item) { sort = item.sort; rebuild(); },
                onBack:   function()     { Lampa.Controller.toggle('content'); }
            });
        }

        comp.use({
            onCreate: function() {
                self = this;
                this.activity.loader(true);

                // Кнопка сортировки
                var btn = $('<div class="selector" style="display:inline-block;margin:6px 0 6px 14px;padding:4px 18px;background:rgba(255,255,255,0.1);border-radius:20px;font-size:14px;cursor:pointer;">\u21C5 \u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430</div>');
                btn.on('hover:enter', showSort);
                this.body.before(btn);

                fetchData(params.type, sort, function(list) {
                    raw = list;
                    self.build({ results: list });
                    self.activity.loader(false);
                });
            },
            onInstance: function(card, data) {
                card.use({
                    onEnter: function(item, elem) {
                        Lampa.Activity.push({
                            url:       '',
                            component: 'full',
                            id:        elem.id,
                            method:    elem.media_type,
                            card:      elem
                        });
                    }
                });
            }
        });
        return comp;
    }

    // ── Запуск ────────────────────────────────────────────────────────────────
    function start() {
        Lampa.Component.add('top_ratings', mainComp);
        Lampa.Component.add('top_full',    fullComp);

        var mi = $(
            '<li class="menu__item selector">' +
            '<div class="menu__ico"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
            '<path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' +
            '</svg></div><div class="menu__text">\u0422\u043E\u043F TMDB</div></li>'
        );
        mi.on('hover:enter', function() {
            Lampa.Activity.push({ url: '', title: '\u0422\u043E\u043F TMDB', component: 'top_ratings', page: 1 });
        });
        $('.menu .menu__list').eq(0).append(mi);
    }

    if (window.appready) { start(); }
    else { Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') start(); }); }

})();
