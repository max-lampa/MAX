/**
 * AgNative ATV9 — адаптация для Android TV 9
 * Оптимизирован: без блюра, без тяжёлых анимаций, мини-рамка фокуса, боковое меню как в Lampa
 */
(function () {
  'use strict';

  /* ─── GUARD ─────────────────────────────────────────── */
  const GUARD = '__AGNATIVE_ATV9__';
  if (typeof window === 'undefined' || window[GUARD]) return;
  window[GUARD] = true;

  /* ─── ВЕРСИЯ ─────────────────────────────────────────── */
  const PLUGIN_VERSION = '1.0.0-atv9';

  /* ─── КЛЮЧИ localStorage ─────────────────────────────── */
  const K = {
    ENABLED:        'agnative_atv9_enabled',
    PERF:           'agnative_atv9_perf',
    BADGE:          'agnative_atv9_badge',
    RATING:         'agnative_atv9_rating',
    CARD_SIZE:      'agnative_atv9_card_size',
    POSTER_QUALITY: 'agnative_atv9_poster_quality',
    LOGO_LANG:      'agnative_atv9_logo_lang',
    LOGO_SIZE:      'agnative_atv9_logo_size',
    CARD_BORDER:    'agnative_atv9_card_border',      // мини-рамка
    LEFT_MENU:      'agnative_atv9_left_menu',        // левое меню
    RIGHT_MENU:     'agnative_atv9_right_menu',       // правое меню
    TMDB_KEY:       '4ef0d7355d9ffb5151e987764708ce96',
  };

  /* ─── ХЕЛПЕРЫ ─────────────────────────────────────────── */
  const qs  = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const get = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

  const pluginEnabled  = () => get(K.ENABLED)  !== 'false';
  const badgeEnabled   = () => get(K.BADGE)     !== 'false';
  const ratingEnabled  = () => get(K.RATING)    !== 'false';
  const borderEnabled  = () => get(K.CARD_BORDER) !== 'false';
  const leftMenuOn     = () => get(K.LEFT_MENU)  !== 'false';
  const rightMenuOn    = () => get(K.RIGHT_MENU) !== 'false';

  const getLogoLang    = () => get(K.LOGO_LANG) || 'ru';
  const getPosterQ     = () => get(K.POSTER_QUALITY) || 'w342';
  const getCardSize    = () => get(K.CARD_SIZE) || 'md';

  const escHtml = s => String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  /* ─── TMDB ─────────────────────────────────────────────── */
  const TMDB_KEY = K.TMDB_KEY;

  function tmdbImg(path, size) {
    size = size || 'w342';
    if (!path) return '';
    if (window.Lampa && Lampa.TMDB && Lampa.TMDB.image)
      return Lampa.TMDB.image('t/p/' + size + path);
    return 'https://image.tmdb.org/t/p/' + size + path;
  }

  /* Кеш для логотипов (in-memory, избегаем повторных запросов) */
  const logoCache = {};
  function fetchLogo(id, type, cb) {
    if (!id) return cb(null);
    const key = type + '_' + id;
    if (logoCache[key] !== undefined) return cb(logoCache[key]);
    const lang = getLogoLang();
    const url = 'https://api.themoviedb.org/3/' + type + '/' + id
      + '/images?include_image_language=' + lang + ',en,null&api_key=' + TMDB_KEY;
    try {
      fetch(url).then(r => r.json()).then(data => {
        const logos = (data && data.logos) || [];
        const local = logos.find(l => l.iso_639_1 === lang);
        const en    = logos.find(l => l.iso_639_1 === 'en');
        const best  = local || en || logos[0] || null;
        logoCache[key] = best ? best.file_path : null;
        cb(logoCache[key]);
      }).catch(() => { logoCache[key] = null; cb(null); });
    } catch { logoCache[key] = null; cb(null); }
  }

  /* ─── СТИЛИ ──────────────────────────────────────────────
     Оптимизировано для Android TV 9:
     • никакого backdrop-filter (убивает производительность)
     • transform только через GPU-safe свойства
     • will-change только там где реально нужно
     • transition упрощён                                   */
  const STYLE_ID = 'agnative-atv9-style';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const cardW = { xs:'140px', sm:'160px', md:'180px', lg:'210px', xl:'240px' }[getCardSize()] || '180px';

    const css = `
/* ═══════════════════════════════════════════════════════
   AgNative ATV9 — основные стили
   ═══════════════════════════════════════════════════════ */

/* ── Мини-рамка фокуса на постере ─────────────────────── */
.card:focus-within .card__view,
.card.focus .card__view,
.card.hover .card__view {
  outline: 3px solid #e8e8e8 !important;
  outline-offset: 2px !important;
  border-radius: 6px !important;
  box-shadow: 0 0 0 3px rgba(255,255,255,0.18) !important;
}

/* Масштаб при фокусе — только scale, GPU-friendly */
.card:focus-within,
.card.focus,
.card.hover {
  transform: scale(1.055) !important;
  transition: transform 0.15s ease !important;
  z-index: 10 !important;
}
.card {
  transition: transform 0.15s ease !important;
  will-change: transform;
}

/* ── Размер карточек ───────────────────────────────────── */
.card__view {
  border-radius: 6px !important;
  overflow: hidden !important;
}
.card {
  width: ${cardW} !important;
}

/* ── Бейдж фильм/сериал ───────────────────────────────── */
.nfx-card-logo {
  position: absolute !important;
  top: 6px !important; left: 6px !important;
  background: rgba(0,0,0,0.72) !important;
  color: #fff !important;
  font-size: 9px !important;
  font-weight: 700 !important;
  letter-spacing: 0.06em !important;
  padding: 2px 5px !important;
  border-radius: 3px !important;
  text-transform: uppercase !important;
  pointer-events: none !important;
  z-index: 4 !important;
}

/* ── Рейтинг TMDB ─────────────────────────────────────── */
.nfx-card-rating {
  position: absolute !important;
  top: 6px !important; right: 6px !important;
  min-width: 28px !important;
  height: 20px !important;
  border-radius: 4px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  color: #fff !important;
  padding: 0 4px !important;
  pointer-events: none !important;
  z-index: 4 !important;
}
.nfx-card-rating[data-score="10"],
.nfx-card-rating[data-score="9"] { background: #21c17a !important; }
.nfx-card-rating[data-score="8"],
.nfx-card-rating[data-score="7"] { background: #3ca55c !important; }
.nfx-card-rating[data-score="6"],
.nfx-card-rating[data-score="5"] { background: #d4a017 !important; }
.nfx-card-rating[data-score="4"],
.nfx-card-rating[data-score="3"],
.nfx-card-rating[data-score="2"],
.nfx-card-rating[data-score="1"] { background: #c0392b !important; }

/* ── Оверлей на карточке ──────────────────────────────── */
.nfx-card-overlay {
  position: absolute !important;
  bottom: 0 !important; left: 0 !important; right: 0 !important;
  padding: 18px 8px 6px !important;
  background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%) !important;
  pointer-events: none !important;
  z-index: 3 !important;
}
.nfx-card-overlay__title {
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #fff !important;
  line-height: 1.3 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  margin-bottom: 2px !important;
}
.nfx-card-overlay__logo {
  max-width: 70% !important;
  max-height: 28px !important;
  object-fit: contain !important;
  display: block !important;
}
.nfx-card-overlay__meta {
  font-size: 9px !important;
  color: rgba(255,255,255,0.7) !important;
  display: flex !important;
  gap: 4px !important;
  flex-wrap: wrap !important;
}

/* ══════════════════════════════════════════════════════
   ЛЕВОЕ БОКОВОЕ МЕНЮ (как в Lampa)
   ══════════════════════════════════════════════════════ */
.agnative-leftmenu {
  position: fixed !important;
  top: 0 !important; left: 0 !important; bottom: 0 !important;
  width: 220px !important;
  background: #181818 !important;
  z-index: 900 !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 16px 0 !important;
  transform: translateX(-100%) !important;
  transition: transform 0.18s ease !important;
  will-change: transform;
  overflow: hidden !important;
}
.agnative-leftmenu.is-open {
  transform: translateX(0) !important;
  box-shadow: 4px 0 24px rgba(0,0,0,0.7) !important;
}

.agnative-leftmenu__header {
  padding: 4px 20px 16px !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
  margin-bottom: 8px !important;
}
.agnative-leftmenu__logo {
  font-size: 20px !important;
  font-weight: 800 !important;
  color: #fff !important;
  letter-spacing: 0.04em !important;
}
.agnative-leftmenu__logo span {
  color: #e74c3c !important;
}

.agnative-leftmenu__items {
  flex: 1 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-width: none !important;
}
.agnative-leftmenu__items::-webkit-scrollbar { display: none; }

.agnative-leftmenu__item {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 12px 20px !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  color: rgba(255,255,255,0.75) !important;
  cursor: pointer !important;
  border-left: 3px solid transparent !important;
  transition: background 0.12s, color 0.12s !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.agnative-leftmenu__item .agnative-leftmenu__icon {
  width: 22px !important;
  height: 22px !important;
  flex-shrink: 0 !important;
  opacity: 0.7 !important;
}
.agnative-leftmenu__item.focus,
.agnative-leftmenu__item:focus,
.agnative-leftmenu__item.hover,
.agnative-leftmenu__item:hover {
  background: rgba(255,255,255,0.09) !important;
  color: #fff !important;
  border-left-color: #e74c3c !important;
  outline: none !important;
}
.agnative-leftmenu__item.focus .agnative-leftmenu__icon,
.agnative-leftmenu__item.hover .agnative-leftmenu__icon {
  opacity: 1 !important;
}
.agnative-leftmenu__item.is-active {
  color: #fff !important;
  border-left-color: #e74c3c !important;
}

.agnative-leftmenu__footer {
  border-top: 1px solid rgba(255,255,255,0.08) !important;
  padding: 12px 20px 4px !important;
}
.agnative-leftmenu__footer-item {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 10px 0 !important;
  font-size: 13px !important;
  color: rgba(255,255,255,0.55) !important;
  cursor: pointer !important;
}
.agnative-leftmenu__footer-item.focus,
.agnative-leftmenu__footer-item.hover {
  color: #fff !important;
}

/* Overlay-backdrop для левого меню */
.agnative-leftmenu-overlay {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(0,0,0,0.45) !important;
  z-index: 899 !important;
  display: none !important;
}
.agnative-leftmenu-overlay.is-open {
  display: block !important;
}

/* ══════════════════════════════════════════════════════
   ПРАВОЕ БОКОВОЕ МЕНЮ (быстрые действия)
   ══════════════════════════════════════════════════════ */
.agnative-rightmenu {
  position: fixed !important;
  top: 0 !important; right: 0 !important; bottom: 0 !important;
  width: 200px !important;
  background: #181818 !important;
  z-index: 900 !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 16px 0 !important;
  transform: translateX(100%) !important;
  transition: transform 0.18s ease !important;
  will-change: transform;
}
.agnative-rightmenu.is-open {
  transform: translateX(0) !important;
  box-shadow: -4px 0 24px rgba(0,0,0,0.7) !important;
}
.agnative-rightmenu__header {
  padding: 4px 16px 12px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  color: rgba(255,255,255,0.5) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
  margin-bottom: 6px !important;
}
.agnative-rightmenu__item {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 11px 16px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: rgba(255,255,255,0.75) !important;
  cursor: pointer !important;
}
.agnative-rightmenu__item.focus,
.agnative-rightmenu__item.hover {
  background: rgba(255,255,255,0.09) !important;
  color: #fff !important;
  outline: none !important;
}

/* ══════════════════════════════════════════════════════
   КНОПКА-ТРИГГЕР ЛЕВОГО МЕНЮ (hamburger)
   ══════════════════════════════════════════════════════ */
.agnative-menu-trigger {
  position: fixed !important;
  top: 50% !important;
  left: 0 !important;
  transform: translateY(-50%) !important;
  width: 8px !important;
  height: 48px !important;
  background: rgba(255,255,255,0.18) !important;
  border-radius: 0 6px 6px 0 !important;
  z-index: 898 !important;
  cursor: pointer !important;
  transition: width 0.15s ease, background 0.15s ease !important;
}
.agnative-menu-trigger:hover,
.agnative-menu-trigger.hover {
  width: 14px !important;
  background: rgba(255,255,255,0.4) !important;
}

/* ═══════════════════════════════════════════════════════
   УБИРАЕМ ТОРМОЗА: отключаем дорогие CSS-эффекты
   ═══════════════════════════════════════════════════════ */
/* Убираем backdrop-filter везде — главный источник тормозов */
* {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}
/* Не позволяем анимировать то что не нужно */
.card__info,
.card__title,
.card__age,
.card__category {
  transition: none !important;
  animation: none !important;
}
/* Упрощаем тени у карточек */
.card {
  box-shadow: none !important;
}
.card.focus,
.card.hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
}

/* ═══════════════════════════════════════════════════════
   ATV9 FOCUS-RING (системная рамка)
   ═══════════════════════════════════════════════════════ */
.card.focus .card__view,
.card.hover .card__view {
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px rgba(232,232,232,0.35) !important;
}

/* Убираем стандартный outline браузера у всех элементов */
*:focus { outline: none !important; }

/* ═══════════════════════════════════════════════════════
   ВЕРСИЯ ПЛАГИНА (слева внизу)
   ═══════════════════════════════════════════════════════ */
.agnative-version-badge {
  position: fixed !important;
  bottom: 10px !important;
  right: 14px !important;
  font-size: 10px !important;
  color: rgba(255,255,255,0.2) !important;
  pointer-events: none !important;
  z-index: 10 !important;
  letter-spacing: 0.04em !important;
}
`;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ─── GENRE MAPPING ───────────────────────────────────── */
  function getGenreNames(data) {
    if (!data) return [];
    if (data.genres && data.genres.length)
      return data.genres.slice(0,2).map(g => g.name);
    if (data.genre_ids && window.Lampa && Lampa.Genre) {
      try { return Lampa.Genre.names(data.genre_ids).slice(0,2); } catch {}
    }
    return [];
  }

  /* ─── ОБРАБОТКА КАРТОЧЕК ──────────────────────────────── */
  function extractCardData(card) {
    if (!card) return null;
    try {
      if (window.$ && $(card).data('info')) return $(card).data('info');
    } catch {}
    if (card.__agnData) return card.__agnData;
    return null;
  }

  function decorateCard(card) {
    if (!card || card.__agnDone) return;
    card.__agnDone = true;
    const view = card.querySelector('.card__view');
    if (!view) return;

    const data = extractCardData(card) || {};
    const vote = parseFloat(data.vote_average) || 0;
    const year = (data.release_date || data.first_air_date || '').slice(0,4);
    const title = data.title || data.name || '';
    const type  = data.name ? 'tv' : 'movie';

    /* Бейдж */
    if (badgeEnabled() && (data.title || data.name) && !view.querySelector('.nfx-card-logo')) {
      const badge = document.createElement('div');
      badge.className = 'nfx-card-logo';
      badge.textContent = data.name ? 'СЕРИАЛ' : 'ФИЛЬМ';
      view.appendChild(badge);
    }

    /* Рейтинг */
    if (ratingEnabled() && vote > 0 && !view.querySelector('.nfx-card-rating')) {
      const rat = document.createElement('div');
      rat.className = 'nfx-card-rating';
      const score = Math.min(10, Math.max(1, Math.round(vote)));
      rat.setAttribute('data-score', score);
      rat.textContent = vote.toFixed(1);
      view.appendChild(rat);
    }

    /* Оверлей с заголовком / логотипом */
    if (!view.querySelector('.nfx-card-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'nfx-card-overlay';

      const genreNames = getGenreNames(data);
      const metaParts = [];
      if (vote > 0)    metaParts.push(Math.round(vote * 10) + '%');
      if (year)        metaParts.push(year);
      if (genreNames.length) metaParts.push(genreNames.join(', '));
      const metaHtml = metaParts.length
        ? '<div class="nfx-card-overlay__meta">' + metaParts.map(escHtml).join('<span style="opacity:.4">·</span>') + '</div>'
        : '';

      overlay.innerHTML =
        '<div class="nfx-card-overlay__title">' + escHtml(title) + '</div>' +
        metaHtml;
      view.appendChild(overlay);

      /* Логотип (асинхронно) */
      if (data.id) {
        fetchLogo(data.id, type, function(path) {
          if (!path) return;
          const titleDiv = overlay.querySelector('.nfx-card-overlay__title');
          if (!titleDiv) return;
          const img = document.createElement('img');
          img.className = 'nfx-card-overlay__logo';
          img.loading = 'lazy';
          img.alt = title;
          img.src = tmdbImg(path, 'w300');
          img.onerror = () => img.style.display = 'none';
          titleDiv.replaceWith(img);
        });
      }
    }
  }

  function processCards(root) {
    const cards = (root || document).querySelectorAll('.card:not([data-agn-done])');
    // Обрабатываем батчами по 8 — не грузим UI-поток
    let i = 0;
    function batch() {
      const end = Math.min(i + 8, cards.length);
      for (; i < end; i++) {
        cards[i].setAttribute('data-agn-done','1');
        decorateCard(cards[i]);
      }
      if (i < cards.length) requestIdleCallback ? requestIdleCallback(batch) : setTimeout(batch, 16);
    }
    if (cards.length) batch();
  }

  /* ─── MUTATION OBSERVER ────────────────────────────────── */
  let obsTimer = 0;
  function startObserver() {
    if (!window.MutationObserver) return;
    const obs = new MutationObserver(function() {
      if (obsTimer) return;
      obsTimer = setTimeout(function() {
        obsTimer = 0;
        processCards();
      }, 120);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════════════════
     ЛЕВОЕ МЕНЮ
     ═══════════════════════════════════════════════════════ */

  /* SVG-иконки (простые, без лишних деталей) */
  const SVG = {
    home:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
    search:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
    fav:      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/></svg>',
    popular:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>',
    new:      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>',
    close:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  };

  let leftOpen  = false;
  let rightOpen = false;

  function buildLeftMenu() {
    if (qs('.agnative-leftmenu')) return;

    /* overlay */
    const overlay = document.createElement('div');
    overlay.className = 'agnative-leftmenu-overlay';
    overlay.addEventListener('click', closeLeftMenu);
    document.body.appendChild(overlay);

    /* trigger strip */
    const trigger = document.createElement('div');
    trigger.className = 'agnative-menu-trigger';
    trigger.addEventListener('click', toggleLeftMenu);
    document.body.appendChild(trigger);

    /* само меню */
    const menu = document.createElement('div');
    menu.className = 'agnative-leftmenu';
    menu.setAttribute('role','navigation');

    /* Шапка */
    const header = document.createElement('div');
    header.className = 'agnative-leftmenu__header';
    header.innerHTML = '<div class="agnative-leftmenu__logo">AG<span>Native</span></div>';
    menu.appendChild(header);

    /* Пункты меню */
    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'agnative-leftmenu__items';

    const navItems = [
      { icon: SVG.home,    label: 'Главная',   action: 'main'      },
      { icon: SVG.popular, label: 'Популярное',action: 'popular'   },
      { icon: SVG.new,     label: 'Новинки',   action: 'fresh'     },
      { icon: SVG.fav,     label: 'Избранное', action: 'favorite'  },
      { icon: SVG.search,  label: 'Поиск',     action: 'search'    },
    ];

    navItems.forEach(function(def) {
      const item = document.createElement('div');
      item.className = 'agnative-leftmenu__item selector';
      item.setAttribute('data-action', def.action);
      item.setAttribute('tabindex','0');
      item.innerHTML =
        '<span class="agnative-leftmenu__icon">' + def.icon + '</span>' +
        '<span>' + def.label + '</span>';
      item.addEventListener('click', function() {
        closeLeftMenu();
        triggerMenuAction(def.action);
      });
      hoverBind(item);
      itemsWrap.appendChild(item);
    });
    menu.appendChild(itemsWrap);

    /* Футер — настройки */
    const footer = document.createElement('div');
    footer.className = 'agnative-leftmenu__footer';

    const settingsItem = document.createElement('div');
    settingsItem.className = 'agnative-leftmenu__footer-item selector';
    settingsItem.setAttribute('tabindex','0');
    settingsItem.innerHTML =
      '<span style="width:18px;height:18px;display:inline-block">' + SVG.settings + '</span>' +
      '<span>Настройки</span>';
    settingsItem.addEventListener('click', function() {
      closeLeftMenu();
      triggerSettings();
    });
    hoverBind(settingsItem);
    footer.appendChild(settingsItem);
    menu.appendChild(footer);

    document.body.appendChild(menu);

    /* Регистрируем Lampa-контроллер */
    registerLeftMenuController(menu);
  }

  function buildRightMenu() {
    if (qs('.agnative-rightmenu')) return;

    const menu = document.createElement('div');
    menu.className = 'agnative-rightmenu';
    menu.setAttribute('role','menu');

    const header = document.createElement('div');
    header.className = 'agnative-rightmenu__header';
    header.textContent = 'Действия';
    menu.appendChild(header);

    const actions = [
      { icon: SVG.search,   label: 'Поиск',     fn: triggerSearch    },
      { icon: SVG.fav,      label: 'Избранное',  fn: triggerFavorite  },
      { icon: SVG.settings, label: 'Настройки',  fn: triggerSettings  },
      { icon: SVG.close,    label: 'Закрыть',    fn: closeRightMenu   },
    ];

    actions.forEach(function(def) {
      const item = document.createElement('div');
      item.className = 'agnative-rightmenu__item selector';
      item.setAttribute('tabindex','0');
      item.innerHTML =
        '<span style="width:20px;height:20px;display:inline-block;flex-shrink:0">' + def.icon + '</span>' +
        '<span>' + def.label + '</span>';
      item.addEventListener('click', function() { closeRightMenu(); def.fn(); });
      hoverBind(item);
      menu.appendChild(item);
    });

    document.body.appendChild(menu);
    registerRightMenuController(menu);
  }

  function toggleLeftMenu() {
    leftOpen ? closeLeftMenu() : openLeftMenu();
  }

  function openLeftMenu() {
    const menu    = qs('.agnative-leftmenu');
    const overlay = qs('.agnative-leftmenu-overlay');
    if (!menu) return;
    leftOpen = true;
    menu.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    if (window.Lampa && Lampa.Controller)
      try { Lampa.Controller.toggle('agnative_leftmenu'); } catch {}
  }

  function closeLeftMenu() {
    const menu    = qs('.agnative-leftmenu');
    const overlay = qs('.agnative-leftmenu-overlay');
    if (!menu) return;
    leftOpen = false;
    menu.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    try { if (window.Lampa && Lampa.Controller) Lampa.Controller.toggle('content'); } catch {}
  }

  function openRightMenu() {
    const menu = qs('.agnative-rightmenu');
    if (!menu) return;
    rightOpen = true;
    menu.classList.add('is-open');
    if (window.Lampa && Lampa.Controller)
      try { Lampa.Controller.toggle('agnative_rightmenu'); } catch {}
  }

  function closeRightMenu() {
    const menu = qs('.agnative-rightmenu');
    if (!menu) return;
    rightOpen = false;
    menu.classList.remove('is-open');
    try { if (window.Lampa && Lampa.Controller) Lampa.Controller.toggle('content'); } catch {}
  }

  /* ─── Lampa-контроллеры для меню ──────────────────────── */
  function registerLeftMenuController(menu) {
    if (!window.Lampa || !Lampa.Controller || !window.$) return;
    try {
      Lampa.Controller.add('agnative_leftmenu', {
        toggle: function() {
          const view = $(menu);
          const first = menu.querySelector('.selector');
          Lampa.Controller.collectionSet(view);
          Lampa.Controller.collectionFocus(first || false, view, true);
        },
        update: function() {},
        up:   function() { window.Navigator && Navigator.move && Navigator.move('up');   },
        down: function() { window.Navigator && Navigator.move && Navigator.move('down'); },
        right: function() { closeLeftMenu(); try { Lampa.Controller.toggle('content'); } catch {} },
        back:  function() { closeLeftMenu(); },
        left:  function() {}
      });
    } catch(e) {}
  }

  function registerRightMenuController(menu) {
    if (!window.Lampa || !Lampa.Controller || !window.$) return;
    try {
      Lampa.Controller.add('agnative_rightmenu', {
        toggle: function() {
          const view = $(menu);
          const first = menu.querySelector('.selector');
          Lampa.Controller.collectionSet(view);
          Lampa.Controller.collectionFocus(first || false, view, true);
        },
        update: function() {},
        up:   function() { window.Navigator && Navigator.move && Navigator.move('up');   },
        down: function() { window.Navigator && Navigator.move && Navigator.move('down'); },
        left:  function() { closeRightMenu(); try { Lampa.Controller.toggle('content'); } catch {} },
        back:  function() { closeRightMenu(); },
        right: function() {}
      });
    } catch(e) {}
  }

  /* ─── Перехват стрелок: left на крайнем левом → открыть меню ── */
  function patchContentController() {
    if (!window.Lampa || !Lampa.Controller) return;
    try {
      const orig = Lampa.Controller.add;
      Lampa.Controller.add = function(name, ctrl) {
        if (name === 'content' && ctrl) {
          const origLeft = ctrl.left;
          ctrl.left = function() {
            if (origLeft) origLeft.call(this);
            // если Navigator не может идти влево — открываем левое меню
            if (window.Navigator && Navigator.canmove && !Navigator.canmove('left') && leftMenuOn()) {
              openLeftMenu();
            }
          };
        }
        return orig.call(this, name, ctrl);
      };
    } catch(e) {}
  }

  /* ─── Действия ─────────────────────────────────────────── */
  function triggerMenuAction(action) {
    if (!window.Lampa) return false;
    try {
      const items = document.querySelectorAll('.menu__item');
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const act = it.getAttribute('data-action') || '';
        if (act === action || (it.dataset && it.dataset.component === action)) {
          it.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return true;
        }
      }
      // попытка через Activity
      if (Lampa.Activity && Lampa.Activity.push) {
        Lampa.Activity.push({ component: action });
        return true;
      }
    } catch(e) {}
    return false;
  }

  function triggerSearch() {
    try {
      const btn = qs('.head .search') || qs('[data-action="search"]') || qs('.button--search');
      if (btn) { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
      if (window.Lampa && Lampa.Activity) Lampa.Activity.push({ component: 'search' });
    } catch(e) {}
  }

  function triggerFavorite() {
    try {
      const btn = qs('[data-action="favorite"]') || qs('.head .favorite');
      if (btn) { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
      if (window.Lampa && Lampa.Activity) Lampa.Activity.push({ component: 'favorite' });
    } catch(e) {}
  }

  function triggerSettings() {
    try {
      const btn = qs('[data-action="settings"]') || qs('.settings-trigger');
      if (btn) { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
      if (window.Lampa && Lampa.Settings && Lampa.Settings.open) Lampa.Settings.open();
      else if (window.Lampa && Lampa.Activity) Lampa.Activity.push({ component: 'settings' });
    } catch(e) {}
  }

  /* ─── Hover-bind (Lampa $) ─────────────────────────────── */
  function hoverBind(el) {
    el.addEventListener('mouseenter', () => el.classList.add('hover'));
    el.addEventListener('mouseleave', () => el.classList.remove('hover'));
    if (window.$) {
      try {
        $(el).on('hover:focus hover:hover', () => el.classList.add('focus'));
        $(el).on('hover:blur hover:out',    () => el.classList.remove('focus'));
        $(el).on('hover:enter', function() { el.dispatchEvent(new MouseEvent('click',{bubbles:true})); });
      } catch(e) {}
    }
  }

  /* ─── НАСТРОЙКИ ПЛАГИНА ────────────────────────────────── */
  function registerSettings() {
    if (!window.Lampa || !Lampa.Settings || !Lampa.SettingsApi) return;
    try {
      Lampa.SettingsApi.addParam({
        component: 'agnative_atv9',
        param: {
          name: 'agnative_atv9_enabled',
          type: 'toggle',
          default: true,
          values: { false: 'Выключить', true: 'Включить' }
        },
        field: { name: 'AgNative ATV9', description: 'Включает/выключает плагин' },
        onChange: function() { location.reload(); }
      });

      Lampa.SettingsApi.addParam({
        component: 'agnative_atv9',
        param: {
          name: K.BADGE,
          type: 'toggle',
          default: true,
          values: { false: 'Скрыть', true: 'Показать' }
        },
        field: { name: 'Бейдж Фильм/Сериал', description: 'Метка типа контента на постере' }
      });

      Lampa.SettingsApi.addParam({
        component: 'agnative_atv9',
        param: {
          name: K.RATING,
          type: 'toggle',
          default: true,
          values: { false: 'Скрыть', true: 'Показать' }
        },
        field: { name: 'Рейтинг TMDB', description: 'Оценка в правом углу постера' }
      });

      Lampa.SettingsApi.addParam({
        component: 'agnative_atv9',
        param: {
          name: K.CARD_BORDER,
          type: 'toggle',
          default: true,
          values: { false: 'Выключить', true: 'Включить' }
        },
        field: { name: 'Рамка фокуса', description: 'Мини-рамка вокруг постера при фокусе (Android TV)' }
      });

      Lampa.SettingsApi.addParam({
        component: 'agnative_atv9',
        param: {
          name: K.LEFT_MENU,
          type: 'toggle',
          default: true,
          values: { false: 'Выключить', true: 'Включить' }
        },
        field: { name: 'Левое меню', description: 'Боковое меню навигации' }
      });

      Lampa.SettingsApi.addParam({
        component: 'agnative_atv9',
        param: {
          name: K.RIGHT_MENU,
          type: 'toggle',
          default: true,
          values: { false: 'Выключить', true: 'Включить' }
        },
        field: { name: 'Правое меню', description: 'Панель быстрых действий' }
      });

      Lampa.SettingsApi.addParam({
        component: 'agnative_atv9',
        param: {
          name: K.CARD_SIZE,
          type: 'select',
          default: 'md',
          values: { xs: 'Очень маленький', sm: 'Маленький', md: 'Обычный', lg: 'Большой', xl: 'Огромный' }
        },
        field: { name: 'Размер карточек', description: 'Ширина постеров в лентах' }
      });

      Lampa.SettingsApi.addParam({
        component: 'agnative_atv9',
        param: {
          name: K.LOGO_LANG,
          type: 'select',
          default: 'ru',
          values: { ru: 'Русский', en: 'English', uk: 'Українська' }
        },
        field: { name: 'Язык логотипов', description: 'Язык для получения логотипа с TMDB' }
      });

      Lampa.SettingsApi.addParam({
        component: 'agnative_atv9',
        param: {
          name: K.POSTER_QUALITY,
          type: 'select',
          default: 'w342',
          values: { w185: 'Низкое (w185)', w342: 'Среднее (w342)', w500: 'Высокое (w500)', w780: 'Максимум (w780)' }
        },
        field: { name: 'Качество постеров', description: 'Разрешение изображений постеров' }
      });

      /* Кнопка сброса */
      Lampa.SettingsApi.addParam({
        component: 'agnative_atv9',
        param: { name: 'agnative_atv9_reset', type: 'button', default: '' },
        field: { name: 'Сбросить настройки', description: 'Вернуть все параметры к значениям по умолчанию' },
        onChange: function() {
          [K.ENABLED, K.BADGE, K.RATING, K.CARD_BORDER, K.LEFT_MENU, K.RIGHT_MENU,
           K.CARD_SIZE, K.LOGO_LANG, K.POSTER_QUALITY].forEach(k => {
            try { localStorage.removeItem(k); } catch {}
          });
          if (window.Lampa && Lampa.Noty) Lampa.Noty.show('AgNative ATV9: настройки сброшены');
          setTimeout(() => location.reload(), 800);
        }
      });

      /* Раздел в настройках */
      Lampa.Settings.add('agnative_atv9', {
        name: 'AgNative ATV9',
        description: 'Плагин для Android TV 9',
        icon: SVG.settings
      });
    } catch(e) {}
  }

  /* ─── ЗНАЧОК ВЕРСИИ ─────────────────────────────────────── */
  function addVersionBadge() {
    if (qs('.agnative-version-badge')) return;
    const el = document.createElement('div');
    el.className = 'agnative-version-badge';
    el.textContent = 'AgNative ATV9 v' + PLUGIN_VERSION;
    document.body.appendChild(el);
  }

  /* ─── ПЕРЕХВАТ НАЖАТИЯ НАЗАД / МЕНЮ ────────────────────── */
  function bindGlobalKeys() {
    document.addEventListener('keydown', function(e) {
      /* Кнопка MENU (keyCode 82 — Lampa/Android TV) или F1 */
      if (e.keyCode === 82 || e.key === 'ContextMenu') {
        e.preventDefault();
        toggleLeftMenu();
        return;
      }
      /* Escape — закрыть любое открытое меню */
      if (e.key === 'Escape') {
        if (leftOpen)  { closeLeftMenu();  return; }
        if (rightOpen) { closeRightMenu(); return; }
      }
    }, { passive: false });
  }

  /* ─── ИНИЦИАЛИЗАЦИЯ ─────────────────────────────────────── */
  function startPlugin() {
    if (!pluginEnabled()) return;
    injectStyles();
    buildLeftMenu();
    if (rightMenuOn()) buildRightMenu();
    addVersionBadge();
    bindGlobalKeys();
    patchContentController();
    processCards();
    startObserver();
    // Периодическая проверка новых карточек (на случай lazy-load)
    let tickCount = 0;
    const ticker = setInterval(function() {
      processCards();
      if (++tickCount > 60) clearInterval(ticker);
    }, 2000);
  }

  function bootPlugin() {
    registerSettings();
    startPlugin();
  }

  /* ─── ЗАПУСК ────────────────────────────────────────────── */
  if (window.appready) {
    bootPlugin();
  } else {
    try {
      if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
          if (e.type === 'ready') bootPlugin();
        });
      } else {
        document.addEventListener('DOMContentLoaded', bootPlugin);
      }
    } catch(e) {
      document.addEventListener('DOMContentLoaded', bootPlugin);
    }
  }

})();
