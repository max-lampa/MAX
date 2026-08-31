(function () {
  'use strict';

  if (window.nova_torrents && window.nova_torrents_version) return;
  window.nova_torrents = true;
  window.nova_torrents_version = '6-final';

  /* ------------------------------------------------------------------ *
   * Nova Torrents - умный фильтр раздач для Lampa                      *
   * Разбирает список торрентов, оценивает каждую раздачу и поднимает   *
   * лучшие наверх. Запуск отдаётся родному компоненту торрентов.       *
   * ------------------------------------------------------------------ */

  var STORE = {
    enabled: 'nova_tor_enabled',
    quality: 'nova_tor_quality',
    lang: 'nova_tor_lang',
    hevc: 'nova_tor_hevc',
    hdr: 'nova_tor_hdr',
    hidecam: 'nova_tor_hidecam',
    hide3d: 'nova_tor_hide3d',
    minseeds: 'nova_tor_minseeds',
    maxsize: 'nova_tor_maxsize',
    autofocus: 'nova_tor_autofocus',
    autoplay: 'nova_tor_autoplay',
    limit: 'nova_tor_limit',
    pick_sort: 'nova_tor_pick_sort',
    pick_quality: 'nova_tor_pick_quality',
    pick_voice: 'nova_tor_pick_voice',
    pick_source: 'nova_tor_pick_source',
    pick_tracker: 'nova_tor_pick_tracker',
    tmdb_key: 'nova_tor_tmdb_key',
    tmdb_lang: 'nova_tor_tmdb_lang',
    cache_ttl: 'nova_tor_cache_ttl',
    profile: 'nova_tor_quality_profile',
    compatibility: 'nova_tor_compatibility'
  };

  function get(key, def) {
    try {
      var value = Lampa.Storage.get(key, def);
      return value === undefined ? def : value;
    } catch (e) {
      return def;
    }
  }

  function save(key, value) {
    try { Lampa.Storage.set(key, value); } catch (e) {}
  }

  function enabled() { return get(STORE.enabled, true) !== false; }

  function compatibilityMode() { return String(get(STORE.compatibility, 'safe')); }
  function safeMode() { return compatibilityMode() !== 'passive'; }
  function foreignSkinPresent(node) {
    if (!node || !node.length) return false;
    var selectors = '.nova,.nova-skin-root,.z01,.z01__rows,.z01__list,.z01-hero,.z01-card';
    try { return node.find(selectors).not('.nova-tor').length > 0; } catch (e) { return false; }
  }

  /* ----------------------------- языки ------------------------------ */

  var DICT = {
    ru: {
      name: 'Nova Torrents',
      best: 'Лучшая раздача',
      play: 'Смотреть',
      continue_watch: 'Продолжить',
      rating: 'рейтинг',
      sort: 'Сортировка',
      sort_best: 'По качеству раздачи',
      sort_seeds: 'По сидам',
      sort_size_desc: 'Размер: больше',
      sort_size_asc: 'Размер: меньше',
      sort_date: 'По дате',
      quality: 'Качество',
      voice: 'Озвучка',
      source: 'Источник',
      tracker: 'Трекер',
      all: 'Все',
      reset: 'Сбросить',
      shown: 'Показано {shown} из {total}',
      empty_title: 'Под фильтр ничего не подходит',
      empty_text: 'Ослабьте условия в настройках или сбросьте фильтр.',
      episodes: 'Серии',
      episode_modal: 'Серии и раздачи',
      episode_unknown: 'Серия не определена',
      close: 'Закрыть',
      synopsis: 'Описание',
      tmdb_key: 'TMDB API ключ',
      tmdb_key_descr: 'Нужен для разных кадров серий. Ключ хранится только в настройках Lampa.',
      tmdb_lang: 'Язык кадров TMDB',
      tmdb_lang_descr: 'Язык названий и описаний серий',
      tmdb_loading: 'Загружаю кадры серий',
      tmdb_searching: 'Ищу сериал в TMDB',
       tmdb_missing: 'Для календаря и кадров нужен TMDB API-ключ в настройках Lampa',
       calendar_loading: 'Загружаю даты премьер…',
       calendar_date_unknown: 'Дата премьеры пока недоступна',
       released: 'Выпущенный',
       ongoing: 'Выходит',
      cache_page: 'Кэш TMDB',
      cache_clear: 'Очистить кэш TMDB',
      cache_clear_descr: 'Удаляет локальные кадры и данные серий. Новые кадры загрузятся снова при открытии.',
      cache_clear_done: 'Кэш TMDB очищен',
      calendar: 'Календарь',
      calendar_title: 'Календарь премьер',
      calendar_empty: 'Даты премьер не найдены',
      aired: 'Премьера',
      cache_ttl: 'Удалять старые кадры',
      cache_ttl_descr: 'Автоматически удалять локальные кадры и данные сезонов, которыми давно не пользовались.',
      cache_ttl_off: 'Не удалять',
      cache_ttl_30: 'Через 30 дней',
      cache_ttl_90: 'Через 90 дней',
      cache_ttl_180: 'Через 180 дней',
      cache_ttl_365: 'Через год',
      dead: 'нет сидов',
      voice_dub: 'Дубляж',
      voice_mvo: 'Многоголосый',
      voice_dvo: 'Двухголосый',
      voice_avo: 'Одноголосый',
      voice_sub: 'Субтитры',
      voice_orig: 'Оригинал',
      voice_unknown: 'Не указана',
      src_remux: 'Remux',
      src_bluray: 'Blu-ray',
      src_webdl: 'WEB-DL',
      src_web: 'WEBRip',
      src_hdrip: 'HDRip',
      src_hdtv: 'HDTV',
      src_dvd: 'DVD',
      src_cam: 'Экранка',
      src_unknown: 'Не указан',
      set_enable: 'Включить Nova Torrents',
      set_enable_descr: 'Заменяет список торрентов на фильтр с оценкой раздач',
      set_quality: 'Желаемое качество',
      set_quality_descr: 'Раздачи с этим качеством поднимаются вверх',
      profile: 'Профиль качества', profile_descr: 'Быстрый выбор: телевизор, телефон или 4K.', profile_tv: 'Телевизор: 1080p', profile_phone: 'Телефон: 720p', profile_4k: '4K-телевизор: 2160p', profile_custom: 'Пользовательский',
      compatibility: 'Режим совместимости', compatibility_descr: 'Безопасный режим не трогает чужие компоненты, контроллеры и разметку.', compatibility_auto: 'Авто', compatibility_safe: 'Безопасный', compatibility_passive: 'Только оформление',
      set_lang: 'Приоритет звука',
      set_lang_descr: 'Что считать плюсом: русская озвучка или оригинал',
      set_hevc: 'Плюс за HEVC / AV1',
      set_hevc_descr: 'Полезно, если устройство уверенно тянет H.265',
      set_hdr: 'Плюс за HDR / Dolby Vision',
      set_hdr_descr: 'Отключите, если экран без HDR: такие раздачи уйдут вниз',
      set_hidecam: 'Убирать экранки',
      set_hidecam_descr: 'CAMRip, TS, TC, Screener',
      set_hide3d: 'Убирать 3D',
      set_hide3d_descr: '3D, SBS, анаглиф',
      set_minseeds: 'Минимум сидов',
      set_minseeds_descr: 'Раздачи с меньшим числом сидов скрываются',
      set_maxsize: 'Максимальный размер',
      set_maxsize_descr: 'Ограничение по объёму раздачи',
      set_limit: 'Сколько показывать',
      set_limit_descr: 'Длинный список можно обрезать до лучших раздач',
      set_autofocus: 'Наводить на лучшую',
      set_autofocus_descr: 'Курсор сразу встаёт на лучшую раздачу',
      set_autoplay: 'Сразу открывать лучшую',
      set_autoplay_descr: 'Осторожно: открывает торрент без подтверждения',
      any: 'Не важно',
      ru_first: 'Русская озвучка',
      orig_first: 'Оригинал',
      off: 'Выключено',
      all_items: 'Все',
      gb: 'ГБ',
      mb: 'МБ'
    },
    en: {
      name: 'Nova Torrents',
      best: 'Best release',
      play: 'Watch',
      continue_watch: 'Continue',
      rating: 'score',
      sort: 'Sort',
      sort_best: 'By release quality',
      sort_seeds: 'By seeds',
      sort_size_desc: 'Size: larger',
      sort_size_asc: 'Size: smaller',
      sort_date: 'By date',
      quality: 'Quality',
      voice: 'Audio',
      source: 'Source',
      tracker: 'Tracker',
      all: 'All',
      reset: 'Reset',
      shown: 'Showing {shown} of {total}',
      empty_title: 'Nothing matches the filter',
      empty_text: 'Loosen the conditions in settings or reset the filter.',
      episodes: 'Episodes',
      episode_modal: 'Episodes and releases',
      episode_unknown: 'Episode not detected',
      close: 'Close',
      synopsis: 'Synopsis',
      tmdb_key: 'TMDB API key',
      tmdb_key_descr: 'Required for individual episode stills. The key stays in Lampa settings.',
      tmdb_lang: 'TMDB language',
      tmdb_lang_descr: 'Language for episode titles and overviews',
      tmdb_loading: 'Loading episode stills',
      tmdb_searching: 'Searching TMDB for the show',
       tmdb_missing: 'A TMDB API key is required for the calendar and episode stills',
       calendar_loading: 'Loading premiere dates…',
       calendar_date_unknown: 'Premiere date is not available yet',
       released: 'Released',
       ongoing: 'Ongoing',
      cache_page: 'TMDB cache',
      cache_clear: 'Clear TMDB cache',
      cache_clear_descr: 'Deletes local episode stills and season data. New frames will load again when opened.',
      cache_clear_done: 'TMDB cache cleared',
      calendar: 'Calendar',
      calendar_title: 'Premiere calendar',
      calendar_empty: 'No premiere dates found',
      aired: 'Premiere',
      cache_ttl: 'Remove old frames',
      cache_ttl_descr: 'Automatically remove local frames and season data that have not been used for a while.',
      cache_ttl_off: 'Never',
      cache_ttl_30: 'After 30 days',
      cache_ttl_90: 'After 90 days',
      cache_ttl_180: 'After 180 days',
      cache_ttl_365: 'After a year',
      dead: 'no seeds',
      voice_dub: 'Dub',
      voice_mvo: 'Multi voice',
      voice_dvo: 'Two voices',
      voice_avo: 'Single voice',
      voice_sub: 'Subtitles',
      voice_orig: 'Original',
      voice_unknown: 'Unknown',
      src_remux: 'Remux',
      src_bluray: 'Blu-ray',
      src_webdl: 'WEB-DL',
      src_web: 'WEBRip',
      src_hdrip: 'HDRip',
      src_hdtv: 'HDTV',
      src_dvd: 'DVD',
      src_cam: 'CAM',
      src_unknown: 'Unknown',
      set_enable: 'Enable Nova Torrents',
      set_enable_descr: 'Replaces the torrent list with a scored filter',
      set_quality: 'Preferred quality',
      set_quality_descr: 'Matching releases move to the top',
      profile: 'Quality profile', profile_descr: 'Quick preset: TV, phone, or 4K.', profile_tv: 'TV: 1080p', profile_phone: 'Phone: 720p', profile_4k: '4K TV: 2160p', profile_custom: 'Custom',
      compatibility: 'Compatibility mode', compatibility_descr: 'Safe mode avoids foreign components, controllers, and markup.', compatibility_auto: 'Auto', compatibility_safe: 'Safe', compatibility_passive: 'Skin only',
      set_lang: 'Audio priority',
      set_lang_descr: 'What counts as a bonus: local dub or original',
      set_hevc: 'Bonus for HEVC / AV1',
      set_hevc_descr: 'Useful if the device plays H.265 well',
      set_hdr: 'Bonus for HDR / Dolby Vision',
      set_hdr_descr: 'Turn off on an SDR screen: such releases drop down',
      set_hidecam: 'Hide cams',
      set_hidecam_descr: 'CAMRip, TS, TC, Screener',
      set_hide3d: 'Hide 3D',
      set_hide3d_descr: '3D, SBS, anaglyph',
      set_minseeds: 'Minimum seeds',
      set_minseeds_descr: 'Releases below this are hidden',
      set_maxsize: 'Maximum size',
      set_maxsize_descr: 'Release size limit',
      set_limit: 'How many to show',
      set_limit_descr: 'A long list can be trimmed to the best releases',
      set_autofocus: 'Focus the best one',
      set_autofocus_descr: 'Cursor starts on the best release',
      set_autoplay: 'Open the best one at once',
      set_autoplay_descr: 'Careful: opens the torrent without asking',
      any: 'Any',
      ru_first: 'Local dub',
      orig_first: 'Original',
      off: 'Off',
      all_items: 'All',
      gb: 'GB',
      mb: 'MB'
    }
  };

  function langCode() {
    var code = String(get('language', 'ru') || 'ru').toLowerCase();
    if (DICT[code]) return code;
    if (code === 'uk' || code === 'ua' || code === 'be' || code === 'bg') return 'ru';
    return 'en';
  }

  function t(key) {
    var pack = DICT[langCode()] || DICT.en;
    if (pack[key] != null) return pack[key];
    if (DICT.en[key] != null) return DICT.en[key];
    return key;
  }

  /* --------------------------- утилиты ------------------------------ */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function num(value) {
    if (typeof value === 'number') return isFinite(value) ? Math.round(value) : 0;
    var found = String(value == null ? '' : value).replace(/\s+/g, '').match(/-?\d+/);
    return found ? parseInt(found[0], 10) || 0 : 0;
  }

  function clean(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  /* --------------------- размер и дата ------------------------------ */

  function sizeGb(value) {
    if (value == null) return 0;
    if (typeof value === 'number') {
      if (!isFinite(value) || value <= 0) return 0;
      return value > 1048576 ? value / 1073741824 : value;
    }
    var text = String(value).toLowerCase().replace(/\u00a0/g, ' ').replace(/,/g, '.');
    var found = text.match(/(\d+(?:\.\d+)?)\s*(tib|gib|mib|tb|gb|mb|kb|тіб|тиб|гиб|тб|гб|мб|кб)/);
    if (found) {
      var value_num = parseFloat(found[1]) || 0;
      var unit = found[2];
      if (unit === 'tb' || unit === 'tib' || unit === 'тб' || unit === 'тиб' || unit === 'тіб') return value_num * 1024;
      if (unit === 'gb' || unit === 'gib' || unit === 'гб' || unit === 'гиб') return value_num;
      if (unit === 'mb' || unit === 'mib' || unit === 'мб') return value_num / 1024;
      return value_num / 1048576;
    }
    var plain = text.match(/(\d{7,})/);
    if (plain) return (parseFloat(plain[1]) || 0) / 1073741824;
    return 0;
  }

  function sizeText(gb) {
    var value = parseFloat(gb) || 0;
    if (value <= 0) return '';
    if (value < 1) return Math.round(value * 1024) + ' ' + t('mb');
    if (value < 10) return (Math.round(value * 10) / 10) + ' ' + t('gb');
    return Math.round(value) + ' ' + t('gb');
  }

  function dateStamp(value) {
    var text = clean(value);
    if (!text) return 0;
    var dmy = text.match(/(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})/);
    if (dmy) {
      var year = parseInt(dmy[3], 10) || 0;
      if (year < 100) year += 2000;
      var stamp = Date.UTC(year, (parseInt(dmy[2], 10) || 1) - 1, parseInt(dmy[1], 10) || 1);
      return isNaN(stamp) ? 0 : stamp;
    }
    var iso = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) {
      var iso_stamp = Date.UTC(parseInt(iso[1], 10), (parseInt(iso[2], 10) || 1) - 1, parseInt(iso[3], 10) || 1);
      return isNaN(iso_stamp) ? 0 : iso_stamp;
    }
    var parsed = Date.parse(text);
    return isNaN(parsed) ? 0 : parsed;
  }

  /* ----------------------- разбор названия -------------------------- */

  var QUALITY_ORDER = [2160, 1080, 720, 480];

  var SOURCE_LABEL = {
    remux: 'src_remux',
    bluray: 'src_bluray',
    webdl: 'src_webdl',
    web: 'src_web',
    hdrip: 'src_hdrip',
    hdtv: 'src_hdtv',
    dvd: 'src_dvd',
    cam: 'src_cam',
    unknown: 'src_unknown'
  };

  var VOICE_LABEL = {
    dub: 'voice_dub',
    mvo: 'voice_mvo',
    dvo: 'voice_dvo',
    avo: 'voice_avo',
    sub: 'voice_sub',
    orig: 'voice_orig',
    unknown: 'voice_unknown'
  };

  function parseTitle(title) {
    var raw = String(title == null ? '' : title);
    var up = raw.toUpperCase().replace(/_/g, ' ');

    var out = {
      quality: 0,
      source: 'unknown',
      voice: 'unknown',
      rus: false,
      hdr: false,
      hdr10plus: false,
      dv: false,
      codec: '',
      audio: '',
      channels: false,
      three_d: false,
      cam: false,
      repack: false,
      sample: false,
      pack: false,
      season: 0,
      episode: 0
    };

    if (/(2160P|\bUHD\b|\b4K\b|ULTRA ?HD)/.test(up)) out.quality = 2160;
    else if (/(1080[PI]|\bFULLHD\b|\bFHD\b|1080\b)/.test(up)) out.quality = 1080;
    else if (/(720[PI]|720\b)/.test(up)) out.quality = 720;
    else if (/(480P|576P|\bSD\b|DVDRIP|VHSRIP)/.test(up)) out.quality = 480;

    if (/REMUX/.test(up)) out.source = 'remux';
    else if (/(BLU-?RAY|BDRIP|BRRIP|BDMV|\bBD\b)/.test(up)) out.source = 'bluray';
    else if (/(WEB-?DL|WEBDL)/.test(up)) out.source = 'webdl';
    else if (/(WEB-?RIP|\bWEB\b|\bAMZN\b|NETFLIX|\bNF\b|\bDSNP\b|\bATVP\b|\bHMAX\b)/.test(up)) out.source = 'web';
    else if (/(HD-?RIP|HDTVRIP|DVDSCR)/.test(up)) out.source = 'hdrip';
    else if (/(HDTV|SATRIP|IPTV|TVRIP)/.test(up)) out.source = 'hdtv';
    else if (/(DVD-?RIP|DVD5|DVD9|\bDVD\b)/.test(up)) out.source = 'dvd';

    if (/(CAMRIP|\bCAM\b|\bTS\b|TELESYNC|\bTC\b|TELECINE|SCREENER|\bSCR\b|WORKPRINT|ЭКРАНКА|КИНОТЕАТР)/.test(up)) {
      out.cam = true;
      out.source = 'cam';
    }

    if (/(HDR10 ?\+|HDR10PLUS|HDR ?\+)/.test(up)) {
      out.hdr = true;
      out.hdr10plus = true;
    } else if (/(\bHDR\b|\bHDR10\b|\bPQ10\b|\bHLG\b)/.test(up)) {
      out.hdr = true;
    }
    if (/(DOLBY ?VISION|\bDOVI\b|\bDV\b)/.test(up)) {
      out.dv = true;
      out.hdr = true;
    }

    if (/\bAV1\b/.test(up)) out.codec = 'av1';
    else if (/(HEVC|H ?\.? ?265|X ?\.? ?265)/.test(up)) out.codec = 'hevc';
    else if (/(\bAVC\b|H ?\.? ?264|X ?\.? ?264)/.test(up)) out.codec = 'avc';
    else if (/(XVID|DIVX)/.test(up)) out.codec = 'xvid';

    if (/ATMOS/.test(up)) out.audio = 'atmos';
    else if (/TRUE-?HD/.test(up)) out.audio = 'truehd';
    else if (/(DTS-?HD|DTS-?X|DTS-?MA)/.test(up)) out.audio = 'dtshd';
    else if (/\bDTS\b/.test(up)) out.audio = 'dts';
    else if (/(E-?AC-?3|\bDDP\d?|\bDD\+)/.test(up)) out.audio = 'eac3';
    else if (/(\bAC-?3\b|DOLBY ?DIGITAL|\bDD\b)/.test(up)) out.audio = 'ac3';
    else if (/\bAAC\b/.test(up)) out.audio = 'aac';
    else if (/(\bMP3\b|\bOPUS\b|\bFLAC\b)/.test(up)) out.audio = 'other';
    if (/(5\.1|7\.1|6CH|8CH)/.test(up)) out.channels = true;

    if (/(ДУБЛИР|ДУБЛЯЖ|\bDUB\b|DUBBING|ITUNES|\bИТУНЕС\b)/.test(up)) out.voice = 'dub';
    else if (/(МНОГОГОЛОС|\bMVO\b|\bMULTI\b)/.test(up)) out.voice = 'mvo';
    else if (/(ДВУХГОЛОС|\bDVO\b)/.test(up)) out.voice = 'dvo';
    else if (/(ОДНОГОЛОС|\bAVO\b|\bVO\b)/.test(up)) out.voice = 'avo';
    else if (/(СУБТИТР|\bSUBS?\b|SUBBED|ENG ?SUB)/.test(up)) out.voice = 'sub';
    else if (/(ORIGINAL|ОРИГИНАЛ|\bENG\b|\bENGLISH\b|\bJAP\b|\bKOR\b)/.test(up)) out.voice = 'orig';

    out.rus = /[А-ЯЁ]/.test(up) || /(\bRUS\b|\bРУС\b|\bMULTI\b)/.test(up);
    if (out.voice === 'dub' || out.voice === 'mvo' || out.voice === 'dvo' || out.voice === 'avo') out.rus = true;

    out.three_d = /(\b3D\b|HSBS|HALF-?SBS|\bSBS\b|ANAGLYPH|АНАГЛИФ|HALF-?OU)/.test(up);
    out.repack = /(REPACK|\bPROPER\b|\bRERIP\b)/.test(up);
    out.sample = /(\bSAMPLE\b|ТРЕЙЛЕР|\bTRAILER\b|\bTEASER\b)/.test(up);

    var season = up.match(/\bS(\d{1,2}) ?E\d{1,3}\b/) || up.match(/\bS(\d{1,2})\b/) ||
      up.match(/(\d{1,2}) ?СЕЗОН/) || up.match(/СЕЗОН ?(\d{1,2})/);
    if (season) out.season = parseInt(season[1], 10) || 0;

    var episode = up.match(/\bS\d{1,2} ?E(\d{1,3})\b/) || up.match(/\bE(\d{1,3})\b/) || up.match(/(\d{1,3}) ?СЕРИЯ/);
    if (episode) out.episode = parseInt(episode[1], 10) || 0;

    out.pack = /(СЕРИИ|СЕРИЙ|EPISODES|СЕЗОН|ИЗ ?\d{1,3})/.test(up) || (out.season > 0 && !out.episode);

    return out;
  }

  /* --------------------------- оценка ------------------------------- */

  var SIZE_RANGE = {
    2160: [10, 100],
    1080: [1.6, 35],
    720: [0.7, 14],
    480: [0.25, 6],
    0: [0.5, 40]
  };

  function prefs() {
    return {
      quality: String(get(STORE.quality, 'auto')),
      profile: String(get(STORE.profile, 'tv')),
      lang: String(get(STORE.lang, 'ru')),
      hevc: get(STORE.hevc, true) !== false,
      hdr: get(STORE.hdr, true) !== false
    };
  }

  function score(item, pref) {
    var info = item.info;
    var base = { 2160: 1000, 1080: 820, 720: 540, 480: 260 };
    var value = info.quality ? base[info.quality] : 430;

    var profileQuality = { tv: 1080, phone: 720, '4k': 2160 };
    var selectedQuality = pref.quality !== 'auto' ? pref.quality : (profileQuality[pref.profile] ? String(profileQuality[pref.profile]) : 'auto');
    if (selectedQuality !== 'auto') {
      var want = parseInt(selectedQuality, 10) || 0;
      if (want && info.quality) {
        if (info.quality === want) {
          value += 300;
        } else {
          var step = Math.abs(QUALITY_ORDER.indexOf(want) - QUALITY_ORDER.indexOf(info.quality));
          value -= (info.quality > want ? 260 : 340) * step;
        }
      }
    }

    var src = {
      remux: 260, bluray: 210, webdl: 225, web: 150,
      hdrip: 60, hdtv: 20, dvd: 5, cam: -5000, unknown: 110
    };
    if (src[info.source] != null) value += src[info.source];

    if (item.seeds > 0) {
      value += Math.round(200 * Math.min(1, Math.log(1 + item.seeds) / Math.log(61)));
      if (item.peers > 0) value += Math.min(30, Math.round(item.seeds / item.peers * 10));
    } else {
      value -= 650;
    }

    var aud = { atmos: 90, truehd: 70, dtshd: 60, dts: 40, eac3: 25, ac3: 15, aac: 5, other: 0 };
    if (info.audio && aud[info.audio] != null) value += aud[info.audio];
    if (info.channels) value += 15;

    if (pref.hdr) {
      if (info.dv) value += 90;
      else if (info.hdr10plus) value += 70;
      else if (info.hdr) value += 55;
    } else if (info.hdr || info.dv) {
      value -= 80;
    }

    if (pref.hevc && (info.codec === 'hevc' || info.codec === 'av1')) value += 70;
    if (info.codec === 'xvid') value -= 120;

    if (pref.lang === 'ru') {
      if (info.voice === 'dub') value += 150;
      else if (info.voice === 'mvo') value += 105;
      else if (info.voice === 'dvo') value += 60;
      else if (info.voice === 'avo') value += 25;
      else if (info.voice === 'sub') value -= 130;
      if (!info.rus) value -= 280;
    } else if (pref.lang === 'orig') {
      if (info.voice === 'orig') value += 130;
      else if (info.voice === 'dub') value -= 70;
    } else if (info.voice === 'dub') {
      value += 25;
    }

    if (item.size > 0) {
      var range = SIZE_RANGE[info.quality] || SIZE_RANGE[0];
      if (item.size < range[0]) value -= 140;
      else if (item.size > range[1]) value -= 70;
      else value += 45;
      value += Math.min(60, Math.round(item.size * 2));
    }

    if (info.repack) value += 40;
    if (info.three_d) value -= 320;
    if (info.sample) value -= 5000;

    if (item.date) {
      var days = (Date.now() - item.date) / 86400000;
      if (days >= 0 && days < 400) value += Math.round(30 * (1 - days / 400));
    }
    if (item.bitrate) value += 10;

    return value;
  }

  /* ------------------- подготовка и фильтрация ---------------------- */

  function prepare(list, pref) {
    var out = [];
    var use = pref || prefs();
    for (var i = 0; i < list.length; i++) {
      var raw = list[i] || {};
      var item = {
        origin: raw.origin || null,
        index: i,
        title: clean(raw.title),
        size: sizeGb(raw.size),
        seeds: num(raw.seeds),
        peers: num(raw.peers),
        tracker: clean(raw.tracker),
        date: raw.date ? dateStamp(raw.date) : 0,
        bitrate: clean(raw.bitrate),
        viewed: !!raw.viewed,
        image: raw.image || '',
        progress: Math.max(0, Math.min(100, parseFloat(raw.progress) || (raw.viewed ? 100 : 0))),
        tmdb_name: raw.tmdb_name || '',
        tmdb_overview: raw.tmdb_overview || ''
      };
      item.info = parseTitle(item.title);
      item.score = score(item, use);
      out.push(item);
    }
    return out;
  }

  function limits() {
    return {
      minseeds: parseInt(get(STORE.minseeds, 0), 10) || 0,
      maxsize: parseFloat(get(STORE.maxsize, 0)) || 0,
      hidecam: get(STORE.hidecam, true) !== false,
      hide3d: get(STORE.hide3d, true) !== false,
      limit: parseInt(get(STORE.limit, 0), 10) || 0
    };
  }

  function picks() {
    return {
      sort: String(get(STORE.pick_sort, 'best')),
      quality: String(get(STORE.pick_quality, 'all')),
      voice: String(get(STORE.pick_voice, 'all')),
      source: String(get(STORE.pick_source, 'all')),
      tracker: String(get(STORE.pick_tracker, 'all'))
    };
  }

  function fits(item, pick, lim) {
    if (lim.hidecam && item.info.cam) return false;
    if (lim.hide3d && item.info.three_d) return false;
    if (lim.minseeds > 0 && item.seeds < lim.minseeds) return false;
    if (lim.maxsize > 0 && item.size > lim.maxsize) return false;
    if (pick.quality !== 'all' && String(item.info.quality) !== pick.quality) return false;
    if (pick.voice !== 'all' && item.info.voice !== pick.voice) return false;
    if (pick.source !== 'all' && item.info.source !== pick.source) return false;
    if (pick.tracker !== 'all' && item.tracker.toLowerCase() !== pick.tracker.toLowerCase()) return false;
    return true;
  }

  function sortList(list, mode) {
    var out = list.slice(0);
    out.sort(function (a, b) {
      var diff = 0;
      if (mode === 'seeds') diff = b.seeds - a.seeds;
      else if (mode === 'size_desc') diff = b.size - a.size;
      else if (mode === 'size_asc') diff = a.size - b.size;
      else if (mode === 'date') diff = b.date - a.date;
      else diff = b.score - a.score;
      if (diff) return diff > 0 ? 1 : -1;
      if (b.score !== a.score) return b.score > a.score ? 1 : -1;
      return a.index - b.index;
    });
    return out;
  }

  function facets(list) {
    var out = { quality: {}, voice: {}, source: {}, tracker: {} };
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var q = String(item.info.quality);
      out.quality[q] = (out.quality[q] || 0) + 1;
      out.voice[item.info.voice] = (out.voice[item.info.voice] || 0) + 1;
      out.source[item.info.source] = (out.source[item.info.source] || 0) + 1;
      if (item.tracker) out.tracker[item.tracker] = (out.tracker[item.tracker] || 0) + 1;
    }
    return out;
  }

  function evaluate(raw_list) {
    var all = prepare(raw_list || [], prefs());
    var pick = picks();
    var lim = limits();

    var kept = [];
    for (var i = 0; i < all.length; i++) {
      if (fits(all[i], pick, lim)) kept.push(all[i]);
    }

    var ranked = sortList(kept, 'best');
    var best = ranked.length ? ranked[0] : null;
    var top = best ? best.score : 0;

    var sorted = pick.sort === 'best' ? ranked : sortList(kept, pick.sort);
    for (var j = 0; j < sorted.length; j++) {
      var rate = top > 0 ? Math.round(100 * sorted[j].score / top) : 0;
      sorted[j].rate = Math.max(1, Math.min(100, rate));
      sorted[j].best = sorted[j] === best;
    }

    return {
      all: all,
      list: lim.limit > 0 ? sorted.slice(0, lim.limit) : sorted,
      total: all.length,
      kept: sorted.length,
      best: best,
      facets: facets(all),
      pick: pick
    };
  }

  /* ------------------------- инфраструктура ------------------------- */

  var scrolls = [];

  function hookScroll() {
    if (!window.Lampa || !Lampa.Scroll || Lampa.Scroll.nova_tor_wrapped) return;
    var real = Lampa.Scroll;

    function Wrapped(params) {
      var inst = new real(params);
      scrolls.unshift(inst);
      if (scrolls.length > 6) scrolls.pop();
      return inst;
    }

    Wrapped.nova_tor_wrapped = true;
    for (var key in real) Wrapped[key] = real[key];
    Wrapped.prototype = real.prototype;
    Lampa.Scroll = Wrapped;
  }

  function activeScroll(node) {
    for (var i = 0; i < scrolls.length; i++) {
      try {
        var render = scrolls[i].render();
        if (render && render.length && $.contains(render[0], node)) return scrolls[i];
      } catch (e) {}
    }
    return null;
  }

  function scrollTo(element) {
    var node = element && element[0] ? element[0] : element;
    if (!node) return;

     /* Полноэкранные окна Nova не используют стандартный .scroll Lampa.
        На Android TV фокус уже переходит на selector, но контейнер нужно
        прокручивать вручную, иначе выбранная серия остаётся за экраном. */
     try {
       var modal_panel = $(node).closest('.nova-tor-modal__panel');
       if (modal_panel.length && modal_panel[0]) {
         var panel_node = modal_panel[0];
         var node_rect = node.getBoundingClientRect();
         var panel_rect = panel_node.getBoundingClientRect();
         var margin = Math.max(24, Math.round(panel_rect.height * 0.12));
         if (node_rect.top < panel_rect.top + margin) {
           panel_node.scrollTop = Math.max(0, panel_node.scrollTop - (panel_rect.top + margin - node_rect.top));
         } else if (node_rect.bottom > panel_rect.bottom - margin) {
           panel_node.scrollTop += node_rect.bottom - (panel_rect.bottom - margin);
         }
         return;
       }
     } catch (e) {}

    var scroll = activeScroll(node);
    if (scroll && typeof scroll.update === 'function') {
      try {
        scroll.update($(node), true);
        return;
      } catch (e) {}
    }

    try {
      var box = $(node).closest('.scroll');
      if (!box.length) return;
      var body = box.find('.scroll__body').first();
      if (!body.length) return;
      var top = node.getBoundingClientRect().top - box[0].getBoundingClientRect().top;
      if (top > -1 && top < box[0].offsetHeight * 0.6) return;
      var style = body[0].style['-webkit-transform'] || body[0].style.transform || '';
      if (style.indexOf('translate') !== -1) {
        var pair = style.match(/-?[\d.]+px, *(-?[\d.]+)px/);
        var now = pair ? parseFloat(pair[1]) || 0 : 0;
        var next = Math.min(0, Math.round(now - top + 20));
        body[0].style['-webkit-transform'] = 'translate3d(0px, ' + next + 'px, 0px)';
        body[0].style.transform = 'translate3d(0px, ' + next + 'px, 0px)';
      } else {
        box[0].scrollTop = Math.max(0, box[0].scrollTop + top - 20);
      }
    } catch (e) {}
  }

  /* --------------------------- состояние ---------------------------- */

  var ui = {};
  var host = null;
  var page_info = null;
  var tmdb_cache = {};
  var image_cache = {};
  var tmdb_loading = {};
  var tmdb_resolving = {};
  var tmdb_search_cache = {};
  var natives = [];
  var data = null;
  var signature = '';
  var observer = null;
  var observed = null;
  var timer = null;
  var mutating = false;
  var played = '';
  var emergency_off = false;
  var fault_count = 0;
  var fault_started = 0;
  var fault_last = '';
  var fault_timer = null;
   var modal_return_focus = null;

  function purgeLegacyNova() {
    var ids = ['nova-tor-css', 'nova-tor-css-v5'];
    for (var i = 0; i < ids.length; i++) {
      try { var style = document.getElementById(ids[i]); if (style && style.parentNode) style.parentNode.removeChild(style); } catch (e) {}
    }
    try {
      $('.nova-tor').each(function () {
        var node = $(this), parent = node.parent();
        node.remove();
        parent.find('.nova-tor-hidden').removeClass('nova-tor-hidden');
      });
    } catch (e) {}
  }

  function emergencyMessage() {
    try {
      if (Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show('Nova Torrents отключён из-за ошибки');
    } catch (e) {}
  }

  function emergencyDisable(error) {
    if (emergency_off) return;
    emergency_off = true;
    fault_last = String(error && (error.stack || error.message) || error || 'unknown');
    try { save(STORE.enabled, false); } catch (e) {}
    try { detach(); } catch (e) {}
    emergencyMessage();
    try { if (window.console && console.warn) console.warn('[Nova Torrents] emergency shutdown', fault_last); } catch (e) {}
  }

  function fault(error, label) {
    var now = Date.now();
    if (!fault_started || now - fault_started > 10000) {
      fault_started = now;
      fault_count = 0;
    }
    fault_count++;
    fault_last = String(label || '') + ': ' + String(error && (error.stack || error.message) || error || 'unknown');
    if (fault_count >= 3) emergencyDisable(error);
  }

  function guard(fn, label) {
    if (emergency_off) return false;
    try { fn(); return true; } catch (e) { fault(e, label); return false; }
  }

  function recoverEmergency() {
    emergency_off = false;
    fault_count = 0;
    fault_started = 0;
    fault_last = '';
    played = '';
  }

  function scope() {
    if (emergency_off || !enabled()) return null;
    if (!window.Lampa || !window.$) return null;

    var current;
    try { current = Lampa.Activity.active(); } catch (e) { return null; }
    if (!current || !current.activity) return null;

    /* Не полагаемся на имя компонента: в разных сборках Lampa это
       online, torrent, lampac или имя конкретного источника. Наличие
       .torrent-item ниже является безопасным фактическим признаком. */
    var box;
    try { box = current.activity.render(); } catch (e) { return null; }
    if (!box || !box.length) return null;
    if (!box.hasClass('explorer')) {
      var inner = box.find('.explorer').first();
      if (inner.length) box = inner;
    }

    var body = box.find('.explorer__files-body .scroll__body').first();
    if (!body.length) body = box.find('.scroll__body').first();
    if (!body.length) return null;
    if (foreignSkinPresent(body)) return null;
    if (!body.find('.torrent-item').length) return null;

    var movie = current.movie || current.card || current.data || current;
    return { root: box, body: body, movie: movie };
  }

  function progressValue(origin, raw) {
    var value = 0;
    try {
      var line = origin.find('.time-line').first();
      var hash = line.attr('data-hash') || line.attr('data-id') || '';
      if (hash && window.Lampa && Lampa.Timeline && typeof Lampa.Timeline.view === 'function') {
        value = num(Lampa.Timeline.view(hash).percent);
      }
      if (!value) {
        var style = line.children('div').first().attr('style') || '';
        var match = style.match(/([\d.]+)%/);
        if (match) value = parseFloat(match[1]) || 0;
      }
    } catch (e) {}
    if (!value) {
      try { value = parseFloat(origin.attr('data-progress')) || 0; } catch (e) {}
    }
    if (!value && raw) value = raw.progress != null ? parseFloat(raw.progress) || 0 : 0;
    if (origin.find('.torrent-item__viewed').length || origin.hasClass('torrent-item--viewed')) value = 100;
    return Math.max(0, Math.min(100, value));
  }

  function readItem(node) {
    var origin = $(node);

    function pick(list) {
      for (var i = 0; i < list.length; i++) {
        var found = origin.find(list[i]).first();
        if (found.length) {
          var value = clean(found.text());
          if (value) return value;
        }
      }
      return '';
    }

    var full = clean(origin.text());

    var title = pick(['.torrent-item__title', '.torrent-item__name']);
    if (!title) {
      var head = origin.children().first();
      title = clean(head.length ? head.text() : full);
    }

    var size = pick(['.torrent-item__size', '.torrent-item__weight']);
    if (!size) {
      var size_found = full.match(/(\d+(?:[.,]\d+)?) *(TB|GB|MB|ТБ|ГБ|МБ)/i);
      size = size_found ? size_found[0] : '';
    }

    var seeds = pick(['.torrent-item__seeds span', '.torrent-item__seeds', '.torrent-item__seeders']);
    if (!seeds) {
      var seed_found = full.match(/(?:^| )S[: ]*(\d+)/i);
      seeds = seed_found ? seed_found[1] : '0';
    }

    var peers = pick(['.torrent-item__grabs span', '.torrent-item__grabs', '.torrent-item__peers', '.torrent-item__leech']);
    if (!peers) {
      var peer_found = full.match(/(?:^| )L[: ]*(\d+)/i);
      peers = peer_found ? peer_found[1] : '0';
    }

    var raw = null;
    try { raw = origin.data('item') || origin.data('torrent') || null; } catch (e) { raw = null; }
    if (raw && typeof raw === 'object') {
      if (raw.Title || raw.title) title = clean(raw.Title || raw.title);
      if (raw.Size || raw.size) size = raw.Size || raw.size;
      if (raw.Seeders != null) seeds = raw.Seeders;
      if (raw.Peers != null) peers = raw.Peers;
      if (raw.Tracker) raw.tracker_name = clean(raw.Tracker);
    }

    return {
      origin: origin,
      title: title,
      size: size,
      seeds: seeds,
      peers: peers,
      tracker: pick(['.torrent-item__tracker', '.torrent-item__trackers', '.torrent-item__source']) ||
        (raw && raw.tracker_name ? raw.tracker_name : ''),
      date: pick(['.torrent-item__date', '.torrent-item__age', '.torrent-item__time']),
      bitrate: pick(['.torrent-item__bitrate', '.torrent-item__ffprobe']),
      viewed: origin.find('.torrent-item__viewed').length > 0 || origin.hasClass('torrent-item--viewed'),
       image: raw && (raw.image || raw.poster || raw.img) ? (raw.image || raw.poster || raw.img) :
         raw && raw.poster_path ? tmdbImage(raw.poster_path, 'w300') :
         raw && raw.backdrop_path ? tmdbImage(raw.backdrop_path, 'w500') :
         imageFromNode(origin),
      progress: progressValue(origin, raw)
    };
  }

  function collect() {
    var list = [];
    if (!host) return list;
    host.find('.torrent-item').each(function () {
      var node = $(this);
      if (node.closest('.nova-tor').length) return;
      list.push(node);
    });
    return list;
  }

  function stamp(list) {
    var parts = ['n' + list.length];
    for (var i = 0; i < list.length; i++) {
      if (i > 3 && i < list.length - 2) continue;
      parts.push(clean(list[i].text()).slice(0, 60));
    }
    return parts.join('|');
  }

  /* ------------------------------ ввод ------------------------------ */

  function bind(element, enter, long) {
    var fired = 0;

    function fire() {
      if (typeof enter !== 'function') return;
      var now = Date.now();
      if (now - fired < 500) return;
      fired = now;
      enter();
    }

    element.on('hover:enter', function (e) {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      fire();
    });
    element.on('click', function (e) {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      fire();
    });
    element.on('hover:focus', function () {
      scrollTo(element);
    });
    if (typeof long === 'function') {
      element.on('hover:long', function (e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        long();
      });
    }
    return element;
  }

  function focusKeyed(key) {
    if (!ui.root || !ui.root.length) return;
    var target = key ? ui.root.find('[data-key="' + key + '"]').first() : $();
    if (!target || !target.length) target = ui.root.find('.nova-tor__best').first();
    if (!target.length) target = ui.root.find('.nova-tor-card').first();
    if (!target.length) target = ui.root.find('.nova-tor__chip').first();
    if (!target.length) return;
    try {
      Lampa.Controller.collectionFocus(target[0], activeScroll(target[0]));
    } catch (e) {}
    scrollTo(target);
  }

  function launch(item) {
    if (!item || !item.origin || !item.origin.length) return;
    try { item.origin.trigger('hover:enter'); } catch (e) {}
  }

  function context(item) {
    if (!item || !item.origin || !item.origin.length) return;
    try { item.origin.trigger('hover:long'); } catch (e) {}
  }

  function menu(title, list, current, onPick, back_key) {
    if (!list || !list.length) return;
    var items = [];
    for (var i = 0; i < list.length; i++) {
      items.push({
        title: list[i].title,
        value: list[i].value,
        selected: String(list[i].value) === String(current)
      });
    }
    try {
      Lampa.Select.show({
        title: title,
        items: items,
        onBack: function () {
          try { Lampa.Controller.toggle('content'); } catch (e) {}
          focusKeyed(back_key);
        },
        onSelect: function (selected) {
          try { Lampa.Controller.toggle('content'); } catch (e) {}
          onPick(selected.value);
        }
      });
    } catch (e) {}
  }

  /* ---------------------------- разметка ---------------------------- */

  function badges(item) {
    var out = [];
    if (item.info.quality) out.push(item.info.quality === 2160 ? '4K' : item.info.quality + 'p');
    if (item.info.dv) out.push('DV');
    else if (item.info.hdr10plus) out.push('HDR10+');
    else if (item.info.hdr) out.push('HDR');
    if (item.info.source !== 'unknown') out.push(t(SOURCE_LABEL[item.info.source]));
    if (item.info.codec === 'hevc') out.push('HEVC');
    else if (item.info.codec === 'av1') out.push('AV1');
    if (item.info.audio === 'atmos') out.push('Atmos');
    else if (item.info.audio === 'truehd') out.push('TrueHD');
    else if (item.info.audio === 'dtshd') out.push('DTS-HD');
    if (item.info.three_d) out.push('3D');
    return out;
  }

  function badgeHtml(list) {
    var html = '';
    for (var i = 0; i < list.length; i++) {
      html += '<span class="nova-tor-badge">' + esc(list[i]) + '</span>';
    }
    return html;
  }

  function qualityBadge(item) {
    var q = item.info.quality === 2160 ? '4K' : item.info.quality ? item.info.quality + 'p' : 'HD';
    var cls = item.info.quality === 2160 ? 'nova-tor-quality nova-tor-quality--4k' : 'nova-tor-quality';
    return '<span class="' + cls + '">' + esc(q) + '</span>';
  }

  function healthBadge(item) {
    var cls = item.seeds > 20 ? 'nova-tor-health nova-tor-health--good' : item.seeds > 0 ? 'nova-tor-health nova-tor-health--weak' : 'nova-tor-health nova-tor-health--dead';
    var text = item.seeds > 0 ? item.seeds + ' S' : t('dead');
    return '<span class="' + cls + '">' + esc(text) + '</span>';
  }

  function sourceBadge(item) {
    var key = SOURCE_LABEL[item.info.source] || 'src_unknown';
    return '<span class="nova-tor-source">' + esc(t(key)) + '</span>';
  }

  var CACHE_META_KEY = 'nova_tor_cache_meta';

  function cacheMeta() {
    var value = localCacheGet(CACHE_META_KEY);
    return value && typeof value === 'object' ? value : {};
  }

  function touchCacheKey(key) {
    if (!key || key === CACHE_META_KEY) return;
    var meta = cacheMeta();
    meta[key] = Date.now();
    try { Lampa.Storage.set(CACHE_META_KEY, meta); } catch (e) {}
  }

  function removeCacheKey(key) {
    try { if (window.localStorage) window.localStorage.removeItem(key); } catch (e) {}
    try { if (Lampa.Storage && typeof Lampa.Storage.set === 'function') Lampa.Storage.set(key, null); } catch (e) {}
  }

  function cacheTtlDays() {
    return parseInt(get(STORE.cache_ttl, '90'), 10) || 0;
  }

  function cleanupOldCache() {
    var days = cacheTtlDays();
    if (!days) return 0;
    var meta = cacheMeta();
    var limit = Date.now() - days * 86400000;
    var removed = 0;
    var changed = false;
    for (var key in meta) {
      if (!Object.prototype.hasOwnProperty.call(meta, key)) continue;
      if (meta[key] && meta[key] < limit && (key.indexOf('nova_tor_tmdb_') === 0 || key.indexOf('nova_tor_frame_') === 0)) {
        removeCacheKey(key);
        delete meta[key];
        removed++;
        changed = true;
      }
    }
    if (changed) { try { Lampa.Storage.set(CACHE_META_KEY, meta); } catch (e) {} }
    return removed;
  }

  function localCacheGet(key) {
    try {
      var value = Lampa.Storage.get(key, null);
      return value || null;
    } catch (e) { return null; }
  }

  function localCacheSet(key, value) {
    try { Lampa.Storage.set(key, value); } catch (e) {}
    touchCacheKey(key);
  }

  function imageCacheKey(url) {
    return 'nova_tor_frame_' + encodeURIComponent(String(url || '')).slice(0, 180);
  }

  function cacheImage(url) {
    url = String(url || '');
    if (!url || image_cache[url] || !window.XMLHttpRequest) return;
    var saved = localCacheGet(imageCacheKey(url));
    if (saved) { image_cache[url] = saved; return; }
    image_cache[url] = 'loading';
    var xhr;
    try { xhr = new XMLHttpRequest(); } catch (e) { delete image_cache[url]; return; }
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.timeout = 12000;
    xhr.onload = function () {
      if (xhr.status < 200 || xhr.status >= 300 || !xhr.response || !window.FileReader) {
        delete image_cache[url];
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var data_url = String(reader.result || '');
        if (data_url.length > 16) {
          image_cache[url] = data_url;
          localCacheSet(imageCacheKey(url), data_url);
        } else delete image_cache[url];
      };
      try { reader.readAsDataURL(xhr.response); } catch (e) { delete image_cache[url]; }
    };
    xhr.onerror = xhr.ontimeout = function () { delete image_cache[url]; };
    try { xhr.send(); } catch (e) { delete image_cache[url]; }
  }

  function hydrateCachedImages() {
    if (!ui.root || !ui.root.length) return;
    ui.root.find('img[data-nova-tor-frame]').each(function () {
      var image = $(this);
      var url = image.attr('data-nova-tor-frame') || '';
      if (!url) return;
      var saved = image_cache[url] || localCacheGet(imageCacheKey(url));
      if (saved && saved !== 'loading') image.attr('src', saved);
    });
  }

  function clearTmdbCache() {
    var removed = 0;
    tmdb_cache = {};
    tmdb_loading = {};
    image_cache = {};
    try { Lampa.Storage.set(CACHE_META_KEY, {}); } catch (e) {}
    try {
      if (window.localStorage) {
        var keys = [];
        for (var i = 0; i < window.localStorage.length; i++) {
          var key = window.localStorage.key(i) || '';
          if (key.indexOf('nova_tor_tmdb_') === 0 || key.indexOf('nova_tor_frame_') === 0) keys.push(key);
        }
        for (var j = 0; j < keys.length; j++) {
          try { window.localStorage.removeItem(keys[j]); removed++; } catch (e) {}
        }
      }
    } catch (e) {}
    try {
      if (Lampa.Storage && typeof Lampa.Storage.set === 'function') {
        Lampa.Storage.set('nova_tor_cache_clear_stamp', Date.now());
      }
    } catch (e) {}
    return removed;
  }

  function tmdbKey() {
    var value = clean(get(STORE.tmdb_key, ''));
    if (value) return value;
    var keys = ['tmdb_api_key', 'tmdb_key', 'tmdb_token'];
    for (var i = 0; i < keys.length; i++) {
      value = clean(get(keys[i], ''));
      if (value) return value;
    }
    return '';
  }

  function tmdbLanguage() {
    var value = clean(get(STORE.tmdb_lang, ''));
    if (value) return value;
    return langCode() === 'ru' ? 'ru-RU' : 'en-US';
  }

  function tmdbId() {
    var movie = page_info && page_info.movie || {};
    var keys = ['tmdb_id', 'tmdbId', 'id_tmdb', 'tmdb', 'id'];
    for (var i = 0; i < keys.length; i++) {
      var value = movie[keys[i]];
      if (value != null && /^\d+$/.test(String(value))) return String(value);
    }
    var nested = [movie.ids, movie.external_ids, movie.source];
    for (var n = 0; n < nested.length; n++) {
      if (!nested[n]) continue;
      var nested_value = nested[n].tmdb || nested[n].tmdb_id || nested[n].id_tmdb;
      if (nested_value != null && /^\d+$/.test(String(nested_value))) return String(nested_value);
    }
    return '';
  }

  function tmdbRequest(url, done) {
    if (!window.XMLHttpRequest) return;
    var xhr;
    try { xhr = new XMLHttpRequest(); } catch (e) { return; }
    var closed = false;
    var finish = function (value) {
      if (closed) return;
      closed = true;
      done(value || null);
    };
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try { finish(JSON.parse(xhr.responseText)); } catch (e) { finish(null); }
      } else finish(null);
    };
    try {
      xhr.open('GET', url, true);
      xhr.timeout = 9000;
      xhr.ontimeout = function () { finish(null); };
      xhr.onerror = function () { finish(null); };
      xhr.send();
    } catch (e) { finish(null); }
  }

  function tmdbImage(path, size) {
    if (!path) return '';
     if (/^(https?:)?\/\//i.test(String(path))) return normalizeImageUrl(path);
     if (String(path).indexOf('/t/p/') === 0) return 'https://image.tmdb.org' + path;
    return 'https://image.tmdb.org/t/p/' + (size || 'w300') + path;
  }

  function tmdbSearchTitle() {
    var movie = page_info && page_info.movie || {};
    var title = movieText(movie, ['title', 'name', 'original_title']);
    if (!title && data && data.all && data.all.length) title = data.all[0].title;
    title = clean(title);
    title = title.replace(/\bS\d{1,2}(?:E\d{1,3})?\b/ig, ' ')
      .replace(/\bE\d{1,3}\b/ig, ' ')
      .replace(/\b(2160p|1080p|720p|480p|4k|uhd|fhd|hd|web[- ]?dl|web[- ]?rip|bluray|bdrip|bdremux|remux|hdrip|hdtv|camrip|hevc|h265|h264|x264|x265|av1|hdr10\+?|dolby ?vision|dv|dts[- ]?hd|truehd|atmos|aac|multi|mvo|dvo|avo|dub|original|sub(?:s)?|дубляж|многоголосый|двухголосый|одноголосый|субтитры)\b/ig, ' ')
      .replace(/[._]+/g, ' ').replace(/\s+/g, ' ').trim();
    return title;
  }

  function tmdbSearchYear() {
    var movie = page_info && page_info.movie || {};
    var value = movieText(movie, ['release_date', 'first_air_date', 'year']);
    var found = String(value || '').match(/(19|20)\d{2}/);
    if (found) return found[0];
    var title = data && data.all && data.all.length ? data.all[0].title : '';
    found = String(title || '').match(/(19|20)\d{2}/);
    return found ? found[0] : '';
  }

  function tmdbResolveId(done) {
    var key = tmdbKey();
    var title = tmdbSearchTitle();
    if (!key || !title || typeof done !== 'function') return;
    var cache_key = title.toLowerCase() + ':' + tmdbSearchYear();
    if (tmdb_search_cache[cache_key]) { done(tmdb_search_cache[cache_key]); return; }
    var saved = localCacheGet('nova_tor_search_' + cache_key);
    if (saved && saved.id) { tmdb_search_cache[cache_key] = saved.id; if (page_info && page_info.movie) { page_info.movie.tmdb_id = saved.id; page_info.movie.poster_path = saved.poster_path || page_info.movie.poster_path; page_info.movie.backdrop_path = saved.backdrop_path || page_info.movie.backdrop_path; } done(saved.id); return; }
    if (tmdb_resolving[cache_key]) return;
    tmdb_resolving[cache_key] = true;
    var url = 'https://api.themoviedb.org/3/search/tv?api_key=' + encodeURIComponent(key) +
      '&language=' + encodeURIComponent(tmdbLanguage()) + '&query=' + encodeURIComponent(title) + '&page=1';
    var year = tmdbSearchYear();
    if (year) url += '&first_air_date_year=' + encodeURIComponent(year);
    tmdbRequest(url, function (json) {
      var result = json && json.results && json.results[0];
      if (!result) {
        var fallback = 'https://api.themoviedb.org/3/search/multi?api_key=' + encodeURIComponent(key) +
          '&language=' + encodeURIComponent(tmdbLanguage()) + '&query=' + encodeURIComponent(title) + '&page=1';
        tmdbRequest(fallback, function (multi) {
          var list = multi && multi.results || [];
          for (var i = 0; i < list.length; i++) {
            if (list[i].media_type === 'tv') { result = list[i]; break; }
          }
          tmdb_resolving[cache_key] = false;
          if (!result || !result.id) { done(''); return; }
          tmdb_search_cache[cache_key] = String(result.id);
          localCacheSet('nova_tor_search_' + cache_key, { id: String(result.id), title: result.name || result.original_name || '', poster_path: result.poster_path || '', backdrop_path: result.backdrop_path || '', saved: Date.now() });
          if (page_info && page_info.movie) { page_info.movie.tmdb_id = String(result.id); page_info.movie.poster_path = result.poster_path || page_info.movie.poster_path; page_info.movie.backdrop_path = result.backdrop_path || page_info.movie.backdrop_path; }
          done(String(result.id));
        });
        return;
      }
      tmdb_resolving[cache_key] = false;
      tmdb_search_cache[cache_key] = String(result.id);
      localCacheSet('nova_tor_search_' + cache_key, { id: String(result.id), title: result.name || result.original_name || '', poster_path: result.poster_path || '', backdrop_path: result.backdrop_path || '', saved: Date.now() });
      if (page_info && page_info.movie) { page_info.movie.tmdb_id = String(result.id); page_info.movie.poster_path = result.poster_path || page_info.movie.poster_path; page_info.movie.backdrop_path = result.backdrop_path || page_info.movie.backdrop_path; }
      done(String(result.id));
    });
  }

  function enrichEpisodePosters() {
    var key = tmdbKey();
    var id = tmdbId();
    if (!key || !data || !data.all || !data.all.length) return;
    if (!id) {
      tmdbResolveId(function (resolved) {
        if (!resolved) return;
        try {
          if (page_info && page_info.movie) page_info.movie.tmdb_id = resolved;
        } catch (e) {}
        enrichEpisodePosters();
         if (host && data) {
           render('');
           if (ui.modal && ui.modal.hasClass('nova-tor-calendar-modal')) openCalendarModal(true);
         }
      });
      return;
    }

    var seasons = {};
    for (var i = 0; i < data.all.length; i++) {
      var item = data.all[i];
      var season = item.info.season;
      if (!season || !item.info.episode) continue;
      var cache_key = id + ':' + season;
      if (!seasons[cache_key]) seasons[cache_key] = { season: season, items: [] };
      seasons[cache_key].items.push(item);
    }

    for (var season_key in seasons) {
      if (!Object.prototype.hasOwnProperty.call(seasons, season_key)) continue;
      if (tmdb_cache[season_key] || tmdb_loading[season_key]) continue;
      var saved_season = localCacheGet('nova_tor_tmdb_' + season_key + '_' + tmdbLanguage());
      if (saved_season && saved_season.episodes) {
        tmdb_cache[season_key] = saved_season;
        for (var cached_x = 0; cached_x < seasons[season_key].items.length; cached_x++) {
          for (var cached_y = 0; cached_y < saved_season.episodes.length; cached_y++) {
            if (parseInt(saved_season.episodes[cached_y].episode_number, 10) !== seasons[season_key].items[cached_x].info.episode) continue;
            var cached_path = saved_season.episodes[cached_y].still_path || saved_season.episodes[cached_y].poster_path || '';
            if (cached_path) seasons[season_key].items[cached_x].image = tmdbImage(cached_path, 'w300');
            if (saved_season.episodes[cached_y].name) seasons[season_key].items[cached_x].tmdb_name = saved_season.episodes[cached_y].name;
            if (saved_season.episodes[cached_y].air_date) seasons[season_key].items[cached_x].tmdb_air_date = saved_season.episodes[cached_y].air_date;
            break;
          }
        }
        continue;
      }
      tmdb_loading[season_key] = true;
      (function (cache_key, season_no, season_items) {
        var url = 'https://api.themoviedb.org/3/tv/' + encodeURIComponent(id) + '/season/' + encodeURIComponent(season_no) +
          '?api_key=' + encodeURIComponent(key) + '&language=' + encodeURIComponent(tmdbLanguage());
        tmdbRequest(url, function (json) {
          tmdb_loading[cache_key] = false;
          tmdb_cache[cache_key] = json || { episodes: [] };
          if (json && json.episodes) localCacheSet('nova_tor_tmdb_' + cache_key + '_' + tmdbLanguage(), json);
          var episodes = json && json.episodes || [];
          for (var x = 0; x < season_items.length; x++) {
            for (var y = 0; y < episodes.length; y++) {
              if (parseInt(episodes[y].episode_number, 10) !== season_items[x].info.episode) continue;
              var path = episodes[y].still_path || episodes[y].poster_path || '';
              if (path) season_items[x].image = tmdbImage(path, 'w300');
              if (episodes[y].name && !season_items[x].tmdb_name) season_items[x].tmdb_name = episodes[y].name;
              if (episodes[y].overview && !season_items[x].tmdb_overview) season_items[x].tmdb_overview = episodes[y].overview;
              if (episodes[y].air_date) season_items[x].tmdb_air_date = episodes[y].air_date;
              break;
            }
          }
           if (host && data) {
             render('');
             if (ui.modal && ui.modal.hasClass('nova-tor-calendar-modal')) openCalendarModal(true);
           }
        });
      }(season_key, seasons[season_key].season, seasons[season_key].items));
    }
  }

  function normalizeImageUrl(value) {
     if (value && typeof value === 'object') {
       value = value.url || value.src || value.href || value.path || value.image || '';
     }
     var url = String(value || '').trim();
    if (!url) return '';
     var css_url = url.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
     if (css_url) url = css_url[1];
     if (/^(data:|blob:)/i.test(url)) return url;
    if (url.indexOf('//') === 0) return 'https:' + url;
    if (url.charAt(0) === '/' && url.indexOf('/t/p/') === 0) return 'https://image.tmdb.org' + url;
    try { if (url.charAt(0) === '/' && window.location && window.location.origin) return window.location.origin + url; } catch (e) {}
    return url;
  }

   function imageFromNode(node) {
     var root = node && node.jquery ? node : $(node);
     if (!root || !root.length) return '';
     var values = [];
     function add(value) {
       value = normalizeImageUrl(value);
       if (value && values.indexOf(value) === -1) values.push(value);
     }
     try {
       var attrs = ['data-image', 'data-poster', 'data-img', 'data-src', 'data-original'];
       for (var a = 0; a < attrs.length; a++) add(root.attr(attrs[a]));
       root.find('img').each(function () {
         add($(this).attr('src'));
         add($(this).attr('data-src'));
         add($(this).attr('data-original'));
       });
       var style = root.attr('style') || '';
       var match = style.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
       if (match) add(match[1]);
       root.find('[style*="background-image"]').each(function () {
         var css = $(this).attr('style') || '';
         var found = css.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
         if (found) add(found[1]);
       });
     } catch (e) {}
     return values.length ? values[0] : '';
   }

  function pagePoster() {
    var url = imageUrl(page_info && page_info.movie);
    if (url) return normalizeImageUrl(url);
    try {
       var root = page_info && page_info.root ? page_info.root : $();
       return imageFromNode(root.find('img').not('.torrent-item img').first()) ||
         imageFromNode(root.find('[style*="background-image"]').first()) ||
         imageFromNode(root);
    } catch (e) { return ''; }
  }

  function posterUrl(item) {
    var url = item && item.image ? item.image : '';
    if (!url) url = pagePoster();
    return normalizeImageUrl(url);
  }

  function posterHtml(item, cls) {
    var url = posterUrl(item);
     var fallback = '<span class="' + cls + '--fallback-icon" aria-hidden="true">▶</span>';
     if (!url) return '<div class="' + cls + ' ' + cls + '--fallback">' + fallback + '</div>';
    var progress = Math.max(0, Math.min(100, parseFloat(item && item.progress) || 0));
    var bar = progress > 0 ? '<div class="nova-tor-progress nova-tor-progress--' + (progress >= 90 ? 'done' : 'started') + '"><i style="width:' + progress + '%"></i><b>' + Math.round(progress) + '%</b></div>' : '';
     return '<div class="' + cls + '">' + fallback + '<img src="' + esc(url) + '" data-nova-tor-frame="' + esc(url) + '" onerror="this.style.display=\'none\'" />' + bar + '</div>';
  }

  function metaLine(item) {
    var parts = [];
    var size = sizeText(item.size);
    if (size) parts.push(esc(size));
    if (item.seeds > 0) parts.push('<span class="nova-tor-seed">&#9650; ' + item.seeds + '</span>');
    else parts.push('<span class="nova-tor-seed nova-tor-seed--dead">' + esc(t('dead')) + '</span>');
    if (item.peers > 0) parts.push('<span class="nova-tor-peer">&#9660; ' + item.peers + '</span>');
    if (item.info.voice !== 'unknown') parts.push(esc(t(VOICE_LABEL[item.info.voice])));
    if (item.tracker) parts.push(esc(item.tracker));
    if (item.bitrate) parts.push(esc(item.bitrate));
    return parts.join('<span class="nova-tor-dot">&middot;</span>');
  }

  function chip(key, label, value, active) {
    var node = $('<div class="nova-tor__chip selector" data-key="' + esc(key) + '"></div>');
    if (active) node.addClass('nova-tor__chip--active');
    node.append('<span class="nova-tor__chip-label">' + esc(label) + '</span>');
    if (value) node.append('<span class="nova-tor__chip-value">' + esc(value) + '</span>');
    return node;
  }

  function qualityLabel(value) {
    if (value === 'all') return t('all');
    if (value === '2160') return '4K';
    if (value === '0') return t('src_unknown');
    return value + 'p';
  }

  function qualityValues(map) {
    var out = [{ title: t('all'), value: 'all' }];
    for (var i = 0; i < QUALITY_ORDER.length; i++) {
      var key = String(QUALITY_ORDER[i]);
      if (!map[key]) continue;
      out.push({ title: qualityLabel(key) + ' (' + map[key] + ')', value: key });
    }
    if (map['0']) out.push({ title: t('src_unknown') + ' (' + map['0'] + ')', value: '0' });
    return out;
  }

  function labelValues(map, labels, order) {
    var out = [{ title: t('all'), value: 'all' }];
    for (var i = 0; i < order.length; i++) {
      var key = order[i];
      if (!map[key]) continue;
      out.push({ title: t(labels[key]) + ' (' + map[key] + ')', value: key });
    }
    return out;
  }

  function trackerValues(map) {
    var out = [{ title: t('all'), value: 'all' }];
    var keys = [];
    for (var key in map) {
      if (Object.prototype.hasOwnProperty.call(map, key)) keys.push(key);
    }
    keys.sort(function (a, b) { return map[b] - map[a]; });
    for (var i = 0; i < keys.length; i++) {
      out.push({ title: keys[i] + ' (' + map[keys[i]] + ')', value: keys[i] });
    }
    return out;
  }

  var SORT_VALUES = [
    { key: 'sort_best', value: 'best' },
    { key: 'sort_seeds', value: 'seeds' },
    { key: 'sort_size_desc', value: 'size_desc' },
    { key: 'sort_size_asc', value: 'size_asc' },
    { key: 'sort_date', value: 'date' }
  ];

  function sortTitle(mode) {
    for (var i = 0; i < SORT_VALUES.length; i++) {
      if (SORT_VALUES[i].value === mode) return t(SORT_VALUES[i].key);
    }
    return t('sort_best');
  }

  function sortValues() {
    var out = [];
    for (var i = 0; i < SORT_VALUES.length; i++) {
      out.push({ title: t(SORT_VALUES[i].key), value: SORT_VALUES[i].value });
    }
    return out;
  }

  function applyPick(key, value, back_key) {
    save(key, value);
    redraw(back_key);
  }

  function imageUrl(movie) {
    var url = '';
    try {
       if (movie && movie.backdrop_path) url = tmdbImage(movie.backdrop_path, 'w780');
      else if (movie && movie.backdrop) url = movie.backdrop;
      else if (movie && movie.background) url = movie.background;
       else if (movie && movie.poster_path) url = tmdbImage(movie.poster_path, 'w500');
      else if (movie && movie.poster) url = movie.poster;
      else if (movie && movie.img) url = movie.img;
      else if (movie && movie.cover) url = movie.cover;
      else if (movie && movie.image) url = movie.image;
      else if (movie && movie.logo) url = movie.logo;
      if (!url && window.Lampa && Lampa.Utils) {
        if (typeof Lampa.Utils.cardImgBackground === 'function') url = Lampa.Utils.cardImgBackground(movie) || '';
        if (!url && typeof Lampa.Utils.cardImg === 'function') url = Lampa.Utils.cardImg(movie) || '';
      }
    } catch (e) {}
     return normalizeImageUrl(url);
  }

  function movieText(movie, keys) {
    for (var i = 0; i < keys.length; i++) {
      try {
        var value = movie && movie[keys[i]];
        if (value) return clean(value);
      } catch (e) {}
    }
    return '';
  }

  function episodeLabel(item) {
    var s = item.info.season;
    var e = item.info.episode;
    if (s && e) return 'S' + (s < 10 ? '0' : '') + s + 'E' + (e < 10 ? '0' : '') + e;
    if (s) return 'S' + (s < 10 ? '0' : '') + s;
    return t('episode_unknown');
  }

  function premiereDate(item) {
    var value = item && item.tmdb_air_date ? String(item.tmdb_air_date) : '';
     if (!value) return t('calendar_date_unknown');
    var stamp = dateStamp(value);
    if (!stamp) return value;
    try {
      var date = new Date(stamp);
      var locale = langCode() === 'ru' ? 'ru-RU' : 'en-US';
      return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return value; }
  }

   function rememberModalFocus() {
     try {
       var focused = $('.selector.focus').not('.nova-tor-modal *').first();
       modal_return_focus = focused && focused.length ? focused : null;
     } catch (e) { modal_return_focus = null; }
   }

   function openCalendarModal(reopen) {
    if (!data) return;
     if (!reopen) rememberModalFocus();
     closeEpisodeModal(false);
     if (!reopen && tmdbKey()) enrichEpisodePosters();
    var modal = $('<div class="nova-tor-modal nova-tor-calendar-modal"></div>');
    var panel = $('<div class="nova-tor-modal__panel nova-tor-calendar"></div>');
    var title = movieText(page_info && page_info.movie, ['title', 'name', 'original_title']) || t('calendar_title');
    panel.append('<div class="nova-tor-modal__head"><div><div class="nova-tor-modal__eyebrow">' + esc(t('calendar')) + '</div><div class="nova-tor-modal__title">' + esc(title) + '</div></div><div class="nova-tor-modal__close selector" data-key="calendar-close">' + esc(t('close')) + '</div></div>');
    var entries = [];
    for (var i = 0; i < data.all.length; i++) if (data.all[i].tmdb_air_date) entries.push(data.all[i]);
     if (!entries.length) {
       var episodes = {};
       for (var x = 0; x < data.all.length; x++) {
         var candidate = data.all[x];
         if (!candidate.info.season || !candidate.info.episode) continue;
         var episode_key = candidate.info.season + ':' + candidate.info.episode;
         if (!episodes[episode_key] || candidate.score > episodes[episode_key].score) episodes[episode_key] = candidate;
       }
       for (var episode_key_name in episodes) {
         if (Object.prototype.hasOwnProperty.call(episodes, episode_key_name)) entries.push(episodes[episode_key_name]);
       }
     }
    entries.sort(function (a, b) { return dateStamp(a.tmdb_air_date) - dateStamp(b.tmdb_air_date) || a.index - b.index; });
     var has_dates = false;
     for (var d = 0; d < data.all.length; d++) {
       if (data.all[d].tmdb_air_date) { has_dates = true; break; }
     }
     if (!entries.length) {
       panel.append('<div class="nova-tor__empty"><div class="nova-tor__empty-title">' + esc(t('calendar_empty')) + '</div><div class="nova-tor__empty-text">' + esc(tmdbKey() ? t('calendar_loading') : t('tmdb_missing')) + '</div></div>');
     } else if (!has_dates && tmdbKey()) {
       panel.append('<div class="nova-tor-calendar__status">' + esc(t('calendar_loading')) + '</div>');
     }
    var last = '';
    for (var e = 0; e < entries.length; e++) {
      var item = entries[e];
       var day = item.tmdb_air_date ? String(item.tmdb_air_date) : 'unknown';
      if (day !== last) {
        panel.append('<div class="nova-tor-calendar__day">' + esc(premiereDate(item)) + '</div>');
        last = day;
      }
      var row = $('<div class="nova-tor-modal__row selector" data-key="calendar-' + item.index + '"></div>');
      row.append(posterHtml(item, 'nova-tor-modal__poster'));
      row.append('<div class="nova-tor-modal__ep">' + esc(episodeLabel(item)) + '</div>');
       row.append('<div class="nova-tor-modal__rowbody"><div class="nova-tor-modal__rowtitle">' + esc(item.tmdb_name || item.title) + '</div><div class="nova-tor-modal__rowmeta">' + esc(t('aired')) + ': ' + esc(item.tmdb_air_date || t('calendar_date_unknown')) + ' · ' + metaLine(item) + '</div></div>');
      row.append('<div class="nova-tor-modal__score">' + item.rate + '</div>');
       bind(row, function (chosen) { return function () { closeEpisodeModal(false); launch(chosen); }; }(item), function (chosen) { return function () { context(chosen); }; }(item));
      panel.append(row);
    }
    modal.append(panel);
    $('body').append(modal);
    ui.modal = modal;
    modal.on('click', function (event) { if (event && event.target === modal[0]) closeEpisodeModal(); });
    bind(modal.find('[data-key="calendar-close"]'), closeEpisodeModal);
    try { Lampa.Controller.collectionFocus(modal.find('[data-key="calendar-close"]')[0], null); } catch (e) {}
  }

  function episodeGroups() {
    var groups = {};
    var list = data && data.all ? data.all : [];
    for (var i = 0; i < list.length; i++) {
      var key = list[i].info.season ? String(list[i].info.season) : '0';
      if (!groups[key]) groups[key] = [];
      groups[key].push(list[i]);
    }
    var out = [];
    for (var key in groups) if (Object.prototype.hasOwnProperty.call(groups, key)) {
      out.push({ key: key, list: sortList(groups[key], 'best') });
    }
    out.sort(function (a, b) { return parseInt(a.key, 10) - parseInt(b.key, 10); });
    return out;
  }

   function closeEpisodeModal(restore) {
    if (!ui.modal) return;
    try { ui.modal.remove(); } catch (e) {}
    ui.modal = null;
     try { $(document).off('keydown.nova_tor'); } catch (e) {}
     if (restore !== false && modal_return_focus && modal_return_focus.length) {
       var target = modal_return_focus;
       modal_return_focus = null;
       setTimeout(function () {
         try { Lampa.Controller.collectionFocus(target[0], activeScroll(target[0])); } catch (e) {}
       }, 0);
     } else if (restore !== false) {
       modal_return_focus = null;
     }
  }

  function openEpisodeModal() {
    if (!data) return;
     rememberModalFocus();
     closeEpisodeModal(false);
    var modal = $('<div class="nova-tor-modal"></div>');
    var panel = $('<div class="nova-tor-modal__panel"></div>');
    var title = movieText(page_info && page_info.movie, ['title', 'name', 'original_title']) || t('episode_modal');
    panel.append('<div class="nova-tor-modal__head"><div><div class="nova-tor-modal__eyebrow">' + esc(t('episodes')) + '</div><div class="nova-tor-modal__title">' + esc(title) + '</div></div><div class="nova-tor-modal__close selector" data-key="modal-close">' + esc(t('close')) + '</div></div>');
    var groups = episodeGroups();
    for (var g = 0; g < groups.length; g++) {
      var season = groups[g];
      var heading = season.key === '0' ? t('episode_modal') : 'S' + (parseInt(season.key, 10) < 10 ? '0' : '') + season.key;
      panel.append('<div class="nova-tor-modal__season">' + esc(heading) + '</div>');
      for (var i = 0; i < season.list.length; i++) {
        var item = season.list[i];
        var row = $('<div class="nova-tor-modal__row selector" data-key="modal-' + item.index + '"></div>');
        row.append(posterHtml(item, 'nova-tor-modal__poster'));
        row.append('<div class="nova-tor-modal__ep">' + esc(episodeLabel(item)) + '</div>');
        row.append('<div class="nova-tor-modal__rowbody"><div class="nova-tor-modal__rowtitle">' + esc(item.title) + '</div><div class="nova-tor-modal__rowmeta">' + metaLine(item) + '</div></div>');
        row.append('<div class="nova-tor-modal__score">' + item.rate + '</div>');
         bind(row, function (chosen) { return function () { closeEpisodeModal(false); launch(chosen); }; }(item), function (chosen) { return function () { context(chosen); }; }(item));
        panel.append(row);
      }
    }
    modal.append(panel);
    $('body').append(modal);
    ui.modal = modal;
    modal.on('click', function (e) {
      if (e && e.target === modal[0]) closeEpisodeModal();
    });
    try {
      $(document).on('keydown.nova_tor', function (e) {
        if (e && (e.key === 'Escape' || e.keyCode === 27)) closeEpisodeModal();
      });
    } catch (e) {}
    bind(modal.find('[data-key="modal-close"]'), closeEpisodeModal);
    try { Lampa.Controller.collectionFocus(modal.find('[data-key="modal-close"]')[0], null); } catch (e) {}
  }

  function shimmerTitle(value) {
    var text = String(value || ''), html = '', index = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === ' ') { html += ' '; continue; }
      html += '<span style="--nova-letter:' + (index % 18) + '">' + esc(ch) + '</span>';
      index++;
    }
    return html || esc(text);
  }

   function nestedValue(object, path) {
     var current = object;
     var parts = String(path || '').split('.');
     for (var i = 0; i < parts.length; i++) {
       if (!current || typeof current !== 'object') return '';
       current = current[parts[i]];
     }
     return current == null ? '' : current;
   }

   function firstMovieValue(movie, keys) {
     for (var i = 0; i < keys.length; i++) {
       var value = nestedValue(movie, keys[i]);
       if (value !== '' && value != null) return value;
     }
     return '';
   }

   function ratingText(value) {
     if (value && typeof value === 'object') value = value.value || value.rating || value.average || value.score;
     var found = String(value == null ? '' : value).replace(',', '.').match(/\d+(?:\.\d+)?/);
     if (!found) return '';
     var number = parseFloat(found[0]);
     if (!isFinite(number) || number <= 0) return '';
     if (number > 10 && number <= 100) number = number / 10;
     if (number > 10) return '';
     return (Math.round(number * 10) / 10).toFixed(1);
   }

   function heroBadge(label, value, kind) {
     if (!value) return '';
     return '<span class="nova-tor-hero__badge nova-tor-hero__badge--' + esc(kind) + '">' +
       '<b>' + esc(value) + '</b>' + (label ? '<small>' + esc(label) + '</small>' : '') + '</span>';
   }

   function heroStatus(movie) {
     var raw = firstMovieValue(movie, ['status', 'production_status', 'state', 'release_status']);
     if (raw && typeof raw === 'object') raw = raw.name || raw.label || raw.value || '';
     var value = clean(raw);
     if (!value) return '';
     var lower = value.toLowerCase();
     if (/released|выпущ|заверш|ended|finished/.test(lower)) return t('released');
     if (/returning|ongoing|airing|выходит|продолжа/.test(lower)) return t('ongoing');
     return value;
   }

   function heroAge(movie) {
     var value = firstMovieValue(movie, ['age_restriction', 'age_rating', 'rating_mpaa', 'mpaa', 'certification', 'age']);
     if (value && typeof value === 'object') value = value.value || value.rating || value.name || value.label || '';
     if (value === '' && movie && movie.adult === true) value = '18';
     value = clean(value);
     if (!value) return '';
     if (/^\d+$/.test(value)) value += '+';
     return value.replace(/\s+/g, '');
   }

   function buildHeroBadges(movie, best) {
     var html = '';
     var tmdb = ratingText(firstMovieValue(movie, ['vote_average', 'tmdb_rating', 'tmdb_score', 'rating_tmdb', 'ratings.tmdb', 'rating.tmdb']));
     var imdb = ratingText(firstMovieValue(movie, ['imdb_rating', 'imdb_score', 'rating_imdb', 'ratings.imdb', 'imdb.rating', 'imdb']));
     var kp = ratingText(firstMovieValue(movie, ['kinopoisk_rating', 'kp_rating', 'rating_kp', 'ratings.kinopoisk', 'ratings.kp', 'rating.kinopoisk', 'rating.kp']));
     var age = heroAge(movie);
     var status = heroStatus(movie);
     var quality = best && best.info ? best.info.quality : 0;
 
     html += heroBadge('TMDB', tmdb, 'tmdb');
     html += heroBadge('IMDb', imdb, 'imdb');
     html += heroBadge('КП', kp, 'kp');
     html += heroBadge('', age, 'age');
     html += heroBadge('', status, 'status');
     if (!quality) quality = firstMovieValue(movie, ['quality', 'video_quality']);
     if (quality) {
       quality = String(quality);
       if (quality === '2160') quality = '4K';
       else if (/^\d+$/.test(quality)) quality += 'p';
       html += heroBadge('', quality, 'quality');
     }
     return html ? '<div class="nova-tor-hero__badges">' + html + '</div>' : '';
   }

  function buildHero() {
    var best = data && data.best;
    if (!best) return null;
    var movie = page_info && page_info.movie || {};
    var title = movieText(movie, ['title', 'name', 'original_title']) || best.title;
    var descr = movieText(movie, ['overview', 'description', 'plot', 'descr']);
    var image = imageUrl(movie);
    var hero = $('<div class="nova-tor-hero selector" data-key="hero"></div>');
    if (image) hero.append('<div class="nova-tor-hero__bg"><img src="' + esc(image) + '" onerror="this.parentNode.style.display=\'none\'" /></div>');
     hero.append('<div class="nova-tor-hero__shade"></div>' + buildHeroBadges(movie, best) + '<div class="nova-tor-hero__body"><div class="nova-tor-hero__kicker">' + esc(t('best')) + '</div><div class="nova-tor-hero__title nova-tor-hero__title--shimmer" aria-label="' + esc(title) + '">' + shimmerTitle(title) + '</div><div class="nova-tor-hero__release">' + esc(episodeLabel(best) + ' · ' + best.title) + '</div>' + (descr ? '<div class="nova-tor-hero__descr"><span>' + esc(t('synopsis')) + ': </span>' + esc(descr) + '</div>' : '') + '<div class="nova-tor-hero__actions"><div class="nova-tor-hero__play selector" data-key="hero-play">' + esc(t('play')) + '</div><div class="nova-tor-hero__episodes selector" data-key="episodes">' + esc(t('episodes')) + '</div></div></div></div>');
    bind(hero, function () { launch(best); });
    bind(hero.find('[data-key="hero-play"]'), function () { launch(best); });
    bind(hero.find('[data-key="episodes"]'), openEpisodeModal);
    return hero;
  }

  function buildBar() {
    var bar = $('<div class="nova-tor__bar"></div>');
    var ep = $('<div class="nova-tor__chip selector" data-key="episodes"><span class="nova-tor__chip-label">' + esc(t('episodes')) + '</span></div>');
    bind(ep, openEpisodeModal);
    bar.append(ep);
    var pick = data.pick;
    var face = data.facets;
    var cal = $('<div class="nova-tor__chip selector" data-key="calendar"><span class="nova-tor__chip-label">' + esc(t('calendar')) + '</span></div>');
    bind(cal, openCalendarModal);
    bar.append(cal);

    bar.append(bind(chip('sort', t('sort'), sortTitle(pick.sort), pick.sort !== 'best'), function () {
      menu(t('sort'), sortValues(), pick.sort, function (value) {
        applyPick(STORE.pick_sort, value, 'sort');
      }, 'sort');
    }));

    var q_list = qualityValues(face.quality);
    if (q_list.length > 2) {
      bar.append(bind(chip('quality', t('quality'), qualityLabel(pick.quality), pick.quality !== 'all'), function () {
        menu(t('quality'), q_list, pick.quality, function (value) {
          applyPick(STORE.pick_quality, value, 'quality');
        }, 'quality');
      }));
    }

    var v_list = labelValues(face.voice, VOICE_LABEL, ['dub', 'mvo', 'dvo', 'avo', 'sub', 'orig', 'unknown']);
    if (v_list.length > 2) {
      var v_label = pick.voice === 'all' ? t('all') : t(VOICE_LABEL[pick.voice] || 'voice_unknown');
      bar.append(bind(chip('voice', t('voice'), v_label, pick.voice !== 'all'), function () {
        menu(t('voice'), v_list, pick.voice, function (value) {
          applyPick(STORE.pick_voice, value, 'voice');
        }, 'voice');
      }));
    }

    var s_list = labelValues(face.source, SOURCE_LABEL, ['remux', 'bluray', 'webdl', 'web', 'hdrip', 'hdtv', 'dvd', 'cam', 'unknown']);
    if (s_list.length > 2) {
      var s_label = pick.source === 'all' ? t('all') : t(SOURCE_LABEL[pick.source] || 'src_unknown');
      bar.append(bind(chip('source', t('source'), s_label, pick.source !== 'all'), function () {
        menu(t('source'), s_list, pick.source, function (value) {
          applyPick(STORE.pick_source, value, 'source');
        }, 'source');
      }));
    }

    var t_list = trackerValues(face.tracker);
    if (t_list.length > 2) {
      var t_label = pick.tracker === 'all' ? t('all') : pick.tracker;
      bar.append(bind(chip('tracker', t('tracker'), t_label, pick.tracker !== 'all'), function () {
        menu(t('tracker'), t_list, pick.tracker, function (value) {
          applyPick(STORE.pick_tracker, value, 'tracker');
        }, 'tracker');
      }));
    }

    var dirty = pick.sort !== 'best' || pick.quality !== 'all' || pick.voice !== 'all' ||
      pick.source !== 'all' || pick.tracker !== 'all';

    if (dirty) {
      bar.append(bind(chip('reset', t('reset'), '', false), function () {
        save(STORE.pick_sort, 'best');
        save(STORE.pick_quality, 'all');
        save(STORE.pick_voice, 'all');
        save(STORE.pick_source, 'all');
        save(STORE.pick_tracker, 'all');
        redraw('sort');
      }));
    }

    return bar;
  }

  function buildBest() {
    var item = data.best;
    if (!item) return null;

    var box = $('<div class="nova-tor__best selector" data-key="best"></div>');
    box.append(posterHtml(item, 'nova-tor__best-poster'));
    box.append('<div class="nova-tor__best-cap">' + esc(t('best')) + '</div>');
    box.append('<div class="nova-tor__best-title">' + esc(item.title) + '</div>');
    box.append('<div class="nova-tor__best-badges">' + qualityBadge(item) + sourceBadge(item) + healthBadge(item) + badgeHtml(badges(item)) + '</div>');
    box.append('<div class="nova-tor__best-meta">' + metaLine(item) + '</div>');
    box.append('<div class="nova-tor__best-play">' + esc(item.progress > 0 ? t('continue_watch') : t('play')) + '</div>');

    return bind(box, function () { launch(item); }, function () { context(item); });
  }

  function buildCard(item, position) {
    var card = $('<div class="nova-tor-card selector" data-key="card-' + item.index + '"></div>');
    if (item.best) card.addClass('nova-tor-card--best');
    if (item.seeds <= 0) card.addClass('nova-tor-card--dead');
    if (item.viewed) card.addClass('nova-tor-card--viewed');

    card.append('<div class="nova-tor-card__rank">' + position + '</div>');
    card.append(posterHtml(item, 'nova-tor-card__poster'));
    card.append('<div class="nova-tor-card__quality">' + qualityBadge(item) + '</div>');

    var body = $('<div class="nova-tor-card__body"></div>');
    body.append('<div class="nova-tor-card__title">' + esc(item.title) + '</div>');
    if (item.tmdb_name) body.append('<div class="nova-tor-card__episode-name">' + esc(item.tmdb_name) + '</div>');
    var line = sourceBadge(item) + healthBadge(item) + badgeHtml(badges(item));
    if (line) body.append('<div class="nova-tor-card__badges">' + line + '</div>');
    body.append('<div class="nova-tor-card__meta">' + metaLine(item) + '</div>');
    card.append(body);

    card.append('<div class="nova-tor-card__score"><div class="nova-tor-card__score-num">' + item.rate +
      '</div><div class="nova-tor-card__score-cap">' + esc(t('rating')) + '</div>' +
      (item.progress > 0 ? '<div class="nova-tor-card__continue">' + esc(t('continue_watch')) + '</div>' : '') + '</div>');

    return bind(card, function () { launch(item); }, function () { context(item); });
  }

  function buildEmpty() {
    var box = $('<div class="nova-tor__empty"></div>');
    box.append('<div class="nova-tor__empty-title">' + esc(t('empty_title')) + '</div>');
    box.append('<div class="nova-tor__empty-text">' + esc(t('empty_text')) + '</div>');
    return box;
  }

  function render(focus_key) {
    if (!host || !data) return;

    var box = $('<div class="nova-tor"></div>');
    var hero = buildHero();
    if (hero) box.append(hero);
    box.append(buildBar());

    if (!data.list.length) {
      box.append(buildEmpty());
    } else {
      if (data.pick.sort === 'best') {
        var best = buildBest();
        if (best) box.append(best);
      }

      box.append('<div class="nova-tor__stat">' +
        esc(t('shown').replace('{shown}', data.list.length).replace('{total}', data.total)) +
        '</div>');

      var list = $('<div class="nova-tor__list"></div>');
      for (var i = 0; i < data.list.length; i++) {
        list.append(buildCard(data.list[i], i + 1));
      }
      box.append(list);
    }

    mutating = true;

    var was_focused = host.find('.torrent-item.focus').length > 0;
    if (ui.root) {
      try { ui.root.remove(); } catch (e) {}
    }
    ui.root = box;

    for (var j = 0; j < natives.length; j++) {
      natives[j].addClass('nova-tor-hidden');
    }
    host.addClass('nova-tor-scope');
    host.append(box);
    hydrateCachedImages();

    setTimeout(function () { mutating = false; }, 0);

    var want = focus_key;
    if (want == null) {
      want = was_focused || get(STORE.autofocus, true) !== false ? '' : null;
    }
    if (want != null) focusKeyed(want);

    autoplay();
  }

  function autoplay() {
    if (get(STORE.autoplay, false) !== true) return;
    if (!data || !data.best) return;
    if (played === signature) return;
    played = signature;
    var best = data.best;
    setTimeout(function () { launch(best); }, 700);
  }

  /* ------------------------ жизненный цикл -------------------------- */

  function detach() {
    mutating = true;
    if (ui.root) {
      try { ui.root.remove(); } catch (e) {}
    }
    ui = {};
    if (host) {
      try {
        host.removeClass('nova-tor-scope');
        host.find('.nova-tor-hidden').removeClass('nova-tor-hidden');
      } catch (e) {}
    }
    unwatch();
    host = null;
    natives = [];
    data = null;
    page_info = null;
    closeEpisodeModal();
    signature = '';
    setTimeout(function () { mutating = false; }, 0);
  }

  function watch(node) {
    if (!node || observed === node) return;
    unwatch();
    if (!window.MutationObserver) return;
    try {
      observer = new MutationObserver(function () {
        if (mutating) return;
        schedule();
      });
      observer.observe(node, { childList: true });
      observed = node;
    } catch (e) {
      observer = null;
      observed = null;
    }
  }

  function unwatch() {
    if (observer) {
      try { observer.disconnect(); } catch (e) {}
    }
    observer = null;
    observed = null;
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(function () { guard(function () { draw(false); }, 'scheduled draw'); }, 120);
  }

  function redraw(focus_key) {
    if (!host) return;
    natives = collect();
    if (!natives.length) return;
    var raw = [];
    for (var i = 0; i < natives.length; i++) raw.push(readItem(natives[i]));
    data = evaluate(raw);
    render(focus_key == null ? '' : focus_key);
  }

  function draw(force) {
    var box = scope();
    if (!box) {
      if (host) detach();
      return;
    }

    if (host && host[0] !== box.body[0]) detach();
    host = box.body;
    page_info = box;
    watch(host[0]);

    var list = collect();
    if (!list.length) {
      if (ui.root) detach();
      return;
    }

    var sig = stamp(list);
    var alive = ui.root && ui.root.length && ui.root.parent().length;
    if (!force && alive && sig === signature) return;

    signature = sig;
    natives = list;

    var raw = [];
    for (var i = 0; i < list.length; i++) raw.push(readItem(list[i]));
    data = evaluate(raw);
    render(null);
    enrichEpisodePosters();
  }

  /* --------------------------- настройки ---------------------------- */

  function settings() {
    if (!window.Lampa || !Lampa.SettingsApi) return;

    try {
      Lampa.SettingsApi.addComponent({
        component: 'nova_torrents',
        name: t('name'),
        icon: '<svg height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M18 4v18" stroke="white" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M10 16l8 8 8-8" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M5 30h26" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>'
      });

      Lampa.SettingsApi.addComponent({
        component: 'nova_torrents_cache',
        name: t('cache_page'),
        icon: '<svg height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10h20M8 18h20M8 26h20" stroke="white" stroke-width="3" stroke-linecap="round"/><path d="M5 10h.1M5 18h.1M5 26h.1" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>'
      });

      function param(item, field, on_change) {
        Lampa.SettingsApi.addParam({
          component: 'nova_torrents',
          param: item,
          field: field,
          onChange: on_change || function () {}
        });
      }

      Lampa.SettingsApi.addParam({
        component: 'nova_torrents_cache',
        param: {
          name: STORE.cache_ttl,
          type: 'select',
          values: { '0': t('cache_ttl_off'), '30': t('cache_ttl_30'), '90': t('cache_ttl_90'), '180': t('cache_ttl_180'), '365': t('cache_ttl_365') },
          default: '90'
        },
        field: { name: t('cache_ttl'), description: t('cache_ttl_descr') },
        onChange: function () { cleanupOldCache(); }
      });

      Lampa.SettingsApi.addParam({
        component: 'nova_torrents_cache',
        param: { name: 'nova_tor_clear_cache', type: 'trigger', default: false },
        field: { name: t('cache_clear'), description: t('cache_clear_descr') },
        onChange: function (value) {
          if (value !== true) return;
          clearTmdbCache();
          save('nova_tor_clear_cache', false);
          try { Lampa.Noty.show(t('cache_clear_done')); } catch (e) {}
          if (host && data) { played = ''; enrichEpisodePosters(); render(''); }
        }
      });

      function refresh() {
        played = '';
        draw(true);
      }

      param({ name: STORE.enabled, type: 'trigger', default: true },
        { name: t('set_enable'), description: t('set_enable_descr') },
        function () {
          if (enabled()) { recoverEmergency(); guard(function () { draw(true); }, 'settings re-enable'); }
          else detach();
        });

      param({ name: STORE.compatibility, type: 'select', values: { auto: t('compatibility_auto'), safe: t('compatibility_safe'), passive: t('compatibility_passive') }, default: 'safe' }, { name: t('compatibility'), description: t('compatibility_descr') }, refresh);

      param({ name: STORE.profile, type: 'select', values: { tv: t('profile_tv'), phone: t('profile_phone'), '4k': t('profile_4k'), custom: t('profile_custom') }, default: 'tv' }, { name: t('profile'), description: t('profile_descr') }, refresh);

      param({
        name: STORE.quality,
        type: 'select',
        values: { auto: t('any'), '2160': '4K', '1080': '1080p', '720': '720p', '480': '480p' },
        default: 'auto'
      }, { name: t('set_quality'), description: t('set_quality_descr') }, refresh);

      param({
        name: STORE.lang,
        type: 'select',
        values: { ru: t('ru_first'), orig: t('orig_first'), any: t('any') },
        default: 'ru'
      }, { name: t('set_lang'), description: t('set_lang_descr') }, refresh);

      param({ name: STORE.hevc, type: 'trigger', default: true },
        { name: t('set_hevc'), description: t('set_hevc_descr') }, refresh);

      param({ name: STORE.hdr, type: 'trigger', default: true },
        { name: t('set_hdr'), description: t('set_hdr_descr') }, refresh);

      param({ name: STORE.hidecam, type: 'trigger', default: true },
        { name: t('set_hidecam'), description: t('set_hidecam_descr') }, refresh);

      param({ name: STORE.hide3d, type: 'trigger', default: true },
        { name: t('set_hide3d'), description: t('set_hide3d_descr') }, refresh);

      param({
        name: STORE.minseeds,
        type: 'select',
        values: { '0': t('off'), '1': '1', '5': '5', '20': '20', '50': '50' },
        default: '0'
      }, { name: t('set_minseeds'), description: t('set_minseeds_descr') }, refresh);

      param({
        name: STORE.maxsize,
        type: 'select',
        values: {
          '0': t('off'),
          '5': '5 ' + t('gb'),
          '10': '10 ' + t('gb'),
          '20': '20 ' + t('gb'),
          '40': '40 ' + t('gb'),
          '80': '80 ' + t('gb')
        },
        default: '0'
      }, { name: t('set_maxsize'), description: t('set_maxsize_descr') }, refresh);

      param({
        name: STORE.limit,
        type: 'select',
        values: { '0': t('all_items'), '10': '10', '20': '20', '30': '30', '50': '50' },
        default: '0'
      }, { name: t('set_limit'), description: t('set_limit_descr') }, refresh);

      /* TMDB key is read from nova_tor_tmdb_key or the host's existing tmdb key.
         Older Lampa builds crash on the custom input field, so do not register it here. */

      param({
        name: STORE.tmdb_lang,
        type: 'select',
        values: { 'ru-RU': 'Русский', 'en-US': 'English' },
        default: langCode() === 'ru' ? 'ru-RU' : 'en-US'
      }, { name: t('tmdb_lang'), description: t('tmdb_lang_descr') }, refresh);

      param({ name: STORE.autofocus, type: 'trigger', default: true },
        { name: t('set_autofocus'), description: t('set_autofocus_descr') });

      param({ name: STORE.autoplay, type: 'trigger', default: false },
        { name: t('set_autoplay'), description: t('set_autoplay_descr') });
    } catch (e) {}
  }

  /* ------------------------------ стили ----------------------------- */

  var CSS = '' +
    '.nova-tor-modal{position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;min-height:100%;box-sizing:border-box;background:rgba(8,10,16,.96);z-index:2147483000;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-align:start;-webkit-align-items:flex-start;align-items:flex-start;-webkit-box-pack:start;-webkit-justify-content:flex-start;justify-content:flex-start;padding:0;overflow:hidden}' +
    '.nova-tor-modal__panel{width:100%;height:100%;max-width:none;max-height:none;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#171b25;color:#f4f2ed;border-radius:0;padding:2em 3em 3em;box-shadow:none;box-sizing:border-box}' +
    '.nova-tor-modal__head{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;justify-content:space-between;-webkit-box-align:start;-webkit-align-items:flex-start;align-items:flex-start;margin-bottom:1em}' +
    '.nova-tor-modal__eyebrow,.nova-tor-hero__kicker{font-size:.75em;letter-spacing:.14em;text-transform:uppercase;color:#8fe0a4}' +
    '.nova-tor-modal__title{font-size:1.6em;font-weight:600;margin-top:.25em}' +
    '.nova-tor-modal__close{padding:.5em .9em;border-radius:2em;background:rgba(255,255,255,.1);white-space:nowrap}' +
    '.nova-tor-modal__close.focus{background:#f4f2ed;color:#171b25}' +
     '.nova-tor-calendar__day{font-size:.85em;letter-spacing:.1em;text-transform:uppercase;color:#e05b62;margin:1.2em 0 .55em;padding-bottom:.35em;border-bottom:1px solid rgba(224,91,98,.28)}.nova-tor-calendar__status{padding:.7em .9em;margin-bottom:.8em;border-radius:.7em;background:rgba(143,224,164,.1);color:#9ce5ad;font-size:.9em}' +
    '.nova-tor-modal__season{font-size:.8em;letter-spacing:.12em;text-transform:uppercase;opacity:.5;margin:1.3em 0 .55em}' +
    '.nova-tor-modal__row{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-align:center;-webkit-align-items:center;align-items:center;padding:.8em;border-radius:.75em;background:rgba(255,255,255,.05);margin-bottom:.45em}' +
    '.nova-tor-modal__row.focus{background:#f4f2ed;color:#171b25}' +
    '.nova-tor-modal__ep{width:4.2em;flex-shrink:0;font-weight:600;color:#8fe0a4}' +
    '.nova-tor-modal__row.focus .nova-tor-modal__ep{color:#287844}' +
    '.nova-tor-modal__rowbody{min-width:0;flex:1}.nova-tor-modal__rowtitle{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nova-tor-modal__rowmeta{font-size:.82em;opacity:.58;margin-top:.25em}.nova-tor-modal__score{font-variant-numeric:tabular-nums;opacity:.7}' +
      '.nova-tor-hero__badges{position:absolute;z-index:3;top:1.1em;right:1.2em;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-pack:end;-webkit-justify-content:flex-end;justify-content:flex-end;max-width:62%;font-size:.9em}.nova-tor-hero__badge{display:-webkit-inline-flex;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;align-items:center;padding:.38em .62em;margin:0 0 .5em .5em;border:1px solid rgba(255,255,255,.42);border-radius:.45em;background:rgba(12,16,27,.68);color:#fff;box-shadow:0 .25em .8em rgba(0,0,0,.18);white-space:nowrap}.nova-tor-hero__badge b{font-size:1.08em;line-height:1}.nova-tor-hero__badge small{font-size:.72em;opacity:.8;line-height:1;margin-left:.45em}.nova-tor-hero__badge--tmdb{border-color:#48a8ff;color:#8bc9ff}.nova-tor-hero__badge--imdb{border-color:#f0a34a;color:#ffc477}.nova-tor-hero__badge--kp{border-color:#f06b6b;color:#ff9b9b}.nova-tor-hero__badge--age{background:#dc4365;border-color:#ff7893}.nova-tor-hero__badge--status{background:#168c9a;border-color:#55d5d7}.nova-tor-hero__badge--quality{background:#168c76;border-color:#52d8b2}' +
     '.nova-tor-hero{position:relative;min-height:19em;overflow:hidden;border-radius:1.2em;margin-bottom:1.2em;background:radial-gradient(circle at 82% 22%,rgba(224,91,98,.34),transparent 30%),linear-gradient(135deg,#202b3b 0%,#151923 58%,#0d1119 100%)}' +
     '.nova-tor-hero__bg,.nova-tor-hero__shade{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%}.nova-tor-hero__bg img{width:100%;height:100%;object-fit:cover;opacity:.75}' +
    '.nova-tor-hero__shade{background:linear-gradient(90deg,rgba(10,13,20,.96) 0%,rgba(10,13,20,.75) 42%,rgba(10,13,20,.18) 100%)}' +
    '.nova-tor-hero__body{position:relative;max-width:70%;padding:2.2em}.nova-tor-hero__title{font-size:2.25em;font-weight:600;line-height:1.1;margin:.3em 0 .45em}.nova-tor-hero__title--shimmer span{display:inline-block;color:#f4f2ed;text-shadow:0 .06em .45em rgba(10,13,20,.88);animation:novaLetterGlow 3.6s ease-in-out infinite;animation-delay:calc(var(--nova-letter) * -.11s)}@keyframes novaLetterGlow{0%,100%{color:#f4f2ed;text-shadow:0 .06em .45em rgba(10,13,20,.88);transform:translateY(0)}45%{color:#f08a8e;text-shadow:0 0 .65em rgba(224,91,98,.72);transform:translateY(-.025em)}60%{color:#f4f2ed;text-shadow:0 .06em .45em rgba(10,13,20,.88);transform:translateY(0)}}.nova-tor-hero__release{font-size:1em;opacity:.75;line-height:1.35}.nova-tor-hero__descr{max-width:46em;font-size:.95em;line-height:1.45;opacity:.72;margin-top:.8em;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.nova-tor-hero__descr span{opacity:.65}.nova-tor-hero__actions{display:flex;flex-wrap:wrap;gap:.6em;margin-top:1.2em}.nova-tor-hero__play,.nova-tor-hero__episodes{padding:.65em 1.2em;border-radius:2em;background:rgba(255,255,255,.13)}.nova-tor-hero__play{background:#f4f2ed;color:#171b25}.nova-tor-hero__play.focus,.nova-tor-hero__episodes.focus{box-shadow:0 0 0 .15em #8fe0a4}' +
    '.nova-tor-card,.nova-tor__best,.nova-tor__chip,.nova-tor-modal__row{transition:background-color .18s ease-out,box-shadow .18s ease-out,transform .18s ease-out}' +
    '.nova-tor-card:not(.focus):hover,.nova-tor__chip:not(.focus):hover,.nova-tor-modal__row:not(.focus):hover{background:rgba(255,255,255,.095)}' +
    '.nova-tor-card.focus,.nova-tor__chip.focus,.nova-tor__best.focus,.nova-tor-modal__row.focus{box-shadow:0 0 0 .14em rgba(224,91,98,.85),0 .7em 1.8em rgba(0,0,0,.24)}' +
    '.nova-tor-quality,.nova-tor-source,.nova-tor-health,.nova-tor-badge{vertical-align:middle}' +
    '.nova-tor__best-poster{mask-image:linear-gradient(90deg,transparent 0%,black 38%);-webkit-mask-image:linear-gradient(90deg,transparent 0%,black 38%)}' +
    '.nova-tor-hero__bg img{filter:saturate(.82) contrast(1.05)}' +
    '.nova-tor-modal__panel{scrollbar-color:#e05b62 #252b36;scrollbar-width:thin}' +
     '@media screen and (max-width:580px){.nova-tor-hero{min-height:17em}.nova-tor-hero__badges{top:.75em;left:1em;right:1em;max-width:none;justify-content:flex-start;font-size:.78em}.nova-tor-hero__body{max-width:100%;padding:4.8em 1.3em 1.3em}.nova-tor-hero__title{font-size:1.7em}.nova-tor__best-poster{width:9em;opacity:.25}.nova-tor__best-cap,.nova-tor__best-title,.nova-tor__best-badges,.nova-tor__best-meta,.nova-tor__best-play{max-width:100%}.nova-tor-modal{padding:0}.nova-tor-modal__panel{width:100%;height:100%;max-height:none;padding:1.2em}.nova-tor-modal__rowmeta{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}' +
    '.nova-tor{padding:0 0 2em 0;position:relative}' +
    '.nova-tor *{-webkit-box-sizing:border-box;box-sizing:border-box}' +
    '.nova-tor-scope>.torrent-item.nova-tor-hidden{display:none!important}' +
    '.nova-tor__bar{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;align-items:center;margin-bottom:1em}' +
    '.nova-tor__chip{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-align:center;-webkit-align-items:center;align-items:center;padding:.55em 1.1em;-webkit-border-radius:2em;border-radius:2em;background:rgba(255,255,255,.07);margin:0 .6em .6em 0;font-size:1.05em;white-space:nowrap;max-width:22em}' +
    '.nova-tor__chip.focus{background:#fff;color:#000}' +
    '.nova-tor__chip--active{background:rgba(255,255,255,.16);-webkit-box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5);box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5)}' +
    '.nova-tor__chip--active.focus{-webkit-box-shadow:0 .2em .7em rgba(0,0,0,.4);box-shadow:0 .2em .7em rgba(0,0,0,.4)}' +
    '.nova-tor__chip-label{opacity:.6;font-size:.85em;letter-spacing:.06em;text-transform:uppercase;margin-right:.55em}' +
    '.nova-tor__chip.focus .nova-tor__chip-label{opacity:.5}' +
    '.nova-tor__chip-value{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;min-width:0}' +
     '.nova-tor__best-poster,.nova-tor-card__poster,.nova-tor-modal__poster{overflow:hidden;background:linear-gradient(135deg,#344052,#202734);position:relative;-webkit-flex-shrink:0;flex-shrink:0}.nova-tor__best-poster img,.nova-tor-card__poster img,.nova-tor-modal__poster img{display:block;width:100%;height:100%;object-fit:cover;position:relative;z-index:1}.nova-tor-image--broken{display:none!important}.nova-tor__best-poster--fallback,.nova-tor-card__poster--fallback,.nova-tor-modal__poster--fallback{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-align:center;-webkit-align-items:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;justify-content:center;color:#9ce5ad}.nova-tor__best-poster--fallback-icon,.nova-tor-card__poster--fallback-icon,.nova-tor-modal__poster--fallback-icon{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-align:center;-webkit-align-items:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;justify-content:center;color:#9ce5ad;font-size:1.1em;opacity:.8}.nova-tor__best-body{position:relative}' +
    '.nova-tor__best{position:relative;padding:1.3em 1.5em;-webkit-border-radius:1em;border-radius:1em;background:rgba(126,217,150,.12);-webkit-box-shadow:inset 0 0 0 .1em rgba(126,217,150,.35);box-shadow:inset 0 0 0 .1em rgba(126,217,150,.35);margin-bottom:1.1em}' +
    '.nova-tor__best.focus{background:#fff;color:#000;-webkit-box-shadow:0 .3em 1em rgba(0,0,0,.45);box-shadow:0 .3em 1em rgba(0,0,0,.45)}' +
    '.nova-tor__best-cap,.nova-tor__best-title,.nova-tor__best-badges,.nova-tor__best-meta,.nova-tor__best-play{position:relative;max-width:75%}' +
    '.nova-tor__best-cap{font-size:.85em;letter-spacing:.14em;text-transform:uppercase;color:#8fe0a4;margin-bottom:.5em}' +
    '.nova-tor__best.focus .nova-tor__best-cap{color:#2b7a45}' +
    '.nova-tor__best-title{font-size:1.35em;line-height:1.35;margin-bottom:.5em}' +
    '.nova-tor__best-badges{margin-bottom:.4em}' +
    '.nova-tor__best-meta{font-size:.95em;opacity:.7}' +
    '.nova-tor__best-play{display:inline-block;margin-top:.9em;padding:.5em 1.4em;-webkit-border-radius:2em;border-radius:2em;background:rgba(255,255,255,.18);font-size:1em}' +
    '.nova-tor__best.focus .nova-tor__best-play{background:rgba(0,0,0,.12)}' +
    '.nova-tor__stat{font-size:.9em;letter-spacing:.1em;text-transform:uppercase;opacity:.45;margin:0 0 .7em .2em}' +
    '.nova-tor__list{position:relative}' +
    '.nova-tor-quality{display:inline-block;min-width:3.3em;padding:.35em .55em;border-radius:.5em;background:#394353;color:#f4f2ed;text-align:center;font-weight:700;font-size:.86em;letter-spacing:.02em}.nova-tor-quality--4k{background:#c88a45;color:#fff2db}.nova-tor-source{display:inline-block;padding:.22em .55em;border-radius:.35em;background:rgba(143,224,164,.14);color:#9ce5ad;font-size:.75em;font-weight:600}.nova-tor-health{display:inline-block;padding:.22em .55em;border-radius:.35em;font-size:.75em;font-weight:600}.nova-tor-health--good{background:rgba(143,224,164,.14);color:#9ce5ad}.nova-tor-health--weak{background:rgba(231,190,104,.14);color:#e7be68}.nova-tor-health--dead{background:rgba(229,143,143,.14);color:#e58f8f}' +
    '.nova-tor-card{position:relative;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-align:center;-webkit-align-items:center;align-items:center;padding:.8em 1em;-webkit-border-radius:.9em;border-radius:.9em;background:rgba(255,255,255,.05);margin-bottom:.6em}' +
    '.nova-tor-card.focus{background:#fff;color:#000}' +
    '.nova-tor-card--best{-webkit-box-shadow:inset 0 0 0 .1em rgba(126,217,150,.55);box-shadow:inset 0 0 0 .1em rgba(126,217,150,.55)}' +
    '.nova-tor-card--dead{opacity:.55}' +
    '.nova-tor-card--dead.focus{opacity:1}' +
    '.nova-tor-card--viewed .nova-tor-card__title:before{content:"\\2713\\00a0";color:#8fe0a4}' +
    '.nova-tor-card__rank{-webkit-flex-shrink:0;flex-shrink:0;width:2.2em;text-align:center;font-size:1.1em;opacity:.4}' +
    '.nova-tor-card__poster{width:5.2em;height:3.2em;border-radius:.45em}.nova-tor-card__episode-name{font-size:.82em;opacity:.72;margin-top:.15em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.nova-tor-progress{position:absolute;left:0;right:0;bottom:0;height:.38em;background:rgba(10,13,20,.72);overflow:visible}.nova-tor-progress i{display:block;height:100%;background:#e05b62}.nova-tor-progress--done i{background:#e05b62}.nova-tor-progress b{position:absolute;right:.35em;bottom:.45em;padding:.12em .3em;border-radius:.25em;background:rgba(10,13,20,.8);color:#f4f2ed;font-size:.62em;font-weight:600}.nova-tor-card.focus .nova-tor-progress b{background:rgba(20,24,31,.78)}' +
    '.nova-tor-modal__poster{width:3.2em;height:2.1em;border-radius:.3em}' +
    '.nova-tor-card__quality{-webkit-flex-shrink:0;flex-shrink:0;width:3.8em;text-align:center}' +
    '.nova-tor-card__quality .nova-tor-quality{display:block}' +
    '.nova-tor-card__body{-webkit-box-flex:1;-webkit-flex-grow:1;flex-grow:1;min-width:1em;padding:0 1em;overflow:hidden}' +
    '.nova-tor-card__title{font-size:1.15em;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}' +
    '.nova-tor-card__badges{margin-top:.35em}' +
    '.nova-tor-card__meta{font-size:.9em;line-height:1.45;opacity:.6;margin-top:.3em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}' +
    '.nova-tor-card__score{-webkit-flex-shrink:0;flex-shrink:0;text-align:center;min-width:3.6em}' +
    '.nova-tor-card__score-num{font-size:1.3em;font-weight:600}' +
    '.nova-tor-card__continue{margin-top:.35em;padding:.2em .45em;border-radius:.3em;background:rgba(224,91,98,.16);color:#e8757a;font-size:.62em;font-weight:600;white-space:nowrap}' +
    '.nova-tor-card__score-cap{font-size:.7em;letter-spacing:.08em;text-transform:uppercase;opacity:.45}' +
    '.nova-tor-badge{display:inline-block;padding:.2em .55em;-webkit-border-radius:.35em;border-radius:.35em;background:rgba(255,255,255,.16);font-size:.75em;font-weight:600;letter-spacing:.04em;line-height:1.4;margin:0 .4em .3em 0}' +
    '.nova-tor-card.focus .nova-tor-badge,.nova-tor__best.focus .nova-tor-badge{background:rgba(0,0,0,.12)}' +
    '.nova-tor-dot{margin:0 .5em;opacity:.5}' +
    '.nova-tor-seed{color:#8fe0a4}' +
    '.nova-tor-seed--dead{color:#e58f8f}' +
    '.nova-tor-card.focus .nova-tor-seed,.nova-tor__best.focus .nova-tor-seed{color:#2b7a45}' +
    '.nova-tor-card.focus .nova-tor-seed--dead,.nova-tor__best.focus .nova-tor-seed--dead{color:#a33}' +
    '.nova-tor-peer{opacity:.7}' +
    '.nova-tor__empty{padding:2em;-webkit-border-radius:1em;border-radius:1em;background:rgba(255,255,255,.05)}' +
    '.nova-tor__empty-title{font-size:1.4em;margin-bottom:.4em}' +
    '.nova-tor__empty-text{font-size:1.05em;opacity:.6}' +
    '@media screen and (max-width:580px){' +
    '.nova-tor-card__rank{display:none}' +
    '.nova-tor-card__body{padding-left:0}.nova-tor-card__quality{width:3.2em}' +
    '.nova-tor__best-title{font-size:1.15em}}';

  function addCSS() {
    if (document.getElementById('nova-tor-css-v5')) return;
    var style = document.createElement('style');
    style.id = 'nova-tor-css-v5';
    style.textContent = CSS;
    (document.body || document.head).appendChild(style);
  }

  /* ------------------------------ старт ----------------------------- */

  function start() {
    if (!window.Lampa) return;

    purgeLegacyNova();
    addCSS();
    cleanupOldCache();
    try { setInterval(cleanupOldCache, 43200000); } catch (e) {}
    settings();
    try {
      Lampa.Listener.follow('activity', function (e) {
        if (e.type === 'start' || e.type === 'archive') {
          played = '';
          guard(schedule, 'activity schedule');
          setTimeout(function () { guard(schedule, 'delayed schedule'); }, 400);
          setTimeout(function () { guard(schedule, 'late schedule'); }, 1200);
        }
        if (e.type === 'destroy') guard(detach, 'activity detach');
      });
    } catch (e) {}

    try {
      Lampa.Controller.listener.follow('toggle', function (e) {
        if (e.name === 'content') guard(schedule, 'controller schedule');
      });
    } catch (e) {}

    try {
      window.addEventListener('error', function (event) {
        var text = String(event && (event.message || event.error && event.error.stack) || '');
        if (/nova[_-]?tor/i.test(text)) fault(event.error || text, 'window error');
      });
      window.addEventListener('unhandledrejection', function (event) {
        var reason = event && event.reason;
        var text = String(reason && (reason.stack || reason.message) || reason || '');
        if (/nova[_-]?tor/i.test(text)) fault(reason, 'promise rejection');
      });
    } catch (e) {}
    guard(schedule, 'initial draw');
  }

  window.nova_torrents_api = {
    parseTitle: parseTitle,
    sizeGb: sizeGb,
    dateStamp: dateStamp,
    prepare: prepare,
    score: score,
    sortList: sortList,
    evaluate: evaluate,
    refresh: function () { guard(function () { draw(true); }, 'api refresh'); },
    emergency: function () { emergencyDisable('manual'); },
    recover: function () { recoverEmergency(); guard(function () { draw(true); }, 'api recover'); },
    status: function () { return { disabled: emergency_off, faults: fault_count, last: fault_last }; }
  };

  if (window.appready) start();
  else {
    try {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') start();
      });
    } catch (err) {
      setTimeout(start, 2000);
    }
  }
})();
