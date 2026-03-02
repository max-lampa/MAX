(function() {
    'use strict';

    // Ключи для хранения настроек
    const KEY_SIZE   = 'clock_bubble_size';
    const KEY_WIDTH  = 'clock_bubble_width';
    const KEY_RADIUS = 'clock_bubble_radius';

    function applyStyles() {
        const clock = document.querySelector('#custom-bubble-clock');
        if (!clock) return;

        // Получаем значения из Lampa.Storage (штатный метод)
        const size   = Lampa.Storage.get(KEY_SIZE, '1.5');
        const scale  = Lampa.Storage.get(KEY_WIDTH, '1.0');
        const radius = Lampa.Storage.get(KEY_RADIUS, '20');

        clock.style.fontSize = size + 'em';
        clock.style.transform = `scaleX(${scale})`;
        
        const bubbles = clock.querySelectorAll('.clock-unit');
        bubbles.forEach(b => {
            b.style.borderRadius = radius + 'px';
        });
    }

    function createClock() {
        const oldClock = document.querySelector('.head__time');
        if (!oldClock || document.querySelector('#custom-bubble-clock')) return;

        const container = document.createElement('div');
        container.id = 'custom-bubble-clock';
        Object.assign(container.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            marginRight: '10px',
            zIndex: '10'
        });

        container.innerHTML = `
            <div class="clock-unit" style="color:#fff; background: rgba(255,255,255,0.15); padding: 2px 10px; margin: 0 2px;">00</div>
            <div style="color:#ff9100; margin: 0 2px;">:</div>
            <div class="clock-unit" style="color:#ff9100; background: rgba(255,255,255,0.15); padding: 2px 10px; margin: 0 2px;">00</div>
        `;
        
        oldClock.parentNode.replaceChild(container, oldClock);

        function update() {
            const now = new Date();
            const units = container.querySelectorAll('.clock-unit');
            if(units.length >= 2) {
                units[0].textContent = now.getHours().toString().padStart(2, '0');
                units[1].textContent = now.getMinutes().toString().padStart(2, '0');
            }
        }
        setInterval(update, 10000); // Обновляем раз в 10 сек для экономии ресурсов
        update();
        applyStyles();
    }

    function init() {
        // Добавляем параметры в раздел "Интерфейс"
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: KEY_SIZE,
                type: 'range',
                default: 1.5,
                min: 0.8,
                max: 4.0,
                step: 0.1
            },
            field: {
                name: 'Размер часов (Bubble)',
                description: 'Изменяет высоту и размер шрифта'
            },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: KEY_WIDTH,
                type: 'range',
                default: 1.0,
                min: 0.5,
                max: 2.5,
                step: 0.1
            },
            field: {
                name: 'Ширина часов',
                description: 'Растягивание пузырьков по горизонтали'
            },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: KEY_RADIUS,
                type: 'range',
                default: 20,
                min: 0,
                max: 50,
                step: 2
            },
            field: {
                name: 'Скругление часов',
                description: '0 - квадратные, 50 - круглые'
            },
            onChange: applyStyles
        });

        createClock();
    }

    // Запуск после полной готовности Lampa
    if (window.Lampa) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                init();
            }
        });
    }
})();
