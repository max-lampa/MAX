// @name         Атмосфера - Камин и Аквариум
// @version      7.2.0
// @description  Стабильная заставка для Lampa: MP4/HLS, резервные потоки, защита от зависаний. Android TV 9+
// @author       MaxTV | LampaUa | stable edit

(function() {
  'use strict';

  if (window.__atmosfera_stable_loaded) return;
  window.__atmosfera_stable_loaded = true;

  var HLS_SCRIPTS = [
    'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.18/hls.min.js'
  ];

  var STREAMS = {
    fire: [
      { name: 'Камин HD 1', type: 'mp4', url: 'https://videos.pexels.com/video-files/35042279/14844511_1920_1080_30fps.mp4' },
      { name: 'Камин HD 2', type: 'mp4', url: 'https://videos.pexels.com/video-files/2034100/2034100-hd_1920_1080_24fps.mp4' },
      { name: 'Камин HD 3', type: 'mp4', url: 'https://videos.pexels.com/video-files/6232461/6232461-hd_1920_1080_24fps.mp4' }
    ],
    aqua: [
      { name: 'Аквариум HD 1', type: 'mp4', url: 'https://videos.pexels.com/video-files/12142670/12142670-hd_1920_1080_30fps.mp4' },
      { name: 'Аквариум HD 2', type: 'mp4', url: 'https://videos.pexels.com/video-files/8950644/8950644-hd_1920_1080_30fps.mp4' },
      { name: 'Аквариум HD 3', type: 'mp4', url: 'https://videos.pexels.com/video-files/3147101/3147101-hd_1920_1080_25fps.mp4' }
    ]
  };

  var THEME = {
    fire: {
      timeGrad: 'linear-gradient(135deg,#FFD580 0%,#FF8C42 50%,#FF4F1F 100%)',
      dateColor: '#FFD580',
      vignette: 'radial-gradient(ellipse at center,transparent 28%,rgba(10,0,0,0.58) 100%)'
    },
    aqua: {
      timeGrad: 'linear-gradient(135deg,#A8EDFF 0%,#38C8FF 45%,#0080C8 100%)',
      dateColor: '#A8EDFF',
      vignette: 'radial-gradient(ellipse at center,transparent 28%,rgba(0,10,30,0.58) 100%)'
    }
  };

  var DAYS = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
  var MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

  var timer = null;
  var screensaverDiv = null;
  var activeVideo = null;
  var hlsInstance = null;
  var clockInterval = null;
  var watchdogInterval = null;
  var startTimeout = null;
  var settingsAdded = false;
  var initialized = false;
  var hlsLoading = false;
  var hlsCallbacks = [];
  var currentMode = 'fire';
  var streamIndex = 0;
  var loadSeq = 0;
  var lastActivityAt = 0;
  var ignoreActivityUntil = 0;
  var videoHandlers = [];
  var stuckTicks = 0;
  var lastVideoTime = -1;

  function storageGet(key, fallback) {
    try { if (window.Lampa && Lampa.Storage) return Lampa.Storage.get(key, fallback); } catch(e) {}
    return fallback;
  }

  function storageBool(key, fallback) {
    var value = storageGet(key, fallback ? 'true' : 'false');
    if (typeof value === 'boolean') return value;
    if (value === undefined || value === null) return !!fallback;
    value = String(value).toLowerCase();
    return value !== 'false' && value !== '0' && value !== 'off' && value !== 'no';
  }

  function storageNumber(key, fallback, min, max) {
    var value = parseInt(storageGet(key, String(fallback)), 10);
    if (isNaN(value)) value = fallback;
    if (typeof min === 'number' && value < min) value = min;
    if (typeof max === 'number' && value > max) value = max;
    return value;
  }

  function isPlayerActive() {
    try {
      return !!(window.Lampa && Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active() && Lampa.Activity.active().component === 'player');
    } catch(e) { return false; }
  }

  function addStyleOnce() {
    if (document.getElementById('atm-stable-style')) return;
    var style = document.createElement('style');
    style.id = 'atm-stable-style';
    style.textContent =
      '#atm-saver{position:fixed;inset:0;background:#000;z-index:9999999;overflow:hidden;opacity:0;transition:opacity .35s ease;}' +
      '#atm-saver.atm-visible{opacity:1;}' +
      '#atm-saver video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000;}' +
      '#atm-saver .atm-vignette{position:absolute;inset:0;pointer-events:none;z-index:5;}' +
      '#atm-clock{position:absolute;top:40px;right:50px;text-align:right;pointer-events:none;z-index:20;opacity:0;transition:opacity .7s ease;text-shadow:0 3px 20px rgba(0,0,0,.65);}' +
      '#atm-time{font-family:Arial,sans-serif;font-size:clamp(52px,7vw,86px);font-weight:700;line-height:1;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}' +
      '#atm-date{font-family:Arial,sans-serif;font-size:clamp(16px,2vw,22px);margin-top:10px;text-transform:uppercase;letter-spacing:.04em;}' +
      '@media (max-width:700px){#atm-clock{top:24px;right:28px;}}';
    document.head.appendChild(style);
  }

  function loadHlsJs(callback) {
    if (window.Hls) { callback(true); return; }
    hlsCallbacks.push(callback);
    if (hlsLoading) return;
    hlsLoading = true;
    var index = 0;
    function finish(ok) {
      hlsLoading = false;
      var cbs = hlsCallbacks.slice(0); hlsCallbacks = [];
      cbs.forEach(function(cb) { cb(ok); });
    }
    function tryLoad() {
      if (index >= HLS_SCRIPTS.length) { finish(false); return; }
      var script = document.createElement('script');
      script.src = HLS_SCRIPTS[index++];
      script.async = true;
      script.onload = function() { finish(!!window.Hls); };
      script.onerror = tryLoad;
      document.head.appendChild(script);
    }
    tryLoad();
  }

  function normalizeMode(mode) { return STREAMS[mode] ? mode : 'fire'; }

  function getCurrentStream() {
    var list = STREAMS[currentMode] || STREAMS.fire;
    if (streamIndex >= list.length) streamIndex = 0;
    if (streamIndex < 0) streamIndex = 0;
    return list[streamIndex];
  }

  function updateVideoAudio(video) {
    if (!video) return;
    var soundOn = storageBool('atm_sound', false);
    var volume = storageNumber('atm_volume', 50, 0, 100) / 100;
    video.volume = volume;
    video.muted = !soundOn;
  }

  /* ─── ЧАСЫ ─── */
  function createClock(mode) {
    var theme = THEME[mode] || THEME.fire;
    var wrap = document.createElement('div');
    var timeEl = document.createElement('div');
    var dateEl = document.createElement('div');
    wrap.id = 'atm-clock';
    timeEl.id = 'atm-time';
    dateEl.id = 'atm-date';
    timeEl.style.background = theme.timeGrad;
    timeEl.style.webkitBackgroundClip = 'text';
    timeEl.style.backgroundClip = 'text';
    timeEl.style.webkitTextFillColor = 'transparent';
    dateEl.style.color = theme.dateColor;
    wrap.appendChild(timeEl);
    wrap.appendChild(dateEl);
    return wrap;
  }

  function tickClock() {
    var timeEl = document.getElementById('atm-time');
    var dateEl = document.getElementById('atm-date');
    if (!timeEl || !dateEl) return;
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var timeStr = (h < 10 ? '0' + h : '' + h) + ':' + (m < 10 ? '0' + m : '' + m);
    var dateStr = DAYS[now.getDay()] + ', ' + now.getDate() + ' ' + MONTHS[now.getMonth()];
    if (timeEl.textContent !== timeStr) timeEl.textContent = timeStr;
    if (dateEl.textContent !== dateStr) dateEl.textContent = dateStr;
  }

  function startClock(container) {
    stopClock();
    if (!storageBool('atm_clock', true)) return;
    var clock = createClock(currentMode);
    container.appendChild(clock);
    tickClock();
    /* Обновляем каждые 15 секунд — достаточно для минутной точности */
    clockInterval = setInterval(tickClock, 15000);
    setTimeout(function() { if (clock && clock.parentNode) clock.style.opacity = '1'; }, 300);
  }

  function stopClock() {
    if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
  }

  function clearStartTimeout() {
    if (startTimeout) { clearTimeout(startTimeout); startTimeout = null; }
  }

  function clearWatchdog() {
    if (watchdogInterval) { clearInterval(watchdogInterval); watchdogInterval = null; }
    stuckTicks = 0; lastVideoTime = -1;
  }

  function cleanupVideoHandlers() {
    videoHandlers.forEach(function(item) { item.target.removeEventListener(item.event, item.handler); });
    videoHandlers = [];
  }

  function onVideo(target, event, handler) {
    target.addEventListener(event, handler);
    videoHandlers.push({ target: target, event: event, handler: handler });
  }

  function destroyHls() {
    if (!hlsInstance) return;
    try { hlsInstance.destroy(); } catch(e) {}
    hlsInstance = null;
  }

  function resetVideoElement(video) {
    if (!video) return;
    try { video.pause(); } catch(e) {}
    try { video.removeAttribute('src'); } catch(e) {}
    try { video.load(); } catch(e) {}
  }

  /* ─── playVideo без статус-надписей ─── */
  function playVideo(video, onFail) {
    if (!video || !screensaverDiv) return;
    updateVideoAudio(video);
    var promise;
    try { promise = video.play(); } catch(e) { onFail(e); return; }
    if (!promise || !promise.then) return;
    promise.catch(function(error) {
      if (!screensaverDiv) return;
      /* Браузер/TV заблокировал воспроизведение со звуком — запускаем muted */
      video.muted = true;
      try {
        var p = video.play();
        if (p && p.then) {
          p.then(function() {
            /* После успешного старта восстанавливаем пользовательские настройки звука */
            updateVideoAudio(video);
          });
        }
        if (p && p.catch) p.catch(onFail);
      } catch(e) { onFail(error || e); }
    });
  }

  function nextStream(reason) {
    if (!screensaverDiv || !activeVideo) return;
    var list = STREAMS[currentMode] || STREAMS.fire;
    streamIndex = (streamIndex + 1) % list.length;
    setTimeout(function() {
      if (screensaverDiv && activeVideo) loadStream(activeVideo);
    }, 600);
  }

  function startWatchdog(video) {
    clearWatchdog();
    watchdogInterval = setInterval(function() {
      if (!screensaverDiv || !video) { clearWatchdog(); return; }
      if (video.paused && video.readyState >= 2) {
        playVideo(video, function() { nextStream('paused'); });
        return;
      }
      var currentTime = video.currentTime || 0;
      var notMoving = Math.abs(currentTime - lastVideoTime) < 0.05;
      var notReady = video.readyState < 2;
      if (notMoving || notReady) stuckTicks++;
      else stuckTicks = 0;
      lastVideoTime = currentTime;
      if (stuckTicks >= 3) nextStream('stuck');
    }, 7000);
  }

  function loadMp4(video, stream, token) {
    var playRequested = false;
    video.loop = true;
    video.preload = 'auto';
    video.src = stream.url;
    video.load();

    function requestPlay() {
      if (playRequested || !screensaverDiv || token !== loadSeq) return;
      playRequested = true;
      playVideo(video, function() { if (token !== loadSeq) return; nextStream('mp4-play-error'); });
    }

    onVideo(video, 'loadeddata', requestPlay);
    onVideo(video, 'canplay', requestPlay);
    onVideo(video, 'playing', function() {
      if (token !== loadSeq) return;
      clearStartTimeout();
      updateVideoAudio(video);
      startWatchdog(video);
    });
    onVideo(video, 'error', function() {
      if (token !== loadSeq) return;
      nextStream('mp4-error');
    });
    setTimeout(requestPlay, 250);
  }

  function loadNativeHls(video, stream, token) {
    var playRequested = false;
    video.loop = false;
    video.src = stream.url;
    video.load();

    function requestPlay() {
      if (playRequested || !screensaverDiv || token !== loadSeq) return;
      playRequested = true;
      playVideo(video, function() { if (token !== loadSeq) return; nextStream('native-hls-play-error'); });
    }

    onVideo(video, 'loadedmetadata', requestPlay);
    onVideo(video, 'canplay', requestPlay);
    onVideo(video, 'playing', function() {
      if (token !== loadSeq) return;
      clearStartTimeout();
      updateVideoAudio(video);
      startWatchdog(video);
    });
    onVideo(video, 'error', function() {
      if (token !== loadSeq) return;
      nextStream('native-hls-error');
    });
  }

  function loadHls(video, stream, token) {
    video.loop = false;
    loadHlsJs(function(ok) {
      if (!screensaverDiv || !video || token !== loadSeq) return;
      if (!ok || !window.Hls || !Hls.isSupported()) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          loadNativeHls(video, stream, token);
        } else { nextStream('hls-not-supported'); }
        return;
      }
      var recovered = false;
      hlsInstance = new Hls({
        debug: false, enableWorker: true, lowLatencyMode: false,
        capLevelToPlayerSize: true, backBufferLength: 0,
        maxBufferLength: 18, maxMaxBufferLength: 24,
        manifestLoadingTimeOut: 12000, manifestLoadingMaxRetry: 1,
        levelLoadingTimeOut: 12000, fragLoadingTimeOut: 18000,
        fragLoadingMaxRetry: 2, nudgeMaxRetry: 3
      });
      hlsInstance.on(Hls.Events.MEDIA_ATTACHED, function() { hlsInstance.loadSource(stream.url); });
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
        playVideo(video, function() { if (token !== loadSeq) return; nextStream('hls-play-error'); });
      });
      hlsInstance.on(Hls.Events.ERROR, function(event, data) {
        if (token !== loadSeq || !data || !data.fatal) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !recovered) {
          recovered = true;
          try { hlsInstance.recoverMediaError(); return; } catch(e) {}
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !recovered) {
          recovered = true;
          try { hlsInstance.startLoad(); return; } catch(e) {}
        }
        nextStream('hls-fatal-error');
      });
      onVideo(video, 'playing', function() {
        if (token !== loadSeq) return;
        clearStartTimeout();
        updateVideoAudio(video);
        startWatchdog(video);
      });
      onVideo(video, 'error', function() {
        if (token !== loadSeq) return;
        nextStream('video-hls-error');
      });
      hlsInstance.attachMedia(video);
    });
  }

  function loadStream(video) {
    if (!screensaverDiv || !video) return;
    clearStartTimeout();
    clearWatchdog();
    cleanupVideoHandlers();
    destroyHls();
    resetVideoElement(video);

    var stream = getCurrentStream();
    var type = stream.type || (stream.url.indexOf('.m3u8') > -1 ? 'hls' : 'mp4');
    var token = ++loadSeq;

    updateVideoAudio(video);

    startTimeout = setTimeout(function() {
      if (token !== loadSeq) return;
      nextStream('start-timeout');
    }, 16000);

    if (type === 'hls') loadHls(video, stream, token);
    else loadMp4(video, stream, token);
  }

  function showScreensaver() {
    if (screensaverDiv) return;
    if (document.hidden || isPlayerActive()) { resetTimer(); return; }

    addStyleOnce();
    currentMode = normalizeMode(storageGet('atm_mode', 'fire'));
    streamIndex = 0;

    var theme = THEME[currentMode] || THEME.fire;
    var root = document.createElement('div');
    var video = document.createElement('video');
    var vignette = document.createElement('div');

    root.id = 'atm-saver';
    video.id = 'atm-video';
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.disablePictureInPicture = true;
    vignette.className = 'atm-vignette';
    vignette.style.background = theme.vignette;

    updateVideoAudio(video);
    root.appendChild(video);
    root.appendChild(vignette);
    document.body.appendChild(root);

    screensaverDiv = root;
    activeVideo = video;
    ignoreActivityUntil = Date.now() + 800;

    startClock(root);
    setTimeout(function() { if (root && root.parentNode) root.classList.add('atm-visible'); }, 30);

    loadStream(video);
  }

  function hideScreensaver() {
    stopClock();
    clearStartTimeout();
    clearWatchdog();
    cleanupVideoHandlers();
    destroyHls();

    if (activeVideo) { resetVideoElement(activeVideo); activeVideo = null; }

    if (screensaverDiv) {
      var node = screensaverDiv;
      screensaverDiv = null;
      node.classList.remove('atm-visible');
      setTimeout(function() { if (node && node.parentNode) node.parentNode.removeChild(node); }, 180);
    }
    resetTimer();
  }

  function resetTimer() {
    if (timer) clearTimeout(timer);
    if (screensaverDiv) return;
    if (!storageBool('atm_enabled', true)) return;
    var minutes = storageNumber('atm_timeout', 5, 1, 120);
    timer = setTimeout(showScreensaver, minutes * 60 * 1000);
  }

  function addSettings() {
    if (settingsAdded) return;
    if (!window.Lampa || !Lampa.SettingsApi) { setTimeout(addSettings, 500); return; }
    settingsAdded = true;

    Lampa.SettingsApi.addComponent({
      component: 'atm_settings',
      name: 'Атмосфера',
      icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
    });

    Lampa.SettingsApi.addParam({ component:'atm_settings', param:{name:'atm_enabled',type:'select',values:{'true':'Включена','false':'Выключена'},default:'true'}, field:{name:'Заставка'}, onChange:resetTimer });
    Lampa.SettingsApi.addParam({ component:'atm_settings', param:{name:'atm_mode',type:'select',values:{fire:'Камин',aqua:'Аквариум'},default:'fire'}, field:{name:'Режим'} });
    Lampa.SettingsApi.addParam({ component:'atm_settings', param:{name:'atm_timeout',type:'select',values:{'1':'1 мин','2':'2 мин','3':'3 мин','5':'5 мин','10':'10 мин','15':'15 мин','30':'30 мин'},default:'5'}, field:{name:'Время бездействия'}, onChange:resetTimer });
    Lampa.SettingsApi.addParam({ component:'atm_settings', param:{name:'atm_clock',type:'select',values:{'true':'Показывать','false':'Скрыть'},default:'true'}, field:{name:'Часы'} });
    Lampa.SettingsApi.addParam({ component:'atm_settings', param:{name:'atm_sound',type:'select',values:{'true':'Включен','false':'Выключен'},default:'false'}, field:{name:'Звук'}, onChange:function(){ updateVideoAudio(activeVideo); } });
    Lampa.SettingsApi.addParam({ component:'atm_settings', param:{name:'atm_volume',type:'select',values:{'0':'0%','10':'10%','30':'30%','50':'50%','70':'70%','100':'100%'},default:'50'}, field:{name:'Громкость'}, onChange:function(){ updateVideoAudio(activeVideo); } });
    Lampa.SettingsApi.addParam({ component:'atm_settings', param:{type:'button',name:'atm_test_now'}, field:{name:'Запустить заставку сейчас'}, onChange:showScreensaver });
  }

  function activityHandler() {
    if (screensaverDiv) {
      if (Date.now() < ignoreActivityUntil) return;
      hideScreensaver(); return;
    }
    var now = Date.now();
    if (now - lastActivityAt < 1500) return;
    lastActivityAt = now;
    resetTimer();
  }

  function bindActivityEvents() {
    ['keydown','mousemove','click','touchstart','wheel','pointerdown'].forEach(function(ev) {
      try { window.addEventListener(ev, activityHandler, { passive: true }); }
      catch(e) { window.addEventListener(ev, activityHandler); }
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    addStyleOnce();
    addSettings();
    bindActivityEvents();
    resetTimer();
  }

  if (window.Lampa && window.appready) {
    init();
  } else if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) {
    Lampa.Listener.follow('app', function(event) { if (event.type === 'ready') init(); });
  } else {
    setTimeout(init, 1000);
  }
})();