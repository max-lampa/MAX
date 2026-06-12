
(function () {
  'use strict';

  // ─── Guard ───────────────────────────────────────────────────────────────────
  const PLUGIN_GUARD_KEY = '__APPLETV_AGNATIVE_TOPNAV__';
  function canBootPlugin() {
    if (typeof window === 'undefined') return false;
    if (window[PLUGIN_GUARD_KEY]) return false;
    window[PLUGIN_GUARD_KEY] = true;
    return true;
  }
  if (!canBootPlugin()) return;

  // ─── Constants ───────────────────────────────────────────────────────────────
  const PLUGIN_VERSION = '0.4.3';

  const AGNATIVE_KEYS = {
    STYLE_ID:                   'appletv-agnative-topnav-style',
    BODY_CLASS:                 'appletv-agnative-topnav',
    CLOCK_ID:                   'agnative-topnav-clock',
    TMDB_KEY:                   '4ef0d7355d9ffb5151e987764708ce96',
    ENABLE_KEY:                 'appletv_agnative_topnav_enabled',
    GLARE_KEY:                  'appletv_agnative_topnav_glare_enabled',
    CARD_ANIM_KEY:              'appletv_agnative_card_anim',
    CARD_ANIM_ATTR:             'data-agnative-card-anim',
    CARD_ANIM_ORBIT_KEY:        'appletv_agnative_card_anim_orbit',
    TOPNAV_ITEMS_KEY:           'appletv_agnative_topnav_items',
    LOGO_LANG_KEY:              'appletv_agnative_logo_lang',
    FONT_SIZE_KEY:              'appletv_agnative_font_size',
    UI_LANG_KEY:                'appletv_agnative_ui_lang',
    BACKDROP_KEY:               'appletv_agnative_backdrop',
    BADGE_KEY:                  'appletv_agnative_badge',
    RATING_KEY:                 'appletv_agnative_rating',
    RATING_STYLE_KEY:           'appletv_agnative_rating_style',
    CATEGORY_SIZE_KEY:          'appletv_agnative_category_size',
    CARD_SIZE_KEY:              'appletv_agnative_card_size',
    CLOCK_SECONDS_KEY:          'appletv_agnative_clock_seconds',
    CONTROL_PANEL_KEY:          'appletv_agnative_control_panel',
    PERF_MODE_KEY:              'appletv_agnative_perf_mode',
    SETTINGS_COMPONENT:         'agnative',
    TOPNAV_SETTINGS_COMPONENT:  'agnative_topnav',
    GLARE_CLASS:                'appletv-agnative-topnav-glare',
    FONT_SIZE_ATTR:             'data-agnative-font',
    BACKDROP_ATTR:              'data-agnative-backdrop',
    BADGE_ATTR:                 'data-agnative-badge',
    RATING_ATTR:                'data-agnative-rating',
    RATING_STYLE_ATTR:          'data-agnative-rating-style',
    CATEGORY_SIZE_ATTR:         'data-agnative-category',
    CARD_SIZE_ATTR:             'data-agnative-card-size',
    LOGO_SIZE_KEY:              'appletv_agnative_logo_size',
    LOGO_SIZE_ATTR:             'data-agnative-logo-size',
    CACHE_SIZE_KEY:             'appletv_agnative_cache_size',
    POSTER_QUALITY_KEY:         'appletv_agnative_poster_quality',
    PERF_ATTR:                  'data-agnative-perf',
    FLEX_GAP_ATTR:              'data-agnative-flex-gap',
    OVERLAY_ALIGN_KEY:          'appletv_agnative_overlay_align',
    OVERLAY_ALIGN_ATTR:         'data-agnative-overlay-align',
    CARD_IMAGE_MODE_KEY:        'appletv_agnative_card_image_mode',
    CARD_IMAGE_MODE_ATTR:       'data-agnative-card-image-mode',
    LOGO_TITLE_KEY:             'appletv_agnative_logo_title_fallback',
    HERO_KEY:                   'appletv_agnative_hero_enabled',
    HERO_SETTINGS_COMPONENT:    'agnative_hero',
    HERO_ALIGN_KEY:             'appletv_agnative_hero_align',
    HERO_ALIGN_ATTR:            'data-agnative-hero-align',
    HERO_INDICATORS_KEY:        'appletv_agnative_hero_indicators',
    HERO_ANIMATION_KEY:         'appletv_agnative_hero_animation',
    HERO_ANIMATION_ATTR:        'data-agnative-hero-anim',
    HERO_INTERVAL_KEY:          'appletv_agnative_hero_interval',
    HERO_PAN_KEY:               'appletv_agnative_hero_pan',
    HERO_BG_ANIM_KEY:           'appletv_agnative_hero_bg_anim',
    HERO_QUALITY_KEY:           'appletv_agnative_hero_quality',
    HERO_TRAILER_KEY:           'appletv_agnative_hero_trailer',
    HERO_TRAILER_MODE_KEY:      'appletv_agnative_hero_trailer_mode',
    HERO_TRAILER_DELAY_KEY:     'appletv_agnative_hero_trailer_delay',
    HERO_TRAILER_QUALITY_KEY:   'appletv_agnative_hero_trailer_quality',
    TOPNAV_ENABLE_KEY:          'appletv_agnative_topnav_visible',
    TOPNAV_ICONS_ORDER_KEY:     'appletv_agnative_topnav_icons_order',
    TOPNAV_SIZE_KEY:            'appletv_agnative_topnav_size',
    TOPNAV_SIZE_ATTR:           'data-agnative-topnav-size',
    SETTINGS_HIDE_KEY:          'appletv_agnative_settings_hide',
    SETTINGS_HIDE_COMPONENT:    'agnative_settings_hide',
    POSTER_BORDER_KEY:          'appletv_agnative_poster_border',
    POSTER_BORDER_ATTR:         'data-agnative-poster-border',
  };

  // ─── i18n ────────────────────────────────────────────────────────────────────
  const ru = {
    nav_feed: 'Лента',
    badge_movie: 'ФИЛЬМ',
    badge_tv: 'СЕРИАЛ',
    set_about_version: 'Версия',
    set_main_title: 'Основные настройки',
    set_enable_name: 'AppleTV AgNative',
    set_enable_desc: 'Включает и выключает плагин',
    set_card_anim_name: 'Анимация карточек',
    set_card_anim_desc: 'Эффект при наведении/фокусе на карточку',
    val_card_anim_off: 'Выключено',
    val_card_anim_veoveo: 'Наклон (tilt)',
    val_card_anim_appletv: 'DepthTV',
    set_card_anim_orbit_name: 'Авто-анимация на ТВ',
    set_card_anim_orbit_desc: 'На сфокусированной карточке имитировать круговое движение',
    set_topnav_name: 'Пункты Topnav',
    set_topnav_desc: 'Меню вверху страницы',
    set_topnav_title: 'Пункты верхнего меню',
    set_topnav_item_desc: 'Пункт menu_list: ',
    set_logo_lang_name: 'Язык логотипов',
    set_logo_lang_desc: 'Если логотипа на выбранном языке нет, используется английский',
    set_font_size_name: 'Размер шрифта',
    set_font_size_desc: 'Масштаб текста',
    set_ui_lang_desc: 'Язык плагина',
    val_on: 'Включить',
    val_off: 'Выключить',
    val_hide: 'Скрыть',
    val_auto: 'Автоматически',
    val_size_xs: 'Мелкий',
    val_size_sm: 'Маленький',
    val_size_md: 'Обычный',
    val_size_lg: 'Крупный',
    val_size_xl: 'Огромный',
    val_rating_color: 'Цветной',
    val_rating_mono: 'Монохромный',
    set_backdrop_name: 'Горизонтальные карточки медиаконтента',
    set_backdrop_desc: 'Горизонтальные или вертикальные карточки',
    set_badge_name: 'Бейдж «Фильм/Сериал»',
    set_badge_desc: 'Бейдж в левом верхнем углу карточки',
    set_rating_desc: 'Показывать оценку в правом верхнем углу карточки',
    set_rating_style_name: 'Стиль рейтинга TMDB',
    set_rating_style_desc: 'Цветной или монохромный стиль рейтинга tmdb',
    set_reset_name: 'Сбросить настройки',
    set_reset_desc: 'Вернуть все параметры плагина к значениям по умолчанию',
    set_reset_done: 'Настройки AppleTV AgNative сброшены',
    set_category_size_name: 'Размер названий категорий',
    set_category_size_desc: 'Заголовки полок (Популярное, Новинки и т.д.)',
    set_card_size_name: 'Размер карточек',
    set_card_size_desc: 'Ширина карточек в лентах',
    set_logo_size_name: 'Размер логотипа фильма',
    set_logo_size_desc: 'Максимальная ширина логотипа на карточке',
    set_clock_seconds_name: 'Секунды в часах',
    set_clock_seconds_desc: 'Показывать секунды рядом с часами в шапке',
    set_control_panel_name: 'Панель по клику на часы',
    set_control_panel_desc: 'Settings, Synchronization, Player, Cache & Data',
    set_perf_mode_name: 'Режим производительности',
    set_perf_mode_desc: 'Снижает нагрузку на слабых устройствах: отключает блюр, блики и тяжёлую анимацию',
    val_unlimited: 'Без ограничений',
    set_cache_size_name: 'Размер кеша изображений',
    set_cache_size_desc: 'Максимальный объём изображений в локальном кеше',
    val_perf_auto: 'Автоматически',
    val_perf_high: 'Максимум (все эффекты)',
    val_perf_low: 'Слабое устройство',
    val_perf_ultra: 'Очень слабое устройство (ATV9)',
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
    val_card_image_poster: 'Постер',
    set_logo_title_name: 'Название на локальном языке',
    set_logo_title_desc: 'Показывать название на локальном языке, если логотип не на локальном',
    set_hero_name: 'Hero баннер',
    set_hero_desc: 'Большой баннер вверху главного экрана',
    set_hero_title: 'Настройки Hero баннера',
    set_hero_enable_name: 'Hero баннер',
    set_hero_enable_desc: 'Большой баннер вверху главного экрана',
    set_hero_align_name: 'Положение текста',
    set_hero_align_desc: 'Где расположен блок с названием и описанием',
    val_hero_align_top: 'Сверху',
    val_hero_align_center: 'По центру',
    val_hero_align_bottom: 'Снизу',
    set_hero_indicators_name: 'Полоски карточек',
    set_hero_indicators_desc: 'Показывать индикаторы',
    set_hero_animation_name: 'Плавная анимация',
    set_hero_animation_desc: 'Плавная смена контента баннера при ротации',
    set_hero_interval_name: 'Интервал смены',
    set_hero_interval_desc: 'Как часто баннер переключается на следующую карточку',
    set_hero_bg_anim_name: 'Анимация фона',
    set_hero_bg_anim_desc: 'Плавное движение фоновой картинки',
    val_anim_pan_down: 'Панорама ↓',
    val_anim_pan_up: 'Панорама ↑',
    val_anim_zoom_in: 'Приближение',
    val_anim_zoom_out: 'Отдаление',
    val_anim_drift: 'Дрейф',
    val_anim_breathe: 'Дыхание',
    set_hero_quality_name: 'Качество фона',
    set_hero_quality_desc: 'Разрешение фоновой картинки баннера',
    set_hero_trailer_name: 'Трейлер при простое',
    set_hero_trailer_desc: 'Через паузу без действий в баннере проигрывается трейлер',
    set_hero_trailer_mode_name: 'Режим баннера',
    set_hero_trailer_mode_desc: 'Показывать ли трейлер поверх постера после простоя',
    val_trailer_mode_posters: 'Только постеры',
    val_trailer_mode_mixed: 'Постеры + трейлер после простоя',
    val_trailer_mode_trailers: 'Только трейлеры',
    set_hero_trailer_delay_name: 'Задержка трейлера',
    set_hero_trailer_delay_desc: 'Сколько ждать бездействия перед запуском трейлера',
    set_hero_trailer_quality_name: 'Качество трейлера',
    set_hero_trailer_quality_desc: 'Разрешение трейлеров в баннере',
    val_sec_short: 'сек',
    hero_btn_watch: 'Смотреть',
    set_section_beta: 'Beta - функции',
    set_section_topnav: 'Верхняя панель',
    set_section_hero_banner: 'Hero-баннер',
    set_section_logos: 'Логотипы и постеры',
    set_topnav_enable_name: 'Верхняя панель навигации',
    set_topnav_enable_desc: 'Показывать или скрыть верхнюю панель',
    set_topnav_size_name: 'Размер верхней панели',
    set_topnav_size_desc: 'Масштаб панели сверху (пункты меню, часы, профиль)',
    set_topnav_icons_order_name: 'Поиск и избранное',
    set_topnav_icons_order_desc: 'Где разместить иконки поиска и избранного',
    val_topnav_icons_end: 'Оба в конце',
    val_topnav_icons_start: 'Оба в начале',
    val_topnav_icons_split: 'Поиск в начале, избранное в конце',
    set_topnav_position: 'Позиция',
    set_settings_hide_name: 'Скрыть разделы настроек',
    set_settings_hide_desc: 'Выбрать какие разделы верхнего уровня скрыть',
    set_settings_hide_title: 'Скрыть разделы',
    set_settings_hide_item_desc: 'Скрыть этот раздел из главных настроек Lampa',
    set_poster_border_name: 'Рамка постеров',
    set_poster_border_desc: 'Мини-рамка вокруг постеров карточек',
  };

  const en = {
    nav_feed: 'Feed',
    badge_movie: 'MOVIE',
    badge_tv: 'TV SHOW',
    set_about_version: 'Version',
    set_main_title: 'Main settings',
    set_enable_name: 'AppleTV AgNative',
    set_enable_desc: 'Enables and disables the plugin',
    set_card_anim_name: 'Card animation',
    set_card_anim_desc: 'Effect on card hover / focus',
    val_card_anim_off: 'Off',
    val_card_anim_veoveo: 'Tilt',
    val_card_anim_appletv: 'DepthTV',
    set_card_anim_orbit_name: 'Auto animation on TV',
    set_card_anim_orbit_desc: 'Simulate a circular motion on the focused card',
    set_topnav_name: 'Topnav items',
    set_topnav_desc: 'Top page menu',
    set_topnav_title: 'Top navigation items',
    set_topnav_item_desc: 'menu_list item: ',
    set_logo_lang_name: 'Logo language',
    set_logo_lang_desc: 'If no logo in chosen language, English is used',
    set_font_size_name: 'Font size',
    set_font_size_desc: 'Text scale',
    set_ui_lang_desc: 'Plugin language',
    val_on: 'Enable',
    val_off: 'Disable',
    val_hide: 'Hide',
    val_auto: 'Auto',
    val_size_xs: 'Extra small',
    val_size_sm: 'Small',
    val_size_md: 'Normal',
    val_size_lg: 'Large',
    val_size_xl: 'Extra large',
    val_rating_color: 'Colored',
    val_rating_mono: 'Monochrome',
    set_backdrop_name: 'Landscape media cards',
    set_backdrop_desc: 'Landscape or portrait cards',
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
    set_cache_size_desc: 'Maximum size of locally cached images',
    val_perf_auto: 'Auto',
    val_perf_high: 'Maximum (all effects)',
    val_perf_low: 'Weak device',
    val_perf_ultra: 'Very weak device (ATV9)',
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
    val_card_image_poster: 'Poster',
    set_logo_title_name: 'Local language title',
    set_logo_title_desc: 'Show title in local language when the logo or poster is not in local',
    set_hero_name: 'Hero banner',
    set_hero_desc: 'Large banner at the top of the main screen',
    set_hero_title: 'Hero banner settings',
    set_hero_enable_name: 'Hero banner',
    set_hero_enable_desc: 'Large banner at the top of the main screen',
    set_hero_align_name: 'Text position',
    set_hero_align_desc: 'Where the title and description block sits',
    val_hero_align_top: 'Top',
    val_hero_align_center: 'Center',
    val_hero_align_bottom: 'Bottom',
    set_hero_indicators_name: 'Card strips',
    set_hero_indicators_desc: 'Show indicator strips',
    set_hero_animation_name: 'Smooth animation',
    set_hero_animation_desc: 'Smooth content transition when the banner rotates',
    set_hero_interval_name: 'Slide interval',
    set_hero_interval_desc: 'How often the banner rotates to the next card',
    set_hero_bg_anim_name: 'Background animation',
    set_hero_bg_anim_desc: 'Ambient motion applied to the backdrop image during each slide',
    val_anim_pan_down: 'Pan ↓',
    val_anim_pan_up: 'Pan ↑',
    val_anim_zoom_in: 'Zoom in',
    val_anim_zoom_out: 'Zoom out',
    val_anim_drift: 'Drift',
    val_anim_breathe: 'Breathe',
    set_hero_quality_name: 'Background quality',
    set_hero_quality_desc: 'Banner backdrop image resolution',
    set_hero_trailer_name: 'Trailer on idle',
    set_hero_trailer_desc: 'After a pause with no input, the banner plays the trailer (muted)',
    set_hero_trailer_mode_name: 'Banner mode',
    set_hero_trailer_mode_desc: 'Whether to play a trailer over the poster after idle',
    val_trailer_mode_posters: 'Posters only',
    val_trailer_mode_mixed: 'Posters + trailer after idle',
    val_trailer_mode_trailers: 'Trailers only',
    set_hero_trailer_delay_name: 'Trailer delay',
    set_hero_trailer_delay_desc: 'How long to wait while idle before starting the trailer',
    set_hero_trailer_quality_name: 'Trailer quality',
    set_hero_trailer_quality_desc: 'Resolution of trailers played in the banner',
    val_sec_short: 'sec',
    hero_btn_watch: 'Watch',
    set_section_beta: 'Beta features',
    set_section_topnav: 'Top navigation',
    set_section_hero_banner: 'Hero banner',
    set_section_logos: 'Logos and posters',
    set_topnav_enable_name: 'Top navigation bar',
    set_topnav_enable_desc: 'Show or hide the top navigation',
    set_topnav_size_name: 'Top navigation size',
    set_topnav_size_desc: 'Scale of the topnav bar (menu items, clock, profile)',
    set_topnav_icons_order_name: 'Search & favorites',
    set_topnav_icons_order_desc: 'Where to place the search and favorites icons',
    val_topnav_icons_end: 'Both at the end',
    val_topnav_icons_start: 'Both at the start',
    val_topnav_icons_split: 'Search at start, favorites at end',
    set_topnav_position: 'Position',
    set_settings_hide_name: 'Hide settings sections',
    set_settings_hide_desc: 'Choose which top-level sections to hide in Lampa settings',
    set_settings_hide_title: 'Hide sections',
    set_settings_hide_item_desc: 'Hide this section from main Lampa settings',
    set_poster_border_name: 'Poster border',
    set_poster_border_desc: 'Mini border/frame around card posters',
  };

  const uk = {
    nav_feed: 'Стрічка',
    badge_movie: 'ФІЛЬМ',
    badge_tv: 'СЕРІАЛ',
    set_about_version: 'Версія',
    set_main_title: 'Основні налаштування',
    set_enable_name: 'AppleTV AgNative',
    set_enable_desc: 'Вмикає та вимикає плагін',
    set_poster_border_name: 'Рамка постерів',
    set_poster_border_desc: 'Мінірамка навколо постерів карток',
  };

  // ─── Translation ──────────────────────────────────────────────────────────────
  function getUILang() {
    try {
      var stored = localStorage.getItem(AGNATIVE_KEYS.UI_LANG_KEY);
      if (stored) return stored;
      if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.get === 'function') {
        var lang = Lampa.Storage.get('language') || Lampa.Storage.get('lang') || 'ru';
        if (lang === 'uk' || lang === 'ua') return 'uk';
        if (lang === 'en') return 'en';
      }
    } catch (e) {}
    return 'ru';
  }

  function t(key) {
    var lang = getUILang();
    var map = lang === 'en' ? en : lang === 'uk' ? uk : ru;
    if (map && map[key]) return map[key];
    if (en[key]) return en[key];
    return key;
  }

  // ─── DOM helpers ─────────────────────────────────────────────────────────────
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ─── Storage helpers ──────────────────────────────────────────────────────────
  function storeGet(key, def) {
    try {
      if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.get === 'function') {
        var v = Lampa.Storage.get(key, def !== undefined ? def : '');
        if (v !== '' && v !== null && v !== undefined) return v;
      }
    } catch (e) {}
    try {
      var ls = localStorage.getItem(key);
      if (ls !== null) return ls;
    } catch (e) {}
    return def;
  }

  function storeSet(key, val) {
    try {
      if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.set === 'function') {
        Lampa.Storage.set(key, val);
        return;
      }
    } catch (e) {}
    try { localStorage.setItem(key, val); } catch (e) {}
  }

  // ─── Setting readers ──────────────────────────────────────────────────────────
  function pluginEnabled()       { return storeGet(AGNATIVE_KEYS.ENABLE_KEY, 'true') !== 'false'; }
  function glareEnabled()        { return storeGet(AGNATIVE_KEYS.GLARE_KEY, 'false') === 'true'; }
  function backdropEnabled()     { return storeGet(AGNATIVE_KEYS.BACKDROP_KEY, 'true') !== 'false'; }
  function badgeEnabled()        { return storeGet(AGNATIVE_KEYS.BADGE_KEY, 'false') === 'true'; }
  function ratingEnabled()       { return storeGet(AGNATIVE_KEYS.RATING_KEY, 'true') !== 'false'; }
  function logoTitleEnabled()    { return storeGet(AGNATIVE_KEYS.LOGO_TITLE_KEY, 'false') === 'true'; }
  function heroBannerEnabled()   { return storeGet(AGNATIVE_KEYS.HERO_KEY, 'true') !== 'false'; }
  function topnavVisible()       { return storeGet(AGNATIVE_KEYS.TOPNAV_ENABLE_KEY, 'true') !== 'false'; }
  function controlPanelEnabled() { return storeGet(AGNATIVE_KEYS.CONTROL_PANEL_KEY, 'true') !== 'false'; }
  function clockSecondsEnabled() { return storeGet(AGNATIVE_KEYS.CLOCK_SECONDS_KEY, 'false') === 'true'; }
  function posterBorderEnabled() { return storeGet(AGNATIVE_KEYS.POSTER_BORDER_KEY, 'true') !== 'false'; }

  function getLogoLang()       { return storeGet(AGNATIVE_KEYS.LOGO_LANG_KEY, 'ru'); }
  function getFontSize()       { return storeGet(AGNATIVE_KEYS.FONT_SIZE_KEY, 'md'); }
  function getCardAnim()       { return storeGet(AGNATIVE_KEYS.CARD_ANIM_KEY, 'off'); }
  function getCategorySize()   { return storeGet(AGNATIVE_KEYS.CATEGORY_SIZE_KEY, 'md'); }
  function getCardSize()       { return storeGet(AGNATIVE_KEYS.CARD_SIZE_KEY, 'md'); }
  function getLogoSize()       { return storeGet(AGNATIVE_KEYS.LOGO_SIZE_KEY, '55'); }
  function getOverlayAlign()   { return storeGet(AGNATIVE_KEYS.OVERLAY_ALIGN_KEY, 'start'); }
  function getCardImageMode()  { return storeGet(AGNATIVE_KEYS.CARD_IMAGE_MODE_KEY, 'backdrop'); }
  function getTopnavSize()     { return storeGet(AGNATIVE_KEYS.TOPNAV_SIZE_KEY, 'md'); }
  function getTopnavIconsOrder(){ return storeGet(AGNATIVE_KEYS.TOPNAV_ICONS_ORDER_KEY, 'end'); }
  function getHeroAlign()      { return storeGet(AGNATIVE_KEYS.HERO_ALIGN_KEY, 'bottom'); }
  function getHeroBgAnim()     { return storeGet(AGNATIVE_KEYS.HERO_BG_ANIM_KEY, 'pan_down'); }
  function getHeroInterval()   { return parseInt(storeGet(AGNATIVE_KEYS.HERO_INTERVAL_KEY, '7')) || 7; }
  function getHeroQuality()    { return storeGet(AGNATIVE_KEYS.HERO_QUALITY_KEY, 'w1280'); }
  function getPosterQuality()  { return storeGet(AGNATIVE_KEYS.POSTER_QUALITY_KEY, 'w342'); }
  function getHeroTrailerMode(){ return storeGet(AGNATIVE_KEYS.HERO_TRAILER_MODE_KEY, 'mixed'); }
  function getHeroTrailerDelay(){ return parseInt(storeGet(AGNATIVE_KEYS.HERO_TRAILER_DELAY_KEY, '8')) || 8; }
  function getHeroTrailerQuality(){ return storeGet(AGNATIVE_KEYS.HERO_TRAILER_QUALITY_KEY, '720'); }
  function heroIndicatorsEnabled(){ return storeGet(AGNATIVE_KEYS.HERO_INDICATORS_KEY, 'true') !== 'false'; }
  function heroAnimationEnabled(){ return storeGet(AGNATIVE_KEYS.HERO_ANIMATION_KEY, 'true') !== 'false'; }
  function heroTrailerEnabled() { return storeGet(AGNATIVE_KEYS.HERO_TRAILER_KEY, 'false') === 'true'; }
  function getCardAnimOrbit()  { return storeGet(AGNATIVE_KEYS.CARD_ANIM_ORBIT_KEY, 'false') === 'true'; }
  function getBackdropQuality(){ return storeGet(AGNATIVE_KEYS.POSTER_QUALITY_KEY, 'w780') === 'w185' ? 'w780' : storeGet(AGNATIVE_KEYS.POSTER_QUALITY_KEY, 'w780'); }
  function getSettingsHide()   {
    try { return JSON.parse(storeGet(AGNATIVE_KEYS.SETTINGS_HIDE_KEY, '[]')); } catch(e){ return []; }
  }

  // ─── Performance level ────────────────────────────────────────────────────────
  var _perfLevelCache = null;
  function resolvePerfLevel() {
    if (_perfLevelCache) return _perfLevelCache;
    var stored = storeGet(AGNATIVE_KEYS.PERF_MODE_KEY, 'auto');
    if (stored === 'high') { _perfLevelCache = 'high'; return 'high'; }
    if (stored === 'low')  { _perfLevelCache = 'low';  return 'low'; }
    if (stored === 'ultra'){ _perfLevelCache = 'ultra'; return 'ultra'; }
    // auto detection
    var ua = navigator.userAgent || '';
    var mem = navigator.deviceMemory;
    var cores = navigator.hardwareConcurrency;
    var isATV9 = /AppleTV\/9|tvOS 9/i.test(ua);
    var isWeakATV = /AppleTV\/1[01]/i.test(ua) || (mem && mem <= 2) || (cores && cores <= 2);
    if (isATV9) { _perfLevelCache = 'ultra'; return 'ultra'; }
    if (isWeakATV) { _perfLevelCache = 'low'; return 'low'; }
    _perfLevelCache = 'high';
    return 'high';
  }

  var isUltra = false;
  var isMedium = false;

  function checkPerfLevel() {
    var p = resolvePerfLevel();
    isUltra  = (p === 'ultra');
    isMedium = (p === 'low' || p === 'ultra');
  }

  function isMobile() {
    return /Android|Mobile|Phone/i.test(navigator.userAgent);
  }

  // ─── Theme / accent color from Lampa ─────────────────────────────────────────
  function getLampaAccentColor() {
    try {
      // Try CSS variable first (most themes expose it)
      var rootStyle = getComputedStyle(document.documentElement);
      var candidates = [
        '--lampa-accent',
        '--color-accent',
        '--accent',
        '--ui-accent',
        '--active-color',
        '--focus-color',
      ];
      for (var i = 0; i < candidates.length; i++) {
        var val = rootStyle.getPropertyValue(candidates[i]).trim();
        if (val) return val;
      }
      // Try Lampa.Storage theme
      if (window.Lampa && Lampa.Storage) {
        var theme = Lampa.Storage.get('theme') || '';
        // fallback: read .active color from DOM
      }
    } catch (e) {}
    return null;
  }

  function getLampaThemeColors() {
    var rootStyle = getComputedStyle(document.documentElement);
    function cv(name) { return rootStyle.getPropertyValue(name).trim(); }
    return {
      accent:     cv('--lampa-accent') || cv('--color-accent') || cv('--accent') || '#e84545',
      bg:         cv('--lampa-background') || cv('--background-color') || cv('--bg') || '#18181c',
      surface:    cv('--lampa-card') || cv('--card-bg') || cv('--surface') || '#222228',
      text:       cv('--lampa-text') || cv('--text-color') || cv('--text') || '#ffffff',
      textSecond: cv('--lampa-text2') || cv('--text-second') || '#aaaaaa',
      border:     cv('--lampa-border') || cv('--border-color') || 'rgba(255,255,255,0.1)',
      focus:      cv('--lampa-focus') || cv('--focus-color') || cv('--lampa-accent') || '#e84545',
    };
  }

  // ─── Style injection ──────────────────────────────────────────────────────────
  function injectStyle(id, css) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = css;
  }

  function removeStyle(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  }

  // ─── Build all CSS ────────────────────────────────────────────────────────────
  function buildCSS() {
    var perf = resolvePerfLevel();
    var tc = getLampaThemeColors();
    var accent  = tc.accent  || '#e84545';
    var bg      = tc.bg      || '#18181c';
    var surface = tc.surface || '#222228';
    var text    = tc.text    || '#ffffff';
    var textSec = tc.textSecond || '#aaaaaa';
    var border  = tc.border  || 'rgba(255,255,255,0.12)';
    var focus   = tc.focus   || accent;

    // Blur values based on perf
    var blurTopnav  = perf === 'ultra' ? 'none' : perf === 'low' ? 'blur(10px)' : 'blur(22px)';
    var blurLeftdock = perf === 'ultra' ? 'none' : perf === 'low' ? 'blur(8px)' : 'blur(18px)';
    var blurHero    = perf === 'ultra' ? 'none' : 'blur(2px)';
    var transCards  = perf === 'ultra' ? 'none' : perf === 'low' ? 'transform 0.15s ease' : 'transform 0.2s cubic-bezier(.22,.61,.36,1)';
    var transNav    = perf === 'ultra' ? 'none' : 'all 0.18s ease';
    var bgTopnav    = perf === 'ultra'
      ? 'rgba(0,0,0,0.88)'
      : 'linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 100%)';
    var bgLeftdock  = perf === 'ultra'
      ? 'rgba(0,0,0,0.92)'
      : 'linear-gradient(90deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.70) 100%)';
    var willChange = perf === 'ultra' ? 'auto' : 'transform';

    var heroAnim = (perf === 'ultra') ? '' : `
      @keyframes agn-pan-down  { from{transform:scale(1.08) translateY(-3%)} to{transform:scale(1.08) translateY(0)} }
      @keyframes agn-pan-up    { from{transform:scale(1.08) translateY(0)} to{transform:scale(1.08) translateY(-3%)} }
      @keyframes agn-zoom-in   { from{transform:scale(1.0)} to{transform:scale(1.1)} }
      @keyframes agn-zoom-out  { from{transform:scale(1.1)} to{transform:scale(1.0)} }
      @keyframes agn-drift     { 0%{transform:scale(1.05) translate(0,0)} 50%{transform:scale(1.05) translate(1.5%,0.5%)} 100%{transform:scale(1.05) translate(0,0)} }
      @keyframes agn-breathe   { 0%{transform:scale(1.0)} 50%{transform:scale(1.06)} 100%{transform:scale(1.0)} }
    `;

    var cardAnimCSS = '';
    var cardAnim = getCardAnim();
    if (cardAnim === 'veoveo' && perf !== 'ultra') {
      cardAnimCSS = `
        .card:focus-within .card__view,
        .card.hover .card__view,
        .card.focus .card__view {
          transform: perspective(600px) rotateY(5deg) rotateX(-3deg) scale(1.04);
          transition: transform 0.2s cubic-bezier(.22,.61,.36,1);
        }
      `;
    } else if (cardAnim === 'appletv' && perf !== 'ultra') {
      cardAnimCSS = `
        .card:focus-within .card__view,
        .card.hover .card__view,
        .card.focus .card__view {
          transform: perspective(800px) rotateY(4deg) rotateX(-2.5deg) scale(1.05) translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          transition: transform 0.22s cubic-bezier(.22,.61,.36,1), box-shadow 0.22s;
        }
      `;
    }

    // Poster border CSS
    var posterBorderCSS = posterBorderEnabled() ? `
      /* ── Mini poster border ─────────────────────────────────────────────── */
      .card__view,
      .card-full__poster img,
      .card-episode__img img {
        outline: 1.5px solid ${border};
        outline-offset: 0;
        border-radius: 5px;
        overflow: hidden;
      }
      .card__view img,
      .card-full__poster img {
        border-radius: 4px;
      }
      /* Focused/hovered card gets accent border */
      .card.hover .card__view,
      .card.focus .card__view,
      .card:focus-within .card__view {
        outline: 2px solid ${accent};
        outline-offset: 1px;
      }
    ` : '';

    return `
/* ═══════════════════════════════════════════════════════════════════════════
   AppleTV AgNative — CSS v${PLUGIN_VERSION}
   Performance mode: ${perf}
   ═══════════════════════════════════════════════════════════════════════════ */

${heroAnim}

/* ── Topnav shell ───────────────────────────────────────────────────────── */
.head.${AGNATIVE_KEYS.BODY_CLASS} {
  position: fixed !important;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0;
  height: var(--agnative-topnav-h, 60px);
  background: ${bgTopnav};
  ${perf !== 'ultra' ? `backdrop-filter: ${blurTopnav};` : ''}
  border-bottom: 1.5px solid ${border};
  box-shadow: 0 2px 18px rgba(0,0,0,0.45);
  transition: ${transNav};
}

.agnative-topnav-shell {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 1.2em;
  gap: 0.2em;
  box-sizing: border-box;
}

.agnative-topnav-shell__items {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 0.15em;
  overflow: hidden;
}

.agnative-topnav-shell__right {
  display: flex;
  align-items: center;
  gap: 0.3em;
  margin-left: auto;
  flex-shrink: 0;
}

.agnative-topnav-shell__item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.28em 0.8em;
  border-radius: 6px;
  font-size: 0.88em;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: ${text};
  opacity: 0.75;
  cursor: pointer;
  transition: ${transNav};
  white-space: nowrap;
  border: 1.5px solid transparent;
  outline: none;
  user-select: none;
  background: transparent;
  position: relative;
  will-change: ${willChange};
}

.agnative-topnav-shell__item:hover,
.agnative-topnav-shell__item.hover,
.agnative-topnav-shell__item.focus {
  opacity: 1;
  color: ${text};
  background: rgba(255,255,255,0.08);
  border-color: ${border};
}

/* ── Active nav item gets accent color (Lampa theme-aware) ─────────────── */
.agnative-topnav-shell__item.is-active,
.agnative-topnav-shell__item[data-selector="true"]:focus,
.agnative-topnav-shell__item.selector:focus {
  opacity: 1;
  color: ${accent};
  background: color-mix(in srgb, ${accent} 14%, transparent);
  border-color: color-mix(in srgb, ${accent} 40%, transparent);
  text-shadow: 0 0 12px color-mix(in srgb, ${accent} 50%, transparent);
}

/* ── Fallback for browsers without color-mix ───────────────────────────── */
@supports not (color: color-mix(in srgb, red, blue)) {
  .agnative-topnav-shell__item.is-active,
  .agnative-topnav-shell__item[data-selector="true"]:focus,
  .agnative-topnav-shell__item.selector:focus {
    background: rgba(232,69,69,0.14);
    border-color: rgba(232,69,69,0.4);
  }
}

.agnative-topnav-shell__item--icon {
  padding: 0.3em;
  width: 2.2em;
  height: 2.2em;
  border-radius: 50%;
}

.agnative-topnav-shell__item--icon svg {
  width: 1.15em;
  height: 1.15em;
  display: block;
  fill: currentColor;
  transition: fill 0.15s;
}

/* ── Clock widget ───────────────────────────────────────────────────────── */
.agnative-topnav-clock {
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-size: 0.82em;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${text};
  opacity: 0.85;
  cursor: pointer;
  padding: 0.25em 0.6em;
  border-radius: 5px;
  border: 1.5px solid transparent;
  transition: ${transNav};
  white-space: nowrap;
  flex-shrink: 0;
}
.agnative-topnav-clock:hover,
.agnative-topnav-clock.hover,
.agnative-topnav-clock.focus {
  opacity: 1;
  background: rgba(255,255,255,0.08);
  border-color: ${border};
  color: ${accent};
}

/* ── Top-nav sizes ──────────────────────────────────────────────────────── */
[data-agnative-topnav-size="xs"] .head.${AGNATIVE_KEYS.BODY_CLASS} { --agnative-topnav-h: 44px; font-size: 0.78em; }
[data-agnative-topnav-size="sm"] .head.${AGNATIVE_KEYS.BODY_CLASS} { --agnative-topnav-h: 52px; font-size: 0.85em; }
[data-agnative-topnav-size="md"] .head.${AGNATIVE_KEYS.BODY_CLASS} { --agnative-topnav-h: 60px; font-size: 0.9em; }
[data-agnative-topnav-size="lg"] .head.${AGNATIVE_KEYS.BODY_CLASS} { --agnative-topnav-h: 70px; font-size: 1em; }
[data-agnative-topnav-size="xl"] .head.${AGNATIVE_KEYS.BODY_CLASS} { --agnative-topnav-h: 80px; font-size: 1.1em; }

/* ── Left dock (Lampa left menu — theme-styled) ─────────────────────────── */
.agnative-leftdock {
  position: fixed;
  top: var(--agnative-topnav-h, 60px);
  left: 0;
  bottom: 0;
  width: var(--agnative-dock-w, 220px);
  z-index: 900;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${bgLeftdock};
  ${perf !== 'ultra' ? `backdrop-filter: ${blurLeftdock};` : ''}
  border-right: 1.5px solid ${border};
  box-shadow: 2px 0 24px rgba(0,0,0,0.5);
  transform: translateX(-100%);
  transition: transform 0.22s cubic-bezier(.4,0,.2,1);
  will-change: ${willChange};
  overflow-y: auto;
  scrollbar-width: none;
}
.agnative-leftdock::-webkit-scrollbar { display: none; }
.agnative-leftdock.is-visible {
  transform: translateX(0);
}

/* ── Left dock items ────────────────────────────────────────────────────── */
.agnative-leftdock__item {
  display: flex;
  align-items: center;
  gap: 0.7em;
  padding: 0.65em 1.1em;
  font-size: 0.9em;
  font-weight: 500;
  color: ${text};
  opacity: 0.72;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: ${transNav};
  white-space: nowrap;
  user-select: none;
  outline: none;
  background: transparent;
  position: relative;
}
.agnative-leftdock__item:hover,
.agnative-leftdock__item.hover {
  opacity: 1;
  background: rgba(255,255,255,0.06);
  border-left-color: rgba(255,255,255,0.2);
}

/* ── Active dock item — Lampa accent ────────────────────────────────────── */
.agnative-leftdock__item.is-active,
.agnative-leftdock__item.focus {
  opacity: 1;
  color: ${accent};
  background: color-mix(in srgb, ${accent} 12%, transparent);
  border-left-color: ${accent};
  font-weight: 600;
}

@supports not (color: color-mix(in srgb, red, blue)) {
  .agnative-leftdock__item.is-active,
  .agnative-leftdock__item.focus {
    background: rgba(232,69,69,0.12);
    border-left-color: ${accent};
  }
}

.agnative-leftdock__item svg {
  width: 1.15em;
  height: 1.15em;
  flex-shrink: 0;
  fill: currentColor;
  opacity: 0.9;
}

.agnative-leftdock__divider {
  height: 1px;
  margin: 0.35em 0.8em;
  background: ${border};
  opacity: 0.6;
}

.agnative-leftdock__section-title {
  font-size: 0.68em;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${textSec};
  padding: 0.7em 1.1em 0.2em;
  opacity: 0.6;
}

/* ── Right dock / settings panel ───────────────────────────────────────── */
.agnative-control-panel {
  position: fixed;
  top: var(--agnative-topnav-h, 60px);
  right: 0;
  z-index: 950;
  min-width: 220px;
  max-width: 320px;
  background: ${bgLeftdock};
  ${perf !== 'ultra' ? `backdrop-filter: ${blurLeftdock};` : ''}
  border-left: 1.5px solid ${border};
  border-bottom: 1.5px solid ${border};
  border-radius: 0 0 0 10px;
  box-shadow: -4px 4px 24px rgba(0,0,0,0.5);
  transform: translateY(-110%);
  transition: transform 0.22s cubic-bezier(.4,0,.2,1);
  will-change: ${willChange};
  overflow: hidden;
}
.agnative-control-panel.is-open {
  transform: translateY(0);
}
.agnative-control-panel__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5em;
  padding: 0.8em;
}
.agnative-control-panel__tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
  padding: 0.7em 0.5em;
  border-radius: 8px;
  font-size: 0.78em;
  font-weight: 500;
  color: ${text};
  opacity: 0.8;
  cursor: pointer;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid ${border};
  transition: ${transNav};
  text-align: center;
  outline: none;
  user-select: none;
}
.agnative-control-panel__tile:hover,
.agnative-control-panel__tile.hover,
.agnative-control-panel__tile.focus {
  opacity: 1;
  background: color-mix(in srgb, ${accent} 14%, transparent);
  border-color: color-mix(in srgb, ${accent} 45%, transparent);
  color: ${text};
}
@supports not (color: color-mix(in srgb, red, blue)) {
  .agnative-control-panel__tile:hover,
  .agnative-control-panel__tile.hover,
  .agnative-control-panel__tile.focus {
    background: rgba(232,69,69,0.14);
    border-color: rgba(232,69,69,0.45);
  }
}
.agnative-control-panel__tile svg {
  width: 1.4em;
  height: 1.4em;
  fill: currentColor;
  display: block;
}

/* ── Hero banner ────────────────────────────────────────────────────────── */
.agnative-hero {
  position: relative;
  width: 100%;
  overflow: hidden;
  margin-top: var(--agnative-topnav-h, 60px);
  background: #000;
}
.agnative-hero__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center top;
  ${perf !== 'ultra' ? `filter: ${blurHero};` : ''}
  transform-origin: center center;
}
.agnative-hero__bg.anim-pan_down  { animation: agn-pan-down  linear forwards; }
.agnative-hero__bg.anim-pan_up    { animation: agn-pan-up    linear forwards; }
.agnative-hero__bg.anim-zoom_in   { animation: agn-zoom-in   linear forwards; }
.agnative-hero__bg.anim-zoom_out  { animation: agn-zoom-out  linear forwards; }
.agnative-hero__bg.anim-drift     { animation: agn-drift     ease-in-out infinite; }
.agnative-hero__bg.anim-breathe   { animation: agn-breathe   ease-in-out infinite; }
.agnative-hero__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.18) 0%,
    rgba(0,0,0,0.0)  30%,
    rgba(0,0,0,0.0)  50%,
    rgba(0,0,0,0.75) 80%,
    rgba(0,0,0,0.95) 100%
  );
}
.agnative-hero__content {
  position: absolute;
  left: 0; right: 0;
  bottom: 0;
  padding: 1.5em 2em 1.8em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
[data-agnative-hero-align="top"] .agnative-hero__content {
  top: 0; bottom: auto;
  padding-top: 1.8em;
}
[data-agnative-hero-align="center"] .agnative-hero__content {
  top: 50%; transform: translateY(-50%);
}
.agnative-hero__logo {
  max-width: 55%;
  max-height: 90px;
  object-fit: contain;
  object-position: left bottom;
  ${perf !== 'ultra' ? 'filter: drop-shadow(0 2px 12px rgba(0,0,0,0.7));' : ''}
}
.agnative-hero__title {
  font-size: 1.6em;
  font-weight: 700;
  color: #fff;
  ${perf !== 'ultra' ? 'text-shadow: 0 2px 10px rgba(0,0,0,0.8);' : ''}
  line-height: 1.2;
  max-width: 65%;
}
.agnative-hero__overview {
  font-size: 0.82em;
  color: rgba(255,255,255,0.78);
  max-width: 55%;
  display: -webkit-box;
  -webkit-line-clamp: ${perf === 'ultra' ? '2' : '3'};
  -webkit-box-orient: vertical;
  overflow: hidden;
  ${perf !== 'ultra' ? 'text-shadow: 0 1px 5px rgba(0,0,0,0.7);' : ''}
}
.agnative-hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.45em 1.2em;
  border-radius: 5px;
  background: ${accent};
  color: #fff;
  font-size: 0.85em;
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
  border: none;
  outline: none;
  transition: ${transNav};
  user-select: none;
}
.agnative-hero__btn:hover { opacity: 0.88; transform: scale(1.03); }
.agnative-hero__indicators {
  display: flex;
  gap: 0.35em;
  margin-top: 0.3em;
}
.agnative-hero__ind {
  height: 3px;
  border-radius: 2px;
  flex: 1;
  max-width: 40px;
  background: rgba(255,255,255,0.3);
  cursor: pointer;
  transition: background 0.2s;
}
.agnative-hero__ind.is-active { background: ${accent}; }
.agnative-hero__ind:hover { background: rgba(255,255,255,0.6); }

/* ── Card overlays ──────────────────────────────────────────────────────── */
.nfx-card-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 0.5em 0.5em 0.45em;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.0) 100%);
  display: flex;
  flex-direction: column;
  gap: 0.18em;
  z-index: 2;
  pointer-events: none;
}
.nfx-card-overlay__title {
  font-size: 0.8em;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${perf !== 'ultra' ? 'text-shadow: 0 1px 4px rgba(0,0,0,0.9);' : ''}
}
[data-agnative-overlay-align="center"] .nfx-card-overlay { text-align: center; align-items: center; }
[data-agnative-overlay-align="end"]    .nfx-card-overlay { text-align: right;  align-items: flex-end; }
.nfx-card-overlay__logo {
  max-width: 80%;
  max-height: 2.8em;
  object-fit: contain;
  object-position: left bottom;
}
[data-agnative-overlay-align="center"] .nfx-card-overlay__logo { object-position: center bottom; }
[data-agnative-overlay-align="end"]    .nfx-card-overlay__logo { object-position: right bottom; }
.nfx-card-overlay__local-title {
  font-size: 0.65em;
  color: rgba(255,255,255,0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nfx-card-overlay__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2em;
  align-items: center;
}
.nfx-card-overlay__meta-item {
  font-size: 0.68em;
  color: rgba(255,255,255,0.72);
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  padding: 0.1em 0.35em;
  white-space: nowrap;
}

/* ── Card badges ────────────────────────────────────────────────────────── */
.nfx-card-logo {
  position: absolute;
  top: 5px; left: 5px;
  font-size: 0.58em;
  font-weight: 800;
  letter-spacing: 0.07em;
  padding: 0.15em 0.45em;
  border-radius: 3px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  z-index: 3;
  pointer-events: none;
}
[data-agnative-badge="true"] .nfx-card-logo { display: block; }

/* ── Card rating ────────────────────────────────────────────────────────── */
.nfx-card-rating {
  position: absolute;
  top: 5px; right: 5px;
  font-size: 0.68em;
  font-weight: 700;
  padding: 0.15em 0.42em;
  border-radius: 4px;
  background: rgba(0,0,0,0.65);
  color: #fff;
  z-index: 3;
  pointer-events: none;
}
.nfx-card-rating[data-score="8"],
.nfx-card-rating[data-score="9"],
.nfx-card-rating[data-score="10"] {
  background: #1db954;
  color: #fff;
}
.nfx-card-rating[data-score="6"],
.nfx-card-rating[data-score="7"] {
  background: #f0a500;
  color: #111;
}
.nfx-card-rating[data-score="1"],
.nfx-card-rating[data-score="2"],
.nfx-card-rating[data-score="3"],
.nfx-card-rating[data-score="4"],
.nfx-card-rating[data-score="5"] {
  background: #c0392b;
  color: #fff;
}
[data-agnative-rating-style="mono"] .nfx-card-rating {
  background: rgba(0,0,0,0.65) !important;
  color: #fff !important;
}

/* ── Poster mini border ─────────────────────────────────────────────────── */
${posterBorderCSS}

/* ── Episode cards ──────────────────────────────────────────────────────── */
.nfx-episode-title {
  font-size: 0.78em;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.15em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nfx-episode-logo {
  max-width: 75%;
  max-height: 2.4em;
  object-fit: contain;
  object-position: left;
  display: block;
}

/* ── Card sizes ─────────────────────────────────────────────────────────── */
[data-agnative-card-size="xs"] .card { flex: 0 0 120px; }
[data-agnative-card-size="sm"] .card { flex: 0 0 150px; }
[data-agnative-card-size="md"] .card { flex: 0 0 175px; }
[data-agnative-card-size="lg"] .card { flex: 0 0 210px; }
[data-agnative-card-size="xl"] .card { flex: 0 0 250px; }

/* ── Category title sizes ───────────────────────────────────────────────── */
[data-agnative-category="xs"] .category-title { font-size: 0.7em; }
[data-agnative-category="sm"] .category-title { font-size: 0.85em; }
[data-agnative-category="md"] .category-title { font-size: 1em; }
[data-agnative-category="lg"] .category-title { font-size: 1.2em; }
[data-agnative-category="xl"] .category-title { font-size: 1.4em; }

/* ── Font sizes ─────────────────────────────────────────────────────────── */
[data-agnative-font="xs"] { font-size: 12px; }
[data-agnative-font="sm"] { font-size: 14px; }
[data-agnative-font="md"] { font-size: 16px; }
[data-agnative-font="lg"] { font-size: 18px; }
[data-agnative-font="xl"] { font-size: 20px; }

/* ── Glare ──────────────────────────────────────────────────────────────── */
${perf !== 'ultra' && glareEnabled() ? `
.appletv-agnative-topnav-glare {
  pointer-events: none;
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 70%);
  z-index: 1;
}
` : ''}

/* ── Card animation ─────────────────────────────────────────────────────── */
${cardAnimCSS}

/* ── Body top padding when topnav shown ─────────────────────────────────── */
body.has-agnative-topnav .menu,
body.has-agnative-topnav .wrap__left {
  top: var(--agnative-topnav-h, 60px) !important;
}

/* ── Settings hide ──────────────────────────────────────────────────────── */
body[data-agnative-hide-settings] .settings__item--hidden { display: none !important; }

/* ── Back button in filter ──────────────────────────────────────────────── */
.agnative-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  cursor: pointer;
  padding: 0.25em 0.6em;
  border-radius: 5px;
  color: ${text};
  opacity: 0.75;
  font-size: 0.85em;
  transition: opacity 0.15s;
}
.agnative-back-btn:hover { opacity: 1; }

/* ── ATV9 / Ultra perf overrides ────────────────────────────────────────── */
${perf === 'ultra' ? `
  * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
  .agnative-hero__bg,
  .agnative-control-panel,
  .agnative-leftdock { transition: none !important; will-change: auto !important; }
  /* Re-enable critical transitions */
  .agnative-leftdock { transition: transform 0.18s ease !important; }
  .agnative-control-panel { transition: transform 0.18s ease !important; }
` : ''}
`;
  }

  // ─── SVG icons ───────────────────────────────────────────────────────────────
  function iconSearch() {
    return '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';
  }
  function iconFavorite() {
    return '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
  }
  function iconSettings() {
    return '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';
  }
  function iconSync() {
    return '<svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>';
  }
  function iconPlayer() {
    return '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  }
  function iconCache() {
    return '<svg viewBox="0 0 24 24"><path d="M6 2v6l2 2-2 2v6l6-4 6 4v-6l-2-2 2-2V2l-6 4-6-4z"/></svg>';
  }
  function iconBack() {
    return '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';
  }
  function iconMenu() {
    return '<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>';
  }

  // ─── State variables ──────────────────────────────────────────────────────────
  var clockInterval         = null;
  var cardPatchTimer        = 0;
  var pendingCardNodes       = [];
  var topnavControllerReady = false;
  var menuControllerNeutralized = false;
  var activityPushPatched   = false;
  var activityPushOriginal  = null;
  var controlPanelOpen      = false;
  var controlPanelPrevController = '';
  var leftdockHoverHideTimer = 0;
  var settingsLifecycleObserver = null;
  var heroPoll              = null;
  var heroTimerID           = null;
  var heroCurrentIndex      = 0;
  var heroItems             = [];
  var heroVideoEl           = null;
  var heroIdleTimer         = null;
  var heroTrailerActive     = false;
  var genreCache            = {};
  var imageCache            = {};
  var imageCacheOrder       = [];
  var logoCache             = {};

  // ─── Cache helpers ────────────────────────────────────────────────────────────
  function getCacheSize() {
    return parseInt(storeGet(AGNATIVE_KEYS.CACHE_SIZE_KEY, '200')) || 200;
  }
  function cacheImage(url, blobUrl) {
    if (imageCacheOrder.length >= getCacheSize()) {
      var oldest = imageCacheOrder.shift();
      if (imageCache[oldest]) {
        try { URL.revokeObjectURL(imageCache[oldest]); } catch(e) {}
        delete imageCache[oldest];
      }
    }
    imageCache[url] = blobUrl;
    imageCacheOrder.push(url);
  }

  function imgLoad(url, cb) {
    if (!url) return;
    if (imageCache[url]) { cb(imageCache[url]); return; }
    // Skip blob fetch for ultra/low perf — just use URL directly
    if (isUltra || isMedium) { cb(url); return; }
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
          var blobUrl = URL.createObjectURL(xhr.response);
          cacheImage(url, blobUrl);
          cb(blobUrl);
        } else {
          cb(url);
        }
      };
      xhr.onerror = function () { cb(url); };
      xhr.send();
    } catch(e) { cb(url); }
  }

  // ─── TMDB helpers ─────────────────────────────────────────────────────────────
  function tmdbImg(path) {
    if (!path) return '';
    if (window.Lampa && Lampa.TMDB && Lampa.TMDB.image) return Lampa.TMDB.image(path);
    return 'https://image.tmdb.org/t/p/' + path;
  }

  function fetchLogoFromTMDB(id, type, lang, cb) {
    var key = id + '_' + type + '_' + lang;
    if (logoCache[key] !== undefined) { cb(logoCache[key]); return; }
    var apiKey = AGNATIVE_KEYS.TMDB_KEY;
    var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/images?api_key=' + apiKey + '&include_image_language=' + lang + ',null,en';
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            var logos = (data.logos || []).filter(function (l) { return l.file_path; });
            var best = logos.find(function (l) { return l.iso_639_1 === lang; }) ||
                       logos.find(function (l) { return l.iso_639_1 === 'en'; }) ||
                       logos[0] || null;
            logoCache[key] = best ? { path: best.file_path, iso_639_1: best.iso_639_1 } : null;
            cb(logoCache[key]);
          } catch (e) { logoCache[key] = null; cb(null); }
        } else { logoCache[key] = null; cb(null); }
      };
      xhr.onerror = function () { logoCache[key] = null; cb(null); };
      xhr.send();
    } catch(e) { logoCache[key] = null; cb(null); }
  }

  function fetchLogo(id, type, cb) {
    if (!id || isUltra) { cb(null); return; }
    fetchLogoFromTMDB(id, type, getLogoLang(), cb);
  }

  function fetchTitledBackdrop(id, type, cb) {
    if (!id || isUltra) { cb(null); return; }
    var apiKey = AGNATIVE_KEYS.TMDB_KEY;
    var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/images?api_key=' + apiKey + '&include_image_language=en,null';
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            var bd = (data.backdrops || []).find(function (b) { return b.file_path; });
            cb(bd ? bd.file_path : null);
          } catch(e) { cb(null); }
        } else { cb(null); }
      };
      xhr.onerror = function () { cb(null); };
      xhr.send();
    } catch(e) { cb(null); }
  }

  function fetchGenres(type, cb) {
    if (genreCache[type]) { cb(genreCache[type]); return; }
    var apiKey = AGNATIVE_KEYS.TMDB_KEY;
    var lang = getLogoLang();
    var url = 'https://api.themoviedb.org/3/genre/' + type + '/list?api_key=' + apiKey + '&language=' + lang;
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            genreCache[type] = data.genres || [];
            cb(genreCache[type]);
          } catch(e) { cb([]); }
        } else { cb([]); }
      };
      xhr.onerror = function () { cb([]); };
      xhr.send();
    } catch(e) { cb([]); }
  }

  function getGenreNames(data) {
    if (!data) return [];
    if (data.genres && Array.isArray(data.genres)) return data.genres.map(function (g) { return g.name; });
    if (data.genre_ids && Array.isArray(data.genre_ids)) {
      var type = data.name ? 'tv' : 'movie';
      var map = genreCache[type] || [];
      return data.genre_ids.slice(0, 2).map(function (id) {
        var g = map.find(function (g) { return g.id === id; });
        return g ? g.name : '';
      }).filter(Boolean);
    }
    return [];
  }

  // ─── Menu helpers ─────────────────────────────────────────────────────────────
  function getMenuItems() {
    var menu = qs('.menu');
    if (!menu) return [];
    return qsa('.menu__item', menu);
  }

  function getMenuItem(action) {
    var items = getMenuItems();
    for (var i = 0; i < items.length; i++) {
      var a = items[i].getAttribute('data-action') || items[i].dataset.action || '';
      if (a === action) return items[i];
    }
    return null;
  }

  function clickNode(node) {
    if (!node) return;
    try {
      if (window.$ && $(node).triggerHandler) {
        $(node).trigger('hover:enter');
        return;
      }
    } catch(e) {}
    node.click();
  }

  function triggerMenuAction(action) {
    var node = getMenuItem(action);
    if (node) { clickNode(node); return true; }
    return false;
  }

  function triggerSearch() {
    try {
      if (window.Lampa && Lampa.Activity) {
        var found = triggerMenuAction('search');
        if (!found) Lampa.Activity.push({ component: 'search' });
      }
    } catch(e) {}
  }

  function triggerFavorite() {
    try { triggerMenuAction('favorite'); } catch(e) {}
  }

  function triggerSettings() {
    try {
      if (window.Lampa && Lampa.Activity) {
        Lampa.Activity.push({ component: 'settings', onBack: function () {
          try { Lampa.Activity.backward(); } catch(e) {}
        }});
      }
    } catch(e) {}
  }

  // ─── Topnav items config ──────────────────────────────────────────────────────
  var DEFAULT_TOPNAV_ITEMS = [
    { action: 'main',        label: 'Главная' },
    { action: 'feed',        label: 'Лента' },
    { action: 'catalog',     label: 'Каталог' },
    { action: 'collections', label: 'Подборки' },
    { action: 'relax',       label: 'Расслабься' },
  ];

  function getSelectedTopnavItems() {
    try {
      var stored = storeGet(AGNATIVE_KEYS.TOPNAV_ITEMS_KEY, '');
      if (stored) {
        var arr = JSON.parse(stored);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch(e) {}
    return DEFAULT_TOPNAV_ITEMS.slice();
  }

  function getAllPossibleTopnavItems() {
    var menuItems = getMenuItems();
    if (!menuItems.length) return DEFAULT_TOPNAV_ITEMS.slice();
    return menuItems.map(function (el) {
      var action = el.getAttribute('data-action') || '';
      var labelEl = el.querySelector('.menu__item-title') || el.querySelector('span') || el;
      var label = labelEl.textContent.trim();
      return { action: action, label: label };
    }).filter(function (i) { return i.action; });
  }

  // ─── Clock ────────────────────────────────────────────────────────────────────
  function formatTime(d, withSec) {
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    if (withSec) {
      var s = String(d.getSeconds()).padStart(2, '0');
      return h + ':' + m + ':' + s;
    }
    return h + ':' + m;
  }

  function updateClock() {
    var el = document.getElementById(AGNATIVE_KEYS.CLOCK_ID);
    if (!el) return;
    el.textContent = formatTime(new Date(), clockSecondsEnabled());
  }

  function startClock() {
    stopClock();
    updateClock();
    // Use 1-second interval only if needed, else sync to minute
    var interval = clockSecondsEnabled() ? 1000 : 10000;
    clockInterval = setInterval(updateClock, interval);
  }

  function stopClock() {
    if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
  }

  // ─── Control panel ────────────────────────────────────────────────────────────
  var CONTROL_PANEL_DEFS = [
    { icon: iconSettings(), title: 'Settings',    handler: triggerSettings },
    { icon: iconSync(),     title: 'Sync',        handler: function () {
      try { if (window.Lampa && Lampa.Sync) Lampa.Sync.start(); } catch(e) {}
    }},
    { icon: iconPlayer(),   title: 'Player',      handler: function () {
      try { triggerMenuAction('player'); } catch(e) {}
    }},
    { icon: iconCache(),    title: 'Cache',       handler: function () {
      try {
        if (window.Lampa && Lampa.Activity) Lampa.Activity.push({ component: 'cache' });
      } catch(e) {}
    }},
  ];

  function buildControlPanel(anchor) {
    var existing = qs('.agnative-control-panel');
    if (existing) return existing;
    var panel = document.createElement('div');
    panel.className = 'agnative-control-panel';
    panel.setAttribute('aria-hidden', 'true');
    var grid = document.createElement('div');
    grid.className = 'agnative-control-panel__grid';
    panel.appendChild(grid);
    CONTROL_PANEL_DEFS.forEach(function (def) {
      var tile = document.createElement('div');
      tile.className = 'agnative-control-panel__tile selector';
      tile.setAttribute('tabindex', '0');
      tile.innerHTML = def.icon + '<span>' + escapeHtml(def.title) + '</span>';
      bindAction(tile, function () { closeControlPanel(true); def.handler(); });
      grid.appendChild(tile);
    });
    registerControlPanelController(panel);
    (anchor || document.body).appendChild(panel);
    return panel;
  }

  function registerControlPanelController(panel) {
    if (!window.Lampa || !Lampa.Controller || !window.$) return;
    try {
      Lampa.Controller.add('agnative_control_panel', {
        toggle: function () {
          var tiles = panel.querySelectorAll('.selector');
          var view = $(panel);
          Lampa.Controller.collectionSet(view);
          Lampa.Controller.collectionFocus(tiles[0] || false, view, true);
        },
        update: function () {},
        left:   function () { if (window.Navigator && Navigator.move) Navigator.move('left'); },
        right:  function () { if (window.Navigator && Navigator.move) Navigator.move('right'); },
        up:     function () { if (window.Navigator && Navigator.move) Navigator.move('up'); },
        down:   function () {
          if (window.Navigator && Navigator.canmove && Navigator.canmove('down')) {
            Navigator.move('down'); return;
          }
          closeControlPanel(true);
        },
        back:   function () { closeControlPanel(true); },
      });
    } catch(e) {}
  }

  function openControlPanel(anchor) {
    if (controlPanelOpen) return;
    var panel = buildControlPanel(anchor);
    controlPanelOpen = true;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    try {
      if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.enabled === 'function') {
        var cur = Lampa.Controller.enabled();
        controlPanelPrevController = (cur && cur.name) ? cur.name : '';
      }
      if (window.Lampa && Lampa.Controller) Lampa.Controller.toggle('agnative_control_panel');
    } catch(e) {}
    document.addEventListener('click', closeOnOutside, true);
  }

  function closeControlPanel(restore) {
    if (!controlPanelOpen) return;
    var panel = qs('.agnative-control-panel');
    controlPanelOpen = false;
    if (panel) {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    }
    document.removeEventListener('click', closeOnOutside, true);
    if (restore && controlPanelPrevController) {
      try { if (window.Lampa && Lampa.Controller) Lampa.Controller.toggle(controlPanelPrevController); } catch(e) {}
    }
  }

  function closeOnOutside(e) {
    var panel = qs('.agnative-control-panel');
    if (!panel) return;
    if (!panel.contains(e.target)) closeControlPanel(true);
  }

  function triggerClockClick(anchor) {
    if (!controlPanelEnabled()) return;
    if (controlPanelOpen) closeControlPanel(true);
    else openControlPanel(anchor);
  }

  // ─── bindAction / bindMenu ────────────────────────────────────────────────────
  function bindAction(btn, fn) {
    if (!btn || !fn) return;
    var busy = false;
    function run(e) {
      if (busy) return;
      busy = true;
      setTimeout(function () { busy = false; }, 180);
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      fn();
    }
    btn.addEventListener('click', run);
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') run(e);
    });
    btn.addEventListener('mouseenter', function () { btn.classList.add('hover'); });
    btn.addEventListener('mouseleave', function () { btn.classList.remove('hover'); });
    if (window.$) {
      try {
        $(btn).off('.agnAction');
        $(btn).on('hover:enter.agnAction', run);
        $(btn).on('hover:focus.agnAction hover:hover.agnAction', function () { btn.classList.add('focus'); });
        $(btn).on('hover:blur.agnAction hover:out.agnAction', function () { btn.classList.remove('focus'); });
      } catch(e) {}
    }
  }

  function bindMenu(btn, action, sourceNode) {
    if (!btn) return;
    var busy = false;
    function run(e) {
      if (busy) return;
      busy = true;
      setTimeout(function () { busy = false; }, 180);
      if (e && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      if (action && triggerMenuAction(action)) return;
      if (sourceNode) clickNode(sourceNode);
    }
    btn.addEventListener('click', run);
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') run(e);
    });
    btn.addEventListener('mouseenter', function () { btn.classList.add('hover'); });
    btn.addEventListener('mouseleave', function () { btn.classList.remove('hover'); });
    if (window.$) {
      try {
        $(btn).off('.agnMenu');
        $(btn).on('hover:enter.agnMenu', run);
        $(btn).on('hover:focus.agnMenu hover:hover.agnMenu', function () { btn.classList.add('focus'); });
        $(btn).on('hover:blur.agnMenu hover:out.agnMenu', function () { btn.classList.remove('focus'); });
      } catch(e) {}
    }
  }

  // ─── Topnav shell ─────────────────────────────────────────────────────────────
  function buildTopnavShell() {
    if (!topnavVisible()) return false;
    var head = qs('.head');
    if (!head) return false;
    head.classList.add(AGNATIVE_KEYS.BODY_CLASS);
    document.body.classList.add('has-agnative-topnav');
    document.documentElement.setAttribute(AGNATIVE_KEYS.TOPNAV_SIZE_ATTR, getTopnavSize());

    var shell = qs('.agnative-topnav-shell', head);
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'agnative-topnav-shell';
      shell.innerHTML =
        '<div class="agnative-topnav-shell__items"></div>' +
        '<div class="agnative-topnav-shell__right"></div>';
    }
    if (!head.contains(shell)) head.insertBefore(shell, head.firstChild);

    var itemsWrap = qs('.agnative-topnav-shell__items', shell);
    var rightWrap = qs('.agnative-topnav-shell__right', shell);
    if (!itemsWrap || !rightWrap) return false;

    itemsWrap.innerHTML = '';
    rightWrap.innerHTML = '';

    // Build icon button helper
    function mkIconBtn(role, svg, handler) {
      var btn = document.createElement('div');
      btn.className = 'agnative-topnav-shell__item agnative-topnav-shell__item--icon selector';
      btn.setAttribute('data-role', role);
      btn.setAttribute('tabindex', '0');
      btn.innerHTML = svg;
      bindAction(btn, handler);
      return btn;
    }

    // Add text menu items
    getSelectedTopnavItems().forEach(function (def) {
      var src = getMenuItem(def.action);
      var btn = document.createElement('div');
      btn.className = 'agnative-topnav-shell__item selector';
      btn.setAttribute('data-action', def.action);
      btn.setAttribute('tabindex', '0');
      btn.textContent = def.label;
      bindMenu(btn, def.action, src);
      itemsWrap.appendChild(btn);
    });

    // Icon placement
    var order = getTopnavIconsOrder();
    var searchBtn   = mkIconBtn('search',   iconSearch(),   triggerSearch);
    var favoriteBtn = mkIconBtn('favorite', iconFavorite(), triggerFavorite);

    if (order === 'start') {
      itemsWrap.insertBefore(favoriteBtn, itemsWrap.firstChild);
      itemsWrap.insertBefore(searchBtn,   itemsWrap.firstChild);
    } else if (order === 'split') {
      itemsWrap.insertBefore(searchBtn, itemsWrap.firstChild);
      rightWrap.appendChild(favoriteBtn);
    } else {
      rightWrap.appendChild(searchBtn);
      rightWrap.appendChild(favoriteBtn);
    }

    // Settings icon (when no clock panel)
    if (!controlPanelEnabled()) {
      rightWrap.appendChild(mkIconBtn('settings', iconSettings(), triggerSettings));
    }

    // Clock
    var clockEl = document.createElement('div');
    clockEl.className = 'agnative-topnav-clock selector';
    clockEl.id = AGNATIVE_KEYS.CLOCK_ID;
    clockEl.setAttribute('tabindex', '0');
    bindAction(clockEl, function () { triggerClockClick(document.body); });
    rightWrap.appendChild(clockEl);

    // Glare
    if (glareEnabled() && !isUltra) {
      var glare = document.createElement('div');
      glare.className = AGNATIVE_KEYS.GLARE_CLASS;
      shell.appendChild(glare);
    }

    registerTopnavController(shell);
    startClock();
    syncTopnavActive();
    return true;
  }

  function syncTopnavActive() {
    var shell = qs('.agnative-topnav-shell');
    if (!shell) return;
    qsa('[data-action]', shell).forEach(function (btn) {
      var action = btn.getAttribute('data-action');
      var src = getMenuItem(action);
      btn.classList.toggle('is-active', !!(src && (
        src.classList.contains('active') ||
        src.classList.contains('focus') ||
        src.classList.contains('hover')
      )));
    });
  }

  // ─── Topnav Lampa controller ──────────────────────────────────────────────────
  function registerTopnavController(shell) {
    if (topnavControllerReady || !window.Lampa || !Lampa.Controller || !window.$) return;
    if (typeof Lampa.Controller.add !== 'function') return;
    topnavControllerReady = true;
    try {
      Lampa.Controller.add('head', {
        toggle: function () {
          var headEl = qs('.head__body') || qs('.head');
          if (!headEl) return;
          var view = $(headEl);
          var first = qs('.agnative-topnav-shell__item.selector', headEl) || qs('.selector', headEl);
          Lampa.Controller.collectionSet(view);
          Lampa.Controller.collectionFocus(first || false, view, true);
        },
        update: function () {},
        left: function () {
          if (window.Navigator && Navigator.canmove && !Navigator.canmove('left')) {
            try { Lampa.Controller.toggle('agnative_leftdock'); } catch(e) {}
            return;
          }
          if (window.Navigator && Navigator.move) Navigator.move('left');
        },
        right: function () {
          if (window.Navigator && Navigator.move) Navigator.move('right');
        },
        up: function () {},
        down: function () {
          if (window.Navigator && Navigator.canmove && Navigator.canmove('down')) {
            Navigator.move('down'); return;
          }
          try { Lampa.Controller.toggle('content'); } catch(e) {}
        },
        back: function () {
          try { Lampa.Controller.toggle('agnative_leftdock'); } catch(e) {}
        },
      });
    } catch(e) { topnavControllerReady = false; }
  }

  // ─── Left dock ────────────────────────────────────────────────────────────────
  function buildLeftDock() {
    var existing = qs('.agnative-leftdock');
    if (existing) return existing;

    var dock = document.createElement('div');
    dock.className = 'agnative-leftdock';

    var items = getAllPossibleTopnavItems();
    if (!items.length) items = DEFAULT_TOPNAV_ITEMS.slice();

    items.forEach(function (def) {
      var src = getMenuItem(def.action);
      var item = document.createElement('div');
      item.className = 'agnative-leftdock__item selector';
      item.setAttribute('data-action', def.action);
      item.setAttribute('tabindex', '0');
      item.textContent = def.label;
      bindMenu(item, def.action, src);
      // Hover open
      item.addEventListener('mouseenter', function () {
        item.classList.add('hover');
        showLeftdock();
      });
      item.addEventListener('mouseleave', function () {
        item.classList.remove('hover');
        hideLeftdock(false);
      });
      dock.appendChild(item);
    });

    // Hover trigger for the dock itself
    dock.addEventListener('mouseenter', function () { showLeftdock(); });
    dock.addEventListener('mouseleave', function () { hideLeftdock(false); });

    document.body.appendChild(dock);

    registerLeftdockController(dock);
    return dock;
  }

  function registerLeftdockController(dock) {
    if (!window.Lampa || !Lampa.Controller || !window.$) return;
    try {
      Lampa.Controller.add('agnative_leftdock', {
        toggle: function () {
          showLeftdock();
          var view = $(dock);
          var first = dock.querySelector('.selector');
          Lampa.Controller.collectionSet(view);
          Lampa.Controller.collectionFocus(first || false, view, true);
        },
        update: function () {},
        left:   function () {
          if (window.Navigator && Navigator.canmove && !Navigator.canmove('left')) {
            hideLeftdock(true);
            try { Lampa.Controller.toggle('content'); } catch(e) {}
            return;
          }
          if (window.Navigator && Navigator.move) Navigator.move('left');
        },
        right:  function () {
          hideLeftdock(true);
          try { Lampa.Controller.toggle('content'); } catch(e) {}
        },
        up:     function () {
          if (window.Navigator && Navigator.move) Navigator.move('up');
        },
        down:   function () {
          if (window.Navigator && Navigator.move) Navigator.move('down');
        },
        back:   function () {
          hideLeftdock(true);
          try { Lampa.Controller.toggle('content'); } catch(e) {}
        },
      });
    } catch(e) {}
  }

  function neutralizeMenuController() {
    if (menuControllerNeutralized) return;
    if (!window.Lampa || !Lampa.Controller || typeof Lampa.Controller.add !== 'function') return;
    menuControllerNeutralized = true;
    try {
      Lampa.Controller.add('menu', {
        toggle: function () { try { Lampa.Controller.toggle('agnative_leftdock'); } catch(e) {} },
        update: function () {},
        left:   function () { try { Lampa.Controller.toggle('agnative_leftdock'); } catch(e) {} },
        right:  function () { try { Lampa.Controller.toggle('content'); } catch(e) {} },
        up:     function () { try { Lampa.Controller.toggle('agnative_leftdock'); } catch(e) {} },
        down:   function () { try { Lampa.Controller.toggle('content'); } catch(e) {} },
        back:   function () { try { Lampa.Controller.toggle('content'); } catch(e) {} },
      });
    } catch(e) { menuControllerNeutralized = false; }
  }

  function patchActivityPush() {
    if (activityPushPatched) return;
    if (!window.Lampa || !Lampa.Activity || typeof Lampa.Activity.push !== 'function') return;
    activityPushPatched = true;
    try {
      activityPushOriginal = Lampa.Activity.push.bind(Lampa.Activity);
      Lampa.Activity.push = function (params) {
        if (params && params.component === 'menu') {
          try { Lampa.Controller.toggle('agnative_leftdock'); } catch(e) {}
          return;
        }
        return activityPushOriginal(params);
      };
    } catch(e) { activityPushPatched = false; }
  }

  function showLeftdock() {
    var dock = qs('.agnative-leftdock');
    if (!dock) return;
    if (leftdockHoverHideTimer) { clearTimeout(leftdockHoverHideTimer); leftdockHoverHideTimer = 0; }
    dock.classList.add('is-visible');
  }

  function hideLeftdock(immediate, force) {
    var dock = qs('.agnative-leftdock');
    if (!dock) return;
    if (!force && window.Lampa && Lampa.Controller && typeof Lampa.Controller.enabled === 'function') {
      var en = Lampa.Controller.enabled();
      if (en && en.name === 'agnative_leftdock') return;
    }
    if (immediate) {
      if (leftdockHoverHideTimer) { clearTimeout(leftdockHoverHideTimer); leftdockHoverHideTimer = 0; }
      dock.classList.remove('is-visible');
      return;
    }
    if (leftdockHoverHideTimer) clearTimeout(leftdockHoverHideTimer);
    leftdockHoverHideTimer = setTimeout(function () {
      dock.classList.remove('is-visible');
      leftdockHoverHideTimer = 0;
    }, 220);
  }

  function syncLeftdockActive() {
    var dock = qs('.agnative-leftdock');
    if (!dock) return;
    qsa('[data-action]', dock).forEach(function (item) {
      var action = item.getAttribute('data-action');
      var src = getMenuItem(action);
      item.classList.toggle('is-active', !!(src && (
        src.classList.contains('active') ||
        src.classList.contains('focus') ||
        src.classList.contains('hover')
      )));
    });
  }

  // ─── Card data extraction ─────────────────────────────────────────────────────
  function extractCardData(cardEl) {
    if (!cardEl) return null;
    try {
      if (window.$ && $(cardEl).data) {
        var d = $(cardEl).data('card') || $(cardEl).data('item') || $(cardEl).data('data');
        if (d && (d.id || d.title || d.name)) return d;
      }
    } catch(e) {}
    try {
      var dataStr = cardEl.getAttribute('data-card') || cardEl.getAttribute('data-item');
      if (dataStr) return JSON.parse(dataStr);
    } catch(e) {}
    return null;
  }

  function setCardBackgroundImage(cardEl, url) {
    if (!url) return;
    var view = cardEl.querySelector('.card__view');
    if (!view) return;
    var img = view.querySelector('img');
    if (img) { img.src = url; img.srcset = ''; return; }
    view.style.backgroundImage = 'url(' + url + ')';
    view.style.backgroundSize = 'cover';
    view.style.backgroundPosition = 'center';
  }

  // ─── processCard ─────────────────────────────────────────────────────────────
  function processCard(cardEl) {
    if (!cardEl || cardEl.getAttribute('data-agnative-processed')) return;
    cardEl.setAttribute('data-agnative-processed', '1');

    var isEpisode = cardEl.classList.contains('card-episode') || cardEl.classList.contains('full-episode');
    if (isEpisode) { processEpisodeCard(cardEl); return; }

    var data = extractCardData(cardEl);
    if (!data) return;

    var vote = data.vote_average ? parseFloat(data.vote_average) : 0;
    var year = data.release_date ? data.release_date.substring(0, 4) :
               data.first_air_date ? data.first_air_date.substring(0, 4) : '';

    var useHorizontal = backdropEnabled() && getCardImageMode() === 'backdrop';
    var isTV = !!(data.name || data.first_air_date);
    var tmdbType = isTV ? 'tv' : 'movie';

    var view = cardEl.querySelector('.card__view');
    if (!view) return;

    // Remove existing overlay to avoid double-processing
    var existingOverlay = view.querySelector('.nfx-card-overlay');
    if (existingOverlay) existingOverlay.remove();

    // Build meta HTML
    var genreNames = getGenreNames(data);
    var metaItems = [];
    if (vote > 0) metaItems.push({ text: Math.round(vote * 10) + '%', cls: 'nfx-card-overlay__meta-item' });
    if (year)     metaItems.push({ text: year, cls: 'nfx-card-overlay__meta-item' });
    if (genreNames.length) metaItems.push({ text: escapeHtml(genreNames.slice(0, 2).join(', ')), cls: 'nfx-card-overlay__meta-item' });

    var metaHtml = metaItems.length
      ? '<div class="nfx-card-overlay__meta">' +
        metaItems.map(function (m) { return '<span class="' + m.cls + '">' + m.text + '</span>'; }).join('') +
        '</div>'
      : '';

    var titleText = data.title || data.name || '';
    var localLang = getLogoLang();
    var isNonLocalPoster = titleText && localLang !== 'en' && data.original_language && data.original_language !== localLang;
    var titleHtml = (logoTitleEnabled() && isNonLocalPoster)
      ? '<div class="nfx-card-overlay__title">' + escapeHtml(titleText) + '</div>'
      : '<div class="nfx-card-overlay__title">' + escapeHtml(titleText) + '</div>';

    function buildOverlay() {
      if (view.querySelector('.nfx-card-overlay')) return;
      var overlay = document.createElement('div');
      overlay.className = 'nfx-card-overlay';
      overlay.innerHTML = titleHtml + metaHtml;
      view.appendChild(overlay);

      // Badge
      if (badgeEnabled() && titleText && !view.querySelector('.nfx-card-logo')) {
        var badge = document.createElement('div');
        badge.className = 'nfx-card-logo';
        badge.textContent = isTV ? t('badge_tv') : t('badge_movie');
        view.appendChild(badge);
      }

      // Rating
      if (ratingEnabled() && vote > 0 && !view.querySelector('.nfx-card-rating')) {
        var rating = document.createElement('div');
        rating.className = 'nfx-card-rating';
        rating.setAttribute('data-score', Math.min(10, Math.max(1, Math.round(vote))));
        rating.textContent = vote.toFixed(1);
        view.appendChild(rating);
      }

      // Logo fetch (skip for ultra)
      if (!isUltra && data.id) {
        fetchLogo(data.id, tmdbType, function (logo) {
          if (!logo) return;
          var titleDiv = overlay.querySelector('.nfx-card-overlay__title');
          if (!titleDiv) return;
          var img = document.createElement('img');
          img.className = 'nfx-card-overlay__logo';
          img.alt = titleText;
          img.loading = 'lazy';
          var logoUrl = tmdbImg('t/p/w300' + logo.path);
          imgLoad(logoUrl, function (src) {
            img.src = src;
            img.onload = function () { if (src !== logoUrl) { try { URL.revokeObjectURL(src); } catch(e) {} } };
            img.onerror = function () { img.style.display = 'none'; };
          });
          titleDiv.replaceWith(img);

          if (logoTitleEnabled() && logo.iso_639_1 && logo.iso_639_1 !== localLang && titleText) {
            var localTitle = document.createElement('div');
            localTitle.className = 'nfx-card-overlay__local-title';
            localTitle.textContent = titleText;
            img.parentNode && img.parentNode.insertBefore(localTitle, img.nextSibling);
          }
        });
      }
    }

    // Set poster or backdrop
    if (useHorizontal && data.id && !isUltra) {
      if (data.poster_path) {
        setCardBackgroundImage(cardEl, tmdbImg('t/p/' + getPosterQuality() + data.poster_path));
      }
      fetchTitledBackdrop(data.id, tmdbType, function (bdPath) {
        if (bdPath) setCardBackgroundImage(cardEl, tmdbImg('t/p/' + getBackdropQuality() + bdPath));
        buildOverlay();
      });
    } else {
      if (data.poster_path) {
        setCardBackgroundImage(cardEl, tmdbImg('t/p/' + getPosterQuality() + data.poster_path));
      }
      buildOverlay();
    }
  }

  function processEpisodeCard(cardEl) {
    if (!cardEl || cardEl.getAttribute('data-nfx-ep-switched') || isMobile() || isUltra) return;
    cardEl.setAttribute('data-nfx-ep-switched', '1');
    var body = cardEl.querySelector('.full-episode__body');
    if (!body) return;
    var data = extractCardData(cardEl);
    var titleText = '';
    var showId = null;
    if (data) {
      titleText = (data.serial && (data.serial.name || data.serial.original_name)) ||
                  (data.show && (data.show.name || data.show.original_name)) ||
                  data.show_name || data.tv_name || '';
      showId = (data.serial && data.serial.id) || (data.show && data.show.id) ||
               data.show_id || data.tv_id || null;
    }
    if (!body.querySelector('.nfx-episode-title') && titleText) {
      var tEl = document.createElement('div');
      tEl.className = 'nfx-episode-title';
      tEl.textContent = titleText;
      body.insertBefore(tEl, body.firstChild);
    }
    if (showId && !isMedium) {
      fetchLogo(showId, 'tv', function (logo) {
        if (!logo) return;
        var host = cardEl.querySelector('.full-episode__body');
        if (!host) return;
        var existing = host.querySelector('.nfx-episode-title');
        var img = document.createElement('img');
        img.className = 'nfx-episode-logo';
        img.alt = titleText;
        img.loading = 'lazy';
        var logoUrl = tmdbImg('t/p/w185' + logo.path);
        imgLoad(logoUrl, function (src) {
          img.src = src;
          img.onerror = function () { img.style.display = 'none'; };
        });
        if (existing) existing.replaceWith(img);
        else host.insertBefore(img, host.firstChild);
      });
    }
  }

  // ─── Card observer ────────────────────────────────────────────────────────────
  var cardObserver = null;

  function flushCards(nodes) {
    nodes.forEach(function (node) {
      if (!node || node.nodeType !== 1) return;
      var cards = node.querySelectorAll ? node.querySelectorAll('.card') : [];
      for (var i = 0; i < cards.length; i++) processCard(cards[i]);
      if (node.classList && node.classList.contains('card')) processCard(node);
    });
  }

  function scheduleFlush(node) {
    pendingCardNodes.push(node);
    if (cardPatchTimer) return;
    cardPatchTimer = setTimeout(function () {
      cardPatchTimer = 0;
      var nodes = pendingCardNodes.splice(0);
      flushCards(nodes);
    }, isUltra ? 80 : 30);
  }

  function observeCards() {
    if (cardObserver || !window.MutationObserver) return;
    cardObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          scheduleFlush(node);
        });
      });
    });
    cardObserver.observe(document.body, { childList: true, subtree: true });
    // Process existing
    flushCards([document.body]);
  }

  // ─── Active menu watcher ──────────────────────────────────────────────────────
  var menuObserver = null;
  function watchMenuActive() {
    if (menuObserver || !window.MutationObserver) return;
    var menu = qs('.menu');
    if (!menu) return;
    menuObserver = new MutationObserver(function () {
      syncTopnavActive();
      syncLeftdockActive();
    });
    menuObserver.observe(menu, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }

  // ─── Settings component ───────────────────────────────────────────────────────
  function buildBoolRow(key, nameKey, descKey, defVal, onChange) {
    var val = storeGet(key, defVal) !== 'false';
    return {
      type: 'toggle',
      name: t(nameKey),
      description: t(descKey),
      value: val,
      onChange: function (v) {
        storeSet(key, v ? 'true' : 'false');
        if (onChange) onChange(v);
        reapplyPlugin();
      },
    };
  }

  function buildSelectRow(key, nameKey, descKey, options, defVal, onChange) {
    return {
      type: 'select',
      name: t(nameKey),
      description: t(descKey),
      value: storeGet(key, defVal),
      options: options,
      onChange: function (v) {
        storeSet(key, v);
        if (onChange) onChange(v);
        reapplyPlugin();
      },
    };
  }

  var PERF_OPTIONS = [
    { value: 'auto',  title: t('val_perf_auto') },
    { value: 'high',  title: t('val_perf_high') },
    { value: 'low',   title: t('val_perf_low') },
    { value: 'ultra', title: t('val_perf_ultra') },
  ];

  var SIZE_OPTIONS = [
    { value: 'xs', title: t('val_size_xs') },
    { value: 'sm', title: t('val_size_sm') },
    { value: 'md', title: t('val_size_md') },
    { value: 'lg', title: t('val_size_lg') },
    { value: 'xl', title: t('val_size_xl') },
  ];

  var POSTER_Q_OPTIONS = [
    { value: 'w185',  title: '185px' },
    { value: 'w342',  title: '342px' },
    { value: 'w500',  title: '500px' },
    { value: 'w780',  title: '780px' },
    { value: 'original', title: 'Original' },
  ];

  var TOPNAV_ICONS_OPTIONS = [
    { value: 'end',   title: t('val_topnav_icons_end') },
    { value: 'start', title: t('val_topnav_icons_start') },
    { value: 'split', title: t('val_topnav_icons_split') },
  ];

  function registerSettings() {
    if (!window.Lampa || !Lampa.SettingsApi || typeof Lampa.SettingsApi.addComponent !== 'function') return;
    try {
      Lampa.SettingsApi.addComponent({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        name: 'AppleTV AgNative',
        icon: iconSettings(),
      });

      // Version info
      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: 'agnative_version', type: 'static' },
        field: { name: t('set_about_version'), description: PLUGIN_VERSION },
        onChange: function () {},
      });

      // Enable
      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.ENABLE_KEY, type: 'toggle', default: true },
        field: { name: t('set_enable_name'), description: t('set_enable_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.ENABLE_KEY, v ? 'true' : 'false'); reapplyPlugin(); },
      });

      // Performance
      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.PERF_MODE_KEY, type: 'select', options: PERF_OPTIONS, default: 'auto' },
        field: { name: t('set_perf_mode_name'), description: t('set_perf_mode_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.PERF_MODE_KEY, v); _perfLevelCache = null; reapplyPlugin(); },
      });

      // Poster border
      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.POSTER_BORDER_KEY, type: 'toggle', default: true },
        field: { name: t('set_poster_border_name'), description: t('set_poster_border_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.POSTER_BORDER_KEY, v ? 'true' : 'false'); reapplyPlugin(); },
      });

      // Cards section
      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.BACKDROP_KEY, type: 'toggle', default: true },
        field: { name: t('set_backdrop_name'), description: t('set_backdrop_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.BACKDROP_KEY, v ? 'true' : 'false'); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.CARD_IMAGE_MODE_KEY, type: 'select', options: [
          { value: 'backdrop', title: t('val_card_image_backdrop') },
          { value: 'poster',   title: t('val_card_image_poster') },
        ], default: 'backdrop' },
        field: { name: t('set_card_image_mode_name'), description: t('set_card_image_mode_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.CARD_IMAGE_MODE_KEY, v); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.CARD_SIZE_KEY, type: 'select', options: SIZE_OPTIONS, default: 'md' },
        field: { name: t('set_card_size_name'), description: t('set_card_size_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.CARD_SIZE_KEY, v); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.BADGE_KEY, type: 'toggle', default: false },
        field: { name: t('set_badge_name'), description: t('set_badge_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.BADGE_KEY, v ? 'true' : 'false'); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.RATING_KEY, type: 'toggle', default: true },
        field: { name: 'Rating', description: t('set_rating_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.RATING_KEY, v ? 'true' : 'false'); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.RATING_STYLE_KEY, type: 'select', options: [
          { value: 'color', title: t('val_rating_color') },
          { value: 'mono',  title: t('val_rating_mono') },
        ], default: 'color' },
        field: { name: t('set_rating_style_name'), description: t('set_rating_style_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.RATING_STYLE_KEY, v); reapplyPlugin(); },
      });

      // Logo & fonts
      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.LOGO_LANG_KEY, type: 'select', options: [
          { value: 'ru', title: 'RU' },
          { value: 'en', title: 'EN' },
          { value: 'uk', title: 'UK' },
        ], default: 'ru' },
        field: { name: t('set_logo_lang_name'), description: t('set_logo_lang_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.LOGO_LANG_KEY, v); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.LOGO_TITLE_KEY, type: 'toggle', default: false },
        field: { name: t('set_logo_title_name'), description: t('set_logo_title_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.LOGO_TITLE_KEY, v ? 'true' : 'false'); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.POSTER_QUALITY_KEY, type: 'select', options: POSTER_Q_OPTIONS, default: 'w342' },
        field: { name: t('set_poster_quality_name'), description: t('set_poster_quality_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.POSTER_QUALITY_KEY, v); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.FONT_SIZE_KEY, type: 'select', options: SIZE_OPTIONS, default: 'md' },
        field: { name: t('set_font_size_name'), description: t('set_font_size_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.FONT_SIZE_KEY, v); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.CATEGORY_SIZE_KEY, type: 'select', options: SIZE_OPTIONS, default: 'md' },
        field: { name: t('set_category_size_name'), description: t('set_category_size_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.CATEGORY_SIZE_KEY, v); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.OVERLAY_ALIGN_KEY, type: 'select', options: [
          { value: 'start',  title: t('val_overlay_align_start') },
          { value: 'center', title: t('val_overlay_align_center') },
          { value: 'end',    title: t('val_overlay_align_end') },
        ], default: 'start' },
        field: { name: t('set_overlay_align_name'), description: t('set_overlay_align_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.OVERLAY_ALIGN_KEY, v); reapplyPlugin(); },
      });

      // Card animation
      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.CARD_ANIM_KEY, type: 'select', options: [
          { value: 'off',    title: t('val_card_anim_off') },
          { value: 'veoveo', title: t('val_card_anim_veoveo') },
          { value: 'appletv',title: t('val_card_anim_appletv') },
        ], default: 'off' },
        field: { name: t('set_card_anim_name'), description: t('set_card_anim_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.CARD_ANIM_KEY, v); reapplyPlugin(); },
      });

      // Topnav
      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.TOPNAV_ENABLE_KEY, type: 'toggle', default: true },
        field: { name: t('set_topnav_enable_name'), description: t('set_topnav_enable_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.TOPNAV_ENABLE_KEY, v ? 'true' : 'false'); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.TOPNAV_SIZE_KEY, type: 'select', options: SIZE_OPTIONS, default: 'md' },
        field: { name: t('set_topnav_size_name'), description: t('set_topnav_size_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.TOPNAV_SIZE_KEY, v); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.TOPNAV_ICONS_ORDER_KEY, type: 'select', options: TOPNAV_ICONS_OPTIONS, default: 'end' },
        field: { name: t('set_topnav_icons_order_name'), description: t('set_topnav_icons_order_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.TOPNAV_ICONS_ORDER_KEY, v); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.CONTROL_PANEL_KEY, type: 'toggle', default: true },
        field: { name: t('set_control_panel_name'), description: t('set_control_panel_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.CONTROL_PANEL_KEY, v ? 'true' : 'false'); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.CLOCK_SECONDS_KEY, type: 'toggle', default: false },
        field: { name: t('set_clock_seconds_name'), description: t('set_clock_seconds_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.CLOCK_SECONDS_KEY, v ? 'true' : 'false'); startClock(); },
      });

      // Hero
      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.HERO_KEY, type: 'toggle', default: true },
        field: { name: t('set_hero_name'), description: t('set_hero_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.HERO_KEY, v ? 'true' : 'false'); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.HERO_ALIGN_KEY, type: 'select', options: [
          { value: 'top',    title: t('val_hero_align_top') },
          { value: 'center', title: t('val_hero_align_center') },
          { value: 'bottom', title: t('val_hero_align_bottom') },
        ], default: 'bottom' },
        field: { name: t('set_hero_align_name'), description: t('set_hero_align_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.HERO_ALIGN_KEY, v); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.HERO_BG_ANIM_KEY, type: 'select', options: [
          { value: 'pan_down',  title: t('val_anim_pan_down') },
          { value: 'pan_up',    title: t('val_anim_pan_up') },
          { value: 'zoom_in',   title: t('val_anim_zoom_in') },
          { value: 'zoom_out',  title: t('val_anim_zoom_out') },
          { value: 'drift',     title: t('val_anim_drift') },
          { value: 'breathe',   title: t('val_anim_breathe') },
          { value: 'none',      title: t('val_off') },
        ], default: 'pan_down' },
        field: { name: t('set_hero_bg_anim_name'), description: t('set_hero_bg_anim_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.HERO_BG_ANIM_KEY, v); reapplyPlugin(); },
      });

      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: AGNATIVE_KEYS.HERO_QUALITY_KEY, type: 'select', options: [
          { value: 'w780',   title: '780px' },
          { value: 'w1280',  title: '1280px' },
          { value: 'original', title: 'Original' },
        ], default: 'w1280' },
        field: { name: t('set_hero_quality_name'), description: t('set_hero_quality_desc') },
        onChange: function (v) { storeSet(AGNATIVE_KEYS.HERO_QUALITY_KEY, v); reapplyPlugin(); },
      });

      // Reset
      Lampa.SettingsApi.addParam({
        component: AGNATIVE_KEYS.SETTINGS_COMPONENT,
        param: { name: 'agnative_reset', type: 'button' },
        field: { name: t('set_reset_name'), description: t('set_reset_desc') },
        onChange: function () {
          Object.values(AGNATIVE_KEYS).forEach(function (k) {
            try { localStorage.removeItem(k); } catch(e) {}
            try { if (window.Lampa && Lampa.Storage) Lampa.Storage.set(k, ''); } catch(e) {}
          });
          _perfLevelCache = null;
          reapplyPlugin();
          try { if (window.Lampa && Lampa.Noty) Lampa.Noty.show(t('set_reset_done')); } catch(e) {}
        },
      });

    } catch(e) {
      console.warn('[AgNative] Settings register error:', e);
    }
  }

  // ─── Apply data-attributes ────────────────────────────────────────────────────
  function applyDataAttributes() {
    var root = document.documentElement;
    root.setAttribute(AGNATIVE_KEYS.FONT_SIZE_ATTR,       getFontSize());
    root.setAttribute(AGNATIVE_KEYS.BACKDROP_ATTR,        backdropEnabled() ? 'true' : 'false');
    root.setAttribute(AGNATIVE_KEYS.BADGE_ATTR,           badgeEnabled() ? 'true' : 'false');
    root.setAttribute(AGNATIVE_KEYS.RATING_ATTR,          ratingEnabled() ? 'true' : 'false');
    root.setAttribute(AGNATIVE_KEYS.RATING_STYLE_ATTR,    storeGet(AGNATIVE_KEYS.RATING_STYLE_KEY, 'color'));
    root.setAttribute(AGNATIVE_KEYS.CATEGORY_SIZE_ATTR,   getCategorySize());
    root.setAttribute(AGNATIVE_KEYS.CARD_SIZE_ATTR,       getCardSize());
    root.setAttribute(AGNATIVE_KEYS.LOGO_SIZE_ATTR,       getLogoSize());
    root.setAttribute(AGNATIVE_KEYS.PERF_ATTR,            resolvePerfLevel());
    root.setAttribute(AGNATIVE_KEYS.OVERLAY_ALIGN_ATTR,   getOverlayAlign());
    root.setAttribute(AGNATIVE_KEYS.CARD_IMAGE_MODE_ATTR, getCardImageMode());
    root.setAttribute(AGNATIVE_KEYS.HERO_ALIGN_ATTR,      getHeroAlign());
    root.setAttribute(AGNATIVE_KEYS.HERO_ANIMATION_ATTR,  heroAnimationEnabled() ? 'true' : 'false');
    root.setAttribute(AGNATIVE_KEYS.TOPNAV_SIZE_ATTR,     getTopnavSize());
    root.setAttribute(AGNATIVE_KEYS.POSTER_BORDER_ATTR,   posterBorderEnabled() ? 'true' : 'false');
  }

  // ─── Hero banner ──────────────────────────────────────────────────────────────
  function buildHeroBanner() {
    if (!heroBannerEnabled() || isUltra) return;
    if (qs('.agnative-hero')) return;

    var wrap = qs('.wrap__content') || qs('.body__content') || qs('#app') || document.body;
    if (!wrap) return;

    // Collect cards from first row
    var cards = qsa('.card', wrap).slice(0, 10);
    if (!cards.length) return;

    heroItems = cards.map(function (c) {
      var d = extractCardData(c);
      return d;
    }).filter(Boolean).slice(0, 8);

    if (!heroItems.length) return;

    var hero = document.createElement('div');
    hero.className = 'agnative-hero';
    hero.style.height = '320px';

    var bg = document.createElement('div');
    bg.className = 'agnative-hero__bg';
    hero.appendChild(bg);

    var gradient = document.createElement('div');
    gradient.className = 'agnative-hero__gradient';
    hero.appendChild(gradient);

    var content = document.createElement('div');
    content.className = 'agnative-hero__content';
    hero.appendChild(content);

    if (heroIndicatorsEnabled()) {
      var indicators = document.createElement('div');
      indicators.className = 'agnative-hero__indicators';
      hero.appendChild(indicators);
      heroItems.forEach(function (_, idx) {
        var ind = document.createElement('div');
        ind.className = 'agnative-hero__ind' + (idx === 0 ? ' is-active' : '');
        ind.addEventListener('click', function () { showHeroSlide(idx); });
        indicators.appendChild(ind);
      });
    }

    wrap.insertBefore(hero, wrap.firstChild);
    heroCurrentIndex = 0;
    showHeroSlide(0);

    // Auto-rotate
    var interval = getHeroInterval() * 1000;
    if (heroTimerID) clearInterval(heroTimerID);
    heroTimerID = setInterval(function () {
      heroCurrentIndex = (heroCurrentIndex + 1) % heroItems.length;
      showHeroSlide(heroCurrentIndex);
    }, interval);
  }

  function showHeroSlide(idx) {
    var hero = qs('.agnative-hero');
    if (!hero || !heroItems.length) return;
    heroCurrentIndex = idx;
    var data = heroItems[idx];
    if (!data) return;

    var bg = qs('.agnative-hero__bg', hero);
    var content = qs('.agnative-hero__content', hero);
    if (!bg || !content) return;

    // Set bg image
    if (data.backdrop_path) {
      var bgUrl = tmdbImg('t/p/' + getHeroQuality() + data.backdrop_path);
      bg.style.backgroundImage = 'url(' + bgUrl + ')';
    } else if (data.poster_path) {
      var bgUrl = tmdbImg('t/p/w780' + data.poster_path);
      bg.style.backgroundImage = 'url(' + bgUrl + ')';
    }

    // BG animation
    var bgAnim = getHeroBgAnim();
    bg.className = 'agnative-hero__bg' + (bgAnim && bgAnim !== 'none' ? ' anim-' + bgAnim : '');
    var animDuration = getHeroInterval() + 's';
    bg.style.animationDuration = animDuration;
    bg.style.animationIterationCount = (bgAnim === 'drift' || bgAnim === 'breathe') ? 'infinite' : '1';

    // Content
    var title = data.title || data.name || '';
    var overview = data.overview || '';
    content.innerHTML = '';

    // Logo or title
    if (!isMedium && data.id) {
      var isTV = !!(data.name || data.first_air_date);
      fetchLogo(data.id, isTV ? 'tv' : 'movie', function (logo) {
        if (logo) {
          var img = document.createElement('img');
          img.className = 'agnative-hero__logo';
          img.alt = title;
          img.loading = 'lazy';
          img.src = tmdbImg('t/p/w500' + logo.path);
          content.insertBefore(img, content.firstChild);
        } else {
          var h = document.createElement('div');
          h.className = 'agnative-hero__title';
          h.textContent = title;
          content.insertBefore(h, content.firstChild);
        }
      });
    } else {
      var h = document.createElement('div');
      h.className = 'agnative-hero__title';
      h.textContent = title;
      content.appendChild(h);
    }

    if (overview) {
      var ov = document.createElement('div');
      ov.className = 'agnative-hero__overview';
      ov.textContent = overview;
      content.appendChild(ov);
    }

    var btn = document.createElement('div');
    btn.className = 'agnative-hero__btn selector';
    btn.textContent = t('hero_btn_watch');
    btn.setAttribute('tabindex', '0');
    bindAction(btn, function () {
      // Find and click the matching card
      var cards = qsa('.card');
      for (var i = 0; i < cards.length; i++) {
        var d = extractCardData(cards[i]);
        if (d && d.id === data.id) { clickNode(cards[i]); break; }
      }
    });
    content.appendChild(btn);

    // Update indicators
    qsa('.agnative-hero__ind', hero).forEach(function (ind, i) {
      ind.classList.toggle('is-active', i === idx);
    });
  }

  function destroyHeroBanner() {
    if (heroTimerID) { clearInterval(heroTimerID); heroTimerID = null; }
    var hero = qs('.agnative-hero');
    if (hero) hero.remove();
    heroItems = [];
    heroCurrentIndex = 0;
  }

  // ─── Theme color watcher ──────────────────────────────────────────────────────
  var themeWatcher = null;
  function watchThemeChanges() {
    if (themeWatcher || !window.MutationObserver) return;
    themeWatcher = new MutationObserver(function (mutations) {
      var relevant = mutations.some(function (m) {
        return m.attributeName === 'class' ||
               m.attributeName === 'style' ||
               m.attributeName === 'data-theme';
      });
      if (relevant) {
        setTimeout(function () {
          injectStyle(AGNATIVE_KEYS.STYLE_ID, buildCSS());
        }, 100);
      }
    });
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
  }

  // ─── reapplyPlugin ────────────────────────────────────────────────────────────
  function reapplyPlugin() {
    _perfLevelCache = null;
    checkPerfLevel();
    injectStyle(AGNATIVE_KEYS.STYLE_ID, buildCSS());
    applyDataAttributes();

    // Rebuild topnav
    var head = qs('.head');
    if (head) {
      var shell = qs('.agnative-topnav-shell', head);
      if (shell) shell.remove();
    }
    stopClock();
    topnavControllerReady = false;
    buildTopnavShell();

    // Rebuild leftdock
    var dock = qs('.agnative-leftdock');
    if (dock) dock.remove();
    buildLeftDock();
    neutralizeMenuController();

    // Reprocess cards
    qsa('[data-agnative-processed]').forEach(function (el) {
      el.removeAttribute('data-agnative-processed');
    });
    flushCards([document.body]);

    // Hero
    destroyHeroBanner();
    if (heroBannerEnabled() && !isUltra) setTimeout(buildHeroBanner, 500);
  }

  // ─── startPlugin ─────────────────────────────────────────────────────────────
  function startPlugin() {
    if (!pluginEnabled()) return;
    checkPerfLevel();
    injectStyle(AGNATIVE_KEYS.STYLE_ID, buildCSS());
    applyDataAttributes();

    // Wait for DOM to be ready
    function init() {
      buildTopnavShell();
      buildLeftDock();
      neutralizeMenuController();
      patchActivityPush();
      observeCards();
      watchMenuActive();
      watchThemeChanges();

      if (heroBannerEnabled() && !isUltra) {
        setTimeout(buildHeroBanner, 800);
      }

      // Poll to rebuild if head not ready yet
      var attempts = 0;
      var poll = setInterval(function () {
        attempts++;
        if (attempts > 30) { clearInterval(poll); return; }
        var head = qs('.head');
        if (head && !qs('.agnative-topnav-shell', head)) {
          buildTopnavShell();
        }
        if (!qs('.agnative-leftdock')) {
          buildLeftDock();
        }
        if (attempts > 5) clearInterval(poll);
      }, 600);

      // Listen to Lampa events for menu updates
      try {
        if (window.Lampa && Lampa.Listener) {
          Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'push' || e.type === 'replace') {
              setTimeout(function () {
                syncTopnavActive();
                syncLeftdockActive();
              }, 200);
            }
          });
        }
      } catch(e) {}
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────────
  function bootPlugin() {
    registerSettings();
    startPlugin();
  }

  if (window.appready) {
    bootPlugin();
  } else {
    try {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') bootPlugin();
      });
    } catch(e) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootPlugin);
      } else {
        bootPlugin();
      }
    }
  }

})();
