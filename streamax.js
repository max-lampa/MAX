// @name Заставка — Атмосфера
// @version 3.3.0
// @description Заставка с IPTV-потоками. Поддержка Android TV 9+ (hls.js)
// @author проект MaxTV | LampaUa.
(function () {
    'use strict';

    // Защита от двойной загрузки плагина
    if (window.__atmosfera_loaded) return;
    window.__atmosfera_loaded = true;

    // =========================================================
    // СПИСОК ПОТОКОВ
    // Все потоки проверены: HTTP 200 + кодек H.264 (avc1)
    // =========================================================
    var streams = [
        // --- Камин (реальный Fireplace 24/7 от Pluto TV) ---
        {
            name: 'Камин',
            url:  'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/612ce23f51cce000078eeed5/master.m3u8?deviceId=channel&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=channel&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed'
        },
        // --- Природа / Релакс (Pluto TV каналы, H.264 подтверждён) ---
        {
            name: 'Naturescape',
            url:  'https://jmp2.uk/plu-5812bd9f249444e05d09cc4e.m3u8'
        },
        {
            name: 'ZenLIFE',
            url:  'https://jmp2.uk/plu-696998dfa2b623e8b20125a3.m3u8'
        },
        {
            name: 'Love Nature',
            url:  'https://jmp2.uk/plu-66df8a29b25d2b0008fc5fe0.m3u8'
        },
        {
            name: 'BBC Earth',
            url:  'https://jmp2.uk/plu-656535fc2c46f30008870fae.m3u8'
        },
        // --- Пейзажи / Путешествия (CloudFront CDN, H.264 подтверждён) ---
        {
            name: 'Holidayscapes',
            url:  'https://d10cyxntpn0bwm.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-udbgiwo3vva3o/master.m3u8'
        },
        // --- Природа (Amagi / Wurl / BozzTV CDN, H.264 подтверждён) ---
        {
            name: 'Природа',
            url:  'https://tgn.bozztv.com/betterlife/betternature/betternature/index.m3u8'
        },
        {
            name: 'Stingray Nature',
            url:  'https://stream.ads.ottera.tv/cl/240211cn4j7g65sur7fq378vpg/1920x1080_5711200_3_f.m3u8'
        },
        {
            name: 'Дикая природа',
            url:  'https://amg00861-amg00861c4-firetv-us-4724.playouts.now.amagi.tv/playlist.m3u8'
        },
        {
            name: 'PBS Nature',
            url:  'https://amg02333-pbs-amg02333c8-firetv-us-4239.playouts.now.amagi.tv/playlist.m3u8'
        },
        {
            name: 'DroneTV',
            url:  'https://airvuz-dronetv-1-us.ohlscdn.wurl.tv/playlist.m3u8'
        },
        {
            name: 'TeleAmbiente',
            url:  'https://5f22d76e220e1.streamlock.net/teleambiente2024/teleambiente2024/playlist.m3u8'
        }
    ];

    // Значения для выпадающего списка: ключ = название (Lampa сохраняет/возвращает точное имя)
    var streamValues = { 'random': 'Случайный' };
    streams.forEach(function(s) { streamValues[s.name] = s.name; });

    var timer;
    var screensaverDiv  = null;
    var currentIndex    = 0;
    var tryList         = [];
    var hlsInstance     = null;
    var settingsAdded   = false;

    // =========================================================
    // ЗАГРУЗКА HLS.JS — обязательно для Android TV 9 WebView
    // =========================================================
    function loadHlsJs(callback) {
        if (window.Hls) { callback(); return; }
        var script   = document.createElement('script');
        script.src   = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js';
        script.onload = callback;
        script.onerror = function() {
            var s2    = document.createElement('script');
            s2.src    = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.13/hls.min.js';
            s2.onload = callback;
            s2.onerror = callback;
            document.head.appendChild(s2);
        };
        document.head.appendChild(script);
    }

    // =========================================================
    // ВЫБОР ПОТОКА — точный поиск по имени, без числовых индексов
    // =========================================================
    function buildTryList() {
        var chosen = Lampa.Storage.get('fireplace_stream', 'random');

        if (!chosen || chosen === 'random') {
            tryList = streams.slice().sort(function() { return Math.random() - 0.5; });
        } else {
            var selected = null;
            var fallback = [];
            streams.forEach(function(s) {
                if (s.name === chosen) { selected = s; }
                else { fallback.push(s); }
            });
            tryList = selected ? [selected].concat(fallback)
                               : streams.slice().sort(function() { return Math.random() - 0.5; });
        }
        currentIndex = 0;
    }

    // =========================================================
    // ПОКАЗ ЗАСТАВКИ
    // =========================================================
    function showFireplace() {
        if (screensaverDiv) return;
        if (window.Lampa && Lampa.Activity && Lampa.Activity.active() &&
            Lampa.Activity.active().component === 'player') return;

        loadHlsJs(function() {
            buildTryList();

            var soundSetting   = Lampa.Storage.get('fireplace_sound');
            var isSoundEnabled = (soundSetting !== 'false' && soundSetting !== false);
            var volumeLevel    = parseInt(Lampa.Storage.get('fireplace_volume', '70')) / 100;

            screensaverDiv = document.createElement('div');
            screensaverDiv.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:9999999;';

            var video       = document.createElement('video');
            video.style     = 'width:100%;height:100%;object-fit:cover;';
            video.volume    = volumeLevel;
            video.muted     = !isSoundEnabled;
            video.preload   = 'none';
            video.setAttribute('playsinline', '');

            // Название канала (плавно исчезает через 4 сек)
            var label       = document.createElement('div');
            label.style     = 'position:absolute;bottom:40px;left:50%;transform:translateX(-50%);' +
                              'color:#fff;font-family:sans-serif;font-size:22px;' +
                              'text-shadow:0 2px 8px rgba(0,0,0,0.9);opacity:0;' +
                              'transition:opacity 0.6s;pointer-events:none;white-space:nowrap;';

            // Подсказка «ОК для звука»
            var hint        = document.createElement('div');
            hint.style      = 'position:absolute;bottom:30px;right:30px;color:#fff;' +
                              'font-family:sans-serif;font-size:18px;opacity:0;transition:opacity 0.5s;';
            hint.innerText  = 'Нажмите ОК для звука';

            screensaverDiv.appendChild(video);
            screensaverDiv.appendChild(label);
            screensaverDiv.appendChild(hint);
            document.body.appendChild(screensaverDiv);

            loadStream(video, label, hint, isSoundEnabled, volumeLevel);
        });
    }

    function loadStream(video, label, hint, isSoundEnabled, volumeLevel) {
        if (!screensaverDiv) return;
        if (currentIndex >= tryList.length) { hideFireplace(); return; }

        var stream = tryList[currentIndex];

        if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }

        label.innerText     = stream.name;
        label.style.opacity = '0.85';
        setTimeout(function() { if (label) label.style.opacity = '0'; }, 4000);

        var nextStream = function() {
            currentIndex++;
            setTimeout(function() { loadStream(video, label, hint, isSoundEnabled, volumeLevel); }, 500);
        };

        function tryPlay() {
            video.volume = volumeLevel;
            video.muted  = !isSoundEnabled;
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
                // Оптимизировано для Android TV 9 — маленький буфер, быстрый старт
                maxBufferLength:      8,
                maxMaxBufferLength:   16,
                maxBufferSize:        20 * 1000 * 1000, // 20 МБ
                backBufferLength:     0,
                startLevel:           -1,               // авто-выбор качества
                capLevelToPlayerSize: true,
                // Быстрое снижение качества при слабом интернете
                abrEwmaFastLive:      3,
                abrEwmaSlowLive:      9,
                abrBandWidthFactor:   0.7,
                abrBandWidthUpFactor: 0.5,
                enableWorker:         false,            // без Web Worker в WebView
                lowLatencyMode:       false
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
            video.src     = stream.url;
            video.onerror = nextStream;
            tryPlay();
        } else {
            video.src     = stream.url;
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
        var mins = parseInt(Lampa.Storage.get('fireplace_timeout', '5'));
        timer = setTimeout(showFireplace, mins * 60 * 1000);
    }

    // =========================================================
    // НАСТРОЙКИ
    // =========================================================
    function addSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        if (settingsAdded) return;
        settingsAdded = true;

        Lampa.SettingsApi.addComponent({
            component: 'fireplace_settings',
            name: 'Атмосфера',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'fireplace_settings',
            param: { name: 'fireplace_stream', type: 'select', values: streamValues, default: 'random' },
            field:  { name: 'Канал заставки', description: 'Выберите поток или оставьте "Случайный"' }
        });

        Lampa.SettingsApi.addParam({
            component: 'fireplace_settings',
            param: {
                name: 'fireplace_timeout', type: 'select',
                values: { '1':'1 минута','2':'2 минуты','3':'3 минуты','5':'5 минут','10':'10 минут','15':'15 минут' },
                default: '5'
            },
            field: { name: 'Время активации', description: 'Время бездействия до включения заставки' },
            onChange: function() { resetTimer(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'fireplace_settings',
            param: { name: 'fireplace_sound', type: 'select', values: { 'true':'Включено','false':'Отключено' }, default: 'true' },
            field:  { name: 'Звук', description: 'Включить или отключить звук потока' }
        });

        Lampa.SettingsApi.addParam({
            component: 'fireplace_settings',
            param: { name: 'fireplace_volume', type: 'select', values: { '10':'10%','30':'30%','50':'50%','70':'70%','90':'90%','100':'100%' }, default: '70' },
            field:  { name: 'Громкость', description: 'Уровень громкости' }
        });
    }

    // =========================================================
    // ОБРАБОТКА СОБЫТИЙ
    // =========================================================
    var events = ['keydown', 'mousemove', 'click', 'touchstart', 'wheel'];
    events.forEach(function(e) {
        window.addEventListener(e, function(ev) {
            if (screensaverDiv) {
                var v        = screensaverDiv.querySelector('video');
                var sVal     = Lampa.Storage.get('fireplace_sound');
                var sEnabled = (sVal !== 'false' && sVal !== false);
                // Первое нажатие ОК — включаем звук, если браузер заглушил автозапуск
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

    // =========================================================
    // ЗАПУСК
    // =========================================================
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
