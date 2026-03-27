(function () {
    'use strict';

    // Головна функція ініціалізації плагіна
    function startPlugin() {
        window.fix_size_plugin = true;

        // Налаштування та додавання функціоналу
        function addPlugin() {
            // Локалізація пунктів меню
            Lampa.Lang.add({
                settings_interface_size_fixed: {
                    en: 'Fixed size',
                    uk: 'Фіксований розмір'
                },
                settings_interface_row_spacing: {
                    en: 'Row spacing',
                    uk: 'Відступ між рядами'
                }
            });

            // Налаштування розміру шрифту
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    name: 'interface_size_fixed',
                    type: 'select',
                    values: {
                        '8': '8',
                        '9': '9',
                        '10': '10',
                        '11': '11',
                        '12': '12',
                        '13': '13',
                        '14': '14',
                        '15': '15'
                    },
                    "default": '10'
                },
                field: {
                    name: Lampa.Lang.translate('settings_interface_size_fixed')
                },
                onChange: updateStyles
            });

            // Налаштування відступів між рядами
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    name: 'interface_row_spacing',
                    type: 'select',
                    values: {
                        '-2.5': '-2.5',
                        '-2.0': '-2.0',
                        '-1.5': '-1.5',
                        '-1.0': '-1.0',
                        '-0.5': '-0.5',
                        '0.0': '0.0',
                        '0.5': '0.5',
                        '1.0': '1.0',
                        '1.5': '1.5'
                    },
                    "default": '0.0'
                },
                field: {
                    name: Lampa.Lang.translate('settings_interface_row_spacing')
                },
                onChange: updateStyles
            });

            // Зміна позиції пунктів у налаштуваннях інтерфейсу
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name === 'interface') {
                    var body = e.body;
                    var item_size = body.find('[data-name="interface_size_fixed"]');
                    var item_spacing = body.find('[data-name="interface_row_spacing"]');
                    var item_orig = body.find('[data-name="interface_size"]');

                    item_size.detach().insertAfter(item_orig);
                    item_spacing.detach().insertAfter(item_size);
                }
            });

            // Формування та застосування CSS правил
            function updateStyles() {
                var css_id = 'fix_size_css';
                var css_el = $('style#' + css_id);

                if (!css_el.length) {
                    css_el = $('<style type="text/css" id="' + css_id + '"></style>');
                    css_el.appendTo('head');
                }

                var storage_spacing = Lampa.Storage.field('interface_row_spacing');
                var final_margin = (storage_spacing !== null && typeof storage_spacing !== 'undefined') ? parseFloat(storage_spacing) : 0.0;

                var styles = '\
                    .card--category { width: 16em !important; }\
                    .items-line { margin-bottom: ' + final_margin + 'em !important; }\
                    .category-full__row { margin-bottom: ' + final_margin + 'em !important; }\
                ';

                css_el.html(styles);
                Lampa.Layer.update();
            }

            // Перевизначення платформи для вимкнення стандартного масштабування на ТВ
            var platform_screen = Lampa.Platform.screen;
            Lampa.Platform.screen = function (need) {
                if (need === 'tv') {
                    try {
                        var stack = new Error().stack.split('\n');
                        var offset = stack[0] === 'Error' ? 1 : 0;
                        if (/^( *at +new +)?create\$i/.test(stack[1 + offset]) && /^( *at +)?component(\/this)?\.append/.test(stack[2 + offset])) {
                            return false;
                        }
                    } catch (e) {}
                }
                return platform_screen(need);
            };

            // Примусове застосування розміру шрифту при оновленні шарів
            var layer_update = Lampa.Layer.update;
            Lampa.Layer.update = function (where) {
                var storage_size = Lampa.Storage.field('interface_size_fixed');
                var font_size = parseInt(storage_size) || 10;
                $('body').css({ fontSize: font_size + 'px' });
                layer_update(where);
            };

            // Оновлення інтерфейсу при зміні розмірів вікна
            var timer;
            $(window).on('resize', function () {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    Lampa.Layer.update();
                }, 150);
            });

            // Первинне застосування стилів
            updateStyles();
        }

        // Перевірка готовності застосунку перед ініціалізацією
        if (window.appready) addPlugin();
        else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') addPlugin();
            });
        }
    }

    // Реєстрація маніфесту та запуск плагіна
    if (!window.fix_size_plugin) {
        var manifest = {
            type: 'other',
            version: '1.6.0',
            name: 'Fixed size and row spacing',
            author: '@bodya_elven'
        };
        startPlugin();
    }
})();
