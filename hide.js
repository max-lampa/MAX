(function () {
    'use strict';

    // Настройки по умолчанию (hide_ru удалён)
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

    function getSafeTitle(item) {
        if (!item) return 'Контент';
        var title = item.title || item.name || item.original_title || item.original_name || 'Контент';
        if (typeof title === 'object' && title !== null) {
            title = title.uk || title.ru || title.en || title.original || 'Контент';
        }
        return String(title);
    }

    function isMediaContent(item) {
        if (!item) return false;

        if (item.type && typeof item.type === 'string') {
            var typeLower = item.type.toLowerCase();
            if (typeLower === 'plugin' || typeLower === 'extension' || typeLower === 'theme' || typeLower === 'addon') return false;
        }

        var hasExtensionFields = (item.plugin !== undefined || item.extension !== undefined || (item.type && item.type === 'extension') || (item.type && item.type === 'plugin'));

        var hasMediaFields = item.original_language !== undefined ||
            item.vote_average !== undefined ||
            item.media_type !== undefined ||
            item.first_air_date !== undefined ||
            item.release_date !== undefined ||
            item.original_title !== undefined ||
            item.original_name !== undefined ||
            (item.genre_ids && Array.isArray(item.genre_ids)) ||
            (item.genres && Array.isArray(item.genres));

        if (hasExtensionFields && !hasMediaFields) return false;
        if (!hasMediaFields) return false;

        return true;
    }

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
            Lampa.Noty.show('"' + title + '" ' + Lampa.Lang.translate('blacklist_removed_suffix'));
        } else {
            newList.push({ id: cardData.id, title: title });
            Lampa.Storage.set('content_blacklist', newList);
            Lampa.Noty.show('"' + title + '" ' + Lampa.Lang.translate('blacklist_added_suffix'));

            var active = Lampa.Activity.active();
            if (active && active.activity && active.activity.render) {
                var focusEl = active.activity.render().find('.focus');
                if (focusEl.length) {
                    var next = focusEl.nextAll('.item:visible').first();
                    if (!next.length) next = focusEl.prevAll('.item:visible').first();

                    focusEl.remove();
                    Lampa.Controller.toggle('content');

                    if (next.length) next.trigger('hover:focus');
                }
            }
        }
    }

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

            // фильтр языков (ru полностью убран)
            function (items) {
                var langsToHide = [];

                if (settings.hide_asian) langsToHide.push('ja', 'ko', 'zh', 'th', 'id');
                if (settings.hide_in) langsToHide.push('hi', 'te', 'ta', 'ml', 'kn');
                if (settings.hide_tr) langsToHide.push('tr');
                if (settings.hide_ar) langsToHide.push('ar');

                var customLangs = (settings.hide_custom_langs || '')
                    .split(',')
                    .map(function (s) { return s.trim().toLowerCase(); })
                    .filter(function (s) { return s; });

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

                    var isSpecial = item.media_type === 'video' ||
                        item.type === 'Trailer' ||
                        item.site === 'YouTube' ||
                        (item.key && item.name && item.name.toLowerCase().indexOf('trailer') !== -1);

                    if (isSpecial) return true;

                    if (!item.vote_average || item.vote_average === 0) return false;
                    return item.vote_average >= limit;
                });
            },

            function (items) {
                var words = (settings.hide_words || '')
                    .split(',')
                    .map(function (s) { return s.trim().toLowerCase(); })
                    .filter(function (s) { return s; });

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

    function loadSettings() {
        for (var key in settings) settings[key] = Lampa.Storage.get(key, settings[key]);
    }

    function initPlugin() {
        if (window.content_hiding_plugin) return;
        window.content_hiding_plugin = true;

        loadSettings();

        Lampa.Listener.follow('request_secuses', function (e) {
            if (!e.data || !Array.isArray(e.data.results)) return;

            var hasMediaContent = e.data.results.some(function (item) {
                return isMediaContent(item);
            });

            if (!hasMediaContent) return;

            e.data.results = hideProcessor.apply(e.data.results);
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') initPlugin();
    });

})();