(function () {
    'use strict';

    var PLUGIN_ID = 'waiting_continuation';
    var STORAGE_KEY = 'waiting_continuation_list';
    var FILTER_KEY = 'waiting_continuation_filter';
    var LAST_CHECK_KEY = 'waiting_continuation_last_check';
    var MENU_TITLE = 'Ожидаю продолжение';
    var ADDED_TEXT = 'Сериал добавлен в Ожидаю продолжение';
    var REMOVED_TEXT = 'Сериал удалён из Ожидаю продолжение';

    function getList() {
        try {
            var raw = Lampa.Storage.get(STORAGE_KEY, '[]');
            if (typeof raw === 'string') return JSON.parse(raw);
            if (Array.isArray(raw)) return raw;
            return [];
        } catch (e) { return []; }
    }
    function saveList(list) { Lampa.Storage.set(STORAGE_KEY, JSON.stringify(list)); }

    function inList(id) {
        var list = getList();
        for (var i = 0; i < list.length; i++) if (String(list[i].id) === String(id)) return true;
        return false;
    }

    function addItem(card) {
        var list = getList();
        if (inList(card.id)) return false;
        list.unshift({
            id: card.id,
            name: card.name || card.title,
            original_name: card.original_name || card.original_title || '',
            poster_path: card.poster_path || '',
            backdrop_path: card.backdrop_path || '',
            vote_average: card.vote_average || 0,
            number_of_seasons: card.number_of_seasons || 0,
            number_of_episodes: card.number_of_episodes || 0,
            next_episode_to_air: card.next_episode_to_air || null,
            last_episode_to_air: card.last_episode_to_air || null,
            in_production: card.in_production || false,
            status: card.status || '',
            quality: detectQuality(card),
            added_at: Date.now(),
            card_type: 'tv'
        });
        saveList(list);
        return true;
    }

    function removeItem(id) {
        saveList(getList().filter(function (i) { return String(i.id) !== String(id); }));
    }

    function detectQuality(card) {
        if (!card) return '';
        if (card.quality) return card.quality;
        var v = card.vote_average || 0;
        if (card.adult === false && v >= 8) return '4K';
        return '';
    }

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function formatDate(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        return pad(d.getDate()) + '.' + pad(d.getMonth() + 1);
    }

    function isAiring(item) {
        if (item.in_production) return true;
        if (item.next_episode_to_air && item.next_episode_to_air.air_date) return true;
        var s = (item.status || '').toLowerCase();
        return s === 'returning series' || s === 'in production' || s === 'pilot';
    }

    function applyFilter(list, filter) {
        if (filter === 'airing') return list.filter(isAiring);
        if (filter === 'ended') return list.filter(function (i) { return !isAiring(i); });
        return list;
    }

    function buildCard(item) {
        var html = $(
            '<div class="card selector card--tv">' +
            '  <div class="card__view">' +
            '    <img src="./img/img_load.svg" class="card__img" />' +
            '    <div class="card__type">Сериал</div>' +
            '    <div class="card__play"><img src="./img/icons/player/play.svg" /></div>' +
            '    <div class="card__quality"></div>' +
            '    <div class="card__age"></div>' +
            '    <div class="card__icons"><div class="card__icons-inner"></div></div>' +
            '  </div>' +
            '  <div class="card__title"></div>' +
            '</div>'
        );

        var poster = item.backdrop_path
            ? Lampa.TMDB.image('t/p/w500' + item.backdrop_path)
            : (item.poster_path ? Lampa.TMDB.image('t/p/w500' + item.poster_path) : '');

        var img = html.find('.card__img')[0];
        if (poster) {
            img.onload = function () { html.find('.card__view').addClass('card__view--loaded'); };
            img.onerror = function () { img.src = './img/img_broken.svg'; };
            img.src = poster;
        }

        html.find('.card__title').text(item.name || item.original_name || 'Без названия');

        if (item.number_of_episodes) {
            html.find('.card__quality').html(
                '<div style="text-align:center;line-height:1.1;">' +
                '<div style="font-weight:bold;">' + item.number_of_episodes + '</div>' +
                '<div style="font-size:0.7em;">СЕРИЙ</div></div>'
            );
        }

        if (item.next_episode_to_air && item.next_episode_to_air.air_date) {
            var ep = item.next_episode_to_air;
            html.find('.card__age').html(
                '<div style="text-align:center;line-height:1.1;">' +
                '<div style="font-weight:bold;">' + formatDate(ep.air_date) + '</div>' +
                '<div style="font-size:0.7em;">S' + (ep.season_number || '?') + 'E' + (ep.episode_number || '?') + '</div></div>'
            ).css({ 'background': '#3478f6', 'color': '#fff' });
        } else if (item.last_episode_to_air && item.last_episode_to_air.air_date) {
            var le = item.last_episode_to_air;
            html.find('.card__age').html(
                '<div style="text-align:center;line-height:1.1;">' +
                '<div style="font-weight:bold;">' + formatDate(le.air_date) + '</div>' +
                '<div style="font-size:0.7em;">S' + (le.season_number || '?') + 'E' + (le.episode_number || '?') + '</div></div>'
            ).css({ 'background': '#28a745', 'color': '#fff' });
        }

        if (item.quality) {
            html.find('.card__icons-inner').append(
                '<div style="display:inline-block;background:#3a3a3a;color:#fff;padding:0.2em 0.5em;border-radius:0.4em;font-size:0.8em;font-weight:bold;margin:0.3em;">' +
                item.quality + '</div>'
            );
        }

        html.on('hover:enter', function () {
            Lampa.Activity.push({
                url: 'tv/' + item.id,
                component: 'full',
                id: item.id,
                method: 'tv',
                card: {
                    id: item.id,
                    name: item.name,
                    original_name: item.original_name,
                    poster_path: item.poster_path,
                    backdrop_path: item.backdrop_path,
                    vote_average: item.vote_average,
                    number_of_seasons: item.number_of_seasons
                }
            });
        });

        html.on('hover:long', function () {
            Lampa.Select.show({
                title: 'Действия',
                items: [
                    { title: 'Удалить из «Ожидаю продолжение»', action: 'remove' },
                    { title: 'Обновить информацию', action: 'refresh' }
                ],
                onSelect: function (a) {
                    if (a.action === 'remove') {
                        removeItem(item.id);
                        Lampa.Noty.show(REMOVED_TEXT);
                        Lampa.Activity.replace({ component: PLUGIN_ID });
                    } else if (a.action === 'refresh') {
                        refreshItem(item.id, function () {
                            Lampa.Activity.replace({ component: PLUGIN_ID });
                        });
                    }
                },
                onBack: function () { Lampa.Controller.toggle('content'); }
            });
        });

        return html;
    }

    function refreshItem(id, done) {
        var url = 'tv/' + id + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'ru');
        var net = new Lampa.Reguest();
        net.timeout(15000);
        net.silent(Lampa.TMDB.api(url), function (json) {
            var list = getList();
            for (var i = 0; i < list.length; i++) {
                if (String(list[i].id) === String(id)) {
                    var prevNext = list[i].next_episode_to_air;
                    list[i].number_of_episodes = json.number_of_episodes || list[i].number_of_episodes;
                    list[i].number_of_seasons = json.number_of_seasons || list[i].number_of_seasons;
                    list[i].next_episode_to_air = json.next_episode_to_air || null;
                    list[i].last_episode_to_air = json.last_episode_to_air || list[i].last_episode_to_air;
                    list[i].in_production = !!json.in_production;
                    list[i].status = json.status || list[i].status;

                    var newNext = json.next_episode_to_air;
                    var changed = false;
                    if (newNext && (!prevNext ||
                        prevNext.season_number !== newNext.season_number ||
                        prevNext.episode_number !== newNext.episode_number ||
                        prevNext.air_date !== newNext.air_date)) changed = true;

                    if (done) done(changed, list[i]);
                    saveList(list);
                    return;
                }
            }
            saveList(list);
            if (done) done(false);
        }, function () { if (done) done(false); });
    }

    function checkAllForUpdates(silent) {
        var list = getList();
        if (!list.length) { if (!silent) Lampa.Noty.show('Список пуст'); return; }
        var i = 0, updated = 0;
        function next() {
            if (i >= list.length) {
                Lampa.Storage.set(LAST_CHECK_KEY, Date.now());
                if (!silent) Lampa.Noty.show('Проверка завершена. Обновлений: ' + updated);
                return;
            }
            var item = list[i++];
            refreshItem(item.id, function (changed, fresh) {
                if (changed && fresh && fresh.next_episode_to_air) {
                    updated++;
                    var ep = fresh.next_episode_to_air;
                    Lampa.Noty.show((fresh.name || 'Сериал') + ': новая серия S' + ep.season_number + 'E' + ep.episode_number + ' — ' + formatDate(ep.air_date));
                }
                setTimeout(next, 300);
            });
        }
        next();
    }

    function maybeAutoCheck() {
        var last = parseInt(Lampa.Storage.get(LAST_CHECK_KEY, '0'), 10) || 0;
        var sixHours = 6 * 60 * 60 * 1000;
        if (Date.now() - last > sixHours) {
            setTimeout(function () { checkAllForUpdates(true); }, 5000);
        }
    }

    function Component(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var filterBar;
        var body;
        var html = $('<div class="category-full"></div>');
        var empty;
        var that = this;
        var currentFilter = Lampa.Storage.get(FILTER_KEY, 'all');

        this.create = function () {
            scroll.body().addClass('layer--wheight').data('mheight', html);
            scroll.minus();
            this.buildFilter();
            body = $('<div class="category-full__list category-full--margin"></div>');
            html.append(body);
            scroll.append(html);
            this.build();
            return this.render();
        };

        this.buildFilter = function () {
            filterBar = $(
                '<div class="torrent-filter" style="margin: 0 0 1.5em 0;display:flex;gap:0.5em;flex-wrap:wrap;">' +
                '  <div class="simple-button selector" data-filter="all">Все</div>' +
                '  <div class="simple-button selector" data-filter="airing">Выходящие</div>' +
                '  <div class="simple-button selector" data-filter="ended">Завершённые</div>' +
                '  <div class="simple-button selector" data-filter="check">Проверить обновления</div>' +
                '</div>'
            );
            filterBar.find('[data-filter="' + currentFilter + '"]').addClass('simple-button--active');
            filterBar.find('.simple-button').on('hover:enter', function () {
                var f = $(this).data('filter');
                if (f === 'check') { checkAllForUpdates(false); return; }
                currentFilter = f;
                Lampa.Storage.set(FILTER_KEY, f);
                Lampa.Activity.replace({ component: PLUGIN_ID });
            });
            html.append(filterBar);
        };

        this.build = function () {
            var list = applyFilter(getList(), currentFilter);
            if (!list.length) {
                empty = new Lampa.Empty({ descr: 'В этой категории пока пусто. Откройте сериал и нажмите «Ожидаю продолжение».' });
                body.append(empty.render());
                return;
            }
            list.forEach(function (it) { body.append(buildCard(it)); });
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () { Navigator.move('right'); },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () { Navigator.move('down'); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return scroll.render(); };
        this.destroy = function () {
            network.clear();
            scroll.destroy();
            if (empty) empty.destroy();
            html.remove();
        };
    }

    function addToFullCardMenu() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            var data = e.data;
            if (!data || !data.movie) return;
            var movie = data.movie;
            var isTv = !!(movie.name || movie.first_air_date || movie.number_of_seasons);
            if (!isTv) return;

            var btn = $(
                '<div class="full-start__button selector view--torrent">' +
                '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
                '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>' +
                '</svg>' +
                '<span style="margin-left:0.6em">Ожидаю продолжение</span>' +
                '</div>'
            );

            if (inList(movie.id)) btn.find('span').text('В «Ожидаю продолжение»');

            btn.on('hover:enter', function () {
                if (inList(movie.id)) {
                    removeItem(movie.id);
                    btn.find('span').text('Ожидаю продолжение');
                    Lampa.Noty.show(REMOVED_TEXT);
                } else {
                    addItem(movie);
                    btn.find('span').text('В «Ожидаю продолжение»');
                    Lampa.Noty.show(ADDED_TEXT);
                    refreshItem(movie.id);
                }
            });

            var buttons = data.object.activity.render().find('.full-start-new__buttons, .full-start__buttons');
            if (buttons.length) buttons.append(btn);
        });
    }

    function addMenuButton() {
        var item = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_ID + '">' +
            '<div class="menu__ico">' +
            '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>' +
            '</svg></div>' +
            '<div class="menu__text">' + MENU_TITLE + '</div>' +
            '</li>'
        );

        item.on('hover:enter', function () {
            Lampa.Activity.push({ url: '', title: MENU_TITLE, component: PLUGIN_ID, page: 1 });
        });

        function attach() {
            var menu = $('.menu .menu__list').eq(0);
            if (menu.length && !menu.find('[data-action="' + PLUGIN_ID + '"]').length) {
                var anchor = menu.find('[data-action="bookmarks"]');
                if (anchor.length) anchor.after(item); else menu.append(item);
            }
        }

        if (window.appready) attach();
        else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') attach(); });
    }

    function startPlugin() {
        if (window.waiting_continuation_plugin) return;
        window.waiting_continuation_plugin = true;

        Lampa.Component.add(PLUGIN_ID, Component);
        addMenuButton();
        addToFullCardMenu();
        maybeAutoCheck();

        Lampa.Manifest.plugins = {
            type: 'video',
            version: '1.1.0',
            name: MENU_TITLE,
            description: 'Список сериалов, у которых вы ждёте новые серии'
        };
    }

    if (window.Lampa && window.Lampa.Listener) startPlugin();
    else {
        var iv = setInterval(function () {
            if (window.Lampa && window.Lampa.Listener) {
                clearInterval(iv);
                startPlugin();
            }
        }, 200);
    }
})();
