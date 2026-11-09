/*
 * LMX Pack v10.331 — всё для Lampa в одном плагине: главная, каталоги (стриминги, аниме, дорамы), темы, страница фильма, NoCub
 *  1) Главная: афиша, каталоги, «Популярное на …», данные TMDB,
 *     история и «Похоже на то, что вам понравилось»; порядок и видимость рядов настраиваются
 *  2) Каталоги: Netflix, Apple TV+, HBO, Prime, Disney+, Paramount+, SkyShowtime, AMC+, аниме и дорамы — отдельные страницы с подборками
 *  3) Карточки: название, жанр, рейтинг и год на постере, значок С4Е32, метки «Новая серия» / «Сегодня» / «Новинка» / «Скоро»
 *  4) Темы: Кино (prem, по умолчанию), Стекло (apple), Облегчённая (default); афиша на весь экран (HBO, Apple) или компактная с автосменой (стандартная, аниме, дорамы)
 *  5) Страница фильма: оформление в стиле кино, логотип вместо названия, длительность и статус с обратным отсчётом, кнопки
 *  6) NoCub (в конце файла): скрывает элементы CUB; переключатели находятся в Настройки → NoCub
 *  Всё настраивается здесь: Lampa → Настройки → LMX Pack
 *
 * Структура файла (сверху вниз):
 *  настройки → наши ряды → порядок рядов и его экран → страница настроек → ряды на главной
 *  → страницы каталогов (аниме и дорамы: афиша сверху) → афиша и плитки каталогов → вспомогательные функции карточек → метки
 *  → CSS (основа, компактная афиша, темы HBO и Apple TV) → поиск данных карточки → оформление постера
 *  → страница фильма → кнопки → запуск → NoCub
 */
(function () {
    'use strict';

    // ===== Настройки (Lampa.Storage) =====
    function getBool(name, def) {
        var v = Lampa.Storage.get(name, def ? 'true' : 'false');
        return v === true || v === 'true';
    }
    function getStr(name, def) {
        var v;
        if (name === 'lmx_theme') {
            // По умолчанию используется тема «Кино» (prem); «Облегчённая» (default) — только если её выбрали явно
            var raw = Lampa.Storage.get(name, '');
            v = (raw === '' || raw === null || raw === undefined) ? 'prem' : String(raw);
        } else v = String(Lampa.Storage.get(name, def));
        // Старая тема «Кино» (hbo) удалена; её место заняла прежняя тема «Премьера» (prem)
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
    var SIZES = { s: 0.8, m: 0.95, l: 1.1, xl: 1.25 };
    var SIZE_NAMES = { s: 'Маленький', m: 'Средний', l: 'Большой', xl: 'Очень большой' };

    // ===== НАШИ РЯДЫ =====
    function dayStr(offset) {
        var d = new Date(Date.now() + offset * 86400000);
        var m = d.getMonth() + 1, dd = d.getDate();
        return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
    }
    function market() { return getBool('lmx_market', true); }
    var WATCH = 'watch_region=UA&with_watch_monetization_types=flatrate%7Cfree%7Cads%7Crent%7Cbuy';
    // Для украинского региона учитываем доступность в Украине; без фильтра региона запрос остаётся прежним
    function mkt(url, kind) {
        if (!market()) return [url];
        if (kind === 'movie') return [url + (url.indexOf('?') < 0 ? '?' : '&') + 'region=UA'];
        if (kind === 'tv') {
            // Исключаем ток-шоу (10767), новости (10763), мыльные оперы (10766), аниме (для него есть отдельный каталог; ключевое слово TMDB «anime», 210024) и тайтлы без оценок — они засоряли ряд «Популярные сериалы»
            return ['discover/tv?sort_by=popularity.desc&without_genres=10767%7C10763%7C10766&without_keywords=210024&vote_count.gte=15&' + WATCH + '&air_date.gte=' + dayStr(-60) + '&air_date.lte=' + dayStr(30), url];
        }
        return [url];
    }
    // index — только запасное значение; фактический порядок задаёт экран «Порядок главной»
    var ROWS = [
        { name: 'LmxPopularMovies', title: 'Популярные фильмы',    urls: function () { return mkt('movie/popular', 'movie'); },     index: 13 },
        { name: 'LmxNowPlaying',    title: 'Сейчас в кинотеатрах', urls: function () { return mkt('movie/now_playing', 'movie'); }, index: 14 },
        { name: 'LmxUpcoming',      title: 'Скоро в прокате',      urls: function () { return mkt('movie/upcoming', 'movie'); },    index: 15 },
        { name: 'LmxTopMovies',     title: 'Лучшие фильмы',        urls: function () { return mkt('movie/top_rated', 'movie'); },   index: 16 },
        { name: 'LmxPopularTv',     title: 'Популярные сериалы',   urls: function () { return mkt('tv/popular', 'tv'); },           index: 17 },
        { name: 'LmxHistory',      title: 'История просмотров',   custom: historyCall, index: 20 },
        { name: 'LmxRecs',         title: 'Похоже на то, что вам понравилось', custom: function () { return recsCall(this); }, index: 21 },
        { name: 'LmxRecsBy1',      title: 'Потому что вам понравилось…', custom: function () { return recsByCall(0); }, index: 22 },
        { name: 'LmxRecsBy2',      title: 'Потому что вам понравилось… (2)', custom: function () { return recsByCall(1); }, index: 23 },
        { name: 'LmxLater',        title: 'Посмотреть позже', custom: laterCall, index: 19 }
    ];

    // Максимум карточек в ряду на главной и в каталогах; остальные попадут в «Ещё». Чем меньше карточек, тем легче телевизору
    var ROW_MAX = 24;
    // Число слайдов афиши на главной и в каталогах: 12; каждый хранит в памяти телевизора большое изображение
    // Число слайдов афиши: 7 в теме «Стекло» (меньше нагрузка на ТВ), 12 в остальных темах
    function heroMax() { return getStr('lmx_theme', 'default') === 'apple' ? 7 : 12; }

    // Стриминги (ID провайдеров TMDB) и подборки по настроению
    var SERVICES = [
        ['hbo', 'HBO / Max', 1899], ['netflix', 'Netflix', 8], ['apple', 'Apple TV+', 350],
        ['amazon', 'Prime Video', 119], ['disney', 'Disney+', 337], ['paramount', 'Paramount+', 531],
        ['sky', 'SkyShowtime', 1773], ['amc', 'AMC+', 526], ['ua', 'Украинское', 9003], ['anime', 'Аниме', 9000, 'Популярное в аниме'], ['dorama', 'Дорамы', 9001, 'Популярное в дорамах']
    ];
    // На Siaivo (siaivo.*) и Lampaua (lampaua.*) не показываем наш каталог аниме — ни плитку, ни ряд на главной: у Siaivo есть собственный раздел, а страница аниме на Lampaua пуста
    var ON_SIAIVO = false;
    try { ON_SIAIVO = /siaivo|lampaua/i.test(String(location.hostname || '')); } catch (e) {}
    if (ON_SIAIVO) SERVICES = SERVICES.filter(function (x) { return x[0] !== 'anime'; });
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
        { name: 'LmxStudios', title: 'Каталоги', index: -1, custom: function () { return studioCall(this); } }
    );
    var n0 = 30;
    SERVICES.forEach(function (x) {
        if (x[0] === 'ua') return; // Добавляем только в «Каталоги», но не в ряд на главной
        ROWS.push({ name: 'LmxSvc_' + x[0], title: x[3] || ('Популярное на ' + x[1]), index: n0++,
            custom: function () { return (SVC[x[0]] && SVC[x[0]].hero ? popularCall : serviceCall)(this, x[0]); } });
    });
    // «По настроению» теперь находится в левом меню, а не занимает шесть рядов на главной
    function moodMenu() {
        if (!Lampa.Menu || !Lampa.Menu.addButton || document.querySelector('.menu__item.lmx-moodmenu')) return;
        var ico = '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2.5 4 2.5S16 14 16 14"/><path d="M9 9.5h.01M15 9.5h.01"/></svg>';
        var el = Lampa.Menu.addButton(ico, 'По настроению', function () {
            registerServicePage();
            Lampa.Activity.push({ url: '', title: 'По настроению', component: 'lmx_service', service_id: 'mood', page: 1 });
        });
        if (el && el[0]) el[0].classList.add('lmx-moodmenu');
    }

    var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';

    // ===== ПОРЯДОК ВСЕХ РЯДОВ ГЛАВНОЙ =====
    var seen = {};          // Ряды, прошедшие через ContentRows.add после установки перехватчика
    var diag = { patched: false, addCount: 0, lastTotal: 0, lastTagged: 0 };

    var stats = {};         // Сколько карточек вернул ряд при последней сборке главной

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

    // Порядок по умолчанию, пока пользователь не изменил его вручную
    var DEFAULT_ORDER = ['LmxHero', 'LmxStudios', 'LmxHistory', 'LmxLater', 'LmxPopularMovies', 'LmxSvc_hbo', 'LmxPopularTv', 'LmxSvc_apple', 'LmxNowPlaying',
        'LmxSvc_netflix', 'LmxSvc_amazon', 'LmxRecs', 'LmxRecsBy1', 'LmxRecsBy2', 'LmxSvc_disney', 'LmxSvc_paramount', 'LmxTopMovies', 'LmxUpcoming',
        'LmxSvc_sky', 'LmxSvc_amc'];

    function allRows() {
        var map = {}, list = [];
        function put(n, t, src) {
            if (!map[n]) { map[n] = { name: n, title: t, src: src }; list.push(n); }
        }
        ROWS.forEach(function (r) { put(r.name, r.title, 'LMX Pack'); });
    // Сторонние ряды (стандартные и добавленные другими плагинами) показываем, только если они не скрыты глобально и содержат карточки
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
    // Новый ряд, отсутствующий в сохранённом порядке, ставим после своего соседа из порядка по умолчанию, а не в конец. Например, «Посмотреть позже» — после «Истории»
        a.list.forEach(function (n) {
            if (saved.indexOf(n) >= 0) return;
            var di = DEFAULT_ORDER.indexOf(n), pos = -1, k;
            for (k = di - 1; k >= 0; k--) { pos = saved.indexOf(DEFAULT_ORDER[k]); if (pos >= 0) break; }
            if (di > 0 && pos >= 0) saved.splice(pos + 1, 0, n); else saved.push(n);
        });
        return saved;
    }
    // Новые ряды «Потому что вам понравилось…» по умолчанию скрыты, чтобы не нагружать главную; их можно включить в разделе «Порядок главной»
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

    // При регистрации ряда задаём ему своё место, при необходимости скрываем и помечаем его call
    // Обновляем index зарегистрированных рядов при каждой сборке главной, чтобы новый порядок применялся без перезапуска
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
    // Если Lampa добавляет ряды в список уже после нашего фильтра, пропускаем только свои
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
    // После формирования списка рядов главной расставляем их в заданном порядке независимо от того, как Lampa интерпретирует index
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

    // ===== ЭКРАН «ПОРЯДОК ГЛАВНОЙ» =====
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

    // Не перестраиваем список и не меняем коллекцию контроллера — только переставляем ряды на месте,
    // чтобы не нарушалась прокрутка окна, которой управляет сама Lampa.
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

    // Одна страница настроек с разделами
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
        var restart = function () { if (Lampa.Noty) Lampa.Noty.show('Перезапустите Lampa, чтобы применить изменения'); };
        var restyle = function () { setTimeout(function () { safe(applyStyle); }, 80); };
        var rebuild = function () { setTimeout(function () { safe(applyStyle); safe(resetCards); }, 80); };

        var H = mk('lmx');

        // ---- Внешний вид ----
        H.title('lmx_t_look', 'Внешний вид');
        H.select('lmx_theme', { prem: 'Кино', apple: 'Стекло', 'default': 'Облегчённая' }, 'prem', 'Тема',
            'Меняет оформление карточек, баннера, меню и страницы фильма. Кино — стиль стриминговых сервисов; Стекло — полупрозрачные панели на тёмном фоне; Облегчённая — простой и лёгкий вариант для слабых устройств. После выбора Lampa перезапустится автоматически', function () { reloadApp(); });
        H.select('lmx_card_size', { m: 'Стандартный', l: 'Немного больше', xl: 'Большой' }, 'm', 'Размер карточек', 'Ширина постеров в рядах', restyle);

        // ---- Главная ----
        H.title('lmx_t_home', 'Главная страница');
        H.button('lmx_order_btn', 'Порядок и видимость рядов', 'Перемещайте или скрывайте афишу, каталоги и подборки', openOrderModal);
        H.trigger('lmx_only_mine', true, 'Только наши подборки', 'Скрывает стандартные ряды Lampa и ряды других плагинов. Применяется при возвращении на главную', null);


        // ---- Фильтры ----
        H.title('lmx_t_filters', 'Фильтры');
        H.trigger('lmx_market', true, 'Только с украинским описанием', 'Скрывает фильмы и сериалы без описания на украинском и подбирает контент, доступный в Украине. Применяется после перезапуска', restart);

        // ---- Метки ----
        H.title('lmx_t_marks', 'Метки на карточках');
        H.trigger('lmx_marks', true, 'Показывать метки', '«Новая серия» и «Сегодня» — для сериалов, «Новинка» — для фильмов за последний месяц, «Скоро» — для будущих премьер', rebuild);
        H.trigger('lmx_timetable', true, 'Оформление «Расписания»', 'Стандартный экран «Расписание» Lampa с календарём выхода серий: стеклянные ячейки и отметка сегодняшнего дня', applyStyle);
        H.trigger('lmx_hide_viewed', true, 'Скрывать просмотренное в каталогах', 'Фильмы и сериалы с отметкой «Просмотрено» не показываются в рядах главной и каталогах. В «Истории» и «Позже» действуют отдельные правила', null);
        H.select('lmx_c_next', COLOR_NAMES, 'orange', 'Цвет новой серии и отметки «Сегодня»', 'Только в теме «Облегчённая»; в темах «Кино» и «Стекло» цвета встроены', restyle);

        // ---- Страница фильма ----
        H.title('lmx_t_page', 'Страница фильма');
        H.trigger('lmx_full', true, 'Кинооформление страницы', 'Полноэкранный фон с затемнением и крупный заголовок. На телефоне сохраняется стандартная страница Lampa', restyle);
        H.trigger('lmx_like', true, 'Кнопка «Нравится»', 'Добавляет фильм или сериал в список «Нравится» в закладках; на его основе строится ряд рекомендаций', null);
        H.trigger('lmx_pagebtns', true, 'Кнопка «Посмотреть позже»', 'Добавляет фильм в ряд «Посмотреть позже» на главной', null);
        H.trigger('lmx_tint', true, 'Цвет постера (тема «Стекло»)', 'Подсветка кнопок и разделов страницы фильма подстраивается под цвет постера', null);
        H.trigger('lmx_logo', true, 'Логотип вместо названия', 'Официальный логотип из TMDB вместо текстового названия, если он доступен', restyle);
        H.select('lmx_logo_size', { small: 'Меньше', normal: 'Стандартный', large: 'Больше' }, 'normal', 'Размер логотипа', 'Для страницы фильма на ТВ и компьютере', restyle);
        H.select('lmx_logo_size_mobile', { small: 'Меньше', normal: 'Стандартный', large: 'Больше' }, 'normal', 'Размер логотипа на телефоне', 'Отдельный размер для мобильной версии', restyle);
        H.button('lmx_btns_btn', 'Кнопки на странице фильма', 'Настройка порядка, цвета, значков, названий и папок', openButtonsEditor);

        H.title('lmx_t_ver', 'LMX Pack · версия ' + VERSION);
    }

    // ===== РЯДЫ НА ГЛАВНОЙ (наши) =====
    var rowsStarted = false;

    // Прогресс просмотра берём из данных самой Lampa (file_view / Timeline). Если данных нет, у карточки не будет полосы прогресса
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
    // Сколько минут осталось до конца по таймкоду Lampa; 0 означает, что данные неизвестны
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
    // Онлайн-источники могут нумеровать сезоны иначе: например, у «Люпена» в TMDB 3 сезона, а источник также отдаёт «Сезон 4»; таймкод привязан к номеру источника.
    // Поэтому дополнительно проверяем ещё 3 сезона за пределами списка TMDB — иначе просмотр нового эпизода из «4 сезона» не попадёт в карточку истории
            var known = Number(c.number_of_seasons) || (c.seasons && c.seasons.length) || 0;
            var seasons = Math.min(20, known ? known + 3 : 12), best = null;
    // Количество эпизодов берём из данных сезона, если они доступны, вместо 40 проверок для каждого сезона
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

    // Широкие карточки истории («Продолжить просмотр») с кадром и полосой прогресса используются в темах HBO и Apple TV
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
                            '</div><div class="lmx-hist__m">' + (prog && prog.s ? '<span>С' + prog.s + ' Э' + prog.e + '</span>' : '') +
                            (v ? '<span style="color:' + ratingColor(v) + '">&#9734; ' + v.toFixed(1) + '</span>' : '') +
                            (year ? '<span>' + year + '</span>' : '') +
                            (prog && prog.left > 0 ? '<span class="lmx-hist__left">' + (prog.left <= 10 ? 'просмотрено' : 'осталось ' + fmtDur(prog.left)) + '</span>' : '') + '</div></div>' +
                            (prog && prog.pct > 0 ? '<div class="lmx-hist__bar"><i style="width:' + prog.pct + '%"></i></div>' : ''));
    // Метки «Новая серия» / «Сегодня» / «Новинка» / «Скоро», как на обычных карточках. Для сериалов данные запрашиваются у TMDB, когда карточка видна
                        safe(function () {
                            var el = h[0];
                            if (m.first_air_date || m.number_of_seasons || m.original_name || (m.name && !m.title) || m.media_type === 'tv' || m.type === 'tv') {
                                el.__lmx = { el: el, id: m.id, noBox: list === 'history' };
                                if (io) io.observe(el); else { queue.push(el.__lmx); pumpSoon(); }
                            } else addMark(view[0], movieMark(m));
                        });
    // Долгое нажатие OK удаляет фильм из истории просмотров; карточка исчезает, фокус переходит на соседнюю
                        h.on('hover:long', function (ev) {
                            ev.stopImmediatePropagation();
                            safe(function () {
                                var nb = h.next('.card')[0] || h.prev('.card')[0];
                                Lampa.Favorite.remove(list, m);
                                if (Lampa.Noty) Lampa.Noty.show((list === 'history' ? 'Удалено из истории: ' : 'Удалено из списка «Позже»: ') + (m.title || m.name || ''));
    // Полностью удаляем карточку из DOM и просим Lampa заново собрать список выбираемых элементов; иначе навигатор
    // остаётся на месте удалённой карточки, а стрелки влево/вправо перестают работать (стрелка влево могла открыть меню)
                                var sc = h.closest('.scroll')[0];
                                h.remove();
                                try { Lampa.Controller.toggle(Lampa.Controller.enabled().name); } catch (e) {}
                                if (nb) { try { Lampa.Controller.collectionFocus(nb, sc || nb.parentNode); } catch (e) {} }
                            });
                        });
    // Наш обработчик должен сработать раньше штатного меню карточки
                        try {
                            var evs = window.$._data(h[0], 'events'), arr = evs && evs['hover:long'];
                            if (arr && arr.length > 1) { var mine = arr.pop(); arr.unshift(mine); }
                        } catch (e) {}
                    });
                },
                // Если просмотр не завершён и есть прогресс, открываем страницу и сразу нажимаем основную кнопку «Смотреть»; если кнопки нет, метка исчезает
                onlyEnter: function () { if (prog && prog.pct > 0 && prog.pct < 95 && !(prog.left > 0 && prog.left <= 10)) resumeFlag = { id: m.id, t: Date.now() }; openFull(m); }
            }
        };
        return it;
    }
    var resumeFlag = null;
    // Ряд из истории просмотров Lampa — запасной вариант, если «Продолжить просмотр» не отображается
    function historyCall() {
        return function (call) {
            var list = [];
            try { list = Lampa.Favorite.get({ type: 'history' }) || []; } catch (e) {}
            list = list.filter(function (c) { return c && c.id; }).slice(0, ROW_MAX);
            if (!list.length) return call();
            // Порядок как в истории Lampa: сначала последний просмотренный. Раньше незавершённые поднимались вверх, поэтому ряд начинался не с последнего
            list = list.map(function (c) { return histItem(c, watchProgress(c)); });
            call({ title: 'История просмотров', results: list, source: 'tmdb' });
        };
    }

    // Ряд «Посмотреть позже»: фильмы и сериалы, добавленные кнопкой на странице в стандартный список Lampa «Буду смотреть»; просмотренные сюда не попадают
    function laterCall() {
        return function (call) {
            var list = [], seen = {};
            try { seen = favIds('viewed'); list = Lampa.Favorite.get({ type: 'wath' }) || []; } catch (e) {}
            list = list.filter(function (c) { return c && c.id && !seen[c.id]; }).slice(0, ROW_MAX);
            if (!list.length) return call();
            call({ title: 'Посмотреть позже', results: list.map(function (c) { return histItem(c, null, 'wath'); }), source: 'tmdb' });
        };
    }

        // Убираем карточки с низким рейтингом (1–2 из 10) и без переведённого описания
    function cleanResults(list, skipText) {
        var min = parseInt(getStr('lmx_min_rating', '3'), 10) || 0;
        var strict = market(), hv = getBool('lmx_hide_viewed', true) ? favIds('viewed') : null;   // Не показываем отмеченное как просмотренное в каталогах и рядах
        return (list || []).filter(function (c) {
            if (!c) return false;
            if (hv && c.id && hv[c.id]) return false;
            if (min && c.vote_count > 2 && c.vote_average > 0 && c.vote_average < min) return false;
            if (strict && !skipText && !(c.overview && String(c.overview).trim())) return false;
            return true;
        });
    }

    // ===== Страницы стриминговых сервисов: отдельный раздел с подборками =====
    // SkyShowtime не работает в Украине, поэтому для него используем польский регион — иначе каталог будет пустым
    // Регион каталога: SkyShowtime — Польша, Paramount+ — США (в Украине он недоступен), остальные, включая Max, — Украина; если каталог пуст, используем США
    function prov(id) {
        var region = id === 1773 ? 'PL' : (id === 531 || id === 526) ? 'US' : 'UA';
    // В TMDB у Prime Video два идентификатора (9 и 119): в разных регионах заполнен то один, то другой
        return 'with_watch_providers=' + (id === 119 ? '9' + PIPE + '119' : id) + '&watch_region=' + region + '&with_watch_monetization_types=flatrate';
    }
    var PIPE = '%7C';
    // mf — фильтр фильмов, tf — сериалов; сети и студии точнее, чем фильтр «доступно в регионе»
    var DR_X = 'with_original_language=LANG&without_genres=16%7C10764%7C10767%7C10763';
    var DR_KO = DR_X.replace('LANG', 'ko');
    // Типичные ряды платформ: сериалы и фильмы по жанрам, странам и рейтингу — только в пределах каталога самой платформы
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
            tv('Драмы', '&with_genres=18'), tv('Боевики и приключения', '&with_genres=10759'), tv('Комедии', '&with_genres=35'),
            tv('Реалити', '&with_genres=10764', 20), tv('Аниме и анимация', '&with_genres=16', 30), tv('Документальные сериалы', '&with_genres=99', 20),
            tv('Корейские сериалы', '&with_origin_country=KR', 20), tv('Британские сериалы', '&with_origin_country=GB', 30),
            tv('Испанские сериалы', '&with_origin_country=ES', 20), tv('Скандинавские сериалы', '&with_origin_country=SE' + PIPE + 'NO' + PIPE + 'DK' + PIPE + 'FI', 20),
            { t: 'Лучшие фильмы', k: 'movie', q: P + '&vote_average.gte=7.3&vote_count.gte=800&sort_by=vote_average.desc' },
            mv('Боевики', '&with_genres=28'), mv('Комедии (фильмы)', '&with_genres=35'), mv('Фантастика', '&with_genres=878'),
            mv('Ужасы', '&with_genres=27'), mv('Драмы (фильмы)', '&with_genres=18'), mv('Триллеры', '&with_genres=53'),
            mv('Криминал', '&with_genres=80'), mv('Детективы', '&with_genres=9648'), mv('Мелодрамы', '&with_genres=10749'),
            mv('Приключения', '&with_genres=12'), mv('Фэнтези', '&with_genres=14'), mv('Для всей семьи', '&with_genres=10751'),
            mv('Анимация', '&with_genres=16'), mv('Документальные фильмы', '&with_genres=99', 20),
            { t: 'Классика (до 2000 года)', k: 'movie', q: P + '&primary_release_date.lte=1999-12-31&vote_count.gte=500&sort_by=vote_average.desc' }
        );
        return { mf: P, tf: P, extra: rows };
    }
    var SVC = {
    // Украинское кино и сериалы, снятые в Украине (по стране производства)
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
    // Западные платформы: каталог доступного контента (провайдер TMDB), собственные оригинальные проекты и студии в отдельных рядах
        hbo: provSvc(1899, [
            { t: 'Оригиналы Max', k: 'tv', q: 'with_networks=49' + PIPE + '3186&sort_by=popularity.desc' },
            { t: 'Блокбастеры Warner Bros.', k: 'movie', q: 'with_companies=174&sort_by=revenue.desc&vote_count.gte=1000' },
            { t: 'Вселенная DC', k: 'movie', q: 'with_companies=174&with_keywords=9715&sort_by=release_date.desc&release_date.lte={today}' },
            { t: 'Премиальные драмы HBO', k: 'tv', q: 'with_networks=49&with_genres=18&without_genres=10765&sort_by=popularity.desc' }
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
    // У AMC+ небольшой каталог, поэтому рядов немного; франшиза «Ходячие мертвецы» вынесена в отдельный первый ряд (поиск по названию, только сериалы)
        amc: provSvc(526, [
            { t: 'Ходячие мертвецы: вся франшиза', k: 'tv', q: 'query=The%20Walking%20Dead', search: true, min: 3,
              f: function (x) { return /walking dead/i.test((x.original_name || '') + ' ' + (x.name || '')) || /ходяч/i.test(x.name || ''); } },
            { t: 'Оригиналы AMC', k: 'tv', q: 'with_networks=174&sort_by=popularity.desc&vote_count.gte=100' }
        ], true),
    // Аниме — не провайдер, а вся японская анимация; студии и метки определяются по названию из TMDB (см. animeResolve)
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
                { t: 'Высокий рейтинг', k: 'tv', q: JA + '&vote_average.gte=8.2&vote_count.gte=300&sort_by=vote_average.desc' },
                { t: 'Аниме-фильмы', k: 'movie', q: JA + '&sort_by=popularity.desc&vote_count.gte=100' },
                { t: 'Боевики и приключения', k: 'tv', q: 'with_original_language=ja&with_genres=16,10759&sort_by=popularity.desc' },
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
    // Дорамы: в основном корейские, а также японские, китайские и тайские сериалы; без анимации, реалити и ток-шоу
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
                { t: 'Высокий рейтинг', k: 'tv', q: DR_KO + '&vote_average.gte=7.9&vote_count.gte=50&sort_by=vote_average.desc' },
                { t: 'Корейские фильмы', k: 'movie', q: 'with_original_language=ko&sort_by=popularity.desc&vote_count.gte=30' },
                { t: 'Драмы', k: 'tv', q: DR_KO + '&with_genres=18&sort_by=popularity.desc' },
                { t: 'Комедии', k: 'tv', q: DR_KO + '&with_genres=35&sort_by=popularity.desc' },
                { t: 'Криминал и триллеры', k: 'tv', q: DR_KO + '&with_genres=80' + PIPE + '9648&sort_by=popularity.desc' },
                { t: 'Фантастика и фэнтези', k: 'tv', q: DR_KO + '&with_genres=10765&sort_by=popularity.desc' },
                { t: 'Боевики и приключения', k: 'tv', q: DR_KO + '&with_genres=10759&sort_by=popularity.desc' },
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

    // «По настроению»: отдельная страница с рядами фильмов и сериалов; ряды загружаются порциями и не нагружают главную
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
    // Во всех каталогах, кроме аниме, «Популярные фильмы» и «Популярные сериалы» идут рядом; порядок важен для serviceCall
        out.push({ t: 'Популярные фильмы', k: 'movie', q: c.mf + '&sort_by=popularity.desc&vote_count.gte=50' });
        out.push({ t: key === 'anime' ? 'Главные хиты' : 'Популярные сериалы', k: 'tv', q: c.tf + '&sort_by=popularity.desc' });
        (typeof c.extra === 'function' ? c.extra() : c.extra).forEach(function (e) { out.push(e); });
        out.push({ t: 'Золотая коллекция (высший рейтинг)', k: 'tv', q: c.tf + '&sort_by=vote_average.desc&vote_average.gte=7.8&vote_count.gte=300' });
    // В каталоге аниме было слишком много рядов с повторами («Новые сериалы» ≈ «Новинки этого года», «Главные хиты» ≈ «В топе» и т. п.) — убираем дубли
        if (key === 'anime' && !forHome) {
            var drop = ['Новые сериалы', 'Популярные фильмы', 'Главные хиты', 'Золотая коллекция (высший рейтинг)'];
            out = out.filter(function (e) { return drop.indexOf(e.t) < 0; });
        }
    // В TMDB у многих новых украинских проектов не указана страна UA; дополняем каждый ряд запросом по языку оригинала, сетям (1+1 Украина, Новый канал) и студии Pronto Film, объединяя результаты
        if (key === 'ua') {
            var UA0 = 'with_origin_country=UA';
    // Сети TMDB: 1+1, 1+1 Украина, Новый канал, ICTV, ICTV2, СТБ, ТЕТ, 2+2, Киевстар ТВ
            var UA_NET = [1254, 7496, 3510, 1166, 9338, 1206, 1326, 5947, 8582];
            out.forEach(function (e) {
                if (!e.q || e.q.indexOf(UA0) !== 0) return;
                var rest = e.q.slice(UA0.length);
                e.alts = (e.k === 'tv' ? ['with_original_language=uk', 'with_networks=' + UA_NET.join(PIPE), 'with_companies=22436'] : ['with_original_language=uk', 'with_companies=22436']).map(function (a) { return a + rest; });
            });
        }
        var mapped = out.map(function (e) {
            return { alts: (e.alts || []).map(function (a) { return (e.search ? 'search/' : 'discover/') + e.k + '?' + a.replace('{today}', today); }), title: e.t, url: (e.search ? 'search/' : 'discover/') + e.k + '?' + e.q.replace('{today}', today), kind: e.k, f: e.f, min: e.min };
        });
        // «Похоже на то, что вам понравилось» показывается только в каталогах аниме и дорам и не влияет на главную
        if (!forHome && (key === 'anime' || key === 'dorama')) mapped.splice(1, 0, { title: 'Похоже на то, что вам понравилось', url: 'lmx://recs/' + key, kind: 'tv', recs: key, min: 6 });
        // «Новые серии» отображаются только на странице аниме: это понравившиеся пользователю сериалы, у которых за последние две недели вышел новый эпизод
        if (!forHome && key === 'anime') mapped.unshift({ title: 'Новые серии', url: 'lmx://newep/anime', kind: 'tv', newep: true, min: 1 });
        return mapped;
    }

    // Афиша платформ (Netflix, HBO и др.): фильмы и сериалы, которые сейчас популярны на платформе; только с украинским описанием
    function svcHeroList(key, done) {
        var c = SVC[key], left = 6, recMv = [], recTv = [], topMv = [], topTv = [], t0 = dayStr(0);
        function uaOk(m) {
            var ov = String(m.overview || '');
            return m && m.backdrop_path && m.poster_path && ov.length >= 30 && /[іїєґІЇЄҐ]/.test(ov);
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
        // Сначала новинки (4 фильма и 4 сериала), затем самые популярные за всё время, пока не наберём heroMax()
            take(recMv, 'movie', 4); take(recTv, 'tv', 4);
            take(topTv, 'tv', 4); take(topMv, 'movie', 4);
            take(topTv, 'tv', 12); take(topMv, 'movie', 12);
        // Чередуем фильмы и сериалы, чтобы одинаковые типы не шли подряд
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

    // Афиша аниме: самые популярные текущие премьеры и до 4 проектов со статусом «Скоро» (сериалы и фильмы), всего 12 слайдов
    function animeHeroList(JA, done) {
        var t0 = dayStr(0), left = 7, recent = [], top = [], soonTv = [], soonMv = [];
        // В афишу попадают только карточки с украинским описанием (с буквами і/ї/є/ґ) и названием без иероглифов
        function uaOk(m) {
            var ov = String(m.overview || ''), nm = String(m.title || m.name || '');
            return m && m.backdrop_path && m.poster_path && ov.length >= 30 && /[іїєґІЇЄҐ]/.test(ov) && !/[\u3040-\u30ff\u3400-\u9fff]/.test(nm);
        }
        function fin() {
            if (--left > 0) return;
            var seen = {}, out = [];
        // До 4 проектов со статусом «Скоро»; остальные слайды до heroMax() — сначала текущие премьеры, затем самые популярные за всё время
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

    // Ряд аниме и дорам на главной: «Популярное сейчас» — сериалы и фильмы по индексу популярности TMDB, основанному на недавней активности
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

    // Ряд на главной: новые фильмы и сериалы сервиса вместе, от самых свежих.
    // Если новинок мало (у сервисов с небольшим каталогом в Украине), дополняем популярными проектами
    // Если каталог платформы в украинском регионе пуст, повторяем тот же запрос для США
    // Если TMDB не возвращает данные провайдера, повторяем запрос по студиям и телеканалам платформы
    var ALT = {
        119: { movie: 'with_companies=20580' + '%7C56178%7C21', tv: 'with_networks=1024' },
        531: { movie: 'with_companies=4', tv: 'with_networks=4330%7C16%7C67%7C13' },
    // Для AMC+, если TMDB не возвращает данные провайдера, используем сериалы телеканала AMC; для фильмов замены нет, и пустой ряд не показывается
        526: { movie: 'with_companies=0', tv: 'with_networks=174' }
    };
    var ALT_SVC = { amazon: 1, disney: 1, paramount: 1, sky: 1, amc: 1 };
    var PROV_RX = /with_watch_providers=([^&]*)&watch_region=[^&]*&with_watch_monetization_types=[^&]*/;
    function empty(j) { return !j || !j.results || !j.results.length; }
        // ok(j, usedUrl): второй аргумент — адрес URL, который действительно вернул результат; для «Ещё» нужен именно он, а не пустой запрос для региона UA
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

    // Отдельная страница сервиса (компонент Lampa)
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
                var GROUP = 6, next = 0, built = false, firstRows = [], firstReady = false, tries2 = 0, relaxed = false, altQ = false;
                if (!cats.length) { self.activity.loader(false); self.empty(); return this.render(); }
    // Загружаем ряды порциями по 6: первая строит страницу, следующие загружаются, когда фокус приближается к концу, как на главной.
    // Ряды каждой порции появляются строго по порядку и по мере готовности; медленный ряд не теряется, а добавляется позже.
                function rowData(i) {
                    return { title: cats[i].title, results: res[i].slice(0, ROW_MAX).map(function (x) { var c = {}; for (var k in x) c[k] = x[k]; return c; }), url: cats[i].url2 || cats[i].url, source: 'tmdb', page: 1, more: res[i].length >= 18 && !cats[i].newep, total_pages: cats[i].newep ? 1 : 20 };
                }
        // Не показываем ряды с 1–2 карточками (например, в небольших каталогах Apple TV+): пустые ряды портят вид страницы
                function ok(i) { return res[i] && res[i].length >= (cats[i].min || (i < 4 ? 5 : 8)); }
                function fetchRow(i, done) {
                    if (res[i]) return done();
                    if (cats[i].newep) { newEpBuild(function (arr) { res[i] = arr || []; done(); }); return; }
                    if (cats[i].recs) { recsBuild(cats[i].recs, function (d) { res[i] = (d && d.results) || []; done(); }); return; }
                    var pages = (i < 3 || id === 'anime' || id === 'dorama') ? 2 : 1, alts = cats[i].alts || [], nu = 1 + alts.length, got = [], pend = pages * nu, seenC = {}, fin = false, t0 = Date.now(), errs = 0;
        // Запасной запрос для сборок Lampa, где discover по параметрам «язык=ja + жанр=анимация» ничего не возвращает: ключевое слово TMDB «anime» (210024)
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
                        if (cats[i].f) out.sort(function (a, b) { return String(a.first_air_date || '').localeCompare(String(b.first_air_date || '')); });
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
        // Если список пуст (сбой сети/TMDB или все результаты отсеяны), повторяем запрос, а затем убираем требование украинского описания только для этой страницы, чтобы каталог не оставался пустым
                    if (!data.length && tries2 < (id === 'anime' ? 3 : 2)) {
                        tries2++;
                        if (tries2 >= 2) relaxed = true;
                        if (tries2 === 3) altQ = true;
                        res.length = 0; next = 0; firstReady = false; firstRows = [];
                        return setTimeout(startFirst, 1200);
                    }
                    self.activity.loader(false);
                    if (!data.length) {
        // Показываем короткую причину на экране: в сторонних сборках Lampa с другими адресами запросы к TMDB могут не проходить
                        safe(function () {
                            var d = (window.__lmxDbg || []).filter(function (x) { return x.s === id; }), er = 0, to = 0, nn = 0;
                            d.forEach(function (x) { er += x.err || 0; if (x.n < 0) to++; else nn += x.n; });
                var why = to || er ? 'TMDB не отвечает (ошибок: ' + (er + to) + ')' : (nn ? 'найдено ' + nn + ', но нет постера/описания' : 'TMDB вернул пустые списки');
                            var srcs = ''; try { srcs = Object.keys(Lampa.Api.sources || {}).join(', ') + ' | ' + String(Lampa.Storage.get('source', '')); } catch (e) {}
                            if (Lampa.Noty) Lampa.Noty.show('Каталог пуст: ' + why + (srcs ? '. Источники: ' + srcs : ''));
                        });
                        return self.empty();
                    }
                    built = true;
                    self.build(data);
                    moreSoon();
                    if (heroL && heroL.length) heroAttach(heroTitle, heroL);
                    startLazy();
                }
    // Плитка «Ещё» в конце ряда появляется только после прокрутки; в коротких рядах, где все карточки уже на экране, прокрутки нет и оставалась только маленькая кнопка сверху.
    // После построения страницы и добавления каждого ряда один раз активируем такие ряды, чтобы появилась плитка
                var moreT = 0;
                function moreSoon() {
                    clearTimeout(moreT);
                    moreT = setTimeout(function () {
                        try {
                            (self.items || []).forEach(function (it) {
                                if (it && it.emit && it.data && it.data.results && it.items && !it.more && it.data.total_pages > 1 && it.data.results.length === it.items.length) it.emit('scroll');
                            });
                        } catch (e) {}
                    }, 800);
                }
                function put(r) {
                    if (built) { try { self.append(r); moreSoon(); } catch (e) { next = cats.length; } } else firstRows.push(r);
                }
                function startFirst() {
                    firstRows = [];
                    var timer = setTimeout(function () { firstReady = true; tryBuild(); }, 8000);
    // Первая порция строит страницу, когда готовы 3 верхних ряда, готовы все ряды или прошло 8 секунд; остальные добавляются по мере готовности
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
    // Вместо обхода всех рядов ищем фокус один раз за интервал; таймер работает, пока не загрузятся все ряды
                        var fo = root.querySelector('.focus'), fl = fo && fo.closest('.items-line');
                        if (!fl) return;
                        var lines = root.querySelectorAll('.items-line'), fi = [].indexOf.call(lines, fl);
                        if (fi < 0 || fi < lines.length - 3) return;
                        busy = true;
                        loadGroup(put, function () { busy = false; });
                    }, 400);
                }
                if (typeof self.append !== 'function') GROUP = cats.length;
                startFirst();
    // Для аниме и дорам используется собственная афиша, для платформ — их тренды; если загрузка занимает больше 4 секунд, страница строится без афиши
                function gotHero(l) { if (heroDone) return; heroDone = true; heroL = l; safe(function () { heroL.forEach(function (m) { heroPreload(imgUrl(m.backdrop_path, 'w1280')); }); }); tryBuild(); }
                var heroT = setTimeout(function () { if (!heroDone) { heroDone = true; tryBuild(); } }, (isAn || ALT_SVC[id]) ? 9000 : 4000);
                if (id === 'mood') { clearTimeout(heroT); heroDone = true; tryBuild(); return this.render(); }
                try { (isAn ? animeHeroList(SVC[id].hero, gotHero) : svcHeroList(id, gotHero)); } catch (e) { clearTimeout(heroT); heroDone = true; tryBuild(); }
                return this.render();
            };
            comp.onMore = function (data) {
                Lampa.Activity.push({ url: data.url, title: data.title || 'Ще', component: 'category_full', source: 'tmdb', page: 1 });
            };
            return comp;
        });
    }

    // ===== Баннер и плитки стримингов (собственные карточки Lampa.Maker) =====
    function imgUrl(path, size) {
        try { if (Lampa.TMDB && Lampa.TMDB.image) return Lampa.TMDB.image('t/p/' + size + path); } catch (e) {}
        return 'https://image.tmdb.org/t/p/' + size + path;
    }
    // Заранее загружаем и декодируем баннеры: браузер не отображает карточки за пределами экрана, поэтому без этого новый слайд сначала пустой или белый
    var heroImgs = {}, heroImgOrder = [];
    // Предзагружаем изображения по одному (загрузка и декодирование), чтобы не перегружать главный поток и не прерывать анимацию первого слайда
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
    // Изображение слайда уже загружено и декодировано?
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
            // Для сериалов показываем премьеры в заданном периоде и те, которые только что начались
            ['discover/tv?sort_by=popularity.desc&first_air_date.gte=' + dayStr(1) + '&first_air_date.lte=' + dayStr(w), 'tv', 1, 'soon'],
            ['discover/tv?sort_by=popularity.desc&first_air_date.gte=' + dayStr(-w) + '&first_air_date.lte=' + dayStr(0), 'tv', 1, 'new']
        ];
    }
    // Афиша: тренды недели, кинотеатры и громкие премьеры (скоро или только что вышедшие)
    // В темах Apple TV и HBO афиша занимает весь экран, с точками и автопрокруткой
    // Размер изображения афиши везде 1280 px: на телевизорах 4K изображения меньшего размера выглядят размытыми
    var HERO_IMG = 'w1280';
    function themeBase() { var t = getStr('lmx_theme', 'default'); return t === 'hbo' ? 'prem' : t; }
    // В теме «Премьера» название афиши оформлено как вордмарк: главное слово крупное, после двоеточия или тире — меньшая строка с разрядкой
    function heroTitle(t) {
        t = String(t || '');
        if (getStr('lmx_theme', 'default') !== 'prem') return esc(t);
        var mm = t.match(/^(.{2,}?)\s*[:\u2014\u2013]\s+(.+)$/), a = mm ? mm[1] : t, b = mm ? mm[2] : '';
        var sz = a.length <= 8 ? 1 : (a.length <= 13 ? 2 : (a.length <= 20 ? 3 : 4));
        return '<span class="lmx-w1 lmx-s' + sz + '">' + esc(a) + '</span>' + (b ? '<span class="lmx-w2">' + esc(b) + '</span>' : '');
    }
    // Тема «Облегчённая»: плоское оформление без стекла и размытия (ТВ/ПК)
    function journalOn() { return themeBase() === 'default' && !isMobile(); }
    function board() { var t = themeBase(); return t === 'apple' || t === 'hbo' || t === 'prem'; }
    function heroSources() {
        return [['trending/all/week', '', 1], ['movie/now_playing?region=UA', 'movie', 1]].concat(hypeSources());
    }
    // Минимальная популярность TMDB, при которой премьера считается громкой
    var HYPE_MIN_POP = 50;

    // Кэшируем запросы TMDB в памяти на 8 минут и объединяем одинаковые одновременные запросы, чтобы главная открывалась быстрее
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
    // Кэш ответов не растёт бесконечно, даже если телевизор работает несколько дней: храним 80 последних
                while (tcacheKeys.length > 80) delete tcache[tcacheKeys.shift()];
            }
            q.forEach(function (x) { try { x[0](tclone(j)); } catch (e) {} });
        }, function (err) {
            var q = tpend[key]; delete tpend[key];
            q.forEach(function (x) { try { if (x[1]) x[1](err); } catch (e) {} });
        });
    }

    // Слайды афиши из готового списка — общая логика для главной и страницы аниме
    // Оформление карточки как слайда афиши — общее для главной и страниц аниме и дорам
    // На телефоне слайды расположены стопкой и плавно сменяют друг друга, как в приложении Apple TV; есть автопрокрутка и свайп
    function initPhoneHero() {
        if (window.__lmxPH) return;
        window.__lmxPH = true;
        var touchT = 0, sx = 0, sy = 0;
        function lineEl() {
            var ls = document.querySelectorAll('.items-line.lmx-hero-line');
            for (var i = 0; i < ls.length; i++) if (ls[i].offsetParent !== null) return ls[i];
            return null;
        }
        function step(dir) {
            var line = lineEl();
            if (!line) return;
            var cs = line.querySelectorAll('.card--lmxhero');
            if (cs.length < 2) return;
            var cur = 0, i;
            for (i = 0; i < cs.length; i++) if (cs[i].classList.contains('lmx-pcur')) cur = i;
            var nx = (cur + dir + cs.length) % cs.length;
            window.__lmxPI = nx;
            for (i = 0; i < cs.length; i++) if (i !== nx) cs[i].classList.remove('lmx-pcur');
            cs[nx].classList.add('lmx-pcur');
    // Перезапускаем индикатор прогресса на точке
            var d = cs[nx].querySelector('.lmx-pdots i.on');
            if (d) { d.style.animation = 'none'; void d.offsetWidth; d.style.animation = ''; }
        }
    // Следим, чтобы активным оставался ровно один слайд; иначе афиша может стать пустой при перерисовке ряда
        setInterval(function () {
            safe(function () {
                if (!isMobile()) return;
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
        document.addEventListener('touchstart', function (e) {
            var t = e.touches && e.touches[0];
            if (!t || !e.target.closest || !e.target.closest('.card--lmxhero')) { sx = 0; return; }
            sx = t.clientX; sy = t.clientY;
        }, { passive: true, capture: true });
        document.addEventListener('touchend', function (e) {
            if (!sx) return;
            var t = e.changedTouches && e.changedTouches[0], x0 = sx; sx = 0;
            if (!t) return;
            var dx = t.clientX - x0, dy = t.clientY - sy;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) { touchT = Date.now(); safe(function () { step(dx < 0 ? 1 : -1); }); }
        }, { passive: true, capture: true });
    }
    // Название на кнопке «Каталоги» не обрезается: размер шрифта подстраивается под ширину кнопки
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
    function heroDecorate(h, m, idx, n, svc) {
    // На телефоне афиша использует вертикальный постер, как в приложении Apple TV; на ТВ и ПК — широкий фон
        var phone = isMobile() && !!m.poster_path;
        var heroPath = phone ? m.poster_path : m.backdrop_path, heroSize = phone ? 'w780' : HERO_IMG;
        h.addClass('card--lmxhero').attr('data-lmxu', imgUrl(heroPath, heroSize)).attr('data-lmxi', idx).attr('data-lmxn', n);
        if (h.closest) {
            var hl = h.closest('.items-line').addClass('lmx-hero-line');
        // Компактный вид используется в каталогах аниме и дорам и на главной в стандартной теме, где размер карточек не меняется
            if (svc) hl.addClass('lmx-mini lmx-mini--svc'); else if (!board()) hl.addClass('lmx-mini lmx-mini--def');
        }
        var view = h.find('.card__view');
        var heroUrl = imgUrl(heroPath, heroSize);
        heroPreload(heroUrl);
        // Большое изображение размещается поверх миниатюры: пока оно загружается, видна миниатюра, а не чёрный экран
        view.css('background-image', 'url(' + heroUrl + '),url(' + imgUrl(heroPath, phone ? 'w342' : 'w300') + ')');
        view.find('img').css('opacity', 0);
        h.find('.card__title,.card__age,.card__vote').remove();
        var v = Number(m.vote_average) || 0;
        var isTv = m.media_type === 'tv' || (!m.title && m.name);
        var year = String(m.release_date || m.first_air_date || '').slice(0, 4);
        var tagHtml = m.__tag ? '<span class="lmx-hero__tag lmx-t-' + m.__tag + '">' + (m.__tag === 'soon' ? 'Скоро · ' + fmtShort(m.release_date || m.first_air_date) : 'Уже вышел') + '</span>' : (m.__trend ? '<span class="lmx-hero__tag lmx-t-trend">' + (m.__air ? 'Выходит сейчас' : 'В тренде') + '</span>' : '');
        var premT = themeBase() === 'prem';
        view.append('<div class="lmx-hero__shade"></div><div class="lmx-hero__text">' + (premT ? '<div class="lmx-hero__kick">' + (tagHtml || (isTv ? 'Сериал' : 'Фильм')) + '</div>' : '') + '<div class="lmx-hero__title">' +
            heroTitle(m.title || m.name) + '</div><div class="lmx-hero__meta">' +
            (premT ? '' : tagHtml) +
            (v ? '<span class="lmx-hero__v" style="color:' + ratingColor(v) + '"><i>&#9734;</i> ' + v.toFixed(1) + '</span>' : '') +
            '<span>' + (isTv ? 'Сериал' : 'Фильм') + '</span>' + (year ? '<span>' + year + '</span>' : '') +
            (getStr('lmx_theme', 'default') === 'prem' && GENRES[(m.genre_ids || [])[0]] ? '<span>' + GENRES[(m.genre_ids || [])[0]] + '</span>' : '') +
            ((getStr('lmx_theme', 'default') === 'apple' || (isMobile() && themeBase() === 'default')) ? '<div class="lmx-hero__acts"><span class="lmx-hero__btn">&#9654;&#xFE0E;&nbsp; Смотреть</span><span class="lmx-hero__circ">+</span></div>' :
                (themeBase() === 'hbo' || themeBase() === 'prem') ? '<div class="lmx-hero__acts"><span class="lmx-hero__about"><i>i</i>' + (isTv ? 'О сериале' : 'О фильме') + '</span><span class="lmx-hero__btn">&#9654;&#xFE0E;&nbsp; Смотреть</span></div>' : '') + '</div>');
        if (phone) {
            var dh = '<div class="lmx-pdots">'; for (var di = 0; di < n; di++) dh += '<i' + (di === idx ? ' class="on"' : '') + '></i>'; dh += '</div>';
            view.find('.lmx-hero__text').append(dh);
            if (idx === 0) h.addClass('lmx-pcur');
            safe(initPhoneHero);
        }
        // Кнопка «+» в теме «Стекло» добавляет карточку в «Избранное» или удаляет её оттуда. Кнопка не получает фокус и не мешает прокрутке карусели; действие доступно долгим нажатием OK или касанием «+»
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
                    if (Lampa.Noty) Lampa.Noty.show(inBook() ? 'Добавлено в избранное' : 'Удалено из избранного');
                } catch (e) {}
            }
            paint();
            circ.on('click', function (ev) { ev.stopPropagation(); ev.preventDefault(); flip(); });
            h.on('hover:long', function (ev) { ev.stopImmediatePropagation(); flip(); });
    // Наш обработчик должен сработать раньше штатного меню карточки
            try {
                var evs = $._data(h[0], 'events');
                var arr = evs && evs['hover:long'];
                if (arr && arr.length > 1) { var mine = arr.pop(); arr.unshift(mine); }
            } catch (e) {}
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
                    onlyEnter: function () { openFull(m); }
                }
            };
            return it;
        });
    }

    // Страница сервиса строит ряды без наших params, поэтому оформляем афишу после появления карточек первого ряда
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
    // Lampa дорисовывает карточки ряда при прокрутке, поэтому после обнаружения ряда следим за ним, пока он находится на экране
        var lineMo = null;
        function watchLine() {
            if (lineMo) return;
            var line = findLine();
            if (!line) return;
    // Ряд найден: дальше следим только за ним и отключаем поиск по всему документу
            if (bodyMo) { bodyMo.disconnect(); bodyMo = null; }
            clearInterval(iv);
            lineMo = new MutationObserver(function () {
                if (!document.body.contains(line)) { lineMo.disconnect(); return; }
                safe(run);
            });
            lineMo.observe(line, { childList: true, subtree: true });
        }
    // Обрабатываем карточки сразу после появления, до первого кадра, чтобы ряд не успел отобразиться обычной подборкой
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

    // Не показываем аниме (японский язык и жанр «анимация») в афише главной: для него есть отдельная страница
    function isAnimeItem(m) {
        return !!m && m.original_language === 'ja' && (m.genre_ids || []).indexOf(16) >= 0;
    }

    function heroCall(row) {
        return function (call) {
            var srcs = heroSources(), left = srcs.length, all = [], seenIds = {};
            function fin() {
                if (--left > 0) return;
    // Объединяем дубли обычных карточек (тренды, кинотеатры) и громких премьер из отдельных источников
                var merged = {}, order = [];
                all.forEach(function (m) {
                    var e = merged[m.id];
                    if (!e) { merged[m.id] = e = { m: m, base: false, hype: false }; order.push(m.id); }
                    if (m.__hype) e.hype = true; else e.base = true;
                });
    // Для громких премьер берём самые популярные в заданном периоде: до 3 фильмов и 2 сериалов в группах «Скоро» и «Уже вышло»
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
    // В афишу попадают только проекты с украинским описанием; карточки с пустым или английским описанием не показываем
                    if (!/[а-яіїєґ]/i.test(String(m.overview || ''))) return;
                    if (!tag) {
                        if (!e.base) return;
    // Будущие премьеры показываем только как громкие и только в пределах заданного периода; более отдалённые (например, через 50 дней) не показываем
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
    // Громкие премьеры, особенно со статусом «Скоро», не должны выпадать из-за лимита: добавляем их первыми, остальные выбираем по популярности
                var lim = heroMax();
                var tg = list.filter(function (m) { return m.__tag === 'soon'; }).concat(list.filter(function (m) { return m.__tag === 'new'; })).slice(0, lim - 2);
                var rest = list.filter(function (m) { return !m.__tag; });
                list = tg.concat(rest.slice(0, lim - tg.length));
                list.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });
                if (!list.length) return call();
    // Храним изображения афиши в памяти, чтобы при возврате к первому баннеру карточка не оказывалась пустой
                safe(function () {
    // Сначала загружаем лёгкие миниатюры как мгновенную подложку, затем большие изображения
    // Порядок загрузки: большие изображения первых трёх слайдов, которые видны сразу; затем миниатюры всех слайдов и большие изображения остальных
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
    // Длинные названия (PARAMOUNT+, SKYSHOWTIME) должны помещаться на кнопке: уменьшаем шрифт после определения размера карточки и повторно после загрузки шрифта
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
    // AMC+ доступен только в США, поэтому логотип загружаем из американского каталога
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

    // Основа рекомендаций — понравившиеся проекты; если лайков ещё нет, используем историю просмотров.
    // Для каждого проекта объединяем рекомендации TMDB и похожие фильмы. Выше ставим частые совпадения с высоким рейтингом; просмотренное и понравившееся исключаем
    function favIds(type) {
        var o = {};
        try { (Lampa.Favorite.get({ type: type }) || []).forEach(function (c) { if (c && c.id) o[c.id] = 1; }); } catch (e) {}
        return o;
    }
    var recsAllBy = {};
    function genreIds(c) { return c.genre_ids || (c.genres || []).map(function (q) { return q && q.id; }) || []; }
        // Аниме — японская анимация; дорама — корейский сериал
    function isAnimeC(c) { return !!c && c.original_language === 'ja' && genreIds(c).indexOf(16) >= 0; }
    function isDoramaC(c) { return !!c && c.original_language === 'ko' && (c.media_type === 'tv' || !!c.name || !!c.first_air_date) && genreIds(c).indexOf(16) < 0; }
    function recsListHook() {
        var T = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
        if (!T || T.__lmxRecs || !T.list) return;
        T.__lmxRecs = true;
        var orig = T.list;
        T.list = function (params, ok, fail) {
            if (params && typeof params.url === 'string' && params.url.indexOf('lmx://recs/') === 0) {
                var recsAll = recsAllBy[params.url.slice(11)] || [];
                var p = params.page || 1, per = 20;
                var res = recsAll.slice((p - 1) * per, p * per).map(function (c) { var x = {}, q; for (q in c) x[q] = c[q]; return x; });
                return ok({ results: res, page: p, total_pages: Math.max(1, Math.ceil(recsAll.length / per)), total_results: recsAll.length, source: 'tmdb' });
            }
            return orig.apply(this, arguments);
        };
    }

    // ---- Качество подборки «Похоже на то, что вам понравилось»: профиль вкуса, порог качества, разнообразие, без продолжений одной франшизы, с причиной на карточке ----
        // В подборке оставляем только проекты с украинским описанием: кириллица без специфичных русских букв (ы, э, ъ, ё); иначе это русский или английский запасной текст
    function hasUaText(r) {
        var t = String(r && r.overview || '').trim();
        if (!/[\u0400-\u04FF]/.test(t)) return false;
        return /[\u0456\u0457\u0454\u0491\u0406\u0407\u0404\u0490]/.test(t) || !/[\u044B\u044D\u044A\u0451\u042B\u042D\u042A\u0401]/.test(t);
    }
    function yearOf(c) { var y = parseInt(String(c.release_date || c.first_air_date || '').slice(0, 4), 10); return y || 0; }
    function kindOf(c) { return (c.media_type === 'tv' || c.name || c.first_air_date || c.number_of_seasons) ? 'tv' : 'movie'; }
    function norm1(m) { var mx = 0, k, o = {}; for (k in m) if (m[k] > mx) mx = m[k]; for (k in m) o[k] = mx ? m[k] / mx : 0; return o; }
        // Профиль показывает близкие вам жанры, языки и десятилетия на основе предпочтений, а также жанры, которых вы избегаете
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
        // Порог качества отсеивает явно слабые проекты, но не затрагивает новинки с небольшим числом голосов
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
        // Ключ франшизы объединяет варианты вроде «Фильм 2», «Фильм: Подзаголовок» и «Фильм III»
    function franKey(c) {
        var t = String(c.title || c.name || c.original_title || c.original_name || '').toLowerCase();
        t = t.split(/[:–—]|\s-\s/)[0].replace(/^(the|a|an)\s+/, '').replace(/[^a-z0-9Ѐ-ӿ\s]/g, ' ').replace(/\s+(\d+|i{1,3}|iv|v|vi{0,3}|ix|x)$/, '').trim();
        var w = t.split(/\s+/).filter(Boolean).slice(0, 2).join(' ');
        return w.length >= 3 ? kindOf(c) + ':' + w : '';
    }
        // Итоговый порядок учитывает совпадение, вкус, нежелательные жанры и качество; затем убираем повторы франшиз и ограничиваем первые 40 результатов четырьмя предложениями на один лайк
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
        // На главной по очереди берём лучшие ещё не использованные совпадения от каждого лайка или просмотра, чтобы подборка не строилась на нескольких фильмах; подпись указывает источник карточки
    function spreadBySeed(arr, n, seedTitle) {
        var by = {}, order = [], used = {}, out = [];
        arr.forEach(function (x) { for (var k in x.by) { if (!seedTitle[k]) continue; if (!by[k]) { by[k] = []; order.push(k); } by[k].push(x); } });
        // Сначала источники с самым сильным первым совпадением
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
        // У карточки есть небольшая подпись с причиной («Потому что вам понравился X»); остальные карточки стандартные
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
                        view.append('<div class="lmx-why"><i>&#9829;</i><span>Бо ви лайкнули ' + esc(why) + '</span></div>');
                    });
                }
            }
        };
        return it;
    }
    // Ряд «Потому что вам понравился X»: рекомендации TMDB для одного лайка; два самых свежих лайка формируют два ряда, отсортированных по вашим предпочтениям
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
            var out = rankRecs(score, P, st).slice(0, ROW_MAX).map(function (x) { return x.c; });
            if (out.length < 6) return call();
            var data = { title: 'Потому что вам понравилось «' + st[seed.id] + '»', results: out, source: 'tmdb', page: 1, more: false };
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
        // На главной исключаем аниме; на страницах аниме и дорам используем только соответствующий тип контента
            var okSeed = mode === 'anime' ? isAnimeC : mode === 'dorama' ? isDoramaC : function (c) { return !isAnimeC(c); };
            hist = hist.filter(okSeed); liked = liked.filter(okSeed);
            var fromLikes = liked.length > 0;
            if (!fromLikes && !hist.length) return call();
            var rowTitle = fromLikes ? 'Похоже на то, что вам понравилось' : 'Похоже на то, что вы смотрели';
        // Уже просмотренное: история, лайки и статусы «просмотрено», «смотрю» и «не интересно»
            var skip = {}, k;
            ['history', 'like', 'viewed', 'look', 'thrown'].forEach(function (t) { var m = favIds(t); for (k in m) skip[k] = 1; });
        // Основа — лайки (вес 3) и несколько последних просмотров из истории (вес 1), чтобы подборка не была слишком маленькой
            var seeds = [], viewedMap = favIds('viewed'), thrownMap = favIds('thrown'), seedTitle = {};
        // Брошенные на середине проекты со статусом «не интересно» не становятся основой; полностью просмотренные лайки получают больший вес
            liked = liked.filter(function (c) { return !thrownMap[c.id]; });
            hist = hist.filter(function (c) { return !thrownMap[c.id]; });
            if (fromLikes) {
        // Берём 4 самых свежих лайка и 10 случайных из остальных: подборка разнообразнее, а число запросов не растёт. Выбор меняется раз в сутки и остаётся стабильным в течение дня благодаря кэшу
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
        // Дополняем подборку популярными проектами любимых жанров, определённых по лайкам, чтобы она не была слишком маленькой
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
    // Кнопка «Ещё» открывает полный список (до 100 проектов) из подборки; страницы возвращает перехваченный tmdb.list
                recsAllBy[mode] = full;
                recsListHook();
                var data = { title: rowTitle, results: out, source: 'tmdb', url: 'lmx://recs/' + mode, page: 1, more: true, total_pages: Math.max(2, Math.ceil(full.length / 20)) };
                recsCaches[mode] = { key: key, t: Date.now(), data: data };
                call(data);
            }
    // Отправляем не более трёх запросов одновременно, чтобы не перегружать запуск главной
            var qi = 0;
            function pump() {
                if (qi >= jobs.length) return;
                var j = jobs[qi++];
                tget(j.url, { page: j.page }, function (res) {
                    cleanResults(res && res.results, false).forEach(function (r) {
                        if (!r.poster_path || skip[r.id] || !qualityOk(r) || !hasUaText(r)) return;
        // Не добавляем в рекомендации проекты, выпущенные до 2000 года
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

    // «Новые серии» аниме: понравившиеся сериалы, у которых эпизод вышел за последние 14 дней. Данные берём из кэша load(), выполняя по три запроса одновременно
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
                if (d && d >= lo && d <= hi && j.poster_path) {
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

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ КАРТОЧЕК =====
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
        return 'С' + s + 'Э' + e;
    }
        // Учитываем только уже вышедший контент: сезоны до последнего вышедшего эпизода и число вышедших эпизодов
        // TMDB включает в number_of_seasons и number_of_episodes анонсированные сезоны, которые ещё не вышли
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
        // Форматируем длительность: 105 → «1 ч 45 мин», 45 → «45 мин», 120 → «2 ч»
    function fmtDur(min) {
        min = Math.round(min);
        if (min < 60) return min + ' мин';
        var h = Math.floor(min / 60), m = min % 60;
        return h + ' ч' + (m ? ' ' + m + ' мин' : '');
    }
    // Число дней от сегодняшней даты до указанной: отрицательное значение означает дату в прошлом, null — дата неизвестна
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
        // Возвращает «сегодня», «завтра» или «через 3 дня»
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
    // ===== Штатный экран «Расписание» Lampa (календарь на 30 дней): стеклянные ячейки, более тёплый день с эпизодами, отметка «сегодня» и скруглённый кадр эпизода =====
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
            // Основная кнопка («Онлайн») не сжимается до иконки, даже если только что была создана заново и классы LMX ещё не назначены
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
        // Единый стиль карточек темы «Кино»
            ''+
                '.lmx-tr .lmx-pill,.lmx-box .lmx-pill{font-size:' + (0.72 * fs).toFixed(2) + 'em;padding:.28em .6em;border-radius:.55em;font-weight:500;letter-spacing:.02em}' +
                '.lmx-box .lmx-pill{background:rgba(30,32,40,.7);border:1px solid rgba(255,255,255,.32)}' +
                '.card .card__title,.card .card__age,.card .card__vote{display:none !important}' +
        // Используем собственные метки вместо штатных: убираем значки качества и типа от Lampa и других плагинов; наши метки имеют префикс lmx-
                '.lmx-sel{display:none;position:absolute;z-index:6;pointer-events:none;box-sizing:border-box;border:.16em solid #fff;border-radius:1em;opacity:0}' +
                '.lmx-sel.on{opacity:1}' +
                '.card--lmxhist .lmx-sel,.card--lmxstudio .lmx-sel{border-radius:0}' +
        // Широкие карточки истории («Продолжить просмотр») используются во всех темах; меняются только скругления и размеры
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
            // В стандартной теме у карточки истории в фокусе белая рамка: штатное кольцо Lampa обрезается из-за overflow
                'body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .card--lmxhist.focus .card__view{box-shadow:0 0 0 .22em #fff !important}' +
                'body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .card--lmxhist.focus .card__view::after{display:none !important}' +
                '.lmx-hist__bar{position:absolute;left:0;right:0;bottom:0;height:.36em;background:rgba(255,255,255,.3);z-index:3}' +
                '.lmx-hist__bar i{display:block;height:100%;background:#fff}' +
                '.card .card__quality,.card .card__type,.card .card__marker{display:none !important}' +
            // Фон приложения для стандартной темы — нейтральный графитовый градиент
                'html{background:#0b0b0d !important}' +
                'body{background:linear-gradient(180deg,#1d1e22 0%,#131316 45%,#0b0b0d 100%) fixed !important}' +
                '.background{display:none !important}' +
                '.activity,.activity__body,.wrap{background:transparent}' +
            // Панели Lampa (меню, настройки, списки и окна) оформляются в цвет темы
                'body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .settings__content,body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .selectbox__content,body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .modal__content{background:#17181c !important}' +
            // Боковое меню стандартной темы прозрачное: виден тот же градиент, что и на странице
                'body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .menu,body:not(.lmx-hbo):not(.lmx-apple):not(.lmx-prem) .wrap__left{background:transparent !important;box-shadow:none !important;border:0 !important}' +
                '.lmx-cin{position:absolute;left:0;right:0;bottom:0;padding:2.2em .7em .6em;color:#fff;z-index:2;pointer-events:none;border-radius:0 0 1em 1em;' +
                    'background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.7) 45%,rgba(0,0,0,0) 100%)}' +
                '.lmx-cin__g{font-size:' + (0.72 * fs).toFixed(2) + 'em;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
                '.lmx-cin__t{font-size:' + (1.15 * fs).toFixed(2) + 'em;font-weight:600;line-height:1.15;margin:.15em 0 .35em;max-height:3.5em;overflow:hidden}' +
                '.lmx-cin__r{display:flex;justify-content:space-between;align-items:center;font-size:' + (0.9 * fs).toFixed(2) + 'em}' +
                '.lmx-cin__v i{font-style:normal}.lmx-cin__y{opacity:.85}' +
                // Метку «Просмотрено…» в истории поднимаем к верхней части постера, чтобы она не перекрывала название
                '.card .card-watched{top:2.8em !important;bottom:auto !important;left:.5em !important;right:.5em !important;z-index:5;font-size:.8em}' +
            (getStr('lmx_card_size', 'm') !== 'm' ?
                '.items-line .card:not(.card--lmxhero):not(.card--lmxstudio){width:' + (getStr('lmx_card_size', 'm') === 'xl' ? '19.5em' : '17em') + ' !important}' : '') +
            fullCss() +
            '.card--lmxstudio.focus .card__view{box-shadow:0 0 0 .22em #fff !important}' +
        // Убираем рамку, увеличение и скачок афиши уже на первом кадре, до применения компактного класса к ряду; иначе рамка мигает при загрузке
            '.card--lmxhero,.card--lmxhero.focus,.card--lmxhero.hover{transform:none !important;animation:none !important}' +
            '.card--lmxhero .card__view,.card--lmxhero.focus .card__view,.card--lmxhero.hover .card__view{transform:none !important;box-shadow:none !important;transition:none !important}' +
            '.card--lmxhero.focus .card__view::after,.card--lmxstudio.focus .card__view::after{display:none !important}' +
            '.lmx-hero__o{font-size:.85em;opacity:.85;margin-top:.35em;line-height:1.3;max-height:2.7em;overflow:hidden}' +
            '.card--lmxhero{width:' + (getStr('lmx_card_size', 'm') === 'xl' ? '50em' : getStr('lmx_card_size', 'm') === 'l' ? '45em' : '40em') + ' !important}' +
            '.card--lmxhero .card__view{padding-bottom:0 !important;height:' + (getStr('lmx_card_size', 'm') === 'xl' ? '25em' : getStr('lmx_card_size', 'm') === 'l' ? '22.5em' : '20em') + ';background-size:cover;background-position:center;border-radius:.8em;overflow:hidden;position:relative}' +
        // Уведомления Lampa в стандартной теме — компактная тёмная плашка внизу по центру с акцентной полосой; темы «Кино» и «Стекло» используют собственное оформление
            'body .noty{left:50%;right:auto;bottom:2.4em;max-width:70vw;border-radius:.8em;background:rgba(24,26,34,.96);color:#fff;border-left:.35em solid #65eaa7;box-shadow:0 .6em 1.6em rgba(0,0,0,.5);transform:translate(-50%,200%)}' +
            'body .noty--visible{transform:translate(-50%,0)}' +
            'body .noty__body{padding:.8em 1.6em;text-align:left}' +
            'body .noty__text{font-size:1.1em;font-weight:600}' +
            '.card--lmxhero.lmx-far{visibility:hidden}' +
        // Текущий и соседние слайды находятся на отдельных слоях: при перелистывании видеокарта только сдвигает их, не перерисовывая изображения
            '.lmx-hero-line:not(.lmx-mini) .card--lmxhero:not(.lmx-far){will-change:transform}' +
        // Текст слайда тоже находится на отдельном слое: его появление не создаёт слой во время движения афиши и не вызывает рывок в конце
            '.lmx-hero-line:not(.lmx-mini) .card--lmxhero:not(.lmx-far) .lmx-hero__text{will-change:opacity}' +
            'html body .full-start__button.button--book.lmx-bk-off path{fill:transparent !important}' +
        // Понравившаяся кнопка выделяется цветом темы: белым в стандартной, фиолетовым в «Кино», цветом постера или мягким синим в «Стекле»
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
        // Афиша на телефоне во всех темах: такой же отступ слева, как у других рядов (1.5em), слайд не выходит за правый край, следующий частично виден справа
    function heroPhoneCss() {
        var L = 'html body .items-line.lmx-hero-line ', X = ':not(#lmx-x)';
        // Круглая кнопка «+/✓» на афише имеет одинаковый стиль во всех темах; раньше без «Стекла» оставался только символ слева от кнопки
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
        // На телефоне афиша в стиле Apple TV: высокий постер, затемнение снизу, название по центру, строка «Фильм · год» и кнопки
            L + '.scroll__body' + X + '{display:grid !important;transform:none !important;transition:none !important;width:100% !important}' +
            // Как в Apple TV: быстрое (~0,35 с) одновременное растворение старого слайда в новом вместе с текстом и кнопками
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
    // Блоки под описанием на странице фильма: эпизоды, актёры и комментарии; единое оформление для всех тем с цветами текущей темы
    // Компактная афиша для страниц аниме и дорам: невысокая лента со скруглениями, следующий слайд частично виден справа
    function miniCss() {
        var M = 'html body .items-line.lmx-mini ', X = ':not(#lmx-x)';
        var sz = getStr('lmx_card_size', 'm'), W = sz === 'xl' ? '50em' : sz === 'l' ? '45em' : '40em', H = sz === 'xl' ? '25em' : sz === 'l' ? '22.5em' : '20em';
        function view(L, h) { return L + '.card--lmxhero' + X + ' .card__view,' + L + '.card--lmxhero.focus' + X + ' .card__view,' + L + '.card--lmxhero.hover' + X + ' .card__view{height:' + h + ' !important}'; }
        var S = 'html body .items-line.lmx-mini--svc ', D = 'html body .items-line.lmx-mini--def ';
        return '' +
        // Размер: на страницах аниме и дорам используется лента со следующим слайдом справа; на главной в стандартной теме — обычные карточки
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
            // Как в темах HBO и Apple: слайд в фокусе не увеличивается, не прыгает и не получает рамку; ряд просто плавно перемещается
            M + '.card--lmxhero' + X + ',' + M + '.card--lmxhero.focus' + X + ',' + M + '.card--lmxhero.hover' + X + '{transform:none !important;animation:none !important}' +
            M + '.card--lmxhero' + X + ' .card__view,' + M + '.card--lmxhero.focus' + X + ' .card__view,' + M + '.card--lmxhero.hover' + X + ' .card__view{transform:none !important;box-shadow:none !important;transition:none !important;animation:none !important}' +
            M + '.card--lmxhero' + X + ' .card__view::after,' + M + '.card--lmxhero.focus' + X + ' .card__view::after,' + M + '.card--lmxhero.hover' + X + ' .card__view::after{display:none !important}' +
            // Используем такую же плавную анимацию переключения слайдов, как в темах HBO и Apple
            M + '.scroll__body{transition:transform .9s cubic-bezier(.4,0,.2,1) !important}' +
            M + '.lmx-dots' + X + '{display:none !important}';
    }
    function detailCss(scope) {
        var D = scope || 'body.lmx-full ';
        return '' +
        // Эпизоды: скруглённые кадры, метка с номером, чистые карточки вместо пунктирной рамки
            D + '.full-episode{border-radius:1em}' +
            D + '.full-episode__img{border-radius:1em;overflow:hidden;background:linear-gradient(135deg,#26272e,#16171b)}' +
            D + '.full-episode__img img{object-fit:cover}' +
            D + '.full-episode__num{position:absolute;left:.6em;top:.6em;z-index:2;padding:.1em .6em;border-radius:.5em;background:rgba(0,0,0,.62);font-size:.95em;font-weight:700;line-height:1.5}' +
            D + '.full-episode__name{font-weight:600;margin-top:.5em}' +
            D + '.full-episode__date{opacity:.6;font-size:.9em}' +
            D + '.full-episode--next,' + D + '.full-episode--next .full-episode__img{border:0 !important;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}' +
            D + '.full-episode.focus::after,' + D + '.full-episode.focus .full-episode__img::after{border-radius:1em}' +
        // Актёры: круглые фотографии, имя под ними, роль отображается приглушённым цветом
            D + '.full-person:not(.full-person--small){display:flex;flex-direction:column;align-items:center;text-align:center;width:9.5em !important;margin-right:1.2em;padding:.4em .2em;border-radius:1em}' +
            D + '.full-person:not(.full-person--small) .full-person__photo{width:6.4em !important;height:6.4em !important;border-radius:50% !important;overflow:hidden;margin:0 0 .6em 0 !important;background:#25262c}' +
            D + '.full-person:not(.full-person--small) .full-person__photo img{width:100%;height:100%;object-fit:cover;border-radius:50%}' +
            D + '.full-person:not(.full-person--small) .full-person__body{margin:0 !important;width:100%}' +
            D + '.full-person:not(.full-person--small) .full-person__name{font-size:1.05em;font-weight:600;line-height:1.25;white-space:normal;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}' +
            D + '.full-person:not(.full-person--small) .full-person__role{font-size:.85em;opacity:.6;margin-top:.15em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            D + '.full-person:not(.full-person--small).focus{background:rgba(255,255,255,.12)}' +
        // Комментарии: пустая пунктирная карточка становится тонкой кнопкой; если комментариев нет, скрываем весь блок (см. onFull)
            D + '.full-review-add{width:auto !important;height:auto !important;min-height:0 !important;padding:.7em 1.4em !important;border:0 !important;border-radius:99em;background:rgba(255,255,255,.1);display:inline-flex;align-items:center;gap:.5em}' +
            D + '.full-review-add.focus{background:#fff;color:#111}' +
            D + '.lmx-nocomm{display:none !important}';
    }
        // На телефоне сохраняем штатную страницу фильма Lampa и не меняем её разметку; блоки под описанием оформляем как на большом экране:
        // актёры отображаются кругами, эпизоды — карточками, пустые комментарии — тонкой кнопкой; названия и заголовки рядов становятся заметнее
    function phoneCss() {
        var P = 'body.lmx-ph ';
        return '@media (max-width:760px){' +
            P + '.full-start-new__title{font-size:2.1em;font-weight:800;letter-spacing:-.01em;line-height:1.08}' +
            P + '.full-start-new__title.lmx-has-logo{display:block !important;overflow:visible !important;height:auto !important;max-height:none !important;font-size:0 !important;line-height:0 !important}' +
            P + '.lmx-logo{display:block;max-width:72vw;max-height:14vh;width:auto;height:auto;margin-bottom:.4em}' +
            'body.lmx-ph.lmx-logo-on .full-start-new__title{opacity:0;transition:opacity .4s ease-out}' +
            'body.lmx-ph.lmx-logo-on .full-start-new__title.lmx-reveal{opacity:1}' +
            'body.lmx-ph.lmx-logo-on .full-start-new__head{opacity:0;transition:opacity .4s ease-out}' +
            'body.lmx-ph.lmx-logo-on .full-start-new__head.lmx-reveal{opacity:1}' +
            P + '.items-line__title{font-size:1.2em;font-weight:700;letter-spacing:.01em}' +
            P + '.full-person:not(.full-person--small){width:7.6em !important}' +
            P + '.full-person:not(.full-person--small) .full-person__photo{width:5.2em !important;height:5.2em !important}' +
        '}' +
            // Одноколоночная страница Lampa (до 480 px): афиша на всю ширину с плавным затемнением снизу, название и рейтинг поверх неё без плашки, широкая белая кнопка «Смотреть»
        '@media (max-width:480px){' +
            P + '.full-start-new__poster{padding-bottom:125%}' +
            P + '.full-start-new__img{border-radius:0 !important;-webkit-mask-image:linear-gradient(to bottom,#000 58%,rgba(0,0,0,0) 100%);mask-image:linear-gradient(to bottom,#000 58%,rgba(0,0,0,0) 100%)}' +
            P + '.full-start-new__right{background:none !important;border-radius:0 !important;margin-top:-30vh !important;padding-top:0 !important;text-shadow:0 1px 8px rgba(0,0,0,.65)}' +
            P + '.full-start-new__tagline{display:none}' +
            P + '.full-start-new__rate-line{padding-top:.4em !important;margin-bottom:1.2em}' +
            P + '.full-start-new__details{opacity:.9}' +
            P + '.full-start-new__buttons{overflow-x:auto;-webkit-overflow-scrolling:touch}' +
            // Главная кнопка всегда первая в ряду; порядок кнопок настраивается, поэтому не определяем её по подписи «Смотреть»
            P + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n),' + P + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary{flex:0 0 auto;background:#fff !important;color:#111 !important;border-radius:99em !important;padding:.7em 1.6em !important;font-weight:700;text-shadow:none}' +
            P + '.full-start-new__buttons > .full-start__button:first-child:not(.lmx-n) span,' + P + '.full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary span{display:inline !important;margin-left:.45em}' +
        '}';
    }
    // Страница фильма или сериала в стиле кино: полноэкранный фон, затемнение, крупный заголовок и стеклянные кнопки
    function fullCss() {
        var B = 'body.lmx-full ';
        var compact = true;
        return '' +
            B + '.full-start-new__body{position:relative;height:84vh;padding-bottom:3vh;box-sizing:border-box}' +
            B + '.full-start-new__right{display:flex;flex-direction:column;justify-content:flex-end;max-width:56%}' +
            B + '.full-start-new__reactions,' + B + '.full-start-new .reaction__count{display:none !important}' +
            B + '.full-start-new__title{font-size:3em;line-height:1.05;font-weight:700}' +
            B + '.full-start-new__title.lmx-has-logo{font-size:0;line-height:0}' +
            // Lampa ограничивает заголовок одной строкой (line-clamp + overflow:hidden); в WebKit на Mac/iPhone из-за этого обрезалась нижняя часть логотипа
            B + '.full-start-new__title.lmx-has-logo{display:block !important;overflow:visible !important;-webkit-line-clamp:unset !important;line-clamp:unset !important;height:auto !important;max-height:none !important}' +
            // Сдвигаем фон-постер ниже шапки, чтобы иконки не закрывали лица в верхней части кадра
            'body.lmx-full .full-start__background{top:-1.2em !important}' +
            'body.lmx-logo-on.lmx-full .full-start-new__title{opacity:0;transition:opacity .5s ease-out}' +
            'body.lmx-logo-on.lmx-full .full-start-new__title.lmx-reveal{opacity:1}' +
            'body.lmx-logo-on.lmx-full .full-start-new__head{opacity:0;transition:opacity .5s ease-out}' +
            'body.lmx-logo-on.lmx-full .full-start-new__head.lmx-reveal{opacity:1}' +
        // У контейнера font-size:0, поэтому размеры задаются только в vw/vh/px: значение em здесь было бы равно нулю
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
        // Описание располагается в левой колонке над кнопками, как в других темах; раньше оно было плашкой справа
            B + '.full-start-new__right > .lmx-descr{position:static;width:100%;max-width:36vw;top:auto;right:auto;background:none;padding:0;border-radius:0;margin:0 0 1.2em;font-size:1.05em;color:#d5d8e4;z-index:auto}' +
            B + '.lmx-descr__t{-webkit-line-clamp:3}' +
        // Компактно располагаем кнопки в несколько строк без растягивания
            B + '.full-start-new__buttons{display:flex;flex-wrap:wrap;margin-top:.4em}' +
            B + '.full-start__button,' + B + '.full-start-new__buttons .simple-button{background:rgba(255,255,255,.14);border-radius:.8em;margin:0 .5em .5em 0;padding:.55em 1em;font-size:.95em}' +
            B + '.full-start__button.focus,' + B + '.full-start-new__buttons .simple-button.focus{background:#fff;color:#111}' +
            (compact ?
        // Подписи отображаются только у первых трёх кнопок и у кнопки в фокусе; остальные остаются иконками
                B + '.full-start-new__buttons > .full-start__button:nth-child(n+4):not(.button--priority):not(.lmx-primary) span{display:none}' +
                B + '.full-start-new__buttons > .full-start__button:nth-child(n+4).focus span{display:inline}' : '') +
            B + '.lmx-info .lmx-ip{background:rgba(255,255,255,.14)}' +
            B + '.full-start-new__left{display:none !important}' +
            mobileCss();
    }
    // Телефоны и узкие экраны: одноколоночная страница фильма, компактный баннер и плитки
    function mobileCss() {
        var B = 'body.lmx-full ';
        return '@media (max-width:760px){' +
            B + '.full-start-new__body{height:auto !important;min-height:56vh;padding-bottom:2vh}' +
            B + '.full-start-new__right{align-self:flex-end}' +
        // На телефоне скрываем копию описания, поскольку ниже оно уже отображается в блоке «Подробнее»
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
    // «hbo» — полноэкранный стиль HBO Max: постеры без подписей, белое кольцо фокуса,
    // аккуратная строка метаданных, белая кнопка «Смотреть» и круглые кнопки-иконки
    // В боковом меню длинные пункты («Настройки», «Информация») не помещались в подсветку фокуса и обрезались справа
    function menuFitCss() {
        return 'body .menu__item{padding-right:.6em}body .menu__item .menu__text{font-size:1.02em;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}';
    }
        // Текст страницы фильма (рейтинги, строка «сезоны · эпизоды · жанры», метки длительности и статуса, описание) оформляется в стиле темы.
        // Название и логотип не меняем. Эти стили действуют только на широком экране; на телефоне всё остаётся как есть
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
        // Нижняя часть страницы (описание, дата и страны, жанр, производство и теги, заголовки рядов, эпизоды) использует тот же оттенок, что и верхняя
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
        // «Кино»: чистая типографика без плашек; статус — подпись с линией слева
        var kino = rules('body.lmx-prem.lmx-full ', low({ text: '#c3c8ee', label: '#8c93bd', title: '#e4e7ff', badge: 'background:rgba(143,155,255,.22) !important;color:#fff !important;border-radius:.4em' }).concat(rate, split, [
            ['.full-start-new__details', 'font-size:1.02em;line-height:1.7;letter-spacing:.01em;color:#c3c8ee;opacity:1'],
            [PLAIN, 'color:#9aa0c4;font-size:1em'],
            [STATUS, 'color:#fff;font-weight:800;letter-spacing:.1em;text-transform:uppercase;font-size:.85em;border-left:.22em solid #8f9bff;border-radius:0;padding:.2em 0 .2em .7em;margin:.35em 0 .1em;background:none !important'],
            ['.lmx-info .lmx-ip.lmx-done::before,.lmx-info .lmx-ip.lmx-next::before,.lmx-info .lmx-ip.lmx-soon::before,.lmx-info .lmx-ip.lmx-bad::before', 'content:none !important'],
            ['.lmx-info', 'row-gap:.45em;margin-bottom:.9em'],
            ['.lmx-descr__t', 'color:#c3c8ee;line-height:1.6;font-size:1.02em']
        ]));
        // «Стекло»: матовые стеклянные плашки и описание на прозрачной панели
        var glass = rules('body.lmx-apple.lmx-full ', low({ text: 'rgba(255,255,255,.85)', label: 'rgba(255,255,255,.55)', title: '#fff', badge: 'background:rgba(255,255,255,.18) !important;color:#fff !important;border-radius:99em' }).concat(rate, split, [
            ['.full-start-new__details', 'font-size:1.02em;line-height:1.7;color:rgba(255,255,255,.78);opacity:1'],
            ['.lmx-info .lmx-ip', 'background:rgba(255,255,255,.14) !important;border:1px solid rgba(255,255,255,.22);border-radius:99em;padding:.35em .9em;font-size:.95em;color:#fff;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)'],
            ['.lmx-info .lmx-ip::before', 'content:none !important'],
            [STATUS, 'background:rgba(143,155,255,.4) !important;border-color:rgba(143,155,255,.7);font-weight:700'],
            ['.lmx-descr', 'background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:1.2em;padding:.8em 1.1em;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)'],
            ['.lmx-descr__t', 'color:rgba(255,255,255,.85);line-height:1.6']
        ]));
        // «Облегчённая»: плоские плашки; цветные статусы не меняются
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
        // Используем селекторы как в miniCss (тот же префикс, :not(#lmx-x) и !important), но размещаем их позже в CSS, чтобы они имели приоритет
        var X = ':not(#lmx-x)', M = 'html body .items-line.lmx-mini ', D = 'html body .items-line.lmx-mini--def ';
        var V = '.card--lmxhero' + X + ' .card__view,' + '.card--lmxhero.focus' + X + ' .card__view,' + '.card--lmxhero.hover' + X + ' .card__view';
        function all(P, sel, body) { return sel.split(',').map(function (q) { return P + q; }).join(',') + '{' + body + '}'; }
        return '@media (min-width:761px){' + [
        // Размер слайдов такой же, как на страницах каталогов аниме, дорам и других
            D + '.card--lmxhero' + X + '{width:58vw !important;margin-left:0 !important;margin-right:1.2em !important}',
            all(D, V, 'height:25vw !important')
        ].join('') + '}' + [
            // Заголовки рядов небольшие, набраны прописными буквами с разрядкой и тонкой линией до края
            'html body .items-line.items-line .items-line__title' + X + '{display:flex !important;align-items:center;font-size:.85em;letter-spacing:.2em;text-transform:uppercase;font-weight:700;opacity:.8}',
            'html body .items-line .items-line__title::after{content:"";flex:1;height:1px;margin:0 2em 0 1.2em;background:rgba(255,255,255,.14)}',
            // Каталоги: плоские тёмные плитки с логотипом и цветной полосой снизу
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
    // Общая механика «доски» (карусель-афиша, ряды, история, меню и страница фильма) для тем «Кино» и «Премьера» с собственным префиксом классов
    function boardCss(T, F) {
        var G = 'linear-gradient(135deg,#2f3dff 0%,#8a3bff 100%)';
        return '' +
            'html{background:#050507 !important}' +
            T + '{background:linear-gradient(180deg,#121216 0%,#0b0b0e 45%,#050507 100%) fixed !important;font-family:"Inter","Helvetica Neue",Arial,sans-serif}' +
            T + '.activity,' + T + '.activity__body{background:transparent}' +
        // Ряды
            T + '.items-line .card:not(.card--lmxhero){margin-right:.8em}' +
            // Добавляем справа такой же отступ, как слева (2.2em), через padding тела ряда: прокрутка Lampa учитывает его, в отличие от псевдоэлемента
            T + '.items-line:not(.lmx-hero-line) .scroll--horizontal .scroll__body{padding-right:1.4em !important}' +
            // Как в приложении: при прокрутке карточки уходят влево под боковую панель, а не обрезаются у края ряда
            T + '.items-line:not(.lmx-hero-line) .scroll{margin-left:-2.2em;padding-left:2.2em;-webkit-mask-image:none !important;mask-image:none !important}' +
            T + '.items-line__title{font-size:1.3em;font-weight:700;letter-spacing:.01em}' +
            // Карточки: постер без скругления, в фокусе — белая рамка
            T + '.card,' + T + '.card.focus,' + T + '.card.hover{transform:none !important;animation:none !important;transition:none !important}' +
            T + '.card__view{border-radius:1em;background:#12131f;animation:none !important;transition:transform .2s cubic-bezier(.25,.8,.25,1) !important}' +
            // В фокусе появляется белая рамка и небольшое увеличение, как в приложении HBO Max
            T + '.card.focus .card__view::after,' + T + '.card.hover .card__view::after{display:none !important}' +
            // Карточка в фокусе не меняется: вокруг неё перемещается белая рамка (.lmx-sel), которую рисует скрипт
            T + '.card.focus:not(.card--lmxhero) .card__view,' + T + '.card.hover:not(.card--lmxhero) .card__view{transform:scale(1.05);box-shadow:0 0 0 .12em rgba(255,255,255,.55),0 .5em 1em rgba(0,0,0,.6)}' +
            T + '.card.focus:not(.card--lmxhero),' + T + '.card.hover:not(.card--lmxhero){z-index:3}' +
            T + '.lmx-sel{display:none !important}' +
            T + '.card:not(.card--lmxhero){position:relative}' +
            T + '.items-line:not(.lmx-hero-line) .scroll__body{transition:transform .3s cubic-bezier(.3,.75,.25,1) !important}' +
            T + '.scroll--mask.lmx-nomask{-webkit-mask-image:none !important;mask-image:none !important}' +
            // Наши подписи оформлены в стиле HBO: тёмный градиент, жирное название, мелкие метаданные
            T + '.lmx-cin{padding:2.4em .7em .6em;border-radius:0 0 1em 1em;background:linear-gradient(to top,rgba(5,6,15,.96) 0%,rgba(5,6,15,.75) 50%,rgba(5,6,15,0) 100%)}' +
            T + '.lmx-cin__t{font-weight:700;letter-spacing:.01em}' +
            T + '.lmx-cin__t{font-size:1.2em;line-height:1.15;letter-spacing:-.005em}' +
            T + '.lmx-cin__r{margin-top:.1em}' +
            T + '.lmx-cin__v{display:inline-flex;align-items:center;gap:.3em;background:rgba(255,255,255,.14);padding:.2em .6em;border-radius:.4em;font-weight:700;-webkit-text-fill-color:#fff}' +
            T + '.lmx-cin__v i{-webkit-text-fill-color:currentColor;font-size:.9em}' +
            T + '.lmx-cin__y{font-weight:600;letter-spacing:.06em;opacity:.75}' +
            T + '.lmx-cin__g{opacity:.7;text-transform:uppercase;letter-spacing:.05em;font-size:.62em}' +
            // Метки похожи на штатные плашки HBO: маленькие, прописными буквами, без обводки
            T + '.lmx-pill{border:0 !important;border-radius:.25em;font-weight:800;text-transform:uppercase;letter-spacing:.05em}' +
            T + '.lmx-box .lmx-pill{background:rgba(5,6,15,.78) !important;color:#fff !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35)}' +
            T + '.lmx-pill.lmx-m-next{background:' + G + ' !important;color:#fff !important}' +
            T + '.lmx-pill.lmx-m-new{background:#fff !important;color:#05060f !important}' +
            T + '.lmx-pill.lmx-m-soon{background:rgba(5,6,15,.82) !important;color:#fff !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.55)}' +
        // ===== Баннер-афиша в стиле HBO Max: на весь экран, текст и кнопки слева, точки снизу =====
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
            // При переключении афиша плавно выезжает, а текст появляется немного позже
            T + '.lmx-hero-line .scroll__body{transition:transform .9s cubic-bezier(.4,0,.2,1) !important;will-change:transform}' +
            // Полноэкранный слайд перемещается почти вдвое дальше ленты в каталогах (100vw вместо 58vw), поэтому длительность увеличена пропорционально:
            // на экране скорость движения остаётся такой же, а переход выглядит столь же плавным
            T + '.lmx-hero-line:not(.lmx-mini) .scroll__body{transition:transform 1.1s cubic-bezier(.4,0,.2,1) !important}' +
            T + '.lmx-hero-line:not(.lmx-mini) .card--lmxhero .lmx-hero__text{transition:opacity .5s ease .45s}' +
            T + '.card--lmxhero .lmx-hero__text{opacity:0;transition:opacity .35s ease .2s}' +
            T + '.card--lmxhero.lmx-cur .lmx-hero__text,' + T + '.card--lmxhero.focus .lmx-hero__text{opacity:1}' +
            // Слайд немного уже экрана: по краям видны соседние слайды (~2em); высота афиши не меняется
            '@media (min-width:761px){' + T + '.card--lmxhero{width:calc(100vw - 6em) !important;margin-left:calc(-2.2em - 1px) !important;margin-right:3.2em !important}}' +
            '@media (min-width:761px){' + T + '.card--lmxhero[data-lmxi="0"]{width:calc(100vw - 6em) !important;margin-left:0 !important;margin-right:1em !important}}' +
            // Для последнего слайда оставляем место справа, чтобы лента прокрутилась до конца и предыдущий слайд не был виден слева
            // Прокрутка Lampa не учитывает правый отступ последней карточки, поэтому добавляем в конец пустой элемент (.lmx-endpad); слайды левее текущего скрываем после переключения
            '@media (min-width:761px){' + T + '.lmx-hero-line:not(.lmx-mini) .lmx-endpad{flex:none;width:8em;height:1px}' +
            'html body.lmx-prem .items-line.lmx-hero-line:not(.lmx-mini) .card--lmxhero.lmx-before:not(#lmx-x){visibility:hidden !important;transition:visibility 0s linear 1.3s !important}}' +
            // Если на экране один слайд, обрезаем слева край предыдущего (~2,2em); соседний справа и так не виден
            '@media (min-width:761px){' + T + '.lmx-hero-line:not(.lmx-mini) .scroll{clip-path:inset(0 0 0 2.2em)}}' +
            T + '.lmx-hero-line{position:relative}' +
            T + '.lmx-hero-line .items-line__head,' + T + '.lmx-hero-line .items-line__title{display:none !important}' +
            // Точки: активная отображается кольцом, которое заполняется за время показа слайда
            // Уведомления Lampa («Добавлено в…») оформлены в стиле темы: плашка снизу по центру вместо зелёной полосы на всю ширину
            T + '.noty{left:50%;right:auto;bottom:2.4em;max-width:70vw;border-radius:.6em;background:rgba(14,15,20,.96);color:#fff;border:1px solid rgba(255,255,255,.16);box-shadow:0 .6em 1.6em rgba(0,0,0,.6);transform:translate(-50%,200%)}' +
            T + '.noty--visible{transform:translate(-50%,0)}' +
            T + '.noty__body{padding:.8em 1.6em;text-align:center}' +
            T + '.noty__text{font-size:1.1em;font-weight:600;letter-spacing:.01em}' +
            T + '.lmx-dots{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:.8em;z-index:6;pointer-events:none}' +
            T + '.lmx-dots i{display:block;position:relative;width:.55em;height:.55em;border-radius:50%;background:rgba(255,255,255,.45)}' +
            T + '.lmx-dots i.on{width:1.3em;height:1.3em;background:transparent;box-shadow:inset 0 0 0 .14em rgba(255,255,255,.3)}' +
            T + '.lmx-dots i.on::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;border-radius:50%;border:.14em solid transparent;border-top-color:#fff;animation:lmxspin ' + (8) + 's linear both}' +
            '@keyframes lmxspin{to{transform:rotate(360deg)}}' +
        // История («Продолжить просмотр»): широкие карточки с кадром
            T + '.card--lmxhist{width:23em !important}' +
            T + '.card--lmxhist .card__view{height:12.9em !important;padding-bottom:0 !important;border-radius:0;background-repeat:no-repeat !important;background-size:cover !important;background-position:center !important}' +
            T + '.lmx-hist__shade{position:absolute;left:0;right:0;bottom:0;height:80%;border-radius:0;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.6) 45%,rgba(0,0,0,0) 100%)}' +
            T + '.lmx-hist__text{position:absolute;left:1em;right:1em;bottom:1.15em;color:#fff}' +
            T + '.lmx-hist__t{font-size:1.05em;font-weight:700;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            T + '.lmx-hist__m{display:flex;gap:1em;font-size:.82em;line-height:1.3;opacity:.85;margin-top:.5em}' +
        // Плитки стримингов
            T + '.card--lmxstudio.focus .card__view,' + T + '.card--lmxstudio.hover .card__view{transform:none;box-shadow:none !important}' +
            T + '.card--lmxstudio .card__view{border-radius:0;overflow:visible !important;background:linear-gradient(145deg,#1d2040,#0c0d22);border:1px solid rgba(255,255,255,.08)}' +
        // Меню, настройки и списки: белая подсветка в фокусе
            T + '.menu__item,' + T + '.settings-param,' + T + '.settings-folder,' + T + '.selectbox-item{transition:background-color .2s ease}' +
            T + '.menu__item.focus,' + T + '.menu__item.traverse,' + T + '.menu__item.hover,' +
            T + '.settings-folder.focus,' + T + '.settings-param.focus,' + T + '.selectbox-item.focus,' +
            T + '.settings-param-title.focus,' + T + '.simple-button.focus,' + T + '.full-person.focus,' +
            T + '.head__action.focus,' + T + '.head__action.hover,' + T + '.lmx-ord__btn.focus,' + T + '.lmx-ord__reset.focus' +
            '{background:rgba(255,255,255,.2) !important;color:#fff !important}' +
            T + '.selectbox,' + T + '.settings,' + T + '.menu{background:#0c0c10}' +
            T + '.settings__content,' + T + '.selectbox__content,' + T + '.modal__content,' + T + '.menu,' + T + '.wrap__left{background:#0e0e12 !important}' +
            T + '.modal__content{background:#121216}' +
        // ===== Страница фильма =====
            F + '.full-start__background{opacity:.78 !important}' +
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
        // Эпизоды сериала в штатном списке Lampa: широкие кадры с небольшим скруглением и белой рамкой в фокусе
            F + '.full-episode__img{border-radius:.45em;overflow:hidden}' +
            F + '.full-episode.focus .full-episode__img{box-shadow:0 0 0 .2em #fff}' +
            F + '.full-episode__name{font-weight:700}' +
        // Кнопки: белая «Смотреть» и круглые иконки; в фокусе заливка становится светлее
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
            // Фокус и кнопки в стиле «Премьера»: плотная белая рамка с небольшим подъёмом, прямоугольные скруглённые кнопки
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

    // ===== ТЕМА «ПРЕМЬЕРА» =====
    // Самостоятельная тема по дизайну B1/B2: ночной фон #0a0b10, афиша примерно на 2/3 экрана с названием-вордмарком и янтарной меткой,
    // белая прямоугольная кнопка «Смотреть» и стеклянные кнопки; под афишей сразу виден ряд каталогов, фокус — белая рамка с подъёмом.
    // Механика карусели, рядов, истории и меню общая с boardCss, но используется собственный класс lmx-prem, без lmx-hbo
    function premCss() {
        if (themeBase() !== 'prem') return '';
        var T = 'body.lmx-prem ';
        var F = 'body.lmx-prem.lmx-full ';
        var D = '"Oswald","Inter","Helvetica Neue",Arial,sans-serif';
        var BG = '#0a0b10', N = 'html body.lmx-prem .items-line', X = ':not(#lmx-x)';
        return '' +
            'html{background:' + BG + ' !important}' +
            T + '{background:' + BG + ' !important}' +
            // Афиша расположена ниже и ближе к верху, чтобы под ней были видны каталоги
            T + '.card--lmxhero .card__view,' + T + '.card--lmxhero.focus .card__view,' + T + '.card--lmxhero.hover .card__view{height:66vh !important;background-position:center 18% !important}' +
            T + '.card--lmxhero .lmx-hero__shade{height:100%;background:linear-gradient(0deg,' + BG + ' 0%,rgba(10,11,16,.7) 14%,rgba(10,11,16,0) 42%),linear-gradient(90deg,' + BG + ' 0%,rgba(10,11,16,.9) 24%,rgba(10,11,16,.45) 46%,rgba(10,11,16,0) 68%)}' +
            // Текст выровнен по нижнему краю афиши, а кнопки остаются на одной высоте; длинное название растёт вверх и не перекрывает метаданные и кнопки
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
            // Кнопки афиши: белая прямоугольная и стеклянная
            T + '.lmx-hero__acts{display:flex;flex-direction:row-reverse;justify-content:flex-end;align-items:center;gap:.9em;margin-top:1.6em}' +
            T + '.lmx-hero__btn{border-radius:.7em;font-size:.92em;padding:.7em 2em;background:#fff;color:#0a0b10;font-weight:700}' +
            T + '.lmx-hero__about{margin:0;font-size:.92em;padding:.7em 1.5em;border-radius:.7em;background:rgba(255,255,255,.16);font-weight:600}' +
            T + '.lmx-hero__about i{display:none}' +
            // Точки-сегменты расположены справа внизу афиши
            T + '.lmx-dots{left:auto;right:4.5em;transform:none;gap:.5em;top:auto}' +
            T + '.lmx-dots i{width:.7em;height:.32em;border-radius:.2em;background:rgba(255,255,255,.35)}' +
            T + '.lmx-dots i.on{width:2.4em;height:.32em;border-radius:.2em;background:#fff;box-shadow:none}' +
            T + '.lmx-dots i.on::after{display:none}' +
            // Ряды
            T + '.items-line__title{font-size:1.4em;font-weight:600;letter-spacing:0;color:#e8eaf2}' +
            T + '.card__view{border-radius:.8em;background:#14161f}' +
            T + '.lmx-cin{border-radius:0 0 .8em .8em}' +
            T + '.lmx-cin__t{font-family:' + D + ';text-transform:uppercase;font-weight:600;letter-spacing:.02em;line-height:1.05}' +
            // Плитки каталогов тёмные; название-вордмарк окрашено, в фокусе плитка светлеет и получает белую рамку
            T + '.card--lmxstudio{width:15em !important}' +
            T + '.card--lmxstudio .card__view{height:7.6em;background:#14161f !important;border:1px solid rgba(255,255,255,.08) !important;border-radius:.9em !important;overflow:hidden !important}' +
            T + '.card--lmxstudio .lmx-studio__name{font-family:' + D + ';text-transform:uppercase;font-weight:700;font-size:1.9em;letter-spacing:.06em}' +
            T + '.card--lmxstudio.focus .card__view,' + T + '.card--lmxstudio.hover .card__view{transform:scale(1.06) !important;background:#1c1f2c !important;border-color:transparent !important;box-shadow:0 0 0 .2em #fff,0 .6em 1.2em rgba(0,0,0,.55) !important}' +
            T + '.card--lmxhist .card__view{border-radius:.8em}' +
            // Страница (B2): вордмарк, категория, метаданные с метками, белая кнопка «Смотреть», стеклянные кнопки и карточки эпизодов
            F + '.full-start__background{opacity:.85 !important}' +
            F + '.full-start-new__right{max-width:50%}' +
            F + '.full-start-new__title{font-family:' + D + ';text-transform:uppercase;font-weight:700;letter-spacing:.01em;line-height:1;font-size:4.2em;margin-bottom:.25em}' +
            // Если есть логотип, текстовое название скрываем, чтобы не дублировать его; если логотипа нет, оставляем название
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
            // В небольших каруселях каталогов текст компактный и не выходит за пределы слайда
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

    // ===== ТЕМА «APPLE TV» =====
    // Погружающий чёрный интерфейс в стиле tvOS: большая афиша-баннер с кнопкой «Смотреть», карточки с упругим
    // подъёмом и мягкой тенью, метки-капсулы, стеклянные кнопки и белая кнопка «Смотреть» на странице фильма
    function appleCss() {
        if (getStr('lmx_theme', 'default') !== 'apple') return '';
        var A = 'body.lmx-apple ';
        var F = 'body.lmx-apple.lmx-full ';
        var GRAY = '#a1a1a6';
        var GLASS = 'rgba(255,255,255,.13)';
            // «Стекло»: тёмный цветной фон с размытыми световыми пятнами и полупрозрачные панели с тонкой светлой гранью
        var AURORA = 'radial-gradient(70vw 55vh at 12% 8%,rgba(88,86,214,.55),rgba(88,86,214,0) 62%),radial-gradient(60vw 50vh at 88% 18%,rgba(20,190,200,.34),rgba(20,190,200,0) 62%),radial-gradient(70vw 60vh at 72% 100%,rgba(200,60,150,.34),rgba(200,60,150,0) 62%),radial-gradient(60vw 50vh at 0% 100%,rgba(40,90,220,.3),rgba(40,90,220,0) 62%),linear-gradient(180deg,#10122a 0%,#0b0d1c 55%,#080a14 100%)';
            // Интенсивность цвета постера: [фон сверху, фон снизу, свечение кнопки без фокуса, свечение и рамка в фокусе]
        var TL = tintTL();
        var RIM = 'inset 0 0 0 1px rgba(255,255,255,.16),inset 0 1px 0 rgba(255,255,255,.34)';
        return '' +
            'html{background:#090b16 !important}' +
            A + '.background{display:none !important}' +
            // Цветное сияние — отдельный статичный слой: рисуется один раз и не перерисовывается при движении карточек, что заметно облегчает работу ТВ
            A.trim() + '::before{content:"";position:fixed;left:0;top:0;right:0;bottom:0;z-index:-1;pointer-events:none;background:' + AURORA + ';transform:translateZ(0);transition:opacity .5s ease}' +
            'body.lmx-apple.lmx-onfull::before{opacity:.3}' +
            // Цвет постера: отдельный статичный слой поверх свечения, отрисовывается один раз без анимации
            '#lmx-tintbg{display:none;position:fixed;left:0;top:0;right:0;bottom:0;z-index:-1;pointer-events:none;transform:translateZ(0)}' +
            'body.lmx-apple.lmx-onfull.lmx-tint #lmx-tintbg{display:block}' +
            'body.lmx-apple.lmx-onfull.lmx-tint .full-start-new__buttons .full-start__button.focus:not(.lmx-primary):not(:first-child){box-shadow:0 0 0 .14em rgba(var(--lmx-acc),' + TL[3] + '),0 0 1.1em rgba(var(--lmx-acc),' + TL[2] + ') !important}' +
            // Первая кнопка без фокуса белая с лёгким цветным свечением; в фокусе, как и остальные кнопки, получает рамку цвета постера
            'body.lmx-apple.lmx-onfull.lmx-tint .full-start-new__buttons > .full-start__button:first-child:not(.lmx-n),body.lmx-apple.lmx-onfull.lmx-tint .full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary{box-shadow:0 0 1.1em rgba(var(--lmx-acc),' + TL[2] + ') !important}' +
            'body.lmx-apple.lmx-onfull.lmx-tint .full-start-new__buttons > .full-start__button:first-child:not(.lmx-n).focus,body.lmx-apple.lmx-onfull.lmx-tint .full-start-new__buttons > .full-start__button.lmx-primary.lmx-primary.focus{box-shadow:0 0 0 .14em rgba(var(--lmx-acc),' + TL[3] + '),0 0 1.1em rgba(var(--lmx-acc),' + TL[2] + ') !important}' +
            // При перелистывании весь ряд перемещается одним слоем без перерисовки карточек
            A + '{background:#090b16 !important;color:#f5f5f7;font-family:-apple-system,"SF Pro Display","Inter","Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}' +
            A + '.activity,' + A + '.activity__body,' + A + '.wrap{background:transparent}' +
        // Заголовки рядов
            A + '.items-line__title,' + A + '.items-line__head,' + A + '.items-line{background:none !important;box-shadow:none}' +
            A + '.items-line__title{font-size:1.6em;font-weight:700;letter-spacing:-.022em;color:#f5f5f7}' +
            A + '.items-line__more{background:' + GLASS + ';box-shadow:inset 0 0 0 1px rgba(255,255,255,.2);border-radius:99em;font-weight:600}' +
        // ===== Карточки =====
            A + '.card,' + A + '.card.focus,' + A + '.card.hover{transform:none !important;animation:none !important;transition:none !important}' +
            A + '.card__view{border-radius:1.2em;background:rgba(255,255,255,.07);box-shadow:' + RIM + ';animation:none !important;transition:transform .2s cubic-bezier(.25,.8,.25,1) !important}' +
            A + '.card.focus:not(.card--lmxhero):not(.card--lmxstudio) .card__view,' + A + '.card.hover:not(.card--lmxhero):not(.card--lmxstudio) .card__view{transform:scale(1.05);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.8),0 .45em .9em rgba(0,0,0,.5)}' +
            A + '.card__img,' + A + '.card__view::after{border-radius:1.2em}' +
            // Стеклянный блик на карточке в фокусе
            A + '.card.focus:not(.card--lmxhero) .card__view::before,' + A + '.card.hover:not(.card--lmxhero) .card__view::before{content:"";position:absolute;left:0;top:0;right:0;bottom:0;border-radius:inherit;background:linear-gradient(115deg,rgba(255,255,255,.3) 0%,rgba(255,255,255,.08) 28%,rgba(255,255,255,0) 46%);pointer-events:none;z-index:2}' +
            A + '.card.focus{z-index:3}' +
            A + '.card.focus .card__view::after,' + A + '.card.hover .card__view::after{display:none !important}' +
            '@keyframes lmxshadow{from{opacity:0}to{opacity:1}}' +
            A + '.lmx-cin{padding:3em .9em .75em;border-radius:0 0 1.2em 1.2em;background:linear-gradient(to top,rgba(8,10,28,.9) 0%,rgba(8,10,28,.55) 45%,rgba(8,10,28,0) 100%)}' +
            A + '.lmx-cin__t{font-size:1.15em;font-weight:600;letter-spacing:-.015em;line-height:1.15}' +
            A + '.lmx-cin__g{opacity:.6;text-transform:uppercase;letter-spacing:.08em;font-size:.58em;font-weight:600}' +
            A + '.lmx-cin__v{background:none;padding:0;font-weight:600;-webkit-text-fill-color:#f5f5f7}' +
            A + '.lmx-cin__v i{-webkit-text-fill-color:currentColor;font-style:normal}' +
            A + '.lmx-cin__y{opacity:.7;font-weight:500}' +
            // Метки-капсулы
            A + '.lmx-pill{border:0 !important;border-radius:99em;font-weight:600;letter-spacing:.02em;padding:.34em .9em}' +
            A + '.lmx-box .lmx-pill{background:rgba(30,32,60,.62) !important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);color:#fff !important}' +
            A + '.lmx-pill.lmx-m-next{background:#0a84ff !important;color:#fff !important}' +
            A + '.lmx-pill.lmx-m-new{background:#f5f5f7 !important;color:#000 !important}' +
            A + '.lmx-pill.lmx-m-soon{background:rgba(255,255,255,.2) !important;color:#fff !important}' +
        // ===== Баннер-афиша =====
            A + '.card--lmxhero{contain:layout paint}' +
            A + '.card--lmxhero{width:calc(100vw + 2px) !important;margin-left:calc(-2.2em - 1px) !important;margin-right:calc(2.2em - 1px) !important}' +
            A + '.card--lmxhero[data-lmxi="0"]{width:calc(100vw - 2.2em + 2px) !important;margin-left:0 !important}' +
            A + '.card--lmxhero .card__view{background-color:#1c1c20;height:70vh !important;border-radius:0;box-shadow:none;transition:none !important;background-repeat:no-repeat !important;background-size:cover !important;background-position:center 20% !important}' +
            A + '.card--lmxhero.focus .card__view,' + A + '.card--lmxhero.hover .card__view{transform:none !important;box-shadow:none !important;transition:none !important}' +
            A + '.card:not(.card--lmxhero){position:relative}' +
            A + '.card--lmxhero.focus .card__view::after,' + A + '.card--lmxhero.hover .card__view::after{display:none !important}' +
            // Стриминги используют такую же анимацию и тень, как карточки фильмов; рамка не обрезает тень
            A + '.card--lmxstudio .card__view{overflow:visible !important}' +
                        A + '.card--lmxhero .lmx-hero__shade{height:100%;background:linear-gradient(to top,rgb(10,12,24) 0%,rgba(10,12,24,.94) 6%,rgba(10,12,24,.8) 14%,rgba(10,12,24,.56) 24%,rgba(10,12,24,.3) 35%,rgba(10,12,24,.12) 46%,rgba(10,12,24,.03) 56%,rgba(10,12,24,0) 64%),linear-gradient(to bottom,rgba(30,32,66,.9) 0%,rgba(30,32,66,.7) 3%,rgba(30,32,66,.46) 7%,rgba(30,32,66,.24) 12%,rgba(30,32,66,.08) 17%,rgba(30,32,66,0) 23%),linear-gradient(90deg,rgba(0,0,0,.56) 0%,rgba(0,0,0,.4) 18%,rgba(0,0,0,.22) 34%,rgba(0,0,0,.08) 48%,rgba(0,0,0,0) 62%)}' +
            A + '.card--lmxhero .lmx-hero__text{left:4em;right:4em;bottom:3.6em;max-width:46%}' +
            A + '.card--lmxhero .lmx-hero__title{font-size:3.3em;font-weight:700;line-height:1.02;letter-spacing:-.03em;margin-bottom:.35em}' +
            A + '.card--lmxhero .lmx-hero__meta{font-size:1.05em;opacity:.9;font-weight:500}' +
            A + '.card--lmxhero .lmx-hero__v{background:none;padding:0;font-weight:600;-webkit-text-fill-color:#f5f5f7}' +
            A + '.card--lmxhero .lmx-hero__v i{-webkit-text-fill-color:currentColor;font-style:normal}' +
            A + '.lmx-hero__tag{border-radius:99em;font-weight:600;padding:.25em .85em;background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.28);color:#fff}' +
            A + '.lmx-hero__tag.lmx-t-soon{background:#0a84ff}' +
            A + '.lmx-hero__tag.lmx-t-new{background:#f5f5f7;color:#000}' +
            A + '.card--lmxhero .lmx-hero__o{font-size:1.02em;opacity:.8;line-height:1.4;max-height:4.3em;margin-top:.7em}' +
            // Как в оригинале: афиша плавно выезжает, а текст появляется немного позже
            A + '.lmx-hero-line .scroll__body{transition:transform .9s cubic-bezier(.4,0,.2,1) !important;will-change:transform}' +
            A + '.card--lmxhero .lmx-hero__text{opacity:0;transition:opacity .35s ease .2s}' +
            A + '.card--lmxhero.lmx-cur .lmx-hero__text,' + A + '.card--lmxhero.focus .lmx-hero__text{opacity:1}' +
            // Как в каталогах и теме HBO: слайд чуть уже экрана, справа виден край следующего; переход длиннее, поскольку слайд проходит всю ширину экрана, текст появляется позже
            '@media (min-width:761px){' + A + '.card--lmxhero{width:calc(100vw - 6em) !important;margin-left:calc(-2.2em - 1px) !important;margin-right:3.2em !important}}' +
            '@media (min-width:761px){' + A + '.card--lmxhero[data-lmxi="0"]{width:calc(100vw - 8.2em) !important;margin-left:0 !important}}' +
            // В теме «Стекло» соседние слайды видны с обеих сторон; левый не обрезается
            A + '.lmx-hero-line:not(.lmx-mini) .scroll__body{transition:transform 1.1s cubic-bezier(.4,0,.2,1) !important}' +
            A + '.lmx-hero-line:not(.lmx-mini) .card--lmxhero .lmx-hero__text{transition:opacity .5s ease .45s}' +
            A + '.lmx-hero-line{position:relative}' +
            A + '.lmx-hero-line .items-line__head,' + A + '.lmx-hero-line .items-line__title{display:none !important}' +
            // Уведомления Lampa («Добавлено в…») в теме «Стекло» отображаются полупрозрачной плашкой-капсулой внизу по центру
            A + '.noty{left:50%;right:auto;bottom:2.4em;max-width:70vw;border-radius:99em;background:rgba(36,38,60,.92);color:#fff;border:1px solid rgba(255,255,255,.22);box-shadow:0 .6em 1.6em rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.18);transform:translate(-50%,200%)}' +
            A + '.noty--visible{transform:translate(-50%,0)}' +
            A + '.noty__body{padding:.75em 1.8em;text-align:center}' +
            A + '.noty__text{font-size:1.1em;font-weight:600}' +
            A + '.lmx-dots{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:.55em;padding:.6em 1em;border-radius:99em;background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2);z-index:6;pointer-events:none}' +
            A + '.lmx-dots i{display:block;width:.5em;height:.5em;border-radius:50%;background:rgba(255,255,255,.5);transition:background-color .3s ease}' +
            A + '.lmx-dots i.on{width:2.2em;border-radius:99em;background:#fff}' +
        // История: широкие карточки с кадром
            A + '.card--lmxhist{width:24em !important}' +
            A + '.card--lmxhist .card__view{height:13.5em !important;padding-bottom:0 !important;border-radius:1.2em;background-repeat:no-repeat !important;background-size:cover !important;background-position:center !important}' +
            A + '.lmx-hist__shade{position:absolute;left:0;right:0;bottom:0;height:80%;border-radius:0;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.6) 45%,rgba(0,0,0,0) 100%)}' +
            A + '.lmx-hist__text{position:absolute;left:1.1em;right:1.1em;bottom:1.2em;color:#fff}' +
            A + '.lmx-hist__t{font-size:1.05em;font-weight:600;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            A + '.lmx-hist__m{display:flex;gap:1em;font-size:.82em;line-height:1.3;opacity:.85;margin-top:.55em}' +
            A + '.items-line .card:not(.card--lmxhero){margin-right:.9em}' +
            A + '.items-line:not(.lmx-hero-line) .scroll--horizontal .scroll__body{padding-right:1.3em !important}' +
            // Перелистывание ряда работает как в теме «Кино»
            A + '.items-line:not(.lmx-hero-line) .scroll__body{transition:transform .3s cubic-bezier(.3,.75,.25,1) !important}' +
            A + '.scroll--mask.lmx-nomask{-webkit-mask-image:none !important;mask-image:none !important}' +
            A + '.lmx-hero__acts{display:flex;align-items:center;margin-top:1.1em}' +
            A + '.lmx-hero__btn{display:inline-block;padding:.75em 2em;border-radius:99em;background:#f5f5f7;color:#000;font-weight:600;font-size:1.08em}' +
            A + '.lmx-hero__circ{display:inline-flex;align-items:center;justify-content:center;width:2.6em;height:2.6em;margin-left:.8em;border-radius:50%;background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.3);color:#fff;font-size:1.1em;font-weight:500}' +
        // ===== Плитки стримингов оформлены как каналы Apple TV =====
            A + '.card--lmxstudio .card__view{background:linear-gradient(160deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,.05) 100%) !important;border-radius:1.25em;box-shadow:' + RIM + '}' +
            A + '.card--lmxstudio.focus .card__view,' + A + '.card--lmxstudio.hover .card__view{transform:scale(1.05);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.75),inset 0 1px 0 rgba(255,255,255,.9),0 .5em 1.1em rgba(0,0,0,.5),0 0 1.1em rgba(130,150,255,.4) !important}' +
            A + '.lmx-studio__name{font-weight:600;letter-spacing:-.01em}' +
        // ===== Шапка, меню и настройки =====
            A + '.head__action{border-radius:50%;background:' + GLASS + ';box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}' +
            A + '.menu__item,' + A + '.settings-param,' + A + '.settings-folder,' + A + '.selectbox-item{border-radius:.9em;transition:background-color .25s ease}' +
            A + '.menu__item.focus,' + A + '.menu__item.traverse,' + A + '.menu__item.hover,' +
            A + '.settings-folder.focus,' + A + '.settings-param.focus,' + A + '.selectbox-item.focus,' +
            A + '.settings-param-title.focus,' + A + '.simple-button.focus,' + A + '.full-person.focus,' +
            A + '.head__action.focus,' + A + '.head__action.hover,' + A + '.lmx-ord__btn.focus,' + A + '.lmx-ord__reset.focus' +
            '{background:rgba(255,255,255,.2) !important;color:#fff !important;box-shadow:none}' +
                        A + '.selectbox,' + A + '.settings{background:rgba(6,8,20,.55)}' +
            A + '.settings__content,' + A + '.selectbox__content,' + A + '.modal__content{background:linear-gradient(180deg,rgba(20,22,50,.95) 0%,rgba(11,13,32,.97) 100%) !important;box-shadow:0 .8em 1.6em rgba(0,0,0,.4) !important;border:0 !important}' +
            // Боковое меню полностью прозрачное: сквозь него виден тот же неподвижный фон с цветным свечением, поэтому граница между меню и страницей незаметна
            A + '.wrap__left{background:transparent !important;backdrop-filter:none !important;-webkit-backdrop-filter:none !important;box-shadow:none !important;border:0 !important}' +
            A + '.menu{background:transparent !important;box-shadow:none !important;border:0 !important}' +
            A + '.modal__content,' + A + '.selectbox__content{border-radius:1.4em}' +
            A + '.simple-button{border-radius:99em;background:' + GLASS + ';box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}' +
        // ===== Страница фильма: название или логотип → метаданные → описание → кнопки =====
            // Затемняем фон через opacity, а не filter:brightness: он уже расположен на тёмном фоне, а filter заставляет ТВ перерисовывать полноэкранное изображение на каждом кадре
            F + '.full-start__background{opacity:.52 !important}' +
            // Только на странице фильма заменяем цветное свечение нейтральным почти чёрным фоном; класс lmx-fullact добавляется к .activity страницы фильма
            'body.lmx-apple.lmx-onfull{background:#080a14 !important}' +
            'body.lmx-apple.lmx-onfull .head{background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 100%) !important;box-shadow:none !important}' +
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
            // Кнопки: большая белая капсула «Смотреть» и круглые стеклянные кнопки
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
            // Нижние разделы страницы (описание, актёры) оформлены в том же стиле
            A + '.full-descr__text,' + A + '.full-descr__details{color:#d1d1d6}' +
            A + '.full-person{border-radius:1.2em}' +
            '@media (max-width:760px){' +
                A + '.card--lmxhero{width:94vw !important;margin-left:0 !important;margin-right:1em !important}' +
                A + '.card--lmxhero .card__view{height:52vw !important;border-radius:1.2em}' +
                A + '.card--lmxhero .lmx-hero__text{left:1.2em;right:1em;bottom:1.2em;max-width:85%}' +
                A + '.card--lmxhero .lmx-hero__title{font-size:1.7em}' +
                A + '.card--lmxhero .lmx-hero__o,' + A + '.lmx-hero__acts,' + A + '.lmx-dots{display:none}' +
            // На телефоне нет фокуса: текст всегда виден, снизу добавлено лёгкое затемнение для читаемости
                A + '.card--lmxhero .lmx-hero__text{opacity:1 !important;transition:none}' +
                A + '.card--lmxhero .lmx-hero__shade{background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.45) 40%,rgba(0,0,0,0) 75%)}' +
            '}';
    }
    function loadThemeFont() {
        if (getStr('lmx_theme', 'default') === 'default' || document.getElementById('lmx-font')) return;
        var l = document.createElement('link');
        l.id = 'lmx-font'; l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800&family=Oswald:wght@500;600;700&subset=cyrillic&display=swap';
        document.head.appendChild(l);
    }
    function applyThemeClass() {
        safe(loadThemeFont);
        if (document.body && document.body.classList) { document.body.classList.toggle('lmx-hbo', themeBase() === 'hbo'); document.body.classList.toggle('lmx-prem', themeBase() === 'prem'); document.body.classList.toggle('lmx-apple', getStr('lmx_theme', 'default') === 'apple'); }
    }
    function isMobile() { return (window.innerWidth || 1000) <= 760; }
    function applyFullClass() {
        var on = getBool('lmx_full', true) && !isMobile();
        if (document.body && document.body.classList) {
            document.body.classList.toggle('lmx-ph', getBool('lmx_full', true) && isMobile());
            document.body.classList.toggle('lmx-full', on);
            document.body.classList.toggle('lmx-logo-on', getBool('lmx_full', true) && getBool('lmx_logo', true));
        }
    }
    function logoSizeCss() {
        var sizes = { small: 0.78, normal: 1, large: 1.24 };
        var desktop = sizes[getStr('lmx_logo_size', 'normal')] || 1;
        var mobile = sizes[getStr('lmx_logo_size_mobile', 'normal')] || 1;
        return 'body.lmx-full .lmx-logo{transform:scale(' + desktop + ');transform-origin:left center}' +
            '@media(max-width:760px){body.lmx-ph .lmx-logo{transform:scale(' + mobile + ');transform-origin:left center}}' +
            '.full-start-new__tagline{display:none !important}';
    }

    // Старые телевизоры на Chromium до версии 84 не поддерживают gap во flex: пропадают отступы между «Фильм», годом, жанром, звездой и рейтингом
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
        // Между карточками эпизодов («Недавние/Ближайшие эпизоды» в разделе «Сериалы») всегда оставляем отступ, чтобы рамка фокуса не сливалась с соседней
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
    function applyStyle() {
        safe(applyFullClass);
        safe(function () { if (document.body) document.body.classList.toggle('lmx-nogap', !flexGapOk()); });
        safe(applyThemeClass);
        var s = document.getElementById('lmx-css');
        if (!s) {
            s = document.createElement('style');
            s.id = 'lmx-css';
            document.head.appendChild(s);
        }
        s.textContent = buildCss() + themeCss() + premCss() + appleCss() + detailCss() + detailCss('body.lmx-ph ') + phoneCss() + miniCss() + heroPhoneCss() + nogapCss() + timetableCss() + journalCss() + menuFitCss() + textCss() + logoSizeCss();
    }

    // ===== Поиск данных карточки (несколько способов из-за различий между версиями Lampa) =====
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

    // Не храним скрытые элементы в массиве: раньше каждая удалённая со страницы карточка оставалась в памяти ТВ навсегда. Вместо этого ставим атрибут
    function hideEl(el) {
        el.style.display = 'none';
        el.setAttribute('data-lmxhid', '1');
    }

        // Штатный значок «TV» ищем только среди непосредственных потомков постера, без глубокого обхода и getComputedStyle
    function hideNativeTv(view) {
        var ch = view.children;
        for (var i = 0; i < ch.length; i++) {
            var n = ch[i];
            if (n.style.display === 'none' || (n.className && String(n.className).indexOf('lmx-') >= 0)) continue;
            if (n.children.length < 2 && RE_NATIVE_TV.test(n.textContent)) hideEl(n);
        }
    }
    // ===== Отрисовка элементов на постере =====
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

        // Карточка: подпись в стиле кино (жанр, название, рейтинг, год) и метка «Новинка/Скоро» для фильмов
    function extras(el, d, type) {
        var view = el.querySelector('.card__view');
        if (!view) return;
        hideNativeTv(view);
        cinemaOverlay(view, d, type);
        if (type === 'movie') addMark(view, movieMark(d));
    }

            // Сериалы: значок С3Э24 и метки «Новая серия»/«Сегодня»
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

    // Обрабатываем карточки отложенно и небольшими порциями, чтобы не замедлять загрузку списков
    var work = [], workTimer = null;
    // Пока пользователь листает стрелками и ещё примерно 0,45 секунды после этого не работаем с DOM: иначе задачи совпадают с анимацией движения и вызывают микрофризы
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
        // Быстрые задачи тоже выполняем порциями: раньше все карточки всех рядов обрабатывались за один проход, и ТВ подвисал после загрузки
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
        // Не тратим запрос на карточку, уже удалённую со страницы при перестроении ряда
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
            // В старых версиях Chromium (например, на телевизорах Samsung 2018 года) нет isIntersecting; тогда используем intersectionRatio и размер пересечения
            var vis = typeof e.isIntersecting === 'boolean' ? e.isIntersecting : ((e.intersectionRatio || 0) > 0 || !!(e.intersectionRect && (e.intersectionRect.width || e.intersectionRect.height)));
            if (!vis) return;
            io.unobserve(e.target);
            if (e.target.__lmx) queue.push(e.target.__lmx);
        });
        pumpSoon();
    }, { rootMargin: '300px' }) : null;


    // Отступ справа в конце ряда должен совпадать с отступом слева во всех темах, включая ряды с плиткой «Ещё».
    // Измеряем левый отступ в начальном положении прокрутки, а правый задаём inline-стилем, поскольку темы используют собственные !important
    var padT = 0;
    // В темах HBO и Apple TV прокрутка Lampa не учитывает padding контейнера ряда, поэтому последняя карточка и плитка «Ещё» упирались в край.
    // Добавляем в конец ряда настоящий пустой элемент шириной с левый отступ; прокрутка учитывает его как обычную карточку
    function padFix() {
        if (!board()) return;
        var act = document.querySelector('.activity--active') || document.body;
        var ar = act.getBoundingClientRect();
        var lines = act.querySelectorAll('.items-line:not(.lmx-hero-line)');
        for (var i = 0; i < lines.length; i++) {
            try {
                var body = lines[i].querySelector('.scroll--horizontal .scroll__body');
                if (!body || !body.firstElementChild || body.firstElementChild.classList.contains('lmx-endpad')) continue;
            // Если ряд уже обработан и новых карточек нет, не измеряем его повторно: раньше каждый scan пересчитывал все ряды и заставлял ТВ перестраивать макет
                if (body.__lmxN === body.children.length && body.lastElementChild && body.lastElementChild.classList.contains('lmx-endpad')) continue;
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
    // Между карточками эпизодов («Недавние/Ближайшие эпизоды») всегда оставляем отступ; задаём его через inline !important, чтобы стили темы или сборки не могли его перебить
    function fixEpisodeGaps() {
        var eps = document.querySelectorAll('.card-episode');
        for (var i = 0; i < eps.length; i++) {
            var e = eps[i], pv = e.previousElementSibling;
            if (pv && pv.classList && pv.classList.contains('card-episode') && !e.__lmxGap) { e.__lmxGap = 1; e.style.setProperty('margin-left', '1.2em', 'important'); }
        }
    }
    // Главная Lampa прокручивается вертикально с маской плавного затухания сверху и снизу; маска заставляет ТВ
    // создавать отдельный буфер на каждом кадре прокрутки. В теме «Стекло» с большим количеством прозрачных элементов это заметно тормозит, поэтому снимаем маску
    function dropPageMask() {
        var ls = document.querySelectorAll('.items-line');
        for (var i = 0; i < ls.length; i++) {
            if (ls[i].__lmxPM) continue;
            ls[i].__lmxPM = 1;
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

        // Главная открывается почти сразу; экран «Ещё» с длинными списками загружается с задержкой и меньшей нагрузкой
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
            // Помечаем ряд афиши сразу, в микрозадаче перед отрисовкой, а не после задержки scan, чтобы заголовок и размеры не прыгали при запуске
            // На странице фильма в телефоне Lampa растягивает фон w780 на весь экран, из-за чего на экране 3x изображение размыто; заменяем его оригиналом
    function hqPoster() {
        if (window.innerWidth > 480) return;
        var im = document.querySelectorAll('.full-start-new__img:not([data-lmxhq]),.full-start__img:not([data-lmxhq])');
        for (var i = 0; i < im.length; i++) (function (el) {
            el.setAttribute('data-lmxhq', '1');
            var up = function () {
                var s = el.getAttribute('src') || '';
                if (s.indexOf('/t/p/w780/') < 0 && s.indexOf('/t/p/w500/') < 0 && s.indexOf('/t/p/w300/') < 0) return;
                var big = s.replace(/\/t\/p\/w(780|500|300)\//, '/t/p/original/');
                var pre = new Image();
                pre.onload = function () { if (el.getAttribute('src') === s) el.src = big; };
                pre.src = big;
            };
            up();
            try { new MutationObserver(up).observe(el, { attributes: true, attributeFilter: ['src'] }); } catch (e) {}
        })(im[i]);
    }
            // При добавлении карточек в конец ряда Lampa пересчитывает его позицию во время анимации, и ряд откатывается вправо, а затем едет снова.
            // Раньше здесь отключалась анимация сдвига, что вызывало резкие скачки при дозагрузке; это поведение удалено
    function rowGuard() {
        var bodies = document.querySelectorAll('.items-line:not(.lmx-hero-line) .scroll--horizontal .scroll__body:not(.lmx-ag)');
        for (var i = 0; i < bodies.length; i++) {
            (function (b) {
                b.classList.add('lmx-ag');
                new MutationObserver(function (ms) {
                    var added = false;
                    for (var k = 0; k < ms.length && !added; k++) if (ms[k].addedNodes && ms[k].addedNodes.length) added = true;
                    if (!added) return;
            // Невидимый отступ-хвост (lmx-endpad) должен оставаться последним: Lampa добавляет новые карточки ПОСЛЕ него, поэтому они оказывались
            // правее остальных, а через 0,5 секунды padFix переносил хвост в конец и карточки резко прыгали влево
                    try {
                        var pd = b.querySelector(':scope > .lmx-endpad');
                        if (pd && b.lastElementChild !== pd) b.appendChild(pd);
                    } catch (e) {}
                }).observe(b, { childList: true });
            })(bodies[i]);
        }
    }
    function markHero(heroAdded) {
        hqPoster();
            // Эти проверки не нужны при каждом изменении страницы; выполняем их не чаще одного раза в 150 мс
        var tnow = Date.now(), tick = false;
        if (tnow - (markHero.__t || 0) > 150) {
            tick = true;
            markHero.__t = tnow;
            safe(rowGuard);
            safe(function () { document.body.classList.toggle('lmx-onfull', !!document.querySelector('.activity--active .full-start-new')); });
        } else if (!markHero.__q) {
            markHero.__q = setTimeout(function () { markHero.__q = 0; safe(markHero); }, 160);
        }
            // Ищем карточки афиши по всей странице только при её появлении или по запланированному таймеру
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

        // После смены стиля удаляем собственные элементы, показываем скрытое и перерисовываем страницу
    function resetCards() {
        var hid = document.querySelectorAll('[data-lmxhid]');
        for (var hi = 0; hi < hid.length; hi++) { hid[hi].style.display = ''; hid[hi].removeAttribute('data-lmxhid'); }
        var mine = document.querySelectorAll('.lmx-box,.lmx-tr,.lmx-cin');
        for (var i = 0; i < mine.length; i++) mine[i].parentNode.removeChild(mine[i]);
        var cards = document.querySelectorAll('.card[data-lmx]');
        for (var k = 0; k < cards.length; k++) cards[k].removeAttribute('data-lmx');
        schedule();
    }

    // ===== Длительность и статус внутри карточки фильма или сериала =====
        // Студия или канал: для сериалов — телеканал (HBO, Netflix и др.), иначе первая студия-производитель
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
        // Дата выхода важнее статуса TMDB: статус «Released» может быть установлен ещё до официальной даты
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

    // Используем официальный логотип фильма из TMDB вместо текстового заголовка, если он доступен
        // Кэш по ключу фильма не растёт бесконечно во время долгой сессии на ТВ: храним последние N записей
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
            if (sc > bestScore) { bestScore = sc; best = l; }
        });
        return best && best.file_path;
    }
        // Пока загружается логотип, скрываем текстовое название, чтобы оно не мигало; затем показываем доступный вариант
    function reveal(r) { r.find('.full-start-new__title, .full-start-new__head, .full-start__head').addClass('lmx-reveal'); }
    function applyLogo(r, path) {
        var t = r.find('.full-start-new__title').eq(0);
        if (!t.length || !path) { reveal(r); return; }
        r.find('.lmx-logo').remove();
        var img = $('<img class="lmx-logo">').attr('src', imgUrl(path, 'w780'));
        img.on('error', function () { img.remove(); t.removeClass('lmx-has-logo'); restoreHead(r); reveal(r); });
        img.on('load', function () { reveal(r); });
        t.addClass('lmx-has-logo').prepend(img);
        if (!isMobile()) moveHead(r);
    }
        // При наличии логотипа строка «год, страна» переносится из заголовка в метку перед длительностью
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
        // Строка «Следующая: … / Осталось дней: …» из другого плагина дублирует нашу метку «Следующая серия», поэтому скрываем её
    function hideDupes(r) {
        if (!r.find('.lmx-info .lmx-next').length) return;
        r.find('div,span').each(function () {
            if (this.children.length) return;
            var t = (this.textContent || '').trim();
            if (t.length < 80 && /^Наступна:\s/.test(t) && /Залишилось/.test(t)) $(this).addClass('lmx-head-moved');
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

        // Apple TV: неподвижные точки поверх афиши; активная плавно перемещается между ними
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
            // Пересчитываем позицию каждый раз, поскольку шапка или подгрузка могут сдвинуть ряд; меняем стиль, только если позиция изменилась
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
        // Автоматически переключаем афишу каждые 8 секунд, после последнего слайда возвращаемся к первому; останавливаемся, пока пользователь нажимает кнопки
        // Устанавливаем фокус на карточке несколькими способами, поскольку Navigator в Lampa не глобальный
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
            // Переключаемся туда и обратно: от первого слайда к последнему, затем от последнего к первому; каждый переход — на один слайд
        var all = line.querySelectorAll('.card--lmxhero'), next = null, want;
        if (n > 1 && raw >= n - 1) ap.dir = -1;
        else if (raw <= 0) ap.dir = 1;
        want = raw + ap.dir;
        for (var i = 0; i < all.length; i++) {
            if (parseInt(all[i].getAttribute('data-lmxi'), 10) === want) next = all[i];
        }
        if (next && next !== card) {
            // Следующий слайд ещё не загружен или не декодирован при запуске Lampa: переключение вызвало бы рывок, поэтому ставим его в очередь и повторяем попытку через 0,7 секунды
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
        // Текущий баннер остаётся активным и сохраняет текст, даже если фокус перешёл на меню или кнопки шапки
        // После загрузки и декодирования большого изображения удаляем миниатюру-подложку, чтобы уменьшить нагрузку при движении
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
    // За пределами окна соседних слайдов изображения не рисуются и декодированные копии не хранятся в памяти, снижая нагрузку на ТВ при прокрутке афиши
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
        // ТВ может удалять из памяти декодированные изображения дальних слайдов, поэтому заранее декодируем соседние в фоне, пока текущий слайд неподвижен
    function heroTouch(card, line) {
        var i = parseInt(card.getAttribute('data-lmxi'), 10) || 0, all = line.querySelectorAll('.card--lmxhero'), n = 0;
        for (var k = 0; k < all.length; k++) {
            var d = Math.abs((parseInt(all[k].getAttribute('data-lmxi'), 10) || 0) - i);
            if (d !== 1) continue;
            // Декодируем соседние слайды по очереди с паузой, а не одновременно
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
        // Ручное переключение использует тот же путь, что и автоматическое (focusCard), чтобы анимация была одинаковой и плавной
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
                if (!next) return; // На краю оставляем штатное поведение Lampa (например, переход в меню)
                ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
                var now = Date.now();
                if (now - lastNav < 420) return;
                lastNav = now;
                focusCard(next, line);
            });
        }, true);
        // Прогреваем все слайды невидимым проходом, чтобы браузер заранее их отрисовал и первый реальный переход не зависал
        // Отключён невидимый проход по слайдам: он скрывал карусель при запуске и вызывал скачки; изображения заранее загружает heroPreload
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
        // Стандартная тема: только автоматическое переключение слайдов, без предварительного прогрева и точек
                    if (isMobile()) return;
                    var d = document.querySelector('.card--lmxhero.focus');
                    if (!d) return;
                    if (ap.cur !== d) { ap.cur = d; setCur(d); }
                    autoplay(d, d.closest('.items-line'));
                    return;
                }
                var c = document.querySelector('.card--lmxhero.focus');
                if (!c) return;
            // Обновляем отметку слайда и точки только при смене карточки в фокусе, а не каждые 300 мс
                if (ap.cur !== c) { ap.cur = c; setCur(c); syncDots(c); }
                if (!warmDone && !warmBusy && !heroQ.length && !heroBusy && Date.now() - lastKey > 1500 && (parseInt(c.getAttribute('data-lmxi'), 10) || 0) === 0 && c.closest('.items-line')) { warm(c.closest('.items-line')); return; }
                if (warmBusy) { ap.t = Date.now(); return; }
        // Не декодируем большие изображения соседних слайдов в момент завершения движения: это вызывало микрорывок в конце анимации.
        // Вместо этого ждём полторы секунды покоя и загружаем по одному слайду за раз
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

        // Полностью скрываем пустой раздел «Комментарии», в котором есть только кнопка «Добавить»
    function hideEmptyComments(r) {
        r.find('.full-review-add').each(function () {
            var host = window.$(this).closest('.items-line');
            if (!host.length) return;
            host.toggleClass('lmx-nocomm', host.find('.full-review').length === 0);
        });
    }
    // ===== Кнопка «Нравится»: добавляет проект в стандартный список Lampa «Нравится» (закладки) =====
    var HEART = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.2-9.6C1.7 7.700 3.700 4.500 7 4.500c2 0 3.500 1.100 5 3 1.500-1.900 3-3 5-3 3.300 0 5.300 3.200 4.200 6.400C19.500 15.900 12 20.500 12 20.500z"/></svg>';
        // Lampa подсвечивает закладку, если фильм есть в любом списке, включая «Нравится». Не даём лайку подсвечивать её
    var likeCtx = null, likeHooked = false;
    function bookFill() {
        var c = likeCtx;
        if (!c || !c.r[0] || !document.body.contains(c.r[0])) return;
        var st = {};
        try { st = Lampa.Favorite.check(c.m) || {}; } catch (e) {}
        var any = ['wath', 'book', 'look', 'viewed', 'scheduled', 'continued', 'thrown'].some(function (k) { return !!st[k]; });
        // Используем класс и CSS (!important), а не атрибут: закладка не мигает, пока Lampa устанавливает собственный цвет
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
                if (Lampa.Noty) Lampa.Noty.show(liked() ? 'Добавлено в «Нравится»' : 'Удалено из «Нравится»');
            });
        });
        paintLike();
        var after = cont.find('.button--book').first();
        if (after.length) after.after(el); else cont.append(el);
    }

    // ===== Кнопки «Посмотреть позже» и «Просмотрено»: стандартные списки Lampa =====
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
        var later = mk('button--lmxlater lmx-mk-later', MK_LATER, 'Посмотреть позже', 'В списке «Позже»', 'wath');
        function paintAll() { later.paint(); }
        later.on('hover:enter', function () {
            safe(function () {
                var was = !!st().wath;
                if (!was && st().viewed) Lampa.Favorite.toggle('viewed', m);   // Статусы «Посмотреть позже» и «Просмотрено» не могут действовать одновременно
                Lampa.Favorite.toggle('wath', m);
                paintAll();
                if (Lampa.Noty) Lampa.Noty.show(was ? 'Удалено из «Посмотреть позже»' : 'Добавлено в «Посмотреть позже»');
            });
        });
        paintAll();
        var after = cont.find('.lmx-likebtn').first();
        if (!after.length) after = cont.find('.button--book').first();
        if (after.length) after.after(later); else cont.append(later);
        if (Lampa.Listener && !marksButtons.hooked) { marksButtons.hooked = true; Lampa.Listener.follow('state:changed', function (e) { if (e && e.target === 'favorite') { var c = marksButtons.cur; if (c) c(); } }); }
        marksButtons.cur = function () { if (document.body.contains(later[0])) paintAll(); };
    }

    // ===== Цвет постера для страницы фильма в теме «Стекло»: уменьшаем изображение и один раз выбираем самый насыщенный цвет =====
    var tintCache = {};
    function tintTL() {
        return ({ '1': ['.2', '.12', '.3', '.7'], '2': ['.36', '.22', '.42', '.85'], '3': ['.55', '.34', '.6', '1'] })[getStr('lmx_tint_lvl', '2')] || ['.36', '.22', '.42', '.85'];
    }
        // Задаём цвет отдельному слою и контейнеру кнопок, а не body, чтобы не пересчитывать стили всей страницы
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
        // Доминирующий цвет: группируем пиксели по оттенку (18 секторов по 20°); побеждает сектор с наибольшим весом (насыщенность × средняя яркость),
        // а цвет рассчитывается как средневзвешенное значение его пикселей. Один яркий пиксель (например, надпись или блик) не влияет на результат; серые и почти чёрные/белые пиксели исключаются
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
        // Оттенки кожи (оранжево-розовые, умеренной насыщенности) часто преобладают на лицах и дают грязный цвет, поэтому уменьшаем их вес
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
            // Повышаем яркость, чтобы цвет был заметен на тёмном фоне
        var mxv = Math.max(col[0], col[1], col[2]) || 1, k = Math.min(1.8, 185 / mxv);
        var gray = (col[0] + col[1] + col[2]) / 3;
        return col.map(function (v) { return Math.min(255, Math.round((v * 0.85 + gray * 0.15) * k)); });
    }
    function posterTint(r, m) {
        if (!getBool('lmx_tint', true) || getStr('lmx_theme', 'default') !== 'apple' || !m || !m.id) { tintApply(null, r); return; }
        // Берём цвет из фонового кадра, который пользователь видит на странице: у постера другая палитра, и она давала неподходящий оттенок
        var path = m.backdrop_path || m.poster_path, big = !!m.backdrop_path;
        if (!path) { tintApply(null, r); return; }
        var key = typeOf(m) + m.id; // Фильм и сериал могут иметь одинаковый ID, поэтому ключ должен их различать
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

    // ===== Ряд «Студии и каналы» на странице фильма после актёров: открывает подборку выбранной студии или канала =====
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
        rows.splice(pos, 0, ['persons', { results: out, title: tv ? 'Студии и каналы' : 'Студии', __lmxStudios: 1 }]);
    }

        // При переходе из ряда «Продолжить просмотр» открываем страницу и нажимаем «Смотреть»; до 4 попыток, поскольку онлайн-плагин может добавить кнопку с задержкой
    function resumeNow(r, m) {
        var f = resumeFlag;
        resumeFlag = null;
        if (!f || f.id !== m.id || Date.now() - f.t > 8000) return;
        var tries = 0;
        (function go() {
            if (!document.body.contains(r[0] || document.body)) return;
            var cont = r.find('.full-start-new__buttons, .full-start__buttons').eq(0), w = cont.length ? watchBtnOf(cont) : null;
                // Если кнопки «Смотреть» нет по классу или названию (например, «Smart Online»), берём первую обычную кнопку ряда
            if (!w && cont.length) w = cont.find('.full-start__button.selector').not('.lmx-edit,.lmx-folder,.lmx-virt,.lmx-likebtn,.lmx-mkbtn,.button--book,.button--reaction,.button--subscribe,.button--options,.view--trailer').get(0) || null;
            if (w) { try { window.$(w).trigger('hover:enter'); } catch (e) {} return; }
            if (++tries < 4) setTimeout(go, 500);
        })();
    }
    function onFull(e) {
        if (!e || (e.type !== 'complite' && e.type !== 'complete')) return;
        var m = e.data && e.data.movie;
        if (!m) return;
        var r = e.object.activity.render();
        safe(function () { studioRow(e, m); });
        safe(function () { likeButton(r, m); });
        safe(function () { marksButtons(r, m); });
        safe(function () { btnsOnFull(r); });
        safe(function () { resumeNow(r, m); });
        safe(function () { posterTint(r, m); });
        // Описание в блоке «Подробнее» выбирается без видимого фокуса в штатной Lampa, из-за чего стрелка «вниз» будто переставала работать. Исключаем блок из выбора, чтобы фокус переходил дальше
        safe(function () { r.find('.full-descr__text').removeClass('selector'); });
        safe(function () { var mark = function () { var a = r.closest('.activity'); if (a.length) a.addClass('lmx-fullact'); }; mark(); setTimeout(function () { safe(mark); }, 600); });
        safe(function () { hideEmptyComments(r); setTimeout(function () { safe(function () { hideEmptyComments(r); }); }, 1500); });
        // На телефоне сохраняем штатный мобильный вид Lampa без нашего кино-оформления, рассчитанного на большой экран
        var useFull = getBool('lmx_full', true) && !isMobile();
        if (!useFull && document.body && document.body.classList) document.body.classList.remove('lmx-full');

        // Если на странице уже работает другой плагин оформления (например, Cardify), не применяем собственный кино-стиль
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
        }
        if (!foreign) setTimeout(function () { if (r.find('.custom-ghost-main').length) yieldToForeign(); }, 800);

        // Копию описания размещаем в правом верхнем углу; оригинал ниже остаётся
        if (!foreign && useFull) {
            r.find('.lmx-descr').remove();
            var txt = String(m.overview || '').trim();
            var body = r.find('.full-start-new__body').eq(0);
            if (txt && body.length) {
                var dEl = $('<div class="lmx-descr"><div class="lmx-descr__t"></div></div>').find('.lmx-descr__t').text(txt).end();
                var btns = r.find('.full-start-new__buttons').eq(0);
                // В теме HBO описание располагается в левой колонке над кнопками, а не в углу
                if (btns.length) btns.before(dEl);
                else body.append(dEl);
            }
        }

        if (!foreign && getBool('lmx_full', true) && getBool('lmx_logo', true)) safe(function () { loadLogo(r, m); });

        if (!getBool('lmx_info', true)) return;
        var pills = infoPills(m);
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
        // Штатный статус Lampa («Отменён», «Завершён» и др.) дублирует нашу метку, поэтому оставляем только одну
        if (pills.some(function (x) { return /lmx-(done|bad|next|soon)/.test(x.c || ''); })) r.find('.full-start__status').addClass('hide');
    }

    // ===== КНОПКИ СТРАНИЦЫ ФИЛЬМА: порядок, цвет, значки, папки =====
    function BI(p, f) {
        return '<svg viewBox="0 0 24 24" width="24" height="24" fill="' + (f ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
    }
    var BTN_ICONS = [
        ['play', 'Воспроизведение', BI('<path d="M7 4.5l13 7.5-13 7.5z"/>', 1)],
        ['bolt', 'Молния', BI('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', 1)],
        ['down', 'Загрузка', BI('<path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>')],
        ['star', 'Звезда', BI('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>')],
        ['heart', 'Сердце', BI('<path d="M12 20s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z"/>')],
        ['mark', 'Закладка', BI('<path d="M6 3h12v18l-6-4-6 4z"/>')],
        ['film', 'Кино', BI('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 15h18M8 4v16M16 4v16"/>')],
        ['tv', 'Телевизор', BI('<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>')],
        ['search', 'Поиск', BI('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>')],
        ['bell', 'Колокольчик', BI('<path d="M6 16v-5a6 6 0 0112 0v5l2 2H4z"/><path d="M10 21h4"/>')],
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
    var BTN_NAMES = { 'button--book': 'Закладки', 'button--reaction': 'Реакции', 'button--subscribe': 'Подписаться', 'button--options': 'Параметры',
        'button--play': 'Смотреть', 'button--lmxlike': 'Нравится', 'button--lmxlater': 'Посмотреть позже', 'button--lmxseen': 'Просмотрено', 'view--trailer': 'Трейлеры', 'view--torrent': 'Торренты', 'view--online': 'Онлайн' };
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
        // При переходе на новые стабильные ID кнопок сбрасываем старые настройки один раз
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
        var t = String(el.__lmxT || btnTitleOf(el) || '').toLowerCase();
        for (i = 0; i < cls.length; i++) { c = cls[i]; if (/^(view--|button--)/.test(c) && c !== 'button--priority') return c + (t ? '|' + strHash(t) : ''); }
        return 't_' + strHash(t || 'x');
    }
    var btnUid = 0;
    function btnCollect(cont, r) {
        var els = cont.find('.full-start__button, .simple-button').not('.lmx-folder, .lmx-edit').toArray(), seen = {}, out = [];
        els.forEach(function (el) { if (el.__lmxId != null) seen[el.__lmxId] = 1; });
        els.forEach(function (el) {
        // Lampa распознаёт закреплённую кнопку по хешу HTML. Две одинаковые кнопки «Онлайн» из разных плагинов отличаются только подписью в данных jQuery,
        // которая не попадает в HTML, поэтому хеши совпадают: закрепляются обе, а одна исчезает из меню. Переносим подпись в атрибут, чтобы HTML различался
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
        // Когда «Показывать все кнопки» выключено, первая кнопка, закреплённая долгим нажатием, остаётся на месте, а остальные можно переставлять
    function btnTokensFixed(m, ids) {
        if (!ids.length) return btnTokens(m, ids);
        return [ids[0]].concat(btnTokens(m, ids.slice(1)));
    }
    function paint(el, col) {
        if (col) { el.style.setProperty('--lmx-bc', col); el.classList.add('lmx-ic'); }
        else { el.style.removeProperty('--lmx-bc'); el.classList.remove('lmx-ic'); }
    }


        // Режим кнопки (1/2/3) задаём и классами, и inline-стилями с !important, чтобы стили темы и других плагинов его не перебивали.
        // Если сторонний плагин сбрасывает классы или style, наблюдатель восстанавливает наши значения
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
        // Перемещение фокуса (классы focus/hover) не меняет режим кнопки; пропускаем такие изменения, чтобы не переписывать стили при каждом движении пульта
        var stripFocus = function (c) { return String(c || '').replace(/\b(focus|hover|animate-trigger-enter|animate-trigger-left)\b/g, '').replace(/\s+/g, ' ').trim(); };
        var mo = new MutationObserver(function (recs) {
            var rel = false;
            for (var q = 0; q < recs.length && !rel; q++) {
                var rc = recs[q];
                if (rc.type !== 'attributes' || rc.attributeName === 'style' || stripFocus(rc.oldValue) !== stripFocus(el.className)) rel = true;
            }
            if (!rel) return;
            // Применяем сразу в той же микрозадаче, до отрисовки кадра; иначе около 80 мс видна кнопка без наших стилей
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

        // Режим кнопки (1/2/3/P): классы и inline-стили; наблюдатель восстановит их, если сторонний код сбросит
    function btnSetMode(el, d, allOn) {
        el.__lmxD = d; el.__lmxN = allOn;
        reassertMode(el);
        watchEl(el);
    }
        // Стиль каждой кнопки ряда: обёртка подписи, собственный значок, новое название, цвет, режим и состояние видимости
        // c = { m, map, inFolder, primary, modeOf, allOn }
    function btnStyleAll(list, c) {
        var m = c.m, map = c.map, inFolder = c.inFolder, primary = c.primary, modeOf = c.modeOf;
        list.forEach(function (b) {
            var el = b.el, id = b.id, ik = m.icons[id], ic = ik ? iconByKey(ik) : null;
            map[id] = el;
        // Оборачиваем текстовую подпись кнопки в span, сохраняя сам текстовый узел, чтобы его можно было скрывать и показывать
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
        // Не заменяем штатный значок: скрываем его и добавляем свой рядом, поскольку другие плагины могут искать оригинальный
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
        // При переименовании не меняем исходную подпись, которую могут читать плагины; новое название отображает CSS из атрибута
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

        // Для каждой группы создаём одну кнопку-папку; возвращаем объект {токен: элемент}
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

        // Служебная кнопка «Кнопки» (редактор) всегда находится в конце
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

        // На странице фильма в первые 2 секунды Lampa ставит фокус на первую кнопку в DOM, а не на первую видимую (порядок задаёт CSS order);
        // после этого меняем контроллер только если фокус потерян
    function btnFocusFix(cont) {
        // Меняем контроллер только если фокус потерян, иначе фокус и прокрутка прыгают при каждом обновлении ряда
        // При открытии Lampa фокусирует первую кнопку в DOM, а не первую видимую (порядок задаёт CSS order); первые 2 секунды направляем фокус на видимую первую
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
                // Если пользователь уже перемещал фокус пультом, ничего не меняем
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

        // Для кнопки, закреплённой долгим нажатием, Lampa хранит только хеш HTML, который легко нарушить. Сохраняем собственную копию
        // по классам кнопки и восстанавливаем закрепление при открытии страницы, если оно исчезло из Lampa
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
        // Две кнопки с одинаковым названием («Онлайн» из разных плагинов) Lampa различает только по хешу HTML, который меняется при нашей стилизации.
        // Поэтому помечаем закреплённую кнопку собственным атрибутом и создаём основную кнопку самостоятельно, не полагаясь на хеш
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
        // Служебное значение: хеш не совпадает ни с одной кнопкой, поэтому Lampa не скрывает пункт «Источник» и не дублирует чужую кнопку
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

        // Если «Показывать все кнопки» выключено, порядок задаёт сама Lampa: долгое нажатие переносит кнопку на первое место.
        // Если включено, порядок и размер задаём сами через свойство order, не меняя DOM и не конфликтуя с плагинами.
        // Первая видимая кнопка всегда оформляется в стиле темы; режимы 1/2/3 на неё не действуют
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

    // Самостоятельно формируем меню «Смотреть» и удаляем из него кнопки, отключённые в настройках
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

    // Кнопка «Smart Online» скрывает источники (торренты, онлайн, трейлеры) в собственном меню «Источник».
    // Незаметно закрываем это меню и превращаем его пункты в обычные кнопки ряда
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
    // Закрывает меню кнопки «Смотреть» только по явному действию пользователя и скрывает его, чтобы оно не открылось снова
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
    // Сохраняем подписи пунктов меню; при открытии страницы ничего не нажимаем
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
                    if (!it) { if (Lampa.Noty) Lampa.Noty.show('Ця кнопка зараз недоступна'); return; }
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
        // В подпись входит и номер самого элемента: если сторонний плагин пересоздал кнопку, применяем стили повторно
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
            // Отслеживаем изменения только в ряду кнопок и его контейнере, который может быть перерисован; ряды карточек и актёров ниже нас не интересуют
            var rel = false;
            for (var q = 0; q < recs.length && !rel; q++) { var tg = recs[q].target; if (node.contains(tg) || tg.contains(node)) rel = true; }
            if (!rel) return;
            // При появлении новой кнопки после перерисовки ряда Lampa или плагином применяем стили до отрисовки кадра
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
        // Полностью перезапускаем приложение при смене темы, чтобы обновились баннер, ряды и страница фильма
    function reloadApp() {
        if (Lampa.Noty) Lampa.Noty.show('Перезапуск...');
        setTimeout(function () { try { window.location.reload(); } catch (e) { location.href = location.href; } }, 400);
    }
        // Добавляем класс body, чтобы компактные кнопки выглядели компактно уже в первом кадре, до обработки скриптом
    function syncCi() {
        safe(function () {
            var m = bmGet(), lk = m.look, on = lk === 'icons' || (getBool('lmx_btn_all', false) && lk !== 'full');
            document.body.classList.toggle('lmx-ci', !!on);
        // Скрываем ряд кнопок, пока другие плагины не добавят свои кнопки и мы не применим к ним стили, чтобы размер не прыгал
            document.body.classList.toggle('lmx-hold', on || getStr('lmx_theme', 'default') !== 'default' || Object.keys(m.modes || {}).length > 0);
        // Кнопки с явно заданным режимом 1 тоже компактны с первого кадра благодаря классу кнопки
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
        // Текущий порядок кнопок на странице; неизвестные кнопки перемещаем в конец
        var ids = btnPageIds.filter(function (x) { return known[x]; });
        if (!ids.length) ids = ids0;
        var enabled = Lampa.Controller.enabled().name;
        // При повторном открытии (reopen) текущий контроллер уже modal, поэтому используем контроллер, который был до первого открытия
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
        // Только переставляем ряды на месте и не меняем коллекцию контроллера, иначе окно перестаёт прокручиваться вверх
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
        // Клавиатура Lampa открывается под нашим окном, поэтому на время ввода закрываем окно, а затем открываем его снова
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
        // Первая закреплённая кнопка всегда остаётся на месте: её нельзя перемещать или ставить перед ней другие
            if (!getBool('lmx_btn_all', false) && (row.attr('data-lock') || (sib.length && sib.attr('data-lock')))) { if (Lampa.Noty) Lampa.Noty.show('Первая кнопка закреплена долгим нажатием и всегда остаётся первой'); return; }
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
            nm.append($('<span class="lmx-ord__sub"></span>').text(lock ? 'Первая кнопка всегда оформляется в стиле темы и не меняет размер' : ((known[t] && known[t].sub) || '')));
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
                if (t === first) { if (Lampa.Noty) Lampa.Noty.show('Первая кнопка всегда оформляется в стиле темы. Значок и цвет можно изменить'); return; }
                var seq = ['1', '2', '3'], cur = m.modes[t] || '1';
                m.modes[t] = seq[(seq.indexOf(cur) + 1) % seq.length];
                save(); refresh(t);
            } else if (a === 'color') {
                pick('Цвет значка', BTN_COLORS.map(function (c) { return { title: c[1], c: c[0] }; }), function (it) {
                    if (it.c) m.colors[t] = it.c; else delete m.colors[t];
                    save(); refresh(t);
                });
            } else if (a === 'icon') {
                var items = [{ title: 'По умолчанию', k: '' }].concat(BTN_ICONS.map(function (i) { return { title: i[1], k: i[0] }; }));
                pick('Значок', items, function (it) {
                    if (it.k) m.icons[t] = it.k; else delete m.icons[t];
                    save(); refresh(t);
                });
            } else if (a === 'edit') {
                var menu = [{ title: 'Переименовать', x: 'name' }];
                if (!isF(t)) {
                    if (m.folders.length) menu.push({ title: 'Переместить в папку…', x: 'into' });
                    if (folderOf(t)) menu.push({ title: 'Убрать из папки', x: 'out' });
                }
                if (m.names[t]) menu.push({ title: 'Вернуть исходное название', x: 'unname' });
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
                if (Lampa.Noty) Lampa.Noty.show('Папка создана. Добавьте в неё кнопки через ✎ → «Переместить в папку»');
            });
        });
        var col = bigRow('', '<div class="lmx-be__bi">' + PALI + '</div><div>Цвет значков</div>');
        bind(col, function () {
            pick('Цвет всех значков', BTN_COLORS.map(function (c) { return { title: c[1], c: c[0] }; }), function (it) {
                m.color = it.c; save(); refreshAll();
            });
        });
        var look = bigRow('lmx-be__look', '<div><b></b><span class="lmx-ord__sub">Размер: 1 — только значок, 2 — значок с короткой подписью, 3 — полная подпись. Первая кнопка всегда оформляется в стиле темы. Если показ всех кнопок выключен, долгим нажатием закрепите кнопку первой; если включён — порядок меняется стрелками</span></div>');
        function lookText() { look.find('b').text('Вид кнопок: ' + lookName()); }
        lookText();
        bind(look, function () {
            pick('Вид кнопок', BTN_LOOKS.map(function (x) { return { title: x[1], l: x[0] }; }), function (it) {
                m.look = it.l; save(); lookText();
            });
        });
        var allRow = bigRow('lmx-be__look', '<div><b></b><span class="lmx-ord__sub">Добавляет в ряд кнопки, которые Lampa показывает только в меню «Смотреть»</span></div>');
        function allText() { allRow.find('b').text('Показывать все кнопки: ' + (getBool('lmx_btn_all', false) ? 'да' : 'нет')); }
        allText();
        bind(allRow, function () {
            var on = !getBool('lmx_btn_all', false);
            Lampa.Storage.set('lmx_btn_all', on ? 'true' : 'false');
            allText();
            if (!on) Lampa.Storage.set('lmx_btn_menu', []);
            function after(n) {
                if (on && Lampa.Noty) Lampa.Noty.show(n ? 'Добавлено кнопок из меню «Смотреть»: ' + n : 'В меню «Смотреть» ничего не найдено');
                safe(function () { if (btnRun) btnRun(true); });
                reopen();
            }
            if (on && btnScanNow) btnScanNow(function (n) { after(n || menuGet().length); });
            else after(0);
        });
        top.append(mk, col, look, allRow);

        var reset = bigRow('lmx-be__reset', 'Сбросить настройки');
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
        // Страховка: после Modal.close Lampa восстанавливает контроллер, но могла сохранить не тот; возвращаем свой, когда модального окна уже нет
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


    // ===== Кнопка темы в шапке рядом с поиском, колокольчиком и настройками =====
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



    // ===== Колокольчик «Новые серии» в шапке: сериалы из просмотра, лайков и закладок с эпизодом, вышедшим за последние две недели =====
        // Счётчик показывает только непросмотренные эпизоды и сбрасывается после открытия списка
    var neCache = null, neBusy = false;
    function neKey(e) { return e.season + ':' + e.episode; }
    function neCollect(cb) {
        // Кэшируем данные на 2 часа в памяти и хранилище, чтобы не отправлять десятки запросов TMDB при каждом запуске
        if (!neCache) { var pc = jsonStore('lmx_ne_cache', null); if (pc && pc.data && Date.now() - pc.t < 7200000) neCache = pc; }
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
        var lo = dayStr(-14), hi = dayStr(0), out = [], qi = 0, left = list.length;
        function fin() {
            if (--left > 0) return;
            neBusy = false;
            out.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
            neCache = { t: Date.now(), data: out };
            safe(function () { Lampa.Storage.set('lmx_ne_cache', neCache); });
            cb(out);
        }
        function pump() {
            if (qi >= list.length) return;
            var c = list[qi++];
            load(c.id, function (j) {
                var le = j && j.last_episode_to_air;
                if (le && le.air_date && le.air_date >= lo && le.air_date <= hi) {
                    out.push({ id: j.id, name: j.name || c.name, poster: j.poster_path, backdrop: j.backdrop_path, season: le.season_number, episode: le.episode_number, epname: le.name || '', date: le.air_date,
                        card: { id: j.id, name: j.name, original_name: j.original_name, poster_path: j.poster_path, backdrop_path: j.backdrop_path, overview: j.overview, vote_average: j.vote_average, first_air_date: j.first_air_date, original_language: j.original_language, media_type: 'tv', source: 'tmdb' } });
                }
                fin(); pump();
            });
        }
        for (var k = 0; k < 2; k++) pump();
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
                'body.lmx-apple .lmx-nedd{background:rgba(255,255,255,.12);-webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);border-color:rgba(255,255,255,.22);border-radius:1.3em}' +
                '.lmx-nedd__h{text-transform:uppercase;display:flex;justify-content:space-between;padding:.9em 1.1em .7em;font-size:.8em;font-weight:800;letter-spacing:.14em;border-bottom:1px solid rgba(255,255,255,.1)}.lmx-nedd__h span{opacity:.55;font-weight:500;letter-spacing:0}' +
                '.lmx-ne{position:relative;display:block;height:7.2em;margin:.5em .6em;border-radius:.7em;overflow:hidden;background:#2a2d36 center/cover no-repeat}' +
                '.lmx-ne::before{content:"";position:absolute;left:0;top:0;right:0;bottom:0;background:linear-gradient(90deg,rgba(0,0,0,.85),rgba(0,0,0,.1) 85%)}' +
                '.lmx-ne.focus,.lmx-ne.hover{box-shadow:0 0 0 .22em #fff}' +
                '.lmx-ne__x{position:absolute;left:1em;bottom:.8em;right:1em}.lmx-ne__t{font-size:1.1em;font-weight:700;text-shadow:0 1px 6px rgba(0,0,0,.6)}.lmx-ne__s{font-size:.88em;margin-top:.25em;text-shadow:0 1px 6px rgba(0,0,0,.6)}.lmx-ne__s b{font-weight:700}' +
                '.lmx-ne__n{position:absolute;right:.7em;top:.7em;font-size:.6em;font-weight:800;letter-spacing:.08em;padding:.35em .7em;border-radius:.4em;color:#fff}' +
        // «Кино»: почти чёрный фон, скругление 1em, белая рамка в фокусе и округлые кнопки вместо прямых углов
                'body.lmx-prem .lmx-nedd{background:rgba(14,15,24,.97);border:1px solid rgba(255,255,255,.08);border-radius:1.2em;box-shadow:0 1em 3em rgba(0,0,0,.7);padding-bottom:.3em}' +
                'body.lmx-prem .lmx-nedd__h{text-transform:none;letter-spacing:0;font-size:1.05em;font-weight:800;border-bottom:0;padding:1em 1.2em .5em}body.lmx-prem .lmx-nedd__h span{font-size:.8em}' +
                'body.lmx-prem .lmx-ne{border-radius:1em;background-color:#12131f}' +
                'body.lmx-prem .lmx-ne.focus,body.lmx-prem .lmx-ne.hover{box-shadow:0 0 0 .12em rgba(255,255,255,.6),0 .5em 1em rgba(0,0,0,.6)}' +
                'body.lmx-prem .lmx-ne__n{background:#fff;color:#000;border-radius:99em;padding:.35em .9em}body.lmx-prem .lmx-ne__s b{color:#fff}body.lmx-prem .lmx-nebadge{background:#fff;color:#000}' +
        // «Стекло»: матовое стекло, крупные скругления и прозрачные плашки
                'body.lmx-apple .lmx-nedd{border-radius:1.4em}body.lmx-apple .lmx-ne{border-radius:1.1em;margin:.5em .7em}' +
                'body.lmx-apple .lmx-ne.focus,body.lmx-apple .lmx-ne.hover{box-shadow:0 0 0 .18em rgba(255,255,255,.9),0 0 1.4em rgba(255,255,255,.28)}' +
                'body.lmx-apple .lmx-ne__n{background:rgba(255,255,255,.24);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.3);border-radius:1em;padding:.35em .9em}' +
                'body.lmx-apple .lmx-ne__s b{color:#fff}body.lmx-apple .lmx-nebadge{background:rgba(255,255,255,.92);color:#000}';
            document.head.appendChild(st);
        }
        // Режим колокольчика задаётся в настройке «Колокольчик в шапке» раздела NoCub; наш вариант показывается только в режиме «lmx»
        function syncMode() {
            safe(function () { document.body.classList.toggle('lmx-bell-off', String(Lampa.Storage.get('lmx_bell_mode', 'lmx') || 'lmx') !== 'lmx'); });
        }
        syncMode();
        safe(function () { Lampa.Storage.listener.follow('change', function (e) { if (e && e.name === 'lmx_bell_mode') syncMode(); }); });
        // В теме «Облегчённая» цвет метки новых серий настраивается; в темах «Кино» и «Стекло» он нейтральный и задан в CSS
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
        function refresh() { safe(function () { neCollect(function (arr) { badge(neUnseen(arr).length); }); }); }
        var dd = null;
        function closeDD(back, dir) {
            if (!dd) return;
            dd.remove(); dd = null;
            if (back) { try { Lampa.Controller.toggle(back); } catch (e) {} }
                // Стрелки влево и вправо переводят фокус на соседнюю кнопку шапки
            if (dir && back === 'head') { try { Lampa.Controller.move(dir); } catch (e) {} }
        }
        var lastOpen = 0, ddBack = null;
        function open() {
            // На телефоне одно касание вызывает и hover:enter, и click; без этой проверки список открывался и сразу закрывался
            var tn = Date.now();
            if (tn - lastOpen < 600) return;
            lastOpen = tn;
            if (dd) return closeDD(Lampa.Controller.enabled().name === 'lmx_ne' ? 'content' : null);
            var enabled = Lampa.Controller.enabled().name;
            ddBack = enabled;
            neCollect(function (arr) {
                var seen = jsonStore('lmx_ne_seen', {}), fresh = {}, nFresh = 0;
                arr.forEach(function (e) { fresh[e.id] = seen[e.id] !== neKey(e); if (fresh[e.id]) nFresh++; });
                if (!arr.length) { if (Lampa.Noty) Lampa.Noty.show('Новых серий за последние 2 недели нет'); return; }
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
                    tx.append($('<div class="lmx-ne__s"></div>').append($('<b></b>').css('color', c).text('С' + e.season + ' Э' + e.episode)).append(document.createTextNode((e.epname ? ' · ' + e.epname : '') + ' · ' + neAgo(e.date))));
                    el.append(tx);
                    el.on('hover:enter click', function () {
                        closeDD();
                        Lampa.Activity.push({ url: '', component: 'full', id: e.id, method: 'tv', card: e.card, source: 'tmdb' });
                    });
                    dd.append(el); els.push(el[0]);
                });
            // Размещаем список под колокольчиком, выравнивая по его правому краю
                var br = $('.lmx-nebell')[0].getBoundingClientRect();
                if (window.innerWidth <= 760) dd.css({ top: Math.round(br.bottom + 8) + 'px', left: '8px', right: '8px', width: 'auto', maxWidth: 'none', maxHeight: Math.round(window.innerHeight - br.bottom - 24) + 'px' });
                else dd.css({ top: Math.round(br.bottom + 10) + 'px', right: Math.max(8, Math.round(window.innerWidth - br.right - 20)) + 'px' });
                $('body').append(dd);
            // При открытии списка считаем все его элементы просмотренными и скрываем счётчик
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
            // Если есть свежий кэш, сразу показываем счётчик без сетевого запроса
            safe(function () { var pc = neCache || jsonStore('lmx_ne_cache', null); if (pc && pc.data && Date.now() - pc.t < 7200000) refresh(); });
        }
        ensure();
        var n = 0, iv = setInterval(function () { ensure(); if (++n > 20) clearInterval(iv); }, 1500);
            // Касание вне списка закрывает его; на телефоне кнопку «Назад» не всегда удобно нажать
        document.addEventListener('click', function (ev) {
            if (!dd || Date.now() - lastOpen < 600) return;
            var t = ev.target;
            if (t && t.closest && (t.closest('.lmx-nedd') || t.closest('.lmx-nebell'))) return;
            closeDD(ddBack);
        }, true);
        // Отправляем запросы TMDB после загрузки и отрисовки главной, а не во время запуска приложения
        function neWarm() { if (neWarm.t) return; neWarm.t = setTimeout(function () { neWarm.t = 0; if (!document.hidden) refresh(); }, 100); }
        setTimeout(refresh, 45000);
        setInterval(refresh, 30 * 60000);
        
    }

    // ===== Навигация вверх и вниз между рядами кнопок на странице фильма =====
        // Lampa ищет кнопку строго под текущей; если в нижнем ряду там пусто, экран просто прокручивается. Вместо этого переходим к ближайшей кнопке соседнего ряда
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
                // Ищем ближайший ряд в нужном направлении
                var rowY = cand.reduce(function (a, e) {
                    var t = e.getBoundingClientRect().top;
                    return a === null || (k === 40 ? t < a : t > a) ? t : a;
                }, null);
                var row = cand.filter(function (e) { return Math.abs(e.getBoundingClientRect().top - rowY) < cr.height / 2; });
                // Если непосредственно сверху или снизу есть кнопка, оставляем штатную навигацию Lampa
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

    // В наших темах фон приложения скрыт (.background{display:none}), но Lampa всё равно загружает и меняет изображение для каждой карточки в фокусе.
    // Это создаёт лишний сетевой трафик и нагрузку на процессор при прокрутке, вызывая рывки на ТВ. Пока фон скрыт, пропускаем такие действия
    // ===== Проверка настроек Lampa: какие параметры интерфейса нагружают ТВ или мешают нашим темам =====
    var PERF = [
        { key: 'background_type', want: 'simple', bad: function (v) { return v === 'complex'; }, name: 'Тип фона', now: function (v) { return v === 'complex' ? 'Сложный' : v; }, to: 'Простой' },
        { key: 'glass_style', want: 'false', bad: function (v) { return v === true || v === 'true'; }, name: 'Стеклянный стиль', now: function () { return 'включён'; }, to: 'выключить' },
        { key: 'advanced_animation', want: 'false', bad: function (v) { return v === true || v === 'true'; }, name: 'Продвинутая анимация', now: function () { return 'включена'; }, to: 'выключить' },
        { key: 'animation', want: 'true', bad: function (v) { return v === false || v === 'false'; }, name: 'Анимация', now: function () { return 'выключена (мешает плавной прокрутке)'; }, to: 'включить' },
        { key: 'scroll_type', want: 'css', bad: function (v) { return v === 'js'; }, name: 'Тип прокрутки', now: function () { return 'JavaScript'; }, to: 'CSS' },
        { key: 'light_version', want: 'false', bad: function (v) { return v === true || v === 'true'; }, name: 'Облегчённая версия', now: function () { return 'включена (упрощает вид и конфликтует с темами)'; }, to: 'выключить' }
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
        if (!list.length) { if (Lampa.Noty) Lampa.Noty.show('Настройки Lampa в порядке: ничего не нагружает телевизор'); return; }
        var enabled = Lampa.Controller.enabled().name;
        var items = [{ title: 'Исправить всё (' + list.length + ')', all: true }].concat(list.map(function (x) {
            return { title: x.name + ': ' + x.now(Lampa.Storage.field(x.key)), subtitle: 'Рекомендуется: ' + x.to, key: x.key };
        }));
        Lampa.Select.show({
            title: 'Настройки Lampa',
            items: items,
            onSelect: function (a) {
                var todo = a.all ? list : list.filter(function (x) { return x.key === a.key; });
                todo.forEach(function (x) { try { Lampa.Storage.set(x.key, x.want); } catch (e) {} });
                if (Lampa.Noty) Lampa.Noty.show('Изменено: ' + todo.length + '. Некоторые изменения применятся после перезапуска Lampa');
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
        // getComputedStyle при каждом фокусе заставлял браузер пересчитывать стили в начале анимации; кэшируем результат на 2 секунды
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

    // ===== Режим «Кинозал»: после 8 секунд паузы плеер затемняется, поверх показываются постер и описание =====
    // Обработчики клавиш активны только во время паузы; в остальное время код не работает. Без размытия — только градиент и два изображения
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

    // ===== Запуск =====
    // Устанавливаем перехватчик сразу при загрузке, чтобы обнаружить ряды, добавленные позже
    // Запоминаем только версию плагина. При обновлении НЕ сбрасываем пользовательский порядок и видимость рядов
    var VERSION = '10.418';
        // Название плагина в списке расширений Lampa; иначе будет показано «Без названия»
    try { if (window.Lampa && Lampa.Manifest) Lampa.Manifest.plugins = { type: 'other', version: String(VERSION), name: 'LMX Pack', description: 'Главная, карточки, страница фильма и оформление Lampa в одном плагине', author: 'Irfnekf' }; } catch (e) {}
    safe(function () {
        if (String(Lampa.Storage.get('lmx_ver', '') || '') !== VERSION) Lampa.Storage.set('lmx_ver', VERSION);
    });
        // Затемнение краёв (штатная настройка Lampa «mask») создаёт тяжёлый слой поверх экрана: один раз отключаем его при установке, затем не меняем выбор пользователя
    safe(function () {
        if (Lampa.Storage.get('lmx_mask_off', '') === true || Lampa.Storage.get('lmx_mask_off', '') === 'true') return;
        Lampa.Storage.set('lmx_mask_off', true);
        if (Lampa.Storage.field('mask')) {
            Lampa.Storage.set('mask', false);
            if (document.body) document.body.classList.add('no--mask');
        }
    });
    safe(patchContentRows);

    // Долгое нажатие кнопки в меню «Смотреть» сохраняет хеш её HTML. Наш плагин добавляет класс, стили и значок,
    // поэтому после перезапуска хеш менялся и настройка «Первая кнопка» сбрасывалась. Хешируем только исходные классы кнопки — без lmx-*, стилей и содержимого
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

    function start() {
        safe(patchContentRows);
        safe(patchBackground);
        safe(syncCi);
        safe(addSettings);
        safe(moodMenu);
        safe(function () { setTimeout(function () { safe(moodMenu); }, 2500); });
        safe(initRows);
        safe(function () { setTimeout(resolveCatalogRefs, 3000); });
        safe(function () {
            applyStyle();
            new MutationObserver(function (muts) {
                // Проверяем только добавленные узлы: появились ли карточки и есть ли среди них афиша
                var hero = false, card = false;
                for (var i = 0; i < muts.length; i++) {
                    var add = muts[i].addedNodes;
                    for (var k = 0; k < add.length; k++) {
                        var n = add[k];
                        if (n.nodeType !== 1) continue;
                        var cl = n.classList;
                        if (cl && cl.contains('card')) { card = true; if (cl.contains('card--lmxhero')) hero = true; }
                        else if (n.querySelector && n.querySelector('.card')) { card = true; if (n.querySelector('.card--lmxhero')) hero = true; }
                    }
                }
                safe(function () { markHero(hero); });
                if (card) schedule();
            }).observe(document.body, { childList: true, subtree: true });
            scan();
            Lampa.Listener.follow('full', function (e) { safe(function () { onFull(e); }); });
            // При возвращении на страницу фильма (например, из «Онлайн») Lampa возвращает фокус на последний элемент, который из-за порядка кнопок
            // может не быть первым на экране. Если пультом ещё не пользовались, ставим фокус на первую видимую кнопку
            Lampa.Listener.follow('activity', function (e) {
                if (!e || e.type !== 'start' || e.component !== 'full') return;
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
            safe(initNewEpBell);
            safe(initCinema);
            safe(initBtnRowsNav);
        });
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') start();
    });
})();

// ───────── NoCub (ранее отдельный плагин nocub.js): скрывает элементы CUB; переключатели находятся в Настройки → NoCub ─────────
/*
 * NoCub v1.10 скрывает элементы CUB в интерфейсе Lampa (для личного использования).
 * Каждый пункт — отдельный переключатель в Настройки → NoCub; по умолчанию все ВЫКЛЮЧЕНЫ.
 * Плагин только скрывает элементы стилями: ничего не удаляет и не блокирует запросы. При выключении переключателя всё возвращается.
 * Не затрагивает прокси TMDB, закладки, историю, таймкоды, каталог расширений, обновления Lampa и рекламу в плеере.
 */
(function () {
    'use strict';
    if (window.__nocub) return;
    window.__nocub = true;

    var VERSION = '1.10';
    function safe(fn) { try { return fn(); } catch (e) { try { console.error('NoCub', e); } catch (x) {} } }

    // Переключатели: ключ → что скрываем
    var ITEMS = [
        { key: 'nocub_reactions', name: 'Реакции', desc: 'Кнопки реакций на карточках и странице фильма' },
        { key: 'nocub_reviews', name: 'Комментарии и отзывы', desc: 'Блок «Комментарии» на странице фильма, включая кнопку «Добавить»' },
        { key: 'nocub_premium', name: 'Премиум и приглашения', desc: 'Пункты меню, значки и плашки о премиум-подписке и приглашениях друзей' },
        { key: 'nocub_account', name: 'Аккаунт CUB', desc: 'Встроенный аккаунт и синхронизация CUB: вход, профили и пункт «Синхронизация». Сторонние плагины синхронизации не затрагиваются' },
        { key: 'nocub_meta', name: 'Метаданные и настроение', desc: 'Блоки «Метаданные» и «Настроение» на странице фильма; доступны не для всех фильмов' },
        { key: 'nocub_recs', name: 'Рекомендации на странице фильма', desc: 'Блоки «Рекомендации» и «Похожие» внизу страницы фильма' },
        { key: 'nocub_subscribe', name: 'Кнопка «Подписаться»', desc: 'Подписка на фильм, сериал или актёра (нужен аккаунт CUB)' },
        { key: 'nocub_shots', name: 'Shots', desc: 'Короткие видео Shots: пункт меню, ряд на главной, кнопка на странице фильма, метки и запись в плеере, раздел в настройках' },
        { key: 'nocub_promo', name: 'Акционные кнопки и плашки', desc: 'Сезонные акции CUB — Хэллоуин, Новый год, чёрная пятница, скидки и подарки', def: true },
        { key: 'nocub_strict', name: 'Только известные кнопки шапки', desc: 'Скрывает неизвестные кнопки в шапке. Кнопки других плагинов добавьте в список «Оставить кнопки» ниже', def: false }
    ];
    var PROMO = ['halloween', 'helloween', 'newyear', 'new-year', 'christmas', 'xmas', 'blackfriday', 'black-friday', 'cybermonday', 'sale', 'promo', 'discount', 'gift', 'valentine', 'easter', 'birthday', 'anniversary'];
    // Известные кнопки шапки; остальные считаются «неизвестными» в строгом режиме
    var KNOWN_HEAD = /open--(search|settings|broadcast|notice|profile|feed|premium)|notice--icon|full--screen|lmx-themebtn|lmx-nebell|head__back|head__menu|head__logo/;

    function defOf(key) { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].key === key) return !!ITEMS[i].def; return false; }
    // Колокольчик: 'lmx' — наши «Новые серии» (колокольчик CUB скрыт), 'cub' — стандартный, 'none' — отключён
    function bellMode() { var m = String(Lampa.Storage.get('lmx_bell_mode', 'lmx') || 'lmx'); return m === 'cub' || m === 'none' ? m : 'lmx'; }
    function on(key) {
        if (key === 'nocub_bell') return bellMode() !== 'cub';
        // Без настроек всегда скрываем рекламные плашки CUB; строгий режим шапки выключен
        if (key === 'nocub_promo') return true;
        if (key === 'nocub_strict') return false;
        var v = Lampa.Storage.get(key, defOf(key) ? 'true' : 'false');
        return v === true || v === 'true';
    }

    // CSS-селекторы (простые, без поиска по тексту)
    var CSS = {
        nocub_reactions: [
            '.full-start__button.button--reaction', '.button--reaction',
            '.full-start-new__reactions', '.full-start__reactions', '.full-start-new .reaction', '.full-start .reaction',
            '.card__reactions', '.full-reactions'
        ],
        nocub_reviews: ['.full-review', '.full-review-add', '.full-reviews'],
        nocub_bell: ['.head__action.notice--icon', '.head__action.open--notice', '.head__action--notice', '.notice--icon'],
        nocub_premium: ['.head__action.halloween__button', '.halloween__button', 'body > .halloween', '.halloween', '.head__action[class*="halloween"]', '.head__action[class*="helloween"]', '.head [class*="premium"]', '.head__action[data-action*="premium"]', '.head__action.open--premium', '.open--premium', '.head [class*="cub-premium"]', '.menu__item[data-action="premium"]', '.settings-folder[data-component="premium"]'],
        nocub_account: ['.menu__item[data-action="account"]', '.settings-folder[data-component="account"]', '.head__action.open--profile'],
        nocub_subscribe: ['.button--subscribe', '.full-start__button.view--subscribe'],
        nocub_shots: ['.shots-view-button', '.shots-player-button', '.shots-player-segments', '.shots-player-recorder', '.settings-folder[data-component="shots"]'],
        nocub_promo: PROMO.reduce(function (acc, w) { acc.push('[class^="' + w + '"]', '[class*=" ' + w + '"]'); return acc; }, [])
    };
    var HIDE = '{display:none !important}';
    // Правила применяются только для включённых переключателей: селекторы вроде [class*="sale"] иначе проверялись бы для КАЖДОГО элемента при каждом пересчёте стилей, даже когда настройка выключена
    var lastCss = null;
    function css() {
        var out = '';
        Object.keys(CSS).forEach(function (k) {
            if (!on(k)) return;
            out += CSS[k].map(function (s) { return 'body.' + k + ' ' + s; }).join(',') + HIDE;
        });
        return out + '.nocub-hide' + HIDE;
    }

    // Поиск по тексту, если у элемента нет стабильного класса: ключ → [контейнер, regexp]
    var TEXT = [
        { key: 'nocub_premium', sel: '.head .head__action', html: /premium|преміум|премиум|halloween|helloween|хелоуін|хэллоуин/i },
        { key: 'nocub_premium', sel: '.menu .menu__item', re: /преміум|премиум|premium|запроси|пригласи|invite/i },
        // Скрываем только пункты с прямым упоминанием CUB; пункты сторонних плагинов синхронизации не трогаем
        { key: 'nocub_account', sel: '.menu .menu__item', re: /(увійти|войти|login|sign in).{0,12}cub|cub.{0,12}(акаунт|аккаунт|account)/i },
        { key: 'nocub_account', sel: '.settings-folder', re: /cub.{0,12}(акаунт|аккаунт|account)|(акаунт|аккаунт|account).{0,12}cub/i },
        { key: 'nocub_shots', sel: '.menu .menu__item', re: /^\s*shots\s*$/i },
        { key: 'nocub_shots', sel: '.items-line', re: /^\s*shots\b/i, title: true },
        { key: 'nocub_subscribe', sel: '.full-start-new__buttons .full-start__button, .full-start__buttons .full-start__button', re: /підписат|подписат|subscribe/i },
        { key: 'nocub_reviews', sel: '.items-line', re: /^\s*(коментар|комментар|відгук|отзыв|comments|reviews)/i, title: true },
        { key: 'nocub_meta', sel: '.items-line', re: /^\s*(метадан|метаданн|metadata|настро|настроен|moods?\b)/i, title: true, onlyFull: true },
        { key: 'nocub_recs', sel: '.items-line', re: /^\s*(рекомендац|рекомендаці|схож|similar|recommendations)/i, title: true, onlyFull: true }
    ];

    // Скрытый элемент не должен оставаться доступным для выбора пультом: иначе фокус попадёт на невидимый пункт и подсветка исчезнет
    function mark(el, key) {
        // Кнопки в ряду страницы фильма скрываем только стилем через класс body: изменение их классов заставляет LMX пересчитывать размеры, и первая кнопка мигает
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
            var active = on(k);
            var sel = active ? CSS[k].join(',') : '[data-nocub="' + k + '"]'; // Для выключенного переключателя ищем только уже помеченные элементы, чтобы восстановить их
            var els;
            try { els = document.querySelectorAll(sel); } catch (e) { return; }
            for (var i = 0; i < els.length; i++) {
                var el = els[i];
                if (active) { if (!el.classList.contains('nocub-hide') || el.getAttribute('data-nocub') !== k) mark(el, k); }
                else if (el.getAttribute('data-nocub') === k) unmark(el);
            }
        });
    }
    // Защита навигации пультом: невидимый пункт настроек (display:none) не должен оставаться доступным для выбора, даже если его скрыла сама Lampa
    function fixSettingsFocus() {
        var root = document.querySelector('.settings');
        if (!root) return;
        // Проверяем не чаще раза в секунду и только при необходимости; на телефоне это предотвращает циклическое открытие настроек
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
        // Меняем фокус только если он потерян и у видимого пункта нет .focus; иначе навигацией управляет Lampa
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
                    // Скрываем блоки «Рекомендации» только на странице фильма, не на главной
                    if (hit && rule.onlyFull && !document.querySelector('.activity--active .full-start-new, .activity--active .full-start')) hit = false;
                }
                if (hit) mark(el, rule.key);
                else if (el.getAttribute('data-nocub') === rule.key) unmark(el);
            }
        });
    }

    // Lampa позволяет отключить ряд Shots на главной в настройках рядов, не загружая его данные. Синхронизируем его с нашим переключателем и восстанавливаем только если отключили сами
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
            component: 'nocub', param: { name: 'lmx_bell_mode', type: 'select', values: { lmx: 'Наши «Новые серии» (LMX)', cub: 'Стандартный (CUB)', none: 'Скрыть оба' }, default: 'lmx' },
            field: { name: 'Колокольчик в шапке', description: 'Выберите список новых серий LMX, стандартный колокольчик CUB или отключите оба' },
            onChange: function () { setTimeout(function () { safe(applyBody); safe(scan); }, 50); }
        });
        ITEMS.forEach(function (it) {
            if (it.key === 'nocub_promo' || it.key === 'nocub_strict') return;
            S.addParam({
                component: 'nocub', param: { name: it.key, type: 'trigger', default: !!it.def },
                field: { name: it.name, description: it.desc },
                onChange: function () { setTimeout(function () { safe(applyBody); safe(scan); }, 50); }
            });
        });
        S.addParam({ component: 'nocub', param: { name: 'nocub_v', type: 'title', default: '' }, field: { name: 'NoCub v' + VERSION + ' · только скрывает элементы, ничего не удаляет' } });
    }

    // На странице фильма Lampa перебирает блоки (сезоны, актёры, комментарии, коллекция и др.) по внутреннему списку, а не по видимому содержимому.
    // Пустой блок «Комментарии», скрытый LMX, и блоки NoCub остаются в списке: при переходе вниз фокус попадал на них, а Lampa
    // прокручивала страницу вверх к началу. Поэтому управляем навигацией между блоками самостоятельно и пропускаем такие блоки.
    function isHiddenBlock(el) {
        if (!el) return true;
        if (el.classList.contains('nocub-hide') || el.classList.contains('lmx-nocomm') || el.closest('.nocub-hide')) return true;
        if (el.classList.contains('items-line')) {
            // Скрываем пустые комментарии (только кнопка «Добавить») сразу, не дожидаясь таймера LMX
            if (el.querySelector('.full-review-add') && !el.querySelector('.full-review')) { el.classList.add('lmx-nocomm'); return true; }
            // Если блок только что создан и сканер NoCub ещё не успел его скрыть, проверяем его самостоятельно по тем же правилам
            var t = el.querySelector('.items-line__title'), txt = t ? t.textContent.slice(0, 80) : '';
            if (txt) {
                for (var i = 0; i < TEXT.length; i++) {
                    var r = TEXT[i];
                    if (r.sel === '.items-line' && r.title && r.re && on(r.key) && r.re.test(txt)) { mark(el, r.key); return true; }
                }
            }
        }
        return el.offsetParent === null;
    }
        // Блок не содержит видимых элементов, на которые можно перейти пультом
    function deadBlock(item) {
        var el = null;
        try { el = item.render(true); } catch (x) {}
        if (!el || isHiddenBlock(el)) return true;
        var sel = el.querySelectorAll('.selector');
        for (var i = 0; i < sel.length; i++) if (sel[i].offsetParent !== null) return false;
        return true;
    }
    // Собственная навигация вверх и вниз между блоками вместо штатной; onlyDown/onlyUp полностью её заменяют
    function hookFull(e) {
        if (!e || e.type !== 'build' || !e.link) return;
        var link = e.link;
        if (link.__nocubNav || typeof link.use !== 'function' || !Array.isArray(link.items)) return;
        link.__nocubNav = 1;
        // Ищем ближайший доступный блок в направлении d; Lampa создаёт нижние блоки по мере прокрутки, поэтому если в конце созданного
        // списка остались только недоступные блоки, просим Lampa создать следующую порцию и продолжаем поиск
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
            // Если ниже нет видимых блоков, остаёмся на текущем
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
            // NoCub не обрабатывает карточки, добавленные в ряды; реагируем только на другие новые элементы — меню, настройки, кнопки и ряды
            new MutationObserver(function (muts) {
                for (var i = 0; i < muts.length; i++) {
                    var add = muts[i].addedNodes;
                    for (var k = 0; k < add.length; k++) {
                        var n = add[k];
                        if (n.nodeType !== 1) continue;
                        // Карточки и собственные элементы LMX (подписи на постерах, точки, цветовой слой и др.) не относятся к NoCub
                        var nc = typeof n.className === 'string' ? n.className : '';
                        if (n.classList && n.classList.contains('card')) continue;
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
