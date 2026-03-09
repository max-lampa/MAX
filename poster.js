(function () {
    'use strict';

    // 1. Конфигурация темы (Скругления и эффекты)
    var Config = {
        radius: '2.2em',        // Максимальное скругление карточек
        radiusInner: '1.8em',   // Внутреннее скругление картинки
        focusScale: '1.08',     // Увеличение при наведении
        blur: '30px',           // Сила размытия панелей
        shadow: '0 10px 40px rgba(0,0,0,0.5)'
    };

    function init() {
        var styleId = 'lampa-ultra-round-style';
        if (document.getElementById(styleId)) return;

        // 2. CSS код (Вырезан и модифицирован из buildCSS вашего файла)
        var css = `
            /* Скругление постеров (карточек) */
            .card__img { 
                border-radius: ${Config.radiusInner} !important; 
                overflow: hidden !important; 
            }
            .card__view { 
                border-radius: ${Config.radius} !important; 
                transition: transform 0.25s cubic-bezier(0.17, 0.67, 0.83, 0.67) !important;
            }

            /* Эффект фокуса */
            .card.focus .card__view { 
                transform: scale(${Config.focusScale}) !important; 
                z-index: 10;
            }
            .card.focus .card__view::after {
                border: 3px solid #fff !important; /* Белая рамка фокуса */
                border-radius: ${Config.radius} !important;
                box-shadow: ${Config.shadow} !important;
            }

            /* Полное отображение настроек (Стеклянный стиль) */
            .settings__content, .selectbox__content, .modal__content {
                background: rgba(15, 15, 15, 0.85) !important;
                backdrop-filter: blur(${Config.blur}) !important;
                -webkit-backdrop-filter: blur(${Config.blur}) !important;
                border-radius: ${Config.radius} !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
            }

            /* Скругление кнопок в настройках */
            .settings-folder, .settings-param {
                border-radius: 1.2em !important;
                margin: 4px 8px !important;
            }

            /* Индикаторы на карточках (4K, HDR) */
            .card__quality {
                border-radius: 0.8em !important;
                padding: 2px 8px !important;
            }
        `;

        var styleSheet = document.createElement("style");
        styleSheet.id = styleId;
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);

        // 3. Регистрация в меню настроек Lampa
        Lampa.SettingsApi.addComponent({
            component: 'ultra_round',
            icon: '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',
            name: 'Вид карточек'
        });

        Lampa.SettingsApi.addParam({
            component: 'ultra_round',
            param: {
                name: 'ultra_round_status',
                type: 'select',
                values: {
                    'on': 'Включено',
                    'off': 'Выключено'
                },
                default: 'on'
            },
            field: {
                name: 'Полное скругление',
                description: 'Применить стиль Apple TV ко всем постерам'
            },
            onChange: function(value) {
                document.getElementById(styleId).disabled = (value === 'off');
            }
        });
    }

    // Запуск плагина после готовности Lampa
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
