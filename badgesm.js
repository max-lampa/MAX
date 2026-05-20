(function () {
  'use strict';

  // ==============================
  //  Lampa Badges Plugin v2.0.0
  //  Підтримка: українська + російська мова
  //  Torrent + Online (потоки)
  // ==============================

  var PLUGIN_NAME    = 'lampa_badges';
  var PLUGIN_VERSION = '2.0.0';

  // ---- Автовизначення мови (fallback: uk) ----
  function getLang() {
    var stored = localStorage.getItem('lampa_badges_lang');
    if (stored === 'ru' || stored === 'uk') return stored;
    try {
      var l = (window.Lampa && window.Lampa.Storage && window.Lampa.Storage.get('language')) || navigator.language || 'uk';
      return l.indexOf('ru') !== -1 ? 'ru' : 'uk';
    } catch (e) {
      return 'uk';
    }
  }

  var LABELS = {
    uk: {
      compatible : 'Сумісно',
      warning    : 'Може не грати',
      risk       : 'Ризик',
      vip        : 'VIP',
      unknown    : 'Невідома',
    },
    ru: {
      compatible : 'Совместимо',
      warning    : 'Может не играть',
      risk       : 'Риск',
      vip        : 'VIP',
      unknown    : 'Неизвестно',
    },
  };

  function L(key) {
    var lang = getLang();
    return (LABELS[lang] && LABELS[lang][key]) || LABELS.uk[key] || key;
  }

  // ---- CSS ----
  var CSS =
    '.lbdg-wrap{display:flex;flex-direction:column;width:100%;margin-top:4px}' +
    '.lbdg-bar{width:100%;height:2px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;margin-bottom:5px}' +
    '.lbdg-bar__fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#e8a020,#f0c040);transition:width .3s ease}' +
    '.lbdg-row{display:flex;flex-wrap:wrap;gap:4px;align-items:center;width:100%}' +
    '.lbdg{display:inline-flex;align-items:center;gap:2px;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:500;line-height:1.4;white-space:nowrap;border:1px solid}' +
    '.lbdg-source   {border-color:#e8a020;color:#e8a020}' +
    '.lbdg-quality  {border-color:#e8a020;color:#e8a020}' +
    '.lbdg-hdr      {border-color:#c080ff;color:#c080ff}' +
    '.lbdg-warning  {border-color:#e05050;color:#e05050}' +
    '.lbdg-risk     {border-color:#e05050;color:#e05050}' +
    '.lbdg-rating   {border-color:#888;color:#ccc}' +
    '.lbdg-compatible{border-color:#2a8a6a;color:#3dcca0}' +
    '.lbdg-vip      {border-color:#7a3aaa;color:#cc88ff}' +
    '.lbdg-age      {border-color:#cc4444;color:#ff8888}' +
    '.lbdg-size     {border-color:#2a7a3a;color:#4ecb6a;font-weight:600;margin-left:auto}' +
    '.lbdg-codec    {border-color:#888;color:#bbb}' +
    '.lbdg-audio    {border-color:#5588cc;color:#88aaee}' +
    '.lbdg-seeds-wrap{display:inline-flex;align-items:center;gap:1px}' +
    '.lbdg-seeds-wrap .arr-up{color:#4ecb6a;font-size:11px}' +
    '.lbdg-seeds-wrap .arr-dn{color:#e05050;font-size:11px}' +
    '.lbdg-seeds    {border-color:#555;color:#aaa}' +
    '.lbdg-peers    {border-color:#555;color:#aaa}';

  function injectStyles() {
    if (document.getElementById('lampa-badges-css')) return;
    var s = document.createElement('style');
    s.id = 'lampa-badges-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ---- Хелпери для бейджів ----
  function mkBadge(cls, text) {
    var el = document.createElement('span');
    el.className = 'lbdg lbdg-' + cls;
    el.textContent = text;
    return el;
  }

  function mkSeedsBadge(count, type) {
    var wrap = document.createElement('span');
    wrap.className = 'lbdg-seeds-wrap';
    var arrow = document.createElement('span');
    arrow.className = type === 'seeds' ? 'arr-up' : 'arr-dn';
    arrow.textContent = type === 'seeds' ? '↑' : '↓';
    var num = document.createElement('span');
    num.className = 'lbdg lbdg-' + (type === 'seeds' ? 'seeds' : 'peers');
    num.textContent = String(count);
    wrap.appendChild(arrow);
    wrap.appendChild(num);
    return wrap;
  }

  function mkProgressBar(pct) {
    var bar = document.createElement('div');
    bar.className = 'lbdg-bar';
    var fill = document.createElement('div');
    fill.className = 'lbdg-bar__fill';
    fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
    bar.appendChild(fill);
    return bar;
  }

  // ---- Детектори ----
  function str(obj) {
    try { return JSON.stringify(obj).toLowerCase(); } catch (e) { return ''; }
  }

  function detectQuality(t) {
    var q = (t.quality || t.Quality || t.resolution || '').toLowerCase();
    if (q.indexOf('2160') !== -1 || q.indexOf('4k') !== -1) return '2160p';
    if (q.indexOf('1080') !== -1) return '1080p';
    if (q.indexOf('720')  !== -1) return '720p';
    if (q.indexOf('480')  !== -1) return '480p';
    var info = str(t);
    if (info.indexOf('2160p') !== -1 || info.indexOf('4k') !== -1) return '2160p';
    if (info.indexOf('1080p') !== -1) return '1080p';
    if (info.indexOf('720p')  !== -1) return '720p';
    if (info.indexOf('480p')  !== -1) return '480p';
    return q ? q.toUpperCase() : null;
  }

  function detectHDR(t) {
    var info = str(t);
    if (info.indexOf('dolby vision') !== -1 || info.indexOf(' dv ') !== -1 || info.indexOf('dovi') !== -1) return 'Dolby Vision';
    if (info.indexOf('hdr10+') !== -1) return 'HDR10+';
    if (info.indexOf('hdr10') !== -1)  return 'HDR10';
    if (info.indexOf('hdr')   !== -1)  return 'HDR';
    return null;
  }

  function detectSDR(t) {
    var info = str(t);
    return info.indexOf('sdr') !== -1;
  }

  function detectCodec(t) {
    var info = str(t);
    if (info.indexOf('av1') !== -1) return 'AV1';
    if (info.indexOf('h.265') !== -1 || info.indexOf('hevc') !== -1 || info.indexOf('x265') !== -1) return 'H.265';
    if (info.indexOf('h.264') !== -1 || info.indexOf('avc')  !== -1 || info.indexOf('x264') !== -1) return 'H.264';
    return null;
  }

  function detectAudio(t) {
    var info = str(t);
    if (info.indexOf('dolby atmos') !== -1 || info.indexOf('atmos') !== -1) return 'Dolby Atmos';
    if (info.indexOf('truehd') !== -1)  return 'TrueHD';
    if (info.indexOf('dts-hd') !== -1 || info.indexOf('dtshd') !== -1) return 'DTS-HD';
    if (info.indexOf('dts')    !== -1)  return 'DTS';
    if (info.indexOf('ac3')    !== -1 || info.indexOf('dolby digital') !== -1) return 'DD';
    if (info.indexOf('aac')    !== -1)  return 'AAC';
    return null;
  }

  function detectAge(t) {
    var info = str(t);
    if (info.indexOf('18+') !== -1) return '18+';
    if (info.indexOf('17+') !== -1) return '17+';
    if (info.indexOf('16+') !== -1) return '16+';
    if (info.indexOf('12+') !== -1) return '12+';
    var m = info.match(/"age_rating"\s*:\s*"?(\d+)\+?"?/);
    if (m) return m[1] + '+';
    return null;
  }

  function getSizeGB(t) {
    var size = parseFloat(t.size || t.Size || 0);
    if (!size && t.size_bytes) size = t.size_bytes / (1024 * 1024 * 1024);
    if (size > 0) return size;
    var info = str(t);
    var m = info.match(/([0-9]+[.,][0-9]+)\s*(?:gb|гб)/i);
    if (m) return parseFloat(m[1].replace(',', '.'));
    m = info.match(/([0-9]+)\s*(?:gb|гб)/i);
    if (m) return parseFloat(m[1]);
    return 0;
  }

  function formatSize(t) {
    var gb = getSizeGB(t);
    if (!gb) return null;
    var s = gb.toFixed(2).replace('.', ',');
    return s + ' GB';
  }

  function detectWarning(t, quality) {
    var hdr = detectHDR(t);
    var gb  = getSizeGB(t);
    if (hdr === 'Dolby Vision') return 'warning';
    if (hdr && gb > 40)  return 'warning';
    if (gb > 15 && quality === '2160p') return 'warning';
    if (gb > 8  && quality === '2160p') return 'risk';
    return null;
  }

  function isCompatible(t) {
    var q    = detectQuality(t);
    var hdr  = detectHDR(t);
    var codec = detectCodec(t);
    return !hdr && codec !== 'AV1' && (q === '1080p' || q === '720p' || q === '480p');
  }

  function isVIP(t) {
    var info = str(t);
    return info.indexOf('vip') !== -1 || info.indexOf('premium') !== -1;
  }

  function getSeeds(t) {
    return parseInt(t.seed || t.seeds || t.Seed || t.seeders || 0, 10) || 0;
  }

  function getPeers(t) {
    return parseInt(t.peer || t.peers || t.Peer || t.leechers || 0, 10) || 0;
  }

  function getRating(t) {
    var r = parseFloat(t.rating || t.Rating || t.imdb || t.kinopoisk || t.vote_average || 0);
    return r > 0 ? r.toFixed(1) : null;
  }

  function getSource(t) {
    var s = t.tracker || t.Tracker || t.source || t.translation || t.translate || t.studio || t.name || '';
    if (!s) return '';
    return s.length > 18 ? s.substring(0, 18) + '…' : s;
  }

  function seedsToPct(seeds) {
    if (seeds > 200) return 95;
    if (seeds > 100) return 85;
    if (seeds > 50)  return 75;
    if (seeds > 20)  return 60;
    if (seeds > 10)  return 45;
    if (seeds > 5)   return 35;
    if (seeds > 2)   return 25;
    if (seeds > 0)   return 15;
    return 5;
  }

  // ---- Головний будівник ----
  function buildBadges(t) {
    var row = document.createElement('div');
    row.className = 'lbdg-row';

    var quality  = detectQuality(t);
    var hdr      = detectHDR(t);
    var codec    = detectCodec(t);
    var audio    = detectAudio(t);
    var age      = detectAge(t);
    var sizeStr  = formatSize(t);
    var seeds    = getSeeds(t);
    var peers    = getPeers(t);
    var rating   = getRating(t);
    var source   = getSource(t);
    var warnType = detectWarning(t, quality);
    var compat   = isCompatible(t);
    var vip      = isVIP(t);

    if (source)  row.appendChild(mkBadge('source', source));
    if (quality) row.appendChild(mkBadge('quality', quality));
    if (hdr)     row.appendChild(mkBadge('hdr', hdr));
    if (codec)   row.appendChild(mkBadge('codec', codec));
    if (audio)   row.appendChild(mkBadge('audio', audio));

    if (warnType === 'warning') row.appendChild(mkBadge('warning', L('warning')));
    else if (warnType === 'risk') row.appendChild(mkBadge('risk', L('risk')));
    else if (compat) row.appendChild(mkBadge('compatible', L('compatible')));

    if (vip)     row.appendChild(mkBadge('vip', L('vip')));
    if (rating)  row.appendChild(mkBadge('rating', '★ ' + rating));
    if (age)     row.appendChild(mkBadge('age', age));

    if (seeds > 0)  row.appendChild(mkSeedsBadge(seeds, 'seeds'));
    if (peers >= 0 && (peers > 0 || seeds > 0)) row.appendChild(mkSeedsBadge(peers, 'peers'));

    if (sizeStr) {
      var sizeEl = document.createElement('span');
      sizeEl.className = 'lbdg lbdg-size';
      sizeEl.textContent = sizeStr;
      row.appendChild(sizeEl);
    }

    return row;
  }

  // ---- Вставка в елемент ----
  function inject(element, data) {
    if (!element || !data) return;
    if (element.querySelector('.lbdg-wrap')) return;

    var seeds = getSeeds(data);
    var pct   = seedsToPct(seeds);

    var wrap = document.createElement('div');
    wrap.className = 'lbdg-wrap';

    var hasSeedsInfo = seeds > 0 || data.seed !== undefined || data.seeds !== undefined;
    if (hasSeedsInfo) wrap.appendChild(mkProgressBar(pct));

    wrap.appendChild(buildBadges(data));

    var anchor = element.querySelector(
      '.torrent-item__info, .online-item__info, .stream-item__info,' +
      '.torrent__info, .online__info, .source__info,' +
      '[class*="__info"], [class*="__title"]'
    );
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
    } else {
      element.appendChild(wrap);
    }
  }

  // ---- Отримання даних з DOM-елемента ----
  function dataFrom(el) {
    if (!el) return null;
    var d = null;
    if (window.jQuery) {
      var $el = window.jQuery(el);
      d = $el.data('torrent') || $el.data('item') || $el.data('data') || $el.data('obj') || $el.data('movie') || $el.data('stream');
    }
    if (!d) d = el._torrent || el._item || el._data || el._stream || el._movie;
    if (!d && el.dataset) {
      var raw = el.dataset.torrent || el.dataset.item || el.dataset.data || el.dataset.stream;
      if (raw) {
        try { d = JSON.parse(raw); } catch (e) {}
      }
    }
    return d || null;
  }

  // ---- Lampa Event Listeners ----
  function onItem(e) {
    if (e.type !== 'render' && e.type !== 'item' && e.type !== 'stream' && e.type !== 'line' && e.type !== 'create') return;
    var el  = e.element || e.node || e.target || e.html;
    var obj = e.torrent || e.data || e.item || e.movie || e.stream || e.object;
    if (!el || !obj) return;
    var htmlEl = (window.jQuery && el instanceof window.jQuery) ? el[0] : el;
    if (htmlEl) inject(htmlEl, obj);
  }

  function subscribeEvents() {
    if (!window.Lampa || !window.Lampa.Listener) return;
    Lampa.Listener.follow('torrent', onItem);
    Lampa.Listener.follow('online', onItem);
    Lampa.Listener.follow('discovery', onItem);
    Lampa.Listener.follow('stream', onItem);
    Lampa.Listener.follow('line', onItem);
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') hookRenderers();
    });
  }

  // ---- Monkey-patch Lampa renderer methods ----
  function hookRenderers() {
    var sources = ['Torrent', 'Online', 'Discovery', 'Stream', 'Line', 'Source'];
    sources.forEach(function (src) {
      if (!window.Lampa || !window.Lampa[src]) return;
      ['render', 'item', 'create', 'build'].forEach(function (method) {
        var orig = window.Lampa[src][method];
        if (typeof orig !== 'function') return;
        window.Lampa[src][method] = function (torrent) {
          var el = orig.apply(this, arguments);
          if (el && torrent) {
            setTimeout(function () {
              var htmlEl = (window.jQuery && el instanceof window.jQuery) ? el[0] : el;
              if (htmlEl) inject(htmlEl, torrent);
            }, 30);
          }
          return el;
        };
      });
    });
  }

  // ---- MutationObserver для динамічних елементів ----
  var ITEM_SELECTOR =
    '.torrent-item,.online-item,.stream-item,.source-item,' +
    '[data-torrent],[data-item],[data-stream],' +
    '[class*="torrent-item"],[class*="online-item"],[class*="stream-item"]';

  function observeDOM() {
    var obs = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          var items = [];
          if (node.matches && node.matches(ITEM_SELECTOR)) items.push(node);
          if (node.querySelectorAll) {
            Array.prototype.forEach.call(node.querySelectorAll(ITEM_SELECTOR), function (el) {
              items.push(el);
            });
          }
          items.forEach(function (item) {
            var d = dataFrom(item);
            if (d) inject(item, d);
          });
        });
      });
    });
    obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

  // ---- Налаштування мови в Lampa ----
  function registerSettings() {
    if (!window.Lampa || !window.Lampa.SettingsApi) return;
    Lampa.SettingsApi.addComponent({
      component : 'lampa_badges',
      name      : 'Lampa Badges',
      icon      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 8h10M7 12h7"/></svg>',
    });
    Lampa.SettingsApi.addParam({
      component : 'lampa_badges',
      param     : { name: 'lampa_badges_lang', type: 'select', values: { uk: 'Українська', ru: 'Русский' }, default: getLang() },
      field     : { name: 'Мова / Язык', description: 'Мова бейджів / Язык бейджей' },
      onChange  : function (v) { localStorage.setItem('lampa_badges_lang', v); },
    });
  }

  // ---- Ініціалізація ----
  function init() {
    injectStyles();
    observeDOM();
    if (window.Lampa) {
      subscribeEvents();
      hookRenderers();
      registerSettings();
      console.log('[' + PLUGIN_NAME + '] v' + PLUGIN_VERSION + ' ready | lang: ' + getLang());
    } else {
      var tries = 0, timer = setInterval(function () {
        tries++;
        if (window.Lampa) {
          clearInterval(timer);
          subscribeEvents();
          hookRenderers();
          registerSettings();
          console.log('[' + PLUGIN_NAME + '] v' + PLUGIN_VERSION + ' ready (deferred) | lang: ' + getLang());
        }
        if (tries > 60) clearInterval(timer);
      }, 500);
    }
  }

  // ---- Реєстрація плагіна в Lampa.Plugin ----
  if (window.Lampa && window.Lampa.Plugin) {
    window.Lampa.Plugin.add(PLUGIN_NAME, {
      name       : 'Lampa Badges',
      description: 'Бейджі якості, розміру, рейтингу для торрентів та онлайн / Бейджи качества, размера, рейтинга для торрентов и онлайн',
      version    : PLUGIN_VERSION,
      author     : 'lampa-badges',
      start      : init,
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // ---- Публічне API ----
  window.LampaBadges = {
    version    : PLUGIN_VERSION,
    getLang    : getLang,
    setLang    : function (l) { localStorage.setItem('lampa_badges_lang', l); },
    inject     : inject,
    buildBadges: buildBadges,
    progressBar: mkProgressBar,
  };

}());
