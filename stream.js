// @name Заставка — Атмосфера
// @version 3.1.0
// @description Заставка с IPTV-потоками. Поддержка Android TV 9+ (hls.js)
// @author проект MaxTV | LampaUa.
(function () {
    'use strict';

    // Защита от двойной загрузки плагина
    if (window.__atmosfera_loaded) return;
    window.__atmosfera_loaded = true;

    // === СПИСОК ПОТОКОВ (только HTTPS — работают на Android TV 9) ===
    var streams = [
        { name: 'Аквариум',        url: 'https://d2esizdt2xkmhp.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-qw5vkd4gzoaia/SONO60.m3u8' },
        { name: 'Камин',           url: 'https://d10cyxntpn0bwm.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-udbgiwo3vva3o/master.m3u8' },
        { name: 'Природа',         url: 'https://tgn.bozztv.com/betterlife/betternature/betternature/index.m3u8' },
        { name: 'Stingray Nature', url: 'https://stream.ads.ottera.tv/cl/240211cn4j7g65sur7fq378vpg/1920x1080_5711200_3_f.m3u8' },
        { name: 'Дикая природа',   url: 'https://amg00861-amg00861c4-firetv-us-4724.playouts.now.amagi.tv/playlist.m3u8' },
        { name: 'PBS Nature',      url: 'https://amg02333-pbs-amg02333c8-firetv-us-4239.playouts.now.amagi.tv/playlist.m3u8' },
        { name: 'DroneTV',         url: 'https://airvuz-dronetv-1-us.ohlscdn.wurl.tv/playlist.m3u8' },
        { name: 'Journy Travel',   url: 'https://linear-291.frequency.stream/dist/ovationtv/291/hls/master/playlist.m3u8' },
        { name: 'Deluxe Lounge',   url: 'https://d46c0ebf9ef94053848fdd7b1f2f6b90.mediatailor.eu-central-1.amazonaws.com/v1/master/81bfcafb76f9c947b24574657a9ce7fe14ad75c0/live-prod/9a087b26-8be4-11eb-a7de-bacfe1f83627/0/master.m3u8' }
    ];

    // Значения для выпадающего списка (ключ = название канала)
    var streamValues = { 'random': 'Случайный' };
    streams.forEach(function(s) { streamValues[s.name] = s.name; });

    var timer;
    var screensaverDiv = null;
    var currentStreamIndex = 0;
    var tryList = [];
    var hlsInstance = null;
    var settingsAdded = false; // защита от дублирования настроек

    // === ЗАГРУЗКА HLS.JS ===
    function loadHlsJs(callback) {
        if (window.Hls) { callback(); return; }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js';
        script.onload = callback;
        script.onerror = function() {
            var s2 = document.createElement('script');
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.13/hls.min.js';
            s2.onload = callback;
            s2.onerror = callback;
            document.head.appendChild(s2);
        };
        document.head.appendChild(script);
    }

    // === ВЫБОР ПОТОКА ===
    function buildTryList() {
        var chosen = Lampa.Storage.get('fireplace_stream', 'random');
        if (!chosen || chosen === 'random') {
            tryList = streams.slice().sort(function() { return Math.random() - 0.5; });
        } else {
            var main = streams.filter(function(s) { return s.name === chosen; });
            var rest = streams.filter(function(s) { return s.name !== chosen; });
            tryList = main.length ? main.concat(rest) : streams.slice().sort(function() { return Math.random() - 0.5; });
        }
        currentStreamIndex = 0;
    }

    // === ЛОГИКА ЗАСТАВКИ ===
    function showFireplace() {
        if (screensaverDiv) return;
        if (window.Lampa && Lampa.Activity && Lampa.Activity.active() && Lampa.Activity.active().component === 'player') return;

        loadHlsJs(function() {
            buildTryList();

            var soundSetting = Lampa.Storage.get('fireplace_sound');
            var isSoundEnabled = (soundSetting !== 'false' && soundSetting !== false);
            var volumeLevel = parseInt(Lampa.Storage.get('fireplace_volume', '70')) / 100;

            screensaverDiv = document.createElement('div');
            screensaverDiv.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:9999999;';

            var video = document.createElement('video');
            video.style = 'width:100%;height:100%;object-fit:cover;';
            video.volume = volumeLevel;
            video.muted = !isSoundEnabled;
            // Подсказки для браузера — помогают снизить лаги
            video.preload = 'none';
            video.setAttribute('playsinline', '');

            var label = document.createElement('div');
            label.style = 'position:absolute;bottom:40px;left:50%;transform:translateX(-50%);color:#fff;font-family:sans-serif;font-size:22px;text-shadow:0 2px 8px rgba(0,0,0,0.9);opacity:0;transition:opacity 0.6s;pointer-events:none;white-space:nowrap;';

            var hint = document.createElement('div');
            hint.style = 'position:absolute;bottom:30px;right:30px;color:#fff;font-family:sans-serif;font-size:18px;opacity:0;transition:opacity 0.5s;';
            hint.innerText = 'Нажмите ОК для звука';

            screensaverDiv.appendChild(video);
            screensaverDiv.appendChild(label);
            screensaverDiv.appendChild(hint);
            document.body.appendChild(screensaverDiv);

            loadStream(video, label, hint, isSoundEnabled, volumeLevel);
        });
    }

    function loadStream(video, label, hint, isSoundEnabled, volumeLevel) {
        if (!screensaverDiv) return;
        if (currentStreamIndex >= tryList.length) { hideFireplace(); return; }

        var stream = tryList[currentStreamIndex];

        if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }

        label.innerText = stream.name;
        label.style.opacity = '0.85';
        setTimeout(function() { if (label) label.style.opacity = '0'; }, 4000);

        var nextStream = function() {
            currentStreamIndex++;
            setTimeout(function() { loadStream(video, label, hint, isSoundEnabled, volumeLevel); }, 500);
        };

        function tryPlay() {
            video.volume = volumeLevel;
            video.muted = !isSoundEnabled;
            var p = video.play();
            if (p !== undefined) {
                p.catch(function() {
                    video.muted = true;
                    video.play().catch(nextStream);
                    if (isSoundEnabled) hint.style.opacity = '0.7';
                });
            }
        }

        if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                // Маленький буфер — меньше задержки старта на Android TV
                maxBufferLength: 8,
                maxMaxBufferLength: 16,
                maxBufferSize: 20 * 1000 * 1000, // 20 МБ макс.
                backBufferLength: 0,              // не держать прошлое в памяти
                // Авто-выбор качества с приоритетом на низкое (меньше лагов)
                startLevel: -1,
                capLevelToPlayerSize: true,
                // Настройки ABR — быстро снижать качество при слабой сети
                abrEwmaFastLive: 3,
                abrEwmaSlowLive: 9,
                abrBandWidthFactor: 0.7,
                abrBandWidthUpFactor: 0.5,
                // Без Web Worker — экономит ресурсы WebView на Android TV
                enableWorker: false,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(stream.url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() { tryPlay(); });
            hlsInstance.on(Hls.Events.ERROR, function(evt, data) {
                if (data.fatal) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    nextStream();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream.url;
            video.onerror = nextStream;
            tryPlay();
        } else {
            video.src = stream.url;
            video.onerror = nextStream;
            tryPlay();
        }
    }

    function hideFireplace() {
        if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
        if (screensaverDiv) {
            var v = screensaverDiv.querySelector('video');
            if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
            screensaverDiv.remove();
            screensaverDiv = null;
        }
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(timer);
        var timeoutMinutes = parseInt(Lampa.Storage.get('fireplace_timeout', '5'));
        timer = setTimeout(showFireplace, timeoutMinutes * 60 * 1000);
    }

    // === НАСТРОЙКИ ===
    function addSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        if (settingsAdded) return; // не добавлять повторно
        settingsAdded = true;

        Lampa.SettingsApi.addComponent({
            component: 'fireplace_settings',
            name: 'Атмосфера',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'fireplace_settings',
            param: { name: 'fireplace_stream', type: 'select', values: streamValues, default: 'random' },
            field: { name: 'Канал заставки', description: 'Выберите поток или оставьте "Случайный"' }
        });

        Lampa.SettingsApi.addParam({
            component: 'fireplace_settings',
            param: {
                name: 'fireplace_timeout',
                type: 'select',
                values: { '1': '1 минута', '2': '2 минуты', '3': '3 минуты', '5': '5 минут', '10': '10 минут', '15': '15 минут' },
                default: '5'
            },
            field: { name: 'Время активации', description: 'Время бездействия до включения заставки' },
            onChange: function() { resetTimer(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'fireplace_settings',
            param: { name: 'fireplace_sound', type: 'select', values: { 'true': 'Включено', 'false': 'Отключено' }, default: 'true' },
            field: { name: 'Звук', description: 'Включить или отключить звук потока' }
        });

        Lampa.SettingsApi.addParam({
            component: 'fireplace_settings',
            param: {
                name: 'fireplace_volume',
                type: 'select',
                values: { '10': '10%', '30': '30%', '50': '50%', '70': '70%', '90': '90%', '100': '100%' },
                default: '70'
            },
            field: { name: 'Громкость', description: 'Уровень громкости' }
        });
    }

    // === ОБРАБОТКА СОБЫТИЙ ===
    var events = ['keydown', 'mousemove', 'click', 'touchstart', 'wheel'];
    events.forEach(function(e) {
        window.addEventListener(e, function(ev) {
            if (screensaverDiv) {
                var v = screensaverDiv.querySelector('video');
                var sEnabled = (Lampa.Storage.get('fireplace_sound') !== 'false' && Lampa.Storage.get('fireplace_sound') !== false);
                if (v && v.muted && sEnabled && (ev.type === 'keydown' || ev.type === 'click')) {
                    v.muted = false;
                    var h = screensaverDiv.querySelector('div:last-child');
                    if (h) h.style.opacity = '0';
                    ev.preventDefault();
                    return;
                }
                hideFireplace();
            } else {
                resetTimer();
            }
        });
    });

    // === ЗАПУСК ===
    if (window.appready) {
        addSettings();
        resetTimer();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                addSettings();
                resetTimer();
            }
        });
    }
})();
