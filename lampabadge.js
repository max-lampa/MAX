(function () {
  'use strict';

  // ==============================
  //  Lampa Badges Plugin — kod.js
  //  Бейджи для торрент-роздач
  // ==============================

  var PLUGIN_NAME = 'badges_plugin';
  var PLUGIN_VERSION = '1.3.0';

  // ---- Стилі бейджів ----
  var CSS = `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      line-height: 1.4;
      white-space: nowrap;
    }
    /* Джерело / Автор */
    .badge--source {
      border: 1px solid #e8a020;
      color: #e8a020;
    }
    /* Якість: 2160p, 1080p, 720p */
    .badge--quality {
      border: 1px solid #e8a020;
      color: #e8a020;
    }
    /* HDR */
    .badge--hdr {
      border: 1px solid #c080ff;
      color: #c080ff;
    }
    /* Попередження: Може не грати, Ризик */
    .badge--warning {
      border: 1px solid #e05050;
      color: #e05050;
    }
    /* Рейтинг */
    .badge--rating {
      border: 1px solid #888;
      color: #ccc;
    }
    /* Сумісно */
    .badge--compatible {
      border: 1px solid #2a8a6a;
      color: #3dcca0;
    }
    /* VIP */
    .badge--vip {
      border: 1px solid #7a3aaa;
      color: #cc88ff;
    }
    /* Вік: 17+, 18+ */
    .badge--age {
      border: 1px solid #cc4444;
      color: #ff8888;
    }
    /* Розмір файлу */
    .badge--size {
      border: 1px solid #2a7a3a;
      color: #4ecb6a;
      font-weight: 600;
    }
    /* Сіди */
    .badge--seeds {
      border: 1px solid #555;
      color: #aaa;
    }
    /* Піри */
    .badge--peers {
      border: 1px solid #555;
      color: #aaa;
    }
    /* Кодек: H.265, H.264, AV1 */
    .badge--codec {
      border: 1px solid #888;
      color: #bbb;
    }
    /* Аудіо: Dolby Atmos, DTS */
    .badge--audio {
      border: 1px solid #5588cc;
      color: #88aaee;
    }
    /* Блок бейджів */
    .torrent-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
      align-items: center;
    }
    /* Стрілки сіди/піри */
    .badge-seeds-wrap { display: inline-flex; align-items: center; gap: 2px; }
    .badge-seeds-wrap .arrow-up   { color: #4ecb6a; font-size: 11px; }
    .badge-seeds-wrap .arrow-down { color: #e05050; font-size: 11px; }
    /* Розмір — завжди в кінці */
    .badge-size-wrap {
      margin-left: auto;
    }
    /* Прогрес-бар */
    .torrent-progress-bar {
      width: 100%;
      height: 2px;
      background: #333;
      border-radius: 2px;
      overflow: hidden;
      margin: 4px 0;
    }
    .torrent-progress-bar__fill {
      height: 100%;
      border-radius: 2px;
      background: linear-gradient(90deg, #e8a020, #f0c040);
      transition: width 0.3s ease;
    }
  `;

  // ---- Утіліти ----
  function badge(cls, text) {
    var el = document.createElement('span');
    el.className = 'badge badge--' + cls;
    el.textContent = text;
    return el;
  }

  function seedsBadge(count, type) {
    var wrap = document.createElement('span');
    wrap.className = 'badge-seeds-wrap';
    var arrow = document.createElement('span');
    arrow.className = type === 'seeds' ? 'arrow-up' : 'arrow-down';
    arrow.textContent = type === 'seeds' ? '↑' : '↓';
    var num = document.createElement('span');
    num.className = 'badge badge--' + (type === 'seeds' ? 'seeds' : 'peers');
    num.textContent = String(count);
    wrap.appendChild(arrow);
    wrap.appendChild(num);
    return wrap;
  }

  function sizeBadge(sizeStr) {
    var wrap = document.createElement('span');
    wrap.className = 'badge-size-wrap';
    var b = badge('size', sizeStr);
    wrap.appendChild(b);
    return wrap;
  }

  function progressBar(percent) {
    var bar = document.createElement('div');
    bar.className = 'torrent-progress-bar';
    var fill = document.createElement('div');
    fill.className = 'torrent-progress-bar__fill';
    fill.style.width = Math.min(100, percent) + '%';
    bar.appendChild(fill);
    return bar;
  }

  // ---- Аналіз роздачі ----
  function detectQuality(torrent) {
    var q = (torrent.quality || torrent.Quality || '').toLowerCase();
    if (q.indexOf('2160') !== -1 || q.indexOf('4k') !== -1) return '2160p';
    if (q.indexOf('1080') !== -1) return '1080p';
    if (q.indexOf('720') !== -1) return '720p';
    if (q.indexOf('480') !== -1) return '480p';
    return q.toUpperCase() || null;
  }

  function detectHDR(torrent) {
    var info = JSON.stringify(torrent).toLowerCase();
    if (info.indexOf('dolby vision') !== -1 || info.indexOf('dv') !== -1) return 'Dolby Vision';
    if (info.indexOf('hdr10+') !== -1) return 'HDR10+';
    if (info.indexOf('hdr10') !== -1) return 'HDR10';
    if (info.indexOf('hdr') !== -1) return 'HDR';
    return null;
  }

  function detectCodec(torrent) {
    var info = JSON.stringify(torrent).toLowerCase();
    if (info.indexOf('av1') !== -1) return 'AV1';
    if (info.indexOf('h.265') !== -1 || info.indexOf('hevc') !== -1 || info.indexOf('x265') !== -1) return 'H.265';
    if (info.indexOf('h.264') !== -1 || info.indexOf('avc') !== -1 || info.indexOf('x264') !== -1) return 'H.264';
    return null;
  }

  function detectAudio(torrent) {
    var info = JSON.stringify(torrent).toLowerCase();
    if (info.indexOf('dolby atmos') !== -1) return 'Dolby Atmos';
    if (info.indexOf('truehd') !== -1) return 'TrueHD';
    if (info.indexOf('dts-hd') !== -1) return 'DTS-HD';
    if (info.indexOf('dts') !== -1) return 'DTS';
    if (info.indexOf('ac3') !== -1 || info.indexOf('dolby digital') !== -1) return 'DD';
    return null;
  }

  function detectAge(torrent) {
    var info = JSON.stringify(torrent);
    var m = info.match(/(18|17|16|12)\+/);
    return m ? m[0] : null;
  }

  function detectWarning(torrent, qualityStr) {
    // Може не грати — великий файл або Dolby Vision
    var size = parseFloat(torrent.size || torrent.Size || 0);
    var hdr = detectHDR(torrent);
    if (hdr === 'Dolby Vision') return 'Може не грати';
    if (hdr && size > 50) return 'Може не грати';
    if (size > 15 && qualityStr === '2160p') return 'Ризик';
    if (size > 8 && qualityStr === '2160p') return 'Ризик';
    return null;
  }

  function isCompatible(torrent) {
    var q = detectQuality(torrent);
    var codec = detectCodec(torrent);
    var hdr = detectHDR(torrent);
    return !hdr && codec !== 'AV1' && (q === '1080p' || q === '720p' || q === '480p');
  }

  function isVIP(torrent) {
    var info = JSON.stringify(torrent).toLowerCase();
    return info.indexOf('vip') !== -1 || info.indexOf('premium') !== -1;
  }

  function formatSize(torrent) {
    var size = parseFloat(torrent.size || torrent.Size || 0);
    if (!size) return null;
    return size.toFixed(2) + ' GB';
  }

  function getSeeds(torrent) {
    return parseInt(torrent.seed || torrent.seeds || torrent.Seed || 0, 10);
  }

  function getPeers(torrent) {
    return parseInt(torrent.peer || torrent.peers || torrent.Peer || 0, 10);
  }

  function getRating(torrent) {
    var r = parseFloat(torrent.rating || torrent.Rating || torrent.imdb || 0);
    return r > 0 ? r.toFixed(1) : null;
  }

  function getSource(torrent) {
    return torrent.tracker || torrent.Tracker || torrent.source || '';
  }

  // ---- Прогрес-бар відсоток ----
  function seedsToPercent(seeds) {
    if (seeds > 200) return 95;
    if (seeds > 100) return 85;
    if (seeds > 50) return 75;
    if (seeds > 20) return 60;
    if (seeds > 10) return 45;
    if (seeds > 5) return 35;
    if (seeds > 2) return 25;
    if (seeds > 0) return 15;
    return 5;
  }

  // ---- Будуємо блок бейджів ----
  function buildBadges(torrent) {
    var container = document.createElement('div');
    container.className = 'torrent-badges';

    var qualityStr = detectQuality(torrent);
    var hdrStr = detectHDR(torrent);
    var codecStr = detectCodec(torrent);
    var audioStr = detectAudio(torrent);
    var ageStr = detectAge(torrent);
    var sizeStr = formatSize(torrent);
    var seeds = getSeeds(torrent);
    var peers = getPeers(torrent);
    var rating = getRating(torrent);
    var source = getSource(torrent);
    var warnStr = detectWarning(torrent, qualityStr);
    var compatible = isCompatible(torrent);
    var vip = isVIP(torrent);

    // Джерело/трекер
    if (source) container.appendChild(badge('source', source));

    // Якість
    if (qualityStr) container.appendChild(badge('quality', qualityStr));

    // HDR
    if (hdrStr) container.appendChild(badge('hdr', hdrStr));

    // Кодек
    if (codecStr) container.appendChild(badge('codec', codecStr));

    // Аудіо
    if (audioStr) container.appendChild(badge('audio', audioStr));

    // Попередження
    if (warnStr) container.appendChild(badge('warning', warnStr));

    // Сумісно (SDR + відомий кодек)
    if (compatible && !warnStr) container.appendChild(badge('compatible', 'Сумісно'));

    // VIP
    if (vip) container.appendChild(badge('vip', 'VIP'));

    // Рейтинг
    if (rating) container.appendChild(badge('rating', '★ ' + rating));

    // Вік
    if (ageStr) container.appendChild(badge('age', ageStr));

    // Сіди та піри
    if (seeds > 0) container.appendChild(seedsBadge(seeds, 'seeds'));
    if (peers >= 0) container.appendChild(seedsBadge(peers, 'peers'));

    // Розмір (завжди останній, правий)
    if (sizeStr) container.appendChild(sizeBadge(sizeStr));

    return container;
  }

  // ---- Вставка прогрес-бару і бейджів ----
  function injectBadges(element, torrent) {
    // Уникаємо дублювання
    if (element.querySelector('.torrent-badges')) return;

    var seeds = getSeeds(torrent);
    var percent = seedsToPercent(seeds);

    // Прогрес-бар
    var bar = progressBar(percent);
    var infoLine = element.querySelector('.torrent-item__info, .torrent__info, [class*="info"]');
    if (infoLine && infoLine.parentNode) {
      infoLine.parentNode.insertBefore(bar, infoLine.nextSibling);
    } else {
      element.appendChild(bar);
    }

    // Бейджі
    var badgesBlock = buildBadges(torrent);
    element.appendChild(badgesBlock);
  }

  // ---- Ін'єкція стилів ----
  function injectStyles() {
    if (document.getElementById('badges-plugin-css')) return;
    var style = document.createElement('style');
    style.id = 'badges-plugin-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ---- Обробник події Lampa ----
  function onTorrentItem(data) {
    var element = data.element || data.node || data.target;
    var torrent = data.torrent || data.data || data.item;
    if (!element || !torrent) return;
    injectBadges(element, torrent);
  }

  // ---- Хук для рядка-елемента (перехоплення render) ----
  function hookRenderer() {
    // Перехоплюємо Lampa.Torrent.render або аналогічне
    var sources = ['Torrent', 'Online', 'Discovery'];
    sources.forEach(function (src) {
      if (window.Lampa && window.Lampa[src]) {
        var orig = window.Lampa[src].render || window.Lampa[src].item;
        if (typeof orig === 'function') {
          window.Lampa[src].render = function (torrent) {
            var el = orig.apply(this, arguments);
            if (el && torrent) {
              setTimeout(function () { injectBadges(el, torrent); }, 0);
            }
            return el;
          };
        }
      }
    });
  }

  // ---- Підписка на події Lampa ----
  function subscribe() {
    if (!window.Lampa || !window.Lampa.Listener) return;

    // Рядок торренту
    Lampa.Listener.follow('torrent', function (e) {
      if (e.type === 'render' || e.type === 'item') onTorrentItem(e);
    });

    // Онлайн-джерела
    Lampa.Listener.follow('online', function (e) {
      if (e.type === 'render' || e.type === 'item') onTorrentItem(e);
    });

    // Загальні DOM-зміни
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') hookRenderer();
    });
  }

  // ---- MutationObserver: знаходимо нові елементи і додаємо бейджі ----
  function observeDOM() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          // Шукаємо елементи торрентів
          var items = node.querySelectorAll
            ? node.querySelectorAll('[data-torrent], .torrent-item, [class*="torrent"], [class*="online-item"]')
            : [];
          items.forEach(function (item) {
            var data = item._torrent || item.dataset.torrent;
            if (data) {
              try {
                var torrent = typeof data === 'string' ? JSON.parse(data) : data;
                injectBadges(item, torrent);
              } catch (e) {}
            }
          });
        });
      });
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // ---- Публічний API плагіна ----
  var BadgesPlugin = {
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,

    // Ручне застосування бейджів до елементу
    apply: function (element, torrent) {
      injectStyles();
      injectBadges(element, torrent);
    },

    // Будує лише HTML-блок бейджів
    buildBadges: buildBadges,

    // Будує прогрес-бар
    progressBar: progressBar,
  };

  // ---- Ініціалізація ----
  function init() {
    injectStyles();

    if (window.Lampa) {
      subscribe();
      hookRenderer();
      observeDOM();
      console.log('[' + PLUGIN_NAME + '] v' + PLUGIN_VERSION + ' ініціалізовано (Lampa mode)');
    } else {
      // Standalone режим — чекаємо Lampa
      var attempts = 0;
      var timer = setInterval(function () {
        attempts++;
        if (window.Lampa) {
          clearInterval(timer);
          subscribe();
          hookRenderer();
          observeDOM();
          console.log('[' + PLUGIN_NAME + '] v' + PLUGIN_VERSION + ' ініціалізовано');
        }
        if (attempts > 60) clearInterval(timer);
      }, 500);
    }
  }

  // ---- Реєстрація в Lampa ----
  if (window.Lampa && window.Lampa.Plugin) {
    window.Lampa.Plugin.add(PLUGIN_NAME, {
      name: 'Badges Plugin',
      description: 'Бейджі якості, розміру, рейтингу та попереджень для торрент-роздач',
      version: PLUGIN_VERSION,
      author: 'badges-plugin',
      start: init,
    });
  } else {
    // Запускаємо одразу якщо Lampa.Plugin недоступний
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Експорт
  window.BadgesPlugin = BadgesPlugin;

})();