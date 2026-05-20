// @name         Атмосфера — Камин & Аквариум
// @version      6.2.0
// @description  Заставка с детальной диагностикой. Android TV 9+
// @author       MaxTV | LampaUa

(function () {
    'use strict';

    if (window.__atmosfera_v6_loaded) return;
    window.__atmosfera_v6_loaded = true;

    console.log('[ATM] Плагин загружается...');

    // =========================================================
    // ПОТОКИ — с запасными вариантами
    // =========================================================
    var STREAMS = {
        fire: [
            { name: 'Камин Pluto TV', url: 'https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5f8ed381dc77f00007c813df/master.m3u8?deviceType=web&deviceMake=web&deviceModel=web&deviceVersion=1.0' },
            { name: 'Камин 2', url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5bf48085851dd5632e2f7b4d/master.m3u8?deviceId=web&deviceModel=web&deviceVersion=1.0' },
            { name: 'Камин 3', url: 'https://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv/stitch/hls/channel/5dc212daf040de0009761a53/master.m3u8?appName=web&appVersion=unknown&deviceDNT=0&deviceId=web&deviceMake=Chrome&deviceModel=web&deviceType=web' }
        ],
        aqua: [
            { name: 'Аквариум Pluto TV', url: 'https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5d3f02dcfd3ae200083baaed/master.m3u8?deviceType=web&deviceMake=web&deviceModel=web&deviceVersion=1.0' },
            { name: 'Аквариум 2', url: 'https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/5d3f02dcfd3ae200083baaec/master.m3u8?deviceId=web&deviceModel=web&deviceVersion=1.0' },
            { name: 'Аквариум 3', url: 'https://d10cyxntpn0bwm.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-udbgiwo3vva3o/master.m3u8' }
        ]
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
    var streamIndex    = 0;

    // =========================================================
    // ЗАГРУЗКА HLS.JS
    // =========================================================
    function loadHlsJs(cb) {
        console.log('[ATM] Загрузка HLS.js...');
        if (window.Hls) { 
            console.log('[ATM] HLS.js уже загружен');
            cb(); 
            return; 
        }
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.4.14/dist/hls.min.js';
        s.onload = function() {
            console.log('[ATM] HLS.js загружен успешно');
            cb();
        };
        s.onerror = function () {
            console.log('[ATM] Ошибка загрузки HLS.js с CDN, пробуем Cloudflare...');
            var s2 = document.createElement('script');
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.14/hls.min.js';
            s2.onload = function() {
                console.log('[ATM] HLS.js загружен с Cloudflare');
                cb();
            };
            s2.onerror = function() {
                console.error('[ATM] КРИТИЧЕСКАЯ ОШИБКА: не удалось загрузить HLS.js');
                cb();
            };
            document.head.appendChild(s2);
        };
        document.head.appendChild(s);
    }

    // =========================================================
    // ТЕМА
    // =========================================================
    var THEME = {
        fire: {
            timeGrad: 'linear-gradient(135deg,#FFD580 0%,#FF8C42 50%,#FF4F1F 100%)',
            dateColor: '#FFD580',
            lineColor: 'rgba(255,180,60,0.75)',
            vignette: 'radial-gradient(ellipse at center,transparent 30%,rgba(10,0,0,0.52) 100%)'
        },
        aqua: {
            timeGrad: 'linear-gradient(135deg,#A8EDFF 0%,#38C8FF 45%,#0080C8 100%)',
            dateColor: '#A8EDFF',
            lineColor: 'rgba(80,200,255,0.7)',
            vignette: 'radial-gradient(ellipse at center,transparent 30%,rgba(0,10,30,0.55) 100%)'
        }
    };

    // =========================================================
    // ЧАСЫ (упрощённые)
    // =========================================================
    var DAYS = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
    var MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

    function createClock(mode) {
        var th = THEME[mode];
        var wrap = document.createElement('div');
        wrap.id = 'atm-clock';
        wrap.style.cssText = 'position:absolute;top:40px;right:50px;text-align:right;pointer-events:none;z-index:20;opacity:0;transition:opacity 1s;';

        var timeEl = document.createElement('div');
        timeEl.id = 'atm-time';
        timeEl.style.cssText = 'background:' + th.timeGrad + ';-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:Arial,sans-serif;font-size:80px;font-weight:700;line-height:1;';

        var dateEl = document.createElement('div');
        dateEl.id = 'atm-date';
        dateEl.style.cssText = 'color:' + th.dateColor + ';font-family:Arial,sans-serif;font-size:20px;margin-top:10px;text-transform:uppercase;';

        wrap.appendChild(timeEl);
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
        d.textContent = DAYS[now.getDay()] + ', ' + now.getDate() + ' ' + MONTHS[now.getMonth()];
    }

    function startClock(container) {
        console.log('[ATM] Запуск часов');
        var clk = createClock(currentMode);
        container.appendChild(clk);
        tickClock();
        clockInterval = setInterval(tickClock, 10000);
        if (Lampa.Storage.get('atm_clock', 'true') !== 'false') {
            setTimeout(function() { clk.style.opacity = '1'; }, 500);
        }
    }

    function stopClock() {
        if (clockInterval) {
            clearInterval(clockInterval);
            clockInterval = null;
        }
    }

    // =========================================================
    // ПОКАЗ ЗАСТАВКИ
    // =========================================================
    function showScreensaver() {
        console.log('[ATM] Вызов showScreensaver()');
        
        if (screensaverDiv) {
            console.log('[ATM] Заставка уже показана');
            return;
        }

        // Проверка активности плеера
        if (window.Lampa && Lampa.Activity && Lampa.Activity.active()) {
            var active = Lampa.Activity.active();
            console.log('[ATM] Активный компонент:', active.component);
            if (active.component === 'player') {
                console.log('[ATM] Плеер активен, заставка отменена');
                resetTimer();
                return;
            }
        }

        loadHlsJs(function () {
            console.log('[ATM] HLS.js готов, создание UI');
            
            currentMode = Lampa.Storage.get('atm_mode', 'fire');
            streamIndex = 0;
            
            var theme = THEME[currentMode];
            var soundOn = Lampa.Storage.get('atm_sound') !== 'false';
            var volume = parseInt(Lampa.Storage.get('atm_volume', '50')) / 100;

            console.log('[ATM] Режим:', currentMode, 'Звук:', soundOn, 'Громкость:', volume);

            screensaverDiv = document.createElement('div');
            screensaverDiv.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:9999999;overflow:hidden;';

            var video = document.createElement('video');
            video.id = 'atm-video';
            video.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            video.volume = volume;
            video.muted = !soundOn;
            video.autoplay = false;
            video.preload = 'auto';
            video.setAttribute('playsinline', '');

            var vignette = document.createElement('div');
            vignette.style.cssText = 'position:absolute;inset:0;background:' + theme.vignette + ';pointer-events:none;z-index:5;';

            var status = document.createElement('div');
            status.id = 'atm-status';
            status.style.cssText = 'position:absolute;bottom:40px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.7);font-family:Arial,sans-serif;font-size:18px;text-align:center;z-index:11;';
            status.textContent = 'Загрузка...';

            screensaverDiv.appendChild(video);
            screensaverDiv.appendChild(vignette);
            screensaverDiv.appendChild(status);
            document.body.appendChild(screensaverDiv);

            console.log('[ATM] UI создан, запуск часов и потока');
            startClock(screensaverDiv);
            loadStream(video, status);
        });
    }

    // =========================================================
    // ЗАГРУЗКА ПОТОКА
    // =========================================================
    function loadStream(video, status) {
        console.log('[ATM] loadStream() вызван');
        
        if (!screensaverDiv) {
            console.log('[ATM] screensaverDiv не существует, выход');
            return;
        }

        var streams = STREAMS[currentMode];
        if (streamIndex >= streams.length) {
            console.log('[ATM] Все потоки перебраны, начинаем сначала');
            streamIndex = 0;
        }

        var stream = streams[streamIndex];
        console.log('[ATM] Попытка загрузки потока #' + streamIndex + ':', stream.name);
        console.log('[ATM] URL:', stream.url);

        if (status) status.textContent = stream.name;

        if (hlsInstance) {
            console.log('[ATM] Уничтожение старого HLS instance');
            try { hlsInstance.destroy(); } catch(e) { console.error('[ATM] Ошибка destroy:', e); }
            hlsInstance = null;
        }

        var tryNextStream = function() {
            console.log('[ATM] Переход к следующему потоку');
            streamIndex++;
            setTimeout(function() { loadStream(video, status); }, 2000);
        };

        function tryPlay() {
            console.log('[ATM] Попытка воспроизведения');
            var soundOn = Lampa.Storage.get('atm_sound') !== 'false';
            var volume = parseInt(Lampa.Storage.get('atm_volume', '50')) / 100;
            
            video.volume = volume;
            video.muted = !soundOn;

            var playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise.then(function() {
                    console.log('[ATM] ✓ Воспроизведение началось');
                    if (status) {
                        setTimeout(function() { 
                            if (status) status.style.opacity = '0'; 
                        }, 3000);
                    }
                }).catch(function(err) {
                    console.error('[ATM] Ошибка play():', err);
                    if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
                        console.log('[ATM] Попытка воспроизведения с muted=true');
                        video.muted = true;
                        video.play().then(function() {
                            console.log('[ATM] ✓ Воспроизведение началось (без звука)');
                        }).catch(function(err2) {
                            console.error('[ATM] Не удалось воспроизвести даже с muted:', err2);
                            tryNextStream();
                        });
                    } else {
                        tryNextStream();
                    }
                });
            }
        }

        // Проверка поддержки HLS
        if (!window.Hls) {
            console.error('[ATM] HLS.js не загружен!');
            if (status) status.textContent = 'Ошибка: HLS.js не загружен';
            return;
        }

        if (!Hls.isSupported()) {
            console.log('[ATM] HLS.js не поддерживается, проверка нативного HLS');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                console.log('[ATM] Используем нативный HLS');
                video.src = stream.url;
                video.addEventListener('loadedmetadata', function() {
                    console.log('[ATM] Метаданные загружены (native HLS)');
                    tryPlay();
                });
                video.addEventListener('error', function(e) {
                    console.error('[ATM] Ошибка native HLS:', e);
                    tryNextStream();
                });
            } else {
                console.error('[ATM] HLS не поддерживается вообще');
                if (status) status.textContent = 'Ошибка: HLS не поддерживается';
            }
            return;
        }

        console.log('[ATM] Создание HLS instance');
        hlsInstance = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: false,
            maxBufferLength: 10,
            maxMaxBufferLength: 20,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 3,
            levelLoadingTimeOut: 10000,
            fragLoadingTimeOut: 20000
        });

        var manifestLoaded = false;
        var mediaAttached = false;

        hlsInstance.on(Hls.Events.MEDIA_ATTACHED, function() {
            console.log('[ATM] MEDIA_ATTACHED');
            mediaAttached = true;
        });

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
            console.log('[ATM] MANIFEST_PARSED, уровней:', data.levels.length);
            manifestLoaded = true;
            tryPlay();
        });

        hlsInstance.on(Hls.Events.LEVEL_LOADED, function(event, data) {
            console.log('[ATM] LEVEL_LOADED, фрагментов:', data.details.fragments.length);
        });

        hlsInstance.on(Hls.Events.FRAG_LOADED, function() {
            if (!manifestLoaded) {
                console.log('[ATM] Фрагмент загружен, пробуем играть');
                tryPlay();
            }
        });

        hlsInstance.on(Hls.Events.ERROR, function(event, data) {
            console.error('[ATM] HLS ERROR:', {
                type: data.type,
                details: data.details,
                fatal: data.fatal,
                url: data.url,
                response: data.response
            });

            if (data.fatal) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    console.log('[ATM] Фатальная сетевая ошибка');
                    tryNextStream();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    console.log('[ATM] Фатальная медиа ошибка, пробуем восстановить');
                    try {
                        hlsInstance.recoverMediaError();
                    } catch(e) {
                        console.error('[ATM] Не удалось восстановить:', e);
                        tryNextStream();
                    }
                } else {
                    console.log('[ATM] Другая фатальная ошибка');
                    tryNextStream();
                }
            }
        });

        console.log('[ATM] Загрузка источника:', stream.url);
        hlsInstance.loadSource(stream.url);
        
        console.log('[ATM] Привязка к видео элементу');
        hlsInstance.attachMedia(video);
    }

    // =========================================================
    // СКРЫТИЕ
    // =========================================================
    function hideScreensaver() {
        console.log('[ATM] Скрытие заставки');
        stopClock();
        
        if (hlsInstance) {
            try { 
                hlsInstance.destroy(); 
                console.log('[ATM] HLS instance уничтожен');
            } catch(e) {
                console.error('[ATM] Ошибка при уничтожении HLS:', e);
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
            console.log('[ATM] UI удалён');
        }
        
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(timer);
        var mins = parseInt(Lampa.Storage.get('atm_timeout', '5'));
        console.log('[ATM] Таймер сброшен на', mins, 'мин');
        timer = setTimeout(showScreensaver, mins * 60 * 1000);
    }

    // =========================================================
    // НАСТРОЙКИ
    // =========================================================
    function addSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) {
            console.error('[ATM] Lampa.SettingsApi недоступен');
            return;
        }
        if (settingsAdded) return;
        settingsAdded = true;

        console.log('[ATM] Добавление настроек');

        Lampa.SettingsApi.addComponent({
            component: 'atm_settings',
            name: 'Атмосфера',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: { name: 'atm_mode', type: 'select', values: { 'fire':'🔥 Камин', 'aqua':'🐟 Аквариум' }, default: 'fire' },
            field: { name: 'Режим' }
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: { name: 'atm_timeout', type: 'select', values: { '1':'1 мин','2':'2 мин','3':'3 мин','5':'5 мин','10':'10 мин' }, default: '5' },
            field: { name: 'Время бездействия' },
            onChange: resetTimer
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: { name: 'atm_clock', type: 'select', values: { 'true':'Показывать','false':'Скрыть' }, default: 'true' },
            field: { name: 'Часы' }
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: { name: 'atm_sound', type: 'select', values: { 'true':'Включён','false':'Выключен' }, default: 'false' },
            field: { name: 'Звук' }
        });

        Lampa.SettingsApi.addParam({
            component: 'atm_settings',
            param: { name: 'atm_volume', type: 'select', values: { '10':'10%','30':'30%','50':'50%','70':'70%','100':'100%' }, default: '50' },
            field: { name: 'Громкость' }
        });
    }

    // =========================================================
    // СОБЫТИЯ
    // =========================================================
    var events = ['keydown', 'mousemove', 'click', 'touchstart', 'wheel'];
    events.forEach(function (e) {
        window.addEventListener(e, function (ev) {
            if (screensaverDiv) {
                console.log('[ATM] Событие:', ev.type, '- скрытие заставки');
                hideScreensaver();
            } else {
                resetTimer();
            }
        }, { passive: true });
    });

    // =========================================================
    // ЗАПУСК
    // =========================================================
    function init() {
        console.log('[ATM] Инициализация');
        addSettings();
        resetTimer();
        console.log('[ATM] ✓ Плагин готов');
    }

    if (window.appready) {
        console.log('[ATM] App ready, запуск init()');
        init();
    } else {
        console.log('[ATM] Ожидание события app.ready');
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                console.log('[ATM] Получено событие app.ready');
                init();
            }
        });
    }

})();