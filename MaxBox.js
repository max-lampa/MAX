/*
 * VisionMax v8.6-ru — оформление Lampa: главная страница, стриминги, темы и страницы фильмов
 *  1) Главная: баннер, стриминги, «Сегодня на…», подборки по настроению, TMDB, украинские фильмы и сериалы,
 *     история и «Похожее на просмотренное»; порядок и видимость рядов можно настроить
 *  2) Карточки: название, жанр, рейтинг и год на постере, номер серии, метки «Новая серия» / «Сегодня» / «Премьера» / «Скоро»
 *  3) Три темы: стандартная (VisionMax), HBO Max и Apple TV
 *  4) Страница фильма: кинематографичное оформление, логотип вместо названия, длительность и статус
 *  Настройки: Lampa → Настройки → VisionMax
 *
 * Структура файла (сверху вниз):
 *  настройки → ряды → порядок рядов → настройки плагина → страницы стриминговых сервисов
 *  → баннер и плитки сервисов → карточки и метки → CSS (основа, темы HBO и Apple TV)
 *  → поиск данных карточек → оформление постеров → страницы фильмов → запуск
 */
(function () {
    'use strict';

    // ===== НАСТРОЙКИ (Lampa.Storage) =====
    function getBool(name, def) {
        var v = Lampa.Storage.get(name, def ? 'true' : 'false');
        return v === true || v === 'true';
    }
    function getStr(name, def) {
        return String(Lampa.Storage.get(name, def));
    }
    function readJson(key) {
        var v = Lampa.Storage.get(key, '[]');
        if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) { v = []; } }
        return Array.isArray(v) ? v : [];
    }
    function safe(fn) {
        try { fn(); } catch (e) { console.error('VisionMax', e); }
    }

    var RGB = { green: '46,158,91', orange: '224,123,32', blue: '48,112,220', red: '192,57,43', purple: '130,80,200', gray: '110,110,120' };
    var COLORS = {};
    Object.keys(RGB).forEach(function (k) { COLORS[k] = 'rgba(' + RGB[k] + ',.94)'; });
    function rgba(name, a) { return 'rgba(' + (RGB[name] || RGB.orange) + ',' + a + ')'; }
    var COLOR_NAMES = { green: 'Зелёный', orange: 'Оранжевый', blue: 'Синий', red: 'Красный', purple: 'Фиолетовый', gray: 'Серый' };
    var SIZES = { s: 0.8, m: 0.95, l: 1.1, xl: 1.25 };
    var SIZE_NAMES = { s: 'Маленький', m: 'Средний', l: 'Большой', xl: 'Очень большой' };

    // ===== РЯДЫ ГЛАВНОЙ =====
    function dayStr(offset) {
        var d = new Date(Date.now() + offset * 86400000);
        var m = d.getMonth() + 1, dd = d.getDate();
        return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
    }
    function market() { return getBool('lmx_market', true); }
    var WATCH = 'watch_region=UA&with_watch_monetization_types=flatrate%7Cfree%7Cads%7Crent%7Cbuy';
    // Украинские подборки: учитываем совместное производство и доступность контента в Украине.
    // Провайдеры определяются по каталогу TMDB, затем добавляются новые украинские проекты.
    var UA_PROV_RE = /megogo|netflix|kyivstar|киевстар|vodafone|водафон|sweet|oll\.?tv|takflix|apple tv|amazon prime|prime video|disney|max|hbo/i;
    // Идентификаторы украинских студий ищутся в TMDB по названию.
    var UA_STUDIOS = ['Film.UA', '1+1 Media', 'Starlight Media', 'Kyivstar', 'Megogo', 'Plus Plus Studio', 'Dzyga', 'Radar Media', 'Gloria Pictures', '1+1 Ukraine', 'STB', 'ICTV', 'Novy Channel', '2+2', 'Inter Media', 'TRK Ukraina', 'Oll.TV', 'Sweet.tv'];
    function uaStudioIds(done) {
        var left = UA_STUDIOS.length, ids = [];
        UA_STUDIOS.forEach(function (n) {
            tget('search/company', { query: n, page: 1 }, function (j) {
                var key = n.toLowerCase().replace(/[^a-z0-9+]/g, '');
                var hit = ((j && j.results) || []).filter(function (c) { return c && String(c.name || '').toLowerCase().replace(/[^a-z0-9+]/g, '').indexOf(key) === 0; })[0];
                if (hit && ids.indexOf(hit.id) < 0) ids.push(hit.id);
                if (--left === 0) done(ids);
            }, function () { if (--left === 0) done(ids); });
        });
    }
    function this_row(n) { for (var i = 0; i < ROWS.length; i++) if (ROWS[i].name === n) return ROWS[i]; return { title: '' }; }
    function uaCall(row, kind) {
        return function (call) {
            var dateKey = kind === 'movie' ? 'primary_release_date' : 'first_air_date';
            var today = dayStr(0), from3 = dayStr(-365 * 3), from6 = dayStr(-365 * 6);
            var base = 'discover/' + kind + '?';
            function fetchAll(urls, done) {
                var tasks = [];
                urls.forEach(function (u) { tasks.push([u, 1]); tasks.push([u, 2]); });
            var left = tasks.length, out = [];
                done.totals = {};
                tasks.forEach(function (t, i) {
                    tget(t[0], { page: t[1] }, function (j) {
                        if (j && j.total_results) done.totals[t[0]] = j.total_results;
                        out[i] = cleanResults(j && j.results, true).filter(function (c) { return c.poster_path && c.overview && String(c.overview).trim(); });
                        if (--left === 0) done(out);
                    }, function () { out[i] = []; if (--left === 0) done(out); });
                });
            }
            function dateOf(c) { return String(c.release_date || c.first_air_date || ''); }
            function build(ids, cids) {
                var recent = base + 'with_original_language=uk&vote_count.gte=3&' + dateKey + '.gte=' + from6 + '&' + dateKey + '.lte=' + today + '&sort_by=' + dateKey + '.desc';
                var fresh = [];
                if (ids.length) {
                    var pv = 'with_watch_providers=' + ids.join('%7C') + '&watch_region=UA&with_watch_monetization_types=flatrate%7Cfree%7Cads&' + dateKey + '.gte=' + from3 + '&' + dateKey + '.lte=' + today + '&sort_by=' + dateKey + '.desc&';
                    fresh.push(base + pv + 'with_original_language=uk');
                    fresh.push(base + pv + 'with_origin_country=UA');
                }
                if (cids && cids.length) fresh.push(base + 'with_companies=' + cids.join('%7C') + '&vote_count.gte=1&' + dateKey + '.gte=' + from3 + '&' + dateKey + '.lte=' + today + '&sort_by=' + dateKey + '.desc');
                fresh.push(recent);
                var from10 = dayStr(-365 * 10);
                fresh.push(base + 'with_original_language=uk&vote_count.gte=1&' + dateKey + '.gte=' + from10 + '&' + dateKey + '.lte=' + today + '&sort_by=' + dateKey + '.desc');
                fresh.push(base + 'with_origin_country=UA&vote_count.gte=1&' + dateKey + '.gte=' + from10 + '&' + dateKey + '.lte=' + today + '&sort_by=' + dateKey + '.desc');
                fresh.push(base + 'with_origin_country=UA&vote_count.gte=3&' + dateKey + '.gte=' + from6 + '&' + dateKey + '.lte=' + today + '&sort_by=popularity.desc');
                var cb = function (parts) {
                    var all = [], seen = {};
                    parts.forEach(function (part) {
                        (part || []).forEach(function (c) { if (!seen[c.id]) { seen[c.id] = 1; c.media_type = kind; all.push(c); } });
                    });
                    all = all.filter(function (c) { return dateOf(c) && dateOf(c) <= today; });
                    all.sort(function (a, b) { return dateOf(b).localeCompare(dateOf(a)); });
                    all = all.slice(0, 20);
                    if (!all.length) return call();
                    // Кнопка «Ещё» открывает одну выборку TMDB с наибольшим числом результатов.
                    var wideUrl = recent, best = 0, tot = cb.totals || {};
                    fresh.forEach(function (u) { if ((tot[u] || 0) > best) { best = tot[u]; wideUrl = u; } });
                    call({ title: row.title, results: all, url: wideUrl, source: 'tmdb', page: 1, more: true, total_pages: 2 });
                };
                fetchAll(fresh, cb);
            }
            tget('watch/providers/' + kind + '?watch_region=UA', {}, function (j) {
                var ids = [];
                ((j && j.results) || []).forEach(function (p) { if (p && p.provider_name && UA_PROV_RE.test(p.provider_name)) ids.push(p.provider_id); });
                uaStudioIds(function (cids) { build(ids.slice(0, 20), cids); });
            }, function () { uaStudioIds(function (cids) { build([], cids); }); });
        };
    }
    // Для украинского рынка показываем доступное в Украине; при отключении фильтра оставляем исходную выдачу.
    function mkt(url, kind) {
        if (!market()) return [url];
        if (kind === 'movie') return [url + (url.indexOf('?') < 0 ? '?' : '&') + 'region=UA'];
        if (kind === 'tv') {
            return ['discover/tv?sort_by=popularity.desc&' + WATCH + '&air_date.gte=' + dayStr(-60) + '&air_date.lte=' + dayStr(30), url];
        }
        return [url];
    }
    // Индекс — запасное значение; порядок задаётся в разделе «Порядок главной».
    var ROWS = [
        { name: 'LmxPopularMovies', title: 'Популярные фильмы',    urls: function () { return mkt('movie/popular', 'movie'); },     index: 13 },
        { name: 'LmxNowPlaying',    title: 'Сейчас в кинотеатрах', urls: function () { return mkt('movie/now_playing', 'movie'); }, index: 14 },
        { name: 'LmxUpcoming',      title: 'Скоро в прокате',      urls: function () { return mkt('movie/upcoming', 'movie'); },    index: 15 },
        { name: 'LmxTopMovies',     title: 'Лучшие фильмы',        urls: function () { return mkt('movie/top_rated', 'movie'); },   index: 16 },
        { name: 'LmxPopularTv',     title: 'Популярные сериалы',   urls: function () { return mkt('tv/popular', 'tv'); },           index: 17 },
        { name: 'LmxUaMovies',      title: 'Украинское кино',      custom: function () { return uaCall(this_row('LmxUaMovies'), 'movie'); }, index: 18 },
        { name: 'LmxUaTv',          title: 'Украинские сериалы',   custom: function () { return uaCall(this_row('LmxUaTv'), 'tv'); }, index: 19 },
        { name: 'LmxHistory',       title: 'История просмотров',   custom: historyCall, index: 20 },
        { name: 'LmxRecs',          title: 'Похожее на просмотренное', custom: function () { return recsCall(this); }, index: 21 }
    ];

    // Стриминговые сервисы (идентификаторы провайдеров TMDB) и подборки по настроению.
    var SERVICES = [
        ['netflix', 'Netflix', 8], ['apple', 'Apple TV+', 350], ['hbo', 'HBO / Max', 1899],
        ['amazon', 'Prime Video', 119], ['disney', 'Disney+', 337], ['paramount', 'Paramount+', 531],
        ['sky', 'SkyShowtime', 1773]
    ];
    var MOODS = [
        ['relax', 'Расслабиться', '35%7C10751'],
        ['think', 'Подумать', '9648%7C878'],
        ['adrenaline', 'Адреналин', '28%7C53'],
        ['romance', 'Романтика', '10749'],
        ['scary', 'Страшное', '27'],
        ['friends', 'С друзьями', '12%7C35']
    ];
    ROWS.unshift(
        { name: 'LmxHero', title: 'Афиша', index: -2, custom: function () { return heroCall(this); } },
        { name: 'LmxStudios', title: 'Стриминги', index: -1, custom: function () { return studioCall(this); } }
    );
    var n0 = 30;
    SERVICES.forEach(function (x) {
        ROWS.push({ name: 'LmxSvc_' + x[0], title: 'Сегодня на ' + x[1], index: n0++,
            custom: function () { return serviceCall(this, x[0]); } });
    });
    MOODS.forEach(function (x) {
        ROWS.push({ name: 'LmxMood_' + x[0], title: 'По настроению: ' + x[1], index: n0++,
            urls: function () { return ['discover/movie?with_genres=' + x[2] + '&vote_count.gte=300&sort_by=popularity.desc' + (market() ? '&region=UA' : '')]; } });
    });

    var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';

    // ===== ПОРЯДОК РЯДОВ ГЛАВНОЙ =====
    var seen = {};          // Ряды, добавленные через ContentRows.add после установки перехвата.
    var diag = { patched: false, addCount: 0, lastTotal: 0, lastTagged: 0 };

    var stats = {};         // Количество карточек, возвращённых рядом при последней загрузке главной.

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
        return stats[n] === 0 ? 'пусто (нет карточек)' : stats[n] + ' карточек';
    }

    // Порядок по умолчанию, пока пользователь не изменил его самостоятельно.
    var DEFAULT_ORDER = ['LmxHero', 'LmxStudios', 'LmxPopularMovies', 'LmxSvc_hbo', 'LmxPopularTv', 'LmxSvc_apple', 'LmxHistory', 'LmxNowPlaying',
        'LmxSvc_netflix', 'LmxSvc_amazon', 'LmxUaMovies', 'LmxUaTv', 'LmxRecs', 'LmxSvc_disney', 'LmxSvc_paramount', 'LmxTopMovies', 'LmxUpcoming',
        'LmxMood_relax', 'LmxMood_adrenaline', 'LmxMood_think', 'LmxMood_romance', 'LmxMood_friends', 'LmxMood_scary', 'LmxSvc_sky'];

    function allRows() {
        var map = {}, list = [];
        function put(n, t, src) {
            if (!map[n]) { map[n] = { name: n, title: t, src: src }; list.push(n); }
        }
        ROWS.forEach(function (r) { put(r.name, r.title, 'VisionMax'); });
        // Стандартные ряды и ряды других плагинов показываем, только если они не скрыты и содержат карточки.
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
        a.list.forEach(function (n) { if (saved.indexOf(n) < 0) saved.push(n); });
        return saved;
    }
    function getHidden() {
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

    // При регистрации ряда задаём его порядок, при необходимости скрываем и отмечаем его вызов.
    function adoptRow(row) {
        if (!row || !row.name) return;
        diag.addCount++;
        seen[row.name] = { title: row.title };
        var r = rankOf(row.name);
        if (r >= 0) row.index = r;
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
    // Если Lampa добавляет ряды после фильтрации, оставляем только разрешённые.
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
    // После построения списка расставляем ряды в заданном порядке независимо от значения index в Lampa.
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
                    var res = origCall.apply(this, arguments);
                    safe(function () { reorderCalls(screen, calls); });
                    return res;
                };
            }
            CR.__lmxPatched = true;
            diag.patched = true;
        } catch (e) { console.error('VisionMax patch', e); }
    }

    // ===== ЭКРАН «ПОРЯДОК ГЛАВНОЙ» =====
    var lastPicked = null;

    function saveOrder(order) { Lampa.Storage.set('lmx_order', order); }
    function saveHidden(h) { Lampa.Storage.set('lmx_hidden', h); }
    function notifySaved() {
        if (Lampa.Noty) Lampa.Noty.show('Сохранено. Вернитесь на главную или перезапустите Lampa.');
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

        // Не перестраиваем список и не меняем коллекцию контроллера — перемещаем существующие ряды,
        // чтобы не нарушать прокрутку, которой управляет Lampa.
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


    // ===== СТРАНИЦА НАСТРОЕК =====
    function addSettings() {
        var S = Lampa.SettingsApi;
        if (!S || !S.addComponent) return;

        // Одна страница настроек с разделами.
        S.addComponent({ component: 'lmx', name: 'VisionMax', icon: ICON });

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
        var restart = function () { if (Lampa.Noty) Lampa.Noty.show('Перезапустите Lampa, чтобы применить изменения.'); };
        var restyle = function () { setTimeout(function () { safe(applyStyle); }, 80); };
        var rebuild = function () { setTimeout(function () { safe(applyStyle); safe(resetCards); }, 80); };

        var H = mk('lmx');

        // ---- Внешний вид ----
        H.title('lmx_t_look', 'Внешний вид');
        H.select('lmx_theme', { 'default': 'Стандартная (VisionMax)', hbo: 'HBO Max', apple: 'Apple TV' }, 'default', 'Тема',
            'Меняет оформление карточек, баннера, меню и страницы фильма. HBO Max — чёрная тема с белой подсветкой, Apple TV — минималистичная серая. Фон и панели интерфейса подстраиваются под тему. Страница фильма обновится при следующем открытии.', restyle);
        H.select('lmx_card_size', { m: 'Стандартные', l: 'Немного больше', xl: 'Большие' }, 'm', 'Размер карточек', 'Ширина постеров в рядах.', restyle);
        H.select('lmx_size', SIZE_NAMES, 'm', 'Размер надписей на карточках', 'Метки, номер серии и рейтинг на постере.', restyle);
        H.select('lmx_logo_size', { s: 'Меньше', m: 'Обычный', l: 'Больше', xl: 'Максимальный' }, 'm', 'Размер логотипа на странице фильма', 'Изменяет размер логотипа в шапке фильма или сериала.', restyle);

        // ---- Главная ----
        H.title('lmx_t_home', 'Главная страница');
        H.button('lmx_order_btn', 'Порядок и видимость рядов', 'Перемещайте и скрывайте афишу, стриминги и любые подборки.', openOrderModal);
        H.trigger('lmx_only_mine', true, 'Только подборки VisionMax', 'Скрывает стандартные ряды Lampa и ряды других плагинов. Применяется при возвращении на главную.', null);

        H.select('lmx_hero_hype', { '0': 'Не показывать', '14': 'За 2 недели', '30': 'За месяц', '60': 'За 2 месяца' }, '30', 'Громкие премьеры в афише',
            'Только самые ожидаемые фильмы и сериалы, которые скоро выйдут или недавно вышли. Помечаются как «Скоро» или «Уже вышел». Применяется после перезапуска.', restart);

        // ---- Фильтры ----
        H.title('lmx_t_filters', 'Фильтры');
        H.trigger('lmx_market', true, 'Только с русским описанием', 'Скрывает фильмы и сериалы без описания на русском языке и подбирает контент, доступный в Украине. Применяется после перезапуска.', restart);
        H.select('lmx_min_rating', { '0': 'Не скрывать', '3': 'Оценка 1–2', '4': 'Ниже 4', '5': 'Ниже 5' }, '3', 'Скрывать фильмы и сериалы с низкой оценкой', 'Убирает из рядов контент с низким рейтингом. Применяется после перезапуска.', restart);

        // ---- Метки ----
        H.title('lmx_t_marks', 'Метки на карточках');
        H.trigger('lmx_marks', true, 'Показывать метки', '«Новая серия» и «Сегодня» — для сериалов, «Премьера» — для новых фильмов, «Скоро» — для будущих релизов.', rebuild);
        H.select('lmx_c_next', COLOR_NAMES, 'orange', 'Цвет: новая серия и «Сегодня»', 'Только в стандартной теме; в HBO Max и Apple TV цвета заданы темой.', restyle);
        H.select('lmx_c_soon', COLOR_NAMES, 'blue', 'Цвет: скоро и ожидается', 'Только в стандартной теме.', restyle);
        H.select('lmx_c_done', COLOR_NAMES, 'green', 'Цвет: «Вышел» и «Завершён»', 'Статус над кнопками на странице фильма, только в стандартной теме.', restyle);
        H.trigger('lmx_progress', true, 'Показывать прогресс просмотра', 'Красная полоса на карточках, эпизодах и совместимых списках торрентов.', rebuild);

        // ---- Страница фильма ----
        H.title('lmx_t_page', 'Страница фильма');
        H.trigger('lmx_full', true, 'Кинематографичное оформление страницы', 'Полноэкранный затемнённый фон, крупный заголовок и описание. На телефонах сохраняется стандартная страница Lampa.', restyle);
        H.trigger('lmx_logo', true, 'Логотип вместо названия', 'Официальный логотип из TMDB; год и страна показываются перед длительностью. Если логотипа нет, отображается обычное название.', restyle);
        H.trigger('lmx_btn_compact', true, 'Компактные кнопки', 'Подписи есть у первых трёх кнопок и у выбранной. В HBO Max и Apple TV кнопки всегда компактные.', restyle);
        H.trigger('lmx_info', true, 'Длительность и статус', 'Строка над кнопками: «1 ч 45 мин», «Вышел», «Следующая серия: завтра (С2Е5)». Применяется при следующем открытии.', null);

        H.title('lmx_t_ver', 'VisionMax · версия ' + VERSION);
    }

    // ===== РЯДЫ НА ГЛАВНОЙ =====
    var rowsStarted = false;

    // Прогресс просмотра берётся из данных Lampa (file_view / Timeline). Если данных нет, полоса не показывается.
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
    function watchProgress(c) {
        try {
            if (!c || !Lampa.Utils || !Lampa.Utils.hash) return null;
            var serial = typeOf(c) === 'tv';
            var name = serial
                ? (c.original_name || c.original_title || c.name || c.title || '')
                : (c.original_title || c.title || c.original_name || c.name || '');
            if (!name) return null;
            var fv = fileViews();
            var get = function (h) {
                if (fv && fv[h]) return fv[h];
                return Lampa.Timeline && Lampa.Timeline.view ? Lampa.Timeline.view(h) : null;
            };
            if (!serial) {
                var pm = pctOf(get(Lampa.Utils.hash(name)));
                return pm > 0 ? { pct: pm } : null;
            }
            var seasons = Math.min(20, Number(c.number_of_seasons) || (c.seasons && c.seasons.length) || 12), best = null;
            for (var sn = 1; sn <= seasons; sn++) {
                for (var ep = 1; ep <= 40; ep++) {
                    var pe = pctOf(get(Lampa.Utils.hash([sn, sn > 10 ? ':' : '', ep, name].join(''))));
                    if (pe > 0) best = { pct: pe, s: sn, e: ep };
                }
            }
            return best;
        } catch (e) { return null; }
    }

    function addProgressBar(container, pct, className) {
        pct = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
        if (!container || !pct || pct >= 95 || !getBool('lmx_progress', true) ||
            container.querySelector('.lmx-progress,.lmx-episode-progress')) return;
        var bar = document.createElement('div');
        bar.className = className || 'lmx-progress';
        bar.setAttribute('role', 'progressbar');
        bar.setAttribute('aria-valuemin', '0');
        bar.setAttribute('aria-valuemax', '100');
        bar.setAttribute('aria-valuenow', String(pct));
        bar.innerHTML = '<i style="width:' + pct + '%"></i>';
        container.appendChild(bar);
    }

    function episodeProgress(media, episode) {
        try {
            if (!media || !episode || !Lampa.Utils || !Lampa.Utils.hash) return 0;
            var d = getData(episode) || {};
            var season = Number(d.season_number || d.season || 0);
            var number = Number(d.episode_number || d.episode || 0);
            if (!season || !number) {
                var match = String(episode.textContent || '').match(/[sс]\s*(\d{1,2})\s*[eе]\s*(\d{1,3})/i);
                if (match) { season = season || Number(match[1]); number = number || Number(match[2]); }
            }
            if (!number) return 0;
            var name = media.original_name || media.original_title || media.name || media.title || '';
            if (!name) return 0;
            var hash = Lampa.Utils.hash([season, season > 10 ? ':' : '', number, name].join(''));
            var views = fileViews();
            var view = views && views[hash];
            if (!view && Lampa.Timeline && Lampa.Timeline.view) view = Lampa.Timeline.view(hash);
            return pctOf(view);
        } catch (e) { return 0; }
    }

    function decorateEpisodes(root, media) {
        if (!root || !root.find) return;
        root.find('.full-episode').each(function (i) {
            var el = this;
            var n = i + 1;
            el.setAttribute('data-lmx-epnum', n < 10 ? '0' + n : String(n));
            var pct = episodeProgress(media, el);
            if (pct > 0 && pct < 95) addProgressBar(el, pct, 'lmx-episode-progress');
        });
    }

    // Широкие карточки истории («Продолжить просмотр») с кадром и полосой прогресса.
    function histItem(m, prog) {
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
                        view.append('<div class="lmx-hist__shade"></div><div class="lmx-hist__text"><div class="lmx-hist__t">&#9654;&nbsp; ' + esc(m.title || m.name) +
                            '</div><div class="lmx-hist__m">' + (prog && prog.s ? '<span>С' + prog.s + ' Е' + prog.e + '</span>' : '') +
                            (v ? '<span style="color:' + ratingColor(v) + '">&#9734; ' + v.toFixed(1) + '</span>' : '') +
                            (year ? '<span>' + year + '</span>' : '') + '</div></div>' +
            (getBool('lmx_progress', true) && prog && prog.pct > 0 && prog.pct < 95 ? '<div class="lmx-hist__bar"><i style="width:' + prog.pct + '%"></i></div>' : ''));
                    });
                },
                onlyEnter: function () { openFull(m); }
            }
        };
        return it;
    }
    // Ряд истории просмотров Lampa — запасной вариант, если стандартный ряд не отображается.
    function historyCall() {
        return function (call) {
            var list = [];
            try { list = Lampa.Favorite.get({ type: 'history' }) || []; } catch (e) {}
            list = list.filter(function (c) { return c && c.id; }).slice(0, 20);
            if (!list.length) return call();
            {
                // Сначала — недосмотренное; порядок внутри групп остаётся от новых записей к старым.
                var withP = list.map(function (c) { return { c: c, p: watchProgress(c) }; });
                var part = withP.filter(function (x) { return x.p && x.p.pct < 95; });
                var rest = withP.filter(function (x) { return !(x.p && x.p.pct < 95); });
                list = part.concat(rest).map(function (x) { return histItem(x.c, x.p); });
            }
            call({ title: 'История просмотров', results: list, source: 'tmdb' });
        };
    }

    // Убираем карточки с низким рейтингом и без описания.
    function cleanResults(list, skipText) {
        var min = parseInt(getStr('lmx_min_rating', '3'), 10) || 0;
        var strict = market();
        return (list || []).filter(function (c) {
            if (!c) return false;
            if (min && c.vote_count > 2 && c.vote_average > 0 && c.vote_average < min) return false;
            if (strict && !skipText && !(c.overview && String(c.overview).trim())) return false;
            return true;
        });
    }

    // ===== СТРАНИЦЫ СТРИМИНГОВЫХ СЕРВИСОВ =====
    function prov(id) { return 'with_watch_providers=' + id + '&watch_region=UA&with_watch_monetization_types=flatrate'; }
    var PIPE = '%7C';
    // mf — фильтр для фильмов, tf — для сериалов; сети и студии точнее региональной доступности.
    var SVC = {
        hbo: { mf: 'with_companies=174' + PIPE + '49', tf: 'with_networks=49' + PIPE + '3186', extra: [
            { t: 'Оригинальные проекты Max', k: 'tv', q: 'with_networks=3186&sort_by=popularity.desc' },
            { t: 'Блокбастеры Warner Bros.', k: 'movie', q: 'with_companies=174&sort_by=revenue.desc&vote_count.gte=1000' },
            { t: 'Эпические миры (фэнтези)', k: 'tv', q: 'with_networks=49' + PIPE + '3186&with_genres=10765&sort_by=popularity.desc' },
            { t: 'Премиальные драмы', k: 'tv', q: 'with_networks=49&with_genres=18&without_genres=10765&sort_by=popularity.desc' },
            { t: 'Взрослая анимация', k: 'tv', q: 'with_networks=3186' + PIPE + '80&with_genres=16&sort_by=popularity.desc' },
            { t: 'Вселенная DC', k: 'movie', q: 'with_companies=174&with_keywords=9715&sort_by=release_date.desc&release_date.lte={today}' }
        ] },
        netflix: { mf: prov(8), tf: 'with_networks=213', extra: [
            { t: 'Фантастика и фэнтези', k: 'tv', q: 'with_networks=213&with_genres=10765&sort_by=popularity.desc' },
            { t: 'Криминал и триллеры', k: 'tv', q: 'with_networks=213&with_genres=80' + PIPE + '9648&sort_by=popularity.desc' },
            { t: 'Комедии', k: 'tv', q: 'with_networks=213&with_genres=35&sort_by=popularity.desc' },
            { t: 'Аниме и анимация', k: 'tv', q: 'with_networks=213&with_genres=16&sort_by=popularity.desc' },
            { t: 'Документальное кино', k: 'tv', q: 'with_networks=213&with_genres=99&sort_by=popularity.desc' }
        ] },
        apple: { mf: prov(350), tf: 'with_networks=2552', extra: [
            { t: 'Фантастика', k: 'tv', q: 'with_networks=2552&with_genres=10765&sort_by=popularity.desc' },
            { t: 'Комедии и доброе кино', k: 'tv', q: 'with_networks=2552&with_genres=35&sort_by=popularity.desc' },
            { t: 'Триллеры и детективы', k: 'tv', q: 'with_networks=2552&with_genres=9648' + PIPE + '80&sort_by=popularity.desc' },
            { t: 'Драмы', k: 'tv', q: 'with_networks=2552&with_genres=18&sort_by=popularity.desc' }
        ] },
        amazon: { mf: prov(119), tf: 'with_networks=1024', extra: [
            { t: 'Фантастика и фэнтези', k: 'tv', q: 'with_networks=1024&with_genres=10765&sort_by=popularity.desc' },
            { t: 'Боевики и триллеры', k: 'tv', q: 'with_networks=1024&with_genres=10759' + PIPE + '80&sort_by=popularity.desc' },
            { t: 'Комедии', k: 'tv', q: 'with_networks=1024&with_genres=35&sort_by=popularity.desc' },
            { t: 'Драмы', k: 'tv', q: 'with_networks=1024&with_genres=18&sort_by=popularity.desc' }
        ] },
        disney: { mf: 'with_companies=2' + PIPE + '3' + PIPE + '420' + PIPE + '1', tf: 'with_networks=2739', extra: [
            { t: 'Marvel', k: 'movie', q: 'with_companies=420&sort_by=popularity.desc' },
            { t: 'Звёздные войны', k: 'movie', q: 'with_companies=1&sort_by=popularity.desc' },
            { t: 'Pixar', k: 'movie', q: 'with_companies=3&sort_by=popularity.desc' },
            { t: 'Сериалы Marvel и «Звёздные войны»', k: 'tv', q: 'with_networks=2739&with_genres=10765&sort_by=popularity.desc' },
            { t: 'Анимация', k: 'tv', q: 'with_networks=2739&with_genres=16&sort_by=popularity.desc' }
        ] },
        paramount: { mf: 'with_companies=4', tf: 'with_networks=4330', extra: [
            { t: 'Paramount Pictures', k: 'movie', q: 'with_companies=4&sort_by=popularity.desc' },
            { t: 'Фантастика и фэнтези', k: 'tv', q: 'with_networks=4330&with_genres=10765&sort_by=popularity.desc' },
            { t: 'Драмы', k: 'tv', q: 'with_networks=4330&with_genres=18&sort_by=popularity.desc' },
            { t: 'Реалити', k: 'tv', q: 'with_networks=4330&with_genres=10764&sort_by=popularity.desc' }
        ] },
        sky: { mf: prov(1773), tf: prov(1773), extra: [
            { t: 'Драмы', k: 'tv', q: prov(1773) + '&with_genres=18&sort_by=popularity.desc' },
            { t: 'Комедии', k: 'tv', q: prov(1773) + '&with_genres=35&sort_by=popularity.desc' },
            { t: 'Фантастика и фэнтези', k: 'tv', q: prov(1773) + '&with_genres=10765&sort_by=popularity.desc' }
        ] }
    };
    function svcCats(key) {
        var c = SVC[key], today = dayStr(0), out = [];
        if (!c) return out;
        out.push({ t: 'Новые фильмы', k: 'movie', q: c.mf + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + today + '&vote_count.gte=10' });
        out.push({ t: 'Новые сериалы', k: 'tv', q: c.tf + '&sort_by=first_air_date.desc&first_air_date.lte=' + today + '&vote_count.gte=5' });
        out.push({ t: 'Главные хиты', k: 'tv', q: c.tf + '&sort_by=popularity.desc' });
        out.push({ t: 'Популярные фильмы', k: 'movie', q: c.mf + '&sort_by=popularity.desc&vote_count.gte=50' });
        c.extra.forEach(function (e) { out.push(e); });
        out.push({ t: 'Золотая коллекция (лучший рейтинг)', k: 'tv', q: c.tf + '&sort_by=vote_average.desc&vote_average.gte=7.8&vote_count.gte=300' });
        return out.map(function (e) {
            return { title: e.t, url: 'discover/' + e.k + '?' + e.q.replace('{today}', today), kind: e.k };
        });
    }

    // На главной показываем новые фильмы и сериалы сервиса, начиная с самых свежих.
    // Если новинок мало, дополняем подборку популярным контентом.
    function serviceCall(row, key) {
        return function (call) {
            var cats = svcCats(key);
            var wide = function (u) { return u.replace('with_watch_monetization_types=flatrate', 'with_watch_monetization_types=flatrate%7Cfree%7Cads'); };
            var fresh = [
                { url: wide(cats[0].url), page: 1, kind: 'movie' }, { url: wide(cats[0].url), page: 2, kind: 'movie' },
                { url: cats[1].url, page: 1, kind: 'tv' }, { url: cats[1].url, page: 2, kind: 'tv' }
            ];
            var filler = [
                { url: wide(cats[3].url), page: 1, kind: 'movie' }, { url: cats[2].url, page: 1, kind: 'tv' }
            ];
            function fetchAll(tasks, done) {
                var left = tasks.length, out = [];
                tasks.forEach(function (t, i) {
                    tget(t.url, { page: t.page }, function (j) {
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
                call({ title: row.title, results: list, url: cats[1].url, source: 'tmdb', page: 1, more: true, total_pages: 2 });
            }
        };
    }

    // Отдельная страница сервиса (компонент Lampa).
    var svcRegistered = false;
    function registerServicePage() {
        if (svcRegistered || !Lampa.Component || !Lampa.Component.add || !Lampa.InteractionMain) return;
        svcRegistered = true;
        Lampa.Component.add('lmx_service', function (object) {
            var comp = new Lampa.InteractionMain(object);
            comp.create = function () {
                var self = this;
                this.activity.loader(true);
                var cats = svcCats(object.service_id), res = new Array(cats.length), left = cats.length;
                function fin() {
                    if (--left > 0) return;
                    var data = [];
                    cats.forEach(function (c, i) {
                        if (res[i] && res[i].length) {
                            data.push({ title: c.title, results: res[i], url: c.url, source: 'tmdb', page: 1, total_pages: 5 });
                        }
                    });
                    self.activity.loader(false);
                    if (!data.length) self.empty(); else self.build(data);
                }
                if (!cats.length) { self.activity.loader(false); self.empty(); return this.render(); }
                cats.forEach(function (c, i) {
                    tget(c.url, { page: 1 }, function (j) {
                        res[i] = cleanResults(j && j.results, false).filter(function (x) { return x.poster_path; });
                        fin();
                    }, function () { res[i] = []; fin(); });
                });
                return this.render();
            };
            comp.onMore = function (data) {
                Lampa.Activity.push({ url: data.url, title: data.title || 'Ещё', component: 'category_full', source: 'tmdb', page: 1 });
            };
            return comp;
        });
    }

    // ===== БАННЕР И ПЛИТКИ СТРИМИНГОВЫХ СЕРВИСОВ =====
    function imgUrl(path, size) {
        try { if (Lampa.TMDB && Lampa.TMDB.image) return Lampa.TMDB.image('t/p/' + size + path); } catch (e) {}
        return 'https://image.tmdb.org/t/p/' + size + path;
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
            // Сериалы: премьеры в заданном периоде и недавно начавшиеся сезоны.
            ['discover/tv?sort_by=popularity.desc&first_air_date.gte=' + dayStr(1) + '&first_air_date.lte=' + dayStr(w), 'tv', 1, 'soon'],
            ['discover/tv?sort_by=popularity.desc&first_air_date.gte=' + dayStr(-w) + '&first_air_date.lte=' + dayStr(0), 'tv', 1, 'new']
        ];
    }
    // Афиша: недельные тренды, кинотеатры и громкие премьеры.
    // В темах Apple TV и HBO баннер занимает экран и переключается автоматически.
    function board() { var t = getStr('lmx_theme', 'default'); return t === 'apple' || t === 'hbo'; }
    function heroSources() {
        return [['trending/all/week', '', 1], ['movie/now_playing?region=UA', 'movie', 1]].concat(hypeSources());
    }
    // Минимальная популярность TMDB для попадания премьеры в подборку.
    var HYPE_MIN_POP = 50;

    // Кэш запросов TMDB на 8 минут и объединение одновременных одинаковых запросов ускоряют открытие главной.
    var tcache = {}, tpend = {};
    function tclone(j) {
        if (!j || !j.results || !j.results.slice) return j;
        var o = {}, k;
        for (k in j) o[k] = j[k];
        o.results = j.results.map(function (m) { var c = {}, q; for (q in m) c[q] = m[q]; return c; });
        return o;
    }
    function tget(url, params, ok, fail) {
        var requestParams = {}, paramName;
        params = params || {};
        for (paramName in params) requestParams[paramName] = params[paramName];
        requestParams.language = 'ru-RU';
        var key = url + '|' + JSON.stringify(requestParams), now = Date.now();
        var c = tcache[key];
        if (c && now - c.t < 480000) { setTimeout(function () { ok(tclone(c.j)); }, 0); return; }
        if (tpend[key]) { tpend[key].push([ok, fail]); return; }
        tpend[key] = [[ok, fail]];
        Lampa.Api.sources.tmdb.get(url, requestParams, function (j) {
            var q = tpend[key]; delete tpend[key];
            if (j) tcache[key] = { t: Date.now(), j: j };
            q.forEach(function (x) { try { x[0](tclone(j)); } catch (e) {} });
        }, function (err) {
            var q = tpend[key]; delete tpend[key];
            q.forEach(function (x) { try { if (x[1]) x[1](err); } catch (e) {} });
        });
    }

    function heroCall(row) {
        return function (call) {
            var srcs = heroSources(), left = srcs.length, all = [], seenIds = {};
            function fin() {
                if (--left > 0) return;
                // Объединяем тренды, кинотеатральные релизы и громкие премьеры из разных источников.
                var merged = {}, order = [];
                all.forEach(function (m) {
                    var e = merged[m.id];
                    if (!e) { merged[m.id] = e = { m: m, base: false, hype: false }; order.push(m.id); }
                    if (m.__hype) e.hype = true; else e.base = true;
                });
                // В каждой группе громких премьер — до 3 фильмов и 2 сериалов («скоро» или «уже вышло»).
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
                    if (!tag) {
                        if (!e.base) return;
                        // Будущие премьеры показываем только в заданном периоде и только как громкие релизы.
                        var fd = dayDiff(m.release_date || m.first_air_date);
                        if (fd !== null && fd > 0) return;
                        if (!(m.overview && String(m.overview).trim())) return;
                        if (m.vote_count > 30 && m.vote_average < 6.3) return;
                    }
                    if (tag) m.__tag = tag;
                    seenIds[id] = 1;
                    list.push(m);
                });
                list.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
                // Громкие премьеры не должны пропадать из-за лимита: добавляем их первыми, остальные — по популярности.
                var lim = board() ? 8 : 12;
                var tg = list.filter(function (m) { return m.__tag === 'soon'; }).concat(list.filter(function (m) { return m.__tag === 'new'; })).slice(0, lim - 2);
                var rest = list.filter(function (m) { return !m.__tag; });
                list = tg.concat(rest.slice(0, lim - tg.length));
                list.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
                if (!list.length) return call();
                // Кэшируем изображение афиши, чтобы при возвращении к первому баннеру не было пустого постера.
                safe(function () {
                    window.__lmxHeroImgs = list.map(function (m) {
                        var im = new Image();
                        im.src = imgUrl(m.backdrop_path, board() ? 'w1280' : 'w500');
                        return im;
                    });
                });
                // В конец добавляется копия первого баннера: с последнего слайда переходим на неё, затем незаметно — на оригинал.
                var items = list.concat(list.length > 1 && board() ? [list[0]] : []).map(function (m, idx) {
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
                                    h.addClass('card--lmxhero').attr('data-lmxi', idx).attr('data-lmxn', list.length);
                                    if (h.closest) h.closest('.items-line').addClass('lmx-hero-line');
                                    var view = h.find('.card__view');
                                    view.css('background-image', 'url(' + imgUrl(m.backdrop_path, board() ? 'w1280' : 'w500') + ')');
                                    view.find('img').css('opacity', 0);
                                    h.find('.card__title,.card__age,.card__vote').remove();
                                    var v = Number(m.vote_average) || 0;
                                    var isTv = m.media_type === 'tv' || (!m.title && m.name);
                                    var year = String(m.release_date || m.first_air_date || '').slice(0, 4);
                                    var ov = String(m.overview || '');
                                    if (!ov && m.__tag === 'soon') ov = '';
                                    var ovMax = getStr('lmx_theme', 'default') === 'default' ? 120 : 190;
                                    if (ov.length > ovMax) ov = ov.slice(0, ovMax - 3).replace(/\s+\S*$/, '') + '…';
                                    view.append('<div class="lmx-hero__shade"></div><div class="lmx-hero__text"><div class="lmx-hero__title">' +
                                        esc(m.title || m.name) + '</div><div class="lmx-hero__meta">' +
                                        (m.__tag ? '<span class="lmx-hero__tag lmx-t-' + m.__tag + '">' + (m.__tag === 'soon' ? 'Скоро · ' + fmtShort(m.release_date || m.first_air_date) : 'Уже вышел') + '</span>' : '') +
                                        (v ? '<span class="lmx-hero__v" style="color:' + ratingColor(v) + '"><i>&#9734;</i> ' + v.toFixed(1) + '</span>' : '') +
                                        '<span>' + (isTv ? 'Сериал' : 'Фильм') + '</span>' + (year ? '<span>' + year + '</span>' : '') +
                                        '</div><div class="lmx-hero__o">' + esc(ov) + '</div>' +
                                        (getStr('lmx_theme', 'default') === 'apple' ? '<div class="lmx-hero__acts"><span class="lmx-hero__btn">&#9654;&nbsp; Смотреть</span><span class="lmx-hero__circ">+</span></div>' :
                                            getStr('lmx_theme', 'default') === 'hbo' ? '<div class="lmx-hero__acts"><span class="lmx-hero__about"><i>i</i>' + (isTv ? 'О сериале' : 'О фильме') + '</span><span class="lmx-hero__btn">&#9654;&nbsp; Смотреть</span></div>' : '') + '</div>');
                                });
                            },
                            onlyEnter: function () { openFull(m); }
                        }
                    };
                    return it;
                });
                call({ title: 'Афиша', results: items, params: { items: { mapping: 'line', view: 15 } } });
            }
            srcs.forEach(function (x) {
                tget(x[0], { page: 1 }, function (j) {
                    (j && j.results || []).forEach(function (m) { if (x[1] && !m.media_type) m.media_type = x[1]; if (x[3]) m.__hype = x[3]; all.push(m); });
                    fin();
                }, function () { fin(); });
            });
        };
    }

    var PROV_COLORS = { 8: '#c8102e', 350: '#1d1d1f', 1899: '#5b2bd0', 119: '#0f79af', 337: '#0b2a6b', 531: '#0064ff', 1773: '#6a1b9a' };
    function studioCall(row) {
        return function (call) {
            var logos = {};
            function done() {
                var items = SERVICES.map(function (x) {
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
                                        view.find('img').css('opacity', 0);
                                        h.find('.card__title,.card__age,.card__vote').remove();
                                        var lg = logos[x[2]];
                                        view.append(lg ? '<img class="lmx-studio__logo" src="' + imgUrl(lg, 'w154') + '">' :
                                            '<div class="lmx-studio__name">' + esc(x[1]) + '</div>');
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
                done();
            }, function () { done(); });
        };
    }
    function openService(x) {
        registerServicePage();
        Lampa.Activity.push({ url: '', title: x[1], component: 'lmx_service', service_id: x[0], page: 1 });
    }

    // Рекомендации по истории просмотров: собираем похожие проекты из TMDB и поднимаем популярные выше.
    var recsCache = null;
    function recsCall(row) {
        return function (call) {
            var hist = [];
            try { hist = Lampa.Favorite.get({ type: 'history' }) || []; } catch (e) {}
            hist = hist.filter(function (c) { return c && c.id; });
            if (!hist.length) return call();
            var watched = {};
            hist.forEach(function (c) { watched[c.id] = 1; });
            var base = hist.slice(0, 6);
            var key = base.map(function (c) { return c.id; }).join(',');
            if (recsCache && recsCache.key === key) return call(recsCache.data);

            var score = {}, left = base.length;
            function fin() {
                if (--left > 0) return;
                var arr = Object.keys(score).map(function (k) { return score[k]; });
                arr.sort(function (a, b) { return b.n - a.n || (b.c.popularity || 0) - (a.c.popularity || 0); });
                var out = arr.map(function (x) { return x.c; }).slice(0, 20);
                if (!out.length) return call();
                var data = { title: row.title, results: out, source: 'tmdb' };
                recsCache = { key: key, data: data };
                call(data);
            }
            base.forEach(function (c) {
                var kind = (c.media_type === 'tv' || c.name || c.first_air_date || c.number_of_seasons) ? 'tv' : 'movie';
                tget(kind + '/' + c.id + '/recommendations', { page: 1 }, function (j) {
                    cleanResults(j && j.results, false).forEach(function (r) {
                        if (!r.poster_path || watched[r.id]) return;
                        r.media_type = kind;
                        if (!score[r.id]) score[r.id] = { c: r, n: 0 };
                        score[r.id].n++;
                    });
                    fin();
                }, function () { fin(); });
            });
        };
    }

    function makeCall(row) {
        if (row.custom) return function () { return row.custom(); };
        return function () {
            return function (call) {
                var urls = typeof row.urls === 'function' ? row.urls() : [row.url];
                var best = null, i = 0;
                function done() {
                    if (best && best.list.length) {
                        call({ title: row.title, results: best.list, url: best.url, source: 'tmdb', page: 1, more: true, total_pages: Math.max(best.pages, 2) });
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

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ КАРТОЧЕК =====
    var MAX_PARALLEL = 3;
    var CACHE_MIN = 1440;
    var RE_NATIVE_TV = /^\s*(TV|ТВ)\s*$/i;

    var mem = {};
    var queue = [];
    var active = 0;
    var hiddenEls = [];

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
    // Считаем только вышедшие сезоны и серии: TMDB может учитывать анонсированные выпуски.
    function airedStats(j) {
        var last = j && j.last_episode_to_air;
        if (!last || !(last.season_number > 0)) return null;
        var eps = last.episode_number || 0;
        (j.seasons || []).forEach(function (x) {
            if (x.season_number > 0 && x.season_number < last.season_number) eps += x.episode_count || 0;
        });
        return eps > 0 ? { s: last.season_number, e: eps } : null;
    }
    // 105 -> «1 ч 45 мин», 45 -> «45 мин», 120 -> «2 ч».
    function fmtDur(min) {
        min = Math.round(min);
        if (min < 60) return min + ' мин';
        var h = Math.floor(min / 60), m = min % 60;
        return h + ' ч' + (m ? ' ' + m + ' мин' : '');
    }
    // Количество дней до даты; отрицательное значение означает прошедшую дату, null — дата неизвестна.
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
    // «сегодня» / «завтра» / «через 3 дня».
    function rel(dateStr) {
        var n = dayDiff(dateStr);
        if (n === null || n < 0 || n > 90) return fmtFull(dateStr);
        if (n === 0) return 'сегодня';
        if (n === 1) return 'завтра';
        return 'через ' + n + ' ' + plural(n, 'день', 'дня', 'дней');
    }
    function ratingColor(v) {
        if (v >= 7.5) return 'rgba(46,158,91,.95)';
        if (v >= 6.5) return 'rgba(140,160,30,.95)';
        if (v >= 5.5) return 'rgba(224,123,32,.95)';
        return 'rgba(192,57,43,.95)';
    }

    // ===== МЕТКИ =====
    function tvMark(j) {
        var n = j.next_episode_to_air ? dayDiff(j.next_episode_to_air.air_date) : null;
        var l = j.last_episode_to_air ? dayDiff(j.last_episode_to_air.air_date) : null;
        if (n === 0 || l === 0) return { t: 'Сегодня', c: 'next' };
        if (l !== null && l < 0 && l >= -7) return { t: 'Новая серия', c: 'next' };
        var fa = dayDiff(j.first_air_date);
        var planned = j.status === 'Planned' || j.status === 'In Production' || j.status === 'Pilot';
        if ((fa !== null && fa > 0) || (planned && !j.last_episode_to_air && fa === null)) return { t: 'Скоро', c: 'soon' };
        return null;
    }
    function movieMark(d) {
        var n = dayDiff(d.release_date);
        if (n !== null && n <= 0 && n >= -30) return { t: 'Премьера', c: 'new' };
        if (n !== null && n > 0) return { t: 'Скоро', c: 'soon' };
        return null;
    }
    // ===== CSS =====
    function buildCss() {
        var fs = SIZES[getStr('lmx_size', 'm')] || SIZES.m;
        var cNext = COLORS[getStr('lmx_c_next', 'orange')] || COLORS.orange;
        var cDone = COLORS[getStr('lmx_c_done', 'green')] || COLORS.green;
        var cSoon = COLORS[getStr('lmx_c_soon', 'blue')] || COLORS.blue;
        var nNext = RGB[getStr('lmx_c_next', 'orange')] ? getStr('lmx_c_next', 'orange') : 'orange';
        var nSoon = RGB[getStr('lmx_c_soon', 'blue')] ? getStr('lmx_c_soon', 'blue') : 'blue';

        function markCss(cls, nm) {
            return '.lmx-pill.lmx-m-' + cls + '{background:' + rgba(nm, 0.62) + ';border:1px solid ' + rgba(nm, 0.9) + '}';
        }

        return '' +
            '.lmx-box{position:absolute;left:.4em;top:.4em;z-index:3;pointer-events:none}' +
            '.lmx-tr{position:absolute;right:.4em;top:.4em;z-index:3;pointer-events:none}' +
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
            '.lmx-head-moved{display:none !important}' +
            '.lmx-info{display:flex;flex-wrap:wrap;gap:.5em;margin:.8em 0}' +
            '.lmx-ip{font-size:1.1em;line-height:1;padding:.45em .8em;border-radius:.6em;background:rgba(255,255,255,.12);color:#fff}' +
            '.lmx-ip.lmx-next{background:rgba(255,255,255,.12)}' +
            '.lmx-ip.lmx-done{background:' + cDone + '}' +
            '.lmx-ip.lmx-soon{background:rgba(255,255,255,.12)}' +
            '.lmx-ip.lmx-bad{background:' + COLORS.red + '}' +
            // Единый стиль карточек фильмов.
            ''+
                '.lmx-tr .lmx-pill,.lmx-box .lmx-pill{font-size:' + (0.72 * fs).toFixed(2) + 'em;padding:.28em .6em;border-radius:.55em;font-weight:500;letter-spacing:.02em}' +
                '.lmx-box .lmx-pill{background:rgba(30,32,40,.7);border:1px solid rgba(255,255,255,.32)}' +
                '.card .card__title,.card .card__age,.card .card__vote{display:none !important}' +
                // Собственные метки заменяют стандартные значки качества, типа и маркеры других плагинов.
                '.lmx-sel{display:none;position:absolute;z-index:6;pointer-events:none;box-sizing:border-box;border:.16em solid #fff;opacity:0}' +
                '.lmx-sel.on{opacity:1}' +
                // Широкие карточки истории просмотров используются во всех темах; меняются только скругления и размеры.
                '.card--lmxhist{width:23em !important}' +
                '.card--lmxhist .card__view{height:12.9em !important;padding-bottom:0 !important;border-radius:1em;overflow:hidden;position:relative;background-repeat:no-repeat !important;background-size:cover !important;background-position:center !important}' +
                '.card--lmxhist > *:not(.card__view):not(.lmx-sel),.card--lmxhist .card__view > *:not(.lmx-hist__shade):not(.lmx-hist__text):not(.lmx-hist__bar){display:none !important}' +
                '.lmx-hist__shade{position:absolute;left:0;right:0;bottom:0;height:80%;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.6) 45%,rgba(0,0,0,0) 100%)}' +
                '.lmx-hist__text{position:absolute;left:1em;right:1em;bottom:1.15em;color:#fff;z-index:2;text-shadow:0 1px 3px rgba(0,0,0,.7)}' +
                '.lmx-hist__t{font-size:1.05em;font-weight:700;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
                '.lmx-hist__m{display:flex;gap:1em;font-size:.85em;line-height:1.3;margin-top:.4em}' +
                // В стандартной теме карточка истории получает белую рамку при фокусе.
                'body:not(.lmx-hbo):not(.lmx-apple) .card--lmxhist.focus .card__view{box-shadow:0 0 0 .22em #fff !important}' +
                'body:not(.lmx-hbo):not(.lmx-apple) .card--lmxhist.focus .card__view::after{display:none !important}' +
                  '.lmx-hist__bar{position:absolute;left:0;right:0;bottom:0;height:.42em!important;background:rgba(255,255,255,.3)!important;z-index:3}' +
                  '.lmx-hist__bar i{display:block;height:100%;background:#e50914!important;background-color:#e50914!important}' +
                '.card .card__quality,.card .card__type,.card .card__marker{display:none !important}' +
                // Фон приложения: нейтральный графитовый градиент в стандартной теме.
                'html{background:#0b0b0d !important}' +
                'body{background:linear-gradient(180deg,#1d1e22 0%,#131316 45%,#0b0b0d 100%) fixed !important}' +
                '.background{display:none !important}' +
                '.activity,.activity__body,.wrap{background:transparent}' +
                // Панели Lampa (меню, настройки, списки и окна) оформляются в цвет темы.
                'body:not(.lmx-hbo):not(.lmx-apple) .settings__content,body:not(.lmx-hbo):not(.lmx-apple) .selectbox__content,body:not(.lmx-hbo):not(.lmx-apple) .modal__content,body:not(.lmx-hbo):not(.lmx-apple) .menu,body:not(.lmx-hbo):not(.lmx-apple) .wrap__left{background:#17181c !important}' +
                 '.lmx-cin{position:absolute;left:0;right:0;bottom:0;padding:2.2em .7em .6em;color:#fff;z-index:2;pointer-events:none;border-radius:0 0 1em 1em;' +
                    'background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.7) 45%,rgba(0,0,0,0) 100%)}' +
                 '.lmx-cin__g{font-size:' + (0.72 * fs).toFixed(2) + 'em;opacity:.72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.04em;text-transform:uppercase}' +
                 '.lmx-cin__t{font-size:' + (1.15 * fs).toFixed(2) + 'em;font-weight:600;line-height:1.15;margin:.25em 0 .45em;max-height:3.5em;overflow:hidden;display:flex;align-items:flex-end;min-height:1.15em}' +
                 '.lmx-cin__t img{display:block;max-width:90%;max-height:2.65em;width:auto;height:auto;object-fit:contain;object-position:left bottom;filter:drop-shadow(0 1px 4px rgba(0,0,0,.45))}' +
                '.lmx-cin__r{display:flex;justify-content:space-between;align-items:center;font-size:' + (0.9 * fs).toFixed(2) + 'em}' +
                '.lmx-cin__v i{font-style:normal}.lmx-cin__y{opacity:.85}' +
                 '.card .card__view{position:relative}' +
                  '.lmx-progress,.lmx-episode-progress{min-height:.34em!important;height:.34em!important;z-index:7!important;overflow:hidden!important;border-radius:99em!important;background:rgba(255,255,255,.32)!important;pointer-events:none!important}' +
                  '.lmx-progress{position:absolute;left:.35em;right:.35em;bottom:.28em}' +
                  '.lmx-progress i,.lmx-episode-progress i{display:block!important;height:100%!important;border-radius:inherit!important;background:#e50914!important;background-color:#e50914!important}' +
                  '.lmx-progress--row{left:.7em;right:.7em;bottom:.45em;height:.4em!important;min-height:.4em!important}' +
                  '.lmx-episode-progress{position:absolute;left:calc(42% + .8em);right:.8em;bottom:.55em}' +
                  '.lmx-clean-page .full-start-new__tagline,.lmx-clean-page .full-start__tagline,.lmx-clean-page .lmx-descr{display:none!important}' +
                  '.lmx-clean-page .full-start-new__title.lmx-has-logo,.lmx-clean-page .full-start__title.lmx-has-logo{font-size:0!important;line-height:0!important}' +
                  '.lmx-clean-page .lmx-logo{display:block;max-width:72vw;max-height:15vh;width:auto;height:auto;object-fit:contain;margin:0 0 .6em 0}' +
                // Метка «Просмотрено» в истории расположена выше, чтобы не перекрывать название.
                '.card .card-watched{top:2.8em !important;bottom:auto !important;left:.5em !important;right:.5em !important;z-index:5;font-size:.8em}' +
            (getStr('lmx_card_size', 'm') !== 'm' ?
                '.items-line .card:not(.card--lmxhero):not(.card--lmxstudio){width:' + (getStr('lmx_card_size', 'm') === 'xl' ? '19.5em' : '17em') + ' !important}' : '') +
            fullCss() +
            '.card--lmxhero.focus .card__view,.card--lmxstudio.focus .card__view{box-shadow:0 0 0 .22em #fff !important}' +
            '.card--lmxhero.focus .card__view::after,.card--lmxstudio.focus .card__view::after{display:none !important}' +
            '.lmx-hero__o{font-size:.85em;opacity:.85;margin-top:.35em;line-height:1.3;max-height:2.7em;overflow:hidden}' +
            '.card--lmxhero{width:' + (getStr('lmx_card_size', 'm') === 'xl' ? '38em' : getStr('lmx_card_size', 'm') === 'l' ? '34em' : '30em') + ' !important}' +
            '.card--lmxhero .card__view{padding-bottom:0 !important;height:15em;background-size:cover;background-position:center;border-radius:.8em;overflow:hidden;position:relative}' +
            '.lmx-hero__shade{position:absolute;left:0;right:0;bottom:0;height:70%;background:linear-gradient(to top,rgba(0,0,0,.85),rgba(0,0,0,0))}' +
            '.lmx-hero__text{position:absolute;left:1em;right:1em;bottom:.8em;color:#fff}' +
            '.lmx-hero__title{font-size:1.5em;font-weight:600;line-height:1.15;margin-bottom:.35em}' +
            '.lmx-hero__meta{display:flex;gap:.6em;font-size:1em;opacity:.95;align-items:center}' +
            '.lmx-hero__v{display:inline-flex;align-items:center;gap:.3em;background:rgba(0,0,0,.62);padding:.2em .6em;border-radius:.4em;font-weight:700;-webkit-text-fill-color:#fff}' +
            '.lmx-hero__v i{-webkit-text-fill-color:currentColor;font-style:normal}' +
            '.lmx-hero__tag{display:inline-block;padding:.2em .65em;border-radius:.4em;font-weight:700;font-size:.9em;color:#fff;white-space:nowrap}' +
            '.lmx-hero__tag.lmx-t-soon{background:' + cSoon + '}' +
            '.lmx-hero__tag.lmx-t-new{background:' + cDone + '}' +
            '.card--lmxstudio{width:13em !important}' +
            '.card--lmxstudio .card__view{padding-bottom:0 !important;height:6.5em;border-radius:.8em;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}' +
             '.lmx-studio__logo{display:block;width:auto;max-width:78%;height:auto;max-height:3.2em;padding:.55em .9em;border-radius:.65em;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(0,0,0,.32))}' +
             '.lmx-studio__name{color:#fff;font-size:1.15em;font-weight:650;text-align:center;padding:.45em .8em;line-height:1.15;letter-spacing:-.02em}' +
              episodeCss() + torrentCss();
    }

    function episodeCss() {
        return '.full-episode{position:relative;display:grid !important;grid-template-columns:minmax(38%,42%) minmax(0,1fr);align-items:stretch;gap:0;margin:0 0 .45em;padding:0 !important;min-height:11.5em;overflow:hidden;border-radius:.65em;background:rgba(18,19,23,.88)}' +
            '.full-episode__img{grid-column:1;grid-row:1 / span 8;width:100% !important;height:100% !important;min-height:11.5em;object-fit:cover;border-radius:0 !important;overflow:hidden}' +
            '.full-episode__img img{width:100%;height:100%;object-fit:cover}' +
            '.full-episode > :not(.full-episode__img){grid-column:2;min-width:0;margin:0;padding-left:.8em;padding-right:.8em}' +
            '.full-episode__name{padding-top:.7em !important;font-size:1.12em;line-height:1.18;font-weight:650;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
            '.full-episode__description,.full-episode__overview{font-size:.82em;line-height:1.25;opacity:.78;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
            '.full-episode::before{content:attr(data-lmx-epnum);position:absolute;z-index:4;left:21%;top:50%;transform:translate(-50%,-50%);color:#fff;font-size:3.25em;font-weight:800;line-height:1;text-shadow:0 2px 10px rgba(0,0,0,.7);pointer-events:none}' +
            '.full-episode.focus,.full-episode.hover{outline:2px solid rgba(255,255,255,.92);outline-offset:-2px;background:rgba(27,28,34,.98)}' +
            '.full-episode.focus .full-episode__img{box-shadow:none !important}' +
            '.torrent-item,.torrent-file,.torrent-row,.torrent-list__item{position:relative}' +
            '@media(max-width:760px){.full-episode{grid-template-columns:minmax(38%,42%) minmax(0,1fr);min-height:11em;border-radius:.55em}.full-episode__img{min-height:11em}.full-episode__name{font-size:1.12em;padding-top:.7em !important}.full-episode::before{font-size:3em}.lmx-episode-progress{left:calc(42% + .65em);right:.65em;bottom:.45em}.torrent-item .lmx-progress--row,.torrent-file .lmx-progress--row,.torrent-row .lmx-progress--row,.torrent-list__item .lmx-progress--row{left:.65em;right:.65em}}';
    }

    function torrentCss() {
        return 'body .activity--active .torrent-item.lmx-tor-on{position:relative;margin:0 0 .85em;padding:1.1em 1.3em .95em;border:1px solid transparent;border-radius:.8em;background:rgba(255,255,255,.07);box-sizing:border-box;color:#fff;transition:background-color .15s,color .15s,border-color .15s,transform .15s}' +
            'body .activity--active .torrent-item.lmx-tor-on > .torrent-item__title,body .activity--active .torrent-item.lmx-tor-on > .torrent-item__ffprobe,body .activity--active .torrent-item.lmx-tor-on > .torrent-item__details,body .activity--active .torrent-item.lmx-tor-on > .stv-tor{display:none!important}' +
            '.lmx-tor{display:flex;align-items:center;gap:1em;min-width:0}' +
            '.lmx-tor__l{flex:1;min-width:0}' +
            '.lmx-tor__top{display:flex;align-items:center;min-width:0;gap:.4em;overflow:hidden}' +
            '.lmx-tor__q{flex-shrink:0;display:inline-block;border:1px solid rgba(255,255,255,.6);border-radius:.3em;padding:0 .35em;font-size:.78em;font-weight:700;line-height:1.5;letter-spacing:.02em;white-space:nowrap}' +
            '.lmx-tor__q--hi{background:#fff;color:#111;border-color:#fff}' +
            '.lmx-tor__name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:1em;font-weight:600;line-height:1.25}' +
            '.lmx-tor__sub,.lmx-tor__meta{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}' +
            '.lmx-tor__sub{margin-top:.28em;color:rgba(235,235,245,.76);font-size:.86em;line-height:1.3}' +
            '.lmx-tor__meta{margin-top:.18em;color:rgba(235,235,245,.52);font-size:.75em;line-height:1.25}' +
            '.lmx-tor__r{flex-shrink:0;min-width:4.2em;margin-left:.5em;text-align:right}' +
            '.lmx-tor__size{font-size:1em;font-weight:600;white-space:nowrap}' +
            '.lmx-tor__seeds{margin-top:.25em;color:#30d158;font-size:.86em;font-weight:600;white-space:nowrap}' +
            '.lmx-tor__seeds--none{color:rgba(235,235,245,.46)}' +
            '.lmx-tor__top .torrent-item__viewed{position:static;flex-shrink:0;display:inline-block;width:1em;height:1em;margin-left:.1em;opacity:.8}' +
            'body .activity--active .torrent-item.lmx-tor-on.focus{background:rgba(255,255,255,.16)!important;border-color:rgba(255,255,255,.92);transform:scale(1.01);box-shadow:0 0 0 1px rgba(255,255,255,.78)}' +
            'body .activity--active .torrent-item.lmx-tor-on.focus .lmx-tor__sub,body .activity--active .torrent-item.lmx-tor-on.focus .lmx-tor__meta{color:rgba(255,255,255,.84)}' +
            'body .activity--active .torrent-item.lmx-tor-on .lmx-progress--row{left:1.3em;right:1.3em;bottom:.4em;height:.42em!important;min-height:.42em!important;background:rgba(255,255,255,.24)!important;box-shadow:0 0 5px rgba(229,9,20,.2)}' +
            'body .activity--active .torrent-item.lmx-tor-on .lmx-progress--row i{background:#e50914!important;background-color:#e50914!important;border-radius:inherit}' +
            '@media(max-width:760px){body .activity--active .torrent-item.lmx-tor-on{padding:.85em .8em .8em;margin-bottom:.65em;border-radius:.65em}.lmx-tor{gap:.55em}.lmx-tor__r{min-width:3.5em;margin-left:.15em}.lmx-tor__sub{font-size:.8em}.lmx-tor__meta{font-size:.7em}body .activity--active .torrent-item.lmx-tor-on .lmx-progress--row{left:.8em;right:.8em;bottom:.32em;height:.4em!important;min-height:.4em!important}}';
    }
    // Кинематографичная страница фильма или сериала: полноэкранный фон, затемнение, крупный заголовок и стеклянные кнопки.
    function fullCss() {
        var B = 'body.lmx-full ';
        var compact = getBool('lmx_btn_compact', true);
        return '' +
            B + '.full-start-new__body{position:relative;height:84vh;padding-bottom:3vh;box-sizing:border-box}' +
            B + '.full-start-new__right{display:flex;flex-direction:column;justify-content:flex-end;max-width:56%}' +
            B + '.full-start-new__reactions,' + B + '.full-start-new .reaction__count{display:none !important}' +
            B + '.full-start-new__title{font-size:3em;line-height:1.05;font-weight:700}' +
            B + '.full-start-new__title.lmx-has-logo{font-size:0;line-height:0}' +
            'body.lmx-logo-on.lmx-full .full-start-new__title{opacity:0;transition:opacity .5s ease-out}' +
            'body.lmx-logo-on.lmx-full .full-start-new__title.lmx-reveal{opacity:1}' +
            'body.lmx-logo-on.lmx-full .full-start-new__head{opacity:0;transition:opacity .5s ease-out}' +
            'body.lmx-logo-on.lmx-full .full-start-new__head.lmx-reveal{opacity:1}' +
            // У контейнера font-size:0, поэтому размеры заданы в vw, vh и px; единицы em здесь равны нулю.
            B + '.lmx-logo{display:block;max-width:34vw;max-height:15vh;width:auto;height:auto;margin-bottom:1vh}' +
            B + '.full-start-new__tagline{font-size:1.05em;opacity:.8;margin-top:.3em}' +
            B + '.full-start-new__rate-line{margin:.9em 0 .8em 0}' +
            B + '.full-start-new__details{margin:0 0 .8em -0.3em;font-size:1em;line-height:1.5;opacity:.85}' +
            B + '.full-start-new__right{text-shadow:0 1px 3px rgba(0,0,0,.75)}' +
            B + '.full-start-new__right .lmx-info{margin:.5em 0 .9em}' +
            B + '.full-start__background{filter:brightness(.45);transform:none !important;animation:none !important;transition:opacity .8s ease-out;will-change:opacity}' +
            B + '.background{filter:brightness(.45)}' +
            B + '.lmx-descr{position:absolute;right:2%;top:11%;width:30vw;font-size:1.05em;line-height:1.5;z-index:2;color:#fff;' +
                'background:rgba(0,0,0,.45);padding:.9em 1.1em;border-radius:1em}' +
            B + '.lmx-descr__t{display:-webkit-box;-webkit-line-clamp:8;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis}' +
            // Компактные кнопки располагаются в несколько строк.
            B + '.full-start-new__buttons{display:flex;flex-wrap:wrap;margin-top:.4em}' +
            B + '.full-start__button,' + B + '.full-start-new__buttons .simple-button{background:rgba(255,255,255,.14);border-radius:.8em;margin:0 .5em .5em 0;padding:.55em 1em;font-size:.95em}' +
            B + '.full-start__button.focus,' + B + '.full-start-new__buttons .simple-button.focus{background:#fff;color:#111}' +
            (compact ?
                // Подписи остаются у первых трёх кнопок и у выбранной; остальные показываются как значки.
                B + '.full-start-new__buttons > .full-start__button:nth-child(n+4) span{display:none}' +
                B + '.full-start-new__buttons > .full-start__button:nth-child(n+4).focus span{display:inline}' : '') +
            B + '.lmx-info .lmx-ip{background:rgba(255,255,255,.14)}' +
            B + '.full-start-new__left{display:none !important}' +
            mobileCss();
    }
    // Узкие экраны: страница фильма в одну колонку, компактные баннер и плитки.
    function mobileCss() {
        var B = 'body.lmx-full ';
        return '@media (max-width:760px){' +
            B + '.full-start-new__body{height:auto !important;min-height:56vh;padding-bottom:2vh}' +
            B + '.full-start-new__right{align-self:flex-end}' +
            // На телефоне скрываем копию описания: оно уже есть в разделе «Подробнее».
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

    // ===== ТЕМА ПРИЛОЖЕНИЯ =====
    // Тема HBO: постеры без подписей, белая рамка при фокусе, строка метаданных,
    // белая кнопка «Смотреть» и круглые кнопки-значки.
    function themeCss() {
        if (getStr('lmx_theme', 'default') !== 'hbo') return '';
        var G = 'linear-gradient(135deg,#2f3dff 0%,#8a3bff 100%)';
        var T = 'body.lmx-hbo ';
        var F = 'body.lmx-hbo.lmx-full ';
        var logoSize = getStr('lmx_logo_size', 'm');
        var logoWidth = logoSize === 'xl' ? '60%' : logoSize === 'l' ? '52%' : '44%';
        return '' +
            'html{background:#050507 !important}' +
            T + '{background:linear-gradient(180deg,#121216 0%,#0b0b0e 45%,#050507 100%) fixed !important;font-family:"Inter","Helvetica Neue",Arial,sans-serif}' +
            T + '.activity,' + T + '.activity__body{background:transparent}' +
            // Ряды.
            T + '.items-line .card:not(.card--lmxhero){margin-right:.8em}' +
            // При прокрутке карточки заходят под боковую панель, а не обрезаются у края ряда.
            T + '.items-line:not(.lmx-hero-line) .scroll{margin-left:-2.2em;padding-left:2.2em;-webkit-mask-image:none !important;mask-image:none !important}' +
            T + '.items-line__title{font-size:1.3em;font-weight:700;letter-spacing:.01em}' +
            // Карточки: прямоугольный постер и белая рамка при фокусе.
            T + '.card,' + T + '.card.focus,' + T + '.card.hover{transform:none !important;animation:none !important;transition:none !important}' +
            T + '.card__view{border-radius:0;background:#12131f;animation:none !important;transition:transform .45s cubic-bezier(.25,.8,.25,1)}' +
            // При фокусе добавляются белая рамка и лёгкое увеличение.
            T + '.card.focus .card__view::after,' + T + '.card.hover .card__view::after{display:none !important}' +
            // Карточка не смещается: рамка перемещается между карточками силами скрипта.
            T + '.card.focus .card__view,' + T + '.card.hover .card__view{transform:none;box-shadow:none}' +
            T + '.lmx-sel{display:block}' +
            T + '.card:not(.card--lmxhero){position:relative}' +
            T + '.items-line:not(.lmx-hero-line) .scroll__body{transition:transform .5s cubic-bezier(.25,.8,.25,1) !important}' +
            // Подписи в стиле HBO: тёмный градиент, выразительное название и компактные метаданные.
            T + '.lmx-cin{padding:2.4em .7em .6em;border-radius:0;background:linear-gradient(to top,rgba(5,6,15,.96) 0%,rgba(5,6,15,.75) 50%,rgba(5,6,15,0) 100%)}' +
            T + '.lmx-cin__t{font-weight:700;letter-spacing:.01em}' +
            T + '.lmx-cin__t{font-size:1.2em;line-height:1.15;letter-spacing:-.005em}' +
            T + '.lmx-cin__r{margin-top:.1em}' +
            T + '.lmx-cin__v{display:inline-flex;align-items:center;gap:.3em;background:rgba(255,255,255,.14);padding:.2em .6em;border-radius:.4em;font-weight:700;-webkit-text-fill-color:#fff}' +
            T + '.lmx-cin__v i{-webkit-text-fill-color:currentColor;font-size:.9em}' +
            T + '.lmx-cin__y{font-weight:600;letter-spacing:.06em;opacity:.75}' +
            T + '.lmx-cin__g{opacity:.7;text-transform:uppercase;letter-spacing:.05em;font-size:.62em}' +
            // Метки в стиле HBO: компактные, прописными буквами, без обводки.
            T + '.lmx-pill{border:0 !important;border-radius:.25em;font-weight:800;text-transform:uppercase;letter-spacing:.05em}' +
            T + '.lmx-box .lmx-pill{background:rgba(5,6,15,.78) !important;color:#fff !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35)}' +
            T + '.lmx-pill.lmx-m-next{background:' + G + ' !important;color:#fff !important}' +
            T + '.lmx-pill.lmx-m-new{background:#fff !important;color:#05060f !important}' +
            T + '.lmx-pill.lmx-m-soon{background:rgba(5,6,15,.82) !important;color:#fff !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.55)}' +
            // ===== БАННЕР HBO: полноэкранный постер, текст и кнопки слева, точки внизу =====
            T + '.card--lmxhero{width:calc(100vw + 2px) !important;margin-left:calc(-2.2em - 1px) !important;margin-right:calc(2.2em - 1px) !important}' +
            T + '.card--lmxhero .card__view,' + T + '.card--lmxhero.focus .card__view,' + T + '.card--lmxhero.hover .card__view{background-color:#0b0c14;will-change:transform;height:78vh !important;border-radius:0 !important;box-shadow:none !important;transition:none !important;transform:none !important;background-repeat:no-repeat !important;background-size:cover !important;background-position:center 20% !important}' +
            T + '.card--lmxhero .lmx-hero__shade{height:100%;background:linear-gradient(to top,#0b0b0e 0%,rgba(11,11,14,.5) 8%,rgba(11,11,14,0) 28%),linear-gradient(to bottom,rgba(11,11,14,.7) 0%,rgba(11,11,14,0) 16%),linear-gradient(90deg,rgba(11,11,14,.88) 0%,rgba(11,11,14,.55) 30%,rgba(11,11,14,0) 62%)}' +
            T + '.card--lmxhero .lmx-hero__text{left:4em;right:auto;bottom:5.2em;max-width:40%}' +
            T + '.card--lmxhero .lmx-hero__title{font-size:2.8em;font-weight:800;line-height:1.05;letter-spacing:-.01em;margin-bottom:.35em}' +
            T + '.card--lmxhero .lmx-hero__v{display:inline-flex;align-items:center;gap:.3em;background:rgba(255,255,255,.14);padding:.2em .6em;border-radius:.4em;font-weight:700;-webkit-text-fill-color:#fff}' +
            T + '.card--lmxhero .lmx-hero__v i{-webkit-text-fill-color:currentColor;font-style:normal;font-size:.9em}' +
            T + '.lmx-hero__tag{border-radius:.25em;text-transform:uppercase;letter-spacing:.05em;font-weight:800}' +
            T + '.lmx-hero__tag.lmx-t-soon{background:' + G + '}' +
            T + '.lmx-hero__tag.lmx-t-new{background:#fff;color:#05060f}' +
            T + '.card--lmxhero .lmx-hero__meta{font-size:1.05em;opacity:.9}' +
            T + '.card--lmxhero .lmx-hero__o{font-size:1.02em;opacity:.85;line-height:1.4;max-height:4.3em;margin-top:.6em}' +
            T + '.lmx-hero__acts{display:flex;flex-direction:column;align-items:flex-start;margin-top:1.1em}' +
            T + '.lmx-hero__about{display:flex;align-items:center;gap:.6em;font-weight:700;margin-bottom:.9em}' +
            T + '.lmx-hero__about i{display:inline-flex;align-items:center;justify-content:center;width:1.4em;height:1.4em;border:.12em solid #fff;border-radius:50%;font-size:.8em;font-style:normal;font-weight:800}' +
            T + '.lmx-hero__btn{display:inline-block;padding:.7em 1.9em;border-radius:99em;background:#fff;color:#000;font-weight:700;font-size:1.02em}' +
            // Баннер плавно перемещается, текст появляется с небольшой задержкой.
            T + '.lmx-hero-line .scroll__body{transition:transform .55s cubic-bezier(.22,.8,.22,1) !important}' +
            T + '.card--lmxhero .lmx-hero__text{opacity:0;transition:opacity .35s ease .2s}' +
            T + '.card--lmxhero.lmx-cur .lmx-hero__text,' + T + '.card--lmxhero.focus .lmx-hero__text{opacity:1}' +
            T + '.lmx-hero-snap .lmx-hero__text{transition:none !important}' +
            T + '.lmx-hero-line{position:relative}' +
            T + '.lmx-hero-snap .scroll__body{transition:none !important}' +
            T + '.lmx-hero-line .items-line__head,' + T + '.lmx-hero-line .items-line__title{display:none !important}' +
            // Активная точка заполняется за время показа слайда.
            T + '.lmx-dots{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:.8em;z-index:6;pointer-events:none}' +
            T + '.lmx-dots i{display:block;position:relative;width:.55em;height:.55em;border-radius:50%;background:rgba(255,255,255,.45)}' +
            T + '.lmx-dots i.on{width:1.3em;height:1.3em;background:transparent;box-shadow:inset 0 0 0 .14em rgba(255,255,255,.3)}' +
            T + '.lmx-dots i.on::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;border-radius:50%;border:.14em solid transparent;border-top-color:#fff;animation:lmxspin ' + (8) + 's linear both}' +
            '@keyframes lmxspin{to{transform:rotate(360deg)}}' +
            // История просмотров: широкие карточки с кадром.
            T + '.card--lmxhist{width:23em !important}' +
            T + '.card--lmxhist .card__view{height:12.9em !important;padding-bottom:0 !important;border-radius:0;background-repeat:no-repeat !important;background-size:cover !important;background-position:center !important}' +
            T + '.lmx-hist__shade{position:absolute;left:0;right:0;bottom:0;height:80%;border-radius:0;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.6) 45%,rgba(0,0,0,0) 100%)}' +
            T + '.lmx-hist__text{position:absolute;left:1em;right:1em;bottom:1.15em;color:#fff}' +
            T + '.lmx-hist__t{font-size:1.05em;font-weight:700;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            T + '.lmx-hist__m{display:flex;gap:1em;font-size:.82em;line-height:1.3;opacity:.85;margin-top:.5em}' +
            // Плитки стриминговых сервисов.
            T + '.card--lmxstudio.focus .card__view,' + T + '.card--lmxstudio.hover .card__view{transform:none;box-shadow:none !important}' +
            T + '.card--lmxstudio .card__view{border-radius:0;overflow:visible !important;background:linear-gradient(145deg,#1d2040,#0c0d22);border:1px solid rgba(255,255,255,.08)}' +
            // Белая подсветка пунктов меню, настроек и списков при фокусе.
            T + '.menu__item,' + T + '.settings-param,' + T + '.settings-folder,' + T + '.selectbox-item{transition:background-color .2s ease}' +
            T + '.menu__item.focus,' + T + '.menu__item.traverse,' + T + '.menu__item.hover,' +
            T + '.settings-folder.focus,' + T + '.settings-param.focus,' + T + '.selectbox-item.focus,' +
            T + '.settings-param-title.focus,' + T + '.simple-button.focus,' + T + '.full-person.focus,' +
            T + '.head__action.focus,' + T + '.head__action.hover,' + T + '.lmx-ord__btn.focus,' + T + '.lmx-ord__reset.focus' +
            '{background:rgba(255,255,255,.2) !important;color:#fff !important}' +
            T + '.selectbox,' + T + '.settings,' + T + '.menu{background:#0c0c10}' +
            T + '.settings__content,' + T + '.selectbox__content,' + T + '.modal__content,' + T + '.menu,' + T + '.wrap__left{background:#0e0e12 !important}' +
            T + '.modal__content{background:#121216}' +
            // ===== СТРАНИЦА ФИЛЬМА =====
            F + '.full-start__background{filter:brightness(.78)}' +
            F + '.full-start-new__right{width:' + logoWidth + ';max-width:' + logoWidth + '}' +
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
            // Эпизоды сериала: широкие кадры, небольшое скругление и белая рамка при фокусе.
            F + '.full-episode__img{border-radius:.45em;overflow:hidden}' +
            F + '.full-episode.focus .full-episode__img{box-shadow:0 0 0 .2em #fff}' +
            F + '.full-episode__name{font-weight:700}' +
            // Кнопки: белая «Смотреть» и круглые значки; при фокусе заливка становится светлее.
            F + '.full-start-new__buttons{flex-wrap:nowrap;align-items:center}' +
            F + '.full-start-new__buttons > .full-start__button{width:3em;height:3em;padding:0;border-radius:50%;justify-content:center;background:transparent !important;color:#fff;transition:transform .25s ease,box-shadow .25s ease}' +
            F + '.full-start-new__buttons > .full-start__button span{display:none !important}' +
            F + '.full-start-new__buttons > .full-start__button:first-child{width:auto;padding:0 1.8em;border-radius:2em;background:#fff !important;color:#000;font-weight:700}' +
            F + '.full-start-new__buttons > .full-start__button:first-child span{display:inline !important}' +
            F + '.full-start-new__buttons > .full-start__button.focus{background:rgba(255,255,255,.34) !important;color:#fff;transform:scale(1.08)}' +
            F + '.full-start-new__buttons > .full-start__button:first-child.focus{background:#fff !important;color:#000;box-shadow:0 0 0 .2em rgba(255,255,255,.4)}' +
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

    // ===== ТЕМА «APPLE TV» =====
    // Погружающий интерфейс в духе tvOS: большой баннер с кнопкой «Смотреть», карточки с мягкой анимацией,
    // метки-капсулы, стеклянные кнопки и белая кнопка просмотра на странице фильма.
    function appleCss() {
        if (getStr('lmx_theme', 'default') !== 'apple') return '';
        var A = 'body.lmx-apple ';
        var F = 'body.lmx-apple.lmx-full ';
        var logoSize = getStr('lmx_logo_size', 'm');
        var logoWidth = logoSize === 'xl' ? '60%' : logoSize === 'l' ? '52%' : '44%';
        var SPRING = 'cubic-bezier(.25,.8,.25,1)';
        var GRAY = '#a1a1a6';
        var GLASS = 'rgba(120,120,128,.32)';
        return '' +
            'html{background:#26262b !important}' +
            A + '.background{display:none !important}' +
            A + '{background:linear-gradient(180deg,#3b3b44 0%,#2c2c33 38%,#1f1f24 100%) fixed !important;color:#f5f5f7;font-family:-apple-system,"SF Pro Display","Inter","Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}' +
            A + '.activity,' + A + '.activity__body,' + A + '.wrap{background:transparent}' +
            // Заголовки рядов.
            A + '.items-line__title,' + A + '.items-line__head,' + A + '.items-line{background:none !important;box-shadow:none}' +
            A + '.items-line__title{font-size:1.6em;font-weight:700;letter-spacing:-.022em;color:#f5f5f7}' +
            A + '.items-line__more{background:' + GLASS + ';border-radius:99em;font-weight:600}' +
            // ===== КАРТОЧКИ =====
            A + '.card,' + A + '.card.focus,' + A + '.card.hover{transform:none !important;animation:none !important;transition:none !important}' +
            A + '.card__view{border-radius:1.1em;background:#2c2c31;animation:none !important;transition:transform .6s ' + SPRING + '}' +
            A + '.card.focus .card__view,' + A + '.card.hover .card__view{transform:scale(1.12)}' +
            A + '.card.focus .card__view::after,' + A + '.card.hover .card__view::after{display:none !important}' +
            '@keyframes lmxshadow{from{opacity:0}to{opacity:1}}' +
            A + '.lmx-cin{padding:3em .9em .75em;border-radius:0 0 1.15em 1.15em;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.6) 45%,rgba(0,0,0,0) 100%)}' +
            A + '.lmx-cin__t{font-size:1.15em;font-weight:600;letter-spacing:-.015em;line-height:1.15}' +
            A + '.lmx-cin__g{opacity:.6;text-transform:uppercase;letter-spacing:.08em;font-size:.58em;font-weight:600}' +
            A + '.lmx-cin__v{background:none;padding:0;font-weight:600;-webkit-text-fill-color:#f5f5f7}' +
            A + '.lmx-cin__v i{-webkit-text-fill-color:currentColor;font-style:normal}' +
            A + '.lmx-cin__y{opacity:.7;font-weight:500}' +
            // Метки-капсулы.
            A + '.lmx-pill{border:0 !important;border-radius:99em;font-weight:600;letter-spacing:.02em;padding:.34em .9em}' +
            A + '.lmx-box .lmx-pill{background:rgba(44,44,46,.88) !important;color:#f5f5f7 !important}' +
            A + '.lmx-pill.lmx-m-next{background:#0a84ff !important;color:#fff !important}' +
            A + '.lmx-pill.lmx-m-new{background:#f5f5f7 !important;color:#000 !important}' +
            A + '.lmx-pill.lmx-m-soon{background:rgba(44,44,46,.92) !important;color:#f5f5f7 !important}' +
            // ===== БАННЕР =====
            A + '.card--lmxhero{width:calc(100vw + 2px) !important;margin-left:calc(-2.2em - 1px) !important;margin-right:calc(2.2em - 1px) !important}' +
            A + '.card--lmxhero .card__view{background-color:#1c1c20;will-change:transform;height:70vh !important;border-radius:0;box-shadow:none;transition:none !important;background-repeat:no-repeat !important;background-size:cover !important;background-position:center 20% !important}' +
            A + '.card--lmxhero.focus .card__view,' + A + '.card--lmxhero.hover .card__view{transform:none;box-shadow:none !important}' +
            A + '.card--lmxhero.focus .card__view::after,' + A + '.card--lmxhero.hover .card__view::after{display:none !important}' +
            // Плитки сервисов используют ту же анимацию и тень, что и карточки фильмов.
            A + '.card--lmxstudio .card__view{overflow:visible !important}' +
            A + '.card--lmxstudio.focus .card__view,' + A + '.card--lmxstudio.hover .card__view{box-shadow:inset 0 0 0 1px rgba(255,255,255,.07) !important}' +
            A + '.card--lmxhero .lmx-hero__shade{height:100%;background:linear-gradient(to top,#2c2c33 0%,rgba(44,44,51,.5) 8%,rgba(44,44,51,0) 24%),linear-gradient(to bottom,#3b3b44 0%,rgba(59,59,68,.5) 4%,rgba(59,59,68,0) 12%),linear-gradient(90deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,0) 58%)}' +
            A + '.card--lmxhero .lmx-hero__text{left:4em;right:4em;bottom:3.6em;max-width:46%}' +
            A + '.card--lmxhero .lmx-hero__title{font-size:3.3em;font-weight:700;line-height:1.02;letter-spacing:-.03em;margin-bottom:.35em}' +
            A + '.card--lmxhero .lmx-hero__meta{font-size:1.05em;opacity:.9;font-weight:500}' +
            A + '.card--lmxhero .lmx-hero__v{background:none;padding:0;font-weight:600;-webkit-text-fill-color:#f5f5f7}' +
            A + '.card--lmxhero .lmx-hero__v i{-webkit-text-fill-color:currentColor;font-style:normal}' +
            A + '.lmx-hero__tag{border-radius:99em;font-weight:600;padding:.25em .85em;background:rgba(120,120,128,.55);color:#fff}' +
            A + '.lmx-hero__tag.lmx-t-soon{background:#0a84ff}' +
            A + '.lmx-hero__tag.lmx-t-new{background:#f5f5f7;color:#000}' +
            A + '.card--lmxhero .lmx-hero__o{font-size:1.02em;opacity:.8;line-height:1.4;max-height:4.3em;margin-top:.7em}' +
                        // Баннер плавно перемещается, текст появляется с небольшой задержкой.
            A + '.lmx-hero-line .scroll__body{transition:transform .55s cubic-bezier(.22,.8,.22,1) !important}' +
            A + '.card--lmxhero .lmx-hero__text{opacity:0;transition:opacity .35s ease .2s}' +
            A + '.card--lmxhero.lmx-cur .lmx-hero__text,' + A + '.card--lmxhero.focus .lmx-hero__text{opacity:1}' +
            A + '.lmx-hero-snap .lmx-hero__text{transition:none !important}' +
            A + '.lmx-hero-line{position:relative}' +
            A + '.lmx-hero-snap .scroll__body{transition:none !important}' +
            A + '.lmx-hero-line .items-line__head,' + A + '.lmx-hero-line .items-line__title{display:none !important}' +
            A + '.lmx-dots{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:.55em;padding:.6em 1em;border-radius:99em;background:rgba(0,0,0,.35);z-index:6;pointer-events:none}' +
            A + '.lmx-dots i{display:block;width:.5em;height:.5em;border-radius:50%;background:rgba(255,255,255,.5);transition:width .45s cubic-bezier(.25,.8,.25,1),background-color .45s ease}' +
            A + '.lmx-dots i.on{width:2.2em;border-radius:99em;background:#fff}' +
            // История просмотров: широкие карточки с кадром.
            A + '.card--lmxhist{width:24em !important}' +
            A + '.card--lmxhist .card__view{height:13.5em !important;padding-bottom:0 !important;border-radius:1.1em;background-repeat:no-repeat !important;background-size:cover !important;background-position:center !important}' +
            A + '.lmx-hist__shade{position:absolute;left:0;right:0;bottom:0;height:80%;border-radius:0;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.6) 45%,rgba(0,0,0,0) 100%)}' +
            A + '.lmx-hist__text{position:absolute;left:1.1em;right:1.1em;bottom:1.2em;color:#fff}' +
            A + '.lmx-hist__t{font-size:1.05em;font-weight:600;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            A + '.lmx-hist__m{display:flex;gap:1em;font-size:.82em;line-height:1.3;opacity:.85;margin-top:.55em}' +
            A + '.items-line .card:not(.card--lmxhero){margin-right:.9em}' +
            A + '.lmx-hero__acts{display:flex;align-items:center;margin-top:1.1em}' +
            A + '.lmx-hero__btn{display:inline-block;padding:.75em 2em;border-radius:99em;background:#f5f5f7;color:#000;font-weight:600;font-size:1.08em}' +
            A + '.lmx-hero__circ{display:inline-flex;align-items:center;justify-content:center;width:2.6em;height:2.6em;margin-left:.8em;border-radius:50%;background:rgba(120,120,128,.5);color:#fff;font-size:1.1em;font-weight:500}' +
            // ===== ПЛИТКИ СЕРВИСОВ В СТИЛЕ КАНАЛОВ APPLE TV =====
            A + '.card--lmxstudio .card__view{background:linear-gradient(160deg,#2c2c2e 0%,#1c1c1e 100%);border-radius:1.15em;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07)}' +
            A + '.lmx-studio__name{font-weight:600;letter-spacing:-.01em}' +
            // ===== ШАПКА, МЕНЮ И НАСТРОЙКИ =====
            A + '.head__action{border-radius:50%;background:' + GLASS + '}' +
            A + '.menu__item,' + A + '.settings-param,' + A + '.settings-folder,' + A + '.selectbox-item{border-radius:.9em;transition:background-color .25s ease}' +
            A + '.menu__item.focus,' + A + '.menu__item.traverse,' + A + '.menu__item.hover,' +
            A + '.settings-folder.focus,' + A + '.settings-param.focus,' + A + '.selectbox-item.focus,' +
            A + '.settings-param-title.focus,' + A + '.simple-button.focus,' + A + '.full-person.focus,' +
            A + '.head__action.focus,' + A + '.head__action.hover,' + A + '.lmx-ord__btn.focus,' + A + '.lmx-ord__reset.focus' +
            '{background:rgba(255,255,255,.22) !important;color:#fff !important}' +
                        A + '.selectbox,' + A + '.settings,' + A + '.menu{background:rgba(30,30,35,.98)}' +
            A + '.settings__content,' + A + '.selectbox__content,' + A + '.modal__content,' + A + '.menu,' + A + '.wrap__left{background:#26262b !important}' +
            A + '.modal__content,' + A + '.selectbox__content{background:#1c1c1e;border-radius:1.4em}' +
            A + '.simple-button{border-radius:99em;background:' + GLASS + '}' +
            // ===== СТРАНИЦА ФИЛЬМА: НАЗВАНИЕ/ЛОГОТИП → МЕТАДАННЫЕ → ОПИСАНИЕ → КНОПКИ =====
            F + '.full-start__background{filter:brightness(.52)}' +
            F + '.full-start-new__right{width:' + logoWidth + ';max-width:' + logoWidth + '}' +
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
            // Большая белая кнопка «Смотреть» и круглые стеклянные кнопки.
            F + '.full-start-new__buttons{flex-wrap:nowrap;align-items:center;margin-top:0}' +
            F + '.full-start-new__buttons > .full-start__button{width:3.5em;height:3.5em;padding:0;border-radius:50%;justify-content:center;background:' + GLASS + ' !important;color:#f5f5f7;margin-right:.7em;transition:transform .45s ' + SPRING + '}' +
            F + '.full-start-new__buttons > .full-start__button span{display:none !important}' +
            F + '.full-start-new__buttons > .full-start__button:first-child{width:auto;padding:0 2.4em;border-radius:99em;background:#f5f5f7 !important;color:#000;font-weight:600;font-size:1.08em}' +
            F + '.full-start-new__buttons > .full-start__button:first-child span{display:inline !important}' +
            F + '.full-start-new__buttons > .full-start__button.focus{transform:scale(1.1);background:rgba(255,255,255,.34) !important;color:#fff}' +
            F + '.full-start-new__buttons > .full-start__button:first-child.focus{background:#fff !important;color:#000;box-shadow:0 0 0 .18em rgba(255,255,255,.35)}' +
            // Нижние разделы страницы (описание, актёры) оформлены в том же стиле.
            A + '.full-descr__text,' + A + '.full-descr__details{color:#d1d1d6}' +
            A + '.full-person{border-radius:1.1em}' +
            '@media (max-width:760px){' +
                A + '.card--lmxhero{width:94vw !important;margin-left:0 !important;margin-right:1em !important}' +
                A + '.card--lmxhero .card__view{height:52vw !important;border-radius:1.2em}' +
                A + '.card--lmxhero .lmx-hero__text{left:1.2em;right:1em;bottom:1.2em;max-width:85%}' +
                A + '.card--lmxhero .lmx-hero__title{font-size:1.7em}' +
                A + '.card--lmxhero .lmx-hero__o,' + A + '.lmx-hero__acts,' + A + '.lmx-dots{display:none}' +
                // На телефонах текст постоянно виден, а нижнее затемнение сохраняет читаемость.
                A + '.card--lmxhero .lmx-hero__text{opacity:1 !important;transition:none}' +
                A + '.card--lmxhero .lmx-hero__shade{background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.45) 40%,rgba(0,0,0,0) 75%)}' +
            '}';
    }
    function finalPageCss() {
        var sizes = {
            s: { w: '25vw', h: '14vh', mw: '42vw', mh: '12vh' },
            m: { w: '36vw', h: '20vh', mw: '60vw', mh: '15vh' },
            l: { w: '46vw', h: '27vh', mw: '76vw', mh: '19vh' },
            xl: { w: '56vw', h: '34vh', mw: '90vw', mh: '24vh' }
        };
        var size = sizes[getStr('lmx_logo_size', 'm')] || sizes.m;
        return 'body.lmx-full .full-start-new__title.lmx-has-logo{width:100%!important;max-width:100%!important;overflow:visible!important}' +
            'body.lmx-full .full-start-new__title .lmx-logo{' +
                'display:block!important;max-width:' + size.w + '!important;max-width:min(100%,' + size.w + ')!important;' +
                'max-height:' + size.h + '!important;width:auto!important;height:auto!important;' +
                'object-fit:contain!important;object-position:left center!important;vertical-align:top!important;box-sizing:border-box!important}' +
            'body.lmx-full .full-start__background,body.lmx-full .full-start-new__background{' +
                'position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:0!important;' +
                'display:block!important;width:100vw!important;height:100vh!important;min-height:100vh!important;max-width:none!important;' +
                'background-color:#09090b!important;background-repeat:no-repeat!important;background-size:cover!important;' +
                'background-position:center 20%!important;background-attachment:fixed!important;' +
                'filter:brightness(.92) contrast(1.03)!important;opacity:1!important;transform:none!important;' +
                'z-index:0!important;pointer-events:none!important}' +
            'body.lmx-full .full-start__background img,body.lmx-full .full-start-new__background img{' +
                'display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center 20%!important}' +
            'body.lmx-full .full-start-new__body{position:relative!important;z-index:1!important}' +
            'body.lmx-full .full-start-new__tagline,body.lmx-full .full-start-new__rate-line,body.lmx-full .full-start-new__details,body.lmx-full .lmx-descr,body.lmx-full .full-descr__text,body.lmx-full .full-descr__details{display:none!important}' +
            'body.lmx-full .full-start-new__right .lmx-info .lmx-ip:not(.lmx-next){display:none!important}' +
            'body.lmx-full .full-episode__description,body.lmx-full .full-episode__overview{display:none!important}' +
            '.lmx-progress,.lmx-episode-progress,.lmx-progress--row,.lmx-hist__bar{display:block!important;visibility:visible!important;opacity:1!important}' +
            '.lmx-progress i,.lmx-episode-progress i,.lmx-progress--row i,.lmx-hist__bar i{display:block!important;background:#e50914!important}' +
            '@media(max-width:760px){body.lmx-full .full-start-new__title .lmx-logo{max-width:' + size.mw + '!important;max-width:min(100%,' + size.mw + ')!important;max-height:' + size.mh + '!important}}';
    }
    function storedColorSetting(name) {
        var value = null;
        try {
            if (Lampa.Storage && Lampa.Storage.get) value = Lampa.Storage.get(name, null);
        } catch (e) {}
        if (value !== null && value !== undefined) return String(value);
        try {
            if (window.localStorage) {
                value = window.localStorage.getItem(name);
                if (value !== null && value !== undefined) return String(value);
            }
        } catch (e) {}
        return null;
    }
    function colorPluginThemeCss() {
        var pluginPresent = !!document.getElementById('color-plugin-styles');
        var colorKeys = ['color_plugin_main_color', 'color_plugin_enabled', 'color_plugin_highlight_enabled', 'color_plugin_dimming_enabled'];
        for (var k = 0; k < colorKeys.length && !pluginPresent; k++) {
            pluginPresent = storedColorSetting(colorKeys[k]) !== null;
        }
        if (!pluginPresent || storedColorSetting('color_plugin_enabled') === 'false') return '';

        var color = storedColorSetting('color_plugin_main_color') || '#353535';
        if (!/^#[0-9a-f]{6}$/i.test(color)) color = '#353535';
        var rgb = [
            parseInt(color.substr(1, 2), 16),
            parseInt(color.substr(3, 2), 16),
            parseInt(color.substr(5, 2), 16)
        ].join(',');
        // Берём сохранённые значения напрямую: так не зависит от порядка загрузки CSS плагинов.
        var accent = color;
        var accentRgb = rgb;
        var themes = ['body.lmx-hbo ', 'body.lmx-apple '];
        var css = '';

        if (storedColorSetting('color_plugin_dimming_enabled') !== 'false') {
            themes.forEach(function (theme) {
                var apple = theme.indexOf('apple') > -1;
                var palette = apple ? '#3b3b44 0%,#2c2c33 38%,#1f1f24 100%' : '#121216 0%,#0b0b0e 45%,#050507 100%';
                var panel = apple ? '#26262b' : '#0e0e12';
                css += theme + '{background:linear-gradient(180deg,rgba(' + accentRgb + ',.2) 0%,rgba(' + accentRgb + ',.08) 48%,rgba(' + accentRgb + ',.025) 100%),linear-gradient(180deg,' + palette + ') fixed!important}';
                css += theme + '.settings__content,' + theme + '.selectbox__content,' + theme + '.modal__content,' +
                    theme + '.menu,' + theme + '.wrap__left{background:linear-gradient(rgba(' + accentRgb + ',.12),rgba(' + accentRgb + ',.12)),' + panel + '!important}';
                css += theme + '.head__action,' + theme + '.items-line__more,' + theme + '.simple-button,' +
                    theme + '.lmx-hero__circ,' + theme + '.full-start-new__buttons > .full-start__button:not(.focus):not(:first-child){' +
                    'background-color:rgba(' + accentRgb + ',.28)!important}';
            });
        }
        if (storedColorSetting('color_plugin_highlight_enabled') !== 'false') {
            themes.forEach(function (theme) {
                css += theme + '.menu__item.focus,' + theme + '.menu__item.traverse,' +
                    theme + '.settings-param.focus,' + theme + '.settings-folder.focus,' +
                    theme + '.selectbox-item.focus,' + theme + '.selectbox-item:hover,' +
                    theme + '.items-line__more.focus,' + theme + '.head__action.focus,' +
                    theme + '.simple-button.focus,' + theme + '.full-person.focus,' +
                    theme + '.full-start-new__buttons > .full-start__button.focus,' + theme + '.torrent-item.focus{' +
                    'background:' + accent + '!important;color:#fff!important;' +
                    'box-shadow:inset 0 0 0 .12em rgba(255,255,255,.92)!important}';
                css += theme + '.lmx-sel{border-color:' + accent + '!important;box-shadow:0 0 .35em rgba(' + accentRgb + ',.5)!important}';
                css += theme + '.card.focus:not(.card--lmxhero) .card__view,' +
                    theme + '.card.hover:not(.card--lmxhero) .card__view{' +
                    'box-shadow:0 0 0 .18em ' + accent + '!important}';
                css += theme + '.card--lmxhero.focus .card__view{box-shadow:inset 0 -.2em 0 ' + accent + '!important}';
                css += theme + '.full-episode.focus{outline-color:' + accent + '!important}';
                css += theme + '.torrent-item.focus{border-color:' + accent + '!important}';
            });
        }
        return css;
    }
    function loadThemeFont() {
        if (getStr('lmx_theme', 'default') === 'default' || document.getElementById('lmx-font')) return;
        var l = document.createElement('link');
        l.id = 'lmx-font'; l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800&subset=cyrillic&display=swap';
        document.head.appendChild(l);
    }
    function applyThemeClass() {
        safe(loadThemeFont);
        if (document.body && document.body.classList) { document.body.classList.toggle('lmx-hbo', getStr('lmx_theme', 'default') === 'hbo'); document.body.classList.toggle('lmx-apple', getStr('lmx_theme', 'default') === 'apple'); }
    }
    function isMobile() { return (window.innerWidth || 1000) <= 760; }
    function applyFullClass() {
        var on = getBool('lmx_full', true) && !isMobile();
        if (document.body && document.body.classList) {
            document.body.classList.toggle('lmx-full', on);
            document.body.classList.toggle('lmx-logo-on', on && getBool('lmx_logo', true));
        }
    }

    function applyStyle() {
        safe(applyFullClass);
        safe(applyThemeClass);
        var s = document.getElementById('lmx-css');
        if (!s) {
            s = document.createElement('style');
            s.id = 'lmx-css';
            document.head.appendChild(s);
        }
        var colorCss = '';
        try { colorCss = colorPluginThemeCss(); } catch (e) {}
        s.textContent = buildCss() + themeCss() + appleCss() + finalPageCss() + colorCss;
    }

    // ===== ПОИСК ДАННЫХ КАРТОЧКИ: способы отличаются между версиями Lampa =====
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
        hiddenEls.push(el);
    }

    // Убираем стандартную метку TV только среди прямых дочерних элементов постера.
    function hideNativeTv(view) {
        var ch = view.children;
        for (var i = 0; i < ch.length; i++) {
            var n = ch[i];
            if (n.style.display === 'none' || (n.className && String(n.className).indexOf('lmx-') >= 0)) continue;
            if (n.children.length < 2 && RE_NATIVE_TV.test(n.textContent)) hideEl(n);
        }
    }
    // ===== ОФОРМЛЕНИЕ ПОСТЕРОВ =====
    function addTo(view, cls, html) {
        var d = document.createElement('div');
        d.className = cls;
        d.innerHTML = html;
        view.appendChild(d);
    }
    function addMark(view, m) {
        if (!m || !getBool('lmx_marks', true) || view.querySelector('.lmx-tr')) return;
        addTo(view, 'lmx-tr', '<span class="lmx-pill lmx-mark lmx-m-' + m.c + '">' + m.t + '</span>');
    }
    var GENRES = { 28: 'Боевик', 12: 'Приключения', 16: 'Мультфильм', 35: 'Комедия', 80: 'Криминал', 99: 'Документальный', 18: 'Драма', 10751: 'Семейный',
        14: 'Фэнтези', 36: 'История', 27: 'Ужасы', 10402: 'Музыка', 9648: 'Детектив', 10749: 'Мелодрама', 878: 'Фантастика', 10770: 'ТВ-фильм',
        53: 'Триллер', 10752: 'Военный', 37: 'Вестерн', 10759: 'Боевик', 10762: 'Детский', 10763: 'Новости', 10764: 'Реалити-шоу',
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

    // Карточка: жанр, название, рейтинг и год; для фильмов добавляется метка «Премьера» или «Скоро».
    function extras(el, d, type) {
        var view = el.querySelector('.card__view');
        if (!view) return;
        hideNativeTv(view);
        cinemaOverlay(view, d, type);
        var progress = watchProgress(d);
        if (progress) addProgressBar(view, progress.pct, 'lmx-progress');
        if (type === 'movie') addMark(view, movieMark(d));
    }

    // Сериалы: номер сезона и серии, метки «Новая серия» и «Сегодня».
    function renderTv(el, j) {
        var view = el.querySelector('.card__view');
        if (!view) return;
        var st = airedStats(j);
        if (!view.querySelector('.lmx-box') && st) {
            addTo(view, 'lmx-box', '<span class="lmx-pill">' + code(st.s, st.e) + '</span>');
        }
        addMark(view, tvMark(j));
    }

    function load(id, cb) {
        var key = 'tv/' + id;
        if (mem[key]) return cb(mem[key]);
        Lampa.Api.sources.tmdb.get(key, { language: 'ru-RU' }, function (j) {
            mem[key] = j || {};
            cb(mem[key]);
        }, function () {
            cb(null);
        }, { life: CACHE_MIN });
    }

    // Обрабатываем карточки небольшими партиями, чтобы не замедлять загрузку списков.
    var work = [], workTimer = null;
    function addWork(job) {
        work.push(job);
        if (!workTimer) workTimer = setTimeout(runWork, 30);
    }
    function runWork() {
        workTimer = null;
        var now = Date.now(), left = [], done = 0;
        for (var i = 0; i < work.length; i++) {
            var j = work[i];
            if (j.due > now || (!j.fast && done >= 6)) { left.push(j); continue; }
            if (!j.fast) done++;
            if (document.body.contains(j.el)) safe(j.fn);
        }
        work = left;
        if (work.length) workTimer = setTimeout(runWork, 120);
    }

    var pumpTimer = null;
    function pumpSoon() {
        if (pumpTimer) return;
        pumpTimer = setTimeout(function () { pumpTimer = null; pump(); }, 60);
    }
    function pump() {
        while (active < MAX_PARALLEL && queue.length) {
            (function (task) {
                active++;
                load(task.id, function (j) {
                    active--;
                    if (j) renderTv(task.el, j);
                    if (queue.length) setTimeout(pump, 120);
                });
            })(queue.shift());
        }
    }

    var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            if (e.target.__lmx) queue.push(e.target.__lmx);
        });
        pumpSoon();
    }, { rootMargin: '300px' }) : null;

    var activeFullPage = null;
    var activeTorrentMedia = null;
    var LMX_REL_NAMES = {
        bdremux: 'BDRemux', remux: 'Remux', bdrip: 'BDRip', bluray: 'Blu-ray', 'blu-ray': 'Blu-ray',
        blueray: 'Blu-ray', 'blue-ray': 'Blu-ray', 'web-dl': 'WEB-DL', webdl: 'WEB-DL',
        'web-dlrip': 'WEB-DLRip', webrip: 'WEBRip', hdrip: 'HDRip', hdtvrip: 'HDTVRip',
        hdtv: 'HDTV', dvdrip: 'DVDRip', tvrip: 'TVRip', satrip: 'SATRip', camrip: 'CAMRip'
    };
    var LMX_REL = /(?:^|[^a-z])(bdremux|remux|bdrip|blue?-?ray|web-?dl(?:rip)?|webrip|hdtvrip|hdrip|hdtv|dvdrip|tvrip|satrip|camrip)(?![a-z])/i;
    var LMX_RES = /(?:^|[^\d])(2160|1080|720|576|480)[pрi]/i;
    var LMX_SEASON = /(?:сезон[ыи]?|season|сезони)\s*:?\s*(\d+(?:\s*[-–]\s*\d+)?)|\bS(\d{1,2})(?:E\d+)?\b/i;
    function lmxTorrentName(title) {
        var text = String(title || ''), release = LMX_REL.exec(text), resolution = LMX_RES.exec(text), season = LMX_SEASON.exec(text), parts = [];
        if (release) parts.push(LMX_REL_NAMES[release[1].toLowerCase()] || release[1]);
        if (resolution) parts.push(resolution[1] + 'p');
        if (/(?:^|[^a-z])(?:hevc|[hx]\.?265)(?![a-z0-9])/i.test(text)) parts.push('HEVC');
        if (season) parts.push('Сезон ' + String(season[1] || Number(season[2])).replace(/\s+/g, ''));
        if (parts.length) return parts.join(' · ');
        return text.split(/\s\/\s|\[/)[0].trim() || text;
    }
    function lmxTorrentPills(item) {
        var result = { resolution: [], audio: [], channels: [] };
        item.find('.torrent-item__ffprobe > *').each(function () {
            var kind = /(?:^|\s)m-(\w+)/.exec(this.className), value = $(this).text().trim();
            if (kind && result[kind[1]] && value) result[kind[1]].push(value);
        });
        return result;
    }
    function lmxTorrentVoices(audio, title) {
        if (!audio.length) {
            var tail = String(title || '').split(']').pop().replace(/^[\s|,]+/, '').trim();
            return tail.length > 60 ? tail.slice(0, 58) + '…' : tail;
        }
        var russian = audio.filter(function (x) { return /^(ru|rus|рус)/i.test(x); });
        var rest = audio.filter(function (x) { return russian.indexOf(x) < 0; });
        var list = russian.concat(rest), visible = list.slice(0, 2).join(', ');
        return list.length > 2 ? visible + ' +' + (list.length - 2) : visible;
    }
    function lmxTorrentRow(element, item) {
        if (!item || !item.length || item.hasClass('lmx-tor-on')) return;
        element = element || {};
        var title = element.title || element.Title || item.find('.torrent-item__title').text();
        if (!title) return;
        var text = function (value, selector) {
            value = value === undefined || value === null ? '' : String(value).trim();
            return value || item.find(selector).text().trim();
        };
        var pills = lmxTorrentPills(item), qualities = pills.resolution.slice();
        var seeds = parseInt(element.seeds !== undefined ? element.seeds : element.Seeders, 10) || 0;
        var size = text(element.size !== undefined ? element.size : element.Size, '.torrent-item__size');
        var bitrate = parseFloat(element.bitrate) > 0 ? String(element.bitrate) : item.find('.torrent-item__bitrate span').text().trim();
        if (parseFloat(element.bitrate) > 0) {
            try { bitrate += ' ' + Lampa.Lang.translate('torrent_item_mb'); } catch (e) {}
        }
        var sub = [lmxTorrentVoices(pills.audio, title)].concat(pills.channels.slice(0, 1), bitrate).filter(Boolean);
        var meta = [
            text(element.tracker || element.Tracker, '.torrent-item__tracker'),
            text(element.date || element.Date, '.torrent-item__date')
        ].filter(Boolean);
        if (/dolby\s*vision|(?:^|[^a-z])dv(?![a-z])/i.test(title) && qualities.indexOf('DV') < 0) qualities.push('DV');
        var qualityHtml = qualities.map(function (quality) {
            return '<span class="lmx-tor__q' + (/^(4K|HDR|DV)/i.test(quality) ? ' lmx-tor__q--hi' : '') + '">' + esc(quality) + '</span>';
        }).join('');
        var row = $('<div class="lmx-tor"><div class="lmx-tor__l"><div class="lmx-tor__top">' + qualityHtml +
            '<span class="lmx-tor__name">' + esc(lmxTorrentName(title)) + '</span></div>' +
            '<div class="lmx-tor__sub">' + esc(sub.join(' · ')) + '</div>' +
            '<div class="lmx-tor__meta">' + esc(meta.join(' · ')) + '</div></div>' +
            '<div class="lmx-tor__r"><div class="lmx-tor__size">' + esc(size) + '</div>' +
            '<div class="lmx-tor__seeds' + (seeds ? '' : ' lmx-tor__seeds--none') + '">↑ ' + seeds + '</div></div></div>');
        item.find('.torrent-item__viewed').appendTo(row.find('.lmx-tor__top'));
        item.addClass('lmx-tor-on').append(row);
        schedule();
    }

    function scanTorrentProgress() {
        if (!getBool('lmx_progress', true)) return;
        var rows = document.querySelectorAll('.torrent-item:not([data-lmx-row-progress]),.torrent-file:not([data-lmx-row-progress]),.torrent-row:not([data-lmx-row-progress]),.torrent-list__item:not([data-lmx-row-progress])');
        var sharedProgress = activeTorrentMedia ? watchProgress(activeTorrentMedia) : null;
        rows.forEach(function (el) {
            var d = activeTorrentMedia || getData(el);
            if (!d) {
                var title = el.querySelector('.torrent-item__title,.torrent__title,.torrent-name,.torrent-title');
                var text = title && String(title.textContent || '').trim();
                if (text) d = { title: text, original_title: text };
            }
            if (!d) return;
            var progress = activeTorrentMedia ? sharedProgress : watchProgress(d);
            if (progress) {
                el.setAttribute('data-lmx-row-progress', '1');
                addProgressBar(el, progress.pct, 'lmx-progress lmx-progress--row');
            } else if (activeTorrentMedia) {
                el.setAttribute('data-lmx-row-progress', '1');
            }
        });
    }

    function scan() {
        var cards = document.querySelectorAll('.card:not([data-lmx])');
        cards.forEach(function (el) {
            el.setAttribute('data-lmx', '1');
            if (el.classList.contains('card--lmxhero')) { var ln = el.closest('.items-line'); if (ln) ln.classList.add('lmx-hero-line'); }
            if (el.classList.contains('card--lmxhero') || el.classList.contains('card--lmxstudio') || el.classList.contains('card--lmxhist')) return;

            var d = getData(el);
            if (!d) return;
            var type = typeOf(d);

            // На главной карточки обрабатываются сразу, в длинных списках — с задержкой.
            var fast = !el.closest('.category-full');
            addWork({ el: el, fast: fast, due: Date.now() + (fast ? 0 : 700), fn: function () { extras(el, d, type); } });

            if (type === 'tv') {
                var task = { el: el, id: d.id };
                if (io) { el.__lmx = task; io.observe(el); }
                else { queue.push(task); }
            }
        });
        scanTorrentProgress();
        if (activeFullPage) decorateEpisodes(activeFullPage.root, activeFullPage.media);
        if (!io) pumpSoon();
    }

    var timer = null;
    function schedule() {
        clearTimeout(timer);
        timer = setTimeout(function () { safe(scan); }, 120);
    }

    // После смены оформления удаляем прежние элементы, возвращаем скрытые и рисуем карточки заново.
    function resetCards() {
        hiddenEls.forEach(function (e) { e.style.display = ''; });
        hiddenEls = [];
        var mine = document.querySelectorAll('.lmx-box,.lmx-tr,.lmx-cin');
        for (var i = 0; i < mine.length; i++) mine[i].parentNode.removeChild(mine[i]);
        var bars = document.querySelectorAll('.lmx-progress,.lmx-episode-progress');
        for (var b = 0; b < bars.length; b++) if (bars[b].parentNode) bars[b].parentNode.removeChild(bars[b]);
        var rows = document.querySelectorAll('[data-lmx-row-progress]');
        for (var r = 0; r < rows.length; r++) rows[r].removeAttribute('data-lmx-row-progress');
        var cards = document.querySelectorAll('.card[data-lmx]');
        for (var k = 0; k < cards.length; k++) cards[k].removeAttribute('data-lmx');
        schedule();
    }

    // ===== ДЛИТЕЛЬНОСТЬ И СТАТУС ФИЛЬМА ИЛИ СЕРИАЛА =====
    function infoPills(m) {
        var p = [];
        var tv = typeOf(m) === 'tv';

        if (tv) {
            var rt = (m.episode_run_time && m.episode_run_time[0]) ||
                (m.last_episode_to_air && m.last_episode_to_air.runtime) || 0;
            if (rt) p.push({ t: fmtDur(rt) + ' / серия' });

            var st = m.status;
            if (st === 'Ended') p.push({ t: 'Завершено', c: 'lmx-done' });
            else if (st === 'Canceled') p.push({ t: 'Отменён', c: 'lmx-bad' });
            else if (st === 'Returning Series') {
                var n = m.next_episode_to_air;
                if (n && n.air_date) {
                    var d = dayDiff(n.air_date);
                    var extra = (d !== null && d > 1 ? fmtShort(n.air_date) + ', ' : '') + code(n.season_number, n.episode_number);
                    p.push({ t: 'Следующая серия: ' + rel(n.air_date) + ' (' + extra + ')', c: 'lmx-next' });
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
            // Дата выхода важнее статуса TMDB: «Released» иногда появляется раньше официальной даты.
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

    // Официальный логотип фильма из TMDB заменяет текстовый заголовок, если найден.
    var logoCache = {};
    var logoPending = {};
    function pickLogo(list) {
        var best = null, bestScore = -1, fallback = null, fallbackScore = -1;
        (list || []).forEach(function (l) {
            if (!l || !l.file_path) return;
            var lang = l.iso_639_1;
            var quality = (Number(l.vote_average) || 0) * 10 + Math.min(9, (Number(l.width) || 0) / 400);
            if (quality > fallbackScore) { fallbackScore = quality; fallback = l; }
            var sc = lang === 'ru' ? 3 : (lang === 'en' ? 2 : (!lang ? 1 : 0));
            if (!sc) return;
            sc = sc * 1000 + quality;
            if (sc > bestScore) { bestScore = sc; best = l; }
        });
        return (best || fallback) && (best || fallback).file_path;
    }
    function requestLogo(m, done) {
        var kind = typeOf(m), key = kind + m.id;
        if (key in logoCache) return done(logoCache[key]);
        if (logoPending[key]) { logoPending[key].push(done); return; }
        logoPending[key] = [done];
        function finish(path) {
            logoCache[key] = path || null;
            var waiting = logoPending[key] || [];
            delete logoPending[key];
            waiting.forEach(function (callback) { try { callback(logoCache[key]); } catch (e) {} });
        }
        Lampa.Api.sources.tmdb.get(kind + '/' + m.id + '/images?include_image_language=ru%2Cen%2Cnull', { language: 'ru-RU' }, function (j) {
            finish(pickLogo(j && j.logos));
        }, function () { finish(null); });
    }
    function applyCardLogo(card, m, path) {
        if (!card || !path || !getBool('lmx_logo', true)) return;
        var title = card.querySelector('.lmx-cin__t');
        if (!title || title.querySelector('img')) return;
        var img = document.createElement('img');
        img.alt = '';
        img.loading = 'lazy';
        img.src = imgUrl(path, 'w500');
        img.onerror = function () { title.textContent = m.title || m.name || ''; };
        title.textContent = '';
        title.appendChild(img);
    }
    // Пока загружается логотип, название скрыто, чтобы избежать мерцания; затем показываем доступный вариант.
    function reveal(r) { r.find('.full-start-new__title, .full-start-new__head, .full-start__head').addClass('lmx-reveal'); }
    function applyLogo(r, path) {
        var t = r.find('.full-start-new__title, .full-start__title').eq(0);
        if (!t.length || !path) { reveal(r); return; }
        r.find('.lmx-logo').remove();
        var img = $('<img class="lmx-logo">').attr('src', imgUrl(path, 'w780'));
        img.on('error', function () { img.remove(); t.removeClass('lmx-has-logo'); restoreHead(r); reveal(r); });
        img.on('load', function () { reveal(r); });
        t.addClass('lmx-has-logo').prepend(img);
        moveHead(r);
    }
    // Если есть логотип, год и страна перемещаются в строку перед длительностью.
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
    // Убираем дублирующую строку «Следующая: … / Осталось дней: …» из другого плагина.
    function hideDupes(r) {
        if (!r.find('.lmx-info .lmx-next').length) return;
        r.find('div,span').each(function () {
            if (this.children.length) return;
            var t = (this.textContent || '').trim();
            if (t.length < 80 && /^Следующая:\s/.test(t) && /Осталось/.test(t)) $(this).addClass('lmx-head-moved');
        });
    }
    function restoreHead(r) {
        r.find('.lmx-ip-head').remove();
        r.find(HEAD_SEL).removeClass('lmx-head-moved');
    }
    function loadLogo(r, m) {
        requestLogo(m, function (path) {
            applyLogo(r, path);
            if (!path) reveal(r);
        });
        setTimeout(function () { reveal(r); }, 1800);
    }

    // Предзагружаем логотип и фон, пока карточка находится в фокусе.
    var preSeen = {}, preTimer = null;
    function prefetchCard(d, card) {
        if (!d || !d.id) return;
        if (getBool('lmx_logo', true) && card) {
            requestLogo(d, function (path) { applyCardLogo(card, d, path); });
        }
        if (isMobile()) return;
        var kind = (d.name || d.first_air_date || d.number_of_seasons) ? 'tv' : 'movie';
        var key = kind + d.id;
        if (preSeen[key]) return;
        preSeen[key] = 1;
        try {
            // Запрос совпадает с запросом страницы фильма; Lampa кэширует ответ.
            if (Lampa.Api && Lampa.Api.full) Lampa.Api.full({ id: d.id, method: kind, source: d.source || 'tmdb', card: d }, function () {}, function () {});
        } catch (e0) {}
        try {
            if (d.backdrop_path) { var b = new Image(); b.src = imgUrl(d.backdrop_path, 'w1280'); }
            if (getBool('lmx_logo', true) && !(key in logoCache)) {
                requestLogo(d, function (path) {
                    if (path) { var im = new Image(); im.src = imgUrl(path, 'w780'); }
                });
            }
        } catch (err) {}
    }
    function initPrefetch() {
        if (!window.$ || window.__lmxPre) return;
        window.__lmxPre = true;
        $(document.body).on('hover:focus', '.card', function () {
            var card = this, d = getData(card);
            clearTimeout(preTimer);
            preTimer = setTimeout(function () { prefetchCard(d, card); }, 300);
        });
    }

    // Apple TV: фиксированные точки поверх баннера; активная плавно перемещается.
    function syncDots(card) {
        if (!card) return;
        var line = card.closest('.items-line');
        var n = parseInt(card.getAttribute('data-lmxn'), 10) || 0, idx = (parseInt(card.getAttribute('data-lmxi'), 10) || 0) % (n || 1);
        if (!line || n < 2) return;
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
        // Пересчитываем позицию после изменений шапки и рядов; обновляем стиль, только если она изменилась.
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
    // Баннер переключается каждые 8 секунд и возвращается к первому слайду; действия пользователя отменяют автопереключение.
    // Навигатор Lampa не отслеживает фокус глобально, поэтому проверяем несколько вариантов.
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
    // Возвращаемся к первому баннеру коротким переходом без прокрутки через остальные слайды.
    function wrapToFirst(line) {
        var first = line && line.querySelector('.card--lmxhero[data-lmxi="0"]');
        if (!first) return;
        var cl = line.querySelector('.card--lmxhero.focus');
        var n = cl ? (parseInt(cl.getAttribute('data-lmxn'), 10) || 0) : 0;
        var raw = cl ? (parseInt(cl.getAttribute('data-lmxi'), 10) || 0) : 0;
        line.classList.add('lmx-hero-snap');
        if (cl && n > 1 && raw >= n && cl.parentNode === first.parentNode) {
            // Если первый баннер ещё не отрисован, меняем его местами с готовой копией:
            // отрисованная копия становится первой, а оригинал переносится в конец.
            var parent = first.parentNode, after = cl.nextSibling;
            parent.insertBefore(cl, first);
            parent.insertBefore(first, after);
            cl.setAttribute('data-lmxi', '0');
            first.setAttribute('data-lmxi', String(n));
            // После перестановки пересчитываем позицию прокрутки, чтобы убрать пустой экран.
            try { if (window.Lampa && Lampa.Controller && Lampa.Controller.collectionFocus) Lampa.Controller.collectionFocus(cl, window.$ ? window.$(line) : line); } catch (e) {}
            try { if (window.$) window.$(cl).trigger('hover:focus'); } catch (e) {}
            var fix = function () {
                safe(function () {
                    var body = line.querySelector('.scroll__body');
                    var r = cl.getBoundingClientRect();
                    if (!body || !r.width) return;
                    if (Math.abs(r.left) < 4 && r.left > -4) return;
                    var m = /translate3d\(\s*(-?[\d.]+)px/.exec(body.style.transform || '');
                    var x = m ? parseFloat(m[1]) : 0;
                    body.style.transform = 'translate3d(' + Math.round(x - r.left - 1) + 'px,0,0)';
                });
            };
            setTimeout(fix, 50);
            setTimeout(fix, 250);
        } else {
            focusCard(first, line);
        }
        setTimeout(function () { line.classList.remove('lmx-hero-snap'); }, 200);
    }
    var AUTOPLAY_MS = 8000, ap = { idx: -1, t: 0 };
    function autoplay(card, line) {
        var raw = parseInt(card.getAttribute('data-lmxi'), 10) || 0, n = parseInt(card.getAttribute('data-lmxn'), 10) || 0, now = Date.now();
        if (raw !== ap.idx) { ap.idx = raw; ap.t = now; return; }
        // После копии первого баннера незаметно переходим к оригиналу.
        if (n > 1 && raw >= n) {
            if (now - ap.t >= 650) { wrapToFirst(line); ap.t = now; }
            return;
        }
        if (now - ap.t < AUTOPLAY_MS) return;
        ap.t = now;
        if (document.hidden || !line) return;
        var cn = '';
        try { cn = Lampa.Controller.enabled().name; } catch (e) {}
        if (cn && /menu|settings|select|modal|head|full|player/i.test(cn)) return;
        var all = line.querySelectorAll('.card--lmxhero'), next = null;
        for (var i = 0; i < all.length; i++) {
            if (parseInt(all[i].getAttribute('data-lmxi'), 10) === raw + 1) next = all[i];
        }
        if (next && next !== card) focusCard(next, line);
    }
    // Текущий баннер остаётся активным, даже когда фокус перемещается на меню или кнопки шапки.
    function setCur(el) {
        var line = el.closest('.items-line');
        if (!line) return;
        var old = line.querySelectorAll('.card--lmxhero.lmx-cur');
        for (var i = 0; i < old.length; i++) if (old[i] !== el) old[i].classList.remove('lmx-cur');
        el.classList.add('lmx-cur');
    }
    function initDots() {
        if (window.__lmxDots) return;
        window.__lmxDots = true;
        try {
            if (window.$) window.$(document.body).on('hover:focus', '.card--lmxhero', function () { var self = this; safe(function () { setCur(self); }); });
        } catch (e) {}
        document.addEventListener('keydown', function () {
            ap.t = Date.now();
        }, true);
        var apple = null, apTick = 0;
        var tm = setInterval(function () {
            safe(function () {
                if (document.hidden) return;
                if (++apTick % 10 === 0) apple = null;
                if (apple === null) apple = board() && !isMobile();
                if (!apple) return;
                var c = document.querySelector('.card--lmxhero.focus');
                if (!c) return;
                setCur(c);
                syncDots(c);
                autoplay(c, c.closest('.items-line'));
            });
        }, 300);
        if (tm && tm.unref) tm.unref();
    }

    // В теме HBO белая рамка перемещается между карточками.
    // Рамка находится внутри карточки с фокусом и движется вместе с рядом без покадровых вычислений.
    // Перемещение — разовая FLIP-анимация от предыдущей позиции.
    function initSelector() {
        if (window.__lmxSel || !window.$) return;
        window.__lmxSel = true;
        var box = null, cur = null;
        function hide() { if (box) box.classList.remove('on'); cur = null; }
        function follow(el) {
            if (!document.body.classList.contains('lmx-hbo') || isMobile()) return;
            if (el.classList.contains('card--lmxhero')) { hide(); return; }
            if (cur === el) return;
            var view = el.querySelector('.card__view') || el;
            if (!box) { box = document.createElement('div'); box.className = 'lmx-sel'; }
            var prev = (box.parentNode && box.classList.contains('on')) ? box.getBoundingClientRect() : null;
            box.style.transition = 'none';
            box.style.transform = 'none';
            el.appendChild(box);
            box.style.left = (view.offsetLeft - 3) + 'px';
            box.style.top = (view.offsetTop - 3) + 'px';
            box.style.width = (view.offsetWidth + 6) + 'px';
            box.style.height = (view.offsetHeight + 6) + 'px';
            if (prev && prev.width) {
                var nr = box.getBoundingClientRect();
                // Анимируем рамку только внутри одного ряда; при переходе в другой ряд она сразу появляется на новой карточке.
                if (nr.width && nr.height && Math.abs(prev.top - nr.top) < 6) {
                    box.style.transformOrigin = '0 0';
                    box.style.transform = 'translate3d(' + (prev.left - nr.left).toFixed(1) + 'px,' + (prev.top - nr.top).toFixed(1) + 'px,0) scale(' + (prev.width / nr.width).toFixed(3) + ',' + (prev.height / nr.height).toFixed(3) + ')';
                    void box.offsetWidth;
                    box.style.transition = 'transform .2s cubic-bezier(.2,.7,.3,1),opacity .15s ease';
                    box.style.transform = 'none';
                }
            } else {
                void box.offsetWidth;
                box.style.transition = 'opacity .12s ease';
            }
            box.classList.add('on');
            cur = el;
        }
        window.$(document.body).on('hover:focus', '.card', function () { var el = this; safe(function () { follow(el); }); });
        // Если событие hover:focus не сработало, самостоятельно ищем карточку с фокусом.
        var tm = setInterval(function () {
            safe(function () {
                if (document.hidden || !document.body.classList.contains('lmx-hbo')) return;
                var f = document.querySelector('.card.focus:not(.card--lmxhero)');
                if (!f) { if (cur) hide(); return; }
                if (f !== cur) follow(f);
            });
        }, 120);
        if (tm && tm.unref) tm.unref();
    }

    function onFull(e) {
        if (!e || (e.type !== 'complite' && e.type !== 'complete')) return;
        var m = e.data && e.data.movie;
        if (!m) return;
        var r = e.object.activity.render();
        activeFullPage = { root: r, media: m };
        safe(function () { decorateEpisodes(r, m); });
        setTimeout(function () { safe(function () { decorateEpisodes(r, m); }); }, 350);
        setTimeout(function () { safe(function () { decorateEpisodes(r, m); }); }, 1000);
        // На телефоне оставляем стандартный мобильный вид страницы Lampa.
        var useFull = getBool('lmx_full', true) && !isMobile();
        if (!useFull && document.body && document.body.classList) { document.body.classList.remove('lmx-full'); document.body.classList.remove('lmx-logo-on'); }

        // Не применяем оформление, если страницу уже изменяет другой плагин, например Cardify.
        var foreign = r.find('.cardify, .custom-ghost-main').length > 0;
        function yieldToForeign() {
            r.find('.lmx-descr,.lmx-logo').remove();
            r.removeClass('lmx-clean-page');
            reveal(r);
            r.find('.full-start-new__title').removeClass('lmx-has-logo');
            if (document.body && document.body.classList) document.body.classList.remove('lmx-full');
        }
        if (foreign) {
            yieldToForeign();
        } else {
            r.addClass('lmx-clean-page');
            if (useFull && document.body && document.body.classList) {
                document.body.classList.add('lmx-full');
                document.body.classList.toggle('lmx-logo-on', getBool('lmx_logo', true));
            }
        }
        if (!foreign) setTimeout(function () { if (r.find('.custom-ghost-main').length) yieldToForeign(); }, 800);

        // Не добавляем дублирующее описание и удаляем остатки от предыдущего рендера.
        if (!foreign) r.find('.lmx-descr').remove();

        // Загружаем логотип и в мобильной стандартной карточке, а не только в полноэкранной теме.
        if (!foreign && getBool('lmx_logo', true)) safe(function () { loadLogo(r, m); });

        if (!getBool('lmx_info', true)) return;
        var pills = typeOf(m) === 'tv' ? infoPills(m).filter(function (x) { return x.c === 'lmx-next'; }) : [];
        if (!pills.length) return;

        r.find('.lmx-info').remove();
        r.find('.lmx-ip-head').remove();

        var html = '<div class="lmx-info">' + pills.map(function (x) {
            return '<div class="lmx-ip ' + (x.c || '') + '">' + x.t + '</div>';
        }).join('') + '</div>';

        var anchor = r.find('.full-start-new__right > .lmx-descr').eq(0);
        if (!anchor.length) anchor = r.find('.full-start-new__buttons, .full-start__buttons').eq(0);
        if (anchor.length) anchor.before(html);
        else r.find('.full-start-new__right, .full-start__right').eq(0).append(html);
        moveHead(r);
        safe(function () { hideDupes(r); });
    }

    // ===== ЗАПУСК =====
    // Перехват устанавливается сразу, чтобы увидеть ряды, добавленные позже.
    var VERSION = '8.6-ru';
    safe(function () {
        var prev = String(Lampa.Storage.get('lmx_ver', '') || '');
        if (prev < '2.1') {
            Lampa.Storage.set('lmx_order', []);
            Lampa.Storage.set('lmx_hidden', []);
        }
        if (prev !== VERSION) Lampa.Storage.set('lmx_ver', VERSION);
    });
    safe(patchContentRows);

    function start() {
        safe(patchContentRows);
        safe(addSettings);
        safe(initRows);
        safe(function () {
            applyStyle();
            new MutationObserver(function (muts) {
                // Реагируем только на новые карточки, эпизоды и строки торрентов.
                for (var i = 0; i < muts.length; i++) {
                    var add = muts[i].addedNodes;
                    for (var k = 0; k < add.length; k++) {
                        var n = add[k];
                        if (n.nodeType === 1 && ((n.classList && (n.classList.contains('card') || n.classList.contains('full-episode') || n.classList.contains('torrent-item') || n.classList.contains('torrent-file') || n.classList.contains('torrent-row') || n.classList.contains('torrent-list__item'))) ||
                            (n.querySelector && n.querySelector('.card,.full-episode,.torrent-item,.torrent-file,.torrent-row,.torrent-list__item')))) { schedule(); return; }
                    }
                }
            }).observe(document.body, { childList: true, subtree: true });
            scan();
            Lampa.Listener.follow('full', function (e) { safe(function () { onFull(e); }); });
            Lampa.Listener.follow('activity', function (e) {
                if (!e || e.type !== 'init') return;
                if (e.component === 'torrents') {
                    var parent = null;
                    try { parent = Lampa.Activity.active(); } catch (err) {}
                    activeTorrentMedia = parent && parent.component === 'full' && activeFullPage ? activeFullPage.media : null;
                } else activeTorrentMedia = null;
            });
            Lampa.Listener.follow('torrent', function (e) {
                if (!e) return;
                if (e.type === 'render') safe(function () { lmxTorrentRow(e.element || {}, e.item); });
                if (e.type === 'onlong' && e.menu && e.element && e.element.Title &&
                    !(e.item && e.item.hasClass && e.item.hasClass('stv-tor-on'))) {
                    e.menu.unshift({
                        title: esc(e.element.Title).replace(/\$/g, '&#36;'),
                        subtitle: 'Полное название раздачи'
                    });
                }
            });
            safe(function () {
                if (Lampa.Storage && Lampa.Storage.listener && Lampa.Storage.listener.follow) {
                    Lampa.Storage.listener.follow('change', function (e) {
                        if (e && /^color_plugin_(enabled|main_color|highlight_enabled|dimming_enabled)$/.test(e.name || '')) safe(applyStyle);
                    });
                }
            });
            safe(function () {
                if (!document.head || !window.MutationObserver) return;
                new MutationObserver(function (muts) {
                    for (var i = 0; i < muts.length; i++) {
                        for (var j = 0; j < muts[i].addedNodes.length; j++) {
                            var node = muts[i].addedNodes[j];
                            if (node.nodeType === 1 && (node.id === 'color-plugin-styles' ||
                                (node.querySelector && node.querySelector('#color-plugin-styles')))) {
                                safe(applyStyle);
                                return;
                            }
                        }
                    }
                }).observe(document.head, { childList: true });
            });
            safe(initPrefetch);
            safe(initDots);
            safe(initSelector);
        });
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') start();
    });
})();
