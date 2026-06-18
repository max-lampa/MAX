(function () {
    'use strict';

    var PLUGIN_NAME = 'NetflixTheme';
    var PLUGIN_VERSION = '1.0.0';

    /* ─────────────────────────── CSS ─────────────────────────── */
    var CSS = `
/* ══════════════════════════════════════════════
   NETFLIX BLACK-RED THEME FOR LAMPA  v${PLUGIN_VERSION}
   ══════════════════════════════════════════════ */

:root {
    --nf-red:        #e50914;
    --nf-red-dark:   #b00710;
    --nf-red-soft:   #c11119;
    --nf-bg:         #0d0d0d;
    --nf-bg2:        #141414;
    --nf-bg3:        #1a1a1a;
    --nf-bg4:        #222222;
    --nf-surface:    #1c1c1c;
    --nf-card:       #181818;
    --nf-border:     #2a2a2a;
    --nf-text:       #ffffff;
    --nf-text-dim:   #b3b3b3;
    --nf-text-mute:  #737373;
    --nf-gold:       #e8b84b;
    --nf-badge-bg:   rgba(0,0,0,0.75);
    --nf-radius-sm:  6px;
    --nf-radius-md:  10px;
    --nf-radius-lg:  14px;
    --nf-radius-xl:  20px;
    --nf-shadow:     0 4px 20px rgba(0,0,0,0.8);
    --nf-shadow-red: 0 4px 24px rgba(229,9,20,0.4);
}

/* ── RESET BODY ── */
body, html {
    background: var(--nf-bg) !important;
    color: var(--nf-text) !important;
    font-family: 'Netflix Sans', 'Helvetica Neue', Arial, sans-serif !important;
}

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--nf-bg2); }
::-webkit-scrollbar-thumb { background: var(--nf-red); border-radius: 2px; }

/* ════════════════════════════════════
   BACKGROUND LAYERS
   ════════════════════════════════════ */
.layer--nav,
.layer--head,
.layer--body,
.layer--screen {
    background: var(--nf-bg) !important;
}

.wrap--main { background: var(--nf-bg) !important; }

/* ════════════════════════════════════
   BOTTOM NAVIGATION BAR
   ════════════════════════════════════ */
.menu {
    background: linear-gradient(0deg, #0d0d0d 80%, rgba(13,13,13,0)) !important;
    border-top: 1px solid var(--nf-border) !important;
    padding-bottom: env(safe-area-inset-bottom, 8px) !important;
}

.menu--item {
    color: var(--nf-text-mute) !important;
    transition: color 0.2s ease !important;
}

.menu--item.focus,
.menu--item:focus,
.menu--item.active {
    color: var(--nf-red) !important;
    background: transparent !important;
}

.menu--item .menu--item-icon svg,
.menu--item .menu--item-icon path {
    fill: currentColor !important;
    stroke: currentColor !important;
}

.menu--item.active .menu--item-label {
    color: var(--nf-red) !important;
}

/* ════════════════════════════════════
   HEADER / TOOLBAR
   ════════════════════════════════════ */
.head {
    background: linear-gradient(180deg, rgba(13,13,13,0.98) 0%, rgba(13,13,13,0)) !important;
    border-bottom: none !important;
}

.head--logo,
.head--logo svg,
.head--logo path {
    fill: var(--nf-red) !important;
    color: var(--nf-red) !important;
}

/* ════════════════════════════════════
   HERO / FEATURED BANNER
   ════════════════════════════════════ */
.full--start,
.full--start-gradient {
    background: linear-gradient(
        0deg,
        var(--nf-bg) 0%,
        rgba(13,13,13,0.7) 40%,
        transparent 100%
    ) !important;
}

.full--start-body {
    background: transparent !important;
}

.full--start-title {
    font-size: 1.6em !important;
    font-weight: 800 !important;
    color: var(--nf-text) !important;
    text-shadow: 0 2px 8px rgba(0,0,0,0.9) !important;
    letter-spacing: 0.01em !important;
}

.full--start-descr {
    color: var(--nf-text-dim) !important;
    font-size: 0.88em !important;
    line-height: 1.5 !important;
}

.full--start-tags .tag {
    background: rgba(255,255,255,0.1) !important;
    border: 1px solid rgba(255,255,255,0.18) !important;
    color: var(--nf-text) !important;
    border-radius: 20px !important;
    font-size: 0.75em !important;
    padding: 3px 10px !important;
}

/* ════════════════════════════════════
   WATCH / PLAY BUTTON
   ════════════════════════════════════ */
.button--play,
.full--start-play,
.selector.button--play {
    background: var(--nf-red) !important;
    color: var(--nf-text) !important;
    border: none !important;
    border-radius: var(--nf-radius-xl) !important;
    font-weight: 700 !important;
    font-size: 1em !important;
    padding: 13px 32px !important;
    box-shadow: var(--nf-shadow-red) !important;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s !important;
    letter-spacing: 0.02em !important;
}

.button--play:hover,
.button--play.focus,
.full--start-play.focus {
    background: var(--nf-red-dark) !important;
    transform: scale(1.03) !important;
    box-shadow: 0 6px 28px rgba(229,9,20,0.6) !important;
}

/* ════════════════════════════════════
   SECTION HEADERS  (СЕРИАЛЫ / ФИЛЬМЫ …)
   ════════════════════════════════════ */
.category--title,
.category-title,
.content--head,
.content--head-title,
.scroll--title {
    color: var(--nf-text) !important;
    font-weight: 800 !important;
    font-size: 1.15em !important;
    letter-spacing: 0.03em !important;
    text-transform: uppercase !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
}

/* Red separator line before title */
.category--title::before,
.content--head-title::before,
.scroll--title::before {
    content: '' !important;
    display: inline-block !important;
    width: 4px !important;
    height: 1em !important;
    background: var(--nf-red) !important;
    border-radius: 2px !important;
    flex-shrink: 0 !important;
}

/* "Все" / "All" button */
.category--title-btn,
.content--head-more,
.scroll--title-more,
.all-btn {
    background: rgba(229,9,20,0.15) !important;
    color: var(--nf-text-dim) !important;
    border: 1px solid rgba(229,9,20,0.3) !important;
    border-radius: 20px !important;
    font-size: 0.78em !important;
    padding: 5px 14px !important;
    margin-left: auto !important;
    font-weight: 600 !important;
    transition: background 0.2s, color 0.2s !important;
}

.category--title-btn.focus,
.category--title-btn:hover,
.content--head-more.focus,
.scroll--title-more.focus {
    background: var(--nf-red) !important;
    color: var(--nf-text) !important;
    border-color: var(--nf-red) !important;
}

/* Horizontal red divider line under section header */
.category--line,
.content--head::after,
.scroll--head::after {
    background: linear-gradient(90deg, var(--nf-red), transparent) !important;
    height: 2px !important;
    border-radius: 1px !important;
}

/* ════════════════════════════════════
   MOVIE / SERIES CARDS
   ════════════════════════════════════ */
.card,
.card--poster,
.card-item,
.card--mini {
    background: var(--nf-card) !important;
    border-radius: var(--nf-radius-md) !important;
    overflow: hidden !important;
    transition: transform 0.22s cubic-bezier(.25,.8,.25,1), box-shadow 0.22s ease !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.6) !important;
    border: 1px solid transparent !important;
    position: relative !important;
}

.card.focus,
.card:focus,
.card--poster.focus,
.card-item.focus,
.card--mini.focus {
    transform: scale(1.06) !important;
    box-shadow: 0 8px 30px rgba(229,9,20,0.35), 0 2px 10px rgba(0,0,0,0.8) !important;
    border-color: var(--nf-red) !important;
    z-index: 10 !important;
}

.card--img,
.card--poster-img {
    border-radius: var(--nf-radius-md) var(--nf-radius-md) 0 0 !important;
    object-fit: cover !important;
}

.card--title,
.card--mini-title {
    color: var(--nf-text) !important;
    font-weight: 600 !important;
    font-size: 0.82em !important;
    padding: 6px 8px 8px !important;
    background: var(--nf-card) !important;
}

/* ── RATING BADGES (КП / IMDb) ── */
.card--badge,
.card--rate,
.card-rate,
.card--vote {
    position: absolute !important;
    top: 6px !important;
    left: 6px !important;
    background: var(--nf-badge-bg) !important;
    border: 1px solid rgba(255,255,255,0.12) !important;
    border-radius: 50px !important;
    font-size: 0.7em !important;
    font-weight: 700 !important;
    padding: 3px 8px !important;
    color: var(--nf-text) !important;
    backdrop-filter: blur(4px) !important;
}

/* КП badge — gold star */
.card--badge.kp,
.card--vote.kp {
    color: var(--nf-gold) !important;
    border-color: rgba(232,184,75,0.3) !important;
}

/* IMDb badge */
.card--badge.imdb,
.card--vote.imdb {
    color: #f5c518 !important;
    border-color: rgba(245,197,24,0.3) !important;
    top: 6px !important;
    left: auto !important;
    right: 6px !important;
}

/* Year badge */
.card--year,
.card-year {
    position: absolute !important;
    top: 6px !important;
    right: 6px !important;
    background: var(--nf-badge-bg) !important;
    border-radius: 50px !important;
    font-size: 0.68em !important;
    padding: 3px 7px !important;
    color: var(--nf-text-dim) !important;
    font-weight: 500 !important;
}

/* NEW badge */
.card--new,
.badge--new {
    position: absolute !important;
    top: 6px !important;
    right: 6px !important;
    background: var(--nf-red) !important;
    color: var(--nf-text) !important;
    border-radius: 4px !important;
    font-size: 0.65em !important;
    font-weight: 800 !important;
    padding: 2px 6px !important;
    letter-spacing: 0.05em !important;
    text-transform: uppercase !important;
}

/* Episode badge (S1·E8) */
.card--episode,
.badge--episode {
    position: absolute !important;
    bottom: 6px !important;
    left: 6px !important;
    background: rgba(0,0,0,0.75) !important;
    color: var(--nf-text-dim) !important;
    border-radius: 4px !important;
    font-size: 0.65em !important;
    padding: 2px 6px !important;
    font-weight: 600 !important;
}

/* Number ranking (1, 2, 3…) overlaid on card */
.card--rank {
    position: absolute !important;
    bottom: -4px !important;
    left: -4px !important;
    font-size: 3.5em !important;
    font-weight: 900 !important;
    color: rgba(255,255,255,0.08) !important;
    line-height: 1 !important;
    pointer-events: none !important;
    -webkit-text-stroke: 1px rgba(255,255,255,0.15) !important;
}

/* ════════════════════════════════════
   MOVIE DETAIL / INFO PAGE
   ════════════════════════════════════ */
.movie--info,
.movie-page,
.item--page {
    background: var(--nf-bg) !important;
}

.movie--title,
.item--page-title {
    font-size: 1.7em !important;
    font-weight: 900 !important;
    color: var(--nf-text) !important;
    letter-spacing: 0.01em !important;
}

.movie--title-en,
.item--page-title-en {
    color: var(--nf-text-mute) !important;
    font-size: 0.9em !important;
    font-weight: 400 !important;
}

/* Info meta row: year, duration, HD */
.movie--meta,
.item--info-row {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    flex-wrap: wrap !important;
}

.movie--meta span,
.item--info-badge {
    background: rgba(255,255,255,0.08) !important;
    border: 1px solid rgba(255,255,255,0.12) !important;
    border-radius: 16px !important;
    padding: 4px 12px !important;
    font-size: 0.8em !important;
    font-weight: 600 !important;
    color: var(--nf-text) !important;
}

/* Genres / Countries chips */
.movie--genres span,
.item--genres-item,
.item--countries-item {
    background: rgba(255,255,255,0.06) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 16px !important;
    padding: 4px 12px !important;
    font-size: 0.78em !important;
    color: var(--nf-text-dim) !important;
    margin: 2px !important;
    display: inline-block !important;
}

/* Description text */
.movie--descr,
.item--page-descr {
    color: var(--nf-text-dim) !important;
    font-size: 0.88em !important;
    line-height: 1.6 !important;
}

/* Section label inside detail (Информация, Актёры…) */
.movie--section-title,
.item--section-title {
    color: var(--nf-text) !important;
    font-weight: 700 !important;
    font-size: 1em !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
}

.movie--section-title::before,
.item--section-title::before {
    content: '' !important;
    width: 3px !important;
    height: 1em !important;
    background: var(--nf-red) !important;
    border-radius: 2px !important;
    display: inline-block !important;
}

/* Action icons row (trailer, favourite, share) */
.button--icon,
.item--actions-btn {
    background: rgba(255,255,255,0.08) !important;
    border: 1px solid rgba(255,255,255,0.12) !important;
    border-radius: 50% !important;
    width: 44px !important;
    height: 44px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: background 0.2s, border-color 0.2s !important;
}

.button--icon.focus,
.button--icon:hover,
.item--actions-btn.focus {
    background: rgba(229,9,20,0.2) !important;
    border-color: var(--nf-red) !important;
}

/* ════════════════════════════════════
   BUTTONS (generic)
   ════════════════════════════════════ */
.button,
.selector {
    background: rgba(255,255,255,0.07) !important;
    color: var(--nf-text) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: var(--nf-radius-md) !important;
    transition: background 0.2s, border-color 0.2s !important;
}

.button.focus,
.button:hover,
.selector.focus {
    background: rgba(229,9,20,0.2) !important;
    border-color: var(--nf-red) !important;
    color: var(--nf-text) !important;
}

/* Primary action */
.button--action,
.button--main {
    background: var(--nf-red) !important;
    border-color: var(--nf-red) !important;
    color: var(--nf-text) !important;
    font-weight: 700 !important;
    border-radius: var(--nf-radius-xl) !important;
}

.button--action.focus,
.button--action:hover {
    background: var(--nf-red-dark) !important;
    border-color: var(--nf-red-dark) !important;
}

/* ════════════════════════════════════
   SEARCH
   ════════════════════════════════════ */
.search--input,
.input--search input {
    background: rgba(255,255,255,0.06) !important;
    border: 1px solid var(--nf-border) !important;
    border-radius: var(--nf-radius-lg) !important;
    color: var(--nf-text) !important;
    padding: 12px 16px !important;
    font-size: 0.95em !important;
}

.search--input:focus,
.input--search input:focus {
    border-color: var(--nf-red) !important;
    outline: none !important;
    box-shadow: 0 0 0 2px rgba(229,9,20,0.25) !important;
}

/* ════════════════════════════════════
   MODAL / POPUP
   ════════════════════════════════════ */
.modal,
.layer--popup {
    background: rgba(0,0,0,0.85) !important;
    backdrop-filter: blur(8px) !important;
}

.modal--inner,
.popup--inner {
    background: var(--nf-surface) !important;
    border-radius: var(--nf-radius-lg) !important;
    border: 1px solid var(--nf-border) !important;
    box-shadow: var(--nf-shadow) !important;
}

.modal--title,
.popup--title {
    color: var(--nf-text) !important;
    font-weight: 700 !important;
    font-size: 1.1em !important;
    border-bottom: 1px solid var(--nf-border) !important;
    padding-bottom: 12px !important;
}

/* ════════════════════════════════════
   SETTINGS / MENU LIST
   ════════════════════════════════════ */
.settings--item,
.settings-item {
    background: var(--nf-bg3) !important;
    border: 1px solid var(--nf-border) !important;
    border-radius: var(--nf-radius-sm) !important;
    color: var(--nf-text) !important;
    transition: background 0.18s, border-color 0.18s !important;
    margin-bottom: 4px !important;
}

.settings--item.focus,
.settings-item.focus {
    background: rgba(229,9,20,0.15) !important;
    border-color: var(--nf-red) !important;
}

.settings--item-title,
.settings-item-title {
    color: var(--nf-text) !important;
    font-weight: 600 !important;
}

.settings--item-subtitle,
.settings-item-subtitle {
    color: var(--nf-text-mute) !important;
    font-size: 0.82em !important;
}

/* Toggle switch */
.toggle,
.switch {
    background: var(--nf-bg4) !important;
    border: 1px solid var(--nf-border) !important;
    border-radius: 50px !important;
}

.toggle.enabled,
.switch.enabled,
.toggle[data-value="true"],
.switch.active {
    background: var(--nf-red) !important;
    border-color: var(--nf-red) !important;
}

/* ════════════════════════════════════
   PROGRESS BAR (watched progress)
   ════════════════════════════════════ */
.progress,
.progressbar {
    background: rgba(255,255,255,0.15) !important;
    border-radius: 2px !important;
    height: 3px !important;
}

.progress--bar,
.progressbar--fill {
    background: var(--nf-red) !important;
    border-radius: 2px !important;
}

/* ════════════════════════════════════
   LOADING / SKELETON
   ════════════════════════════════════ */
.skeleton,
.preloader {
    background: linear-gradient(
        90deg,
        var(--nf-bg3) 25%,
        rgba(40,40,40,0.8) 50%,
        var(--nf-bg3) 75%
    ) !important;
    background-size: 200% 100% !important;
    animation: nf-shimmer 1.4s infinite !important;
}

@keyframes nf-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Spinner */
.loading,
.loading svg path,
.loading svg circle {
    stroke: var(--nf-red) !important;
    color: var(--nf-red) !important;
}

/* ════════════════════════════════════
   TABS
   ════════════════════════════════════ */
.tabs--item,
.tab-item {
    color: var(--nf-text-mute) !important;
    border-bottom: 2px solid transparent !important;
    transition: color 0.18s, border-color 0.18s !important;
    font-weight: 600 !important;
}

.tabs--item.active,
.tabs--item.focus,
.tab-item.active {
    color: var(--nf-text) !important;
    border-bottom-color: var(--nf-red) !important;
}

/* ════════════════════════════════════
   HORIZONTAL SCROLL ROW
   ════════════════════════════════════ */
.scroll,
.scroll--list {
    scrollbar-width: none !important;
}
.scroll::-webkit-scrollbar,
.scroll--list::-webkit-scrollbar {
    display: none !important;
}

/* ════════════════════════════════════
   NOTIFICATIONS / TOASTS
   ════════════════════════════════════ */
.notification,
.toast {
    background: var(--nf-surface) !important;
    border: 1px solid var(--nf-border) !important;
    border-left: 3px solid var(--nf-red) !important;
    border-radius: var(--nf-radius-md) !important;
    color: var(--nf-text) !important;
    box-shadow: var(--nf-shadow) !important;
}

/* ════════════════════════════════════
   FOCUSED ELEMENT OUTLINE
   ════════════════════════════════════ */
*:focus-visible {
    outline: 2px solid var(--nf-red) !important;
    outline-offset: 2px !important;
}

/* ════════════════════════════════════
   SELECTION
   ════════════════════════════════════ */
::selection {
    background: rgba(229,9,20,0.35) !important;
    color: var(--nf-text) !important;
}
`;

    /* ─────────────────────────── PLUGIN LOGIC ─────────────────────────── */

    function injectStyles() {
        if (document.getElementById('nf-theme-css')) return;
        var style = document.createElement('style');
        style.id = 'nf-theme-css';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    function init() {
        injectStyles();

        /* Register with Lampa */
        if (window.Lampa && Lampa.Plugin) {
            Lampa.Plugin.add(PLUGIN_NAME, {
                start: function () {
                    injectStyles();
                }
            });
        }

        /* Re-inject after dynamic route changes */
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'start' || e.type === 'ready') {
                    injectStyles();
                }
            });
        }

        console.log('[' + PLUGIN_NAME + '] v' + PLUGIN_VERSION + ' loaded — Netflix black/red theme active');
    }

    /* ── Bootstrap ── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* Also re-apply a bit later in case Lampa re-renders on mount */
    setTimeout(injectStyles, 800);
    setTimeout(injectStyles, 2500);

})();
