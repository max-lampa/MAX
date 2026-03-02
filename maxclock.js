(function() {
    'use strict';

    // == Lampac Clock Style Plugin (расширенная версия) ==
    // Замена стандартного годинника Lampa на кастомный стиль с возможностью изменения размера и объёмным эффектом.

    const STORAGE_KEY = 'lampac_clock_font_size';

    function createClock() {
        const oldClock = document.querySelector('.head__time');
        if (!oldClock) {
            console.warn('[ClockPlugin] .head__time не найден');
            return;
        }

        // Если плагин уже активирован — не дублируем
        if (document.querySelector('#custom-clock')) return;

        // --- Основной контейнер часов ---
        const clock = document.createElement('div');
        clock.id = 'custom-clock';
        clock.style.display = 'flex';
        clock.style.alignItems = 'center';
        clock.style.fontFamily = 'Segoe UI, Roboto, sans-serif';
        clock.style.fontWeight = '800';               // утолщённый шрифт
        clock.style.whiteSpace = 'nowrap';
        clock.style.cursor = 'pointer';               // указываем, что часы можно нажать

        // Загружаем сохранённый размер или используем базовый 2.5em
        const savedSize = localStorage.getItem(STORAGE_KEY);
        const baseSize = savedSize ? parseFloat(savedSize) : 2.5;
        clock.style.fontSize = baseSize + 'em';

        // Элемент для отображения времени
        const timeDisplay = document.createElement('div');
        timeDisplay.style.display = 'flex';
        timeDisplay.style.alignItems = 'baseline';
        clock.appendChild(timeDisplay);

        // --- Контейнер для слайдера (скрыт по умолчанию) ---
        const sliderContainer = document.createElement('div');
        sliderContainer.id = 'custom-clock-slider';
        sliderContainer.style.position = 'absolute';
        sliderContainer.style.bottom = '-40px';        // появится под часами
        sliderContainer.style.left = '0';
        sliderContainer.style.backgroundColor = 'rgba(30, 30, 30, 0.9)';
        sliderContainer.style.padding = '5px 10px';
        sliderContainer.style.borderRadius = '8px';
        sliderContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
        sliderContainer.style.zIndex = '1000';
        sliderContainer.style.display = 'none';        // изначально скрыт

        const sliderLabel = document.createElement('span');
        sliderLabel.textContent = 'Размер: ';
        sliderLabel.style.color = '#fff';
        sliderLabel.style.marginRight = '8px';
        sliderLabel.style.fontSize = '14px';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '1.2';
        slider.max = '5.0';
        slider.step = '0.1';
        slider.value = baseSize;
        slider.style.width = '150px';
        slider.style.verticalAlign = 'middle';

        const valueDisplay = document.createElement('span');
        valueDisplay.style.color = '#ff9100';
        valueDisplay.style.marginLeft = '8px';
        valueDisplay.style.fontSize = '14px';
        valueDisplay.textContent = slider.value + 'em';

        sliderContainer.appendChild(sliderLabel);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);

        // Добавляем слайдер в clock (абсолютное позиционирование относительно clock)
        clock.style.position = 'relative'; // чтобы слайдер позиционировался относительно часов
        clock.appendChild(sliderContainer);

        // --- Вставляем часы вместо старого элемента ---
        oldClock.parentNode.replaceChild(clock, oldClock);

        // --- Функция обновления времени ---
        function updateClock() {
            const now = new Date();
            let h = now.getHours().toString().padStart(2, '0');
            let m = now.getMinutes().toString().padStart(2, '0');

            // Добавляем text-shadow для объёмности
            timeDisplay.innerHTML = `
                <span style="color:#ffffff; font-size:1em; text-shadow: 2px 2px 4px rgba(0,0,0,0.6);">${h}</span>
                <span style="color:#ff9100; font-size:1em; text-shadow: 2px 2px 4px rgba(0,0,0,0.6);">:${m}</span>
            `;
        }

        updateClock();
        setInterval(updateClock, 1000);

        // --- Обработчики для изменения размера ---

        // Переменные для определения долгого нажатия
        let pressTimer = null;
        const longPressDelay = 600; // мс

        function startPress(e) {
            e.preventDefault(); // предотвращаем выделение текста
            if (pressTimer) clearTimeout(pressTimer);
            pressTimer = setTimeout(() => {
                // Показываем слайдер
                sliderContainer.style.display = 'flex';
                // Фокус не на слайдер, чтобы не открывать клавиатуру на мобильных
            }, longPressDelay);
        }

        function cancelPress() {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        }

        // Поддержка мыши и касаний
        clock.addEventListener('mousedown', startPress);
        clock.addEventListener('mouseup', cancelPress);
        clock.addEventListener('mouseleave', cancelPress);
        clock.addEventListener('touchstart', startPress, { passive: false });
        clock.addEventListener('touchend', cancelPress);
        clock.addEventListener('touchcancel', cancelPress);
        clock.addEventListener('touchmove', cancelPress);

        // Обработка изменения слайдера
        slider.addEventListener('input', function() {
            const val = parseFloat(slider.value);
            clock.style.fontSize = val + 'em';
            valueDisplay.textContent = val + 'em';
            localStorage.setItem(STORAGE_KEY, val);
        });

        // Закрытие слайдера при клике вне его (простой вариант: по клику на часы, если слайдер открыт, закрываем)
        clock.addEventListener('click', function(e) {
            // Если клик был по слайдеру или его дочерним элементам — не закрываем
            if (sliderContainer.contains(e.target)) return;
            // Иначе скрываем слайдер
            sliderContainer.style.display = 'none';
            cancelPress();
        });

        // Предотвращаем всплытие кликов со слайдера, чтобы не закрывать его сразу
        sliderContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Запуск после загрузки Lampa
    if (window.Lampa && window.Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                setTimeout(createClock, 1000);
            }
        });
    } else {
        // Fallback для старых версий
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(createClock, 3000);
        });
    }
})();