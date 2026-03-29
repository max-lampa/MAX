(function () {
    'use strict';

    var ClockPlugin = {
        interval: null,
        element: null,

        init: function () {
            var self = this;

            // Ждём загрузки интерфейса Lampa
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    self.create();
                }
            });
        },

        create: function () {
            var self = this;

            // Создаём элемент часов
            this.element = $('<div class="lampa-clock"></div>');

            // Стили для часов
            var style = $('<style>' +
                '.lampa-clock {' +
                '    position: fixed;' +
                '    top: 20px;' +
                '    right: 30px;' +
                '    z-index: 9999;' +
                '    color: #ffffff;' +
                '    font-size: 22px;' +
                '    font-family: Arial, sans-serif;' +
                '    font-weight: bold;' +
                '    text-shadow: 0 0 6px rgba(0,0,0,0.8);' +
                '    pointer-events: none;' +
                '    letter-spacing: 1px;' +
                '}' +
                '</style>');

            $('head').append(style);
            $('body').append(this.element);

            // Сразу обновляем и запускаем интервал
            this.tick();
            this.interval = setInterval(function () {
                self.tick();
            }, 1000);
        },

        tick: function () {
            var now = new Date();
            var hours   = this.pad(now.getHours());
            var minutes = this.pad(now.getMinutes());
            var seconds = this.pad(now.getSeconds());
            var timeStr = hours + ':' + minutes + ':' + seconds;

            if (this.element) {
                this.element.text(timeStr);
            }
        },

        pad: function (n) {
            return n < 10 ? '0' + n : String(n);
        },

        destroy: function () {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
            if (this.element) {
                this.element.remove();
                this.element = null;
            }
        }
    };

    // Регистрируем плагин в Lampa
    Lampa.Plugin.add('clock', ClockPlugin);

    // Запускаем
    ClockPlugin.init();

})();