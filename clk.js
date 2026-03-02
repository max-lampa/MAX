(function () {
    'use strict';

    // Ключи настроек
    var KEY_SIZE = 'bubble_clock_size';
    var KEY_WIDTH = 'bubble_clock_scale';
    var KEY_RADIUS = 'bubble_clock_radius';

    // Применение стилей
    function applyStyles() {
        var clock = $('#custom-bubble-clock');
        if (clock.length) {
            var size = Lampa.Storage.get(KEY_SIZE, '1.5');
            var scale = Lampa.Storage.get(KEY_WIDTH, '1.0');
            var radius = Lampa.Storage.get(KEY_RADIUS, '20');

            clock.css({
                'font-size': size + 'em',
                'transform': 'scaleX(' + scale + ')'
            });
            clock.find('.clock-unit').css('border-radius', radius + 'px');
        }
    }

    // Создание компонента для отрисовки меню
    Lampa.Component.add('bubble_clock_menu', function (object) {
        var _this = this;
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var items = [
            { title: 'Размер шрифта', name: KEY_SIZE, default: '1.5' },
            { title: 'Ширина (масштаб)', name: KEY_WIDTH, default: '1.0' },
            { title: 'Скругление (Bubble)', name: KEY_RADIUS, default: '20' }
        ];

        this.create = function () {
            this.list = $('<div class="settings-list"></div>');

            items.forEach(function (item) {
                var value = Lampa.Storage.get(item.name, item.default);
                var row = $('<div class="settings-param selector"><div class="settings-param__name">' + item.title + '</div><div class="settings-param__value">' + value + '</div></div>');

                row.on('hover:enter', function () {
                    Lampa.Input.box('Введите значение', value, function (new_val) {
                        if (new_val) {
                            Lampa.Storage.set(item.name, new_val);
                            row.find('.settings-param__value').text(new_val);
                            applyStyles();
                        }
                    }, false, { type: 'number' });
                });
                _this.list.append(row);
            });

            scroll.append(this.list);
        };

        this.render = function () {
            return scroll.render();
        };
    });

    // Отрисовка самих часов
    function createClock() {
        if ($('#custom-bubble-clock').length) return;

        var head = $('.head__time');
        if (!head.length) return;

        var clock = $('<div id="custom-bubble-clock" style="display:flex; align-items:center; font-weight:bold; margin-right:10px; z-index:100; transition: all 0.2s ease;">' +
            '<div class="clock-unit" style="color:#fff; background:rgba(255,255,255,0.2); padding:2px 12px; margin:0 2px;">00</div>' +
            '<div style="color:#ff9100; margin:0 2px;">:</div>' +
            '<div class="clock-unit" style="color:#ff9100; background:rgba(255,255,255,0.2); padding:2px 12px; margin:0 2px;">00</div>' +
        '</div>');

        head.replaceWith(clock);

        setInterval(function () {
            var now = new Date();
            clock.find('.clock-unit').eq(0).text(now.getHours().toString().padStart(2, '0'));
            clock.find('.clock-unit').eq(1).text(now.getMinutes().toString().padStart(2, '0'));
        }, 5000);

        applyStyles();
    }

    // Инициализация
    function init() {
        // Добавляем раздел в настройки
        Lampa.SettingsApi.addComponent({
            component: 'bubble_clock_menu',
            name: 'Часы Bubble'
        });

        createClock();
    }

    // Запуск плагина
    if (window.Lampa) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
