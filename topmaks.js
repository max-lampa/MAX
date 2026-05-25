(function() {
    'use strict';

    if (window.top_ratings_plugin) return;
    window.top_ratings_plugin = true;

    var API_BASE = 'https://api.themoviedb.org/3';
    var PAGES_TO_LOAD = 4;   // 4 x 20 = 80 raw, вернём ровно 50
    var MAX_ITEMS = 50;
    var CACHE_TTL = 15 * 60 * 1000; // 15 минут

    // Жанры TMDB
    var GENRE_MOVIE = { action: 28, comedy: 35, horror: 27, thriller: 53, animation: 16, documentary: 99 };
    var GENRE_TV    = { action: 10759, comedy: 35, horror: 9648, thriller: 80, animation: 16, documentary: 99 };

    // SVG-иконки 200x300 (постер), без эмодзи — чистый SVG
    function mkSvg(body) {
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">' + body + '</svg>'
        );
    }

    var IC = {
        all: mkSvg(
            '<rect width="200" height="300" fill="#0d0d20"/>' +
            '<polygon points="100,50 122,115 192,115 136,153 157,218 100,180 43,218 64,153 8,115 78,115" fill="#FFD700"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#FFD700" font-size="22" font-family="Arial,sans-serif" font-weight="bold">TOP</text>'
        ),
        movies: mkSvg(
            '<rect width="200" height="300" fill="#1a0505"/>' +
            '<rect x="18" y="82" width="164" height="118" rx="10" fill="#E50914"/>' +
            '<rect x="18" y="82" width="26" height="118" fill="#b5070f"/>' +
            '<rect x="156" y="82" width="26" height="118" fill="#b5070f"/>' +
            '<rect x="26" y="98" width="14" height="18" rx="2" fill="#fff"/>' +
            '<rect x="26" y="126" width="14" height="18" rx="2" fill="#fff"/>' +
            '<rect x="26" y="154" width="14" height="18" rx="2" fill="#fff"/>' +
            '<rect x="160" y="98" width="14" height="18" rx="2" fill="#fff"/>' +
            '<rect x="160" y="126" width="14" height="18" rx="2" fill="#fff"/>' +
            '<rect x="160" y="154" width="14" height="18" rx="2" fill="#fff"/>' +
            '<circle cx="100" cy="141" r="26" fill="#fff" opacity="0.15"/>' +
            '<polygon points="89,128 89,154 116,141" fill="#fff"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#E50914" font-size="20" font-family="Arial,sans-serif" font-weight="bold">ФИЛЬМЫ</text>'
        ),
        tv: mkSvg(
            '<rect width="200" height="300" fill="#05050f"/>' +
            '<rect x="18" y="78" width="164" height="120" rx="12" fill="#4285F4"/>' +
            '<rect x="30" y="90" width="140" height="86" rx="5" fill="#0a1235"/>' +
            '<rect x="80" y="198" width="40" height="8" rx="4" fill="#4285F4"/>' +
            '<circle cx="100" cy="222" r="8" fill="#4285F4" opacity="0.6"/>' +
            '<line x1="62" y1="80" x2="88" y2="55" stroke="#4285F4" stroke-width="5" stroke-linecap="round"/>' +
            '<line x1="138" y1="80" x2="112" y2="55" stroke="#4285F4" stroke-width="5" stroke-linecap="round"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#4285F4" font-size="19" font-family="Arial,sans-serif" font-weight="bold">СЕРИАЛЫ</text>'
        ),
        newm: mkSvg(
            '<rect width="200" height="300" fill="#051505"/>' +
            '<circle cx="100" cy="138" r="74" fill="#1DB954"/>' +
            '<text x="100" y="128" text-anchor="middle" fill="#fff" font-size="34" font-family="Arial,sans-serif" font-weight="bold">NEW</text>' +
            '<text x="100" y="162" text-anchor="middle" fill="#fff" font-size="18" font-family="Arial,sans-serif">ФИЛЬМ</text>' +
            '<text x="100" y="272" text-anchor="middle" fill="#1DB954" font-size="18" font-family="Arial,sans-serif" font-weight="bold">НОВИНКИ</text>'
        ),
        newt: mkSvg(
            '<rect width="200" height="300" fill="#050510"/>' +
            '<circle cx="100" cy="138" r="74" fill="#4285F4"/>' +
            '<text x="100" y="128" text-anchor="middle" fill="#fff" font-size="34" font-family="Arial,sans-serif" font-weight="bold">NEW</text>' +
            '<text x="100" y="162" text-anchor="middle" fill="#fff" font-size="16" font-family="Arial,sans-serif">СЕРИАЛ</text>' +
            '<text x="100" y="272" text-anchor="middle" fill="#4285F4" font-size="18" font-family="Arial,sans-serif" font-weight="bold">НОВИНКИ</text>'
        ),
        upcoming: mkSvg(
            '<rect width="200" height="300" fill="#100520"/>' +
            '<rect x="20" y="78" width="160" height="132" rx="12" fill="#7B2FBE"/>' +
            '<rect x="20" y="78" width="160" height="32" rx="12" fill="#9B4FDE"/>' +
            '<rect x="20" y="100" width="160" height="10" fill="#9B4FDE"/>' +
            '<rect x="36" y="88" width="18" height="32" rx="4" fill="#fff" opacity="0.9"/>' +
            '<rect x="146" y="88" width="18" height="32" rx="4" fill="#fff" opacity="0.9"/>' +
            '<text x="100" y="162" text-anchor="middle" fill="#fff" font-size="42" font-family="Arial,sans-serif" font-weight="bold">?</text>' +
            '<text x="100" y="272" text-anchor="middle" fill="#CE93D8" font-size="15" font-family="Arial,sans-serif" font-weight="bold">СКОРО В КИНО</text>'
        ),
        trendDay: mkSvg(
            '<rect width="200" height="300" fill="#1a0800"/>' +
            '<circle cx="100" cy="138" r="74" fill="#FF6B00"/>' +
            '<rect x="60" y="100" width="80" height="10" rx="5" fill="#fff" opacity="0.8"/>' +
            '<rect x="70" y="120" width="60" height="10" rx="5" fill="#fff" opacity="0.8"/>' +
            '<rect x="80" y="140" width="40" height="10" rx="5" fill="#fff" opacity="0.8"/>' +
            '<polygon points="100,165 85,188 115,188" fill="#fff" opacity="0.9"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#FF6B00" font-size="16" font-family="Arial,sans-serif" font-weight="bold">ТРЕНДЫ / ДЕНЬ</text>'
        ),
        trendWeek: mkSvg(
            '<rect width="200" height="300" fill="#0a0a00"/>' +
            '<circle cx="100" cy="138" r="74" fill="#FFC107"/>' +
            '<polyline points="30,170 60,130 90,155 120,100 160,85" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<circle cx="160" cy="85" r="10" fill="#fff"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#FFC107" font-size="15" font-family="Arial,sans-serif" font-weight="bold">ТРЕНДЫ / НЕДЕЛЯ</text>'
        ),
        action: mkSvg(
            '<rect width="200" height="300" fill="#1a0505"/>' +
            '<circle cx="100" cy="138" r="74" fill="#D32F2F"/>' +
            '<polygon points="100,80 118,128 170,128 128,158 144,206 100,176 56,206 72,158 30,128 82,128" fill="#fff" opacity="0.9"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#EF5350" font-size="20" font-family="Arial,sans-serif" font-weight="bold">БОЕВИКИ</text>'
        ),
        comedy: mkSvg(
            '<rect width="200" height="300" fill="#0a0a00"/>' +
            '<circle cx="100" cy="138" r="74" fill="#F9A825"/>' +
            '<circle cx="80" cy="120" r="10" fill="#fff"/>' +
            '<circle cx="120" cy="120" r="10" fill="#fff"/>' +
            '<circle cx="80" cy="120" r="5" fill="#333"/>' +
            '<circle cx="120" cy="120" r="5" fill="#333"/>' +
            '<path d="M68,148 Q100,178 132,148" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#F9A825" font-size="20" font-family="Arial,sans-serif" font-weight="bold">КОМЕДИИ</text>'
        ),
        horror: mkSvg(
            '<rect width="200" height="300" fill="#050505"/>' +
            '<circle cx="100" cy="138" r="74" fill="#37474F"/>' +
            '<ellipse cx="100" cy="125" rx="30" ry="38" fill="#fff" opacity="0.9"/>' +
            '<circle cx="88" cy="118" r="7" fill="#37474F"/>' +
            '<circle cx="112" cy="118" r="7" fill="#37474F"/>' +
            '<path d="M82,140 L90,132 L96,140 L100,132 L104,140 L110,132 L118,140" fill="none" stroke="#37474F" stroke-width="3"/>' +
            '<path d="M70,138 Q65,160 70,168 Q100,162 130,168 Q135,160 130,138" fill="#fff" opacity="0.9"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#90A4AE" font-size="20" font-family="Arial,sans-serif" font-weight="bold">УЖАСЫ</text>'
        ),
        thriller: mkSvg(
            '<rect width="200" height="300" fill="#0a0000"/>' +
            '<circle cx="100" cy="138" r="74" fill="#B71C1C"/>' +
            '<rect x="93" y="88" width="14" height="58" rx="7" fill="#fff" opacity="0.9"/>' +
            '<rect x="72" y="128" width="56" height="14" rx="7" fill="#fff" opacity="0.9"/>' +
            '<circle cx="100" cy="174" r="10" fill="#fff" opacity="0.9"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#EF5350" font-size="19" font-family="Arial,sans-serif" font-weight="bold">ТРИЛЛЕРЫ</text>'
        ),
        anim: mkSvg(
            '<rect width="200" height="300" fill="#001020"/>' +
            '<circle cx="100" cy="138" r="74" fill="#00BCD4"/>' +
            '<circle cx="78" cy="122" r="16" fill="#fff" opacity="0.95"/>' +
            '<circle cx="122" cy="122" r="16" fill="#fff" opacity="0.95"/>' +
            '<circle cx="78" cy="122" r="7" fill="#004d5a"/>' +
            '<circle cx="122" cy="122" r="7" fill="#004d5a"/>' +
            '<ellipse cx="100" cy="155" rx="22" ry="14" fill="#fff" opacity="0.95"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#00BCD4" font-size="14" font-family="Arial,sans-serif" font-weight="bold">АНИМЕ / МУЛЬТЫ</text>'
        ),
        docu: mkSvg(
            '<rect width="200" height="300" fill="#050810"/>' +
            '<circle cx="100" cy="138" r="74" fill="#546E7A"/>' +
            '<rect x="64" y="98" width="72" height="90" rx="4" fill="#fff" opacity="0.15"/>' +
            '<rect x="72" y="108" width="56" height="8" rx="2" fill="#fff"/>' +
            '<rect x="72" y="124" width="56" height="8" rx="2" fill="#fff" opacity="0.7"/>' +
            '<rect x="72" y="140" width="40" height="8" rx="2" fill="#fff" opacity="0.5"/>' +
            '<rect x="72" y="156" width="48" height="8" rx="2" fill="#fff" opacity="0.7"/>' +
            '<circle cx="100" cy="115" r="22" fill="none" stroke="#fff" stroke-width="4"/>' +
            '<circle cx="100" cy="115" r="8" fill="#fff"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#90A4AE" font-size="16" font-family="Arial,sans-serif" font-weight="bold">ДОКУМЕНТАЛКИ</text>'
        ),
        ru: mkSvg(
            '<rect width="200" height="300" fill="#0d0d0d"/>' +
            '<rect x="0" y="70" width="200" height="54" fill="#FFFFFF"/>' +
            '<rect x="0" y="124" width="200" height="54" fill="#0039A6"/>' +
            '<rect x="0" y="178" width="200" height="54" fill="#D52B1E"/>' +
            '<rect x="0" y="70" width="200" height="162" fill="#000" opacity="0.28"/>' +
            '<text x="100" y="164" text-anchor="middle" fill="#fff" font-size="44" font-family="Arial,sans-serif" font-weight="bold">RU</text>' +
            '<text x="100" y="272" text-anchor="middle" fill="#ccc" font-size="13" font-family="Arial,sans-serif" font-weight="bold">РУССКОЕ КИНО</text>'
        ),
        tr: mkSvg(
            '<rect width="200" height="300" fill="#0d0000"/>' +
            '<rect x="0" y="70" width="200" height="162" fill="#E30A17"/>' +
            '<rect x="0" y="70" width="200" height="162" fill="#000" opacity="0.22"/>' +
            '<circle cx="82" cy="151" r="30" fill="#fff"/>' +
            '<circle cx="94" cy="151" r="23" fill="#E30A17"/>' +
            '<polygon points="118,140 126,151 118,162 138,155 138,147" fill="#fff"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#E30A17" font-size="13" font-family="Arial,sans-serif" font-weight="bold">ТУРЕЦКОЕ КИНО</text>'
        ),
        rnd: mkSvg(
            '<rect width="200" height="300" fill="#100a1a"/>' +
            '<rect x="22" y="76" width="156" height="126" rx="16" fill="#7B1FA2"/>' +
            '<circle cx="60" cy="106" r="12" fill="#fff"/>' +
            '<circle cx="140" cy="106" r="12" fill="#fff"/>' +
            '<circle cx="60" cy="140" r="12" fill="#fff"/>' +
            '<circle cx="100" cy="140" r="12" fill="#fff"/>' +
            '<circle cx="140" cy="140" r="12" fill="#fff"/>' +
            '<circle cx="60" cy="174" r="12" fill="#fff"/>' +
            '<circle cx="140" cy="174" r="12" fill="#fff"/>' +
            '<text x="100" y="272" text-anchor="middle" fill="#CE93D8" font-size="16" font-family="Arial,sans-serif" font-weight="bold">СЛУЧАЙНОЕ</text>'
        )
    };

    var CATS = [
        { title: 'Топ по популярности',       img: IC.all,      type: 'all'            },
        { title: 'Топ Фильмы',                img: IC.movies,   type: 'movies'         },
        { title: 'Топ Сериалы',               img: IC.tv,       type: 'tv'             },
        { title: 'Новые Фильмы',              img: IC.newm,     type: 'new_movies'     },
        { title: 'Новые Сериалы',             img: IC.newt,     type: 'new_tv'         },
        { title: 'Скоро в кино',              img: IC.upcoming, type: 'upcoming'       },
        { title: 'Тренды сегодня',            img: IC.trendDay, type: 'trend_day'      },
        { title: 'Тренды за неделю',          img: IC.trendWeek,type: 'trend_week'     },
        { title: 'Боевики',                   img: IC.action,   type: 'g_action'       },
        { title: 'Комедии',                   img: IC.comedy,   type: 'g_comedy'       },
        { title: 'Ужасы',                     img: IC.horror,   type: 'g_horror'       },
        { title: 'Триллеры',                  img: IC.thriller, type: 'g_thriller'     },
        { title: 'Аниме и Мультфильмы',       img: IC.anim,     type: 'g_animation'    },
        { title: 'Документальные',            img: IC.docu,     type: 'g_documentary'  },
        { title: 'Русские фильмы и сериалы',  img: IC.ru,       type: 'russian'        },
        { title: 'Турецкие фильмы и сериалы', img: IC.tr,       type: 'turkish'        },
        { title: 'Случайный выбор',           img: IC.rnd,      type: 'random'         }
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
        var d = new Date();
        d.setMonth(d.getMonth() - months);
        return d.toISOString().split('T')[0];
    }
    function today() { return new Date().toISOString().split('T')[0]; }

    // ── Сортировки ────────────────────────────────────────────────────────────
    function byRating(a, b)     { return (b.vote_average||0)-(a.vote_average||0)||((b.vote_count||0)-(a.vote_count||0)); }
    function byPopularity(a, b) { return (b.popularity||0)-(a.popularity||0); }
    function byDate(a, b) {
        var da=a.release_date||a.first_air_date||'', db=b.release_date||b.first_air_date||'';
        return db>da?1:db<da?-1:0;
    }
    function applySort(items, s) {
        var arr = items.slice();
        if (s==='date') arr.sort(byDate);
        else if (s==='popularity') arr.sort(byPopularity);
        else arr.sort(byRating);
        return arr.slice(0, MAX_ITEMS);
    }
    function shuffle(arr) {
        var a=arr.slice();
        for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}
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

    // ── Загрузка страниц ──────────────────────────────────────────────────────
    function pages(url, mt, net, cb) {
        var all=[], done=0;
        for (var p=1; p<=PAGES_TO_LOAD; p++) {
            (function(page) {
                net.silent(url+'&page='+page, function(data) {
                    if(data&&data.results) all=all.concat(proc(data,mt));
                    if(++done===PAGES_TO_LOAD) cb(all);
                }, function(){if(++done===PAGES_TO_LOAD) cb(all);});
            })(p);
        }
    }

    // ── Комбинированная загрузка (фильмы + сериалы) ───────────────────────────
    function both(mUrl, tUrl, net, cb) {
        var mv=[], tv=[], c=0;
        function chk(){if(++c===2) cb(mv.concat(tv));}
        pages(mUrl, 'movie', net, function(r){mv=r;chk();});
        pages(tUrl, 'tv',    net, function(r){tv=r;chk();});
    }

    // ── Главный API ───────────────────────────────────────────────────────────
    function fetch(params, cb) {
        var type = params.type;
        var sort = params.sort || 'rating';

        var cached = fromCache(type);
        if (cached) {
            if (type==='random') cb(shuffle(cached));
            else cb(applySort(cached, sort));
            return;
        }

        var net = new Lampa.Reguest();
        var key = Lampa.TMDB.key();
        var lang = Lampa.Storage.get('tmdb_lang', 'ru');

        function done(list) {
            toCache(type, list);
            if (type==='random') cb(shuffle(list));
            else cb(applySort(list, sort));
        }

        // Тренды
        if (type==='trend_day' || type==='trend_week') {
            var period = (type==='trend_day')?'day':'week';
            var tUrl = API_BASE+'/trending/all/'+period+'?api_key='+key+'&language='+lang;
            var raw=[], td=0;
            for (var pg=1; pg<=PAGES_TO_LOAD; pg++) {
                (function(page){
                    net.silent(tUrl+'&page='+page, function(data){
                        if(data&&data.results) raw=raw.concat(proc(data, null));
                        if(++td===PAGES_TO_LOAD) done(raw);
                    }, function(){if(++td===PAGES_TO_LOAD) done(raw);});
                })(pg);
            }
            return;
        }

        // Скоро в кино
        if (type==='upcoming') {
            var upUrl = API_BASE+'/movie/upcoming?api_key='+key+'&language='+lang;
            pages(upUrl, 'movie', net, done);
            return;
        }

        // Все / Случайное — популярность за 6 месяцев
        if (type==='all'||type==='random') {
            var d6 = ago(6);
            both(
                API_BASE+'/discover/movie?api_key='+key+'&language='+lang+'&sort_by=popularity.desc&primary_release_date.gte='+d6+'&primary_release_date.lte='+today(),
                API_BASE+'/discover/tv?api_key='+key+'&language='+lang+'&sort_by=popularity.desc&first_air_date.gte='+d6+'&first_air_date.lte='+today(),
                net, done
            );
            return;
        }

        // Топ фильмы (6 мес)
        if (type==='movies') {
            var d6m = ago(6);
            pages(API_BASE+'/discover/movie?api_key='+key+'&language='+lang+'&sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte='+d6m+'&primary_release_date.lte='+today(), 'movie', net, done);
            return;
        }

        // Топ сериалы (6 мес)
        if (type==='tv') {
            var d6t = ago(6);
            pages(API_BASE+'/discover/tv?api_key='+key+'&language='+lang+'&sort_by=vote_average.desc&vote_count.gte=100&first_air_date.gte='+d6t+'&first_air_date.lte='+today(), 'tv', net, done);
            return;
        }

        // Новые фильмы (3 мес)
        if (type==='new_movies') {
            var d3 = ago(3);
            pages(API_BASE+'/discover/movie?api_key='+key+'&language='+lang+'&sort_by=release_date.desc&primary_release_date.gte='+d3+'&primary_release_date.lte='+today(), 'movie', net, done);
            return;
        }

        // Новые сериалы (3 мес)
        if (type==='new_tv') {
            var d3t = ago(3);
            pages(API_BASE+'/discover/tv?api_key='+key+'&language='+lang+'&sort_by=first_air_date.desc&first_air_date.gte='+d3t+'&first_air_date.lte='+today(), 'tv', net, done);
            return;
        }

        // Русские (12 мес — шире, иначе пусто)
        if (type==='russian') {
            var d12r = ago(12);
            both(
                API_BASE+'/discover/movie?api_key='+key+'&language='+lang+'&with_original_language=ru&sort_by=popularity.desc&primary_release_date.gte='+d12r+'&primary_release_date.lte='+today(),
                API_BASE+'/discover/tv?api_key='+key+'&language='+lang+'&with_original_language=ru&sort_by=popularity.desc&first_air_date.gte='+d12r+'&first_air_date.lte='+today(),
                net, done
            );
            return;
        }

        // Турецкие (12 мес)
        if (type==='turkish') {
            var d12t = ago(12);
            both(
                API_BASE+'/discover/movie?api_key='+key+'&language='+lang+'&with_original_language=tr&sort_by=popularity.desc&primary_release_date.gte='+d12t+'&primary_release_date.lte='+today(),
                API_BASE+'/discover/tv?api_key='+key+'&language='+lang+'&with_original_language=tr&sort_by=popularity.desc&first_air_date.gte='+d12t+'&first_air_date.lte='+today(),
                net, done
            );
            return;
        }

        // Жанры (6 мес, оба типа)
        var gKey = type.replace('g_','');
        if (GENRE_MOVIE[gKey]) {
            var gm=GENRE_MOVIE[gKey], gt=GENRE_TV[gKey];
            var d6g = ago(6);
            both(
                API_BASE+'/discover/movie?api_key='+key+'&language='+lang+'&with_genres='+gm+'&sort_by=vote_average.desc&vote_count.gte=50&primary_release_date.gte='+d6g+'&primary_release_date.lte='+today(),
                API_BASE+'/discover/tv?api_key='+key+'&language='+lang+'&with_genres='+gt+'&sort_by=vote_average.desc&vote_count.gte=50&first_air_date.gte='+d6g+'&first_air_date.lte='+today(),
                net, done
            );
            return;
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
                    self.build({
                        results: CATS.map(function(c) {
                            return {
                                title: c.title,
                                name:  c.title,
                                img:   c.img,
                                params: { style: { name: 'collection' } },
                                data: {
                                    title: c.title,
                                    name:  c.title,
                                    component: 'top_full',
                                    type:  c.type,
                                    sort:  'rating',
                                    page:  1
                                }
                            };
                        })
                    });
                }, 100);
            },
            onInstance: function(card, data) {
                card.use({ onEnter: function() { if(data&&data.data) Lampa.Activity.push(data.data); } });
            }
        });
        return comp;
    }

    // ── Экран категории ───────────────────────────────────────────────────────
    function fullComp(params) {
        var comp = Lampa.Maker.make('Category', params);
        var raw = [];
        var curSort = params.sort || 'rating';
        var self;

        function rebuild() {
            if (!raw.length) return;
            self.build({ results: applySort(raw, curSort), title: params.title });
        }

        function showSort() {
            Lampa.Select.show({
                title: 'Сортировка',
                items: [
                    { title: (curSort==='rating'?'> ':'')+'\u041F\u043E \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0443',         sort: 'rating'     },
                    { title: (curSort==='date'?'> ':'')+'\u041F\u043E \u0434\u0430\u0442\u0435 \u0432\u044B\u0445\u043E\u0434\u0430', sort: 'date'       },
                    { title: (curSort==='popularity'?'> ':'')+'\u041F\u043E \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u043E\u0441\u0442\u0438', sort: 'popularity' }
                ],
                onSelect: function(item) { curSort = item.sort; rebuild(); },
                onBack: function() { Lampa.Controller.toggle('content'); }
            });
        }

        comp.use({
            onCreate: function() {
                self = this;
                this.activity.loader(true);

                // Кнопка сортировки
                var btn = $('<div class="selector" style="display:inline-block;margin:6px 0 6px 12px;padding:3px 14px;background:rgba(255,255,255,0.1);border-radius:18px;font-size:13px;">\u21C5 \u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430</div>');
                btn.on('hover:enter', showSort);
                this.body.before(btn);

                fetch(params, function(list) {
                    raw = list;
                    self.build({ results: list, title: params.title });
                    self.activity.loader(false);
                });
            },
            onInstance: function(card, data) {
                card.use({
                    onEnter: function(item, elem) {
                        Lampa.Activity.push({ url:'', component:'full', id:elem.id, method:elem.media_type, card:elem });
                    }
                });
            }
        });
        return comp;
    }

    // ── Запуск ────────────────────────────────────────────────────────────────
    function start() {
        Lampa.Component.add('top_ratings',  mainComp);
        Lampa.Component.add('top_full',     fullComp);

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
