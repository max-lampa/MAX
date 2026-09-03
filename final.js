(function () {
  'use strict';

  if (window.LampaTorrentUIFullReplace) return;
  try {
    if (window.LampaTorrentUIFinalRestore &&
        window.LampaTorrentUIFinalRestore.close) {
      window.LampaTorrentUIFinalRestore.close();
    }
    if (window.LampaTorrentUIFinalRestore &&
        window.LampaTorrentUIFinalRestore.disconnect) {
      window.LampaTorrentUIFinalRestore.disconnect();
    }
  } catch (e) {}

  var ROOT = 'lampa-torrents-final-restore';
  var STYLE = 'lampa-torrents-final-restore-css';
  var K = {
    enabled: 'lt_final_enabled',
    auto: 'lt_final_auto',
    mode: 'lt_final_mode',
    focus: 'lt_final_focus'
  };

  var st = {
    mode: 'wide',
    sort: 'seeds',
    provider: 'all',
    season: 'all',
    focus: 0,
    selected: 0,
    items: []
  };

  var observer = null;
  var timer = 0;
  var bootTimer = 0;
  var lastHost = null;
  var lastSig = '';
  var closedUntil = 0;
  var manualClosed = false;
  var hiddenHost = null;
  var hiddenHostStyle = null;
  var hiddenHostAria = null;
  var keyTarget = null;
  var openingNative = false;
  var openingUntil = 0;
  var openingTimer = 0;
  var keepTimer = 0;
  var destroyTimer = 0;
  var TICK = 900;

  var hosts = '.explorer__files-body,.torrent,[class*="torrent-list"],[class*="torrent__list"],[class*="torrents-list"],[data-torrent-list]';
  var items = '.torrent-item,.torrent-item__item,[class*="torrent-item"],[class*="torrent__item"],[data-torrent]';

  function get(k, d) {
    try {
      return window.Lampa && Lampa.Storage ? Lampa.Storage.get(k, d) : d;
    } catch (e) {
      return d;
    }
  }

  function set(k, v) {
    try {
      if (window.Lampa && Lampa.Storage) Lampa.Storage.set(k, v);
    } catch (e) {}
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[c];
    });
  }

  function pick(n, selectors) {
    for (var i = 0; i < selectors.length; i++) {
      var x = n.querySelector(selectors[i]);
      if (x && x.textContent.trim()) return x.textContent.trim();
    }
    return '';
  }

  function num(v) {
    var n = String(v || '').replace(/[^0-9]/g, '');
    return n ? Number(n) : 0;
  }

  function addRange(map, a, b) {
    if (!a || !b || b < a || b - a > 40) return;
    for (var i = a; i <= b; i++) map[i] = 1;
  }

  function seasonsFrom(text) {
    var t = ' ' + String(text || '').toLowerCase().replace(/\u0451/g, '\u0435') + ' ';
    var map = {};
    var m;

    var reRangeS = /[^a-z0-9](?:s|se|sez)\s?(\d{1,2})\s?[-\u2013\u2014~]\s?(?:s|se|sez)?\s?(\d{1,2})(?![0-9])/g;
    while ((m = reRangeS.exec(t))) addRange(map, +m[1], +m[2]);

    var reRangeWordFirst = /(?:\u0441\u0435\u0437\u043e\u043d\w*|season\w*)\s*(\d{1,2})\s*[-\u2013\u2014]\s*(\d{1,2})(?![0-9])/g;
    while ((m = reRangeWordFirst.exec(t))) addRange(map, +m[1], +m[2]);

    var reRangeWordLast = /(\d{1,2})\s*[-\u2013\u2014]\s*(\d{1,2})\s*(?:\u0441\u0435\u0437\u043e\u043d\w*|season\w*)/g;
    while ((m = reRangeWordLast.exec(t))) addRange(map, +m[1], +m[2]);

    var reListWord = /(?:\u0441\u0435\u0437\u043e\u043d\w*|season\w*)\s*((?:\d{1,2}\s*[,+]\s*)+\d{1,2})/g;
    while ((m = reListWord.exec(t))) {
      m[1].split(/[,+]/).forEach(function (v) {
        var n = parseInt(v, 10);
        if (n > 0 && n < 60) map[n] = 1;
      });
    }

    var reSingleS = /[^a-z0-9](?:s|se|sez)\s?(\d{1,2})(?![0-9])/g;
    while ((m = reSingleS.exec(t))) {
      var n1 = +m[1];
      if (n1 > 0 && n1 < 60) map[n1] = 1;
    }

    var reWordAfter = /(?:\u0441\u0435\u0437\u043e\u043d|season)\s*[\u2116#]?\s*(\d{1,2})(?![0-9])/g;
    while ((m = reWordAfter.exec(t))) {
      var n2 = +m[1];
      if (n2 > 0 && n2 < 60) map[n2] = 1;
    }

    var reWordBefore = /(\d{1,2})\s*(?:-?\u0439)?\s*(?:\u0441\u0435\u0437\u043e\u043d|season)/g;
    while ((m = reWordBefore.exec(t))) {
      var n3 = +m[1];
      if (n3 > 0 && n3 < 60) map[n3] = 1;
    }

    var out = Object.keys(map).map(Number).sort(function (a, b) { return a - b; });
    return out;
  }

  function episodesFrom(text) {
    var t = ' ' + String(text || '').toLowerCase().replace(/\u0451/g, '\u0435') + ' ';
    var m = t.match(/e\s?(\d{1,3})\s?[-\u2013\u2014]\s?e?\s?(\d{1,3})(?![0-9])/);
    if (m) return [+m[1], +m[2]];
    m = t.match(/(?:\u0441\u0435\u0440\u0438\u0438|\u0441\u0435\u0440\u0438\u044f|\u0441\u0435\u0440\u0438\u0439)\s*(\d{1,3})\s*[-\u2013\u2014]\s*(\d{1,3})(?![0-9])/);
    if (m) return [+m[1], +m[2]];
    m = t.match(/(\d{1,3})\s*[-\u2013\u2014]\s*(\d{1,3})\s*(?:\u0441\u0435\u0440\u0438\u0438|\u0441\u0435\u0440\u0438\u0439)/);
    if (m) return [+m[1], +m[2]];
    m = t.match(/[^a-z0-9]s\s?\d{1,2}\s?e\s?(\d{1,3})(?![0-9])/);
    if (m) return [+m[1], +m[1]];
    m = t.match(/(\d{1,3})\s*\u0441\u0435\u0440\u0438\u044f/);
    if (m) return [+m[1], +m[1]];
    return null;
  }

  function isFullPack(text) {
    var t = String(text || '').toLowerCase().replace(/\u0451/g, '\u0435');
    return /\u043f\u043e\u043b\u043d\u044b\u0439 \u0441\u0435\u0437\u043e\u043d|\u0432\u0441\u0435 \u0441\u0435\u0440\u0438\u0438|\u0441\u0435\u0437\u043e\u043d \u0446\u0435\u043b\u0438\u043a\u043e\u043c|complete|full season/.test(t);
  }

  function seasonLabel(seasons, episodes, pack) {
    if (!seasons.length) {
      if (episodes) return episodes[0] === episodes[1] ? '\u0421\u0435\u0440\u0438\u044f ' + episodes[0] : '\u0421\u0435\u0440\u0438\u0438 ' + episodes[0] + '-' + episodes[1];
      return pack ? '\u041f\u043e\u043b\u043d\u044b\u0439 \u0441\u0435\u0437\u043e\u043d' : '\u0411\u0435\u0437 \u0441\u0435\u0437\u043e\u043d\u0430';
    }
    var base;
    if (seasons.length === 1) {
      base = '\u0421\u0435\u0437\u043e\u043d ' + seasons[0];
    } else if (seasons[seasons.length - 1] - seasons[0] === seasons.length - 1) {
      base = '\u0421\u0435\u0437\u043e\u043d\u044b ' + seasons[0] + '-' + seasons[seasons.length - 1];
    } else {
      base = '\u0421\u0435\u0437\u043e\u043d\u044b ' + seasons.join(', ');
    }
    if (episodes && seasons.length === 1) {
      base += episodes[0] === episodes[1]
        ? ', \u0441\u0435\u0440\u0438\u044f ' + episodes[0]
        : ', \u0441\u0435\u0440\u0438\u0438 ' + episodes[0] + '-' + episodes[1];
    }
    return base;
  }

  function qualityFrom(text, fallback) {
    var t = String(text || '').toLowerCase();
    if (/2160|4k|uhd/.test(t)) return '4K';
    if (/1440/.test(t)) return '2K';
    if (/1080/.test(t)) return 'FHD';
    if (/720/.test(t)) return 'HD';
    if (/\b(480|360|dvdrip|sd)\b/.test(t)) return 'SD';
    return fallback || '';
  }

  function sizeGb(v) {
    var t = String(v == null ? '' : v).toLowerCase().replace(/\s+/g, ' ').replace(',', '.');
    var m = t.match(/([0-9]+(?:\.[0-9]+)?)\s*(\u0442\u0431|tb|\u0433\u0431|gb|\u043c\u0431|mb|\u043a\u0431|kb|b)?/);
    if (!m) return 0;
    var n = parseFloat(m[1]) || 0;
    var u = m[2] || '\u0433\u0431';
    if (u === '\u0442\u0431' || u === 'tb') return n * 1024;
    if (u === '\u043c\u0431' || u === 'mb') return n / 1024;
    if (u === '\u043a\u0431' || u === 'kb') return n / 1048576;
    if (u === 'b') return n / 1073741824;
    return n;
  }

  function yearFrom(text) {
    var m = String(text || '').match(/(19[5-9]\d|20[0-4]\d)/g);
    if (!m) return 0;
    return Math.max.apply(null, m.map(Number));
  }

  function hasSeasonMarker(text) {
    return /(?:^|[^a-z0-9])s\s?\d{1,2}(?:[^0-9]|$)|(?:\u0441\u0435\u0437\u043e\u043d\w*|season\w*)\s*[#\u2116]?\s*\d{1,2}/i.test(String(text || ''));
  }

  function seasonsFromField(v) {
    if (v == null) return [];
    if (typeof v === 'number' && v > 0 && v < 60) return [Math.floor(v)];
    if (Object.prototype.toString.call(v) === '[object Array]') {
      var out = [];
      v.forEach(function (x) {
        var n = typeof x === 'number' ? x : parseInt(x && (x.season || x.number || x), 10);
        if (n > 0 && n < 60 && out.indexOf(n) < 0) out.push(n);
      });
      return out.sort(function (a, b) { return a - b; });
    }
    return seasonsFrom(String(v));
  }

  function norm(x) {
    x = x || {};
    var source = x.source || x.tracker || x.Tracker || 'WEB-DL';
    var name = x.name || x.title || x.Title || x.filename || 'Раздача';
    var size = x.size || x.Size || x.filesize || '0 ГБ';
    var hay = [name, x.text, x.info, x.details, x.meta, x.title, x.original_name].filter(Boolean).join(' ');

    var explicitSeasons = seasonsFromField(x.seasons != null ? x.seasons : x.season);
    var seasons = hasSeasonMarker(name) ? seasonsFrom(name) : explicitSeasons;
    if (!seasons.length) seasons = seasonsFrom(name);
    if (!seasons.length) seasons = seasonsFrom(hay);
    var episodes = episodesFrom(name) || episodesFrom(hay);
    var pack = isFullPack(hay);

    return {
      name: name,
      quality: qualityFrom(hay, x.quality || x.resolution || '') || x.quality || x.resolution || 'FHD',
      size: size,
      gb: sizeGb(size),
      year: yearFrom(hay),
      seeds: Number(x.seeds || x.Seeders || x.seed || x.seeders || x.peers || 0),
      seasons: seasons,
      episodes: episodes,
      pack: pack,
      season: seasonLabel(seasons, episodes, pack),
      source: source,
      studio: x.studio || x.voice || x.voiceName || 'Lampa',
      provider: x.provider || x.studio || x.tracker || x.Tracker || source || 'Lampa',
      native: x.native || null
    };
  }

  function parse(n) {
    var title = pick(n, [
      '.torrent-item__title',
      '.torrent-item__name',
      '[data-title]',
      '.torrent-item__info'
    ]);
    var size = pick(n, ['.torrent-item__size', '[class*="size"]']);
    var seed = pick(n, [
      '.torrent-item__seeders',
      '.torrent-item__seeds',
      '[class*="seed"]',
      '[class*="peer"]'
    ]);
    var quality = pick(n, [
      '.torrent-item__quality',
      '[class*="quality"]',
      '[class*="resolution"]'
    ]);
    var source = pick(n, [
      '.torrent-item__tracker',
      '.torrent-item__source',
      '.torrent-item__provider',
      '[data-source]',
      '[class*="tracker"]'
    ]) || 'WEB-DL';
    var meta = pick(n, ['.torrent-item__details', '.torrent-item__meta']);
    var seasonField = pick(n, ['.torrent-item__season', '.torrent__season', '[data-season]']);
    if (!seasonField && n.getAttribute) seasonField = n.getAttribute('data-season') || '';

    return norm({
      name: title || n.textContent.trim().slice(0, 150),
      text: n.textContent || '',
      meta: meta,
      seasons: seasonField,
      size: size,
      seeds: num(seed),
      quality: quality,
      source: source,
      provider: source,
      studio: meta.replace(title, '').replace(size, '').trim().split(/\s{2,}| · |•/)[0] || 'Lampa',
      native: n
    });
  }

  function demo() {
    return [
      norm({
        name: '[S01] (2024) WEB-DL 1080p',
        quality: 'FHD',
        size: '22,58 ГБ',
        seeds: 1134,
        source: 'WEB-DL',
        studio: 'LostFilm',
        provider: 'LostFilm'
      }),
      norm({
        name: 'The Gentlemen / Джентльмены (2020) WEB-DL',
        quality: 'FHD',
        size: '18,09 ГБ',
        seeds: 5491,
        source: 'WEB-DL',
        studio: 'HDRеzka',
        provider: 'HDRеzka'
      }),
      norm({
        name: 'The Gentlemen 2024 S01 2160p UHD BluRay',
        quality: '4K',
        size: '64,31 ГБ',
        seeds: 328,
        source: 'UHD',
        studio: 'HDR',
        provider: 'HDR'
      }),
      norm({
        name: 'Сериал S01-S03 (2022-2024) WEB-DL 1080p',
        size: '58,4 ГБ',
        seeds: 407,
        source: 'WEB-DL',
        studio: 'HDRezka',
        provider: 'HDRezka'
      }),
      norm({
        name: 'Сезон 2, серии 1-8 (2023) BDRip 720p',
        size: '940 МБ',
        seeds: 96,
        source: 'BDRip',
        studio: 'LostFilm',
        provider: 'LostFilm'
      }),
      norm({
        name: 'Джентльмены, полный сезон, дубляж',
        quality: 'HD',
        size: '9,42 ГБ',
        seeds: 842,
        source: 'WEB-DL',
        studio: 'Дубляж',
        provider: 'Дубляж'
      })
    ];
  }

  function inject() {
    if (document.getElementById(STYLE)) return;

    var s = document.createElement('style');
    s.id = STYLE;
    s.textContent = [
      '.ltrf{position:fixed;inset:0;z-index:2147483646;overflow:auto;background:#11131c;color:#f5f2f8;font-family:Arial,Helvetica,sans-serif}',
      '.ltrf:before{content:"";position:fixed;inset:0;z-index:-2;background:linear-gradient(115deg,#17131f,#101821 58%,#101119)}',
      '.ltrf:after{content:"";position:fixed;inset:0;z-index:-1;opacity:.36;background:radial-gradient(ellipse at 18% 18%,#6b2d3a 0,transparent 24%),radial-gradient(ellipse at 70% 8%,#243c48 0,transparent 29%),radial-gradient(ellipse at 82% 75%,#402448 0,transparent 32%)}',
      '.ltrf *{box-sizing:border-box}',
      '.ltrf-in{width:min(1500px,100%);margin:auto;padding:48px 5.2vw 72px}',
      '.ltrf-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}',
      '.ltrf-label{font-size:20px;letter-spacing:.22em;text-transform:uppercase;color:#a477ef}',
      '.ltrf-label:before{content:"";display:inline-block;width:27px;height:2px;background:#a477ef;vertical-align:middle;margin:0 12px 4px 0;box-shadow:0 0 16px #945fe7}',
      '.ltrf-actions{display:flex;gap:10px}',
      '.ltrf-btn{min-height:48px;padding:0 16px;border:1px solid #51495f;border-radius:12px;background:#282531;color:#ddd7e5;font-size:14px;cursor:pointer}',
      '.ltrf-btn:focus,.ltrf-chip:focus,.ltrf-row:focus{outline:none}',
      '.ltrf-restore{color:#e1b5bc;border-color:#875563}',
      '.ltrf-close{width:48px;padding:0;border-radius:50%;font-size:26px}',
      '.ltrf-title{margin:0 0 30px;font-size:clamp(34px,5vw,58px);font-weight:400;line-height:1;letter-spacing:-.055em}',
      '.ltrf-chips{display:flex;gap:12px;overflow:auto;padding:0 0 25px;scrollbar-width:none}',
      '.ltrf-chip{white-space:nowrap;padding:12px 28px;border:0;border-radius:999px;background:#36353d;color:#e5e2e7;font-size:22px;cursor:pointer}',
      '.ltrf-chip.active{background:#6842a7;color:#fff;box-shadow:0 0 0 1px #a475f0 inset}',
      '.ltrf-seasons{display:flex;align-items:center;gap:10px;overflow:auto;padding:0 0 22px;scrollbar-width:none}',
      '.ltrf-season{white-space:nowrap;padding:11px 22px;border:1px solid #3f5a54;border-radius:999px;background:#1d2a2a;color:#d5e5e0;font-size:19px;cursor:pointer}',
      '.ltrf-season.active{border-color:#4fd6b0;background:#1f4a41;color:#eafff8;box-shadow:0 0 0 1px #4fd6b0 inset}',
      '.ltrf-season b{margin-left:9px;color:#8fb8ad;font-weight:400;font-size:.78em}',
      '.ltrf-season.active b{color:#bff2e5}',
      '.ltrf.compact .ltrf-seasons{padding-bottom:16px}',
      '.ltrf.compact .ltrf-season{padding:8px 16px;font-size:15px}',
      '.ltrf-sources{display:flex;align-items:center;gap:10px;overflow:auto;padding:0 0 25px;scrollbar-width:none}',
      '.ltrf-source{white-space:nowrap;padding:10px 20px;border:1px solid #4a5061;border-radius:999px;background:#202635;color:#d9dce5;font-size:18px;cursor:pointer}',
      '.ltrf-source.active{border-color:#a475f0;background:#493175;color:#fff;box-shadow:0 0 0 1px #a475f0 inset}',
      '.ltrf-found{margin-bottom:17px;color:#b0b2bf;font-size:24px}',
      '.ltrf-found strong{color:#faf8ff;font-weight:400}',
      '.ltrf-list{display:flex;flex-direction:column;gap:9px}',
      '.ltrf-row{display:grid;grid-template-columns:180px minmax(0,1fr) 185px;min-height:124px;overflow:hidden;border:1px solid #3e4558;background:#292f42;cursor:pointer}',
      '.ltrf-row.selected{border-color:#8261c0;background:#2d354b}',
      '.ltrf-focus{outline:3px solid #bd91ff!important;outline-offset:5px;box-shadow:0 0 0 7px #8d5edb44!important}',
      '.ltrf-fill{outline:0!important;box-shadow:0 0 0 5px #eee inset!important;background:#eee!important;color:#17131f!important}',
      '.ltrf-fill .ltrf-tag{color:#17131f;background:#ddd}',
      '.ltrf-quality{display:flex;align-items:center;padding-left:36px;border-right:1px solid #464d5e;font-size:39px;font-weight:700}',
      '.ltrf-detail{min-width:0;padding:18px 25px}',
      '.ltrf-name{margin-bottom:12px;overflow:hidden;color:#bcbcc9;font-size:20px;white-space:nowrap;text-overflow:ellipsis}',
      '.ltrf-tag{display:inline-block;margin:0 8px 8px 0;padding:10px 16px;border-radius:12px;background:#5334a0;color:#c5a7ff;font-size:18px}',
      '.ltrf-tag.cyan{background:#244664;color:#61bdf0}',
      '.ltrf-tag.dim{background:#303849;color:#989dab}',
      '.ltrf-stat{padding:22px 29px 0 5px;text-align:right}',
      '.ltrf-size{font-size:29px;font-weight:700;white-space:nowrap}',
      '.ltrf-seeds{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-top:14px;color:#40e784;font-size:21px}',
      '.ltrf-bars{display:flex;align-items:flex-end;gap:3px;height:19px}',
      '.ltrf-bars i{display:block;width:4px;border-radius:5px;background:#40e784}',
      '.ltrf-bars i:nth-child(1){height:6px}.ltrf-bars i:nth-child(2){height:10px}.ltrf-bars i:nth-child(3){height:15px}.ltrf-bars i:nth-child(4){height:19px}',
      '.ltrf-empty{display:none;padding:44px 20px;border:1px dashed #555a6c;border-radius:16px;text-align:center;color:#aeb0bd}',
      '.ltrf-empty strong{display:block;margin-bottom:7px;color:#fff}',
      '.ltrf-help{margin-top:18px;color:#9294a4;font-size:13px}',
      '.ltrf-help kbd{padding:4px 7px;border:1px solid #4c4d5b;border-radius:5px;background:#272936;color:#e2dfeb}',
      '.ltrf.compact .ltrf-in{width:min(1160px,100%);padding-top:34px}',
      '.ltrf.compact .ltrf-title{font-size:42px;margin-bottom:22px}',
      '.ltrf.compact .ltrf-chips{padding-bottom:18px}',
      '.ltrf.compact .ltrf-chip{padding:10px 20px;font-size:16px}',
      '.ltrf.compact .ltrf-sources{padding-bottom:18px}',
      '.ltrf.compact .ltrf-source{padding:8px 14px;font-size:14px}',
      '.ltrf.compact .ltrf-found{font-size:18px}',
      '.ltrf.compact .ltrf-row{grid-template-columns:110px minmax(0,1fr) 145px;min-height:82px}',
      '.ltrf.compact .ltrf-quality{padding-left:22px;font-size:26px}',
      '.ltrf.compact .ltrf-detail{padding:12px 17px}',
      '.ltrf.compact .ltrf-name{margin-bottom:7px;font-size:15px}',
      '.ltrf.compact .ltrf-tag{padding:6px 10px;border-radius:8px;font-size:12px}',
      '.ltrf.compact .ltrf-stat{padding:15px 20px 0 4px}',
      '.ltrf.compact .ltrf-size{font-size:19px}',
      '.ltrf.compact .ltrf-seeds{margin-top:7px;font-size:15px}',
      '@media(max-width:700px){.ltrf-seasons,.ltrf.compact .ltrf-seasons{padding-bottom:17px}.ltrf-season,.ltrf.compact .ltrf-season{padding:8px 14px;font-size:14px}}',
      '@media(max-width:700px){.ltrf-in{padding:25px 14px 44px}.ltrf-label{font-size:15px}.ltrf-actions{gap:6px}.ltrf-btn{padding:0 10px;font-size:11px}.ltrf-title,.ltrf.compact .ltrf-title{font-size:35px;margin-bottom:20px}.ltrf-chips{padding-bottom:17px}.ltrf-chip,.ltrf.compact .ltrf-chip{padding:10px 17px;font-size:15px}.ltrf-sources{padding-bottom:19px}.ltrf-source,.ltrf.compact .ltrf-source{padding:8px 14px;font-size:14px}.ltrf-found,.ltrf.compact .ltrf-found{font-size:17px}.ltrf-row,.ltrf.compact .ltrf-row{grid-template-columns:61px minmax(0,1fr);min-height:0}.ltrf-quality,.ltrf.compact .ltrf-quality{min-height:88px;padding-left:13px;font-size:17px}.ltrf-detail,.ltrf.compact .ltrf-detail{padding:14px 12px}.ltrf-name,.ltrf.compact .ltrf-name{font-size:13px}.ltrf-tag,.ltrf.compact .ltrf-tag{padding:7px 9px;border-radius:8px;font-size:11px}.ltrf-stat,.ltrf.compact .ltrf-stat{grid-column:2;padding:0 12px 14px;text-align:left}.ltrf-size,.ltrf.compact .ltrf-size{font-size:17px}.ltrf-seeds,.ltrf.compact .ltrf-seeds{justify-content:flex-start;font-size:15px}.ltrf-help{display:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  function matchSeason(x, value) {
    if (value === 'all') return true;
    if (value === 'none') return !x.seasons.length;
    var n = Number(value);
    if (!n) return true;
    return x.seasons.indexOf(n) >= 0;
  }

  function filtered(season, provider) {
    return st.items.filter(function (x) {
      return (provider === 'all' || x.provider === provider) && matchSeason(x, season);
    });
  }

  function list() {
    var a = filtered(st.season, st.provider);

    if (st.sort === 'size') {
      a.sort(function (x, y) {
        return (y.gb - x.gb) || (y.seeds - x.seeds);
      });
    } else if (st.sort === 'date') {
      a.sort(function (x, y) {
        return (y.year - x.year) || (y.seeds - x.seeds);
      });
    } else if (st.sort === 'name') {
      a.sort(function (x, y) {
        return String(x.name).localeCompare(String(y.name), 'ru');
      });
    } else {
      a.sort(function (x, y) {
        return (y.seeds - x.seeds) || (y.gb - x.gb);
      });
    }
    return a;
  }

  function seasonValues() {
    var map = {};
    var hasNone = false;
    st.items.forEach(function (x) {
      if (!x.seasons.length) hasNone = true;
      x.seasons.forEach(function (n) { map[n] = 1; });
    });
    var out = Object.keys(map).map(Number).sort(function (a, b) { return a - b; })
      .map(String);
    if (out.length) out.unshift('all');
    if (hasNone && out.length) out.push('none');
    return out;
  }

  function seasonLabelFor(value) {
    if (value === 'all') return '\u0412\u0441\u0435 \u0441\u0435\u0437\u043e\u043d\u044b';
    if (value === 'none') return '\u0411\u0435\u0437 \u0441\u0435\u0437\u043e\u043d\u0430';
    return '\u0421\u0435\u0437\u043e\u043d ' + value;
  }

  function cycleSeason(direction) {
    var values = seasonValues();
    if (values.length < 2) return false;
    var i = values.indexOf(st.season);
    if (i < 0) i = 0;
    var next = i + (direction === 'right' ? 1 : -1);
    if (next < 0 || next >= values.length) return false;
    st.season = values[next];
    st.selected = 0;
    render();
    return true;
  }

  function providers() {
    var result = ['all'];
    filtered(st.season, 'all').forEach(function (x) {
      var value = x.provider || 'Lampa';
      if (result.indexOf(value) < 0) result.push(value);
    });
    return result;
  }

  function focusables(r) {
    return [
      r.querySelector('.ltrf-mode'),
      r.querySelector('.ltrf-restore'),
      r.querySelector('.ltrf-close')
    ].concat([].slice.call(r.querySelectorAll('.ltrf-chip')))
      .concat([].slice.call(r.querySelectorAll('.ltrf-season')))
      .concat([].slice.call(r.querySelectorAll('.ltrf-source')))
      .concat([].slice.call(r.querySelectorAll('.ltrf-row')));
  }

  function focusType(el) {
    if (!el) return '';
    if (el.classList.contains('ltrf-row')) return 'row';
    if (el.classList.contains('ltrf-chip')) return 'chip';
    if (el.classList.contains('ltrf-season')) return 'season';
    if (el.classList.contains('ltrf-source')) return 'source';
    return 'button';
  }

  function applyFocus(el) {
    var r = document.getElementById(ROOT);
    if (!r || !el) return;

    r.querySelectorAll('.ltrf-focus,.ltrf-fill').forEach(function (x) {
      x.classList.remove('ltrf-focus', 'ltrf-fill');
    });
    el.classList.add(get(K.focus, 'ring') === 'fill' ? 'ltrf-fill' : 'ltrf-focus');
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    keyTarget = el;
  }

  function sanitize() {
    var values = seasonValues();
    if (!values.length || values.indexOf(st.season) < 0) st.season = 'all';
    if (providers().indexOf(st.provider) < 0) st.provider = 'all';
  }

  function render() {
    var r = document.getElementById(ROOT);
    if (!r) return;

    sanitize();
    r.classList.toggle('compact', st.mode === 'compact');
    var a = list();
    r.querySelector('.ltrf-list').innerHTML = a.map(function (x, i) {
      return '<article class="ltrf-row ' + (i === st.selected ? 'selected ' : '') +
        '" data-i="' + i + '" tabindex="-1">' +
        '<div class="ltrf-quality">' + esc(x.quality) + '</div>' +
        '<div class="ltrf-detail"><div class="ltrf-name">' + esc(x.name) + '</div>' +
        '<span class="ltrf-tag">' + esc(x.season) + '</span>' +
        '<span class="ltrf-tag cyan">' + esc(x.source) + '</span>' +
        '<span class="ltrf-tag dim">' + esc(x.studio) + '</span></div>' +
        '<div class="ltrf-stat"><div class="ltrf-size">' + esc(x.size) + '</div>' +
        '<div class="ltrf-seeds"><span class="ltrf-bars"><i></i><i></i><i></i><i></i></span>' +
        esc(x.seeds) + '</div></div></article>';
    }).join('');

    var foundText = 'Раздач: <strong>' + a.length + '</strong>';
    if (st.season !== 'all') foundText += ' · <strong>' + esc(seasonLabelFor(st.season)) + '</strong>';
    if (st.provider !== 'all') foundText += ' · <strong>' + esc(st.provider) + '</strong>';
    r.querySelector('.ltrf-found').innerHTML = foundText;
    r.querySelector('.ltrf-list').style.display = a.length ? 'flex' : 'none';
    r.querySelector('.ltrf-empty').style.display = a.length ? 'none' : 'block';
    r.querySelector('.ltrf-mode').textContent =
      st.mode === 'wide' ? 'Компактный вид' : 'Широкий вид';

    var seasonBox = r.querySelector('.ltrf-seasons');
    var values = seasonValues();
    if (!values.length) {
      seasonBox.innerHTML = '';
      seasonBox.style.display = 'none';
    } else {
      seasonBox.style.display = 'flex';
      seasonBox.innerHTML = values.map(function (value) {
        var count = filtered(value, st.provider).length;
        return '<button type="button" class="ltrf-season ' +
          (value === st.season ? 'active' : '') +
          '" data-season="' + esc(value) + '">' + esc(seasonLabelFor(value)) +
          '<b>' + count + '</b></button>';
      }).join('');
    }

    var sourceHtml = providers().map(function (value) {
      var label = value === 'all' ? 'Все источники' : value;
      return '<button type="button" class="ltrf-source ' +
        (value === st.provider ? 'active' : '') +
        '" data-provider="' + esc(value) + '">' + esc(label) + '</button>';
    }).join('');
    r.querySelector('.ltrf-sources').innerHTML = sourceHtml;

    var chips = r.querySelectorAll('.ltrf-chip');
    chips.forEach(function (x) {
      x.classList.toggle('active', x.dataset.sort === st.sort);
    });

    var f = focusables(r);
    if (!f.length) return;
    st.focus = Math.max(0, Math.min(st.focus, f.length - 1));
    applyFocus(f[st.focus]);
  }

  function close(manual) {
    var r = document.getElementById(ROOT);
    if (r) r.remove();
    window.removeEventListener('keydown', key, true);
    showHost();
    keyTarget = null;
    closedUntil = Date.now() + (manual === false ? 120 : 900);
    if (manual !== false) manualClosed = true;
  }

  function hideHost(host) {
    if (!host || host === document.body || host === document.documentElement) return;
    showHost();
    hiddenHost = host;
    hiddenHostStyle = host.getAttribute('style');
    hiddenHostAria = host.getAttribute('aria-hidden');
    host.style.display = 'none';
    host.setAttribute('aria-hidden', 'true');
  }

  function showHost() {
    if (!hiddenHost) return;
    if (hiddenHostStyle === null) hiddenHost.removeAttribute('style');
    else hiddenHost.setAttribute('style', hiddenHostStyle);
    if (hiddenHostAria === null) hiddenHost.removeAttribute('aria-hidden');
    else hiddenHost.setAttribute('aria-hidden', hiddenHostAria);
    hiddenHost = null;
    hiddenHostStyle = null;
    hiddenHostAria = null;
  }

  function restore() {
    set(K.enabled, false);
    set(K.auto, false);
    close();
    try {
      if (Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle('content');
      if (Lampa.Activity && Lampa.Activity.refresh) Lampa.Activity.refresh(true);
    } catch (e) {}
  }

  function activate() {
    var r = document.getElementById(ROOT);
    if (!r) return;

    var f = focusables(r);
    var el = f[st.focus];
    if (!el) return;

    if (el.classList.contains('ltrf-mode')) {
      st.mode = st.mode === 'wide' ? 'compact' : 'wide';
      set(K.mode, st.mode);
      render();
    } else if (el.classList.contains('ltrf-restore')) {
      restore();
    } else if (el.classList.contains('ltrf-close')) {
      close();
    } else if (el.classList.contains('ltrf-chip')) {
      st.sort = el.dataset.sort || 'seeds';
      st.selected = 0;
      render();
    } else if (el.classList.contains('ltrf-season')) {
      st.season = el.dataset.season || 'all';
      st.selected = 0;
      if (providers().indexOf(st.provider) < 0) st.provider = 'all';
      render();
    } else if (el.classList.contains('ltrf-source')) {
      st.provider = el.dataset.provider || 'all';
      st.selected = 0;
      render();
    } else if (el.classList.contains('ltrf-row')) {
      st.selected = Number(el.dataset.i) || 0;
      openNative(st.selected);
    }
  }

  function openNative(index) {
    if (openingNative) return;
    var a = list();
    var item = a[index];
    var native = item && item.native;
    if (!native) return;

    openingNative = true;
    openingUntil = Date.now() + 10000;
    clearTimeout(openingTimer);
    var title = item.name;
    var host = hiddenHost;
    // Remove only our overlay. Keep the original card alive and visible while
    // Lampa processes its own hover:enter event, otherwise Lampa can receive
    // the event after its activity has already been destroyed.
    close(false);
    closedUntil = Date.now() + 1800;
    lastHost = null;
    lastSig = '';

    setTimeout(function () {
      try {
        if (!native.isConnected) {
          var nodes = document.querySelectorAll(items);
          for (var i = 0; i < nodes.length; i++) {
            if (parse(nodes[i]).name === title) {
              native = nodes[i];
              break;
            }
          }
        }
        if (!native || !native.isConnected) return;

        var jq = window.jQuery || window.$;
        if (jq) {
          var wrapped = jq(native);
          if (wrapped && typeof wrapped.trigger === 'function') {
            wrapped.trigger('hover:enter');
            return;
          }
        }

        // Vanilla fallback for builds without jQuery. Use one activation
        // event only, never hover:enter plus click in the same turn.
        if (typeof native.click === 'function') {
          native.click();
        } else {
          var ev;
          try {
            ev = new CustomEvent('hover:enter', { bubbles: true, cancelable: true });
          } catch (ignore) {
            ev = document.createEvent('Event');
            ev.initEvent('hover:enter', true, true);
          }
          native.dispatchEvent(ev);
        }
      } catch (e) {
        // Last-resort native activation, only when the event path itself fails.
        try {
          if (native && native.isConnected && typeof native.click === 'function') native.click();
        } catch (ignoreClick) {}
      } finally {
        // Do not reopen the replacement immediately. Lampa may still be
        // switching activities; reopening here makes the overlay flash and
        // can send the same torrent event twice. The activity listener and
        // keep-alive will mount it again only after the new screen is ready.
        clearTimeout(openingTimer);
        openingTimer = setTimeout(function () {
          openingNative = false;
          openingUntil = 0;
        }, 10000);
      }
    }, 60);
  }

  function keyName(e) {
    var code = e && (e.keyCode || e.which);
    var key = e && (e.key || e.code);

    if (code === 19 || key === 'ArrowUp' || key === 'DPAD_UP') return 'up';
    if (code === 20 || key === 'ArrowDown' || key === 'DPAD_DOWN') return 'down';
    if (code === 21 || key === 'ArrowLeft' || key === 'DPAD_LEFT') return 'left';
    if (code === 22 || key === 'ArrowRight' || key === 'DPAD_RIGHT') return 'right';
    if (code === 23 || code === 66 || key === 'Enter' || key === 'NumpadEnter' ||
        key === ' ' || key === 'Spacebar' || key === 'DPAD_CENTER') return 'ok';
    if (code === 4 || key === 'Escape' || key === 'Backspace' || key === 'BrowserBack') return 'back';
    return '';
  }

  function groups(r) {
    return [
      ['button', [].slice.call(r.querySelectorAll('.ltrf-btn'))],
      ['chip', [].slice.call(r.querySelectorAll('.ltrf-chip'))],
      ['season', [].slice.call(r.querySelectorAll('.ltrf-season'))],
      ['source', [].slice.call(r.querySelectorAll('.ltrf-source'))],
      ['row', [].slice.call(r.querySelectorAll('.ltrf-row'))]
    ];
  }

  function jump(f, g, index, atEnd) {
    var els = g[index] && g[index][1];
    if (!els || !els.length) return -1;
    return f.indexOf(atEnd ? els[els.length - 1] : els[0]);
  }

  function move(direction) {
    var r = document.getElementById(ROOT);
    if (!r) return;

    var f = focusables(r);
    if (!f.length) return;

    var g = groups(r);
    var el = f[st.focus];
    var type = focusType(el);
    var gi = -1;
    var within = -1;
    var k;

    for (k = 0; k < g.length; k++) {
      var pos = g[k][1].indexOf(el);
      if (pos >= 0) {
        gi = k;
        within = pos;
        break;
      }
    }
    if (gi < 0) {
      applyFocus(f[0]);
      st.focus = 0;
      return;
    }

    var row = g[gi][1];
    var next = st.focus;

    if (direction === 'left' || direction === 'right') {
      if (type === 'row') {
        cycleSeason(direction);
        return;
      }
      var step = direction === 'right' ? 1 : -1;
      var target = within + step;
      if (target >= 0 && target < row.length) next = f.indexOf(row[target]);
    } else if (direction === 'down') {
      if (type === 'row') {
        if (within + 1 < row.length) next = f.indexOf(row[within + 1]);
      } else {
        for (k = gi + 1; k < g.length; k++) {
          var down = jump(f, g, k, false);
          if (down >= 0) {
            next = down;
            break;
          }
        }
      }
    } else if (direction === 'up') {
      if (type === 'row' && within > 0) {
        next = f.indexOf(row[within - 1]);
      } else {
        for (k = gi - 1; k >= 0; k--) {
          var up = jump(f, g, k, false);
          if (up >= 0) {
            next = up;
            break;
          }
        }
      }
    }

    if (next >= 0 && next !== st.focus) {
      st.focus = next;
      applyFocus(f[st.focus]);
    }
  }

  function key(e) {
    if (!document.getElementById(ROOT)) return;

    var action = keyName(e);
    if (!action) return;

    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    if (action === 'back') {
      close();
    } else if (action === 'ok') {
      activate();
    } else {
      move(action);
    }
  }

  function bindClick(r) {
    r.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('.ltrf-btn,.ltrf-chip,.ltrf-season,.ltrf-source,.ltrf-row') : null;
      if (!el || !r.contains(el)) return;

      var f = focusables(r);
      var index = f.indexOf(el);
      if (index >= 0) st.focus = index;
      if (el.classList.contains('ltrf-row')) st.selected = Number(el.dataset.i) || 0;
      activate();
    }, true);
  }

  function open(data, card, host) {
    if (get(K.enabled, true) === false) return;

    inject();
    close(false);
    manualClosed = false;
    hideHost(host);
    var prevSort = st.sort;
    var prevProvider = st.provider;
    var prevSeason = st.season;
    var prevFocus = st.focus;
    var prevCount = st.items.length;

    st.items = (data && data.length ? data : demo()).map(norm);
    st.mode = get(K.mode, 'wide') === 'compact' ? 'compact' : 'wide';
    st.sort = prevSort || 'seeds';
    st.season = seasonValues().indexOf(prevSeason) >= 0 ? prevSeason : 'all';
    st.provider = providers().indexOf(prevProvider) >= 0 ? prevProvider : 'all';
    st.focus = prevCount === st.items.length ? prevFocus : 0;
    st.selected = 0;

    var title = card && (card.title || card.name) ? card.title || card.name : 'Раздачи';
    var r = document.createElement('div');
    r.id = ROOT;
    r.className = 'ltrf';
    r.tabIndex = 0;
    r.innerHTML =
      '<div class="ltrf-in">' +
      '<div class="ltrf-head"><div class="ltrf-label">Торренты</div>' +
      '<div class="ltrf-actions">' +
      '<button type="button" class="ltrf-btn ltrf-mode">Компактный вид</button>' +
      '<button type="button" class="ltrf-btn ltrf-restore">Штатный интерфейс</button>' +
      '<button type="button" class="ltrf-btn ltrf-close" aria-label="Закрыть">×</button>' +
      '</div></div><main>' +
      '<h1 class="ltrf-title">' + esc(title) + '</h1>' +
      '<nav class="ltrf-chips" aria-label="Сортировка">' +
      '<button type="button" class="ltrf-chip active" data-sort="seeds">Сиды</button>' +
      '<button type="button" class="ltrf-chip" data-sort="size">Размер</button>' +
      '<button type="button" class="ltrf-chip" data-sort="date">Дата</button>' +
      '<button type="button" class="ltrf-chip" data-sort="name">Название</button>' +
      '</nav><div class="ltrf-seasons" aria-label="Сезоны"></div>' +
      '<div class="ltrf-sources" aria-label="Источники"></div>' +
      '<div class="ltrf-found"></div><div class="ltrf-list"></div>' +
      '<div class="ltrf-empty"><strong>Нет раздач</strong>Смените сезон или источник, либо вернитесь назад.</div>' +
      '<div class="ltrf-help"><kbd>↑</kbd><kbd>↓</kbd> навигация&nbsp;&nbsp;' +
      '<kbd>←</kbd><kbd>→</kbd> сезон&nbsp;&nbsp;' +
      '<kbd>OK</kbd> открыть&nbsp;&nbsp;<kbd>BACK</kbd> закрыть</div>' +
      '</main></div>';

    document.body.appendChild(r);
    bindClick(r);
    window.addEventListener('keydown', key, true);
    r.addEventListener('keydown', key, true);
    r.addEventListener('focus', function () {
      applyFocus(focusables(r)[st.focus]);
    });
    render();
    try { r.focus({ preventScroll: true }); } catch (e) { try { r.focus(); } catch (ignore) {} }
  }

  function isFilesHost(n) {
    if (!n) return false;
    var t = String(n.textContent || '').toLowerCase();
    var fileMarks = (t.match(/\.(mkv|mp4|avi|mov|webm|srt|ass|zip|rar)\b/g) || []).length;
    var seasonMinus = (t.match(/\u0441\u0435\u0437\u043e\u043d\s*-\s*1/g) || []).length;
    return /(?:^|\s)\u0444\u0430\u0439\u043b\u044b(?:\s|$)/i.test(t) || fileMarks >= 3 || seasonMinus >= 2;
  }

  function looksLikeTorrentItem(n) {
    if (!n || !n.querySelector) return false;
    var text = (n.textContent || '').toLowerCase();
    var hasTitle = !!n.querySelector('[class*="title"],[class*="name"],[data-title]');
    var hasMeta = !!n.querySelector('[class*="size"],[class*="seed"],[class*="peer"],[data-size]');
    return hasTitle && hasMeta && (/[0-9]+\s*(гб|gb|мб|mb|tb|тб)/i.test(text) || /seed|sid|\u0441\u0438\u0434/i.test(text));
  }

  function flexibleItems(host) {
    if (!host || !host.querySelectorAll || isFilesHost(host)) return [];
    var all = [].slice.call(host.querySelectorAll('div,article,li,a,[role="listitem"]'));
    var out = all.filter(function (n) {
      return looksLikeTorrentItem(n) && (!n.parentElement || !looksLikeTorrentItem(n.parentElement));
    });
    if (out.length) return out;

    // Some Android TV skins expose only text blocks with hashed classes.
    // Pick leaf-ish cards by their own text, not by a fixed CSS class.
    return all.filter(function (n) {
      if (!n.children || n.children.length < 2) return false;
      var text = n.textContent || '';
      var hasNumber = /[0-9]+\s*(гб|gb|мб|mb|tb|тб)/i.test(text);
      var hasSeeds = /seed|sid|\u0441\u0438\u0434/i.test(text);
      var hasTitle = text.trim().length > 8;
      if (!hasNumber && !hasSeeds) return false;
      if (!hasTitle) return false;
      for (var i = 0; i < all.length; i++) {
        if (all[i] !== n && n.contains(all[i]) && all[i].children && all[i].children.length >= 2) {
          var childText = all[i].textContent || '';
          if (/[0-9]+\s*(гб|gb|мб|mb|tb|тб)/i.test(childText) || /seed|sid|\u0441\u0438\u0434/i.test(childText)) return false;
        }
      }
      return true;
    });
  }

  function findHost() {
    var a = document.querySelectorAll(hosts);
    for (var i = 0; i < a.length; i++) {
      if (!isFilesHost(a[i]) && getItemNodes(a[i]).length) return a[i];
    }

    var first = document.querySelector(items);
    if (first && !isFilesHost(first)) {
      var parent = first.parentElement;
      while (parent && parent !== document.body) {
        if (getItemNodes(parent).length > 1 || /torrent|explorer/i.test(parent.className || '')) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return first.parentElement;
    }

    // Android TV builds can use different hashed class names and omit
    // MutationObserver-friendly torrent containers. Find the smallest stable
    // ancestor that contains actual title + size/seeder cards.
    var candidates = document.querySelectorAll('body *');
    for (var c = 0; c < candidates.length; c++) {
      var box = candidates[c];
      var flex = flexibleItems(box);
      if (flex.length && !isFilesHost(box)) return flex[0].parentElement || box;
    }
    return null;
  }

  function getItemNodes(host) {
    if (!host || isFilesHost(host)) return [];
    if (host.matches && host.matches(items)) return [host];

    var all = [].slice.call(host.querySelectorAll(items));
    if (!all.length) all = flexibleItems(host);
    if (!all.length && looksLikeTorrentItem(host)) return [host];
    var out = [];
    for (var i = 0; i < all.length; i++) {
      var nested = false;
      for (var j = 0; j < all.length; j++) {
        if (i !== j && all[j] !== all[i] && all[j].contains && all[j].contains(all[i])) {
          nested = true;
          break;
        }
      }
      if (!nested) out.push(all[i]);
    }
    return out;
  }

  function getCard() {
    try {
      var a = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
      var c = a && a.activity && a.activity.component;
      return c && (c.movie || c.card || c.data) || null;
    } catch (e) {
      return null;
    }
  }

  function connect(force) {
    if (openingNative || Date.now() < openingUntil || manualClosed || Date.now() < closedUntil || get(K.auto, true) === false ||
        document.getElementById(ROOT)) return;

    var h = findHost();
    if (!h) return;

    var ns = getItemNodes(h);
    var a = [];
    var seen = {};
    for (var i = 0; i < ns.length; i++) {
      var x = parse(ns[i]);
      if (x.name && !seen[x.name]) {
        seen[x.name] = 1;
        a.push(x);
      }
    }
    if (!a.length) return;

    var sig = a.map(function (x) {
      return x.name + '|' + x.size + '|' + x.seeds;
    }).join('||');
    if (!force && h === lastHost && sig === lastSig) return;

    lastHost = h;
    lastSig = sig;
    open(a, getCard(), h);
  }

  function schedule(force) {
    if (openingNative || Date.now() < openingUntil) return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (!openingNative && Date.now() >= openingUntil) connect(!!force);
    }, 180);
  }

  function observe() {
    if (observer) observer.disconnect();
    manualClosed = false;
    lastHost = null;
    lastSig = '';
    if (!document.body || !window.MutationObserver) {
      schedule(true);
      return;
    }

    observer = new MutationObserver(function (m) {
      if (openingNative || Date.now() < openingUntil || document.getElementById(ROOT) || Date.now() < closedUntil) return;
      for (var i = 0; i < m.length; i++) {
        if (m[i].addedNodes.length || m[i].removedNodes.length) {
          schedule(false);
          break;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    schedule(true);
  }

  function visible(n) {
    if (!n) return false;
    return !!(n.offsetWidth || n.offsetHeight || (n.getClientRects && n.getClientRects().length));
  }

  function tick() {
    if (get(K.enabled, true) === false || openingNative || Date.now() < openingUntil) return;

    var r = document.getElementById(ROOT);

    if (r) {
      if (!document.body.contains(r)) {
        lastHost = null;
        lastSig = '';
        connect(true);
        return;
      }
      if (!document.getElementById(STYLE)) inject();
      var cur = findHost();
      if (cur && getItemNodes(cur).length) {
        if (cur !== hiddenHost) hideHost(cur);
        else if (cur.style.display !== 'none') cur.style.display = 'none';
      }
      if (hiddenHost && !document.body.contains(hiddenHost)) {
        hiddenHost = null;
        hiddenHostStyle = null;
        hiddenHostAria = null;
      }
      if (!keyTarget || !document.body.contains(keyTarget)) {
        window.removeEventListener('keydown', key, true);
        window.addEventListener('keydown', key, true);
        keyTarget = r;
      }
      return;
    }

    if (manualClosed || get(K.auto, true) === false) return;
    if (Date.now() < closedUntil) return;

    var h = findHost();
    if (!h || !getItemNodes(h).length) return;
    if (h !== hiddenHost && !visible(h)) return;

    lastHost = null;
    lastSig = '';
    connect(true);
  }

  function keepAlive() {
    clearTimeout(keepTimer);
    keepTimer = setTimeout(function () {
      keepTimer = 0;
      try {
        tick();
      } catch (e) {}
      keepAlive();
    }, TICK);
  }

  function settings() {
    try {
      if (!Lampa.SettingsApi) return;
      Lampa.SettingsApi.addComponent({
        component: 'lt_final_restore_settings',
        icon: '⚙',
        name: 'Torrent UI'
      });
      Lampa.SettingsApi.addParam({
        component: 'lt_final_restore_settings',
        param: { name: K.enabled, type: 'trigger', default: true },
        field: {
          name: 'Включить Torrent UI',
          description: 'Использовать новый интерфейс торрентов'
        }
      });
      Lampa.SettingsApi.addParam({
        component: 'lt_final_restore_settings',
        param: { name: K.auto, type: 'trigger', default: true },
        field: {
          name: 'Автоподключение',
          description: 'Подключаться к текущему torrent-компоненту'
        }
      });
      Lampa.SettingsApi.addParam({
        component: 'lt_final_restore_settings',
        param: {
          name: K.mode,
          type: 'select',
          values: { wide: 'Широкий режим', compact: 'Компактный режим' },
          default: 'wide'
        },
        field: {
          name: 'Режим списка',
          description: 'Плотность отображения раздач'
        },
        onChange: function (v) {
          if (v === 'wide' || v === 'compact') {
            st.mode = v;
            set(K.mode, v);
            render();
          }
        }
      });
      Lampa.SettingsApi.addParam({
        component: 'lt_final_restore_settings',
        param: {
          name: K.focus,
          type: 'select',
          values: { ring: 'Фокус-кольцо', fill: 'Заполнение' },
          default: 'ring'
        },
        field: {
          name: 'Стиль фокуса',
          description: 'Вид выделения с пульта'
        },
        onChange: render
      });
    } catch (e) {}
  }

  function start() {
    if (!window.Lampa) {
      if (!bootTimer) {
        bootTimer = setTimeout(function () {
          bootTimer = 0;
          start();
        }, 500);
      }
      return;
    }
    if (get(K.enabled, true) === false) set(K.enabled, true);
    settings();
    try {
      if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('activity', function (e) {
          if (e.type === 'start' || e.type === 'archive') observe();
          if (e.type === 'destroy') {
            if (openingNative || Date.now() < openingUntil) return;
            clearTimeout(destroyTimer);
            destroyTimer = setTimeout(function () {
              destroyTimer = 0;
              var h = findHost();
              if (h && getItemNodes(h).length) {
                lastHost = null;
                lastSig = '';
                schedule(true);
                return;
              }
              close(false);
              observe();
            }, 450);
          }
        });
      }
      if (Lampa.Controller && Lampa.Controller.listener &&
          Lampa.Controller.listener.follow) {
        Lampa.Controller.listener.follow('toggle', function () {
          var r = document.getElementById(ROOT);
          if (!r) {
            schedule(true);
            return;
          }
          try {
            var f = focusables(r);
            if (f.length) applyFocus(f[st.focus]);
            r.focus();
          } catch (e) {}
        });
      }
    } catch (e) {}
    observe();
    keepAlive();
  }

  window.LampaTorrentUIFullReplace = {
    open: open,
    close: close,
    restore: restore,
    connect: function () { schedule(true); },
    disconnect: function () {
      if (observer) observer.disconnect();
      observer = null;
      clearTimeout(keepTimer);
      keepTimer = 0;
      clearTimeout(destroyTimer);
      destroyTimer = 0;
      clearTimeout(openingTimer);
      openingTimer = 0;
      openingNative = false;
      openingUntil = 0;
      window.removeEventListener('keydown', key, true);
    },
    keepAlive: keepAlive,
    setItems: function (a) {
      st.items = (a || []).map(norm);
      render();
    }
  };
  window.LampaTorrentUIFinalRestore = window.LampaTorrentUIFullReplace;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}());