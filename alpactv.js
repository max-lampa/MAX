(function () {
  'use strict';
  // «Закусь TV» — Lampa dressed as the Apple TV app. Two looks, picked by the device: the iPadOS app
  // (iPad, phones, touch browsers) and tvOS (TVs and remotes). Only CSS, Lampa's own templates and
  // events: nothing of Lampa is changed, and a place the theme does not recognise (a newer Lampa)
  // keeps Lampa's own look. All TMDB requests go through Lampa.TMDB (the user's proxy), no keys of
  // its own, no other services. Switched off in the settings, everything is back as it was.
  //
  // In this file, in order: strings and small helpers · options · device and design tokens · caches ·
  // TMDB, logos, backdrop colour · CSS (cssCtx, then one function per part: base, full card, episodes,
  // rows, hero, panels, search, posters, person, schedule, bars) · the theme on / off · full card · watch progress ·
  // episode row · pages (which one, body state, the remote) · Home rows (wide cards, Up Next, Shots) ·
  // hero banner · People and Schedule pages · settings · start. Lampa is changed only through its events, createInstance and the
  // TMDB / CUB sources' category() (the banner in front of genre pages).
  if (window.snack_tv_ready) return;
  window.snack_tv_ready = true;

  var VERSION = '0.8.13';
  // This is ordinary plugin metadata, not a packed/obfuscated payload.
  var PACK = { c: 'snack_tv' };

  var STR = {
    name:        ['Закусь TV', 'Закусь TV', 'Zakus TV'],
    all_films:   ['Все фильмы', 'Усі фільми', 'All titles'],
    on:          ['Оформление Apple TV', 'Оформлення Apple TV', 'Apple TV look'],
    mode:        ['Вид', 'Вигляд', 'Layout'],
    mode_d:      ['Авто: ТВ — как Apple TV, остальное — как iPad', 'Авто: ТБ — як Apple TV, решта — як iPad', 'Auto: TVs like Apple TV, the rest like iPad'],
    auto:        ['Авто', 'Авто', 'Auto'],
    ipad:        ['iPad', 'iPad', 'iPad'],
    tvos:        ['Apple TV', 'Apple TV', 'Apple TV'],
    lite:        ['Лёгкий режим', 'Легкий режим', 'Light mode'],
    lite_d:      ['Без размытия, теней и видео. Авто: на ТВ', 'Без розмиття, тіней і відео. Авто: на ТБ', 'No blur, shadows or video. Auto: on TVs'],
    on_:         ['Вкл', 'Увімк', 'On'],
    off_:        ['Выкл', 'Вимк', 'Off'],
    h_react:     ['Реакции', 'Реакції', 'Reactions'],
    h_shots:     ['Shots на главной', 'Shots на головній', 'Shots on Home'],
    loc:         ['Названия и постеры на языке интерфейса', 'Назви й постери мовою інтерфейсу', 'Titles and posters in the interface language'],
    loc_d:       ['Для карточек из CUB и сохранённых на другом языке (закладки, история, рекомендации): из TMDB, только на экране', 'Для карток із CUB і збережених іншою мовою (закладки, історія, рекомендації): з TMDB, лише на екрані', 'For cards from CUB or saved in another language (bookmarks, history, recommendations): from TMDB, on screen only'],
    h_tech:      ['Технические метки', 'Технічні мітки', 'Technical labels'],
    h_tech_d:    ['WEBDL, TS, 4K, «Выпущенный»… Метка UA и рейтинг видны всегда', 'WEBDL, TS, 4K, «Випущений»… Мітка UA й рейтинг видно завжди', 'WEBDL, TS, 4K, “Released”… The UA badge and rating always show'],
    h_play:      ['Стандартная кнопка «Смотреть»', 'Стандартна кнопка «Дивитися»', 'The standard “Watch” button'],
    h_play_d:    ['Нужен Автопилот: без него кнопка видна всегда', 'Потрібен Автопілот: без нього кнопку видно завжди', 'Needs Autopilot: without it the button always shows'],
    h_head:      ['Шапка как в Apple TV', 'Шапка як в Apple TV', 'Apple TV header'],
    h_head_d:    ['Без часов, даты и значков', 'Без годинника, дати й значків', 'No clock, date or icons'],
    episodes:    ['Ряд серий с кадрами', 'Ряд серій з кадрами', 'Episode row with stills'],
    titles:      ['Названия под постерами', 'Назви під постерами', 'Titles under posters'],
    titles_d:    ['Всегда, а не только у выбранного', 'Завжди, а не лише у вибраного', 'Always, not only under the selected one'],
    tint:        ['Цвет из фона', 'Колір з фону', 'Colour from the backdrop'],
    tint_d:      ['Подложка подстраивается под картинку', 'Тло підлаштовується під картинку', 'The page follows the picture'],
    logo_lang:   ['Язык логотипов', 'Мова логотипів', 'Logo language'],
    logo_ui:     ['Как интерфейс', 'Як інтерфейс', 'Interface language'],
    img_q:       ['Качество картинок', 'Якість зображень', 'Image quality'],
    img_q_d:     ['Авто: по чёткости экрана. Экономно: меньше трафика', 'Авто: за чіткістю екрана. Економно: менше трафіку', 'Auto: by the screen’s sharpness. Economy: less traffic'],
    q_eco:       ['Экономно', 'Економно', 'Economy'],
    q_max:       ['Максимум', 'Максимум', 'Maximum'],
    poster_size: ['Размер постеров', 'Розмір постерів', 'Poster size'],
    poster_size_d: ['Меньше постеров в ряду — крупнее каждая карточка', 'Менше постерів у рядку — більша кожна картка', 'Fewer posters per row means larger cards'],
    poster_normal: ['Стандартный', 'Стандартний', 'Standard'],
    poster_large: ['Крупный', 'Великий', 'Large'],
    poster_max: ['Максимальный', 'Максимальний', 'Largest'],
    // screens
    watch:       ['Смотреть', 'Дивитися', 'Watch'],
    more:        ['ещё', 'більше', 'more'],
    b_more:      ['Ещё', 'Ще', 'More'],
    b_auto_set:  ['Автопилот: настройки', 'Автопілот: налаштування', 'Autopilot: settings'],
    less:        ['свернуть', 'згорнути', 'less'],
    season:      ['Сезон', 'Сезон', 'Season'],
    seasons_n:   ['Сезонов: %1', 'Сезонів: %1', '%1 seasons'],
    episode_cap: ['СЕРИЯ %1', 'СЕРІЯ %1', 'EPISODE %1'],
    serial:      ['Сериал', 'Серіал', 'TV Show'],
    movie:       ['Фильм', 'Фільм', 'Movie'],
    min:         ['%1 мин', '%1 хв', '%1 min'],
    hm:          ['%1 ч %2 мин', '%1 год %2 хв', '%1 hr %2 min'],
    soon:        ['Скоро', 'Незабаром', 'Coming soon'],
    // the schedule
    tt_title:    ['Расписание', 'Розклад', 'Schedule'],
    tt_sub:      ['Новые серии сериалов из вашего «Избранного»', 'Нові серії серіалів з вашого «Вибраного»', 'New episodes of the shows in your Favorites'],
    today:       ['Сегодня', 'Сьогодні', 'Today'],
    tomorrow:    ['Завтра', 'Завтра', 'Tomorrow'],
    in_days:     ['через %1 дн.', 'через %1 дн.', 'in %1 days'],
    tt_recent:   ['Вышли недавно', 'Вийшли нещодавно', 'Recently released'],
    se_ep:       ['СЕЗОН %1 · СЕРИЯ %2', 'СЕЗОН %1 · СЕРІЯ %2', 'SEASON %1 · EPISODE %2'],
    premiere:    ['Премьера %1 сезона', 'Прем’єра %1 сезону', 'Season %1 premiere'],
    tt_empty:    ['Здесь появятся новые серии', 'Тут з’являться нові серії', 'New episodes will show up here'],
    tt_empty_d:  ['Добавьте сериал в «%1» кнопкой на его странице (подойдут и %2). Даты выхода серий подтянутся из TMDB за несколько минут.', 'Додайте серіал у «%1» кнопкою на його сторінці (підійдуть і %2). Дати виходу серій підтягнуться з TMDB за кілька хвилин.', 'Add a show to «%1» with the button on its page (%2 work too). Air dates come from TMDB within a few minutes.'],
    tt_none:     ['Новых серий пока не объявлено', 'Нових серій поки не оголошено', 'No new episodes announced yet'],
    tt_none_d:   ['Сериалов в «Избранном»: %1. Как только TMDB объявит даты новых серий на ближайший месяц, они появятся здесь.', 'Серіалів у «Вибраному»: %1. Щойно TMDB оголосить дати нових серій на найближчий місяць, вони з’являться тут.', 'Shows in your Favorites: %1. Once TMDB announces next month’s episodes, they show up here.'],
    tt_open:     ['Открыть «%1»', 'Відкрити «%1»', 'Open «%1»'],
    g_look:      ['Вид', 'Вигляд', 'Look'],
    g_home:      ['Главная и карточка', 'Головна й картка', 'Home and the card'],
    g_speed:     ['Производительность', 'Швидкодія', 'Performance'],
    reset:       ['Сбросить настройки', 'Скинути налаштування', 'Reset settings'],
    reset_d:     ['Только пункты этой папки', 'Лише пункти цієї теки', 'Only this folder’s options'],
    tor_full:    ['Полное название раздачи', 'Повна назва роздачі', 'The release’s full title'],
    tor_season:  ['Сезон %1', 'Сезон %1', 'Season %1'],
    agn:         ['Закусь TV не включён: стоит плагин AppleTV AGNative, они несовместимы', 'Закусь TV не увімкнено: стоїть плагін AppleTV AGNative, вони несумісні', 'Zakus TV is off: the AppleTV AGNative plugin is installed, they do not mix']
  };
  function uiLang() { var l = 'ru'; try { l = String(Lampa.Storage.get('language', 'ru') || 'ru'); } catch (e) {} return l; }
  // the column of STR (and of the pack's own text lists) for the interface language: ru, uk, English
  function langIdx() { var l = uiLang(); return l === 'uk' ? 1 : l === 'ru' || l === 'be' ? 0 : 2; }
  function tr(k) {
    var a = STR[k] || [k], s = a[langIdx()];
    for (var i = 1; i < arguments.length; i++) s = s.split('%' + i).join(arguments[i]);
    return s;
  }
  // "S2E5" -> "S2, E5" (how Apple TV writes it)
  function se(t) { return String(t || '').replace(/\bS(\d+)\s?E(\d+)\b/g, 'S$1, E$2'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // TMDB text as the theme shows it: emoji (TMDB biographies use them as bullets: «💥Брайан…», «🏆Главн…»),
  // zero-width marks and lone surrogates are boxes («□») on TVs without an emoji font - dropped; odd
  // bullets become «•», line / paragraph separators line breaks (the fonts of the stack have both)
  var EMOJI = /[\uD83C-\uD83E][\uDC00-\uDFFF]|[\u2600-\u27BF\u2B00-\u2BFF\uFE00-\uFE0F\u20E3\u200B-\u200D\u2060\uFEFF\u00AD]|[\uD800-\uDFFF]/g;
  function plainText(s) {
    return String(s == null ? '' : s).replace(EMOJI, '').replace(/[\u25AA-\u25AB\u25CF\u25E6\u2023\u2043\u2219]/g, '•')
      .replace(/[\u2028\u2029]/g, '\n').replace(/[ \t\u00A0]{2,}/g, ' ').replace(/ *\n */g, '\n').trim();
  }
  // in the document (Element.isConnected is Chrome 54+; webOS 3-4 and Tizen 3 do not have it)
  function inDoc(n) { try { return !!n && (n.isConnected !== undefined ? n.isConnected : document.documentElement.contains(n)); } catch (e) { return false; } }
  function log(m) { try { console.log('SnackTV', m); } catch (e) {} }
  function capFirst(s) { return Lampa.Utils.capitalizeFirstLetter ? Lampa.Utils.capitalizeFirstLetter(s) : s; }
  // the pack's other plugins: «UA» (a Ukrainian voice-over is known) and Autopilot (API v2 and up)
  function hasUa(m) { try { return !!(window.snack_ua && window.snack_ua.has && window.snack_ua.has(m)); } catch (e) { return false; } }
  function autoApi(fn) { var a = window.alc_auto_api; return a && a.version >= 2 && a[fn] ? a : null; }
  // Lampa's «last watched» of the online sources: {hash of the original title: {season, episode, …}}
  // a stored object: Lampa.Storage gives it parsed or as its JSON (unreadable or not an object: {})
  function objOf(v) {
    if (typeof v === 'string') { try { v = JSON.parse(v || '{}'); } catch (e) { v = {}; } }
    return v && typeof v === 'object' ? v : {};
  }
  function watchedLast() { return objOf(Lampa.Storage.get('online_watched_last', '{}')); }
  function titleHash(m) { return Lampa.Utils.hash(m.original_name || m.original_title || ''); }

  // ---------- options (keys, defaults, reading them) ----------
  // react, shots, tech, play: «show …» (off: hidden, the default); they were «hide …» up to 0.6.6 (SHOW_WAS)
  var K = { on: 'stv_on', mode: 'stv_mode', poster: 'stv_poster_size', lite: 'stv_lite', react: 'stv_show_react', shots: 'stv_show_shots',
    tech: 'stv_show_tech', head: 'stv_hide_head', play: 'stv_show_play', episodes: 'stv_episodes', tint: 'stv_tint', logo_lang: 'stv_logo_lang', img: 'stv_img', titles: 'stv_titles', remote: 'stv_remote', loc: 'stv_local_cards' };
  var DEF = { stv_on: true, stv_mode: 'auto', stv_poster_size: 'large', stv_lite: 'auto', stv_show_react: false, stv_show_shots: false,
    stv_show_tech: false, stv_hide_head: true, stv_show_play: false, stv_episodes: true, stv_tint: true, stv_logo_lang: 'ui', stv_img: 'auto', stv_titles: false, stv_remote: '', stv_local_cards: true };
  var SHOW_WAS = { stv_show_react: 'stv_hide_react', stv_show_shots: 'stv_hide_shots', stv_show_tech: 'stv_hide_tech', stv_show_play: 'stv_hide_play' };
  function opt(k) { var v; try { v = Lampa.Storage.get(k, DEF[k]); } catch (e) { v = DEF[k]; } if (v === 'true') return true; if (v === 'false') return false; return v; }

  // ---------- device: the iPad look or the tvOS look; light mode for TVs ----------
  // TVs before the touch marks: TV boxes' WebViews claim touch, and Lampa marks the page touch / mobile unless the
  // browser's name says «Android TV». A TV: Lampa's own tv() (tvbox() included), an Android with no touch screen
  // (Lampa's tvbox rule, by the pointer rather than the name), or a remote seen here (see trackKeys)
  var androidNoTouch = (function () {
    try { return /android/i.test(navigator.userAgent) && !window.matchMedia('(any-pointer: coarse)').matches; } catch (e) { return false; }
  })();
  function autoMode() {
    var b = document.body.classList;
    if (String(opt(K.remote)) === '1' || androidNoTouch) return 'tv';
    try { if (Lampa.Platform.tv()) return 'tv'; } catch (e) {}
    if (b.contains('true--mobile') || b.contains('touch-device') || b.contains('platform--apple')) return 'ipad';
    try { if (Lampa.Platform.desktop()) return 'tv'; } catch (e) {}
    return navigator.maxTouchPoints > 0 && window.innerWidth < 1400 ? 'ipad' : 'tv';
  }
  function mode() { var m = opt(K.mode); return m === 'ipad' || m === 'tv' ? m : autoMode(); }
  function lite() { var l = opt(K.lite); return l === 'on' ? true : l === 'off' ? false : mode() === 'tv'; }

  // ---------- design tokens (docs/appletv-reference/SPEC.md), px at the reference screen ----------
  // iPad: 1180×820 (Lampa's body font 14.02px there); tvOS: 1920×1080 (22.81px). Lampa sizes all in
  // em of the body font, so the tokens are scaled by the actual body font: same look on any screen.
  var T = {
    ipad: { base: 14.02, margin: 48, gutter: 20, rowGap: 34, cardW: 248, cwW: 330, cardR: 12, epW: 300, epChin: 66, castD: 96,
      title: 22, titleW: 700, sub: 15, cap: 12, cap2: 11,
      btnH: 50, btnPad: 28, btnFont: 17, round: 50, logoW: 300, logoH: 110, descW: 480,
      panelR: 22, rowR: 12, focusScale: 1, dur: 220, dot: 7 },
    tv: { base: 22.81, margin: 80, gutter: 40, rowGap: 56, cardW: 380, cwW: 410, cardR: 18, epW: 400, epChin: 100, castD: 150,
      title: 38, titleW: 700, sub: 25, cap: 23, cap2: 21,
      btnH: 64, btnPad: 40, btnFont: 29, round: 64, logoW: 560, logoH: 200, descW: 760,
      panelR: 32, rowR: 20, focusScale: 1.09, dur: 220, dot: 9 }
  };
  var M = 'ipad', L = false, k = 1;
  function px(n) { return (Math.round(n * k * 10) / 10) + 'px'; }

  // ---------- small caches: memory + a capped Lampa.Storage object ----------
  function Cache(name, max) {
    var mem = {}, timer = 0;
    try { mem = objOf(Lampa.Storage.get(name, '{}')); } catch (e) {}
    return {
      get: function (key) { return mem[key]; },
      set: function (key, v) {
        mem[key] = v;
        if (timer) return;
        timer = setTimeout(function () {
          timer = 0;
          var keys = Object.keys(mem);
          if (keys.length > max) keys.slice(0, keys.length - max).forEach(function (x) { delete mem[x]; });
          try { Lampa.Storage.set(name, mem, true); } catch (e) {}
        }, 4000);
      }
    };
  }
  // memory only: the oldest entry goes when the cap is passed
  function MemCache(max) {
    var mem = {};
    return {
      get: function (key) { return mem[key]; },
      set: function (key, v) { var keys = Object.keys(mem); if (keys.length > max) delete mem[keys[0]]; mem[key] = v; }
    };
  }
  var logos;   // made on first use (Lampa.Storage is ready by then; a banner may come before start())
  function logoCache() { return logos || (logos = Cache('stv_logos', 400)); }
  var tints = MemCache(60), seasonCache = MemCache(30);

  // ---------- TMDB through Lampa (the user's proxy, Lampa's key) ----------
  // a request object per call: Lampa.Reguest keeps every call it made until clear()
  // lang: a fixed language (episode titles in English / the original), else Lampa's TMDB language
  // Lampa's TMDB language, else the interface's
  function tmdbLang() { var l = ''; try { l = Lampa.Storage.field('tmdb_lang') || ''; } catch (e) {} return String(l || uiLang()); }
  function tmdb(path, ok, fail, lang) {
    try {
      var url = Lampa.TMDB.api(path + (path.indexOf('?') < 0 ? '?' : '&') + 'api_key=' + Lampa.TMDB.key() + '&language=' + (lang || tmdbLang()));
      new Lampa.Reguest().silent(url, ok, function () { if (fail) fail(); });
    } catch (e) { if (fail) fail(); }
  }
  function img(path, size) { return path ? Lampa.TMDB.image('t/p/' + size + path) : ''; }
  // the TMDB size for a picture shown cssW wide: its real pixels (× the screen's density: iPad, phones,
  // 4K TVs) and the setting (economy ¾, maximum 1½); the smallest size that is at least ~90% of that.
  // Beyond the largest size (backdrops): «original» (1920+ px files) for maximum, and for a dense
  // screen that needs nearly twice the largest (a 4K TV, an iPad's full-width banner); else the largest.
  // Stills never take «original»: rows of 4K episode stills froze iPads (w780 at most)
  // (w500 is not in TMDB's list for backdrops and stills, but served for them: Lampa takes it for its
  // «collection» cards. Without it a TV's 410 px wide card took w780: 2.4× the pixels to decode and to keep)
  var TMDB_W = { poster: [154, 185, 342, 500, 780], backdrop: [300, 500, 780, 1280], still: [185, 300, 500, 780], logo: [92, 154, 185, 300, 500] };
  function tmdbSize(kind, cssW) {
    var q = opt(K.img), list = TMDB_W[kind] || TMDB_W.poster;
    var need = (cssW || 0) * (window.devicePixelRatio || 1) * (q === 'eco' ? 0.75 : q === 'max' ? 1.5 : 1) * 0.9;
    for (var i = 0; i < list.length; i++) if (list[i] >= need) return 'w' + list[i];
    var top = list[list.length - 1];
    return kind === 'backdrop' && (q === 'max' || need >= top * 1.8) ? 'original' : 'w' + top;
  }
  // a Lampa card's picture URL with the size changed (only TMDB's /t/p/wNNN/ paths)
  function resized(url, size) { return String(url || '').replace(/\/t\/p\/w\d+\//, '/t/p/' + size + '/'); }
  // the widths the theme draws things at (px of this screen)
  // posters: so many across the screen (Apple's «See All»: phones 3, iPad 6, TVs 7), between the side margins
  function phoneCols() { return opt(K.poster) === 'normal' ? 3 : 2; }
  function cols() {
    var size = opt(K.poster);
    if (window.innerWidth < 600) return phoneCols();
    if (M === 'tv') return size === 'max' ? 5 : size === 'large' ? 6 : 7;
    return size === 'max' ? 4 : size === 'large' ? 5 : 6;
  }
  function posterCalc(t, n) { return 'calc((100vw - ' + px(2 * t.margin - t.gutter) + ') / ' + n + ' - ' + px(t.gutter) + ')'; }
  function posterCssW() { var t = T[M], n = cols(); return (window.innerWidth - (2 * t.margin - t.gutter) * k) / n - t.gutter * k; }
  function logoLangs() {
    var l = opt(K.logo_lang);
    if (!l || l === 'ui') l = uiLang();
    var out = [l];
    if (l !== 'en') out.push('en');
    return out;
  }
  // the logo for a title: interface language -> English -> no language; '' = none (text is shown)
  function pickLogo(list) {
    if (!list || !list.length) return '';
    var langs = logoLangs(), i, j;
    for (i = 0; i < langs.length; i++) for (j = 0; j < list.length; j++) if (list[j].iso_639_1 === langs[i]) return list[j].file_path;
    for (j = 0; j < list.length; j++) if (!list[j].iso_639_1) return list[j].file_path;
    return '';
  }
  function kindOf(m) { return m.name || m.original_name || m.first_air_date || m.number_of_seasons || m.media_type === 'tv' ? 'tv' : 'movie'; }
  // a phone held upright: Apple uses the vertical key art there (a 16:9 frame leaves a thin slice)
  function portrait() { return window.innerHeight > window.innerWidth * 1.15; }
  // the vertical art without the title printed on it (the logo goes over it), when TMDB has one
  function cleanPoster(m) {
    var list = (m.images && m.images.posters) || [], best = null;
    list.forEach(function (p) { if (!p.iso_639_1 && (!best || (p.vote_average || 0) > (best.vote_average || 0))) best = p; });
    return best ? best.file_path : m.poster_path;
  }
  function kindLabel(m) { return tr(kindOf(m) === 'tv' ? 'serial' : 'movie'); }
  function yearOf(m) { return String(m.release_date || m.first_air_date || '').slice(0, 4); }
  function runtimeText(min) {
    min = parseInt(min, 10) || 0;
    if (!min) return '';
    return min >= 60 ? tr('hm', Math.floor(min / 60), min % 60) : tr('min', min);
  }
  function logoKey(m, langs) { return kindOf(m) + m.id + ':' + (langs || logoLangs())[0]; }
  var logoWait = {};
  function getLogo(m, cb) {
    if (!m || !m.id || (m.source && m.source !== 'tmdb' && m.source !== 'cub')) return cb('');
    var langs = logoLangs(), key = logoKey(m, langs), have = logoCache().get(key);
    if (have !== undefined) return cb(have);
    if (m.images && m.images.logos) { var p = pickLogo(m.images.logos); logoCache().set(key, p); return cb(p); }
    if (logoWait[key]) { logoWait[key].push(cb); return; }
    logoWait[key] = [cb];
    tmdb(kindOf(m) + '/' + m.id + '/images?include_image_language=' + langs.join(',') + ',null', function (j) {
      var p = pickLogo(j && j.logos);
      logoCache().set(key, p);
      var w = logoWait[key]; delete logoWait[key];
      w.forEach(function (f) { f(p); });
    }, function () { var w = logoWait[key]; delete logoWait[key]; w.forEach(function (f) { f(''); }); });
  }
  // the text title's size class: long names (anime) get a smaller font, see the CSS of the card and the banner
  function titleLen(el, text) {
    var n = String(text || '').length;
    el.classList.remove('stv-tl-long', 'stv-tl-xlong');
    if (n > 50) el.classList.add('stv-tl-xlong'); else if (n > 26) el.classList.add('stv-tl-long');
  }
  // a logo picture; until it loads (or without one) the title text stays — no empty box, no "□□□".
  // wanted(): whether the box still wants it; without it, whether the box is on the page — a box filled
  // before it is put on the page (the banner from cached data) must pass wanted, or it keeps its text
  function logoInto(box, m, size, cls, mark, wanted) {
    cls = cls || 'stv-logo';
    getLogo(m, function (p) {
      // (two asks in flight for one box — a slide shown, left and shown again — one picture)
      if (!p || (wanted ? !wanted() : !inDoc(box)) || box.querySelector('img.' + cls)) return;
      var im = new Image();
      im.className = cls;
      im.alt = '';
      im.onload = function () { (mark || box).classList.add('stv-has-logo'); };
      im.onerror = function () { if (im.parentNode) im.parentNode.removeChild(im); };
      im.src = img(p, size);
      box.appendChild(im);
    });
  }

  // ---------- colour from the backdrop: a 32×18 canvas once per picture, kept in memory ----------
  function tintOf(path, cb) {
    if (!path || !opt(K.tint)) return cb(null);
    var have = tints.get(path);
    if (have !== undefined) return cb(have);
    var im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = function () {
      try {
        var c = document.createElement('canvas'); c.width = 32; c.height = 18;
        var x = c.getContext('2d'); x.drawImage(im, 0, 0, 32, 18);
        var d = x.getImageData(0, 0, 32, 18).data, r = 0, g = 0, b = 0, n = 0;
        for (var i = 0; i < d.length; i += 4) {
          var mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
          var w = 1 + (mx - mn) / 32;   // colourful pixels count more than grey ones
          if (mx < 20) w = 0.2;
          r += d[i] * w; g += d[i + 1] * w; b += d[i + 2] * w; n += w;
        }
        var col = [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
        tints.set(path, col);
        cb(col);
      } catch (e) { tints.set(path, null); cb(null); }   // a tainted canvas: same answer next time
    };
    im.onerror = function () { cb(null); };
    im.src = img(path, 'w300');
  }
  // the page colour: the picture's colour, very dark (Apple keeps the art for colour)
  function deep(col, f) { return 'rgb(' + col.map(function (v) { return Math.round(v * f); }).join(',') + ')'; }
  function deepA(col, f, a) { return 'rgba(' + col.map(function (v) { return Math.round(v * f); }).join(',') + ',' + a + ')'; }

  // ---------- CSS ----------
  var FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Snack Inter", "Helvetica Neue", Roboto, Arial, sans-serif';
  // The theme's Inter (Cyrillic and Latin subsets) from <the script's folder>/snack_tv/. A host without that
  // folder (the hub, a copy of the script alone) would answer 404 on every start: with the FontFace API the
  // faces are dropped when they fail (the system font stays) and the folder is not asked again for a day.
  // The faces join document.fonts at once, as @font-face would (no later swap than before on our server).
  // Old TV browsers without the API: plain @font-face (the font is asked for on every start there)
  var FONT_FILES = [['inter-cyr', 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'],
    ['inter-lat', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD']];
  var FONT_MISS = 'stv_font_miss', fontsAsked = false;
  function fontFace() {
    var base = scriptBase();
    if (!base) return '';
    if (window.FontFace && document.fonts && document.fonts.add) { loadFonts(base); return ''; }
    return FONT_FILES.map(function (f) {
      return '@font-face{font-family:"Snack Inter";font-style:normal;font-weight:400 700;font-display:swap;src:url(' + base + 'snack_tv/' + f[0] + '.woff2) format("woff2");unicode-range:' + f[1] + '}';
    }).join('');
  }
  function loadFonts(base) {
    if (fontsAsked) return;
    fontsAsked = true;
    try { var miss = objOf(Lampa.Storage.get(FONT_MISS, '{}')); if (miss.b === base && Date.now() - miss.t < 864e5) return; } catch (e) {}
    FONT_FILES.forEach(function (f) { addFace(base, f, '400 700'); });
  }
  // one file as a face. Older engines (Chrome 53–61, old Safari) do not take a weight range: the face
  // fails to parse (a throw, status «error» or a SyntaxError from load) - then again as plain 400 (bold
  // drawn from it, as their CSS path does). Only a file that did not come (the network) is remembered
  function addFace(base, f, weight) {
    var again = function () { if (weight !== '400') addFace(base, f, '400'); };
    var face;
    try {
      face = new FontFace('Snack Inter', 'url(' + base + 'snack_tv/' + f[0] + '.woff2) format("woff2")',
        { style: 'normal', weight: weight, display: 'swap', unicodeRange: f[1] });
    } catch (e) { again(); return; }
    if (face.status === 'error') { again(); return; }
    try { document.fonts.add(face); } catch (e) { again(); return; }
    face.load().then(null, function (err) {
      try { document.fonts['delete'](face); } catch (e) {}
      if (err && err.name === 'SyntaxError') { again(); return; }
      try { Lampa.Storage.set(FONT_MISS, { b: base, t: Date.now() }, true); } catch (e) {}
    });
  }
  var BASE = '';
  function scriptBase() {
    if (BASE) return BASE;
    try {
      var s = document.currentScript && document.currentScript.src;
      if (!s) { var list = document.getElementsByTagName('script'); for (var i = 0; i < list.length; i++) if (/snack_tv\.js/.test(list[i].src)) s = list[i].src; }
      if (s) BASE = s.replace(/[^\/]*$/, '');
    } catch (e) {}
    return BASE;
  }
  scriptBase();

  var PHONE = '@media screen and (max-width:599px){';
  // a size in px for the look: (tvOS value, iPad value)
  function tp(tvN, padN) { return px(M === 'tv' ? tvN : padN); }
  // the values every part of the sheet shares
  function cssCtx() {
    var t = T[M], B = 'body.stv', G = L ? 'rgba(52,52,58,.92)' : 'rgba(40,40,46,.55)', ease = 'cubic-bezier(.2,.8,.2,1)', tv = M === 'tv';
    var blur = L ? '' : '-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);';
    return { t: t, B: B, G: G, ease: ease, tv: tv, PAGE: tv ? '#101014' : '#000', hH: window.innerHeight, F: B + ' .stv-full',
      glass: 'background:' + G + ';' + blur + (L ? '' : 'box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 0 0 1px rgba(255,255,255,.07);'),
      MOVE: 'transition:transform ' + t.dur + 'ms ' + ease };
  }
  // the theme's whole stylesheet, part by part (the order of the parts is the cascade order)
  function css() {
    var c = cssCtx();
    return [fontFace(), cssBase(c), cssFull(c), cssEpisodes(c), cssAutopilot(c), cssRows(c), cssHero(c), cssPanels(c), cssSearch(c), cssPosters(c), cssPerson(c), cssSchedule(c), cssTorrents(c), cssBars(c)].join('\n');
  }
  // ---- the page: font, colour, header, what is hidden by default
  function cssBase(c) {
    var t = c.t, B = c.B, glass = c.glass, PAGE = c.PAGE, r = [];
    // ---- base: font, black, no Lampa accents
    r.push(B + '{font-family:' + FONT + ';-webkit-font-smoothing:antialiased}');
    r.push(B + ' .background{display:none}');
    // ---- header (Apple TV has no clock, date or tray icons)
    r.push(B + '.stv-head .head__time,' + B + '.stv-head .notice--icon,' + B + '.stv-head .full--screen,' + B + '.stv-head .open--broadcast,' +
      B + '.stv-head .head__markers,' + B + '.stv-head .head__logo-icon{display:none!important}');
    // the menu button where Lampa shows it (touch, mouse), even when a site's own CSS hides it for its logo
    // (siaivo: .head__menu-icon{display:none!important}), the logo being hidden here
    r.push(B + '.true--mobile .head__menu-icon,' + B + '.mouse--controll:not(.true--mobile) .head__menu-icon{display:block!important}');
    r.push(B + ' .head__title{font-weight:700;letter-spacing:-.01em}');
    r.push(B + ' .head,' + B + ' .head__body{background:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;box-shadow:none!important}');
    // the header floats over the page (Apple's bars do): Lampa measures it as 0 high, pages start at the
    // top; screens without a picture at the top get the header's height as an inset of their scroll
    var headH = Math.round(4 * t.base * k);
    // only on Home and the card (their picture runs under it); every other page keeps Lampa's layout
    var FH = B + '.stv-float-head';
    r.push(FH + ' .head{height:0;overflow:visible}');
    r.push(B + ' .head:before{content:"";position:absolute;left:0;right:0;top:0;height:' + Math.round(headH * 1.3) + 'px;z-index:-1;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,.6),rgba(0,0,0,0))}');
    r.push(FH + ' .wrap__content{padding-top:0}');
    // Home and the card: their picture runs under the floating header, no inset of Lampa's
    r.push(B + ' .activity.stv-home .scroll:not(.scroll--horizontal) > .scroll__content,' + B + ' .activity.stv-full .scroll:not(.scroll--horizontal) > .scroll__content,' + B + ' .activity.stv-apv .scroll:not(.scroll--horizontal) > .scroll__content{padding-top:0}');
    r.push(B + ':not(.stv-float-head) .head:before{display:none}');
    r.push(B + '.stv-head .head__title{display:none}');
    r.push(B + ' .head__actions{margin-left:auto}');
    // one page colour: Apple black on iPad, tvOS 26's near-black on TVs
    r.push(B + ',' + B + ' .wrap,' + B + ' .wrap__content,' + B + ' .activitys,' + B + ' .activity,' + B + ' .activity__body{background-color:' + PAGE + '}');
    r.push(B + ' .head__action{border-radius:50%;' + glass + 'color:#fff}');
    r.push(B + ' .head__action.focus{background:#fff;color:#000}');
    // ---- hidden by default (each comes back in the settings)
    r.push(B + '.stv-react .full-start-new__reactions,' + B + '.stv-react .button--reaction{display:none!important}');
    r.push(B + '.stv-tech .card__quality,' + B + '.stv-tech .full-start__status,' + B + '.stv-tech .card__type{display:none!important}');
    return r.join('\n');
  }
  // ---- the full card: backdrop, logo, meta line, buttons, cast, «About»
  function cssFull(c) {
    var t = c.t, B = c.B, G = c.G, glass = c.glass, ease = c.ease, tv = c.tv, hH = c.hH, MOVE = c.MOVE, F = c.F, r = [];
    r.push(F + '{background:#000;background:var(--stv-bg,#000)}');
    // the backdrop: full bleed, under the header, fading into the page at the bottom and the left
    r.push(F + ' .full-start__background{left:0;top:0;width:100%;height:100%;-webkit-mask-image:none;mask-image:none;object-fit:cover;' +
      'transition:opacity .5s;position:absolute;z-index:-1}');
    r.push(F + ' .full-start__background.loaded{opacity:1}');
    // the vertical art whole, across the width at the top (Apple's iPhone page), not stretched to the
    // screen's height and cut at the sides
    r.push(F + ' .stv-own-bg--poster{object-position:50% 0;height:auto!important;max-height:100%}');
    r.push(F + ' .alc-trailer-bg,' + F + ' .alc-trailer-bg iframe,' + B + ' .stv-hero .alc-trailer-bg iframe{pointer-events:none!important}');
    r.push(F + ' .full-start__background.dim{opacity:.35}');
    r.push(F + ' .stv-scrim{position:absolute;left:0;top:0;width:100%;height:100%;z-index:-1;pointer-events:none;' +
      'background:linear-gradient(to top,#000 0%,rgba(0,0,0,.6) ' + (tv ? 30 : 26) + '%,rgba(0,0,0,0) ' + (tv ? 62 : 58) + '%),linear-gradient(to right,rgba(0,0,0,.6) 0%,rgba(0,0,0,0) ' + (tv ? 55 : 62) + '%);' +
      'background:linear-gradient(to top,var(--stv-bg,#000) 0%,var(--stv-bg-a6,rgba(0,0,0,.6)) ' + (tv ? 30 : 26) + '%,rgba(0,0,0,0) ' + (tv ? 62 : 58) + '%),' +
      'linear-gradient(to right,var(--stv-bg-a6,rgba(0,0,0,.6)) 0%,rgba(0,0,0,0) ' + (tv ? 55 : 62) + '%)}');
    // under the title, the text and the buttons (bottom left): one more shade, so the description
    // stays readable over a light or busy backdrop (Apple darkens the same corner)
    r.push(F + ' .stv-scrim:after{content:"";position:absolute;left:0;top:0;width:100%;height:100%;' +
      'background:radial-gradient(ellipse 90% 85% at 0% 70%,rgba(0,0,0,.6) 0%,rgba(0,0,0,.6) 50%,rgba(0,0,0,0) 100%);' +
      'background:radial-gradient(ellipse 90% 85% at 0% 70%,var(--stv-bg-a6,rgba(0,0,0,.6)) 0%,var(--stv-bg-a6,rgba(0,0,0,.6)) 50%,rgba(0,0,0,0) 100%)}');
    // no poster; the info block sits at the bottom left of the first screen
    r.push(F + ' .full-start-new__left{display:none}');
    r.push(F + ' .full-start-new__right{margin:0!important;padding:0!important;border-radius:0!important;background:none!important;overflow:visible!important;' +
      '-webkit-backdrop-filter:none!important;backdrop-filter:none!important;box-shadow:none!important}');
    r.push(F + ' .full-start-new{padding:0 ' + px(t.margin) + ' ' + tp(36, 28) + '}');
    r.push(F + ' .full-start-new__body{min-height:' + Math.round(hH * (tv ? 0.72 : 0.62)) + 'px;display:flex;align-items:flex-end}');
    // phones in landscape (390 high): the logo + text + buttons outgrow the body and the logo went under the header
    if (!tv) r.push(F + ' .full-start-new__body{box-sizing:border-box;padding-top:' + px(64) + '}');
    r.push(F + ' .full-start-new__right{width:100%;max-width:none;padding:0}');
    r.push(F + ' .full-start-new__head,' + F + ' .full-start-new__details,' + F + ' .full-start-new__tagline{display:none}');
    // title: the logo art; the text only until (or without) it
    r.push(F + ' .full-start-new__title{font-size:' + tp(76, 40) + ';line-height:1.05;font-weight:800;letter-spacing:-.02em;margin:0 0 ' + tp(18, 12) + ';' +
      'max-width:' + px(t.descW + 100) + ';overflow-wrap:anywhere;display:block;max-height:none;overflow:visible;-webkit-line-clamp:unset}');
    // a long name without a logo (anime): smaller and at most 3 lines, else it pushed the buttons off the screen
    r.push(F + ' .full-start-new__title.stv-tl-long{font-size:' + tp(54, 30) + '}' + F + ' .full-start-new__title.stv-tl-xlong{font-size:' + tp(42, 24) + '}');
    r.push(F + ' .full-start-new__title:not(.stv-has-logo){display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}');
    r.push(F + ' .full-start-new__title.stv-has-logo{font-size:0;line-height:0;color:transparent}');
    r.push(F + ' .full-start-new__title .stv-logo{display:block;max-width:' + px(t.logoW) + ';max-height:' + px(t.logoH) + ';width:auto;height:auto;' +
      'object-fit:contain;object-position:left bottom;opacity:0;transition:opacity .35s}');
    r.push(F + ' .full-start-new__title.stv-has-logo .stv-logo{opacity:1}');
    r.push(F + ' .full-start-new__title:not(.stv-has-logo) .stv-logo{position:absolute;width:1px;height:1px}');
    // meta line and badges
    r.push(F + ' .stv-meta{text-shadow:0 1px 2px rgba(0,0,0,.45),0 0 18px rgba(0,0,0,.35)}');
    r.push(F + ' .stv-meta{font-size:' + px(t.sub) + ';color:rgba(235,235,245,.85);font-weight:500;margin-bottom:' + tp(12, 8) + ';display:flex;flex-wrap:wrap;align-items:center}');
    r.push(F + ' .stv-meta > span + span:before{content:"·";margin:0 .4em;opacity:.8}');
    r.push(F + ' .stv-badge{display:inline-block;border:1px solid rgba(255,255,255,.55);border-radius:.25em;padding:0 .3em;font-size:.82em;line-height:1.35;font-weight:600}');
    r.push(F + ' .stv-meta > span.stv-ua:before,' + F + ' .stv-meta > span.stv-nodot:before{content:"";margin:0 .25em}');
    r.push(F + ' .stv-ua .stv-badge{border-color:#ffd500;color:#ffd500}');
    r.push(F + ' .stv-meta .full-start-new__rate-line{display:inline-flex;align-items:center;margin:0;padding:0;font-size:1em;flex-wrap:nowrap}');
    r.push(F + ' .stv-meta .full-start-new__rate-line:before{content:"·";margin:0 .4em;opacity:.8}');
    r.push(F + ' .stv-meta .full-start__rate{display:inline-flex;align-items:baseline;margin:0 .55em 0 0;padding:0;border:0;background:none;font-size:1em;font-weight:600;color:#fff}');
    r.push(F + ' .stv-meta .full-start__rate > div{font-size:1em!important;margin:0;padding:0;line-height:1.2}');
    r.push(F + ' .stv-meta .full-start__rate > div + div{margin-left:.3em;font-weight:500;color:rgba(235,235,245,.6);font-size:.8em!important}');
    r.push(F + ' .stv-meta .full-start__rate.hide{display:none}');
    r.push(F + ' .full-start-new__rate-line .source--name{opacity:.7}');
    r.push(F + ' .full-start-new__rate-line .full-start__pg{display:none}');
    // buttons: the white capsule (Autopilot / play) + round glass buttons
    var BTN = F + ' .full-start-new__buttons';
    r.push(BTN + '{display:flex;flex-wrap:nowrap;align-items:flex-start;margin:0;padding-bottom:' + px(8) + '}');
    // what the row leaves out is in «⋯» (see markButtons)
    r.push(BTN + ' > .full-start__button.stv-more{display:none!important}');
    r.push(BTN + ' > .full-start__button{position:relative;width:' + px(t.round) + ';height:' + px(t.round) + ';min-width:0;padding:0;margin:0 ' + tp(22, 28) + ' ' + tp(10, 6) + ' 0;' +
      'border-radius:50%;justify-content:center;font-size:' + px(t.btnFont) + ';color:#fff;' + glass +
      MOVE + ',background-color .15s,color .15s}');
    r.push(BTN + ' > .full-start__button > svg{width:' + px(t.round * 0.42) + ';height:' + px(t.round * 0.42) + '}');
    // no labels under the round buttons: TVs show the focused one's name under it (as wide as it needs),
    // touch shows it on a long press (.stv-tip)
    r.push(BTN + ' > .full-start__button > span{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin:' + px(6) + ' 0 0;font-size:' + px(t.cap2) + ';' +
      'line-height:1.15;color:rgba(235,235,245,.7);font-weight:500;text-align:center;white-space:nowrap;max-width:none;overflow:visible;' + (tv ? 'display:block!important}' : 'display:none!important}'));
    r.push(BTN + ' > .full-start__button > span:empty{display:none!important}');
    if (!tv) {
      r.push(B + ' .stv-tip{position:fixed;left:0;top:0;z-index:1000;padding:' + px(6) + ' ' + px(11) + ';border-radius:' + px(9) + ';background:rgba(44,44,48,.97);color:#fff;font-size:' + px(t.cap + 1) + ';' +
        'font-weight:600;white-space:nowrap;pointer-events:none;opacity:0;transform:translateY(' + px(4) + ');transition:opacity .15s,transform .15s' + (L ? '' : ';box-shadow:0 6px 20px rgba(0,0,0,.45)') + '}');
      r.push(B + ' .stv-tip.on{opacity:1;transform:none}');
    }
    r.push(BTN + ' > .full-start__button.stv-primary{margin-right:' + tp(22, 30) + ';width:auto;min-width:' + tp(300, 200) + ';height:' + px(t.btnH) + ';border-radius:' + px(t.btnH) + ';padding:0 ' + px(t.btnPad) + ';' +
      'background:#fff;color:#000;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none}');
    r.push(BTN + ' > .full-start__button.stv-primary > svg{width:' + px(t.btnFont * 1.05) + ';height:' + px(t.btnFont * 1.05) + '}');
    r.push(BTN + ' > .full-start__button.stv-primary > span{display:inline!important;position:static;transform:none;margin:0 0 0 ' + px(10) + ';font-size:' + px(t.btnFont) + ';font-weight:600;color:inherit;max-width:none;overflow:visible;white-space:nowrap;width:auto;min-width:0}');
    if (tv) {
      // tvOS: unfocused = dark glass, focused = white with black text, lifted; labels only for the focused one
      r.push(BTN + ' > .full-start__button.stv-primary{background:' + G + ';color:#fff}');
      r.push(BTN + ' > .full-start__button > span{opacity:0;transition:opacity .15s}');
      r.push(BTN + ' > .full-start__button.stv-primary > span{opacity:1}');
      r.push(BTN + ' > .full-start__button.focus{background:#fff;color:#000;transform:scale(1.06)' + (L ? '' : ';box-shadow:0 14px 30px rgba(0,0,0,.45)') + '}');
      r.push(BTN + ' > .full-start__button.focus > span{opacity:1;color:#fff}');
      r.push(BTN + ' > .full-start__button.stv-primary.focus > span{color:#000}');
    } else {
      r.push(BTN + ' > .full-start__button:active{transform:scale(.95)}');
    }
    // Autopilot's white button is the one to press: Lampa's own Play goes (setting «Скрыть стандартную кнопку»)
    r.push(B + '.stv-noplay .stv-full .full-start-new__buttons > .button--play:not(.stv-primary){display:none!important}');
    // cast: circles
    r.push(F + ' .full-person{width:' + px(t.castD + (tv ? 20 : 14)) + ';margin-right:' + tp(22, 12) + ';background:none;display:block;text-align:center}');
    r.push(F + ' .full-person__photo{width:' + px(t.castD) + ';height:' + px(t.castD) + ';border-radius:50%;margin:0 auto ' + tp(12, 8) + ';overflow:hidden;background:rgba(255,255,255,.1)}');
    r.push(F + ' .full-person__photo img{width:100%;height:100%;object-fit:cover}');
    r.push(F + ' .full-person__body{padding:0}');
    r.push(F + ' .full-person__name{font-size:' + px(t.cap + 1) + ';font-weight:600;line-height:1.25}');
    r.push(F + ' .full-person__role{font-size:' + px(t.cap2) + ';color:rgba(235,235,245,.55);margin-top:.2em}');
    if (tv) r.push(F + ' .full-person.focus .full-person__photo{transform:scale(1.09);box-shadow:0 0 0 ' + px(3) + ' #fff;transition:transform ' + t.dur + 'ms ' + ease + '}');
    // focus / hover: Lampa paints a white box with black text; ours has no box, so the text stays white
    // (the ring and the lift on the portrait show the focus)
    r.push(F + ' .full-person.focus,' + F + ' .full-person.hover{background:none;color:#fff}');
    if (!tv) r.push(F + ' .full-person:active .full-person__photo{transform:scale(.95)}');
    // Movie and series synopsis is omitted; keep Lampa's detail row out if another component adds it.
    r.push(B + ' .stv-full .full-descr{display:none!important}');
    // a phone (Apple TV on iPhone): the art fills the top, a deep gradient of its own colour under the
    // title and buttons
    // (last in the part: the general rules above must not override it)
    var bgc = 'var(--stv-bg,#000)', bga = 'var(--stv-bg-a6,rgba(0,0,0,.6))';
    r.push(PHONE + F + ' .stv-scrim{background:linear-gradient(to top,#000 0%,#000 44%,rgba(0,0,0,.8) 62%,rgba(0,0,0,0) 86%);' +
      'background:linear-gradient(to top,' + bgc + ' 0%,' + bgc + ' 44%,' + bga + ' 62%,rgba(0,0,0,0) 86%)}' +
      F + ' .stv-scrim:after{display:none}' +
      F + ' .full-start-new__body{min-height:' + Math.round(hH * 0.86) + 'px}' +
      F + ' .full-start-new__right{display:flex;flex-direction:column;align-items:flex-start;text-align:left}' +
      F + ' .full-start-new__title{order:1;margin-left:0;margin-right:0;max-width:100%;align-self:flex-start}' +
      F + ' .full-start-new__title .stv-logo{max-width:78vw;object-position:left bottom;margin:0}' +
      F + ' .stv-meta{order:2;justify-content:flex-start}' +
      // the main button and the round buttons stay on one left-aligned row, wrapping only when needed
      F + ' .full-start-new__buttons{order:3;flex-wrap:wrap!important;justify-content:flex-start;width:auto;max-width:100%;align-self:flex-start}' +
      F + ' .full-start-new__buttons > .full-start__button.stv-primary{flex:0 1 auto;min-width:0;max-width:100%;margin:' + px(6) + ' ' + tp(22, 30) + ' ' + px(16) + ' 0!important}' +
      F + ' .full-start-new__buttons > .full-start__button:not(.stv-primary){margin:0 0 ' + px(18) + '!important}' +
      F + ' .full-start-new__title,' + F + ' .stv-meta{text-shadow:0 1px 10px rgba(0,0,0,.45)}' +
      '}');
    return r.join('\n');
  }
  // ---- the episode card: one rounded card, the still (16:9) and a strip under it; the text sits at the
  // bottom, over the still's lower part. Under the text: the still blurred and darkened (iPad, phones),
  // a plain dark strip in the light mode (TVs: no blur). root: the card's class (the theme's .stv-ep,
  // Autopilot's .alc-ep: the same parts, root__img, root__info …)
  function cssEpCard(c, root) {
    var t = c.t, tv = c.tv, MOVE = c.MOVE, r = [];
    var EP = c.B + ' ' + root, STRIP = L ? '#1c1c21' : 'rgba(18,18,22,.5)';
    r.push(EP + '{position:relative;width:' + px(t.epW) + ';margin-right:' + px(t.gutter * (tv ? 0.6 : 0.8)) + ';padding-bottom:' + px(t.epChin) + ';flex-shrink:0;vertical-align:top;white-space:normal;' +
      'border-radius:' + px(t.cardR) + ';overflow:hidden;background:' + (L ? '#1c1c21' : 'rgba(255,255,255,.08)') + ';' + MOVE + '}');
    r.push(EP + '__img{position:relative;padding-bottom:56.25%;overflow:hidden;background:none}');
    r.push(EP + '__img img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .3s}');
    r.push(EP + ' img.loaded{opacity:1}');
    if (L) r.push(EP + '__img:after{content:"";position:absolute;left:0;right:0;bottom:0;height:60%;background:linear-gradient(to bottom,rgba(0,0,0,0),' + STRIP + ')}');
    else {
      // no seam: the sharp still dissolves (a mask, not a dark band) into its blurred copy, which is
      // laid out the same way and only runs on under the strip
      r.push(EP + '__img img{-webkit-mask-image:linear-gradient(to bottom,#000 35%,rgba(0,0,0,.6) 62%,rgba(0,0,0,0) 100%);mask-image:linear-gradient(to bottom,#000 35%,rgba(0,0,0,.6) 62%,rgba(0,0,0,0) 100%)}');
      r.push(EP + '__blur{position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden}');
      r.push(EP + '__blur img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:50% 100%;opacity:0;transform:scale(1.15);-webkit-filter:blur(' + px(18) + ') brightness(.55) saturate(1.2);filter:blur(' + px(18) + ') brightness(.55) saturate(1.2)}');
      r.push(EP + ' ' + root + '__blur img.loaded{opacity:1}');
      // a soft shade under the text over both
      r.push(EP + ':after{content:"";position:absolute;left:0;right:0;bottom:0;height:62%;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,.35))}');
      r.push(EP + '__info{z-index:1}');
    }
    r.push(EP + '__info{position:absolute;left:0;right:0;bottom:0;padding:0 ' + tp(18, 12) + ' ' + tp(16, 11) + ';text-shadow:0 1px 3px rgba(0,0,0,.35)}');
    r.push(EP + '__cap{font-size:' + px(t.cap2) + ';letter-spacing:.06em;color:rgba(235,235,245,.7);font-weight:600}');
    r.push(EP + '__name{font-size:' + tp(27, 15) + ';font-weight:600;line-height:1.25;margin-top:.1em;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden}');
    r.push(EP + '__descr{font-size:' + px(t.cap) + ';line-height:1.3;color:rgba(235,235,245,.72);margin-top:.2em;height:2.6em;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}');
    r.push(EP + '__time{display:flex;align-items:center;font-size:' + px(t.cap2) + ';color:rgba(235,235,245,.6);margin-top:.35em}');
    r.push(EP + '__bar{flex:0 0 ' + tp(60, 36) + ';height:' + tp(6, 4) + ';border-radius:9px;background:rgba(255,255,255,.3);overflow:hidden;margin-right:' + tp(10, 7) + '}');
    r.push(EP + '__bar > div{height:100%;background:#fff;border-radius:9px}');
    r.push(EP + '__seen{position:absolute;right:' + px(8) + ';top:' + px(8) + ';width:' + tp(34, 22) + ';height:' + tp(34, 22) + ';border-radius:50%;background:rgba(0,0,0,.55);' +
      'color:#fff;font-size:' + tp(20, 13) + ';line-height:' + tp(34, 22) + ';text-align:center;font-weight:700}');
    r.push(EP + root + '--soon ' + root + '__img img{opacity:.5}');
    if (tv) {
      r.push(EP + '.focus{transform:scale(' + t.focusScale + ');box-shadow:0 0 0 ' + px(3) + ' rgba(255,255,255,.75)' + (L ? '' : ',0 22px 44px rgba(0,0,0,.55)') + '}');
    } else r.push(EP + ':active{transform:scale(.97)}');
    return r.join('\n');
  }
  // ---- the card's episode row and its season pull-down
  function cssEpisodes(c) {
    var t = c.t, glass = c.glass, ease = c.ease, tv = c.tv, F = c.F, r = [];
    // the episode card (the card's episode row, the schedule)
    r.push(cssEpCard(c, '.stv-ep'));
    // the season pull-down at the head of the episode row
    r.push(F + ' .stv-season-title{display:inline-flex!important;align-items:center;cursor:pointer;border-radius:' + px(12) + ';padding:' + px(2) + ' ' + px(8) + ';margin-left:-' + px(8) + ';transition:background-color .15s,color .15s;white-space:nowrap;flex-shrink:0}');
    r.push(F + ' .stv-season-chev{display:inline-block;flex:0 0 auto;width:.5em!important;height:.8em!important;margin-left:.35em;opacity:.75}');
    if (tv) r.push(F + ' .stv-season-title.focus{background:#fff;color:#000}');
    else r.push(F + ' .stv-season-title:active{background:rgba(255,255,255,.15)}');
    r.push(F + ' .stv-season{display:inline-flex;align-items:center;height:' + tp(56, 34) + ';padding:0 ' + tp(26, 16) + ';border-radius:' + px(40) + ';' + glass +
      'font-size:' + tp(27, 15) + ';font-weight:600;color:#fff;margin-right:' + px(t.gutter) + ';flex-shrink:0;vertical-align:top;transition:transform ' + t.dur + 'ms ' + ease + '}');
    r.push(F + ' .stv-season:after{content:"";width:.45em;height:.45em;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);margin:-.25em 0 0 .55em}');
    if (tv) r.push(F + ' .stv-season.focus{background:#fff;color:#000;transform:scale(1.06)}');
    r.push(F + ' .stv-eprow .scroll__body{display:flex;align-items:flex-start}');
    r.push(F + ' .stv-eprow .card-more,' + F + ' .stv-eprow .full-episode{display:none!important}');
    return r.join('\n');
  }
  // ---- Autopilot's screen (alc_auto: the head, the voice chips, a row per season, the movie's voices);
  // its own sheet lays it out plainly, this is the Apple look over it
  function cssAutopilot(c) {
    var t = c.t, B = c.B, G = c.G, glass = c.glass, tv = c.tv, hH = c.hH, PAGE = c.PAGE, MOVE = c.MOVE, r = [];
    var A = B + ' .alc-ap', M = px(t.margin), FADE = ',background-color .15s,color .15s';
    r.push(cssEpCard(c, '.alc-ep'));
    if (!L) r.push(B + ' .alc-ep__blur{display:block}');   // Autopilot's sheet hides it; it loads only when shown
    // an episode the series' voice lacks: grey, with the voice that has it; one still loading: dim
    r.push(B + ' .alc-ep--other .alc-ep__img img.loaded,' + B + ' .alc-ep--none .alc-ep__img img.loaded{opacity:.42;-webkit-filter:grayscale(1);filter:grayscale(1)}');
    r.push(B + ' .alc-ep--other .alc-ep__blur,' + B + ' .alc-ep--none .alc-ep__blur{opacity:.45}');
    r.push(B + ' .alc-ep--other .alc-ep__info,' + B + ' .alc-ep--none .alc-ep__info{opacity:.6}' + B + ' .alc-ep--wait .alc-ep__info{opacity:.7}');
    r.push(B + ' .alc-ep__tag{left:' + tp(14, 9) + ';bottom:auto;top:' + tp(14, 9) + ';padding:' + tp(6, 3) + ' ' + tp(16, 10) + ';border-radius:' + px(40) + ';font-size:' + px(t.cap2) + ';' +
      'font-weight:600;color:#fff;background:' + G + '}');   // (solid: a blur behind each tag costs old TVs)
    if (!tv) r.push(B + ' .alc-ep.focus{box-shadow:none}');   // touch: no focus ring (a tap plays)
    // the page: the theme's colour and margins; rows run to the right edge, the focused card stays on the margin
    r.push(A + '{padding-bottom:' + tp(80, 40) + '}');
    r.push(A + '-season,' + A + '__chips{padding-left:0;padding-right:0}');
    r.push(A + '-season > .scroll,' + A + '__chips > .scroll{padding-left:' + M + ';padding-top:' + tp(14, 4) + ';padding-bottom:' + tp(26, 6) + '}');
    r.push(A + '-season__top{padding:0 ' + M + '}');
    // the head: the art darkened, fading into the page; the logo small, the white button, «⋯»
    // the head: the card's picture (from the very top, under the floating header), lower than the card's so the
    // voices / seasons show at once
    r.push(A + '__head{min-height:' + Math.round(hH * 0.6) + 'px;padding:' + tp(150, 90) + ' ' + M + ' ' + tp(30, 22) + '}');
    r.push(PHONE + A + '__head{min-height:' + Math.round(hH * 0.5) + 'px}}');
    r.push(A + '__art img{object-position:50% 15%}');
    r.push(A + '__art img.loaded{opacity:.62}');
    r.push(A + '__shade{background:linear-gradient(to top,' + PAGE + ' 0%,rgba(0,0,0,.5) 38%,rgba(0,0,0,0) 72%),linear-gradient(to right,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 60%)}');
    r.push(A + '__logo img{max-width:' + px(t.logoW * 0.62) + ';max-height:' + px(t.logoH * 0.62) + ';margin-bottom:' + tp(16, 10) + ';object-fit:contain;object-position:left bottom}');
    r.push(A + '__title{font-size:' + tp(56, 32) + ';font-weight:800;letter-spacing:-.02em}');
    r.push(A + '__meta{font-size:' + px(t.sub) + ';color:rgba(235,235,245,.72);font-weight:500;opacity:1;margin-bottom:' + tp(22, 14) + '}');
    r.push(A + '__play{height:' + px(t.btnH) + ';padding:0 ' + px(t.btnPad) + ';border-radius:' + px(t.btnH) + ';font-size:' + px(t.btnFont) + ';font-weight:600;box-sizing:border-box;' +
      MOVE + FADE + '}');
    r.push(A + '__play svg{width:' + px(t.btnFont * 1.05) + ';height:' + px(t.btnFont * 1.05) + ';margin-right:' + px(10) + '}');
    r.push(A + '__bar{left:' + px(t.btnPad) + ';right:' + px(t.btnPad) + ';bottom:' + tp(9, 6) + ';height:' + tp(5, 3) + '}');
    r.push(A + '__more{width:' + px(t.round) + ';height:' + px(t.round) + ';margin-left:' + tp(22, 16) + ';color:#fff;' + glass + MOVE + '}');
    r.push(A + '__more svg{width:' + px(t.round * 0.42) + ';height:' + px(t.round * 0.42) + '}');
    if (tv) {
      // tvOS: unfocused = dark glass, focused = white, lifted
      r.push(A + '__play{background:' + G + ';color:#fff}' + A + '__play .alc-ap__bar{background:rgba(255,255,255,.25)}' + A + '__play .alc-ap__bar div{background:#fff}');
      r.push(A + '__play.focus,' + A + '__more.focus{background:#fff;color:#000;transform:scale(1.06);box-shadow:' + (L ? 'none' : '0 14px 30px rgba(0,0,0,.45)') + '}');
      r.push(A + '__play.focus .alc-ap__bar{background:rgba(0,0,0,.2)}' + A + '__play.focus .alc-ap__bar div{background:#000}');
    } else {
      r.push(A + '__play.focus,' + A + '__more.focus{box-shadow:none}' + A + '__more.focus{background:' + G + ';color:#fff}');
      r.push(A + '__play:active,' + A + '__more:active{transform:scale(.95)}');
    }
    // the voice chips: glass capsules, the series' voice white
    var CH = B + ' .alc-chip';
    r.push(CH + '{height:' + tp(52, 34) + ';line-height:' + tp(52, 34) + ';padding:0 ' + tp(26, 16) + ';margin-right:' + tp(16, 10) + ';border-radius:' + px(40) + ';font-size:' + tp(25, 15) + ';' +
      'font-weight:500;color:#fff;' + glass + MOVE + FADE + '}');
    r.push(CH + '--on{background:#fff;color:#000;font-weight:600;box-shadow:none}');
    r.push(CH + '--all{background:none;box-shadow:none;color:rgba(235,235,245,.8)}');
    if (tv) r.push(CH + '.focus{background:#fff;color:#000;transform:scale(1.08);box-shadow:' + (L ? 'none' : '0 10px 24px rgba(0,0,0,.45)') + '}' + CH + '--on:not(.focus){background:rgba(255,255,255,.85)}');
    else r.push(CH + '.focus{box-shadow:none}' + CH + ':active{transform:scale(.95)}');
    // a season: «Season 2» and its line (in which voice, what else has it)
    r.push(A + '-season{padding-top:' + tp(26, 18) + '}');
    r.push(A + '-season__head{margin:0 0 ' + tp(4, 2) + ' -' + px(8) + ';padding:' + px(2) + ' ' + px(8) + ';border-radius:' + px(12) + ';transition:background-color .15s,color .15s}');
    r.push(A + '-season__title{font-size:' + px(t.title) + ';font-weight:' + t.titleW + ';letter-spacing:-.01em;margin-right:' + tp(16, 10) + '}');
    r.push(A + '-season__sub{font-size:' + px(t.sub) + ';color:rgba(235,235,245,.6);opacity:1}');
    if (tv) r.push(A + '-season__head.focus{background:#fff;color:#000}' + A + '-season__head.focus .alc-ap-season__sub{color:rgba(0,0,0,.6)}');
    else r.push(A + '-season__head.focus{background:none;color:inherit}' + A + '-season__head:active{background:rgba(255,255,255,.12)}');
    // the movie's voices: one column, the glass list; wide (Autopilot's layoutVoices, columns at least --alc-vcol
    // wide, --alc-vgap apart): a plain tvOS list, no panels, the focused one white on TVs, a tint under the finger
    r.push(A + '__voices{padding:' + tp(10, 6) + ' ' + M + ' 0}');
    r.push(B + ' .alc-ap-vgroup{margin-bottom:' + tp(30, 20) + '}');
    r.push(B + ' .alc-ap-vgroup__title{font-size:' + px(t.cap) + ';color:rgba(235,235,245,.6);padding:0 ' + tp(28, 16) + ' ' + tp(10, 6) + '}');
    r.push(A + '__voices{--alc-vcol:' + tp(520, 400) + ';--alc-vgap:' + tp(18, 12) + '}');
    r.push(B + ' .alc-ap-vgroup__list{border-radius:' + px(t.rowR) + ';' + glass + '}');
    r.push(B + ' .alc-ap-vgroup__list--tiles{background:none;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none}');
    r.push(B + ' .alc-ap-vrow + .alc-ap-vrow{margin-top:' + tp(6, 4) + '}');
    r.push(B + ' .alc-ap-voice{padding:' + tp(20, 11) + ' ' + tp(28, 16) + ';border-radius:' + px(t.rowR) + ';font-size:' + tp(27, 16) + ';' + MOVE + FADE + '}');
    r.push(B + ' .alc-ap-voice+.alc-ap-voice:before{left:' + tp(28, 16) + ';background:rgba(255,255,255,.09)}');
    r.push(B + ' .alc-ap-voice__sub{font-size:' + px(t.cap) + ';color:rgba(235,235,245,.5);margin-top:' + tp(4, 2) + '}');
    r.push(B + ' .alc-ap-voice__check{width:' + tp(30, 18) + ';height:' + tp(30, 18) + ';margin-left:' + tp(20, 12) + '}');
    r.push(B + ' .alc-ap__vwait{font-size:' + px(t.cap) + ';color:rgba(235,235,245,.45);padding:0 ' + tp(28, 16) + '}');
    if (tv) r.push(B + ' .alc-ap-voice.focus{background:#fff;color:#000;transform:scale(1.02);box-shadow:' + (L ? 'none' : '0 12px 26px rgba(0,0,0,.45)') + '}' + B + ' .alc-ap-voice.focus .alc-ap-voice__sub{color:rgba(0,0,0,.55)}');
    else r.push(B + ' .alc-ap-voice.focus{background:none;color:inherit}' + B + ' .alc-ap-voice.focus .alc-ap-voice__sub{color:rgba(235,235,245,.5)}' +
      B + ' .alc-ap-voice.focus:before,' + B + ' .alc-ap-voice.focus+.alc-ap-voice:before{display:block}' + B + ' .alc-ap-voice:active{background:rgba(255,255,255,.12)}');
    r.push(A + '__msg-title{font-size:' + px(t.title) + ';font-weight:700}' + A + '__msg{padding:' + tp(40, 24) + ' ' + M + '}');
    return r.join('\n');
  }

  // ---- rows and wide cards (Home, sections, related rows), «Up Next»
  function cssRows(c) {
    var t = c.t, B = c.B, ease = c.ease, tv = c.tv, r = [];
    var R = B + ' .items-line';
    // TV: Lampa scrolls a focused row to the top edge; part of the gap sits above each row so its
    // title stays on screen (same spacing between rows)
    r.push(R + '{padding-bottom:' + tp(t.rowGap - 40, t.rowGap) + (tv ? ';padding-top:' + px(40) : '') + '}');
    r.push(R + ' .items-line__head{padding:0 ' + px(t.margin) + ';margin-bottom:' + tp(20, 10) + ';align-items:center;justify-content:flex-start}');
    // CUB's icon rows (Top 100, collections, people): no icon, the name is the row title
    r.push(R + ' .items-line__head .full-person__photo{display:none!important}');
    r.push(R + ' .items-line__head .full-person{display:block;width:auto;margin:0;padding:0;background:none}');
    r.push(R + ' .items-line__head .full-person__body{padding:0}');
    r.push(R + ' .items-line__head .full-person__name{font-size:' + px(t.title) + ';font-weight:' + t.titleW + ';letter-spacing:-.01em;line-height:1.2;color:#fff}');
    r.push(R + ' .items-line__title{padding-left:0!important;margin-left:0!important;font-size:' + px(t.title) + ';font-weight:' + t.titleW + ';letter-spacing:-.01em;line-height:1.2}');
    r.push(R + ' .items-line__more{margin-left:' + px(6) + ';background:none;padding:0 0 0 .3em;font-size:0;line-height:1;color:rgba(235,235,245,.5);border-radius:.4em}');
    r.push(R + ' .items-line__more:after{content:"›";font-size:' + px(t.title * 1.25) + ';font-weight:600}');
    if (tv) r.push(R + ' .items-line__more.focus{background:#fff;color:#000;padding:0 .35em}');
    r.push(R + ' .scroll--horizontal .scroll__content{padding:0 ' + px(t.margin) + '}');
    r.push(R + ' .scroll--horizontal{-webkit-mask-image:none;mask-image:none}');
    r.push(R + ' .items-line__body{overflow:visible}');
    // touch rows scroll natively (overflow auto on both axes): the title under a poster made them scroll up /
    // down a little. One axis only, and room for the title inside the row (taken from the gap under it)
    if (!tv) {
      var TH = 7 + Math.round(t.cap * 1.25) + 4;
      r.push(R + ' .scroll--horizontal{overflow-y:hidden!important;padding-bottom:' + px(TH) + '}');
      r.push(R + '{padding-bottom:' + px(Math.max(4, t.rowGap + 10 - TH)) + '}');
    }
    // posters in a row: Apple's density (iPad ~6, TV ~7 on screen; phones ~3 and the edge of the next)
    // one size for posters everywhere: a row's poster is as wide as a grid's (cols(): phones 3, iPad 6,
    // TVs 7 across the screen between the side margins); a row shows the edge of the next one
    var RP = R + ' .card:not(.card--wide)';
    r.push(RP + '{width:' + posterCalc(t, cols()) + ';margin-right:' + px(t.gutter) + '}');
    r.push(PHONE + RP + '{width:' + posterCalc(t, phoneCols()) + '}}');
    // (Lampa puts 1em before every card of a row: the gap is the theme's gutter only)
    r.push(R + ' .mapping--line > .card{margin-left:0}');
    var C = B + ' .card--wide';
    r.push(C + '{width:' + px(t.cardW) + ';margin-right:' + px(t.gutter) + ';transition:transform ' + t.dur + 'ms ' + ease + '}');
    r.push(C + ' .card__view{padding-bottom:56.25%;border-radius:' + px(t.cardR) + ';margin-bottom:0;background:rgba(255,255,255,.07)}');
    r.push(C + ' .card__img{border-radius:' + px(t.cardR) + ';object-fit:cover;width:100%;height:100%}');
    r.push(C + ' .card__view:after{display:none!important}');
    r.push(C + ' .card__promo{padding:0;left:0;right:0;bottom:0;top:auto;height:62%;border-radius:0 0 ' + px(t.cardR) + ' ' + px(t.cardR) + ';' +
      'background:linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,.62));pointer-events:none}');
    r.push(C + ' .card__promo-text{display:none}');
    r.push(C + ' .card__promo-title{position:absolute;left:' + tp(18, 11) + ';right:' + tp(18, 11) + ';bottom:' + tp(14, 9) + ';' +
      'font-size:' + tp(30, 17) + ';font-weight:800;line-height:1.1;letter-spacing:-.01em;text-shadow:0 1px 8px rgba(0,0,0,.6);-webkit-line-clamp:2}');
    r.push(C + '.stv-has-logo .card__promo-title{display:none}');
    r.push(C + ' .stv-card-logo{position:absolute;left:' + tp(18, 11) + ';bottom:' + tp(16, 10) + ';max-width:58%;max-height:40%;width:auto;height:auto;' +
      'object-fit:contain;object-position:left bottom;z-index:1;opacity:0;transition:opacity .3s' + (L ? '' : ';filter:drop-shadow(0 1px 6px rgba(0,0,0,.45))') + '}');
    r.push(C + '.stv-has-logo .stv-card-logo{opacity:1}');
    r.push(C + ' .card__icons,' + C + ' .card__marker,' + C + ' .card-watched,' + C + ' .card__type,' + C + ' .card__age,' + C + ' .card__title{display:none!important}');
    // rating and UA: small, inside the frame (nothing sticks out at the row edges)
    r.push(C + ' .card__vote{top:' + tp(12, 7) + ';right:' + tp(12, 7) + ';bottom:auto;left:auto;padding:' + tp(4, 2) + ' ' + tp(9, 6) + ';' +
      'font-size:' + tp(20, 11) + ';font-weight:700;line-height:1.2;border-radius:' + px(20) + ';background:rgba(0,0,0,.55);color:#fff;z-index:2}');
    r.push(C + ' .snack-ua{top:' + tp(12, 7) + ';left:' + tp(12, 7) + ';right:auto;font-size:' + tp(18, 10) + ';border-radius:' + px(5) + ';padding:' + tp(4, 2) + ' ' + tp(7, 4) + '}');
    r.push(C + ' .snack-sub-new{top:auto;bottom:' + px(8) + '}');
    // light mode: Lampa's will-change:transform on every card made each one a layer of its own (60+
    // textures on a TV's weak GPU); the focused card still scales smoothly (Chrome lifts it for the
    // transition only)
    if (L) r.push(B + ' .card{will-change:auto}');
    if (tv) {
      r.push(C + '.focus{transform:scale(' + t.focusScale + ');z-index:2}');
      r.push(C + '.focus .card__view{box-shadow:0 0 0 ' + px(3) + ' rgba(255,255,255,.8)' + (L ? '' : ',0 24px 48px rgba(0,0,0,.55)') + '}');
    } else r.push(C + ':active{transform:scale(.97)}');
    // "Up Next": progress and S2, E5 inside the frame
    r.push(B + ' .stv-cw{position:absolute;left:' + tp(16, 10) + ';right:' + tp(16, 10) + ';bottom:' + tp(12, 8) + ';z-index:2;display:flex;align-items:center;' +
      'font-size:' + tp(21, 12) + ';font-weight:600;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.6)}');
    r.push(B + ' .stv-cw__bar{flex:0 0 ' + tp(60, 36) + ';height:' + tp(6, 4) + ';border-radius:9px;background:rgba(255,255,255,.3);margin-right:' + tp(10, 7) + ';overflow:hidden}');
    r.push(B + ' .stv-cw__bar > div{height:100%;background:#fff}');
    r.push(C + '.stv-cw-card .stv-card-logo{bottom:' + tp(46, 28) + ';max-height:34%}');
    r.push(C + '.stv-cw-card .card__promo-title{bottom:' + tp(44, 26) + '}');
    r.push(B + ' .items-line--type-stv-cw .card--wide{width:' + px(t.cwW) + '}');
    // Shots switched off: the row's empty stand-in
    r.push(B + ' .stv-shots-hidden{display:none!important}');
    return r.join('\n');
  }
  // ---- the banner on Home and the sections
  function cssHero(c) {
    var t = c.t, B = c.B, glass = c.glass, ease = c.ease, tv = c.tv, PAGE = c.PAGE, hH = c.hH, r = [];
    var H = B + ' .stv-hero', heroH = Math.round(hH * (tv ? 0.8 : 0.74));
    r.push(H + '{position:relative;height:' + heroH + 'px;margin:0 0 ' + tp(20, 12) + ';overflow:hidden;background:' + PAGE + '}');
    r.push(H + '__slide{position:absolute;left:0;top:0;width:100%;height:100%;opacity:0;transition:opacity 800ms ease-in-out}');
    r.push(H + '__slide.on{opacity:1}');
    r.push(H + '__slide img{width:100%;height:100%;object-fit:cover;object-position:50% 25%}');
    r.push(H + '__slide--poster img{object-position:50% 0}');
    r.push(H + '__scrim{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;' +
      'background:linear-gradient(to top,' + PAGE + ' 0%,' + (tv ? 'rgba(16,16,20,.55)' : 'rgba(0,0,0,.55)') + ' 22%,rgba(0,0,0,0) 50%),linear-gradient(to right,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 55%),' +
      'linear-gradient(to bottom,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 18%)}');
    r.push(H + '__info{position:absolute;left:' + px(t.margin) + ';bottom:' + tp(70, 44) + ';width:' + px(t.descW) + ';transition:opacity .35s}');
    r.push(H + '__info.fade{opacity:0}');
    r.push(H + '__title{font-size:' + tp(70, 38) + ';line-height:1.05;font-weight:800;letter-spacing:-.02em;margin-bottom:' + tp(16, 10) + ';overflow-wrap:anywhere}');
    r.push(H + '__title.stv-tl-long{font-size:' + tp(50, 28) + '}' + H + '__title.stv-tl-xlong{font-size:' + tp(40, 22) + '}');
    r.push(H + '__title:not(.stv-has-logo){display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}');
    r.push(H + '__title.stv-has-logo{font-size:0;line-height:0}');
    r.push(H + '__title .stv-logo{display:block;max-width:' + px(t.logoW) + ';max-height:' + px(t.logoH) + ';width:auto;height:auto;object-fit:contain;object-position:left bottom}');
    r.push(H + '__title:not(.stv-has-logo) .stv-logo{position:absolute;width:1px;height:1px;opacity:0}');
    r.push(H + '__meta{font-size:' + px(t.sub) + ';color:rgba(235,235,245,.75);font-weight:500;margin-bottom:' + tp(10, 6) + '}');
    r.push(H + '__meta .stv-badge{display:inline-block;border:1px solid rgba(255,255,255,.55);border-radius:.25em;padding:0 .3em;font-size:.82em;line-height:1.35;font-weight:600}');
    r.push(H + '__meta .stv-ua{border-color:#ffd500;color:#ffd500}');
    r.push(H + '__btns{display:flex;align-items:center}');
    r.push(H + '__btn{display:inline-flex;align-items:center;justify-content:center;height:' + px(t.btnH) + ';padding:0 ' + px(t.btnPad) + ';border-radius:' + px(t.btnH) + ';' +
      'background:#fff;color:#000;font-size:' + px(t.btnFont) + ';font-weight:600;margin-right:' + tp(22, 14) + ';transition:transform ' + t.dur + 'ms ' + ease + '}');
    r.push(H + '__btn svg{width:' + px(t.btnFont) + ';height:' + px(t.btnFont) + ';margin-right:' + px(10) + '}');
    r.push(H + '__btn--round{width:' + px(t.btnH) + ';padding:0;' + glass + 'color:#fff}');
    r.push(H + '__btn--round svg{margin:0}');
    if (tv) {
      r.push(H + '__btn{' + glass + 'color:#fff}');
      r.push(H + '__btn.focus{background:#fff;color:#000;transform:scale(1.06)}');
    } else r.push(H + '__btn:active{transform:scale(.95)}');
    r.push(H + '__dots{position:absolute;left:50%;bottom:' + tp(26, 16) + ';transform:translateX(-50%);display:flex;align-items:center;padding:' + tp(8, 5) + ' ' + tp(12, 8) + ';border-radius:' + px(20) + ';' + (tv ? glass : '') + '}');
    r.push(H + '__dot{width:' + px(t.dot) + ';height:' + px(t.dot) + ';border-radius:' + px(t.dot) + ';background:rgba(255,255,255,.4);margin:0 ' + px(t.dot * 0.6) + ';transition:width 300ms ' + ease + ',background .3s}');
    r.push(H + '__dot.on{width:' + px(t.dot * 3.4) + ';background:#fff}');
    // phones: keep the banner's existing centred layout; only its synopsis has been removed
    r.push(PHONE + H + '__info{left:' + px(t.margin) + '!important;right:' + px(t.margin) + '!important;width:auto!important;text-align:center}' +
      H + '__title .stv-logo{object-position:center bottom;margin:0 auto;max-width:78vw}' +
      H + '__btns{justify-content:center}' +
      H + '__scrim{background:linear-gradient(to top,' + PAGE + ' 0%,' + PAGE + ' 14%,rgba(0,0,0,.78) 34%,rgba(0,0,0,0) 62%),linear-gradient(to bottom,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 16%)}' +
      H + '__dots{bottom:' + px(10) + '}' +
      '}');
    return r.join('\n');
  }
  // ---- menus, dropdowns, settings (one glass panel style); plain buttons; Feed
  function cssPanels(c) {
    var t = c.t, B = c.B, glass = c.glass, ease = c.ease, tv = c.tv, hH = c.hH, r = [];
    var panelBg = L ? 'rgba(30,30,34,.97)' : 'rgba(30,30,34,.72)';
    var panelBlur = L ? '' : '-webkit-backdrop-filter:blur(40px) saturate(180%);backdrop-filter:blur(40px) saturate(180%);';
    var PN = B + ' .selectbox__content,' + B + ' .settings__content';
    r.push(PN + '{background:' + panelBg + ';' + panelBlur + 'border-radius:' + px(t.panelR) + ' 0 0 ' + px(t.panelR) + ';' + (L ? '' : 'box-shadow:-24px 0 60px rgba(0,0,0,.45),inset 1px 0 0 rgba(255,255,255,.08);') + '}');
    r.push(B + ' .selectbox__layer,' + B + ' .settings__layer{background:rgba(0,0,0,.45)}');
    r.push(B + ' .selectbox__head,' + B + ' .settings__head{padding:' + tp(36, 22) + ' ' + tp(40, 24) + ' ' + tp(16, 10) + '}');
    r.push(B + ' .selectbox__title,' + B + ' .settings__title{font-size:' + tp(38, 22) + ';font-weight:700;letter-spacing:-.01em}');
    var RW = B + ' .selectbox-item,' + B + ' .settings-folder,' + B + ' .settings-param';
    r.push(RW + '{margin:0 ' + tp(20, 12) + ' ' + tp(6, 3) + ';padding:' + tp(18, 11) + ' ' + tp(24, 14) + ';border-radius:' + px(t.rowR) + ';transition:transform ' + t.dur + 'ms ' + ease + ',background-color .15s}');
    r.push(B + ' .selectbox-item__title,' + B + ' .settings-folder__name,' + B + ' .settings-param__name{font-size:' + tp(29, 16) + ';font-weight:500;line-height:1.25}');
    r.push(B + ' .selectbox-item__subtitle,' + B + ' .settings-param__value,' + B + ' .settings-param__descr{font-size:' + tp(22, 13) + ';color:rgba(235,235,245,.6);opacity:1}');
    r.push(B + ' .settings-param__value{margin-top:.2em}');
    r.push(B + ' .settings-param-title{padding:' + tp(26, 16) + ' ' + tp(44, 26) + ' ' + tp(8, 5) + '}');
    r.push(B + ' .settings-param-title > span{font-size:' + tp(21, 12) + ';font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:rgba(235,235,245,.5)}');
    var FO = B + ' .selectbox-item.focus,' + B + ' .settings-folder.focus,' + B + ' .settings-param.focus';
    r.push(FO + '{background:#fff;color:#000' + (tv ? ';transform:scale(1.02)' : '') + '}');
    r.push(B + ' .selectbox-item.focus .selectbox-item__subtitle,' + B + ' .settings-param.focus .settings-param__value,' + B + ' .settings-param.focus .settings-param__descr{color:rgba(0,0,0,.6)}');
    // icons dark on the white focus: Lampa's own are drawn white and inverted; the plugins' draw in
    // currentColor, which the focus turns black — inverted again to white on white. White under the invert
    // makes both black. A menu's checkbox (drawn white) inverted too (as Lampa's glass style does both)
    var FI = ['settings-folder', 'settings-param', 'selectbox-item'].map(function (x) { return B + ' .' + x + '.focus .settings-folder__icon'; }).join(',');
    r.push(FI + '{color:#fff;-webkit-filter:invert(1);filter:invert(1)}');
    r.push(B + ' .selectbox-item.focus .selectbox-item__checkbox{-webkit-filter:invert(1);filter:invert(1)}');
    r.push(B + ' .selectbox-item.selected:not(.nomark)::after,' + B + ' .selectbox-item.picked::after{border-color:currentColor}');
    if (!tv) r.push(RW.split(',').map(function (x) { return x + ':active'; }).join(',') + '{background:rgba(255,255,255,.12)}');
    // the menu: a floating glass panel, the focused item a white capsule
    r.push(B + ' .wrap__left{background:none}');
    // Lampa gives the menu the column's full width: with our side margins it was wider than its column (iPad: a sideways scroll)
    r.push(B + ' .wrap__left .menu{width:auto!important}' + B + ' .wrap__left .scroll{overflow-x:hidden}');
    r.push(B + ' .wrap__left .menu{margin:' + tp(24, 14) + ' ' + tp(14, 10) + ';padding:' + tp(14, 8) + ' ' + tp(10, 6) + ';border-radius:' + px(t.panelR) + ';background:' + panelBg + ';' + panelBlur + '}');
    r.push(B + ' .menu__item{border-radius:' + px(40) + ';padding:' + tp(14, 9) + ' ' + tp(22, 14) + ';font-weight:500}');
    r.push(B + ' .menu__text{font-size:' + tp(27, 15) + '}');
    r.push(B + ' .menu__split{opacity:.25;margin:' + px(8) + ' ' + px(18) + '}');

    // a section page loads its next rows when scrolled to the end: wide rows are low, the first ones can
    // fit the phone's screen whole, with nothing to scroll and so no more rows ever (a dead page)
    // (Lampa measures the rows' body against the window: the body gets taller than the screen)
    r.push(B + '.stv-at-cat .activity--active .scroll:not(.scroll--horizontal) > .scroll__content > .scroll__body{min-height:' + (hH + 80) + 'px;min-height:calc(100vh + 80px)}');
    // Lampa's plain buttons (Feed «Смотреть», empty pages «Обновить», …): a capsule like the card's buttons
    r.push(B + ' .simple-button{display:inline-block;height:' + px(t.btnH) + ';line-height:' + px(t.btnH) + ';padding:0 ' + px(t.btnPad) + ';border-radius:' + px(t.btnH) + ';' +
      'background:rgba(255,255,255,.16);color:#fff;font-size:' + px(t.btnFont) + ';font-weight:600}');
    r.push(B + ' .simple-button.focus{background:#fff;color:#000}');
    if (!tv) r.push(B + ' .simple-button:active{background:rgba(255,255,255,.3)}');
    // Feed: the episode's art and poster rounded like the cards
    r.push(B + ' .feed-item img{border-radius:' + px(t.cardR) + '}');
    return r.join('\n');
  }
  // ---- search
  function cssSearch(c) {
    var t = c.t, B = c.B, tv = c.tv, glass = c.glass, MOVE = c.MOVE, r = [];
    // Apple (iOS / tvOS 26): the field is a glass capsule with a magnifier; recent searches are glass
    // capsules; the sources one segmented control (the chosen one white). Lampa's layout stays:
    // the field is .search__input on TVs (with Lampa's on-screen keyboard), the input of its keyboard
    // on touch screens; on TVs with voice input the mic is a round key before the field
    var MAG = 'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23ebebf5%27 stroke-opacity=%27.6%27 stroke-width=%272.4%27 stroke-linecap=%27round%27><circle cx=%2710.5%27 cy=%2710.5%27 r=%276.5%27/><path d=%27M15.5 15.5 21 21%27/></svg>")';
    var FH = tp(74, 46), IC = tp(30, 20), PL = tp(70, 44);
    var FIELD = 'height:' + FH + ';line-height:' + FH + ';border-radius:' + px(60) + ';' + glass + 'color:#fff;border:0;outline:0;box-sizing:border-box;' +
      'background-image:' + MAG + ';background-repeat:no-repeat;background-position:' + tp(26, 16) + ' 50%;background-size:' + IC + ' ' + IC + ';padding:0 ' + tp(28, 18) + ' 0 ' + PL;
    r.push(B + ' .search__input{' + FIELD + ';font-size:' + tp(34, 18) + ';font-weight:600;margin:0 ' + px(t.margin) + ' ' + tp(18, 12) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis}');
    r.push(B + ' .simple-keyboard-input{' + FIELD + ';font-size:' + tp(30, 17) + ';font-weight:500;width:100%;-webkit-appearance:none;appearance:none}');
    // (Lampa pads and rounds its input with stronger rules: the capsule and the room for the magnifier must win)
    r.push(B + ' .search__keypad .simple-keyboard-input{padding-left:' + PL + '!important;border-radius:' + px(60) + '!important}');
    r.push(B + ' .simple-keyboard-input::placeholder{color:rgba(235,235,245,.5)}');
    r.push(B + ' .simple-keyboard-input.focus,' + B + ' .simple-keyboard-input:focus{box-shadow:0 0 0 ' + px(2) + ' rgba(255,255,255,.75)}');
    // voice input: the mic inside the capsule's right end
    r.push(B + ' .simple-keyboard--with-mic{display:flex;align-items:center}');
    r.push(B + ' .simple-keyboard--with-mic .simple-keyboard-input{padding-right:' + tp(90, 60) + '}');
    r.push(B + ' .simple-keyboard-mic{order:2;position:relative;z-index:1;width:' + tp(58, 36) + ';height:' + tp(58, 36) + ';margin:0 0 0 -' + tp(72, 46) + ';border-radius:50%;background:rgba(255,255,255,.12);color:#fff}');
    r.push(B + ' .simple-keyboard-mic.focus{background:#fff;color:#000}');
    r.push(B + ' .simple-keyboard-mic.record{background:#ff453a;color:#fff}');
    // Lampa's on-screen keyboard (TVs): its keys and sizes, rounder, a white focus
    r.push(B + ' .simple-keyboard .hg-button{border-radius:' + tp(12, 8) + '}');
    r.push(B + ' .simple-keyboard .hg-button.focus{background:#fff;color:#000}');
    // the keys with icons (mic, language, symbols): the icon dark on the white focus
    r.push(B + ' .simple-keyboard .hg-button.focus svg{color:#000;fill:currentColor}');
    r.push(B + ' .simple-keyboard .hg-button.focus img,' + B + ' .simple-keyboard .hg-button.focus:after{-webkit-filter:invert(1);filter:invert(1)}');   // (Lampa draws some as an :after picture)
    // recent searches: glass capsules as high and as large as the sources (Lampa makes them .8em on phones)
    r.push(B + ' .search-history-key{border-radius:' + px(40) + ';' + glass + 'padding:0 ' + tp(18, 12) + ';font-size:1em;' + MOVE + '}');
    r.push(B + ' .search-history-key > div{font-size:1.3em;padding:' + tp(8, 5) + ' .1em}');
    r.push(B + ' .search-history-key:before{opacity:.6}');
    r.push(B + ' .search-history-key.focus{background:#fff;color:#000}');
    r.push(B + ' .search-history-key.focus:before{-webkit-filter:invert(1);filter:invert(1);opacity:.8}');
    // the sources: one segmented control
    r.push(B + ' .search__sources .scroll__body{display:inline-flex!important;width:auto!important;padding:' + px(4) + ';border-radius:' + px(40) + ';' + glass + '}');
    r.push(B + ' .search-source{border-radius:' + px(40) + ';background:none;padding:' + tp(8, 5) + ' ' + tp(20, 14) + ';margin:0;font-weight:600;color:rgba(235,235,245,.75)}');
    r.push(B + ' .search-source.active{background:#fff;color:#000}');
    r.push(B + ' .search-source.focus{background:rgba(255,255,255,' + (tv ? '.3' : '.2') + ');color:#fff}');
    r.push(B + ' .search-source.active.focus{background:#fff;color:#000;box-shadow:0 0 0 ' + px(2) + ' rgba(255,255,255,.5)}');
    if (!tv) r.push(B + ' .search-source:active,' + B + ' .search-history-key:active{transform:scale(.96)}');
    return r.join('\n');
  }

  // ---- poster cards (catalogs, grids, search): Apple corners, quiet captions; People tiles
  function cssPosters(c) {
    var t = c.t, B = c.B, ease = c.ease, tv = c.tv, MOVE = c.MOVE, r = [];
    var PC = B + ' .card:not(.card--wide)';
    r.push(PC + ' .card__view{border-radius:' + px(t.cardR) + ';background:rgba(255,255,255,.07)}');
    // grids (Releases, History, Favourites, «See all», catalogs) as Home's rows: the same side margin and
    // gap, Apple's «See All» columns (phones 3, iPad 6, TVs 7) — a poster as wide as in a row
    // (Lampa's grid: 1em at the sides, .5em around each cell, its own columns by screen width)
    var GR = B + ' .mapping--grid', g2 = px(t.gutter / 2);
    r.push(GR + '{padding:0 ' + px(t.margin - t.gutter / 2) + '}');
    r.push(GR + ' > *{width:' + (100 / cols()).toFixed(4) + '%;padding:0 ' + g2 + ' ' + px(t.gutter) + ';box-sizing:border-box}');
    r.push(PHONE + GR + ' > *{width:' + (100 / phoneCols()).toFixed(4) + '%}}');
    r.push(PC + ' .card__img{border-radius:' + px(t.cardR) + '}');
    r.push(B + ' .card .card__view::after{display:none!important}');
    // Apple's posters: the art only (the title is printed on it); badges: UA and «new episode»
    r.push(PC + ' .card__view{margin-bottom:0}');
    r.push(PC + ' .card__age,' + PC + ' .card__vote,' + PC + ' .card__icons,' + PC + ' .card__marker,' + PC + ' .card-watched{display:none!important}');
    r.push(PC + ' .snack-ua{right:auto;left:' + tp(10, 6) + ';top:' + tp(10, 6) + ';font-size:' + tp(17, 10) + '}');
    // the title: tvOS shows it under the focused poster only (HIG: hidden until focus); touch screens have no
    // focus: there it shows while the finger is on the poster (the poster sinks a little, like the wide cards);
    // the «always» option shows every title
    r.push(PC + ' .card__title{position:absolute;left:0;right:0;top:100%;margin-top:' + tp(12, 7) + ';font-size:' + px(t.cap) + ';font-weight:600;line-height:1.25;' +
      'text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-height:none;' + (tv ? 'display:block;opacity:0;transition:opacity .15s}' : 'display:none}'));
    r.push(PC + (tv ? '.focus' : '.stv-on') + ' .card__title,' + B + '.stv-titles .card:not(.card--wide) .card__title{display:block;opacity:1}');
    if (!tv) r.push(PC + '.stv-press .card__view{transform:scale(.96)}' + PC + ' .card__view{' + MOVE + '}');
    // grids: room under each poster for the title (a grid cell has Lampa's own bottom padding: the title sits
    // in it, just under the poster); rows: room under the posters with «always»
    var GC = [B + ' .mapping--grid > .card:not(.card--wide)', B + ' .category-full .card:not(.card--wide)'], GP = tv ? 66 : 40;
    r.push(GC.join(',') + '{padding-bottom:' + px(GP) + '!important}');
    r.push(GC.map(function (x) { return x + ' .card__title'; }).join(',') + '{top:auto;bottom:' + px(GP - (tv ? 12 : 7) - Math.round(t.cap * 1.25)) + ';margin-top:0;left:.5em;right:.5em}');
    if (tv) r.push(B + '.stv-titles .items-line .card:not(.card--wide){margin-bottom:' + px(Math.round(t.cap * 1.25) + 14) + '}');
    r.push(PC + '{transition:transform ' + t.dur + 'ms ' + ease + '}');
    if (tv) {
      r.push(PC + '.focus{transform:scale(1.07);z-index:2}');
      r.push(PC + '.focus .card__view{box-shadow:0 0 0 ' + px(3) + ' rgba(255,255,255,.8)' + (L ? '' : ',0 22px 44px rgba(0,0,0,.55)') + '}');
    }
    r.push(B + ' .card-more__box{border-radius:' + px(t.cardR) + ';background:rgba(118,118,128,.2)}');
    // People: round portraits in a grid (phones 3, iPad 6, TVs 8 a row), the name and «known for» under them
    var PP = B + ' .stv-people .mapping--grid > .card';
    r.push(B + ' .stv-people .mapping--grid > *{width:' + (tv ? '12.5%' : '16.666%') + '}');
    r.push(PHONE + B + ' .stv-people .mapping--grid > *{width:33.333%}}');
    r.push(PP + '{padding-bottom:' + tp(30, 18) + '!important;text-align:center}');
    r.push(PP + ' .card__view{padding-bottom:100%;border-radius:50%;overflow:hidden;background:rgba(255,255,255,.08);' + MOVE + '}');
    r.push(PP + ' .card__img{border-radius:50%;object-position:50% 20%}');
    r.push(PP + ' .card__title{display:block!important;position:static;opacity:1;margin-top:' + tp(14, 8) + ';font-size:' + px(t.cap + 2) + ';font-weight:600;line-height:1.25;' +
      'text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-height:none;left:auto;right:auto;top:auto;bottom:auto}');
    r.push(PP + ' .stv-known{font-size:' + px(t.cap2) + ';line-height:1.3;color:rgba(235,235,245,.55);margin-top:.2em;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}');
    if (tv) {
      r.push(PP + '.focus{transform:none}');
      r.push(PP + '.focus .card__view{transform:scale(1.07);box-shadow:0 0 0 ' + px(3) + ' #fff' + (L ? '' : ',0 18px 36px rgba(0,0,0,.5)') + '}');
    } else r.push(PP + ':active .card__view{transform:scale(.95)}');
    // People: the person's tile — a round portrait over «All titles», no grey box
    var PT = B + '.stv-at-person .card-more--first .card-more__box';
    r.push(PT + '{background:none;display:flex;flex-direction:column;align-items:center;justify-content:center}');
    r.push(PT + ' .stv-pphoto{width:86%;padding-top:86%;border-radius:50%;background:rgba(255,255,255,.1) center 20%/cover no-repeat;margin-bottom:' + tp(16, 10) + ';transition:transform ' + t.dur + 'ms ' + ease + '}');
    r.push(PT + ' .card-more__title{position:static;transform:none;font-size:' + px(t.sub) + ';font-weight:600;color:rgba(235,235,245,.7);text-align:center}');
    r.push(PT + ' .card-more__title:after{content:" \u203A"}');
    if (tv) {
      var PF = B + '.stv-at-person .card-more--first.focus';
      r.push(PF + ' .card-more__box{background:none;color:#fff;border:0;box-shadow:none}');
      r.push(PF + ' .card-more__box:after,' + PF + ':after{display:none}');
      r.push(PT + ' .stv-pphoto{margin-bottom:' + px(26) + '}');
      r.push(PF + ' .card-more__box .stv-pphoto{transform:scale(1.07);box-shadow:0 0 0 ' + px(3) + ' #fff}');
    }
    if (!tv) r.push(PT.replace(' .card-more__box', ':active .stv-pphoto') + '{transform:scale(.96)}');
    if (tv) r.push(B + ' .card-more.focus .card-more__box{background:#fff;color:#000}');
    return r.join('\n');
  }
  // ---- bars: iPad's tab capsule at the top, the TV header while scrolled
  // ---- the person page: Apple's header (a blurred band, the round portrait, the name, the biography)
  function cssPerson(c) {
    var t = c.t, B = c.B, tv = c.tv, glass = c.glass, PAGE = c.PAGE, r = [];
    var P = B + ' .stv-person .stv-pstart', D = tv ? 230 : 170;
    // the header sits in a row of Lampa's (its side padding, a rounded box): the band goes edge to edge
    r.push(B + ' .stv-person .items-line:first-child .scroll--horizontal .scroll__content{padding:0}');
    r.push(B + ' .stv-person .items-line:first-child .scroll__body{display:block;width:100%}');
    r.push(P + '{position:relative;width:100%;box-sizing:border-box;padding:' + tp(120, 76) + ' ' + px(t.margin) + ' ' + tp(36, 24) + ';margin:0;' +
      'border-radius:0;background:none;overflow:hidden}');
    // the band: the portrait blurred across the width, fading into the page
    r.push(P + ' .stv-pband{position:absolute;left:0;right:0;top:0;height:100%;z-index:0;background-size:cover;background-position:50% 30%;' +
      (L ? 'opacity:.35' : '-webkit-filter:blur(' + px(40) + ') saturate(1.6) brightness(.6);filter:blur(' + px(40) + ') saturate(1.6) brightness(.6);transform:scale(1.2)') + '}');
    r.push(P + ':after{content:"";position:absolute;left:0;right:0;bottom:0;height:45%;z-index:0;background:linear-gradient(to bottom,rgba(0,0,0,0),' + PAGE + ')}');
    r.push(P + ' .person-start__body{position:relative;z-index:1;display:flex;align-items:center;padding:0;margin:0}');
    r.push(P + ' .person-start__right{flex:0 0 auto;width:auto;margin:0 ' + tp(48, 32) + ' 0 0;padding:0}');
    r.push(P + ' .person-start__poster{width:' + px(D) + ';height:' + px(D) + ';padding:0;border-radius:50%;overflow:hidden;box-shadow:0 ' + px(10) + ' ' + px(24) + ' rgba(0,0,0,.35)}');
    r.push(P + ' .person-start__poster:before{display:none}');
    r.push(P + ' .person-start__img{position:static;width:100%;height:100%;object-fit:cover;object-position:50% 20%;border-radius:50%}');
    r.push(P + ' .person-start__left{flex:1 1 auto;min-width:0;padding:0;max-width:' + px(t.descW + 200) + '}');
    r.push(P + ' .person-start__tags,' + P + ' .person-start__place,' + P + ' .person-start__descr-mobile{display:none}');
    r.push(P + ' .person-start__name{font-size:' + tp(56, 34) + ';font-weight:700;line-height:1.15;letter-spacing:-.01em;margin:0 0 ' + tp(14, 10) + '}');
    r.push(P + ' .stv-pbio{font-size:' + px(t.sub) + ';line-height:1.4;color:rgba(235,235,245,.85);max-width:none;margin-bottom:' + tp(20, 14) + '}');
    r.push(P + ' .stv-pbio .stv-desc__text{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden;white-space:normal}');
    r.push(P + ' .stv-pbio.open .stv-desc__text{-webkit-line-clamp:unset;display:block}');
    r.push(P + ' .stv-pbio .stv-desc__more{display:inline-block;margin-top:.3em;font-weight:700;color:#fff;text-transform:uppercase;font-size:.8em;letter-spacing:.04em}');
    r.push(P + ' .stv-pbio:not(.long) .stv-desc__more{display:none}');
    r.push(P + ' .person-start__bottom{margin:0;display:flex;align-items:center}');
    r.push(P + ' .person-start__bottom .full-start__button{height:' + px(t.btnH * 0.8) + ';border-radius:' + px(t.btnH) + ';padding:0 ' + px(t.btnPad * 0.7) + ';margin:0 ' + px(12) + ' 0 0;' + glass + 'color:#fff;font-size:' + px(t.btnFont * 0.85) + '}');
    r.push(P + ' .person-start__bottom .full-start__button.focus{background:#fff;color:#000}');
    // the info button: the biography is on the page already
    r.push(P + ' .person-start__bottom .button--info{display:none}');
    // phones: one column, centred (as Apple's)
    r.push(PHONE + P + ' .person-start__body{flex-direction:column;text-align:center}' + P + ' .person-start__right{margin:0 0 ' + px(16) + '}' +
      P + ' .person-start__bottom{justify-content:center}' + P + ' .stv-pbio{text-align:left}}');
    return r.join('\n');
  }
  // ---- the schedule: a title, days with a grid of episode cards; or an empty state that says how to fill it
  function cssSchedule(c) {
    var t = c.t, B = c.B, tv = c.tv, glass = c.glass, S = B + ' .stv-tt', g = px(t.gutter), r = [];
    r.push(S + '__body{padding:' + tp(30, 12) + ' ' + px(t.margin) + ' ' + tp(80, 48) + '}');
    r.push(S + '__title{font-size:' + tp(56, 34) + ';font-weight:700;letter-spacing:-.01em;line-height:1.15}');
    r.push(S + '__sub{font-size:' + px(t.sub) + ';color:rgba(235,235,245,.6);margin-top:' + px(6) + '}');
    r.push(S + '__day{font-size:' + px(t.title) + ';font-weight:' + t.titleW + ';margin:' + tp(50, 30) + ' 0 ' + tp(20, 12) + '}');
    r.push(S + '__day span{font-weight:400;color:rgba(235,235,245,.55);margin-left:.5em}');
    // Apple's «See All» of episodes: 4 across on TVs, 3 on iPad, 1 on phones
    r.push(S + '__grid{display:flex;flex-wrap:wrap;margin-right:-' + g + '}');
    r.push(S + '__grid .stv-ep{width:calc(' + (tv ? 25 : 33.3333) + '% - ' + g + ');margin:0 ' + g + ' ' + g + ' 0}');
    r.push(PHONE + S + '__grid .stv-ep{width:calc(100% - ' + g + ')}}');
    // empty: an icon, what the page is for, how to fill it
    r.push(S + '__empty{display:flex;flex-direction:column;align-items:center;text-align:center;max-width:' + tp(900, 520) + ';margin:' + tp(110, 64) + ' auto 0}');
    r.push(S + '__icon{width:' + tp(96, 64) + ';height:' + tp(96, 64) + ';color:rgba(235,235,245,.45);margin-bottom:' + tp(24, 16) + '}');
    r.push(S + '__icon svg{width:100%;height:100%}');
    r.push(S + '__etitle{font-size:' + tp(38, 22) + ';font-weight:700;margin-bottom:' + tp(14, 8) + '}');
    r.push(S + '__etext{font-size:' + px(t.sub) + ';line-height:1.45;color:rgba(235,235,245,.65)}');
    r.push(S + '__btn{display:inline-flex;align-items:center;height:' + px(t.btnH * 0.8) + ';padding:0 ' + px(t.btnPad * 0.8) + ';margin-top:' + tp(32, 22) + ';border-radius:' + px(t.btnH) + ';' +
      glass + 'color:#fff;font-size:' + px(t.btnFont * 0.85) + ';font-weight:600;cursor:pointer}');
    r.push(S + '__btn.focus{background:#fff;color:#000}');
    if (!tv) r.push(S + '__btn:active{transform:scale(.97)}');
    return r.join('\n');
  }
  // ---- Lampa's «Торренты» page: a header strip (poster, title, year), the filter as chips, the releases
  // as Apple's list rows (see torRow)
  function cssTorrents(c) {
    var t = c.t, B = c.B, glass = c.glass, tv = c.tv, MOVE = c.MOVE, r = [];
    var P = B + ' .stv-torp', X = P + ' .explorer', M = px(t.margin), FADE = ',background-color .15s,color .15s';
    // one column: the strip, the chips, the list
    r.push(X + '{display:flex;flex-direction:column;height:100%}');
    r.push(X + '__left{display:block!important;width:auto!important;flex:none;padding:0 ' + M + '}');
    r.push(X + '__left > .scroll{height:auto!important}');
    r.push(X + '__left .scroll__content{padding:0!important}');
    r.push(X + '__files{flex:1;width:auto!important;min-width:0;padding:0}');
    r.push(X + '-card{position:relative;display:flex;flex-direction:column;min-height:' + tp(150, 96) + ';padding:' + tp(110, 80) + ' 0 ' + tp(20, 14) + ' ' + tp(124, 80) + '}');
    r.push(X + '-card__head{order:2;display:block;margin:0}');
    r.push(X + '-card__body{order:1;margin:0;padding:0}');
    r.push(X + '-card__head-left{position:absolute;left:0;bottom:' + tp(20, 14) + ';margin:0}');
    r.push(X + '-card__head-img{width:' + tp(100, 64) + ';height:' + tp(150, 96) + ';border-radius:' + px(t.cardR * 0.6) + ';overflow:hidden;margin:0}');
    r.push(X + '-card__head-img img{width:100%;height:100%;object-fit:cover;border-radius:0}');
    r.push(X + '-card__head-body{display:flex;align-items:center;flex-wrap:wrap;font-size:' + px(t.sub) + ';color:rgba(235,235,245,.7);margin:' + tp(6, 4) + ' 0 0;padding:0}');
    r.push(X + '-card__head-body > div{margin:0 ' + tp(14, 10) + ' 0 0;padding:0;font-size:1em}');
    r.push(X + '-card__head-rate{display:flex;align-items:center}' + X + '-card__head-rate svg{width:.9em;height:.9em;margin-right:.25em}');
    r.push(X + '-card__head-age{border:1px solid rgba(255,255,255,.5);border-radius:.25em;padding:0 .3em!important;font-size:.85em!important;line-height:1.35}');
    r.push(X + '-card__title{font-size:' + tp(48, 28) + ';font-weight:700;letter-spacing:-.01em;line-height:1.1;margin:0;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;overflow:hidden}');
    r.push(X + '-card__genres,' + X + '-card__descr{display:none}');
    // the chips: search, sort, filter, 4K / 1080p / UKR
    r.push(X + '__files-head{padding:0 0 ' + tp(10, 6) + '}');
    r.push(X + '__files-body .scroll__content{padding-top:' + tp(10, 6) + '!important}');
    // no fade at the list's top edge (Lampa's scroll mask): the first row in focus looked grey there
    r.push(X + '__files-body .scroll--mask{-webkit-mask-image:none;mask-image:none}');
    r.push(X + '__files-head .scroll__body{padding:' + tp(12, 6) + ' ' + M + '}');
    r.push(P + ' .torrent-filter{display:flex;align-items:center;margin:0;padding:0}');
    r.push(P + ' .torrent-filter .simple-button{display:inline-flex;align-items:center;height:' + tp(52, 34) + ';padding:0 ' + tp(26, 16) + ';margin:0 ' + tp(16, 10) + ' 0 0;' +
      'border-radius:' + px(40) + ';font-size:' + tp(25, 15) + ';font-weight:500;color:#fff;white-space:nowrap;flex-shrink:0;border:0;' + glass + MOVE + FADE + '}');
    // (Lampa's glass style paints its buttons with !important)
    r.push(P + ' .torrent-filter .simple-button{background-color:' + c.G + '!important}');
    r.push(P + ' .torrent-filter .simple-button > span{color:#fff;margin:0}');
    r.push(P + ' .torrent-filter .simple-button > div{background:none!important;border:0;padding:0;margin:0 0 0 .4em;font-size:1em;color:rgba(235,235,245,.6);max-width:' + tp(320, 200) + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap}');
    r.push(P + ' .torrent-filter .simple-button > div.hide{display:none}');
    r.push(P + ' .torrent-filter .simple-button > svg{width:1em;height:1em;flex-shrink:0}');
    r.push(P + ' .torrent-filter .filter--back,' + P + ' .torrent-filter .filter--search:not(.stv-has-q){width:' + tp(52, 34) + ';padding:0;justify-content:center}');
    r.push(P + ' .torrent-filter .filter--search:not(.stv-has-q) > div{display:none}');
    r.push(P + ' .torrent-filter .filter--back svg{width:.8em;height:.8em}');
    r.push(P + ' .torrent-filter .simple-button.stv-tq--on{background-color:#fff!important;color:#000;font-weight:600;box-shadow:none}');
    if (tv) r.push(P + ' .torrent-filter .simple-button.focus{background-color:#fff!important;color:#000;transform:scale(1.08);box-shadow:' + (L ? 'none' : '0 10px 24px rgba(0,0,0,.45)') + '}' +
      P + ' .torrent-filter .simple-button.focus > span,' + P + ' .torrent-filter .simple-button.focus > div{color:#000}' + P + ' .torrent-filter .simple-button.stv-tq--on:not(.focus){background-color:rgba(255,255,255,.85)!important}');
    else r.push(P + ' .torrent-filter .simple-button.focus{box-shadow:none}' + P + ' .torrent-filter .simple-button:active{transform:scale(.95)}');
    // the list
    r.push(P + ' .torrent-list{padding:' + tp(8, 4) + ' ' + M + ' ' + tp(60, 40) + '}');
    var ROW = 'margin:0 0 ' + tp(14, 10) + ';padding:' + tp(22, 14) + ' ' + tp(28, 18) + ';border-radius:' + px(t.rowR) + ';background:rgba(255,255,255,.07);border:0;' + MOVE + FADE;
    r.push(P + ' .watched-history{display:flex;align-items:center;' + ROW + ';font-size:' + tp(24, 15) + ';color:rgba(235,235,245,.7)}');
    r.push(P + ' .watched-history__icon{width:' + tp(30, 20) + ';height:' + tp(30, 20) + ';margin-right:' + tp(16, 10) + ';opacity:.7}' + P + ' .watched-history__icon svg{width:100%;height:100%}');
    r.push(P + ' .torrent-item{position:relative;' + ROW + '}');
    r.push(P + ' .torrent-item.stv-tor-on > .torrent-item__title,' + P + ' .torrent-item.stv-tor-on > .torrent-item__ffprobe,' + P + ' .torrent-item.stv-tor-on > .torrent-item__details{display:none}');
    r.push(B + ' .stv-tor{display:flex;align-items:center}');
    r.push(B + ' .stv-tor__l{flex:1;min-width:0}');
    r.push(B + ' .stv-tor__top{display:flex;align-items:center;min-width:0}');
    r.push(B + ' .stv-tor__q{flex-shrink:0;display:inline-block;border:1px solid rgba(255,255,255,.6);border-radius:.3em;padding:0 .35em;margin-right:.45em;font-size:' + px(t.cap2) + ';font-weight:700;line-height:1.5;letter-spacing:.02em}');
    r.push(B + ' .stv-tor__q--hi{background:#fff;color:#000;border-color:#fff}');
    r.push(B + ' .stv-tor__name{font-size:' + tp(28, 16) + ';font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}');
    r.push(B + ' .stv-tor__sub{font-size:' + tp(23, 14) + ';color:rgba(235,235,245,.72);margin-top:' + tp(6, 4) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis}');
    r.push(B + ' .stv-tor__meta{font-size:' + px(t.cap2) + ';color:rgba(235,235,245,.5);margin-top:' + tp(4, 3) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis}');
    r.push(B + ' .stv-tor__r{flex-shrink:0;text-align:right;margin-left:' + tp(28, 16) + '}');
    r.push(B + ' .stv-tor__size{font-size:' + tp(28, 16) + ';font-weight:600;white-space:nowrap}');
    r.push(B + ' .stv-tor__seeds{font-size:' + tp(23, 14) + ';font-weight:600;color:#30d158;margin-top:' + tp(6, 4) + ';white-space:nowrap}');
    r.push(B + ' .stv-tor__seeds--none{color:rgba(235,235,245,.4)}');
    r.push(P + ' .stv-tor__top .torrent-item__viewed{position:static;flex-shrink:0;display:inline-block;vertical-align:middle;margin-left:.4em;width:' + tp(26, 18) + ';height:' + tp(26, 18) + ';opacity:.8}');
    // a mark Lampa adds later (after a play, or «mark» in the long-press menu) goes into the top line
    // (torViewed); until then, or without a MutationObserver: small in the row's corner, not a line of its own
    r.push(P + ' .torrent-item.stv-tor-on > .torrent-item__viewed{position:absolute;left:' + tp(8, 5) + ';top:' + tp(8, 5) + ';width:' + tp(18, 13) + ';height:' + tp(18, 13) + ';margin:0;opacity:.8}');
    if (tv) {
      r.push(P + ' .torrent-item.focus,' + P + ' .watched-history.focus{background:#fff!important;background-image:none!important;color:#000;transform:scale(1.02);box-shadow:' + (L ? 'none' : '0 14px 30px rgba(0,0,0,.5)') + '}');
      r.push(P + ' .torrent-item.focus .stv-tor__sub,' + P + ' .torrent-item.focus .stv-tor__meta,' + P + ' .watched-history.focus{color:rgba(0,0,0,.65)}');
      r.push(P + ' .torrent-item.focus .stv-tor__q{border-color:rgba(0,0,0,.6)}' + P + ' .torrent-item.focus .stv-tor__q--hi{background:#000;color:#fff;border-color:#000}');
      r.push(P + ' .torrent-item.focus .stv-tor__seeds{color:#1a7f37}' + P + ' .torrent-item.focus .stv-tor__seeds--none{color:rgba(0,0,0,.4)}');
      r.push(P + ' .torrent-item.focus:after,' + P + ' .torrent-item.focus:before,' + P + ' .watched-history.focus:after,' + P + ' .watched-history.focus:before{display:none}');
    } else {
      r.push(P + ' .torrent-item.focus,' + P + ' .watched-history.focus{background:rgba(255,255,255,.07);box-shadow:none}');
      r.push(P + ' .torrent-item:active,' + P + ' .watched-history:active{transform:scale(.98);background:rgba(255,255,255,.12)}');
    }
    // the files of a release (Lampa's window after a tap): the same rows
    r.push(B + ' .torrent-file,' + B + ' .torrent-serial{' + ROW + '}');
    r.push(B + ' .torrent-file__title,' + B + ' .torrent-serial__title{font-size:' + tp(26, 15) + ';font-weight:600}');
    r.push(B + ' .torrent-file__size,' + B + ' .torrent-serial__size,' + B + ' .torrent-serial__line{font-size:' + tp(22, 13) + ';color:rgba(235,235,245,.6)}');
    r.push(B + ' .torrent-serial__img{border-radius:' + px(t.cardR * 0.6) + '}');
    if (tv) r.push(B + ' .torrent-file.focus,' + B + ' .torrent-serial.focus{background:#fff;color:#000}' + B + ' .torrent-file.focus .torrent-file__size,' + B + ' .torrent-serial.focus .torrent-serial__size,' + B + ' .torrent-serial.focus .torrent-serial__line{color:rgba(0,0,0,.6)}');
    return r.join('\n');
  }
  function cssBars(c) {
    var B = c.B, glass = c.glass, tv = c.tv, r = [];
    // the profiles button of the server's syncpro plugin draws an emoji (👤): TVs without an emoji
    // font show a box. The same person drawn as an icon instead
    var PERSON = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5z'/%3E%3C/svg%3E\")";
    r.push(B + ' .open--syncpro-profile > span{font-size:0!important;width:' + tp(44, 30) + '!important;height:' + tp(44, 30) + '!important;background-image:' + PERSON + '!important;background-repeat:no-repeat!important;background-position:center!important;background-size:60%!important}');   // (!important: its own inline style; the em size went with the font)
    if (!tv) {
      var NB = B + ' .navigation-bar';
      // 0 wide and 0 high: in landscape Lampa moves its bar to the right edge and takes the bar's width off
      // the page (a bar across the screen left the pages 0 wide: everything gone after turning the phone)
      r.push(NB + ',' + B + '.orientation--landscape .navigation-bar{top:0;bottom:auto;left:50%;right:auto;width:0;min-width:0;height:0;padding:0;border:0;display:block;overflow:visible;z-index:16}');
      // a row in landscape too: Lampa stacks the phone's landscape bar in a column (stronger selector than NB's)
      // on the header's middle line: Lampa centres its menu button and circles in a header 0.5em + 3em +
      // 0.5em high (its middle 2em down); the pill is 36 + 2 × 4 high
      var midTop = 2 * c.t.base - (36 + 2 * 4) / 2;
      r.push(NB + ' .navigation-bar__body,' + B + '.orientation--landscape .navigation-bar .navigation-bar__body{position:absolute;top:' + px(midTop) + ';left:0;width:auto;height:auto;white-space:nowrap;transform:translateX(-50%);flex-direction:row;padding:' + px(4) + ';border-radius:' + px(40) + ';' + glass + '}');
      r.push(NB + ' .navigation-bar__item{display:flex;align-items:center;height:' + px(36) + ';padding:0 ' + px(16) + ';margin:0 ' + px(1) + ';border-radius:' + px(40) + ';color:rgba(235,235,245,.72);cursor:pointer}');
      r.push(NB + ' .navigation-bar__icon{width:' + px(18) + ';height:' + px(18) + ';margin:0}');
      r.push(NB + ' .navigation-bar__label{font-size:' + px(15) + ';font-weight:600;margin:0}');
      r.push(NB + ' .navigation-bar__item[data-action=main] .navigation-bar__icon,' + NB + ' .navigation-bar__item[data-action=settings] .navigation-bar__icon{display:none}');
      r.push(NB + ' .navigation-bar__item[data-action=search] .navigation-bar__label,' + NB + ' .navigation-bar__item[data-action=back] .navigation-bar__label{display:none}');
      r.push(NB + ' .navigation-bar__item[data-action=back]{order:-1;padding:0 ' + px(11) + '}');
      r.push(NB + ' .navigation-bar__item[data-action=search]{order:9;padding:0 ' + px(11) + '}');
      r.push(B + '.stv-at-main:not(.settings--open):not(.search--open) .navigation-bar__item[data-action=main],' + B + '.settings--open .navigation-bar__item[data-action=settings],' + B + '.search--open .navigation-bar__item[data-action=search]{background:rgba(255,255,255,.2);color:#fff}');
      r.push(NB + ' .navigation-bar__item:active{background:rgba(255,255,255,.28)}');
    }
    // TVs: the header's circles step aside while the page is scrolled (Apple keeps the top clear)
    if (tv) r.push(B + '.stv-scrolled .head__actions{opacity:0;transition:opacity .25s}');
    return r.join('\n');
  }

  // ---------- the theme on / off ----------
  var styleEl = null, styleKey = '', started = false;
  function bodyClasses(on) {
    var b = document.body.classList, list = ['stv', 'stv--ipad', 'stv--tv', 'stv--lite', 'stv-react', 'stv-tech', 'stv-shots', 'stv-head', 'stv-noplay', 'stv-titles'];
    list.forEach(function (c) { b.remove(c); });
    if (!on) return;
    b.add('stv'); b.add('stv--' + M);
    if (L) b.add('stv--lite');
    if (!opt(K.react)) b.add('stv-react');
    if (!opt(K.tech)) b.add('stv-tech');
    if (!opt(K.shots)) b.add('stv-shots');
    if (opt(K.head)) b.add('stv-head');
    if (opt(K.titles)) b.add('stv-titles');
    if (noPlay()) b.add('stv-noplay');
    askServer();
  }
  // Lampa's own «Watch» is hidden (unless the viewer wants it) only while Autopilot has a server: without
  // one (stock Lampa) it is the way into the viewer's other online plugins. apBase: Autopilot's answer,
  // null = not known yet (hidden, as with a server: no flash in the usual case), '' = none
  var apBase = null;
  function apHasServer() { return !!window.alc_auto_api && apBase !== ''; }
  function noPlay() { return !opt(K.play) && apHasServer(); }
  function askServer() {
    if (typeof window.alc_auto_server !== 'function') return;   // an older Autopilot: as before
    try {
      window.alc_auto_server(function (b) {
        b = b || '';
        if (b === apBase) return;
        apBase = b;
        if (!themeOn()) return;
        document.body.classList.toggle('stv-noplay', noPlay());
        // the card open now: Lampa's Play comes out of «⋯» (no server) or goes back into it
        try { var a = Lampa.Activity.active(); if (a && a.component === 'full' && a.activity) markButtons(a.activity.render()); } catch (e) {}
      });
    } catch (e) {}
  }
  function measure() {
    M = mode(); L = lite();
    var f = parseFloat(window.getComputedStyle(document.body).fontSize) || T[M].base;
    k = f / T[M].base;
  }
  function themeWanted() { return !!opt(K.on) && !agnative(); }
  function apply() {
    var on = themeWanted();
    measure();
    bodyClasses(on);
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'snack-tv-css'; document.head.appendChild(styleEl); }
    // css() depends on the look, the scale and the screen height only: settings that switch body
    // classes (and resize_end without a size change) leave the sheet as it is
    var key = on ? [M, L, k, window.innerWidth, window.innerHeight, opt(K.poster), BASE].join('|') : '';
    if (key !== styleKey) { styleKey = key; styleEl.textContent = on ? css() : ''; }
    if (!on) document.body.classList.remove('stv-float-head'); else floatHead();
    try { if (Lampa.Layer && Lampa.Layer.update) Lampa.Layer.update(); } catch (e) {}
  }
  function themeOn() { return document.body.classList.contains('stv'); }
  function guard(fn) { return function (e) { try { if (themeOn()) fn(e); } catch (x) { log(x && x.message); } }; }
  // AppleTV AGNative restyles the same places: the two do not mix
  var agnTold = false;
  function agnative() {
    var has = document.body.classList.contains('appletv-agnative-topnav');
    if (has && !agnTold) { agnTold = true; setTimeout(function () { try { Lampa.Noty.show(tr('agn')); } catch (e) {} }, 3000); }
    return has;
  }

  // ================= full card =================
  function metaLine(m, render) {
    var parts = [], serial = kindOf(m) === 'tv';
    parts.push('<span>' + esc(kindLabel(m)) + '</span>');
    (m.genres || []).slice(0, 2).forEach(function (g) { if (g && g.name) parts.push('<span>' + esc(capFirst(g.name)) + '</span>'); });
    var y = yearOf(m); if (y) parts.push('<span>' + esc(y) + '</span>');
    if (serial && m.number_of_seasons) parts.push('<span>' + esc(tr('seasons_n', m.number_of_seasons)) + '</span>');
    else if (!serial && m.runtime) parts.push('<span>' + esc(runtimeText(m.runtime)) + '</span>');
    var pg = render.find('.full-start__pg').first().text().trim();
    if (pg) parts.push('<span><span class="stv-badge">' + esc(pg) + '</span></span>');
    if (hasUa(m)) parts.push('<span class="stv-ua"><span class="stv-badge">UA</span></span>');
    return '<div class="stv-meta">' + parts.join('') + '</div>';
  }
  // ---- the card's buttons, Apple's row: the white capsule (Autopilot's, else Lampa's Play), then round
  // buttons always in this order - Trailer, Favourites, Torrents, Subscribe (the pack's bell; Lampa's
  // CUB one when the bell is not there), «⋯». What is missing is left out. Everything else on the card
  // (Lampa's Play beside Autopilot, reactions, Shots, the CUB subscribe beside the bell, other plugins'
  // buttons) goes into «⋯»: Lampa's own «⋯» list (its «options» event), or ours on a Lampa without it.
  // No labels under the round buttons: TVs show the focused one's name, touch a long press (tipFor)
  var ROW = ['.button--alc-trailer', '.button--book', '.button--alc-torrent'];
  var DOTS = '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="5" cy="12" r="2.2" fill="currentColor"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="19" cy="12" r="2.2" fill="currentColor"/></svg>';
  function markButtons(render) {
    document.body.classList.toggle('stv-noplay', noPlay());
    var box = render.find('.full-start-new__buttons').first();
    if (!box.length) return;
    var all = box.children('.full-start__button');
    all.removeClass('stv-primary stv-more');
    // the remote skips what «⋯» holds (Lampa focuses the first .selector, hidden or not)
    all.each(function () { if (this.stv_unsel) { this.stv_unsel = false; this.classList.add('selector'); } });
    var main = box.children('.button--alc-auto:not(.hide)').first();
    if (!main.length) main = box.children('.button--priority:not(.hide)').first();
    if (!main.length) main = box.children('.button--play:not(.hide)').first();
    main.addClass('stv-primary');
    var sp = main.children('span')[0];
    if (sp && /S\d+E\d+/.test(sp.textContent)) sp.textContent = se(sp.textContent);
    var row = [];
    var add = function (sel) { var x = box.children(sel).not('.hide').not(main)[0]; if (x && row.indexOf(x) < 0) row.push(x); return !!x; };
    if (main.length) row.push(main[0]);
    // Lampa's own Play beside Autopilot's: in «⋯» only while Autopilot has a server and the viewer did
    // not ask for it (the setting); otherwise in the row (the way into the other online plugins)
    if (!noPlay()) add('.button--play');
    ROW.forEach(add);
    if (!add('.button--snack-sub')) add('.button--subscribe');
    var more = moreButton(box);
    row.push(more[0]);
    all = box.children('.full-start__button');
    all.each(function () {
      if (row.indexOf(this) >= 0) return;
      this.classList.add('stv-more');
      if (this.classList.contains('selector')) { this.stv_unsel = true; this.classList.remove('selector'); }
    });
    // the row first, in its order: the order on screen is the order of the remote (moved only when it differs)
    var now = all.get().slice(0, row.length);
    if (now.some(function (x, i) { return x !== row[i]; })) for (var i = row.length - 1; i >= 0; i--) box.prepend(row[i]);
    if (M !== 'tv') row.forEach(function (x) { if (x !== main[0]) tipFor(x); });
    // the moves above are ours: not a reason for the observer (themeFull) to run this again
    if (box[0].stv_obs) box[0].stv_obs.takeRecords();
  }
  // a button's name: its label, else the hidden ones' known names
  function buttonName(el) {
    var t = $(el).children('span').text().trim() || $(el).text().trim() || el.getAttribute('title') || '';
    if (!t && el.classList.contains('button--reaction')) t = tr('h_react');
    if (!t && el.classList.contains('button--stv-more')) t = tr('b_more');
    return t;
  }
  // «⋯»: Lampa's own (its list is built by the «options» event: moreItems adds the hidden buttons), else
  // ours with the same list. The label (TVs show it under the focused button) is ours
  function moreButton(box) {
    var b = box.children('.button--options').first();
    if (!b.length) b = box.children('.button--stv-more').first();
    if (!b.length) b = newMoreButton(box);
    if (!b.children('span').length) b.append('<span></span>');
    b.children('span').text(tr('b_more'));
    return b;
  }
  function newMoreButton(box) {
    var b = $('<div class="full-start__button selector button--stv-more">' + DOTS + '</div>');
    b.on('hover:enter', function () {
      var ctl = Lampa.Controller.enabled().name, items = moreItems(box, ctl);
      if (!items.length) return;
      Lampa.Select.show({ title: tr('b_more'), items: items,
        onSelect: function () { Lampa.Controller.toggle(ctl); },
        onBack: function () { Lampa.Controller.toggle(ctl); } });
    });
    return b;
  }
  // the list of «⋯»: the buttons the row leaves out (each runs as its button does), Autopilot's menu
  function moreItems(box, ctl) {
    var items = [], bell = box.children('.button--snack-sub').length;
    var item = function (el) {
      var t = buttonName(el), icon = $(el).children('svg').prop('outerHTML');
      if (!t) return;
      if (bell && el.classList.contains('button--subscribe')) t += ' · CUB';   // the bell in the row subscribes too
      items.push({ title: t, template: icon ? 'selectbox_icon' : 'selectbox_item', icon: icon,
        onSelect: function () { Lampa.Controller.toggle(ctl); $(el).trigger('hover:enter'); } });
    };
    box.children('.full-start__button.stv-more').each(function () {
      if (this.classList.contains('hide') || this.classList.contains('button--options')) return;
      // Lampa's Play is a list of the sources (online plugins, torrents, trailers, Shots); while it is
      // hidden for Autopilot they are listed here one by one, but for what the row has already
      if (this.classList.contains('button--play') && noPlay()) {
        box.closest('.full-start-new').find('.buttons--container > .full-start__button').not('.hide').each(function () {
          if (this.classList.contains('view--torrent') && box.children('.button--alc-torrent').length) return;
          if (this.classList.contains('view--trailer') && box.children('.button--alc-trailer').length) return;
          item(this);
        });
        return;
      }
      item(this);
    });
    var ap = box.children('.button--alc-auto').first();
    if (ap.length) items.push({ title: tr('b_auto_set'), onSelect: function () { Lampa.Controller.toggle(ctl); ap.trigger('hover:long'); } });
    return items;
  }
  // Lampa's «⋯» was pressed: the hidden buttons first, then what other plugins add, then Lampa's own
  function moreOptions(e) {
    var html = e.link && e.link.html, box = html ? $(html).find('.full-start-new__buttons').first() : $();
    if (!box.length || !e.options || !box.closest('.stv-full').length) return;
    var ctl = 'full_start';
    try { ctl = Lampa.Controller.enabled().name; } catch (x) {}
    var mine = moreItems(box, ctl);
    for (var i = mine.length - 1; i >= 0; i--) e.options.unshift(mine[i]);
  }
  // touch: a long press on a round button shows its name over it a moment (iOS's tooltip)
  var tipEl = null, tipT = 0;
  function tipFor(el) {
    if (el.stv_tip) return;
    el.stv_tip = true;
    $(el).on('hover:long', function () {
      if (!themeOn() || M === 'tv' || el.classList.contains('stv-primary')) return;
      var t = buttonName(el);
      if (!t) return;
      if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'stv-tip'; document.body.appendChild(tipEl); }
      tipEl.textContent = t;
      tipEl.classList.add('on');
      var r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
      tipEl.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
      tipEl.style.top = Math.max(8, r.top - h - 10) + 'px';
      clearTimeout(tipT);
      tipT = setTimeout(function () { tipEl.classList.remove('on'); }, 2200);
    });
  }
  function themeFull(e) {
    var render = e.object.activity.render(), movie = (e.data && e.data.movie) || e.object.card || {};
    var start = render.find('.full-start-new').first();
    if (!start.length) return;   // another layout of the card: Lampa's look stays
    render.addClass('stv-full');
    // scrim over the backdrop
    var bg = render.find('.full-start__background').first();
    // Lampa draws no background picture on screens under 790 px (phones): the theme adds one in the same
    // place, so the page has its picture and «Трейлеры» its spot for the background trailer
    if (!bg.length) {
      var holder0 = start.closest('.scroll').parent();
      var path = portrait() && movie.poster_path ? cleanPoster(movie) : movie.backdrop_path;
      if (holder0.length && path) {
        var own = new Image();
        var isPoster = path !== movie.backdrop_path;
        own.className = 'full-start__background stv-own-bg' + (isPoster ? ' stv-own-bg--poster' : '');
        own.alt = '';
        own.onload = function () { own.classList.add('loaded'); };
        own.src = img(path, isPoster ? tmdbSize('poster', window.innerWidth) : tmdbSize('backdrop', window.innerWidth));
        holder0.prepend(own);
        bg = $(own);
      }
    }
    if (bg.length && !render.find('.stv-scrim').length) bg.after('<div class="stv-scrim"></div>');
    // the backdrop and the scrim sit at z-index -1: their container gets its own stacking layer, else
    // they go under the page colour of the activity
    if (bg.length) { var holder = bg[0].parentNode; if (window.getComputedStyle(holder).position === 'static') holder.style.position = 'relative'; holder.style.zIndex = '0'; holder.style.overflow = 'hidden'; }
    // logo instead of the text title
    var title = start.find('.full-start-new__title').first();
    if (title.length && !title.find('.stv-logo').length) {
      titleLen(title[0], title.text());
      logoInto(title[0], movie, tmdbSize('logo', T[M].logoW * k));
    }
    // meta line above the rate line; synopsis text is intentionally not rendered
    var right = start.find('.full-start-new__right').first();
    if (!right.find('.stv-meta').length) {
      var meta = $(metaLine(movie, start));
      title.after(meta);
      // the ratings (TMDB, and IMDb / KP when Lampa fills them) join the meta line
      var rl = start.find('.full-start-new__rate-line').first();
      if (rl.length) { var ua = meta.find('.stv-ua'); if (ua.length) ua.before(rl); else meta.append(rl); }
    }
    askServer();   // a server found / lost since (Autopilot keeps «none» for a minute)
    markButtons(render);
    // the pack's and other plugins' buttons come on the same event (before or after this) or later
    var bx = render.find('.full-start-new__buttons')[0];
    if (bx && !bx.stv_obs && window.MutationObserver) {
      var due = 0;
      bx.stv_obs = new MutationObserver(function () {
        if (due) return;
        due = setTimeout(function () { due = 0; try { if (themeOn() && inDoc(bx)) markButtons(render); } catch (x) {} }, 30);
      });
      bx.stv_obs.observe(bx, { childList: true });
    }
    // the page colour from the backdrop
    tintOf(movie.backdrop_path, function (col) {
      if (!col) return;
      var el = render[0];
      el.style.setProperty('--stv-bg', deep(col, 0.16));
      el.style.setProperty('--stv-bg-a6', deepA(col, 0.16, 0.62));
    });
  }

  // Apple's order of the rows: the info, episodes, cast, related; "About" (Lampa's description with
  // the details) last. CUB comments go with the reactions. Done on the row list before Lampa builds
  // it, so the remote moves through the rows in the order they are shown.
  var FIRST = { start: 0, episodes: 1, persons: 2, cards: 3, metadata_chart: 4, metadata_tags: 4, description: 6, discuss: 7 };
  function rowName(x) { return Object.prototype.toString.call(x) === '[object Array]' ? x[0] : x; }
  function reorderRows(link) {
    if (!link || typeof link.build !== 'function' || link.stv_rows) return;
    link.stv_rows = true;
    var orig = link.build;
    link.build = function (data) {
      try {
        if (themeOn() && this.rows && this.rows.length && rowName(this.rows[0]) === 'start') {
          var rows = this.rows.slice(), hide = !opt(K.react);
          rows = rows.filter(function (x) { return rowName(x) !== 'description' && !(hide && rowName(x) === 'discuss'); });
          rows = rows.map(function (x, i) { return [x, i]; }).sort(function (a, b) {
            var fa = FIRST[rowName(a[0])], fb = FIRST[rowName(b[0])];
            fa = fa === undefined ? 5 : fa; fb = fb === undefined ? 5 : fb;
            return fa - fb || a[1] - b[1];
          }).map(function (x) { return x[0]; });
          this.rows.length = 0;
          Array.prototype.push.apply(this.rows, rows);
          data = this.rows.slice(0, this.view || 3);
        }
      } catch (e) { log(e && e.message); }
      return orig.call(this, data);
    };
  }

  // ---------- watch progress: Lampa's timelines (the card's episode row and Home's «Up Next») ----------
  function epHash(m, s, e) {
    var name = m.original_name || m.original_title || m.name || '';
    return Lampa.Utils.hash([s, s > 10 ? ':' : '', e, name].join(''));
  }
  function epView(m, s, e) { try { return Lampa.Timeline.view(epHash(m, s, e)) || {}; } catch (x) { return {}; } }
  // a movie's progress (Lampa keys it by the original title, as Autopilot's timelineHash does)
  function movieView(m) { try { return Lampa.Timeline.view(Lampa.Utils.hash(m.original_title || m.title || '')) || {}; } catch (x) { return {}; } }
  function seasonsList(m) {
    var out = [];
    (m.seasons || []).forEach(function (x) { var n = parseInt(x.season_number, 10); if (n > 0 && (x.episode_count || 0) > 0) out.push(n); });
    if (!out.length && m.number_of_seasons) for (var i = 1; i <= m.number_of_seasons; i++) out.push(i);
    return out.sort(function (a, b) { return a - b; });
  }
  // The furthest episode with any progress, from Lampa's own timelines (Autopilot's rule: an earlier
  // episode reopened later does not move it back): {s, e, pct, left (minutes)} or null. Any season: a
  // series started from season 4 is found there.
  // Read-only (Timeline.view); seasons from the card, else up to 12; a season's scan stops after a run
  // of episodes never started. first: the first episode with progress ends the scan (anyWatched).
  function lastWatched(m, first) {
    var best = null, seasons = parseInt(m.number_of_seasons, 10) || 12;
    seasons = Math.min(seasons, 30);
    for (var s = 1; s <= seasons; s++) {
      var miss = 0, max = s === 1 ? 120 : 60;
      for (var e = 1; e <= max; e++) {
        var v = epView(m, s, e);
        if (v.percent > 0) {
          if (first) return { s: s, e: e };
          miss = 0;
          if (!best || s > best.s || (s === best.s && e > best.e))
            best = { s: s, e: e, pct: v.percent, left: v.duration && v.time ? Math.round((v.duration - v.time) / 60) : 0 };
        } else if (++miss > 10 && e > 10) break;
      }
    }
    return best;
  }
  // any episode with progress (lastWatched's answer as a yes / no, without scanning on)
  function anyWatched(m) { return !!lastWatched(m, true); }
  // what comes after a watched episode: the next one, or the next season's first (when the card knows
  // the season's length)
  function nextAfter(m, s, e) {
    var count = 0;
    (m.seasons || []).forEach(function (x) { if (parseInt(x.season_number, 10) === s) count = x.episode_count || 0; });
    if (count && e >= count && s < (parseInt(m.number_of_seasons, 10) || 0)) return { s: s + 1, e: 1 };
    return { s: s, e: e + 1 };
  }
  // the season and episode to show first: the furthest episode watched (or the next one when it was watched
  // to the end), else what "Continue · S2E5" would play
  // lw: lastWatched(m) when the caller has it already (the scan is the costly part)
  function startPoint(m, fallbackSeason, lw) {
    try {
      if (lw === undefined) lw = lastWatched(m);
      if (lw) { if (lw.pct < 90) return { s: lw.s, e: lw.e }; var nx = nextAfter(m, lw.s, lw.e); return { s: nx.s, e: nx.e }; }
    } catch (x) {}
    try {
      var a = autoApi('label');
      if (a) { var l = a.label(m); if (l && l.season) return { s: l.season, e: l.episode }; }
    } catch (x) {}
    try {
      var w = watchedLast()[titleHash(m)];
      if (w && w.season) return { s: parseInt(w.season, 10), e: parseInt(w.episode, 10) || 1 };
    } catch (x) {}
    return { s: fallbackSeason || 1, e: 1 };
  }
  function playEpisode(m, s, e, render) {
    var a = autoApi('playEpisode');
    if (a) { a.playEpisode(m, s, e); return; }
    // no Autopilot: Lampa's own Play (its source menu)
    var play = render.find('.button--play').first();
    if (play.length) play.trigger('hover:enter');
  }
  // ---------- the episode row: stills, number, title, runtime, progress; a tap plays that episode ----------
  // Episode titles as Autopilot names them: TMDB answers "<word> 15" when an episode has no title in
  // the interface language; such titles (and titles in a script the interface language does not use)
  // take the English title, then the original-language one if it is readable in the interface script.
  // Nothing readable: no title line (the card says «СЕРИЯ 15» already). An empty description takes the
  // English one. The extra requests only for seasons that need them (one per language, cached).
  var PLACEHOLDER = /^[^\d]{1,24}\s\d{1,4}$/;
  var SCRIPTS = { cyr: /[\u0400-\u04FF]/g, cjk: /[\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/g, lat: /[A-Za-z\u00C0-\u024F]/g };
  function scriptOf(str) {
    var best = '', n = 0;
    for (var k2 in SCRIPTS) { var c = (String(str || '').match(SCRIPTS[k2]) || []).length; if (c > n) { n = c; best = k2; } }
    return best;
  }
  var uiScriptMemo = '';
  function uiScript() {
    if (uiScriptMemo) return uiScriptMemo;
    var l = uiLang(), name = '';
    try { if (window.Intl && Intl.DisplayNames) name = new Intl.DisplayNames([l], { type: 'language' }).of(l); } catch (e) {}
    uiScriptMemo = scriptOf(name) || (/^(ru|uk|be|bg|sr|kk)$/.test(l) ? 'cyr' : 'lat');
    return uiScriptMemo;
  }
  function goodName(n, ui) { if (!n || PLACEHOLDER.test(String(n).trim())) return false; var sc = scriptOf(n); return !sc || sc === ui; }
  // no description: empty, or blanks / emoji only (stv_txt: the overview as shown, see fillNames)
  function noText(e) { return !e.stv_txt; }
  // the names and descriptions the interface can show (TMDB's other languages for what is missing);
  // stv_txt / stv_name: the overview / name as plainText, once per episode, for the cards
  function fillNames(m, n, eps, cb) {
    var ui = uiScript();
    var done = function () { eps.forEach(function (e) { e.stv_name = plainText(e.name); }); cb(eps); };
    eps.forEach(function (e) { e.stv_txt = plainText(e.overview); });
    var bad = eps.filter(function (e) { return !goodName(e.name, ui) || noText(e); });
    if (!bad.length) return done();
    var langs = ['en-US'], orig = m.original_language;
    if (orig && orig !== 'en') langs.push(orig);
    (function next(i) {
      bad = bad.filter(function (e) { return (!goodName(e.name, ui) && !e.stv_named) || noText(e); });
      if (!bad.length || i >= langs.length) {
        eps.forEach(function (e) { if (!e.stv_named && !goodName(e.name, ui)) e.stv_noname = true; });
        return done();
      }
      tmdb('tv/' + m.id + '/season/' + n, function (j) {
        var alt = {};
        ((j && j.episodes) || []).forEach(function (x) { alt[x.episode_number] = x; });
        bad.forEach(function (e) {
          var a = alt[e.episode_number];
          if (!a) return;
          // English is the agreed fallback in any interface language; others must be readable
          if (!goodName(e.name, ui) && !e.stv_named && a.name && !PLACEHOLDER.test(String(a.name).trim()) && (langs[i] === 'en-US' || scriptOf(a.name) === ui)) { e.name = a.name; e.stv_named = true; }
          var txt = noText(e) && plainText(a.overview);
          if (txt && (langs[i] === 'en-US' || scriptOf(a.overview) === ui)) { e.overview = a.overview; e.stv_txt = txt; }
        });
        next(i + 1);
      }, function () { next(i + 1); }, langs[i]);
    })(0);
  }
  function seasonOf(m, n, cb) {
    var lang = tmdbLang();
    var key = m.id + ':' + n + ':' + lang, have = seasonCache.get(key);
    if (have) return cb(have);
    tmdb('tv/' + m.id + '/season/' + n, function (j) {
      fillNames(m, n, (j && j.episodes) || [], function (eps) { seasonCache.set(key, eps); cb(eps); });
    }, function () { cb(null); });
  }
  // one episode card, Apple's: the still and a strip under it, the text inside over the still's blurred
  // copy (the episode row, the schedule). o: {still (TMDB path), cap, name, descr, time, pct, soon}.
  // The pictures wait in data-src (loadImg)
  function epCard(o) {
    var el = document.createElement('div');
    el.className = 'stv-ep selector' + (o.soon ? ' stv-ep--soon' : '');
    // the blurred copy (under the text strip; not in the light mode) and the still over it
    el.innerHTML = (L ? '' : '<div class="stv-ep__blur"></div>') + '<div class="stv-ep__img"></div>' +
      '<div class="stv-ep__info"><div class="stv-ep__cap"></div><div class="stv-ep__name"></div><div class="stv-ep__descr"></div><div class="stv-ep__time"><span></span></div></div>';
    var box = el.querySelector('.stv-ep__img'), info = el.lastChild, time = info.lastChild, pct = o.pct || 0;
    if (o.still) {
      [el.querySelector('.stv-ep__blur'), box].forEach(function (holder) {
        if (!holder) return;
        var im = new Image();
        im.alt = '';
        im.onload = function () { im.classList.add('loaded'); };
        im.onerror = function () { if (im.parentNode) im.parentNode.removeChild(im); };
        // the blurred copy small: blurred, a big file buys nothing and costs a lot
        im.setAttribute('data-src', img(o.still, holder === box ? tmdbSize('still', T[M].epW * k) : 'w300'));
        holder.appendChild(im);
      });
    }
    if (pct > 0 && pct < 90) time.insertAdjacentHTML('afterbegin', '<div class="stv-ep__bar"><div style="width:' + Math.max(4, pct) + '%"></div></div>');
    else if (pct >= 90) box.insertAdjacentHTML('beforeend', '<div class="stv-ep__seen">✓</div>');
    info.children[0].textContent = o.cap || '';
    if (o.name) info.children[1].textContent = o.name;
    else info.children[1].style.display = 'none';
    info.children[2].textContent = o.descr || '';
    time.lastChild.textContent = o.time || '';
    return el;
  }
  function loadImg(el) { if (el && el.querySelectorAll) Array.prototype.forEach.call(el.querySelectorAll('img[data-src]'), function (im) { im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); }); }
  function dateText(d) { try { return Lampa.Utils.parseTime(d).full; } catch (e) { return String(d || ''); } }
  var CHEV = '<svg class="stv-season-chev" viewBox="0 0 12 20" width="0.55em" height="0.9em"><path d="M2 7.5 6 3.5l4 4M2 12.5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function themeEpisodes(e) {
    if (!opt(K.episodes)) return;
    var line = e.item, movie = (e.data && e.data.movie) || {};
    if (!line || !line.scroll || !line.html || !movie.id) return;
    var seasons = seasonsList(movie);
    if (!seasons.length) return;
    var body = line.scroll.body ? line.scroll.body(true) : line.html.querySelector('.scroll__body');
    if (!body) return;
    var render = e.body.closest('.activity');
    if (!render.length) render = e.body;
    var titleEl = line.html.querySelector('.items-line__title');
    var sp = startPoint(movie, seasons[seasons.length - 1]);
    if (seasons.indexOf(sp.s) < 0) { sp.s = seasons[0]; sp.e = 1; }
    var current = sp.s;

    // Apple: the row title «Season 1 ⌃⌄» is the season switch. On touch a tap opens the list; on TVs the
    // title joins the row's remote list (up from the episodes reaches it, up again leaves the row)
    var pick = titleEl ? titleEl : document.createElement('div');
    if (seasons.length > 1) pick.className += ' stv-season-title selector';
    $(pick).on('hover:enter', function () {
      if (seasons.length < 2) return;
      var items = seasons.map(function (n) { return { title: tr('season') + ' ' + n, n: n, selected: n === current }; });
      var ctl = Lampa.Controller.enabled().name;
      Lampa.Select.show({
        title: tr('season'), items: items,
        onSelect: function (a) { Lampa.Controller.toggle(ctl); if (a.n !== current) { current = a.n; draw(1); } },
        onBack: function () { Lampa.Controller.toggle(ctl); }
      });
    });
    $(pick).on('hover:focus', function () { line.last = pick; });
    var head = titleEl && titleEl.parentNode;
    if (head && seasons.length > 1) {
      try {
        line.use({ onController: function (c) {
          var sc = line.scroll.render(true);
          c.toggle = function () {
            Lampa.Controller.collectionSet(sc, head);
            Lampa.Controller.collectionFocus(line.last || false, sc);
            line.emit('toggle');
          };
          c.up = function () { if (Navigator.canmove('up')) Navigator.move('up'); else line.emit('up'); };
          c.down = function () { if (Navigator.canmove('down')) Navigator.move('down'); else line.emit('down'); };
        } });
      } catch (x) {}
    }

    function card(m, ep) {
      var s = ep.season_number, n = ep.episode_number, soon = ep.air_date && new Date(ep.air_date) > new Date();
      var bits = [];
      if (soon) bits.push(tr('soon') + ' · ' + dateText(ep.air_date));
      else { if (ep.runtime) bits.push(runtimeText(ep.runtime)); if (ep.air_date) bits.push(String(ep.air_date).slice(0, 4)); }
      var el = epCard({ still: ep.still_path, cap: tr('episode_cap', n), name: ep.stv_noname ? '' : ep.stv_name, descr: ep.stv_txt,
        time: bits.join(' · '), pct: epView(m, s, n).percent, soon: soon });
      $(el).on('hover:focus', function () { line.last = el; if (line.scroll.update) line.scroll.update(el, false); loadNear(el); });
      $(el).on('hover:enter', function () { if (!soon) playEpisode(m, s, n, render); });
      return el;
    }
    // stills: only for what is on screen and the next screen
    var shown = [];   // the row's episode cards, in order (el.stv_i = its place)
    function loadNear(el) {
      var i = el.stv_i, per = M === 'tv' ? 6 : 5;
      for (var j = Math.max(0, i - 1); j < Math.min(shown.length, i + per * 2); j++) loadImg(shown[j]);
    }
    var io = window.IntersectionObserver ? new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { loadImg(x.target); io.unobserve(x.target); } });
    }, { rootMargin: '0px 100% 0px 100%' }) : null;

    function draw(focusEp) {
      if (titleEl) titleEl.innerHTML = esc(tr('season') + ' ' + current) + (seasons.length > 1 ? CHEV : '');
      var want = current;   // a season picked meanwhile wins over a late answer for this one
      seasonOf(movie, current, function (eps) { ready(eps, 0); });
      function ready(eps, tries) {
        if (want !== current) return;
        if (!eps || !eps.length) return;   // TMDB did not answer: Lampa's own row stays
        // the row may still sit in Lampa's fragment (built, not yet appended): a moment later
        if (!inDoc(body)) { if (tries < 20) setTimeout(function () { ready(eps, tries + 1); }, 50); return; }
        // on the page now: stopped when the page closes (see pruneWatched)
        if (io && !io.stv_listed) { io.stv_listed = true; rowIOs.push({ io: io, el: body }); }
        // Lampa's own episode items: hidden and out of the remote's reach; no more of them
        line.html.classList.add('stv-eprow');
        Array.prototype.forEach.call(body.querySelectorAll('.full-episode, .card-more'), function (x) { x.classList.remove('selector'); });
        try { line.scroll.onScroll = function () {}; } catch (x) {}
        Array.prototype.slice.call(body.querySelectorAll('.stv-ep')).forEach(function (x) { if (io) io.unobserve(x); x.parentNode.removeChild(x); });
        var els = shown = eps.map(function (ep, i) { var x = card(movie, ep); x.stv_i = i; return x; });
        els.forEach(function (x) { body.appendChild(x); if (io) io.observe(x); });
        var target = els[Math.max(0, Math.min(els.length - 1, (focusEp || 1) - 1))];
        if (!target) return;
        if (!io) loadNear(target);
        line.last = target;
        // keep the start point in view
        setTimeout(function () { try { if (line.scroll.update) line.scroll.update(target, false); } catch (x) {} if (!io) loadNear(target); }, 30);
        // the remote's list for this row is rebuilt when the row has the focus
        try { if (Lampa.Controller.own && Lampa.Controller.own(line)) line.toggle(); } catch (x) {}
      }
    }
    draw(current === sp.s ? sp.e : 1);
  }


  // ================= pages: which one, its state on the body, the remote =================
  // the page being opened: Lampa builds it (and its cards, from cached lists) between 'init' and 'start',
  // while Activity.active() is still the page it is opened from
  var building = null;
  function pageNow() { if (building) return building; try { return Lampa.Activity.active() || null; } catch (e) { return null; } }
  function screenNow() { var a = pageNow(); return (a && a.component) || ''; }
  // ---------- page state for the bars: Home (the iPad tab capsule), scrolled (TV header) ----------
  function pageState() {
    try {
      var a = pageNow(), b = document.body.classList;
      b.toggle('stv-at-main', !!(a && a.component === 'main'));
      b.toggle('stv-at-cat', !!(a && a.component === 'category'));
      b.toggle('stv-at-person', !!(a && a.component === 'myperson'));
      if (a && a.component === 'myperson' && themeOn()) personTilesSoon();
      if (M === 'tv') {   // only the TV header styles stv-scrolled
        var y = 0, sb = document.querySelector('.activity--active .scroll:not(.scroll--horizontal) > .scroll__content > .scroll__body');
        // Lampa's own inline translate3d (where it is heading) first: the computed style is a style recalc
        var m = sb && /translate3d\(\s*-?[\d.]+px,\s*(-?[\d.]+)px/.exec(sb.style.webkitTransform || sb.style.transform || '');
        if (m) y = parseFloat(m[1]);
        else if (sb) { m = /matrix.*,\s*(-?[\d.]+)\)$/.exec(window.getComputedStyle(sb).transform || ''); if (m) y = parseFloat(m[1]); }
        var head = false; try { head = Lampa.Controller.enabled().name === 'head'; } catch (e) {}
        b.toggle('stv-scrolled', y < -40 && !head);
      }
    } catch (e) {}
  }
  // People (the left menu): each row opens with the person — a round portrait and «All titles» in
  // place of Lampa's empty «More» tile (it opens the same list); the row title is the name
  function personTiles() {
    try {
      var rows = document.querySelectorAll('.activity--active .items-line');
      Array.prototype.forEach.call(rows, function (row) {
        var tile = row.querySelector('.card-more--first .card-more__box');
        if (!tile || tile.querySelector('.stv-pphoto')) return;
        var im = row.querySelector('.items-line__head .full-person__photo img');
        var src = im && (im.getAttribute('src') || '');
        if (!/image\.tmdb\.org/.test(src)) return;
        var ph = document.createElement('div');
        ph.className = 'stv-pphoto';
        ph.style.backgroundImage = 'url(' + src.replace(/\/t\/p\/[^/]+\//, '/t/p/w185/') + ')';
        var cap = tile.querySelector('.card-more__title');
        if (cap) cap.textContent = tr('all_films');
        tile.insertBefore(ph, tile.firstChild);
      });
    } catch (e) {}
  }
  // the rows come in batches: again a moment later (only the last call's retries are kept)
  var tileTimers = [];
  function personTilesSoon() {
    tileTimers.forEach(clearTimeout);
    personTiles();
    tileTimers = [setTimeout(personTiles, 1500), setTimeout(personTiles, 4000)];
  }
  // the header floats (0 high for Lampa's layout) only over Home, the card and Autopilot's screen
  function floatHead() {
    try {
      var a = pageNow(), b = document.body.classList;
      var on = themeOn() && !!a && (a.component === 'full' || a.component === 'alc_auto_view' || !!heroSection(a.component, a));
      if (b.contains('stv-float-head') === on) return;
      b.toggle('stv-float-head', on);
      if (Lampa.Layer && Lampa.Layer.update) Lampa.Layer.update();
    } catch (e) {}
  }
  // a poster's long-press menu: its title instead of Lampa's «Действие» (on a touch screen the title under
  // the poster is under the finger). The poster: the one last touched, else the one in focus (a remote)
  // touch on posters: the touched one stays «on» (its title shown, see cssPosters) until another poster is
  // touched, and «pressed» (it sinks) while the finger is down and still. Also the first touch of the session
  // (trackKeys: a touch screen, not a remote) and the poster last touched (cardMenuTitle)
  var touched = false, touchedCard = null, touchedAt = 0;
  function touchPosters() {
    var pressed = null, on = null, x0 = 0, y0 = 0, opts = { passive: true, capture: true };
    var move = function (e) { if (Math.abs(e.touches[0].clientX - x0) > 10 || Math.abs(e.touches[0].clientY - y0) > 10) release(); };
    var release = function () {
      if (!pressed) return;
      pressed.classList.remove('stv-press'); pressed = null;
      document.removeEventListener('touchmove', move, opts);
    };
    try {
      document.addEventListener('touchstart', function (e) {
        if (!touched) { touched = true; remoteOff(); }
        release();
        if (!themeOn()) return;
        var c = e.target && e.target.closest ? e.target.closest('.card') : null;
        if (!c) return;
        touchedCard = c; touchedAt = Date.now();
        if (c.classList.contains('card--wide')) return;
        if (on && on !== c) on.classList.remove('stv-on');
        on = c; c.classList.add('stv-on');
        pressed = c; c.classList.add('stv-press');
        x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
        document.addEventListener('touchmove', move, opts);
      }, opts);
      document.addEventListener('touchend', release, opts);
      document.addEventListener('touchcancel', release, opts);
    } catch (e) {}
  }
  // a poster's long-press menu: its title instead of Lampa's «Действие» (on a touch screen the title under the
  // poster is under the finger). The poster: the one just touched on the open page, else the focused one (a remote)
  function cardMenuTitle() {
    var show = Lampa.Select && Lampa.Select.show;
    if (!show || show.stvTitled) return;
    var fn = function (params) {
      try {
        if (themeOn() && params && params.title === Lampa.Lang.translate('title_action')) {
          var t = touchedCard && Date.now() - touchedAt < 1500 && $(touchedCard).closest('.activity--active').length ? touchedCard : null;
          var c = t || document.querySelector('.activity--active .card.focus');
          var name = c ? $.trim($(c).find('.card__title').first().text()) : '';
          if (name) params.title = name;
        }
      } catch (e) {}
      return show.apply(this, arguments);
    };
    fn.stvTitled = true;
    Lampa.Select.show = fn;
  }
  // the remote: the last up / down and a key counter (empty rows pass the focus on in that direction)
  var lastDir = 'down', keyCount = 0;
  var stateTimer = 0;
  function pageStateLater() { clearTimeout(stateTimer); stateTimer = setTimeout(pageState, 420); }
  function trackKeys() {
    // a remote: three arrow presses with no touch before them (and not typing): the TV look in «auto», kept for
    // this device; a touch takes it back (an iPad with a keyboard does not stay a TV)
    var arrows = 0;
    window.addEventListener('keydown', function (e) {
      var c = e.keyCode;
      keyCount++;
      if (c === 38) lastDir = 'up';
      else if (c === 40) lastDir = 'down';
      var t = e.target && e.target.tagName;
      if (c >= 37 && c <= 40 && !touched && t !== 'INPUT' && t !== 'TEXTAREA' && ++arrows === 3 && opt(K.mode) === 'auto' && M !== 'tv') {
        try { Lampa.Storage.set(K.remote, '1'); } catch (x) {}
        apply();
        // the open page was built for touch: built again for the remote (as after the look is changed in settings)
        setTimeout(function () { try { Lampa.Activity.refresh(true); } catch (x) {} }, 0);
      }
      pageStateLater();
    }, true);
  }
  // the first touch: the device has a touch screen, the remote guess goes (see touchPosters)
  function remoteOff() {
    if (String(opt(K.remote)) !== '1') return;
    try { Lampa.Storage.set(K.remote, ''); } catch (x) {}
    if (opt(K.mode) === 'auto') apply();
  }

  // ================= home: wide cards with logos, "Up Next", Shots =================
  // Home's «Continue» and «Watched» rows: the 16:9 cards with progress
  // «Continue» / «Watched» (Lampa's continue_watch row): its cards are Lampa's own continue lists
  // (Favorite.continues: series, anime, movies) - the row starts where one of them starts and has none
  // of anything else; Lampa's own titles (its translation) as the fallback. The lists are read once per
  // drawing of Home (a second)
  var contMemo = null;
  function contLists() {
    if (contMemo && Date.now() - contMemo.t < 1000) return contMemo;
    var m = { t: Date.now(), firsts: {}, ids: {} };
    try {
      if (Lampa.Favorite && typeof Lampa.Favorite.continues === 'function') ['tv', 'anime', 'movie'].forEach(function (k) {
        var l = Lampa.Favorite.continues(k) || [];
        if (l[0]) m.firsts[l[0].id] = 1;
        l.forEach(function (d) { if (d && d.id) m.ids[d.id] = 1; });
      });
    } catch (e) {}
    return (contMemo = m);
  }
  function cwRow(line, scr) {
    if (scr !== 'main') return false;
    var res = line.results || [];
    if (res.length && !line.url && !line.source && res[0]) {
      var c = contLists();
      if (c.firsts[res[0].id] && res.every(function (x) { return x && c.ids[x.id]; })) return true;
    }
    cwTitles();
    return !!line.title && (line.title === cwTitle || line.title === cwTitle2);
  }
  // CUB's Shots row: its items are shots (a card id + a fragment), its icon Shots' sprite; the title as the fallback
  function shotsRow(line) {
    var res = line.results || [];
    if (res.length && res.every(function (x) { return x && typeof x === 'object' && 'card_id' in x && 'start_point' in x; })) return true;
    if (typeof line.icon_svg === 'string' && line.icon_svg.indexOf('sprite-shots') >= 0) return true;
    return /^shots$/i.test(String(line.title || '').trim());
  }
  function isTitleData(d) {
    return d && typeof d === 'object' && d.id && (d.title || d.name) && !d.gender && d.media_type !== 'person' && !(d.profile_path && !d.poster_path && !d.backdrop_path);
  }
  // what Lampa asks of a row object: handlers (use / emit as Lampa's own rows) and its element
  function rowBase(self, el) {
    var h = {};
    self.use = function (o) { for (var k2 in o) if (typeof o[k2] === 'function') (h[k2] = h[k2] || []).push(o[k2]); };
    self.emit = function (n) { var a = Array.prototype.slice.call(arguments, 1), f = h['on' + n.charAt(0).toUpperCase() + n.slice(1)] || []; f.forEach(function (x) { x.apply(self, a); }); };
    self.render = function (js) { return js ? el : $(el); };
  }
  // a row the viewer does not want (Shots): kept in Lampa's list of rows, so up/down still count it,
  // but it is empty and passes the focus on in the direction the remote was moving
  function SkipRow() {
    var self = this, el = document.createElement('div'), last = 0, lastKeys = -1;
    el.className = 'stv-shots-hidden';
    rowBase(this, el);
    this.create = function () {};
    this.toggle = function () {
      // toggled again with no key pressed in between = Lampa bounced it back (it is the last row): turn
      var now = Date.now(), again = keyCount === lastKeys && now - last < 1000;
      var dir = again ? (lastDir === 'up' ? 'down' : 'up') : lastDir;
      last = now; lastKeys = keyCount;
      setTimeout(function () { self.emit(dir); }, 0);
    };
    this.destroy = function () { if (el.parentNode) el.parentNode.removeChild(el); };
  }
  // Lampa's titles of the "Continue" rows (its language)
  var cwTitle = '', cwTitle2 = '';
  function cwTitles() { if (!cwTitle) try { cwTitle = Lampa.Lang.translate('title_continue'); cwTitle2 = Lampa.Lang.translate('title_watched'); } catch (e) {} }
  // ---------- rows: which are wide; cards: wide (16:9) or Apple's poster ----------
  // Apple TV (tvOS 26): a title is a 2:3 poster; 16:9 only for what is being watched — Home's «Continue» /
  // «Watched» rows — and for CUB's trailers row (the banner and episodes are the theme's own 16:9).
  // Decided per row when the row is made (the page being opened is known then); Lampa reuses the same
  // card objects on other pages (cached lists): every row writes the choice afresh.
  var trailersTitle = '';
  function lineHook(line, scr) {
    var main = scr === 'main', cw = cwRow(line, scr);
    if (!trailersTitle) try { trailersTitle = Lampa.Lang.translate('title_trailers') + ' - ' + Lampa.Lang.translate('title_new'); } catch (e) {}
    var wide = cw || (main && line.title === trailersTitle);
    if (scr === 'actor' && line.title && (line.results || []).length) {
      // the person page (Apple): «Movies», «TV Shows»… without Lampa's counts, the best known first
      line.title = String(line.title).replace(/\s*\(\d+\)\s*$/, '');
      line.results.sort(function (a, b) { return ((b && b.vote_count) || 0) - ((a && a.vote_count) || 0); });
    }
    (line.results || []).forEach(function (x) { if (x && typeof x === 'object') x.stv_wide = wide ? 1 : 0; });
    if (line.title === undefined) return;
    if (!opt(K.shots) && main && shotsRow(line)) {
      line.params = line.params || {};
      line.params.createInstance = function () { return new SkipRow(); };
    } else if (cw) {
      line.params = line.params || {};
      line.params.type = 'stv-cw';
      (line.results || []).forEach(function (x) { if (x && typeof x === 'object') x.stv_cw = 1; });
    }
  }
  // Lampa's own style for a card (wide for CUB's «В высоком качестве» / trailers, default…) is kept on
  // the shared object the first time: the theme sets its own each time and puts Lampa's back when off
  function cardHook(d, scr) {
    var p = d.params = d.params || {};
    if (d.stv_emit0 === undefined) d.stv_emit0 = p.emit || null;
    if (d.stv_style0 === undefined) d.stv_style0 = p.style || null;
    var own = d.stv_style0 && d.stv_style0.name;
    if (own && own !== 'default' && own !== 'wide') return;   // another kind of card: Lampa's
    if (d.stv_wide && scr === 'main') { p.style = { name: 'wide' }; p.emit = wideEmit(d); }
    else { p.style = { name: 'default' }; p.emit = posterEmit(d); }
  }
  function cardRestore(d) {
    if (d.stv_style0 === undefined || !d.params) return;
    if (d.stv_style0) d.params.style = d.stv_style0; else delete d.params.style;
    if (d.stv_emit0) d.params.emit = d.stv_emit0; else delete d.params.emit;
    delete d.stv_style0;
  }
  // a card's hook: Lampa's own, plus the picture at the size the screen needs (and for a wide card its
  // logo and «Up Next»). Built from Lampa's own every time (the object comes back on every visit)
  function cardEmit(d, size, after) {
    var prev = d.stv_emit0 || {}, own = {};
    for (var k2 in prev) own[k2] = prev[k2];
    var pc = prev.onCreate;
    own.onCreate = function () {
      if (pc) pc.apply(this, arguments);
      var inst = this, gp = inst.getPosterPath;
      // the picture at the size the screen needs; a localized poster (localCard) first
      if (typeof gp === 'function' && !gp.stv) { inst.getPosterPath = function () { return inst.stv_locp || resized(gp.apply(inst, arguments), size); }; inst.getPosterPath.stv = 1; }
      if (after) try { after.call(this); } catch (e) {}
    };
    return own;
  }
  function wideEmit(d) { var t = T[M]; return cardEmit(d, tmdbSize('backdrop', (d.stv_cw ? t.cwW : t.cardW) * k), function () { wideCard(this.html, this.data || d); }); }
  function posterEmit(d) {
    var size = tmdbSize('poster', posterCssW());
    if (!needsLocal(d)) return cardEmit(d, size);
    return cardEmit(d, size, function () { var inst = this; setTimeout(function () { try { localCard(inst, d, size); } catch (e) {} }, 0); });
  }
  // ---------- a card in another language: its title and poster from TMDB in the interface's ----------
  // Cards from CUB (Russian whatever the language) and cards Lampa saved earlier in Russian (bookmarks,
  // history, «We recommend») keep their stored data: only what this card shows on screen changes -
  // the title line and the poster - from TMDB in Lampa's TMDB language (its own poster for that
  // language, else TMDB's default). Not for a Russian / Belarusian interface. Russian is told by its
  // own letters (ы э ъ ё) or by CUB as the card's source. One request per title, kept (stv_loc, 400
  // titles, 30 days), two at a time, the newest cards first (40 waiting at most); anything that fails
  // leaves the card as Lampa drew it.
  var RU_ONLY = /[ыэъёЫЭЪЁ]/, locs, locQueue = [], locBusy = 0, locWait = {}, LOC_TTL = 30 * 24 * 3600 * 1000, LOC_QUEUE = 40;
  // the option and the language: read again at most every 2 s (a row's cards share one read)
  var locMemo = { at: 0, l: '' };
  function locLang() {
    if (Date.now() - locMemo.at > 2000) {
      var l = tmdbLang();
      locMemo = { at: Date.now(), l: opt(K.loc) && !/^(ru|be)/.test(l) ? l : '' };
    }
    return locMemo.l;
  }
  function needsLocal(d) {
    if (!d || typeof d.id !== 'number' || d.stv_cw || !locLang()) return false;
    return d.source === 'cub' || RU_ONLY.test(String(d.title || d.name || '') + ' ' + String(d.overview || '').slice(0, 200));
  }
  // waiters of a title: {cb, gone}; the request is skipped only when every card waiting is gone
  function getLocal(d, cb, gone) {
    var l = locLang(), key = kindOf(d) + d.id + ':' + l;
    locs = locs || Cache('stv_loc', 400);
    var have = locs.get(key);
    if (have && Date.now() - (have.at || 0) < LOC_TTL) return cb(have.t ? have : null);
    if (locWait[key]) { locWait[key].push({ cb: cb, gone: gone }); return; }
    locWait[key] = [{ cb: cb, gone: gone }];
    // a title TMDB has nothing for is kept (no asking again for LOC_TTL); a failed request is not
    var fin = function (v) {
      if (v) try { locs.set(key, v); } catch (e) {}
      var w = locWait[key] || []; delete locWait[key];
      w.forEach(function (x) { try { x.cb(v && v.t ? v : null); } catch (e) {} });
    };
    var job = function (next) {
      tmdb(kindOf(d) + '/' + d.id, function (j) {
        var t = j && (j.title || j.name);
        // TMDB's answer in another language than asked (no translation: the original) is fine, Russian is not
        fin(typeof t === 'string' && t && !RU_ONLY.test(t) ? { t: t, p: j.poster_path || '', at: Date.now() } : { at: Date.now() });
        next();
      }, function () { fin(null); next(); }, l);
    };
    job.gone = function () { return (locWait[key] || []).every(function (x) { return x.gone && x.gone(); }); };
    job.drop = function () { fin(null); };
    locQueue.push(job);
    // a long queue: the jobs of cards no longer on the page leave it (never the cards still there)
    if (locQueue.length > LOC_QUEUE) locQueue = locQueue.filter(function (j) { if (!j.gone()) return true; j.drop(); return false; });
    locPump();
  }
  function locPump() {
    while (locBusy < 2 && locQueue.length) {
      var job = locQueue.pop();   // the newest first: cards on screen now
      if (job.gone()) { job.drop(); continue; }
      locBusy++;
      job(function () { locBusy--; setTimeout(locPump, 0); });
    }
  }
  // inst: Lampa's card. A localized poster is used only once it loads: then it is the card's
  // getPosterPath (see cardEmit: Lampa takes it when the card comes into view), and a card already
  // drawn (or drawing) gets it at once
  function localCard(inst, d, size) {
    var html = inst && inst.html, el = html && (html.nodeType ? html : html[0]);
    if (!el) return;
    getLocal(d, function (v) {
      if (!v || !inDoc(el)) return;
      var t = el.querySelector('.card__title');
      if (t && v.t) t.textContent = v.t;
      var src = v.p && img(v.p, size);
      if (!src) return;
      var pre = new Image();
      pre.onload = function () {
        inst.stv_locp = src;
        var im = el.querySelector('.card__img');
        if (im && im.tagName === 'IMG' && /^https?:/.test(im.getAttribute('src') || '') && im.getAttribute('src') !== src) im.src = src;
      };
      pre.src = src;
    }, function () { return !inDoc(el); });
  }
  // Lampa's classes of a card and a row, by reference (Lampa.Maker); the function name only when Maker
  // does not know them (an older Lampa)
  var makerCls = {};   // name -> class, or null when Maker does not know it (asked once: every createInstance asks)
  function makerClass(n) {
    if (makerCls.hasOwnProperty(n)) return makerCls[n];
    // a class found is kept; one Maker does not list (yet) is asked again next time (it may register later)
    try { var M = Lampa.Maker, c = (M && M.list && M.list().indexOf(n) >= 0 && M.get(n, {})) || null; } catch (e) { return null; }
    if (c) makerCls[n] = c;
    return c;
  }
  function className(Base) {
    var c = makerClass('Card'), l = makerClass('Line');
    if (c && Base === c) return 'Card';
    if (l && Base === l) return 'Line';
    return c && l ? '' : (Base.name || '');
  }
  function hookInstances() {
    var U = Lampa.Utils, orig = U.createInstance;
    if (!orig || orig.stv) return;
    var wrapped = function (Base, element) {
      try {
        if (element && typeof Base === 'function') {
          var name = className(Base);
          if (!themeOn()) { if (name === 'Card') cardRestore(element); }
          else {
            var scr = screenNow();
            if (name === 'Line') lineHook(element, scr);
            if (name === 'Card' && isTitleData(element)) cardHook(element, scr);
          }
        }
      } catch (e) { log(e && e.message); }
      return orig.apply(this, arguments);
    };
    wrapped.stv = true;
    U.createInstance = wrapped;
  }
  // a logo over the frame — only for cards on screen or on the next screen
  var cardIO = null, watched = [], rowIOs = [];
  // a page closed: its cards never seen leave the observer (they kept the page's nodes and data alive);
  // the episode rows' observers of closed pages stop (a card the row never showed was held by its
  // observer, and through the card's handlers the whole closed card page: ~900 nodes a visit).
  // Only the destroyed page's (slide: its .activity): Lampa also takes the page two steps back out of
  // the document (kept, shown again after Back) - its observers stay. A node in no page and out of the
  // document (a row rebuilt) goes too
  function slideOf(n) { while (n && !(n.classList && n.classList.contains('activity'))) n = n.parentNode; return n || null; }
  function pruneWatched(slide) {
    var gone = function (el) { if (inDoc(el)) return false; var s = slideOf(el); return s ? s === slide : true; };
    rowIOs = rowIOs.filter(function (r) { if (!gone(r.el)) return true; r.io.disconnect(); return false; });
    if (!cardIO) return;
    watched = watched.filter(function (el) { if (!gone(el)) return true; cardIO.unobserve(el); return false; });
  }
  function cardLogo(el) {
    var view = el.querySelector('.card__view'), d = el.card_data || el.stv_data;
    if (view && d && !view.querySelector('.stv-card-logo')) logoInto(view, d, tmdbSize('logo', view.offsetWidth * 0.58), 'stv-card-logo', el);
  }
  function watchCard(el) {
    if (!cardIO && window.IntersectionObserver) {
      cardIO = new IntersectionObserver(function (list) {
        list.forEach(function (x) { if (x.isIntersecting) { cardIO.unobserve(x.target); var i = watched.indexOf(x.target); if (i >= 0) watched.splice(i, 1); cardLogo(x.target); } });
      }, { rootMargin: '50% 100% 50% 0px' });
    }
    if (cardIO) { cardIO.observe(el); watched.push(el); }
    else el.addEventListener('visible', function once() { el.removeEventListener('visible', once); cardLogo(el); });
  }
  function wideCard(html, d) {
    var el = html && (html.nodeType ? html : html[0]);
    if (!el) return;
    el.stv_data = d;
    watchCard(el);
    if (d && d.stv_cw) cwFooter(el, d);
  }
  // "Up Next": progress and S2, E5 (a series) or the time left (a movie)
  function cwFooter(el, d) {
    var view = el.querySelector('.card__view');
    if (!view) return;
    el.classList.add('stv-cw-card');
    var serial = kindOf(d) === 'tv', label = '', pct = 0;
    try {
      if (serial) {
        // an episode left unfinished: it, its progress and the time left; watched to the end: the next one
        var lw = lastWatched(d);
        if (lw && lw.pct < 90) { label = 'S' + lw.s + ', E' + lw.e + (lw.left > 0 ? ' · ' + runtimeText(lw.left) : ''); pct = lw.pct; }
        else if (lw) { var nx = nextAfter(d, lw.s, lw.e); label = 'S' + nx.s + ', E' + nx.e; }
        else { var sp = startPoint(d, 0, lw); if (sp.s) { label = 'S' + sp.s + ', E' + sp.e; pct = (epView(d, sp.s, sp.e).percent) || 0; } }
      } else {
        var v = movieView(d);
        pct = v.percent || 0;
        if (v.duration && v.time) { var left = Math.round((v.duration - v.time) / 60); if (left > 0) label = runtimeText(left); }
      }
    } catch (e) {}
    var f = document.createElement('div');
    f.className = 'stv-cw';
    f.innerHTML = (pct > 0 ? '<div class="stv-cw__bar"><div style="width:' + Math.max(6, Math.min(100, pct)) + '%"></div></div>' : '') + '<span></span>';
    f.lastChild.textContent = label;
    view.appendChild(f);
  }
  // Apple's order on Home: the banner, then "Up Next", then the rest. Done on Lampa's first batch of
  // rows before they are built (a handler put first), so the remote moves in the shown order.
  function homeOrder(e) {
    if (e.type !== 'init' || e.component !== 'main') return;
    var comp = e.object && e.object.activity && e.object.activity.component;
    if (!comp || typeof comp.use !== 'function') return;
    comp.use({ onBuild: function (rows) {
      try {
        if (!themeOn() || !rows || !rows.length) return;
        cwTitles();
        var hero = -1, cw = -1;
        rows.forEach(function (r, i) {
          if (r && r.params && r.params.createInstance && r.results && r.results[0] && r.results[0].title === HERO_MARK) hero = i;
          if (r && r.title && r.title === cwTitle) cw = i;
        });
        if (cw > 0) { var row = rows.splice(cw, 1)[0]; rows.splice(hero >= 0 ? (hero < cw ? hero + 1 : hero) : 0, 0, row); }
      } catch (x) { log(x && x.message); }
    } }, 0);
  }

  // ================= home: the hero banner =================
  // Slides: what is being watched (Lampa's history + timelines, a series with its next episode),
  // then TMDB's trending titles, the ones known to have a Ukrainian voice-over first. One TMDB call
  // per slide (details + logos), only for the slide shown and the next one.
  var ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l11.9-7.2a1 1 0 0 0 0-1.72L8.5 3.94A1 1 0 0 0 7 4.8z" fill="currentColor"/></svg>';
  var ICON_INFO = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 10.5v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="7.4" r="1.4" fill="currentColor"/></svg>';
  // sections: 'main' (Home: everything), 'movie', 'tv', 'anime' (the left menu's sections)
  function animeLike(d) {
    var a = false;
    (d.genre_ids || []).forEach(function (g) { if (g == 16) a = true; });
    (d.genres || []).forEach(function (g) { if (g && g.id == 16) a = true; });
    return a && (!d.original_language || /^(ja|zh|ko)$/.test(d.original_language));
  }
  function inSection(d, sec) {
    if (sec === 'main') return true;
    if (sec === 'anime') return animeLike(d);
    var g = /^(movie|tv)\/(\d+)$/.exec(sec);
    if (g) {   // a genre page (Cartoons, a genre from the Catalog): that kind with that genre
      var ids = d.genre_ids || (d.genres || []).map(function (x) { return x && x.id; });
      return kindOf(d) === g[1] && ids.indexOf(+g[2]) >= 0;
    }
    return kindOf(d) === sec && !animeLike(d);
  }
  // the banner as a row of Lampa's list (homeOrder finds it by the mark)
  var HERO_MARK = 'hero';
  function heroRow(sec) { return { title: '', results: [{ id: 1, title: HERO_MARK }], params: { createInstance: function () { return new Hero(sec); } } }; }
  var HERO_SRC = { main: 'trending/all/week', movie: 'trending/movie/week', tv: 'trending/tv/week',
    anime: 'discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc' };
  // TMDB's trending list is kept 30 min per section; «watching now» and the Ukrainian-first order are
  // local and cheap, so they are worked out on every call (a title just finished leaves at once). A
  // title keeps one entry, so its details fetched once (details(): item.src.full) stay with it.
  var heroCaches = {}, heroEntries = {};
  function heroItems(sec, cb) {
    var out = [], seen = {};
    function add(d, watching) {
      if (!d || !d.id || !d.backdrop_path) return;
      var key = kindOf(d) + d.id;
      if (seen[key]) return;
      seen[key] = 1;
      var x = heroEntries[key] || (heroEntries[key] = { d: d });
      x.watching = watching;
      out.push(x);
    }
    // 1. watching now
    try {
      var hist = (Lampa.Favorite.get({ type: 'history' }) || []).slice(0, 12), last = watchedLast();
      var n = 0;
      hist.forEach(function (d) {
        if (n >= 2 || !d || !inSection(d, sec)) return;
        var w = false;
        if (kindOf(d) === 'tv') {
          // one source for «watching» and the button's text: Autopilot when it is there (its button says
          // «Continue» exactly when it has an episode to go on with), else Lampa's online plugin
          var aa = autoApi('label');
          if (aa) { try { w = !!aa.label(d).season; } catch (e) { w = false; } }
          else w = anyWatched(d) || !!last[titleHash(d)];   // Lampa's timelines; its online plugin's mark too
        }
        else { var v = movieView(d); w = v.percent > 2 && v.percent < 90; }
        if (w) { add(d, true); n++; }
      });
    } catch (e) {}
    // 2. trending, Ukrainian voice-over first
    function fill(list) {
      if (window.snack_ua) list = list.filter(function (d) { return hasUa(d); }).concat(list.filter(function (d) { return !hasUa(d); }));
      list.forEach(function (d) { if (out.length < 6) add(d, false); });
      cb(out);
    }
    var hc = heroCaches[sec];
    if (hc && Date.now() - hc.at < 30 * 60000) return fill(hc.list);
    var gs = /^(movie|tv)\/(\d+)$/.exec(sec);
    tmdb(HERO_SRC[sec] || (gs ? 'discover/' + gs[1] + '?with_genres=' + gs[2] + '&sort_by=popularity.desc' : HERO_SRC.main), function (j) {
      var list = ((j && j.results) || []).filter(function (d) { return (!d.media_type || d.media_type === 'movie' || d.media_type === 'tv') && d.backdrop_path && !d.adult; });
      heroCaches[sec] = { list: list, at: Date.now() };
      fill(list);
    }, function () { cb(out); });
  }
  // a slide's full data (details + logos): one request per title — callers asking while it is on its
  // way wait for it, and the answer stays with the cached list (item.src) for the next Home
  function details(item, cb) {
    if (!item.full && item.src && item.src.full) item.full = item.src.full;
    if (item.full) return cb(item.full);
    if (item.wait) { item.wait.push(cb); return; }
    item.wait = [cb];
    var d = item.d, kind = kindOf(d), langs = logoLangs();
    function done(r) { var w = item.wait; item.wait = null; w.forEach(function (f) { f(r); }); }
    tmdb(kind + '/' + d.id + '?append_to_response=images&include_image_language=' + langs.join(',') + ',null', function (j) {
      if (j && j.id) {
        j.source = 'tmdb'; if (kind === 'tv') { j.original_title = j.original_name; }
        item.full = j; if (item.src) item.src.full = j;
        if (j.images && j.images.logos) logoCache().set(logoKey(j, langs), pickLogo(j.images.logos));
      }
      done(item.full || d);
    }, function () { done(d); });
  }
  function Hero(sec) {
    sec = sec || 'main';
    var self = this, items = [], idx = 0, timer = 0, touched = 0, alive = true, shownAt = 0, loaded = false;
    var el = document.createElement('div');
    el.className = 'stv-hero';
    el.innerHTML = '<div class="stv-hero__slides"></div><div class="stv-hero__scrim"></div>' +
      '<div class="stv-hero__info"><div class="stv-hero__title"></div><div class="stv-hero__meta"></div>' +
      '<div class="stv-hero__btns"><div class="stv-hero__btn stv-hero__btn--play selector">' + ICON_PLAY + '<span></span></div>' +
      '<div class="stv-hero__btn stv-hero__btn--round stv-hero__btn--info selector">' + ICON_INFO + '</div></div></div><div class="stv-hero__dots"></div>';
    var slides = el.firstChild, info = el.querySelector('.stv-hero__info'), dots = el.querySelector('.stv-hero__dots');
    var bPlay = el.querySelector('.stv-hero__btn--play'), bInfo = el.querySelector('.stv-hero__btn--info');
    rowBase(this, el);
    function cur() { return items[idx]; }
    function open(item) { var d = item.full || item.d; Lampa.Activity.push({ url: '', component: 'full', id: d.id, method: kindOf(d), card: d, source: 'tmdb' }); }
    function play(item) {
      var a = autoApi('press');
      details(item, function (d) {
        if (a) a.press(d, 'stv_hero'); else open(item);
      });
    }
    function bg(i) {
      var it = items[i];
      if (!it) return null;
      if (!it.img) {
        var box = document.createElement('div'); box.className = 'stv-hero__slide';
        var im = new Image(); im.alt = '';
        if (portrait() && it.d.poster_path) { im.src = img(it.full ? cleanPoster(it.full) : it.d.poster_path, tmdbSize('poster', window.innerWidth)); box.classList.add('stv-hero__slide--poster'); }
        else im.src = img(it.d.backdrop_path, tmdbSize('backdrop', window.innerWidth));
        box.appendChild(im); slides.appendChild(box); it.img = box;
      }
      return it.img;
    }
    function fill(item) {
      details(item, function (d) {
        if (item !== cur()) return;
        var t = info.querySelector('.stv-hero__title');
        t.className = 'stv-hero__title';
        t.textContent = d.title || d.name || '';
        titleLen(t, t.textContent);
        logoInto(t, d, tmdbSize('logo', T[M].logoW * k), null, null, function () { return alive && item === cur(); });
        var meta = [esc(kindLabel(d))];
        (d.genres || []).slice(0, 2).forEach(function (x) { meta.push(esc(capFirst(x.name))); });
        var y = yearOf(d); if (y) meta.push(esc(y));
        if (d.vote_average) meta.push('★ ' + (Math.round(d.vote_average * 10) / 10));
        info.querySelector('.stv-hero__meta').innerHTML = meta.join(' · ') + (hasUa(d) ? ' &nbsp;<span class="stv-badge stv-ua">UA</span>' : '');
        var label = tr('watch');
        try { var a = autoApi('label'); if (item.watching && a) label = a.label(d).text; } catch (e) {}
        bPlay.querySelector('span').textContent = se(label);
        info.classList.remove('fade');
      });
    }
    function show(i, now) {
      if (!items.length) return;
      idx = (i + items.length) % items.length;
      var s = bg(idx);
      Array.prototype.forEach.call(slides.children, function (x) { x.classList.toggle('on', x === s); });
      Array.prototype.forEach.call(dots.children, function (x, j) { x.classList.toggle('on', j === idx); });
      if (now) fill(cur());
      else { info.classList.add('fade'); setTimeout(function () { fill(cur()); }, 300); }
      shownAt = Date.now();
      trailer();
      // the next slide's picture, ahead of time (after its details: phones take the art without text)
      var nx = (idx + 1) % items.length;
      details(items[nx], function () { if (alive) bg(nx); });
    }
    // a muted trailer behind the slide (iPad / browsers; the «Трейлеры» plugin plays it)
    var trailerFor = null, trailerTimer = 0;
    function trailer() {
      clearTimeout(trailerTimer);
      var api = window.alc_trailers_api;
      if (trailerFor) { trailerFor = null; try { if (api) api.stop(); } catch (e) {} }
      if (!api || !api.bg) return;   // alc_trailers decides whether (its setting, and lite() via snack_tv.trailers)
      var it = cur();
      trailerTimer = setTimeout(function () {
        if (it !== cur() || !it.img || !vis()) return;
        details(it, function (d) {
          if (it !== cur()) return;
          trailerFor = it;
          api.bg(it.img, d, function () { return alive && trailerFor === it && it === cur() && vis(); });
        });
      }, 2500);
    }
    function vis() { return inDoc(el) && $(el).closest('.activity--active').length && !document.hidden; }
    function tick() {
      if (!alive) return;
      // a slide with its trailer stays longer
      if (trailerFor && trailerFor === cur() && Date.now() - shownAt < 45000) return;
      var busy = Date.now() - touched < 8000;
      try { busy = busy || Lampa.Player.opened(); } catch (e) {}
      if (vis() && !busy && items.length > 1) show(idx + 1);
    }
    function poke() { touched = Date.now(); }
    this.create = function () {
      setTimeout(function () { var act = $(el).closest('.activity'); if (act.length) act.addClass('stv-home'); }, 0);
      heroItems(sec, function (list) {
        if (!alive) return;
        // own copies: the list is cached for other Home pages, the slide boxes belong to this one
        items = list.map(function (x) { return { d: x.d, watching: x.watching, full: x.full, src: x }; });
        loaded = true;
        if (!items.length) { el.style.display = 'none'; return; }
        var act = $(el).closest('.activity');
        if (act.length) act.addClass('stv-home');
        dots.innerHTML = items.map(function () { return '<div class="stv-hero__dot"></div>'; }).join('');
        if (portrait()) details(items[0], function () { if (alive) show(0, true); });
        else show(0, true);
        timer = setInterval(tick, 8000);
      });
      $(bPlay).on('hover:enter', function () { poke(); if (cur()) play(cur()); });
      $(bInfo).on('hover:enter', function () { poke(); if (cur()) open(cur()); });
      $([bPlay, bInfo]).on('hover:focus', function () { poke(); self.emit('active'); });
      // iPad: a tap on the picture opens the title, a swipe changes the slide
      var x0 = null, y0 = 0;
      el.addEventListener('touchstart', function (e) { poke(); x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      el.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
        x0 = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(idx + (dx < 0 ? 1 : -1));
      }, { passive: true });
      slides.addEventListener('click', function () { if (cur()) open(cur()); });
    };
    this.toggle = function () {
      // nothing to show (TMDB down, nothing watched) or the theme was switched off: the next row
      if ((loaded && !items.length) || !themeOn()) { setTimeout(function () { self.emit(lastDir === 'up' ? 'up' : 'down'); }, 0); return; }
      poke();
      Lampa.Controller.add('stv_hero', {
        link: self,
        toggle: function () { Lampa.Controller.collectionSet(el); Lampa.Controller.collectionFocus(bPlay, el); self.emit('toggle'); self.emit('active'); },
        right: function () { poke(); if (Navigator.canmove('right')) Navigator.move('right'); else show(idx + 1); },
        left: function () { poke(); if (Navigator.canmove('left')) Navigator.move('left'); else self.emit('left'); },
        up: function () { self.emit('up'); },
        down: function () { self.emit('down'); },
        back: function () { self.emit('back'); }
      });
      Lampa.Controller.toggle('stv_hero');
    };
    this.destroy = function () { alive = false; clearInterval(timer); clearTimeout(trailerTimer); try { if (trailerFor && window.alc_trailers_api) window.alc_trailers_api.stop(); } catch (e) {} if (el.parentNode) el.parentNode.removeChild(el); };
  }
  // which banner a page gets: Home, Movies / Series / Anime from the left menu, genre pages
  function heroSection(component, o) {
    if (component === 'main') return 'main';
    if (component === 'category' && !o.genres && !o.keywords && /^(movie|tv|anime)$/.test(o.url || '')) return o.url;
    // a genre page (Cartoons in the menu, a genre from the Catalog): a banner of that genre, as Apple's genre pages
    if (component === 'category' && !o.keywords && /^(movie|tv)$/.test(o.url || '') && /^\d+$/.test(String(o.genres || ''))) return o.url + '/' + o.genres;
    return '';
  }
  function addHeroRow() {
    try {
      if (!Lampa.ContentRows || !Lampa.ContentRows.add) return;
      Lampa.ContentRows.add({
        name: 'stv_hero', title: tr('name'), index: 0, screen: ['main', 'category'],
        call: function (params, screen) {
          if (started ? !themeOn() : !themeWanted()) return null;
          var sec = heroSection(screen === 'category' ? 'category' : 'main', params || {});
          if (!sec) return null;
          return function (call) { call(heroRow(sec)); };
        }
      });
    } catch (e) { log(e && e.message); }
  }
  // Lampa adds no extra rows to genre pages (its own stop list): the banner goes in front of the
  // first batch of rows the source hands the page
  function genreHero() {
    try {
      ['tmdb', 'cub'].forEach(function (name) {
        var src = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources[name];
        if (!src || typeof src.category !== 'function' || src.category.stv) return;
        var orig = src.category;
        src.category = function (params, oncomplite, onerror) {
          var sec = '';
          try { if (themeOn() && params && params.genres) sec = heroSection('category', params); } catch (e) {}
          if (!sec || typeof oncomplite !== 'function') return orig.apply(this, arguments);
          var first = true;
          return orig.call(this, params, function (data) {
            if (first && data && data.unshift) { first = false; data.unshift(heroRow(sec)); }
            oncomplite.apply(this, arguments);
          }, onerror);
        };
        src.category.stv = true;
      });
    } catch (e) { log(e && e.message); }
  }

  // ================= the person page: Apple's header =================
  // A wide band of the portrait blurred, the round portrait on it, the name and the biography (4 lines,
  // «more» opens it). Lampa builds the header after its request: looked for a moment later
  function themePerson(act, tries) {
    tries = tries || 0;
    var render = act && act.activity && act.activity.render && act.activity.render();
    var start = render && render.find('.person-start').first();
    if (!start || !start.length) { if (tries < 25) setTimeout(function () { themePerson(act, tries + 1); }, 200); return; }
    if (start.hasClass('stv-pstart')) return;
    start.addClass('stv-pstart');
    render.addClass('stv-person');
    var src = start.find('.person-start__img').attr('src') || '';
    if (src) {
      var band = document.createElement('div');
      band.className = 'stv-pband';
      band.style.backgroundImage = 'url(' + resized(src, 'w185') + ')';
      start.prepend(band);
    }
    var id = act.id || (act.card && act.card.id);
    if (!id) return;
    var bio = function (text) {   // text: plainText already
      if (!text || start.find('.stv-desc').length) return;
      var el = $('<div class="stv-desc stv-pbio"><div class="stv-desc__text"></div><div class="stv-desc__more"></div></div>');
      el.find('.stv-desc__text').text(text);
      el.find('.stv-desc__more').text(tr('more'));
      if (text.length > (M === 'tv' ? 300 : 240)) el.addClass('long');
      el.on('click', function () { el.toggleClass('open'); el.find('.stv-desc__more').text(el.hasClass('open') ? tr('less') : tr('more')); });
      start.find('.person-start__name').after(el);
    };
    tmdb('person/' + id, function (j) {
      var text = plainText(j && j.biography);
      if (text) bio(text);
      else tmdb('person/' + id, function (e) { bio(plainText(e && e.biography)); }, null, 'en-US');
    });
  }

  // ================= People (the left menu): a grid of round portraits =================
  // Apple TV has no people browse page; the closest is «Cast & Crew — See All»: circles, the name, a line
  // under it. The grid is Lampa's own (the class of «See all» pages, with its paging and remote): TMDB's
  // popular people, a tap opens Lampa's person page. Theme off (or an older Lampa): Lampa's own section.
  function peopleData(j) {
    // as Lampa's own section: actors and directors with a portrait; and a name readable in the interface
    // script (TMDB gives the native name when it has none in the language: 金城武 for a Russian interface)
    // (readable: Latin and Cyrillic letters only — CJK, Indic, Thai… would be boxes or unreadable here)
    function readable(x) { return !!x && !/[^\u0000-\u024F\u0400-\u04FF\u2000-\u206F\u2116]/.test(x); }
    var list = ((j && j.results) || []).filter(function (p) {
      return p && p.id && p.profile_path && !p.adult && /^(Acting|Directing)$/.test(p.known_for_department || '') && readable(p.name);
    });
    list.forEach(function (p) {
      p.source = 'tmdb';
      p.stv_known = (p.known_for || []).map(function (k) { return k.title || k.name || ''; }).filter(readable).slice(0, 2).join(', ');
    });
    return { results: list, page: j && j.page, total_pages: Math.min((j && j.total_pages) || 1, 50) };
  }
  function PeopleGrid(object) {
    var mod = Lampa.Maker.module('Category'), page = 1;
    var comp = Lampa.Utils.createInstance(Lampa.Maker.get('Category', object), object, { module: mod.MASK.base | mod.MASK.Pagination });
    function load(n, ok, fail) { tmdb('person/popular?page=' + n, function (j) { ok(peopleData(j)); }, fail); }
    comp.use({
      onCreate: function () {
        var self = this;
        try { object.activity.render().addClass('stv-people'); } catch (e) {}
        load(1, function (d) { if (d.results.length) self.build(d); else self.empty(); }, function () { self.empty(); });
      },
      onNext: function (resolve, reject) { var self = this; page++; load(page, function (d) { resolve.call(self, d); }, function () { reject.call(self); }); },
      onInstance: function (item, data) {
        item.use({ onEnter: function () { Lampa.Activity.push({ url: '', title: data.name, component: 'actor', id: data.id, source: 'tmdb' }); } });
        // «known for» under the name: the card's element exists once Lampa has built it
        function known() {
          try {
            var el = item.render && item.render(true);
            if (!el || !data.stv_known || el.querySelector('.stv-known')) return !!el;
            var k = document.createElement('div'); k.className = 'stv-known'; k.textContent = data.stv_known; el.appendChild(k);
            return true;
          } catch (e) { return true; }
        }
        if (!known()) setTimeout(known, 0);
      }
    });
    return comp;
  }

  // ================= Schedule (the left menu): new episodes of the bookmarked series =================
  // Lampa's page is a 30-day calendar, one cell per day, most of them empty. Apple TV has no calendar;
  // here what is coming is Apple's episode cards grouped by day («Today», «Tomorrow», «Friday, 10
  // October»), then what came out in the last two weeks. Lampa's own data (TimeTable: the season on air
  // of every bookmarked series, from TMDB). Nothing there: how to fill it.
  var SCHED_AHEAD = 30, SCHED_BACK = 14, DAY_MS = 864e5;
  function scheduleData() {
    var cards = [], byId = {}, days = {}, out = { tracked: 0, days: [], recent: [] };
    try { cards = Lampa.Favorite.full().card || []; } catch (e) {}
    try { if (Lampa.Account.Permit.sync) cards = Lampa.Account.Bookmarks.all() || cards; } catch (e) {}
    cards.forEach(function (c) { if (c && c.id) byId[c.id] = c; });
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    ((Lampa.TimeTable && Lampa.TimeTable.all()) || []).forEach(function (row) {
      var card = row && byId[row.id], seen = {};
      if (!card) return;
      out.tracked++;
      (row.episodes || []).concat(row.next ? [row.next] : []).forEach(function (ep) {
        var key = ep && ep.season_number + ':' + ep.episode_number;
        if (!ep || !ep.air_date || seen[key]) return;
        seen[key] = 1;
        var d = Math.round((Lampa.Utils.parseToDate(ep.air_date).getTime() - today.getTime()) / DAY_MS), it = { card: card, ep: ep, d: d };
        if (d >= 0 && d < SCHED_AHEAD) (days[d] = days[d] || []).push(it);
        else if (d < 0 && d >= -SCHED_BACK) out.recent.push(it);
      });
    });
    var byName = function (a, b) { return String(a.card.name || '').localeCompare(String(b.card.name || '')); };
    Object.keys(days).map(Number).sort(function (a, b) { return a - b; }).forEach(function (d) { out.days.push({ d: d, items: days[d].sort(byName) }); });
    out.recent.sort(function (a, b) { return b.d - a.d || byName(a, b); });
    return out;
  }
  function dayTitle(d, date) {
    if (d === 0) return tr('today');
    if (d === 1) return tr('tomorrow');
    var p = Lampa.Utils.parseTime(date), w = String(p.week || '');
    return (w ? w.charAt(0).toUpperCase() + w.slice(1) + ', ' : '') + String(p.full).toLowerCase();
  }
  function Schedule(object) {
    var self = this, last = null;
    var scroll = new Lampa.Scroll({ mask: false, over: true, step: 300 });
    var html = $('<div class="stv-tt"></div>'), body = $('<div class="stv-tt__body"></div>');
    function open(card) { Lampa.Activity.push({ url: '', component: 'full', id: card.id, method: 'tv', card: card, source: card.source || 'tmdb' }); }
    function focusable(el) {
      $(el).on('hover:focus', function () { last = el; scroll.update($(el), true); })
        .on('hover:hover', function () { last = el; try { Navigator.focused(el); } catch (e) {} });
      return el;
    }
    // a card: the still (the series' backdrop until TMDB has one), «S2 · E5», the series, the episode
    function card(it, aired) {
      var ep = it.ep, m = it.card, s = ep.season_number, n = ep.episode_number;
      var name = goodName(ep.name, uiScript()) ? ep.name : '';
      var el = epCard({ still: ep.still_path || m.backdrop_path, cap: tr('se_ep', s, n), name: m.name || m.title, descr: name,
        time: n === 1 ? tr('premiere', s) : '', pct: aired ? epView(m, s, n).percent : 0 });
      // out already: play it (Autopilot); coming: the series' page
      $(focusable(el)).on('hover:enter', function () {
        var a = aired && autoApi('playEpisode');
        if (a) a.playEpisode(m, s, n); else open(m);   // a cancel returns to the focused controller
      });
      loadImg(el);
      return el;
    }
    function section(title, sub, items, aired) {
      body.append($('<div class="stv-tt__day"></div>').text(title).append(sub ? $('<span></span>').text(sub) : ''));
      var grid = $('<div class="stv-tt__grid"></div>');
      items.forEach(function (it) { grid.append(card(it, aired)); });
      body.append(grid);
    }
    function empty(data) {
      var list = Lampa.Lang.translate('settings_input_links');
      var box = $('<div class="stv-tt__empty"><div class="stv-tt__icon"></div><div class="stv-tt__etitle"></div><div class="stv-tt__etext"></div></div>');
      box.find('.stv-tt__icon').html(CAL);
      box.find('.stv-tt__etitle').text(data.tracked ? tr('tt_none') : tr('tt_empty'));
      var others = ['title_look', 'title_wath', 'title_like'].map(function (x) { return '«' + Lampa.Lang.translate(x) + '»'; }).join(', ');
      box.find('.stv-tt__etext').text(data.tracked ? tr('tt_none_d', data.tracked) : tr('tt_empty_d', list, others));
      if (!data.tracked) {
        var btn = $('<div class="stv-tt__btn selector"></div>').text(tr('tt_open', list));
        $(focusable(btn[0])).on('hover:enter', function () {
          try { Lampa.Router.call('bookmarks', { title: list }); } catch (e) { Lampa.Activity.push({ url: '', title: list, component: 'bookmarks', page: 1 }); }
        });
        box.append(btn);
      }
      body.append(box);
    }
    this.create = function () {
      var data = { tracked: 0, days: [], recent: [] }, now = new Date();
      try { data = scheduleData(); } catch (e) { log(e && e.message); }
      body.append($('<div class="stv-tt__head"></div>').append($('<div class="stv-tt__title"></div>').text(object.title || tr('tt_title')),
        $('<div class="stv-tt__sub"></div>').text(tr('tt_sub'))));
      data.days.forEach(function (g) {
        var date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + g.d);
        section(dayTitle(g.d, date), g.d > 1 ? tr('in_days', g.d) : '', g.items, g.d === 0);
      });
      if (data.recent.length) section(tr('tt_recent'), '', data.recent.slice(0, 24), true);
      if (!data.days.length && !data.recent.length) empty(data);
      scroll.minus();
      scroll.append(body);
      html.append(scroll.render());
      this.activity.loader(false);
      this.activity.toggle();
      return this.render();
    };
    // up / down: the nearest card of the row above / below, even when nothing sits straight under the
    // focus (a day of one card under a day of three; Lampa's Navigator stays put then)
    function vertical(dir) {
      if (!last || !inDoc(last)) return false;
      var r = last.getBoundingClientRect(), best = null, score = Infinity;
      body.find('.selector').each(function () {
        var q = this.getBoundingClientRect(), dy = dir > 0 ? q.top - r.bottom : r.top - q.bottom;
        if (this === last || dy < -2) return;
        var sc = dy * 3 + Math.abs(q.left - r.left);
        if (sc < score) { score = sc; best = this; }
      });
      if (best) Lampa.Controller.collectionFocus(best, scroll.render());
      return !!best;
    }
    this.start = function () {
      var N = window.Navigator, C = Lampa.Controller;
      C.add('content', {
        link: self,
        toggle: function () { C.collectionSet(scroll.render()); C.collectionFocus(last || false, scroll.render()); },
        left: function () { if (N.canmove('left')) N.move('left'); else C.toggle('menu'); },
        right: function () { N.move('right'); },
        up: function () { if (!vertical(-1)) C.toggle('head'); },
        down: function () { vertical(1); },
        back: function () { Lampa.Activity.backward(); }
      });
      C.toggle('content');
    };
    this.pause = function () {};
    this.stop = function () {};
    this.render = function () { return html; };
    this.destroy = function () { scroll.destroy(); html.remove(); };
  }
  var CAL = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4.5" width="18" height="16.5" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="14" r="1.2" fill="currentColor"/><circle cx="12" cy="14" r="1.2" fill="currentColor"/><circle cx="16" cy="14" r="1.2" fill="currentColor"/></svg>';

  // a section of the left menu the theme draws its own way while it is on (People, Schedule); theme off
  // (or the page fails to build): Lampa's own
  var lampaSections = {};
  function hookSection(name, make) {
    try {
      if (lampaSections[name] || !Lampa.Component || !Lampa.Component.get) return;
      var own = Lampa.Component.get(name);
      if (typeof own !== 'function') return;
      lampaSections[name] = own;
      Lampa.Component.add(name, function (object) {
        if (themeOn()) try { return make(object); } catch (e) { log(e && e.message); }
        return new own(object);
      });
    } catch (e) { log(e && e.message); }
  }

  // ---------- the pack's settings folders (the same block in every plugin of the pack) ----------
  // Lampa lists a folder's items in the order plugins added them, and the pack's plugins load in any
  // order. Here each item names its group and its place in it; when Lampa draws a folder (it reads the
  // list through getParam every time) the list comes in that order, an item whose snack_show() says no
  // is left out, and a group with nothing left loses its title. «Закусь», the pack's own folder, is a
  // menu of sub-folders (Lampa components hidden from Settings' own list, opened from «Закусь» with
  // Back leading to it): items are still added to «Закусь» with a group, and the group decides the
  // sub-folder they are drawn in (copies of an older block, loaded first, keep working the same way).
  // Its last group, «О паке», lists the installed plugins' versions and resets the pack's options (not
  // the data: favourite voices, subscriptions…). The newest copy of this block serves all.
  var PACKSET_V = 5;
  function packSettings() {
    var S = window.snack_set;
    if (S && S.v >= PACKSET_V) return S;
    var api = Lampa.SettingsApi, old = S || {};
    function L(a) { var l = 'ru'; try { l = String(Lampa.Storage.get('language', 'ru') || 'ru'); } catch (e) {} return a[l === 'uk' ? 1 : l === 'ru' || l === 'be' ? 0 : 2]; }
    var TXT = {
      about: ['О паке', 'Про пак', 'About the pack'], versions: ['Версии', 'Версії', 'Versions'],
      reset: ['Сбросить настройки', 'Скинути налаштування', 'Reset settings'],
      reset_d: ['Все пункты «Закуси», кроме ваших данных (озвучки, подписки) и адреса сервера', 'Усі пункти «Закусі», крім ваших даних (озвучення, підписки) й адреси сервера', 'Every «Закусь» option, not your data (voices, subscriptions) nor the server address'],
      reset_q: ['Сбросить настройки «Закуси»?', 'Скинути налаштування «Закусі»?', 'Reset the «Закусь» settings?'],
      yes: ['Сбросить', 'Скинути', 'Reset'], no: ['Отмена', 'Скасувати', 'Cancel'],
      watch: ['Просмотр', 'Перегляд', 'Watching'],
      watch_d: ['Автопилот: запуск, озвучки, источники', 'Автопілот: запуск, озвучення, джерела', 'Autopilot: playback, voices, sources'],
      langs: ['Языки и субтитры', 'Мови й субтитри', 'Languages and subtitles'],
      langs_d: ['Порядок языков озвучки и субтитров', 'Порядок мов озвучення й субтитрів', 'The order of voice and subtitle languages'],
      cards: ['Главная и карточки', 'Головна й картки', 'Home and cards'],
      cards_d: ['Метка UA, трейлеры, фильтр ленты', 'Мітка UA, трейлери, фільтр стрічки', 'UA badge, trailers, feed filter'],
      feed: ['Фильтр ленты', 'Фільтр стрічки', 'Feed filter'],
      feed_d: ['Что прятать в лентах TMDB и CUB', 'Що ховати у стрічках TMDB і CUB', 'What to hide from the TMDB and CUB lists'],
      subs: ['Подписки', 'Підписки', 'Subscriptions'],
      subs_d: ['Новые серии в выбранной озвучке', 'Нові серії в обраному озвученні', 'New episodes in a chosen voice'],
      server: ['Сервер', 'Сервер', 'Server'],
      server_d: ['Ваш сервер с онлайн-источниками', 'Ваш сервер з онлайн-джерелами', 'Your server with online sources']
    };
    S = window.snack_set = { v: PACKSET_V, pages: old.pages || {}, versions: old.versions || {}, seq: old.seq || 0, titled: old.titled || {}, txt: function (k) { return L(TXT[k] || [k, k, k]); } };
    // the sub-folders of «Закусь»: the groups drawn in them, their parent, their place in it
    var SUBS = [
      { id: 'snack_watch', group: 'watch', parent: 'snack', o: 10 },
      { id: 'snack_langs', group: 'langs', parent: 'snack', o: 20 },
      { id: 'snack_cards', group: 'cards', parent: 'snack', o: 30 },
      { id: 'snack_feed', group: 'feed', parent: 'snack_cards', o: 900 },
      { id: 'snack_subs', group: 'subs', parent: 'snack', o: 40 },
      { id: 'snack_server', group: 'server', parent: 'snack', o: 50, keep: true }   // keep: the viewer's own (reset leaves it)
    ];
    S.subs = SUBS;
    S.subId = {}; S.subGroup = {};
    SUBS.forEach(function (s) { S.subId[s.id] = s; S.subGroup[s.group] = s; });
    // a plugin may say what its sub-folder holds now (its button's line): S.describe(group, fn → text)
    S.descr = old.descr || {};
    S.describe = function (group, fn) { S.descr[group] = fn; };
    function subOf(group) { return S.subGroup[group] || null; }
    function subById(id) { return S.subId[id] || null; }
    if (!api.snack_get) {
      var get = api.getParam;
      api.snack_get = get;
      api.getParam = function (name) { var list = get.apply(this, arguments); try { return window.snack_set.list(name, list); } catch (e) { return list; } };
    }
    // the sub-folders are not in Settings' own list (they open from «Закусь»)
    if (!api.snack_all) {
      var all = api.allComponents;
      api.snack_all = all;
      api.allComponents = function () {
        var c = all.apply(this, arguments), out = {}, ids = (window.snack_set && window.snack_set.subId) || {};
        for (var k in c) if (!ids[k]) out[k] = c[k];
        return out;
      };
    }
    function visible(d) {
      if (d.snack_title) return true;
      try { return !d.snack_show || !!d.snack_show(); } catch (e) { return true; }
    }
    function seq(d) { if (d.snack_i === undefined) d.snack_i = ++S.seq; }
    function byPlace(a, b) { return (a.snack_o || 0) - (b.snack_o || 0) || a.snack_i - b.snack_i; }
    function inSub(d, group) { return d.snack_g === group && !d.snack_title; }
    // a sub-folder has something to show (its button is listed): the first shown item is enough
    function anyShown(group) {
      var l = api.snack_get('snack') || [];
      for (var i = 0; i < l.length; i++) if (inSub(l[i], group) && visible(l[i])) return true;
      return false;
    }
    // the list Lampa draws: shown items, by group, place, then the order they came in. «Закусь»: the
    // groups of the sub-folders leave it (their buttons stay); a sub-folder: the items of its group
    S.list = function (name, list) {
      var sub = subById(name);
      if (sub) {
        list = (api.snack_get('snack') || []).filter(function (d) { return inSub(d, sub.group); });
        list.forEach(seq);
        return list.filter(visible).sort(byPlace);
      }
      var pg = S.pages[name];
      if (!pg || !list) return list;
      if (name === 'snack') list = list.filter(function (d) { return !subOf(d.snack_g); });
      var rank = {}, used = {};
      pg.groups.forEach(function (g, i) { rank[g.id] = i; });
      var out = list.filter(function (d) {
        seq(d);
        if (d.snack_title) return true;
        var ok = visible(d);
        if (ok) used[d.snack_g] = 1;
        return ok;
      }).filter(function (d) { return !d.snack_title || used[d.snack_title]; });
      function r(d) { return d.snack_g === undefined ? pg.legacy : rank[d.snack_g] !== undefined ? rank[d.snack_g] : 99; }
      return out.sort(function (a, b) { return r(a) - r(b) || byPlace(a, b); });
    };
    // a folder: groups [{id, title}] in order; items of plugins that know no groups (an older copy of
    // this block) go at `legacy` (a group's index, may be fractional)
    S.page = function (id, def) {
      if (S.pages[id]) return S.pages[id];
      S.pages[id] = { groups: def.groups, legacy: def.legacy || 0 };
      api.addComponent({ component: id, name: def.name, icon: def.icon });
      return S.pages[id];
    };
    // an item: Lampa's addParam data, plus its group and place (snack_show: when to list it)
    S.add = function (id, group, order, data) {
      var pg = S.pages[id], g = pg && pg.groups.filter(function (x) { return x.id === group; })[0];
      if (g && g.title && !S.titled[id + '|' + group]) {
        S.titled[id + '|' + group] = 1;
        api.addParam({ component: id, param: { name: 'snack_t_' + id + '_' + group, type: 'title' }, field: { name: g.title }, snack_g: group, snack_o: -1e9, snack_title: group });
      }
      data.component = id;
      data.snack_g = group;
      data.snack_o = order;
      api.addParam(data);
    };
    // open a folder of the pack; a sub-folder's Back leads to its parent (also after Lampa redraws it),
    // the focus on the button of the sub-folder left (focus: an item's name)
    function focusIndex(id, name) {
      if (!name) return 0;
      var list = S.list(id, api.snack_get(id) || []) || [], i = 0, at = -1;
      list.forEach(function (d) { var t = d.param && d.param.type; if (t === 'title' || t === 'static') return; if (d.param.name === name) at = i; i++; });
      return at > 0 ? at : 0;
    }
    S.backTo = function (sub) { return function () { window.snack_set.open(sub.parent, 'snack_open_' + sub.group); }; };
    S.open = function (id, focus) {
      var sub = subById(id), params = {};
      if (sub) params.onBack = S.backTo(sub);
      var at = focusIndex(id, focus);
      if (at) params.last_index = at;
      Lampa.Settings.create(id, params);
    };
    // Lampa redraws a folder (Settings.update) without the params it was opened with: Back put back
    if (!api.snack_back) try {
      api.snack_back = true;
      Lampa.Settings.listener.follow('open', function (e) {
        var T = window.snack_set, s = e && T && T.subId && T.subId[e.name];
        if (s && e.params && !e.params.onBack) e.params.onBack = T.backTo(s);
      });
    } catch (e) {}
    // reset the pack's options (triggers, lists, fields of «Закусь» and its sub-folders) to their
    // defaults, after a question
    S.reset = function (id, done) {
      var back = function () { try { Lampa.Controller.toggle('settings_component'); } catch (e) {} };
      Lampa.Select.show({
        title: S.txt('reset_q'), items: [{ title: S.txt('yes'), yes: true }, { title: S.txt('no') }],
        onSelect: function (a) {
          back();
          if (!a.yes) return;
          (api.snack_get(id) || []).forEach(function (d) {
            var p = d.param || {}, sub = subOf(d.snack_g);
            if (sub && sub.keep) return;   // the viewer's own (the server address), like their data
            if (/^(trigger|select|input)$/.test(p.type) && p['default'] !== undefined) try { Lampa.Storage.set(p.name, p['default']); } catch (e) {}
          });
          try { if (done) done(); } catch (e) {}
          setTimeout(function () { try { Lampa.Settings.update(); } catch (e) {} }, 0);
        },
        onBack: back
      });
    };
    // «Закусь»: created by whichever plugin of the pack comes first; its sub-folders and their buttons
    S.version = function (name, v) { S.versions[name] = v; };
    var ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16l-2 16H6L4 4zm2.3 2 .3 2.5h10.8l.3-2.5H6.3z" fill="#fff"/></svg>';
    S.pack = function () {
      if (S.pages.snack && S.pages.snack.v2) return 'snack';
      window.snack_settings = true;   // older copies: the folder is there
      var made = !!S.pages.snack;
      S.pages.snack = { v2: true, groups: [{ id: 'menu' }, { id: 'about', title: S.txt('about') }], legacy: 0.5 };
      if (!made) api.addComponent({ component: 'snack', name: 'Закусь', icon: ICON });
      SUBS.forEach(function (s) {
        api.addComponent({ component: s.id, name: S.txt(s.group), icon: ICON });
        // the button: in «Закусь» (group menu) or, for a sub-folder of a sub-folder, in its parent's group
        var parent = subById(s.parent);
        S.add('snack', parent ? parent.group : 'menu', s.o, {
          param: { name: 'snack_open_' + s.group, type: 'button' }, field: { name: S.txt(s.group), description: S.txt(s.group + '_d') },
          snack_show: function () { return anyShown(s.group); },
          onRender: function (item) {
            var f = window.snack_set.descr[s.group], t = '';
            try { t = f ? f() : ''; } catch (e) {}
            if (t) item.find('.settings-param__descr').text(t);
          },
          onChange: function () { S.open(s.id); } });
      });
      var have = {};
      try { have = adopt(); } catch (e) {}
      if (!have.snack_versions) S.add('snack', 'about', 80, { param: { name: 'snack_versions', type: 'static' }, field: { name: S.txt('versions'), description: ' ' },
        onRender: function (item) {
          var v = window.snack_set.versions, list = Object.keys(v).sort().map(function (k) { return k + ' ' + v[k]; });
          item.find('.settings-param__descr').text(list.join(' · '));
        } });
      if (!have.snack_reset) S.add('snack', 'about', 90, { param: { name: 'snack_reset', type: 'button' }, field: { name: S.txt('reset'), description: S.txt('reset_d') },
        onChange: function () { window.snack_set.reset('snack'); } });
      return 'snack';
    };
    // «О паке» items an older copy added: kept (no second one), its reset button says what reset does now
    function adopt() {
      var have = {};
      (api.snack_get('snack') || []).forEach(function (d) {
        if (!d.param) return;
        have[d.param.name] = 1;
        if (d.param.name === 'snack_reset' && d.field) d.field.description = S.txt('reset_d');
      });
      return have;
    }
    // an older copy made «Закусь» already: take it over
    if (window.snack_settings && !(S.pages.snack && S.pages.snack.v2)) { delete window.snack_settings; S.pack(); }
    else try { adopt(); } catch (e) {}
    return S;
  }

  // ---------- the «Торренты» page: a release as one Apple list row ----------
  // Lampa draws a release as its whole title, a cloud of tags (resolution, every audio track, subtitles)
  // and a line of numbers. The row here: the quality pills, a short name (release type, resolution,
  // season), the size and the seeders on the right; under it the voices short (Ukrainian first, the
  // rest counted), the sound, the bitrate; then the tracker and the date. Lampa's parts stay in the row
  // (hidden: its marks and filters keep working); the full title is in the long-press menu.
  var REL_NAMES = { bdremux: 'BDRemux', remux: 'Remux', bdrip: 'BDRip', bluray: 'Blu-ray', 'blu-ray': 'Blu-ray', blueray: 'Blu-ray', 'blue-ray': 'Blu-ray', 'web-dl': 'WEB-DL', webdl: 'WEB-DL',
    'web-dlrip': 'WEB-DLRip', webrip: 'WEBRip', hdrip: 'HDRip', hdtvrip: 'HDTVRip', hdtv: 'HDTV', dvdrip: 'DVDRip', tvrip: 'TVRip', satrip: 'SATRip', camrip: 'CAMRip' };
  var REL = /(?:^|[^a-z])(bdremux|remux|bdrip|blue?-?ray|web-?dl(?:rip)?|webrip|hdtvrip|hdrip|hdtv|dvdrip|tvrip|satrip|camrip)(?![a-z])/i;
  var RES = /(?:^|[^\d])(2160|1080|720|576|480)[pрi]/i;
  var SEASON = /(?:сезон[ыи]?|season|сезони)\s*:?\s*(\d+(?:\s*[-–]\s*\d+)?)|\bS(\d{1,2})(?:E\d+)?\b/i;
  function torName(title) {
    var t = String(title || ''), m = REL.exec(t), r = RES.exec(t), sn = SEASON.exec(t), out = [];
    if (m) out.push(REL_NAMES[m[1].toLowerCase()] || m[1]);
    if (r) out.push(r[1] + 'p');   // (the pill says 4K / FHD; the name the exact lines)
    if (/(?:^|[^a-z])(?:hevc|[hx]\.?265)(?![a-z0-9])/i.test(t)) out.push('HEVC');
    if (sn) out.push(tr('tor_season', String(sn[1] || +sn[2]).replace(/\s+/g, '')));
    if (out.length) return out.join(' · ');
    // nothing known: the title's first part (before « / » or «[»)
    return t.split(/\s\/\s|\[/)[0].trim() || t;
  }
  // Lampa's ffprobe pills (<div class="m-resolution|m-audio|m-channels|…">text</div>), by kind
  function torPills(item) {
    var out = { resolution: [], audio: [], channels: [] };
    item.find('.torrent-item__ffprobe > *').each(function () {
      var k = /(?:^|\s)m-(\w+)/.exec(this.className), x = $(this).text().trim();
      if (k && out[k[1]] && x) out[k[1]].push(x);
    });
    return out;
  }
  // the voices short (a: the audio pills): Ukrainian tracks first, two shown, the rest as «+N»; without a
  // track list, the title's tail after its last «]» (rutracker writes the voices there)
  function torVoices(a, title) {
    if (!a.length) { var tail = String(title || '').split(']').pop().replace(/^[\s|,]+/, '').trim(); return tail.length > 60 ? tail.slice(0, 58) + '…' : tail; }
    var ua = a.filter(function (x) { return /^ukr|укр/i.test(x); }), rest = a.filter(function (x) { return ua.indexOf(x) < 0; });
    var list = ua.concat(rest), shown = list.slice(0, 2).join(', ');
    return list.length > 2 ? shown + ' +' + (list.length - 2) : shown;
  }
  function torRow(element, item) {
    if (!item || !item.length || item.hasClass('stv-tor-on')) return;
    // the fields Lampa prepared on the element (title, size, tracker, date, bitrate, seeds); its markup only
    // where one is missing. The pills are Lampa's own reading of ffprobe (its markup)
    var txt = function (v, sel) { v = v === undefined || v === null ? '' : String(v).trim(); return v || item.find(sel).text().trim(); };
    var title = element.title || element.Title || item.find('.torrent-item__title').text(), pills = torPills(item), q = pills.resolution;
    var seeds = parseInt(element.seeds !== undefined ? element.seeds : element.Seeders, 10) || 0, size = txt(element.size, '.torrent-item__size');
    var br = parseFloat(element.bitrate) > 0 ? element.bitrate + ' ' + Lampa.Lang.translate('torrent_item_mb') : item.find('.torrent-item__bitrate span').text().trim();
    var sub = [torVoices(pills.audio, title)].concat(pills.channels.slice(0, 1), br).filter(Boolean);
    var meta = [txt(element.tracker || element.Tracker, '.torrent-item__tracker'), txt(element.date, '.torrent-item__date')].filter(Boolean);
    if (/dolby\s*vision|(?:^|[^a-z])dv(?![a-z])/i.test(title) && q.indexOf('DV') < 0) q.push('DV');
    var top = q.map(function (x) { return '<span class="stv-tor__q' + (/^(4K|HDR|DV)/i.test(x) ? ' stv-tor__q--hi' : '') + '">' + esc(x) + '</span>'; }).join('');
    var row = $('<div class="stv-tor"><div class="stv-tor__l"><div class="stv-tor__top">' + top + '<span class="stv-tor__name">' + esc(torName(title)) + '</span></div>' +
      '<div class="stv-tor__sub">' + esc(sub.join(' · ')) + '</div><div class="stv-tor__meta">' + esc(meta.join(' · ')) + '</div></div>' +
      '<div class="stv-tor__r"><div class="stv-tor__size">' + esc(size) + '</div><div class="stv-tor__seeds' + (seeds ? '' : ' stv-tor__seeds--none') + '">↑ ' + seeds + '</div></div></div>');
    item.find('.torrent-item__viewed').appendTo(row.find('.stv-tor__top'));
    item.addClass('stv-tor-on').append(row);
  }
  // Lampa's «viewed» mark added to a row later (mark(): appended to the item) moved into the top line
  var viewedObs = null;
  function torViewed(item) {
    if (!window.MutationObserver || !item || !item.length || !item.hasClass('stv-tor-on')) return;
    if (viewedObs) viewedObs.disconnect();
    var el = item[0], move = function () {
      var v = item.children('.torrent-item__viewed');
      if (v.length) v.appendTo(item.find('.stv-tor__top').first());
    };
    viewedObs = new MutationObserver(move);
    viewedObs.observe(el, { childList: true });
  }
  // quick chips over the list: Lampa's own filter (quality, the Ukrainian language), switched in place
  var TQ = [{ key: 'quality', val: '4k', label: '4K' }, { key: 'quality', val: '1080p', label: '1080p' }, { key: 'lang', uk: true, label: 'UKR' }];
  function torComp() { try { var a = Lampa.Activity.active(); return a && a.component === 'torrents' && a.activity && a.activity.component; } catch (e) { return null; } }
  function torFilter(comp) { return objOf(comp.getFilterData()); }
  function tqVal(c) { return c.uk ? Lampa.Lang.translate('filter_lang_uk') : c.val; }
  function tqOn(d, c) { var v = d[c.key]; return $.isArray(v) && v.indexOf(tqVal(c)) >= 0; }
  function torChips() {
    var comp = torComp();
    // Lampa's torrent page methods the chips switch the filter with: all of them, else no chips
    if (!comp || ['getFilterData', 'setFilterData', 'buildFilterd', 'applyFilter', 'start'].some(function (f) { return typeof comp[f] !== 'function'; })) return;
    var line = $('.activity--active .torrent-filter');
    if (!line.length) return;
    if (!line.find('.stv-tq').length) {
      var after = line.find('.filter--filter'), made = [];
      TQ.slice().reverse().forEach(function (c) {
        var b = $('<div class="simple-button selector stv-tq"></div>').text(c.label);
        b.on('hover:enter', function () {
          var cmp = torComp(), chip = this;
          if (!cmp) return;
          var d = torFilter(cmp), v = tqVal(c), list = $.isArray(d[c.key]) ? d[c.key].slice() : [];
          if (list.indexOf(v) >= 0) list.splice(list.indexOf(v), 1); else list.push(v);
          d[c.key] = list;
          cmp.setFilterData(d);
          cmp.buildFilterd();
          cmp.applyFilter();
          torChipState();
          // as Lampa's own filter does: the remote's list built again (the rows are new), the chip kept
          cmp.start();
          try { Lampa.Controller.collectionFocus(chip, line); } catch (x) {}
        });
        after.after(b);
        made.push(b[0]);
      });
      // the page's remote list was made before the chips came: they join it (the focus stays where it is)
      var ctl = Lampa.Controller.enabled();
      if (made.length && ctl && ctl.name === 'content') { try { Lampa.Controller.collectionAppend(made); } catch (x) {} }
    }
    var q = line.find('.filter--search > div').text().trim();
    line.find('.filter--search').toggleClass('stv-has-q', !!q);
    torChipState();
    torFit();
  }
  // the list's height: Lampa makes it the screen less the header and the chips, not knowing the strip
  // (poster, title) the theme puts above them: its last rows were below the screen. Capped at the room
  // from its top to the screen's bottom (max-height: Lampa keeps setting the height)
  function torFit() {
    var sc = $('.activity--active.stv-torp .explorer__files-body > .scroll')[0];
    if (!sc) return;
    if (!themeOn()) { sc.style.maxHeight = ''; return; }
    var room = Math.floor(window.innerHeight - sc.getBoundingClientRect().top);
    if (room > 100) sc.style.maxHeight = room + 'px';
  }
  function torChipState() {
    var comp = torComp();
    if (!comp) return;
    var d = torFilter(comp);
    $('.activity--active .torrent-filter .stv-tq').each(function (i) { $(this).toggleClass('stv-tq--on', tqOn(d, TQ[i])); });
  }
  var torSoon = 0;
  function themeTorrent(e) {
    if (e.type === 'onenter' || e.type === 'onlong') torViewed(e.item);
    if (e.type === 'render') {
      torRow(e.element || {}, e.item);
      if (!torSoon) torSoon = setTimeout(function () { torSoon = 0; try { torChips(); } catch (x) {} }, 0);
    }
    // the full title first in the long-press menu (Lampa's own actions after it). Escaped: Lampa's template
    // puts it in as HTML through String.replace («$&» in a title would be replaced too: «$» as &#36;)
    if (e.type === 'onlong' && e.menu && e.element && e.element.Title) e.menu.unshift({ title: esc(e.element.Title).replace(/\$/g, '&#36;'), subtitle: tr('tor_full') });
  }

  // ---------- settings («Закусь TV»): the switch; Вид, Главная и карточка, Производительность ----------
  function settings() {
    try {
      var C = PACK.c, S = packSettings();
      S.version(tr('name'), VERSION);   // «Закусь» › «О паке» › versions
      // «hide …» (up to 0.6.6) → «show …»: the viewer's choice carried over once
      Object.keys(SHOW_WAS).forEach(function (n) {
        var was = Lampa.Storage.get(SHOW_WAS[n], ''), now = Lampa.Storage.get(n, '');
        if (was === null || was === undefined || was === '' || (now !== null && now !== undefined && now !== '')) return;
        Lampa.Storage.set(n, !(was === true || was === 'true'));
      });
      S.page(C, { name: tr('name'),
        icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="4.5" width="19" height="12.5" rx="2.5" fill="none" stroke="#fff" stroke-width="2"/><path d="M8 20.5h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
        groups: [{ id: 'main' }, { id: 'look', title: tr('g_look') }, { id: 'home', title: tr('g_home') }, { id: 'speed', title: tr('g_speed') }] });
      var on = function () { return opt(K.on) !== false; };
      var n = 0;
      var p = function (group, name, type, field, values, more) {
        var d = { param: { name: name, type: type, 'default': DEF[name] }, field: field, snack_show: on, onChange: function () { apply(); } };
        if (values) d.param.values = values;
        for (var x in more || {}) d[x] = more[x];
        S.add(C, group, ++n, d);
      };
      var three = { auto: tr('auto'), on: tr('on_'), off: tr('off_') };
      // on / off: the folder is drawn again (the other options come or go with it); the pages already
      // open are rebuilt (wide cards, the banner, the rows come or go) once the settings are closed
      // (rebuilding them now would close the settings)
      var rebuild = false;
      try { Lampa.Settings.listener.follow('close', function () { if (rebuild) { rebuild = false; try { Lampa.Activity.refresh(true); } catch (x) {} } }); } catch (x) {}
      p('main', K.on, 'trigger', { name: tr('on') }, null, { snack_show: null, onChange: function () {
        apply(); rebuild = true;
        setTimeout(function () { try { Lampa.Settings.update(); } catch (x) {} }, 0);
      } });
      S.add(C, 'main', ++n, { param: { name: 'stv_reset', type: 'button' }, field: { name: tr('reset'), description: tr('reset_d') },
        onChange: function () { S.reset(C, function () { apply(); }); } });
      p('look', K.mode, 'select', { name: tr('mode'), description: tr('mode_d') }, { auto: tr('auto'), ipad: tr('ipad'), tv: tr('tvos') });
      p('look', K.poster, 'select', { name: tr('poster_size'), description: tr('poster_size_d') },
        { normal: tr('poster_normal'), large: tr('poster_large'), max: tr('poster_max') },
        { onChange: function () { apply(); rebuild = true; } });
      p('look', K.head, 'trigger', { name: tr('h_head'), description: tr('h_head_d') });
      p('look', K.titles, 'trigger', { name: tr('titles'), description: tr('titles_d') });
      p('look', K.tint, 'trigger', { name: tr('tint'), description: tr('tint_d') });
      p('look', K.logo_lang, 'select', { name: tr('logo_lang') }, { ui: tr('logo_ui'), uk: 'Українська', ru: 'Русский', en: 'English' });
      p('home', K.episodes, 'trigger', { name: tr('episodes') });
      p('home', K.shots, 'trigger', { name: tr('h_shots') });
      p('home', K.loc, 'trigger', { name: tr('loc'), description: tr('loc_d') });
      p('home', K.react, 'trigger', { name: tr('h_react') });
      p('home', K.tech, 'trigger', { name: tr('h_tech'), description: tr('h_tech_d') });
      // Lampa's own round «Watch»: beside Autopilot's white button; without Autopilot it always stays
      p('home', K.play, 'trigger', { name: tr('h_play'), description: ' ' }, null, { onRender: function (item) {
        var d = item.find('.settings-param__descr');
        if (apHasServer()) d.remove(); else d.text(tr('h_play_d'));
      } });
      p('speed', K.lite, 'select', { name: tr('lite'), description: tr('lite_d') }, three);
      p('speed', K.img, 'select', { name: tr('img_q'), description: tr('img_q_d') }, { auto: tr('auto'), eco: tr('q_eco'), max: tr('q_max') });
    } catch (e) { log(e && e.message); }
  }

  // ---------- start ----------
  function start() {
    if (started || !PACK.c) return;
    started = true;
    logoCache();
    settings();
    apply();
    Lampa.Listener.follow('full', guard(function (e) {
      if (e.type === 'start') reorderRows(e.link);
      if (e.type === 'complite') themeFull(e);
      if (e.type === 'options') moreOptions(e);
      if (e.type === 'build' && e.name === 'episodes') themeEpisodes(e);
    }));
    try {
      Lampa.Controller.listener.follow('toggle', guard(function (e) {
        if (e.name !== 'full_start') return;
        var a = Lampa.Activity.active();
        if (a && a.activity) markButtons(a.activity.render());
      }));
    } catch (x) {}
    Lampa.Listener.follow('resize_end', function () { try { apply(); torFit(); } catch (x) {} });
    Lampa.Listener.follow('torrent', guard(themeTorrent));
    hookInstances();
    hookSection('myperson', PeopleGrid);
    hookSection('timetable', function (object) { return new Schedule(object); });
    trackKeys();
    touchPosters();
    cardMenuTitle();
    Lampa.Listener.follow('activity', function (e) {
      try {
        // AppleTV AGNative loaded later than this plugin: step aside
        if (e.type === 'start' && themeOn() && agnative()) apply();
        if (e.type === 'init') building = e.object && e.object.component ? e.object : { component: e.component || '' };
        // the torrents page: its slide marked (the look of Explorer + Filter only there, not on the online
        // plugins' pages that use them too)
        if (e.type === 'init' && e.component === 'torrents' && e.object && e.object.activity) e.object.activity.render().addClass('stv-torp');
        // Autopilot's screen: its picture runs under the floating header (no inset of Lampa's, see cssBars)
        if (e.type === 'init' && e.component === 'alc_auto_view' && e.object && e.object.activity) e.object.activity.render().addClass('stv-apv');
        if (e.type === 'start' || e.type === 'archive' || e.type === 'destroy') building = null;
        if (e.type === 'destroy') pruneWatched(e.object && e.object.activity && e.object.activity.render ? e.object.activity.render(true) : null);
        homeOrder(e);
        if (e.type === 'start' || e.type === 'archive') floatHead();
        if (e.type === 'start' || e.type === 'archive') pageStateLater();
        if (e.type === 'start' && e.component === 'actor' && themeOn()) themePerson(e.object);
      } catch (x) {}
    });
    try { Lampa.Controller.listener.follow('toggle', function () { pageStateLater(); }); } catch (x) {}
    pageState();
    log('ready ' + VERSION + ' ' + M + (L ? ' lite' : ''));
  }
  // for the pack's other plugins: «Трейлеры» asks whether background trailers fit the current look
  // (trailers: whether «auto» background trailers fit the current look: not in the light mode)
  // imgSize: the TMDB size the theme would take for a picture this wide (css px; the «Картинки» option),
  // so Autopilot's episode cards load the same stills as the theme's; plainText: TMDB text as the theme
  // shows it (no emoji boxes on TVs)
  window.snack_tv = { version: 2, trailers: function () { try { return themeOn() ? !lite() : true; } catch (e) { return true; } },
    imgSize: function (kind, cssW) { return tmdbSize(kind, cssW); },
    plainText: function (t) { return plainText(t); } };
  addHeroRow();
  genreHero();
  function startSafe() { try { start(); } catch (x) { log(x && x.message); } }
  if (window.appready) startSafe();
  else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startSafe(); });
})();
