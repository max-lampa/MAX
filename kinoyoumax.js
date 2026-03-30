/**
 * Kinooglad (Кінообзор) — Standalone Lampa Plugin
 * YouTube channel browser: add channels, browse videos, play via Lampa player.
 *
 * Features:
 * - External player support: VLC, MX Player, ViMU, DDD Player, Lampa built-in, YouTube app, browser
 * - Player selection via proper Lampa selectbox menu (remote-control friendly)
 * - Full remote control (пульт) support for Lampa TV
 * - YouTube RSS channel browsing
 */
(function () {
    'use strict';

    if (window.plugin_kinoohlyad_ready) return;

    // =========================================================
    // i18n
    // =========================================================
    var I18N = {
        loading_trailer:              { uk: 'Завантаження трейлера...',             ru: 'Загрузка трейлера...',              en: 'Loading trailer...',                    pl: 'Ładowanie zwiastuna...' },
        settings_kinooglad_name:      { uk: 'Кіноогляд',                           ru: 'Кинообзор',                         en: 'Movie review',                          pl: 'Przegląd filmowy' },
        settings_kinooglad_desc:      { uk: 'Увімкнути розділ Кіноогляд у меню.',  ru: 'Включить раздел Кинообзор в меню.', en: 'Enable Movie review section in menu.',  pl: 'Włącz sekcję Przegląd filmowy w menu.' },
        kino_settings_title:          { uk: 'Кіноогляд: Налаштування', ru: 'Кинообзор: Настройки', en: 'Movie review: Settings', pl: 'Przegląd filmowy: Ustawienia' },
        kino_add_channel_name:        { uk: 'Додати канал',   ru: 'Добавить канал',   en: 'Add channel',   pl: 'Dodaj kanał' },
        kino_add_channel_desc:        { uk: 'Посилання YouTube або @нік', ru: 'Ссылка YouTube или @ник', en: 'YouTube link or @handle', pl: 'Link YouTube lub @nazwa' },
        kino_add_channel_input:       { uk: 'Посилання на канал або @нік', ru: 'Ссылка на канал или @ник', en: 'Channel link or @handle', pl: 'Link do kanału lub @nazwa' },
        kino_channel_generic:         { uk: 'Канал', ru: 'Канал', en: 'Channel', pl: 'Kanał' },
        kino_reset_name:              { uk: 'Скинути налаштування каналів', ru: 'Сбросить настройки каналов', en: 'Reset channel settings', pl: 'Zresetuj ustawienia kanałów' },
        kino_reset_desc:              { uk: 'Очистити список каналів',      ru: 'Очистить список каналов',    en: 'Clear channel list',      pl: 'Wyczyść listę kanałów' },
        kino_channel_enabled:         { uk: 'Увімкнено', ru: 'Включено', en: 'Enabled',  pl: 'Włączony' },
        kino_channel_disabled:        { uk: 'Вимкнено',  ru: 'Выключено', en: 'Disabled', pl: 'Wyłączony' },
        kino_channel_delete_btn:      { uk: 'Видалити канал', ru: 'Удалить канал', en: 'Delete channel', pl: 'Usuń kanał' },
        kino_menu_title:              { uk: 'Кіноогляд', ru: 'Кинообзор', en: 'Movie review', pl: 'Przegląd filmowy' },
        kino_plugin_name:             { uk: 'Кіноогляд',  ru: 'Кинообзор',  en: 'Movie review', pl: 'Przegląd filmowy' },
        kino_plugin_desc:             { uk: 'Перегляд YouTube-каналів у Lampa', ru: 'Просмотр YouTube-каналов в Lampa', en: 'Browse YouTube channels in Lampa', pl: 'Przeglądaj kanały YouTube w Lampie' },
        kino_player_name:             { uk: 'Плеєр для відео', ru: 'Плеер для видео', en: 'Video player', pl: 'Odtwarzacz wideo' },
        kino_player_desc:             { uk: 'Оберіть плеєр для відтворення', ru: 'Выберите плеер для воспроизведения', en: 'Choose player for playback', pl: 'Wybierz odtwarzacz' },
        kino_player_lampa:            { uk: 'Вбудований (Lampa)', ru: 'Встроенный (Lampa)', en: 'Built-in (Lampa)', pl: 'Wbudowany (Lampa)' },
        kino_player_vlc:              { uk: 'VLC Player', ru: 'VLC Player', en: 'VLC Player', pl: 'VLC Player' },
        kino_player_mx:               { uk: 'MX Player', ru: 'MX Player', en: 'MX Player', pl: 'MX Player' },
        kino_player_vimu:             { uk: 'ViMU Player', ru: 'ViMU Player', en: 'ViMU Player', pl: 'ViMU Player' },
        kino_player_ddd:              { uk: 'DDD Player', ru: 'DDD Player', en: 'DDD Player', pl: 'DDD Player' },
        kino_player_external:         { uk: 'YouTube App', ru: 'YouTube App', en: 'YouTube App', pl: 'YouTube App' },
        kino_player_external_browser: { uk: 'Браузер', ru: 'Браузер', en: 'Browser', pl: 'Przeglądarka' },
        kino_select_player:           { uk: 'Оберіть плеєр', ru: 'Выберите плеер', en: 'Select player', pl: 'Wybierz odtwarzacz' },
        kino_current_player:          { uk: 'Поточний: ', ru: 'Текущий: ', en: 'Current: ', pl: 'Bieżący: ' }
    };

    function tr(key) {
        var entry = I18N[key];
        if (!entry) return key;
        var lang = (Lampa.Storage && Lampa.Storage.get ? Lampa.Storage.get('language', 'uk') : 'uk') || 'uk';
        return entry[lang] || entry['uk'] || entry['en'] || key;
    }

    // =========================================================
    // Player modes configuration
    // =========================================================
    var PLAYER_MODES = ['lampa', 'vlc', 'mx', 'vimu', 'ddd', 'external', 'external_browser'];
    var PLAYER_MODE_LABELS = {
        lampa:            tr('kino_player_lampa'),
        vlc:              tr('kino_player_vlc'),
        mx:               tr('kino_player_mx'),
        vimu:             tr('kino_player_vimu'),
        ddd:              tr('kino_player_ddd'),
        external:         tr('kino_player_external'),
        external_browser: tr('kino_player_external_browser')
    };

    // =========================================================
    // External / app player launchers
    // =========================================================

    function getYtUrl(videoId) {
        return 'https://www.youtube.com/watch?v=' + videoId;
    }

    function openInBrowser(url) {
        if (Lampa.Platform && Lampa.Platform.openWindow) {
            Lampa.Platform.openWindow(url);
        } else {
            window.open(url, '_blank');
        }
    }

    function tryDeepLink(deepLink, fallbackUrl) {
        var iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;border:0;';
        iframe.src = deepLink;
        document.body.appendChild(iframe);
        setTimeout(function () {
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
            openInBrowser(fallbackUrl);
        }, 1800);
    }

    /**
     * Play video in external player by mode
     */
    function playInExternalPlayer(videoId, mode) {
        var ytUrl = getYtUrl(videoId);
        var youtubeShort = 'https://youtu.be/' + videoId;

        switch (mode) {
            case 'vlc':
                // VLC on Android handles youtube:// or vlc:// schemes
                // Try intent URI for Android, fall back to browser
                var vlcIntent = 'intent:' + ytUrl + '#Intent;package=org.videolan.vlc;scheme=https;end';
                var vlcDirect = 'vlc://' + ytUrl;
                tryDeepLink(vlcDirect, ytUrl);
                break;

            case 'mx':
                // MX Player: intent URI for Android
                var mxIntent = 'intent:' + ytUrl +
                    '#Intent;package=com.mxtech.videoplayer.ad;' +
                    'S.title=' + encodeURIComponent('YouTube');
                tryDeepLink(mxIntent, ytUrl);
                break;

            case 'vimu':
                // ViMU Player deep link
                var vimuLink = 'vimu://' + ytUrl;
                tryDeepLink(vimuLink, ytUrl);
                break;

            case 'ddd':
                // DDD Player (3D/media player apps)
                var dddLink = 'dddplayer://' + ytUrl;
                tryDeepLink(dddLink, ytUrl);
                break;

            case 'external':
                // YouTube app deep link
                var ytDeep = 'youtube://watch?v=' + videoId;
                if (Lampa.Platform && Lampa.Platform.openWindow) {
                    Lampa.Platform.openWindow(youtubeShort);
                } else {
                    tryDeepLink(ytDeep, youtubeShort);
                }
                break;

            case 'external_browser':
                openInBrowser(youtubeShort);
                break;

            default:
                openInBrowser(youtubeShort);
        }
    }

    // =========================================================
    // Player selection menu (remote-control friendly)
    // Uses Lampa's native selectbox so пульт works natively
    // =========================================================
    function showPlayerSelectMenu(videoId, videoTitle, onSelected) {
        var currentMode = Lampa.Storage.get('kinooglad_player_mode', 'lampa');

        var items = PLAYER_MODES.map(function (mode) {
            return {
                title: PLAYER_MODE_LABELS[mode] || mode,
                subtitle: mode === currentMode ? ('✓ ' + tr('kino_current_player').replace(': ', '')) : '',
                player: mode,
                template: 'selectbox_icon',
                icon: getPlayerIcon(mode)
            };
        });

        Lampa.Select.show({
            title: tr('kino_select_player'),
            items: items,
            onSelect: function (item) {
                Lampa.Storage.set('kinooglad_player_mode', item.player);
                if (onSelected) onSelected(item.player);
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
            }
        });
    }

    function getPlayerIcon(mode) {
        var icons = {
            lampa: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
            vlc: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
            mx: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 8.5l-5 3-5-3V6l5 3 5-3v4.5z"/></svg>',
            vimu: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21 3H3v18h18V3zm-9 13l-5-5 1.41-1.41L12 13.17l7.59-7.59L21 7l-9 9z"/></svg>',
            ddd: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
            external: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.59 7l-7.59 7.59L5.41 8 4 9.41l8 8 9-9z"/></svg>',
            external_browser: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>'
        };
        return icons[mode] || icons['lampa'];
    }

    // =========================================================
    // Core play function — handles all player modes
    // =========================================================
    function playVideo(videoId, videoData) {
        var mode = Lampa.Storage.get('kinooglad_player_mode', 'lampa');
        var title = (videoData && videoData.title) ? videoData.title : 'YouTube';

        if (mode === 'lampa') {
            // Built-in Lampa player
            if (Lampa.Manifest && Lampa.Manifest.app_digital >= 183) {
                var item = {
                    title: Lampa.Utils.shortText(title, 50),
                    id: videoId,
                    youtube: true,
                    url: 'https://www.youtube.com/watch?v=' + videoId,
                    icon: '<img class="size-youtube" src="https://img.youtube.com/vi/' + videoId + '/default.jpg" />',
                    template: 'selectbox_icon'
                };
                Lampa.Player.play(item);
                Lampa.Player.playlist([item]);
            } else {
                Lampa.YouTube.play(videoId);
            }
        } else {
            playInExternalPlayer(videoId, mode);
        }
    }

    // =========================================================
    // KinoApi — YouTube RSS / API data layer
    // =========================================================
    var KINO_CHANNEL_I18N_KEYS = {};

    function getKinoChannelDisplayName(channel) {
        if (!channel || !channel.id) return channel && channel.name ? channel.name : tr('kino_channel_generic');
        var key = KINO_CHANNEL_I18N_KEYS[String(channel.id).trim()];
        if (!key) return channel.name || tr('kino_channel_generic');
        var localized = tr(key);
        return localized || channel.name || tr('kino_channel_generic');
    }

    var KinoApi = {
        proxies: [
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://thingproxy.freeboard.io/fetch/',
            'https://corsproxy.io/?url=',
            'https://api.allorigins.win/raw?url=',
            'https://api.allorigins.win/get?url=',
            'https://cors.isomorphic-git.org/',
            'https://yacdn.org/proxy/'
        ],
        defaultChannels: [],
        cache: (function () {
            try { return Lampa.Cache && new Lampa.Cache('kinooglad', 24 * 60 * 60); } catch (e) { return null; }
        })(),

        getChannels: function () {
            var stored = Lampa.Storage.get('kino_channels', '[]');
            var channels;
            if (typeof stored === 'string') {
                try { channels = JSON.parse(stored); } catch (e) { return this.defaultChannels.slice(); }
            } else if (Array.isArray(stored)) {
                channels = stored;
            } else {
                return this.defaultChannels.slice();
            }
            if (!channels || !channels.length) return this.defaultChannels.slice();
            var seen = {};
            channels = channels.filter(function (c) {
                var id = String(c.id).trim().toLowerCase();
                if (seen[id]) return false;
                seen[id] = true;
                return true;
            });
            return channels;
        },

        saveChannels: function (channels) {
            Lampa.Storage.set('kino_channels', channels);
        },

        resolveHandleToChannelId: function (handle, callback) {
            var _this = this;
            var cleanHandle = String(handle).trim().replace(/^@/, '');
            var pageUrl = 'https://www.youtube.com/@' + encodeURIComponent(cleanHandle);
            var encodedPage = encodeURIComponent(pageUrl);

            function tryProxy(idx) {
                if (idx >= _this.proxies.length) { callback(new Error('resolve_failed')); return; }
                var proxy = _this.proxies[idx];
                var url = proxy.indexOf('corsproxy') > -1 ? proxy + pageUrl : proxy + encodedPage;
                $.get(url).done(function (html) {
                    var str = typeof html === 'string' ? html : (html && html.contents ? html.contents : '');
                    var m = str.match(/"externalId"\s*:\s*"(UC[\w-]{22})"/) ||
                            str.match(/"channelId"\s*:\s*"(UC[\w-]{22})"/) ||
                            str.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
                    if (m && m[1]) {
                        callback(null, { id: m[1], name: cleanHandle });
                    } else {
                        tryProxy(idx + 1);
                    }
                }).fail(function () { tryProxy(idx + 1); });
            }
            tryProxy(0);
        },

        resolveVideoToChannelId: function (videoId, callback) {
            var _this = this;
            var cleanId = String(videoId).trim();
            var pageUrl = 'https://www.youtube.com/watch?v=' + encodeURIComponent(cleanId);
            var encodedPage = encodeURIComponent(pageUrl);

            function tryProxy(idx) {
                if (idx >= _this.proxies.length) { callback(new Error('resolve_failed')); return; }
                var proxy = _this.proxies[idx];
                var url = proxy.indexOf('corsproxy') > -1 ? proxy + pageUrl : proxy + encodedPage;
                $.get(url).done(function (html) {
                    var str = typeof html === 'string' ? html : (html && html.contents ? html.contents : '');
                    var m = str.match(/"externalId"\s*:\s*"(UC[\w-]{22})"/) ||
                            str.match(/"channelId"\s*:\s*"(UC[\w-]{22})"/) ||
                            str.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
                    if (m && m[1]) {
                        var name = (str.match(/"ownerChannelName"\s*:\s*"([^"]+)"/) || [])[1] || 'Channel';
                        callback(null, { id: m[1], name: name });
                    } else {
                        tryProxy(idx + 1);
                    }
                }).fail(function () { tryProxy(idx + 1); });
            }
            tryProxy(0);
        },

        fetch: function (channel, oncomplite, onerror, page) {
            var pageNum = page || 1;
            var cacheKey = 'channel_' + String(channel.id).trim() + '_page_' + pageNum;
            return this.fetchWithRSS(channel, pageNum, oncomplite, onerror, cacheKey);
        },

        fetchWithRSS: function (channel, pageNum, oncomplite, onerror, cacheKey) {
            var _this = this;
            var id = String(channel.id).trim();
            var page = pageNum || 1;
            var itemsPerPage = 15;

            if (_this.cache) {
                var cached = _this.cache.get ? _this.cache.get(cacheKey) : null;
                if (cached) { oncomplite(cached); return; }
            }

            var isChannelId = /^UC[\w-]{22}$/.test(id);

            function doFetch(feedUrl) {
                var encodedUrl = encodeURIComponent(feedUrl);

                function tryFetch(index) {
                    if (index >= _this.proxies.length) { onerror(); return; }
                    var currentProxy = _this.proxies[index];
                    var fetchUrl = currentProxy + encodedUrl;

                    $.get(fetchUrl, function (data) {
                        var raw = typeof data === 'string' ? data : (data && typeof data.contents === 'string' ? data.contents : '');
                        var str = (raw || '').trim();

                        if (str && str.indexOf('<?xml') !== 0 && str.indexOf('<feed') !== 0) {
                            if (str.indexOf('<!DOCTYPE') !== -1 || str.indexOf('<html') !== -1) return tryFetch(index + 1);
                        }

                        var xml;
                        try {
                            xml = typeof data === 'string' ? $.parseXML(data) : (data && data.documentElement ? data : $.parseXML(raw || String(data || '')));
                        } catch (e) { return tryFetch(index + 1); }

                        if (!xml || !$(xml).find('entry').length) return tryFetch(index + 1);

                        var items = [];
                        $(xml).find('entry').each(function () {
                            var $el = $(this);
                            var mediaGroup = $el.find('media\\:group, group');
                            var thumb = mediaGroup.find('media\\:thumbnail, thumbnail').attr('url');
                            var videoId = $el.find('yt\\:videoId, videoId').text();
                            var link = $el.find('link').attr('href');
                            var title = $el.find('title').text();

                            if (link && link.indexOf('/shorts/') > -1) return;
                            if (title && title.toLowerCase().indexOf('#shorts') > -1) return;

                            items.push({
                                title: title,
                                img: thumb,
                                video_id: videoId,
                                release_date: ($el.find('published').text() || '').split('T')[0],
                                vote_average: 0
                            });
                        });

                        var startIndex = (page - 1) * itemsPerPage;
                        var paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

                        if (paginatedItems.length) {
                            if (_this.cache && _this.cache.set) {
                                try { _this.cache.set(cacheKey, paginatedItems); } catch (e) {}
                            }
                            oncomplite(paginatedItems);
                        } else {
                            tryFetch(index + 1);
                        }
                    }).fail(function () { tryFetch(index + 1); });
                }

                tryFetch(0);
            }

            if (isChannelId) {
                doFetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + id);
            } else {
                _this.resolveHandleToChannelId(id, function (err, resolved) {
                    if (!err && resolved && resolved.id) {
                        var ch = _this.getChannels();
                        for (var i = 0; i < ch.length; i++) {
                            if (String(ch[i].id).trim().toLowerCase() === id.toLowerCase()) {
                                ch[i].id = resolved.id;
                                _this.saveChannels(ch);
                                break;
                            }
                        }
                        doFetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + resolved.id);
                    } else {
                        doFetch('https://www.youtube.com/feeds/videos.xml?user=' + id.replace(/^@/, ''));
                    }
                });
            }
        },

        fetchPlaylistItems: function (playlistId, oncomplite, onerror) {
            var _this = this;
            var pid = String(playlistId).trim();
            if (!pid) { onerror(); return; }

            var url = 'https://www.youtube.com/feeds/videos.xml?playlist_id=' + encodeURIComponent(pid);
            var encodedUrl = encodeURIComponent(url);

            function tryFetch(index) {
                if (index >= _this.proxies.length) { onerror(); return; }
                $.get(_this.proxies[index] + encodedUrl, function (data) {
                    var raw = typeof data === 'string' ? data : (data && typeof data.contents === 'string' ? data.contents : '');
                    var str = (raw || '').trim();
                    if (str && str.indexOf('<?xml') !== 0 && str.indexOf('<feed') !== 0) {
                        if (str.indexOf('<!DOCTYPE') !== -1 || str.indexOf('<html') !== -1) return tryFetch(index + 1);
                    }
                    var xml;
                    try {
                        xml = typeof data === 'string' ? $.parseXML(data) : (data && data.documentElement ? data : $.parseXML(raw || String(data || '')));
                    } catch (e) { return tryFetch(index + 1); }
                    if (!xml || !$(xml).find('entry').length) return tryFetch(index + 1);

                    var items = [];
                    $(xml).find('entry').each(function () {
                        var $el = $(this);
                        var mediaGroup = $el.find('media\\:group, group');
                        var thumb = mediaGroup.find('media\\:thumbnail, thumbnail').attr('url');
                        var videoId = $el.find('yt\\:videoId, videoId').text();
                        var link = $el.find('link').attr('href');
                        var title = $el.find('title').text();
                        if (link && link.indexOf('/shorts/') > -1) return;
                        if (title && title.toLowerCase().indexOf('#shorts') > -1) return;
                        items.push({ title: title, img: thumb, video_id: videoId, release_date: ($el.find('published').text() || '').split('T')[0], vote_average: 0 });
                    });

                    if (items.length) oncomplite(items);
                    else tryFetch(index + 1);
                }).fail(function () { tryFetch(index + 1); });
            }
            tryFetch(0);
        },

        main: function (oncomplite, onerror) {
            var _this = this;
            var channels = this.getChannels().filter(function (c) { return c.active !== false; });

            if (!channels.length) { onerror(); return; }

            var maxVideosPerChannel = 15;
            var timeoutMs = 7000;

            var promises = channels.map(function (channel) {
                return new Promise(function (resolve) {
                    var timeout = setTimeout(function () {
                        resolve({ title: channel.name, channelId: channel.id, results: [] });
                    }, timeoutMs);

                    _this.fetch(channel, function (items) {
                        clearTimeout(timeout);
                        resolve({ title: channel.name, channelId: channel.id, results: items.slice(0, maxVideosPerChannel) });
                    }, function () {
                        clearTimeout(timeout);
                        resolve({ title: channel.name, channelId: channel.id, results: [] });
                    });
                });
            });

            Promise.all(promises).then(function (results) {
                var withVideos = results.filter(function (r) { return r.results.length > 0; });
                var withoutVideos = results.filter(function (r) { return r.results.length === 0; });
                withVideos.sort(function (a, b) {
                    var dateA = a.results[0] ? new Date(a.results[0].release_date) : 0;
                    var dateB = b.results[0] ? new Date(b.results[0].release_date) : 0;
                    return dateB - dateA;
                });
                var sorted = withVideos.concat(withoutVideos);
                if (sorted.length) oncomplite(sorted);
                else onerror();
            });
        },

        clear: function () {}
    };

    if (!window.KinooogladApi) window.KinooogladApi = KinoApi;

    // =========================================================
    // KinoCard — single video thumbnail card
    // =========================================================
    function KinoCard(data) {
        this.build = function () {
            if (data.is_button) {
                this.card = $('<div class="card selector card--wide layer--render layer--visible kino-card show-more-button">' +
                    '<div class="card__view" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:1.2em;height:100%;position:relative;overflow:hidden;">' +
                        '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;color:white;font-weight:600;font-size:1.1em;text-shadow:0 1px 2px rgba(0,0,0,.3);text-align:center;width:100%;padding:1em;box-sizing:border-box;">' +
                            '<svg style="width:32px;height:32px;margin-bottom:8px;fill:currentColor;" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>' +
                            '<div style="line-height:1.2;">Показать ещё</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="card__title" style="display:none;"></div>' +
                    '<div class="card__date" style="display:none;"></div>' +
                '</div>');
            } else {
                this.card = Lampa.Template.get('kino_card', {});
                this.img = this.card.find('img')[0];
                this.card.find('.card__title').text(data.title);
                var date = data.release_date ? data.release_date.split('-').reverse().join('.') : '';
                this.card.find('.card__date').text(date);
            }
        };

        this.image = function () {
            if (data.is_button) { this.card.addClass('card--loaded'); return; }
            var _this = this;
            this.img.onload = function () { _this.card.addClass('card--loaded'); };
            this.img.onerror = function () { _this.img.src = './img/img_broken.svg'; };
            if (data.img) this.img.src = data.img;
        };

        this.play = function (id) {
            if (data.is_button) {
                var currentData = window.currentKinoChannelData || {};
                var currentPage = parseInt(currentData.page || 1);
                var channelId = currentData.channel_id || currentData.channel || currentData.id;
                var channelTitle = currentData.title || 'Канал';
                Lampa.Activity.push({ url: '', title: channelTitle + ' — стр. ' + (currentPage + 1), component: 'kino_channel_view', channel_id: channelId, page: currentPage + 1 });
                return;
            }

            // Always show player selection menu when pressing Enter on a video
            showPlayerSelectMenu(id, data.title, function (selectedMode) {
                // Save chosen mode and play immediately
                if (selectedMode === 'lampa') {
                    playVideo(id, data);
                } else {
                    playInExternalPlayer(id, selectedMode);
                }
            });
        };

        this.create = function () {
            var _this = this;
            this.build();
            if (!this.card) return;

            this.card
                .on('hover:focus', function (e) {
                    if (data.is_button) {
                        $(this).css({ transform: 'scale(1.05)', 'box-shadow': '0 0 0 3px #fff', 'z-index': '10' });
                    }
                    if (_this.onFocus) _this.onFocus(e.target, data);
                })
                .on('hover:leave', function () {
                    if (data.is_button) {
                        $(this).css({ transform: 'scale(1)', 'box-shadow': 'none', 'z-index': '' });
                    }
                })
                .on('hover:enter', function () {
                    _this.play(data.video_id);
                });

            this.image();
        };

        this.toggle = function () {
            Lampa.Controller.add('items_line', {
                toggle: function () { Lampa.Controller.collectionFocus(false); },
                right: function () { Navigator.move('right'); },
                left: function () { Navigator.move('left'); },
                down: function () {},
                up: function () {},
                gone: function () {},
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('items_line');
        };

        this.render = function () { return this.card; };
        this.destroy = function () {
            if (this.img) { this.img.onerror = null; this.img.onload = null; this.img.src = ''; }
            if (this.card) { this.card.remove(); }
            this.card = this.img = null;
        };
    }

    // =========================================================
    // KinoLine — horizontal row of cards for one channel
    // =========================================================
    function KinoLine(data) {
        var content = Lampa.Template.get('items_line', { title: data.title });
        var body = content.find('.items-line__body');
        var scroll = new Lampa.Scroll({ horizontal: true, step: 250 });
        var items = [];
        var active = 0;
        var last = null;

        this.onDown = null;
        this.onUp = null;
        this.onBack = null;
        this.onFocus = null;

        this.create = function () {
            var _this = this;
            scroll.minus();
            body.append(scroll.render());

            (data.results || []).forEach(function (video) {
                var card = new KinoCard(video);
                card.create();
                card.onFocus = function (target) {
                    last = target;
                    active = items.indexOf(card);
                    scroll.update(items[active].render(), true);
                };
                scroll.append(card.render());
                items.push(card);
            });

            // "Open channel" button
            var channelTitle = data.title;
            var channelId = data.channelId;
            var cardEl = $('<div class="card selector card--wide layer--render layer--visible kino-card kino-card--channel">' +
                '<div class="card__view" style="background:linear-gradient(135deg,#11998e 0%,#38ef7d 100%);border-radius:1.2em;height:100%;position:relative;overflow:hidden;">' +
                    '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;color:white;font-weight:600;font-size:.95em;text-shadow:0 1px 2px rgba(0,0,0,.4);text-align:center;width:100%;padding:.8em;box-sizing:border-box;">' +
                        '<svg style="width:28px;height:28px;margin-bottom:6px;fill:currentColor;" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>' +
                        '<div style="line-height:1.2;">' + channelTitle + '</div>' +
                        '<div style="font-size:.8em;opacity:.85;margin-top:4px;">Весь канал</div>' +
                    '</div>' +
                '</div>' +
                '<div class="card__title" style="display:none;"></div>' +
                '<div class="card__date" style="display:none;"></div>' +
            '</div>');

            cardEl.on('hover:focus', function () {
                last = cardEl[0];
                scroll.update(cardEl, true);
            }).on('hover:enter click', function () {
                Lampa.Activity.push({ url: '', title: channelTitle, component: 'kino_channel_view', channel_id: channelId, page: 1 });
            });
            cardEl.addClass('card--loaded');
            scroll.append(cardEl);
            items.push({ render: function () { return cardEl; }, destroy: function () { cardEl.remove(); } });
        };

        this.toggle = function () {
            var _this = this;
            Lampa.Controller.add('items_line', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(items.length ? last : false, scroll.render());
                },
                right: function () { Navigator.move('right'); },
                left: function () { Navigator.move('left'); },
                down: _this.onDown,
                up: _this.onUp,
                gone: function () {},
                back: _this.onBack
            });
            Lampa.Controller.toggle('items_line');
        };

        this.render = function () { return content; };
        this.destroy = function () {
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            content.remove();
            items = [];
        };
    }

    // =========================================================
    // KinoChannelView — single-channel full-page view
    // =========================================================
    function KinoChannelView(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: false });
        var items = [];
        var html = $('<div></div>');
        var active = 0;
        var last = null;

        window.currentKinoChannelData = object;

        this.create = function () {
            var _this = this;
            this.activity.loader(true);

            html.append($('<div class="kino-head" style="display:none;"></div>'));

            var channel = object.channel || { id: object.channel_id || object.id, name: object.title || 'Канал' };
            var page = object.page || 1;

            KinoApi.fetch(channel, function (videos) {
                scroll.minus();
                html.append(scroll.render());

                videos.forEach(function (video) { _this.append(video); });
                _this.append({ title: 'Показать ещё', img: '', video_id: 'show_more_button', is_button: true });

                _this.activity.toggle();
                _this.activity.loader(false);
            }, function () {
                _this.empty();
            }, page);
        };

        this.empty = function () {
            var empty = new Lampa.Empty();
            html.append(empty.render());
            this.start = empty.start.bind(empty);
            this.activity.toggle();
        };

        this.append = function (element) {
            var _this = this;
            var card = new KinoCard(element);
            card.create();
            card.onFocus = function (target) {
                last = target;
                active = items.indexOf(card);
                scroll.update(items[active].render(), true);
            };
            scroll.append(card.render());
            items.push(card);
        };

        this.toggle = function () {
            var _this = this;
            Lampa.Controller.add('items_line', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(items.length ? last : false, scroll.render());
                },
                right: function () { Navigator.move('right'); },
                left: function () { Navigator.move('left'); },
                down: function () {},
                up: function () {},
                gone: function () {},
                back: _this.back
            });
            Lampa.Controller.toggle('items_line');
        };

        this.start = function () {
            var _this = this;
            if (Lampa.Activity.active().activity !== this.activity) return;
            Lampa.Controller.add('content', {
                toggle: function () { if (items.length) items[active].toggle(); },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () { Navigator.move('right'); },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () { if (items.length) items[active].toggle(); },
                back: _this.back
            });
            Lampa.Controller.toggle('content');
        };

        this.back = function () { Lampa.Activity.backward(); };
        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () {
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            html.remove();
            items = [];
        };
    }

    // =========================================================
    // KinoComponent — main page (all channels as rows)
    // =========================================================
    function KinoComponent(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
        var items = [];
        var html = $('<div></div>');
        var active = 0;

        this.create = function () {
            var _this = this;
            this.activity.loader(true);

            html.append($('<div class="kino-head"></div>'));

            KinoApi.main(function (data) {
                _this.build(data);
                _this.activity.loader(false);
            }, function () {
                _this.empty();
                _this.activity.loader(false);
            });
            return this.render();
        };

        this.empty = function () {
            var empty = new Lampa.Empty();
            html.append(empty.render());
            this.start = empty.start.bind(empty);
            this.activity.toggle();
        };

        this.build = function (data) {
            var _this = this;
            scroll.minus();
            html.append(scroll.render());
            data.forEach(function (element) { _this.append(element); });
            this.activity.toggle();
        };

        this.append = function (element) {
            var item = new KinoLine(element);
            item.create();
            item.onDown = this.down.bind(this);
            item.onUp = this.up.bind(this);
            item.onBack = this.back.bind(this);
            item.onFocus = function () {};
            scroll.append(item.render());
            items.push(item);
        };

        this.back = function () { Lampa.Activity.backward(); };

        this.down = function () {
            active = Math.min(active + 1, items.length - 1);
            items[active].toggle();
            scroll.update(items[active].render());
        };

        this.up = function () {
            active--;
            if (active < 0) {
                active = 0;
                Lampa.Controller.toggle('head');
            } else {
                items[active].toggle();
                scroll.update(items[active].render());
            }
        };

        this.start = function () {
            var _this = this;
            if (Lampa.Activity.active().activity !== this.activity) return;
            Lampa.Controller.add('content', {
                toggle: function () { if (items.length) items[active].toggle(); },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () { Navigator.move('right'); },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () { if (items.length) items[active].toggle(); },
                back: _this.back
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () {
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            html.remove();
            items = [];
        };
    }

    // =========================================================
    // Plugin init
    // =========================================================
    function startPlugin() {
        window.plugin_kinoohlyad_ready = true;

        Lampa.Component.add('kinoohlyad_view', KinoComponent);
        Lampa.Component.add('kino_channel_view', KinoChannelView);

        // ---- Register card template ----
        Lampa.Template.add('kino_card', [
            '<div class="card selector card--wide layer--render layer--visible kino-card">',
            '    <div class="card__view">',
            '        <img src="./img/img_load.svg" class="card__img">',
            '        <div class="card__promo"></div>',
            '    </div>',
            '    <div class="card__title"></div>',
            '    <div class="card__date" style="font-size:.8em;opacity:.7;margin-top:.3em;"></div>',
            '</div>'
        ].join(''));

        // ---- CSS ----
        $('body').append('<style id="kinooglad-css">' + [
            '.kino-card{width:calc(25% - 1em)!important;min-width:18em!important;max-width:22em!important;margin:0 1em 1em 0!important;aspect-ratio:16/9;display:inline-block!important;vertical-align:top;}',
            '@media(max-width:768px){.kino-card{width:calc(50% - 1em)!important;min-width:14em!important;max-width:unset!important;}}',
            '.kino-card .card__title{font-size:1em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.2;padding:0 .2em;}',
            '.kino-card .card__view{padding-bottom:56.25%!important;}',
            '.kino-card .card__img{object-fit:cover!important;height:100%!important;border-radius:.3em;}',
            '.kino-card .card__date{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 .2em;}',
            '.kino-card--channel .card__title{font-style:italic;}',
            '.kino-settings:focus,.kino-settings.focus{background:#fff!important;color:#000!important;}',
            '.kino-settings-screen{padding:1.5em 2em 3em;max-width:40em;}',
            '.kino-settings__title{display:block;font-size:1.5em;font-weight:600;margin-bottom:1.2em;color:inherit;}',
            '.kino-settings__subtitle{display:block;font-size:.95em;opacity:.85;margin:1.2em 0 .6em;padding-top:.8em;border-top:1px solid rgba(255,255,255,.15);}',
            '.kino-settings__row{display:flex;flex-direction:column;align-items:flex-start;gap:.25em;padding:.85em 1em;margin-bottom:.4em;border-radius:.5em;background:rgba(255,255,255,.06);min-height:3em;box-sizing:border-box;}',
            '.kino-settings__row.selector:hover,.kino-settings__row.selector.focus{background:rgba(255,255,255,.12);}',
            '.kino-settings__row--channel{flex-direction:row;align-items:center;justify-content:space-between;gap:1em;}',
            '.kino-settings__row--off{opacity:.6;}',
            '.kino-settings__label{font-size:1em;font-weight:500;}',
            '.kino-settings__hint{font-size:.85em;opacity:.8;}',
            '.kino-settings__channel-name{flex:1;min-width:0;font-size:1em;}',
            '.kino-settings__channel-status{flex-shrink:0;font-size:.9em;opacity:.9;}'
        ].join('') + '</style>');

        // ---- Settings ----
        if (Lampa.SettingsApi && Lampa.SettingsApi.addParam) {

            if (Lampa.SettingsApi.addComponent) {
                Lampa.SettingsApi.addComponent({
                    component: 'kinooglad_plugin',
                    name: tr('kino_plugin_name'),
                    icon: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="none"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 8h8v2H8V8zm0 4h6v2H8v-2zm0 4h8v2H8v-2z" fill="currentColor"/></svg>'
                });
            }

            var component = 'kinooglad_plugin';

            function parseChannelInput(input) {
                var s = (input || '').trim();
                if (!s) return null;
                var m = s.match(/youtube\.com\/channel\/(UC[\w-]{22})/i) || s.match(/(?:^|\s)(UC[\w-]{22})(?:\s|$)/);
                if (m) return { id: m[1], name: tr('kino_channel_generic') };
                m = s.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
                if (m) return { id: 'vid:' + m[1], name: tr('kino_channel_generic') };
                m = s.match(/(?:youtube\.com\/)?@([\w.-]+)/i) || s.match(/^@?([\w.-]+)$/);
                if (m) return { id: m[1], name: m[1] };
                if (/^UC[\w-]{22}$/.test(s)) return { id: s, name: tr('kino_channel_generic') };
                return null;
            }

            function showMsg(msg, isError) {
                if (Lampa.Noty) Lampa.Noty.show(msg, isError ? 'error' : 'info');
                else console.log('Kinooglad:', msg);
            }

            // Section title
            Lampa.SettingsApi.addParam({
                component: component,
                param: { type: 'title' },
                field: { name: tr('kino_settings_title') }
            });

            // Enable/disable toggle
            Lampa.SettingsApi.addParam({
                component: component,
                param: { name: 'kinooglad_enabled', type: 'trigger', default: true },
                field: { name: tr('settings_kinooglad_name'), description: tr('settings_kinooglad_desc') }
            });

            // Player mode — opens Lampa selectbox (пульт-friendly)
            Lampa.SettingsApi.addParam({
                component: component,
                param: { name: 'kinooglad_player_mode', type: 'button' },
                field: { name: tr('kino_player_name'), description: tr('kino_player_desc') },
                onRender: function (item) {
                    var mode = Lampa.Storage.get('kinooglad_player_mode', 'lampa');
                    if (!item.find('.settings-param__value').length)
                        item.append('<div class="settings-param__value"></div>');
                    item.find('.settings-param__value').text(PLAYER_MODE_LABELS[mode] || PLAYER_MODE_LABELS['lampa']);
                },
                onChange: function () {
                    // Open proper selectbox menu for player selection
                    var currentMode = Lampa.Storage.get('kinooglad_player_mode', 'lampa');
                    var selectItems = PLAYER_MODES.map(function (mode) {
                        return {
                            title: PLAYER_MODE_LABELS[mode] || mode,
                            subtitle: mode === currentMode ? '✓' : '',
                            player: mode,
                            template: 'selectbox_icon',
                            icon: getPlayerIcon(mode)
                        };
                    });

                    Lampa.Select.show({
                        title: tr('kino_select_player'),
                        items: selectItems,
                        onSelect: function (item) {
                            Lampa.Storage.set('kinooglad_player_mode', item.player);
                            if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                        },
                        onBack: function () {
                            Lampa.Controller.toggle('settings_component');
                        }
                    });
                }
            });

            // Add channel button
            Lampa.SettingsApi.addParam({
                component: component,
                param: { name: 'kinooglad_add_channel', type: 'button' },
                field: { name: tr('kino_add_channel_name'), description: tr('kino_add_channel_desc') },
                onChange: function () {
                    Lampa.Input.edit({ title: tr('kino_add_channel_input'), value: '', free: true, nosave: true }, function (value) {
                        var parsed = parseChannelInput(value);
                        if (!parsed) {
                            showMsg('Неверный формат. Используйте @имя, ID канала UC... или ссылку YouTube', true);
                            return;
                        }
                        var ch = KinoApi.getChannels();
                        var rawId = String(parsed.id).trim();
                        var idNorm = rawId.toLowerCase();
                        if (ch.some(function (c) { return String(c.id).trim().toLowerCase() === idNorm; })) {
                            showMsg('Канал уже добавлен', true);
                            return;
                        }
                        if (/^UC[\w-]{22}$/.test(rawId)) {
                            ch.push({ name: parsed.name, id: parsed.id, active: true });
                            KinoApi.saveChannels(ch);
                            if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                            showMsg('Канал успешно добавлен');
                            return;
                        }
                        if (rawId.indexOf('vid:') === 0) {
                            showMsg('Поиск канала по видео...');
                            var videoId = rawId.slice(4);
                            KinoApi.resolveVideoToChannelId(videoId, function (err, resolved) {
                                if (!err && resolved && resolved.id) {
                                    var existsById = ch.some(function (c) { return String(c.id).trim().toLowerCase() === resolved.id.toLowerCase(); });
                                    if (!existsById) {
                                        ch.push({ name: resolved.name || parsed.name, id: resolved.id, active: true });
                                        showMsg('Канал успешно добавлен');
                                    } else {
                                        showMsg('Канал уже добавлен', true);
                                    }
                                } else {
                                    showMsg('Не удалось найти канал по видео', true);
                                }
                                KinoApi.saveChannels(ch);
                                if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                            });
                        } else {
                            showMsg('Поиск канала...');
                            KinoApi.resolveHandleToChannelId(rawId, function (err, resolved) {
                                if (!err && resolved && resolved.id) {
                                    var exists = ch.some(function (c) { return String(c.id).trim() === resolved.id; });
                                    if (!exists) {
                                        ch.push({ name: resolved.name || parsed.name, id: resolved.id, active: true });
                                        showMsg('Канал успешно добавлен');
                                    } else {
                                        showMsg('Канал уже добавлен', true);
                                    }
                                } else {
                                    showMsg('Не удалось найти канал. Проверьте @имя или используйте ID (UC...)', true);
                                    ch.push({ name: parsed.name, id: parsed.id, active: true });
                                }
                                KinoApi.saveChannels(ch);
                                if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                            });
                        }
                    });
                }
            });

            // Reset channels button
            Lampa.SettingsApi.addParam({
                component: component,
                param: { name: 'kinooglad_reset', type: 'button' },
                field: { name: tr('kino_reset_name'), description: tr('kino_reset_desc') },
                onChange: function () {
                    KinoApi.saveChannels([]);
                    if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                }
            });

            // Per-channel toggle / delete (up to 50 channels)
            var KINO_MAX_CHANNELS = 50;
            for (var ci = 0; ci < KINO_MAX_CHANNELS; ci++) {
                (function (idx) {
                    Lampa.SettingsApi.addParam({
                        component: component,
                        param: { name: 'kinooglad_ch_' + idx, type: 'button' },
                        field: { name: '—' },
                        onRender: function (item) {
                            var ch = KinoApi.getChannels()[idx];
                            if (!ch) { item.hide(); return; }
                            item.show();
                            item.find('.settings-param__name').text(getKinoChannelDisplayName(ch));
                            if (!item.find('.settings-param__value').length) item.append('<div class="settings-param__value"></div>');
                            item.find('.settings-param__value').text(ch.active !== false ? tr('kino_channel_enabled') : tr('kino_channel_disabled'));
                        },
                        onChange: function () {
                            var ch = KinoApi.getChannels();
                            if (ch[idx]) {
                                ch[idx].active = (ch[idx].active === false);
                                KinoApi.saveChannels(ch);
                                var scrollWrap = document.querySelector('.activity .scroll') || document.querySelector('.scroll');
                                var scrollTop = scrollWrap ? scrollWrap.scrollTop : 0;
                                if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                setTimeout(function () { if (scrollWrap) scrollWrap.scrollTop = scrollTop; }, 80);
                            }
                        }
                    });

                    Lampa.SettingsApi.addParam({
                        component: component,
                        param: { name: 'kinooglad_ch_' + idx + '_delete', type: 'button' },
                        field: { name: tr('kino_channel_delete_btn') },
                        onRender: function (item) {
                            var ch = KinoApi.getChannels()[idx];
                            if (!ch) { item.hide(); return; }
                            item.show();
                            item.find('.settings-param__name').text('🗑️ ' + tr('kino_channel_delete_btn') + ': ' + getKinoChannelDisplayName(ch));
                        },
                        onChange: function () {
                            var channels = KinoApi.getChannels();
                            if (!channels[idx]) return;
                            var name = channels[idx].name || tr('kino_channel_generic');
                            var confirmDelete = true;
                            if (typeof window.confirm === 'function') {
                                confirmDelete = window.confirm(name + ' — ' + tr('kino_channel_delete_btn') + '?');
                            }
                            if (!confirmDelete) return;
                            channels.splice(idx, 1);
                            KinoApi.saveChannels(channels);
                            var scrollWrap = document.querySelector('.activity .scroll') || document.querySelector('.scroll');
                            var scrollTop = scrollWrap ? scrollWrap.scrollTop : 0;
                            if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                            setTimeout(function () { if (scrollWrap) scrollWrap.scrollTop = scrollTop; }, 80);
                        }
                    });
                })(ci);
            }
        }

        // ---- Menu button ----
        function addMenu() {
            var getCurrentTitle = function () {
                var title = tr('kino_menu_title');
                try {
                    var channels = KinoApi.getChannels().filter(function (c) { return c.active !== false; });
                    if (channels.length === 1 && channels[0].name) title = channels[0].name;
                } catch (e) {}
                return title;
            };

            var action = function () {
                Lampa.Activity.push({
                    url: '',
                    title: getCurrentTitle(),
                    component: 'kinoohlyad_view',
                    page: 1
                });
            };

            var btnTitle = getCurrentTitle();
            var btn = $('<li class="menu__item selector" data-action="kinoohlyad">' +
                '<div class="menu__ico"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="none">' +
                '<circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="1.5"/>' +
                '<path d="M8 8h8v2H8V8zm0 4h6v2H8v-2zm0 4h8v2H8v-2z" fill="white"/>' +
                '<circle cx="3" cy="3" r="1" fill="white" opacity=".6"/><circle cx="21" cy="3" r="1" fill="white" opacity=".6"/>' +
                '<circle cx="3" cy="21" r="1" fill="white" opacity=".6"/><circle cx="21" cy="21" r="1" fill="white" opacity=".6"/>' +
                '<circle cx="12" cy="1" r="1" fill="white" opacity=".7"/><circle cx="12" cy="23" r="1" fill="white" opacity=".7"/>' +
                '<circle cx="1" cy="12" r="1" fill="white" opacity=".7"/><circle cx="23" cy="12" r="1" fill="white" opacity=".7"/>' +
                '</svg></div>' +
                '<div class="menu__text">' + btnTitle + '</div>' +
            '</li>');

            // Full remote control support: hover:enter fires from Lampa's Navigator
            btn.on('hover:enter click', action);
            $('.menu .menu__list').eq(0).append(btn);
        }

        var kinoEnabled = Lampa.Storage.get('kinooglad_enabled', true);

        if (kinoEnabled) {
            if (window.appready) {
                addMenu();
            } else {
                Lampa.Listener.follow('app', function (e) {
                    if (e.type === 'ready') addMenu();
                });
            }
        }
    }

    startPlugin();

})();
