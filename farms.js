(function () {
    'use strict';

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
        red: { ru: 'Красный', en: 'Red', uk: 'Червоний' },
        orange: { ru: 'Оранжевый', en: 'Orange', uk: 'Помаранчевий' },
        amber: { ru: 'Янтарный', en: 'Amber', uk: 'Бурштиновий' },
        yellow: { ru: 'Желтый', en: 'Yellow', uk: 'Жовтий' },
        lime: { ru: 'Лаймовый', en: 'Lime', uk: 'Лаймовий' },
        green: { ru: 'Зеленый', en: 'Green', uk: 'Зелений' },
        emerald: { ru: 'Изумрудный', en: 'Emerald', uk: 'Смарагдовий' },
        teal: { ru: 'Бирюзовый', en: 'Teal', uk: 'Бірюзовий' },
        cyan: { ru: 'Голубой', en: 'Cyan', uk: 'Блакитний' },
        sky: { ru: 'Небесный', en: 'Sky', uk: 'Небесний' },
        blue: { ru: 'Синий', en: 'Blue', uk: 'Синій' },
        indigo: { ru: 'Индиго', en: 'Indigo', uk: 'Індиго' },
        violet: { ru: 'Фиолетовый', en: 'Violet', uk: 'Фіолетовий' },
        purple: { ru: 'Пурпурный', en: 'Purple', uk: 'Пурпуровий' },
        fuchsia: { ru: 'Фуксия', en: 'Fuchsia', uk: 'Фуксія' },
        pink: { ru: 'Розовый', en: 'Pink', uk: 'Рожевий' },
        rose: { ru: 'Розовый', en: 'Rose', uk: 'Трояндовий' },
        slate: { ru: 'Сланцевый', en: 'Slate', uk: 'Сланцевий' },
        gray: { ru: 'Серый', en: 'Gray', uk: 'Сірий' },
        zinc: { ru: 'Цинковый', en: 'Zinc', uk: 'Цинковий' },
        neutral: { ru: 'Нейтральный', en: 'Neutral', uk: 'Нейтральний' },
        stone: { ru: 'Каменный', en: 'Stone', uk: 'Кам\'яний' }
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
                '#fb2c36': 'Red 1', '#e7000b': 'Red 2', '#c10007': 'Red 3', '#9f0712': 'Red 4', '#82181a': 'Red 5', '#460809': 'Red 6',
                '#ff6900': 'Orange 1', '#f54900': 'Orange 2', '#ca3500': 'Orange 3', '#9f2d00': 'Orange 4', '#7e2a0c': 'Orange 5', '#441306': 'Orange 6',
                '#fe9a00': 'Amber 1', '#e17100': 'Amber 2', '#bb4d00': 'Amber 3', '#973c00': 'Amber 4', '#7b3306': 'Amber 5', '#461901': 'Amber 6',
                '#f0b100': 'Yellow 1', '#d08700': 'Yellow 2', '#a65f00': 'Yellow 3', '#894b00': 'Yellow 4', '#733e0a': 'Yellow 5', '#432004': 'Yellow 6',
                '#7ccf00': 'Lime 1', '#5ea500': 'Lime 2', '#497d00': 'Lime 3', '#3c6300': 'Lime 4', '#35530e': 'Lime 5', '#192e03': 'Lime 6',
                '#00c950': 'Green 1', '#00a63e': 'Green 2', '#008236': 'Green 3', '#016630': 'Green 4', '#0d542b': 'Green 5', '#032e15': 'Green 6',
                '#00bc7d': 'Emerald 1', '#009966': 'Emerald 2', '#007a55': 'Emerald 3', '#006045': 'Emerald 4', '#004f3b': 'Emerald 5', '#002c22': 'Emerald 6',
                '#00bba7': 'Teal 1', '#009689': 'Teal 2', '#00786f': 'Teal 3', '#005f5a': 'Teal 4', '#0b4f4a': 'Teal 5', '#022f2e': 'Teal 6',
                '#00b8db': 'Cyan 1', '#0092b8': 'Cyan 2', '#007595': 'Cyan 3', '#005f78': 'Cyan 4', '#104e64': 'Cyan 5', '#053345': 'Cyan 6',
                '#00a6f4': 'Sky 1', '#0084d1': 'Sky 2', '#0069a8': 'Sky 3', '#00598a': 'Sky 4', '#024a70': 'Sky 5', '#052f4a': 'Sky 6',
                '#2b7fff': 'Blue 1', '#155dfc': 'Blue 2', '#1447e6': 'Blue 3', '#193cb8': 'Blue 4', '#1c398e': 'Blue 5', '#162456': 'Blue 6',
                '#615fff': 'Indigo 1', '#4f39f6': 'Indigo 2', '#432dd7': 'Indigo 3', '#372aac': 'Indigo 4', '#312c85': 'Indigo 5', '#1e1a4d': 'Indigo 6',
                '#8e51ff': 'Violet 1', '#7f22fe': 'Violet 2', '#7008e7': 'Violet 3', '#5d0ec0': 'Violet 4', '#4d179a': 'Violet 5', '#2f0d68': 'Violet 6',
                '#ad46ff': 'Purple 1', '#9810fa': 'Purple 2', '#8200db': 'Purple 3', '#6e11b0': 'Purple 4', '#59168b': 'Purple 5', '#3c0366': 'Purple 6',
                '#e12afb': 'Fuchsia 1', '#c800de': 'Fuchsia 2', '#a800b7': 'Fuchsia 3', '#8a0194': 'Fuchsia 4', '#721378': 'Fuchsia 5', '#4b004f': 'Fuchsia 6',
                '#f6339a': 'Pink 1', '#e60076': 'Pink 2', '#c6005c': 'Pink 3', '#a3004c': 'Pink 4', '#861043': 'Pink 5', '#510424': 'Pink 6',
                '#ff2056': 'Rose 1', '#ec003f': 'Rose 2', '#c70036': 'Rose 3', '#a50036': 'Rose 4', '#8b0836': 'Rose 5', '#4d0218': 'Rose 6',
                '#62748e': 'Slate 1', '#45556c': 'Slate 2', '#314158': 'Slate 3', '#1d293d': 'Slate 4', '#0f172b': 'Slate 5', '#020618': 'Slate 6',
                '#6a7282': 'Gray 1', '#4a5565': 'Gray 2', '#364153': 'Gray 3', '#1e2939': 'Gray 4', '#101828': 'Gray 5', '#030712': 'Gray 6',
                '#71717b': 'Zinc 1', '#52525c': 'Zinc 2', '#3f3f46': 'Zinc 3', '#27272a': 'Zinc 4', '#18181b': 'Zinc 5', '#09090b': 'Zinc 6',
                '#737373': 'Neutral 1', '#525252': 'Neutral 2', '#404040': 'Neutral 3', '#262626': 'Neutral 4', '#171717': 'Neutral 5', '#0a0a0a': 'Neutral 6',
                '#79716b': 'Stone 1', '#57534d': 'Stone 2', '#44403b': 'Stone 3', '#292524': 'Stone 4', '#1c1917': 'Stone 5', '#0c0a09': 'Stone 6'
            }
        }
    };

    function hexToRgb(hex) {
        var cleanHex = hex.replace('#', '');
        if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(function(c) { return c + c; }).join('');
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

    function isValidHex(color) { return /^#[0-9A-Fa-f]{3,6}$/.test(color); }

    function applyStyles() {
        if (!ColorPlugin.settings.enabled) {
            var oldStyle = document.getElementById('color-plugin-styles');
            if (oldStyle) oldStyle.remove();
            return;
        }

        var style = document.getElementById('color-plugin-styles') || document.createElement('style');
        style.id = 'color-plugin-styles';
        if (!style.parentNode) document.head.appendChild(style);

        var rgbColor = hexToRgb(ColorPlugin.settings.main_color);
        var focusBorder = ColorPlugin.settings.highlight_enabled ? 'inset 0 0 0 0.15em #fff !important' : 'none';

        style.innerHTML = [
            ':root { --main-color: ' + ColorPlugin.settings.main_color + ' !important; --main-color-rgb: ' + rgbColor + ' !important; }',
            '.modal__title { font-size: 1.5em !important; }',
            '.menu__ico, .settings-param__ico { color: #fff !important; fill: #fff !important; }',
            '.menu__item.focus, .full-person.focus, .full-start__button.focus, .simple-button.focus, .head__action.focus { background: var(--main-color) !important; box-shadow: ' + focusBorder + '; }',
            '.settings-param.focus, .selectbox-item.focus, .settings-folder.focus { background: var(--main-color) !important; box-shadow: ' + focusBorder + '; }',
            '.card.focus .card__view { border-color: var(--main-color) !important; }',
            
            /* Оптимизация контейнера выбора цвета */
            '.color-picker-container { display: flex; flex-direction: column; gap: 10px; padding: 10px; max-height: 60vh; overflow-y: auto; scroll-behavior: smooth; }',
            '.color-family-outline { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); border-radius: 10px; padding: 6px; }',
            '.color-family-name { width: 80px; font-size: 10px; text-transform: uppercase; color: #aaa; text-align: center; font-weight: bold; }',
            '.color_square { width: 38px; height: 38px; border-radius: 8px; cursor: pointer; border: 2px solid transparent; flex-shrink: 0; }',
            '.color_square.focus { border-color: #fff !important; transform: scale(1.05); z-index: 2; }',
            
            /* HEX Input упрощенный */
            '.hex-input { width: 180px; height: 40px; background: #222; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid rgba(255,255,255,0.2); }',
            '.hex-input.focus { border-color: #fff; background: var(--main-color); }',
            
            /* Убираем тяжелые эффекты для Mi Box */
            '.color-picker-modal .modal__content { background: #141414 !important; border-radius: 20px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }'
        ].join('\n');
    }

    function openColorPicker() {
        var families = ['Red', 'Orange', 'Amber', 'Yellow', 'Lime', 'Green', 'Emerald', 'Teal', 'Cyan', 'Sky', 'Blue', 'Indigo', 'Violet', 'Purple', 'Fuchsia', 'Pink', 'Rose', 'Slate', 'Gray', 'Zinc', 'Neutral', 'Stone'];
        var colorKeys = Object.keys(ColorPlugin.colors.main);
        
        var html = $('<div class="color-picker-container"></div>');
        
        // Кнопки управления в топе
        var controls = $('<div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 15px;"></div>');
        var defBtn = $('<div class="color_square selector" style="background: #353535; border: 2px solid #666;" title="Default"></div>');
        var hexBtn = $('<div class="selector hex-input">HEX: ' + ColorPlugin.settings.main_color + '</div>');
        
        controls.append(defBtn).append(hexBtn);
        html.append(controls);

        families.forEach(function(f) {
            var row = $('<div class="color-family-outline"></div>');
            row.append('<div class="color-family-name">' + Lampa.Lang.translate(f.toLowerCase()) + '</div>');
            
            colorKeys.filter(function(k) { return ColorPlugin.colors.main[k].indexOf(f) === 0; }).forEach(function(c) {
                row.append('<div class="color_square selector" style="background-color: ' + c + '" data-color="' + c + '"></div>');
            });
            html.append(row);
        });

        Lampa.Modal.open({
            title: Lampa.Lang.translate('main_color'),
            size: 'medium',
            html: html,
            onSelect: function(target) {
                var color = target.attr('data-color');
                if (target.hasClass('hex-input')) {
                    Lampa.Input.edit({ value: ColorPlugin.settings.main_color, title: 'HEX #000000' }, function(val) {
                        if (isValidHex(val)) {
                            saveAndApply(val);
                            Lampa.Modal.close();
                        } else {
                            Lampa.Noty.show('Error format');
                        }
                    });
                } else {
                    saveAndApply(color || '#353535');
                    Lampa.Modal.close();
                }
            },
            onBack: function() {
                Lampa.Modal.close();
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    function saveAndApply(color) {
        ColorPlugin.settings.main_color = color;
        Lampa.Storage.set('color_plugin_main_color', color);
        applyStyles();
        if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
    }

    function initPlugin() {
        Lampa.SettingsApi.addComponent({
            component: 'color_plugin',
            name: Lampa.Lang.translate('color_plugin'),
            icon: '<svg width="24" height="24" viewBox="0 0 16 16" fill="#fff"><path d="M8 1a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 13a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM4 8a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm7-3a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'color_plugin',
            param: { name: 'color_plugin_enabled', type: 'trigger', default: 'true' },
            field: { name: Lampa.Lang.translate('color_plugin_enabled') },
            onChange: function(v) { ColorPlugin.settings.enabled = v === 'true'; Lampa.Storage.set('color_plugin_enabled', v); applyStyles(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'color_plugin',
            param: { name: 'color_plugin_main_color', type: 'button' },
            field: { name: Lampa.Lang.translate('main_color') },
            onChange: openColorPicker
        });

        applyStyles();
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') initPlugin(); });

})();