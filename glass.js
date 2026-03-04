// Lampa.Plugin - Liquid Glass Apple Style v1.2.0
(function () {
    'use strict';

    var CONFIG = {
        PLUGIN_NAME: 'LiquidGlassApple',
        VERSION: '1.2.0',
        PERFORMANCE: {
            REDUCED_BLUR: true,
            GPU_ACCELERATION: true
        }
    };

    // Основной CSS темы
    var liquidGlassCSS = `
/* ================== LIQUID GLASS APPLE STYLE (tvOS-like) ================== */

/* Базовые переменные */
:root {
    --lg-transition-fast: transform 0.16s ease-out, opacity 0.16s ease-out !important;
    --lg-transform-base: translateZ(0) !important;
    --lg-blur-soft: 8px !important;
    --lg-blur-strong: 14px !important;

    --lg-shadow-soft: 0 10px 30px rgba(0, 0, 0, 0.22) !important;
    --lg-shadow-focus: 0 18px 50px rgba(0, 0, 0, 0.35) !important;

    --lg-border-main: 1.4px solid rgba(255,255,255,0.7) !important;
    --lg-border-subtle: 1px solid rgba(255,255,255,0.45) !important;

    --lg-radius-card: 22px !important;
    --lg-radius-pill: 18px !important;
    --lg-radius-chip: 14px !important;

    --lg-glow-focus: 0 0 0 1px rgba(255,255,255,0.7), 0 0 26px rgba(255,255,255,0.65) !important;
}

/* Фоновая подложка в стиле tvOS: мягкий градиент + лёгкий blur */
body,
.app,
.app__body {
    background:
        radial-gradient(circle at 0% 0%, rgba(255, 207, 167, 0.3) 0, transparent 55%),
        radial-gradient(circle at 100% 0%, rgba(166, 210, 255, 0.35) 0, transparent 55%),
        radial-gradient(circle at 10% 100%, rgba(193, 255, 214, 0.35) 0, transparent 55%),
        radial-gradient(circle at 90% 100%, rgba(199, 180, 255, 0.28) 0, transparent 55%),
        #05070b;
    background-attachment: fixed !important;
    backdrop-filter: blur(18px) !important;
    -webkit-backdrop-filter: blur(18px) !important;
}

/* ========= Названия в карточках: до 3 строк, чтобы почти всё помещалось ========= */

.card__title,
.card-v2__title,
.card__name {
    overflow: hidden !important;
    text-overflow: ellipsis !important;

    display: -webkit-box !important;
    -webkit-box-orient: vertical !important;

    /* даём 3 строки вместо 2 */
    -webkit-line-clamp: 3 !important;

    font-size: 0.9rem !important;
    line-height: 1.15em !important;
    max-height: calc(1.15em * 3) !important;

    word-wrap: break-word !important;
}

/* ============ КАРТОЧКИ КОНТЕНТА (главный стеклянный объект) ============ */

.card,
.card-v2 {
    background:
        linear-gradient(145deg,
            rgba(255,255,255,0.30),
            rgba(255,255,255,0.12)
        ) !important;
    backdrop-filter: blur(var(--lg-blur-soft)) !important;
    -webkit-backdrop-filter: blur(var(--lg-blur-soft)) !important;

    border-radius: var(--lg-radius-card);
    border: var(--lg-border-main);
    box-shadow: var(--lg-shadow-soft);

    transform: var(--lg-transform-base);
    -webkit-transform: var(--lg-transform-base);
    will-change: transform;

    transition: var(--lg-transition-fast);
    backface-visibility: hidden !important;
    -webkit-backface-visibility: hidden !important;

    overflow: hidden !important;
}

/* При фокусе — фирменный «подъём» карточки и подсветка рамки */
.card.focus,
.card.hover,
.card--focus,
.card.card--hover {
    z-index: 3 !important;
    transform: scale(1.08) translateZ(0) !important;
    -webkit-transform: scale(1.08) translateZ(0) !important;

    background:
        linear-gradient(150deg,
            rgba(255,255,255,0.42),
            rgba(255,255,255,0.20)
        ) !important;

    box-shadow: var(--lg-shadow-focus), var(--lg-glow-focus);
    border: 2px solid rgba(255,255,255,0.9) !important;
}

/* Слегка закругляем / защищаем постер внутри */
.card__view,
.card-v2__img {
    border-radius: calc(var(--lg-radius-card) - 4px) !important;
    overflow: hidden !important;
}

/* Рейтинги и качества в виде аккуратных «чипов» */
.card__vote,
.card__quality,
.explorer-card__head-rate {
    background:
        linear-gradient(135deg,
            rgba(0,0,0,0.56),
            rgba(0,0,0,0.80)
        ) !important;
    color: #fdfdfd !important;
    border-radius: var(--lg-radius-chip);
    border: var(--lg-border-subtle);
    padding: 3px 9px !important;
    font-weight: 600 !important;
    font-size: 0.78rem !important;

    backdrop-filter: blur(6px) !important;
    -webkit-backdrop-filter: blur(6px) !important;

    transform: var(--lg-transform-base);
    backface-visibility: hidden !important;
}

/* При фокусе карточки — лёгкий апгрейд чипа */
.card.focus .card__vote,
.card.focus .card__quality,
.card--focus .card__vote,
.card--focus .card__quality {
    background:
        linear-gradient(135deg,
            rgba(255,255,255,0.30),
            rgba(255,255,255,0.15)
        ) !important;
    color: #111318 !important;
}

/* =================== ГЛАВНОЕ МЕНЮ / ХЕДЕР / ИКОНКИ =================== */

.menu,
.menu__item {
    background:
        linear-gradient(135deg,
            rgba(255,255,255,0.26),
            rgba(255,255,255,0.10)
        ) !important;
    border-radius: var(--lg-radius-pill);
    border: var(--lg-border-subtle);
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;

    transform: var(--lg-transform-base);
    will-change: transform;
    backface-visibility: hidden !important;
}

/* Меню — ярко стеклянное только при фокусе */
.menu__item.focus,
.menu__item.hover,
.menu__item--focus {
    background:
        linear-gradient(135deg,
            rgba(255,255,255,0.90),
            rgba(255,255,255,0.70)
        ) !important;
    color: #05070b !important;
    box-shadow: var(--lg-shadow-soft), var(--lg-glow-focus);
    border: 2px solid rgba(255,255,255,0.95) !important;
}

/* Верхние действия и расширения */
.head__action,
.broadcast__scan > div,
.extensions__item {
    background:
        linear-gradient(135deg,
            rgba(255,255,255,0.28),
            rgba(255,255,255,0.12)
        ) !important;
    border-radius: var(--lg-radius-pill);
    border: var(--lg-border-subtle);
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;

    transform: var(--lg-transform-base);
    will-change: transform;
    backface-visibility: hidden !important;
}

.head__action.focus,
.extensions__item.focus {
    box-shadow: var(--lg-shadow-soft), var(--lg-glow-focus);
    background:
        linear-gradient(135deg,
            rgba(255,255,255,0.95),
            rgba(255,255,255,0.75)
        ) !important;
}

/* =================== КНОПКИ / СЕЛЕКТОРЫ / ФИЛЬТРЫ =================== */

.full-start__button,
.button,
.selector,
.filter,
.filter--sort {
    background:
        linear-gradient(135deg,
            rgba(255,255,255,0.30),
            rgba(255,255,255,0.12)
        ) !important;
    border-radius: var(--lg-radius-pill);
    border: var(--lg-border-subtle);
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;

    transform: var(--lg-transform-base);
    will-change: transform;
    backface-visibility: hidden !important;
}

.full-start__button.focus,
.button--focus,
.selector.focus,
.filter.focus {
    background:
        linear-gradient(135deg,
            rgba(255,255,255,0.96),
            rgba(255,255,255,0.78)
        ) !important;
    color: #05070b !important;
    box-shadow: var(--lg-shadow-soft), var(--lg-glow-focus);
    border: 2px solid rgba(255,255,255,0.96) !important;
}

/* =================== МОДАЛКИ / НАСТРОЙКИ / СЕЛЕКТБОКС =================== */

.modal__content,
.settings__content,
.selectbox {
    background:
        linear-gradient(145deg,
            rgba(15,16,23,0.96),
            rgba(23,26,36,0.96)
        ) !important;
    backdrop-filter: blur(var(--lg-blur-strong)) !important;
    -webkit-backdrop-filter: blur(var(--lg-blur-strong)) !important;

    border-radius: 24px !important;
    border: 1.4px solid rgba(255,255,255,0.18) !important;
    box-shadow: 0 24px 70px rgba(0,0,0,0.70) !important;

    transform: var(--lg-transform-base);
    backface-visibility: hidden !important;
}

/* Строки настроек — спокойные, без стеклянного «подсвета» */
.settings-param,
.settings-param__name,
.selectbox-item {
    background: rgba(255,255,255,0.03) !important;
    border-radius: 12px !important;
    border: 1px solid rgba(255,255,255,0.10) !important;

    /* без blur, чтобы не было “каждое выделение стекляшкой” */
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;

    transform: var(--lg-transform-base);
    backface-visibility: hidden !important;
}

/* Фокус в настройках — только лёгкое затемнение и граница */
.settings-param.focus,
.selectbox-item.focus,
.selectbox-item--focused {
    background: rgba(255,255,255,0.10) !important;
    border: 1px solid rgba(255,255,255,0.35) !important;
    box-shadow: none !important; /* убираем glow */
}

/* =================== ПОИСК / КЛАВИАТУРА =================== */

.search,
.search__input,
.simple-keyboard {
    background:
        linear-gradient(135deg,
            rgba(255,255,255,0.28),
            rgba(255,255,255,0.14)
        ) !important;
    border-radius: 18px !important;
    border: var(--lg-border-subtle);
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;

    transform: var(--lg-transform-base);
    backface-visibility: hidden !important;
}

/* =================== ПЛЕЕР / ПАНЕЛЬ УПРАВЛЕНИЯ =================== */

.player-panel,
.player-info,
.player-panel__body,
.player-panel__buttons {
    background:
        linear-gradient(150deg,
            rgba(7,9,15,0.95),
            rgba(21,24,32,0.95)
        ) !important;
    border-radius: 18px !important;
    border: 1px solid rgba(255,255,255,0.12) !important;
    backdrop-filter: blur(14px) !important;
    -webkit-backdrop-filter: blur(14px) !important;

    transform: var(--lg-transform-base);
    backface-visibility: hidden !important;
}

/* =================== ОНЛАЙН / ЛОАДЕРЫ =================== */

.online,
.online-prestige,
.online__loader {
    background:
        linear-gradient(135deg,
            rgba(255,255,255,0.22),
            rgba(255,255,255,0.10)
        ) !important;
    border-radius: 18px !important;
    border: var(--lg-border-subtle);
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;

    transform: var(--lg-transform-base);
    backface-visibility: hidden !important;
}

/* =================== GPU УСКОРЕНИЕ ДЛЯ КЛЮЧЕВЫХ ЭЛЕМЕНТОВ =================== */

.card,
.card-v2,
.menu__item,
.modal__content,
.settings__content,
.head__action,
.button,
.full-start__button,
.selector,
.filter,
.online,
.online-prestige,
.player-panel,
.player-info {
    -webkit-perspective: 1000 !important;
    perspective: 1000 !important;
}

/* =================== FALLBACK ДЛЯ УСТРОЙСТВ БЕЗ BACKDROP-FILTER =================== */

@supports not (backdrop-filter: blur(10px)) {
    .card,
    .card-v2,
    .menu__item,
    .head__action,
    .button,
    .full-start__button,
    .filter,
    .online,
    .online-prestige {
        background: rgba(35,37,45,0.96) !important;
        border: 1px solid rgba(255,255,255,0.16) !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.55) !important;
    }

    .modal__content,
    .settings__content {
        background: rgba(10,11,16,0.98) !important;
    }
}

/* =================== РЕЖИМ НИЗКОЙ ПРОИЗВОДИТЕЛЬНОСТИ =================== */

body.drxaos-low-power .card,
body.drxaos-low-power .card-v2,
body.drxaos-low-power .menu__item,
body.drxaos-low-power .head__action,
body.drxaos-low-power .button,
body.drxaos-low-power .full-start__button,
body.drxaos-low-power .modal__content,
body.drxaos-low-power .settings__content,
body.drxaos-low-power .online,
body.drxaos-low-power .online-prestige {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
    filter: none !important;
    -webkit-filter: none !important;
    background-color: rgba(15,17,22,0.98) !important;
}

body.drxaos-low-power .card.focus,
body.drxaos-low-power .card.hover,
body.drxaos-low-power .card--focus {
    transform: none !important;
    box-shadow: none !important;
}
    `;

    // Определение платформы для оптимизации
    function detectPlatform() {
        try {
            var ua = (navigator.userAgent || '').toLowerCase();
            var isAndroid = /android/i.test(ua);
            var isTV = /tv|smarttv|hbbtv/i.test(ua) || window.innerWidth >= 1280;

            if (isAndroid) {
                document.body.classList.add('drxaos-android-mobile');
                document.body.classList.add('drxaos-low-power');
            }

            if (isTV) {
                document.body.classList.add('drxaos-tv');
            }
        } catch (e) {
            console.error(CONFIG.PLUGIN_NAME + ' detectPlatform error:', e);
        }
    }

    // Инициализация темы
    function init() {
        detectPlatform();

        var styleElement = document.getElementById('liquid-glass-apple-theme');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'liquid-glass-apple-theme';
            styleElement.textContent = liquidGlassCSS;
            document.head.appendChild(styleElement);
        }

        console.log(CONFIG.PLUGIN_NAME + ' v' + CONFIG.VERSION + ' - initialized');
    }

    // Запуск
    if (window.Lampa) {
        init();
    } else {
        window.addEventListener('app-ready', init);
    }

})();