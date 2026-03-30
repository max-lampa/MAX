/**
 * Lampa Trailer Player Manager v2
 * Intercepts Lampa.YouTube.play() and opens trailers in external players.
 * Supports: VLC, MX Player, ViMU, DDD Player, YouTube App, Browser, Built-in.
 *
 * Fixed: uses window.Android.openUrl() + app URI schemes instead of intent://
 *
 * Install: Lampa → Settings → Plugins → paste URL
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
        try { return Lampa.Storage.get(STORAGE_KEY, 'lampa') || 'lampa'; } catch (e) { return 'lampa'; }
    }

    function savePlayer(id) {
        try { Lampa.Storage.set(STORAGE_KEY, id); } catch (e) {}
    }

    function getLabelById(id) {
        for (var i = 0; i < PLAYERS.length; i++) {
            if (PLAYERS[i].id === id) return PLAYERS[i].label;
        }
        return id;
    }

    // =========================================================
    // Universal URL opener for Lampa WebView
    //
    // Priority:
    //   1. window.Android.openUrl(url)   — native Lampa bridge (most reliable)
    //   2. Lampa.Platform.openWindow(url) — Lampa platform API
    //   3. window.open(url, '_blank')     — triggers shouldOverrideUrlLoading
    //      for custom schemes (vlc://, vnd.youtube:, etc.)
    //
    // NEVER use window.location.href for app URIs — it navigates
    // the WebView itself and shows "cannot open page" error.
    // =========================================================
    function openUrl(url) {
        // 1. Native Android bridge (exposed by Lampa app)
        if (typeof Android !== 'undefined') {
            if (typeof Android.openUrl === 'function')  { Android.openUrl(url); return; }
            if (typeof Android.startUrl === 'function') { Android.startUrl(url); return; }
        }
        // 2. Lampa platform API
        if (Lampa.Platform && typeof Lampa.Platform.openWindow === 'function') {
            Lampa.Platform.openWindow(url);
            return;
        }
        // 3. window.open — works for custom schemes in most WebViews
        window.open(url, '_blank');
    }

    // =========================================================
    // App URI schemes for each player
    //
    // These are handled by Android's shouldOverrideUrlLoading:
    // the system sees the custom scheme and opens the right app.
    //
    // VLC      : vlc://https://youtube.com/watch?v=ID
    // MX Player: no simple scheme — use system chooser via Lampa.Platform
    // ViMU     : vimu://https://youtube.com/watch?v=ID
    // DDD      : ddd://https://youtube.com/watch?v=ID
    // YouTube  : vnd.youtube:ID  (registered by YouTube app)
    // Browser  : https://youtu.be/ID
    // =========================================================
    function playExternal(videoId, playerId) {
        var watchUrl = 'https://www.youtube.com/watch?v=' + videoId;
        var shortUrl = 'https://youtu.be/' + videoId;

        switch (playerId) {
            case 'vlc':
                openUrl('vlc://' + watchUrl);
                break;

            case 'mx':
                // MX Player: try mx scheme, fallback to system chooser
                // If Android bridge available, pass YouTube URL — system chooser pops up
                if (typeof Android !== 'undefined' && typeof Android.openUrl === 'function') {
                    Android.openUrl(watchUrl);
                } else if (Lampa.Platform && Lampa.Platform.openWindow) {
                    Lampa.Platform.openWindow(watchUrl);
                } else {
                    window.open(watchUrl, '_blank');
                }
                break;

            case 'vimu':
                openUrl('vimu://' + watchUrl);
                break;

            case 'ddd':
                openUrl('ddd://' + watchUrl);
                break;

            case 'youtube':
                // vnd.youtube: is the standard YouTube app deep-link scheme
                openUrl('vnd.youtube:' + videoId);
                break;

            case 'browser':
                openUrl(shortUrl);
                break;

            default:
                openUrl(shortUrl);
        }
    }

    // =========================================================
    // Player selection menu (Lampa selectbox — пульт OK)
    // =========================================================
    function showPlayerMenu(title, onSelect) {
        var current = getCurrentPlayer();
        var items = PLAYERS.map(function (p) {
            return { title: (p.id === current ? '✓ ' : '') + p.label, player_id: p.id };
        });
        Lampa.Select.show({
            title: title || 'Выбрать плеер',
            items: items,
            onSelect: function (item) {
                savePlayer(item.player_id);
                if (onSelect) onSelect(item.player_id);
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
            }
        });
    }

    // =========================================================
    // Hook Lampa.YouTube.play — called for ALL trailers
    // =========================================================
    function installHook() {
        if (!Lampa.YouTube || typeof Lampa.YouTube.play !== 'function') {
            setTimeout(installHook, 400);
            return;
        }

        var _original = Lampa.YouTube.play.bind(Lampa.YouTube);
        // Save original for test button
        Lampa.YouTube._trailerPlayerOriginal = _original;

        Lampa.YouTube.play = function (videoId) {
            var mode = getCurrentPlayer();
            if (mode === 'lampa') {
                _original(videoId);
            } else {
                playExternal(videoId, mode);
            }
        };

        // Hook Lampa.Player for youtube-flagged items (newer Lampa versions)
        if (Lampa.Player && typeof Lampa.Player.play === 'function') {
            var _origPlayer = Lampa.Player.play.bind(Lampa.Player);
            Lampa.Player.play = function (item) {
                if (item && (item.youtube || isYouTubeUrl(item.url || ''))) {
                    var mode = getCurrentPlayer();
                    if (mode !== 'lampa') {
                        var vid = item.id || extractVideoId(item.url || '');
                        if (vid) { playExternal(vid, mode); return; }
                    }
                }
                _origPlayer(item);
            };
        }

        console.log('[TrailerPlayer] Installed. Player:', getCurrentPlayer());
    }

    function isYouTubeUrl(url) {
        return url && (url.indexOf('youtube.com') !== -1 || url.indexOf('youtu.be') !== -1);
    }

    function extractVideoId(url) {
        var m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        return m ? m[1] : null;
    }

    // =========================================================
    // Settings
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

        var comp = 'trailer_player_plugin';

        Lampa.SettingsApi.addParam({ component: comp, param: { type: 'title' }, field: { name: 'Плеер трейлеров' } });

        // Player selector
        Lampa.SettingsApi.addParam({
            component: comp,
            param: { name: STORAGE_KEY, type: 'button' },
            field: { name: 'Плеер для трейлеров', description: 'Выберите приложение для воспроизведения трейлеров' },
            onRender: function (item) {
                if (!item.find('.settings-param__value').length) item.append('<div class="settings-param__value"></div>');
                item.find('.settings-param__value').text(getLabelById(getCurrentPlayer()));
            },
            onChange: function () {
                showPlayerMenu('Плеер для трейлеров', function () {
                    if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                });
            }
        });

        // Test button
        Lampa.SettingsApi.addParam({
            component: comp,
            param: { name: 'trailer_player_test', type: 'button' },
            field: { name: 'Тест плеера', description: 'Запустить тестовое видео через выбранный плеер' },
            onChange: function () {
                var testId = 'aqz-KE-bpKQ'; // Big Buck Bunny trailer
                var mode = getCurrentPlayer();
                if (mode === 'lampa') {
                    var orig = (Lampa.YouTube && Lampa.YouTube._trailerPlayerOriginal) || (Lampa.YouTube && Lampa.YouTube.play);
                    if (orig) orig(testId);
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

    if (window.appready) {
        init();
    } else if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
    } else {
        setTimeout(init, 1000);
    }

})();
