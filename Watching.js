(function () {
    'use strict';

    function start() {
        // Перехоплюємо метод виклику контенту на сторінках
        var originalCall = Lampa.ContentRows.call;

        Lampa.ContentRows.call = function (screen, params, calls) {
            // Якщо це головна сторінка (main)
            if (screen === 'main') {
                
                // Отримуємо список незавершених переглядів
                // Параметр 'movie' відфільтрує лише фільми та серіали з історії
                var continues = Lampa.Favorite.continues('movie');

                if (continues.length > 0) {
                    // Додаємо нову секцію в самий початок (unshift)
                    calls.unshift(function (call) {
                        call({
                            results: continues,
                            title: Lampa.Lang.translate('title_continue') // "Продовжити перегляд"
                        });
                    });
                }
            }

            // Викликаємо оригінальний метод, щоб завантажити решту стандартних рядків
            originalCall.apply(this, arguments);
        };
    }

    // Очікуємо повної готовності додатка
    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();

