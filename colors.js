(function () {
    'use strict';

    Lampa.Lang.add({
        color_plugin: {
            ru: 'Настройка цветов',
            en: 'Color settings',
            uk: 'Налаштування кольорів'
        },
        color_plugin_enabled: {
            ru: 'Включить плагин',
            en: 'Enable plugin',
            uk: 'Увімкнути плагін'
        },
        color_plugin_enabled_description: {
            ru: 'Изменяет вид некоторых элементов интерфейса Lampa',
            en: 'Changes the appearance of some Lampa interface elements',
            uk: 'Змінює вигляд деяких елементів інтерфейсу Lampa'
        },
        main_color: {
            ru: 'Цвет выделения',
            en: 'Highlight color',
            uk: 'Колір виділення'
        },
        main_color_description: {
            ru: 'Выберите или укажите цвет',
            en: 'Select or specify a color',
            uk: 'Виберіть чи вкажіть колір'
        },
        enable_highlight: {
            ru: 'Показать рамку',
            en: 'Show border',
            uk: 'Показати рамку'
        },
        enable_highlight_description: {
            ru: 'Включает белую рамку вокруг некоторых выделенных элементов интерфейса',
            en: 'Enables a white border around some highlighted interface elements',
            uk: 'Вмикає білу рамку навколо деяких виділених елементів інтерфейсу'
        },
        enable_dimming: {
            ru: 'Применить цвет затемнения',
            en: 'Apply dimming color',
            uk: 'Застосувати колір затемнення'
        },
        enable_dimming_description: {
            ru: 'Изменяет цвет затемненных элементов интерфейса на темный оттенок выбранного цвета выделения',
            en: 'Changes the color of dimmed interface elements to a dark shade of the selected highlight color',
            uk: 'Змінює колір затемнених елементів інтерфейсу на темний відтінок вибраного кольору виділення'
        },
        default_color: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        custom_hex_input: {
            ru: 'Введи HEX',
            en: 'Enter HEX',
            uk: 'Введи HEX'
        },
        hex_input_hint: {
            ru: 'Используйте формат #FFFFFF, например #123524',
            en: 'Use the format #FFFFFF, for example #123524',
            uk: 'Використовуйте формат #FFFFFF, наприклад #123524'
        },
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
        var svgIcon = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.components) {
            var menuItem = document.querySelector('.menu__item[data-component="color_plugin"] .menu__ico');
            if (menuItem) menuItem.innerHTML = svgIcon;
            return;
        }
        var component = Lampa.SettingsApi.components.find(function(c) { return c.component === 'color_plugin'; });
        if (component) {
            component.icon = svgIcon;
            if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
        }
    }

    function checkBodyStyles() {
        var body = document.body;
        var hasBlackStyle = body.classList.contains('black--style');
        var hasGlassStyle = body.classList.contains('glass--style');
        var computedStyle = window.getComputedStyle(body);
        var background = computedStyle.background || computedStyle.backgroundColor;
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

        var rgbColor = hexToRgb(ColorPlugin.settings.main_color);
        var focusBorderColor = ColorPlugin.settings.main_color === '#353535' ? '#ffffff' : 'var(--main-color)';

        var highlightStyles = ColorPlugin.settings.highlight_enabled ? (
            '-webkit-box-shadow: inset 0 0 0 0.15em #fff !important;' +
            'box-shadow: inset 0 0 0 0.15em #fff !important;'
        ) : '';

        var dimmingStyles = ColorPlugin.settings.dimming_enabled ? (
            '.full-start__rate {background: rgba(var(--main-color-rgb), 0.15) !important;}' +
            '.full-start__rate > div:first-child {background: rgba(var(--main-color-rgb), 0.15) !important;}' +
            '.reaction {background-color: rgba(var(--main-color-rgb), 0.3) !important;}' +
            '.full-start__button {background-color: rgba(var(--main-color-rgb), 0.3) !important;}' +
            '.card__vote {background: rgba(var(--main-color-rgb), 0.5) !important;}' +
            '.items-line__more {background: rgba(var(--main-color-rgb), 0.3) !important;}' +
            '.card__icons-inner {background: rgba(var(--main-color-rgb), 0.5) !important;}' +
            '.simple-button--filter > div {background-color: rgba(var(--main-color-rgb), 0.3) !important;}'
        ) : '';

        style.innerHTML = [
            ':root {--main-color: ' + ColorPlugin.settings.main_color + ' !important;--main-color-rgb: ' + rgbColor + ' !important;}',
            '.modal__title {font-size: 1.7em !important;}',
            '.modal__head {margin-bottom: 0 !important;}',
            '.modal .scroll__content {padding: 1.0em 0 !important;}',
            '.menu__ico, .menu__ico:hover, .menu__ico.traverse, .head__action, .head__action.focus, .head__action:hover, .settings-param__ico {color: #ffffff !important;fill: #ffffff !important;}',
            '.menu__ico.focus {color: #ffffff !important;fill: #ffffff !important;stroke: none !important;}',
            '.menu__item.focus .menu__ico path[fill], .menu__item.focus .menu__ico rect[fill], .menu__item.focus .menu__ico circle[fill], .menu__item.traverse .menu__ico path[fill], .menu__item.traverse .menu__ico rect[fill], .menu__item.traverse .menu__ico circle[fill], .menu__item:hover .menu__ico path[fill], .menu__item:hover .menu__ico rect[fill], .menu__item:hover .menu__ico circle[fill] {fill: #ffffff !important;}',
            '.menu__item.focus .menu__ico [stroke], .menu__item.traverse .menu__ico [stroke], .menu__item:hover .menu__ico [stroke] {stroke: #fff !important;}',
            '.menu__item, .menu__item.focus, .menu__item.traverse, .menu__item:hover, .console__tab, .console__tab.focus, .settings-param, .settings-param.focus, .selectbox-item, .selectbox-item.focus, .selectbox-item:hover, .full-person, .full-person.focus, .full-start__button, .full-start__button.focus, .full-descr__tag, .full-descr__tag.focus, .simple-button, .simple-button.focus, .player-panel .button, .player-panel .button.focus, .search-source, .search-source.active, .radio-item, .radio-item.focus, .lang__selector-item, .lang__selector-item.focus, .modal__button, .modal__button.focus, .search-history-key, .search-history-key.focus, .simple-keyboard-mic, .simple-keyboard-mic.focus, .full-review-add, .full-review-add.focus, .full-review, .full-review.focus, .tag-count, .tag-count.focus, .settings-folder, .settings-folder.focus, .noty, .radio-player, .radio-player.focus {color: #ffffff !important;}',
            '.console__tab {background-color: rgba(221, 221, 221, 0.06) !important;}',
            '.console__tab.focus {background: var(--main-color) !important;color: #fff !important;' + highlightStyles + '}',
            '.menu__item.focus, .menu__item.traverse, .menu__item:hover, .full-person.focus, .full-start__button.focus, .full-descr__tag.focus, .simple-button.focus, .head__action.focus, .head__action:hover, .player-panel .button.focus, .search-source.active {background: var(--main-color) !important;}',
            '.full-start__button.focus, .settings-param.focus, .items-line__more.focus, .menu__item.focus, .settings-folder.focus, .head__action.focus, .selectbox-item.focus, .simple-button.focus, .navigation-tabs__button.focus {' + highlightStyles + '}',
            '.timetable__item.focus::before {background-color: var(--main-color) !important;' + highlightStyles + '}',
            '.navigation-tabs__button.focus {background-color: var(--main-color) !important;color: #fff !important;' + highlightStyles + '}',
            '.items-line__more.focus {color: #fff !important;background-color: var(--main-color) !important;}',
            '.timetable__item.focus {color: #fff !important;}',
            '.broadcast__device.focus {background-color: var(--main-color) !important;color: #fff !important;}',
            '.iptv-menu__list-item.focus, .iptv-program__timeline>div {background-color: var(--main-color) !important;}',
            '.radio-item.focus, .lang__selector-item.focus, .simple-keyboard .hg-button.focus, .modal__button.focus, .search-history-key.focus, .simple-keyboard-mic.focus, .full-review-add.focus, .full-review.focus, .tag-count.focus, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .selectbox-item:hover {background: var(--main-color) !important;}',
            '.online.focus {box-shadow: 0 0 0 0.2em var(--main-color) !important;}',
            '.online_modss.focus::after, .online-prestige.focus::after, .radio-item.focus .radio-item__imgbox:after, .iptv-channel.focus::before, .iptv-channel.last--focus::before {border-color: var(--main-color) !important;}',
            '.card-more.focus .card-more__box::after {border: 0.3em solid var(--main-color) !important;}',
            '.iptv-playlist-item.focus::after, .iptv-playlist-item:hover::after {border-color: var(--main-color) !important;}',
            '.ad-bot.focus .ad-bot__content::after, .ad-bot:hover .ad-bot__content::after, .card-episode.focus .full-episode::after, .register.focus::after, .season-episode.focus::after, .full-episode.focus::after, .full-review-add.focus::after, .card.focus .card__view::after, .card:hover .card__view::after, .extensions__item.focus:after, .torrent-item.focus::after, .extensions__block-add.focus:after {border-color: var(--main-color) !important;}',
            '.broadcast__scan > div {background-color: var(--main-color) !important;}',
            '.card:hover .card__view, .card.focus .card__view {border-color: var(--main-color) !important;}',
            '.noty {background: var(--main-color) !important;}',
            '.radio-player.focus {background-color: var(--main-color) !important;}',
            '.explorer-card__head-img.focus::after {border: 0.3em solid var(--main-color) !important;}',
            '.cp-swatch.focus {border: 0.25em solid ' + focusBorderColor + ' !important;transform: scale(1.2) !important;box-shadow: 0 0 12px rgba(0,0,0,0.5) !important;z-index: 10 !important;}',
            '.cp-hex-btn.focus {border: 0.2em solid ' + focusBorderColor + ' !important;transform: scale(1.05) !important;box-shadow: 0 0 20px rgba(0,0,0,0.5) !important;}',
            '.cp-default-btn.focus {border: 0.2em solid ' + focusBorderColor + ' !important;transform: scale(1.1) !important;box-shadow: 0 0 12px rgba(0,0,0,0.5) !important;}',
            'body.glass--style .selectbox-item.focus, body.glass--style .settings-folder.focus, body.glass--style .settings-param.focus {background-color: var(--main-color) !important;}',
            'body.glass--style .settings-folder.focus .settings-folder__icon {-webkit-filter: none !important;filter: none !important;}',
            dimmingStyles,
            '.timetable__item--any::before {background-color: rgba(var(--main-color-rgb), 0.3) !important;}',
            '.element {background: var(--main-color) !important;}',
            '.bookmarks-folder__layer {background-color: var(--main-color) !important;}',
            '.cp-modal-wrap {padding: 0.5em 0.6em !important;}',
            '.cp-top-row {display: flex !important;align-items: center !important;gap: 0.8em !important;margin-bottom: 0.5em !important;justify-content: center !important;}',
            '.cp-default-btn {width: 2.8em !important;height: 2.8em !important;border-radius: 0.5em !important;background: #fff !important;border: 2px solid rgba(255,255,255,0.3) !important;position: relative !important;cursor: pointer !important;box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;flex-shrink: 0 !important;}',
            '.cp-default-btn::before, .cp-default-btn::after {content: "" !important;position: absolute !important;top: 50% !important;left: 15% !important;right: 15% !important;height: 2px !important;background-color: #353535 !important;margin-top: -1px !important;}',
            '.cp-default-btn::before {transform: rotate(45deg) !important;}',
            '.cp-default-btn::after {transform: rotate(-45deg) !important;}',
            '.cp-hex-btn {height: 2.8em !important;min-width: 6em !important;border-radius: 0.5em !important;border: 2px solid rgba(255,255,255,0.2) !important;cursor: pointer !important;display: flex !important;flex-direction: column !important;align-items: center !important;justify-content: center !important;color: #fff !important;font-size: 0.7em !important;font-weight: 500 !important;background: rgba(53,53,53,0.8) !important;box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;padding: 0 0.8em !important;flex-shrink: 0 !important;}',
            '.cp-hex-btn .cp-hex-label {font-size: 0.8em !important;opacity: 0.75 !important;text-transform: uppercase !important;}',
            '.cp-hex-btn .cp-hex-value {font-size: 1em !important;font-weight: bold !important;margin-top: 0.1em !important;}',
            /* ── КЛЮЧЕВОЕ: 2 колонки, 11 строк, заполнение по колонкам ── */
            '.cp-families {width: 100% !important;display: grid !important;grid-template-columns: 1fr 1fr !important;grid-auto-flow: column !important;grid-template-rows: repeat(11, auto) !important;gap: 0.25em 0.6em !important;}',
            '.cp-family-row {display: flex !important;flex-direction: row !important;align-items: center !important;gap: 0.3em !important;padding: 0.2em 0.3em !important;background: rgba(255,255,255,0.04) !important;border-radius: 0.4em !important;}',
            '.cp-family-label {width: 3.8em !important;min-width: 3.8em !important;font-size: 0.6em !important;font-weight: 700 !important;text-transform: uppercase !important;color: #fff !important;text-align: right !important;padding-right: 0.4em !important;opacity: 0.85 !important;flex-shrink: 0 !important;}',
            '.cp-swatches {display: flex !important;flex-direction: row !important;gap: 0.3em !important;align-items: center !important;}',
            '.cp-swatch {width: 2.4em !important;height: 2.4em !important;border-radius: 0.4em !important;border: 2px solid transparent !important;cursor: pointer !important;flex-shrink: 0 !important;box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important;}',
            '.cp-modal-wrap .scroll {height: 100% !important;}',
            '.color-picker-modal .modal__content {background: rgba(15,15,15,0.97) !important;border-radius: 1.2em !important;}'
        ].join('');

        updateDateElementStyles();
        checkBodyStyles();
    }

    function openColorPicker() {
        var colorKeys = Object.keys(ColorPlugin.colors.main);
        var families = [
            'Red','Orange','Amber','Yellow','Lime','Green','Emerald','Teal','Cyan',
            'Sky','Blue','Indigo','Violet','Purple','Fuchsia','Pink','Rose','Slate',
            'Gray','Zinc','Neutral','Stone'
        ];

        var topRowHtml =
            '<div class="cp-top-row">' +
                '<div class="cp-default-btn selector" data-cptype="default" title="' + Lampa.Lang.translate('default_color') + '"></div>' +
                '<div class="cp-hex-btn selector" data-cptype="hex">' +
                    '<span class="cp-hex-label">' + Lampa.Lang.translate('custom_hex_input') + '</span>' +
                    '<span class="cp-hex-value">' + (Lampa.Storage.get('color_plugin_custom_hex','') || '#353535') + '</span>' +
                '</div>' +
            '</div>';

        var familiesHtml = '<div class="cp-families">';
        for (var i = 0; i < families.length; i++) {
            var family = families[i];
            var fColors = colorKeys.filter(function(k){ return ColorPlugin.colors.main[k].indexOf(family) === 0 && k !== 'default'; });
            if (!fColors.length) continue;
            familiesHtml += '<div class="cp-family-row">';
            familiesHtml += '<div class="cp-family-label">' + Lampa.Lang.translate(family.toLowerCase()) + '</div>';
            familiesHtml += '<div class="cp-swatches">';
            for (var j = 0; j < fColors.length; j++) {
                familiesHtml += '<div class="cp-swatch selector" data-cptype="swatch" data-color="' + fColors[j] + '" style="background-color:' + fColors[j] + ';" title="' + ColorPlugin.colors.main[fColors[j]] + '"></div>';
            }
            familiesHtml += '</div></div>';
        }
        familiesHtml += '</div>';

        var modalHtml = $('<div class="cp-modal-wrap">' + topRowHtml + familiesHtml + '</div>');

        try {
            Lampa.Modal.open({
                title: Lampa.Lang.translate('main_color'),
                size: 'medium',
                align: 'center',
                html: modalHtml,
                className: 'color-picker-modal',
                onBack: function () {
                    saveSettings();
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('settings_component');
                    Lampa.Controller.enable('menu');
                },
                onSelect: function (a) {
                    if (!a || !a.length || !(a[0] instanceof HTMLElement)) return;
                    var el = a[0];
                    var cptype = el.getAttribute('data-cptype');

                    if (cptype === 'hex') {
                        Lampa.Noty.show(Lampa.Lang.translate('hex_input_hint'));
                        Lampa.Modal.close();
                        var inputOptions = {
                            name: 'color_plugin_custom_hex',
                            value: Lampa.Storage.get('color_plugin_custom_hex', ''),
                            placeholder: '#FFFFFF'
                        };
                        Lampa.Input.edit(inputOptions, function (value) {
                            if (!value) {
                                Lampa.Controller.toggle('settings_component');
                                Lampa.Controller.enable('menu');
                                return;
                            }
                            if (!isValidHex(value)) {
                                Lampa.Noty.show('Невірний формат HEX-коду. Використовуйте формат #FFFFFF.');
                                Lampa.Controller.toggle('settings_component');
                                Lampa.Controller.enable('menu');
                                return;
                            }
                            Lampa.Storage.set('color_plugin_custom_hex', value);
                            ColorPlugin.settings.main_color = value;
                            Lampa.Storage.set('color_plugin_main_color', value);
                            localStorage.setItem('color_plugin_main_color', value);
                            applyStyles();
                            updateCanvasFillStyle(window.draw_context);
                            saveSettings();
                            Lampa.Controller.toggle('settings_component');
                            Lampa.Controller.enable('menu');
                            if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
                        });
                        return;
                    }

                    var color;
                    if (cptype === 'default') {
                        color = '#353535';
                    } else {
                        color = el.getAttribute('data-color') || el.style.backgroundColor || ColorPlugin.settings.main_color;
                        if (color.indexOf('rgb') === 0) color = rgbToHex(color);
                    }

                    ColorPlugin.settings.main_color = color;
                    Lampa.Storage.set('color_plugin_main_color', color);
                    localStorage.setItem('color_plugin_main_color', color);
                    applyStyles();
                    updateCanvasFillStyle(window.draw_context);
                    saveSettings();
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('settings_component');
                    Lampa.Controller.enable('menu');
                    if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
                }
            });
        } catch(e) {}
    }

    function updateParamsVisibility(body) {
        var params = ['color_plugin_main_color','color_plugin_highlight_enabled','color_plugin_dimming_enabled'];
        var container = body || document;
        for (var i = 0; i < params.length; i++) {
            var selector = '.settings-param[data-name="' + params[i] + '"]';
            var elements = container.querySelectorAll ? container.querySelectorAll(selector) : $(selector);
            if (elements.length) {
                var displayValue = ColorPlugin.settings.enabled ? 'block' : 'none';
                for (var j = 0; j < elements.length; j++) {
                    var element = elements[j];
                    if (element.style) element.style.display = displayValue;
                    else if (typeof $(element).css === 'function') $(element).css('display', displayValue);
                }
            }
        }
        if (Lampa.SettingsApi && Lampa.SettingsApi.params) {
            var componentParams = Lampa.SettingsApi.params.filter(function(p){ return p.component === 'color_plugin'; });
            for (var k = 0; k < componentParams.length; k++) {
                var param = componentParams[k];
                if (param.param.name !== 'color_plugin_enabled') {
                    var paramElement = document.querySelector('.settings-param[data-name="' + param.param.name + '"]');
                    if (paramElement && paramElement.style) paramElement.style.display = ColorPlugin.settings.enabled ? 'block' : 'none';
                }
            }
        }
    }

    function initPlugin() {
        setTimeout(function() {
            ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color', '#353535') || localStorage.getItem('color_plugin_main_color') || '#353535';
            ColorPlugin.settings.enabled = (Lampa.Storage.get('color_plugin_enabled', 'true') === 'true' || localStorage.getItem('color_plugin_enabled') === 'true');
            ColorPlugin.settings.highlight_enabled = (Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true' || localStorage.getItem('color_plugin_highlight_enabled') === 'true');
            ColorPlugin.settings.dimming_enabled = (Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true' || localStorage.getItem('color_plugin_dimming_enabled') === 'true');

            if (Lampa.SettingsApi) {
                var svgIcon = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';

                Lampa.SettingsApi.addComponent({
                    component: 'color_plugin',
                    name: Lampa.Lang.translate('color_plugin'),
                    icon: svgIcon
                });

                Lampa.SettingsApi.addParam({
                    component: 'color_plugin',
                    param: { name: 'color_plugin_enabled', type: 'trigger', default: ColorPlugin.settings.enabled.toString() },
                    field: {
                        name: Lampa.Lang.translate('color_plugin_enabled'),
                        description: Lampa.Lang.translate('color_plugin_enabled_description')
                    },
                    onChange: function(value) {
                        ColorPlugin.settings.enabled = value === 'true';
                        Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
                        localStorage.setItem('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
                        applyStyles();
                        updateCanvasFillStyle(window.draw_context);
                        updateParamsVisibility();
                        saveSettings();
                        if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
                    },
                    onRender: function(item) {
                        if (item && typeof item.css === 'function') item.css('display','block');
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'color_plugin',
                    param: { name: 'color_plugin_main_color', type: 'button' },
                    field: {
                        name: Lampa.Lang.translate('main_color'),
                        description: Lampa.Lang.translate('main_color_description')
                    },
                    onRender: function(item) {
                        if (item && typeof item.css === 'function') item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                    },
                    onChange: function() { openColorPicker(); }
                });

                Lampa.SettingsApi.addParam({
                    component: 'color_plugin',
                    param: { name: 'color_plugin_highlight_enabled', type: 'trigger', default: ColorPlugin.settings.highlight_enabled.toString() },
                    field: {
                        name: Lampa.Lang.translate('enable_highlight'),
                        description: Lampa.Lang.translate('enable_highlight_description')
                    },
                    onRender: function(item) {
                        if (item && typeof item.css === 'function') item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                    },
                    onChange: function(value) {
                        ColorPlugin.settings.highlight_enabled = value === 'true';
                        Lampa.Storage.set('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
                        localStorage.setItem('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
                        applyStyles();
                        saveSettings();
                        if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'color_plugin',
                    param: { name: 'color_plugin_dimming_enabled', type: 'trigger', default: ColorPlugin.settings.dimming_enabled.toString() },
                    field: {
                        name: Lampa.Lang.translate('enable_dimming'),
                        description: Lampa.Lang.translate('enable_dimming_description')
                    },
                    onRender: function(item) {
                        if (item && typeof item.css === 'function') item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                    },
                    onChange: function(value) {
                        ColorPlugin.settings.dimming_enabled = value === 'true';
                        Lampa.Storage.set('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
                        localStorage.setItem('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
                        applyStyles();
                        saveSettings();
                        if (Lampa.Settings && Lampa.Settings.render) Lampa.Settings.render();
                    }
                });

                applyStyles();
                updateCanvasFillStyle(window.draw_context);
                updatePluginIcon();
                updateParamsVisibility();
            }
        }, 100);
    }

    if (window.appready && Lampa.SettingsApi && Lampa.Storage) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready' && Lampa.SettingsApi && Lampa.Storage) initPlugin();
        });
    }

    Lampa.Storage.listener.follow('change', function(e) {
        if (e.name === 'color_plugin_enabled' || e.name === 'color_plugin_main_color' ||
            e.name === 'color_plugin_highlight_enabled' || e.name === 'color_plugin_dimming_enabled') {
            ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled','true') === 'true' || localStorage.getItem('color_plugin_enabled') === 'true';
            ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color','#353535') || localStorage.getItem('color_plugin_main_color') || '#353535';
            ColorPlugin.settings.highlight_enabled = Lampa.Storage.get('color_plugin_highlight_enabled','true') === 'true' || localStorage.getItem('color_plugin_highlight_enabled') === 'true';
            ColorPlugin.settings.dimming_enabled = Lampa.Storage.get('color_plugin_dimming_enabled','true') === 'true' || localStorage.getItem('color_plugin_dimming_enabled') === 'true';
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updateParamsVisibility();
        }
    });

    Lampa.Listener.follow('settings_component', function(event) {
        if (event.type === 'open') {
            ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled','true') === 'true' || localStorage.getItem('color_plugin_enabled') === 'true';
            ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color','#353535') || localStorage.getItem('color_plugin_main_color') || '#353535';
            ColorPlugin.settings.highlight_enabled = Lampa.Storage.get('color_plugin_highlight_enabled','true') === 'true' || localStorage.getItem('color_plugin_highlight_enabled') === 'true';
            ColorPlugin.settings.dimming_enabled = Lampa.Storage.get('color_plugin_dimming_enabled','true') === 'true' || localStorage.getItem('color_plugin_dimming_enabled') === 'true';
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon();
            updateParamsVisibility(event.body);
        } else if (event.type === 'close') {
            saveSettings();
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon();
        }
    });

})();