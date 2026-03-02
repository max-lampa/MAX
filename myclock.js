(function() {
    'use strict';

    // == Lampac Clock Style Plugin (управление размером через меню) ==

    const STORAGE_KEY_SIZE = 'lampac_clock_font_size';
    const STORAGE_KEY_WIDTH = 'lampac_clock_width';

    let clockElement = null;

    // Применить сохранённые размеры
    function applyClockSize() {
        if (!clockElement) return;

        const size = localStorage.getItem(STORAGE_KEY_SIZE);
        if (size) {
            clockElement.style.fontSize = parseFloat(size) + 'em';
        }

        const width = localStorage.getItem(STORAGE_KEY_WIDTH);
        if (width) {
            clockElement.style.transform = `scaleX(${parseFloat(width)})`;
            clockElement.style.transformOrigin = 'left center';
        } else {
            clockElement.style.transform = '';
        }
    }

    // Создать часы
    function createClock() {
        const oldClock = document.querySelector('.head__time');
        if (!oldClock) {
            console.warn('[ClockPlugin] .head__time не найден');
            return;
        }
        if (document.querySelector('#custom-clock')) return;

        const clock = document.createElement('div');
        clock.id = 'custom-clock';
        clock.style.display = 'flex';
        clock.style.alignItems = 'center';
        clock.style.fontFamily = 'Segoe UI, Roboto, sans-serif';
        clock.style.fontWeight = '800';
        clock.style.whiteSpace = 'nowrap';
        clock.style.position = 'relative';

        clockElement = clock;
        applyClockSize();

        const timeDisplay = document.createElement('div');
        timeDisplay.style.display = 'flex';
        timeDisplay.style.alignItems = 'baseline';
        clock.appendChild(timeDisplay);

        oldClock.parentNode.replaceChild(clock, oldClock);

        function updateClock() {
            const now = new Date();
            let h = now.getHours().toString().padStart(2, '0');
            let m = now.getMinutes().toString().padStart(2, '0');
            timeDisplay.innerHTML = `
                <span style="color:#ffffff; font-size:1em; text-shadow: 2px 2px 4px rgba(0,0,0,0.6);">${h}</span>
                <span style="color:#ff9100; font-size:1em; text-shadow: 2px 2px 4px rgba(0,0,0,0.6);">:${m}</span>
            `;
        }
        updateClock();
        setInterval(updateClock, 1000);
    }

    // Добавить пункт в главное меню
    function addMenuItem() {
        if (!window.Lampa || !Lampa.Menu) return;

        // Проверяем, не добавлен ли уже пункт
        if (Lampa.Menu.get('lampac_clock')) return;

        Lampa.Menu.add({
            id: 'lampac_clock',
            title: 'Настройки часов',
            icon: 'clock', // можно использовать существующую иконку
            component: 'modal', // пункт открывает модальное окно
            handler: function() {
                // Создаём модальное окно с ползунками
                const modal = Lampa.Modal.open({
                    title: 'Настройки часов',
                    content: createSettingsContent(),
                    width: 400
                });
            }
        });
    }

    // Создать HTML-содержимое для модального окна
    function createSettingsContent() {
        const container = document.createElement('div');
        container.style.padding = '15px';

        // Размер (высота)
        const sizeLabel = document.createElement('div');
        sizeLabel.style.color = '#fff';
        sizeLabel.style.marginBottom = '5px';
        sizeLabel.textContent = 'Размер (высота):';
        container.appendChild(sizeLabel);

        const sizeSlider = document.createElement('input');
        sizeSlider.type = 'range';
        sizeSlider.min = '1.2';
        sizeSlider.max = '5.0';
        sizeSlider.step = '0.1';
        sizeSlider.value = parseFloat(localStorage.getItem(STORAGE_KEY_SIZE)) || 2.5;
        sizeSlider.style.width = '100%';
        sizeSlider.style.marginBottom = '15px';
        container.appendChild(sizeSlider);

        // Отображение текущего значения
        const sizeValue = document.createElement('span');
        sizeValue.style.color = '#ff9100';
        sizeValue.style.marginLeft = '10px';
        sizeValue.textContent = sizeSlider.value + 'em';
        sizeSlider.addEventListener('input', function() {
            sizeValue.textContent = this.value + 'em';
            localStorage.setItem(STORAGE_KEY_SIZE, this.value);
            applyClockSize();
        });
        container.appendChild(sizeValue);

        // Ширина (масштаб)
        const widthLabel = document.createElement('div');
        widthLabel.style.color = '#fff';
        widthLabel.style.marginTop = '15px';
        widthLabel.style.marginBottom = '5px';
        widthLabel.textContent = 'Ширина (масштаб):';
        container.appendChild(widthLabel);

        const widthSlider = document.createElement('input');
        widthSlider.type = 'range';
        widthSlider.min = '0.5';
        widthSlider.max = '2.0';
        widthSlider.step = '0.05';
        widthSlider.value = parseFloat(localStorage.getItem(STORAGE_KEY_WIDTH)) || 1.0;
        widthSlider.style.width = '100%';
        widthSlider.style.marginBottom = '15px';
        container.appendChild(widthSlider);

        const widthValue = document.createElement('span');
        widthValue.style.color = '#ff9100';
        widthValue.style.marginLeft = '10px';
        widthValue.textContent = widthSlider.value + 'x';
        widthSlider.addEventListener('input', function() {
            widthValue.textContent = this.value + 'x';
            localStorage.setItem(STORAGE_KEY_WIDTH, this.value);
            applyClockSize();
        });
        container.appendChild(widthValue);

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Закрыть';
        closeBtn.style.marginTop = '20px';
        closeBtn.style.padding = '8px 16px';
        closeBtn.style.background = '#ff9100';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '4px';
        closeBtn.style.color = '#000';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = function() {
            Lampa.Modal.close();
        };
        container.appendChild(closeBtn);

        return container;
    }

    // Инициализация
    function init() {
        createClock();
        addMenuItem();
    }

    // Запуск после готовности Lampa
    if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                setTimeout(init, 1000);
            }
        });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 3000);
        });
    }
})();