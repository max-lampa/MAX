(function() {
    'use strict';

    Lampa.Platform.tv();

    function initRatingPlugin() {
        // Проверка происхождения (только для оригинальной Lampa)
        if (Lampa.Manifest.origin !== 'bylampa') {
            Lampa.Noty.show('Ошибка доступа');
            return;
        }

        // Следим за открытием карточки контента
        Lampa.Listener.follow('full', function(event) {
            if (event.type !== 'complite') return;

            // Контейнер с информацией о фильме/сериале
            var container = event.object.activity.render();
            // Ищем наш блок рейтинга
            var ratingBlock = $('.full-start__rate.rate--lampa', container);

            // Если блока нет – создаём
            if (ratingBlock.length === 0) {
                ratingBlock = $('<div class="full-start__rate rate--lampa"></div>');
                var valueSpan = $('<div class="rate--kp"></div>'); // сюда пойдёт число
                var label = $('<div class="source--name">LAMPA</div>');
                ratingBlock.append(valueSpan).append(label);
                $('div:first', container).after(ratingBlock);
            }

            // Формируем запрос к API
            var methodId = event.object.method + '_' + event.object.id;
            var apiUrl = 'http://cub.red/api/reactions/get/' + methodId;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', apiUrl, true);
            xhr.timeout = 2000;
            xhr.send();

            xhr.onload = function() {
                if (xhr.status !== 200) return;
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

                    ratingBlock.find('.rate--kp').text(rating);
                } catch (e) {
                    console.warn('Ошибка парсинга рейтинга', e);
                }
            };

            xhr.onerror = function() {
                console.log('Ошибка при выполнении запроса на получение рейтинга');
            };

            xhr.ontimeout = function() {
                console.log('Запрос тайм-аут');
            };
        });
    }

    // Запуск плагина после полной загрузки приложения
    if (window.appready) {
        initRatingPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initRatingPlugin();
        });
    }
})();