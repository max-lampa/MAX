(function () {
  'use strict';

  var PLUGIN_GUARD_KEY = '__APPLETV_MAKSTV_CARDS__';
  if (typeof window === 'undefined' || window[PLUGIN_GUARD_KEY]) return;
  window[PLUGIN_GUARD_KEY] = true;

  var PLUGIN_VERSION = '1.0.0';
  var PLUGIN_AUTHOR  = 'MaksTV';

  var KEYS = {
    STYLE_ID:          'appletv-makstv-style',
    BODY_CLASS:        'appletv-makstv',
    TMDB_KEY:          '4ef0d7355d9ffb5151e987764708ce96',
    ENABLE_KEY:        'makstv_enabled',
    GLARE_KEY:         'makstv_glare',
    CARD_ANIM_KEY:     'makstv_card_anim',
    CARD_ANIM_ATTR:    'data-makstv-card-anim',
    LOGO_LANG_KEY:     'makstv_logo_lang',
    BACKDROP_KEY:      'makstv_backdrop',
    BADGE_KEY:         'makstv_badge',
    RATING_KEY:        'makstv_rating',
    RATING_STYLE_KEY:  'makstv_rating_style',
    RATING_STYLE_ATTR: 'data-makstv-rating-style',
    CARD_SIZE_KEY:     'makstv_card_size',
    CARD_SIZE_ATTR:    'data-makstv-card-size',
    LOGO_SIZE_KEY:     'makstv_logo_size',
    LOGO_SIZE_ATTR:    'data-makstv-logo-size',
    POSTER_QUALITY_KEY:'makstv_poster_quality',
    CARD_IMAGE_MODE_KEY:'makstv_card_image_mode',
    CARD_IMAGE_MODE_ATTR:'data-makstv-card-image-mode',
    LOGO_TITLE_KEY:    'makstv_logo_title',
    OVERLAY_ALIGN_KEY: 'makstv_overlay_align',
    OVERLAY_ALIGN_ATTR:'data-makstv-overlay-align',
    FOCUS_LEVEL_KEY:   'makstv_focus_level',
    FOCUS_LEVEL_ATTR:  'data-makstv-focus',
    BACKDROP_ATTR:     'data-makstv-backdrop',
    BADGE_ATTR:        'data-makstv-badge',
    RATING_ATTR:       'data-makstv-rating',
    PERF_MODE_KEY:     'makstv_perf_mode',
    PERF_ATTR:         'data-makstv-perf',
    CACHE_SIZE_KEY:    'makstv_cache_size',
    GLASS_KEY:         'makstv_glass',
    GLASS_ATTR:        'data-makstv-glass',
    DEPTH_BLUR_KEY:    'makstv_depth_blur',
    DEPTH_BLUR_ATTR:   'data-makstv-depth-blur',
    COLOR_SYNC_KEY:    'makstv_color_sync',
    COLOR_SYNC_ATTR:   'data-makstv-color-sync',
    SETTINGS_COMPONENT:'makstv'
  };

  var ru = {
    badge_movie: 'ФИЛЬМ', badge_tv: 'СЕРИАЛ',
    set_about_version: 'Версия', set_about_authors: 'Авторы',
    set_main_title: 'AppleTV MaksTV — Карточки и постеры',
    set_enable_name: 'Плагин', set_enable_desc: 'Включить / выключить плагин',
    set_section_cards: 'Карточки',
    set_section_logos: 'Логотипы и постеры',
    set_section_data:  'Данные',
    set_backdrop_name: 'Горизонтальные карточки',
    set_backdrop_desc: 'Бекдроп вместо обычного постера',
    set_badge_name: 'Бейдж «Фильм/Сериал»', set_badge_desc: 'Бейдж в левом верхнем углу',
    set_rating_name: 'Рейтинг TMDB', set_rating_desc: 'Оценка в правом верхнем углу',
    set_rating_style_name: 'Стиль рейтинга', set_rating_style_desc: 'Цветной или монохромный',
    set_card_anim_name: 'Анимация карточек', set_card_anim_desc: 'Эффект при наведении на карточку',
    set_focus_level_name: 'Уровень фокуса', set_focus_level_desc: 'Масштаб и свечение при выборе карточки (1 — минимум, 7 — максимум)',
    set_card_size_name: 'Размер карточек', set_card_size_desc: 'Ширина карточек в лентах',
    set_card_image_mode_name: 'Тип изображения', set_card_image_mode_desc: 'Бекдроп + логотип или постер',
    set_logo_lang_name: 'Язык логотипов', set_logo_lang_desc: 'Если нет логотипа на выбранном языке — берётся английский',
    set_logo_size_name: 'Размер логотипа', set_logo_size_desc: 'Максимальная ширина логотипа на карточке',
    set_logo_title_name: 'Название под логотипом', set_logo_title_desc: 'Показывать локальное название, если логотип только на английском',
    set_poster_quality_name: 'Качество постеров', set_poster_quality_desc: 'Разрешение постеров с TMDB',
    set_overlay_align_name: 'Выравнивание подписи', set_overlay_align_desc: 'Горизонтальное выравнивание названия на карточке',
    set_glass_name: 'Жидкое стекло', set_glass_desc: 'Стеклянная рамка в стиле Apple visionOS — блик, матовость, цветное свечение от постера',
    set_depth_blur_name: 'Глубина сцены', set_depth_blur_desc: 'Соседние карточки размываются и уходят назад, когда одна в фокусе',
    set_color_sync_name: 'Цвет плагина Colors', set_color_sync_desc: 'Использовать цвет из плагина Colors для свечения и рамки карточек',
    set_perf_mode_name: 'Режим производительности', set_perf_mode_desc: 'Снижает нагрузку на слабых устройствах',
    set_cache_size_name: 'Размер кеша', set_cache_size_desc: 'Максимальный объём кеша изображений',
    set_reset_name: 'Сбросить настройки', set_reset_desc: 'Вернуть все параметры к умолчанию',
    set_reset_done: 'Настройки MaksTV сброшены',
    val_on: 'Включить', val_off: 'Выключить',
    val_auto: 'Авто',
    val_size_xs: 'Мелкий', val_size_sm: 'Маленький', val_size_md: 'Обычный', val_size_lg: 'Крупный', val_size_xl: 'Огромный',
    val_rating_color: 'Цветной', val_rating_mono: 'Монохромный',
    val_card_anim_off: 'Выключено', val_card_anim_tilt: 'Наклон', val_card_anim_depth: 'Глубина (DepthTV)',
    val_card_image_backdrop: 'Бекдроп + Логотип', val_card_image_poster: 'Постер',
    val_logo_title_off: 'Нет', val_logo_title_below: 'Снизу логотипа', val_logo_title_above: 'Сверху логотипа',
    val_overlay_align_start: 'По левому краю', val_overlay_align_center: 'По центру', val_overlay_align_end: 'По правому краю',
    val_perf_auto: 'Авто', val_perf_high: 'Максимум (все эффекты)', val_perf_low: 'Слабое устройство', val_perf_ultra: 'Очень слабое',
    val_unlimited: 'Без ограничений'
  };

  var en = {
    badge_movie: 'MOVIE', badge_tv: 'TV',
    set_about_version: 'Version', set_about_authors: 'Author',
    set_main_title: 'AppleTV MaksTV — Cards & Posters',
    set_enable_name: 'Plugin', set_enable_desc: 'Enable / disable the plugin',
    set_section_cards: 'Cards',
    set_section_logos: 'Logos & Posters',
    set_section_data:  'Data',
    set_backdrop_name: 'Landscape cards', set_backdrop_desc: 'Use backdrop instead of portrait poster',
    set_badge_name: '"Movie/TV" badge', set_badge_desc: 'Badge in the top-left corner',
    set_rating_name: 'TMDB rating', set_rating_desc: 'Score in the top-right corner',
    set_rating_style_name: 'Rating style', set_rating_style_desc: 'Colored or monochrome',
    set_card_anim_name: 'Card animation', set_card_anim_desc: 'Effect on card hover',
    set_focus_level_name: 'Focus level', set_focus_level_desc: 'Scale and glow on card focus (1 = minimal, 7 = dramatic)',
    set_card_size_name: 'Card size', set_card_size_desc: 'Card width in rows',
    set_card_image_mode_name: 'Image type', set_card_image_mode_desc: 'Backdrop + logo or poster',
    set_logo_lang_name: 'Logo language', set_logo_lang_desc: 'Falls back to English if no logo in chosen language',
    set_logo_size_name: 'Logo size', set_logo_size_desc: 'Maximum logo width on the card',
    set_logo_title_name: 'Title near logo', set_logo_title_desc: 'Show local title when only an English logo is available',
    set_poster_quality_name: 'Poster quality', set_poster_quality_desc: 'TMDB poster image resolution',
    set_overlay_align_name: 'Overlay alignment', set_overlay_align_desc: 'Horizontal alignment of the title on the card',
    set_glass_name: 'Liquid glass', set_glass_desc: 'Apple visionOS-style glass frame — specular highlight, frosted surface, color glow from poster',
    set_depth_blur_name: 'Depth of field', set_depth_blur_desc: 'Nearby cards blur and recede when one is focused',
    set_color_sync_name: 'Colors plugin sync', set_color_sync_desc: 'Use Colors plugin accent color for card glow and focus ring tint',
    set_perf_mode_name: 'Performance mode', set_perf_mode_desc: 'Reduces load on weak devices',
    set_cache_size_name: 'Cache size', set_cache_size_desc: 'Maximum image cache size',
    set_reset_name: 'Reset settings', set_reset_desc: 'Restore all options to defaults',
    set_reset_done: 'MaksTV settings reset',
    val_on: 'Enable', val_off: 'Disable',
    val_auto: 'Auto',
    val_size_xs: 'XS', val_size_sm: 'Small', val_size_md: 'Normal', val_size_lg: 'Large', val_size_xl: 'XL',
    val_rating_color: 'Colored', val_rating_mono: 'Monochrome',
    val_card_anim_off: 'Off', val_card_anim_tilt: 'Tilt', val_card_anim_depth: 'Depth (DepthTV)',
    val_card_image_backdrop: 'Backdrop + Logo', val_card_image_poster: 'Poster',
    val_logo_title_off: 'No', val_logo_title_below: 'Below logo', val_logo_title_above: 'Above logo',
    val_overlay_align_start: 'Left', val_overlay_align_center: 'Center', val_overlay_align_end: 'Right',
    val_perf_auto: 'Auto', val_perf_high: 'Max (all effects)', val_perf_low: 'Weak device', val_perf_ultra: 'Very weak',
    val_unlimited: 'Unlimited'
  };

  var I18N = { ru: ru, en: en };
  var I18N_CODES = ['ru', 'en'];

  function registerI18n() {
    if (!window.Lampa || !Lampa.Lang || typeof Lampa.Lang.add !== 'function') return;
    if (window.__MAKSTV_I18N__) return;
    var payload = {};
    I18N_CODES.forEach(function (code) {
      Object.keys(I18N[code]).forEach(function (key) {
        if (!payload[key]) payload[key] = {};
        payload[key][code] = I18N[code][key];
      });
    });
    Lampa.Lang.add(payload);
    window.__MAKSTV_I18N__ = true;
  }

  function t(key) {
    try {
      if (window.Lampa && Lampa.Lang && typeof Lampa.Lang.translate === 'function') {
        registerI18n();
        return Lampa.Lang.translate(key, getLang());
      }
    } catch (e) {}
    var lang = getLang();
    return (I18N[lang] && I18N[lang][key]) || (I18N.ru[key]) || key;
  }

  function getLang() {
    try {
      if (!window.Lampa) return 'ru';
      var l = (Lampa.Storage && Lampa.Storage.get('language', '')) || '';
      if (!l && Lampa.Lang && Lampa.Lang.selected) l = Lampa.Lang.selected() || '';
      l = l.toLowerCase();
      if (l.indexOf('en') === 0) return 'en';
      return 'ru';
    } catch (e) { return 'ru'; }
  }

  var GENRE_MAP = {
    ru: { 28:'Боевик',12:'Приключения',16:'Мультфильм',35:'Комедия',80:'Криминал',99:'Документальный',18:'Драма',10751:'Семейный',14:'Фэнтези',27:'Ужасы',878:'Фантастика',53:'Триллер',10749:'Мелодрама',36:'История',37:'Вестерн' },
    en: { 28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',27:'Horror',878:'Sci-Fi',53:'Thriller',10749:'Romance',36:'History',37:'Western' }
  };

  function getGenreNames(item) {
    var map = GENRE_MAP[getLang()] || GENRE_MAP.ru;
    var names = [];
    if (item && item.genres && item.genres.length) {
      for (var i = 0; i < item.genres.length; i++) if (item.genres[i].name) names.push(item.genres[i].name);
    } else if (item && item.genre_ids && item.genre_ids.length) {
      for (var j = 0; j < item.genre_ids.length; j++) if (map[item.genre_ids[j]]) names.push(map[item.genre_ids[j]]);
    }
    return names;
  }

  /* ─── IndexedDB image cache ─── */
  var DB_NAME = 'makstv-cache', DB_VERSION = 1, STORE_META = 'meta', STORE_IMG = 'img';
  var _db = null, _dbQueue = [], _dbOpening = false, FAILED_TTL = 24 * 60 * 60 * 1000;

  function openDB(cb) {
    if (_db) { cb(_db); return; }
    _dbQueue.push(cb);
    if (_dbOpening) return;
    _dbOpening = true;
    try {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META, { keyPath: 'key' });
        if (!db.objectStoreNames.contains(STORE_IMG))  db.createObjectStore(STORE_IMG,  { keyPath: 'key' });
      };
      req.onsuccess = function (e) {
        _db = e.target.result; _dbOpening = false;
        _dbQueue.splice(0).forEach(function (f) { f(_db); });
      };
      req.onerror = function () {
        _dbOpening = false;
        _dbQueue.splice(0).forEach(function (f) { f(null); });
      };
    } catch (e) {
      _dbOpening = false;
      _dbQueue.splice(0).forEach(function (f) { f(null); });
    }
  }

  function idbGet(store, key, cb) {
    openDB(function (db) {
      if (!db) { cb(undefined); return; }
      try {
        var req = db.transaction(store, 'readonly').objectStore(store).get(key);
        req.onsuccess = function () { cb(req.result ? req.result.v : undefined); };
        req.onerror = function () { cb(undefined); };
      } catch (e) { cb(undefined); }
    });
  }

  function idbSet(store, key, value, extra) {
    openDB(function (db) {
      if (!db) return;
      try {
        var rec = { key: key, v: value, t: Date.now() };
        if (extra) Object.keys(extra).forEach(function (k) { rec[k] = extra[k]; });
        db.transaction(store, 'readwrite').objectStore(store).put(rec);
      } catch (e) {}
    });
  }

  function metaGet(key, cb) { idbGet(STORE_META, key, cb); }
  function metaSet(key, val) { idbSet(STORE_META, key, val); }

  function pruneImgCache(maxBytes) {
    openDB(function (db) {
      if (!db) return;
      try {
        var now = Date.now(), surviving = [];
        db.transaction(STORE_IMG, 'readwrite').objectStore(STORE_IMG).openCursor().onsuccess = function (e) {
          var cur = e.target.result;
          if (!cur) {
            if (maxBytes === Infinity) return;
            var total = surviving.reduce(function (s, r) { return s + r.s; }, 0);
            if (total <= maxBytes) return;
            surviving.sort(function (a, b) { return a.t - b.t; });
            try {
              var tx2 = db.transaction(STORE_IMG, 'readwrite'), st2 = tx2.objectStore(STORE_IMG);
              for (var i = 0; i < surviving.length && total > maxBytes; i++) { st2.delete(surviving[i].key); total -= surviving[i].s; }
            } catch (e2) {}
            return;
          }
          if (cur.value.failed && now - cur.value.t > FAILED_TTL) cur.delete();
          else surviving.push({ key: cur.value.key, t: cur.value.t, s: cur.value.s || 0 });
          cur.continue();
        };
      } catch (e) {}
    });
  }

  function clearAllCaches() {
    openDB(function (db) {
      if (!db) return;
      try { var tx = db.transaction([STORE_META, STORE_IMG], 'readwrite'); tx.objectStore(STORE_META).clear(); tx.objectStore(STORE_IMG).clear(); } catch (e) {}
    });
  }

  var _fetchTried = {};
  function imgKey(url) {
    var i = url.indexOf('/t/p/'); if (i < 0) return url;
    var k = url.substring(i), q = k.indexOf('?'); return q >= 0 ? k.substring(0, q) : k;
  }

  function imgLoad(url, cb) {
    var key = imgKey(url);
    openDB(function (db) {
      if (!db) { cb(url); return; }
      try {
        var req = db.transaction(STORE_IMG, 'readonly').objectStore(STORE_IMG).get(key);
        req.onsuccess = function () {
          var entry = req.result;
          if (entry && entry.v) { try { cb(URL.createObjectURL(entry.v)); return; } catch (e) {} }
          cb(url);
          if (entry && entry.failed) { _fetchTried[key] = true; return; }
          if (!_fetchTried[key]) { _fetchTried[key] = true; fetch(url).then(function (r) { if (!r.ok) { idbSet(STORE_IMG, key, null, { s:0, failed:true }); return; } r.blob().then(function (b) { idbSet(STORE_IMG, key, b, { s:b.size }); }); }).catch(function () { idbSet(STORE_IMG, key, null, { s:0, failed:true }); }); }
        };
        req.onerror = function () { cb(url); };
      } catch (e) { cb(url); }
    });
  }

  /* ─── Settings helpers ─── */
  function getSetting(key, def) {
    try { if (!window.Lampa || !Lampa.Storage) return def; var v = Lampa.Storage.get(key, def); return (v !== undefined && v !== null) ? v : def; } catch (e) { return def; }
  }
  function pluginEnabled()    { return getSetting(KEYS.ENABLE_KEY, 'on') !== 'off'; }
  function backdropEnabled()  { return getSetting(KEYS.BACKDROP_KEY, 'on') !== 'off'; }
  function badgeEnabled()     { return getSetting(KEYS.BADGE_KEY, 'on') !== 'off'; }
  function ratingEnabled()    { return getSetting(KEYS.RATING_KEY, 'off') !== 'off'; }
  function getRatingStyle()   { return getSetting(KEYS.RATING_STYLE_KEY, 'color') === 'mono' ? 'mono' : 'color'; }
  function getCardAnim()      { return getSetting(KEYS.CARD_ANIM_KEY, 'tilt'); }
  function getLogoLang()      { var v = getSetting(KEYS.LOGO_LANG_KEY, 'auto'); return (!v || v === 'auto') ? getLang() : v; }
  function getLogoSize()      { return getSetting(KEYS.LOGO_SIZE_KEY, 'md'); }
  function getCardSize()      { return getSetting(KEYS.CARD_SIZE_KEY, 'md'); }
  function getPosterQuality() { var v = getSetting(KEYS.POSTER_QUALITY_KEY, 'w500'); return ['w185','w342','w500','w780','original'].indexOf(v) > -1 ? v : 'w500'; }
  function getBackdropQuality() { var q = getPosterQuality(); return q === 'w185' || q === 'w342' ? 'w300' : q === 'w500' ? 'w780' : q === 'w780' ? 'w1280' : 'original'; }
  function getCardImageMode() { return getSetting(KEYS.CARD_IMAGE_MODE_KEY, 'backdrop') === 'poster' ? 'poster' : 'backdrop'; }
  function getLogoTitle()     { return getSetting(KEYS.LOGO_TITLE_KEY, 'off'); }
  function getOverlayAlign()  { return getSetting(KEYS.OVERLAY_ALIGN_KEY, 'start'); }
  function getFocusLevel()    { var v = parseInt(getSetting(KEYS.FOCUS_LEVEL_KEY, '4'), 10); return (v >= 1 && v <= 7) ? v : 4; }
  function getPerfMode()      { return getSetting(KEYS.PERF_MODE_KEY, 'auto'); }
  function getCacheMax()      { var v = getSetting(KEYS.CACHE_SIZE_KEY, '100'); return v === 'unlimited' ? Infinity : (parseInt(v, 10) || 100) * 1024 * 1024; }
  function glassEnabled()      { return !isUltra() && getSetting(KEYS.GLASS_KEY, 'on') !== 'off'; }
  function depthBlurEnabled()  { return !isUltra() && getSetting(KEYS.DEPTH_BLUR_KEY, 'on') !== 'off'; }
  function colorSyncEnabled()  { return getSetting(KEYS.COLOR_SYNC_KEY, 'on') !== 'off'; }

  /* Read the Colors plugin main_color from storage, returns "r,g,b" string or empty */
  function getColorPluginRgb() {
    try {
      var hex = (window.Lampa && Lampa.Storage ? Lampa.Storage.get('color_plugin_main_color', '') : '') ||
                (window.localStorage ? localStorage.getItem('color_plugin_main_color') || '' : '');
      hex = hex.replace(/\s/g,'');
      if (!hex || hex === '#353535' || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return '';
      var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
      if (isNaN(r)||isNaN(g)||isNaN(b)) return '';
      return r+','+g+','+b;
    } catch(e){ return ''; }
  }

  /* Apply / remove --color-sync-rgb on body so CSS can use it as fallback glow */
  function applyColorSync() {
    if (!document.body) return;
    if (colorSyncEnabled()) {
      var rgb = getColorPluginRgb();
      if (rgb) { document.body.style.setProperty('--color-sync-rgb', rgb); return; }
    }
    document.body.style.removeProperty('--color-sync-rgb');
  }

  function getCardAnim() {
    /* Default to no 3D tilt on TV — use clean 2-D scale only */
    var def = isTVDevice() ? 'off' : 'tilt';
    return getSetting(KEYS.CARD_ANIM_KEY, def);
  }

  /* ─── TV / perf detection ─── */
  var _uaCache = null;
  function getUA() { if (!_uaCache) _uaCache = ((window.navigator && window.navigator.userAgent) || '').toLowerCase(); return _uaCache; }

  /* Android TV, Google TV, Fire TV, WebOS, Tizen */
  function isTVDevice() {
    var ua = getUA();
    return ua.indexOf('googletv') > -1 || ua.indexOf('crkey') > -1 ||
           ua.indexOf('aftwi') > -1 || ua.indexOf('aftmm') > -1 || ua.indexOf('aftrs') > -1 ||
           ua.indexOf('webos') > -1 || ua.indexOf('tizen') > -1 ||
           (ua.indexOf('android') > -1 && ua.indexOf(' tv') > -1);
  }

  var _detectedPerf = null;
  function detectPerf() {
    if (_detectedPerf) return _detectedPerf;
    try {
      var nav = window.navigator || {}, dm = nav.deviceMemory || 0, hc = nav.hardwareConcurrency || 0;
      var tv = isTVDevice();
      /* Weak device: ≤1 GB RAM or single-core */
      if ((dm > 0 && dm <= 1) || (hc > 0 && hc <= 1)) { _detectedPerf = 'ultra'; return _detectedPerf; }
      /* Android TV / Smart TV → always start at low (safe baseline) */
      if (tv || (dm > 0 && dm <= 2) || (hc > 0 && hc <= 2)) { _detectedPerf = 'low'; return _detectedPerf; }
      _detectedPerf = 'high';
    } catch (e) { _detectedPerf = 'low'; }
    return _detectedPerf;
  }
  function resolvePerf() { var m = getPerfMode(); return m === 'auto' ? detectPerf() : m; }
  function isUltra() { return resolvePerf() === 'ultra'; }
  function isLowPerf() { var p = resolvePerf(); return p === 'ultra' || p === 'low'; }

  /* ─── TMDB logo/poster fetchers ─── */
  var logoCache = {}, logoPending = {}, posterCache = {}, posterPending = {}, backdropCache = {}, backdropPending = {};

  function fetchLogo(id, type, cb) {
    if (!id) return cb(null);
    var lang = getLogoLang(), key = type + '/' + id + '/' + lang;
    if (key in logoCache) return cb(logoCache[key]);
    if (logoPending[key]) { logoPending[key].push(cb); return; }
    logoPending[key] = [cb];
    metaGet(key, function (persisted) {
      if (persisted !== undefined) {
        logoCache[key] = persisted;
        logoPending[key].splice(0).forEach(function (f) { f(persisted); });
        delete logoPending[key]; return;
      }
      var langs = [lang]; if (lang !== 'en') langs.push('en'); langs.push('null');
      var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/images?api_key=' + KEYS.TMDB_KEY + '&include_image_language=' + langs.join(',');
      fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        var logo = null;
        if (data.logos && data.logos.length) {
          var pref = data.logos.filter(function (l) { return l.iso_639_1 === lang; });
          var eng  = data.logos.filter(function (l) { return l.iso_639_1 === 'en'; });
          var pick = pref[0] || eng[0] || data.logos[0];
          if (pick && pick.file_path) logo = { path: pick.file_path, iso_639_1: pick.iso_639_1 || null };
        }
        logoCache[key] = logo; metaSet(key, logo);
        logoPending[key].splice(0).forEach(function (f) { f(logo); }); delete logoPending[key];
      }).catch(function () {
        logoCache[key] = null;
        logoPending[key].splice(0).forEach(function (f) { f(null); }); delete logoPending[key];
      });
    });
  }

  function logoImgUrl(path) { return Lampa.TMDB.image('t/p/w300' + path); }

  function fetchTitledBackdrop(id, type, cb) {
    if (!id) return cb(null);
    var lang = getLogoLang(), key = 'titled_bd/' + type + '/' + id + '/' + lang;
    if (key in backdropCache) return cb(backdropCache[key]);
    if (backdropPending[key]) { backdropPending[key].push(cb); return; }
    backdropPending[key] = [cb];
    metaGet(key, function (persisted) {
      if (persisted !== undefined) {
        backdropCache[key] = persisted;
        backdropPending[key].splice(0).forEach(function (f) { f(persisted); }); delete backdropPending[key]; return;
      }
      var langs = [lang]; if (lang !== 'en') langs.push('en');
      var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/images?api_key=' + KEYS.TMDB_KEY + '&include_image_language=' + langs.join(',');
      fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        var path = null;
        if (data.backdrops && data.backdrops.length) {
          var pref = data.backdrops.filter(function (b) { return b.iso_639_1 === lang; });
          var eng  = data.backdrops.filter(function (b) { return b.iso_639_1 === 'en'; });
          var cands = (pref.length ? pref : eng);
          if (cands.length) { cands.sort(function (a, b) { return (b.vote_average || 0) - (a.vote_average || 0); }); path = cands[0].file_path; }
        }
        backdropCache[key] = path; metaSet(key, path);
        backdropPending[key].splice(0).forEach(function (f) { f(path); }); delete backdropPending[key];
      }).catch(function () {
        backdropCache[key] = null;
        backdropPending[key].splice(0).forEach(function (f) { f(null); }); delete backdropPending[key];
      });
    });
  }

  function fetchCleanPoster(id, type, cb) {
    if (!id) return cb(null);
    var key = 'poster/' + type + '/' + id;
    if (key in posterCache) return cb(posterCache[key]);
    if (posterPending[key]) { posterPending[key].push(cb); return; }
    posterPending[key] = [cb];
    metaGet(key, function (persisted) {
      if (persisted !== undefined) {
        posterCache[key] = persisted;
        posterPending[key].splice(0).forEach(function (f) { f(persisted); }); delete posterPending[key]; return;
      }
      var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/images?api_key=' + KEYS.TMDB_KEY + '&include_image_language=null';
      fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        var path = null;
        if (data.posters && data.posters.length) {
          var neutrals = data.posters.filter(function (p) { return !p.iso_639_1; });
          var pick = neutrals[0] || data.posters[0];
          if (pick && pick.file_path) path = pick.file_path;
        }
        posterCache[key] = path; metaSet(key, path);
        posterPending[key].splice(0).forEach(function (f) { f(path); }); delete posterPending[key];
      }).catch(function () {
        posterCache[key] = null;
        posterPending[key].splice(0).forEach(function (f) { f(null); }); delete posterPending[key];
      });
    });
  }

  /* ─── Dominant colour extraction via canvas ─── */
  function extractDominantColor(imgSrc, cardEl) {
    try {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        try {
          var c = document.createElement('canvas'); c.width = 12; c.height = 12;
          var ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, 12, 12);
          var d = ctx.getImageData(0, 0, 12, 12).data;
          var r = 0, g = 0, b = 0, n = 0;
          for (var i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 120) continue;
            /* skip near-black and near-white pixels — they are boring */
            var lum = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
            if (lum < 18 || lum > 230) continue;
            r += d[i]; g += d[i+1]; b += d[i+2]; n++;
          }
          if (!n) return;
          r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
          /* Boost saturation: push away from grey */
          var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          var boost = 1.55;
          var mid = (mx + mn) / 2;
          r = Math.min(255, Math.max(0, Math.round(mid + (r - mid) * boost)));
          g = Math.min(255, Math.max(0, Math.round(mid + (g - mid) * boost)));
          b = Math.min(255, Math.max(0, Math.round(mid + (b - mid) * boost)));
          if (cardEl && cardEl.style) cardEl.style.setProperty('--card-glow', r + ',' + g + ',' + b);
        } catch (e2) {}
      };
      img.src = imgSrc;
    } catch (e) {}
  }

  /* ─── Card DOM helpers ─── */
  function extractCardData(el) {
    if (!el) return null;
    try { if (el.card_data) return el.card_data; } catch (e) {}
    try { if (window.$) { var d = $(el).data('card') || $(el).data('json'); if (d) return d; } } catch (e) {}
    return null;
  }

  function escapeHtml(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }

  function isSursButton(el) {
    return el && el.classList && (el.classList.contains('card--button-compact') || el.classList.contains('streaming-card--button-compact') || el.classList.contains('card--genre-compact'));
  }

  function setImgUrl(imgEl, url) {
    if (!imgEl) return;
    imgLoad(url, function (src) {
      if (imgEl.tagName === 'IMG') {
        imgEl.onload = function () { if (src !== url) try { URL.revokeObjectURL(src); } catch (e) {} };
        imgEl.onerror = function () { if (src !== url) try { URL.revokeObjectURL(src); } catch (e) {} };
        imgEl.src = src; imgEl.style.objectFit = 'cover'; imgEl.style.objectPosition = 'center';
      } else {
        var prev = imgEl.getAttribute('data-makstv-blob'); if (prev) try { URL.revokeObjectURL(prev); } catch (e) {}
        if (src !== url) imgEl.setAttribute('data-makstv-blob', src);
        imgEl.style.backgroundImage = 'url(' + src + ')'; imgEl.style.backgroundSize = 'cover'; imgEl.style.backgroundPosition = 'center';
      }
    });
  }

  function switchCardToBackdrop(cardEl) {
    if (!cardEl || cardEl.getAttribute('data-makstv-switched')) return;
    if (isSursButton(cardEl)) { cardEl.setAttribute('data-makstv-switched', 'skip'); return; }
    cardEl.setAttribute('data-makstv-switched', '1');

    var data = extractCardData(cardEl);
    if (!data) return;

    var imgEl   = cardEl.querySelector('.card__img');
    var view    = cardEl.querySelector('.card__view');
    var mode    = getCardImageMode();
    var useHoriz = backdropEnabled();
    var tmdbType = data.name ? 'tv' : 'movie';
    var perfUltra = isUltra();

    /* ── Set image ── */
    if (imgEl) {
      if (imgEl.tagName === 'IMG') { if (!imgEl.hasAttribute('data-makstv-orig')) imgEl.setAttribute('data-makstv-orig', imgEl.getAttribute('src') || ''); }
      else if (!imgEl.hasAttribute('data-makstv-orig')) imgEl.setAttribute('data-makstv-orig', imgEl.style.backgroundImage || '');
    }

    /* ── Determine image URL and apply ── */
    var resolvedImgUrl = null;
    function applyMainImg(url) {
      resolvedImgUrl = url;
      setImgUrl(imgEl, url);
      if (!perfUltra && glassEnabled()) extractDominantColor(url, cardEl);
    }

    if (mode === 'backdrop') {
      if (imgEl && data.backdrop_path) applyMainImg(Lampa.TMDB.image('t/p/' + getBackdropQuality() + data.backdrop_path));
    } else {
      if (imgEl && data.poster_path) applyMainImg(Lampa.TMDB.image('t/p/' + getPosterQuality() + data.poster_path));
      if (useHoriz && data.id && !perfUltra) {
        fetchTitledBackdrop(data.id, tmdbType, function (titled) {
          if (titled) {
            var bdUrl = Lampa.TMDB.image('t/p/' + getBackdropQuality() + titled);
            setImgUrl(imgEl, bdUrl);
            if (glassEnabled()) extractDominantColor(bdUrl, cardEl);
          }
        });
      }
    }

    /* ── Inject liquid-glass bezel + shimmer ── */
    if (glassEnabled() && !cardEl.querySelector('.makstv-glass')) {
      var glassEl = document.createElement('div'); glassEl.className = 'makstv-glass';
      var shimmerEl = document.createElement('div'); shimmerEl.className = 'makstv-shimmer';
      glassEl.appendChild(shimmerEl);
      (view || cardEl).appendChild(glassEl);
    }

    if (!view || view.querySelector('.makstv-overlay')) return;

    /* ── Build metadata overlay ── */
    var vote   = data.vote_average ? parseFloat(data.vote_average) : 0;
    var year   = (data.release_date || data.first_air_date || '').substring(0, 4);
    var genres = getGenreNames(data);
    var title  = data.title || data.name || '';

    var metaParts = [];
    if (year) metaParts.push('<span>' + year + '</span>');
    if (genres.length) metaParts.push('<span>' + escapeHtml(genres.slice(0, 2).join(', ')) + '</span>');
    var metaHtml = metaParts.length ? '<div class="makstv-overlay__meta">' + metaParts.join('<span class="makstv-overlay__dot"> · </span>') + '</div>' : '';

    var overlay = document.createElement('div');
    overlay.className = 'makstv-overlay';

    if (mode === 'backdrop') {
      /* Backdrop mode: title text shown, then replaced by logo if found */
      if (title) overlay.innerHTML = '<div class="makstv-overlay__title">' + escapeHtml(title) + '</div>';
      overlay.innerHTML += metaHtml;
      view.appendChild(overlay);

      if (!perfUltra) {
        fetchLogo(data.id, tmdbType, function (logo) {
          if (!logo) return;
          var titleDiv = overlay.querySelector('.makstv-overlay__title');
          if (!titleDiv) return;
          var img = document.createElement('img');
          img.className = 'makstv-overlay__logo'; img.alt = title; img.loading = 'lazy';
          var logoUrl = logoImgUrl(logo.path);
          imgLoad(logoUrl, function (src) {
            img.onload = function () { if (src !== logoUrl) try { URL.revokeObjectURL(src); } catch (e) {} };
            img.onerror = function () { if (src !== logoUrl) try { URL.revokeObjectURL(src); } catch (e) {} img.style.display = 'none'; };
            img.src = src;
          });
          titleDiv.replaceWith(img);
          /* Local title fallback */
          var fallback = getLogoTitle(), logoLang = getLogoLang();
          var isNonLocal = logoLang !== 'en' && logo.iso_639_1 && logo.iso_639_1 !== logoLang;
          if (fallback !== 'off' && isNonLocal && title) {
            var localTitle = document.createElement('div');
            localTitle.className = 'makstv-overlay__local-title'; localTitle.textContent = title;
            if (fallback === 'above') overlay.insertBefore(localTitle, img);
            else img.after ? img.after(localTitle) : (img.parentNode && img.parentNode.insertBefore(localTitle, img.nextSibling));
          }
        });
      }
    } else {
      /* Poster mode: no title text overlay */
      overlay.innerHTML = metaHtml;
      view.appendChild(overlay);
    }

    /* ── Badge (top-left) ── */
    if (badgeEnabled() && (data.title || data.name)) {
      var badge = document.createElement('div');
      badge.className = 'makstv-badge';
      badge.textContent = data.name ? t('badge_tv') : t('badge_movie');
      view.appendChild(badge);
    }

    /* ── TMDB rating (top-right) ── */
    if (ratingEnabled() && vote > 0) {
      var rating = document.createElement('div');
      rating.className = 'makstv-rating';
      rating.setAttribute('data-score', Math.min(10, Math.max(1, Math.round(vote))));
      rating.textContent = vote.toFixed(1);
      view.appendChild(rating);
    }
  }

  function switchEpisodeCard(cardEl) {
    if (!cardEl || cardEl.getAttribute('data-makstv-ep') || isUltra()) return;
    cardEl.setAttribute('data-makstv-ep', '1');
    var body = cardEl.querySelector('.full-episode__body');
    if (!body || body.querySelector('.makstv-ep-title') || body.querySelector('.makstv-ep-logo')) return;
    var data = extractCardData(cardEl);
    var showInfo = null;
    if (data) {
      if (data.serial && data.serial.id) showInfo = { id: data.serial.id, name: data.serial.name || '' };
      else if (data.show && data.show.id) showInfo = { id: data.show.id, name: data.show.name || '' };
    }
    if (showInfo && showInfo.name) {
      var te = document.createElement('div'); te.className = 'makstv-ep-title'; te.textContent = showInfo.name;
      body.insertBefore(te, body.firstChild);
    }
    if (showInfo && showInfo.id) {
      fetchLogo(showInfo.id, 'tv', function (logo) {
        if (!logo) return;
        var host = cardEl.querySelector('.full-episode__body'); if (!host) return;
        var prev = host.querySelector('.makstv-ep-title');
        var img = document.createElement('img'); img.className = 'makstv-ep-logo'; img.alt = showInfo.name || ''; img.loading = 'lazy';
        var lurl = logoImgUrl(logo.path);
        imgLoad(lurl, function (src) {
          img.onload = function () { if (src !== lurl) try { URL.revokeObjectURL(src); } catch (e) {} };
          img.onerror = function () { if (src !== lurl) try { URL.revokeObjectURL(src); } catch (e) {} img.style.display = 'none'; };
          img.src = src;
        });
        if (prev) prev.replaceWith(img); else host.insertBefore(img, host.firstChild);
      });
    }
  }

  function processCards(container) {
    if (!container) return;
    var cards = container.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) switchCardToBackdrop(cards[i]);
    var eps = container.querySelectorAll('.card-episode');
    for (var j = 0; j < eps.length; j++) switchEpisodeCard(eps[j]);
  }

  function resetCardSwitches() {
    document.querySelectorAll('[data-makstv-switched], [data-makstv-ep]').forEach(function (el) {
      el.removeAttribute('data-makstv-switched'); el.removeAttribute('data-makstv-ep');
      el.style.removeProperty('--card-glow');
      var ov = el.querySelector('.makstv-overlay'); if (ov) ov.remove();
      var bg = el.querySelector('.makstv-badge');   if (bg) bg.remove();
      var rt = el.querySelector('.makstv-rating');  if (rt) rt.remove();
      var lo = el.querySelector('.makstv-ep-logo'); if (lo) lo.remove();
      var te = el.querySelector('.makstv-ep-title');if (te) te.remove();
      var gl = el.querySelector('.makstv-glass');   if (gl) gl.remove();
      var img = el.querySelector('.card__img');
      if (img) {
        var orig = img.getAttribute('data-makstv-orig');
        if (orig !== null) { if (img.tagName === 'IMG') img.src = orig; else img.style.backgroundImage = orig; img.removeAttribute('data-makstv-orig'); }
        var blob = img.getAttribute('data-makstv-blob'); if (blob) { try { URL.revokeObjectURL(blob); } catch (e) {} img.removeAttribute('data-makstv-blob'); }
      }
    });
  }

  /* ─── MutationObserver ─── */
  function observeCards() {
    if (!window.MutationObserver || window.__MAKSTV_OBS__) return;
    window.__MAKSTV_OBS__ = true;
    var pending = [], flushing = false;
    function flush() {
      flushing = false;
      var nodes = pending.splice(0);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]; if (!n || n.nodeType !== 1) continue;
        if (n.classList && n.classList.contains('card')) switchCardToBackdrop(n);
        else if (n.classList && n.classList.contains('card-episode')) switchEpisodeCard(n);
        else if (n.querySelectorAll) { processCards(n); }
      }
    }
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) { var added = muts[i].addedNodes; for (var j = 0; j < added.length; j++) pending.push(added[j]); }
      if (flushing) return; flushing = true;
      setTimeout(flush, isUltra() ? 160 : 60);
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ─── Depth-blur row observer (replaces :has() for Chrome 49+) ─── */
  function initDepthBlur() {
    if (window.__MAKSTV_DEPTH_OBS__) return;
    window.__MAKSTV_DEPTH_OBS__ = true;

    function findRow(el) {
      var cur = el && el.parentNode;
      while (cur && cur !== document.body) {
        if (cur.classList && cur.classList.contains('items-line')) return cur;
        cur = cur.parentNode;
      }
      return null;
    }

    function syncRow(row) {
      if (!row) return;
      var focused = row.querySelector('.card.focus, .card.hover, .card-episode.focus, .card-episode.hover');
      if (focused) row.setAttribute('data-makstv-row-focus', '1');
      else         row.removeAttribute('data-makstv-row-focus');
    }

    /* Throttle: batch mutations into a single setTimeout(0) flush — critical for TV perf */
    var _depthTimer = null;
    var _pendingDepthRows = [];

    function flushDepthRows() {
      _depthTimer = null;
      var rows = _pendingDepthRows.splice(0);
      for (var j = 0; j < rows.length; j++) syncRow(rows[j]);
    }

    try {
      new MutationObserver(function (muts) {
        if (!depthBlurEnabled()) return;
        for (var i = 0; i < muts.length; i++) {
          var t = muts[i].target;
          if (!t || !t.classList) continue;
          var isCard = t.classList.contains('card') || t.classList.contains('card-episode');
          if (!isCard) continue;
          var row = findRow(t);
          if (row && _pendingDepthRows.indexOf(row) === -1) _pendingDepthRows.push(row);
        }
        if (_pendingDepthRows.length && !_depthTimer) {
          _depthTimer = setTimeout(flushDepthRows, 0);
        }
      }).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
    } catch (e) {}
  }

  function initGlare() {
    if (window.__MAKSTV_GLARE__ || isUltra()) return;
    window.__MAKSTV_GLARE__ = true;
    var SEL = '.card, .card-episode, .full-start-new__poster';
    var active = null, rect = null, lx = 0, ly = 0, raf = false;

    function flush() {
      raf = false; if (!active || !rect) return;
      var xp = ((lx - rect.left) / (rect.width  || 1)) * 2 - 1;
      var yp = ((ly - rect.top)  / (rect.height || 1)) * 2 - 1;
      var anim = getCardAnim(), s = active.style;
      if (anim === 'depth') {
        s.setProperty('--atv-rx', (yp * -4) + 'deg'); s.setProperty('--atv-ry', (xp * 4) + 'deg');
        s.setProperty('--atv-lx', (xp * 0.3) + 'em'); s.setProperty('--atv-ly', (yp * 0.3) + 'em');
      } else {
        s.setProperty('--gx', (lx - rect.left) + 'px'); s.setProperty('--gy', (ly - rect.top) + 'px');
        s.setProperty('--rx', (yp * -7) + 'deg'); s.setProperty('--ry', (xp * 7) + 'deg');
      }
    }

    document.body.addEventListener('mouseover', function (e) {
      if (getCardAnim() === 'off') { active = null; return; }
      active = e.target.closest ? e.target.closest(SEL) : null;
      rect = active ? active.getBoundingClientRect() : null;
    });
    document.body.addEventListener('mousemove', function (e) {
      if (!active) return; lx = e.clientX; ly = e.clientY;
      if (!raf) { raf = true; requestAnimationFrame(flush); }
    });
    document.body.addEventListener('mouseout', function (e) {
      var card = e.target.closest ? e.target.closest(SEL) : null; if (!card) return;
      if (e.relatedTarget && card.contains(e.relatedTarget)) return;
      var s = card.style;
      s.setProperty('--rx','0deg'); s.setProperty('--ry','0deg'); s.setProperty('--gx','50%'); s.setProperty('--gy','50%');
      s.removeProperty('--atv-rx'); s.removeProperty('--atv-ry'); s.removeProperty('--atv-lx'); s.removeProperty('--atv-ly');
      if (active === card) { active = null; rect = null; }
    });
    window.addEventListener('scroll', function () { if (active) rect = active.getBoundingClientRect(); }, true);
    window.addEventListener('resize', function () { if (active) rect = active.getBoundingClientRect(); });
  }

  /* ─── body attribute syncs ─── */
  var BC = KEYS.BODY_CLASS;
  function syncAll() {
    if (!document.body) return;
    document.body.setAttribute(KEYS.CARD_ANIM_ATTR,         isUltra() ? 'off' : getCardAnim());
    document.body.setAttribute(KEYS.CARD_SIZE_ATTR,         getCardSize());
    document.body.setAttribute(KEYS.LOGO_SIZE_ATTR,         getLogoSize());
    document.body.setAttribute(KEYS.BACKDROP_ATTR,          backdropEnabled() ? 'on' : 'off');
    document.body.setAttribute(KEYS.BADGE_ATTR,             badgeEnabled()    ? 'on' : 'off');
    document.body.setAttribute(KEYS.RATING_ATTR,            ratingEnabled()   ? 'on' : 'off');
    document.body.setAttribute(KEYS.RATING_STYLE_ATTR,      getRatingStyle());
    document.body.setAttribute(KEYS.CARD_IMAGE_MODE_ATTR,   getCardImageMode());
    document.body.setAttribute(KEYS.OVERLAY_ALIGN_ATTR,     getOverlayAlign());
    document.body.setAttribute(KEYS.FOCUS_LEVEL_ATTR,       String(getFocusLevel()));
    document.body.setAttribute(KEYS.PERF_ATTR,              resolvePerf());
    document.body.setAttribute(KEYS.GLASS_ATTR,             glassEnabled()      ? 'on' : 'off');
    document.body.setAttribute(KEYS.DEPTH_BLUR_ATTR,        depthBlurEnabled()  ? 'on' : 'off');
    document.body.setAttribute(KEYS.COLOR_SYNC_ATTR,        colorSyncEnabled()  ? 'on' : 'off');
    /* --sc: scale for tilt-mode CSS var (matches current focus level) */
    document.body.style.setProperty('--sc', FOCUS_SCALE[getFocusLevel() - 1]);
    applyColorSync();
  }

  /* ─── CSS ─── */
  var FOCUS_SCALE  = ['1.03','1.05','1.07','1.09','1.11','1.14','1.18'];
  /* Glow cascade: --card-glow (dominant color from poster) → --color-sync-rgb (Colors plugin) → 0,0,0 */
  var FOCUS_SHADOW = [
    '0 6px 18px rgba(var(--card-glow,var(--color-sync-rgb,0,0,0)),.42)',
    '0 8px 24px rgba(var(--card-glow,var(--color-sync-rgb,0,0,0)),.48)',
    '0 10px 30px rgba(var(--card-glow,var(--color-sync-rgb,0,0,0)),.54)',
    '0 14px 36px rgba(var(--card-glow,var(--color-sync-rgb,0,0,0)),.58)',
    '0 16px 44px rgba(var(--card-glow,var(--color-sync-rgb,0,0,0)),.62), 0 0 24px rgba(var(--card-glow,var(--color-sync-rgb,0,0,0)),.22)',
    '0 20px 54px rgba(var(--card-glow,var(--color-sync-rgb,0,0,0)),.66), 0 0 36px rgba(var(--card-glow,var(--color-sync-rgb,0,0,0)),.28)',
    '0 24px 64px rgba(var(--card-glow,var(--color-sync-rgb,0,0,0)),.72), 0 0 52px rgba(var(--card-glow,var(--color-sync-rgb,0,0,0)),.36)'
  ];

  function focusLevelCss(level) {
    var rules = [];
    for (var i = 1; i <= 7; i++) {
      var sc = FOCUS_SCALE[i - 1], sh = FOCUS_SHADOW[i - 1];
      var sel = 'body.' + BC + '[' + KEYS.FOCUS_LEVEL_ATTR + '="' + i + '"] .card.focus, ' +
                'body.' + BC + '[' + KEYS.FOCUS_LEVEL_ATTR + '="' + i + '"] .card.hover, ' +
                'body.' + BC + '[' + KEYS.FOCUS_LEVEL_ATTR + '="' + i + '"] .card-episode.focus, ' +
                'body.' + BC + '[' + KEYS.FOCUS_LEVEL_ATTR + '="' + i + '"] .card-episode.hover';
      rules.push(sel + ' { transform:scale(' + sc + ') !important; box-shadow:' + sh + ' !important; z-index:4 !important; position:relative !important; }');
    }
    return rules.join('\n');
  }

  function buildCss() {
    var B = 'body.' + BC;
    var CA = KEYS.CARD_ANIM_ATTR, FS = KEYS.FOCUS_LEVEL_ATTR, PA = KEYS.PERF_ATTR;
    var BA = KEYS.BACKDROP_ATTR, BGa = KEYS.BADGE_ATTR, RA = KEYS.RATING_ATTR, RSA = KEYS.RATING_STYLE_ATTR;
    var IMA = KEYS.CARD_IMAGE_MODE_ATTR, CSA = KEYS.CARD_SIZE_ATTR, LSA = KEYS.LOGO_SIZE_ATTR, OA = KEYS.OVERLAY_ALIGN_ATTR;

    return [
      /* ── Hide native Lampa card labels / rating ── */
      B + ' .card__title, ' + B + ' .card__bottom, ' + B + ' .card__age { display:none !important; }',
      B + ' .card__vote, ' + B + ' .card__quality, ' + B + ' .card__type, ' + B + ' .card__promo-text, ' + B + ' .card__promo-title { display:none !important; }',
      B + ' .nfx-card-overlay__match { display:none !important; }',

      /* Base card reset — Apple-style radius */
      B + ' .card { transition: transform .26s cubic-bezier(.22,.61,.36,1), box-shadow .26s ease !important; will-change: transform; border-radius: 1.05em !important; overflow: hidden !important; }',
      B + ' .card::before, ' + B + ' .card::after { display:none !important; content:none !important; }',
      B + ' .card-episode { transition: transform .26s cubic-bezier(.22,.61,.36,1), box-shadow .26s ease !important; border-radius:1.05em !important; overflow:hidden !important; }',

      /* Focus levels */
      focusLevelCss(),

      /* Low-perf: no transition */
      B + '[' + PA + '="ultra"] .card, ' + B + '[' + PA + '="ultra"] .card-episode { transition:none !important; will-change:auto !important; }',
      B + '[' + PA + '="ultra"] .card.focus, ' + B + '[' + PA + '="ultra"] .card.hover, ' + B + '[' + PA + '="ultra"] .card-episode.focus, ' + B + '[' + PA + '="ultra"] .card-episode.hover { transform:none !important; box-shadow:none !important; background:rgba(255,255,255,.12) !important; }',

      /* Card size */
      B + '[' + CSA + '="xs"] .items-line .card { width:9em !important; }',
      B + '[' + CSA + '="sm"] .items-line .card { width:11em !important; }',
      B + '[' + CSA + '="md"] .items-line .card { width:14em !important; }',
      B + '[' + CSA + '="lg"] .items-line .card { width:17em !important; }',
      B + '[' + CSA + '="xl"] .items-line .card { width:20em !important; }',

      /* Tilt animation vars */
      B + '[' + CA + '="tilt"] .card, ' + B + '[' + CA + '="tilt"] .card-episode, ' + B + '[' + CA + '="tilt"] .full-start-new__poster { transform-style:preserve-3d; }',
      B + '[' + CA + '="tilt"] .card.focus, ' + B + '[' + CA + '="tilt"] .card.hover, ' + B + '[' + CA + '="tilt"] .card-episode.focus, ' + B + '[' + CA + '="tilt"] .card-episode.hover { transform:perspective(800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--sc,1.07)) !important; }',
      B + '[' + CA + '="depth"] .card, ' + B + '[' + CA + '="depth"] .card-episode { transform-style:preserve-3d; }',
      B + '[' + CA + '="depth"] .card.focus, ' + B + '[' + CA + '="depth"] .card.hover, ' + B + '[' + CA + '="depth"] .card-episode.focus, ' + B + '[' + CA + '="depth"] .card-episode.hover { transform:perspective(800px) rotateX(var(--atv-rx,0deg)) rotateY(var(--atv-ry,0deg)) scale(1.07) !important; }',

      /* ── Glare overlay (tilt mode) ── */
      B + '.' + KEYS.STYLE_ID.replace('appletv-makstv-style','') + 'glare .card .card__view::after, ' +
      B + '.makstv-glare .card .card__view::after, ' +
      B + '.makstv-glare .card-episode .card__view::after { content:""; position:absolute; top:0; right:0; bottom:0; left:0; pointer-events:none; border-radius:inherit; background:radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,.26) 0%, rgba(255,255,255,0) 68%); opacity:0; transition:opacity .18s ease; z-index:3; }',
      B + '.makstv-glare .card.focus .card__view::after, ' + B + '.makstv-glare .card.hover .card__view::after, ' +
      B + '.makstv-glare .card-episode.focus .card__view::after, ' + B + '.makstv-glare .card-episode.hover .card__view::after { opacity:1; }',

      /* ── Poster image improvements ── */
      B + ' .card__img { transition:filter .3s ease, transform .3s ease; border-radius:inherit !important; filter:brightness(.88) saturate(1.05); }',
      B + ' .card.focus .card__img, ' + B + ' .card.hover .card__img, ' + B + ' .card-episode.focus .card__img, ' + B + ' .card-episode.hover .card__img { filter:brightness(1.0) saturate(1.12) contrast(1.03) !important; }',
      B + '[' + PA + '="ultra"] .card__img { transition:none !important; }',

      /* ── Card view base ── */
      B + ' .card__view { border-radius:inherit !important; overflow:hidden !important; }',

      /* ── Overlay: title + meta ── */
      B + ' .makstv-overlay { position:absolute; top:auto; right:0; bottom:0; left:0; padding:.55em .65em .5em; background:linear-gradient(to top, rgba(0,0,0,.82) 0%, rgba(0,0,0,.55) 55%, transparent 100%); z-index:2; pointer-events:none; display:-webkit-box; display:-webkit-flex; display:flex; -webkit-box-orient:vertical; -webkit-box-direction:normal; -webkit-flex-direction:column; flex-direction:column; }',
      /* flex gap polyfill via margin */
      B + ' .makstv-overlay > * { margin-bottom:.2em; }',
      B + ' .makstv-overlay > *:last-child { margin-bottom:0; }',
      B + '[' + OA + '="center"] .makstv-overlay { align-items:center; text-align:center; }',
      B + '[' + OA + '="end"]    .makstv-overlay { align-items:flex-end; text-align:right; }',
      B + '[' + OA + '="start"]  .makstv-overlay { align-items:flex-start; text-align:left; }',

      /* Title text */
      B + ' .makstv-overlay__title { font-size:.82em; font-weight:700; color:#fff; line-height:1.2; text-shadow:0 1px 6px rgba(0,0,0,.7); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }',

      /* Logo image */
      B + ' .makstv-overlay__logo { display:block; max-height:2.2em; max-width:var(--logo-max,70%); object-fit:contain; filter:drop-shadow(0 1px 6px rgba(0,0,0,.7)); transition:max-height .2s ease; }',
      B + '[' + LSA + '="xs"] .makstv-overlay__logo { max-width:38% !important; }',
      B + '[' + LSA + '="sm"] .makstv-overlay__logo { max-width:52% !important; }',
      B + '[' + LSA + '="md"] .makstv-overlay__logo { max-width:68% !important; }',
      B + '[' + LSA + '="lg"] .makstv-overlay__logo { max-width:82% !important; }',
      B + '[' + LSA + '="xl"] .makstv-overlay__logo { max-width:95% !important; }',

      /* Local title fallback */
      B + ' .makstv-overlay__local-title { font-size:.72em; color:rgba(255,255,255,.78); font-weight:600; text-shadow:0 1px 4px rgba(0,0,0,.6); }',

      /* Meta row */
      B + ' .makstv-overlay__meta { display:-webkit-box; display:-webkit-flex; display:flex; -webkit-flex-wrap:wrap; flex-wrap:wrap; font-size:.7em; color:rgba(255,255,255,.78); font-weight:600; line-height:1.2; }',
      /* gap polyfill for meta row */
      B + ' .makstv-overlay__meta > * { margin-right:.2em; margin-bottom:.15em; }',
      B + ' .makstv-overlay__match { color:#4cdf7a; font-weight:700; }',
      B + ' .makstv-overlay__dot { opacity:.45; }',

      /* ── Badge ── */
      B + ' .makstv-badge { position:absolute; top:.45em; left:.45em; background:rgba(0,0,0,.72); border:1px solid rgba(255,255,255,.22); color:#fff; font-size:.6em; font-weight:800; letter-spacing:.06em; padding:.2em .5em; border-radius:.4em; z-index:3; pointer-events:none; text-transform:uppercase; transition:opacity .2s; }',
      B + '[' + BGa + '="off"] .makstv-badge { display:none !important; }',

      /* ── Rating ── */
      B + ' .makstv-rating { position:absolute; top:.45em; right:.45em; min-width:1.8em; text-align:center; padding:.18em .46em; border-radius:.45em; font-size:.7em; font-weight:800; z-index:3; pointer-events:none; border:1px solid rgba(255,255,255,.15); }',
      /* Color style */
      B + '[' + RSA + '="color"] .makstv-rating[data-score="1"], ' + B + '[' + RSA + '="color"] .makstv-rating[data-score="2"], ' + B + '[' + RSA + '="color"] .makstv-rating[data-score="3"] { background:rgba(200,50,50,.75); color:#fff; }',
      B + '[' + RSA + '="color"] .makstv-rating[data-score="4"], ' + B + '[' + RSA + '="color"] .makstv-rating[data-score="5"] { background:rgba(210,130,0,.8); color:#fff; }',
      B + '[' + RSA + '="color"] .makstv-rating[data-score="6"], ' + B + '[' + RSA + '="color"] .makstv-rating[data-score="7"] { background:rgba(60,170,60,.78); color:#fff; }',
      B + '[' + RSA + '="color"] .makstv-rating[data-score="8"], ' + B + '[' + RSA + '="color"] .makstv-rating[data-score="9"], ' + B + '[' + RSA + '="color"] .makstv-rating[data-score="10"] { background:rgba(30,140,220,.82); color:#fff; }',
      /* Mono style */
      B + '[' + RSA + '="mono"] .makstv-rating { background:rgba(0,0,0,.62); color:#fff; }',
      B + '[' + RA + '="off"] .makstv-rating { display:none !important; }',

      /* ── Episode logo/title ── */
      B + ' .makstv-ep-logo { display:block; max-height:1.8em; max-width:60%; object-fit:contain; filter:drop-shadow(0 1px 5px rgba(0,0,0,.65)); margin-bottom:.2em; }',
      B + ' .makstv-ep-title { font-size:.8em; font-weight:700; color:#fff; text-shadow:0 1px 5px rgba(0,0,0,.65); margin-bottom:.2em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }',

      /* ──────────────────────────────────────────────────────────────
         LIQUID GLASS — Apple visionOS style
         ────────────────────────────────────────────────────────────── */

      /* Keyframe for shimmer sweep */
      '@keyframes makstv-shimmer { 0% { transform:translateX(-130%) skewX(-14deg); opacity:0; } 15% { opacity:1; } 85% { opacity:1; } 100% { transform:translateX(230%) skewX(-14deg); opacity:0; } }',

      /* Glass bezel container — full-bleed over the card surface */
      B + ' .makstv-glass { position:absolute; top:0; right:0; bottom:0; left:0; border-radius:inherit; pointer-events:none; z-index:7; overflow:hidden; ' +
        'border:1px solid rgba(255,255,255,.22); ' +
        /* Top specular highlight edge */
        'box-shadow:' +
          'inset 0 1.5px 0 rgba(255,255,255,.70),' +   /* top bright line */
          'inset 0 -1px 0 rgba(0,0,0,.30),' +           /* bottom dark edge */
          'inset 1px 0 rgba(255,255,255,.10),' +        /* left soft catch-light */
          'inset -1px 0 rgba(255,255,255,.06);' +       /* right soft catch-light */
        /* Frosted surface gradient — bright top-left corner fading out */
        'background:linear-gradient(150deg,' +
          'rgba(255,255,255,.20) 0%,' +
          'rgba(255,255,255,.08) 22%,' +
          'rgba(255,255,255,.02) 50%,' +
          'rgba(0,0,0,.05) 80%,' +
          'rgba(0,0,0,.12) 100%);' +
        'opacity:0; transition:opacity .28s ease; }',

      /* Show glass on hover/focus */
      B + '[' + KEYS.GLASS_ATTR + '="on"] .card.focus .makstv-glass, ' +
      B + '[' + KEYS.GLASS_ATTR + '="on"] .card.hover .makstv-glass, ' +
      B + '[' + KEYS.GLASS_ATTR + '="on"] .card-episode.focus .makstv-glass, ' +
      B + '[' + KEYS.GLASS_ATTR + '="on"] .card-episode.hover .makstv-glass { opacity:1; }',

      /* Always show a faint glass edge at rest */
      B + '[' + KEYS.GLASS_ATTR + '="on"] .card .makstv-glass, ' +
      B + '[' + KEYS.GLASS_ATTR + '="on"] .card-episode .makstv-glass { opacity:.35; }',

      /* Shimmer sweep element inside glass */
      B + ' .makstv-shimmer { position:absolute; top:0; bottom:0; left:0; width:40%; pointer-events:none; z-index:1; ' +
        'background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.26) 50%,transparent 100%); ' +
        'transform:translateX(-130%) skewX(-14deg); border-radius:inherit; }',

      /* Trigger shimmer animation on focus/hover — disabled on low/ultra perf */
      B + '[' + KEYS.GLASS_ATTR + '="on"][' + PA + '="high"] .card.focus .makstv-shimmer, ' +
      B + '[' + KEYS.GLASS_ATTR + '="on"][' + PA + '="high"] .card.hover .makstv-shimmer, ' +
      B + '[' + KEYS.GLASS_ATTR + '="on"][' + PA + '="high"] .card-episode.focus .makstv-shimmer, ' +
      B + '[' + KEYS.GLASS_ATTR + '="on"][' + PA + '="high"] .card-episode.hover .makstv-shimmer { animation:makstv-shimmer .75s cubic-bezier(.4,0,.2,1) both; }',

      /* Hide glass bezel when feature is off */
      B + '[' + KEYS.GLASS_ATTR + '="off"] .makstv-glass { display:none !important; }',

      /* ── Depth of field — siblings recede when one card has focus ── */
      /* Implemented via JS MutationObserver (data-makstv-row-focus attr on the row).
         Works in Chrome 49+ — no :has() needed. */
      /* Full effect: high perf */
      B + '[' + KEYS.DEPTH_BLUR_ATTR + '="on"][' + PA + '="high"] .items-line[data-makstv-row-focus="1"] .card:not(.focus):not(.hover), ' +
      B + '[' + KEYS.DEPTH_BLUR_ATTR + '="on"][' + PA + '="high"] .items-line[data-makstv-row-focus="1"] .card-episode:not(.focus):not(.hover) { -webkit-filter:blur(.6px) brightness(.78) saturate(.85) !important; filter:blur(.6px) brightness(.78) saturate(.85) !important; -webkit-transform:scale(.96) !important; transform:scale(.96) !important; transition:-webkit-filter .26s ease, filter .26s ease, -webkit-transform .26s ease, transform .26s ease !important; }',
      /* Low perf: no blur (expensive), only dim — works on Android TV 9 without GPU stutter */
      B + '[' + KEYS.DEPTH_BLUR_ATTR + '="on"][' + PA + '="low"] .items-line[data-makstv-row-focus="1"] .card:not(.focus):not(.hover), ' +
      B + '[' + KEYS.DEPTH_BLUR_ATTR + '="on"][' + PA + '="low"] .items-line[data-makstv-row-focus="1"] .card-episode:not(.focus):not(.hover) { opacity:.62 !important; transition:opacity .22s ease !important; }',

      /* ── Backdrop mode: show overlay, poster mode: hide overlay for portrait ── */
      /* aspect-ratio:2/3 removed — Chrome <88 doesn't support it.
         Poster-mode forcing is handled via JS padding-top hack instead. */
      B + '[' + IMA + '="poster"] .makstv-overlay { background:linear-gradient(to top, rgba(0,0,0,.68) 0%, rgba(0,0,0,.35) 45%, transparent 100%) !important; }',
      /* Poster mode padding-top hack: .card__view gets class makstv-poster-ratio */
      B + '[' + IMA + '="poster"] .card__view.makstv-poster-ratio { height:0 !important; padding-top:150% !important; position:relative !important; }',

      /* ── Focus ring frame (multi-layer border glow) ── */
      /* Base ring element — hidden by default */
      B + ' .card .card__view::before, ' + B + ' .card-episode .card__view::before { content:""; position:absolute; top:0; right:0; bottom:0; left:0; border-radius:inherit; pointer-events:none; z-index:6; opacity:0; transition:opacity .25s ease, box-shadow .25s ease; }',

      /* Level 1-2: thin clean white ring */
      B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="1"] .card.focus .card__view::before, ' + B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="1"] .card.hover .card__view::before, ' +
      B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="2"] .card.focus .card__view::before, ' + B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="2"] .card.hover .card__view::before { opacity:1; box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.65); }',

      /* Level 3-4: double ring — inner white + soft outer glow */
      B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="3"] .card.focus .card__view::before, ' + B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="3"] .card.hover .card__view::before, ' +
      B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="4"] .card.focus .card__view::before, ' + B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="4"] .card.hover .card__view::before { opacity:1; box-shadow:inset 0 0 0 2px rgba(255,255,255,.82), inset 0 0 0 4px rgba(255,255,255,.12), inset 0 1px 0 rgba(255,255,255,.9); }',

      /* Level 5: ring + top shine */
      B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="5"] .card.focus .card__view::before, ' + B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="5"] .card.hover .card__view::before { opacity:1; box-shadow:inset 0 0 0 2.5px rgba(255,255,255,.88), inset 0 0 0 5px rgba(255,255,255,.14), inset 0 1px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(255,255,255,.3); }',

      /* Level 6: ring + warm golden shimmer */
      B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="6"] .card.focus .card__view::before, ' + B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="6"] .card.hover .card__view::before { opacity:1; box-shadow:inset 0 0 0 2.5px rgba(255,235,160,.92), inset 0 0 0 5px rgba(255,215,80,.15), inset 0 1px 0 rgba(255,255,255,.95), inset 0 0 18px rgba(255,220,100,.12); }',

      /* Level 7: premium ring — bright white top, gradient sides, inner radiance */
      B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="7"] .card.focus .card__view::before, ' + B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="7"] .card.hover .card__view::before { opacity:1; box-shadow:inset 0 0 0 3px rgba(255,255,255,.96), inset 0 0 0 6px rgba(255,255,255,.18), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(200,200,255,.55), inset 0 0 28px rgba(180,200,255,.18); }',

      /* Also apply ring on episode cards */
      B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="4"] .card-episode.focus .card__view::before, ' + B + '[' + KEYS.FOCUS_LEVEL_ATTR + '="4"] .card-episode.hover .card__view::before { opacity:1; box-shadow:inset 0 0 0 2px rgba(255,255,255,.82), inset 0 0 0 4px rgba(255,255,255,.12), inset 0 1px 0 rgba(255,255,255,.9); }',

      /* ── Logo scaling on focus / hover ── */
      B + ' .card.focus .makstv-overlay__logo, ' +
      B + ' .card.hover .makstv-overlay__logo, ' +
      B + ' .card-episode.focus .makstv-overlay__logo, ' +
      B + ' .card-episode.hover .makstv-overlay__logo { max-height:2.8em !important; max-width:80% !important; }',

      /* ── Colors-plugin sync: tint focus ring with --main-color ── */
      /* --main-color is set on :root by the Colors plugin */
      B + '[' + KEYS.COLOR_SYNC_ATTR + '="on"] .card.focus .card__view::before, ' +
      B + '[' + KEYS.COLOR_SYNC_ATTR + '="on"] .card.hover .card__view::before, ' +
      B + '[' + KEYS.COLOR_SYNC_ATTR + '="on"] .card-episode.focus .card__view::before, ' +
      B + '[' + KEYS.COLOR_SYNC_ATTR + '="on"] .card-episode.hover .card__view::before { ' +
        'box-shadow:inset 0 0 0 2px var(--main-color,rgba(255,255,255,.82)), ' +
                   'inset 0 0 0 5px rgba(var(--main-color-rgb,255,255,255),.15), ' +
                   'inset 0 1px 0 rgba(255,255,255,.9) !important; ' +
        'opacity:1 !important; }',

      /* Tint glass bezel edge with main color when synced */
      B + '[' + KEYS.COLOR_SYNC_ATTR + '="on"] .card.focus .makstv-glass, ' +
      B + '[' + KEYS.COLOR_SYNC_ATTR + '="on"] .card.hover .makstv-glass, ' +
      B + '[' + KEYS.COLOR_SYNC_ATTR + '="on"] .card-episode.focus .makstv-glass, ' +
      B + '[' + KEYS.COLOR_SYNC_ATTR + '="on"] .card-episode.hover .makstv-glass { ' +
        'border-color:rgba(var(--main-color-rgb,255,255,255),.4) !important; }',

      /* ── Settings panel tweaks ── */
      B + ' .settings-param.focus, ' + B + ' .settings-param.hover, ' + B + ' .settings-folder.focus, ' + B + ' .settings-folder.hover { background:rgba(255,255,255,.12) !important; outline:none !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.14), 0 6px 18px rgba(0,0,0,.28) !important; }',

      /* About badge */
      B + ' .makstv-settings-about { font-size:.78em; opacity:.55; padding:.3em 0 0; }'
    ].join('\n');
  }

  var _styleSignature = '';
  function injectStyle() {
    if (!document.head && !document.body) return;
    var existing = document.getElementById(KEYS.STYLE_ID);
    if (existing && _styleSignature === KEYS.STYLE_ID) return;
    var style = existing || document.createElement('style');
    style.id = KEYS.STYLE_ID;
    var text = buildCss();
    if (style.textContent !== text) style.textContent = text;
    if (!style.parentNode) (document.head || document.body).appendChild(style);
    _styleSignature = KEYS.STYLE_ID;
  }

  /* ─── Settings registration ─── */
  function resetSettings() {
    var keys = [KEYS.ENABLE_KEY,KEYS.BACKDROP_KEY,KEYS.BADGE_KEY,KEYS.RATING_KEY,KEYS.RATING_STYLE_KEY,
                KEYS.CARD_ANIM_KEY,KEYS.FOCUS_LEVEL_KEY,KEYS.CARD_SIZE_KEY,KEYS.LOGO_SIZE_KEY,
                KEYS.POSTER_QUALITY_KEY,KEYS.CARD_IMAGE_MODE_KEY,KEYS.LOGO_LANG_KEY,KEYS.LOGO_TITLE_KEY,
                KEYS.OVERLAY_ALIGN_KEY,KEYS.PERF_MODE_KEY,KEYS.CACHE_SIZE_KEY,
                KEYS.GLASS_KEY,KEYS.DEPTH_BLUR_KEY,KEYS.COLOR_SYNC_KEY];
    keys.forEach(function (k) { try { Lampa.Storage.set(k, null); } catch (e) {} });
    clearAllCaches();
    logoCache = {}; posterCache = {}; backdropCache = {};
    try { Lampa.Noty.show(t('set_reset_done')); } catch (e) {}
    resetCardSwitches(); scheduleAll();
  }

  function registerSettings() {
    try {
      if (!window.Lampa || !Lampa.SettingsApi) return;
      var S = KEYS.SETTINGS_COMPONENT;
      var api = Lampa.SettingsApi;

      api.addComponent({ component: S, name: t('set_main_title'), icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="7" height="9" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="14" y="5" width="7" height="9" rx="1.5" stroke="currentColor" stroke-width="1.8"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' });

      function add(param, field, onChange) { api.addParam({ component: S, param: param, field: field, onChange: onChange }); }
      function title(name) { add({ type:'title' }, { name: name }); }

      /* About */
      add({ type:'title' }, { name: t('set_main_title') + ' <span style="opacity:.45;font-size:.82em">by ' + PLUGIN_AUTHOR + ' v' + PLUGIN_VERSION + '</span>' });

      add({ name: KEYS.ENABLE_KEY, type:'select', values:{ on:t('val_on'), off:t('val_off') }, default:'on' },
          { name: t('set_enable_name'), description: t('set_enable_desc') },
          function (v) { if (v === 'off') removePluginUi(); else { scheduleAll(); } });

      /* Cards section */
      title(t('set_section_cards'));

      add({ name: KEYS.BACKDROP_KEY, type:'select', values:{ on:t('val_on'), off:t('val_off') }, default:'on' },
          { name: t('set_backdrop_name'), description: t('set_backdrop_desc') },
          function () { syncAll(); resetCardSwitches(); scheduleAll(); });

      add({ name: KEYS.CARD_IMAGE_MODE_KEY, type:'select', values:{ backdrop:t('val_card_image_backdrop'), poster:t('val_card_image_poster') }, default:'backdrop' },
          { name: t('set_card_image_mode_name'), description: t('set_card_image_mode_desc') },
          function () { logoCache={}; posterCache={}; backdropCache={}; clearAllCaches(); syncAll(); resetCardSwitches(); scheduleAll(); });

      add({ name: KEYS.CARD_SIZE_KEY, type:'select', values:{ xs:t('val_size_xs'),sm:t('val_size_sm'),md:t('val_size_md'),lg:t('val_size_lg'),xl:t('val_size_xl') }, default:'md' },
          { name: t('set_card_size_name'), description: t('set_card_size_desc') },
          function () { syncAll(); });

      add({ name: KEYS.BADGE_KEY, type:'select', values:{ on:t('val_on'), off:t('val_off') }, default:'on' },
          { name: t('set_badge_name'), description: t('set_badge_desc') },
          function () { syncAll(); if (badgeEnabled()) { resetCardSwitches(); scheduleAll(); } });

      add({ name: KEYS.RATING_KEY, type:'select', values:{ on:t('val_on'), off:t('val_off') }, default:'off' },
          { name: t('set_rating_name'), description: t('set_rating_desc') },
          function () { syncAll(); if (ratingEnabled()) { resetCardSwitches(); scheduleAll(); } });

      add({ name: KEYS.RATING_STYLE_KEY, type:'select', values:{ color:t('val_rating_color'), mono:t('val_rating_mono') }, default:'color' },
          { name: t('set_rating_style_name'), description: t('set_rating_style_desc') },
          function () { syncAll(); });

      add({ name: KEYS.OVERLAY_ALIGN_KEY, type:'select', values:{ start:t('val_overlay_align_start'),center:t('val_overlay_align_center'),end:t('val_overlay_align_end') }, default:'start' },
          { name: t('set_overlay_align_name'), description: t('set_overlay_align_desc') },
          function () { syncAll(); });

      add({ name: KEYS.CARD_ANIM_KEY, type:'select', values:{ off:t('val_card_anim_off'), tilt:t('val_card_anim_tilt'), depth:t('val_card_anim_depth') }, default:'tilt' },
          { name: t('set_card_anim_name'), description: t('set_card_anim_desc') },
          function () { syncAll(); });

      /* Focus level 1–7 */
      add({ name: KEYS.FOCUS_LEVEL_KEY, type:'select',
            values:{ '1':'1 — '+t('val_size_xs'),'2':'2','3':'3','4':'4 — '+t('val_size_md'),'5':'5','6':'6','7':'7 — '+t('val_size_xl') },
            default:'4' },
          { name: t('set_focus_level_name'), description: t('set_focus_level_desc') },
          function () { syncAll(); });

      add({ name: KEYS.GLASS_KEY, type:'select', values:{ on:t('val_on'), off:t('val_off') }, default:'on' },
          { name: t('set_glass_name'), description: t('set_glass_desc') },
          function () { syncAll(); resetCardSwitches(); scheduleAll(); });

      add({ name: KEYS.DEPTH_BLUR_KEY, type:'select', values:{ on:t('val_on'), off:t('val_off') }, default:'on' },
          { name: t('set_depth_blur_name'), description: t('set_depth_blur_desc') },
          function () { syncAll(); });

      add({ name: KEYS.COLOR_SYNC_KEY, type:'select', values:{ on:t('val_on'), off:t('val_off') }, default:'on' },
          { name: t('set_color_sync_name'), description: t('set_color_sync_desc') },
          function () { syncAll(); });

      /* Logos & Posters section */
      title(t('set_section_logos'));

      add({ name: KEYS.LOGO_LANG_KEY, type:'select', values:{ auto:t('val_auto'), ru:'Русский', en:'English' }, default:'auto' },
          { name: t('set_logo_lang_name'), description: t('set_logo_lang_desc') },
          function () { logoCache={}; backdropCache={}; clearAllCaches(); scheduleAll(); });

      add({ name: KEYS.LOGO_TITLE_KEY, type:'select', values:{ off:t('val_logo_title_off'), below:t('val_logo_title_below'), above:t('val_logo_title_above') }, default:'off' },
          { name: t('set_logo_title_name'), description: t('set_logo_title_desc') },
          function () { logoCache={}; clearAllCaches(); resetCardSwitches(); scheduleAll(); });

      add({ name: KEYS.LOGO_SIZE_KEY, type:'select', values:{ xs:t('val_size_xs'),sm:t('val_size_sm'),md:t('val_size_md'),lg:t('val_size_lg'),xl:t('val_size_xl') }, default:'md' },
          { name: t('set_logo_size_name'), description: t('set_logo_size_desc') },
          function () { syncAll(); });

      add({ name: KEYS.POSTER_QUALITY_KEY, type:'select', values:{ w185:t('val_size_xs'),w342:t('val_size_sm'),w500:t('val_size_md'),w780:t('val_size_lg'),original:t('val_size_xl') }, default:'w500' },
          { name: t('set_poster_quality_name'), description: t('set_poster_quality_desc') },
          function () { posterCache={}; clearAllCaches(); resetCardSwitches(); scheduleAll(); });

      /* Data section */
      title(t('set_section_data'));

      add({ name: KEYS.PERF_MODE_KEY, type:'select', values:{ auto:t('val_perf_auto'),high:t('val_perf_high'),low:t('val_perf_low'),ultra:t('val_perf_ultra') }, default:'auto' },
          { name: t('set_perf_mode_name'), description: t('set_perf_mode_desc') },
          function () { _detectedPerf = null; syncAll(); });

      add({ name: KEYS.CACHE_SIZE_KEY, type:'select', values:{ '50':'50 MB','100':'100 MB','200':'200 MB','500':'500 MB',unlimited:t('val_unlimited') }, default:'100' },
          { name: t('set_cache_size_name'), description: t('set_cache_size_desc') },
          function () { pruneImgCache(getCacheMax()); });

      add({ name: 'makstv_reset_btn', type:'button' },
          { name: t('set_reset_name'), description: t('set_reset_desc') },
          function () { resetSettings(); });

    } catch (e) {}
  }

  /* ─── Plugin lifecycle ─── */
  var _scheduled = false;
  var _actBound = false, _fullBound = false, _storeBound = false;

  function removePluginUi() {
    try {
      if (document.body) {
        document.body.classList.remove(KEYS.BODY_CLASS);
        document.body.classList.remove('makstv-glare');
        [KEYS.CARD_ANIM_ATTR,KEYS.CARD_SIZE_ATTR,KEYS.LOGO_SIZE_ATTR,KEYS.BACKDROP_ATTR,
         KEYS.BADGE_ATTR,KEYS.RATING_ATTR,KEYS.RATING_STYLE_ATTR,KEYS.CARD_IMAGE_MODE_ATTR,
         KEYS.OVERLAY_ALIGN_ATTR,KEYS.FOCUS_LEVEL_ATTR,KEYS.PERF_ATTR].forEach(function (a) { document.body.removeAttribute(a); });
      }
      var s = document.getElementById(KEYS.STYLE_ID); if (s) s.remove(); _styleSignature = '';
      resetCardSwitches();
    } catch (e) {}
  }

  function safePatch() {
    _scheduled = false;
    if (!pluginEnabled()) { removePluginUi(); return; }
    injectStyle();
    if (document.body) {
      document.body.classList.add(KEYS.BODY_CLASS);
      if (getCardAnim() !== 'off' && !isUltra()) document.body.classList.add('makstv-glare');
      else document.body.classList.remove('makstv-glare');
    }
    syncAll();
    var content = document.querySelector('.activity--active .scroll__content') || document.querySelector('.scroll__content');
    if (content) processCards(content);
  }

  function scheduleAll() {
    if (_scheduled) return; _scheduled = true;
    setTimeout(safePatch, 120);
  }

  function bindListeners() {
    if (!window.Lampa || !Lampa.Listener || !Lampa.Storage || !Lampa.Storage.listener) return;

    if (!_actBound) {
      _actBound = true;
      Lampa.Listener.follow('activity', function (e) {
        if (!pluginEnabled()) return;
        if (e.type === 'start' || e.type === 'activity') {
          setTimeout(function () {
            try {
              var render = e.object && e.object.activity ? e.object.activity.render() : null;
              if (render && render.length) processCards(render[0] || render.find('.activity__body')[0]);
            } catch (err) {}
          }, 500);
          scheduleAll();
        }
      });
    }

    if (!_fullBound) {
      _fullBound = true;
      Lampa.Listener.follow('full', function (e) {
        if (!pluginEnabled()) return;
        if (e.type === 'complite') {
          try { var r = e.object.activity.render(); if (r && r.length) processCards(r[0]); } catch (err) {}
        }
      });
    }

    if (!_storeBound) {
      _storeBound = true;
      Lampa.Storage.listener.follow('change', function (e) {
        var n = e.name;
        if (n === KEYS.ENABLE_KEY) {
          if (pluginEnabled()) { startPlugin(); scheduleAll(); }
          else removePluginUi();
        } else if (n === KEYS.CARD_ANIM_KEY) {
          syncAll();
        } else if (n === KEYS.LOGO_LANG_KEY) {
          logoCache={}; backdropCache={}; clearAllCaches(); scheduleAll();
        } else if ([KEYS.BACKDROP_KEY,KEYS.BADGE_KEY,KEYS.RATING_KEY,KEYS.CARD_IMAGE_MODE_KEY].indexOf(n) > -1) {
          syncAll(); resetCardSwitches(); scheduleAll();
        } else if (n === KEYS.PERF_MODE_KEY) {
          _detectedPerf = null; syncAll(); initGlare(); initDepthBlur();
        } else if (n === KEYS.COLOR_SYNC_KEY) {
          syncAll();
        } else if (n === 'lampac_theme' || n === 'lampac_interface_scene') {
          if (pluginEnabled()) scheduleAll(); else removePluginUi();
        }
        /* React to Colors plugin changes → update glow immediately */
        if (n === 'color_plugin_main_color' || n === 'color_plugin_enabled') {
          applyColorSync();
        }
      });
    }
  }

  var _detectedPerf = null; // redeclared here for correct closure (already above but fine)

  function startPlugin() {
    registerSettings();
    bindListeners();
    if (!pluginEnabled()) { removePluginUi(); return; }
    pruneImgCache(getCacheMax());
    injectStyle();
    if (document.body) {
      document.body.classList.add(KEYS.BODY_CLASS);
      if (getCardAnim() !== 'off' && !isUltra()) document.body.classList.add('makstv-glare');
    }
    syncAll();
    observeCards();
    initGlare();
    initDepthBlur();
    processCards(document.body);
    scheduleAll();
  }

  /* ─── Boot ─── */
  if (window.appready) {
    startPlugin();
  } else {
    try {
      Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });
    } catch (e) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startPlugin);
      else startPlugin();
    }
  }

})();
