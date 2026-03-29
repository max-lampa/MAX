(function() {
    'use strict';

    // == Lampac Clock Style Plugin ==
    // Замена стандартных часов Lampa на кастомный стиль

    // ============================================================
    //  НАСТРОЙКИ — меняй здесь что хочешь
    // ============================================================
    var CONFIG = {
        fontSize:       '2.5em',   // размер шрифта часов (например: '2em', '3em', '48px')
        colorHours:     '#ffffff', // цвет часов (HH)
        colorColon:     '#ff9100', // цвет двоеточия и минут (:MM)
        fontFamily:     'Segoe UI, Roboto, sans-serif',
        fontWeight:     '600',
    };
    // ============================================================

    function createClock() {
        var oldClock = document.querySelector('.head__time');
        if (!oldClock) {
            console.warn('[ClockPlugin] .head__time не найдено');
            return;
        }

        if (document.querySelector('#custom-clock')) return;

        var clock = document.createElement('div');
        clock.id = 'custom-clock';
        clock.style.display      = 'flex';
        clock.style.alignItems   = 'center';
        clock.style.fontFamily   = CONFIG.fontFamily;
        clock.style.fontWeight   = CONFIG.fontWeight;
        clock.style.fontSize     = CONFIG.fontSize;
        clock.style.whiteSpace   = 'nowrap';

        var timeDisplay = document.createElement('div');
        timeDisplay.style.display     = 'flex';
        timeDisplay.style.alignItems  = 'baseline';

        clock.appendChild(timeDisplay);

        oldClock.parentNode.replaceChild(clock, oldClock);

        function updateClock() {
            var now = new Date();
            var h = now.getHours().toString().padStart(2, '0');
            var m = now.getMinutes().toString().padStart(2, '0');
            timeDisplay.innerHTML =
                '<span style="color:' + CONFIG.colorHours + '; font-size:1em;">' + h + '</span>' +
                '<span style="color:' + CONFIG.colorColon + '; font-size:1em;">:' + m + '</span>';
        }

        updateClock();
        setInterval(updateClock, 1000);
    }

    if (window.Lampa && window.Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                setTimeout(createClock, 1000);
            }
        });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(createClock, 3000);
        });
    }
})();