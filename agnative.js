(function () {
  'use strict';

  const PLUGIN_GUARD_KEY = '__APPLETV_AGNATIVE_TOPNAV__';

  function canBootPlugin() {
    if (typeof window === 'undefined') return false;
    if (window[PLUGIN_GUARD_KEY]) return false;
    window[PLUGIN_GUARD_KEY] = true;
    return true;
  }

  const AGNATIVE_KEYS = {
    STYLE_ID: 'appletv-agnative-topnav-style',
    BODY_CLASS: 'appletv-agnative-topnav',
    CLOCK_ID: 'agnative-topnav-clock',
    TMDB_KEY: '4ef0d7355d9ffb5151e987764708ce96',
    ENABLE_KEY: 'appletv_agnative_topnav_enabled',
    GLARE_KEY: 'appletv_agnative_topnav_glare_enabled',
    TOPNAV_ITEMS_KEY: 'appletv_agnative_topnav_items',
    LOGO_LANG_KEY: 'appletv_agnative_logo_lang',
    FONT_SIZE_KEY: 'appletv_agnative_font_size',
    UI_LANG_KEY: 'appletv_agnative_ui_lang',
    BACKDROP_KEY: 'appletv_agnative_backdrop',
    BADGE_KEY: 'appletv_agnative_badge',
    RATING_KEY: 'appletv_agnative_rating',
    RATING_STYLE_KEY: 'appletv_agnative_rating_style',
    CATEGORY_SIZE_KEY: 'appletv_agnative_category_size',
    CARD_SIZE_KEY: 'appletv_agnative_card_size',
    CLOCK_SECONDS_KEY: 'appletv_agnative_clock_seconds',
    CONTROL_PANEL_KEY: 'appletv_agnative_control_panel',
    PERF_MODE_KEY: 'appletv_agnative_perf_mode',
    SETTINGS_COMPONENT: 'agnative',
    TOPNAV_SETTINGS_COMPONENT: 'agnative_topnav',
    GLARE_CLASS: 'appletv-agnative-topnav-glare',
    FONT_SIZE_ATTR: 'data-agnative-font',
    BACKDROP_ATTR: 'data-agnative-backdrop',
    BADGE_ATTR: 'data-agnative-badge',
    RATING_ATTR: 'data-agnative-rating',
    RATING_STYLE_ATTR: 'data-agnative-rating-style',
    CATEGORY_SIZE_ATTR: 'data-agnative-category',
    CARD_SIZE_ATTR: 'data-agnative-card-size',
    LOGO_SIZE_KEY: 'appletv_agnative_logo_size',
    LOGO_SIZE_ATTR: 'data-agnative-logo-size',
    CACHE_SIZE_KEY: 'appletv_agnative_cache_size',
    POSTER_QUALITY_KEY: 'appletv_agnative_poster_quality',
    PERF_ATTR: 'data-agnative-perf',
    FLEX_GAP_ATTR: 'data-agnative-flex-gap',
    OVERLAY_ALIGN_KEY: 'appletv_agnative_overlay_align',
    OVERLAY_ALIGN_ATTR: 'data-agnative-overlay-align',
    CARD_IMAGE_MODE_KEY: 'appletv_agnative_card_image_mode',
    CARD_IMAGE_MODE_ATTR: 'data-agnative-card-image-mode'
  };

  const ru = {
    nav_feed: 'Лента',
    badge_movie: 'ФИЛЬМ', badge_tv: 'СЕРИАЛ',
    set_about_desc: 'Версия 0.3.14  Авторы: llowmikee, nrsua, gwynnbleiidd, arabianq, ang3el7z',
    set_main_title: 'Основные настройки',
    set_enable_name: 'AppleTV AgNative',
    set_enable_desc: 'Включает и выключает плагин',
    set_glare_name: 'Наклон veoveo.ru', set_glare_desc: 'от arabian_q',
    set_topnav_name: 'Пункты Topnav', set_topnav_desc: 'Меню вверху страницы',
    set_topnav_title: 'Пункты верхнего меню',
    set_topnav_item_desc: 'Пункт menu_list: ',
    set_logo_lang_name: 'Язык логотипов',
    set_logo_lang_desc: 'Если логотипа на выбранном языке нет, используется английский',
    set_font_size_name: 'Размер шрифта',
    set_font_size_desc: 'Масштаб текста',
    set_ui_lang_desc: 'Язык плагина',
    val_on: 'Включить', val_off: 'Выключить',
    val_hide: 'Скрыть',
    val_auto: 'Автоматически',
    val_size_xs: 'Мелкий', val_size_sm: 'Маленький',
    val_size_md: 'Обычный', val_size_lg: 'Крупный', val_size_xl: 'Огромный',
    val_rating_color: 'Цветной', val_rating_mono: 'Монохромный',
    set_backdrop_name: 'Горизонтальные карточки медиаконтента',
    set_backdrop_desc: 'Если опция включена отображаются горизонтальные карточки, если выключена то вертикальные',
    set_badge_name: 'Бейдж «Фильм/Сериал»',
    set_badge_desc: 'Бейдж в левом верхнем углу карточки',
    set_rating_desc: 'Показывать оценку в правом верхнем углу карточки',
    set_rating_style_name: 'Стиль рейтинга TMDB',
    set_rating_style_desc: 'Цветной или монохромный вид стиль рейтинга tmdb',
    set_reset_name: 'Сбросить настройки',
    set_reset_desc: 'Вернуть все параметры плагина к значениям по умолчанию',
    set_reset_done: 'Настройки AppleTV AgNative сброшены',
    set_category_size_name: 'Размер названий категорий',
    set_category_size_desc: 'Заголовки полок (Популярное, Новинки и т.д.)',
    set_card_size_name: 'Размер карточек',
    set_card_size_desc: 'Ширина карточек в лентах',
    set_logo_size_name: 'Размер логотипа фильма',
    set_logo_size_desc: 'Максимальная ширина логотипа на карточке относительно карточки медиаконтента',
    set_clock_seconds_name: 'Секунды в часах',
    set_clock_seconds_desc: 'Показывать секунды рядом с часами в шапке',
    set_control_panel_name: 'Панель по клику на часы',
    set_control_panel_desc: 'Settings, Synchronization, Player, Cache & Data',
    set_perf_mode_name: 'Режим производительности',
    set_perf_mode_desc: 'Снижает нагрузку на слабых устройствах: отключает блюр, блики и тяжёлую анимацию',
    val_unlimited: 'Без ограничений',
    set_cache_size_name: 'Размер кеша изображений',
    set_cache_size_desc: 'Максимальный объём изображений в локальном кеше. При превышении удаляются самые старые записи',
    val_perf_auto: 'Автоматически',
    val_perf_high: 'Максимум (все эффекты)',
    val_perf_low: 'Слабое устройство',
    val_perf_ultra: 'Очень слабое устройство',
    set_poster_quality_name: 'Качество постеров',
    set_poster_quality_desc: 'Разрешение изображений постеров с TMDB',
    set_overlay_align_name: 'Выравнивание подписи карточки',
    set_overlay_align_desc: 'Горизонтальное выравнивание названия и метаданных на карточке',
    val_overlay_align_start: 'По левому краю',
    val_overlay_align_center: 'По центру',
    val_overlay_align_end: 'По правому краю',
    set_section_cards: 'Карточки',
    set_section_text: 'Текст и шрифты',
    set_section_clock: 'Часы',
    set_section_data: 'Данные',
    set_card_image_mode_name: 'Тип изображения карточки',
    set_card_image_mode_desc: 'Бекдроп + логотип или постер без логотипа',
    val_card_image_backdrop: 'Бекдроп + Логотип',
    val_card_image_poster: 'Постер'
  };

  const en = {
    nav_feed: 'Feed',
    badge_movie: 'MOVIE', badge_tv: 'TV SHOW',
    set_about_desc: 'Version 0.3.14  Authors: llowmikee, nrsua, gwynnbleiidd, arabianq, ang3el7z',
    set_main_title: 'Main settings',
    set_enable_name: 'AppleTV AgNative',
    set_enable_desc: 'Enables and disables the plugin',
    set_glare_name: 'Tilt veoveo.ru', set_glare_desc: 'by arabian_q',
    set_topnav_name: 'Topnav items', set_topnav_desc: 'Top page menu',
    set_topnav_title: 'Top navigation items',
    set_topnav_item_desc: 'menu_list item: ',
    set_logo_lang_name: 'Logo language',
    set_logo_lang_desc: 'If no logo in chosen language, English is used',
    set_font_size_name: 'Font size',
    set_font_size_desc: 'Text scale',
    set_ui_lang_desc: 'Plugin language',
    val_on: 'Enable', val_off: 'Disable',
    val_hide: 'Hide',
    val_auto: 'Auto',
    val_size_xs: 'Extra small', val_size_sm: 'Small',
    val_size_md: 'Normal', val_size_lg: 'Large', val_size_xl: 'Extra large',
    val_rating_color: 'Colored', val_rating_mono: 'Monochrome',
    set_backdrop_name: 'Landscape media cards',
    set_backdrop_desc: 'If enabled shows landscape cards, if disabled shows portrait cards',
    set_badge_name: '"Movie/TV" badge',
    set_badge_desc: 'Badge in the top-left corner of the card',
    set_rating_desc: 'Show score in the top-right corner of the card',
    set_rating_style_name: 'TMDB rating style',
    set_rating_style_desc: 'Colored or monochrome tmdb rating style',
    set_reset_name: 'Reset settings',
    set_reset_desc: 'Restore all plugin options to defaults',
    set_reset_done: 'AppleTV AgNative settings reset',
    set_category_size_name: 'Category title size',
    set_category_size_desc: 'Section titles (Popular, New, etc.)',
    set_card_size_name: 'Card size',
    set_card_size_desc: 'Card width in rows',
    set_logo_size_name: 'Movie logo size',
    set_logo_size_desc: 'Maximum logo width relative to the media card',
    set_clock_seconds_name: 'Seconds in clock',
    set_clock_seconds_desc: 'Show seconds next to the header clock',
    set_control_panel_name: 'Clock click panel',
    set_control_panel_desc: 'Settings, Synchronization, Player, Cache & Data',
    set_perf_mode_name: 'Performance mode',
    set_perf_mode_desc: 'Reduces load on weak devices: disables blur, glare and heavy animations',
    val_unlimited: 'Unlimited',
    set_cache_size_name: 'Image cache size',
    set_cache_size_desc: 'Maximum size of locally cached images. Oldest entries are removed when the limit is exceeded',
    val_perf_auto: 'Auto',
    val_perf_high: 'Maximum (all effects)',
    val_perf_low: 'Weak device',
    val_perf_ultra: 'Very weak device',
    set_poster_quality_name: 'Poster quality',
    set_poster_quality_desc: 'Resolution of poster images from TMDB',
    set_overlay_align_name: 'Card overlay alignment',
    set_overlay_align_desc: 'Horizontal alignment of title and metadata on the card',
    val_overlay_align_start: 'Left',
    val_overlay_align_center: 'Center',
    val_overlay_align_end: 'Right',
    set_section_cards: 'Cards',
    set_section_text: 'Text & Fonts',
    set_section_clock: 'Clock',
    set_section_data: 'Data',
    set_card_image_mode_name: 'Card image type',
    set_card_image_mode_desc: 'Backdrop + logo or poster without logo',
    val_card_image_backdrop: 'Backdrop + Logo',
    val_card_image_poster: 'Poster'
  };

  const uk = {
    nav_feed: 'Стрічка',
    badge_movie: 'ФІЛЬМ', badge_tv: 'СЕРІАЛ',
    set_about_desc: 'Версія 0.3.14  Автори: llowmikee, nrsua, gwynnbleiidd, arabianq, ang3el7z',
    set_main_title: 'Основні налаштування',
    set_enable_name: 'AppleTV AgNative',
    set_enable_desc: 'Вмикає та вимикає плагін',
    set_glare_name: 'Нахил veoveo.ru', set_glare_desc: 'від arabian_q',
    set_topnav_name: 'Пункти Topnav', set_topnav_desc: 'Меню вгорі сторінки',
    set_topnav_title: 'Пункти верхнього меню',
    set_topnav_item_desc: 'Пункт menu_list: ',
    set_logo_lang_name: 'Мова логотипів',
    set_logo_lang_desc: 'Якщо логотип обраною мовою відсутній, використовується англійська',
    set_font_size_name: 'Розмір шрифту',
    set_font_size_desc: 'Масштаб тексту',
    set_ui_lang_desc: 'Мова плагіна',
    val_on: 'Увімкнути', val_off: 'Вимкнути',
    val_hide: 'Приховати',
    val_auto: 'Автоматично',
    val_size_xs: 'Дрібний', val_size_sm: 'Малий',
    val_size_md: 'Звичайний', val_size_lg: 'Великий', val_size_xl: 'Величезний',
    val_rating_color: 'Кольоровий', val_rating_mono: 'Монохромний',
    set_backdrop_name: 'Горизонтальні картки медіаконтенту',
    set_backdrop_desc: 'Якщо опція увімкнена відображаються горизонтальні картки, якщо вимкнена то вертикальні',
    set_badge_name: 'Бейдж «Фільм/Серіал»',
    set_badge_desc: 'Бейдж у лівому верхньому куті картки',
    set_rating_desc: 'Показувати оцінку у правому верхньому куті картки',
    set_rating_style_name: 'Стиль рейтингу TMDB',
    set_rating_style_desc: 'Кольоровий або монохромний вигляд стилю рейтингу tmdb',
    set_reset_name: 'Скинути налаштування',
    set_reset_desc: 'Повернути всі параметри плагіна до значень за замовчуванням',
    set_reset_done: 'Налаштування AppleTV AgNative скинуто',
    set_category_size_name: 'Розмір назв категорій',
    set_category_size_desc: 'Заголовки поличок (Популярне, Новинки тощо)',
    set_card_size_name: 'Розмір карточок',
    set_card_size_desc: 'Ширина карточок у стрічках',
    set_logo_size_name: 'Розмір логотипу фільму',
    set_logo_size_desc: 'Максимальна ширина логотипу на картці відносно картки медіаконтенту',
    set_clock_seconds_name: 'Секунди в годиннику',
    set_clock_seconds_desc: 'Показувати секунди поруч із годинником у шапці',
    set_control_panel_name: 'Панель за кліком на годинник',
    set_control_panel_desc: 'Settings, Synchronization, Player, Cache & Data',
    set_perf_mode_name: 'Режим продуктивності',
    set_perf_mode_desc: 'Зменшує навантаження на слабких пристроях: вимикає блюр, відблиски й важку анімацію',
    val_unlimited: 'Без обмежень',
    set_cache_size_name: 'Розмір кешу зображень',
    set_cache_size_desc: 'Максимальний обсяг зображень у локальному кеші. При перевищенні видаляються найстаріші записи',
    val_perf_auto: 'Автоматично',
    val_perf_high: 'Максимум (всі ефекти)',
    val_perf_low: 'Слабкий пристрій',
    val_perf_ultra: 'Дуже слабкий пристрій',
    set_poster_quality_name: 'Якість постерів',
    set_poster_quality_desc: 'Роздільна здатність зображень постерів з TMDB',
    set_overlay_align_name: 'Вирівнювання підпису картки',
    set_overlay_align_desc: 'Горизонтальне вирівнювання назви та метаданих на картці',
    val_overlay_align_start: 'Ліворуч',
    val_overlay_align_center: 'По центру',
    val_overlay_align_end: 'Праворуч',
    set_section_cards: 'Картки',
    set_section_text: 'Текст і шрифти',
    set_section_clock: 'Годинник',
    set_section_data: 'Дані',
    set_card_image_mode_name: 'Тип зображення картки',
    set_card_image_mode_desc: 'Бекдроп + логотип або постер без логотипу',
    val_card_image_backdrop: 'Бекдроп + Логотип',
    val_card_image_poster: 'Постер'
  };

  const GENRE_MAP_LOCALIZED = {
    ru: {
      28: 'Боевик', 12: 'Приключения', 16: 'Мультфильм', 35: 'Комедия', 80: 'Криминал',
      99: 'Документальный', 18: 'Драма', 10751: 'Семейный', 14: 'Фэнтези', 36: 'История',
      27: 'Ужасы', 10402: 'Музыка', 9648: 'Детектив', 10749: 'Мелодрама', 878: 'Фантастика',
      10770: 'Телефильм', 53: 'Триллер', 10752: 'Военный', 37: 'Вестерн', 10759: 'Боевик',
      10762: 'Детский', 10765: 'Фантастика', 10767: 'Ток-шоу'
    },
    en: {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action',
      10762: 'Kids', 10765: 'Sci-Fi', 10767: 'Talk'
    },
    uk: {
      28: 'Бойовик', 12: 'Пригоди', 16: 'Мультфільм', 35: 'Комедія', 80: 'Кримінал',
      99: 'Документальний', 18: 'Драма', 10751: 'Сімейний', 14: 'Фентезі', 36: 'Історичний',
      27: 'Жахи', 10402: 'Музика', 9648: 'Детектив', 10749: 'Мелодрама', 878: 'Фантастика',
      10770: 'Телефільм', 53: 'Трилер', 10752: 'Воєнний', 37: 'Вестерн', 10759: 'Бойовик',
      10762: 'Дитячий', 10765: 'Фантастика', 10767: 'Ток-шоу'
    }
  };

  const I18N = { ru, en, uk };
  const I18N_CODES = Object.keys(I18N);

  function hasI18nCode(code) {
    return I18N_CODES.indexOf(code) !== -1;
  }

  function registerI18nToLampa() {
    if (!window.Lampa || !Lampa.Lang || typeof Lampa.Lang.add !== 'function') return;
    if (window.__APPLETV_AGNATIVE_I18N_REGISTERED__) return;

    var payload = {};

    I18N_CODES.forEach(function (code) {
      var dict = I18N[code] || {};
      Object.keys(dict).forEach(function (key) {
        if (!payload[key]) payload[key] = {};
        payload[key][code] = dict[key];
      });
    });

    Lampa.Lang.add(payload);
    window.__APPLETV_AGNATIVE_I18N_REGISTERED__ = true;
  }

  var DB_NAME = 'agnative-cache';
  var DB_VERSION = 1;
  var STORE_META = 'meta';
  var STORE_IMG = 'img';
  var FAILED_TTL = 24 * 60 * 60 * 1000;

  var _db = null;
  var _dbQueue = [];
  var _dbOpening = false;

  function openDB(callback) {
    if (_db) { callback(_db); return; }
    _dbQueue.push(callback);
    if (_dbOpening) return;
    _dbOpening = true;

    try {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META, { keyPath: 'key' });
        if (!db.objectStoreNames.contains(STORE_IMG)) db.createObjectStore(STORE_IMG, { keyPath: 'key' });
      };
      req.onsuccess = function (e) {
        _db = e.target.result;
        _dbOpening = false;
        var q = _dbQueue.splice(0);
        q.forEach(function (cb) { cb(_db); });
      };
      req.onerror = function () {
        _dbOpening = false;
        var q = _dbQueue.splice(0);
        q.forEach(function (cb) { cb(null); });
      };
    } catch (e) {
      _dbOpening = false;
      var q = _dbQueue.splice(0);
      q.forEach(function (cb) { cb(null); });
    }
  }

  function idbGet(store, key, callback) {
    openDB(function (db) {
      if (!db) { callback(undefined); return; }
      try {
        var req = db.transaction(store, 'readonly').objectStore(store).get(key);
        req.onsuccess = function () {
          var entry = req.result;
          if (!entry) { callback(undefined); return; }
          callback(entry.v);
        };
        req.onerror = function () { callback(undefined); };
      } catch (e) { callback(undefined); }
    });
  }

  function idbSet(store, key, value, extra) {
    openDB(function (db) {
      if (!db) return;
      try {
        var record = { key: key, v: value, t: Date.now() };
        if (extra) Object.keys(extra).forEach(function (k) { record[k] = extra[k]; });
        db.transaction(store, 'readwrite').objectStore(store).put(record);
      } catch (e) {}
    });
  }

  function idbPruneMeta() {
  }

  function idbPruneImg(maxBytes) {
    openDB(function (db) {
      if (!db) return;
      try {
        var now = Date.now();
        var surviving = [];
        db.transaction(STORE_IMG, 'readwrite').objectStore(STORE_IMG).openCursor().onsuccess = function (e) {
          var cursor = e.target.result;
          if (!cursor) {
            if (maxBytes === Infinity) return;
            var total = surviving.reduce(function (s, r) { return s + r.s; }, 0);
            if (total <= maxBytes) return;
            surviving.sort(function (a, b) { return a.t - b.t; });
            try {
              var tx2 = db.transaction(STORE_IMG, 'readwrite');
              var store2 = tx2.objectStore(STORE_IMG);
              for (var i = 0; i < surviving.length && total > maxBytes; i++) {
                store2.delete(surviving[i].key);
                total -= surviving[i].s;
              }
            } catch (e2) {}
            return;
          }
          if (cursor.value.failed && now - cursor.value.t > FAILED_TTL) {
            cursor.delete();
          } else {
            surviving.push({ key: cursor.value.key, t: cursor.value.t, s: cursor.value.s || 0 });
          }
          cursor.continue();
        };
      } catch (e) {}
    });
  }

  function metaGet(key, callback) {
    idbGet(STORE_META, key, callback);
  }

  function metaSet(key, value) {
    idbSet(STORE_META, key, value);
  }

  function prune(maxImgBytes) {
    idbPruneMeta();
    idbPruneImg(maxImgBytes === undefined ? Infinity : maxImgBytes);
  }

  function clearAll() {
    openDB(function (db) {
      if (!db) return;
      try {
        var tx = db.transaction([STORE_META, STORE_IMG], 'readwrite');
        tx.objectStore(STORE_META).clear();
        tx.objectStore(STORE_IMG).clear();
      } catch (e) {}
    });
  }

  var _fetchTried = {};

  function imgKey(url) {
    if (typeof url !== 'string') return url;
    var i = url.indexOf('/t/p/');
    if (i < 0) return url;
    var key = url.substring(i);
    var q = key.indexOf('?');
    if (q >= 0) key = key.substring(0, q);
    return key;
  }

  function getImgEntry(key, callback) {
    openDB(function (db) {
      if (!db) { callback(null); return; }
      try {
        var req = db.transaction(STORE_IMG, 'readonly').objectStore(STORE_IMG).get(key);
        req.onsuccess = function () {
          var entry = req.result;
          if (!entry) { callback(null); return; }
          if (entry.failed && Date.now() - entry.t > FAILED_TTL) { callback(null); return; }
          callback(entry);
        };
        req.onerror = function () { callback(null); };
      } catch (e) { callback(null); }
    });
  }

  function attemptStore(url, key) {
    if (_fetchTried[key]) return;
    _fetchTried[key] = true;
    fetch(url).then(function (r) {
      if (!r.ok) { idbSet(STORE_IMG, key, null, { s: 0, failed: true }); return; }
      r.blob().then(function (b) { idbSet(STORE_IMG, key, b, { s: b.size }); });
    }).catch(function () {
      idbSet(STORE_IMG, key, null, { s: 0, failed: true });
    });
  }

  function imgLoad(url, callback) {
    var key = imgKey(url);
    getImgEntry(key, function (entry) {
      if (entry && entry.v) {
        try {
          callback(URL.createObjectURL(entry.v));
          return;
        } catch (e) {}
      }
      callback(url);
      if (entry && entry.failed) {
        _fetchTried[key] = true;
        return;
      }
      attemptStore(url, key);
    });
  }

  function imgPreload(url) {
    var key = imgKey(url);
    getImgEntry(key, function (entry) {
      if (entry && (entry.v || entry.failed)) return;
      attemptStore(url, key);
    });
  }

  (function () {
    'use strict';

    if (!canBootPlugin()) return;
    registerI18nToLampa();

    var {
      STYLE_ID,
      BODY_CLASS,
      CLOCK_ID,
      TMDB_KEY,
      ENABLE_KEY,
      GLARE_KEY,
      TOPNAV_ITEMS_KEY,
      LOGO_LANG_KEY,
      FONT_SIZE_KEY,
      UI_LANG_KEY,
      BACKDROP_KEY,
      BADGE_KEY,
      RATING_KEY,
      RATING_STYLE_KEY,
      CATEGORY_SIZE_KEY,
      CARD_SIZE_KEY,
      LOGO_SIZE_KEY,
      CACHE_SIZE_KEY,
      POSTER_QUALITY_KEY,
      CLOCK_SECONDS_KEY,
      CONTROL_PANEL_KEY,
      PERF_MODE_KEY,
      SETTINGS_COMPONENT,
      TOPNAV_SETTINGS_COMPONENT,
      GLARE_CLASS,
      FONT_SIZE_ATTR,
      BACKDROP_ATTR,
      BADGE_ATTR,
      RATING_ATTR,
      RATING_STYLE_ATTR,
      CATEGORY_SIZE_ATTR,
      CARD_SIZE_ATTR,
      LOGO_SIZE_ATTR,
      PERF_ATTR,
      FLEX_GAP_ATTR,
      OVERLAY_ALIGN_KEY,
      OVERLAY_ALIGN_ATTR,
      CARD_IMAGE_MODE_KEY,
      CARD_IMAGE_MODE_ATTR
    } = AGNATIVE_KEYS;

    var scheduled = false;
    var clockTimer = null;
    var logoCache = {};
    var logoPending = {};
    var posterCache = {};
    var posterPending = {};
    var titledBackdropCache = {};
    var titledBackdropPending = {};
    var storageListenerBound = false;
    var activityListenerBound = false;
    var fullListenerBound = false;
    var topnavSettingsOpen = false;
    var perfModeDirty = false;
    var controlPanelOpen = false;
    var controlPanelPrevController = '';
    var controlPanelControllerReady = false;
    var controlPanelOutsideHandler = null;
    var controlPanelSwallowHandler = null;
    var topnavControllerReady = false;
    var menuControllerNeutralized = false;
    var activityPushPatched = false;
    var activityPushOriginal = null;
    var leftdockControllerReady = false;
    var leftdockHoverHandler = null;
    var leftdockHoverHideTimer = 0;
    var controllerTogglePatched = false;
    var controllerToggleOriginal = null;
    var menuChangesObserver = null;
    var menuListObservedNode = null;
    var menuRebuildTimer = 0;
    var swallowClickUntil = 0;
    var styleSignature = '';
    var detectedPerfLevel = null;
    var flexGapSupport = null;
    var cardPatchTimer = 0;

    function qs(sel, root) {
      return (root || document).querySelector(sel);
    }

    function qsa(sel, root) {
      return Array.prototype.slice.call((root || document).querySelectorAll(sel));
    }

    function pluginEnabled() {
      try {
        if (!window.Lampa || !Lampa.Storage) return true;
        return Lampa.Storage.get(ENABLE_KEY, 'on') !== 'off';
      } catch (e) {
        return true;
      }
    }

    function detectLampaLang() {
      try {
        if (!window.Lampa) return 'ru';
        var l = '';
        if (Lampa.Storage && Lampa.Storage.get) l = Lampa.Storage.get('language', '') || '';
        if (!l && Lampa.Lang && Lampa.Lang.selected) l = Lampa.Lang.selected();
        l = (l || '').toLowerCase();
        if (l.indexOf('uk') === 0 || l === 'ua') return 'uk';
        if (l.indexOf('en') === 0) return 'en';
        if (l.indexOf('ru') === 0 || l === 'be') return 'ru';
        return 'ru';
      } catch (e) { return 'ru'; }
    }

    function getUiLang() {
      try {
        if (!window.Lampa || !Lampa.Storage) return detectLampaLang();
        var v = Lampa.Storage.get(UI_LANG_KEY, 'auto');
        if (!v || v === 'auto') return detectLampaLang();
        if (hasI18nCode(v)) return v;
        return 'ru';
      } catch (e) { return 'ru'; }
    }

    function getLogoLang() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'ru';
        var v = Lampa.Storage.get(LOGO_LANG_KEY, 'auto');
        if (!v || v === 'auto') return detectLampaLang();
        return v;
      } catch (e) { return 'ru'; }
    }

    function getFontSize() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'md';
        return Lampa.Storage.get(FONT_SIZE_KEY, 'md') || 'md';
      } catch (e) { return 'md'; }
    }

    function getCategorySize() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'md';
        return Lampa.Storage.get(CATEGORY_SIZE_KEY, 'md') || 'md';
      } catch (e) { return 'md'; }
    }

    function getCardSize() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'md';
        return Lampa.Storage.get(CARD_SIZE_KEY, 'md') || 'md';
      } catch (e) { return 'md'; }
    }

    function getLogoSize() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'md';
        return Lampa.Storage.get(LOGO_SIZE_KEY, 'md') || 'md';
      } catch (e) { return 'md'; }
    }

    function getCacheMaxBytes() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 100 * 1024 * 1024;
        var v = Lampa.Storage.get(CACHE_SIZE_KEY, '100');
        if (v === 'unlimited') return Infinity;
        return (parseInt(v, 10) || 100) * 1024 * 1024;
      } catch (e) { return 100 * 1024 * 1024; }
    }

    function getPosterQuality() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'w500';
        var v = Lampa.Storage.get(POSTER_QUALITY_KEY, 'w500') || 'w500';
        var valid = ['w185', 'w342', 'w500', 'w780', 'original'];
        return valid.indexOf(v) > -1 ? v : 'w500';
      } catch (e) { return 'w500'; }
    }

    function getCardImageMode() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'backdrop';
        var v = Lampa.Storage.get(CARD_IMAGE_MODE_KEY, 'backdrop') || 'backdrop';
        return v === 'poster' ? 'poster' : 'backdrop';
      } catch (e) { return 'backdrop'; }
    }

    function getBackdropQuality() {
      var q = getPosterQuality();
      if (q === 'w185' || q === 'w342') return 'w300';
      if (q === 'w500') return 'w780';
      if (q === 'w780') return 'w1280';
      return 'original';
    }

    function getRatingStyle() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'color';
        var value = Lampa.Storage.get(RATING_STYLE_KEY, 'color') || 'color';
        return value === 'mono' ? 'mono' : 'color';
      } catch (e) { return 'color'; }
    }

    function storageFlagOn(key, def) {
      try {
        if (!window.Lampa || !Lampa.Storage) return def !== 'off';
        return Lampa.Storage.get(key, def) !== 'off';
      } catch (e) { return def !== 'off'; }
    }

    function backdropEnabled() { return storageFlagOn(BACKDROP_KEY, 'on'); }
    function badgeEnabled() { return storageFlagOn(BADGE_KEY, 'on'); }
    function ratingEnabled() { return storageFlagOn(RATING_KEY, 'off'); }
    function clockSecondsEnabled() { return storageFlagOn(CLOCK_SECONDS_KEY, 'off'); }
    function controlPanelEnabled() { return storageFlagOn(CONTROL_PANEL_KEY, 'off'); }

    function getPerfMode() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'auto';
        var v = Lampa.Storage.get(PERF_MODE_KEY, 'auto') || 'auto';
        if (v === 'high' || v === 'low' || v === 'ultra' || v === 'auto') return v;
        return 'auto';
      } catch (e) { return 'auto'; }
    }

    function detectPerfLevel() {
      if (detectedPerfLevel) return detectedPerfLevel;
      try {
        var nav = window.navigator || {};
        var dm = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 0;
        var hc = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 0;
        var ua = (nav.userAgent || '').toLowerCase();
        var chromeVer = 999;
        var m = ua.match(/chrome\/(\d+)/);
        if (m) chromeVer = parseInt(m[1], 10) || 999;
        var isAndroid = ua.indexOf('android') > -1;
        var isTV = ua.indexOf('tv') > -1 || ua.indexOf('webos') > -1 || ua.indexOf('tizen') > -1;

        if ((dm > 0 && dm <= 1) || chromeVer < 80 || (hc > 0 && hc <= 2)) {
          detectedPerfLevel = 'ultra';
        } else if ((dm > 0 && dm <= 2) || chromeVer < 88 || (isAndroid && hc > 0 && hc <= 4) || isTV) {
          detectedPerfLevel = 'low';
        } else {
          detectedPerfLevel = 'high';
        }
      } catch (e) { detectedPerfLevel = 'high'; }
      return detectedPerfLevel;
    }

    function resolvePerfLevel() {
      var mode = getPerfMode();
      if (mode === 'auto') return detectPerfLevel();
      return mode;
    }

    function detectFlexGapSupport() {
      if (flexGapSupport !== null) return flexGapSupport;
      try {
        if (!document.body) return true;
        var test = document.createElement('div');
        test.style.cssText = 'display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden;';
        test.appendChild(document.createElement('div'));
        test.appendChild(document.createElement('div'));
        document.body.appendChild(test);
        flexGapSupport = test.scrollHeight === 1;
        document.body.removeChild(test);
      } catch (e) { flexGapSupport = true; }
      return flexGapSupport;
    }

    function t(key) {
      try {
        if (window.Lampa && Lampa.Lang && typeof Lampa.Lang.translate === 'function') {
          registerI18nToLampa();
          return Lampa.Lang.translate(key, getUiLang());
        }
      } catch (e) { }
      return key;
    }

    function glareEnabled() {
      try {
        if (!window.Lampa || !Lampa.Storage) return true;
        return Lampa.Storage.get(GLARE_KEY, 'on') !== 'off';
      } catch (e) {
        return true;
      }
    }

    function sceneActive() {
      return true;
    }

    function removePluginUi() {
      try {
        if (document.body) {
          document.body.classList.remove(BODY_CLASS);
          document.body.classList.remove(GLARE_CLASS);
          document.body.removeAttribute(FONT_SIZE_ATTR);
          document.body.removeAttribute(CATEGORY_SIZE_ATTR);
          document.body.removeAttribute(CARD_SIZE_ATTR);
          document.body.removeAttribute(LOGO_SIZE_ATTR);
          document.body.removeAttribute(BACKDROP_ATTR);
          document.body.removeAttribute(BADGE_ATTR);
          document.body.removeAttribute(RATING_ATTR);
          document.body.removeAttribute(PERF_ATTR);
          document.body.removeAttribute(FLEX_GAP_ATTR);
          document.body.removeAttribute(CARD_IMAGE_MODE_ATTR);
        }
        var style = document.getElementById(STYLE_ID);
        if (style) style.remove();
        styleSignature = '';
        var shell = document.querySelector('.agnative-topnav-shell');
        if (shell) shell.remove();
        var dock = document.querySelector('.agnative-topnav-rightdock');
        if (dock) dock.remove();
        var clock = document.getElementById(CLOCK_ID);
        if (clock) clock.remove();
        var panel = document.querySelector('.agnative-control-panel');
        if (panel) panel.remove();
        var leftdock = document.querySelector('.agnative-leftdock');
        if (leftdock) leftdock.remove();
        disconnectMenuObserver();
        controlPanelOpen = false;
        unbindControlPanelOutsideClose();
        var headEl = document.querySelector('.head');
        if (headEl && headEl.__agnativeWheelBound) {
          headEl.removeEventListener('wheel', forwardWheelBelowTopnav, { passive: false });
          headEl.__agnativeWheelBound = false;
        }
        if (activityPushPatched && activityPushOriginal && window.Lampa && Lampa.Activity) {
          Lampa.Activity.push = activityPushOriginal;
          activityPushPatched = false;
          activityPushOriginal = null;
        }
        if (controllerTogglePatched && controllerToggleOriginal && window.Lampa && Lampa.Controller) {
          Lampa.Controller.toggle = controllerToggleOriginal;
          controllerTogglePatched = false;
          controllerToggleOriginal = null;
        }
      } catch (e) { }
    }

    function openSettingsSection(name, back) {
      if (!name || !window.Lampa || !Lampa.Settings || !Lampa.Settings.create) return;
      setTimeout(function () {
        Lampa.Settings.create(name, back ? {
          onBack: function () {
            Lampa.Settings.create(back);
          }
        } : {});
      }, 0);
    }

    function openTopnavSettingsSection() {
      if (!window.Lampa || !Lampa.Settings || !Lampa.Settings.create) return;
      topnavSettingsOpen = true;
      setTimeout(function () {
        Lampa.Settings.create(TOPNAV_SETTINGS_COMPONENT, {
          onBack: function () {
            topnavSettingsOpen = false;
            Lampa.Settings.create(SETTINGS_COMPONENT);
            setTimeout(function () { startPlugin(); }, 50);
            setTimeout(function () { schedulePatch(); }, 120);
          }
        });
      }, 0);
    }

    function getFallbackTopnavItems() {
      return [
        { action: 'main', label: langText('menu_main', t('nav_main')) },
        { action: 'movie', label: langText('menu_movies', t('nav_movie')) },
        { action: 'tv', label: langText('menu_tv', t('nav_tv')) },
        { action: 'cartoon', label: langText('menu_multmovie', t('nav_cartoon')) },
        { action: 'anime', label: langText('menu_anime', t('nav_anime')) },
        { action: 'release', label: langText('title_new', t('nav_release')) },
        { action: 'releases', label: langText('title_new', t('nav_release')) },
        { action: 'collection', label: langText('menu_collections', t('nav_collection')) },
        { action: 'collections', label: langText('menu_collections', t('nav_collection')) },
        { action: 'schedule', label: langText('menu_timeline', t('nav_schedule')) },
        { action: 'history', label: langText('menu_history', t('nav_history')) },
        { action: 'bookmarks', label: langText('menu_bookmark', t('nav_bookmarks')) },
        { action: 'notice', label: langText('title_notice', t('nav_notice')) },
        { action: 'feed', label: t('nav_feed') },
        { action: 'console', label: langText('menu_torrents', t('nav_console')) }
      ];
    }

    function getAvailableTopnavItems() {
      var defs = [];
      var seen = {};

      qsa('.menu .menu__item.selector[data-action]').forEach(function (item) {
        var action = item.getAttribute('data-action');
        if (!action || seen[action]) return;
        if (action === 'search' || action === 'settings') return;
        var label = '';
        var labelNode = qs('.menu__text, .menu__item-name, .menu__item-text', item);
        if (labelNode) label = (labelNode.textContent || '').trim();
        if (!label) label = (item.textContent || '').trim();
        if (!label) label = action;
        seen[action] = true;
        defs.push({ action: action, label: label });
      });

      getFallbackTopnavItems().forEach(function (item) {
        if (seen[item.action]) return;
        seen[item.action] = true;
        defs.push(item);
      });

      return defs;
    }

    function getStoredTopnavActions() {
      try {
        if (!window.Lampa || !Lampa.Storage) return ['main', 'movie', 'tv', 'cartoon'];
        var raw = Lampa.Storage.get(TOPNAV_ITEMS_KEY, null);
        if (raw === null || typeof raw === 'undefined') return ['main', 'movie', 'tv', 'cartoon'];
        if (typeof raw === 'string') {
          try {
            raw = JSON.parse(raw);
          } catch (e) {
            raw = raw.split(',').map(function (item) { return item.trim(); }).filter(Boolean);
          }
        }
        return Array.isArray(raw) ? raw : ['main', 'movie', 'tv', 'cartoon'];
      } catch (e) {
        return ['main', 'movie', 'tv', 'cartoon'];
      }
    }

    function setStoredTopnavActions(actions) {
      try {
        if (!window.Lampa || !Lampa.Storage) return;
        Lampa.Storage.set(TOPNAV_ITEMS_KEY, actions);
      } catch (e) { }
    }

    function syncGlareClass() {
      if (!document.body) return;
      if (glareEnabled() && pluginEnabled()) document.body.classList.add(GLARE_CLASS);
      else document.body.classList.remove(GLARE_CLASS);
    }

    function syncFontSize() {
      if (!document.body) return;
      document.body.setAttribute(FONT_SIZE_ATTR, getFontSize());
      document.body.setAttribute(CATEGORY_SIZE_ATTR, getCategorySize());
    }

    function syncCardSize() {
      if (!document.body) return;
      document.body.setAttribute(CARD_SIZE_ATTR, getCardSize());
    }

    function syncLogoSize() {
      if (!document.body) return;
      document.body.setAttribute(LOGO_SIZE_ATTR, getLogoSize());
    }

    function syncCardFlags() {
      if (!document.body) return;
      document.body.setAttribute(BACKDROP_ATTR, backdropEnabled() ? 'on' : 'off');
      document.body.setAttribute(BADGE_ATTR, badgeEnabled() ? 'on' : 'off');
      document.body.setAttribute(RATING_ATTR, ratingEnabled() ? 'on' : 'off');
      document.body.setAttribute(RATING_STYLE_ATTR, getRatingStyle());
      document.body.setAttribute(CARD_IMAGE_MODE_ATTR, getCardImageMode());
    }

    function syncPerfMode() {
      if (!document.body) return;
      var level = resolvePerfLevel();
      document.body.setAttribute(PERF_ATTR, level);
      if (level === 'ultra') document.body.classList.remove(GLARE_CLASS);
    }

    function syncFlexGapFlag() {
      if (!document.body) return;
      document.body.setAttribute(FLEX_GAP_ATTR, detectFlexGapSupport() ? 'yes' : 'no');
    }

    function getOverlayAlign() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'start';
        var v = Lampa.Storage.get(OVERLAY_ALIGN_KEY, 'start') || 'start';
        return (v === 'center' || v === 'end') ? v : 'start';
      } catch (e) { return 'start'; }
    }

    function syncOverlayAlign() {
      if (!document.body) return;
      document.body.setAttribute(OVERLAY_ALIGN_ATTR, getOverlayAlign());
    }

    function restoreOriginalImg(cardEl) {
      var img = cardEl.querySelector('.card__img');
      if (!img) return;
      var origSrc = img.getAttribute('data-nfx-original-src');
      if (origSrc !== null) {
        if (img.tagName === 'IMG') img.src = origSrc;
        img.style.objectFit = '';
        img.style.objectPosition = '';
      }
      var origBg = img.getAttribute('data-nfx-original-bg');
      if (origBg !== null) {
        img.style.backgroundImage = origBg;
        img.style.backgroundSize = '';
        img.style.backgroundPosition = '';
      }
    }

    function resetCardSwitches() {
      qsa('.card[data-nfx-switched]').forEach(function (c) {
        restoreOriginalImg(c);
        c.removeAttribute('data-nfx-switched');
        var overlay = c.querySelector('.nfx-card-overlay');
        if (overlay) overlay.remove();
        var badge = c.querySelector('.nfx-card-logo');
        if (badge) badge.remove();
        var rating = c.querySelector('.nfx-card-rating');
        if (rating) rating.remove();
      });
    }

    function resetSettings() {
      try {
        if (!window.Lampa || !Lampa.Storage) return;
        Lampa.Storage.set(ENABLE_KEY, 'on');
        Lampa.Storage.set(GLARE_KEY, 'on');
        Lampa.Storage.set(UI_LANG_KEY, 'auto');
        Lampa.Storage.set(LOGO_LANG_KEY, 'auto');
        Lampa.Storage.set(FONT_SIZE_KEY, 'md');
        Lampa.Storage.set(CATEGORY_SIZE_KEY, 'md');
        Lampa.Storage.set(BACKDROP_KEY, 'on');
        Lampa.Storage.set(BADGE_KEY, 'on');
        Lampa.Storage.set(RATING_KEY, 'off');
        Lampa.Storage.set(RATING_STYLE_KEY, 'color');
        Lampa.Storage.set(CLOCK_SECONDS_KEY, 'off');
        Lampa.Storage.set(CONTROL_PANEL_KEY, 'off');
        Lampa.Storage.set(PERF_MODE_KEY, 'auto');
        Lampa.Storage.set(LOGO_SIZE_KEY, 'md');
        Lampa.Storage.set(POSTER_QUALITY_KEY, 'w500');
        Lampa.Storage.set(OVERLAY_ALIGN_KEY, 'start');
        Lampa.Storage.set(CARD_IMAGE_MODE_KEY, 'backdrop');
        Lampa.Storage.set(TOPNAV_ITEMS_KEY, ['main', 'movie', 'tv', 'cartoon']);
        logoCache = {};
        titledBackdropCache = {};
        posterCache = {};
        clearAll();
        syncGlareClass();
        syncFontSize();
        syncLogoSize();
        syncCardFlags();
        syncPerfMode();
        syncOverlayAlign();
        resetCardSwitches();
        setTimeout(function () { schedulePatch(); }, 80);
        try {
          if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(t('set_reset_done'));
        } catch (e) { }
        setTimeout(function () {
          try {
            if (Lampa.Settings && Lampa.Settings.create) Lampa.Settings.create(SETTINGS_COMPONENT);
          } catch (e) { }
        }, 120);
      } catch (e) { }
    }

    function setTopnavActionState(action, enabled) {
      var order = getAvailableTopnavItems().map(function (item) { return item.action; });
      var current = getStoredTopnavActions().filter(function (item, index, arr) {
        return item && arr.indexOf(item) === index;
      });

      if (enabled) {
        if (current.indexOf(action) === -1) current.push(action);
      } else {
        current = current.filter(function (item) { return item !== action; });
      }

      current.sort(function (a, b) {
        return order.indexOf(a) - order.indexOf(b);
      });

      setStoredTopnavActions(current);
    }

    function getSelectedTopnavItems() {
      var selected = getStoredTopnavActions();
      var map = {};
      getAvailableTopnavItems().forEach(function (item) {
        map[item.action] = item;
      });
      return selected.map(function (action) {
        return map[action];
      }).filter(Boolean);
    }

    function registerSettings() {
      try {
        if (!window.Lampa || !Lampa.SettingsApi || window.__APPLETV_AGNATIVE_TOPNAV_SETTINGS__) return;
        window.__APPLETV_AGNATIVE_TOPNAV_SETTINGS__ = true;

        if (Lampa.Template && Lampa.Template.add) {
          Lampa.Template.add('settings_' + SETTINGS_COMPONENT, '<div></div>');
          Lampa.Template.add('settings_' + TOPNAV_SETTINGS_COMPONENT, '<div></div>');
        }

        Lampa.SettingsApi.addComponent({
          component: SETTINGS_COMPONENT,
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-device-ipad-horizontal"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 6a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-12" /><path d="M9 17h6" /></svg>',
          name: 'Agnative'
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { name: 'agnative_about_info', type: 'static' },
          field: {
            name: 'AppleTV AgNative',
            description: t('set_about_desc')
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { type: 'title' },
          field: { name: t('set_main_title') }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: ENABLE_KEY,
            type: 'select',
            values: { on: langText('extensions_enable', t('val_on')), off: langText('extensions_disable', t('val_off')) },
            default: 'off'
          },
          field: {
            name: t('set_enable_name'),
            description: t('set_enable_desc')
          },
          onChange: function (value) {
            if (value === 'off') {
              removePluginUi();
              return;
            }
            setTimeout(function () {
              startPlugin();
              schedulePatch();
              setTimeout(function () { schedulePatch(); }, 150);
              setTimeout(function () { schedulePatch(); }, 500);
            }, 50);
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: PERF_MODE_KEY,
            type: 'select',
            values: {
              auto: t('val_perf_auto'),
              high: t('val_perf_high'),
              low: t('val_perf_low'),
              ultra: t('val_perf_ultra')
            },
            default: 'auto'
          },
          field: {
            name: t('set_perf_mode_name'),
            description: t('set_perf_mode_desc')
          },
          onChange: function () {
            syncPerfMode();
            initGlareRuntime();
            perfModeDirty = true;
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: GLARE_KEY,
            type: 'select',
            values: { on: langText('extensions_enable', t('val_on')), off: langText('extensions_disable', t('val_off')) },
            default: 'on'
          },
          field: {
            name: t('set_glare_name'),
            description: t('set_glare_desc')
          },
          onChange: function () {
            syncGlareClass();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: UI_LANG_KEY,
            type: 'select',
            values: {
              auto: t('val_auto'),
              ru: langText('filter_lang_ru', t('val_ru')),
              en: langText('filter_lang_en', t('val_en')),
              uk: langText('filter_lang_uk', t('val_uk'))
            },
            default: 'auto'
          },
          field: {
            name: langText('settings_interface_lang', t('set_ui_lang_name')),
            description: t('set_ui_lang_desc')
          },
          onChange: function () {
            setTimeout(function () { schedulePatch(); }, 80);
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { name: 'agnative_open_topnav_settings', type: 'button' },
          field: {
            name: t('set_topnav_name'),
            description: t('set_topnav_desc')
          },
          onChange: function () {
            openTopnavSettingsSection();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { type: 'title' },
          field: { name: t('set_section_cards') }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: BACKDROP_KEY,
            type: 'select',
            values: { on: langText('extensions_enable', t('val_on')), off: langText('extensions_disable', t('val_off')) },
            default: 'on'
          },
          field: {
            name: t('set_backdrop_name'),
            description: t('set_backdrop_desc')
          },
          onChange: function () {
            syncCardFlags();
            resetCardSwitches();
            setTimeout(function () { schedulePatch(); }, 80);
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: CARD_SIZE_KEY,
            type: 'select',
            values: {
              xs: t('val_size_xs'),
              sm: t('val_size_sm'),
              md: t('val_size_md'),
              lg: t('val_size_lg'),
              xl: t('val_size_xl')
            },
            default: 'md'
          },
          field: {
            name: t('set_card_size_name'),
            description: t('set_card_size_desc')
          },
          onChange: function () {
            syncCardSize();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: CARD_IMAGE_MODE_KEY,
            type: 'select',
            values: {
              backdrop: t('val_card_image_backdrop'),
              poster: t('val_card_image_poster')
            },
            default: 'backdrop'
          },
          field: {
            name: t('set_card_image_mode_name'),
            description: t('set_card_image_mode_desc')
          },
          onChange: function () {
            posterCache = {};
            logoCache = {};
            titledBackdropCache = {};
            clearAll();
            syncCardFlags();
            resetCardSwitches();
            setTimeout(function () { schedulePatch(); }, 80);
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: POSTER_QUALITY_KEY,
            type: 'select',
            values: {
              w185: t('val_size_xs'),
              w342: t('val_size_sm'),
              w500: t('val_size_md'),
              w780: t('val_size_lg'),
              original: t('val_size_xl')
            },
            default: 'w500'
          },
          field: {
            name: t('set_poster_quality_name'),
            description: t('set_poster_quality_desc')
          },
          onChange: function () {
            posterCache = {};
            clearAll();
            resetCardSwitches();
            setTimeout(function () { schedulePatch(); }, 80);
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: LOGO_LANG_KEY,
            type: 'select',
            values: {
              auto: t('val_auto'),
              ru: langText('filter_lang_ru', t('val_ru')),
              en: langText('filter_lang_en', t('val_en')),
              uk: langText('filter_lang_uk', t('val_uk'))
            },
            default: 'auto'
          },
          field: {
            name: t('set_logo_lang_name'),
            description: t('set_logo_lang_desc')
          },
          onChange: function () {
            logoCache = {};
            titledBackdropCache = {};
            clearAll();
            setTimeout(function () { schedulePatch(); }, 80);
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: LOGO_SIZE_KEY,
            type: 'select',
            values: {
              xs: t('val_size_xs'),
              sm: t('val_size_sm'),
              md: t('val_size_md'),
              lg: t('val_size_lg'),
              xl: t('val_size_xl')
            },
            default: 'md'
          },
          field: {
            name: t('set_logo_size_name'),
            description: t('set_logo_size_desc')
          },
          onChange: function () {
            syncLogoSize();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: OVERLAY_ALIGN_KEY,
            type: 'select',
            values: {
              start: t('val_overlay_align_start'),
              center: t('val_overlay_align_center'),
              end: t('val_overlay_align_end')
            },
            default: 'start'
          },
          field: {
            name: t('set_overlay_align_name'),
            description: t('set_overlay_align_desc')
          },
          onChange: function () {
            syncOverlayAlign();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: BADGE_KEY,
            type: 'select',
            values: { on: langText('extensions_enable', t('val_on')), off: langText('extensions_disable', t('val_off')) },
            default: 'on'
          },
          field: {
            name: t('set_badge_name'),
            description: t('set_badge_desc')
          },
          onChange: function () {
            syncCardFlags();
            if (badgeEnabled()) {
              resetCardSwitches();
              setTimeout(function () { schedulePatch(); }, 80);
            }
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: RATING_KEY,
            type: 'select',
            values: { on: langText('extensions_enable', t('val_on')), off: langText('extensions_disable', t('val_off')) },
            default: 'off'
          },
          field: {
            name: langText('title_rating', t('set_rating_name')),
            description: t('set_rating_desc')
          },
          onChange: function () {
            syncCardFlags();
            if (ratingEnabled()) {
              resetCardSwitches();
              setTimeout(function () { schedulePatch(); }, 80);
            }
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: RATING_STYLE_KEY,
            type: 'select',
            values: { color: t('val_rating_color'), mono: t('val_rating_mono') },
            default: 'color'
          },
          field: {
            name: t('set_rating_style_name'),
            description: t('set_rating_style_desc')
          },
          onChange: function () {
            syncCardFlags();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { type: 'title' },
          field: { name: t('set_section_text') }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: FONT_SIZE_KEY,
            type: 'select',
            values: {
              xs: t('val_size_xs'),
              sm: t('val_size_sm'),
              md: t('val_size_md'),
              lg: t('val_size_lg'),
              xl: t('val_size_xl')
            },
            default: 'md'
          },
          field: {
            name: t('set_font_size_name'),
            description: t('set_font_size_desc')
          },
          onChange: function () {
            syncFontSize();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: CATEGORY_SIZE_KEY,
            type: 'select',
            values: {
              xs: t('val_size_xs'),
              sm: t('val_size_sm'),
              md: t('val_size_md'),
              lg: t('val_size_lg'),
              xl: t('val_size_xl')
            },
            default: 'md'
          },
          field: {
            name: t('set_category_size_name'),
            description: t('set_category_size_desc')
          },
          onChange: function () {
            syncFontSize();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { type: 'title' },
          field: { name: t('set_section_clock') }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: CLOCK_SECONDS_KEY,
            type: 'select',
            values: { on: langText('extensions_enable', t('val_on')), off: langText('extensions_disable', t('val_off')) },
            default: 'off'
          },
          field: {
            name: t('set_clock_seconds_name'),
            description: t('set_clock_seconds_desc')
          },
          onChange: function () {
            restartClock();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: CONTROL_PANEL_KEY,
            type: 'select',
            values: { on: langText('extensions_enable', t('val_on')), off: langText('extensions_disable', t('val_off')) },
            default: 'off'
          },
          field: {
            name: t('set_control_panel_name'),
            description: t('set_control_panel_desc')
          },
          onChange: function (value) {
            if (value === 'off') closeControlPanel(true);
            setTimeout(function () { schedulePatch(); }, 80);
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { type: 'title' },
          field: { name: t('set_section_data') }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: CACHE_SIZE_KEY,
            type: 'select',
            values: {
              '50': '50 MB',
              '100': '100 MB',
              '200': '200 MB',
              '500': '500 MB',
              'unlimited': t('val_unlimited')
            },
            default: '100'
          },
          field: {
            name: t('set_cache_size_name'),
            description: t('set_cache_size_desc')
          },
          onChange: function () {
            prune(getCacheMaxBytes());
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { name: 'agnative_reset_button', type: 'button' },
          field: {
            name: t('set_reset_name'),
            description: t('set_reset_desc')
          },
          onChange: function () {
            resetSettings();
          }
        });

        Lampa.SettingsApi.addParam({
          component: TOPNAV_SETTINGS_COMPONENT,
          param: { type: 'title' },
          field: { name: t('set_topnav_title') }
        });

        getAvailableTopnavItems().forEach(function (item) {
          Lampa.SettingsApi.addParam({
            component: TOPNAV_SETTINGS_COMPONENT,
            param: {
              name: 'agnative_topnav_item_' + item.action,
              type: 'select',
              values: { on: langText('settings_add', t('val_add')), off: t('val_hide') },
              default: getStoredTopnavActions().indexOf(item.action) > -1 ? 'on' : 'off'
            },
            field: {
              name: item.label,
              description: t('set_topnav_item_desc') + item.action
            },
            onChange: function (value) {
              setTopnavActionState(item.action, value !== 'off');
            }
          });
        });
      } catch (e) { }
    }

    function bindRuntimeListeners() {
      if (!window.Lampa || !Lampa.Listener || !Lampa.Storage || !Lampa.Storage.listener) return;

      if (!activityListenerBound) {
        activityListenerBound = true;
        Lampa.Listener.follow('activity', function (e) {
          if (!pluginEnabled()) return;
          if (e.type === 'start' || e.type === 'activity') {
            if (perfModeDirty) {
              perfModeDirty = false;
              resetCardSwitches();
              setTimeout(function () { schedulePatch(); }, 80);
            }
            setTimeout(function () {
              try {
                var render = e.object && e.object.activity ? e.object.activity.render() : null;
                if (!render || !render.length) return;
                var body = render.find ? (render.find('.activity__body')[0] || render[0]) : render[0];
                if (!body) return;
                processCards(body);
              } catch (err) { }
            }, 500);
            schedulePatch();
          }
        });
      }

      if (!fullListenerBound) {
        fullListenerBound = true;
        Lampa.Listener.follow('full', function (e) {
          if (!pluginEnabled()) return;
          if (e.type === 'complite') {
            try {
              var render = e.object.activity.render();
              if (render && render.length) processCards(render[0]);
            } catch (err) { }
          }
        });
      }

      if (!storageListenerBound) {
        storageListenerBound = true;
        Lampa.Storage.listener.follow('change', function (e) {
          if (e.name === ENABLE_KEY) {
            if (pluginEnabled()) {
              setTimeout(function () { startPlugin(); }, 50);
              setTimeout(function () { schedulePatch(); }, 120);
            } else {
              removePluginUi();
            }
            return;
          }

          if (e.name === GLARE_KEY) {
            syncGlareClass();
            return;
          }

          if (e.name === CLOCK_SECONDS_KEY) {
            restartClock();
            return;
          }

          if (e.name === FONT_SIZE_KEY || e.name === CATEGORY_SIZE_KEY) {
            syncFontSize();
            return;
          }

          if (e.name === LOGO_LANG_KEY) {
            logoCache = {};
            titledBackdropCache = {};
            clearAll();
            setTimeout(function () { schedulePatch(); }, 80);
            return;
          }

          if (e.name === UI_LANG_KEY) {
            setTimeout(function () { schedulePatch(); }, 80);
            return;
          }

          if (e.name === BACKDROP_KEY || e.name === BADGE_KEY || e.name === RATING_KEY) {
            syncCardFlags();
            if (e.name === BACKDROP_KEY || (e.value && e.value !== 'off')) {
              resetCardSwitches();
              setTimeout(function () { schedulePatch(); }, 80);
            }
            return;
          }

          if (e.name === PERF_MODE_KEY) {
            syncPerfMode();
            initGlareRuntime();
            perfModeDirty = true;
            return;
          }

          if (e.name === TOPNAV_ITEMS_KEY) {
            if (topnavSettingsOpen) return;
            setTimeout(function () { startPlugin(); }, 50);
            setTimeout(function () { schedulePatch(); }, 120);
            return;
          }

          if (e.name === 'lampac_theme' || e.name === 'lampac_interface_scene') {
            if (pluginEnabled()) {
              setTimeout(function () { startPlugin(); }, 50);
              setTimeout(function () { schedulePatch(); }, 120);
            } else {
              removePluginUi();
            }
          }
        });
      }
    }

    function isMobile() {
      return window.innerWidth < 768 || (window.innerWidth < 1024 && 'ontouchstart' in window);
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    function extractCardData(cardEl) {
      if (!cardEl) return null;
      try {
        if (cardEl.card_data) return cardEl.card_data;
      } catch (e) { }
      try {
        if (window.$) {
          var data = $(cardEl).data('card') || $(cardEl).data('json');
          if (data) return data;
        }
      } catch (e) { }
      return null;
    }

    function getGenreNames(item) {
      var names = [];
      if (!item) return names;
      var map = GENRE_MAP_LOCALIZED[getUiLang()] || GENRE_MAP_LOCALIZED.ru;
      if (item.genres && item.genres.length) {
        for (var i = 0; i < item.genres.length; i++) {
          if (item.genres[i] && item.genres[i].name) names.push(item.genres[i].name);
        }
      } else if (item.genre_ids && item.genre_ids.length) {
        for (var j = 0; j < item.genre_ids.length; j++) {
          if (map[item.genre_ids[j]]) names.push(map[item.genre_ids[j]]);
        }
      }
      return names;
    }

    function injectStyle() {
      if (!document.head && !document.body) return;
      var existing = document.getElementById(STYLE_ID);
      if (existing && styleSignature === STYLE_ID) return;

      var style = existing || document.createElement('style');
      style.id = STYLE_ID;
      var text = [
        'body.' + BODY_CLASS + ' .head,',
        'body.' + BODY_CLASS + ' .head__body,',
        'body.' + BODY_CLASS + ' .head__wrapper,',
        'body.' + BODY_CLASS + ' .head__layer {',
        '  background: transparent !important;',
        '  background-image: none !important;',
        '  border: none !important;',
        '  box-shadow: none !important;',
        '  filter: none !important;',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .head__body {',
        '  position: relative !important;',
        '  z-index: 12 !important;',
        '  min-height: 0 !important;',
        '  height: 0 !important;',
        '  padding-top: 0 !important;',
        '  padding-bottom: 0 !important;',
        '  overflow: visible !important;',
        '}',
        'body.' + BODY_CLASS + ' .activity.activity--active,',
        'body.' + BODY_CLASS + ' .activity__body,',
        'body.' + BODY_CLASS + ' .full-start,',
        'body.' + BODY_CLASS + ' .full-start-new,',
        'body.' + BODY_CLASS + ' .full-start__head,',
        'body.' + BODY_CLASS + ' .full-start-new__head,',
        'body.' + BODY_CLASS + ' .full-start__body,',
        'body.' + BODY_CLASS + ' .full-start-new__body,',
        'body.' + BODY_CLASS + ' .full-start__bottom,',
        'body.' + BODY_CLASS + ' .full-start-new__bottom {',
        '  background: transparent !important;',
        '  background-image: none !important;',
        '  box-shadow: none !important;',
        '  filter: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .activity.layer--width.activity--active,',
        'body.' + BODY_CLASS + ' .activity.layer--width.activity--active.application,',
        'body.' + BODY_CLASS + ' .activity.layer--width.activity--active.applecation {',
        '  background: transparent !important;',
        '  background-color: transparent !important;',
        '  background-image: none !important;',
        '  box-shadow: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .activity.layer--width.activity--active::before,',
        'body.' + BODY_CLASS + ' .activity.layer--width.activity--active::after,',
        'body.' + BODY_CLASS + ' .full-start__bottom::before,',
        'body.' + BODY_CLASS + ' .full-start__bottom::after,',
        'body.' + BODY_CLASS + ' .full-start-new__bottom::before,',
        'body.' + BODY_CLASS + ' .full-start-new__bottom::after {',
        '  content: none !important;',
        '  display: none !important;',
        '  background: transparent !important;',
        '  background-image: none !important;',
        '  box-shadow: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .full-start__status,',
        'body.' + BODY_CLASS + ' .full-start__reactions,',
        'body.' + BODY_CLASS + ' .full-start-new__reactions {',
        '  display: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .wrap__content.layer--height.layer--width,',
        'body.' + BODY_CLASS + ' .wrap__content,',
        'body.' + BODY_CLASS + ' .layer--height,',
        'body.' + BODY_CLASS + ' .layer--width {',
        '  background: transparent !important;',
        '  background-image: none !important;',
        '  box-shadow: none !important;',
        '  filter: none !important;',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .wrap__content.layer--height.layer--width,',
        'body.' + BODY_CLASS + ' .wrap__content,',
        'body.' + BODY_CLASS + ' .wrap__content .layer--height,',
        'body.' + BODY_CLASS + ' .wrap__content .layer--width {',
        '  padding-top: .68em !important;',
        '}',
        'body.' + BODY_CLASS + ' .wrap__content.layer--height.layer--width > *,',
        'body.' + BODY_CLASS + ' .wrap__content > *,',
        'body.' + BODY_CLASS + ' .layer--height > *,',
        'body.' + BODY_CLASS + ' .layer--width > * {',
        '  background: transparent !important;',
        '  background-image: none !important;',
        '  box-shadow: none !important;',
        '  filter: none !important;',
        '  mask-image: none !important;',
        '  -webkit-mask-image: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings__content.layer--height {',
        '  background: rgba(28,30,34,.82) !important;',
        '  background-image: none !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 18px 44px rgba(0,0,0,.28) !important;',
        '  border: 1px solid rgba(255,255,255,.05) !important;',
        '  filter: none !important;',
        '  backdrop-filter: blur(18px) saturate(132%) !important;',
        '  -webkit-backdrop-filter: blur(18px) saturate(132%) !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox__content.layer--height,',
        'body.' + BODY_CLASS + ' .settings-input__content.layer--height {',
        '  background: rgba(26,29,34,.9) !important;',
        '  background-image: none !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 22px 54px rgba(0,0,0,.34) !important;',
        '  border: 1px solid rgba(255,255,255,.06) !important;',
        '  filter: none !important;',
        '  backdrop-filter: blur(20px) saturate(136%) !important;',
        '  -webkit-backdrop-filter: blur(20px) saturate(136%) !important;',
        '}',
        'body.' + BODY_CLASS + ' .wrap__left,',
        'body.' + BODY_CLASS + ' .menu,',
        'body.' + BODY_CLASS + ' .menu__content,',
        'body.' + BODY_CLASS + ' .menu .menu__list {',
        '  background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.06)) !important;',
        '  background-image: none !important;',
        '  box-shadow: 0 10px 24px rgba(0,0,0,.18) !important;',
        '  border: 0 !important;',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .wrap__left::before,',
        'body.' + BODY_CLASS + ' .wrap__left::after,',
        'body.' + BODY_CLASS + ' .menu::before,',
        'body.' + BODY_CLASS + ' .menu::after,',
        'body.' + BODY_CLASS + ' .menu__content::before,',
        'body.' + BODY_CLASS + ' .menu__content::after,',
        'body.' + BODY_CLASS + ' .menu .menu__list::before,',
        'body.' + BODY_CLASS + ' .menu .menu__list::after {',
        '  display: none !important;',
        '  content: none !important;',
        '  border: 0 !important;',
        '  box-shadow: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .menu .menu__item {',
        '  background: transparent !important;',
        '  border-radius: 999px !important;',
        '  border: 0 !important;',
        '  box-shadow: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .menu .menu__item + .menu__item {',
        '  margin-top: .18em !important;',
        '}',
        'body.' + BODY_CLASS + ' .menu .menu__item.focus,',
        'body.' + BODY_CLASS + ' .menu .menu__item.hover,',
        'body.' + BODY_CLASS + ' .menu .menu__item.traverse,',
        'body.' + BODY_CLASS + ' .menu .menu__item.active {',
        '  background: rgba(255,255,255,.085) !important;',
        '  border-color: transparent !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.10) !important;',
        '}',
        'body.' + BODY_CLASS + ' .scroll--over {',
        '  max-height: 100%;',
        '}',
        'body.' + BODY_CLASS + ' .menu__list {',
        '  border-radius: 1.35em',
        '}',
        'body.' + BODY_CLASS + ' .settings__body {',
        '  min-height: 0;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param,',
        'body.' + BODY_CLASS + ' .settings-folder,',
        'body.' + BODY_CLASS + ' .selectbox-item {',
        '  background: rgba(28,30,34,.56) !important;',
        '  border-radius: 1.05em !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;',
        '  border: 1px solid rgba(255,255,255,.04) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param + .settings-param,',
        'body.' + BODY_CLASS + ' .settings-folder + .settings-folder,',
        'body.' + BODY_CLASS + ' .settings-folder + .settings-param,',
        
        'body.' + BODY_CLASS + ' .settings-param + .settings-folder {',
        '  margin-top: .38em !important;',
        '}',
        
        
        'body.' + BODY_CLASS + ' .settings-param__name,',
        'body.' + BODY_CLASS + ' .settings-folder__name,',
        'body.' + BODY_CLASS + ' .settings-param__value,',
        'body.' + BODY_CLASS + ' .settings-param__descr,',
        'body.' + BODY_CLASS + ' .settings-folder__descr,',
        'body.' + BODY_CLASS + ' .selectbox-item__title,',
        'body.' + BODY_CLASS + ' .selectbox-item__subtitle {',
        '  position: relative !important;',
        '  z-index: 1 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param.focus,',
        'body.' + BODY_CLASS + ' .settings-folder.focus,',
        'body.' + BODY_CLASS + ' .selectbox-item.focus,',
        'body.' + BODY_CLASS + ' .settings-param.hover,',
        'body.' + BODY_CLASS + ' .settings-folder.hover,',
        'body.' + BODY_CLASS + ' .selectbox-item.hover {',
        '  background: rgba(255,255,255,.085) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(255,255,255,.08) !important;',
        '  border-color: rgba(255,255,255,.10) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-folder.focus::before,',
        'body.' + BODY_CLASS + ' .settings-folder.focus::after,',
        'body.' + BODY_CLASS + ' .settings-param.focus::before,',
        'body.' + BODY_CLASS + ' .settings-param.focus::after,',
        'body.' + BODY_CLASS + ' .selectbox-item.focus::before,',
        'body.' + BODY_CLASS + ' .selectbox-item.focus::after {',
        '  display: none !important;',
        '  content: none !important;',
        '}',

        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .settings-param[data-name="' + GLARE_KEY + '"],',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings-param[data-name="' + GLARE_KEY + '"] { display: none !important; }',
        'body.' + BODY_CLASS + '[' + RATING_ATTR + '="off"] .settings-param[data-name="' + RATING_STYLE_KEY + '"] { display: none !important; }',
        'body.' + BODY_CLASS + '[' + CARD_IMAGE_MODE_ATTR + '="poster"] .settings-param[data-name="' + LOGO_SIZE_KEY + '"] { display: none !important; }',
        'body.' + BODY_CLASS + ' .wrap__content.layer--height.layer--width::after,',
        'body.' + BODY_CLASS + ' .wrap__content.layer--height.layer--width > *::before,',
        'body.' + BODY_CLASS + ' .wrap__content.layer--height.layer--width > *::after,',
        'body.' + BODY_CLASS + ' .wrap__content::after,',
        'body.' + BODY_CLASS + ' .wrap__content > *::before,',
        'body.' + BODY_CLASS + ' .wrap__content > *::after,',
        'body.' + BODY_CLASS + ' .layer--height::after,',
        'body.' + BODY_CLASS + ' .layer--height > *::before,',
        'body.' + BODY_CLASS + ' .layer--height > *::after,',
        'body.' + BODY_CLASS + ' .layer--width > *::before,',
        'body.' + BODY_CLASS + ' .layer--width > *::after,',
        'body.' + BODY_CLASS + ' .layer--width::after {',
        '  content: none !important;',
        '  display: none !important;',
        '  background: transparent !important;',
        '  background-image: none !important;',
        '  box-shadow: none !important;',
        '  mask-image: none !important;',
        '  -webkit-mask-image: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .head__title,',
        'body.' + BODY_CLASS + ' .head__time,',
        'body.' + BODY_CLASS + ' .head__split,',
        'body.' + BODY_CLASS + ' .head__logo,',
        'body.' + BODY_CLASS + ' .head__history,',
        'body.' + BODY_CLASS + ' .head__source,',
        'body.' + BODY_CLASS + ' .head__markers,',
        'body.' + BODY_CLASS + ' .head__backward,',
        'body.' + BODY_CLASS + ' .open--search,',
        'body.' + BODY_CLASS + ' .head__settings,',
        'body.' + BODY_CLASS + ' .settings-icon-holder,',
        'body.' + BODY_CLASS + ' .head__action,',
        'body.' + BODY_CLASS + ' .head__button {',
        '  display: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .head__actions {',
        '  position: absolute !important;',
        '  left: calc(1em + 2.6em + .8em) !important;',
        '  top: .46em !important;',
        '  right: auto !important;',
        '  bottom: auto !important;',
        '  height: 2.6em !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  display: inline-flex !important;',
        '  align-items: center !important;',
        '  justify-content: flex-start !important;',
        '  gap: .4em !important;',
        '  z-index: 20 !important;',
        '  background: transparent !important;',
        '  border: 0 !important;',
        '  box-shadow: none !important;',
        '  pointer-events: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .head__navigator {',
        '  display: inline-flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '  height: 2.6em !important;',
        '  padding: 0 1em !important;',
        '  margin: 0 !important;',
        '  font-size: calc(.78em * var(--agnative-scale, 1)) !important;',
        '  font-weight: 700 !important;',
        '  letter-spacing: .04em !important;',
        '  color: rgba(255,255,255,.92) !important;',
        '  background: rgba(22,24,30,.26) !important;',
        '  border: 1px solid rgba(255,255,255,.10) !important;',
        '  border-radius: 999px !important;',
        '  backdrop-filter: blur(18px) saturate(140%) !important;',
        '  -webkit-backdrop-filter: blur(18px) saturate(140%) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12) !important;',
        '  white-space: nowrap !important;',
        '  pointer-events: auto !important;',
        '}',
        'body.' + BODY_CLASS + ' .head__menu-icon {',
        '  position: absolute !important;',
        '  left: 1em !important;',
        '  top: .46em !important;',
        '  transform: none !important;',
        '  z-index: 20 !important;',
        '  width: 2.6em !important;',
        '  height: 2.6em !important;',
        '  min-width: 2.6em !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  display: inline-flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '  border-radius: 999px !important;',
        '  background: rgba(22,24,30,.26) !important;',
        '  border: 1px solid rgba(255,255,255,.10) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12) !important;',
        '  backdrop-filter: blur(18px) saturate(140%) !important;',
        '  -webkit-backdrop-filter: blur(18px) saturate(140%) !important;',
        '  color: rgba(255,255,255,.95) !important;',
        '}',
        'body.' + BODY_CLASS + ' .head__menu-icon > *,',
        'body.' + BODY_CLASS + ' .head__menu-icon svg,',
        'body.' + BODY_CLASS + ' .head__menu-icon img {',
        '  width: 1.1em !important;',
        '  height: 1.1em !important;',
        '  max-width: 1.1em !important;',
        '  max-height: 1.1em !important;',
        '}',
        'body.' + BODY_CLASS + ' .head::before,',
        'body.' + BODY_CLASS + ' .head::after,',
        'body.' + BODY_CLASS + ' .head__body::before,',
        'body.' + BODY_CLASS + ' .head__body::after,',
        'body.' + BODY_CLASS + ' .head__wrapper::before,',
        'body.' + BODY_CLASS + ' .head__wrapper::after,',
        'body.' + BODY_CLASS + ' .head__layer::before,',
        'body.' + BODY_CLASS + ' .head__layer::after {',
        '  content: none !important;',
        '  display: none !important;',
        '  filter: none !important;',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '  background: transparent !important;',
        '  box-shadow: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .head__logo-icon {',
        '  display: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell { position:absolute; left:50%; top:.46em; transform:translateX(-50%); z-index:20; width:max-content; max-width:calc(100vw - 24em); height:2.6em; display:inline-flex; align-items:center; box-sizing:border-box; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__inner { height:2.6em; box-sizing:border-box; display:inline-flex; align-items:center; gap:.18em; padding:.21em .32em; border-radius:999px; background:rgba(22,24,30,.28); border:1px solid rgba(255,255,255,.10); box-shadow:inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%); }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__items { display:flex; align-items:center; justify-content:center; gap:.08em; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__right { display:flex; align-items:center; gap:.08em; margin-left:.12em; padding-left:.18em; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__item.selector { appearance:none; -webkit-appearance:none; border:0; background:none; color:rgba(255,255,255,.92); height:2.16em; display:inline-flex; align-items:center; justify-content:center; text-align:center; padding:0 .96em; border-radius:999px; font-size:.83em; font-weight:700; line-height:1; white-space:nowrap; transition:background .2s ease, transform .2s ease, box-shadow .2s ease; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__item--icon.selector { width:2.16em; min-width:2.16em; padding:0; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__item--icon svg { width:1em; height:1em; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-right__profile.selector { width:2.16em; min-width:2.16em; padding:0; overflow:hidden; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-right__profile-img { width:1.56em; height:1.56em; border-radius:999px; object-fit:cover; display:block; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__item.is-active, body.' + BODY_CLASS + ' .agnative-topnav-shell__item.hover, body.' + BODY_CLASS + ' .agnative-topnav-shell__item.focus { background:rgba(255,255,255,.14); box-shadow:inset 0 1px 0 rgba(255,255,255,.10); }',
        'body.' + BODY_CLASS + ' .agnative-topnav-rightdock { position:absolute; right:1.15em; top:.46em; z-index:20; height:2.6em; box-sizing:border-box; display:inline-flex; align-items:center; gap:.08em; padding:.21em .32em; border-radius:999px; background:rgba(22,24,30,.28); border:1px solid rgba(255,255,255,.10); box-shadow:inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%); }',
        'body.' + BODY_CLASS + ' .agnative-topnav-rightdock .agnative-topnav-clock { position:static !important; right:auto !important; top:auto !important; z-index:auto !important; height:2.16em !important; min-width:4.2em !important; padding:0 .95em !important; background:transparent !important; border:0 !important; box-shadow:none !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important; transition:background .2s ease, transform .2s ease, box-shadow .2s ease; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-rightdock .agnative-topnav-clock.hover, body.' + BODY_CLASS + ' .agnative-topnav-rightdock .agnative-topnav-clock.focus, body.' + BODY_CLASS + ' .agnative-topnav-rightdock .agnative-topnav-right__profile.hover, body.' + BODY_CLASS + ' .agnative-topnav-rightdock .agnative-topnav-right__profile.focus { background:rgba(255,255,255,.14) !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.10) !important; transform:translateY(-.02em); }',
        'body.' + BODY_CLASS + ' .agnative-topnav-clock { position:absolute; right:1.15em; top:.46em; z-index:20; display:inline-flex; align-items:center; justify-content:center; min-width:4.2em; height:2.6em; padding:0 .95em; border-radius:999px; background:rgba(22,24,30,.26); border:1px solid rgba(255,255,255,.10); box-shadow:inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%); color:rgba(255,255,255,.95); font-size:.92em; font-weight:700; letter-spacing:.01em; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-clock.selector { cursor:pointer; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel { position:absolute; right:1.15em; top:3.7em; z-index:26; width:18.8em; padding:.72em; border-radius:1.18em; background:rgba(40,48,62,.76); border:1px solid rgba(255,255,255,.13); box-shadow:0 18px 48px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.09); backdrop-filter:blur(22px) saturate(136%); -webkit-backdrop-filter:blur(22px) saturate(136%); opacity:0; transform:translateY(-.35em) scale(.98); pointer-events:none; transition:opacity .2s ease, transform .2s ease; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel.is-open { opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__title { font-size:1.28em; font-weight:600; color:rgba(255,255,255,.94); padding:.18em .15em .52em; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.48em; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector { min-height:5.2em; border-radius:.95em; background:rgba(16,20,28,.82); border:1px solid rgba(255,255,255,.10); display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:.34em; padding:.65em .72em; color:rgba(255,255,255,.95); transition:background .2s ease, box-shadow .2s ease, transform .2s ease; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector .agnative-control-panel__icon { width:1.3em; height:1.3em; display:inline-flex; align-items:center; justify-content:center; color:rgba(214,230,255,.97); }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector .agnative-control-panel__icon svg { width:1.3em; height:1.3em; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector .agnative-control-panel__label { font-size:.95em; font-weight:700; line-height:1.15; text-align:left; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector.hover, body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector.focus { background:rgba(255,255,255,.18); box-shadow:inset 0 1px 0 rgba(255,255,255,.18), 0 0 0 1px rgba(255,255,255,.12); transform:translateY(-.02em); }',
        'body.' + BODY_CLASS + ' .items-line--type-default { min-height:auto !important; padding-top:0 !important; padding-bottom:.12em !important; margin-bottom:.32em !important; }',
        'body.' + BODY_CLASS + ' .items-line--type-default .items-line__head { margin-bottom:.58em !important; min-height:auto !important; padding-top:0 !important; padding-bottom:0 !important; padding-left:1.05em !important; padding-right:1.05em !important; font-size:1em !important; }',
        'body.' + BODY_CLASS + ' .items-line__more.selector { font-size:.7em !important; padding:.3em .6em !important; opacity:.85 !important; }',
        'body.' + BODY_CLASS + ' .items-line--type-default .items-cards { padding-top:0 !important; font-size:.86em !important; }',
        'body.' + BODY_CLASS + ' .items-cards { padding-left:1.05em !important; padding-right:1.05em !important; gap:.62em !important; }',
        'body.' + BODY_CLASS + ' .items-line__body { padding-left:0 !important; }',
        'body.' + BODY_CLASS + ' .items-line__title { font-size:1em !important; line-height:1.2 !important; font-weight:700 !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line { display:flex !important; gap:1.5em !important; padding-left:1.15em !important; padding-right:1.15em !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person { padding: 1em !important; }',
        'body.' + BODY_CLASS + ' .mapping--grid { display:grid !important; grid-template-columns:repeat(auto-fit, minmax(17.6em, 1fr)) !important; gap: 1em .52em !important; align-items:start !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(13em, 1fr)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(14em, 1fr)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(10.4em, 1fr)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(15.8em, 1fr)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(11.7em, 1fr)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(17.6em, 1fr)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(13em, 1fr)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(19.4em, 1fr)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(14.3em, 1fr)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(21.2em, 1fr)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(15.6em, 1fr)) !important; }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + ' .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(15em, 1fr)) !important; } }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(11.1em, 1fr)) !important; } }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(11.9em, 1fr)) !important; } }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(8.8em, 1fr)) !important; } }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(13.4em, 1fr)) !important; } }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(9.9em, 1fr)) !important; } }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(15em, 1fr)) !important; } }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(11.1em, 1fr)) !important; } }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(16.5em, 1fr)) !important; } }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(12.2em, 1fr)) !important; } }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(18em, 1fr)) !important; } }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(13.3em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + ' .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(15em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(11.1em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(11.9em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(8.8em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(13.4em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(9.9em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(15em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(11.1em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(16.5em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(12.2em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(18em, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"][' + BACKDROP_ATTR + '="off"] .mapping--grid { grid-template-columns:repeat(auto-fit, minmax(13.3em, 1fr)) !important; } }',
        'body.' + BODY_CLASS + ' .card { width:auto !important; margin:0 !important; padding-bottom:0 !important; transform-origin:center center !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .items-line .card { width:17.6em !important; flex:0 0 auto !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .items-line .card { width:13em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"] .items-line .card { width:14em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"][' + BACKDROP_ATTR + '="off"] .items-line .card { width:10.4em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"] .items-line .card { width:15.8em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"][' + BACKDROP_ATTR + '="off"] .items-line .card { width:11.7em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"] .items-line .card { width:17.6em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"][' + BACKDROP_ATTR + '="off"] .items-line .card { width:13em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"] .items-line .card { width:19.4em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"][' + BACKDROP_ATTR + '="off"] .items-line .card { width:14.3em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"] .items-line .card { width:21.2em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"][' + BACKDROP_ATTR + '="off"] .items-line .card { width:15.6em !important; }',
        'body.' + BODY_CLASS + ' .card .card-watched { transform: scale(.8) !important; bottom: 0 !important; max-height: 100% !important; overflow: hidden !important; }',
        'body.' + BODY_CLASS + ' .card .card__view { padding-bottom:56.25% !important; margin-bottom:0 !important; border-radius:1.35em !important; overflow:hidden !important; clip-path: inset(0 round 1.35em); -webkit-clip-path: inset(0 round 1.35em); box-shadow: inset 0 1px 0 rgba(255,255,255,.16), inset 0 -1px 0 rgba(255,255,255,.04), 0 8px 18px rgba(0,0,0,.18) !important; transition: transform .28s cubic-bezier(.22,.61,.36,1), box-shadow .28s ease, filter .28s ease, opacity .18s ease !important; border: 0.1em solid transparent !important; box-sizing: border-box !important; }',
        'body.' + BODY_CLASS + ' .card[data-nfx-switched="1"] .card__view { opacity:1 !important; }',
        'body.' + BODY_CLASS + ' .card__view > *, body.' + BODY_CLASS + ' .card__view img, body.' + BODY_CLASS + ' .card__view .card__img, body.' + BODY_CLASS + ' .card__view .card__image, body.' + BODY_CLASS + ' .card__img, body.' + BODY_CLASS + ' .card__image, body.' + BODY_CLASS + ' .card__filter, body.' + BODY_CLASS + ' .card__filter::before, body.' + BODY_CLASS + ' .card__filter::after { border-radius:1.35em !important; }',
        'body.' + BODY_CLASS + ' .card__img, body.' + BODY_CLASS + ' .card__image { object-fit:cover !important; object-position:center 20% !important; border:none !important; box-shadow:none !important; background-clip:padding-box !important; }',
        'body.' + BODY_CLASS + ' .card.focus .card__view { transform: translateY(-.08em) scale(1.06) !important; filter: saturate(1.06) brightness(1.02) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 2px rgba(86,141,255,.92), 0 18px 42px rgba(0,0,0,.26), 0 8px 20px rgba(0,0,0,.14) !important; }',
        'body.' + BODY_CLASS + ' .card.hover .card__view { transform: translateY(-.04em) scale(1.03) !important; filter: saturate(1.02) brightness(1.01) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 10px 24px rgba(0,0,0,.16) !important; }',
        'body.' + BODY_CLASS + ' .card.focus::after, body.' + BODY_CLASS + ' .card.hover::after, body.' + BODY_CLASS + ' .card__view::before, body.' + BODY_CLASS + ' .card__view::after { display:none !important; content:none !important; }',
        'body.' + BODY_CLASS + ' .card-episode { width:17.6em !important; flex:0 0 auto !important; margin:0 !important; padding:0 !important; background:transparent !important; border:0 !important; outline:0 !important; box-shadow:none !important; transform:none !important; transform-origin:center center !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"] .card-episode { width:14em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"] .card-episode { width:15.8em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"] .card-episode { width:17.6em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"] .card-episode { width:19.4em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"] .card-episode { width:21.2em !important; }',
        'body.' + BODY_CLASS + ' .card-episode.focus, body.' + BODY_CLASS + ' .card-episode.hover, body.' + BODY_CLASS + ' .card-episode.focus .card-episode__body, body.' + BODY_CLASS + ' .card-episode.hover .card-episode__body { border:0 !important; outline:0 !important; box-shadow:none !important; background:transparent !important; }',
        'body.' + BODY_CLASS + ' .card-episode__body { background:transparent !important; border:0 !important; outline:0 !important; box-shadow:none !important; padding:0 !important; margin:0 !important; display:block !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode { position:relative !important; display:block !important; background:transparent !important; border:0 !important; box-shadow:none !important; padding:0 !important; margin:0 !important; overflow:visible !important; transform-origin:center center !important; transition: transform .28s cubic-bezier(.22,.61,.36,1) !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__img { position:relative !important; width:100% !important; height:0 !important; padding-bottom:56.25% !important; margin:0 !important; border-radius:1.35em !important; overflow:hidden !important; clip-path: inset(0 round 1.35em); -webkit-clip-path: inset(0 round 1.35em); box-shadow: inset 0 1px 0 rgba(255,255,255,.16), inset 0 -1px 0 rgba(255,255,255,.04), 0 8px 18px rgba(0,0,0,.18) !important; transition: box-shadow .28s ease, filter .28s ease !important; border: 0.1em solid transparent !important; box-sizing: border-box !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__img > *, body.' + BODY_CLASS + ' .card-episode .full-episode__img img { border-radius:1.35em !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__img img { position:absolute !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; object-fit:cover !important; object-position:center center !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__img::before { content:"" !important; position:absolute !important; inset:auto 0 0 0 !important; height:62% !important; background:linear-gradient(0deg, rgba(6,8,14,.92) 0%, rgba(6,8,14,.62) 36%, rgba(6,8,14,.22) 70%, rgba(6,8,14,0) 100%) !important; z-index:2 !important; pointer-events:none !important; border-radius:0 0 1.35em 1.35em !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__body { position:absolute !important; left:1.02em !important; right:1.02em !important; bottom:.9em !important; top:auto !important; z-index:3 !important; padding:0 !important; margin:0 !important; background:transparent !important; border:0 !important; display:flex !important; flex-direction:column !important; align-items:flex-start !important; text-shadow:0 2px 12px rgba(0,0,0,.6) !important; pointer-events:none !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__num { position:absolute !important; top:.72em !important; right:.82em !important; left:auto !important; bottom:auto !important; z-index:4 !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; min-width:1.9em !important; font-size: calc(.72em * var(--agnative-scale, 1)) !important; font-weight:800 !important; color:#fff !important; letter-spacing:.04em !important; line-height:1 !important; margin:0 !important; padding:.34em .66em !important; border-radius:.85em !important; background:rgba(12,14,20,.68) !important; border:1px solid rgba(255,255,255,.14) !important; backdrop-filter: blur(10px) saturate(140%) !important; -webkit-backdrop-filter: blur(10px) saturate(140%) !important; box-shadow: 0 4px 10px rgba(0,0,0,.24) !important; text-shadow:none !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__num::before { content:"EP " !important; opacity:.7 !important; font-weight:700 !important; margin-right:.04em !important; }',
        'body.' + BODY_CLASS + ' .card-episode .nfx-episode-logo { display:block !important; max-height:2.35em !important; max-width:80% !important; margin:0 0 .32em !important; padding:0 !important; background:transparent !important; border:0 !important; border-radius:0 !important; clip-path:none !important; -webkit-clip-path:none !important; object-fit:contain !important; object-position:left center !important; filter: drop-shadow(0 2px 6px rgba(0,0,0,.55)) !important; }',
        'body.' + BODY_CLASS + ' .card-episode .nfx-episode-title { font-size: calc(.95em * var(--agnative-scale, 1)) !important; font-weight:800 !important; color:#fff !important; line-height:1.14 !important; max-width:100% !important; overflow:hidden !important; text-overflow:ellipsis !important; white-space:nowrap !important; margin:0 0 .3em !important; padding:0 !important; letter-spacing:.005em !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__name { font-size: calc(.82em * var(--agnative-scale, 1)) !important; font-weight:700 !important; color:#fff !important; line-height:1.18 !important; max-width:100% !important; overflow:hidden !important; text-overflow:ellipsis !important; white-space:nowrap !important; margin:0 !important; padding:0 !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__date { font-size: calc(.68em * var(--agnative-scale, 1)) !important; font-weight:500 !important; color:rgba(255,255,255,.78) !important; line-height:1.2 !important; margin-top:.18em !important; padding:0 !important; letter-spacing:.01em !important; gap: .5em;}',
        'body.' + BODY_CLASS + ' .card-episode__footer { display:none !important; }',
        'body.' + BODY_CLASS + ' .card-episode::before, body.' + BODY_CLASS + ' .card-episode::after, body.' + BODY_CLASS + ' .card-episode__body::before, body.' + BODY_CLASS + ' .card-episode__body::after, body.' + BODY_CLASS + ' .card-episode .full-episode::before, body.' + BODY_CLASS + ' .card-episode .full-episode::after { display:none !important; content:none !important; border:0 !important; outline:0 !important; box-shadow:none !important; background:transparent !important; }',
        'body.' + BODY_CLASS + ' .card-episode.focus .full-episode__img { filter: saturate(1.06) brightness(1.02) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 2px rgba(86,141,255,.92), 0 18px 42px rgba(0,0,0,.26), 0 8px 20px rgba(0,0,0,.14) !important; }',
        'body.' + BODY_CLASS + ' .card-episode.hover .full-episode__img { filter: saturate(1.02) brightness(1.01) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 10px 24px rgba(0,0,0,.16) !important; }',
        'body.' + BODY_CLASS + ':not(.' + GLARE_CLASS + ') .card-episode.focus .full-episode { transform: translateY(-.08em) scale(1.06) !important; }',
        'body.' + BODY_CLASS + ':not(.' + GLARE_CLASS + ') .card-episode.hover .full-episode { transform: translateY(-.04em) scale(1.03) !important; }',
        'body.' + GLARE_CLASS + ' .card, body.' + GLARE_CLASS + ' .card-episode, body.' + GLARE_CLASS + ' .full-start-new__poster { will-change: transform; transform-style: preserve-3d; }',
        'body.' + GLARE_CLASS + ' .card__view, body.' + GLARE_CLASS + ' .full-episode__img, body.' + GLARE_CLASS + ' .full-start-new__poster { position: relative; overflow: hidden; }',
        'body.' + GLARE_CLASS + ' .card .card__view::after, body.' + GLARE_CLASS + ' .card-episode .full-episode__img::after, body.' + GLARE_CLASS + ' .full-start-new__poster::after { content:"" !important; display:block !important; position:absolute; inset:-10%; border-radius:inherit; background: radial-gradient(ellipse at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,.20) 0%, rgba(255,255,255,.16) 12%, rgba(255,255,255,.10) 26%, rgba(255,255,255,.05) 42%, rgba(255,255,255,.02) 58%, rgba(255,255,255,0) 78%) !important; opacity:0; filter: blur(18px); transition: opacity .22s ease, transform .22s ease; pointer-events:none; z-index:8; mix-blend-mode: screen; }',
        'body.' + GLARE_CLASS + ' .card.focus .card__view::after, body.' + GLARE_CLASS + ' .card.hover .card__view::after, body.' + GLARE_CLASS + ' .card-episode.focus .full-episode__img::after, body.' + GLARE_CLASS + ' .card-episode.hover .full-episode__img::after, body.' + GLARE_CLASS + ' .full-start-new__poster.focus::after, body.' + GLARE_CLASS + ' .full-start-new__poster.hover::after { opacity: 1 !important; }',
        'body.' + GLARE_CLASS + ' .card.focus .card__view, body.' + GLARE_CLASS + ' .card.hover .card__view, body.' + GLARE_CLASS + ' .card-episode.focus .full-episode, body.' + GLARE_CLASS + ' .card-episode.hover .full-episode, body.' + GLARE_CLASS + ' .full-start-new__poster.focus, body.' + GLARE_CLASS + ' .full-start-new__poster.hover { transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(1.055) translateY(-.06em) !important; transition: transform .08s linear, box-shadow .24s ease, filter .24s ease !important; }',
        'body.' + BODY_CLASS + ' .card__vote, body.' + BODY_CLASS + ' .card__quality, body.' + BODY_CLASS + ' .card__type, body.' + BODY_CLASS + ' .card__promo-text, body.' + BODY_CLASS + ' .card__promo-title, body.' + BODY_CLASS + ' .full-person__photo, body.' + BODY_CLASS + ' .nfx-card-overlay__match { display:none !important; }',
        'body.' + BODY_CLASS + ' .card__title, body.' + BODY_CLASS + ' .card__age { display:none !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay { position:absolute; left:0; right:0; bottom:0; z-index:0; display:flex !important; flex-direction:column; justify-content:center; align-items:flex-start; opacity:1 !important; visibility:visible !important; border-radius:0 0 1.35em 1.35em !important; background:linear-gradient(0deg, rgba(6,8,14,.88) 0%, rgba(6,8,14,.56) 38%, rgba(6,8,14,.16) 68%, rgba(6,8,14,0) 100%) !important; padding:2.15em 1.02em .92em !important; transform: translateZ(14px); transition: transform .28s cubic-bezier(.22,.61,.36,1), opacity .24s ease; pointer-events:none; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="start"] .nfx-card-overlay { align-items:flex-start !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="start"] .nfx-card-overlay__title,',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="start"] .nfx-card-overlay__meta { text-align:left !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="center"] .nfx-card-overlay { align-items:center !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="center"] .nfx-card-overlay__title,',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="center"] .nfx-card-overlay__meta { text-align:center !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="end"] .nfx-card-overlay { align-items:flex-end !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="end"] .nfx-card-overlay__title,',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="end"] .nfx-card-overlay__meta { text-align:right !important; }',
        'body.' + BODY_CLASS + ' .card.focus .nfx-card-overlay { transform: translateZ(18px) translateY(-.02em); }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__logo, body.' + BODY_CLASS + ' img.nfx-card-overlay__logo { display:block !important; opacity:1 !important; visibility:visible !important; max-height:2.55em !important; max-width:82% !important; margin-bottom:.28em !important; border-radius:0 !important; clip-path:none !important; -webkit-clip-path:none !important; mask-image:none !important; -webkit-mask-image:none !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__title { color:#fff; font-size:1.02em !important; line-height:1.14 !important; font-weight:800 !important; text-shadow:0 2px 12px rgba(0,0,0,.5); white-space:normal !important; display:-webkit-box !important; -webkit-line-clamp:2 !important; -webkit-box-orient:vertical !important; overflow:hidden !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__meta { color:rgba(255,255,255,.88); font-size:.74em !important; margin-top:.2em !important; line-height:1.28 !important; white-space:normal !important; max-width:100% !important; text-shadow:0 1px 8px rgba(0,0,0,.45); }',
        'body.' + BODY_CLASS + ' .nfx-card-logo { position:absolute; top:.7em; left:.82em; z-index:4; display:inline-flex !important; opacity:1 !important; visibility:visible !important; align-items:center; justify-content:center; padding:.38em .88em; border-radius:.92em; background:rgba(12,14,20,.62); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.96); font-size:.74em; font-weight:800; letter-spacing:.05em; backdrop-filter: blur(10px) saturate(140%); -webkit-backdrop-filter: blur(10px) saturate(140%); pointer-events:none; }',
        'body.' + BODY_CLASS + ' { --agnative-scale: 1; --agnative-category-scale: 1; }',
        'body.' + BODY_CLASS + '[' + FONT_SIZE_ATTR + '="xs"] { --agnative-scale: .85; }',
        'body.' + BODY_CLASS + '[' + FONT_SIZE_ATTR + '="sm"] { --agnative-scale: .92; }',
        'body.' + BODY_CLASS + '[' + FONT_SIZE_ATTR + '="md"] { --agnative-scale: 1; }',
        'body.' + BODY_CLASS + '[' + FONT_SIZE_ATTR + '="lg"] { --agnative-scale: 1.12; }',
        'body.' + BODY_CLASS + '[' + FONT_SIZE_ATTR + '="xl"] { --agnative-scale: 1.24; }',
        'body.' + BODY_CLASS + '[' + CATEGORY_SIZE_ATTR + '="xs"] { --agnative-category-scale: .78; }',
        'body.' + BODY_CLASS + '[' + CATEGORY_SIZE_ATTR + '="sm"] { --agnative-category-scale: .9; }',
        'body.' + BODY_CLASS + '[' + CATEGORY_SIZE_ATTR + '="md"] { --agnative-category-scale: 1; }',
        'body.' + BODY_CLASS + '[' + CATEGORY_SIZE_ATTR + '="lg"] { --agnative-category-scale: 1.18; }',
        'body.' + BODY_CLASS + '[' + CATEGORY_SIZE_ATTR + '="xl"] { --agnative-category-scale: 1.4; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__item.selector { font-size: calc(.85em * var(--agnative-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-clock { font-size: calc(.88em * var(--agnative-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .items-line__title { font-size: calc(1em * var(--agnative-scale, 1) * var(--agnative-category-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .items-line__more.selector { font-size: calc(.72em * var(--agnative-scale, 1) * var(--agnative-category-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__title { font-size: calc(1em * var(--agnative-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__meta { font-size: calc(.72em * var(--agnative-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-logo { font-size: calc(.72em * var(--agnative-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-rating { position:absolute; top:.7em; right:.82em; z-index:4; display:inline-flex; align-items:center; justify-content:center; padding:.32em .66em; border-radius:.85em; background:rgba(12,14,20,.68); border:1px solid rgba(255,255,255,.14); color:rgba(255,255,255,.96); font-size: calc(.72em * var(--agnative-scale, 1)); font-weight:800; letter-spacing:.02em; backdrop-filter: blur(10px) saturate(140%); -webkit-backdrop-filter: blur(10px) saturate(140%); pointer-events:none; box-shadow: 0 4px 10px rgba(0,0,0,.24); }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="color"] .nfx-card-rating[data-score="1"]  { color:#ff4444 !important; border-color:rgba(255,68,68,.35) !important; }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="color"] .nfx-card-rating[data-score="2"]  { color:#ff6633 !important; border-color:rgba(255,102,51,.35) !important; }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="color"] .nfx-card-rating[data-score="3"]  { color:#ff8800 !important; border-color:rgba(255,136,0,.35) !important; }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="color"] .nfx-card-rating[data-score="4"]  { color:#ffaa00 !important; border-color:rgba(255,170,0,.35) !important; }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="color"] .nfx-card-rating[data-score="5"]  { color:#ffcc00 !important; border-color:rgba(255,204,0,.35) !important; }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="color"] .nfx-card-rating[data-score="6"]  { color:#ddee00 !important; border-color:rgba(221,238,0,.35) !important; }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="color"] .nfx-card-rating[data-score="7"]  { color:#aadd00 !important; border-color:rgba(170,221,0,.35) !important; }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="color"] .nfx-card-rating[data-score="8"]  { color:#66cc33 !important; border-color:rgba(102,204,51,.35) !important; }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="color"] .nfx-card-rating[data-score="9"]  { color:#33bb33 !important; border-color:rgba(51,187,51,.35) !important; }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="color"] .nfx-card-rating[data-score="10"] { color:#00bb44 !important; border-color:rgba(0,187,68,.35) !important; }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="mono"] .nfx-card-rating { color:rgba(255,255,255,.96) !important; background:rgba(255,255,255,.12) !important; border-color:rgba(255,255,255,.18) !important; }',
        'body.' + BODY_CLASS + '[' + BADGE_ATTR + '="off"] .nfx-card-logo { display:none !important; }',
        'body.' + BODY_CLASS + '[' + RATING_ATTR + '="off"] .nfx-card-rating { display:none !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card .card__view { padding-bottom:140% !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card__img, body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card__image { object-position:center center !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .nfx-card-overlay { display:flex !important; background:linear-gradient(0deg, rgba(4,5,10,1) 0%, rgba(4,5,10,.98) 18%, rgba(4,5,10,.88) 36%, rgba(4,5,10,.6) 58%, rgba(4,5,10,.2) 78%, rgba(4,5,10,0) 100%) !important; padding:5em 1em 1em !important; border-radius:0 0 1.35em 1.35em !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .nfx-card-rating { display:inline-flex !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .nfx-card-logo { display:inline-flex !important; }',
        'body.' + BODY_CLASS + '[' + BADGE_ATTR + '="off"][' + BACKDROP_ATTR + '="off"] .nfx-card-logo { display:none !important; }',
        'body.' + BODY_CLASS + '[' + RATING_ATTR + '="off"][' + BACKDROP_ATTR + '="off"] .nfx-card-rating { display:none !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .nfx-card-overlay__logo { max-height:2.2em !important; max-width:78% !important; margin-bottom:.24em !important; }',
        'body.' + BODY_CLASS + '[' + LOGO_SIZE_ATTR + '="xs"] .nfx-card-overlay__logo { max-width:50% !important; max-height:1.7em !important; }',
        'body.' + BODY_CLASS + '[' + LOGO_SIZE_ATTR + '="sm"] .nfx-card-overlay__logo { max-width:64% !important; max-height:1.95em !important; }',
        'body.' + BODY_CLASS + '[' + LOGO_SIZE_ATTR + '="lg"] .nfx-card-overlay__logo { max-width:90% !important; max-height:2.6em !important; }',
        'body.' + BODY_CLASS + '[' + LOGO_SIZE_ATTR + '="xl"] .nfx-card-overlay__logo { max-width:100% !important; max-height:3.1em !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .nfx-card-overlay__title { font-size: calc(.95em * var(--agnative-scale, 1)) !important; font-weight:800 !important; line-height:1.16 !important; white-space:normal !important; display:-webkit-box !important; -webkit-line-clamp:2 !important; -webkit-box-orient:vertical !important; overflow:hidden !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .nfx-card-overlay__meta { font-size: calc(.68em * var(--agnative-scale, 1)) !important; margin-top:.18em !important; opacity:.85 !important; white-space:normal !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card__title { display:none !important; }',
        'body.' + BODY_CLASS + ' .community-watches-line-title,',
        'body.' + BODY_CLASS + ' .community-watches__title,',
        'body.' + BODY_CLASS + ' .community-watches .items-line__title,',
        'body.' + BODY_CLASS + ' .community-watches__line-title {',
        '  font-size: calc(1em * var(--agnative-scale, 1) * var(--agnative-category-scale, 1)) !important;',
        '  line-height: 1.2 !important;',
        '  font-weight: 700 !important;',
        '  letter-spacing: .01em !important;',
        '  margin: 0 !important;',
        '}',
        'body.' + BODY_CLASS + ' .navigation-bar { position: fixed !important; left: 50% !important; bottom: 1.2em !important; transform: translateX(-50%) !important; z-index: 30 !important; width: 100% !important; max-width: calc(100vw - 2em) !important; font-size: 1.15em !important; padding: 0 1.5em 1em 1.5em !important; z-index: 10 !important;}',
        'body.' + BODY_CLASS + '.orientation--landscape .navigation-bar { width: auto !important; left: auto !important; transform: translateX(0) !important; height: 85% !important; top: 15% !important; }',
        'body.' + BODY_CLASS + ' .navigation-bar__body { width: 100% !important; height: 3.6em !important; box-sizing: border-box !important; display: flex !important; align-items: center !important; justify-content: space-around !important; padding: .28em .38em !important; border-radius: 999px !important; background: rgba(22,24,30,.82) !important; border: 1px solid rgba(255,255,255,.12) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 12px 32px rgba(0,0,0,.28) !important; backdrop-filter: blur(22px) saturate(145%) !important; -webkit-backdrop-filter: blur(22px) saturate(145%) !important; font-size: 1.6em !important; }',
        'body.' + BODY_CLASS + '.orientation--landscape .navigation-bar__body { width: auto !important; height: auto !important; min-width: 3em !important;}',
        'body.' + BODY_CLASS + ' .navigation-bar__item { width: 100% !important; height: 100% !important; appearance: none !important; -webkit-appearance: none !important; border: 0 !important; background: none !important; color: rgba(255,255,255,.88) !important; flex: 1 !important; display: inline-flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; padding: 0 !important; border-radius: 999px !important; font-size: 1em !important; font-weight: 700 !important; line-height: 1 !important; white-space: nowrap !important; transition: background .2s ease, transform .2s ease, box-shadow .2s ease, color .2s ease !important; cursor: pointer !important; }',
        'body.' + BODY_CLASS + ' .navigation-bar__icon { width: 1.48em !important; height: 1.48em !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; color: inherit !important; }',
        'body.' + BODY_CLASS + ' .navigation-bar__icon svg { width: 1.48em !important; height: 1.48em !important; stroke-width: 2 !important; }',
        'body.' + BODY_CLASS + ' .navigation-bar__label { display: none !important; }',
        'body.' + BODY_CLASS + ' .navigation-bar__item.is-active, body.' + BODY_CLASS + ' .navigation-bar__item.hover, body.' + BODY_CLASS + ' .navigation-bar__item.focus, body.' + BODY_CLASS + ' .navigation-bar__item:hover, body.' + BODY_CLASS + ' .navigation-bar__item:focus { background: rgba(255,255,255,.16) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.14) !important; color: rgba(255,255,255,.98) !important; transform: translateY(-.04em) !important; }',

        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .agnative-topnav-shell__inner { gap: 0 !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .agnative-topnav-shell__inner > * + * { margin-left: .18em !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .agnative-topnav-shell__items { gap: 0 !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .agnative-topnav-shell__items > * + * { margin-left: .08em !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .agnative-topnav-shell__right { gap: 0 !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .agnative-topnav-shell__right > * + * { margin-left: .08em !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .agnative-topnav-rightdock { gap: 0 !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .agnative-topnav-rightdock > * + * { margin-left: .08em !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .items-cards { gap: 0 !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .items-cards > * + * { margin-left: .62em !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .scroll__body.mapping--line { gap: 0 !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .scroll__body.mapping--line > * + * { margin-left: 1.5em !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .full-episode__date { gap: 0 !important; }',
        'body.' + BODY_CLASS + '[' + FLEX_GAP_ATTR + '="no"] .full-episode__date > * + * { margin-left: .5em !important; }',

        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .head__navigator,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .head__menu-icon,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-topnav-shell__inner,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-topnav-rightdock,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-topnav-clock,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-control-panel,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-control-panel__tile,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .navigation-bar__body,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .settings__content.layer--height,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .selectbox__content.layer--height,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .settings-input__content.layer--height,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .nfx-card-logo,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .nfx-card-rating,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card-episode .full-episode__num { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .head__navigator,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .head__menu-icon,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-topnav-shell__inner,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-topnav-rightdock,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-topnav-clock { background: rgba(22,24,30,.86) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-control-panel { background: rgba(40,48,62,.95) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .navigation-bar__body { background: rgba(22,24,30,.94) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .settings__content.layer--height { background: rgba(28,30,34,.96) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .selectbox__content.layer--height,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .settings-input__content.layer--height { background: rgba(26,29,34,.97) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .nfx-card-logo,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .nfx-card-rating,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card-episode .full-episode__num { background: rgba(12,14,20,.88) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card .card__view::after,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card-episode .full-episode__img::after,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .full-start-new__poster::after { display: none !important; content: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .nfx-card-overlay,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .navigation-bar__item,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-topnav-shell__item { transition-duration: .12s !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card.focus .card__view { filter: none !important; box-shadow: 0 0 0 2px rgba(86,141,255,.92), 0 6px 14px rgba(0,0,0,.22) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card.hover .card__view { filter: none !important; box-shadow: 0 0 0 2px rgba(86,141,255,.60), 0 6px 14px rgba(0,0,0,.18) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card-episode.focus .full-episode__img { filter: none !important; box-shadow: 0 0 0 2px rgba(86,141,255,.92), 0 6px 14px rgba(0,0,0,.22) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card-episode.hover .full-episode__img { filter: none !important; box-shadow: 0 0 0 2px rgba(86,141,255,.60), 0 6px 14px rgba(0,0,0,.18) !important; }',

        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card .card__view::after,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode .full-episode__img::after,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .full-start-new__poster::after { display: none !important; content: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .full-start-new__poster { will-change: auto !important; transform-style: flat !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .nfx-card-overlay,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .navigation-bar__item,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-topnav-shell__item,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card__view,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode .full-episode__img,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode .full-episode { transition: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card .card__view, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode .full-episode__img { clip-path: none !important; -webkit-clip-path: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card.focus .card__view { transform: none !important; filter: none !important; box-shadow: 0 2px 6px rgba(0,0,0,.4) !important; box-sizing: border-box !important; border-color: rgba(86,141,255,.95) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card.hover .card__view { transform: none !important; filter: none !important; box-shadow: 0 2px 6px rgba(0,0,0,.4) !important; box-sizing: border-box !important; border-color: rgba(86,141,255,.65) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode.focus .full-episode__img { filter: none !important; box-shadow: 0 2px 6px rgba(0,0,0,.4) !important; box-sizing: border-box !important; border-color: rgba(86,141,255,.95) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode.hover .full-episode__img { filter: none !important; box-shadow: 0 2px 6px rgba(0,0,0,.4) !important; box-sizing: border-box !important; border-color: rgba(86,141,255,.65) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode.focus .full-episode, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode.hover .full-episode { transform: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .head__navigator,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .head__menu-icon,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-topnav-shell__inner,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-topnav-rightdock,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-topnav-clock { background: rgba(22,24,30,.96) !important; box-shadow: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-control-panel { background: rgba(28,30,34,.98) !important; box-shadow: 0 4px 10px rgba(0,0,0,.4) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .navigation-bar__body { background: rgba(22,24,30,.98) !important; box-shadow: 0 4px 10px rgba(0,0,0,.35) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings__content.layer--height,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .selectbox__content.layer--height,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings-input__content.layer--height { background: rgba(22,24,30,.98) !important; box-shadow: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .nfx-card-logo,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .nfx-card-rating,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode .full-episode__num { background: rgba(12,14,20,.94) !important; box-shadow: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card .card__view,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode .full-episode__img { box-shadow: 0 2px 6px rgba(0,0,0,.4) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .nfx-card-overlay { background: linear-gradient(0deg, rgba(6,8,14,.92) 0%, rgba(6,8,14,.4) 60%, rgba(6,8,14,0) 100%) !important; }',

        'body.' + BODY_CLASS + ' .wrap__left,',
        'body.' + BODY_CLASS + ' .menu,',
        'body.' + BODY_CLASS + ' .menu__content,',
        'body.' + BODY_CLASS + ' .menu .menu__list {',
        '  width: 0 !important;',
        '  min-width: 0 !important;',
        '  max-width: 0 !important;',
        '  padding: 0 !important;',
        '  margin: 0 !important;',
        '  border: 0 !important;',
        '  overflow: hidden !important;',
        '  visibility: hidden !important;',
        '  pointer-events: none !important;',
        '  opacity: 0 !important;',
        '  background: transparent !important;',
        '  background-image: none !important;',
        '  box-shadow: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .wrap__left .menu__item,',
        'body.' + BODY_CLASS + ' .menu .menu__item {',
        '  pointer-events: none !important;',
        '}',

        'body.' + BODY_CLASS + ' .agnative-leftdock {',
        '  position: fixed !important;',
        '  left: 1em !important;',
        '  top: 50% !important;',
        '  transform: translateX(-130%) translateY(-50%) !important;',
        '  z-index: 25 !important;',
        '  width: max-content !important;',
        '  max-width: 16em !important;',
        '  max-height: 80vh !important;',
        '  overflow-y: auto !important;',
        '  display: inline-flex !important;',
        '  flex-direction: column !important;',
        '  padding: .32em !important;',
        '  border-radius: 1.35em !important;',
        '  background: rgba(22,24,30,.42) !important;',
        '  border: 1px solid rgba(255,255,255,.10) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 12px 32px rgba(0,0,0,.28) !important;',
        '  backdrop-filter: blur(22px) saturate(140%) !important;',
        '  -webkit-backdrop-filter: blur(22px) saturate(140%) !important;',
        '  font-size: calc(clamp(0.95rem, 1.7vmin, 1.4rem) * var(--agnative-scale, 1)) !important;',
        '  opacity: 0 !important;',
        '  pointer-events: none !important;',
        '  transition: transform .28s cubic-bezier(.22,.61,.36,1), opacity .2s ease !important;',
        '}',
        'body.' + BODY_CLASS + ' .agnative-leftdock.is-visible {',
        '  transform: translateX(0) translateY(-50%) !important;',
        '  opacity: 1 !important;',
        '  pointer-events: auto !important;',
        '}',
        'body.' + BODY_CLASS + ' .agnative-leftdock__inner { display: flex; flex-direction: column; gap: .12em; }',
        'body.' + BODY_CLASS + ' .agnative-leftdock__case { display: flex; flex-direction: column; gap: .04em; }',
        'body.' + BODY_CLASS + ' .agnative-leftdock__split { height: 1px; margin: .3em .4em; background: rgba(255,255,255,.10); }',
        'body.' + BODY_CLASS + ' .agnative-leftdock__item.selector {',
        '  appearance: none; -webkit-appearance: none; border: 0; background: none;',
        '  color: rgba(255,255,255,.92);',
        '  min-height: 2.6em;',
        '  display: flex; align-items: center; gap: .35em;',
        '  padding: .4em .9em;',
        '  border-radius: 999px;',
        '  font-size: .92em; font-weight: 700; line-height: 1.1; white-space: nowrap;',
        '  transition: background .2s ease, transform .2s ease, box-shadow .2s ease;',
        '  cursor: pointer;',
        '}',
        'body.' + BODY_CLASS + ' .agnative-leftdock__item.is-active,',
        'body.' + BODY_CLASS + ' .agnative-leftdock__item.hover,',
        'body.' + BODY_CLASS + ' .agnative-leftdock__item.focus {',
        '  background: rgba(255,255,255,.16) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.14) !important;',
        '  transform: translateX(.04em) !important;',
        '}',
        'body.' + BODY_CLASS + ' .agnative-leftdock__item .menu__ico { width: 1.5em; height: 1.5em; min-width: 1.5em; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; margin-right: .3em !important; color: currentColor; }',
        'body.' + BODY_CLASS + ' .agnative-leftdock__item .menu__ico svg { width: 1.5em; height: 1.5em; color: currentColor; }',
        'body.' + BODY_CLASS + ' .agnative-leftdock__item .menu__text { display: inline-block; flex: 1 1 auto; }',

        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-leftdock,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-leftdock {',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '  background: rgba(22,24,30,.94) !important;',
        '  box-shadow: 0 4px 12px rgba(0,0,0,.4) !important;',
        '}',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-leftdock {',
        '  transition: opacity .15s ease !important;',
        '}',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-leftdock {',
        '  transition: none !important;',
        '  transform: translateX(-130%) translateY(-50%) !important;',
        '}',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-leftdock.is-visible {',
        '  transform: translateX(0) translateY(-50%) !important;',
        '}',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-leftdock__item.selector,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-leftdock__item.selector {',
        '  transition: background .12s ease !important;',
        '}',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-leftdock__item.selector {',
        '  transition: none !important;',
        '}',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-leftdock__item.is-active,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-leftdock__item.hover,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .agnative-leftdock__item.focus,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-leftdock__item.is-active,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-leftdock__item.hover,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .agnative-leftdock__item.focus {',
        '  transform: none !important;',
        '  box-shadow: 0 0 0 2px rgba(86,141,255,.92) !important;',
        '}',

        '@media (max-width: 767px) {',
        '  body.' + BODY_CLASS + ' .agnative-topnav-shell { display: none !important; }',
        '  body.' + BODY_CLASS + ' .agnative-topnav-rightdock { font-size: 1.3em !important; }',
        '  body.' + BODY_CLASS + ' .head__menu-icon { font-size: 1.3em !important; }',
        '  body.' + BODY_CLASS + ' .head__navigator { position: absolute !important; top: 0 !important; left: 1em !important; font-size: 1.3em !important; }',
        '  body.' + BODY_CLASS + ' .activity.layer--width.activity--active { padding-top: 2em !important; }',
        '  body.' + BODY_CLASS + ' .head__navigator:empty { display: none !important; }',
        '}'
      ].join('\n');
      if (style.textContent !== text) style.textContent = text;
      if (!style.parentNode) {
        if (document.body) document.body.appendChild(style);
        else document.head.appendChild(style);
      }
      styleSignature = STYLE_ID;
    }

    function iconSearch() {
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"></circle><path d="M16 16L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>';
    }

    function iconSettings() {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/></svg>';
    }

    function iconProfile() {
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4.1" stroke="currentColor" stroke-width="2"></circle><path d="M4 20c0-3.9 3.8-6 8-6s8 2.1 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>';
    }

    function iconFavorite() {
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 3.5H15.5C17.433 3.5 19 5.067 19 7V21L12 17.1L5 21V7C5 5.067 6.567 3.5 8.5 3.5H7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>';
    }

    function iconSync() {
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12a8 8 0 0 0-13.66-5.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M4 5v4h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 12a8 8 0 0 0 13.66 5.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M20 19v-4h-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    }

    function iconPlayer() {
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"></rect><path d="M10 9.5L15 12L10 14.5V9.5Z" fill="currentColor"></path></svg>';
    }

    function iconData() {
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" stroke-width="2"></ellipse><path d="M5 6V18C5 19.66 8.13 21 12 21C15.87 21 19 19.66 19 18V6" stroke="currentColor" stroke-width="2"></path><path d="M5 12C5 13.66 8.13 15 12 15C15.87 15 19 13.66 19 12" stroke="currentColor" stroke-width="2"></path></svg>';
    }

    function iconBackward() {
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    }

    function iconEdit() {
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17V21H7L17 11L13 7L3 17Z"/><path d="M14 6L18 10"/></svg>';
    }

    function iconCircleLetter(letter) {
      var ch = (letter || '').charAt(0).toUpperCase() || '·';
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="2"/>'
        + '<text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">' + escapeHtml(ch) + '</text>'
        + '</svg>';
    }

    function pickLeftdockIcon(action, label) {
      var a = (action || '').toLowerCase();
      if (a === 'search') return iconSearch();
      if (a === 'favorite' || a === 'bookmarks') return iconFavorite();
      if (a === 'settings') return iconSettings();
      if (a === 'edit' || a === 'more') return iconEdit();
      return iconCircleLetter(label);
    }

    function iconHome() {
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    }

    function getProfileButtonHtml() {
      try {
        var permit = window.Lampa && Lampa.Account && Lampa.Account.Permit ? Lampa.Account.Permit : null;
        var profile = permit && permit.account ? permit.account.profile : null;
        var icon = profile && profile.icon ? profile.icon : '';
        var protocol = window.Lampa && Lampa.Utils && typeof Lampa.Utils.protocol === 'function' ? Lampa.Utils.protocol() : '';
        var domain = window.Lampa && Lampa.Manifest ? Lampa.Manifest.cub_domain : '';
        if (icon && protocol && domain) {
          return '<img class="agnative-topnav-right__profile-img" src="' + protocol + domain + '/img/profiles/' + icon + '.png" alt="profile">';
        }
      } catch (e) { }
      return iconProfile();
    }

    function triggerSelectorEvent(node, eventName) {
      if (!node || !eventName) return false;
      try {
        if (window.$) {
          $(node).trigger(eventName);
          return true;
        }
      } catch (e) { }
      return false;
    }

    function triggerSelectorEnter(node) {
      if (!node) return false;
      if (triggerSelectorEvent(node, 'hover:enter')) return true;
      clickNode(node);
      return true;
    }

    function normalizeTopnavAction(action) {
      var value = String(action || '').trim().toLowerCase();
      if (!value) return '';
      if (value === 'release' || value === 'releases') return 'relise';
      if (value === 'bookmarks') return 'favorite';
      if (value === 'schedule') return 'timetable';
      if (value === 'collection' || value === 'collections') return 'catalog';
      return value;
    }

    function clickNode(node) {
      if (!node) return;
      try {
        if (typeof node.click === 'function') node.click();
        else node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      } catch (e) { }
    }

    function getMenuItem(action) {
      action = normalizeTopnavAction(action);
      return qs('.menu .menu__item.selector[data-action="' + action + '"]');
    }

    function triggerMenuAction(action) {
      action = normalizeTopnavAction(action);
      try {
        if (!window.Lampa) return false;
        var nativeMenuItem = getMenuItem(action);
        if (nativeMenuItem && triggerSelectorEnter(nativeMenuItem)) return true;

        var Storage = Lampa.Storage;
        var Lang = Lampa.Lang;
        if (!Storage || !Lang || !Lampa.Activity) return false;

        if (action === 'movie' || action === 'tv' || action === 'anime') {
          Lampa.Activity.push({
            url: action,
            title: (action === 'movie' ? Lang.translate('menu_movies') : action === 'anime' ? Lang.translate('menu_anime') : Lang.translate('menu_tv')) + ' - ' + Storage.field('source').toUpperCase(),
            component: 'category',
            source: action === 'anime' ? 'cub' : Storage.field('source'),
            page: 1
          });
          return true;
        }

        if (action === 'cartoon') {
          Lampa.Activity.push({
            url: 'movie',
            title: Lang.translate('menu_multmovie') + ' - ' + Storage.field('source').toUpperCase(),
            component: 'category',
            genres: 16,
            page: 1
          });
          return true;
        }

        if (action === 'main') {
          Lampa.Activity.push({
            url: '',
            title: Lang.translate('title_main') + ' - ' + Storage.field('source').toUpperCase(),
            component: 'main',
            source: Storage.field('source')
          });
          return true;
        }
      } catch (e) { }
      return false;
    }

    function triggerSearch() {
      closeControlPanel(false);
      try {
        var menuItem = getMenuItem('search');
        if (menuItem && triggerSelectorEnter(menuItem)) return true;

        if (window.Lampa && Lampa.Search && typeof Lampa.Search.open === 'function') {
          Lampa.Search.open({});
          return true;
        }
      } catch (e) { }
      return false;
    }

    function triggerSettings() {
      closeControlPanel(false);
      try {
        var menuItem = getMenuItem('settings');
        if (menuItem) {
          triggerSelectorEnter(menuItem);
          return true;
        }

        if (window.Lampa && Lampa.ParentalControl && typeof Lampa.ParentalControl.personal === 'function') {
          Lampa.ParentalControl.personal('settings', function () {
            var nativeBtn = qs('.head__settings, .settings-icon-holder, .head__action.open--settings, .open--settings');
            if (nativeBtn) {
              triggerSelectorEnter(nativeBtn);
              return;
            }
            if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
              Lampa.Controller.toggle('settings');
            }
          }, false, true);
          return true;
        }
      } catch (e) { }
      return false;
    }

    function openSettingsComponent(componentName) {
      try {
        if (!window.Lampa) return false;
        if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
          Lampa.Controller.toggle('settings');
        }
        if (Lampa.Settings && typeof Lampa.Settings.create === 'function') {
          setTimeout(function () {
            try {
              Lampa.Settings.create(componentName);
            } catch (e) {
              if (componentName !== 'more') Lampa.Settings.create('more');
            }
          }, 40);
          return true;
        }
      } catch (e) { }
      return triggerSettings();
    }

    function triggerSyncSettings() {
      closeControlPanel(false);
      return openSettingsComponent('account');
    }

    function triggerPlayerSettings() {
      closeControlPanel(false);
      return openSettingsComponent('player');
    }

    function triggerCacheDataSettings() {
      closeControlPanel(false);
      return openSettingsComponent('data');
    }

    function triggerFavorite() {
      closeControlPanel(false);
      try {
        var menuItem = getMenuItem('favorite');
        if (menuItem && triggerSelectorEnter(menuItem)) return true;

        if (window.Lampa && Lampa.ParentalControl && typeof Lampa.ParentalControl.personal === 'function' && Lampa.Activity && Lampa.Lang) {
          Lampa.ParentalControl.personal('bookmarks', function () {
            Lampa.Activity.push({ component: 'bookmarks', title: Lampa.Lang.translate('settings_input_links') });
          }, false, true);
          return true;
        }
      } catch (e) { }
      return false;
    }

    function langText(key, fallback) {
      try {
        if (window.Lampa && Lampa.Lang && typeof Lampa.Lang.translate === 'function') {
          var value = Lampa.Lang.translate(key);
          if (value && value !== key) return value;
        }
      } catch (e) { }
      return fallback;
    }

    function triggerProfile() {
      closeControlPanel(false);
      try {
        var openProfilesDirect = function () {
          if (window.Lampa && Lampa.Account && Lampa.Account.Profile && typeof Lampa.Account.Profile.select === 'function') {
            Lampa.Account.Profile.select(function () {
              if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
                Lampa.Controller.toggle('head');
              }
            });
            return true;
          }

          if (window.Lampa && Lampa.Account && typeof Lampa.Account.showProfiles === 'function') {
            Lampa.Account.showProfiles(function () {
              if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
                Lampa.Controller.toggle('head');
              }
            });
            return true;
          }
          return false;
        };

        var nativeBtn = qs('.head__action.open--profile, .open--profile');
        if (nativeBtn) {
          triggerSelectorEnter(nativeBtn);
          setTimeout(function () {
            if (!document.body) return;
            if (document.body.classList.contains('selectbox--open')) return;
            openProfilesDirect();
          }, 80);
          return true;
        }

        return openProfilesDirect();
      } catch (e) { }
      return false;
    }

    function consumeEvent(e) {
      if (!e) return false;
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      return false;
    }

    function markSwallowClick(ms) {
      swallowClickUntil = Date.now() + (typeof ms === 'number' ? ms : 260);
    }

    function bindControlPanelOutsideClose() {
      if (controlPanelOutsideHandler || !document || !document.addEventListener) return;

      controlPanelOutsideHandler = function (e) {
        if (!controlPanelOpen) return;
        var target = e && e.target;
        if (!target) return;
        if (target.closest && target.closest('.agnative-control-panel')) return;
        if (target.closest && target.closest('.agnative-topnav-clock')) return;
        closeControlPanel(true);
        markSwallowClick(280);
        consumeEvent(e);
      };

      controlPanelSwallowHandler = function (e) {
        if (Date.now() >= swallowClickUntil) return;
        consumeEvent(e);
      };

      document.addEventListener('mousedown', controlPanelOutsideHandler, true);
      document.addEventListener('touchstart', controlPanelOutsideHandler, true);
      document.addEventListener('click', controlPanelSwallowHandler, true);
    }

    function unbindControlPanelOutsideClose() {
      if (!controlPanelOutsideHandler) return;
      document.removeEventListener('mousedown', controlPanelOutsideHandler, true);
      document.removeEventListener('touchstart', controlPanelOutsideHandler, true);
      document.removeEventListener('click', controlPanelSwallowHandler, true);
      controlPanelOutsideHandler = null;
      controlPanelSwallowHandler = null;
    }

    function ensureControlPanelController(panel) {
      if (controlPanelControllerReady || !window.Lampa || !Lampa.Controller || !Lampa.Controller.add || !window.$) return;
      controlPanelControllerReady = true;

      Lampa.Controller.add('agnative_control_panel', {
        toggle: function () {
          var view = $(panel);
          var target = qs('.agnative-control-panel__tile.selected', panel) || qs('.agnative-control-panel__tile.selector', panel);
          Lampa.Controller.collectionSet(view);
          Lampa.Controller.collectionFocus(target || false, view, true);
        },
        up: function () { if (window.Navigator && Navigator.move) Navigator.move('up'); },
        down: function () { if (window.Navigator && Navigator.move) Navigator.move('down'); },
        left: function () { if (window.Navigator && Navigator.move) Navigator.move('left'); },
        right: function () { if (window.Navigator && Navigator.move) Navigator.move('right'); },
        back: function () { closeControlPanel(true); }
      });
    }

    function ensureControlPanel(head) {
      if (!controlPanelEnabled()) return null;
      if (!head) return null;
      var panel = qs('.agnative-control-panel', head);
      if (!panel) {
        panel = document.createElement('div');
        panel.className = 'agnative-control-panel';
        panel.setAttribute('aria-hidden', 'true');
        head.appendChild(panel);
      }

      panel.innerHTML = '<div class="agnative-control-panel__title">' + escapeHtml(langText('settings_cub_account', 'Account')) + '</div><div class="agnative-control-panel__grid"></div>';
      var grid = qs('.agnative-control-panel__grid', panel);
      if (!grid) return panel;

      [
        { role: 'settings', title: langText('title_settings', 'Settings'), icon: iconSettings(), handler: triggerSettings },
        { role: 'sync', title: langText('settings_cub_sync', 'Synchronization'), icon: iconSync(), handler: triggerSyncSettings },
        { role: 'player', title: langText('settings_main_player', 'Player'), icon: iconPlayer(), handler: triggerPlayerSettings },
        { role: 'data', title: langText('settings_rest_cache_all', 'Cache & Data'), icon: iconData(), handler: triggerCacheDataSettings }
      ].forEach(function (def) {
        var tile = document.createElement('div');
        tile.className = 'agnative-control-panel__tile selector';
        tile.setAttribute('data-role', def.role);
        tile.setAttribute('data-selector', 'true');
        tile.setAttribute('tabindex', '0');
        tile.innerHTML = '<span class="agnative-control-panel__icon">' + def.icon + '</span><span class="agnative-control-panel__label">' + escapeHtml(def.title) + '</span>';
        bindAction(tile, function () {
          closeControlPanel(true);
          def.handler();
        });
        grid.appendChild(tile);
      });

      ensureControlPanelController(panel);
      return panel;
    }

    function openControlPanel(head) {
      var panel = ensureControlPanel(head || qs('.head__body') || qs('.head'));
      if (!panel) return false;
      if (controlPanelOpen) return true;

      controlPanelOpen = true;
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      bindControlPanelOutsideClose();

      try {
        if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.enabled === 'function') {
          var current = Lampa.Controller.enabled();
          controlPanelPrevController = current && current.name ? current.name : '';
        }
        if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
          Lampa.Controller.toggle('agnative_control_panel');
        }
      } catch (e) { }
      return true;
    }

    function closeControlPanel(restoreController) {
      var panel = qs('.agnative-control-panel');
      if (!panel || !controlPanelOpen) return false;

      controlPanelOpen = false;
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      unbindControlPanelOutsideClose();

      try {
        if (restoreController && controlPanelPrevController && window.Lampa && Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
          Lampa.Controller.toggle(controlPanelPrevController);
        }
      } catch (e) { }

      return true;
    }

    function triggerClockActions(head) {
      if (!controlPanelEnabled()) {
        closeControlPanel(false);
        return false;
      }
      if (controlPanelOpen) return closeControlPanel(true);
      return openControlPanel(head);
    }

    function bindAction(btn, fn) {
      if (!btn || !fn) return;
      var busy = false;
      function run(e) {
        if (busy) return false;
        busy = true;
        setTimeout(function () { busy = false; }, 180);
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        fn();
        return false;
      }
      btn.addEventListener('click', run);
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') run(e);
      });
      btn.addEventListener('mouseenter', function () { btn.classList.add('hover'); });
      btn.addEventListener('mouseleave', function () { btn.classList.remove('hover'); });
      if (window.$) {
        try {
          $(btn).off('.agnativeTopnavAction');
          $(btn).on('hover:enter.agnativeTopnavAction', run);
          $(btn).on('hover:focus.agnativeTopnavAction hover:hover.agnativeTopnavAction', function () {
            btn.classList.add('focus');
          });
          $(btn).on('hover:blur.agnativeTopnavAction hover:out.agnativeTopnavAction', function () {
            btn.classList.remove('focus');
          });
        } catch (e) { }
      }
    }

    function bindMenu(btn, actionName, sourceNode) {
      if (!btn) return;
      var busy = false;
      function run(e) {
        if (busy) return false;
        busy = true;
        setTimeout(function () { busy = false; }, 180);
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        if (actionName && triggerMenuAction(actionName)) return;
        if (sourceNode) clickNode(sourceNode);
        return false;
      }
      btn.addEventListener('click', run);
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') run(e);
      });
      btn.addEventListener('mouseenter', function () { btn.classList.add('hover'); });
      btn.addEventListener('mouseleave', function () { btn.classList.remove('hover'); });
      if (window.$) {
        try {
          $(btn).off('.agnativeTopnavMenu');
          $(btn).on('hover:enter.agnativeTopnavMenu', run);
          $(btn).on('hover:focus.agnativeTopnavMenu hover:hover.agnativeTopnavMenu', function () {
            btn.classList.add('focus');
          });
          $(btn).on('hover:blur.agnativeTopnavMenu hover:out.agnativeTopnavMenu', function () {
            btn.classList.remove('focus');
          });
        } catch (e) { }
      }
    }

    function forwardWheelBelowTopnav(e) {
      if (e.__agnativeForwardedWheel) return;
      var head = qs('.head');
      if (!head) return;
      var prev = head.style.pointerEvents;
      head.style.pointerEvents = 'none';
      var below = null;
      try { below = document.elementFromPoint(e.clientX, e.clientY); } catch (err) { }
      head.style.pointerEvents = prev;
      if (!below || head.contains(below)) return;
      var WE = window.WheelEvent;
      if (typeof WE !== 'function') return;
      try {
        var clone = new WE('wheel', {
          bubbles: true,
          cancelable: true,
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          deltaZ: e.deltaZ,
          deltaMode: e.deltaMode,
          clientX: e.clientX,
          clientY: e.clientY,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          metaKey: e.metaKey
        });
        clone.__agnativeForwardedWheel = true;
        below.dispatchEvent(clone);
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
      } catch (err) { }
    }

    function attachTopnavWheelForwarding() {
      var head = qs('.head');
      if (!head || head.__agnativeWheelBound) return;
      head.__agnativeWheelBound = true;
      head.addEventListener('wheel', forwardWheelBelowTopnav, { passive: false });
    }

    function neutralizeMenuController() {
      if (menuControllerNeutralized) return;
      if (!window.Lampa || !Lampa.Controller || typeof Lampa.Controller.add !== 'function') return;
      menuControllerNeutralized = true;
      try {
        Lampa.Controller.add('menu', {
          toggle: function () {
            try { Lampa.Controller.toggle('agnative_leftdock'); } catch (e) { }
          },
          update: function () { },
          left:  function () { try { Lampa.Controller.toggle('agnative_leftdock'); } catch (e) { } },
          right: function () { try { Lampa.Controller.toggle('content'); }          catch (e) { } },
          up:    function () { try { Lampa.Controller.toggle('agnative_leftdock'); } catch (e) { } },
          down:  function () { try { Lampa.Controller.toggle('content'); }          catch (e) { } },
          back:  function () { try { Lampa.Controller.toggle('content'); }          catch (e) { } }
        });
      } catch (e) {
        menuControllerNeutralized = false;
      }
    }

    function patchActivityPushForMenu() {
      if (activityPushPatched) return;
      if (!window.Lampa || !Lampa.Activity || typeof Lampa.Activity.push !== 'function') return;
      activityPushPatched = true;
      try {
        activityPushOriginal = Lampa.Activity.push.bind(Lampa.Activity);
        Lampa.Activity.push = function (params) {
          if (params && params.component === 'menu') {
            try { Lampa.Controller.toggle('agnative_leftdock'); } catch (e) { }
            return;
          }
          return activityPushOriginal(params);
        };
      } catch (e) {
        activityPushPatched = false;
        activityPushOriginal = null;
      }
    }

    function registerTopnavController(shell) {
      if (!shell || !window.Lampa || !Lampa.Controller || !window.$) return;
      if (topnavControllerReady || typeof Lampa.Controller.add !== 'function') return;
      topnavControllerReady = true;
      try {
        Lampa.Controller.add('head', {
          toggle: function () {
            var headEl = qs('.head__body') || qs('.head');
            if (!headEl) return;
            var view = $(headEl);
            var firstItem = qs('.agnative-topnav-shell__item.selector', headEl)
              || qs('.agnative-topnav-shell .selector', headEl)
              || qs('.selector', headEl);
            Lampa.Controller.collectionSet(view);
            Lampa.Controller.collectionFocus(firstItem || false, view, true);
          },
          update: function () { },
          left: function () {
            if (window.Navigator && Navigator.canmove && !Navigator.canmove('left')) {
              try { Lampa.Controller.toggle('agnative_leftdock'); } catch (e) { }
              return;
            }
            if (window.Navigator && Navigator.move) Navigator.move('left');
          },
          right: function () {
            if (window.Navigator && Navigator.move) Navigator.move('right');
          },
          up: function () { },
          down: function () {
            if (window.Navigator && Navigator.canmove && Navigator.canmove('down')) {
              Navigator.move('down');
              return;
            }
            try { Lampa.Controller.toggle('content'); } catch (e) { }
          },
          back: function () {
            try { Lampa.Controller.toggle('agnative_leftdock'); } catch (e) { }
          }
        });
      } catch (e) {
        topnavControllerReady = false;
      }
    }

    function showLeftdock() {
      var dock = qs('.agnative-leftdock');
      if (!dock) return;
      dock.classList.add('is-visible');
      if (leftdockHoverHideTimer) {
        clearTimeout(leftdockHoverHideTimer);
        leftdockHoverHideTimer = 0;
      }
    }

    function hideLeftdock(immediate, force) {
      var dock = qs('.agnative-leftdock');
      if (!dock) return;
      if (!force && window.Lampa && Lampa.Controller && typeof Lampa.Controller.enabled === 'function') {
        var enabled = Lampa.Controller.enabled();
        if (enabled && enabled.name === 'agnative_leftdock') return;
      }
      if (immediate) {
        if (leftdockHoverHideTimer) {
          clearTimeout(leftdockHoverHideTimer);
          leftdockHoverHideTimer = 0;
        }
        dock.classList.remove('is-visible');
        return;
      }
      if (leftdockHoverHideTimer) clearTimeout(leftdockHoverHideTimer);
      leftdockHoverHideTimer = setTimeout(function () {
        dock.classList.remove('is-visible');
        leftdockHoverHideTimer = 0;
      }, 220);
    }

    function observeMenuChanges() {
      var menuList = qs('.menu .menu__list');
      if (!menuList) return;
      if (menuListObservedNode === menuList && menuChangesObserver) return;
      if (menuChangesObserver) {
        menuChangesObserver.disconnect();
        menuChangesObserver = null;
      }
      menuListObservedNode = menuList;
      if (typeof MutationObserver !== 'function') return;
      menuChangesObserver = new MutationObserver(function () {
        if (menuRebuildTimer) clearTimeout(menuRebuildTimer);
        menuRebuildTimer = setTimeout(function () {
          menuRebuildTimer = 0;
          buildLeftdock();
          syncLeftdockActive();
        }, 80);
      });
      menuChangesObserver.observe(menuList, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
    }

    function disconnectMenuObserver() {
      if (menuChangesObserver) {
        menuChangesObserver.disconnect();
        menuChangesObserver = null;
      }
      menuListObservedNode = null;
      if (menuRebuildTimer) {
        clearTimeout(menuRebuildTimer);
        menuRebuildTimer = 0;
      }
    }

    function patchControllerToggleForLeftdock() {
      if (controllerTogglePatched) return;
      if (!window.Lampa || !Lampa.Controller || typeof Lampa.Controller.toggle !== 'function') return;
      controllerTogglePatched = true;
      try {
        controllerToggleOriginal = Lampa.Controller.toggle.bind(Lampa.Controller);
        Lampa.Controller.toggle = function (name) {
          if (name && name !== 'agnative_leftdock') hideLeftdock(true, true);
          return controllerToggleOriginal(name);
        };
      } catch (e) {
        controllerTogglePatched = false;
        controllerToggleOriginal = null;
      }
    }

    function bindHeadMenuIconClick() {
      var btn = qs('.head__menu-icon');
      if (!btn || btn.__agnativeMenuIconBound) return;
      btn.__agnativeMenuIconBound = true;

      var lastTrigger = 0;
      var trigger = function (e) {
        var now = Date.now();
        if (now - lastTrigger < 250) {
          if (e && e.preventDefault) e.preventDefault();
          if (e && e.stopPropagation) e.stopPropagation();
          if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
          return;
        }
        lastTrigger = now;
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
        try {
          var enabled = (Lampa.Controller.enabled && Lampa.Controller.enabled()) || null;
          if (enabled && enabled.name === 'agnative_leftdock') {
            Lampa.Controller.toggle('content');
          } else {
            Lampa.Controller.toggle('agnative_leftdock');
          }
        } catch (err) { }
      };

      var swallow = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
      };

      btn.addEventListener('pointerup', trigger, true);
      btn.addEventListener('click', trigger, true);
      btn.addEventListener('touchstart', swallow, { capture: true, passive: true });
      btn.addEventListener('touchend', swallow, { capture: true, passive: true });
      btn.addEventListener('mousedown', swallow, true);
    }

    function buildLeftdock() {
      if (!document.body) return null;
      var dock = qs('.agnative-leftdock');
      if (!dock) {
        dock = document.createElement('div');
        dock.className = 'agnative-leftdock';
        document.body.appendChild(dock);
      }

      var sourceMenu = qs('.menu');
      if (!sourceMenu) return dock;

      var inner = document.createElement('div');
      inner.className = 'agnative-leftdock__inner';

      Array.prototype.slice.call(sourceMenu.children).forEach(function (child) {
        if (!child || !child.classList) return;
        if (child.classList.contains('menu__case')) {
          var caseEl = document.createElement('div');
          caseEl.className = 'agnative-leftdock__case';
          qsa('.menu__item.selector', child).forEach(function (item) {
            if (item.classList.contains('hidden')) return;
            var btn = document.createElement('div');
            btn.className = 'agnative-leftdock__item selector';
            btn.setAttribute('data-selector', 'true');
            btn.setAttribute('tabindex', '0');
            var action = item.getAttribute('data-action');
            if (action) btn.setAttribute('data-action', action);
            btn.innerHTML = item.innerHTML;
            var labelNode = qs('.menu__text, .menu__item-name, .menu__item-text', btn);
            var label = labelNode ? (labelNode.textContent || '').trim() : '';
            var icoEl = qs('.menu__ico', btn);
            if (icoEl) {
              icoEl.innerHTML = pickLeftdockIcon(action, label || action);
            }
            (function (sourceItem) {
              bindAction(btn, function () { triggerSelectorEnter(sourceItem); });
            })(item);
            caseEl.appendChild(btn);
          });
          if (caseEl.children.length) inner.appendChild(caseEl);
        } else if (child.classList.contains('menu__split')) {
          var split = document.createElement('div');
          split.className = 'agnative-leftdock__split';
          inner.appendChild(split);
        }
      });

      dock.innerHTML = '';
      dock.appendChild(inner);

      registerLeftdockController(dock);
      bindLeftdockAutoScroll(dock);
      syncLeftdockActive();
      return dock;
    }

    function scrollLeftdockItemIntoView(item, dock) {
      if (!item || !dock) return;
      var dockRect = dock.getBoundingClientRect();
      var itemRect = item.getBoundingClientRect();
      var pad = 6;
      if (itemRect.top < dockRect.top + pad) {
        dock.scrollTop -= (dockRect.top + pad - itemRect.top);
      } else if (itemRect.bottom > dockRect.bottom - pad) {
        dock.scrollTop += (itemRect.bottom - (dockRect.bottom - pad));
      }
    }

    function bindLeftdockAutoScroll(dock) {
      if (!dock || dock.__agnativeAutoScrollObserver || typeof MutationObserver !== 'function') return;
      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
          var target = m.target;
          if (!target || !target.classList) continue;
          if (!target.classList.contains('agnative-leftdock__item')) continue;
          if (!target.classList.contains('focus')) continue;
          scrollLeftdockItemIntoView(target, dock);
        }
      });
      observer.observe(dock, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true
      });
      dock.__agnativeAutoScrollObserver = observer;
    }

    function syncLeftdockActive() {
      var dock = qs('.agnative-leftdock');
      if (!dock) return;
      qsa('.agnative-leftdock__item[data-action]', dock).forEach(function (btn) {
        btn.classList.remove('is-active');
        var source = getMenuItem(btn.getAttribute('data-action'));
        if (source && (source.classList.contains('active') || source.classList.contains('focus') || source.classList.contains('hover'))) {
          btn.classList.add('is-active');
        }
      });
    }

    function registerLeftdockController(dock) {
      if (leftdockControllerReady) return;
      if (!dock || !window.Lampa || !Lampa.Controller || typeof Lampa.Controller.add !== 'function' || !window.$) return;
      leftdockControllerReady = true;
      try {
        Lampa.Controller.add('agnative_leftdock', {
          toggle: function () {
            var d = qs('.agnative-leftdock');
            if (!d) return;
            showLeftdock();
            var view = $(d);
            var current = qs('.agnative-leftdock__item.is-active', d)
              || qs('.agnative-leftdock__item.selector', d);
            Lampa.Controller.collectionSet(view);
            Lampa.Controller.collectionFocus(current || false, view, true);
          },
          update: function () { },
          gone: function () {
            hideLeftdock(true, true);
          },
          up: function () {
            if (window.Navigator && Navigator.move) Navigator.move('up');
          },
          down: function () {
            if (window.Navigator && Navigator.move) Navigator.move('down');
          },
          left: function () { },
          right: function () {
            try { Lampa.Controller.toggle('content'); } catch (e) { }
          },
          back: function () {
            try { Lampa.Controller.toggle('content'); } catch (e) { }
          }
        });
      } catch (e) {
        leftdockControllerReady = false;
      }
    }

    function ensureRightDock(head) {
      if (!head) return null;
      var dock = qs('.agnative-topnav-rightdock', head);
      if (!dock) {
        dock = document.createElement('div');
        dock.className = 'agnative-topnav-rightdock';
        head.appendChild(dock);
      }
      return dock;
    }

    function ensureClock(head) {
      if (!head) return null;
      var dock = ensureRightDock(head) || head;
      var clock = qs('#' + CLOCK_ID, dock) || qs('#' + CLOCK_ID, head);
      if (!clock) {
        clock = document.createElement('div');
        clock.id = CLOCK_ID;
        clock.className = 'agnative-topnav-clock selector';
        clock.setAttribute('data-selector', 'true');
        clock.setAttribute('tabindex', '0');
        bindAction(clock, function () { triggerClockActions(head); });
      }
      if (clock.parentNode !== dock) dock.appendChild(clock);
      return clock;
    }

    function ensureProfileButton(head) {
      if (!head) return null;
      var dock = ensureRightDock(head) || head;
      var profileBtn = qs('.agnative-topnav-right__profile[data-role="profile"]', dock) || qs('.agnative-topnav-right__profile[data-role="profile"]', head);
      if (!profileBtn) {
        profileBtn = document.createElement('div');
        profileBtn.className = 'agnative-topnav-shell__item agnative-topnav-right__profile selector';
        profileBtn.setAttribute('data-role', 'profile');
        profileBtn.setAttribute('data-selector', 'true');
        profileBtn.setAttribute('tabindex', '0');
        bindAction(profileBtn, triggerProfile);
      }
      profileBtn.innerHTML = getProfileButtonHtml();
      if (profileBtn.parentNode !== dock) dock.appendChild(profileBtn);
      return profileBtn;
    }

    function updateClock() {
      var clock = document.getElementById(CLOCK_ID);
      if (!clock) return;
      var d = new Date();
      var text = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      if (clockSecondsEnabled()) text += ':' + String(d.getSeconds()).padStart(2, '0');
      clock.textContent = text;
    }

    function startClock() {
      updateClock();
      if (clockTimer) return;
      var period = clockSecondsEnabled() ? 1000 : 1000 * 20;
      clockTimer = setInterval(updateClock, period);
    }

    function restartClock() {
      if (clockTimer) {
        clearInterval(clockTimer);
        clockTimer = null;
      }
      startClock();
    }

    function patchTopnav() {
      var head = qs('.head__body') || qs('.head');
      if (!head) return false;

      attachTopnavWheelForwarding();
      bindHeadMenuIconClick();
      ensureClock(head);
      ensureProfileButton(head);
      startClock();

      var shell = qs('.agnative-topnav-shell', head);
      if (!shell) {
        shell = document.createElement('div');
        shell.className = 'agnative-topnav-shell';
        shell.innerHTML = '<div class="agnative-topnav-shell__inner"><div class="agnative-topnav-shell__items"></div><div class="agnative-topnav-shell__right"></div></div>';
      }
      if (shell.parentNode !== head || head.firstChild !== shell) {
        head.insertBefore(shell, head.firstChild);
      }

      var itemsWrap = qs('.agnative-topnav-shell__items', shell);
      var rightWrap = qs('.agnative-topnav-shell__right', shell);
      if (!itemsWrap || !rightWrap) return false;

      itemsWrap.innerHTML = '';
      rightWrap.innerHTML = '';

      getSelectedTopnavItems().forEach(function (def) {
        var sourceNode = getMenuItem(def.action);
        var btn = document.createElement('div');
        btn.className = 'agnative-topnav-shell__item selector';
        btn.setAttribute('data-action', def.action);
        btn.setAttribute('data-selector', 'true');
        btn.setAttribute('tabindex', '0');
        btn.textContent = def.label;
        bindMenu(btn, def.action, sourceNode);
        itemsWrap.appendChild(btn);
      });

      var iconItems = [
        { role: 'search', svg: iconSearch(), handler: triggerSearch },
        { role: 'favorite', svg: iconFavorite(), handler: triggerFavorite }
      ];
      if (!controlPanelEnabled()) {
        iconItems.push({ role: 'settings', svg: iconSettings(), handler: triggerSettings });
      }

      iconItems.forEach(function (def) {
        var btn = document.createElement('div');
        btn.className = 'agnative-topnav-shell__item agnative-topnav-shell__item--icon selector';
        btn.setAttribute('data-role', def.role);
        btn.setAttribute('data-selector', 'true');
        btn.setAttribute('tabindex', '0');
        btn.innerHTML = def.svg;
        bindAction(btn, def.handler);
        rightWrap.appendChild(btn);
      });

      registerTopnavController(shell);

      qsa('.agnative-topnav-shell__item[data-action]', shell).forEach(function (btn) {
        btn.classList.remove('is-active');
        var source = getMenuItem(btn.getAttribute('data-action'));
        if (source && (source.classList.contains('active') || source.classList.contains('focus') || source.classList.contains('hover'))) {
          btn.classList.add('is-active');
        }
      });

      return true;
    }

    function fetchLogo(id, type, callback) {
      if (!id) return callback(null);
      var lang = getLogoLang();
      var cacheKey = type + '/' + id + '/' + lang;

      if (cacheKey in logoCache) return callback(logoCache[cacheKey]);

      if (logoPending[cacheKey]) {
        logoPending[cacheKey].push(callback);
        return;
      }

      logoPending[cacheKey] = [callback];

      metaGet(cacheKey, function (persisted) {
        if (persisted !== undefined) {
          logoCache[cacheKey] = persisted;
          var cbs = logoPending[cacheKey] || [];
          delete logoPending[cacheKey];
          for (var i = 0; i < cbs.length; i++) cbs[i](persisted);
          return;
        }

        var langs = [lang];
        if (lang !== 'en') langs.push('en');
        langs.push('null');

        var url = 'https://api.themoviedb.org/3/' + type + '/' + id +
          '/images?api_key=' + TMDB_KEY + '&include_image_language=' + langs.join(',');

        fetch(url).then(function (r) { return r.json(); }).then(function (data) {
          var logo = null;
          if (data.logos && data.logos.length) {
            var preferred = data.logos.filter(function (l) { return l.iso_639_1 === lang; });
            var english = data.logos.filter(function (l) { return l.iso_639_1 === 'en'; });
            var picked = preferred[0] || english[0] || data.logos[0];
            if (picked && picked.file_path) {
              logo = {
                path: picked.file_path,
                width: picked.width,
                height: picked.height
              };
            }
          }
          logoCache[cacheKey] = logo;
          metaSet(cacheKey, logo);
          if (logo) imgPreload(logoImgUrl(logo.path));
          var cbs = logoPending[cacheKey] || [];
          delete logoPending[cacheKey];
          for (var i = 0; i < cbs.length; i++) cbs[i](logo);
        }).catch(function () {
          logoCache[cacheKey] = null;
          var cbs = logoPending[cacheKey] || [];
          delete logoPending[cacheKey];
          for (var i = 0; i < cbs.length; i++) cbs[i](null);
        });
      });
    }

    function logoImgUrl(logoPath) {
      return Lampa.TMDB.image('t/p/w300' + logoPath);
    }

    function fetchTitledBackdrop(id, type, callback) {
      if (!id) return callback(null);
      var lang = getLogoLang();
      var cacheKey = 'titled_backdrop/' + type + '/' + id + '/' + lang;

      if (cacheKey in titledBackdropCache) return callback(titledBackdropCache[cacheKey]);

      if (titledBackdropPending[cacheKey]) {
        titledBackdropPending[cacheKey].push(callback);
        return;
      }
      titledBackdropPending[cacheKey] = [callback];

      metaGet(cacheKey, function (persisted) {
        if (persisted !== undefined) {
          titledBackdropCache[cacheKey] = persisted;
          var cbs = titledBackdropPending[cacheKey] || [];
          delete titledBackdropPending[cacheKey];
          for (var i = 0; i < cbs.length; i++) cbs[i](persisted);
          return;
        }

        var langs = [lang];
        if (lang !== 'en') langs.push('en');

        var url = 'https://api.themoviedb.org/3/' + type + '/' + id +
          '/images?api_key=' + TMDB_KEY + '&include_image_language=' + langs.join(',');

        fetch(url).then(function (r) { return r.json(); }).then(function (data) {
          var path = null;
          if (data.backdrops && data.backdrops.length) {
            var preferred = data.backdrops.filter(function (b) { return b.iso_639_1 === lang; });
            var english = data.backdrops.filter(function (b) { return b.iso_639_1 === 'en'; });
            var candidates = preferred.length ? preferred : english;
            if (candidates.length) {
              candidates.sort(function (a, b) { return (b.vote_average || 0) - (a.vote_average || 0); });
              path = candidates[0].file_path;
            }
          }
          titledBackdropCache[cacheKey] = path;
          metaSet(cacheKey, path);
          if (path) imgPreload(Lampa.TMDB.image('t/p/' + getBackdropQuality() + path));
          var cbs = titledBackdropPending[cacheKey] || [];
          delete titledBackdropPending[cacheKey];
          for (var i = 0; i < cbs.length; i++) cbs[i](path);
        }).catch(function () {
          titledBackdropCache[cacheKey] = null;
          var cbs = titledBackdropPending[cacheKey] || [];
          delete titledBackdropPending[cacheKey];
          for (var i = 0; i < cbs.length; i++) cbs[i](null);
        });
      });
    }

    function fetchCleanPoster(id, type, callback) {
      var cacheKey = 'poster/' + type + '/' + id;
      if (cacheKey in posterCache) return callback(posterCache[cacheKey]);

      if (posterPending[cacheKey]) { posterPending[cacheKey].push(callback); return; }
      posterPending[cacheKey] = [callback];

      metaGet(cacheKey, function (persisted) {
        if (persisted !== undefined) {
          posterCache[cacheKey] = persisted;
          var cbs = posterPending[cacheKey] || [];
          delete posterPending[cacheKey];
          for (var i = 0; i < cbs.length; i++) cbs[i](persisted);
          return;
        }

        var url = 'https://api.themoviedb.org/3/' + type + '/' + id +
          '/images?api_key=' + TMDB_KEY + '&include_image_language=null';

        fetch(url).then(function (r) { return r.json(); }).then(function (data) {
          var path = null;
          if (data.posters && data.posters.length) {
            var neutrals = data.posters.filter(function (p) { return !p.iso_639_1; });
            var picked = neutrals[0] || data.posters[0];
            if (picked && picked.file_path) path = picked.file_path;
          }
          posterCache[cacheKey] = path;
          metaSet(cacheKey, path);
          if (path) imgPreload(Lampa.TMDB.image('t/p/' + getPosterQuality() + path));
          var cbs = posterPending[cacheKey] || [];
          delete posterPending[cacheKey];
          for (var i = 0; i < cbs.length; i++) cbs[i](path);
        }).catch(function () {
          posterCache[cacheKey] = null;
          var cbs = posterPending[cacheKey] || [];
          delete posterPending[cacheKey];
          for (var i = 0; i < cbs.length; i++) cbs[i](null);
        });
      });
    }

    function switchCardToBackdrop(cardEl) {
      if (cardEl.getAttribute('data-nfx-switched')) return;
      cardEl.setAttribute('data-nfx-switched', '1');

      var data = extractCardData(cardEl);
      if (!data) return;

      var perfLevel = resolvePerfLevel();
      var isUltra = perfLevel === 'ultra';
      var cardImageMode = getCardImageMode();

      var imgEl = cardEl.querySelector('.card__img');
      var useHorizontal = backdropEnabled();

      function setImgUrl(url) {
        if (!imgEl) return;
        if (imgEl.tagName === 'IMG') {
          imgLoad(url, function (src) {
            imgEl.onload = function () { if (src !== url) URL.revokeObjectURL(src); };
            imgEl.onerror = function () { if (src !== url) URL.revokeObjectURL(src); };
            imgEl.src = src;
            imgEl.style.objectFit = 'cover';
            imgEl.style.objectPosition = 'center';
          });
        } else {
          imgLoad(url, function (src) {
            var prev = imgEl.getAttribute('data-nfx-blob');
            if (prev) URL.revokeObjectURL(prev);
            if (src !== url) imgEl.setAttribute('data-nfx-blob', src);
            imgEl.style.backgroundImage = 'url(' + src + ')';
            imgEl.style.backgroundSize = 'cover';
            imgEl.style.backgroundPosition = 'center';
          });
        }
      }

      if (imgEl && cardImageMode === 'backdrop') {
        if (imgEl.tagName === 'IMG') {
          if (!imgEl.hasAttribute('data-nfx-original-src')) {
            imgEl.setAttribute('data-nfx-original-src', imgEl.getAttribute('src') || '');
          }
        } else if (!imgEl.hasAttribute('data-nfx-original-bg')) {
          imgEl.setAttribute('data-nfx-original-bg', imgEl.style.backgroundImage || '');
        }
        if (data.backdrop_path) {
          setImgUrl(Lampa.TMDB.image('t/p/' + getBackdropQuality() + data.backdrop_path));
        }
      }

      if (cardImageMode === 'poster') {
        if (imgEl) {
          if (imgEl.tagName === 'IMG') {
            if (!imgEl.hasAttribute('data-nfx-original-src')) {
              imgEl.setAttribute('data-nfx-original-src', imgEl.getAttribute('src') || '');
            }
          } else if (!imgEl.hasAttribute('data-nfx-original-bg')) {
            imgEl.setAttribute('data-nfx-original-bg', imgEl.style.backgroundImage || '');
          }
        }

        var pTmdbType = data.name ? 'tv' : 'movie';
        var pView = cardEl.querySelector('.card__view');
        var pVote = data.vote_average ? parseFloat(data.vote_average) : 0;
        var pYear = '';
        if (data.release_date) pYear = data.release_date.substring(0, 4);
        else if (data.first_air_date) pYear = data.first_air_date.substring(0, 4);
        var pGenreNames = getGenreNames(data);
        var pMetaLeft = [];
        if (pVote > 0) pMetaLeft.push('<span class="nfx-card-overlay__match">' + Math.round(pVote * 10) + '%</span>');
        if (pYear) pMetaLeft.push('<span>' + pYear + '</span>');
        var pMetaParts = [];
        if (pMetaLeft.length) pMetaParts.push(pMetaLeft.join(' '));
        if (pGenreNames.length) pMetaParts.push('<span>' + escapeHtml(pGenreNames.slice(0, 2).join(', ')) + '</span>');
        var pMetaHtml = pMetaParts.length ? '<div class="nfx-card-overlay__meta">' + pMetaParts.join('<span style="opacity:0.4"> · </span>') + '</div>' : '';

        function buildPosterOverlay() {
          if (!pView || pView.querySelector('.nfx-card-overlay')) return;
          if (pMetaHtml) {
            var pOverlay = document.createElement('div');
            pOverlay.className = 'nfx-card-overlay';
            pOverlay.innerHTML = pMetaHtml;
            pView.appendChild(pOverlay);
          }
          if (badgeEnabled() && (data.title || data.name)) {
            var pBadge = document.createElement('div');
            pBadge.className = 'nfx-card-logo';
            pBadge.textContent = data.name ? t('badge_tv') : t('badge_movie');
            pView.appendChild(pBadge);
          }
          if (ratingEnabled() && pVote > 0) {
            var pRating = document.createElement('div');
            pRating.className = 'nfx-card-rating';
            pRating.setAttribute('data-score', Math.min(10, Math.max(1, Math.round(pVote))));
            pRating.textContent = pVote.toFixed(1);
            pView.appendChild(pRating);
          }
        }

        if (useHorizontal && data.id && !isUltra) {
          if (data.poster_path) setImgUrl(Lampa.TMDB.image('t/p/' + getPosterQuality() + data.poster_path));
          fetchTitledBackdrop(data.id, pTmdbType, function (titledPath) {
            if (titledPath) {
              setImgUrl(Lampa.TMDB.image('t/p/' + getBackdropQuality() + titledPath));
            }
            buildPosterOverlay();
          });
        } else {
          if (data.poster_path) setImgUrl(Lampa.TMDB.image('t/p/' + getPosterQuality() + data.poster_path));
          buildPosterOverlay();
        }
        return;
      }

      var view = cardEl.querySelector('.card__view');
      if (!view || view.querySelector('.nfx-card-overlay')) return;

      var title = data.title || data.name || '';
      if (!title) {
        var titleEl = cardEl.querySelector('.card__title');
        if (titleEl) title = titleEl.textContent.trim();
      }

      var vote = data.vote_average ? parseFloat(data.vote_average) : 0;
      var year = '';
      if (data.release_date) year = data.release_date.substring(0, 4);
      else if (data.first_air_date) year = data.first_air_date.substring(0, 4);

      var overlay = document.createElement('div');
      overlay.className = 'nfx-card-overlay';

      var metaLeft = [];
      if (vote > 0) metaLeft.push('<span class="nfx-card-overlay__match">' + Math.round(vote * 10) + '%</span>');
      if (year) metaLeft.push('<span>' + year + '</span>');
      var genreNames = getGenreNames(data);
      var metaParts = [];
      if (metaLeft.length) metaParts.push(metaLeft.join(' '));
      if (genreNames.length) metaParts.push('<span>' + escapeHtml(genreNames.slice(0, 2).join(', ')) + '</span>');
      var metaHtml = metaParts.length ? '<div class="nfx-card-overlay__meta">' + metaParts.join('<span style="opacity:0.4"> · </span>') + '</div>' : '';

      var titleHtml = title ? '<div class="nfx-card-overlay__title">' + escapeHtml(title) + '</div>' : '';
      overlay.innerHTML = titleHtml + metaHtml;
      view.appendChild(overlay);

      var tmdbType = data.name ? 'tv' : 'movie';

      if (!isUltra) {
        fetchLogo(data.id, tmdbType, function (logo) {
          if (!logo) return;
          var titleDiv = overlay.querySelector('.nfx-card-overlay__title');
          if (titleDiv) {
            var img = document.createElement('img');
            img.className = 'nfx-card-overlay__logo';
            img.alt = title;
            img.loading = 'lazy';
            var logoUrl = logoImgUrl(logo.path);
            imgLoad(logoUrl, function (src) {
              img.onload = function () { if (src !== logoUrl) URL.revokeObjectURL(src); };
              img.onerror = function () { if (src !== logoUrl) URL.revokeObjectURL(src); img.style.display = 'none'; };
              img.src = src;
            });
            titleDiv.replaceWith(img);
          }
        });
      }

      if (badgeEnabled() && (data.title || data.name)) {
        var badge = document.createElement('div');
        badge.className = 'nfx-card-logo';
        badge.textContent = data.name ? t('badge_tv') : t('badge_movie');
        view.appendChild(badge);
      }

      if (ratingEnabled() && vote > 0) {
        var rating = document.createElement('div');
        rating.className = 'nfx-card-rating';
        rating.setAttribute('data-score', Math.min(10, Math.max(1, Math.round(vote))));
        rating.textContent = vote.toFixed(1);
        view.appendChild(rating);
      }
    }

    function extractEpisodeShowId(cardEl, data) {
      if (data) {
        if (data.serial && data.serial.id) return { id: data.serial.id, name: data.serial.name || data.serial.original_name || '' };
        if (data.show && data.show.id) return { id: data.show.id, name: data.show.name || data.show.original_name || '' };
        if (data.show_id) return { id: data.show_id, name: data.show_name || '' };
        if (data.tv_id) return { id: data.tv_id, name: data.tv_name || '' };
        if (data.source_id) return { id: data.source_id, name: data.source_name || '' };
        if (data.id && (data.name || data.original_name) && (data.first_air_date || data.episode_run_time || data.number_of_seasons)) {
          return { id: data.id, name: data.name || data.original_name };
        }
      }
      if (cardEl) {
        var titleEl = cardEl.querySelector('.card-episode__footer .card__title');
        if (titleEl) return { id: null, name: titleEl.textContent.trim() };
      }
      return null;
    }

    function switchEpisodeCardToBackdrop(cardEl) {
      if (!cardEl || cardEl.getAttribute('data-nfx-ep-switched')) return;
      cardEl.setAttribute('data-nfx-ep-switched', '1');
      if (isMobile()) return;
      if (resolvePerfLevel() === 'ultra') return;

      var body = cardEl.querySelector('.full-episode__body');
      if (!body) return;

      var fullEp = cardEl.querySelector('.full-episode');
      var numEl = cardEl.querySelector('.full-episode__num');
      if (fullEp && numEl && numEl.parentNode !== fullEp) {
        fullEp.appendChild(numEl);
      }

      var data = extractCardData(cardEl);
      var showInfo = extractEpisodeShowId(cardEl, data);

      if (body.querySelector('.nfx-episode-title') || body.querySelector('.nfx-episode-logo')) return;

      var titleEl = document.createElement('div');
      titleEl.className = 'nfx-episode-title';
      titleEl.textContent = (showInfo && showInfo.name) ? showInfo.name : '';
      if (titleEl.textContent) body.insertBefore(titleEl, body.firstChild);

      if (showInfo && showInfo.id) {
        fetchLogo(showInfo.id, 'tv', function (logo) {
          if (!logo) return;
          var host = cardEl.querySelector('.full-episode__body');
          if (!host) return;
          var existing = host.querySelector('.nfx-episode-title');
          var img = document.createElement('img');
          img.className = 'nfx-episode-logo';
          img.alt = showInfo.name || '';
          img.loading = 'lazy';
          var epLogoUrl = logoImgUrl(logo.path);
          imgLoad(epLogoUrl, function (src) {
            img.onload = function () { if (src !== epLogoUrl) URL.revokeObjectURL(src); };
            img.onerror = function () { if (src !== epLogoUrl) URL.revokeObjectURL(src); img.style.display = 'none'; };
            img.src = src;
          });
          if (existing) existing.replaceWith(img);
          else host.insertBefore(img, host.firstChild);
        });
      }
    }

    function processCards(container) {
      if (!container) return;
      var cards = container.querySelectorAll('.card');
      for (var i = 0; i < cards.length; i++) switchCardToBackdrop(cards[i]);
      var eps = container.querySelectorAll('.card-episode');
      for (var j = 0; j < eps.length; j++) switchEpisodeCardToBackdrop(eps[j]);
    }

    function observeCards() {
      if (!window.MutationObserver) return;
      if (window.__AGNATIVE_CARD_OBSERVER__) return;
      window.__AGNATIVE_CARD_OBSERVER__ = true;

      var pendingNodes = [];
      var flushing = false;

      function flushPending() {
        flushing = false;
        cardPatchTimer = 0;
        var nodes = pendingNodes;
        pendingNodes = [];
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if (!node || node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains('card')) {
            switchCardToBackdrop(node);
          } else if (node.classList && node.classList.contains('card-episode')) {
            switchEpisodeCardToBackdrop(node);
          } else if (node.querySelectorAll) {
            var cards = node.querySelectorAll('.card');
            for (var k = 0; k < cards.length; k++) switchCardToBackdrop(cards[k]);
            var eps = node.querySelectorAll('.card-episode');
            for (var m = 0; m < eps.length; m++) switchEpisodeCardToBackdrop(eps[m]);
          }
        }
      }

      new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) pendingNodes.push(added[j]);
        }
        if (flushing) return;
        flushing = true;
        var delay = resolvePerfLevel() === 'ultra' ? 160 : 60;
        cardPatchTimer = setTimeout(flushPending, delay);
      }).observe(document.body, { childList: true, subtree: true });
    }

    function initGlareRuntime() {
      if (window.__AGNATIVE_TOPNAV_GLARE_RUNTIME__) return;
      if (resolvePerfLevel() === 'ultra') return;
      window.__AGNATIVE_TOPNAV_GLARE_RUNTIME__ = true;
      if (!document.body) return;

      var GLARE_SEL = '.card, .card-episode, .full-start-new__poster';
      var activeCard = null;
      var activeRect = null;
      var lastClientX = 0;
      var lastClientY = 0;
      var rafScheduled = false;
      var glareOn = glareEnabled();

      if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.listener === 'function' && Lampa.Storage.listener.follow) {
        try {
          Lampa.Storage.listener.follow('change', function (e) {
            if (e && e.name === GLARE_KEY) glareOn = glareEnabled();
          });
        } catch (err) { }
      }

      function flushGlare() {
        rafScheduled = false;
        if (!activeCard || !activeRect) return;
        var x = lastClientX - activeRect.left;
        var y = lastClientY - activeRect.top;
        var w = activeRect.width || 1;
        var h = activeRect.height || 1;
        var xPct = (x / w) * 2 - 1;
        var yPct = (y / h) * 2 - 1;
        var s = activeCard.style;
        s.setProperty('--gx', x + 'px');
        s.setProperty('--gy', y + 'px');
        s.setProperty('--rx', (yPct * -7) + 'deg');
        s.setProperty('--ry', (xPct * 7) + 'deg');
      }

      function setActiveCard(card) {
        if (card === activeCard) return;
        activeCard = card;
        activeRect = card ? card.getBoundingClientRect() : null;
      }

      document.body.addEventListener('mouseover', function (e) {
        if (!glareOn || resolvePerfLevel() === 'ultra') { activeCard = null; activeRect = null; return; }
        var card = e.target.closest ? e.target.closest(GLARE_SEL) : null;
        setActiveCard(card);
      });

      document.body.addEventListener('mousemove', function (e) {
        if (!activeCard) return;
        lastClientX = e.clientX;
        lastClientY = e.clientY;
        if (!rafScheduled) {
          rafScheduled = true;
          requestAnimationFrame(flushGlare);
        }
      });

      window.addEventListener('scroll', function () {
        if (activeCard) activeRect = activeCard.getBoundingClientRect();
      }, true);

      window.addEventListener('resize', function () {
        if (activeCard) activeRect = activeCard.getBoundingClientRect();
      });

      document.body.addEventListener('mouseout', function (e) {
        var card = e.target.closest ? e.target.closest(GLARE_SEL) : null;
        if (!card) return;
        var related = e.relatedTarget;
        if (related && card.contains(related)) return;
        var s = card.style;
        s.setProperty('--rx', '0deg');
        s.setProperty('--ry', '0deg');
        s.setProperty('--gx', '50%');
        s.setProperty('--gy', '50%');
        if (activeCard === card) { activeCard = null; activeRect = null; }
      });
    }

    function safePatch() {
      scheduled = false;
      if (!pluginEnabled()) {
        removePluginUi();
        return;
      }
      injectStyle();
      if (document.body) document.body.classList.add(BODY_CLASS);
      syncFontSize();
      syncCardFlags();
      syncPerfMode();

      var content = qs('.activity--active .scroll__content') || qs('.scroll__content');
      patchTopnav();
      buildLeftdock();
      syncLeftdockActive();
      observeMenuChanges();
      if (!content) return;
      processCards(content);
    }

    function schedulePatch() {
      if (scheduled) return;
      scheduled = true;
      setTimeout(safePatch, 120);
    }

    function startPlugin() {
      registerSettings();
      bindRuntimeListeners();
      if (!pluginEnabled()) {
        removePluginUi();
        return;
      }

      prune(getCacheMaxBytes());
      injectStyle();
      if (document.body) document.body.classList.add(BODY_CLASS);
      syncGlareClass();
      syncFontSize();
      syncCardSize();
      syncLogoSize();
      syncCardFlags();
      syncPerfMode();
      syncFlexGapFlag();
      syncOverlayAlign();
      observeCards();
      initGlareRuntime();
      neutralizeMenuController();
      patchActivityPushForMenu();
      patchControllerToggleForLeftdock();
      processCards(document.body);
      schedulePatch();
    }

    function bootPlugin() {
      registerSettings();
      startPlugin();
    }

    if (window.appready) bootPlugin();
    else {
      try {
        Lampa.Listener.follow('app', function (e) {
          if (e.type === 'ready') bootPlugin();
        });
      } catch (e) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootPlugin);
        else bootPlugin();
      }
    }
  })();

})();
