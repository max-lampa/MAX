
// ============================================================
//  LAMPA — CARD DESIGN PLUGIN v2.0
//  Язык настроек: Русский
//  Функции: Дизайн карточек, Эффекты фокуса, Бэкдроп + Лого
// ============================================================
(function () {
    'use strict';

    var STYLE_ID = 'lampa-card-design-style';
    var OVERLAY_CLASS = 'lcd-overlay';
    var observer = null;

    // ──────────────────────────────────────────────
    //  Хранилище настроек
    // ──────────────────────────────────────────────
    var Settings = {
        // Карточка
        radius:       function () { return Lampa.Storage.get('lcd_radius',        '1.5'); },
        borderWidth:  function () { return Lampa.Storage.get('lcd_border_width',  '2');   },
        borderColor:  function () { return Lampa.Storage.get('lcd_border_color',  '#00e5ff'); },
        focusScale:   function () { return Lampa.Storage.get('lcd_focus_scale',   '1.08'); },
        // Эффект фокуса
        focusEffect:  function () { return Lampa.Storage.get('lcd_focus_effect',  'glow'); },
        glowIntensity:function () { return Lampa.Storage.get('lcd_glow_intensity','medium'); },
        focusAnimation:function(){ return Lampa.Storage.get('lcd_focus_anim',    'scale'); },
        // Бэкдроп + Лого
        showBackdrop: function () { return Lampa.Storage.get('lcd_show_backdrop', 'true'); },
        backdropStyle:function () { return Lampa.Storage.get('lcd_backdrop_style','gradient'); },
        showLogo:     function () { return Lampa.Storage.get('lcd_show_logo',     'true'); },
        logoPosition: function () { return Lampa.Storage.get('lcd_logo_position', 'bottom-left'); },
        logoSize:     function () { return Lampa.Storage.get('lcd_logo_size',     'medium'); },
    };

    // ──────────────────────────────────────────────
    //  Вычисление CSS-переменных из настроек
    // ──────────────────────────────────────────────
    function buildGlow(color, intensity) {
        var sizes = { low: '8px 20px', medium: '12px 35px', high: '18px 55px' };
        var s = sizes[intensity] || sizes.medium;
        var parts = s.split(' ');
        var a = parts[0], b = parts[1];
        return '0 0 ' + a + ' ' + color + ', 0 0 ' + b + ' ' + color;
    }

    function buildFocusTransform(animType, scale) {
        var sc = parseFloat(scale) || 1.08;
        switch (animType) {
            case 'scale':       return 'scale(' + sc + ')';
            case 'lift':        return 'scale(' + sc + ') translateY(-6px)';
            case 'tilt':        return 'scale(' + sc + ') rotate(-1deg)';
            case 'none':        return 'scale(1)';
            default:            return 'scale(' + sc + ')';
        }
    }

    function buildFocusBorder(effect, bW, bC) {
        if (effect === 'none') return 'transparent';
        return bC;
    }

    // ──────────────────────────────────────────────
    //  Генерация и применение CSS
    // ──────────────────────────────────────────────
    function applyStyles() {
        var existing = document.getElementById(STYLE_ID);
        if (existing) existing.remove();

        var r    = Settings.radius() + 'em';
        var bW   = Settings.borderWidth() + 'px';
        var bC   = Settings.borderColor();
        var sc   = Settings.focusScale();
        var fx   = Settings.focusEffect();
        var glW  = Settings.glowIntensity();
        var anim = Settings.focusAnimation();

        var focusTransform  = buildFocusTransform(anim, sc);
        var focusBorderColor = buildFocusBorder(fx, bW, bC);
        var glowShadow = (fx === 'glow' || fx === 'glow+border')
            ? buildGlow(bC, glW)
            : '0 10px 30px rgba(0,0,0,0.55)';
        var hasBorder = (fx === 'border' || fx === 'glow+border' || fx === 'glow')
            ? bW + ' solid ' + focusBorderColor
            : bW + ' solid transparent';

        // Переход зависит от выбранной анимации
        var transition = 'transform 0.22s cubic-bezier(0.25,1,0.5,1), box-shadow 0.22s ease, border-color 0.22s ease';

        // Размеры лого
        var logoSizes = { small: '32px', medium: '48px', large: '64px' };
        var logoH = logoSizes[Settings.logoSize()] || '48px';

        // Позиция лого
        var lPos = Settings.logoPosition();
        var logoCSS = '';
        switch (lPos) {
            case 'bottom-left':  logoCSS = 'bottom:8px; left:8px;';  break;
            case 'bottom-right': logoCSS = 'bottom:8px; right:8px;'; break;
            case 'top-left':     logoCSS = 'top:8px;    left:8px;';  break;
            case 'top-right':    logoCSS = 'top:8px;    right:8px;'; break;
            case 'center':       logoCSS = 'top:50%;    left:50%;    transform:translate(-50%,-50%);'; break;
        }

        var css = `
/* ── LCD: Базовая карточка ── */
.card__view {
    border: ${bW} solid transparent;
    transition: ${transition} !important;
    will-change: transform;
    transform: translateZ(0);
    border-radius: ${r} !important;
    overflow: hidden !important;
    position: relative;
}
.card__img {
    border-radius: ${r} !important;
    backface-visibility: hidden;
}

/* ── LCD: Фокус ── */
.card.focus .card__view {
    transform: ${focusTransform} !important;
    border: ${hasBorder} !important;
    box-shadow: ${glowShadow} !important;
    z-index: 10;
}
.card.focus .card__view::after {
    display: none !important;
}

/* ── LCD: Оверлей бэкдропа ── */
.${OVERLAY_CLASS} {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: ${r};
}
.card.focus .${OVERLAY_CLASS} {
    opacity: 1;
}

/* ── LCD: Стиль бэкдропа — градиент ── */
.${OVERLAY_CLASS}[data-style="gradient"] {
    background: linear-gradient(
        to top,
        rgba(0,0,0,0.82) 0%,
        rgba(0,0,0,0.45) 40%,
        transparent 70%
    );
}
/* ── LCD: Стиль бэкдропа — solid ── */
.${OVERLAY_CLASS}[data-style="solid"] {
    background: rgba(0,0,0,0.55);
}
/* ── LCD: Стиль бэкдропа — blur ── */
.${OVERLAY_CLASS}[data-style="blur"] {
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}
/* ── LCD: Стиль бэкдропа — none ── */
.${OVERLAY_CLASS}[data-style="none"] {
    background: transparent;
}

/* ── LCD: Лого на постере ── */
.lcd-logo {
    position: absolute;
    ${logoCSS}
    z-index: 3;
    max-height: ${logoH};
    max-width: 80%;
    object-fit: contain;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.8));
}
.card.focus .lcd-logo {
    opacity: 1;
}

/* ── LCD: Рейтинг / тайтл при фокусе ── */
.card.focus .card__title {
    color: ${bC} !important;
    transition: color 0.2s ease;
}

/* ── LCD: Модалки ── */
.settings__content,
.selectbox__content,
.modal__content {
    border-radius: ${r} !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    background: #1a1a1a !important;
    backdrop-filter: none !important;
}
        `;

        var styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.textContent = css;
        document.head.appendChild(styleEl);

        // Обновить оверлеи на уже существующих карточках
        refreshOverlays();
    }

    // ──────────────────────────────────────────────
    //  Инъекция оверлея и лого в карточку
    // ──────────────────────────────────────────────
    function injectOverlay(cardEl) {
        var view = cardEl.querySelector('.card__view');
        if (!view) return;
        if (view.querySelector('.' + OVERLAY_CLASS)) return; // уже есть

        var showBackdrop = Settings.showBackdrop() === 'true';
        var showLogo     = Settings.showLogo()     === 'true';
        var bdStyle      = Settings.backdropStyle();

        // Бэкдроп
        if (showBackdrop) {
            var overlay = document.createElement('div');
            overlay.className = OVERLAY_CLASS;
            overlay.setAttribute('data-style', bdStyle);
            view.appendChild(overlay);
        }

        // Лого — берём из data-атрибутов самой карточки (Lampa хранит их там)
        if (showLogo) {
            var logoSrc = cardEl.getAttribute('data-logo')
                || cardEl.getAttribute('data-logo-ru')
                || cardEl.getAttribute('data-logo-en')
                || '';

            // Fallback: взять из img если нет лого
            if (logoSrc) {
                var logo = document.createElement('img');
                logo.className = 'lcd-logo';
                logo.src = logoSrc;
                logo.alt = '';
                logo.setAttribute('loading', 'lazy');
                view.appendChild(logo);
            }
        }
    }

    function refreshOverlays() {
        // Удаляем старые оверлеи
        document.querySelectorAll('.' + OVERLAY_CLASS + ', .lcd-logo').forEach(function (el) {
            el.remove();
        });
        // Инжектируем заново
        document.querySelectorAll('.card').forEach(injectOverlay);
    }

    // ──────────────────────────────────────────────
    //  MutationObserver — следим за новыми карточками
    // ──────────────────────────────────────────────
    function startObserver() {
        if (observer) observer.disconnect();
        observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                m.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    if (node.classList && node.classList.contains('card')) {
                        injectOverlay(node);
                    }
                    // Дочерние карточки
                    node.querySelectorAll && node.querySelectorAll('.card').forEach(injectOverlay);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // ──────────────────────────────────────────────
    //  Регистрация настроек в Lampa
    // ──────────────────────────────────────────────
    function registerSettings() {
        // ── Раздел: Дизайн карточек ──────────────
        Lampa.SettingsApi.addComponent({
            component: 'card_design',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 9h18M9 21V9"/></svg>',
            name: 'Дизайн карточек'
        });

        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: {
                name: 'lcd_radius', type: 'select',
                values: { '0': 'Квадратные', '0.8': 'Лёгкое', '1.5': 'Среднее', '2.2': 'Сильное' },
                default: '1.5'
            },
            field: { name: 'Скругление углов', description: 'Насколько круглыми будут углы постеров' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: {
                name: 'lcd_border_color', type: 'select',
                values: {
                    '#00e5ff': 'Циан',
                    '#ff3d00': 'Красный',
                    '#7c4dff': 'Фиолетовый',
                    '#ffea00': 'Жёлтый',
                    '#00e676': 'Зелёный',
                    '#ff4081': 'Розовый',
                    '#ffffff': 'Белый'
                },
                default: '#00e5ff'
            },
            field: { name: 'Цвет рамки / свечения', description: 'Цвет обводки и свечения при выборе карточки' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: {
                name: 'lcd_border_width', type: 'select',
                values: { '0': 'Без рамки', '2': 'Тонкая', '4': 'Жирная' },
                default: '2'
            },
            field: { name: 'Толщина рамки', description: 'Толщина цветной линии фокуса' },
            onChange: applyStyles
        });

        // ── Раздел: Эффект фокуса ─────────────────
        Lampa.SettingsApi.addComponent({
            component: 'card_focus',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M2 12h3M19 12h3M12 2v3M12 19v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
            name: 'Эффект фокуса'
        });

        Lampa.SettingsApi.addParam({
            component: 'card_focus',
            param: {
                name: 'lcd_focus_effect', type: 'select',
                values: {
                    'glow':        'Свечение',
                    'border':      'Только рамка',
                    'glow+border': 'Свечение + Рамка',
                    'none':        'Без эффекта'
                },
                default: 'glow'
            },
            field: { name: 'Тип эффекта фокуса', description: 'Визуальный стиль выделения карточки' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'card_focus',
            param: {
                name: 'lcd_glow_intensity', type: 'select',
                values: { 'low': 'Слабое', 'medium': 'Среднее', 'high': 'Сильное' },
                default: 'medium'
            },
            field: { name: 'Интенсивность свечения', description: 'Насколько сильным будет свечение вокруг карточки' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'card_focus',
            param: {
                name: 'lcd_focus_anim', type: 'select',
                values: {
                    'scale': 'Увеличение',
                    'lift':  'Подъём вверх',
                    'tilt':  'Лёгкий наклон',
                    'none':  'Без анимации'
                },
                default: 'scale'
            },
            field: { name: 'Анимация при фокусе', description: 'Как карточка реагирует на фокус' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'card_focus',
            param: {
                name: 'lcd_focus_scale', type: 'select',
                values: { '1.0': 'Без увеличения', '1.04': 'Минимальное', '1.08': 'Стандарт', '1.12': 'Максимальное' },
                default: '1.08'
            },
            field: { name: 'Масштаб при фокусе', description: 'Насколько увеличивается карточка' },
            onChange: applyStyles
        });

        // ── Раздел: Постер — Бэкдроп и Лого ──────
        Lampa.SettingsApi.addComponent({
            component: 'card_poster',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 3-3 4 4"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>',
            name: 'Постер: Бэкдроп и Лого'
        });

        Lampa.SettingsApi.addParam({
            component: 'card_poster',
            param: {
                name: 'lcd_show_backdrop', type: 'select',
                values: { 'true': 'Включён', 'false': 'Выключен' },
                default: 'true'
            },
            field: { name: 'Затемнение постера', description: 'Тёмный оверлей поверх постера при фокусе' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'card_poster',
            param: {
                name: 'lcd_backdrop_style', type: 'select',
                values: {
                    'gradient': 'Градиент снизу',
                    'solid':    'Сплошное затемнение',
                    'blur':     'Размытие (блюр)',
                    'none':     'Прозрачный'
                },
                default: 'gradient'
            },
            field: { name: 'Стиль затемнения', description: 'Вид тёмного оверлея на постере' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'card_poster',
            param: {
                name: 'lcd_show_logo', type: 'select',
                values: { 'true': 'Показывать', 'false': 'Скрыть' },
                default: 'true'
            },
            field: { name: 'Логотип на постере', description: 'Показывать лого фильма/сериала при фокусе' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'card_poster',
            param: {
                name: 'lcd_logo_position', type: 'select',
                values: {
                    'bottom-left':  'Снизу слева',
                    'bottom-right': 'Снизу справа',
                    'top-left':     'Сверху слева',
                    'top-right':    'Сверху справа',
                    'center':       'По центру'
                },
                default: 'bottom-left'
            },
            field: { name: 'Позиция логотипа', description: 'Где отображается логотип на постере' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'card_poster',
            param: {
                name: 'lcd_logo_size', type: 'select',
                values: { 'small': 'Маленький', 'medium': 'Средний', 'large': 'Большой' },
                default: 'medium'
            },
            field: { name: 'Размер логотипа', description: 'Высота логотипа фильма/сериала' },
            onChange: applyStyles
        });
    }

    // ──────────────────────────────────────────────
    //  Точка входа
    // ──────────────────────────────────────────────
    function init() {
        registerSettings();
        applyStyles();
        startObserver();
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();
