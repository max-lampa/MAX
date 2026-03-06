(function () { 'use strict'; if (typeof Lampa === 'undefined') return; 

    var CONFIG = { 
        tmdbApiKey: '4ef0d7355d9ffb5151e987764708ce96', 
        cacheTime: 23 * 60 * 60 * 1000, 
        language: 'ru', // Установлен русский
        endpoint: 'https://wh.lme.isroot.in/', 
        timeout: 10000 
    }; 

    // Добавляем локализацию на русском
    Lampa.Lang.add({ 
        main_ru: 'Главная RU', 
        title_main: 'Главная RU', 
        title_tmdb: 'Главная RU' 
    });

    function getTmdbKey() { 
        let custom = (Lampa.Storage.get('rus_pro_tmdb_apikey') || '').trim(); 
        return custom || CONFIG.tmdbApiKey; 
    } 

    function getTmdbEndpoint(path) { 
        let url = Lampa.TMDB.api(path); 
        if (!url.includes('api_key')) url += (url.includes('?') ? '&' : '?') + 'api_key=' + getTmdbKey(); 
        url = url.replace(/language=[a-z-]{2,5}/, 'language=ru-RU');
        if (!url.startsWith('http')) url = 'https://api.themoviedb.org/3/' + url; 
        return url; 
    }

    // --- СТИЛИ С МАКСИМАЛЬНЫМ СКРУГЛЕНИЕМ ---
    var style = document.createElement('style');
    style.innerHTML = `
        /* Максимальное скругление карточек */
        .card--wide-custom, .card__view, .card {
            border-radius: 1.8em !important; 
            overflow: hidden !important;
        }
        
        /* Скругление фокуса */
        .card--wide-custom.focus .card__view, .card.focus .card__view {
            border-radius: 1.8em !important;
            border: 3px solid #fff !important;
        }

        /* Исправление плашек рейтинга и года */
        .card__vote, .card-badge-age {
            border-radius: 1em !important;
            background: rgba(0,0,0,0.7) !important;
        }

        .custom-title-bottom { font-weight: bold; margin-top: 5px; color: #fff; }
        .custom-overview-bottom { font-size: 0.8em; color: #ccc; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    `;
    document.head.appendChild(style);

    // Функция создания широкой карточки
    function makeWideCardItem(movie) { 
        return { 
            title: movie.title || movie.name, 
            params: { 
                createInstance: function () { 
                    return Lampa.Maker.make('Card', movie, function (module) { return module.only('Card', 'Callback'); }); 
                }, 
                emit: { 
                    onCreate: function () { 
                        var item = $(this.html); 
                        item.addClass('card--wide-custom'); 
                        var view = item.find('.card__view'); 
                        view.empty(); 
                        var imgUrl = 'https://image.tmdb.org/t/p/w500' + movie.backdrop_path; 
                        view.css({ 'background-image': 'url(' + imgUrl + ')', 'background-size': 'cover', 'padding-bottom': '56.25%', 'height': '0' }); 
                        item.append('<div class="custom-title-bottom">' + (movie.title || movie.name) + '</div>'); 
                        item.append('<div class="custom-overview-bottom">' + (movie.overview || '') + '</div>'); 
                    }, 
                    onlyEnter: function () { 
                        Lampa.Activity.push({ component: 'full', id: movie.id, method: movie.media_type, card: movie, source: 'tmdb' }); 
                    } 
                } 
            } 
        }; 
    }

    // Переопределение главной страницы
    function overrideApi() { 
        Lampa.Api.sources.tmdb.main = function (params, oncomplete, onerror) { 
            var parts_data = [
                (cb) => {
                    var url = getTmdbEndpoint('movie/now_playing');
                    $.getJSON(url, function(json) {
                        cb({ results: json.results.map(makeWideCardItem), title: 'Новинки кино (RU)', params: { items: { mapping: 'line' } } });
                    });
                },
                (cb) => {
                    var url = getTmdbEndpoint('tv/popular');
                    $.getJSON(url, function(json) {
                        cb({ results: json.results.map(makeWideCardItem), title: 'Популярные сериалы', params: { items: { mapping: 'line' } } });
                    });
                }
            ]; 
            Lampa.Api.partNext(parts_data, 2, oncomplete, onerror); 
        }; 
    }

    function start() { 
        if (window.rus_pro_v8_loaded) return; 
        window.rus_pro_v8_loaded = true; 
        overrideApi(); 
    }

    if (window.appready) start(); 
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); }); 
})();
