(function () {
    'use strict';

    var STORAGE_PARSERS = 'ps_list';
    var STORAGE_ACTIVE  = 'ps_active';

    var DEFAULT_PARSERS = [
        { name: 'jac.red',       url: 'jac.red',          apikey: '', type: 'jackett' },
        { name: 'jr.maxvol.pro', url: 'jr.maxvol.pro',    apikey: '', type: 'jackett' },
        { name: 'jacblack.ru',   url: 'jacblack.ru:9117', apikey: '', type: 'jackett' },
        { name: 'jac-red.ru',    url: 'jac-red.ru',       apikey: '', type: 'jackett' },
        { name: 'jacred.stream', url: 'jacred.stream',    apikey: 'pp', type: 'jackett' },
    ];

    // -----------------------------------------------------------------------
    //  Определяем протокол по текущему адресу страницы
    // -----------------------------------------------------------------------
    function getProto() {
        return window.location.protocol === 'https:' ? 'https://' : 'http://';
    }

    function withProto(url) {
        // Убираем любой существующий протокол и добавляем нужный
        var clean = url.replace(/^https?:\/\//, '');
        return getProto() + clean;
    }

    // -----------------------------------------------------------------------
    //  Storage helpers
    // -----------------------------------------------------------------------
    function getParsers() {
        var s = Lampa.Storage.get(STORAGE_PARSERS, '');
        try { var p = JSON.parse(s); if (Array.isArray(p) && p.length) return p; } catch(e){}
        return JSON.parse(JSON.stringify(DEFAULT_PARSERS));
    }

    function saveParsers(list) {
        Lampa.Storage.set(STORAGE_PARSERS, JSON.stringify(list));
    }

    function getActiveIdx() {
        var v = parseInt(Lampa.Storage.get(STORAGE_ACTIVE, '0'), 10);
        return isNaN(v) ? 0 : v;
    }

    function setActiveIdx(idx) {
        Lampa.Storage.set(STORAGE_ACTIVE, idx);
        applyParser(idx);
    }

    function applyParser(idx) {
        var list = getParsers();
        var p = list[idx];
        if (!p) return;

        var url = withProto(p.url);

        Lampa.Storage.set('jackett_url',         url);
        Lampa.Storage.set('jackett_key',         p.apikey || '');
        Lampa.Storage.set('parser_torrent_type', p.type || 'jackett');
        Lampa.Storage.set('parser_use',          true);
        Lampa.Storage.set('parser',              url);
    }

    function activeName() {
        var list = getParsers();
        var idx  = getActiveIdx();
        return (list[idx] && list[idx].name) ? list[idx].name : '—';
    }

    // -----------------------------------------------------------------------
    //  Перезапуск страницы торрентов
    // -----------------------------------------------------------------------
    function reloadTorrents() {
        var a = Lampa.Activity.active();
        if (!a || a.component !== 'torrents') return;

        Lampa.Activity.replace({
            component:  'torrents',
            url:        a.url,
            title:      a.title,
            search:     a.search,
            search_one: a.search_one,
            search_two: a.search_two,
            movie:      a.movie,
            page:       1,
            params:     a.params
        });
    }

    // -----------------------------------------------------------------------
    //  Кнопка — иконка папки + название парсера в полупрозрачном блоке
    // -----------------------------------------------------------------------
    var ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" '
             + 'style="width:1.4em;height:1.4em;min-width:1.4em;min-height:1.4em;'
             + 'vertical-align:middle;fill:currentColor;flex-shrink:0">'
             + '<use xlink:href="#sprite-folder"></use>'
             + '</svg>';

    function buildButton() {
        var btn = $('<div class="simple-button simple-button--filter selector filter--parser">'
                  +   ICON
                  +   '<div class="ps-name">' + activeName() + '</div>'
                  + '</div>');

        btn.on('hover:enter click', function () {
            openSelectMenu(btn);
        });

        return btn;
    }

    function updateBtnName(btn) {
        btn.find('.ps-name').text(activeName());
    }

    // -----------------------------------------------------------------------
    //  Вставка — между .filter--search и .filter--sort
    // -----------------------------------------------------------------------
    function tryInject(torrentFilter) {
        if (torrentFilter.find('.filter--parser').length) return;

        var btn    = buildButton();
        var search = torrentFilter.find('.filter--search');

        if (search.length) {
            // Вставляем сразу после поиска — перед «Сортировать»
            btn.insertAfter(search);
        } else {
            // Fallback — перед «Сортировать»
            var sort = torrentFilter.find('.filter--sort');
            if (sort.length) btn.insertBefore(sort);
            else torrentFilter.prepend(btn);
        }
    }

    // -----------------------------------------------------------------------
    //  Меню выбора парсера
    // -----------------------------------------------------------------------
    function openSelectMenu(btn) {
        var list    = getParsers();
        var active  = getActiveIdx();
        var enabled = Lampa.Controller.enabled().name;
        var proto   = getProto();

        var items = list.map(function (p, i) {
            var sub = proto + p.url;
            if (p.apikey) sub += '  |  apikey: ' + p.apikey;
            return {
                title:    p.name,
                subtitle: sub,
                selected: i === active,
                myIdx:    i
            };
        });
        items.push({ title: 'Управление парсерами…', manage: true });

        Lampa.Select.show({
            title: 'Выбор парсера',
            items: items,
            onSelect: function (item) {
                if (item.manage) {
                    openManageMenu(btn, enabled);
                } else {
                    setActiveIdx(item.myIdx);
                    updateBtnName(btn);
                    Lampa.Noty.show('Парсер: ' + activeName());
                    Lampa.Controller.toggle(enabled);
                    reloadTorrents();
                }
            },
            onBack: function () { Lampa.Controller.toggle(enabled); }
        });
    }

    // -----------------------------------------------------------------------
    //  Управление парсерами
    // -----------------------------------------------------------------------
    function openManageMenu(btn, enabled) {
        var list  = getParsers();
        var proto = getProto();
        var items = list.map(function (p, i) {
            var sub = proto + p.url;
            if (p.apikey) sub += '  |  apikey: ' + p.apikey;
            return { title: p.name, subtitle: sub, myIdx: i };
        });
        items.push({ title: '+ Добавить парсер', add: true });

        Lampa.Select.show({
            title: 'Управление парсерами',
            items: items,
            onSelect: function (item) {
                if (item.add) {
                    inputDialog('Название', '', function (name) {
                        if (!name) return;
                        inputDialog('URL (без протокола, например: jac.red)', '', function (url) {
                            inputDialog('API-ключ (или оставьте пустым)', '', function (key) {
                                var l = getParsers();
                                // Сохраняем URL без протокола
                                var cleanUrl = (url || '').trim().replace(/^https?:\/\//, '');
                                l.push({ name: name.trim(), url: cleanUrl, apikey: (key || '').trim(), type: 'jackett' });
                                saveParsers(l);
                                Lampa.Noty.show('Добавлен: ' + name.trim());
                                Lampa.Controller.toggle(enabled);
                            });
                        });
                    });
                } else {
                    editMenu(item.myIdx, btn, enabled);
                }
            },
            onBack: function () { Lampa.Controller.toggle(enabled); }
        });
    }

    function editMenu(idx, btn, enabled) {
        var list = getParsers();
        var p    = list[idx];

        Lampa.Select.show({
            title: p.name,
            items: [
                { title: 'Изменить URL',      action: 'url'    },
                { title: 'Изменить API-ключ', action: 'apikey' },
                { title: 'Переименовать',     action: 'rename' },
                { title: 'Удалить',           action: 'delete' }
            ],
            onSelect: function (item) {
                if (item.action === 'delete') {
                    list.splice(idx, 1);
                    saveParsers(list);
                    if (getActiveIdx() >= list.length) setActiveIdx(0);
                    updateBtnName(btn);
                    Lampa.Noty.show('Удалено');
                    Lampa.Controller.toggle(enabled);

                } else if (item.action === 'url') {
                    inputDialog('Новый URL (без протокола)', p.url, function (val) {
                        // Сохраняем без протокола
                        list[idx].url = (val || '').trim().replace(/^https?:\/\//, '');
                        saveParsers(list);
                        if (getActiveIdx() === idx) applyParser(idx);
                        Lampa.Noty.show('URL обновлён');
                        Lampa.Controller.toggle(enabled);
                    });

                } else if (item.action === 'apikey') {
                    inputDialog('API-ключ', p.apikey || '', function (val) {
                        list[idx].apikey = (val || '').trim();
                        saveParsers(list);
                        if (getActiveIdx() === idx) applyParser(idx);
                        Lampa.Noty.show('API-ключ обновлён');
                        Lampa.Controller.toggle(enabled);
                    });

                } else if (item.action === 'rename') {
                    inputDialog('Новое название', p.name, function (val) {
                        if (!val) return;
                        list[idx].name = val.trim();
                        saveParsers(list);
                        updateBtnName(btn);
                        Lampa.Noty.show('Переименовано');
                        Lampa.Controller.toggle(enabled);
                    });
                }
            },
            onBack: function () { Lampa.Controller.toggle(enabled); }
        });
    }

    function inputDialog(title, value, cb) {
        Lampa.Input.show({
            title: title, value: value || '', placeholder: title,
            onComplite: cb,
            onBack: function () { Lampa.Controller.toggle('content'); }
        });
    }

    // -----------------------------------------------------------------------
    //  MutationObserver
    // -----------------------------------------------------------------------
    function startObserver() {
        var observer = new MutationObserver(function () {
            var el = $('.torrent-filter');
            if (el.length) tryInject(el);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // -----------------------------------------------------------------------
    //  Init
    // -----------------------------------------------------------------------
    function init() {
        applyParser(getActiveIdx());
        startObserver();
        var el = $('.torrent-filter');
        if (el.length) tryInject(el);
        console.log('[ParserSelector] loaded, proto:', getProto(), 'active:', activeName());
    }

    if (window.Lampa && Lampa.Storage) {
        init();
    } else {
        document.addEventListener('lampa:ready', init);
    }

})();
