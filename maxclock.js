(function() {
    'use strict';

    // Ключи настроек
    const KEY_SIZE = 'clock_bubble_size';
    const KEY_WIDTH = 'clock_bubble_width';
    const KEY_RADIUS = 'clock_bubble_radius';

    // Функция обновления стилей
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

    // Создание самих часов
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

    // Регистрация настроек
    function setupSettings() {
        // Создаем НОВЫЙ раздел в Настройках
        Lampa.SettingsApi.addComponent({
            component: 'clock_bubble',
            name: 'Часы Bubble'
        });

        // Добавляем параметры в этот раздел
        Lampa.SettingsApi.addParam({
            component: 'clock_bubble',
            param: { name: KEY_SIZE, type: 'range', default: 1.5, min: 0.5, max: 5, step: 0.1 },
            field: { name: 'Размер (высота)', description: 'Размер текста и бабблов' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'clock_bubble',
            param: { name: KEY_WIDTH, type: 'range', default: 1.0, min: 0.5, max: 3, step: 0.1 },
            field: { name: 'Ширина (растяжение)', description: 'Растягивание по горизонтали' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'clock_bubble',
            param: { name: KEY_RADIUS, type: 'range', default: 20, min: 0, max: 100, step: 2 },
            field: { name: 'Скругление (Bubble)', description: 'На 100 будут идеально круглые' },
            onChange: applyStyles
        });
    }

    // Главная инициализация
    function startPlugin() {
        setupSettings();
        // Даем интерфейсу время прогрузиться перед заменой часов
        setTimeout(createClock, 2000);
    }

    // Ждем готовности Lampa
    if (window.Lampa) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    } else {
        // Если Lampa еще не загружена (обычный браузер)
        document.addEventListener('DOMContentLoaded', startPlugin);
    }
})();
