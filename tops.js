(function() {
    'use strict';

    // Проверка на повторную загрузку
    if (window.top_ratings_plugin) return;
    window.top_ratings_plugin = true;

    // Конфигурация
    var PLUGIN_NAME = 'top_ratings';
    var API_BASE = 'https://api.themoviedb.org/3';
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

    // Утилиты
    function shuffleArray(array) {
        var arr = array.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
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

    function sortByRating(items) {
        return items.sort(function(a, b) {
            return (b.vote_average || 0) - (a.vote_average || 0);
        });
    }

    // API
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
                        results: shuffleArray(cached.results),
                        title: params.title
                    });
                } else {
                    success(cached);
                }
                return;
            }

            var network = new Lampa.Reguest();
            var apiKey = Lampa.TMDB.key();
            var lang = Lampa.Storage.get('tmdb_lang', 'ru');

            function processResults(data, mediaType) {
                if (!data || !data.results) return [];
                
                return data.results.map(function(item) {
                    item.media_type = mediaType;
                    
                    // Добавляем информацию о рейтинге
                    if (item.vote_average) {
                        var rating = item.vote_average.toFixed(1);
                        var votes = item.vote_count ? item.vote_count.toLocaleString('ru-RU') : '0';
                        var ratingInfo = '⭐ ' + rating + ' (' + votes + ' оценок)';
                        
                        if (item.overview) {
                            item.overview = ratingInfo + '\n\n' + item.overview;
                        } else {
                            item.overview = ratingInfo;
                        }
                    }
                    
                    return item;
                });
            }

            // Для "all" и "random" загружаем оба типа
            if (type === 'all' || type === 'random') {
                var movieUrl = API_BASE + '/movie/top_rated?api_key=' + apiKey + '&language=' + lang + '&page=1';
                var tvUrl = API_BASE + '/tv/top_rated?api_key=' + apiKey + '&language=' + lang + '&page=1';
                
                var movies = [];
                var tvShows = [];
                var completed = 0;

                function checkComplete() {
                    completed++;
                    if (completed === 2) {
                        var allResults = movies.concat(tvShows);
                        allResults = sortByRating(allResults);
                        
                        if (type === 'random') {
                            allResults = shuffleArray(allResults);
                        }
                        
                        cache[type] = {
                            results: allResults,
                            title: params.title
                        };
                        
                        success({
                            results: allResults,
                            title: params.title
                        });
                    }
                }

                network.silent(movieUrl, function(data) {
                    movies = processResults(data, 'movie');
                    checkComplete();
                }, function() {
                    checkComplete();
                });

                network.silent(tvUrl, function(data) {
                    tvShows = processResults(data, 'tv');
                    checkComplete();
                }, function() {
                    checkComplete();
                });
            } else {
                // Загружаем один тип
                var mediaType = (type === 'tv' || type === 'new_tv') ? 'tv' : 'movie';
                var url = API_BASE + '/' + mediaType + '/top_rated?api_key=' + apiKey + '&language=' + lang + '&page=1';

                network.silent(url, function(data) {
                    var results = processResults(data, mediaType);
                    
                    if (type === 'new_movies' || type === 'new_tv') {
                        results = filterRecent(results);
                        results = sortByDate(results);
                    } else {
                        results = sortByRating(results);
                    }
                    
                    cache[type] = {
                        results: results,
                        title: params.title
                    };
                    
                    success({
                        results: results,
                        title: params.title
                    });
                }, error);
            }
        },

        clear: function() {
            cache = {};
        }
    };

    // Компонент главной страницы
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
                                    style: { name: 'collection' }
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

    // Компонент категории
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

    // Инициализация
    function startPlugin() {
        console.log('Top Ratings Plugin: Starting...');

        var manifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Топ TMDB',
            description: 'Топ рейтинги фильмов и сериалов'
        };

        // Регистрируем компоненты
        Lampa.Component.add('top_ratings', createMainComponent);
        Lampa.Component.add('top_ratings_full', createFullComponent);

        // Добавляем в меню
        var menuItem = $(
            '<li class="menu__item selector">' +
                '<div class="menu__ico">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
                        '<path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu__text">Топ TMDB</div>' +
            '</li>'
        );

        menuItem.on('hover:enter', function() {
            Lampa.Activity.push({
                url: '',
                title: 'Топ TMDB',
                component: 'top_ratings',
                page: 1
            });
        });

        $('.menu .menu__list').eq(0).append(menuItem);
        
        console.log('Top Ratings Plugin: Started successfully');
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