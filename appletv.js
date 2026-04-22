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
    CATEGORY_SIZE_ATTR: 'data-agnative-category'
  };

  const ru = {
    nav_feed: 'Лента',
    badge_movie: 'ФИЛЬМ', badge_tv: 'СЕРИАЛ',
    set_about_desc: 'Версия 0.3.0  Авторы: llowmikee, nrsua, gwynnbleiidd, arabianq, ang3el7z',
    set_main_title: 'Основные настройки',
    set_enable_name: 'AppleTV AgNative',
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
    set_reset_done: 'Настройки AppleTV AgNative сброшены',
    set_category_size_name: 'Размер названий категорий',
    set_category_size_desc: 'Заголовки полок (Популярное, Новинки и т.д.)',
    set_clock_seconds_name: 'Секунды в часах',
    set_clock_seconds_desc: 'Показывать секунды рядом с часами в шапке',
    set_control_panel_name: 'Панель по клику на часы',
    set_control_panel_desc: 'Settings, Synchronization, Player, Cache & Data'
  };

  const en = {
    nav_feed: 'Feed',
    badge_movie: 'MOVIE', badge_tv: 'TV SHOW',
    set_about_desc: 'Версия 0.3.0  Авторы: llowmikee, nrsua, gwynnbleiidd, arabianq, ang3el7z',
    set_main_title: 'Main settings',
    set_enable_name: 'AppleTV AgNative',
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
    set_reset_done: 'AppleTV AgNative settings reset',
    set_category_size_name: 'Category title size',
    set_category_size_desc: 'Section titles (Popular, New, etc.)',
    set_clock_seconds_name: 'Seconds in clock',
    set_clock_seconds_desc: 'Show seconds next to the header clock',
    set_control_panel_name: 'Clock click panel',
    set_control_panel_desc: 'Settings, Synchronization, Player, Cache & Data'
  };

  const uk = {
    nav_feed: 'Стрічка',
    badge_movie: 'ФІЛЬМ', badge_tv: 'СЕРІАЛ',
    set_about_desc: 'Версия 0.3.0  Авторы: llowmikee, nrsua, gwynnbleiidd, arabianq, ang3el7z',
    set_main_title: 'Основні налаштування',
    set_enable_name: 'AppleTV AgNative',
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
    set_reset_done: 'Налаштування AppleTV AgNative скинуто',
    set_category_size_name: 'Розмір назв категорій',
    set_category_size_desc: 'Заголовки поличок (Популярне, Новинки тощо)',
    set_clock_seconds_name: 'Секунди в годиннику',
    set_clock_seconds_desc: 'Показувати секунди поруч із годинником у шапці',
    set_control_panel_name: 'Панель за кліком на годинник',
    set_control_panel_desc: 'Settings, Synchronization, Player, Cache & Data'
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
      CATEGORY_SIZE_ATTR
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
          document.body.removeAttribute(BACKDROP_ATTR);
          document.body.removeAttribute(BADGE_ATTR);
          document.body.removeAttribute(RATING_ATTR);
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
        Lampa.Storage.set(BACKDROP_KEY, 'on');
        Lampa.Storage.set(BADGE_KEY, 'on');
        Lampa.Storage.set(RATING_KEY, 'off');
        Lampa.Storage.set(RATING_STYLE_KEY, 'color');
        Lampa.Storage.set(CLOCK_SECONDS_KEY, 'off');
        Lampa.Storage.set(CONTROL_PANEL_KEY, 'off');
        Lampa.Storage.set(TOPNAV_ITEMS_KEY, ['main', 'movie', 'tv', 'cartoon']);
        logoCache = {};
        syncGlareClass();
        syncFontSize();
        syncCardFlags();
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
        'body.' + BODY_CLASS + ' .items-line--type-default { min-height:auto !important; padding-top:0 !important; padding-bottom:.12em !important; margin-bottom:.32em !important; }',
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
        'body.' + BODY_CLASS + ' .card.focus .card__view { transform: translateY(-.08em) scale(1.06) !important; filter: saturate(1.06) brightness(1.02) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 2px rgba(86,141,255,.92), 0 18px 42px rgba(0,0,0,.26), 0 8px 20px rgba(0,0,0,.14) !important; }',
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
        '}'
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
      new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var node = added[j];
            if (node.nodeType !== 1) continue;
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
      }).observe(document.body, { childList: true, subtree: true });
    }

    function initGlareRuntime() {
      if (window.__AGNATIVE_TOPNAV_GLARE_RUNTIME__) return;
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
      syncCardFlags();
      observeCards();
      initGlareRuntime();
      processCards(document.body);
      schedulePatch();
      setTimeout(function () { injectStyle(); }, 1000);
      setTimeout(function () { injectStyle(); }, 3000);
      setTimeout(function () {
        var actBody = qs('.activity--active .activity__body') || qs('.activity__body');
        if (actBody) {
          processCards(actBody);
        }
      }, 600);

      schedulePatch();
      setTimeout(function () { schedulePatch(); }, 400);
      setTimeout(function () { schedulePatch(); }, 1200);
    }

    function bootPlugin() {
      registerSettings();
      startPlugin();
      setTimeout(function () { startPlugin(); }, 250);
      setTimeout(function () { startPlugin(); }, 900);
      setTimeout(function () { startPlugin(); }, 1800);
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
