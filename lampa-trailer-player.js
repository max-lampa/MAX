/**
 * Lampa Trailer Player Manager
 * Intercepts Lampa's YouTube trailer player and adds external player support:
 * VLC, MX Player, ViMU, DDD Player, YouTube App, Browser, Built-in.
 *
 * Install: paste URL into Lampa → Settings → Plugins
 */
(function () {
    'use strict';

    if (window.plugin_trailer_player_ready) return;
    window.plugin_trailer_player_ready = true;

    // =========================================================
    // Player list
    // =========================================================
    var PLAYERS = [
        { id: 'lampa',   label: 'Встроенный (Lampa)' },
        { id: 'vlc',     label: 'VLC Player' },
        { id: 'mx',      label: 'MX Player' },
        { id: 'vimu',    label: 'ViMU Player' },
        { id: 'ddd',     label: 'DDD Player' },
        { id: 'youtube', label: 'YouTube App' },
        { id: 'browser', label: 'Браузер' }
    ];

    var STORAGE_KEY = 'trailer_player_mode';

    function getCurrentPlayer() {
        return (Lampa.Storage && Lampa.Storage.get)
            ? (Lampa.Storage.get(STORAGE_KEY, 'lampa') || 'lampa')
            : 'lampa';
    }

    function savePlayer(id) {
        if (Lampa.Storage && Lampa.Storage.set) Lampa.Storage.set(STORAGE_KEY, id);
    }

    function getLabelById(id) {
        for (var i = 0; i < PLAYERS.length; i++) {
            if (PLAYERS[i].id === id) return PLAYERS[i].label;
        }
        return id;
    }

    // =========================================================
    // Android Intent URI builder + launcher
    // window.location.href is the only reliable way from WebView
    // =========================================================
    function buildIntent(videoUrl, packageName) {
        var stripped = videoUrl.replace(/^https?:\/\//, '');
        return 'intent://' + stripped + '#Intent;scheme=https;package=' + packageName + ';end';
    }

    function openInBrowser(url) {
        if (Lampa.Platform && Lampa.Platform.openWindow) {
            Lampa.Platform.openWindow(url);
        } else {
            window.open(url, '_blank');
        }
    }

    function launchIntent(intentUri, fallbackUrl) {
        var isAndroid = /android/i.test(navigator.userAgent) || (typeof Android !== 'undefined');
        if (!isAndroid) { openInBrowser(fallbackUrl); return; }

        // Cancel fallback if app launched (page becomes hidden)
        var fallbackTimer = setTimeout(function () { openInBrowser(fallbackUrl); }, 2000);
        document.addEventListener('visibilitychange', function onVis() {
            if (document.hidden) {
                clearTimeout(fallbackTimer);
                document.removeEventListener('visibilitychange', onVis);
            }
        });
        try { window.location.href = intentUri; }
        catch (e) { clearTimeout(fallbackTimer); openInBrowser(fallbackUrl); }
    }

    // =========================================================
    // Play in external app by player id
    // =========================================================
    function playExternal(videoId, playerId) {
        var watchUrl = 'https://www.youtube.com/watch?v=' + videoId;
        var shortUrl = 'https://youtu.be/' + videoId;

        switch (playerId) {
            case 'vlc':
                launchIntent(buildIntent(watchUrl, 'org.videolan.vlc'), watchUrl);
                break;
            case 'mx':
                launchIntent(buildIntent(watchUrl, 'com.mxtech.videoplayer.ad'), watchUrl);
                break;
            case 'vimu':
                launchIntent(buildIntent(watchUrl, 'litvak.ru.vimu'), watchUrl);
                break;
            case 'ddd':
                launchIntent(buildIntent(watchUrl, 'com.ddd.player'), watchUrl);
                break;
            case 'youtube':
                launchIntent(
                    'intent://www.youtube.com/watch?v=' + videoId + '#Intent;scheme=https;package=com.google.android.youtube;end',
                    shortUrl
                );
                break;
            case 'browser':
                openInBrowser(shortUrl);
                break;
            default:
                openInBrowser(shortUrl);
        }
    }

    // =========================================================
    // Player selection menu via Lampa Select (пульт-friendly)
    // =========================================================
    function showPlayerMenu(videoId, originalPlayFn) {
        var current = getCurrentPlayer();

        var items = PLAYERS.map(function (p) {
            return {
                title: (p.id === current ? '✓ ' : '') + p.label,
                player_id: p.id
            };
        });

        Lampa.Select.show({
            title: 'Выбрать плеер',
            items: items,
            onSelect: function (item) {
                savePlayer(item.player_id);
                if (item.player_id === 'lampa') {
                    // Call original built-in player
                    originalPlayFn(videoId);
                } else {
                    playExternal(videoId, item.player_id);
                }
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
            }
        });
    }

    // =========================================================
    // Hook into Lampa.YouTube.play
    // This is called for ALL trailers in Lampa
    // =========================================================
    function installHook() {
        if (!Lampa.YouTube || typeof Lampa.YouTube.play !== 'function') {
            // Retry later if not loaded yet
            setTimeout(installHook, 300);
            return;
        }

        var _originalPlay = Lampa.YouTube.play.bind(Lampa.YouTube);

        Lampa.YouTube.play = function (videoId) {
            var mode = getCurrentPlayer();
            if (mode === 'lampa') {
                // Built-in: skip menu and play directly
                _originalPlay(videoId);
            } else {
                // External: play directly with saved player (no menu popup every time)
                playExternal(videoId, mode);
            }
        };

        // Also intercept Lampa.Player if it has youtube mode
        if (Lampa.Player && typeof Lampa.Player.play === 'function') {
            var _originalPlayerPlay = Lampa.Player.play.bind(Lampa.Player);
            Lampa.Player.play = function (item) {
                // Only intercept YouTube items (trailers)
                if (item && (item.youtube || (item.url && item.url.indexOf('youtube.com') !== -1) || (item.url && item.url.indexOf('youtu.be') !== -1))) {
                    var mode = getCurrentPlayer();
                    if (mode !== 'lampa') {
                        var vid = item.id || extractVideoId(item.url || '');
                        if (vid) { playExternal(vid, mode); return; }
                    }
                }
                _originalPlayerPlay(item);
            };
        }

        console.log('[TrailerPlayer] Hook installed, current player:', getCurrentPlayer());
    }

    function extractVideoId(url) {
        var m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        return m ? m[1] : null;
    }

    // =========================================================
    // Settings — visible in Lampa Settings → Plugins
    // =========================================================
    function registerSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addParam) return;

        if (Lampa.SettingsApi.addComponent) {
            Lampa.SettingsApi.addComponent({
                component: 'trailer_player_plugin',
                name: 'Плеер трейлеров',
                icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
            });
        }

        var component = 'trailer_player_plugin';

        // Title
        Lampa.SettingsApi.addParam({
            component: component,
            param: { type: 'title' },
            field: { name: 'Плеер трейлеров' }
        });

        // Player selector button
        Lampa.SettingsApi.addParam({
            component: component,
            param: { name: STORAGE_KEY, type: 'button' },
            field: {
                name: 'Плеер для трейлеров',
                description: 'Выберите приложение для воспроизведения трейлеров (YouTube)'
            },
            onRender: function (item) {
                if (!item.find('.settings-param__value').length)
                    item.append('<div class="settings-param__value"></div>');
                item.find('.settings-param__value').text(getLabelById(getCurrentPlayer()));
            },
            onChange: function () {
                var current = getCurrentPlayer();
                var selectItems = PLAYERS.map(function (p) {
                    return {
                        title: (p.id === current ? '✓ ' : '') + p.label,
                        player_id: p.id
                    };
                });
                Lampa.Select.show({
                    title: 'Плеер для трейлеров',
                    items: selectItems,
                    onSelect: function (item) {
                        savePlayer(item.player_id);
                        if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('settings_component');
                    }
                });
            }
        });

        // "Test" button — play a test YouTube video
        Lampa.SettingsApi.addParam({
            component: component,
            param: { name: 'trailer_player_test', type: 'button' },
            field: {
                name: 'Тест плеера',
                description: 'Запустить тестовый трейлер через выбранный плеер'
            },
            onChange: function () {
                var mode = getCurrentPlayer();
                var testId = 'dQw4w9WgXcQ'; // test YouTube video
                if (mode === 'lampa') {
                    if (Lampa.YouTube && Lampa.YouTube.play) {
                        // Call original (bypass hook)
                        Lampa.YouTube._originalPlay
                            ? Lampa.YouTube._originalPlay(testId)
                            : Lampa.YouTube.play(testId);
                    }
                } else {
                    playExternal(testId, mode);
                }
            }
        });
    }

    // =========================================================
    // Init
    // =========================================================
    function init() {
        registerSettings();
        installHook();
    }

    // Wait for Lampa to be ready
    if (window.appready) {
        init();
    } else if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    } else {
        setTimeout(init, 1000);
    }

})();
