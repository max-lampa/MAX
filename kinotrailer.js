/**
 * Kinooglad (Кінообзор) — Standalone Lampa Plugin
 * YouTube channel browser: add channels, browse videos, play via Lampa player.
 *
 * v3 fixes:
 * - External players (VLC, MX, ViMU, DDD) via window.location.href + Android Intent URI
 * - Built-in Lampa mode: custom YouTube iframe overlay, NO buffering loader
 * - Player selection via Lampa selectbox (пульт-friendly)
 */
(function () {
    'use strict';

    if (window.plugin_kinoohlyad_ready) return;

    // =========================================================
    // i18n
    // =========================================================
    var I18N = {
        settings_kinooglad_name:      { uk: 'Кіноогляд',                           ru: 'Кинообзор',                         en: 'Movie review',                          pl: 'Przegląd filmowy' },
        settings_kinooglad_desc:      { uk: 'Увімкнути розділ Кіноогляд у меню.',  ru: 'Включить раздел Кинообзор в меню.', en: 'Enable Movie review section in menu.',  pl: 'Włącz sekcję Przegląd filmowy w menu.' },
        kino_settings_title:          { uk: 'Кіноогляд: Налаштування', ru: 'Кинообзор: Настройки', en: 'Movie review: Settings', pl: 'Przegląd filmowy: Ustawienia' },
        kino_add_channel_name:        { uk: 'Додати канал',   ru: 'Добавить канал',   en: 'Add channel',   pl: 'Dodaj kanał' },
        kino_add_channel_desc:        { uk: 'Посилання YouTube або @нік', ru: 'Ссылка YouTube или @ник', en: 'YouTube link or @handle', pl: 'Link YouTube lub @nazwa' },
        kino_add_channel_input:       { uk: 'Посилання на канал або @нік', ru: 'Ссылка на канал или @ник', en: 'Channel link or @handle', pl: 'Link do kanału lub @nazwa' },
        kino_channel_generic:         { uk: 'Канал', ru: 'Канал', en: 'Channel', pl: 'Kanał' },
        kino_reset_name:              { uk: 'Скинути канали', ru: 'Сбросить каналы', en: 'Reset channels', pl: 'Zresetuj kanały' },
        kino_reset_desc:              { uk: 'Очистити список каналів', ru: 'Очистить список каналов', en: 'Clear channel list', pl: 'Wyczyść listę kanałów' },
        kino_channel_enabled:         { uk: 'Увімкнено', ru: 'Включено', en: 'Enabled',  pl: 'Włączony' },
        kino_channel_disabled:        { uk: 'Вимкнено',  ru: 'Выключено', en: 'Disabled', pl: 'Wyłączony' },
        kino_channel_delete_btn:      { uk: 'Видалити', ru: 'Удалить', en: 'Delete', pl: 'Usuń' },
        kino_menu_title:              { uk: 'Кіноогляд', ru: 'Кинообзор', en: 'Movie review', pl: 'Przegląd filmowy' },
        kino_plugin_name:             { uk: 'Кіноогляд',  ru: 'Кинообзор',  en: 'Movie review', pl: 'Przegląd filmowy' },
        kino_player_name:             { uk: 'Плеєр', ru: 'Плеер', en: 'Player', pl: 'Odtwarzacz' },
        kino_player_desc:             { uk: 'Оберіть плеєр (зберігається)', ru: 'Выберите плеер (сохраняется)', en: 'Select player (saved)', pl: 'Wybierz odtwarzacz (zapisane)' },
        kino_select_player:           { uk: 'Вибір плеєра', ru: 'Выбор плеера', en: 'Select player', pl: 'Wybierz odtwarzacz' },
        kino_play_in:                 { uk: 'Відтворити у', ru: 'Воспроизвести в', en: 'Play in', pl: 'Odtwórz w' }
    };

    function tr(key) {
        var entry = I18N[key];
        if (!entry) return key;
        var lang = (Lampa.Storage && Lampa.Storage.get ? Lampa.Storage.get('language', 'uk') : 'uk') || 'uk';
        return entry[lang] || entry['uk'] || entry['en'] || key;
    }

    // =========================================================
    // Player configuration
    // =========================================================
    var PLAYERS = [
        { id: 'lampa',    label: 'Lampa (встроенный)' },
        { id: 'vlc',      label: 'VLC Player' },
        { id: 'mx',       label: 'MX Player' },
        { id: 'vimu',     label: 'ViMU Player' },
        { id: 'ddd',      label: 'DDD Player' },
        { id: 'youtube',  label: 'YouTube App' },
        { id: 'browser',  label: 'Браузер' }
    ];

    function getPlayerLabel(id) {
        for (var i = 0; i < PLAYERS.length; i++) {
            if (PLAYERS[i].id === id) return PLAYERS[i].label;
        }
        return id;
    }

    function getCurrentPlayer() {
        return Lampa.Storage.get('kinooglad_player', 'lampa') || 'lampa';
    }

    // =========================================================
    // Built-in Lampa player: YouTube iframe overlay, NO buffering
    // =========================================================
    function playYouTubeInline(videoId) {
        // Full-screen overlay on top of everything — no Lampa buffering loader
        var overlay = $([
            '<div class="kino-yt-overlay" style="',
                'position:fixed;top:0;left:0;width:100%;height:100%;',
                'z-index:99999;background:#000;display:flex;',
                'align-items:center;justify-content:center;">',
                '<div id="kino-yt-player" style="width:100%;height:100%;"></div>',
            '</div>'
        ].join(''));

        $('body').append(overlay);

        var closed = false;
        function closeOverlay() {
            if (closed) return;
            closed = true;
            overlay.remove();
            Lampa.Controller.toggle('content');
        }

        // Register back-button handler for пульт
        Lampa.Controller.add('kino_yt_player', {
            toggle:  function () {},
            up:      function () {},
            down:    function () {},
            left:    function () {},
            right:   function () {},
            enter:   function () {},
            back:    closeOverlay
        });
        Lampa.Controller.toggle('kino_yt_player');

        function initYTPlayer() {
            new YT.Player('kino-yt-player', {
                width: '100%',
                height: '100%',
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    rel: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    playsinline: 1,
                    fs: 1
                },
                events: {
                    onReady: function (e) {
                        // Immediately play — no buffering wait
                        e.target.playVideo();
                    },
                    onStateChange: function (e) {
                        // Close when video ends
                        if (e.data === YT.PlayerState.ENDED) closeOverlay();
                    },
                    onError: function (e) {
                        var msg = 'Ошибка YouTube: ' + e.data;
                        if (e.data === 150 || e.data === 153) msg = 'Видео ограничено правообладателем (' + e.data + ')';
                        if (Lampa.Noty) Lampa.Noty.show(msg);
                        closeOverlay();
                    }
                }
            });
        }

        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
            // Load YouTube IFrame API on demand
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            var prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function () {
                if (typeof prev === 'function') prev();
                initYTPlayer();
            };
            var first = document.getElementsByTagName('script')[0];
            first.parentNode.insertBefore(tag, first);
        } else {
            initYTPlayer();
        }
    }

    // =========================================================
    // Universal URL opener for Lampa WebView
    //
    // Priority:
    //   1. window.Android.openUrl()    — native Lampa Android bridge
    //   2. Lampa.Platform.openWindow() — Lampa platform API
    //   3. window.open(url, '_blank')  — triggers shouldOverrideUrlLoading
    //      for custom schemes (vlc://, vnd.youtube:, etc.)
    //
    // NEVER use window.location.href for app URIs — it causes
    // "cannot open page" / ERR_UNKNOWN_URL_SCHEME errors.
    // =========================================================
    function openUrl(url) {
        if (typeof Android !== 'undefined') {
            if (typeof Android.openUrl === 'function')  { Android.openUrl(url); return; }
            if (typeof Android.startUrl === 'function') { Android.startUrl(url); return; }
        }
        if (Lampa.Platform && typeof Lampa.Platform.openWindow === 'function') {
            Lampa.Platform.openWindow(url); return;
        }
        window.open(url, '_blank');
    }

    function openInBrowser(url) { openUrl(url); }

    function playInExternalPlayer(videoId, mode) {
        var ytWatch = 'https://www.youtube.com/watch?v=' + videoId;
        var ytShort  = 'https://youtu.be/' + videoId;

        switch (mode) {
            case 'vlc':
                openUrl('vlc://' + ytWatch);
                break;

            case 'mx':
                // MX Player: no universal URI scheme — use system chooser via openUrl
                openUrl(ytWatch);
                break;

            case 'vimu':
                openUrl('vimu://' + ytWatch);
                break;

            case 'ddd':
                openUrl('ddd://' + ytWatch);
                break;

            case 'youtube':
                // vnd.youtube: is the standard YouTube app deep-link scheme
                openUrl('vnd.youtube:' + videoId);
                break;

            case 'browser':
                openUrl(ytShort);
                break;

            default:
                openUrl(ytShort);
        }
    }

    // =========================================================
    // Play dispatcher: inline or external
    // =========================================================
    function doPlay(videoId, videoData) {
        var mode = getCurrentPlayer();

        if (mode === 'lampa') {
            // Custom iframe overlay — no Lampa buffering
            playYouTubeInline(videoId);
        } else {
            playInExternalPlayer(videoId, mode);
        }
    }

    // =========================================================
    // Player selection menu — proper Lampa selectbox (пульт OK)
    // =========================================================
    function showPlayerMenu(videoId, videoTitle) {
        var current = getCurrentPlayer();

        var items = PLAYERS.map(function (p) {
            return {
                title: (p.id === current ? '✓ ' : '') + p.label,
                player_id: p.id
            };
        });

        Lampa.Select.show({
            title: tr('kino_select_player') + ': ' + (videoTitle ? '"' + Lampa.Utils.shortText(videoTitle, 30) + '"' : ''),
            items: items,
            onSelect: function (item) {
                var chosen = item.player_id;
                Lampa.Storage.set('kinooglad_player', chosen);
                // Play immediately with chosen player
                if (chosen === 'lampa') {
                    playYouTubeInline(videoId);
                } else {
                    playInExternalPlayer(videoId, chosen);
                }
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
            }
        });
    }

    // =========================================================
    // KinoApi — YouTube RSS data layer
    // =========================================================
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
                    if (m && m[1]) callback(null, { id: m[1], name: cleanHandle });
                    else tryProxy(idx + 1);
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
                    } else tryProxy(idx + 1);
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
                    $.get(currentProxy + encodedUrl, function (data) {
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

                        var paginatedItems = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);
                        if (paginatedItems.length) {
                            if (_this.cache && _this.cache.set) {
                                try { _this.cache.set(cacheKey, paginatedItems); } catch (e) {}
                            }
                            oncomplite(paginatedItems);
                        } else tryFetch(index + 1);
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

        main: function (oncomplite, onerror) {
            var _this = this;
            var channels = this.getChannels().filter(function (c) { return c.active !== false; });
            if (!channels.length) { onerror(); return; }

            var maxVideos = 15;
            var timeoutMs = 7000;
            var promises = channels.map(function (channel) {
                return new Promise(function (resolve) {
                    var t = setTimeout(function () { resolve({ title: channel.name, channelId: channel.id, results: [] }); }, timeoutMs);
                    _this.fetch(channel, function (items) {
                        clearTimeout(t);
                        resolve({ title: channel.name, channelId: channel.id, results: items.slice(0, maxVideos) });
                    }, function () {
                        clearTimeout(t);
                        resolve({ title: channel.name, channelId: channel.id, results: [] });
                    });
                });
            });

            Promise.all(promises).then(function (results) {
                var withVids = results.filter(function (r) { return r.results.length > 0; });
                var noVids   = results.filter(function (r) { return r.results.length === 0; });
                withVids.sort(function (a, b) {
                    return new Date(b.results[0] ? b.results[0].release_date : 0) - new Date(a.results[0] ? a.results[0].release_date : 0);
                });
                var sorted = withVids.concat(noVids);
                if (sorted.length) oncomplite(sorted);
                else onerror();
            });
        },

        clear: function () {}
    };

    if (!window.KinooogladApi) window.KinooogladApi = KinoApi;

    // =========================================================
    // KinoCard — single video card
    // =========================================================
    function KinoCard(data) {
        this.build = function () {
            if (data.is_button) {
                this.card = $('<div class="card selector card--wide layer--render layer--visible kino-card show-more-button">' +
                    '<div class="card__view" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:1.2em;height:100%;position:relative;overflow:hidden;">' +
                        '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;color:white;font-weight:600;font-size:1.1em;text-align:center;width:100%;padding:1em;box-sizing:border-box;">' +
                            '<svg style="width:32px;height:32px;margin-bottom:8px;fill:currentColor;" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>' +
                            '<div>Показать ещё</div>' +
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
                var cd = window.currentKinoChannelData || {};
                var pg = parseInt(cd.page || 1);
                var cid = cd.channel_id || cd.channel || cd.id;
                var ct = cd.title || 'Канал';
                Lampa.Activity.push({ url: '', title: ct + ' — стр. ' + (pg + 1), component: 'kino_channel_view', channel_id: cid, page: pg + 1 });
                return;
            }
            // Show player selection menu every time — user picks player, it plays immediately
            showPlayerMenu(id, data.title);
        };

        this.create = function () {
            var _this = this;
            this.build();
            if (!this.card) return;
            this.card
                .on('hover:focus', function (e) {
                    if (data.is_button) $(this).css({ transform: 'scale(1.05)', 'box-shadow': '0 0 0 3px #fff', 'z-index': '10' });
                    if (_this.onFocus) _this.onFocus(e.target, data);
                })
                .on('hover:leave', function () {
                    if (data.is_button) $(this).css({ transform: 'scale(1)', 'box-shadow': 'none', 'z-index': '' });
                })
                .on('hover:enter', function () { _this.play(data.video_id); });
            this.image();
        };

        this.toggle = function () {
            Lampa.Controller.add('items_line', {
                toggle: function () { Lampa.Controller.collectionFocus(false); },
                right: function () { Navigator.move('right'); },
                left:  function () { Navigator.move('left'); },
                down:  function () {},
                up:    function () {},
                gone:  function () {},
                back:  function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle('items_line');
        };

        this.render = function () { return this.card; };
        this.destroy = function () {
            if (this.img) { this.img.onerror = null; this.img.onload = null; this.img.src = ''; }
            if (this.card) this.card.remove();
            this.card = this.img = null;
        };
    }

    // =========================================================
    // KinoLine — horizontal channel row
    // =========================================================
    function KinoLine(data) {
        var content = Lampa.Template.get('items_line', { title: data.title });
        var body    = content.find('.items-line__body');
        var scroll  = new Lampa.Scroll({ horizontal: true, step: 250 });
        var items   = [];
        var active  = 0;
        var last    = null;

        this.onDown = null; this.onUp = null; this.onBack = null; this.onFocus = null;

        this.create = function () {
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

            // "Open full channel" card
            var channelTitle = data.title;
            var channelId    = data.channelId;
            var moreCard = $('<div class="card selector card--wide layer--render layer--visible kino-card kino-card--channel">' +
                '<div class="card__view" style="background:linear-gradient(135deg,#11998e 0%,#38ef7d 100%);border-radius:1.2em;height:100%;position:relative;overflow:hidden;">' +
                    '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;color:white;font-weight:600;font-size:.95em;text-align:center;width:100%;padding:.8em;box-sizing:border-box;">' +
                        '<svg style="width:28px;height:28px;margin-bottom:6px;fill:currentColor;" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>' +
                        '<div>' + channelTitle + '</div>' +
                        '<div style="font-size:.8em;opacity:.85;margin-top:4px;">Весь канал</div>' +
                    '</div>' +
                '</div>' +
                '<div class="card__title" style="display:none;"></div>' +
                '<div class="card__date" style="display:none;"></div>' +
            '</div>');
            moreCard.addClass('card--loaded');
            moreCard.on('hover:focus', function () {
                last = moreCard[0];
                scroll.update(moreCard, true);
            }).on('hover:enter click', function () {
                Lampa.Activity.push({ url: '', title: channelTitle, component: 'kino_channel_view', channel_id: channelId, page: 1 });
            });
            scroll.append(moreCard);
            items.push({ render: function () { return moreCard; }, destroy: function () { moreCard.remove(); } });
        };

        this.toggle = function () {
            var _this = this;
            Lampa.Controller.add('items_line', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(items.length ? last : false, scroll.render());
                },
                right: function () { Navigator.move('right'); },
                left:  function () { Navigator.move('left'); },
                down:  _this.onDown,
                up:    _this.onUp,
                gone:  function () {},
                back:  _this.onBack
            });
            Lampa.Controller.toggle('items_line');
        };

        this.render  = function () { return content; };
        this.destroy = function () { Lampa.Arrays.destroy(items); scroll.destroy(); content.remove(); items = []; };
    }

    // =========================================================
    // KinoChannelView — full single-channel page
    // =========================================================
    function KinoChannelView(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: false });
        var items  = [];
        var html   = $('<div></div>');
        var active = 0;
        var last   = null;

        window.currentKinoChannelData = object;

        this.create = function () {
            var _this = this;
            this.activity.loader(true);
            html.append($('<div class="kino-head" style="display:none;"></div>'));
            var channel = object.channel || { id: object.channel_id || object.id, name: object.title || 'Канал' };
            var page    = object.page || 1;
            KinoApi.fetch(channel, function (videos) {
                scroll.minus();
                html.append(scroll.render());
                videos.forEach(function (v) { _this.append(v); });
                _this.append({ title: 'Показать ещё', img: '', video_id: 'show_more', is_button: true });
                _this.activity.toggle();
                _this.activity.loader(false);
            }, function () { _this.empty(); }, page);
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
                left:  function () { Navigator.move('left'); },
                down:  function () {},
                up:    function () {},
                gone:  function () {},
                back:  _this.back
            });
            Lampa.Controller.toggle('items_line');
        };

        this.start = function () {
            var _this = this;
            if (Lampa.Activity.active().activity !== this.activity) return;
            Lampa.Controller.add('content', {
                toggle: function () { if (items.length) items[active].toggle(); },
                left:   function () { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                right:  function () { Navigator.move('right'); },
                up:     function () { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                down:   function () { if (items.length) items[active].toggle(); },
                back:   _this.back
            });
            Lampa.Controller.toggle('content');
        };

        this.back    = function () { Lampa.Activity.backward(); };
        this.pause   = function () {};
        this.stop    = function () {};
        this.render  = function () { return html; };
        this.destroy = function () { Lampa.Arrays.destroy(items); scroll.destroy(); html.remove(); items = []; };
    }

    // =========================================================
    // KinoComponent — main page (all channels, row per channel)
    // =========================================================
    function KinoComponent(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
        var items  = [];
        var html   = $('<div></div>');
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
            data.forEach(function (el) { _this.append(el); });
            this.activity.toggle();
        };

        this.append = function (element) {
            var item = new KinoLine(element);
            item.create();
            item.onDown  = this.down.bind(this);
            item.onUp    = this.up.bind(this);
            item.onBack  = this.back.bind(this);
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
            if (active < 0) { active = 0; Lampa.Controller.toggle('head'); }
            else { items[active].toggle(); scroll.update(items[active].render()); }
        };

        this.start = function () {
            var _this = this;
            if (Lampa.Activity.active().activity !== this.activity) return;
            Lampa.Controller.add('content', {
                toggle: function () { if (items.length) items[active].toggle(); },
                left:   function () { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                right:  function () { Navigator.move('right'); },
                up:     function () { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                down:   function () { if (items.length) items[active].toggle(); },
                back:   _this.back
            });
            Lampa.Controller.toggle('content');
        };

        this.pause   = function () {};
        this.stop    = function () {};
        this.render  = function () { return html; };
        this.destroy = function () { Lampa.Arrays.destroy(items); scroll.destroy(); html.remove(); items = []; };
    }

    // =========================================================
    // Plugin init
    // =========================================================
    function startPlugin() {
        window.plugin_kinoohlyad_ready = true;

        Lampa.Component.add('kinoohlyad_view', KinoComponent);
        Lampa.Component.add('kino_channel_view', KinoChannelView);

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

        $('body').append('<style id="kinooglad-css">' + [
            '.kino-card{width:calc(25% - 1em)!important;min-width:18em!important;max-width:22em!important;margin:0 1em 1em 0!important;aspect-ratio:16/9;display:inline-block!important;vertical-align:top;}',
            '@media(max-width:768px){.kino-card{width:calc(50% - 1em)!important;min-width:14em!important;max-width:unset!important;}}',
            '.kino-card .card__title{font-size:1em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.2;padding:0 .2em;}',
            '.kino-card .card__view{padding-bottom:56.25%!important;}',
            '.kino-card .card__img{object-fit:cover!important;height:100%!important;border-radius:.3em;}',
            '.kino-card .card__date{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 .2em;}',
            '.kino-yt-overlay{touch-action:none;}',
            '.kino-settings__row{display:flex;flex-direction:column;align-items:flex-start;gap:.25em;padding:.85em 1em;margin-bottom:.4em;border-radius:.5em;background:rgba(255,255,255,.06);min-height:3em;box-sizing:border-box;}',
            '.kino-settings__row.selector:hover,.kino-settings__row.selector.focus{background:rgba(255,255,255,.12);}'
        ].join('') + '</style>');

        // Settings
        if (Lampa.SettingsApi && Lampa.SettingsApi.addParam) {
            if (Lampa.SettingsApi.addComponent) {
                Lampa.SettingsApi.addComponent({
                    component: 'kinooglad_plugin',
                    name: tr('kino_plugin_name'),
                    icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M8 8h8v2H8V8zm0 4h6v2H8v-2zm0 4h8v2H8v-2z" fill="currentColor"/></svg>'
                });
            }

            var component = 'kinooglad_plugin';

            function parseChannelInput(input) {
                var s = (input || '').trim();
                if (!s) return null;
                var m;
                m = s.match(/youtube\.com\/channel\/(UC[\w-]{22})/i) || s.match(/(?:^|\s)(UC[\w-]{22})(?:\s|$)/);
                if (m) return { id: m[1], name: 'Канал' };
                m = s.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
                if (m) return { id: 'vid:' + m[1], name: 'Канал' };
                m = s.match(/(?:youtube\.com\/)?@([\w.-]+)/i) || s.match(/^@?([\w.-]+)$/);
                if (m) return { id: m[1], name: m[1] };
                if (/^UC[\w-]{22}$/.test(s)) return { id: s, name: 'Канал' };
                return null;
            }

            function showMsg(msg, isError) {
                if (Lampa.Noty) Lampa.Noty.show(msg, isError ? 'error' : 'info');
            }

            // Title
            Lampa.SettingsApi.addParam({ component: component, param: { type: 'title' }, field: { name: tr('kino_settings_title') } });

            // Enable toggle
            Lampa.SettingsApi.addParam({
                component: component,
                param: { name: 'kinooglad_enabled', type: 'trigger', default: true },
                field: { name: tr('settings_kinooglad_name'), description: tr('settings_kinooglad_desc') }
            });

            // Player selection button — opens Lampa selectbox
            Lampa.SettingsApi.addParam({
                component: component,
                param: { name: 'kinooglad_player', type: 'button' },
                field: { name: tr('kino_player_name'), description: tr('kino_player_desc') },
                onRender: function (item) {
                    if (!item.find('.settings-param__value').length) item.append('<div class="settings-param__value"></div>');
                    item.find('.settings-param__value').text(getPlayerLabel(getCurrentPlayer()));
                },
                onChange: function () {
                    var current = getCurrentPlayer();
                    var selectItems = PLAYERS.map(function (p) {
                        return { title: (p.id === current ? '✓ ' : '') + p.label, player_id: p.id };
                    });
                    Lampa.Select.show({
                        title: tr('kino_select_player'),
                        items: selectItems,
                        onSelect: function (item) {
                            Lampa.Storage.set('kinooglad_player', item.player_id);
                            if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                        },
                        onBack: function () { Lampa.Controller.toggle('settings_component'); }
                    });
                }
            });

            // Add channel
            Lampa.SettingsApi.addParam({
                component: component,
                param: { name: 'kinooglad_add_channel', type: 'button' },
                field: { name: tr('kino_add_channel_name'), description: tr('kino_add_channel_desc') },
                onChange: function () {
                    Lampa.Input.edit({ title: tr('kino_add_channel_input'), value: '', free: true, nosave: true }, function (value) {
                        var parsed = parseChannelInput(value);
                        if (!parsed) { showMsg('Неверный формат. Используйте @имя, ID канала (UC...) или ссылку YouTube', true); return; }
                        var ch = KinoApi.getChannels();
                        var rawId = String(parsed.id).trim();
                        if (ch.some(function (c) { return String(c.id).trim().toLowerCase() === rawId.toLowerCase(); })) {
                            showMsg('Канал уже добавлен', true); return;
                        }
                        if (/^UC[\w-]{22}$/.test(rawId)) {
                            ch.push({ name: parsed.name, id: parsed.id, active: true });
                            KinoApi.saveChannels(ch);
                            if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                            showMsg('Канал добавлен'); return;
                        }
                        if (rawId.indexOf('vid:') === 0) {
                            showMsg('Поиск канала по видео...');
                            KinoApi.resolveVideoToChannelId(rawId.slice(4), function (err, resolved) {
                                if (!err && resolved) {
                                    if (!ch.some(function (c) { return String(c.id).trim().toLowerCase() === resolved.id.toLowerCase(); })) {
                                        ch.push({ name: resolved.name || parsed.name, id: resolved.id, active: true });
                                        showMsg('Канал добавлен');
                                    } else showMsg('Канал уже добавлен', true);
                                } else showMsg('Не удалось найти канал', true);
                                KinoApi.saveChannels(ch);
                                if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                            });
                        } else {
                            showMsg('Поиск канала...');
                            KinoApi.resolveHandleToChannelId(rawId, function (err, resolved) {
                                if (!err && resolved) {
                                    if (!ch.some(function (c) { return String(c.id).trim() === resolved.id; })) {
                                        ch.push({ name: resolved.name || parsed.name, id: resolved.id, active: true });
                                        showMsg('Канал добавлен');
                                    } else showMsg('Канал уже добавлен', true);
                                } else {
                                    showMsg('Не удалось найти канал. Используйте ID (UC...)', true);
                                    ch.push({ name: parsed.name, id: parsed.id, active: true });
                                }
                                KinoApi.saveChannels(ch);
                                if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                            });
                        }
                    });
                }
            });

            // Reset channels
            Lampa.SettingsApi.addParam({
                component: component,
                param: { name: 'kinooglad_reset', type: 'button' },
                field: { name: tr('kino_reset_name'), description: tr('kino_reset_desc') },
                onChange: function () { KinoApi.saveChannels([]); if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update(); }
            });

            // Per-channel controls
            for (var ci = 0; ci < 50; ci++) {
                (function (idx) {
                    Lampa.SettingsApi.addParam({
                        component: component,
                        param: { name: 'kinooglad_ch_' + idx, type: 'button' },
                        field: { name: '—' },
                        onRender: function (item) {
                            var ch = KinoApi.getChannels()[idx];
                            if (!ch) { item.hide(); return; }
                            item.show();
                            item.find('.settings-param__name').text(ch.name || 'Канал');
                            if (!item.find('.settings-param__value').length) item.append('<div class="settings-param__value"></div>');
                            item.find('.settings-param__value').text(ch.active !== false ? tr('kino_channel_enabled') : tr('kino_channel_disabled'));
                        },
                        onChange: function () {
                            var ch = KinoApi.getChannels();
                            if (!ch[idx]) return;
                            ch[idx].active = !ch[idx].active;
                            KinoApi.saveChannels(ch);
                            var sw = document.querySelector('.activity .scroll') || document.querySelector('.scroll');
                            var st = sw ? sw.scrollTop : 0;
                            if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                            setTimeout(function () { if (sw) sw.scrollTop = st; }, 80);
                        }
                    });
                    Lampa.SettingsApi.addParam({
                        component: component,
                        param: { name: 'kinooglad_ch_' + idx + '_del', type: 'button' },
                        field: { name: tr('kino_channel_delete_btn') },
                        onRender: function (item) {
                            var ch = KinoApi.getChannels()[idx];
                            if (!ch) { item.hide(); return; }
                            item.show();
                            item.find('.settings-param__name').text('🗑 ' + tr('kino_channel_delete_btn') + ': ' + (ch.name || 'Канал'));
                        },
                        onChange: function () {
                            var channels = KinoApi.getChannels();
                            if (!channels[idx]) return;
                            channels.splice(idx, 1);
                            KinoApi.saveChannels(channels);
                            var sw = document.querySelector('.activity .scroll') || document.querySelector('.scroll');
                            var st = sw ? sw.scrollTop : 0;
                            if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                            setTimeout(function () { if (sw) sw.scrollTop = st; }, 80);
                        }
                    });
                })(ci);
            }
        }

        // Menu button
        function addMenu() {
            var getTitle = function () {
                var title = tr('kino_menu_title');
                try {
                    var chs = KinoApi.getChannels().filter(function (c) { return c.active !== false; });
                    if (chs.length === 1 && chs[0].name) title = chs[0].name;
                } catch (e) {}
                return title;
            };

            var btn = $('<li class="menu__item selector" data-action="kinoohlyad">' +
                '<div class="menu__ico"><svg height="24" viewBox="0 0 24 24" width="24" fill="none">' +
                '<circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5"/>' +
                '<path d="M8 8h8v2H8V8zm0 4h6v2H8v-2zm0 4h8v2H8v-2z" fill="white"/>' +
                '</svg></div>' +
                '<div class="menu__text">' + getTitle() + '</div>' +
            '</li>');

            btn.on('hover:enter click', function () {
                Lampa.Activity.push({ url: '', title: getTitle(), component: 'kinoohlyad_view', page: 1 });
            });
            $('.menu .menu__list').eq(0).append(btn);
        }

        var enabled = Lampa.Storage.get('kinooglad_enabled', true);
        if (enabled) {
            if (window.appready) addMenu();
            else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') addMenu(); });
        }
    }

    startPlugin();

})();
