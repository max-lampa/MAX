(function () {
  'use strict';

  if (window.plugin_lampa_loader_ready) return;
  window.plugin_lampa_loader_ready = true;

  function removeElement(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  function removeById(id) {
    removeElement(document.getElementById(id));
  }

  var DEFAULT_CONFIG = {
    minDisplayTime: 7000,
    accessGrantedDelay: 2000,
    fadeOutDuration: 1500,
    matrix: {
      fontSize: 14,
      fadeAlpha: 0.05,
      frameInterval: 50,
      resetThreshold: 0.975,
      initialDropOffset: -100,
      resizeDebounce: 100,
      chars: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()'
    },
    colors: ['#00ff00', '#0affef', '#ff00ff', '#ff6b00'],
    colorChangeInterval: 2500,
    particles: {
      count: 30,
      minDuration: 10,
      maxDuration: 20,
      maxDelay: 15
    },
    typing: {
      minDelay: 50,
      maxDelay: 100,
      pauseBetweenCommands: 2000,
      startDelay: 1000
    },
    progress: {
      minDuration: 300,
      durationMultiplier: 20
    },
    step: {
      baseDelay: 600,
      randomDelay: 300
    },
    polling: {
      interval: 50,
      maxAttempts: 100
    },
    autoProgressDelay: 1000,
    glitch: {
      interval: 3000,
      duration: 100,
      maxOffset: 2
    },
    borderGlow: {
      interval: 3000,
      colors: ['rgba(0,255,0,0.3)', 'rgba(10,255,239,0.3)', 'rgba(255,0,255,0.3)']
    },
    vhs: {
      duration: 8000
    },
    fontFamily: '"JetBrains Mono","Courier New",monospace',
    fontUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap',
    reducedMotion: false
  };

  function mergeConfig(target, source) {
    var result = {};
    for (var key in target) {
      if (target.hasOwnProperty(key)) {
        if (source && source.hasOwnProperty(key) && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          result[key] = mergeConfig(target[key], source[key]);
        } else if (source && source.hasOwnProperty(key)) {
          result[key] = source[key];
        } else {
          result[key] = target[key];
        }
      }
    }
    return result;
  }

  var CONFIG = mergeConfig(DEFAULT_CONFIG, window.LAMPA_LOADER_CONFIG || {});

  var LOADER_PRESETS = { off: 'Выкл', 3: '3', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10' };
  var LOADER_PRESET_DEFAULT = '7';
  var BASE_DURATION_SEC = 7;

  function getPresetFromStorage() {
    try {
      if (typeof Lampa !== 'undefined' && Lampa.Storage) {
        return (Lampa.Storage.get('loader_display_preset', LOADER_PRESET_DEFAULT) + '').trim();
      }
      return (typeof localStorage !== 'undefined' && localStorage.getItem('loader_display_preset')) || LOADER_PRESET_DEFAULT;
    } catch (e) {
      return LOADER_PRESET_DEFAULT;
    }
  }

  function applyPresetScale(sec) {
    if (!sec || sec < 3 || sec > 10) return;
    var scale = sec / BASE_DURATION_SEC;
    CONFIG.minDisplayTime = sec * 1000;
    CONFIG.accessGrantedDelay = Math.max(500, Math.round(2000 * scale));
    CONFIG.fadeOutDuration = Math.max(400, Math.round(1500 * scale));
    CONFIG.typing.startDelay = Math.round(1000 * scale);
    CONFIG.typing.pauseBetweenCommands = Math.round(2000 * scale);
    CONFIG.step.baseDelay = Math.round(600 * scale);
    CONFIG.step.randomDelay = Math.max(100, Math.round(300 * scale));
    CONFIG.autoProgressDelay = Math.round(1000 * scale);
    CONFIG.progress.minDuration = Math.max(150, Math.round(300 * scale));
    CONFIG.progress.durationMultiplier = Math.max(10, Math.round(20 * scale));
    CONFIG.glitch.interval = Math.round(3000 * scale);
    CONFIG.borderGlow.interval = Math.round(3000 * scale);
    CONFIG.vhs.duration = Math.round(8000 * scale);
    CONFIG.colorChangeInterval = Math.round(2500 * scale);
    log('Applied loader preset scale: ' + sec + 's');
  }

  (function applyPresetEarly() {
    var preset = getPresetFromStorage();
    if (preset === 'off' || preset === '0') {
      CONFIG.loaderDisabled = true;
      return;
    }
    var sec = parseInt(preset, 10);
    if (!isNaN(sec) && sec >= 3 && sec <= 10) {
      applyPresetScale(sec);
    }
  })();

  if (!CONFIG.reducedMotion && window.matchMedia) {
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      CONFIG.reducedMotion = true;
      CONFIG.matrix.frameInterval = 100;
      CONFIG.particles.count = 10;
    }
  }

  var loaderStartTime = Date.now();

  var STYLE_IDS = {
    critical: 'lampa-loader-critical',
    main: 'lampa-loader-styles'
  };

  var STYLES = [
    '.lampa-terminal-loader{position:absolute;top:0;left:0;right:0;bottom:0;z-index:1;background:#0a0a0f;font-family:' + CONFIG.fontFamily + ';overflow:hidden;contain:strict}',
    '.lampa-terminal-loader *{box-sizing:border-box}',
    '.lampa-terminal-loader .matrix-canvas{position:absolute;top:0;left:0;z-index:0;opacity:0.3}',
    '.lampa-terminal-loader .hex-grid{position:absolute;top:0;left:0;right:0;bottom:0;background-image:linear-gradient(rgba(0,255,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,0,0.03) 1px,transparent 1px);background-size:50px 50px;z-index:1;pointer-events:none}',
    '.lampa-terminal-loader .scanlines{position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15) 1px,transparent 1px,transparent 2px);pointer-events:none;z-index:10}',
    '.lampa-terminal-loader .vhs-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(to bottom,transparent 0%,rgba(0,255,0,0.02) 50%,transparent 100%);animation:vhs-move ' + CONFIG.vhs.duration + 'ms linear infinite;pointer-events:none;z-index:11}',
    '@keyframes vhs-move{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}',
    '.lampa-terminal-loader .particles{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:2}',
    '.lampa-terminal-loader .particle{position:absolute;width:2px;height:2px;background:#00ff00;border-radius:50%;opacity:0;animation:particle-float linear infinite}',
    '@keyframes particle-float{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-100vh) scale(1);opacity:0}}',
    '.lampa-terminal-loader .container{position:relative;z-index:5;display:flex;align-items:center;justify-content:center;min-height:100%;height:100%;padding:20px}',
    '.lampa-terminal-loader .terminal{position:relative;background:linear-gradient(145deg,rgba(20,20,30,0.95),rgba(10,10,15,0.98));border:1px solid rgba(0,255,0,0.3);border-radius:10px;padding:0;width:100%;max-width:600px;box-shadow:0 0 20px rgba(0,255,0,0.2),0 0 40px rgba(0,255,0,0.1),inset 0 0 60px rgba(0,0,0,0.5);overflow:hidden;animation:border-glow ' + CONFIG.borderGlow.interval + 'ms ease-in-out infinite}',
    '@keyframes border-glow{0%,100%{border-color:rgba(0,255,0,0.3);box-shadow:0 0 20px ' + CONFIG.borderGlow.colors[0] + ',0 0 40px rgba(0,255,0,0.1)}33%{border-color:rgba(10,255,239,0.3);box-shadow:0 0 20px ' + CONFIG.borderGlow.colors[1] + ',0 0 40px rgba(10,255,239,0.1)}66%{border-color:rgba(255,0,255,0.3);box-shadow:0 0 20px ' + CONFIG.borderGlow.colors[2] + ',0 0 40px rgba(255,0,255,0.1)}}',
    '.lampa-terminal-loader .terminal-header{background:linear-gradient(90deg,#1a1a2e,#16213e);padding:12px 15px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(0,255,0,0.2)}',
    '.lampa-terminal-loader .terminal-btn{width:12px;height:12px;border-radius:50%;transition:all 0.3s ease}',
    '.lampa-terminal-loader .btn-red{background:linear-gradient(145deg,#ff5f56,#e33e32);box-shadow:0 0 10px rgba(255,95,86,0.5)}',
    '.lampa-terminal-loader .btn-yellow{background:linear-gradient(145deg,#ffbd2e,#e5a00d);box-shadow:0 0 10px rgba(255,189,46,0.5)}',
    '.lampa-terminal-loader .btn-green{background:linear-gradient(145deg,#27c93f,#1aab29);box-shadow:0 0 10px rgba(39,201,63,0.5)}',
    '.lampa-terminal-loader .terminal-title{margin-left:auto;color:rgba(255,255,255,0.5);font-size:12px}',
    '.lampa-terminal-loader .terminal-body{padding:25px}',
    '.lampa-terminal-loader .logo{text-align:center;font-size:2.5em;font-weight:700;color:#00ff00;letter-spacing:0.15em;margin-bottom:25px;text-shadow:0 0 20px #00ff00,0 0 40px #00ff00,0 0 60px #00ff00;animation:matrix-glow 2s ease-in-out infinite}',
    '@keyframes matrix-glow{0%,100%{text-shadow:0 0 20px #00ff00,0 0 40px #00ff00,0 0 60px #00ff00}50%{text-shadow:0 0 30px #00ff00,0 0 50px #00ff00,0 0 80px #00ff00,0 0 100px rgba(0,255,0,0.3)}}',
    '.lampa-terminal-loader .status-lines{margin-bottom:25px}',
    '.lampa-terminal-loader .status-line{display:flex;align-items:center;padding:8px 0;font-size:0.9em;color:rgba(255,255,255,0.8);opacity:0;transform:translateX(-20px);animation:slide-in 0.5s forwards}',
    '.lampa-terminal-loader .status-line:nth-child(1){animation-delay:0.1s}',
    '.lampa-terminal-loader .status-line:nth-child(2){animation-delay:0.3s}',
    '.lampa-terminal-loader .status-line:nth-child(3){animation-delay:0.5s}',
    '.lampa-terminal-loader .status-line:nth-child(4){animation-delay:0.7s}',
    '.lampa-terminal-loader .status-line:nth-child(5){animation-delay:0.9s}',
    '@keyframes slide-in{to{opacity:1;transform:translateX(0)}}',
    '.lampa-terminal-loader .status-icon{width:10px;height:10px;border-radius:50%;margin-right:12px;flex-shrink:0}',
    '.lampa-terminal-loader .status-icon.success{background:#00ff00;box-shadow:0 0 10px #00ff00}',
    '.lampa-terminal-loader .status-icon.loading{background:#ffbd2e;box-shadow:0 0 10px #ffbd2e;animation:pulse 1s infinite}',
    '@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}',
    '.lampa-terminal-loader .progress-container{margin-bottom:20px}',
    '.lampa-terminal-loader .progress-label{display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85em;color:#0affef;text-transform:uppercase;letter-spacing:2px}',
    '.lampa-terminal-loader .progress-bar{height:8px;background:rgba(0,255,0,0.1);border-radius:4px;overflow:hidden;border:1px solid rgba(0,255,0,0.3)}',
    '.lampa-terminal-loader .progress-fill{height:100%;width:0%;background:linear-gradient(90deg,#00ff00,#0affef,#00ff00);background-size:200% 100%;border-radius:4px;transition:width 0.3s ease-out;animation:progress-glow 2s linear infinite}',
    '@keyframes progress-glow{0%{background-position:0% 50%}100%{background-position:200% 50%}}',
    '.lampa-terminal-loader .typing-container{background:rgba(0,0,0,0.3);border-radius:5px;padding:15px;border:1px solid rgba(0,255,0,0.2)}',
    '.lampa-terminal-loader .typing-text{font-size:0.9em;color:#00ff00}',
    '.lampa-terminal-loader .prompt{color:#ff00ff;margin-right:10px}',
    '.lampa-terminal-loader .cursor{display:inline-block;width:10px;height:1.2em;background:#00ff00;animation:blink 0.7s infinite;vertical-align:text-bottom}',
    '@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}',
    '.lampa-terminal-loader .access-granted{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(0);font-size:3em;font-weight:700;color:#00ff00;text-shadow:0 0 20px #00ff00,0 0 40px #00ff00,0 0 60px #00ff00;opacity:0;z-index:20;transition:all 0.5s cubic-bezier(0.68,-0.55,0.265,1.55);letter-spacing:5px;pointer-events:none;white-space:nowrap;width:max-content;max-width:90%}',
    '.lampa-terminal-loader .access-granted.show{transform:translate(-50%,-50%) scale(1);opacity:1}',
    '.lampa-terminal-loader.fade-out{opacity:0;transition:opacity 1.5s ease}',
    '@media (max-width:380px){.lampa-terminal-loader .container{padding:10px}.lampa-terminal-loader .terminal-body{padding:12px 15px}.lampa-terminal-loader .logo{font-size:1.35em;letter-spacing:0.08em;margin-bottom:15px}.lampa-terminal-loader .status-line{font-size:0.75em;padding:5px 0}.lampa-terminal-loader .status-icon{width:8px;height:8px;margin-right:8px}.lampa-terminal-loader .progress-label,.lampa-terminal-loader .typing-text{font-size:0.75em}.lampa-terminal-loader .typing-container{padding:10px}.lampa-terminal-loader .terminal-header{padding:8px 12px}.lampa-terminal-loader .terminal-btn{width:10px;height:10px}.lampa-terminal-loader .access-granted{font-size:1.4em;letter-spacing:2px}}',
    '@media (min-width:381px) and (max-width:600px){.lampa-terminal-loader .container{padding:15px}.lampa-terminal-loader .terminal-body{padding:18px 20px}.lampa-terminal-loader .logo{font-size:1.8em;margin-bottom:20px}.lampa-terminal-loader .status-line{font-size:0.85em;padding:6px 0}.lampa-terminal-loader .access-granted{font-size:2em}}',
    '@media (min-width:601px) and (max-width:960px){.lampa-terminal-loader .terminal{max-width:520px}.lampa-terminal-loader .logo{font-size:2.2em}.lampa-terminal-loader .access-granted{font-size:2.6em}}',
    '@media (min-width:961px) and (max-width:1280px){.lampa-terminal-loader .terminal{max-width:560px}.lampa-terminal-loader .logo{font-size:2.4em}.lampa-terminal-loader .access-granted{font-size:2.8em}}',
    '@media (min-width:1281px){.lampa-terminal-loader .terminal{max-width:min(600px,45vw)}.lampa-terminal-loader .container{padding:clamp(20px,2vw,40px)}.lampa-terminal-loader .logo{font-size:clamp(2.2em,2.5vw,3em)}.lampa-terminal-loader .status-line{font-size:clamp(0.85em,1vw,1em)}.lampa-terminal-loader .access-granted{font-size:clamp(2.2em,2.5vw,3.2em)}}'
  ].join('');

  var HTML = [
    '<div class="lampa-terminal-loader">',
    '<canvas class="matrix-canvas"></canvas>',
    '<div class="hex-grid"></div>',
    '<div class="scanlines"></div>',
    '<div class="vhs-overlay"></div>',
    '<div class="particles"></div>',
    '<div class="container">',
    '<div class="terminal">',
    '<div class="terminal-header">',
    '<div class="terminal-btn btn-red"></div>',
    '<div class="terminal-btn btn-yellow"></div>',
    '<div class="terminal-btn btn-green"></div>',
    '<span class="terminal-title">lampa_loader.sh</span>',
    '</div>',
    '<div class="terminal-body">',
    '<div class="logo">LAMPA</div>',
    '<div class="status-lines">',
    '<div class="status-line"><span class="status-icon loading"></span><span class="status-text">[..] Инициализация ядра...</span></div>',
    '<div class="status-line"><span class="status-icon loading"></span><span class="status-text">[..] Загрузка модулей...</span></div>',
    '<div class="status-line"><span class="status-icon loading"></span><span class="status-text">[..] Подключение плагинов...</span></div>',
    '<div class="status-line"><span class="status-icon loading"></span><span class="status-text">[..] Синхронизация данных...</span></div>',
    '<div class="status-line"><span class="status-icon loading"></span><span class="status-text">[..] Запуск LAMPA...</span></div>',
    '</div>',
    '<div class="progress-container">',
    '<div class="progress-label"><span>ЗАГРУЗКА СИСТЕМЫ</span><span class="progress-percent">0%</span></div>',
    '<div class="progress-bar"><div class="progress-fill"></div></div>',
    '</div>',
    '<div class="typing-container">',
    '<div class="typing-text"><span class="prompt">root@lampa:~$</span><span class="typed-text"></span><span class="cursor"></span></div>',
    '</div>',
    '</div>',
    '<div class="access-granted">ACCESS GRANTED</div>',
    '</div>',
    '</div>',
    '</div>'
  ].join('');

  var statusSteps = [
    { text: '[OK] Инициализация ядра...', status: 'success' },
    { text: '[OK] Загрузка модулей...', status: 'success' },
    { text: '[OK] Подключение плагинов...', status: 'success' },
    { text: '[OK] Синхронизация данных...', status: 'success' },
    { text: '[OK] Запуск LAMPA...', status: 'success' }
  ];

  var commands = [
    'initializing kernel...',
    'loading modules...',
    'connecting plugins...',
    'syncing data...',
    'starting lampa...',
    'system ready_'
  ];

  var STEP_MAP = {
    0: 0, // Storage
    1: 0, // Cache
    2: 1, // Mirrors
    3: 2, // Plugins
    4: 3, // Proxy
    5: 4  // Account
  };

  var loader = {
    html: null,
    matrix: null,
    particles: null,
    typewriter: null,
    progress: 0,
    targetProgress: 0,
    currentStep: -1,
    destroyed: false,
    styleElement: null,
    progressAnimationId: null,
    stepQueue: [],
    processingStep: false,
    lampaHooked: false,
    cachedElements: {},
    originalFadeOut: null,
    welcomeObserver: null,
    pollingIntervalId: null,
    autoProgressTimeoutId: null,
    stepTimeoutId: null,
    destroyScheduled: false,
    glitch: null,
    visibilityHandler: null
  };

  function isActive() {
    return !loader.destroyed && loader.html;
  }

  function log() {
    console.log.apply(console, ['Lampa Loader'].concat(Array.prototype.slice.call(arguments)));
  }

  function hasJQuery() {
    return typeof $ !== 'undefined' && $.fn;
  }

  function loadFontAsync() {
    if (!CONFIG.fontUrl) return;

    var link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = CONFIG.fontUrl;
    link.onload = function () {
      this.rel = 'stylesheet';
    };
    link.onerror = function () {
      log('Font loading failed, using fallback');
    };
    document.head.appendChild(link);
  }

  function getElement(selector) {
    if (!loader.cachedElements[selector]) {
      loader.cachedElements[selector] = loader.html ? loader.html.querySelector(selector) : null;
    }
    return loader.cachedElements[selector];
  }

  function clearCache() {
    loader.cachedElements = {};
  }

  function MatrixRain(canvas) {
    if (!canvas) return;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.charArray = CONFIG.matrix.chars.split('');
    this.drops = [];
    this.colorIndex = 0;
    this.lastFrameTime = 0;
    this.animationId = null;
    this.colorIntervalId = null;
    this.resizeTimeoutId = null;
    this.running = false;

    var self = this;

    this.handleResize = function () {
      if (!self.canvas) return;
      self.canvas.width = window.innerWidth;
      self.canvas.height = window.innerHeight;
      var columns = Math.floor(self.canvas.width / CONFIG.matrix.fontSize);
      self.drops = [];
      for (var i = 0; i < columns; i++) {
        self.drops.push(Math.random() * CONFIG.matrix.initialDropOffset);
      }
    };

    this.boundResize = function () {
      if (self.resizeTimeoutId) {
        clearTimeout(self.resizeTimeoutId);
      }
      self.resizeTimeoutId = setTimeout(self.handleResize, CONFIG.matrix.resizeDebounce);
    };

    this.boundDraw = function (timestamp) {
      if (!self.running || !self.canvas) return;

      if (timestamp - self.lastFrameTime >= CONFIG.matrix.frameInterval) {
        self.ctx.fillStyle = 'rgba(10, 10, 15, ' + CONFIG.matrix.fadeAlpha + ')';
        self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);

        self.ctx.fillStyle = CONFIG.colors[self.colorIndex];
        self.ctx.font = CONFIG.matrix.fontSize + 'px monospace';

        var len = self.drops.length;
        for (var i = 0; i < len; i++) {
          var char = self.charArray[Math.floor(Math.random() * self.charArray.length)];
          self.ctx.fillText(char, i * CONFIG.matrix.fontSize, self.drops[i] * CONFIG.matrix.fontSize);

          if (self.drops[i] * CONFIG.matrix.fontSize > self.canvas.height && Math.random() > CONFIG.matrix.resetThreshold) {
            self.drops[i] = 0;
          }
          self.drops[i]++;
        }

        self.lastFrameTime = timestamp;
      }

      self.animationId = requestAnimationFrame(self.boundDraw);
    };

    window.addEventListener('resize', this.boundResize);
    this.handleResize();
  }

  MatrixRain.prototype.start = function () {
    if (this.running || !this.canvas) return;
    this.running = true;
    var self = this;
    this.animationId = requestAnimationFrame(this.boundDraw);
    this.colorIntervalId = setInterval(function () {
      self.colorIndex = (self.colorIndex + 1) % CONFIG.colors.length;
    }, CONFIG.colorChangeInterval);
  };

  MatrixRain.prototype.stop = function () {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.colorIntervalId) {
      clearInterval(this.colorIntervalId);
      this.colorIntervalId = null;
    }
  };

  MatrixRain.prototype.destroy = function () {
    this.stop();
    if (this.resizeTimeoutId) {
      clearTimeout(this.resizeTimeoutId);
      this.resizeTimeoutId = null;
    }
    if (this.boundResize) {
      window.removeEventListener('resize', this.boundResize);
    }
    this.canvas = null;
    this.ctx = null;
    this.drops = null;
    this.charArray = null;
  };

  function ParticleSystem(container) {
    this.container = container;
    if (!container) return;

    var fragment = document.createDocumentFragment();
    var count = CONFIG.particles.count;
    var minDuration = CONFIG.particles.minDuration;
    var maxDuration = CONFIG.particles.maxDuration;
    var maxDelay = CONFIG.particles.maxDelay;

    for (var i = 0; i < count; i++) {
      var particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = 'left:' + (Math.random() * 100) + '%;animation-delay:' + (Math.random() * maxDelay) + 's;animation-duration:' + (minDuration + Math.random() * (maxDuration - minDuration)) + 's;';
      fragment.appendChild(particle);
    }

    container.appendChild(fragment);
  }

  ParticleSystem.prototype.destroy = function () {
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  };

  function TypeWriter(element, cmds) {
    this.element = element;
    this.commands = cmds;
    this.cmdIndex = 0;
    this.charIndex = 0;
    this.timeoutId = null;
    this.running = false;
  }

  TypeWriter.prototype.type = function () {
    var self = this;
    if (!this.running || !this.element || !this.commands) return;

    if (this.cmdIndex < this.commands.length) {
      if (this.charIndex < this.commands[this.cmdIndex].length) {
        this.element.textContent += this.commands[this.cmdIndex].charAt(this.charIndex);
        this.charIndex++;
        var delay = CONFIG.typing.minDelay + Math.random() * (CONFIG.typing.maxDelay - CONFIG.typing.minDelay);
        this.timeoutId = setTimeout(function () { self.type(); }, delay);
      } else {
        var isLastCommand = this.cmdIndex >= this.commands.length - 1;
        if (isLastCommand) {
          this.running = false;
          return;
        }
        this.timeoutId = setTimeout(function () {
          if (!self.element) return;
          self.element.textContent = '';
          self.charIndex = 0;
          self.cmdIndex++;
          self.type();
        }, CONFIG.typing.pauseBetweenCommands);
      }
    }
  };

  TypeWriter.prototype.showFinal = function () {
    if (!this.element || !this.commands || !this.commands.length) return;
    this.stop();
    this.element.textContent = this.commands[this.commands.length - 1];
  };

  TypeWriter.prototype.start = function () {
    if (!this.element || this.running) return;
    this.running = true;
    var self = this;
    this.timeoutId = setTimeout(function () { self.type(); }, CONFIG.typing.startDelay);
  };

  TypeWriter.prototype.resume = function () {
    if (!this.element || this.running) return;
    this.running = true;
    this.type();
  };

  TypeWriter.prototype.stop = function () {
    this.running = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  };

  TypeWriter.prototype.destroy = function () {
    this.stop();
    this.element = null;
    this.commands = null;
  };

  function GlitchEffect(element) {
    this.element = element;
    this.intervalId = null;
    this.timeoutId = null;
    this.running = false;
  }

  GlitchEffect.prototype.start = function () {
    if (CONFIG.reducedMotion || !this.element || this.running) return;
    this.running = true;

    var self = this;
    var cfg = CONFIG.glitch;

    this.intervalId = setInterval(function () {
      if (!self.element) return;

      var offsetX = Math.random() * cfg.maxOffset * 2 - cfg.maxOffset;
      var offsetY = Math.random() * cfg.maxOffset * 2 - cfg.maxOffset;
      self.element.style.transform = 'translate(' + offsetX + 'px,' + offsetY + 'px)';

      self.timeoutId = setTimeout(function () {
        if (self.element) {
          self.element.style.transform = 'translate(0,0)';
        }
      }, cfg.duration);
    }, cfg.interval);
  };

  GlitchEffect.prototype.stop = function () {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.element) {
      this.element.style.transform = 'translate(0,0)';
    }
  };

  GlitchEffect.prototype.destroy = function () {
    this.stop();
    this.element = null;
  };

  function cleanup() {
    if (loader.visibilityHandler) {
      document.removeEventListener('visibilitychange', loader.visibilityHandler);
      loader.visibilityHandler = null;
    }

    if (loader.pollingIntervalId) {
      clearInterval(loader.pollingIntervalId);
      loader.pollingIntervalId = null;
    }

    if (loader.autoProgressTimeoutId) {
      clearTimeout(loader.autoProgressTimeoutId);
      loader.autoProgressTimeoutId = null;
    }

    if (loader.stepTimeoutId) {
      clearTimeout(loader.stepTimeoutId);
      loader.stepTimeoutId = null;
    }

    if (loader.welcomeObserver) {
      loader.welcomeObserver.disconnect();
      loader.welcomeObserver = null;
    }

    if (CONFIG.loaderDisabled) {
      clearCache();
      loader.html = null;
      log('Loader was OFF: only cleared plugin state, left DOM and Lampa untouched');
      return;
    }

    restoreFadeOut();

    removeElement(loader.styleElement);
    loader.styleElement = null;

    removeById(STYLE_IDS.critical);

    var welcomeEl = document.querySelector('.welcome');
    if (welcomeEl) {
      removeElement(welcomeEl);
      log('Removed .welcome element');
    }

    window.show_app = true;
    log('Set window.show_app = true');

    if (typeof Lampa !== 'undefined') {
      if (Lampa.Keypad && Lampa.Keypad.enable) {
        Lampa.Keypad.enable();
        log('Enabled Keypad');
      }
      if (Lampa.Screensaver && Lampa.Screensaver.enable) {
        Lampa.Screensaver.enable();
        log('Enabled Screensaver');
      }
    }

    clearCache();
    loader.html = null;
  }

  function animateProgress(startProgress, targetProgress, duration) {
    if (!isActive()) return;

    var startTime = null;
    var diff = targetProgress - startProgress;

    function step(timestamp) {
      if (!isActive()) return;

      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(1, elapsed / duration);
      var eased = 1 - Math.pow(1 - progress, 3);

      loader.progress = startProgress + (diff * eased);
      renderProgress(loader.progress);

      if (progress < 1) {
        loader.progressAnimationId = requestAnimationFrame(step);
      } else {
        loader.progressAnimationId = null;
      }
    }

    if (loader.progressAnimationId) {
      cancelAnimationFrame(loader.progressAnimationId);
    }

    loader.progressAnimationId = requestAnimationFrame(step);
  }

  function renderProgress(percent) {
    if (!loader.html) return;

    var fill = getElement('.progress-fill');
    var label = getElement('.progress-percent');

    if (fill) {
      fill.style.width = percent + '%';
    }
    if (label) {
      label.textContent = Math.floor(percent) + '%';
    }
  }

  function updateProgress(targetPercent) {
    if (!isActive()) return;

    loader.targetProgress = Math.min(100, Math.max(0, targetPercent));

    if (loader.progress >= loader.targetProgress) return;

    var diff = loader.targetProgress - loader.progress;
    var duration = Math.max(CONFIG.progress.minDuration, diff * CONFIG.progress.durationMultiplier);

    animateProgress(loader.progress, loader.targetProgress, duration);
  }

  function renderStep(index) {
    if (!loader.html) return;

    var lines = loader.html.querySelectorAll('.status-line');
    var line = lines[index];

    if (line && statusSteps[index]) {
      var icon = line.querySelector('.status-icon');
      var text = line.querySelector('.status-text');

      if (icon) {
        icon.classList.remove('loading');
        icon.classList.add(statusSteps[index].status);
      }
      if (text) {
        text.textContent = statusSteps[index].text;
      }
    }
  }

  function processQueue() {
    if (loader.processingStep || loader.stepQueue.length === 0 || !isActive()) return;

    loader.processingStep = true;
    var index = loader.stepQueue.shift();

    renderStep(index);

    var percent = (index + 1) / statusSteps.length * 100;
    updateProgress(percent);

    var delay = CONFIG.step.baseDelay + Math.random() * CONFIG.step.randomDelay;

    loader.stepTimeoutId = setTimeout(function () {
      loader.stepTimeoutId = null;
      loader.processingStep = false;
      processQueue();
    }, delay);
  }

  function updateStep(step) {
    if (!isActive()) return;

    var mappedStep = STEP_MAP[step];
    if (mappedStep === undefined) {
      mappedStep = Math.min(step, statusSteps.length - 1);
    }

    if (mappedStep <= loader.currentStep) return;

    for (var i = loader.currentStep + 1; i <= mappedStep; i++) {
      if (loader.stepQueue.indexOf(i) === -1) {
        loader.stepQueue.push(i);
      }
    }

    loader.currentStep = mappedStep;
    processQueue();
  }

  function startAutoProgress() {
    var autoStepIndex = 0;
    var stepDelay = CONFIG.minDisplayTime / (statusSteps.length + 1);

    function autoStep() {
      if (!isActive() || autoStepIndex >= statusSteps.length) {
        loader.autoProgressTimeoutId = null;
        return;
      }

      if (autoStepIndex > loader.currentStep) {
        updateStep(autoStepIndex);
      }

      autoStepIndex++;

      if (autoStepIndex < statusSteps.length) {
        loader.autoProgressTimeoutId = setTimeout(autoStep, stepDelay);
      } else {
        loader.autoProgressTimeoutId = null;
      }
    }

    loader.autoProgressTimeoutId = setTimeout(autoStep, CONFIG.autoProgressDelay);
  }

  function hookLampa() {
    if (loader.lampaHooked) return true;

    if (typeof Lampa === 'undefined') return false;

    if (Lampa.Listener) {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready' && !loader.destroyed) {
          destroy();
        }
      });
    }

    if (Lampa.SettingsApi) {
      applyPresetFromStorage();
      registerLoaderSettings();
    }

    if (Lampa.LoadingProgress) {
      var originalStep = Lampa.LoadingProgress.step;
      Lampa.LoadingProgress.step = function (position) {
        if (!loader.destroyed) {
          updateStep(position);
        }
        if (originalStep) {
          return originalStep.apply(this, arguments);
        }
      };

      var originalDestroy = Lampa.LoadingProgress.destroy;
      Lampa.LoadingProgress.destroy = function () {
        if (!loader.destroyed) {
          destroy();
        }
        if (originalDestroy) {
          return originalDestroy.apply(this, arguments);
        }
      };
      log('Hooked into Lampa LoadingProgress');
    } else {
      log('Lampa.LoadingProgress not exposed (normal in Lampa build), using Listener only');
    }

    if (window.show_app === true || window.appready === true) {
      log('App already ready when hooking (late plugin load), cleanup without delay');
      loader.destroyed = true;
      cleanup();
      return true;
    }

    loader.lampaHooked = true;
    log('Hooked into Lampa (Listener + Settings)');
    return true;
  }

  function applyPresetFromStorage() {
    if (typeof Lampa === 'undefined' || !Lampa.Storage) return;
    var preset = (Lampa.Storage.get('loader_display_preset', LOADER_PRESET_DEFAULT) + '').trim();
    if (preset === 'off' || preset === '0') {
      CONFIG.loaderDisabled = true;
      log('Loader disabled by preset');
      return;
    }
    var sec = parseInt(preset, 10);
    if (!isNaN(sec) && sec >= 3 && sec <= 10) {
      applyPresetScale(sec);
    }
  }

  function registerLoaderSettings() {
    if (typeof Lampa === 'undefined' || !Lampa.SettingsApi) return;
    var icon = '<svg xmlns="http://www.w3.org/2000/svg" width="37" height="37" viewBox="0 0 37 37" fill="none"><rect x="2" y="2" width="33" height="33" rx="4" stroke="white" stroke-width="2"/><rect x="8" y="10" width="21" height="3" rx="1" fill="white"/><rect x="8" y="16" width="15" height="3" rx="1" fill="white"/><rect x="8" y="22" width="18" height="3" rx="1" fill="white"/></svg>';
    Lampa.SettingsApi.addComponent({
      component: 'loader',
      icon: icon,
      name: 'Загрузчик',
      after: 'tmdb'
    });
    Lampa.SettingsApi.addParam({
      component: 'loader',
      param: {
        name: 'loader_display_preset',
        type: 'select',
        values: LOADER_PRESETS,
        default: LOADER_PRESET_DEFAULT
      },
      field: {
        name: 'Время загрузки (сек)',
        description: 'Минимальное время отображения экрана загрузки'
      },
      onChange: function () {
        applyPresetFromStorage();
      }
    });
    log('Registered loader settings');
  }

  function waitForLampa() {
    if (hookLampa()) return;

    var attempts = 0;
    loader.pollingIntervalId = setInterval(function () {
      attempts++;
      if (hookLampa() || attempts >= CONFIG.polling.maxAttempts || loader.destroyed) {
        clearInterval(loader.pollingIntervalId);
        loader.pollingIntervalId = null;
        if (attempts >= CONFIG.polling.maxAttempts) {
          log('Warning: Could not hook into Lampa after ' + CONFIG.polling.maxAttempts + ' attempts');
        }
      }
    }, CONFIG.polling.interval);
  }

  function observeWelcome() {
    if (typeof MutationObserver === 'undefined') return;

    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var removedNodes = mutations[i].removedNodes;
        for (var j = 0; j < removedNodes.length; j++) {
          var node = removedNodes[j];
          if (node.classList && node.classList.contains('welcome')) {
            if (!loader.destroyed) {
              log('Detected .welcome removal, triggering destroy');
              destroy();
            }
            observer.disconnect();
            return;
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: false });

    loader.welcomeObserver = observer;
  }

  function showAccessGranted() {
    if (!loader.html) return;

    if (loader.progressAnimationId) {
      cancelAnimationFrame(loader.progressAnimationId);
      loader.progressAnimationId = null;
    }

    for (var i = 0; i < statusSteps.length; i++) {
      renderStep(i);
    }

    renderProgress(100);
    loader.progress = 100;

    if (loader.typewriter) {
      loader.typewriter.showFinal();
    }

    var accessGranted = getElement('.access-granted');
    if (accessGranted) {
      accessGranted.classList.add('show');
    }
  }

  function destroy() {
    if (loader.destroyScheduled) {
      log('Destroy already scheduled, ignoring');
      return;
    }
    loader.destroyScheduled = true;

    if (CONFIG.loaderDisabled || !loader.html) {
      log('Loader disabled or not rendered, cleanup');
      cleanup();
      return;
    }

    var elapsed = Date.now() - loaderStartTime;
    var remainingTime = Math.max(0, CONFIG.minDisplayTime - elapsed);

    log('Lampa ready! Elapsed: ' + elapsed + 'ms, Will wait: ' + remainingTime + 'ms more');

    setTimeout(function () {
      if (loader.destroyed) return;
      loader.destroyed = true;

      log('Showing ACCESS GRANTED');
      showAccessGranted();

      setTimeout(function () {
        log('Starting fade out');

        if (loader.matrix) {
          loader.matrix.destroy();
          loader.matrix = null;
        }
        if (loader.particles) {
          loader.particles.destroy();
          loader.particles = null;
        }
        if (loader.typewriter) {
          loader.typewriter.destroy();
          loader.typewriter = null;
        }
        if (loader.glitch) {
          loader.glitch.destroy();
          loader.glitch = null;
        }

        if (loader.html) {
          loader.html.classList.add('fade-out');
        }

        setTimeout(function () {
          log('Cleanup');
          cleanup();
        }, CONFIG.fadeOutDuration);
      }, CONFIG.accessGrantedDelay);
    }, remainingTime);
  }

  function render() {
    log('Render started, time since script load: ' + (Date.now() - loaderStartTime) + 'ms');

    var criticalStyle = document.createElement('style');
    criticalStyle.id = STYLE_IDS.critical;
    criticalStyle.textContent = '.welcome{background:#0a0a0f!important;background-image:none!important}';
    (document.head || document.documentElement).appendChild(criticalStyle);

    loadFontAsync();

    var style = document.createElement('style');
    style.id = STYLE_IDS.main;
    style.textContent = STYLES;
    document.head.appendChild(style);
    loader.styleElement = style;

    var welcomeEl = document.querySelector('.welcome');

    var wrapper = document.createElement('div');
    wrapper.innerHTML = HTML;
    loader.html = wrapper.firstElementChild;

    if (welcomeEl) {
      welcomeEl.style.cssText = 'background:#0a0a0f!important;background-image:none!important';
      welcomeEl.innerHTML = '';
      welcomeEl.appendChild(loader.html);
    } else {
      loader.html.style.position = 'fixed';
      loader.html.style.zIndex = '100';
      document.body.appendChild(loader.html);
    }

    var canvas = loader.html.querySelector('.matrix-canvas');
    var particlesContainer = loader.html.querySelector('.particles');
    var typedText = loader.html.querySelector('.typed-text');
    var logo = loader.html.querySelector('.logo');

    loader.matrix = new MatrixRain(canvas);
    loader.particles = new ParticleSystem(particlesContainer);
    loader.typewriter = new TypeWriter(typedText, commands);
    loader.glitch = new GlitchEffect(logo);

    loader.matrix.start();
    loader.typewriter.start();
    loader.glitch.start();

    setupVisibilityHandler();

    startAutoProgress();
    waitForLampa();
    observeWelcome();
  }

  function setupVisibilityHandler() {
    loader.visibilityHandler = function () {
      if (document.hidden) {
        if (loader.matrix) loader.matrix.stop();
        if (loader.glitch) loader.glitch.stop();
        if (loader.typewriter) loader.typewriter.stop();
      } else if (!loader.destroyed) {
        if (loader.matrix) loader.matrix.start();
        if (loader.glitch) loader.glitch.start();
        if (loader.typewriter) loader.typewriter.resume();
      }
    };

    document.addEventListener('visibilitychange', loader.visibilityHandler);
  }

  function blockFadeOut() {
    if (!hasJQuery() || !$.fn.fadeOut) return;

    var original = $.fn.fadeOut;
    loader.originalFadeOut = original;

    $.fn.fadeOut = function () {
      if (this.hasClass && this.hasClass('welcome') && !loader.destroyed) {
        log('Blocked fadeOut on .welcome');
        destroy();
        return this;
      }
      return original.apply(this, arguments);
    };

    log('FadeOut blocked for .welcome');
  }

  function restoreFadeOut() {
    if (loader.originalFadeOut && hasJQuery()) {
      $.fn.fadeOut = loader.originalFadeOut;
      loader.originalFadeOut = null;
      log('FadeOut restored');
    }
  }

  function init() {
    log('Init, window.show_app = ' + window.show_app);

    if (window.show_app === true || window.appready === true) {
      log('App already ready (e.g. plugin added dynamically), skipping loader');
      removeById(STYLE_IDS.critical);
      if (typeof Lampa !== 'undefined' && Lampa.SettingsApi) {
        registerLoaderSettings();
      }
      window.lampaTerminalLoader = loader;
      return;
    }

    if (CONFIG.loaderDisabled) {
      log('Loader disabled by preset, terminal will not run');
      removeById(STYLE_IDS.critical);
      waitForLampa();
      observeWelcome();
      window.lampaTerminalLoader = loader;
      return;
    }

    render();
    blockFadeOut();
    window.lampaTerminalLoader = loader;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
