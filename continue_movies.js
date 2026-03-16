(function () {
    'use strict';

    // Ждём готовности приложения
    function init() {
        // Добавляем строку "Продолжить просмотр" для фильмов на главной
        Lampa.ContentRows.add({
            name: 'continue_watch_movies',
            title: Lampa.Lang.translate('title_watched') || 'Вы смотрели',
            index: 2, // Сразу после строки сериалов (index: 1)
            screen: ['main'],
            call: function (params, screen) {
                var results = Lampa.Favorite.continues('movie');
                if (!results.length) return;

                return function (call) {
                    call({
                        results: results,
                        title: Lampa.Lang.translate('title_watched') || 'Вы смотрели'
                    });
                };
            }
        });
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') init();
        });
    }

})();
