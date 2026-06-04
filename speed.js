(function () {
  'use strict';

  if (window.makstv_balancer_speedtest_v1) return;
  window.makstv_balancer_speedtest_v1 = true;

  var DEBUG = true;

  // ─── Эндпоинты ────────────────────────────────────────────────────────────
  // Для upload используем Cloudflare speed test (публичный, бесплатный)
  var UPLOAD_URLS = [
    'https://speed.cloudflare.com/__up',
    'https://httpbin.org/post',
    'https://httpbun.com/post'
  ];

  var PROXY_BASES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
  ];

  var _uploadIdx = 0;
  var _proxyIdx  = 0;

  function getUploadEndpoint() {
    return UPLOAD_URLS[_uploadIdx % UPLOAD_URLS.length];
  }

  function getProxyEndpoint(url) {
    return PROXY_BASES[_proxyIdx % PROXY_BASES.length] +
           encodeURIComponent(String(url || ''));
  }

  function nextUpload() { _uploadIdx++; }
  function nextProxy()  { _proxyIdx++;  }

  // ─── Отладка ───────────────────────────────────────────────────────────────

  function dbg() {
    if (!DEBUG) return;
    try {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[MaksTV SpeedTest]');
      console.log.apply(console, args);
    } catch (e) {}
  }

  // ─── Мета плагина ──────────────────────────────────────────────────────────

  function updatePluginMeta() {
    if (!window.Lampa || !Lampa.Plugins || !Lampa.Plugins.get) return;
    try {
      var plugins = Lampa.Plugins.get();
      var descr   = 'Быстрый тест скорости видеопотока из меню источников.';
      var changed = false;
      for (var i = 0; i < plugins.length; i++) {
        var plugin = plugins[i];
        var url    = String(plugin && plugin.url || '');
        if (/\/(?:balancerspeed|balancer-speed)\.js(?:[?#].*)?$/i.test(url)) {
          if (plugin.author !== 'MaksTV') { plugin.author = 'MaksTV'; changed = true; }
          if (plugin.descr  !== descr)    { plugin.descr  = descr;    changed = true; }
        }
      }
      if (changed && Lampa.Plugins.save) Lampa.Plugins.save();
    } catch (e) {}
  }

  // ─── Утилиты ───────────────────────────────────────────────────────────────

  function shortUrl(url) {
    var s = String(url || '');
    return s.length > 120 ? s.slice(0, 120) + '...' : s;
  }

  function dbgNoty(text) {
    if (!DEBUG) return;
    try {
      if (window.Lampa && Lampa.Noty) Lampa.Noty.show('SpeedTest: ' + text);
    } catch (e) {}
  }

  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms || 0); });
  }

  function addCacheBust(url, key) {
    var stamp = String(key || 'bst') + '=' + Date.now() +
                '_' + Math.floor(Math.random() * 1000000);
    return String(url || '') +
           (String(url || '').indexOf('?') >= 0 ? '&' : '?') + stamp;
  }

  function isHttpUrl(value) {
    return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
  }

  function looksLikeStreamUrl(url) {
    if (!isHttpUrl(url)) return false;
    if (/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(
          String(url).toLowerCase())) return false;
    return true;
  }

  function safeGet(obj, path) {
    try {
      var cur = obj;
      for (var i = 0; i < path.length; i++) {
        if (cur == null) return '';
        cur = cur[path[i]];
      }
      return cur;
    } catch (e) { return ''; }
  }

  function fmt2(v) {
    var n = isFinite(v) ? Number(v) : 0;
    return n.toFixed(2);
  }

  function mbpsToMBs(mbps) { return mbps / 8; }

  function asMbps(bytes, milliseconds) {
    if (!bytes || !milliseconds || milliseconds <= 0) return 0;
    return (bytes * 8) / ((milliseconds / 1000) * 1000000);
  }

  // ─── Профиль устройства ────────────────────────────────────────────────────

  function getDeviceProfile() {
    var ua = '';
    try {
      ua = String(navigator.userAgent || navigator.vendor || '').toLowerCase();
    } catch (e) {}
    var tv = /(vidaa|hisense|smart-tv|smarttv|hbbtv|tizen|web0s|webos|netcast|viera|bravia|aquos|philips|android tv|aft)/i.test(ua);
    return {
      tv:            tv,
      downloadBytes: tv ? 10 * 1024 * 1024 : 48 * 1024 * 1024,
      downloadMs:    tv ? 5000             : 10000,
      uploadBytes:   tv ? 1  * 1024 * 1024 : 8  * 1024 * 1024,
      uploadMs:      tv ? 3000             : 6000,
      uploadChunk:   tv ? 256 * 1024       : 512 * 1024
    };
  }

  // ─── Стили ─────────────────────────────────────────────────────────────────

  function addStyle() {
    var OLD_IDS = [
      'lampaua-balancer-speedtest-style',
      'lampaua-balancer-speedtest-style-v4',
      'lampaua-balancer-speedtest-style-v5',
      'lampaua-balancer-speedtest-style-v6',
      'lampaua-balancer-speedtest-style-v7',
      'lampaua-balancer-speedtest-style-v8',
      'lampaua-balancer-speedtest-style-v9',
      'lampaua-balancer-speedtest-style-v10',
      'lampaua-balancer-speedtest-style-v11',
      'lampaua-balancer-speedtest-style-v12',
      'lampaua-balancer-speedtest-style-v13'
    ];
    OLD_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });

    var ID = 'makstv-speedtest-style-v1';
    if (document.getElementById(ID)) return;

    var style = document.createElement('style');
    style.id  = ID;
    style.innerHTML = [
      '.modal .modal__title,.modal .modal-title,.modal .simple-title{text-align:center;}',
      '.makstv-speedtest{padding:1em;background:radial-gradient(120% 95% at 16% 12%,rgba(28,91,137,.74) 0%,rgba(10,25,43,0) 47%),radial-gradient(105% 100% at 84% 92%,rgba(137,104,24,.62) 0%,rgba(16,22,28,0) 54%),linear-gradient(145deg,#07111f 0%,#102946 48%,#2f2b12 100%);border-radius:1em;color:#f2f5ff;text-align:center;}',
      '.makstv-speedtest__top{display:flex;gap:1.4em;justify-content:space-between;margin-bottom:.55em;}',
      '.makstv-speedtest__block{flex:1;min-width:0;text-align:left;}',
      '.makstv-speedtest__label{font-size:.96em;letter-spacing:.03em;opacity:.95;}',
      '.makstv-speedtest__label--down{color:#65dcff;}',
      '.makstv-speedtest__label--up{color:#ffd86a;}',
      '.makstv-speedtest__big{font-size:2.25em;line-height:1.02;font-weight:500;margin-top:.08em;white-space:nowrap;}',
      '.makstv-speedtest__bigdim{opacity:.6;}',
      '.makstv-speedtest__pingrow{display:flex;align-items:center;justify-content:space-between;gap:.65em;margin:.45em 0 .35em;}',
      '.makstv-speedtest__pingtitle{font-size:1.02em;text-align:left;opacity:.96;}',
      '.makstv-speedtest__chips{display:flex;gap:.6em;}',
      '.makstv-speedtest__chip{padding:.1em .5em;border-radius:999px;background:rgba(255,255,255,.08);font-size:.94em;white-space:nowrap;}',
      '.makstv-speedtest__chip--cyan{color:#65dcff;}',
      '.makstv-speedtest__chip--violet{color:#ffd86a;}',
      '.makstv-speedtest__host{opacity:.66;font-size:.86em;margin:.35em 0 .65em;word-break:break-all;}',
      '.makstv-speedtest__gauge{position:relative;width:19.4em;height:11.1em;margin:0 auto .8em;}',
      '.makstv-speedtest__svg{display:block;width:100%;height:100%;overflow:visible;}',
      '.makstv-speedtest__arc-track{fill:none;stroke:rgba(63,100,160,.52);stroke-width:25;stroke-linecap:butt;}',
      '.makstv-speedtest__arc-yellow{fill:none;stroke:#f5ca43;stroke-width:25;stroke-linecap:butt;}',
      '.makstv-speedtest__arc-blue{fill:none;stroke:#6bd7ff;stroke-width:25;stroke-linecap:butt;}',
      '.makstv-speedtest__mark{font-size:15px;font-weight:700;fill:rgba(255,255,255,.9);text-anchor:middle;dominant-baseline:middle;paint-order:stroke;stroke:rgba(6,18,30,.62);stroke-width:3px;}',
      '.makstv-speedtest__needle{filter:drop-shadow(0 0 6px rgba(255,198,61,.35));}',
      '.makstv-speedtest__needle-shape{fill:#ff776f;}',
      '.makstv-speedtest__dot{fill:#e8e8e8;}',
      '.makstv-speedtest__value{font-size:2.34em;line-height:1;font-weight:600;margin:.05em 0 .02em;}',
      '.makstv-speedtest__unit{opacity:.85;font-size:1.05em;margin-bottom:.35em;}',
      '.makstv-speedtest__status{font-size:1em;opacity:.96;margin:.25em 0 .4em;}',
      '.makstv-speedtest__result{opacity:.9;font-size:.93em;min-height:1.3em;margin-top:.1em;}'
    ].join('');
    document.head.appendChild(style);
  }

  // ─── Измерение потока ──────────────────────────────────────────────────────

  async function measureStream(url, maxBytes, maxMs, onTick) {
    var controller = typeof AbortController !== 'undefined'
                     ? new AbortController() : null;
    var abortTimer = null;

    if (controller) {
      abortTimer = setTimeout(function () {
        try { controller.abort(); } catch (e) {}
      }, maxMs + 2000);
    }

    var started      = performance.now();
    var bytes        = 0;
    var firstChunkMs = 0;

    try {
      var resp = await fetch(addCacheBust(url, 'makstv_st'), {
        method:      'GET',
        cache:       'no-store',
        credentials: 'omit',
        signal:      controller ? controller.signal : undefined
      });
      if (!resp.ok || !resp.body)
        throw new Error('HTTP ' + resp.status);

      var reader = resp.body.getReader();
      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        if (!chunk.value) continue;

        bytes += chunk.value.byteLength;
        var now = performance.now();
        if (!firstChunkMs) firstChunkMs = now - started;
        if (onTick) onTick(bytes, now - started);

        var elapsed = now - started;
        if ((maxBytes > 0 && bytes >= maxBytes) || elapsed >= maxMs) {
          try { reader.cancel(); } catch (_) {}
          if (controller) { try { controller.abort(); } catch (_) {} }
          break;
        }
      }
    } catch (e) {
      if (!bytes) throw e;
    } finally {
      if (abortTimer) clearTimeout(abortTimer);
    }

    var totalMs = Math.max(performance.now() - started, 1);
    return { bytes: bytes, ms: totalMs,
             firstChunkMs: firstChunkMs || totalMs };
  }

  // ─── Fallback через прокси ─────────────────────────────────────────────────

  async function measureStreamWithFallback(url, maxBytes, maxMs, onTick) {
    // Прямой запрос
    try {
      return await measureStream(url, maxBytes, maxMs, onTick);
    } catch (e) {
      dbg('прямой запрос не удался', shortUrl(url),
          e && e.message ? e.message : e);
    }

    // Перебор прокси
    for (var i = 0; i < PROXY_BASES.length; i++) {
      var pUrl = getProxyEndpoint(url);
      dbg('прокси попытка', i + 1, shortUrl(pUrl));
      try {
        return await measureStream(pUrl, maxBytes, maxMs, onTick);
      } catch (pe) {
        dbg('прокси', i + 1, 'не сработал',
            pe && pe.message ? pe.message : pe);
        nextProxy();
      }
    }

    throw new Error('все источники недоступны: ' + shortUrl(url));
  }

  // ─── M3U8 ──────────────────────────────────────────────────────────────────

  function isM3u8Url(url) {
    return /\.m3u8(\?|$)/i.test(String(url || ''));
  }

  function toAbsUrl(base, rel) {
    try {
      return new URL(String(rel || ''), String(base || '')).toString();
    } catch (e) { return String(rel || ''); }
  }

  function parseM3uAttr(line, key) {
    var m = String(line || '').match(new RegExp(key + '=([^,]+)'));
    if (!m || !m[1]) return '';
    return String(m[1]).replace(/^"|"$/g, '');
  }

  async function fetchText(url, maxMs) {
    var controller = typeof AbortController !== 'undefined'
                     ? new AbortController() : null;
    var timer = null;
    try {
      if (controller) {
        timer = setTimeout(function () {
          try { controller.abort(); } catch (e) {}
        }, maxMs || 5000);
      }

      // Прямой запрос
      try {
        var r = await fetch(addCacheBust(url, 'makstv_m3u'), {
          method: 'GET', cache: 'no-store', credentials: 'omit',
          signal: controller ? controller.signal : undefined
        });
        if (r.ok) return await r.text();
      } catch (e1) {
        dbg('m3u8 прямой не удался', shortUrl(url));
      }

      // Прокси
      for (var i = 0; i < PROXY_BASES.length; i++) {
        try {
          var pr = await fetch(
            addCacheBust(getProxyEndpoint(url), 'makstv_m3u_p'), {
            method: 'GET', cache: 'no-store', credentials: 'omit',
            signal: controller ? controller.signal : undefined
          });
          if (pr.ok) return await pr.text();
        } catch (e2) { nextProxy(); }
      }
      return '';
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function resolveM3u8Targets(url) {
    var current = String(url || '');
    var depth   = 0;

    while (depth < 3 && isM3u8Url(current)) {
      depth++;
      var text = await fetchText(current, 6000);
      if (!text || text.indexOf('#EXTM3U') < 0) break;

      var lines = text.split(/\r?\n/)
        .map(function (x) { return String(x || '').trim(); })
        .filter(Boolean);

      // Варианты потоков
      var variants = [];
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('#EXT-X-STREAM-INF:') === 0) {
          var bw   = parseInt(parseM3uAttr(lines[i], 'BANDWIDTH') || '0', 10);
          var next = '';
          for (var j = i + 1; j < lines.length; j++) {
            if (lines[j] && lines[j].charAt(0) !== '#') {
              next = lines[j]; break;
            }
          }
          if (next) variants.push({
            bw:  isNaN(bw) ? 0 : bw,
            uri: toAbsUrl(current, next)
          });
        }
      }

      if (variants.length) {
        variants.sort(function (a, b) { return b.bw - a.bw; });
        current = variants[0].uri;
        dbg('m3u8 вариант выбран', shortUrl(current));
        continue;
      }

      // Сегменты
      var segments = lines
        .filter(function (l) { return l && l.charAt(0) !== '#'; })
        .slice(0, 4)
        .map(function (seg) { return toAbsUrl(current, seg); });

      if (segments.length) {
        dbg('m3u8 сегменты', segments.length, shortUrl(segments[0]));
        return segments;
      }
      break;
    }

    return [String(url || '')];
  }

  // ─── Измерение по нескольким целям ────────────────────────────────────────

  async function measureTargets(targets, maxBytes, maxMs, onTick) {
    var list = Array.isArray(targets) && targets.length ? targets : [];
    if (!list.length) throw new Error('нет целей');

    var started      = performance.now();
    var totalBytes   = 0;
    var firstChunkMs = 0;
    var failures     = 0;
    var maxFailures  = list.length * 3;
    var index        = 0;
    var pass         = 0;

    while (true) {
      var elapsed  = performance.now() - started;
      var remMs    = maxMs    - elapsed;
      var remBytes = maxBytes - totalBytes;

      if (remMs <= 0 || remBytes <= 0)    break;
      if (failures > maxFailures)          break;
      if (pass > list.length * 6)          break;

      var target = list[index % list.length];
      index++;
      if (index % list.length === 0) pass++;

      try {
        var sample = await measureStreamWithFallback(
          target, remBytes, remMs,
          function (partBytes) {
            if (onTick)
              onTick(totalBytes + partBytes, performance.now() - started);
          }
        );
        if (sample.bytes > 0) {
          if (!firstChunkMs && sample.firstChunkMs)
            firstChunkMs = sample.firstChunkMs;
          totalBytes += sample.bytes;
        } else { failures++; }
      } catch (e) {
        failures++;
        dbg('цель не отвечает', shortUrl(target),
            e && e.message ? e.message : e);
      }

      if (totalBytes >= maxBytes) break;
    }

    if (totalBytes <= 0) throw new Error('нет данных');
    var totalMs = Math.max(performance.now() - started, 1);
    return { bytes: totalBytes, ms: totalMs,
             firstChunkMs: firstChunkMs || totalMs };
  }

  // ─── Upload ────────────────────────────────────────────────────────────────

  function makeUploadBuffer(size) {
    var len = Math.max(64 * 1024, Math.min(size || 512 * 1024, 1024 * 1024));
    var arr = new Uint8Array(len);
    if (window.crypto && crypto.getRandomValues) {
      for (var o = 0; o < arr.length; o += 65536)
        crypto.getRandomValues(
          arr.subarray(o, Math.min(o + 65536, arr.length)));
      return arr;
    }
    for (var i = 0; i < arr.length; i++)
      arr[i] = Math.floor(Math.random() * 256);
    return arr;
  }

  async function trySingleUpload(uploadUrl, body, remMs) {
    var ctrl  = typeof AbortController !== 'undefined'
                ? new AbortController() : null;
    var timer = null;
    try {
      if (ctrl) {
        timer = setTimeout(function () {
          try { ctrl.abort(); } catch (_) {}
        }, Math.max(2000, Math.min(8000, remMs + 1000)));
      }
      var resp = await fetch(
        addCacheBust(uploadUrl, 'makstv_up'), {
        method:      'POST',
        cache:       'no-store',
        credentials: 'omit',
        headers:     { 'content-type': 'application/octet-stream' },
        body:        body,
        signal:      ctrl ? ctrl.signal : undefined
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return true;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function measureUpload(maxBytes, maxMs, onTick, chunkBytes) {
    var started    = performance.now();
    var sentBytes  = 0;
    var firstAckMs = 0;
    var failures   = 0;
    var maxFail    = UPLOAD_URLS.length * 2;
    var payload    = makeUploadBuffer(chunkBytes || 512 * 1024);

    while (true) {
      var elapsed  = performance.now() - started;
      var remMs    = maxMs    - elapsed;
      var remBytes = maxBytes - sentBytes;

      if (remMs <= 0 || remBytes <= 0) break;
      if (failures > maxFail)           break;

      var size      = Math.min(payload.length, remBytes);
      var body      = size === payload.length
                      ? payload : payload.subarray(0, size);
      var reqStart  = performance.now();
      var uploadUrl = getUploadEndpoint();

      try {
        await trySingleUpload(uploadUrl, body, remMs);
        if (!firstAckMs) firstAckMs = performance.now() - reqStart;
        sentBytes += body.byteLength;
        if (onTick) onTick(sentBytes, performance.now() - started);
      } catch (e) {
        failures++;
        dbg('upload не удался', uploadUrl,
            e && e.message ? e.message : e);
        nextUpload();
      }
    }

    if (sentBytes <= 0) throw new Error('upload: нет данных');
    var totalMs = Math.max(performance.now() - started, 1);
    return { bytes: sentBytes, ms: totalMs,
             firstChunkMs: firstAckMs || totalMs };
  }

  // ─── Модальное окно ────────────────────────────────────────────────────────

  function openModal(host) {
    addStyle();

    var body = $(
      '<div class="makstv-speedtest">' +
        '<div class="makstv-speedtest__top">' +
          '<div class="makstv-speedtest__block">' +
            '<div class="makstv-speedtest__label makstv-speedtest__label--down">СКАЧИВАНИЕ Мбит/с</div>' +
            '<div class="makstv-speedtest__big makstv-speedtest__dl">0.00</div>' +
          '</div>' +
          '<div class="makstv-speedtest__block">' +
            '<div class="makstv-speedtest__label makstv-speedtest__label--up">ЗАГРУЗКА Мбит/с</div>' +
            '<div class="makstv-speedtest__big makstv-speedtest__bigdim makstv-speedtest__ul">—</div>' +
          '</div>' +
        '</div>' +
        '<div class="makstv-speedtest__pingrow">' +
          '<div class="makstv-speedtest__pingtitle">Пинг: <span class="makstv-speedtest__ping-num">—</span> <span class="makstv-speedtest__bigdim">мс</span></div>' +
          '<div class="makstv-speedtest__chips">' +
            '<span class="makstv-speedtest__chip makstv-speedtest__chip--cyan">↓ <span class="makstv-speedtest__chip-dl">0.00</span></span>' +
            '<span class="makstv-speedtest__chip makstv-speedtest__chip--violet">↑ <span class="makstv-speedtest__chip-ul">—</span></span>' +
          '</div>' +
        '</div>' +
        '<div class="makstv-speedtest__host">Балансер: ' + esc(host || '-') + '</div>' +
        '<div class="makstv-speedtest__gauge">' +
          '<svg class="makstv-speedtest__svg" viewBox="0 0 360 215" aria-hidden="true">' +
            '<path class="makstv-speedtest__arc-track" d="M45 175 A135 135 0 0 1 315 175"></path>' +
            '<path class="makstv-speedtest__arc-yellow" d="M45 175 A135 135 0 0 1 315 175"></path>' +
            '<path class="makstv-speedtest__arc-blue"   d="M45 175 A135 135 0 0 1 85 80"></path>' +
            '<text class="makstv-speedtest__mark" data-ratio="0"   x="56"  y="145">0</text>' +
            '<text class="makstv-speedtest__mark" data-ratio=".25" x="104" y="94">50</text>' +
            '<text class="makstv-speedtest__mark" data-ratio=".5"  x="180" y="74">100</text>' +
            '<text class="makstv-speedtest__mark" data-ratio=".75" x="256" y="94">150</text>' +
            '<text class="makstv-speedtest__mark" data-ratio="1"   x="304" y="145">200</text>' +
            '<g class="makstv-speedtest__needle" transform="rotate(0 180 175)">' +
              '<polygon class="makstv-speedtest__needle-shape" points="180,168 180,182 57,175"></polygon>' +
            '</g>' +
            '<circle class="makstv-speedtest__dot" cx="180" cy="175" r="13"></circle>' +
          '</svg>' +
        '</div>' +
        '<div class="makstv-speedtest__value">0.00</div>' +
        '<div class="makstv-speedtest__unit">Мбит/с</div>' +
        '<div class="makstv-speedtest__status">Подключение...</div>' +
        '<div class="makstv-speedtest__result"></div>' +
      '</div>'
    );

    var needle  = body.find('.makstv-speedtest__needle');
    var value   = body.find('.makstv-speedtest__value');
    var status  = body.find('.makstv-speedtest__status');
    var result  = body.find('.makstv-speedtest__result');
    var topDl   = body.find('.makstv-speedtest__dl');
    var topUl   = body.find('.makstv-speedtest__ul');
    var pingNum = body.find('.makstv-speedtest__ping-num');
    var chipDl  = body.find('.makstv-speedtest__chip-dl');
    var chipUl  = body.find('.makstv-speedtest__chip-ul');
    var marks   = body.find('.makstv-speedtest__mark');

    var gaugeMax   = 200;
    var gaugeSweep = 180;
    var shown      = 0;
    var target     = 0;
    var raf        = 0;

    function pickGaugeMax(v) {
      var arr = [30, 50, 80, 100, 150, 200, 300, 500, 800, 1000];
      for (var i = 0; i < arr.length; i++) if (v <= arr[i]) return arr[i];
      return 1500;
    }

    function refreshScale() {
      marks.each(function () {
        var ratio = parseFloat($(this).attr('data-ratio') || '0');
        $(this).text(Math.round(gaugeMax * (isFinite(ratio) ? ratio : 0)));
      });
    }

    function renderNeedle(v) {
      var m     = isFinite(v) ? Math.max(0, v) : 0;
      var angle = Math.min(m, gaugeMax) / gaugeMax * gaugeSweep;
      value.text(m.toFixed(2));
      needle.attr('transform', 'rotate(' + angle.toFixed(2) + ' 180 175)');
    }

    function animTick() {
      shown += (target - shown) * 0.12;
      if (Math.abs(target - shown) < 0.03) shown = target;
      renderNeedle(shown);
      raf = shown !== target ? requestAnimationFrame(animTick) : 0;
    }

    function setSpeed(mbps, opts) {
      opts = opts || {};
      var m = isFinite(mbps) ? Math.max(0, mbps) : 0;
      if (m > gaugeMax * 0.9) { gaugeMax = pickGaugeMax(m * 1.25); refreshScale(); }
      target = m;
      if (!opts.gaugeOnly) { topDl.text(fmt2(m)); chipDl.text(fmt2(m)); }
      if (!raf) raf = requestAnimationFrame(animTick);
    }

    function setGaugeFinal(mbps) {
      var m = isFinite(mbps) ? Math.max(0, mbps) : 0;
      if (raf) { try { cancelAnimationFrame(raf); } catch (_) {} raf = 0; }
      if (m > gaugeMax * 0.9) { gaugeMax = pickGaugeMax(m * 1.25); refreshScale(); }
      target = shown = m;
      renderNeedle(m);
    }

    function animateGaugeToZero(duration) {
      if (raf) { try { cancelAnimationFrame(raf); } catch (_) {} raf = 0; }
      var from    = Math.max(0, shown);
      var started = performance.now();
      var ms      = Math.max(300, duration || 1100);
      return new Promise(function (resolve) {
        function ease(t) {
          return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
        }
        function step(now) {
          var t  = Math.min(1, (now - started) / ms);
          shown  = from * (1 - ease(t));
          target = 0;
          renderNeedle(shown);
          if (t < 1) raf = requestAnimationFrame(step);
          else { shown = 0; raf = 0; renderNeedle(0); resolve(); }
        }
        raf = requestAnimationFrame(step);
      });
    }

    function resetGauge(opts) {
      opts = opts || {};
      if (raf) { try { cancelAnimationFrame(raf); } catch (_) {} raf = 0; }
      shown = target = 0;
      if (!opts.keepDownload) { topDl.text('0.00'); chipDl.text('0.00'); }
      renderNeedle(0);
    }

    function finishGaugeAtZero() {
      if (raf) { try { cancelAnimationFrame(raf); } catch (_) {} raf = 0; }
      var from    = Math.max(0, shown);
      var started = performance.now();
      var dur     = 1400;
      function ease(t) { return 1 - Math.pow(1 - t, 3); }
      function step(now) {
        var t  = Math.min(1, (now - started) / dur);
        shown  = from * (1 - ease(t));
        target = 0;
        renderNeedle(shown);
        if (t < 1) raf = requestAnimationFrame(step);
        else { shown = 0; raf = 0; renderNeedle(0); }
      }
      raf = requestAnimationFrame(step);
    }

    function setUpload(mbps) {
      if (!isFinite(mbps)) { topUl.text('—'); chipUl.text('—'); return; }
      var m = Math.max(0, mbps);
      topUl.text(fmt2(m)); chipUl.text(fmt2(m));
    }

    function setPing(ms) {
      pingNum.text(isFinite(ms)
        ? String(Math.max(0, Math.round(ms))) : '—');
    }

    function setStatus(text) { status.text(text || ''); }
    function setResult(text) { result.text(text || ''); }

    Lampa.Modal.open({
      title:  'Измерение скорости',
      html:   body,
      size:   'small',
      onBack: function () { Lampa.Modal.close(); }
    });

    refreshScale();
    resetGauge();

    return {
      setSpeed:           setSpeed,
      setGaugeFinal:      setGaugeFinal,
      animateGaugeToZero: animateGaugeToZero,
      finishGaugeAtZero:  finishGaugeAtZero,
      setUpload:          setUpload,
      setPing:            setPing,
      resetGauge:         resetGauge,
      setStatus:          setStatus,
      setResult:          setResult
    };
  }

  // ─── Запуск теста ──────────────────────────────────────────────────────────

  function toStreamUrl(raw) {
    var url = String(raw || '');
    return url.indexOf('&preload') >= 0
           ? url.replace('&preload', '&play') : url;
  }

  async function runSpeedTest(rawUrl) {
    try {
      var streamUrl = toStreamUrl(rawUrl);
      if (!streamUrl) {
        Lampa.Noty.show('Не удалось определить URL потока');
        return;
      }
      dbg('запуск', shortUrl(streamUrl));

      var host = '-';
      try { host = new URL(streamUrl, location.href).host; } catch (_) {}

      var profile = getDeviceProfile();
      var modal   = openModal(host);
      modal.resetGauge();
      modal.setStatus('Подготовка...');
      modal.setUpload(NaN);
      modal.setPing(NaN);
      modal.setResult('');
      await delay(350);

      // 1. Цели
      modal.setStatus('Определение источника...');
      var targets = await resolveM3u8Targets(streamUrl);
      dbg('целей:', targets.length);

      // 2. Пинг
      modal.setStatus('Измерение пинга...');
      var pingSample = await measureTargets(
        targets.slice(0, 2), 128 * 1024, 5000, function () {}
      );
      var ping = Math.max(1, Math.round(pingSample.firstChunkMs));
      modal.setPing(ping);

      // 3. Скачивание
      modal.resetGauge();
      modal.setStatus('Тест скачивания...');
      await delay(300);

      var smoothDl = 0, bestDl = 0;
      var dlSample = await measureTargets(
        targets,
        profile.downloadBytes,
        profile.downloadMs,
        function (bytes, ms) {
          if (ms < 500) return;
          var raw = asMbps(bytes, ms);
          smoothDl = smoothDl ? smoothDl * 0.75 + raw * 0.25 : raw;
          bestDl   = Math.max(bestDl, raw);
          modal.setSpeed(smoothDl);
        }
      );

      var downloadMbps = Math.max(asMbps(dlSample.bytes, dlSample.ms), bestDl);
      modal.setSpeed(downloadMbps);
      modal.setGaugeFinal(downloadMbps);

      // 4. Переход к upload
      await modal.animateGaugeToZero(profile.tv ? 1300 : 1150);
      modal.setStatus('Тест загрузки...');
      await delay(300);

      // 5. Upload
      var uploadMbps = NaN;
      try {
        var smoothUl = 0, bestUl = 0;
        var ulSample = await measureUpload(
          profile.uploadBytes,
          profile.uploadMs,
          function (bytes, ms) {
            if (ms < 300) return;
            var raw = asMbps(bytes, ms);
            smoothUl = smoothUl ? smoothUl * 0.75 + raw * 0.25 : raw;
            bestUl   = Math.max(bestUl, raw);
            modal.setSpeed(smoothUl, { gaugeOnly: true });
          },
          profile.uploadChunk
        );
        uploadMbps = Math.max(asMbps(ulSample.bytes, ulSample.ms), bestUl);
        modal.setUpload(uploadMbps);
      } catch (ue) {
        modal.setUpload(NaN);
        dbg('upload ошибка', ue && ue.message ? ue.message : ue);
      }

      // 6. Итог
      modal.setStatus('Готово');
      modal.setResult(
        'Пинг: ' + ping + ' мс  ·  ' +
        '↓ ' + mbpsToMBs(downloadMbps).toFixed(2) + ' МБ/с  ·  ' +
        '↑ ' + (isFinite(uploadMbps)
                ? mbpsToMBs(uploadMbps).toFixed(2) : '—') + ' МБ/с'
      );
      modal.finishGaugeAtZero();

      dbg('завершён  ↓' + downloadMbps.toFixed(2) +
          '  ↑' + (isFinite(uploadMbps) ? uploadMbps.toFixed(2) : 'н/д') +
          '  ping=' + ping);

    } catch (e) {
      Lampa.Noty.show('Ошибка измерения скорости');
      dbg('ошибка', e && e.message ? e.message : e);
      dbgNoty('Ошибка, см. консоль');
    }
  }

  // ─── Извлечение URL ────────────────────────────────────────────────────────

  function extractUrlFromKnown(data) {
    if (!data) return '';
    if (isHttpUrl(data) && looksLikeStreamUrl(data)) return String(data).trim();

    var paths = [
      ['element','url'], ['element','file'], ['element','stream'],
      ['params','url'],  ['params','file'],  ['params','stream'],
      ['url'], ['file'], ['stream'], ['rawUrl']
    ];
    for (var i = 0; i < paths.length; i++) {
      var v = safeGet(data, paths[i]);
      if (isHttpUrl(v) && looksLikeStreamUrl(v)) return String(v).trim();
    }
    if (Array.isArray(data.items)) {
      for (var j = 0; j < data.items.length; j++) {
        var it = data.items[j];
        if (!it) continue;
        if (isHttpUrl(it.url)  && looksLikeStreamUrl(it.url))
          return String(it.url).trim();
        if (isHttpUrl(it.file) && looksLikeStreamUrl(it.file))
          return String(it.file).trim();
      }
    }
    return '';
  }

  function pickBestQualityItem(items) {
    if (!Array.isArray(items) || !items.length) return null;
    var wf = items.filter(function (x) {
      return x && typeof x.file === 'string' && /^https?:\/\//i.test(x.file);
    });
    if (!wf.length) return null;
    wf.sort(function (a, b) {
      var aq = parseInt(String(a.title||'').replace(/\D/g,''),10)||0;
      var bq = parseInt(String(b.title||'').replace(/\D/g,''),10)||0;
      return bq - aq;
    });
    return wf[0];
  }

  async function tryResolveUrlFromCopyAction(originalSelect, ctxThis, copyItem) {
    if (!originalSelect) return '';
    if (!window.Lampa || !Lampa.Utils || !Lampa.Utils.copyTextToClipboard)
      return '';

    var captured     = '';
    var oldCopy      = Lampa.Utils.copyTextToClipboard;
    var oldClip      = navigator && navigator.clipboard
                       ? navigator.clipboard.writeText : null;
    var oldSelShow   = window.Lampa && Lampa.Select ? Lampa.Select.show : null;
    var oldNotyShow  = window.Lampa && Lampa.Noty && Lampa.Noty.show
                       ? Lampa.Noty.show : null;
    var resolved     = false;
    var resolveWait  = null;
    var waitCapt     = new Promise(function (r) { resolveWait = r; });
    var tid          = null;

    function setCaptured(text) {
      var v = String(text || '').trim();
      if (!isHttpUrl(v)) return;
      captured = v;
      if (!resolved && resolveWait) { resolved = true; resolveWait(v); }
    }

    try {
      Lampa.Utils.copyTextToClipboard = function (t, ok) {
        setCaptured(t);
        if (typeof ok === 'function') { try { ok(); } catch (_) {} }
      };
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText = function (t) {
          setCaptured(t); return Promise.resolve();
        };
      }
      if (oldNotyShow && Lampa.Noty) {
        Lampa.Noty.show = function (msg) {
          var m = String(msg || '').toLowerCase();
          if (m.indexOf('скопирован') >= 0 || m.indexOf('copy') >= 0) return;
          return oldNotyShow.apply(this, arguments);
        };
      }
      if (oldSelShow && Lampa.Select) {
        Lampa.Select.show = function (opts) {
          if (opts && Array.isArray(opts.items)) {
            var best = pickBestQualityItem(opts.items);
            if (best) {
              setCaptured(best.file || '');
              if (typeof opts.onSelect === 'function') {
                try { opts.onSelect(best); } catch (_) {}
              }
              return;
            }
          }
          return oldSelShow.call(this, opts);
        };
      }

      var mp = originalSelect.call(ctxThis, copyItem || { link: true });
      if (mp && typeof mp.then === 'function') {
        try { await mp; } catch (_) {}
      }

      if (!captured) {
        tid = setTimeout(function () {
          if (!resolved && resolveWait) { resolved = true; resolveWait(''); }
        }, 2500);
        await waitCapt;
      }
    } catch (_) {
      captured = '';
    } finally {
      if (tid) clearTimeout(tid);
      Lampa.Utils.copyTextToClipboard = oldCopy;
      if (navigator && navigator.clipboard && oldClip)
        navigator.clipboard.writeText = oldClip;
      if (oldSelShow  && Lampa.Select) Lampa.Select.show = oldSelShow;
      if (oldNotyShow && Lampa.Noty)   Lampa.Noty.show   = oldNotyShow;
    }

    if (captured) return captured;
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.readText) {
        var clip = await navigator.clipboard.readText();
        if (clip && /^https?:\/\//i.test(String(clip).trim()))
          return String(clip).trim();
      }
    } catch (_) {}
    return '';
  }

  // ─── Инъекция пункта меню ─────────────────────────────────────────────────

  function menuLooksLikeVideoAction(items) {
    if (!Array.isArray(items) || !items.length) return false;
    return items.some(function (it) {
      return it && (it.link || it.copylink || it.player ||
                    it.timeclear || it.timefull);
    });
  }

  function injectAction(items) {
    if (!Array.isArray(items)) return;
    if (items.some(function (it) { return it && it.makstv_speedtest; })) return;
    if (!menuLooksLikeVideoAction(items)) return;

    var action = { title: 'Измерить скорость', makstv_speedtest: true };
    var idx = items.findIndex(function (it) {
      return it && (it.link || it.copylink);
    });
    if (idx >= 0) items.splice(idx, 0, action);
    else          items.push(action);
    dbg('пункт меню добавлен, элементов:', items.length);
  }

  // ─── Установка плагина ─────────────────────────────────────────────────────

  function install() {
    updatePluginMeta();
    if (!window.Lampa || !window.$ || !Lampa.Listener ||
        !Lampa.Select || !Lampa.Controller) {
      setTimeout(install, 300);
      return;
    }
    dbg('плагин готов, автор: MaksTV');

    var ctx = null;

    function captureContext(e) {
      if (!e) return;
      var found = extractUrlFromKnown(e);
      if (!found) return;
      ctx = {
        rawUrl:  String(found),
        enabled: Lampa.Controller.enabled && Lampa.Controller.enabled()
                 ? Lampa.Controller.enabled().name : 'content'
      };
      dbg('контекст', e.type || '-', shortUrl(ctx.rawUrl));
    }

    if (typeof Lampa.Listener.send === 'function' &&
        !Lampa.Listener.__makstv_speedtest_wrapped) {
      var origSend = Lampa.Listener.send;
      Lampa.Listener.send = function (ev, payload) {
        try {
          if (ev === 'torrent_file' || ev === 'torrent') {
            var f = extractUrlFromKnown(payload);
            if (f) ctx = {
              rawUrl:  String(f),
              enabled: Lampa.Controller.enabled && Lampa.Controller.enabled()
                       ? Lampa.Controller.enabled().name : 'content'
            };
          }
        } catch (_) {}
        return origSend.apply(this, arguments);
      };
      Lampa.Listener.__makstv_speedtest_wrapped = true;
    }

    Lampa.Listener.follow('torrent_file', function (e) {
      captureContext(e);
      if (!e || e.type !== 'onlong' || !Array.isArray(e.menu)) return;
      injectAction(e.menu);
    });

    Lampa.Listener.follow('torrent', function (e) { captureContext(e); });

    var origShow = Lampa.Select.show;
    Lampa.Select.show = function (options) {
      if (options && Array.isArray(options.items))
        injectAction(options.items);

      var hasBtn = options && Array.isArray(options.items) &&
        options.items.some(function (it) { return it && it.makstv_speedtest; });

      if (hasBtn) {
        var fromOpts = extractUrlFromKnown(options);
        if (fromOpts) {
          ctx = {
            rawUrl:  String(fromOpts),
            enabled: Lampa.Controller.enabled && Lampa.Controller.enabled()
                     ? Lampa.Controller.enabled().name : 'content'
          };
        }

        var localCtx    = ctx;
        var origSelect  = options.onSelect;
        var localItems  = options.items;
        options = Object.assign({}, options);

        options.onSelect = async function (selected) {
          if (selected && selected.makstv_speedtest) {
            var raw = localCtx && localCtx.rawUrl ? localCtx.rawUrl : '';
            if (!raw) raw = extractUrlFromKnown(selected);
            if (!raw) raw = extractUrlFromKnown(localItems);
            if (!raw) raw = extractUrlFromKnown(this);

            if (!raw) {
              var copyItem = Array.isArray(localItems)
                ? (localItems.find(function (it) {
                    return it && (it.link || it.copylink);
                  }) || null)
                : null;
              raw = await tryResolveUrlFromCopyAction(
                origSelect, this, copyItem);
            }

            if (!raw || !looksLikeStreamUrl(raw)) {
              Lampa.Noty.show('URL потока не найден');
              if (localCtx && localCtx.enabled)
                Lampa.Controller.toggle(localCtx.enabled);
              return;
            }

            runSpeedTest(raw);
            if (localCtx && localCtx.enabled)
              Lampa.Controller.toggle(localCtx.enabled);
            return;
          }
          if (origSelect) return origSelect.apply(this, arguments);
        };
      }

      return origShow.call(this, options);
    };
  }

  install();
})();