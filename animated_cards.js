// Вдохновлено veoveo.ru

(function () {
    'use strict';

    if (window.animated_cards_plugin) {
        return;
    }
    window.animated_cards_plugin = true;
  
    var style = document.createElement('style');
    style.innerHTML = `
        /* Наклон и анимация для всех типов карточек и главного постера */
        .card, 
        .card-episode,
        .full-start-new__poster {
            will-change: transform;
            position: relative;
            transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), z-index 0.2s;
            transform-style: preserve-3d;
        }
        
        /* Точка отсчета для блика */
        .card__view, 
        .full-episode__img,
        .full-start-new__poster {
            position: relative;
        }
        
        /* Блик */
        .card__view::after, 
        .full-episode__img::after,
        .full-start-new__poster::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            border-radius: inherit; 
            background: radial-gradient(
                circle at var(--gx, 50%) var(--gy, 50%),
                rgba(255, 255, 255, 0.45) 0%,
                rgba(255, 255, 255, 0) 60%
            );
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 999;
            mix-blend-mode: overlay;
        }

        /* Показать блик при наведении мыши */
        .card:hover .card__view::after,
        .card.focus .card__view::after,
        .card-episode:hover .full-episode__img::after,
        .card-episode.focus .full-episode__img::after,
        .full-start-new__poster:hover::after,
        .full-start-new__poster.focus::after {
            opacity: 1;
        }
        
        /* 3D-наклон */
        .card:hover,
        .card.focus,
        .card-episode:hover,
        .card-episode.focus,
        .full-start-new__poster:hover,
        .full-start-new__poster.focus {
            transform: scale(1.05) perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
            z-index: 100;
        }
    `;
    document.head.appendChild(style);

    document.body.addEventListener('mousemove', function (e) {
        var card = e.target.closest('.card, .card-episode, .full-start-new__poster');
        if (!card) return;

        var rect = card.getBoundingClientRect();
        
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        card.style.setProperty('--gx', x + 'px');
        card.style.setProperty('--gy', y + 'px');

        var xPct = (x / rect.width) * 2 - 1;
        var yPct = (y / rect.height) * 2 - 1;
        
        card.style.setProperty('--rx', (yPct * -8) + 'deg'); 
        card.style.setProperty('--ry', (xPct * 8) + 'deg');
    });

    document.body.addEventListener('mouseleave', function (e) {
        var card = e.target.closest('.card, .card-episode, .full-start-new__poster');
        if (!card) return;
        
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
    }, true);
})();
