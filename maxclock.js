(function() {
    'use strict';

    // == Lampac Clock Style Plugin (настройки в меню Lampa) ==

    const STORAGE_KEY_SIZE = 'lampac_clock_font_size';
    const STORAGE_KEY_WIDTH = 'lampac_clock_width';

    // Применить сохранённые размеры к часам
    function applyClockSize() {
        const clock = document.querySelector('#custom-clock');
        if (!clock) return;

        const size = localStorage.getItem(STORAGE_KEY_SIZE);
        if (size) clock.style.fontSize = parseFloat(size) + 'em';

        const width = localStorage.getItem(STORAGE_KEY_WIDTH);
        if (width) {
            clock.style.transform = `scaleX(${parseFloat(width)})`;
            clock.style.transformOrigin = 'left center';
        } else {
            clock.style.transform = ''; // сброс
        }
    }

    // Создание кастомных часов (без встроенного слайдера)
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

        // Загружаем начальные значения
        const savedSize = localStorage.getItem(STORAGE_KEY_SIZE);
        clock.style.fontSize = (savedSize ? parseFloat(savedSize) : 2.5) + 'em';

        const savedWidth = localStorage.getItem(STORAGE_KEY_WIDTH);
        if (savedWidth) {
            clock.style.transform = `scaleX(${parseFloat(savedWidth)})`;
            clock.style.transformOrigin = 'left center';
        }

        const timeDisplay = document.createElement('div');
        timeDisplay.style.display = 'flex';
        timeDisplay.style.alignItems = 'baseline';
        clock.appendChild(timeDisplay);

        oldClock.parentNode.replaceChild(clock, oldClock);

        // Обновление времени каждую секунду
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

    // Добавление пунктов настроек в меню Lampa
    function addSettings() {
        if (!window.Lampa || !Lampa.Settings) return;

        // Проверяем, не добавляли ли уже (чтобы не дублировать)
        if (Lampa.Settings.storage && Lampa.Settings.storage['lampac_clock']) return;

        // Заголовок раздела
        Lampa.Settings.add({
            component: 'title',
            title: 'Настройки часов'
        });

        // Ползунок размера (высота)
        Lampa.Settings.add({
            component: 'slider',
            title: 'Размер (высота)',
            desc: 'Изменение высоты цифр',
            min: 1.2,
            max: 5.0,
            step: 0.1,
            value: parseFloat(localStorage.getItem(STORAGE_KEY_SIZE)) || 2.5,
            onChange: function(value) {
                localStorage.setItem(STORAGE_KEY_SIZE, value);
                applyClockSize();
            }
        });

        // Ползунок ширины (горизонтальное растяжение)
        Lampa.Settings.add({
            component: 'slider',
            title: 'Ширина (масштаб)',
            desc: 'Растяжение цифр по горизонтали',
            min: 0.5,
            max: 2.0,
            step: 0.05,
            value: parseFloat(localStorage.getItem(STORAGE_KEY_WIDTH)) || 1.0,
            onChange: function(value) {
                localStorage.setItem(STORAGE_KEY_WIDTH, value);
                applyClockSize();
            }
        });

        // Помечаем, что настройки добавлены
        if (!Lampa.Settings.storage) Lampa.Settings.storage = {};
        Lampa.Settings.storage['lampac_clock'] = true;
    }

    // Инициализация плагина
    function initPlugin() {
        createClock();
        addSettings();
    }

    // Запуск после полной загрузки Lampa
    if (window.Lampa && window.Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                setTimeout(initPlugin, 1000);
            }
        });
    } else {
        // Fallback для старых версий
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initPlugin, 3000);
        });
    }
})();