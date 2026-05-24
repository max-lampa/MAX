(function() {
    'use strict';
    
    Lampa.Platform.tv();

    // Конфигурация
    var PLUGIN_NAME = 'top_ratings';
    var API_BASE = 'https://api.themoviedb.org/3'; // Официальный API TMDB
    var YEARS_BACK = 5;
    
    var CATEGORIES = [
        {
            title: 'Топ по рейтингу',
            img: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3Cpath%20fill%3D%22%23FFD700%22%20d%3D%22M12%202l3.09%206.26L22%209.27l-5%204.87%201.18%206.88L12%2017.77l-6.18%203.25L7%2014.14%202%209.27l6.91-1.01L12%202z%22%2F%3E%3C%2Fsvg%3E',
            type: 'all'
        },
        {
            title: 'Топ Фильмы',
            img: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3Cpath%20fill%3D%22%23E50914%22%20d%3D%22M18%204l2%204h-3l-2-4h-2l2%204h-3l-2-4H8l2%204H7L5%204H4c-1.1%200-2%20.9-2%202v12c0%201.1.9%202%202%202h16c1.1%200%202-.9%202-2V4h-4z%22%2F%3E%3C%2Fsvg%3E',
            type: 'movies'
        },
        {
            title: 'Топ Сериалы',
            img: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3Cpath%20fill%3D%22%234285F4%22%20d%3D%22M21%203H3c-1.1%200-2%20.9-2%202v12c0%201.1.9%202%202%202h5v2h8v-2h5c1.1%200%201.99-.9%201.99-2L23%205c0-1.1-.9-2-2-2zm0%2014H3V7h18v10z%22%2F%3E%3C%2Fsvg%3E',
            type: 'tv'
        },
        {
            title: 'Новые Фильмы',
            img: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3Ccircle%20fill%3D%22%2333C758%22%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%2F%3E%3Ctext%20x%3D%2212%22%20y%3D%2216%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%3ENEW%3C%2Ftext%3E%3C%2Fsvg%3E',
            type: 'new_movies'
        },
        {
            title: 'Новые Сериалы',
            img: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3Ccircle%20fill%3D%22%234285F4%22%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%2F%3E%3Ctext%20x%3D%2212%22%20y%3D%2216%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%20font-size%3D%2210%22%20font-weight%3D%22bold%22%3ENEW%3C%2Ftext%3E%3C%2Fsvg%3E',
            type: 'new_tv'
        },
        {
            title: 'Случайный выбор',
            img: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%3Crect%20x%3D%223%22%20y%3D%223%22%20width%3D%2218%22%20height%3D%2218%22%20rx%3D%223%22%20fill%3D%22%239C27B0%22%2F%3E%3Ccircle%20fill%3D%22white%22%20cx%3D%228%22%20cy%3D%228%22%20r%3D%221.8%22%2F%3E%3Ccircle%20fill%3D%22white%22%20cx%3D%2216%22%20cy%3D%2216%22%20r%3D%221.8%22%2F%3E%3Ccircle%20fill%3D%22white%22%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%221.8%22%2F%3E%3C%2Fsvg%3E',
            type: 'random'
        }
    ];

    // Кэш данных
    var cache = {};
    var currentRequest = null;
    var currentCallback = null;
    var errorCallback = null;
    var allResults = [];
    var loadedCount = 0;
    var totalCount = 0;
    var itemsToLoad = [];

    // Утилиты
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    function sortByDate(items) {
        return items.sort(function(a, b) {
            var dateA = a.release_date || a.first_air_date || '';
            var dateB = b.release_date || b.first_air_date || '';
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateB.localeCompare(dateA);
        });
    }

    function filterRecent(items) {
        var now = new Date();
        now.setFullYear(now.getFullYear() - YEARS_BACK);
        var minDate = now.toISOString().split('T')[0];
        
        return items.filter(function(item) {
            var date = item.release_date || item.first_air_date || '';
            return date && date >= minDate;
        });
    }

    // Получение данных из TMDB
    function getApiUrl(type, page) {
        var apiKey = Lampa.TMDB.key();
        var lang = Lampa.Storage.get('tmdb_lang', 'ru');
        
        switch(type) {
            case 'movies':
            case 'new_movies':
                return API_BASE + '/movie/top_rated?api_key=' + apiKey + '&language=' + lang + '&page=' + page;
            case 'tv':
            case 'new_tv':
                return API_BASE + '/tv/top_rated?api_key=' + apiKey + '&language=' + lang + '&page=' + page;
            case 'all':
            case 'random':
            default:
                // Получаем оба типа и объединяем
                return null; // Обрабатывается отдельно
        }
    }

    function processItem(item, callback, errorCb) {
        if (!item || !item.id) {
            checkComplete();
            return;
        }

        var mediaType = item.media_type || 'movie';
        var apiKey = Lampa.TMDB.key();
        var lang = Lampa.Storage.get('tmdb_lang', 'ru');
        var url = API_BASE + '/' + mediaType + '/' + item.id + '?api_key=' + apiKey + '&language=' + lang;

        var network = new Lampa.Reguest();
        network.silent(url, function(data) {
            if (data) {
                data.media_type = mediaType;
                // Добавляем информацию о рейтинге
                data.vote_display = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
                data.vote_count_display = data.vote_count ? data.vote_count.toLocaleString('ru-RU') : '0';
                allResults.push(data);
            }
            checkComplete();
        }, function() {
            checkComplete();
        });
    }

    function checkComplete() {
        loadedCount++;
        
        if (loadedCount >= totalCount) {
            var results = [];
            
            if (currentRequest.type === 'all' || currentRequest.type === 'movies' || currentRequest.type === 'tv') {
                // Сортируем по рейтингу
                results = allResults.sort(function(a, b) {
                    return (b.vote_average || 0) - (a.vote_average || 0);
                });
            } else if (currentRequest.type === 'new_movies' || currentRequest.type === 'new_tv') {
                results = filterRecent(allResults);
                results = sortByDate(results);
            } else if (currentRequest.type === 'random') {
                results = shuffleArray(allResults.slice());
            }

            // Форматируем результаты для отображения
            results = results.map(function(item) {
                var rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
                var votes = item.vote_count ? item.vote_count.toLocaleString('ru-RU') : '0';
                
                // Добавляем информацию о рейтинге в описание
                if (item.overview) {
                    item.overview = '⭐ ' + rating + ' (' + votes + ' оценок)\n\n' + item.overview;
                }
                
                return item;
            });

            cache[currentRequest.type] = {
                results: results,
                title: currentRequest.title
            };

            if (currentCallback) {
                currentCallback({
                    results: results,
                    title: currentRequest.title
                });
            }

            // Очистка
            currentRequest = null;
            currentCallback = null;
            errorCallback = null;
            allResults = [];
            loadedCount = 0;
            totalCount = 0;
            itemsToLoad = [];
        }
    }

    // API плагина
    var API = {
        main: function(params, success, error) {
            var result = {
                collection: true,
                total_pages: 1,
                results: CATEGORIES.map(function(cat) {
                    return {
                        title: cat.title,
                        img: cat.img,
                        type: cat.type
                    };
                })
            };
            success(result);
        },

        full: function(params, success, error) {
            var type = params.type;
            
            // Проверяем кэш
            if (cache[type]) {
                var cached = cache[type];
                if (type === 'random') {
                    success({
                        results: shuffleArray(cached.results.slice()),
                        title: params.title
                    });
                } else {
                    success(cached);
                }
                return;
            }

            // Загружаем данные
            var network = new Lampa.Reguest();
            currentRequest = params;
            currentCallback = success;
            errorCallback = error;
            allResults = [];
            loadedCount = 0;

            // Для типа 'all' загружаем и фильмы и сериалы
            if (type === 'all' || type === 'random') {
                var apiKey = Lampa.TMDB.key();
                var lang = Lampa.Storage.get('tmdb_lang', 'ru');
                var promises = 0;
                var completed = 0;

                function checkBothComplete() {
                    completed++;
                    if (completed === 2) {
                        totalCount = allResults.length;
                        itemsToLoad = allResults.slice();
                        allResults = [];
                        loadedCount = 0;

                        if (totalCount === 0) {
                            success({ results: [], title: params.title });
                            return;
                        }

                        for (var i = 0; i < itemsToLoad.length; i++) {
                            processItem(itemsToLoad[i], success, error);
                        }
                    }
                }

                // Загружаем топ фильмов
                network.silent(
                    API_BASE + '/movie/top_rated?api_key=' + apiKey + '&language=' + lang + '&page=1',
                    function(data) {
                        if (data && data.results) {
                            data.results.forEach(function(item) {
                                item.media_type = 'movie';
                                allResults.push(item);
                            });
                        }
                        checkBothComplete();
                    },
                    function() {
                        checkBothComplete();
                    }
                );

                // Загружаем топ сериалов
                network.silent(
                    API_BASE + '/tv/top_rated?api_key=' + apiKey + '&language=' + lang + '&page=1',
                    function(data) {
                        if (data && data.results) {
                            data.results.forEach(function(item) {
                                item.media_type = 'tv';
                                allResults.push(item);
                            });
                        }
                        checkBothComplete();
                    },
                    function() {
                        checkBothComplete();
                    }
                );
            } else {
                // Загружаем один тип
                var url = getApiUrl(type, 1);
                network.silent(url, function(data) {
                    if (data && data.results && Array.isArray(data.results)) {
                        itemsToLoad = data.results;
                        totalCount = data.results.length;
                        
                        if (totalCount === 0) {
                            success({ results: [], title: params.title });
                            return;
                        }

                        var mediaType = (type === 'tv' || type === 'new_tv') ? 'tv' : 'movie';
                        for (var i = 0; i < data.results.length; i++) {
                            data.results[i].media_type = mediaType;
                            processItem(data.results[i], success, error);
                        }
                    } else {
                        error();
                    }
                }, error);
            }
        },

        clear: function() {
            cache = {};
        }
    };

    // Компонент главной страницы плагина
    function createMainComponent(params) {
        var component = Lampa.Maker.make('Category', params);
        
        component.use({
            onCreate: function() {
                var self = this;
                this.body.addClass('mapping--grid');
                this.body.addClass('cols--5');
                
                setTimeout(function() {
                    var data = {
                        results: CATEGORIES.map(function(cat) {
                            return {
                                title: cat.title,
                                img: cat.img,
                                params: {
                                    style: { name: 'collection' },
                                    module: Lampa.Maker.build('Card').only('Style', 'Callback', 'silent')
                                },
                                data: {
                                    title: cat.title,
                                    component: 'top_ratings_full',
                                    type: cat.type,
                                    page: 1
                                }
                            };
                        })
                    };
                    
                    self.build(data);
                    $('.card', self.body).css('text-align', 'center');
                }, 100);
            },
            
            onInstance: function(card, data) {
                card.use({
                    onEnter: function() {
                        if (data && data.data) {
                            Lampa.Activity.push(data.data);
                        }
                    }
                });
            }
        });
        
        return component;
    }

    // Компонент просмотра категории
    function createFullComponent(params) {
        var component = Lampa.Maker.make('Category', params);
        
        component.use({
            onCreate: function() {
                var self = this;
                this.activity.loader(true);
                
                API.full(params, function(data) {
                    self.build(data);
                    self.activity.loader(false);
                }, function() {
                    self.empty();
                    self.activity.loader(false);
                });
            },
            
            onUpdate: function(newParams) {
                var self = this;
                this.activity.loader(true);
                
                API.full(newParams, function(data) {
                    self.build(data);
                    self.activity.loader(false);
                }, function() {
                    self.empty();
                    self.activity.loader(false);
                });
            },
            
            onInstance: function(card, data) {
                card.use({
                    onEnter: function(item, elem) {
                        Lampa.Activity.push({
                            url: '',
                            component: 'full',
                            id: elem.id,
                            method: elem.media_type,
                            card: elem
                        });
                    }
                });
            }
        });
        
        return component;
    }

    // Инициализация плагина
    function startPlugin() {
        if (Lampa.Manifest.plugins !== 'TMDB') {
            Lampa.Noty.show('Ошибка доступа');
            return;
        }

        if (window.top_ratings_plugin) return;
        window.top_ratings_plugin = true;

        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Топ по рейтингу TMDB',
            description: 'Топ рейтинги фильмов и сериалов с оценками',
            component: 'top_ratings'
        };

        if (!Lampa.Manifest.plugins) {
            Lampa.Manifest.plugins = {};
        }
        
        Lampa.Manifest.plugins.top_ratings = manifest;
        Lampa.Component.add('top_ratings', createMainComponent);
        Lampa.Component.add('top_ratings_full', createFullComponent);

        // Добавляем пункт в меню
        var menuItem = $(
            '<li class="menu__item selector">' +
                '<div class="menu__ico">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
                        '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" ' +
                        'd="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu__text">' + manifest.name + '</div>' +
            '</li>'
        );

        menuItem.on('hover:enter', function() {
            Lampa.Activity.push({
                url: '',
                title: manifest.name,
                component: 'top_ratings',
                page: 1
            });
        });

        $('.menu .menu__list').eq(0).append(menuItem);
    }

    // Запуск
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }
})();