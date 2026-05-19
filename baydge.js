(function () {
  'use strict';

  // ==============================
  //  Lampa Badges Plugin — Fixed
  //  Бейджи для торрент-роздач та онлайн-потоків
  // ==============================

  var PLUGIN_NAME = 'badges_plugin';
  var PLUGIN_VERSION = '1.4.0';

  // ---- Стилі бейджів ----
  var CSS = "" +
    ".badge { display: inline-flex; align-items: center; gap: 2px; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; line-height: 1.4; white-space: nowrap; }" +
    ".badge--source { border: 1px solid #e8a020; color: #e8a020; }" +
    ".badge--quality { border: 1px solid #e8a020; color: #e8a020; }" +
    ".badge--hdr { border: 1px solid #c080ff; color: #c080ff; }" +
    ".badge--warning { border: 1px solid #e05050; color: #e05050; }" +
    ".badge--rating { border: 1px solid #888; color: #ccc; }" +
    ".badge--compatible { border: 1px solid #2a8a6a; color: #3dcca0; }" +
    ".badge--vip { border: 1px solid #7a3aaa; color: #cc88ff; }" +
    ".badge--age { border: 1px solid #cc4444; color: #ff8888; }" +
    ".badge--size { border: 1px solid #2a7a3a; color: #4ecb6a; font-weight: 600; }" +
    ".badge--seeds { border: 1px solid #555; color: #aaa; }" +
    ".badge--peers { border: 1px solid #555; color: #aaa; }" +
    ".badge--codec { border: 1px solid #888; color: #bbb; }" +
    ".badge--audio { border: 1px solid #5588cc; color: #88aaee; }" +
    ".torrent-badges { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; align-items: center; width: 100%; }" +
    ".badge-seeds-wrap { display: inline-flex; align-items: center; gap: 2px; }" +
    ".badge-seeds-wrap .arrow-up   { color: #4ecb6a; font-size: 11px; }" +
    ".badge-seeds-wrap .arrow-down { color: #e05050; font-size: 11px; }" +
    ".badge-size-wrap { margin-left: auto; }" +
    ".torrent-progress-bar { width: 100%; height: 2px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; margin: 4px 0; }" +
    ".torrent-progress-bar__fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #e8a020, #f0c040); transition: width 0.3s ease; }";

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

  function detectQuality(torrent) {
    var q = (torrent.quality || torrent.Quality || torrent.resolution || '').toLowerCase();
    if (q.indexOf('2160') !== -1 || q.indexOf('4k') !== -1) return '2160p';
    if (q.indexOf('1080') !== -1) return '1080p';
    if (q.indexOf('720') !== -1) return '720p';
    if (q.indexOf('480') !== -1) return '480p';
    
    var info = JSON.stringify(torrent).toLowerCase();
    if (info.indexOf('2160p') !== -1 || info.indexOf('4k') !== -1) return '2160p';
    if (info.indexOf('1080p') !== -1) return '1080p';
    if (info.indexOf('720p') !== -1) return '720p';

    return q.toUpperCase() || null;
  }

  function detectHDR(torrent) {
    var info = JSON.stringify(torrent).toLowerCase();
    if (info.indexOf('dolby vision') !== -1 || info.indexOf('dv') !== -1 || info.indexOf('dovi') !== -1) return 'Dolby Vision';
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
    if (info.indexOf('dolby atmos') !== -1 || info.indexOf('atmos') !== -1) return 'Dolby Atmos';
    if (info.indexOf('truehd') !== -1) return 'TrueHD';
    if (info.indexOf('dts-hd') !== -1 || info.indexOf('dtshd') !== -1) return 'DTS-HD';
    if (info.indexOf('dts') !== -1) return 'DTS';
    if (info.indexOf('ac3') !== -1 || info.indexOf('dolby digital') !== -1) return 'DD';
    if (info.indexOf('aac') !== -1) return 'AAC';
    return null;
  }

  function detectAge(torrent) {
    var info = JSON.stringify(torrent);
    var m = info.match(/(18|17|16|12)+/);
    return m ? m[0] : null;
  }

  function detectWarning(torrent, qualityStr) {
    var size = parseFloat(torrent.size || torrent.Size || 0);
    if (!size && typeof torrent.size_bytes !== 'undefined') {
        size = torrent.size_bytes / (1024*1024*1024);
    }
    
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
    if (!size && torrent.size_bytes) {
        size = torrent.size_bytes / (1024*1024*1024);
    }
    if (!size) {
        var str = JSON.stringify(torrent);
        var m = str.match(/([0-9.]+)s*(gb|гб|mb|мб)/i);
        if (m) {
            return m[1] + ' ' + m[2].toUpperCase();
        }
        return null;
    }
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
    return torrent.tracker || torrent.Tracker || torrent.source || torrent.translation || torrent.name || '';
  }

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

    if (source) container.appendChild(badge('source', (source.length > 20 ? source.substring(0, 20) + '...' : source)));
    if (qualityStr) container.appendChild(badge('quality', qualityStr));
    if (hdrStr) container.appendChild(badge('hdr', hdrStr));
    if (codecStr) container.appendChild(badge('codec', codecStr));
    if (audioStr) container.appendChild(badge('audio', audioStr));
    if (warnStr) container.appendChild(badge('warning', warnStr));
    if (compatible && !warnStr) container.appendChild(badge('compatible', 'Сумісно'));
    if (vip) container.appendChild(badge('vip', 'VIP'));
    if (rating) container.appendChild(badge('rating', '★ ' + rating));
    if (ageStr) container.appendChild(badge('age', ageStr));
    if (seeds > 0) container.appendChild(seedsBadge(seeds, 'seeds'));
    if (peers >= 0) container.appendChild(seedsBadge(peers, 'peers'));
    if (sizeStr) container.appendChild(sizeBadge(sizeStr));

    return container;
  }

  function injectBadges(element, torrent) {
    if (!element || !torrent) return;
    if (element.querySelector('.torrent-badges')) return; // Вже є

    var seeds = getSeeds(torrent);
    var percent = seedsToPercent(seeds);
    
    var container = document.createElement('div');
    container.style.width = '100%';
    
    if (seeds > 0 || torrent.seed !== undefined) {
        var bar = progressBar(percent);
        container.appendChild(bar);
    }
    
    var badgesBlock = buildBadges(torrent);
    container.appendChild(badgesBlock);

    // Шукаємо куди вставити. Враховуємо онлайн балансери, стріми і торренти
    var infoLine = element.querySelector('.torrent-item__info, .online-item__info, .stream-item__info, [class*="info"], .torrent-item__title, .online-item__title, [class*="title"]');
    
    if (infoLine && infoLine.parentNode) {
      infoLine.parentNode.insertBefore(container, infoLine.nextSibling);
    } else {
      element.appendChild(container);
    }
  }

  function injectStyles() {
    if (document.getElementById('badges-plugin-css')) return;
    var style = document.createElement('style');
    style.id = 'badges-plugin-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function onTorrentItem(data) {
    var element = data.element || data.node || data.target || data.html;
    var torrent = data.torrent || data.data || data.item || data.movie;
    if (!element || !torrent) return;
    var htmlEl = element instanceof window.jQuery ? element[0] : element;
    if (htmlEl) injectBadges(htmlEl, torrent);
  }

  function hookRenderer() {
    var sources = ['Torrent', 'Online', 'Discovery', 'Stream', 'Line'];
    sources.forEach(function (src) {
      if (window.Lampa && window.Lampa[src]) {
        ['render', 'item', 'create'].forEach(function(method) {
            var orig = window.Lampa[src][method];
            if (typeof orig === 'function') {
              window.Lampa[src][method] = function (torrent) {
                var el = orig.apply(this, arguments);
                if (el && torrent) {
                  setTimeout(function () { 
                    var htmlEl = el instanceof window.jQuery ? el[0] : el;
                    injectBadges(htmlEl, torrent); 
                  }, 50);
                }
                return el;
              };
            }
        });
      }
    });
  }

  function subscribe() {
    if (!window.Lampa || !window.Lampa.Listener) return;

    Lampa.Listener.follow('torrent', function (e) {
      if (e.type === 'render' || e.type === 'item') onTorrentItem(e);
    });

    Lampa.Listener.follow('online', function (e) {
      if (e.type === 'render' || e.type === 'item' || e.type === 'stream' || e.type === 'line') onTorrentItem(e);
    });

    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') hookRenderer();
    });
  }

  function getTorrentDataFromElement(item) {
    var data = null;
    if (window.jQuery) {
      var $item = window.jQuery(item);
      data = $item.data('torrent') || $item.data('item') || $item.data('data') || $item.data('obj') || $item.data('movie');
    }
    if (!data) {
      data = item._torrent || item._item || item._data || item.dataset.torrent || item.dataset.item || item.dataset.data;
    }
    
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch(e) {}
    }
    return data;
  }

  function observeDOM() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          
          var items = node.querySelectorAll
            ? node.querySelectorAll('.torrent-item, .online-item, .stream-item, [data-torrent], [data-item], [data-data], [class*="torrent"], [class*="online"], [class*="stream"]')
            : [];
            
          if (node.matches && node.matches('.torrent-item, .online-item, .stream-item, [data-torrent], [data-item], [data-data], [class*="torrent"], [class*="online"], [class*="stream"]')) {
              items = Array.from(items);
              items.push(node);
          }

          items.forEach(function (item) {
            var data = getTorrentDataFromElement(item);
            if (data) {
               injectBadges(item, data);
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

  var BadgesPlugin = {
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
    apply: function (element, torrent) {
      injectStyles();
      injectBadges(element, torrent);
    },
    buildBadges: buildBadges,
    progressBar: progressBar,
  };

  function init() {
    injectStyles();

    if (window.Lampa) {
      subscribe();
      hookRenderer();
      observeDOM();
      console.log('[' + PLUGIN_NAME + '] v' + PLUGIN_VERSION + ' ініціалізовано (Lampa mode)');
    } else {
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
      
      observeDOM(); 
    }
  }

  if (window.Lampa && window.Lampa.Plugin) {
    window.Lampa.Plugin.add(PLUGIN_NAME, {
      name: 'Badges Plugin Fixed',
      description: 'Бейджі якості, розміру, рейтингу для торрентів та онлайн-баз',
      version: PLUGIN_VERSION,
      author: 'badges-plugin',
      start: init,
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  window.BadgesPlugin = BadgesPlugin;

})();