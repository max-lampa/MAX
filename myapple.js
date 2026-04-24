(function () {
  'use strict';

  // ===== Android 9 ATV / Android TV remote optimizations =====
  // padStart polyfill (Android 9 WebView may be older than Chrome 70)
  if (!String.prototype.padStart) {
    String.prototype.padStart = function (targetLength, padString) {
      targetLength = targetLength | 0;
      padString = String(padString || ' ');
      var s = String(this);
      if (s.length >= targetLength) return s;
      var pad = '';
      while (pad.length + s.length < targetLength) pad += padString;
      return pad.slice(0, targetLength - s.length) + s;
    };
  }
  // Element.closest polyfill for old WebView
  if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest = function (sel) {
      var el = this;
      while (el && el.nodeType === 1) {
        if ((el.matches || el.msMatchesSelector || el.webkitMatchesSelector).call(el, sel)) return el;
        el = el.parentElement || el.parentNode;
      }
      return null;
    };
  }
  // Detect Android TV (no real pointer, big screen, AndroidTV UA, or Lampa platform flag)
  var IS_ANDROID_TV = (function () {
    try {
      var ua = (navigator.userAgent || '').toLowerCase();
      if (ua.indexOf('android') !== -1 && (ua.indexOf('tv') !== -1 || ua.indexOf('aft') !== -1 || ua.indexOf('bravia') !== -1 || ua.indexOf('shield') !== -1 || ua.indexOf('mibox') !== -1 || ua.indexOf('mitv') !== -1)) return true;
      if (window.Lampa && Lampa.Platform && typeof Lampa.Platform.is === 'function' && Lampa.Platform.is('android')) {
        if (!('ontouchstart' in window) && window.innerWidth >= 1280) return true;
      }
      if (window.tizen || window.webOS || window.webos) return true;
    } catch (e) { }
    return false;
  })();
  var HAS_POINTER = (function () {
    try {
      if (window.matchMedia && matchMedia('(pointer: fine)').matches) return true;
    } catch (e) { }
    return !IS_ANDROID_TV;
  })();
  // rAF fallback
  var rAF = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };

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
    THEME_COLOR_KEY: 'appletv_agnative_theme_color',
    MAIN_CARD_SCALE_KEY: 'appletv_agnative_main_card_scale',
    THEME_COLOR_ATTR: 'data-agnative-theme-color',
    MAIN_CARD_SCALE_ATTR: 'data-agnative-main-scale'
  };

  const ru = {
    nav_feed: 'Лента',
    badge_movie: 'ФИЛЬМ', badge_tv: 'СЕРИАЛ',
    set_about_desc: 'Версия 0.3.0',
    set_main_title: 'Основные настройки',
    set_enable_name: 'AppleTV',
    set_enable_desc: 'Включает и выключает плагин',
    set_glare_name: 'Наклон veoveo.ru', set_glare_desc: 'от arabian_q',
    set_topnav_name: 'Пункты Topnav', set_topnav_desc: 'Меню слева',
    set_topnav_title: 'Пункты верхнего меню',
    set_topnav_item_desc: 'Пункт menu_list: ',
    set_logo_lang_name: 'Язык логотипов',
    set_logo_lang_desc: 'Если логотипа на выбранном языке нет — используется английский',
    set_font_size_name: 'Размер шрифта',
    set_font_size_desc: 'Масштаб текста интерфейса и карточек',
    set_ui_lang_desc: 'Язык подписей плагина',
    val_on: 'Включить', val_off: 'Выключить',
    val_hide: 'Скрыть',
    val_auto: 'Автоматически',
    val_size_xs: 'Мелкий', val_size_sm: 'Маленький',
    val_size_md: 'Обычный', val_size_lg: 'Крупный', val_size_xl: 'Огромный',
    val_rating_color: 'Цветной', val_rating_mono: 'Монохромный',
    set_backdrop_name: 'Горизонтальные кадры',
    set_backdrop_desc: 'Заменять постер на кадр из фильма (backdrop)',
    set_badge_name: 'Бейдж «Фильм/Сериал»',
    set_badge_desc: 'Метка в левом верхнем углу карточки',
    set_rating_desc: 'Показывать оценку в правом верхнем углу',
    set_rating_style_name: 'Стиль рейтинга TMDB',
    set_rating_style_desc: 'Цветной или монохромный вид оценки',
    set_reset_name: 'Сбросить настройки',
    set_reset_desc: 'Вернуть все параметры плагина к значениям по умолчанию',
    set_reset_done: 'Настройки AppleTV сброшены',
    set_category_size_name: 'Размер названий категорий',
    set_category_size_desc: 'Заголовки полок (Популярное, Новинки и т.д.)',
    set_card_size_name: 'Размер карточек',
    set_card_size_desc: 'Ширина карточек в лентах',
    set_clock_seconds_name: 'Секунды в часах',
    set_clock_seconds_desc: 'Показывать секунды рядом с часами в шапке',
    set_control_panel_name: 'Панель по клику на часы',
    set_control_panel_desc: 'Settings, Synchronization, Player, Cache & Data',
    set_theme_color_name: 'Цвет темы меню',
    set_theme_color_desc: 'Цвет навигации (левое меню и верхняя панель)',
    val_theme_default: 'По умолчанию',
    val_theme_blue: 'Синий',
    val_theme_green: 'Зелёный',
    val_theme_purple: 'Фиолетовый',
    val_theme_red: 'Красный',
    val_theme_orange: 'Оранжевый',
    val_theme_pink: 'Розовый',
    val_theme_teal: 'Бирюзовый',
    val_theme_gold: 'Золотой',
    val_theme_graphite: 'Графит',
    set_main_card_scale_name: 'Размер постеров на главной',
    set_main_card_scale_desc: 'Подгоните размер так, чтобы постеры умещались в строке'
  };

  const en = {
    nav_feed: 'Feed',
    badge_movie: 'MOVIE', badge_tv: 'TV SHOW',
    set_about_desc: 'Версия 0.3.0',
    set_main_title: 'Main settings',
    set_enable_name: 'AppleTV',
    set_enable_desc: 'Enables and disables the plugin',
    set_glare_name: 'Tilt veoveo.ru', set_glare_desc: 'by arabian_q',
    set_topnav_name: 'Topnav items', set_topnav_desc: 'Left menu',
    set_topnav_title: 'Top navigation items',
    set_topnav_item_desc: 'menu_list item: ',
    set_logo_lang_name: 'Logo language',
    set_logo_lang_desc: 'If no logo in chosen language — English is used',
    set_font_size_name: 'Font size',
    set_font_size_desc: 'Interface and card text scale',
    set_ui_lang_desc: 'Plugin label language',
    val_on: 'Enable', val_off: 'Disable',
    val_hide: 'Hide',
    val_auto: 'Auto',
    val_size_xs: 'Extra small', val_size_sm: 'Small',
    val_size_md: 'Normal', val_size_lg: 'Large', val_size_xl: 'Extra large',
    val_rating_color: 'Colored', val_rating_mono: 'Monochrome',
    set_backdrop_name: 'Landscape stills',
    set_backdrop_desc: 'Replace poster with backdrop image',
    set_badge_name: '"Movie/TV" badge',
    set_badge_desc: 'Label in the top-left corner of the card',
    set_rating_desc: 'Show score in the top-right corner',
    set_rating_style_name: 'TMDB rating style',
    set_rating_style_desc: 'Colored or monochrome score style',
    set_reset_name: 'Reset settings',
    set_reset_desc: 'Restore all plugin options to defaults',
    set_reset_done: 'AppleTV settings reset',
    set_category_size_name: 'Category title size',
    set_category_size_desc: 'Section titles (Popular, New, etc.)',
    set_card_size_name: 'Card size',
    set_card_size_desc: 'Card width in rows',
    set_clock_seconds_name: 'Seconds in clock',
    set_clock_seconds_desc: 'Show seconds next to the header clock',
    set_control_panel_name: 'Clock click panel',
    set_control_panel_desc: 'Settings, Synchronization, Player, Cache & Data',
    set_theme_color_name: 'Menu theme color',
    set_theme_color_desc: 'Color for navigation (left menu and top dock)',
    val_theme_default: 'Default',
    val_theme_blue: 'Blue',
    val_theme_green: 'Green',
    val_theme_purple: 'Purple',
    val_theme_red: 'Red',
    val_theme_orange: 'Orange',
    val_theme_pink: 'Pink',
    val_theme_teal: 'Teal',
    val_theme_gold: 'Gold',
    val_theme_graphite: 'Graphite',
    set_main_card_scale_name: 'Home poster size',
    set_main_card_scale_desc: 'Tune size so posters fit in a row without overlap'
  };

  const uk = {
    nav_feed: 'Стрічка',
    badge_movie: 'ФІЛЬМ', badge_tv: 'СЕРІАЛ',
    set_about_desc: 'Версия 0.3.0',
    set_main_title: 'Основні налаштування',
    set_enable_name: 'AppleTV',
    set_enable_desc: 'Вмикає та вимикає плагін',
    set_glare_name: 'Нахил veoveo.ru', set_glare_desc: 'від arabian_q',
    set_topnav_name: 'Пункти Topnav', set_topnav_desc: 'Меню ліворуч',
    set_topnav_title: 'Пункти верхнього меню',
    set_topnav_item_desc: 'Пункт menu_list: ',
    set_logo_lang_name: 'Мова логотипів',
    set_logo_lang_desc: 'Якщо логотип обраною мовою відсутній — використовується англійський',
    set_font_size_name: 'Розмір шрифту',
    set_font_size_desc: 'Масштаб тексту інтерфейсу та карток',
    set_ui_lang_desc: 'Мова підписів плагіна',
    val_on: 'Увімкнути', val_off: 'Вимкнути',
    val_hide: 'Приховати',
    val_auto: 'Автоматично',
    val_size_xs: 'Дрібний', val_size_sm: 'Малий',
    val_size_md: 'Звичайний', val_size_lg: 'Великий', val_size_xl: 'Величезний',
    val_rating_color: 'Кольоровий', val_rating_mono: 'Монохромний',
    set_backdrop_name: 'Горизонтальні кадри',
    set_backdrop_desc: 'Заміняти постер на кадр з фільму (backdrop)',
    set_badge_name: 'Бейдж «Фільм/Серіал»',
    set_badge_desc: 'Мітка у лівому верхньому куті картки',
    set_rating_desc: 'Показувати оцінку у правому верхньому куті',
    set_rating_style_name: 'Стиль рейтингу TMDB',
    set_rating_style_desc: 'Кольоровий або монохромний вигляд оцінки',
    set_reset_name: 'Скинути налаштування',
    set_reset_desc: 'Повернути всі параметри плагіна до значень за замовчуванням',
    set_reset_done: 'Налаштування AppleTV скинуто',
    set_category_size_name: 'Розмір назв категорій',
    set_category_size_desc: 'Заголовки поличок (Популярне, Новинки тощо)',
    set_card_size_name: 'Розмір карточок',
    set_card_size_desc: 'Ширина карточок у стрічках',
    set_clock_seconds_name: 'Секунди в годиннику',
    set_clock_seconds_desc: 'Показувати секунди поруч із годинником у шапці',
    set_control_panel_name: 'Панель за кліком на годинник',
    set_control_panel_desc: 'Settings, Synchronization, Player, Cache & Data',
    set_theme_color_name: 'Колір теми меню',
    set_theme_color_desc: 'Колір навігації (ліве меню та верхня панель)',
    val_theme_default: 'За замовчуванням',
    val_theme_blue: 'Синій',
    val_theme_green: 'Зелений',
    val_theme_purple: 'Фіолетовий',
    val_theme_red: 'Червоний',
    val_theme_orange: 'Помаранчевий',
    val_theme_pink: 'Рожевий',
    val_theme_teal: 'Бірюзовий',
    val_theme_gold: 'Золотий',
    val_theme_graphite: 'Графіт',
    set_main_card_scale_name: 'Розмір постерів на головній',
    set_main_card_scale_desc: 'Підлаштуйте розмір, щоб постери вміщалися у рядок'
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
      CLOCK_SECONDS_KEY,
      CONTROL_PANEL_KEY,
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
      THEME_COLOR_KEY,
      MAIN_CARD_SCALE_KEY,
      THEME_COLOR_ATTR,
      MAIN_CARD_SCALE_ATTR
    } = AGNATIVE_KEYS;

    var scheduled = false;
    var clockTimer = null;
    var logoCache = {};
    var logoPending = {};
    var posterCache = {};
    var posterPending = {};
    var storageListenerBound = false;
    var activityListenerBound = false;
    var fullListenerBound = false;
    var topnavSettingsOpen = false;
    var controlPanelOpen = false;
    var controlPanelPrevController = '';
    var controlPanelControllerReady = false;
    var controlPanelDocCloseBound = false;
    var swallowClickUntil = 0;

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

    var THEME_COLORS = ['default', 'blue', 'green', 'purple', 'red', 'orange', 'pink', 'teal', 'gold', 'graphite'];
    var MAIN_SCALE_VALUES = ['70', '75', '80', '85', '90', '95', '100', '105', '110', '115', '120', '125', '130'];

    function getThemeColor() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'default';
        var value = Lampa.Storage.get(THEME_COLOR_KEY, 'default') || 'default';
        return THEME_COLORS.indexOf(value) === -1 ? 'default' : value;
      } catch (e) { return 'default'; }
    }

    function getMainCardScale() {
      try {
        if (!window.Lampa || !Lampa.Storage) return '100';
        var value = String(Lampa.Storage.get(MAIN_CARD_SCALE_KEY, '100') || '100');
        return MAIN_SCALE_VALUES.indexOf(value) === -1 ? '100' : value;
      } catch (e) { return '100'; }
    }

    function syncThemeColor() {
      if (!document.body) return;
      document.body.setAttribute(THEME_COLOR_ATTR, getThemeColor());
    }

    function syncMainCardScale() {
      if (!document.body) return;
      document.body.setAttribute(MAIN_CARD_SCALE_ATTR, getMainCardScale());
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
          document.body.removeAttribute(BACKDROP_ATTR);
          document.body.removeAttribute(BADGE_ATTR);
          document.body.removeAttribute(RATING_ATTR);
          document.body.removeAttribute(THEME_COLOR_ATTR);
          document.body.removeAttribute(MAIN_CARD_SCALE_ATTR);
        }
        var style = document.getElementById(STYLE_ID);
        if (style) style.remove();
        var shell = document.querySelector('.agnative-topnav-shell');
        if (shell) shell.remove();
        var dock = document.querySelector('.agnative-topnav-rightdock');
        if (dock) dock.remove();
        var clock = document.getElementById(CLOCK_ID);
        if (clock) clock.remove();
        var panel = document.querySelector('.agnative-control-panel');
        if (panel) panel.remove();
        controlPanelOpen = false;
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

    function syncCardFlags() {
      if (!document.body) return;
      document.body.setAttribute(BACKDROP_ATTR, backdropEnabled() ? 'on' : 'off');
      document.body.setAttribute(BADGE_ATTR, badgeEnabled() ? 'on' : 'off');
      document.body.setAttribute(RATING_ATTR, ratingEnabled() ? 'on' : 'off');
      document.body.setAttribute(RATING_STYLE_ATTR, getRatingStyle());
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
        Lampa.Storage.set(CARD_SIZE_KEY, 'md');
        Lampa.Storage.set(BACKDROP_KEY, 'on');
        Lampa.Storage.set(BADGE_KEY, 'on');
        Lampa.Storage.set(RATING_KEY, 'off');
        Lampa.Storage.set(RATING_STYLE_KEY, 'color');
        Lampa.Storage.set(CLOCK_SECONDS_KEY, 'off');
        Lampa.Storage.set(CONTROL_PANEL_KEY, 'off');
        Lampa.Storage.set(THEME_COLOR_KEY, 'default');
        Lampa.Storage.set(MAIN_CARD_SCALE_KEY, '100');
        Lampa.Storage.set(TOPNAV_ITEMS_KEY, ['main', 'movie', 'tv', 'cartoon']);
        logoCache = {};
        syncGlareClass();
        syncFontSize();
        syncCardFlags();
        syncThemeColor();
        syncMainCardScale();
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
          name: 'AppleTV'
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { name: 'agnative_about_info', type: 'static' },
          field: {
            name: 'AppleTV',
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
            setTimeout(function () { schedulePatch(); }, 80);
          }
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

        var mainScaleValues = {};
        MAIN_SCALE_VALUES.forEach(function (v) {
          mainScaleValues[v] = v + '%';
        });
        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: MAIN_CARD_SCALE_KEY,
            type: 'select',
            values: mainScaleValues,
            default: '100'
          },
          field: {
            name: t('set_main_card_scale_name'),
            description: t('set_main_card_scale_desc')
          },
          onChange: function () {
            syncMainCardScale();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: THEME_COLOR_KEY,
            type: 'select',
            values: {
              'default': t('val_theme_default'),
              blue: t('val_theme_blue'),
              green: t('val_theme_green'),
              purple: t('val_theme_purple'),
              red: t('val_theme_red'),
              orange: t('val_theme_orange'),
              pink: t('val_theme_pink'),
              teal: t('val_theme_teal'),
              gold: t('val_theme_gold'),
              graphite: t('val_theme_graphite')
            },
            default: 'default'
          },
          field: {
            name: t('set_theme_color_name'),
            description: t('set_theme_color_desc')
          },
          onChange: function () {
            syncThemeColor();
          }
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

          if (e.name === CARD_SIZE_KEY) {
            syncCardSize();
            return;
          }

          if (e.name === THEME_COLOR_KEY) {
            syncThemeColor();
            return;
          }

          if (e.name === MAIN_CARD_SCALE_KEY) {
            syncMainCardScale();
            return;
          }

          if (e.name === LOGO_LANG_KEY) {
            logoCache = {};
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
      if (IS_ANDROID_TV) return false;
      return window.innerWidth < 768 || (window.innerWidth < 1024 && 'ontouchstart' in window);
    }
    function isTV() { return IS_ANDROID_TV; }

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
      var old = document.getElementById(STYLE_ID);
      if (old) old.remove();

      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = [
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
        'body.' + BODY_CLASS + ' .items-line--type-default { min-height:auto !important; padding-top:1.1em !important; padding-bottom:1em !important; margin-bottom:.32em !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .items-line, body.' + BODY_CLASS + ' .items-line__body, body.' + BODY_CLASS + ' .items-cards, body.' + BODY_CLASS + ' .scroll, body.' + BODY_CLASS + ' .scroll__body, body.' + BODY_CLASS + ' .scroll__content { overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .items-line--type-default .items-line__head { margin-bottom:.58em !important; min-height:auto !important; padding-top:0 !important; padding-bottom:0 !important; padding-left:1.05em !important; padding-right:1.05em !important; font-size:1em !important; }',
        'body.' + BODY_CLASS + ' .items-line__more.selector { font-size:.7em !important; padding:.3em .6em !important; opacity:.85 !important; }',
        'body.' + BODY_CLASS + ' .items-line--type-default .items-cards { padding-top:0 !important; font-size:.86em !important; }',
        'body.' + BODY_CLASS + ' .items-cards { padding-left:1.05em !important; padding-right:1.05em !important; gap:.62em !important; }',
        'body.' + BODY_CLASS + ' .items-line__body { padding-left:1.15em !important; }',
        'body.' + BODY_CLASS + ' .items-line__title { font-size:1em !important; line-height:1.2 !important; font-weight:700 !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line { display:flex !important; gap:1.5em !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person { padding: 1em !important; }',
        'body.' + BODY_CLASS + ' .mapping--grid { display:grid !important; grid-template-columns:repeat(5, minmax(0, 1fr)) !important; gap:.52em !important; align-items:start !important; }',
        '@media (max-width: 1279px) { body.' + BODY_CLASS + ' .mapping--grid { grid-template-columns:repeat(4, minmax(0, 1fr)) !important; } }',
        '@media (max-width: 767px) { body.' + BODY_CLASS + ' .mapping--grid { grid-template-columns:repeat(3, minmax(0, 1fr)) !important; } }',
        'body.' + BODY_CLASS + ' .card { width:auto !important; margin:0 !important; padding-bottom:0 !important; transform-origin:center center !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .items-line .card { width:17.6em !important; flex:0 0 auto !important; }',
        'body.' + BODY_CLASS + ' .card .card-watched { transform: scale(.8) !important; bottom: 0 !important; max-height: 100% !important; overflow: hidden !important; }',
        'body.' + BODY_CLASS + ' .card .card__view { padding-bottom:56.25% !important; margin-bottom:0 !important; border-radius:1.35em !important; overflow:hidden !important; clip-path: inset(0 round 1.35em); -webkit-clip-path: inset(0 round 1.35em); box-shadow: inset 0 1px 0 rgba(255,255,255,.16), inset 0 -1px 0 rgba(255,255,255,.04), 0 8px 18px rgba(0,0,0,.18) !important; transition: transform .28s cubic-bezier(.22,.61,.36,1), box-shadow .28s ease, filter .28s ease, opacity .18s ease !important; }',
        'body.' + BODY_CLASS + ' .card[data-nfx-switched="1"] .card__view { opacity:1 !important; }',
        'body.' + BODY_CLASS + ' .card__view > *, body.' + BODY_CLASS + ' .card__view img, body.' + BODY_CLASS + ' .card__view .card__img, body.' + BODY_CLASS + ' .card__view .card__image, body.' + BODY_CLASS + ' .card__img, body.' + BODY_CLASS + ' .card__image, body.' + BODY_CLASS + ' .card__filter, body.' + BODY_CLASS + ' .card__filter::before, body.' + BODY_CLASS + ' .card__filter::after { border-radius:1.35em !important; }',
        'body.' + BODY_CLASS + ' .card__img, body.' + BODY_CLASS + ' .card__image { object-fit:cover !important; object-position:center 20% !important; border:none !important; box-shadow:none !important; background-clip:padding-box !important; }',
        // === Juicy posters & logos ===
        // Cheap GPU filters (saturate/contrast/brightness) — no blur, safe for Android 9 ATV WebView
        'body.' + BODY_CLASS + ' .card__img,' +
        'body.' + BODY_CLASS + ' .card__image,' +
        'body.' + BODY_CLASS + ' .card__view img,' +
        'body.' + BODY_CLASS + ' .card-episode .full-episode__img img,' +
        'body.' + BODY_CLASS + ' .full-start-new__poster img,' +
        'body.' + BODY_CLASS + ' .full-start-new__background-image,' +
        'body.' + BODY_CLASS + ' .background--one,' +
        'body.' + BODY_CLASS + ' .background--two { filter: saturate(1.32) contrast(1.08) brightness(1.04) !important; -webkit-filter: saturate(1.32) contrast(1.08) brightness(1.04) !important; }',
        'body.' + BODY_CLASS + ' .card.focus .card__view img,' +
        'body.' + BODY_CLASS + ' .card.hover .card__view img,' +
        'body.' + BODY_CLASS + ' .card.focus .card__img,' +
        'body.' + BODY_CLASS + ' .card.hover .card__img,' +
        'body.' + BODY_CLASS + ' .card.focus .card__image,' +
        'body.' + BODY_CLASS + ' .card.hover .card__image,' +
        'body.' + BODY_CLASS + ' .card-episode.focus .full-episode__img img,' +
        'body.' + BODY_CLASS + ' .card-episode.hover .full-episode__img img { filter: saturate(1.5) contrast(1.12) brightness(1.07) !important; -webkit-filter: saturate(1.5) contrast(1.12) brightness(1.07) !important; }',
        // Logos on cards (TMDB title logos & badge image)
        'body.' + BODY_CLASS + ' .nfx-card-logo img,' +
        'body.' + BODY_CLASS + ' .full-start-new__title-original img,' +
        'body.' + BODY_CLASS + ' .full-start-new__title img,' +
        'body.' + BODY_CLASS + ' .full-start__logo img,' +
        'body.' + BODY_CLASS + ' .card__logo img { filter: saturate(1.45) contrast(1.1) brightness(1.06) drop-shadow(0 2px 6px rgba(0,0,0,.55)) !important; -webkit-filter: saturate(1.45) contrast(1.1) brightness(1.06) drop-shadow(0 2px 6px rgba(0,0,0,.55)) !important; }',
        'body.' + BODY_CLASS + ' .card.focus .card__view { transform: translateY(-.06em) scale(1.04) !important; transform-origin: center center !important; filter: saturate(1.06) brightness(1.02) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 2px rgba(86,141,255,.92), 0 18px 42px rgba(0,0,0,.26), 0 8px 20px rgba(0,0,0,.14) !important; }',
        'body.' + BODY_CLASS + ' .card.hover .card__view { transform: translateY(-.04em) scale(1.03) !important; filter: saturate(1.02) brightness(1.01) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 10px 24px rgba(0,0,0,.16) !important; }',
        'body.' + BODY_CLASS + ' .card.focus::after, body.' + BODY_CLASS + ' .card.hover::after, body.' + BODY_CLASS + ' .card__view::before, body.' + BODY_CLASS + ' .card__view::after { display:none !important; content:none !important; }',
        'body.' + BODY_CLASS + ' .card-episode { width:17.6em !important; flex:0 0 auto !important; margin:0 !important; padding:0 !important; background:transparent !important; border:0 !important; outline:0 !important; box-shadow:none !important; transform:none !important; transform-origin:center center !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .card-episode.focus, body.' + BODY_CLASS + ' .card-episode.hover, body.' + BODY_CLASS + ' .card-episode.focus .card-episode__body, body.' + BODY_CLASS + ' .card-episode.hover .card-episode__body { border:0 !important; outline:0 !important; box-shadow:none !important; background:transparent !important; }',
        'body.' + BODY_CLASS + ' .card-episode__body { background:transparent !important; border:0 !important; outline:0 !important; box-shadow:none !important; padding:0 !important; margin:0 !important; display:block !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode { position:relative !important; display:block !important; background:transparent !important; border:0 !important; box-shadow:none !important; padding:0 !important; margin:0 !important; overflow:visible !important; transform-origin:center center !important; transition: transform .28s cubic-bezier(.22,.61,.36,1) !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__img { position:relative !important; width:100% !important; height:0 !important; padding-bottom:56.25% !important; margin:0 !important; border-radius:1.35em !important; overflow:hidden !important; clip-path: inset(0 round 1.35em); -webkit-clip-path: inset(0 round 1.35em); box-shadow: inset 0 1px 0 rgba(255,255,255,.16), inset 0 -1px 0 rgba(255,255,255,.04), 0 8px 18px rgba(0,0,0,.18) !important; transition: box-shadow .28s ease, filter .28s ease !important; }',
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
        'body.' + BODY_CLASS + ' .nfx-card-overlay { position:absolute; left:0; right:0; bottom:0; z-index:0; display:block !important; opacity:1 !important; visibility:visible !important; border-radius:0 0 1.35em 1.35em !important; background:linear-gradient(0deg, rgba(6,8,14,.88) 0%, rgba(6,8,14,.56) 38%, rgba(6,8,14,.16) 68%, rgba(6,8,14,0) 100%) !important; padding:2.15em 1.02em .92em !important; transform: translateZ(14px); transition: transform .28s cubic-bezier(.22,.61,.36,1), opacity .24s ease; pointer-events:none; }',
        'body.' + BODY_CLASS + ' .card.focus .nfx-card-overlay { transform: translateZ(18px) translateY(-.02em); }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__logo, body.' + BODY_CLASS + ' img.nfx-card-overlay__logo { display:block !important; opacity:1 !important; visibility:visible !important; max-height:2.55em !important; max-width:82% !important; margin-bottom:.28em !important; border-radius:0 !important; clip-path:none !important; -webkit-clip-path:none !important; mask-image:none !important; -webkit-mask-image:none !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__title { color:#fff; font-size:1.02em !important; line-height:1.14 !important; font-weight:800 !important; text-shadow:0 2px 12px rgba(0,0,0,.5); }',
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
        // === Card size (ported from AppleTVAGNativeNG) ===
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
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"] .card-episode { width:14em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"] .card-episode { width:15.8em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"] .card-episode { width:17.6em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"] .card-episode { width:19.4em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"] .card-episode { width:21.2em !important; }',
        // === Main card scale slider (applies multiplier to home rows) ===
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="70"]  .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="70"]  .items-line .card-episode { --agnative-main-scale: .70; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="75"]  .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="75"]  .items-line .card-episode { --agnative-main-scale: .75; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="80"]  .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="80"]  .items-line .card-episode { --agnative-main-scale: .80; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="85"]  .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="85"]  .items-line .card-episode { --agnative-main-scale: .85; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="90"]  .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="90"]  .items-line .card-episode { --agnative-main-scale: .90; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="95"]  .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="95"]  .items-line .card-episode { --agnative-main-scale: .95; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="100"] .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="100"] .items-line .card-episode { --agnative-main-scale: 1; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="105"] .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="105"] .items-line .card-episode { --agnative-main-scale: 1.05; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="110"] .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="110"] .items-line .card-episode { --agnative-main-scale: 1.10; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="115"] .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="115"] .items-line .card-episode { --agnative-main-scale: 1.15; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="120"] .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="120"] .items-line .card-episode { --agnative-main-scale: 1.20; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="125"] .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="125"] .items-line .card-episode { --agnative-main-scale: 1.25; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="130"] .items-line .card, body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '="130"] .items-line .card-episode { --agnative-main-scale: 1.30; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '] .items-line .card { width: calc(17.6em * var(--agnative-main-scale, 1)) !important; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '][' + BACKDROP_ATTR + '="off"] .items-line .card { width: calc(13em * var(--agnative-main-scale, 1)) !important; }',
        'body.' + BODY_CLASS + '[' + MAIN_CARD_SCALE_ATTR + '] .items-line .card-episode { width: calc(17.6em * var(--agnative-main-scale, 1)) !important; }',
        // === Theme color (left menu + top dock + focus accents) ===
        // Defaults — same as before; explicit so themes can override cleanly
        'body.' + BODY_CLASS + '[' + THEME_COLOR_ATTR + '="default"] .wrap__left, body.' + BODY_CLASS + '[' + THEME_COLOR_ATTR + '="default"] .menu, body.' + BODY_CLASS + '[' + THEME_COLOR_ATTR + '="default"] .menu__content, body.' + BODY_CLASS + '[' + THEME_COLOR_ATTR + '="default"] .menu .menu__list { background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.06)) !important; }',
        // helper to generate theme rules
        (function () {
          var palette = {
            blue:     { bg1: 'rgba(40,90,210,.40)',  bg2: 'rgba(40,90,210,.16)',  focus: 'rgba(86,141,255,.32)',  ring: 'rgba(86,141,255,.95)',  topActive: 'rgba(86,141,255,.40)' },
            green:    { bg1: 'rgba(40,170,95,.40)',  bg2: 'rgba(40,170,95,.16)',  focus: 'rgba(70,200,130,.32)',  ring: 'rgba(70,200,130,.95)',  topActive: 'rgba(70,200,130,.40)' },
            purple:   { bg1: 'rgba(140,80,220,.40)', bg2: 'rgba(140,80,220,.16)', focus: 'rgba(170,110,240,.32)', ring: 'rgba(170,110,240,.95)', topActive: 'rgba(170,110,240,.40)' },
            red:      { bg1: 'rgba(220,55,70,.40)',  bg2: 'rgba(220,55,70,.16)',  focus: 'rgba(240,80,95,.32)',   ring: 'rgba(240,80,95,.95)',   topActive: 'rgba(240,80,95,.40)' },
            orange:   { bg1: 'rgba(240,135,30,.40)', bg2: 'rgba(240,135,30,.16)', focus: 'rgba(255,160,55,.32)',  ring: 'rgba(255,160,55,.95)',  topActive: 'rgba(255,160,55,.40)' },
            pink:     { bg1: 'rgba(235,80,160,.40)', bg2: 'rgba(235,80,160,.16)', focus: 'rgba(245,110,180,.32)', ring: 'rgba(245,110,180,.95)', topActive: 'rgba(245,110,180,.40)' },
            teal:     { bg1: 'rgba(20,170,180,.40)', bg2: 'rgba(20,170,180,.16)', focus: 'rgba(60,200,210,.32)',  ring: 'rgba(60,200,210,.95)',  topActive: 'rgba(60,200,210,.40)' },
            gold:     { bg1: 'rgba(220,170,40,.40)', bg2: 'rgba(220,170,40,.16)', focus: 'rgba(240,195,70,.32)',  ring: 'rgba(240,195,70,.95)',  topActive: 'rgba(240,195,70,.40)' },
            graphite: { bg1: 'rgba(60,65,75,.85)',   bg2: 'rgba(40,44,52,.65)',   focus: 'rgba(255,255,255,.14)', ring: 'rgba(220,225,235,.85)', topActive: 'rgba(255,255,255,.20)' }
          };
          var css = '';
          Object.keys(palette).forEach(function (name) {
            var p = palette[name];
            var sel = 'body.' + BODY_CLASS + '[' + THEME_COLOR_ATTR + '="' + name + '"]';
            css += sel + ' .wrap__left,' + sel + ' .menu,' + sel + ' .menu__content,' + sel + ' .menu .menu__list { background: linear-gradient(180deg, ' + p.bg1 + ', ' + p.bg2 + ') !important; }';
            css += sel + ' .menu .menu__item.focus, ' + sel + ' .menu .menu__item.hover, ' + sel + ' .menu .menu__item.traverse, ' + sel + ' .menu .menu__item.active { background: ' + p.focus + ' !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 0 0 1px ' + p.ring + ' !important; }';
            css += sel + ' .agnative-topnav-shell__inner, ' + sel + ' .agnative-topnav-rightdock { background: ' + p.bg2 + ' !important; border-color: ' + p.ring + ' !important; }';
            css += sel + ' .agnative-topnav-shell__item.is-active, ' + sel + ' .agnative-topnav-shell__item.hover, ' + sel + ' .agnative-topnav-shell__item.focus, ' + sel + ' .agnative-topnav-clock.hover, ' + sel + ' .agnative-topnav-clock.focus, ' + sel + ' .agnative-topnav-right__profile.hover, ' + sel + ' .agnative-topnav-right__profile.focus { background: ' + p.topActive + ' !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 0 0 1px ' + p.ring + ' !important; }';
          });
          return css;
        })(),
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__item.selector { font-size: calc(.85em * var(--agnative-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-clock { font-size: calc(.88em * var(--agnative-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .items-line__title { font-size: calc(1em * var(--agnative-scale, 1) * var(--agnative-category-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .items-line__more.selector { font-size: calc(.72em * var(--agnative-scale, 1) * var(--agnative-category-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__title { font-size: calc(1em * var(--agnative-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__meta { font-size: calc(.72em * var(--agnative-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-logo { font-size: calc(.72em * var(--agnative-scale, 1)) !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-rating { position:absolute; top:.7em; right:.82em; z-index:4; display:inline-flex; align-items:center; justify-content:center; padding:.32em .66em; border-radius:.85em; background:rgba(12,14,20,.68); border:1px solid rgba(255,255,255,.14); color:#ffd13d; font-size: calc(.72em * var(--agnative-scale, 1)); font-weight:800; letter-spacing:.02em; backdrop-filter: blur(10px) saturate(140%); -webkit-backdrop-filter: blur(10px) saturate(140%); pointer-events:none; box-shadow: 0 4px 10px rgba(0,0,0,.24); }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="color"] .nfx-card-rating { color:#ffd13d !important; background:rgba(12,14,20,.68) !important; border-color:rgba(255,255,255,.14) !important; }',
        'body.' + BODY_CLASS + '[' + RATING_STYLE_ATTR + '="mono"] .nfx-card-rating { color:rgba(255,255,255,.96) !important; background:rgba(255,255,255,.12) !important; border-color:rgba(255,255,255,.18) !important; }',
        'body.' + BODY_CLASS + '[' + BADGE_ATTR + '="off"] .nfx-card-logo { display:none !important; }',
        'body.' + BODY_CLASS + '[' + RATING_ATTR + '="off"] .nfx-card-rating { display:none !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card .card__view { padding-bottom:140% !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card__img, body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card__image { object-position:center center !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .nfx-card-overlay { display:block !important; background:linear-gradient(0deg, rgba(4,5,10,1) 0%, rgba(4,5,10,.98) 18%, rgba(4,5,10,.88) 36%, rgba(4,5,10,.6) 58%, rgba(4,5,10,.2) 78%, rgba(4,5,10,0) 100%) !important; padding:5em 1em 1em !important; border-radius:0 0 1.35em 1.35em !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .nfx-card-rating { display:inline-flex !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .nfx-card-logo { display:inline-flex !important; }',
        'body.' + BODY_CLASS + '[' + BADGE_ATTR + '="off"][' + BACKDROP_ATTR + '="off"] .nfx-card-logo { display:none !important; }',
        'body.' + BODY_CLASS + '[' + RATING_ATTR + '="off"][' + BACKDROP_ATTR + '="off"] .nfx-card-rating { display:none !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .nfx-card-overlay__logo { max-height:2.2em !important; max-width:78% !important; margin-bottom:.24em !important; }',
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
        '@media (max-width: 767px) {',
        '  body.' + BODY_CLASS + ' .agnative-topnav-shell__items { display: none !important; }',
        '  body.' + BODY_CLASS + ' .agnative-topnav-shell__item--icon[data-role="search"],',
        '  body.' + BODY_CLASS + ' .agnative-topnav-shell__item--icon[data-role="favorite"],',
        '  body.' + BODY_CLASS + ' .agnative-topnav-shell__item--icon[data-role="settings"],',
        '  body.' + BODY_CLASS + ' .agnative-topnav-right__profile[data-role="profile"] { display: none !important; }',
        '  body.' + BODY_CLASS + ' .agnative-topnav-shell__right { margin-left: 0 !important; padding-left: 0 !important; }',
        '  body.' + BODY_CLASS + ' .agnative-topnav-shell__inner { padding: .18em .22em !important; }',
        '}',
        // === Android 9 ATV performance overrides ===
        // backdrop-filter, mix-blend-mode and large blurs are extremely expensive on Android TV
        // WebView (Mali/Amlogic). Replace with solid backgrounds and remove blend modes.
        IS_ANDROID_TV ? (
          'body.' + BODY_CLASS + ' .agnative-topnav-shell__inner,' +
          'body.' + BODY_CLASS + ' .agnative-topnav-rightdock,' +
          'body.' + BODY_CLASS + ' .agnative-topnav-clock,' +
          'body.' + BODY_CLASS + ' .head__navigator,' +
          'body.' + BODY_CLASS + ' .head__menu-icon,' +
          'body.' + BODY_CLASS + ' .nfx-card-logo,' +
          'body.' + BODY_CLASS + ' .nfx-card-rating,' +
          'body.' + BODY_CLASS + ' .card-episode .full-episode__num,' +
          'body.' + BODY_CLASS + ' .agnative-control-panel,' +
          'body.' + BODY_CLASS + ' .settings__content.layer--height,' +
          'body.' + BODY_CLASS + ' .selectbox__content.layer--height,' +
          'body.' + BODY_CLASS + ' .settings-input__content.layer--height {' +
          '  backdrop-filter: none !important;' +
          '  -webkit-backdrop-filter: none !important;' +
          '  background-color: rgba(20,22,28,.94) !important;' +
          '}' +
          // Strip blend-modes / heavy blur on glare overlays — keep visual cue with cheap gradient
          'body.' + GLARE_CLASS + ' .card .card__view::after,' +
          'body.' + GLARE_CLASS + ' .card-episode .full-episode__img::after,' +
          'body.' + GLARE_CLASS + ' .full-start-new__poster::after {' +
          '  display: none !important;' +
          '  content: none !important;' +
          '  filter: none !important;' +
          '  mix-blend-mode: normal !important;' +
          '  background: none !important;' +
          '}' +
          // Drop perspective 3D rotations — d-pad cannot drive them anyway
          'body.' + GLARE_CLASS + ' .card.focus .card__view,' +
          'body.' + GLARE_CLASS + ' .card.hover .card__view,' +
          'body.' + GLARE_CLASS + ' .card-episode.focus .full-episode,' +
          'body.' + GLARE_CLASS + ' .card-episode.hover .full-episode,' +
          'body.' + GLARE_CLASS + ' .full-start-new__poster.focus,' +
          'body.' + GLARE_CLASS + ' .full-start-new__poster.hover {' +
          '  transform: scale(1.05) !important;' +
          '  transition: transform .18s linear, box-shadow .18s linear !important;' +
          '}' +
          // Cheaper card focus: shorter transitions, simpler shadow, no saturate/brightness filters
          'body.' + BODY_CLASS + ' .card .card__view,' +
          'body.' + BODY_CLASS + ' .card-episode .full-episode__img {' +
          '  transition: transform .16s linear, box-shadow .16s linear !important;' +
          '  will-change: transform;' +
          '}' +
          'body.' + BODY_CLASS + ' .card.focus .card__view {' +
          '  filter: none !important;' +
          '  transform: scale(1.05) !important;' +
          '  box-shadow: 0 0 0 2px rgba(86,141,255,.92), 0 12px 26px rgba(0,0,0,.45) !important;' +
          '}' +
          'body.' + BODY_CLASS + ' .card.hover .card__view {' +
          '  filter: none !important;' +
          '  transform: scale(1.03) !important;' +
          '  box-shadow: 0 8px 18px rgba(0,0,0,.30) !important;' +
          '}' +
          'body.' + BODY_CLASS + ' .card-episode.focus .full-episode__img {' +
          '  filter: none !important;' +
          '  box-shadow: 0 0 0 2px rgba(86,141,255,.92), 0 12px 26px rgba(0,0,0,.45) !important;' +
          '}' +
          // Disable backdrop-blur on overlays/headers — render them flat
          'body.' + BODY_CLASS + ' .head,' +
          'body.' + BODY_CLASS + ' .head__body,' +
          'body.' + BODY_CLASS + ' .head__wrapper,' +
          'body.' + BODY_CLASS + ' .head__layer {' +
          '  backdrop-filter: none !important;' +
          '  -webkit-backdrop-filter: none !important;' +
          '}' +
          // Remove will-change preserve-3d (forces costly compositing layer per card)
          'body.' + GLARE_CLASS + ' .card,' +
          'body.' + GLARE_CLASS + ' .card-episode,' +
          'body.' + GLARE_CLASS + ' .full-start-new__poster {' +
          '  transform-style: flat !important;' +
          '  will-change: auto !important;' +
          '}' +
          // Bigger, clearer focus ring for 10-foot UI / d-pad navigation
          'body.' + BODY_CLASS + ' .menu .menu__item.focus,' +
          'body.' + BODY_CLASS + ' .settings-param.focus,' +
          'body.' + BODY_CLASS + ' .settings-folder.focus,' +
          'body.' + BODY_CLASS + ' .selectbox-item.focus,' +
          'body.' + BODY_CLASS + ' .agnative-topnav-shell__item.focus,' +
          'body.' + BODY_CLASS + ' .agnative-topnav-clock.focus,' +
          'body.' + BODY_CLASS + ' .agnative-control-panel__tile.focus {' +
          '  outline: 2px solid rgba(86,141,255,.95) !important;' +
          '  outline-offset: 2px !important;' +
          '  background: rgba(86,141,255,.18) !important;' +
          '  box-shadow: none !important;' +
          '  transition: none !important;' +
          '}'
        ) : ''
      ].join('\n');
      if (document.body) document.body.appendChild(style);
      else document.head.appendChild(style);
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
      var entered = false;
      entered = triggerSelectorEvent(node, 'hover:focus') || entered;
      entered = triggerSelectorEvent(node, 'hover:enter') || entered;
      if (entered) return true;
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
      if (controlPanelDocCloseBound || !document || !document.addEventListener) return;
      controlPanelDocCloseBound = true;
      var closeIfOutside = function (e) {
        var target = e && e.target;
        if (!target) return;

        if (document.body && document.body.classList.contains('settings--open')) {
          if (!(target.closest && target.closest('.settings'))) {
            try {
              if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.back === 'function') {
                Lampa.Controller.back();
              }
            } catch (err) { }
            markSwallowClick(280);
            consumeEvent(e);
            return;
          }
        }

        if (!controlPanelOpen) return;
        if (target.closest && target.closest('.agnative-control-panel')) return;
        if (target.closest && target.closest('.agnative-topnav-clock')) return;
        closeControlPanel(true);
        markSwallowClick(280);
        consumeEvent(e);
      };

      var swallowClick = function (e) {
        if (Date.now() >= swallowClickUntil) return;
        consumeEvent(e);
      };

      document.addEventListener('mousedown', closeIfOutside, true);
      document.addEventListener('touchstart', closeIfOutside, true);
      document.addEventListener('click', swallowClick, true);
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
      bindControlPanelOutsideClose();
      return panel;
    }

    function openControlPanel(head) {
      var panel = ensureControlPanel(head || qs('.head__body') || qs('.head'));
      if (!panel) return false;
      if (controlPanelOpen) return true;

      controlPanelOpen = true;
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');

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

    function registerTopnavController(shell) {
      if (!shell || !window.Lampa || !Lampa.Controller || !window.$) return;
      try {
        Lampa.Controller.collectionSet($(shell));
      } catch (e) { }
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

      ensureClock(head);
      ensureProfileButton(head);
      startClock();

      var shell = qs('.agnative-topnav-shell', head);
      if (!shell) {
        shell = document.createElement('div');
        shell.className = 'agnative-topnav-shell';
        shell.innerHTML = '<div class="agnative-topnav-shell__inner"><div class="agnative-topnav-shell__items"></div><div class="agnative-topnav-shell__right"></div></div>';
        head.appendChild(shell);
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
        var cbs = logoPending[cacheKey] || [];
        delete logoPending[cacheKey];
        for (var i = 0; i < cbs.length; i++) cbs[i](logo);
      }).catch(function () {
        logoCache[cacheKey] = null;
        var cbs = logoPending[cacheKey] || [];
        delete logoPending[cacheKey];
        for (var i = 0; i < cbs.length; i++) cbs[i](null);
      });
    }

    function logoImgUrl(logoPath) {
      return Lampa.TMDB.image('t/p/w300' + logoPath);
    }

    function fetchCleanPoster(id, type, callback) {
      var cacheKey = 'poster/' + type + '/' + id;
      if (cacheKey in posterCache) return callback(posterCache[cacheKey]);
      if (posterPending[cacheKey]) { posterPending[cacheKey].push(callback); return; }
      posterPending[cacheKey] = [callback];

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
        var cbs = posterPending[cacheKey] || [];
        delete posterPending[cacheKey];
        for (var i = 0; i < cbs.length; i++) cbs[i](path);
      }).catch(function () {
        posterCache[cacheKey] = null;
        var cbs = posterPending[cacheKey] || [];
        delete posterPending[cacheKey];
        for (var i = 0; i < cbs.length; i++) cbs[i](null);
      });
    }

    function switchCardToBackdrop(cardEl) {
      if (cardEl.getAttribute('data-nfx-switched')) return;
      cardEl.setAttribute('data-nfx-switched', '1');

      var data = extractCardData(cardEl);
      if (!data) return;

      var useBackdrop = backdropEnabled();

      var imgEl = cardEl.querySelector('.card__img');
      if (imgEl && data.backdrop_path && useBackdrop && !isMobile()) {
        if (imgEl.tagName === 'IMG') {
          if (!imgEl.hasAttribute('data-nfx-original-src')) {
            imgEl.setAttribute('data-nfx-original-src', imgEl.getAttribute('src') || '');
          }
        } else if (!imgEl.hasAttribute('data-nfx-original-bg')) {
          imgEl.setAttribute('data-nfx-original-bg', imgEl.style.backgroundImage || '');
        }
        var backdropUrl = Lampa.TMDB.image('t/p/w500' + data.backdrop_path);
        if (imgEl.tagName === 'IMG') {
          imgEl.src = backdropUrl;
          imgEl.style.objectFit = 'cover';
          imgEl.style.objectPosition = 'center';
        } else {
          imgEl.style.backgroundImage = 'url(' + backdropUrl + ')';
          imgEl.style.backgroundSize = 'cover';
          imgEl.style.backgroundPosition = 'center';
        }
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

      var metaParts = [];
      if (vote > 0) metaParts.push('<span class="nfx-card-overlay__match">' + Math.round(vote * 10) + '%</span>');
      if (year) metaParts.push('<span>' + year + '</span>');
      var genreNames = getGenreNames(data);
      if (genreNames.length) metaParts.push('<span>' + escapeHtml(genreNames.slice(0, 2).join(', ')) + '</span>');
      var metaHtml = metaParts.length ? '<div class="nfx-card-overlay__meta">' + metaParts.join('<span style="opacity:0.4"> · </span>') + '</div>' : '';

      var titleHtml = title ? '<div class="nfx-card-overlay__title">' + escapeHtml(title) + '</div>' : '';
      overlay.innerHTML = titleHtml + metaHtml;
      view.appendChild(overlay);

      var tmdbType = data.name ? 'tv' : 'movie';
      fetchLogo(data.id, tmdbType, function (logo) {
        if (!logo) return;
        var titleDiv = overlay.querySelector('.nfx-card-overlay__title');
        if (titleDiv) {
          var img = document.createElement('img');
          img.className = 'nfx-card-overlay__logo';
          img.src = logoImgUrl(logo.path);
          img.alt = title;
          img.loading = 'lazy';
          img.onerror = function () { img.style.display = 'none'; };
          titleDiv.replaceWith(img);
        }
      });

      if (badgeEnabled()) {
        var badge = document.createElement('div');
        badge.className = 'nfx-card-logo';
        badge.textContent = data.name ? t('badge_tv') : t('badge_movie');
        view.appendChild(badge);
      }

      if (ratingEnabled() && vote > 0) {
        var rating = document.createElement('div');
        rating.className = 'nfx-card-rating';
        rating.textContent = vote.toFixed(1);
        view.appendChild(rating);
      }

      if (!useBackdrop && data.id && imgEl) {
        fetchCleanPoster(data.id, tmdbType, function (posterPath) {
          if (!posterPath) return;
          var url = Lampa.TMDB.image('t/p/w500' + posterPath);
          if (imgEl.tagName === 'IMG') {
            imgEl.src = url;
          } else {
            imgEl.style.backgroundImage = 'url(' + url + ')';
            imgEl.style.backgroundSize = 'cover';
            imgEl.style.backgroundPosition = 'center';
          }
        });
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
          img.src = logoImgUrl(logo.path);
          img.alt = showInfo.name || '';
          img.loading = 'lazy';
          img.onerror = function () { img.style.display = 'none'; };
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
      // On Android TV, debounce + rAF batch to avoid layout thrash on weak GPUs
      var pendingNodes = [];
      var flushScheduled = false;
      var flushDelay = IS_ANDROID_TV ? 220 : 80;
      function flush() {
        flushScheduled = false;
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
      function schedule() {
        if (flushScheduled) return;
        flushScheduled = true;
        setTimeout(function () { rAF(flush); }, flushDelay);
      }
      new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            pendingNodes.push(added[j]);
          }
        }
        if (pendingNodes.length) schedule();
      }).observe(document.body, { childList: true, subtree: true });
    }

    function initGlareRuntime() {
      if (window.__AGNATIVE_TOPNAV_GLARE_RUNTIME__) return;
      window.__AGNATIVE_TOPNAV_GLARE_RUNTIME__ = true;
      if (!document.body) return;
      // Skip mouse-tracked 3D glare on Android TV — no pointer + heavy GPU cost on Mali/Amlogic
      if (IS_ANDROID_TV || !HAS_POINTER) return;

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
        if (!glareOn) { activeCard = null; activeRect = null; return; }
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
      }, { capture: true, passive: true });

      window.addEventListener('resize', function () {
        if (activeCard) activeRect = activeCard.getBoundingClientRect();
      }, { passive: true });

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

      var content = qs('.activity--active .scroll__content') || qs('.scroll__content');
      patchTopnav();
      if (!content) return;
      processCards(content);
      setTimeout(function () { processCards(content); }, 400);
      setTimeout(function () { processCards(content); }, 1200);
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

      injectStyle();
      if (document.body) document.body.classList.add(BODY_CLASS);
      syncGlareClass();
      syncFontSize();
      syncCardSize();
      syncCardFlags();
      syncThemeColor();
      syncMainCardScale();
      observeCards();
      initGlareRuntime();
      processCards(document.body);
      schedulePatch();
      // On Android TV one re-inject is enough — fewer timer wake-ups
      if (!IS_ANDROID_TV) {
        setTimeout(function () { injectStyle(); }, 1000);
        setTimeout(function () { injectStyle(); }, 3000);
      } else {
        setTimeout(function () { injectStyle(); }, 1500);
      }
      setTimeout(function () {
        var actBody = qs('.activity--active .activity__body') || qs('.activity__body');
        if (actBody) {
          processCards(actBody);
        }
      }, 600);

      setTimeout(function () { schedulePatch(); }, 600);
      if (!IS_ANDROID_TV) setTimeout(function () { schedulePatch(); }, 1500);
    }

    function bootPlugin() {
      registerSettings();
      startPlugin();
      // Reduce repeated full re-boots on Android TV (each one re-binds listeners + re-injects CSS)
      if (IS_ANDROID_TV) {
        setTimeout(function () { startPlugin(); }, 900);
        bindAndroidTvRemote();
      } else {
        setTimeout(function () { startPlugin(); }, 250);
        setTimeout(function () { startPlugin(); }, 900);
        setTimeout(function () { startPlugin(); }, 1800);
      }
    }

    // Android TV remote: MENU key (82) toggles the control panel; ensure DPAD_CENTER (23)
    // and Enter (13) reach the focused topnav/clock/control-panel selectors.
    var androidTvKeysBound = false;
    function bindAndroidTvRemote() {
      if (androidTvKeysBound) return;
      androidTvKeysBound = true;
      try {
        document.addEventListener('keydown', function (e) {
          var code = e.keyCode || e.which;
          // MENU (82) — open/close control panel if enabled
          if (code === 82) {
            if (!controlPanelEnabled()) return;
            var head = qs('.head__body') || qs('.head');
            triggerClockActions(head);
            if (e.preventDefault) e.preventDefault();
            return;
          }
          // ESC / BACK while control panel is open — close it without leaving activity
          if ((code === 27 || code === 8) && controlPanelOpen) {
            closeControlPanel(true);
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            return;
          }
          // DPAD_CENTER (23) — translate to Enter on focused selector if Lampa missed it
          if (code === 23) {
            var active = document.activeElement;
            if (active && active.classList && active.classList.contains('selector')) {
              try {
                if (window.$) $(active).trigger('hover:enter');
                else clickNode(active);
              } catch (err) { clickNode(active); }
              if (e.preventDefault) e.preventDefault();
            }
          }
        }, true);
      } catch (e) { }
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
/* ============================================================
   BUNDLED PLUGIN: Card Design + Liquid Glass (Style.js)
   ============================================================ */
(function () {
    'use strict';

    var STYLE_ID = 'lampa-custom-cards-style';

    // 1. Параметры плагина (значения по умолчанию сохранены)
    var Settings = {
        radius:      function () { return Lampa.Storage.get('custom_card_radius', '1.5'); },
        borderWidth: function () { return Lampa.Storage.get('custom_card_border_width', '2'); },
        borderColor: function () { return Lampa.Storage.get('custom_card_border_color', '#00e5ff'); },
        focusScale:  function () { return Lampa.Storage.get('custom_card_scale', '1.08'); },
        glass:       function () { return Lampa.Storage.get('custom_card_glass', 'medium'); }
    };

    // Пресеты «жидкого стекла»: blur, насыщенность, прозрачность фона, яркость подсветки
    var GLASS_PRESETS = {
        off:    { blur: '0px',  sat: '100%', bg: 'rgba(20,20,24,0.96)',  hi: '0',    border: 'rgba(255,255,255,0.06)' },
        light:  { blur: '14px', sat: '160%', bg: 'rgba(28,28,32,0.55)',  hi: '0.18', border: 'rgba(255,255,255,0.14)' },
        medium: { blur: '24px', sat: '180%', bg: 'rgba(24,24,28,0.40)',  hi: '0.28', border: 'rgba(255,255,255,0.18)' },
        strong: { blur: '38px', sat: '200%', bg: 'rgba(20,20,26,0.28)',  hi: '0.38', border: 'rgba(255,255,255,0.24)' }
    };

    function applyStyles() {
        var existing = document.getElementById(STYLE_ID);
        if (existing) existing.remove();

        var r   = Settings.radius() + 'em';
        var bW  = Settings.borderWidth() + 'px';
        var bC  = Settings.borderColor();
        var sc  = Settings.focusScale();
        var g   = GLASS_PRESETS[Settings.glass()] || GLASS_PRESETS.medium;
        var glassOn = Settings.glass() !== 'off';

        // Лёгкая «тинт»-версия выбранного цвета рамки для ауры фокуса
        function hexToRgba(hex, a) {
            var c = hex.replace('#', '');
            if (c.length === 3) c = c.split('').map(function (x) { return x + x; }).join('');
            var n = parseInt(c, 16);
            return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
        }
        var auraSoft   = hexToRgba(bC, 0.28);
        var auraStrong = hexToRgba(bC, 0.55);

        var css = '' +
            /* === Базовая карточка === */
            '.card__view {' +
            '  border: ' + bW + ' solid transparent;' +
            '  transition: transform .22s cubic-bezier(.25,1,.5,1), box-shadow .22s ease, border-color .22s ease !important;' +
            '  will-change: transform;' +
            '  transform: translateZ(0);' +
            '  border-radius: ' + r + ' !important;' +
            '  overflow: hidden !important;' +
            '  position: relative;' +
            '}' +
            '.card__img { border-radius: ' + r + ' !important; backface-visibility: hidden; }' +

            /* === Эффект при фокусе с «жидким стеклом» === */
            '.card.focus .card__view {' +
            '  transform: scale(' + sc + ') !important;' +
            '  border-color: ' + bC + ' !important;' +
            '  box-shadow:' +
            '    0 0 0 1px ' + auraSoft + ',' +
            '    0 14px 38px rgba(0,0,0,.55),' +
            '    0 0 26px ' + auraStrong + ' !important;' +
            '  z-index: 10;' +
            '}' +
            /* Блик-«линза» поверх постера в фокусе — мягкое стеклянное сияние */
            (glassOn ?
                '.card.focus .card__view::before {' +
                '  content: "";' +
                '  position: absolute; inset: 0;' +
                '  border-radius: inherit;' +
                '  pointer-events: none;' +
                '  background: linear-gradient(135deg, rgba(255,255,255,' + g.hi + ') 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 62%, rgba(255,255,255,' + (parseFloat(g.hi) * 0.45).toFixed(2) + ') 100%);' +
                '  mix-blend-mode: screen;' +
                '  z-index: 2;' +
                '}'
                : '') +

            /* Убираем стандартную белую рамку Lampa */
            '.card.focus .card__view::after { display: none !important; }' +

            /* === Жидкое стекло на модалках, селектбоксах, настройках, меню === */
            '.settings__content,' +
            '.selectbox__content,' +
            '.modal__content,' +
            '.selectbox-item,' +
            '.menu,' +
            '.head,' +
            '.full-start__background-layers,' +
            '.full-start-new__rate-line {' +
            '  border-radius: ' + r + ' !important;' +
            '  border: 1px solid ' + g.border + ' !important;' +
            '  background: ' + g.bg + ' !important;' +
            (glassOn
                ? '  -webkit-backdrop-filter: blur(' + g.blur + ') saturate(' + g.sat + ') !important;' +
                  '  backdrop-filter: blur(' + g.blur + ') saturate(' + g.sat + ') !important;'
                : '  -webkit-backdrop-filter: none !important; backdrop-filter: none !important;') +
            '  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 18px 48px rgba(0,0,0,.45) !important;' +
            '}' +

            /* Стеклянная подложка под пунктами селектбокса */
            (glassOn ?
                '.selectbox-item.focus, .settings-param.focus, .menu__item.focus {' +
                '  background: linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.06)) !important;' +
                '  -webkit-backdrop-filter: blur(' + g.blur + ') saturate(' + g.sat + ');' +
                '  backdrop-filter: blur(' + g.blur + ') saturate(' + g.sat + ');' +
                '  border-radius: .6em !important;' +
                '  box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 0 0 1px ' + auraSoft + ' !important;' +
                '}'
                : '') +

            /* Топ-бар и нижняя панель управления — лёгкая стеклянная плёнка */
            (glassOn ?
                '.head, .player-panel, .control-panel {' +
                '  -webkit-backdrop-filter: blur(' + g.blur + ') saturate(' + g.sat + ');' +
                '  backdrop-filter: blur(' + g.blur + ') saturate(' + g.sat + ');' +
                '  background: ' + g.bg + ' !important;' +
                '  border-bottom: 1px solid ' + g.border + ' !important;' +
                '}'
                : '');

        var styleSheet = document.createElement('style');
        styleSheet.id = STYLE_ID;
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
    }

    function init() {
        Lampa.SettingsApi.addComponent({
            component: 'card_design',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',
            name: 'Дизайн карточек'
        });

        // Скругление углов
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: {
                name: 'custom_card_radius',
                type: 'select',
                values: { '0': 'Квадратные', '0.8': 'Лёгкое', '1.5': 'Среднее', '2.2': 'Полное' },
                default: '1.5'
            },
            field: { name: 'Скругление углов', description: 'Насколько круглыми будут углы постеров' },
            onChange: applyStyles
        });

        // Цвет рамки фокуса
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: {
                name: 'custom_card_border_color',
                type: 'select',
                values: {
                    '#00e5ff': 'Бирюзовый',
                    '#ff3d00': 'Красный',
                    '#7c4dff': 'Фиолетовый',
                    '#ffea00': 'Жёлтый',
                    '#ffffff': 'Белый'
                },
                default: '#00e5ff'
            },
            field: { name: 'Цвет рамки фокуса', description: 'Цвет обводки при наведении на карточку' },
            onChange: applyStyles
        });

        // Толщина рамки
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: {
                name: 'custom_card_border_width',
                type: 'select',
                values: { '0': 'Без рамки', '2': 'Тонкая', '4': 'Жирная' },
                default: '2'
            },
            field: { name: 'Толщина рамки', description: 'Толщина цветной линии фокуса' },
            onChange: applyStyles
        });

        // Масштаб при фокусе
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: {
                name: 'custom_card_scale',
                type: 'select',
                values: { '1.0': 'Без увеличения', '1.04': 'Минимальное', '1.08': 'Стандарт', '1.12': 'Максимальное' },
                default: '1.08'
            },
            field: { name: 'Масштаб при фокусе', description: 'Насколько увеличивается карточка' },
            onChange: applyStyles
        });

        // Эффект «жидкого стекла»
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: {
                name: 'custom_card_glass',
                type: 'select',
                values: {
                    'off':    'Выключено',
                    'light':  'Лёгкое',
                    'medium': 'Среднее',
                    'strong': 'Сильное'
                },
                default: 'medium'
            },
            field: { name: 'Жидкое стекло', description: 'Размытие и стеклянный блик на карточках, меню и модальных окнах' },
            onChange: applyStyles
        });

        applyStyles();
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });

})();

/* ============================================================
   BUNDLED PLUGIN: Color Settings (colors.js)
   ============================================================ */
(function () {
    'use strict';

    Lampa.Lang.add({
        color_plugin: {
            ru: 'Настройка цветов',
            en: 'Color settings',
            uk: 'Налаштування кольорів'
        },
        color_plugin_enabled: {
            ru: 'Включить плагин',
            en: 'Enable plugin',
            uk: 'Увімкнути плагін'
        },
        color_plugin_enabled_description: {
            ru: 'Изменяет вид некоторых элементов интерфейса Lampa',
            en: 'Changes the appearance of some Lampa interface elements',
            uk: 'Змінює вигляд деяких елементів інтерфейсу Lampa'
        },
        main_color: {
            ru: 'Цвет выделения',
            en: 'Highlight color',
            uk: 'Колір виділення'
        },
        main_color_description: {
            ru: 'Выберите или укажите цвет',
            en: 'Select or specify a color',
            uk: 'Виберіть чи вкажіть колір'
        },
        enable_highlight: {
            ru: 'Показать рамку',
            en: 'Show border',
            uk: 'Показати рамку'
        },
        enable_highlight_description: {
            ru: 'Включает белую рамку вокруг некоторых выделенных элементов интерфейса',
            en: 'Enables a white border around some highlighted interface elements',
            uk: 'Вмикає білу рамку навколо деяких виділених елементів інтерфейсу'
        },
        enable_dimming: {
            ru: 'Применить цвет затемнения',
            en: 'Apply dimming color',
            uk: 'Застосувати колір затемнення'
        },
        enable_dimming_description: {
            ru: 'Изменяет цвет затемненных элементов интерфейса на темный оттенок выбранного цвета выделения',
            en: 'Changes the color of dimmed interface elements to a dark shade of the selected highlight color',
            uk: 'Змінює колір затемнених елементів інтерфейсу на темний відтінок вибраного кольору виділення'
        },
        default_color: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        custom_hex_input: {
            ru: 'Введи HEX',
            en: 'Enter HEX',
            uk: 'Введи HEX'
        },
        hex_input_hint: {
            ru: 'Используйте формат #FFFFFF, например #123524',
            en: 'Use the format #FFFFFF, for example #123524',
            uk: 'Використовуйте формат #FFFFFF, наприклад #123524'
        },
        red: { ru: 'Красный', en: 'Red', uk: 'Червоний' },
        orange: { ru: 'Оранжевый', en: 'Orange', uk: 'Помаранчевий' },
        amber: { ru: 'Янтарный', en: 'Amber', uk: 'Бурштиновий' },
        yellow: { ru: 'Желтый', en: 'Yellow', uk: 'Жовтий' },
        lime: { ru: 'Лаймовый', en: 'Lime', uk: 'Лаймовий' },
        green: { ru: 'Зеленый', en: 'Green', uk: 'Зелений' },
        emerald: { ru: 'Изумрудный', en: 'Emerald', uk: 'Смарагдовий' },
        teal: { ru: 'Бирюзовый', en: 'Teal', uk: 'Бірюзовий' },
        cyan: { ru: 'Голубой', en: 'Cyan', uk: 'Блакитний' },
        sky: { ru: 'Небесный', en: 'Sky', uk: 'Небесний' },
        blue: { ru: 'Синий', en: 'Blue', uk: 'Синій' },
        indigo: { ru: 'Индиго', en: 'Indigo', uk: 'Індиго' },
        violet: { ru: 'Фиолетовый', en: 'Violet', uk: 'Фіолетовий' },
        purple: { ru: 'Пурпурный', en: 'Purple', uk: 'Пурпуровий' },
        fuchsia: { ru: 'Фуксия', en: 'Fuchsia', uk: 'Фуксія' },
        pink: { ru: 'Розовый', en: 'Pink', uk: 'Рожевий' },
        rose: { ru: 'Розовый', en: 'Rose', uk: 'Трояндовий' },
        slate: { ru: 'Сланцевый', en: 'Slate', uk: 'Сланцевий' },
        gray: { ru: 'Серый', en: 'Gray', uk: 'Сірий' },
        zinc: { ru: 'Цинковый', en: 'Zinc', uk: 'Цинковий' },
        neutral: { ru: 'Нейтральный', en: 'Neutral', uk: 'Нейтральний' },
        stone: { ru: 'Каменный', en: 'Stone', uk: 'Кам\'яний' }
    });

    var ColorPlugin = {
        settings: {
            main_color: Lampa.Storage.get('color_plugin_main_color', '#353535'),
            enabled: Lampa.Storage.get('color_plugin_enabled', 'true') === 'true',
            highlight_enabled: Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true',
            dimming_enabled: Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true'
        },
        colors: {
            main: {
                'default': Lampa.Lang.translate('default_color'),
                '#fb2c36': 'Red 1', '#e7000b': 'Red 2', '#c10007': 'Red 3', '#9f0712': 'Red 4', '#82181a': 'Red 5', '#460809': 'Red 6',
                '#ff6900': 'Orange 1', '#f54900': 'Orange 2', '#ca3500': 'Orange 3', '#9f2d00': 'Orange 4', '#7e2a0c': 'Orange 5', '#441306': 'Orange 6',
                '#fe9a00': 'Amber 1', '#e17100': 'Amber 2', '#bb4d00': 'Amber 3', '#973c00': 'Amber 4', '#7b3306': 'Amber 5', '#461901': 'Amber 6',
                '#f0b100': 'Yellow 1', '#d08700': 'Yellow 2', '#a65f00': 'Yellow 3', '#894b00': 'Yellow 4', '#733e0a': 'Yellow 5', '#432004': 'Yellow 6',
                '#7ccf00': 'Lime 1', '#5ea500': 'Lime 2', '#497d00': 'Lime 3', '#3c6300': 'Lime 4', '#35530e': 'Lime 5', '#192e03': 'Lime 6',
                '#00c950': 'Green 1', '#00a63e': 'Green 2', '#008236': 'Green 3', '#016630': 'Green 4', '#0d542b': 'Green 5', '#032e15': 'Green 6',
                '#00bc7d': 'Emerald 1', '#009966': 'Emerald 2', '#007a55': 'Emerald 3', '#006045': 'Emerald 4', '#004f3b': 'Emerald 5', '#002c22': 'Emerald 6',
                '#00bba7': 'Teal 1', '#009689': 'Teal 2', '#00786f': 'Teal 3', '#005f5a': 'Teal 4', '#0b4f4a': 'Teal 5', '#022f2e': 'Teal 6',
                '#00b8db': 'Cyan 1', '#0092b8': 'Cyan 2', '#007595': 'Cyan 3', '#005f78': 'Cyan 4', '#104e64': 'Cyan 5', '#053345': 'Cyan 6',
                '#00a6f4': 'Sky 1', '#0084d1': 'Sky 2', '#0069a8': 'Sky 3', '#00598a': 'Sky 4', '#024a70': 'Sky 5', '#052f4a': 'Sky 6',
                '#2b7fff': 'Blue 1', '#155dfc': 'Blue 2', '#1447e6': 'Blue 3', '#193cb8': 'Blue 4', '#1c398e': 'Blue 5', '#162456': 'Blue 6',
                '#615fff': 'Indigo 1', '#4f39f6': 'Indigo 2', '#432dd7': 'Indigo 3', '#372aac': 'Indigo 4', '#312c85': 'Indigo 5', '#1e1a4d': 'Indigo 6',
                '#8e51ff': 'Violet 1', '#7f22fe': 'Violet 2', '#7008e7': 'Violet 3', '#5d0ec0': 'Violet 4', '#4d179a': 'Violet 5', '#2f0d68': 'Violet 6',
                '#ad46ff': 'Purple 1', '#9810fa': 'Purple 2', '#8200db': 'Purple 3', '#6e11b0': 'Purple 4', '#59168b': 'Purple 5', '#3c0366': 'Purple 6',
                '#e12afb': 'Fuchsia 1', '#c800de': 'Fuchsia 2', '#a800b7': 'Fuchsia 3', '#8a0194': 'Fuchsia 4', '#721378': 'Fuchsia 5', '#4b004f': 'Fuchsia 6',
                '#f6339a': 'Pink 1', '#e60076': 'Pink 2', '#c6005c': 'Pink 3', '#a3004c': 'Pink 4', '#861043': 'Pink 5', '#510424': 'Pink 6',
                '#ff2056': 'Rose 1', '#ec003f': 'Rose 2', '#c70036': 'Rose 3', '#a50036': 'Rose 4', '#8b0836': 'Rose 5', '#4d0218': 'Rose 6',
                '#62748e': 'Slate 1', '#45556c': 'Slate 2', '#314158': 'Slate 3', '#1d293d': 'Slate 4', '#0f172b': 'Slate 5', '#020618': 'Slate 6',
                '#6a7282': 'Gray 1', '#4a5565': 'Gray 2', '#364153': 'Gray 3', '#1e2939': 'Gray 4', '#101828': 'Gray 5', '#030712': 'Gray 6',
                '#71717b': 'Zinc 1', '#52525c': 'Zinc 2', '#3f3f46': 'Zinc 3', '#27272a': 'Zinc 4', '#18181b': 'Zinc 5', '#09090b': 'Zinc 6',
                '#737373': 'Neutral 1', '#525252': 'Neutral 2', '#404040': 'Neutral 3', '#262626': 'Neutral 4', '#171717': 'Neutral 5', '#0a0a0a': 'Neutral 6',
                '#79716b': 'Stone 1', '#57534d': 'Stone 2', '#44403b': 'Stone 3', '#292524': 'Stone 4', '#1c1917': 'Stone 5', '#0c0a09': 'Stone 6'
            }
        }
    };

    var isSaving = false;

    function hexToRgb(hex) {
        var cleanHex = hex.replace('#', '');
        var r = parseInt(cleanHex.substring(0, 2), 16);
        var g = parseInt(cleanHex.substring(2, 4), 16);
        var b = parseInt(cleanHex.substring(4, 6), 16);
        return r + ', ' + g + ', ' + b;
    }

    function rgbToHex(rgb) {
        var matches = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!matches) return rgb;
        function hex(n) { return ('0' + parseInt(n).toString(16)).slice(-2); }
        return '#' + hex(matches[1]) + hex(matches[2]) + hex(matches[3]);
    }

    function isValidHex(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    function updateDateElementStyles() {
        var elements = document.querySelectorAll('div[style*="position: absolute; left: 1em; top: 1em;"]');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (element.querySelector('div[style*="font-size: 2.6em"]')) {
                element.style.background = 'var(--main-color)';
            }
        }
    }

    function updateCanvasFillStyle(context) {
        if (context && context.fillStyle) {
            var rgbColor = hexToRgb(ColorPlugin.settings.main_color);
            context.fillStyle = 'rgba(' + rgbColor + ', 1)';
        }
    }

    function updatePluginIcon() {
        var svgIcon = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.components) {
            var menuItem = document.querySelector('.menu__item[data-component="color_plugin"] .menu__ico');
            if (menuItem) menuItem.innerHTML = svgIcon;
            return;
        }
        var component = Lampa.SettingsApi.components.find(function(c) { return c.component === 'color_plugin'; });
        if (component) {
            component.icon = svgIcon;
            if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
        }
    }

    function checkBodyStyles() {
        var body = document.body;
        var hasBlackStyle = body.classList.contains('black--style');
        var hasGlassStyle = body.classList.contains('glass--style');
        var computedStyle = window.getComputedStyle(body);
        var background = computedStyle.background || computedStyle.backgroundColor;
    }

    function saveSettings() {
        if (isSaving) return;
        isSaving = true;
        Lampa.Storage.set('color_plugin_main_color', ColorPlugin.settings.main_color);
        Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
        Lampa.Storage.set('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
        Lampa.Storage.set('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
        localStorage.setItem('color_plugin_main_color', ColorPlugin.settings.main_color);
        localStorage.setItem('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
        localStorage.setItem('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
        localStorage.setItem('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
        isSaving = false;
    }

    function applyStyles() {
        if (!ColorPlugin.settings.enabled) {
            var oldStyle = document.getElementById('color-plugin-styles');
            if (oldStyle) oldStyle.remove();
            return;
        }

        var style = document.getElementById('color-plugin-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'color-plugin-styles';
            document.head.appendChild(style);
        }

        var rgbColor = hexToRgb(ColorPlugin.settings.main_color);
        var focusBorderColor = ColorPlugin.settings.main_color === '#353535' ? '#ffffff' : 'var(--main-color)';

        var highlightStyles = ColorPlugin.settings.highlight_enabled ? (
            '-webkit-box-shadow: inset 0 0 0 0.15em #fff !important;' +
            'box-shadow: inset 0 0 0 0.15em #fff !important;'
        ) : '';

        var dimmingStyles = ColorPlugin.settings.dimming_enabled ? (
            '.full-start__rate {background: rgba(var(--main-color-rgb), 0.15) !important;}' +
            '.full-start__rate > div:first-child {background: rgba(var(--main-color-rgb), 0.15) !important;}' +
            '.reaction {background-color: rgba(var(--main-color-rgb), 0.3) !important;}' +
            '.full-start__button {background-color: rgba(var(--main-color-rgb), 0.3) !important;}' +
            '.card__vote {background: rgba(var(--main-color-rgb), 0.5) !important;}' +
            '.items-line__more {background: rgba(var(--main-color-rgb), 0.3) !important;}' +
            '.card__icons-inner {background: rgba(var(--main-color-rgb), 0.5) !important;}' +
            '.simple-button--filter > div {background-color: rgba(var(--main-color-rgb), 0.3) !important;}'
        ) : '';

        style.innerHTML = [
            ':root {--main-color: ' + ColorPlugin.settings.main_color + ' !important;--main-color-rgb: ' + rgbColor + ' !important;}',
            '.modal__title {font-size: 1.7em !important;}',
            '.modal__head {margin-bottom: 0 !important;}',
            '.modal .scroll__content {padding: 1.0em 0 !important;}',
            '.menu__ico, .menu__ico:hover, .menu__ico.traverse, .head__action, .head__action.focus, .head__action:hover, .settings-param__ico {color: #ffffff !important;fill: #ffffff !important;}',
            '.menu__ico.focus {color: #ffffff !important;fill: #ffffff !important;stroke: none !important;}',
            '.menu__item.focus .menu__ico path[fill], .menu__item.focus .menu__ico rect[fill], .menu__item.focus .menu__ico circle[fill], .menu__item.traverse .menu__ico path[fill], .menu__item.traverse .menu__ico rect[fill], .menu__item.traverse .menu__ico circle[fill], .menu__item:hover .menu__ico path[fill], .menu__item:hover .menu__ico rect[fill], .menu__item:hover .menu__ico circle[fill] {fill: #ffffff !important;}',
            '.menu__item.focus .menu__ico [stroke], .menu__item.traverse .menu__ico [stroke], .menu__item:hover .menu__ico [stroke] {stroke: #fff !important;}',
            '.menu__item, .menu__item.focus, .menu__item.traverse, .menu__item:hover, .console__tab, .console__tab.focus, .settings-param, .settings-param.focus, .selectbox-item, .selectbox-item.focus, .selectbox-item:hover, .full-person, .full-person.focus, .full-start__button, .full-start__button.focus, .full-descr__tag, .full-descr__tag.focus, .simple-button, .simple-button.focus, .player-panel .button, .player-panel .button.focus, .search-source, .search-source.active, .radio-item, .radio-item.focus, .lang__selector-item, .lang__selector-item.focus, .modal__button, .modal__button.focus, .search-history-key, .search-history-key.focus, .simple-keyboard-mic, .simple-keyboard-mic.focus, .full-review-add, .full-review-add.focus, .full-review, .full-review.focus, .tag-count, .tag-count.focus, .settings-folder, .settings-folder.focus, .noty, .radio-player, .radio-player.focus {color: #ffffff !important;}',
            '.console__tab {background-color: rgba(221, 221, 221, 0.06) !important;}',
            '.console__tab.focus {background: var(--main-color) !important;color: #fff !important;' + highlightStyles + '}',
            '.menu__item.focus, .menu__item.traverse, .menu__item:hover, .full-person.focus, .full-start__button.focus, .full-descr__tag.focus, .simple-button.focus, .head__action.focus, .head__action:hover, .player-panel .button.focus, .search-source.active {background: var(--main-color) !important;}',
            '.full-start__button.focus, .settings-param.focus, .items-line__more.focus, .menu__item.focus, .settings-folder.focus, .head__action.focus, .selectbox-item.focus, .simple-button.focus, .navigation-tabs__button.focus {' + highlightStyles + '}',
            '.timetable__item.focus::before {background-color: var(--main-color) !important;' + highlightStyles + '}',
            '.navigation-tabs__button.focus {background-color: var(--main-color) !important;color: #fff !important;' + highlightStyles + '}',
            '.items-line__more.focus {color: #fff !important;background-color: var(--main-color) !important;}',
            '.timetable__item.focus {color: #fff !important;}',
            '.broadcast__device.focus {background-color: var(--main-color) !important;color: #fff !important;}',
            '.iptv-menu__list-item.focus, .iptv-program__timeline>div {background-color: var(--main-color) !important;}',
            '.radio-item.focus, .lang__selector-item.focus, .simple-keyboard .hg-button.focus, .modal__button.focus, .search-history-key.focus, .simple-keyboard-mic.focus, .full-review-add.focus, .full-review.focus, .tag-count.focus, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .selectbox-item:hover {background: var(--main-color) !important;}',
            '.online.focus {box-shadow: 0 0 0 0.2em var(--main-color) !important;}',
            '.online_modss.focus::after, .online-prestige.focus::after, .radio-item.focus .radio-item__imgbox:after, .iptv-channel.focus::before, .iptv-channel.last--focus::before {border-color: var(--main-color) !important;}',
            '.card-more.focus .card-more__box::after {border: 0.3em solid var(--main-color) !important;}',
            '.iptv-playlist-item.focus::after, .iptv-playlist-item:hover::after {border-color: var(--main-color) !important;}',
            '.ad-bot.focus .ad-bot__content::after, .ad-bot:hover .ad-bot__content::after, .card-episode.focus .full-episode::after, .register.focus::after, .season-episode.focus::after, .full-episode.focus::after, .full-review-add.focus::after, .card.focus .card__view::after, .card:hover .card__view::after, .extensions__item.focus:after, .torrent-item.focus::after, .extensions__block-add.focus:after {border-color: var(--main-color) !important;}',
            '.broadcast__scan > div {background-color: var(--main-color) !important;}',
            '.card:hover .card__view, .card.focus .card__view {border-color: var(--main-color) !important;}',
            '.noty {background: var(--main-color) !important;}',
            '.radio-player.focus {background-color: var(--main-color) !important;}',
            '.explorer-card__head-img.focus::after {border: 0.3em solid var(--main-color) !important;}',
            '.cp-swatch.focus {border: 0.25em solid ' + focusBorderColor + ' !important;transform: scale(1.2) !important;box-shadow: 0 0 12px rgba(0,0,0,0.5) !important;z-index: 10 !important;}',
            '.cp-hex-btn.focus {border: 0.2em solid ' + focusBorderColor + ' !important;transform: scale(1.05) !important;box-shadow: 0 0 20px rgba(0,0,0,0.5) !important;}',
            '.cp-default-btn.focus {border: 0.2em solid ' + focusBorderColor + ' !important;transform: scale(1.1) !important;box-shadow: 0 0 12px rgba(0,0,0,0.5) !important;}',
            'body.glass--style .selectbox-item.focus, body.glass--style .settings-folder.focus, body.glass--style .settings-param.focus {background-color: var(--main-color) !important;}',
            'body.glass--style .settings-folder.focus .settings-folder__icon {-webkit-filter: none !important;filter: none !important;}',
            dimmingStyles,
            '.timetable__item--any::before {background-color: rgba(var(--main-color-rgb), 0.3) !important;}',
            '.element {background: var(--main-color) !important;}',
            '.bookmarks-folder__layer {background-color: var(--main-color) !important;}',
            '.cp-modal-wrap {padding: 0.4em 0.5em !important;}',
            '.cp-top-row {display: flex !important;align-items: center !important;gap: 0.6em !important;margin-bottom: 0.4em !important;justify-content: center !important;}',
            '.cp-default-btn {width: 2.2em !important;height: 2.2em !important;border-radius: 0.45em !important;background: #fff !important;border: 2px solid rgba(255,255,255,0.3) !important;position: relative !important;cursor: pointer !important;box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;flex-shrink: 0 !important;}',
            '.cp-default-btn::before, .cp-default-btn::after {content: "" !important;position: absolute !important;top: 50% !important;left: 15% !important;right: 15% !important;height: 2px !important;background-color: #353535 !important;margin-top: -1px !important;}',
            '.cp-default-btn::before {transform: rotate(45deg) !important;}',
            '.cp-default-btn::after {transform: rotate(-45deg) !important;}',
            '.cp-hex-btn {height: 2.2em !important;min-width: 5em !important;border-radius: 0.45em !important;border: 2px solid rgba(255,255,255,0.2) !important;cursor: pointer !important;display: flex !important;flex-direction: column !important;align-items: center !important;justify-content: center !important;color: #fff !important;font-size: 0.65em !important;font-weight: 500 !important;background: rgba(53,53,53,0.8) !important;box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;padding: 0 0.7em !important;flex-shrink: 0 !important;}',
            '.cp-hex-btn .cp-hex-label {font-size: 0.75em !important;opacity: 0.75 !important;text-transform: uppercase !important;}',
            '.cp-hex-btn .cp-hex-value {font-size: 0.95em !important;font-weight: bold !important;margin-top: 0.05em !important;}',
            /* ── 3 колонки × 8 строк: 22 семейства × 6 оттенков влезают на экран без скролла ── */
            '.cp-families {width: 100% !important;display: grid !important;grid-template-columns: repeat(3, 1fr) !important;grid-auto-flow: column !important;grid-template-rows: repeat(8, auto) !important;gap: 0.18em 0.4em !important;}',
            '.cp-family-row {display: flex !important;flex-direction: row !important;align-items: center !important;gap: 0.22em !important;padding: 0.15em 0.25em !important;background: rgba(255,255,255,0.04) !important;border-radius: 0.35em !important;}',
            '.cp-family-label {width: 3.2em !important;min-width: 3.2em !important;font-size: 0.55em !important;font-weight: 700 !important;text-transform: uppercase !important;color: #fff !important;text-align: right !important;padding-right: 0.3em !important;opacity: 0.85 !important;flex-shrink: 0 !important;}',
            '.cp-swatches {display: flex !important;flex-direction: row !important;gap: 0.22em !important;align-items: center !important;}',
            '.cp-swatch {width: 1.7em !important;height: 1.7em !important;border-radius: 0.32em !important;border: 2px solid transparent !important;cursor: pointer !important;flex-shrink: 0 !important;box-shadow: 0 1px 3px rgba(0,0,0,0.25) !important;transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease !important;}',
            '.cp-swatch.focus, .cp-swatch:hover {border-color: #fff !important;transform: scale(1.18) !important;box-shadow: 0 0 0 2px rgba(255,255,255,0.55), 0 4px 10px rgba(0,0,0,0.45) !important;z-index: 2 !important;}',
            '.cp-modal-wrap .scroll {height: 100% !important;}',
            '.color-picker-modal .modal__content {background: rgba(15,15,15,0.97) !important;border-radius: 1em !important;max-width: 94vw !important;width: 94vw !important;max-height: 90vh !important;overflow: hidden !important;}',
            '.color-picker-modal .modal__body {max-height: 88vh !important;overflow: hidden !important;}'
        ].join('');

        updateDateElementStyles();
        checkBodyStyles();
    }

    function openColorPicker() {
        var colorKeys = Object.keys(ColorPlugin.colors.main);
        var families = [
            'Red','Orange','Amber','Yellow','Lime','Green','Emerald','Teal','Cyan',
            'Sky','Blue','Indigo','Violet','Purple','Fuchsia','Pink','Rose','Slate',
            'Gray','Zinc','Neutral','Stone'
        ];

        var topRowHtml =
            '<div class="cp-top-row">' +
                '<div class="cp-default-btn selector" data-cptype="default" title="' + Lampa.Lang.translate('default_color') + '"></div>' +
                '<div class="cp-hex-btn selector" data-cptype="hex">' +
                    '<span class="cp-hex-label">' + Lampa.Lang.translate('custom_hex_input') + '</span>' +
                    '<span class="cp-hex-value">' + (Lampa.Storage.get('color_plugin_custom_hex','') || '#353535') + '</span>' +
                '</div>' +
            '</div>';

        var familiesHtml = '<div class="cp-families">';
        for (var i = 0; i < families.length; i++) {
            var family = families[i];
            var fColors = colorKeys.filter(function(k){ return ColorPlugin.colors.main[k].indexOf(family) === 0 && k !== 'default'; });
            if (!fColors.length) continue;
            familiesHtml += '<div class="cp-family-row">';
            familiesHtml += '<div class="cp-family-label">' + Lampa.Lang.translate(family.toLowerCase()) + '</div>';
            familiesHtml += '<div class="cp-swatches">';
            for (var j = 0; j < fColors.length; j++) {
                familiesHtml += '<div class="cp-swatch selector" data-cptype="swatch" data-color="' + fColors[j] + '" style="background-color:' + fColors[j] + ';" title="' + ColorPlugin.colors.main[fColors[j]] + '"></div>';
            }
            familiesHtml += '</div></div>';
        }
        familiesHtml += '</div>';

        var modalHtml = $('<div class="cp-modal-wrap">' + topRowHtml + familiesHtml + '</div>');

        try {
            Lampa.Modal.open({
                title: Lampa.Lang.translate('main_color'),
                size: 'large',
                align: 'center',
                html: modalHtml,
                className: 'color-picker-modal',
                onBack: function () {
                    saveSettings();
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('settings_component');
                    Lampa.Controller.enable('menu');
                },
                onSelect: function (a) {
                    if (!a || !a.length || !(a[0] instanceof HTMLElement)) return;
                    var el = a[0];
                    var cptype = el.getAttribute('data-cptype');

                    if (cptype === 'hex') {
                        Lampa.Noty.show(Lampa.Lang.translate('hex_input_hint'));
                        Lampa.Modal.close();
                        var inputOptions = {
                            name: 'color_plugin_custom_hex',
                            value: Lampa.Storage.get('color_plugin_custom_hex', ''),
                            placeholder: '#FFFFFF'
                        };
                        Lampa.Input.edit(inputOptions, function (value) {
                            if (!value) {
                                Lampa.Controller.toggle('settings_component');
                                Lampa.Controller.enable('menu');
                                return;
                            }
                            if (!isValidHex(value)) {
                                Lampa.Noty.show('Невірний формат HEX-коду. Використовуйте формат #FFFFFF.');
                                Lampa.Controller.toggle('settings_component');
                                Lampa.Controller.enable('menu');
                                return;
                            }
                            Lampa.Storage.set('color_plugin_custom_hex', value);
                            ColorPlugin.settings.main_color = value;
                            Lampa.Storage.set('color_plugin_main_color', value);
                            localStorage.setItem('color_plugin_main_color', value);
                            applyStyles();
                            updateCanvasFillStyle(window.draw_context);
                            saveSettings();
                            Lampa.Controller.toggle('settings_component');
                            Lampa.Controller.enable('menu');
                            if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
                        });
                        return;
                    }

                    var color;
                    if (cptype === 'default') {
                        color = '#353535';
                    } else {
                        color = el.getAttribute('data-color') || el.style.backgroundColor || ColorPlugin.settings.main_color;
                        if (color.indexOf('rgb') === 0) color = rgbToHex(color);
                    }

                    ColorPlugin.settings.main_color = color;
                    Lampa.Storage.set('color_plugin_main_color', color);
                    localStorage.setItem('color_plugin_main_color', color);
                    applyStyles();
                    updateCanvasFillStyle(window.draw_context);
                    saveSettings();
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('settings_component');
                    Lampa.Controller.enable('menu');
                    if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
                }
            });
        } catch(e) {}
    }

    function updateParamsVisibility(body) {
        var params = ['color_plugin_main_color','color_plugin_highlight_enabled','color_plugin_dimming_enabled'];
        var container = body || document;
        for (var i = 0; i < params.length; i++) {
            var selector = '.settings-param[data-name="' + params[i] + '"]';
            var elements = container.querySelectorAll ? container.querySelectorAll(selector) : $(selector);
            if (elements.length) {
                var displayValue = ColorPlugin.settings.enabled ? 'block' : 'none';
                for (var j = 0; j < elements.length; j++) {
                    var element = elements[j];
                    if (element.style) element.style.display = displayValue;
                    else if (typeof $(element).css === 'function') $(element).css('display', displayValue);
                }
            }
        }
        if (Lampa.SettingsApi && Lampa.SettingsApi.params) {
            var componentParams = Lampa.SettingsApi.params.filter(function(p){ return p.component === 'color_plugin'; });
            for (var k = 0; k < componentParams.length; k++) {
                var param = componentParams[k];
                if (param.param.name !== 'color_plugin_enabled') {
                    var paramElement = document.querySelector('.settings-param[data-name="' + param.param.name + '"]');
                    if (paramElement && paramElement.style) paramElement.style.display = ColorPlugin.settings.enabled ? 'block' : 'none';
                }
            }
        }
    }

    function initPlugin() {
        setTimeout(function() {
            ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color', '#353535') || localStorage.getItem('color_plugin_main_color') || '#353535';
            ColorPlugin.settings.enabled = (Lampa.Storage.get('color_plugin_enabled', 'true') === 'true' || localStorage.getItem('color_plugin_enabled') === 'true');
            ColorPlugin.settings.highlight_enabled = (Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true' || localStorage.getItem('color_plugin_highlight_enabled') === 'true');
            ColorPlugin.settings.dimming_enabled = (Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true' || localStorage.getItem('color_plugin_dimming_enabled') === 'true');

            if (Lampa.SettingsApi) {
                var svgIcon = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';

                Lampa.SettingsApi.addComponent({
                    component: 'color_plugin',
                    name: Lampa.Lang.translate('color_plugin'),
                    icon: svgIcon
                });

                Lampa.SettingsApi.addParam({
                    component: 'color_plugin',
                    param: { name: 'color_plugin_enabled', type: 'trigger', default: ColorPlugin.settings.enabled.toString() },
                    field: {
                        name: Lampa.Lang.translate('color_plugin_enabled'),
                        description: Lampa.Lang.translate('color_plugin_enabled_description')
                    },
                    onChange: function(value) {
                        ColorPlugin.settings.enabled = value === 'true';
                        Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
                        localStorage.setItem('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
                        applyStyles();
                        updateCanvasFillStyle(window.draw_context);
                        updateParamsVisibility();
                        saveSettings();
                        if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
                    },
                    onRender: function(item) {
                        if (item && typeof item.css === 'function') item.css('display','block');
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'color_plugin',
                    param: { name: 'color_plugin_main_color', type: 'button' },
                    field: {
                        name: Lampa.Lang.translate('main_color'),
                        description: Lampa.Lang.translate('main_color_description')
                    },
                    onRender: function(item) {
                        if (item && typeof item.css === 'function') item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                    },
                    onChange: function() { openColorPicker(); }
                });

                Lampa.SettingsApi.addParam({
                    component: 'color_plugin',
                    param: { name: 'color_plugin_highlight_enabled', type: 'trigger', default: ColorPlugin.settings.highlight_enabled.toString() },
                    field: {
                        name: Lampa.Lang.translate('enable_highlight'),
                        description: Lampa.Lang.translate('enable_highlight_description')
                    },
                    onRender: function(item) {
                        if (item && typeof item.css === 'function') item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                    },
                    onChange: function(value) {
                        ColorPlugin.settings.highlight_enabled = value === 'true';
                        Lampa.Storage.set('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
                        localStorage.setItem('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
                        applyStyles();
                        saveSettings();
                        if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'color_plugin',
                    param: { name: 'color_plugin_dimming_enabled', type: 'trigger', default: ColorPlugin.settings.dimming_enabled.toString() },
                    field: {
                        name: Lampa.Lang.translate('enable_dimming'),
                        description: Lampa.Lang.translate('enable_dimming_description')
                    },
                    onRender: function(item) {
                        if (item && typeof item.css === 'function') item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                    },
                    onChange: function(value) {
                        ColorPlugin.settings.dimming_enabled = value === 'true';
                        Lampa.Storage.set('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
                        localStorage.setItem('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
                        applyStyles();
                        saveSettings();
                        if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
                    }
                });

                applyStyles();
                updateCanvasFillStyle(window.draw_context);
                updatePluginIcon();
                updateParamsVisibility();
            }
        }, 100);
    }

    if (window.appready && Lampa.SettingsApi && Lampa.Storage) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready' && Lampa.SettingsApi && Lampa.Storage) initPlugin();
        });
    }

    Lampa.Storage.listener.follow('change', function(e) {
        if (e.name === 'color_plugin_enabled' || e.name === 'color_plugin_main_color' ||
            e.name === 'color_plugin_highlight_enabled' || e.name === 'color_plugin_dimming_enabled') {
            ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled','true') === 'true' || localStorage.getItem('color_plugin_enabled') === 'true';
            ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color','#353535') || localStorage.getItem('color_plugin_main_color') || '#353535';
            ColorPlugin.settings.highlight_enabled = Lampa.Storage.get('color_plugin_highlight_enabled','true') === 'true' || localStorage.getItem('color_plugin_highlight_enabled') === 'true';
            ColorPlugin.settings.dimming_enabled = Lampa.Storage.get('color_plugin_dimming_enabled','true') === 'true' || localStorage.getItem('color_plugin_dimming_enabled') === 'true';
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updateParamsVisibility();
        }
    });

    Lampa.Listener.follow('settings_component', function(event) {
        if (event.type === 'open') {
            ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled','true') === 'true' || localStorage.getItem('color_plugin_enabled') === 'true';
            ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color','#353535') || localStorage.getItem('color_plugin_main_color') || '#353535';
            ColorPlugin.settings.highlight_enabled = Lampa.Storage.get('color_plugin_highlight_enabled','true') === 'true' || localStorage.getItem('color_plugin_highlight_enabled') === 'true';
            ColorPlugin.settings.dimming_enabled = Lampa.Storage.get('color_plugin_dimming_enabled','true') === 'true' || localStorage.getItem('color_plugin_dimming_enabled') === 'true';
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon();
            updateParamsVisibility(event.body);
        } else if (event.type === 'close') {
            saveSettings();
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon();
        }
    });

})();
/* ============================================================
   BUNDLED PLUGIN: Applecation / AppleMax (applemax.js)
   ============================================================ */
!function(){"use strict";const t="1.2.1",e='<svg viewBox="110 90 180 210"xmlns=http://www.w3.org/2000/svg><g id=sphere><circle cx=200 cy=140 fill="hsl(200, 80%, 40%)"opacity=0.3 r=1.2 /><circle cx=230 cy=150 fill="hsl(200, 80%, 45%)"opacity=0.35 r=1.3 /><circle cx=170 cy=155 fill="hsl(200, 80%, 42%)"opacity=0.32 r=1.2 /><circle cx=245 cy=175 fill="hsl(200, 80%, 48%)"opacity=0.38 r=1.4 /><circle cx=155 cy=180 fill="hsl(200, 80%, 44%)"opacity=0.34 r=1.3 /><circle cx=215 cy=165 fill="hsl(200, 80%, 46%)"opacity=0.36 r=1.2 /><circle cx=185 cy=170 fill="hsl(200, 80%, 43%)"opacity=0.33 r=1.3 /><circle cx=260 cy=200 fill="hsl(200, 80%, 50%)"opacity=0.4 r=1.5 /><circle cx=140 cy=200 fill="hsl(200, 80%, 50%)"opacity=0.4 r=1.5 /><circle cx=250 cy=220 fill="hsl(200, 80%, 48%)"opacity=0.38 r=1.4 /><circle cx=150 cy=225 fill="hsl(200, 80%, 47%)"opacity=0.37 r=1.4 /><circle cx=235 cy=240 fill="hsl(200, 80%, 45%)"opacity=0.35 r=1.3 /><circle cx=165 cy=245 fill="hsl(200, 80%, 44%)"opacity=0.34 r=1.3 /><circle cx=220 cy=255 fill="hsl(200, 80%, 42%)"opacity=0.32 r=1.2 /><circle cx=180 cy=258 fill="hsl(200, 80%, 41%)"opacity=0.31 r=1.2 /><circle cx=200 cy=120 fill="hsl(200, 80%, 60%)"opacity=0.5 r=1.8 /><circle cx=240 cy=135 fill="hsl(200, 80%, 65%)"opacity=0.55 r=2 /><circle cx=160 cy=140 fill="hsl(200, 80%, 62%)"opacity=0.52 r=1.9 /><circle cx=270 cy=165 fill="hsl(200, 80%, 70%)"opacity=0.6 r=2.2 /><circle cx=130 cy=170 fill="hsl(200, 80%, 67%)"opacity=0.57 r=2.1 /><circle cx=255 cy=190 fill="hsl(200, 80%, 72%)"opacity=0.62 r=2.3 /><circle cx=145 cy=195 fill="hsl(200, 80%, 69%)"opacity=0.59 r=2.2 /><circle cx=280 cy=200 fill="hsl(200, 80%, 75%)"opacity=0.65 r=2.5 /><circle cx=120 cy=200 fill="hsl(200, 80%, 75%)"opacity=0.65 r=2.5 /><circle cx=275 cy=215 fill="hsl(200, 80%, 73%)"opacity=0.63 r=2.4 /><circle cx=125 cy=220 fill="hsl(200, 80%, 71%)"opacity=0.61 r=2.3 /><circle cx=260 cy=235 fill="hsl(200, 80%, 68%)"opacity=0.58 r=2.2 /><circle cx=140 cy=240 fill="hsl(200, 80%, 66%)"opacity=0.56 r=2.1 /><circle cx=245 cy=255 fill="hsl(200, 80%, 63%)"opacity=0.53 r=2 /><circle cx=155 cy=260 fill="hsl(200, 80%, 61%)"opacity=0.51 r=1.9 /><circle cx=225 cy=270 fill="hsl(200, 80%, 58%)"opacity=0.48 r=1.8 /><circle cx=175 cy=272 fill="hsl(200, 80%, 56%)"opacity=0.46 r=1.7 /><circle cx=200 cy=100 fill="hsl(200, 80%, 85%)"opacity=0.8 r=2.8 /><circle cx=230 cy=115 fill="hsl(200, 80%, 90%)"opacity=0.85 r=3 /><circle cx=170 cy=120 fill="hsl(200, 80%, 87%)"opacity=0.82 r=2.9 /><circle cx=250 cy=140 fill="hsl(200, 80%, 92%)"opacity=0.88 r=3.2 /><circle cx=150 cy=145 fill="hsl(200, 80%, 89%)"opacity=0.84 r=3.1 /><circle cx=265 cy=170 fill="hsl(200, 80%, 95%)"opacity=0.9 r=3.4 /><circle cx=135 cy=175 fill="hsl(200, 80%, 93%)"opacity=0.87 r=3.3 /><circle cx=275 cy=200 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.5 /><circle cx=125 cy=200 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.5 /><circle cx=200 cy=200 fill="hsl(200, 80%, 100%)"opacity=1 r=4 /><circle cx=220 cy=195 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.8 /><circle cx=180 cy=205 fill="hsl(200, 80%, 97%)"opacity=0.93 r=3.7 /><circle cx=240 cy=210 fill="hsl(200, 80%, 96%)"opacity=0.92 r=3.6 /><circle cx=160 cy=215 fill="hsl(200, 80%, 95%)"opacity=0.9 r=3.5 /><circle cx=270 cy=230 fill="hsl(200, 80%, 94%)"opacity=0.88 r=3.4 /><circle cx=130 cy=235 fill="hsl(200, 80%, 92%)"opacity=0.86 r=3.3 /><circle cx=255 cy=250 fill="hsl(200, 80%, 90%)"opacity=0.84 r=3.2 /><circle cx=145 cy=255 fill="hsl(200, 80%, 88%)"opacity=0.82 r=3.1 /><circle cx=235 cy=265 fill="hsl(200, 80%, 86%)"opacity=0.8 r=3 /><circle cx=165 cy=268 fill="hsl(200, 80%, 84%)"opacity=0.78 r=2.9 /><circle cx=215 cy=280 fill="hsl(200, 80%, 82%)"opacity=0.76 r=2.8 /><circle cx=185 cy=282 fill="hsl(200, 80%, 80%)"opacity=0.74 r=2.7 /><circle cx=200 cy=290 fill="hsl(200, 80%, 78%)"opacity=0.72 r=2.6 /><circle cx=210 cy=130 fill="hsl(200, 80%, 88%)"opacity=0.83 r=2.5 /><circle cx=190 cy=135 fill="hsl(200, 80%, 86%)"opacity=0.81 r=2.4 /><circle cx=225 cy=155 fill="hsl(200, 80%, 91%)"opacity=0.86 r=2.8 /><circle cx=175 cy=160 fill="hsl(200, 80%, 89%)"opacity=0.84 r=2.7 /><circle cx=245 cy=185 fill="hsl(200, 80%, 94%)"opacity=0.89 r=3.3 /><circle cx=155 cy=190 fill="hsl(200, 80%, 92%)"opacity=0.87 r=3.2 /><circle cx=260 cy=210 fill="hsl(200, 80%, 95%)"opacity=0.91 r=3.4 /><circle cx=140 cy=215 fill="hsl(200, 80%, 93%)"opacity=0.88 r=3.3 /><circle cx=250 cy=230 fill="hsl(200, 80%, 91%)"opacity=0.85 r=3.2 /><circle cx=150 cy=235 fill="hsl(200, 80%, 89%)"opacity=0.83 r=3.1 /><circle cx=230 cy=245 fill="hsl(200, 80%, 87%)"opacity=0.81 r=3 /><circle cx=170 cy=250 fill="hsl(200, 80%, 85%)"opacity=0.79 r=2.9 /><circle cx=210 cy=260 fill="hsl(200, 80%, 83%)"opacity=0.77 r=2.8 /><circle cx=190 cy=265 fill="hsl(200, 80%, 81%)"opacity=0.75 r=2.7 /></g></svg>',n={cacheLifetime:864e5,cacheKey:"applecation_ratings_cache",cacheLimit:500,requestTimeout:15e3,corsProxyUrl:"https://corsproxy.io/?url="};class a{static getJson(t,e,n,a={}){return this._request(t,e,n,{dataType:"json",...a})}static getText(t,e,n,a={}){return this._request(t,e,n,{dataType:"text",...a})}static _request(t,e,a,i){const o=new Lampa.Reguest;o.timeout(n.requestTimeout),o.silent(t,e,a,!1,i)}}class i{static clean(t){return t?t.replace(/[\s.,:;''`!?]+/g," ").trim():""}static cleanForKP(t){return this.clean(t).replace(/^[ \/\\]+/,"").replace(/[ \/\\]+$/,"").replace(/\+( *[+\/\\])+/g,"+").replace(/([+\/\\] *)+\+/g,"+").replace(/( *[\/\\]+ *)+/g,"+")}static normalize(t){return t?this.clean(t.toLowerCase().replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g,"-").replace(/ё/g,"е")):""}static equal(t,e){return"string"==typeof t&&"string"==typeof e&&this.normalize(t)===this.normalize(e)}static contains(t,e){return"string"==typeof t&&"string"==typeof e&&-1!==this.normalize(t).indexOf(this.normalize(e))}}class o{_getCache(){return Lampa.Storage.cache(n.cacheKey,n.cacheLimit,{})}get(t){if(!t)return null;const e=this._getCache(),a=e[t];if(!a)return null;return Date.now()-a.timestamp>n.cacheLifetime?(delete e[t],Lampa.Storage.set(n.cacheKey,e),null):a.data}set(t,e){if(!t)return;const a=this._getCache();a[t]={timestamp:Date.now(),data:e},Lampa.Storage.set(n.cacheKey,a)}}class l{static fetch(t,e){const n=Lampa.Storage.get("applecation_mdblist_api_key","");if(!n)return e({});const i=`https://api.mdblist.com/tmdb/${t.name?"show":"movie"}/${t.id}?apikey=${n}`;a.getJson(i,(t=>this._processResponse(t,e)),(()=>e({})))}static _processResponse(t,e){const n={};t&&t.ratings&&t.ratings.forEach((t=>{const e=(t.source||"").toString().toLowerCase().trim();"tmdb"!==e&&(n[e]="tomatoes"===e||"popcorn"===e?{value:t.value,score:t.score,votes:t.votes,url:t.url}:t.value)})),e(n)}}class r{static fetch(t,e){const n=Lampa.Storage.get("applecation_kp_api_key","");if(!n)return e(null);this._searchFilm(t,e,n)}static _searchFilm(t,e,n){const o=t.title||t.name,l=i.cleanForKP(o||""),{url:r,method:s}=this._buildSearchUrl(t,l);a.getJson(r,(a=>this._processSearchResponse(a,t,e,l,n)),(()=>e(null)),{headers:{"X-API-KEY":n}})}static _processSearchResponse(t,e,n,a,i){const o=t.items||t.films||[];o.length>0?this._selectBestMatch(e,o,n,i):e.imdb_id?this._searchByKeyword(a,e,n,i):n(null)}static _searchByKeyword(t,e,n,i){const o=`https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(t)}`;a.getJson(o,(t=>{const a=t.items||t.films||[];this._selectBestMatch(e,a,n,i)}),(()=>n(null)),{headers:{"X-API-KEY":i}})}static _selectBestMatch(t,e,n,a){const o=this._extractYear(t.release_date||t.first_air_date),l=t.original_title||t.original_name;let r=e.map((t=>{const e=t.start_date||t.year||"0000";return{...t,tmp_year:parseInt((e+"").slice(0,4))}}));if(t.imdb_id){const e=r.filter((e=>(e.imdb_id||e.imdbId)===t.imdb_id));if(e.length>0)return this._extractRating(e[0],n,a)}if(l&&(r=this._applyFilter(r,(t=>i.contains(t.orig_title||t.nameOriginal||t.nameEn||t.en_title,l)||i.contains(t.title||t.ru_title||t.nameRu,l)))),t.title&&(r=this._applyFilter(r,(e=>i.contains(e.title||e.ru_title||e.nameRu,t.title)||i.contains(e.en_title||e.nameEn||e.nameOriginal||e.orig_title,t.title)))),r.length>1&&null!==o&&o>0){const t=r.filter((t=>t.tmp_year===o));r=t.length>0?t:this._applyFilter(r,(t=>t.tmp_year&&t.tmp_year>o-2&&t.tmp_year<o+2))}1===r.length?this._extractRating(r[0],n,a):n(null)}static _applyFilter(t,e){const n=t.filter(e);return n.length>0?n:t}static _buildSearchUrl(t,e){return t.imdb_id?{url:`https://kinopoiskapiunofficial.tech/api/v2.2/films?imdbId=${encodeURIComponent(t.imdb_id)}`,method:"IMDb ID"}:{url:`https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(e)}`,method:"Keyword"}}static _extractYear(t){return t?parseInt((t+"").slice(0,4)):null}static _extractRating(t,e,n){const a=t.kp_id||t.kinopoisk_id||t.kinopoiskId||t.filmId,i=t.ratingKinopoisk||t.rating;if(i&&!isNaN(i)){const t=parseFloat(i);if(t>0&&t<=10)return e(t)}a?this._fetchRatingFromXML(a,e):e(null)}static _fetchRatingFromXML(t,e){const i=`https://rating.kinopoisk.ru/${t}.xml`,o=`${n.corsProxyUrl}${encodeURIComponent(i)}`;a.getText(o,(t=>{const n=this._parseXMLRating(t);e(n)}),(()=>e(null)))}static _parseXMLRating(t){try{const e=$($.parseXML(t)).find("kp_rating");if(e.length){const t=parseFloat(e.text());return t>0&&t<=10?t:null}}catch(t){}return null}}const s=new class{constructor(){this.cacheManager=new o,this.pendingRequests=new Map}fetch(t,e){if(!t||!t.id)return e(this._getEmptyResult());const n=Lampa.Storage.get("applecation_enabled_ratings",["imdb","kp"]),a=this.cacheManager.get(t.id);if(a)return e(a);if(this.pendingRequests.has(t.id))return void this.pendingRequests.get(t.id).push(e);this.pendingRequests.set(t.id,[e]);const i=this._createResult(t,!1);let o=0;const s=()=>{if(o--,o<=0){i.ready=!0,this.cacheManager.set(t.id,i);const e=this.pendingRequests.get(t.id)||[];this.pendingRequests.delete(t.id),e.forEach((t=>{try{t(i)}catch(t){}}))}};return Lampa.Storage.get("applecation_mdblist_api_key","")&&(o++,l.fetch(t,(t=>{Object.assign(i,t),s()}))),n.includes("kp")&&Lampa.Storage.get("applecation_kp_api_key","")&&(o++,r.fetch(t,(t=>{i.kp=t,s()}))),0===o?(i.ready=!0,e(i)):void 0}_getEmptyResult(){return this._createResult(null,!0)}_createResult(t,e){return{imdb:null,kp:null,tmdb:t&&t.vote_average?parseFloat(t.vote_average):null,tomatoes:null,popcorn:null,metacritic:null,letterboxd:null,trakt:null,myanimelist:null,ready:!!e}}};function c(t){return t&&!t.__destroyed}function p(t,e){if(!t||!Lampa.Storage.field("parser_use"))return;if(!Lampa.Parser||"function"!=typeof Lampa.Parser.get)return;const n=t.title||t.name||"Неизвестно",a=((t.first_air_date||t.release_date||"0000")+"").slice(0,4),i={df:t.original_title,df_year:t.original_title+" "+a,df_lg:t.original_title+" "+t.title,df_lg_year:t.original_title+" "+t.title+" "+a,lg:t.title,lg_year:t.title+" "+a,lg_df:t.title+" "+t.original_title,lg_df_year:t.title+" "+t.original_title+" "+a}[Lampa.Storage.field("parse_lang")]||t.title;Lampa.Parser.get({search:i,movie:t,page:1},(t=>{if(!c(e))return;if(!t||!t.Results||0===t.Results.length)return;const a={resolutions:new Set,hdr:new Set,audio:new Set,hasDub:!1};t.Results.forEach((t=>{if(t.ffprobe&&Array.isArray(t.ffprobe)){const e=function(t){if(!t||!Array.isArray(t))return null;const e={resolution:null,hdr:!1,dolbyVision:!1,audio:null},n=t.find((t=>"video"===t.codec_type));if(n){if(n.width&&n.height&&(e.resolution=`${n.width}x${n.height}`,n.height>=2160||n.width>=3840?e.resolutionLabel="4K":n.height>=1440||n.width>=2560?e.resolutionLabel="2K":n.height>=1080||n.width>=1920?e.resolutionLabel="FULL HD":(n.height>=720||n.width>=1280)&&(e.resolutionLabel="HD")),n.side_data_list){const t=n.side_data_list.some((t=>"Mastering display metadata"===t.side_data_type)),a=n.side_data_list.some((t=>"Content light level metadata"===t.side_data_type));n.side_data_list.some((t=>"DOVI configuration record"===t.side_data_type||"Dolby Vision RPU"===t.side_data_type))?(e.dolbyVision=!0,e.hdr=!0):(t||a)&&(e.hdr=!0)}!e.hdr&&n.color_transfer&&["smpte2084","arib-std-b67"].includes(n.color_transfer.toLowerCase())&&(e.hdr=!0),!e.dolbyVision&&n.codec_name&&(n.codec_name.toLowerCase().includes("dovi")||n.codec_name.toLowerCase().includes("dolby"))&&(e.dolbyVision=!0,e.hdr=!0)}const a=t.filter((t=>"audio"===t.codec_type));let i=0;return a.forEach((t=>{t.channels&&t.channels>i&&(i=t.channels)})),i>=8?e.audio="7.1":i>=6?e.audio="5.1":i>=4?e.audio="4.0":i>=2&&(e.audio="2.0"),e}(t.ffprobe);if(e&&(e.resolutionLabel&&a.resolutions.add(e.resolutionLabel),e.audio&&a.audio.add(e.audio)),!a.hasDub){t.ffprobe.filter((t=>"audio"===t.codec_type&&t.tags)).forEach((t=>{const e=(t.tags.language||"").toLowerCase(),n=(t.tags.title||t.tags.handler_name||"").toLowerCase();"rus"!==e&&"ru"!==e&&"russian"!==e||(n.includes("dub")||n.includes("дубляж")||n.includes("дублир")||"d"===n)&&(a.hasDub=!0)}))}}const e=t.Title.toLowerCase();(e.includes("dolby vision")||e.includes("dovi")||e.match(/\bdv\b/))&&a.hdr.add("Dolby Vision"),e.includes("hdr10+")&&a.hdr.add("HDR10+"),e.includes("hdr10")&&a.hdr.add("HDR10"),e.includes("hdr")&&a.hdr.add("HDR")}));const i={title:n,torrents_found:t.Results.length,quality:null,dv:!1,hdr:!1,hdr_type:null,sound:null,dub:a.hasDub};if(a.resolutions.size>0){const t=["8K","4K","2K","FULL HD","HD"];for(const e of t)if(a.resolutions.has(e)){i.quality=e;break}}if(a.hdr.has("Dolby Vision")&&(i.dv=!0,i.hdr=!0),a.hdr.size>0){i.hdr=!0;const t=["HDR10+","HDR10","HDR"];for(const e of t)if(a.hdr.has(e)){i.hdr_type=e;break}}if(a.audio.size>0){const t=["7.1","5.1","4.0","2.0"];for(const e of t)if(a.audio.has(e)){i.sound=e;break}}e&&void 0===e.applecation_quality&&(e.applecation_quality=i,function(t,e){const n=t.render().find(".applecation__quality-badges");if(!n.length)return;const a=[];if(e.quality){let t="";"4K"===e.quality?t='<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM113 20.9092L74.1367 82.1367V97.6367H118.818V114H137.637V97.6367H149.182V81.8633H137.637V20.9092H113ZM162.841 20.9092V114H182.522V87.5459L192.204 75.7275L217.704 114H241.25L206.296 62.5908L240.841 20.9092H217.25L183.75 61.9541H182.522V20.9092H162.841ZM119.182 81.8633H93.9541V81.1367L118.454 42.3633H119.182V81.8633Z" fill="white"/></svg>':"2K"===e.quality?t='<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM110.608 19.6367C104.124 19.6367 98.3955 20.8638 93.4258 23.3184C88.4563 25.7729 84.5925 29.2428 81.835 33.7275C79.0775 38.2123 77.6992 43.5001 77.6992 49.5908H96.3809C96.3809 46.6212 96.9569 44.0607 98.1084 41.9092C99.2599 39.7578 100.896 38.1056 103.017 36.9541C105.138 35.8026 107.623 35.2275 110.472 35.2275C113.199 35.2276 115.639 35.7724 117.79 36.8633C119.941 37.9238 121.638 39.4542 122.881 41.4541C124.123 43.4238 124.744 45.7727 124.744 48.5C124.744 50.9545 124.244 53.2421 123.244 55.3633C122.244 57.4542 120.774 59.5906 118.835 61.7725C116.926 63.9543 114.562 66.4094 111.744 69.1367L78.6084 99.8184V114H144.972V97.9092H105.881V97.2725L119.472 83.9541C125.865 78.1361 130.82 73.1514 134.335 69C137.85 64.8182 140.29 61.0151 141.653 57.5908C143.047 54.1666 143.744 50.6968 143.744 47.1816C143.744 41.8182 142.366 37.0606 139.608 32.9092C136.851 28.7577 132.986 25.515 128.017 23.1816C123.077 20.8182 117.275 19.6368 110.608 19.6367ZM159.778 20.9092V114H179.46V87.5459L189.142 75.7275L214.642 114H238.188L203.233 62.5908L237.778 20.9092H214.188L180.688 61.9541H179.46V20.9092H159.778Z" fill="white"/></svg>':"FULL HD"===e.quality?t='<svg viewBox="331 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M622 0C633.046 3.57563e-06 642 8.95431 642 20V114C642 125.046 633.046 134 622 134H351C339.954 134 331 125.046 331 114V20C331 8.95431 339.954 0 351 0H622ZM362.341 20.9092V114H382.022V75.5459H419.887V59.3184H382.022V37.1367H423.978V20.9092H362.341ZM437.216 20.9092V114H456.897V75.5459H496.853V114H516.488V20.9092H496.853V59.3184H456.897V20.9092H437.216ZM532.716 20.9092V114H565.716C575.17 114 583.291 112.136 590.079 108.409C596.897 104.682 602.125 99.333 605.762 92.3633C609.428 85.3937 611.262 77.0601 611.262 67.3633C611.262 57.6968 609.428 49.3934 605.762 42.4541C602.125 35.5149 596.928 30.1969 590.171 26.5C583.413 22.7727 575.352 20.9092 565.988 20.9092H532.716ZM564.943 37.7725C570.761 37.7725 575.655 38.8027 579.625 40.8633C583.595 42.9239 586.579 46.1364 588.579 50.5C590.609 54.8636 591.625 60.4847 591.625 67.3633C591.625 74.3026 590.609 79.9694 588.579 84.3633C586.579 88.7269 583.579 91.955 579.579 94.0459C575.609 96.1063 570.715 97.1367 564.897 97.1367H552.397V37.7725H564.943Z" fill="white"/></svg>':"HD"===e.quality&&(t='<svg viewBox="662 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M953 0C964.046 3.57563e-06 973 8.95431 973 20V114C973 125.046 964.046 134 953 134H682C670.954 134 662 125.046 662 114V20C662 8.95431 670.954 0 682 0H953ZM731.278 20.9092V114H750.96V75.5459H790.915V114H810.551V20.9092H790.915V59.3184H750.96V20.9092H731.278ZM826.778 20.9092V114H859.778C869.233 114 877.354 112.136 884.142 108.409C890.96 104.682 896.188 99.333 899.824 92.3633C903.491 85.3937 905.324 77.0601 905.324 67.3633C905.324 57.6968 903.491 49.3934 899.824 42.4541C896.188 35.5149 890.991 30.1969 884.233 26.5C877.476 22.7727 869.414 20.9092 860.051 20.9092H826.778ZM859.006 37.7725C864.824 37.7725 869.718 38.8027 873.688 40.8633C877.657 42.9239 880.642 46.1364 882.642 50.5C884.672 54.8636 885.687 60.4847 885.688 67.3633C885.688 74.3026 884.672 79.9694 882.642 84.3633C880.642 88.7269 877.642 91.955 873.642 94.0459C869.672 96.1063 864.778 97.1367 858.96 97.1367H846.46V37.7725H859.006Z" fill="white"/></svg>'),t&&a.push(`<div class="quality-badge quality-badge--res">${t}</div>`)}e.dv&&a.push('<div class="quality-badge quality-badge--dv"><svg viewBox="0 0 1051 393" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,393) scale(0.1,-0.1)" fill="currentColor"><path d="M50 2905 l0 -1017 223 5 c146 4 244 11 287 21 361 85 638 334 753 677 39 116 50 211 44 366 -7 200 -52 340 -163 511 -130 199 -329 344 -574 419 -79 24 -102 26 -327 31 l-243 4 0 -1017z"/><path d="M2436 3904 c-443 -95 -762 -453 -806 -905 -30 -308 86 -611 320 -832 104 -99 212 -165 345 -213 133 -47 253 -64 468 -64 l177 0 0 1015 0 1015 -217 -1 c-152 0 -239 -5 -287 -15z"/><path d="M3552 2908 l3 -1013 425 0 c309 0 443 4 490 13 213 43 407 148 550 299 119 124 194 255 247 428 25 84 27 103 27 270 1 158 -2 189 -22 259 -72 251 -221 458 -424 590 -97 63 -170 97 -288 134 l-85 26 -463 4 -462 3 2 -1013z m825 701 c165 -22 283 -81 404 -199 227 -223 279 -550 133 -831 -70 -133 -176 -234 -319 -304 -132 -65 -197 -75 -490 -75 l-245 0 0 703 c0 387 3 707 7 710 11 11 425 8 510 -4z"/><path d="M7070 2905 l0 -1015 155 0 155 0 0 1015 0 1015 -155 0 -155 0 0 -1015z"/><path d="M7640 2905 l0 -1015 150 0 150 0 0 60 c0 33 2 60 5 60 2 0 33 -15 67 -34 202 -110 433 -113 648 -9 79 38 108 59 180 132 72 71 95 102 134 181 102 207 102 414 1 625 -120 251 -394 411 -670 391 -115 -8 -225 -42 -307 -93 -21 -13 -42 -23 -48 -23 -7 0 -10 125 -10 370 l0 370 -150 0 -150 0 0 -1015z m832 95 c219 -67 348 -310 280 -527 -62 -198 -268 -328 -466 -295 -96 15 -168 52 -235 119 -131 132 -164 311 -87 478 27 60 101 145 158 181 100 63 234 80 350 44z"/><path d="M6035 3286 c-253 -49 -460 -232 -542 -481 -23 -70 -26 -96 -26 -210 0 -114 3 -140 26 -210 37 -113 90 -198 177 -286 84 -85 170 -138 288 -177 67 -22 94 -26 207 -26 113 0 140 4 207 26 119 39 204 92 288 177 87 89 140 174 177 286 22 67 26 99 27 200 1 137 -14 207 -69 320 -134 277 -457 440 -760 381z m252 -284 c117 -37 206 -114 260 -229 121 -253 -38 -548 -321 -595 -258 -43 -503 183 -483 447 20 271 287 457 544 377z"/><path d="M9059 3258 c10 -24 138 -312 285 -642 l266 -598 -72 -162 c-39 -88 -78 -171 -86 -183 -37 -58 -132 -80 -208 -48 l-35 14 -18 -42 c-10 -23 -37 -84 -60 -135 -23 -52 -39 -97 -36 -102 3 -4 40 -23 83 -41 70 -31 86 -34 177 -34 93 0 105 2 167 33 76 37 149 104 180 166 29 57 799 1777 805 1799 5 16 -6 17 -161 15 l-167 -3 -185 -415 c-102 -228 -192 -431 -200 -450 l-15 -35 -201 453 -201 452 -168 0 -168 0 18 -42z"/><path d="M2650 968 c0 -2 81 -211 179 -463 l179 -460 59 -3 59 -3 178 453 c98 249 180 459 183 466 4 9 -13 12 -65 12 -47 0 -71 -4 -74 -12 -3 -7 -65 -176 -138 -375 -73 -200 -136 -363 -139 -363 -3 0 -67 168 -142 373 l-136 372 -72 3 c-39 2 -71 1 -71 0z"/><path d="M3805 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 466 0 465 -60 0 c-39 0 -62 -4 -65 -12z"/><path d="M4580 960 c-97 -16 -178 -72 -211 -145 -23 -50 -24 -143 -3 -193 32 -77 91 -117 244 -167 99 -32 146 -64 166 -112 28 -65 -11 -149 -83 -179 -78 -33 -212 -1 -261 61 l-19 24 -48 -43 -48 -42 43 -37 c121 -103 347 -112 462 -17 54 44 88 120 88 194 -1 130 -79 213 -242 256 -24 7 -71 25 -104 41 -48 22 -66 37 -79 65 -32 67 -5 138 65 174 73 37 193 18 244 -39 l20 -22 43 43 c41 40 42 43 25 61 -27 30 -102 64 -167 76 -64 12 -70 12 -135 1z"/><path d="M5320 505 l0 -465 65 0 65 0 0 465 0 465 -65 0 -65 0 0 -465z"/><path d="M6210 960 c-147 -25 -264 -114 -328 -249 -32 -65 -36 -84 -40 -175 -7 -161 33 -271 135 -367 140 -132 360 -164 541 -77 227 108 316 395 198 634 -88 177 -290 271 -506 234z m232 -132 c100 -46 165 -136 188 -261 20 -106 -18 -237 -88 -310 -101 -105 -245 -132 -377 -73 -74 33 -120 79 -157 154 -31 62 -33 74 -33 167 0 87 4 107 26 155 64 137 173 204 320 196 43 -2 85 -12 121 -28z"/><path d="M7135 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 376 c0 207 3 374 8 371 4 -2 115 -171 247 -375 l240 -371 78 0 77 0 0 465 0 465 -60 0 -60 0 -2 -372 -3 -372 -241 370 -241 369 -82 3 c-59 2 -83 -1 -86 -10z"/></g></svg></div>');e.hdr&&e.hdr_type&&a.push('<div class="quality-badge quality-badge--hdr"><svg viewBox="-1 178 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="181.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M27.2784 293V199.909H46.9602V238.318H86.9148V199.909H106.551V293H86.9148V254.545H46.9602V293H27.2784ZM155.778 293H122.778V199.909H156.051C165.415 199.909 173.475 201.773 180.233 205.5C186.991 209.197 192.188 214.515 195.824 221.455C199.491 228.394 201.324 236.697 201.324 246.364C201.324 256.061 199.491 264.394 195.824 271.364C192.188 278.333 186.96 283.682 180.142 287.409C173.354 291.136 165.233 293 155.778 293ZM142.46 276.136H154.96C160.778 276.136 165.672 275.106 169.642 273.045C173.642 270.955 176.642 267.727 178.642 263.364C180.672 258.97 181.688 253.303 181.688 246.364C181.688 239.485 180.672 233.864 178.642 229.5C176.642 225.136 173.657 221.924 169.688 219.864C165.718 217.803 160.824 216.773 155.006 216.773H142.46V276.136ZM215.903 293V199.909H252.631C259.661 199.909 265.661 201.167 270.631 203.682C275.631 206.167 279.434 209.697 282.04 214.273C284.676 218.818 285.994 224.167 285.994 230.318C285.994 236.5 284.661 241.818 281.994 246.273C279.328 250.697 275.464 254.091 270.403 256.455C265.373 258.818 259.282 260 252.131 260H227.54V244.182H248.949C252.706 244.182 255.828 243.667 258.312 242.636C260.797 241.606 262.646 240.061 263.858 238C265.1 235.939 265.722 233.379 265.722 230.318C265.722 227.227 265.1 224.621 263.858 222.5C262.646 220.379 260.782 218.773 258.267 217.682C255.782 216.561 252.646 216 248.858 216H235.585V293H215.903ZM266.176 250.636L289.312 293H267.585L244.949 250.636H266.176Z" fill="currentColor"/></svg></div>');if(e.sound){let t="";"7.1"===e.sound?t='<svg viewBox="-1 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M91.6023 483L130.193 406.636V406H85.2386V389.909H150.557V406.227L111.92 483H91.6023ZM159.545 484.182C156.545 484.182 153.97 483.121 151.818 481C149.697 478.848 148.636 476.273 148.636 473.273C148.636 470.303 149.697 467.758 151.818 465.636C153.97 463.515 156.545 462.455 159.545 462.455C162.455 462.455 165 463.515 167.182 465.636C169.364 467.758 170.455 470.303 170.455 473.273C170.455 475.273 169.939 477.106 168.909 478.773C167.909 480.409 166.591 481.727 164.955 482.727C163.318 483.697 161.515 484.182 159.545 484.182ZM215.045 389.909V483H195.364V408.591H194.818L173.5 421.955V404.5L196.545 389.909H215.045Z" fill="currentColor"/></svg>':"5.1"===e.sound?t='<svg viewBox="330 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="333.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M443.733 484.273C437.309 484.273 431.581 483.091 426.551 480.727C421.551 478.364 417.581 475.106 414.642 470.955C411.703 466.803 410.172 462.045 410.051 456.682H429.142C429.354 460.288 430.869 463.212 433.688 465.455C436.506 467.697 439.854 468.818 443.733 468.818C446.824 468.818 449.551 468.136 451.915 466.773C454.309 465.379 456.172 463.455 457.506 461C458.869 458.515 459.551 455.667 459.551 452.455C459.551 449.182 458.854 446.303 457.46 443.818C456.097 441.333 454.203 439.394 451.778 438C449.354 436.606 446.581 435.894 443.46 435.864C440.733 435.864 438.081 436.424 435.506 437.545C432.96 438.667 430.975 440.197 429.551 442.136L412.051 439L416.46 389.909H473.369V406H432.688L430.278 429.318H430.824C432.46 427.015 434.93 425.106 438.233 423.591C441.536 422.076 445.233 421.318 449.324 421.318C454.93 421.318 459.93 422.636 464.324 425.273C468.718 427.909 472.188 431.53 474.733 436.136C477.278 440.712 478.536 445.985 478.506 451.955C478.536 458.227 477.081 463.803 474.142 468.682C471.233 473.53 467.157 477.348 461.915 480.136C456.703 482.894 450.642 484.273 443.733 484.273ZM500.733 484.182C497.733 484.182 495.157 483.121 493.006 481C490.884 478.848 489.824 476.273 489.824 473.273C489.824 470.303 490.884 467.758 493.006 465.636C495.157 463.515 497.733 462.455 500.733 462.455C503.642 462.455 506.188 463.515 508.369 465.636C510.551 467.758 511.642 470.303 511.642 473.273C511.642 475.273 511.127 477.106 510.097 478.773C509.097 480.409 507.778 481.727 506.142 482.727C504.506 483.697 502.703 484.182 500.733 484.182ZM556.233 389.909V483H536.551V408.591H536.006L514.688 421.955V404.5L537.733 389.909H556.233Z" fill="currentColor"/></svg>':"2.0"===e.sound&&(t='<svg viewBox="661 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="664.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M722.983 483V468.818L756.119 438.136C758.938 435.409 761.301 432.955 763.21 430.773C765.15 428.591 766.619 426.455 767.619 424.364C768.619 422.242 769.119 419.955 769.119 417.5C769.119 414.773 768.498 412.424 767.256 410.455C766.013 408.455 764.316 406.924 762.165 405.864C760.013 404.773 757.574 404.227 754.847 404.227C751.998 404.227 749.513 404.803 747.392 405.955C745.271 407.106 743.634 408.758 742.483 410.909C741.331 413.061 740.756 415.621 740.756 418.591H722.074C722.074 412.5 723.453 407.212 726.21 402.727C728.968 398.242 732.831 394.773 737.801 392.318C742.771 389.864 748.498 388.636 754.983 388.636C761.65 388.636 767.453 389.818 772.392 392.182C777.362 394.515 781.225 397.758 783.983 401.909C786.741 406.061 788.119 410.818 788.119 416.182C788.119 419.697 787.422 423.167 786.028 426.591C784.665 430.015 782.225 433.818 778.71 438C775.195 442.152 770.241 447.136 763.847 452.955L750.256 466.273V466.909H789.347V483H722.983ZM815.108 484.182C812.108 484.182 809.532 483.121 807.381 481C805.259 478.848 804.199 476.273 804.199 473.273C804.199 470.303 805.259 467.758 807.381 465.636C809.532 463.515 812.108 462.455 815.108 462.455C818.017 462.455 820.563 463.515 822.744 465.636C824.926 467.758 826.017 470.303 826.017 473.273C826.017 475.273 825.502 477.106 824.472 478.773C823.472 480.409 822.153 481.727 820.517 482.727C818.881 483.697 817.078 484.182 815.108 484.182ZM874.483 485.045C866.665 485.015 859.938 483.091 854.301 479.273C848.695 475.455 844.377 469.924 841.347 462.682C838.347 455.439 836.862 446.727 836.892 436.545C836.892 426.394 838.392 417.742 841.392 410.591C844.422 403.439 848.741 398 854.347 394.273C859.983 390.515 866.695 388.636 874.483 388.636C882.271 388.636 888.968 390.515 894.574 394.273C900.21 398.03 904.544 403.485 907.574 410.636C910.604 417.758 912.104 426.394 912.074 436.545C912.074 446.758 910.559 455.485 907.528 462.727C904.528 469.97 900.225 475.5 894.619 479.318C889.013 483.136 882.301 485.045 874.483 485.045ZM874.483 468.727C879.816 468.727 884.074 466.045 887.256 460.682C890.438 455.318 892.013 447.273 891.983 436.545C891.983 429.485 891.256 423.606 889.801 418.909C888.377 414.212 886.347 410.682 883.71 408.318C881.104 405.955 878.028 404.773 874.483 404.773C869.18 404.773 864.938 407.424 861.756 412.727C858.574 418.03 856.968 425.97 856.938 436.545C856.938 443.697 857.65 449.667 859.074 454.455C860.528 459.212 862.574 462.788 865.21 465.182C867.847 467.545 870.938 468.727 874.483 468.727Z" fill="currentColor"/></svg>'),t&&a.push(`<div class="quality-badge quality-badge--sound">${t}</div>`)}e.dub&&a.push('<div class="quality-badge quality-badge--dub"><svg viewBox="-1 558 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="561.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M60.5284 673H27.5284V579.909H60.8011C70.1648 579.909 78.2254 581.773 84.983 585.5C91.7405 589.197 96.9375 594.515 100.574 601.455C104.241 608.394 106.074 616.697 106.074 626.364C106.074 636.061 104.241 644.394 100.574 651.364C96.9375 658.333 91.7102 663.682 84.892 667.409C78.1042 671.136 69.983 673 60.5284 673ZM47.2102 656.136H59.7102C65.5284 656.136 70.4223 655.106 74.392 653.045C78.392 650.955 81.392 647.727 83.392 643.364C85.4223 638.97 86.4375 633.303 86.4375 626.364C86.4375 619.485 85.4223 613.864 83.392 609.5C81.392 605.136 78.4072 601.924 74.4375 599.864C70.4678 597.803 65.5739 596.773 59.7557 596.773H47.2102V656.136ZM178.153 579.909H197.835V640.364C197.835 647.152 196.214 653.091 192.972 658.182C189.759 663.273 185.259 667.242 179.472 670.091C173.684 672.909 166.941 674.318 159.244 674.318C151.517 674.318 144.759 672.909 138.972 670.091C133.184 667.242 128.684 663.273 125.472 658.182C122.259 653.091 120.653 647.152 120.653 640.364V579.909H140.335V638.682C140.335 642.227 141.108 645.379 142.653 648.136C144.229 650.894 146.441 653.061 149.29 654.636C152.138 656.212 155.456 657 159.244 657C163.063 657 166.381 656.212 169.199 654.636C172.047 653.061 174.244 650.894 175.79 648.136C177.366 645.379 178.153 642.227 178.153 638.682V579.909ZM214.028 673V579.909H251.301C258.15 579.909 263.862 580.924 268.438 582.955C273.013 584.985 276.453 587.803 278.756 591.409C281.059 594.985 282.21 599.106 282.21 603.773C282.21 607.409 281.483 610.606 280.028 613.364C278.574 616.091 276.574 618.333 274.028 620.091C271.513 621.818 268.634 623.045 265.392 623.773V624.682C268.938 624.833 272.256 625.833 275.347 627.682C278.468 629.53 280.998 632.121 282.938 635.455C284.877 638.758 285.847 642.697 285.847 647.273C285.847 652.212 284.619 656.621 282.165 660.5C279.741 664.348 276.15 667.394 271.392 669.636C266.634 671.879 260.771 673 253.801 673H214.028ZM233.71 656.909H249.756C255.241 656.909 259.241 655.864 261.756 653.773C264.271 651.652 265.528 648.833 265.528 645.318C265.528 642.742 264.907 640.47 263.665 638.5C262.422 636.53 260.65 634.985 258.347 633.864C256.074 632.742 253.362 632.182 250.21 632.182H233.71V656.909ZM233.71 618.864H248.301C250.998 618.864 253.392 618.394 255.483 617.455C257.604 616.485 259.271 615.121 260.483 613.364C261.725 611.606 262.347 609.5 262.347 607.045C262.347 603.682 261.15 600.97 258.756 598.909C256.392 596.848 253.028 595.818 248.665 595.818H233.71V618.864Z" fill="currentColor"/></svg></div>');a.length>0&&(n.html(a.join("")),n.addClass("show"))}(e,i))}),(t=>{}))}function d(){console.log("Applecation","v"+t),Lampa.Platform.screen("tv")?(function(){const t=Lampa.Api.sources.tmdb;if(!t)return;if(window.Lampa&&Lampa.TMDB&&Lampa.TMDB.api){const t=Lampa.TMDB.api;Lampa.TMDB.api=function(e){let n=e;if("string"==typeof n&&-1!==n.indexOf("append_to_response=")&&-1===n.indexOf("images")&&(n=n.replace("append_to_response=","append_to_response=images,"),-1===n.indexOf("include_image_language="))){const t=Lampa.Storage.field("tmdb_lang")||Lampa.Storage.get("language")||"ru";n+=(-1===n.indexOf("?")?"?":"&")+"include_image_language=en,null,"+t}return t.call(Lampa.TMDB,n)}}const e=Lampa.Template.js;Lampa.Template.js=function(t,n){if("full_episode"===t&&n&&(n.runtime>0?n.time=Lampa.Utils.secondsToTimeHuman(60*n.runtime).replace(/\./g,""):n.time="",n.air_date)){const t=new Date(n.air_date.replace(/-/g,"/")),e=t.getMonth()+1,a=Lampa.Lang.translate("month_"+e+"_e"),i=m("year_short");n.date=t.getDate()+" "+a+" "+t.getFullYear()+i}return e.call(Lampa.Template,t,n)};const n=t.img;t.img=function(e,a){const i=Lampa.Storage.field("poster_size");if("w1280"===a){a={w200:"w780",w300:"w1280",w500:"original"}[i]||"w1280"}if("w300"===a){a={w200:"w300",w300:"w780",w500:"w780"}[i]||"w300"}return"w276_and_h350_face"===a&&"w500"===i&&(a="w600_and_h900_face"),n.call(t,e,a)},Lampa.Api.img=t.img}(),f(),u(),function(){const t="<style>\n\n/* Основной контейнер */\n.applecation {\n    transition: all .3s;\n}\n\n.applecation .full-start-new__body {\n    height: 80vh;\n}\n\n.applecation .full-start-new__right {\n    display: flex;\n    align-items: flex-end;\n}\n\n.applecation .full-start-new__title {\n    font-size: 2.5em;\n    font-weight: 700;\n    line-height: 1.2;\n    margin-bottom: 0.5em;\n    text-shadow: 0 0 .1em rgba(0, 0, 0, 0.3);\n}\n\n/* Логотип */\n.applecation__logo {\n    margin-bottom: 0.5em;\n    opacity: 0;\n    transform: translateY(20px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n}\n\n.applecation__logo.loaded {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.applecation__logo img {\n    display: block;\n    max-width: 35vw;\n    max-height: 180px;\n    width: auto;\n    height: auto;\n    object-fit: contain;\n    object-position: left center;\n}\n\n/* Контейнер для масштабируемого контента */\n.applecation__content-wrapper {\n    font-size: 100%;\n}\n\n/* Мета информация (Тип/Жанр/поджанр) */\n.applecation__meta {\n    display: flex;\n    align-items: center;\n    color: #fff;\n    font-size: 1.1em;\n    margin-bottom: 0.5em;\n    line-height: 1;\n    opacity: 0;\n    transform: translateY(15px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n    transition-delay: 0.05s;\n}\n\n.applecation__meta.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.applecation__meta-left {\n    display: flex;\n    align-items: center;\n    line-height: 1;\n}\n\n.applecation__network {\n    display: inline-flex;\n    align-items: center;\n    line-height: 1;\n    margin-right: 1em;\n}\n\n.applecation__network img {\n    display: block;\n    max-height: 0.8em;\n    width: auto;\n    object-fit: contain;\n    filter: brightness(0) invert(1);\n}\n\n.applecation__meta-text {\n    line-height: 1;\n}\n\n.applecation__meta .full-start__pg {\n    margin: 0 0 0 0.6em;\n    padding: 0.2em 0.5em;\n    font-size: 0.85em;\n    font-weight: 600;\n    border: 1.5px solid rgba(255, 255, 255, 0.4);\n    border-radius: 0.3em;\n    background: rgba(255, 255, 255, 0.1);\n    color: rgba(255, 255, 255, 0.9);\n    line-height: 1;\n    vertical-align: middle;\n}\n\n/* Рейтинги */\n.applecation__ratings {\n    display: flex;\n    align-items: center;\n    gap: 0.8em;\n    margin-bottom: 0.5em;\n    opacity: 0;\n    transform: translateY(15px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n    transition-delay: 0.08s;\n}\n\n.applecation__ratings.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n/* Встроенные рейтинги: плавное появление контента внутри уже показанного блока */\n.applecation__ratings-builtin {\n    display: flex;\n    align-items: center;\n    gap: 0.8em;\n}\n\n@keyframes applecation-ratings-in {\n    from {\n        opacity: 0;\n        transform: translateY(15px);\n    }\n    to {\n        opacity: 1;\n        transform: translateY(0);\n    }\n}\n\n/* Каждый рейтинг анимируется при вставке. До раскрытия карточки анимация на паузе. */\n.applecation__ratings-builtin > div {\n    opacity: 0;\n    transform: translateY(15px);\n    animation: applecation-ratings-in 0.4s ease-out both;\n    animation-play-state: paused;\n}\n\n.applecation__ratings.show .applecation__ratings-builtin > div {\n    animation-play-state: running;\n}\n\n.applecation__ratings .rate--imdb,\n.applecation__ratings .rate--kp,\n.applecation__ratings .rate--tmdb,\n.applecation__ratings .rate--tomatoes,\n.applecation__ratings .rate--popcorn,\n.applecation__ratings .rate--metacritic,\n.applecation__ratings .rate--letterboxd,\n.applecation__ratings .rate--trakt,\n.applecation__ratings .rate--myanimelist,\n.applecation__ratings .builtin-rate--imdb,\n.applecation__ratings .builtin-rate--kp,\n.applecation__ratings .builtin-rate--tmdb,\n.applecation__ratings .builtin-rate--tomatoes,\n.applecation__ratings .builtin-rate--popcorn,\n.applecation__ratings .builtin-rate--metacritic,\n.applecation__ratings .builtin-rate--letterboxd,\n.applecation__ratings .builtin-rate--trakt,\n.applecation__ratings .builtin-rate--myanimelist {\n    display: flex;\n    align-items: center;\n    gap: 0.35em;\n}\n\n.applecation__ratings svg {\n    width: 1.8em;\n    height: auto;\n    flex-shrink: 0;\n    color: rgba(255, 255, 255, 0.85);\n}\n\n.applecation__ratings .rate--kp svg,\n.applecation__ratings .builtin-rate--kp svg {\n    width: 1.5em;\n}\n\n.applecation__ratings .rate--tmdb svg {\n    width: 1.6em;\n}\n\n.applecation__ratings .builtin-rate--tmdb svg {\n    width: 1.35em;\n}\n\n.applecation__ratings .rate--tomatoes svg,\n.applecation__ratings .builtin-rate--tomatoes svg {\n    width: 1.3em;\n}\n\n.applecation__ratings .rate--popcorn svg,\n.applecation__ratings .builtin-rate--popcorn svg {\n    width: 1em;\n}\n\n.applecation__ratings .rate--metacritic svg,\n.applecation__ratings .builtin-rate--metacritic svg {\n    width: 1.3em;\n}\n\n.applecation__ratings .rate--letterboxd svg,\n.applecation__ratings .builtin-rate--letterboxd svg {\n    width: 1.6em;\n}\n\n.applecation__ratings .rate--trakt svg,\n.applecation__ratings .builtin-rate--trakt svg {\n    width: 1.3em;\n}\n\n.applecation__ratings .rate--myanimelist svg,\n.applecation__ratings .builtin-rate--myanimelist svg {\n    width: 1.8em;\n}\n\n.applecation__ratings > div > div {\n    font-size: 0.95em;\n    font-weight: 600;\n    line-height: 1;\n    color: #fff;\n}\n\n/* Управление видимостью рейтингов через настройки */\nbody.applecation--hide-ratings .applecation__ratings {\n    display: none !important;\n}\n\n/* Скрытие рейтингов в зависимости от источника */\n/* Когда выбраны встроенные рейтинги - скрываем контейнеры для внешних плагинов */\nbody.applecation--ratings-source-builtin .applecation__ratings .rate--imdb,\nbody.applecation--ratings-source-builtin .applecation__ratings .rate--kp,\nbody.applecation--ratings-source-builtin .applecation__ratings .rate--tmdb {\n    display: none !important;\n}\n\n/* Когда выбраны внешние рейтинги - скрываем встроенные */\nbody.applecation--ratings-source-external .applecation__ratings-builtin {\n    display: none !important;\n}\n\n/* Расположение рейтингов - в правом нижнем углу */\nbody.applecation--ratings-corner .applecation__right {\n    gap: 1em;\n}\n\nbody.applecation--ratings-corner .applecation__ratings {\n    margin-bottom: 0;\n}\n\n/* Обертка для описания */\n.applecation__description-wrapper {\n    background-color: transparent;\n    padding: 0;\n    border-radius: 1em;\n    width: fit-content;\n    opacity: 0;\n    transform: translateY(15px);\n    transition:\n        padding 0.25s ease,\n        transform 0.25s ease,\n        opacity 0.4s ease-out;\n    transition-delay: 0.1s;\n}\n\n.applecation__description-wrapper.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.applecation__description-wrapper.focus {\n  background: linear-gradient(\n    135deg,\n    rgba(255, 255, 255, 0.28),\n    rgba(255, 255, 255, 0.18)\n  );\n  padding: .15em .4em 0 .7em;\n  border-radius: 1em;\n  width: fit-content;\n\n//   box-shadow:\n//     inset 0 1px 0 rgba(255, 255, 255, 0.35),\n//     0 8px 24px rgba(0, 0, 0, 0.25);\n  box-shadow:\n    inset 0 1px 0 rgba(255, 255, 255, 0.35);\n\n  transform: scale(1.07) translateY(0);\n  \n  transition-delay: 0s;\n}\n\n/* Описание */\n.applecation__description {\n    color: rgba(255, 255, 255, 0.6);\n    font-size: 0.95em;\n    line-height: 1.5;\n    margin-bottom: 0.5em;\n    max-width: 35vw;\n    display: -webkit-box;\n    -webkit-line-clamp: 4;\n    -webkit-box-orient: vertical;\n    overflow: hidden;\n    text-overflow: ellipsis;\n}\n\n\n.focus .applecation__description {\n  color: rgba(255, 255, 255, 0.92);\n}\n\n/* Дополнительная информация (Год/длительность) */\n.applecation__info {\n    color: rgba(255, 255, 255, 0.75);\n    font-size: 1em;\n    line-height: 1.4;\n    margin-bottom: 0.5em;\n    opacity: 0;\n    transform: translateY(15px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n    transition-delay: 0.15s;\n}\n\n.applecation__info.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n/* Левая и правая части */\n.applecation__left {\n    flex-grow: 1;\n}\n\n.applecation__right {\n    display: flex;\n    align-items: center;\n    flex-shrink: 0;\n    position: relative;\n}\n\n/* Выравнивание по baseline если рейтинги в углу */\nbody.applecation--ratings-corner .applecation__right {\n    align-items: last baseline;\n}\n\n/* Реакции */\n.applecation .full-start-new__reactions {\n    margin: 0;\n    display: flex;\n    flex-direction: column-reverse;\n    align-items: flex-end;\n}\n\n.applecation .full-start-new__reactions > div {\n    align-self: flex-end;\n}\n\n.applecation .full-start-new__reactions:not(.focus) {\n    margin: 0;\n}\n\n.applecation .full-start-new__reactions:not(.focus) > div:not(:first-child) {\n    display: none;\n}\n\n/* Стили первой реакции (всегда видимой) */\n.applecation .full-start-new__reactions > div:first-child .reaction {\n    display: flex !important;\n    align-items: center !important;\n    background-color: rgba(0, 0, 0, 0) !important;\n    gap: 0 !important;\n}\n\n.applecation .full-start-new__reactions > div:first-child .reaction__icon {\n    background-color: rgba(0, 0, 0, 0.3) !important;\n    -webkit-border-radius: 5em;\n    -moz-border-radius: 5em;\n    border-radius: 5em;\n    padding: 0.5em;\n    width: 2.6em !important;\n    height: 2.6em !important;\n}\n\n.applecation .full-start-new__reactions > div:first-child .reaction__count {\n    font-size: 1.2em !important;\n    font-weight: 500 !important;\n}\n\n/* При фокусе реакции раскрываются вверх */\n.applecation .full-start-new__reactions.focus {\n    gap: 0.5em;\n}\n\n.applecation .full-start-new__reactions.focus > div {\n    display: block;\n}\n\n/* Скрываем стандартный rate-line (используется только для статуса) */\n.applecation .full-start-new__rate-line {\n    margin: 0;\n    height: 0;\n    overflow: hidden;\n    opacity: 0;\n    pointer-events: none;\n}\n\n/* Фон - переопределяем стандартную анимацию на fade */\n.full-start__background {\n    height: calc(100% + 6em);\n    left: 0 !important;\n    opacity: 0 !important;\n    transition: opacity 0.6s ease-out, filter 0.3s ease-out !important;\n    animation: none !important;\n    transform: none !important;\n    will-change: opacity, filter;\n}\n\n.full-start__background.loaded:not(.dim) {\n    opacity: 1 !important;\n}\n\n.full-start__background.dim {\n  filter: blur(30px);\n}\n\n/* Удерживаем opacity при загрузке нового фона */\n.full-start__background.loaded.applecation-animated {\n    opacity: 1 !important;\n}\n\nbody:not(.menu--open) .full-start__background {\n    mask-image: none;\n}\n\n/* Отключаем стандартную анимацию Lampa для фона */\nbody.advanced--animation:not(.no--animation) .full-start__background.loaded {\n    animation: none !important;\n}\n\n/* Скрываем статус для предотвращения выхода реакций за экран */\n.applecation .full-start__status {\n    display: none;\n}\n\n/* Оверлей для затемнения левого края */\n.applecation__overlay {\n    width: 90vw;\n    background: linear-gradient(to right, rgba(0, 0, 0, 0.792) 0%, rgba(0, 0, 0, 0.504) 25%, rgba(0, 0, 0, 0.264) 45%, rgba(0, 0, 0, 0.12) 55%, rgba(0, 0, 0, 0.043) 60%, rgba(0, 0, 0, 0) 65%);\n}\n\n/* Бейджи качества */\n.applecation__quality-badges {\n    display: inline-flex;\n    align-items: center;\n    gap: 0.4em;\n    margin-left: 0.6em;\n    opacity: 0;\n    transform: translateY(10px);\n    transition: opacity 0.3s ease-out, transform 0.3s ease-out;\n}\n\n.applecation__quality-badges.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.quality-badge {\n    display: inline-flex;\n    height: 0.8em;\n}\n\n.quality-badge svg {\n    height: 100%;\n    width: auto;\n    display: block;\n}\n\n.quality-badge--res svg {\n    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));\n}\n\n.quality-badge--dv svg,\n.quality-badge--hdr svg,\n.quality-badge--sound svg,\n.quality-badge--dub svg {\n    color: rgba(255, 255, 255, 0.85);\n    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));\n}\n\n/* Эпизоды Apple TV */\n.applecation .full-episode--small {\n    width: 20em !important;\n    height: auto !important;\n    margin-right: 1.5em !important;\n    background: none !important;\n    display: flex !important;\n    flex-direction: column !important;\n    transition: transform 0.3s !important;\n}\n\n.applecation .full-episode--small.focus {\n    transform: scale(1.02);\n}\n\n.applecation .full-episode--next .full-episode__img::after {\n  border: none !important;\n}\n\n.applecation .full-episode__img {\n    padding-bottom: 56.25% !important;\n    border-radius: 0.8em !important;\n    margin-bottom: 1em !important;\n    background-color: rgba(255,255,255,0.05) !important;\n    position: relative !important;\n    overflow: visible !important;\n}\n\n.applecation .full-episode__img img {\n    border-radius: 0.8em !important;\n    object-fit: cover !important;\n}\n\n.applecation .full-episode__time {\n    position: absolute;\n    bottom: 0.8em;\n    left: 0.8em;\n    background: rgba(0,0,0,0.6);\n    padding: 0.2em 0.5em;\n    border-radius: 0.4em;\n    font-size: 0.75em;\n    font-weight: 600;\n    color: #fff;\n    backdrop-filter: blur(5px);\n    z-index: 2;\n}\n\n.applecation .full-episode__time:empty {\n    display: none;\n}\n\n.applecation .full-episode__body {\n    position: static !important;\n    display: flex !important;\n    flex-direction: column !important;\n    background: none !important;\n    padding: 0 0.5em !important;\n    opacity: 0.6;\n    transition: opacity 0.3s;\n}\n\n.applecation .full-episode.focus .full-episode__body {\n    opacity: 1;\n}\n\n.applecation .full-episode__num {\n    font-size: 0.75em !important;\n    font-weight: 600 !important;\n    text-transform: uppercase !important;\n    color: rgba(255,255,255,0.4) !important;\n    margin-bottom: 0.2em !important;\n    letter-spacing: 0.05em !important;\n}\n\n.applecation .full-episode__name {\n    font-size: 1.1em !important;\n    font-weight: 600 !important;\n    color: #fff !important;\n    margin-bottom: 0.4em !important;\n    white-space: nowrap !important;\n    overflow: hidden !important;\n    text-overflow: ellipsis !important;\n    line-height: 1.4 !important;\n    padding-bottom: 0.1em !important;\n}\n\n.applecation .full-episode__overview {\n    font-size: 0.85em !important;\n    line-height: 1.4 !important;\n    color: rgba(255,255,255,0.5) !important;\n    display: -webkit-box !important;\n    -webkit-line-clamp: 2 !important;\n    -webkit-box-orient: vertical !important;\n    overflow: hidden !important;\n    margin-bottom: 0.6em !important;\n    height: 2.8em !important;\n}\n\n.applecation .full-episode__date {\n    font-size: 0.8em !important;\n    color: rgba(255,255,255,0.3) !important;\n}\n\n\n/* =========================================================\n   БАЗА: ничего не блюрим/не затемняем без фокуса\n   ========================================================= */\n\n.applecation .full-episode{\n  position: relative;\n  z-index: 1;\n  opacity: 1;\n  filter: none;\n\n  transition: transform .6s cubic-bezier(.16,1,.3,1);\n}\n\n/* без фокуса — вообще без эффектов */\n.applecation .full-episode:not(.focus){\n  transform: none;\n}\n\n/* фокус — мягкий “apple” подъём */\n.applecation .full-episode.focus{\n  z-index: 10;\n  transform: scale(1.03) translateY(-6px);\n}\n\n\n/* =========================================================\n   КАРТИНКА\n   ========================================================= */\n\n.applecation .full-episode__img{\n  position: relative;\n  overflow: hidden;\n  border-radius: inherit;\n\n  transition:\n    box-shadow .6s cubic-bezier(.16,1,.3,1),\n    backdrop-filter .6s cubic-bezier(.16,1,.3,1),\n    transform .6s cubic-bezier(.16,1,.3,1);\n}\n\n\n/* =========================================================\n   ЖИДКОЕ СТЕКЛО — ТОЛЬКО НА ФОКУСЕ\n   ========================================================= */\n\n.applecation .full-episode.focus .full-episode__img{\n  box-shadow:\n    0 0 0 1px rgba(255,255,255,.18),\n    0 26px 65px rgba(0,0,0,.4) !important;\n\n  -webkit-backdrop-filter: blur(14px) saturate(1.25) contrast(1.05);\n  backdrop-filter: blur(14px) saturate(1.25) contrast(1.05);\n\n  background: rgba(255,255,255,.06);\n}\n\n/* толщина стекла */\n.applecation .full-episode.focus .full-episode__img::before{\n  content: '';\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  pointer-events: none;\n  z-index: 2;\n\n  box-shadow:\n    inset 0 0 0 1px rgba(255,255,255,.22),\n    inset 0 0 18px rgba(255,255,255,.12),\n    inset 0 -14px 22px rgba(0,0,0,.18);\n\n  filter: blur(.35px);\n  opacity: 1;\n  transition: opacity .45s ease;\n}\n\n/* блик */\n.applecation .full-episode.focus .full-episode__img::after{\n  content: '';\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  pointer-events: none;\n  z-index: 3;\n\n  background:\n    radial-gradient(120% 85% at 18% 10%,\n      rgba(255,255,255,.38),\n      rgba(255,255,255,.10) 38%,\n      transparent 62%),\n    linear-gradient(135deg,\n      rgba(255,255,255,.20),\n      rgba(255,255,255,0) 52%,\n      rgba(255,255,255,.06));\n\n  mix-blend-mode: screen;\n  opacity: .95;\n\n  transition:\n    opacity .45s ease,\n    transform .65s cubic-bezier(.16,1,.3,1);\n}\n\n/* когда фокуса нет — просто не показываем слои стекла */\n.applecation .full-episode:not(.focus) .full-episode__img::before,\n.applecation .full-episode:not(.focus) .full-episode__img::after{\n  opacity: 0;\n}\n\n/* убрать старый оверлей */\n.applecation .full-episode.focus::after{\n  display: none !important;\n}\n\n\n\n.applecation .full-episode__viewed {\n    top: 0.8em !important;\n    right: 0.8em !important;\n    background: rgba(0,0,0,0.5) !important;\n    border-radius: 50% !important;\n    padding: 0.3em !important;\n    backdrop-filter: blur(10px) !important;\n}\n\n/* Статус следующей серии */\n.applecation .full-episode--next .full-episode__img:after {\n    border-radius: 0.8em !important;\n}\n\n/* Оверлей для полного описания */\n.applecation-description-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    z-index: 9999;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    opacity: 0;\n    visibility: hidden;\n    pointer-events: none;\n    transition: opacity 0.3s ease, visibility 0.3s ease;\n}\n\n.applecation-description-overlay.show {\n    opacity: 1;\n    visibility: visible;\n    pointer-events: all;\n}\n\n.applecation-description-overlay__bg {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    -webkit-backdrop-filter: blur(100px);\n    backdrop-filter: blur(100px);\n}\n\n.applecation-description-overlay__content {\n    position: relative;\n    z-index: 1;\n    max-width: 60vw;\n    max-height: 90vh;\n    overflow-y: auto;\n}\n\n.applecation-description-overlay__logo {\n    text-align: center;\n    margin-bottom: 1.5em;\n    display: none;\n}\n\n.applecation-description-overlay__logo img {\n    max-width: 40vw;\n    max-height: 150px;\n    width: auto;\n    height: auto;\n    object-fit: contain;\n}\n\n.applecation-description-overlay__title {\n    font-size: 2em;\n    font-weight: 600;\n    margin-bottom: 1em;\n    color: #fff;\n    text-align: center;\n}\n\n.applecation-description-overlay__text {\n    font-size: 1.2em;\n    line-height: 1.6;\n    color: rgba(255, 255, 255, 0.9);\n    white-space: pre-wrap;\n    margin-bottom: 1.5em;\n}\n\n.applecation-description-overlay__details {\n    display: flex;\n    flex-wrap: wrap;\n    margin: -1em;\n}\n\n.applecation-description-overlay__details > * {\n    margin: 1em;\n}\n\n.applecation-description-overlay__info-name {\n    font-size: 1.1em;\n    margin-bottom: 0.5em;\n}\n\n.applecation-description-overlay__info-body {\n    font-size: 1.2em;\n    opacity: 0.6;\n}\n\n/* Скроллбар для описания */\n.applecation-description-overlay__content::-webkit-scrollbar {\n    width: 0.5em;\n}\n\n.applecation-description-overlay__content::-webkit-scrollbar-track {\n    background: rgba(255, 255, 255, 0.1);\n    border-radius: 1em;\n}\n\n.applecation-description-overlay__content::-webkit-scrollbar-thumb {\n    background: rgba(255, 255, 255, 0.3);\n    border-radius: 1em;\n}\n\n.applecation-description-overlay__content::-webkit-scrollbar-thumb:hover {\n    background: rgba(255, 255, 255, 0.5);\n}\n\n/* =========================================================\n   ПЕРСОНЫ (АКТЕРЫ И СЪЕМОЧНАЯ ГРУППА) - APPLE TV СТИЛЬ\n   ========================================================= */\n\n.applecation .full-person {\n    display: flex !important;\n    flex-direction: column !important;\n    align-items: center !important;\n    width: 10.7em !important;\n    background: none !important;\n    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;\n    will-change: transform;\n    -webkit-animation: none !important;\n    animation: none !important;\n    margin-left: 0;\n}\n\n.applecation .full-person.focus {\n    transform: scale(1.08) translateY(-6px) !important;\n    z-index: 10;\n}\n\n/* Фото персоны - круглое */\n.applecation .full-person__photo {\n    position: relative !important;\n    width: 9.4em !important;\n    height: 9.4em !important;\n    margin: 0 0 .3em 0 !important;\n    border-radius: 50% !important;\n    overflow: hidden !important;\n    background: rgba(255, 255, 255, 0.05) !important;\n    flex-shrink: 0 !important;\n    transition: \n        box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        backdrop-filter 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        -webkit-backdrop-filter 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        background 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;\n    will-change: transform, box-shadow, backdrop-filter;\n    -webkit-animation: none !important;\n    animation: none !important;\n}\n\n.applecation .full-person__photo img {\n    width: 100% !important;\n    height: 100% !important;\n    object-fit: cover !important;\n    border-radius: 50% !important;\n}\n\n/* Смещаем лицо только при высоком качестве (w500), так как там другой кроп у TMDB */\n.applecation.applecation--poster-high .full-person__photo img {\n    object-position: center calc(50% + 20px) !important;\n}\n\n/* Дефолтные заглушки оставляем по центру, чтобы не ломать симметрию иконок */\n.applecation .full-person__photo img[src*=\"actor.svg\"],\n.applecation .full-person__photo img[src*=\"img_broken.svg\"] {\n    object-position: center !important;\n}\n\n/* ЖИДКОЕ СТЕКЛО — БАЗОВЫЕ СЛОИ (скрыты) */\n.applecation .full-person__photo::before,\n.applecation .full-person__photo::after {\n    content: '';\n    position: absolute;\n    inset: 0;\n    border-radius: 50%;\n    pointer-events: none;\n    opacity: 0;\n    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;\n    will-change: opacity;\n}\n\n/* толщина стекла */\n.applecation .full-person__photo::before {\n    z-index: 2;\n    box-shadow:\n        inset 2px 2px 1px rgba(255, 255, 255, 0.30),\n        inset -2px -2px 2px rgba(255, 255, 255, 0.30);\n}\n\n/* ореол и блик */\n.applecation .full-person__photo::after {\n    z-index: 3;\n    background:\n        radial-gradient(circle at center,\n            transparent 58%,\n            rgba(255, 255, 255, 0.22) 75%,\n            rgba(255, 255, 255, 0.38) 90%),\n        radial-gradient(120% 85% at 18% 10%,\n            rgba(255, 255, 255, 0.35),\n            rgba(255, 255, 255, 0.10) 38%,\n            transparent 62%);\n    mix-blend-mode: screen;\n}\n\n/* ЭФФЕКТЫ ПРИ ФОКУСЕ */\n\n.applecation .full-person.focus .full-person__photo::before,\n.applecation .full-person.focus .full-person__photo::after {\n    opacity: 1;\n}\n\n.applecation .full-person.focus .full-person__photo::after {\n    opacity: 0.9;\n}\n\n/* Текстовая информация */\n.applecation .full-person__body {\n    display: flex !important;\n    flex-direction: column !important;\n    align-items: center !important;\n    text-align: center !important;\n    width: 100% !important;\n    padding: 0 0.3em !important;\n}\n\n/* Имя персоны */\n.applecation .full-person__name {\n    font-size: 1em !important;\n    font-weight: 600 !important;\n    color: #fff !important;\n    line-height: 1.3 !important;\n    width: 100% !important;\n    white-space: nowrap !important;\n    overflow: hidden !important;\n    text-overflow: ellipsis !important;\n    position: relative !important;\n}\n\n/* Бегущая строка для длинных имен */\n.applecation .full-person__name.marquee-active {\n    text-overflow: clip !important;\n    mask-image: linear-gradient(to right, #000 92%, transparent 100%);\n    -webkit-mask-image: linear-gradient(to right, #000 92%, transparent 100%);\n}\n\n/* При фокусе (когда строка едет) прозрачность с обеих сторон */\n.applecation .full-person.focus .full-person__name.marquee-active {\n    mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);\n    -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);\n}\n\n.applecation .marquee__inner {\n    display: inline-block;\n    white-space: nowrap;\n}\n\n.applecation .marquee__inner span {\n    padding-right: 2.5em;\n    display: inline-block;\n}\n\n/* Запуск анимации при фокусе */\n.applecation .full-person.focus .full-person__name.marquee-active .marquee__inner {\n    animation: marquee var(--marquee-duration, 5s) linear infinite;\n}\n\n@keyframes marquee {\n    0% { transform: translateX(0); }\n    100% { transform: translateX(-50%); }\n}\n\n/* Роль персоны */\n.applecation .full-person__role {\n    font-size: 0.8em !important;\n    font-weight: 400 !important;\n    color: rgba(255, 255, 255, 0.5) !important;\n    line-height: 1.3 !important;\n    white-space: nowrap !important;\n    overflow: hidden !important;\n    text-overflow: ellipsis !important;\n    width: 100% !important;\n    margin-top: 0;\n}\n\n.applecation .full-person.focus .full-person__role {\n    color: rgb(255, 255, 255) !important;\n}\n\n/* ОТКЛЮЧЕНИЕ ЖИДКОГО СТЕКЛА */\nbody.applecation--no-liquid-glass .applecation .full-episode.focus .full-episode__img,\nbody.applecation--no-liquid-glass .applecation .full-person.focus .full-person__photo {\n    backdrop-filter: none !important;\n    -webkit-backdrop-filter: none !important;\n    background: rgba(255,255,255,0.05) !important;\n    box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;\n}\n\nbody.applecation--no-liquid-glass .applecation .full-episode.focus .full-episode__img::before,\nbody.applecation--no-liquid-glass .applecation .full-episode.focus .full-episode__img::after,\nbody.applecation--no-liquid-glass .applecation .full-person.focus .full-person__photo::before,\nbody.applecation--no-liquid-glass .applecation .full-person.focus .full-person__photo::after {\n    display: none !important;\n}\n</style>";Lampa.Template.add("applecation_css",t),$("body").append(Lampa.Template.get("applecation_css",{},!0))}(),function(){void 0===Lampa.Storage.get("applecation_show_ratings")&&Lampa.Storage.set("applecation_show_ratings",!1);void 0===Lampa.Storage.get("applecation_ratings_source")&&Lampa.Storage.set("applecation_ratings_source","external");void 0===Lampa.Storage.get("applecation_ratings_position")&&Lampa.Storage.set("applecation_ratings_position","card");void 0===Lampa.Storage.get("applecation_mdblist_api_key")&&Lampa.Storage.set("applecation_mdblist_api_key","");void 0===Lampa.Storage.get("applecation_kp_api_key")&&Lampa.Storage.set("applecation_kp_api_key","");if(void 0===Lampa.Storage.get("applecation_enabled_ratings")){const t=!!Lampa.Storage.get("applecation_kp_api_key","");Lampa.Storage.set("applecation_enabled_ratings",t?["imdb","kp"]:["imdb"])}else{if(!!!Lampa.Storage.get("applecation_kp_api_key","")){const t=Lampa.Storage.get("applecation_enabled_ratings",["imdb"]);Array.isArray(t)&&t.includes("kp")&&Lampa.Storage.set("applecation_enabled_ratings",t.filter((t=>"kp"!==t)))}}void 0===Lampa.Storage.get("applecation_logo_scale")&&Lampa.Storage.set("applecation_logo_scale","100");void 0===Lampa.Storage.get("applecation_text_scale")&&Lampa.Storage.set("applecation_text_scale","100");void 0===Lampa.Storage.get("applecation_spacing_scale")&&Lampa.Storage.set("applecation_spacing_scale","100");void 0===Lampa.Storage.get("applecation_reverse_episodes")&&Lampa.Storage.set("applecation_reverse_episodes",!0);void 0===Lampa.Storage.get("applecation_description_overlay")&&Lampa.Storage.set("applecation_description_overlay",!0);void 0===Lampa.Storage.get("applecation_show_foreign_logo")&&Lampa.Storage.set("applecation_show_foreign_logo",!0);void 0===Lampa.Storage.get("applecation_liquid_glass")&&Lampa.Storage.set("applecation_liquid_glass",!0);void 0===Lampa.Storage.get("applecation_show_episode_count")&&Lampa.Storage.set("applecation_show_episode_count",!1);Lampa.SettingsApi.addComponent({component:"applecation_settings",name:"Applecation",icon:e}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_about",type:"static"},field:{name:"<div>Applecation v"+t+"</div>"},onRender:function(t){t.css("opacity","0.7"),t.find(".settings-param__name").css({"font-size":"1.2em","margin-bottom":"0.3em"}),t.append('<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">'+m("about_author")+": DarkestClouds<br>"+m("about_description")+"</div>")}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_ratings_title",type:"title"},field:{name:m("settings_title_ratings")}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_show_ratings",type:"trigger",default:!1},field:{name:m("show_ratings"),description:m("show_ratings_desc")},onChange:function(t){t?$("body").removeClass("applecation--hide-ratings"):$("body").addClass("applecation--hide-ratings"),Lampa.Settings.update()}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_ratings_source",type:"select",values:{external:m("ratings_source_external"),builtin:m("ratings_source_builtin")},default:"external"},field:{name:m("ratings_source"),description:m("ratings_source_desc")},onChange:function(t){Lampa.Storage.set("applecation_ratings_source",t),$("body").removeClass("applecation--ratings-source-external applecation--ratings-source-builtin"),$("body").addClass("applecation--ratings-source-"+t),Lampa.Settings.update()},onRender:function(t){Lampa.Storage.get("applecation_show_ratings",!1)?t.show():t.hide()}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_mdblist_api_key",type:"button",default:""},field:{name:m("mdblist_api_key"),description:m("mdblist_api_key_desc")},onChange:function(){const t=Lampa.Storage.get("applecation_mdblist_api_key","");Lampa.Input.edit({title:m("mdblist_api_key"),value:t,free:!0,nosave:!0},(function(e){e!==t&&(Lampa.Storage.set("applecation_mdblist_api_key",e),Lampa.Storage.set(n.cacheKey,{}),Lampa.Noty.show(m("mdblist_api_key")+" "+(e?Lampa.Lang.translate("settings_saved"):Lampa.Lang.translate("settings_cleared"))))}))},onRender:function(t){if(!Lampa.Storage.get("applecation_show_ratings",!1))return void t.hide();"external"===Lampa.Storage.get("applecation_ratings_source","external")?t.hide():t.show()}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_kp_api_key",type:"button",default:""},field:{name:m("kp_api_key"),description:m("kp_api_key_desc")},onChange:function(){const t=Lampa.Storage.get("applecation_kp_api_key","");Lampa.Input.edit({title:m("kp_api_key"),value:t,free:!0,nosave:!0},(function(e){if(e!==t&&(Lampa.Storage.set("applecation_kp_api_key",e),Lampa.Storage.set(n.cacheKey,{}),Lampa.Noty.show(m("kp_api_key")+" "+(e?Lampa.Lang.translate("settings_saved"):Lampa.Lang.translate("settings_cleared"))),!e)){const t=Lampa.Storage.get("applecation_enabled_ratings",["imdb","kp"]);Array.isArray(t)&&t.includes("kp")&&Lampa.Storage.set("applecation_enabled_ratings",t.filter((t=>"kp"!==t)))}}))},onRender:function(t){if(!Lampa.Storage.get("applecation_show_ratings",!1))return void t.hide();"external"===Lampa.Storage.get("applecation_ratings_source","external")?t.hide():t.show()}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_enabled_ratings",type:"button",default:["imdb","kp"]},field:{name:m("enabled_ratings"),description:m("enabled_ratings_desc")},onChange:function(){let t=Lampa.Storage.get("applecation_enabled_ratings",["imdb","kp"]);const e=!!Lampa.Storage.get("applecation_kp_api_key","");!e&&Array.isArray(t)&&t.includes("kp")&&(t=t.filter((t=>"kp"!==t)),Lampa.Storage.set("applecation_enabled_ratings",t));const n=[{title:m("rating_imdb"),value:"imdb",checkbox:!0,checked:t.includes("imdb")},{title:m("rating_tmdb"),value:"tmdb",checkbox:!0,checked:t.includes("tmdb")},{title:m("rating_tomatoes"),value:"tomatoes",checkbox:!0,checked:t.includes("tomatoes")},{title:m("rating_popcorn"),value:"popcorn",checkbox:!0,checked:t.includes("popcorn")},{title:m("rating_metacritic"),value:"metacritic",checkbox:!0,checked:t.includes("metacritic")},{title:m("rating_letterboxd"),value:"letterboxd",checkbox:!0,checked:t.includes("letterboxd")},{title:m("rating_trakt"),value:"trakt",checkbox:!0,checked:t.includes("trakt")},{title:m("rating_mal"),value:"myanimelist",checkbox:!0,checked:t.includes("myanimelist")}];e&&n.splice(1,0,{title:m("rating_kp"),value:"kp",checkbox:!0,checked:t.includes("kp")}),Lampa.Select.show({title:m("enabled_ratings"),items:n,onCheck:function(t){const e=!!Lampa.Storage.get("applecation_kp_api_key",""),n=Lampa.Storage.get("applecation_enabled_ratings",["imdb","kp"]).filter((t=>!!e||"kp"!==t));if(t.checked)n.includes(t.value)||n.push(t.value);else{const e=n.indexOf(t.value);e>-1&&n.splice(e,1)}Lampa.Storage.set("applecation_enabled_ratings",n)},onBack:function(){Lampa.Controller.toggle("settings_component")}})},onRender:function(t){if(!Lampa.Storage.get("applecation_show_ratings",!1))return void t.hide();"external"===Lampa.Storage.get("applecation_ratings_source","external")?t.hide():t.show()}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_ratings_position",type:"select",values:{card:m("position_card"),corner:m("position_corner")},default:"card"},field:{name:m("ratings_position"),description:m("ratings_position_desc")},onChange:function(t){Lampa.Storage.get("applecation_ratings_source","external"),Lampa.Storage.get("applecation_enabled_ratings",["imdb","kp"]);Lampa.Storage.set("applecation_ratings_position",t),$("body").removeClass("applecation--ratings-card applecation--ratings-corner"),$("body").addClass("applecation--ratings-"+t),f(),u(),Lampa.Activity.back()},onRender:function(t){if(!Lampa.Storage.get("applecation_show_ratings",!1))return void t.hide();Lampa.Storage.get("applecation_ratings_source","external"),Lampa.Storage.get("applecation_enabled_ratings",["imdb","kp"])}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_display_title",type:"title"},field:{name:m("settings_title_display")}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"card_interfice_reactions",type:"trigger",default:!0},field:{name:m("show_reactions"),description:m("show_reactions_desc")}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_show_foreign_logo",type:"trigger",default:!0},field:{name:m("show_foreign_logo"),description:m("show_foreign_logo_desc")}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_reverse_episodes",type:"trigger",default:!0},field:{name:m("reverse_episodes"),description:m("reverse_episodes_desc")},onChange:function(t){Lampa.Storage.set("applecation_reverse_episodes",t)}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_description_overlay",type:"trigger",default:!0},field:{name:m("description_overlay"),description:m("description_overlay_desc")},onChange:function(t){Lampa.Storage.set("applecation_description_overlay",t)}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_show_episode_count",type:"trigger",default:!1},field:{name:m("show_episode_count"),description:m("show_episode_count_desc")}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_liquid_glass",type:"trigger",default:!0},field:{name:m("liquid_glass"),description:m("liquid_glass_desc")},onChange:function(t){Lampa.Storage.set("applecation_liquid_glass",t),h()}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_scaling_title",type:"title"},field:{name:m("settings_title_scaling")}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_logo_scale",type:"select",values:{50:"50%",60:"60%",70:"70%",80:"80%",90:"90%",100:m("scale_default"),110:"110%",120:"120%",130:"130%",140:"140%",150:"150%",160:"160%",170:"170%",180:"180%"},default:"100"},field:{name:m("logo_scale"),description:m("logo_scale_desc")},onChange:function(t){Lampa.Storage.set("applecation_logo_scale",t),_()}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_text_scale",type:"select",values:{50:"50%",60:"60%",70:"70%",80:"80%",90:"90%",100:m("scale_default"),110:"110%",120:"120%",130:"130%",140:"140%",150:"150%",160:"160%",170:"170%",180:"180%"},default:"100"},field:{name:m("text_scale"),description:m("text_scale_desc")},onChange:function(t){Lampa.Storage.set("applecation_text_scale",t),_()}}),Lampa.SettingsApi.addParam({component:"applecation_settings",param:{name:"applecation_spacing_scale",type:"select",values:{50:"50%",60:"60%",70:"70%",80:"80%",90:"90%",100:m("scale_default"),110:"110%",120:"120%",130:"130%",140:"140%",150:"150%",160:"160%",170:"170%",180:"180%",200:"200%",250:"250%",300:"300%"},default:"100"},field:{name:m("spacing_scale"),description:m("spacing_scale_desc")},onChange:function(t){Lampa.Storage.set("applecation_spacing_scale",t),_()}}),Lampa.Storage.get("applecation_show_ratings",!1)||$("body").addClass("applecation--hide-ratings");$("body").addClass("applecation--ratings-"+Lampa.Storage.get("applecation_ratings_position","card"));const a=Lampa.Storage.get("applecation_ratings_source","external");$("body").addClass("applecation--ratings-source-"+a),_()}(),h(),Lampa.Listener.follow("full",(t=>{if(Lampa.Storage.get("applecation_description_overlay",!0)&&function(t){if("start"===t.type&&t.link){const e=t.link.rows,n=e.indexOf("description");n>-1&&e.splice(n,1)}}(t),"complite"===t.type){const n=t.object.activity,a=n.render();a.addClass("applecation"),n.__destroyed=!1;var e=n.destroy;n.destroy=function(){n.__destroyed=!0,e&&e.apply(n,arguments)};const i=Lampa.Storage.field("poster_size");a.toggleClass("applecation--poster-high","w500"===i),function(t){const e=t.render().find(".full-start__background");e.length&&!e.next(".applecation__overlay").length&&e.after('<div class="full-start__background loaded applecation__overlay"></div>')}(n),C(t);const o=t.data,l=o&&o.movie;l&&function(t,e){if(!Lampa.Storage.get("applecation_show_ratings",!1))return;const n=t.render().find(".applecation__ratings");n.length&&"builtin"===Lampa.Storage.get("applecation_ratings_source","external")&&s.fetch(e,(n=>{c(t)&&function(t,e,n){const a=t.render().find(".applecation__ratings");if(!a.length)return;const i=!!Lampa.Storage.get("applecation_kp_api_key",""),o=Lampa.Storage.get("applecation_enabled_ratings",["imdb","kp"]).filter((t=>!!i||"kp"!==t)),l=Lampa.Storage.get("applecation_ratings_source","external");if("builtin"!==l)return;let r=a.find(".applecation__ratings-builtin");r.length||(r=$('<div class="applecation__ratings-builtin hide"></div>'),a.append(r)),r.removeClass("show").addClass("hide").empty();const s="builtin-rate--",c={tomatoes:{fresh:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 138.75 141.25"><g fill="#f93208"><path d="m20.154 40.829c-28.149 27.622-13.657 61.011-5.734 71.931 35.254 41.954 92.792 25.339 111.89-5.9071 4.7608-8.2027 22.554-53.467-23.976-78.009z"/><path d="m39.613 39.265 4.7778-8.8607 28.406-5.0384 11.119 9.2082z"/></g><path d="m39.436 8.5696 8.9682-5.2826 6.7569 15.479c3.7925-6.3226 13.79-16.316 24.939-4.6684-4.7281 1.2636-7.5161 3.8553-7.7397 8.4768 15.145-4.1697 31.343 3.2127 33.539 9.0911-10.951-4.314-27.695 10.377-41.771 2.334 0.009 15.045-12.617 16.636-19.902 17.076 2.077-4.996 5.591-9.994 1.474-14.987-7.618 8.171-13.874 10.668-33.17 4.668 4.876-1.679 14.843-11.39 24.448-11.425-6.775-2.467-12.29-2.087-17.814-1.475 2.917-3.961 12.149-15.197 28.625-8.476z" fill="#02902e"/></svg>',certified:'<svg viewBox="0 0 264 264"xmlns=http://www.w3.org/2000/svg><g id=layer1><path d="m37.343 201c-64.636-75.11-21.896-199.45 92.547-200.68 109.5-1.9185 166 117.79 98.07 200.36z"id=path3406 fill=#fa6d0e /></g><g id=layer2><path d="m39.391 194.45c-5.232-6.2-9.522-12.72-13.649-20.73-6.979-13.55-11.103-27.74-12.599-43.34-0.60643-6.3238-0.44896-18.969 0.307-24.652 1.9531-14.684 5.7507-27.003 12.112-39.293 18.411-35.567 52.726-57.341 95.518-60.608 5.327-0.40672 17.081-0.40573 21.912 0.00186 26.228 2.2125 49.157 11.341 67.929 27.045 20.207 16.904 33.673 39.672 38.885 65.748 1.6378 8.1935 1.8934 11.156 1.8916 21.922-0.002 10.239-0.13698 12.089-1.4281 19.534-1.3592 7.838-3.1873 14.455-6.0824 22.015-1.9226 5.0206-5.4869 12.588-7.5942 16.124-0.76237 1.279-1.4706 2.5348-1.5739 2.7906-0.40166 0.99471-5.8217 8.831-8.4607 12.233l-2.7782 3.5809-73.628 0.008c-40.495 0.005-81.465 0.0864-91.042 0.18233l-17.414 0.1745-2.3083-2.7351z"id=path3414 fill=#ffd600 /></g><g id=layer3 fill-rule=evenodd stroke=#000 stroke-width=1px><g><path d="m60.733 41.274c-13.825 0.77302-13.491 15.928-7.5773 20.321 5.7404 4.7541 19.245 4.1115 18.714-10.677h-4.7071c0.81464 7.4274-6.1664 10.215-10.792 6.544-3.1787-2.4792-3.3966-10.664 4.4775-11.366z"id=path3419 /><path d="m65.98 34.008 13.236-8.3473 1.9042 3.1531-9.4084 5.8018 2.8029 4.2282 8.8344-5.7404 1.8566 3.1392-8.6581 5.5386 2.6069 4.2479 9.2936-5.6452 1.8427 2.9629-13.094 7.9414z"id=path3463 /><path d="m87.732 21.446 6.8212 20.517 5.2278-2.019-2.3576-6.936 2.411-0.80365 5.7125 5.6255 5.7485-1.9378-6.6391-6.0987c5.8115-6.7807-0.73197-16.414-12.805-10.333z"id=path3487 /><path d="m110.12 14.044 0.73063 4.6679 6.1697-0.89299 1.9078 17.332 4.7085-0.64945-2.0295-17.048 6.3321-1.0554-0.4465-4.5055z"id=path3513 /><path d="m136.55 12.177-1.1365 21.838 4.7897 0.32472 1.2177-21.919z"id=path3515 /><path d="m152.46 14.288-5.2768 20.782 4.3026 1.1365 2.2731-8.3616 8.8487 2.5166 0.97417-3.8967-8.6864-2.5166 1.1365-4.5461 9.4982 2.5166 1.0554-4.3026z"id=path3517 /><path d="m175.41 20.871-9.0758 19.895 4.3358 2.0608 9.1811-19.941z"id=path3519 /><path d="m189.41 27.48 12.708 9.1323-2.2071 2.949-8.9107-6.5405-2.8659 4.1857 8.6381 6.0316-2.212 2.8997-8.3849-5.944-2.9577 4.0115 8.7225 6.4929-2.0539 2.8206-12.278-9.1525z"id=path3521 /><path d="m209.61 42.295-15.749 14.45c2.101 4.1046 11.445 15.188 21.269 6.6568 7.7467-7.7002 0.46855-14.925-5.5203-21.107z"id=path3523 /></g><path d="m93.601 23.867 2.2731 5.845c2.2103-1.0484 7.5812-1.814 5.845-6.0886-1.7638-2.4625-4.5169-1.7258-8.1181 0.24354z"id=path3597 fill=#ffd600 /><path d="m209.38 48.512-9.5145 8.7794c0.96874 2.2553 5.9216 8.786 12.12 3.0671 5.1113-5.0568 0.43115-8.5523-2.6052-11.847z"id=path3600 fill=#ffd600 /></g><g id=layer4><path d="m52.811 196.72c-29.827-32.21-35.027-109.5 35.131-128.81l87.488-1.608c64.955 14.227 70.868 92.462 35.131 129.96z"id=path3605 fill=#fa3008 /></g><g id=layer5><g fill=#fff><path d="m44.545 110.85v41.675h11.251v-15.269h16.647v-9.6438h-16.647v-7.118h17.68v-9.6438z"id=path3702 /><path d="m76.806 110.96v41.101h11.251v-12.399h3.7886l7.334 12.703h13.331l-8.6418-14.968c11.722-6.4577 8.299-26.954-8.0052-26.781 0 0-19.173 0.34442-19.058 0.34442z"id=path3704 /><path d="m114.46 111.19v41.445h31.802v-10.218h-19.517v-6.4292h18.369v-9.6438h-18.369v-5.7404h19.632v-9.6438z"id=path3706 /><path d="m174.28 125.31 7.0032-7.5773c-5.6401-9.8066-31.184-12.207-32.261 5.8552-0.0651 10.857 10.676 12.689 16.647 13.547 9.1514 1.1745 4.5108 5.4184 2.1813 5.97-4.1015 0.3558-9.5196-1.8055-12.858-6.3144l-7.118 7.3476c12.082 15.461 29.732 6.958 32.376 2.8702 9.8557-16.106-10.255-23.046-16.417-22.043-4.5744 0.5052-4.1267-6.0987 2.2962-4.5923 2.1102 0.54658 3.4808 0.3029 8.1513 4.9367z"id=path3708 /><path d="m185.07 110.73v42.249h11.825v-16.417h12.055v16.303h11.94v-42.019h-12.055v15.499h-11.94v-15.499z"id=path3710 /></g><path d="m88.287 121.18v8.4957c5.4584-0.16649 10.747 0.86766 10.792-4.4775 0.05152-3.6316-3.2768-4.8952-10.792-4.0182z"id=path3712 fill=#fa3008 /></g><g id=layer6><path d="m6.9717 230.41c6.2855-7.2889 16.555-13.98 31.498-19.97l24.841 36.694c-15.721 0.33212-26.526 9.2959-32.797 16.561-2.5232-9.7958-3.895-19.592-2.1107-29.387-10.522-4.6768-14.817-3.1271-21.432-3.8967z"id=path3895 fill=#04c754 /><path d="m257.99 230.07c-6.2855-7.2889-16.555-13.98-31.498-19.97l-24.841 36.694c15.721 0.33212 26.526 9.2959 32.797 16.561 2.5232-9.7958 3.895-19.592 2.1107-29.387 10.522-4.6768 14.817-3.1271 21.432-3.8967z"id=path3961 fill=#04c754 /><path d="m30.166 214.17c3.5218-1.832 4.8782-2.4512 8.4068-3.6212l9.2431 33.319z"id=path4029 fill=#00ac40 /><path d="m234.73 213.72c-3.5218-1.832-4.8782-2.4512-8.4068-3.6212l-9.2431 33.319z"id=path4031 fill=#00ac40 /><path d="m47.588 243.74 15.556 3.0424-0.68884-7.9791z"id=path4033 fill=#009c34 /><path d="m202.92 240.06-1.2055 6.8884 15.958-3.0424z"id=path4035 fill=#009c34 /></g><g id=layer7 fill=#01912c><path d="m30.686 197.59 16.786 46.372c57.615-9.8616 114.29-9.3656 170.17-0.1802l16.642-46.273c-71.73-11.24-135.24-12.64-203.59 0.08z"id=path4037 /><path d="m95.793 191.42 2.1107-3.7343 7.5498-1.7048 7.631 5.0332z"id=path4307 /></g><g id=layer8><g id=g4262 fill=#f9f517 transform="matrix(.24170 0 0 .24170 49.363 178.57)"><path d="m105.8 102.98-8.0172-0.10423v-50.619-50.619h24.186c26.088 0 28.291 0.12542 34.659 1.9732 10.334 2.9985 18.223 9.4964 22.57 18.591 2.1141 4.4222 2.9427 7.9588 3.1597 13.486 0.49026 12.49-4.8082 23.35-14.188 29.082-2.8096 1.7169-2.9403 1.8527-2.4829 2.5796 1.2343 1.9616 20.736 35.548 20.736 35.713 0 0.1025-7.4426 0.18636-16.539 0.18636h-16.539l-9.5998-16.167c-5.2799-8.8917-9.8029-16.445-10.051-16.784-0.33627-0.45988-1.1926-0.66814-3.3574-0.81651l-2.906-0.19918 0.1815 16.983 0.1815 16.983-6.9879-0.0828c-3.8433-0.0455-10.596-0.12973-15.005-0.18705zm35.703-56.479c6.7674-1.4238 10.228-4.6666 10.607-9.9384 0.26462-3.6861-0.61122-6.2013-2.9536-8.482-3.1044-3.0227-7.4377-4.0701-16.926-4.0912l-5.0084-0.0111 0.23412 3.2983c0.12877 1.814 0.23412 7.1086 0.23412 11.766v8.4675l5.6751-0.24535c3.1213-0.13495 6.7833-0.47851 8.1378-0.76348z"id=path3554 /><path d="m218.68 104.68c-8.9254-1.007-16.797-4.9792-23.157-11.686-7.2226-7.6165-11.109-16.992-11.521-27.797-0.22097-5.7879 0.2163-9.6195 1.5977-14 5.206-16.508 19.973-26.343 40.714-27.116 3.5416-0.13202 6.6611-0.0434 8.8279 0.25076 17.801 2.4166 30.891 14.819 34.788 32.96 0.82406 3.8358 0.81686 12.628-0.0133 16.27-3.4361 15.073-14.036 25.493-29.983 29.475-6.315 1.5768-15.528 2.2888-21.255 1.6427h-0.00001zm9.7895-12.053c3.4979-1.0388 4.9377-2.9451 4.899-6.4866-0.013-1.1891-0.28397-2.8511-0.60221-3.6933-1.675-4.4332-1.6614-4.3761-1.2552-5.2676 0.21765-0.47768 0.78769-1.0471 1.2668-1.2654 1.1551-0.52631 1.8453-0.0729 3.4061 2.2376 2.2156 3.2798 6.2083 7.0112 8.7996 8.2239 2.0783 0.97253 2.6624 1.089 4.8436 0.96575 2.166-0.1224 2.733-0.31414 4.4738-1.5131 2.2856-1.5742 2.9015-2.8565 2.8796-5.996-0.0219-3.1463-1.6539-5.7434-4.8982-7.7954-1.9849-1.2554-6.2108-2.548-9.285-2.84-3.9203-0.37243-5.3039-1.0122-5.8047-2.6839-0.48683-1.6249 0.0253-2.9578 1.5779-4.1069 0.79157-0.58585 1.76-0.78306 4.6842-0.95387 2.3539-0.13749 4.0903-0.42912 4.8039-0.80682 5.1061-2.7026 5.4383-11.468 0.56294-14.856-1.364-0.9479-1.8674-1.0841-3.9636-1.0725-4.8275 0.0268-8.0918 3.1872-9.6325 9.3261-0.12439 0.49562-0.60784 1.313-1.0743 1.8163-0.9863 1.0642-2.8395 1.226-4.4579 0.38911-1.6309-0.84339-1.8399-2.6938-0.90178-7.9844 1.1672-6.5826 0.53375-9.3395-2.5629-11.154-1.9709-1.155-5.4749-1.5596-7.5568-0.87248-1.8355 0.60576-4.2268 3.0607-4.7778 4.905-1.1107 3.7172-0.22935 6.0738 3.8878 10.396 1.7296 1.8156 3.2504 3.6341 3.3796 4.0411 0.59081 1.8615-1.6535 3.9975-3.7227 3.543-1.1806-0.25929-2.3025-1.4025-4.1283-4.2067-2.9344-4.5068-7.0321-5.9454-11.069-3.8859-3.4732 1.7719-4.3725 5.7747-2.0664 9.1975 1.3375 1.9852 3.7393 3.3086 7.44 4.0994 5.3584 1.1451 6.8669 2.3079 5.4052 4.1662-0.75801 0.96366-0.83096 0.9792-3.3251 0.7083-3.7655-0.409-5.2238-0.25808-7.3156 0.75707-2.1787 1.0573-3.1289 2.2273-3.7222 4.5835-1.1898 4.725 2.1398 8.9112 7.0702 8.8892 2.5959-0.0116 4.5669-1.083 7.8614-4.2736 3.6397-3.525 4.2895-3.8967 5.4654-3.1262 1.2859 0.84253 1.4466 2.0917 0.56544 4.3943-2.0038 5.2363-0.15432 10.68 4.1498 12.214 1.8042 0.64317 2.5 0.6414 4.7-0.0119z"id=path3556 /><path d="m310.73 103.24c-13.527-0.86538-20.855-4.6291-24.882-12.779-2.7931-5.6532-3.4544-10.408-3.7959-27.295l-0.23135-11.44h-1.89c-1.0395 0-2.6423-0.10312-3.5617-0.22914l-1.6717-0.22914v-12.382-12.382h3.7834 3.7834v-10.81-10.81h14.773 14.773v10.81 10.81h6.1255 6.1255v12.792 12.792h-6.1255-6.1255l0.001 11.44c0.001 10.711 0.0462 11.514 0.70471 12.594 1.2297 2.017 2.1917 2.2695 8.6444 2.2695h5.7831v12.611 12.611l-6.0354-0.0538c-3.3195-0.0296-7.9001-0.17311-10.179-0.31891z"id=path3558 /><path d="m365.58 102.87c-15.629-1.5099-22.78-7.8138-25.148-22.169-0.41928-2.541-0.6553-7.1627-0.82014-16.06-0.12729-6.8705-0.36628-12.627-0.53108-12.791-0.1648-0.16485-1.8268-0.35591-3.6933-0.42459l-3.3937-0.12486v-12.577-12.577h4.0064 4.0064l-0.26587-10.81-0.26587-10.81h14.816 14.816v10.99 10.99h6.1255 6.1255v12.611 12.611h-6.144-6.144l0.10857 11.62c0.0984 10.534 0.16986 11.711 0.76417 12.586 1.4074 2.0734 2.088 2.2667 8.4426 2.3982l5.8553 0.12108v12.4 12.4l-7.837-0.0491c-4.3104-0.027-9.1809-0.17894-10.823-0.33763z"id=path3560 /><path d="m425.4 87.386c-12.392-1.5612-23.904-7.7739-29.557-15.952-5.3449-7.7317-8.0642-16.437-8.0697-25.834-0.008-13.574 5.9092-24.516 17.388-32.154 7.1893-4.7836 12.745-6.3503 23.579-6.6497 5.523-0.1526 6.9942-0.0741 9.9106 0.52869 5.7317 1.1847 10.724 3.5398 14.889 7.0243 3.7102 3.1035 7.8573 9.2211 9.9488 14.676 2.507 6.5385 3.9263 17.032 3.034 22.43l-0.22334 1.3512h-26.076c-14.342 0-26.076 0.137-26.076 0.30446 0 0.16745 0.62239 1.2674 1.3831 2.4444 3.3244 5.1435 8.6222 7.7076 15.898 7.6943 5.4469-0.01 10.592-1.4423 14.27-3.973l1.4804-1.0186 8.2565 7.7551c4.5411 4.2653 8.475 7.9652 8.742 8.2221 0.75121 0.7224 0.0562 1.6522-3.1554 4.2219-4.9481 3.9589-11.022 6.685-18.337 8.23-4.0389 0.85301-13.138 1.2205-17.284 0.69813zm15.261-50.147c-0.59675-3.7319-2.7937-6.5239-6.4972-8.257-4.0532-1.8967-9.342-1.7323-13.564 0.42183-2.8638 1.461-5.5299 4.8747-6.2366 7.9854l-0.2218 0.97626 2.9759 0.12145c1.6367 0.0668 7.6583 0.15445 13.381 0.19478l10.405 0.0734-0.24243-1.5161z"id=path3562 /><path d="m473.24 64.698v-38.915h14.593 14.593v5.4048c0 2.9727 0.12161 5.4037 0.27025 5.4023 0.14863-0.001 1.081-0.98805 2.0719-2.1925 3.3319-4.05 8.4992-7.6668 13.356-9.348 15.184-5.2565 31.395 6.568 33.649 24.545 0.23146 1.846 0.37789 12.826 0.37789 28.336v25.322h-14.773-14.773v-22.99-22.99l-0.9562-1.9188c-1.5738-3.1581-4.7154-4.9985-8.5924-5.0335-4.3579-0.0393-7.6091 2.6196-9.3056 7.6105-0.74626 2.1954-0.7727 2.9121-0.88464 23.973l-0.11539 21.71h-14.755-14.755v-38.915z"id=path3564 /><path d="m483.72 195.49c-8.7879-1.2296-17.227-5.0751-22.84-10.407-6.9419-6.5948-11.058-16.86-11.058-27.579 0-11.183 5.0732-21.063 14.659-28.549 1.6668-1.3015 2.971-2.4258 2.8983-2.4985s-2.839 0.0526-6.1473 0.27845c-3.3084 0.22582-6.1097 0.31609-6.2252 0.20059-0.35527-0.35527 1.9224-3.3646 3.4808-4.5988 3.1887-2.5255 7.1982-3.4206 11.016-2.4593 2.8647 0.72134 2.7601 0.0117-0.52917-3.5913l-2.9368-3.2169 1.9486-1.6648c1.0718-0.91561 2.0264-1.6648 2.1214-1.6648s1.3454 1.8672 2.7786 4.1494 2.7377 4.2309 2.8989 4.3305c0.16121 0.0996 0.88234-0.70656 1.6025-1.7915 3.1041-4.6766 7.5048-6.7814 11.726-5.6087 2.8281 0.78567 2.8284 0.94893 0.009 4.474-1.4011 1.7514-2.5474 3.2129-2.5474 3.2477s2.8972-0.005 6.4382-0.0887c12.435-0.2935 20.725 1.6085 27.681 6.351 2.3823 1.6241 5.8912 5.1844 7.6504 7.7624 1.3597 1.9926 5.0735 9.6438 5.9418 12.241 1.8727 5.6021 2.1543 15.51 0.60611 21.323-1.0931 4.1048-3.901 9.5862-6.6754 13.032-6.2675 7.7832-16.447 13.536-27.95 15.794-3.5693 0.70076-13.148 1.0101-16.548 0.53438z"id=path3566 /><path d="m578.46 196.55c-7.8346-0.99337-14.881-3.5706-21.428-7.837-7.4897-4.8811-13.128-13.98-15.556-25.105-0.78464-3.5949-1.0411-10.974-0.50816-14.619 1.8612-12.729 9.6305-22.96 22.28-29.339 2.3971-1.2089 4.4428-1.9037 7.7062-2.6174 4.0381-0.88306 5.1322-0.97166 12.01-0.97253 6.7615-0.00086 7.8928 0.087 10.63 0.82559 12.802 3.4549 21.615 13.546 24.914 28.527 0.6918 3.142 0.83442 4.8524 0.84128 10.089l0.008 6.3057-26.206 0.18017-26.206 0.18016 1.1028 1.9308c3.137 5.4924 8.7262 8.3384 16.375 8.3384 5.3866 0 11.187-1.6725 14.461-4.1698l1.1776-0.89824 8.8542 8.356 8.8542 8.356-1.3689 1.4106c-7.9413 8.1832-23.911 12.838-37.942 11.059zm15.344-49.787c-0.77215-4.8941-4.5797-8.3719-10.226-9.3401-7.3015-1.2521-14.551 3.0206-16.122 9.5022-0.23523 0.97036-0.23008 0.97313 2.0507 1.1016 1.2576 0.0709 7.2932 0.16007 13.413 0.19825l11.126 0.0694-0.24162-1.5314z"id=path3568 /><path d="m649.62 196.93c-4.1463-0.4696-9.5241-1.6761-13.109-2.941-5.0223-1.7721-12.654-5.8658-12.654-6.7875 0-0.29887 10.534-18.822 11.044-19.42 0.0714-0.0836 2.3584 0.99211 5.0822 2.3905 7.4733 3.8368 10.895 4.8595 16.123 4.8192 4.2064-0.0324 6.9057-0.75215 8.1974-2.1858 1.8014-1.9995 0.97638-4.9047-1.6271-5.7293-0.64098-0.20303-3.6787-0.35471-6.7504-0.33708-3.9043 0.0224-6.3566-0.14086-8.1489-0.54259-10.216-2.2898-18.196-8.8832-21.451-17.724-0.64718-1.7576-0.7997-2.9616-0.82112-6.4824-0.0646-2.6728 0.7448-5.0553 1.5236-7.5661 3.0818-9.9354 13.202-16.079 23.78-18.263 2.9019-0.59914 4.4449-0.69408 9.0809-0.55874 6.0131 0.17555 9.6049 0.81959 15.149 2.7164 5.6992 1.9497 13.459 5.5992 13.421 6.312-0.009 0.16319-2.2624 4.0982-5.0083 8.7444-3.8334 6.4863-5.1196 8.3911-5.5397 8.2041-2.0201-0.89918-11.14-3.7997-13.519-4.2998-1.5854-0.33323-4.5108-0.62581-6.5009-0.65016-3.8407-0.047-4.94 0.31052-6.3727 2.0726-0.98054 1.206-0.83346 3.5197 0.29091 4.5764 0.89112 0.83748 1.1626 0.87763 6.5759 0.97257 13.405 0.2351 21.781 3.1407 27.711 9.6131 3.5386 3.8618 5.3831 8.2718 5.7427 13.731 0.51074 7.752-2.2504 14.495-8.2806 20.223-4.1377 3.9304-5.7939 4.9373-11.207 6.8132-5.8898 2.0411-15.988 3.0618-22.733 2.2979z"id=path3570 /><path d="m427.56 194.43c-3.1147-0.14948-8.5034-0.88225-10.832-1.473-10.841-2.7501-16.058-8.9595-18.094-21.535-0.27815-1.718-0.47698-6.2005-0.68515-15.446l-0.29328-13.025-1.6724-0.15801c-0.91985-0.0869-2.561-0.15881-3.6471-0.15981l-1.9746-0.002v-12.612-12.612h3.9386 3.9386l-0.1221-9.1086c-0.0672-5.0098-0.17037-9.8826-0.22936-10.828l-0.10726-1.7198h14.89 14.89v10.956 10.956h6.1149 6.1149v12.739 12.739h-6.1149-6.1149l0.002 10.892c0.00076 6.8144 0.10147 11.252 0.26868 11.855 0.33257 1.1976 1.6225 2.6971 2.7115 3.1521 0.60913 0.25456 2.3193 0.34423 6.5646 0.34423h5.7409v12.612 12.612l-6.8156-0.0491c-3.7486-0.027-7.5608-0.0849-8.4717-0.12858z"id=path3572 /><path d="m327.55 196.91c-6.0677-0.89879-12.181-4.2608-18.039-9.9194-3.6145-3.4921-5.6717-6.2542-7.7002-10.339-3.0306-6.1023-4.1772-10.835-4.3864-18.104-0.20071-6.9721 0.59366-12.343 2.7511-18.599 2.2335-6.4773 4.4455-10.213 8.3658-14.126 8.4647-8.4508 18.629-11.802 28.321-9.3368 5.607 1.426 10.185 4.0966 15.083 8.7982l2.2294 2.14v-4.7499-4.7499h13.886 13.886v38.473 38.473h-13.886-13.886v-4.841c0-2.6625-0.0749-4.841-0.16647-4.841-0.0916 0-1.2206 1.0606-2.5091 2.3568-7.0642 7.107-15.892 10.559-23.95 9.366zm17.685-28.317c5.7855-2.8454 9.0992-11.159 6.9944-17.547-1.1572-3.5124-4.2606-6.4205-8.2736-7.7526-3.876-1.2867-6.6105-1.145-10.106 0.52351-4.5126 2.154-7.1913 6.6024-7.1913 11.943 0 3.8881 1.2707 7.0034 3.9492 9.6819 4.0239 4.0239 10.164 5.3469 14.627 3.1517z"id=path3574 /><path d="m260.84 189.73c-0.0924-2.9654-0.17862-11.364-0.1917-18.663-0.0131-7.2994-0.0995-15.45-0.19195-18.113-0.19113-5.5023-0.42525-6.3086-2.4118-8.3062-2.3224-2.3354-6.3268-3.1823-9.4598-2.0009-2.7463 1.0356-4.8368 3.8001-5.4692 7.2327-0.18747 1.0175-0.27855 8.5779-0.27855 23.122v21.61h-14.778c-8.1277 0-14.801-0.0287-14.829-0.0637-0.0281-0.035-0.1141-10.383-0.19109-22.995l-0.13998-22.931-0.86605-1.5971c-0.99669-1.838-2.2415-3.0544-4.1569-4.0618-1.1982-0.63025-1.6137-0.70842-3.7673-0.70889-2.0345-0.0005-2.5948 0.0925-3.5138 0.58259-2.416 1.2885-4.2402 4.0486-5.0865 7.6961-0.40668 1.7527-0.43572 3.667-0.35081 23.122l0.0926 21.211h-14.765-14.765l-0.16939-22.973c-0.0932-12.635-0.16939-30.12-0.16939-38.855v-15.882h14.643 14.643l0.0707 3.6275c0.0605 3.1064 0.13001 3.6389 0.48358 3.7068 0.24341 0.0467 1.3415-0.84094 2.6753-2.1625 2.7004-2.6758 5.0529-4.087 9.1256-5.4745 11.078-3.7741 22.042-1.1534 30.246 7.2298l2.2033 2.2515 0.69237-1.1814c3.2464-5.5396 12.361-9.5259 21.781-9.5259 7.8044 0 14.775 2.6568 19.708 7.5117 5.1179 5.0368 8.1838 12.777 8.6807 21.916 0.0762 1.4013 0.20438 13.239 0.28485 26.307l0.14632 23.759h-14.879-14.879l-0.16791-5.3916z"id=path3576 /><path d="m107.78 196.02c-6.0926-0.99832-10.52-2.705-15.396-5.9351-11.61-7.6903-18.797-22.407-18.135-37.134 0.81092-18.046 12.392-31.634 30.62-35.927 7.9813-1.8796 17.076-2.1579 24.066-0.73652 12.231 2.4873 22.77 10.864 28.179 22.395 5.2662 11.228 5.4349 24.038 0.4578 34.76-5.5967 12.056-17.13 19.866-32.956 22.316-3.758 0.5817-13.917 0.73961-16.834 0.26167zm13.14-27.525c4.4484-0.93392 8.1199-3.6944 10.055-7.5597 1.0002-1.9983 1.0286-2.1268 1.0249-4.6373-0.004-3.0016-0.47007-5.2416-1.5427-7.4205-3.6817-7.4786-12.83-10.42-20.566-6.6116-3.7913 1.8662-7.0509 6.2224-7.7619 10.373-1.1202 6.5396 3.8078 14.306 10.256 16.163 1.4002 0.40328 5.9277 0.24039 8.5354-0.3071z"id=path3578 /><path d="m28.559 158.18v-36.689h-13.376-13.376v-14.301-14.301l40.448 0.18815c22.246 0.10348 40.534 0.23971 40.639 0.30273 0.1051 0.063 0.19109 6.3565 0.19109 13.985v13.871h-12.994-12.994v36.817 36.817h-14.268-14.268v-36.689z"id=path3580 /><path d="m705.5 109.07c-0.8084-0.0513-1.6332-0.0184-2.4531 0.0918-1.6393 0.22023-3.2608 0.74918-4.6836 1.582-1.7985 1.0528-3.6019 3.0024-4.5664 4.9102-2.1226 4.1983-1.8353 9.352 0.76758 13.117 1.7571 2.542 4.5826 4.305 7.9336 5.0293 1.743 0.37669 4.1785 0.36028 5.7168-0.13281 1.965-0.62998 3.6029-1.6767 5.1113-3.252 2.559-2.6723 3.9068-5.9718 3.9121-9.6094 0.005-3.253-1.1303-5.9181-3.459-8.1133-1.5822-1.4916-3.3513-2.4394-5.9258-3.2109-0.75281-0.22561-1.5451-0.36077-2.3535-0.41211zm-0.79492 3.9121c1.2826 0.00021 1.3825 0.009 2.248 0.27344 3.2525 0.99456 5.2285 2.8755 5.9492 5.4766 1.2382 4.4679-1.9019 9.9522-6.2051 10.967-1.9266 0.45434-5.0387-0.16285-6.8809-1.4258-2.9831-2.0454-4.2013-5.8638-2.9863-9.6445 0.72861-2.267 2.2294-3.9702 4.3262-4.9297 1.2837-0.58744 1.9196-0.71707 3.5488-0.71679z"id=path4305 /><path d="m701.3 126.62-0.8542-0.0115v-5.3932-5.3933h2.577c2.7795 0 3.0143 0.0134 3.6928 0.21025 1.101 0.31948 1.9415 1.0118 2.4049 1.9808 0.22524 0.47117 0.31353 0.84798 0.33665 1.437 0.0521 1.3307-0.51231 2.4879-1.5117 3.0986-0.29937 0.18292-0.31328 0.19738-0.26455 0.27485 0.13151 0.20899 2.2093 3.7876 2.2093 3.8051 0 0.0107-0.79299 0.0199-1.7622 0.0199h-1.7622l-1.0228-1.7225c-0.56254-0.9474-1.0445-1.7521-1.0709-1.7883-0.0358-0.049-0.12706-0.0712-0.35773-0.087l-0.30963-0.0212 0.0193 1.8095 0.0193 1.8095-0.74454-0.009c-0.4095-0.005-1.1289-0.0138-1.5988-0.0199zm3.804-6.0177c0.72105-0.15169 1.0898-0.49721 1.1301-1.0589 0.0282-0.39275-0.0652-0.66074-0.3147-0.90375-0.33078-0.32205-0.79247-0.43365-1.8034-0.4359l-0.53364-0.001 0.0249 0.35143c0.0136 0.19328 0.0248 0.75742 0.0248 1.2536v0.90219l0.60466-0.0261c0.33258-0.0144 0.72275-0.0511 0.86707-0.0814z"id=path3584 /></g></g><path d="m92.534 57.233c1.823-2.196 15.246-14.146 32.836-3.215l-6.8884-14.351 7.8069-0.80365 4.133 14.58c5.6938-6.7936 18.081-12.516 26.75-0.68884-7.1807 0.6116-8.6909 4.1794-9.1846 7.3476 21.349-2.099 27.616 3.9846 31.457 8.1513-12.791-3.6696-27.648 11.782-42.019 2.4109-2.2844 14.012-13.151 14.634-22.502 14.351 2.9228-4.5918 6.742-8.9147 3.7886-15.269-11.512 8.7305-20.641 5.0873-33.753-1.3777 1.6737-1.2709 18.946-7.0772 25.946-6.6588-6.6249-3.4685-13.423-4.1733-18.369-4.4775z"id=path3607 fill=#01912c /></svg>',rotten:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 145 140"><path fill="#0fc755" d="M47.4 35.342c-13.607-7.935-12.32-25.203 2.097-31.88 26.124-6.531 29.117 13.78 22.652 30.412-6.542 24.11 18.095 23.662 19.925 10.067 3.605-18.412 19.394-26.695 31.67-16.359 12.598 12.135 7.074 36.581-17.827 34.187-16.03-1.545-19.552 19.585.839 21.183 32.228 1.915 42.49 22.167 31.04 35.865-15.993 15.15-37.691-4.439-45.512-19.505-6.8-9.307-17.321.11-13.423 6.502 12.983 19.465 2.923 31.229-10.906 30.62-13.37-.85-20.96-9.06-13.214-29.15 3.897-12.481-8.595-15.386-16.57-5.45-11.707 19.61-28.865 13.68-33.976 4.19-3.243-7.621-2.921-25.846 24.119-23.696 16.688 4.137 11.776-12.561-.63-13.633-9.245-.443-30.501-7.304-22.86-24.54 7.34-11.056 24.958-11.768 33.348 6.293 3.037 4.232 8.361 11.042 18.037 5.033 3.51-5.197 1.21-13.9-8.809-20.135z"/></svg>'},popcorn:{fresh:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 106.25 140"><path fill="#fa3106" d="M2.727 39.537c-.471-21.981 100.88-25.089 100.88-.42L92.91 117.56c-7.605 26.86-72.064 27.007-79.07.21z"/><g fill="#fff"><path d="M8.809 51.911l9.018 66.639c3.472 4.515 8.498 7.384 9.648 8.022l-6.921-68.576c-3.498-1.41-9.881-4.579-11.745-6.083zM28.629 59.776l5.453 68.898c4.926 2.652 11.04 3.391 15.73 3.566l-1.258-70.366c-3.414-.024-13.82-.642-19.925-2.098zM97.632 52.121l-9.019 66.643c-3.472 4.515-8.498 7.384-9.647 8.022l6.92-68.583c3.5-1.41 9.882-4.579 11.746-6.082zM77.812 59.986l-5.453 68.898c-4.926 2.652-11.04 3.391-15.73 3.566l1.258-70.366c3.414-.024 13.82-.642 19.925-2.098z"/></g><g fill="#ffd600"><circle cx="13.213" cy="31.252" r="6.816"/><circle cx="22.022" cy="27.687" r="6.607"/><circle cx="30.359" cy="19.769" r="5.925"/><circle cx="34.973" cy="15.155" r="6.03"/><circle cx="45.093" cy="17.095" r="4.929"/><circle cx="51.123" cy="9.597" r="6.24"/><circle cx="61.19" cy="9.387" r="6.554"/><circle cx="67.954" cy="13.635" r="4.929"/><circle cx="76.081" cy="17.672" r="5.925"/><circle cx="78.913" cy="22.706" r="4.352"/><circle cx="83.475" cy="26.324" r="5.243"/><circle cx="88.194" cy="34.398" r="5.768"/><path d="M87.355 35.447c5.79 2.799 1.352-2.213 10.696 2.097-9.574 15.338-74.774 16.892-90.291.525l-.21-3.985L38.59 16.99l22.863-6.606 15.52 9.962z"/></g></svg>',rotten:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 143.75 108.75"><path d="m96.641 2.9657c28.149 1.101 27.459 97.814 0.825 97.194l-74.45-9.973c-25.51-7.211-25.922-69.313-0.534-76.178z" fill="#07a23b"/><g fill="#fff"><path d="m85.419 8.8789-63.171 8.9751c-4.2681 3.3648-6.9679 8.2192-7.5687 9.3296l65.017-6.963c1.3226-3.3762 4.3015-9.5395 5.7202-11.342z"/><path d="m78.042 28.008-65.329 5.5498c-2.494 4.757-3.169 10.65-3.3147 15.17l66.739-1.5147c0.0074-3.2891 0.55003-13.318 1.9052-19.206z"/><path d="m85.595 94.456-63.251-8.403c-4.2975-3.326-7.0398-8.1557-7.6503-9.2607l65.082 6.3737c1.3522 3.3644 4.3852 9.4999 5.8189 11.29z"/><path d="m78.051 75.394-65.375-4.957c-2.536-4.734-3.2627-10.621-3.4481-15.14l66.749 0.9101c0.03629 3.2889 0.66694 13.312 2.0737 19.188z"/></g><path d="m100.36 10.836c-13.099 0.685-19.878 48.223-11.732 71.195l21.342-4.561c8.39-24.044 1.28-66.986-9.61-66.634z" fill="#03621e"/><g fill="#fdd600"><path d="m99.087 78.942a6.1255 6.1255 0 0 1 -6.1238 6.1255 6.1255 6.1255 0 0 1 -6.1273 -6.122 6.1255 6.1255 0 0 1 6.1202 -6.1291 6.1255 6.1255 0 0 1 6.1309 6.1184"/><path d="m112.96 75.406a5.5952 5.5952 0 0 1 -5.5936 5.5952 5.5952 5.5952 0 0 1 -5.5968 -5.592 5.5952 5.5952 0 0 1 5.5903 -5.5985 5.5952 5.5952 0 0 1 5.6001 5.5887"/><path d="m120.39 74.743a4.9323 4.9323 0 0 1 -4.9309 4.9323 4.9323 4.9323 0 0 1 -4.9337 -4.9294 4.9323 4.9323 0 0 1 4.928 -4.9352 4.9323 4.9323 0 0 1 4.9366 4.9266"/><path d="m124.1 78.942a3.7391 3.7391 0 0 1 -3.738 3.7391 3.7391 3.7391 0 0 1 -3.7402 -3.7369 3.7391 3.7391 0 0 1 3.7358 -3.7412 3.7391 3.7391 0 0 1 3.7423 3.7347"/><path d="m131.08 83.14a5.0207 5.0207 0 0 1 -5.0192 5.0207 5.0207 5.0207 0 0 1 -5.0222 -5.0178 5.0207 5.0207 0 0 1 5.0163 -5.0236 5.0207 5.0207 0 0 1 5.0251 5.0148"/><path d="m135.86 91.67a5.5952 5.5952 0 0 1 -5.5936 5.5952 5.5952 5.5952 0 0 1 -5.5968 -5.592 5.5952 5.5952 0 0 1 5.5903 -5.5985 5.5952 5.5952 0 0 1 5.6001 5.5887"/><path d="m140.36 97.327a3.9158 3.9158 0 0 1 -3.9147 3.9158 3.9158 3.9158 0 0 1 -3.917 -3.9136 3.9158 3.9158 0 0 1 3.9124 -3.9181 3.9158 3.9158 0 0 1 3.9192 3.9113"/><path d="m140.45 99.625a4.181 4.181 0 0 1 -4.1798 4.181 4.181 4.181 0 0 1 -4.1822 -4.1786 4.181 4.181 0 0 1 4.1773 -4.1834 4.181 4.181 0 0 1 4.1846 4.1761"/><path d="m134.44 100.55a4.8439 4.8439 0 0 1 -4.8425 4.8439 4.8439 4.8439 0 0 1 -4.8453 -4.8411 4.8439 4.8439 0 0 1 4.8397 -4.8467 4.8439 4.8439 0 0 1 4.8481 4.8383"/><path d="m126.84 100.24a4.0042 4.0042 0 0 1 -4.0031 4.0042 4.0042 4.0042 0 0 1 -4.0054 -4.0019 4.0042 4.0042 0 0 1 4.0007 -4.0065 4.0042 4.0042 0 0 1 4.0077 3.9996"/><path d="m125.43 97.636a5.1091 5.1091 0 0 1 -5.1076 5.1091 5.1091 5.1091 0 0 1 -5.1106 -5.1061 5.1091 5.1091 0 0 1 5.1046 -5.112 5.1091 5.1091 0 0 1 5.1135 5.1031"/><path d="m117.12 98.078a5.1091 5.1091 0 0 1 -5.1076 5.1091 5.1091 5.1091 0 0 1 -5.1106 -5.1061 5.1091 5.1091 0 0 1 5.1046 -5.112 5.1091 5.1091 0 0 1 5.1135 5.1031"/><path d="m110.49 97.459a3.6065 3.6065 0 0 1 -3.6054 3.6065 3.6065 3.6065 0 0 1 -3.6075 -3.6044 3.6065 3.6065 0 0 1 3.6033 -3.6086 3.6065 3.6065 0 0 1 3.6096 3.6023"/><path d="m105.72 96.929a4.0484 4.0484 0 0 1 -4.0472 4.0484 4.0484 4.0484 0 0 1 -4.0496 -4.0461 4.0484 4.0484 0 0 1 4.0449 -4.0508 4.0484 4.0484 0 0 1 4.052 4.0437"/><path d="m94.71 80.271c2.1568-1.7217 5.4319-2.8842 9.5881-3.6062l11.579 0.61872 15.203 13.612-2.0329 9.6343-27.047-2.5633-4.7288 1.4584-11.183-17.899z"/></g><path d="m85.913 71.627c3.2472 12.036 7.0507 22.57 12.64 28.284l-9.9879-1.591s-5.5685-25.456-4.8614-25.544c0.70711-0.08839 2.2097-1.149 2.2097-1.149z" fill="#09a339"/></svg>'}},p={imdb:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><path fill="currentColor" d="M4 7c-1.103 0-2 .897-2 2v6.4c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2H4Zm1.4 2.363h1.275v5.312H5.4V9.362Zm1.962 0H9l.438 2.512.287-2.512h1.75v5.312H10.4v-3l-.563 3h-.8l-.512-3v3H7.362V9.362Zm8.313 0H17v1.2c.16-.16.516-.363.875-.363.36.04.84.283.8.763v3.075c0 .24-.075.404-.275.524-.16.04-.28.075-.6.075-.32 0-.795-.196-.875-.237-.08-.04-.163.275-.163.275h-1.087V9.362Zm-3.513.037H13.6c.88 0 1.084.078 1.325.237.24.16.35.397.35.838v3.2c0 .32-.15.563-.35.762-.2.2-.484.288-1.325.288h-1.438V9.4Zm1.275.8v3.563c.2 0 .488.04.488-.2v-3.126c0-.28-.247-.237-.488-.237Zm3.763.675c-.12 0-.2.08-.2.2v2.688c0 .159.08.237.2.237.12 0 .2-.117.2-.238l-.037-2.687c0-.12-.043-.2-.163-.2Z"/></svg>',kp:'<svg viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M96.5 20 66.1 75.733V20H40.767v152H66.1v-55.733L96.5 172h35.467C116.767 153.422 95.2 133.578 80 115c28.711 16.889 63.789 35.044 92.5 51.933v-30.4C148.856 126.4 108.644 115.133 85 105c23.644 3.378 63.856 7.889 87.5 11.267v-30.4L85 90c27.022-11.822 60.478-22.711 87.5-34.533v-30.4C143.789 41.956 108.711 63.11 80 80l51.967-60z" style="fill:none;stroke:currentColor;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10"/></svg>',tmdb:'<svg width="800" height="800" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M25.99 29.198c2.807 0 4.708-1.896 4.708-4.708v-19.781c0-2.807-1.901-4.708-4.708-4.708h-19.979c-2.807 0-4.708 1.901-4.708 4.708v27.292l2.411-2.802v-24.49c.005-1.266 1.031-2.292 2.297-2.292h19.974c1.266 0 2.292 1.026 2.292 2.292v19.781c0 1.266-1.026 2.292-2.292 2.292h-16.755l-2.417 2.417-.016-.016zM11.714 15.286h-2.26v7.599h2.26c5.057 0 5.057-7.599 0-7.599zM11.714 21.365h-.734v-4.557h.734c2.958 0 2.958 4.557 0 4.557zM11.276 13.854h1.516v-6.083h1.891v-1.505h-5.302v1.505h1.896zM18.75 9.599l-2.625-3.333h-.49v7.714h1.542v-4.24l1.573 2.042 1.578-2.042-.010 4.24h1.542v-7.714h-.479zM21.313 19.089c.474-.333.677-.922.698-1.5.031-1.339-.807-2.307-2.156-2.307h-3.005v7.609h3.005c1.24-.010 2.245-1.021 2.245-2.26v-.036c0-.62-.307-1.172-.781-1.5zM18.37 16.802h1.354c.432 0 .698.339.698.766.031.406-.286.76-.698.76h-1.354zM19.724 21.37h-1.354v-1.516h1.37c.411 0 .745.333.745.745v.016c0 .417-.333.755-.75.755z"/></svg>',tomatoes:'<svg id="svg3390" xmlns="http://www.w3.org/2000/svg" height="141.25" viewBox="0 0 138.75 141.25" width="138.75" version="1.1"><g id="layer1" fill="#f93208"><path id="path3412" d="m20.154 40.829c-28.149 27.622-13.657 61.011-5.734 71.931 35.254 41.954 92.792 25.339 111.89-5.9071 4.7608-8.2027 22.554-53.467-23.976-78.009z"/><path id="path3471" d="m39.613 39.265 4.7778-8.8607 28.406-5.0384 11.119 9.2082z"/></g><g id="layer2"><path id="path3437" d="m39.436 8.5696 8.9682-5.2826 6.7569 15.479c3.7925-6.3226 13.79-16.316 24.939-4.6684-4.7281 1.2636-7.5161 3.8553-7.7397 8.4768 15.145-4.1697 31.343 3.2127 33.539 9.0911-10.951-4.314-27.695 10.377-41.771 2.334 0.009 15.045-12.617 16.636-19.902 17.076 2.077-4.996 5.591-9.994 1.474-14.987-7.618 8.171-13.874 10.668-33.17 4.668 4.876-1.679 14.843-11.39 24.448-11.425-6.775-2.467-12.29-2.087-17.814-1.475 2.917-3.961 12.149-15.197 28.625-8.476z" fill="#02902e"/></g></svg>',popcorn:'<svg xmlns="http://www.w3.org/2000/svg" width="106.25" height="140"><path fill="#fa3106" d="M2.727 39.537c-.471-21.981 100.88-25.089 100.88-.42L92.91 117.56c-7.605 26.86-72.064 27.007-79.07.21z"/><g fill="#fff"><path d="M8.809 51.911l9.018 66.639c3.472 4.515 8.498 7.384 9.648 8.022l-6.921-68.576c-3.498-1.41-9.881-4.579-11.745-6.083zM28.629 59.776l5.453 68.898c4.926 2.652 11.04 3.391 15.73 3.566l-1.258-70.366c-3.414-.024-13.82-.642-19.925-2.098zM97.632 52.121l-9.019 66.643c-3.472 4.515-8.498 7.384-9.647 8.022l6.92-68.583c3.5-1.41 9.882-4.579 11.746-6.082zM77.812 59.986l-5.453 68.898c-4.926 2.652-11.04 3.391-15.73 3.566l1.258-70.366c3.414-.024 13.82-.642 19.925-2.098z"/></g><g fill="#ffd600"><circle cx="13.213" cy="31.252" r="6.816"/><circle cx="22.022" cy="27.687" r="6.607"/><circle cx="30.359" cy="19.769" r="5.925"/><circle cx="34.973" cy="15.155" r="6.03"/><circle cx="45.093" cy="17.095" r="4.929"/><circle cx="51.123" cy="9.597" r="6.24"/><circle cx="61.19" cy="9.387" r="6.554"/><circle cx="67.954" cy="13.635" r="4.929"/><circle cx="76.081" cy="17.672" r="5.925"/><circle cx="78.913" cy="22.706" r="4.352"/><circle cx="83.475" cy="26.324" r="5.243"/><circle cx="88.194" cy="34.398" r="5.768"/><path d="M87.355 35.447c5.79 2.799 1.352-2.213 10.696 2.097-9.574 15.338-74.774 16.892-90.291.525l-.21-3.985L38.59 16.99l22.863-6.606 15.52 9.962z"/></g></svg>',metacritic:'<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.209 32.937L20.619 29.527L14.052 22.96C13.776 22.684 13.476 22.338 13.315 21.946C12.946 21.163 12.785 19.942 13.684 19.043C14.79 17.937 16.264 18.398 17.693 19.827L24.006 26.14L27.416 22.73L20.826 16.14C20.55 15.864 20.227 15.449 20.066 15.103C19.628 14.205 19.651 13.076 20.458 12.269C21.587 11.14 23.061 11.555 24.698 13.191L30.826 19.32L34.236 15.91L27.6 9.274C24.236 5.91 21.08 6.025 18.914 8.191C18.084 9.021 17.577 9.896 17.324 10.887C17.0952 11.8067 17.0639 12.7643 17.232 13.697L17.186 13.744C15.526 13.053 13.637 13.467 12.186 14.919C10.25 16.854 10.32 18.905 10.55 20.103L10.48 20.173L8.799 18.813L5.849 21.762C6.886 22.707 8.131 23.859 9.536 25.264L17.209 32.937Z" fill="white"/><path d="M19.982 8.12464e-06C16.0272 0.0035675 12.1621 1.17957 8.87551 3.37936C5.5889 5.57915 3.02825 8.70397 1.51726 12.3588C0.00626421 16.0136 -0.387235 20.0344 0.386501 23.9128C1.16024 27.7913 3.06647 31.3532 5.86424 34.1485C8.662 36.9437 12.2257 38.8468 16.1048 39.617C19.9839 40.3873 24.0044 39.9901 27.6578 38.4759C31.3113 36.9616 34.4338 34.3981 36.6306 31.1095C38.8275 27.8209 40 23.9549 40 20V19.976C39.9936 14.6727 37.8812 9.58908 34.1273 5.84302C30.3734 2.09697 25.2853 -0.00476866 19.982 8.12464e-06ZM19.891 4.27401C24.0449 4.27029 28.0303 5.9166 30.9705 8.85087C33.9108 11.7851 35.5652 15.7671 35.57 19.921V19.939C35.57 23.0366 34.6516 26.0647 32.931 28.6405C31.2104 31.2162 28.7647 33.2241 25.9032 34.4101C23.0417 35.5962 19.8927 35.9073 16.8544 35.3041C13.8161 34.7009 11.0249 33.2104 8.83348 31.0211C6.6421 28.8318 5.14897 26.042 4.54284 23.0043C3.93671 19.9666 4.24479 16.8173 5.42814 13.9547C6.61148 11.092 8.61697 8.64442 11.1911 6.92133C13.7652 5.19823 16.7924 4.27697 19.89 4.27401H19.891Z" fill="#FFBD3F"/></svg>',letterboxd:'<svg width="800" height="800" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" fill="currentColor" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"><path d="M1179.28 284.01c-6.02-5.845-14.23-9.447-23.28-9.447-9.04 0-17.25 3.597-23.27 9.438-6.03-5.841-14.23-9.438-23.28-9.438-18.45 0-33.43 14.983-33.43 33.437 0 18.454 14.98 33.437 33.43 33.437 9.05 0 17.25-3.597 23.28-9.438 6.02 5.841 14.23 9.438 23.27 9.438 9.05 0 17.26-3.602 23.28-9.447 6.02 5.845 14.24 9.447 23.28 9.447 18.46 0 33.44-14.983 33.44-33.437 0-18.454-14.98-33.437-33.44-33.437-9.04 0-17.26 3.602-23.28 9.447Zm-7.07 9.965c-3.94-4.539-9.74-7.412-16.21-7.412-6.46 0-12.26 2.867-16.2 7.397a33.152 33.152 0 0 1 3.09 14.04c0 5.012-1.1 9.768-3.09 14.04 3.94 4.53 9.74 7.397 16.2 7.397 6.47 0 12.27-2.873 16.21-7.412a33.228 33.228 0 0 1-3.08-14.025c0-5.007 1.1-9.758 3.08-14.025Zm-46.56-.015c-3.93-4.53-9.73-7.397-16.2-7.397-11.83 0-21.43 9.606-21.43 21.437 0 11.831 9.6 21.437 21.43 21.437 6.47 0 12.27-2.867 16.2-7.397a33.303 33.303 0 0 1-3.09-14.04c0-5.012 1.11-9.768 3.09-14.04Zm60.71 28.065c3.93 4.539 9.73 7.412 16.2 7.412 11.83 0 21.44-9.606 21.44-21.437 0-11.831-9.61-21.437-21.44-21.437-6.47 0-12.27 2.873-16.2 7.412a33.373 33.373 0 0 1 3.07 14.025c0 5.007-1.1 9.758-3.07 14.025Z" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" transform="translate(-1060 -212)"/></svg>',trakt:'<svg width="800" height="800" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M16 32c-8.817 0-16-7.183-16-16s7.183-16 16-16c8.817 0 16 7.183 16 16s-7.183 16-16 16zM16 1.615c-7.932 0-14.385 6.453-14.385 14.385s6.453 14.385 14.385 14.385c7.932 0 14.385-6.453 14.385-14.385s-6.453-14.385-14.385-14.385zM6.521 24.708c2.339 2.557 5.724 4.152 9.479 4.152 1.917 0 3.735-0.417 5.369-1.167l-8.932-8.907zM25.573 24.62c2.052-2.281 3.307-5.323 3.307-8.625 0-5.177-3.047-9.62-7.421-11.677l-8.12 8.099 12.219 12.204zM12.401 13.38l-6.765 6.74-0.907-0.907 15.421-15.416c-1.301-0.437-2.692-0.677-4.151-0.677-7.115-0.005-12.885 5.765-12.885 12.88 0 2.896 0.953 5.573 2.588 7.735l6.74-6.74 0.479 0.437 9.663 9.661c0.197-0.109 0.38-0.219 0.556-0.353l-10.703-10.672-6.468 6.473-0.907-0.905 7.38-7.381 0.479 0.443 11.281 11.251c0.177-0.136 0.339-0.292 0.5-0.421l-12.181-12.157-0.109 0.021zM16.464 14.749l-0.901-0.9 6.38-6.385 0.907 0.916-6.385 6.38zM22.521 5.979l-7.36 7.36-0.907-0.907 7.36-7.359 0.907 0.911z"/></svg>',myanimelist:'<svg width="512" height="206" viewBox="0 0 512 206" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M176.49 1.28V180.97L131.63 180.91V69.67L88.32 120.96L45.89 68.52L45.46 181.27H0V1.32001H47L86.79 55.61L129.79 1.30002L176.49 1.28ZM360.55 45.42L361.08 180.57H310.63L310.46 119.32H250.73C252.22 129.97 255.21 146.32 259.63 157.32C262.94 165.45 265.99 173.32 272.07 181.38L235.7 205.38C228.25 191.81 222.43 176.86 216.97 160.96C211.505 145.955 207.872 130.346 206.15 114.47C204.34 98.47 204.08 83.09 208.43 67.28C212.708 51.9137 221.305 38.0972 233.2 27.47C239.88 21.22 249.2 16.8 256.67 12.81C264.14 8.82003 272.52 7.18002 280.29 5.15002C288.64 3.16198 297.138 1.85764 305.7 1.25C314.19 0.52 329.32 -0.159976 356.7 0.650024L368.33 37.96H309.55C296.9 38.13 290.82 37.96 280.94 42.42C273.097 46.129 266.415 51.9066 261.611 59.131C256.808 66.3555 254.066 74.7531 253.68 83.42L310.49 84.12L311.3 45.51H360.56L360.55 45.42ZM445.72 0.670013V142.02L512 142.67L502.83 180.54H400.28V0L445.72 0.670013Z" fill="white"/></svg>'};["imdb","kp","tmdb","tomatoes","popcorn","metacritic","letterboxd","trakt","myanimelist"].forEach((t=>{if(!o.includes(t))return;if(!e[t]||null===e[t])return;const a=e[t],i=a&&"object"==typeof a?a.score??a.value:a,l=a&&"object"==typeof a?a.votes:void 0,d=parseFloat(i);if(isNaN(d))return;const g=75,m=n&&(n.name||n.original_name||n.first_air_date)?20:80,h="number"==typeof l&&!isNaN(l),_=d>=60,u="tomatoes"===t?"tomatoes"===t&&d>=g&&h&&l>=m?c.tomatoes.certified:_?c.tomatoes.fresh:c.tomatoes.rotten:"popcorn"===t?_?c.popcorn.fresh:c.popcorn.rotten:p[t];let f;f="tomatoes"===t||"popcorn"===t?Math.round(d)+"%":"metacritic"===t||"trakt"===t?Math.round(d).toString():d.toFixed(1);const v=`\n                <div class="${s}${t}">\n                    ${u}\n                    <div>${f}</div>\n                </div>\n            `;r.append(v)})),r.children().length>0&&(a.removeClass("hide"),r.removeClass("hide"))}(t,n,e)}))}(n,l),function(t){const e=t.render().find(".full-start__background:not(.applecation__overlay)")[0],n=t.render().find(".scroll__body")[0];if(!e||!n)return;let a=!1;const i=Object.getOwnPropertyDescriptor(n.style,"-webkit-transform")||Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,"webkitTransform");Object.defineProperty(n.style,"-webkit-transform",{set:function(t){if(t){const n=t.indexOf(",")+1,i=t.indexOf(",",n);if(n>0&&i>n){const o=parseFloat(t.substring(n,i))<0;o!==a&&(a=o,e.classList.toggle("dim",o))}}i&&i.set?i.set.call(this,t):this.setProperty("-webkit-transform",t)},get:function(){return i&&i.get?i.get.call(this):this.getPropertyValue("-webkit-transform")},configurable:!0})}(n),function(t){const e=t.render(),n=e.find(".full-person__name");function a(t){return t.scrollWidth>t.clientWidth+1}n.each((function(){const t=$(this);if(t.hasClass("marquee-processed")){const e=t.find("span").first().text();e&&(t.text(e),t.removeClass("marquee-processed marquee-active"),t.css("--marquee-duration",""))}})),setTimeout((()=>{c(t)&&n.each((function(){const t=$(this),e=t.text().trim();if(e)if(a(t[0])){const n=Math.min(Math.max(.25*e.length,5),20);t.addClass("marquee-processed marquee-active"),t.css("--marquee-duration",n+"s");const a=$("<span>").text(e),i=$("<span>").text(e),o=$('<div class="marquee__inner">').append(a).append(i);t.empty().append(o)}else t.addClass("marquee-processed")}))}),100)}(n),l&&p(l,n)}})),function(){try{if(window.applecation_episodes_core_patch)return;if(window.applecation_episodes_core_patch=!0,window.episodes_order_fix=!0,window.episodes_core_patch=!0,!window.Lampa||!Lampa.Utils||"function"!=typeof Lampa.Utils.createInstance)return;if(Lampa.Utils.__applecation_episodes_core_patch_applied)return;function e(t){try{if(!t)return!1;if(!t.movie)return!1;if(!Array.isArray(t.results)||!t.results.length)return!1;for(var e=0,n=0;n<t.results.length;n++){var a=t.results[n];a&&("number"==typeof a.episode_number&&e++,"number"==typeof a.season_number&&e++,a.comeing&&e++,a.air_date&&e++)}return e>=3}catch(t){return!1}}function n(t){try{for(var e=t.results||[],n=[],a=[],i=0;i<e.length;i++){var o=e[i];o&&(o.comeing?n.push(o):a.push(o))}a.sort((function(t,e){return(t.episode_number||0)-(e.episode_number||0)})),t.results=a.concat(n)}catch(t){}}function a(t){try{if(!t||!t.scroll||"function"!=typeof t.scroll.append)return;if(t.__applecation_episodes_scroll_append_patched)return;t.__applecation_episodes_scroll_append_patched=!0;var e=t.scroll.append.bind(t.scroll);t.scroll.append=function(n){var a=n instanceof jQuery?n[0]:n;if(a&&a.classList&&a.classList.contains("card-more"))return e(n);var i="function"==typeof t.scroll.body?t.scroll.body(!0):null;if(i){var o=i.querySelector(".card-more");if(o&&a&&a!==o)return void i.insertBefore(a,o)}return e(n)}}catch(t){}}function i(t){try{if(!t||"function"!=typeof t.create)return;if(t.__applecation_episodes_create_patched)return;t.__applecation_episodes_create_patched=!0;var e=t.create.bind(t);t.create=function(){a(t);var n=e();return setTimeout((function(){try{var e=t&&t.scroll&&"function"==typeof t.scroll.body?t.scroll.body(!0):null,n=e?e.querySelector(".card-more"):null;n&&n.classList.remove("card-more--first")}catch(t){}}),0),n}}catch(t){}}Lampa.Utils.__applecation_episodes_core_patch_applied=!0;var t=Lampa.Utils.createInstance;Lampa.Utils.createInstance=function(a,o,l,r){var s=e(o),c=Lampa.Storage.get("applecation_reverse_episodes",!0);s&&c&&n(o);var p=t.call(this,a,o,l,r);return s&&c&&i(p),p}}catch(o){}}()):console.log("Applecation","TV mode only")}const g={show_ratings:{ru:"Показывать рейтинги",en:"Show ratings",uk:"Показувати рейтинги",be:"Паказваць рэйтынгі",bg:"Показване на рейтинги",cs:"Zobrazit hodnocení",he:"הצג דירוגים",pt:"Mostrar classificações",zh:"显示评分"},ratings_source:{ru:"Источник рейтингов",en:"Ratings Source",uk:"Джерело рейтингів",be:"Крыніца рэйтынгаў",bg:"Източник на рейтинги",cs:"Zdroj hodnocení",he:"מקור דירוגים",pt:"Fonte de classificações",zh:"评分来源"},ratings_source_desc:{ru:"От плагинов или от рейтинговых сервисов",en:"From plugins or rating services",uk:"Від плагінів або від рейтингових сервісів",be:"Ад плагінаў або ад рэйтынгавых сэрвісаў",bg:"От плъгини или от рейтингови услуги",cs:"Z pluginů nebo z ratingových služeb",he:"מתוספים או משירותי דירוג",pt:"De plugins ou de serviços de avaliação",zh:"来自插件或评分服务"},ratings_source_builtin:{ru:"Рейтинговые сервисы",en:"Rating services",uk:"Рейтингові сервіси",be:"Рэйтынгавыя сэрвісы",bg:"Рейтингови услуги",cs:"Ratingové služby",he:"שירותי דירוג",pt:"Serviços de avaliação",zh:"评分服务"},ratings_source_external:{ru:"Плагины",en:"Plugins",uk:"Плагіни",be:"Плагіны",bg:"Плъгини",cs:"Pluginy",he:"תוספים",pt:"Plugins",zh:"插件"},mdblist_api_key:{ru:"MDBList API Key",en:"MDBList API Key",uk:"MDBList API Key",be:"MDBList API Key",bg:"MDBList API Key",cs:"MDBList API Key",he:"MDBList API Key",pt:"MDBList API Key",zh:"MDBList API 密钥"},mdblist_api_key_desc:{ru:"API ключ для получения рейтингов от MDBList (mdblist.com)",en:"API key for getting ratings from MDBList (mdblist.com)",uk:"API ключ для отримання рейтингів від MDBList (mdblist.com)",be:"API ключ для атрымання рэйтынгаў ад MDBList (mdblist.com)",bg:"API ключ за получаване на рейтинги от MDBList (mdblist.com)",cs:"API klíč pro získání hodnocení od MDBList (mdblist.com)",he:"מפתח API לקבלת דירוגים מ-MDBList (mdblist.com)",pt:"Chave API para obter classificações do MDBList (mdblist.com)",zh:"用于从 MDBList 获取评分的 API 密钥（mdblist.com）"},kp_api_key:{ru:"КиноПоиск API Key",en:"KinoPoisk API Key",uk:"КіноПошук API Key",be:"КіноПошук API Key",bg:"KinoPoisk API Key",cs:"KinoPoisk API Key",he:"KinoPoisk API Key",pt:"KinoPoisk API Key",zh:"KinoPoisk API 密钥"},kp_api_key_desc:{ru:"API ключ для получения рейтингов КиноПоиска (kinopoiskapiunofficial.tech)",en:"API key for getting KinoPoisk ratings (kinopoiskapiunofficial.tech)",uk:"API ключ для отримання рейтингів КіноПошуку (kinopoiskapiunofficial.tech)",be:"API ключ для атрымання рэйтынгаў КіноПошука (kinopoiskapiunofficial.tech)",bg:"API ключ за получаване на рейтинги от KinoPoisk (kinopoiskapiunofficial.tech)",cs:"API klíč pro získání hodnocení KinoPoisk (kinopoiskapiunofficial.tech)",he:"מפתח API לקבלת דירוגי KinoPoisk (kinopoiskapiunofficial.tech)",pt:"Chave API para obter classificações do KinoPoisk (kinopoiskapiunofficial.tech)",zh:"用于获取 KinoPoisk 评分的 API 密钥 (kinopoiskapiunofficial.tech)"},enabled_ratings:{ru:"Отображаемые рейтинги",en:"Displayed Ratings",uk:"Рейтинги що відображаються",be:"Рэйтынгі што адлюстроўваюцца",bg:"Показани рейтинги",cs:"Zobrazená hodnocení",he:"דירוגים מוצגים",pt:"Classificações exibidas",zh:"显示的评分"},enabled_ratings_desc:{ru:"Выберите какие рейтинги показывать",en:"Select which ratings to show",uk:"Виберіть які рейтинги показувати",be:"Выберыце якія рэйтынгі паказваць",bg:"Изберете кои рейтинги да се показват",cs:"Vyberte, která hodnocení zobrazit",he:"בחר אילו דירוגים להציג",pt:"Selecione quais classificações exibir",zh:"选择要显示的评分"},rating_imdb:{ru:"IMDB",en:"IMDB",uk:"IMDB",be:"IMDB",bg:"IMDB",cs:"IMDB",he:"IMDB",pt:"IMDB",zh:"IMDB"},rating_kp:{ru:"КиноПоиск",en:"KinoPoisk",uk:"КіноПошук",be:"КіноПошук",bg:"KinoPoisk",cs:"KinoPoisk",he:"KinoPoisk",pt:"KinoPoisk",zh:"KinoPoisk"},rating_tmdb:{ru:"TMDB",en:"TMDB",uk:"TMDB",be:"TMDB",bg:"TMDB",cs:"TMDB",he:"TMDB",pt:"TMDB",zh:"TMDB"},rating_tomatoes:{ru:"Rotten Tomatoes",en:"Rotten Tomatoes",uk:"Rotten Tomatoes",be:"Rotten Tomatoes",bg:"Rotten Tomatoes",cs:"Rotten Tomatoes",he:"Rotten Tomatoes",pt:"Rotten Tomatoes",zh:"Rotten Tomatoes"},rating_popcorn:{ru:"Popcorn",en:"Popcorn",uk:"Popcorn",be:"Popcorn",bg:"Popcorn",cs:"Popcorn",he:"Popcorn",pt:"Popcorn",zh:"Popcorn"},rating_metacritic:{ru:"Metacritic",en:"Metacritic",uk:"Metacritic",be:"Metacritic",bg:"Metacritic",cs:"Metacritic",he:"Metacritic",pt:"Metacritic",zh:"Metacritic"},rating_letterboxd:{ru:"Letterboxd",en:"Letterboxd",uk:"Letterboxd",be:"Letterboxd",bg:"Letterboxd",cs:"Letterboxd",he:"Letterboxd",pt:"Letterboxd",zh:"Letterboxd"},rating_trakt:{ru:"Trakt",en:"Trakt",uk:"Trakt",be:"Trakt",bg:"Trakt",cs:"Trakt",he:"Trakt",pt:"Trakt",zh:"Trakt"},rating_mal:{ru:"MyAnimeList",en:"MyAnimeList",uk:"MyAnimeList",be:"MyAnimeList",bg:"MyAnimeList",cs:"MyAnimeList",he:"MyAnimeList",pt:"MyAnimeList",zh:"MyAnimeList"},settings_title_ratings:{ru:"Рейтинги",en:"Ratings",uk:"Рейтинги",be:"Рэйтынгі",bg:"Рейтинги",cs:"Hodnocení",he:"דירוגים",pt:"Classificações",zh:"评分"},show_ratings_desc:{ru:"Отображать рейтинги в карточке",en:"Show ratings on the card",uk:"Відображати рейтинги в картці",be:"Адлюстроўваць рэйтынгі ў картцы",bg:"Показване на рейтинги в картата",cs:"Zobrazit hodnocení na kartě",he:"הצג דירוגים בכרטיס",pt:"Exibir classificações no cartão",zh:"在卡片中显示评分"},show_reactions:{ru:"Показывать реакции Lampa",en:"Show Lampa Reactions",uk:"Показувати реакції Lampa",be:"Паказваць рэакцыі Lampa",bg:"Показване на реакции Lampa",cs:"Zobrazit reakce Lampa",he:"הצג תגובות Lampa",pt:"Mostrar reações Lampa",zh:"显示 Lampa 反应"},show_reactions_desc:{ru:"Отображать блок с реакциями на карточке",en:"Display reactions block on card",uk:"Відображати блок з реакціями на картці",be:"Адлюстроўваць блок з рэакцыямі на картцы",bg:"Показване на блока с реакции на картата",cs:"Zobrazit blok s reakcemi na kartě",he:"הצג בלוק תגובות בכרטיס",pt:"Exibir bloco de reações no cartão",zh:"在卡片上显示反应块"},show_foreign_logo:{ru:"Логотип на английском",en:"No language logo",uk:"Логотип англійською",be:"Лагатып на англійскай",bg:"Лого на английски",cs:"Logo v angličtině",he:"לוגו באנגלית",pt:"Logotipo em inglês",zh:"英文徽标"},show_foreign_logo_desc:{ru:"Показывать логотип на английском языке, если нет на русском",en:"Show no language logo if localized version is missing",uk:"Показувати логотип на англійській мові, якщо немає на українській",be:"Паказваць лагатып на англійскай мове, калі няма на беларускай",bg:"Показване на лого на английски език, ако не е налично на български",cs:"Zobrazit logo v angličtině, pokud není k dispozici v češtině",he:"הצג לוגו באנגלית אם הגרסה המקומית חסרה",pt:"Mostrar logotipo em inglês se a versão localizada estiver ausente",zh:"如果本地化版本缺失，则显示英文徽标"},ratings_position:{ru:"Расположение рейтингов",en:"Ratings position",uk:"Розташування рейтингів",be:"Размяшчэнне рэйтынгаў",bg:"Позиция на рейтингите",cs:"Umístění hodnocení",he:"מיקום דירוגים",pt:"Posição das classificações",zh:"评分位置"},ratings_position_desc:{ru:"Выберите где отображать рейтинги",en:"Choose where to display ratings",uk:"Виберіть де відображати рейтинги",be:"Выберыце дзе адлюстроўваць рэйтынгі",bg:"Изберете къде да се показват рейтингите",cs:"Vyberte, kde zobrazit hodnocení",he:"בחר היכן להציג דירוגים",pt:"Escolha onde exibir classificações",zh:"选择评分显示位置"},position_card:{ru:"В карточке",en:"In card",uk:"У картці",be:"У картцы",bg:"В картата",cs:"Na kartě",he:"בכרטיס",pt:"No cartão",zh:"在卡片中"},position_corner:{ru:"В правом нижнем углу",en:"Bottom right corner",uk:"У правому нижньому куті",be:"У правым ніжнім куце",bg:"В долния десен ъгъл",cs:"V pravém dolním rohu",he:"בפינה הימנית התחתונה",pt:"Canto inferior direito",zh:"右下角"},year_short:{ru:" г.",en:"",uk:" р.",be:" г.",bg:" г.",cs:"",he:"",pt:"",zh:"年"},logo_scale:{ru:"Размер логотипа",en:"Logo Size",uk:"Розмір логотипу",be:"Памер лагатыпа",bg:"Размер на логото",cs:"Velikost loga",he:"גודל לוגו",pt:"Tamanho do logotipo",zh:"徽标大小"},logo_scale_desc:{ru:"Масштаб логотипа фильма",en:"Movie logo scale",uk:"Масштаб логотипу фільму",be:"Маштаб лагатыпа фільма",bg:"Мащаб на логото на филма",cs:"Měřítko loga filmu",he:"קנה מידה של לוגו הסרט",pt:"Escala do logotipo do filme",zh:"电影徽标比例"},text_scale:{ru:"Размер текста",en:"Text Size",uk:"Розмір тексту",be:"Памер тэксту",bg:"Размер на текста",cs:"Velikost textu",he:"גודל טקסט",pt:"Tamanho do texto",zh:"文本大小"},text_scale_desc:{ru:"Масштаб текста данных о фильме",en:"Movie data text scale",uk:"Масштаб тексту даних про фільм",be:"Маштаб тэксту даных пра фільм",bg:"Мащаб на текста с данни за филма",cs:"Měřítko textu dat filmu",he:"קנה מידה של טקסט נתוני הסרט",pt:"Escala do texto de dados do filme",zh:"电影数据文本比例"},scale_default:{ru:"По умолчанию",en:"Default",uk:"За замовчуванням",be:"Па змаўчанні",bg:"По подразбиране",cs:"Výchozí",he:"ברירת מחדל",pt:"Padrão",zh:"默认"},spacing_scale:{ru:"Отступы между строками",en:"Spacing Between Lines",uk:"Відступи між рядками",be:"Адступы паміж радкамі",bg:"Разстояние между редовете",cs:"Mezery mezi řádky",he:"מרווח בין שורות",pt:"Espaçamento entre linhas",zh:"行间距"},spacing_scale_desc:{ru:"Расстояние между элементами информации",en:"Distance between information elements",uk:"Відстань між елементами інформації",be:"Адлегласць паміж элементамі інфармацыі",bg:"Разстояние между информационни елементи",cs:"Vzdálenost mezi informačními prvky",he:"מרחק בין אלמנטי מידע",pt:"Distância entre elementos de informação",zh:"信息元素之间的距离"},settings_title_display:{ru:"Отображение",en:"Display",uk:"Відображення",be:"Адлюстраванне",bg:"Показване",cs:"Zobrazení",he:"תצוגה",pt:"Exibição",zh:"显示"},settings_title_scaling:{ru:"Масштабирование",en:"Scaling",uk:"Масштабування",be:"Маштабаванне",bg:"Мащабиране",cs:"Škálování",he:"קנה מידה",pt:"Dimensionamento",zh:"缩放"},show_episode_count:{ru:"Количество серий",en:"Episode Count",uk:"Кількість серій",be:"Колькасць серый",bg:"Брой епизоди",cs:"Počet epizod",he:"מספר פרקים",pt:"Número de episódios",zh:"剧集数量"},show_episode_count_desc:{ru:"Показывать общее количество серий для сериалов",en:"Show total episode count for TV shows",uk:"Показувати загальну кількість серій для серіалів",be:"Паказваць агульную колькасць серый для серыялаў",bg:"Показване на общия брой епизоди за сериали",cs:"Zobrazit celkový počet epizod u seriálů",he:"הצג את סך כל הפרקים עבור סדרות טלוויזיה",pt:"Mostrar o número total de episódios para séries",zh:"显示电视剧的总剧集数"},reverse_episodes:{ru:"Перевернуть список эпизодов",en:"Reverse Episodes List",uk:"Перевернути список епізодів",be:"Перавярнуць спіс эпізодаў",bg:"Обърни списъка с епизоди",cs:"Obrátit seznam epizod",he:"הפוך את רשימת הפרקים",pt:"Inverter lista de episódios",zh:"反转剧集列表"},reverse_episodes_desc:{ru:"Показывать эпизоды в обратном порядке (от новых к старым)",en:"Show episodes in reverse order (from newest to oldest)",uk:"Показувати епізоди у зворотному порядку (від нових до старих)",be:"Паказваць эпізоды ў адваротным парадку (ад новых да старых)",bg:"Показване на епизоди в обратен ред (от нови към стари)",cs:"Zobrazit epizody v opačném pořadí (od nejnovějších po nejstarší)",he:"הצג פרקים בסדר הפוך (מהחדש לישן)",pt:"Mostrar episódios em ordem inversa (do mais novo ao mais antigo)",zh:"以相反顺序显示剧集（从新到旧）"},description_overlay:{ru:"Описание в оверлее",en:"Description in Overlay",uk:"Опис в оверлеї",be:"Апісанне ў аверлеі",bg:"Описание в овърлей",cs:"Popis v překryvné vrstvě",he:"תיאור בשכבת על",pt:"Descrição em sobreposição",zh:"叠加层中的描述"},description_overlay_desc:{ru:"Показывать описание в отдельном окне при нажатии",en:"Show description in a separate window when clicked",uk:"Показувати опис в окремому вікні при натисканні",be:"Паказваць апісанне ў асобным акне пры націску",bg:"Показване на описанието в отделен прозорец при щракване",cs:"Při kliknutí zobrazit popis v samostatném okně",he:"הצג תיאור בחלון נפרד בעת לחיצה",pt:"Mostrar descrição em uma janela separada quando clicado",zh:"点击时在单独的窗口中显示描述"},liquid_glass:{ru:"Жидкое стекло",en:"Liquid Glass",uk:"Рідке скло",be:"Вадкае шкло",bg:"Течно стъкло",cs:"Tekuté sklo",he:"זכוכית נוזלית",pt:"Vidro Líquido",zh:"液体玻璃"},liquid_glass_desc:{ru:"Эффект «стеклянных» карточек при наведении в эпизодах и актерах",en:'"Glassy" card effect on focus in episodes and cast',uk:"Ефект «скляних» карток при наведенні в епізодах та акторах",be:"Эфект «шкляных» картак пры навядзенні ў эпізодах і акцёрах",bg:"Ефект „стъклени“ карти при фокус в епизодите и актьорите",cs:"Efekt „skleněných“ karet při zaměření v epizodách a obsazení",he:'אפקט כрטיסי "זכוכית" במיקוד בפרקים ובשחקנים',pt:'Efeito de cartões "vítreos" em foco nos episódios e elenco',zh:"剧集和演员表中聚焦时的“玻璃”卡片效果"},about_author:{ru:"Автор",en:"Author",uk:"Автор",be:"Аўтар",bg:"Автор",cs:"Autor",he:"מחבר",pt:"Autor",zh:"作者"},about_description:{ru:"Делает интерфейс в карточке фильма похожим на Apple TV и оптимизирует под 4K",en:"Makes the movie card interface look like Apple TV and optimizes for 4K",uk:"Робить інтерфейс у картці фільму схожим на Apple TV та оптимізує під 4K",be:"Робіць інтэрфейс у картцы фільма падобным на Apple TV і аптымізуе пад 4K",bg:"Прави интерфейса в картата на филма подобен на Apple TV и оптимизира за 4K",cs:"Vytváří rozhraní karty filmu podobné Apple TV a optimalizuje pro 4K",he:"הופך את ממשק כрטיס הסרט לדומה ל-Apple TV ומבצע אופטימיזציה ל-4K",pt:"Torna a interface do cartão do filme semelhante à Apple TV e otimiza para 4K",zh:"使电影卡片界面看起来像 Apple TV 并针对 4K 进行优化"}};function m(t){const e=Lampa.Storage.get("language","ru");return g[t]&&g[t][e]||g[t].ru}function h(){Lampa.Storage.get("applecation_liquid_glass",!0)?$("body").removeClass("applecation--no-liquid-glass"):$("body").addClass("applecation--no-liquid-glass")}function _(){const t=parseInt(Lampa.Storage.get("applecation_logo_scale","100")),e=parseInt(Lampa.Storage.get("applecation_text_scale","100")),n=parseInt(Lampa.Storage.get("applecation_spacing_scale","100"));$('style[data-id="applecation_scales"]').remove();const a=`\n            <style data-id="applecation_scales">\n                /* Масштаб логотипа */\n                \n                .applecation .applecation__logo img {\n                    max-width: ${35*t/100}vw !important;\n                    max-height: ${180*t/100}px !important;\n                }\n\n                /* Масштаб текста и мета-информации */\n                .applecation .applecation__content-wrapper {\n                    font-size: ${e}% !important;\n                }\n\n                /* Отступы между элементами */\n                .applecation .full-start-new__title {\n                    margin-bottom: ${.5*n/100}em !important;\n                }\n                \n                .applecation .applecation__meta {\n                    margin-bottom: ${.5*n/100}em !important;\n                }\n                \n                .applecation .applecation__ratings {\n                    margin-bottom: ${.5*n/100}em !important;\n                }\n                \n                .applecation .applecation__description {\n                    max-width: ${35*e/100}vw !important;\n                    margin-bottom: ${.5*n/100}em !important;\n                }\n                \n                .applecation .applecation__info {\n                    margin-bottom: ${.5*n/100}em !important;\n                }\n            </style>\n        `;$("body").append(a)}function u(){Lampa.Template.add("applecation_overlay",'\n            <div class="applecation-description-overlay">\n                <div class="applecation-description-overlay__bg"></div>\n                <div class="applecation-description-overlay__content selector">\n                    <div class="applecation-description-overlay__logo"></div>\n                    <div class="applecation-description-overlay__title">{title}</div>\n                    <div class="applecation-description-overlay__text">{text}</div>\n                    <div class="applecation-description-overlay__details">\n                        <div class="applecation-description-overlay__info">\n                            <div class="applecation-description-overlay__info-name">#{full_date_of_release}</div>\n                            <div class="applecation-description-overlay__info-body">{relise}</div>\n                        </div>\n                        <div class="applecation-description-overlay__info applecation--budget">\n                            <div class="applecation-description-overlay__info-name">#{full_budget}</div>\n                            <div class="applecation-description-overlay__info-body">{budget}</div>\n                        </div>\n                        <div class="applecation-description-overlay__info applecation--countries">\n                            <div class="applecation-description-overlay__info-name">#{full_countries}</div>\n                            <div class="applecation-description-overlay__info-body">{countries}</div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ')}function f(){const t=Lampa.Storage.get("applecation_ratings_position","card"),e='\x3c!-- Рейтинги --\x3e\n                    <div class="applecation__ratings">\n                        <div class="rate--imdb hide">\n                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">\n                                <path fill="currentColor" d="M4 7c-1.103 0-2 .897-2 2v6.4c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2H4Zm1.4 2.363h1.275v5.312H5.4V9.362Zm1.962 0H9l.438 2.512.287-2.512h1.75v5.312H10.4v-3l-.563 3h-.8l-.512-3v3H7.362V9.362Zm8.313 0H17v1.2c.16-.16.516-.363.875-.363.36.04.84.283.8.763v3.075c0 .24-.075.404-.275.524-.16.04-.28.075-.6.075-.32 0-.795-.196-.875-.237-.08-.04-.163.275-.163.275h-1.087V9.362Zm-3.513.037H13.6c.88 0 1.084.078 1.325.237.24.16.35.397.35.838v3.2c0 .32-.15.563-.35.762-.2.2-.484.288-1.325.288h-1.438V9.4Zm1.275.8v3.563c.2 0 .488.04.488-.2v-3.126c0-.28-.247-.237-.488-.237Zm3.763.675c-.12 0-.2.08-.2.2v2.688c0 .159.08.237.2.237.12 0 .2-.117.2-.238l-.037-2.687c0-.12-.043-.2-.163-.2Z"/>\n                            </svg>\n                            <div>0.0</div>\n                        </div>\n                        <div class="rate--kp hide">\n                            <svg viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" fill="none">\n                                <path d="M96.5 20 66.1 75.733V20H40.767v152H66.1v-55.733L96.5 172h35.467C116.767 153.422 95.2 133.578 80 115c28.711 16.889 63.789 35.044 92.5 51.933v-30.4C148.856 126.4 108.644 115.133 85 105c23.644 3.378 63.856 7.889 87.5 11.267v-30.4L85 90c27.022-11.822 60.478-22.711 87.5-34.533v-30.4C143.789 41.956 108.711 63.11 80 80l51.967-60z" style="fill:none;stroke:currentColor;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10"/>\n                            </svg>\n                            <div>0.0</div>\n                        </div>\n                        \x3c!-- Контейнер для встроенных рейтингов (чтобы можно было анимировать появление отдельно от общего блока) --\x3e\n                        <div class="applecation__ratings-builtin hide"></div>\n                    </div>',n=`<div class="full-start-new applecation">\n        <div class="full-start-new__body">\n            <div class="full-start-new__left hide">\n                <div class="full-start-new__poster">\n                    <img class="full-start-new__img full--poster" />\n                </div>\n            </div>\n\n            <div class="full-start-new__right">\n                <div class="applecation__left">\n                    <div class="applecation__logo"></div>\n                    \n                    <div class="applecation__content-wrapper">\n                        <div class="full-start-new__title" style="display: none;">{title}</div>\n                        \n                        <div class="applecation__meta">\n                            <div class="applecation__meta-left">\n                                <span class="applecation__network"></span>\n                                <span class="applecation__meta-text"></span>\n                                <div class="full-start__pg hide"></div>\n                            </div>\n                        </div>\n                        \n                        ${"card"===t?e:""}\n                        \n                        <div class="applecation__description-wrapper">\n                            <div class="applecation__description"></div>\n                        </div>\n                        <div class="applecation__info"></div>\n                    </div>\n                    \n                    \x3c!-- Скрытые оригинальные элементы --\x3e\n                    <div class="full-start-new__head" style="display: none;"></div>\n                    <div class="full-start-new__details" style="display: none;"></div>\n\n                    <div class="full-start-new__buttons">\n                        <div class="full-start__button selector button--play">\n                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>\n                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>\n                            </svg>\n                            <span>#{title_watch}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--book">\n                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n                            <span>#{settings_input_links}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--reaction">\n                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>\n                                <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>\n                            </svg>\n                            <span>#{title_reactions}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--subscribe hide">\n                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>\n                                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n                            <span>#{title_subscribe}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--options">\n                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>\n                            </svg>\n                        </div>\n                    </div>\n                </div>\n\n                <div class="applecation__right">\n                    <div class="full-start-new__reactions selector">\n                        <div>#{reactions_none}</div>\n                    </div>\n                    \n                    ${"corner"===t?e:""}\n\n                    \x3c!-- Скрытый элемент для совместимости (предотвращает выход реакций за экран) --\x3e\n                    <div class="full-start-new__rate-line">\n                        <div class="full-start__status hide"></div>\n                    </div>\n                    \n                    \x3c!-- Пустой маркер для предотвращения вставки элементов от modss.js --\x3e\n                    <div class="rating--modss" style="display: none;"></div>\n                </div>\n            </div>\n        </div>\n\n        <div class="hide buttons--container">\n            <div class="full-start__button view--torrent hide">\n                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">\n                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>\n                </svg>\n                <span>#{full_torrents}</span>\n            </div>\n\n            <div class="full-start__button selector view--trailer">\n                <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"></path>\n                </svg>\n                <span>#{full_trailers}</span>\n            </div>\n        </div>\n    </div>`;Lampa.Template.add("full_start_new",n);Lampa.Template.add("full_episode",'<div class="full-episode selector layer--visible">\n            <div class="full-episode__img">\n                <img />\n                <div class="full-episode__time">{time}</div>\n            </div>\n\n            <div class="full-episode__body">\n                <div class="full-episode__num">#{full_episode} {num}</div>\n                <div class="full-episode__name">{name}</div>\n                <div class="full-episode__overview">{overview}</div>\n                <div class="full-episode__date">{date}</div>\n            </div>\n        </div>')}function v(t,e){const n=t.render().find(".applecation__meta-text"),a=[];if(a.push(function(t){const e=Lampa.Storage.get("language","ru"),n=!!t.name,a={ru:n?"Сериал":"Фильм",en:n?"TV Series":"Movie",uk:n?"Серіал":"Фільм",be:n?"Серыял":"Фільм",bg:n?"Сериал":"Филм",cs:n?"Seriál":"Film",he:n?"סדרה":"סרט",pt:n?"Série":"Filme",zh:n?"电视剧":"电影"};return a[e]||a.en}(e)),e.genres&&e.genres.length){const t=e.genres.slice(0,2).map((t=>Lampa.Utils.capitalizeFirstLetter(t.name)));a.push(...t)}n.html(a.join(" · ")),function(t,e){const n=t.render().find(".applecation__network");if(e.networks&&e.networks.length){const t=e.networks[0];if(t.logo_path){const e=Lampa.Api.img(t.logo_path,"w200");return void n.html(`<img src="${e}" alt="${t.name}">`)}}if(e.production_companies&&e.production_companies.length){const t=e.production_companies[0];if(t.logo_path){const e=Lampa.Api.img(t.logo_path,"w200");return void n.html(`<img src="${e}" alt="${t.name}">`)}}n.remove()}(t,e)}function b(t,e){const n=t.render().find(".applecation__description"),a=t.render().find(".applecation__description-wrapper"),i=e.overview||"",o=Lampa.Storage.get("applecation_description_overlay",!0);n.text(i),o?(!function(t,e){const n=e.overview||"",a=e.title||e.name;if(!n)return;$(".applecation-description-overlay").remove();const i=(e.release_date||e.first_air_date||"")+"",o=i.length>3?Lampa.Utils.parseTime(i).full:i.length>0?i:Lampa.Lang.translate("player_unknown"),l="$ "+Lampa.Utils.numberWithSpaces(e.budget||0),r=(p=e,p.production_countries?p.production_countries.map((t=>{const e="country_"+t.iso_3166_1.toLowerCase(),n=Lampa.Lang.translate(e);return n!==e?n:t.name})):[]),s=r.join(", "),c=$(Lampa.Template.get("applecation_overlay",{title:a,text:n,relise:o,budget:l,countries:s}));var p;e.budget&&0!==e.budget||c.find(".applecation--budget").remove();s||c.find(".applecation--countries").remove();$("body").append(c),c.data("controller-created",!1)}(0,e),a.off("hover:enter").on("hover:enter",(function(){!function(){const t=$(".applecation-description-overlay");if(!t.length)return;if(setTimeout((()=>t.addClass("show")),10),!t.data("controller-created")){const e={toggle:function(){Lampa.Controller.collectionSet(t),Lampa.Controller.collectionFocus(t.find(".applecation-description-overlay__content"),t)},back:function(){!function(){const t=$(".applecation-description-overlay");if(!t.length)return;t.removeClass("show"),setTimeout((()=>{Lampa.Controller.toggle("content")}),300)}()}};Lampa.Controller.add("applecation_description",e),t.data("controller-created",!0)}Lampa.Controller.toggle("applecation_description")}()}))):(a.off("hover:enter"),$(".applecation-description-overlay").remove())}function y(t,e){const n=t.render().find(".applecation__info"),a=[],i=e.release_date||e.first_air_date||"";if(i){const t=i.split("-")[0];a.push(t)}if(e.name){if(e.episode_run_time&&e.episode_run_time.length){const t=e.episode_run_time[0],n=Lampa.Lang.translate("time_m").replace(".","");a.push(`${t} ${n}`)}const t=Lampa.Utils.countSeasons(e);if(t&&a.push(function(t){const e=Lampa.Storage.get("language","ru");if(["ru","uk","be","bg"].includes(e)){const n=[2,0,1,1,1,2],a={ru:["сезон","сезона","сезонов"],uk:["сезон","сезони","сезонів"],be:["сезон","сезоны","сезонаў"],bg:["сезон","сезона","сезона"]};return`${t} ${(a[e]||a.ru)[t%100>4&&t%100<20?2:n[Math.min(t%10,5)]]}`}if("en"===e)return 1===t?`${t} Season`:`${t} Seasons`;if("cs"===e)return 1===t||t>=2&&t<=4?`${t} série`:`${t} sérií`;if("pt"===e)return 1===t?`${t} Temporada`:`${t} Temporadas`;if("he"===e)return 1===t?`עונה ${t}`:`${t} עונות`;if("zh"===e)return`${t} 季`;const n=Lampa.Lang.translate("full_season");return 1===t?`${t} ${n}`:`${t} ${n}s`}(t)),Lampa.Storage.get("applecation_show_episode_count",!1)){const t=e.number_of_episodes;t&&a.push(function(t){const e=Lampa.Storage.get("language","ru");if(["ru","uk","be","bg"].includes(e)){const n=[2,0,1,1,1,2],a={ru:["серия","серии","серий"],uk:["серія","серії","серій"],be:["серыя","серыі","серый"],bg:["епизод","епизода","епизода"]};return`${t} ${(a[e]||a.ru)[t%100>4&&t%100<20?2:n[Math.min(t%10,5)]]}`}if("en"===e)return 1===t?`${t} Episode`:`${t} Episodes`;if("cs"===e)return 1===t?`${t} epizoda`:t>=2&&t<=4?`${t} epizody`:`${t} epizod`;if("pt"===e)return 1===t?`${t} Episódio`:`${t} Episódios`;if("he"===e)return 1===t?`פרק ${t}`:`${t} פרקים`;if("zh"===e)return`${t} 集`;const n=Lampa.Lang.translate("full_episode");return 1===t?`${t} ${n}`:`${t} ${n}s`}(t))}}else if(e.runtime&&e.runtime>0){const t=Math.floor(e.runtime/60),n=e.runtime%60,i=Lampa.Lang.translate("time_h").replace(".",""),o=Lampa.Lang.translate("time_m").replace(".",""),l=t>0?`${t} ${i} ${n} ${o}`:`${n} ${o}`;a.push(l)}const o=a.length>0?a.join(" · "):"";n.html(o+'<span class="applecation__quality-badges"></span>')}function C(t){const e=activity.render().find(".applecation__quality-badges");if(!e.length)return;const n=[];if(qualityInfo.quality){let t="";"4K"===qualityInfo.quality?t='<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM113 20.9092L74.1367 82.1367V97.6367H118.818V114H137.637V97.6367H149.182V81.8633H137.637V20.9092H113ZM162.841 20.9092V114H182.522V87.5459L192.204 75.7275L217.704 114H241.25L206.296 62.5908L240.841 20.9092H217.25L183.75 61.9541H182.522V20.9092H162.841ZM119.182 81.8633H93.9541V81.1367L118.454 42.3633H119.182V81.8633Z" fill="white"/></svg>':"2K"===qualityInfo.quality?t='<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM110.608 19.6367C104.124 19.6367 98.3955 20.8638 93.4258 23.3184C88.4563 25.7729 84.5925 29.2428 81.835 33.7275C79.0775 38.2123 77.6992 43.5001 77.6992 49.5908H96.3809C96.3809 46.6212 96.9569 44.0607 98.1084 41.9092C99.2599 39.7578 100.896 38.1056 103.017 36.9541C105.138 35.8026 107.623 35.2275 110.472 35.2275C113.199 35.2276 115.639 35.7724 117.79 36.8633C119.941 37.9238 121.638 39.4542 122.881 41.4541C124.123 43.4238 124.744 45.7727 124.744 48.5C124.744 50.9545 124.244 53.2421 123.244 55.3633C122.244 57.4542 120.774 59.5906 118.835 61.7725C116.926 63.9543 114.562 66.4094 111.744 69.1367L78.6084 99.8184V114H144.972V97.9092H105.881V97.2725L119.472 83.9541C125.865 78.1361 130.82 73.1514 134.335 69C137.85 64.8182 140.29 61.0151 141.653 57.5908C143.047 54.1666 143.744 50.6968 143.744 47.1816C143.744 41.8182 142.366 37.0606 139.608 32.9092C136.851 28.7577 132.986 25.515 128.017 23.1816C123.077 20.8182 117.275 19.6368 110.608 19.6367ZM159.778 20.9092V114H179.46V87.5459L189.142 75.7275L214.642 114H238.188L203.233 62.5908L237.778 20.9092H214.188L180.688 61.9541H179.46V20.9092H159.778Z" fill="white"/></svg>':"FULL HD"===qualityInfo.quality?t='<svg viewBox="331 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M622 0C633.046 3.57563e-06 642 8.95431 642 20V114C642 125.046 633.046 134 622 134H351C339.954 134 331 125.046 331 114V20C331 8.95431 339.954 0 351 0H622ZM362.341 20.9092V114H382.022V75.5459H419.887V59.3184H382.022V37.1367H423.978V20.9092H362.341ZM437.216 20.9092V114H456.897V75.5459H496.853V114H516.488V20.9092H496.853V59.3184H456.897V20.9092H437.216ZM532.716 20.9092V114H565.716C575.17 114 583.291 112.136 590.079 108.409C596.897 104.682 602.125 99.333 605.762 92.3633C609.428 85.3937 611.262 77.0601 611.262 67.3633C611.262 57.6968 609.428 49.3934 605.762 42.4541C602.125 35.5149 596.928 30.1969 590.171 26.5C583.413 22.7727 575.352 20.9092 565.988 20.9092H532.716ZM564.943 37.7725C570.761 37.7725 575.655 38.8027 579.625 40.8633C583.595 42.9239 586.579 46.1364 588.579 50.5C590.609 54.8636 591.625 60.4847 591.625 67.3633C591.625 74.3026 590.609 79.9694 588.579 84.3633C586.579 88.7269 583.579 91.955 579.579 94.0459C575.609 96.1063 570.715 97.1367 564.897 97.1367H552.397V37.7725H564.943Z" fill="white"/></svg>':"HD"===qualityInfo.quality&&(t='<svg viewBox="662 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M953 0C964.046 3.57563e-06 973 8.95431 973 20V114C973 125.046 964.046 134 953 134H682C670.954 134 662 125.046 662 114V20C662 8.95431 670.954 0 682 0H953ZM731.278 20.9092V114H750.96V75.5459H790.915V114H810.551V20.9092H790.915V59.3184H750.96V20.9092H731.278ZM826.778 20.9092V114H859.778C869.233 114 877.354 112.136 884.142 108.409C890.96 104.682 896.188 99.333 899.824 92.3633C903.491 85.3937 905.324 77.0601 905.324 67.3633C905.324 57.6968 903.491 49.3934 899.824 42.4541C896.188 35.5149 890.991 30.1969 884.233 26.5C877.476 22.7727 869.414 20.9092 860.051 20.9092H826.778ZM859.006 37.7725C864.824 37.7725 869.718 38.8027 873.688 40.8633C877.657 42.9239 880.642 46.1364 882.642 50.5C884.672 54.8636 885.687 60.4847 885.688 67.3633C885.688 74.3026 884.672 79.9694 882.642 84.3633C880.642 88.7269 877.642 91.955 873.642 94.0459C869.672 96.1063 864.778 97.1367 858.96 97.1367H846.46V37.7725H859.006Z" fill="white"/></svg>'),t&&n.push(`<div class="quality-badge quality-badge--res">${t}</div>`)}if(qualityInfo.dv&&n.push('<div class="quality-badge quality-badge--dv"><svg viewBox="0 0 1051 393" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,393) scale(0.1,-0.1)" fill="currentColor"><path d="M50 2905 l0 -1017 223 5 c146 4 244 11 287 21 361 85 638 334 753 677 39 116 50 211 44 366 -7 200 -52 340 -163 511 -130 199 -329 344 -574 419 -79 24 -102 26 -327 31 l-243 4 0 -1017z"/><path d="M2436 3904 c-443 -95 -762 -453 -806 -905 -30 -308 86 -611 320 -832 104 -99 212 -165 345 -213 133 -47 253 -64 468 -64 l177 0 0 1015 0 1015 -217 -1 c-152 0 -239 -5 -287 -15z"/><path d="M3552 2908 l3 -1013 425 0 c309 0 443 4 490 13 213 43 407 148 550 299 119 124 194 255 247 428 25 84 27 103 27 270 1 158 -2 189 -22 259 -72 251 -221 458 -424 590 -97 63 -170 97 -288 134 l-85 26 -463 4 -462 3 2 -1013z m825 701 c165 -22 283 -81 404 -199 227 -223 279 -550 133 -831 -70 -133 -176 -234 -319 -304 -132 -65 -197 -75 -490 -75 l-245 0 0 703 c0 387 3 707 7 710 11 11 425 8 510 -4z"/><path d="M7070 2905 l0 -1015 155 0 155 0 0 1015 0 1015 -155 0 -155 0 0 -1015z"/><path d="M7640 2905 l0 -1015 150 0 150 0 0 60 c0 33 2 60 5 60 2 0 33 -15 67 -34 202 -110 433 -113 648 -9 79 38 108 59 180 132 72 71 95 102 134 181 102 207 102 414 1 625 -120 251 -394 411 -670 391 -115 -8 -225 -42 -307 -93 -21 -13 -42 -23 -48 -23 -7 0 -10 125 -10 370 l0 370 -150 0 -150 0 0 -1015z m832 95 c219 -67 348 -310 280 -527 -62 -198 -268 -328 -466 -295 -96 15 -168 52 -235 119 -131 132 -164 311 -87 478 27 60 101 145 158 181 100 63 234 80 350 44z"/><path d="M6035 3286 c-253 -49 -460 -232 -542 -481 -23 -70 -26 -96 -26 -210 0 -114 3 -140 26 -210 37 -113 90 -198 177 -286 84 -85 170 -138 288 -177 67 -22 94 -26 207 -26 113 0 140 4 207 26 119 39 204 92 288 177 87 89 140 174 177 286 22 67 26 99 27 200 1 137 -14 207 -69 320 -134 277 -457 440 -760 381z m252 -284 c117 -37 206 -114 260 -229 121 -253 -38 -548 -321 -595 -258 -43 -503 183 -483 447 20 271 287 457 544 377z"/><path d="M9059 3258 c10 -24 138 -312 285 -642 l266 -598 -72 -162 c-39 -88 -78 -171 -86 -183 -37 -58 -132 -80 -208 -48 l-35 14 -18 -42 c-10 -23 -37 -84 -60 -135 -23 -52 -39 -97 -36 -102 3 -4 40 -23 83 -41 70 -31 86 -34 177 -34 93 0 105 2 167 33 76 37 149 104 180 166 29 57 799 1777 805 1799 5 16 -6 17 -161 15 l-167 -3 -185 -415 c-102 -228 -192 -431 -200 -450 l-15 -35 -201 453 -201 452 -168 0 -168 0 18 -42z"/><path d="M2650 968 c0 -2 81 -211 179 -463 l179 -460 59 -3 59 -3 178 453 c98 249 180 459 183 466 4 9 -13 12 -65 12 -47 0 -71 -4 -74 -12 -3 -7 -65 -176 -138 -375 -73 -200 -136 -363 -139 -363 -3 0 -67 168 -142 373 l-136 372 -72 3 c-39 2 -71 1 -71 0z"/><path d="M3805 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 466 0 465 -60 0 c-39 0 -62 -4 -65 -12z"/><path d="M4580 960 c-97 -16 -178 -72 -211 -145 -23 -50 -24 -143 -3 -193 32 -77 91 -117 244 -167 99 -32 146 -64 166 -112 28 -65 -11 -149 -83 -179 -78 -33 -212 -1 -261 61 l-19 24 -48 -43 -48 -42 43 -37 c121 -103 347 -112 462 -17 54 44 88 120 88 194 -1 130 -79 213 -242 256 -24 7 -71 25 -104 41 -48 22 -66 37 -79 65 -32 67 -5 138 65 174 73 37 193 18 244 -39 l20 -22 43 43 c41 40 42 43 25 61 -27 30 -102 64 -167 76 -64 12 -70 12 -135 1z"/><path d="M5320 505 l0 -465 65 0 65 0 0 465 0 465 -65 0 -65 0 0 -465z"/><path d="M6210 960 c-147 -25 -264 -114 -328 -249 -32 -65 -36 -84 -40 -175 -7 -161 33 -271 135 -367 140 -132 360 -164 541 -77 227 108 316 395 198 634 -88 177 -290 271 -506 234z m232 -132 c100 -46 165 -136 188 -261 20 -106 -18 -237 -88 -310 -101 -105 -245 -132 -377 -73 -74 33 -120 79 -157 154 -31 62 -33 74 -33 167 0 87 4 107 26 155 64 137 173 204 320 196 43 -2 85 -12 121 -28z"/><path d="M7135 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 376 c0 207 3 374 8 371 4 -2 115 -171 247 -375 l240 -371 78 0 77 0 0 465 0 465 -60 0 -60 0 -2 -372 -3 -372 -241 370 -241 369 -82 3 c-59 2 -83 -1 -86 -10z"/></g></svg></div>'),qualityInfo.hdr&&qualityInfo.hdr_type&&n.push('<div class="quality-badge quality-badge--hdr"><svg viewBox="-1 178 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="181.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M27.2784 293V199.909H46.9602V238.318H86.9148V199.909H106.551V293H86.9148V254.545H46.9602V293H27.2784ZM155.778 293H122.778V199.909H156.051C165.415 199.909 173.475 201.773 180.233 205.5C186.991 209.197 192.188 214.515 195.824 221.455C199.491 228.394 201.324 236.697 201.324 246.364C201.324 256.061 199.491 264.394 195.824 271.364C192.188 278.333 186.96 283.682 180.142 287.409C173.354 291.136 165.233 293 155.778 293ZM142.46 276.136H154.96C160.778 276.136 165.672 275.106 169.642 273.045C173.642 270.955 176.642 267.727 178.642 263.364C180.672 258.97 181.688 253.303 181.688 246.364C181.688 239.485 180.672 233.864 178.642 229.5C176.642 225.136 173.657 221.924 169.688 219.864C165.718 217.803 160.824 216.773 155.006 216.773H142.46V276.136ZM215.903 293V199.909H252.631C259.661 199.909 265.661 201.167 270.631 203.682C275.631 206.167 279.434 209.697 282.04 214.273C284.676 218.818 285.994 224.167 285.994 230.318C285.994 236.5 284.661 241.818 281.994 246.273C279.328 250.697 275.464 254.091 270.403 256.455C265.373 258.818 259.282 260 252.131 260H227.54V244.182H248.949C252.706 244.182 255.828 243.667 258.312 242.636C260.797 241.606 262.646 240.061 263.858 238C265.1 235.939 265.722 233.379 265.722 230.318C265.722 227.227 265.1 224.621 263.858 222.5C262.646 220.379 260.782 218.773 258.267 217.682C255.782 216.561 252.646 216 248.858 216H235.585V293H215.903ZM266.176 250.636L289.312 293H267.585L244.949 250.636H266.176Z" fill="currentColor"/></svg></div>'),qualityInfo.sound){let t="";"7.1"===qualityInfo.sound?t='<svg viewBox="-1 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M91.6023 483L130.193 406.636V406H85.2386V389.909H150.557V406.227L111.92 483H91.6023ZM159.545 484.182C156.545 484.182 153.97 483.121 151.818 481C149.697 478.848 148.636 476.273 148.636 473.273C148.636 470.303 149.697 467.758 151.818 465.636C153.97 463.515 156.545 462.455 159.545 462.455C162.455 462.455 165 463.515 167.182 465.636C169.364 467.758 170.455 470.303 170.455 473.273C170.455 475.273 169.939 477.106 168.909 478.773C167.909 480.409 166.591 481.727 164.955 482.727C163.318 483.697 161.515 484.182 159.545 484.182ZM215.045 389.909V483H195.364V408.591H194.818L173.5 421.955V404.5L196.545 389.909H215.045Z" fill="currentColor"/></svg>':"5.1"===qualityInfo.sound?t='<svg viewBox="330 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="333.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M443.733 484.273C437.309 484.273 431.581 483.091 426.551 480.727C421.551 478.364 417.581 475.106 414.642 470.955C411.703 466.803 410.172 462.045 410.051 456.682H429.142C429.354 460.288 430.869 463.212 433.688 465.455C436.506 467.697 439.854 468.818 443.733 468.818C446.824 468.818 449.551 468.136 451.915 466.773C454.309 465.379 456.172 463.455 457.506 461C458.869 458.515 459.551 455.667 459.551 452.455C459.551 449.182 458.854 446.303 457.46 443.818C456.097 441.333 454.203 439.394 451.778 438C449.354 436.606 446.581 435.894 443.46 435.864C440.733 435.864 438.081 436.424 435.506 437.545C432.96 438.667 430.975 440.197 429.551 442.136L412.051 439L416.46 389.909H473.369V406H432.688L430.278 429.318H430.824C432.46 427.015 434.93 425.106 438.233 423.591C441.536 422.076 445.233 421.318 449.324 421.318C454.93 421.318 459.93 422.636 464.324 425.273C468.718 427.909 472.188 431.53 474.733 436.136C477.278 440.712 478.536 445.985 478.506 451.955C478.536 458.227 477.081 463.803 474.142 468.682C471.233 473.53 467.157 477.348 461.915 480.136C456.703 482.894 450.642 484.273 443.733 484.273ZM500.733 484.182C497.733 484.182 495.157 483.121 493.006 481C490.884 478.848 489.824 476.273 489.824 473.273C489.824 470.303 490.884 467.758 493.006 465.636C495.157 463.515 497.733 462.455 500.733 462.455C503.642 462.455 506.188 463.515 508.369 465.636C510.551 467.758 511.642 470.303 511.642 473.273C511.642 475.273 511.127 477.106 510.097 478.773C509.097 480.409 507.778 481.727 506.142 482.727C504.506 483.697 502.703 484.182 500.733 484.182ZM556.233 389.909V483H536.551V408.591H536.006L514.688 421.955V404.5L537.733 389.909H556.233Z" fill="currentColor"/></svg>':"2.0"===qualityInfo.sound&&(t='<svg viewBox="661 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="664.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M722.983 483V468.818L756.119 438.136C758.938 435.409 761.301 432.955 763.21 430.773C765.15 428.591 766.619 426.455 767.619 424.364C768.619 422.242 769.119 419.955 769.119 417.5C769.119 414.773 768.498 412.424 767.256 410.455C766.013 408.455 764.316 406.924 762.165 405.864C760.013 404.773 757.574 404.227 754.847 404.227C751.998 404.227 749.513 404.803 747.392 405.955C745.271 407.106 743.634 408.758 742.483 410.909C741.331 413.061 740.756 415.621 740.756 418.591H722.074C722.074 412.5 723.453 407.212 726.21 402.727C728.968 398.242 732.831 394.773 737.801 392.318C742.771 389.864 748.498 388.636 754.983 388.636C761.65 388.636 767.453 389.818 772.392 392.182C777.362 394.515 781.225 397.758 783.983 401.909C786.741 406.061 788.119 410.818 788.119 416.182C788.119 419.697 787.422 423.167 786.028 426.591C784.665 430.015 782.225 433.818 778.71 438C775.195 442.152 770.241 447.136 763.847 452.955L750.256 466.273V466.909H789.347V483H722.983ZM815.108 484.182C812.108 484.182 809.532 483.121 807.381 481C805.259 478.848 804.199 476.273 804.199 473.273C804.199 470.303 805.259 467.758 807.381 465.636C809.532 463.515 812.108 462.455 815.108 462.455C818.017 462.455 820.563 463.515 822.744 465.636C824.926 467.758 826.017 470.303 826.017 473.273C826.017 475.273 825.502 477.106 824.472 478.773C823.472 480.409 822.153 481.727 820.517 482.727C818.881 483.697 817.078 484.182 815.108 484.182ZM874.483 485.045C866.665 485.015 859.938 483.091 854.301 479.273C848.695 475.455 844.377 469.924 841.347 462.682C838.347 455.439 836.862 446.727 836.892 436.545C836.892 426.394 838.392 417.742 841.392 410.591C844.422 403.439 848.741 398 854.347 394.273C859.983 390.515 866.695 388.636 874.483 388.636C882.271 388.636 888.968 390.515 894.574 394.273C900.21 398.03 904.544 403.485 907.574 410.636C910.604 417.758 912.104 426.394 912.074 436.545C912.074 446.758 910.559 455.485 907.528 462.727C904.528 469.97 900.225 475.5 894.619 479.318C889.013 483.136 882.301 485.045 874.483 485.045ZM874.483 468.727C879.816 468.727 884.074 466.045 887.256 460.682C890.438 455.318 892.013 447.273 891.983 436.545C891.983 429.485 891.256 423.606 889.801 418.909C888.377 414.212 886.347 410.682 883.71 408.318C881.104 405.955 878.028 404.773 874.483 404.773C869.18 404.773 864.938 407.424 861.756 412.727C858.574 418.03 856.968 425.97 856.938 436.545C856.938 443.697 857.65 449.667 859.074 454.455C860.528 459.212 862.574 462.788 865.21 465.182C867.847 467.545 870.938 468.727 874.483 468.727Z" fill="currentColor"/></svg>'),t&&n.push(`<div class="quality-badge quality-badge--sound">${t}</div>`)}qualityInfo.dub&&n.push('<div class="quality-badge quality-badge--dub"><svg viewBox="-1 558 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="561.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M60.5284 673H27.5284V579.909H60.8011C70.1648 579.909 78.2254 581.773 84.983 585.5C91.7405 589.197 96.9375 594.515 100.574 601.455C104.241 608.394 106.074 616.697 106.074 626.364C106.074 636.061 104.241 644.394 100.574 651.364C96.9375 658.333 91.7102 663.682 84.892 667.409C78.1042 671.136 69.983 673 60.5284 673ZM47.2102 656.136H59.7102C65.5284 656.136 70.4223 655.106 74.392 653.045C78.392 650.955 81.392 647.727 83.392 643.364C85.4223 638.97 86.4375 633.303 86.4375 626.364C86.4375 619.485 85.4223 613.864 83.392 609.5C81.392 605.136 78.4072 601.924 74.4375 599.864C70.4678 597.803 65.5739 596.773 59.7557 596.773H47.2102V656.136ZM178.153 579.909H197.835V640.364C197.835 647.152 196.214 653.091 192.972 658.182C189.759 663.273 185.259 667.242 179.472 670.091C173.684 672.909 166.941 674.318 159.244 674.318C151.517 674.318 144.759 672.909 138.972 670.091C133.184 667.242 128.684 663.273 125.472 658.182C122.259 653.091 120.653 647.152 120.653 640.364V579.909H140.335V638.682C140.335 642.227 141.108 645.379 142.653 648.136C144.229 650.894 146.441 653.061 149.29 654.636C152.138 656.212 155.456 657 159.244 657C163.063 657 166.381 656.212 169.199 654.636C172.047 653.061 174.244 650.894 175.79 648.136C177.366 645.379 178.153 642.227 178.153 638.682V579.909ZM214.028 673V579.909H251.301C258.15 579.909 263.862 580.924 268.438 582.955C273.013 584.985 276.453 587.803 278.756 591.409C281.059 594.985 282.21 599.106 282.21 603.773C282.21 607.409 281.483 610.606 280.028 613.364C278.574 616.091 276.574 618.333 274.028 620.091C271.513 621.818 268.634 623.045 265.392 623.773V624.682C268.938 624.833 272.256 625.833 275.347 627.682C278.468 629.53 280.998 632.121 282.938 635.455C284.877 638.758 285.847 642.697 285.847 647.273C285.847 652.212 284.619 656.621 282.165 660.5C279.741 664.348 276.15 667.394 271.392 669.636C266.634 671.879 260.771 673 253.801 673H214.028ZM233.71 656.909H249.756C255.241 656.909 259.241 655.864 261.756 653.773C264.271 651.652 265.528 648.833 265.528 645.318C265.528 642.742 264.907 640.47 263.665 638.5C262.422 636.53 260.65 634.985 258.347 633.864C256.074 632.742 253.362 632.182 250.21 632.182H233.71V656.909ZM233.71 618.864H248.301C250.998 618.864 253.392 618.394 255.483 617.455C257.604 616.485 259.271 615.121 260.483 613.364C261.725 611.606 262.347 609.5 262.347 607.045C262.347 603.682 261.15 600.97 258.756 598.909C256.392 596.848 253.028 595.818 248.665 595.818H233.71V618.864Z" fill="currentColor"/></svg></div>'),n.length>0&&(e.html(n.join("")),e.addClass("show"))}function C(t){const e=t.data.movie,n=t.object.activity;if(!e||!n)return;v(n,e),b(n,e),y(n,e),w(n,(()=>{if(!c(n))return;n.render().find(".applecation__meta").addClass("show");const t=Lampa.Storage.get("applecation_description_overlay",!0),e=n.render().find(".applecation__description-wrapper").addClass("show");t&&(e.addClass("selector"),window.Lampa&&Lampa.Controller&&Lampa.Controller.collectionAppend(e)),n.render().find(".applecation__info").addClass("show"),n.render().find(".applecation__ratings").addClass("show")}));const a=n.render().find(".applecation__logo"),i=n.render().find(".full-start-new__title"),o=t=>{const e={w200:"w300",w300:"w500",w500:"original"}[Lampa.Storage.field("poster_size")]||"w500",i=Lampa.TMDB.image(`/t/p/${e}${t}`),o=new Image;o.onload=()=>{c(n)&&(a.html(`<img src="${i}" alt="" />`),w(n,(()=>{c(n)&&a.addClass("loaded")})),function(t){const e=$(".applecation-description-overlay");if(e.length&&t){const n=$("<img>").attr("src",t);e.find(".applecation-description-overlay__logo").html(n).css("display","block"),e.find(".applecation-description-overlay__title").css("display","none")}}(i))},o.src=i};if(e.images&&e.images.logos&&e.images.logos.length>0){const t=Lampa.Storage.field("tmdb_lang")||Lampa.Storage.get("language")||"ru";let n=e.images.logos.find((e=>e.iso_639_1===t));if(!n&&Lampa.Storage.get("applecation_show_foreign_logo",!0)&&(n=e.images.logos.find((t=>"en"===t.iso_639_1)),n||(n=e.images.logos.find((t=>!t.iso_639_1))),n||(n=e.images.logos[0])),n&&n.file_path)return o(n.file_path)}const l=e.name?"tv":"movie",r=Lampa.TMDB.api(`${l}/${e.id}/images?api_key=${Lampa.TMDB.key()}&language=${Lampa.Storage.get("language")}`);$.get(r,(t=>{if(c(n)){if(t.logos&&t.logos.length>0){const e=Lampa.Storage.field("tmdb_lang")||Lampa.Storage.get("language")||"ru";let n=t.logos.find((t=>t.iso_639_1===e));if(!n&&Lampa.Storage.get("applecation_show_foreign_logo",!0)&&(n=t.logos.find((t=>"en"===t.iso_639_1))||t.logos.find((t=>!t.iso_639_1))||t.logos[0]),n&&n.file_path)return o(n.file_path)}i.show(),w(n,(()=>{a.addClass("loaded")}))}})).fail((()=>{i.show(),w(n,(()=>{a.addClass("loaded")}))}))}function w(t,e){const n=t.render().find(".full-start__background:not(.applecation__overlay)");if(!n.length)return void e();if(n.hasClass("loaded")&&n.hasClass("applecation-animated"))return void e();if(n.hasClass("loaded"))return void setTimeout((()=>{n.addClass("applecation-animated"),e()}),350);const a=setInterval((()=>{c(t)?n.hasClass("loaded")&&(clearInterval(a),setTimeout((()=>{c(t)&&(n.addClass("applecation-animated"),e())}),650)):clearInterval(a)}),50);setTimeout((()=>{clearInterval(a),n.hasClass("applecation-animated")||(n.addClass("applecation-animated"),e())}),2e3)}var x={type:"other",version:t,name:"Applecation",description:"Делает интерфейс в карточке фильма похожим на Apple TV и оптимизирует под 4K",author:"@darkestclouds",icon:e};Lampa.Manifest&&Lampa.Manifest.plugins&&(Lampa.Manifest.plugins=x),window.appready?d():Lampa.Listener.follow("app",(t=>{"ready"===t.type&&d()}))}();
/* ============================================================
   PATCH: Hide card description option
   Adds a toggle in applecation_settings:
   "Показывать описание в карточке" (default: ON)
   When OFF → hides .applecation__description-wrapper via CSS.
   ============================================================ */
;(function () {
    'use strict';

    var STORAGE_KEY = 'applecation_show_card_description';
    var STYLE_ID    = 'applecation-hide-desc-style';

    /* CSS injected once */
    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id  = STYLE_ID;
        style.textContent =
            'body.applecation-hide-description .applecation__description-wrapper { ' +
            'display: none !important; }';
        document.head.appendChild(style);
    }

    /* Apply/remove body class based on saved setting */
    function applyState(show) {
        if (show || show === undefined) {
            document.body.classList.remove('applecation-hide-description');
        } else {
            document.body.classList.add('applecation-hide-description');
        }
    }

    /* Register the settings param in applecation_settings */
    function registerParam() {
        if (!window.Lampa || !Lampa.SettingsApi || !Lampa.SettingsApi.addParam) return;

        /* Read current value (default true = show) */
        var current = Lampa.Storage.get(STORAGE_KEY, true);
        applyState(current);

        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name:    STORAGE_KEY,
                type:    'trigger',
                default: true
            },
            field: {
                name:        'Показывать описание в карточке',
                description: 'Скрыть текст описания фильма/сериала в карточке каталога'
            },
            onChange: function (value) {
                Lampa.Storage.set(STORAGE_KEY, value);
                applyState(value);
            }
        });
    }

    /* Init */
    function init() {
        injectStyle();
        registerParam();
    }

    if (window.appready) {
        init();
    } else if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(init, 1500);
        });
    }
})();
