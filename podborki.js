
(function () {
    'use strict';

    if (window.plugin_streaming_collections_ready) return;
    window.plugin_streaming_collections_ready = true;

    var globalStreaming = [
        { id: 213, title: 'Netflix' }, { id: 2739, title: 'Disney+' },
        { id: 2552, title: 'Apple TV+' }, { id: 1024, title: 'Amazon Prime Video' },
        { id: 3186, title: 'Max' }, { id: 4330, title: 'Paramount+' },
        { id: 3353, title: 'Peacock' }, { id: 453, title: 'Hulu' },
        { id: 49, title: 'HBO' }, { id: 318, title: 'Starz' },
        { id: 2, title: 'ABC' }, { id: 6, title: 'NBC' },
        { id: 19, title: 'FOX' }, { id: 67, title: 'Showtime' },
        { id: 88, title: 'FX' }, { id: 174, title: 'AMC' },
        { id: 16, title: 'CBS' }, { id: 64, title: 'Discovery' },
        { id: 493, title: 'BBC America' }, { id: 77, title: 'SyFy' }
    ];

    var russianStreaming = [
        { id: 3827, title: 'Кинопоиск HD' }, { id: 2493, title: 'Start' },
        { id: 3923, title: 'ИВИ' }, { id: 3871, title: 'Okko' },
        { id: 4085, title: 'KION' }, { id: 2859, title: 'Premier' },
        { id: 5806, title: 'Wink' }, { id: 3882, title: 'More.TV' },
        { id: 412, title: 'Россия 1' }, { id: 558, title: 'Первый канал' },
        { id: 806, title: 'СТС' }, { id: 1191, title: 'ТНТ' },
        { id: 3031, title: 'Пятница!' }
    ];

    var allSortOptions = [
        { id: 'vote_count.desc', title: 'sc_sort_votes' },
        { id: 'vote_average.desc', title: 'sc_sort_rating' },
        { id: 'first_air_date.desc', title: 'sc_sort_new' },
        { id: 'popularity.desc', title: 'sc_sort_popular' }
    ];

    var logoPending = {};

    var LOGO_STORAGE_KEY = 'sc_logo_cache';
    var logoCache = Lampa.Storage.get(LOGO_STORAGE_KEY) || {};

    function saveLogoCache() {
        Lampa.Storage.set(LOGO_STORAGE_KEY, logoCache);
    }

    function getLogoUrl(networkId, callback) {
        if (logoCache.hasOwnProperty(networkId) && logoCache[networkId]) return callback(logoCache[networkId]);
        if (logoPending[networkId]) { logoPending[networkId].push(callback); return; }
        logoPending[networkId] = [callback];

        var apiUrl = Lampa.TMDB.api('network/' + networkId + '?api_key=' + Lampa.TMDB.key());
        Lampa.Network.silent(apiUrl, function (data) {
            var url = data && data.logo_path ? Lampa.TMDB.image('t/p/w154' + data.logo_path) : '';
            logoCache[networkId] = url;
            saveLogoCache();
            var cbs = logoPending[networkId] || [];
            delete logoPending[networkId];
            cbs.forEach(function (cb) { cb(url); });
        }, function () {
            var cbs = logoPending[networkId] || [];
            delete logoPending[networkId];
            cbs.forEach(function (cb) { cb(''); });
        }, false, { cache: { life: 60 * 24 * 7 } });
    }

    function preloadLogos() {
        globalStreaming.concat(russianStreaming).forEach(function (s) { getLogoUrl(s.id, function () {}); });
    }

    function getAll() { return Lampa.Storage.get('streaming_collections_settings') || {}; }
    function getProfile() {
        var pid = Lampa.Storage.get('lampac_profile_id', '') || 'default';
        var a = getAll(); if (!a[pid]) { a[pid] = {}; Lampa.Storage.set('streaming_collections_settings', a); } return a[pid];
    }
    function getSetting(k, d) { var p = getProfile(); return p.hasOwnProperty(k) ? p[k] : d; }
    function setSetting(k, v) {
        var a = getAll(), pid = Lampa.Storage.get('lampac_profile_id', '') || 'default';
        if (!a[pid]) a[pid] = {}; a[pid][k] = v; Lampa.Storage.set('streaming_collections_settings', a);
    }

    var BASE_KW = '346488,158718,41278,13141,345822,315535,290667,323477,290609';

    function buildParams(sort, isRussian) {
        var p = '&sort_by=' + sort.id;
        if (sort.id === 'first_air_date.desc') {
            var e = new Date(); e.setDate(e.getDate() - 10);
            var s = new Date(); s.setFullYear(s.getFullYear() - 3);
            p += '&first_air_date.gte=' + s.toISOString().split('T')[0] + '&first_air_date.lte=' + e.toISOString().split('T')[0];
        }
        if (!isRussian) p += '&vote_count.gte=10';
        return p + '&without_keywords=' + encodeURIComponent(BASE_KW);
    }

    function getEnabledSorts() {
        var r = allSortOptions.filter(function (s) { return getSetting('sort_' + s.id, true); });
        return r.length ? r : allSortOptions;
    }

    function getActiveServices() {
        var list = [];
        if (getSetting('include_global', true))
            globalStreaming.forEach(function (s) { if (getSetting('gs_' + s.id, true)) list.push({ service: s, isRussian: false }); });
        if (getSetting('include_russian', true))
            russianStreaming.forEach(function (s) { if (getSetting('rs_' + s.id, true)) list.push({ service: s, isRussian: true }); });
        return list;
    }

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
    }

    var currentRenderList = null;
    var renderTimestamp = 0;

    function getCurrentRenderList() {
        var now = Date.now();
        if (currentRenderList && (now - renderTimestamp) < 2000) return currentRenderList;

        var services = getActiveServices();
        var sorts = getEnabledSorts();
        var combos = [];

        for (var i = 0; i < services.length; i++) {
            for (var j = 0; j < sorts.length; j++) {
                combos.push({
                    service: services[i].service,
                    isRussian: services[i].isRussian,
                    sort: sorts[j]
                });
            }
        }

        currentRenderList = shuffle(combos);
        renderTimestamp = now;
        return currentRenderList;
    }

    var titleRegistry = {};

    function registerTitle(titleText, networkId, serviceName) {
        titleRegistry[titleText] = { networkId: networkId, serviceName: serviceName };
    }

    function createIconWrap(networkId, serviceName) {
        var url = logoCache[networkId];

        var wrap = $('<span>').css({
            display: 'inline-flex', 'align-items': 'center', 'justify-content': 'center',
            width: '1.9em', height: '1.9em',
            'background-color': 'rgba(255,255,255,0.60)',
            'border-radius': '0.35em', 'margin-right': '0.45em', 'flex-shrink': '0'
        });

        if (url) {
            wrap.append($('<img>').attr('src', url).css({
                width: '1.45em', height: '1.45em', 'object-fit': 'contain', display: 'block'
            }));
        } else {
            wrap.append($('<span>').text(serviceName.substring(0, 2).toUpperCase()).css({
                color: '#fff', 'font-size': '0.5em', 'font-weight': '700'
            }));
        }

        return wrap;
    }

    function processAllTitles() {
        $('.items-line__title').each(function () {
            var el = $(this);
            if (el.data('sc-icon')) return;

            var text = el.text().trim();
            var info = titleRegistry[text];
            if (!info) return;

            el.data('sc-icon', true);
            el.css({ display: 'flex', 'align-items': 'center' });
            el.prepend(createIconWrap(info.networkId, info.serviceName));
        });
    }

    var observerStarted = false;

    function startObserver() {
        if (observerStarted) return;
        observerStarted = true;

        setInterval(processAllTitles, 500);
    }

    function makeRow(service, isRussian, sort) {
        var baseParams = '';

        if (sort.id === 'first_air_date.desc') {
            var e = new Date(); e.setDate(e.getDate() - 10);
            var s = new Date(); s.setFullYear(s.getFullYear() - 3);
            baseParams += '&first_air_date.gte=' + s.toISOString().split('T')[0];
            baseParams += '&first_air_date.lte=' + e.toISOString().split('T')[0];
        }
        if (!isRussian) baseParams += '&vote_count.gte=10';
        baseParams += '&without_keywords=' + encodeURIComponent(BASE_KW);

        var discoverPath = 'discover/tv?with_networks=' + service.id + baseParams;

        return function (callback) {
            var tmdbUrl = Lampa.TMDB.api(discoverPath + '&sort_by=' + sort.id + '&api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'ru'));
            var net = new Lampa.Reguest();

            net.silent(tmdbUrl, function (json) {
                if (!json || !Array.isArray(json.results)) return callback({ results: [] });
                json.results.forEach(function (item) { if (!item.source) item.source = 'tmdb'; });
                var t = Lampa.Lang.translate(sort.title) + ' — ' + service.title;
                json.title = t;
                json.url = discoverPath + '&sort_by=' + sort.id;
                json.source = 'tmdb';
                json.nomore = false;
                registerTitle(t, service.id, service.title);
                callback(json);
            }, function () { callback({ results: [] }); });
        };
    }

    var MAX_ROWS = 16;

    function registerContentRows() {
        for (var i = 0; i < MAX_ROWS; i++) {
            (function (idx) {
                Lampa.ContentRows.add({
                    index: 3 + idx * 2,
                    name: 'sc_row_' + idx,
                    title: '',
                    screen: ['main'],
                    call: function () {
                        var list = getCurrentRenderList();
                        if (idx >= list.length) return function (cb) { cb({ results: [] }); };
                        var c = list[idx];
                        return makeRow(c.service, c.isRussian, c.sort);
                    }
                });
            })(i);
        }
    }

    function addLang() {
        Lampa.Lang.add({
            sc_plugin_title: { ru: 'Подборки', en: 'Collections', uk: 'Підбірки' },
            sc_sort_votes: { ru: 'Много голосов', en: 'Most Votes', uk: 'Багато голосів' },
            sc_sort_rating: { ru: 'Высокий рейтинг', en: 'Top Rated', uk: 'Високий рейтинг' },
            sc_sort_new: { ru: 'Новинки', en: 'New', uk: 'Новинки' },
            sc_sort_popular: { ru: 'Популярные', en: 'Popular', uk: 'Популярні' },
            sc_sort_title: { ru: 'Виды сортировки подборок', en: 'Sorting types', uk: 'Типи сортування' },
            sc_sort_description: { ru: 'Выбор сортировки подборок', en: 'Choose sorting', uk: 'Вибір сортування' },
            sc_streaming_title: { ru: 'Стриминги', en: 'Streaming', uk: 'Стрімінги' },
            sc_streaming_description: { ru: 'Выберите регион', en: 'Choose region', uk: 'Виберіть регіон' },
            sc_global: { ru: 'Глобальные стриминги', en: 'Global streaming', uk: 'Глобальні стрімінги' },
            sc_global_description: { ru: 'Выбор глобальных сервисов', en: 'Choose global services', uk: 'Вибір глобальних сервісів' },
            sc_russian: { ru: 'Российские стриминги', en: 'Russian streaming', uk: 'Російські стрімінги' },
            sc_russian_description: { ru: 'Выбор российских сервисов', en: 'Choose Russian services', uk: 'Вибір російських сервісів' },
            sc_settings_section: { ru: 'Настройки подборок', en: 'Collection settings', uk: 'Налаштування підбірок' },
            sc_filters: { ru: 'Фильтры', en: 'Filters', uk: 'Фільтри' }
        });
    }

    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'streaming_collections',
            name: Lampa.Lang.translate('sc_plugin_title'),
            icon: '<svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6C3 4.89543 3.89543 4 5 4H9.38197C9.76074 4 10.107 4.214 10.2764 4.55279L10.7236 5.44721C10.893 5.786 11.2393 6 11.618 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6Z" stroke="white" stroke-width="1.8"/><path d="M1 8C1 6.89543 1.89543 6 3 6H7.38197C7.76074 6 8.107 6.214 8.2764 6.55279L8.7236 7.44721C8.893 7.786 9.23926 8 9.61803 8H17C18.1046 8 19 8.89543 19 10V20C19 21.1046 18.1046 22 17 22H3C1.89543 22 1 21.1046 1 20V8Z" fill="white" fill-opacity="0.3" stroke="white" stroke-width="1.5"/></svg>'
        });

        Lampa.SettingsApi.addParam({ component: 'streaming_collections', param: { name: '', type: 'title' }, field: { name: Lampa.Lang.translate('sc_filters') } });

        Lampa.SettingsApi.addParam({
            component: 'streaming_collections', param: { name: 'sc_sort', type: 'button' },
            field: { name: Lampa.Lang.translate('sc_sort_title'), description: Lampa.Lang.translate('sc_sort_description') },
            onChange: function () {
                var p = Lampa.Controller.enabled().name;
                Lampa.Select.show({
                    title: Lampa.Lang.translate('sc_sort_title'),
                    items: allSortOptions.map(function (s) { return { title: Lampa.Lang.translate(s.title), id: s.id, checkbox: true, checked: getSetting('sort_' + s.id, true) }; }),
                    onBack: function () { Lampa.Controller.toggle(p); },
                    onCheck: function (i) { setSetting('sort_' + i.id, !getSetting('sort_' + i.id, true)); i.checked = getSetting('sort_' + i.id, true); }
                });
            }
        });

        Lampa.SettingsApi.addParam({ component: 'streaming_collections', param: { name: '', type: 'title' }, field: { name: Lampa.Lang.translate('sc_settings_section') } });

        Lampa.SettingsApi.addParam({
            component: 'streaming_collections', param: { name: 'sc_region', type: 'button' },
            field: { name: Lampa.Lang.translate('sc_streaming_title'), description: Lampa.Lang.translate('sc_streaming_description') },
            onChange: function () {
                var p = Lampa.Controller.enabled().name;
                Lampa.Select.show({
                    title: Lampa.Lang.translate('sc_streaming_title'),
                    items: [
                        { title: Lampa.Lang.translate('sc_global'), id: 'include_global', checkbox: true, checked: getSetting('include_global', true) },
                        { title: Lampa.Lang.translate('sc_russian'), id: 'include_russian', checkbox: true, checked: getSetting('include_russian', true) }
                    ],
                    onBack: function () { Lampa.Controller.toggle(p); },
                    onCheck: function (i) { setSetting(i.id, !getSetting(i.id, true)); i.checked = getSetting(i.id, true); }
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'streaming_collections', param: { name: 'sc_gs', type: 'button' },
            field: { name: Lampa.Lang.translate('sc_global'), description: Lampa.Lang.translate('sc_global_description') },
            onChange: function () {
                var p = Lampa.Controller.enabled().name;
                Lampa.Select.show({
                    title: Lampa.Lang.translate('sc_global'),
                    items: globalStreaming.map(function (s) { return { title: s.title, id: s.id, checkbox: true, checked: getSetting('gs_' + s.id, true) }; }),
                    onBack: function () { Lampa.Controller.toggle(p); },
                    onCheck: function (i) { setSetting('gs_' + i.id, !getSetting('gs_' + i.id, true)); i.checked = getSetting('gs_' + i.id, true); }
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'streaming_collections', param: { name: 'sc_rs', type: 'button' },
            field: { name: Lampa.Lang.translate('sc_russian'), description: Lampa.Lang.translate('sc_russian_description') },
            onChange: function () {
                var p = Lampa.Controller.enabled().name;
                Lampa.Select.show({
                    title: Lampa.Lang.translate('sc_russian'),
                    items: russianStreaming.map(function (s) { return { title: s.title, id: s.id, checkbox: true, checked: getSetting('rs_' + s.id, true) }; }),
                    onBack: function () { Lampa.Controller.toggle(p); },
                    onCheck: function (i) { setSetting('rs_' + i.id, !getSetting('rs_' + i.id, true)); i.checked = getSetting('rs_' + i.id, true); }
                });
            }
        });
    }

    function start() { addLang(); preloadLogos(); startObserver(); registerContentRows(); addSettings(); }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });
})();
