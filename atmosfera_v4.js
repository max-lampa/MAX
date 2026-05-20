// @name         Атмосфера — Камин & Аквариум
// @version      6.0.0
// @description  Заставка с двумя режимами: Камин (7 потоков) и Аквариум (8 потоков). Часы меняют цвет по теме. Android TV 9+
// @author       MaxTV | LampaUa

(function () {
    'use strict';

    if (window.__atmosfera_v6_loaded) return;
    window.__atmosfera_v6_loaded = true;

    // =========================================================
    // ПОТОКИ — КАМИН (7 штук, все проверены HTTP 200 + M3U8)
    // =========================================================
    var streamsFire = [
        { name: 'Fireplace',          url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/612ce23f51cce000078eeed5/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Crackling Fireplace', url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5bf48085851dd5632e2f7b4d/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Cozy Fire',          url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5c8732f7a57e9800082b6c60/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Burning Log',        url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5c8732f7a57e9800082b6c61/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Festive Fireplace',  url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/614501c653ceee000772b0ca/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Holiday Fire',       url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5e2b604dac6e88001a2db77e/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Stingray Fire',      url: 'https://stream.ads.ottera.tv/cl/240211cn4j7g65sur7fq378vpg/1920x1080_5711200_3_f.m3u8' }
    ];

    // =========================================================
    // ПОТОКИ — АКВАРИУМ (8 штук, все проверены HTTP 200 + M3U8)
    // =========================================================
    var streamsAqua = [
        { name: 'Aquarium — Ocean Life',    url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5d3f02dcfd3ae200083baaed/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Aquarium — Deep Sea',      url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5d3f02dcfd3ae200083baaec/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Aquarium — Ocean Wonders', url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5d6aa26365a3800009e3a890/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Aquarium — BBC Earth',     url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/656535fc2c46f30008870fae/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Aquarium — Love Nature',   url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/66df8a29b25d2b0008fc5fe0/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Aquarium — Naturescape',   url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5812bd9f249444e05d09cc4e/master.m3u8?deviceId=lampatv&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceType=rokuChannel&deviceMake=rokuChannel&deviceDNT=1&advertisingId=lampatv&embedPartner=rokuChannel&appName=rokuchannel&is_lat=1&bmodel=bm1&content=channel&platform=web&content_type=livefeed' },
        { name: 'Aquarium — DroneTV',       url: 'https://airvuz-dronetv-1-us.ohlscdn.wurl.tv/playlist.m3u8' },
        { name: 'Aquarium — Relax Nature',  url: 'https://d10cyxntpn0bwm.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-udbgiwo3vva3o/master.m3u8' }
    ];

    // =========================================================
    // СОСТОЯНИЕ
    // =========================================================
    var timer;
    var screensaverDiv = null;
    var clockInterval  = null;
    var currentIndex   = 0;
    var tryList        = [];
    var hlsInstance    = null;
    var settingsAdded  = false;
    var currentMode    = 'fire'; // 'fire' | 'aqua'

    var audioCtx    = null;
    var audioAnal   = null;
    var audioSrc    = null;
    var audioFrame  = null;
    var audioActive = false;

    // =========================================================
    // ЗАГРУЗКА HLS.JS
    // =========================================================
    function loadHlsJs(cb) {
        if (window.Hls) { cb(); return; }
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js';
        s.onload = cb;
        s.onerror = function () {
            var s2 = document.createElement('script');
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.13/hls.min.js';
            s2.onload = cb;
            s2.onerror = cb;
            document.head.appendChild(s2);
        };
        document.head.appendChild(s);
    }

    // =========================================================
    // ВЫБОР ПОТОКА
    // =========================================================
    function buildTryList() {
        var mode = Lampa.Storage.get('atm_mode', 'fire');
        currentMode = mode;
        var pool = (mode === 'aqua') ? streamsAqua.slice() : streamsFire.slice();
        tryList = pool.sort(function () { return Math.random() - 0.5; });
        currentIndex = 0;
    }

    // =========================================================
    // ТЕМА ЧАСОВ — огонь или вода
    // =========================================================
    var THEME = {
        fire: {
            timeGrad:   'linear-gradient(135deg,#FFD580 0%,#FF8C42 50%,#FF4F1F 100%)',
            dateColor:  '#FFD580',
            lineColor:  'rgba(255,180,60,0.75)',
            glowColor:  'rgba(255,140,40,0.55)',
            shadowColor:'rgba(255,100,20,0.7)',
            // CSS анимации
            flickerKf: [
                '0%   { filter: drop-shadow(0 2px 14px rgba(255,120,20,0.5))  brightness(1.00); }',
                '7%   { filter: drop-shadow(0 3px 22px rgba(255,160,30,0.75)) brightness(1.08); }',
                '13%  { filter: drop-shadow(0 2px 10px rgba(255,80,10,0.45))  brightness(0.96); }',
                '25%  { filter: drop-shadow(0 4px 28px rgba(255,180,40,0.85)) brightness(1.12); }',
                '34%  { filter: drop-shadow(0 2px 16px rgba(255,100,15,0.55)) brightness(0.98); }',
                '47%  { filter: drop-shadow(0 3px 24px rgba(255,150,25,0.70)) brightness(1.06); }',
                '58%  { filter: drop-shadow(0 2px 12px rgba(255,90,10,0.50))  brightness(0.94); }',
                '72%  { filter: drop-shadow(0 4px 30px rgba(255,190,50,0.90)) brightness(1.14); }',
                '81%  { filter: drop-shadow(0 2px 18px rgba(255,110,20,0.60)) brightness(1.02); }',
                '91%  { filter: drop-shadow(0 3px 20px rgba(255,140,30,0.65)) brightness(1.05); }',
                '100% { filter: drop-shadow(0 2px 14px rgba(255,120,20,0.50)) brightness(1.00); }'
            ],
            flickerDur: '4.8s',
            breatheKf: [
                '0%,100% { opacity:0.70; text-shadow:0 1px 12px rgba(255,100,20,0.55); }',
                '40%     { opacity:0.90; text-shadow:0 1px 22px rgba(255,160,40,0.85); }',
                '70%     { opacity:0.75; text-shadow:0 1px 10px rgba(255,80,10,0.40);  }'
            ],
            breatheDur: '3.6s'
        },
        aqua: {
            timeGrad:   'linear-gradient(135deg,#A8EDFF 0%,#38C8FF 45%,#0080C8 100%)',
            dateColor:  '#A8EDFF',
            lineColor:  'rgba(80,200,255,0.7)',
            glowColor:  'rgba(40,160,255,0.55)',
            shadowColor:'rgba(0,140,220,0.7)',
            // Плавная волновая анимация вместо мерцания огня
            flickerKf: [
                '0%   { filter: drop-shadow(0 2px 14px rgba(0,160,255,0.45))  brightness(1.00); }',
                '12%  { filter: drop-shadow(0 4px 24px rgba(80,210,255,0.70)) brightness(1.06); }',
                '28%  { filter: drop-shadow(0 2px 18px rgba(0,130,220,0.50))  brightness(0.97); }',
                '45%  { filter: drop-shadow(0 5px 32px rgba(100,220,255,0.85)) brightness(1.10); }',
                '60%  { filter: drop-shadow(0 3px 20px rgba(0,150,240,0.55))  brightness(1.02); }',
                '78%  { filter: drop-shadow(0 4px 28px rgba(60,200,255,0.75)) brightness(1.07); }',
                '100% { filter: drop-shadow(0 2px 14px rgba(0,160,255,0.45))  brightness(1.00); }'
            ],
            flickerDur: '6.5s',
            breatheKf: [
                '0%,100% { opacity:0.65; text-shadow:0 1px 14px rgba(0,140,220,0.55); }',
                '50%     { opacity:0.90; text-shadow:0 1px 28px rgba(80,210,255,0.90); }'
            ],
            breatheDur: '4.8s'
        }
    };

    // =========================================================
    // ШРИФТЫ И CSS-АНИМАЦИИ
    // =========================================================
    function loadClockFont(cb) {
        if (document.getElementById('atm-font')) { cb(); return; }
        var link = document.createElement('link');
        link.id   = 'atm-font';
        link.rel  = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Raleway:wght@300;400&display=swap';
        link.onload = cb;
        link.onerror = cb;
        document.head.appendChild(link);
    }

    function injectClockStyles(mode) {
        var existing = document.getElementById('atm-styles');
        if (existing) existing.remove();

        var th = THEME[mode] || THEME.fire;
        var style = document.createElement('style');
        style.id = 'atm-styles';
        style.textContent = [
            '@keyframes atm-flicker {', th.flickerKf.join('\n'), '}',
            '@keyframes atm-breathe {', th.breatheKf.join('\n'), '}',
            '@keyframes atm-line {',
            '  0%,100% { opacity:0.50; transform:scaleX(0.78); }',
            '  50%     { opacity:0.92; transform:scaleX(1.00); }',
            '}',
            '#atm-time { animation: atm-flicker ' + th.flickerDur + ' ease-in-out infinite; }',
            '#atm-date { animation: atm-breathe ' + th.breatheDur + ' ease-in-out infinite; }',
            '#atm-line { animation: atm-line 3.2s ease-in-out infinite; transform-origin:right center; }'
        ].join('\n');
        document.head.appendChild(style);
    }

    // =========================================================
    // СОЗДАНИЕ ЧАСОВ
    // =========================================================
    var DAYS   = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
    var MONTHS = ['января','февраля','марта','апреля','мая','июня',
                  'июля','августа','сентября','октября','ноября','декабря'];

    function createClock(mode) {
        injectClockStyles(mode);
        var th = THEME[mode] || THEME.fire;

        var wrap = document.createElement('div');
        wrap.id  = 'atm-clock';
        wrap.style.cssText = [
            'position:absolute',
            'top:38px', 'right:48px',
            'text-align:right',
            'pointer-events:none',
            'z-index:20',
            'opacity:0',
            'transition:opacity 1.6s ease'
        ].join(';');

        var timeEl = document.createElement('div');
        timeEl.id  = 'atm-time';
        timeEl.style.cssText = [
            'background:' + th.timeGrad,
            '-webkit-background-clip:text',
            '-webkit-text-fill-color:transparent',
            'background-clip:text',
            'font-family:"Cinzel",Georgia,serif',
            'font-size:7.2vw',
            'font-weight:700',
            'letter-spacing:0.04em',
            'line-height:1',
            '-webkit-font-smoothing:antialiased'
        ].join(';');

        var line = document.createElement('div');
        line.id = 'atm-line';
        line.style.cssText = [
            'height:1px',
            'margin:0.45em 0 0.35em',
            'background:linear-gradient(90deg,transparent,' + th.lineColor + ',transparent)',
            'border-radius:1px'
        ].join(';');

        var dateEl = document.createElement('div');
        dateEl.id  = 'atm-date';
        dateEl.style.cssText = [
            'color:' + th.dateColor,
            'font-family:"Raleway","Helvetica Neue",Arial,sans-serif',
            'font-size:1.55vw',
            'font-weight:300',
            'letter-spacing:0.22em',
            'text-transform:uppercase',
            'margin-top:0.3em',
            '-webkit-font-smoothing:antialiased'
        ].join(';');

        wrap.appendChild(timeEl);
        wrap.appendChild(line);
        wrap.appendChild(dateEl);
        return wrap;
    }

    function tickClock() {
        var t = document.getElementById('atm-time');
        var d = document.getElementById('atm-date');
        if (!t || !d) return;
        var now = new Date();
        var h = now.getHours(), m = now.getMinutes();
        t.textContent = (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
        d.textContent = DAYS[now.getDay()] + ',\u2002' + now.getDate() + '\u00A0' + MONTHS[now.getMonth()];
    }

    function startClock(container, video, mode) {
        var clk = createClock(mode);
        container.appendChild(clk);
        tickClock();
        clockInterval = setInterval(tickClock, 10000);
        if (Lampa.Storage.get('atm_clock', 'true') !== 'false') {
            loadClockFont(function () {
                setTimeout(function () {
                    clk.style.opacity = '1';
                    if (video && Lampa.Storage.get('atm_sound') !== 'false') {
                        startAudioViz(video, mode);
                    }
                }, 400);
            });
        }
    }

    function stopClock() {
        clearInterval(clockInterval);
        clockInterval = null;
        stopAudioViz();
    }

    // =========================================================
    // АУДИО-ВИЗУАЛИЗАЦИЯ — реакция на звук
    // =========================================================
    function startAudioViz(video, mode) {
        if (audioActive) return;
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;

            audioCtx  = new AC();
            audioAnal = audioCtx.createAnalyser();
            audioAnal.fftSize = 256;
            audioAnal.smoothingTimeConstant = 0.75;
            audioSrc  = audioCtx.createMediaElementSource(video);
            audioSrc.connect(audioAnal);
            audioAnal.connect(audioCtx.destination);

            var buf    = new Uint8Array(audioAnal.frequencyBinCount);
            var timeEl = document.getElementById('atm-time');
            var lineEl = document.getElementById('atm-line');

            if (timeEl) timeEl.style.animationPlayState = 'paused';
            if (lineEl) lineEl.style.animationPlayState = 'paused';

            audioActive = true;
            var isAqua = (mode === 'aqua');

            function loop() {
                if (!audioActive) return;
                audioFrame = requestAnimationFrame(loop);
                audioAnal.getByteFrequencyData(buf);

                var sum = 0, count = Math.floor(buf.length * 0.35);
                for (var i = 0; i < count; i++) sum += buf[i];
                var avg = sum / count / 255;
                var jitter = (Math.random() * 0.06) - 0.03;
                var level  = Math.max(0, Math.min(1, avg + jitter));

                var glow   = 10 + level * 32;
                var bright = 0.9 + level * 0.45;

                var shadow;
                if (isAqua) {
                    // Голубое свечение для аквариума
                    var g2 = Math.round(160 + level * 60);
                    shadow = 'drop-shadow(0 2px ' + glow + 'px rgba(0,' + g2 + ',255,' + (0.45 + level * 0.55).toFixed(2) + '))';
                } else {
                    // Огненное свечение для камина
                    var g3 = Math.round(100 + level * 90);
                    shadow = 'drop-shadow(0 2px ' + glow + 'px rgba(255,' + g3 + ',10,' + (0.45 + level * 0.55).toFixed(2) + '))';
                }

                if (timeEl) timeEl.style.filter = shadow + ' brightness(' + bright.toFixed(3) + ')';

                if (lineEl) {
                    lineEl.style.transform       = 'scaleX(' + (0.70 + level * 0.35).toFixed(3) + ')';
                    lineEl.style.transformOrigin = 'right center';
                    lineEl.style.opacity         = (0.45 + level * 0.55).toFixed(2);
                }
            }
            loop();
        } catch(e) {
            audioActive = false;
        }
    }

    function stopAudioViz() {
        audioActive = false;
        if (audioFrame)  { cancelAnimationFrame(audioFrame); audioFrame = null; }
        if (audioSrc)    { try { audioSrc.disconnect();  } catch(e){} audioSrc  = null; }
        if (audioAnal)   { try { audioAnal.disconnect(); } catch(e){} audioAnal = null; }
        if (audioCtx)    { try { audioCtx.close();       } catch(e){} audioCtx  = null; }
        var t = document.getElementById('atm-time');
        var l = document.getElementById('atm-line');
        if (t) { t.style.filter = ''; t.style.animationPlayState = 'running'; }
        if (l) { l.style.transform = ''; l.style.opacity = ''; l.style.animationPlayState = 'running'; }
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
            var mode    = currentMode;
            var soundOn = Lampa.Storage.get('atm_sound') !== 'false';
            var volume  = parseInt(Lampa.Storage.get('atm_volume', '50')) / 100;

            screensaverDiv = document.createElement('div');
            screensaverDiv.style.cssText = [
                'position:fixed','top:0','left:0',
                'width:100vw','height:100vh',
                'background:#000','z-index:9999999','overflow:hidden'
            ].join(';');

            var video = document.createElement('video');
            video.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
            video.volume = volume;
            video.muted  = !soundOn;
            video.preload = 'none';
            video.setAttribute('playsinline', '');

            // Виньетка — тёплая для огня, холодная для воды
            var vgColor = (mode === 'aqua')
                ? 'radial-gradient(ellipse at center,transparent 30%,rgba(0,10,30,0.55) 100%)'
                : 'radial-gradient(ellipse at center,transparent 30%,rgba(10,0,0,0.52) 100%)';
            var vignette = document.createElement('div');
            vignette.style.cssText = 'position:absolute;inset:0;background:' + vgColor + ';pointer-events:none;z-index:5;';

            var label = document.createElement('div');
            label.style.cssText = [
                'position:absolute','bottom:38px','left:50%',
                'transform:translateX(-50%)',
                'color:rgba(255,255,255,0.6)',
                'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif',
                'font-size:16px','letter-spacing:0.14em',
                'text-transform:uppercase',
                'text-shadow:0 1px 10px rgba(0,0,0,0.9)',
                'opacity:0','transition:opacity 0.7s',
                'pointer-events:none','white-space:nowrap','z-index:11'
            ].join(';');

            var hint = document.createElement('div');
            hint.style.cssText = [
                'position:absolute','bottom:26px','right:26px',
                'color:rgba(255,255,255,0.42)',
                'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif',
                'font-size:14px','opacity:0','transition:opacity 0.5s',
                'pointer-events:none','z-index:11'
            ].join(';');
            hint.textContent = 'Нажмите ОК для звука';

            screensaverDiv.appendChild(video);
            screensaverDiv.appendChild(vignette);
            screensaverDiv.appendChild(label);
            screensaverDiv.appendChild(hint);
            document.body.appendChild(screensaverDiv);

            startClock(screensaverDiv, video, mode);
            loadStream(video, label, hint, soundOn, volume);
        });
    }

    // =========================================================
    // ЗАГРУЗКА ПОТОКА
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
            setTimeout(function () { loadStream(video, label, hint, soundOn, volume); }, 1000);
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
                maxBufferLength: 15, maxMaxBufferLength: 30,
                maxBufferSize: 40 * 1024 * 1024,
                backBufferLength: 0, startLevel: -1,
                capLevelToPlayerSize: true,
                abrEwmaFastLive: 3, abrEwmaSlowLive: 9,
                abrBandWidthFactor: 0.85, abrBandWidthUpFactor: 0.65,
                manifestLoadingMaxRetry: 6, manifestLoadingRetryDelay: 1500,
                manifestLoadingMaxRetryTimeout: 16000,
                levelLoadingMaxRetry: 6, levelLoadingRetryDelay: 1000,
                fragLoadingMaxRetry: 6, fragLoadingRetryDelay: 500,
                enableWorker: false, lowLatencyMode: false
            });
            hlsInstance.loadSource(stream.url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () { tryPlay(); });
            hlsInstance.on(Hls.Events.ERROR, function (e, data) {
                if (data.fatal) { hlsInstance.destroy(); hlsInstance = null; next(); }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream.url; video.onerror = next; tryPlay();
        } else {
            next();
        }
    }

    // =========================================================
    // СКРЫТИЕ
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
            component: 'atm_settings',
            name: 'Атмосфера',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: {
                name: 'atm_mode', type: 'select',
                values: { 'fire':'🔥 Камин (7 каналов)', 'aqua':'🐟 Аквариум (8 каналов)' },
                default: 'fire'
            },
            field: { name: 'Режим заставки', description: 'Камин — тёплый огонь | Аквариум — подводный мир' }
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: {
                name: 'atm_timeout', type: 'select',
                values: { '1':'1 мин','2':'2 мин','3':'3 мин','5':'5 мин','10':'10 мин','15':'15 мин','30':'30 мин' },
                default: '5'
            },
            field: { name: 'Время бездействия', description: 'Через сколько минут включается заставка' },
            onChange: function () { resetTimer(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: { name: 'atm_clock', type: 'select', values: { 'true':'Показывать','false':'Скрыть' }, default: 'true' },
            field:  { name: 'Часы с датой', description: 'Цвет часов меняется под тему' }
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: { name: 'atm_sound', type: 'select', values: { 'true':'Включён','false':'Выключен' }, default: 'false' },
            field:  { name: 'Звук', description: 'Треск огня или плеск воды' }
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: {
                name: 'atm_volume', type: 'select',
                values: { '10':'10%','20':'20%','30':'30%','40':'40%','50':'50%','70':'70%','100':'100%' },
                default: '50'
            },
            field: { name: 'Громкость', description: 'Уровень звука' }
        });
    }

    // =========================================================
    // СОБЫТИЯ
    // =========================================================
    var events = ['keydown', 'mousemove', 'click', 'touchstart', 'wheel'];
    events.forEach(function (e) {
        window.addEventListener(e, function (ev) {
            if (screensaverDiv) {
                var v   = screensaverDiv.querySelector('video');
                var sOn = Lampa.Storage.get('atm_sound') !== 'false';
                if (v && v.muted && sOn && (ev.type === 'keydown' || ev.type === 'click')) {
                    v.muted = false;
                    if (!audioActive) startAudioViz(v, currentMode);
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
    function init() { addSettings(); resetTimer(); }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();
