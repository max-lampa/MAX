(function () {
    'use strict';

    /**
     * Плагин для Lampa: Рейтинг и Год под постером
     * 
     * Особенности:
     * - Добавляет рейтинг и год отдельной строкой под постером
     * - Скрывает стандартное отображение года и рейтинга
     * - Сохраняет структуру: Постер -> Рейтинг/Год -> Название
     */

    function init() {
        // Добавляем стили для скрытия стандартных элементов и оформления новых
        var style = `
            /* Скрываем все возможные стандартные элементы года и рейтинга */
            .card__year, 
            .card__age,
            .card__vote, 
            .card__rating,
            .card__info,
            .card__type,
            .card__view .card__vote,
            .card__view .card__rating,
            .card__view .card__year,
            .card__view .card__age,
            .card__view .card__quality,
            .card__view .card__type,
            .card__view > div:not(.card__rating-year-info) {
                /* Будем осторожны с последним селектором, лучше перечислим явно */
            }

            /* Уточненный список для скрытия всех дефолтных элементов */
            [class*="card__year"],
            [class*="card__vote"],
            [class*="card__rating"]:not(.card__rating-year-info),
            [class*="card__age"],
            [class*="card__info"],
            [class*="card__type"],
            [class*="card__quality"],
            .card__view > div, 
            .card__view > span {
                /* Скрываем всё лишнее внутри постера и карточки, кроме нашего блока */
                display: none !important;
            }

            /* Исключаем наш блок из скрытия, если он вдруг попал под маску */
            .card__rating-year-info,
            .card__rating-year-info * {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* Контейнер для нашего рейтинга и года */
            .card__rating-year-info {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                align-items: center;
                gap: 10px; /* Возвращаем отступ как было */
                margin: 4px 0 2px 0;
                font-size: 1.1em;
                font-weight: 500;
                line-height: 1;
                position: relative;
                z-index: 10;
            }

            /* Оформление значения рейтинга */
            .card__rating-year-info .rating-val {
                color: #2e9fff; /* Синий цвет как на картинке */
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            /* Иконка звезды */
            .card__rating-year-info .rating-star {
                width: 16px;
                height: 16px;
                fill: #2e9fff;
            }

            /* Оформление значения года */
            .card__rating-year-info .year-val {
                color: #aaa; /* Сероватый цвет */
                opacity: 0.8;
                margin-left: 0; /* Сбрасываем принудительное выравнивание вправо */
            }

            /* Корректировка отступа названия */
            .card__title {
                margin-top: 0 !important;
                padding-top: 0 !important;
                line-height: 1.2;
            }
        `;

        if (!document.getElementById('rating-year-styles')) {
            var styleEl = document.createElement('style');
            styleEl.id = 'rating-year-styles';
            styleEl.innerHTML = style;
            document.head.appendChild(styleEl);
        }

        /**
         * Функция обработки карточки
         * @param {HTMLElement} cardEl 
         */
        function processCard(cardEl) {
            if (!cardEl || cardEl.getAttribute('data-rating-year-processed')) return;

            // Удаляем стандартные элементы из DOM для надежности
            var toRemove = cardEl.querySelectorAll('.card__year, .card__age, .card__vote, .card__rating, .card__info, .card__type');
            for (var i = 0; i < toRemove.length; i++) {
                toRemove[i].remove();
            }

            // Также проверяем внутри .card__view (там часто лежат бейджи)
            var viewEl = cardEl.querySelector('.card__view');
            if (viewEl) {
                var badgesToRemove = viewEl.querySelectorAll('.card__vote, .card__rating, .card__year, .card__age, .card__type, .card__quality');
                for (var j = 0; j < badgesToRemove.length; j++) {
                    badgesToRemove[j].remove();
                }
            }

            // Получаем данные карточки
            var data = cardEl.card_data || {};
            
            // Если данных еще нет, пробуем подождать (как в click_theme)
            if (!cardEl.card_data && !cardEl.getAttribute('data-wait-data')) {
                cardEl.setAttribute('data-wait-data', 'true');
                setTimeout(function() { processCard(cardEl); }, 200);
                return;
            }

            var rating = data.vote_average || data.rating || data.rate || 0;
            var year = '';

            // Извлекаем год из различных полей данных
            if (data.release_date) year = data.release_date.split('-')[0];
            else if (data.first_air_date) year = data.first_air_date.split('-')[0];
            else if (data.year) year = data.year;
            else if (data.date) {
                var match = String(data.date).match(/\d{4}/);
                if (match) year = match[0];
            }

            // Фоллбэк: если в данных пусто, пробуем вытащить из DOM (пока не скрыли стилями)
            if (!rating) {
                var voteEl = cardEl.querySelector('.card__vote, .card__rating');
                if (voteEl) {
                    var voteText = voteEl.textContent.replace(',', '.');
                    rating = parseFloat(voteText) || 0;
                }
            }
            if (!year) {
                var yearEl = cardEl.querySelector('.card__year');
                if (yearEl) {
                    var yearMatch = yearEl.textContent.match(/\d{4}/);
                    if (yearMatch) year = yearMatch[0];
                }
            }

            // Если есть хотя бы что-то, добавляем наш блок
            if (rating || year) {
                var infoBlock = document.createElement('div');
                infoBlock.className = 'card__rating-year-info';
                
                var html = '';
                if (rating > 0) {
                    html += '<span class="rating-val">';
                    html += '<svg class="rating-star" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
                    html += parseFloat(rating).toFixed(1);
                    html += '</span>';
                }
                if (year) {
                    html += '<span class="year-val">' + year + '</span>';
                }
                
                infoBlock.innerHTML = html;

                // Находим .card__view (постер) и .card__title
                var viewEl = cardEl.querySelector('.card__view');
                var titleEl = cardEl.querySelector('.card__title');

                if (titleEl && titleEl.parentNode) {
                    // Вставляем строго перед названием (после постера)
                    titleEl.parentNode.insertBefore(infoBlock, titleEl);
                } else if (viewEl) {
                    // Если названия нет, просто после постера
                    viewEl.after(infoBlock);
                }

                cardEl.setAttribute('data-rating-year-processed', 'true');
            }
        }

        // MutationObserver для отслеживания появления новых карточек
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) { // Element
                            if (node.classList.contains('card')) {
                                processCard(node);
                            } else {
                                var cards = node.querySelectorAll('.card');
                                for (var j = 0; j < cards.length; j++) {
                                    processCard(cards[j]);
                                }
                            }
                        }
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Обрабатываем уже существующие карточки
        var existingCards = document.querySelectorAll('.card');
        for (var k = 0; k < existingCards.length; k++) {
            processCard(existingCards[k]);
        }

        // Периодическая очистка (на случай если Lampa добавляет элементы позже)
        setInterval(function() {
            var allCards = document.querySelectorAll('.card');
            for (var i = 0; i < allCards.length; i++) {
                var card = allCards[i];
                // Очищаем стандартные элементы даже если карточка "обработана"
                var toRemove = card.querySelectorAll('.card__year, .card__age, .card__vote, .card__rating, .card__info, .card__type');
                for (var j = 0; j < toRemove.length; j++) {
                    toRemove[j].remove();
                }
                var view = card.querySelector('.card__view');
                if (view) {
                    var badges = view.querySelectorAll('.card__vote, .card__rating, .card__year, .card__age, .card__type, .card__quality');
                    for (var l = 0; l < badges.length; l++) {
                        badges[l].remove();
                    }
                }
                // Если карточка еще не была полностью обработана нашим плагином
                if (!card.getAttribute('data-rating-year-processed')) {
                    processCard(card);
                }
            }
        }, 1000);
    }

    // Запуск при готовности Lampa
    function startPlugin() {
        if (window.Lampa && window.Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    init();
                }
            });
        } else {
            // Фолбэк если Listener не доступен
            init();
        }
    }

    if (window.Lampa) {
        startPlugin();
    } else {
        document.addEventListener('lampa_ready', startPlugin);
    }
})();
