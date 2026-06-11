(function () {
    'use strict';

    // =============================================================
    //
    //   ██████╗ ██████╗ ██████╗ ██╗     ███████╗    ███████╗████████╗██╗   ██╗██╗     ███████╗
    //  ██╔══██╗██╔══██╗██╔══██╗██║     ██╔════╝    ██╔════╝╚══██╔══╝╚██╗ ██╔╝██║     ██╔════╝
    //  ███████║██████╔╝██████╔╝██║     █████╗      ███████╗   ██║    ╚████╔╝ ██║     █████╗
    //  ██╔══██║██╔═══╝ ██╔═══╝ ██║     ██╔══╝      ╚════██║   ██║     ╚██╔╝  ██║     ██╔══╝
    //  ██║  ██║██║     ██║     ███████╗███████╗    ███████║   ██║      ██║   ███████╗███████╗
    //  ╚═╝  ╚═╝╚═╝     ╚═╝     ╚══════╝╚══════╝    ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝
    //
    //   Объединённый плагин для Lampa
    //   Включает три модуля:
    //     1. Apple TV UI  — стиль интерфейса Apple TV (верхнее меню, карточки, часы)
    //     2. TrailerMax   — авто-трейлеры и слайд-шоу на карточках фильмов
    //     3. Apple Кнопки — стиль кнопок с эффектом стекла / glassmorphism
    //
    //   Логотип:
    //   <svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
    //
    // =============================================================

    // Защита от двойной загрузки объединённого плагина
    if (window.__APPLE_STYLE_COMBINED_LOADED__) return;
    window.__APPLE_STYLE_COMBINED_LOADED__ = true;

    // =============================================================
    // МОДУЛЬ 1: Apple TV UI (mymaxtvs)
    // =============================================================

(function () {
  'use strict';

  const PLUGIN_GUARD_KEY = '__APPLETV_AGNATIVE_TOPNAV__';

  function isAndroidTV() {
    if (typeof navigator === 'undefined') return false;
    var ua = (navigator.userAgent || '').toLowerCase();
    if (ua.indexOf('android') === -1) return false;
    if (ua.indexOf('android tv') !== -1) return true;
    if (ua.indexOf('androidtv') !== -1) return true;
    if (ua.indexOf('googletv') !== -1) return true;
    if (ua.indexOf('google tv') !== -1) return true;
    if (ua.indexOf('atv ') !== -1) return true;
    if (ua.indexOf('crkey') !== -1) return true;
    if (ua.indexOf('smart-tv') !== -1) return true;
    if (ua.indexOf('smarttv') !== -1) return true;
    if (ua.indexOf('bravia') !== -1) return true;
    if (ua.indexOf('aft') !== -1) return true;
    if (ua.indexOf('shield') !== -1) return true;
    try {
      var noTouch = !('ontouchstart' in window) && (navigator.maxTouchPoints === 0 || typeof navigator.maxTouchPoints === 'undefined');
      if (noTouch) return true;
    } catch (e) {}
    try {
      if (window.Lampa && Lampa.Platform && typeof Lampa.Platform.is === 'function') {
        if (Lampa.Platform.is('android') && !('ontouchstart' in window)) return true;
      }
    } catch (e) {}
    return false;
  }

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
    COLOR_SCOPE_KEY: 'appletv_agnative_color_scope',
    COLOR_SCOPE_ATTR: 'data-agnative-color-scope',
    BUBBLE_SIZE_KEY: 'appletv_agnative_bubble_size',
    BUBBLE_SCALE_KEY: 'appletv_agnative_bubble_scale',
    BUBBLE_COLOR_H_KEY: 'appletv_agnative_bubble_color_h',
    BUBBLE_COLOR_M_KEY: 'appletv_agnative_bubble_color_m',
    BUBBLE_COLOR_DOT_KEY: 'appletv_agnative_bubble_color_dot',
    SCREENSAVER_CLOCK_KEY: 'appletv_agnative_screensaver_clock',
    CLOCK_FORMAT_KEY: 'appletv_agnative_clock_format',
    CLOCK_DATE_KEY: 'appletv_agnative_clock_date',
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
    HERO_KEY: 'appletv_agnative_hero',
    HERO_ATTR: 'data-agnative-hero',
    HERO_LOGO_SIZE_KEY: 'appletv_agnative_hero_logo_size',
    HERO_LOGO_SIZE_ATTR: 'data-agnative-hero-logo-size',
    ANDROIDTV_KEY: 'appletv_agnative_androidtv_focus',
    ANDROIDTV_ATTR: 'data-agnative-androidtv',
    CACHE_SIZE_KEY: 'appletv_agnative_cache_size',
    POSTER_QUALITY_KEY: 'appletv_agnative_poster_quality',
    OVERLAY_ALIGN_KEY: 'appletv_agnative_overlay_align',
    OVERLAY_ALIGN_ATTR: 'data-agnative-overlay-align',
    CARD_IMAGE_MODE_KEY: 'appletv_agnative_card_image_mode',
    CARD_IMAGE_MODE_ATTR: 'data-agnative-card-image-mode',
    PERF_ATTR: 'data-agnative-perf',
    FLEX_GAP_ATTR: 'data-agnative-flex-gap',
    FOCUS_SCALE_KEY: 'appletv_agnative_focus_scale',
    POSTER_BORDER_KEY: 'appletv_agnative_poster_border',
    POSTER_BORDER_ATTR: 'data-agnative-poster-border'
  };

  const ru = {
    nav_feed: 'Лента',
    badge_movie: 'ФИЛЬМ', badge_tv: 'СЕРИАЛ',
    set_about_desc: 'Версия 0.3.16 · автор Maks TV',
    set_main_title: 'Основные настройки',
    set_enable_name: 'Apple TV',
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
    set_reset_done: 'Настройки Apple TV сброшены',
    set_category_size_name: 'Размер названий категорий',
    set_category_size_desc: 'Заголовки полок (Популярное, Новинки и т.д.)',
    set_card_size_name: 'Размер карточек',
    set_card_size_desc: 'Ширина карточек в лентах',
    set_card_image_mode_name: 'Тип изображения карточки',
    set_card_image_mode_desc: 'Бекдроп + логотип или постер без логотипа',
    val_card_image_backdrop: 'Бекдроп + Логотип',
    val_card_image_poster: 'Постер',
    set_poster_quality_name: 'Качество постеров',
    set_poster_quality_desc: 'Разрешение изображений постеров с TMDB',
    set_overlay_align_name: 'Выравнивание подписи карточки',
    set_overlay_align_desc: 'Горизонтальное выравнивание названия и метаданных на карточке',
    val_overlay_align_start: 'По левому краю',
    val_overlay_align_center: 'По центру',
    val_overlay_align_end: 'По правому краю',
    set_logo_size_name: 'Размер логотипа фильма',
    set_logo_size_desc: 'Максимальная ширина логотипа на карточке относительно карточки медиаконтента',
    set_androidtv_name: 'Фокус пульта Android TV',
    set_androidtv_desc: 'Мгновенный фокус без анимаций, бликов и теней. Сильно ускоряет переключение постеров на Android 9 TV',
    val_androidtv_auto: 'Авто (для Android TV)',
    val_androidtv_on: 'Всегда включить',
    val_androidtv_off: 'Выключить',
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
    set_color_scope_name: 'Область окрашивания темой',
    set_color_scope_desc: 'Какие элементы верхней панели окрашивать цветом из плагина colors',
    val_color_scope_items: 'Только пункты меню',
    val_color_scope_tiles: 'Пункты + плитки панели',
    val_color_scope_all: 'Все элементы (пункты, часы, аватар, плитки)',
    set_bubble_size_name: 'Размер часов',
    set_bubble_size_desc: 'Размер шрифта часов в шапке',
    set_bubble_scale_name: 'Ширина часов',
    set_bubble_scale_desc: 'Горизонтальное растяжение цифр часов',
    set_bubble_color_h_name: 'Цвет часов',
    set_bubble_color_h_desc: 'Цвет цифр часов',
    set_bubble_color_m_name: 'Цвет минут',
    set_bubble_color_m_desc: 'Цвет цифр минут',
    set_bubble_color_dot_name: 'Цвет двоеточия',
    set_bubble_color_dot_desc: 'Цвет мигающего двоеточия между часами и минутами',
    set_screensaver_clock_name: 'Часы в заставке',
    set_screensaver_clock_desc: 'Показывать большие часы поверх системной заставки',
    set_clock_format_name: 'Формат часов',
    set_clock_format_desc: '24-часовой или 12-часовой формат с AM/PM',
    val_clock_format_24: '24 часа',
    val_clock_format_12: '12 часов (AM/PM)',
    set_clock_date_name: 'Показывать дату',
    set_clock_date_desc: 'День недели и дата под часами (в шапке и на заставке)',
    val_color_white: 'Белый',
    val_color_orange: 'Оранжевый',
    val_color_red: 'Красный',
    val_color_green: 'Зелёный',
    val_color_blue: 'Синий',
    val_color_pink: 'Розовый',
    val_color_yellow: 'Жёлтый',
    val_color_grey: 'Серый',
    val_color_theme: 'Цвет темы (colors)',
    set_focus_scale_name: 'Масштаб при наведении',
    set_focus_scale_desc: 'Увеличение карточки при фокусе',
    set_poster_border_name: 'Рамка постера',
    set_poster_border_desc: 'Показывать рамку вокруг постера при фокусе'
  };

  const en = {
    nav_feed: 'Feed',
    badge_movie: 'MOVIE', badge_tv: 'TV SHOW',
    set_about_desc: 'Version 0.3.16 · by Maks TV',
    set_main_title: 'Main settings',
    set_enable_name: 'Apple TV',
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
    set_reset_done: 'Apple TV settings reset',
    set_category_size_name: 'Category title size',
    set_category_size_desc: 'Section titles (Popular, New, etc.)',
    set_card_size_name: 'Card size',
    set_card_size_desc: 'Card width in rows',
    set_card_image_mode_name: 'Card image type',
    set_card_image_mode_desc: 'Backdrop + logo or poster without logo',
    val_card_image_backdrop: 'Backdrop + Logo',
    val_card_image_poster: 'Poster',
    set_poster_quality_name: 'Poster quality',
    set_poster_quality_desc: 'Resolution of poster images from TMDB',
    set_overlay_align_name: 'Card overlay alignment',
    set_overlay_align_desc: 'Horizontal alignment of title and metadata on the card',
    val_overlay_align_start: 'Left',
    val_overlay_align_center: 'Center',
    val_overlay_align_end: 'Right',
    set_logo_size_name: 'Movie logo size',
    set_logo_size_desc: 'Maximum logo width relative to the media card',
    set_androidtv_name: 'Android TV remote focus',
    set_androidtv_desc: 'Instant focus without animations, glare or shadows. Greatly speeds up poster navigation on Android 9 TV',
    val_androidtv_auto: 'Auto (when Android TV)',
    val_androidtv_on: 'Always on',
    val_androidtv_off: 'Off',
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
    set_color_scope_name: 'Theme color scope',
    set_color_scope_desc: 'Which top-bar elements are colored using the colors plugin theme',
    val_color_scope_items: 'Menu items only',
    val_color_scope_tiles: 'Items + control panel tiles',
    val_color_scope_all: 'All elements (items, clock, profile, tiles)',
    set_bubble_size_name: 'Clock size',
    set_bubble_size_desc: 'Header clock font size',
    set_bubble_scale_name: 'Clock width',
    set_bubble_scale_desc: 'Horizontal stretch of clock digits',
    set_bubble_color_h_name: 'Hours color',
    set_bubble_color_h_desc: 'Color of hour digits',
    set_bubble_color_m_name: 'Minutes color',
    set_bubble_color_m_desc: 'Color of minute digits',
    set_bubble_color_dot_name: 'Colon color',
    set_bubble_color_dot_desc: 'Color of the blinking colon between hours and minutes',
    set_screensaver_clock_name: 'Clock on screensaver',
    set_screensaver_clock_desc: 'Show a big clock over the system screensaver',
    set_clock_format_name: 'Clock format',
    set_clock_format_desc: '24-hour or 12-hour with AM/PM',
    val_clock_format_24: '24 hour',
    val_clock_format_12: '12 hour (AM/PM)',
    set_clock_date_name: 'Show date',
    set_clock_date_desc: 'Weekday and date under the clock (header and screensaver)',
    val_color_white: 'White',
    val_color_orange: 'Orange',
    val_color_red: 'Red',
    val_color_green: 'Green',
    val_color_blue: 'Blue',
    val_color_pink: 'Pink',
    val_color_yellow: 'Yellow',
    val_color_grey: 'Grey',
    val_color_theme: 'Theme color (colors)',
    set_focus_scale_name: 'Hover scale',
    set_focus_scale_desc: 'Card zoom on focus',
    set_poster_border_name: 'Poster border',
    set_poster_border_desc: 'Show border around poster on focus'
  };

  const uk = {
    nav_feed: 'Стрічка',
    badge_movie: 'ФІЛЬМ', badge_tv: 'СЕРІАЛ',
    set_about_desc: 'Версія 0.3.16 · автор Maks TV',
    set_main_title: 'Основні налаштування',
    set_enable_name: 'Apple TV',
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
    set_reset_done: 'Налаштування Apple TV скинуто',
    set_category_size_name: 'Розмір назв категорій',
    set_category_size_desc: 'Заголовки поличок (Популярне, Новинки тощо)',
    set_card_size_name: 'Розмір карточок',
    set_card_size_desc: 'Ширина карточок у стрічках',
    set_card_image_mode_name: 'Тип зображення картки',
    set_card_image_mode_desc: 'Бекдроп + логотип або постер без логотипу',
    val_card_image_backdrop: 'Бекдроп + Логотип',
    val_card_image_poster: 'Постер',
    set_poster_quality_name: 'Якість постерів',
    set_poster_quality_desc: 'Роздільна здатність зображень постерів з TMDB',
    set_overlay_align_name: 'Вирівнювання підпису картки',
    set_overlay_align_desc: 'Горизонтальне вирівнювання назви та метаданих на картці',
    val_overlay_align_start: 'Ліворуч',
    val_overlay_align_center: 'По центру',
    val_overlay_align_end: 'Праворуч',
    set_logo_size_name: 'Розмір логотипу фільму',
    set_logo_size_desc: 'Максимальна ширина логотипу на картці відносно картки медіаконтенту',
    set_androidtv_name: 'Фокус пульта Android TV',
    set_androidtv_desc: 'Миттєвий фокус без анімацій, відблисків і тіней. Сильно прискорює перемикання постерів на Android 9 TV',
    val_androidtv_auto: 'Авто (для Android TV)',
    val_androidtv_on: 'Завжди увімкнути',
    val_androidtv_off: 'Вимкнути',
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
    set_color_scope_name: 'Область фарбування темою',
    set_color_scope_desc: 'Які елементи верхньої панелі фарбувати кольором із плагіна colors',
    val_color_scope_items: 'Тільки пункти меню',
    val_color_scope_tiles: 'Пункти + плитки панелі',
    val_color_scope_all: 'Усі елементи (пункти, годинник, аватар, плитки)',
    set_bubble_size_name: 'Розмір годинника',
    set_bubble_size_desc: 'Розмір шрифту годинника у шапці',
    set_bubble_scale_name: 'Ширина годинника',
    set_bubble_scale_desc: 'Горизонтальне розтягнення цифр годинника',
    set_bubble_color_h_name: 'Колір годин',
    set_bubble_color_h_desc: 'Колір цифр годин',
    set_bubble_color_m_name: 'Колір хвилин',
    set_bubble_color_m_desc: 'Колір цифр хвилин',
    set_bubble_color_dot_name: 'Колір двокрапки',
    set_bubble_color_dot_desc: 'Колір блимаючої двокрапки між годинами та хвилинами',
    set_screensaver_clock_name: 'Годинник у заставці',
    set_screensaver_clock_desc: 'Показувати великий годинник поверх системної заставки',
    set_clock_format_name: 'Формат годинника',
    set_clock_format_desc: '24-годинний або 12-годинний з AM/PM',
    val_clock_format_24: '24 години',
    val_clock_format_12: '12 годин (AM/PM)',
    set_clock_date_name: 'Показувати дату',
    set_clock_date_desc: 'День тижня та дата під годинником (у шапці та на заставці)',
    val_color_white: 'Білий',
    val_color_orange: 'Помаранчевий',
    val_color_red: 'Червоний',
    val_color_green: 'Зелений',
    val_color_blue: 'Синій',
    val_color_pink: 'Рожевий',
    val_color_yellow: 'Жовтий',
    val_color_grey: 'Сірий',
    val_color_theme: 'Колір теми (colors)',
    set_focus_scale_name: 'Масштаб при наведенні',
    set_focus_scale_desc: 'Збільшення картки при фокусі',
    set_poster_border_name: 'Рамка постера',
    set_poster_border_desc: 'Показувати рамку навколо постера при фокусі'
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
      HERO_KEY,
      HERO_ATTR,
      HERO_LOGO_SIZE_KEY,
      HERO_LOGO_SIZE_ATTR,
      ANDROIDTV_KEY,
      ANDROIDTV_ATTR,
      CACHE_SIZE_KEY,
      CLOCK_SECONDS_KEY,
      CONTROL_PANEL_KEY,
      PERF_MODE_KEY,
      COLOR_SCOPE_KEY,
      COLOR_SCOPE_ATTR,
      BUBBLE_SIZE_KEY,
      BUBBLE_SCALE_KEY,
      BUBBLE_COLOR_H_KEY,
      BUBBLE_COLOR_M_KEY,
      BUBBLE_COLOR_DOT_KEY,
      SCREENSAVER_CLOCK_KEY,
      CLOCK_FORMAT_KEY,
      CLOCK_DATE_KEY,
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
      POSTER_QUALITY_KEY,
      OVERLAY_ALIGN_KEY,
      OVERLAY_ALIGN_ATTR,
      CARD_IMAGE_MODE_KEY,
      CARD_IMAGE_MODE_ATTR,
      PERF_ATTR,
      FLEX_GAP_ATTR,
      FOCUS_SCALE_KEY,
      POSTER_BORDER_KEY,
      POSTER_BORDER_ATTR
    } = AGNATIVE_KEYS;

    var scheduled = false;
    var clockTimer = null;
    var bubbleBlinkTimer = null;
    var screensaverClockEl = null;
    var screensaverClockTimer = null;
    var screensaverBlinkTimer = null;
    var screensaverListenerBound = false;
    var logoCache = {};
    var logoPending = {};
    var posterCache = {};
    var posterPending = {};
    var storageListenerBound = false;
    var activityListenerBound = false;
    var fullListenerBound = false;
    var topnavSettingsOpen = false;
    var perfModeDirty = false;
    var controlPanelOpen = false;
    var controlPanelPrevController = '';
    var controlPanelControllerReady = false;
    var controlPanelDocCloseBound = false;
    var swallowClickUntil = 0;
    var styleSignature = '';
    var detectedPerfLevel = null;
    var flexGapSupport = null;
    var cardPatchTimer = 0;
    var heroEl = null;
    var heroItems = [];
    var heroIndex = 0;
    var heroRotateTimer = null;
    var heroFetchPending = false;
    var heroLastFetch = 0;
    var heroCurrentActivity = null;
    var heroSlideToken = 0;
    var heroNavRefreshTimer = null;
    var heroControllerReady = false;
    var heroBodyObserver = null;
    var heroAutoFocusPending = false;
    var screensaverWatcherBound = false;
    var screensaverDomObserver = null;
    var screensaverDomPollTimer = null;

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

    var COLOR_PALETTE_KEYS = ['theme', '#ffffff', '#ff9100', '#ff4444', '#44ff88', '#44aaff', '#ff44ff', '#ffff44', '#aaaaaa'];

    function colorPaletteValues() {
      return {
        theme: t('val_color_theme'),
        '#ffffff': t('val_color_white'),
        '#ff9100': t('val_color_orange'),
        '#ff4444': t('val_color_red'),
        '#44ff88': t('val_color_green'),
        '#44aaff': t('val_color_blue'),
        '#ff44ff': t('val_color_pink'),
        '#ffff44': t('val_color_yellow'),
        '#aaaaaa': t('val_color_grey')
      };
    }

    function resolveBubbleColor(value, fallbackHex) {
      if (!value || value === 'theme') return 'var(--main-color, ' + fallbackHex + ')';
      return value;
    }

    function getBubbleSize() {
      try {
        if (!window.Lampa || !Lampa.Storage) return '1.5';
        return String(Lampa.Storage.get(BUBBLE_SIZE_KEY, '1.5') || '1.5');
      } catch (e) { return '1.5'; }
    }

    function getBubbleScale() {
      try {
        if (!window.Lampa || !Lampa.Storage) return '1.0';
        return String(Lampa.Storage.get(BUBBLE_SCALE_KEY, '1.0') || '1.0');
      } catch (e) { return '1.0'; }
    }

    function getBubbleColorH() {
      try {
        if (!window.Lampa || !Lampa.Storage) return '#ffffff';
        return String(Lampa.Storage.get(BUBBLE_COLOR_H_KEY, '#ffffff') || '#ffffff');
      } catch (e) { return '#ffffff'; }
    }

    function getBubbleColorM() {
      try {
        if (!window.Lampa || !Lampa.Storage) return '#ff9100';
        return String(Lampa.Storage.get(BUBBLE_COLOR_M_KEY, '#ff9100') || '#ff9100');
      } catch (e) { return '#ff9100'; }
    }

    function getBubbleColorDot() {
      try {
        if (!window.Lampa || !Lampa.Storage) return '#ff9100';
        return String(Lampa.Storage.get(BUBBLE_COLOR_DOT_KEY, '#ff9100') || '#ff9100');
      } catch (e) { return '#ff9100'; }
    }

    function screensaverClockEnabled() { return storageFlagOn(SCREENSAVER_CLOCK_KEY, 'on'); }

    function getColorScope() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'items';
        var v = Lampa.Storage.get(COLOR_SCOPE_KEY, 'items') || 'items';
        if (v !== 'items' && v !== 'tiles' && v !== 'all') return 'items';
        return v;
      } catch (e) { return 'items'; }
    }

    function syncColorScope() {
      try { document.body.setAttribute(COLOR_SCOPE_ATTR, getColorScope()); } catch (e) {}
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
    function posterBorderEnabled() { return storageFlagOn(POSTER_BORDER_KEY, 'on'); }

    var FOCUS_SCALE_VALUES = ['1.0','1.05','1.08','1.1','1.15','1.2','1.25','1.3'];
    function getFocusScale() {
      try {
        if (!window.Lampa || !Lampa.Storage) return '1.05';
        var v = String(Lampa.Storage.get(FOCUS_SCALE_KEY, '1.05') || '1.05');
        if (FOCUS_SCALE_VALUES.indexOf(v) < 0) return '1.05';
        return v;
      } catch (e) { return '1.05'; }
    }

    function getCardImageMode() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'backdrop';
        var v = Lampa.Storage.get(CARD_IMAGE_MODE_KEY, 'backdrop') || 'backdrop';
        return v === 'poster' ? 'poster' : 'backdrop';
      } catch (e) { return 'backdrop'; }
    }
    function getOverlayAlign() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'start';
        var v = Lampa.Storage.get(OVERLAY_ALIGN_KEY, 'start') || 'start';
        if (v === 'center') return 'center';
        if (v === 'end') return 'end';
        return 'start';
      } catch (e) { return 'start'; }
    }
    function getPosterQuality() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'w500';
        var v = String(Lampa.Storage.get(POSTER_QUALITY_KEY, 'w500') || 'w500');
        if (v === 'w185' || v === 'w342' || v === 'w500' || v === 'w780' || v === 'original') return v;
        return 'w500';
      } catch (e) { return 'w500'; }
    }
    function syncCardImageMode() {
      try { document.body.setAttribute(CARD_IMAGE_MODE_ATTR, getCardImageMode()); } catch (e) {}
    }
    function syncOverlayAlign() {
      try { document.body.setAttribute(OVERLAY_ALIGN_ATTR, getOverlayAlign()); } catch (e) {}
    }
    function clockSecondsEnabled() { return storageFlagOn(CLOCK_SECONDS_KEY, 'off'); }
    function clockFormat() {
      try { return String(Lampa.Storage.get(CLOCK_FORMAT_KEY, '24') || '24') === '12' ? '12' : '24'; }
      catch (e) { return '24'; }
    }
    function clockDateEnabled() { return storageFlagOn(CLOCK_DATE_KEY, 'off'); }
    function formatBubbleDate(d) {
      try {
        var lang = (Lampa.Storage.get('language', 'ru') || 'ru');
        var locale = lang === 'uk' ? 'uk-UA' : (lang === 'en' ? 'en-US' : 'ru-RU');
        var weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d);
        var day = d.getDate();
        var month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(d);
        weekday = String(weekday).replace(/\.$/, '');
        if (locale === 'en-US') return weekday + ', ' + month + ' ' + day;
        return weekday + ', ' + day + ' ' + month;
      } catch (e) {
        try { return d.toDateString(); } catch (e2) { return ''; }
      }
    }
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

    function syncLogoSize() {
      if (!document.body) return;
      document.body.setAttribute(LOGO_SIZE_ATTR, getLogoSize());
    }

    function getAndroidTvMode() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'auto';
        var v = Lampa.Storage.get(ANDROIDTV_KEY, 'auto') || 'auto';
        if (v === 'on' || v === 'off' || v === 'auto') return v;
        return 'auto';
      } catch (e) { return 'auto'; }
    }
    function androidTvFocusActive() {
      var mode = getAndroidTvMode();
      if (mode === 'on') return true;
      if (mode === 'off') return false;
      return isAndroidTV();
    }
    function syncAndroidTvFocus() {
      if (!document.body) return;
      var on = androidTvFocusActive();
      document.body.setAttribute(ANDROIDTV_ATTR, on ? 'on' : 'off');
      if (on) document.body.classList.remove(GLARE_CLASS);
      else if (glareEnabled() && pluginEnabled()) document.body.classList.add(GLARE_CLASS);
    }

    function syncFocusScale() {
      if (!document.body) return;
      document.body.style.setProperty('--agnative-focus-scale', getFocusScale());
    }

    function syncPosterBorder() {
      if (!document.body) return;
      document.body.setAttribute(POSTER_BORDER_ATTR, posterBorderEnabled() ? 'on' : 'off');
    }

    // Hero banner was removed entirely (caused lag). These helpers are kept as
    // no-ops only so that any leftover internal callers stay safe; the feature
    // itself is fully disabled and never mounts.
    function heroEnabled() { return false; }
    function getHeroLogoSize() { return 'xs'; }
    function syncHero() {
      if (!document.body) return;
      document.body.setAttribute(HERO_ATTR, 'off');
      unmountHero();
    }

    function getHeroActivityComponent(e) {
      try {
        if (e && e.component) return e.component;
        if (e && e.object) {
          if (e.object.component) return e.object.component;
          if (e.object.activity && typeof e.object.activity.component === 'function') {
            return e.object.activity.component();
          }
          if (e.object.activity && e.object.activity.activity && e.object.activity.activity.component) {
            return e.object.activity.activity.component;
          }
        }
      } catch (err) { }
      return '';
    }

    function findNowWatchingLine() {
      // Russian / English / Ukrainian variants of the "now watching" rail title,
      // tolerant of word order and surrounding text (e.g. "Сейчас смотрят онлайн").
      var pattern = /смотрят\s+сейчас|сейчас\s+смотрят|зараз\s+дивляться|дивляться\s+зараз|now\s+watching|watching\s+now/i;
      // Look first in the hero's own activity, then fall back to the whole document.
      var roots = [];
      if (heroCurrentActivity) roots.push(heroCurrentActivity);
      roots.push(document);
      for (var r = 0; r < roots.length; r++) {
        var root = roots[r];
        if (!root || !root.querySelectorAll) continue;
        var lines = root.querySelectorAll('.items-line');
        for (var i = 0; i < lines.length; i++) {
          var titleEl = lines[i].querySelector('.items-line__title');
          if (!titleEl) continue;
          var text = (titleEl.textContent || '').trim();
          if (pattern.test(text)) return lines[i];
        }
      }
      return null;
    }

    function extractCardsFromLine(line) {
      var out = [];
      if (!line || !line.querySelectorAll) return out;
      var cards = line.querySelectorAll('.card');
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var data = null;
        try {
          if (window.$ && typeof window.$(card).data === 'function') data = window.$(card).data('card');
        } catch (e) { }
        if (!data) {
          // Fallback: try a JSON-encoded data-card attribute Lampa sometimes uses.
          var raw = card.getAttribute && card.getAttribute('data-card');
          if (raw) { try { data = JSON.parse(raw); } catch (e2) { } }
        }
        if (data && data.id && data.backdrop_path) {
          if (!data.media_type) data.media_type = data.first_air_date ? 'tv' : 'movie';
          if (data.media_type === 'movie' || data.media_type === 'tv') out.push(data);
        }
      }
      return out;
    }

    function trySwapHeroToNowWatching() {
      // After initial trending content shows, look for the "сейчас смотрят" rail
      // in the activity body and swap to it once it has loaded its cards.
      if (!heroEl) return false;
      var line = findNowWatchingLine();
      if (!line) return false;
      var items = extractCardsFromLine(line);
      if (!items.length) return false;
      heroItems = items.slice(0, 10);
      heroLastFetch = Date.now();
      heroIndex = 0;
      refreshHeroSlide();
      return true;
    }

    function scheduleHeroNowWatchingSwap() {
      // Retry over a longer window — Lampa loads the "сейчас смотрят" rail asynchronously
      // (CUB API + thumbnails). Even after it appears, individual cards may take a
      // moment to bind their data, so we keep checking until we have items or give up.
      var delays = [400, 800, 1500, 2500, 4000, 6000, 9000, 13000];
      var step = 0;
      function tick() {
        if (!heroEl) return;
        if (trySwapHeroToNowWatching()) return;
        if (step < delays.length) {
          setTimeout(tick, delays[step]);
          step++;
        }
      }
      var first = delays[step];
      step++;
      setTimeout(tick, first);
    }

    function fetchHeroItems(callback) {
      // Prefer the home page's own "сейчас смотрят" rail when it's already loaded.
      var domItems = extractCardsFromLine(findNowWatchingLine());
      if (domItems.length) {
        heroItems = domItems.slice(0, 10);
        heroLastFetch = Date.now();
        callback(heroItems);
        return;
      }
      var now = Date.now();
      if (heroItems.length && (now - heroLastFetch) < 30 * 60 * 1000) {
        callback(heroItems);
        return;
      }
      if (heroFetchPending) return;
      heroFetchPending = true;
      var lang = (function () {
        try { return Lampa.Storage.field('language') || 'ru'; } catch (e) { return 'ru'; }
      })();
      var url = 'https://api.themoviedb.org/3/trending/all/week?api_key=' + TMDB_KEY + '&language=' + lang;
      fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        heroFetchPending = false;
        var list = (data && data.results) ? data.results.filter(function (it) {
          return it && it.backdrop_path && (it.media_type === 'movie' || it.media_type === 'tv');
        }) : [];
        heroItems = list.slice(0, 10);
        heroLastFetch = Date.now();
        callback(heroItems);
      }).catch(function () {
        heroFetchPending = false;
        callback([]);
      });
    }

    function buildHeroEl() {
      var el = document.createElement('div');
      el.className = 'agnative-hero';
      el.innerHTML = [
        '<div class="agnative-hero__backdrop"></div>',
        '<div class="agnative-hero__shade"></div>',
        '<div class="agnative-hero__content">',
        '  <div class="agnative-hero__logo"></div>',
        '  <div class="agnative-hero__title"></div>',
        '  <div class="agnative-hero__meta"></div>',
        '  <div class="agnative-hero__overview"></div>',
        '</div>',
        '<div class="agnative-hero__dots"></div>'
      ].join('');

      // Watch button removed by user request — hero is purely decorative now.
      return el;
    }

    function refreshHeroNavCollection() {
      // Re-register the activity body's selector collection so the watch button
      // becomes reachable by the D-pad on Android TV. The hero is appended after
      // the activity's initial render, so its .selector wasn't in the original
      // navigation collection.
      try {
        if (!heroEl || !window.Lampa || !Lampa.Controller || !window.$) return;
        var host = heroCurrentActivity || (heroEl ? heroEl.parentNode : null);
        if (!host) return;
        var view = window.$(host);
        if (!view || !view.length) return;
        if (typeof Lampa.Controller.collectionSet === 'function') {
          Lampa.Controller.collectionSet(view);
        }
      } catch (e) { }
    }

    function scheduleHeroNavRefresh() {
      if (heroNavRefreshTimer) clearTimeout(heroNavRefreshTimer);
      heroNavRefreshTimer = setTimeout(function () {
        heroNavRefreshTimer = null;
        refreshHeroNavCollection();
      }, 60);
    }

    function ensureHeroController() {
      if (heroControllerReady) return;
      if (!window.Lampa || !Lampa.Controller || typeof Lampa.Controller.add !== 'function' || !window.$) return;
      heroControllerReady = true;
      Lampa.Controller.add('agnative_hero', {
        toggle: function () {
          if (!heroEl) return;
          try {
            var view = window.$(heroEl);
            var btn = qs('.agnative-hero__btn--watch', heroEl);
            Lampa.Controller.collectionSet(view);
            Lampa.Controller.collectionFocus(btn || false, view, true);
          } catch (e) { }
        },
        update: function () { },
        left: function () {
          if (!heroItems || heroItems.length < 2) return;
          stopHeroRotate();
          heroIndex = (heroIndex - 1 + heroItems.length) % heroItems.length;
          refreshHeroSlide();
          startHeroRotate();
        },
        right: function () {
          if (!heroItems || heroItems.length < 2) return;
          stopHeroRotate();
          heroIndex = (heroIndex + 1) % heroItems.length;
          refreshHeroSlide();
          startHeroRotate();
        },
        up: function () {
          try { Lampa.Controller.toggle('head'); } catch (e) { }
        },
        down: function () {
          try { Lampa.Controller.toggle('content'); } catch (e) { }
        },
        back: function () {
          try { Lampa.Controller.toggle('menu'); } catch (e) { }
        },
        enter: function () {
          if (heroItems && heroItems.length) openHeroItem(heroItems[heroIndex]);
        }
      });
    }

    function focusHeroController() {
      if (!heroEl || !window.Lampa || !Lampa.Controller) return;
      try {
        ensureHeroController();
        Lampa.Controller.toggle('agnative_hero');
      } catch (e) { }
    }

    function bindHeroBodyObserver() { /* no-op: dedicated agnative_hero controller handles nav */ }
    function startHeroBodyObserver() { /* no-op */ }
    function stopHeroBodyObserver() { /* no-op */ }

    function openHeroItem(item) {
      if (!item) return;
      try {
        Lampa.Activity.push({
          url: '',
          component: 'full',
          id: item.id,
          method: item.media_type === 'tv' ? 'tv' : 'movie',
          card: item
        });
      } catch (e) { }
    }

    function getYear(item) {
      var d = item.release_date || item.first_air_date || '';
      return d ? String(d).slice(0, 4) : '';
    }

    function renderHeroDots() {
      if (!heroEl) return;
      var dots = heroEl.querySelector('.agnative-hero__dots');
      if (!dots) return;
      var html = '';
      for (var i = 0; i < heroItems.length; i++) {
        html += '<span class="agnative-hero__dot' + (i === heroIndex ? ' is-active' : '') + '"></span>';
      }
      dots.innerHTML = html;
    }

    function refreshHeroSlide() {
      if (!heroEl || !heroItems.length) return;
      var item = heroItems[heroIndex];
      if (!item) return;

      // Bump a token so any stale async callbacks from a previous slide are ignored.
      var token = ++heroSlideToken;

      var backdrop = heroEl.querySelector('.agnative-hero__backdrop');
      var content = heroEl.querySelector('.agnative-hero__content');

      // Fade content out together with backdrop so old text never shows over new image.
      if (content) content.style.opacity = '0';
      if (backdrop) backdrop.style.opacity = '0';

      var backdropUrl = '';
      try {
        if (item.backdrop_path && window.Lampa && Lampa.TMDB && Lampa.TMDB.image) {
          backdropUrl = Lampa.TMDB.image('t/p/original' + item.backdrop_path);
        }
      } catch (e) { }

      var heroType = item.media_type === 'tv' ? 'tv' : 'movie';

      var backdropReady = !backdropUrl;
      var logoReady = false;
      var logoData = null;
      var applied = false;

      function applySlide() {
        if (applied) return;
        if (token !== heroSlideToken) return;
        if (!backdropReady || !logoReady) return;
        if (!heroEl) return;
        applied = true;

        var bd = heroEl.querySelector('.agnative-hero__backdrop');
        var ct = heroEl.querySelector('.agnative-hero__content');
        var titleEl = heroEl.querySelector('.agnative-hero__title');
        var logoEl = heroEl.querySelector('.agnative-hero__logo');
        var metaEl = heroEl.querySelector('.agnative-hero__meta');
        var overviewEl = heroEl.querySelector('.agnative-hero__overview');

        var title = item.title || item.name || '';
        var year = getYear(item);
        var rating = item.vote_average ? Number(item.vote_average).toFixed(1) : '';
        var genres = getGenreNames(item).slice(0, 3).join(' • ');

        // Swap backdrop + all text + logo together
        if (bd && backdropUrl) {
          bd.style.backgroundImage = 'url(' + backdropUrl + ')';
        }

        if (logoData && logoData.path && logoEl) {
          logoEl.innerHTML = '<img src="' + logoImgUrl(logoData.path) + '" alt="">';
          if (titleEl) {
            titleEl.textContent = title;
            titleEl.style.display = 'none';
          }
        } else {
          if (logoEl) logoEl.innerHTML = '';
          if (titleEl) {
            titleEl.textContent = title;
            titleEl.style.display = '';
          }
        }

        if (metaEl) {
          var parts = [];
          if (year) parts.push('<span>' + escapeHtml(year) + '</span>');
          if (rating) parts.push('<span class="agnative-hero__rating">' + escapeHtml(rating) + '</span>');
          if (genres) parts.push('<span>' + escapeHtml(genres) + '</span>');
          metaEl.innerHTML = parts.join('<span class="agnative-hero__sep">·</span>');
        }

        if (overviewEl) overviewEl.textContent = item.overview || '';

        renderHeroDots();

        requestAnimationFrame(function () {
          if (bd) bd.style.opacity = '1';
          if (ct) ct.style.opacity = '1';
        });

        // Make sure the watch button is in the active controller's collection.
        scheduleHeroNavRefresh();
      }

      if (backdropUrl) {
        var img = new Image();
        img.onload = function () { backdropReady = true; applySlide(); };
        img.onerror = function () { backdropReady = true; applySlide(); };
        img.src = backdropUrl;
      }

      try {
        fetchLogo(item.id, heroType, function (logo) {
          if (token !== heroSlideToken) return;
          logoData = logo;
          if (logo && logo.path) {
            // Pre-load the actual logo image bytes too, so the visible swap is fully atomic.
            var lImg = new Image();
            lImg.onload = function () { logoReady = true; applySlide(); };
            lImg.onerror = function () { logoReady = true; applySlide(); };
            lImg.src = logoImgUrl(logo.path);
          } else {
            logoReady = true;
            applySlide();
          }
        });
      } catch (e) {
        logoReady = true;
        applySlide();
      }

      // Safety: never leave the hero hidden if the network stalls.
      setTimeout(function () {
        if (token !== heroSlideToken) return;
        backdropReady = true;
        logoReady = true;
        applySlide();
      }, 4000);
    }

    function startHeroRotate() {
      stopHeroRotate();
      if (heroItems.length < 2) return;
      heroRotateTimer = setInterval(function () {
        if (!heroEl || document.hidden) return;
        heroIndex = (heroIndex + 1) % heroItems.length;
        refreshHeroSlide();
      }, 8000);
    }

    function stopHeroRotate() {
      if (heroRotateTimer) { clearInterval(heroRotateTimer); heroRotateTimer = null; }
    }

    function unmountHero() {
      stopHeroRotate();
      stopHeroBodyObserver();
      if (heroEl && heroEl.parentNode) heroEl.parentNode.removeChild(heroEl);
      heroEl = null;
      heroCurrentActivity = null;
      heroAutoFocusPending = false;
    }

    function mountHero(activityRender) {
      if (!heroEnabled()) { unmountHero(); return; }
      if (!activityRender) return;
      var body = activityRender.find ? (activityRender.find('.activity__body')[0] || activityRender[0]) : activityRender[0];
      if (!body) return;
      var $body = body;
      var freshMount = !(heroEl && heroEl.parentNode === $body);
      if (heroEl && heroEl.parentNode === $body) {
        heroCurrentActivity = $body;
      } else {
        unmountHero();
        heroEl = buildHeroEl();
        if ($body.firstChild) $body.insertBefore(heroEl, $body.firstChild);
        else $body.appendChild(heroEl);
        heroCurrentActivity = $body;
      }

      // Hero is decorative (no Watch button) — no controller registration or auto-focus.
      heroAutoFocusPending = false;

      fetchHeroItems(function (items) {
        if (!heroEl) return;
        if (!items || !items.length) { unmountHero(); return; }
        heroIndex = 0;
        refreshHeroSlide();
        startHeroRotate();
        // If the home page's "сейчас смотрят" rail finishes loading after us, swap to it.
        scheduleHeroNowWatchingSwap();
      });
    }

    function syncCardFlags() {
      if (!document.body) return;
      document.body.setAttribute(BACKDROP_ATTR, backdropEnabled() ? 'on' : 'off');
      document.body.setAttribute(BADGE_ATTR, badgeEnabled() ? 'on' : 'off');
      document.body.setAttribute(RATING_ATTR, ratingEnabled() ? 'on' : 'off');
      document.body.setAttribute(RATING_STYLE_ATTR, getRatingStyle());
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
        Lampa.Storage.set(ANDROIDTV_KEY, 'auto');
        Lampa.Storage.set(LOGO_SIZE_KEY, 'md');
        Lampa.Storage.set(COLOR_SCOPE_KEY, 'items');
        Lampa.Storage.set(BUBBLE_SIZE_KEY, '1.5');
        Lampa.Storage.set(BUBBLE_SCALE_KEY, '1.0');
        Lampa.Storage.set(BUBBLE_COLOR_H_KEY, '#ffffff');
        Lampa.Storage.set(BUBBLE_COLOR_M_KEY, '#ff9100');
        Lampa.Storage.set(BUBBLE_COLOR_DOT_KEY, '#ff9100');
        Lampa.Storage.set(SCREENSAVER_CLOCK_KEY, 'on');
        Lampa.Storage.set(CLOCK_FORMAT_KEY, '24');
        Lampa.Storage.set(CLOCK_DATE_KEY, 'off');
        Lampa.Storage.set(TOPNAV_ITEMS_KEY, ['main', 'movie', 'tv', 'cartoon']);
        Lampa.Storage.set(FOCUS_SCALE_KEY, '1.05');
        Lampa.Storage.set(POSTER_BORDER_KEY, 'on');
        logoCache = {};
        posterCache = {};
        clearAll();
        syncGlareClass();
        syncFontSize();
        syncLogoSize();
        syncHero();
        syncCardFlags();
        syncCardImageMode();
        syncOverlayAlign();
        syncPerfMode();
        syncAndroidTvFocus();
        syncFocusScale();
        syncPosterBorder();
        syncColorScope();
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
          name: 'Apple TV'
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { name: 'agnative_about_info', type: 'static' },
          field: {
            name: 'Apple TV',
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
            default: 'on'
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
            name: ANDROIDTV_KEY,
            type: 'select',
            values: {
              auto: t('val_androidtv_auto'),
              on: t('val_androidtv_on'),
              off: t('val_androidtv_off')
            },
            default: 'auto'
          },
          field: {
            name: t('set_androidtv_name'),
            description: t('set_androidtv_desc')
          },
          onChange: function () {
            syncAndroidTvFocus();
            initGlareRuntime();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: FOCUS_SCALE_KEY,
            type: 'select',
            values: {
              '1.0':  '1.0x — ' + t('val_off'),
              '1.05': '1.05x',
              '1.08': '1.08x',
              '1.1':  '1.1x',
              '1.15': '1.15x',
              '1.2':  '1.2x',
              '1.25': '1.25x',
              '1.3':  '1.3x'
            },
            default: '1.05'
          },
          field: {
            name: t('set_focus_scale_name'),
            description: t('set_focus_scale_desc')
          },
          onChange: function () {
            syncFocusScale();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: POSTER_BORDER_KEY,
            type: 'select',
            values: {
              on:  langText('extensions_enable',  t('val_on')),
              off: langText('extensions_disable', t('val_off'))
            },
            default: 'on'
          },
          field: {
            name: t('set_poster_border_name'),
            description: t('set_poster_border_desc')
          },
          onChange: function () {
            syncPosterBorder();
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
            clearAll();
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
            syncCardImageMode();
            resetCardSwitches();
            schedulePatch();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: POSTER_QUALITY_KEY,
            type: 'select',
            values: {
              w185: 'w185',
              w342: 'w342',
              w500: 'w500',
              w780: 'w780',
              original: 'original'
            },
            default: 'w500'
          },
          field: {
            name: t('set_poster_quality_name'),
            description: t('set_poster_quality_desc')
          },
          onChange: function () {
            resetCardSwitches();
            schedulePatch();
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

        // Hero banner settings were removed entirely — caused performance lag.

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
            name: COLOR_SCOPE_KEY,
            type: 'select',
            values: {
              items: t('val_color_scope_items'),
              tiles: t('val_color_scope_tiles'),
              all: t('val_color_scope_all')
            },
            default: 'items'
          },
          field: {
            name: t('set_color_scope_name'),
            description: t('set_color_scope_desc')
          },
          onChange: function () {
            syncColorScope();
          }
        });

        // The veoveo glare option was removed from the settings UI by user request.
        // The underlying GLARE_KEY storage is still honored for backward compatibility,
        // so previously enabled installs keep behaving the same.

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
            name: BUBBLE_SIZE_KEY,
            type: 'select',
            values: { '1.0': '1.0', '1.25': '1.25', '1.5': '1.5', '1.75': '1.75', '2.0': '2.0', '2.5': '2.5', '3.0': '3.0' },
            default: '1.5'
          },
          field: {
            name: t('set_bubble_size_name'),
            description: t('set_bubble_size_desc')
          },
          onChange: function () { applyBubbleStylesEverywhere(); }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: BUBBLE_SCALE_KEY,
            type: 'select',
            values: { '0.5': '0.5', '0.75': '0.75', '1.0': '1.0', '1.25': '1.25', '1.5': '1.5', '2.0': '2.0' },
            default: '1.0'
          },
          field: {
            name: t('set_bubble_scale_name'),
            description: t('set_bubble_scale_desc')
          },
          onChange: function () { applyBubbleStylesEverywhere(); }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: BUBBLE_COLOR_H_KEY,
            type: 'select',
            values: colorPaletteValues(),
            default: '#ffffff'
          },
          field: {
            name: t('set_bubble_color_h_name'),
            description: t('set_bubble_color_h_desc')
          },
          onChange: function () { applyBubbleStylesEverywhere(); }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: BUBBLE_COLOR_M_KEY,
            type: 'select',
            values: colorPaletteValues(),
            default: '#ff9100'
          },
          field: {
            name: t('set_bubble_color_m_name'),
            description: t('set_bubble_color_m_desc')
          },
          onChange: function () { applyBubbleStylesEverywhere(); }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: BUBBLE_COLOR_DOT_KEY,
            type: 'select',
            values: colorPaletteValues(),
            default: '#ff9100'
          },
          field: {
            name: t('set_bubble_color_dot_name'),
            description: t('set_bubble_color_dot_desc')
          },
          onChange: function () { applyBubbleStylesEverywhere(); }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: SCREENSAVER_CLOCK_KEY,
            type: 'select',
            values: { on: langText('extensions_enable', t('val_on')), off: langText('extensions_disable', t('val_off')) },
            default: 'on'
          },
          field: {
            name: t('set_screensaver_clock_name'),
            description: t('set_screensaver_clock_desc')
          },
          onChange: function (value) {
            if (value === 'off') unmountScreensaverClock();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: CLOCK_FORMAT_KEY,
            type: 'select',
            values: { '24': t('val_clock_format_24'), '12': t('val_clock_format_12') },
            default: '24'
          },
          field: {
            name: t('set_clock_format_name'),
            description: t('set_clock_format_desc')
          },
          onChange: function () { updateClock(); if (screensaverClockEl) writeBubbleTime(screensaverClockEl); }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: CLOCK_DATE_KEY,
            type: 'select',
            values: { on: langText('extensions_enable', t('val_on')), off: langText('extensions_disable', t('val_off')) },
            default: 'off'
          },
          field: {
            name: t('set_clock_date_name'),
            description: t('set_clock_date_desc')
          },
          onChange: function () { updateClock(); if (screensaverClockEl) writeBubbleTime(screensaverClockEl); }
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

      if (!screensaverListenerBound) {
        screensaverListenerBound = true;
        Lampa.Listener.follow('screensaver', function (e) {
          if (!pluginEnabled()) return;
          if (e.type === 'start') mountScreensaverClock();
          else if (e.type === 'stop') unmountScreensaverClock();
        });
      }
      bindScreensaverDomWatcher();

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
            clearAll();
            setTimeout(function () { schedulePatch(); }, 80);
            return;
          }

          if (e.name === UI_LANG_KEY) {
            setTimeout(function () { schedulePatch(); }, 80);
            return;
          }

          if (e.name === ANDROIDTV_KEY) {
            syncAndroidTvFocus();
            initGlareRuntime();
            return;
          }

          if (e.name === FOCUS_SCALE_KEY) {
            syncFocusScale();
            return;
          }

          if (e.name === POSTER_BORDER_KEY) {
            syncPosterBorder();
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
        '  background: var(--main-color, rgba(255,255,255,.085)) !important;',
        '  border-color: transparent !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.10) !important;',
        '  color: #fff !important;',
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
        '  background: var(--main-color, rgba(255,255,255,.085)) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(255,255,255,.08) !important;',
        '  border-color: rgba(255,255,255,.10) !important;',
        '  color: #fff !important;',
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
        'body.' + BODY_CLASS + ' .head__logo-icon {',
        '  display: none !important;',
        '}',
        // The topnav pill (Search / Favorites / etc.) used to be centered horizontally.
        // User asked to push it as far left as possible. We leave room for the hamburger
        // .head__menu-icon (positioned at left:1em, width:2.6em) and the clock on the right.
        'body.' + BODY_CLASS + ' .agnative-topnav-shell { position:absolute; left:4.2em; top:.46em; transform:none; z-index:20; width:max-content; max-width:calc(100vw - 12em); height:2.6em; display:inline-flex; align-items:center; box-sizing:border-box; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__inner { height:2.6em; box-sizing:border-box; display:inline-flex; align-items:center; gap:.18em; padding:.21em .32em; border-radius:999px; background:rgba(22,24,30,.28); border:1px solid rgba(255,255,255,.10); box-shadow:inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%); }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__items { display:flex; align-items:center; justify-content:center; gap:.08em; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__right { display:flex; align-items:center; gap:.08em; margin-left:.12em; padding-left:.18em; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__item.selector { appearance:none; -webkit-appearance:none; border:0; background:none; color:rgba(255,255,255,.92); height:2.16em; display:inline-flex; align-items:center; justify-content:center; text-align:center; padding:0 .96em; border-radius:999px; font-size:.83em; font-weight:700; line-height:1; white-space:nowrap; transition:background .2s ease, transform .2s ease, box-shadow .2s ease; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__item--icon.selector { width:2.16em; min-width:2.16em; padding:0; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__item--icon svg { width:1em; height:1em; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-right__profile.selector { width:2.16em; min-width:2.16em; padding:0; overflow:hidden; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-right__profile-img { width:1.56em; height:1.56em; border-radius:999px; object-fit:cover; display:block; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__item.is-active, body.' + BODY_CLASS + ' .agnative-topnav-shell__item.hover, body.' + BODY_CLASS + ' .agnative-topnav-shell__item.focus { background:var(--main-color, rgba(255,255,255,.14)); box-shadow:inset 0 1px 0 rgba(255,255,255,.10); color:#fff; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-rightdock { position:absolute; right:1.15em; top:.46em; z-index:20; min-height:2.6em; box-sizing:border-box; display:inline-flex; align-items:center; gap:.08em; padding:.21em .32em; border-radius:1.4em; background:rgba(22,24,30,.28); border:1px solid rgba(255,255,255,.10); box-shadow:inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%); }',
        'body.' + BODY_CLASS + ' .agnative-topnav-rightdock .agnative-topnav-clock { position:static !important; right:auto !important; top:auto !important; z-index:auto !important; height:auto !important; min-height:2.16em !important; min-width:4.2em !important; padding:.18em .95em !important; background:transparent !important; border:0 !important; box-shadow:none !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important; transition:background .2s ease, transform .2s ease, box-shadow .2s ease; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-rightdock .agnative-topnav-clock.hover, body.' + BODY_CLASS + ' .agnative-topnav-rightdock .agnative-topnav-clock.focus, body.' + BODY_CLASS + ' .agnative-topnav-rightdock .agnative-topnav-right__profile.hover, body.' + BODY_CLASS + ' .agnative-topnav-rightdock .agnative-topnav-right__profile.focus { background:rgba(255,255,255,.14) !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.10) !important; transform:translateY(-.02em); }',
        'body.' + BODY_CLASS + '[' + COLOR_SCOPE_ATTR + '="all"] .agnative-topnav-rightdock .agnative-topnav-clock.hover, body.' + BODY_CLASS + '[' + COLOR_SCOPE_ATTR + '="all"] .agnative-topnav-rightdock .agnative-topnav-clock.focus, body.' + BODY_CLASS + '[' + COLOR_SCOPE_ATTR + '="all"] .agnative-topnav-rightdock .agnative-topnav-right__profile.hover, body.' + BODY_CLASS + '[' + COLOR_SCOPE_ATTR + '="all"] .agnative-topnav-rightdock .agnative-topnav-right__profile.focus { background:var(--main-color, rgba(255,255,255,.14)) !important; color:#fff !important; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-clock { position:absolute; right:1.15em; top:.46em; z-index:20; display:inline-flex; align-items:center; justify-content:center; min-width:4.2em; height:2.6em; padding:0 .95em; border-radius:999px; background:rgba(22,24,30,.26); border:1px solid rgba(255,255,255,.10); box-shadow:inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%); color:rgba(255,255,255,.95); font-size:.92em; font-weight:700; letter-spacing:.01em; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-clock.selector { cursor:pointer; }',
        'body.' + BODY_CLASS + ' .agnative-bubble-clock { display:inline-flex !important; flex-direction:column !important; align-items:center !important; justify-content:center !important; font-weight:900 !important; line-height:1 !important; letter-spacing:.02em !important; gap:0 !important; }',
        'body.' + BODY_CLASS + ' .agnative-bubble-clock .agnative-bubble-clock__time { display:flex; align-items:center; justify-content:center; line-height:1; }',
        'body.' + BODY_CLASS + ' .agnative-bubble-clock .agnative-bubble-clock__date { font-size:.32em; font-weight:600; line-height:1.1; letter-spacing:.04em; opacity:.85; margin-top:.32em; white-space:nowrap; text-transform:capitalize; }',
        'body.' + BODY_CLASS + ' .agnative-bubble-clock .agnative-bubble-clock__unit { display:inline-block; padding:0 .04em; line-height:1; }',
        'body.' + BODY_CLASS + ' .agnative-bubble-clock .agnative-bubble-clock__dot { display:inline-block; padding:0 .04em; line-height:1; transition:opacity .15s linear; }',
        'body.' + BODY_CLASS + ' .agnative-screensaver-clock { position:fixed; left:0; top:0; right:0; bottom:0; z-index:99999; display:flex; align-items:center; justify-content:center; pointer-events:none; background:transparent; }',
        'body.' + BODY_CLASS + ' .agnative-screensaver-clock__inner { font-weight:900; line-height:1; letter-spacing:.04em; text-shadow:0 4px 24px rgba(0,0,0,.65); animation:agnativeScreensaverFloat 30s ease-in-out infinite; }',
        'body.' + BODY_CLASS + ' .agnative-screensaver-clock .agnative-bubble-clock__date { font-size:.18em !important; font-weight:700 !important; letter-spacing:.06em !important; opacity:.9 !important; margin-top:.45em !important; text-align:center !important; text-transform:capitalize !important; text-shadow:0 2px 12px rgba(0,0,0,.6) !important; white-space:nowrap !important; }',
        '@keyframes agnativeScreensaverFloat { 0% { transform:translate(-12vw,-18vh) scaleX(1); } 25% { transform:translate(14vw,-22vh) scaleX(1); } 50% { transform:translate(16vw,18vh) scaleX(1); } 75% { transform:translate(-14vw,22vh) scaleX(1); } 100% { transform:translate(-12vw,-18vh) scaleX(1); } }',
        'body.' + BODY_CLASS + ' .agnative-control-panel { position:absolute; right:1.15em; top:3.7em; z-index:26; width:18.8em; padding:.72em; border-radius:1.18em; background:rgba(40,48,62,.76); border:1px solid rgba(255,255,255,.13); box-shadow:0 18px 48px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.09); backdrop-filter:blur(22px) saturate(136%); -webkit-backdrop-filter:blur(22px) saturate(136%); opacity:0; transform:translateY(-.35em) scale(.98); pointer-events:none; transition:opacity .2s ease, transform .2s ease; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel.is-open { opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__title { font-size:1.28em; font-weight:600; color:rgba(255,255,255,.94); padding:.18em .15em .52em; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.48em; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector { min-height:5.2em; border-radius:.95em; background:rgba(16,20,28,.82); border:1px solid rgba(255,255,255,.10); display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:.34em; padding:.65em .72em; color:rgba(255,255,255,.95); transition:background .2s ease, box-shadow .2s ease, transform .2s ease; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector .agnative-control-panel__icon { width:1.3em; height:1.3em; display:inline-flex; align-items:center; justify-content:center; color:rgba(214,230,255,.97); }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector .agnative-control-panel__icon svg { width:1.3em; height:1.3em; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector .agnative-control-panel__label { font-size:.95em; font-weight:700; line-height:1.15; text-align:left; }',
        'body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector.hover, body.' + BODY_CLASS + ' .agnative-control-panel__tile.selector.focus { background:rgba(255,255,255,.18); box-shadow:inset 0 1px 0 rgba(255,255,255,.18), 0 0 0 1px rgba(255,255,255,.12); transform:translateY(-.02em); }',
        'body.' + BODY_CLASS + '[' + COLOR_SCOPE_ATTR + '="tiles"] .agnative-control-panel__tile.selector.hover, body.' + BODY_CLASS + '[' + COLOR_SCOPE_ATTR + '="tiles"] .agnative-control-panel__tile.selector.focus, body.' + BODY_CLASS + '[' + COLOR_SCOPE_ATTR + '="all"] .agnative-control-panel__tile.selector.hover, body.' + BODY_CLASS + '[' + COLOR_SCOPE_ATTR + '="all"] .agnative-control-panel__tile.selector.focus { background:var(--main-color, rgba(255,255,255,.18)); color:#fff; }',
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
        'body.' + BODY_CLASS + ' .nfx-card-overlay { position:absolute; left:0; right:0; bottom:0; z-index:0; display:block !important; opacity:1 !important; visibility:visible !important; border-radius:0 0 1.35em 1.35em !important; background:linear-gradient(0deg, rgba(6,8,14,.88) 0%, rgba(6,8,14,.56) 38%, rgba(6,8,14,.16) 68%, rgba(6,8,14,0) 100%) !important; padding:2.15em 1.02em .92em !important; transform: translateZ(14px); transition: transform .28s cubic-bezier(.22,.61,.36,1), opacity .24s ease; pointer-events:none; }',
        'body.' + BODY_CLASS + ' .card.focus .nfx-card-overlay { transform: translateZ(18px) translateY(-.02em); }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__logo, body.' + BODY_CLASS + ' img.nfx-card-overlay__logo { display:block !important; opacity:1 !important; visibility:visible !important; max-height:2.55em !important; max-width:82% !important; margin-bottom:.28em !important; border-radius:0 !important; clip-path:none !important; -webkit-clip-path:none !important; mask-image:none !important; -webkit-mask-image:none !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__title { color:#fff; font-size:1.02em !important; line-height:1.14 !important; font-weight:800 !important; text-shadow:0 2px 12px rgba(0,0,0,.5); white-space:normal !important; display:-webkit-box !important; -webkit-line-clamp:2 !important; -webkit-box-orient:vertical !important; overflow:hidden !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__meta { color:rgba(255,255,255,.88); font-size:.74em !important; margin-top:.2em !important; line-height:1.28 !important; white-space:normal !important; max-width:100% !important; text-shadow:0 1px 8px rgba(0,0,0,.45); }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="start"] .nfx-card-overlay { text-align:left !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="center"] .nfx-card-overlay { text-align:center !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="end"] .nfx-card-overlay { text-align:right !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="center"] .nfx-card-overlay__logo, body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="center"] img.nfx-card-overlay__logo { margin-left:auto !important; margin-right:auto !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="end"] .nfx-card-overlay__logo, body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="end"] img.nfx-card-overlay__logo { margin-left:auto !important; margin-right:0 !important; }',
        'body.' + BODY_CLASS + '[' + CARD_IMAGE_MODE_ATTR + '="poster"] .nfx-card-overlay { background:linear-gradient(0deg, rgba(6,8,14,.92) 0%, rgba(6,8,14,.6) 38%, rgba(6,8,14,.2) 70%, rgba(6,8,14,0) 100%) !important; }',
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
        'body.' + BODY_CLASS + ' .agnative-topnav-clock:not(.agnative-bubble-clock) { font-size: calc(.88em * var(--agnative-scale, 1)) !important; }',
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
        'body.' + BODY_CLASS + ' .navigation-bar__item.is-active, body.' + BODY_CLASS + ' .navigation-bar__item.hover, body.' + BODY_CLASS + ' .navigation-bar__item.focus, body.' + BODY_CLASS + ' .navigation-bar__item:hover, body.' + BODY_CLASS + ' .navigation-bar__item:focus { background: var(--main-color, rgba(255,255,255,.16)) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.14) !important; color: #fff !important; transform: translateY(-.04em) !important; }',

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

        /* ── Focus scale (масштаб при фокусе) ── */
        'body.' + BODY_CLASS + ' .card.focus .card__view { transform: scale(var(--agnative-focus-scale, 1.05)) !important; }',
        /* Ultra & AndroidTV: масштаб отключён — их правила с !important идут позже и перекрывают */

        /* ── Poster border (рамка постера) ── */
        'body.' + BODY_CLASS + '[' + POSTER_BORDER_ATTR + '="on"] .card.focus .card__view { box-shadow: 0 0 0 3px var(--main-color, rgba(86,141,255,.95)), 0 8px 24px rgba(0,0,0,.38) !important; }',
        'body.' + BODY_CLASS + '[' + POSTER_BORDER_ATTR + '="on"] .card.hover .card__view  { box-shadow: 0 0 0 2px var(--main-color, rgba(86,141,255,.55)), 0 6px 16px rgba(0,0,0,.26) !important; }',
        /* Poster border в ultra-режиме — только тонкая граница без blur */
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"][' + POSTER_BORDER_ATTR + '="on"] .card.focus .card__view { box-shadow: 0 0 0 3px rgba(86,141,255,.95) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"][' + POSTER_BORDER_ATTR + '="on"] .card.hover .card__view  { box-shadow: 0 0 0 2px rgba(86,141,255,.55) !important; }',

        /* ── Быстрые переходы для слабых устройств (low perf) ── */
        /* Уменьшаем длительность transition и включаем GPU-слой для плавности */
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card .card__view { transition: transform 80ms linear, box-shadow 80ms linear !important; transform: translateZ(0); }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card.focus .card__view { transform: scale(var(--agnative-focus-scale, 1.05)) translateZ(0) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card-episode .full-episode__img { transition: transform 80ms linear, box-shadow 80ms linear !important; transform: translateZ(0); }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .nfx-card-overlay { transition: opacity 80ms linear !important; }',

        '@media (max-width: 767px) {',
        '  body.' + BODY_CLASS + ' .agnative-topnav-shell { display: none !important; }',
        '  body.' + BODY_CLASS + ' .agnative-topnav-rightdock { font-size: 1.3em !important; }',
        '  body.' + BODY_CLASS + ' .head__menu-icon { font-size: 1.3em !important; }',
        '  body.' + BODY_CLASS + ' .head__navigator { position: absolute !important; top: 0 !important; left: 1em !important; font-size: 1.3em !important; }',
        '  body.' + BODY_CLASS + ' .activity.layer--width.activity--active { padding-top: 2em !important; }',
        '  body.' + BODY_CLASS + ' .head__navigator:empty { display: none !important; }',
        '}',

        // Hero banner CSS removed — feature was disabled because it caused lag.
        // A single hard hide stays in case some upgrade path leaves a stale node behind.
        '.agnative-hero { display: none !important; }',

        'body[' + ANDROIDTV_ATTR + '="on"] .card,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card *,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode *,',
        'body[' + ANDROIDTV_ATTR + '="on"] .full-start-new__poster,',
        'body[' + ANDROIDTV_ATTR + '="on"] .menu__item,',
        'body[' + ANDROIDTV_ATTR + '="on"] .selector {',
        '  transition: none !important;',
        '  animation: none !important;',
        '}',
        'body[' + ANDROIDTV_ATTR + '="on"] .card,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode,',
        'body[' + ANDROIDTV_ATTR + '="on"] .full-start-new__poster {',
        '  will-change: auto !important;',
        '  transform-style: flat !important;',
        '  perspective: none !important;',
        '}',
        'body[' + ANDROIDTV_ATTR + '="on"] .card .card__view,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card.focus .card__view,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card.hover .card__view,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode .full-episode__img,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode.focus .full-episode__img,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode.hover .full-episode__img,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode.focus .full-episode,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode.hover .full-episode,',
        'body[' + ANDROIDTV_ATTR + '="on"] .full-start-new__poster.focus,',
        'body[' + ANDROIDTV_ATTR + '="on"] .full-start-new__poster.hover {',
        '  transform: none !important;',
        '  filter: none !important;',
        '  -webkit-filter: none !important;',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '}',
        'body[' + ANDROIDTV_ATTR + '="on"] .card.focus .card__view,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card.hover .card__view {',
        '  box-shadow: 0 0 0 3px rgba(86,141,255,.95) !important;',
        '  box-sizing: border-box !important;',
        '}',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode.focus .full-episode__img,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode.hover .full-episode__img {',
        '  box-shadow: 0 0 0 3px rgba(86,141,255,.95) !important;',
        '  box-sizing: border-box !important;',
        '}',
        'body[' + ANDROIDTV_ATTR + '="on"] .card .card__view::after,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode .full-episode__img::after,',
        'body[' + ANDROIDTV_ATTR + '="on"] .full-start-new__poster::after {',
        '  display: none !important;',
        '  content: none !important;',
        '}',
        'body[' + ANDROIDTV_ATTR + '="on"] .nfx-card-overlay {',
        '  transform: none !important;',
        '  transition: none !important;',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '}',
        'body[' + ANDROIDTV_ATTR + '="on"] .card img,',
        'body[' + ANDROIDTV_ATTR + '="on"] .card-episode img,',
        'body[' + ANDROIDTV_ATTR + '="on"] .full-start-new__poster img {',
        '  image-rendering: -webkit-optimize-contrast;',
        '}',
        'body[' + ANDROIDTV_ATTR + '="on"] .menu__item.focus,',
        'body[' + ANDROIDTV_ATTR + '="on"] .menu__item.hover,',
        'body[' + ANDROIDTV_ATTR + '="on"] .settings-param.focus,',
        'body[' + ANDROIDTV_ATTR + '="on"] .settings-folder.focus,',
        'body[' + ANDROIDTV_ATTR + '="on"] .selectbox-item.focus {',
        '  transform: none !important;',
        '  filter: none !important;',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
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
        clock.className = 'agnative-topnav-clock agnative-bubble-clock selector';
        clock.setAttribute('data-selector', 'true');
        clock.setAttribute('tabindex', '0');
        bindAction(clock, function () { triggerClockActions(head); });
      }
      if (!qs('.agnative-bubble-clock__h', clock) || !qs('.agnative-bubble-clock__time', clock)) {
        clock.innerHTML = '<div class="agnative-bubble-clock__time">' +
          '<span class="agnative-bubble-clock__h agnative-bubble-clock__unit">00</span>' +
          '<span class="agnative-bubble-clock__dot">:</span>' +
          '<span class="agnative-bubble-clock__m agnative-bubble-clock__unit">00</span>' +
          '</div>' +
          '<div class="agnative-bubble-clock__date"></div>';
      }
      applyBubbleClockStyles(clock);
      if (clock.parentNode !== dock) dock.appendChild(clock);
      return clock;
    }

    function applyBubbleClockStyles(root) {
      try {
        if (!root) return;
        var size = parseFloat(getBubbleSize()) || 1.5;
        var scale = parseFloat(getBubbleScale()) || 1.0;
        var ch = resolveBubbleColor(getBubbleColorH(), '#ffffff');
        var cm = resolveBubbleColor(getBubbleColorM(), '#ff9100');
        var cd = resolveBubbleColor(getBubbleColorDot(), '#ff9100');
        root.style.fontSize = size + 'em';
        root.style.transform = 'scaleX(' + scale + ')';
        root.style.transformOrigin = 'right center';
        var h = qs('.agnative-bubble-clock__h', root);
        var m = qs('.agnative-bubble-clock__m', root);
        var dot = qs('.agnative-bubble-clock__dot', root);
        if (h) h.style.color = ch;
        if (m) m.style.color = cm;
        if (dot) dot.style.color = cd;
      } catch (e) { }
    }

    function applyBubbleStylesEverywhere() {
      try {
        var topClock = document.getElementById(CLOCK_ID);
        if (topClock) applyBubbleClockStyles(topClock);
        if (screensaverClockEl) applyScreensaverClockStyles(screensaverClockEl);
      } catch (e) { }
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

    function writeBubbleTime(root) {
      if (!root) return;
      var d = new Date();
      var h24 = d.getHours();
      var format = clockFormat();
      var hh, suffix = '';
      if (format === '12') {
        var h12 = h24 % 12; if (h12 === 0) h12 = 12;
        hh = String(h12).padStart(2, '0');
        suffix = h24 >= 12 ? ' PM' : ' AM';
      } else {
        hh = String(h24).padStart(2, '0');
      }
      var mm = String(d.getMinutes()).padStart(2, '0');
      var ss = clockSecondsEnabled() ? String(d.getSeconds()).padStart(2, '0') : null;
      var h = qs('.agnative-bubble-clock__h', root);
      var m = qs('.agnative-bubble-clock__m', root);
      if (h) h.textContent = hh;
      if (m) m.textContent = (ss !== null ? mm + ':' + ss : mm) + suffix;
      var dateEl = qs('.agnative-bubble-clock__date', root);
      if (dateEl) {
        // The screensaver clock always shows weekday + date so the user can read it from
        // across the room while idle, regardless of the topnav clock-date preference.
        var isScreensaver = false;
        try {
          isScreensaver = !!(root.classList && root.classList.contains('agnative-screensaver-clock'))
            || !!(root.closest && root.closest('.agnative-screensaver-clock'));
        } catch (e) { isScreensaver = false; }
        if (isScreensaver || clockDateEnabled()) {
          dateEl.style.display = '';
          dateEl.textContent = formatBubbleDate(d);
        } else {
          dateEl.style.display = 'none';
          dateEl.textContent = '';
        }
      }
    }

    function updateClock() {
      var clock = document.getElementById(CLOCK_ID);
      if (!clock) return;
      writeBubbleTime(clock);
    }

    function startBubbleBlink() {
      if (bubbleBlinkTimer) return;
      bubbleBlinkTimer = setInterval(function () {
        var clock = document.getElementById(CLOCK_ID);
        if (!clock) return;
        var dot = qs('.agnative-bubble-clock__dot', clock);
        if (!dot) return;
        dot.style.opacity = dot.style.opacity === '0' ? '1' : '0';
      }, 500);
    }

    function stopBubbleBlink() {
      if (bubbleBlinkTimer) {
        clearInterval(bubbleBlinkTimer);
        bubbleBlinkTimer = null;
      }
    }

    function startClock() {
      updateClock();
      startBubbleBlink();
      if (clockTimer) return;
      var period = clockSecondsEnabled() ? 1000 : 1000 * 20;
      clockTimer = setInterval(updateClock, period);
    }

    function restartClock() {
      if (clockTimer) {
        clearInterval(clockTimer);
        clockTimer = null;
      }
      stopBubbleBlink();
      startClock();
    }

    function applyScreensaverClockStyles(root) {
      try {
        if (!root) return;
        var size = parseFloat(getBubbleSize()) || 1.5;
        var scale = parseFloat(getBubbleScale()) || 1.0;
        var ch = resolveBubbleColor(getBubbleColorH(), '#ffffff');
        var cm = resolveBubbleColor(getBubbleColorM(), '#ff9100');
        var cd = resolveBubbleColor(getBubbleColorDot(), '#ff9100');
        var inner = qs('.agnative-screensaver-clock__inner', root);
        if (inner) {
          inner.style.fontSize = (size * 5) + 'em';
          inner.style.transform = 'scaleX(' + scale + ')';
          inner.style.transformOrigin = 'center center';
        }
        var h = qs('.agnative-bubble-clock__h', root);
        var m = qs('.agnative-bubble-clock__m', root);
        var dot = qs('.agnative-bubble-clock__dot', root);
        if (h) h.style.color = ch;
        if (m) m.style.color = cm;
        if (dot) dot.style.color = cd;
      } catch (e) { }
    }

    function mountScreensaverClock() {
      try {
        if (!screensaverClockEnabled()) return;
        if (screensaverClockEl && document.body.contains(screensaverClockEl)) return;
        var root = document.createElement('div');
        root.className = 'agnative-screensaver-clock';
        root.innerHTML = '<div class="agnative-screensaver-clock__inner agnative-bubble-clock">' +
          '<div class="agnative-bubble-clock__time">' +
          '<span class="agnative-bubble-clock__h agnative-bubble-clock__unit">00</span>' +
          '<span class="agnative-bubble-clock__dot">:</span>' +
          '<span class="agnative-bubble-clock__m agnative-bubble-clock__unit">00</span>' +
          '</div>' +
          '<div class="agnative-bubble-clock__date"></div>' +
          '</div>';
        document.body.appendChild(root);
        screensaverClockEl = root;
        applyScreensaverClockStyles(root);
        writeBubbleTime(root);
        if (screensaverClockTimer) clearInterval(screensaverClockTimer);
        screensaverClockTimer = setInterval(function () { writeBubbleTime(root); }, 1000 * 20);
        if (screensaverBlinkTimer) clearInterval(screensaverBlinkTimer);
        screensaverBlinkTimer = setInterval(function () {
          var dot = qs('.agnative-bubble-clock__dot', root);
          if (!dot) return;
          dot.style.opacity = dot.style.opacity === '0' ? '1' : '0';
        }, 500);
      } catch (e) { }
    }

    function unmountScreensaverClock() {
      try {
        if (screensaverClockTimer) {
          clearInterval(screensaverClockTimer);
          screensaverClockTimer = null;
        }
        if (screensaverBlinkTimer) {
          clearInterval(screensaverBlinkTimer);
          screensaverBlinkTimer = null;
        }
        if (screensaverClockEl && screensaverClockEl.parentNode) {
          screensaverClockEl.parentNode.removeChild(screensaverClockEl);
        }
        screensaverClockEl = null;
      } catch (e) { }
    }

    function isScreensaverDomActive() {
      try {
        if (document.body && document.body.classList) {
          if (document.body.classList.contains('screensaver') ||
              document.body.classList.contains('screensaver--enabled') ||
              document.body.classList.contains('screensaver-active') ||
              document.body.classList.contains('screensaver-on')) {
            return true;
          }
        }
        var el = document.querySelector('.screensaver, .screensaver--enabled, .screensaver-active, #screensaver, .screensaver-block, .screensaver-clock, .screensaver-image');
        if (el && el.offsetParent !== null) return true;
        if (el) {
          // Some builds keep the element off the layout; treat as active if it has children/visibility.
          var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
          if (!style || (style.display !== 'none' && style.visibility !== 'hidden')) return true;
        }
      } catch (e) { }
      return false;
    }

    function syncScreensaverClockFromDom() {
      if (!pluginEnabled()) return;
      var enabled = screensaverClockEnabled();
      var active = isScreensaverDomActive();
      if (enabled && active && !screensaverClockEl) {
        try { mountScreensaverClock(); } catch (e) { }
      } else if ((!enabled || !active) && screensaverClockEl) {
        // Only auto-unmount when DOM clearly shows the saver is gone.
        if (!active) {
          try { unmountScreensaverClock(); } catch (e) { }
        }
      }
    }

    function bindScreensaverDomWatcher() {
      if (screensaverWatcherBound) return;
      screensaverWatcherBound = true;
      try {
        if (typeof MutationObserver !== 'undefined' && document.body) {
          screensaverDomObserver = new MutationObserver(function () {
            syncScreensaverClockFromDom();
          });
          screensaverDomObserver.observe(document.body, {
            childList: true,
            subtree: false,
            attributes: true,
            attributeFilter: ['class']
          });
          // Also watch direct children additions to <html> in case the saver mounts above body.
          if (document.documentElement) {
            try {
              screensaverDomObserver.observe(document.documentElement, {
                childList: true,
                subtree: false,
                attributes: true,
                attributeFilter: ['class']
              });
            } catch (e) { }
          }
        }
      } catch (e) { }
      // Lightweight poll as a final safety net for builds that mount the saver
      // deep in the DOM without touching <body>/<html> attributes.
      if (!screensaverDomPollTimer) {
        screensaverDomPollTimer = setInterval(syncScreensaverClockFromDom, 4000);
      }
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
          if (path) imgPreload(Lampa.TMDB.image('t/p/w500' + path));
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
      var imageMode = getCardImageMode();
      var posterQ = getPosterQuality();
      var posterMode = imageMode === 'poster';
      // Backdrop mode also depends on the user's "show backdrops" toggle; in poster mode
      // we always swap the image regardless of that flag.
      var useBackdrop = !posterMode && backdropEnabled();

      function applyImg(imgEl, url) {
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

      var imgEl = cardEl.querySelector('.card__img');
      if (imgEl) {
        if (imgEl.tagName === 'IMG') {
          if (!imgEl.hasAttribute('data-nfx-original-src')) {
            imgEl.setAttribute('data-nfx-original-src', imgEl.getAttribute('src') || '');
          }
        } else if (!imgEl.hasAttribute('data-nfx-original-bg')) {
          imgEl.setAttribute('data-nfx-original-bg', imgEl.style.backgroundImage || '');
        }
      }

      if (imgEl && useBackdrop && data.backdrop_path) {
        applyImg(imgEl, Lampa.TMDB.image('t/p/w500' + data.backdrop_path));
      } else if (imgEl && posterMode && data.poster_path) {
        applyImg(imgEl, Lampa.TMDB.image('t/p/' + posterQ + data.poster_path));
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
      // In poster mode the artwork already contains the title, so suppress the logo fetch.
      if (!isUltra && !posterMode) {
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
        rating.textContent = vote.toFixed(1);
        view.appendChild(rating);
      }

      // Fallback poster fetch when neither backdrop nor poster paths were available
      // upfront. Skip it when we already swapped to a poster from data.poster_path.
      if (!useBackdrop && !posterMode && data.id && imgEl) {
        fetchCleanPoster(data.id, tmdbType, function (posterPath) {
          if (!posterPath) return;
          var url = Lampa.TMDB.image('t/p/' + posterQ + posterPath);
          if (imgEl.tagName === 'IMG') {
            imgLoad(url, function (src) {
              imgEl.onload = function () { if (src !== url) URL.revokeObjectURL(src); };
              imgEl.onerror = function () { if (src !== url) URL.revokeObjectURL(src); };
              imgEl.src = src;
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
      if (androidTvFocusActive()) return;
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
      syncCardImageMode();
      syncOverlayAlign();
      syncPerfMode();
      syncAndroidTvFocus();
      syncFocusScale();
      syncPosterBorder();
      syncColorScope();

      var content = qs('.activity--active .scroll__content') || qs('.scroll__content');
      patchTopnav();
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
      syncHero();
      syncCardFlags();
      syncCardImageMode();
      syncOverlayAlign();
      syncPerfMode();
      syncAndroidTvFocus();
      syncFocusScale();
      syncPosterBorder();
      syncColorScope();
      syncFlexGapFlag();
      observeCards();
      initGlareRuntime();
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


    // =============================================================
    // МОДУЛЬ 2: TrailerMax — авто-трейлеры и слайд-шоу
    // =============================================================

(function () {
    "use strict";

    function State(object) {
        this.state = object.state;
        this.start = function () {
            this.dispatch(this.state);
        };
        this.dispatch = function (action_name) {
            var action = object.transitions[action_name];
            if (action) {
                action.call(this, this);
            } else {
                console.log("invalid action");
            }
        };
    }

    var Player = (function () {
        function Player(object, video, isBgMode) {
            var _this = this;
            this.paused = false;
            this.display = false;
            this.ended = false;
            this.isBgMode = isBgMode;
            this.video = video;
            this.listener = Lampa.Subscribe();

            this.html = $('<div class="cardify-trailer ' + (this.isBgMode ? 'bg-mode' : 'fg-mode') + '">' +
                '<div class="cardify-trailer__youtube">' +
                    '<div class="cardify-trailer__youtube-iframe"></div>' +
                    '<div class="cardify-trailer__youtube-line one"></div>' +
                    '<div class="cardify-trailer__youtube-line two"></div>' +
                '</div>' +
                (!this.isBgMode ? '<div class="cardify-trailer__controlls">' +
                    '<div class="cardify-trailer__title"></div>' +
                    '<div class="cardify-trailer__remote">' +
                        '<div class="cardify-trailer__remote-icon">' +
                            '<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                                '<path d="M32.5196 7.22042L26.7992 12.9408C27.8463 14.5217 28.4561 16.4175 28.4561 18.4557C28.4561 20.857 27.6098 23.0605 26.1991 24.7844L31.8718 30.457C34.7226 27.2724 36.4561 23.0667 36.4561 18.4561C36.4561 14.2059 34.983 10.2998 32.5196 7.22042Z" fill="white" fill-opacity="0.28"/>' +
                                '<path d="M31.262 31.1054L31.1054 31.262C31.158 31.2102 31.2102 31.158 31.262 31.1054Z" fill="white" fill-opacity="0.28"/>' +
                                '<path d="M29.6917 32.5196L23.971 26.7989C22.3901 27.846 20.4943 28.4557 18.4561 28.4557C16.4179 28.4557 14.5221 27.846 12.9412 26.7989L7.22042 32.5196C10.2998 34.983 14.2059 36.4561 18.4561 36.4561C22.7062 36.4561 26.6123 34.983 29.6917 32.5196Z" fill="white" fill-opacity="0.28"/>' +
                                '<path d="M5.81349 31.2688L5.64334 31.0986C5.69968 31.1557 5.7564 31.2124 5.81349 31.2688Z" fill="white" fill-opacity="0.28"/>' +
                                '<path d="M5.04033 30.4571L10.7131 24.7844C9.30243 23.0605 8.4561 20.857 8.4561 18.4557C8.4561 16.4175 9.06588 14.5217 10.113 12.9408L4.39251 7.22037C1.9291 10.2998 0.456055 14.2059 0.456055 18.4561C0.456054 23.0667 2.18955 27.2724 5.04033 30.4571Z" fill="white" fill-opacity="0.28"/>' +
                                '<path d="M6.45507 5.04029C9.63973 2.18953 13.8455 0.456055 18.4561 0.456055C23.0667 0.456054 27.2724 2.18955 30.4571 5.04034L24.7847 10.7127C23.0609 9.30207 20.8573 8.45575 18.4561 8.45575C16.0549 8.45575 13.8513 9.30207 12.1275 10.7127L6.45507 5.04029Z" fill="white" fill-opacity="0.28"/>' +
                                '<circle cx="18.4565" cy="18.4561" r="7" fill="white"/>' +
                            '</svg>' +
                        '</div>' +
                        '<div class="cardify-trailer__remote-text">' + Lampa.Lang.translate("cardify_enable_sound") + '</div>' +
                    '</div>' +
                '</div>' : '') +
            '</div>');
        }

        Player.prototype.initYoutube = function() {
            var _this = this;
            var bgSound = Lampa.Storage.field("cardify_bg_trailer_sound") === true;
            var isHorizontal = window.innerWidth > window.innerHeight;
            
            var h = (this.isBgMode || isHorizontal) ? window.innerHeight * 2 : '100%';
            var w = (this.isBgMode || isHorizontal) ? window.innerWidth : '100%';

            this.youtube = new window.YT.Player(
                this.html.find(".cardify-trailer__youtube-iframe")[0],
                {
                    height: h,
                    width: w,
                    playerVars: {
                        controls: 0,
                        showinfo: 0,
                        autohide: 1,
                        modestbranding: 1,
                        autoplay: 0,
                        disablekb: 1,
                        fs: 0,
                        enablejsapi: 1,
                        playsinline: 1,
                        rel: 0,
                        suggestedQuality: "hd1080",
                        setPlaybackQuality: "hd1080",
                        mute: (this.isBgMode && !bgSound) ? 1 : 0,
                        start: 8
                    },
                    videoId: this.video.id,
                    events: {
                        onReady: function(event) {
                            _this.loaded = true;
                            var iframe = $(_this.youtube.getIframe());
                            
                            var blurVal = parseInt(Lampa.Storage.field("cardify_trailers_blur")) || 0;
                            if (blurVal > 0) {
                                iframe.css('filter', 'blur(' + blurVal + 'px)');
                            }

                            if (_this.isBgMode || isHorizontal) {
                                var zoomVal = Lampa.Storage.field("cardify_trailers_zoom");
                                if (zoomVal === true) zoomVal = "33"; 
                                if (zoomVal === false) zoomVal = "0";
                                zoomVal = zoomVal || "0";

                                if (zoomVal !== "0") {
                                    var scale = 1;
                                    if (zoomVal == "25") scale = 1.25;
                                    else if (zoomVal == "33") scale = 1.33;
                                    else if (zoomVal == "40") scale = 1.40;
                                    else if (zoomVal == "45") scale = 1.45;
                                    else if (zoomVal == "50") scale = 1.50;
                                    
                                    iframe.css('transform', 'scale(' + scale + ')');
                                }
                            }

                            _this.listener.send("loaded");
                        },
                        onStateChange: function(state) {
                            if (state.data == window.YT.PlayerState.PLAYING) {
                                _this.paused = false;
                                clearInterval(_this.timer);
                                _this.timer = setInterval(function () {
                                    var left = _this.youtube.getDuration() - _this.youtube.getCurrentTime();
                                    var toend = 2;
                                    if (left <= toend) {
                                        clearInterval(_this.timer);
                                        _this.listener.send("ended");
                                    }
                                }, 100);

                                _this.listener.send("play");

                                if (window.cardify_fist_unmute && !_this.isBgMode) _this.unmute();
                            }

                            if (state.data == window.YT.PlayerState.PAUSED) {
                                _this.paused = true;
                                clearInterval(_this.timer);
                                _this.listener.send("paused");
                            }

                            if (state.data == window.YT.PlayerState.ENDED) {
                                _this.listener.send("ended");
                            }

                            if (state.data == window.YT.PlayerState.BUFFERING) {
                                state.target.setPlaybackQuality("hd1080");
                            }
                        },
                        onError: function(e) {
                            _this.loaded = false;
                            _this.listener.send("error");
                        }
                    }
                }
            );
        };

        Player.prototype.initHtml5 = function() {
            var _this = this;
            var blurVal = parseInt(Lampa.Storage.field("cardify_trailers_blur")) || 0;
            var zoomVal = Lampa.Storage.field("cardify_trailers_zoom");
            var bgSound = Lampa.Storage.field("cardify_bg_trailer_sound") === true;
            var isHorizontal = window.innerWidth > window.innerHeight;
            
            if (zoomVal === true) zoomVal = "33";
            if (zoomVal === false) zoomVal = "0";
            zoomVal = zoomVal || "0";

            var scale = 1;
            if (zoomVal == "25") scale = 1.25;
            else if (zoomVal == "33") scale = 1.33;
            else if (zoomVal == "40") scale = 1.40;
            else if (zoomVal == "45") scale = 1.45;
            else if (zoomVal == "50") scale = 1.50;

            var container = this.html.find(".cardify-trailer__youtube-iframe");
            container.empty();
            
            var videoElem = document.createElement('video');
            videoElem.autoplay = true;
            videoElem.playsInline = true;
            videoElem.controls = false; 
            videoElem.disablePictureInPicture = true;
            videoElem.disableRemotePlayback = true;

            if (this.isBgMode && !bgSound) videoElem.muted = true;
            else videoElem.muted = false;
            
            videoElem.style.width = '100%';
            videoElem.style.height = '100%';
            videoElem.style.objectFit = (!this.isBgMode && !isHorizontal) ? 'contain' : 'cover';
            videoElem.style.border = 'none';
            videoElem.style.pointerEvents = 'none';
            videoElem.style.outline = 'none';
            videoElem.style.background = 'transparent';
            videoElem.tabIndex = -1; 

            if (blurVal > 0) videoElem.style.filter = 'blur(' + blurVal + 'px)';
            if (scale > 1 && (this.isBgMode || isHorizontal)) videoElem.style.transform = 'scale(' + scale + ')';

            var srcUrl = this.video.url;
            if (this.video.startTime) {
                srcUrl += "#t=" + this.video.startTime;
            }
            videoElem.src = srcUrl;
            
            container.append(videoElem);
            this.videoNode = videoElem;

            this.videoNode.addEventListener('loadedmetadata', function() {
                if (_this.video.startTime) {
                    if (_this.videoNode.currentTime < _this.video.startTime) {
                        _this.videoNode.currentTime = _this.video.startTime;
                    }
                }
            });

            this.videoNode.addEventListener('loadeddata', function() {
                _this.loaded = true;
                _this.listener.send("loaded");
            });

            this.videoNode.addEventListener('play', function() {
                _this.paused = false;
                clearInterval(_this.timer);
                _this.timer = setInterval(function() {
                    if (_this.videoNode && !_this.videoNode.paused && !_this.videoNode.ended && _this.videoNode.duration) {
                        var left = _this.videoNode.duration - _this.videoNode.currentTime;
                        if (left <= 2 && left > 0) {
                            clearInterval(_this.timer);
                            _this.listener.send("ended");
                        }
                    }
                }, 100);
                
                _this.listener.send("play");
                if (window.cardify_fist_unmute && !_this.isBgMode) _this.unmute();
            });

            this.videoNode.addEventListener('pause', function() {
                _this.paused = true;
                clearInterval(_this.timer);
                _this.listener.send("paused");
            });

            this.videoNode.addEventListener('ended', function() {
                _this.listener.send("ended");
            });

            this.videoNode.addEventListener('error', function() {
                _this.loaded = false;
                _this.listener.send("error");
            });
        };

        Player.prototype.play = function() {
            if (this.videoNode) {
                try { this.videoNode.play(); } catch(e) {}
            } else {
                try { this.youtube.playVideo(); } catch (e) {}
            }
        };

        Player.prototype.pause = function() {
            if (this.videoNode) {
                try { this.videoNode.pause(); } catch(e) {}
            } else {
                try { this.youtube.pauseVideo(); } catch (e) {}
            }
        };

        Player.prototype.unmute = function() {
            try {
                if (this.isBgMode) return;
                if (this.videoNode) {
                    this.videoNode.muted = false;
                } else {
                    this.youtube.unMute();
                }
                this.html.find(".cardify-trailer__remote").remove();
                window.cardify_fist_unmute = true;
            } catch (e) {}
        };

        Player.prototype.show = function() {
            this.html.addClass("display");
            this.display = true;
        };

        Player.prototype.hide = function() {
            this.html.removeClass("display");
            this.display = false;
        };

        Player.prototype.render = function() {
            return this.html;
        };

        Player.prototype.destroy = function() {
            this.loaded = false;
            this.display = false;

            if (this.videoNode) {
                try {
                    this.videoNode.pause();
                    this.videoNode.removeAttribute('src');
                    this.videoNode.load();
                } catch(e) {}
            } else {
                try { this.youtube.destroy(); } catch (e) {}
            }

            clearInterval(this.timer);
            this.html.remove();
        };

        return Player;
    })();

    var Trailer = (function () {
        function Trailer(object, video, isBgMode) {
            var _this = this;

            object.activity.trailer_ready = true;
            this.object = object;
            this.video = video;
            this.isBgMode = isBgMode;
            this.player = null;
            
            var isHorizontal = window.innerWidth > window.innerHeight;
            if (isHorizontal) {
                this.background = this.object.activity.render().find(".full-start__background, .m-full-start__background");
            } else {
                this.background = this.object.activity.render().find(".full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img");
            }
            
            this.startblock = this.object.activity.render().find(".cardify");
            this.head = $(".head");
            this.timelauch = isBgMode ? 100 : 5000;
            this.state = new State({
                state: "start",
                transitions: {
                    start: function(state) {
                        clearTimeout(_this.timer_load);
                        if (_this.player.display) state.dispatch("play");
                        else if (_this.player.loaded) {
                            _this.timer_load = setTimeout(function () {
                                state.dispatch("load");
                            }, _this.timelauch);
                        }
                    },
                    load: function(state) {
                        if (
                            _this.player.loaded &&
                            (Lampa.Controller.enabled().name == "full_start" || Lampa.Controller.enabled().name == "scroll") &&
                            _this.same() &&
                            $('.modal').length === 0
                        )
                            state.dispatch("play");
                    },
                    play: function() {
                        _this.player.play();
                    },
                    toggle: function(state) {
                        if (_this.isBgMode) {
                            if (!_this.same()) {
                                if (_this.player.display) state.dispatch("hide");
                                return;
                            }
                            
                            var playerOpen = $('body').hasClass('player--open') || $('.player').length > 0;
                            
                            if (!playerOpen) {
                                if (!_this.player.display && _this.player.loaded) {
                                    state.start();
                                }
                            } else {
                                if (_this.player.display) state.dispatch("hide");
                            }
                            return;
                        }

                        clearTimeout(_this.timer_load);
                        if (Lampa.Controller.enabled().name == "cardify_trailer");
                        else if (
                            Lampa.Controller.enabled().name == "full_start" &&
                            _this.same()
                        ) {
                            state.start();
                        } else if (_this.player.display) {
                            state.dispatch("hide");
                        }
                    },
                    hide: function() {
                        if (!_this.player.display) return;
                        _this.player.pause();
                        _this.player.hide();
                        var isHorizontalNow = window.innerWidth > window.innerHeight;
                        
                        if (!isHorizontalNow && _this.isBgMode) {
                            _this.background.css('opacity', '1');
                        } else {
                            _this.background.removeClass("nodisplay").css('opacity', '1');
                        }
                        
                        if (!_this.isBgMode) {
                            _this.startblock.removeClass("nodisplay");
                            _this.head.removeClass("nodisplay");
                            _this.object.activity.render().find('.cardify-effects-overlay').removeClass("nodisplay");
                        }
                    }
                }
            });
            this.start();
        }

        Trailer.prototype.same = function() {
            return Lampa.Activity.active().activity === this.object.activity;
        };

        Trailer.prototype.controll = function() {
            if (this.isBgMode) return; 
            var _this = this;

            var out = function() {
                _this.state.dispatch("hide");
                Lampa.Controller.toggle("full_start");
            };

            Lampa.Controller.add("cardify_trailer", {
                toggle: function() {
                    Lampa.Controller.clear();
                },
                enter: function() {
                    _this.player.unmute();
                },
                left: out,
                up: out,
                down: out,
                right: out,
                back: function() {
                    _this.player.destroy();
                    out();
                }
            });
            Lampa.Controller.toggle("cardify_trailer");
        };

        Trailer.prototype.start = function() {
            var _this = this;
            var _self = this;

            var toggle = function() {
                _self.state.dispatch("toggle");
            };

            var activityListener = function(a) {
                if (a.object.activity === _self.object.activity) {
                    if (a.type === "destroy") {
                        remove();
                    } else if (a.type === "background") {
                        _self.state.dispatch("hide");
                    } else if (a.type === "foreground") {
                        _self.state.dispatch("toggle");
                    }
                }
            };

            var remove = function() {
                Lampa.Listener.remove("activity", activityListener);
                Lampa.Controller.listener.remove("toggle", toggle);
                
                if (window.cardifyBgPlayer === _this.player) {
                    window.cardifyBgPlayer = null;
                }
                if (window.cardifyBgTrailer === _self) {
                    window.cardifyBgTrailer = null;
                }

                _self.destroy();
            };

            Lampa.Listener.follow("activity", activityListener);
            Lampa.Controller.listener.follow("toggle", toggle);

            this.player = new Player(this.object, this.video, this.isBgMode);
            
            if (this.isBgMode) {
                window.cardifyBgPlayer = this.player;
                window.cardifyBgTrailer = this;
            }

            this.player.listener.follow("loaded", function() {
                _this.state.start();
            });

            this.player.listener.follow("play", function() {
                clearTimeout(_this.timer_show);

                _this.timer_show = setTimeout(function() {
                    if (_this.isBgMode) {
                        if (_this.player.html && _this.player.html.length) {
                            _this.player.html[0].style.setProperty('transition', 'opacity 2s ease-in-out', 'important');
                        }
                        if (_this.background && _this.background.length) {
                            _this.background.each(function() {
                                this.style.setProperty('transition', 'opacity 2s ease-in-out', 'important');
                            });
                        }
                    }

                    _this.player.show();
                    
                    var isHorizontalNow = window.innerWidth > window.innerHeight;
                    if (!isHorizontalNow && _this.isBgMode) {
                        _this.background.css('opacity', '0');
                    } else {
                        _this.background.addClass("nodisplay");
                    }

                    if (!_this.isBgMode) {
                        _this.startblock.addClass("nodisplay");
                        _this.head.addClass("nodisplay");
                        _this.object.activity.render().find('.cardify-effects-overlay').addClass("nodisplay");
                        _this.controll();
                    }
                }, _this.isBgMode ? 100 : 500);
            });

            this.player.listener.follow("ended,error", function() {
                if (_this.isBgMode) {
                    try {
                        if (_this.player.videoNode) {
                            _this.player.videoNode.currentTime = 8;
                        } else if (_this.player.youtube && typeof _this.player.youtube.seekTo === 'function') {
                            _this.player.youtube.seekTo(8);
                        }
                    } catch(err) {}
                    _this.player.play(); 
                    return;
                }

                _this.state.dispatch("hide");

                if (Lampa.Controller.enabled().name !== "full_start")
                    Lampa.Controller.toggle("full_start");

                setTimeout(remove, 300);
            });

            var $render = this.object.activity.render();
            var $overlay = $render.find('.cardify-effects-overlay');
            var isHorizontal = window.innerWidth > window.innerHeight;

            if (!isHorizontal && this.isBgMode) {
                var $bg = $render.find('.full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img').first();
                var $playerHtml = this.player.render();
                if ($bg.length) {
                    $playerHtml.find('.cardify-trailer__youtube').css({
                        position: 'absolute',
                        height: '100%',
                        width: '100%'
                    });
                    
                    var $bgParent = $bg.parent();
                    if ($bgParent.css('position') === 'static') {
                        $bgParent.css('position', 'relative');
                    }
                    
                    $bgParent.css({
                        '-webkit-mask-image': '-webkit-linear-gradient(top, white 50%, rgba(255,255,255,0) 100%)',
                        'mask-image': 'linear-gradient(to bottom, white 50%, rgba(255,255,255,0) 100%)'
                    });

                    $bg.css({
                        '-webkit-mask-image': 'none',
                        'mask-image': 'none'
                    });

                    $playerHtml.css({
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        zIndex: $bg.css('z-index') !== 'auto' ? $bg.css('z-index') : 1,
                        overflow: 'hidden',
                        '-webkit-mask-image': 'none',
                        'mask-image': 'none',
                        'border-radius': $bg.css('border-radius') || '0'
                    });

                    $bg.after($playerHtml);
                } else {
                    $render.find(".activity__body").prepend($playerHtml);
                }
            } else {
                if (this.isBgMode && $overlay.length) {
                    $overlay.before(this.player.render());
                } else {
                    $render.find(".activity__body").prepend(this.player.render());
                }
            }

            if (this.video.type === 'imdb_video') {
                this.player.initHtml5();
            } else {
                var checkYT = setInterval(function() {
                    if (window.YT && window.YT.Player) {
                        clearInterval(checkYT);
                        _this.player.initYoutube();
                    }
                }, 100);

                if (!window.YT && !window.cardify_yt_injecting) {
                    window.cardify_yt_injecting = true;
                    Lampa.Utils.putScript(['https://www.youtube.com/iframe_api'], function(){});
                }
            }
        };

        Trailer.prototype.destroy = function() {
            clearTimeout(this.timer_load);
            clearTimeout(this.timer_show);
            this.player.destroy();
        };

        return Trailer;
    })();

    function startPlugin() {
        Lampa.Lang.add({
            cardify_enable_sound: {
                ru: "Включить звук",
                en: "Enable sound",
                uk: "Увімкнути звук",
                be: "Уключыць гук",
                zh: "启用声音",
                pt: "Ativar som",
                bg: "Включване на звук"
            }
        });

        if (window.Lampa && Lampa.Player && Lampa.Player.listener) {
            Lampa.Player.listener.follow('ready', function() {
                if (window.cardifyBgTrailer && window.cardifyBgTrailer.state) {
                    window.cardifyBgTrailer.state.dispatch('hide');
                } else if (window.cardifyBgPlayer && typeof window.cardifyBgPlayer.pause === 'function') {
                    window.cardifyBgPlayer.pause();
                    if (typeof window.cardifyBgPlayer.hide === 'function') window.cardifyBgPlayer.hide();
                }
            });

            Lampa.Player.listener.follow('destroy', function() {
                setTimeout(function() {
                    if (Lampa.Activity.active() && Lampa.Activity.active().component === 'full_start') {
                        if (window.cardifyBgTrailer && window.cardifyBgTrailer.state) {
                            window.cardifyBgTrailer.state.start();
                        } else if (window.cardifyBgPlayer && typeof window.cardifyBgPlayer.play === 'function') {
                            window.cardifyBgPlayer.play();
                            if (typeof window.cardifyBgPlayer.show === 'function') window.cardifyBgPlayer.show();
                        }
                    }
                }, 300);
            });
        }
        
        var isHorizontal = window.innerWidth > window.innerHeight;
        
        if (isHorizontal) {
            Lampa.Template.add(
                "full_start_new",
                '<div class="full-start-new cardify">\n        <div class="full-start-new__body">\n            <div class="full-start-new__left hide">\n                <div class="full-start-new__poster">\n                    <img class="full-start-new__img full--poster" />\n                </div>\n            </div>\n\n            <div class="full-start-new__right">\n                \n                <div class="cardify__left">\n                    <div class="full-start-new__head"></div>\n                    <div class="full-start-new__title">{title}</div>\n\n                    <div class="full-start-new__rate-line rate-fix">\n                        <div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>\n                        <div class="full-start__rate rate--imdb hide"><div></div><div>IMDB</div></div>\n                        <div class="full-start__rate rate--kp hide"><div></div><div>KP</div></div>\n                        <div class="full-start__rate rate--cub hide"><div></div><div>CUB</div></div>\n                    </div>\n\n                    <div class="cardify__details">\n                        <div class="full-start-new__details"></div>\n                    </div>\n\n                    <div class="full-start-new__buttons">\n                        <div class="full-start__button selector button--play">\n                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>\n                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>\n                            </svg>\n\n                            <span>#{title_watch}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--book">\n                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n\n                            <span>#{settings_input_links}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--reaction">\n                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>\n                                <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>\n                            </svg>                \n\n                            <span>#{title_reactions}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--subscribe hide">\n                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>\n                            <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n\n                            <span>#{title_subscribe}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--options">\n                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>\n                            </svg>\n                        </div>\n                    </div>\n                </div>\n\n                <div class="cardify__right">\n                    <div class="full-start-new__reactions selector">\n                        <div>#{reactions_none}</div>\n                    </div>\n\n                    <div class="full-start-new__rate-line">\n                        <div class="full-start__pg hide"></div>\n                        <div class="full-start__status hide"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n        <div class="hide buttons--container">\n            <div class="full-start__button view--torrent hide">\n                <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px">\n                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>\n                </svg>\n\n                <span>#{full_torrents}</span>\n            </div>\n            <div class="full-start__button selector view--trailer">\n                <svg width="28" height="29" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <path d="M21.582 6.186c-.23-.86-.908-1.538-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418c-.86.23-1.538.908-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814c.23.86.908 1.538 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418c.86-.23 1.538-.908 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814zM9.75 15.021V8.979l6.5 3.021-6.5 3.021z" fill="currentColor"/>\n                </svg>\n                <span>Трейлеры</span>\n            </div>\n        </div>\n    </div>'
            );
        }

        var style = '<style>' +
            '.cardify{-webkit-transition:all .3s;-o-transition:all .3s;-moz-transition:all .3s;transition:all .3s}' +
            '.cardify .full-start-new__body{height:80vh}' +
            '.cardify .full-start-new__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:end;-webkit-align-items:flex-end;-moz-box-align:end;-ms-flex-align:end;align-items:flex-end}' +
            '.cardify .full-start-new__title{text-shadow:0 0 .1em rgba(0,0,0,0.3)}' +
            '.cardify__left{-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1}' +
            '.cardify__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;position:relative}' +
            '.cardify__details{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}' +
            '.cardify .full-start-new__reactions, .cardify .reaction__count {display:none !important}' +
            '@media screen and (orientation: landscape) {' +
                '.cardify .full-start-new__rate-line.rate-fix{margin: 1em 0 1.7em 0}' +
                '.cardify .full-start-new__details{margin:0 0 1.4em -0.3em;}' +
                '.cardify .full-start-new__rate-line{margin:0;margin-left:3.5em}' +
                '.cardify .full-start-new__rate-line>*:last-child{margin-right:0 !important}' +
            '}' +
            '.cardify__background{left:0}' +
            '.cardify__background.nodisplay{opacity:0 !important}' +
            '.cardify.nodisplay{-webkit-transform:translate3d(0,50%,0);-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}' +
            '.head.nodisplay{-webkit-transform:translate3d(0,-100%,0);-moz-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}' +
            'body:not(.menu--open) .cardify__background{-webkit-mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));-webkit-mask-image:-webkit-linear-gradient(top,white 50%,rgba(255,255,255,0) 100%);mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));mask-image:linear-gradient(to bottom,white 50%,rgba(255,255,255,0) 100%)}' +
            '.cardify__background{animation:none !important;-webkit-animation:none !important;transform:none !important;-webkit-transform:none !important;}' +
            '.cardify-effects-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;background-color:transparent;background-image:linear-gradient(225deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0) 55%);background-repeat:no-repeat;background-size:100vw 100vh;transition:background-color 0.4s ease;}' +
            '.cardify-effects-overlay.cardify-scrolled{background-color:rgba(0,0,0,0.5) !important;}' +
            '.cardify-effects-overlay.nodisplay{opacity:0 !important; pointer-events:none !important;}' +
            '.cardify-trailer{opacity:0;transition:opacity .3s;position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;}' +
            '.cardify-trailer.fg-mode{z-index:100 !important; background-color:#000;}' +
            '.cardify-trailer__youtube{background-color:#000;position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:0;}' +
            '.cardify-trailer__youtube iframe{border:0;width:100%;height:100%;flex-shrink:0;z-index:0;transition:transform 0.3s;pointer-events:none;}' +
            '.cardify-trailer__youtube-iframe video { outline:none; border:none; pointer-events:none; cursor:none; }' +
            '.cardify-trailer__youtube-iframe video::-webkit-media-controls { display:none !important; opacity:0 !important; }' +
            '.cardify-trailer__youtube-iframe video::-webkit-media-controls-enclosure { display:none !important; opacity:0 !important; }' +
            '.cardify-trailer__youtube-iframe video::-webkit-media-controls-panel { display:none !important; opacity:0 !important; }' +
            '.cardify-trailer__youtube-iframe video::-webkit-media-controls-play-button { display:none !important; opacity:0 !important; }' +
            '.cardify-trailer__youtube-iframe video::-webkit-media-controls-start-playback-button { display:none !important; opacity:0 !important; }' +
            '.cardify-trailer__youtube-line{position:fixed;height:6.2em;background-color:#000;width:100%;left:0;display:none;z-index:2;}' +
            '.cardify-trailer__youtube-line.one{top:0}' +
            '.cardify-trailer__youtube-line.two{bottom:0}' +
            '.cardify-trailer__controlls{position:fixed;left:1.5em;right:1.5em;bottom:1.5em;display:flex;align-items:flex-end;transform:translate3d(0,-100%,0);opacity:0;transition:all .3s;z-index:10;}' +
            '.cardify-trailer__title{flex-grow:1;padding-right:5em;font-size:4em;font-weight:600;text-shadow: 2px 2px 4px #000;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;}' +
            '.cardify-trailer__remote{flex-shrink:0;display:flex;align-items:center;}' +
            '.cardify-trailer__remote-icon{flex-shrink:0;width:2.5em;height:2.5em}' +
            '.cardify-trailer__remote-text{margin-left:1em;text-shadow: 1px 1px 2px #000;}' +
            '.cardify-trailer.display{opacity:1}' +
            '.cardify-trailer.display .cardify-trailer__controlls{transform:translate3d(0,0,0);opacity:1}' +
        '</style>';

        Lampa.Template.add("cardify_css", style);
        $("body").append(Lampa.Template.get("cardify_css", {}, true));

        var icon = '<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="1.5" y="1.5" width="33" height="25" rx="3.5" stroke="white" stroke-width="3"/>' +
            '<rect x="5" y="14" width="17" height="4" rx="2" fill="white"/>' +
            '<rect x="5" y="20" width="10" height="3" rx="1.5" fill="white"/>' +
            '<rect x="25" y="20" width="6" height="3" rx="1.5" fill="white"/>' +
        '</svg>';
        
        Lampa.SettingsApi.addComponent({
            component: "cardify",
            icon: icon,
            name: "CARD mod"
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_run_trailers",
                type: "trigger",
                default: false
            },
            field: {
                name: "Показывать трейлеры",
                description: "Запускать трейлер через таймаут 5 сек (вместо фона и интерфейса)"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailers_bg",
                type: "trigger",
                default: false
            },
            field: {
                name: "Трейлеры вместо слайдшоу",
                description: "Загрузить трейлер на задний фон сразу"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_bg_trailer_sound",
                type: "trigger",
                default: false
            },
            field: {
                name: "Звук фонового трейлера",
                description: "Включить звук для трейлера, который играет на фоне вместо фото/слайдшоу"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailer_source",
                type: "select",
                values: {
                    "tmdb": "TMDB (YouTube)",
                    "imdb": "IMDB (Balloonerism)"
                },
                default: "tmdb"
            },
            field: {
                name: "Источник трейлеров",
                description: "Откуда загружать трейлеры"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailer_quality",
                type: "select",
                values: {
                    "1080": "1080p",
                    "720": "720p",
                    "480": "480p",
                    "sd": "SD",
                    "auto": "Авто"
                },
                default: "auto"
            },
            field: {
                name: "Качество фонового трейлера IMDB",
                description: "Работает только если источник - IMDB"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_button_imdb_quality",
                type: "select",
                values: {
                    "1080": "1080p",
                    "720": "720p",
                    "480": "480p",
                    "sd": "SD",
                    "auto": "Авто"
                },
                default: "auto"
            },
            field: {
                name: "Качество кнопки IMDB Trailer",
                description: "Качество видео при ручном запуске трейлера с кнопки"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailer_proxy",
                type: "trigger",
                default: true
            },
            field: {
                name: "Прокси для трейлеров IMDB",
                description: "Использовать прокси для запросов API и видео"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailers_blur",
                type: "select",
                values: {
                    "0": "Выключено (0%)",
                    "1": "1%",
                    "2": "2%",
                    "3": "3%",
                    "4": "4%",
                    "5": "5%",
                    "10": "10%"
                },
                default: "0"
            },
            field: {
                name: "Размытие трейлера",
                description: "Настройте уровень размытия фонового трейлера"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailers_zoom",
                type: "select",
                values: {
                    "0": "Выключено (0%)",
                    "25": "25%",
                    "33": "33%",
                    "40": "40%",
                    "45": "45%",
                    "50": "50%"
                },
                default: "0"
            },
            field: {
                name: "Степень растяжения трейлера",
                description: "Убирает черные полосы видео (по умолчанию 0%)"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_run_slideshow",
                type: "trigger",
                default: true
            },
            field: {
                name: "Слайд-шоу",
                description: "Плавно менять фоновые изображения"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_slideshow_quality",
                type: "select",
                values: {
                    w780: "Стандартная (w780)",
                    w1280: "Высокая (w1280)",
                    original: "Оригинал (original)"
                },
                default: "w1280"
            },
            field: {
                name: "Качество изображений"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_slideshow_duration",
                type: "select",
                values: {
                    5000: "5 секунд",
                    8000: "8 секунд",
                    10000: "10 секунд",
                    15000: "15 секунд"
                },
                default: 8000
            },
            field: {
                name: "Длительность фото (сек)"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_show_status",
                type: "trigger",
                default: false
            },
            field: {
                name: "Показывать статус"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_show_pg",
                type: "trigger",
                default: false
            },
            field: {
                name: "Показывать возрастной рейтинг"
            }
        });

        function getVideo(data) {
            var vids = data.videos || (data.movie && data.movie.videos) || (data.tv && data.tv.videos);
            if (vids && vids.results && vids.results.length) {
                var items = [];
                vids.results.forEach(function(element) {
                    var name_orig = (element.name || "").toLowerCase();
                    
                    if (element.iso_639_1 === 'ru' || name_orig.indexOf('официальный') !== -1 || name_orig.indexOf('русский') !== -1 || name_orig.indexOf('на русском') !== -1) {
                        return;
                    }

                    if (name_orig.indexOf('#shorts') !== -1 || name_orig.indexOf('[shorts]') !== -1 || name_orig.indexOf('(shorts)') !== -1 || name_orig.indexOf('tiktok') !== -1 || name_orig.indexOf('vertical') !== -1) {
                        return;
                    }

                    items.push({
                        title: Lampa.Utils.shortText(element.name, 50),
                        id: element.key,
                        code: element.iso_639_1,
                        time: new Date(element.published_at).getTime(),
                        url: "https://www.youtube.com/watch?v=" + element.key,
                        img: "https://img.youtube.com/vi/" + element.key + "/default.jpg",
                        name_orig: name_orig,
                        type: (element.type || "").toLowerCase()
                    });
                });

                items.sort(function(a, b) {
                    return a.time > b.time ? -1 : a.time < b.time ? 1 : 0;
                });

                var uk_lang = items.filter(function(n) {
                    return n.code === "uk" || 
                           n.name_orig.indexOf("українською") !== -1 || 
                           n.name_orig.indexOf("український") !== -1 || 
                           n.name_orig.indexOf("укр трейлер") !== -1;
                });

                var en_lang = items.filter(function(n) {
                    return n.code === "en" && uk_lang.indexOf(n) === -1;
                });

                if (uk_lang.length) {
                    var best_uk = uk_lang.find(function(n) {
                        return n.name_orig.indexOf("офіційний трейлер") !== -1 || 
                               n.name_orig.indexOf("українською") !== -1 || 
                               n.name_orig.indexOf("український") !== -1;
                    });
                    
                    if (!best_uk) {
                        best_uk = uk_lang.find(function(n) {
                            return n.name_orig.indexOf("трейлер") !== -1 || n.type === "trailer";
                        });
                    }
                    
                    if (best_uk) return best_uk;
                    return uk_lang[0];
                }

                if (en_lang.length) {
                    var best_en = en_lang.find(function(n) {
                        return n.name_orig.indexOf("official trailer") !== -1;
                    });
                    
                    if (!best_en) {
                        best_en = en_lang.find(function(n) {
                            return n.name_orig.indexOf("trailer") !== -1 || n.type === "trailer";
                        });
                    }
                    
                    if (best_en) return best_en;
                    return en_lang[0];
                }

                if (items.length) {
                    return items[0];
                }
            }
        }

        function processFullCard(e) {
            var render = e.object.activity.render();
            var isHorizontal = window.innerWidth > window.innerHeight;
            var bgSelectors = isHorizontal 
                ? ".full-start__background, .m-full-start__background" 
                : ".full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img";
            var bg = render.find(bgSelectors);
            var component = e.object.activity.component;

            if (isHorizontal) {
                bg.addClass("cardify__background");
                if (render.find('.cardify-effects-overlay').length === 0) {
                    bg.last().after('<div class="cardify-effects-overlay"></div>');
                }
            }

            var trailerBtn = render.find('.view--trailer, .button--trailer');
            if (trailerBtn.length) {
                trailerBtn.find('span').text('Трейлеры'); 

                if (render.find('.view--imdb_trailer').length === 0) {
                    var imdbBtn = trailerBtn.clone();
                    imdbBtn.removeClass('view--trailer button--trailer').addClass('view--imdb_trailer');
                    imdbBtn.find('span').text('IMDB Trailer');
                    imdbBtn.find('svg').replaceWith('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>');
                    
                    imdbBtn.on('hover:enter click', function() {
                        var imdb_id = e.data.imdb_id || (e.data.external_ids ? e.data.external_ids.imdb_id : null) || (e.data.movie ? e.data.movie.imdb_id : null) || (e.data.tv ? e.data.tv.imdb_id : null) || (e.object && e.object.card ? e.object.card.imdb_id : null);
                        
                        if (!imdb_id) {
                            Lampa.Noty.show('IMDB ID не найден');
                            return;
                        }

                        if (window.cardifyBgTrailer && window.cardifyBgTrailer.state) {
                            window.cardifyBgTrailer.state.dispatch('hide');
                        }

                        var use_proxy = Lampa.Storage.field("cardify_trailer_proxy") !== false;
                        var api_url = "https://api.balloonerismm.workers.dev/movie/" + imdb_id;
                        if (use_proxy) api_url = "https://cors.lampa.stream/" + api_url;

                        Lampa.Noty.show('Загрузка IMDB трейлера...');
                        
                        $.ajax({
                            url: api_url,
                            type: 'GET',
                            dataType: 'json',
                            success: function(data) {
                                if (data && data.trailer && data.trailer.playback) {
                                    var p = {};
                                    for (var k in data.trailer.playback) {
                                        p[k.toLowerCase().replace('p', '')] = data.trailer.playback[k];
                                    }
                                    
                                    var btnQuality = Lampa.Storage.field("cardify_button_imdb_quality") || "auto";
                                    var order = ['1080', '720', '480', 'sd', 'auto'];
                                    var startIndex = order.indexOf(btnQuality);
                                    if (startIndex === -1) startIndex = 0;

                                    var video_url = null;
                                    for (var i = startIndex; i < order.length; i++) {
                                        if (p[order[i]]) { video_url = p[order[i]]; break; }
                                    }
                                    if (!video_url) {
                                        for (var i = 0; i < order.length; i++) {
                                            if (p[order[i]]) { video_url = p[order[i]]; break; }
                                        }
                                    }
                                    if (!video_url) {
                                        var keys = Object.keys(p);
                                        if (keys.length > 0) video_url = p[keys[0]];
                                    }

                                    if (video_url) {
                                        var final_url = use_proxy ? "https://cors.lampa.stream/" + video_url : video_url;
                                        var title = e.data.title || e.data.name || 'Трейлер';
                                        
                                        var video = {
                                            title: title + " - IMDB Trailer",
                                            url: final_url
                                        };
                                        
                                        Lampa.Player.play(video);
                                        Lampa.Player.playlist([video]);
                                    } else {
                                        Lampa.Noty.show('Не удалось найти ссылку на видео');
                                    }
                                } else {
                                    Lampa.Noty.show('Трейлер отсутствует в базе IMDB');
                                }
                            },
                            error: function() {
                                Lampa.Noty.show('Ошибка загрузки трейлера');
                            }
                        });
                    });

                    trailerBtn.after(imdbBtn);
                }
            }

            var details = render.find(".full-start-new__details");
            if (details.length && isHorizontal) {
                var nextEpisodeSpan = null;
                details.children("span").each(function() {
                    var $span = $(this);
                    if (!$span.hasClass("full-start-new__split") && $span.text().indexOf("/") !== -1) {
                        nextEpisodeSpan = $span;
                        return false;
                    }
                });
                if (nextEpisodeSpan) {
                    var prevSplit = nextEpisodeSpan.prev(".full-start-new__split");
                    var nextSplit = nextEpisodeSpan.next(".full-start-new__split");
                    nextEpisodeSpan.detach();
                    if (prevSplit.length && nextSplit.length) {
                        nextSplit.remove();
                    } else {
                        prevSplit.remove();
                        nextSplit.remove();
                    }
                    nextEpisodeSpan.css("width", "100%");
                    details.append(nextEpisodeSpan);
                }
            }

            if (!Lampa.Storage.field("cardify_show_status") && isHorizontal) {
                render.find(".full-start__status").css("opacity", "0");
            }

            if (!Lampa.Storage.field("cardify_show_pg") && isHorizontal) {
                render.find(".full-start__pg").css("opacity", "0");
            }

            loadOriginalPoster(e, render);

            var titleEl = render.find('.full-start-new__title')[0];
            if (titleEl && typeof IntersectionObserver !== 'undefined' && isHorizontal) {
                var observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        var $overlay = render.find('.cardify-effects-overlay');
                        if (entry.isIntersecting) {
                            $overlay.removeClass('cardify-scrolled');
                        } else {
                            $overlay.addClass('cardify-scrolled');
                        }
                    });
                }, { threshold: 0 }); 

                observer.observe(titleEl);

                var stopObserver = function(a) {
                    if (a.type == 'destroy' && a.object.activity === e.object.activity) {
                        observer.disconnect();
                        Lampa.Listener.remove('activity', stopObserver);
                    }
                };
                Lampa.Listener.follow('activity', stopObserver);
            }

            if (component && component.rows && component.items && component.scroll && component.emit) {
                var add = component.rows.slice(component.items.length);
                if (add.length) {
                    component.fragment = document.createDocumentFragment();
                    add.forEach(function(row) {
                        component.emit("createAndAppend", row);
                    });
                    component.scroll.append(component.fragment);
                    if (Lampa.Layer) Lampa.Layer.visible(component.scroll.render());
                }
            }
        }

        function loadOriginalPoster(e, render) {
            var quality = Lampa.Storage.field('cardify_slideshow_quality') || 'w1280';
            var isHorizontal = window.innerWidth > window.innerHeight;
            var bgSelectors = isHorizontal 
                ? "img.full-start__background, img.m-full-start__background" 
                : ".full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img";
            var bgImg = render.find(bgSelectors);

            var backdropPath = null;
            if (e.data && e.data.movie && e.data.movie.backdrop_path) {
                backdropPath = e.data.movie.backdrop_path;
            } else if (e.data && e.data.tv && e.data.tv.backdrop_path) {
                backdropPath = e.data.tv.backdrop_path;
            } else if (e.object && e.object.card && e.object.card.backdrop_path) {
                backdropPath = e.object.card.backdrop_path;
            } else if (bgImg.length && bgImg.attr("src")) {
                var srcMatch = bgImg.attr("src").match(/\/([^\/]+\.jpg)$/);
                if (srcMatch) backdropPath = "/" + srcMatch[1];
            }

            if (backdropPath && bgImg.length) {
                var targetUrl = "https://image.tmdb.org/t/p/" + quality + backdropPath;
                var tempImg = new Image();
                tempImg.onload = function() {
                    bgImg.attr("src", targetUrl);
                    
                    if (!isHorizontal) {
                        bgImg.css({
                            'object-fit': 'cover',
                            '-webkit-mask-image': 'none',
                            'mask-image': 'none'
                        });
                        var parent = bgImg.parent();
                        if (parent.css('position') === 'static') parent.css('position', 'relative');
                        parent.css({
                            '-webkit-mask-image': '-webkit-linear-gradient(top, white 50%, rgba(255,255,255,0) 100%)',
                            'mask-image': 'linear-gradient(to bottom, white 50%, rgba(255,255,255,0) 100%)'
                        });
                    }
                };
                tempImg.src = targetUrl;
            }
        }

        Lampa.Listener.follow("full", function(e) {
            if (e.type === "complite") {
                processFullCard(e);

                var fixOpacity = function() {
                    var isHorizontalNow = window.innerWidth > window.innerHeight;
                    var bgSelectors = isHorizontalNow 
                        ? ".full-start__background, .m-full-start__background" 
                        : ".full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img";
                    var $render = e.object.activity.render();
                    var $bg = $render.find(bgSelectors);
                    if ($bg.length) {
                        $bg.stop(true, true).css("opacity", "1");
                    }
                };
                fixOpacity();
                setTimeout(fixOpacity, 300);
                setTimeout(fixOpacity, 1000); 

                var isRunTrailers = Lampa.Storage.field("cardify_run_trailers");
                var isBgTrailers = Lampa.Storage.field("cardify_trailers_bg");
                var run_slideshow = Lampa.Storage.field("cardify_run_slideshow");
                var trailer_source = Lampa.Storage.field("cardify_trailer_source") || "tmdb";
                var trailer_quality = Lampa.Storage.field("cardify_trailer_quality") || "auto";
                var use_proxy = Lampa.Storage.field("cardify_trailer_proxy") !== false; 

                var processSlideshow = function() {
                    if (run_slideshow && !isBgTrailers) {
                        var movie_data = e.data.movie || e.data.tv || (e.object && e.object.card);
                        
                        if (movie_data && movie_data.id) {
                            var item_id = movie_data.id;
                            var media_type = 'movie';
                            
                            if (e.object && e.object.method === 'tv') {
                                media_type = 'tv';
                            } else if (e.data && e.data.tv && !e.data.movie) {
                                media_type = 'tv';
                            } else if (movie_data.name && !movie_data.title) {
                                media_type = 'tv';
                            }
                            
                            var current_lang = Lampa.Storage.field('tmdb_lang') || 'uk';
                            var include_languages = current_lang + ',xx,null,en';
                            
                            Lampa.Api.sources.tmdb.get(
                                media_type + '/' + item_id + '/images?include_image_language=' + include_languages,
                                {},
                                function(images_data) {
                                    if (images_data && images_data.backdrops && images_data.backdrops.length > 0) {
                                        var lang_backdrops = [];
                                        var no_lang_backdrops = [];
                                        var other_backdrops = [];
                                        
                                        images_data.backdrops.forEach(function(backdrop) {
                                            var lang = backdrop.iso_639_1;
                                            if (lang === current_lang) {
                                                lang_backdrops.push(backdrop);
                                            } else if (!lang || lang === 'xx' || lang === 'null') {
                                                no_lang_backdrops.push(backdrop);
                                            } else {
                                                other_backdrops.push(backdrop);
                                            }
                                        });
                                        
                                        var final_backdrops = [].concat(lang_backdrops);
                                        
                                        if (final_backdrops.length < 5 && no_lang_backdrops.length > 0) {
                                            var needed = 5 - final_backdrops.length;
                                            final_backdrops = final_backdrops.concat(no_lang_backdrops.slice(0, needed));
                                        }
                                        
                                        if (final_backdrops.length < 5 && other_backdrops.length > 0) {
                                            var needed2 = 5 - final_backdrops.length;
                                            other_backdrops.sort(function(a, b) {
                                                return (b.vote_average || 0) - (a.vote_average || 0);
                                            });
                                            final_backdrops = final_backdrops.concat(other_backdrops.slice(0, needed2));
                                        }
                                        
                                        final_backdrops = final_backdrops.slice(0, 15);
                                        
                                        if (final_backdrops.length > 1) {
                                            if (window.cardifyRotationTimer) {
                                                clearInterval(window.cardifyRotationTimer);
                                            }
                                            
                                            var current_index = 0;
                                            var is_active = true;
                                            window.cardifyCurrentItemId = item_id;
                                            
                                            var quality = Lampa.Storage.field('cardify_slideshow_quality') || 'w1280';
                                            var duration = parseInt(Lampa.Storage.field('cardify_slideshow_duration')) || 8000;
                                            
                                            window.cardifyRotationTimer = setInterval(function() {
                                                if (!is_active || window.cardifyCurrentItemId !== item_id) {
                                                    clearInterval(window.cardifyRotationTimer);
                                                    return;
                                                }
                                                
                                                current_index = (current_index + 1) % final_backdrops.length;
                                                var backdrop_url = Lampa.TMDB.image('t/p/' + quality + final_backdrops[current_index].file_path);
                                                
                                                var $render = e.object.activity.render();
                                                var isHorizontalNow = window.innerWidth > window.innerHeight;
                                                var bgSelectors = isHorizontalNow 
                                                    ? '.full-start__background, .m-full-start__background' 
                                                    : '.full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img';
                                                    
                                                var $currentBg = $render.find(bgSelectors).last();
                                                if ($currentBg.length === 0) return;
                                                
                                                var img = new Image();
                                                img.onload = function() {
                                                    if (!is_active || window.cardifyCurrentItemId !== item_id) return;
                                                    
                                                    var $newBg = $currentBg.clone();
                                                    $newBg.attr('src', backdrop_url);
                                                    
                                                    if (!isHorizontalNow) {
                                                        var $parent = $currentBg.parent();
                                                        if ($parent.css('position') === 'static') {
                                                            $parent.css('position', 'relative');
                                                        }
                                                        
                                                        $parent.css({
                                                            '-webkit-mask-image': '-webkit-linear-gradient(top, white 50%, rgba(255,255,255,0) 100%)',
                                                            'mask-image': 'linear-gradient(to bottom, white 50%, rgba(255,255,255,0) 100%)'
                                                        });
                                                        
                                                        $currentBg.css({
                                                            '-webkit-mask-image': 'none',
                                                            'mask-image': 'none'
                                                        });
                                                        
                                                        $newBg.css({
                                                            'position': 'absolute',
                                                            'top': '0',
                                                            'left': '0',
                                                            'width': '100%',
                                                            'height': '100%',
                                                            'object-fit': 'cover',
                                                            'opacity': '0',
                                                            'transition': 'opacity 1.5s ease-in-out',
                                                            'z-index': 2,
                                                            '-webkit-mask-image': 'none',
                                                            'mask-image': 'none',
                                                            'border-radius': $currentBg.css('border-radius') || '0'
                                                        });
                                                        
                                                        $currentBg.after($newBg);
                                                        $newBg[0].offsetHeight; 
                                                        $newBg.css('opacity', '1');
                                                        
                                                        setTimeout(function() {
                                                            if (!is_active || window.cardifyCurrentItemId !== item_id) return;
                                                            $currentBg.attr('src', backdrop_url);
                                                            $newBg.remove();
                                                        }, 1550);
                                                        
                                                    } else {
                                                        $newBg.css({
                                                            'opacity': '0',
                                                            'transition': 'opacity 1.5s ease-in-out',
                                                            'position': $currentBg.css('position') === 'static' ? 'absolute' : $currentBg.css('position'),
                                                            'top': $currentBg.css('top'),
                                                            'left': $currentBg.css('left'),
                                                            'width': $currentBg.css('width'),
                                                            'height': $currentBg.css('height'),
                                                            'z-index': $currentBg.css('z-index'),
                                                            'object-fit': $currentBg.css('object-fit')
                                                        });
                                                        
                                                        var $overlay = $render.find('.cardify-effects-overlay');
                                                        if ($overlay.length) {
                                                            $overlay.before($newBg);
                                                        } else {
                                                            $currentBg.after($newBg);
                                                        }
                                                        
                                                        $newBg[0].offsetHeight; 
                                                        
                                                        $newBg.css('opacity', '1');
                                                        $currentBg.css({
                                                            'transition': 'opacity 1.5s ease-in-out',
                                                            'opacity': '0'
                                                        });
                                                        
                                                        setTimeout(function() {
                                                            if (!is_active || window.cardifyCurrentItemId !== item_id) return;
                                                            $currentBg.remove();
                                                            var bgToRemove = $render.find(bgSelectors).not($newBg);
                                                            bgToRemove.remove();
                                                        }, 1550);
                                                    }
                                                };
                                                img.src = backdrop_url;
                                                
                                            }, duration);
                                            
                                            var stop_rotation = function(a) {    
                                                if (a.type == 'destroy' && a.object.activity === e.object.activity) {    
                                                    is_active = false;
                                                    if (window.cardifyRotationTimer) {
                                                        clearInterval(window.cardifyRotationTimer);
                                                    }
                                                    Lampa.Listener.remove('activity', stop_rotation);    
                                                }    
                                            };    
                                            
                                            Lampa.Listener.follow('activity', stop_rotation); 
                                        }
                                    }
                                }
                            );
                        }
                    }
                };

                var finalizeTrailer = function(tr) {
                    if (tr && Lampa.Manifest.app_digital >= 220) {
                        if (Lampa.Activity.active().activity === e.object.activity) {
                            new Trailer(e.object, tr, isBgTrailers);
                        } else {
                            var follow = function(a) {
                                if (
                                    a.type == "start" &&
                                    a.object.activity === e.object.activity &&
                                    !e.object.activity.trailer_ready
                                ) {
                                    Lampa.Listener.remove("activity", follow);
                                    new Trailer(e.object, tr, isBgTrailers);
                                }
                            };
                            Lampa.Listener.follow("activity", follow);
                        }
                    } else {
                        isBgTrailers = false;
                    }
                    processSlideshow(); 
                };

                if (isRunTrailers || isBgTrailers) {
                    if (trailer_source === 'imdb') {
                        var imdb_id = e.data.imdb_id || (e.data.external_ids ? e.data.external_ids.imdb_id : null) || (e.data.movie ? e.data.movie.imdb_id : null) || (e.data.tv ? e.data.tv.imdb_id : null) || (e.object && e.object.card ? e.object.card.imdb_id : null);
                        
                        if (imdb_id) {
                            var api_url = "https://api.balloonerismm.workers.dev/movie/" + imdb_id;
                            if (use_proxy) api_url = "https://cors.lampa.stream/" + api_url;

                            $.ajax({
                                url: api_url,
                                type: 'GET',
                                dataType: 'json',
                                success: function(data) {
                                    var tr = null;
                                    if (data && data.trailer && data.trailer.playback) {
                                        var p = {};
                                        for (var k in data.trailer.playback) {
                                            p[k.toLowerCase().replace('p', '')] = data.trailer.playback[k];
                                        }
                                        var order = ['1080', '720', '480', 'sd', 'auto'];
                                        var startIndex = order.indexOf(trailer_quality);
                                        if (startIndex === -1) startIndex = 0;
                                        
                                        var video_url = null;
                                        for (var i = startIndex; i < order.length; i++) {
                                            if (p[order[i]]) { video_url = p[order[i]]; break; }
                                        }
                                        if (!video_url) {
                                            for (var i = 0; i < order.length; i++) {
                                                if (p[order[i]]) { video_url = p[order[i]]; break; }
                                            }
                                        }
                                        if (!video_url) {
                                            var keys = Object.keys(p);
                                            if (keys.length > 0) video_url = p[keys[0]];
                                        }

                                        if (video_url) {
                                            tr = {
                                                type: 'imdb_video',
                                                url: use_proxy ? "https://cors.lampa.stream/" + video_url : video_url,
                                                id: imdb_id,
                                                startTime: 10
                                            };
                                        }
                                    }
                                    
                                    if (tr) {
                                        finalizeTrailer(tr);
                                    } else {
                                        isBgTrailers = false;
                                        processSlideshow();
                                    }
                                },
                                error: function() {
                                    isBgTrailers = false;
                                    processSlideshow();
                                }
                            });
                        } else {
                            isBgTrailers = false;
                            processSlideshow();
                        }
                    } else {
                        var tmdb_tr = getVideo(e.data);
                        if (tmdb_tr) {
                            finalizeTrailer(tmdb_tr);
                        } else {
                            isBgTrailers = false;
                            processSlideshow();
                        }
                    }
                } else {
                    processSlideshow();
                }
            }
        });
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow("app", function(e) {
            if (e.type === "ready") startPlugin();
        });
    }
})();

    // =============================================================
    // МОДУЛЬ 3: Apple Кнопки — стиль кнопок с эффектом стекла
    // =============================================================

(function () {
    'use strict';

    if (window.mod_apple_buttons_loaded) return;
    window.mod_apple_buttons_loaded = true;

    var MOD = 'mod_';

    function isEnabled(mod) {
        return Lampa.Storage.get(MOD + 'enable_' + mod, true);
    }

    var appleIcon = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>';

    // ==========================================
    // ЦВЕТОВЫЕ ТЕМЫ
    // ==========================================

    var colorThemes = {
        'default': {
            name: 'По умолчанию',
            container_bg: 'rgba(22,24,30,.28)',
            container_border: 'rgba(255,255,255,.10)',
            container_shadow: 'inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.92)',
            button_hover_bg: 'rgba(255,255,255,.14)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,255,255,.10)'
        },
        'blue': {
            name: 'Синяя',
            container_bg: 'rgba(0,122,255,.15)',
            container_border: 'rgba(0,122,255,.3)',
            container_shadow: 'inset 0 1px 0 rgba(0,122,255,.2), 0 8px 18px rgba(0,122,255,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(0,122,255,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(0,122,255,.3)'
        },
        'green': {
            name: 'Зелёная',
            container_bg: 'rgba(52,199,89,.15)',
            container_border: 'rgba(52,199,89,.3)',
            container_shadow: 'inset 0 1px 0 rgba(52,199,89,.2), 0 8px 18px rgba(52,199,89,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(52,199,89,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(52,199,89,.3)'
        },
        'purple': {
            name: 'Фиолетовая',
            container_bg: 'rgba(175,82,222,.15)',
            container_border: 'rgba(175,82,222,.3)',
            container_shadow: 'inset 0 1px 0 rgba(175,82,222,.2), 0 8px 18px rgba(175,82,222,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(175,82,222,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(175,82,222,.3)'
        },
        'red': {
            name: 'Красная',
            container_bg: 'rgba(255,59,48,.15)',
            container_border: 'rgba(255,59,48,.3)',
            container_shadow: 'inset 0 1px 0 rgba(255,59,48,.2), 0 8px 18px rgba(255,59,48,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(255,59,48,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,59,48,.3)'
        },
        'orange': {
            name: 'Оранжевая',
            container_bg: 'rgba(255,149,0,.15)',
            container_border: 'rgba(255,149,0,.3)',
            container_shadow: 'inset 0 1px 0 rgba(255,149,0,.2), 0 8px 18px rgba(255,149,0,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(255,149,0,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,149,0,.3)'
        },
        'pink': {
            name: 'Розовая',
            container_bg: 'rgba(255,45,85,.15)',
            container_border: 'rgba(255,45,85,.3)',
            container_shadow: 'inset 0 1px 0 rgba(255,45,85,.2), 0 8px 18px rgba(255,45,85,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(255,45,85,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,45,85,.3)'
        },
        'gold': {
            name: 'Золотая',
            container_bg: 'rgba(255,204,0,.15)',
            container_border: 'rgba(255,204,0,.3)',
            container_shadow: 'inset 0 1px 0 rgba(255,204,0,.2), 0 8px 18px rgba(255,204,0,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(255,204,0,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,204,0,.3)'
        },
        'dark': {
            name: 'Тёмная',
            container_bg: 'rgba(0,0,0,.6)',
            container_border: 'rgba(255,255,255,.05)',
            container_shadow: 'inset 0 1px 0 rgba(255,255,255,.05), 0 8px 18px rgba(0,0,0,.4)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.9)',
            button_hover_bg: 'rgba(255,255,255,.1)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,255,255,.05)'
        },
        'light': {
            name: 'Светлая',
            container_bg: 'rgba(255,255,255,.25)',
            container_border: 'rgba(255,255,255,.4)',
            container_shadow: 'inset 0 1px 0 rgba(255,255,255,.3), 0 8px 18px rgba(255,255,255,.1)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,1)',
            button_hover_bg: 'rgba(255,255,255,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,255,255,.4)'
        },
        'cyan': {
            name: 'Голубая',
            container_bg: 'rgba(50,173,230,.15)',
            container_border: 'rgba(50,173,230,.3)',
            container_shadow: 'inset 0 1px 0 rgba(50,173,230,.2), 0 8px 18px rgba(50,173,230,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(50,173,230,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(50,173,230,.3)'
        },
        'mint': {
            name: 'Мятная',
            container_bg: 'rgba(0,199,190,.15)',
            container_border: 'rgba(0,199,190,.3)',
            container_shadow: 'inset 0 1px 0 rgba(0,199,190,.2), 0 8px 18px rgba(0,199,190,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(0,199,190,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(0,199,190,.3)'
        }
    };

    // ==========================================
    // ГЕНЕРАЦИЯ ДИНАМИЧЕСКИХ СТИЛЕЙ
    // ==========================================

    function generateThemeStyles() {
        var theme = Lampa.Storage.get('m_button_theme', 'default');
        var colors = colorThemes[theme] || colorThemes['default'];
        
        return `
            /* Apple Style — кнопки карточки фильма */
            body.mod-buttons-apple .full-start__buttons,
            body.mod-buttons-apple .full-start-new__buttons {
                display: inline-flex !important; align-items: center; justify-content: flex-start;
                padding: 0.35em 0.4em !important; border-radius: 999px !important; margin-top: 1em;
                background: ${colors.container_bg} !important; 
                border: 1px solid ${colors.container_border} !important;
                box-shadow: ${colors.container_shadow} !important;
                backdrop-filter: blur(18px) saturate(140%) !important; 
                -webkit-backdrop-filter: blur(18px) saturate(140%) !important;
                width: max-content; flex-wrap: wrap !important; gap: 0.25em !important;
                font-size: var(--mod-btn-size, 1em) !important;
            }
            body.mod-buttons-apple-lite .full-start__buttons,
            body.mod-buttons-apple-lite .full-start-new__buttons {
                background: rgba(30, 32, 40, 0.98) !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.6) !important;
                backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
            }
            body.mod-buttons-apple .full-start__button,
            body.mod-buttons-apple .full-start-new__button {
                border: 0 !important; 
                background: ${colors.button_bg} !important; 
                color: ${colors.button_color} !important;
                height: 2.8em !important; min-height: 2.8em !important;
                display: inline-flex !important; align-items: center; justify-content: center;
                padding: 0 1.2em !important; border-radius: 999px !important;
                transition: background .2s ease, box-shadow .2s ease !important; 
                margin: 0 !important;
                font-weight: bold; font-size: inherit !important; box-shadow: none !important;
            }
            body.mod-buttons-apple .full-start__button.hidden,
            body.mod-buttons-apple .full-start-new__button.hidden,
            body.mod-buttons-apple .full-start__button.hide,
            body.mod-buttons-apple .full-start-new__button.hide,
            body.mod-buttons-apple .full-start__button[style*="display: none"],
            body.mod-buttons-apple .full-start-new__button[style*="display: none"],
            body.mod-buttons-apple .full-start__button[style*="display:none"],
            body.mod-buttons-apple .full-start-new__button[style*="display:none"] {
                display: none !important;
            }
            body.mod-buttons-apple .ua-sites-container {
                display: inline-flex !important; align-items: center; gap: 0.25em !important;
                margin: 0 !important; padding: 0 !important;
                background: transparent !important; border: none !important; box-shadow: none !important;
            }
            body.mod-buttons-apple .ua-btn-item {
                border: 0 !important; 
                background: ${colors.button_bg} !important; 
                color: ${colors.button_color} !important;
                height: 2.8em !important; min-height: 2.8em !important; width: 2.8em !important;
                display: inline-flex !important; align-items: center; justify-content: center;
                border-radius: 999px !important; 
                transition: background .2s ease, box-shadow .2s ease !important;
                margin: 0 !important; padding: 0 !important; box-shadow: none !important; 
                font-size: inherit !important;
            }
            body.mod-buttons-apple .full-start__button.focus,
            body.mod-buttons-apple .full-start__button:hover,
            body.mod-buttons-apple .ua-btn-item.focus,
            body.mod-buttons-apple .ua-btn-item:hover,
            body.mod-buttons-apple .ua-btn-item.active.focus {
                background: ${colors.button_hover_bg} !important;
                box-shadow: ${colors.button_hover_shadow} !important;
                transform: none !important; 
                color: #fff !important;
            }
            body.mod-buttons-apple .ua-btn-item.active { transform: none !important; }
            body.mod-buttons-apple .full-start__button svg { 
                width: 1.2em !important; height: 1.2em !important; margin-right: 0.4em !important; 
            }
            body.mod-buttons-apple .full-start__button.button--options svg { margin-right: 0 !important; }
            body.mod-buttons-apple .full-start__button.button--options { padding: 0 0.8em !important; }
            body.mod-buttons-apple .ua-btn-item img,
            body.mod-buttons-apple .ua-btn-item svg { 
                width: 1.5em !important; height: 1.5em !important; border-radius: 0 !important; 
                display: block; filter: none !important; 
            }
            body.mod-buttons-apple .ua-btn-item.loading svg { 
                animation: spin-badge 1.5s linear infinite !important; 
            }

            @media screen and (orientation: portrait), screen and (max-width: 767px) {
                body.mod-buttons-apple .full-start__buttons,
                body.mod-buttons-apple .full-start-new__buttons { 
                    justify-content: center !important; width: 100% !important; 
                    margin-left: 0 !important; margin-right: 0 !important; 
                }
            }

            div[data-component="m_buttons"] { display: none !important; }
        `;
    }

    // Инициализация стилей
    var styleElement = $('<style id="mod-apple-buttons-styles"></style>');
    $('head').append(styleElement);

    function updateStyles() {
        styleElement.text(generateThemeStyles());
    }

    updateStyles();

    // ==========================================
    // УПРАВЛЕНИЕ КЛАССАМИ BODY
    // ==========================================

    function updateBodyClasses() {
        var btnStyle = Lampa.Storage.get('m_button_style', 'normal');
        var btnSize  = Lampa.Storage.get('m_button_size', '1em');

        $('body').removeClass('mod-buttons-apple mod-buttons-apple-lite');
        
        if (btnStyle === 'apple') {
            $('body').addClass('mod-buttons-apple');
        }
        if (btnStyle === 'apple_lite') {
            $('body').addClass('mod-buttons-apple mod-buttons-apple-lite');
        }

        document.documentElement.style.setProperty('--mod-btn-size', btnSize);
        updateStyles();
    }

    updateBodyClasses();

    // ==========================================
    // СОЗДАНИЕ НАСТРОЕК
    // ==========================================

    function createSettings() {
        var MAIN_C = 'mod_apple_buttons';

        Lampa.SettingsApi.addComponent({
            component: MAIN_C,
            name: "Apple Style",
            icon: appleIcon
        });

        Lampa.SettingsApi.addParam({
            component: MAIN_C,
            param: {
                name: 'm_button_style',
                type: 'select',
                values: {
                    'normal': 'Обычный (Lampa)',
                    'apple': 'Apple Style (с размытием)',
                    'apple_lite': 'Apple Lite (без размытия)'
                },
                default: 'normal'
            },
            field: {
                name: 'Стиль кнопок',
                description: 'Внешний вид кнопок плеера, закладок и т.д.'
            },
            onChange: function () {
                updateBodyClasses();
            }
        });

        Lampa.SettingsApi.addParam({
            component: MAIN_C,
            param: {
                name: 'm_button_size',
                type: 'select',
                values: {
                    '0.8em': '0.8em (Мини)',
                    '0.9em': '0.9em (Мелкий)',
                    '1em': '1em (Стандарт)',
                    '1.1em': '1.1em (Больше)',
                    '1.2em': '1.2em (Крупный)',
                    '1.4em': '1.4em (Гигантский)'
                },
                default: '1em'
            },
            field: {
                name: 'Размер кнопок',
                description: 'Работает для Apple-стилей'
            },
            onChange: function () {
                updateBodyClasses();
            }
        });

        // Цветовая тема
        var themeValues = {};
        Object.keys(colorThemes).forEach(function(key) {
            themeValues[key] = colorThemes[key].name;
        });

        Lampa.SettingsApi.addParam({
            component: MAIN_C,
            param: {
                name: 'm_button_theme',
                type: 'select',
                values: themeValues,
                default: 'default'
            },
            field: {
                name: 'Цветовая тема',
                description: 'Окрас кнопок (работает только для Apple-стилей)'
            },
            onChange: function () {
                updateBodyClasses();
            }
        });
    }

    if (window.appready) {
        createSettings();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                createSettings();
            }
        });
    }

})();

})();
