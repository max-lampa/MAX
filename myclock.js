(function() {
    'use strict';

    const STORAGE_KEY_SIZE = 'lampac_clock_font_size';
    const STORAGE_KEY_WIDTH = 'lampac_clock_width';

    function init() {
        // 1. Добавляем настройки в раздел "Настройки -> Плагины"
        Lampa.SettingsApi.addParam({
            component: 'plugins',
            param: {
                name: 'lampac_clock_size',
                type: 'range',
                default: 2.5,
                min: 1.2,
                max: 5.0,
                step: 0.1
            },
            field: {
                name: 'Размер часов (em)',
                description: 'Изменяет высоту шрифта часов'
            },
            onChange: function(value) {
                localStorage.setItem(STORAGE_KEY_SIZE, value);
                applyStyles();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'plugins',
            param: {
                name: 'lampac_clock_scale',
                type: 'range',
                default: 1.0,
                min: 0.5,
                max: 2.0,
                step: 0.05
            },
            field: {
                name: 'Ширина часов (scale)',
                description: 'Растягивает или сужает часы по горизонтали'
            },
            onChange: function(value) {
                localStorage.setItem(STORAGE_KEY_WIDTH, value);
                applyStyles();
            }
        });

        createClock();
    }

    function applyStyles() {
        const clock = document.querySelector('#custom-clock');
        if (!clock) return;

        const size = localStorage.getItem(STORAGE_KEY_SIZE) || 2.5;
        const width = localStorage.getItem(STORAGE_KEY_WIDTH) || 1.0;

        clock.style.fontSize = size + 'em';
        clock.style.transform = `scaleX(${width})`;
        clock.style.transformOrigin = 'right center'; // Чтобы не "уезжали" за экран
    }

    function createClock() {
        const oldClock = document.querySelector('.head__time');
        if (!oldClock || document.querySelector('#custom-clock')) return;

        const clock = document.createElement('div');
        clock.id = 'custom-clock';
        // Стили контейнера
        Object.assign(clock.style, {
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'Segoe UI, Roboto, sans-serif',
            fontWeight: '800',
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: '10'
        });

        const timeDisplay = document.createElement('div');
        clock.appendChild(timeDisplay);
        
        // Заменяем старые часы на новые
        oldClock.parentNode.replaceChild(clock, oldClock);

        function updateClock() {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            timeDisplay.innerHTML = `
                <span style="color:#ffffff; text-shadow: 2px 2px 4px rgba(0,0,0,0.6);">${h}</span>
                <span style="color:#ff9100; text-shadow: 2px 2px 4px rgba(0,0,0,0.6);">:${m}</span>
            `;
        }

        updateClock();
        setInterval(updateClock, 10000); // Раз в 10 сек достаточно
        applyStyles();
    }

    // Запуск через штатный слушатель Lampa
    if (window.Lampa) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                init();
            }
        });
    }
})();
