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
    CARD_ANIM_KEY: 'appletv_agnative_card_anim',
    CARD_ANIM_ATTR: 'data-agnative-card-anim',
    CARD_ANIM_ORBIT_KEY: 'appletv_agnative_card_anim_orbit',
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
    CLOCK_COLOR_KEY: 'appletv_agnative_clock_color',
    CLOCK_COLOR_ATTR: 'data-agnative-clock-color',
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
    CARD_IMAGE_MODE_ATTR: 'data-agnative-card-image-mode',
    LOGO_TITLE_KEY: 'appletv_agnative_logo_title_fallback',
    TITLE_MODE_KEY: 'appletv_agnative_title_mode',
    TITLE_SIZE_KEY: 'appletv_agnative_title_size',
    TITLE_COLOR_KEY: 'appletv_agnative_title_color',
    TITLE_MODE_ATTR: 'data-agnative-title-mode',
    TITLE_SIZE_ATTR: 'data-agnative-title-size',
    TITLE_COLOR_ATTR: 'data-agnative-title-color',
    TITLE_MODE_KEY: 'appletv_agnative_title_mode',
    TITLE_MODE_ATTR: 'data-agnative-title-mode',
    TOPNAV_ENABLE_KEY: 'appletv_agnative_topnav_visible',
    TOPNAV_ICONS_ORDER_KEY: 'appletv_agnative_topnav_icons_order',
    TOPNAV_SIZE_KEY: 'appletv_agnative_topnav_size',
    TOPNAV_SIZE_ATTR: 'data-agnative-topnav-size',
    SETTINGS_HIDE_KEY: 'appletv_agnative_settings_hide',
    SETTINGS_HIDE_COMPONENT: 'agnative_settings_hide'
  };

  const PLUGIN_VERSION = '0.4.3';

  const ru = {
    nav_feed: 'Лента',
    badge_movie: 'ФИЛЬМ', badge_tv: 'СЕРИАЛ',
    set_about_version: 'Версия',
    set_about_authors: 'Авторы',
    set_main_title: 'Основные настройки',
    set_enable_name: 'AppleTV AgNative',
    set_enable_desc: 'Включает и выключает плагин',
    set_card_anim_name: 'Анимация карточек',
    set_card_anim_desc: 'Эффект при наведении/фокусе на карточку',
    val_card_anim_off: 'Выключено',
    val_card_anim_veoveo: 'Наклон veoveo.ru (arabian_q)',
    val_card_anim_appletv: 'DepthTV (based on marcreichel)',
    set_card_anim_orbit_name: 'Авто-анимация на ТВ',
    set_card_anim_orbit_desc: 'На сфокусированной карточке имитировать круговое движение',
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
    set_rating_style_desc: 'Цветной или монохромный стиль рейтинга tmdb',
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
    val_card_image_poster: 'Постер',
    set_logo_title_name: 'Название на локальном языке',
    set_logo_title_desc: 'Показывать название на локальном языке, если логотип или постер не на локальном',
    set_title_size_name: 'Размер названий', set_title_size_desc: 'Размер текста под постером',
    set_title_color_name: 'Цвет названий', set_title_color_desc: 'Цвет текста под постером',
    val_title_color_white: 'Белый', val_title_color_gray: 'Серый', val_title_color_cyan: 'Бирюзовый', val_title_color_gold: 'Золотой',
    set_title_mode_name: 'Названия под постерами',
    set_title_mode_desc: 'Выберите, где показывать название карточки',
    val_title_overlay: 'На постере', val_title_below: 'Под постером', val_title_off: 'Скрыть',
    val_anim_pan_down: 'Панорама ↓', val_anim_pan_up: 'Панорама ↑',
    val_anim_zoom_in: 'Приближение', val_anim_zoom_out: 'Отдаление',
    val_anim_drift: 'Дрейф', val_anim_breathe: 'Дыхание',
    val_trailer_mode_posters: 'Только постеры',
    val_trailer_mode_mixed: 'Постеры + трейлер после простоя',
    val_trailer_mode_trailers: 'Только трейлеры',
    val_sec_short: 'сек',
    set_section_beta: 'Beta - функции',
    set_section_topnav: 'Верхняя панель',
    set_section_logos: 'Логотипы и постеры',
    set_topnav_enable_name: 'Верхняя панель навигации',
    set_topnav_enable_desc: 'Показывать или скрыть верхнюю панель (меню / часы)',
    set_topnav_size_name: 'Размер верхней панели',
    set_topnav_size_desc: 'Масштаб панели сверху (пункты меню, часы, профиль)',
    set_topnav_icons_order_name: 'Поиск и избранное',
    set_topnav_icons_order_desc: 'Где разместить иконки поиска и избранного на верхней панели',
    val_topnav_icons_end: 'Оба в конце',
    val_topnav_icons_start: 'Оба в начале',
    val_topnav_icons_split: 'Поиск в начале, избранное в конце',
    set_topnav_position: 'Позиция',
    set_settings_hide_name: 'Скрыть разделы настроек',
    set_settings_hide_desc: 'Выбрать какие разделы верхнего уровня скрыть в настройках Lampa',
    set_settings_hide_title: 'Скрыть разделы',
    set_settings_hide_item_desc: 'Скрыть этот раздел из главных настроек Lampa'
  };

  const en = {
    nav_feed: 'Feed',
    badge_movie: 'MOVIE', badge_tv: 'TV SHOW',
    set_about_version: 'Version',
    set_about_authors: 'Authors',
    set_main_title: 'Main settings',
    set_enable_name: 'AppleTV AgNative',
    set_enable_desc: 'Enables and disables the plugin',
    set_card_anim_name: 'Card animation',
    set_card_anim_desc: 'Effect on card hover / focus',
    val_card_anim_off: 'Off',
    val_card_anim_veoveo: 'veoveo.ru tilt (arabian_q)',
    val_card_anim_appletv: 'DepthTV (based on marcreichel)',
    set_card_anim_orbit_name: 'Auto animation on TV',
    set_card_anim_orbit_desc: 'Simulate a circular motion on the focused card',
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
    val_card_image_poster: 'Poster',
    set_logo_title_name: 'Local language title',
    set_logo_title_desc: 'Show title in local language when the logo or poster is not in local',
    set_title_mode_name: 'Poster title position',
    set_title_mode_desc: 'Choose where the card title is shown',
    val_title_overlay: 'On poster', val_title_below: 'Below poster', val_title_off: 'Hidden',
    val_anim_pan_down: 'Pan ↓', val_anim_pan_up: 'Pan ↑',
    val_anim_zoom_in: 'Zoom in', val_anim_zoom_out: 'Zoom out',
    val_anim_drift: 'Drift', val_anim_breathe: 'Breathe',
    val_trailer_mode_posters: 'Posters only',
    val_trailer_mode_mixed: 'Posters + trailer after idle',
    val_trailer_mode_trailers: 'Trailers only',
    val_sec_short: 'sec',
    set_section_beta: 'Beta features',
    set_section_topnav: 'Top navigation',
    set_section_logos: 'Logos and posters',
    set_topnav_enable_name: 'Top navigation bar',
    set_topnav_enable_desc: 'Show or hide the top navigation (logo / menu items / time)',
    set_topnav_size_name: 'Top navigation size',
    set_topnav_size_desc: 'Scale of the topnav bar (menu items, clock, profile)',
    set_topnav_icons_order_name: 'Search & favorites',
    set_topnav_icons_order_desc: 'Where to place the search and favorites icons on the top navigation',
    val_topnav_icons_end: 'Both at the end',
    val_topnav_icons_start: 'Both at the start',
    val_topnav_icons_split: 'Search at start, favorites at end',
    set_topnav_position: 'Position',
    set_settings_hide_name: 'Hide settings sections',
    set_settings_hide_desc: 'Choose which top-level sections to hide in Lampa settings',
    set_settings_hide_title: 'Hide sections',
    set_settings_hide_item_desc: 'Hide this section from main Lampa settings'
  };

  const uk = {
    nav_feed: 'Стрічка',
    badge_movie: 'ФІЛЬМ', badge_tv: 'СЕРІАЛ',
    set_about_version: 'Версія',
    set_about_authors: 'Автори',
    set_main_title: 'Основні налаштування',
    set_enable_name: 'AppleTV AgNative',
    set_enable_desc: 'Вмикає та вимикає плагін',
    set_card_anim_name: 'Анімація карток',
    set_card_anim_desc: 'Ефект при наведенні/фокусі на картку',
    val_card_anim_off: 'Вимкнено',
    val_card_anim_veoveo: 'Нахил veoveo.ru (arabian_q)',
    val_card_anim_appletv: 'DepthTV (based on marcreichel)',
    set_card_anim_orbit_name: 'Авто-анімація на ТВ',
    set_card_anim_orbit_desc: 'На сфокусованій картці імітувати круговий рух',
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
    val_card_image_poster: 'Постер',
    set_logo_title_name: 'Назва на локальній мові',
    set_logo_title_desc: 'Показувати назву локальною мовою, якщо логотип або постер не на локальній',
    set_title_mode_name: 'Назви під постерами',
    set_title_mode_desc: 'Оберіть, де показувати назву картки',
    val_title_overlay: 'На постері', val_title_below: 'Під постером', val_title_off: 'Сховати',
    val_anim_pan_down: 'Панорама ↓', val_anim_pan_up: 'Панорама ↑',
    val_anim_zoom_in: 'Наближення', val_anim_zoom_out: 'Віддалення',
    val_anim_drift: 'Дрейф', val_anim_breathe: 'Дихання',
    val_trailer_mode_posters: 'Лише постери',
    val_trailer_mode_mixed: 'Постери + трейлер після простою',
    val_trailer_mode_trailers: 'Тільки трейлери',
    val_sec_short: 'сек',
    set_section_beta: 'Beta - функції',
    set_section_topnav: 'Верхня панель',
    set_section_logos: 'Логотипи та постери',
    set_topnav_enable_name: 'Верхня панель навігації',
    set_topnav_enable_desc: 'Показувати або приховати верхню панель (меню / годинник)',
    set_topnav_size_name: 'Розмір верхньої панелі',
    set_topnav_size_desc: 'Масштаб панелі вгорі (пункти меню, годинник, профіль)',
    set_topnav_icons_order_name: 'Пошук та обране',
    set_topnav_icons_order_desc: 'Де розмістити іконки пошуку та обраного на верхній панелі',
    val_topnav_icons_end: 'Обидва в кінці',
    val_topnav_icons_start: 'Обидва на початку',
    val_topnav_icons_split: 'Пошук на початку, обране в кінці',
    set_topnav_position: 'Позиція',
    set_settings_hide_name: 'Сховати розділи налаштувань',
    set_settings_hide_desc: 'Вибрати які розділи верхнього рівня сховати в налаштуваннях Lampa',
    set_settings_hide_title: 'Сховати розділи',
    set_settings_hide_item_desc: 'Сховати цей розділ з головних налаштувань Lampa'
  };

  const be = {
    nav_feed: 'Стужка',
    badge_movie: 'ФІЛЬМ', badge_tv: 'СЕРЫЯЛ',
    set_about_version: 'Версія',
    set_about_authors: 'Аўтары',
    set_main_title: 'Асноўныя налады',
    set_enable_name: 'AppleTV AgNative',
    set_enable_desc: 'Уключае і выключае плагін',
    set_card_anim_name: 'Анімацыя картак',
    set_card_anim_desc: 'Эфект пры навядзенні/фокусе на картку',
    val_card_anim_off: 'Выключана',
    val_card_anim_veoveo: 'Нахіл veoveo.ru (arabian_q)',
    val_card_anim_appletv: 'DepthTV (based on marcreichel)',
    set_card_anim_orbit_name: 'Аўта-анімацыя на ТВ',
    set_card_anim_orbit_desc: 'На сфакусаванай картцы імітаваць кругавы рух',
    set_topnav_name: 'Пункты Topnav', set_topnav_desc: 'Меню ўверсе старонкі',
    set_topnav_title: 'Пункты верхняга меню',
    set_topnav_item_desc: 'Пункт menu_list: ',
    set_logo_lang_name: 'Мова лагатыпаў',
    set_logo_lang_desc: 'Калі лагатыпа на выбранай мове няма, выкарыстоўваецца англійская',
    set_font_size_name: 'Памер шрыфту',
    set_font_size_desc: 'Маштаб тэксту',
    set_ui_lang_desc: 'Мова плагіна',
    val_on: 'Уключыць', val_off: 'Выключыць',
    val_hide: 'Схаваць',
    val_auto: 'Аўтаматычна',
    val_size_xs: 'Дробны', val_size_sm: 'Маленькі',
    val_size_md: 'Звычайны', val_size_lg: 'Крупны', val_size_xl: 'Велізарны',
    val_rating_color: 'Каляровы', val_rating_mono: 'Манахромны',
    set_backdrop_name: 'Гарызантальныя карткі медыякантэнту',
    set_backdrop_desc: 'Калі опцыя ўключана адлюстроўваюцца гарызантальныя карткі, калі выключана то вертыкальныя',
    set_badge_name: 'Бэйдж «Фільм/Серыял»',
    set_badge_desc: 'Бэйдж у левым верхнім куце карткі',
    set_rating_desc: 'Паказваць ацэнку ў правым верхнім куце карткі',
    set_rating_style_name: 'Стыль рэйтынгу TMDB',
    set_rating_style_desc: 'Каляровы ці манахромны выгляд стылю рэйтынгу tmdb',
    set_reset_name: 'Скінуць налады',
    set_reset_desc: 'Вярнуць усе параметры плагіна да значэнняў па змаўчанні',
    set_reset_done: 'Налады AppleTV AgNative скінуты',
    set_category_size_name: 'Памер назваў катэгорый',
    set_category_size_desc: 'Загалоўкі паліц (Папулярнае, Навінкі і г.д.)',
    set_card_size_name: 'Памер карткі',
    set_card_size_desc: 'Шырыня карткі ў стужках',
    set_logo_size_name: 'Памер лагатыпа фільма',
    set_logo_size_desc: 'Максімальная шырыня лагатыпа на картцы адносна карткі медыякантэнту',
    set_clock_seconds_name: 'Секунды ў гадзінніку',
    set_clock_seconds_desc: 'Паказваць секунды побач з гадзіннікам у шапцы',
    set_control_panel_name: 'Панэль па кліку на гадзіннік',
    set_control_panel_desc: 'Налады, Сінхранізацыя, Плэер, Кэш і Даныя',
    set_perf_mode_name: 'Рэжым прадукцыйнасці',
    set_perf_mode_desc: 'Зніжае нагрузку на слабых прыладах: адключае блюр, блікі і цяжкую анімацыю',
    val_unlimited: 'Без абмежаванняў',
    set_cache_size_name: 'Памер кэша выяў',
    set_cache_size_desc: 'Максімальны аб\'ём выяў у лакальным кэшы. Пры перавышэнні выдаляюцца самыя старыя запісы',
    val_perf_auto: 'Аўтаматычна',
    val_perf_high: 'Максімум (усе эфекты)',
    val_perf_low: 'Слабая прылада',
    val_perf_ultra: 'Вельмі слабая прылада',
    set_poster_quality_name: 'Якасць постэраў',
    set_poster_quality_desc: 'Разрозненне выяў постэраў з TMDB',
    set_overlay_align_name: 'Выраўноўванне подпісу карткі',
    set_overlay_align_desc: 'Гарызантальнае выраўноўванне назвы і метададзеных на картцы',
    val_overlay_align_start: 'Па левым краі',
    val_overlay_align_center: 'Па цэнтры',
    val_overlay_align_end: 'Па правым краі',
    set_section_cards: 'Карткі',
    set_section_text: 'Тэкст і шрыфты',
    set_section_clock: 'Гадзіннік',
    set_section_data: 'Даныя',
    set_card_image_mode_name: 'Тып выявы карткі',
    set_card_image_mode_desc: 'Бэкдроп + лагатып ці постэр без лагатыпа',
    val_card_image_backdrop: 'Бэкдроп + Лагатып',
    val_card_image_poster: 'Постэр',
    set_logo_title_name: 'Назва на мясцовай мове',
    set_logo_title_desc: 'Паказваць назву на мясцовай мове, калі лагатып або плакат не на мясцовай',
    set_title_mode_name: 'Назвы пад постэрамі',
    set_title_mode_desc: 'Выберыце, дзе паказваць назву карткі',
    val_title_overlay: 'На постэры', val_title_below: 'Пад постэрам', val_title_off: 'Схаваць',
    val_anim_pan_down: 'Панарама ↓', val_anim_pan_up: 'Панарама ↑',
    val_anim_zoom_in: 'Набліжэнне', val_anim_zoom_out: 'Аддаленне',
    val_anim_drift: 'Дрэйф', val_anim_breathe: 'Дыханне',
    val_trailer_mode_posters: 'Толькі постэры',
    val_trailer_mode_mixed: 'Постэры + трэйлер пасля прастою',
    val_trailer_mode_trailers: 'Толькі трэйлеры',
    val_sec_short: 'сек',
    set_section_beta: 'Beta - функцыі',
    set_section_topnav: 'Верхняя панэль',
    set_section_logos: 'Лагатыпы і постэры',
    set_topnav_enable_name: 'Верхняя панэль навігацыі',
    set_topnav_enable_desc: 'Паказаць або схаваць верхнюю панэль (меню / гадзіннік)',
    set_topnav_size_name: 'Памер верхняй панэлі',
    set_topnav_size_desc: 'Маштаб верхняй панэлі (пункты меню, гадзіннік, профіль)',
    set_topnav_icons_order_name: 'Пошук і абранае',
    set_topnav_icons_order_desc: 'Дзе размясціць іконкі пошуку і абранага на верхняй панэлі',
    val_topnav_icons_end: 'Абодва ў канцы',
    val_topnav_icons_start: 'Абодва ў пачатку',
    val_topnav_icons_split: 'Пошук у пачатку, абранае ў канцы',
    set_topnav_position: 'Пазіцыя',
    set_settings_hide_name: 'Схаваць раздзелы налад',
    set_settings_hide_desc: 'Выбраць якія раздзелы верхняга ўзроўню схаваць у наладах Lampa',
    set_settings_hide_title: 'Схаваць раздзелы',
    set_settings_hide_item_desc: 'Схаваць гэты раздзел з галоўных налад Lampa'
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
    },
    be: {
      28: 'Баявік', 12: 'Прыгоды', 16: 'Мультфільм', 35: 'Камедыя', 80: 'Крымінал',
      99: 'Дакументальны', 18: 'Драма', 10751: 'Сямейны', 14: 'Фэнтэзі', 36: 'Гісторыя',
      27: 'Жахі', 10402: 'Музыка', 9648: 'Дэтэктыў', 10749: 'Меладрама', 878: 'Фантастыка',
      10770: 'Тэлефільм', 53: 'Трылер', 10752: 'Вайсковы', 37: 'Вэстэрн', 10759: 'Баявік',
      10762: 'Дзіцячы', 10765: 'Фантастыка', 10767: 'Ток-шоу'
    }
  };

  const I18N = { ru, en, uk, be };
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
  var DB_VERSION = 2;
  var STORE_META = 'meta';
  var STORE_IMG = 'img';
  var STORE_VIDEO = 'video';
  var FAILED_TTL = 24 * 60 * 60 * 1000;
  var VIDEO_FAILED_TTL = 6 * 60 * 60 * 1000;

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
        if (!db.objectStoreNames.contains(STORE_VIDEO)) db.createObjectStore(STORE_VIDEO, { keyPath: 'key' });
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
        var stores = [STORE_META, STORE_IMG];
        if (db.objectStoreNames.contains(STORE_VIDEO)) stores.push(STORE_VIDEO);
        var tx = db.transaction(stores, 'readwrite');
        tx.objectStore(STORE_META).clear();
        tx.objectStore(STORE_IMG).clear();
        if (db.objectStoreNames.contains(STORE_VIDEO)) tx.objectStore(STORE_VIDEO).clear();
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

  var _videoTried = {};
  var _videoUrlMap = {};

  function getVideoEntry(key, callback) {
    openDB(function (db) {
      if (!db || !db.objectStoreNames.contains(STORE_VIDEO)) { callback(null); return; }
      try {
        var req = db.transaction(STORE_VIDEO, 'readonly').objectStore(STORE_VIDEO).get(key);
        req.onsuccess = function () {
          var entry = req.result;
          if (!entry) { callback(null); return; }
          if (entry.failed && Date.now() - entry.t > VIDEO_FAILED_TTL) { callback(null); return; }
          callback(entry);
        };
        req.onerror = function () { callback(null); };
      } catch (e) { callback(null); }
    });
  }

  function attemptStoreVideo(url, key, onDone) {
    if (_videoTried[key]) { if (onDone) onDone(false); return; }
    _videoTried[key] = true;
    try {
      if (typeof fetch !== 'function') { if (onDone) onDone(false); return; }
      fetch(url, { mode: 'cors', credentials: 'omit' }).then(function (r) {
        try {
          if (!r.ok) {
            idbSet(STORE_VIDEO, key, null, { s: 0, failed: true });
            if (onDone) onDone(false);
            return;
          }
          r.blob().then(function (b) {
            try { idbSet(STORE_VIDEO, key, b, { s: b.size }); } catch (e) {}
            if (onDone) onDone(true);
          }, function () {
            if (onDone) onDone(false);
          });
        } catch (e) {
          if (onDone) onDone(false);
        }
      }, function () {
        try { idbSet(STORE_VIDEO, key, null, { s: 0, failed: true }); } catch (e) {}
        if (onDone) onDone(false);
      });
    } catch (e) {
      if (onDone) onDone(false);
    }
  }

  function videoLoad(url, callback) {
    var key = url;
    getVideoEntry(key, function (entry) {
      if (entry && entry.v) {
        try {
          var obj = URL.createObjectURL(entry.v);
          _videoUrlMap[key] = obj;
          callback(obj, true);
          return;
        } catch (e) {}
      }
      callback(url, false);
      if (entry && entry.failed) {
        _videoTried[key] = true;
        return;
      }
      attemptStoreVideo(url, key);
    });
  }

  function videoPreload(url, onDone) {
    var key = url;
    getVideoEntry(key, function (entry) {
      if (entry && entry.v) { if (onDone) onDone(true); return; }
      if (entry && entry.failed) { if (onDone) onDone(false); return; }
      attemptStoreVideo(url, key, onDone);
    });
  }

  function videoMarkFailed(url) {
    idbSet(STORE_VIDEO, url, null, { s: 0, failed: true });
    _videoTried[url] = true;
  }

  function videoRevoke(objUrl) {
    if (typeof objUrl === 'string' && objUrl.indexOf('blob:') === 0) {
      try { URL.revokeObjectURL(objUrl); } catch (e) {}
    }
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
      CARD_ANIM_KEY,
      CARD_ANIM_ATTR,
      CARD_ANIM_ORBIT_KEY,
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
      CARD_IMAGE_MODE_ATTR,
      TITLE_MODE_ATTR,
      TITLE_SIZE_ATTR,
      TITLE_COLOR_ATTR,
      TITLE_MODE_ATTR,
      LOGO_TITLE_KEY,
      TITLE_MODE_KEY,
      TITLE_SIZE_KEY,
      TITLE_COLOR_KEY,
      TITLE_MODE_KEY,
      TOPNAV_ENABLE_KEY,
      TOPNAV_ICONS_ORDER_KEY,
      TOPNAV_SIZE_KEY,
      TOPNAV_SIZE_ATTR,
      SETTINGS_HIDE_KEY,
      SETTINGS_HIDE_COMPONENT
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
    var activityPushPatched = false;
    var activityPushOriginal = null;
    var leftdockHoverHandler = null;
    var controllerTogglePatched = false;
    var controllerToggleOriginal = null;
    var settingsOutsideHandler = null;
    var settingsLifecycleObserver = null;
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
        if (l.indexOf('ru') === 0) return 'ru';
        if (l.indexOf('be') === 0) return 'be';
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

    function logoTitleEnabled() {
      try {
        if (!window.Lampa || !Lampa.Storage) return false;
        var v = Lampa.Storage.get(LOGO_TITLE_KEY, 'false');
        return v === true || v === 'true' || v === 'on';
      } catch (e) { return false; }
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

    function getTitleMode() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'overlay';
        var v = Lampa.Storage.get(TITLE_MODE_KEY, 'overlay') || 'overlay';
        return (v === 'below' || v === 'off') ? v : 'overlay';
      } catch (e) { return 'overlay'; }
    }

    function syncTitleMode() {
      if (!document.body) return;
      document.body.setAttribute(TITLE_MODE_ATTR, getTitleMode());
    }

    function getTitleSize() {
      try { var v = Lampa.Storage.get(TITLE_SIZE_KEY, 'md') || 'md'; return ['sm','md','lg','xl'].indexOf(v) >= 0 ? v : 'md'; } catch (e) { return 'md'; }
    }
    function getTitleColor() {
      try { var v = Lampa.Storage.get(TITLE_COLOR_KEY, 'white') || 'white'; return ['white','gray','cyan','gold'].indexOf(v) >= 0 ? v : 'white'; } catch (e) { return 'white'; }
    }
    function syncTitleStyle() {
      if (!document.body) return;
      document.body.setAttribute(TITLE_SIZE_ATTR, getTitleSize());
      document.body.setAttribute(TITLE_COLOR_ATTR, getTitleColor());
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

    function getCardAnim() {
      try {
        if (!window.Lampa || !Lampa.Storage) return 'veoveo';
        var raw = Lampa.Storage.get(CARD_ANIM_KEY, null);
        if (raw === 'off' || raw === 'veoveo' || raw === 'appletv') return raw;
        var legacy = Lampa.Storage.get(GLARE_KEY, 'on');
        if (legacy === 'off') return 'off';
        return 'veoveo';
      } catch (e) { return 'veoveo'; }
    }

    function glareEnabled() {
      return getCardAnim() === 'veoveo';
    }

    function cardAnimOrbitEnabled() {
      try {
        if (!window.Lampa || !Lampa.Storage) return false;
        var v = Lampa.Storage.get(CARD_ANIM_ORBIT_KEY, 'false');
        return v === true || v === 'true' || v === 'on';
      } catch (e) { return false; }
    }

    function sceneActive() {
      return true;
    }

    function removePluginUi() {
      try {
        if (document.body) {
          document.body.classList.remove(BODY_CLASS);
          document.body.classList.remove(GLARE_CLASS);
          document.body.removeAttribute(CARD_ANIM_ATTR);
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
          document.body.removeAttribute(TOPNAV_SIZE_ATTR);
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
        if (leftdock) leftdock.remove();
        disconnectMenuObserver();
        disconnectSettingsLifecycle();
        controlPanelOpen = false;
        unbindControlPanelOutsideClose();
        var headEl = document.querySelector('.head');
        if (headEl && headEl.__agnativeWheelBound) {
          headEl.removeEventListener('wheel', forwardWheelBelowTopnav, { passive: false });
          headEl.__agnativeWheelBound = false;
        }
      } catch (e) { }
    }

    function showReloadConfirm(cancel) {
      try {
        if (!window.Lampa || !Lampa.Modal || !Lampa.Lang || !window.$) return;
        Lampa.Modal.open({
          title: '',
          align: 'center',
          zIndex: 300,
          html: $('<div class="about">' + Lampa.Lang.translate('plugins_need_reload') + '</div>'),
          buttons: [
            {
              name: Lampa.Lang.translate('settings_param_no'),
              onSelect: function () {
                Lampa.Modal.close();
                if (typeof cancel === 'function') cancel();
              }
            },
            {
              name: Lampa.Lang.translate('settings_param_yes'),
              onSelect: function () {
                window.location.reload();
              }
            }
          ]
        });
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

    

    function openSettingsHideSection() {
      if (!window.Lampa || !Lampa.Settings || !Lampa.Settings.create) return;
      setTimeout(function () {
        Lampa.Settings.create(SETTINGS_HIDE_COMPONENT, {
          onBack: function () {
            Lampa.Settings.create(SETTINGS_COMPONENT);
            setTimeout(function () { schedulePatch(); }, 80);
          }
        });
      }, 0);
    }

    // Standard Lampa top-level settings sections (data-component values in settings/main template).
    function getSettingsSectionDefs() {
      return [
        { id: 'account',          label: langText('settings_cub_sync', 'Sync') },
        { id: 'interface',        label: langText('settings_main_interface', 'Interface') },
        { id: 'player',           label: langText('settings_main_player', 'Player') },
        { id: 'parser',           label: langText('settings_main_parser', 'Parser') },
        { id: 'server',           label: langText('settings_main_torrserver', 'TorrServer') },
        { id: 'tmdb',             label: 'TMDB' },
        { id: 'plugins',          label: langText('settings_main_plugins', 'Plugins') },
        { id: 'parental_control', label: langText('title_parental_control', 'Parental control') },
        { id: 'more',             label: langText('settings_main_rest', 'More') }
      ];
    }

    function getHiddenSettingsSections() {
      try {
        if (!window.Lampa || !Lampa.Storage) return [];
        var raw = Lampa.Storage.get(SETTINGS_HIDE_KEY, []);
        if (typeof raw === 'string') {
          try { raw = JSON.parse(raw); }
          catch (e) { raw = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean); }
        }
        return Array.isArray(raw) ? raw : [];
      } catch (e) { return []; }
    }

    function setHiddenSettingsSections(list) {
      try {
        if (!window.Lampa || !Lampa.Storage) return;
        Lampa.Storage.set(SETTINGS_HIDE_KEY, Array.isArray(list) ? list : []);
      } catch (e) { }
    }

    function toggleSettingsSectionHidden(id, hidden) {
      var list = getHiddenSettingsSections();
      var idx = list.indexOf(id);
      if (hidden && idx === -1) list.push(id);
      if (!hidden && idx !== -1) list.splice(idx, 1);
      setHiddenSettingsSections(list);
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
      var mode = pluginEnabled() ? getCardAnim() : 'off';
      if (resolvePerfLevel() === 'ultra') mode = 'off';
      document.body.setAttribute(CARD_ANIM_ATTR, mode);
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
      syncTitleStyle();
      syncTitleMode();
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
        Lampa.Storage.set(CARD_ANIM_KEY, 'veoveo');
        Lampa.Storage.set(CARD_ANIM_ORBIT_KEY, 'false');
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
        Lampa.Storage.set(LOGO_TITLE_KEY, 'false');
        Lampa.Storage.set(TITLE_SIZE_KEY, 'md');
        Lampa.Storage.set(TITLE_COLOR_KEY, 'white');
        Lampa.Storage.set(TITLE_MODE_KEY, 'overlay');
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
        syncTopnavSize();
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
      var current = getStoredTopnavActions().filter(function (item, index, arr) {
        return item && arr.indexOf(item) === index;
      });

      if (enabled) {
        if (current.indexOf(action) === -1) current.push(action);
      } else {
        current = current.filter(function (item) { return item !== action; });
      }

      // Preserve user-defined order, no auto-sorting
      setStoredTopnavActions(current);
    }

    function moveTopnavAction(action, direction) {
      var current = getStoredTopnavActions().filter(function (item, index, arr) {
        return item && arr.indexOf(item) === index;
      });
      var idx = current.indexOf(action);
      if (idx === -1) return;
      var newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= current.length) return;
      var tmp = current[idx];
      current[idx] = current[newIdx];
      current[newIdx] = tmp;
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

    function isOnMainPage() {
      try {
        if (window.Lampa && Lampa.Activity && typeof Lampa.Activity.active === 'function') {
          var active = Lampa.Activity.active();
          if (active && active.component) return active.component === 'main';
        }
      } catch (e) {}
      return false;
    }

    

    

    

    

    

    

    

    

    


    

    

    

    

    

    

    

    function extractDominantColor(url, callback) {
      if (!url) return callback(null);
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          var w = 32, h = 32;
          canvas.width = w; canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          var data = ctx.getImageData(0, 0, w, h).data;
          var r = 0, g = 0, b = 0, count = 0;
          for (var i = 0; i < data.length; i += 4) {
            var pr = data[i], pg = data[i + 1], pb = data[i + 2];
            var lum = (pr + pg + pb) / 3;
            if (lum < 25 || lum > 230) continue;
            r += pr; g += pg; b += pb; count++;
          }
          if (count === 0) return callback(null);
          callback({ r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) });
        } catch (e) { callback(null); }
      };
      img.onerror = function () { callback(null); };
      img.src = url;
    }

    

    

    

    

    

    

    


    

    

    

    

    

    

    

    

    

    

    

    

    

    

    function resolveImdbId(tmdbId, type, callback, sourceItem) {
      if (!tmdbId) return callback('');
      if (sourceItem && typeof sourceItem.imdb_id === 'string' && sourceItem.imdb_id.indexOf('tt') === 0) {
        return callback(sourceItem.imdb_id);
      }
      var cacheKey = 'imdb_id_v2/' + type + '/' + tmdbId;

      function finish(value, persist) {
        if (persist) { try { metaSet(cacheKey, value || ''); } catch (e) {} }
        for (var i = 0; i < cbs.length; i++) {
          try { cbs[i](value || ''); } catch (e) {}
        }
      }

      metaGet(cacheKey, function (persisted) {
        if (persisted !== undefined && persisted !== null) {
          for (var i = 0; i < cbs.length; i++) {
            try { cbs[i](persisted || ''); } catch (e) {}
          }
          return;
        }
        var url = 'https://api.themoviedb.org/3/' + type + '/' + tmdbId + '/external_ids?api_key=' + TMDB_KEY;
        fetchJsonWithTimeout(url, 8000).then(function (data) {
          finish((data && data.imdb_id) || '', !!(data && data.imdb_id));
        }, function () {
          finish('', false);
        });
      });
    }

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    

    function isUiLayerOpen() {
      try {
        if (!document.body) return false;
        if (document.body.classList.contains('settings--open')) return true;
        if (document.body.classList.contains('selectbox--open')) return true;
        if (document.body.classList.contains('search--open')) return true;
        if (document.querySelector('.modal, .player, .youtube-player, .search-box')) return true;
        return false;
      } catch (e) { return false; }
    }

    function registerSettings() {
      try {
        if (!window.Lampa || !Lampa.SettingsApi || window.__APPLETV_AGNATIVE_TOPNAV_SETTINGS__) return;
        window.__APPLETV_AGNATIVE_TOPNAV_SETTINGS__ = true;

        if (Lampa.Template && Lampa.Template.add) {
          Lampa.Template.add('settings_' + SETTINGS_COMPONENT, '<div></div>');
          Lampa.Template.add('settings_' + TOPNAV_SETTINGS_COMPONENT, '<div></div>');
          Lampa.Template.add('settings_' + SETTINGS_HIDE_COMPONENT, '<div></div>');
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
            description: t('set_about_version') + ' ' + PLUGIN_VERSION
          }
        });

        // ═══════════════════════════════════════════════════════════
        // 1. Основные
        // ═══════════════════════════════════════════════════════════
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
            values: { on: t('val_on'), off: t('val_off') },
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
              uk: langText('filter_lang_uk', t('val_uk')),
              be: langText('filter_lang_be', t('val_be'))
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
            showReloadConfirm(function () {
              try { Lampa.Controller.toggle('settings_component'); } catch (e) { }
            });
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

        // ═══════════════════════════════════════════════════════════
        // 2. Верхняя панель
        // ═══════════════════════════════════════════════════════════
        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { type: 'title' },
          field: { name: t('set_section_topnav') }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: TOPNAV_ENABLE_KEY,
            type: 'select',
            values: { on: t('val_on'), off: t('val_off') },
            default: 'on'
          },
          field: {
            name: t('set_topnav_enable_name'),
            description: t('set_topnav_enable_desc')
          },
          onChange: function (value) {
            if (value === 'off') removeTopnavUi();
            else setTimeout(function () { schedulePatch(); }, 50);
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: TOPNAV_SIZE_KEY,
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
            name: t('set_topnav_size_name'),
            description: t('set_topnav_size_desc')
          },
          onChange: function () {
            syncTopnavSize();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: TOPNAV_ICONS_ORDER_KEY,
            type: 'select',
            values: {
              end: t('val_topnav_icons_end'),
              start: t('val_topnav_icons_start'),
              split: t('val_topnav_icons_split')
            },
            default: 'end'
          },
          field: {
            name: t('set_topnav_icons_order_name'),
            description: t('set_topnav_icons_order_desc')
          },
          onChange: function () {
            setTimeout(function () { schedulePatch(); }, 50);
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

        // ═══════════════════════════════════════════════════════════
        // 4. Карточки
        // ═══════════════════════════════════════════════════════════
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
            values: { on: t('val_on'), off: t('val_off') },
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
            name: TITLE_MODE_KEY,
            type: 'select',
            values: {
              overlay: t('val_title_overlay'),
              below: t('val_title_below'),
              off: t('val_title_off')
            },
            default: 'overlay'
          },
          field: {
            name: t('set_title_mode_name'),
            description: t('set_title_mode_desc')
          },
          onChange: function () {
            syncTitleMode();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { name: TITLE_SIZE_KEY, type: 'select', values: { sm: 'Маленький', md: 'Обычный', lg: 'Крупный', xl: 'Очень крупный' }, default: 'md' },
          field: { name: t('set_title_size_name'), description: t('set_title_size_desc') },
          onChange: function () { syncTitleStyle(); }
        });
        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { name: TITLE_COLOR_KEY, type: 'select', values: { white: t('val_title_color_white'), gray: t('val_title_color_gray'), cyan: t('val_title_color_cyan'), gold: t('val_title_color_gold') }, default: 'white' },
          field: { name: t('set_title_color_name'), description: t('set_title_color_desc') },
          onChange: function () { syncTitleStyle(); }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: BADGE_KEY,
            type: 'select',
            values: { on: t('val_on'), off: t('val_off') },
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
            values: { on: t('val_on'), off: t('val_off') },
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
            name: CARD_ANIM_KEY,
            type: 'select',
            values: {
              off: t('val_card_anim_off'),
              veoveo: t('val_card_anim_veoveo'),
              appletv: t('val_card_anim_appletv')
            },
            default: 'veoveo'
          },
          field: {
            name: t('set_card_anim_name'),
            description: t('set_card_anim_desc')
          },
          onChange: function () {
            syncGlareClass();
          }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: CARD_ANIM_ORBIT_KEY,
            type: 'trigger',
            default: 'false'
          },
          field: {
            name: t('set_card_anim_orbit_name'),
            description: t('set_card_anim_orbit_desc')
          },
          onChange: function () { }
        });

        // ═══════════════════════════════════════════════════════════
        // 5. Логотипы и постеры
        // ═══════════════════════════════════════════════════════════
        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: { type: 'title' },
          field: { name: t('set_section_logos') }
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
              uk: langText('filter_lang_uk', t('val_uk')),
              be: langText('filter_lang_be', t('val_be'))
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

        try {
          if (window.Lampa && Lampa.Storage) {
            var legacyLogoTitle = Lampa.Storage.get(LOGO_TITLE_KEY, 'false');
            if (legacyLogoTitle === 'below' || legacyLogoTitle === 'above' || legacyLogoTitle === 'on') {
              Lampa.Storage.set(LOGO_TITLE_KEY, 'true');
            } else if (legacyLogoTitle === 'off') {
              Lampa.Storage.set(LOGO_TITLE_KEY, 'false');
            }
          }
        } catch (e) { }

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: LOGO_TITLE_KEY,
            type: 'trigger',
            default: 'false'
          },
          field: {
            name: t('set_logo_title_name'),
            description: t('set_logo_title_desc')
          },
          onChange: function () {
            logoCache = {};
            clearAll();
            resetCardSwitches();
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

        // ═══════════════════════════════════════════════════════════
        // 6. Текст и шрифты
        // ═══════════════════════════════════════════════════════════
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

        // ═══════════════════════════════════════════════════════════
        // 7. Часы и панель
        // ═══════════════════════════════════════════════════════════
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
            values: { on: t('val_on'), off: t('val_off') },
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
            name: AGNATIVE_KEYS.CLOCK_COLOR_KEY,
            type: 'select',
            values: { white: 'Белые', cyan: 'Бирюзовые', violet: 'Фиолетовые', amber: 'Янтарные', lime: 'Лайм' },
            default: 'cyan'
          },
          field: { name: 'Цвет часов', description: 'Цвет времени в верхней панели' },
          onChange: function () { syncClockColor(); }
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_COMPONENT,
          param: {
            name: CONTROL_PANEL_KEY,
            type: 'select',
            values: { on: t('val_on'), off: t('val_off') },
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
          param: { name: 'agnative_open_settings_hide', type: 'button' },
          field: {
            name: t('set_settings_hide_name'),
            description: t('set_settings_hide_desc')
          },
          onChange: function () {
            openSettingsHideSection();
          }
        });

        // ═══════════════════════════════════════════════════════════
        // 8. Данные
        // ═══════════════════════════════════════════════════════════
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
          component: TOPNAV_SETTINGS_COMPONENT,
          param: { type: 'title' },
          field: { name: t('set_topnav_title') }
        });

        var posMax = 15;
        var posValues = { off: t('val_hide') };
        for (var pi = 1; pi <= posMax; pi++) posValues['p' + pi] = t('set_topnav_position') + ' ' + pi;

        getAvailableTopnavItems().forEach(function (item) {
          var stored = getStoredTopnavActions();
          var currentIdx = stored.indexOf(item.action);
          var currentDefault = currentIdx === -1 ? 'off' : ('p' + (currentIdx + 1));

          Lampa.SettingsApi.addParam({
            component: TOPNAV_SETTINGS_COMPONENT,
            param: {
              name: 'agnative_topnav_item_' + item.action,
              type: 'select',
              values: posValues,
              default: currentDefault
            },
            field: {
              name: item.label,
              description: t('set_topnav_item_desc') + item.action
            },
            onChange: function (value) {
              if (value === 'off') {
                setTopnavActionState(item.action, false);
                return;
              }
              var targetPos = parseInt(value.replace('p', ''), 10) - 1;
              if (isNaN(targetPos) || targetPos < 0) return;
              var current = getStoredTopnavActions().filter(function (a, i, arr) { return a && arr.indexOf(a) === i; });
              var oldIdx = current.indexOf(item.action);
              if (oldIdx !== -1) current.splice(oldIdx, 1);
              if (targetPos > current.length) targetPos = current.length;
              current.splice(targetPos, 0, item.action);
              setStoredTopnavActions(current);
            }
          });
        });

        Lampa.SettingsApi.addParam({
          component: SETTINGS_HIDE_COMPONENT,
          param: { type: 'title' },
          field: { name: t('set_settings_hide_title') }
        });

        var hiddenList = getHiddenSettingsSections();
        getSettingsSectionDefs().forEach(function (sec) {
          var isHidden = hiddenList.indexOf(sec.id) !== -1;
          Lampa.SettingsApi.addParam({
            component: SETTINGS_HIDE_COMPONENT,
            param: {
              name: 'agnative_settings_hide_' + sec.id,
              type: 'trigger',
              default: isHidden ? 'true' : 'false'
            },
            field: {
              name: sec.label,
              description: t('set_settings_hide_item_desc')
            },
            onChange: function (value) {
              var hide = value === true || value === 'true' || value === 'on';
              toggleSettingsSectionHidden(sec.id, hide);
              applyHiddenSettingsSectionsCSS();
            }
          });
        });
      } catch (e) { }
    }

    function applyHiddenSettingsSectionsCSS() {
      var styleId = 'appletv-agnative-settings-hide-style';
      var style = document.getElementById(styleId);
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        (document.head || document.body || document.documentElement).appendChild(style);
      }
      var hidden = getHiddenSettingsSections();
      if (!hidden.length) { style.textContent = ''; return; }
      var rules = hidden.map(function (id) {
        var safe = String(id).replace(/[^a-zA-Z0-9_-]/g, '');
        return 'body.' + BODY_CLASS + ' .settings .settings-folder[data-component="' + safe + '"], ' +
               'body.' + BODY_CLASS + ' .settings .settings__item[data-component="' + safe + '"] { display:none !important; }';
      });
      style.textContent = rules.join('\n');
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
            setTimeout(triggerExtraRowRender, 900);
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

          if (e.name === GLARE_KEY || e.name === CARD_ANIM_KEY) {
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

    // On mobile Lampa only renders rows visible in the initial viewport (~4).
    // Simulate a scroll-down so the IntersectionObserver triggers 2 extra rows,
    // then snap back to top — invisible to the user but forces 6 rows to render.
    function triggerExtraRowRender() {
      if (!isMobile()) return;
      var scroll = document.querySelector('.activity--active .scroll.scroll--mask.scroll--over') ||
                   document.querySelector('.activity--active .scroll');
      if (!scroll || scroll.scrollTop !== 0) return;
      var rowHeight = Math.round(window.innerHeight * 0.38); // ~height of 2 rows
      scroll.scrollTop = rowHeight * 2;
      setTimeout(function () {
        var s = document.querySelector('.activity--active .scroll.scroll--mask.scroll--over') ||
                document.querySelector('.activity--active .scroll');
        if (s && s.scrollTop > 0) s.scrollTop = 0;
      }, 120);
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
        'body.' + BODY_CLASS + ' .activity__slides { padding-top:3.5em !important; }',
        'body.' + BODY_CLASS + ' .full-start__body, body.' + BODY_CLASS + ' .full-start-new__body { transform: translateY(3em) !important; }',
        'body.' + BODY_CLASS + ' .full-start-new ~ .items-line, body.' + BODY_CLASS + ' .full-start ~ .items-line, body.' + BODY_CLASS + ' .full-start-new + *, body.' + BODY_CLASS + ' .full-start + * { transform: translateY(3em) !important; }',
        'body.' + BODY_CLASS + ' .activity.layer--width.activity--active,',
        'body.' + BODY_CLASS + ' .activity.layer--width.activity--active.application,',
        'body.' + BODY_CLASS + ' .activity.layer--width.activity--active.applecation {',
        '  background: transparent !important;',
        '  background-color: transparent !important;',
        '  background-image: none !important;',
        '  box-shadow: none !important;',
        '}',
        '  padding: 0 !important;',
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
        'body.' + BODY_CLASS + ' .wrap__content,',
        'body.' + BODY_CLASS + ' .wrap__content .layer--height,',
        'body.' + BODY_CLASS + ' .wrap__content .layer--width {',
        '  padding-top: .3em !important;',
        '}',
        '  padding-top: 0 !important;',
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
        'body.' + BODY_CLASS + ' .settings-folder {',
        '  background: rgba(255,255,255,.05) !important;',
        '  border-radius: 1.05em !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.05) !important;',
        '  border: 1px solid rgba(255,255,255,.06) !important;',
        '  padding: .78em 1.1em !important;',
        '  margin: 0 0 .32em !important;',
        '  transition: background .18s ease, box-shadow .18s ease !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param:last-child,',
        'body.' + BODY_CLASS + ' .settings-folder:last-child {',
        '  margin-bottom: 0 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings__body [data-parent] {',
        '  margin-bottom: .32em !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings__body [data-parent]:last-child {',
        '  margin-bottom: 0 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param-title {',
        '  padding: .9em 1.1em .3em !important;',
        '  margin: 0 !important;',
        '  background: transparent !important;',
        '  border: 0 !important;',
        '  box-shadow: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param-title > span {',
        '  font-size: .82em !important;',
        '  font-weight: 700 !important;',
        '  letter-spacing: .06em !important;',
        '  text-transform: uppercase !important;',
        '  color: rgba(255,255,255,.38) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param-text {',
        '  padding: .5em 1.1em !important;',
        '  font-size: .92em !important;',
        '  color: rgba(255,255,255,.55) !important;',
        '  line-height: 1.5 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param__name {',
        '  font-size: 1em !important;',
        '  font-weight: 600 !important;',
        '  color: rgba(255,255,255,.95) !important;',
        '  margin-bottom: .2em !important;',
        '  line-height: 1.3 !important;',
        '  position: relative !important; z-index: 1 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param__value {',
        '  font-size: .88em !important;',
        '  color: rgba(255,255,255,.52) !important;',
        '  line-height: 1.25 !important;',
        '  position: relative !important; z-index: 1 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param--button .settings-param__name {',
        '  margin-bottom: 0 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param__descr {',
        '  font-size: .82em !important;',
        '  color: rgba(255,255,255,.38) !important;',
        '  opacity: 1 !important;',
        '  margin-top: .55em !important;',
        '  line-height: 1.45 !important;',
        '  position: relative !important; z-index: 1 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param__label {',
        '  font-size: .75em !important;',
        '  background: rgba(255,255,255,.92) !important;',
        '  color: #1a1c20 !important;',
        '  border-radius: .4em !important;',
        '  padding: .15em .55em !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param__status {',
        '  left: 95% !important;',
        '  top: 15% !important;',
        '  transform: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-folder {',
        '  display: flex !important;',
        '  align-items: center !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-folder__icon {',
        '  flex-shrink: 0 !important;',
        '  margin-right: .85em !important;',
        '  width: 1.7em !important;',
        '  height: 1.7em !important;',
        '  display: flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '  color: rgba(255,255,255,.75) !important;',
        '  position: relative !important; z-index: 1 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-folder__icon > * {',
        '  width: 1.5em !important;',
        '  height: 1.5em !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-folder__name {',
        '  font-size: 1em !important;',
        '  font-weight: 600 !important;',
        '  color: rgba(255,255,255,.95) !important;',
        '  line-height: 1.3 !important;',
        '  position: relative !important; z-index: 1 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-folder__descr {',
        '  font-size: .82em !important;',
        '  color: rgba(255,255,255,.42) !important;',
        '  margin-top: .18em !important;',
        '  line-height: 1.35 !important;',
        '  position: relative !important; z-index: 1 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param.focus,',
        'body.' + BODY_CLASS + ' .settings-folder.focus,',
        'body.' + BODY_CLASS + ' .settings-param.hover,',
        'body.' + BODY_CLASS + ' .settings-folder.hover {',
        '  background: rgba(255,255,255,.12) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 0 0 1px rgba(255,255,255,.10) !important;',
        '  border-color: rgba(255,255,255,.14) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-param.focus .settings-param__value {',
        '  color: rgba(255,255,255,.72) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-folder.focus::before,',
        'body.' + BODY_CLASS + ' .settings-folder.focus::after,',
        'body.' + BODY_CLASS + ' .settings-param.focus::before,',
        'body.' + BODY_CLASS + ' .settings-param.focus::after {',
        '  display: none !important;',
        '  content: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item {',
        '  border-radius: 1em !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item__title,',
        'body.' + BODY_CLASS + ' .selectbox-item__subtitle {',
        '  position: relative !important;',
        '  z-index: 1 !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item .shots-view-button__count {',
        '  position: static !important;',
        '  top: auto !important;',
        '  left: auto !important;',
        '  right: auto !important;',
        '  bottom: auto !important;',
        '  display: inline-block !important;',
        '  vertical-align: baseline !important;',
        '  margin-left: .5em !important;',
        '  background: rgba(255,255,255,.18) !important;',
        '  color: #fff !important;',
        '  font-size: .78em !important;',
        '  font-weight: 700 !important;',
        '  line-height: 1.2 !important;',
        '  padding: .1em .55em !important;',
        '  border-radius: 1em !important;',
        '  min-width: 1.4em !important;',
        '  text-align: center !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item.focus .shots-view-button__count,',
        'body.' + BODY_CLASS + ' .selectbox-item.hover .shots-view-button__count {',
        '  background: rgba(255,255,255,.28) !important;',
        '  color: #fff !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item.focus,',
        'body.' + BODY_CLASS + ' .selectbox-item.hover {',
        '  background: rgba(255,255,255,.14) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 0 0 1px rgba(255,255,255,.09) !important;',
        '  border-color: rgba(255,255,255,.12) !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item.focus::before,',
        'body.' + BODY_CLASS + ' .selectbox-item.focus::after {',
        '  display: none !important;',
        '  content: none !important;',
        '}',

        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings-param[data-name="' + CARD_ANIM_KEY + '"] { display: none !important; }',
        'body.' + BODY_CLASS + ':not([' + CARD_ANIM_ATTR + '="appletv"]) .settings-param[data-name="' + CARD_ANIM_ORBIT_KEY + '"] { display: none !important; }',
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
        'body.' + BODY_CLASS + ' .agnative-topnav-shell { position:absolute; left:50%; top:.46em; transform:translateX(-50%); z-index:20; width:max-content; max-width:calc(100vw - 24em); height:2.6em; display:inline-flex; align-items:center; box-sizing:border-box; font-size:1em; }',
        'body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="xs"] .agnative-topnav-shell, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="xs"] .agnative-topnav-rightdock, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="xs"] .agnative-topnav-clock, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="xs"] .head__menu-icon { font-size:.78em !important; }',
        'body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="sm"] .agnative-topnav-shell, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="sm"] .agnative-topnav-rightdock, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="sm"] .agnative-topnav-clock, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="sm"] .head__menu-icon { font-size:.9em !important; }',
        'body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="md"] .agnative-topnav-shell, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="md"] .agnative-topnav-rightdock, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="md"] .agnative-topnav-clock, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="md"] .head__menu-icon { font-size:1em !important; }',
        'body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="lg"] .agnative-topnav-shell, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="lg"] .agnative-topnav-rightdock, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="lg"] .agnative-topnav-clock, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="lg"] .head__menu-icon { font-size:1.15em !important; }',
        'body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="xl"] .agnative-topnav-shell, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="xl"] .agnative-topnav-rightdock, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="xl"] .agnative-topnav-clock, body.' + BODY_CLASS + '[' + TOPNAV_SIZE_ATTR + '="xl"] .head__menu-icon { font-size:1.3em !important; }',
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
        'body.' + BODY_CLASS + ' .items-line--type-default { min-height:auto !important; padding-top:0 !important; padding-bottom:.12em !important; margin-bottom:.32em !important; transition:transform .35s cubic-bezier(.22,.61,.36,1) !important; }',
        'body.' + BODY_CLASS + ' .items-line.layer--visible.layer--render.items-line--type-default { padding-top:0 !important; }',
        'body.' + BODY_CLASS + ' .items-line--type-default .items-line__head { margin-bottom:1.1em !important; min-height:auto !important; padding-top:0 !important; padding-bottom:.45em !important; padding-left:2.5em !important; padding-right:2.5em !important; font-size:1em !important; }',
        'body.' + BODY_CLASS + ' .items-line__more.selector { font-size:.7em !important; padding:.3em .6em !important; opacity:.85 !important; }',
        'body.' + BODY_CLASS + ' .items-line--type-default .items-cards { padding-top:0 !important; padding-left:2.5em !important; padding-right:2.5em !important; font-size:.86em !important; }',
        'body.' + BODY_CLASS + ' .items-cards { padding-left:1.05em !important; padding-right:1.05em !important; gap:.62em !important; }',
        'body.' + BODY_CLASS + ' .items-line__body { padding-left:0 !important; }',
        'body.' + BODY_CLASS + ' .items-line__title { font-size:1em !important; line-height:1.2 !important; font-weight:700 !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line { display:flex !important; gap:1.5em !important; padding-left:1.15em !important; padding-right:1.15em !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small) { padding: .6em .55em !important; display:flex !important; flex-direction:column !important; align-items:center !important; text-align:center !important; width:9em !important; border-radius:1.2em !important; background:transparent !important; color:inherit !important; transition: transform .28s cubic-bezier(.34,1.4,.64,1) !important; will-change: transform !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small) .full-person__photo { width:6.8em !important; height:6.8em !important; border-radius:50% !important; margin:0 0 .65em !important; background-color:rgba(255,255,255,.06) !important; background-size:cover !important; background-position:50% 50% !important; overflow:hidden !important; flex-shrink:0 !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.18), inset 0 0 0 1px rgba(255,255,255,.06), 0 6px 14px rgba(0,0,0,.18), 0 12px 28px rgba(0,0,0,.22) !important; transition: box-shadow .28s ease, filter .28s ease !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small) .full-person__photo > img { width:100% !important; height:100% !important; border-radius:50% !important; object-fit:cover !important; object-position:center 20% !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small) .full-person__body { display:flex !important; flex-direction:column !important; align-items:center !important; padding:0 !important; margin:0 !important; max-width:100% !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small) .full-person__name { font-size:1em !important; font-weight:600 !important; color:rgba(255,255,255,.95) !important; margin:0 0 .2em !important; line-height:1.2 !important; max-width:100% !important; overflow:hidden !important; text-overflow:ellipsis !important; display:-webkit-box !important; -webkit-line-clamp:2 !important; -webkit-box-orient:vertical !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small) .full-person__role { font-size:.82em !important; font-weight:400 !important; color:rgba(255,255,255,.58) !important; margin:0 !important; line-height:1.25 !important; max-width:100% !important; overflow:hidden !important; text-overflow:ellipsis !important; display:-webkit-box !important; -webkit-line-clamp:2 !important; -webkit-box-orient:vertical !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small).focus, body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small).hover { background:transparent !important; color:inherit !important; transform: scale(1.06) translateY(-4px) !important; z-index:10 !important; position:relative !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small).focus .full-person__photo, body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small).hover .full-person__photo { box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 2px rgba(86,141,255,.92), 0 18px 42px rgba(0,0,0,.28), 0 8px 20px rgba(0,0,0,.16) !important; filter: saturate(1.06) brightness(1.02) !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small).focus .full-person__name, body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small).hover .full-person__name { color:#fff !important; }',
        'body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small).focus .full-person__role, body.' + BODY_CLASS + ' .scroll__body.mapping--line .full-person:not(.full-person--small).hover .full-person__role { color:rgba(255,255,255,.78) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .scroll__body.mapping--line .full-person:not(.full-person--small).focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .scroll__body.mapping--line .full-person:not(.full-person--small).hover { transform: scale(1.04) translateY(-2px) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .scroll__body.mapping--line .full-person:not(.full-person--small) { transition:none !important; will-change:auto !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .scroll__body.mapping--line .full-person:not(.full-person--small).focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .scroll__body.mapping--line .full-person:not(.full-person--small).hover { transform:none !important; }',
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
        // Compact service/genre cards (e.g. from SURS plugin) — half size of regular cards
        'body.' + BODY_CLASS + ' .card.card--button-compact .nfx-card-overlay, body.' + BODY_CLASS + ' .card.card--button-compact .nfx-card-logo, body.' + BODY_CLASS + ' .card.card--button-compact .nfx-card-rating, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .nfx-card-overlay, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .nfx-card-logo, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .nfx-card-rating, body.' + BODY_CLASS + ' .card.card--genre-compact .nfx-card-overlay, body.' + BODY_CLASS + ' .card.card--genre-compact .nfx-card-logo, body.' + BODY_CLASS + ' .card.card--genre-compact .nfx-card-rating { display:none !important; }',
        'body.' + BODY_CLASS + ' .card.card--button-compact .card__view, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .card__view, body.' + BODY_CLASS + ' .card.card--genre-compact .card__view { display:flex !important; align-items:center !important; justify-content:center !important; padding-bottom:56% !important; background-color:rgba(200,200,200,.16) !important; }',
        'body.' + BODY_CLASS + ' .card.card--button-compact .card__button-label, body.' + BODY_CLASS + ' .card.card--genre-compact .card__genre-label { display:block !important; position:absolute !important; bottom:.42em !important; left:0 !important; right:0 !important; text-align:center !important; color:#fff !important; padding:.34em !important; font-size:calc(.78em * var(--agnative-scale, 1)) !important; font-weight:600 !important; line-height:1.1 !important; z-index:2 !important; text-shadow:0 1px 2px rgba(0,0,0,.7) !important; pointer-events:none !important; }',
        'body.' + BODY_CLASS + ' .card.card--button-compact .card__svg-icon, body.' + BODY_CLASS + ' .card.card--genre-compact .card__svg-icon { position:absolute !important; top:42% !important; left:50% !important; transform:translate(-50%, -50%) !important; width:42% !important; height:42% !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:1 !important; }',
        'body.' + BODY_CLASS + ' .card.streaming-card--button-compact .streaming-card__svg-icon { position:absolute !important; top:50% !important; left:50% !important; transform:translate(-50%, -50%) !important; width:60% !important; height:60% !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:1 !important; }',
        'body.' + BODY_CLASS + ' .card.card--button-compact .card__svg-icon svg, body.' + BODY_CLASS + ' .card.card--genre-compact .card__svg-icon svg, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .streaming-card__svg-icon svg, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .streaming-card__svg-icon img { width:100% !important; height:100% !important; object-fit:contain !important; }',
        'body.' + BODY_CLASS + ' .card.card--button-compact .card__svg-icon, body.' + BODY_CLASS + ' .card.card--genre-compact .card__svg-icon, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .streaming-card__svg-icon { transform: translate(-50%, -50%) !important; transition: transform .14s ease-out !important; }',
        'body.' + BODY_CLASS + ' .card.card--button-compact .card__button-label, body.' + BODY_CLASS + ' .card.card--genre-compact .card__genre-label { transform: translate(0, 0) !important; transition: transform .14s ease-out !important; }',
        'body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.card--button-compact.focus .card__svg-icon, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.card--button-compact.hover .card__svg-icon, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.card--genre-compact.focus .card__svg-icon, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.card--genre-compact.hover .card__svg-icon, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.streaming-card--button-compact.focus .streaming-card__svg-icon, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.streaming-card--button-compact.hover .streaming-card__svg-icon { transform: translate(calc(-50% + var(--atv-lx, 0em)), calc(-50% + var(--atv-ly, 0em))) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.card--button-compact.focus .card__button-label, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.card--button-compact.hover .card__button-label, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.card--genre-compact.focus .card__genre-label, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.card--genre-compact.hover .card__genre-label { transform: translate(var(--atv-lx, 0em), var(--atv-ly, 0em)) !important; }',
        'body.' + BODY_CLASS + ' .items-line .card.card--button-compact, body.' + BODY_CLASS + ' .items-line .card.streaming-card--button-compact, body.' + BODY_CLASS + ' .items-line .card.card--genre-compact { width:8.8em !important; flex:0 0 auto !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"] .items-line .card.card--button-compact, body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"] .items-line .card.streaming-card--button-compact, body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"] .items-line .card.card--genre-compact { width:7em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"] .items-line .card.card--button-compact, body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"] .items-line .card.streaming-card--button-compact, body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"] .items-line .card.card--genre-compact { width:7.9em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"] .items-line .card.card--button-compact, body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"] .items-line .card.streaming-card--button-compact, body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"] .items-line .card.card--genre-compact { width:8.8em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"] .items-line .card.card--button-compact, body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"] .items-line .card.streaming-card--button-compact, body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"] .items-line .card.card--genre-compact { width:9.7em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"] .items-line .card.card--button-compact, body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"] .items-line .card.streaming-card--button-compact, body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"] .items-line .card.card--genre-compact { width:10.6em !important; }',
        // Scale text inside (logo labels, etc) accordingly
        'body.' + BODY_CLASS + ' .card.card--button-compact .card__view, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .card__view, body.' + BODY_CLASS + ' .card.card--genre-compact .card__view { font-size:.85em !important; }',
        'body.' + BODY_CLASS + ' .card .card-watched { position:absolute !important; left:.55em !important; right:.55em !important; bottom:.55em !important; top:auto !important; z-index:3 !important; display:block !important; opacity:0 !important; transform:translateY(.45em) scale(.94) !important; transition: opacity .18s ease 0s, transform .18s ease 0s !important; pointer-events:none !important; background:rgba(15,17,22,.72) !important; border:1px solid rgba(255,255,255,.09) !important; border-radius:.85em !important; box-shadow:0 10px 22px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.07) !important; backdrop-filter:blur(16px) saturate(140%) !important; -webkit-backdrop-filter:blur(16px) saturate(140%) !important; overflow:hidden !important; max-height:calc(100% - 1.2em) !important; }',
        'body.' + BODY_CLASS + ' .card.focus .card-watched, body.' + BODY_CLASS + ' .card.hover .card-watched { opacity:1 !important; transform:translateY(0) scale(1) !important; transition: opacity .32s ease 1s, transform .14s ease-out !important; }',
        'body.' + BODY_CLASS + ' .card .card-watched__inner { padding:.5em .75em .6em !important; }',
        'body.' + BODY_CLASS + ' .card .card-watched__body { font-size:.7em !important; line-height:1.25 !important; }',
        'body.' + BODY_CLASS + ' .card .card-watched__item { margin-top:.4em !important; }',
        'body.' + BODY_CLASS + ' .card .card-watched__item:first-child { margin-top:0 !important; }',
        'body.' + BODY_CLASS + ' .card .card__view { padding-bottom:56.25% !important; margin-bottom:0 !important; border-radius:1.55em !important; overflow:hidden !important; clip-path: inset(0 round 1.55em); -webkit-clip-path: inset(0 round 1.55em); box-shadow: inset 0 1px 0 rgba(255,255,255,.22), inset 0 -1.5px 1px rgba(0,0,0,.18), inset 0 0 0 1px rgba(255,255,255,.06), 0 6px 14px rgba(0,0,0,.14), 0 12px 28px rgba(0,0,0,.16) !important; transition: transform .28s cubic-bezier(.22,.61,.36,1), box-shadow .28s ease, filter .28s ease, opacity .18s ease !important; border: 0.1em solid transparent !important; box-sizing: border-box !important; }',
        'body.' + BODY_CLASS + ' .card[data-nfx-switched="1"] .card__view { opacity:1 !important; }',
        'body.' + BODY_CLASS + ' .card__view > *, body.' + BODY_CLASS + ' .card__view img, body.' + BODY_CLASS + ' .card__view .card__img, body.' + BODY_CLASS + ' .card__view .card__image, body.' + BODY_CLASS + ' .card__img, body.' + BODY_CLASS + ' .card__image, body.' + BODY_CLASS + ' .card__filter, body.' + BODY_CLASS + ' .card__filter::before, body.' + BODY_CLASS + ' .card__filter::after { border-radius:1.55em !important; }',
        'body.' + BODY_CLASS + ' .card__img, body.' + BODY_CLASS + ' .card__image { object-fit:cover !important; object-position:center 20% !important; border:none !important; box-shadow:none !important; background-clip:padding-box !important; }',
        'body.' + BODY_CLASS + ' .card.focus .card__view { transform: translateY(-.08em) scale(1.06) !important; filter: saturate(1.06) brightness(1.02) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 2px rgba(86,141,255,.92), 0 18px 42px rgba(0,0,0,.26), 0 8px 20px rgba(0,0,0,.14) !important; }',
        'body.' + BODY_CLASS + ' .card.hover .card__view { transform: translateY(-.04em) scale(1.03) !important; filter: saturate(1.02) brightness(1.01) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 10px 24px rgba(0,0,0,.16) !important; }',
        'body.' + BODY_CLASS + ' .card.focus::after, body.' + BODY_CLASS + ' .card.hover::after, body.' + BODY_CLASS + ' .card__view::before, body.' + BODY_CLASS + ' .card__view::after { display:none !important; content:none !important; }',
        'body.' + BODY_CLASS + ' .card { transition: transform .28s cubic-bezier(.34,1.4,.64,1) !important; will-change: transform !important; transform-style: preserve-3d !important; }',
        'body.' + BODY_CLASS + ' .card.focus, body.' + BODY_CLASS + ' .card.hover, body.' + BODY_CLASS + ' .card.traverse { transform: scale(1.07) translateY(-6px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) !important; z-index: 10 !important; position: relative !important; }',
        'body.' + BODY_CLASS + ' .card.focus ~ .card, body.' + BODY_CLASS + ' .card.hover ~ .card { transform: translateX(4px) !important; transition: transform .22s ease !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card.hover, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .card.traverse { transform: scale(1.05) translateY(-3px) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card { transition: none !important; will-change: auto !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card.hover, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card.traverse { transform: none !important; }',
        'body.' + BODY_CLASS + ' .card-episode { width:17.6em !important; flex:0 0 auto !important; margin:0 !important; padding:0 !important; background:transparent !important; border:0 !important; outline:0 !important; box-shadow:none !important; transform:none !important; transform-origin:center center !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xs"] .card-episode { width:14em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="sm"] .card-episode { width:15.8em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="md"] .card-episode { width:17.6em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="lg"] .card-episode { width:19.4em !important; }',
        'body.' + BODY_CLASS + '[' + CARD_SIZE_ATTR + '="xl"] .card-episode { width:21.2em !important; }',
        'body.' + BODY_CLASS + ' .card-episode.focus, body.' + BODY_CLASS + ' .card-episode.hover, body.' + BODY_CLASS + ' .card-episode.focus .card-episode__body, body.' + BODY_CLASS + ' .card-episode.hover .card-episode__body { border:0 !important; outline:0 !important; box-shadow:none !important; background:transparent !important; }',
        'body.' + BODY_CLASS + ' .card-episode { transition: transform .28s cubic-bezier(.34,1.4,.64,1), box-shadow .28s ease !important; will-change: transform !important; }',
        'body.' + BODY_CLASS + ' .card-episode.focus, body.' + BODY_CLASS + ' .card-episode.hover, body.' + BODY_CLASS + ' .card-episode.traverse { transform: scale(1.05) translateY(-4px) !important; box-shadow: 0 16px 40px rgba(0,0,0,.5), 0 6px 16px rgba(0,0,0,.3) !important; z-index: 10 !important; position: relative !important; }',
        'body.' + BODY_CLASS + ' .card-episode__body { background:transparent !important; border:0 !important; outline:0 !important; box-shadow:none !important; padding:0 !important; margin:0 !important; display:block !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode { position:relative !important; display:block !important; background:transparent !important; border:0 !important; box-shadow:none !important; padding:0 !important; margin:0 !important; overflow:visible !important; transform-origin:center center !important; transition: transform .28s cubic-bezier(.22,.61,.36,1) !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__img { position:relative !important; width:100% !important; height:0 !important; padding-bottom:56.25% !important; margin:0 !important; border-radius:1.55em !important; overflow:hidden !important; clip-path: inset(0 round 1.55em); -webkit-clip-path: inset(0 round 1.55em); box-shadow: inset 0 1px 0 rgba(255,255,255,.22), inset 0 -1.5px 1px rgba(0,0,0,.18), inset 0 0 0 1px rgba(255,255,255,.06), 0 6px 14px rgba(0,0,0,.14), 0 12px 28px rgba(0,0,0,.16) !important; transition: box-shadow .28s ease, filter .28s ease !important; border: 0.1em solid transparent !important; box-sizing: border-box !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__img > *, body.' + BODY_CLASS + ' .card-episode .full-episode__img img { border-radius:1.55em !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__img img { position:absolute !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; object-fit:cover !important; object-position:center center !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__img::before { content:none !important; display:none !important; }',
        'body.' + BODY_CLASS + ' .card-episode .full-episode__body { position:absolute !important; left:1.02em !important; right:1.02em !important; bottom:.9em !important; top:auto !important; z-index:3 !important; padding:0 !important; margin:0 !important; background:transparent !important; border:0 !important; display:flex !important; flex-direction:column !important; align-items:flex-start !important; text-shadow:0 1px 2px rgba(0,0,0,.95), 0 2px 8px rgba(0,0,0,.85), 0 4px 16px rgba(0,0,0,.7) !important; pointer-events:none !important; }',
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
        'body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card .card__view > *, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card-episode .full-episode > *:not(.full-episode__img) { transition: transform .14s ease-out; }',
        'body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.focus .card__view, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.hover .card__view, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card-episode.focus .full-episode, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card-episode.hover .full-episode, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .full-start-new__poster.focus, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .full-start-new__poster.hover { transform: perspective(1200px) rotateX(var(--atv-rx, 0deg)) rotateY(var(--atv-ry, 0deg)) scale(1.05) translateY(-.06em) !important; transition: transform .12s ease-out, box-shadow .24s ease, filter .24s ease !important; will-change: transform; }',
        'body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.focus .card__view, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card-episode.focus .full-episode__img, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .full-start-new__poster.focus { box-shadow: inset 0 1px 0 rgba(255,255,255,.24), 0 0 0 2px rgba(86,141,255,.92), 0 28px 60px rgba(0,0,0,.55), 0 14px 32px rgba(0,0,0,.38), 0 6px 14px rgba(0,0,0,.22) !important; filter: saturate(1.08) brightness(1.03) drop-shadow(0 18px 28px rgba(0,0,0,.32)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.hover .card__view, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card-episode.hover .full-episode__img, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .full-start-new__poster.hover { box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 20px 44px rgba(0,0,0,.42), 0 10px 22px rgba(0,0,0,.28) !important; filter: saturate(1.04) brightness(1.02) drop-shadow(0 12px 22px rgba(0,0,0,.26)) !important; }',
        'body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"][' + PERF_ATTR + '="low"] .card.focus .card__view, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"][' + PERF_ATTR + '="low"] .card.hover .card__view, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"][' + PERF_ATTR + '="low"] .card-episode.focus .full-episode__img, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"][' + PERF_ATTR + '="low"] .card-episode.hover .full-episode__img { filter: none !important; }',
        'body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.focus .card__view > *:not(.card__img):not(.card__image):not(.card__svg-icon):not(.streaming-card__svg-icon):not(.card__button-label):not(.card__genre-label), body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card.hover .card__view > *:not(.card__img):not(.card__image):not(.card__svg-icon):not(.streaming-card__svg-icon):not(.card__button-label):not(.card__genre-label), body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card-episode.focus .full-episode__body, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card-episode.hover .full-episode__body, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card-episode.focus .full-episode__num, body.' + BODY_CLASS + '[' + CARD_ANIM_ATTR + '="appletv"] .card-episode.hover .full-episode__num { transform: translate(var(--atv-lx, 0em), var(--atv-ly, 0em)) !important; will-change: transform; }',
        'body.' + BODY_CLASS + ' .card__vote, body.' + BODY_CLASS + ' .card__quality, body.' + BODY_CLASS + ' .card__type, body.' + BODY_CLASS + ' .card__promo-text, body.' + BODY_CLASS + ' .card__promo-title, body.' + BODY_CLASS + ' .nfx-card-overlay__match { display:none !important; }',
        'body.' + BODY_CLASS + ' .card__title, body.' + BODY_CLASS + ' .card__age { display:none !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_SIZE_ATTR + '="sm"] .nfx-card-overlay__title { font-size:.82em !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_SIZE_ATTR + '="md"] .nfx-card-overlay__title { font-size:1em !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_SIZE_ATTR + '="lg"] .nfx-card-overlay__title { font-size:1.18em !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_SIZE_ATTR + '="xl"] .nfx-card-overlay__title { font-size:1.38em !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_COLOR_ATTR + '="white"] .nfx-card-overlay__title { color:rgba(255,255,255,.96) !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_COLOR_ATTR + '="gray"] .nfx-card-overlay__title { color:rgba(205,210,220,.92) !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_COLOR_ATTR + '="cyan"] .nfx-card-overlay__title { color:#62e6e6 !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_COLOR_ATTR + '="gold"] .nfx-card-overlay__title { color:#f2c66d !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_MODE_ATTR + '="below"] .nfx-card-overlay { display:none !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_MODE_ATTR + '="below"] .card__title { display:block !important; position:static !important; width:100% !important; height:auto !important; margin:.48em 0 0 !important; padding:0 .12em !important; color:rgba(255,255,255,.94) !important; font-size:calc(.84em * var(--agnative-scale, 1)) !important; line-height:1.2 !important; font-weight:700 !important; text-align:left !important; white-space:nowrap !important; overflow:hidden !important; text-overflow:ellipsis !important; background:transparent !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_MODE_ATTR + '="below"] .card__view { overflow:visible !important; }',
        'body.' + BODY_CLASS + '[' + TITLE_MODE_ATTR + '="off"] .nfx-card-overlay__title, body.' + BODY_CLASS + '[' + TITLE_MODE_ATTR + '="off"] .nfx-card-overlay__local-title, body.' + BODY_CLASS + '[' + TITLE_MODE_ATTR + '="off"] .card__title { display:none !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay { position:absolute; left:0; right:0; bottom:0; z-index:2; display:flex !important; flex-direction:column; justify-content:center; align-items:flex-start; opacity:1 !important; visibility:visible !important; border-radius:0 0 1.55em 1.55em !important; background:transparent !important; padding:2.15em 1.02em .92em !important; transform: translateZ(14px); transition: transform .28s cubic-bezier(.22,.61,.36,1), opacity .24s ease; pointer-events:none; }',
        'body.' + BODY_CLASS + ' .card__view::before { content:"" !important; display:block !important; position:absolute; left:0; right:0; bottom:0; height:8.5em; z-index:1 !important; pointer-events:none; border-radius:0 0 1.55em 1.55em; background:linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.78) 18%, rgba(0,0,0,.5) 42%, rgba(0,0,0,.22) 64%, rgba(0,0,0,.06) 82%, transparent 100%) !important; }',
        'body.' + BODY_CLASS + ' .card.card--button-compact .card__view::before, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .card__view::before, body.' + BODY_CLASS + ' .card.card--genre-compact .card__view::before { height:2.4em !important; }',
        'body.' + BODY_CLASS + ' .card.card--button-compact .card__svg-icon, body.' + BODY_CLASS + ' .card.card--genre-compact .card__svg-icon, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .streaming-card__svg-icon { border-radius:.35em !important; overflow:visible !important; background:transparent !important; clip-path:none !important; -webkit-clip-path:none !important; }',
        'body.' + BODY_CLASS + ' .card.card--button-compact .card__svg-icon svg, body.' + BODY_CLASS + ' .card.card--genre-compact .card__svg-icon svg, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .streaming-card__svg-icon svg, body.' + BODY_CLASS + ' .card.streaming-card--button-compact .streaming-card__svg-icon img { border-radius:0 !important; clip-path:none !important; -webkit-clip-path:none !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="start"] .nfx-card-overlay { align-items:flex-start !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="start"] .nfx-card-overlay__title,',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="start"] .nfx-card-overlay__local-title,',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="start"] .nfx-card-overlay__meta { text-align:left !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="center"] .nfx-card-overlay { align-items:center !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="center"] .nfx-card-overlay__title,',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="center"] .nfx-card-overlay__local-title,',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="center"] .nfx-card-overlay__meta { text-align:center !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="end"] .nfx-card-overlay { align-items:flex-end !important; }',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="end"] .nfx-card-overlay__title,',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="end"] .nfx-card-overlay__local-title,',
        'body.' + BODY_CLASS + '[' + OVERLAY_ALIGN_ATTR + '="end"] .nfx-card-overlay__meta { text-align:right !important; }',
        'body.' + BODY_CLASS + ' .card.focus .nfx-card-overlay { transform: translateZ(18px) translateY(-.02em); }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__logo, body.' + BODY_CLASS + ' img.nfx-card-overlay__logo { display:block !important; opacity:1 !important; visibility:visible !important; max-height:2.55em !important; max-width:82% !important; margin-bottom:.28em !important; border-radius:0 !important; clip-path:none !important; -webkit-clip-path:none !important; mask-image:none !important; -webkit-mask-image:none !important; overflow:visible !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__title { color:#fff; font-size:1.02em !important; line-height:1.14 !important; font-weight:800 !important; text-shadow:0 1px 2px rgba(0,0,0,.95), 0 2px 8px rgba(0,0,0,.85), 0 4px 16px rgba(0,0,0,.7) !important; white-space:normal !important; display:-webkit-box !important; -webkit-line-clamp:2 !important; -webkit-box-orient:vertical !important; overflow:hidden !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__local-title { color:rgba(255,255,255,.92) !important; opacity:.85 !important; font-size:.78em !important; line-height:1.2 !important; font-weight:600 !important; letter-spacing:.01em !important; text-shadow:0 1px 2px rgba(0,0,0,.95), 0 2px 6px rgba(0,0,0,.85), 0 3px 12px rgba(0,0,0,.7) !important; white-space:normal !important; display:-webkit-box !important; -webkit-line-clamp:2 !important; -webkit-box-orient:vertical !important; overflow:hidden !important; margin-bottom:.22em !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay__meta { color:rgba(255,255,255,.92); font-size:.74em !important; margin-top:.2em !important; line-height:1.28 !important; white-space:normal !important; max-width:100% !important; text-shadow:0 1px 2px rgba(0,0,0,.95), 0 2px 6px rgba(0,0,0,.85), 0 3px 12px rgba(0,0,0,.7) !important; }',
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
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card.card--button-compact .card__view, body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card.streaming-card--button-compact .card__view, body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card.card--genre-compact .card__view { padding-bottom:56% !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card__img, body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card__image { object-position:center center !important; }',
        'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .nfx-card-overlay { display:flex !important; background:transparent !important; padding:5em 1em 1em !important; border-radius:0 0 1.55em 1.55em !important; }',
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
        'body.' + BODY_CLASS + ' .navigation-bar { position: fixed !important; left: 50% !important; bottom: .8em !important; transform: translateX(-50%) !important; z-index: 10 !important; width: 100% !important; max-width: calc(100vw - 2em) !important; font-size: 1.15em !important; padding: 0 1.2em .7em 1.2em !important; }',
        'body.' + BODY_CLASS + '.orientation--landscape .navigation-bar { width: auto !important; left: auto !important; transform: translateX(0) !important; height: 85% !important; top: 15% !important; }',
        'body.' + BODY_CLASS + ' .navigation-bar__body { width: 100% !important; height: 2.8em !important; box-sizing: border-box !important; display: flex !important; align-items: center !important; justify-content: space-around !important; padding: .18em .32em !important; border-radius: 999px !important; background: rgba(22,24,30,.82) !important; border: 1px solid rgba(255,255,255,.12) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 8px 24px rgba(0,0,0,.28) !important; backdrop-filter: blur(22px) saturate(145%) !important; -webkit-backdrop-filter: blur(22px) saturate(145%) !important; font-size: 1.4em !important; }',
        'body.' + BODY_CLASS + '.orientation--landscape .navigation-bar__body { width: auto !important; height: auto !important; min-width: 3em !important;}',
        'body.' + BODY_CLASS + ' .navigation-bar__item { width: 100% !important; height: 100% !important; appearance: none !important; -webkit-appearance: none !important; border: 0 !important; background: none !important; color: rgba(255,255,255,.88) !important; flex: 1 !important; display: inline-flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; padding: 0 !important; border-radius: 999px !important; font-size: 1em !important; font-weight: 700 !important; line-height: 1 !important; white-space: nowrap !important; transition: background .2s ease, transform .2s ease, box-shadow .2s ease, color .2s ease !important; cursor: pointer !important; }',
        'body.' + BODY_CLASS + ' .navigation-bar__icon { width: 1.2em !important; height: 1.2em !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; color: inherit !important; }',
        'body.' + BODY_CLASS + ' .navigation-bar__icon svg { width: 1.2em !important; height: 1.2em !important; stroke-width: 2 !important; }',
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
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .selectbox__content.layer--height { background: rgba(26,29,34,.97) !important; }',
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
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings__content.layer--height { background: rgb(22,24,30) !important; box-shadow: 0 4px 12px rgba(0,0,0,.4) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .selectbox__content.layer--height { background: rgb(22,24,30) !important; box-shadow: 0 4px 12px rgba(0,0,0,.4) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .nfx-card-logo,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .nfx-card-rating,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode .full-episode__num { background: rgba(12,14,20,.94) !important; box-shadow: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card .card__view,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .card-episode .full-episode__img { box-shadow: 0 2px 6px rgba(0,0,0,.4) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .nfx-card-overlay { background: transparent !important; }',

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
        '  font-size: calc(clamp(0.92rem, 0.5rem + 1.4vmin, 1.7rem) * var(--agnative-scale, 1)) !important;',
        '  opacity: 0 !important;',
        '  pointer-events: none !important;',
        '  transition: transform .28s cubic-bezier(.22,.61,.36,1), opacity .2s ease !important;',
        '}',
        '  transform: translateX(0) translateY(-50%) !important;',
        '  opacity: 1 !important;',
        '  pointer-events: auto !important;',
        '}',
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
        '  background: rgba(255,255,255,.16) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.14) !important;',
        '  transform: translateX(.04em) !important;',
        '}',

        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '  background: rgba(22,24,30,.94) !important;',
        '  box-shadow: 0 4px 12px rgba(0,0,0,.4) !important;',
        '}',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '  background: rgb(22,24,30) !important;',
        '  box-shadow: 0 4px 12px rgba(0,0,0,.4) !important;',
        '}',
        '  transition: opacity .15s ease !important;',
        '}',
        '  transition: none !important;',
        '  transform: translateX(-130%) translateY(-50%) !important;',
        '}',
        '  transform: translateX(0) translateY(-50%) !important;',
        '}',
        '  transition: background .12s ease !important;',
        '}',
        '  transition: none !important;',
        '}',
        '  transform: none !important;',
        '  box-shadow: 0 0 0 2px rgba(86,141,255,.92) !important;',
        '}',

        'body.' + BODY_CLASS + ' .settings {',
        '  position: fixed !important;',
        '  top: 0 !important;',
        '  right: 0 !important;',
        '  bottom: 0 !important;',
        '  left: 0 !important;',
        '  width: 100% !important;',
        '  height: 100% !important;',
        '  max-width: none !important;',
        '  max-height: none !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '  background: transparent !important;',
        '  z-index: 30 !important;',
        '  pointer-events: none !important;',
        '  font-size: calc(clamp(0.62rem, 0.34rem + 1.45vmin, 2.05rem) * var(--agnative-scale, 1)) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings__layer {',
        '  position: absolute !important;',
        '  top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important;',
        '  background: rgba(0,0,0,.28) !important;',
        '  pointer-events: auto !important;',
        '  z-index: 1 !important;',
        '  cursor: pointer !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings__content,',
        'body.' + BODY_CLASS + ' .settings__content.layer--height {',
        '  position: absolute !important;',
        '  top: 5vh !important;',
        '  bottom: 5vh !important;',
        '  right: 1em !important;',
        '  left: auto !important;',
        '  width: min(32em, 42vw) !important;',
        '  min-width: 18em !important;',
        '  max-width: calc(100vw - 2em) !important;',
        '  height: auto !important;',
        '  max-height: none !important;',
        '  margin: 0 !important;',
        '  padding: 1.1em 1em .9em !important;',
        '  border-radius: 1.35em !important;',
        '  background: rgba(22,24,30,.42) !important;',
        '  background-image: none !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 12px 32px rgba(0,0,0,.28) !important;',
        '  border: 1px solid rgba(255,255,255,.10) !important;',
        '  filter: none !important;',
        '  backdrop-filter: blur(22px) saturate(140%) !important;',
        '  -webkit-backdrop-filter: blur(22px) saturate(140%) !important;',
        '  pointer-events: auto !important;',
        '  z-index: 2 !important;',
        '  transform: translateX(120%) !important;',
        '  opacity: 0 !important;',
        '  transition: transform .28s cubic-bezier(.22,.61,.36,1), opacity .2s ease !important;',
        '  display: flex !important;',
        '  flex-direction: column !important;',
        '}',
        'body.' + BODY_CLASS + '.settings--open .settings__content,',
        'body.' + BODY_CLASS + '.settings--open .settings__content.layer--height {',
        '  transform: translateX(0) !important;',
        '  opacity: 1 !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings__body {',
        '  flex: 1 1 auto !important;',
        '  min-height: 0 !important;',
        '  height: auto !important;',
        '  max-height: none !important;',
        '  overflow-y: auto !important;',
        '  padding-right: .15em !important;',
        '  padding-top: .35em !important;',
        '  padding-bottom: .35em !important;',
        '  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 1.6em, #000 calc(100% - 1.6em), transparent 100%) !important;',
        '  mask-image: linear-gradient(to bottom, transparent 0, #000 1.6em, #000 calc(100% - 1.6em), transparent 100%) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings__title,',
        'body.' + BODY_CLASS + ' .settings__head {',
        '  flex: 0 0 auto !important;',
        '  margin-bottom: .6em !important;',
        '}',
        '@keyframes agnativeSettingsLayerIn { from { opacity: 0; } to { opacity: 1; } }',
        'body.' + BODY_CLASS + '.settings--open .settings__layer { animation: agnativeSettingsLayerIn .25s ease both; }',

        'body.' + BODY_CLASS + ' .settings-input {',
        '  position: fixed !important;',
        '  top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;',
        '  display: flex !important;',
        '  z-index: 50 !important;',
        '  background: transparent !important;',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '  font-size: calc(clamp(0.62rem, 0.34rem + 1.45vmin, 2.05rem) * var(--agnative-scale, 1)) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-input__content,',
        'body.' + BODY_CLASS + ' .settings-input__content.layer--height {',
        '  width: 100% !important;',
        '  flex-shrink: 0 !important;',
        '  display: flex !important;',
        '  flex-direction: column !important;',
        '  justify-content: center !important;',
        '  padding: 1.5em !important;',
        '  box-sizing: border-box !important;',
        '  background: rgba(22,24,30,.92) !important;',
        '  background-image: none !important;',
        '  backdrop-filter: blur(24px) saturate(140%) !important;',
        '  -webkit-backdrop-filter: blur(24px) saturate(140%) !important;',
        '  filter: none !important;',
        '  border: 0 !important;',
        '  border-radius: 0 !important;',
        '  box-shadow: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-input__title {',
        '  font-size: 2.2em !important;',
        '  font-weight: 300 !important;',
        '  margin-bottom: 0.7em !important;',
        '  color: rgba(255,255,255,.96) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-input__input {',
        '  font-size: 2.1em !important;',
        '  margin-bottom: 1em !important;',
        '  min-height: 2.3em !important;',
        '  border-bottom: 2px solid rgba(255,255,255,.08) !important;',
        '  padding: 0.6em 0 !important;',
        '  color: rgba(255,255,255,.95) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-input__links {',
        '  margin-top: 1em !important;',
        '  background: rgba(221,221,221,.06) !important;',
        '  border-radius: 10em !important;',
        '  padding: 0.7em 1em !important;',
        '  font-size: 1.2em !important;',
        '  text-align: center !important;',
        '  color: rgba(255,255,255,.65) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-input--free {',
        '  background: rgba(22,24,30,.94) !important;',
        '  backdrop-filter: blur(20px) saturate(140%) !important;',
        '  -webkit-backdrop-filter: blur(20px) saturate(140%) !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-input--free .settings-input__content,',
        'body.' + BODY_CLASS + ' .settings-input--free .settings-input__content.layer--height {',
        '  margin: 0 auto !important;',
        '  background: transparent !important;',
        '  box-shadow: none !important;',
        '  border: 0 !important;',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '}',
        'body.' + BODY_CLASS + ' .settings-input--focus .settings-input__content,',
        'body.' + BODY_CLASS + ' .settings-input--align-top .settings-input__content { justify-content: flex-start !important; }',
        'body.' + BODY_CLASS + ' .settings-input--align-center .settings-input__content { justify-content: center !important; }',
        'body.' + BODY_CLASS + ' .settings-input--align-bottom .settings-input__content { justify-content: flex-end !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .settings-input__content,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings-input__content,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .settings-input__content.layer--height,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings-input__content.layer--height {',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '  background: rgba(22,24,30,.99) !important;',
        '}',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .settings-input--free,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings-input--free {',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '  background: rgba(22,24,30,.99) !important;',
        '}',

        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .settings__content,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .settings__content.layer--height {',
        '  transition: transform .15s ease, opacity .15s ease !important;',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '  background: rgba(22,24,30,.94) !important;',
        '  box-shadow: 0 4px 12px rgba(0,0,0,.4) !important;',
        '}',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings__content,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings__content.layer--height {',
        '  transition: none !important;',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '  background: rgb(22,24,30) !important;',
        '  box-shadow: 0 4px 12px rgba(0,0,0,.4) !important;',
        '}',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"].settings--open .settings__layer { animation: none !important; }',

        'body.' + BODY_CLASS + ' .selectbox {',
        '  display: none !important;',
        '  position: fixed !important;',
        '  top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important;',
        '  width: 100% !important; height: 100% !important;',
        '  max-width: none !important; max-height: none !important;',
        '  margin: 0 !important; padding: 0 !important;',
        '  background: transparent !important;',
        '  z-index: 55 !important;',
        '  pointer-events: none !important;',
        '  font-size: calc(clamp(0.62rem, 0.34rem + 1.45vmin, 2.05rem) * var(--agnative-scale, 1)) !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox.animate {',
        '  display: block !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox__layer {',
        '  position: absolute !important;',
        '  top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important;',
        '  background: rgba(0,0,0,.42) !important;',
        '  pointer-events: auto !important;',
        '  z-index: 1 !important;',
        '  cursor: pointer !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox.animate .selectbox__layer {',
        '  animation: agnativeSelectboxLayerIn .25s ease both;',
        '}',
        '@keyframes agnativeSelectboxLayerIn { from { opacity: 0; } to { opacity: 1; } }',
        'body.' + BODY_CLASS + ' .selectbox__content,',
        'body.' + BODY_CLASS + ' .selectbox__content.layer--height {',
        '  position: absolute !important;',
        '  top: 5vh !important;',
        '  bottom: 5vh !important;',
        '  right: 1em !important;',
        '  left: auto !important;',
        '  width: min(32em, 42vw) !important;',
        '  min-width: 18em !important;',
        '  max-width: calc(100vw - 2em) !important;',
        '  height: auto !important;',
        '  max-height: none !important;',
        '  margin: 0 !important;',
        '  padding: 1.1em 1em .9em !important;',
        '  border-radius: 1.35em !important;',
        '  background: rgba(22,24,30,.42) !important;',
        '  background-image: none !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 18px 44px rgba(0,0,0,.34) !important;',
        '  border: 1px solid rgba(255,255,255,.10) !important;',
        '  filter: none !important;',
        '  backdrop-filter: blur(22px) saturate(140%) !important;',
        '  -webkit-backdrop-filter: blur(22px) saturate(140%) !important;',
        '  pointer-events: auto !important;',
        '  z-index: 2 !important;',
        '  display: flex !important;',
        '  flex-direction: column !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox.animate .selectbox__content,',
        'body.' + BODY_CLASS + ' .selectbox.animate .selectbox__content.layer--height {',
        '  animation: agnativeSelectboxIn .28s cubic-bezier(.22,.61,.36,1) both;',
        '}',
        '@keyframes agnativeSelectboxIn {',
        '  from { opacity: 0; transform: translateX(120%); }',
        '  to   { opacity: 1; transform: translateX(0); }',
        '}',
        'body.' + BODY_CLASS + ' .selectbox__head {',
        '  flex: 0 0 auto !important;',
        '  margin: 0 0 .6em !important;',
        '  padding: 0 .2em !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox__title {',
        '  font-size: 1.05em !important;',
        '  font-weight: 700 !important;',
        '  letter-spacing: .01em !important;',
        '  color: rgba(255,255,255,.96) !important;',
        '  text-align: center !important;',
        '  margin: 0 !important;',
        '  padding: 0 !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox__body,',
        'body.' + BODY_CLASS + ' .selectbox__body.layer--wheight {',
        '  flex: 1 1 auto !important;',
        '  min-height: 0 !important;',
        '  height: auto !important;',
        '  max-height: none !important;',
        '  overflow-y: auto !important;',
        '  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 1.6em, #000 calc(100% - 1.6em), transparent 100%) !important;',
        '  mask-image: linear-gradient(to bottom, transparent 0, #000 1.6em, #000 calc(100% - 1.6em), transparent 100%) !important;',
        '  padding: .35em .15em !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item.selector {',
        '  background: rgba(255,255,255,.04) !important;',
        '  border: 1px solid rgba(255,255,255,.06) !important;',
        '  border-radius: 1em !important;',
        '  padding: .75em 1em !important;',
        '  margin: 0 0 .35em !important;',
        '  color: rgba(255,255,255,.92) !important;',
        '  transition: background .2s ease, transform .2s ease, box-shadow .2s ease !important;',
        '  cursor: pointer !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item.selector:last-child { margin-bottom: 0 !important; }',
        'body.' + BODY_CLASS + ' .selectbox-item.focus,',
        'body.' + BODY_CLASS + ' .selectbox-item.hover {',
        '  background: rgba(255,255,255,.14) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 0 0 1px rgba(255,255,255,.09) !important;',
        '  transform: translateY(-.02em) !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item.selected {',
        '  background: rgba(255,255,255,.10) !important;',
        '  border-color: rgba(255,255,255,.22) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.08) !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item.selected.focus,',
        'body.' + BODY_CLASS + ' .selectbox-item.selected.hover {',
        '  background: rgba(255,255,255,.20) !important;',
        '  border-color: rgba(255,255,255,.35) !important;',
        '  box-shadow: inset 0 1px 0 rgba(255,255,255,.16), 0 0 0 1px rgba(255,255,255,.14) !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item__title {',
        '  font-size: .98em !important;',
        '  font-weight: 600 !important;',
        '  line-height: 1.25 !important;',
        '  color: inherit !important;',
        '  flex: 1 1 auto !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item--checkbox {',
        '  padding-right: 3.2em !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item__checkbox {',
        '  position: absolute !important;',
        '  top: 50% !important;',
        '  right: .9em !important;',
        '  transform: translateY(-50%) !important;',
        '  width: 1.1em !important;',
        '  height: 1.1em !important;',
        '  border-radius: .28em !important;',
        '  border: 2px solid rgba(255,255,255,.28) !important;',
        '  background: transparent !important;',
        '  transition: border-color .15s ease, background .15s ease !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item.selected .selectbox-item__checkbox {',
        '  border-color: rgba(255,255,255,.75) !important;',
        '  background: rgba(255,255,255,.18) !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item.selected .selectbox-item__checkbox::after {',
        '  content: "" !important;',
        '  position: absolute !important;',
        '  left: .22em !important; top: .04em !important;',
        '  width: .35em !important; height: .6em !important;',
        '  border: 2px solid rgba(255,255,255,.92) !important;',
        '  border-top: none !important; border-left: none !important;',
        '  transform: rotate(44deg) !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item.selected:not(.nomark):not(.selectbox-item--checkbox)::after,',
        'body.' + BODY_CLASS + ' .selectbox-item.picked:not(.selectbox-item--checkbox)::after {',
        '  content: "◉" !important;',
        '  display: block !important;',
        '  width: auto !important;',
        '  height: fit-content !important;',
        '  border: none !important;',
        '  position: absolute !important;',
        '  top: 0 !important;',
        '  bottom: 0 !important;',
        '  right: 1em !important;',
        '  margin: auto 0 !important;',
        '  transform: none !important;',
        '  font-size: 1.1em !important;',
        '  font-weight: 700 !important;',
        '  color: rgba(255,255,255,.82) !important;',
        '  line-height: 1 !important;',
        '  z-index: 2 !important;',
        '}',
        'body.' + BODY_CLASS + ' .selectbox-item.selected:not(.nomark):not(.selectbox-item--checkbox),',
        'body.' + BODY_CLASS + ' .selectbox-item.picked:not(.selectbox-item--checkbox) {',
        '  padding-right: 2.8em !important;',
        '}',

        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .selectbox__content,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .selectbox__content.layer--height,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .selectbox__content,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .selectbox__content.layer--height {',
        '  backdrop-filter: none !important;',
        '  -webkit-backdrop-filter: none !important;',
        '  background: rgba(22,24,30,.96) !important;',
        '  box-shadow: 0 8px 24px rgba(0,0,0,.45) !important;',
        '  animation: none !important;',
        '}',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"].selectbox--open .selectbox__content,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"].selectbox--open .selectbox__content.layer--height,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"].selectbox--open .selectbox__content,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"].selectbox--open .selectbox__content.layer--height {',
        '  transform: translate3d(0, 0, 0) !important;',
        '}',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .selectbox__layer { animation: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .selectbox-item.selector { transition: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .selectbox-item.focus,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .selectbox-item.hover { transform: none !important; outline: 2px solid rgba(86,141,255,.92) !important; outline-offset: -2px !important; box-shadow: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings-param.focus,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings-param.hover,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings-folder.focus,',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .settings-folder.hover { outline: 2px solid rgba(86,141,255,.92) !important; outline-offset: -2px !important; box-shadow: none !important; transform: none !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .selectbox-item__checkbox { transition: none !important; }',

        '@media (max-width: 767px) {',
        '  body.' + BODY_CLASS + ' .agnative-topnav-shell { display: none !important; }',
        '  body.' + BODY_CLASS + ' .agnative-topnav-rightdock { font-size: 1.3em !important; }',
        '  body.' + BODY_CLASS + ' .head__menu-icon { font-size: 1.3em !important; }',
        '  body.' + BODY_CLASS + ' .head__navigator { position: absolute !important; top: 0 !important; left: 1em !important; font-size: 1.3em !important; }',
        '  body.' + BODY_CLASS + ' .activity.layer--width.activity--active { padding: 0 !important; }',
        '  body.' + BODY_CLASS + ' .head__navigator:empty { display: none !important; }',
        '  body.' + BODY_CLASS + ' .settings__content { top: .75em !important; bottom: .75em !important; right: .5em !important; width: calc(100vw - 1em) !important; max-width: calc(100vw - 1em) !important; }',
        '  body.' + BODY_CLASS + ' .selectbox__content,',
        '  body.' + BODY_CLASS + ' .selectbox__content.layer--height { top: .75em !important; bottom: .75em !important; right: .5em !important; width: calc(100vw - 1em) !important; max-width: calc(100vw - 1em) !important; }',
        '  body.' + BODY_CLASS + ' .settings-input__content,',
        '  body.' + BODY_CLASS + ' .settings-input__content.layer--height { width: 100% !important; }',
        '  body.' + BODY_CLASS + ' .settings-input__links { display: none !important; }',
        '  body.' + BODY_CLASS + ' .selectbox-item.selector { padding: .65em .85em !important; }',
        '}',
        '@media (max-width: 480px) {',
        '  body.' + BODY_CLASS + ' .settings__content,',
        '  body.' + BODY_CLASS + ' .settings__content.layer--height {',
        '    width: 100% !important;',
        '    max-width: 100% !important;',
        '    left: 0 !important;',
        '    right: 0 !important;',
        '    top: unset !important;',
        '    bottom: 0 !important;',
        '    height: auto !important;',
        '    max-height: 92vh !important;',
        '    border-radius: 1.8em 1.8em 0 0 !important;',
        '    transform: translate3d(0, 100%, 0) !important;',
        '    transition: none !important;',
        '    opacity: 1 !important;',
        '  }',
        '  body.' + BODY_CLASS + '.settings--open .settings__content,',
        '  body.' + BODY_CLASS + '.settings--open .settings__content.layer--height {',
        '    transform: translate3d(0, 0, 0) !important;',
        '  }',
        '  body.' + BODY_CLASS + ' .selectbox__content,',
        '  body.' + BODY_CLASS + ' .selectbox__content.layer--height {',
        '    width: 100% !important;',
        '    max-width: 100% !important;',
        '    left: 0 !important;',
        '    right: 0 !important;',
        '    top: unset !important;',
        '    bottom: 0 !important;',
        '    height: auto !important;',
        '    max-height: 92vh !important;',
        '    border-radius: 1.8em 1.8em 0 0 !important;',
        '    transform: translate3d(0, 100%, 0) !important;',
        '    animation: none !important;',
        '  }',
        '  body.selectbox--open body.' + BODY_CLASS + ' .selectbox__content,',
        '  body.' + BODY_CLASS + ' .selectbox.animate .selectbox__content,',
        '  body.' + BODY_CLASS + ' .selectbox.animate .selectbox__content.layer--height {',
        '    transform: translate3d(0, 0, 0) !important;',
        '    animation: none !important;',
        '  }',
        '  body.' + BODY_CLASS + ' .settings__body { font-size: 1.1em !important; }',
        '}',
        'body.' + BODY_CLASS + ' .agnative-beta-badge { display:inline-block; margin-left:.6em; padding:.12em .5em; font-size:.55em; font-weight:800; letter-spacing:.06em; color:#fff; background:linear-gradient(135deg, #ff6b35, #c1272d); border-radius:.4em; vertical-align:middle; line-height:1.2; box-shadow:0 1px 4px rgba(193,39,45,.4); }',
        'body.' + BODY_CLASS + ' .activity--active .items-line, body.' + BODY_CLASS + ' .activity--active .scroll__content { position:relative; z-index:10; }',

        /* ── Explorer (online / torrent source picker) ── */
        // Main layout — hide left info panel, center the files list in a tidy zone
        'body.' + BODY_CLASS + ' .explorer.layer--width { background:transparent !important; box-shadow:none !important; display:block !important; }',
        'body.' + BODY_CLASS + ' .explorer__left, body.' + BODY_CLASS + ' .explorer__card { display:none !important; }',
        'body.' + BODY_CLASS + ' .explorer__files { width:100% !important; max-width:78em !important; margin:0 auto !important; padding:0 1.5em !important; }',
        'body.' + BODY_CLASS + ' .explorer__files-head { padding:4.1em 0 .8em !important; }',
        'body.' + BODY_CLASS + ' .explorer__files-head .torrent-filter { display:flex !important; justify-content:center !important; align-items:center !important; gap:.55em !important; flex-wrap:wrap !important; }',

        // Filter / search buttons
        'body.' + BODY_CLASS + ' .explorer__files .torrent-filter .simple-button { background:rgba(255,255,255,.08) !important; border:1px solid rgba(255,255,255,.13) !important; border-radius:999px !important; padding:.42em 1.15em !important; color:rgba(255,255,255,.88) !important; font-size:.88em !important; font-weight:600 !important; line-height:1.2 !important; transition:background .18s ease, box-shadow .18s ease, transform .18s ease !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.08) !important; margin:0 !important; height:auto !important; }',
        'body.' + BODY_CLASS + ' .explorer__files .torrent-filter .simple-button.focus, body.' + BODY_CLASS + ' .explorer__files .torrent-filter .simple-button.hover { background:rgba(255,255,255,.18) !important; border-color:rgba(255,255,255,.16) !important; outline:none !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.16), 0 4px 10px rgba(0,0,0,.22) !important; transform:scale(1.04) !important; color:#fff !important; }',

        'body.' + BODY_CLASS + ' .explorer__files .torrent-filter .simple-button.agnative-explorer-back { display:inline-flex !important; align-items:center !important; justify-content:center !important; width:auto !important; height:auto !important; aspect-ratio:1 / 1 !important; padding:.42em !important; border-radius:50% !important; flex-shrink:0 !important; line-height:1 !important; color:rgba(255,255,255,.95) !important; }',
        'body.' + BODY_CLASS + ' .explorer__files .torrent-filter .simple-button.agnative-explorer-back > svg { display:block !important; width:1.2em !important; height:1.2em !important; color:inherit !important; fill:none !important; stroke:currentColor !important; margin:0 !important; flex-shrink:0 !important; }',
        'body.' + BODY_CLASS + ' .explorer__files .torrent-filter .simple-button.agnative-explorer-back.focus, body.' + BODY_CLASS + ' .explorer__files .torrent-filter .simple-button.agnative-explorer-back.hover { color:#fff !important; transform:scale(1.04) !important; animation:none !important; }',

        // Torrent / online-prestige / watched-history result rows
        'body.' + BODY_CLASS + ' .torrent-item.selector, body.' + BODY_CLASS + ' .online-prestige.selector, body.' + BODY_CLASS + ' .watched-history.selector { background:rgba(255,255,255,.055) !important; border:1px solid rgba(255,255,255,.09) !important; border-radius:1.1em !important; margin-bottom:.55em !important; padding:.85em 1.1em !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.06) !important; transition:background .2s ease, box-shadow .2s ease, transform .2s ease !important; }',
        'body.' + BODY_CLASS + ' .torrent-item.selector.focus, body.' + BODY_CLASS + ' .torrent-item.selector.hover, body.' + BODY_CLASS + ' .online-prestige.selector.focus, body.' + BODY_CLASS + ' .online-prestige.selector.hover, body.' + BODY_CLASS + ' .watched-history.selector.focus, body.' + BODY_CLASS + ' .watched-history.selector.hover { background:rgba(255,255,255,.13) !important; border-color:rgba(255,255,255,.14) !important; outline:none !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.14), 0 14px 36px rgba(0,0,0,.4), 0 6px 16px rgba(0,0,0,.22) !important; transform:scale(1.025) !important; position:relative !important; z-index:5 !important; }',
        'body.' + BODY_CLASS + ' .torrent-item.selector.focus::after, body.' + BODY_CLASS + ' .torrent-item.selector.focus::before, body.' + BODY_CLASS + ' .torrent-item.selector.hover::after, body.' + BODY_CLASS + ' .torrent-item.selector.hover::before, body.' + BODY_CLASS + ' .online-prestige.selector.focus::after, body.' + BODY_CLASS + ' .online-prestige.selector.focus::before, body.' + BODY_CLASS + ' .online-prestige.selector.hover::after, body.' + BODY_CLASS + ' .online-prestige.selector.hover::before, body.' + BODY_CLASS + ' .watched-history.selector.focus::after, body.' + BODY_CLASS + ' .watched-history.selector.focus::before, body.' + BODY_CLASS + ' .watched-history.selector.hover::after, body.' + BODY_CLASS + ' .watched-history.selector.hover::before { display:none !important; content:none !important; border:0 !important; box-shadow:none !important; }',

        // Row content
        'body.' + BODY_CLASS + ' .torrent-item__title { font-size:.92em !important; font-weight:600 !important; color:rgba(255,255,255,.92) !important; line-height:1.35 !important; margin-bottom:.45em !important; }',
        'body.' + BODY_CLASS + ' .torrent-item__details { display:flex !important; flex-wrap:wrap !important; gap:.3em !important; margin-bottom:.45em !important; align-items:center !important; }',
        'body.' + BODY_CLASS + ' .torrent-item__bitrate.bitrate, body.' + BODY_CLASS + ' .bitrate > span { background:rgba(255,255,255,.1) !important; border-radius:.4em !important; padding:.12em .45em !important; font-size:.7em !important; font-weight:700 !important; color:rgba(255,255,255,.8) !important; border:0 !important; }',
        'body.' + BODY_CLASS + ' .torrent-item__size { background:rgba(255,255,255,.14) !important; border-radius:.55em !important; padding:.22em .7em !important; font-size:.78em !important; font-weight:700 !important; color:#fff !important; white-space:nowrap !important; }',
        'body.' + BODY_CLASS + ' .torrent-item__date, body.' + BODY_CLASS + ' .torrent-item__tracker { font-size:.7em !important; color:rgba(255,255,255,.45) !important; }',
        'body.' + BODY_CLASS + ' .torrent-item__seeds, body.' + BODY_CLASS + ' .torrent-item__grabs { font-size:.7em !important; color:rgba(255,255,255,.45) !important; }',
        'body.' + BODY_CLASS + ' .torrent-item__viewed { opacity:.5 !important; }',

        // Torrent serial (season/episode list within item)
        'body.' + BODY_CLASS + ' .torrent-serial.selector { background:rgba(255,255,255,.04) !important; border:1px solid rgba(255,255,255,.08) !important; border-radius:1em !important; margin-bottom:.4em !important; transition:background .18s ease, box-shadow .18s ease !important; }',
        'body.' + BODY_CLASS + ' .torrent-serial.selector.focus, body.' + BODY_CLASS + ' .torrent-serial.selector.hover { background:rgba(255,255,255,.11) !important; border-color:rgba(255,255,255,.12) !important; outline:none !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.12), 0 10px 28px rgba(0,0,0,.32) !important; transform:scale(1.02) !important; position:relative !important; z-index:5 !important; }',
        'body.' + BODY_CLASS + ' .torrent-serial.selector.focus::after, body.' + BODY_CLASS + ' .torrent-serial.selector.focus::before, body.' + BODY_CLASS + ' .torrent-serial.selector.hover::after, body.' + BODY_CLASS + ' .torrent-serial.selector.hover::before { display:none !important; content:none !important; border:0 !important; box-shadow:none !important; }',

        // Performance mode "low" — smaller scale, lighter shadows
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .torrent-item.selector, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .torrent-serial.selector, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .online-prestige.selector, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .watched-history.selector, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .explorer__files .torrent-filter .simple-button { transition: background .15s ease, transform .15s ease !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .torrent-item.selector.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .torrent-item.selector.hover, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .online-prestige.selector.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .online-prestige.selector.hover, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .watched-history.selector.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .watched-history.selector.hover { transform:scale(1.015) !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.12), 0 6px 16px rgba(0,0,0,.28) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .torrent-serial.selector.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .torrent-serial.selector.hover { transform:scale(1.012) !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.10), 0 4px 12px rgba(0,0,0,.22) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .explorer__files .torrent-filter .simple-button.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="low"] .explorer__files .torrent-filter .simple-button.hover { transform:scale(1.03) !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.14), 0 3px 8px rgba(0,0,0,.18) !important; }',

        // Performance mode "ultra" — no scale, no shadows, only background change
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .torrent-item.selector, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .torrent-serial.selector, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .online-prestige.selector, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .watched-history.selector, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .explorer__files .torrent-filter .simple-button { transition:none !important; will-change:auto !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .torrent-item.selector.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .torrent-item.selector.hover, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .torrent-serial.selector.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .torrent-serial.selector.hover, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .online-prestige.selector.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .online-prestige.selector.hover, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .watched-history.selector.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .watched-history.selector.hover { transform:none !important; box-shadow:none !important; background:rgba(255,255,255,.18) !important; border-color:rgba(255,255,255,.28) !important; }',
        'body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .explorer__files .torrent-filter .simple-button.focus, body.' + BODY_CLASS + '[' + PERF_ATTR + '="ultra"] .explorer__files .torrent-filter .simple-button.hover { transform:none !important; box-shadow:none !important; background:rgba(255,255,255,.26) !important; }',
        'body.' + BODY_CLASS + ' .wrap__left, body.' + BODY_CLASS + ' .menu, body.' + BODY_CLASS + ' .menu__content, body.' + BODY_CLASS + ' .menu .menu__list { background: rgb(22,24,30) !important; background-image:none !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important; }',
        'body.' + BODY_CLASS + ' .menu .menu__item { border-radius:.25em !important; background:transparent !important; box-shadow:none !important; }',
        'body.' + BODY_CLASS + ' .menu .menu__item.focus, body.' + BODY_CLASS + ' .menu .menu__item.hover, body.' + BODY_CLASS + ' .menu .menu__item.active { background:rgba(255,255,255,.10) !important; box-shadow:none !important; }',
        'body.' + BODY_CLASS + ' .settings__content, body.' + BODY_CLASS + ' .settings__content.layer--height { background:rgb(22,24,30) !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important; }',
        'body.' + BODY_CLASS + ' .agnative-topnav-shell__inner, body.' + BODY_CLASS + ' .agnative-topnav-clock, body.' + BODY_CLASS + ' .head__menu-icon { background:transparent !important; border:0 !important; border-radius:.25em !important; box-shadow:none !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-overlay { z-index:3 !important; padding-top:1.1em !important; background:linear-gradient(180deg, transparent 34%, rgba(8,10,14,.86) 100%) !important; }',
        'body.' + BODY_CLASS + ' .nfx-card-logo { position:relative !important; z-index:4 !important; margin-bottom:.35em !important; transform:none !important; }',
        'body.' + BODY_CLASS + '[' + CLOCK_COLOR_ATTR + '="white"] .agnative-topnav-clock { color:rgba(255,255,255,.94) !important; }',
        'body.' + BODY_CLASS + '[' + CLOCK_COLOR_ATTR + '="cyan"] .agnative-topnav-clock { color:#62e6e6 !important; }',
        'body.' + BODY_CLASS + '[' + CLOCK_COLOR_ATTR + '="violet"] .agnative-topnav-clock { color:#c6a7ff !important; }',
        'body.' + BODY_CLASS + '[' + CLOCK_COLOR_ATTR + '="amber"] .agnative-topnav-clock { color:#ffc766 !important; }',
        'body.' + BODY_CLASS + '[' + CLOCK_COLOR_ATTR + '="lime"] .agnative-topnav-clock { color:#b7ef71 !important; }'
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

    

    

    function registerTopnavController(shell) {
      if (!shell || !window.Lampa || !Lampa.Controller || !window.$) return;
      if (topnavControllerReady || typeof Lampa.Controller.add !== 'function') return;
      topnavControllerReady = true;
      try {
        Lampa.Controller.add('agnative_head', {
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
          }
        });
      } catch (e) {
        topnavControllerReady = false;
      }
    }

    


    function scrollSettingsItemIntoView(item, scroller) {
      if (!item || !scroller) return;
      var scrollerRect = scroller.getBoundingClientRect();
      var itemRect = item.getBoundingClientRect();
      var pad = 18;
      if (itemRect.top < scrollerRect.top + pad) {
        scroller.scrollTop -= (scrollerRect.top + pad - itemRect.top);
      } else if (itemRect.bottom > scrollerRect.bottom - pad) {
        scroller.scrollTop += (itemRect.bottom - (scrollerRect.bottom - pad));
      }
    }

    function watchSettingsLifecycle() {
      if (settingsLifecycleObserver || typeof MutationObserver !== 'function' || !document.body) return;

      var attachInner = function () {
        var sb = qs('.settings__body');
        if (!sb || sb.__agnativeSettingsScrollObserver) return;
        var inner = new MutationObserver(function (muts) {
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
            var t = m.target;
            if (!t || !t.classList || !t.classList.contains('focus')) continue;
            scrollSettingsItemIntoView(t, sb);
          }
        });
        inner.observe(sb, {
          attributes: true,
          attributeFilter: ['class'],
          subtree: true
        });
        sb.__agnativeSettingsScrollObserver = inner;
      };

      var detachInner = function () {
        var sb = qs('.settings__body');
        if (sb && sb.__agnativeSettingsScrollObserver) {
          sb.__agnativeSettingsScrollObserver.disconnect();
          sb.__agnativeSettingsScrollObserver = null;
        }
      };

      settingsLifecycleObserver = new MutationObserver(function () {
        if (document.body.classList.contains('settings--open')) {
          setTimeout(attachInner, 80);
        } else {
          detachInner();
        }
      });
      settingsLifecycleObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    function disconnectSettingsLifecycle() {
      if (settingsLifecycleObserver) {
        settingsLifecycleObserver.disconnect();
        settingsLifecycleObserver = null;
      }
      var sb = qs('.settings__body');
      if (sb && sb.__agnativeSettingsScrollObserver) {
        sb.__agnativeSettingsScrollObserver.disconnect();
        sb.__agnativeSettingsScrollObserver = null;
      }
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
          if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') Lampa.Controller.toggle('menu');
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

    function syncClockColor() {
      if (!document.body || !window.Lampa || !window.Lampa.Storage) return;
      var value = window.Lampa.Storage.get(AGNATIVE_KEYS.CLOCK_COLOR_KEY, 'cyan') || 'cyan';
      document.body.setAttribute(AGNATIVE_KEYS.CLOCK_COLOR_ATTR, String(value));
    }

    function updateClock() {
      syncClockColor();
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

    function topnavEnabled() {
      try { return window.Lampa && Lampa.Storage.get(TOPNAV_ENABLE_KEY, 'on') !== 'off'; } catch (e) { return true; }
    }

    function getTopnavIconsOrder() {
      var v = 'end';
      try { v = Lampa.Storage.get(TOPNAV_ICONS_ORDER_KEY, 'end'); } catch (e) { }
      if (v !== 'start' && v !== 'split') v = 'end';
      return v;
    }

    function syncTopnavSize() {
      if (!document.body) return;
      var size = 'md';
      try { size = Lampa.Storage.get(TOPNAV_SIZE_KEY, 'md'); } catch (e) { }
      if (!/^(xs|sm|md|lg|xl)$/.test(size)) size = 'md';
      document.body.setAttribute(TOPNAV_SIZE_ATTR, size);
    }

    function removeTopnavUi() {
      try {
        var shell = document.querySelector('.agnative-topnav-shell');
        if (shell) shell.remove();
        var dock = document.querySelector('.agnative-topnav-rightdock');
        if (dock) dock.remove();
        var clock = document.getElementById(CLOCK_ID);
        if (clock) clock.remove();
        var panel = document.querySelector('.agnative-control-panel');
        if (panel) panel.remove();
      } catch (e) { }
    }

    function patchTopnav() {
      if (!topnavEnabled()) { removeTopnavUi(); return false; }
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

      function buildIconButton(def) {
        var btn = document.createElement('div');
        btn.className = 'agnative-topnav-shell__item agnative-topnav-shell__item--icon selector';
        btn.setAttribute('data-role', def.role);
        btn.setAttribute('data-selector', 'true');
        btn.setAttribute('tabindex', '0');
        btn.innerHTML = def.svg;
        bindAction(btn, def.handler);
        return btn;
      }

      var searchDef = { role: 'search', svg: iconSearch(), handler: triggerSearch };
      var favoriteDef = { role: 'favorite', svg: iconFavorite(), handler: triggerFavorite };

      var order = getTopnavIconsOrder();
      var startDefs = [];
      var endDefs = [];
      if (order === 'start') {
        startDefs = [searchDef, favoriteDef];
      } else if (order === 'split') {
        startDefs = [searchDef];
        endDefs = [favoriteDef];
      } else {
        endDefs = [searchDef, favoriteDef];
      }
      // Settings icon (shown only when the clock control panel is off) always stays at the end.
      if (!controlPanelEnabled()) {
        endDefs.push({ role: 'settings', svg: iconSettings(), handler: triggerSettings });
      }

      var firstMenu = itemsWrap.firstChild;
      startDefs.forEach(function (def) {
        itemsWrap.insertBefore(buildIconButton(def), firstMenu);
      });
      endDefs.forEach(function (def) {
        rightWrap.appendChild(buildIconButton(def));
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

    function pickImdbTrailerKeys(videos) {
      if (!videos || !videos.length) return [];
      var trailers = [];
      var promos = [];
      for (var i = 0; i < videos.length; i++) {
        var v = videos[i];
        if (!v || !v.id) continue;
        var t = (v.type || '').toLowerCase();
        if (t === 'trailer') trailers.push(v.id);
        else if (t === 'promotional' || t === 'promo') promos.push(v.id);
      }
      var out = [];
      var seen = {};
      function add(arr) {
        for (var j = 0; j < arr.length; j++) {
          if (!seen[arr[j]]) { seen[arr[j]] = 1; out.push(arr[j]); }
        }
      }
      add(trailers); add(promos);
      return out;
    }

    function fetchJsonWithTimeout(url, ms) {
      try {
        if (typeof fetch !== 'function') return Promise.reject(new Error('no fetch'));
        if (typeof AbortController === 'undefined') {
          return fetch(url).then(function (r) { return r.json(); });
        }
        var ctrl = new AbortController();
        var to = setTimeout(function () { try { ctrl.abort(); } catch (e) { } }, ms);
        function done() { clearTimeout(to); }
        return fetch(url, { signal: ctrl.signal })
          .then(function (r) { return r.json(); })
          .then(function (data) { done(); return data; }, function (err) { done(); throw err; });
      } catch (e) {
        return Promise.reject(e);
      }
    }

    function fetchImdbVideos(imdbId, callback) {
      if (!imdbId) return callback([]);
      var cacheKey = 'imdb_videos_v2/' + imdbId;

      function finish(keys, persist) {
        var val = (keys && keys.length) ? keys : [];
        if (persist) { try { metaSet(cacheKey, val); } catch (e) {} }
        for (var i = 0; i < cbs.length; i++) {
          try { cbs[i](val); } catch (e) {}
        }
      }

      metaGet(cacheKey, function (persisted) {
        if (persisted !== undefined) {
          var arr = Array.isArray(persisted) ? persisted : [];
          for (var i = 0; i < cbs.length; i++) {
            try { cbs[i](arr); } catch (e) {}
          }
          return;
        }
        fetchJsonWithTimeout(url, 9000).then(function (data) {
          if (data && data.error) { finish([], false); return; }
          finish(pickImdbTrailerKeys(data && data.videos), true);
        }, function () {
          fetchJsonWithTimeout(fallback, 9000).then(function (d2) {
            finish(pickImdbTrailerKeys(d2 && d2.videos), true);
          }, function () { finish([], false); });
        });
      });
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
                height: picked.height,
                iso_639_1: picked.iso_639_1 || null
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

    function isSursButtonCard(cardEl) {
      if (!cardEl || !cardEl.classList) return false;
      return cardEl.classList.contains('card--button-compact') ||
             cardEl.classList.contains('streaming-card--button-compact') ||
             cardEl.classList.contains('card--genre-compact');
    }

    function switchCardToBackdrop(cardEl) {
      if (cardEl.getAttribute('data-nfx-switched')) return;
      if (isSursButtonCard(cardEl)) {
        cardEl.setAttribute('data-nfx-switched', 'surs');
        return;
      }
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
        if (useHorizontal) {
          if (data.backdrop_path) {
            setImgUrl(Lampa.TMDB.image('t/p/' + getBackdropQuality() + data.backdrop_path));
          }
        } else {
          var bTmdbType = data.name ? 'tv' : 'movie';
          if (data.poster_path) {
            setImgUrl(Lampa.TMDB.image('t/p/' + getPosterQuality() + data.poster_path));
          }
          if (data.id) {
            fetchCleanPoster(data.id, bTmdbType, function (cleanPath) {
              if (cleanPath) {
                setImgUrl(Lampa.TMDB.image('t/p/' + getPosterQuality() + cleanPath));
              } else if (data.backdrop_path) {
                setImgUrl(Lampa.TMDB.image('t/p/' + getBackdropQuality() + data.backdrop_path));
              }
            });
          } else if (data.backdrop_path) {
            setImgUrl(Lampa.TMDB.image('t/p/' + getBackdropQuality() + data.backdrop_path));
          }
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
          var pLocalLang = getLogoLang();
          var pTitleText = data.title || data.name || '';
          var pPosterNonLocal = pTitleText && pLocalLang !== 'en' && data.original_language && data.original_language !== pLocalLang;
          var pTitleHtml = (logoTitleEnabled() && pPosterNonLocal) ? '<div class="nfx-card-overlay__local-title">' + escapeHtml(pTitleText) + '</div>' : '';
          if (pTitleHtml || pMetaHtml) {
            var pOverlay = document.createElement('div');
            pOverlay.className = 'nfx-card-overlay';
            pOverlay.innerHTML = pTitleHtml + pMetaHtml;
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

            var logoLang = getLogoLang();
            var isNonLocalLogo = logoLang !== 'en' && logo.iso_639_1 && logo.iso_639_1 !== logoLang;
            if (logoTitleEnabled() && isNonLocalLogo && title) {
              var localTitle = document.createElement('div');
              localTitle.className = 'nfx-card-overlay__local-title';
              localTitle.textContent = title;
              img.parentNode.insertBefore(localTitle, img.nextSibling);
            }
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

    function injectExplorerBackButton(scope) {
      if (!scope || scope.nodeType !== 1) return;
      var filters = [];
      if (scope.classList && scope.classList.contains('torrent-filter')) {
        filters.push(scope);
      } else if (scope.querySelectorAll) {
        var found = scope.querySelectorAll('.torrent-filter');
        for (var k = 0; k < found.length; k++) filters.push(found[k]);
      }
      for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];
        if (filter.__agnativeBackInjected) continue;
        if (filter.querySelector('.agnative-explorer-back')) continue;
        filter.__agnativeBackInjected = true;
        var btn = document.createElement('div');
        btn.className = 'simple-button selector agnative-explorer-back';
        btn.setAttribute('data-selector', 'true');
        btn.setAttribute('tabindex', '0');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M14.5 5.5L8 12l6.5 6.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        bindAction(btn, function () {
          try { if (window.Lampa && Lampa.Activity && Lampa.Activity.backward) Lampa.Activity.backward(); } catch (e) {}
        });
        filter.insertBefore(btn, filter.firstChild);
      }
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
          injectExplorerBackButton(node);
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

    function bindInputModeDetector() {
      if (window.__AGNATIVE_INPUT_MODE_BOUND__) return;
      window.__AGNATIVE_INPUT_MODE_BOUND__ = true;
      try {
        var setMouse = function () {
          if (document.body) document.body.classList.add('agnative-mouse-mode');
        };
        var setRemote = function () {
          if (document.body) document.body.classList.remove('agnative-mouse-mode');
        };
        window.addEventListener('mousemove', setMouse, { capture: true, passive: true });
        window.addEventListener('mousedown', setMouse, { capture: true, passive: true });
        window.addEventListener('keydown', function (e) {
          var k = e.keyCode;
          if (k === 13 || k === 32 || (k >= 37 && k <= 40)) setRemote();
        }, { capture: true });
      } catch (e) { }
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
      var cardAnimMode = getCardAnim();

      if (window.Lampa && Lampa.Storage && Lampa.Storage.listener && Lampa.Storage.listener.follow) {
        try {
          Lampa.Storage.listener.follow('change', function (e) {
            if (!e) return;
            if (e.name === CARD_ANIM_KEY || e.name === GLARE_KEY) cardAnimMode = getCardAnim();
            if (e.name === CARD_ANIM_KEY || e.name === CARD_ANIM_ORBIT_KEY) {
              if (orbitActive()) {
                var focused = document.querySelector('.card.focus, .card-episode.focus, .full-start-new__poster.focus');
                if (focused) startOrbit(focused);
              } else {
                stopOrbit();
              }
            }
          });
        } catch (err) { }
      }

      function animActive() {
        return cardAnimMode !== 'off' && resolvePerfLevel() !== 'ultra';
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
        if (cardAnimMode === 'appletv') {
          s.setProperty('--atv-rx', (yPct * -4) + 'deg');
          s.setProperty('--atv-ry', (xPct * 4) + 'deg');
          s.setProperty('--atv-lx', (xPct * 0.3) + 'em');
          s.setProperty('--atv-ly', (yPct * 0.3) + 'em');
        } else {
          s.setProperty('--gx', x + 'px');
          s.setProperty('--gy', y + 'px');
          s.setProperty('--rx', (yPct * -7) + 'deg');
          s.setProperty('--ry', (xPct * 7) + 'deg');
        }
      }

      function setActiveCard(card) {
        if (card === activeCard) return;
        activeCard = card;
        activeRect = card ? card.getBoundingClientRect() : null;
      }

      document.body.addEventListener('mouseover', function (e) {
        if (!animActive()) { activeCard = null; activeRect = null; return; }
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
        s.removeProperty('--atv-rx');
        s.removeProperty('--atv-ry');
        s.removeProperty('--atv-lx');
        s.removeProperty('--atv-ly');
        if (activeCard === card) { activeCard = null; activeRect = null; }
      });

      var orbitCard = null;
      var orbitStart = 0;
      var orbitRaf = null;
      var ORBIT_PERIOD = 4200;
      var ORBIT_RADIUS = 0.9;

      function orbitActive() {
        return cardAnimMode === 'appletv' && cardAnimOrbitEnabled() && resolvePerfLevel() !== 'ultra';
      }

      function clearOrbitVars(card) {
        if (!card) return;
        var s = card.style;
        s.removeProperty('--atv-rx');
        s.removeProperty('--atv-ry');
        s.removeProperty('--atv-lx');
        s.removeProperty('--atv-ly');
      }

      function stopOrbit() {
        if (orbitRaf) { cancelAnimationFrame(orbitRaf); orbitRaf = null; }
        if (orbitCard) { clearOrbitVars(orbitCard); orbitCard = null; }
      }

      function inMouseMode() {
        return document.body.classList.contains('agnative-mouse-mode');
      }

      function stepOrbit(now) {
        orbitRaf = null;
        if (!orbitCard || !orbitActive() || inMouseMode()) { stopOrbit(); return; }
        var t = (now - orbitStart) / ORBIT_PERIOD;
        var ang = t * Math.PI * 2;
        var xPct = Math.cos(ang) * ORBIT_RADIUS;
        var yPct = Math.sin(ang) * ORBIT_RADIUS;
        var s = orbitCard.style;
        s.setProperty('--atv-rx', (yPct * -4) + 'deg');
        s.setProperty('--atv-ry', (xPct * 4) + 'deg');
        s.setProperty('--atv-lx', (xPct * 0.3) + 'em');
        s.setProperty('--atv-ly', (yPct * 0.3) + 'em');
        orbitRaf = requestAnimationFrame(stepOrbit);
      }

      function startOrbit(card) {
        if (!card || !orbitActive() || inMouseMode()) return;
        if (orbitCard === card && orbitRaf) return;
        if (orbitCard && orbitCard !== card) clearOrbitVars(orbitCard);
        orbitCard = card;
        orbitStart = performance.now();
        if (!orbitRaf) orbitRaf = requestAnimationFrame(stepOrbit);
      }

      function findFocusedCard() {
        return document.querySelector('.card.focus, .card-episode.focus, .full-start-new__poster.focus');
      }

      window.addEventListener('keydown', function (e) {
        var k = e.keyCode;
        if (k !== 13 && k !== 32 && !(k >= 37 && k <= 40)) return;
        if (!orbitActive()) return;
        var tries = 0;
        function tryStart() {
          tries++;
          if (!orbitActive() || inMouseMode()) return;
          if (orbitRaf) return;
          var focused = findFocusedCard();
          if (focused) startOrbit(focused);
          else if (tries < 8) setTimeout(tryStart, 40);
        }
        setTimeout(tryStart, 0);
      }, { capture: true });

      if (window.MutationObserver) {
        var orbitObs = new MutationObserver(function (muts) {
          if (!orbitActive() || inMouseMode()) { if (orbitCard) stopOrbit(); return; }
          for (var i = 0; i < muts.length; i++) {
            var target = muts[i].target;
            if (!target || !target.classList || target.nodeType !== 1) continue;
            if (!target.matches || !target.matches(GLARE_SEL)) continue;
            if (target.classList.contains('focus')) startOrbit(target);
            else if (orbitCard === target) stopOrbit();
          }
        });
        try {
          orbitObs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
        } catch (e) { }
      }
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
      if (!content) return;
      processCards(content);
      injectExplorerBackButton(document.body);
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
      syncTopnavSize();
      applyHiddenSettingsSectionsCSS();
      observeCards();
      bindInputModeDetector();
      initGlareRuntime();
      watchSettingsLifecycle();
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
