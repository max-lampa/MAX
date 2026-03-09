(function () {
    'use strict';

    var STYLE_ID = 'lampa-custom-cards-style';

    // 1. Ініціалізація параметрів (повернуто оригінальні значення)
    var Settings = {
        radius: function() { return Lampa.Storage.get('custom_card_radius', '1.5'); },
        borderWidth: function() { return Lampa.Storage.get('custom_card_border_width', '2'); },
        borderColor: function() { return Lampa.Storage.get('custom_card_border_color', '#00e5ff'); },
        focusScale: function() { return Lampa.Storage.get('custom_card_scale', '1.08'); }
    };

    function applyStyles() {
        var existing = document.getElementById(STYLE_ID);
        if (existing) existing.remove();

        var r = Settings.radius() + 'em';
        var bW = Settings.borderWidth() + 'px';
        var bC = Settings.borderColor();
        var sc = Settings.focusScale();

        var css = `
            /* Оптимізована база картки */
            .card__view {
                border: ${bW} solid transparent;
                /* Анімуємо ТІЛЬКИ трансформацію для плавності */
                transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1) !important;
                will-change: transform;
                transform: translateZ(0); /* GPU прискорення */
                border-radius: ${r} !important;
                overflow: hidden !important;
            }

            .card__img { 
                border-radius: ${r} !important; 
                backface-visibility: hidden;
            }

            /* Ефект при фокусі (повернуто оригінальну логіку) */
            .card.focus .card__view { 
                transform: scale(${sc}) !important; 
                border-color: ${bC} !important;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
                z-index: 10;
            }

            /* Прибираємо стандартну білу рамку */
            .card.focus .card__view::after {
                display: none !important;
            }

            /* Модальні вікна (без важкого блюру для швидкості ТБ) */
            .settings__content, .selectbox__content, .modal__content {
                border-radius: ${r} !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
                background: #1a1a1a !important;
                backdrop-filter: none !important;
            }
        `;

        var styleSheet = document.createElement("style");
        styleSheet.id = STYLE_ID;
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
    }

    function init() {
        Lampa.SettingsApi.addComponent({
            component: 'card_design',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',
            name: 'Дизайн карточок'
        });

        // Скруглення (як в оригіналі)
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: { 
                name: 'custom_card_radius', 
                type: 'select', 
                values: { '0': 'Квадратні', '0.8': 'Легке', '1.5': 'Середнє', '2.2': 'Повне' }, 
                default: '1.5' 
            },
            field: { name: 'Скруглення (Radius)', description: 'Наскільки круглими будуть углы постеров' },
            onChange: applyStyles
        });

        // Колір рамки (як в оригіналі)
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: { 
                name: 'custom_card_border_color', 
                type: 'select', 
                values: { 
                    '#00e5ff': 'Циан', 
                    '#ff3d00': 'Красный', 
                    '#7c4dff': 'Фиолетовый', 
                    '#ffea00': 'Желтый',
                    '#ffffff': 'Белый' 
                }, 
                default: '#00e5ff' 
            },
            field: { name: 'Цвет рамки фокуса', description: 'Цвет обводки при наведении на карточку' },
            onChange: applyStyles
        });

        // Товщина рамки (повернуто: Без рамки, Тонка, Жирна)
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: { 
                name: 'custom_card_border_width', 
                type: 'select', 
                values: { '0': 'Без рамки', '2': 'Тонка', '4': 'Жирна' }, 
                default: '2' 
            },
            field: { name: 'Толщина рамки', description: 'Толщина цветной линии фокуса' },
            onChange: applyStyles
        });

        // Масштаб (повернуто оригінальний список + 1.08 за замовчуванням)
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: { 
                name: 'custom_card_scale', 
                type: 'select', 
                values: { '1.0': 'Без збільшення', '1.04': 'Мінімальне', '1.08': 'Стандарт', '1.12': 'Максимальне' }, 
                default: '1.08' 
            },
            field: { name: 'Масштаб при фокусі', description: 'Наскільки збільшується картка' },
            onChange: applyStyles
        });

        applyStyles();
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });

})();
