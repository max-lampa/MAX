(function () {
    'use strict';

    var css = `
        .card .card__view {
            border-radius: 16px !important;
            position: relative;
            overflow: hidden !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .card .card__view::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 65%;
            background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%);
            z-index: 1;
            pointer-events: none;
        }

        .card.card--type-movie .card__view::before,
        .card.card--type-tv .card__view::before {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(15, 15, 15, 0.7);
            -webkit-backdrop-filter: blur(8px);
            backdrop-filter: blur(8px);
            color: #fff;
            padding: 5px 12px;
            border-radius: 14px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            z-index: 10;
        }

        .card.card--type-movie .card__view::before { content: 'ФИЛЬМ'; }
        .card.card--type-tv .card__view::before { content: 'СЕРИАЛ'; }

        .card .card__info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 12px;
            z-index: 5;
            background: transparent !important;
            text-align: left;
            pointer-events: none;
        }

        .card .card__title {
            color: #fff !important;
            font-size: 15px !important;
            font-weight: 700 !important;
            line-height: 1.2;
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-shadow: 0 1px 4px rgba(0,0,0,0.9);
            margin-bottom: 4px;
            padding: 0;
        }

        .card .card__age, .card .card__subtitle {
            color: rgba(255, 255, 255, 0.7) !important;
            font-size: 12px !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin: 0;
            font-weight: normal;
        }
    `;

    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    document.head.appendChild(style);

    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            setInterval(function() {
                var cards = document.querySelectorAll('.card:not(.custom-styled)');
                cards.forEach(function(card) {
                    card.classList.add('custom-styled');
                    var ageEl = card.querySelector('.card__age') || card.querySelector('.card__subtitle');
                    if (ageEl && ageEl.innerText) {
                        var text = ageEl.innerText.trim();
                        if (!text.startsWith('·') && text.length > 0) {
                            ageEl.innerText = '· ' + text;
                        }
                    }
                });
            }, 1000);
        }
    });

})();