(function () {
    'use strict';

    if (window.serial_status_plugin) return;
    window.serial_status_plugin = true;

    var PLUGIN_NAME      = 'serial_status';
    var STORAGE_CACHE    = 'serial_status_cache';
    var STORAGE_SET      = 'serial_status_settings';
    var STORAGE_OVERRIDE = 'serial_status_overrides';

    var DEFAULT_SETTINGS = {
        show_badge: true,
        color_full: true,
        cache_days: 7,
        filter_mode: 'all',
        sort_mode: 'none'
    };

    var STATUS_COLORS = {
        'Returning Series': '#4CAF50',
        'In Production':    '#2196F3',
        'Planned':          '#03A9F4',
        'Pilot':            '#FF9800',
        'Ended':            '#9E9E9E',
        'Canceled':         '#F44336',
        'Rumored':          '#607D8B'
    };

    var STATUS_UA = {
        'Returning Series': 'В эфире',
        'In Production':    'В производстве',
        'Planned':          'Запланировано',
        'Pilot':            'Пилот',
        'Ended':            'Завершен',
        'Canceled':         'Отменен',
        'Rumored':          'Слухи'
    };

    var STATUS_LIST = [
        { id: 'Returning Series', title: 'В эфире' },
        { id: 'In Production',    title: 'В производстве' },
        { id: 'Planned',          title: 'Запланировано' },
        { id: 'Pilot',            title: 'Пилот' },
        { id: 'Ended',            title: 'Завершен' },
        { id: 'Canceled',         title: 'Отменен' },
        { id: 'Rumored',          title: 'Слухи' },
        { id: '',                 title: 'Сбросить (TMDB)' }
    ];

    var sortTimer = null;

    function getSettings() {
        var s = Lampa.Storage.get(STORAGE_SET, {});
        return Object.assign({}, DEFAULT_SETTINGS, s);
    }

    function setSetting(key, value) {
        var s = getSettings();
        s[key] = value;
        Lampa.Storage.set(STORAGE_SET, s);
    }

    function getCache() {
        return Lampa.Storage.get(STORAGE_CACHE, {});
    }

    function setCache(cache) {
        Lampa.Storage.set(STORAGE_CACHE, cache);
    }

    function isCacheFresh(item, days) {
        if (!item || !item.ts) return false;
        return (Date.now() - item.ts) < days * 24 * 60 * 60 * 1000;
    }

    function clearCache() {
        Lampa.Storage.set(STORAGE_CACHE, {});
        Lampa.Noty.show('Кэш статусов очищен');
    }

    function getOverrides() {
        return Lampa.Storage.get(STORAGE_OVERRIDE, {});
    }

    function setOverride(id, status) {
        var o = getOverrides();
        if (!status) delete o[id];
        else o[id] = status;
        Lampa.Storage.set(STORAGE_OVERRIDE, o);
    }

    function getOverride(id) {
        return getOverrides()[id] || null;
    }

    function injectCSS() {
        if (document.getElementById('serial-status-css')) return;

        var css = `
            .card__status-badge {
                position: absolute !important;
                bottom: 6px !important;
                left: 6px !important;
                top: auto !important;
                right: auto !important;
                z-index: 20 !important;
                padding: 2px 7px !important;
                border-radius: 4px !important;
                font-size: 0.68em !important;
                font-weight: 600 !important;
                color: #fff !important;
                text-shadow: 0 1px 2px rgba(0,0,0,.45) !important;
                pointer-events: none !important;
                line-height: 1.3 !important;
                max-width: 85% !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }
            .card__status-badge.override {
                box-shadow: 0 0 0 1.5px #fff !important;
            }
            .full-start__status-colored {
                display: inline-block !important;
                padding: 3px 10px !important;
                border-radius: 6px !important;
                color: #fff !important;
                font-weight: 600 !important;
            }
            .card.hide-by-status {
                display: none !important;
            }
        `;
        var style = document.createElement('style');
        style.id = 'serial-status-css';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function isTv(data, cardEl) {
        if (!data) return false;
        if (data.method === 'tv' || data.type === 'tv' || data.type === 'serial') return true;
        if (data.first_air_date || data.number_of_seasons || data.number_of_episodes) return true;
        if (data.name && !data.title) return true;
        if (cardEl) {
            var typeEl = cardEl.querySelector ? cardEl.querySelector('.card__type') : null;
            if (typeEl && /tv/i.test(typeEl.textContent || '')) return true;
        }
        return false;
    }

    function getYear(data) {
        if (!data) return 0;
        if (data.release_year) return parseInt(data.release_year, 10) || 0;
        if (data.year) return parseInt(data.year, 10) || 0;
        var d = data.first_air_date || data.release_date || '';
        if (d && d.length >= 4) return parseInt(d.slice(0, 4), 10) || 0;
        return 0;
    }

    function getRating(data) {
        if (!data) return 0;
        var v = data.vote_average || data.vote || data.rating || 0;
        return parseFloat(v) || 0;
    }

    function fetchStatus(id, force, callback) {
        var override = getOverride(id);
        if (override) {
            callback(override, true);
            return;
        }

        var settings = getSettings();
        var cache = getCache();

        if (!force && cache[id] && isCacheFresh(cache[id], settings.cache_days)) {
            callback(cache[id].status, false);
            return;
        }

        if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) {
            callback(null, false);
            return;
        }

        Lampa.Api.sources.tmdb.get('tv/' + id, {}, function (data) {
            if (data && data.status) {
                cache[id] = { status: data.status, ts: Date.now() };
                setCache(cache);
                callback(data.status, false);
            } else {
                callback(null, false);
            }
        }, function () {
            if (cache[id]) callback(cache[id].status, false);
            else callback(null, false);
        });
    }

    function shouldHideByFilter(status) {
        if (!status) return false;
        var mode = getSettings().filter_mode;
        if (mode === 'all') return false;
        if (mode === 'airing') {
            return !(status === 'Returning Series' || status === 'In Production' || status === 'Pilot');
        }
        if (mode === 'ended') return status !== 'Ended';
        if (mode === 'hide_canceled') return status === 'Canceled';
        return false;
    }

    function addBadgeToCard(cardElement, status, isOverride) {
        if (!status || !cardElement) return;

        var settings = getSettings();
        var $card = $(cardElement);

        if (shouldHideByFilter(status)) {
            $card.addClass('hide-by-status');
            return;
        } else {
            $card.removeClass('hide-by-status');
        }

        if (!settings.show_badge) {
            $card.find('.card__status-badge').remove();
            return;
        }

        $card.find('.card__status-badge').remove();

        var color = STATUS_COLORS[status] || '#757575';
        var text  = STATUS_UA[status] || status;

        var $badge = $('<div class="card__status-badge"></div>')
            .text(text)
            .css('background-color', color);

        if (isOverride) $badge.addClass('override');

        var $view = $card.find('.card__view');
        if ($view.length) $view.append($badge);
        else $card.append($badge);
    }

    function processCard(cardElement, data) {
        if (!data || !data.id) return;
        if (!isTv(data, cardElement)) return;

        try {
            var el = cardElement.nodeType ? cardElement : (cardElement[0] || cardElement);
            if (el && el.setAttribute) {
                el.setAttribute('data-ss-year', String(getYear(data)));
                el.setAttribute('data-ss-rating', String(getRating(data)));
                el.setAttribute('data-ss-tv', '1');
            }
        } catch (e) {}

        fetchStatus(data.id, false, function (status, isOverride) {
            if (status) addBadgeToCard(cardElement, status, isOverride);
        });

        scheduleSort();
    }

    function scheduleSort() {
        if (sortTimer) clearTimeout(sortTimer);
        sortTimer = setTimeout(applySortToVisibleLists, 600);
    }

    function applySortToVisibleLists() {
        var mode = getSettings().sort_mode;
        if (!mode || mode === 'none') return;

        var $rows = $('.items-line__body, .scroll__body, .category-line__body, .layer--render .items');
        if (!$rows.length) $rows = $('.card').parent();

        $rows.each(function () {
            var $parent = $(this);
            var $cards = $parent.children('.card[data-ss-tv="1"]');
            if ($cards.length < 2) return;

            var arr = $cards.get();
            arr.sort(function (a, b) {
                var ya = parseInt(a.getAttribute('data-ss-year') || '0', 10);
                var yb = parseInt(b.getAttribute('data-ss-year') || '0', 10);
                var ra = parseFloat(a.getAttribute('data-ss-rating') || '0');
                var rb = parseFloat(b.getAttribute('data-ss-rating') || '0');

                if (mode === 'year_desc') return yb - ya;
                if (mode === 'year_asc')  return ya - yb;
                if (mode === 'rating_desc') return rb - ra;
                if (mode === 'rating_asc')  return ra - rb;
                return 0;
            });

            arr.forEach(function (el) {
                $parent.append(el);
            });
        });
    }

    function restoreFocus() {
        try {
            var active = Lampa.Activity.active();
            if (active && active.activity && typeof active.activity.toggle === 'function') {
                active.activity.toggle();
            } else {
                Lampa.Controller.toggle('content');
            }
        } catch (e) {
            try { Lampa.Controller.toggle('content'); } catch (e2) {}
        }
    }

    function openStatusSelect(id, currentStatus, onDone) {
        var items = STATUS_LIST.map(function (s) {
            return {
                title: s.title + (s.id === currentStatus ? '  ✓' : ''),
                status: s.id,
                selected: s.id === currentStatus
            };
        });

        items.unshift({
            title: '⟳ Обновить из TMDB',
            status: '__refresh__',
            selected: false
        });

        Lampa.Select.show({
            title: 'Статус сериала',
            items: items,
            onSelect: function (item) {
                if (item.status === '__refresh__') {
                    var had = getOverride(id);
                    if (had) setOverride(id, null);
                    fetchStatus(id, true, function (newStatus) {
                        if (newStatus) {
                            Lampa.Noty.show('Статус: ' + (STATUS_UA[newStatus] || newStatus));
                            if (onDone) onDone();
                        } else {
                            Lampa.Noty.show('Не удалось обновить');
                            if (had) setOverride(id, had);
                        }
                        restoreFocus();
                    });
                } else {
                    setOverride(id, item.status || null);
                    Lampa.Noty.show(item.status ? ('Статус: ' + (STATUS_UA[item.status] || item.status)) : 'Сброшено на TMDB');
                    if (onDone) onDone();
                    restoreFocus();
                }
            },
            onBack: function () {
                restoreFocus();
            }
        });
    }

    function colorFullStatus() {
        var settings = getSettings();
        if (!settings.color_full) return;

        var active = Lampa.Activity.active();
        if (!active) return;

        var card = active.card || (active.activity && active.activity.card);
        if (!card || !card.id) return;
        if (!isTv(card)) return;

        var $render = active.activity && active.activity.render ? active.activity.render() : $(document);
        var $status = $('.full-start__status', $render);
        if (!$status.length) return;

        $status.find('.serial-status-actions').remove();

        fetchStatus(card.id, false, function (status, isOverride) {
            if (!status) return;

            var color = STATUS_COLORS[status];
            var text  = STATUS_UA[status] || status;

            if (color) {
                $status
                    .addClass('full-start__status-colored')
                    .css('background-color', color)
                    .text(text + (isOverride ? ' ★' : ''));
            }
        });
    }

    function refreshButtonsNavigation($buttons) {
        if (!$buttons || !$buttons.length) return;
        try {
            Lampa.Controller.collectionSet($buttons);
        } catch (e) {}
        try {
            var active = Lampa.Activity.active();
            if (active && active.activity && typeof active.activity.toggle === 'function') {
                active.activity.toggle();
            }
        } catch (e) {}
    }

    function addStatusButton() {
        var active = Lampa.Activity.active();
        if (!active) return;

        var card = active.card || (active.activity && active.activity.card);
        if (!card || !card.id) return;
        if (!isTv(card)) return;

        var $render = active.activity && active.activity.render ? active.activity.render() : $(document);

        if ($render.find('.full-start__button.serial-status-btn').length) return;

        var $buttons = $render.find('.full-start__buttons, .full-start-new__buttons').first();
        if (!$buttons.length) {
            var $any = $render.find('.full-start__button').first();
            if ($any.length) $buttons = $any.parent();
        }
        if (!$buttons.length) return;

        var $btn = $(
            '<div class="full-start__button selector view--status serial-status-btn" tabindex="0">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' +
                '<span>Статус</span>' +
            '</div>'
        );

        $btn.on('hover:enter', function () {
            fetchStatus(card.id, false, function (status) {
                openStatusSelect(card.id, status || '', function () {
                    colorFullStatus();
                });
            });
        });

        $buttons.append($btn);

        setTimeout(function () {
            refreshButtonsNavigation($buttons);
        }, 150);
    }

    function onFullReady() {
        setTimeout(function () {
            colorFullStatus();
            addStatusButton();
        }, 450);
    }

    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: PLUGIN_NAME,
            name: 'Статус сериала',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_NAME,
            param: { name: 'show_badge', type: 'trigger', default: true },
            field: {
                name: 'Бейджи на карточках',
                description: 'Показывать цветной статус на карточках сериалов'
            },
            onChange: function (value) { setSetting('show_badge', value); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_NAME,
            param: { name: 'color_full', type: 'trigger', default: true },
            field: {
                name: 'Цвет на странице сериала',
                description: 'Красить статус на полной карточке'
            },
            onChange: function (value) { setSetting('color_full', value); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_NAME,
            param: {
                name: 'cache_days',
                type: 'select',
                values: { '1': '1 день', '3': '3 дня', '7': '7 дней', '14': '14 дней' },
                default: '7'
            },
            field: {
                name: 'Обновлять статус каждые',
                description: 'Как часто запрашивать актуальный статус из TMDB'
            },
            onChange: function (value) { setSetting('cache_days', parseInt(value, 10)); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_NAME,
            param: {
                name: 'filter_mode',
                type: 'select',
                values: {
                    'all': 'Показывать все',
                    'airing': 'Только в эфире / в производстве',
                    'ended': 'Только завершенные',
                    'hide_canceled': 'Скрыть отмененные'
                },
                default: 'all'
            },
            field: {
                name: 'Фильтр сериалов',
                description: 'Скрывает карточки по статусу в списках'
            },
            onChange: function (value) {
                setSetting('filter_mode', value);
                Lampa.Noty.show('Фильтр изменен. Обновите список');
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_NAME,
            param: {
                name: 'sort_mode',
                type: 'select',
                values: {
                    'none': 'Без сортировки',
                    'year_desc': 'По году (новые → старые)',
                    'year_asc': 'По году (старые → новые)',
                    'rating_desc': 'По рейтингу (высокий → низкий)',
                    'rating_asc': 'По рейтингу (низкий → высокий)'
                },
                default: 'none'
            },
            field: {
                name: 'Сортировка сериалов',
                description: 'Порядок карточек сериалов в списках'
            },
            onChange: function (value) {
                setSetting('sort_mode', value);
                Lampa.Noty.show('Сортировка изменена. Обновите список');
                scheduleSort();
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_NAME,
            param: { name: 'clear_cache', type: 'button' },
            field: {
                name: 'Очистить кэш статусов',
                description: 'Удалить закешированные статусы из TMDB'
            },
            onChange: function () { clearCache(); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_NAME,
            param: { name: 'clear_overrides', type: 'button' },
            field: {
                name: 'Сбросить все ручные статусы',
                description: 'Удалить все ваши переопределения'
            },
            onChange: function () {
                Lampa.Storage.set(STORAGE_OVERRIDE, {});
                Lampa.Noty.show('Все ручные статусы сброшены');
            }
        });
    }

    function patchCardOnVisible() {
        try {
            if (!Lampa.Maker || !Lampa.Maker.map) return;
            var CardMaker = Lampa.Maker.map('Card');
            if (!CardMaker || !CardMaker.Card || !CardMaker.Card.onVisible) return;

            var original = CardMaker.Card.onVisible;
            CardMaker.Card.onVisible = function () {
                original.apply(this, arguments);
                try {
                    var data = this.data;
                    var card = this.html || this.card;
                    if (data && card) processCard(card, data);
                } catch (e) {}
            };
        } catch (e) {}
    }

    function start() {
        injectCSS();
        addSettings();
        patchCardOnVisible();

        var s = getSettings();
        Lampa.Storage.set('show_badge', s.show_badge);
        Lampa.Storage.set('color_full', s.color_full);
        Lampa.Storage.set('cache_days', String(s.cache_days));
        Lampa.Storage.set('filter_mode', s.filter_mode);
        Lampa.Storage.set('sort_mode', s.sort_mode);

        Lampa.Listener.follow('card', function (e) {
            if (!e) return;
            var data = (e.object && e.object.data) || e.object || e.data;
            var card = e.card || (e.object && (e.object.card || e.object.html));
            if ((e.type === 'visible' || e.type === 'create' || e.type === 'build') && data && card) {
                processCard(card, data);
            }
        });

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') onFullReady();
        });

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' || e.type === 'archive') {
                onFullReady();
                scheduleSort();
            }
        });

        Lampa.Listener.follow('line', function () {
            scheduleSort();
        });

        console.log('[serial-status] loaded');
    }

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();
