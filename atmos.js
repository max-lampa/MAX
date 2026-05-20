// @name         Атмосфера — Камин & Аквариум
// @version      6.1.0
// @description  Заставка с двумя режимами: один поток Камина и один поток Аквариума. Максимальная стабильность для Android TV 9+
// @author       MaxTV | LampaUa

(function () {
    'use strict';

    if (window.__atmosfera_v6_loaded) return;
    window.__atmosfera_v6_loaded = true;

    // =========================================================
    // ПОТОКИ — ОДИН САМЫЙ СТАБИЛЬНЫЙ ДЛЯ КАЖДОГО РЕЖИМА
    // =========================================================
    var STREAMS = {
        fire: {
            name: 'Уютный Камин',
            url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5f8ed381dc77f00007c813df/master.m3u8?deviceType=web&deviceMake=web&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceDNT=0'
        },
        aqua: {
            name: 'Подводный Мир',
            url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5d3f02dcfd3ae200083baaed/master.m3u8?deviceType=web&deviceMake=web&deviceModel=web&deviceVersion=1.0&appVersion=1.0&deviceDNT=0'
        }
    };

    // =========================================================
    // СОСТОЯНИЕ
    // =========================================================
    var timer;
    var screensaverDiv = null;
    var clockInterval  = null;
    var hlsInstance    = null;
    var settingsAdded  = false;
    var currentMode    = 'fire';

    var audioCtx    = null;
    var audioAnal   = null;
    var audioSrc    = null;
    var audioFrame  = null;
    var audioActive = false;

    // =========================================================
    // ЗАГРУЗКА HLS.JS (стабильная версия)
    // =========================================================
    function loadHlsJs(cb) {
        if (window.Hls) { cb(); return; }
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.4.14/dist/hls.min.js';
        s.onload = cb;
        s.onerror = function () {
            var s2 = document.createElement('script');
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.14/hls.min.js';
            s2.onload = cb;
            s2.onerror = function() {
                console.error('Failed to load HLS.js');
                cb();
            };
            document.head.appendChild(s2);
        };
        document.head.appendChild(s);
    }

    // =========================================================
    // ТЕМА ЧАСОВ — огонь или вода
    // =========================================================
    var THEME = {
        fire: {
            timeGrad:   'linear-gradient(135deg,#FFD580 0%,#FF8C42 50%,#FF4F1F 100%)',
            dateColor:  '#FFD580',
            lineColor:  'rgba(255,180,60,0.75)',
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
            breatheDur: '3.6s',
            vignette: 'radial-gradient(ellipse at center,transparent 30%,rgba(10,0,0,0.52) 100%)'
        },
        aqua: {
            timeGrad:   'linear-gradient(135deg,#A8EDFF 0%,#38C8FF 45%,#0080C8 100%)',
            dateColor:  '#A8EDFF',
            lineColor:  'rgba(80,200,255,0.7)',
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
            breatheDur: '4.8s',
            vignette: 'radial-gradient(ellipse at center,transparent 30%,rgba(0,10,30,0.55) 100%)'
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
        if (clockInterval) {
            clearInterval(clockInterval);
            clockInterval = null;
        }
        stopAudioViz();
    }

    // =========================================================
    // АУДИО-ВИЗУАЛИЗАЦИЯ
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
            
            try {
                audioSrc  = audioCtx.createMediaElementSource(video);
            } catch(e) {
                return;
            }
            
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
                    var g2 = Math.round(160 + level * 60);
                    shadow = 'drop-shadow(0 2px ' + glow + 'px rgba(0,' + g2 + ',255,' + (0.45 + level * 0.55).toFixed(2) + '))';
                } else {
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
            console.log('AudioViz error:', e);
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
            currentMode = Lampa.Storage.get('atm_mode', 'fire');
            var stream  = STREAMS[currentMode];
            var soundOn = Lampa.Storage.get('atm_sound') !== 'false';
            var volume  = parseInt(Lampa.Storage.get('atm_volume', '50')) / 100;
            var theme   = THEME[currentMode];

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
            video.preload = 'auto';
            video.loop = false; // HLS сам зациклит
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('x5-playsinline', '');

            var vignette = document.createElement('div');
            vignette.style.cssText = 'position:absolute;inset:0;background:' + theme.vignette + ';pointer-events:none;z-index:5;';

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
            label.textContent = stream.name;

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

            startClock(screensaverDiv, video, currentMode);
            loadStream(video, label, hint, stream, soundOn, volume);
        });
    }

    // =========================================================
    // ЗАГРУЗКА ПОТОКА
    // =========================================================
    function loadStream(video, label, hint, stream, soundOn, volume) {
        if (!screensaverDiv) return;

        label.style.opacity = '0.85';
        setTimeout(function () { if (label) label.style.opacity = '0'; }, 5000);

        function tryPlay() {
            video.volume = volume;
            video.muted  = !soundOn;
            var p = video.play();
            if (p !== undefined) {
                p.then(function() {
                    console.log('Stream playing:', stream.name);
                    if (soundOn && video.muted) {
                        hint.style.opacity = '0.75';
                    }
                }).catch(function (err) {
                    console.log('Play error:', err);
                    video.muted = true;
                    video.play().catch(function(e) {
                        console.error('Failed to play even muted:', e);
                    });
                    if (soundOn) hint.style.opacity = '0.75';
                });
            }
        }

        if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 0,
                maxBufferLength: 10,
                maxMaxBufferLength: 20,
                maxBufferSize: 30 * 1024 * 1024,
                maxBufferHole: 0.5,
                highBufferWatchdogPeriod: 2,
                nudgeOffset: 0.1,
                nudgeMaxRetry: 3,
                maxFragLookUpTolerance: 0.25,
                liveSyncDurationCount: 3,
                liveMaxLatencyDurationCount: 10,
                liveDurationInfinity: false,
                enableCEA708Captions: false,
                enableWebVTT: false,
                captionsTextTrack1Label: 'English',
                captionsTextTrack1LanguageCode: 'en',
                startLevel: -1,
                capLevelToPlayerSize: true,
                testBandwidth: true,
                progressive: false,
                abrEwmaFastLive: 3.0,
                abrEwmaSlowLive: 9.0,
                abrEwmaFastVoD: 3.0,
                abrEwmaSlowVoD: 9.0,
                abrEwmaDefaultEstimate: 500000,
                abrBandWidthFactor: 0.85,
                abrBandWidthUpFactor: 0.65,
                abrMaxWithRealBitrate: false,
                maxStarvationDelay: 4,
                maxLoadingDelay: 4,
                minAutoBitrate: 0,
                emeEnabled: false,
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 3,
                manifestLoadingRetryDelay: 1000,
                manifestLoadingMaxRetryTimeout: 10000,
                levelLoadingTimeOut: 10000,
                levelLoadingMaxRetry: 3,
                levelLoadingRetryDelay: 1000,
                levelLoadingMaxRetryTimeout: 10000,
                fragLoadingTimeOut: 20000,
                fragLoadingMaxRetry: 6,
                fragLoadingRetryDelay: 1000,
                fragLoadingMaxRetryTimeout: 20000,
                startFragPrefetch: false,
                testBandwidth: true,
                fpsDroppedMonitoringPeriod: 5000,
                fpsDroppedMonitoringThreshold: 0.2,
                appendErrorMaxRetry: 3,
                stretchShortVideoTrack: false,
                maxAudioFramesDrift: 1,
                forceKeyFrameOnDiscontinuity: true,
                xhrSetup: undefined,
                fetchSetup: undefined
            });
            
            hlsInstance.loadSource(stream.url);
            hlsInstance.attachMedia(video);
            
            var manifestParsed = false;
            
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                console.log('Manifest parsed for:', stream.name);
                manifestParsed = true;
                tryPlay();
            });
            
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                console.log('HLS Error:', data.type, data.details, data.fatal);
                
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Fatal network error encountered, trying to recover');
                            setTimeout(function() {
                                if (hlsInstance) {
                                    hlsInstance.startLoad();
                                }
                            }, 2000);
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Fatal media error encountered, trying to recover');
                            if (hlsInstance) {
                                hlsInstance.recoverMediaError();
                            }
                            break;
                        default:
                            console.error('Fatal error, cannot recover');
                            if (hlsInstance) {
                                hlsInstance.destroy();
                                hlsInstance = null;
                            }
                            break;
                    }
                }
            });

            hlsInstance.on(Hls.Events.FRAG_BUFFERED, function() {
                if (!manifestParsed) {
                    console.log('Fragment buffered, attempting play');
                    tryPlay();
                }
            });

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            console.log('Using native HLS support');
            video.src = stream.url;
            video.onerror = function(e) {
                console.error('Native HLS error:', e);
            };
            tryPlay();
        } else {
            console.error('HLS not supported on this platform');
        }
    }

    // =========================================================
    // СКРЫТИЕ
    // =========================================================
    function hideScreensaver() {
        stopClock();
        if (hlsInstance) { 
            try { 
                hlsInstance.destroy(); 
                console.log('HLS instance destroyed');
            } catch(e) {
                console.error('Error destroying HLS:', e);
            }
            hlsInstance = null; 
        }
        if (screensaverDiv) {
            var v = screensaverDiv.querySelector('video');
            if (v) { 
                v.pause(); 
                v.removeAttribute('src'); 
                v.load(); 
            }
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
                name: 'atm_mode', 
                type: 'select',
                values: { 
                    'fire':'🔥 Уютный Камин', 
                    'aqua':'🐟 Подводный Мир' 
                },
                default: 'fire'
            },
            field: { 
                name: 'Режим заставки', 
                description: 'Один стабильный поток для каждого режима' 
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: {
                name: 'atm_timeout', 
                type: 'select',
                values: { 
                    '1':'1 мин',
                    '2':'2 мин',
                    '3':'3 мин',
                    '5':'5 мин',
                    '10':'10 мин',
                    '15':'15 мин',
                    '30':'30 мин' 
                },
                default: '5'
            },
            field: { 
                name: 'Время бездействия', 
                description: 'Через сколько минут включается заставка' 
            },
            onChange: function () { resetTimer(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: { 
                name: 'atm_clock', 
                type: 'select', 
                values: { 
                    'true':'Показывать',
                    'false':'Скрыть' 
                }, 
                default: 'true' 
            },
            field: { 
                name: 'Часы с датой', 
                description: 'Цвет часов меняется под тему (огонь/вода)' 
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: { 
                name: 'atm_sound', 
                type: 'select', 
                values: { 
                    'true':'Включён',
                    'false':'Выключен' 
                }, 
                default: 'false' 
            },
            field: { 
                name: 'Звук', 
                description: 'Треск огня или звуки океана' 
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: {
                name: 'atm_volume', 
                type: 'select',
                values: { 
                    '10':'10%',
                    '20':'20%',
                    '30':'30%',
                    '40':'40%',
                    '50':'50%',
                    '70':'70%',
                    '100':'100%' 
                },
                default: '50'
            },
            field: { 
                name: 'Громкость', 
                description: 'Уровень звука заставки' 
            }
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
                    v.volume = parseInt(Lampa.Storage.get('atm_volume', '50')) / 100;
                    if (!audioActive) startAudioViz(v, currentMode);
                    var hint = screensaverDiv.querySelector('div[style*="bottom:26px"]');
                    if (hint) hint.style.opacity = '0';
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
        console.log('Атмосфера v6.1.0 загружена');
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();