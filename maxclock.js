(function() {
    'use strict';

    const KEY_SIZE = 'clock_bubble_size';
    const KEY_WIDTH = 'clock_bubble_width';
    const KEY_RADIUS = 'clock_bubble_radius';
    const KEY_BG = 'clock_bubble_bg';

    function init() {
        // Регистрация настроек в меню Lampa
        Lampa.SettingsApi.addParam({
            component: 'plugins',
            param: { name: 'clock_bubble_size', type: 'range', default: 1.5, min: 0.8, max: 3.0, step: 0.1 },
            field: { name: 'Часы: Размер шрифта', description: 'Общий размер текста' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'plugins',
            param: { name: 'clock_bubble_width', type: 'range', default: 1.0, min: 0.5, max: 2.5, step: 0.1 },
            field: { name: 'Часы: Ширина (Scale)', description: 'Растяжение по горизонтали' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'plugins',
            param: { name: 'clock_bubble_radius', type: 'range', default: 20, min: 0, max: 50, step: 2 },
            field: { name: 'Часы: Скругление (Bubble)', description: 'Скругление углов фона' },
            onChange: applyStyles
        });

        createClock();
    }

    function applyStyles() {
        const clock = document.querySelector('#custom-bubble-clock');
        if (!clock) return;

        const size = Lampa.Storage.get('clock_bubble_size', '1.5');
        const scale = Lampa.Storage.get('clock_bubble_width', '1.0');
        const radius = Lampa.Storage.get('clock_bubble_radius', '20');

        clock.style.fontSize = size + 'em';
        clock.style.transform = `scaleX(${scale})`;
        
        const bubbles = clock.querySelectorAll('.clock-unit');
        bubbles.forEach(b => {
            b.style.borderRadius = radius + 'px';
            b.style.padding = '2px 8px';
            b.style.margin = '0 2px';
            b.style.background = 'rgba(255,255,255,0.1)'; // Легкий фон баббла
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
            transition: 'all 0.2s ease'
        });

        const timeHtml = `
            <span class="clock-unit" style="color:#fff;"></span>
            <span style="color:#ff9100; margin: 0 2px;">:</span>
            <span class="clock-unit" style="color:#ff9100;"></span>
        `;
        container.innerHTML = timeHtml;
        
        oldClock.parentNode.replaceChild(container, oldClock);

        function update() {
            const now = new Date();
            const units = container.querySelectorAll('.clock-unit');
            if(units.length >= 2) {
                units[0].textContent = now.getHours().toString().padStart(2, '0');
                units[1].textContent = now.getMinutes().toString().padStart(2, '0');
            }
        }

        setInterval(update, 1000);
        update();
        applyStyles();
    }

    // Запуск
    if (window.Lampa) {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') init();
        });
    }
})();
