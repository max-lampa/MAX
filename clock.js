(function() {  
    'use strict';  
  
    // == Lampac Clock Style Plugin ==  
    // Заміна стандартного годинника Lampa на кастомний стиль  
  
    function createClock() {  
        // Знаходимо стандартний годинник  
        let oldClock = document.querySelector('.head__time');  
        if (!oldClock) {  
            console.warn('[ClockPlugin] .head__time не знайдено');  
            return;  
        }  
  
        // Якщо вже є наш годинник — не додаємо вдруге  
        if (document.querySelector('#custom-clock')) return;  
  
        // Створюємо контейнер для годинника  
        const clock = document.createElement('div');  
        clock.id = 'custom-clock';  
        clock.style.display = 'flex';  
        clock.style.alignItems = 'center';  
        clock.style.fontFamily = 'Segoe UI, Roboto, sans-serif';  
        clock.style.fontWeight = '600';  
        clock.style.fontSize = '2.5em';  
        clock.style.whiteSpace = 'nowrap';  
  
        // Створюємо елемент для часу  
        const timeDisplay = document.createElement('div');  
        timeDisplay.style.display = 'flex';  
        timeDisplay.style.alignItems = 'baseline';  
  
        // Додаємо тільки час до контейнера (без індикаторів)  
        clock.appendChild(timeDisplay);  
  
        // Вставляємо годинник замість стандартного  
        oldClock.parentNode.replaceChild(clock, oldClock);  
  
        // Оновлення часу  
        function updateClock() {  
            const now = new Date();  
            let h = now.getHours().toString().padStart(2, '0');  
            let m = now.getMinutes().toString().padStart(2, '0');  
            timeDisplay.innerHTML = `  
                <span style="color:#ffffff; font-size:1em;">${h}</span>  
                <span style="color:#ff9100; font-size:1em;">:${m}</span>  
            `;  
        }  
  
        updateClock();  
        setInterval(updateClock, 1000);  
    }  
  
    // Запуск після завантаження Lampa  
    if (window.Lampa && window.Lampa.Listener) {  
        Lampa.Listener.follow('app', function(e) {  
            if (e.type === 'ready') {  
                setTimeout(createClock, 1000);  
            }  
        });  
    } else {  
        // Fallback для старих версій  
        document.addEventListener('DOMContentLoaded', function() {  
            setTimeout(createClock, 3000);  
        });  
    }  
})();
