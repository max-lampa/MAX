(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // --- КОНФИГУРАЦИЯ ---
    var CONFIG = {
        tmdbApiKey: '4ef0d7355d9ffb5151e987764708ce96',
        language: 'ru',
        radius: '1.5em' // Значение максимального скругления
    };

    // --- СТИЛИ (Максимальное скругление) ---
    function addCustomStyles() {
        var style = document.createElement('style');
        style.innerHTML = `
            /* Скругление основной карточки */
            .card--wide-custom, .card {
                border-radius: ${CONFIG.radius} !important;
                overflow: hidden !important;
            }

            /* Скругление области изображения */
            .card__view {
                border-radius: ${CONFIG.radius} !important;
                overflow: hidden !important;
                border: 2px solid transparent;
                transition: border 0.3s ease;
            }

            /* Эффект при наведении (фокусе) */
            .card--wide-custom.focus .card__view, .card.focus .card__view {
                border: 2px solid #fff !important;
                border-radius: ${CONFIG.radius} !important;
            }

            /* Скругление плашек с рейтингом и годом */
            .card__vote, .card-badge-age, .card__type {
                border-radius: 0.8em !important;
                margin: 0.3em !important;
            }

            /* Оверлей внутри карточки */
            .card-backdrop-overlay {
                border-radius: ${CONFIG.radius} !important;
            }

            /* Стили текста под широкой карточкой */
            .custom-title-bottom {
                font-family: 'Roboto', sans-serif;
                padding: 0.5em 0.2em 0.1em !important;
            }
        `;
        document.head.appendChild(style);
    }

    // --- НАСТРОЙКИ ---
    function createSettings() {
        if (!Lampa.SettingsApi) return;
        Lampa.SettingsApi.addComponent({
            component: 'rus_mainpage',
            name: 'Настройка Главной (RU)',
            icon: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/></svg>`
        });
    }

    // --- СОЗДАНИЕ КАРТОЧКИ ---
    function makeWideCardItem(movie) {
        return {
            title: movie.title || movie.name,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', movie, function (m) { return m.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--wide-custom');
                        
                        var view = item.find('.card__view');
                        var imgUrl = 'https://image.tmdb.org/t/p/w500' + movie.backdrop_path;
                        
                        view.css({
                            'background-image': 'url(' + imgUrl + ')',
                            'background-size': 'cover',
                            'padding-bottom': '56.25%',
                            'height': '0'
                        });

                        item.append('<div class="custom-title-bottom">' + (movie.title || movie.name) + '</div>');
                    },
                    onlyEnter: function () {
                        Lampa.Activity.push({ component: 'full', id: movie.id, method: movie.media_type, card: movie, source: 'tmdb' });
                    }
                }
            }
        };
    }

    // --- ЗАПУСК ---
    function start() {
        if (window.rus_main_loaded) return;
        window.rus_main_loaded = true;

        addCustomStyles();
        createSettings();
        
        Lampa.Api.sources.tmdb.main = function (params, oncomplete, onerror) {
            var sections = [
                { title: 'Новинки кино', url: 'movie/now_playing' },
                { title: 'Популярные сериалы', url: 'tv/popular' }
            ];

            let parts_data = sections.map(s => {
                return (cb) => {
                    let url = Lampa.TMDB.api(s.url) + '&language=ru-RU&api_key=' + CONFIG.tmdbApiKey;
                    fetch(url).then(r => r.json()).then(json => {
                        let items = json.results.slice(0, 10).map(makeWideCardItem);
                        cb({ results: items, title: s.title, params: { items: { mapping: 'line' } } });
                    }).catch(() => cb({ results: [] }));
                };
            });

            Lampa.Api.partNext(parts_data, 2, oncomplete, onerror);
        };
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });

})();
