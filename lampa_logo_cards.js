(function () {
  'use strict';

  if (window.__LAMPA_LOGO_CARDS__) return;
  window.__LAMPA_LOGO_CARDS__ = true;

  /* ───────────────── КОНСТАНТЫ ───────────────── */
  var PLUGIN_ID    = 'lampa_logo_cards';
  var STYLE_ID     = 'lampa-logo-cards-style';
  var BODY_CLASS   = 'llc-active';
  var TMDB_KEY     = '4ef0d7355d9ffb5151e987764708ce96';

  var KEY_ENABLE    = 'llc_enabled';
  var KEY_BADGE     = 'llc_badge';
  var KEY_RATING    = 'llc_rating';
  var KEY_BACKDROP  = 'llc_backdrop';
  var KEY_LOGO_LANG = 'llc_logo_lang';
  var KEY_UI_LANG   = 'llc_ui_lang';
  var KEY_GLARE     = 'llc_glare';
  var KEY_UNDERTITLE = 'llc_undertitle'; /* название ПОД постером */

  var GLARE_CLASS    = 'llc-glare';
  var BADGE_ATTR     = 'data-llc-badge';
  var RATING_ATTR    = 'data-llc-rating';
  var BACKDROP_ATTR  = 'data-llc-backdrop';
  var UTITLE_ATTR    = 'data-llc-undertitle';

  /* ───────────────── I18N ───────────────── */
  var I18N = {
    ru: {
      badge_movie: 'ФИЛЬМ', badge_tv: 'СЕРИАЛ',
      set_about: 'Логотипы и бэкдропы на карточках',
      set_enable: 'Включить плагин',
      set_enable_d: 'Показывать логотипы и бэкдропы',
      set_badge: 'Бейдж «Фильм / Сериал»',
      set_badge_d: 'Метка в левом верхнем углу карточки',
      set_rating: 'Рейтинг TMDB',
      set_rating_d: 'Оценка в правом верхнем углу карточки',
      set_backdrop: 'Горизонтальные кадры',
      set_backdrop_d: 'Заменять постер на кадр из фильма (backdrop)',
      set_undertitle: 'Название под постером',
      set_undertitle_d: 'Показывать название фильма / сериала под карточкой',
      set_logo_lang: 'Язык логотипов',
      set_logo_lang_d: 'Если нет на выбранном — используется английский',
      set_ui_lang: 'Язык интерфейса',
      set_ui_lang_d: 'Язык подписей плагина',
      set_glare: 'Эффект наклона карточки',
      set_glare_d: 'Parallax-наклон при наведении',
      val_on: 'Включить', val_off: 'Выключить',
      val_ru: 'Русский', val_en: 'Английский', val_uk: 'Украинский',
      val_auto: 'Автоматически'
    },
    en: {
      badge_movie: 'MOVIE', badge_tv: 'TV SHOW',
      set_about: 'Logos and backdrops on cards',
      set_enable: 'Enable plugin',
      set_enable_d: 'Show logos and backdrops on cards',
      set_badge: '"Movie / TV" badge',
      set_badge_d: 'Label in the top-left corner of the card',
      set_rating: 'TMDB rating',
      set_rating_d: 'Score in the top-right corner of the card',
      set_backdrop: 'Landscape stills',
      set_backdrop_d: 'Replace poster with backdrop image',
      set_undertitle: 'Title below poster',
      set_undertitle_d: 'Show movie / series title under the card',
      set_logo_lang: 'Logo language',
      set_logo_lang_d: 'Falls back to English if unavailable',
      set_ui_lang: 'Interface language',
      set_ui_lang_d: 'Language for plugin labels',
      set_glare: 'Card tilt effect',
      set_glare_d: 'Parallax tilt on hover / focus',
      val_on: 'Enable', val_off: 'Disable',
      val_ru: 'Russian', val_en: 'English', val_uk: 'Ukrainian',
      val_auto: 'Auto'
    },
    uk: {
      badge_movie: 'ФІЛЬМ', badge_tv: 'СЕРІАЛ',
      set_about: 'Логотипи та бекдропи на картках',
      set_enable: 'Увімкнути плагін',
      set_enable_d: 'Показувати логотипи та бекдропи',
      set_badge: 'Бейдж «Фільм / Серіал»',
      set_badge_d: 'Мітка у лівому верхньому куті картки',
      set_rating: 'Рейтинг TMDB',
      set_rating_d: 'Оцінка у правому верхньому куті картки',
      set_backdrop: 'Горизонтальні кадри',
      set_backdrop_d: 'Замінювати постер на кадр з фільму (backdrop)',
      set_undertitle: 'Назва під постером',
      set_undertitle_d: 'Показувати назву фільму / серіалу під карткою',
      set_logo_lang: 'Мова логотипів',
      set_logo_lang_d: 'Якщо немає — береться англійський',
      set_ui_lang: 'Мова інтерфейсу',
      set_ui_lang_d: 'Мова підписів плагіна',
      set_glare: 'Ефект нахилу картки',
      set_glare_d: 'Parallax-нахил при наведенні',
      val_on: 'Увімкнути', val_off: 'Вимкнути',
      val_ru: 'Російська', val_en: 'Англійська', val_uk: 'Українська',
      val_auto: 'Автоматично'
    }
  };

  var GENRE_MAP = {
    ru: {
      28:'Боевик',12:'Приключения',16:'Мультфильм',35:'Комедия',80:'Криминал',
      99:'Документальный',18:'Драма',10751:'Семейный',14:'Фэнтези',36:'История',
      27:'Ужасы',10402:'Музыка',9648:'Детектив',10749:'Мелодрама',878:'Фантастика',
      10770:'Телефильм',53:'Триллер',10752:'Военный',37:'Вестерн',
      10762:'Детский',10765:'Фантастика',10767:'Ток-шоу'
    },
    en: {
      28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',
      99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',
      27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',
      10770:'TV Movie',53:'Thriller',10752:'War',37:'Western',
      10762:'Kids',10765:'Sci-Fi',10767:'Talk'
    },
    uk: {
      28:'Бойовик',12:'Пригоди',16:'Мультфільм',35:'Комедія',80:'Кримінал',
      99:'Документальний',18:'Драма',10751:'Сімейний',14:'Фентезі',36:'Історичний',
      27:'Жахи',10402:'Музика',9648:'Детектив',10749:'Мелодрама',878:'Фантастика',
      10770:'Телефільм',53:'Трилер',10752:'Воєнний',37:'Вестерн',
      10762:'Дитячий',10765:'Фантастика',10767:'Ток-шоу'
    }
  };

  /* ───────────────── КЭШИ / СОСТОЯНИЕ ───────────────── */
  var logoCache        = {};
  var logoPending      = {};
  var scheduled        = false;
  var settingsRegistered = false;
  var cardObserver     = null;
  var listenersReady   = false;

  /* ───────────────── УТИЛИТЫ ───────────────── */
  function stor(key, def) {
    try { return window.Lampa && Lampa.Storage ? Lampa.Storage.get(key, def) : def; }
    catch (e) { return def; }
  }

  function detectLang() {
    try {
      if (!window.Lampa) return 'ru';
      var l = (stor('language', '') || '').toLowerCase();
      if (!l && Lampa.Lang && Lampa.Lang.selected) l = (Lampa.Lang.selected() || '').toLowerCase();
      if (l.indexOf('uk') === 0 || l === 'ua') return 'uk';
      if (l.indexOf('en') === 0) return 'en';
      return 'ru';
    } catch (e) { return 'ru'; }
  }

  function uiLang() {
    var v = stor(KEY_UI_LANG, 'auto');
    if (!v || v === 'auto') return detectLang();
    return I18N[v] ? v : 'ru';
  }

  function logoLang() {
    var v = stor(KEY_LOGO_LANG, 'auto');
    if (!v || v === 'auto') return detectLang();
    return v;
  }

  function t(key) {
    var d = I18N[uiLang()] || I18N.ru;
    return d[key] || (I18N.ru[key] || key);
  }

  function isEnabled()    { return stor(KEY_ENABLE,     'on') !== 'off'; }
  function badgeOn()      { return stor(KEY_BADGE,      'on') !== 'off'; }
  function ratingOn()     { return stor(KEY_RATING,     'on') !== 'off'; }
  function backdropOn()   { return stor(KEY_BACKDROP,   'on') !== 'off'; }
  function glareOn()      { return stor(KEY_GLARE,      'on') !== 'off'; }
  function undertitleOn() { return stor(KEY_UNDERTITLE, 'on') !== 'off'; }

  function escHtml(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  function cardData(el) {
    if (!el) return null;
    try { if (el.card_data) return el.card_data; } catch (e) {}
    try { if (window.$) { var d = $(el).data('card') || $(el).data('json'); if (d) return d; } } catch (e) {}
    return null;
  }

  function genreNames(item) {
    var map = (GENRE_MAP[uiLang()] || GENRE_MAP.ru);
    var out = [];
    if (item.genres && item.genres.length) {
      item.genres.forEach(function (g) { if (g && g.name) out.push(g.name); });
    } else if (item.genre_ids && item.genre_ids.length) {
      item.genre_ids.forEach(function (id) { if (map[id]) out.push(map[id]); });
    }
    return out;
  }

  /* ───────────────── ЛОГО TMDB ───────────────── */
  function fetchLogo(id, type, cb) {
    if (!id) return cb(null);
    var lang = logoLang();
    var key  = type + '/' + id + '/' + lang;

    if (key in logoCache) return cb(logoCache[key]);
    if (logoPending[key]) { logoPending[key].push(cb); return; }
    logoPending[key] = [cb];

    var langs = [lang];
    if (lang !== 'en') langs.push('en');
    langs.push('null');

    fetch('https://api.themoviedb.org/3/' + type + '/' + id +
      '/images?api_key=' + TMDB_KEY + '&include_image_language=' + langs.join(','))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var logo = null;
        if (data.logos && data.logos.length) {
          var pref = data.logos.filter(function (l) { return l.iso_639_1 === lang; });
          var en   = data.logos.filter(function (l) { return l.iso_639_1 === 'en'; });
          var pick = pref[0] || en[0] || data.logos[0];
          if (pick && pick.file_path) logo = { path: pick.file_path };
        }
        logoCache[key] = logo;
        flush(key);
      })
      .catch(function () { logoCache[key] = null; flush(key); });

    function flush(k) {
      var cbs = logoPending[k] || [];
      delete logoPending[k];
      cbs.forEach(function (fn) { fn(logoCache[k]); });
    }
  }

  function logoUrl(path) {
    try { return Lampa.TMDB.image('t/p/w300' + path); }
    catch (e) { return 'https://image.tmdb.org/t/p/w300' + path; }
  }

  function backdropUrl(path) {
    try { return Lampa.TMDB.image('t/p/w500' + path); }
    catch (e) { return 'https://image.tmdb.org/t/p/w500' + path; }
  }

  /* ───────────────── ОБРАБОТКА КАРТОЧЕК ───────────────── */
  function processCard(cardEl) {
    if (!cardEl || cardEl.getAttribute('data-llc-done')) return;
    cardEl.setAttribute('data-llc-done', '1');

    var data = cardData(cardEl);
    if (!data) return;

    var useBackdrop = backdropOn();
    var view = cardEl.querySelector('.card__view');
    if (!view) return;

    var title = data.title || data.name || '';
    var vote  = data.vote_average ? parseFloat(data.vote_average) : 0;
    var year  = '';
    if (data.release_date)       year = data.release_date.substring(0, 4);
    else if (data.first_air_date) year = data.first_air_date.substring(0, 4);
    var mediaType = data.name ? 'tv' : 'movie';

    /* ── 1. Замена изображения на backdrop ── */
    if (useBackdrop && data.backdrop_path) {
      var imgEl = cardEl.querySelector('.card__img, .card__image');
      if (imgEl) {
        if (imgEl.tagName === 'IMG') {
          if (!imgEl.hasAttribute('data-llc-orig')) imgEl.setAttribute('data-llc-orig', imgEl.src || '');
          imgEl.src = backdropUrl(data.backdrop_path);
          imgEl.style.objectFit = 'cover';
          imgEl.style.objectPosition = 'center 20%';
        } else {
          if (!imgEl.hasAttribute('data-llc-orig-bg')) imgEl.setAttribute('data-llc-orig-bg', imgEl.style.backgroundImage || '');
          imgEl.style.backgroundImage = 'url(' + backdropUrl(data.backdrop_path) + ')';
          imgEl.style.backgroundSize = 'cover';
          imgEl.style.backgroundPosition = 'center 20%';
        }
      }
    }

    /* ── 2. Оверлей с логотипом / названием поверх постера ── */
    if (useBackdrop && !view.querySelector('.llc-overlay')) {
      var overlay = document.createElement('div');
      overlay.className = 'llc-overlay';

      /* Мета-строка (год · жанры) */
      var gnames = genreNames(data).slice(0, 2);
      var metaParts = [];
      if (year)          metaParts.push('<span>' + escHtml(year) + '</span>');
      if (gnames.length) metaParts.push('<span>' + escHtml(gnames.join(', ')) + '</span>');
      var metaHtml = metaParts.length
        ? '<div class="llc-overlay__meta">' + metaParts.join('<span class="llc-dot"> · </span>') + '</div>'
        : '';

      /* Заголовок-текст (fallback до загрузки лого) */
      var titleHtml = title
        ? '<div class="llc-overlay__title">' + escHtml(title) + '</div>'
        : '';

      overlay.innerHTML = titleHtml + metaHtml;
      view.appendChild(overlay);

      /* Загрузка лого — заменяет текстовый заголовок */
      fetchLogo(data.id, mediaType, function (logo) {
        var titleDiv = overlay.querySelector('.llc-overlay__title');
        if (!logo || !titleDiv) return;
        var img = document.createElement('img');
        img.className = 'llc-overlay__logo';
        img.src = logoUrl(logo.path);
        img.alt = title;
        img.loading = 'lazy';
        img.onerror = function () { img.style.display = 'none'; };
        titleDiv.replaceWith(img);
      });

      /* Бейдж «ФИЛЬМ / СЕРИАЛ» */
      if (badgeOn()) {
        var badge = document.createElement('div');
        badge.className = 'llc-badge';
        badge.textContent = mediaType === 'tv' ? t('badge_tv') : t('badge_movie');
        view.appendChild(badge);
      }

      /* Рейтинг */
      if (ratingOn() && vote > 0) {
        var ratingEl = document.createElement('div');
        ratingEl.className = 'llc-rating';
        ratingEl.textContent = vote.toFixed(1);
        view.appendChild(ratingEl);
      }
    }

    /* ── 3. Название под постером (отдельный элемент вне .card__view) ── */
    if (!cardEl.querySelector('.llc-undertitle') && title) {
      var sub = document.createElement('div');
      sub.className = 'llc-undertitle';
      sub.textContent = title;
      /* Вставляем сразу после .card__view */
      if (view.nextSibling) cardEl.insertBefore(sub, view.nextSibling);
      else cardEl.appendChild(sub);
    }
  }

  function processCards(root) {
    if (!root) return;
    root.querySelectorAll('.card').forEach(processCard);
  }

  function resetCards() {
    document.querySelectorAll('.card[data-llc-done]').forEach(function (c) {
      c.removeAttribute('data-llc-done');

      var imgEl = c.querySelector('.card__img, .card__image');
      if (imgEl) {
        var orig = imgEl.getAttribute('data-llc-orig');
        if (orig !== null && imgEl.tagName === 'IMG') {
          imgEl.src = orig;
          imgEl.style.objectFit = '';
          imgEl.style.objectPosition = '';
        }
        var origBg = imgEl.getAttribute('data-llc-orig-bg');
        if (origBg !== null) {
          imgEl.style.backgroundImage = origBg;
          imgEl.style.backgroundSize = '';
          imgEl.style.backgroundPosition = '';
        }
      }

      ['llc-overlay', 'llc-badge', 'llc-rating', 'llc-undertitle'].forEach(function (cls) {
        var el = c.querySelector('.' + cls);
        if (el) el.remove();
      });
    });
  }

  /* ───────────────── НАБЛЮДАТЕЛЬ ───────────────── */
  function startObserver() {
    if (cardObserver || !window.MutationObserver) return;
    cardObserver = new MutationObserver(function (mutations) {
      if (!isEnabled()) return;
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains('card')) processCard(node);
          else if (node.querySelectorAll) processCards(node);
        });
      });
    });
    cardObserver.observe(document.body, { childList: true, subtree: true });
  }

  /* ───────────────── ЭФФЕКТ НАКЛОНА ───────────────── */
  function initGlare() {
    if (window.__LLC_GLARE__) return;
    window.__LLC_GLARE__ = true;

    document.body.addEventListener('mousemove', function (e) {
      if (!glareOn()) return;
      var card = e.target.closest && e.target.closest('.card, .card-episode');
      if (!card) return;
      var r = card.getBoundingClientRect();
      var xp = ((e.clientX - r.left) / r.width)  * 2 - 1;
      var yp = ((e.clientY - r.top)  / r.height) * 2 - 1;
      card.style.setProperty('--llc-gx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--llc-gy', (e.clientY - r.top)  + 'px');
      card.style.setProperty('--llc-rx', (yp * -7) + 'deg');
      card.style.setProperty('--llc-ry', (xp *  7) + 'deg');
    });

    document.body.addEventListener('mouseleave', function (e) {
      var card = e.target.closest && e.target.closest('.card, .card-episode');
      if (!card) return;
      ['--llc-rx', '--llc-ry'].forEach(function (p) { card.style.setProperty(p, '0deg'); });
      card.style.setProperty('--llc-gx', '50%');
      card.style.setProperty('--llc-gy', '50%');
    }, true);
  }

  /* ───────────────── CSS ───────────────── */
  function injectStyle() {
    var old = document.getElementById(STYLE_ID);
    if (old) old.remove();

    var css = [
      /* ── Карточка ── */
      'body.' + BODY_CLASS + ' .card { overflow: visible !important; }',
      'body.' + BODY_CLASS + ' .card .card__view {',
      '  padding-bottom: 56.25% !important;',
      '  border-radius: 1.2em !important;',
      '  overflow: hidden !important;',
      '  clip-path: inset(0 round 1.2em);',
      '  -webkit-clip-path: inset(0 round 1.2em);',
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 8px 20px rgba(0,0,0,.22) !important;',
      '  transition: transform .28s cubic-bezier(.22,.61,.36,1), box-shadow .28s ease !important;',
      '}',
      'body.' + BODY_CLASS + ' .card.focus .card__view {',
      '  transform: scale(1.05) translateY(-.05em) !important;',
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 2.5px rgba(86,141,255,.9), 0 14px 32px rgba(0,0,0,.3) !important;',
      '}',
      'body.' + BODY_CLASS + ' .card.hover .card__view {',
      '  transform: scale(1.025) translateY(-.025em) !important;',
      '  box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 10px 22px rgba(0,0,0,.2) !important;',
      '}',
      'body.' + BODY_CLASS + ' .card .card__img,',
      'body.' + BODY_CLASS + ' .card .card__image {',
      '  object-fit: cover !important;',
      '  object-position: center 20% !important;',
      '  border-radius: 1.2em !important;',
      '}',
      /* Скрываем стандартные элементы Lampa */
      'body.' + BODY_CLASS + ' .card__vote,',
      'body.' + BODY_CLASS + ' .card__quality,',
      'body.' + BODY_CLASS + ' .card__type { display: none !important; }',
      /* Стандартный заголовок скрываем — у нас своё название */
      'body.' + BODY_CLASS + ' .card__title { display: none !important; }',

      /* ── Оверлей (поверх постера) ── */
      '.llc-overlay {',
      '  position: absolute; left: 0; right: 0; bottom: 0; z-index: 3;',
      '  display: block !important;',
      '  border-radius: 0 0 1.2em 1.2em;',
      '  background: linear-gradient(0deg,',
      '    rgba(0,0,0,.92) 0%,',
      '    rgba(0,0,0,.60) 38%,',
      '    rgba(0,0,0,.18) 65%,',
      '    transparent 100%);',
      '  padding: 3em 1em .85em;',
      '  pointer-events: none;',
      '}',

      /* ── Логотип (картинка с TMDB) ── */
      '.llc-overlay__logo {',
      '  display: block !important;',
      '  max-height: 2.6em !important;',
      '  max-width: 82% !important;',
      '  margin-bottom: .24em;',
      '  object-fit: contain;',
      '  object-position: left center;',
      '  filter: drop-shadow(0 2px 8px rgba(0,0,0,.7)) drop-shadow(0 0 1px rgba(0,0,0,.5));',
      '}',

      /* ── Текстовый заголовок (fallback когда лого не найдено) ── */
      '.llc-overlay__title {',
      '  color: #fff;',
      '  font-size: 1.05em;',
      '  font-weight: 800;',
      '  line-height: 1.2;',
      '  text-shadow: 0 2px 12px rgba(0,0,0,.65), 0 1px 3px rgba(0,0,0,.9);',
      '  margin-bottom: .18em;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '}',

      /* ── Мета-строка (год · жанры) ── */
      '.llc-overlay__meta {',
      '  color: rgba(255,255,255,.80);',
      '  font-size: .7em;',
      '  line-height: 1.3;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '  text-shadow: 0 1px 6px rgba(0,0,0,.5);',
      '}',
      '.llc-dot { opacity: .4; }',

      /* ── Бейдж «ФИЛЬМ / СЕРИАЛ» ── */
      '.llc-badge {',
      '  position: absolute; top: .65em; left: .72em; z-index: 4;',
      '  display: inline-flex; align-items: center; justify-content: center;',
      '  padding: .28em .78em;',
      '  border-radius: .82em;',
      '  background: rgba(8,10,16,.65);',
      '  border: 1px solid rgba(255,255,255,.16);',
      '  color: rgba(255,255,255,.97);',
      '  font-size: .68em; font-weight: 800; letter-spacing: .07em;',
      '  backdrop-filter: blur(10px) saturate(140%);',
      '  -webkit-backdrop-filter: blur(10px) saturate(140%);',
      '  pointer-events: none;',
      '}',

      /* ── Рейтинг ── */
      '.llc-rating {',
      '  position: absolute; top: .65em; right: .72em; z-index: 4;',
      '  display: inline-flex; align-items: center; justify-content: center;',
      '  padding: .26em .62em;',
      '  border-radius: .78em;',
      '  background: rgba(8,10,16,.70);',
      '  border: 1px solid rgba(255,213,61,.28);',
      '  color: #ffd13d; font-size: .68em; font-weight: 800;',
      '  backdrop-filter: blur(10px) saturate(140%);',
      '  -webkit-backdrop-filter: blur(10px) saturate(140%);',
      '  pointer-events: none;',
      '  box-shadow: 0 3px 8px rgba(0,0,0,.32);',
      '}',

      /* ── Название ПОД постером ── */
      '.llc-undertitle {',
      '  display: block;',
      '  color: rgba(255,255,255,.90);',
      '  font-size: .82em;',
      '  font-weight: 600;',
      '  line-height: 1.25;',
      '  margin-top: .45em;',
      '  padding: 0 .2em;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '  max-width: 100%;',
      '  pointer-events: none;',
      '}',

      /* ── CSS-флаги (управляют видимостью через data-атрибуты body) ── */
      'body.' + BODY_CLASS + '[' + BADGE_ATTR + '="off"] .llc-badge { display: none !important; }',
      'body.' + BODY_CLASS + '[' + RATING_ATTR + '="off"] .llc-rating { display: none !important; }',

      /* Вертикальный режим (backdrop выключен) */
      'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card .card__view { padding-bottom: 140% !important; }',
      'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card .card__img,',
      'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card .card__image { object-position: center center !important; }',
      'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .llc-overlay,',
      'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .llc-badge,',
      'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .llc-rating { display: none !important; }',
      /* Когда backdrop выключен — стандартный Lampa-заголовок возвращаем, наш undertitle тоже работает */
      'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .card__title { display: block !important; }',
      'body.' + BODY_CLASS + '[' + BACKDROP_ATTR + '="off"] .llc-undertitle { display: none !important; }',

      /* Название под постером — управляется настройкой */
      'body.' + BODY_CLASS + '[' + UTITLE_ATTR + '="off"] .llc-undertitle { display: none !important; }',
      /* Когда undertitle включён — стандартный Lampa-заголовок не нужен */
      'body.' + BODY_CLASS + '[' + UTITLE_ATTR + '="on"] .card__title { display: none !important; }',

      /* ── Glare-эффект ── */
      'body.' + GLARE_CLASS + ' .card { will-change: transform; transform-style: preserve-3d; }',
      'body.' + GLARE_CLASS + ' .card .card__view { position: relative; }',
      'body.' + GLARE_CLASS + ' .card .card__view::after {',
      '  content: "" !important; display: block !important;',
      '  position: absolute; inset: -10%; border-radius: inherit;',
      '  background: radial-gradient(ellipse at var(--llc-gx,50%) var(--llc-gy,50%),',
      '    rgba(255,255,255,.24) 0%, rgba(255,255,255,.08) 40%, transparent 70%) !important;',
      '  opacity: 0; filter: blur(14px);',
      '  transition: opacity .22s ease; pointer-events: none; z-index: 8; mix-blend-mode: screen;',
      '}',
      'body.' + GLARE_CLASS + ' .card.focus .card__view::after,',
      'body.' + GLARE_CLASS + ' .card.hover .card__view::after { opacity: 1 !important; }',
      'body.' + GLARE_CLASS + ' .card.focus .card__view,',
      'body.' + GLARE_CLASS + ' .card.hover .card__view {',
      '  transform: perspective(1000px) rotateX(var(--llc-rx,0deg)) rotateY(var(--llc-ry,0deg)) scale(1.05) translateY(-.055em) !important;',
      '}'
    ].join('\n');

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    (document.head || document.body).appendChild(style);
  }

  /* ───────────────── СИНХРОНИЗАЦИЯ ФЛАГОВ ───────────────── */
  function syncFlags() {
    if (!document.body) return;
    document.body.setAttribute(BADGE_ATTR,   badgeOn()      ? 'on' : 'off');
    document.body.setAttribute(RATING_ATTR,  ratingOn()     ? 'on' : 'off');
    document.body.setAttribute(BACKDROP_ATTR, backdropOn()  ? 'on' : 'off');
    document.body.setAttribute(UTITLE_ATTR,  undertitleOn() ? 'on' : 'off');
    if (glareOn() && isEnabled()) document.body.classList.add(GLARE_CLASS);
    else document.body.classList.remove(GLARE_CLASS);
  }

  function removePluginUi() {
    var style = document.getElementById(STYLE_ID);
    if (style) style.remove();
    if (document.body) {
      document.body.classList.remove(BODY_CLASS, GLARE_CLASS);
      [BADGE_ATTR, RATING_ATTR, BACKDROP_ATTR, UTITLE_ATTR].forEach(function (a) {
        document.body.removeAttribute(a);
      });
    }
    resetCards();
  }

  /* ───────────────── НАСТРОЙКИ ───────────────── */
  function registerSettings() {
    if (settingsRegistered) return;
    if (!window.Lampa || !Lampa.SettingsApi) return;
    settingsRegistered = true;

    try { Lampa.Template.add('settings_' + PLUGIN_ID, '<div></div>'); } catch (e) {}

    Lampa.SettingsApi.addComponent({
      component: PLUGIN_ID,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
      name: 'Logo Cards'
    });

    function ap(param, field, onChange) {
      Lampa.SettingsApi.addParam({
        component: PLUGIN_ID,
        param: param,
        field: field,
        onChange: onChange || function () {}
      });
    }

    var oo    = function () { return { on: t('val_on'), off: t('val_off') }; };
    var langs = function () { return { auto: t('val_auto'), ru: t('val_ru'), en: t('val_en'), uk: t('val_uk') }; };

    ap({ name: 'llc_about', type: 'static' },
       { name: 'Logo Cards', description: t('set_about') });

    ap({ name: KEY_ENABLE, type: 'select', values: oo(), default: 'on' },
       { name: t('set_enable'), description: t('set_enable_d') },
       function (v) {
         if (v === 'off') removePluginUi();
         else { setTimeout(startPlugin, 50); setTimeout(schedulePatch, 150); }
       });

    ap({ name: KEY_BACKDROP, type: 'select', values: oo(), default: 'on' },
       { name: t('set_backdrop'), description: t('set_backdrop_d') },
       function () { syncFlags(); resetCards(); setTimeout(schedulePatch, 80); });

    ap({ name: KEY_UNDERTITLE, type: 'select', values: oo(), default: 'on' },
       { name: t('set_undertitle'), description: t('set_undertitle_d') },
       function () { syncFlags(); });

    ap({ name: KEY_BADGE, type: 'select', values: oo(), default: 'on' },
       { name: t('set_badge'), description: t('set_badge_d') },
       function () { syncFlags(); });

    ap({ name: KEY_RATING, type: 'select', values: oo(), default: 'on' },
       { name: t('set_rating'), description: t('set_rating_d') },
       function () { syncFlags(); });

    ap({ name: KEY_GLARE, type: 'select', values: oo(), default: 'on' },
       { name: t('set_glare'), description: t('set_glare_d') },
       function () { syncFlags(); });

    ap({ name: KEY_LOGO_LANG, type: 'select', values: langs(), default: 'auto' },
       { name: t('set_logo_lang'), description: t('set_logo_lang_d') },
       function () { logoCache = {}; resetCards(); setTimeout(schedulePatch, 80); });

    ap({ name: KEY_UI_LANG, type: 'select', values: langs(), default: 'auto' },
       { name: t('set_ui_lang'), description: t('set_ui_lang_d') },
       function () { setTimeout(schedulePatch, 80); });
  }

  /* ───────────────── СЛУШАТЕЛИ ───────────────── */
  function bindListeners() {
    if (listenersReady || !window.Lampa) return;
    listenersReady = true;

    try {
      Lampa.Listener.follow('activity', function (e) {
        if (!isEnabled()) return;
        if (e.type === 'complite' || e.type === 'start') {
          setTimeout(function () {
            var root = document.querySelector('.activity--active .scroll__content') ||
                       document.querySelector('.scroll__content');
            if (root) processCards(root);
          }, 200);
        }
      });
    } catch (e) {}

    try {
      Lampa.Listener.follow('full', function (e) {
        if (!isEnabled()) return;
        if (e.type === 'complite') {
          try {
            var render = e.object.activity.render();
            if (render && render.length) processCards(render[0]);
          } catch (er) {}
        }
      });
    } catch (e) {}

    try {
      Lampa.Storage.listener.follow('change', function (e) {
        var n = e.name;
        if (n === KEY_ENABLE) {
          if (isEnabled()) { setTimeout(startPlugin, 50); setTimeout(schedulePatch, 150); }
          else removePluginUi();
        } else if (n === KEY_BACKDROP) {
          syncFlags(); resetCards(); setTimeout(schedulePatch, 80);
        } else if (n === KEY_BADGE || n === KEY_RATING || n === KEY_GLARE || n === KEY_UNDERTITLE) {
          syncFlags();
        } else if (n === KEY_LOGO_LANG) {
          logoCache = {}; resetCards(); setTimeout(schedulePatch, 80);
        }
      });
    } catch (e) {}
  }

  /* ───────────────── ПАТЧ (debounced) ───────────────── */
  function schedulePatch() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () {
      scheduled = false;
      if (!isEnabled()) { removePluginUi(); return; }
      injectStyle();
      if (document.body) document.body.classList.add(BODY_CLASS);
      syncFlags();
      var root = document.querySelector('.activity--active .scroll__content') ||
                 document.querySelector('.scroll__content');
      if (root) processCards(root);
    }, 120);
  }

  /* ───────────────── СТАРТ ───────────────── */
  function startPlugin() {
    registerSettings();
    bindListeners();
    if (!isEnabled()) { removePluginUi(); return; }

    injectStyle();
    if (document.body) document.body.classList.add(BODY_CLASS);
    syncFlags();
    initGlare();
    startObserver();
    processCards(document.body);
    schedulePatch();

    [400, 1200].forEach(function (ms) {
      setTimeout(function () {
        var root = document.querySelector('.activity--active .scroll__content') ||
                   document.querySelector('.scroll__content');
        if (root) processCards(root);
      }, ms);
    });
  }

  function boot() {
    registerSettings();
    startPlugin();
    [250, 900, 1800].forEach(function (ms) { setTimeout(startPlugin, ms); });
  }

  /* ───────────────── ИНИЦИАЛИЗАЦИЯ ───────────────── */
  if (window.appready) {
    boot();
  } else {
    try {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') boot();
      });
    } catch (e) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
      else boot();
    }
  }

})();
