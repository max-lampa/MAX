(function () {
    'use strict';

    // Настройки по умолчанию
    var settings = {
        hide_asian: false,
        hide_in: false,
        hide_tr: false,
        hide_ar: false,
        hide_untranslated: false,
        hide_custom_langs: '',
        hide_rating: 'none',
        hide_history: false,
        hide_words: ''
    };

    // Получение безопасного текстового названия
    function getSafeTitle(item) {
        if (!item) return 'Контент';
        var title = item.title || item.name || item.original_title || item.original_name || 'Контент';
        if (typeof title === 'object' && title !== null) {
            title = title.ru || title.en || title.original || 'Контент';
        }
        return String(title);
    }

    // Проверка на медиа-контент
    function isMediaContent(item) {
        if (!item) return false;
        if (item.type && typeof item.type === 'string') {
            var typeLower = item.type.toLowerCase();
            if (typeLower === 'plugin' || typeLower === 'extension' || typeLower === 'theme' || typeLower === 'addon') return false;
        }
        var hasExtensionFields = (item.plugin !== undefined || item.extension !== undefined || (item.type && item.type === 'extension') || (item.type && item.type === 'plugin'));
        var hasMediaFields = item.original_language !== undefined || item.vote_average !== undefined || item.media_type !== undefined || item.first_air_date !== undefined || item.release_date !== undefined || item.original_title !== undefined || item.original_name !== undefined || (item.genre_ids && Array.isArray(item.genre_ids)) || (item.genres && Array.isArray(item.genres));

        if (hasExtensionFields && !hasMediaFields) return false;
        if (!hasMediaFields) return false;

        return true;
    }

    // Управление черным списком + передача фокуса
    function toggleBlacklist(cardData) {
        var blacklist = Lampa.Storage.get('content_blacklist', []);
        var isBlocked = false;
        var newList = [];

        for (var i = 0; i < blacklist.length; i++) {
            if (blacklist[i].id === cardData.id) isBlocked = true;
            else newList.push(blacklist[i]);
        }

        var title = getSafeTitle(cardData);

        if (isBlocked) {
            Lampa.Storage.set('content_blacklist', newList);
            Lampa.Noty.show('"' + title + '" удален из черного списка');
        } else {
            newList.push({ id: cardData.id, title: title });
            Lampa.Storage.set('content_blacklist', newList);
            Lampa.Noty.show('"' + title + '" добавлен в черный список');

            // Логика передачи фокуса для пульта на Smart TV
            var active = Lampa.Activity.active();
            if (active && active.activity && active.activity.render) {
                var focusEl = active.activity.render().find('.focus');
                if (focusEl.length) {
                    var next = focusEl.nextAll('.item:visible').first();
                    if (!next.length) next = focusEl.prevAll('.item:visible').first();

                    // Полностью удаляем карточку из DOM
                    focusEl.remove();

                    // Перезапускаем контроллер
                    Lampa.Controller.toggle('content');
                    if (next.length) {
                        next.trigger('hover:focus');
                    }
                }
            }
        }
    }

    // Процессор скрытия
    var hideProcessor = {
        filters: [
            function (items) {
                var blacklist = Lampa.Storage.get('content_blacklist', []);
                if (blacklist.length === 0) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    for (var i = 0; i < blacklist.length; i++) {
                        if (blacklist[i].id === item.id) return false;
                    }
                    return true;
                });
            },
            function (items) {
                var langsToHide = [];
                if (settings.hide_asian) langsToHide.push('ja', 'ko', 'zh', 'th', 'id');
                if (settings.hide_in) langsToHide.push('hi', 'te', 'ta', 'ml', 'kn');
                if (settings.hide_tr) langsToHide.push('tr');
                if (settings.hide_ar) langsToHide.push('ar');

                var customLangs = (settings.hide_custom_langs || '').split(',').map(function(s) { return s.trim().toLowerCase(); }).filter(function(s) { return s; });
                langsToHide = langsToHide.concat(customLangs);

                if (langsToHide.length === 0) return items;

                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    if (!item || !item.original_language) return true;
                    return langsToHide.indexOf(item.original_language.toLowerCase()) === -1;
                });
            },
            function (items) {
                if (!settings.hide_untranslated) return items;
                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    if (!item) return true;
                    return item.overview && item.overview.trim().length > 0;
                });
            },
            function (items) {
                if (settings.hide_rating === 'none') return items;
                var limit = parseFloat(settings.hide_rating);

                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    if (!item) return true;

                    var isSpecial = item.media_type === 'video' || item.type === 'Trailer' || item.site === 'YouTube' || (item.key && item.name && item.name.toLowerCase().indexOf('trailer') !== -1);
                    if (isSpecial) return true;

                    if (!item.vote_average || item.vote_average === 0) return false; 
                    return item.vote_average >= limit;
                });
            },
            function (items) {
                if (!settings.hide_history) return items;

                var favorite = Lampa.Storage.get('favorite', '{}');
                var timeline = Lampa.Storage.cache('timetable', 300, []);

                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    if (!item || !item.id) return true;

                    var mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                    var card = Lampa.Favorite.check(item);
                    var hasHistory = card && card.history;
                    var isThrown = card && card.thrown;

                    if (isThrown) return false;
                    if (!hasHistory) return true;
                    if (hasHistory && mediaType === 'movie') return false;

                    var watchedFromFavorite = getWatchedEpisodesFromFavorite(item.id, favorite);
                    var watchedFromTimeline = getWatchedEpisodesFromTimeline(item.id, timeline);
                    var allWatchedEpisodes = mergeWatchedEpisodes(watchedFromFavorite, watchedFromTimeline);
                    var title = item.original_title || item.original_name || item.title || item.name || '';

                    return !isSeriesFullyWatched(title, allWatchedEpisodes);
                });
            },
            function (items) {
                var words = (settings.hide_words || '').split(',').map(function(s) { return s.trim().toLowerCase(); }).filter(function(s) { return s; });
                if (words.length === 0) return items;

                return items.filter(function (item) {
                    if (!isMediaContent(item)) return true;
                    var title = getSafeTitle(item).toLowerCase();

                    for (var i = 0; i < words.length; i++) {
                        if (title.indexOf(words[i]) !== -1) return false;
                    }
                    return true;
                });
            }
        ],
        apply: function (data) {
            var results = Lampa.Arrays.clone(data);
            for (var i = 0; i < this.filters.length; i++) {
                results = this.filters[i](results);
            }
            return results;
        }
    };

    // История просмотров (вспомогательные функции)
    function getWatchedEpisodesFromFavorite(id, favoriteData) {
        var card = (favoriteData.card || []).find(function (c) { return c.id === id && Array.isArray(c.seasons) && c.seasons.length > 0; });
        if (!card) return [];
        var airedSeasons = card.seasons.filter(function (s) { return s.season_number > 0 && s.episode_count > 0 && s.air_date && new Date(s.air_date) < new Date(); });
        var episodes = [];
        airedSeasons.forEach(function (season) {
            for (var ep = 1; ep <= season.episode_count; ep++) episodes.push({ season_number: season.season_number, episode_number: ep });
        });
        return episodes;
    }

    function getWatchedEpisodesFromTimeline(id, timelineData) {
        var entry = (timelineData || []).find(function (e) { return e.id === id; }) || {};
        if (!Array.isArray(entry.episodes) || entry.episodes.length === 0) return [];
        return entry.episodes.filter(function (ep) { return ep.season_number > 0 && ep.air_date && new Date(ep.air_date) < new Date(); });
    }

    function mergeWatchedEpisodes(arr1, arr2) {
        var merged = (arr1 || []).concat(arr2 || []);
        var unique = [];
        merged.forEach(function (ep) {
            var exists = unique.some(function (u) { return u.season_number === ep.season_number && u.episode_number === ep.episode_number; });
            if (!exists) unique.push(ep);
        });
        return unique;
    }

    function isSeriesFullyWatched(title, watchedEpisodes) {
        if (!watchedEpisodes || watchedEpisodes.length === 0) return false;
        for (var i = 0; i < watchedEpisodes.length; i++) {
            var ep = watchedEpisodes[i];
            var hash = Lampa.Utils.hash([ ep.season_number, ep.season_number > 10 ? ':' : '', ep.episode_number, title ].join(''));
            var view = Lampa.Timeline.view(hash);
            if (!view || view.percent < 100) return false;
        }
        return true;
    }

    // Локализация (только русский язык)
    function addTranslations() {
        Lampa.Lang.add({
            content_hiding: { ru: 'Скрытие контента' },
            content_hiding_desc: { ru: 'Настройки скрытия нежелательного контента' },
            hide_asian: { ru: 'Скрыть азиатский контент' },
            hide_asian_desc: { ru: 'Скрывает карточки с языками оригинала: ja, ko, zh, th, id' },
            hide_in: { ru: 'Скрыть индийский контент' },
            hide_in_desc: { ru: 'Скрывает карточки с языками оригинала: hi, te, ta, ml, kn' },
            hide_tr: { ru: 'Скрыть турецкий контент' },
            hide_tr_desc: { ru: 'Скрывает карточки с языком оригинала: tr' },
            hide_ar: { ru: 'Скрыть арабский контент' },
            hide_ar_desc: { ru: 'Скрывает карточки с языком оригинала: ar' },
            hide_untranslated: { ru: 'Скрыть контент без перевода' },
            hide_untranslated_desc: { ru: 'Скрывает карточки, у которых отсутствует локализация на язык по умолчанию' },
            hide_custom_langs: { ru: 'Другие языки' },
            hide_custom_langs_desc: { ru: 'Впишите коды языков через запятую' },
            hide_rating: { ru: 'Скрыть низкий рейтинг' },
            hide_rating_desc: { ru: 'Скрывает контент с рейтингом TMDb ниже указанного' },
            hide_rating_none: { ru: 'Нет' },
            hide_history: { ru: 'Скрыть просмотренное' },
            hide_history_desc: { ru: 'Скрывает фильмы и сериалы, которые есть в истории просмотра' },
            hide_words: { ru: 'Скрыть по словам в названии' },
            hide_words_desc: { ru: 'Скрывает карточки, в названии которых есть определённые слова или фразы (через запятую)' },
            blacklist_manage: { ru: 'Чёрный список' },
            blacklist_count: { ru: 'Заблокировано карточек' },
            blacklist_empty: { ru: 'Чёрный список пуст' },
            blacklist_remove_action: { ru: 'Нажмите на название ниже, чтобы удалить из чёрного списка' },
            blacklist_clear_all: { ru: 'Очистить весь список' },
            blacklist_add: { ru: 'Скрыть' },
            blacklist_added_suffix: { ru: 'добавлен в чёрный список' },
            blacklist_removed_suffix: { ru: 'удалён из чёрного списка' }
        });
    }

    // Вывод текста справа в меню
    function updateSettingsValue(el, value) {
        var valEl = el.find('.settings-param__value');
        if (!valEl.length) {
            valEl = $('<div class="settings-param__value"></div>');
            el.find('.settings-param__name').after(valEl);
        }
        valEl.text(value || '');
    }

    // Настройки плагина
    function addSettings() {
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'main') {
                var render = Lampa.Settings.main().render();
                if (render.find('[data-component="content_hiding"]').length === 0) {
                    Lampa.SettingsApi.addComponent({ component: 'content_hiding', name: Lampa.Lang.translate('content_hiding') });
                }
                Lampa.Settings.main().update();
                render.find('[data-component="content_hiding"]').addClass('hide');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'content_hiding', type: 'static', default: true },
            field: { name: Lampa.Lang.translate('content_hiding'), description: Lampa.Lang.translate('content_hiding_desc') },
            onRender: function (el) {
                setTimeout(function () {
                    var title = Lampa.Lang.translate('content_hiding') || 'Скрытие контента';
                    $('.settings-param > div:contains("' + title + '")').parent().insertAfter($('div[data-name="interface_size"]'));
                }, 0);
                el.on('hover:enter', function () {
                    Lampa.Settings.create('content_hiding');
                    Lampa.Controller.enabled().controller.back = function () { Lampa.Settings.create('interface'); };
                });
            }
        });

        // Добавляем параметры (без hide_ru)
        ['asian', 'in', 'tr', 'ar', 'untranslated'].forEach(function (key) {
            Lampa.SettingsApi.addParam({
                component: 'content_hiding',
                param: { name: 'hide_' + key, type: 'trigger', default: false },
                field: { name: Lampa.Lang.translate('hide_' + key), description: Lampa.Lang.translate('hide_' + key + '_desc') },
                onChange: function (value) {
                    settings['hide_' + key] = value;
                    Lampa.Storage.set('hide_' + key, value);
                }
            });
        });

        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { name: 'hide_custom_langs', type: 'static', default: '' },
            field: { name: Lampa.Lang.translate('hide_custom_langs'), description: Lampa.Lang.translate('hide_custom_langs_desc') },
            onRender: function (el) {
                updateSettingsValue(el, settings.hide_custom_langs);
                el.on('hover:enter', function () {
                    Lampa.Input.edit({
                        title: Lampa.Lang.translate('hide_custom_langs'),
                        value: settings.hide_custom_langs,
                        free: true,
                        nosave: false
                    }, function (new_value) {
                        settings.hide_custom_langs = new_value;
                        Lampa.Storage.set('hide_custom_langs', new_value);
                        updateSettingsValue(el, new_value);
                    });
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { 
                name: 'hide_rating', 
                type: 'select', 
                values: { 'none': Lampa.Lang.translate('hide_rating_none'), '4.0': '< 4.0', '5.0': '< 5.0', '6.0': '< 6.0', '7.0': '< 7.0' }, 
                default: 'none' 
            },
            field: { name: Lampa.Lang.translate('hide_rating'), description: Lampa.Lang.translate('hide_rating_desc') },
            onChange: function (value) {
                settings.hide_rating = value;
                Lampa.Storage.set('hide_rating', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { name: 'hide_history', type: 'trigger', default: false },
            field: { name: Lampa.Lang.translate('hide_history'), description: Lampa.Lang.translate('hide_history_desc') },
            onChange: function (value) {
                settings.hide_history = value;
                Lampa.Storage.set('hide_history', value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { name: 'hide_words', type: 'static', default: '' },
            field: { name: Lampa.Lang.translate('hide_words'), description: Lampa.Lang.translate('hide_words_desc') },
            onRender: function (el) {
                updateSettingsValue(el, settings.hide_words);
                el.on('hover:enter', function () {
                    Lampa.Input.edit({
                        title: Lampa.Lang.translate('hide_words'),
                        value: settings.hide_words,
                        free: true,
                        nosave: false
                    }, function (new_value) {
                        settings.hide_words = new_value;
                        Lampa.Storage.set('hide_words', new_value);
                        updateSettingsValue(el, new_value);
                    });
                });
            }
        });

        // Менеджер черного списка
        Lampa.SettingsApi.addParam({
            component: 'content_hiding',
            param: { name: 'hide_blacklist_manage', type: 'static' },
            field: { name: Lampa.Lang.translate('blacklist_manage'), description: '' },
            onRender: function (el) {
                var updateCount = function() {
                    var list = Lampa.Storage.get('content_blacklist', []);
                    updateSettingsValue(el, list.length.toString());
                };
                updateCount();

                var showManager = function() {
                    var list = Lampa.Storage.get('content_blacklist', []);
                    if (list.length === 0) {
                        Lampa.Noty.show(Lampa.Lang.translate('blacklist_empty'));
                        Lampa.Controller.toggle('settings_component');
                        return;
                    }

                    var items = [];
                    items.push({
                        title: Lampa.Lang.translate('blacklist_clear_all'),
                        subtitle: Lampa.Lang.translate('blacklist_remove_action'),
                        onSelect: function() {
                            Lampa.Storage.set('content_blacklist', []);
                            updateCount();
                            Lampa.Controller.toggle('settings_component');
                        }
                    });

                    list.forEach(function(item) {
                        items.push({ title: item.title, itemData: item });
                    });

                    Lampa.Select.show({
                        title: Lampa.Lang.translate('blacklist_manage'),
                        items: items,
                        onSelect: function(selected) {
                            if (selected.itemData) {
                                var newList = Lampa.Storage.get('content_blacklist', []).filter(function(i) { return i.id !== selected.itemData.id; });
                                Lampa.Storage.set('content_blacklist', newList);
                                Lampa.Noty.show('"' + selected.itemData.title + '" ' + Lampa.Lang.translate('blacklist_removed_suffix'));
                                updateCount();
                                showManager();
                            }
                        },
                        onBack: function() { Lampa.Controller.toggle('settings_component'); }
                    });
                };

                el.on('hover:enter', showManager);
            }
        });
    }

    function loadSettings() {
        for (var key in settings) settings[key] = Lampa.Storage.get(key, settings[key]);
    }

    // Регистрация пункта в контекстном меню "Скрыть"
    function registerContextMenu() {
        if (!Lampa.Manifest) Lampa.Manifest = {};
        if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = [];

        var pluginName = Lampa.Lang.translate('blacklist_add') || 'Скрыть';
        var exists = Array.isArray(Lampa.Manifest.plugins) && Lampa.Manifest.plugins.some(function(p) { return p.component === 'content_hiding_context'; });
        if (exists) return;

        var contextPlugin = {
            type: 'video',
            name: pluginName,
            component: 'content_hiding_context',
            onContextMenu: function (card) {
                if (card && card.id && isMediaContent(card)) {
                    return { name: pluginName };
                }
            },
            onContextLauch: function (card) { 
                if (card && card.id) {
                    toggleBlacklist(card);
                }
            }
        };

        if (Array.isArray(Lampa.Manifest.plugins)) {
            Lampa.Manifest.plugins.push(contextPlugin);
        } else {
            Lampa.Manifest.plugins = [contextPlugin];
        }
    }

    // Инициализация плагина
    function initPlugin() {
        if (window.content_hiding_plugin) return;
        window.content_hiding_plugin = true;

        loadSettings();
        addTranslations();
        addSettings();
        registerContextMenu(); 

        Lampa.Listener.follow('request_secuses', function (e) {
            if (!e.data || !Array.isArray(e.data.results)) return;
            var urlStr = (e.url || (e.data && e.data.url) || '').toLowerCase();
            if (urlStr.indexOf('extension') !== -1 || urlStr.indexOf('plugin') !== -1 || urlStr.indexOf('store') !== -1) return;
            var componentStr = (e.component || (e.data && e.data.component) || '').toLowerCase();
            if (componentStr.indexOf('extension') !== -1 || componentStr.indexOf('plugin') !== -1) return;
            if (e.data.results.length === 0) return;

            var hasMediaContent = e.data.results.some(function(item) { return isMediaContent(item); });
            if (!hasMediaContent) return;

            var originalCount = e.data.results.length;
            e.data.results = hideProcessor.apply(e.data.results);
            e.data.original_length = originalCount;
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') initPlugin(); });
})();