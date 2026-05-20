// @name         Атмосфера Pro
// @version      4.0.0
// @description  Заставка с атмосферными потоками: Аквариум, Камин, Пляж. Часы в стиле Netflix. Android TV 9+
// @author       MaxTV | LampaUa

(function () {
    'use strict';

    if (window.__atmosfera_pro_loaded) return;
    window.__atmosfera_pro_loaded = true;

    // =========================================================
    // ПОТОКИ — отобраны по стабильности (HTTP 200, H.264)
    // Каждая категория имеет 3-4 резервных источника
    // =========================================================
    var streams = {

        // ── АКВАРИУМ ────────────────────────────────────────────
        aquarium: [
            {
                name: 'Аквариум — Monterey Bay',
                // Monterey Bay Aquarium YouTube Live (re-stream через Pluto)
                url: 'https://jmp2.uk/plu-60d2bd7e4d72a900079c7f8d.m3u8'
            },
            {
                name: 'Аквариум — Ocean Wonders',
                url: 'https://amg01102-theglobeandmail-theglobeandmail-us-5884.playouts.now.amagi.tv/playlist.m3u8'
            },
            {
                name: 'Аквариум — Deep Sea',
                url: 'https://d10cyxntpn0bwm.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-n2rdxnmhv4fgo/master.m3u8'
            },
            {
                name: 'Аквариум — BBC Ocean',
                url: 'https://jmp2.uk/plu-656535fc2c46f30008870fae.m3u8'
            }
        ],

        // ── КАМИН ───────────────────────────────────────────────
        fireplace: [
            {
                name: 'Камин — Fireplace 4K (Pluto TV)',
                // Официальный канал Fireplace от Pluto TV — самый надёжный
                url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/612ce23f51cce000078eeed5/master.m3u8?deviceId=channel&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=channel&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed'
            },
            {
                name: 'Камин — Cozy Fire',
                url: 'https://d10cyxntpn0bwm.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-udbgiwo3vva3o/master.m3u8'
            },
            {
                name: 'Камин — Yule Log',
                url: 'https://jmp2.uk/plu-5f2c53a09045200007339da7.m3u8'
            },
            {
                name: 'Камин — Winter Fire',
                url: 'https://jmp2.uk/plu-5f2c53a09045200007339da8.m3u8'
            }
        ],

        // ── ПЛЯЖ ────────────────────────────────────────────────
        beach: [
            {
                name: 'Пляж — Tropical Shores',
                url: 'https://d10cyxntpn0bwm.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-n2rdxnmhv4fgz/master.m3u8'
            },
            {
                name: 'Пляж — Malibu Beach',
                url: 'https://jmp2.uk/plu-5812bd9f249444e05d09cc4e.m3u8'
            },
            {
                name: 'Пляж — Ocean Waves',
                url: 'https://tgn.bozztv.com/betterlife/betternature/betternature/index.m3u8'
            },
            {
                name: 'Пляж — Caribbean',
                url: 'https://airvuz-dronetv-1-us.ohlscdn.wurl.tv/playlist.m3u8'
            }
        ]
    };

    // Все потоки в плоском списке для режима «Случайный»
    var allStreams = [].concat(streams.aquarium, streams.fireplace, streams.beach);

    var categoryLabels = {
        'random':    'Случайный',
        'aquarium':  'Аквариум',
        'fireplace': 'Камин',
        'beach':     'Пляж'
    };

    var timer;
    var screensaverDiv = null;
    var clockInterval  = null;
    var currentIndex   = 0;
    var tryList        = [];
    var hlsInstance    = null;
    var settingsAdded  = false;

    // =========================================================
    // ЗАГРУЗКА HLS.JS
    // =========================================================
    function loadHlsJs(callback) {
        if (window.Hls) { callback(); return; }
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js';
        s.onload = callback;
        s.onerror = function () {
            var s2 = document.createElement('script');
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.13/hls.min.js';
            s2.onload = callback;
            s2.onerror = callback;
            document.head.appendChild(s2);
        };
        document.head.appendChild(s);
    }

    // =========================================================
    // ВЫБОР ПОТОКА
    // =========================================================
    function buildTryList() {
        var chosen = Lampa.Storage.get('atm_category', 'random');
        var pool;

        if (chosen === 'random' || !streams[chosen]) {
            pool = allStreams.slice();
        } else {
            var primary  = streams[chosen].slice();
            var fallback = allStreams.filter(function (s) {
                return streams[chosen].indexOf(s) === -1;
            });
            pool = primary.concat(fallback);
        }

        tryList      = pool.sort(function () { return Math.random() - 0.5; });
        currentIndex = 0;
    }

    // =========================================================
    // ЧАСЫ В СТИЛЕ NETFLIX
    // =========================================================
    function createClock() {
        var wrap = document.createElement('div');
        wrap.id  = 'atm-clock';
        wrap.style.cssText = [
            'position:absolute',
            'top:50%',
            'left:50%',
            'transform:translate(-50%,-50%)',
            'text-align:center',
            'pointer-events:none',
            'z-index:10',
            'opacity:0',
            'transition:opacity 1.2s ease'
        ].join(';');

        var timeEl = document.createElement('div');
        timeEl.id  = 'atm-time';
        timeEl.style.cssText = [
            'color:#ffffff',
            'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif',
            'font-size:calc(12vw)',           // масштабируется под любой экран
            'font-weight:300',
            'letter-spacing:-0.02em',
            'line-height:1',
            'text-shadow:0 2px 40px rgba(0,0,0,0.7)',
            '-webkit-font-smoothing:antialiased'
        ].join(';');

        var dateEl = document.createElement('div');
        dateEl.id  = 'atm-date';
        dateEl.style.cssText = [
            'color:rgba(255,255,255,0.72)',
            'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif',
            'font-size:calc(2.4vw)',
            'font-weight:400',
            'letter-spacing:0.18em',
            'text-transform:uppercase',
            'margin-top:0.4em',
            'text-shadow:0 1px 16px rgba(0,0,0,0.6)'
        ].join(';');

        wrap.appendChild(timeEl);
        wrap.appendChild(dateEl);
        return wrap;
    }

    var DAYS_RU   = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
    var MONTHS_RU = ['января','февраля','марта','апреля','мая','июня',
                     'июля','августа','сентября','октября','ноября','декабря'];

    function tickClock() {
        var timeEl = document.getElementById('atm-time');
        var dateEl = document.getElementById('atm-date');
        if (!timeEl || !dateEl) return;

        var now  = new Date();
        var h    = now.getHours();
        var m    = now.getMinutes();
        var hh   = h < 10 ? '0' + h : '' + h;
        var mm   = m < 10 ? '0' + m : '' + m;

        timeEl.textContent = hh + ':' + mm;
        dateEl.textContent = DAYS_RU[now.getDay()] + ', ' +
                             now.getDate() + ' ' + MONTHS_RU[now.getMonth()];
    }

    function startClock(container) {
        var clk = createClock();
        container.appendChild(clk);
        tickClock();
        clockInterval = setInterval(tickClock, 10000); // обновляем каждые 10 сек

        // Показываем часы только если включена опция
        var showClock = Lampa.Storage.get('atm_clock', 'true');
        if (showClock !== 'false') {
            setTimeout(function () { clk.style.opacity = '1'; }, 600);
        }
    }

    function stopClock() {
        clearInterval(clockInterval);
        clockInterval = null;
    }

    // =========================================================
    // ПОКАЗ ЗАСТАВКИ
    // =========================================================
    function showScreensaver() {
        if (screensaverDiv) return;
        if (window.Lampa && Lampa.Activity && Lampa.Activity.active() &&
            Lampa.Activity.active().component === 'player') return;

        loadHlsJs(function () {
            buildTryList();

            var soundOn  = Lampa.Storage.get('atm_sound') !== 'false';
            var volume   = parseInt(Lampa.Storage.get('atm_volume', '60')) / 100;

            screensaverDiv = document.createElement('div');
            screensaverDiv.style.cssText = [
                'position:fixed',
                'top:0',
                'left:0',
                'width:100vw',
                'height:100vh',
                'background:#000',
                'z-index:9999999',
                'overflow:hidden'
            ].join(';');

            var video = document.createElement('video');
            video.style.cssText  = 'width:100%;height:100%;object-fit:cover;display:block;';
            video.volume         = volume;
            video.muted          = !soundOn;
            video.preload        = 'none';
            video.setAttribute('playsinline', '');

            // Тёмный градиент снизу — под часы
            var gradient = document.createElement('div');
            gradient.style.cssText = [
                'position:absolute',
                'inset:0',
                'background:radial-gradient(ellipse at center,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.42) 100%)',
                'pointer-events:none'
            ].join(';');

            // Название потока
            var label = document.createElement('div');
            label.style.cssText = [
                'position:absolute',
                'bottom:36px',
                'left:50%',
                'transform:translateX(-50%)',
                'color:rgba(255,255,255,0.75)',
                'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif',
                'font-size:18px',
                'letter-spacing:0.1em',
                'text-shadow:0 1px 12px rgba(0,0,0,0.8)',
                'opacity:0',
                'transition:opacity 0.6s',
                'pointer-events:none',
                'white-space:nowrap'
            ].join(';');

            // Подсказка звука
            var hint = document.createElement('div');
            hint.style.cssText = [
                'position:absolute',
                'bottom:28px',
                'right:28px',
                'color:rgba(255,255,255,0.55)',
                'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif',
                'font-size:15px',
                'opacity:0',
                'transition:opacity 0.5s',
                'pointer-events:none'
            ].join(';');
            hint.textContent = 'Нажмите ОК для звука';

            screensaverDiv.appendChild(video);
            screensaverDiv.appendChild(gradient);
            screensaverDiv.appendChild(label);
            screensaverDiv.appendChild(hint);
            document.body.appendChild(screensaverDiv);

            startClock(screensaverDiv);
            loadStream(video, label, hint, soundOn, volume);
        });
    }

    // =========================================================
    // ЗАГРУЗКА ПОТОКА С АВТО-ПЕРЕКЛЮЧЕНИЕМ
    // =========================================================
    function loadStream(video, label, hint, soundOn, volume) {
        if (!screensaverDiv) return;
        if (currentIndex >= tryList.length) { hideScreensaver(); return; }

        var stream = tryList[currentIndex];

        if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }

        label.textContent   = stream.name;
        label.style.opacity = '0.85';
        setTimeout(function () { if (label) label.style.opacity = '0'; }, 5000);

        var next = function () {
            currentIndex++;
            setTimeout(function () {
                loadStream(video, label, hint, soundOn, volume);
            }, 800);
        };

        function tryPlay() {
            video.volume = volume;
            video.muted  = !soundOn;
            var p = video.play();
            if (p !== undefined) {
                p.catch(function () {
                    video.muted = true;
                    video.play().catch(next);
                    if (soundOn) hint.style.opacity = '0.75';
                });
            }
        }

        if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                // ── Стабильность и плавность для Android TV ──
                maxBufferLength:       12,       // буфер 12 сек
                maxMaxBufferLength:    24,
                maxBufferSize:         30 * 1024 * 1024,  // 30 МБ
                backBufferLength:      0,
                startLevel:           -1,        // авто-качество
                capLevelToPlayerSize:  true,

                // ── Быстрая адаптация к каналу ──
                abrEwmaFastLive:       4,
                abrEwmaSlowLive:       12,
                abrBandWidthFactor:    0.8,
                abrBandWidthUpFactor:  0.6,

                // ── Надёжность соединения ──
                manifestLoadingMaxRetry:    4,
                manifestLoadingRetryDelay:  1000,
                levelLoadingMaxRetry:       4,
                fragLoadingMaxRetry:        4,
                fragLoadingRetryDelay:      500,

                enableWorker:  false,   // WebView на Android TV не поддерживает workers
                lowLatencyMode: false
            });

            hlsInstance.loadSource(stream.url);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                tryPlay();
            });

            hlsInstance.on(Hls.Events.ERROR, function (evt, data) {
                if (data.fatal) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    next();
                }
            });

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src     = stream.url;
            video.onerror = next;
            tryPlay();
        } else {
            next();  // HLS не поддерживается — пробуем следующий
        }
    }

    // =========================================================
    // СКРЫТИЕ ЗАСТАВКИ
    // =========================================================
    function hideScreensaver() {
        stopClock();
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
        var mins = parseInt(Lampa.Storage.get('atm_timeout', '5'));
        timer = setTimeout(showScreensaver, mins * 60 * 1000);
    }

    // =========================================================
    // НАСТРОЙКИ
    // =========================================================
    function addSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        if (settingsAdded) return;
        settingsAdded = true;

        Lampa.SettingsApi.addComponent({
            component: 'atmosfera_settings',
            name: 'Атмосфера Pro',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
        });

        // Категория потоков
        Lampa.SettingsApi.addParam({
            component: 'atmosfera_settings',
            param: {
                name: 'atm_category',
                type: 'select',
                values: categoryLabels,
                default: 'random'
            },
            field: { name: 'Категория', description: 'Аквариум / Камин / Пляж или случайный' }
        });

        // Таймер
        Lampa.SettingsApi.addParam({
            component: 'atmosfera_settings',
            param: {
                name: 'atm_timeout',
                type: 'select',
                values: { '1':'1 минута','2':'2 минуты','3':'3 минуты','5':'5 минут','10':'10 минут','15':'15 минут','30':'30 минут' },
                default: '5'
            },
            field: { name: 'Время бездействия', description: 'Через сколько минут включается заставка' },
            onChange: function () { resetTimer(); }
        });

        // Часы
        Lampa.SettingsApi.addParam({
            component: 'atmosfera_settings',
            param: {
                name: 'atm_clock',
                type: 'select',
                values: { 'true':'Показывать','false':'Скрыть' },
                default: 'true'
            },
            field: { name: 'Часы с датой', description: 'Стильные часы поверх заставки' }
        });

        // Звук
        Lampa.SettingsApi.addParam({
            component: 'atmosfera_settings',
            param: {
                name: 'atm_sound',
                type: 'select',
                values: { 'true':'Включён','false':'Выключен' },
                default: 'false'
            },
            field: { name: 'Звук', description: 'Воспроизводить звук потока' }
        });

        // Громкость
        Lampa.SettingsApi.addParam({
            component: 'atmosfera_settings',
            param: {
                name: 'atm_volume',
                type: 'select',
                values: { '10':'10%','20':'20%','30':'30%','40':'40%','50':'50%','60':'60%','80':'80%','100':'100%' },
                default: '60'
            },
            field: { name: 'Громкость', description: 'Уровень громкости звука' }
        });
    }

    // =========================================================
    // СОБЫТИЯ АКТИВНОСТИ
    // =========================================================
    var events = ['keydown', 'mousemove', 'click', 'touchstart', 'wheel'];
    events.forEach(function (e) {
        window.addEventListener(e, function (ev) {
            if (screensaverDiv) {
                var v       = screensaverDiv.querySelector('video');
                var sOn     = Lampa.Storage.get('atm_sound') !== 'false';
                // Первое нажатие ОК — разблокируем звук если браузер заглушил
                if (v && v.muted && sOn && (ev.type === 'keydown' || ev.type === 'click')) {
                    v.muted = false;
                    var h = screensaverDiv.querySelector('#atm-clock');
                    if (h) h.style.opacity = '1';
                    ev.preventDefault();
                    return;
                }
                hideScreensaver();
            } else {
                resetTimer();
            }
        }, { passive: false });
    });

    // =========================================================
    // ЗАПУСК
    // =========================================================
    function init() {
        addSettings();
        resetTimer();
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();
