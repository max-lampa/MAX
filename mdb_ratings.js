/* 
 * author: '@bodya_elven' 
 */

(function() {
  'use strict';
  /*
  |==========================================================================
  | localStorage shim & Promise & Fetch Polyfills
  |==========================================================================
  */
  (function() {
    var ok = true;
    try {
      var t = '__lmp_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
    } catch (e) { ok = false; }
    if (!ok) {
      var mem = {};
      window.localStorage = {
        getItem: function(k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[mem[k]] : null; },
        setItem: function(k, v) { mem[k] = String(v); },
        removeItem: function(k) { delete mem[k]; },
        clear: function() { mem = {}; }
      };
    }
  })();

  (function(global) {
    if (global.Promise) return;
    var PENDING = 0, FULFILLED = 1, REJECTED = 2;
    function asap(fn) { setTimeout(fn, 0); }
    function MiniPromise(executor) {
      if (!(this instanceof MiniPromise)) return new MiniPromise(executor);
      var self = this; self._state = PENDING; self._value = void 0; self._handlers = [];
      function resolve(value) {
        if (self._state !== PENDING) return;
        if (value && (typeof value === 'object' || typeof value === 'function')) {
          var then;
          try { then = value.then; } catch (e) { return reject(e); }
          if (typeof then === 'function') return then.call(value, resolve, reject);
        }
        self._state = FULFILLED; self._value = value; finale();
      }
      function reject(reason) {
        if (self._state !== PENDING) return;
        self._state = REJECTED; self._value = reason; finale();
      }
      function finale() { asap(function() { var q = self._handlers; self._handlers = []; for (var i = 0; i < q.length; i++) handle(q[i]); }); }
      function handle(h) {
        if (self._state === PENDING) { self._handlers.push(h); return; }
        var cb = self._state === FULFILLED ? h.onFulfilled : h.onRejected;
        if (!cb) { (self._state === FULFILLED ? h.resolve : h.reject)(self._value); return; }
        try { var ret = cb(self._value); h.resolve(ret); } catch (e) { h.reject(e); }
      }
      this.then = function(onFulfilled, onRejected) {
        return new MiniPromise(function(resolve, reject) { handle({ onFulfilled: onFulfilled, onRejected: onRejected, resolve: resolve, reject: reject }); });
      };
      this.catch = function(onRejected) { return this.then(null, onRejected); };
      try { executor(resolve, reject); } catch (e) { reject(e); }
    }
    MiniPromise.resolve = function(v) { return new MiniPromise(function(res) { res(v); }); };
    MiniPromise.reject = function(r) { return new MiniPromise(function(_, rej) { rej(r); }); };
    global.Promise = MiniPromise;
  })(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));

  (function(global) {
    if (global.fetch) return;
    function Response(body, init) {
      this.status = init && init.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
      this._body = body == null ? '' : String(body);
      this.headers = (init && init.headers) || {};
    }
    Response.prototype.json = function() {
      var self = this;
      return Promise.resolve().then(function() { return JSON.parse(self._body || 'null'); });
    };
    global.fetch = function(input, init) {
      init = init || {};
      var url = (typeof input === 'string') ? input : (input && input.url) || '';
      var method = (init.method || 'GET').toUpperCase();
      var headers = init.headers || {};
      if (global.Lampa && Lampa.Reguest) {
        return new Promise(function(resolve) {
          new Lampa.Reguest().native(url, function(data) {
            var text = (typeof data === 'string') ? data : (data != null ? JSON.stringify(data) : '');
            resolve(new Response(text, { status: 200, headers: headers }));
          }, function() { resolve(new Response('', { status: 500, headers: headers })); }, false, { dataType: 'text', method: method, headers: headers });
        });
      }
    };
  })(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));

  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function(callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) callback.call(thisArg, this[i], i, this);
    };
  }

  /*
  |==========================================================================
  | КОНФІГУРАЦІЯ ТА ЗМІННІ
  |==========================================================================
  */
  var LMP_ENH_CONFIG = { apiKeys: { mdblist: '' } };

  var ICONS_BASE_URL = 'https://bodya-elven.github.io/different/icons/';
  var ICONS_BW_URL = 'https://bodya-elven.github.io/different/icons/bw/';
  var ICONS_WIDE_URL = 'https://bodya-elven.github.io/different/icons/wide/';

  var ICONS = {
    imdb: ICONS_BASE_URL + 'imdb.svg',
    tmdb: ICONS_BASE_URL + 'tmdb.svg',
    tmdb_poster: 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg',
    trakt: ICONS_BASE_URL + 'trakt.svg',
    letterboxd: ICONS_BASE_URL + 'letterboxd.svg',
    metacritic: ICONS_BASE_URL + 'metacritic.svg',
    rotten_good: ICONS_BASE_URL + 'rt.svg',
    rotten_bad: ICONS_BASE_URL + 'rt-bad.svg',
    popcorn: ICONS_BASE_URL + 'popcorn.svg',
    popcorn_bad: ICONS_BASE_URL + 'popcorn-bad.svg',
    mdblist: ICONS_BASE_URL + 'mdblist.svg',
    mal: ICONS_BASE_URL + 'mal.svg'
  };

  var ICONS_BW = {
    imdb: ICONS_BW_URL + 'imdb-bw.png',
    tmdb: ICONS_BW_URL + 'tmdb-bw.png',
    trakt: ICONS_BW_URL + 'trakt-bw.png',
    letterboxd: ICONS_BW_URL + 'letterboxd-bw.png',
    metacritic: ICONS_BW_URL + 'metacritic-bw.png',
    rotten_good: ICONS_BW_URL + 'rt-bw.png',
    rotten_bad: ICONS_BW_URL + 'rt-bad-bw.png',
    popcorn: ICONS_BW_URL + 'popcorn-bw.png',
    popcorn_bad: ICONS_BW_URL + 'popcorn-bad-bw.png',
    mdblist: ICONS_BW_URL + 'mdblist-bw.png',
    mal: ICONS_BW_URL + 'mal-bw.png'
  };

  var ICONS_WIDE = {
    imdb: ICONS_WIDE_URL + 'imdb-wide.webp',
    tmdb: ICONS_WIDE_URL + 'tmdb-wide.webp',
    trakt: ICONS_WIDE_URL + 'trakt-wide.webp',
    letterboxd: ICONS_WIDE_URL + 'letterboxd-wide.webp',
    metacritic: ICONS_WIDE_URL + 'metacritic-wide.webp',
    rotten_good: ICONS_WIDE_URL + 'rt-wide.webp',
    rotten_bad: ICONS_WIDE_URL + 'rt-bad-wide.webp',
    popcorn: ICONS_WIDE_URL + 'popcorn-wide.webp',
    mdblist: ICONS_WIDE_URL + 'mdblist-wide.webp',
    mal: ICONS_WIDE_URL + 'mal-wide.webp'
  };

var ICONS_WIDE_NB = {
    imdb: ICONS_WIDE_URL + 'imdb-wide-nb.webp',
    tmdb: ICONS_WIDE_URL + 'tmdb-wide-nb.webp',
    trakt: ICONS_WIDE_URL + 'trakt-wide-nb.webp',
    letterboxd: ICONS_WIDE_URL + 'letterboxd-wide-nb.webp',
    metacritic: ICONS_WIDE_URL + 'metacritic-wide-nb.webp',
    rotten_good: ICONS_WIDE_URL + 'rt-wide-nb.webp',
    rotten_bad: ICONS_WIDE_URL + 'rt-bad-wide-nb.webp',
    popcorn: ICONS_WIDE_URL + 'popcorn-wide-nb.webp',
    mdblist: ICONS_WIDE_URL + 'mdblist-wide-nb.webp',
    mal: ICONS_WIDE_URL + 'mal-wide-nb.webp'
};
  
  var pluginStyles = "<style>" +
    ":root{" +
    "  --lmp-logo-offset: 0px;" +
    "  --lmp-text-offset: 0px;" +
    "  --lmp-rate-spacing: 0px;" +
    "  --lmp-bg-opacity: 0;" +
    "}" +
    ".loading-dots-container { display: inline-flex; align-items: center; font-size: 0.85em; color: #ccc; padding: 0.6em 1em; border-radius: 0.5em; margin-right: 0.5em; margin-bottom: 0.4em; }" +
    ".loading-dots__text { margin-right: 1em; }" +
    ".loading-dots__dot { width: 0.5em; height: 0.5em; border-radius: 50%; background-color: currentColor; animation: loading-dots-bounce 1.4s infinite ease-in-out both; }" +
    ".loading-dots__dot:nth-child(1) { animation-delay: -0.32s; }" +
    ".loading-dots__dot:nth-child(2) { animation-delay: -0.16s; }" +
    "@keyframes loading-dots-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.6; } 40% { transform: translateY(-0.5em); opacity: 1; } }" +
    
    ".lmp-custom-rate { display: inline-flex !important; align-items: center; justify-content: center; gap: 0.3em; padding: 0.2em 0.4em; border-radius: 0.4em; transition: background 0.2s, border 0.2s, box-shadow 0.2s; margin-right: calc(0.25em + var(--lmp-rate-spacing)) !important; margin-bottom: calc(0.2em + (var(--lmp-rate-spacing) / 2)) !important; border: 1px solid transparent; background: rgba(0, 0, 0, var(--lmp-bg-opacity)); }" +
    ".lmp-custom-rate .source--name { display: flex !important; align-items: center; justify-content: center; margin: 0; position: relative; height: calc(22px + var(--lmp-logo-offset)); width: auto; }" +
    ".lmp-custom-rate .source--name img { display: block !important; position: relative; z-index: 1; object-fit: contain; height: 100% !important; filter: drop-shadow(0px 0px 4px rgba(0,0,0,0.8)); }" +
    
    ".lmp-custom-rate .rate--text-block { display: flex; align-items: baseline; text-shadow: 0 0 5px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,0.8); z-index: 1; }" +
    ".lmp-custom-rate .rate--value { font-weight: bold; line-height: 1; font-size: calc(1.1em + var(--lmp-text-offset)); transition: color 0.2s; }" +
    ".lmp-custom-rate .rate--votes { font-size: calc(0.6em + (var(--lmp-text-offset) / 2)); opacity: 0.8; margin-left: 0.25em; line-height: 1; }" +
    
    ".lmp-dir-right { flex-direction: row-reverse; }" +
    ".lmp-dir-left { flex-direction: row; }" +
    ".lmp-dir-top { flex-direction: column-reverse; }" +
    ".lmp-dir-bottom { flex-direction: column; }" +
    ".lmp-dir-top .rate--text-block { flex-direction: column-reverse; align-items: center; }" +
    ".lmp-dir-bottom .rate--text-block { flex-direction: column; align-items: center; }" +
    ".lmp-dir-top .rate--votes, .lmp-dir-bottom .rate--votes { margin-left: 0; margin-top: 0.15em; margin-bottom: 0.15em; line-height: 0.8; }" +
    
    ".lmp-color-green { color: #2ecc71 !important; }" +
    ".lmp-color-blue { color: #60a5fa !important; }" +
    ".lmp-color-orange { color: #f59e0b !important; }" +
    ".lmp-color-red { color: #ef4444 !important; }" +
    
    "body.lmp-enh--rate-border .lmp-custom-rate { border-color: rgba(255, 255, 255, 0.3); }" +
    "body.lmp-enh--glow .lmp-glow-green { border-color: rgba(46,204,113,0.6) !important; box-shadow: 0 0 8px rgba(46,204,113,0.4) !important; }" +
    "body.lmp-enh--glow .lmp-glow-blue { border-color: rgba(96,165,250,0.6) !important; box-shadow: 0 0 8px rgba(96,165,250,0.4) !important; }" +
    "body.lmp-enh--glow .lmp-glow-orange { border-color: rgba(245,158,11,0.6) !important; box-shadow: 0 0 8px rgba(245,158,11,0.4) !important; }" +
    "body.lmp-enh--glow .lmp-glow-red { border-color: rgba(239,68,68,0.6) !important; box-shadow: 0 0 8px rgba(239,68,68,0.4) !important; }" +
    
    ".settings-param__descr,.settings-param__subtitle{white-space:pre-line;}" +
    ".menu-edit-list .selector { background: transparent !important; transition: background 0.2s ease; outline: none; border-radius: 6px; }" +
    ".menu-edit-list .selector.focus, .menu-edit-list .selector:hover { background: rgba(255, 255, 255, 0.15) !important; }" +
    
    "body.omdb-plugin-active .card__vote { display: none !important; opacity: 0 !important; visibility: hidden !important; }" + 
    ".omdb-custom-rate { position: absolute; right: 0.4em; bottom: 0.4em; background: rgba(0,0,0,0.75); color: #fff; padding: 0.2em 0.5em; border-radius: 1em; display: flex; align-items: center; z-index: 10; font-family: 'Segoe UI', sans-serif; font-size: 0.9em; line-height: 1; pointer-events: none; border: none; transition: box-shadow 0.2s; }" +
    ".omdb-custom-rate span { font-weight: bold; font-size: 1em; }" +
    ".omdb-custom-rate img { width: 1.2em; height: 1.2em; margin-left: 0.3em; object-fit: contain; filter: drop-shadow(0px 0px 2px rgba(0,0,0,0.5)); }" +
    
    "body.omdb-enh--glow .omdb-glow-green { box-shadow: 0 0 8px rgba(46,204,113,0.6) !important; }" +
    "body.omdb-enh--glow .omdb-glow-blue { box-shadow: 0 0 8px rgba(96,165,250,0.6) !important; }" +
    "body.omdb-enh--glow .omdb-glow-orange { box-shadow: 0 0 8px rgba(245,158,11,0.6) !important; }" +
    "body.omdb-enh--glow .omdb-glow-red { box-shadow: 0 0 8px rgba(239,68,68,0.6) !important; }" +
        /* CSS для динамічних кольорів */
    ".mdb-dynamic-color-wrapper { display: inline-block; position: relative; background-color: var(--mdb-icon-color, #ffffff); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; width: 100%; height: 100%; transition: background-color 0.4s ease; }" +
    ".mdb-color-multiply .mdb-dynamic-color-wrapper { filter: drop-shadow(0px 0px 3px rgba(0,0,0,0.6)); }" +
    ".mdb-color-multiply .mdb-dynamic-icon { mix-blend-mode: multiply; filter: none; opacity: 1; display: block; width: 100%; height: 100%; }" +
    ".mdb-color-invert .mdb-dynamic-color-wrapper { filter: drop-shadow(0px 0px 3px rgba(255,255,255,0.4)); }" +
    ".mdb-color-invert .mdb-dynamic-icon { mix-blend-mode: screen; filter: invert(1); opacity: 1; display: block; width: 100%; height: 100%; }" +
    "</style>";
  /*
  |==========================================================================
  | БАЗОВІ ФУНКЦІЇ ТА АПІ MDBLIST
  |==========================================================================
  */
  var RATING_CACHE_KEY = 'lmp_enh_rating_cache';

  var RCFG_DEFAULT = {
    ratings_mdblist_key: '',
    ratings_cache_days: '3',
    ratings_text_position: 'right',
    ratings_show_votes: true,
    ratings_logo_scale_val: 's_0', 
    ratings_text_scale_val: 's_0',
    ratings_spacing_val: 's_0',
    ratings_wide_logos: false,
    ratings_bw_logos: false,
    ratings_bg_opacity: 'v_0',
    ratings_colorize_all: true,
    ratings_rate_border: false,
    ratings_glow_border: false
  };

  var currentRatingsData = null;

  function getCardType(card) {
    var type = card.media_type || card.type;
    if (type === 'movie' || type === 'tv') return type;
    return card.name || card.original_name ? 'tv' : 'movie';
  }

  function iconImg(url, alt) {
    return '<img src="' + url + '" alt="' + (alt || '') + '">';
  }

  function getPrimaryRateLine(render){
    if (!render || !render.length) return $();
    var $nativeRate = render.find('.full-start__rate, .rate--imdb, .rate--tmdb, .rate--kp').first();
    if ($nativeRate.length && $nativeRate.parent().length) return $nativeRate.parent();

    var $left = $('.cardify__left .full-start-new__rate-line:not([data-lmp-fake]), .cardify__left .full-start__rate-line:not([data-lmp-fake])', render).first();
    if ($left.length) return $left;
    var $any = $('.full-start-new__rate-line:not([data-lmp-fake]), .full-start__rate-line:not([data-lmp-fake])', render).first();
    return $any;
  }

  function cleanupRtgInjected(render){
    if (!render || !render.length) return;
    var rateLine = getPrimaryRateLine(render);
    rateLine.find('.full-start__rate, .rate--imdb, .rate--tmdb, .rate--kp, .b-rating').not('.lmp-custom-rate').remove();
    rateLine.find('.lmp-custom-rate').remove(); 
  }

  function lmpToast(msg) {
    try {
      if (Lampa && typeof Lampa.Noty === 'function') return Lampa.Noty(msg);
      if (Lampa && Lampa.Noty && Lampa.Noty.show) return Lampa.Noty.show(msg);
    } catch (e) {}
  }

  function lmpRatingsClearCache() {
    Lampa.Storage.set(RATING_CACHE_KEY, {});
    lmpToast('Кеш рейтингів успішно очищено');
  }

  function fetchMdbListRatings(card, callback) {
    var rawKeys = LMP_ENH_CONFIG.apiKeys.mdblist;
    var keys = rawKeys.split(',').map(function(k) { return k.trim(); }).filter(Boolean);
    
    if (keys.length === 0) return callback(null);

    var currentKeyIndex = 0;

    function makeRequest() {
      var key = keys[currentKeyIndex];
      var typeSegment = (card.type === 'tv') ? 'show' : card.type;
      var url = 'https://api.mdblist.com/tmdb/' + typeSegment + '/' + card.id + '?apikey=' + encodeURIComponent(key);

      var network = new Lampa.Reguest();
      network.silent(url, function(response) {
        if (response) {
          handleSuccess(response);
        } else {
          tryNextKey();
        }
      }, function(error) {
        tryNextKey();
      });
    }

    function tryNextKey() {
      currentKeyIndex++;
      if (currentKeyIndex < keys.length) {
        makeRequest();
      } else {
        callback(null);
      }
    }

    function handleSuccess(response) {
      var res = {
        mdblist: null, imdb: null, tmdb: null, trakt: null,
        letterboxd: null, metacritic: null,
        rottentomatoes: null, popcorn: null, mal: null
      };

      var mdbScore = response.score;
      if (mdbScore) {
          var normMdb = parseFloat(mdbScore);
          if (normMdb > 10) normMdb = normMdb / 10;
          res.mdblist = {
              display: normMdb.toFixed(1),
              avg: normMdb,
              votes: response.score_votes || 0,
              fresh: normMdb >= 6.0
          };
      }

      if (!response.ratings || !response.ratings.length) {
          if (res.mdblist) return callback(res);
          return callback(null);
      }

      response.ratings.forEach(function(r) {
        var src = (r.source || '').toLowerCase();
        var valText = String(r.value || '').replace(/[^0-9.]/g, '');
        var val = parseFloat(valText);
        if (isNaN(val)) return;
        
        var normalized = val;
        
        if (src === 'letterboxd') {
            normalized = val * 2; 
        } else if (val > 10) {
            normalized = val / 10; 
        }

        normalized = Math.max(0, Math.min(10, normalized));
        var displayVal = normalized.toFixed(1);

        var item = { display: displayVal, avg: normalized, votes: r.votes || 0, fresh: normalized >= 6.0 };

        if (src === 'imdb') res.imdb = item;
        else if (src === 'tmdb') res.tmdb = item;
        else if (src === 'trakt') res.trakt = item;
        else if (src === 'letterboxd') res.letterboxd = item;
        else if (src.indexOf('metacritic') !== -1 && src.indexOf('user') === -1) res.metacritic = item;
        else if (src.indexOf('rotten') !== -1 || src.indexOf('tomato') !== -1) res.rottentomatoes = item;
        else if (src.indexOf('popcorn') !== -1 || src.indexOf('audience') !== -1) res.popcorn = item;
        else if (src.indexOf('myanimelist') !== -1 || src === 'mal') res.mal = item;
      });

      callback(res);
    }

    makeRequest();
  }

  function formatVotes(num) {
    if (!num) return '';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  }

  function insertRatings(data) {
    var render = Lampa.Activity.active().activity.render();
    if (!render) return;

    var rateLine = getPrimaryRateLine(render);
    if (!rateLine.length) return;
    
    rateLine.css({'flex-wrap': 'wrap', 'align-items': 'center'});
    cleanupRtgInjected(render);

    var cfg = getCfg();
    var elementsToInsert = [];

    var useWide = cfg.wideLogos;

    // Беремо стан нового перемикача рамок
    var useWideBorder = Lampa.Storage.get('ratings_wide_border', false);

    cfg.sourcesConfig.forEach(function(src) {
      if (!src.enabled || !data[src.id]) return;
      var itemData = data[src.id];

      var iconUrl;
      
      if (useWide) {
          if (useWideBorder) {
              // --- ОПЦІЯ: Широкі логотипи З РАМКОЮ ---
              // Якщо увімкнено рамки, беремо звичайний словник ICONS_WIDE і суфікс -wide.webp
              iconUrl = ICONS_WIDE[src.id] || (ICONS_WIDE_URL + src.id + '-wide.webp');
              if (src.id === 'rottentomatoes') {
                  iconUrl = itemData.fresh ? ICONS_WIDE.rotten_good : ICONS_WIDE.rotten_bad;
              } else if (src.id === 'popcorn') {
                  iconUrl = ICONS_WIDE.popcorn; 
              }
          } else {
              // --- БАЗА: Широкі логотипи БЕЗ РАМКИ ---
              // За замовчуванням беремо словник ICONS_WIDE_NB і суфікс -wide-nb.webp
              iconUrl = ICONS_WIDE_NB[src.id] || (ICONS_WIDE_URL + src.id + '-wide-nb.webp');
              if (src.id === 'rottentomatoes') {
                  iconUrl = itemData.fresh ? ICONS_WIDE_NB.rotten_good : ICONS_WIDE_NB.rotten_bad;
              } else if (src.id === 'popcorn') {
                  iconUrl = ICONS_WIDE_NB.popcorn; 
              }
          }
      } else {
          // --- ЛОГІКА ДЛЯ КВАДРАТНИХ ІКОНОК (без змін) ---
          iconUrl = (cfg.bwLogos && ICONS_BW[src.id]) ? ICONS_BW[src.id] : ICONS[src.id];
          if (src.id === 'rottentomatoes') {
              iconUrl = cfg.bwLogos ? (itemData.fresh ? ICONS_BW.rotten_good : ICONS_BW.rotten_bad) 
                                    : (itemData.fresh ? ICONS.rotten_good : ICONS.rotten_bad);
          } else if (src.id === 'popcorn' && itemData.avg < 6) {
              iconUrl = cfg.bwLogos ? ICONS_BW.popcorn_bad : ICONS.popcorn_bad;
          }
      }


      var colorClass = '';
      var glowClass = '';
      
      if (itemData.avg >= 7.5) { colorClass = 'lmp-color-green'; glowClass = 'lmp-glow-green'; }
      else if (itemData.avg >= 6.0) { colorClass = 'lmp-color-blue'; glowClass = 'lmp-glow-blue'; }
      else if (itemData.avg >= 4.0) { colorClass = 'lmp-color-orange'; glowClass = 'lmp-glow-orange'; }
      else { colorClass = 'lmp-color-red'; glowClass = 'lmp-glow-red'; }
      
      if (!cfg.colorizeAll) colorClass = '';
      
      var votesHtml = (cfg.showVotes && itemData.votes) ? '<span class="rate--votes">' + formatVotes(itemData.votes) + '</span>' : '';
      
      var dirClass = '';
      if (cfg.textPosition === 'left') dirClass = 'lmp-dir-right';
      else if (cfg.textPosition === 'top') dirClass = 'lmp-dir-top';
      else if (cfg.textPosition === 'bottom') dirClass = 'lmp-dir-bottom';
      else dirClass = 'lmp-dir-left';

      var cont = $(
        '<div class="lmp-custom-rate lmp-rate-' + src.id + ' ' + dirClass + ' ' + glowClass + '">' +
            '<div class="source--name" title="' + src.name + '">' + 
                '<img src="' + iconUrl + '" alt="' + src.name + '">' + 
            '</div>' +
            '<div class="rate--text-block">' + 
                '<span class="rate--value ' + colorClass + '">' + itemData.display + '</span>' + 
                votesHtml + 
            '</div>' +
        '</div>'
      );
      
      elementsToInsert.push(cont);
    });

    if (elementsToInsert.length > 0) {
        rateLine.prepend(elementsToInsert);
    }
  }


  function fetchAdditionalRatings(card) {
    var render = Lampa.Activity.active().activity.render();
    if (!render) return;

    var cfg = getCfg();
    refreshConfigFromStorage();
    
    var normalizedCard = { id: card.id, type: getCardType(card) };
    var cacheKey = normalizedCard.type + '_' + normalizedCard.id;
    var cacheTimeMs = cfg.cacheDays * 24 * 60 * 60 * 1000;
    
    var cache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
    var cachedItem = cache[cacheKey];
    
    if (cachedItem && (Date.now() - cachedItem.timestamp < cacheTimeMs) && cachedItem.data) {
      currentRatingsData = cachedItem.data;
      insertRatings(currentRatingsData);
      applyStylesToAll();
      $('#lmp-search-loader', render).remove();
      triggerDynamicColors(card);
      return;
    }

    var rateLine = getPrimaryRateLine(render);
    if (rateLine.length && !$('#lmp-search-loader', render).length) {
      rateLine.css({'flex-wrap': 'wrap', 'align-items': 'center'});
      rateLine.prepend('<div id="lmp-search-loader" class="loading-dots-container"><div class="loading-dots__text">MDBList...</div><div class="loading-dots__dot"></div><div class="loading-dots__dot"></div></div>');
    }

    fetchMdbListRatings(normalizedCard, function(res) {
      $('#lmp-search-loader', render).remove();

      if (res) {
        currentRatingsData = res;
        cache[cacheKey] = { timestamp: Date.now(), data: res };
        Lampa.Storage.set(RATING_CACHE_KEY, cache);
        
        if (res.imdb && res.imdb.display) {
            try {
                var omdbKey = 'omdb_ratings_cache';
                var omdbCache = JSON.parse(localStorage.getItem(omdbKey) || '{}');
                var ttlDays = parseInt(Lampa.Storage.get('omdb_cache_days', '7')) || 7;
                omdbCache[cacheKey] = {
                    rating: res.imdb.display,
                    timestamp: Date.now() + (ttlDays * 24 * 60 * 60 * 1000)
                };
                localStorage.setItem(omdbKey, JSON.stringify(omdbCache));
            } catch (e) {}
        }
        
        insertRatings(currentRatingsData);
        applyStylesToAll();
        triggerDynamicColors(card);
      }
    });
  }
  /*
  |==========================================================================
  | ЧАСТИНА 3: OMDb / TMDb ЛОГІКА (РЕАКТИВНИЙ СКАНЕР ПОСТЕРІВ)
  |==========================================================================
  */
  var OMDB_CACHE_KEY = 'omdb_ratings_cache';
  var ICON_IMDB_CARD = 'https://img.icons8.com/color/48/000000/imdb.png';
  var retryStates = {}; 

  function getOmdbCache() {
      var cache = localStorage.getItem(OMDB_CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
  }

  function saveOmdbCache(id, rating) {
      var cache = getOmdbCache();
      var ttlDays = parseInt(Lampa.Storage.get('omdb_cache_days', '7'));
      if (isNaN(ttlDays) || ttlDays <= 0) ttlDays = 7; 
      
      cache[id] = {
          rating: rating,
          timestamp: Date.now() + (ttlDays * 24 * 60 * 60 * 1000)
      };
      localStorage.setItem(OMDB_CACHE_KEY, JSON.stringify(cache));
  }

  function getCachedOmdbRating(id) {
      var cache = getOmdbCache();
      if (cache[id]) {
          if (Date.now() < cache[id].timestamp) {
              return cache[id].rating;
          } else {
              delete cache[id];
              localStorage.setItem(OMDB_CACHE_KEY, JSON.stringify(cache));
          }
      }
      return null;
  }

  // Прибрали _1, щоб автоматично підхопився твій збережений ключ
  function getOmdbApiKey() {
      return (Lampa.Storage.get('omdb_api_key') || '').trim();
  }

  function getTmdbUrl(type, id) {
      var base = 'https://api.themoviedb.org/3/' + type + '/' + id + '/external_ids';
      var tmdbKey = Lampa.Storage ? Lampa.Storage.get('tmdb_api_key', '') : '';
      if (!tmdbKey || tmdbKey.trim() === '' || tmdbKey.trim() === 'c87a543116135a4120443155bf680876') {
          tmdbKey = '4ef0d7355d9ffb5151e987764708ce96';
      }
      return base + '?api_key=' + tmdbKey;
  }

  var omdbRequestQueue = [];
  var isOmdbRequesting = false;

  function setRetryState(ratingKey) {
      var state = retryStates[ratingKey] || { step: 0 };
      if (state.step === 0) {
          retryStates[ratingKey] = { step: 1, time: Date.now() + 60 * 1000 };
      } else if (state.step === 1) {
          retryStates[ratingKey] = { step: 2, time: Date.now() + 60 * 60 * 1000 };
      } else {
          saveOmdbCache(ratingKey, "N/A");
          delete retryStates[ratingKey];
      }
  }

  function processOmdbQueue() {
      if (isOmdbRequesting || omdbRequestQueue.length === 0) return;
      isOmdbRequesting = true;

      if (omdbRequestQueue.length > 20) {
          omdbRequestQueue = omdbRequestQueue.slice(-20);
      }

      var task = omdbRequestQueue.shift();
      var data = task.movie;
      var type = data.media_type || data.type || (data.name || data.original_name || data.seasons || data.first_air_date ? 'tv' : 'movie');
      var id = task.id;

      if (getCachedOmdbRating(task.ratingKey)) {
          isOmdbRequesting = false; processOmdbQueue(); return;
      }

      var tmdbReq = new Lampa.Reguest();
      tmdbReq.silent(getTmdbUrl(type, id), function (tmdbData) {
          try {
              var parsedTmdb = typeof tmdbData === 'string' ? JSON.parse(tmdbData) : tmdbData;
              var imdbId = parsedTmdb ? parsedTmdb.imdb_id : null;
              
              if (imdbId) {
                  var apiKey = getOmdbApiKey();
                  if (!apiKey) { isOmdbRequesting = false; setTimeout(processOmdbQueue, 100); return; }

                  var omdbUrl = 'https://www.omdbapi.com/?i=' + imdbId + '&apikey=' + apiKey;
                  var omdbReq = new Lampa.Reguest();

                  omdbReq.silent(omdbUrl, function (omdbData) {
                      try {
                          var res = typeof omdbData === 'string' ? JSON.parse(omdbData) : omdbData;
                          delete retryStates[task.ratingKey];
                          if (res.Response === "True" && res.imdbRating && res.imdbRating !== "N/A") {
                              saveOmdbCache(task.ratingKey, res.imdbRating);
                          } else if (res.Response === "False" && res.Error && res.Error.indexOf("limit") > -1) {
                              setRetryState(task.ratingKey);
                          } else { saveOmdbCache(task.ratingKey, "N/A"); }
                      } catch (e) { setRetryState(task.ratingKey); }
                      isOmdbRequesting = false; setTimeout(processOmdbQueue, 300);
                  }, function () {
                      setRetryState(task.ratingKey); isOmdbRequesting = false; setTimeout(processOmdbQueue, 300);
                  });
              } else { saveOmdbCache(task.ratingKey, "N/A"); isOmdbRequesting = false; setTimeout(processOmdbQueue, 100); }
          } catch (e) { setRetryState(task.ratingKey); isOmdbRequesting = false; setTimeout(processOmdbQueue, 300); }
      }, function () { setRetryState(task.ratingKey); isOmdbRequesting = false; setTimeout(processOmdbQueue, 300); });
  }

  function pollOmdbCards() {
      var isEnabled = Lampa.Storage.get('omdb_status', true);
      if (!isEnabled) {
          if (document.body.classList.contains('omdb-plugin-active')) {
              document.body.classList.remove('omdb-plugin-active');
              document.querySelectorAll('.omdb-custom-rate').forEach(function(el) { el.remove(); });
          }
          setTimeout(pollOmdbCards, 1000); return;
      }

      if (!document.body.classList.contains('omdb-plugin-active')) {
          document.body.classList.add('omdb-plugin-active');
      }

      var glowSetting = Lampa.Storage.get('omdb_poster_glow', false);
      if (glowSetting && !document.body.classList.contains('omdb-enh--glow')) {
          document.body.classList.add('omdb-enh--glow');
      } else if (!glowSetting && document.body.classList.contains('omdb-enh--glow')) {
          document.body.classList.remove('omdb-enh--glow');
      }

      var source = Lampa.Storage.get('omdb_poster_source', 'imdb');
      var sizeSetting = parseInt(Lampa.Storage.get('omdb_poster_size', '0'));
      if (isNaN(sizeSetting)) sizeSetting = 0;
      var scaleEm = 0.9 + (sizeSetting * 0.1); 

      function applyOmdbGlowClass(el, valStr) {
          el.classList.remove('omdb-glow-green', 'omdb-glow-blue', 'omdb-glow-orange', 'omdb-glow-red');
          var v = parseFloat(valStr);
          if (!isNaN(v)) {
              if (v >= 7.5) el.classList.add('omdb-glow-green');
              else if (v >= 6.0) el.classList.add('omdb-glow-blue');
              else if (v >= 4.0) el.classList.add('omdb-glow-orange');
              else el.classList.add('omdb-glow-red');
          }
      }

      document.querySelectorAll('.card').forEach(function (card) {
          var data = card.card_data || card.dataset || {};
          var rawId = data.id || card.getAttribute('data-id') || (card.getAttribute('data-card-id') || '0').replace('movie_', '');
          if (!rawId || rawId === '0') return;

          var id = rawId.toString();
          var type = data.media_type || data.type || (data.name || data.original_name || data.seasons || data.first_air_date ? 'tv' : 'movie');
          var ratingKey = type + '_' + id;

          var customRateEl = card.querySelector('.omdb-custom-rate');

          if (!customRateEl || customRateEl.dataset.omdbId !== ratingKey) {
              if (customRateEl) customRateEl.remove();
              customRateEl = document.createElement('div');
              customRateEl.className = 'omdb-custom-rate';
              customRateEl.dataset.omdbId = ratingKey;
              customRateEl.style.display = 'none'; 
              var parent = card.querySelector('.card__view') || card;
              parent.appendChild(customRateEl);
          }

          if (source === 'none') {
              customRateEl.style.display = 'none';
              return; 
          }

          customRateEl.style.fontSize = scaleEm + 'em';

          if (source === 'tmdb') {
              var va = parseFloat(data.vote_average || 0);
              if (va > 0) {
                  var displayVa = va.toFixed(1);
                  if (customRateEl.style.display === 'none' || customRateEl.dataset.val !== displayVa || customRateEl.dataset.src !== 'tmdb') {
                      customRateEl.dataset.val = displayVa;
                      customRateEl.dataset.src = 'tmdb';
                      customRateEl.style.display = 'flex';
                      customRateEl.innerHTML = '<span>' + displayVa + '</span><img src="' + ICONS.tmdb_poster + '">';
                      applyOmdbGlowClass(customRateEl, displayVa);
                  }
              } else {
                  customRateEl.style.display = 'none';
              }
          } else if (source === 'imdb') {
              var cachedRating = getCachedOmdbRating(ratingKey);

              if (cachedRating && cachedRating !== "N/A") {
                  if (customRateEl.style.display === 'none' || customRateEl.dataset.val !== cachedRating || customRateEl.dataset.src !== 'imdb') {
                      customRateEl.dataset.val = cachedRating;
                      customRateEl.dataset.src = 'imdb';
                      customRateEl.style.display = 'flex';
                      customRateEl.innerHTML = '<span>' + cachedRating + '</span><img src="' + ICON_IMDB_CARD + '">';
                      applyOmdbGlowClass(customRateEl, cachedRating);
                  }
              } else if (!cachedRating) {
                  customRateEl.style.display = 'none';
                  if (!retryStates[ratingKey] || Date.now() > retryStates[ratingKey].time) {
                      var inQueue = omdbRequestQueue.some(function(t) { return t.ratingKey === ratingKey; });
                      if (!inQueue) {
                          omdbRequestQueue.push({ movie: data, id: id, cardElem: card, ratingKey: ratingKey });
                          processOmdbQueue();
                      }
                  }
              } else {
                  customRateEl.style.display = 'none';
              }
          }
      });
      setTimeout(pollOmdbCards, 500);
  }

  /*
  |==========================================================================
  | ЧАСТИНА 4: НАЛАШТУВАННЯ ТА ІНІЦІАЛІЗАЦІЯ
  |==========================================================================
  */
  var DEFAULT_SOURCES_ORDER = [
    { id: 'mdblist', name: 'MDBList', enabled: true },
    { id: 'imdb', name: 'IMDb', enabled: true },
    { id: 'tmdb', name: 'TMDB', enabled: true },
    { id: 'trakt', name: 'Trakt', enabled: true },
    { id: 'letterboxd', name: 'Letterboxd', enabled: true },
    { id: 'rottentomatoes', name: 'Rotten Tomatoes', enabled: true },
    { id: 'popcorn', name: 'Popcornmeter', enabled: true },
    { id: 'metacritic', name: 'Metacritic', enabled: true },
    { id: 'mal', name: 'MyAnimeList', enabled: true }
  ];

  function getCfg() {
    var parseIntDef = function(key, def) { var v = parseInt(Lampa.Storage.get(key, def), 10); return isNaN(v) ? def : v; };
    var parseFloatDef = function(key, def) { var v = parseFloat(Lampa.Storage.get(key, def)); return isNaN(v) ? def : v; };
    
    var savedConfig = Lampa.Storage.get('ratings_sources_config', null);
    if (savedConfig && Array.isArray(savedConfig)) {
      savedConfig.forEach(function(s) {
        if (s.id === 'rt') s.id = 'rottentomatoes';
        if (s.id === 'mc') s.id = 'metacritic';
      });
      if (!savedConfig.find(function(s) { return s.id === 'mdblist'; })) savedConfig.push({ id: 'mdblist', name: 'MDBList', enabled: true });
      if (!savedConfig.find(function(s) { return s.id === 'mal'; })) savedConfig.push({ id: 'mal', name: 'MyAnimeList', enabled: true });
    } else {
      savedConfig = DEFAULT_SOURCES_ORDER;
    }

    var fullSourcesConfig = savedConfig.map(function(s) { return { id: s.id, name: s.name, enabled: s.enabled }; });
    var scaleMap = { 's_m3': -3, 's_m2': -2, 's_m1': -1, 's_0': 0, 's_p1': 1, 's_p2': 2, 's_p3': 3, 's_p4': 4 };
    
    var logoRaw = Lampa.Storage.get('ratings_logo_scale_val', 's_0');
    var textRaw = Lampa.Storage.get('ratings_text_scale_val', 's_0');
    var spaceRaw = Lampa.Storage.get('ratings_spacing_val', 's_0');
    
    var logoInput = scaleMap[logoRaw] !== undefined ? scaleMap[logoRaw] : (parseInt(logoRaw) || 0);
    var textInput = scaleMap[textRaw] !== undefined ? scaleMap[textRaw] : (parseInt(textRaw) || 0);
    var spaceInput = scaleMap[spaceRaw] !== undefined ? scaleMap[spaceRaw] : (parseInt(spaceRaw) || 0);

    var rawBgOpacity = String(Lampa.Storage.get('ratings_bg_opacity', 'v_0')).replace('v_', '');

    return {
      mdblistKey: Lampa.Storage.get('ratings_mdblist_key', ''),
      cacheDays: parseIntDef('ratings_cache_days', 3),
      textPosition: Lampa.Storage.get('ratings_text_position', 'right'),
      logoOffset: (logoInput * 2) + 'px',
      textOffset: (textInput * 2) + 'px',
      rateSpacing: ((spaceInput * 4) - 6) + 'px', 
      showVotes: !!Lampa.Storage.field('ratings_show_votes', true),
      wideLogos: !!Lampa.Storage.field('ratings_wide_logos', false),
      bwLogos: !!Lampa.Storage.field('ratings_bw_logos', false),
      bgOpacity: rawBgOpacity,
      colorizeAll: !!Lampa.Storage.field('ratings_colorize_all', true),
      rateBorder: !!Lampa.Storage.field('ratings_rate_border', false),
      glowBorder: !!Lampa.Storage.field('ratings_glow_border', false),
      sourcesConfig: fullSourcesConfig
    };
  }

  function refreshConfigFromStorage() {
    var cfg = getCfg();
    LMP_ENH_CONFIG.apiKeys.mdblist = cfg.mdblistKey || '';
    cfg.bwLogos ? document.body.classList.add('lmp-enh--mono') : document.body.classList.remove('lmp-enh--mono');
    return cfg;
  }

  function applyStylesToAll() {
    var cfg = getCfg();
    var s = document.documentElement.style;
    s.setProperty('--lmp-logo-offset', cfg.logoOffset);
    s.setProperty('--lmp-text-offset', cfg.textOffset);
    s.setProperty('--lmp-rate-spacing', cfg.rateSpacing);
    s.setProperty('--lmp-bg-opacity', cfg.bgOpacity);
    
    cfg.bwLogos ? document.body.classList.add('lmp-enh--mono') : document.body.classList.remove('lmp-enh--mono');
    cfg.rateBorder ? document.body.classList.add('lmp-enh--rate-border') : document.body.classList.remove('lmp-enh--rate-border');
    cfg.glowBorder ? document.body.classList.add('lmp-enh--glow') : document.body.classList.remove('lmp-enh--glow');
  }

  function openSourcesEditor() {
    var cfg = getCfg();
    var currentOrder = JSON.parse(JSON.stringify(cfg.sourcesConfig));
    var listContainer = $('<div class="menu-edit-list" style="padding-bottom:10px;"></div>');
    var svgUp = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
    var svgDown = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
    var svgCheck = '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/><path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" stroke-linecap="round"/></svg>';

    function updateArrowsState() {
      var items = listContainer.find('.source-item');
      items.each(function(idx) {
        $(this).find('.move-up').css('opacity', idx === 0 ? '0.2' : '1');
        $(this).find('.move-down').css('opacity', idx === items.length - 1 ? '0.2' : '1');
      });
    }

    currentOrder.forEach(function(src) {
      var itemSort = $('<div class="source-item" data-id="' + src.id + '" style="display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid rgba(255,255,255,0.1);">' +
          '<div class="source-name" style="font-size:16px; opacity: ' + (src.enabled ? '1' : '0.4') + ';">' + src.name + '</div>' +
          '<div style="display:flex; gap:10px; align-items:center;">' +
            '<div class="move-up selector" style="padding:6px 12px; border-radius:6px;">' + svgUp + '</div>' +
            '<div class="move-down selector" style="padding:6px 12px; border-radius:6px;">' + svgDown + '</div>' +
            '<div class="toggle selector" style="padding:4px; border-radius:6px; margin-left:8px;">' + svgCheck + '</div>' +
          '</div></div>');
      itemSort.find('.dot').attr('opacity', src.enabled ? 1 : 0);
      itemSort.find('.move-up').on('hover:enter', function() { var p = itemSort.prev(); if(p.length){ itemSort.insertBefore(p); updateArrowsState(); }});
      itemSort.find('.move-down').on('hover:enter', function() { var n = itemSort.next(); if(n.length){ itemSort.insertAfter(n); updateArrowsState(); }});
      itemSort.find('.toggle').on('hover:enter', function() { src.enabled = !src.enabled; itemSort.find('.source-name').css('opacity', src.enabled ? '1' : '0.4'); itemSort.find('.dot').attr('opacity', src.enabled ? 1 : 0); });
      listContainer.append(itemSort);
    });
    updateArrowsState();

    Lampa.Modal.open({ title: 'Сортування та видимість', html: listContainer, size: 'small', scroll_to_center: true, onBack: function() {
        var finalOrder = [];
        listContainer.find('.source-item').each(function() {
          var id = $(this).attr('data-id');
          var s = currentOrder.find(function(x) { return x.id === id; });
          if (s) finalOrder.push({ id: s.id, name: s.name, enabled: s.enabled });
        });
        Lampa.Storage.set('ratings_sources_config', finalOrder);
        Lampa.Modal.close(); Lampa.Controller.toggle('settings_component');
        setTimeout(function() { if (currentRatingsData) { insertRatings(currentRatingsData); applyStylesToAll(); } }, 150);
      }
    });
  }

  function addSettingsSection() {
    if (window.mdb_ratings_add_param_ready) return;
    window.mdb_ratings_add_param_ready = true;
    $('body').append('<style>div[data-component="omdb_ratings"] { display: none !important; }</style>');

    Lampa.SettingsApi.addComponent({ component: 'mdb_ratings', name: 'Рейтинги', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l3.09 6.26L22 10.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 15.14l-5-4.87 6.91-1.01L12 3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>' });
    
    Lampa.SettingsApi.addParam({ 
        component: 'mdb_ratings', 
        param: { name: 'lmp_poster_submenu_btn', type: 'static' }, 
        field: { name: 'Рейтинг на постері', description: 'Відображення рейтингів у каталозі' }, 
        onRender: function(item) { 
            item.on('hover:enter click', function() { 
                Lampa.Settings.create('omdb_ratings'); 
                Lampa.Controller.enabled().controller.back = function() { 
                    Lampa.Settings.create('mdb_ratings'); 
                };
            }); 
        } 
    });

    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_mdblist_key', type: 'input', values: '', "default": '' }, field: { name: 'MDBList API key', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { type: 'button', name: 'lmp_edit_sources_btn' }, field: { name: 'Налаштувати джерела', description: 'Зміна порядку та видимості рейтингів' }, onChange: function() { openSourcesEditor(); } });

    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_text_position', type: 'select', values: { 'left': 'Зліва', 'right': 'Справа', 'top': 'Зверху', 'bottom': 'Знизу' }, "default": 'right' }, field: { name: 'Розташування оцінки', description: 'Розміщення оцінки відносно логотипу' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_show_votes', type: 'trigger', values: '', "default": true }, field: { name: 'Кількість голосів', description: 'Показувати кількість тих, хто поставив оцінку' } });

    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_logo_scale_val', type: 'select', values: { 's_m3': '-3', 's_m2': '-2', 's_m1': '-1', 's_0': '0', 's_p1': '1', 's_p2': '2', 's_p3': '3' }, "default": 's_0' }, field: { name: 'Розмір логотипів', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_text_scale_val', type: 'select', values: { 's_m2': '-2', 's_m1': '-1', 's_0': '0', 's_p1': '1', 's_p2': '2' }, "default": 's_0' }, field: { name: 'Розмір оцінки', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_spacing_val', type: 'select', values: { 's_m2': '-2', 's_m1': '-1', 's_0': '0', 's_p1': '1', 's_p2': '2' }, "default": 's_0' }, field: { name: 'Відступи між рейтингами', description: '' } });
    
    Lampa.SettingsApi.addParam({ 
        component: 'mdb_ratings', 
        param: { name: 'ratings_wide_logos', type: 'trigger', values: '', "default": false }, 
        field: { name: 'Широкі логотипи', description: '' },
        onChange: function(val) {
            if (val) {
                Lampa.Storage.set('ratings_bw_logos', false);
                Lampa.Storage.set('ratings_rate_border', false);
                Lampa.Storage.set('ratings_glow_border', false);
                $('.settings-param:contains("Білі логотипи")').find('.toggle').removeClass('active');
                $('.settings-param:contains("Рамка плиток рейтингів")').find('.toggle').removeClass('active');
                $('.settings-param:contains("Кольорове світіння рамки")').find('.toggle').removeClass('active');
            } else {
                // Якщо вимкнули Широкі логотипи, примусово вимикаємо і рамки
                Lampa.Storage.set('ratings_wide_border', false);
                $('.settings-param:contains("Рамки широких логотипів")').find('.toggle').removeClass('active');
            }
            updateMutualExclusions();
        }
    });

    Lampa.SettingsApi.addParam({ 
        component: 'mdb_ratings', 
        param: { name: 'ratings_wide_border', type: 'trigger', values: '', "default": false }, 
        field: { name: 'Рамки широких логотипів', description: '' },
        onChange: function() {
            updateMutualExclusions();
        }
    });


    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_bw_logos', type: 'trigger', values: '', "default": false }, field: { name: 'Білі логотипи', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_dynamic_colors', type: 'trigger', values: '', "default": false }, field: { name: 'Динамічний колір іконок', description: 'Перефарбовує іконки у домінантний колір логотипу. Працює з увімкненими білими та широкими іконками' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_colorize_all', type: 'trigger', values: '', "default": true }, field: { name: 'Кольорові оцінки рейтингів', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_bg_opacity', type: 'select', values: { 'v_0': '0%', 'v_0.1': '10%', 'v_0.2': '20%', 'v_0.3': '30%', 'v_0.4': '40%', 'v_0.5': '50%', 'v_0.6': '60%', 'v_0.8': '80%', 'v_1': '100%' }, "default": 'v_0' }, field: { name: 'Темний фон плитки', description: '' } });
    
    Lampa.SettingsApi.addParam({ 
        component: 'mdb_ratings', 
        param: { name: 'ratings_rate_border', type: 'trigger', values: '', "default": false }, 
        field: { name: 'Рамка плиток рейтингів', description: '' },
        onChange: function(val) {
            if (!val) {
                Lampa.Storage.set('ratings_glow_border', false);
                $('.settings-param:contains("Кольорове світіння рамки")').find('.toggle').removeClass('active');
                document.body.classList.remove('lmp-enh--glow');
                document.body.classList.remove('lmp-enh--rate-border');
            } else {
                document.body.classList.add('lmp-enh--rate-border');
            }
            updateMutualExclusions();
        }
    });
    
    Lampa.SettingsApi.addParam({ 
        component: 'mdb_ratings', 
        param: { name: 'ratings_glow_border', type: 'trigger', values: '', "default": false }, 
        field: { name: 'Кольорове світіння рамки', description: '' },
        onChange: function(val) {
            if (val && !Lampa.Storage.get('ratings_rate_border', false)) {
                Lampa.Storage.set('ratings_glow_border', false);
                setTimeout(function() {
                    $('.settings-param:contains("Кольорове світіння рамки")').find('.toggle').removeClass('active');
                }, 50);
            }
        }
    });

    function updateMutualExclusions() {
        var isWide = Lampa.Storage.get('ratings_wide_logos', false);
        var isBorder = Lampa.Storage.get('ratings_rate_border', false);
        
        var $bwItem = $('.settings-param:contains("Білі логотипи")');
        var $borderItem = $('.settings-param:contains("Рамка плиток рейтингів")');
        var $glowItem = $('.settings-param:contains("Кольорове світіння рамки")');
        // Шукаємо наш новий пункт
        var $wideBorderItem = $('.settings-param:contains("Рамки широких логотипів")');

        if (isWide) {
            $bwItem.css({ opacity: 0.5, 'pointer-events': 'none' });
            $borderItem.css({ opacity: 0.5, 'pointer-events': 'none' });
            $glowItem.css({ opacity: 0.5, 'pointer-events': 'none' });
            
            // Робимо активним перемикач рамок для широких лого
            $wideBorderItem.css({ opacity: 1, 'pointer-events': 'auto' });
        } else {
            $bwItem.css({ opacity: 1, 'pointer-events': 'auto' });
            $borderItem.css({ opacity: 1, 'pointer-events': 'auto' });
            
            // Блокуємо перемикач рамок, бо широкі лого вимкнені
            $wideBorderItem.css({ opacity: 0.5, 'pointer-events': 'none' });

            if (isBorder) {
                $glowItem.css({ opacity: 1, 'pointer-events': 'auto' });
            } else {
                $glowItem.css({ opacity: 0.5, 'pointer-events': 'none' });
            }
        }
    }

    
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_cache_days', type: 'input', values: '', "default": '3' }, field: { name: 'Термін зберігання кешу (MDBList)', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { type: 'button', name: 'lmp_clear_cache_btn' }, field: { name: 'Очистити весь кеш рейтингів', description: '' }, onChange: function() { lmpRatingsClearCache(); } });

    Lampa.SettingsApi.addComponent({ component: 'omdb_ratings', name: 'Рейтинг на постері', icon: '' });
    Lampa.SettingsApi.addParam({ component: 'omdb_ratings', param: { name: 'omdb_api_key', type: 'input', values: '', "default": '' }, field: { name: 'OMDb API key', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'omdb_ratings', param: { name: 'omdb_status', type: 'trigger', values: '', "default": true }, field: { name: 'Рейтинг на постері', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'omdb_ratings', param: { name: 'omdb_poster_source', type: 'select', values: { 'imdb': 'IMDb', 'tmdb': 'TMDb', 'none': 'Без рейтингу' }, "default": 'imdb' }, field: { name: 'Джерело рейтингу', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'omdb_ratings', param: { name: 'omdb_poster_size', type: 'select', values: { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4' }, "default": '0' }, field: { name: 'Розмір рейтингу', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'omdb_ratings', param: { name: 'omdb_poster_glow', type: 'trigger', values: '', "default": false }, field: { name: 'Кольорове світіння', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'omdb_ratings', param: { name: 'omdb_cache_days', type: 'input', values: '', "default": '7' }, field: { name: 'Термін зберігання кешу (OMDb)', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'omdb_ratings', param: { type: 'button', name: 'omdb_clear_cache_btn' }, field: { name: 'Очистити кеш постерів', description: '' }, onChange: function() { localStorage.removeItem('omdb_ratings_cache'); } });

    Lampa.Listener.follow('settings', function(e) {
        if (e.name === 'main') {
            // МИТТЄВЕ ПЕРЕМІЩЕННЯ ПУНКТУ МЕНЮ
            var move = function() {
                var i = $('.settings-folder div[data-component="interface"]');
                var r = $('.settings-folder div[data-component="mdb_ratings"]');
                if (i.length && r.length) r.insertAfter(i);
            };
            move(); // Запускаємо відразу
            setTimeout(move, 10); // Страховка
        }
        if (e.type === 'create' && e.name === 'mdb_ratings') {
            updateMutualExclusions(); // Миттєве оновлення сірих пунктів
            setTimeout(updateMutualExclusions, 50); // Страховка
        }
    });
  }

  function initRatingsPluginUI() {
    addSettingsSection();
    var _set = Lampa.Storage.set;
    Lampa.Storage.set = function(k, v) {
      var out = _set.apply(this, arguments);
      if (typeof k === 'string' && k.indexOf('ratings_') === 0 && k !== 'ratings_sources_config') {
        setTimeout(function(){ if(currentRatingsData) insertRatings(currentRatingsData); applyStylesToAll(); }, 150);
      }
      return out;
    };
    applyStylesToAll();
  }

  function cleanOldCache() {
    var tenDaysMs = 10 * 24 * 60 * 60 * 1000;
    var now = Date.now();

    try {
      var mdbCache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
      var mdbChanged = false;
      for (var key in mdbCache) {
        if (mdbCache.hasOwnProperty(key)) {
          if (now - mdbCache[key].timestamp > tenDaysMs) {
            delete mdbCache[key];
            mdbChanged = true;
          }
        }
      }
      if (mdbChanged) Lampa.Storage.set(RATING_CACHE_KEY, mdbCache);
    } catch (e) {}

    try {
      var omdbCacheStr = localStorage.getItem('omdb_ratings_cache');
      if (omdbCacheStr) {
        var omdbCache = JSON.parse(omdbCacheStr);
        var omdbChanged = false;
        for (var oKey in omdbCache) {
          if (omdbCache.hasOwnProperty(oKey)) {
            if (now - omdbCache[oKey].timestamp > tenDaysMs) {
              delete omdbCache[oKey];
              omdbChanged = true;
            }
          }
        }
        if (omdbChanged) localStorage.setItem('omdb_ratings_cache', JSON.stringify(omdbCache));
      }
    } catch (e) {}
  }

/* Очищення кешу кольорів логотипів */
function cleanLogoColorCache() {
    try {
        var cacheKey = 'mdb_logo_colors_cache';
        var cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
        var now = Date.now();
        var changed = false;
        var tenDaysMs = 10 * 24 * 60 * 60 * 1000;

        for (var key in cache) {
            if (now - cache[key].timestamp > tenDaysMs) {
                delete cache[key];
                changed = true;
            }
        }
        if (changed) localStorage.setItem(cacheKey, JSON.stringify(cache));
    } catch (e) {}
}

/* Синхронне отримання кольору з кешу */
function getCachedLogoColor(card) {
    var type = card.name ? 'tv' : 'movie';
    var id = card.id;
    var cacheKey = type + '_' + id;
    var storageKey = 'mdb_logo_colors_cache';
    try {
        var cache = JSON.parse(localStorage.getItem(storageKey) || '{}');
        if (cache[cacheKey] && cache[cacheKey].timestamp > Date.now()) {
            return cache[cacheKey].data;
        }
    } catch (e) {}
    return null;
}

/* Отримання домінантного кольору логотипу з кластеризацією */
function fetchLogoColor(card, apiKey) {
    return new Promise(function(resolve) {
        var type = card.name ? 'tv' : 'movie';
        var id = card.id;
        var cacheKey = type + '_' + id;
        var storageKey = 'mdb_logo_colors_cache';

        var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/images?api_key=' + apiKey;
        
        fetch(url).then(function(res) { 
            return res.json(); 
        }).then(function(data) {
            if (!data.logos || data.logos.length === 0) return resolve(null);

            var logo = data.logos.find(function(l) { return l.iso_639_1 === 'uk'; });
            if (!logo) logo = data.logos.find(function(l) { return l.iso_639_1 === 'en'; });
            if (!logo) return resolve(null);

            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                var imgData;
                try {
                    imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                } catch (e) {
                    return resolve(null);
                }

                var buckets = {};
                var totalPixels = 0;
                var wCount = 0, wR = 0, wG = 0, wB = 0;
                var bCount = 0, bR = 0, bG = 0, bB = 0;

                // КРОК 1: Сортуємо пікселі по "кошиках"
                for (var i = 0; i < imgData.length; i += 16) {
                    var a = imgData[i + 3];
                    if (a < 50) continue; // Пропускаємо прозоре

                    var r = imgData[i];
                    var g = imgData[i + 1];
                    var b = imgData[i + 2];
                    totalPixels++;

                    var isWhite = r > 240 && g > 240 && b > 240;
                    var isBlack = r < 25 && g < 25 && b < 25;

                    if (isWhite) {
                        wCount++; wR += r; wG += g; wB += b;
                    } else if (isBlack) {
                        bCount++; bR += r; bG += g; bB += b;
                    } else {
                        // Для градієнтів: групуємо схожі відтінки (з кроком 32 одиниці)
                        var step = 32;
                        var key = Math.floor(r / step) + ',' + Math.floor(g / step) + ',' + Math.floor(b / step);
                        
                        if (!buckets[key]) buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
                        buckets[key].count++;
                        buckets[key].r += r;
                        buckets[key].g += g;
                        buckets[key].b += b;
                    }
                }

                if (totalPixels === 0) return resolve(null);

                // КРОК 2: Застосовуємо твої правила (<10% та >50%)
                var validBuckets = [];
                
                // Перевіряємо кольори: беремо тільки ті, яких більше 10%
                for (var k in buckets) {
                    if ((buckets[k].count / totalPixels) * 100 >= 10) {
                        validBuckets.push(buckets[k]);
                    }
                }

                // Перевіряємо білий та чорний: беремо ТІЛЬКИ якщо їх від 10% до 35%
                var wPercent = (wCount / totalPixels) * 100;
                var bPercent = (bCount / totalPixels) * 100;

                if (wPercent >= 10 && wPercent <= 35) validBuckets.push({ count: wCount, r: wR, g: wG, b: wB });
                if (bPercent >= 10 && bPercent <= 35) validBuckets.push({ count: bCount, r: bR, g: bG, b: bB });

                // КРОК 3: Запасний план для екстремальних градієнтів ("веселки")
                // Якщо після чистки всі кошики зникли, беремо той колір, якого було найбільше, ігноруючи правило 10%
                if (validBuckets.length === 0) {
                    var maxBkt = null;
                    for (var key in buckets) {
                        if (!maxBkt || buckets[key].count > maxBkt.count) maxBkt = buckets[key];
                    }
                    if (maxBkt) validBuckets.push(maxBkt);
                    else if (wCount > bCount) validBuckets.push({ count: wCount, r: wR, g: wG, b: wB });
                    else validBuckets.push({ count: bCount, r: bR, g: bG, b: bB });
                }

                // КРОК 4: Вибираємо переможця (найбільший кошик з тих, що вижили)
                validBuckets.sort(function(a, b) { return b.count - a.count; });
                var best = validBuckets[0];

                if (!best || best.count === 0) return resolve(null);

                // Рахуємо чистий середній колір тільки з цього переможного кошика
                var finalR = Math.floor(best.r / best.count);
                var finalG = Math.floor(best.g / best.count);
                var finalB = Math.floor(best.b / best.count);

                var brightness = (finalR * 299 + finalG * 587 + finalB * 114) / 1000;
                var colorData = { r: finalR, g: finalG, b: finalB, brightness: brightness };

                // Кешуємо результат
                try {
                    var cache = JSON.parse(localStorage.getItem(storageKey) || '{}');
                    cache[cacheKey] = {
                        data: colorData,
                        timestamp: Date.now() + (10 * 24 * 60 * 60 * 1000)
                    };
                    localStorage.setItem(storageKey, JSON.stringify(cache));
                } catch (e) {}
                
                resolve(colorData);
            };
            img.onerror = function() { resolve(null); };
            img.src = 'https://image.tmdb.org/t/p/w300' + logo.file_path;
        }).catch(function() { resolve(null); });
    });
}


/* Застосування динамічного кольору до іконки (з плавною появою) */
function applyDynamicColorToIcon($iconElement, colorData, isWide) {
    if (!colorData || !$iconElement.length || $iconElement.closest('.mdb-dynamic-shadow-wrapper').length || $iconElement.closest('.mdb-wide-color-wrapper').length) return;

    var rgb = 'rgb(' + colorData.r + ',' + colorData.g + ',' + colorData.b + ')';
    var iconSrc = $iconElement.attr('src') || $iconElement.css('background-image').replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
    
    var brightness = colorData.brightness;
    if (brightness === undefined) {
        brightness = (colorData.r * 299 + colorData.g * 587 + colorData.b * 114) / 1000;
    }

    // Захист від чорного
    if (brightness < 20) {
        rgb = 'rgb(255, 255, 255)';
    }

    if (isWide) {
        // --- ЛОГІКА ДЛЯ ШИРОКИХ ЛОГО ---
        var $wideWrapper = $('<div class="mdb-wide-color-wrapper"></div>');
        $wideWrapper.css({
            'display': 'inline-block',
            'width': $iconElement.width() + 'px',
            'height': $iconElement.height() + 'px',
            'background-color': rgb,
            '-webkit-mask-image': 'url(' + iconSrc + ')',
            '-webkit-mask-size': 'contain',
            '-webkit-mask-repeat': 'no-repeat',
            '-webkit-mask-position': 'center',
            'opacity': '0', // Старт з невидимості
            'transition': 'opacity 0.4s ease, background-color 0.4s ease'
        });

        $iconElement.css('opacity', '0'); // Оригінал ховаємо
        $iconElement.wrap($wideWrapper);

        // Даємо браузеру мілісекунду на рендер і плавно проявляємо
        setTimeout(function() {
            $iconElement.closest('.mdb-wide-color-wrapper').css('opacity', '1');
        }, 50);

    } else {
        // --- ЛОГІКА ДЛЯ КВАДРАТНИХ ІКОНОК ---
        var $maskWrapper = $('<div class="mdb-dynamic-color-wrapper"></div>');
        $maskWrapper.css({
            'display': 'block',
            'width': '100%',
            'height': '100%',
            'background-color': rgb,
            '-webkit-mask-image': 'url(' + iconSrc + ')',
            '-webkit-mask-size': 'contain',
            '-webkit-mask-repeat': 'no-repeat',
            '-webkit-mask-position': 'center'
        });

        var $shadowWrapper = $('<div class="mdb-dynamic-shadow-wrapper"></div>');
        $shadowWrapper.css({
            'display': 'inline-block',
            'width': $iconElement.width() + 'px',
            'height': $iconElement.height() + 'px',
            'position': 'relative',
            'filter': 'drop-shadow(1px 1px 0px rgba(0,0,0,0.4))',
            'opacity': '0', // Старт з невидимості
            'transition': 'opacity 0.4s ease'
        });

        $iconElement.css({
            'mix-blend-mode': 'multiply',
            'filter': 'none',
            'opacity': '1', 
            'display': 'block', 
            'width': '100%', 
            'height': '100%'
        });

        $iconElement.wrap($shadowWrapper).wrap($maskWrapper);

        // Плавна поява
        setTimeout(function() {
            $iconElement.closest('.mdb-dynamic-shadow-wrapper').css('opacity', '1');
        }, 50);
    }
}



  function triggerDynamicColors(card) {
    var isBwIconsEnabled = Lampa.Storage.get('ratings_bw_logos', false);
    var isWideLogosEnabled = Lampa.Storage.get('ratings_wide_logos', false);
    var isDynamicColorsEnabled = Lampa.Storage.get('ratings_dynamic_colors', false);

    if (!isDynamicColorsEnabled || (!isBwIconsEnabled && !isWideLogosEnabled)) return;

    // МИТТЄВО ХОВАЄМО ІКОНКИ ще до того, як Лампа їх покаже (щоб не було блимання)
    var $icons = $('.lmp-custom-rate .source--name img');
    $icons.css('opacity', '0');

    var tmdbApiKey = Lampa.Storage.get('tmdb_api_key', ''); 
    if (!tmdbApiKey || tmdbApiKey.trim() === '' || tmdbApiKey.trim() === 'c87a543116135a4120443155bf680876') {
        tmdbApiKey = '4ef0d7355d9ffb5151e987764708ce96';
    }

    setTimeout(function() {
        var cachedColor = getCachedLogoColor(card);
        
        if (cachedColor) {
            $icons.each(function() {
                applyDynamicColorToIcon($(this), cachedColor, isWideLogosEnabled);
            });
        } else {
            fetchLogoColor(card, tmdbApiKey).then(function(colorData) {
                if (colorData) {
                    $icons.each(function() {
                        applyDynamicColorToIcon($(this), colorData, isWideLogosEnabled);
                    });
                } else {
                    // Якщо кольору немає (напр. логотип не знайдено), плавно повертаємо оригінали
                    $icons.css({
                        'transition': 'opacity 0.4s ease',
                        'opacity': '1'
                    });
                }
            });
        }
    }, 400); 
}

  function startPlugin() {
    window.combined_ratings_plugin = true;
    cleanOldCache(); 
    cleanLogoColorCache(); // Чистимо кеш кольорів при старті
    
    Lampa.Listener.follow('full', function(e) {
      if (e.type === 'complite') {
        var card = e.data.movie || e.object || {};
        setTimeout(function() { 
            fetchAdditionalRatings(card);
            setTimeout(function() {
                if (currentRatingsData && currentRatingsData.imdb && currentRatingsData.imdb.display) {
                    var k = getCardType(card) + '_' + card.id; 
                    try {
                        var OM = 'omdb_ratings_cache', c = JSON.parse(localStorage.getItem(OM) || '{}'), t = parseInt(Lampa.Storage.get('omdb_cache_days', '7')) || 7;
                        c[k] = { rating: currentRatingsData.imdb.display, timestamp: Date.now() + (t * 24 * 60 * 60 * 1000) };
                        localStorage.setItem(OM, JSON.stringify(c));
                    } catch (err) {}
                }
            }, 1000); 
        }, 500);
      }
    });
    if (typeof pollOmdbCards === 'function') pollOmdbCards();
  }

  $('body').append(pluginStyles);
  initRatingsPluginUI();
  refreshConfigFromStorage();
  if (!window.combined_ratings_plugin) startPlugin();
})();
