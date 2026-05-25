(function() {
    'use strict';

    if (window.top_ratings_plugin) return;
    window.top_ratings_plugin = true;

    var API_BASE     = 'https://api.themoviedb.org/3';
    var PAGES        = 10;   // 10 стр × 20 = 200 сырых, берём 50 лучших
    var MAX          = 50;
    var CACHE_TTL    = 20 * 60 * 1000; // 20 минут

    // TMDB жанры
    var GM = { action:28, comedy:35, horror:27, thriller:53, animation:16, documentary:99, crime:80 };
    var GT = { action:10759, comedy:35, horror:9648, thriller:80, animation:16, documentary:99, crime:80 };

    // ── Текстовые карточки-постеры (SVG 200×300) ─────────────────────────────
    function mkCard(c1, c2, line1, line2, line3) {
        var items = [line1, line2, line3].filter(Boolean);
        var total = items.length;
        var startY = total === 1 ? 160 : total === 2 ? 143 : 125;
        var rows = items.map(function(t, i) {
            var size = t.length > 9 ? '22' : '26';
            return '<text x="100" y="' + (startY + i * 36) + '" text-anchor="middle" fill="#fff" ' +
                   'font-size="' + size + '" font-family="Arial,sans-serif" font-weight="bold" ' +
                   'style="text-shadow:0 2px 6px rgba(0,0,0,.7)">' + t + '</text>';
        }).join('');
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' +
            '<defs><linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">' +
            '<stop offset="0%" stop-color="' + c1 + '"/>' +
            '<stop offset="100%" stop-color="' + c2 + '"/>' +
            '</linearGradient></defs>' +
            '<rect width="200" height="300" fill="url(#bg)"/>' +
            '<rect width="200" height="300" fill="#000" opacity="0.15"/>' +
            '<rect x="16" y="16" width="168" height="268" fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="1" rx="4"/>' +
            rows + '</svg>'
        );
    }

    var CATS = [
        { title:'Топ по популярности',        img:mkCard('#f7971e','#e05d00','ТОП ПО','ПОПУЛЯР-','НОСТИ'),    type:'all'          },
        { title:'Топ Фильмы',                 img:mkCard('#c0392b','#7f0000','ТОП','ФИЛЬМЫ'),                type:'movies'       },
        { title:'Топ Сериалы',                img:mkCard('#1565C0','#0d2f6e','ТОП','СЕРИАЛЫ'),               type:'tv'           },
        { title:'Новые Фильмы',               img:mkCard('#1a9b4e','#0a5c2c','НОВЫЕ','ФИЛЬМЫ'),              type:'new_movies'   },
        { title:'Новые Сериалы',              img:mkCard('#00695C','#003d33','НОВЫЕ','СЕРИАЛЫ'),              type:'new_tv'       },
        { title:'Скоро в кино',               img:mkCard('#6A1B9A','#2e0052','СКОРО','В КИНО'),              type:'upcoming'     },
        { title:'Тренды сегодня',             img:mkCard('#e65c00','#b33a00','ТРЕНДЫ','СЕГОДНЯ'),            type:'trend_day'    },
        { title:'Тренды за неделю',           img:mkCard('#b8860b','#7a5700','ТРЕНДЫ','НЕДЕЛЯ'),             type:'trend_week'   },
        { title:'Боевики',                    img:mkCard('#b71c1c','#7f0000','БОЕВИКИ'),                     type:'g_action'     },
        { title:'Комедии',                    img:mkCard('#e65100','#c43a00','КОМЕДИИ'),                     type:'g_comedy'     },
        { title:'Ужасы',                      img:mkCard('#1a1a1a','#3a3a3a','УЖАСЫ'),                      type:'g_horror'     },
        { title:'Триллеры',                   img:mkCard('#6a0080','#38004a','ТРИЛЛЕРЫ'),                    type:'g_thriller'   },
        { title:'Криминальные',               img:mkCard('#263238','#455A64','КРИМИ-','НАЛЬНЫЕ'),            type:'g_crime'      },
        { title:'Аниме и Мультфильмы',        img:mkCard('#006064','#003d40','АНИМЕ','МУЛЬТЫ'),              type:'g_animation'  },
        { title:'Документальные',             img:mkCard('#37474F','#1a272c','ДОКУМЕН-','ТАЛЬНЫЕ'),          type:'g_documentary'},
        { title:'Русские фильмы и сериалы',   img:mkCard('#0039A6','#8b0000','РУССКОЕ','КИНО'),             type:'russian'      },
        { title:'Турецкие фильмы и сериалы',  img:mkCard('#E30A17','#7a0000','ТУРЕЦКОЕ','КИНО'),            type:'turkish'      },
        { title:'Случайный выбор',            img:mkCard('#4a00e0','#2c0087','СЛУЧАЙ-','НОЕ'),              type:'random'       }
    ];

    // ── Кэш ───────────────────────────────────────────────────────────────────
    var cache = {};
    function fromCache(t) {
        var e = cache[t];
        if (!e || Date.now()-e.ts > CACHE_TTL) { delete cache[t]; return null; }
        return e.list;
    }
    function toCache(t, list) { cache[t] = { list:list, ts:Date.now() }; }

    // ── Даты ──────────────────────────────────────────────────────────────────
    function ago(m) { var d=new Date(); d.setMonth(d.getMonth()-m); return d.toISOString().split('T')[0]; }
    function today() { return new Date().toISOString().split('T')[0]; }

    // ── Сортировка / обрезка ──────────────────────────────────────────────────
    function top(list, by) {
        var arr = list.slice();
        if (by === 'date') {
            arr.sort(function(a,b) {
                var da=a.release_date||a.first_air_date||'', db=b.release_date||b.first_air_date||'';
                return db>da?1:db<da?-1:0;
            });
        } else if (by === 'pop') {
            arr.sort(function(a,b){ return (b.popularity||0)-(a.popularity||0); });
        } else {
            arr.sort(function(a,b){ return (b.vote_average||0)-(a.vote_average||0)||(b.vote_count||0)-(a.vote_count||0); });
        }
        return arr.slice(0, MAX);
    }
    function shuffle(arr) {
        var a=arr.slice();
        for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}
        return a.slice(0, MAX);
    }

    // ── Обработка ─────────────────────────────────────────────────────────────
    function proc(data, mt) {
        if (!data || !data.results) return [];
        var out = [];
        data.results.forEach(function(item) {
            // Отфильтровываем людей из трендов
            var mtype = item.media_type || mt;
            if (mtype === 'person') return;
            item.media_type = mtype;
            if (item.vote_average) {
                var info = '\u2B50 ' + item.vote_average.toFixed(1) +
                           ' \u2022 ' + (item.vote_count||0).toLocaleString('ru-RU') + ' \u043E\u0446.';
                item.overview = item.overview ? info+'\n\n'+item.overview : info;
            }
            out.push(item);
        });
        return out;
    }

    // ── Загрузчик страниц ─────────────────────────────────────────────────────
    function loadPages(url, mt, net, cb) {
        var all=[], done=0;
        for (var p=1; p<=PAGES; p++) {
            (function(page){
                net.silent(url+'&page='+page,
                    function(data){ if(data&&data.results) all=all.concat(proc(data,mt)); if(++done===PAGES) cb(all); },
                    function(){ if(++done===PAGES) cb(all); }
                );
            })(p);
        }
    }
    function loadBoth(mu, tu, net, cb) {
        var mv=[],tv=[],c=0;
        function chk(){ if(++c===2) cb(mv.concat(tv)); }
        loadPages(mu,'movie',net,function(r){mv=r;chk();});
        loadPages(tu,'tv',   net,function(r){tv=r;chk();});
    }

    // ── Строители URL ─────────────────────────────────────────────────────────
    function discoverM(key, lang, extra) {
        return API_BASE+'/discover/movie?api_key='+key+'&language='+lang+extra;
    }
    function discoverT(key, lang, extra) {
        return API_BASE+'/discover/tv?api_key='+key+'&language='+lang+extra;
    }

    // ── Получение данных ──────────────────────────────────────────────────────
    function fetchData(type, onDone) {
        var cached = fromCache(type);
        if (cached) {
            onDone(type==='random' ? shuffle(cached) : top(cached,'rating'));
            return;
        }

        var net  = new Lampa.Reguest();
        var key  = Lampa.TMDB.key();
        var lang = Lampa.Storage.get('tmdb_lang','ru');
        var y1   = ago(12);   // 1 год назад
        var y3   = ago(36);   // 3 года назад (для "скоро")
        var td   = today();

        function done(list, sortBy) {
            toCache(type, list);
            onDone(type==='random' ? shuffle(list) : top(list, sortBy||'rating'));
        }

        // Тренды
        if (type==='trend_day'||type==='trend_week') {
            var period = type==='trend_day'?'day':'week';
            var tUrl = API_BASE+'/trending/all/'+period+'?api_key='+key+'&language='+lang;
            var raw=[],cnt=0;
            for(var pg=1;pg<=PAGES;pg++){
                (function(page){
                    net.silent(tUrl+'&page='+page,
                        function(data){if(data&&data.results) raw=raw.concat(proc(data,null)); if(++cnt===PAGES) done(raw,'pop');},
                        function(){if(++cnt===PAGES) done(raw,'pop');}
                    );
                })(pg);
            }
            return;
        }

        // Скоро в кино (без строгого фильтра дат — просто upcoming)
        if (type==='upcoming') {
            loadPages(API_BASE+'/movie/upcoming?api_key='+key+'&language='+lang, 'movie', net, function(r){ done(r,'date'); });
            return;
        }

        // Топ популярное (оба, год)
        if (type==='all'||type==='random') {
            loadBoth(
                discoverM(key,lang,'&sort_by=popularity.desc&primary_release_date.gte='+y1+'&primary_release_date.lte='+td),
                discoverT(key,lang,'&sort_by=popularity.desc&first_air_date.gte='+y1+'&first_air_date.lte='+td),
                net, function(r){ done(r,'pop'); }
            );
            return;
        }

        // Топ фильмы (год, vote_count >= 50)
        if (type==='movies') {
            loadPages(discoverM(key,lang,'&sort_by=vote_average.desc&vote_count.gte=50&primary_release_date.gte='+y1+'&primary_release_date.lte='+td), 'movie', net, function(r){ done(r,'rating'); });
            return;
        }

        // Топ сериалы (год)
        if (type==='tv') {
            loadPages(discoverT(key,lang,'&sort_by=vote_average.desc&vote_count.gte=50&first_air_date.gte='+y1+'&first_air_date.lte='+td), 'tv', net, function(r){ done(r,'rating'); });
            return;
        }

        // Новые фильмы (год, по дате)
        if (type==='new_movies') {
            loadPages(discoverM(key,lang,'&sort_by=popularity.desc&primary_release_date.gte='+y1+'&primary_release_date.lte='+td), 'movie', net, function(r){ done(r,'date'); });
            return;
        }

        // Новые сериалы (год, по дате)
        if (type==='new_tv') {
            loadPages(discoverT(key,lang,'&sort_by=popularity.desc&first_air_date.gte='+y1+'&first_air_date.lte='+td), 'tv', net, function(r){ done(r,'date'); });
            return;
        }

        // Русские (год)
        if (type==='russian') {
            loadBoth(
                discoverM(key,lang,'&with_original_language=ru&sort_by=popularity.desc&primary_release_date.gte='+y1+'&primary_release_date.lte='+td),
                discoverT(key,lang,'&with_original_language=ru&sort_by=popularity.desc&first_air_date.gte='+y1+'&first_air_date.lte='+td),
                net, function(r){ done(r,'pop'); }
            );
            return;
        }

        // Турецкие (год)
        if (type==='turkish') {
            loadBoth(
                discoverM(key,lang,'&with_original_language=tr&sort_by=popularity.desc&primary_release_date.gte='+y1+'&primary_release_date.lte='+td),
                discoverT(key,lang,'&with_original_language=tr&sort_by=popularity.desc&first_air_date.gte='+y1+'&first_air_date.lte='+td),
                net, function(r){ done(r,'pop'); }
            );
            return;
        }

        // Жанры (год)
        var gKey = type.replace('g_','');
        if (GM[gKey]) {
            loadBoth(
                discoverM(key,lang,'&with_genres='+GM[gKey]+'&sort_by=popularity.desc&vote_count.gte=20&primary_release_date.gte='+y1+'&primary_release_date.lte='+td),
                discoverT(key,lang,'&with_genres='+GT[gKey]+'&sort_by=popularity.desc&vote_count.gte=20&first_air_date.gte='+y1+'&first_air_date.lte='+td),
                net, function(r){ done(r,'pop'); }
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
                            data: {
                                title:     c.title,
                                component: 'top_full',
                                type:      c.type,
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
        var comp = Lampa.Maker.make('Category', params);
        comp.use({
            onCreate: function() {
                var self = this;
                this.activity.loader(true);
                fetchData(params.type, function(list) {
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
            '</svg></div>' +
            '<div class="menu__text">\u0422\u043E\u043F TMDB</div>' +
            '</li>'
        );
        mi.on('hover:enter', function() {
            Lampa.Activity.push({ url:'', title:'\u0422\u043E\u043F TMDB', component:'top_ratings', page:1 });
        });
        $('.menu .menu__list').eq(0).append(mi);
    }

    if (window.appready) { start(); }
    else { Lampa.Listener.follow('app', function(e){ if(e.type==='ready') start(); }); }

})();
