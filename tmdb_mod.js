(function () {
    'use strict';

    function startPlugin() {
        window.plugin_tmdb_mod_ready = true;

        // 📅 Вычисляем дату один раз, чтобы не дублировать
        var today = new Date().toISOString().substr(0, 10);

        // 📌 Единая конфигурация всех коллекций (id, название, запрос)
        var collectionsConfig = [
            {
                id: 'hot_new_releases',
                name: 'Самые свежие премьеры',
                request: 'discover/movie?sort_by=primary_release_date.desc&with_release_type=4|5|6&primary_release_date.lte=' + today + '&vote_count.gte=50&vote_average.gte=6&with_runtime.gte=40&without_genres=99&region=RU'
            },
            {
                id: 'upcoming_episodes',
                name: 'Предстоящие эпизоды',
                isEpisodes: true
            },
            {
                id: 'trending_movies',
                name: 'Топ фильмов недели',
                request: 'trending/movie/week'
            },
            {
                id: 'trending_tv',
                name: 'Топ сериалов недели',
                request: 'trending/tv/week'
            },
            {
                id: 'fresh_online',
                name: 'Сейчас смотрят',
                request: 'discover/movie?sort_by=popularity.desc&with_release_type=4|5|6&primary_release_date.lte=' + today + '&vote_count.gte=50&vote_average.gte=6&with_runtime.gte=40&without_genres=99&region=RU'
            },
            {
                id: 'best_world_series',
                name: 'Хиты сериалов мира 2020+',
                request: 'discover/tv?with_origin_country=US|CA|GB|AU|IE|DE|FR|NL|SE|NO|DK|FI|ES|IT|BE|CH|AT|KR|JP|MX|BR&sort_by=last_air_date.desc&vote_average.gte=7&vote_count.gte=500&first_air_date.gte=2020-01-01&first_air_date.lte=' + today + '&without_genres=16|99|10762|10763|10764|10766|10767|10768|10770&with_status=0|1|2|3'
            },
            {
                id: 'netflix_best',
                name: 'Хиты сериалов Netflix',
                request: 'discover/tv?with_networks=213&sort_by=last_air_date.desc&first_air_date.gte=2020-01-01&last_air_date.lte=' + today + '&vote_count.gte=500&vote_average.gte=7&without_genres=16|99|10751|10762|10763|10764|10766|10767|10768|10770'
            },
            {
                id: 'cult_cinema',
                name: 'Популярные фильмы с 80-х',
                request: 'discover/movie?primary_release_date.gte=1980-01-01&sort_by=popularity.desc&vote_average.gte=7&vote_count.gte=500'
            },
            {
                id: 'animation',
                name: 'Лучшие мультфильмы',
                request: 'discover/movie?with_genres=16&sort_by=popularity.desc&vote_average.gte=7&vote_count.gte=500'
            },
            {
                id: 'documentary',
                name: 'Документальные фильмы',
                request: 'discover/movie?with_genres=99&sort_by=popularity.desc&vote_count.gte=20&with_translations=ru&include_translations=ru'
            },
            {
                id: 'russian_movies',
                name: 'Новинки русского кино',
                request: 'discover/movie?with_original_language=ru&sort_by=primary_release_date.desc&with_release_type=4|5|6&primary_release_date.lte=' + today + '&with_runtime.gte=40&without_genres=99&region=RU'
            },
            {
                id: 'russian_series',
                name: 'Лучшие русскоязычные сериалы 2020+',
                request: 'discover/tv?with_original_language=ru&sort_by=last_air_date.desc&first_air_date.gte=2020-01-01&last_air_date.lte=' + today + '&vote_average.gte=6&vote_count.gte=5&without_genres=16|99|10751|10762|10763|10764|10766|10767|10768'
            },
            { id: 'okko_platform', name: 'ОККО Originals', request: 'discover/tv?language=ru&with_networks=3871&sort_by=first_air_date.desc' },
            { id: 'premier_platform', name: 'Premier Originals', request: 'discover/tv?language=ru&with_networks=2859&sort_by=first_air_date.desc' },
            { id: 'start_platform', name: 'START Originals', request: 'discover/tv?language=ru&with_networks=2493&sort_by=first_air_date.desc' },
            { id: 'wink_platform', name: 'WINK Originals', request: 'discover/tv?language=ru&with_networks=5806&sort_by=first_air_date.desc' },
            { id: 'kion_platform', name: 'KION Originals', request: 'discover/tv?language=ru&with_networks=4085&sort_by=first_air_date.desc' },
            { id: 'kinopoisk_platform', name: 'Кинопоиск Originals', request: 'discover/tv?language=ru&with_networks=3827&sort_by=first_air_date.desc' },
            { id: 'cts_platform', name: 'СТС Originals', request: 'discover/tv?language=ru&with_networks=806&sort_by=first_air_date.desc' },
            { id: 'tnt_platform', name: 'ТНТ Originals', request: 'discover/tv?language=ru&with_networks=1191&sort_by=first_air_date.desc' },
            { id: 'ivi_platform', name: 'ИВИ Originals', request: 'discover/tv?language=ru&with_networks=3923&sort_by=first_air_date.desc' }
        ];

        // Настройки плагина на основе конфигурации
        var pluginSettings = {
            enabled: true,
            collections: collectionsConfig.reduce(function(acc, c) { acc[c.id] = true; return acc; }, {})
        };

        // Загрузка сохранённых настроек
        function loadSettings() {
            pluginSettings.enabled = Lampa.Storage.get('tmdb_mod_enabled', true);
            collectionsConfig.forEach(function(cfg) {
                pluginSettings.collections[cfg.id] = Lampa.Storage.get('tmdb_mod_collection_' + cfg.id, true);
            });
            return pluginSettings;
        }

        // Сохранение настроек
        function saveSettings() {
            Lampa.Storage.set('tmdb_mod_enabled', pluginSettings.enabled);
            collectionsConfig.forEach(function(cfg) {
                Lampa.Storage.set('tmdb_mod_collection_' + cfg.id, pluginSettings.collections[cfg.id]);
            });
        }

        // -----------------------------
        // Класс для отображения эпизодов сериалов (с сохранённой логикой)
        // -----------------------------
        var Episode = function (data) {
            var card = data.card || data;
            var episode = data.next_episode_to_air || data.episode || {};
            if (card.source == undefined) card.source = 'tmdb';
            Lampa.Arrays.extend(card, {
                title: card.name,
                original_title: card.original_name,
                release_date: card.first_air_date
            });
            card.release_year = ((card.release_date || '0000') + '').slice(0, 4);

            function remove(elem) {
                if (elem) elem.remove();
            }

            this.build = function () {
                this.card = Lampa.Template.js('card_episode');
                this.img_poster = this.card.querySelector('.card__img') || {};
                this.img_episode = this.card.querySelector('.full-episode__img img') || {};
                this.card.querySelector('.card__title').innerText = card.title;
                this.card.querySelector('.full-episode__num').innerText = card.unwatched || '';
                if (episode && episode.air_date) {
                    this.card.querySelector('.full-episode__name').innerText = ('s' + (episode.season_number || '?') + 'e' + (episode.episode_number || '?') + '. ') + (episode.name || Lampa.Lang.translate('noname'));
                    this.card.querySelector('.full-episode__date').innerText = episode.air_date ? Lampa.Utils.parseTime(episode.air_date).full : '----';
                }

                if (card.release_year == '0000') {
                    remove(this.card.querySelector('.card__age'));
                } else {
                    this.card.querySelector('.card__age').innerText = card.release_year;
                }

                this.card.addEventListener('visible', this.visible.bind(this));
            };

            this.image = function () {
                var _this = this;
                this.img_poster.onload = function () {};
                this.img_poster.onerror = function () {
                    _this.img_poster.src = './img/img_broken.svg';
                };
                this.img_episode.onload = function () {
                    _this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
                };
                this.img_episode.onerror = function () {
                    _this.img_episode.src = './img/img_broken.svg';
                };
            };

            this.create = function () {
                var _this2 = this;
                this.build();
                this.card.addEventListener('hover:focus', function () {
                    if (_this2.onFocus) _this2.onFocus(_this2.card, card);
                });
                this.card.addEventListener('hover:hover', function () {
                    if (_this2.onHover) _this2.onHover(_this2.card, card);
                });
                this.card.addEventListener('hover:enter', function () {
                    if (_this2.onEnter) _this2.onEnter(_this2.card, card);
                });
                this.image();
            };

            this.visible = function () {
                if (card.poster_path) this.img_poster.src = Lampa.Api.img(card.poster_path);
                else if (card.profile_path) this.img_poster.src = Lampa.Api.img(card.profile_path);
                else if (card.poster) this.img_poster.src = card.poster;
                else if (card.img) this.img_poster.src = card.img;
                else this.img_poster.src = './img/img_broken.svg';

                if (episode && episode.still_path) this.img_episode.src = Lampa.Api.img(episode.still_path, 'w300');
                else if (card.backdrop_path) this.img_episode.src = Lampa.Api.img(card.backdrop_path, 'w300');
                else if (episode.img) this.img_episode.src = episode.img;
                else if (card.img) this.img_episode.src = card.img;
                else this.img_episode.src = './img/img_broken.svg';

                if (this.onVisible) this.onVisible(this.card, card);
            };

            this.destroy = function () {
                this.img_poster.onerror = function () {};
                this.img_poster.onload = function () {};
                this.img_episode.onerror = function () {};
                this.img_episode.onload = function () {};
                this.img_poster.src = '';
                this.img_episode.src = '';
                remove(this.card);
                this.card = null;
                this.img_poster = null;
                this.img_episode = null;
            };

            this.render = function (js) {
                return js ? this.card : $(this.card);
            };
        };

        // -----------------------------
        // Основной класс источника данных TMDB MOD
        // -----------------------------
        var SourceTMDB = function () {
            this.network = new Lampa.Reguest();
            this.discovery = false;

            this.main = function () {
                var owner = this;
                var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var oncomplite = arguments.length > 1 ? arguments[1] : undefined;
                var onerror = arguments.length > 2 ? arguments[2] : undefined;
                var parts_limit = 6;

                var settings = loadSettings();

                if (!settings.enabled) {
                    return Lampa.Api.sources.tmdb.main.apply(this, arguments);
                }

                var parts_data = [];

                // Генерируем блоки на основе конфигурации
                collectionsConfig.forEach(function(cfg) {
                    if (!settings.collections[cfg.id]) return;

                    if (cfg.isEpisodes) {
                        parts_data.push(function (call) {
                            call({
                                source: 'tmdb',
                                results: Lampa.TimeTable.lately().slice(0, 20),
                                title: Lampa.Lang.translate(cfg.name),
                                nomore: true,
                                cardClass: function cardClass(_elem, _params) { return new Episode(_elem, _params); }
                            });
                        });
                    } else {
                        parts_data.push(function (call) {
                            owner.get(cfg.request, params, function (json) {
                                json.title = Lampa.Lang.translate(cfg.name);
                                call(json);
                            }, function (err) {
                                // Явная обработка ошибки: лог в консоль и возврат пустой подборки,
                                // чтобы интерфейс не ломался при ошибке TMDB.
                                console.error('Ошибка загрузки подборки "' + cfg.name + '":', err);
                                call({ source: 'tmdb', results: [], title: Lampa.Lang.translate(cfg.name) });
                            });
                        });
                    }
                });

                if (parts_data.length === 0) {
                    return Lampa.Api.sources.tmdb.main.apply(this, arguments);
                }

                function loadPart(partLoaded, partEmpty) {
                    Lampa.Api.partNext(parts_data, parts_limit, partLoaded, partEmpty);
                }

                loadPart(oncomplite, onerror);
                return loadPart;
            };
        };

        // -----------------------------
        // Добавление настроек в меню Lampa
        // -----------------------------
        function addSettings() {
            Lampa.SettingsApi.addComponent({
                component: 'tmdb_mod',
                name: 'TMDB_MOD Подборки',
                icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4H20V20H4V4Z" stroke="currentColor" stroke-width="2"/><path d="M8 8H16V16H8V8Z" fill="currentColor"/></svg>'
            });

            Lampa.SettingsApi.addParam({
                component: 'tmdb_mod',
                param: { name: 'tmdb_mod_enabled', type: 'trigger', default: true },
                field: { name: 'Включить TMDB_MOD подборки', description: 'Показывать кастомные подборки на главной странице' },
                onChange: function (value) {
                    pluginSettings.enabled = value;
                    saveSettings();
                    Lampa.Noty.show('Изменения вступят в силу после перезагрузки главной страницы');
                }
            });

            // Генерация переключателей из конфигурации
            collectionsConfig.forEach(function(cfg) {
                Lampa.SettingsApi.addParam({
                    component: 'tmdb_mod',
                    param: { name: 'tmdb_mod_collection_' + cfg.id, type: 'trigger', default: true },
                    field: { name: cfg.name, description: 'Показывать подборку "' + cfg.name + '"' },
                    onChange: function (value) {
                        pluginSettings.collections[cfg.id] = value;
                        saveSettings();
                        Lampa.Noty.show('Изменения вступят в силу после перезагрузки главной страницы');
                    }
                });
            });

            loadSettings();

            Lampa.Settings.listener.follow('open', function () {
                setTimeout(function () {
                    document.querySelectorAll('[data-name="tmdb_mod_enabled"]').forEach(function(el) { if (el.type === 'checkbox') el.checked = pluginSettings.enabled; });
                    collectionsConfig.forEach(function(cfg) {
                        document.querySelectorAll('[data-name="tmdb_mod_collection_' + cfg.id + '"]').forEach(function(el) {
                            if (el.type === 'checkbox') el.checked = pluginSettings.collections[cfg.id];
                        });
                    });
                }, 100);
            });
        }

        // -----------------------------
        // Инициализация плагина
        // -----------------------------
        function add() {
            var tmdb_mod = Object.assign({}, Lampa.Api.sources.tmdb, new SourceTMDB());
            Lampa.Api.sources.tmdb_mod = tmdb_mod;
            Object.defineProperty(Lampa.Api.sources, 'tmdb_mod', { get: function get() { return tmdb_mod; } });
            Lampa.Params.select('source', Object.assign({}, Lampa.Params.values['source'], {'tmdb_mod': 'TMDB_MOD'}), 'tmdb');

            addSettings();
        }

        if (window.appready) add(); else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') { add(); }
            });
        }
    }

    if (!window.plugin_tmdb_mod_ready) startPlugin();

})();
