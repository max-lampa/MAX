(function () {
    'use strict';

    function NoSloganPlugin() {
        // Добавляем стили в HEAD для мгновенного скрытия элементов без ожидания JS
        this.injectStyles = function() {
            if (document.getElementById('no-slogan-styles')) return;

            var style = document.createElement('style');
            style.id = 'no-slogan-styles';
            style.innerHTML = `
                /* Радикальное скрытие слогана по известным классам */
                .full-start__tagline, 
                [class*="tagline"],
                .full-start__description + div:not([class]) {
                    display: none !important;
                    height: 0px !important;
                    min-height: 0px !important;
                    margin: 0px !important;
                    padding: 0px !important;
                    font-size: 0px !important;
                    line-height: 0 !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    position: absolute !important;
                    z-index: -1;
                }

                /* Корректировка отступов, чтобы убрать пустые зоны */
                .full-start__title {
                    margin-bottom: 5px !important;
                }
                .full-start__details {
                    margin-top: 0px !important;
                    margin-bottom: 10px !important;
                }
            `;
            document.head.appendChild(style);
        };

        // Функция "чистки" DOM при переключении контента
        this.cleaner = function() {
            var full = document.querySelector('.full-start');
            if (full) {
                // Ищем текстовые узлы, которые могут быть слоганами без явных классов
                var nodes = full.querySelectorAll('div, span, p');
                nodes.forEach(function(node) {
                    // Если текст короткий и находится между деталями и описанием — скорее всего, это слоган
                    if (node.innerText && node.innerText.length > 3 && node.innerText.length < 150) {
                        var prev = node.previousElementSibling;
                        if (prev && prev.classList.contains('full-start__details')) {
                             node.style.display = 'none';
                             node.setAttribute('data-slogan-hidden', 'true');
                        }
                    }
                });
            }
        };

        // Инициализация плагина
        this.init = function() {
            var self = this;
            this.injectStyles();
            
            // Следим за открытием карточки через системные события Lampa
            if (window.Lampa && Lampa.Listener) {
                Lampa.Listener.follow('full', function (e) {
                    if (e.type === 'complite' || e.type === 'ready') {
                        // Выполняем чистку с микро-задержками для надежности отрисовки
                        self.cleaner();
                        setTimeout(function() { self.cleaner(); }, 50);
                        setTimeout(function() { self.cleaner(); }, 200);
                    }
                });
            }

            // Дополнительный надзор через MutationObserver (важно для Android TV)
            var observer = new MutationObserver(function() {
                self.cleaner();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        };
    }

    // Регистрация плагина в зависимости от состояния приложения
    if (window.appready) {
        new NoSloganPlugin().init();
    } else {
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    new NoSloganPlugin().init();
                }
            });
        }
    }
})();
