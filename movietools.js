(function () {
    'use strict';

    if (window.movie_tools_plugin) return;
    window.movie_tools_plugin = true;

    var PLUGIN = 'movie_tools';
    var STORAGE_SET = 'movie_tools_settings';
    var STORAGE_PRIORITY = 'movie_tools_priority';
    var STORAGE_CACHE = 'movie_tools_cache';

    var DEFAULTS = {
        show_rating_badge: true,
        show_runtime_badge: true,
        show_priority_badge: true,
        rating_green: 7.5,
        rating_yellow: 6.0,
        min_votes: 50,
        filter_runtime: 'all',
        sort_mode: 'none',
        fav_genres: [],
        highlight_fav_genres: true
    };

    var GENRES = {
        28: 'Боевик', 12: 'Приключения', 16: 'Мультфильм', 35: 'Комедия', 80: 'Криминал',
        99: 'Документальный', 18: 'Драма', 10751: 'Семейный', 14: 'Фэнтези',
        36: 'История', 27: 'Ужасы', 10402: 'Музыка', 9648: 'Детектив',
        10749: 'Мелодрама', 878: 'Фантастика', 10770: 'ТВ-фильм', 53: 'Триллер',
        10752: 'Военный', 37: 'Вестерн'
    };

    var timerSort = null;

    function getSettings() {
        var s = Lampa.Storage.get(STORAGE_SET, {});
        return Object.assign({}, DEFAULTS, s);
    }

    function setSettings(obj) {
        var s = getSettings();
        Object.assign(s, obj);
        Lampa.Storage.set(STORAGE_SET, s);
    }

    function setSetting(key, value) {
        var o = {};
        o[key] = value;
        setSettings(o);
    }

    function getPriorityMap() {
        return Lampa.Storage.get(STORAGE_PRIORITY, {});
    }

    function setPriority(id, level) {
        var m = getPriorityMap();
        if (!level) delete m[id];
        else m[id] = level;
        Lampa.Storage.set(STORAGE_PRIORITY, m);
    }

    function getPriority(id) {
        return getPriorityMap()[id] || null;
    }

    function getCache() {
        return Lampa.Storage.get(STORAGE_CACHE, {});
    }

    function setCache(c) {
        Lampa.Storage.set(STORAGE_CACHE, c);
    }

    function injectCSS() {
        if (document.getElementById('movie-tools-css')) return;
        var css = `
            .card__mt-badge {
                position: absolute !important;
                z-index: 20 !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                font-size: 0.65em !important;
                font-weight: 700 !important;
                color: #fff !important;
                text-shadow: 0 1px 2px rgba(0,0,0,.5) !important;
                pointer-events: none !important;
                line-height: 1.25 !important;
                white-space: nowrap !important;
                max-width: 90% !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }
            .card__mt-badge.mt-like {
                bottom: 6px !important;
                left: 6px !important;
                background: rgba(0,0,0,0.55) !important;
                font-size: 0.85em !important;
                padding: 2px 5px !important;
            }
            .card__mt-badge.mt-rating {
                top: 6px !important;
                right: 6px !important;
            }
            .card__mt-badge.mt-runtime {
                bottom: 6px !important;
                right: 6px !important;
            }
            .card__mt-badge.mt-priority {
                top: 6px !important;
                left: 6px !important;
                background: rgba(0,0,0,0.55) !important;
                font-size: 0.9em !important;
            }
            .card.hide-by-mt {
                display: none !important;
            }
            .full-start__button.mt-priority-btn,
            .full-start__button.mt-collection-btn {
                opacity: 1 !important;
                visibility: visible !important;
            }
            .full-start__button.mt-priority-btn svg,
            .full-start__button.mt-collection-btn svg {
                width: 1.2em;
                height: 1.2em;
                flex-shrink: 0;
            }
        `;
        var style = document.createElement('style');
        style.id = 'movie-tools-css';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function isMovie(data) {
        if (!data) return false;
        if (data.method === 'tv' || data.type === 'tv' || data.type === 'serial') return false;
        if (data.first_air_date && !data.release_date) return false;
        if (data.number_of_seasons || data.number_of_episodes) return false;
        if (data.method === 'movie' || data.type === 'movie') return true;
        if (data.release_date || data.title) return true;
        return !data.name;
    }

    function getYear(data) {
        if (!data) return 0;
        if (data.release_year) return parseInt(data.release_year, 10) || 0;
        if (data.year) return parseInt(data.year, 10) || 0;
        var d = data.release_date || '';
        if (d.length >= 4) return parseInt(d.slice(0, 4), 10) || 0;
        return 0;
    }

    function getRating(data) {
        if (!data) return 0;
        return parseFloat(data.vote_average || data.vote || data.rating || 0) || 0;
    }

    function getVotes(data) {
        if (!data) return 0;
        return parseInt(data.vote_count || data.votes || 0, 10) || 0;
    }

    function getRuntime(data) {
        if (!data) return 0;
        return parseInt(data.runtime || data.movie_length || 0, 10) || 0;
    }

    function ratingColor(rating, votes, s) {
        if (votes < (s.min_votes || 0)) return '#607D8B';
        if (rating >= s.rating_green) return '#4CAF50';
        if (rating >= s.rating_yellow) return '#FFC107';
        return '#F44336';
    }

    function formatRuntime(min) {
        if (!min) return '';
        var h = Math.floor(min / 60);
        var m = min % 60;
        if (h <= 0) return m + ' мин';
        return h + 'ч ' + (m < 10 ? '0' : '') + m + ' мин';
    }

    function priorityIcon(level) {
        if (level === 'hot') return '🔥';
        if (level === 'star') return '⭐';
        if (level === 'later') return '⏳';
        return '';
    }

    function shouldHide(data) {
        var s = getSettings();
        var runtime = getRuntime(data);

        if (s.filter_runtime === 'short' && (runtime <= 0 || runtime > 100)) return true;
        if (s.filter_runtime === 'medium' && (runtime < 100 || runtime > 140)) return true;
        if (s.filter_runtime === 'long' && runtime < 140) return true;

        return false;
    }

    function hasFavGenre(data, s) {
        if (!s.highlight_fav_genres || !s.fav_genres || !s.fav_genres.length) return false;
        var ids = data.genre_ids || (data.genres ? data.genres.map(function (g) { return g.id; }) : []);
        if (!ids || !ids.length) return false;
        for (var i = 0; i < ids.length; i++) {
            if (s.fav_genres.indexOf(String(ids[i])) !== -1 || s.fav_genres.indexOf(ids[i]) !== -1) return true;
        }
        return false;
    }

    function clearBadges($card) {
        $card.find('.card__mt-badge').remove();
        $card.removeClass('hide-by-mt');
    }

    function addBadge($card, cls, text, bg) {
        if (!text) return;
        var $b = $('<div class="card__mt-badge"></div>').addClass(cls).text(text);
        if (bg) $b.css('background-color', bg);
        var $view = $card.find('.card__view');
        if ($view.length) $view.append($b);
        else $card.append($b);
    }

    function processCard(cardElement, data) {
        if (!data || !data.id) return;
        if (!isMovie(data)) return;

        var s = getSettings();
        var $card = $(cardElement);
        var el = cardElement.nodeType ? cardElement : (cardElement[0] || cardElement);

        var rating = getRating(data);
        var votes = getVotes(data);
        var runtime = getRuntime(data);
        var year = getYear(data);
        var prio = getPriority(data.id);
        var liked = hasFavGenre(data, s);

        try {
            if (el && el.setAttribute) {
                el.setAttribute('data-mt-movie', '1');
                el.setAttribute('data-mt-year', String(year));
                el.setAttribute('data-mt-rating', String(rating));
                el.setAttribute('data-mt-runtime', String(runtime));
            }
        } catch (e) {}

        clearBadges($card);

        if (shouldHide(data)) {
            $card.addClass('hide-by-mt');
            return;
        }

        if (liked) {
            addBadge($card, 'mt-like', '👍', null);
        }

        if (s.show_rating_badge && rating > 0) {
            addBadge($card, 'mt-rating', rating.toFixed(1), ratingColor(rating, votes, s));
        }

        if (s.show_runtime_badge && runtime > 0) {
            addBadge($card, 'mt-runtime', formatRuntime(runtime), 'rgba(0,0,0,0.65)');
        }

        if (s.show_priority_badge && prio) {
            addBadge($card, 'mt-priority', priorityIcon(prio), null);
        }

        scheduleSort();
    }

    function scheduleSort() {
        if (timerSort) clearTimeout(timerSort);
        timerSort = setTimeout(applySort, 650);
    }

    function applySort() {
        var mode = getSettings().sort_mode;
        if (!mode || mode === 'none') return;

        var $rows = $('.items-line__body, .scroll__body, .category-line__body, .layer--render .items');
        if (!$rows.length) $rows = $('.card').parent();

        $rows.each(function () {
            var $parent = $(this);
            var $cards = $parent.children('.card[data-mt-movie="1"]');
            if ($cards.length < 2) return;

            var arr = $cards.get();
            arr.sort(function (a, b) {
                var ya = parseInt(a.getAttribute('data-mt-year') || '0', 10);
                var yb = parseInt(b.getAttribute('data-mt-year') || '0', 10);
                var ra = parseFloat(a.getAttribute('data-mt-rating') || '0');
                var rb = parseFloat(b.getAttribute('data-mt-rating') || '0');
                var ta = parseInt(a.getAttribute('data-mt-runtime') || '0', 10);
                var tb = parseInt(b.getAttribute('data-mt-runtime') || '0', 10);

                if (mode === 'year_desc') return yb - ya;
                if (mode === 'year_asc') return ya - yb;
                if (mode === 'rating_desc') return rb - ra;
                if (mode === 'rating_asc') return ra - rb;
                if (mode === 'runtime_desc') return tb - ta;
                return 0;
            });
            arr.forEach(function (c) { $parent.append(c); });
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

    function restoreSettingsFocus() {
        try {
            Lampa.Controller.toggle('settings');
        } catch (e) {
            restoreFocus();
        }
    }

    function openPrioritySelect(id, onDone) {
        var cur = getPriority(id);
        var items = [
            { title: (cur === 'hot' ? '✓ ' : '') + '🔥 Высокий приоритет', level: 'hot' },
            { title: (cur === 'star' ? '✓ ' : '') + '⭐ Хочу посмотреть', level: 'star' },
            { title: (cur === 'later' ? '✓ ' : '') + '⏳ Позже', level: 'later' },
            { title: 'Сбросить приоритет', level: '' }
        ];

        Lampa.Select.show({
            title: 'Приоритет фильма',
            items: items,
            onSelect: function (item) {
                setPriority(id, item.level || null);
                Lampa.Noty.show(item.level ? ('Приоритет: ' + priorityIcon(item.level)) : 'Приоритет сброшен');
                if (onDone) onDone();
                restoreFocus();
            },
            onBack: function () {
                restoreFocus();
            }
        });
    }

    function fetchCollectionMeta(movieId, callback) {
        var cache = getCache();
        var key = 'col_' + movieId;
        if (cache[key] && cache[key].ts && (Date.now() - cache[key].ts < 7 * 864e5)) {
            callback(cache[key].data, cache[key].runtime);
            return;
        }
        if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) {
            callback(null);
            return;
        }
        Lampa.Api.sources.tmdb.get('movie/' + movieId, {}, function (data) {
            var col = data && data.belongs_to_collection ? data.belongs_to_collection : null;
            cache[key] = { data: col, ts: Date.now(), runtime: data && data.runtime };
            setCache(cache);
            callback(col, data && data.runtime);
        }, function () {
            callback(null);
        });
    }

    function openCollection(col) {
        if (!col || !col.id) {
            Lampa.Noty.show('Коллекция не найдена');
            restoreFocus();
            return;
        }

        if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) {
            Lampa.Noty.show('TMDB недоступен');
            restoreFocus();
            return;
        }

        Lampa.Noty.show('Загрузка коллекции...');

        Lampa.Api.sources.tmdb.get('collection/' + col.id, {}, function (data) {
            var parts = (data && data.parts) ? data.parts.slice() : [];

            if (!parts.length) {
                Lampa.Noty.show('В коллекции нет фильмов');
                restoreFocus();
                return;
            }

            parts.sort(function (a, b) {
                return String(a.release_date || '').localeCompare(String(b.release_date || ''));
            });

            var items = parts.map(function (p, index) {
                var year = p.release_date ? p.release_date.slice(0, 4) : '';
                var title = p.title || p.name || ('Часть ' + (index + 1));
                if (year) title += ' (' + year + ')';
                return { title: title, part: p };
            });

            Lampa.Select.show({
                title: (data && data.name) ? data.name : (col.name || 'Коллекция'),
                items: items,
                onSelect: function (item) {
                    var p = item.part;
                    p.source = 'tmdb';
                    p.method = 'movie';
                    Lampa.Activity.push({
                        component: 'full',
                        id: p.id,
                        method: 'movie',
                        card: p,
                        source: 'tmdb'
                    });
                },
                onBack: function () {
                    restoreFocus();
                }
            });
        }, function () {
            Lampa.Noty.show('Не удалось загрузить коллекцию');
            restoreFocus();
        });
    }

    function addFullButtons() {
        var active = Lampa.Activity.active();
        if (!active) return;

        var card = active.card || (active.activity && active.activity.card);
        if (!card || !card.id) return;
        if (!isMovie(card)) return;

        var $render = active.activity && active.activity.render ? active.activity.render() : $(document);
        var $buttons = $render.find('.full-start__buttons, .full-start-new__buttons').first();
        if (!$buttons.length) {
            var $any = $render.find('.full-start__button').first();
            if ($any.length) $buttons = $any.parent();
        }
        if (!$buttons.length) return;

        if (!$render.find('.full-start__button.mt-priority-btn').length) {
            var $p = $(
                '<div class="full-start__button selector mt-priority-btn" tabindex="0">' +
                    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' +
                    '<span>Приоритет</span>' +
                '</div>'
            );
            $p.on('hover:enter', function () {
                openPrioritySelect(card.id);
            });
            $buttons.append($p);
        }

        if (!$render.find('.full-start__button.mt-collection-btn').length) {
            fetchCollectionMeta(card.id, function (col, runtime) {
                if (runtime && !card.runtime) card.runtime = runtime;
                if (!col || !col.id) return;
                if ($render.find('.full-start__button.mt-collection-btn').length) return;

                var $c = $(
                    '<div class="full-start__button selector mt-collection-btn" tabindex="0">' +
                        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>' +
                        '<span>Коллекция</span>' +
                    '</div>'
                );
                $c.on('hover:enter', function () {
                    openCollection(col);
                });
                $buttons.append($c);

                setTimeout(function () {
                    try { Lampa.Controller.collectionSet($buttons); } catch (e) {}
                    try {
                        if (active.activity && active.activity.toggle) active.activity.toggle();
                    } catch (e2) {}
                }, 120);
            });
        }

        setTimeout(function () {
            try { Lampa.Controller.collectionSet($buttons); } catch (e) {}
            try {
                if (active.activity && active.activity.toggle) active.activity.toggle();
            } catch (e2) {}
        }, 150);
    }

    function onFullReady() {
        setTimeout(addFullButtons, 450);
    }

    function openGenreSelect() {
        var s = getSettings();
        var selected = (s.fav_genres || []).map(String);

        var items = Object.keys(GENRES).map(function (id) {
            var on = selected.indexOf(String(id)) !== -1;
            return {
                title: (on ? '✓ ' : '') + GENRES[id],
                id: String(id),
                selected: on
            };
        });

        items.unshift({ title: 'Очистить все', id: '__clear__' });

        Lampa.Select.show({
            title: 'Любимые жанры',
            items: items,
            onSelect: function (item) {
                if (item.id === '__clear__') {
                    setSetting('fav_genres', []);
                    Lampa.Noty.show('Жанры очищены');
                    restoreSettingsFocus();
                    return;
                }
                var list = (getSettings().fav_genres || []).map(String);
                var idx = list.indexOf(item.id);
                if (idx === -1) list.push(item.id);
                else list.splice(idx, 1);
                setSetting('fav_genres', list);
                Lampa.Noty.show('Сохранено: ' + list.length + ' жанров');
                setTimeout(openGenreSelect, 200);
            },
            onBack: function () {
                restoreSettingsFocus();
            }
        });
    }

    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: PLUGIN,
            name: 'Фильмы (tools)',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: { name: 'mt_show_rating', type: 'trigger', default: true },
            field: { name: 'Бейдж рейтинга', description: 'Цвет по оценке (правый верх)' },
            onChange: function (v) { setSetting('show_rating_badge', v); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: { name: 'mt_show_runtime', type: 'trigger', default: true },
            field: { name: 'Бейдж длительности', description: 'Например 1ч 48 мин (правый низ)' },
            onChange: function (v) { setSetting('show_runtime_badge', v); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: { name: 'mt_show_priority', type: 'trigger', default: true },
            field: { name: 'Бейдж приоритета', description: '🔥 ⭐ ⏳ (левый верх)' },
            onChange: function (v) { setSetting('show_priority_badge', v); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: {
                name: 'mt_min_votes',
                type: 'select',
                values: { '0': '0', '20': '20', '50': '50', '100': '100', '500': '500' },
                default: '50'
            },
            field: { name: 'Мин. голосов для цвета', description: 'Меньше — серый бейдж рейтинга' },
            onChange: function (v) { setSetting('min_votes', parseInt(v, 10)); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: {
                name: 'mt_filter_runtime',
                type: 'select',
                values: {
                    'all': 'Любая длительность',
                    'short': 'До 100 мин',
                    'medium': '100–140 мин',
                    'long': '140+ мин'
                },
                default: 'all'
            },
            field: { name: 'Фильтр по длительности', description: 'Требуются данные runtime с TMDB' },
            onChange: function (v) {
                setSetting('filter_runtime', v);
                Lampa.Noty.show('Обновите список');
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: {
                name: 'mt_sort_mode',
                type: 'select',
                values: {
                    'none': 'Без сортировки',
                    'year_desc': 'Год ↓',
                    'year_asc': 'Год ↑',
                    'rating_desc': 'Рейтинг ↓',
                    'rating_asc': 'Рейтинг ↑',
                    'runtime_desc': 'Длительность ↓'
                },
                default: 'none'
            },
            field: { name: 'Сортировка', description: 'Порядок карточек фильмов в списках' },
            onChange: function (v) {
                setSetting('sort_mode', v);
                scheduleSort();
                Lampa.Noty.show('Обновите список');
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: { name: 'mt_fav_genres', type: 'button' },
            field: {
                name: 'Любимые жанры',
                description: 'На карточке появится 👍'
            },
            onChange: function () {
                openGenreSelect();
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: { name: 'mt_highlight_genres', type: 'trigger', default: true },
            field: { name: 'Показывать лайк для любимых жанров', description: 'Значок 👍 в левом нижнем углу' },
            onChange: function (v) { setSetting('highlight_fav_genres', v); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: { name: 'mt_clear_priority', type: 'button' },
            field: { name: 'Сбросить все приоритеты', description: 'Удалить 🔥⭐⏳ из всех фильмов' },
            onChange: function () {
                Lampa.Storage.set(STORAGE_PRIORITY, {});
                Lampa.Noty.show('Приоритеты очищены');
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
                    if (this.data && (this.html || this.card)) processCard(this.html || this.card, this.data);
                } catch (e) {}
            };
        } catch (e) {}
    }

    function start() {
        injectCSS();
        addSettings();
        patchCardOnVisible();

        var s = getSettings();
        Lampa.Storage.set('mt_show_rating', s.show_rating_badge);
        Lampa.Storage.set('mt_show_runtime', s.show_runtime_badge);
        Lampa.Storage.set('mt_show_priority', s.show_priority_badge);
        Lampa.Storage.set('mt_min_votes', String(s.min_votes));
        Lampa.Storage.set('mt_filter_runtime', s.filter_runtime);
        Lampa.Storage.set('mt_sort_mode', s.sort_mode);
        Lampa.Storage.set('mt_highlight_genres', s.highlight_fav_genres);

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

        console.log('[movie-tools] loaded');
    }

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();
