(function () {
  'use strict';

  if (window.nova_torrents) return;
  window.nova_torrents = true;

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
    pick_tracker: 'nova_tor_pick_tracker'
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

  /* ----------------------------- языки ------------------------------ */

  var DICT = {
    ru: {
      name: 'Nova Torrents',
      best: 'Лучшая раздача',
      play: 'Смотреть',
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
      lang: String(get(STORE.lang, 'ru')),
      hevc: get(STORE.hevc, true) !== false,
      hdr: get(STORE.hdr, true) !== false
    };
  }

  function score(item, pref) {
    var info = item.info;
    var base = { 2160: 1000, 1080: 820, 720: 540, 480: 260 };
    var value = info.quality ? base[info.quality] : 430;

    if (pref.quality !== 'auto') {
      var want = parseInt(pref.quality, 10) || 0;
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
        viewed: !!raw.viewed
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
  var natives = [];
  var data = null;
  var signature = '';
  var observer = null;
  var observed = null;
  var timer = null;
  var mutating = false;
  var played = '';

  function scope() {
    if (!enabled()) return null;
    if (!window.Lampa || !window.$) return null;

    var current;
    try { current = Lampa.Activity.active(); } catch (e) { return null; }
    if (!current || !current.activity) return null;

    var component = '';
    try { component = String(current.component || ''); } catch (e) { component = ''; }
    if (component.toLowerCase().indexOf('torrent') === -1) return null;

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
    if (!body.find('.torrent-item').length) return null;

    return { root: box, body: body };
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
      viewed: origin.find('.torrent-item__viewed').length > 0 || origin.hasClass('torrent-item--viewed')
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

  function buildBar() {
    var bar = $('<div class="nova-tor__bar"></div>');
    var pick = data.pick;
    var face = data.facets;

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
    box.append('<div class="nova-tor__best-cap">' + esc(t('best')) + '</div>');
    box.append('<div class="nova-tor__best-title">' + esc(item.title) + '</div>');
    box.append('<div class="nova-tor__best-badges">' + badgeHtml(badges(item)) + '</div>');
    box.append('<div class="nova-tor__best-meta">' + metaLine(item) + '</div>');
    box.append('<div class="nova-tor__best-play">' + esc(t('play')) + '</div>');

    return bind(box, function () { launch(item); }, function () { context(item); });
  }

  function buildCard(item, position) {
    var card = $('<div class="nova-tor-card selector" data-key="card-' + item.index + '"></div>');
    if (item.best) card.addClass('nova-tor-card--best');
    if (item.seeds <= 0) card.addClass('nova-tor-card--dead');
    if (item.viewed) card.addClass('nova-tor-card--viewed');

    card.append('<div class="nova-tor-card__rank">' + position + '</div>');

    var body = $('<div class="nova-tor-card__body"></div>');
    body.append('<div class="nova-tor-card__title">' + esc(item.title) + '</div>');
    var line = badgeHtml(badges(item));
    if (line) body.append('<div class="nova-tor-card__badges">' + line + '</div>');
    body.append('<div class="nova-tor-card__meta">' + metaLine(item) + '</div>');
    card.append(body);

    card.append('<div class="nova-tor-card__score"><div class="nova-tor-card__score-num">' + item.rate +
      '</div><div class="nova-tor-card__score-cap">' + esc(t('rating')) + '</div></div>');

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
    timer = setTimeout(function () { draw(false); }, 120);
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

      function param(item, field, on_change) {
        Lampa.SettingsApi.addParam({
          component: 'nova_torrents',
          param: item,
          field: field,
          onChange: on_change || function () {}
        });
      }

      function refresh() {
        played = '';
        draw(true);
      }

      param({ name: STORE.enabled, type: 'trigger', default: true },
        { name: t('set_enable'), description: t('set_enable_descr') },
        function () {
          if (enabled()) draw(true);
          else detach();
        });

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

      param({ name: STORE.autofocus, type: 'trigger', default: true },
        { name: t('set_autofocus'), description: t('set_autofocus_descr') });

      param({ name: STORE.autoplay, type: 'trigger', default: false },
        { name: t('set_autoplay'), description: t('set_autoplay_descr') });
    } catch (e) {}
  }

  /* ------------------------------ стили ----------------------------- */

  var CSS = '' +
    '.nova-tor{padding:0 0 2em 0;position:relative}' +
    '.nova-tor *{-webkit-box-sizing:border-box;box-sizing:border-box}' +
    '.nova-tor-hidden{display:none!important}' +
    '.nova-tor__bar{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-align:center;-webkit-align-items:center;align-items:center;margin-bottom:1em}' +
    '.nova-tor__chip{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-align:center;-webkit-align-items:center;align-items:center;padding:.55em 1.1em;-webkit-border-radius:2em;border-radius:2em;background:rgba(255,255,255,.07);margin:0 .6em .6em 0;font-size:1.05em;white-space:nowrap;max-width:22em}' +
    '.nova-tor__chip.focus{background:#fff;color:#000}' +
    '.nova-tor__chip--active{background:rgba(255,255,255,.16);-webkit-box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5);box-shadow:inset 0 0 0 .1em rgba(255,255,255,.5)}' +
    '.nova-tor__chip--active.focus{-webkit-box-shadow:0 .2em .7em rgba(0,0,0,.4);box-shadow:0 .2em .7em rgba(0,0,0,.4)}' +
    '.nova-tor__chip-label{opacity:.6;font-size:.85em;letter-spacing:.06em;text-transform:uppercase;margin-right:.55em}' +
    '.nova-tor__chip.focus .nova-tor__chip-label{opacity:.5}' +
    '.nova-tor__chip-value{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;min-width:0}' +
    '.nova-tor__best{position:relative;padding:1.3em 1.5em;-webkit-border-radius:1em;border-radius:1em;background:rgba(126,217,150,.12);-webkit-box-shadow:inset 0 0 0 .1em rgba(126,217,150,.35);box-shadow:inset 0 0 0 .1em rgba(126,217,150,.35);margin-bottom:1.1em}' +
    '.nova-tor__best.focus{background:#fff;color:#000;-webkit-box-shadow:0 .3em 1em rgba(0,0,0,.45);box-shadow:0 .3em 1em rgba(0,0,0,.45)}' +
    '.nova-tor__best-cap{font-size:.85em;letter-spacing:.14em;text-transform:uppercase;color:#8fe0a4;margin-bottom:.5em}' +
    '.nova-tor__best.focus .nova-tor__best-cap{color:#2b7a45}' +
    '.nova-tor__best-title{font-size:1.35em;line-height:1.35;margin-bottom:.5em}' +
    '.nova-tor__best-badges{margin-bottom:.4em}' +
    '.nova-tor__best-meta{font-size:.95em;opacity:.7}' +
    '.nova-tor__best-play{display:inline-block;margin-top:.9em;padding:.5em 1.4em;-webkit-border-radius:2em;border-radius:2em;background:rgba(255,255,255,.18);font-size:1em}' +
    '.nova-tor__best.focus .nova-tor__best-play{background:rgba(0,0,0,.12)}' +
    '.nova-tor__stat{font-size:.9em;letter-spacing:.1em;text-transform:uppercase;opacity:.45;margin:0 0 .7em .2em}' +
    '.nova-tor__list{position:relative}' +
    '.nova-tor-card{position:relative;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-align:center;-webkit-align-items:center;align-items:center;padding:.8em 1em;-webkit-border-radius:.9em;border-radius:.9em;background:rgba(255,255,255,.05);margin-bottom:.6em}' +
    '.nova-tor-card.focus{background:#fff;color:#000}' +
    '.nova-tor-card--best{-webkit-box-shadow:inset 0 0 0 .1em rgba(126,217,150,.55);box-shadow:inset 0 0 0 .1em rgba(126,217,150,.55)}' +
    '.nova-tor-card--dead{opacity:.55}' +
    '.nova-tor-card--dead.focus{opacity:1}' +
    '.nova-tor-card--viewed .nova-tor-card__title:before{content:"\\2713\\00a0";color:#8fe0a4}' +
    '.nova-tor-card__rank{-webkit-flex-shrink:0;flex-shrink:0;width:2.2em;text-align:center;font-size:1.1em;opacity:.4}' +
    '.nova-tor-card__body{-webkit-box-flex:1;-webkit-flex-grow:1;flex-grow:1;min-width:1em;padding:0 1em;overflow:hidden}' +
    '.nova-tor-card__title{font-size:1.15em;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}' +
    '.nova-tor-card__badges{margin-top:.35em}' +
    '.nova-tor-card__meta{font-size:.9em;line-height:1.45;opacity:.6;margin-top:.3em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}' +
    '.nova-tor-card__score{-webkit-flex-shrink:0;flex-shrink:0;text-align:center;min-width:3.6em}' +
    '.nova-tor-card__score-num{font-size:1.3em;font-weight:600}' +
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
    '.nova-tor-card__body{padding-left:0}' +
    '.nova-tor__best-title{font-size:1.15em}}';

  function addCSS() {
    if (document.getElementById('nova-tor-css')) return;
    var style = document.createElement('style');
    style.id = 'nova-tor-css';
    style.textContent = CSS;
    (document.body || document.head).appendChild(style);
  }

  /* ------------------------------ старт ----------------------------- */

  function start() {
    if (!window.Lampa) return;

    addCSS();
    settings();
    hookScroll();

    try {
      Lampa.Listener.follow('activity', function (e) {
        if (e.type === 'start' || e.type === 'archive') {
          played = '';
          schedule();
          setTimeout(schedule, 400);
          setTimeout(schedule, 1200);
        }
        if (e.type === 'destroy') detach();
      });
    } catch (e) {}

    try {
      Lampa.Controller.listener.follow('toggle', function (e) {
        if (e.name === 'content') schedule();
      });
    } catch (e) {}

    schedule();
  }

  window.nova_torrents_api = {
    parseTitle: parseTitle,
    sizeGb: sizeGb,
    dateStamp: dateStamp,
    prepare: prepare,
    score: score,
    sortList: sortList,
    evaluate: evaluate,
    refresh: function () { draw(true); }
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
