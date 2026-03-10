(function () {
    'use strict';

    // Переклади (залишив без змін)
    Lampa.Lang.add({
        color_plugin: { ru: 'Настройка цветов', en: 'Color settings', uk: 'Налаштування кольорів' },
        color_plugin_enabled: { ru: 'Включить плагин', en: 'Enable plugin', uk: 'Увімкнути плагін' },
        color_plugin_enabled_description: { ru: 'Изменяет вид некоторых элементов интерфейса Lampa', en: 'Changes the appearance of some Lampa interface elements', uk: 'Змінює вигляд деяких елементів інтерфейсу Lampa' },
        main_color: { ru: 'Цвет выделения', en: 'Highlight color', uk: 'Колір виділення' },
        main_color_description: { ru: 'Выберите или укажите цвет', en: 'Select or specify a color', uk: 'Виберіть чи вкажіть колір' },
        enable_highlight: { ru: 'Показать рамку', en: 'Show border', uk: 'Показати рамку' },
        enable_highlight_description: { ru: 'Включает белую рамку вокруг некоторых выделенных элементов интерфейса', en: 'Enables a white border around some highlighted interface elements', uk: 'Вмикає білу рамку навколо деяких виділених елементів інтерфейсу' },
        enable_dimming: { ru: 'Применить цвет затемнения', en: 'Apply dimming color', uk: 'Застосувати колір затемнення' },
        enable_dimming_description: { ru: 'Изменяет цвет затемненных элементов интерфейса на темный оттенок выбранного цвета выделения', en: 'Changes the color of dimmed interface elements to a dark shade of the selected highlight color', uk: 'Змінює колір затемнених елементів інтерфейсу на темний відтінок вибраного кольору виділення' },
        default_color: { ru: 'По умолчанию', en: 'Default', uk: 'За замовчуванням' },
        custom_hex_input: { ru: 'Введи HEX-код цвета', en: 'Enter HEX color code', uk: 'Введи HEX-код кольору' },
        hex_input_hint: { ru: 'Используйте формат #FFFFFF, например #123524', en: 'Use the format #FFFFFF, for example #123524', uk: 'Використовуйте формат #FFFFFF, наприклад #123524' },
        // ... (всі інші переклади кольорів без змін)
    });

    var ColorPlugin = {
        settings: {
            main_color: Lampa.Storage.get('color_plugin_main_color', '#353535'),
            enabled: Lampa.Storage.get('color_plugin_enabled', 'true') === 'true',
            highlight_enabled: Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true',
            dimming_enabled: Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true'
        },
        colors: {
            main: {
                'default': Lampa.Lang.translate('default_color'),
                // ... (всі твої кольори без змін, я не копіюю їх сюди щоб не роздувати повідомлення)
            }
        }
    };

    var isSaving = false;

    function hexToRgb(hex) {
        var cleanHex = hex.replace('#', '');
        var r = parseInt(cleanHex.substring(0, 2), 16);
        var g = parseInt(cleanHex.substring(2, 4), 16);
        var b = parseInt(cleanHex.substring(4, 6), 16);
        return r + ', ' + g + ', ' + b;
    }

    function rgbToHex(rgb) {
        var matches = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!matches) return rgb;
        function hex(n) { return ('0' + parseInt(n).toString(16)).slice(-2); }
        return '#' + hex(matches[1]) + hex(matches[2]) + hex(matches[3]);
    }

    function isValidHex(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    function updateDateElementStyles() {
        var elements = document.querySelectorAll('div[style*="position: absolute; left: 1em; top: 1em;"]');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (element.querySelector('div[style*="font-size: 2.6em"]')) {
                element.style.background = 'var(--main-color)';
            }
        }
    }

    function updateCanvasFillStyle(context) {
        if (context && context.fillStyle) {
            var rgbColor = hexToRgb(ColorPlugin.settings.main_color);
            context.fillStyle = 'rgba(' + rgbColor + ', 1)';
        }
    }

    function updatePluginIcon() {
        // ... (залишив без змін, або можеш оптимізувати пізніше)
    }

    function checkBodyStyles() {
        // ... (залишив без змін)
    }

    function saveSettings() {
        if (isSaving) return;
        isSaving = true;
        Lampa.Storage.set('color_plugin_main_color', ColorPlugin.settings.main_color);
        Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
        Lampa.Storage.set('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
        Lampa.Storage.set('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
        localStorage.setItem('color_plugin_main_color', ColorPlugin.settings.main_color);
        localStorage.setItem('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
        localStorage.setItem('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
        localStorage.setItem('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
        isSaving = false;
    }

    function applyStyles() {
        if (!ColorPlugin.settings.enabled) {
            var oldStyle = document.getElementById('color-plugin-styles');
            if (oldStyle) oldStyle.remove();
            return;
        }

        var style = document.getElementById('color-plugin-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'color-plugin-styles';
            document.head.appendChild(style);
        }

        var rgb = hexToRgb(ColorPlugin.settings.main_color);

        var highlightCSS = ColorPlugin.settings.highlight_enabled ? `
            box-shadow: inset 0 0 0 0.18em #ffffffcc, 0 0 0 5px rgba(${rgb}, 0.45) !important;
        ` : '';

        var dimmingCSS = ColorPlugin.settings.dimming_enabled ? `
            .full-start__rate, .reaction, .full-start__button, .card__vote,
            .items-line__more, .card__icons-inner, .simple-button--filter > div {
                background: rgba(${rgb}, 0.22) !important;
            }
        ` : '';

        style.innerHTML = `
            :root {
                --main-color: ${ColorPlugin.settings.main_color} !important;
                --main-color-rgb: ${rgb} !important;
                --main-glow: rgba(${rgb}, 0.48) !important;
                --focus-ring: 0 0 0 4px var(--main-glow), 0 0 0 7px rgba(255,255,255,0.20);
            }

            .color-picker-modal .modal__content {
                background: rgba(16,16,28,0.95) !important;
                backdrop-filter: blur(18px) saturate(170%) !important;
                border: 1px solid rgba(90,90,130,0.20) !important;
                border-radius: 22px !important;
                box-shadow: 0 32px 90px rgba(0,0,0,0.75) !important;
            }

            .color-picker-container {
                display: grid !important;
                grid-template-columns: repeat(auto-fit, minmax(440px, 1fr)) !important;
                gap: 44px !important;
                padding: 24px 20px 36px !important;
            }

            .color-family-outline {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 18px !important;
                padding: 22px 20px !important;
                border-radius: 20px !important;
                background: rgba(28,28,44,0.65) !important;
                border: 1px solid rgba(80,80,110,0.28) !important;
                backdrop-filter: blur(10px) !important;
                transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1) !important;
            }

            .color-family-outline:hover {
                transform: translateY(-5px) !important;
                box-shadow: 0 18px 48px rgba(0,0,0,0.55) !important;
                background: rgba(38,38,54,0.80) !important;
            }

            .color-family-name {
                min-width: 120px !important;
                height: 46px !important;
                border: 2.8px solid var(--main-color) !important;
                border-radius: 16px !important;
                background: linear-gradient(135deg, rgba(\( {rgb},0.28), rgba( \){rgb},0.12)) !important;
                color: #fff !important;
                font-size: 14.5px !important;
                font-weight: 700 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-transform: capitalize !important;
                box-shadow: inset 0 1px 5px rgba(0,0,0,0.4) !important;
            }

            .color_square {
                width: 60px !important;
                height: 60px !important;
                border-radius: 18px !important;
                position: relative !important;
                cursor: pointer !important;
                transition: all 0.32s cubic-bezier(0.34,1.56,0.64,1) !important;
                box-shadow: 0 10px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12) !important;
                border: 3.5px solid transparent !important;
            }

            .color_square:hover {
                transform: scale(1.24) translateY(-7px) !important;
                box-shadow: 0 24px 56px rgba(0,0,0,0.70) !important;
                z-index: 12 !important;
            }

            .color_square.focus,
            .color_square.selector.focus {
                transform: scale(1.32) !important;
                box-shadow: var(--focus-ring) !important;
                border-color: #ffffff !important;
            }

            .color_square .hex {
                position: absolute !important;
                bottom: 7px !important;
                left: 0; right: 0 !important;
                font-size: 12.5px !important;
                font-weight: 600 !important;
                color: #fff !important;
                text-shadow: 0 2px 5px #000 !important;
                pointer-events: none !important;
            }

            .hex-input {
                width: 440px !important;
                height: 66px !important;
                margin: 0 auto 28px !important;
                border-radius: 20px !important;
                border: 3px solid rgba(130,130,150,0.32) !important;
                background: linear-gradient(145deg, #1c1c28, #14141e) !important;
                box-shadow: 0 12px 36px rgba(0,0,0,0.60) !important;
                color: white !important;
                font-size: 19px !important;
                font-weight: 600 !important;
                position: relative !important;
                transition: all 0.26s ease !important;
            }

            .hex-input.focus {
                border-color: #ffffff !important;
                box-shadow: var(--focus-ring), 0 0 0 8px rgba(255,255,255,0.16) !important;
                transform: scale(1.045) !important;
            }

            .hex-input .value {
                position: absolute !important;
                bottom: 14px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                font-size: 24px !important;
                letter-spacing: 2.5px !important;
            }

            .color_square.default {
                background: linear-gradient(135deg, #3f3f3f, #1f1f1f) !important;
            }

            .color_square.default::before,
            .color_square.default::after {
                background: #ff4d4f !important;
                height: 6px !important;
                border-radius: 3px !important;
            }

            /* Інші елементи інтерфейсу */
            .menu__item.focus,
            .full-start__button.focus,
            .settings-param.focus,
            .selectbox-item.focus {
                background: var(--main-color) !important;
                ${highlightCSS}
            }

            ${dimmingCSS}
        `;

        updateDateElementStyles();
        checkBodyStyles();
    }

    // решта коду (createColorHtml, openColorPicker, updateParamsVisibility, initPlugin, слухачі тощо)
    // залишається без змін — просто встав цей applyStyles замість старого

    // ... (тут весь інший код плагіна без змін)

    // Приклад виклику (як було раніше)
    if (window.appready && Lampa.SettingsApi && Lampa.Storage) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready' && Lampa.SettingsApi && Lampa.Storage) {
                initPlugin();
            }
        });
    }

})();