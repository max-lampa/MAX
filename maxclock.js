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
        
        const bubbles = clock.querySelectorAll('.clock-unit');
        bubbles.forEach(b => {
            b.style.borderRadius = radius + 'px';
        });
    }

    function createClock() {
        if (document.querySelector('#custom-bubble-clock')) return;
        const oldClock = document.querySelector('.head__time');
        if (!oldClock) return;

        const container = document.createElement('div');
        container.id = 'custom-bubble-clock';
        Object.assign(container.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 'bold',
            marginRight: '10px',
            zIndex: '100'
        });

        container.innerHTML = `
            <div class="clock-unit" style="color:#fff; background: rgba(255,255,255,0.2); padding: 2px 12px; margin: 0 2px;">00</div>
            <div style="color:#ff9100; margin: 0 2px; font-weight: 900;">:</div>
            <div class="clock-unit" style="color:#ff9100; background: rgba(255,255,255,0.2); padding: 2px 12px; margin: 0 2px;">00</div>
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
        setInterval(update, 5000);
        update();
        applyStyles();
    }

    function init() {
        // Регистрируем компонент
        Lampa.SettingsApi.addComponent({
            component: 'clock_bubble',
            name: 'Часы Bubble'
        });

        // Добавляем параметры
        Lampa.SettingsApi.addParam({
            component: 'clock_bubble',
            param: { name: KEY_SIZE, type: 'range', default: 1.5, min: 0.5, max: 5, step: 0.1 },
            field: { name: 'Размер шрифта', description: 'Высота часов' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'clock_bubble',
            param: { name: KEY_WIDTH, type: 'range', default: 1.0, min: 0.5, max: 3, step: 0.1 },
            field: { name: 'Ширина пузырьков', description: 'Растягивание' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'clock_bubble',
            param: { name: KEY_RADIUS, type: 'range', default: 20, min: 0, max: 100, step: 2 },
            field: { name: 'Скругление (Bubble)', description: 'Сделайте 100 для круга' },
            onChange: applyStyles
        });

        // Прямой запуск рендеринга настроек при клике (фикс пустого экрана)
        Lampa.Listener.follow('settings', function(e) {
            if (e.type === 'open' && e.name === 'clock_bubble') {
                // Если экран пустой, принудительно отрисовываем параметры
                setTimeout(function() {
                    if ($('.settings-list').is(':empty')) {
                        Lampa.Controller.render(); 
                    }
                }, 10);
            }
        });

        setTimeout(createClock, 1000);
    }

    if (window.Lampa) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }
})();
