(function() {
    'use strict';

    Lampa.Platform.tv();

    function log(msg, type) {
        type = type || 'log';
        if (typeof Lampa !== 'undefined' && Lampa.Console && Lampa.Console.log) {
            Lampa.Console.log('[Рейтинг LAMPA] ' + msg);
        } else {
            console[type]('[Рейтинг LAMPA] ' + msg);
        }
    }

    function showRating(container, rating) {
        // Пытаемся найти уже существующий блок рейтинга
        var ratingBlock = container.find('.full-start__rate.rate--lampa');
        if (ratingBlock.length === 0) {
            // Создаём новый
            ratingBlock = $('<div class="full-start__rate rate--lampa" style="display:inline-block; margin-left:10px;"></div>');
            var valueSpan = $('<span class="rating-value" style="font-weight:bold; color:#ff9800;"></span>');
            var label = $('<span class="source--name" style="margin-left:5px;">LAMPA</span>');
            ratingBlock.append(valueSpan).append(label);
            // Вставляем после элемента с информацией о качестве или в начало контейнера
            var firstDiv = container.find('div:first');
            if (firstDiv.length) firstDiv.after(ratingBlock);
            else container.prepend(ratingBlock);
        }
        ratingBlock.find('.rating-value, .rate--kp').text(rating);
        log('Рейтинг установлен: ' + rating);
    }

    function fetchRating(methodId, callback) {
        var apis = [
            'http://cub.red/api/reactions/get/',
            'http://cub.rip/api/reactions/get/',
            'http://cub.bylampa.online/api/reactions/get/'
        ];
        var current = 0;

        function tryNext() {
            if (current >= apis.length) {
                log('Все API не ответили', 'warn');
                if (callback) callback(null);
                return;
            }
            var url = apis[current] + methodId;
            log('Запрос к ' + url);
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = 3000;
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        var reactions = data.result || [];
                        var positive = 0, negative = 0;
                        reactions.forEach(function(r) {
                            var count = parseInt(r.counter, 10) || 0;
                            if (r.type === 'fire' || r.type === 'nice') positive += count;
                            if (r.type === 'shit' || r.type === 'bore' || r.type === 'think') negative += count;
                        });
                        var total = positive + negative;
                        var rating = total > 0 ? (positive / total) * 10 : 0;
                        rating = rating.toFixed(1);
                        log('Получен рейтинг: ' + rating);
                        if (callback) callback(rating);
                    } catch (e) {
                        log('Ошибка парсинга: ' + e.message, 'error');
                        tryNext();
                    }
                } else {
                    log('Статус ' + xhr.status + ', пробуем следующий API', 'warn');
                    tryNext();
                }
            };
            xhr.onerror = function() {
                log('Ошибка сети, пробуем следующий API', 'error');
                tryNext();
            };
            xhr.ontimeout = function() {
                log('Таймаут, пробуем следующий API', 'warn');
                tryNext();
            };
            xhr.send();
        }
        tryNext();
    }

    function initPlugin() {
        if (Lampa.Manifest.origin !== 'bylampa') {
            log('Origin не bylampa, плагин остановлен', 'warn');
            return;
        }
        log('Плагин инициализирован, ожидаем события full');

        Lampa.Listener.follow('full', function(event) {
            if (event.type !== 'complite') return;
            log('Открыта карточка контента: ' + event.object.method + ' / ' + event.object.id);
            var container = event.object.activity.render();
            var methodId = event.object.method + '_' + event.object.id;
            fetchRating(methodId, function(rating) {
                if (rating !== null) {
                    showRating(container, rating);
                } else {
                    log('Не удалось загрузить рейтинг', 'error');
                }
            });
        });
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initPlugin();
        });
    }
})();