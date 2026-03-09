(function () {
    'use strict';

    var STYLE_ID = 'lampa-custom-cards-style';

    // 1. Инициализация параметров в памяти Lampa
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
            /* Скругление самих постеров */
            .card__img, .card__view { 
                border-radius: ${r} !important; 
                overflow: hidden !important; 
            }

            /* Цветная рамка в обычном состоянии (опционально, если ширина > 0) */
            .card__view {
                border: ${bW} solid transparent;
                transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1) !important;
            }

            /* Цветная рамка и эффект при ФОКУСЕ */
            .card.focus .card__view { 
                transform: scale(${sc}) !important; 
                border-color: ${bC} !important;
                box-shadow: 0 0 20px ${bC}66, 0 10px 40px rgba(0,0,0,0.7) !important;
                z-index: 10;
            }

            /* Убираем стандартную белую рамку Lampa, чтобы оставить только нашу цветную */
            .card.focus .card__view::after {
                display: none !important;
            }

            /* Скругление модальных окон и настроек для красоты */
            .settings__content, .selectbox__content, .modal__content {
                border-radius: ${r} !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
                backdrop-filter: blur(20px);
            }
        `;

        var styleSheet = document.createElement("style");
        styleSheet.id = STYLE_ID;
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
    }

    function init() {
        // Добавляем раздел в настройки Lampa
        Lampa.SettingsApi.addComponent({
            component: 'card_design',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',
            name: 'Дизайн карточек'
        });

        // Настройка скругления
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: { name: 'custom_card_radius', type: 'select', 
                values: { '0': 'Квадратные', '0.8': 'Легкое', '1.5': 'Среднее', '2.2': 'Полное' }, 
                default: '1.5' 
            },
            field: { name: 'Скругление (Radius)', description: 'Насколько круглыми будут углы постеров' },
            onChange: applyStyles
        });

        // Настройка цвета рамки
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: { name: 'custom_card_border_color', type: 'select', 
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

        // Толщина рамки
        Lampa.SettingsApi.addParam({
            component: 'card_design',
            param: { name: 'custom_card_border_width', type: 'select', 
                values: { '0': 'Без рамки', '2': 'Тонкая', '4': 'Жирная' }, 
                default: '2' 
            },
            field: { name: 'Толщина рамки', description: 'Толщина цветной линии фокуса' },
            onChange: applyStyles
        });

        applyStyles();
    }

    // Запуск
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });

})();
