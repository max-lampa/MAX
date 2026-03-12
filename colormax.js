(function () {
    'use strict';

    function UltimateThemePlugin() {
        var _this = this;
        
        // Палитра с русскими названиями
        var colorPalette = [
            { name: 'Стандартный (Синий)', hex: 'default' },
            { name: 'Кроваво-красный', hex: '#ff4444' },
            { name: 'Ядовито-зеленый', hex: '#00c851' },
            { name: 'Небесно-голубой', hex: '#33b5e5' },
            { name: 'Ярко-оранжевый', hex: '#ff8800' },
            { name: 'Королевский пурпур', hex: '#aa66cc' },
            { name: 'Золото', hex: '#ffbb33' },
            { name: 'Белоснежный', hex: '#ffffff' },
            { name: 'Мятный', hex: '#2bbbad' }
        ];

        this.apply = function () {
            var color = Lampa.Storage.get('custom_theme_hex', 'default');
            var night = Lampa.Storage.get('custom_theme_night', false);
            
            var style = document.getElementById('lampa-ultimate-theme');
            if (!style) {
                style = document.createElement('style');
                style.id = 'lampa-ultimate-theme';
                document.head.appendChild(style);
            }

            if (color === 'default' && !night) {
                style.innerHTML = '';
                return;
            }

            var css = '';
            
            // Если включен ночной режим — приглушаем фон
            if (night) {
                css += `
                    body:after {
                        content: "";
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0, 0, 0, 0.4);
                        z-index: -1;
                        pointer-events: none;
                    }
                    .background__canvas { opacity: 0.3 !important; }
                `;
            }

            // Применяем выбранный цвет ко всем элементам
            if (color !== 'default') {
                css += `
                    :root { --color-main: ${color} !important; }
                    
                    /* Фокус на всем: кнопки, карточки, пункты меню, настройки */
                    .focus, .button.focus, .menu__item.focus, .selector.focus, 
                    .card.focus, .settings-param.focus, .files__item.focus {
                        background-color: ${color} !important;
                        color: #fff !important;
                        border-color: ${color} !important;
                        transform: scale(1.02); /* Легкий эффект увеличения */
                        transition: transform 0.2s ease;
                    }

                    /* Активные элементы (текст, иконки) */
                    .is--active, .active, .menu__item.active, .settings-param__name.active,
                    .category-full__title.active { 
                        color: ${color} !important; 
                    }

                    /* Плеер: прогресс, громкость, кнопки */
                    .player-panel__process-progress, .player-panel__volume-progress,
                    .progress__line, .p-bar, .slider__grid-range {
                        background-color: ${color} !important;
                    }
                    
                    /* Иконки в фокусе */
                    .focus svg, .focus img { fill: #fff !important; }
                `;
            }

            style.innerHTML = css;
        };

        this.openMenu = function () {
            var items = colorPalette.map(function (c) {
                return { title: c.name, value: c.hex };
            });

            Lampa.Select.show({
                title: 'Цветовая схема',
                items: items,
                onSelect: function (a) {
                    Lampa.Storage.set('custom_theme_hex', a.value);
                    _this.apply();
                    Lampa.Controller.toggle('settings_interface'); // Возврат фокуса
                },
                onBack: function () {
                    Lampa.Controller.toggle('settings_interface'); // Возврат фокуса
                }
            });
        };

        this.start = function () {
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'interface') {
                    // Кнопка выбора цвета
                    var btnColor = $(`<div class="settings-param selector" data-type="toggle">
                        <div class="settings-param__name">Основной цвет</div>
                        <div class="settings-param__value">Изменить</div>
                    </div>`);

                    // Кнопка ночного режима
                    var isNight = Lampa.Storage.get('custom_theme_night', false);
                    var btnNight = $(`<div class="settings-param selector" data-type="toggle">
                        <div class="settings-param__name">Ночной режим</div>
                        <div class="settings-param__value">${isNight ? 'Включен' : 'Выключен'}</div>
                    </div>`);

                    btnColor.on('hover:enter', function () {
                        _this.openMenu();
                    });

                    btnNight.on('hover:enter', function () {
                        var status = !Lampa.Storage.get('custom_theme_night', false);
                        Lampa.Storage.set('custom_theme_night', status);
                        btnNight.find('.settings-param__value').text(status ? 'Включен' : 'Выключен');
                        _this.apply();
                    });

                    e.body.find('.settings-param').last().after(btnColor).after(btnNight);
                }
            });

            this.apply();
        };
    }

    if (window.appready) new UltimateThemePlugin().start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') new UltimateThemePlugin().start();
        });
    }
})();