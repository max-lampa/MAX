(function() {
    'use strict';

    const KEY_SIZE = 'clock_bubble_size';
    const KEY_WIDTH = 'clock_bubble_width';
    const KEY_RADIUS = 'clock_bubble_radius';

    function applyStyles() {
        const clock = document.querySelector('#custom-bubble-clock');
        if (!clock) return;
        const size = Lampa.Storage.get(KEY_SIZE, '1.5');
        const scale = Lampa.Storage.get(KEY_WIDTH, '1.0');
        const radius = Lampa.Storage.get(KEY_RADIUS, '20');
        clock.style.fontSize = size + 'em';
        clock.style.transform = `scaleX(${scale})`;
        clock.querySelectorAll('.clock-unit').forEach(b => b.style.borderRadius = radius + 'px');
    }

    // Создаем визуальную часть настроек вручную
    Lampa.Component.add('clock_bubble_component', function() {
        var _this = this;
        this.create = function() {
            var settings = [
                { title: 'Размер шрифта', name: KEY_SIZE, min: 0.5, max: 5, step: 0.1, default: 1.5 },
                { title: 'Ширина пузырьков', name: KEY_WIDTH, min: 0.5, max: 3, step: 0.1, default: 1.0 },
                { title: 'Скругление', name: KEY_RADIUS, min: 0, max: 100, step: 2, default: 20 }
            ];

            this.list = $('<div class="settings-list"></div>');

            settings.forEach(function(item) {
                var value = Lampa.Storage.get(item.name, item.default);
                var row = $('<div class="settings-param selector"><div class="settings-param__name">' + item.title + '</div><div class="settings-param__value">' + value + '</div></div>');
                
                row.on('hover:enter', function() {
                    Lampa.Input.box('Введите значение (' + item.min + '-' + item.max + ')', value, function(newVal) {
                        if (newVal) {
                            Lampa.Storage.set(item.name, newVal);
                            row.find('.settings-param__value').text(newVal);
                            applyStyles();
                        }
                    }, false, { type: 'number' });
                });
                _this.list.append(row);
            });
        };

        this.render = function() { return this.list; };
    });

    function init() {
        // Добавляем пункт в настройки, который будет открывать наш компонент
        Lampa.SettingsApi.addComponent({
            component: 'clock_bubble_component',
            name: 'Часы Bubble'
        });

        // Создаем сами часы
        function createClock() {
            if (document.querySelector('#custom-bubble-clock')) return;
            const oldClock = document.querySelector('.head__time');
            if (!oldClock) return;
            const container = document.createElement('div');
            container.id = 'custom-bubble-clock';
            Object.assign(container.style, { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: 'bold', marginRight: '10px' });
            container.innerHTML = `<div class="clock-unit" style="color:#fff; background: rgba(255,255,255,0.2); padding: 2px 12px; margin: 0 2px;">00</div><div style="color:#ff9100; margin: 0 2px;">:</div><div class="clock-unit" style="color:#ff9100; background: rgba(255,255,255,0.2); padding: 2px 12px; margin: 0 2px;">00</div>`;
            oldClock.parentNode.replaceChild(container, oldClock);
            setInterval(() => {
                const now = new Date();
                const units = container.querySelectorAll('.clock-unit');
                if(units.length >= 2) {
                    units[0].textContent = now.getHours().toString().padStart(2, '0');
                    units[1].textContent = now.getMinutes().toString().padStart(2, '0');
                }
            }, 5000);
            applyStyles();
        }
        setTimeout(createClock, 1500);
    }

    if (window.Lampa) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }
})();