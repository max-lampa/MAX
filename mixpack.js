/*
 * LMX Pack v10.331 (русская версия) — всё в одном для Lampa: собственная главная, каталоги (стриминги, аниме, дорамы), темы, страница фильма, NoCub
 *  Настройки: Lampa → Настройки → LMX Pack
 */
(function () {
    'use strict';

    function getBool(name, def) {
        var v = Lampa.Storage.get(name, def ? 'true' : 'false');
        return v === true || v === 'true';
    }
    function getStr(name, def) {
        var v;
        if (name === 'lmx_theme') {
            var raw = Lampa.Storage.get(name, '');
            v = (raw === '' || raw === null || raw === undefined) ? 'prem' : String(raw);
        } else v = String(Lampa.Storage.get(name, def));
        if (name === 'lmx_theme' && v === 'hbo') { v = 'prem'; try { Lampa.Storage.set('lmx_theme', 'prem'); } catch (e) {} }
        return v;
    }
    function readJson(key) {
        var v = Lampa.Storage.get(key, '[]');
        if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) { v = []; } }
        return Array.isArray(v) ? v : [];
    }
    function safe(fn) {
        try { fn(); } catch (e) { console.error('LMX', e); }
    }

    var RGB = { green: '46,158,91', orange: '224,123,32', blue: '48,112,220', red: '192,57,43', purple: '130,80,200', gray: '110,110,120' };
    var COLORS = {};
    Object.keys(RGB).forEach(function (k) { COLORS[k] = 'rgba(' + RGB[k] + ',.94)'; });
    function rgba(name, a) { return 'rgba(' + (RGB[name] || RGB.orange) + ',' + a + ')'; }
    var COLOR_NAMES = { green: 'Зелёный', orange: 'Оранжевый', blue: 'Синий', red: 'Красный', purple: 'Фиолетовый', gray: 'Серый' };
    var LOGO_SIZES = { '50': '50%', '70': '70%', '85': '85%', '100': '100% (стандарт)', '120': '120%', '140': '140%', '170': '170%', '200': '200%', '250': '250%' };
    var SIZES = { s: 0.8, m: 0.95, l: 1.1, xl: 1.25 };
    var SIZE_NAMES = { s: 'Маленький', m: 'Средний', l: 'Большой', xl: 'Очень большой' };

    function dayStr(offset) {
        var d = new Date(Date.now() + offset * 86400000);
        var m = d.getMonth() + 1, dd = d.getDate();
        return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
    }
    function market() { return getBool('lmx_market', true); }
    var WATCH = 'watch_region=UA&with_watch_monetization_types=flatrate%7Cfree%7Cads%7Crent%7Cbuy';
    function mkt(url, kind) {
        if (!market()) return [url];
        if (kind === 'movie') return [url + (url.indexOf('?') < 0 ? '?' : '&') + 'region=UA'];
        if (kind === 'tv') {
            return ['discover/tv?sort_by=popularity.desc&without_genres=10767%7C10763%7C10766&without_keywords=210024&vote_count.gte=15&' + WATCH + '&air_date.gte=' + dayStr(-60) + '&air_date.lte=' + dayStr(30), url];
        }
        return [url];
    }
    var ROWS = [
        { name: 'LmxPopularMovies', title: 'Популярные фильмы',    urls: function () { return mkt('movie/popular', 'movie'); },     index: 13 },
        { name: 'LmxNowPlaying',    title: 'Сейчас в кинотеатрах', urls: function () { return mkt('movie/now_playing', 'movie'); }, index: 14 },
        { name: 'LmxUpcoming',      title: 'Скоро выйдут',       urls: function () { return mkt('movie/upcoming', 'movie'); },    index: 15 },
        { name: 'LmxTopMovies',     title: 'Самый высокий рейтинг',    urls: function () { return mkt('movie/top_rated', 'movie'); },   index: 16 },
        { name: 'LmxPopularTv',     title: 'Популярные сериалы',   urls: function () { return mkt('tv/popular', 'tv'); },           index: 17 },
        { name: 'LmxHistory',      title: 'История просмотра',   custom: historyCall, index: 20 },
        { name: 'LmxRecs',         title: 'Похоже на то, что вам понравилось', custom: function () { return recsCall(this); }, index: 21 },
        { name: 'LmxRecsBy1',      title: 'Потому что вы лайкнули…', custom: function () { return recsByCall(0); }, index: 22 },
        { name: 'LmxRecsBy2',      title: 'Потому что вы лайкнули… (2)', custom: function () { return recsByCall(1); }, index: 23 },
        { name: 'LmxLater',        title: 'Посмотреть позже', custom: laterCall, index: 19 }
    ];

    var ROW_MAX = 24;
    function heroMax() { return getStr('lmx_theme', 'default') === 'apple' ? 7 : 12; }

    var SERVICES = [
        ['hbo', 'HBO / Max', 1899], ['netflix', 'Netflix', 8], ['apple', 'Apple TV+', 350],
        ['amazon', 'Prime Video', 119], ['disney', 'Disney+', 337], ['paramount', 'Paramount+', 531],
        ['sky', 'SkyShowtime', 1773], ['amc', 'AMC+', 526], ['hulu', 'Hulu', 15], ['ua', 'Украинское', 9003], ['anime', 'Аниме', 9000, 'Популярное в аниме'], ['dorama', 'Дорамы', 9001, 'Популярное в дорамах']
    ];
    var ON_SIAIVO = false;
    try { ON_SIAIVO = /siaivo|lampaua/i.test(String(location.hostname || '')); } catch (e) {}
    if (ON_SIAIVO) SERVICES = SERVICES.filter(function (x) { return x[0] !== 'anime'; });
    var MOODS = [
        ['relax', 'Расслабиться', '35%7C10751'],
        ['think', 'Подумать', '9648%7C878'],
        ['adrenaline', 'Адреналин', '28%7C53'],
        ['romance', 'Романтика', '10749'],
        ['scary', 'Жутковато', '27'],
        ['friends', 'С друзьями', '12%7C35']
    ];
    ROWS.unshift(
        { name: 'LmxHero', title: 'Афиша', index: -2, custom: function () { return heroCall(this); } },
        { name: 'LmxStudios', title: 'Каталоги', index: -1, custom: function () { return studioCall(this); } }
    );
    var n0 = 30;
    SERVICES.forEach(function (x) {
        if (x[0] === 'ua') return;
        ROWS.push({ name: 'LmxSvc_' + x[0], title: x[3] || ('Популярное на ' + x[1]), index: n0++,
            custom: function () { return (SVC[x[0]] && SVC[x[0]].hero ? popularCall : serviceCall)(this, x[0]); } });
    });
    function moodMenu() {
        if (!Lampa.Menu || !Lampa.Menu.addButton || document.querySelector('.menu__item.lmx-moodmenu')) return;
        var ico = '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2.5 4 2.5S16 14 16 14"/><path d="M9 9.5h.01M15 9.5h.01"/></svg>';
        var el = Lampa.Menu.addButton(ico, 'Под настроение', function () {
            registerServicePage();
            Lampa.Activity.push({ url: '', title: 'Под настроение', component: 'lmx_service', service_id: 'mood', page: 1 });
        });
        if (el && el[0]) el[0].classList.add('lmx-moodmenu');
    }

    var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';

    var seen = {};
    var diag = { patched: false, addCount: 0, lastTotal: 0, lastTagged: 0 };

    var stats = {};

    function trackCalls(name, f) {
        var g = function () {
            var args = Array.prototype.slice.call(arguments);
            if (typeof args[0] === 'function') {
                var cb = args[0];
                args[0] = function (data) {
                    try {
                        stats[name] = (data && data.results) ? data.results.length : 0;
                        if (stats[name] > 0) {
                            var lv = readJson('lmx_live');
                            if (lv.indexOf(name) < 0) { lv.push(name); Lampa.Storage.set('lmx_live', lv); }
                        }
                    } catch (e) {}
                    return cb.apply(this, arguments);
                };
            }
            return f.apply(this, args);
        };
        for (var k in f) { try { g[k] = f[k]; } catch (e) {} }
        return g;
    }
    function rowStat(n) {
        if (stats[n] === undefined) return '';
        return stats[n] === 0 ? 'пустой (нет карточек)' : stats[n] + ' карточек';
    }

    var DEFAULT_ORDER = ['LmxHero', 'LmxStudios', 'LmxHistory', 'LmxLater', 'LmxPopularMovies', 'LmxSvc_hbo', 'LmxPopularTv', 'LmxSvc_apple', 'LmxNowPlaying',
        'LmxSvc_netflix', 'LmxSvc_amazon', 'LmxRecs', 'LmxRecsBy1', 'LmxRecsBy2', 'LmxSvc_disney', 'LmxSvc_paramount', 'LmxTopMovies', 'LmxUpcoming',
        'LmxSvc_sky', 'LmxSvc_amc', 'LmxSvc_hulu'];

    function allRows() {
        var map = {}, list = [];
        function put(n, t, src) {
            if (!map[n]) { map[n] = { name: n, title: t, src: src }; list.push(n); }
        }
        ROWS.forEach(function (r) { put(r.name, r.title, 'LMX Pack'); });
        if (!getBool('lmx_only_mine', true)) {
            var live = readJson('lmx_live');
            Object.keys(seen).forEach(function (n) {
                if ((stats[n] || 0) > 0 || live.indexOf(n) >= 0) put(n, seen[n].title || n, 'Другое');
            });
        }
        var rank = function (n) { var i = DEFAULT_ORDER.indexOf(n); return i < 0 ? 999 : i; };
        list = list.map(function (n, i) { return { n: n, i: i }; }).sort(function (x, y) { return rank(x.n) - rank(y.n) || x.i - y.i; }).map(function (x) { return x.n; });
        return { map: map, list: list };
    }
    function getOrder() {
        var a = allRows();
        var saved = readJson('lmx_order').filter(function (n) { return a.map[n]; });
        a.list.forEach(function (n) {
            if (saved.indexOf(n) >= 0) return;
            var di = DEFAULT_ORDER.indexOf(n), pos = -1, k;
            for (k = di - 1; k >= 0; k--) { pos = saved.indexOf(DEFAULT_ORDER[k]); if (pos >= 0) break; }
            if (di > 0 && pos >= 0) saved.splice(pos + 1, 0, n); else saved.push(n);
        });
        return saved;
    }
    var recsBySeeded = false;
    function getHidden() {
        if (!recsBySeeded) {
            recsBySeeded = true;
            try {
                if (!Lampa.Storage.get('lmx_recsby_seed', '')) {
                    var h0 = readJson('lmx_hidden');
                    ['LmxRecsBy1', 'LmxRecsBy2'].forEach(function (n) { if (h0.indexOf(n) < 0) h0.push(n); });
                    Lampa.Storage.set('lmx_hidden', h0);
                    Lampa.Storage.set('lmx_recsby_seed', '1');
                }
            } catch (e) {}
        }
        return readJson('lmx_hidden');
    }
    function isHidden(name) {
        return getHidden().indexOf(name) >= 0;
    }
    function rankOf(name) {
        return getOrder().indexOf(name);
    }
    function emptyRowCall(name) {
        return function () {
            var f = function (cb) { cb({ results: [] }); };
            f.__lmx = name;
            return f;
        };
    }

    var adopted = {};
    function refreshIndexes() {
        var order = getOrder();
        Object.keys(adopted).forEach(function (n) { var r = order.indexOf(n); if (r >= 0) adopted[n].index = r; });
    }
    function adoptRow(row) {
        if (!row || !row.name) return;
        diag.addCount++;
        seen[row.name] = { title: row.title };
        var r = rankOf(row.name);
        if (r >= 0) row.index = r;
        adopted[row.name] = row;
        var orig = row.call;
        if (typeof orig === 'function' && !orig.__lmxWrapped) {
            var wrapped = function () {
                if (isHidden(row.name)) return emptyRowCall(row.name)();
                var f = orig.apply(this, arguments);
                if (typeof f === 'function') f = trackCalls(row.name, f);
                if (f && (typeof f === 'function' || typeof f === 'object')) {
                    try { f.__lmx = row.name; } catch (e) {}
                }
                return f;
            };
            wrapped.__lmxWrapped = true;
            row.call = wrapped;
        }
    }

    function tagOf(item) {
        if (!item) return null;
        if (item.__lmx) return item.__lmx;
        if (item.call && item.call.__lmx) return item.call.__lmx;
        return null;
    }
    function sealCalls(calls) {
        if (calls.__lmxSealed) return;
        var ours = {};
        ROWS.forEach(function (r) { ours[r.name] = 1; });
        var keep = function (c) { return !getBool('lmx_only_mine', true) || typeof c !== 'function' || !!ours[tagOf(c)]; };
        try {
            Object.defineProperty(calls, '__lmxSealed', { value: true });
            ['push', 'unshift'].forEach(function (m) {
                var orig = calls[m];
                Object.defineProperty(calls, m, { value: function () { return orig.apply(this, Array.prototype.slice.call(arguments).filter(keep)); } });
            });
            var os = calls.splice;
            Object.defineProperty(calls, 'splice', { value: function (a, b) {
                var rest = Array.prototype.slice.call(arguments, 2).filter(keep);
                return os.apply(this, [a, b].concat(rest));
            } });
        } catch (e) {}
    }
    function reorderCalls(screen, calls) {
        if (screen !== 'main' || !Array.isArray(calls) || calls.length < 2) return;
        var order = getOrder();
        var tagged = 0;
        var boxed = calls.map(function (c, i) {
            var t = tagOf(c);
            var r = t ? order.indexOf(t) : -1;
            if (t) tagged++;
            return { c: c, i: i, key: r >= 0 ? r : 1000 + i };
        });
        diag.lastTotal = calls.length;
        diag.lastTagged = tagged;
        var onlyMine = false;
        if (getBool('lmx_only_mine', true) && tagged > 0) {
            var ours = {};
            ROWS.forEach(function (r) { ours[r.name] = 1; });
            var mine = boxed.filter(function (b) { return ours[tagOf(b.c)]; });
            if (mine.length) { boxed = mine; tagged = mine.length; onlyMine = true; }
        }
        if (tagged < 2 && boxed.length === calls.length) return;
        boxed.sort(function (a, b) { return a.key - b.key || a.i - b.i; });
        calls.length = 0;
        boxed.forEach(function (b) { calls.push(b.c); });
        if (onlyMine) sealCalls(calls);
    }

    function patchContentRows() {
        var CR = Lampa.ContentRows;
        if (!CR || CR.__lmxPatched) return;
        var origAdd = CR.add, origCall = CR.call;
        if (typeof origAdd !== 'function') return;
        try {
            CR.add = function (row) {
                safe(function () { adoptRow(row); });
                return origAdd.apply(this, arguments);
            };
            if (typeof origCall === 'function') {
                CR.call = function (screen, params, calls) {
                    safe(refreshIndexes);
                    var res = origCall.apply(this, arguments);
                    safe(function () { reorderCalls(screen, calls); });
                    return res;
                };
            }
            CR.__lmxPatched = true;
            diag.patched = true;
        } catch (e) { console.error('LMX patch', e); }
    }

    var lastPicked = null;

    function saveOrder(order) { Lampa.Storage.set('lmx_order', order); }
    function saveHidden(h) { Lampa.Storage.set('lmx_hidden', h); }
    function notifySaved() {
        if (Lampa.Noty) Lampa.Noty.show('Сохранено. Вернитесь на главную (или перезапустите Lampa)');
    }

    function openOrderList() {
        if (!Lampa.Select || !Lampa.Select.show) return;
        var enabled = Lampa.Controller.enabled().name;
        var a = allRows();
        var order = getOrder();
        var hidden = getHidden();
        var items = order.map(function (n, i) {
            var info = a.map[n];
            return {
                title: (i + 1) + '. ' + info.title + (hidden.indexOf(n) >= 0 ? '  (скрыто)' : ''),
                subtitle: info.src,
                name: n,
                selected: n === lastPicked
            };
        });
        items.push({ title: 'Сбросить порядок и показать всё', reset: true });
        Lampa.Select.show({
            title: 'Порядок главной',
            items: items,
            onBack: function () { Lampa.Controller.toggle(enabled); },
            onSelect: function (it) {
                if (it.reset) {
                    saveOrder([]); saveHidden([]); lastPicked = null;
                    notifySaved();
                    setTimeout(openOrderList, 60);
                    return;
                }
                lastPicked = it.name;
                setTimeout(function () { openRowMenu(it.name, enabled); }, 60);
            }
        });
    }

    function openRowMenu(name, enabled) {
        var a = allRows();
        var hidden = isHidden(name);
        Lampa.Select.show({
            title: a.map[name] ? a.map[name].title : name,
            items: [
                { title: 'Вверх', act: 'up' },
                { title: 'Вниз', act: 'down' },
                { title: 'В начало', act: 'top' },
                { title: 'В конец', act: 'bottom' },
                { title: hidden ? 'Показывать' : 'Скрыть', act: 'toggle' }
            ],
            onBack: function () { setTimeout(openOrderList, 60); },
            onSelect: function (it) {
                var order = getOrder();
                var i = order.indexOf(name);
                if (it.act === 'up' && i > 0) { order.splice(i, 1); order.splice(i - 1, 0, name); }
                if (it.act === 'down' && i < order.length - 1) { order.splice(i, 1); order.splice(i + 1, 0, name); }
                if (it.act === 'top') { order.splice(i, 1); order.unshift(name); }
                if (it.act === 'bottom') { order.splice(i, 1); order.push(name); }
                if (it.act === 'toggle') {
                    var h = getHidden();
                    var k = h.indexOf(name);
                    if (k >= 0) h.splice(k, 1); else h.push(name);
                    saveHidden(h);
                }
                saveOrder(order);
                notifySaved();
                setTimeout(openOrderList, 60);
            }
        });
    }

    var SVG_O = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">';
    var CHEV_UP = SVG_O + '<path d="M6 15l6-6 6 6"/></svg>';
    var CHEV_DOWN = SVG_O + '<path d="M6 9l6 6 6-6"/></svg>';
    var BOX_ON = SVG_O + '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 12.5l3 3 5-6"/></svg>';
    var BOX_OFF = SVG_O + '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/></svg>';

    function openOrderModal() {
        if (!(Lampa.Modal && Lampa.Modal.open && window.$)) return openOrderList();
        var enabled = Lampa.Controller.enabled().name;
        var wrap = $('<div class="lmx-ord"></div>');
        var rowEls = {};
        var lastFire = 0;

        function followFocus(el) {
            safe(function () {
                if (window.Navigator && Navigator.focus) Navigator.focus(el);
                else $(el).trigger('hover:focus');
            });
        }

        function bind(btn, name, act) {
            btn.on('hover:enter click', function () {
                var now = Date.now();
                if (now - lastFire < 250) return;
                lastFire = now;
                apply(name, act, this);
            });
        }

        function mkRow(n, a, hidden) {
            var info = a.map[n], off = hidden.indexOf(n) >= 0;
            var st = rowStat(n);
            var row = $('<div class="lmx-ord__row"></div>');
            var nm = $('<div class="lmx-ord__name"></div>');
            nm.append($('<span></span>').text(info.title));
            nm.append($('<span class="lmx-ord__sub"></span>').text(info.src + (st ? ' · ' + st : '')));
            row.append(nm);
            [['up', CHEV_UP], ['down', CHEV_DOWN], ['toggle', off ? BOX_OFF : BOX_ON]].forEach(function (b) {
                var btn = $('<div class="lmx-ord__btn selector"></div>').html(b[1]);
                if (b[0] === 'toggle' && off) btn.addClass('lmx-ord__off');
                bind(btn, n, b[0]);
                row.append(btn);
            });
            rowEls[n] = row;
            return row;
        }

        function buildAll() {
            wrap.empty();
            rowEls = {};
            var a = allRows(), hidden = getHidden();
            getOrder().forEach(function (n) { wrap.append(mkRow(n, a, hidden)); });
            var reset = $('<div class="lmx-ord__reset selector">Сбросить порядок и показать всё</div>');
            bind(reset, null, 'reset');
            wrap.append(reset);
        }

        function apply(name, act, btnEl) {
            var order = getOrder(), i = order.indexOf(name);
            if (act === 'up' && i > 0) {
                order.splice(i, 1); order.splice(i - 1, 0, name); saveOrder(order);
                rowEls[name].insertBefore(rowEls[order[i]]);
                followFocus(btnEl);
            } else if (act === 'down' && i >= 0 && i < order.length - 1) {
                order.splice(i, 1); order.splice(i + 1, 0, name); saveOrder(order);
                rowEls[name].insertAfter(rowEls[order[i]]);
                followFocus(btnEl);
            } else if (act === 'toggle') {
                var h = getHidden(), k = h.indexOf(name);
                if (k >= 0) h.splice(k, 1); else h.push(name);
                saveHidden(h);
                var off = h.indexOf(name) >= 0;
                rowEls[name].find('.lmx-ord__btn').eq(2).html(off ? BOX_OFF : BOX_ON).toggleClass('lmx-ord__off', off);
            } else if (act === 'reset') {
                saveOrder([]); saveHidden([]);
                buildAll();
                var first = wrap.find('.lmx-ord__btn')[0];
                if (first) followFocus(first);
            }
        }

        buildAll();
        Lampa.Modal.open({
            title: 'Порядок главной',
            html: wrap,
            size: 'medium',
            mask: true,
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle(enabled);
                notifySaved();
            }
        });
    }


    function svcOrderIds() {
        var ids = SERVICES.map(function (x) { return x[0]; }), saved = readJson('lmx_svc_order').filter(function (n) { return ids.indexOf(n) >= 0; });
        ids.forEach(function (n, i) {
            if (saved.indexOf(n) >= 0) return;
            var pos = -1, k;
            for (k = i - 1; k >= 0; k--) { pos = saved.indexOf(ids[k]); if (pos >= 0) break; }
            if (i > 0 && pos >= 0) saved.splice(pos + 1, 0, n); else saved.push(n);
        });
        return saved;
    }
    function svcList() {
        var hid = readJson('lmx_svc_hidden');
        return svcOrderIds().filter(function (n) { return hid.indexOf(n) < 0; }).map(function (n) { return SERVICES.filter(function (x) { return x[0] === n; })[0]; }).filter(Boolean);
    }
    function openSvcOrderModal() {
        if (!(Lampa.Modal && Lampa.Modal.open && window.$)) return;
        var enabled = Lampa.Controller.enabled().name, wrap = $('<div class="lmx-ord"></div>'), rowEls = {}, lastFire = 0;
        function nameOf(n) { return (SERVICES.filter(function (x) { return x[0] === n; })[0] || [])[1] || n; }
        function follow(el) { safe(function () { if (window.Navigator && Navigator.focus) Navigator.focus(el); else $(el).trigger('hover:focus'); }); }
        function bind(btn, name, act) {
            btn.on('hover:enter click', function () {
                var now = Date.now(); if (now - lastFire < 250) return; lastFire = now;
                apply(name, act, this);
            });
        }
        function mkRow(n) {
            var off = readJson('lmx_svc_hidden').indexOf(n) >= 0, row = $('<div class="lmx-ord__row"></div>'), nm = $('<div class="lmx-ord__name"></div>');
            nm.append($('<span></span>').text(nameOf(n)));
            row.append(nm);
            [['up', CHEV_UP], ['down', CHEV_DOWN], ['toggle', off ? BOX_OFF : BOX_ON]].forEach(function (b) {
                var btn = $('<div class="lmx-ord__btn selector"></div>').html(b[1]);
                if (b[0] === 'toggle' && off) btn.addClass('lmx-ord__off');
                bind(btn, n, b[0]); row.append(btn);
            });
            rowEls[n] = row; return row;
        }
        function buildAll() {
            wrap.empty(); rowEls = {};
            svcOrderIds().forEach(function (n) { wrap.append(mkRow(n)); });
            var reset = $('<div class="lmx-ord__reset selector">Сбросить порядок и показать всё</div>');
            bind(reset, null, 'reset'); wrap.append(reset);
        }
        function apply(name, act, btnEl) {
            var order = svcOrderIds(), i = order.indexOf(name);
            if (act === 'up' && i > 0) { order.splice(i, 1); order.splice(i - 1, 0, name); Lampa.Storage.set('lmx_svc_order', order); rowEls[name].insertBefore(rowEls[order[i]]); follow(btnEl); }
            else if (act === 'down' && i >= 0 && i < order.length - 1) { order.splice(i, 1); order.splice(i + 1, 0, name); Lampa.Storage.set('lmx_svc_order', order); rowEls[name].insertAfter(rowEls[order[i]]); follow(btnEl); }
            else if (act === 'toggle') {
                var h = readJson('lmx_svc_hidden'), k = h.indexOf(name);
                if (k >= 0) h.splice(k, 1); else h.push(name);
                Lampa.Storage.set('lmx_svc_hidden', h);
                var off = h.indexOf(name) >= 0;
                rowEls[name].find('.lmx-ord__btn').eq(2).html(off ? BOX_OFF : BOX_ON).toggleClass('lmx-ord__off', off);
            } else if (act === 'reset') {
                Lampa.Storage.set('lmx_svc_order', []); Lampa.Storage.set('lmx_svc_hidden', []);
                buildAll(); var first = wrap.find('.lmx-ord__btn')[0]; if (first) follow(first);
            }
        }
        buildAll();
        Lampa.Modal.open({ title: 'Порядок каталогов', html: wrap, size: 'medium', mask: true,
            onBack: function () { Lampa.Modal.close(); Lampa.Controller.toggle(enabled); notifySaved(); } });
    }

    function addSettings() {
        var S = Lampa.SettingsApi;
        if (!S || !S.addComponent) return;

        S.addComponent({ component: 'lmx', name: 'LMX Pack', icon: ICON });

        function mk(comp) {
            return {
                title: function (id, text) {
                    S.addParam({ component: comp, param: { name: id, type: 'title', default: '' }, field: { name: text } });
                },
                button: function (id, name, desc, onChange) {
                    S.addParam({ component: comp, param: { name: id, type: 'button' }, field: { name: name, description: desc }, onChange: onChange });
                },
                trigger: function (id, def, name, desc, onChange) {
                    S.addParam({ component: comp, param: { name: id, type: 'trigger', default: def }, field: { name: name, description: desc }, onChange: onChange });
                },
                select: function (id, values, def, name, desc, onChange) {
                    S.addParam({ component: comp, param: { name: id, type: 'select', values: values, default: def }, field: { name: name, description: desc }, onChange: onChange });
                }
            };
        }
        var restart = function () { if (Lampa.Noty) Lampa.Noty.show('Перезапустите Lampa, чтобы применить'); };
        var restyle = function () { setTimeout(function () { safe(applyStyle); }, 80); };
        var rebuild = function () { setTimeout(function () { safe(applyStyle); safe(resetCards); }, 80); };

        var H = mk('lmx');

        H.title('lmx_t_look', 'Внешний вид');
        H.select('lmx_theme', { prem: 'Кино', apple: 'Стекло', 'default': 'Облегчённая' }, 'prem', 'Тема',
            'Меняет вид карточек, баннера, меню и страницы фильма. Кино — как в стриминговых сервисах: афиша с крупным названием, тёмные плитки каталогов, белая рамка в фокусе; Стекло — полупрозрачные стеклянные панели на тёмном цветном фоне; Облегчённая — самая простая и лёгкая для слабых устройств. После выбора Lampa перезапустится сама', function () { reloadApp(); });
        H.select('lmx_card_size', { m: 'Стандартные', l: 'Чуть крупнее', xl: 'Крупные' }, 'm', 'Размер карточек', 'Ширина постеров в рядах', restyle);

        H.title('lmx_t_home', 'Главная страница');
        H.button('lmx_order_btn', 'Порядок и видимость рядов', 'Переставьте или скройте Афишу, каталоги и любую подборку', openOrderModal);
        H.button('lmx_svc_order_btn', 'Порядок каталогов', 'Переставьте или скройте плитки HBO, Netflix, Apple TV+… в ряду «Каталоги»', openSvcOrderModal);
        H.trigger('lmx_stats_menu', true, 'Пункт «Статистика» в меню', 'Часы просмотра, любимые жанры, языки и годы по вашей истории. Пункт появляется в левом меню после перезапуска', restart);
        H.trigger('lmx_only_mine', true, 'Только наши подборки', 'Скрывает стандартные ряды Lampa и ряды других плагинов. Действует, когда вы возвращаетесь на главную', null);


        H.title('lmx_t_filters', 'Фильтры');
        H.trigger('lmx_market', true, 'Только с русским описанием', 'Скрывает фильмы и сериалы без описания на русском (их обычно ещё не перевели). Действует после перезапуска', restart);

        H.title('lmx_t_marks', 'Метки на карточках');
        H.trigger('lmx_marks', true, 'Показывать метки', '«Новая серия» и «Сегодня» — для сериалов, «Новинка» — для фильмов за последний месяц, «Скоро» — для того, что ещё не вышло', rebuild);
        H.trigger('lmx_uaq', true, 'Метка «UA» (украинская озвучка)', 'Флажок на карточке, если в торрент-индексах (JacRed и ваш парсер) есть раздача с украинской озвучкой. Результат запоминается на 3 дня', rebuild);
        H.trigger('lmx_uaq_q', true, 'Метка качества (4K / 1080p / 720p)', 'Качество лучшей раздачи. Можно оставить только UA, только качество, обе метки или отключить обе', rebuild);
        H.trigger('lmx_timetable', true, 'Стилизация «Расписания»', 'Стандартный экран «Расписание» Lampa (календарь выхода серий): стеклянные ячейки, день с сериями теплее, «сегодня» с пометкой', applyStyle);
        H.trigger('lmx_hide_viewed', true, 'Скрывать просмотренное в каталогах', 'Фильмы и сериалы, отмеченные как «Просмотрено» (в «Закладках»), не показываются в рядах главной и в каталогах (в «Истории» и «Позже» остаются по своим правилам)', null);
        H.select('lmx_c_next', COLOR_NAMES, 'orange', 'Цвет: новая серия и «Сегодня»', 'Только в теме «Облегчённая», в темах «Кино» и «Стекло» цвета встроены', restyle);

        H.title('lmx_t_page', 'Страница фильма');
        H.trigger('lmx_hide_episodes', true, 'Скрыть раздел «Сезоны»', 'Ряд с сезонами и сериями (Сезон 1, Сезон 2…) на странице сериала. Выключить — раздел вернётся', null);
        H.trigger('lmx_uac', true, 'Комментарии', 'Украинские комментарии и рецензии (UaKino, UAFlix, UASerials, KinoBaza через lampaua.mooo.com) рядом под трейлерами. Выключено — комментариев на странице фильма нет вообще (комментарии CUB всегда скрыты). Если установлен отдельный плагин «UA Comments», наш ряд не дублируется', null);
        H.trigger('lmx_coll_chrono', false, 'Коллекция: хронология событий', 'Для франшиз, где порядок событий отличается от порядка выхода (напр. «Звёздные войны») — по эпизодам, а не по году выхода', null);
        H.select('lmx_logo_size', LOGO_SIZES, '100', 'Размер логотипа (ТВ и компьютер)', 'Размер логотипа фильма на странице тайтла на большом экране', restyle);
        H.select('lmx_logo_size_m', LOGO_SIZES, '100', 'Размер логотипа (телефон)', 'Размер логотипа фильма на странице тайтла в мобильной версии', restyle);
        H.trigger('lmx_logo', true, 'Логотип вместо названия', 'Официальный логотип из TMDB; год и страна переходят в строку перед длительностью. Если логотипа нет — обычное название', restyle);
        H.button('lmx_btns_btn', 'Кнопки на странице фильма', 'Порядок, цвет, иконки, названия и папки. Также кнопка «Кнопки» (✎) в конце ряда на странице фильма', openButtonsEditor);

        H.title('lmx_t_ver', 'LMX Pack · версия ' + VERSION);
    }

    var rowsStarted = false;

    function fileViews() {
        try { if (Lampa.Storage && Lampa.Storage.cache) { var fv = Lampa.Storage.cache('file_view', 10000, {}); if (fv && typeof fv === 'object') return fv; } } catch (e) {}
        return null;
    }
    function pctOf(v) {
        if (!v) return 0;
        var p = Number(v.percent);
        if (!(p >= 0)) p = v.duration ? (Number(v.time) / Number(v.duration)) * 100 : 0;
        return Math.max(0, Math.min(100, Math.round(p || 0)));
    }
    function leftOf(v) {
        if (!v) return 0;
        var d = Number(v.duration), t = Number(v.time);
        return d > 0 && t >= 0 && d > t ? Math.round((d - t) / 60) : 0;
    }
    function watchProgress(c) {
        try {
            if (!c || !Lampa.Utils || !Lampa.Utils.hash) return null;
            var name = c.original_title || c.original_name || c.title || c.name || '';
            if (!name) return null;
            var fv = fileViews();
            var get = function (h) {
                if (fv) return fv[h];
                return Lampa.Timeline && Lampa.Timeline.view ? Lampa.Timeline.view(h) : null;
            };
            if (typeOf(c) !== 'tv') {
                var vm = get(Lampa.Utils.hash(name)), pm = pctOf(vm);
                return pm > 0 ? { pct: pm, left: pm < 98 ? leftOf(vm) : 0 } : null;
            }
            var known = Number(c.number_of_seasons) || (c.seasons && c.seasons.length) || 0;
            var seasons = Math.min(20, known ? known + 3 : 12), best = null;
            var epc = {};
            (c.seasons || []).forEach(function (s) { if (s && s.season_number > 0 && s.episode_count > 0) epc[s.season_number] = s.episode_count; });
            for (var sn = 1; sn <= seasons; sn++) {
                var maxEp = epc[sn] ? Math.min(60, epc[sn] + 3) : 40;
                for (var ep = 1; ep <= maxEp; ep++) {
                    var ve = get(Lampa.Utils.hash([sn, sn > 10 ? ':' : '', ep, name].join(''))), pe = pctOf(ve);
                    if (pe > 0) best = { pct: pe, s: sn, e: ep, left: pe < 98 ? leftOf(ve) : 0 };
                }
            }
            return best;
        } catch (e) { return null; }
    }

    function histItem(m, prog, list) {
        list = list || 'history';
        var it = {};
        for (var k in m) it[k] = m[k];
        it.params = {
            createInstance: makeInstance,
            emit: {
                onCreate: function () {
                    var self = this, ex = arguments[0];
                    safe(function () {
                        var h = htmlOf(self, ex);
                        if (!h) return;
                        h.addClass('card--lmxhist');
                        var view = h.find('.card__view');
                        var pic = m.backdrop_path || m.poster_path;
                        if (pic) view.css('background-image', 'url(' + imgUrl(pic, 'w500') + ')');
                        view.find('img').css('opacity', 0);
                        h.find('.card__title,.card__age,.card__vote').remove();
                        var v = Number(m.vote_average) || 0;
                        var year = String(m.release_date || m.first_air_date || '').slice(0, 4);
                        view.append('<div class="lmx-hist__shade"></div><div class="lmx-hist__text"><div class="lmx-hist__t">' + (list === 'history' ? '&#9654;&#xFE0E;&nbsp; ' : '') + esc(m.title || m.name) +
                            '</div><div class="lmx-hist__m">' + (prog && prog.s ? '<span>С' + prog.s + ' Е' + prog.e + '</span>' : '') +
                            (v ? '<span style="color:' + ratingColor(v) + '">&#9734; ' + v.toFixed(1) + '</span>' : '') +
                            (year ? '<span>' + year + '</span>' : '') +
                            (prog && prog.left > 0 ? '<span class="lmx-hist__left">' + (prog.left <= 10 ? 'просмотрено' : 'осталось ' + fmtDur(prog.left)) + '</span>' : '') + '</div></div>' +
                            (prog && prog.pct > 0 ? '<div class="lmx-hist__bar"><i style="width:' + prog.pct + '%"></i></div>' : ''));
                        safe(function () { if (m && m.id) uaqWant(view[0], m, (m.first_air_date || m.number_of_seasons || m.original_name || (m.name && !m.title) || m.media_type === 'tv' || m.type === 'tv') ? 'tv' : 'movie'); });
                        safe(function () {
                            var el = h[0];
                            if (m.first_air_date || m.number_of_seasons || m.original_name || (m.name && !m.title) || m.media_type === 'tv' || m.type === 'tv') {
                                el.__lmx = { el: el, id: m.id, noBox: list === 'history' };
                                if (io) io.observe(el); else { queue.push(el.__lmx); pumpSoon(); }
                            } else addMark(view[0], movieMark(m));
                        });
                        h.on('hover:long', function (ev) {
                            ev.stopImmediatePropagation();
                            safe(function () {
                                var nb = h.next('.card')[0] || h.prev('.card')[0];
                                Lampa.Favorite.remove(list, m);
                                if (Lampa.Noty) Lampa.Noty.show((list === 'history' ? 'Убрано из истории: ' : 'Убрано из списка «Позже»: ') + (m.title || m.name || ''));
                                var sc = h.closest('.scroll')[0];
                                h.remove();
                                try { Lampa.Controller.toggle(Lampa.Controller.enabled().name); } catch (e) {}
                                if (nb) { try { Lampa.Controller.collectionFocus(nb, sc || nb.parentNode); } catch (e) {} }
                            });
                        });
                        try {
                            var evs = window.$._data(h[0], 'events'), arr = evs && evs['hover:long'];
                            if (arr && arr.length > 1) { var mine = arr.pop(); arr.unshift(mine); }
                        } catch (e) {}
                    });
                },
                onlyEnter: function () { if (prog && prog.pct > 0 && prog.pct < 95 && !(prog.left > 0 && prog.left <= 10)) resumeFlag = { id: m.id, t: Date.now() }; openFull(m); }
            }
        };
        return it;
    }
    var resumeFlag = null;
    function historyCall() {
        return function (call) {
            var list = [];
            try { list = Lampa.Favorite.get({ type: 'history' }) || []; } catch (e) {}
            list = list.filter(function (c) { return c && c.id; });
            var moreH = list.length > ROW_MAX, totH = list.length;
            list = list.slice(0, ROW_MAX);
            if (!list.length) return call();
            recsListHook();
            list = list.map(function (c) { return histItem(c, watchProgress(c)); });
            call({ title: 'История просмотра', results: list, source: 'tmdb', url: 'lmx://fav/history', page: 1, more: moreH, total_pages: moreH ? Math.ceil(totH / 20) : 1 });
        };
    }

    function laterCall() {
        return function (call) {
            var list = [], seen = {};
            try { seen = favIds('viewed'); list = Lampa.Favorite.get({ type: 'wath' }) || []; } catch (e) {}
            list = list.filter(function (c) { return c && c.id && !seen[c.id]; });
            var moreW = list.length > ROW_MAX, totW = list.length;
            list = list.slice(0, ROW_MAX);
            if (!list.length) return call();
            recsListHook();
            call({ title: 'Посмотреть позже', results: list.map(function (c) { return histItem(c, null, 'wath'); }), source: 'tmdb', url: 'lmx://fav/wath', page: 1, more: moreW, total_pages: moreW ? Math.ceil(totW / 20) : 1 });
        };
    }

    function cleanResults(list, skipText) {
        var min = parseInt(getStr('lmx_min_rating', '3'), 10) || 0;
        var strict = market(), hv = getBool('lmx_hide_viewed', true) ? favIds('viewed') : null;
        return (list || []).filter(function (c) {
            if (!c) return false;
            if (hv && c.id && hv[c.id]) return false;
            if (min && c.vote_count > 2 && c.vote_average > 0 && c.vote_average < min) return false;
            if (strict && !skipText && !(c.overview && String(c.overview).trim())) return false;
            return true;
        });
    }

    function prov(id) {
        var region = id === 1773 ? 'PL' : (id === 531 || id === 526 || id === 15) ? 'US' : 'UA';
        return 'with_watch_providers=' + (id === 119 ? '9' + PIPE + '119' : id) + '&watch_region=' + region + '&with_watch_monetization_types=flatrate';
    }
    var PIPE = '%7C';
    var DR_X = 'with_original_language=LANG&without_genres=16%7C10764%7C10767%7C10763';
    var DR_KO = DR_X.replace('LANG', 'ko');
    function provSvc(id, own, compact) {
        var P = prov(id), V = '&sort_by=popularity.desc&vote_count.gte=';
        function tv(t, q, vc) { return { t: t, k: 'tv', q: P + q + V + (vc || 100) }; }
        function mv(t, q, vc) { return { t: t, k: 'movie', q: P + q + V + (vc || 100) }; }
        var rows = own.slice();
        if (compact) {
            rows.push(tv('Драмы', '&with_genres=18', 50), tv('Криминал и триллеры', '&with_genres=80' + PIPE + '9648', 50), tv('Фантастика и фэнтези', '&with_genres=10765', 50),
                mv('Ужасы', '&with_genres=27', 30), mv('Триллеры', '&with_genres=53', 30), mv('Драмы (фильмы)', '&with_genres=18', 30));
            return { mf: P, tf: P, extra: rows };
        }
        rows.push(
            tv('Фантастика и фэнтези', '&with_genres=10765'), tv('Криминал и триллеры', '&with_genres=80' + PIPE + '9648'),
            tv('Драмы', '&with_genres=18'), tv('Боевик и приключения', '&with_genres=10759'), tv('Комедии', '&with_genres=35'),
            tv('Реалити', '&with_genres=10764', 20), tv('Аниме и анимация', '&with_genres=16', 30), tv('Документальные сериалы', '&with_genres=99', 20),
            tv('Корейские сериалы', '&with_origin_country=KR', 20), tv('Британские сериалы', '&with_origin_country=GB', 30),
            tv('Испанские сериалы', '&with_origin_country=ES', 20), tv('Скандинавские сериалы', '&with_origin_country=SE' + PIPE + 'NO' + PIPE + 'DK' + PIPE + 'FI', 20),
            { t: 'Лучшие фильмы', k: 'movie', q: P + '&vote_average.gte=7.3&vote_count.gte=800&sort_by=vote_average.desc' },
            mv('Боевики', '&with_genres=28'), mv('Комедии (фильмы)', '&with_genres=35'), mv('Фантастика', '&with_genres=878'),
            mv('Ужасы', '&with_genres=27'), mv('Драмы (фильмы)', '&with_genres=18'), mv('Триллеры', '&with_genres=53'),
            mv('Криминал', '&with_genres=80'), mv('Детективы', '&with_genres=9648'), mv('Романтика', '&with_genres=10749'),
            mv('Приключения', '&with_genres=12'), mv('Фэнтези', '&with_genres=14'), mv('Для всей семьи', '&with_genres=10751'),
            mv('Анимация', '&with_genres=16'), mv('Документальные фильмы', '&with_genres=99', 20),
            { t: 'Классика (до 2000 года)', k: 'movie', q: P + '&primary_release_date.lte=1999-12-31&vote_count.gte=500&sort_by=vote_average.desc' }
        );
        return { mf: P, tf: P, extra: rows };
    }
    var SVC = {
        ua: { mf: 'with_origin_country=UA', tf: 'with_origin_country=UA', extra: [
            { t: 'Комедии', k: 'movie', q: 'with_origin_country=UA&with_genres=35&sort_by=popularity.desc&vote_count.gte=3', min: 5 },
            { t: 'Драмы (фильмы)', k: 'movie', q: 'with_origin_country=UA&with_genres=18&sort_by=popularity.desc&vote_count.gte=3', min: 5 },
            { t: 'Боевики', k: 'movie', q: 'with_origin_country=UA&with_genres=28&sort_by=popularity.desc&vote_count.gte=3', min: 5 },
            { t: 'Военные', k: 'movie', q: 'with_origin_country=UA&with_genres=10752&sort_by=popularity.desc&vote_count.gte=3', min: 5 },
            { t: 'Исторические фильмы', k: 'movie', q: 'with_origin_country=UA&with_genres=36&sort_by=popularity.desc&vote_count.gte=3', min: 5 },
            { t: 'Мультфильмы', k: 'movie', q: 'with_origin_country=UA&with_genres=16&sort_by=popularity.desc&vote_count.gte=3', min: 5 },
            { t: 'Документальные фильмы', k: 'movie', q: 'with_origin_country=UA&with_genres=99&sort_by=popularity.desc&vote_count.gte=3', min: 5 },
            { t: 'Сериалы: драмы', k: 'tv', q: 'with_origin_country=UA&with_genres=18&sort_by=popularity.desc&vote_count.gte=2', min: 5 },
            { t: 'Сериалы: комедии', k: 'tv', q: 'with_origin_country=UA&with_genres=35&sort_by=popularity.desc&vote_count.gte=2', min: 5 },
            { t: 'Сериалы: криминал', k: 'tv', q: 'with_origin_country=UA&with_genres=80&sort_by=popularity.desc&vote_count.gte=2', min: 5 },
            { t: 'На украинском языке (фильмы)', k: 'movie', q: 'with_original_language=uk&sort_by=popularity.desc&vote_count.gte=3', min: 5 },
            { t: 'На украинском языке (сериалы)', k: 'tv', q: 'with_original_language=uk&sort_by=popularity.desc', min: 5 },
            { t: 'Классика (до 2000 года)', k: 'movie', q: 'with_origin_country=UA&primary_release_date.lte=1999-12-31&sort_by=vote_average.desc&vote_count.gte=20', min: 5 }
        ] },
        hbo: provSvc(1899, [
            { t: 'Max Originals', k: 'tv', q: prov(1899) + '&with_networks=49' + PIPE + '3186&sort_by=popularity.desc' },
            { t: 'Блокбастеры Warner Bros.', k: 'movie', q: prov(1899) + '&with_companies=174&sort_by=revenue.desc&vote_count.gte=1000' },
            { t: 'Вселенная DC', k: 'movie', q: prov(1899) + '&with_companies=174&with_keywords=9715&sort_by=release_date.desc&release_date.lte={today}' },
            { t: 'Премиальные драмы HBO', k: 'tv', q: prov(1899) + '&with_networks=49&with_genres=18&without_genres=10765&sort_by=popularity.desc' }
        ]),
        hulu: provSvc(15, [
            { t: 'Hulu Originals', k: 'tv', q: prov(15) + '&with_networks=453&sort_by=popularity.desc' },
            { t: 'Блокбастеры 20th Century', k: 'movie', q: prov(15) + '&with_companies=25' + PIPE + '127928&sort_by=revenue.desc&vote_count.gte=1000' },
            { t: 'Сериалы FX', k: 'tv', q: prov(15) + '&with_networks=88&sort_by=popularity.desc' },
            { t: 'Премиальные драмы Hulu', k: 'tv', q: prov(15) + '&with_networks=453' + PIPE + '88&with_genres=18&without_genres=10765&sort_by=popularity.desc' }
        ]),
        netflix: provSvc(8, [
            { t: 'Оригиналы Netflix', k: 'tv', q: 'with_networks=213&sort_by=popularity.desc&vote_count.gte=300' }
        ]),
        apple: provSvc(350, [
            { t: 'Оригиналы Apple TV+', k: 'tv', q: 'with_networks=2552&sort_by=popularity.desc' }
        ]),
        amazon: provSvc(119, [
            { t: 'Оригиналы Prime Video', k: 'tv', q: 'with_networks=1024&sort_by=popularity.desc' }
        ]),
        disney: provSvc(337, [
            { t: 'Marvel', k: 'movie', q: 'with_companies=420&sort_by=popularity.desc' },
            { t: 'Звёздные войны', k: 'movie', q: 'with_companies=1&sort_by=popularity.desc' },
            { t: 'Pixar', k: 'movie', q: 'with_companies=3&sort_by=popularity.desc' },
            { t: 'Walt Disney Animation', k: 'movie', q: 'with_companies=2&sort_by=popularity.desc' },
            { t: 'Сериалы Marvel и «Звёздных войн»', k: 'tv', q: 'with_networks=2739&with_genres=10765&sort_by=popularity.desc' }
        ]),
        paramount: provSvc(531, [
            { t: 'Paramount Pictures', k: 'movie', q: 'with_companies=4&sort_by=popularity.desc' },
            { t: 'Оригиналы Paramount+', k: 'tv', q: 'with_networks=4330&sort_by=popularity.desc' }
        ]),
        sky: provSvc(1773, []),
        amc: provSvc(526, [
            { t: 'Ходячие мертвецы: вся франшиза', k: 'tv', q: 'query=The%20Walking%20Dead', search: true, min: 3,
              f: function (x) { return /walking dead/i.test((x.original_name || '') + ' ' + (x.name || '')) || /ходяч/i.test(x.name || ''); } },
            { t: 'Оригиналы AMC', k: 'tv', q: 'with_networks=174&sort_by=popularity.desc&vote_count.gte=100' }
        ], true),
        anime: { mf: 'with_original_language=ja&with_genres=16', tf: 'with_original_language=ja&with_genres=16', hero: 'with_original_language=ja&with_genres=16',
          lead: function () {
            var JA = 'with_original_language=ja&with_genres=16', Y = new Date().getFullYear(), t0 = dayStr(0);
            return [
                { t: 'Сейчас смотрят', k: 'tv', q: JA + '&air_date.gte=' + dayStr(-10) + '&air_date.lte=' + t0 + '&sort_by=popularity.desc&vote_count.gte=3' },
                { t: 'В топе', k: 'tv', q: JA + '&sort_by=popularity.desc&vote_count.gte=400' },
                { t: 'Новинки этого года', k: 'tv', q: JA + '&first_air_date.gte=' + Y + '-01-01&first_air_date.lte=' + t0 + '&sort_by=popularity.desc' },
                { t: 'Прошлый год', k: 'tv', q: JA + '&first_air_date.gte=' + (Y - 1) + '-01-01&first_air_date.lte=' + (Y - 1) + '-12-31&sort_by=popularity.desc' }
            ];
          },
          extra: function () {
            var JA = 'with_original_language=ja&with_genres=16', out = [
                { t: 'С высоким рейтингом', k: 'tv', q: JA + '&vote_average.gte=8.2&vote_count.gte=300&sort_by=vote_average.desc' },
                { t: 'Аниме-фильмы', k: 'movie', q: JA + '&sort_by=popularity.desc&vote_count.gte=100' },
                { t: 'Боевик и приключения', k: 'tv', q: 'with_original_language=ja&with_genres=16,10759&sort_by=popularity.desc' },
                { t: 'Фантастика и фэнтези', k: 'tv', q: 'with_original_language=ja&with_genres=16,10765&sort_by=popularity.desc' },
                { t: 'Комедии', k: 'tv', q: 'with_original_language=ja&with_genres=16,35&sort_by=popularity.desc' },
                { t: 'Драмы', k: 'tv', q: 'with_original_language=ja&with_genres=16,18&sort_by=popularity.desc' },
                { t: 'Детективы и психология', k: 'tv', q: 'with_original_language=ja&with_genres=16,9648&sort_by=popularity.desc' }
            ], kw = animeCos('lmx_anime_kw');
            ANIME_TAGS.forEach(function (tg) {
                var id = kw[tg[0]];
                if (id) out.push({ t: tg[1], k: 'tv', q: JA + '&with_keywords=' + id + '&sort_by=popularity.desc&vote_count.gte=20' });
            });
            return out;
          } },
        dorama: { mf: DR_KO, tf: DR_KO, hero: DR_KO,
          lead: function () {
            var Y = new Date().getFullYear(), t0 = dayStr(0);
            return [
                { t: 'Сейчас выходят', k: 'tv', q: DR_KO + '&air_date.gte=' + dayStr(-10) + '&air_date.lte=' + t0 + '&sort_by=popularity.desc&vote_count.gte=1' },
                { t: 'В топе', k: 'tv', q: DR_KO + '&sort_by=popularity.desc&vote_count.gte=40' },
                { t: 'Новинки этого года', k: 'tv', q: DR_KO + '&first_air_date.gte=' + Y + '-01-01&first_air_date.lte=' + t0 + '&sort_by=popularity.desc' },
                { t: 'Прошлый год', k: 'tv', q: DR_KO + '&first_air_date.gte=' + (Y - 1) + '-01-01&first_air_date.lte=' + (Y - 1) + '-12-31&sort_by=popularity.desc' }
            ];
          },
          extra: function () {
            var out = [
                { t: 'Стоит посмотреть', k: 'tv', q: DR_KO + '&vote_average.gte=7.3&vote_count.gte=60&sort_by=vote_count.desc' },
                { t: 'С высоким рейтингом', k: 'tv', q: DR_KO + '&vote_average.gte=7.9&vote_count.gte=50&sort_by=vote_average.desc' },
                { t: 'Корейские фильмы', k: 'movie', q: 'with_original_language=ko&sort_by=popularity.desc&vote_count.gte=30' },
                { t: 'Драмы', k: 'tv', q: DR_KO + '&with_genres=18&sort_by=popularity.desc' },
                { t: 'Комедии', k: 'tv', q: DR_KO + '&with_genres=35&sort_by=popularity.desc' },
                { t: 'Криминал и триллеры', k: 'tv', q: DR_KO + '&with_genres=80' + PIPE + '9648&sort_by=popularity.desc' },
                { t: 'Фантастика и фэнтези', k: 'tv', q: DR_KO + '&with_genres=10765&sort_by=popularity.desc' },
                { t: 'Боевик и приключения', k: 'tv', q: DR_KO + '&with_genres=10759&sort_by=popularity.desc' },
                { t: 'Японские дорамы', k: 'tv', q: DR_X.replace('LANG', 'ja') + '&sort_by=popularity.desc&vote_count.gte=3' },
                { t: 'Китайские дорамы', k: 'tv', q: DR_X.replace('LANG', 'zh') + '&sort_by=popularity.desc&vote_count.gte=3' },
                { t: 'Тайские дорамы', k: 'tv', q: DR_X.replace('LANG', 'th') + '&sort_by=popularity.desc&vote_count.gte=3' }
            ], kw = animeCos('lmx_dorama_kw');
            DORAMA_TAGS.forEach(function (tg) {
                var id = kw[tg[0]];
                if (id) out.push({ t: tg[1], k: 'tv', q: DR_KO + '&with_keywords=' + id + '&sort_by=popularity.desc&vote_count.gte=3' });
            });
            return out;
          } }
    };
    SVC.hbo.soon = { tf: 'with_networks=49' + PIPE + '3186', mf: 'with_companies=174' };
    SVC.netflix.soon = { tf: 'with_networks=213' };
    SVC.hulu.soon = { tf: 'with_networks=453' + PIPE + '88', mf: 'with_companies=25' + PIPE + '127928' };
    SVC.apple.soon = { tf: 'with_networks=2552' };
    SVC.amazon.soon = { tf: 'with_networks=1024', mf: 'with_companies=20580' };
    SVC.disney.soon = { tf: 'with_networks=2739', mf: 'with_companies=2' + PIPE + '3' + PIPE + '420' + PIPE + '1' + PIPE + '6125' };
    SVC.paramount.soon = { tf: 'with_networks=4330', mf: 'with_companies=4' };
    SVC.amc.soon = { tf: 'with_networks=174' };
    SVC.sky.soon = {};
    var ANIME_TAGS = [
        ['isekai', 'Исекай'], ['reincarnation', 'Перерождение'], ['vampire', 'Вампиры'],
        ['mecha', 'Меха'], ['sports', 'Спорт'], ['slice of life', 'Повседневность']
    ];
    var DORAMA_TAGS = [
        ['romance', 'Романтика'], ['school', 'Школа'], ['medical', 'Врачи'], ['revenge', 'Месть'], ['time travel', 'Путешествия во времени'],
        ['historical', 'Исторические'], ['office', 'Офис'], ['melodrama', 'Мелодрама'], ['love triangle', 'Любовный треугольник']
    ];
    function animeCos(k) { var c = Lampa.Storage.get(k || 'lmx_anime_cos', {}); return c && typeof c === 'object' ? c : {}; }
    function animeResolve(list, store, endpoint) {
        var have = animeCos(store), todo = list.filter(function (it) { return !have[it[0]]; });
        todo.forEach(function (it) {
            tget(endpoint, { query: it[0] }, function (j) {
                var res = (j && j.results) || [], pick = null;
                res.forEach(function (r) { if (!pick && String(r.name).toLowerCase() === it[0].toLowerCase()) pick = r; });
                if (pick) { var c2 = animeCos(store); c2[it[0]] = pick.id; Lampa.Storage.set(store, c2); }
            }, function () {});
        });
    }
    function resolveCatalogRefs() {
        animeResolve(ANIME_TAGS, 'lmx_anime_kw', 'search/keyword');
        animeResolve(DORAMA_TAGS, 'lmx_dorama_kw', 'search/keyword');
    }

    var TV_MOODS = { relax: '35', think: '9648%7C10765', adrenaline: '10759%7C80', friends: '10759%7C35' };
    function moodCats() {
        var out = [], reg = market() ? '&region=UA' : '';
        MOODS.forEach(function (x) {
            out.push({ title: x[1] + ': фильмы', kind: 'movie', min: 10, url: 'discover/movie?with_genres=' + x[2] + '&vote_count.gte=300&sort_by=popularity.desc' + reg });
            if (TV_MOODS[x[0]]) out.push({ title: x[1] + ': сериалы', kind: 'tv', min: 10, url: 'discover/tv?with_genres=' + TV_MOODS[x[0]] + '&vote_count.gte=150&sort_by=popularity.desc' });
        });
        return out;
    }
    function svcCats(key, forHome) {
        var c = SVC[key], today = dayStr(0), out = [];
        if (!c) return out;
        if (c.lead && !forHome) c.lead().forEach(function (e) { out.push(e); });
        out.push({ t: 'Новые фильмы', k: 'movie', q: c.mf + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + today + '&vote_count.gte=10' });
        out.push({ t: 'Новые сериалы', k: 'tv', q: c.tf + '&sort_by=first_air_date.desc&first_air_date.lte=' + today + '&vote_count.gte=' + (key === 'ua' ? 0 : 5) });
        if (!forHome) {
            var sn = c.soon || { mf: c.mf, tf: c.tf }, sd1 = dayStr(1), sd2 = dayStr(330), anySoon = function () { return true; };
            var sTv = sn.tf ? sn.tf + '&first_air_date.gte=' + sd1 + '&first_air_date.lte=' + sd2 + '&sort_by=popularity.desc' : '',
                sMv = sn.mf ? sn.mf + '&primary_release_date.gte=' + sd1 + '&primary_release_date.lte=' + sd2 + '&sort_by=popularity.desc' : '';
            if (sTv || sMv) out.push({ t: 'Скоро выйдет', k: sTv ? 'tv' : 'movie', q: sTv || sMv, alt2: (sTv && sMv) ? 'discover/movie?' + sMv : '', mix: !!(sTv && sMv), min: 3, f: anySoon });
        }
        out.push({ t: 'Популярные фильмы', k: 'movie', q: c.mf + '&sort_by=popularity.desc&vote_count.gte=50' });
        out.push({ t: key === 'anime' ? 'Главные хиты' : 'Популярные сериалы', k: 'tv', q: c.tf + '&sort_by=popularity.desc' });
        (typeof c.extra === 'function' ? c.extra() : c.extra).forEach(function (e) { out.push(e); });
        out.push({ t: 'Золотая коллекция (самый высокий рейтинг)', k: 'tv', q: c.tf + '&sort_by=vote_average.desc&vote_average.gte=7.8&vote_count.gte=300' });
        if (key === 'anime' && !forHome) {
            var drop = ['Новые сериалы', 'Популярные фильмы', 'Главные хиты', 'Золотая коллекция (самый высокий рейтинг)'];
            out = out.filter(function (e) { return drop.indexOf(e.t) < 0; });
        }
        if (key === 'ua') {
            var UA0 = 'with_origin_country=UA';
            var UA_NET = [1254, 7496, 3510, 1166, 9338, 1206, 1326, 5947, 8582];
            out.forEach(function (e) {
                if (!e.q || e.q.indexOf(UA0) !== 0) return;
                var rest = e.q.slice(UA0.length);
                e.alts = (e.k === 'tv' ? ['with_original_language=uk', 'with_networks=' + UA_NET.join(PIPE), 'with_companies=22436'] : ['with_original_language=uk', 'with_companies=22436']).map(function (a) { return a + rest; });
            });
        }
        var mapped = out.map(function (e) {
            return { alts: (e.alts || []).map(function (a) { return (e.search ? 'search/' : 'discover/') + e.k + '?' + a.replace('{today}', today); }).concat(e.alt2 ? [e.alt2.replace('{today}', today)] : []), title: e.t, url: (e.search ? 'search/' : 'discover/') + e.k + '?' + e.q.replace('{today}', today), kind: e.k, f: e.f, min: e.min, mix: e.mix };
        });
        if (!forHome && (key === 'anime' || key === 'dorama')) mapped.splice(1, 0, { title: 'Похоже на то, что вам понравилось', url: 'lmx://recs/' + key, kind: 'tv', recs: key, min: 6 });
        if (!forHome && key === 'anime') mapped.unshift({ title: 'Новые серии', url: 'lmx://newep/anime', kind: 'tv', newep: true, min: 1 });
        return mapped;
    }

    function svcHeroList(key, done) {
        var c = SVC[key], left = 6, recMv = [], recTv = [], topMv = [], topTv = [], t0 = dayStr(0);
        function uaOk(m) {
            var ov = String(m.overview || '');
            return m && m.backdrop_path && m.poster_path && ov.length >= 30 && /[а-яёА-ЯЁ]/.test(ov);
        }
        function fin() {
            if (--left > 0) return;
            var seen = {}, out = [];
            function take(list, kind, max) {
                var n = 0;
                list.filter(uaOk).sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); }).forEach(function (m) {
                    if (n >= max || out.length >= heroMax() || seen[kind + m.id]) return;
                    seen[kind + m.id] = 1; m.media_type = kind; m.__trend = 1; out.push(m); n++;
                });
            }
            take(recMv, 'movie', 4); take(recTv, 'tv', 4);
            take(topTv, 'tv', 4); take(topMv, 'movie', 4);
            take(topTv, 'tv', 12); take(topMv, 'movie', 12);
            var mv = out.filter(function (m) { return m.media_type === 'movie'; }), tv = out.filter(function (m) { return m.media_type === 'tv'; }), mix = [];
            while (mv.length || tv.length) { if (tv.length) mix.push(tv.shift()); if (mv.length) mix.push(mv.shift()); }
            done(mix.length >= 4 ? mix : []);
        }
        function get(url, into, pg) {
            tgetFb(url, { page: pg || 1 }, function (j) { (j && j.results || []).forEach(function (m) { into.push(m); }); fin(); }, function () { fin(); });
        }
        var rm = 'discover/movie?' + c.mf + '&primary_release_date.gte=' + dayStr(-150) + '&primary_release_date.lte=' + t0 + '&sort_by=popularity.desc&vote_count.gte=20';
        var rt = 'discover/tv?' + c.tf + '&air_date.gte=' + dayStr(-60) + '&air_date.lte=' + t0 + '&sort_by=popularity.desc&vote_count.gte=20';
        var tm = 'discover/movie?' + c.mf + '&sort_by=popularity.desc&vote_count.gte=200';
        var tt = 'discover/tv?' + c.tf + '&sort_by=popularity.desc&vote_count.gte=100';
        get(rm, recMv, 1); get(rt, recTv, 1); get(tm, topMv, 1); get(tm, topMv, 2); get(tt, topTv, 1); get(tt, topTv, 2);
    }

    function animeHeroList(JA, done) {
        var t0 = dayStr(0), left = 7, recent = [], top = [], soonTv = [], soonMv = [];
        function uaOk(m) {
            var ov = String(m.overview || ''), nm = String(m.title || m.name || '');
            return m && m.backdrop_path && m.poster_path && ov.length >= 30 && /[а-яёА-ЯЁ]/.test(ov) && !/[\u3040-\u30ff\u3400-\u9fff]/.test(nm);
        }
        function fin() {
            if (--left > 0) return;
            var seen = {}, out = [];
            var soon = soonTv.concat(soonMv).filter(uaOk)
                .sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); }).slice(0, 4);
            soon.forEach(function (m) { seen[m.id] = 1; });
            var room = heroMax() - soon.length;
            recent.filter(function (m) { return uaOk(m) && !seen[m.id]; }).forEach(function (m) {
                if (out.length >= room) return;
                seen[m.id] = 1; m.media_type = 'tv'; m.__trend = 1; m.__air = 1; out.push(m);
            });
            top.filter(function (m) { return uaOk(m) && !seen[m.id]; }).forEach(function (m) {
                if (out.length >= room) return;
                seen[m.id] = 1; m.media_type = 'tv'; m.__trend = 1; out.push(m);
            });
            soon.forEach(function (m) { m.__tag = 'soon'; out.push(m); });
            done(out);
        }
        function get(url, kind, into, pg) {
            tget(url, { page: pg || 1 }, function (j) {
                (j && j.results || []).forEach(function (m) { m.media_type = kind; into.push(m); });
                fin();
            }, function () { fin(); });
        }
        var recentUrl = 'discover/tv?' + JA + '&air_date.gte=' + dayStr(-30) + '&air_date.lte=' + t0 + '&sort_by=popularity.desc&vote_count.gte=1';
        var topUrl = 'discover/tv?' + JA + '&sort_by=popularity.desc&vote_count.gte=100';
        get(recentUrl, 'tv', recent, 1);
        get(recentUrl, 'tv', recent, 2);
        get(topUrl, 'tv', top, 1);
        get(topUrl, 'tv', top, 2);
        get(topUrl, 'tv', top, 3);
        get('discover/tv?' + JA + '&first_air_date.gte=' + dayStr(1) + '&first_air_date.lte=' + dayStr(75) + '&sort_by=popularity.desc', 'tv', soonTv, 1);
        get('discover/movie?' + JA + '&primary_release_date.gte=' + dayStr(1) + '&primary_release_date.lte=' + dayStr(120) + '&sort_by=popularity.desc', 'movie', soonMv, 1);
    }

    function popularCall(row, key) {
        return function (call) {
            var base = SVC[key].hero, left = 3, parts = [];
            var tvUrl = 'discover/tv?' + base + '&sort_by=popularity.desc&vote_count.gte=50';
            var mvUrl = 'discover/movie?' + base + '&sort_by=popularity.desc&vote_count.gte=100';
            function fin() {
                if (--left > 0) return;
                var seen = {}, list = [];
                parts.forEach(function (arr) { (arr || []).forEach(function (c) { var k = c.media_type + c.id; if (!seen[k]) { seen[k] = 1; list.push(c); } }); });
                list.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
                list = list.slice(0, 20);
                if (!list.length) return call();
                call({ title: row.title, results: list, url: tvUrl, source: 'tmdb', page: 1, more: true, total_pages: 5 });
            }
            [[tvUrl, 1, 'tv'], [tvUrl, 2, 'tv'], [mvUrl, 1, 'movie']].forEach(function (t, i) {
                tget(t[0], { page: t[1] }, function (j) {
                    parts[i] = cleanResults(j && j.results, false).filter(function (c) { return c.poster_path; }).map(function (c) { c.media_type = t[2]; return c; });
                    fin();
                }, function () { parts[i] = []; fin(); });
            });
        };
    }

    var ALT = {
        119: { movie: 'with_companies=20580' + '%7C56178%7C21', tv: 'with_networks=1024' },
        531: { movie: 'with_companies=4', tv: 'with_networks=4330%7C16%7C67%7C13' },
        526: { movie: 'with_companies=0', tv: 'with_networks=174' },
        15: { movie: 'with_companies=25%7C127928', tv: 'with_networks=453%7C88' }
    };
    var ALT_SVC = { amazon: 1, disney: 1, paramount: 1, sky: 1, amc: 1, hulu: 1 };
    var PROV_RX = /with_watch_providers=([^&]*)&watch_region=[^&]*&with_watch_monetization_types=[^&]*/;
    function empty(j) { return !j || !j.results || !j.results.length; }
    function tgetFb(url, params, ok, fail) {
        function alt(j, u) {
            var m = u.match(PROV_RX), k = u.match(/discover\/(movie|tv)/);
            var a = m && k && ALT[m[1].indexOf('119') >= 0 ? 119 : parseInt(m[1], 10)];
            if (!empty(j) || !a) return ok(j, u);
            var u2 = u.replace(PROV_RX, a[k[1]]);
            tget(u2, params, function (j2) { ok(j2, u2); }, function () { ok(j, u); });
        }
        tget(url, params, function (j) {
            if (empty(j) && url.indexOf('watch_region=UA') >= 0) {
                var u1 = url.replace('watch_region=UA', 'watch_region=US');
                return tget(u1, params, function (j1) { alt(j1, u1); }, fail);
            }
            alt(j, url);
        }, fail);
    }
    function serviceCall(row, key) {
        return function (call) {
            var cats = svcCats(key, true);
            var wide = function (u) { return u.replace('with_watch_monetization_types=flatrate', 'with_watch_monetization_types=flatrate%7Cfree%7Cads'); };
            var fresh = [
                { url: wide(cats[0].url), page: 1, kind: 'movie' }, { url: wide(cats[0].url), page: 2, kind: 'movie' },
                { url: cats[1].url, page: 1, kind: 'tv' }, { url: cats[1].url, page: 2, kind: 'tv' }
            ];
            var filler = [
                { url: wide(cats[2].url), page: 1, kind: 'movie' }, { url: cats[3].url, page: 1, kind: 'tv' }
            ];
            var moreUrl = '';
            function fetchAll(tasks, done) {
                var left = tasks.length, out = [];
                tasks.forEach(function (t, i) {
                    tgetFb(t.url, { page: t.page }, function (j, u) {
                        if (t.kind === 'tv' && !moreUrl && !empty(j)) moreUrl = u;
                        out[i] = cleanResults(j && j.results, false).filter(function (c) { return c.poster_path; }).map(function (c) { c.media_type = t.kind; return c; });
                        if (--left === 0) done(out);
                    }, function () { out[i] = []; if (--left === 0) done(out); });
                });
            }
            function merge(parts, into, seen) {
                parts.forEach(function (part) {
                    (part || []).forEach(function (c) { var k = c.media_type + c.id; if (!seen[k]) { seen[k] = 1; into.push(c); } });
                });
            }
            function byDate(a, b) {
                return String(b.release_date || b.first_air_date || '').localeCompare(String(a.release_date || a.first_air_date || ''));
            }
            fetchAll(fresh, function (parts) {
                var all = [], seen = {};
                merge(parts, all, seen);
                all.sort(byDate);
                all = all.slice(0, 20);
                if (all.length >= 14) return finish(all);
                fetchAll(filler, function (more) {
                    var add = [];
                    merge(more, add, seen);
                    add.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
                    finish(all.concat(add).slice(0, 20));
                });
            });
            function finish(list) {
                if (!list.length) return call();
                call({ title: row.title, results: list, url: moreUrl || cats[1].url, source: 'tmdb', page: 1, more: true, total_pages: 2 });
            }
        };
    }

    var svcRegistered = false, svcCache = {};
    function registerServicePage() {
        if (svcRegistered || !Lampa.Component || !Lampa.Component.add || !Lampa.InteractionMain) return;
        svcRegistered = true;
        Lampa.Component.add('lmx_service', function (object) {
            var comp = new Lampa.InteractionMain(object);
            comp.create = function () {
                var self = this, id = object.service_id;
                this.activity.loader(true);
                var cats = id === 'mood' ? moodCats() : svcCats(id), isAn = !!(SVC[id] && SVC[id].hero), heroL = null, heroDone = false;
                var svcName = (SERVICES.filter(function (x) { return x[0] === id; })[0] || [])[1] || '';
                var heroTitle = isAn ? (id === 'dorama' ? 'Дорамы' : 'Аниме') + ': в топе и скоро' : svcName + ': в тренде';
                var cache = svcCache[id];
                if (!cache || Date.now() - cache.t > 300000) cache = svcCache[id] = { t: Date.now(), res: [] };
                var res = cache.res; res.forEach(function (r, i) { if (!r || !r.length) delete res[i]; });
                var meta = cache.meta = cache.meta || {};
                var GROUP = 6, next = 0, built = false, firstRows = [], firstReady = false, tries2 = 0, relaxed = false, altQ = false;
                if (!cats.length) { self.activity.loader(false); self.empty(); return this.render(); }
                function rowData(i) {
                    var mt = meta[i], url = mt ? mt.url : (cats[i].url2 || cats[i].url), more = !!url && !cats[i].newep && !cats[i].mix;
                    return { title: cats[i].title, results: res[i].slice(0, ROW_MAX).map(function (x) { var c = {}; for (var k in x) c[k] = x[k]; return c; }), url: url, source: 'tmdb', page: 1, more: more, total_pages: more ? ((mt && mt.tp) || 20) : 1 };
                }
                function ok(i) { return res[i] && res[i].length >= (cats[i].min || (i < 4 ? 5 : 8)); }
                function fetchRow(i, done) {
                    if (res[i]) return done();
                    if (cats[i].newep) { newEpBuild(function (arr) { res[i] = arr || []; done(); }); return; }
                    if (cats[i].recs) { recsBuild(cats[i].recs, function (d) { res[i] = (d && d.results) || []; if (d && d.url) meta[i] = { url: d.url, tp: d.total_pages }; done(); }); return; }
                    var pages = (i < 3 || id === 'anime' || id === 'dorama') ? 2 : 1, alts = cats[i].alts || [], nu = 1 + alts.length, got = [], pend = pages * nu, seenC = {}, fin = false, t0 = Date.now(), errs = 0;
                    var qurl = (altQ && id === 'anime' && cats[i].url.indexOf('with_keywords=') < 0) ? cats[i].url.split('with_original_language=ja&with_genres=16').join('with_keywords=210024') : cats[i].url;
                    var dbg = (window.__lmxDbg = window.__lmxDbg || []);
                    if (dbg.length > 200) dbg.splice(0, 100);
                    function end() {
                        if (fin || --pend > 0) return;
                        fin = true; clearTimeout(t);
                        var out = [];
                        got.forEach(function (arr) { (arr || []).forEach(function (x) { if (!seenC[x.id]) { seenC[x.id] = 1; out.push(x); } }); });
                        if (alts.length) {
                            var qq = cats[i].url, byd = /sort_by=(first_air_date|primary_release_date)\.desc/.test(qq), byv = /sort_by=vote_average\.desc/.test(qq);
                            out.sort(function (a, b) {
                                if (byd) return String(b.first_air_date || b.release_date || '').localeCompare(String(a.first_air_date || a.release_date || ''));
                                if (byv) return (b.vote_average || 0) - (a.vote_average || 0);
                                return (b.popularity || 0) - (a.popularity || 0);
                            });
                        }
                        if (cats[i].f) out.sort(function (a, b) { return String(a.first_air_date || a.release_date || '').localeCompare(String(b.first_air_date || b.release_date || '')); });
                        res[i] = out;
                        dbg.push({ s: id, i: i, t: cats[i].title, n: out.length, ms: Date.now() - t0, err: errs });
                        done();
                    }
                    var t = setTimeout(function () { if (fin) return; fin = true; res[i] = []; dbg.push({ s: id, i: i, t: cats[i].title, n: -1, ms: 15000, url: cats[i].url }); done(); }, 15000);
                    for (var ui = 0; ui < nu; ui++) for (var pg = 1; pg <= pages; pg++) (function (pg, ui) {
                        var tries = 0, gi = ui * pages + pg - 1, qx = ui === 0 ? qurl : alts[ui - 1];
                        (function go() {
                            tgetFb(qx, { page: pg }, function (j, u) {
                                if (!empty(j) && ui === 0) cats[i].url2 = u;
                                got[gi] = cleanResults(j && j.results, !!cats[i].f || relaxed).filter(function (x) { return x.poster_path && (!cats[i].f || cats[i].f(x)); });
                                if (cats[i].mix) got[gi].forEach(function (x) { if (!x.media_type) x.media_type = /^discover\/tv|^search\/tv/.test(qx) ? 'tv' : 'movie'; });
                                end();
                            }, function () { errs++; if (++tries < 2) return setTimeout(go, 600); got[gi] = []; end(); });
                        })();
                    })(pg, ui);
                }
                function loadGroup(emit, finished) {
                    var from = next, to = Math.min(cats.length, from + GROUP), p = from;
                    next = to;
                    if (from >= to) return finished();
                    var over = false;
                    function flush() {
                        while (p < to && res[p]) { if (ok(p)) emit(rowData(p)); p++; }
                        if (p >= to && !over) { over = true; finished(); }
                    }
                    for (var i = from; i < to; i++) fetchRow(i, flush);
                    flush();
                }
                function tryBuild() {
                    if (built || !heroDone || !firstReady) return;
                    var data = [];
                    if (heroL && heroL.length) data.push({ title: heroTitle, results: heroItems(heroL), params: { items: { mapping: 'line', view: 15 } } });
                    data = data.concat(firstRows);
                    if (!data.length && next < cats.length) { firstReady = false; return startFirst(); }
                    if (!data.length && tries2 < (id === 'anime' ? 3 : 2)) {
                        tries2++;
                        if (tries2 >= 2) relaxed = true;
                        if (tries2 === 3) altQ = true;
                        res.length = 0; next = 0; firstReady = false; firstRows = [];
                        return setTimeout(startFirst, 1200);
                    }
                    self.activity.loader(false);
                    if (!data.length) {
                        safe(function () {
                            var d = (window.__lmxDbg || []).filter(function (x) { return x.s === id; }), er = 0, to = 0, nn = 0;
                            d.forEach(function (x) { er += x.err || 0; if (x.n < 0) to++; else nn += x.n; });
                            var why = to || er ? 'TMDB не отвечает (ошибок:' + (er + to) + ')' : (nn ? 'найдено' + nn + ', но без постера/описания' : 'TMDB вернул пустые списки');
                            var srcs = ''; try { srcs = Object.keys(Lampa.Api.sources || {}).join(', ') + ' | ' + String(Lampa.Storage.get('source', '')); } catch (e) {}
                            if (Lampa.Noty) Lampa.Noty.show('Каталог пуст:' + why + (srcs ? '. Источники:' + srcs : ''));
                        });
                        return self.empty();
                    }
                    built = true;
                    self.build(data);
                    moreSoon();
                    if (heroL && heroL.length) heroAttach(heroTitle, heroL);
                    startLazy();
                }
                function moreSoon() {}
                function put(r) {
                    if (built) { try { self.append(r); moreSoon(); } catch (e) { next = cats.length; } } else firstRows.push(r);
                }
                function startFirst() {
                    firstRows = [];
                    var timer = setTimeout(function () { firstReady = true; tryBuild(); }, 8000);
                    var got = 0;
                    loadGroup(function (r) { put(r); if (!built && ++got >= 3) { clearTimeout(timer); firstReady = true; tryBuild(); } },
                        function () { clearTimeout(timer); firstReady = true; tryBuild(); });
                }
                function startLazy() {
                    var el = self.render(), busy = false;
                    var iv = setInterval(function () {
                        var root = el && el[0];
                        if (!root || !document.body.contains(root)) return clearInterval(iv);
                        if (next >= cats.length) return clearInterval(iv);
                        if (busy || typeof self.append !== 'function') return;
                        var lines = root.querySelectorAll('.items-line'), fo = root.querySelector('.focus'), fl = fo && fo.closest('.items-line'), near = false;
                        if (fl) { var fi = [].indexOf.call(lines, fl); near = fi >= 0 && fi >= lines.length - 3; }
                        if (!near && lines.length && root.closest('.activity--active')) { var lr = lines[lines.length - 1].getBoundingClientRect(); near = lr.top < (window.innerHeight || 800) * 2.2 && lr.bottom > -100; }
                        if (!near) return;
                        busy = true;
                        loadGroup(put, function () { busy = false; });
                    }, 400);
                }
                if (typeof self.append !== 'function') GROUP = cats.length;
                startFirst();
                function gotHero(l) { if (heroDone) return; heroDone = true; heroL = l; safe(function () { heroL.forEach(function (m) { heroPreload(imgUrl(m.backdrop_path, 'w1280')); }); }); tryBuild(); }
                var heroT = setTimeout(function () { if (!heroDone) { heroDone = true; tryBuild(); } }, (isAn || ALT_SVC[id]) ? 9000 : 4000);
                if (id === 'mood') { clearTimeout(heroT); heroDone = true; tryBuild(); return this.render(); }
                try { (isAn ? animeHeroList(SVC[id].hero, gotHero) : svcHeroList(id, gotHero)); } catch (e) { clearTimeout(heroT); heroDone = true; tryBuild(); }
                return this.render();
            };
            comp.onMore = function (data) {
                Lampa.Activity.push({ url: data.url, title: data.title || 'Ещё', component: 'category_full', source: 'tmdb', page: 1 });
            };
            return comp;
        });
    }

    function imgUrl(path, size) {
        try { if (Lampa.TMDB && Lampa.TMDB.image) return Lampa.TMDB.image('t/p/' + size + path); } catch (e) {}
        return 'https://image.tmdb.org/t/p/' + size + path;
    }
    var heroImgs = {}, heroImgOrder = [];
    var heroQ = [], heroBusy = false;
    function heroNext() {
        if (heroBusy) return;
        var url = heroQ.shift();
        if (!url) return;
        heroBusy = true;
        var done = false;
        function fin() { if (done) return; done = true; heroBusy = false; setTimeout(heroNext, 120); }
        try {
            var im = new Image();
            heroImgs[url] = im;
            heroImgOrder.push(url);
            while (heroImgOrder.length > 24) delete heroImgs[heroImgOrder.shift()];
            im.onload = function () { if (im.decode) im.decode().then(fin, fin); else fin(); };
            im.onerror = fin;
            im.src = url;
            setTimeout(fin, 4000);
        } catch (e) { fin(); }
    }
    function heroPreload(url, front) {
        if (heroImgs[url]) return;
        var qi = heroQ.indexOf(url);
        if (qi >= 0) { if (front && qi > 0) { heroQ.splice(qi, 1); heroQ.unshift(url); } return; }
        if (front) heroQ.unshift(url); else heroQ.push(url);
        setTimeout(heroNext, 0);
    }
    function heroReady(url) {
        var im = url && heroImgs[url];
        return !!(im && im.complete && im.naturalWidth > 0);
    }
    function makeInstance(d) {
        return Lampa.Maker.make('Card', d, function (module) { return module.only('Card', 'Callback'); });
    }
    function htmlOf(inst, extra) {
        var h = (inst && inst.html) || (extra && extra.html) || extra;
        if (!h) return null;
        if (h.jquery) return h;
        return (window.$ && h.nodeType) ? window.$(h) : null;
    }
    function openFull(m) {
        Lampa.Activity.push({
            url: '', component: 'full', id: m.id, method: (m.media_type === 'tv' || m.name) ? 'tv' : 'movie',
            card: m, source: 'tmdb'
        });
    }
    function esc(t) { return String(t || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    function hypeWindow() { return parseInt(getStr('lmx_hero_hype', '30'), 10) || 0; }
    function hypeSources() {
        var w = hypeWindow();
        if (!w) return [];
        return [
            ['movie/upcoming?region=UA', 'movie', 1, 'soon'],
            ['discover/movie?sort_by=popularity.desc&primary_release_date.gte=' + dayStr(-w) + '&primary_release_date.lte=' + dayStr(0) + '&region=UA', 'movie', 1, 'new'],
            ['discover/tv?sort_by=popularity.desc&first_air_date.gte=' + dayStr(1) + '&first_air_date.lte=' + dayStr(w), 'tv', 1, 'soon'],
            ['discover/tv?sort_by=popularity.desc&first_air_date.gte=' + dayStr(-w) + '&first_air_date.lte=' + dayStr(0), 'tv', 1, 'new']
        ];
    }
    var HERO_IMG = 'w1280';
    function themeBase() { var t = getStr('lmx_theme', 'default'); return t === 'hbo' ? 'prem' : t; }
    function heroTitle(t) {
        t = String(t || '');
        if (getStr('lmx_theme', 'default') !== 'prem') return esc(t);
        var mm = t.match(/^(.{2,}?)\s*[:\u2014\u2013]\s+(.+)$/), a = mm ? mm[1] : t, b = mm ? mm[2] : '';
        var sz = a.length <= 8 ? 1 : (a.length <= 13 ? 2 : (a.length <= 20 ? 3 : 4));
        return '<span class="lmx-w1 lmx-s' + sz + '">' + esc(a) + '</span>' + (b ? '<span class="lmx-w2">' + esc(b) + '</span>' : '');
    }
    function journalOn() { return themeBase() === 'default' && !isMobile(); }
    function board() { var t = themeBase(); return t === 'apple' || t === 'hbo' || t === 'prem'; }
    function heroSources() {
        return [['trending/all/week', '', 1], ['movie/now_playing?region=UA', 'movie', 1]].concat(hypeSources());
    }
    var HYPE_MIN_POP = 50;

    var tcache = {}, tpend = {}, tcacheKeys = [];
    function tclone(j) {
        if (!j || !j.results || !j.results.slice) return j;
        var o = {}, k;
        for (k in j) o[k] = j[k];
        o.results = j.results.map(function (m) { var c = {}, q; for (q in m) c[q] = m[q]; return c; });
        return o;
    }
    function tget(url, params, ok, fail) {
        var key = url + '|' + JSON.stringify(params || {}), now = Date.now();
        var c = tcache[key];
        if (c && now - c.t < 480000) { setTimeout(function () { ok(tclone(c.j)); }, 0); return; }
        if (tpend[key]) { tpend[key].push([ok, fail]); return; }
        tpend[key] = [[ok, fail]];
        Lampa.Api.sources.tmdb.get(url, params || {}, function (j) {
            var q = tpend[key]; delete tpend[key];
            if (j) {
                if (!tcache[key]) tcacheKeys.push(key);
                tcache[key] = { t: Date.now(), j: j };
                while (tcacheKeys.length > 80) delete tcache[tcacheKeys.shift()];
            }
            q.forEach(function (x) { try { x[0](tclone(j)); } catch (e) {} });
        }, function (err) {
            var q = tpend[key]; delete tpend[key];
            q.forEach(function (x) { try { if (x[1]) x[1](err); } catch (e) {} });
        });
    }

    function initPhoneHero() {
        if (window.__lmxPH) return;
        window.__lmxPH = true;
        var touchT = 0, sx = 0, sy = 0, tl = null;
        function lineEl() {
            var ls = document.querySelectorAll('.items-line.lmx-hero-line'), i, r;
            var vh = window.innerHeight || 800, best = null, bs = -1;
            for (i = 0; i < ls.length; i++) {
                if (ls[i].offsetParent === null) continue;
                r = ls[i].getBoundingClientRect();
                var vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
                if (vis > bs) { bs = vis; best = ls[i]; }
            }
            if (best) return best;
            for (i = 0; i < ls.length; i++) { r = ls[i].getBoundingClientRect(); if (r.width > 0 && r.height > 0) return ls[i]; }
            return null;
        }
        function step(dir, only) {
            var line = only && only.isConnected !== false ? only : lineEl();
            if (!line) return;
            var cs = line.querySelectorAll('.card--lmxhero');
            if (cs.length < 2) return;
            var cur = 0, i;
            for (i = 0; i < cs.length; i++) if (cs[i].classList.contains('lmx-pcur')) cur = i;
            var nx = (cur + dir + cs.length) % cs.length;
            window.__lmxPI = nx;
            for (i = 0; i < cs.length; i++) if (i !== nx) cs[i].classList.remove('lmx-pcur');
            cs[nx].classList.add('lmx-pcur');
            var d = cs[nx].querySelector('.lmx-pdots i.on');
            if (d) { d.style.animation = 'none'; void d.offsetWidth; d.style.animation = ''; }
        }
        setInterval(function () {
            safe(function () {
                if (document.hidden || !isMobile()) return;
                var line = lineEl();
                if (!line) return;
                var cs = line.querySelectorAll('.card--lmxhero'), on = [], i;
                if (!cs.length) return;
                for (i = 0; i < cs.length; i++) if (cs[i].classList.contains('lmx-pcur')) on.push(i);
                if (on.length === 1) { window.__lmxPI = on[0]; return; }
                var keep = on.length ? on[on.length - 1] : Math.min(window.__lmxPI || 0, cs.length - 1);
                for (i = 0; i < cs.length; i++) if (i !== keep) cs[i].classList.remove('lmx-pcur');
                cs[keep].classList.add('lmx-pcur');
                window.__lmxPI = keep;
            });
        }, 400);
        setInterval(function () {
            safe(function () {
                if (!isMobile() || document.hidden || Date.now() - touchT < 6000) return;
                var line = lineEl();
                if (!line) return;
                var r = line.getBoundingClientRect();
                if (r.bottom < 80 || r.top > (window.innerHeight || 800) - 80) return;
                step(1);
            });
        }, 4500);
        var fired = false, lx = 0, ly = 0;
        function swipeAt(t) {
            lx = t.clientX; ly = t.clientY;
            var dx = t.clientX - sx, dy = t.clientY - sy;
            if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.4) { touchT = Date.now(); fired = true; var ln = tl; safe(function () { step(dx < 0 ? 1 : -1, ln); }); return true; }
            return false;
        }
        function down(t, target) {
            fired = false;
            if (!t || !target || !target.closest || !target.closest('.lmx-hero-line, .card--lmxhero')) { sx = 0; return; }
            sx = t.clientX || 1; sy = t.clientY; lx = sx; ly = sy;
            tl = target.closest('.items-line.lmx-hero-line') || (target.closest('.card--lmxhero') && target.closest('.card--lmxhero').closest('.items-line')) || null;
        }
        function end() { sx = 0; fired = false; }
        var opt = { passive: true, capture: true };
        window.addEventListener('touchstart', function (e) { down(e.touches && e.touches[0], e.target); }, opt);
        window.addEventListener('touchmove', function (e) {
            if (!sx || fired) return;
            var t = e.touches && e.touches[0];
            if (t) swipeAt(t);
        }, opt);
        window.addEventListener('touchend', function (e) {
            var t = e.changedTouches && e.changedTouches[0];
            if (sx && !fired && t) swipeAt(t);
            end();
        }, opt);
        window.addEventListener('touchcancel', function () {
            if (sx && !fired) swipeAt({ clientX: lx, clientY: ly });
            end();
        }, opt);
        window.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch' || e.pointerType === 'pen') down(e, e.target); }, opt);
        window.addEventListener('pointermove', function (e) { if (sx && !fired && (e.pointerType === 'touch' || e.pointerType === 'pen')) swipeAt(e); }, opt);
        window.addEventListener('pointerup', function (e) { if (e.pointerType === 'touch' || e.pointerType === 'pen') end(); }, opt);
        window.addEventListener('pointercancel', function (e) { if (e.pointerType === 'touch' || e.pointerType === 'pen') { if (sx && !fired) swipeAt({ clientX: lx, clientY: ly }); end(); } }, opt);
    }
    function fitStudioNames(root) {
        var ns = (root || document).querySelectorAll('.lmx-studio__name');
        for (var i = 0; i < ns.length; i++) {
            var n = ns[i], v = n.closest && n.closest('.card__view');
            if (!v || !v.clientWidth) continue;
            n.style.whiteSpace = 'nowrap'; n.style.fontSize = '';
            var pad = 0, cs = getComputedStyle(v);
            pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
            var avail = v.clientWidth - pad - v.clientWidth * 0.1, sw = n.scrollWidth, fs = parseFloat(getComputedStyle(n).fontSize) || 16;
            if (sw > avail && avail > 0) n.style.fontSize = Math.max(8, fs * avail / sw) + 'px';
        }
    }
    window.addEventListener('resize', function () { safe(function () { fitStudioNames(); }); });
    // действие баннера: play = «Смотреть» (открыть и сразу запустить), иначе просто страница фильма; защита от двойного срабатывания
    function heroGo(m, play) {
        var now = Date.now();
        if (now - (heroGo.t || 0) < 700) return;
        heroGo.t = now;
        if (play) resumeFlag = { id: m.id, t: now };
        openFull(m);
    }
    function heroDecorate(h, m, idx, n, svc) {
        var phone = isMobile() && !!m.poster_path;
        var heroPath = phone ? m.poster_path : m.backdrop_path, heroSize = phone ? 'w780' : HERO_IMG;
        h.addClass('card--lmxhero').attr('data-lmxu', imgUrl(heroPath, heroSize)).attr('data-lmxi', idx).attr('data-lmxn', n);
        if (h.closest) {
            var hl = h.closest('.items-line').addClass('lmx-hero-line');
            if (svc) hl.addClass('lmx-mini lmx-mini--svc'); else if (!board()) hl.addClass('lmx-mini lmx-mini--def');
        }
        var view = h.find('.card__view');
        var heroUrl = imgUrl(heroPath, heroSize);
        heroPreload(heroUrl);
        view.css('background-image', 'url(' + heroUrl + '),url(' + imgUrl(heroPath, phone ? 'w342' : 'w300') + ')');
        view.find('img').css('opacity', 0);
        h.find('.card__title,.card__age,.card__vote').remove();
        var v = Number(m.vote_average) || 0;
        var isTv = m.media_type === 'tv' || (!m.title && m.name);
        var year = String(m.release_date || m.first_air_date || '').slice(0, 4);
        var ov = String(m.overview || '');
        if (!ov && m.__tag === 'soon') ov = '';
        var ovMax = getStr('lmx_theme', 'default') === 'default' ? 120 : 190;
        if (ov.length > ovMax) ov = ov.slice(0, ovMax - 3).replace(/\s+\S*$/, '') + '…';
        var tagHtml = m.__tag ? '<span class="lmx-hero__tag lmx-t-' + m.__tag + '">' + (m.__tag === 'soon' ? 'Скоро ·' + fmtShort(m.release_date || m.first_air_date) : 'Уже вышел') + '</span>' : (m.__trend ? '<span class="lmx-hero__tag lmx-t-trend">' + (m.__air ? 'Выходит сейчас' : 'В тренде') + '</span>' : '');
        var premT = themeBase() === 'prem';
        view.append('<div class="lmx-hero__shade"></div><div class="lmx-hero__text">' + (premT ? '<div class="lmx-hero__kick">' + (tagHtml || (isTv ? 'Сериал' : 'Фильм')) + '</div>' : '') + '<div class="lmx-hero__title">' +
            heroTitle(m.title || m.name) + '</div><div class="lmx-hero__meta">' +
            (premT ? '' : tagHtml) +
            (v ? '<span class="lmx-hero__v" style="color:' + ratingColor(v) + '"><i>&#9734;</i> ' + v.toFixed(1) + '</span>' : '') +
            '<span>' + (isTv ? 'Сериал' : 'Фильм') + '</span>' + (year ? '<span>' + year + '</span>' : '') +
            (getStr('lmx_theme', 'default') === 'prem' && GENRES[(m.genre_ids || [])[0]] ? '<span>' + GENRES[(m.genre_ids || [])[0]] + '</span>' : '') +
            '</div>' +
            ((getStr('lmx_theme', 'default') === 'apple' || (isMobile() && themeBase() === 'default')) ? '<div class="lmx-hero__acts"><span class="lmx-hero__btn">&#9654;&#xFE0E;&nbsp; Смотреть</span><span class="lmx-hero__circ">+</span></div>' :
                (themeBase() === 'hbo' || themeBase() === 'prem') ? '<div class="lmx-hero__acts"><span class="lmx-hero__about"><i>i</i>' + (isTv ? 'О сериале' : 'О фильме') + '</span><span class="lmx-hero__btn">&#9654;&#xFE0E;&nbsp; Смотреть</span></div>' : '') + '</div>');
        safe(function () { if (m && m.id && view[0]) uaqWant(view[0], m, isTv ? 'tv' : 'movie'); });
        if (phone) {
            var dh = '<div class="lmx-pdots">'; for (var di = 0; di < n; di++) dh += '<i' + (di === idx ? ' class="on"' : '') + '></i>'; dh += '</div>';
            view.find('.lmx-hero__text').append(dh);
            if (idx === 0) h.addClass('lmx-pcur');
            safe(initPhoneHero);
        }
        safe(function () {
            var circ = h.find('.lmx-hero__circ');
            if (!circ.length) return;
            var cardData = m;
            function inBook() { try { return !!Lampa.Favorite.check(cardData).book; } catch (e) { return false; } }
            function paint() { circ.text(inBook() ? '\u2713' : '+'); }
            function flip() {
                try {
                    Lampa.Favorite.toggle('book', cardData);
                    paint();
                    if (Lampa.Noty) Lampa.Noty.show(inBook() ? 'Добавлено в избранное' : 'Убрано из избранного');
                } catch (e) {}
            }
            paint();
            circ.on('click', function (ev) { ev.stopPropagation(); ev.preventDefault(); flip(); });
            h.on('hover:long', function (ev) { ev.stopImmediatePropagation(); flip(); });
            circ.__lmxFlip = flip;
            try {
                var evs = $._data(h[0], 'events');
                var arr = evs && evs['hover:long'];
                if (arr && arr.length > 1) { var mine = arr.pop(); arr.unshift(mine); }
            } catch (e) {}
        });
        safe(function () {
            h.find('.lmx-hero__btn').on('click', function (ev) { ev.stopPropagation(); ev.preventDefault(); heroGo(m, true); });
            h.find('.lmx-hero__about').on('click', function (ev) { ev.stopPropagation(); ev.preventDefault(); heroGo(m, false); });
            if (svc) return;
            // пульт (Android TV): OK = «Смотреть», долгое OK = «О фильме» (или в избранное, если на баннере кнопка «+»)
            h.on('hover:enter', function () { heroGo(m, true); });
            if (!h.find('.lmx-hero__circ').length) h.on('hover:long', function (ev) { ev.stopImmediatePropagation(); heroGo(m, false); });
        });
    }
    function heroItems(list) {
        return list.map(function (m, idx) {
            var it = {};
            for (var k in m) it[k] = m[k];
            it.params = {
                createInstance: makeInstance,
                emit: {
                    onCreate: function () {
                        var self = this, ex = arguments[0];
                        safe(function () {
                            var h = htmlOf(self, ex);
                            if (!h) return;
                            heroDecorate(h, m, idx, list.length);
                        });
                    },
                    onlyEnter: function () { heroGo(m, true); }
                }
            };
            return it;
        });
    }

    function heroAttach(title, list) {
        if (!window.$) return;
        var n = list.length, tries = 0, bodyMo = null, iv = 0;
        function findLine() {
            var found = null;
            document.querySelectorAll('.items-line').forEach(function (l) {
                var t = l.querySelector('.items-line__title');
                if (!found && t && String(t.textContent).replace(/\s+/g, ' ').trim() === title) found = l;
            });
            return found;
        }
        function run() {
            var line = findLine();
            if (!line) return;
            var cards = line.querySelectorAll('.card');
            for (var i = 0; i < cards.length && i < n; i++) {
                var h = window.$(cards[i]);
                if (!h.hasClass('card--lmxhero')) {
                    h.find('.lmx-cin,.lmx-box').remove();
                    (function (hh, ii) { safe(function () { heroDecorate(hh, list[ii], ii, n, true); }); })(h, i);
                }
            }
            window.$(line).addClass('lmx-mini lmx-mini--svc').removeClass('lmx-mini--def').find('.card--lmxhero .lmx-cin,.card--lmxhero .lmx-box').remove();
        }
        var lineMo = null;
        function watchLine() {
            if (lineMo) return;
            var line = findLine();
            if (!line) return;
            if (bodyMo) { bodyMo.disconnect(); bodyMo = null; }
            clearInterval(iv);
            lineMo = new MutationObserver(function () {
                if (!document.body.contains(line)) { lineMo.disconnect(); return; }
                safe(run);
            });
            lineMo.observe(line, { childList: true, subtree: true });
        }
        safe(function () { run(); watchLine(); });
        if (lineMo) return;
        bodyMo = new MutationObserver(function () { safe(run); watchLine(); });
        bodyMo.observe(document.body, { childList: true, subtree: true });
        setTimeout(function () { if (bodyMo) bodyMo.disconnect(); }, 8000);
        iv = setInterval(function () {
            tries++;
            safe(function () { run(); watchLine(); });
            if (tries > 50) clearInterval(iv);
        }, 200);
    }

    function isAnimeItem(m) {
        return !!m && m.original_language === 'ja' && (m.genre_ids || []).indexOf(16) >= 0;
    }

    function heroCall(row) {
        return function (call) {
            var srcs = heroSources(), left = srcs.length, all = [], seenIds = {};
            function fin() {
                if (--left > 0) return;
                var merged = {}, order = [];
                all.forEach(function (m) {
                    var e = merged[m.id];
                    if (!e) { merged[m.id] = e = { m: m, base: false, hype: false }; order.push(m.id); }
                    if (m.__hype) e.hype = true; else e.base = true;
                });
                var w = hypeWindow(), tagOf = {}, pool = { soon_movie: [], new_movie: [], soon_tv: [], new_tv: [] };
                order.forEach(function (id) {
                    var m = merged[id].m;
                    if (!merged[id].hype || !m.backdrop_path || m.media_type === 'person') return;
                    var d = dayDiff(m.release_date || m.first_air_date);
                    var kind = (m.media_type === 'tv' || (!m.title && m.name)) ? 'tv' : 'movie';
                    if (d === null || !w) return;
                    if ((m.popularity || 0) < HYPE_MIN_POP) return;
                    if (d > 0 && d <= w) pool['soon_' + kind].push(m);
                    else if (d <= 0 && d >= -w && !(m.vote_count > 30 && m.vote_average < 6)) pool['new_' + kind].push(m);
                });
                Object.keys(pool).forEach(function (k) {
                    pool[k].sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
                    pool[k].slice(0, k.indexOf('tv') > 0 ? 2 : 3).forEach(function (m) { tagOf[m.id] = k.split('_')[0]; });
                });
                var list = [];
                order.forEach(function (id) {
                    var e = merged[id], m = e.m;
                    var tag = tagOf[id];
                    if (!m.backdrop_path || seenIds[id]) return;
                    if (m.media_type === 'person') return;
                    if (!/[а-яё]/i.test(String(m.overview || ''))) return;
                    if (!tag) {
                        if (!e.base) return;
                        var fd = dayDiff(m.release_date || m.first_air_date);
                        if (fd !== null && fd > 0) return;
                        if (!(m.overview && String(m.overview).trim())) return;
                        if (m.vote_count > 30 && m.vote_average < 6.3) return;
                    }
                    if (tag) m.__tag = tag; else m.__trend = 1;
                    seenIds[id] = 1;
                    list.push(m);
                });
                list.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
                var lim = heroMax();
                var tg = list.filter(function (m) { return m.__tag === 'soon'; }).concat(list.filter(function (m) { return m.__tag === 'new'; })).slice(0, lim - 2);
                var rest = list.filter(function (m) { return !m.__tag; });
                list = tg.concat(rest.slice(0, lim - tg.length));
                list.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
                if (!list.length) return call();
                safe(function () {
                    list.slice(0, 3).forEach(function (m) { heroPreload(imgUrl(m.backdrop_path, HERO_IMG)); });
                    list.forEach(function (m) { heroPreload(imgUrl(m.backdrop_path, 'w300')); });
                    list.slice(3).forEach(function (m) { heroPreload(imgUrl(m.backdrop_path, HERO_IMG)); });
                });
                var items = heroItems(list);
                call({ title: 'Афиша', results: items, params: { items: { mapping: 'line', view: 15 } } });
            }
            srcs.forEach(function (x) {
                tget(x[0], { page: 1 }, function (j) {
                    (j && j.results || []).forEach(function (m) { if (isAnimeItem(m)) return; if (x[1] && !m.media_type) m.media_type = x[1]; if (x[3]) m.__hype = x[3]; all.push(m); });
                    fin();
                }, function () { fin(); });
            });
        };
    }

    var PROV_COLORS = { 9003: '#0057b7', 8: '#c8102e', 350: '#1d1d1f', 1899: '#5b2bd0', 119: '#0f79af', 337: '#0b2a6b', 531: '#0064ff', 526: '#10202f', 1773: '#6a1b9a', 9000: '#e5304b', 9001: '#d6336c' };
    var PROV_TEXT = { 9003: '#7fb0ff', 8: '#ff5a60', 119: '#4da3ff', 337: '#6ea8ff', 531: '#4d8dff', 526: '#7fd3ff', 1773: '#c79bff', 9000: '#ff6b81', 9001: '#ff7fb0' };
    function studioCall(row) {
        return function (call) {
            var logos = {};
            function done() {
                var items = svcList().map(function (x) {
                    return {
                        id: 'lmxstudio' + x[2], title: x[1], params: {
                            createInstance: makeInstance,
                            emit: {
                                onCreate: function () {
                                    var self = this, ex = arguments[0];
                                    safe(function () {
                                        var h = htmlOf(self, ex);
                                        if (!h) return;
                                        h.addClass('card--lmxstudio');
                                        var view = h.find('.card__view');
                                        view.css('background-color', PROV_COLORS[x[2]] || '#2a2f3d');
                                        try { view[0].style.setProperty('--lmx-pc', PROV_COLORS[x[2]] || '#2a2f3d'); } catch (e) {}
                                        view.find('img').css('opacity', 0);
                                        h.find('.card__title,.card__age,.card__vote').remove();
                                        var lg = logos[x[2]];
                                        if (journalOn()) {
                                            view.append((lg ? '<img class="lmx-studio__logo" src="' + imgUrl(lg, 'w154') + '">' : '') + '<div class="lmx-studio__name">' + esc(x[1]) + '</div>');
                                            return;
                                        }
                                        view.append(lg && getStr('lmx_theme', 'default') !== 'prem' ? '<img class="lmx-studio__logo" src="' + imgUrl(lg, 'w154') + '">' :
                                            '<div class="lmx-studio__name" style="color:' + (PROV_TEXT[x[2]] || '#fff') + '">' + esc(x[1]) + '</div>');
                                        [0, 400, 1500, 4000].forEach(function (d) { setTimeout(function () { safe(function () { fitStudioNames(h[0]); }); }, d); });
                                    });
                                },
                                onlyEnter: function () { openService(x); }
                            }
                        }
                    };
                });
                call({ title: row.title, results: items, params: { items: { mapping: 'line', view: 15 } } });
            }
            tget('watch/providers/movie?watch_region=UA', {}, function (j) {
                ((j && j.results) || []).forEach(function (p) { logos[p.provider_id] = p.logo_path; });
                tget('watch/providers/movie?watch_region=US', {}, function (u) {
                    ((u && u.results) || []).forEach(function (p) { if (!logos[p.provider_id]) logos[p.provider_id] = p.logo_path; });
                    done();
                }, function () { done(); });
            }, function () { done(); });
        };
    }
    function openService(x) {
        registerServicePage();
        Lampa.Activity.push({ url: '', title: x[1], component: 'lmx_service', service_id: x[0], page: 1 });
    }

    function favIds(type) {
        var o = {};
        try { (Lampa.Favorite.get({ type: type }) || []).forEach(function (c) { if (c && c.id) o[c.id] = 1; }); } catch (e) {}
        return o;
    }
    var recsAllBy = {};
    function genreIds(c) { return c.genre_ids || (c.genres || []).map(function (q) { return q && q.id; }) || []; }
    function isAnimeC(c) { return !!c && c.original_language === 'ja' && genreIds(c).indexOf(16) >= 0; }
    function isDoramaC(c) { return !!c && c.original_language === 'ko' && (c.media_type === 'tv' || !!c.name || !!c.first_air_date) && genreIds(c).indexOf(16) < 0; }
    function recsListHook() {
        var T = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
        if (!T || T.__lmxRecs || !T.list) return;
        T.__lmxRecs = true;
        var orig = T.list;
        T.list = function (params, ok, fail) {
            if (params && typeof params.url === 'string' && params.url.indexOf('lmx://fav/') === 0) {
                var ty = params.url.slice(10), arr = [], seenF = {};
                try { arr = Lampa.Favorite.get({ type: ty }) || []; if (ty === 'wath') seenF = favIds('viewed'); } catch (e) {}
                arr = arr.filter(function (c) { return c && c.id && !seenF[c.id]; });
                var pf = params.page || 1, perF = 20;
                return ok({ results: arr.slice((pf - 1) * perF, pf * perF).map(function (c) { var x = {}, q; for (q in c) x[q] = c[q]; return x; }), page: pf, total_pages: Math.max(1, Math.ceil(arr.length / perF)), total_results: arr.length, source: 'tmdb' });
            }
            if (params && typeof params.url === 'string' && params.url.indexOf('lmx://recs/') === 0) {
                var recsAll = recsAllBy[params.url.slice(11)] || [];
                var p = params.page || 1, per = 20;
                var res = recsAll.slice((p - 1) * per, p * per).map(function (c) { var x = {}, q; for (q in c) x[q] = c[q]; return x; });
                return ok({ results: res, page: p, total_pages: Math.max(1, Math.ceil(recsAll.length / per)), total_results: recsAll.length, source: 'tmdb' });
            }
            return orig.apply(this, arguments);
        };
    }

    function hasUaText(r) {
        var t = String(r && r.overview || '').trim();
        if (!/[\u0400-\u04FF]/.test(t)) return false;
        return /[\u0456\u0457\u0454\u0491\u0406\u0407\u0404\u0490]/.test(t) || !/[\u044B\u044D\u044A\u0451\u042B\u042D\u042A\u0401]/.test(t);
    }
    function yearOf(c) { var y = parseInt(String(c.release_date || c.first_air_date || '').slice(0, 4), 10); return y || 0; }
    function kindOf(c) { return (c.media_type === 'tv' || c.name || c.first_air_date || c.number_of_seasons) ? 'tv' : 'movie'; }
    function norm1(m) { var mx = 0, k, o = {}; for (k in m) if (m[k] > mx) mx = m[k]; for (k in m) o[k] = mx ? m[k] / mx : 0; return o; }
    function tasteProfile(seeds) {
        var g = {}, l = {}, d = {}, neg = {}, nn = 0, thrown = [];
        seeds.forEach(function (x) {
            var c = x.c, w = x.w, y = yearOf(c);
            genreIds(c).forEach(function (id) { if (id) g[id] = (g[id] || 0) + w; });
            if (c.original_language) l[c.original_language] = (l[c.original_language] || 0) + w;
            if (y) { var dk = Math.floor(y / 10); d[dk] = (d[dk] || 0) + w; }
        });
        try { thrown = Lampa.Favorite.get({ type: 'thrown' }) || []; } catch (e) {}
        thrown.forEach(function (c) { if (!c) return; nn++; genreIds(c).forEach(function (id) { if (id) neg[id] = (neg[id] || 0) + 1; }); });
        return { g: norm1(g), l: norm1(l), d: norm1(d), neg: neg, nn: nn };
    }
    function tasteOf(c, P) {
        var ids = genreIds(c).filter(Boolean), t = 0, ng = 0, i, y = yearOf(c);
        if (ids.length) { for (i = 0; i < ids.length; i++) { t += P.g[ids[i]] || 0; ng += P.nn >= 3 ? (P.neg[ids[i]] || 0) / P.nn : 0; } t /= ids.length; ng /= ids.length; }
        t += 0.4 * (P.l[c.original_language] || 0) + (y ? 0.3 * (P.d[Math.floor(y / 10)] || 0) : 0);
        return { t: t, neg: ng };
    }
    function qualityOk(r) {
        var vc = r.vote_count || 0, va = r.vote_average || 0;
        if (vc >= 40 && va < 5.8) return false;
        if (vc >= 200 && va < 6.2) return false;
        return true;
    }
    function qualityBonus(r) {
        var va = r.vote_average || 0, vc = r.vote_count || 0;
        return Math.max(-1.5, Math.min(1.5, va - 6.5)) * 0.6 + Math.min(1, Math.log(1 + vc) / Math.log(10) / 4) * 0.5;
    }
    function franKey(c) {
        var t = String(c.title || c.name || c.original_title || c.original_name || '').toLowerCase();
        t = t.split(/[:–—]|\s-\s/)[0].replace(/^(the|a|an)\s+/, '').replace(/[^a-z0-9Ѐ-ӿ\s]/g, ' ').replace(/\s+(\d+|i{1,3}|iv|v|vi{0,3}|ix|x)$/, '').trim();
        var w = t.split(/\s+/).filter(Boolean).slice(0, 2).join(' ');
        return w.length >= 3 ? kindOf(c) + ':' + w : '';
    }
    function rankRecs(score, P, seedTitle) {
        var arr = Object.keys(score).map(function (id) {
            var x = score[id], tt = tasteOf(x.c, P), bs = 0, bk = 0, k;
            for (k in x.by) if (x.by[k] > bs) { bs = x.by[k]; bk = k; }
            x.f = x.n + 3 * tt.t - 3 * tt.neg + qualityBonus(x.c);
            x.bk = bk; x.why = bk && seedTitle[bk] ? seedTitle[bk] : '';
            return x;
        });
        arr.sort(function (a, b) { return b.f - a.f; });
        var seenF = {}, uniq = [];
        arr.forEach(function (x) { var fk = franKey(x.c); if (fk && seenF[fk]) return; if (fk) seenF[fk] = 1; uniq.push(x); });
        var cnt = {}, first = [], rest = [];
        uniq.forEach(function (x) {
            if (first.length < 40 && x.bk) { cnt[x.bk] = (cnt[x.bk] || 0) + 1; if (cnt[x.bk] > 4) { rest.push(x); return; } }
            first.push(x);
        });
        return first.concat(rest);
    }
    function spreadBySeed(arr, n, seedTitle) {
        var by = {}, order = [], used = {}, out = [];
        arr.forEach(function (x) { for (var k in x.by) { if (!seedTitle[k]) continue; if (!by[k]) { by[k] = []; order.push(k); } by[k].push(x); } });
        order.sort(function (a, b) { return by[b][0].f - by[a][0].f; });
        var any = true;
        while (out.length < n && any) {
            any = false;
            order.forEach(function (k) {
                if (out.length >= n) return;
                var l = by[k];
                while (l.length && used[l[0].c.id]) l.shift();
                if (!l.length) return;
                var x = l.shift(); used[x.c.id] = 1; x.bk = k; x.why = seedTitle[k]; out.push(x); any = true;
            });
        }
        return out.concat(arr.filter(function (x) { return !used[x.c.id]; }));
    }
    function withWhy(c, why) {
        if (!why) return c;
        var it = {}, k;
        for (k in c) it[k] = c[k];
        it.params = {
            emit: {
                onCreate: function () {
                    var self = this, ex = arguments[0];
                    safe(function () {
                        var h = htmlOf(self, ex), view = h && h.find('.card__view');
                        if (!view || !view.length || view.find('.lmx-why').length) return;
                        h.addClass('lmx-nofav');
                        view.append('<div class="lmx-why"><i>&#9829;</i><span>Потому что вы лайкнули' + esc(why) + '</span></div>');
                    });
                }
            }
        };
        return it;
    }
    var recsByCaches = {};
    function recsByCall(idx) { return function (call) { recsByBuild(idx, call); }; }
    function recsByBuild(idx, call) {
        var liked = [];
        try { liked = Lampa.Favorite.get({ type: 'like' }) || []; } catch (e) {}
        liked = liked.filter(function (c) { return c && c.id && !isAnimeC(c); });
        var seed = liked[idx];
        if (!seed) return call();
        var skip = {}, k;
        ['history', 'like', 'viewed', 'look', 'thrown'].forEach(function (t) { var m = favIds(t); for (k in m) skip[k] = 1; });
        var key = seed.id + ':' + liked.length, rc = recsByCaches[idx];
        if (rc && rc.key === key && Date.now() - rc.t < 600000) return call(rc.data);
        var kind = kindOf(seed), jobs = [
            { url: kind + '/' + seed.id + '/recommendations', page: 1, w: 3 }, { url: kind + '/' + seed.id + '/recommendations', page: 2, w: 3 },
            { url: kind + '/' + seed.id + '/similar', page: 1, w: 1.5 }
        ], score = {}, left = jobs.length, st = {}, P = tasteProfile(liked.slice(0, 14).map(function (c) { return { c: c, w: 3 }; }));
        st[seed.id] = seed.title || seed.name || '';
        function fin() {
            if (--left > 0) return;
            var ranked = rankRecs(score, P, st).map(function (x) { return x.c; }), out = ranked.slice(0, ROW_MAX);
            if (out.length < 6) return call();
            var fullL = ranked.slice(0, 100), moreL = fullL.length > out.length;
            recsAllBy['seed' + seed.id] = fullL; recsListHook();
            var data = { title: 'Потому что вы лайкнули «' + st[seed.id] + '»', results: out, source: 'tmdb', url: 'lmx://recs/seed' + seed.id, page: 1, more: moreL, total_pages: moreL ? Math.ceil(fullL.length / 20) : 1 };
            recsByCaches[idx] = { key: key, t: Date.now(), data: data };
            call(data);
        }
        jobs.forEach(function (j) {
            tget(j.url, { page: j.page }, function (res) {
                cleanResults(res && res.results, false).forEach(function (r) {
                    if (!r.poster_path || skip[r.id] || !qualityOk(r) || !hasUaText(r)) return;
                    var yr = yearOf(r); if (yr && yr < 2000) return;
                    if (isAnimeC(r)) return;
                    r.media_type = kind;
                    if (!score[r.id]) score[r.id] = { c: r, n: 0, by: {} };
                    score[r.id].n += j.w; score[r.id].by[seed.id] = (score[r.id].by[seed.id] || 0) + j.w;
                });
                fin();
            }, function () { fin(); });
        });
    }
    function recsCall(row) { return function (call) { recsBuild('', call); }; }
    var recsCaches = {};
    function recsBuild(mode, call) {
        {
            var hist = [], liked = [];
            try { hist = Lampa.Favorite.get({ type: 'history' }) || []; } catch (e) {}
            try { liked = Lampa.Favorite.get({ type: 'like' }) || []; } catch (e) {}
            hist = hist.filter(function (c) { return c && c.id; });
            liked = liked.filter(function (c) { return c && c.id; });
            var okSeed = mode === 'anime' ? isAnimeC : mode === 'dorama' ? isDoramaC : function (c) { return !isAnimeC(c); };
            hist = hist.filter(okSeed); liked = liked.filter(okSeed);
            var fromLikes = liked.length > 0;
            if (!fromLikes && !hist.length) return call();
            var rowTitle = fromLikes ? 'Похоже на то, что вам понравилось' : 'Похоже на то, что вы смотрели';
            var skip = {}, k;
            ['history', 'like', 'viewed', 'look', 'thrown'].forEach(function (t) { var m = favIds(t); for (k in m) skip[k] = 1; });
            var seeds = [], viewedMap = favIds('viewed'), thrownMap = favIds('thrown'), seedTitle = {};
            liked = liked.filter(function (c) { return !thrownMap[c.id]; });
            hist = hist.filter(function (c) { return !thrownMap[c.id]; });
            if (fromLikes) {
                var pick = liked.slice(0, 4), rest = liked.slice(4);
                if (rest.length > 10) {
                    var rs = Math.floor(Date.now() / 86400000) + 1;
                    var rnd = function () { rs = (rs * 1664525 + 1013904223) % 4294967296; return rs / 4294967296; };
                    for (var si = rest.length - 1; si > 0; si--) { var sj = Math.floor(rnd() * (si + 1)), st = rest[si]; rest[si] = rest[sj]; rest[sj] = st; }
                    rest = rest.slice(0, 10);
                }
                pick.concat(rest).forEach(function (c) { seeds.push({ c: c, w: viewedMap[c.id] ? 4 : 3 }); });
                hist.slice(0, 3).forEach(function (c) {
                    if (!liked.some(function (l) { return l.id === c.id; })) seeds.push({ c: c, w: 1 });
                });
            } else hist.slice(0, 6).forEach(function (c) { seeds.push({ c: c, w: 1 }); });
            if (!seeds.length) return call();
            var key = mode + (fromLikes ? 'L:' : 'H:') + seeds.map(function (x) { return x.c.id + (x.w === 4 ? 'v' : ''); }).join(',');
            var rcache = recsCaches[mode];
            if (rcache && rcache.key === key && Date.now() - rcache.t < 600000) return call(rcache.data);

            var score = {}, jobs = [], P = tasteProfile(seeds);
            seeds.forEach(function (x, idx) {
                var c = x.c, kind = (c.media_type === 'tv' || c.name || c.first_air_date || c.number_of_seasons) ? 'tv' : 'movie';
                seedTitle[c.id] = c.title || c.name || '';
                jobs.push({ url: kind + '/' + c.id + '/recommendations', page: 1, w: x.w, kind: kind, seed: c.id });
                if (x.w >= 3) jobs.push({ url: kind + '/' + c.id + '/similar', page: 1, w: x.w * 0.5, kind: kind, seed: c.id });
                if (x.w >= 3 && idx < 6) jobs.push({ url: kind + '/' + c.id + '/recommendations', page: 2, w: x.w, kind: kind, seed: c.id });
            });
            var gc = {}, kc = { movie: 0, tv: 0 };
            seeds.forEach(function (x) {
                var c = x.c, g = c.genre_ids || (c.genres || []).map(function (q) { return q && q.id; }) || [];
                kc[(c.media_type === 'tv' || c.name || c.first_air_date || c.number_of_seasons) ? 'tv' : 'movie']++;
                g.forEach(function (id) { if (id) gc[id] = (gc[id] || 0) + x.w; });
            });
            var topG = Object.keys(gc).sort(function (a, b) { return gc[b] - gc[a]; }).slice(0, 2);
            if (mode) {
                var dq = mode === 'anime' ? 'with_genres=16&with_original_language=ja&vote_count.gte=300' : 'with_origin_country=KR&vote_count.gte=200';
                var dbase = 'discover/tv?' + dq + '&sort_by=vote_average.desc&first_air_date.gte=2000-01-01&first_air_date.lte=' + dayStr(0);
                jobs.push({ url: dbase, page: 1, w: 0.3, kind: 'tv' });
                jobs.push({ url: dbase, page: 2, w: 0.3, kind: 'tv' });
            } else if (topG.length) {
                ['movie', 'tv'].forEach(function (kind) {
                    if (!kc[kind]) return;
                    var dk = kind === 'movie' ? 'primary_release_date' : 'first_air_date';
                    var base = 'discover/' + kind + '?with_genres=' + topG.join('%2C') + '&sort_by=vote_average.desc&vote_count.gte=800&' + dk + '.gte=2000-01-01&' + dk + '.lte=' + dayStr(0);
                    jobs.push({ url: base, page: 1, w: 0.3, kind: kind });
                    jobs.push({ url: base, page: 2, w: 0.3, kind: kind });
                });
            }
            var left = jobs.length;
            function fin() {
                if (--left > 0) return;
                var arr = rankRecs(score, P, seedTitle);
                var full = arr.map(function (x) { return x.c; }).slice(0, 150), out = (fromLikes ? spreadBySeed(arr, ROW_MAX, seedTitle) : arr).slice(0, ROW_MAX).map(function (x) { return withWhy(x.c, fromLikes ? x.why : ''); });
                if (!out.length) return call();
                recsAllBy[mode] = full;
                recsListHook();
                var data = { title: rowTitle, results: out, source: 'tmdb', url: 'lmx://recs/' + mode, page: 1, more: true, total_pages: Math.max(2, Math.ceil(full.length / 20)) };
                recsCaches[mode] = { key: key, t: Date.now(), data: data };
                call(data);
            }
            var qi = 0;
            function pump() {
                if (qi >= jobs.length) return;
                var j = jobs[qi++];
                tget(j.url, { page: j.page }, function (res) {
                    cleanResults(res && res.results, false).forEach(function (r) {
                        if (!r.poster_path || skip[r.id] || !qualityOk(r) || !hasUaText(r)) return;
                        var yr = parseInt(String(r.release_date || r.first_air_date || '').slice(0, 4), 10);
                        if (yr && yr < 2000) return;
                        if (mode === 'anime' ? !isAnimeC(r) : mode === 'dorama' ? !isDoramaC(r) : isAnimeC(r)) return;
                        r.media_type = j.kind;
                        if (!score[r.id]) score[r.id] = { c: r, n: 0, by: {} };
                        score[r.id].n += j.w;
                        if (j.seed) score[r.id].by[j.seed] = (score[r.id].by[j.seed] || 0) + j.w;
                    });
                    fin(); pump();
                }, function () { fin(); pump(); });
            }
            for (var w = 0; w < 3; w++) pump();
        }
    }

    var newEpCache = null;
    function newEpBuild(cb) {
        var liked = [];
        try { liked = Lampa.Favorite.get({ type: 'like' }) || []; } catch (e) {}
        var list = liked.filter(function (c) {
            return c && c.id && isAnimeC(c) && (c.media_type === 'tv' || c.name || c.first_air_date || c.number_of_seasons);
        }).slice(0, 40);
        if (!list.length) return cb([]);
        var key = list.map(function (c) { return c.id; }).join(',') + '|' + dayStr(0);
        if (newEpCache && newEpCache.key === key && Date.now() - newEpCache.t < 600000) return cb(newEpCache.data);
        var lo = dayStr(-14), hi = dayStr(0), out = [], qi = 0, left = list.length;
        function fin() {
            if (--left > 0) return;
            out.sort(function (a, b) { return String(b.__ne).localeCompare(String(a.__ne)); });
            newEpCache = { key: key, t: Date.now(), data: out };
            cb(out);
        }
        function pump() {
            if (qi >= list.length) return;
            var c = list[qi++];
            load(c.id, function (j) {
                var d = j && j.last_episode_to_air && j.last_episode_to_air.air_date;
                if (d && d >= lo && d <= hi && j.poster_path && !lastEpSeen(j)) {
                    out.push({ id: j.id, name: j.name, original_name: j.original_name, poster_path: j.poster_path, backdrop_path: j.backdrop_path,
                        overview: j.overview, vote_average: j.vote_average, vote_count: j.vote_count, first_air_date: j.first_air_date,
                        original_language: j.original_language, genre_ids: (j.genres || []).map(function (g) { return g.id; }),
                        media_type: 'tv', __ne: d });
                }
                fin(); pump();
            });
        }
        for (var w = 0; w < 3; w++) pump();
    }

    function makeCall(row) {
        if (row.custom) return function () { return row.custom(); };
        return function () {
            return function (call) {
                var urls = typeof row.urls === 'function' ? row.urls() : [row.url];
                var best = null, i = 0;
                function done() {
                    if (best && best.list.length) {
                        call({ title: row.title, results: best.list.slice(0, ROW_MAX), url: best.url, source: 'tmdb', page: 1, more: true, total_pages: Math.max(best.pages, 2) });
                    } else call();
                }
                function next() {
                    if (i >= urls.length) return done();
                    var url = urls[i++];
                    tget(url, { page: 1 }, function (json) {
                        var list = cleanResults(json && json.results, row.ua);
                        if (list.length && (!best || list.length > best.list.length)) best = { list: list, url: url, pages: json.total_pages || 1 };
                        if (best && best.list.length >= (row.minCount || 1)) return done();
                        next();
                    }, function () { next(); });
                }
                next();
            };
        };
    }

    function initRows() {
        if (rowsStarted) return;
        rowsStarted = true;
        registerServicePage();
        if (!Lampa.ContentRows || !Lampa.ContentRows.add) return;
        ROWS.forEach(function (row) {
            Lampa.ContentRows.add({
                name: row.name,
                title: row.title,
                index: row.index,
                screen: ['main'],
                call: makeCall(row)
            });
        });
    }

    var MAX_PARALLEL = 3;
    var CACHE_MIN = 1440;
    var RE_NATIVE_TV = /^\s*(TV|ТВ)\s*$/i;

    var mem = {}, memKeys = [];
    var queue = [];
    var active = 0;

    function typeOf(d) {
        if (d.media_type === 'tv' || d.media_type === 'movie') return d.media_type;
        return (d.name || d.first_air_date || d.number_of_seasons) ? 'tv' : 'movie';
    }
    function fmtFull(s) {
        var p = String(s || '').split('-');
        return p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : '';
    }
    function fmtShort(s) {
        var p = String(s || '').split('-');
        return p.length === 3 ? p[2] + '.' + p[1] : '';
    }
    function code(s, e) {
        return 'С' + s + 'Е' + e;
    }
    function sizeLabel(st) {
        return code(st.s, st.e);
    }
    function airedStats(j) {
        var last = j && j.last_episode_to_air;
        if (!last || !(last.season_number > 0)) return null;
        var eps = last.episode_number || 0;
        (j.seasons || []).forEach(function (x) {
            if (x.season_number > 0 && x.season_number < last.season_number) eps += x.episode_count || 0;
        });
        return eps > 0 ? { s: last.season_number, e: eps } : null;
    }
    function fmtDur(min) {
        min = Math.round(min);
        if (min < 60) return min + ' мин';
        var h = Math.floor(min / 60), m = min % 60;
        return h + ' ч' + (m ? ' ' + m + ' мин' : '');
    }
    function dayDiff(dateStr) {
        var p = String(dateStr || '').split('-');
        if (p.length !== 3) return null;
        var t = new Date();
        var a = new Date(t.getFullYear(), t.getMonth(), t.getDate());
        var b = new Date(+p[0], +p[1] - 1, +p[2]);
        if (isNaN(b.getTime())) return null;
        return Math.round((b - a) / 86400000);
    }
    function plural(n, one, few, many) {
        var a = n % 10, b = n % 100;
        if (a === 1 && b !== 11) return one;
        if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
        return many;
    }
    function rel(dateStr) {
        var n = dayDiff(dateStr);
        if (n === null || n < 0 || n > 90) return fmtFull(dateStr);
        if (n === 0) return 'сегодня';
        if (n === 1) return 'завтра';
        return 'через' + n + ' ' + plural(n, 'день', 'дня', 'дней');
    }
    function ratingColor(v) {
        if (v >= 7.5) return 'rgba(46,158,91,.95)';
        if (v >= 6.5) return 'rgba(140,160,30,.95)';
        if (v >= 5.5) return 'rgba(224,123,32,.95)';
        return 'rgba(192,57,43,.95)';
    }

    function lastEpSeen(j) {
        try {
            var last = j && j.last_episode_to_air;
            if (!last || !(last.season_number > 0) || !(last.episode_number > 0)) return false;
            var w = watchProgress(j);
            if (!w || !w.s) return false;
            if (w.s > last.season_number) return true;
            if (w.s === last.season_number) return w.e > last.episode_number || (w.e === last.episode_number && w.pct >= 85);
        } catch (e) {}
        return false;
    }
    function tvMark(j) {
        var n = j.next_episode_to_air ? dayDiff(j.next_episode_to_air.air_date) : null;
        var l = j.last_episode_to_air ? dayDiff(j.last_episode_to_air.air_date) : null;
        var seen = (l !== null && l <= 0 && l >= -7) && lastEpSeen(j);
        if (n === 0 || (l === 0 && !seen)) return { t: 'Сегодня', c: 'next' };
        if (l !== null && l < 0 && l >= -7 && !seen) return { t: 'Новая серия', c: 'next' };
        var fa = dayDiff(j.first_air_date);
        var planned = j.status === 'Planned' || j.status === 'In Production' || j.status === 'Pilot';
        if ((fa !== null && fa > 0) || (planned && !j.last_episode_to_air && fa === null)) return { t: 'Скоро', c: 'soon' };
        return null;
    }
    function movieMark(d) {
        var n = dayDiff(d.release_date);
        if (n !== null && n <= 0 && n >= -30) return { t: 'Новинка', c: 'new' };
        if (n !== null && n > 0) return { t: 'Скоро', c: 'soon' };
        return null;
    }
    // ===== CSS =====
    function likeCss(pre, col) {
        var sel = pre + '.full-start-new__buttons .full-start__button.lmx-liked:not(#lmx-x)';
        return sel + ',' + sel + ' span{color:' + col + ' !important}' +
            sel + ' svg{color:' + col + ' !important;stroke:' + col + ' !important}' +
            sel + ' svg path{fill:' + col + ' !important;stroke:' + col + ' !important}';
    }
    function timetableCss() {
        if (!getBool('lmx_timetable', true)) return '';
        return [
            '.timetable{padding:0 1.5em}',
            '.timetable__item:before{top:.28em;left:.28em;right:.28em;bottom:.28em;border-radius:1em;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);transition:background .18s ease,border-color .18s ease,box-shadow .18s ease,transform .18s ease}',
            '.timetable__inner{padding-bottom:100%}',
            '.timetable__item--any:before{background:linear-gradient(155deg,rgba(255,196,110,.22),rgba(255,255,255,.08) 62%);border-color:rgba(255,206,130,.32)}',
            '.timetable__item:first-child:before{border-color:#ffc46e;box-shadow:0 0 0 .1em rgba(255,196,110,.35)}',
            '.timetable__item:first-child .timetable__date:after{content:"сегодня";margin-left:.55em;padding:.05em .55em;border-radius:99em;background:#ffc46e;color:#1a1306;font-size:.78em;font-weight:800;letter-spacing:.02em;text-transform:uppercase;vertical-align:.08em}',
            '.timetable__date{top:1.05em;left:1.15em;right:1em;font-size:.92em;font-weight:700;opacity:.88;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.timetable__body{left:1.15em;right:1.05em;bottom:1.1em}',
            '.timetable__preview{margin-bottom:.7em}',
            '.timetable__preview>img{display:block;width:6.6em;max-width:100%;height:3.7em;object-fit:cover;margin-bottom:.4em;border-radius:.6em;background:rgba(255,255,255,.08)}',
            '.timetable__preview>div{font-size:.82em;opacity:.78;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.timetable__body>div{font-weight:700;line-height:1.5}',
            '.timetable__body>div>span{width:.32em;height:.95em;margin-right:.55em;border-radius:99em;margin-bottom:-.14em}',
            '.timetable__item.focus{color:#111;z-index:2}',
            '.timetable__item.focus:before{background:#fff;border-color:#fff;transform:scale(1.035);box-shadow:0 .5em 1.6em rgba(0,0,0,.45)}',
            '.timetable__item.focus .timetable__date:after{background:#111;color:#ffc46e}'
        ].join('\n');
    }
    function buildCss() {
        var fs = SIZES[getStr('lmx_size', 'm')] || SIZES.m;
        var cDone = COLORS[getStr('lmx_c_done', 'green')] || COLORS.green;
        var cSoon = COLORS[getStr('lmx_c_soon', 'blue')] || COLORS.blue;
        var nNext = RGB[getStr('lmx_c_next', 'orange')] ? getStr('lmx_c_next', 'orange') : 'orange';
        var nSoon = RGB[getStr('lmx_c_soon', 'blue')] ? getStr('lmx_c_soon', 'blue') : 'blue';

        function markCss(cls, nm) {
            return '.lmx-pill.lmx-m-' + cls + '{background:' + rgba(nm, 0.62) + ';border:1px solid ' + rgba(nm, 0.9) + '}';
        }

        return '' +
            '.lmx-box{position:absolute;left:.4em;top:.4em;z-index:3;pointer-events:none}' +
            '.lmx-tr{position:absolute;right:.4em;top:.4em;z-index:3;pointer-events:none;display:flex;flex-direction:column;align-items:flex-end}' +
            '.lmx-uaq{position:absolute;left:0;top:34%;z-index:3;pointer-events:none;display:flex;flex-direction:column;align-items:center;font-size:' + (0.72 * fs).toFixed(2) + 'em;font-weight:800;line-height:1;padding:.7em .4em;border-radius:0 .7em .7em 0;color:#fff;background:rgba(8,9,18,.85);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16)}' +
            '.lmx-uaq b{font-weight:inherit;writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:.08em}.lmx-uaq i{display:block;width:1.1em;height:1.1em;border-radius:50%;margin-bottom:.55em;flex:none;background:linear-gradient(180deg,#2f6fd6 50%,#f2c200 50%)}' +
            '.lmx-tr>*{flex:none}' +
            '.lmx-uaqc{display:none}' +
            '.lmx-hero__uaq{display:inline-flex;align-items:center;font-weight:700;line-height:1;letter-spacing:.03em;color:inherit;white-space:nowrap}' +
            '.lmx-hero__uaq em{font-style:normal;display:inline-flex;font-weight:800}.lmx-hero__uaq em span:first-child{color:#3b8cff}.lmx-hero__uaq em span:last-child{color:#ffd62e}' +
            '.lmx-hero__uaq s{width:1px;height:.95em;margin:0 .5em;background:currentColor;opacity:.45}.lmx-hero__uaq b{font-weight:inherit}' +
            '.lmx-hero__kick .lmx-hero__uaq{margin-left:.9em;padding-left:.9em;border-left:1px solid rgba(255,255,255,.4);color:#fff;letter-spacing:.18em;text-transform:uppercase;vertical-align:baseline}' +
            '.lmx-hist__uaq{position:absolute;right:0;top:.12em;font-size:.82em;text-shadow:0 1px 3px rgba(0,0,0,.7)}.lmx-hasuaq .lmx-hist__t{padding-right:6.5em}' +
            '.lmx-hero__kick .lmx-hero__uaq s{display:none}.lmx-hero__kick .lmx-hero__uaq b{margin-left:.55em}' +
            '.lmx-pill{display:inline-block;font-size:' + fs + 'em;line-height:1;padding:.32em .6em;border-radius:.6em;color:#fff;font-weight:600;white-space:nowrap;background:rgba(0,0,0,.62)}' +
            markCss('next', nNext) + markCss('new', 'gray') + markCss('soon', nSoon) +
            '.lmx-ord__row{display:flex;align-items:center;padding:.45em .7em;border-radius:.5em}' +
            '.lmx-ord__row:nth-child(even){background:rgba(255,255,255,.06)}' +
            '.lmx-ord__name{flex:1;min-width:0;font-size:1.15em}' +
            '.lmx-ord__sub{display:block;font-size:.7em;opacity:.55;margin-top:.15em}' +
            '.lmx-ord__btn{display:flex;align-items:center;justify-content:center;width:2.6em;height:2.6em;margin-left:.3em;border-radius:.5em}' +
            '.lmx-ord__btn.focus{background:#fff;color:#000}' +
            '.lmx-ord__off{opacity:.5}' +
            '.lmx-ord__reset{margin-top:.8em;padding:.8em 1em;border-radius:.5em;text-align:center;background:rgba(255,255,255,.08)}' +
            '.lmx-ord__reset.focus{background:#fff;color:#000}' +
            '.lmx-bh{display:none !important}' +
            '.lmx-ic{color:var(--lmx-bc)}' +
            '.lmx-ic svg{color:var(--lmx-bc)}' +
            '.lmx-ic svg[fill]:not([fill=none]),.lmx-ic svg [fill]:not([fill=none]){fill:var(--lmx-bc) !important}' +
            '.lmx-ic svg[stroke]:not([stroke=none]),.lmx-ic svg [stroke]:not([stroke=none]){stroke:var(--lmx-bc) !important}' +
            'html body .full-start-new__buttons .full-start__button.lmx-m1:not(#lmx-x){width:3.2em !important;min-width:0 !important;height:3.2em !important;padding:0 !important;border-radius:50% !important;justify-content:center;font-size:.95em !important}' +
            'html body .full-start-new__buttons .full-start__button.lmx-m1:not(#lmx-x) span{display:none !important}' +
            'html body .full-start-new__buttons .full-start__button.lmx-m2:not(#lmx-x),html body .full-start-new__buttons .full-start__button.lmx-m3:not(#lmx-x){width:auto !important;min-width:0 !important;height:3.2em !important;padding:0 1.2em !important;border-radius:2em !important;justify-content:center;font-size:.95em !important}' +
            'html body .full-start-new__buttons .full-start__button.lmx-m2:not(#lmx-x) span,html body .full-start-new__buttons .full-start__button.lmx-m3:not(#lmx-x) span{display:inline !important;white-space:nowrap;font-size:1em !important;opacity:1 !important;visibility:visible !important;max-width:none}' +
            'html body .full-start-new__buttons .full-start__button.lmx-m2:not(#lmx-x) span{max-width:6.5em !important;overflow:hidden;text-overflow:ellipsis}' +
            'html body.lmx-ci .full-start-new__buttons .full-start__button:not(.lmx-m2):not(.lmx-m3):not(.lmx-primary):not(.button--priority):not(.lmx-edit):not(.lmx-folder):not(:first-child):not(#lmx-x){width:3.2em !important;min-width:0 !important;height:3.2em !important;padding:0 !important;border-radius:50% !important;justify-content:center;font-size:.95em !important}' +
            'html body.lmx-ci .full-start-new__buttons .full-start__button:not(.lmx-m2):not(.lmx-m3):not(.lmx-primary):not(.button--priority):not(.lmx-edit):not(.lmx-folder):not(:first-child):not(#lmx-x) span{display:none !important}' +
            'html body .full-start-new__buttons .full-start__button.button--priority:not(.lmx-m1):not(.lmx-edit):not(#lmx-x){width:auto !important;min-width:0 !important}' +
            'html body .full-start-new__buttons .full-start__button.button--priority:not(.lmx-m1):not(.lmx-edit):not(#lmx-x) span{display:inline !important}' +
            'body.lmx-hold .full-start-new__buttons:not(.lmx-ready){opacity:0;animation:lmxrev .01s 1.6s forwards}' +
            '@keyframes lmxrev{to{opacity:1}}' +
            'body.lmx-all .full-start-new__buttons{flex-wrap:wrap !important;row-gap:.6em;max-width:100%}' +
            'html body.lmx-all .full-start-new__buttons .full-start__button.lmx-m3 span{max-width:14em !important;overflow:hidden;text-overflow:ellipsis}' +
            'html body .lmx-renamed > *:not(svg):not(img):not(#lmx-x){display:none !important}' +
            '.lmx-renamed::after{content:attr(data-lmx-name);white-space:nowrap;display:inline-block;line-height:1.2;vertical-align:middle;font-size:inherit;transform:translateZ(0)}' +
            '.lmx-renamed.lmx-m1::after{display:none}' +
            '.lmx-renamed.lmx-m2::after{display:inline-block;max-width:6.5em;overflow:hidden;text-overflow:ellipsis}' +
            'body.lmx-hbo .lmx-renamed:not(.lmx-m2):not(.lmx-m3):not(.lmx-primary)::after,body.lmx-prem .lmx-renamed:not(.lmx-m2):not(.lmx-m3):not(.lmx-primary)::after,body.lmx-apple .lmx-renamed:not(.lmx-m2):not(.lmx-m3):not(.lmx-primary)::after{display:none}' +
            '.lmx-iconed > svg:not(.lmx-ico),.lmx-iconed > img{display:none !important}' +
            '.lmx-edit{opacity:.75}' +
            '.lmx-virt img{width:1.6em;height:1.6em;object-fit:contain}' +
            '.lmx-be__row{padding:.55em .7em}' +
            '.lmx-be__ico{width:2em;height:2em;margin-right:.8em;display:flex;align-items:center;justify-content:center;flex:none}' +
            '.lmx-be__ico svg{width:1.6em;height:1.6em}' +
            '.lmx-be__big{display:flex;align-items:center;padding:.9em 1em;margin:.45em 0;border-radius:.6em;background:rgba(255,255,255,.09);font-size:1.1em}' +
            '.lmx-be__big.focus{background:#fff;color:#000}' +
            '.lmx-be__bi{width:2em;margin-right:.7em;display:flex;justify-content:center}' +
            '.lmx-be__look b{font-weight:600}' +
            '.lmx-be__reset{background:#4a2528;justify-content:center;margin-top:1em}' +
            '.lmx-be__reset.focus{background:#fff;color:#4a2528}' +
            '.lmx-be__save{background:#27b565;justify-content:center;font-weight:700;letter-spacing:.03em}' +
            '.lmx-be__save.focus{background:#fff;color:#1a7a43}' +
            '.lmx-ord__btn[data-act=mode]{font-weight:700;font-size:1.05em}' +
            '.lmx-head-moved{display:none !important}' +
            '.lmx-info{display:flex;flex-wrap:wrap;gap:.5em;margin:.8em 0}' +
            '.lmx-ip{font-size:1.1em;line-height:1;padding:.45em .8em;border-radius:.6em;background:rgba(255,255,255,.12);color:#fff}' +
            '.lmx-ip.lmx-next{background:rgba(255,255,255,.12)}' +
            '.lmx-ip.lmx-done{background:' + cDone + '}' +
            '.lmx-ip.lmx-soon{background:rgba(255,255,255,.12)}' +
            '.lmx-ip.lmx-bad{background:' + COLORS.red + '}' +
            '.lmx-ip.lmx-studio{font-weight:700;letter-spacing:.02em}' +
            ''+
                '.lmx-tr .lmx-pill,.lmx-box .lmx-pill{font-size:' + (0.72 * fs).toFixed(2) + 'em;padding:.28em .6em;border-radius:.55em;font-weight:500;letter-spacing:.02em}' +
                '.lmx-box .lmx-pill{background:rgba(30,32,40,.7);border:1px solid rgba(255,255,255,.32)}' +
                '.card .card__title,.card .card__age,.card .card__vote{display:none !important}' +
                '.lmx-sel{display:none;position:absolute;z-index:6;pointer-events:none;box-sizing:border-box;border:.16em solid #fff;border-radius:1em;opacity:0}' +
                '.lmx-sel.on{opacity:1}' +
                '.card--lmxhist .lmx-sel,.card--lmxstudio .lmx-sel{border-radius:0}' +
                '.lmx-why{position:absolute;left:50%;top:2.9em;transform:translateX(-50%);max-width:90%;display:flex;align-items:center;gap:.4em;padding:.28em .75em;border-radius:99em;background:rgba(10,12,18,.62);border:1px solid rgba(255,255,255,.14);color:#fff;font-size:.66em;line-height:1.2;font-weight:700;letter-spacing:.01em;pointer-events:none;z-index:3;box-sizing:border-box}' +
                '.lmx-why{transition:opacity .15s}.card:not(.focus):not(.hover) .lmx-why{opacity:0}.card.lmx-nofav .card__icons{display:none !important}' +
                '.lmx-why i{font-style:normal;color:#ff5d73;font-size:1.05em;flex:0 0 auto}' +
                '.lmx-why span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}' +
                '.card--lmxhist{width:23em !important}' +
                '.card--lmxhist .card__view{height:12.9em !important;padding-bottom:0 !important;border-radius:1em;overflow:hidden;position:relative;background-repeat:no-repeat !important;background-size:cover !important;background-position:center !important}' +
                '.card--lmxhist > *:not(.card__view):not(.lmx-sel),.card--lmxhist .card__view > *:not(.lmx-hist__shade):not(.lmx-hist__text):not(.lmx-hist__bar):not(.lmx-tr):not(.lmx-box){display:none !important}' +
                '.lmx-hist__shade{position:absolute;left:0;right:0;bottom:0;height:80%;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.6) 45%,rgba(0,0,0,0) 100%)}' +
                '.lmx-hist__text{position:absolute;left:1em;right:1em;bottom:1.15em;color:#fff;z-index:2;text-shadow:0 1px 3px rgba(0,0,0,.7)}' +
                '.lmx-hist__t{font-size:1.05em;font-weight:700;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
                '.lmx-hist__m{display:flex;gap:1em;font-size:.85em;line-height:1.3;margin-top:.4em}' +
                'body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .card--lmxhist.focus .card__view{box-shadow:0 0 0 .22em #fff !important}' +
                'body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .card--lmxhist.focus .card__view::after{display:none !important}' +
                '.lmx-hist__bar{position:absolute;left:0;right:0;bottom:0;height:.36em;background:rgba(255,255,255,.3);z-index:3}' +
                '.lmx-hist__bar i{display:block;height:100%;background:#fff}' +
                '.card .card__quality,.card .card__type,.card .card__marker{display:none !important}' +
                'html{background:#0b0b0d !important}' +
                'body{background:linear-gradient(180deg,#1d1e22 0%,#131316 45%,#0b0b0d 100%) fixed !important}' +
                '.background{display:none !important}' +
                '.activity,.activity__body,.wrap{background:transparent}' +
                'body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .settings__content,body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .selectbox__content,body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .modal__content{background:#17181c !important}' +
                'body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .menu,body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .wrap__left{background:transparent !important;box-shadow:none !important;border:0 !important}' +
                '.lmx-cin{position:absolute;left:0;right:0;bottom:0;padding:2.2em .7em .6em;color:#fff;z-index:2;pointer-events:none;border-radius:0 0 1em 1em;' +
                    'background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.7) 45%,rgba(0,0,0,0) 100%)}' +
                '.lmx-cin__g{font-size:' + (0.72 * fs).toFixed(2) + 'em;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
                '.lmx-cin__t{font-size:' + (1.15 * fs).toFixed(2) + 'em;font-weight:600;line-height:1.15;margin:.15em 0 .35em;max-height:3.5em;overflow:hidden}' +
                '.lmx-cin__r{display:flex;justify-content:space-between;align-items:center;font-size:' + (0.9 * fs).toFixed(2) + 'em}' +
                '.lmx-cin__v i{font-style:normal}.lmx-cin__y{opacity:.85}' +
                '.card .card-watched{top:2.8em !important;bottom:auto !important;left:.5em !important;right:.5em !important;z-index:5;font-size:.8em}' +
            (getStr('lmx_card_size', 'm') !== 'm' ?
                '.items-line .card:not(.card--lmxhero):not(.card--lmxstudio){width:' + (getStr('lmx_card_size', 'm') === 'xl' ? '19.5em' : '17em') + ' !important}' : '') +
            fullCss() +
            '.card--lmxstudio.focus .card__view{box-shadow:0 0 0 .22em #fff !important}' +
            '.card--lmxhero,.card--lmxhero.focus,.card--lmxhero.hover{transform:none !important;animation:none !important}' +
            '.card--lmxhero .card__view,.card--lmxhero.focus .card__view,.card--lmxhero.hover .card__view{transform:none !important;box-shadow:none !important;transition:none !important}' +
            '.card--lmxhero.focus .card__view::after,.card--lmxstudio.focus .card__view::after{display:none !important}' +
            '.lmx-hero__o{font-size:.85em;opacity:.85;margin-top:.35em;line-height:1.3;max-height:2.7em;overflow:hidden}' +
            '.card--lmxhero{width:' + (getStr('lmx_card_size', 'm') === 'xl' ? '50em' : getStr('lmx_card_size', 'm') === 'l' ? '45em' : '40em') + ' !important}' +
            '.card--lmxhero .card__view{padding-bottom:0 !important;height:' + (getStr('lmx_card_size', 'm') === 'xl' ? '25em' : getStr('lmx_card_size', 'm') === 'l' ? '22.5em' : '20em') + ';background-size:cover;background-position:center;border-radius:.8em;overflow:hidden;position:relative}' +
            'body .noty{left:50%;right:auto;bottom:2.4em;max-width:70vw;border-radius:.8em;background:rgba(24,26,34,.96);color:#fff;border-left:.35em solid #65eaa7;box-shadow:0 .6em 1.6em rgba(0,0,0,.5);transform:translate(-50%,200%)}' +
            'body .noty--visible{transform:translate(-50%,0)}' +
            'body .noty__body{padding:.8em 1.6em;text-align:left}' +
            'body .noty__text{font-size:1.1em;font-weight:600}' +
            '.card--lmxhero.lmx-far{visibility:hidden}' +
            '.lmx-hero-line:not(.lmx-mini) .card--lmxhero:not(.lmx-far){will-change:transform}' +
            '.lmx-hero-line:not(.lmx-mini) .card--lmxhero:not(.lmx-far) .lmx-hero__text{will-change:opacity}' +
            'html body .full-start__button.button--book.lmx-bk-off path{fill:transparent !important}' +
            likeCss('html body ', '#fff') +
            likeCss('html body.lmx-hbo ', '#9b8cff') +
            likeCss('html body.lmx-apple ', 'rgb(var(--lmx-acc,143,155,255))') +
            '#lmx-cinema{position:fixed;left:0;top:0;right:0;bottom:0;z-index:1200;display:flex;align-items:center;justify-content:center;gap:3em;padding:0 8%;background:linear-gradient(90deg,rgba(6,8,16,.93),rgba(6,8,16,.78));color:#fff;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .6s ease,visibility 0s linear .6s}' +
            'body.lmx-cinema #lmx-cinema{opacity:1;visibility:visible;transition:opacity .6s ease}' +
            '#lmx-cinema .lmx-cin-p{height:62vh;max-width:30vw;object-fit:cover;border-radius:1.2em;box-shadow:0 1em 2.4em rgba(0,0,0,.6);flex:none}' +
            '#lmx-cinema .lmx-cin-b{max-width:46vw}' +
            '#lmx-cinema .lmx-cin-k{font-size:1.1em;letter-spacing:.3em;text-transform:uppercase;opacity:.6;margin-bottom:.8em}' +
            '#lmx-cinema .lmx-cin-t{font-size:3em;font-weight:800;line-height:1.1;margin-bottom:.4em}' +
            '#lmx-cinema .lmx-cin-m{font-size:1.3em;opacity:.8;margin-bottom:1em}' +
            '#lmx-cinema .lmx-cin-d{font-size:1.3em;line-height:1.5;opacity:.85;display:-webkit-box;-webkit-line-clamp:7;-webkit-box-orient:vertical;overflow:hidden}' +
            '.lmx-hero-line{position:relative}.lmx-hero-line .lmx-dots{z-index:3}' +
            '.lmx-hero__shade{position:absolute;left:0;right:0;bottom:0;height:70%;background:linear-gradient(to top,rgba(0,0,0,.85),rgba(0,0,0,0))}' +
            '.lmx-hero__text{position:absolute;left:1em;right:1em;bottom:.8em;color:#fff}' +
            '.lmx-hero__title{font-size:1.5em;font-weight:600;line-height:1.15;margin-bottom:.35em}' +
            '.lmx-hero__meta{display:flex;gap:.6em;font-size:1em;opacity:.95;align-items:center}' +
            '.lmx-hero__v{display:inline-flex;align-items:center;gap:.3em;background:rgba(0,0,0,.62);padding:.2em .6em;border-radius:.4em;font-weight:700;-webkit-text-fill-color:#fff}' +
            '.lmx-hero__v i{-webkit-text-fill-color:currentColor;font-style:normal}' +
            '.lmx-hero__tag{display:inline-block;padding:.2em .65em;border-radius:.4em;font-weight:700;font-size:.9em;color:#fff;white-space:nowrap}' +
            '.lmx-hero__tag.lmx-t-soon{background:' + cSoon + '}' +
            '.lmx-hero__tag.lmx-t-new{background:' + cDone + '}' +
            '.lmx-hero__tag.lmx-t-trend{background:#e5484d}' +
            '.card--lmxstudio{width:13em !important}' +
            '.card--lmxstudio .card__view{padding-bottom:0 !important;height:6.5em;border-radius:.8em;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}' +
            '.lmx-studio__logo{width:3.6em;height:3.6em;border-radius:.6em;object-fit:cover}' +
            '.lmx-studio__name{color:#fff;font-size:1.3em;font-weight:600;text-align:center;padding:0 .4em}';
    }
    function heroPhoneCss() {
        var L = 'html body .items-line.lmx-hero-line ', X = ':not(#lmx-x)';
        var K = L + '.lmx-hero__acts' + X + ' ';
        var C = L + '.card--lmxhero' + X + ',' + L + '.card--lmxhero.focus' + X + ',' + L + '.card--lmxhero.hover' + X;
        var V = L + '.card--lmxhero' + X + ' .card__view,' + L + '.card--lmxhero.focus' + X + ' .card__view,' + L + '.card--lmxhero.hover' + X + ' .card__view';
        return K + '.lmx-hero__circ{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:2.6em;height:2.6em;margin:0 0 0 .8em;border-radius:50%;background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.3);color:#fff;font-size:1.1em;font-weight:500;line-height:1}' +
            L + '.lmx-hero__acts' + X + ':has(.lmx-hero__circ){flex-direction:row !important;justify-content:flex-start !important;align-items:center}' +
            '@media (max-width:760px){' +
            L + '.scroll__content' + X + '{padding-left:1em !important;padding-right:1em !important}' +
            C + '{width:calc(100vw - 4.5em) !important;margin-left:0 !important;margin-right:.8em !important}' +
            L + '.card--lmxhero:last-child' + X + '{margin-right:0 !important}' +
            V + '{height:calc((100vw - 4.5em) * .5625) !important;border-radius:1em !important}' +
            L + '.scroll,' + L + '.scroll__content,' + L + '.scroll__body' + X + '{touch-action:pan-y !important}' +
            L + '.scroll__body' + X + '{display:grid !important;transform:none !important;transition:none !important;width:100% !important}' +
            C + '{width:100% !important;margin:0 !important;grid-area:1/1;opacity:0 !important;visibility:visible !important;transition:opacity .35s ease-in-out !important;pointer-events:none;will-change:opacity;z-index:1}' +
            L + '.card--lmxhero.lmx-pcur' + X + ',' + L + '.card--lmxhero.lmx-pcur.focus' + X + ',' + L + '.card--lmxhero.lmx-pcur.hover' + X + '{opacity:1 !important;transition:opacity .35s ease-in-out !important;pointer-events:auto;z-index:2}' +
            L + '.lmx-hero__text' + X + '{opacity:1 !important;transition:none !important}' +
            V + '{height:min(calc((100vw - 2em) * 1.58),74vh) !important;border-radius:1.3em !important;background-size:cover !important;background-position:center top !important;background-repeat:no-repeat !important}' +
            L + '.lmx-hero__shade' + X + '{height:100% !important;background:linear-gradient(to top,#000 0%,rgba(0,0,0,.88) 24%,rgba(0,0,0,.35) 46%,rgba(0,0,0,0) 64%) !important}' +
            L + '.lmx-hero__text' + X + '{left:0 !important;right:0 !important;bottom:1.1em !important;max-width:none !important;padding:0 1em !important;text-align:center !important;align-items:center !important;display:flex !important;flex-direction:column !important}' +
            L + '.lmx-hero__title' + X + '{font-size:1.9em !important;font-weight:800 !important;line-height:1.08 !important;margin:0 0 .3em !important;text-align:center !important}' +
            L + '.lmx-hero__meta' + X + '{justify-content:center !important;flex-wrap:wrap !important;font-size:.9em !important;margin:0 !important}' +
            L + '.lmx-hero__o' + X + '{display:none !important}' +
            L + '.lmx-hero__acts' + X + '{display:flex !important;justify-content:center !important;align-items:center !important;margin-top:.9em !important}' +
            L + '.lmx-pdots' + X + '{display:flex;gap:.5em;align-items:center;justify-content:center;margin-top:1em}' +
            L + '.lmx-pdots i' + X + '{display:block;position:relative;overflow:hidden;width:.42em;height:.42em;border-radius:99em;background:rgba(255,255,255,.4)}' +
            L + '.lmx-pdots i.on' + X + '{width:2em;background:rgba(255,255,255,.3)}' +
            L + '.lmx-pdots i.on::after' + X + '{content:"";position:absolute;left:0;top:0;bottom:0;right:0;background:#fff;transform-origin:left center;transform:scaleX(0)}' +
            L + '.card--lmxhero.lmx-pcur .lmx-pdots i.on::after' + X + '{animation:lmxpfill 4.5s linear forwards}' +
            '@keyframes lmxpfill{from{transform:scaleX(0)}to{transform:scaleX(1)}}' +
            L + '.lmx-hero__btn' + X + '{display:inline-flex !important;align-items:center;justify-content:center;min-width:11em;padding:.8em 1.6em;border-radius:99em;background:#f4f4f6 !important;color:#111 !important;font-weight:700;font-size:1.05em}' +
        '}';
    }
    function miniCss() {
        var M = 'html body .items-line.lmx-mini ', X = ':not(#lmx-x)';
        var sz = getStr('lmx_card_size', 'm'), W = sz === 'xl' ? '50em' : sz === 'l' ? '45em' : '40em', H = sz === 'xl' ? '25em' : sz === 'l' ? '22.5em' : '20em';
        function view(L, h) { return L + '.card--lmxhero' + X + ' .card__view,' + L + '.card--lmxhero.focus' + X + ' .card__view,' + L + '.card--lmxhero.hover' + X + ' .card__view{height:' + h + ' !important}'; }
        var S = 'html body .items-line.lmx-mini--svc ', D = 'html body .items-line.lmx-mini--def ';
        return '' +
            S + '.card--lmxhero' + X + '{width:58vw !important;margin-left:0 !important;margin-right:1.2em !important}' + view(S, '25vw') +
            '@media (min-width:761px){' + D + '.card--lmxhero' + X + '{width:' + W + ' !important;margin-left:0 !important;margin-right:1.2em !important}' + view(D, H) + '}' +
            M + '.card--lmxhero' + X + ' .card__view,' + M + '.card--lmxhero.focus' + X + ' .card__view,' + M + '.card--lmxhero.hover' + X + ' .card__view{border-radius:1.2em !important;overflow:hidden;background-repeat:no-repeat !important;background-size:cover !important;background-position:center 20% !important}' +
            M + '.lmx-hero__shade' + X + '{height:100% !important;background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.35) 38%,rgba(0,0,0,0) 70%),linear-gradient(90deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,0) 60%) !important}' +
            M + '.lmx-hero__text' + X + '{left:1.8em !important;right:auto !important;bottom:1.7em !important;max-width:62% !important}' +
            M + '.lmx-hero__title' + X + '{font-size:1.9em !important;font-weight:700 !important;line-height:1.1 !important;margin-bottom:.3em !important}' +
            M + '.lmx-hero__meta' + X + '{font-size:.95em !important}' +
            M + '.lmx-hero__o' + X + '{font-size:.92em !important;max-height:2.8em !important;margin-top:.4em !important}' +
            M + '.lmx-hero__acts' + X + '{display:none !important}' +
            M + '.items-line__head' + X + ',' + M + '.items-line__title' + X + '{display:block !important}' +
            M + '.items-line__head' + X + '{margin-bottom:.4em}' +
            M + '.card--lmxhero' + X + ',' + M + '.card--lmxhero.focus' + X + ',' + M + '.card--lmxhero.hover' + X + '{transform:none !important;animation:none !important}' +
            M + '.card--lmxhero' + X + ' .card__view,' + M + '.card--lmxhero.focus' + X + ' .card__view,' + M + '.card--lmxhero.hover' + X + ' .card__view{transform:none !important;box-shadow:none !important;transition:none !important;animation:none !important}' +
            M + '.card--lmxhero' + X + ' .card__view::after,' + M + '.card--lmxhero.focus' + X + ' .card__view::after,' + M + '.card--lmxhero.hover' + X + ' .card__view::after{display:none !important}' +
            M + '.scroll__body{transition:transform .9s cubic-bezier(.4,0,.2,1) !important}' +
            M + '.lmx-dots' + X + '{display:none !important}';
    }
    function detailCss(scope) {
        var D = scope || 'body.lmx-full ';
        return '' +
            D + '.full-episode{border-radius:1em}' +
            D + '.full-episode__img{border-radius:1em;overflow:hidden;background:linear-gradient(135deg,#26272e,#16171b)}' +
            D + '.full-episode__img img{object-fit:cover}' +
            D + '.full-episode__num{position:absolute;left:.6em;top:.6em;z-index:2;padding:.1em .6em;border-radius:.5em;background:rgba(0,0,0,.62);font-size:.95em;font-weight:700;line-height:1.5}' +
            D + '.full-episode__name{font-weight:600;margin-top:.5em}' +
            D + '.full-episode__date{opacity:.6;font-size:.9em}' +
            D + '.full-episode--next,' + D + '.full-episode--next .full-episode__img{border:0 !important;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}' +
            D + '.full-episode.focus::after,' + D + '.full-episode.focus .full-episode__img::after{border-radius:1em}' +
            D + '.full-person:not(.full-person--small){display:flex;flex-direction:column;align-items:center;text-align:center;width:9.5em !important;margin-right:1.2em;padding:.4em .2em;border-radius:1em}' +
            D + '.full-person:not(.full-person--small) .full-person__photo{width:6.4em !important;height:6.4em !important;border-radius:50% !important;overflow:hidden;margin:0 0 .6em 0 !important;background:#25262c}' +
            D + '.full-person:not(.full-person--small) .full-person__photo img{width:100%;height:100%;object-fit:cover;border-radius:50%}' +
            D + '.full-person:not(.full-person--small) .full-person__body{margin:0 !important;width:100%}' +
            D + '.full-person:not(.full-person--small) .full-person__name{font-size:1.05em;font-weight:600;line-height:1.25;white-space:normal;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}' +
            D + '.full-person:not(.full-person--small) .full-person__role{font-size:.85em;opacity:.6;margin-top:.15em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            D + '.full-person:not(.full-person--small).focus{background:rgba(255,255,255,.12)}' +
            D + '.full-review-add{width:auto !important;height:auto !important;min-height:0 !important;padding:.7em 1.4em !important;border:0 !important;border-radius:99em;background:rgba(255,255,255,.1);display:inline-flex;align-items:center;gap:.5em}' +
            D + '.full-review-add.focus{background:#fff;color:#111}' +
            D + '.lmx-nocomm{display:none !important}';
    }
    function phoneCss() {
        var P = 'body.lmx-ph ';
        return '@media (max-width:760px){' +
            P + '.full-start-new__title{font-size:2.1em;font-weight:800;letter-spacing:-.01em;line-height:1.08}' +
            P + '.items-line__title{font-size:1.2em;font-weight:700;letter-spacing:.01em}' +
            P + '.full-person:not(.full-person--small){width:7.6em !important}' +
            P + '.full-person:not(.full-person--small) .full-person__photo{width:5.2em !important;height:5.2em !important}' +
        '}' +
        '@media (max-width:480px){' +
            P + '.full-start-new__poster{padding-bottom:125%}' +
            P + '.full-start-new__img{border-radius:0 !important;-webkit-mask-image:linear-gradient(to bottom,#000 58%,rgba(0,0,0,0) 100%);mask-image:linear-gradient(to bottom,#000 58%,rgba(0,0,0,0) 100%)}' +
            P + '.full-start-new__right{background:none !important;border-radius:0 !important;margin-top:-30vh !important;padding-top:0 !important;text-shadow:0 1px 8px rgba(0,0,0,.65)}' +
            P + '.full-start-new__tagline{display:none}' +
            P + '.full-start-new__rate-line{padding-top:.4em !important;margin-bottom:1.2em}' +
            P + '.full-start-new__details{opacity:.9}' +
            P + '.full-start-new__buttons{overflow-x:auto;-webkit-overflow-scrolling:touch}' +
            P + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n),' + P + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary{flex:0 0 auto;background:#fff !important;color:#111 !important;border-radius:99em !important;padding:.7em 1.6em !important;font-weight:700;text-shadow:none}' +
            P + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n) span,' + P + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary span{display:inline !important;margin-left:.45em}' +
        '}';
    }
    function fullCss() {
        var B = 'body.lmx-full ', RXQ = 'html body.lmx-full .full-start-new__reactions.lmx-rx', QA = 'html body.lmx-full .full-start-new__right';
        var compact = true;
        return '' +
            B + '.full-start-new__body{position:relative;height:84vh;padding-bottom:3vh;box-sizing:border-box}' +
            B + '.full-start-new__right{display:flex;flex-direction:column;justify-content:flex-end;max-width:56%}' +
            B + '.full-start-new__reactions{display:none !important}' +
            B + '.full-start-new__reactions.lmx-rx{display:flex !important;flex-wrap:wrap;align-items:center;order:8;margin:.6em 0 1em !important;min-height:0 !important;gap:.55em}' +
            B + '.full-start-new__buttons{order:9}' +
            'body.lmx-norx .full-start-new__reactions{display:none !important}' +
            RXQ + '>div{padding:0 !important}' +
            RXQ + ' .reaction{padding:.3em .85em .3em .45em !important;border-radius:2em !important;background:rgba(255,255,255,.12) !important;box-shadow:none !important;font-weight:700;transition:transform .2s ease,background .2s ease}' +
            RXQ + ' .reaction__icon{width:1.35em !important;height:1.35em !important}' +
            RXQ + ' .lmx-rxi{display:inline-flex;width:1.3em;height:1.3em;color:#fff;opacity:.92}' +
            RXQ + ' .lmx-rxi svg{width:100%;height:100%}' +
            'html body.lmx-full .full-start-new__reactions .reaction--voted .lmx-rxi .b:not(#lmx-x){fill:#fff;stroke:#111;stroke-width:1.2}' +
            'html body.lmx-full .full-start-new__reactions .reaction--voted .lmx-rxi .f:not(#lmx-x){stroke:#111}' +
            'html body.lmx-full .full-start-new__reactions .reaction--voted .lmx-rxi .f.d:not(#lmx-x){fill:#111}' +
            'html body.lmx-full .full-start-new__reactions .reaction--voted .lmx-rxi:not(#lmx-x){opacity:1}' +
            RXQ + ' .lmx-rxi ~ .reaction__icon{display:none !important}' +
            RXQ + ' .reaction__count{padding:0 0 0 .4em !important;font-size:1em !important;letter-spacing:.01em}' +
            'html body.lmx-prem.lmx-full .full-start-new__reactions .reaction:not(#lmx-x){background:rgba(18,18,24,.78) !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12) !important}' +
            'html body.lmx-apple.lmx-full .full-start-new__reactions .reaction:not(#lmx-x){background:rgba(255,255,255,.2) !important;border-radius:2em !important}' +
            RXQ + ' .reaction{position:relative}' +
            'html body.lmx-full .full-start-new__reactions .reaction.focus:not(#lmx-x){background:rgba(255,255,255,.28) !important;transform:scale(1.08)}' +
            'html body.lmx-prem.lmx-full .full-start-new__reactions .reaction.focus:not(#lmx-x){background:#1b1b23 !important;box-shadow:0 0 0 .16em #fff,0 .4em 1.1em rgba(0,0,0,.55) !important}' +
            'html body.lmx-apple.lmx-full .full-start-new__reactions .reaction.focus:not(#lmx-x){background:rgba(255,255,255,.26) !important;transform:scale(1.1);box-shadow:0 0 0 .14em #fff !important}' +
            '.reaction .lmx-rxi ~ .reaction__icon{display:none !important}' +
            '.lmx-rxi{display:inline-flex;flex:none;width:1.3em;height:1.3em;max-width:2em;max-height:2em;overflow:hidden}.lmx-rxi svg{width:100%;height:100%;max-width:100%;max-height:100%}' +
            '.lmx-rxi--menu{display:inline-flex;width:1.6em;height:1.6em;color:#fff}.lmx-rxi--menu svg{width:100%;height:100%}' +
            'html body .selectbox-item .selectbox-item__icon:not(#lmx-x){display:flex;align-items:center;justify-content:center}' +
            QA + ' .full-start-new__rate-line:not(#lmx-x){margin:0 0 .8em 0 !important}' +
            QA + ' .full-start-new__rate-line > :first-child:not(#lmx-x){padding-left:.5em !important;margin-left:-.5em !important}' +
            QA + ' .full-start-new__details:not(#lmx-x){margin:0 0 .8em 0 !important;padding-left:0 !important;text-indent:0 !important}' +
            QA + ' .full-start-new__details:not(#lmx-x){margin:0 0 .6em 0 !important}' +
            QA + ' .full-start-new__details > *:not(#lmx-x){margin:.2em .45em !important}' +
            QA + ' .full-start-new__details > :first-child:not(#lmx-x){margin-left:0 !important}' +
            QA + ' .lmx-info:not(#lmx-x){margin:0 0 .8em 0 !important}' +
            QA + ' > .lmx-descr:not(#lmx-x){margin:0 0 .8em -.9em !important}' +
            QA + ' > .full-start-new__reactions.lmx-rx:not(#lmx-x){margin:0 0 .9em 0 !important}' +
            QA + ' > .full-start-new__buttons:not(#lmx-x){margin-top:0 !important;margin-left:0 !important}' +
            B + '.full-start-new__title{font-size:3em;line-height:1.05;font-weight:700}' +
            B + '.full-start-new__title.lmx-has-logo{font-size:0;line-height:0}' +
            'html body.lmx-full .full-start-new__title:not(.lmx-has-logo):not(#lmx-x){-webkit-line-clamp:2 !important;line-clamp:2 !important;text-overflow:ellipsis !important;padding:.12em 0 .16em !important;margin-top:-.12em !important}' +
            B + '.full-start-new__title.lmx-has-logo{display:block !important;overflow:visible !important;-webkit-line-clamp:unset !important;line-clamp:unset !important;height:auto !important;max-height:none !important}' +
            'body.lmx-full .full-start__background{position:fixed !important;top:0 !important;left:0 !important;right:auto !important;width:100vw !important;height:100vh !important;object-fit:cover}' +
            'body.lmx-logo-on.lmx-full .full-start-new__title{opacity:0;transition:opacity .5s ease-out}' +
            'body.lmx-logo-on.lmx-full .full-start-new__title.lmx-reveal{opacity:1}' +
            'body.lmx-logo-on.lmx-full .full-start-new__head{opacity:0;transition:opacity .5s ease-out}' +
            'body.lmx-logo-on.lmx-full .full-start-new__head.lmx-reveal{opacity:1}' +
            B + '.lmx-logo{display:block;max-width:34vw;max-height:15vh;width:auto;height:auto;margin-bottom:1vh}' +
            B + '.full-start-new__tagline{font-size:1.05em;opacity:.8;margin-top:.3em}' +
            B + '.full-start-new__rate-line{margin:.9em 0 .8em 0}' +
            B + '.full-start-new__details{margin:0 0 .8em -0.3em;font-size:1em;line-height:1.5;opacity:.85}' +
            B + '.full-start-new__right{text-shadow:0 1px 3px rgba(0,0,0,.75)}' +
            B + '.full-start-new__right .lmx-info{margin:.5em 0 .9em}' +
            B + '.full-start__background{-webkit-mask-image:none !important;mask-image:none !important;filter:none !important;transform:none !important;animation:none !important;transition:opacity .25s ease-out !important}' +
            'html body.lmx-full .activity.lmx-fullact .activity__body:not(#lmx-x){-webkit-animation:none !important;animation:none !important}' +
            'html body.lmx-full .full-start__background.loaded:not(#lmx-x){-webkit-animation:none !important;animation:none !important}' +
            B + '.background::after{content:"";position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);pointer-events:none}' +
            B + '.lmx-descr{position:absolute;right:2%;top:11%;width:30vw;font-size:1.05em;line-height:1.5;z-index:2;color:#fff;' +
                'background:rgba(0,0,0,.45);padding:.9em 1.1em;border-radius:1em}' +
            B + '.lmx-descr__t{display:-webkit-box;-webkit-line-clamp:8;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis}' +
            B + '.full-start-new__right > .lmx-descr{position:static;width:100%;max-width:36vw;top:auto;right:auto;background:none;padding:0;border-radius:0;margin:0 0 1.2em;font-size:1.05em;color:#d5d8e4;z-index:auto}' +
            B + '.lmx-descr__t{-webkit-line-clamp:3}' +
            B + '.full-start-new__buttons{display:flex;flex-wrap:wrap;margin-top:.4em}' +
            B + '.full-start__button,' + B + '.full-start-new__buttons .simple-button{background:rgba(255,255,255,.14);border-radius:.8em;margin:0 .5em .5em 0;padding:.55em 1em;font-size:.95em}' +
            B + '.full-start__button.focus,' + B + '.full-start-new__buttons .simple-button.focus{background:#fff;color:#111}' +
            (compact ?
                B + '.full-start-new__buttons > .full-start__button:nth-child(n+4):not(.button--priority):not(.lmx-primary) span{display:none}' +
                B + '.full-start-new__buttons > .full-start__button:nth-child(n+4).focus span{display:inline}' : '') +
            B + '.lmx-info .lmx-ip{background:rgba(255,255,255,.14)}' +
            B + '.full-start-new__left{display:none !important}' +
            mobileCss();
    }
    function mobileCss() {
        var B = 'body.lmx-full ';
        return '@media (max-width:760px){' +
            B + '.full-start-new__body{height:auto !important;min-height:56vh;padding-bottom:2vh}' +
            B + '.full-start-new__right{align-self:flex-end}' +
            B + '.lmx-descr,' + B + '.full-start-new__right > .lmx-descr{display:none !important}' +
            B + '.lmx-info{gap:.4em 1em}' +
            B + '.lmx-info .lmx-ip + .lmx-ip::before{content:none !important}' +
            B + '.full-start-new__right{max-width:100% !important;width:100% !important;box-sizing:border-box}' +
            B + '.lmx-logo{max-width:72vw;max-height:14vh}' +
            B + '.lmx-descr,' + B + '.full-start-new__right > .lmx-descr{position:static !important;width:auto !important;max-width:100% !important;margin:.6em 0 1em;top:auto;right:auto}' +
            B + '.lmx-descr__t{-webkit-line-clamp:4}' +
            B + '.full-start-new__buttons{flex-wrap:wrap !important}' +
            '.card--lmxhero{width:82vw !important}' +
            '.card--lmxhero .card__view{height:48vw !important}' +
            '.card--lmxstudio{width:36vw !important}' +
            '.card--lmxstudio .card__view{height:19vw !important}' +
            '.lmx-studio__name{font-size:1em}' +
        '}';
    }

    function menuFitCss() {
        return 'body .menu__item{padding-right:.6em}body .menu__item .menu__text{font-size:1.02em;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}';
    }
    function textCss() {
        var X = ':not(#lmx-x)';
        function rules(scope, list) { return list.map(function (r) { return r[0].split(',').map(function (sel) { sel = sel.trim(); return scope + (/::(before|after)$/.test(sel) ? sel.replace(/(::(before|after))$/, X + '$1') : sel + X); }).join(',') + '{' + r[1] + '}'; }).join(''); }
        var STATUS = '.lmx-info .lmx-ip.lmx-done,.lmx-info .lmx-ip.lmx-next,.lmx-info .lmx-ip.lmx-soon,.lmx-info .lmx-ip.lmx-bad';
        var PLAIN = '.lmx-info .lmx-ip:not(.lmx-done):not(.lmx-next):not(.lmx-soon):not(.lmx-bad)';
        var rate = [
            ['.full-start__rate > div:first-child', 'font-size:1.3em;font-weight:800;color:#fff'],
            ['.full-start__rate > div:last-child', 'font-size:.62em;letter-spacing:.14em;text-transform:uppercase;opacity:.65;margin-left:.5em']
        ];
        var split = [['.full-start-new__split', 'font-size:.55em;opacity:.35;margin:0 .9em;vertical-align:middle']];
        function low(c) {
            return [
                ['.full-descr__text', 'color:' + c.text + ';line-height:1.65'],
                ['.full-descr__info-name', 'color:' + c.label + ';font-size:.78em;letter-spacing:.14em;text-transform:uppercase;font-weight:600;opacity:1'],
                ['.full-descr__info-body', 'color:' + c.text + ';font-weight:600'],
                ['.tag-count__name', 'color:' + c.text + ';font-weight:600'],
                ['.tag-count__count', c.badge],
                ['.full-start-new ~ .items-line .items-line__title', 'color:' + c.title + ';letter-spacing:.02em'],
                ['.full-episode__name', 'color:' + c.title],
                ['.full-episode__date,.full-episode__num', 'color:' + c.label]
            ];
        }
        var kino = rules('body.lmx-prem.lmx-full ', low({ text: '#c3c8ee', label: '#8c93bd', title: '#e4e7ff', badge: 'background:rgba(143,155,255,.22) !important;color:#fff !important;border-radius:.4em' }).concat(rate, split, [
            ['.full-start-new__details', 'font-size:1.02em;line-height:1.7;letter-spacing:.01em;color:#c3c8ee;opacity:1'],
            [PLAIN, 'color:#9aa0c4;font-size:1em'],
            [STATUS, 'color:#fff;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-size:.85em;border-left:.22em solid #8f9bff;border-radius:0;padding:.2em 0 .2em .7em;margin:.35em 0 .1em;background:none !important'],
            ['.lmx-info .lmx-ip.lmx-done::before,.lmx-info .lmx-ip.lmx-next::before,.lmx-info .lmx-ip.lmx-soon::before,.lmx-info .lmx-ip.lmx-bad::before', 'content:none !important'],
            ['.lmx-info', 'row-gap:.45em;margin-bottom:.9em'],
            ['.lmx-descr__t', 'color:#c3c8ee;line-height:1.6;font-size:1.02em']
        ]));
        var glass = rules('body.lmx-apple.lmx-full ', low({ text: 'rgba(255,255,255,.85)', label: 'rgba(255,255,255,.55)', title: '#fff', badge: 'background:rgba(255,255,255,.18) !important;color:#fff !important;border-radius:99em' }).concat(rate, split, [
            ['.full-start-new__details', 'font-size:1.02em;line-height:1.7;color:rgba(255,255,255,.78);opacity:1'],
            ['.lmx-info .lmx-ip', 'background:rgba(255,255,255,.16) !important;border:1px solid rgba(255,255,255,.22);border-radius:99em;padding:.35em .9em;font-size:.95em;color:#fff'],
            ['.lmx-info .lmx-ip::before', 'content:none !important'],
            [STATUS, 'background:rgba(143,155,255,.4) !important;border-color:rgba(143,155,255,.7);font-weight:700'],
            ['.lmx-descr', 'background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);border-radius:1.2em;padding:.8em 1.1em'],
            ['.lmx-descr__t', 'color:rgba(255,255,255,.85);line-height:1.6']
        ]));
        var flat = rules('body.lmx-full:not(.lmx-prem):not(.lmx-apple) ', low({ text: 'rgba(255,255,255,.82)', label: 'rgba(255,255,255,.55)', title: '#fff', badge: 'color:#111 !important' }).concat(rate, split, [
            ['.full-start-new__details', 'font-size:1.02em;line-height:1.7;color:#d3d6e0;opacity:1'],
            [PLAIN, 'background:rgba(255,255,255,.12) !important;border-radius:.5em;padding:.35em .75em;font-size:.95em;color:#fff'],
            ['.lmx-info .lmx-ip::before', 'content:none !important'],
            ['.lmx-descr__t', 'color:rgba(255,255,255,.82);line-height:1.6']
        ]));
        return '@media (min-width:761px){' + kino + glass + flat + '}';
    }

    function journalCss() {
        if (!journalOn()) return '';
        var X = ':not(#lmx-x)', M = 'html body .items-line.lmx-mini ', D = 'html body .items-line.lmx-mini--def ';
        var V = '.card--lmxhero' + X + ' .card__view,' + '.card--lmxhero.focus' + X + ' .card__view,' + '.card--lmxhero.hover' + X + ' .card__view';
        function all(P, sel, body) { return sel.split(',').map(function (q) { return P + q; }).join(',') + '{' + body + '}'; }
        return '@media (min-width:761px){' + [
            D + '.card--lmxhero' + X + '{width:58vw !important;margin-left:0 !important;margin-right:1.2em !important}',
            all(D, V, 'height:25vw !important')
        ].join('') + '}' + [
            'html body .items-line.items-line .items-line__title' + X + '{display:flex !important;align-items:center;font-size:.85em;letter-spacing:.2em;text-transform:uppercase;font-weight:700;opacity:.8}',
            'html body .items-line .items-line__title::after{content:"";flex:1;height:1px;margin:0 2em 0 1.2em;background:rgba(255,255,255,.14)}',
            'html body .card--lmxstudio .card__view{background:#181a20 !important;border-radius:.5em;border-bottom:.22em solid var(--lmx-pc,#555);justify-content:flex-start;padding-left:1.1em}',
            'html body .card--lmxstudio .lmx-studio__logo{flex:none;margin-right:.7em}',
            'html body .card--lmxstudio .lmx-studio__name{font-size:1.1em;font-weight:700;text-align:left;padding:0;white-space:nowrap}'
        ].join('');
    }
    function themeCss() {
        var b = themeBase();
        if (b === 'prem') return boardCss('body.lmx-prem ', 'body.lmx-prem.lmx-full ');
        return '';
    }
    function boardCss(T, F) {
        var G = 'linear-gradient(135deg,#2f3dff 0%,#8a3bff 100%)';
        return '' +
            'html{background:#050507 !important}' +
            T + '{background:linear-gradient(180deg,#121216 0%,#0b0b0e 45%,#050507 100%) fixed !important;font-family:"Inter","Helvetica Neue",Arial,sans-serif}' +
            T + '.activity,' + T + '.activity__body{background:transparent}' +
            T + '.items-line .card:not(.card--lmxhero){margin-right:.8em}' +
            T + '.items-line:not(.lmx-hero-line) .scroll--horizontal .scroll__body{padding-right:1.4em !important}' +
            T + '.items-line:not(.lmx-hero-line) .scroll{margin-left:-2.2em;padding-left:2.2em;-webkit-mask-image:none !important;mask-image:none !important}' +
            T + '.items-line__title{font-size:1.3em;font-weight:700;letter-spacing:.01em}' +
            T + '.card,' + T + '.card.focus,' + T + '.card.hover{transform:none !important;animation:none !important;transition:none !important}' +
            T + '.card__view{border-radius:1em;background:#12131f;animation:none !important;transition:transform .2s cubic-bezier(.25,.8,.25,1) !important}' +
            T + '.card.focus .card__view::after,' + T + '.card.hover .card__view::after{display:none !important}' +
            T + '.card.focus:not(.card--lmxhero) .card__view,' + T + '.card.hover:not(.card--lmxhero) .card__view{transform:scale(1.05);box-shadow:0 0 0 .12em rgba(255,255,255,.55),0 .5em 1em rgba(0,0,0,.6)}' +
            T + '.card.focus:not(.card--lmxhero),' + T + '.card.hover:not(.card--lmxhero){z-index:3}' +
            T + '.lmx-sel{display:none !important}' +
            T + '.card:not(.card--lmxhero){position:relative}' +
            T + '.items-line:not(.lmx-hero-line) .scroll__body{transition:transform .3s cubic-bezier(.3,.75,.25,1) !important}' +
            T + '.scroll--mask.lmx-nomask{-webkit-mask-image:none !important;mask-image:none !important}' +
            T + '.lmx-cin{padding:2.4em .7em .6em;border-radius:0 0 1em 1em;background:linear-gradient(to top,rgba(5,6,15,.96) 0%,rgba(5,6,15,.75) 50%,rgba(5,6,15,0) 100%)}' +
            T + '.lmx-cin__t{font-weight:700;letter-spacing:.01em}' +
            T + '.lmx-cin__t{font-size:1.2em;line-height:1.15;letter-spacing:-.005em}' +
            T + '.lmx-cin__r{margin-top:.1em}' +
            T + '.lmx-cin__v{display:inline-flex;align-items:center;gap:.3em;background:rgba(255,255,255,.14);padding:.2em .6em;border-radius:.4em;font-weight:700;-webkit-text-fill-color:#fff}' +
            T + '.lmx-cin__v i{-webkit-text-fill-color:currentColor;font-size:.9em}' +
            T + '.lmx-cin__y{font-weight:600;letter-spacing:.06em;opacity:.75}' +
            T + '.lmx-cin__g{opacity:.7;text-transform:uppercase;letter-spacing:.05em;font-size:.62em}' +
            T + '.lmx-pill{border:0 !important;border-radius:.25em;font-weight:800;text-transform:uppercase;letter-spacing:.05em}' +
            T + '.lmx-uaq{display:none !important}' +
            T + '.lmx-uaqc{display:flex;align-items:center;font-size:.86em;font-weight:800;line-height:1;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.45em;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.7)}' +
            T + '.lmx-uaqc em{font-style:normal}.lmx-uaqc em span:first-child{color:#3b8cff}.lmx-uaqc em span:last-child{color:#ffd62e}.lmx-uaqc s{display:block;width:1px;height:.95em;margin:0 .6em;background:rgba(255,255,255,.55)}' +
            T + '.lmx-box .lmx-pill{background:rgba(5,6,15,.78) !important;color:#fff !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35)}' +
            T + '.lmx-pill.lmx-m-next{background:' + G + ' !important;color:#fff !important}' +
            T + '.lmx-pill.lmx-m-new{background:#fff !important;color:#05060f !important}' +
            T + '.lmx-pill.lmx-m-soon{background:rgba(5,6,15,.82) !important;color:#fff !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.55)}' +
            T + '.card--lmxhero{contain:layout paint}' +
            T + '.card--lmxhero{width:calc(100vw + 2px) !important;margin-left:calc(-2.2em - 1px) !important;margin-right:calc(2.2em - 1px) !important}' +
            T + '.card--lmxhero[data-lmxi="0"]{width:calc(100vw - 2.2em + 2px) !important;margin-left:0 !important}' +
            T + '.card--lmxhero .card__view,' + T + '.card--lmxhero.focus .card__view,' + T + '.card--lmxhero.hover .card__view{background-color:#0b0c14;height:78vh !important;border-radius:0 !important;box-shadow:none !important;transition:none !important;transform:none !important;background-repeat:no-repeat !important;background-size:cover !important;background-position:center 20% !important}' +
            T + '.card--lmxhero .lmx-hero__shade{height:100%;background:linear-gradient(to top,#0b0b0e 0%,rgba(11,11,14,.5) 8%,rgba(11,11,14,0) 28%),linear-gradient(to bottom,rgba(11,11,14,.7) 0%,rgba(11,11,14,0) 16%),linear-gradient(90deg,rgba(11,11,14,.88) 0%,rgba(11,11,14,.55) 30%,rgba(11,11,14,0) 62%)}' +
            T + '.card--lmxhero .lmx-hero__text{left:4em;right:auto;bottom:5.2em;max-width:40%}' +
            T + '.card--lmxhero .lmx-hero__title{font-size:2.8em;font-weight:800;line-height:1.05;letter-spacing:-.01em;margin-bottom:.35em}' +
            T + '.card--lmxhero .lmx-hero__v{display:inline-flex;align-items:center;gap:.3em;background:rgba(255,255,255,.14);padding:.2em .6em;border-radius:.4em;font-weight:700;-webkit-text-fill-color:#fff}' +
            T + '.card--lmxhero .lmx-hero__v i{-webkit-text-fill-color:currentColor;font-style:normal;font-size:.9em}' +
            T + '.lmx-hero__tag{border-radius:.25em;text-transform:uppercase;letter-spacing:.05em;font-weight:800}' +
            T + '.lmx-hero__tag.lmx-t-soon{background:' + G + '}' +
            T + '.lmx-hero__tag.lmx-t-new{background:#fff;color:#05060f}' +
            T + '.lmx-hero__tag.lmx-t-trend{background:rgba(255,255,255,.18);color:#fff}' +
            T + '.card--lmxhero .lmx-hero__meta{font-size:1.05em;opacity:.9}' +
            T + '.card--lmxhero .lmx-hero__o{font-size:1.02em;opacity:.85;line-height:1.4;max-height:4.3em;margin-top:.6em}' +
            T + '.lmx-hero__acts{display:flex;flex-direction:column;align-items:flex-start;margin-top:1.1em}' +
            T + '.lmx-hero__about{display:flex;align-items:center;gap:.6em;font-weight:700;margin-bottom:.9em}' +
            T + '.lmx-hero__about i{display:inline-flex;align-items:center;justify-content:center;width:1.4em;height:1.4em;border:.12em solid #fff;border-radius:50%;font-size:.8em;font-style:normal;font-weight:800}' +
            T + '.lmx-hero__btn{display:inline-block;padding:.7em 1.9em;border-radius:99em;background:#fff;color:#000;font-weight:700;font-size:1.02em}' +
            T + '.lmx-hero-line .scroll__body{transition:transform .9s cubic-bezier(.4,0,.2,1) !important;will-change:transform}' +
            T + '.lmx-hero-line:not(.lmx-mini) .scroll__body{transition:transform 1.1s cubic-bezier(.4,0,.2,1) !important}' +
            T + '.lmx-hero-line:not(.lmx-mini) .card--lmxhero .lmx-hero__text{transition:opacity .5s ease .45s}' +
            T + '.card--lmxhero .lmx-hero__text{opacity:0;transition:opacity .35s ease .2s}' +
            T + '.card--lmxhero.lmx-cur .lmx-hero__text,' + T + '.card--lmxhero.focus .lmx-hero__text{opacity:1}' +
            '@media (min-width:761px){' + T + '.card--lmxhero{width:calc(100vw - 6em) !important;margin-left:calc(-2.2em - 1px) !important;margin-right:3.2em !important}}' +
            '@media (min-width:761px){' + T + '.card--lmxhero[data-lmxi="0"]{width:calc(100vw - 6em) !important;margin-left:0 !important;margin-right:1em !important}}' +
            '@media (min-width:761px){' + T + '.lmx-hero-line:not(.lmx-mini) .lmx-endpad{flex:none;width:8em;height:1px}' +
            'html body.lmx-prem .items-line.lmx-hero-line:not(.lmx-mini) .card--lmxhero.lmx-before:not(#lmx-x){visibility:hidden !important;transition:visibility 0s linear 1.3s !important}}' +
            '@media (min-width:761px){' + T + '.lmx-hero-line:not(.lmx-mini) .scroll{clip-path:inset(0 0 0 2.2em)}}' +
            T + '.lmx-hero-line{position:relative}' +
            T + '.lmx-hero-line .items-line__head,' + T + '.lmx-hero-line .items-line__title{display:none !important}' +
            T + '.noty{left:50%;right:auto;bottom:2.4em;max-width:70vw;border-radius:.6em;background:rgba(14,15,20,.96);color:#fff;border:1px solid rgba(255,255,255,.16);box-shadow:0 .6em 1.6em rgba(0,0,0,.6);transform:translate(-50%,200%)}' +
            T + '.noty--visible{transform:translate(-50%,0)}' +
            T + '.noty__body{padding:.8em 1.6em;text-align:center}' +
            T + '.noty__text{font-size:1.1em;font-weight:600;letter-spacing:.01em}' +
            T + '.lmx-dots{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:.8em;z-index:6;pointer-events:none}' +
            T + '.lmx-dots i{display:block;position:relative;width:.55em;height:.55em;border-radius:50%;background:rgba(255,255,255,.45)}' +
            T + '.lmx-dots i.on{width:1.3em;height:1.3em;background:transparent;box-shadow:inset 0 0 0 .14em rgba(255,255,255,.3)}' +
            T + '.lmx-dots i.on::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;border-radius:50%;border:.14em solid transparent;border-top-color:#fff;animation:lmxspin ' + (8) + 's linear both}' +
            '@keyframes lmxspin{to{transform:rotate(360deg)}}' +
            T + '.card--lmxhist{width:23em !important}' +
            T + '.card--lmxhist .card__view{height:12.9em !important;padding-bottom:0 !important;border-radius:0;background-repeat:no-repeat !important;background-size:cover !important;background-position:center !important}' +
            T + '.lmx-hist__shade{position:absolute;left:0;right:0;bottom:0;height:80%;border-radius:0;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.6) 45%,rgba(0,0,0,0) 100%)}' +
            T + '.lmx-hist__text{position:absolute;left:1em;right:1em;bottom:1.15em;color:#fff}' +
            T + '.lmx-hist__t{font-size:1.05em;font-weight:700;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            T + '.lmx-hist__m{display:flex;gap:1em;font-size:.82em;line-height:1.3;opacity:.85;margin-top:.5em}' +
            T + '.card--lmxstudio.focus .card__view,' + T + '.card--lmxstudio.hover .card__view{transform:none;box-shadow:none !important}' +
            T + '.card--lmxstudio .card__view{border-radius:0;overflow:visible !important;background:linear-gradient(145deg,#1d2040,#0c0d22);border:1px solid rgba(255,255,255,.08)}' +
            T + '.menu__item,' + T + '.settings-param,' + T + '.settings-folder,' + T + '.selectbox-item{transition:background-color .2s ease}' +
            T + '.menu__item.focus,' + T + '.menu__item.traverse,' + T + '.menu__item.hover,' +
            T + '.settings-folder.focus,' + T + '.settings-param.focus,' + T + '.selectbox-item.focus,' +
            T + '.settings-param-title.focus,' + T + '.simple-button.focus,' + T + '.full-person.focus,' +
            T + '.head__action.focus,' + T + '.head__action.hover,' + T + '.lmx-ord__btn.focus,' + T + '.lmx-ord__reset.focus' +
            '{background:rgba(255,255,255,.2) !important;color:#fff !important}' +
            T + '.selectbox,' + T + '.settings{background:#0c0c10}' +
            T + '.settings__content,' + T + '.selectbox__content,' + T + '.modal__content{background:#0e0e12 !important}' +
            T + '.menu,' + T + '.wrap__left{background:transparent !important;box-shadow:none !important;border:0 !important}' +
            T + '.modal__content{background:#121216}' +
            F + '.full-start__background{opacity:.35 !important}' +
            F + '.full-start__background.dim{opacity:.09 !important}' +
            F + '.full-start-new__right{max-width:44%}' +
            F + '.lmx-logo{max-width:30vw;max-height:20vh;margin-bottom:1.6vh}' +
            F + '.full-start-new__tagline{display:none}' +
            F + '.full-start-new__rate-line,' + F + '.full-start-new__rate-line > *,' + F + '.full-start__rate{background:none !important;border:0 !important;padding-left:0;padding-right:.5em;font-size:1em}' +
            F + '.full-start-new__rate-line{margin:0 0 .5em 0}' +
            F + '.full-start-new__details{margin:0 0 .5em 0;opacity:.8}' +
            F + '.lmx-info{gap:.4em .7em;margin:.2em 0 .7em;align-items:center}' +
            F + '.lmx-info .lmx-ip{background:none !important;padding:0;font-size:1.1em;color:#d5d8e4;font-weight:500}' +
            F + '.lmx-info .lmx-ip + .lmx-ip::before{content:"\\2022";margin-right:.7em;opacity:.55}' +
            F + '.lmx-info .lmx-ip.lmx-next,' + F + '.lmx-info .lmx-ip.lmx-soon{color:#d5d8e4;font-weight:500}' +
            F + '.full-start-new__right > .lmx-descr{position:static;width:100%;max-width:36vw;top:auto;right:auto;background:none;padding:0;border-radius:0;margin:0 0 1.2em;font-size:1.05em;color:#c4c8d6;z-index:auto}' +
            F + '.lmx-descr__t{-webkit-line-clamp:3}' +
            F + '.full-episode__img{border-radius:.45em;overflow:hidden}' +
            F + '.full-episode.focus .full-episode__img{box-shadow:0 0 0 .2em #fff}' +
            F + '.full-episode__name{font-weight:700}' +
            F + '.full-start-new__buttons{flex-wrap:nowrap;align-items:center}' +
            F + '.full-start-new__buttons > .full-start__button{width:3em;height:3em;padding:0;border-radius:50%;justify-content:center;background:transparent !important;color:#fff;transition:transform .25s ease,box-shadow .25s ease}' +
            F + '.full-start-new__buttons > .full-start__button span{display:none !important}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n),' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary{width:auto;height:auto;min-height:0;padding:.7em 1.9em;border-radius:99em;background:#fff !important;color:#000;font-weight:700;font-size:1.02em;line-height:normal;text-shadow:none !important;box-shadow:none}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n) svg,' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary svg{display:none !important}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n) span,' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary span{text-shadow:none !important;margin:0 !important;padding:0 !important}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n)::before,' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary::before{content:"\\25B6";margin-right:.5em;font-size:.9em}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n) span,' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary span{display:inline !important}' +
            F + '.full-start-new__buttons > .full-start__button.focus{background:rgba(255,255,255,.34) !important;color:#fff;transform:scale(1.08)}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n).focus,' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary.focus{background:#fff !important;color:#000;box-shadow:0 0 0 .2em rgba(255,255,255,.4);transform:none !important}' +
            T + '.card.focus:not(.card--lmxhero) .card__view,' + T + '.card.hover:not(.card--lmxhero) .card__view{transform:scale(1.06);box-shadow:0 0 0 .2em #fff,0 .6em 1.2em rgba(0,0,0,.6)}' +
            F + '.full-start-new__buttons > .full-start__button{border-radius:.7em;background:rgba(255,255,255,.16) !important}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n),' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary{border-radius:.7em;padding:.7em 2.1em;background:#fff !important}' +
            F + '.full-start-new__buttons > .full-start__button.focus{background:rgba(255,255,255,.38) !important;box-shadow:0 0 0 .16em #fff}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n).focus,' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary.focus{background:#fff !important;box-shadow:0 0 0 .2em rgba(255,255,255,.55)}' +
            F + '.full-episode__img{border-radius:.7em}' +
            '@media (max-width:760px){' +
                T + '.card--lmxhero{width:94vw !important;margin-left:0 !important;margin-right:1em !important}' +
                T + '.card--lmxhero .card__view,' + T + '.card--lmxhero.focus .card__view{height:52vw !important;border-radius:.8em !important}' +
                T + '.card--lmxhero .lmx-hero__text{left:1.2em;bottom:1.2em;max-width:85%;opacity:1 !important;transition:none}' +
                T + '.card--lmxhero .lmx-hero__title{font-size:1.7em}' +
                T + '.card--lmxhero .lmx-hero__o,' + T + '.lmx-hero__acts,' + T + '.lmx-dots{display:none}' +
                T + '.card--lmxhero .lmx-hero__shade{background:linear-gradient(to top,rgba(5,6,15,.85) 0%,rgba(5,6,15,.45) 40%,rgba(5,6,15,0) 75%)}' +
                F + '.lmx-logo{max-width:72vw;max-height:14vh}' +
                F + '.lmx-descr__t{-webkit-line-clamp:4}' +
                F + '.lmx-descr,' + F + '.full-start-new__right > .lmx-descr{display:none !important}' +
                F + '.lmx-info .lmx-ip + .lmx-ip::before{content:none !important}' +
                F + '.lmx-info{gap:.4em 1em}' +
                F + '.full-start-new__buttons{flex-wrap:wrap}' +
            '}';
    }

    function premCss() {
        if (themeBase() !== 'prem') return '';
        var T = 'body.lmx-prem ';
        var F = 'body.lmx-prem.lmx-full ';
        var D = '"Oswald","Inter","Helvetica Neue",Arial,sans-serif';
        var BG = '#0a0b10', N = 'html body.lmx-prem .items-line', X = ':not(#lmx-x)';
        return '' +
            'html{background:' + BG + ' !important}' +
            T + '{background:' + BG + ' !important}' +
            T + '.card--lmxhero .card__view,' + T + '.card--lmxhero.focus .card__view,' + T + '.card--lmxhero.hover .card__view{height:66vh !important;background-position:center 18% !important}' +
            T + '.card--lmxhero .lmx-hero__shade{height:100%;background:linear-gradient(0deg,' + BG + ' 0%,rgba(10,11,16,.7) 14%,rgba(10,11,16,0) 42%),linear-gradient(90deg,' + BG + ' 0%,rgba(10,11,16,.9) 24%,rgba(10,11,16,.45) 46%,rgba(10,11,16,0) 68%)}' +
            T + '.card--lmxhero .lmx-hero__text{left:5em;right:auto;top:auto;bottom:5.5em;max-width:54%;display:block}' +
            T + '.lmx-hero__kick{font-size:.95em;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#e9a24a;margin-bottom:.6em}' +
            T + '.lmx-hero__kick .lmx-hero__tag{padding:0;background:none !important;color:#e9a24a;font-size:1em;letter-spacing:.18em;border-radius:0}' +
            T + '.card--lmxhero .lmx-hero__title{display:block;font-family:' + D + ';text-transform:uppercase;font-weight:700;font-size:1em;line-height:1;letter-spacing:.01em;margin:0 0 .9em;padding:0;overflow:visible}' +
            T + '.lmx-w1{display:block;line-height:1;padding:.04em 0 .06em;word-break:break-word;overflow-wrap:anywhere}' +
            T + '.lmx-w1.lmx-s1{font-size:5.5em}' +
            T + '.lmx-w1.lmx-s2{font-size:4.3em}' +
            T + '.lmx-w1.lmx-s3{font-size:3.3em}' +
            T + '.lmx-w1.lmx-s4{font-size:2.6em}' +
            T + '.lmx-w2{display:block;margin-top:.5em;font-size:1.45em;font-weight:500;line-height:1.1;letter-spacing:.34em;color:rgba(255,255,255,.88)}' +
            T + '.card--lmxhero .lmx-hero__meta{display:flex;flex-wrap:wrap;align-items:center;gap:.5em 1.1em;font-size:1em;opacity:1;color:#d8dcea;margin:0}' +
            T + '.card--lmxhero .lmx-hero__v{background:none;padding:0;color:#fff !important;-webkit-text-fill-color:#fff;font-weight:700}' +
            T + '.card--lmxhero .lmx-hero__v i{-webkit-text-fill-color:#e9a24a;color:#e9a24a}' +
            T + '.card--lmxhero .lmx-hero__o{max-width:34em;font-size:1.02em;line-height:1.5;max-height:4.6em;margin-top:1em;color:#d8dcea;opacity:1}' +
            T + '.lmx-hero__acts{display:flex;flex-direction:row-reverse;justify-content:flex-end;align-items:center;gap:.9em;margin-top:1.6em}' +
            T + '.lmx-hero__btn{border-radius:.7em;font-size:.92em;padding:.7em 2em;background:#fff;color:#0a0b10;font-weight:700}' +
            T + '.lmx-hero__about{margin:0;font-size:.92em;padding:.7em 1.5em;border-radius:.7em;background:rgba(255,255,255,.16);font-weight:600}' +
            T + '.lmx-hero__about i{display:none}' +
            T + '.lmx-dots{left:auto;right:4.5em;transform:none;gap:.5em;top:auto}' +
            T + '.lmx-dots i{width:.7em;height:.32em;border-radius:.2em;background:rgba(255,255,255,.35)}' +
            T + '.lmx-dots i.on{width:2.4em;height:.32em;border-radius:.2em;background:#fff;box-shadow:none}' +
            T + '.lmx-dots i.on::after{display:none}' +
            T + '.items-line__title{font-size:1.4em;font-weight:600;letter-spacing:0;color:#e8eaf2}' +
            T + '.card__view{border-radius:.8em;background:#14161f}' +
            T + '.lmx-cin{border-radius:0 0 .8em .8em}' +
            T + '.lmx-cin__t{font-family:' + D + ';text-transform:uppercase;font-weight:600;letter-spacing:.02em;line-height:1.05}' +
            T + '.card--lmxstudio{width:15em !important}' +
            T + '.card--lmxstudio .card__view{height:7.6em;background:#14161f !important;border:1px solid rgba(255,255,255,.08) !important;border-radius:.9em !important;overflow:hidden !important}' +
            T + '.card--lmxstudio .lmx-studio__name{font-family:' + D + ';text-transform:uppercase;font-weight:700;font-size:1.9em;letter-spacing:.06em}' +
            T + '.card--lmxstudio.focus .card__view,' + T + '.card--lmxstudio.hover .card__view{transform:scale(1.06) !important;background:#1c1f2c !important;border-color:transparent !important;box-shadow:0 0 0 .2em #fff,0 .6em 1.2em rgba(0,0,0,.55) !important}' +
            T + '.card--lmxhist .card__view{border-radius:.8em}' +
            F + '.full-start__background{position:fixed !important;top:0 !important;left:0 !important;right:auto !important;width:100vw !important;height:100vh !important;object-fit:cover;opacity:.55 !important}' +
            'body.lmx-prem .lmx-bgv{transition:opacity .5s ease-out}' +
            'body.lmx-prem.lmx-fscroll .lmx-bgv{opacity:1}' +
            'body.lmx-prem .lmx-bgv{position:fixed;z-index:-1;top:0;left:0;width:100vw;height:100vh;pointer-events:none;background:linear-gradient(90deg,rgba(7,8,16,.9) 0%,rgba(7,8,16,.72) 32%,rgba(7,8,16,.28) 58%,rgba(7,8,16,0) 78%),linear-gradient(0deg,rgba(7,8,16,.75) 0%,rgba(7,8,16,0) 38%)}' +
            F + '.full-start__background.dim{opacity:.55 !important}' +
            'body.lmx-prem.lmx-fscroll .full-start__background,body.lmx-prem.lmx-fscroll .full-start__background.dim{opacity:.24 !important}' +
            'body.lmx-prem .full-start__background{transition:opacity .5s ease-out !important}' +
            F + '.full-start-new__right{max-width:50%}' +
            F + '.full-start-new__title{font-family:' + D + ';text-transform:uppercase;font-weight:700;letter-spacing:.01em;line-height:1;font-size:4.2em;margin-bottom:.25em}' +
            F + '.full-start-new__title.lmx-has-logo{font-size:0 !important;line-height:0 !important;margin-bottom:0}' +
            F + '.lmx-logo{max-width:34vw;max-height:22vh}' +
            F + '.full-start-new__rate-line > *,' + F + '.full-start__rate{font-weight:700}' +
            F + '.full-start-new__details,' + F + '.lmx-info .lmx-ip{color:#d8dcea}' +
            F + '.full-start-new__right > .lmx-descr{max-width:40vw;color:#d8dcea;line-height:1.55}' +
            F + '.full-episode{width:21em}' +
            F + '.full-episode__img{border-radius:.7em}' +
            F + '.full-episode.focus .full-episode__img{box-shadow:0 0 0 .22em #fff;transform:none}' +
            F + '.full-episode__name{font-weight:700;font-size:1.1em}' +
            F + '.full-episode__num{font-family:' + D + ';font-weight:600}' +
            N + '.lmx-mini .lmx-hero__text' + X + '{top:auto !important}' +
            N + '.lmx-mini .lmx-hero__kick' + X + '{font-size:.85em;margin-bottom:.35em}' +
            N + '.lmx-mini .lmx-hero__title' + X + '{margin-bottom:.45em !important;font-size:1.75em !important}' +
            N + '.lmx-mini .lmx-w1,' + N + '.lmx-mini .lmx-w1.lmx-s1,' + N + '.lmx-mini .lmx-w1.lmx-s2,' + N + '.lmx-mini .lmx-w1.lmx-s3,' + N + '.lmx-mini .lmx-w1.lmx-s4' + X + '{font-size:1em;line-height:1.05;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
            N + '.lmx-mini .lmx-w2' + X + '{font-size:.5em;margin-top:.25em;letter-spacing:.14em;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}' +
            N + '.lmx-mini .lmx-hero__meta' + X + '{font-size:1.05em !important;gap:.3em .9em}' +
            N + '.lmx-mini .lmx-hero__o' + X + '{display:none !important}' +
            '@media (min-width:761px){' + N + '.lmx-mini .lmx-hero__acts' + X + '{display:flex !important;margin-top:.9em;gap:.7em;font-size:.95em}}' +
            '@media (max-width:760px){' +
                T + '.card--lmxhero .card__view,' + T + '.card--lmxhero.focus .card__view{height:56vw !important}' +
                T + '.card--lmxhero .lmx-hero__text{left:1.2em;top:auto;bottom:1.2em;max-width:88%}' +
                T + '.lmx-w1.lmx-s1,' + T + '.lmx-w1.lmx-s2{font-size:1.5em}' +
                T + '.lmx-w1.lmx-s3,' + T + '.lmx-w1.lmx-s4{font-size:1em}' +
                T + '.lmx-w2{font-size:.55em;letter-spacing:.2em;margin-top:.3em}' +
                T + '.lmx-hero__kick{font-size:.8em;margin-bottom:.3em}' +
                T + '.card--lmxstudio{width:11em !important}' +
            '}';
    }

    function appleCss() {
        if (getStr('lmx_theme', 'default') !== 'apple') return '';
        var A = 'body.lmx-apple ';
        var F = 'body.lmx-apple.lmx-full ';
        var GRAY = '#a1a1a6';
        var GLASS = 'rgba(255,255,255,.13)';
        var AURORA = 'radial-gradient(75vw 60vh at 14% 6%,rgba(120,124,134,.15),rgba(120,124,134,0) 65%),radial-gradient(60vw 50vh at 90% 14%,rgba(120,130,140,.07),rgba(120,130,140,0) 65%),radial-gradient(70vw 60vh at 70% 100%,rgba(120,120,125,.07),rgba(120,120,125,0) 65%),linear-gradient(180deg,#18191c 0%,#101113 55%,#0b0b0d 100%)';
        var TL = tintTL();
        var RIM = 'inset 0 0 0 1px rgba(255,255,255,.16),inset 0 1px 0 rgba(255,255,255,.34)';
        return '' +
            'html{background:#0b0b0d !important}' +
            A + '.background{display:none !important}' +
            A.trim() + '::before{content:"";position:fixed;left:0;top:0;right:0;bottom:0;z-index:-1;pointer-events:none;background:' + AURORA + ';transform:translateZ(0);transition:opacity .5s ease}' +
            'body.lmx-apple.lmx-onfull #lmx-tintbg{display:none !important}' +
            'body.lmx-apple.lmx-onfull::before{display:block !important;opacity:0;-webkit-clip-path:inset(0 calc(100% - 15em) 0 0);clip-path:inset(0 calc(100% - 15em) 0 0);transition:opacity .2s ease}' +
            'body.lmx-apple.lmx-onfull.menu--open::before{opacity:1}' +
            '#lmx-tintbg{display:none;position:fixed;left:0;top:0;right:0;bottom:0;z-index:-1;pointer-events:none;transform:translateZ(0)}' +
            'body.lmx-apple.lmx-onfull.lmx-tint #lmx-tintbg{display:block}' +
            'body.lmx-apple.lmx-onfull.lmx-tint .full-start-new__buttons .full-start__button.focus:not(.lmx-primary):not(:first-child){box-shadow:0 0 0 .14em rgba(var(--lmx-acc),' + TL[3] + '),0 0 1.1em rgba(var(--lmx-acc),' + TL[2] + ') !important}' +
            'body.lmx-apple.lmx-onfull.lmx-tint .full-start-new__buttons > .full-start__button:first-child:not(.lmx-n),body.lmx-apple.lmx-onfull.lmx-tint .full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary{box-shadow:0 0 1.1em rgba(var(--lmx-acc),' + TL[2] + ') !important}' +
            'body.lmx-apple.lmx-onfull.lmx-tint .full-start-new__buttons > .full-start__button:first-child:not(.lmx-n).focus,body.lmx-apple.lmx-onfull.lmx-tint .full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary.focus{box-shadow:0 0 0 .14em rgba(var(--lmx-acc),' + TL[3] + '),0 0 1.1em rgba(var(--lmx-acc),' + TL[2] + ') !important}' +
            A + '{background:#0b0b0d !important;color:#f5f5f7;font-family:-apple-system,"SF Pro Display","Inter","Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}' +
            A + '.activity,' + A + '.activity__body,' + A + '.wrap{background:transparent}' +
            A + '.items-line__title,' + A + '.items-line__head,' + A + '.items-line{background:none !important;box-shadow:none}' +
            A + '.items-line__title{font-size:1.6em;font-weight:700;letter-spacing:-.022em;color:#f5f5f7}' +
            A + '.items-line__more{background:' + GLASS + ';box-shadow:inset 0 0 0 1px rgba(255,255,255,.2);border-radius:99em;font-weight:600}' +
            A + '.card,' + A + '.card.focus,' + A + '.card.hover{transform:none !important;animation:none !important;transition:none !important}' +
            A + '.card__view{border-radius:1.2em;background:#1c1c20;box-shadow:' + RIM + ';animation:none !important;transition:transform .2s cubic-bezier(.25,.8,.25,1) !important}' +
            A + '.card.focus:not(.card--lmxhero):not(.card--lmxstudio) .card__view,' + A + '.card.hover:not(.card--lmxhero):not(.card--lmxstudio) .card__view{transform:scale(1.1);box-shadow:0 0 0 .16em #fff,0 .5em 1.5em rgba(0,0,0,.4)}' +
            A + '.card__img,' + A + '.card__view::after{border-radius:1.2em}' +
            A + '.card.focus{z-index:3}' +
            'body.lmx-apple .card.focus:not(.card--lmxhero) .card__view{position:relative}' +
            A + '.card.focus .card__view::after,' + A + '.card.hover .card__view::after,' + A + '.lmx-sel{display:none !important;border:0 !important;box-shadow:none !important}' +
            A + '.card--lmxhist.focus .card__view,' + A + '.card--lmxhist.hover .card__view,' + A + '.card--lmxstudio.focus .card__view,' + A + '.card--lmxstudio.hover .card__view{box-shadow:0 0 0 .16em #fff,0 .5em 1.5em rgba(0,0,0,.4) !important;outline:0 !important;border-color:transparent !important}' +
            A + '.card.focus .card__view::after,' + A + '.card.hover .card__view::after{display:none !important}' +
            '@keyframes lmxshadow{from{opacity:0}to{opacity:1}}' +
            A + '.lmx-cin{padding:3em .9em .75em;border-radius:0 0 1.2em 1.2em;background:linear-gradient(to top,rgba(10,10,12,.9) 0%,rgba(10,10,12,.55) 45%,rgba(10,10,12,0) 100%)}' +
            A + '.lmx-cin__t{font-size:1.15em;font-weight:600;letter-spacing:-.015em;line-height:1.15}' +
            A + '.lmx-cin__g{opacity:.6;text-transform:uppercase;letter-spacing:.08em;font-size:.58em;font-weight:600}' +
            A + '.lmx-cin__v{background:none;padding:0;font-weight:600;-webkit-text-fill-color:#f5f5f7}' +
            A + '.lmx-cin__v i{-webkit-text-fill-color:currentColor;font-style:normal}' +
            A + '.lmx-cin__y{opacity:.7;font-weight:500}' +
            A + '.lmx-uaq{background:rgba(34,34,38,.72);box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);border-radius:0 .9em .9em 0;font-weight:700}' +
            A + '.lmx-uaq b{letter-spacing:.06em}' +
            A + '.lmx-pill{border:0 !important;border-radius:99em;font-weight:600;letter-spacing:.02em;padding:.34em .9em}' +
            A + '.lmx-box .lmx-pill{background:rgba(34,34,38,.62) !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);color:#fff !important}' +
            A + '.lmx-pill.lmx-m-next{background:#0a84ff !important;color:#fff !important}' +
            A + '.lmx-pill.lmx-m-new{background:#f5f5f7 !important;color:#000 !important}' +
            A + '.lmx-pill.lmx-m-soon{background:rgba(255,255,255,.2) !important;color:#fff !important}' +
            A + '.card--lmxhero{contain:layout paint}' +
            A + '.card--lmxhero{width:calc(100vw + 2px) !important;margin-left:calc(-2.2em - 1px) !important;margin-right:calc(2.2em - 1px) !important}' +
            A + '.card--lmxhero[data-lmxi="0"]{width:calc(100vw - 2.2em + 2px) !important;margin-left:0 !important}' +
            A + '.card--lmxhero .card__view{background-color:#1c1c20;height:70vh !important;border-radius:0;box-shadow:none;transition:none !important;background-repeat:no-repeat !important;background-size:cover !important;background-position:center 20% !important}' +
            A + '.card--lmxhero.focus .card__view,' + A + '.card--lmxhero.hover .card__view{transform:none !important;box-shadow:none !important;transition:none !important}' +
            A + '.card:not(.card--lmxhero){position:relative}' +
            A + '.card--lmxhero.focus .card__view::after,' + A + '.card--lmxhero.hover .card__view::after{display:none !important}' +
            A + '.card--lmxstudio .card__view{overflow:visible !important}' +
                        A + '.card--lmxhero .lmx-hero__shade{height:100%;background:linear-gradient(to top,rgb(12,12,14) 0%,rgba(12,12,14,.8) 14%,rgba(12,12,14,.3) 35%,rgba(12,12,14,0) 64%),linear-gradient(to bottom,rgba(12,12,14,.7) 0%,rgba(12,12,14,.35) 7%,rgba(12,12,14,0) 23%),linear-gradient(90deg,rgba(0,0,0,.56) 0%,rgba(0,0,0,.22) 34%,rgba(0,0,0,0) 62%)}' +
            A + '.card--lmxhero .lmx-hero__text{left:4em;right:4em;bottom:3.6em;max-width:46%}' +
            A + '.card--lmxhero .lmx-hero__title{font-size:3.3em;font-weight:700;line-height:1.02;letter-spacing:-.03em;margin-bottom:.35em}' +
            A + '.card--lmxhero .lmx-hero__meta{font-size:1.05em;opacity:.9;font-weight:500}' +
            A + '.card--lmxhero .lmx-hero__v{background:none;padding:0;font-weight:600;-webkit-text-fill-color:#f5f5f7}' +
            A + '.card--lmxhero .lmx-hero__v i{-webkit-text-fill-color:currentColor;font-style:normal}' +
            A + '.lmx-hero__tag{border-radius:99em;font-weight:600;padding:.25em .85em;background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.28);color:#fff}' +
            A + '.lmx-hero__tag.lmx-t-soon{background:#0a84ff}' +
            A + '.lmx-hero__tag.lmx-t-new{background:#f5f5f7;color:#000}' +
            A + '.card--lmxhero .lmx-hero__o{font-size:1.02em;opacity:.8;line-height:1.4;max-height:4.3em;margin-top:.7em}' +
            A + '.lmx-hero-line .scroll__body{transition:transform .9s cubic-bezier(.4,0,.2,1) !important;will-change:transform}' +
            A + '.card--lmxhero .lmx-hero__text{opacity:0;transition:opacity .35s ease .2s}' +
            A + '.card--lmxhero.lmx-cur .lmx-hero__text,' + A + '.card--lmxhero.focus .lmx-hero__text{opacity:1}' +
            '@media (min-width:761px){' + A + '.card--lmxhero{width:calc(100vw - 6em) !important;margin-left:calc(-2.2em - 1px) !important;margin-right:3.2em !important}}' +
            '@media (min-width:761px){' + A + '.card--lmxhero[data-lmxi="0"]{width:calc(100vw - 8.2em) !important;margin-left:0 !important}}' +
            A + '.lmx-hero-line:not(.lmx-mini) .scroll__body{transition:transform 1.1s cubic-bezier(.4,0,.2,1) !important}' +
            A + '.lmx-hero-line:not(.lmx-mini) .card--lmxhero .lmx-hero__text{transition:opacity .5s ease .45s}' +
            A + '.lmx-hero-line{position:relative}' +
            A + '.lmx-hero-line .items-line__head,' + A + '.lmx-hero-line .items-line__title{display:none !important}' +
            A + '.noty{left:50%;right:auto;bottom:2.4em;max-width:70vw;border-radius:99em;background:rgba(38,38,42,.92);color:#fff;border:1px solid rgba(255,255,255,.22);box-shadow:0 .6em 1.6em rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.18);transform:translate(-50%,200%)}' +
            A + '.noty--visible{transform:translate(-50%,0)}' +
            A + '.noty__body{padding:.75em 1.8em;text-align:center}' +
            A + '.noty__text{font-size:1.1em;font-weight:600}' +
            A + '.lmx-dots{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:.55em;padding:.6em 1em;border-radius:99em;background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2);z-index:6;pointer-events:none}' +
            A + '.lmx-dots i{display:block;width:.5em;height:.5em;border-radius:50%;background:rgba(255,255,255,.5);transition:background-color .3s ease}' +
            A + '.lmx-dots i.on{width:2.2em;border-radius:99em;background:#fff}' +
            A + '.card--lmxhist{width:24em !important}' +
            A + '.card--lmxhist .card__view{height:13.5em !important;padding-bottom:0 !important;border-radius:1.2em;background-repeat:no-repeat !important;background-size:cover !important;background-position:center !important}' +
            A + '.lmx-hist__shade{position:absolute;left:0;right:0;bottom:0;height:80%;border-radius:0;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.6) 45%,rgba(0,0,0,0) 100%)}' +
            A + '.lmx-hist__text{position:absolute;left:1.1em;right:1.1em;bottom:1.2em;color:#fff}' +
            A + '.lmx-hist__t{font-size:1.05em;font-weight:600;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            A + '.lmx-hist__m{display:flex;gap:1em;font-size:.82em;line-height:1.3;opacity:.85;margin-top:.55em}' +
            A + '.items-line .card:not(.card--lmxhero){margin-right:.9em}' +
            A + '.items-line:not(.lmx-hero-line) .scroll--horizontal .scroll__body{padding-right:1.3em !important;padding-left:1.4em !important}' +
            A + '.items-line:not(.lmx-hero-line) .items-line__head{margin-left:1.4em}' +
            A + '.items-line:not(.lmx-hero-line) .scroll__body{transition:transform .3s cubic-bezier(.3,.75,.25,1) !important}' +
            A + '.scroll--mask.lmx-nomask{-webkit-mask-image:none !important;mask-image:none !important}' +
            A + '.lmx-hero__acts{display:flex;align-items:center;margin-top:1.1em}' +
            A + '.lmx-hero__btn{display:inline-block;padding:.75em 2em;border-radius:99em;background:#f5f5f7;color:#000;font-weight:600;font-size:1.08em}' +
            A + '.lmx-hero__circ{display:inline-flex;align-items:center;justify-content:center;width:2.6em;height:2.6em;margin-left:.8em;border-radius:50%;background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.3);color:#fff;font-size:1.1em;font-weight:500}' +
            A + '.card--lmxstudio .card__view{background:#232326 !important;border-radius:1.25em;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}' +
            A + '.card--lmxstudio.focus .card__view,' + A + '.card--lmxstudio.hover .card__view{transform:scale(1.12) !important;background:#3a3a40 !important;box-shadow:none;transition:transform .15s ease-out,background-color .15s ease-out !important}' +
            A + '.lmx-studio__name{font-weight:600;letter-spacing:-.01em}' +
            A + '.head__action{border-radius:50%;background:' + GLASS + ';box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}' +
            A + '.menu__item,' + A + '.settings-param,' + A + '.settings-folder,' + A + '.selectbox-item{border-radius:.9em;transition:background-color .25s ease}' +
            A + '.menu__item.focus,' + A + '.menu__item.traverse,' + A + '.menu__item.hover,' +
            A + '.settings-folder.focus,' + A + '.settings-param.focus,' + A + '.selectbox-item.focus,' +
            A + '.settings-param-title.focus,' + A + '.simple-button.focus,' + A + '.full-person.focus,' +
            A + '.head__action.focus,' + A + '.head__action.hover,' + A + '.lmx-ord__btn.focus,' + A + '.lmx-ord__reset.focus' +
            '{background:rgba(255,255,255,.2) !important;color:#fff !important;box-shadow:none}' +
                        A + '.selectbox,' + A + '.settings{background:rgba(8,8,10,.55)}' +
            A + '.settings__content,' + A + '.selectbox__content,' + A + '.modal__content{background:linear-gradient(180deg,rgba(24,24,28,.95) 0%,rgba(14,14,17,.97) 100%) !important;box-shadow:0 .8em 1.6em rgba(0,0,0,.4) !important;border:0 !important}' +
            A + '.wrap__left{background:transparent !important;backdrop-filter:none !important;-webkit-backdrop-filter:none !important;box-shadow:none !important;border:0 !important}' +
            A + '.menu{background:transparent !important;box-shadow:none !important;border:0 !important}' +
            A + '.modal__content,' + A + '.selectbox__content{border-radius:1.4em}' +
            A + '.simple-button{border-radius:99em;background:' + GLASS + ';box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}' +
            F + '.full-start__background{will-change:opacity;position:fixed !important;top:0 !important;left:0 !important;width:100vw !important;height:100vh !important;object-fit:cover;opacity:.36 !important;filter:none !important;transition:opacity .35s ease-out,filter .35s ease-out !important}' +
            F + '.full-start__background.dim{opacity:.36 !important}' +
            'body.lmx-apple .lmx-bgb{position:fixed !important;top:0;left:0;width:100vw;height:100vh;object-fit:cover;filter:blur(1.1em);opacity:0;transition:opacity .35s ease-out;will-change:opacity;pointer-events:none}' +
            'body.lmx-apple.lmx-fscroll .lmx-bgb{opacity:.2}' +
            'body.lmx-apple.lmx-fscroll .full-start__background,body.lmx-apple.lmx-fscroll .full-start__background.dim{opacity:0 !important;filter:none !important;transform:none !important}' +
            'body.lmx-apple.lmx-onfull{background:#0b0b0d !important}' +
            'body.lmx-apple.lmx-onfull .head{background:none !important;box-shadow:none !important}' +
            F + '.full-start-new__right{max-width:44%}' +
            F + '.lmx-logo{max-width:32vw;max-height:23vh;margin-bottom:2vh}' +
            F + '.full-start-new__title{font-size:3.4em;font-weight:700;letter-spacing:-.035em;line-height:1.02;margin-bottom:.25em}' +
            F + '.full-start-new__title.lmx-has-logo{font-size:0}' +
            F + '.full-start-new__tagline{display:none}' +
            F + '.full-start-new__rate-line,' + F + '.full-start-new__rate-line > *,' + F + '.full-start__rate{background:none !important;border:0 !important;padding-left:0;padding-right:.6em;font-size:1em;color:' + GRAY + '}' +
            F + '.full-start-new__rate-line{margin:0 0 .3em 0}' +
            F + '.full-start-new__details{margin:0 0 .6em 0;color:' + GRAY + ';opacity:1;font-weight:500}' +
            F + '.lmx-info{gap:.3em .7em;margin:.1em 0 .9em;align-items:center}' +
            F + '.lmx-info .lmx-ip{background:none !important;padding:0;font-size:1.1em;color:' + GRAY + ';font-weight:500}' +
            F + '.lmx-info .lmx-ip + .lmx-ip::before{content:"\\00B7";margin-right:.7em;opacity:.8}' +
            F + '.lmx-info .lmx-ip.lmx-next,' + F + '.lmx-info .lmx-ip.lmx-soon{color:' + GRAY + ';font-weight:500}' +
            F + '.full-start-new__right > .lmx-descr{position:static;width:100%;max-width:36vw;top:auto;right:auto;background:none;padding:0;border-radius:0;margin:0 0 1.5em;font-size:1.08em;line-height:1.45;color:#d1d1d6;z-index:auto}' +
            F + '.lmx-descr__t{-webkit-line-clamp:3}' +
            F + '.full-start-new__buttons{flex-wrap:nowrap;align-items:center;margin-top:0}' +
            F + '.full-start-new__buttons > .full-start__button{width:3.5em;height:3.5em;padding:0;border-radius:50%;justify-content:center;background:' + GLASS + ' !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);color:#f5f5f7;margin-right:.7em;transition:transform .2s ease-out}' +
            F + '.full-start-new__buttons > .full-start__button span{display:none !important}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n),' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary{width:auto;height:auto;min-height:0;padding:.62em 2em;border-radius:99em;background:#f5f5f7 !important;color:#000;font-weight:700;font-size:1.08em;line-height:1.25;text-shadow:none !important;box-shadow:none;border:0}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n) svg,' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary svg{display:none !important}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n) span,' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary span{text-shadow:none !important;margin:0 !important;padding:0 !important}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n)::before,' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary::before{content:"\\25B6";margin-right:.45em;font-size:1.05em}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n) span,' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary span{display:inline !important}' +
            F + '.full-start-new__buttons > .full-start__button.focus{transform:scale(1.1);background:rgba(255,255,255,.34) !important;color:#fff}' +
            F + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n).focus,' + F + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary.focus{background:#fff !important;color:#000;box-shadow:0 .4em 1.2em rgba(0,0,0,.35);transform:none !important}' +
            A + '.full-descr__text,' + A + '.full-descr__details{color:#d1d1d6}' +
            A + '.full-person{border-radius:1.2em}' +
            '@media (max-width:760px){' +
                A + '.card--lmxhero{width:94vw !important;margin-left:0 !important;margin-right:1em !important}' +
                A + '.card--lmxhero .card__view{height:52vw !important;border-radius:1.2em}' +
                A + '.card--lmxhero .lmx-hero__text{left:1.2em;right:1em;bottom:1.2em;max-width:85%}' +
                A + '.card--lmxhero .lmx-hero__title{font-size:1.7em}' +
                A + '.card--lmxhero .lmx-hero__o,' + A + '.lmx-hero__acts,' + A + '.lmx-dots{display:none}' +
                A + '.card--lmxhero .lmx-hero__text{opacity:1 !important;transition:none}' +
                A + '.card--lmxhero .lmx-hero__shade{background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.45) 40%,rgba(0,0,0,0) 75%)}' +
            '}';
    }
    function loadThemeFont() {
        if (getStr('lmx_theme', 'default') === 'default' || document.getElementById('lmx-font')) return;
        var l = document.createElement('link');
        l.id = 'lmx-font'; l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800&family=Oswald:wght@500;600;700&subset=cyrillic&display=block';
        ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'].forEach(function (h) {
            var pc = document.createElement('link'); pc.rel = 'preconnect'; pc.href = h; if (h.indexOf('gstatic') > 0) pc.crossOrigin = 'anonymous';
            document.head.appendChild(pc);
        });
        document.head.appendChild(l);
        l.onload = function () {
            try { if (document.fonts && document.fonts.load) ['700 1em Oswald', '600 1em Oswald', '500 1em Inter', '700 1em Inter', '800 1em Inter'].forEach(function (f) { document.fonts.load(f, 'АаБбЯя'); }); } catch (e) {}
        };
    }
    function applyThemeClass() {
        safe(loadThemeFont);
        if (document.body && document.body.classList) { document.body.classList.toggle('lmx-hbo', themeBase() === 'hbo'); document.body.classList.toggle('lmx-prem', themeBase() === 'prem'); document.body.classList.toggle('lmx-apple', getStr('lmx_theme', 'default') === 'apple'); }
    }
    function themeWatch() {
        if (themeWatch.on) return;
        themeWatch.on = true;
        var boot = getStr('lmx_theme', 'default'), n = 0;
        function chk() {
            try {
                if (window.__lmxReloading || getStr('lmx_theme', 'default') === boot) return;
                var last = 0; try { last = parseInt(window.sessionStorage.getItem('lmx_theme_rl') || '0', 10) || 0; } catch (e) {}
                if (Date.now() - last < 20000) return;
                try { window.sessionStorage.setItem('lmx_theme_rl', String(Date.now())); } catch (e) {}
                reloadApp();
            } catch (e) {}
        }
        try { Lampa.Storage.listener.follow('change', function (e) { if (e && e.name === 'lmx_theme') setTimeout(chk, 50); }); } catch (e) {}
        var iv = setInterval(function () { chk(); if (++n > 60) clearInterval(iv); }, 3000);
    }
    function isMobile() { return (window.innerWidth || 1000) <= 760; }
    function applyFullClass() {
        var on = getBool('lmx_full', true) && !isMobile();
        if (document.body && document.body.classList) {
            document.body.classList.toggle('lmx-ph', getBool('lmx_full', true) && isMobile());
            document.body.classList.toggle('lmx-full', on);
            document.body.classList.toggle('lmx-logo-on', getBool('lmx_logo', true));
        }
    }

    function flexGapOk() {
        try {
            var d = document.createElement('div');
            d.style.cssText = 'display:flex;flex-direction:column;row-gap:1px;position:absolute;left:-99px;top:0;visibility:hidden';
            d.innerHTML = '<div style="height:1px"></div><div style="height:1px"></div>';
            document.body.appendChild(d);
            var ok = d.scrollHeight === 3;
            document.body.removeChild(d);
            return ok;
        } catch (e) { return true; }
    }
    function nogapCss() {
        var B = 'body.lmx-nogap ';
        return 'html body .items-line .card-episode+.card-episode{margin-left:1.2em !important}' +
            B + '.mapping--line>*+*{margin-left:1em}' +
            B + '.lmx-hero__meta>*+*{margin-left:.8em}' +
            B + '.card--lmxhero .lmx-hero__meta>*+*{margin-left:1em}' +
            B + '.lmx-hist__m>*+*{margin-left:1em}' +
            B + '.lmx-hero__acts>*+*{margin-right:.9em}' +
            B + '.lmx-hero__about>*+*{margin-left:.6em}' +
            B + '.lmx-hero__v>i,' + B + '.lmx-cin__v>i{margin-right:.3em}' +
            B + '.lmx-why>*+*{margin-left:.4em}' +
            B + '.lmx-dots>*+*,' + B + '.lmx-pdots>*+*{margin-left:.6em}' +
            B + '.lmx-info>*{margin:0 .5em .5em 0}';
    }

    function crispCss() {
        var P = 'body.lmx-prem ', F = 'body.lmx-prem.lmx-full ';
        return '' +
            'html body .full-start-new__tagline,html body .full-start__tagline,html body .lmx-descr,html body .full-start-new__descr,html body .full-start__descr,html body .full-descr__text,html body .lmx-hero__o,html body #lmx-cinema .lmx-cin-d{display:none !important}' +
            P + '.background,' + P + '.background img,' + P + '.full-start__background,' + P + '.lmx-bgv,' + P + '.card--lmxhero .card__view{filter:none !important;-webkit-filter:none !important;backdrop-filter:none !important;-webkit-backdrop-filter:none !important}' +
            F + '.full-start__background,' + F + '.full-start__background.dim{opacity:1 !important}' +
            'body.lmx-prem.lmx-fscroll .full-start__background,body.lmx-prem.lmx-fscroll .full-start__background.dim{opacity:.4 !important}' +
            P + '.lmx-bgv{background:linear-gradient(90deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,.28) 30%,rgba(0,0,0,0) 55%),linear-gradient(0deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,0) 30%) !important}' +
            '@media (min-width:761px){' +
                P + '.card--lmxhero .card__view,' + P + '.card--lmxhero.focus .card__view,' + P + '.card--lmxhero.hover .card__view{height:100vh !important;background-position:center center !important}' +
                P + '.card--lmxhero .lmx-hero__text{bottom:7em}' +
            '}' +
            P + '.card--lmxhero .lmx-hero__shade{background:linear-gradient(0deg,rgba(0,0,0,.72) 0%,rgba(0,0,0,.25) 22%,rgba(0,0,0,0) 45%),linear-gradient(90deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.2) 30%,rgba(0,0,0,0) 58%) !important}' +
            '@media (max-width:760px){' + P + '.card--lmxhero .lmx-hero__shade{background:linear-gradient(0deg,rgba(0,0,0,.7) 0%,rgba(0,0,0,0) 60%) !important}}' +

            // кнопки страницы фильма: во всех темах как в «Облегчённой», без стекла
            (function () {
                var C = 'html body.lmx-full .full-start-new__buttons', N = ':not(#lmx-x)';
                var Bt = C + ' > .full-start__button' + N, Sb = C + ' .simple-button' + N;
                var base = 'width:auto !important;height:auto !important;min-height:0 !important;padding:.55em 1em !important;margin:0 .5em .5em 0 !important;border-radius:.8em !important;background:rgba(255,255,255,.14) !important;color:#fff !important;font-size:.95em !important;font-weight:inherit !important;line-height:inherit !important;border:0 !important;box-shadow:none !important;text-shadow:none !important;transform:none !important;justify-content:flex-start !important;backdrop-filter:none !important;-webkit-backdrop-filter:none !important;';
                var foc = 'background:#fff !important;color:#111 !important;box-shadow:none !important;transform:none !important;';
                return C + N + '{flex-wrap:wrap !important;align-items:normal !important;margin-top:.4em !important}' +
                    Bt + ',' + Sb + '{' + base + '}' +
                    Bt + '.focus,' + Sb + '.focus{' + foc + '}' +
                    Bt + '::before,' + Bt + '::after{content:none !important}' +
                    Bt + ' svg{display:block !important}' +
                    Bt + ' span{display:inline !important;margin:0 !important;padding:0 !important;text-shadow:none !important;color:inherit !important}' +
                    Bt + ':nth-child(n+4):not(.button--priority):not(.lmx-primary) span{display:none !important}' +
                    Bt + ':nth-child(n+4).focus span{display:inline !important}' +
                    // кнопки афиши — тоже без стекла
                    'html body .lmx-hero__btn,html body .lmx-hero__about,html body .lmx-hero__circ{backdrop-filter:none !important;-webkit-backdrop-filter:none !important;box-shadow:none !important}' +
                    'html body .lmx-hero__about,html body .lmx-hero__circ{background:rgba(255,255,255,.14) !important;color:#fff !important}';
            })() +
            'body.lmx-full .lmx-logo{display:block;width:auto;height:auto;object-fit:contain;max-width:calc(34vw * var(--lmx-ls,1)) !important;max-height:calc(24vh * var(--lmx-ls,1)) !important}' +
            '@media (max-width:760px){' +
                'body.lmx-logo-on .full-start-new__title.lmx-has-logo{display:block !important;font-size:0 !important;line-height:0 !important;height:auto !important;max-height:none !important;overflow:visible !important;-webkit-line-clamp:unset !important;line-clamp:unset !important;margin-bottom:.4em !important}' +
                'body.lmx-logo-on .lmx-logo{display:block;width:auto;height:auto;object-fit:contain;margin:0 0 .6vh 0;max-width:calc(78vw * var(--lmx-lsm,1)) !important;max-height:calc(18vh * var(--lmx-lsm,1)) !important}' +
            '}';
    }
    function applyStyle() {
        safe(applyFullClass);
        safe(function () { if (document.body) document.body.classList.toggle('lmx-nogap', !flexGapOk()); });
        safe(applyThemeClass);
        safe(themeWatch);
        safe(function () {
            var rs = document.documentElement.style;
            rs.setProperty('--lmx-ls', String((parseInt(getStr('lmx_logo_size', '100'), 10) || 100) / 100));
            rs.setProperty('--lmx-lsm', String((parseInt(getStr('lmx_logo_size_m', '100'), 10) || 100) / 100));
        });
        var s = document.getElementById('lmx-css');
        if (!s) {
            s = document.createElement('style');
            s.id = 'lmx-css';
            document.head.appendChild(s);
        }
        s.textContent = buildCss() + themeCss() + premCss() + appleCss() + detailCss() + detailCss('body.lmx-ph ') + phoneCss() + miniCss() + heroPhoneCss() + nogapCss() + timetableCss() + journalCss() + menuFitCss() + textCss() + crispCss();
    }

    function looksLikeCard(o) {
        return !!(o && typeof o === 'object' && !o.nodeType &&
            (typeof o.id === 'number' || /^\d+$/.test(String(o.id || ''))) &&
            (o.title || o.name || o.original_title || o.original_name));
    }
    function getData(el) {
        if (looksLikeCard(el.card_data)) return el.card_data;
        var k;
        for (k in el) {
            try { if (looksLikeCard(el[k])) return el[k]; } catch (e) {}
        }
        if (window.$) {
            var dd = window.$(el).data();
            for (k in dd) { if (looksLikeCard(dd[k])) return dd[k]; }
        }
        return null;
    }

    function hideEl(el) {
        el.style.display = 'none';
        el.setAttribute('data-lmxhid', '1');
    }

    function hideNativeTv(view) {
        var ch = view.children;
        for (var i = 0; i < ch.length; i++) {
            var n = ch[i];
            if (n.style.display === 'none' || (n.className && String(n.className).indexOf('lmx-') >= 0)) continue;
            if (n.children.length < 2 && RE_NATIVE_TV.test(n.textContent)) hideEl(n);
        }
    }
    function addTo(view, cls, html) {
        var d = document.createElement('div');
        d.className = cls;
        d.innerHTML = html;
        view.appendChild(d);
    }
    function addMark(view, m) {
        if (!m || !getBool('lmx_marks', true) || view.querySelector('.lmx-mark')) return;
        var mh = '<span class="lmx-pill lmx-mark lmx-m-' + m.c + '">' + m.t + '</span>', tr = view.querySelector('.lmx-tr');
        if (tr) tr.insertAdjacentHTML('afterbegin', mh); else addTo(view, 'lmx-tr', mh);
    }
    var GENRES = { 28: 'Боевик', 12: 'Приключения', 16: 'Мультфильм', 35: 'Комедия', 80: 'Криминал', 99: 'Документальный', 18: 'Драма', 10751: 'Семейный',
        14: 'Фэнтези', 36: 'История', 27: 'Ужасы', 10402: 'Музыка', 9648: 'Детектив', 10749: 'Мелодрама', 878: 'Фантастика', 10770: 'ТВ-фильм',
        53: 'Триллер', 10752: 'Военный', 37: 'Вестерн', 10759: 'Боевик', 10762: 'Детский', 10763: 'Новости', 10764: 'Реалити',
        10765: 'Фантастика', 10766: 'Мыльная опера', 10767: 'Ток-шоу', 10768: 'Война и политика' };
    function genresOf(d) {
        var ids = d.genre_ids || (d.genres || []).map(function (g) { return g.id; }) || [];
        var out = [];
        for (var i = 0; i < ids.length && out.length < 2; i++) { var n = GENRES[ids[i]]; if (n && out.indexOf(n) < 0) out.push(n); }
        return out.join(', ');
    }
    function cinemaOverlay(view, d, type) {
        if (view.querySelector('.lmx-cin')) return;
        var v = Number(d.vote_average) || 0;
        var year = String(d.release_date || d.first_air_date || '').slice(0, 4);
        var g = genresOf(d);
        var title = d.title || d.name || '';
        var html = '<div class="lmx-cin__g">' + esc(type === 'tv' ? ('Сериал' + (g ? ' · ' + g : '')) : g) + '</div>' +
            '<div class="lmx-cin__t">' + esc(title) + '</div>' +
            '<div class="lmx-cin__r">' +
            (v > 0 ? '<span class="lmx-cin__v" style="color:' + ratingColor(v) + '"><i>&#9734;</i> ' + v.toFixed(1) + '</span>' : '<span></span>') +
            '<span class="lmx-cin__y">' + year + '</span></div>';
        addTo(view, 'lmx-cin', html);
    }


    try { if (!Lampa.Storage.get('lmx_uaq_mig', '')) { Lampa.Storage.set('lmx_uaq_mig', '1'); var u0 = Lampa.Storage.get('lmx_uaq', true); if (u0 === false || u0 === 'false') Lampa.Storage.set('lmx_uaq_q', false); } } catch (e) {}
    var UAQ_KEY = 'lmx_uaq_c12', UAQ_LBL = { 4: '4K', 3: '1080p', 2: '720p' }, uaqC = null, uaqSaveT = 0, uaqQ = [], uaqAct = {}, uaqFail = {}, uaqTimer = 0;
    function uaqCache() {
        if (uaqC) return uaqC;
        try { var o = Lampa.Storage.get(UAQ_KEY, {}); uaqC = (o && typeof o === 'object' && !o.length) ? o : {}; } catch (e) { uaqC = {}; }
        try {
            if (Lampa.Storage.get('lmx_uaq_rv', '') !== 'e3') {
                for (var k in uaqC) if (!(uaqC[k].u || uaqC[k].q >= 2)) delete uaqC[k];
                Lampa.Storage.set('lmx_uaq_rv', 'e3'); Lampa.Storage.set(UAQ_KEY, uaqC);
            }
        } catch (e) {}
        return uaqC;
    }
    function uaqSave() {
        clearTimeout(uaqSaveT);
        uaqSaveT = setTimeout(function () {
            try {
                var k = Object.keys(uaqC || {}), i;
                if (k.length > 900) {
                    k.sort(function (a, b) { return (uaqC[a].t || 0) - (uaqC[b].t || 0); });
                    for (i = 0; i < k.length - 650; i++) delete uaqC[k[i]];
                }
                Lampa.Storage.set(UAQ_KEY, uaqC);
            } catch (e) {}
        }, 4000);
    }
    function uaqLong(t) { return String(t || '').replace(/[^a-z0-9\u0400-\u04ff]+/gi, '').length >= 5; }
    function uaqNorm(t) { return String(t || '').toLowerCase().replace(/[^a-z0-9Ѐ-ӿ]+/g, ''); }
    function uaqQual(it) {
        var n = Number(it.quality) || 0, t = String(it.title || it.Title || '').toLowerCase();
        if (n >= 2160 || /(^|[^a-z0-9])(4k|2160p?|uhd)([^a-z0-9]|$)/.test(t)) return 4;
        if (n >= 1080 || /(^|[^a-z0-9])(1080p?|fhd)([^a-z0-9]|$)/.test(t)) return 3;
        if (n >= 720 || /(^|[^a-z0-9])(720p?|hd)([^a-z0-9]|$)/.test(t)) return 2;
        return n > 0 ? 1 : 0;
    }
    var UAQ_RX1 = /(^|[^a-z0-9])(ukr|ua|ukrainian)([^a-z0-9]|$)|ukr[ _-]?(dub|sub|aud|voice)/i;
    var UAQ_RX2 = /(^|[^а-яіїєґa-z])укр(\.|[^а-яіїєґ]|$)|(українськ|украинск)\S*\s*(озвуч|дубл|багатоголос|закадров)|(озвуч|дубл|багатоголос|закадров)\S*[^,;]{0,20}(українськ|украинск)/i;
    function uaqUa(it) {
        var v = it.voices, l = it.languages, vs = (v && v.join ? v.join(' | ') : String(v || '')), ls = (l && l.join ? l.join(' ') : String(l || '')), t = String(it.title || it.Title || '');
        if (UAQ_RX1.test(t) || UAQ_RX2.test(t) || UAQ_RX1.test(vs) || UAQ_RX2.test(vs)) return true;
        return /(^|[^a-z])(uk|ukr|ua)([^a-z]|$)/i.test(ls);
    }
    function uaqParse(j, job) {
        var arr = Array.isArray(j) ? j : ((j && (j.Results || j.results)) || []), wants = [], qAll = 0, qUa = 0, ua = job.uk ? 1 : 0, i, it, nm, y, ok, m = 0, w;
        var src = job.wants || [job.title, job.alt];
        for (i = 0; i < src.length; i++) if (src[i]) wants.push(uaqNorm(src[i]));
        for (i = 0; i < arr.length; i++) {
            it = arr[i];
            if (!it || typeof it !== 'object') continue;
            nm = uaqNorm(it.originalname || it.originalName || ''); var nn = uaqNorm(it.name || '');
            ok = !job.strict;
            y = Number(it.relased || it.released) || 0;
            var soft = job.type === 'movie' && y && Math.abs(y - job.yr) <= 1;
            for (w = 0; w < wants.length && !ok; w++) {
                if (!wants[w]) continue;
                if (nm || nn) ok = nm === wants[w] || nn === wants[w] || (soft && wants[w].length >= 7 && ((nm.length >= 7 && (nm.indexOf(wants[w]) >= 0 || wants[w].indexOf(nm) >= 0)) || (nn.length >= 7 && (nn.indexOf(wants[w]) >= 0 || wants[w].indexOf(nn) >= 0))));
                else { var tt = uaqNorm(it.title || it.Title); ok = tt && tt.indexOf(wants[w]) >= 0; }
            }
            if (!ok) continue;
            if (job.type === 'movie' && y && Math.abs(y - job.yr) > 1) continue;
            m++;
            var q = uaqQual(it), u = uaqUa(it);
            if (q > qAll) qAll = q;
            if (u) { ua = 1; if (q > qUa) qUa = q; }
        }
        return { q: ua && qUa ? qUa : qAll, u: ua ? 1 : 0, t: Date.now(), m: m };
    }
    function uaqAdd(view, r, force) {
        if (!r || !view) return;
        var offUa = !getBool('lmx_uaq', true), offQ = !getBool('lmx_uaq_q', true);
        if (offUa || offQ) r = { u: offUa ? 0 : r.u, q: offQ ? 0 : r.q };
        if (!(r.u || r.q >= 2)) return;
        var q = r.q >= 2 ? UAQ_LBL[r.q] : '', old, cin;
        var hostK = view.closest ? (view.closest('.card--lmxhero') ? 'h' : (view.closest('.card--lmxhist') ? 'l' : '')) : '';
        if (hostK) {
            var meta = hostK === 'l' ? view.querySelector('.lmx-hist__text') : (view.querySelector('.lmx-hero__kick') || view.querySelector('.lmx-hero__meta'));
            old = view.querySelector('.lmx-hero__uaq');
            if (old && force) { if (old.parentNode) old.parentNode.removeChild(old); old = null; }
            if (!old && meta) {
                var hs = document.createElement('span');
                hs.className = 'lmx-hero__uaq' + (hostK === 'l' ? ' lmx-hist__uaq' : '');
                if (hostK === 'l' && meta.classList) meta.classList.add('lmx-hasuaq');
                hs.innerHTML = (r.u ? '<em><span>U</span><span>A</span></em>' : '') + (r.u && q ? '<s></s>' : '') + (q ? '<b>' + q + '</b>' : '');
                meta.appendChild(hs);
            }
            return;
        }
        old = view.querySelector('.lmx-uaq');
        if (old && force) { if (old.parentNode) old.parentNode.removeChild(old); old = null; }
        if (!old) {
            var sp = document.createElement('div');
            sp.className = 'lmx-uaq';
            sp.innerHTML = (r.u ? '<i></i>' : '') + '<b>' + q + '</b>';
            view.appendChild(sp);
        }
        old = view.querySelector('.lmx-uaqc');
        if (old && force) { if (old.parentNode) old.parentNode.removeChild(old); old = null; }
        cin = view.querySelector('.lmx-cin');
        if (!old && cin) {
            var cr = document.createElement('div');
            cr.className = 'lmx-uaqc';
            cr.innerHTML = (r.u ? '<em><span>U</span><span>A</span></em>' : '') + (r.u && q ? '<s></s>' : '') + (q ? '<b>' + q + '</b>' : '');
            cin.insertBefore(cr, cin.firstChild);
        }
    }
    function uaqNearJob(j) {
        if (uaqNear(j.el)) return true;
        for (var i = 0; i < j.views.length && i < 6; i++) { var vw = j.views[i], cd = vw && vw.closest ? vw.closest('.card') : null; if (cd && cd !== j.el && uaqNear(cd)) return true; }
        return false;
    }
    function uaqNear(el) {
        var r = el.getBoundingClientRect(), W = window.innerWidth || 1280, H = window.innerHeight || 720;
        return r.width > 0 && r.right > -W * 0.8 && r.left < W * 2.2 && r.bottom > -H * 0.8 && r.top < H * 2;
    }
    var uaqDbg = { ok: 0, fail: 0, last: '' }, uaqDown = { n: 0, until: 0 };
    function uaqItems(j) {
        if (Array.isArray(j)) return j;
        if (!j || typeof j !== 'object') return null;
        var k, ks = ['Results', 'results', 'data', 'items', 'torrents'];
        for (k = 0; k < ks.length; k++) if (Array.isArray(j[ks[k]])) return j[ks[k]];
        for (k in j) if (Array.isArray(j[k])) return j[k];
        return null;
    }
    var uaqMode = '', uaqBadCombo = {}, UAQ_PUB = 'http://jack.spawn.pp.ua', UAQ_PUB_KEY = '2';
    function uaqCombos() {
        var hosts = [], h, i, out = [], cfg = '';
        try { cfg = String(Lampa.Storage.get('jackett_url', '') || '').replace(/^\s+|\s+$/g, '').replace(/\/+$/, '').replace('jacred.xyz', 'jac.red'); } catch (e) {}
        hosts.push('https://kinohub.uk');
        if (cfg) hosts.push(/^https?:\/\//i.test(cfg) ? cfg : 'https://' + cfg);
        hosts.push(UAQ_PUB);
        hosts.push('https://jac.red');
        for (i = 0; i < hosts.length; i++) if (hosts.indexOf(hosts[i]) === i) { if (hosts[i] !== UAQ_PUB) out.push(hosts[i] + '|v1'); out.push(hosts[i] + '|v2'); }
        try { if (!uaqMode) uaqMode = String(Lampa.Storage.get('lmx_uaq_mode3', '') || ''); } catch (e) {}
        if (uaqMode && out.indexOf(uaqMode) > 0) { out.splice(out.indexOf(uaqMode), 1); out.unshift(uaqMode); }
        return out;
    }
    function uaqGet(q, yr, cb, maxHosts) {
        var key = '', qq = String(q).toLowerCase().replace(/[?!:;"«»“”„…]+/g, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '') || String(q), now = Date.now(), all = uaqCombos(), order = [], i;
        try { key = String(Lampa.Storage.get('jackett_key', '') || ''); } catch (e) {}
        for (i = 0; i < all.length; i++) if (!(uaqBadCombo[all[i]] && now - uaqBadCombo[all[i]] < 300000) && !(maxHosts && all[i].split('|')[0] === UAQ_PUB)) order.push(all[i]);
        var vi = 0, fails = [], emptyTag = '', emptyHosts = 0;
        function urlFor(c) {
            var p = c.split('|'), base = p[0], kk = base === UAQ_PUB ? UAQ_PUB_KEY : key;
            if (p[1] === 'v2') return base + '/api/v2.0/indexers/all/results?apikey=' + encodeURIComponent(kk) + '&Query=' + encodeURIComponent(qq) + (yr ? '&year=' + yr : '');
            return base + '/api/v1.0/torrents?search=' + encodeURIComponent(qq) + (yr ? '&relased=' + yr : '') + (key ? '&apikey=' + encodeURIComponent(key) : '');
        }
        function next(why) {
            if (why) fails.push(why);
            if (vi >= order.length && emptyTag) return cb([], '', emptyTag);
            if (vi >= order.length) {
                var w = fails.join('; ') || 'все адреса недоступны';
                uaqDbg.fail++; uaqDbg.last = w;
                if (!uaqDbg.warned && uaqDbg.fail >= 6 && !uaqDbg.ok) { uaqDbg.warned = 1; try { if (Lampa.Noty) Lampa.Noty.show('Метки качества: нет связи с JacRed (' + w.slice(0, 160) + ')', { time: 12000 }); } catch (e) {} }
                if (++uaqDown.n >= 4) { uaqDown.n = 0; uaqDown.until = Date.now() + 120000; }
                return cb(null, w);
            }
            var c = order[vi++], url = urlFor(c), done = false, tag = c.replace(/^https?:\/\//, '');
            function fin(j, bad) {
                if (done) return; done = true;
                if (!bad && typeof j === 'string' && !/\S/.test(j)) j = [];
                if (!bad && typeof j === 'string') { try { j = JSON.parse(j); } catch (e) { bad = 'не JSON'; } }
                if (!bad) {
                    var arr = uaqItems(j);
                    if (arr) j = arr;
                    else if (j === null || j === undefined || j === '' || (typeof j === 'object' && !Object.keys(j).length)) j = [];
                    else bad = 'незнакомый формат';
                }
                if (bad) { uaqBadCombo[c] = Date.now(); return next(tag + ': ' + bad); }
                delete uaqBadCombo[c];
                uaqDown.n = 0; uaqDbg.ok++; uaqDbg.last = 'ok ' + tag;
                if (!j.length) {
                    if (!emptyTag) emptyTag = tag;
                    if (maxHosts && ++emptyHosts >= maxHosts) vi = order.length;
                    var hb = c.split('|')[0];
                    while (vi < order.length && order[vi].split('|')[0] === hb) vi++;
                    return next('');
                }
                if (uaqMode !== c) { uaqMode = c; try { Lampa.Storage.set('lmx_uaq_mode3', c); } catch (e) {} }
                cb(j, '', tag);
            }
            try {
                if (Lampa.Reguest) { var n = new Lampa.Reguest(); n.timeout(9000); n.native(url, function (j) { fin(j); }, function (e) { fin(null, 'нет ответа' + (e && e.status ? ' ' + e.status : '')); }); }
                else {
                    var x = new XMLHttpRequest(); x.open('GET', url, true); x.timeout = 9000;
                    x.onload = function () { if (x.status === 200) fin(x.responseText); else fin(null, 'HTTP ' + x.status); };
                    x.onerror = x.ontimeout = function () { fin(null, 'нет ответа'); };
                    x.send();
                }
            } catch (e) { fin(null, 'ошибка запроса'); }
        }
        next('');
    }
    function uaqTr(job, cb) {
        try {
            var kind = job.type === 'tv' ? 'tv' : 'movie';
            Lampa.Api.sources.tmdb.get(kind + '/' + job.id + '/translations', {}, function (j) {
                var out = [], list = (j && j.translations) || [], i, d, nm, want = { ru: 1, en: 1 };
                for (i = 0; i < list.length; i++) {
                    if (!want[list[i].iso_639_1]) continue;
                    d = list[i].data || {};
                    nm = d.title || d.name;
                    if (nm) out.push(String(nm));
                }
                cb(out);
            }, function () { cb([]); });
        } catch (e) { cb([]); }
    }
    var uaqDeep = [], uaqPend = {}, uaqNoMark = [];
    function uaqStep(job, q, y, j, r) {
        (job.steps || (job.steps = [])).push(String(q).slice(0, 24) + (y ? ' ' + y : '') + ': ' + (j ? ((uaqItems(j) || []).length + '/' + (r ? r.m : 0)) : 'сбой'));
    }
    function uaqBusyN() {
        var n = 0, k, now = Date.now();
        for (k in uaqAct) { if (now - uaqAct[k] > 30000) delete uaqAct[k]; else n++; }
        return n;
    }
    var uaqUaf = [], uaqUafPend = {};
    function uaqUafQueue(job, r) {
        if (!job || !r || r.u || r.f || uaqUafPend[job.key]) return;
        uaqUafPend[job.key] = 1;
        uaqUaf.push(job);
    }
    function uaqUaflix(job, cb) {
        var url = 'https://banderabackend.lampame.v6.rocks/api/v2/search?source=uaflix&original_title=' + encodeURIComponent(job.title) + (job.alt ? '&title=' + encodeURIComponent(job.alt) : '') + '&type=' + (job.type === 'tv' ? 'series' : 'movie'), done = false;
        function fin(j, bad) {
            if (done) return; done = true;
            if (bad) return cb(null);
            if (typeof j === 'string') { try { j = JSON.parse(j); } catch (e) { return cb(null); } }
            cb(!!(j && j.ok && j.items && j.items.length > 0));
        }
        try {
            if (Lampa.Reguest) { var n = new Lampa.Reguest(); n.timeout(6000); n.native(url, function (j) { fin(j); }, function () { fin(null, 1); }); }
            else {
                var x = new XMLHttpRequest(); x.open('GET', url, true); x.timeout = 6000;
                x.onload = function () { if (x.status === 200) fin(x.responseText); else fin(null, 1); };
                x.onerror = x.ontimeout = function () { fin(null, 1); };
                x.send();
            }
        } catch (e) { fin(null, 1); }
    }
    function uaqUafRun(job) {
        uaqAct[job.key] = job.t0 = Date.now();
        uaqUaflix(job, function (ok) {
            delete uaqAct[job.key]; delete uaqUafPend[job.key];
            if (ok === null) return;
            var c = uaqCache()[job.key] || { q: job.q || 0, u: 0, t: Date.now() };
            c.f = 1; if (ok) c.u = 1;
            uaqCache()[job.key] = c; uaqSave();
            if (!ok) return;
            var m = uaqMerge(c, job.id), i;
            for (i = 0; i < job.views.length; i++) { var v = job.views[i]; safe(function () { if (v && v.isConnected !== false) uaqAdd(v, m, true); }); }
        });
    }
    function uaqFinish(job, r) {
        uaqCache()[job.key] = { q: r.q, u: r.u, t: r.t }; uaqSave();
        if (!(r.u || r.q >= 2)) { uaqNoMark.push(job.title.slice(0, 26) + ' [' + job.yr + ' ' + job.type + '] ' + (job.steps || []).join(' | ')); if (uaqNoMark.length > 12) uaqNoMark.shift(); }
        delete uaqPend[job.key];
        uaqUafQueue(job, r);
        var m = uaqMerge(r, job.id), i;
        for (i = 0; i < job.views.length; i++) { var v = job.views[i]; safe(function () { if (v && v.isConnected !== false) uaqAdd(v, m); }); }
    }
    function uaqGiveUp(job) {
        job.tries = (job.tries || 0) + 1;
        if (job.tries <= 3) { job.after = Date.now() + 15000 * job.tries; uaqQ.push(job); return; }
        delete uaqPend[job.key]; uaqFail[job.key] = Date.now();
        uaqNoMark.push(job.title.slice(0, 26) + ' [' + job.yr + ' ' + job.type + '] СБОЙ СЕТИ' + (job.steps || []).join(' | ')); if (uaqNoMark.length > 12) uaqNoMark.shift();
    }
    function uaqFetch(job) {
        uaqAct[job.key] = job.t0 = Date.now();
        job.wants = [job.title].concat(job.alt ? [job.alt] : []);
        var tv = job.type === 'tv';
        if (!uaqNorm(job.title)) {
            delete uaqAct[job.key];
            job.last = { q: 0, u: job.uk ? 1 : 0, t: Date.now(), m: 0 };
            (job.steps || (job.steps = [])).push('иероглифы: пропущено');
            uaqDeep.push(job);
            return;
        }
        uaqGet(job.title, tv ? 0 : job.yr, function (j) {
            delete uaqAct[job.key];
            if (!j) return uaqGiveUp(job);
            var r = uaqParseMany(j, job, job.wants, tv || !uaqLong(job.title));
            uaqStep(job, job.title, tv ? 0 : job.yr, j, r);
            if (r.m) return uaqFinish(job, r);
            job.last = r;
            uaqDeep.push(job);
        });
    }
    function uaqDeepRun(job) {
        uaqAct[job.key] = job.t0 = Date.now();
        var plan = [], trDone = false, wants = job.wants, noYear = job.type === 'tv';
        if (job.type === 'tv' && uaqNorm(job.title)) plan.push([job.title, job.yr]);
        if (job.alt && uaqNorm(job.alt)) plan.push(job.type === 'tv' ? [job.alt, 0, 1] : [job.alt, job.yr]);
        function go() {
            var p = plan.shift();
            if (!p) {
                if (!trDone) {
                    trDone = true;
                    return uaqTr(job, function (names) {
                        for (var q = 0; q < names.length; q++) {
                            if (wants.indexOf(names[q]) >= 0 || !uaqNorm(names[q])) continue;
                            wants.push(names[q]);
                            plan.push(job.type === 'tv' ? [names[q], 0, 1] : [names[q], job.yr]);
                        }
                        go();
                    });
                }
                if (!noYear) { noYear = true; if (uaqNorm(job.title)) { plan.push([job.title, 0, 1]); return go(); } }
                delete uaqAct[job.key]; return uaqFinish(job, job.last);
            }
            uaqGet(p[0], p[1], function (j) {
                if (!j) return go();
                var r = uaqParseMany(j, job, wants, p[2] || job.type === 'tv' || !uaqLong(p[0]));
                uaqStep(job, p[0], p[1], j, r);
                if (r.m) { delete uaqAct[job.key]; return uaqFinish(job, r); }
                go();
            }, 1);
        }
        go();
    }
    function uaqParseMany(j, job, wants, strict) { return uaqParse(j, { wants: wants, type: job.type, yr: job.yr, uk: job.uk, strict: !!strict }); }
    var UAQ_SRC_RX = /(^|[^a-z])ua|укр|uaflix|uakino|makhno|eneyida|kinobaza|animeon|toloka|tvukr|ashdi|kinoukr|uaserial|animeua|bambooua|wormhole|kinotron|petlura|mikai|bamboo|unimay|anihub|aniworld|anitube|moonanime|kinostrain|ufdub|moviestape|[еe]н[еe][їi]д|ukr/i;
    function uaqWatch(id) {
        try {
            var o = Lampa.Storage.get('lmx_online_qm', {}), m = o && o[String(id)];
            if (!m || !m.l || Date.now() - (m.t || 0) > 604800000) return null;
            var ua = 0, best = 0, k;
            for (k in m.l) if (UAQ_SRC_RX.test(k)) { ua = 1; if (m.l[k] > best) best = m.l[k]; }
            return ua ? { u: 1, q: best } : null;
        } catch (e) { return null; }
    }
    function uaqMerge(r, id) {
        var w = uaqWatch(id);
        if (!w) return r;
        return { u: 1, q: Math.max(r && r.q || 0, w.q), t: r && r.t || 0 };
    }
    function uaqTick() {
        if (document.hidden || (!uaqQ.length && !uaqDeep.length && !uaqUaf.length) || Date.now() < uaqDown.until) return;
        var keep = [], i, j, nearLeft = 0;
        for (i = 0; i < uaqQ.length; i++) {
            j = uaqQ[i];
            if (!document.documentElement.contains(j.el)) {
                var alt = null, vi;
                for (vi = 0; vi < j.views.length; vi++) { var vw = j.views[vi], cd = vw && vw.closest ? vw.closest('.card') : null; if (cd && document.documentElement.contains(cd)) { alt = cd; break; } }
                if (!alt && j.t00 && Date.now() - j.t00 < 8000) { keep.push(j); continue; }
                if (!alt) { delete uaqPend[j.key]; continue; }
                j.el = alt;
            }
            if (j.after && j.after > Date.now()) keep.push(j);
            else if (!uaqNearJob(j)) keep.push(j);
            else if (uaqBusyN() < 4) uaqFetch(j);
            else { keep.push(j); nearLeft++; }
        }
        if (keep.length > 400) { for (i = 0; i < keep.length - 400; i++) delete uaqPend[keep[i].key]; keep = keep.slice(keep.length - 400); }
        uaqQ = keep;
        while (!nearLeft && uaqDeep.length && uaqBusyN() < 2) {
            j = uaqDeep.shift();
            if (document.documentElement.contains(j.el)) uaqDeepRun(j); else uaqFinish(j, j.last);
        }
        while (!nearLeft && !uaqDeep.length && uaqUaf.length && uaqBusyN() < 2) {
            j = uaqUaf.shift();
            if (document.documentElement.contains(j.el)) uaqUafRun(j); else delete uaqUafPend[j.key];
        }
    }
    function uaqWant(view, d, type) {
        if (!d || !d.id || (!getBool('lmx_uaq', true) && !getBool('lmx_uaq_q', true))) return;
        var key = type + d.id, c = uaqCache()[key], now = Date.now();
        var wv = uaqWatch(d.id);
        if (wv && wv.q >= 3) { uaqAdd(view, wv); return; }
        if (c && now - (c.t || 0) < ((c.u || c.q >= 2) ? 259200000 : 43200000)) {
            uaqAdd(view, uaqMerge(c, d.id));
            if (!c.u && !c.f && !uaqUafPend[key]) {
                var ty = type === 'tv' ? (d.original_name || d.original_title || d.name) : (d.original_title || d.original_name || d.title), al = type === 'tv' ? (d.name || d.title) : (d.title || d.name);
                if (ty) { uaqUafQueue({ id: d.id, key: key, views: [view], el: view.closest ? (view.closest('.card') || view) : view, type: type, title: String(ty), alt: al && String(al) !== String(ty) ? String(al) : '', q: c.q }, c); if (!uaqTimer) uaqTimer = setInterval(function () { safe(uaqTick); }, 1200); }
            }
            return;
        }
        if (uaqFail[key] && now - uaqFail[key] < 600000) return;
        var date = String(d.release_date || d.first_air_date || ''), yr = parseInt(date.slice(0, 4), 10);
        if (!yr || (date.length >= 10 && Date.parse(date) > now)) return;
        var title = type === 'tv' ? (d.original_name || d.original_title || d.name) : (d.original_title || d.original_name || d.title);
        if (!title) return;
        var pj = uaqPend[key];
        if (pj && pj.t0 && now - pj.t0 > 45000) { delete uaqPend[key]; delete uaqAct[key]; pj = null; }
        if (pj) { pj.views.push(view); return; }
        var el = view.closest ? view.closest('.card') : view.parentNode;
        var alt = type === 'tv' ? (d.name || d.title) : (d.title || d.name);
        var job = { id: d.id, key: key, views: [view], el: el || view, type: type, title: String(title), alt: alt && String(alt) !== String(title) ? String(alt) : '', yr: yr, uk: d.original_language === 'uk' };
        job.t00 = now; uaqPend[key] = job; uaqQ.push(job);
        if (!uaqTimer) uaqTimer = setInterval(function () { safe(uaqTick); }, 1200);
        safe(uaqTick);
    }

    function extras(el, d, type) {
        var view = el.querySelector('.card__view');
        if (!view) return;
        hideNativeTv(view);
        cinemaOverlay(view, d, type);
        if (type === 'movie') addMark(view, movieMark(d));
        safe(function () { uaqWant(view, d, type); });
    }

    function renderTv(el, j, noBox) {
        var view = el.querySelector('.card__view');
        if (!view) return;
        var st = airedStats(j);
        if (!noBox && !view.querySelector('.lmx-box') && st) {
            addTo(view, 'lmx-box', '<span class="lmx-pill">' + sizeLabel(st) + '</span>');
        }
        addMark(view, tvMark(j));
    }

    function load(id, cb) {
        var key = 'tv/' + id;
        if (mem[key]) return cb(mem[key]);
        Lampa.Api.sources.tmdb.get(key, {}, function (j) {
            mem[key] = j || {};
            memKeys.push(key);
            while (memKeys.length > 300) delete mem[memKeys.shift()];
            cb(mem[key]);
        }, function () {
            cb(null);
        }, { life: CACHE_MIN });
    }

    var work = [], workTimer = null;
    var navT = 0;
    document.addEventListener('keydown', function (e) { var k = e.keyCode; if (k >= 37 && k <= 40) navT = Date.now(); }, true);
    function navBusy() { return Date.now() - navT < 450; }
    function addWork(job) {
        work.push(job);
        if (!workTimer) workTimer = setTimeout(runWork, 30);
    }
    function runWork() {
        workTimer = null;
        if (navBusy()) { workTimer = setTimeout(runWork, 160); return; }
        var now = Date.now(), left = [], done = 0, fastDone = 0;
        for (var i = 0; i < work.length; i++) {
            var j = work[i];
            if (j.due > now || (!j.fast && done >= 6) || (j.fast && fastDone >= 18)) { left.push(j); continue; }
            if (!j.fast) done++; else fastDone++;
            if (document.body.contains(j.el)) safe(j.fn);
        }
        work = left;
        if (work.length) workTimer = setTimeout(runWork, fastDone >= 18 ? 40 : 120);
    }

    var pumpTimer = null;
    function pumpSoon() {
        if (pumpTimer) return;
        pumpTimer = setTimeout(function () { pumpTimer = null; pump(); }, 60);
    }
    function pump() {
        while (active < MAX_PARALLEL && queue.length) {
            if (queue[0] && queue[0].el && queue[0].el.isConnected === false) { queue.shift(); continue; }
            (function (task) {
                active++;
                load(task.id, function (j) {
                    active--;
                    if (j) renderTv(task.el, j, task.noBox);
                    if (queue.length) setTimeout(pump, 120);
                });
            })(queue.shift());
        }
    }

    var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            var vis = typeof e.isIntersecting === 'boolean' ? e.isIntersecting : ((e.intersectionRatio || 0) > 0 || !!(e.intersectionRect && (e.intersectionRect.width || e.intersectionRect.height)));
            if (!vis) return;
            io.unobserve(e.target);
            if (e.target.__lmx) queue.push(e.target.__lmx);
        });
        pumpSoon();
    }, { rootMargin: '300px' }) : null;


    var padT = 0;
    function padFix() {
        if (!board()) return;
        var act = document.querySelector('.activity--active') || document.body;
        var ar = null;
        var lines = act.querySelectorAll('.items-line:not(.lmx-hero-line)');
        for (var i = 0; i < lines.length; i++) {
            try {
                var body = lines[i].querySelector('.scroll--horizontal .scroll__body');
                if (!body || !body.firstElementChild || body.firstElementChild.classList.contains('lmx-endpad')) continue;
                if (body.__lmxN === body.children.length && body.lastElementChild && body.lastElementChild.classList.contains('lmx-endpad')) continue;
                if (!ar) ar = act.getBoundingClientRect();
                var pad = body.querySelector(':scope > .lmx-endpad');
                if (!pad) { pad = document.createElement('div'); pad.className = 'lmx-endpad'; pad.style.cssText = 'flex:none;width:0;height:1px;pointer-events:none'; }
                if (body.lastElementChild !== pad) body.appendChild(pad);
                body.style.setProperty('padding-right', '0', 'important');
                var cs = getComputedStyle(body), first = body.firstElementChild, prev = pad.previousElementSibling;
                var tx = 0;
                if (cs.transform && cs.transform !== 'none') tx = new DOMMatrix(cs.transform).m41;
                var left = first.getBoundingClientRect().left - tx - ar.left;
                var sc = body.parentElement.getBoundingClientRect();
                var lm = prev ? (parseFloat(getComputedStyle(prev).marginRight) || 0) : 0;
                var w = Math.round(left - lm - (ar.right - sc.right));
                if (left > 0 && w >= 0 && w <= 160 && pad.__w !== w) { pad.__w = w; pad.style.width = w + 'px'; }
                if (left > 0) body.__lmxN = body.children.length;
            } catch (e) {}
        }
    }
    function fixEpisodeGaps() {
        var eps = document.querySelectorAll('.card-episode:not([data-lmxgap])');
        for (var i = 0; i < eps.length; i++) {
            var e = eps[i], pv = e.previousElementSibling;
            if (!pv) continue;
            e.setAttribute('data-lmxgap', '1');
            if (pv.classList && pv.classList.contains('card-episode')) e.style.setProperty('margin-left', '1.2em', 'important');
        }
    }
    function dropPageMask() {
        var ls = document.querySelectorAll('.items-line:not([data-lmxpm])');
        for (var i = 0; i < ls.length; i++) {
            ls[i].setAttribute('data-lmxpm', '1');
            var sc = ls[i].closest ? ls[i].closest('.scroll--mask') : null;
            if (sc && !sc.classList.contains('lmx-nomask')) sc.classList.add('lmx-nomask');
        }
    }
    function scan() {
        safe(fixEpisodeGaps);
        safe(dropPageMask);
        var cards = document.querySelectorAll('.card:not([data-lmx])');
        cards.forEach(function (el) {
            el.setAttribute('data-lmx', '1');
            if (el.classList.contains('card--lmxhero')) {
                var ln = el.closest('.items-line');
                if (ln) { ln.classList.add('lmx-hero-line'); if (!board() && !ln.classList.contains('lmx-mini--svc')) ln.classList.add('lmx-mini', 'lmx-mini--def'); }
            }
            if (el.classList.contains('card--lmxhero') || el.classList.contains('card--lmxstudio') || el.classList.contains('card--lmxhist')) return;

            var d = getData(el);
            if (!d) return;
            var type = typeOf(d);

            var fast = !el.closest('.category-full');
            addWork({ el: el, fast: fast, due: Date.now() + (fast ? 0 : 700), fn: function () { extras(el, d, type); } });

            if (type === 'tv') {
                var task = { el: el, id: d.id };
                if (io) { el.__lmx = task; io.observe(el); }
                else { queue.push(task); }
            }
        });
        if (!io) pumpSoon();
        if (!padT) padT = setTimeout(function padLater() {
            padT = 0;
            if (navBusy()) { padT = setTimeout(padLater, 300); return; }
            padFix();
        }, 500);
    }

    var timer = null;
    function hqPoster() {
        if (window.innerWidth > 480) return;
        var im = document.querySelectorAll('.full-start-new__img:not([data-lmxhq]),.full-start__img:not([data-lmxhq]),.activity--active .full-start__background:not([data-lmxhq])');
        for (var i = 0; i < im.length; i++) (function (el) {
            el.setAttribute('data-lmxhq', '1');
            var up = function () {
                var s = el.getAttribute('src') || '';
                if (!/\/t\/p\/w\d+\//.test(s)) return;
                var big = s.replace(/\/t\/p\/w\d+\//, '/t/p/original/');
                var pre = new Image();
                pre.onload = function () { if (el.getAttribute('src') === s) el.src = big; };
                pre.src = big;
            };
            up();
            try { new MutationObserver(up).observe(el, { attributes: true, attributeFilter: ['src'] }); } catch (e) {}
        })(im[i]);
    }
    function rowGuard() {
        var bodies = document.querySelectorAll('.items-line:not(.lmx-hero-line) .scroll--horizontal .scroll__body:not(.lmx-ag)');
        for (var i = 0; i < bodies.length; i++) {
            (function (b) {
                b.classList.add('lmx-ag');
                new MutationObserver(function (ms) {
                    var added = false;
                    for (var k = 0; k < ms.length && !added; k++) if (ms[k].addedNodes && ms[k].addedNodes.length) added = true;
                    if (!added) return;
                    try {
                        var pd = b.querySelector(':scope > .lmx-endpad');
                        if (pd && b.lastElementChild !== pd) b.appendChild(pd);
                    } catch (e) {}
                }).observe(b, { childList: true });
            })(bodies[i]);
        }
    }
    function torrentPerf() {
        if (!document.getElementById('lmx-perf-css')) {
            var st = document.createElement('style'); st.id = 'lmx-perf-css';
            st.textContent = 'html body .scroll--mask.lmx-nomask:not(#lmx-x){-webkit-mask-image:none !important;mask-image:none !important}' +
                '.torrent-item{contain:layout style}';
            (document.head || document.documentElement).appendChild(st);
        }
        var it = document.querySelector('.torrent-item');
        var sc = it && it.closest ? it.closest('.scroll--mask') : null;
        if (sc && !sc.classList.contains('lmx-nomask')) sc.classList.add('lmx-nomask');
    }
    function markHero(heroAdded) {
        hqPoster();
        var tnow = Date.now(), tick = false;
        if (tnow - (markHero.__t || 0) > 150) {
            tick = true;
            markHero.__t = tnow;
            safe(rowGuard);
            safe(function () { document.body.classList.toggle('lmx-onfull', !!document.querySelector('.activity--active .full-start-new')); });
        } else if (!markHero.__q) {
            markHero.__q = setTimeout(function () { markHero.__q = 0; safe(markHero); }, 160);
        }
        if (heroAdded === false && !tick) return;
        var cs = document.querySelectorAll('.card--lmxhero:not(.lmx-hl)');
        for (var i = 0; i < cs.length; i++) {
            var ln = cs[i].closest('.items-line');
            if (!ln) continue;
            cs[i].classList.add('lmx-hl');
            ln.classList.add('lmx-hero-line');
            if (!board() && !ln.classList.contains('lmx-mini--svc')) ln.classList.add('lmx-mini', 'lmx-mini--def');
        }
    }
    function schedule() {
        clearTimeout(timer);
        timer = setTimeout(function () { safe(scan); }, 120);
    }

    function resetCards() {
        var hid = document.querySelectorAll('[data-lmxhid]');
        for (var hi = 0; hi < hid.length; hi++) { hid[hi].style.display = ''; hid[hi].removeAttribute('data-lmxhid'); }
        var mine = document.querySelectorAll('.lmx-box,.lmx-tr,.lmx-cin');
        for (var i = 0; i < mine.length; i++) mine[i].parentNode.removeChild(mine[i]);
        var cards = document.querySelectorAll('.card[data-lmx]');
        for (var k = 0; k < cards.length; k++) cards[k].removeAttribute('data-lmx');
        schedule();
    }

    function studioName(m, tv) {
        var list = (tv && m.networks && m.networks.length) ? m.networks : (m.production_companies || []);
        for (var i = 0; i < list.length; i++) {
            var n = list[i] && list[i].name;
            if (n) return String(n);
        }
        return '';
    }
    function infoPills(m) {
        var p = [];
        var tv = typeOf(m) === 'tv';
        if (getBool('lmx_studio', true)) { var sn = studioName(m, tv); if (sn) p.push({ t: esc(sn), c: 'lmx-studio' }); }

        if (tv) {
            var rt = (m.episode_run_time && m.episode_run_time[0]) ||
                (m.last_episode_to_air && m.last_episode_to_air.runtime) || 0;
            if (rt) p.push({ t: fmtDur(rt) + '/серия' });

            var st = m.status;
            if (st === 'Ended') p.push({ t: 'Завершён', c: 'lmx-done' });
            else if (st === 'Canceled') p.push({ t: 'Отменён', c: 'lmx-bad' });
            else if (st === 'Returning Series') {
                var n = m.next_episode_to_air;
                if (n && n.air_date) {
                    var d = dayDiff(n.air_date);
                    var extra = (d !== null && d > 1 ? fmtShort(n.air_date) + ', ' : '') + code(n.season_number, n.episode_number);
                    p.push({ t: 'Следующая серия:' + rel(n.air_date) + ' (' + extra + ')', c: 'lmx-next' });
                } else {
                    p.push({ t: 'Выходит, дата следующей серии неизвестна', c: 'lmx-next' });
                }
            } else if (st === 'In Production' || st === 'Planned' || st === 'Pilot') {
                p.push({ t: 'Ожидается', c: 'lmx-soon' });
            }
        } else {
            if (m.runtime) p.push({ t: fmtDur(m.runtime) });

            var ms = m.status;
            var future = m.release_date && (dayDiff(m.release_date) || 0) > 0;
            if (ms === 'Released' && !future) p.push({ t: 'Вышел', c: 'lmx-done' });
            else if (ms === 'Canceled') p.push({ t: 'Отменён', c: 'lmx-bad' });
            else if (ms || future) {
                var rd = '';
                if (m.release_date) {
                    var dd = dayDiff(m.release_date);
                    rd = ': ' + rel(m.release_date) + (dd !== null && dd > 1 && dd <= 90 ? ' (' + fmtFull(m.release_date) + ')' : '');
                }
                p.push({ t: 'Ожидается' + rd, c: 'lmx-soon' });
            }
        }
        return p;
    }

    function capKeys(o, max) { var ks = Object.keys(o), i; if (ks.length > max) for (i = 0; i < ks.length - max; i++) delete o[ks[i]]; }
    var logoCache = {};
    function pickLogo(list) {
        var best = null, bestScore = -1;
        (list || []).forEach(function (l) {
            if (!l || !l.file_path) return;
            var lang = l.iso_639_1;
            var sc = lang === 'ru' ? 3 : (lang === 'en' ? 2 : (!lang ? 1 : 0));
            if (!sc) return;
            sc = sc * 1000 + (l.vote_average || 0) * 10 + Math.min(9, (l.width || 0) / 400);
            if (l.aspect_ratio && l.aspect_ratio < 1.7) sc -= 120;
            if (sc > bestScore) { bestScore = sc; best = l; }
        });
        return best && best.file_path;
    }
    function reveal(r) { r.find('.full-start-new__title, .full-start-new__head, .full-start__head').addClass('lmx-reveal'); }
    function applyLogo(r, path) {
        var t = r.find('.full-start-new__title').eq(0);
        if (!t.length || !path) { reveal(r); return; }
        r.find('.lmx-logo').remove();
        var img = $('<img class="lmx-logo">').attr('src', imgUrl(path, 'w780'));
        img.on('error', function () { img.remove(); t.removeClass('lmx-has-logo'); restoreHead(r); reveal(r); });
        img.on('load', function () { reveal(r); });
        t.addClass('lmx-has-logo').prepend(img);
        moveHead(r);
    }
    var HEAD_SEL = '.full-start-new__head, .full-start__head';
    function moveHead(r) {
        var head = r.find(HEAD_SEL).eq(0);
        r.find('.lmx-ip-head').remove();
        if (!head.length || !r.find('.lmx-has-logo').length) return;
        var txt = head.text().replace(/\s+/g, ' ').trim();
        if (!txt) return;
        var box = r.find('.lmx-info').eq(0);
        if (!box.length) {
            var anchor = r.find('.full-start-new__buttons, .full-start__buttons').eq(0);
            box = $('<div class="lmx-info"></div>');
            var dsc = r.find('.full-start-new__right > .lmx-descr').eq(0);
            if (dsc.length) dsc.before(box);
            else if (anchor.length) anchor.before(box); else r.find('.full-start-new__right, .full-start__right').eq(0).append(box);
        }
        box.prepend($('<div class="lmx-ip lmx-ip-head"></div>').text(txt));
        head.addClass('lmx-head-moved');
    }
    function hideDupes(r) {
        if (!r.find('.lmx-info .lmx-next').length) return;
        r.find('div,span').each(function () {
            if (this.children.length) return;
            var t = (this.textContent || '').trim();
            if (t.length < 80 && /^(Наступна|Следующая):\s/.test(t) && /(Залишилось|Осталось)/.test(t)) $(this).addClass('lmx-head-moved');
        });
    }
    function restoreHead(r) {
        r.find('.lmx-ip-head').remove();
        r.find(HEAD_SEL).removeClass('lmx-head-moved');
    }
    function loadLogo(r, m) {
        var kind = (m.name || m.first_air_date || m.number_of_seasons) ? 'tv' : 'movie';
        var key = kind + m.id;
        if (key in logoCache) return applyLogo(r, logoCache[key]);
        Lampa.Api.sources.tmdb.get(kind + '/' + m.id + '/images?include_image_language=ru%2Cen%2Cnull', {}, function (j) {
            logoCache[key] = pickLogo(j && j.logos); capKeys(logoCache, 80);
            applyLogo(r, logoCache[key]);
        }, function () { reveal(r); });
        setTimeout(function () { reveal(r); }, 1800);
    }

    function syncDots(card) {
        if (!card) return;
        var line = card.closest('.items-line');
        var n = parseInt(card.getAttribute('data-lmxn'), 10) || 0, idx = (parseInt(card.getAttribute('data-lmxi'), 10) || 0) % (n || 1);
        if (!line || n < 2 || line.classList.contains('lmx-mini')) return;
        var box = line.querySelector('.lmx-dots');
        if (!box) {
            box = document.createElement('div');
            box.className = 'lmx-dots';
            var h = '';
            for (var q = 0; q < n; q++) h += '<i></i>';
            box.innerHTML = h;
            line.appendChild(box);
        }
        if (box.__idx !== idx) {
            var dots = box.children;
            for (var k = 0; k < dots.length; k++) dots[k].className = k === idx ? 'on' : '';
            box.__idx = idx;
        }
        if (box.__top !== undefined && box.__tops >= 3 && box.__idx === box.__lastIdx) return;
        box.__lastIdx = box.__idx; box.__tops = (box.__tops || 0) + 1;
        var view = card.querySelector('.card__view') || card;
        var r = view.getBoundingClientRect(), lr = line.getBoundingClientRect();
        if (r.height > 0) {
            var em = box.__em || (box.__em = parseFloat(window.getComputedStyle(document.body).fontSize) || 16);
            var tp = Math.round(r.bottom - lr.top - 3.3 * em);
            if (box.__top !== tp) { box.style.top = tp + 'px'; box.__top = tp; }
        }
    }
    function focusCard(el, line) {
        var manual = function () {
            if (el.classList.contains('focus')) return;
            try { if (window.Navigator && Navigator.focus) Navigator.focus(el); } catch (e) {}
            if (el.classList.contains('focus') || !window.$) return;
            var old = document.querySelectorAll('.card--lmxhero.focus');
            for (var i = 0; i < old.length; i++) old[i].classList.remove('focus');
            el.classList.add('focus');
            window.$(el).trigger('hover:focus');
        };
        try {
            if (window.Lampa && Lampa.Controller && Lampa.Controller.collectionFocus) Lampa.Controller.collectionFocus(el, window.$ ? window.$(line) : line);
        } catch (e) {}
        setTimeout(function () { safe(manual); }, 60);
    }
    var AUTOPLAY_MS = 8000, ap = { idx: -1, t: 0, dir: 1, touch: null };
    function autoplay(card, line) {
        var raw = parseInt(card.getAttribute('data-lmxi'), 10) || 0, n = parseInt(card.getAttribute('data-lmxn'), 10) || 0, now = Date.now();
        if (raw !== ap.idx) { ap.idx = raw; ap.t = now; return; }
        if (now - ap.t < AUTOPLAY_MS) return;
        ap.t = now;
        if (document.hidden || !line) return;
        var cn = '';
        try { cn = Lampa.Controller.enabled().name; } catch (e) {}
        if (cn && /menu|settings|select|modal|head|full|player/i.test(cn)) return;
        var all = line.querySelectorAll('.card--lmxhero'), next = null, want;
        if (n > 1 && raw >= n - 1) ap.dir = -1;
        else if (raw <= 0) ap.dir = 1;
        want = raw + ap.dir;
        for (var i = 0; i < all.length; i++) {
            if (parseInt(all[i].getAttribute('data-lmxi'), 10) === want) next = all[i];
        }
        if (next && next !== card) {
            var nu = next.getAttribute('data-lmxu');
            if (nu && !heroReady(nu) && (ap.wait = (ap.wait || 0) + 1) <= 25) {
                heroPreload(nu, true);
                ap.t = now - (AUTOPLAY_MS - 700);
                return;
            }
            ap.wait = 0;
            focusCard(next, line);
        }
    }
    function heroFlat(card) {
        if (card.__lmxFlat) return;
        var u = card.getAttribute('data-lmxu');
        if (!u || !heroReady(u)) return;
        var v = card.querySelector('.card__view');
        if (!v) return;
        v.style.backgroundImage = 'url(' + u + ')';
        card.__lmxFlat = 1;
    }
    function setCur(el) {
        var line = el.closest('.items-line');
        if (!line) return;
        el.classList.remove('lmx-far');
        heroFlat(el);
        var sib = el.previousElementSibling; if (sib && sib.classList.contains('card--lmxhero')) heroFlat(sib);
        sib = el.nextElementSibling; if (sib && sib.classList.contains('card--lmxhero')) heroFlat(sib);
        if (!line.classList.contains('lmx-mini') && !isMobile()) {
            var ci = parseInt(el.getAttribute('data-lmxi'), 10) || 0, nn = line.querySelectorAll('.card--lmxhero').length;
            if (line.__lmxWin !== ci + ':' + nn) {
                line.__lmxWin = ci + ':' + nn;
                var hs = line.querySelectorAll('.card--lmxhero');
                var hb = hs.length && hs[0].parentElement;
                if (hb && !hb.querySelector(':scope > .lmx-endpad')) { var ep = document.createElement('div'); ep.className = 'lmx-endpad'; hb.appendChild(ep); }
                for (var hi = 0; hi < hs.length; hi++) {
                    var far = Math.abs((parseInt(hs[hi].getAttribute('data-lmxi'), 10) || 0) - ci) > 1;
                    if (hs[hi].classList.contains('lmx-far') !== far) hs[hi].classList.toggle('lmx-far', far);
                    var bf = (parseInt(hs[hi].getAttribute('data-lmxi'), 10) || 0) < ci;
                    if (hs[hi].classList.contains('lmx-before') !== bf) hs[hi].classList.toggle('lmx-before', bf);
                }
            }
        }
        var old = line.querySelectorAll('.card--lmxhero.lmx-cur');
        for (var i = 0; i < old.length; i++) if (old[i] !== el) old[i].classList.remove('lmx-cur');
        el.classList.add('lmx-cur');
    }
    function heroTouch(card, line) {
        var i = parseInt(card.getAttribute('data-lmxi'), 10) || 0, all = line.querySelectorAll('.card--lmxhero'), n = 0;
        for (var k = 0; k < all.length; k++) {
            var d = Math.abs((parseInt(all[k].getAttribute('data-lmxi'), 10) || 0) - i);
            if (d !== 1) continue;
            (function (u, delay) {
                setTimeout(function () {
                    var im = u && heroImgs[u];
                    if (im && im.decode) { try { im.decode().catch(function () {}); } catch (e) {} }
                    else if (u) heroPreload(u);
                }, delay);
            })(all[k].getAttribute('data-lmxu'), 700 * n++);
        }
    }
    function initDots() {
        if (window.__lmxDots) return;
        window.__lmxDots = true;
        try {
            if (window.$) window.$(document.body).on('hover:focus', '.card--lmxhero', function () { var self = this; safe(function () { setCur(self); }); });
        } catch (e) {}
        var lastNav = 0;
        document.addEventListener('keydown', function (ev) {
            ap.t = Date.now();
            safe(function () {
                var k = ev.keyCode;
                if (k !== 37 && k !== 39) return;
                if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
                var c = document.querySelector('.card--lmxhero.focus');
                if (!c) return;
                var boardTheme = document.body.classList.contains('lmx-hbo') || document.body.classList.contains('lmx-apple') || document.body.classList.contains('lmx-prem');
                if (!boardTheme && !(c.closest('.items-line') && c.closest('.items-line').classList.contains('lmx-mini'))) return;
                var cn = '';
                try { cn = Lampa.Controller.enabled().name; } catch (e) {}
                if (cn && /menu|settings|select|modal|head|full|player/i.test(cn)) return;
                var line = c.closest('.items-line');
                if (!line) return;
                var raw = parseInt(c.getAttribute('data-lmxi'), 10) || 0, want = raw + (k === 39 ? 1 : -1), next = null;
                var all = line.querySelectorAll('.card--lmxhero');
                for (var i = 0; i < all.length; i++) if (parseInt(all[i].getAttribute('data-lmxi'), 10) === want) next = all[i];
                if (!next) return;
                ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
                var now = Date.now();
                if (now - lastNav < 420) return;
                lastNav = now;
                focusCard(next, line);
            });
        }, true);
        var warmDone = true, warmBusy = false, lastKey = 0;
        document.addEventListener('keydown', function () { lastKey = Date.now(); }, true);
        function warm(line) {
            var body = line.querySelector('.scroll__body'), cards = line.querySelectorAll('.card--lmxhero');
            if (!body || cards.length < 2) { warmDone = true; return; }
            warmBusy = true;
            var orig = body.style.transform, i = 1, t0 = Date.now(), aborted = false;
            line.style.opacity = '0';
            body.style.setProperty('transition', 'none', 'important');
            function finish() {
                body.style.transform = orig;
                requestAnimationFrame(function () { requestAnimationFrame(function () {
                    body.style.removeProperty('transition');
                    line.style.opacity = '';
                    warmBusy = false; warmDone = true;
                }); });
            }
            function step() {
                if (lastKey > t0 || document.hidden) aborted = true;
                if (aborted || i >= cards.length) return finish();
                body.style.transform = 'translate3d(' + (-cards[i].offsetLeft) + 'px,0,0)';
                i++;
                requestAnimationFrame(function () { requestAnimationFrame(step); });
            }
            step();
        }
        var apple = null, apTick = 0;
        var tm = setInterval(function () {
            safe(function () {
                if (document.hidden) return;
                if (++apTick % 10 === 0) apple = null;
                if (apple === null) apple = board() && !isMobile();
                if (!apple) {
                    if (isMobile()) return;
                    var d = document.querySelector('.card--lmxhero.focus');
                    if (!d) return;
                    if (ap.cur !== d) { ap.cur = d; setCur(d); }
                    autoplay(d, d.closest('.items-line'));
                    return;
                }
                var c = document.querySelector('.card--lmxhero.focus');
                if (!c) return;
                if (ap.cur !== c) { ap.cur = c; setCur(c); syncDots(c); }
                if (!warmDone && !warmBusy && !heroQ.length && !heroBusy && Date.now() - lastKey > 1500 && (parseInt(c.getAttribute('data-lmxi'), 10) || 0) === 0 && c.closest('.items-line')) { warm(c.closest('.items-line')); return; }
                if (warmBusy) { ap.t = Date.now(); return; }
                if (ap.touch !== c) {
                    ap.touch = c;
                    clearTimeout(ap.tt);
                    ap.tt = setTimeout(function () {
                        if (!c.isConnected || !c.classList.contains('focus')) return;
                        var run = function () { safe(function () { heroTouch(c, c.closest('.items-line')); }); };
                        if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 1500 }); else run();
                    }, 1500);
                }
                autoplay(c, c.closest('.items-line'));
            });
        }, 300);
        if (tm && tm.unref) tm.unref();
    }

    function hideEmptyComments(r) {
        r.find('.full-review-add').each(function () {
            var host = window.$(this).closest('.items-line');
            if (!host.length) return;
            host.toggleClass('lmx-nocomm', host.find('.full-review').length === 0);
        });
    }
    var HEART = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.2-9.6C1.7 7.700 3.700 4.500 7 4.500c2 0 3.500 1.100 5 3 1.500-1.900 3-3 5-3 3.300 0 5.300 3.200 4.200 6.400C19.500 15.900 12 20.500 12 20.500z"/></svg>';
    var likeCtx = null, likeHooked = false;
    function bookFill() {
        var c = likeCtx;
        if (!c || !c.r[0] || !document.body.contains(c.r[0])) return;
        var st = {};
        try { st = Lampa.Favorite.check(c.m) || {}; } catch (e) {}
        var any = ['wath', 'book', 'look', 'viewed', 'scheduled', 'continued', 'thrown'].some(function (k) { return !!st[k]; });
        c.r.find('.button--book').toggleClass('lmx-bk-off', !any);
    }
    function bookFillSoon() { setTimeout(bookFill, 0); setTimeout(bookFill, 200); }
    function likeButton(r, m) {
        if (!getBool('lmx_like', true) || !m || !m.id) return;
        var cont = r.find('.full-start-new__buttons, .full-start__buttons').eq(0);
        if (!cont.length || cont.find('.lmx-likebtn').length) return;
        likeCtx = { r: r, m: m };
        if (!likeHooked && Lampa.Listener) {
            likeHooked = true;
            Lampa.Listener.follow('state:changed', function (e) { if (e && e.target === 'favorite') bookFillSoon(); });
        }
        bookFill();
        setTimeout(bookFill, 700);
        function liked() { try { return !!Lampa.Favorite.check(m).like; } catch (e) { return false; } }
        var el = $('<div class="full-start__button selector button--lmxlike lmx-likebtn">' + HEART + '<span>Нравится</span></div>');
        function paintLike() {
            var on = liked();
            el[0].classList.toggle('lmx-liked', on);
            el.find('span').text(on ? 'Вам нравится' : 'Нравится');
            el[0].__lmxT = on ? 'Вам нравится' : 'Нравится';
        }
        el.on('hover:enter', function () {
            safe(function () {
                bookFill();
                Lampa.Favorite.toggle('like', m);
                paintLike();
                bookFillSoon();
                if (Lampa.Noty) Lampa.Noty.show(liked() ? 'Добавлено в «Нравится»' : 'Убрано из «Нравится»');
            });
        });
        paintLike();
        var after = cont.find('.button--book').first();
        if (after.length) after.after(el); else cont.append(el);
    }

    var MK_LATER = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
    var MK_SEEN = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></svg>';
    function marksCss() {
        if (document.getElementById('lmx-marks-css')) return;
        var st = document.createElement('style'); st.id = 'lmx-marks-css';
        st.textContent = 'html body .lmx-mkbtn.lmx-mk-later.lmx-mk-on,html body .lmx-mkbtn.lmx-mk-later.lmx-mk-on span,html body .lmx-mkbtn.lmx-mk-later.lmx-mk-on svg{color:#ffd54f !important}' +
            'html body .lmx-mkbtn.lmx-mk-seen.lmx-mk-on,html body .lmx-mkbtn.lmx-mk-seen.lmx-mk-on span,html body .lmx-mkbtn.lmx-mk-seen.lmx-mk-on svg{color:#6fd48a !important}' +
            'html body .lmx-mkbtn.lmx-mk-on svg circle{fill:currentColor;fill-opacity:.18}';
        (document.head || document.documentElement).appendChild(st);
    }
    function marksButtons(r, m) {
        if (!getBool('lmx_pagebtns', getBool('lmx_marks', true)) || !m || !m.id) return;
        var cont = r.find('.full-start-new__buttons, .full-start__buttons').eq(0);
        if (!cont.length || cont.find('.lmx-mkbtn').length) return;
        marksCss();
        cont[0].classList.add('lmx-marks-on');
        function st() { try { return Lampa.Favorite.check(m) || {}; } catch (e) { return {}; } }
        function mk(cls, svg, off, on, list) {
            var el = $('<div class="full-start__button selector lmx-mkbtn ' + cls + '">' + svg + '<span>' + off + '</span></div>');
            el.paint = function () {
                var is = !!st()[list];
                el[0].classList.toggle('lmx-mk-on', is);
                el.find('span').text(is ? on : off);
                el[0].__lmxT = is ? on : off;
            };
            return el;
        }
        var later = mk('button--lmxlater lmx-mk-later', MK_LATER, 'Смотреть позже', 'В списке «Позже»', 'wath');
        function paintAll() { later.paint(); }
        later.on('hover:enter', function () {
            safe(function () {
                var was = !!st().wath;
                if (!was && st().viewed) Lampa.Favorite.toggle('viewed', m);
                Lampa.Favorite.toggle('wath', m);
                paintAll();
                if (Lampa.Noty) Lampa.Noty.show(was ? 'Убрано из «Посмотреть позже»' : 'Добавлено в «Посмотреть позже»');
            });
        });
        paintAll();
        var after = cont.find('.lmx-likebtn').first();
        if (!after.length) after = cont.find('.button--book').first();
        if (after.length) after.after(later); else cont.append(later);
        if (Lampa.Listener && !marksButtons.hooked) { marksButtons.hooked = true; Lampa.Listener.follow('state:changed', function (e) { if (e && e.target === 'favorite') { var c = marksButtons.cur; if (c) c(); } }); }
        marksButtons.cur = function () { if (document.body.contains(later[0])) paintAll(); };
    }

    var UAC_URL = 'http://lampaua.mooo.com/lite/uacomments/fetch';
    var UAC_SRC = [['uakino', 'UaKino', 'uakino.best'], ['uaflix', 'UAFlix', 'uafix.net'], ['uaserials', 'UASerials', 'uaserials.com'], ['kinobaza', 'KinoBaza', 'kinobaza.com.ua']];
    var UAC_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    var uacMemo = {}, uacPend = {}, uacV = { on: false, root: null, list: [], i: 0, prev: '' };
    function uacCss() {
        if (document.getElementById('lmx-uac-css')) return;
        var st = document.createElement('style'); st.id = 'lmx-uac-css';
        st.textContent =
            '.lmx-uac-off{opacity:.55}' +
            '.lmx-uac-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);opacity:0;transition:opacity .2s ease}' +
            '.lmx-uac-ov.show{opacity:1}' +
            '.lmx-uac-md{width:min(56em,92vw);height:80vh;max-height:60em;display:flex;flex-direction:column;overflow:hidden;border-radius:1.4em;background:#15171e;color:#f2f3f7;box-shadow:0 1em 3em rgba(0,0,0,.55)}' +
            '.lmx-uac-hd{display:flex;align-items:center;gap:1em;padding:1em 1.3em;border-bottom:1px solid rgba(255,255,255,.08)}' +
            '.lmx-uac-meta{flex:1;min-width:0}' +
            '.lmx-uac-src{font-size:.8em;opacity:.65;letter-spacing:.02em}' +
            '.lmx-uac-au{font-size:1.15em;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            '.lmx-uac-cn{opacity:.6;font-weight:600;min-width:5.5ch;text-align:right}' +
            '.lmx-uac-ar,.lmx-uac-x{width:2.6em;height:2.6em;border-radius:.9em;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.09);transition:transform .15s ease,background .15s ease}' +
            '.lmx-uac-ar{opacity:.35}.lmx-uac-ar.on{opacity:1;cursor:pointer}' +
            '.lmx-uac-x.focus{background:rgba(255,255,255,.28);transform:scale(1.06)}' +
            '.lmx-uac-tx{flex:1;min-height:0;overflow-y:auto;padding:1.4em 1.5em;font-size:1.2em;line-height:1.6;white-space:normal}' +
            '.lmx-uac-tx::-webkit-scrollbar{width:.45em}.lmx-uac-tx::-webkit-scrollbar-thumb{background:rgba(255,255,255,.28);border-radius:1em}' +
            'body.lmx-prem .lmx-uac-md{background:#0e0e12;box-shadow:0 0 0 1px rgba(255,255,255,.1),0 1em 3em rgba(0,0,0,.7);border-radius:1em}' +
            'body.lmx-prem .lmx-uac-x.focus{background:#fff;color:#111}' +
            'body.lmx-apple .lmx-uac-ov{background:rgba(8,8,10,.55)}' +
            'body.lmx-apple .lmx-uac-md{background:rgba(34,34,40,.78);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 1em 3em rgba(0,0,0,.45);border-radius:1.7em}' +
            'body.lmx-apple .lmx-uac-hd{border-bottom-color:rgba(255,255,255,.1)}';
        (document.head || document.documentElement).appendChild(st);
    }
    function uacSrcList() { return UAC_SRC.filter(function (x) { return getBool('lmx_uac_' + x[0], true); }).map(function (x) { return x[0]; }); }
    function uacFetch(m, done) {
        var srcs = uacSrcList();
        if (!srcs.length) return done([]);
        if (!m.imdb_id) {
            var T = window.Lampa && Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
            if (!T || !T.external_imdb_id || !m.id) return done([]);
            var isTv = !!(m.name || m.first_air_date || m.number_of_seasons) && !m.title;
            var seen = false;
            try {
                T.external_imdb_id({ type: isTv ? 'tv' : 'movie', id: m.id }, function (iid) {
                    if (seen) return; seen = true;
                    if (!iid) return done([]);
                    var m2 = {}; for (var k in m) m2[k] = m[k];
                    m2.imdb_id = iid;
                    uacFetch(m2, done);
                });
            } catch (e) { done([]); }
            return;
        }
        var title = m.title || m.name || '', orig = m.original_title || m.original_name || '', year = String(m.release_date || m.first_air_date || '').slice(0, 4);
        var q = [];
        if (m.imdb_id) q.push('imdb_id=' + encodeURIComponent(m.imdb_id));
        if (title) q.push('title=' + encodeURIComponent(title));
        if (orig && orig.toLowerCase() !== title.toLowerCase()) q.push('original_title=' + encodeURIComponent(orig));
        if (year) q.push('year=' + encodeURIComponent(year));
        q.push('sources=' + encodeURIComponent(srcs.join(',')));
        var key = [m.imdb_id, title, orig, year, srcs.join(',')].join('|').toLowerCase();
        var hit = uacMemo[key];
        if (hit && hit.exp > Date.now()) return done(hit.list.slice());
        var pc = uacDisk(), pe = pc[key], stale = false;
        if (pe && pe.l && pe.l.length && Date.now() - pe.t < 86400000) {
            stale = Date.now() - pe.t > 600000;
            uacMemo[key] = { list: pe.l, exp: Date.now() + (stale ? 1 : 600000) };
            done(pe.l.slice());
            if (!stale) return;
            done = function () {};
        }
        if (uacPend[key]) { uacPend[key].push(done); return; }
        uacPend[key] = [done];
        function fin(list) {
            list = Array.isArray(list) ? list.filter(function (x) { return x && x.text; }) : [];
            uacMemo[key] = { list: list, exp: Date.now() + (list.length ? 600000 : 120000) };
            if (list.length) uacDiskPut(key, list);
            var cbs = uacPend[key] || []; delete uacPend[key];
            cbs.forEach(function (cb) { try { cb(list.slice()); } catch (e) {} });
        }
        $.ajax({ url: (getStr('lmx_uac_url', '') || UAC_URL) + '?' + q.join('&'), method: 'GET', timeout: 22000, dataType: 'json', success: fin, error: function () { fin([]); } });
    }
    function uacDisk() {
        try { var o = JSON.parse(localStorage.getItem('lmx_uac_cache') || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; }
    }
    function uacDiskPut(key, list) {
        try {
            var o = uacDisk(), ks, i;
            o[key] = { t: Date.now(), l: list.slice(0, 30) };
            ks = Object.keys(o);
            if (ks.length > 40) { ks.sort(function (a, b) { return o[a].t - o[b].t; }); for (i = 0; i < ks.length - 40; i++) delete o[ks[i]]; }
            localStorage.setItem('lmx_uac_cache', JSON.stringify(o));
        } catch (e) {}
    }
    var uacWarmT = 0;
    function uacWarm() {
        if (uacWarm.on || !window.$) return;
        uacWarm.on = true;
        window.$(document.body).on('hover:focus', '.card', function () {
            var el = this;
            clearTimeout(uacWarmT);
            uacWarmT = setTimeout(function () {
                safe(function () {
                    var d = el.card_data;
                    if (!d || !d.id || !getBool('lmx_uac', true) || window.__uacomments_plugin_started || d.lmxHero) return;
                    if (!(d.title || d.name)) return;
                    uacFetch(d, function () {});
                });
            }, 900);
        });
    }
    var RX_ICONS = {
        fire: '<path class="b" d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
        nice: '<path class="b" d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/><path class="f" d="M7 10v12"/>',
        think: '<circle class="b" cx="12" cy="12" r="10"/><circle class="f d" cx="8.5" cy="10" r=".7"/><circle class="f d" cx="15.5" cy="10" r=".7"/><path class="f" d="M8 16h5"/><path class="f" d="M14.5 6.2l2.5-1"/>',
        bore: '<circle class="b" cx="11" cy="13" r="8"/><path class="f" d="M7.5 11.5c.8.7 1.7.7 2.5 0"/><path class="f" d="M12.5 11.5c.8.7 1.7.7 2.5 0"/><path class="f" d="M9.5 16.5c.9-.4 1.9-.4 3 0"/><path d="M17 3h4l-4 4h4"/>',
        shit: '<path class="b" d="M5 21h14a3 3 0 0 0 0-6H5a3 3 0 0 0 0 6z"/><path class="b" d="M7.5 15a3 3 0 0 1 .5-5.9h8a3 3 0 0 1 .5 5.9"/><path class="b" d="M9.5 9.2C8 8 8.5 5.8 10.8 4.8c1-.5 1.4-1.6 1-2.8 2.4.6 4 2.4 3.7 4.4-.2 1.2-1 2.2-2 2.8"/><circle class="f d" cx="10" cy="12.2" r=".7"/><circle class="f d" cx="14" cy="12.2" r=".7"/>'
    };
    var RX_ORDER = ['fire', 'nice', 'think', 'bore', 'shit'];
    function rxSvg(t) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + RX_ICONS[t] + '</svg>'; }
    function rxVote(card, type, el) {
        if (!card || !card.id || !window.Lampa || !Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.cub) return;
        var method = (card.name || card.first_air_date || card.number_of_seasons) ? 'tv' : 'movie', id = method + '_' + card.id;
        var mine = Lampa.Storage.get('mine_reactions', {});
        if (mine[id] && mine[id].indexOf(type) >= 0) { Lampa.Noty.show(Lampa.Lang.translate('reactions_ready')); return; }
        Lampa.Api.sources.cub.reactionsAdd({ method: method, id: card.id, type: type }, function () {
            var m2 = Lampa.Storage.get('mine_reactions', {});
            if (!m2[id]) m2[id] = [];
            if (m2[id].indexOf(type) < 0) m2[id].push(type);
            Lampa.Storage.set('mine_reactions', m2);
            el.classList.add('reaction--voted');
            var cn = el.querySelector('.reaction__count'), n = cn && /^\d+$/.test(cn.textContent.trim()) ? parseInt(cn.textContent, 10) : null;
            if (cn && n !== null) cn.textContent = String(n + 1);
        }, function () { Lampa.Noty.show(Lampa.Lang.translate('reactions_ready')); });
    }
    function rxRow(r, card) {
        var row = r.find('.full-start-new__reactions')[0];
        if (!row) return;
        document.body.classList.toggle('lmx-norx', !getBool('lmx_rx_row', true));
        var busy = false, interact = getBool('lmx_rx_focus', true), mono = getBool('lmx_rx_mono', true) && !isMobile(), refT = 0;
        var upd = function () {
            if (busy) return;
            busy = true;
            try {
                if (!row.querySelector('.reaction')) { row.classList.remove('lmx-rx'); return; }
                if (interact) {
                    var mineAll = Lampa.Storage.get('mine_reactions', {}), mk = ((card && (card.name || card.first_air_date || card.number_of_seasons)) ? 'tv' : 'movie') + '_' + (card && card.id);
                    RX_ORDER.forEach(function (t) {
                        if (row.querySelector('.reaction--' + t)) return;
                        var w = document.createElement('div'), re = document.createElement('div'), cn = document.createElement('div');
                        re.className = 'reaction reaction--' + t; cn.className = 'reaction__count'; cn.textContent = '0';
                        if (!mono) { var im = document.createElement('img'); im.className = 'reaction__icon'; try { im.src = Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/img/reactions/' + t + '.svg'; } catch (e) {} re.appendChild(im); }
                        re.appendChild(cn); w.appendChild(re); row.appendChild(w);
                        if (mineAll[mk] && mineAll[mk].indexOf(t) >= 0) re.classList.add('reaction--voted');
                    });
                }
                row.classList.add('lmx-rx');
                var added = false;
                Array.prototype.forEach.call(row.querySelectorAll('.reaction'), function (el) {
                    var t = (/reaction--(\w+)/.exec(el.className) || [])[1];
                    if (mono && t && RX_ICONS[t] && !el.querySelector('.lmx-rxi')) {
                        var sp = document.createElement('span'); sp.className = 'lmx-rxi'; sp.innerHTML = rxSvg(t);
                        el.insertBefore(sp, el.firstChild);
                    }
                    if (interact && t && !el.classList.contains('selector')) {
                        el.classList.add('selector'); added = true;
                        window.$(el).on('hover:enter', function () { safe(function () { rxVote(card, t, el); }); });
                    }
                });
                if (added) {
                    clearTimeout(refT);
                    refT = setTimeout(function () {
                        safe(function () {
                            if (!document.body.contains(row) || (Lampa.Controller.enabled() || {}).name !== 'full_start') return;
                            var top = r.find('.full-start-new, .full-start').eq(0);
                            if (!top.length) return;
                            var fo = top.find('.selector.focus')[0];
                            Lampa.Controller.collectionSet(top);
                            Lampa.Controller.collectionFocus(fo || false, top);
                        });
                    }, 120);
                }
            } finally { busy = false; }
        };
        upd();
        try { var mo = new MutationObserver(function () { setTimeout(upd, 0); }); mo.observe(row, { childList: true, subtree: true }); } catch (e) {}
    }
    function rxMenu() {
        if (rxMenu.on || !window.$) return;
        rxMenu.on = true;
        window.$(document.body).on('hover:enter click', '.button--reaction', function () {
            if (!getBool('lmx_rx_mono', true)) return;
            [60, 200, 500].forEach(function (d) {
                setTimeout(function () {
                    safe(function () {
                        var its = document.querySelectorAll('.selectbox .selectbox-item');
                        if (its.length !== RX_ORDER.length) return;
                        Array.prototype.forEach.call(its, function (it, i) {
                            var ic = it.querySelector('.selectbox-item__icon');
                            if (!ic || ic.querySelector('.lmx-rxi')) return;
                            ic.innerHTML = '<span class="lmx-rxi lmx-rxi--menu">' + rxSvg(RX_ORDER[i]) + '</span>';
                        });
                    });
                }, d);
            });
        });
    }
    function uacClose() {
        if (!uacV.on) return;
        uacV.on = false;
        var root = uacV.root; uacV.root = null;
        if (root) { root.removeClass('show'); setTimeout(function () { root.remove(); }, 220); }
        try { if (uacV.prev) Lampa.Controller.toggle(uacV.prev); } catch (e) {}
    }
    function uacDraw() {
        if (!uacV.on || !uacV.root) return;
        var c = uacV.list[uacV.i] || {}, r = uacV.root;
        r.find('.lmx-uac-src').text(c.source ? (c.source === 'KinoBaza' && c.isReview ? 'KinoBaza: рецензия' : c.source) : 'Источник');
        r.find('.lmx-uac-au').text(c.author || 'Пользователь');
        r.find('.lmx-uac-cn').text((uacV.i + 1) + ' / ' + uacV.list.length);
        r.find('.lmx-uac-tx').html(String(c.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')).scrollTop(0);
        r.find('.lmx-uac-l').toggleClass('on', uacV.i > 0);
        r.find('.lmx-uac-r').toggleClass('on', uacV.i < uacV.list.length - 1);
    }
    function uacStep(d) { var n = uacV.i + d; if (n < 0 || n >= uacV.list.length) return; uacV.i = n; uacDraw(); }
    function uacOpen(list, idx) {
        uacClose();
        uacCss();
        uacV.on = true; uacV.list = list; uacV.i = idx > 0 && idx < list.length ? idx : 0; uacV.prev = '';
        try { uacV.prev = (Lampa.Controller.enabled() || {}).name || ''; } catch (e) {}
        var root = $('<div class="lmx-uac-ov"><div class="lmx-uac-md"><div class="lmx-uac-hd">' +
            '<div class="lmx-uac-ar lmx-uac-l">&#9664;</div><div class="lmx-uac-meta"><div class="lmx-uac-src"></div><div class="lmx-uac-au"></div></div>' +
            '<div class="lmx-uac-cn"></div><div class="lmx-uac-ar lmx-uac-r">&#9654;</div><div class="lmx-uac-x selector">&#10005;</div></div>' +
            '<div class="lmx-uac-tx"></div></div></div>');
        uacV.root = root;
        $('body').append(root);
        setTimeout(function () { if (uacV.root) uacV.root.addClass('show'); }, 10);
        root.find('.lmx-uac-x').on('hover:enter click', uacClose);
        root.find('.lmx-uac-l').on('click', function () { uacStep(-1); });
        root.find('.lmx-uac-r').on('click', function () { uacStep(1); });
        try {
            Lampa.Controller.add('lmx_uac', {
                toggle: function () { Lampa.Controller.collectionSet(root); Lampa.Controller.collectionFocus(root.find('.lmx-uac-x')[0], root); },
                up: function () { var b = root.find('.lmx-uac-tx'); b.scrollTop(b.scrollTop() - 180); },
                down: function () { var b = root.find('.lmx-uac-tx'); b.scrollTop(b.scrollTop() + 180); },
                left: function () { uacStep(-1); },
                right: function () { uacStep(1); },
                back: uacClose
            });
            Lampa.Controller.toggle('lmx_uac');
        } catch (e) {}
        uacDraw();
    }
    function uacButton(r, m) {
        if (!getBool('lmx_uac', true) || !m || !m.id || window.__uacomments_plugin_started) return;
        if (!getBool('lmx_uac_btn', false)) return;
        var cont = r.find('.full-start-new__buttons, .full-start__buttons').eq(0);
        if (!cont.length || cont.find('.button--lmxuac').length) return;
        var el = $('<div class="full-start__button selector button--lmxuac">' + UAC_ICON + '<span>Комментарии…</span></div>'), list = null;
        function label(t, off) { el.find('span').text(t); el[0].__lmxT = t; el[0].classList.toggle('lmx-uac-off', !!off); }
        el[0].__lmxT = 'Комментарии';
        el.on('hover:enter click', function () {
            if (list === null) { if (Lampa.Noty) Lampa.Noty.show('Ищем комментарии…'); return; }
            if (!list.length) { if (Lampa.Noty) Lampa.Noty.show('Комментарии не найдены'); return; }
            uacOpen(list);
        });
        var after = cont.find('.lmx-mk-later').first();
        if (!after.length) after = cont.find('.lmx-likebtn').first();
        if (after.length) after.after(el); else cont.append(el);
        uacFetch(m, function (res) {
            list = res;
            if (!document.body.contains(el[0])) return;
            label(res.length ? 'Комментарии (' + res.length + ')' : 'Комментариев нет', !res.length);
        });
    }

    function uacRowCss() {
        if (document.getElementById('lmx-uacr-css')) return;
        var st = document.createElement('style'); st.id = 'lmx-uacr-css';
        var Q = 'html body .items-line.lmx-uacr .full-person:not(.full-person--small):not(#lmx-x)';
        st.textContent =
            Q + '{display:grid !important;grid-template-columns:100%;grid-template-rows:auto 1fr;row-gap:.7em;text-align:left !important;justify-items:stretch !important;width:24em !important;height:13em;box-sizing:border-box;margin:0 1.1em 0 0 !important;padding:1.1em 1.3em !important;border-radius:1.2em;background:rgba(255,255,255,.07) !important;color:#fff !important;align-items:start !important;position:relative;transition:transform .2s ease,background .2s ease,box-shadow .2s ease}' +
            'html body .items-line.lmx-uacr .lmx-endpad:not(#lmx-x){min-width:3em}' +
            Q + ' .full-person__photo{display:none !important}' +
            Q + ' .full-person__body{display:contents}' +
            Q + ' .full-person__name{grid-column:1;grid-row:1;text-align:left;font-size:1.1em;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;-webkit-line-clamp:unset}' +
            Q + ' .full-person__role{grid-column:1;grid-row:2;text-align:left;align-self:start;margin:0;opacity:.82;font-size:.95em;line-height:1.4;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;white-space:normal}' +
            Q + '.focus{background:rgba(255,255,255,.17) !important;transform:scale(1.03)}' +
            Q + '.focus .full-person__role{opacity:1}' +
            'html body.lmx-prem .items-line.lmx-uacr .full-person:not(.full-person--small):not(#lmx-x){background:#14141a !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);border-radius:1em}' +
            'html body.lmx-prem .items-line.lmx-uacr .full-person:not(.full-person--small):not(#lmx-x).focus{background:#1b1b23 !important;transform:scale(1.04);box-shadow:0 0 0 .2em #fff,0 .6em 1.6em rgba(0,0,0,.6)}' +
            'html body.lmx-apple .items-line.lmx-uacr .full-person:not(.full-person--small):not(#lmx-x){background:rgba(255,255,255,.08) !important;border-radius:1.5em;box-shadow:none}' +
            'html body.lmx-apple .items-line.lmx-uacr .full-person:not(.full-person--small):not(#lmx-x).focus{background:rgba(255,255,255,.15) !important;transform:scale(1.06);box-shadow:0 0 0 .16em #fff,0 .5em 1.5em rgba(0,0,0,.4)}';
        (document.head || document.documentElement).appendChild(st);
    }
    function uacRowPrepare(link, data) {
        var mv = data && data.movie;
        if (!getBool('lmx_uac', true) || window.__uacomments_plugin_started || !mv || !mv.id || !link || !Array.isArray(link.rows)) return;
        uacFetch(mv, function (res) {
            if (!res.length || !Array.isArray(link.rows)) return;
            var list = res.slice(0, 30);
            var items = list.map(function (c) {
                var txt = String(c.text || '').replace(/\s+/g, ' ').trim();
                return { id: 'uac' + Math.random().toString(36).slice(2), name: c.author || 'Пользователь', character: txt.length > 260 ? txt.slice(0, 257) + '…' : txt, profile_path: '', img: './img/actor.svg' };
            });
            items.forEach(function (it, i) { it.params = { emit: { onEnter: function () { safe(function () { uacOpen(res, i); }); } } }; });
            var at = -1, k;
            for (k = 0; k < link.rows.length; k++) { var r = link.rows[k]; if (Array.isArray(r) && r[0] === 'persons' && r[1] && r[1].lmxTrailers) { at = k + 1; break; } }
            if (at < 0) { at = link.rows.indexOf('description'); at = at >= 0 ? at + 1 : 1; }
            while (link.rows[at] && link.rows[at][0] === 'cards' && link.rows[at][1] && link.rows[at][1].lmxColl) at++;
            uacRowCss();
            var row = ['persons', { results: items, title: 'Комментарии', lmxUac: true, lmxUacList: res }], built = (link.items && link.items.length) || 0;
            if (at >= built) { link.rows.splice(at, 0, row); return; }
            var host = link.items[at - 1], hostEl = host && host.render ? host.render(true) : null;
            if (!hostEl || !hostEl.parentNode || !link.scroll || !document.body.contains(hostEl)) { link.rows.splice(Math.max(at, built), 0, row); return; }
            link.rows.splice(at, 0, row);
            link.fragment = document.createDocumentFragment();
            link.emit('createAndAppend', row);
            link.scroll.append(link.fragment);
            var it = link.items.pop(), el = it && it.render ? it.render(true) : null;
            if (!it || !el) return;
            link.items.splice(at, 0, it);
            if (hostEl.nextSibling) hostEl.parentNode.insertBefore(el, hostEl.nextSibling); else hostEl.parentNode.appendChild(el);
            if (typeof link.active === 'number' && link.active >= at) link.active++;
            try { Lampa.Layer.visible(link.scroll.render()); } catch (x) {}
        });
    }

    var epsV = { on: false, root: null, idx: 0, cards: [], list: [] };
    function epsCss() {
        if (document.getElementById('lmx-eps-css')) return;
        var st = document.createElement('style'); st.id = 'lmx-eps-css';
        st.textContent =
            '.lmx-eps{position:fixed;left:0;right:0;bottom:0;z-index:10001;padding:5em 0 2.2em;background:linear-gradient(0deg,rgba(0,0,0,.92) 0%,rgba(0,0,0,.7) 55%,rgba(0,0,0,0) 100%);opacity:0;transform:translateY(1.5em);transition:opacity .2s ease,transform .2s ease;pointer-events:auto;overflow:hidden}' +
            '.lmx-eps.show{opacity:1;transform:none}' +
            '.lmx-eps__hd{padding:0 3em .8em;font-size:1.15em;font-weight:700;color:#fff;opacity:.9}' +
            '.lmx-eps__tr{display:flex;align-items:stretch;padding:.6em 3em 1em;transition:transform .22s ease;will-change:transform}' +
            '.lmx-eps__c{flex:0 0 auto;position:relative;width:17em;height:10em;box-sizing:border-box;margin-right:1.1em;padding:.9em 1em;border-radius:1.1em;background:rgba(255,255,255,.1);color:#fff;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;background-size:cover;background-position:center;transition:transform .2s ease,background-color .2s ease,box-shadow .2s ease}' +
            '.lmx-eps__c::before{content:"";position:absolute;left:0;right:0;top:0;bottom:0;background:linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,.15) 70%)}' +
            '.lmx-eps__c>*{position:relative}' +
            '.lmx-eps__n{font-size:.85em;opacity:.75;font-weight:600;margin-bottom:.25em}' +
            '.lmx-eps__t{font-size:1.05em;font-weight:700;line-height:1.25;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
            '.lmx-eps__now{position:absolute !important;top:.7em;right:.8em;font-size:.75em;font-weight:700;padding:.25em .7em;border-radius:2em;background:#fff;color:#111}' +
            '.lmx-eps__p{position:absolute !important;left:0;bottom:0;height:.28em;background:rgba(255,255,255,.9)}' +
            '.lmx-eps__c.focus{transform:scale(1.06);background-color:rgba(255,255,255,.24)}' +
            'body.lmx-prem .lmx-eps__c{border-radius:.9em;box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}' +
            'body.lmx-prem .lmx-eps__c.focus{transform:scale(1.04);box-shadow:0 0 0 .2em #fff,0 .6em 1.6em rgba(0,0,0,.6)}' +
            'body.lmx-apple .lmx-eps__c{border-radius:1.5em;background-color:rgba(255,255,255,.12)}' +
            'body.lmx-apple .lmx-eps__c.focus{box-shadow:0 0 0 .16em #fff,0 .5em 1.5em rgba(0,0,0,.4)}';
        (document.head || document.documentElement).appendChild(st);
    }
    function epsClose(back) {
        if (!epsV.on) return;
        epsV.on = false;
        var root = epsV.root; epsV.root = null;
        if (root) { root.removeClass('show'); setTimeout(function () { root.remove(); }, 230); }
        if (back !== false) { try { Lampa.Controller.toggle('player'); } catch (e) {} }
    }
    function epsFocus() {
        var c = epsV.cards;
        c.forEach(function (el, i) { el.classList.toggle('focus', i === epsV.idx); });
        var tr = epsV.root && epsV.root.find('.lmx-eps__tr')[0], cur = c[epsV.idx];
        if (!tr || !cur) return;
        var vw = window.innerWidth || 1280, off = cur.offsetLeft + cur.offsetWidth / 2 - vw / 2;
        tr.style.transform = 'translateX(' + (-Math.max(0, off)) + 'px)';
    }
    function epsPick(i) {
        var it = epsV.list[i], pl = epsV.list;
        if (!it) return;
        var curPos = 0;
        try { curPos = Lampa.PlayerPlaylist.position(); } catch (e) {}
        epsClose(false);
        if (i === curPos) { try { Lampa.Controller.toggle('player'); } catch (e) {} return; }
        try { Lampa.PlayerPlaylist.listener.send('select', { playlist: pl, position: i, item: it }); } catch (e) {}
    }
    function epsOpen() {
        var pl = [], pos = 0;
        try { Lampa.PlayerPlaylist.active(); pl = Lampa.PlayerPlaylist.get() || []; pos = Lampa.PlayerPlaylist.position(); } catch (e) {}
        if (!pl || pl.length < 2) return false;
        epsCss();
        epsV.on = true; epsV.list = pl; epsV.idx = pos; epsV.cards = [];
        var root = $('<div class="lmx-eps"><div class="lmx-eps__hd">Серии</div><div class="lmx-eps__tr"></div></div>'), tr = root.find('.lmx-eps__tr');
        pl.forEach(function (it, i) {
            var c = $('<div class="lmx-eps__c"></div>'), n = '', t = String(it.title || '');
            if (it.season && it.episode) n = 'Сезон ' + it.season + ' · Серия' + it.episode; else if (it.episode) n = 'Серия' + it.episode; else n = (i + 1) + ' / ' + pl.length;
            var th = it.thumbnail || it.img || it.poster;
            if (typeof th === 'string' && th) c.css('background-image', 'url("' + th.replace(/"/g, '%22') + '")');
            c.append($('<div class="lmx-eps__n"></div>').text(n)).append($('<div class="lmx-eps__t"></div>').text(t));
            if (i === pos) c.append('<div class="lmx-eps__now">Сейчас</div>');
            var pc = it.timeline && it.timeline.percent;
            if (pc > 0) c.append($('<div class="lmx-eps__p"></div>').css('width', Math.min(100, pc) + '%'));
            c.on('click', function () { epsPick(i); });
            tr.append(c); epsV.cards.push(c[0]);
        });
        epsV.root = root;
        $('body').append(root);
        setTimeout(function () { if (epsV.root) { epsV.root.addClass('show'); epsFocus(); } }, 10);
        try {
            Lampa.Controller.add('lmx_eps', {
                toggle: function () {},
                left: function () { if (epsV.idx > 0) { epsV.idx--; epsFocus(); } },
                right: function () { if (epsV.idx < epsV.cards.length - 1) { epsV.idx++; epsFocus(); } },
                up: function () { epsClose(); },
                down: function () { epsClose(); },
                enter: function () { epsPick(epsV.idx); },
                back: function () { epsClose(); }
            });
            Lampa.Controller.toggle('lmx_eps');
        } catch (e) {}
        return true;
    }
    function epsPlayer() {
        if (epsPlayer.on || !window.Lampa || !Lampa.Keypad || !Lampa.Keypad.listener) return;
        epsPlayer.on = true;
        Lampa.Keypad.listener.follow('keydown', function (d) {
            safe(function () {
                if (!d || !d.event || !(d.code === 40 || d.code === 29461) || !getBool('lmx_eps_strip', true)) return;
                var en = (Lampa.Controller.enabled() || {}).name;
                if (en !== 'player') return;
                var pd = Lampa.Player.playdata ? Lampa.Player.playdata() : null;
                if (pd && (pd.iptv || pd.tv)) return;
                if (epsOpen()) { d.event.preventDefault(); }
            });
        });
        if (Lampa.Player && Lampa.Player.listener) Lampa.Player.listener.follow('destroy', function () { epsClose(false); });
    }

    var tintCache = {};
    function tintTL() {
        return ({ '1': ['.2', '.12', '.3', '.7'], '2': ['.36', '.22', '.42', '.85'], '3': ['.55', '.34', '.6', '1'] })[getStr('lmx_tint_lvl', '2')] || ['.36', '.22', '.42', '.85'];
    }
    function tintApply(rgb, r) {
        var b = document.body;
        if (!b) return;
        var layer = document.getElementById('lmx-tintbg');
        if (rgb) {
            var TL = tintTL(), c = rgb.join(',');
            if (!layer) { layer = document.createElement('div'); layer.id = 'lmx-tintbg'; b.appendChild(layer); }
            layer.style.background = 'radial-gradient(62vw 54vh at 14% 6%,rgba(' + c + ',' + TL[0] + '),rgba(' + c + ',0) 64%),radial-gradient(65vw 55vh at 92% 100%,rgba(' + c + ',' + TL[1] + '),rgba(' + c + ',0) 64%),linear-gradient(180deg,#0d0f1f 0%,#080a14 100%)';
            var box = r && r.find ? r.find('.full-start-new__buttons').eq(0) : null;
            if (box && box.length) box[0].style.setProperty('--lmx-acc', c);
            b.classList.add('lmx-tint');
        } else b.classList.remove('lmx-tint');
    }
    function tintFrom(img) {
        var c = document.createElement('canvas'), W = 32, H = 32;
        c.width = W; c.height = H;
        var g = c.getContext('2d');
        g.drawImage(img, 0, 0, W, H);
        var d = g.getImageData(0, 0, W, H).data, i, NB = 18;
        var bw = [], br = [], bg = [], bb = [], ar = 0, ag = 0, ab = 0, an = 0;
        for (i = 0; i < NB; i++) { bw[i] = 0; br[i] = 0; bg[i] = 0; bb[i] = 0; }
        for (i = 0; i < d.length; i += 4) {
            var R = d[i], G = d[i + 1], B = d[i + 2], mx = Math.max(R, G, B), mn = Math.min(R, G, B);
            var lum = (R + G + B) / 3;
            if (lum < 30 || lum > 238) continue;
            ar += R; ag += G; ab += B; an++;
            var sat = mx ? (mx - mn) / mx : 0;
            if (sat < 0.18) continue;
            var df = mx - mn, h;
            if (mx === R) h = ((G - B) / df + 6) % 6; else if (mx === G) h = (B - R) / df + 2; else h = (R - G) / df + 4;
            var bi = Math.min(NB - 1, Math.floor(h * 60 / 20));
            var w = sat * (1 - Math.min(1, Math.abs(lum - 125) / 125) * 0.6);
            if (h >= 0.1 && h <= 0.9 && sat < 0.62) w *= 0.45;
            bw[bi] += w; br[bi] += R * w; bg[bi] += G * w; bb[bi] += B * w;
        }
        var best = -1, bs = 0;
        for (i = 0; i < NB; i++) {
            var sc = bw[i] + (bw[(i + 1) % NB] + bw[(i + NB - 1) % NB]) * 0.5;
            if (sc > bs) { bs = sc; best = i; }
        }
        var col;
        if (best >= 0 && bw[best] > 0.6) col = [br[best] / bw[best], bg[best] / bw[best], bb[best] / bw[best]];
        else if (an) col = [ar / an, ag / an, ab / an];
        else return null;
        var mxv = Math.max(col[0], col[1], col[2]) || 1, k = Math.min(1.8, 185 / mxv);
        var gray = (col[0] + col[1] + col[2]) / 3;
        return col.map(function (v) { return Math.min(255, Math.round((v * 0.85 + gray * 0.15) * k)); });
    }
    function posterTint(r, m) {
        if (!getBool('lmx_tint', true) || getStr('lmx_theme', 'default') !== 'apple' || !m || !m.id) { tintApply(null, r); return; }
        var path = m.backdrop_path || m.poster_path, big = !!m.backdrop_path;
        if (!path) { tintApply(null, r); return; }
        var key = typeOf(m) + m.id;
        if (tintCache[key] !== undefined) { tintApply(tintCache[key], r); return; }
        tintApply(null, r);
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            var rgb = null;
            try { rgb = tintFrom(img); } catch (e) { rgb = null; }
            if (Object.keys(tintCache).length > 300) tintCache = {};
            tintCache[key] = rgb; capKeys(tintCache, 80);
            if (r[0] && document.body.contains(r[0])) tintApply(rgb, r);
        };
        img.onerror = function () { tintCache[key] = null; };
        img.src = imgUrl(path, big ? 'w300' : 'w92');
    }

    var studioHooked = false;
    function studioAvatar(name) {
        var words = String(name).replace(/[^\wА-Яа-яІіЇїЄєҐґ ]/g, ' ').split(/\s+/).filter(Boolean);
        var ini = (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || '?').slice(0, 3)).toUpperCase();
        var h = 0, i;
        for (i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h + ',55%,42%)"/><stop offset="1" stop-color="hsl(' + ((h + 40) % 360) + ',60%,26%)"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><text x="100" y="118" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="' + (ini.length > 2 ? 52 : 70) + '" fill="#fff" text-anchor="middle">' + ini.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</text></svg>';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
    function studioHook() {
        if (studioHooked || !Lampa.Router || !Lampa.Router.call) return;
        studioHooked = true;
        var orig = Lampa.Router.call;
        Lampa.Router.call = function (name, data) {
            if (name === 'actor' && data && data.__lmxStudio) {
                var st = data.__lmxStudio;
                if (st.kind === 'network') {
                    return Lampa.Activity.push({ url: 'discover/tv', title: data.name, component: 'category_full', networks: st.id, sort_by: 'vote_count.desc', source: 'tmdb', page: 1 });
                }
                return orig.call(this, 'company', { id: st.id, name: data.name, card: st.card });
            }
            return orig.apply(this, arguments);
        };
    }
    function studioRow(e, m) {
        if (!getBool('lmx_studios', true) || !e.link || !e.link.rows || !m) return;
        var tv = typeOf(m) === 'tv', out = [], seen = {};
        function add(list, kind) {
            (list || []).forEach(function (x) {
                if (!x || !x.id || !x.name) return;
                var k = String(x.name).toLowerCase().replace(/[^a-zа-я0-9]/g, '');
                if (seen[k] || out.length >= 8) return;
                seen[k] = 1;
                out.push({ id: x.id, name: x.name, img: studioAvatar(String(x.name)), character: kind === 'network' ? 'Канал' : 'Студия', __lmxStudio: { kind: kind, id: x.id, card: m } });
            });
        }
        if (tv) add(m.networks, 'network');
        add(m.production_companies, 'company');
        if (!out.length) return;
        var rows = e.link.rows, built = (e.link.items && e.link.items.length) || 0, pos = -1, i;
        for (i = 0; i < rows.length; i++) if (rows[i] && rows[i][0] === 'persons') pos = i;
        if (rows.some(function (r) { return r && r[1] && r[1].__lmxStudios; })) return;
        pos = Math.max(built, pos + 1);
        if (pos > rows.length) pos = rows.length;
        studioHook();
        var srow = ['persons', { results: out, title: tv ? 'Студии и каналы' : 'Студии', __lmxStudios: 1 }];
        var mb = rows.filter(function (r) { return Array.isArray(r) && r[0] === 'description' && r[1] && r[1].lmxMore; })[0];
        if (mb) {
            var mm = mb[1].lmxMore;
            mm.rows.push(srow); mm.nS = (mm.nS || 0) + out.length;
            if (mm.open) rows.push(srow);
            if (mm.upd) mm.upd();
            return;
        }
        rows.splice(pos, 0, srow);
    }

    function resumeNow(r, m) {
        var f = resumeFlag;
        resumeFlag = null;
        if (!f || f.id !== m.id || Date.now() - f.t > 8000) return;
        var tries = 0;
        (function go() {
            if (!document.body.contains(r[0] || document.body)) return;
            var cont = r.find('.full-start-new__buttons, .full-start__buttons').eq(0), w = cont.length ? watchBtnOf(cont) : null;
            if (!w && cont.length) w = cont.find('.full-start__button.selector').not('.lmx-edit,.lmx-folder,.lmx-virt,.lmx-likebtn,.lmx-mkbtn,.button--book,.button--reaction,.button--subscribe,.button--options,.view--trailer').get(0) || null;
            if (w) { try { window.$(w).trigger('hover:enter'); } catch (e) {} return; }
            if (++tries < 4) setTimeout(go, 500);
        })();
    }
    function pickWatch(r) {
        var cont = r.find('.full-start-new__buttons, .full-start__buttons').eq(0);
        var w = cont.length ? watchBtnOf(cont) : null;
        if (!w && cont.length) w = cont.find('.full-start__button.selector').not('.hide,.lmx-edit,.lmx-folder,.lmx-virt,.lmx-likebtn,.lmx-mkbtn,.button--book,.button--reaction,.button--subscribe,.button--options,.view--trailer').get(0) || null;
        return w;
    }
    function firstBtn(r) {
        var cont = r.find('.full-start-new__buttons, .full-start__buttons').eq(0), best = null, bl = 1e9;
        cont.find('.selector').each(function () {
            if (this.classList.contains('hide') || this.classList.contains('lmx-bh')) return;
            var b = this.getBoundingClientRect();
            if (!b.width || !b.height) return;
            if (b.left < bl - 1) { bl = b.left; best = this; }
        });
        return best;
    }
    function focusBtn(r, w) {
        var done = false;
        try { Lampa.Controller.collectionFocus(w, r[0]); done = true; } catch (e) {}
        if (!done || r.find('.selector.focus').not(w).length) { r.find('.selector.focus').not(w).removeClass('focus'); window.$(w).addClass('focus'); }
    }
    var upBound = false;
    function bindDescrUp() {
        if (upBound) return; upBound = true;
        window.addEventListener('keydown', function (ev) {
            var k = ev.keyCode;
            if (!(k === 38 || k === 40 || ev.key === 'ArrowUp' || ev.key === 'ArrowDown')) return;
            if ((k === 40 || ev.key === 'ArrowDown') && !document.querySelector('.modal')) {
                var dd = document.querySelector('.lmx-descr--btn.focus');
                if (dd && !document.querySelector('.full-start-new__reactions .selector')) {
                    var rr = window.$(dd).closest('.full-start-new, .full-start').parent(), ww = rr.length ? firstBtn(rr) : null;
                    if (ww) { ev.preventDefault(); ev.stopImmediatePropagation(); focusBtn(rr, ww); return; }
                }
            }
            safe(function () {
                if (document.querySelector('.modal')) return;
                var cur = document.querySelector('.selector.focus');
                var btnsBox = document.querySelector('.full-start-new__buttons, .full-start__buttons');
                if (!btnsBox) return;
                var goesUp = (k === 38 || ev.key === 'ArrowUp');
                var fromDescr = !!(cur && cur.classList.contains('lmx-descr--btn'));
                var wasIn = !!(cur && (btnsBox.contains(cur) || (cur.closest && cur.closest('.full-start-new__reactions'))));
                if (wasIn) return;
                var r = window.$(btnsBox).closest('.full-start-new, .full-start').parent();
                if (!r.length) return;
                [30, 90, 200].forEach(function (d) {
                    setTimeout(function () {
                        safe(function () {
                            var nf = document.querySelector('.selector.focus');
                            if (!nf) return;
                            var skipDescr = goesUp && !fromDescr && nf.classList.contains('lmx-descr--btn');
                            if (!btnsBox.contains(nf) && !skipDescr) return;
                            var w = firstBtn(r);
                            if (w && w !== nf) focusBtn(r, w);
                        });
                    }, d);
                });
            });
        }, true);
    }
    function focusWatch(r) {
        var pressed = false;
        var onKey = function () { pressed = true; window.removeEventListener('keydown', onKey, true); };
        window.addEventListener('keydown', onKey, true);
        var go = function () {
            safe(function () {
                if (pressed || !document.body.contains(r[0] || document.body)) return;
                if (document.querySelector('.modal')) return;
                var w = firstBtn(r);
                if (!w || w.classList.contains('focus')) return;
                focusBtn(r, w);
            });
        };
        [150, 500, 1000, 1700, 2600].forEach(function (d) { setTimeout(go, d); });
        setTimeout(function () { window.removeEventListener('keydown', onKey, true); }, 2800);
    }
    function onFull(e) {
        if (!e || (e.type !== 'complite' && e.type !== 'complete')) return;
        var m = e.data && e.data.movie;
        if (!m) return;
        var r = e.object.activity.render();
        safe(function () { studioRow(e, m); });
        safe(function () { likeButton(r, m); });
        safe(function () { marksButtons(r, m); });
        safe(function () { uacButton(r, m); });
        safe(function () { rxRow(r, m); });
        safe(rxMenu);
        safe(function () { btnsOnFull(r); });
        safe(function () { resumeNow(r, m); });
        safe(function () { posterTint(r, m); });
        safe(function () { r.find('.full-descr__text').removeClass('selector'); });
        safe(function () { var mark = function () { var a = r.closest('.activity'); if (a.length) a.addClass('lmx-fullact'); }; mark(); setTimeout(function () { safe(mark); }, 600); });
        safe(function () { hideEmptyComments(r); setTimeout(function () { safe(function () { hideEmptyComments(r); }); }, 1500); });
        var useFull = getBool('lmx_full', true) && !isMobile();
        if (!useFull && document.body && document.body.classList) { document.body.classList.remove('lmx-full'); document.body.classList.toggle('lmx-logo-on', getBool('lmx_logo', true)); }

        var foreign = r.find('.cardify, .custom-ghost-main').length > 0;
        function yieldToForeign() {
            r.find('.lmx-descr,.lmx-logo').remove();
            reveal(r);
            r.find('.full-start-new__title').removeClass('lmx-has-logo');
            if (document.body && document.body.classList) document.body.classList.remove('lmx-full');
        }
        if (foreign) {
            yieldToForeign();
        } else if (useFull && document.body && document.body.classList) {
            document.body.classList.add('lmx-full');
            document.body.classList.toggle('lmx-logo-on', getBool('lmx_logo', true));
        } else if (!foreign && document.body && document.body.classList) {
            document.body.classList.toggle('lmx-logo-on', getBool('lmx_logo', true));
        }
        if (!foreign) setTimeout(function () { if (r.find('.custom-ghost-main').length) yieldToForeign(); }, 800);

        if (!foreign && useFull) {
            r.find('.lmx-descr').remove();
            var txt = '';
            var body = r.find('.full-start-new__body').eq(0);
            if (txt && body.length) {
                var dEl = $('<div class="lmx-descr"><div class="lmx-descr__t"></div></div>').find('.lmx-descr__t').text(txt).end();
                if (getBool('lmx_descr_btn', true)) {
                    dEl.addClass('selector lmx-descr--btn');
                    dEl.on('hover:enter click', function () { safe(function () { openDescr(m, txt, r); }); });
                    safe(function () { focusWatch(r); bindDescrUp(); });
                }
                var btns = r.find('.full-start-new__buttons').eq(0);
                if (btns.length) btns.before(dEl);
                else body.append(dEl);
            }
        }

        if (!foreign && getBool('lmx_logo', true)) safe(function () { loadLogo(r, m); });

        if (!getBool('lmx_info', true)) return;
        var pills = infoPills(m);
        if (!pills.length) return;

        r.find('.lmx-info').remove();
        r.find('.lmx-ip-head').remove();
        if (pills.some(function (x) { return /\d+\s*(мин|ч)(?![а-яё])/.test(x.t || ''); })) r.find('.full-start-new__details span').each(function () {
            if (/^\d{1,2}:\d{2}(:\d{2})?$/.test((this.textContent || '').trim())) { $(this).hide(); $(this).next('.full-start-new__split').hide(); $(this).prev('.full-start-new__split').hide(); }
        });

        var html = '<div class="lmx-info">' + pills.map(function (x) {
            return '<div class="lmx-ip ' + (x.c || '') + '">' + x.t + '</div>';
        }).join('') + '</div>';

        var anchor = r.find('.full-start-new__right > .lmx-descr').eq(0);
        if (!anchor.length) anchor = r.find('.full-start-new__buttons, .full-start__buttons').eq(0);
        if (anchor.length) anchor.before(html);
        else r.find('.full-start-new__right, .full-start__right').eq(0).append(html);
        moveHead(r);
        safe(function () { hideDupes(r); });
        if (pills.some(function (x) { return /lmx-(done|bad|next|soon)/.test(x.c || ''); })) r.find('.full-start__status').addClass('hide');
    }

    function BI(p, f) {
        return '<svg viewBox="0 0 24 24" width="24" height="24" fill="' + (f ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
    }
    var BTN_ICONS = [
        ['play', 'Воспроизвести', BI('<path d="M7 4.5l13 7.5-13 7.5z"/>', 1)],
        ['bolt', 'Молния', BI('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', 1)],
        ['down', 'Загрузка', BI('<path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>')],
        ['star', 'Звезда', BI('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>')],
        ['heart', 'Сердце', BI('<path d="M12 20s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z"/>')],
        ['mark', 'Закладка', BI('<path d="M6 3h12v18l-6-4-6 4z"/>')],
        ['film', 'Кино', BI('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 15h18M8 4v16M16 4v16"/>')],
        ['tv', 'Телевизор', BI('<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>')],
        ['search', 'Поиск', BI('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>')],
        ['bell', 'Звонок', BI('<path d="M6 16v-5a6 6 0 0112 0v5l2 2H4z"/><path d="M10 21h4"/>')],
        ['globe', 'Глобус', BI('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>')],
        ['fire', 'Огонь', BI('<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>')],
        ['folder', 'Папка', BI('<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>')],
        ['gear', 'Настройки', BI('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>')],
        ['eye', 'Глаз', BI('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')],
        ['list', 'Список', BI('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>')]
    ];
    var BTN_COLORS = [['', 'По умолчанию'], ['#ffffff', 'Белый'], ['#ff5252', 'Красный'], ['#ff9800', 'Оранжевый'], ['#ffd54f', 'Жёлтый'],
        ['#4caf50', 'Зелёный'], ['#26c6da', 'Бирюзовый'], ['#42a5f5', 'Голубой'], ['#7e57c2', 'Фиолетовый'], ['#ec407a', 'Розовый']];
    var BTN_LOOKS = [['', 'Стандартный'], ['icons', 'Все компактные (1)'], ['full', 'Все с подписью (3)']];
    var BTN_NAMES = { 'button--book': 'Закладки', 'button--reaction': 'Реакции', 'button--subscribe': 'Подписаться', 'button--options': 'Опции',
        'button--play': 'Смотреть', 'button--lmxlike': 'Нравится', 'button--lmxlater': 'Смотреть позже', 'button--lmxseen': 'Просмотрено', 'button--lmxuac': 'Комментарии', 'view--trailer': 'Трейлеры', 'view--torrent': 'Торренты', 'view--online': 'Онлайн' };
    var PENCIL = BI('<path d="M4 20l1-4 11-11 3 3L8 19z"/>');
    var IMGI = BI('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5-5-8 9"/>');
    var PALI = BI('<path d="M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 003-3c0-6-4-11-8-11z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="11" r="1"/>');
    var CLOSEI = BI('<path d="M6 6l12 12M18 6L6 18"/>');

    var btnLast = null, btnRun = null, btnPageIds = [], btnScanNow = null, watchCap = null;

    function iconByKey(k) { for (var i = 0; i < BTN_ICONS.length; i++) if (BTN_ICONS[i][0] === k) return BTN_ICONS[i]; return null; }
    function strHash(s) { var h = 0, i; s = String(s); for (i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h).toString(36); }
    function jsonStore(key, def) {
        var o = null;
        try { o = Lampa.Storage.get(key, ''); if (typeof o === 'string') o = o ? JSON.parse(o) : null; } catch (e) { o = null; }
        return (o && typeof o === 'object') ? o : def;
    }
    function bmGet() {
        var o = jsonStore('lmx_btns', {});
        if (o.v !== 2) { o = { v: 2 }; Lampa.Storage.set('lmx_btn_known', {}); Lampa.Storage.set('lmx_btns', o); }
        o.order = o.order || []; o.hidden = o.hidden || []; o.colors = o.colors || {}; o.icons = o.icons || {};
        o.names = o.names || {}; o.modes = o.modes || {}; o.folders = o.folders || []; o.color = o.color || ''; o.look = o.look || ''; o.first = o.first || '';
        return o;
    }
    function bmSave(o) { Lampa.Storage.set('lmx_btns', o); }
    function knownGet() { return jsonStore('lmx_btn_known', {}); }

    function btnTitleOf(el) {
        var s = el.querySelector('span');
        var t = String((s ? s.textContent : el.textContent) || '').replace(/\s+/g, ' ').trim();
        if (!t) {
            t = el.getAttribute('title') || el.getAttribute('aria-label') || '';
            if (!t) { var cl = String(el.className || '').split(/\s+/), i; for (i = 0; i < cl.length; i++) if (BTN_NAMES[cl[i]]) { t = BTN_NAMES[cl[i]]; break; } }
        }
        return t;
    }
    function btnIdOf(el) {
        var cls = String(el.className || '').split(/\s+/), i, c;
        if (el.classList) {
            if (el.classList.contains('lmx-likebtn')) return 'lmx_like';
            if (el.classList.contains('lmx-mk-later')) return 'lmx_mk_later';
            if (el.classList.contains('lmx-mk-seen')) return 'lmx_mk_seen';
        }
        var t = String(el.__lmxT || btnTitleOf(el) || '').toLowerCase();
        for (i = 0; i < cls.length; i++) { c = cls[i]; if (/^(view--|button--)/.test(c) && c !== 'button--priority') return c + (t ? '|' + strHash(t) : ''); }
        return 't_' + strHash(t || 'x');
    }
    var btnUid = 0;
    function btnCollect(cont, r) {
        var els = cont.find('.full-start__button, .simple-button').not('.lmx-folder, .lmx-edit').toArray(), seen = {}, out = [];
        els.forEach(function (el) { if (el.__lmxId != null) seen[el.__lmxId] = 1; });
        els.forEach(function (el) {
            safe(function () {
                if (el.getAttribute('data-subtitle') == null) {
                    var sub = window.$ ? window.$(el).data('subtitle') : null;
                    if (sub != null && sub !== '' && typeof sub !== 'object') el.setAttribute('data-subtitle', String(sub));
                }
            });
            if (el.__lmxId == null) {
                el.__lmxT = btnTitleOf(el);
                var sv = el.querySelector('svg');
                el.__lmxS = sv ? sv.outerHTML : '';
                var id = btnIdOf(el);
                while (seen[id]) id += '#';
                seen[id] = 1;
                el.__lmxId = id;
            }
            if (!el.__lmxU) el.__lmxU = ++btnUid;
            out.push({ el: el, id: el.__lmxId, t: el.__lmxT, s: el.__lmxS, u: el.__lmxU });
        });
        return out;
    }
    function btnTokens(m, ids) {
        var all = ids.concat(m.folders.map(function (f) { return 'f:' + f.id; })), out = [];
        m.order.forEach(function (t) { if (all.indexOf(t) >= 0 && out.indexOf(t) < 0) out.push(t); });
        all.forEach(function (t) { if (out.indexOf(t) < 0) out.push(t); });
        return out;
    }
    function btnTokensFixed(m, ids) {
        if (!ids.length) return btnTokens(m, ids);
        return [ids[0]].concat(btnTokens(m, ids.slice(1)));
    }
    function paint(el, col) {
        if (col) { el.style.setProperty('--lmx-bc', col); el.classList.add('lmx-ic'); }
        else { el.style.removeProperty('--lmx-bc'); el.classList.remove('lmx-ic'); }
    }


    function labelsOf(el) {
        return $(el).children().filter(function () { return !/^(svg|img)$/i.test(this.tagName); }).toArray();
    }
    function inlineSet(node, map) {
        Object.keys(map).forEach(function (k) {
            var v = map[k], cur = node.style.getPropertyValue(k), pr = node.style.getPropertyPriority(k);
            if (v === null) { if (cur) node.style.removeProperty(k); }
            else if (cur !== v || pr !== 'important') node.style.setProperty(k, v, 'important');
        });
    }
    function reassertMode(el) {
        var d = el.__lmxD || '', cl = el.classList;
        ['1', '2', '3', 'P'].forEach(function (x) { var on = d === x; if (cl.contains('lmx-m' + x) !== on) cl.toggle('lmx-m' + x, on); });
        var n = !!el.__lmxN;
        if (cl.contains('lmx-n') !== n) cl.toggle('lmx-n', n);
        var box = { 'width': null, 'min-width': null, 'height': null, 'padding': null, 'border-radius': null, 'justify-content': null, 'font-size': null, 'font-weight': null };
        if (d === '1') box = { 'width': '3.2em', 'min-width': '0', 'height': '3.2em', 'padding': '0', 'border-radius': '50%', 'justify-content': 'center', 'font-size': '.95em' };
        else if (d === 'P') box = { 'width': 'auto', 'min-width': '0', 'height': '3.2em', 'padding': '0 1.8em', 'border-radius': '2em', 'justify-content': 'center', 'font-size': '.95em', 'font-weight': '700' };
        else if (d) box = { 'width': 'auto', 'min-width': '0', 'height': '3.2em', 'padding': '0 1.2em', 'border-radius': '2em', 'justify-content': 'center', 'font-size': '.95em' };
        inlineSet(el, box);
        var ren = cl.contains('lmx-renamed');
        labelsOf(el).forEach(function (l) {
            if (ren) inlineSet(l, { 'display': 'none' });
            else if (d === '1') inlineSet(l, { 'display': 'none' });
            else if (d) inlineSet(l, { 'display': 'inline', 'visibility': 'visible', 'opacity': '1', 'white-space': 'nowrap', 'font-size': '1em',
                'max-width': d === '2' ? '6.5em' : 'none', 'overflow': d === '2' ? 'hidden' : null, 'text-overflow': d === '2' ? 'ellipsis' : null });
            else inlineSet(l, { 'display': null, 'visibility': null, 'opacity': null, 'white-space': null, 'font-size': null, 'max-width': null, 'overflow': null, 'text-overflow': null });
        });
    }
    function watchEl(el) {
        if (el.__lmxMo || !window.MutationObserver) return;
        var hits = 0, t0 = 0;
        var stripFocus = function (c) { return String(c || '').replace(/\b(focus|hover|animate-trigger-enter|animate-trigger-left)\b/g, '').replace(/\s+/g, ' ').trim(); };
        var mo = new MutationObserver(function (recs) {
            var rel = false;
            for (var q = 0; q < recs.length && !rel; q++) {
                var rc = recs[q];
                if (rc.type !== 'attributes' || rc.attributeName === 'style' || stripFocus(rc.oldValue) !== stripFocus(el.className)) rel = true;
            }
            if (!rel) return;
            var now0 = Date.now();
            if (now0 - t0 > 3000) { t0 = now0; hits = 0; }
            if (++hits <= 8 && document.body.contains(el)) { reassertMode(el); mo.takeRecords(); }
            clearTimeout(el.__lmxTm);
            el.__lmxTm = setTimeout(function () {
                if (!document.body.contains(el)) { mo.disconnect(); el.__lmxMo = null; return; }
                var now = Date.now();
                if (now - t0 > 3000) { t0 = now; hits = 0; }
                if (++hits > 8) return;
                reassertMode(el);
            }, 80);
        });
        mo.observe(el, { attributes: true, attributeOldValue: true, attributeFilter: ['class', 'style'], childList: true });
        el.__lmxMo = mo;
    }

    function btnSetMode(el, d, allOn) {
        el.__lmxD = d; el.__lmxN = allOn;
        reassertMode(el);
        watchEl(el);
    }
    // c = { m, map, inFolder, primary, modeOf, allOn }
    function btnStyleAll(list, c) {
        var m = c.m, map = c.map, inFolder = c.inFolder, primary = c.primary, modeOf = c.modeOf;
        list.forEach(function (b) {
            var el = b.el, id = b.id, ik = m.icons[id], ic = ik ? iconByKey(ik) : null;
            map[id] = el;
            var tn, wi;
            for (wi = el.childNodes.length - 1; wi >= 0; wi--) {
                tn = el.childNodes[wi];
                if (tn.nodeType === 3 && String(tn.nodeValue).trim()) {
                    var wr = document.createElement('span');
                    wr.className = 'lmx-tw';
                    el.replaceChild(wr, tn);
                    wr.appendChild(tn);
                }
            }
            var mineIco = null, ci;
            for (ci = 0; ci < el.children.length; ci++) if (el.children[ci].classList.contains('lmx-ico')) { mineIco = el.children[ci]; break; }
            if (ic) {
                if (!mineIco || el.__lmxSet !== ik) {
                    if (mineIco) el.removeChild(mineIco);
                    mineIco = $(ic[2])[0];
                    mineIco.classList.add('lmx-ico');
                    el.insertBefore(mineIco, el.firstChild);
                    el.__lmxSet = ik;
                }
                if (!el.classList.contains('lmx-iconed')) el.classList.add('lmx-iconed');
            } else {
                if (mineIco) el.removeChild(mineIco);
                el.classList.remove('lmx-iconed');
                el.__lmxSet = null;
            }
            if (m.names[id]) {
                if (el.getAttribute('data-lmx-name') !== m.names[id]) el.setAttribute('data-lmx-name', m.names[id]);
                if (!el.classList.contains('lmx-renamed')) el.classList.add('lmx-renamed');
            } else {
                if (el.hasAttribute('data-lmx-name')) el.removeAttribute('data-lmx-name');
                el.classList.remove('lmx-renamed');
            }
            paint(el, m.colors[id] || m.color);
            btnSetMode(el, modeOf(id), c.allOn);
            el.classList.toggle('lmx-primary', id === primary);
            var off = m.hidden.indexOf(id) >= 0 || !!inFolder[id];
            el.classList.toggle('lmx-bh', off);
            el.classList.toggle('selector', !off);
        });
    }

    function btnFolders(cont, c) {
        var m = c.m, map = c.map, modeOf = c.modeOf, primary = c.primary;
        var fEls = {};
        m.folders.forEach(function (f) {
            var items = (f.items || []).filter(function (id) { return map[id]; });
            if (!items.length) return;
            var tk = 'f:' + f.id, ic = iconByKey(m.icons[tk] || 'folder') || BTN_ICONS[12];
            var fe = $('<div class="full-start__button selector lmx-folder"></div>').html(ic[2] + '<span></span>');
            fe.find('span').text(f.name);
            paint(fe[0], m.colors[tk] || m.color);
            var off = m.hidden.indexOf(tk) >= 0;
            btnSetMode(fe[0], modeOf(tk), c.allOn);
            fe[0].classList.toggle('lmx-primary', tk === primary);
            fe[0].classList.toggle('lmx-bh', off);
            fe[0].classList.toggle('selector', !off);
            fe.on('hover:enter', function () {
                var enabled = Lampa.Controller.enabled().name;
                Lampa.Select.show({
                    title: f.name,
                    items: items.map(function (id) { return { title: m.names[id] || map[id].__lmxT || id, id: id }; }),
                    onBack: function () { Lampa.Controller.toggle(enabled); },
                    onSelect: function (it) {
                        Lampa.Controller.toggle(enabled);
                        setTimeout(function () { $(map[it.id]).trigger('hover:enter'); }, 40);
                    }
                });
            });
            fe[0].__lmxId = tk;
            fEls[tk] = fe[0];
        });
        return fEls;
    }

    function btnEditBtn(cont) {
        var ed = cont[0].__lmxEd;
        if (!ed) {
            ed = $('<div class="full-start__button selector lmx-edit"></div>').html(PENCIL + '<span>Кнопки</span>');
            ed.on('hover:enter', function () { openButtonsEditor(); });
            cont[0].__lmxEd = ed;
        }
        if (cont.children().last()[0] !== ed[0]) cont.append(ed);
        ed[0].style.setProperty('order', '9999', 'important');
    }

    function btnFocusFix(cont) {
        safe(function () {
            var c0 = cont[0];
            if (!c0.__lmxT0) c0.__lmxT0 = Date.now();
            if (!window.__lmxKeyHook) { window.__lmxKeyHook = 1; window.__lmxKeyT = 0; ['keydown', 'mousedown', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, function () { window.__lmxKeyT = Date.now(); }, true); }); }
            if (Date.now() - c0.__lmxT0 > 2000 || (window.__lmxKeyT || 0) > c0.__lmxT0) return;
            if (Lampa.Controller.enabled().name !== 'full_start') return;
            var best = null, bo = 1e9, i, e, o;
            for (i = 0; i < c0.children.length; i++) {
                e = c0.children[i];
                if (!e.classList.contains('selector') || e.classList.contains('lmx-edit') || e.offsetWidth <= 0) continue;
                o = parseInt(e.style.order, 10); if (isNaN(o)) o = i;
                if (o < bo) { bo = o; best = e; }
            }
            var cf = c0.querySelector('.focus');
            if (best && cf && cf !== best && c0.contains(cf)) {
                Lampa.Controller.collectionFocus(best, c0.closest('.scroll') || c0.parentNode);
            }
        });
        safe(function () {
            if (Lampa.Controller.enabled().name !== 'full_start') return;
            var f = cont.find('.focus');
            if (f.length && f.is(':visible') && f.hasClass('selector')) return;
            Lampa.Controller.toggle('full_start');
        });
    }

    var PIN_T0 = Date.now(), pinWatched = false;
    function pinKey(el) {
        var cl = String(el.className || '').split(/\s+/).filter(function (c) { return /^(view--|button--)/.test(c) && c !== 'button--priority'; });
        var sub = el.getAttribute ? el.getAttribute('data-subtitle') : '';
        return cl.length ? cl.sort().join(' ') + (sub ? '|' + sub : '') : 't:' + norm(btnTitleOf(el));
    }
    function pinWatch() {
        if (pinWatched || !Lampa.Storage || !Lampa.Storage.listener) return;
        pinWatched = true;
        Lampa.Storage.listener.follow('change', function (e) {
            if (!e || e.name !== 'full_btn_priority') return;
            if (!e.value && Date.now() - PIN_T0 > 10000) Lampa.Storage.set('lmx_btn_pin', '');
        });
    }
    function pinMark(btn) {
        var $ = window.$;
        $('[data-lmx-pin]').removeAttr('data-lmx-pin');
        $(btn).attr('data-lmx-pin', '1');
    }
    function pinRestore(r, cont) {
        safe(function () {
            pinWatch();
            var pin = String(Lampa.Storage.get('lmx_btn_pin', '') || '');
            var cur = cont.find('.button--priority');
            if (!pin || (cur.length && cur.attr('data-lmx-pin'))) return;
            var host = r[0]; host.__lmxPinN = (host.__lmxPinN || 0) + 1;
            if (host.__lmxPinN > 12) return;
            var hit = null;
            r.find('.buttons--container > .full-start__button').not('.hide').each(function () { if (!hit && pinKey(this) === pin) hit = window.$(this); });
            if (!hit) return;
            pinMark(hit[0]);
            cur.remove();
            var clon = hit.clone().removeClass('focus view--torrent').addClass('button--priority');
            clon.on('hover:enter', function () { hit.trigger('hover:enter'); }).on('hover:long', function () {
                clon.remove();
                Lampa.Storage.set('full_btn_priority', '');
                Lampa.Storage.set('lmx_btn_pin', '');
                Lampa.Controller.toggle('content');
            });
            cont.prepend(clon);
            if (String(Lampa.Storage.get('full_btn_priority', '')) !== 'lmx') Lampa.Storage.set('full_btn_priority', 'lmx');
            if (Lampa.Controller.enabled().name === 'full_start') Lampa.Controller.toggle('full_start');
        });
    }

    function btnApply(r) {
        var cont = r.find('.full-start-new__buttons, .full-start__buttons').eq(0);
        if (!cont.length) return;
        pinRestore(r, cont);
        btnVirtualize(r, cont);
        var m = bmGet(), list = btnCollect(cont, r), known = knownGet(), changed = false, map = {}, inFolder = {};
        list.forEach(function (b) {
            var k = known[b.id];
            var sb = b.el.__lmxSub || ''; if (!k || k.t !== b.t || k.s !== b.s || (k.sub || '') !== sb) { known[b.id] = { t: b.t, s: b.s, sub: sb }; changed = true; }
        });
        if (changed) Lampa.Storage.set('lmx_btn_known', known);
        cont.find('.lmx-folder').remove();
        m.folders.forEach(function (f) { (f.items || []).forEach(function (id) { inFolder[id] = f.id; }); });

        var allOn = getBool('lmx_btn_all', false);
        var reorder = (m.order.length > 0 || m.folders.length > 0);
        var ids = list.map(function (b) { return b.id; });
        var toks = allOn ? btnTokens(m, ids) : btnTokensFixed(m, ids);
        var shown = function (t) {
            if (m.hidden.indexOf(t) >= 0 || inFolder[t]) return false;
            if (t.indexOf('f:') === 0) {
                var ok = false;
                m.folders.forEach(function (f) { if ('f:' + f.id === t) (f.items || []).forEach(function (x) { if (ids.indexOf(x) >= 0) ok = true; }); });
                return ok;
            }
            return true;
        };
        var primary = '';
        toks.forEach(function (t) { if (!primary && shown(t)) primary = t; });
        function modeOf(id) {
            if (id === primary) return getStr('lmx_theme', 'default') === 'default' ? 'P' : '';
            return m.modes[id] || (m.look === 'full' ? '3' : (m.look === 'icons' ? '1' : (allOn ? '1' : '')));
        }

        var c = { m: m, map: map, inFolder: inFolder, primary: primary, modeOf: modeOf, allOn: allOn };
        btnStyleAll(list, c);
        var fEls = btnFolders(cont, c);

        Object.keys(fEls).forEach(function (t) { cont.append(fEls[t]); });
        var allToks = (allOn || reorder) ? toks.slice() : ids.concat(Object.keys(fEls));
        if (allOn || reorder) m.folders.forEach(function (f) { if (allToks.indexOf('f:' + f.id) < 0) allToks.push('f:' + f.id); });
        allToks.forEach(function (t, i) {
            var el = map[t] || fEls[t];
            if (!el) return;
            if (reorder) el.style.setProperty('order', String(i), 'important'); else el.style.removeProperty('order');
        });
        if (document.body && document.body.classList) document.body.classList.toggle('lmx-all', allOn);
        syncCi();
        cont[0].__lmxWant = null;
        btnPageIds = allOn ? toks.filter(function (t) { return t.indexOf('f:') !== 0; }) : ids;
        btnEditBtn(cont);
        btnFocusFix(cont);
    }

    function patchSelectHidden() {
        if (!Lampa.Select || !Lampa.Select.show || Lampa.Select.__lmxP) return;
        var orig = Lampa.Select.show;
        Lampa.Select.show = function (o) {
            if (watchCap) { watchCap.o = o; return; }
            try {
                if (o && o.items && o.items.length > 1 && Lampa.Controller.enabled().name === 'full_start') {
                    var m = bmGet(), known = knownGet(), off = {};
                    m.hidden.forEach(function (id) {
                        if (id.indexOf('f:') === 0) return;
                        [m.names[id], known[id] && known[id].t, BTN_NAMES[id.replace(/#+$/, '').split('|')[0]]].forEach(function (t) {
                            if (t) off[String(t).replace(/\s+/g, ' ').trim().toLowerCase()] = 1;
                        });
                    });
                    m.hidden.length || (off = {});
                    Object.keys(known).forEach(function (id) {
                        if (m.hidden.indexOf(id) >= 0 || id.indexOf('f:') === 0) return;
                        [m.names[id], known[id] && known[id].t].forEach(function (t) { if (t) delete off[String(t).replace(/\s+/g, ' ').trim().toLowerCase()]; });
                    });
                    if (Object.keys(off).length) {
                        var left = o.items.filter(function (it) {
                            return !(it && it.title && off[String(it.title).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().toLowerCase()]);
                        });
                        if (left.length && left.length < o.items.length) o.items = left;
                    }
                }
            } catch (e) {}
            safe(function () {
                if (!o || !o.onLong || o.__lmxL || Lampa.Controller.enabled().name !== 'full_start') return;
                var ol = o.onLong; o.__lmxL = true;
                if (o.items) o.items = o.items.filter(function (it) { return !(it && it.btn && it.btn[0] && it.btn[0].hasAttribute && it.btn[0].hasAttribute('data-lmx-pin')); });
                o.onLong = function (a) {
                    safe(function () {
                        if (a && a.btn && a.btn[0]) {
                            Lampa.Storage.set('lmx_btn_pin', pinKey(a.btn[0]));
                            pinMark(a.btn[0]);
                        }
                    });
                    var rv = ol.apply(this, arguments);
                    safe(function () { Lampa.Storage.set('full_btn_priority', 'lmx'); });
                    return rv;
                };
            });
            return orig.apply(this, arguments);
        };
        Lampa.Select.__lmxP = true;
    }

    function picHtml(p) {
        if (!p) return BTN_ICONS[0][2];
        if (typeof p === 'string') return /^\s*</.test(p) ? p : '<img src="' + p.replace(/"/g, '') + '">';
        if (p.jquery && p[0]) return p[0].outerHTML;
        if (p.outerHTML) return p.outerHTML;
        return BTN_ICONS[0][2];
    }
    function watchBtnOf(cont) {
        var el = null;
        cont.find('.full-start__button').not('.lmx-edit, .lmx-folder, .lmx-virt').each(function () {
            if (!el && /(^|\s)button--play(\s|$)/.test(String(this.className || ''))) el = this;
        });
        if (!el) cont.find('.full-start__button').not('.lmx-edit, .lmx-folder, .lmx-virt').each(function () {
            if (!el && /^(дивитись|дивись|смотреть|watch)$/i.test(String(this.__lmxT || btnTitleOf(this)))) el = this;
        });
        return el;
    }
    function btnCaptureMenu(cont, cb) {
        var w = watchBtnOf(cont);
        if (!w) return cb(null);
        watchCap = { o: null };
        try { $(w).trigger('hover:enter'); } catch (e) {}
        var cap = watchCap;
        setTimeout(function () { watchCap = null; cb(cap.o); }, 250);
    }
    function norm(t) { return String(t || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); }
    function menuGet() { var a = jsonStore('lmx_btn_menu', []); return Array.isArray(a) ? a : []; }
    function btnScan(cont, cb) {
        btnCaptureMenu(cont, function (o) {
            var out = [];
            if (o && o.items) o.items.forEach(function (it) {
                if (!it || !it.title) return;
                out.push({ t: norm(it.title), sub: norm(it.subtitle), h: picHtml(it.picture || it.icon || it.img || it.image) });
            });
            if (out.length) Lampa.Storage.set('lmx_btn_menu', out);
            cb(out.length);
        });
    }
    function btnVirtualize(r, cont) {
        var list = getBool('lmx_btn_all', false) ? menuGet() : [];
        if (!list.length) { cont.find('.lmx-virt').remove(); return; }
        if (cont.find('.lmx-virt').length) return;
        var have = {}, seenV = {};
        cont.find('.full-start__button').not('.lmx-virt, .lmx-edit, .lmx-folder').each(function () { have[norm(this.__lmxT || btnTitleOf(this)).toLowerCase()] = 1; });
        list.forEach(function (d) {
            var key = d.t.toLowerCase() + '|' + (d.sub || '').toLowerCase();
            if (seenV[key] || (have[d.t.toLowerCase()] && !d.sub)) return;
            seenV[key] = 1;
            var el = $('<div class="full-start__button selector lmx-virt"></div>').html(d.h + '<span></span>');
            el.find('span').text(d.t);
            el[0].__lmxT = d.t; el[0].__lmxS = d.h; el[0].__lmxSub = d.sub || '';
            el[0].__lmxId = 'v:' + strHash(d.t + '|' + (d.sub || ''));
            el.on('hover:enter', function () {
                var enabled = Lampa.Controller.enabled().name;
                btnCaptureMenu(cont, function (o) {
                    var it = null;
                    if (o && o.items) o.items.forEach(function (x) { if (!it && x && norm(x.title) === d.t && norm(x.subtitle) === (d.sub || '')) it = x; });
                    Lampa.Controller.toggle(enabled);
                    if (!it) { if (Lampa.Noty) Lampa.Noty.show('Эта кнопка сейчас недоступна'); return; }
                    setTimeout(function () { try { if (o.onSelect) o.onSelect(it); } catch (e) { console.error('LMX virt', e); } }, 40);
                });
            });
            cont.append(el);
        });
    }

    function btnsOnFull(r) {
        safe(patchSelectHidden);
        var cont = r.find('.full-start-new__buttons, .full-start__buttons').eq(0);
        if (!cont.length || !window.$) return;
        var node = cont[0], timer = 0, busy = false;
        function sig() { return btnCollect(cont, r).map(function (b) { return b.id + ':' + b.t + ':' + b.u; }).sort().join('|'); }
        function orderBad() {
            var want = node.__lmxWant;
            if (!want || !want.length) return false;
            var set = {}, dom = [];
            want.forEach(function (t) { set[t] = 1; });
            cont.children().each(function () { if (this.__lmxId && set[this.__lmxId]) dom.push(this.__lmxId); });
            return dom.join('|') !== want.join('|');
        }
        function run(force) {
            if (!document.body.contains(node)) return;
            var s = sig();
            if (!force && s === node.__lmxSig) {
                if (!orderBad() || (node.__lmxFights = (node.__lmxFights || 0) + 1) > 8) return;
            }
            busy = true;
            try { btnApply(r); } catch (e) { console.error('LMX btns', e); }
            node.__lmxSig = sig();
            busy = false;
        }
        var rt = 0;
        function markReady() {
            if (node.classList.contains('lmx-ready')) return;
            clearTimeout(rt);
            rt = setTimeout(function () { node.classList.add('lmx-ready'); }, 450);
        }
        btnLast = r; btnRun = run;
        run(true);
        markReady();
        btnScanNow = function (cb) { btnScan(cont, cb); };
        var mo = new MutationObserver(function (recs) {
            if (busy) return;
            var rel = false;
            for (var q = 0; q < recs.length && !rel; q++) { var tg = recs[q].target; if (node.contains(tg) || tg.contains(node)) rel = true; }
            if (!rel) return;
            var fresh = false;
            for (var i = 0; i < recs.length && !fresh; i++) {
                for (var j = 0; j < recs[i].addedNodes.length; j++) {
                    var an = recs[i].addedNodes[j];
                    if (an.nodeType === 1 && an.classList && an.classList.contains('full-start__button') && !an.__lmxId) { fresh = true; break; }
                }
            }
            if (fresh && document.body.contains(node) && (node.__lmxQuick = (node.__lmxQuick || 0) + 1) < 40) {
                run(false);
                mo.takeRecords();
            }
            clearTimeout(timer);
            timer = setTimeout(function () {
                if (!document.body.contains(node)) { mo.disconnect(); return; }
                run(false);
                markReady();
            }, 200);
        });
        mo.observe(r[0] || node, { childList: true, subtree: true });
    }

    var edPrev = null;
    function reloadApp() {
        window.__lmxReloading = true;
        if (Lampa.Noty) Lampa.Noty.show('Перезапуск...');
        setTimeout(function () { try { window.location.reload(); } catch (e) { location.href = location.href; } }, 400);
    }
    function syncCi() {
        safe(function () {
            var m = bmGet(), lk = m.look, on = lk === 'icons' || (getBool('lmx_btn_all', false) && lk !== 'full');
            document.body.classList.toggle('lmx-ci', !!on);
            document.body.classList.toggle('lmx-hold', on || getStr('lmx_theme', 'default') !== 'default' || Object.keys(m.modes || {}).length > 0);
            var cls = {};
            Object.keys(m.modes || {}).forEach(function (id) {
                if (m.modes[id] !== '1') return;
                var c = id.split('|')[0].replace(/#+$/, '');
                if (/^(view--|button--)[\w-]+$/.test(c)) cls[c] = 1;
            });
            var css = Object.keys(cls).map(function (c) {
                var sel = 'html body .full-start-new__buttons .full-start__button.' + c + ':not(.lmx-m2):not(.lmx-m3):not(.lmx-primary):not(.button--priority):not(.lmx-edit):not(:first-child):not(#lmx-x)';
                return sel + '{width:3.2em !important;min-width:0 !important;height:3.2em !important;padding:0 !important;border-radius:50% !important;justify-content:center;font-size:.95em !important}' + sel + ' span{display:none !important}';
            }).join('');
            var st = document.getElementById('lmx-pre');
            if (!st) { st = document.createElement('style'); st.id = 'lmx-pre'; document.head.appendChild(st); }
            if (st.textContent !== css) st.textContent = css;
        });
    }
    function openButtonsEditor() {
        if (!(Lampa.Modal && Lampa.Modal.open && Lampa.Select && window.$)) return;
        var known = knownGet(), ids0 = Object.keys(known);
        if (!ids0.length) { if (Lampa.Noty) Lampa.Noty.show('Сначала откройте любой фильм — его кнопки появятся здесь'); return; }
        var ids = btnPageIds.filter(function (x) { return known[x]; });
        if (!ids.length) ids = ids0;
        var enabled = Lampa.Controller.enabled().name;
        if (enabled === 'modal' || !enabled) enabled = edPrev || 'content';
        edPrev = enabled;
        var m = bmGet(), lastFire = 0, closed = false;
        var wrap = $('<div class="lmx-be"></div>'), top = $('<div></div>'), listEl = $('<div></div>'), bottom = $('<div></div>');
        wrap.append(top, listEl, bottom);
        var first = btnPageIds[0] || '';

        function save() { bmSave(m); }
        function findF(id) { for (var i = 0; i < m.folders.length; i++) if (m.folders[i].id === id) return m.folders[i]; return null; }
        function isF(t) { return t.indexOf('f:') === 0; }
        function titleOf(t) {
            if (isF(t)) { var f = findF(t.slice(2)); return f ? f.name : ''; }
            return m.names[t] || (known[t] && known[t].t) || BTN_NAMES[t.replace(/#+$/, '').split('|')[0]] || t;
        }
        function svgOf(t) {
            var ic = iconByKey(m.icons[t]);
            if (ic) return ic[2];
            if (isF(t)) return BTN_ICONS[12][2];
            return (known[t] && known[t].s) || BI('');
        }
        function folderOf(t) {
            for (var i = 0; i < m.folders.length; i++) if ((m.folders[i].items || []).indexOf(t) >= 0) return m.folders[i];
            return null;
        }
        function followFocus(el) {
            safe(function () {
                if (window.Navigator && Navigator.focus) Navigator.focus(el);
                else $(el).trigger('hover:focus');
            });
        }
        function bind(btn, fn) {
            btn.on('hover:enter click', function () {
                var n = Date.now();
                if (n - lastFire < 250) return;
                lastFire = n;
                fn(this);
            });
        }
        function pick(title, items, cb) {
            Lampa.Select.show({
                title: title,
                items: items,
                onBack: function () { Lampa.Controller.toggle('modal'); },
                onSelect: function (it) { Lampa.Controller.toggle('modal'); setTimeout(function () { cb(it); }, 30); }
            });
        }
        function ask(title, value, cb) {
            if (!(Lampa.Input && Lampa.Input.edit)) return;
            save();
            closed = true;
            Lampa.Modal.close();
            setTimeout(function () {
                Lampa.Input.edit({ title: title, value: value || '', free: true, nosave: true }, function (v) {
                    try { cb(String(v == null ? '' : v).trim()); } catch (e) {}
                    setTimeout(openButtonsEditor, 150);
                });
            }, 150);
        }
        function reopen() {
            save();
            closed = true;
            Lampa.Modal.close();
            setTimeout(openButtonsEditor, 120);
        }
        function rowOf(t) { return listEl.children().filter(function () { return $(this).attr('data-t') === t; }).eq(0); }
        function refresh(t) {
            var row = rowOf(t);
            if (!row.length) return;
            var ico = row.find('.lmx-be__ico').html(svgOf(t));
            paint(ico[0], m.colors[t] || m.color);
            row.find('.lmx-ord__name > span').eq(0).text(titleOf(t));
            var f = !isF(t) ? folderOf(t) : null, sub = row.find('.lmx-ord__sub');
            sub.text(isF(t) ? 'Папка' : (f ? 'В папке «' + f.name + '»' : ((known[t] && known[t].sub) || '')));
            var off = m.hidden.indexOf(t) >= 0;
            row.find('.lmx-ord__btn[data-act=vis]').html(off ? BOX_OFF : BOX_ON).toggleClass('lmx-ord__off', off);
            row.find('.lmx-ord__btn[data-act=mode]').text(m.modes[t] || '1');
        }
        function refreshAll() { listEl.children().each(function () { refresh($(this).attr('data-t')); }); }
        function saveOrderFromDom() {
            m.order = listEl.children().map(function () { return $(this).attr('data-t'); }).get();
            save();
        }
        function move(t, d, btnEl) {
            var row = rowOf(t), sib = d < 0 ? row.prev() : row.next();
            if (!getBool('lmx_btn_all', false) && (row.attr('data-lock') || (sib.length && sib.attr('data-lock')))) { if (Lampa.Noty) Lampa.Noty.show('Первая кнопка закреплена долгим нажатием — она всегда первая'); return; }
            if (!sib.length) return;
            if (d < 0) row.insertBefore(sib); else row.insertAfter(sib);
            saveOrderFromDom();
            followFocus(btnEl);
        }
        function rowFor(t) {
            var folder = isF(t), lock = t === first;
            var row = $('<div class="lmx-ord__row lmx-be__row"></div>').attr('data-t', t);
            row.append($('<div class="lmx-be__ico"></div>').html(svgOf(t)));
            var nm = $('<div class="lmx-ord__name"></div>').append($('<span></span>').text(titleOf(t)));
            nm.append($('<span class="lmx-ord__sub"></span>').text(lock ? 'Первая кнопка — всегда в стиле темы; размер не меняется' : ((known[t] && known[t].sub) || '')));
            row.append(nm);
            if (lock) row.attr('data-lock', '1');
            var off = m.hidden.indexOf(t) >= 0;
            var defs = [['edit', PENCIL], ['icon', IMGI], ['color', PALI], ['up', CHEV_UP], ['down', CHEV_DOWN],
                folder ? ['del', CLOSEI] : ['mode', null], ['vis', off ? BOX_OFF : BOX_ON]];
            defs.forEach(function (d) {
                var b = $('<div class="lmx-ord__btn selector"></div>').attr('data-act', d[0]);
                if (d[0] === 'mode') b.text(m.modes[t] || '1'); else b.html(d[1]);
                if (d[0] === 'vis' && off) b.addClass('lmx-ord__off');
                bind(b, function (el) { act(t, d[0], el); });
                row.append(b);
            });
            return row;
        }
        function act(t, a, el) {
            if (a === 'up') move(t, -1, el);
            else if (a === 'down') move(t, 1, el);
            else if (a === 'vis') {
                var k = m.hidden.indexOf(t);
                if (k >= 0) m.hidden.splice(k, 1); else m.hidden.push(t);
                save(); refresh(t);
            } else if (a === 'mode') {
                if (t === first) { if (Lampa.Noty) Lampa.Noty.show('Первая кнопка всегда в стиле темы. Иконку и цвет можно изменить'); return; }
                var seq = ['1', '2', '3'], cur = m.modes[t] || '1';
                m.modes[t] = seq[(seq.indexOf(cur) + 1) % seq.length];
                save(); refresh(t);
            } else if (a === 'color') {
                pick('Цвет иконки', BTN_COLORS.map(function (c) { return { title: c[1], c: c[0] }; }), function (it) {
                    if (it.c) m.colors[t] = it.c; else delete m.colors[t];
                    save(); refresh(t);
                });
            } else if (a === 'icon') {
                var items = [{ title: 'По умолчанию', k: '' }].concat(BTN_ICONS.map(function (i) { return { title: i[1], k: i[0] }; }));
                pick('Иконка', items, function (it) {
                    if (it.k) m.icons[t] = it.k; else delete m.icons[t];
                    save(); refresh(t);
                });
            } else if (a === 'edit') {
                var menu = [{ title: 'Переименовать', x: 'name' }];
                if (!isF(t)) {
                    if (m.folders.length) menu.push({ title: 'Положить в папку…', x: 'into' });
                    if (folderOf(t)) menu.push({ title: 'Убрать из папки', x: 'out' });
                }
                if (m.names[t]) menu.push({ title: 'Вернуть старое название', x: 'unname' });
                pick(titleOf(t), menu, function (it) {
                    if (it.x === 'name') {
                        ask('Название', titleOf(t), function (v) {
                            if (v) {
                                if (isF(t)) { var f = findF(t.slice(2)); if (f) f.name = v; } else m.names[t] = v;
                                save();
                            }
                        });
                    } else if (it.x === 'unname') { delete m.names[t]; save(); refresh(t); }
                    else if (it.x === 'out') {
                        m.folders.forEach(function (f) { f.items = (f.items || []).filter(function (x) { return x !== t; }); });
                        save(); refresh(t);
                    } else if (it.x === 'into') {
                        pick('Папка', m.folders.map(function (f) { return { title: f.name, fid: f.id }; }), function (p) {
                            m.folders.forEach(function (f) { f.items = (f.items || []).filter(function (x) { return x !== t; }); });
                            var tf = findF(p.fid);
                            if (tf) { tf.items = tf.items || []; tf.items.push(t); }
                            save(); refresh(t);
                        });
                    }
                });
            } else if (a === 'del') {
                var id = t.slice(2);
                m.folders = m.folders.filter(function (f) { return f.id !== id; });
                m.order = m.order.filter(function (x) { return x !== t; });
                m.hidden = m.hidden.filter(function (x) { return x !== t; });
                delete m.colors[t]; delete m.icons[t];
                reopen();
            }
        }

        function bigRow(cls, html) { return $('<div class="lmx-be__big selector ' + (cls || '') + '"></div>').html(html); }
        function lookName() { var lk = ''; BTN_LOOKS.forEach(function (x) { if (x[0] === m.look) lk = x[1]; }); return lk; }
        var mk = bigRow('', '<div class="lmx-be__bi">' + BI('<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M12 11v5M9.5 13.5h5"/>') + '</div><div>Создать папку</div>');
        bind(mk, function () {
            ask('Название папки', 'Папка', function (v) {
                if (!v) return;
                m.folders.push({ id: 'F' + Date.now().toString(36), name: v, items: [] });
                bmSave(m);
                if (Lampa.Noty) Lampa.Noty.show('Папка создана. Добавьте в неё кнопки через ✎ → «Положить в папку»');
            });
        });
        var col = bigRow('', '<div class="lmx-be__bi">' + PALI + '</div><div>Цвет иконок</div>');
        bind(col, function () {
            pick('Цвет всех иконок', BTN_COLORS.map(function (c) { return { title: c[1], c: c[0] }; }), function (it) {
                m.color = it.c; save(); refreshAll();
            });
        });
        var look = bigRow('lmx-be__look', '<div><b></b><span class="lmx-ord__sub">Цифра рядом с кнопкой: 1 — компактная (иконка), 2 — чуть шире с подписью, 3 — с полной подписью. Первая кнопка всегда в стиле темы. Порядок: если «Показывать все кнопки» выключено — долгое нажатие на кнопку онлайн-плагина делает её первой; включено — стрелки здесь</span></div>');
        function lookText() { look.find('b').text('Вид кнопок:' + lookName()); }
        lookText();
        bind(look, function () {
            pick('Вид кнопок', BTN_LOOKS.map(function (x) { return { title: x[1], l: x[0] }; }), function (it) {
                m.look = it.l; save(); lookText();
            });
        });
        var allRow = bigRow('lmx-be__look', '<div><b></b><span class="lmx-ord__sub">Выводит в ряд и те кнопки, что Lampa прячет и показывает только в меню «Смотреть»</span></div>');
        function allText() { allRow.find('b').text('Показывать все кнопки:' + (getBool('lmx_btn_all', false) ? 'да' : 'нет')); }
        allText();
        bind(allRow, function () {
            var on = !getBool('lmx_btn_all', false);
            Lampa.Storage.set('lmx_btn_all', on ? 'true' : 'false');
            allText();
            if (!on) Lampa.Storage.set('lmx_btn_menu', []);
            function after(n) {
                if (on && Lampa.Noty) Lampa.Noty.show(n ? 'Добавлено кнопок из меню «Смотреть»:' + n : 'В меню «Смотреть» ничего не найдено');
                safe(function () { if (btnRun) btnRun(true); });
                reopen();
            }
            if (on && btnScanNow) btnScanNow(function (n) { after(n || menuGet().length); });
            else after(0);
        });
        top.append(mk, col, look, allRow);

        var reset = bigRow('lmx-be__reset', 'Сбросить по умолчанию');
        bind(reset, function () {
            m = { v: 2, order: [], hidden: [], colors: {}, icons: {}, names: {}, modes: {}, folders: [], color: '', look: '', first: m.first };
            Lampa.Storage.set('lmx_btn_menu', []);
            Lampa.Storage.set('lmx_btn_all', 'false');
            reopen();
        });
        var done = bigRow('lmx-be__save', 'СОХРАНИТЬ И ЗАКРЫТЬ');
        function close() {
            if (closed) return;
            closed = true;
            save();
            safe(function () { if (btnRun) btnRun(true); });
            var back = edPrev || enabled;
            edPrev = null;
            safe(function () { Lampa.Modal.close(); });
            safe(function () { Lampa.Controller.toggle(back); });
            var ensure = function () {
                safe(function () {
                    if (document.querySelector('.modal') || document.querySelector('.selectbox')) return;
                    var r = btnLast;
                    if (!r || !r.find) return;
                    if (document.querySelector('.selector.focus')) return;
                    var w = firstBtn(r);
                    if (w) focusBtn(r, w);
                });
            };
            [150, 450, 900, 1600].forEach(function (d) { setTimeout(ensure, d); });
            [80, 300].forEach(function (d) {
                setTimeout(function () {
                    safe(function () {
                        if (document.querySelector('.modal') || document.querySelector('.selectbox')) return;
                        Lampa.Controller.toggle(back === 'modal' ? 'content' : back);
                    });
                }, d);
            });
        }
        bind(done, close);
        bottom.append(reset, done);

        var toks = getBool('lmx_btn_all', false) ? btnTokens(m, ids) : btnTokensFixed(m, ids);
        toks.forEach(function (tk) { listEl.append(rowFor(tk)); });
        refreshAll();
        Lampa.Modal.open({ title: 'Порядок кнопок', html: wrap, size: 'medium', mask: true, onBack: close });
    }


    function initRowsWarm() {
        if (window.__lmxRW) return;
        window.__lmxRW = 1;
        var lastKey = Date.now(), tBoot = Date.now();
        ['keydown', 'mousedown', 'touchstart', 'wheel'].forEach(function (ev) { document.addEventListener(ev, function () { lastKey = Date.now(); }, true); });
        function pass() {
            if (!board() || isMobile() || document.hidden || Date.now() - lastKey < 1500 || Date.now() - tBoot < 20000) return;
            var act = document.querySelector('.activity--active');
            if (!act || !act.querySelector('.items-line')) return;
            var hl = act.querySelector('.items-line.lmx-hero-line'), h0 = hl && (hl.querySelector('.card--lmxhero.lmx-cur') || hl.querySelector('.card--lmxhero'));
            if (h0 && !hl.__lmxHW) { hl.__lmxHW = 1; try { heroTouch(h0, hl); } catch (x) {} }
            var all = act.querySelectorAll('.items-line:not(.lmx-hero-line) img'), list = [], i, im;
            for (i = 0; i < all.length && list.length < 40; i++) {
                im = all[i];
                if (!im.__lmxDec && im.decode && im.complete && im.naturalWidth > 0) list.push(im);
            }
            if (!list.length) return;
            var t0 = Date.now(), k = 0;
            (function next() {
                if (lastKey > t0 || document.hidden || k >= list.length) return;
                var e = list[k++];
                e.__lmxDec = 1;
                try { e.decode().then(function () {}, function () {}); } catch (x) {}
                setTimeout(next, 100);
            })();
        }
        var iv = setInterval(function () { safe(pass); }, 3000);
        if (iv && iv.unref) iv.unref();
    }

    function initThemeBtn() {
        if (!window.$) return;
        var NAMES = { prem: 'Кино', apple: 'Стекло', 'default': 'Облегчённая' };
        function ensure() {
            var box = $('.head__actions').eq(0);
            if (!box.length || box.find('.lmx-themebtn').length) return;
            var b = $('<div class="head__action selector lmx-themebtn" title="Тема"></div>').html(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 100 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H17a4 4 0 004-4c0-4.4-4-8.2-9-8.2z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/></svg>');
            b.on('hover:enter click', function () {
                var enabled = Lampa.Controller.enabled().name, cur = getStr('lmx_theme', 'default');
                Lampa.Select.show({
                    title: 'Тема',
                    items: Object.keys(NAMES).map(function (k) { return { title: NAMES[k], value: k, selected: k === cur }; }),
                    onSelect: function (it) {
                        Lampa.Storage.set('lmx_theme', it.value);
                        Lampa.Controller.toggle(enabled);
                        if (it.value !== cur) reloadApp();
                    },
                    onBack: function () { Lampa.Controller.toggle(enabled); }
                });
            });
            var st = box.find('.open--settings').eq(0);
            if (st.length) st.before(b); else box.append(b);
        }
        ensure();
        var n = 0, iv = setInterval(function () { ensure(); if (++n > 20) clearInterval(iv); }, 1500);
    }



    var neCache = null, neBusy = false;
    function neKey(e) { return e.season + ':' + e.episode; }
    function neCollect(cb) {
        if (!neCache) { var pc = jsonStore('lmx_ne_cache7', null); if (pc && pc.data && Date.now() - pc.t < 7200000) neCache = pc; }
        if (neCache && Date.now() - neCache.t < 7200000) return cb(neCache.data);
        if (neBusy) return cb(neCache ? neCache.data : []);
        var seen = {}, list = [];
        ['look', 'like', 'book', 'wath'].forEach(function (t) {
            var a = []; try { a = Lampa.Favorite.get({ type: t }) || []; } catch (e) {}
            a.forEach(function (c) {
                if (!c || !c.id || seen[c.id]) return;
                if (!(c.media_type === 'tv' || c.name || c.first_air_date || c.number_of_seasons)) return;
                seen[c.id] = 1; list.push(c);
            });
        });
        list = list.slice(0, 30);
        if (!list.length) { neCache = { t: Date.now(), data: [] }; return cb([]); }
        neBusy = true;
        var lo = dayStr(-7), hi = dayStr(0), out = [], qi = 0, left = list.length;
        function fin() {
            if (--left > 0) return;
            neBusy = false;
            out.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
            neCache = { t: Date.now(), data: out };
            safe(function () { Lampa.Storage.set('lmx_ne_cache7', neCache); });
            cb(out);
        }
        function pump() {
            if (qi >= list.length) return;
            var c = list[qi++];
            load(c.id, function (j) {
                var le = j && j.last_episode_to_air;
                if (le && le.air_date && le.air_date >= lo && le.air_date <= hi) {
                    out.push({ id: j.id, name: j.name || c.name, poster: j.poster_path, backdrop: j.backdrop_path, season: le.season_number, episode: le.episode_number, epname: le.name || '', date: le.air_date,
                        card: { id: j.id, name: j.name, original_name: j.original_name, poster_path: j.poster_path, backdrop_path: j.backdrop_path, overview: j.overview, vote_average: j.vote_average, first_air_date: j.first_air_date, original_language: j.original_language, number_of_seasons: j.number_of_seasons, seasons: (j.seasons || []).map(function (x) { return { season_number: x.season_number, episode_count: x.episode_count }; }), media_type: 'tv', source: 'tmdb' } });
                }
                fin(); pump();
            });
        }
        for (var k = 0; k < 2; k++) pump();
    }
    function neWatched(e) {
        try {
            var w = watchProgress(e.card);
            if (!w || !w.s) return false;
            if (w.s > e.season) return true;
            if (w.s === e.season) return w.e > e.episode || (w.e === e.episode && w.pct >= 85);
        } catch (x) {}
        return false;
    }
    function neUnseen(arr) {
        var seen = jsonStore('lmx_ne_seen', {});
        return arr.filter(function (e) { return seen[e.id] !== neKey(e); });
    }
    function neAgo(d) {
        var n = dayDiff(d);
        if (n === null) return '';
        n = -n;
        if (n <= 0) return 'сегодня';
        if (n === 1) return 'вчера';
        return n + ' ' + plural(n, 'день', 'дня', 'дней') + ' назад';
    }
    function initNewEpBell() {
        if (!window.$) return;
        if (!document.getElementById('lmx-ne-css')) {
            var st = document.createElement('style'); st.id = 'lmx-ne-css';
            st.textContent = '.lmx-nebell{position:relative}body.lmx-bell-off .lmx-nebell{display:none !important}.lmx-nebadge{position:absolute;right:-.15em;top:-.15em;min-width:1.25em;height:1.25em;padding:0 .3em;border-radius:1em;font-size:.62em;font-weight:700;line-height:1.25em;text-align:center;color:#fff;display:none}' +
                '.lmx-nebell.lmx-has .lmx-nebadge{display:block}' +
                '.lmx-nedd{position:fixed;z-index:9999;width:29em;max-width:92vw;max-height:70vh;overflow:hidden auto;background:#1c1f27;border:1px solid rgba(255,255,255,.1);border-radius:.9em;box-shadow:0 1em 3em rgba(0,0,0,.65);color:#fff;font-size:1em}' +
                'body.lmx-apple .lmx-nedd{background:rgba(255,255,255,.12);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-color:rgba(255,255,255,.22);border-radius:1.3em}' +
                '.lmx-nedd__h{text-transform:uppercase;display:flex;justify-content:space-between;padding:.9em 1.1em .7em;font-size:.8em;font-weight:800;letter-spacing:.14em;border-bottom:1px solid rgba(255,255,255,.1)}.lmx-nedd__h span{opacity:.55;font-weight:500;letter-spacing:0}' +
                '.lmx-ne{position:relative;display:block;height:7.2em;margin:.5em .6em;border-radius:.7em;overflow:hidden;background:#2a2d36 center/cover no-repeat}' +
                '.lmx-ne::before{content:"";position:absolute;left:0;top:0;right:0;bottom:0;background:linear-gradient(90deg,rgba(0,0,0,.85),rgba(0,0,0,.1) 85%)}' +
                '.lmx-ne.focus,.lmx-ne.hover{box-shadow:0 0 0 .22em #fff}' +
                '.lmx-ne__x{position:absolute;left:1em;bottom:.8em;right:1em}.lmx-ne__t{font-size:1.1em;font-weight:700;text-shadow:0 1px 6px rgba(0,0,0,.6)}.lmx-ne__s{font-size:.88em;margin-top:.25em;text-shadow:0 1px 6px rgba(0,0,0,.6)}.lmx-ne__s b{font-weight:700}' +
                '.lmx-ne__n{position:absolute;right:.7em;top:.7em;font-size:.6em;font-weight:800;letter-spacing:.08em;padding:.35em .7em;border-radius:.4em;color:#fff}' +
                'body.lmx-prem .lmx-nedd{background:rgba(14,15,24,.97);border:1px solid rgba(255,255,255,.08);border-radius:1.2em;box-shadow:0 1em 3em rgba(0,0,0,.7);padding-bottom:.3em}' +
                'body.lmx-prem .lmx-nedd__h{text-transform:none;letter-spacing:0;font-size:1.05em;font-weight:800;border-bottom:0;padding:1em 1.2em .5em}body.lmx-prem .lmx-nedd__h span{font-size:.8em}' +
                'body.lmx-prem .lmx-ne{border-radius:1em;background-color:#12131f}' +
                'body.lmx-prem .lmx-ne.focus,body.lmx-prem .lmx-ne.hover{box-shadow:0 0 0 .12em rgba(255,255,255,.6),0 .5em 1em rgba(0,0,0,.6)}' +
                'body.lmx-prem .lmx-ne__n{background:#fff;color:#000;border-radius:99em;padding:.35em .9em}body.lmx-prem .lmx-ne__s b{color:#fff}body.lmx-prem .lmx-nebadge{background:#fff;color:#000}' +
                'body.lmx-apple .lmx-nedd{border-radius:1.4em}body.lmx-apple .lmx-ne{border-radius:1.1em;margin:.5em .7em}' +
                'body.lmx-apple .lmx-ne.focus,body.lmx-apple .lmx-ne.hover{box-shadow:0 0 0 .18em rgba(255,255,255,.9),0 0 1.4em rgba(255,255,255,.28)}' +
                'body.lmx-apple .lmx-ne__n{background:rgba(255,255,255,.24);border:1px solid rgba(255,255,255,.3);border-radius:1em;padding:.35em .9em}' +
                'body.lmx-apple .lmx-ne__s b{color:#fff}body.lmx-apple .lmx-nebadge{background:rgba(255,255,255,.92);color:#000}';
            document.head.appendChild(st);
        }
        function syncMode() {
            safe(function () { document.body.classList.toggle('lmx-bell-off', String(Lampa.Storage.get('lmx_bell_mode', 'lmx') || 'lmx') !== 'lmx'); });
        }
        syncMode();
        safe(function () { Lampa.Storage.listener.follow('change', function (e) { if (e && e.name === 'lmx_bell_mode') syncMode(); }); });
        function color() {
            var bc = document.body.classList;
            if (bc.contains('lmx-prem') || bc.contains('lmx-apple')) return '';
            return 'rgb(' + (RGB[getStr('lmx_c_next', 'orange')] || RGB.orange) + ')';
        }
        function badge(n) {
            var b = $('.lmx-nebell');
            b.toggleClass('lmx-has', n > 0);
            b.find('.lmx-nebadge').text(n > 9 ? '9+' : String(n)).css('background', color());
        }
        function refresh() { safe(function () { neCollect(function (arr) { badge(neUnseen(arr.filter(function (e) { return !neWatched(e); })).length); }); }); }
        var dd = null;
        function closeDD(back, dir) {
            if (!dd) return;
            dd.remove(); dd = null;
            if (back) { try { Lampa.Controller.toggle(back); } catch (e) {} }
            if (dir && back === 'head') { try { Lampa.Controller.move(dir); } catch (e) {} }
        }
        var lastOpen = 0, ddBack = null;
        function open() {
            var tn = Date.now();
            if (tn - lastOpen < 600) return;
            lastOpen = tn;
            if (dd) return closeDD(Lampa.Controller.enabled().name === 'lmx_ne' ? 'content' : null);
            var enabled = Lampa.Controller.enabled().name;
            ddBack = enabled;
            neCollect(function (arr0) {
                var arr = arr0.filter(function (e) { return !neWatched(e); });
                var seen = jsonStore('lmx_ne_seen', {}), fresh = {}, nFresh = 0;
                arr.forEach(function (e) { fresh[e.id] = seen[e.id] !== neKey(e); if (fresh[e.id]) nFresh++; });
                if (!arr.length) { if (Lampa.Noty) Lampa.Noty.show('Новых серий за последнюю неделю нет'); return; }
                var c = color();
                dd = $('<div class="lmx-nedd"></div>');
                dd.append($('<div class="lmx-nedd__h">Новые серии</div>').append($('<span></span>').text(nFresh ? nFresh + ' ' + plural(nFresh, 'непросмотренная', 'непросмотренные', 'непросмотренных') : 'всё просмотрено')));
                var els = [];
                arr.forEach(function (e) {
                    var el = $('<div class="selector lmx-ne"></div>');
                    var bg = e.backdrop ? imgUrl(e.backdrop, 'w780') : (e.poster ? imgUrl(e.poster, 'w500') : '');
                    if (bg) el.css('background-image', 'url(' + bg + ')');
                    if (fresh[e.id]) el.append($('<div class="lmx-ne__n">НОВАЯ</div>').css('background', c));
                    var tx = $('<div class="lmx-ne__x"></div>');
                    tx.append($('<div class="lmx-ne__t"></div>').text(e.name));
                    tx.append($('<div class="lmx-ne__s"></div>').append($('<b></b>').css('color', c).text('S' + e.season + ' E' + e.episode)).append(document.createTextNode((e.epname ? ' · ' + e.epname : '') + ' · ' + neAgo(e.date))));
                    el.append(tx);
                    el.on('hover:enter click', function () {
                        closeDD();
                        Lampa.Activity.push({ url: '', component: 'full', id: e.id, method: 'tv', card: e.card, source: 'tmdb' });
                    });
                    dd.append(el); els.push(el[0]);
                });
                var br = $('.lmx-nebell')[0].getBoundingClientRect();
                if (window.innerWidth <= 760) dd.css({ top: Math.round(br.bottom + 8) + 'px', left: '8px', right: '8px', width: 'auto', maxWidth: 'none', maxHeight: Math.round(window.innerHeight - br.bottom - 24) + 'px' });
                else dd.css({ top: Math.round(br.bottom + 10) + 'px', right: Math.max(8, Math.round(window.innerWidth - br.right - 20)) + 'px' });
                $('body').append(dd);
                arr.forEach(function (e) { seen[e.id] = neKey(e); });
                Lampa.Storage.set('lmx_ne_seen', seen);
                badge(0);
                var idx = 0;
                function foc(i) {
                    idx = Math.max(0, Math.min(els.length - 1, i));
                    try { Lampa.Controller.collectionFocus(els[idx], dd); } catch (e) {}
                    $(els).removeClass('focus'); $(els[idx]).addClass('focus');
                    try { els[idx].scrollIntoView({ block: 'nearest' }); } catch (e) {}
                }
                Lampa.Controller.add('lmx_ne', {
                    toggle: function () { Lampa.Controller.collectionSet(dd); foc(idx); },
                    up: function () { foc(idx - 1); },
                    down: function () { foc(idx + 1); },
                    left: function () { closeDD(enabled, 'left'); },
                    right: function () { closeDD(enabled, 'right'); },
                    back: function () { closeDD(enabled); }
                });
                Lampa.Controller.toggle('lmx_ne');
            });
        }
        function ensure() {
            var box = $('.head__actions').eq(0);
            if (!box.length || box.find('.lmx-nebell').length) return;
            var b = $('<div class="head__action selector lmx-nebell" title="Новые серии"></div>').html(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg><span class="lmx-nebadge"></span>');
            b.on('hover:enter click', open);
            b.on('hover:focus', function () { neWarm(); });
            var th = box.find('.lmx-themebtn').eq(0);
            if (th.length) th.after(b); else { var se = box.find('.open--settings').eq(0); if (se.length) se.before(b); else box.append(b); }
            safe(function () { var pc = neCache || jsonStore('lmx_ne_cache7', null); if (pc && pc.data && Date.now() - pc.t < 7200000) refresh(); });
        }
        ensure();
        var n = 0, iv = setInterval(function () { ensure(); if (++n > 20) clearInterval(iv); }, 1500);
        document.addEventListener('click', function (ev) {
            if (!dd || Date.now() - lastOpen < 600) return;
            var t = ev.target;
            if (t && t.closest && (t.closest('.lmx-nedd') || t.closest('.lmx-nebell'))) return;
            closeDD(ddBack);
        }, true);
        function neWarm() { if (neWarm.t) return; neWarm.t = setTimeout(function () { neWarm.t = 0; if (!document.hidden) refresh(); }, 100); }
        setTimeout(refresh, 45000);
        setInterval(refresh, 30 * 60000);
        
    }

    function initBtnRowsNav() {
        if (!window.$) return;
        document.addEventListener('keydown', function (ev) {
            var k = ev.keyCode;
            if (k !== 40 && k !== 38) return;
            safe(function () {
                var cur = document.querySelector('.full-start-new__buttons .full-start__button.focus, .full-start__buttons .full-start__button.focus');
                if (!cur) return;
                var cont = cur.parentNode, cr = cur.getBoundingClientRect(), cx = cr.left + cr.width / 2;
                var all = [].slice.call(cont.children).filter(function (e) {
                    return e !== cur && e.classList.contains('selector') && e.offsetWidth > 0 && e.getBoundingClientRect().height > 0;
                });
                var cand = all.filter(function (e) {
                    var r = e.getBoundingClientRect();
                    return k === 40 ? r.top > cr.bottom - cr.height / 2 : r.bottom < cr.top + cr.height / 2;
                });
                if (!cand.length) return;
                var rowY = cand.reduce(function (a, e) {
                    var t = e.getBoundingClientRect().top;
                    return a === null || (k === 40 ? t < a : t > a) ? t : a;
                }, null);
                var row = cand.filter(function (e) { return Math.abs(e.getBoundingClientRect().top - rowY) < cr.height / 2; });
                var overlap = row.some(function (e) { var r = e.getBoundingClientRect(); return r.left < cr.right - 2 && r.right > cr.left + 2; });
                if (overlap) return;
                var best = null, bd = 1e9;
                row.forEach(function (e) {
                    var r = e.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - cx);
                    if (d < bd) { bd = d; best = e; }
                });
                if (!best) return;
                ev.preventDefault(); ev.stopPropagation();
                var done = false;
                try { Lampa.Controller.collectionFocus(best, $(cont).closest('.scroll')[0] || cont.parentNode); done = best.classList.contains('focus'); } catch (e) {}
                if (!done) { $(cur).removeClass('focus'); $(best).addClass('focus').trigger('hover:focus'); }
            });
        }, true);
    }

    var PERF = [
        { key: 'background_type', want: 'simple', bad: function (v) { return v === 'complex'; }, name: 'Тип фона', now: function (v) { return v === 'complex' ? 'Комплексный' : v; }, to: 'Простой' },
        { key: 'glass_style', want: 'false', bad: function (v) { return v === true || v === 'true'; }, name: 'Стеклянный стиль', now: function () { return 'включено'; }, to: 'выключить' },
        { key: 'advanced_animation', want: 'false', bad: function (v) { return v === true || v === 'true'; }, name: 'Продвинутая анимация', now: function () { return 'включено'; }, to: 'выключить' },
        { key: 'animation', want: 'true', bad: function (v) { return v === false || v === 'false'; }, name: 'Анимация', now: function () { return 'выключено (ломает плавную прокрутку)'; }, to: 'включить' },
        { key: 'scroll_type', want: 'css', bad: function (v) { return v === 'js'; }, name: 'Тип прокрутки', now: function () { return 'Javascript'; }, to: 'CSS' },
        { key: 'light_version', want: 'false', bad: function (v) { return v === true || v === 'true'; }, name: 'Лёгкая версия', now: function () { return 'включено (упрощает вид и конфликтует с темами)'; }, to: 'выключить' }
    ];
    function perfFind() {
        var out = [];
        PERF.forEach(function (x) {
            var v;
            try { v = Lampa.Storage.field(x.key); } catch (e) { return; }
            if (v === undefined || v === null) return;
            if (x.bad(v)) out.push(x);
        });
        return out;
    }
    function perfCheck() {
        var list = perfFind();
        if (!list.length) { if (Lampa.Noty) Lampa.Noty.show('Настройки Lampa в порядке: ничего, что нагружает ТВ'); return; }
        var enabled = Lampa.Controller.enabled().name;
        var items = [{ title: 'Исправить всё (' + list.length + ')', all: true }].concat(list.map(function (x) {
            return { title: x.name + ': ' + x.now(Lampa.Storage.field(x.key)), subtitle: 'Рекомендуется:' + x.to, key: x.key };
        }));
        Lampa.Select.show({
            title: 'Настройки Lampa',
            items: items,
            onSelect: function (a) {
                var todo = a.all ? list : list.filter(function (x) { return x.key === a.key; });
                todo.forEach(function (x) { try { Lampa.Storage.set(x.key, x.want); } catch (e) {} });
                if (Lampa.Noty) Lampa.Noty.show('Изменено:' + todo.length + '. Некоторые изменения действуют после перезапуска Lampa');
                Lampa.Controller.toggle(enabled);
                setTimeout(function () { safe(applyStyle); }, 100);
            },
            onBack: function () { Lampa.Controller.toggle(enabled); }
        });
    }

    function patchBackground() {
        var B = window.Lampa && Lampa.Background;
        if (!B || B.__lmxP) return;
        var bgT = 0, bgHid = false;
        ['change', 'immediately'].forEach(function (m) {
            var orig = B[m];
            if (typeof orig !== 'function') return;
            B[m] = function () {
                try {
                    var tn = Date.now();
                    if (tn - bgT > 2000) {
                        bgT = tn;
                        var el = document.querySelector('.background');
                        bgHid = !!el && window.getComputedStyle(el).display === 'none';
                    }
                    if (bgHid) return;
                } catch (e) {}
                return orig.apply(this, arguments);
            };
        });
        B.__lmxP = true;
    }

    function initCinema() {
        var V = Lampa.PlayerVideo;
        if (!V || !V.listener || !V.listener.follow || window.__lmxCin) return;
        window.__lmxCin = true;
        var tm = 0, shown = false, watching = false, box = null;
        function build() {
            if (box) return box;
            box = document.createElement('div');
            box.id = 'lmx-cinema';
            box.innerHTML = '<img class="lmx-cin-p" alt=""><div class="lmx-cin-b"><div class="lmx-cin-k">Пауза</div><div class="lmx-cin-t"></div><div class="lmx-cin-m"></div><div class="lmx-cin-d"></div></div>';
            document.body.appendChild(box);
            return box;
        }
        function fill() {
            var c = null, wd = null;
            try { var a = Lampa.Activity.active(); c = a && a.card; } catch (e) {}
            try { wd = Lampa.Player.playdata && Lampa.Player.playdata(); } catch (e) {}
            var b = build(), img = b.querySelector('.lmx-cin-p');
            var title = (c && (c.title || c.name)) || (wd && wd.title) || '';
            var year = c ? String(c.release_date || c.first_air_date || '').slice(0, 4) : '';
            var v = c ? Number(c.vote_average) || 0 : 0;
            b.querySelector('.lmx-cin-t').textContent = title;
            b.querySelector('.lmx-cin-m').textContent = [year, v ? '\u2605 ' + v.toFixed(1) : ''].filter(Boolean).join('  \u00b7  ');
            b.querySelector('.lmx-cin-d').textContent = c && c.overview ? String(c.overview) : '';
            var pp = c && (c.poster_path || '');
            if (pp) { var u = imgUrl(pp, 'w342'); if (img.getAttribute('src') !== u) img.src = u; img.style.display = ''; } else img.style.display = 'none';
        }
        function bump() { if (!watching) return; clearTimeout(tm); if (shown) hide(); tm = setTimeout(show, 8000); }
        function show() { tm = 0; if (shown) return; safe(fill); shown = true; document.body.classList.add('lmx-cinema'); }
        function hide() { shown = false; document.body.classList.remove('lmx-cinema'); }
        function stop() {
            clearTimeout(tm); tm = 0; hide();
            if (watching) { watching = false; document.removeEventListener('keydown', bump, true); document.removeEventListener('click', bump, true); }
        }
        V.listener.follow('pause', function () {
            if (watching) return;
            watching = true;
            tm = setTimeout(show, 8000);
            document.addEventListener('keydown', bump, true);
            document.addEventListener('click', bump, true);
        });
        V.listener.follow('play', stop);
        V.listener.follow('ended', stop);
        try { Lampa.Player.listener.follow('destroy', stop); } catch (e) {}
    }

    var VERSION = '10.599';
    try { if (window.Lampa && Lampa.Manifest) Lampa.Manifest.plugins = { type: 'other', version: String(VERSION), name: 'LMX Pack', description: 'Главная, карточки, страница тайтла и оформление Lampa в одном плагине', author: 'Irfnekf' }; } catch (e) {}
    safe(function () {
        if (String(Lampa.Storage.get('lmx_ver', '') || '') !== VERSION) Lampa.Storage.set('lmx_ver', VERSION);
    });
    safe(function () {
        if (Lampa.Storage.get('lmx_mask_off', '') === true || Lampa.Storage.get('lmx_mask_off', '') === 'true') return;
        Lampa.Storage.set('lmx_mask_off', true);
        if (Lampa.Storage.field('mask')) {
            Lampa.Storage.set('mask', false);
            if (document.body) document.body.classList.add('no--mask');
        }
    });
    safe(function () {
        if (!Lampa.Listener || window.__lmxMoreFix) return;
        window.__lmxMoreFix = 1;
        var lines = [];
        Lampa.Listener.follow('line', function (e) {
            if (e && e.type === 'visible' && e.line && e.data && lines.indexOf(e.line) < 0) { e.line.__lmxD = e.data; lines.push(e.line); if (lines.length > 200) lines.shift(); }
        });
        function fill(it) {
            var d = it.__lmxD;
            if (!d || it.__lmxFilled || d.nomore || !d.results || d.results.length >= 20 || d.results.length < 2 || typeof it.more !== 'function' || typeof it.attach !== 'function') return;
            var root = it.render && it.render(true);
            if (!root || !root.querySelector || !root.querySelector('.items-line__more')) return;
            it.__lmxFilled = true;
            if (root.querySelector('.card-more')) return;
            d.results.forEach(function (x) { it.append(x); });
            if (!root.querySelector('.card-more')) { var m = it.more(); try { if (Lampa.Controller.own(it)) Lampa.Controller.collectionAppend(m); } catch (er) {} }
        }
        var last = null;
        setInterval(function () {
            safe(function () {
                var fo = document.querySelector('.items-line .focus'), fl = fo && fo.closest('.items-line');
                if (!fl || fl === last) return;
                last = fl;
                lines = lines.filter(function (it) { return it.render && document.body.contains(it.render(true)); });
                lines.forEach(function (it) { if (it.render(true) === fl) fill(it); });
            });
        }, 300);
    });

    safe(patchContentRows);

    safe(function () {
        var U = Lampa.Utils;
        if (!U || !U.hash || U.__lmxHash) return;
        var orig = U.hash;
        U.__lmxHash = 1;
        U.hash = function (str) {
            try {
                if (typeof str === 'string' && str.indexOf('full-start__button') >= 0 && /^\s*<(div|a|button)\b/.test(str)) {
                    var m = /^\s*<[a-z]+[^>]*?\sclass="([^"]*)"/.exec(str);
                    if (m) {
                        var cl = m[1].split(/\s+/).filter(function (c) { return c && !/^(lmx-|focus$|button--priority$|hide$|selector$)/.test(c); }).sort().join(' ');
                        return orig.call(U, 'lmxbtn:' + cl);
                    }
                }
            } catch (e) {}
            return orig.apply(U, arguments);
        };
    });

    var LANG_UA = { en: 'Английский', uk: 'Украинский', ko: 'Корейский', ja: 'Японский', fr: 'Французский', de: 'Немецкий', es: 'Испанский', it: 'Итальянский', tr: 'Турецкий', ru: 'Русский', pl: 'Польский', sv: 'Шведский', da: 'Датский', no: 'Норвежский', hi: 'Хинди', zh: 'Китайский', cn: 'Китайский' };
    function statsData() {
        var d = { movies: 0, tv: 0, hours: 0, genres: {}, decades: {}, langs: {}, vote: 0, voteN: 0, like: 0, later: 0, seen: 0, total: 0 };
        var hist = [];
        try { hist = Lampa.Favorite.get({ type: 'history' }) || []; } catch (e) {}
        hist = hist.filter(function (c) { return c && c.id; });
        d.total = hist.length;
        hist.forEach(function (c) {
            if (typeOf(c) === 'tv') d.tv++; else d.movies++;
            var seenG = {};
            genreIds(c).forEach(function (g) { var n = GENRES[g]; if (n && !seenG[n]) { seenG[n] = 1; d.genres[n] = (d.genres[n] || 0) + 1; } });
            var y = parseInt(String(c.release_date || c.first_air_date || '').slice(0, 4), 10);
            if (y > 1900) { var dec = Math.floor(y / 10) * 10 + '-е'; d.decades[dec] = (d.decades[dec] || 0) + 1; }
            if (c.original_language) { var ln = LANG_UA[c.original_language] || String(c.original_language).toUpperCase(); d.langs[ln] = (d.langs[ln] || 0) + 1; }
            if (c.vote_average > 0) { d.vote += Number(c.vote_average); d.voteN++; }
        });
        try { d.like = (Lampa.Favorite.get({ type: 'like' }) || []).length; } catch (e) {}
        try { d.later = (Lampa.Favorite.get({ type: 'wath' }) || []).length; } catch (e) {}
        try { d.seen = (Lampa.Favorite.get({ type: 'viewed' }) || []).length; } catch (e) {}
        var fv = fileViews(), sec = 0;
        if (fv) for (var k in fv) { var t = fv[k] && Number(fv[k].time); if (t > 0 && t < 36000) sec += t; }
        d.hours = Math.round(sec / 360) / 10;
        return d;
    }
    function statsTop(o, n) {
        return Object.keys(o).map(function (k) { return [k, o[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, n);
    }
    function statsCss() {
        if (document.getElementById('lmx-stats-css')) return;
        var st = document.createElement('style'); st.id = 'lmx-stats-css';
        st.textContent = 'body{--lmx-sa:#fff}body.lmx-prem{--lmx-sa:#e9a24a}body.lmx-apple{--lmx-sa:#8ec5ff}' +
            '.lmx-st{padding:1.4em 2em 3em;box-sizing:border-box}' +
            '.lmx-st__h{font-size:2em;font-weight:700;margin:0 0 .8em;letter-spacing:.01em}' +
            '.lmx-st__hero{display:flex;align-items:baseline;gap:.5em;padding:1em 1.3em;border-radius:1.1em;background:rgba(255,255,255,.07);margin-bottom:1em}' +
            '.lmx-st__big{font-size:3.6em;font-weight:800;line-height:1;color:var(--lmx-sa)}' +
            '.lmx-st__cap{font-size:1.1em;opacity:.7}' +
            '.lmx-st__tiles{display:flex;flex-wrap:wrap;gap:.8em;margin-bottom:1em}' +
            '.lmx-st__tile{flex:1 1 9em;min-width:9em;padding:.9em 1.1em;border-radius:1em;background:rgba(255,255,255,.07)}' +
            '.lmx-st__tile b{display:block;font-size:2em;font-weight:700;color:var(--lmx-sa)}' +
            '.lmx-st__tile span{font-size:.95em;opacity:.7}' +
            '.lmx-st__card{padding:1em 1.3em;border-radius:1.1em;background:rgba(255,255,255,.07);margin-bottom:1em}' +
            '.lmx-st__card h3{margin:0 0 .7em;font-size:1.15em;font-weight:600;opacity:.85}' +
            '.lmx-st__row{display:flex;align-items:center;gap:.8em;margin:.35em 0}' +
            '.lmx-st__row i{font-style:normal;flex:0 0 9em;font-size:.98em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            '.lmx-st__bar{flex:1;height:.55em;border-radius:99em;background:rgba(255,255,255,.12);overflow:hidden}' +
            '.lmx-st__bar u{display:block;height:100%;border-radius:99em;background:var(--lmx-sa);text-decoration:none}' +
            '.lmx-st__row em{flex:0 0 2.6em;text-align:right;font-style:normal;opacity:.7;font-size:.95em}' +
            '.lmx-st .selector.focus{background:rgba(255,255,255,.2);box-shadow:0 0 0 .14em var(--lmx-sa)}' +
            '.lmx-st__empty{padding:3em 1em;text-align:center;opacity:.7;font-size:1.2em}';
        (document.head || document.documentElement).appendChild(st);
    }
    function statsBars(title, list) {
        if (!list.length) return '';
        var mx = list[0][1] || 1;
        return '<div class="lmx-st__card selector"><h3>' + title + '</h3>' + list.map(function (x) {
            return '<div class="lmx-st__row"><i>' + x[0] + '</i><div class="lmx-st__bar"><u style="width:' + Math.max(4, Math.round(x[1] / mx * 100)) + '%"></u></div><em>' + x[1] + '</em></div>';
        }).join('') + '</div>';
    }
    function statsHtml() {
        var d = statsData();
        if (!d.total && !d.hours) return '<div class="lmx-st"><div class="lmx-st__h">Статистика</div><div class="lmx-st__empty">История пуста — посмотрите что-нибудь, и здесь появится ваша статистика</div></div>';
        var days = d.hours >= 24 ? ' (' + (Math.round(d.hours / 2.4) / 10) + ' суток)' : '';
        var avg = d.voteN ? (Math.round(d.vote / d.voteN * 10) / 10) : 0;
        return '<div class="lmx-st"><div class="lmx-st__h">Статистика</div>' +
            '<div class="lmx-st__hero selector"><span class="lmx-st__big">' + d.hours + '</span><span class="lmx-st__cap">часов просмотра' + days + '</span></div>' +
            '<div class="lmx-st__tiles">' +
            '<div class="lmx-st__tile selector"><b>' + d.movies + '</b><span>Фильмов в истории</span></div>' +
            '<div class="lmx-st__tile selector"><b>' + d.tv + '</b><span>Сериалов в истории</span></div>' +
            '<div class="lmx-st__tile selector"><b>' + d.seen + '</b><span>Просмотрено</span></div>' +
            '<div class="lmx-st__tile selector"><b>' + d.like + '</b><span>Нравится</span></div>' +
            '<div class="lmx-st__tile selector"><b>' + d.later + '</b><span>Посмотреть позже</span></div>' +
            (avg ? '<div class="lmx-st__tile selector"><b>' + avg + '</b><span>Средняя оценка</span></div>' : '') +
            '</div>' +
            statsBars('Любимые жанры', statsTop(d.genres, 6)) +
            statsBars('Язык оригинала', statsTop(d.langs, 4)) +
            statsBars('По годам выхода', statsTop(d.decades, 5).sort(function (a, b) { return parseInt(a[0], 10) - parseInt(b[0], 10); })) + '</div>';
    }
    var statsRegistered = false;
    function registerStats() {
        if (statsRegistered || !Lampa.Component || !Lampa.Component.add || !Lampa.Scroll) return;
        statsRegistered = true;
        Lampa.Component.add('lmx_stats', function (object) {
            var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 }), html = $('<div></div>'), last;
            this.create = function () {
                statsCss();
                html.append(statsHtml());
                html.find('.selector').on('hover:focus', function () { last = this; scroll.update($(this), true); });
                scroll.minus();
                scroll.append(html);
                this.activity.loader(false);
                this.activity.toggle();
            };
            this.start = function () {
                if (Lampa.Activity.active().activity !== this.activity) return;
                Lampa.Controller.add('content', {
                    toggle: function () { Lampa.Controller.collectionSet(scroll.render()); Lampa.Controller.collectionFocus(last || false, scroll.render()); },
                    up: function () { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                    down: function () { if (Navigator.canmove('down')) Navigator.move('down'); },
                    left: function () { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                    right: function () { if (Navigator.canmove('right')) Navigator.move('right'); },
                    back: function () { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            };
            this.pause = function () {};
            this.stop = function () {};
            this.render = function () { return scroll.render(); };
            this.destroy = function () { try { scroll.destroy(); } catch (e) {} html.remove(); };
        });
    }
    function statsMenu() {
        if (!getBool('lmx_stats_menu', true) || !Lampa.Menu || !Lampa.Menu.addButton || document.querySelector('.menu__item.lmx-statsmenu')) return;
        var ico = '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>';
        var el = Lampa.Menu.addButton(ico, 'Статистика', function () {
            registerStats();
            Lampa.Activity.push({ url: '', title: 'Статистика', component: 'lmx_stats', page: 1 });
        });
        if (el && el[0]) el[0].classList.add('lmx-statsmenu');
    }

    var TR_TYPE = { 'Trailer': 0, 'Teaser': 1, 'Clip': 2, 'Featurette': 3, 'Behind the Scenes': 4 };
    var TR_NAME = { 'Trailer': 'Трейлер', 'Teaser': 'Тизер', 'Clip': 'Отрывок', 'Featurette': 'О фильме', 'Behind the Scenes': 'За кадром' };
    function trShape(x) { return { title: x.title, url: x.url, id: x.key, youtube: x.youtube, thumbnail: x.img, icon: '<img class="size-youtube" src="' + x.img + '" />', template: 'selectbox_icon' }; }
    function trPlay(a, all) {
        try {
            if (Lampa.Platform && Lampa.Platform.is('android') && Lampa.Storage.field('player_launch_trailers') === 'youtube' && a.youtube && Lampa.Android && Lampa.Android.openYoutube) { Lampa.Android.openYoutube(a.key); return; }
        } catch (e) {}
        Lampa.Player.play(trShape(a));
        Lampa.Player.playlist(all.map(trShape));
    }
    function trCache() { try { return JSON.parse(localStorage.getItem('lmx_trl_ok') || '{}') || {}; } catch (e) { return {}; } }
    function trSave(c) { try { var k = Object.keys(c); if (k.length > 600) k.slice(0, 200).forEach(function (n) { delete c[n]; }); localStorage.setItem('lmx_trl_ok', JSON.stringify(c)); } catch (e) {} }
    function trThumb(key) { return 'https://img.youtube.com/vi/' + key + '/mqdefault.jpg'; }
    function trProbe(keys) {
        var c = trCache(), todo = keys.filter(function (k) { return !(k in c); });
        todo.forEach(function (k) {
            var im = new Image();
            im.onload = function () { var cc = trCache(); cc[k] = (im.naturalWidth > 130 && im.naturalHeight > 90) ? 1 : 0; trSave(cc); };
            im.onerror = function () { var cc = trCache(); cc[k] = 0; trSave(cc); };
            im.src = trThumb(k);
        });
    }
    function trPrune(root) {
        var c = trCache(), left = 0;
        root.find('.full-person').each(function () {
            var im = this.querySelector('img'), m = im && /\/vi\/([^/]+)\//.exec(im.getAttribute('src') || im.src || '');
            if (m && c[m[1]] === 0 && !this.classList.contains('focus')) window.$(this).remove(); else left++;
        });
        if (!left) root.addClass('hide');
    }
    function fullTrailers(data) {
        var v = data && data.videos && data.videos.results;
        if (!v || !v.length) return null;
        var lang = '', seen = {}, list = [];
        try { lang = String(Lampa.Storage.field('tmdb_lang') || 'ru'); } catch (e) {}
        var pick = function (l) { return v.filter(function (x) { return x && x.key && x.iso_639_1 === l; }); };
        var only = pick('ru'); if (!only.length) only = pick('en');
        if (!only.length) return null;
        v = only;
        v.forEach(function (x) {
            if (!x || !x.key || seen[x.key]) return;
            if (x.site && x.site !== 'YouTube' && !x.url) return;
            seen[x.key] = 1; list.push(x);
        });
        var tc = trCache();
        list = list.filter(function (x) { return tc[x.key] !== 0; });
        if (!list.length) return null;
        safe(function () { trProbe(list.map(function (x) { return x.key; })); });
        list.forEach(function (x) { x._k = (x.iso_639_1 === lang ? 0 : 1) * 100 + (TR_TYPE[x.type] !== undefined ? TR_TYPE[x.type] : 5) * 10 + (x.official ? 0 : 1); });
        list.sort(function (a, b) { return (a._k - b._k) || String(b.published_at || '').localeCompare(String(a.published_at || '')); });
        var items = list.slice(0, 6).map(function (x) {
            var tag = x.iso_639_1 ? (x.iso_639_1 === 'ru' ? 'RU' : String(x.iso_639_1).toUpperCase()) : '';
            var nm = String(x.name || TR_NAME[x.type] || 'Трейлер');
            return { id: x.key, key: x.key, title: nm, name: nm.length > 46 ? nm.slice(0, 45) + '…' : nm, job: (tag ? tag + ' · ' : '') + (TR_NAME[x.type] || 'Видео'),
                img: x.icon || 'https://img.youtube.com/vi/' + x.key + '/mqdefault.jpg', url: x.url || 'https://www.youtube.com/watch?v=' + x.key, youtube: typeof x.youtube !== 'undefined' ? x.youtube : true };
        });
        items.forEach(function (it) { it.params = { emit: { onEnter: function () { safe(function () { trPlay(it, items); }); } } }; });
        return items;
    }
    function fullPeople(data) {
        var P = data && data.persons;
        if (!P || !P.cast || !P.cast.length || !P.crew || !P.crew.length) return;
        var dirs = P.crew.filter(function (m) { return m && m.job === 'Director'; });
        if (!dirs.length) return;
        var seen = {}, head = [], role = 'Режиссёр';
        try { role = Lampa.Lang.translate('title_producer') || role; } catch (e) {}
        dirs.forEach(function (d) {
            if (seen[d.id]) return; seen[d.id] = 1;
            var c = {}; for (var k in d) c[k] = d[k];
            c.character = role; c.lmxDir = true; head.push(c);
        });
        P.cast = head.concat(P.cast.filter(function (a) { return !(a && seen[a.id]); }));
        P.crew = P.crew.filter(function (m) { return !(m && m.job === 'Director'); });
    }
    function fxCss() {
        if (document.getElementById('lmx-fullx-css')) return;
        var play = "url(\"data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M8 5v14l11-7z' fill='white'/></svg>") + "\")";
        var st = document.createElement('style'); st.id = 'lmx-fullx-css';
        st.textContent =
            '.lmx-people .full-person,.lmx-trl .full-person{flex-direction:column;align-items:flex-start;background:none !important;color:inherit !important;padding:0 1.1em 0 0;font-size:1em}' +
            '.lmx-people .full-person__photo,.lmx-trl .full-person__photo{margin:0 0 .7em;position:relative}' +
            '.lmx-people .full-person__photo>img,.lmx-trl .full-person__photo>img{width:100%;height:100%;object-fit:cover}' +
            '.lmx-people .full-person__name,.lmx-trl .full-person__name{font-size:1.05em;font-weight:600;line-height:1.2}' +
            '.lmx-people .full-person__role,.lmx-trl .full-person__role{font-size:.9em;margin-top:.25em;opacity:.6;line-height:1.2}' +
            '.lmx-people .full-person.focus .full-person__photo,.lmx-trl .full-person.focus .full-person__photo,.lmx-people .full-person.hover .full-person__photo,.lmx-trl .full-person.hover .full-person__photo{box-shadow:0 0 0 .22em #fff}' +
            '.lmx-people .full-person.focus .full-person__role,.lmx-trl .full-person.focus .full-person__role{opacity:.9}' +
            '.lmx-people .full-person{align-items:center;text-align:center;width:9.4em;padding:0 .5em}' +
            '.lmx-people .full-person__photo{width:7.8em;height:7.8em;border-radius:50%}' +
            '.lmx-people .full-person__body{width:100%}' +
            '.lmx-trl .full-person{width:23.4em}' +
            'html body .items-line.lmx-trl .full-person:not(.full-person--small):not(#lmx-x){width:23.4em !important;align-items:flex-start !important;text-align:left !important;padding:0 1.1em 0 0 !important;margin-right:0 !important}' +
            'html body .items-line.lmx-trl .full-person:not(.full-person--small):not(#lmx-x) .full-person__photo{width:22.3em !important;height:12.5em !important;border-radius:1.1em !important;margin:0 0 .7em 0 !important;background:#1a1d27 !important}' +
            'html body .items-line.lmx-trl .full-person:not(.full-person--small):not(#lmx-x) .full-person__photo img{border-radius:0 !important;width:100%;height:100%;object-fit:cover}' +
            'html body .items-line.lmx-trl .full-person:not(.full-person--small):not(#lmx-x) .full-person__body{width:22.3em !important}' +
            'html body .items-line.lmx-trl .full-person:not(.full-person--small):not(#lmx-x) .full-person__name{-webkit-line-clamp:1}' +
            'html body.lmx-apple .items-line.lmx-trl .full-person:not(.full-person--small):not(#lmx-x) .full-person__photo{border-radius:1.5em !important}' +
            'html body .items-line.lmx-trl .full-person:not(.full-person--small):not(#lmx-x).focus{background:none !important}' +
            'html body .lmx-descr--btn:not(#lmx-x){cursor:pointer;border-radius:1.1em;padding:.55em .9em;transition:background .15s,box-shadow .15s}' +
            'html body .lmx-descr--btn.focus:not(#lmx-x),html body .lmx-descr--btn.hover:not(#lmx-x){background:rgba(255,255,255,.13);box-shadow:0 0 0 .14em rgba(255,255,255,.85) inset}' +
            'html body.lmx-prem .lmx-descr--btn.focus:not(#lmx-x){background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.07));box-shadow:0 0 0 1px rgba(255,255,255,.55) inset,0 .5em 1.4em rgba(0,0,0,.45)}' +
            'html body.lmx-apple .lmx-descr--btn.focus:not(#lmx-x){background:rgba(255,255,255,.22);box-shadow:0 0 0 .14em rgba(255,255,255,.95) inset}' +
            '.modal.lmx-dm{display:flex !important;align-items:center;justify-content:center;background:rgba(4,5,10,.78)}' +
            '@keyframes lmxdm{from{opacity:0;transform:translateY(.5em)}to{opacity:1;transform:none}}' +
            '.modal.lmx-dm .modal__content{animation:lmxdm .22s ease-out both}' +
            '.modal.lmx-dm .modal__content{width:62vw;max-width:62vw !important;margin:0 !important}' +
            '.modal.lmx-dm .modal__content{background:#171a24;border-radius:1.5em;border:1px solid rgba(255,255,255,.08);box-shadow:0 1.5em 4em rgba(0,0,0,.6);max-width:46em;padding:1.6em 2em}' +
            '.modal.lmx-dm .modal__title{font-size:1.9em;font-weight:700;margin-bottom:.7em;letter-spacing:.01em}' +
            'body.lmx-prem .modal.lmx-dm .modal__content{background:radial-gradient(120% 90% at 0% 0%,#232739 0%,#12141c 60%);border-color:rgba(255,255,255,.1);border-radius:1.2em}' +
            'body.lmx-prem .modal.lmx-dm .modal__title{text-transform:uppercase;letter-spacing:.06em;font-size:1.6em}' +
            'body.lmx-prem .modal.lmx-dm .modal__title::after{content:"";display:block;width:2.6em;height:.18em;margin-top:.5em;border-radius:1em;background:#9ccb6b}' +
            'body.lmx-apple .modal.lmx-dm .modal__content{background:rgba(40,44,80,.55);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.28);border-radius:2em}' +
            '.modal.lmx-dm .lmx-dmodal{color:rgba(255,255,255,.88)}' +
            'body .lmx-descr--btn.focus,body .lmx-descr--btn.hover{box-shadow:0 0 0 .2em #fff}' +
            '.lmx-dmodal{font-size:1.3em;line-height:1.65;padding:.2em .4em 1em}.lmx-dmodal p{margin:0 0 .9em}' +
            '.lmx-coll .card.lmx-ordd{overflow:visible !important;position:relative}' +
            '.lmx-coll .scroll__body:after{content:"";flex:0 0 2.5em;display:block}' +
            '.lmx-coll .card.lmx-nn1{margin-left:6.8em !important}' +
            '.lmx-coll .card.lmx-nn2{margin-left:13em !important}' +
            '.lmx-coll .lmx-num{position:absolute;right:calc(100% - .07em);bottom:.02em;z-index:0;pointer-events:none;font-family:"Oswald","Impact","Arial Narrow",sans-serif;font-weight:700;font-size:13em;line-height:.8;letter-spacing:-.04em;color:rgba(10,11,16,.9);-webkit-text-stroke:.025em rgba(255,255,255,.62);white-space:nowrap}' +
            '.lmx-coll .card.lmx-ordd .card__view{position:relative;z-index:1}' +
            '.lmx-coll .card.lmx-ncur .lmx-num{color:rgba(255,255,255,.92);-webkit-text-stroke-color:#fff}' +
            '.lmx-coll .card.lmx-nseen .lmx-num{color:rgba(38,128,78,.55);-webkit-text-stroke-color:rgba(120,210,150,.9)}' +
            '.lmx-coll .lmx-ntag{position:absolute;right:calc(100% + .1em);top:.2em;z-index:2;padding:.2em .7em;border-radius:1em;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.35);color:#fff;font-size:.85em;font-weight:700;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}' +
            '.lmx-coll .card.lmx-ncur .lmx-ntag{background:#fff;color:#111;border-color:#fff}' +
            '.lmx-coll .lmx-ntag.lmx-ntag--ok{width:1.9em;height:1.9em;padding:0;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#2fbf6b;border:0;color:#fff;font-size:1.1em;line-height:1;box-shadow:0 .1em .6em rgba(0,0,0,.45)}' +
            'body.lmx-hidetags .full-descr__tags{display:none !important}' +
            '.lmx-more .items-line__head,.lmx-more .items-line__title{display:none !important}' +
            '.lmx-more .items-line__body{padding:0 1.5em .6em !important}' +
            '.lmx-more__bar{position:relative;display:flex;align-items:center;gap:1em;height:3.4em;padding:0 1.5em;border-radius:1em;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);font-size:1.15em;font-weight:600;color:#fff;transition:transform .18s ease-out,background-color .18s ease-out}' +
            '.lmx-more__n{opacity:.55;font-weight:500;font-size:.88em}' +
            '.lmx-more__ch{margin-left:auto;width:1.3em;height:1.3em;transition:transform .2s ease-out}' +
            '.lmx-more__bar.lmx-more--open .lmx-more__ch{transform:rotate(180deg)}' +
            '.lmx-more__bar.focus{background:rgba(255,255,255,.2)}' +
            'body.lmx-prem .lmx-more__bar{border-radius:1em;background:#12131f;box-shadow:none;transition:transform .2s cubic-bezier(.25,.8,.25,1),box-shadow .2s}' +
            'body.lmx-prem .lmx-more__bar.focus{background:#171826;transform:scale(1.02);z-index:3;box-shadow:0 0 0 .12em rgba(255,255,255,.55),0 .5em 1em rgba(0,0,0,.6)}' +
            'body.lmx-prem .lmx-more__bar.focus .lmx-more__n{opacity:.8}' +
            'body.lmx-apple .lmx-more__bar{border-radius:1.2em;background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}' +
            'body.lmx-apple .lmx-more__bar.focus{background:rgba(255,255,255,.14);transform:scale(1.03);box-shadow:0 0 0 .16em #fff,0 .5em 1.5em rgba(0,0,0,.4)}' +
            'html body.lmx-hidetrl .full-start__button.view--trailer:not(#lmx-x),html body.lmx-hidetrl .full-start-new__buttons .view--trailer:not(#lmx-x),html body.lmx-hidetrl .view--trailer.lmx-trlhide:not(#lmx-x){display:none !important}' +
            '.lmx-trl .full-person__photo{width:22.3em;height:12.5em;border-radius:1.1em;background:#1a1d27}' +
            '.lmx-trl .full-person__photo::after{content:"";position:absolute;left:50%;top:50%;width:3.4em;height:3.4em;margin:-1.7em 0 0 -1.7em;border-radius:50%;background:rgba(10,11,16,.55) ' + play + ' 56% 50%/42% no-repeat;border:1px solid rgba(255,255,255,.35)}' +
            'body.lmx-apple .lmx-people .full-person__photo,body.lmx-apple .lmx-trl .full-person__photo{border:0}' +
            'body.lmx-apple .lmx-trl .full-person__photo{border-radius:1.5em}' +
            'body.lmx-apple .lmx-trl .full-person__photo::after{background-color:rgba(255,255,255,.3)}' +
            'body.lmx-apple .lmx-people .full-person__photo,body.lmx-apple .lmx-trl .full-person__photo,body.lmx-apple .full-episode .full-episode__img{transition:transform .2s cubic-bezier(.25,.8,.25,1)}' +
            'body.lmx-apple .lmx-people .full-person.focus .full-person__photo,body.lmx-apple .lmx-trl .full-person.focus .full-person__photo,body.lmx-apple.lmx-full .full-episode.focus .full-episode__img{box-shadow:0 0 0 .16em #fff,0 .5em 1.5em rgba(0,0,0,.4) !important;transform:scale(1.1)}' +
            'body.lmx-apple.lmx-full .full-episode.focus::after,body.lmx-apple.lmx-full .full-episode.focus .full-episode__img::after{display:none !important}' +
            'body.lmx-apple.lmx-full .full-episode .full-episode__img{position:relative}';
        (document.head || document.documentElement).appendChild(st);
    }
    function openDescr(m, txt, r) {
        if (!(Lampa.Modal && Lampa.Modal.open && window.$) || document.querySelector('.modal')) return;
        var enabled = Lampa.Controller.enabled().name, closed = false;
        var box = $('<div class="lmx-dmodal"></div>');
        String(txt).split(/\n+/).forEach(function (t) { if (t.trim()) box.append($('<p></p>').text(t.trim())); });
        function onKey(ev) {
            var k = ev.keyCode;
            if (k === 37 || k === 39 || ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') { ev.preventDefault(); ev.stopPropagation(); close(); }
        }
        function close() {
            if (closed) return; closed = true;
            window.removeEventListener('keydown', onKey, true);
            var refocus = function () {
                if (!r) return;
                var w = firstBtn(r);
                if (w && !w.classList.contains('focus')) focusBtn(r, w);
            };
            safe(function () { Lampa.Modal.close(); });
            safe(function () { Lampa.Controller.toggle(enabled); });
            safe(refocus);
            [30, 80, 300].forEach(function (d) {
                setTimeout(function () {
                    safe(function () { if (!document.querySelector('.modal') && !document.querySelector('.selectbox')) Lampa.Controller.toggle(enabled); });
                    safe(refocus);
                }, d);
            });
        }
        window.addEventListener('keydown', onKey, true);
        Lampa.Modal.open({ title: String(m.title || m.name || ''), html: box, size: 'medium', mask: true, onBack: close });
        safe(function () { $('.modal').addClass('lmx-dm'); });
    }
    var CHRONO = { 10: [1893, 1894, 1895, 11, 1891, 1892, 140607, 181808, 181812] };
    function collPrepare(data) {
        var c = data && data.collection;
        if (!c || !c.parts || !c.parts.length) return;
        var dt = function (x) { return String(x.release_date || x.first_air_date || '9999-99-99'); };
        var list = c.parts.slice().filter(function (x) { return x && x.id; });
        list.sort(function (a, b) { return dt(a).localeCompare(dt(b)); });
        var ord = CHRONO[c.id];
        if (ord && getBool('lmx_coll_chrono', false)) {
            list.sort(function (a, b) {
                var ia = ord.indexOf(a.id), ib = ord.indexOf(b.id);
                if (ia < 0 && ib < 0) return dt(a).localeCompare(dt(b));
                if (ia < 0) return 1; if (ib < 0) return -1;
                return ia - ib;
            });
        }
        list = list.slice(0, 40);
        list.sort = function () { return this; };
        c.results = list;
        c.lmxColl = true; c.lmxCur = data.movie && data.movie.id; c.lmxChrono = !!(ord && getBool('lmx_coll_chrono', false));
    }
    function collMark(root, d) {
        var idx = {}, order = (d.results || []).map(function (x) { return x.id; });
        order.forEach(function (id, i) { idx[id] = i + 1; });
        var seen = {}, h = favIds('history'), v = favIds('viewed'), k;
        for (k in h) seen[k] = 1; for (k in v) seen[k] = 1;
        var cur = d.lmxCur, next = 0;
        for (var i = 0; i < order.length; i++) { if (order[i] !== cur && !seen[order[i]]) { next = order[i]; break; } }
        var paint = function () {
            root.querySelectorAll('.card:not(.lmx-ordd)').forEach(function (el) {
                var dd = getData(el);
                if (!dd || !idx[dd.id]) return;
                el.classList.add('lmx-ordd', idx[dd.id] > 9 ? 'lmx-nn2' : 'lmx-nn1');
                if (dd.id === cur) el.classList.add('lmx-ncur'); else if (seen[dd.id]) el.classList.add('lmx-nseen');
                var b = document.createElement('div');
                b.className = 'lmx-num';
                b.textContent = String(idx[dd.id]);
                el.appendChild(b);
                var tag = dd.id === cur ? 'Вы здесь' : (seen[dd.id] ? 'Просмотрено' : (dd.id === next ? 'Далее' : ''));
                if (tag) { var t = document.createElement('div'); var ok = tag === 'Просмотрено'; t.className = 'lmx-ntag' + (ok ? ' lmx-ntag--ok' : ''); t.textContent = ok ? '\u2713' : tag; el.appendChild(t); }
            });
        };
        paint();
        try { new MutationObserver(paint).observe(root, { childList: true, subtree: true }); } catch (e) {}
    }
    function simPrepare(data) {
        var m = data && data.movie;
        if (!m) return;
        var rec = (data.recomend && data.recomend.results) || [], sim = (data.simular && data.simular.results) || [];
        if (!rec.length && !sim.length) return;
        var isTv = !!(m.name || m.first_air_date || m.number_of_seasons) && !m.title;
        var mg = genreIds(m).filter(Boolean), myear = parseInt(String(m.release_date || m.first_air_date || '0').slice(0, 4), 10) || 0;
        var skip = {}; skip[m.id] = 1;
        ((data.collection && data.collection.parts) || []).forEach(function (x) { if (x && x.id) skip[x.id] = 1; });
        var map = {}, order = [];
        var add = function (x, w) {
            if (!x || !x.id || skip[x.id]) return;
            if (map[x.id]) { map[x.id].w += w; return; }
            map[x.id] = { x: x, w: w }; order.push(x.id);
        };
        rec.forEach(function (x) { add(x, 3); });
        sim.forEach(function (x) { add(x, 1); });
        var nn = function (t) { return String(t || '').toLowerCase().replace(/[^a-z0-9\u0400-\u04ff]/g, ''); };
        var mk = nn(m.original_title || m.original_name || m.title || m.name);
        var kin = function (x) {
            var k = nn(x.original_title || x.original_name || x.title || x.name);
            return mk.length >= 5 && k.length >= 5 && (k.indexOf(mk) === 0 || mk.indexOf(k) === 0);
        };
        var list = order.map(function (id) { return map[id]; }).filter(function (o) {
            var x = o.x, tv = !!(x.name || x.first_air_date) && !x.title, vc = x.vote_count || 0, va = x.vote_average || 0;
            if (x.adult || !x.poster_path) return false;
            o.kin = kin(x); o.cross = tv !== isTv;
            if (o.kin) return vc >= 5;
            if (o.cross) return o.w >= 3 && vc >= 100 && va >= 6.5;
            return vc >= 25 && va >= 5.5;
        });
        list.forEach(function (o) {
            var x = o.x, g = genreIds(x).filter(Boolean), inter = g.filter(function (i) { return mg.indexOf(i) >= 0; }).length;
            var jac = (mg.length || g.length) ? inter / (mg.length + g.length - inter || 1) : 0;
            var y = parseInt(String(x.release_date || x.first_air_date || '0').slice(0, 4), 10) || 0;
            var near = (myear && y) ? Math.max(0, 1 - Math.abs(myear - y) / 25) : 0.4;
            o.s = o.w * 2 + jac * 4 + ((x.vote_average || 0) - 5) * 0.8 + Math.min(Math.log(((x.vote_count || 0) + 1)) / Math.LN10, 4) * 0.7 +
                (x.original_language && x.original_language === m.original_language ? 0.8 : 0) + near + (o.kin ? 8 : 0) - (o.cross ? 1.2 : 0);
        });
        list.sort(function (a, b) { return b.s - a.s; });
        var out = list.slice(0, 20).map(function (o) { return o.x; });
        if (out.length < 4) return;
        out.sort = function () { return this; };
        data.simular = { results: out, nomore: true, lmxSim: true };
        data.recomend = null;
    }
    function stripNocubRows(rows) {
        var on = function (k) { var v = Lampa.Storage.get(k, 'true'); return v === true || v === 'true'; };
        var meta = on('nocub_meta'), rev = true, i, n;
        for (i = rows.length - 1; i >= 0; i--) {
            n = Array.isArray(rows[i]) ? rows[i][0] : rows[i];
            if ((meta && (n === 'metadata_chart' || n === 'metadata_tags')) || (rev && n === 'discuss')) rows.splice(i, 1);
        }
    }
    function reorderRows(rows) {
        var kind = function (r) {
            if (!Array.isArray(r)) return 0;
            var n = r[0], d = r[1] || {};
            if (n === 'persons' && d.lmxTrailers) return 0;
            if (n === 'persons' && d.lmxUac) return 3;
            if (n === 'persons' && d.__lmxStudios) return 5;
            if (n === 'persons') return 4;
            if (n === 'cards' && d.lmxColl) return 1;
            if (n === 'cards') return 2;
            return 0;
        };
        var keep = [], b = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        rows.forEach(function (r) { var k = kind(r); if (k) b[k].push(r); else keep.push(r); });
        var out = keep.concat(b[1], b[3], b[2], b[4], b[5]);
        rows.length = 0;
        out.forEach(function (r) { rows.push(r); });
    }
    function adultPages() {
        var want = getBool('lmx_adult_pages', true);
        try { if (Lampa.Storage.get('adult_content_view', false) !== want) Lampa.Storage.set('adult_content_view', want); } catch (e) {}
    }
    var REL = [
        ['c:10', 'm:The Mandalorian & Grogu', 't:The Mandalorian', 't:Andor', 't:Ahsoka', 't:Obi-Wan Kenobi', 't:The Book of Boba Fett', 't:The Acolyte', 't:Skeleton Crew', 't:Star Wars: The Clone Wars|2008', 't:Star Wars Rebels', 't:Star Wars: The Bad Batch', 't:Star Wars: Tales of the Jedi', 't:Star Wars: Visions'],
        ['t:Breaking Bad', 't:Better Call Saul', 'm:El Camino: A Breaking Bad Movie'],
        ['t:Game of Thrones', 't:House of the Dragon', 't:A Knight of the Seven Kingdoms'],
        ['t:Peaky Blinders', 'm:Peaky Blinders: The Immortal Man'],
        ['t:The Witcher', 't:The Witcher: Blood Origin', 'm:The Witcher: Nightmare of the Wolf', 'm:The Witcher: Sirens of the Deep'],
        ['m:Dune|2021', 'm:Dune: Part Two', 't:Dune: Prophecy'],
        ['t:Vikings', 't:Vikings: Valhalla'],
        ['t:La casa de papel', 't:Berlín'],
        ['t:Narcos', 't:Narcos: Mexico'],
        ['t:The Boys', 't:Gen V', 't:The Boys Presents: Diabolical'],
        ['t:The Walking Dead', 't:Fear the Walking Dead', 't:The Walking Dead: World Beyond', 't:The Walking Dead: Dead City', 't:The Walking Dead: Daryl Dixon', 't:The Walking Dead: The Ones Who Live']
    ];
    function relNorm(x) { return String(x || '').toLowerCase().replace(/[^a-z0-9Ѐ-ӿ]+/g, ''); }
    function relParse(x) { var m = x.match(/^(t|m|c):([^|]*)(?:\|(\d{4}))?$/); return m ? { k: m[1], n: m[2], y: m[3] || '' } : null; }
    function relFind(mv) {
        var kind = (mv.name || mv.first_air_date || mv.number_of_seasons) ? 't' : 'm';
        var title = relNorm(mv.original_title || mv.original_name), year = String(mv.release_date || mv.first_air_date || '').slice(0, 4);
        var col = mv.belongs_to_collection && mv.belongs_to_collection.id, i, j, e;
        for (i = 0; i < REL.length; i++) for (j = 0; j < REL[i].length; j++) {
            e = relParse(REL[i][j]);
            if (!e) continue;
            if (e.k === 'c') { if (col && String(col) === e.n) return REL[i]; continue; }
            if (e.k === kind && relNorm(e.n) === title && (!e.y || e.y === year)) return REL[i];
        }
        return null;
    }
    function relPrepare(link, data) {
        var mv = data && data.movie, grp = mv && relFind(mv);
        if (!grp || !link || !Array.isArray(link.rows)) return;
        var want = [], res = [], left, done = false;
        var myCol = mv.belongs_to_collection && String(mv.belongs_to_collection.id);
        grp.forEach(function (x) { var e = relParse(x); if (e && (e.k !== 'c' || e.n !== myCol)) want.push(e); });
        left = want.length;
        if (!left) return;
        function fin() {
            if (done || --left > 0) return;
            done = true;
            var seen = {}, list = [];
            want.forEach(function (e, i) {
                var rr = res[i], arr2 = Array.isArray(rr) ? rr : (rr ? [rr] : []);
                arr2.forEach(function (r) { if (r && r.id !== mv.id && !seen[r.id]) { seen[r.id] = 1; list.push(r); } });
            });
            if (!list.length) return;
            var inColl = {};
            ((data.collection && data.collection.parts) || []).forEach(function (x) { inColl[x.id] = 1; });
            list = list.filter(function (r) { return !inColl[r.id] || r.name; });
            if (!list.length || !Array.isArray(link.rows)) return;
            var at = link.rows.length, k, sm = -1;
            for (k = link.rows.length - 1; k >= 0; k--) { if (Array.isArray(link.rows[k]) && link.rows[k][0] === 'cards') { if (at === link.rows.length) at = k + 1; if (data.simular && link.rows[k][1] === data.simular) { sm = k; break; } } }
            if (sm >= 0) at = sm;
            at = Math.max(at, (link.items && link.items.length) || 0);
            link.rows.splice(at, 0, ['cards', { results: list, title: 'Связанное', nomore: true, lmxRel: true }]);
            if (data.simular && Array.isArray(data.simular.results) && (!link.items || link.rows.indexOf(link.rows.filter(function (r) { return Array.isArray(r) && r[1] === data.simular; })[0]) >= link.items.length)) {
                var inRel = {}; list.forEach(function (r) { inRel[r.id] = 1; });
                var keepS = data.simular.results.filter(function (r) { return !inRel[r.id]; });
                if (keepS.length >= 4) { keepS.sort = data.simular.results.sort; data.simular.results = keepS; }
            }
        }
        want.forEach(function (e, i) {
            if (e.k === 'c') {
                tget('collection/' + e.n, {}, function (j) {
                    var ps = ((j && j.parts) || []).filter(function (x) { return x && x.id && x.poster_path; });
                    ps.sort(function (a, b) { return String(a.release_date || '9999').localeCompare(String(b.release_date || '9999')); });
                    if (ps.length) res[i] = ps;
                    fin();
                }, fin);
                return;
            }
            tget('search/' + (e.k === 't' ? 'tv' : 'movie') + '?query=' + encodeURIComponent(e.n), {}, function (j) {
                var arr = (j && j.results) || [], n = relNorm(e.n), q;
                for (q = 0; q < arr.length; q++) {
                    var r = arr[q], rt = relNorm(r.original_title || r.original_name), ry = String(r.release_date || r.first_air_date || '').slice(0, 4);
                    if (rt === n && (!e.y || ry === e.y)) { res[i] = r; break; }
                }
                fin();
            }, fin);
        });
    }
    function fullScrollWatch() {
        if (window.__lmxFsw) return;
        var fswN = 0, lastMo = false, menuT = 0;
        window.__lmxFsw = setInterval(function () {
            var b = document.body;
            if (!b || document.hidden) return;
            var on = false;
            if ((b.classList.contains('lmx-apple') || b.classList.contains('lmx-prem')) && b.classList.contains('lmx-onfull')) {
                var st = document.querySelector('.activity--active .full-start-new') || document.querySelector('.activity--active .full-start');
                if (st) { var tp = st.getBoundingClientRect().top / window.innerHeight; on = b.classList.contains('lmx-fscroll') ? tp < -0.06 : tp < -0.15; }
            }
            if (b.classList.contains('lmx-fscroll') !== on) b.classList.toggle('lmx-fscroll', on);
            if (b.classList.contains('lmx-apple') && b.classList.contains('lmx-onfull')) {
                var sb = document.querySelector('.activity--active .full-start__background');
                if (sb && sb.src) {
                    var cl = sb.parentNode && sb.parentNode.querySelector('.lmx-bgb');
                    if (!cl) { cl = document.createElement('img'); cl.className = 'lmx-bgb'; sb.parentNode.insertBefore(cl, sb.nextSibling); }
                    if (cl.getAttribute('src') !== sb.getAttribute('src')) cl.src = sb.src;
                    if (cl.style.top !== sb.style.top) { if (sb.style.top) cl.style.setProperty('top', sb.style.top, 'important'); else cl.style.removeProperty('top'); }
                    if (cl.style.left !== sb.style.left) { if (sb.style.left) cl.style.setProperty('left', sb.style.left, 'important'); else cl.style.removeProperty('left'); }
                }
            }
            if (b.classList.contains('lmx-prem') && b.classList.contains('lmx-onfull')) {
                var pb = document.querySelector('.activity--active .full-start__background');
                if (pb && pb.parentNode) {
                    var vg = pb.parentNode.querySelector('.lmx-bgv');
                    if (!vg) { vg = document.createElement('div'); vg.className = 'lmx-bgv'; pb.parentNode.insertBefore(vg, pb.nextSibling); }
                    if (vg.style.top !== pb.style.top) { if (pb.style.top) vg.style.setProperty('top', pb.style.top, 'important'); else vg.style.removeProperty('top'); }
                    if (vg.style.left !== pb.style.left) { if (pb.style.left) vg.style.setProperty('left', pb.style.left, 'important'); else vg.style.removeProperty('left'); }
                }
            }
            if (b.classList.contains('lmx-apple') && b.classList.contains('lmx-onfull')) {
                var mo = b.classList.contains('menu--open');
                if (mo !== lastMo) { lastMo = mo; menuT = Date.now(); }
                var bg = (++fswN % 5 === 0 && !mo && Date.now() - menuT > 800) ? (document.querySelector('.activity--active .full-start__background') || document.querySelector('.full-start__background')) : null;
                if (bg && !b.classList.contains('lmx-fscroll')) {
                    var rc = bg.getBoundingClientRect(), dy = rc.top, dx = rc.left;
                    if (Math.abs(dy) > 1) bg.style.setProperty('top', ((parseFloat(bg.style.top) || 0) - dy) + 'px', 'important');
                    if (Math.abs(dx) > 1) bg.style.setProperty('left', ((parseFloat(bg.style.left) || 0) - dx) + 'px', 'important');
                }
            }
        }, 150);
    }
    function collapseMore(lk, data) {
        var rows = lk.rows, hid = [], nA = 0, nS = 0, keep = [];
        rows.forEach(function (r) {
            var d = Array.isArray(r) && r[0] === 'persons' ? (r[1] || {}) : null;
            if (d && !d.lmxTrailers && !d.lmxUac) {
                hid.push(r);
                if (d.__lmxStudios) nS += (d.results || []).length; else nA += (d.results || []).length;
            } else keep.push(r);
        });
        if (!data || !data.movie) return;
        var mv0 = data.movie, hasSt = !!(getBool('lmx_studios', true) && ((mv0.production_companies && mv0.production_companies.length) || (mv0.networks && mv0.networks.length)));
        if (!hid.length && !hasSt) return;
        var mv = data.movie;
        mv.genres = mv.genres || []; mv.production_companies = mv.production_companies || [];
        rows.length = 0;
        keep.forEach(function (r) { rows.push(r); });
        rows.push(['description', { movie: mv, lmxMore: { rows: hid, nA: nA, nS: nS } }]);
    }
    function moreBind(e) {
        var d = e.data, m = d && d.lmxMore;
        if (!m || e.name !== 'description') return;
        var lk = e.link, item = e.item, html = item.render(), body = html.find('.items-line__body');
        var label = [];
        if (m.nA) label.push('Актёры ·' + m.nA);
        if (m.nS) label.push('Студии ·' + m.nS);
        var bar = $('<div class="lmx-more__bar selector"><span class="lmx-more__t">Дополнительная информация</span><span class="lmx-more__n">' + label.join('&nbsp;&nbsp;&nbsp;') + '</span><svg class="lmx-more__ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l7 7 7-7"/></svg></div>');
        html.addClass('lmx-more');
        body.empty().append(bar);
        item.last = bar[0];
        var open = false;
        m.upd = function () {
            var l = [];
            if (m.nA) l.push('Актёры ·' + m.nA);
            if (m.nS) l.push('Студии ·' + m.nS);
            bar.find('.lmx-more__n').html(l.join('&nbsp;&nbsp;&nbsp;'));
        };
        bar.on('hover:focus hover:hover hover:touch', function () { item.last = bar[0]; });
        var lastTap = 0;
        bar.on('hover:enter', function () {
            var nowT = Date.now(); if (nowT - lastTap < 600) return; lastTap = nowT;
            try { moreToggle(); } catch (x) { try { Lampa.Noty.show('Дополнительная информация:' + (x && x.message || x)); } catch (y) {} }
        });
        function moreToggle() {
            var bgs = $(document.querySelectorAll('.activity--active .full-start__background')), wasDim = bgs.hasClass('dim'), gt = 0;
            var hold = setInterval(function () { try { bgs.toggleClass('dim', wasDim); } catch (x) {} if (++gt > 20) clearInterval(hold); }, 40);
            var bi = lk.rows.indexOf(lk.rows.filter(function (r) { return Array.isArray(r) && r[1] === d; })[0]), i;
            if (bi < 0) return;
            if (!open) {
                open = true; m.open = true;
                bar.addClass('lmx-more--open');
                m.rows.forEach(function (r) { lk.rows.push(r); });
                var v = lk.view; lk.view = 99;
                try { lk.emit('scroll', 0); } catch (x) {}
                lk.view = v;
            } else {
                open = false; m.open = false;
                bar.removeClass('lmx-more--open');
                for (i = lk.items.length - 1; i > bi; i--) { try { lk.items[i].destroy(); } catch (x) {} lk.items.splice(i, 1); }
                lk.rows.length = bi + 1;
            }
            setTimeout(function () { try { item.toggle(); } catch (x) {} }, 30);
        }
    }
    function initFullExtras() {
        if (window.__lmxFullX || !window.Lampa || !Lampa.Listener) return;
        window.__lmxFullX = 1;
        fxCss();
        fullScrollWatch();
        Lampa.Listener.follow('full', function (e) { if (e && e.type === 'build' && e.name === 'description') safe(function () { moreBind(e); }); });
        if (document.body) { document.body.classList.toggle('lmx-hidetrl', getBool('lmx_hide_trl_btn', true)); document.body.classList.toggle('lmx-hidetags', getBool('lmx_hide_tags', true)); }
        Lampa.Listener.follow('full', function (e) {
            safe(function () {
                if (!e) return;
                if (e.type !== 'complite' && !e.data) return;
                if (e.type === 'start') {
                    var adult = e.data.movie && e.data.movie.adult;
                    if (e.link && typeof e.link.view === 'number' && e.link.view < 5 && getBool('lmx_rows_ahead', true) && !(getBool('lmx_related', true) && e.data.movie && relFind(e.data.movie))) e.link.view = 5;
                    if (!adult && getBool('lmx_full_people', true)) fullPeople(e.data);
                    if (!adult && getBool('lmx_full_trailers', true) && e.link && Array.isArray(e.link.rows)) {
                        var tr = fullTrailers(e.data);
                        if (tr && tr.length) {
                            var ix = e.link.rows.indexOf('description');
                            e.link.rows.splice(ix > 0 ? ix : 1, 0, ['persons', { results: tr, title: 'Трейлеры', lmxTrailers: true }]);
                        }
                    }
                    if (!adult) safe(function () { uacRowPrepare(e.link, e.data); });
                    if (!adult && getBool('lmx_coll_order', true)) safe(function () { collPrepare(e.data); });
                    if (!adult && getBool('lmx_related', true)) safe(function () { relPrepare(e.link, e.data); });
                    if (!adult && getBool('lmx_sim_better', true)) safe(function () { simPrepare(e.data); });
                    if (!adult && e.link && Array.isArray(e.link.rows) && typeof e.link.build === 'function') {
                        var lk = e.link, ob = lk.build;
                        lk.build = function () {
                            lk.build = ob;
                            safe(function () { stripNocubRows(lk.rows); });
                            if (getBool('lmx_hide_episodes', true)) safe(function () { for (var q = lk.rows.length - 1; q >= 0; q--) if ((Array.isArray(lk.rows[q]) ? lk.rows[q][0] : lk.rows[q]) === 'episodes') lk.rows.splice(q, 1); });
                            if (getBool('lmx_rows_end', true)) safe(function () { reorderRows(lk.rows); });
                            if (getBool('lmx_more_info', true)) safe(function () { collapseMore(lk, e.data); });
                            if (getBool('lmx_related', true) && e.data.movie && relFind(e.data.movie)) safe(function () {
                                for (var q = 0; q < lk.rows.length; q++) {
                                    var rw = lk.rows[q];
                                    if (Array.isArray(rw) && rw[0] === 'cards' && !(rw[1] && (rw[1].lmxColl || rw[1].lmxRel))) { if (q >= 1 && q < (lk.view || lk.rows.length)) lk.view = q; break; }
                                }
                            });
                            return ob.call(this, lk.rows.slice(0, lk.view || arguments[0].length));
                        };
                    }
                    if (!adult && getBool('lmx_hide_descr_row', true) && e.link && Array.isArray(e.link.rows)) {
                        var di = e.link.rows.indexOf('description');
                        if (di >= 0) e.link.rows.splice(di, 1);
                    }
                } else if (e.type === 'build' && e.name === 'start') {
                    if (getBool('lmx_hide_trl_btn', true)) safe(function () { $(e.body).find('.view--trailer').remove(); });
                    safe(function () {
                        e.item.use({ onGroupButtons: function () {
                            var w = this.html ? firstBtn(this.html) : null;
                            if (w) this.last = w;
                        } });
                    });
                } else if (e.type === 'complite' && getBool('lmx_hide_trl_btn', true)) {
                    var rr = e.object && e.object.activity && e.object.activity.render ? e.object.activity.render() : null;
                    var hideB = function () { if (rr) rr.find('.view--trailer').remove(); };
                    hideB(); [400, 1200, 2500].forEach(function (d) { setTimeout(function () { safe(hideB); }, d); });
                } else if (e.type === 'build' && e.name === 'cards' && e.data && e.data.lmxColl && e.item && e.item.render) {
                    var cr = e.item.render(true), cd = e.data;
                    $(cr).addClass('lmx-coll');
                    $(cr).find('.items-line__title').first().text(cd.lmxChrono ? 'Коллекция · хронология событий' : 'Коллекция · порядок просмотра');
                    collMark(cr, cd);
                } else if (e.type === 'build' && e.name === 'persons' && e.item && e.item.render) {
                    var d = e.data || {}, root = $(e.item.render(true));
                    if (d.lmxTrailers) { root.addClass('lmx-trl'); [500, 1300, 2600].forEach(function (t) { setTimeout(function () { safe(function () { trPrune(root); }); }, t); }); }
                    else if (d.lmxUac) {
                        root.addClass('lmx-uacr');
                        [0, 300, 1200].forEach(function (t) {
                            setTimeout(function () {
                                safe(function () {
                                    var bd = root.find('.scroll__body').get(0);
                                    if (!bd) return;
                                    var pd = bd.querySelector(':scope > .lmx-endpad');
                                    if (!pd) { pd = document.createElement('div'); pd.className = 'lmx-endpad'; pd.style.cssText = 'flex:none;width:3em;min-width:3em;height:1px;pointer-events:none'; }
                                    if (bd.lastElementChild !== pd) bd.appendChild(pd);
                                });
                            }, t);
                        });
                    }
                    else if (d.results && d.results[0] && d.results[0].lmxDir) {
                        root.addClass('lmx-people');
                        root.find('.items-line__title').first().text('Актёрский состав и съёмочная группа');
                    }
                }
            });
        });
    }

    function start() {
        safe(patchContentRows);
        safe(patchBackground);
        safe(syncCi);
        safe(addSettings);
        safe(moodMenu);
        safe(statsMenu);
        safe(initFullExtras);
        safe(function () { setTimeout(function () { safe(uacWarm); }, 2200); });
        safe(function () { setTimeout(function () { safe(epsPlayer); }, 2800); });
        safe(function () { setTimeout(function () { safe(adultPages); }, 3400); });
        safe(function () { setTimeout(function () { safe(moodMenu); safe(statsMenu); }, 2500); });
        safe(initRows);
        safe(function () { setTimeout(resolveCatalogRefs, 3000); });
        safe(function () {
            applyStyle();
            new MutationObserver(function (muts) {
                var hero = false, card = false, tor = false;
                for (var i = 0; i < muts.length; i++) {
                    var add = muts[i].addedNodes;
                    for (var k = 0; k < add.length; k++) {
                        var n = add[k];
                        if (n.nodeType !== 1) continue;
                        var cl = n.classList;
                        if (cl && cl.contains('torrent-item')) { tor = true; continue; }
                        if (cl && cl.contains('card')) { card = true; if (cl.contains('card--lmxhero')) hero = true; }
                        else if (n.querySelector && n.querySelector('.card')) { card = true; if (n.querySelector('.card--lmxhero')) hero = true; }
                    }
                }
                safe(function () { markHero(hero); });
                if (tor) safe(torrentPerf);
                if (card) schedule();
            }).observe(document.body, { childList: true, subtree: true });
            scan();
            Lampa.Listener.follow('full', function (e) { safe(function () { onFull(e); }); });
            Lampa.Listener.follow('activity', function (e) {
                if (!e || e.type !== 'start' || e.component !== 'full') return;
                [0, 30, 90].forEach(function (ms) { setTimeout(function () { safe(function () { var ac = document.querySelector('.activity--active'); if (ac && ac.querySelector('.full-start-new, .full-start, .full-start__background')) ac.classList.add('lmx-fullact'); }); }, ms); });
                var t0 = Date.now();
                [120, 450, 1000].forEach(function (ms) {
                    setTimeout(function () {
                        safe(function () {
                            if ((window.__lmxKeyT || 0) > t0) return;
                            if (Lampa.Controller.enabled().name !== 'full_start') return;
                            var c0 = document.querySelector('.activity--active .full-start-new__buttons, .activity--active .full-start__buttons');
                            if (!c0) return;
                            var best = null, bo = 1e9, i, el, o;
                            for (i = 0; i < c0.children.length; i++) {
                                el = c0.children[i];
                                if (!el.classList.contains('selector') || el.classList.contains('lmx-edit') || el.offsetWidth <= 0) continue;
                                o = parseInt(el.style.order, 10); if (isNaN(o)) o = i;
                                if (o < bo) { bo = o; best = el; }
                            }
                            var cf = c0.querySelector('.focus');
                            if (best && cf && cf !== best) Lampa.Controller.collectionFocus(best, window.$ ? window.$(c0).closest('.scroll')[0] || c0.parentNode : c0.parentNode);
                        });
                    }, ms);
                });
            });
            safe(initDots);
            safe(initThemeBtn);
            safe(function () { setTimeout(function () { safe(initNewEpBell); }, 4000); });
            safe(initCinema);
            safe(initBtnRowsNav);
            safe(initRowsWarm);
        });
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') start();
    });
})();

/*
 * NoCub v1.10 — скрывает элементы CUB в интерфейсе Lampa (для личного использования).
 * Все пункты — отдельные переключатели в Настройки → NoCub, по умолчанию ВЫКЛЮЧЕНЫ (кроме комментариев и метаданных/настроений).
 * Плагин лишь скрывает элементы стилем (ничего не удаляет и не блокирует запросов), поэтому выключенный переключатель возвращает всё назад.
 */
(function () {
    'use strict';
    if (window.__nocub) return;
    window.__nocub = true;

    var VERSION = '1.10';
    function safe(fn) { try { return fn(); } catch (e) { try { console.error('NoCub', e); } catch (x) {} } }

    var ITEMS = [
        { key: 'nocub_reactions', name: 'Кнопка реакций', desc: 'Кнопка «Реакции» на странице фильма и реакции на карточках. Ряд реакций под рейтингом остаётся' },
        { key: 'nocub_reviews', name: 'Комментарии и отзывы', desc: 'Блок «Комментарии» на странице фильма, вместе с кнопкой «добавить»', def: true },
        { key: 'nocub_premium', name: 'Премиум и приглашения', desc: 'Пункты меню, иконки и плашки о премиум-подписке и приглашении друзей' },
        { key: 'nocub_account', name: 'Аккаунт CUB', desc: 'Встроенный аккаунт и синхронизация CUB (пункт «Синхронизация», вход в CUB, профили). Сторонние плагины синхронизации не трогает' },
        { key: 'nocub_meta', name: 'Метаданные и настроения', desc: 'Блоки «Метаданные» (темп, экшн, насилие, страх, юмор) и «Настроения» на странице фильма; есть не у всех фильмов', def: true },
        { key: 'nocub_recs', name: 'Рекомендации на странице фильма', desc: 'Блоки «Рекомендации» и «Похожие» внизу страницы фильма' },
        { key: 'nocub_subscribe', name: 'Кнопка «Подписаться»', desc: 'Подписка на фильм, сериал или актёра (нужен аккаунт CUB)' },
        { key: 'nocub_shots', name: 'Shots', desc: 'Короткие видео Shots: пункт меню, ряд на главной, кнопка на странице фильма, метки и запись в плеере, раздел в настройках' },
        { key: 'nocub_promo', name: 'Акционные кнопки и плашки', desc: 'Сезонные акции CUB (Хэллоуин, Новый год, чёрная пятница, скидки, подарки) — по признакам в названии', def: true },
        { key: 'nocub_strict', name: 'Только известные кнопки шапки', desc: 'Скрывает любую неизвестную кнопку в шапке (запасной вариант для новых акций). Кнопки других плагинов добавьте в «Оставить кнопки» ниже', def: false }
    ];
    var PROMO = ['halloween', 'helloween', 'newyear', 'new-year', 'christmas', 'xmas', 'blackfriday', 'black-friday', 'cybermonday', 'sale', 'promo', 'discount', 'gift', 'valentine', 'easter', 'birthday', 'anniversary'];
    var KNOWN_HEAD = /open--(search|settings|broadcast|notice|profile|feed|premium)|notice--icon|full--screen|lmx-themebtn|lmx-nebell|head__back|head__menu|head__logo/;

    function defOf(key) { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].key === key) return !!ITEMS[i].def; return false; }
    function bellMode() { var m = String(Lampa.Storage.get('lmx_bell_mode', 'lmx') || 'lmx'); return m === 'cub' || m === 'none' ? m : 'lmx'; }
    function on(key) {
        if (key === 'nocub_bell') return bellMode() !== 'cub';
        if (key === 'nocub_promo') return true;
        if (key === 'nocub_strict') return false;
        if (key === 'nocub_meta') return true;
        if (key === 'nocub_recs') return false;
        if (key === 'nocub_reviews') return true;
        var v = Lampa.Storage.get(key, defOf(key) ? 'true' : 'false');
        return v === true || v === 'true';
    }

    var CSS = {
        nocub_reactions: [
            '.full-start__button.button--reaction', '.button--reaction',
            '.full-start__reactions',
            '.card__reactions', '.full-reactions'
        ],
        nocub_reviews: ['.full-review', '.full-review-add', '.full-reviews'],
        nocub_bell: ['.head__action.notice--icon', '.head__action.open--notice', '.head__action--notice', '.notice--icon'],
        nocub_premium: ['.head__action.halloween__button', '.halloween__button', 'body > .halloween', '.halloween', '.head__action[class*="halloween"]', '.head__action[class*="helloween"]', '.head [class*="premium"]', '.head__action[data-action*="premium"]', '.head__action.open--premium', '.open--premium', '.head [class*="cub-premium"]', '.menu__item[data-action="premium"]', '.settings-folder[data-component="premium"]'],
        nocub_account: ['.menu__item[data-action="account"]', '.settings-folder[data-component="account"]', '.head__action.open--profile'],
        nocub_subscribe: ['.button--subscribe', '.full-start__button.view--subscribe'],
        nocub_shots: ['.shots-view-button', '.shots-player-button', '.shots-player-segments', '.shots-player-recorder', '.settings-folder[data-component="shots"]'],
        nocub_promo: []
    };
    var PROMO_RE = new RegExp('(^|\\s)(?:' + PROMO.join('|') + ')');
    function scanPromo() {
        var els = document.querySelectorAll('.head [class], .menu [class], .wrap__left [class], body > [class]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i], c = el.getAttribute('class') || '';
            if (c.indexOf('nocub-hide') >= 0 && el.getAttribute('data-nocub')) continue;
            if (PROMO_RE.test(c)) mark(el, 'nocub_promo');
        }
    }
    var HIDE = '{display:none !important}';
    var lastCss = null;
    function css() {
        var out = '';
        Object.keys(CSS).forEach(function (k) {
            if (!on(k) || !CSS[k].length) return;
            out += CSS[k].map(function (s) { return 'body.' + k + ' ' + s; }).join(',') + HIDE;
        });
        return out + '.nocub-hide' + HIDE;
    }

    var TEXT = [
        { key: 'nocub_premium', sel: '.head .head__action', html: /premium|преміум|премиум|halloween|helloween|хелоуін|хэллоуин/i },
        { key: 'nocub_premium', sel: '.menu .menu__item', re: /преміум|премиум|premium|запроси|пригласи|invite/i },
        { key: 'nocub_account', sel: '.menu .menu__item', re: /(увійти|войти|login|sign in).{0,12}cub|cub.{0,12}(акаунт|аккаунт|account)/i },
        { key: 'nocub_account', sel: '.settings-folder', re: /cub.{0,12}(акаунт|аккаунт|account)|(акаунт|аккаунт|account).{0,12}cub/i },
        { key: 'nocub_shots', sel: '.menu .menu__item', re: /^\s*shots\s*$/i },
        { key: 'nocub_shots', sel: '.selectbox-item, .selectbox__item, .menu__item', re: /^\s*(shots|шотс)\b/i },
        { key: 'nocub_shots', sel: '.items-line', re: /^\s*shots\b/i, title: true },
        { key: 'nocub_subscribe', sel: '.full-start-new__buttons .full-start__button, .full-start__buttons .full-start__button', re: /підписат|подписат|subscribe/i },
        { key: 'nocub_reviews', sel: '.items-line', re: /^\s*(коментар|комментар|відгук|отзыв|comments|reviews)/i, title: true },
        { key: 'nocub_meta', sel: '.items-line', re: /^\s*(метадан|метаданн|metadata|настро|настроен|moods?\b)/i, title: true, onlyFull: true },
        { key: 'nocub_recs', sel: '.items-line', re: /^\s*(рекомендац|рекомендаці|схож|similar|recommendations)/i, title: true, onlyFull: true }
    ];

    function mark(el, key) {
        if (el.closest && el.closest('.full-start-new__buttons, .full-start__buttons')) return;
        el.classList.add('nocub-hide');
        el.setAttribute('data-nocub', key);
        if (el.classList.contains('selector')) { el.classList.remove('selector'); el.setAttribute('data-nocub-sel', '1'); }
        if (el.classList.contains('focus')) el.classList.remove('focus');
    }
    function unmark(el) {
        el.classList.remove('nocub-hide');
        el.removeAttribute('data-nocub');
        if (el.getAttribute('data-nocub-sel')) { el.classList.add('selector'); el.removeAttribute('data-nocub-sel'); }
    }
    function scanCss() {
        Object.keys(CSS).forEach(function (k) {
            if (!CSS[k].length) return;
            var active = on(k);
            var sel = active ? CSS[k].join(',') : '[data-nocub="' + k + '"]';
            var els;
            try { els = document.querySelectorAll(sel); } catch (e) { return; }
            for (var i = 0; i < els.length; i++) {
                var el = els[i];
                if (active) { if (!el.classList.contains('nocub-hide') || el.getAttribute('data-nocub') !== k) mark(el, k); }
                else if (el.getAttribute('data-nocub') === k) unmark(el);
            }
        });
    }
    function fixSettingsFocus() {
        var root = document.querySelector('.settings');
        if (!root) return;
        var now = Date.now();
        if (now - (fixSettingsFocus.t || 0) < 1000) return;
        if (!root.querySelector('.nocub-hide, [data-nocub-sel], .selector')) return;
        fixSettingsFocus.t = now;
        var changed = false, els = root.querySelectorAll('.selector, [data-nocub-sel="auto"]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i], hidden = getComputedStyle(el).display === 'none';
            if (hidden && el.classList.contains('selector')) {
                el.classList.remove('selector');
                el.classList.remove('focus');
                el.setAttribute('data-nocub-sel', 'auto');
                changed = true;
            } else if (!hidden && el.getAttribute('data-nocub-sel') === 'auto') {
                el.classList.add('selector');
                el.removeAttribute('data-nocub-sel');
                changed = true;
            }
        }
        var hasFocus = false, fl = root.querySelectorAll('.selector.focus');
        for (var f = 0; f < fl.length; f++) if (getComputedStyle(fl[f]).display !== 'none') hasFocus = true;
        if (changed && !hasFocus) {
            var first = null, all = root.querySelectorAll('.selector');
            for (var j = 0; j < all.length; j++) if (getComputedStyle(all[j]).display !== 'none') { first = all[j]; break; }
            var C = window.Lampa && Lampa.Controller, name = '';
            try { name = C.enabled().name || ''; } catch (e) {}
            if (C && /settings/i.test(name)) {
                if (first && C.collectionFocus) { try { C.collectionFocus(first, root); } catch (e) {} }
            }
        }
    }
    function keepList() {
        var v = String(Lampa.Storage.get('nocub_keep', '') || '');
        return v.split(/[,\s]+/).filter(Boolean);
    }
    function scanStrict() {
        var active = on('nocub_strict'), keep = keepList();
        var els = document.querySelectorAll('.head .head__action');
        for (var i = 0; i < els.length; i++) {
            var el = els[i], cn = String(el.className);
            var known = KNOWN_HEAD.test(cn) || keep.some(function (k) { return cn.indexOf(k) >= 0; });
            if (active && !known) { if (el.getAttribute('data-nocub') !== 'nocub_strict') mark(el, 'nocub_strict'); }
            else if (el.getAttribute('data-nocub') === 'nocub_strict') unmark(el);
        }
    }
    function anyOn() { return ITEMS.some(function (it) { return on(it.key); }); }
    function scan() {
        var any = anyOn();
        if (any) safe(fixSettingsFocus);
        if (!any && !document.querySelector('.nocub-hide')) return;
        scanCss();
        scanPromo();
        scanStrict();
        TEXT.forEach(function (rule) {
            var active = on(rule.key);
            var els = document.querySelectorAll(active ? rule.sel : '[data-nocub="' + rule.key + '"]');
            for (var i = 0; i < els.length; i++) {
                var el = els[i], hit = false;
                if (active) {
                    var txt;
                    if (rule.html) {
                        hit = rule.html.test(el.outerHTML.slice(0, 600));
                    } else {
                        if (rule.title) {
                            var t = el.querySelector('.items-line__title');
                            txt = t ? t.textContent : '';
                        } else txt = el.textContent;
                        hit = !!txt && rule.re.test(txt.slice(0, 80));
                    }
                    if (hit && el.classList.contains('lmx-uacr')) hit = false;
                    if (hit && rule.onlyFull && !document.querySelector('.activity--active .full-start-new, .activity--active .full-start')) hit = false;
                }
                if (hit) mark(el, rule.key);
                else if (el.getAttribute('data-nocub') === rule.key) unmark(el);
            }
        });
    }

    function shotsRow() {
        var key = 'content_rows_shots_main', cur = Lampa.Storage.get(key, 'true'), mine = Lampa.Storage.get('nocub_shots_rowoff', false);
        if (on('nocub_shots')) {
            if (cur === true || cur === 'true') { Lampa.Storage.set(key, false); Lampa.Storage.set('nocub_shots_rowoff', true); }
        } else if (mine === true || mine === 'true') {
            Lampa.Storage.set(key, true); Lampa.Storage.set('nocub_shots_rowoff', false);
        }
    }
    function applyBody() {
        safe(shotsRow);
        var c = css(), st = document.getElementById('nocub-css');

        if (st && c !== lastCss) { st.textContent = c; lastCss = c; }
        ITEMS.forEach(function (it) { document.body.classList.toggle(it.key, on(it.key)); });
        document.body.classList.toggle('nocub_bell', on('nocub_bell'));
    }

    window.__nocubApply = function () { setTimeout(function () { safe(applyBody); safe(scan); }, 50); };
    var timer = 0;
    function schedule() {
        clearTimeout(timer);
        timer = setTimeout(function () { safe(applyBody); safe(scan); }, 300);
    }

    function addSettings() {
        var S = Lampa.SettingsApi;
        if (!S || !S.addComponent) return;
        S.addComponent({
            component: 'nocub', name: 'NoCub',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
        });
        S.addParam({ component: 'nocub', param: { name: 'nocub_t', type: 'title', default: '' }, field: { name: 'Скрыть элементы CUB' } });
        S.addParam({
            component: 'nocub', param: { name: 'lmx_bell_mode', type: 'select', values: { lmx: 'Наш «Новые серии» (LMX)', cub: 'Стандартный (CUB)', none: 'Скрыть оба' }, default: 'lmx' },
            field: { name: 'Колокольчик в шапке', description: 'Какой колокольчик показывать: наш со списком новых серий, стандартный CUB или никакой' },
            onChange: function () { setTimeout(function () { safe(applyBody); safe(scan); }, 50); }
        });
        ITEMS.forEach(function (it) {
            if (it.key === 'nocub_promo' || it.key === 'nocub_strict' || it.key === 'nocub_reviews' || it.key === 'nocub_meta' || it.key === 'nocub_recs') return;
            S.addParam({
                component: 'nocub', param: { name: it.key, type: 'trigger', default: !!it.def },
                field: { name: it.name, description: it.desc },
                onChange: function () { setTimeout(function () { safe(applyBody); safe(scan); }, 50); }
            });
        });
        S.addParam({ component: 'nocub', param: { name: 'nocub_v', type: 'title', default: '' }, field: { name: 'NoCub v' + VERSION + ' · только скрывает элементы, ничего не удаляет' } });
    }

    function isHiddenBlock(el) {
        if (!el) return true;
        if (el.classList.contains('nocub-hide') || el.classList.contains('lmx-nocomm') || el.closest('.nocub-hide')) return true;
        if (el.classList.contains('items-line')) {
            if (el.querySelector('.full-review-add') && !el.querySelector('.full-review')) { el.classList.add('lmx-nocomm'); return true; }
            var t = el.querySelector('.items-line__title'), txt = t ? t.textContent.slice(0, 80) : '';
            if (txt) {
                for (var i = 0; i < TEXT.length; i++) {
                    var r = TEXT[i];
                    if (r.sel === '.items-line' && r.title && r.re && on(r.key) && r.re.test(txt) && !el.classList.contains('lmx-uacr')) { mark(el, r.key); return true; }
                }
            }
        }
        return el.offsetParent === null;
    }
    function deadBlock(item) {
        var el = null;
        try { el = item.render(true); } catch (x) {}
        if (!el || isHiddenBlock(el)) return true;
        var sel = el.querySelectorAll('.selector');
        for (var i = 0; i < sel.length; i++) if (sel[i].offsetParent !== null) return false;
        return true;
    }
    function hookFull(e) {
        if (!e || e.type !== 'build' || !e.link) return;
        var link = e.link;
        if (link.__nocubNav || typeof link.use !== 'function' || !Array.isArray(link.items)) return;
        link.__nocubNav = 1;
        function find(d, guard) {
            var items = link.items, i = link.active + d;
            while (i >= 0 && i < items.length && deadBlock(items[i])) i += d;
            if (d > 0 && i >= items.length && guard < 20 && link.rows && items.length < link.rows.length) {
                var before = items.length, keep = link.active;
                link.active = items.length - 1;
                try { link.emit('scroll', 0); } catch (x) {}
                if (link.items.length > before) return find(d, guard + 1);
                link.active = keep;
            }
            return i;
        }
        function go(d) {
            var cur = link.active, items = link.items, i = find(d, 0);
            items = link.items;
            if (i < 0) {
                link.active = 0;
                var ok = false;
                try { Lampa.Controller.toggle('head'); ok = true; } catch (x) {}
                if (!ok && items[0]) items[0].toggle();
                return;
            }
            if (i >= items.length) i = Math.min(Math.max(cur, 0), items.length - 1);
            link.active = i;
            if (items[i]) items[i].toggle();
        }
        link.use({
            onlyDown: function () { go(1); },
            onlyUp: function () { go(-1); }
        });
    }

    function start() {
        safe(function () {
            Lampa.Listener.follow('full', function (e) { safe(function () { hookFull(e); }); });
        });
        safe(function () {
            var st = document.createElement('style');
            st.id = 'nocub-css';
            st.textContent = lastCss = css();
            document.head.appendChild(st);
        });
        safe(addSettings);
        safe(applyBody);
        safe(scan);
        safe(function () {
            new MutationObserver(function (muts) {
                for (var i = 0; i < muts.length; i++) {
                    var add = muts[i].addedNodes;
                    for (var k = 0; k < add.length; k++) {
                        var n = add[k];
                        if (n.nodeType !== 1) continue;
                        var nc = typeof n.className === 'string' ? n.className : '';
                        if (n.classList && (n.classList.contains('card') || n.classList.contains('torrent-item'))) continue;
                        if (/(^|\s)lmx-(endpad|cin|tr|box|dots|pill|tintbg|hist|logo|info|descr)/.test(nc) || n.id === 'lmx-tintbg') continue;
                        schedule(); return;
                    }
                }
            }).observe(document.body, { childList: true, subtree: true });
        });
        safe(function () {
            Lampa.Listener.follow('full', schedule);
            Lampa.Listener.follow('activity', schedule);
            if (Lampa.Settings && Lampa.Settings.listener) Lampa.Settings.listener.follow('open', function () { safe(applyBody); safe(scan); });
        });
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });
})();
