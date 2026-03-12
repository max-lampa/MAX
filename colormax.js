(function () {
    'use strict';

    function ColorThemePlugin() {
        // Список цветов с понятными названиями
        var colorPalette = [
            { name: 'Стандартный синий', hex: 'default' },
            { name: 'Алый красный', hex: '#ff4444' },
            { name: ' Сочно-зеленый', hex: '#00c851' },
            { name: 'Морская волна', hex: '#2bbbad' },
            { name: 'Глубокий синий', hex: '#4285f4' },
            { name: 'Насыщенный оранжевый', hex: '#ff8800' },
            { name: 'Золотистый', hex: '#ffbb33' },
            { name: 'Фиолетовый', hex: '#aa66cc' },
            { name: 'Розовый фламинго', hex: '#ff33b2' },
            { name: 'Грифельный', hex: '#607d8b' },
            { name: 'Чистый белый', hex: '#ffffff' },
            { name: 'Лимонный', hex: '#ccff00' }
        ];

        this.apply = function (color) {
            var style = document.getElementById('lampa-custom-theme');
            if (!style) {
                style = document.createElement('style');
                style.id = 'lampa-custom-theme';
                document.head.appendChild(style);
            }

            if (color === 'default' || !color) {
                style.innerHTML = ''; // Сброс к заводским
            } else {
                style.innerHTML = `
                    :root {
                        --color-main: ${color} !important;
                        --color-focus: ${color} !important;
                    }
                    /* Подсветка кнопок, иконок и активных элементов меню */
                    .button.focus, .menu__item.focus, .selector.focus, .card.focus {
                        background-color: ${color} !important;
                        border-color: ${color} !important;
                        color: #fff !important;
                    }
                    .is--active { color: ${color} !important; }
                `;
            }
        };

        this.openMenu = function () {
            var _this = this;
            var items = colorPalette.map(function (c) {
                return {
                    // Рисуем цветной квадрат перед названием для наглядности
                    title: '<span style="display:inline-block;width:12px;height:12px;background:' + (c.hex === 'default' ? '#33b5e5' : c.hex) + ';margin-right:8px;border-radius:2px;"></span>' + c.name,
                    value: c.hex
                };
            });

            Lampa.Select.show({
                title: 'Цвет интерфейса',
                items: items,
                onSelect: function (a) {
                    Lampa.Storage.set('custom_theme_hex', a.value);
                    _this.apply(a.value);
                    // Возвращаем фокус в настройки после выбора
                    Lampa.Controller.toggle('settings_interface');
                },
                onBack: function () {
                    Lampa.Controller.toggle('settings_interface');
                }
            });
        };

        this.start = function () {
            var _this = this;

            // Добавляем кнопку в Настройки -> Интерфейс
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'interface') {
                    var btn = $(`<div class="settings-param selector" data-type="toggle">
                        <div class="settings-param__name">Выбрать цвет кнопок</div>
                        <div class="settings-param__value">Изменить</div>
                    </div>`);

                    btn.on('hover:enter', function () {
                        _this.openMenu();
                    });

                    // Вставляем кнопку в конец списка настроек интерфейса
                    e.body.find('.settings-param').last().after(btn);
                }
            });

            // Применяем сохраненный цвет при загрузке Lampa
            var saved = Lampa.Storage.get('custom_theme_hex', 'default');
            this.apply(saved);
        };
    }

    // Запуск
    if (window.appready) new ColorThemePlugin().start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') new ColorThemePlugin().start();
        });
    }
})();