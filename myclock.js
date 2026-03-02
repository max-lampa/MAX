(function() {
    'use strict';

    // Ключи хранилища
    const KEY_SIZE = 'clock_bubble_size';
    const KEY_WIDTH = 'clock_bubble_width';
    const KEY_RADIUS = 'clock_bubble_radius';

    function applyStyles() {
        const clock = document.querySelector('#custom-bubble-clock');
        if (!clock) return;

        const size = localStorage.getItem(KEY_SIZE) || '1.5';
        const scale = localStorage.getItem(KEY_WIDTH) || '1.0';
        const radius = localStorage.getItem(KEY_RADIUS) || '20';

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
            marginRight: '10px'
        });

        container.innerHTML = `
            <span class="clock-unit" style="color:#fff; background: rgba(255,255,255,0.15); padding: 2px 10px; margin: 0 2px;"></span>
            <span style="color:#ff9100; margin: 0 2px;">:</span>
            <span class="clock-unit" style="color:#ff9100; background: rgba(255,255,255,0.15); padding: 2px 10px; margin: 0 2px;"></span>
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
        setInterval(update, 1000);
        update();
        applyStyles();
    }

    // Функция создания окна настроек (вызывается из меню)
    function openClockSettings() {
        const html = $(`
            <div class="settings-list">
                <div class="settings-param" data-type="range" data-name="size">
                    <div class="settings-param__name">Размер шрифта</div>
                    <div class="settings-param__value"></div>
                </div>
                <div class="settings-param" data-type="range" data-name="width">
                    <div class="settings-param__name">Ширина (растяжение)</div>
                    <div class="settings-param__value"></div>
                </div>
                <div class="settings-param" data-type="range" data-name="radius">
                    <div class="settings-param__name">Скругление (Bubble)</div>
                    <div class="settings-param__value"></div>
                </div>
            </div>
        `);

        // Логика работы ползунков внутри модалки
        const params = [
            { key: KEY_SIZE, name: 'size', min: 0.8, max: 4.0, step: 0.1, def: 1.5, unit: 'em' },
            { key: KEY_WIDTH, name: 'width', min: 0.5, max: 3.0, step: 0.1, def: 1.0, unit: 'x' },
            { key: KEY_RADIUS, name: 'radius', min: 0, max: 50, step: 2, def: 20, unit: 'px' }
        ];

        params.forEach(p => {
            const row = html.find(`[data-name="${p.name}"]`);
            let val = parseFloat(localStorage.getItem(p.key)) || p.def;
            
            row.find('.settings-param__value').text(val + p.unit);
            
            row.on('hover:enter', () => {
                Lampa.Input.box('Введите значение (' + p.min + '-' + p.max + ')', val, (newVal) => {
                    if (newVal) {
                        localStorage.setItem(p.key, newVal);
                        applyStyles();
                        Lampa.Modal.close(); // Переоткроем для обновления текста или просто обновим
                        openClockSettings();
                    }
                }, false, { type: 'number' });
            });
        });

        Lampa.Modal.open({
            title: 'Настройки Bubble Clock',
            html: html,
            size: 'medium',
            onBack: () => {
                Lampa.Modal.close();
                Lampa.Controller.toggle('main');
            }
        });
    }

    // Добавление кнопки в боковое меню
    function addMenuButton() {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') {
                // Добавляем пункт в главное меню
                Lampa.Menu.add({
                    id: 'clock_settings',
                    title: 'Настройки часов',
                    icon: `<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#fff"/></svg>`,
                    onSelect: () => {
                        openClockSettings();
                    }
                });
            }
        });
    }

    // Старт
    addMenuButton();
    // Ждем отрисовку интерфейса, чтобы заменить часы
    setTimeout(createClock, 1000);

})();
