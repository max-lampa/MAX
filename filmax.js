(function () {
    'use strict';

    var api_base = 'https://bbe.lme.isroot.in/api/v2';
    
    var AUTH_KEYS = {
        token: 'BO_FILMIX_TOKEN',
        device: 'BO_FILMIX_DEVICE_ID'
    };

    // Компонент поиска и плеера
    function FilmixComponent(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var items = [];
        var active_node;

        this.create = function () {
            this.search();
            return scroll.render();
        };

        this.search = function () {
            var _this = this;
            var token = Lampa.Storage.get(AUTH_KEYS.token, '');
            var device = Lampa.Storage.get(AUTH_KEYS.device, '');
            
            if(!device){
                device = Lampa.Utils.uid(16);
                Lampa.Storage.set(AUTH_KEYS.device, device);
            }

            var url = api_base + '/search?source=filmix&title=' + encodeURIComponent(object.movie.title || object.movie.name);
            if (token) url += '&filmix_token=' + encodeURIComponent(token);
            url += '&filmix_device_id=' + encodeURIComponent(device);

            network.silent(url, function (json) {
                if (json.ok && json.items && json.items.length) {
                    _this.load(json.items[0].ref);
                } else {
                    _this.empty('Ничего не найдено');
                }
            }, function () {
                _this.empty('Ошибка сети или сервера');
            });
        };

        this.load = function (ref) {
            var _this = this;
            var body = JSON.stringify({
                source: 'filmix',
                full: true,
                ref: Object.assign({}, ref, { 
                    token: Lampa.Storage.get(AUTH_KEYS.token, ''), 
                    device_id: Lampa.Storage.get(AUTH_KEYS.device, '') 
                })
            });

            network.silent(api_base + '/content', function (json) {
                if (json.ok) _this.display(json);
                else _this.empty('Контент недоступен');
            }, null, body, { method: 'POST' });
        };

        this.display = function (json) {
            var _this = this;
            scroll.clear();
            
            if (json.type === 'video' || (json.streams && json.streams.length)) {
                json.streams.forEach(function (stream) {
                    var card = Lampa.Template.get('button', { title: stream.title || 'Смотреть (' + stream.quality + ')' });
                    card.on('hover:enter', function () {
                        Lampa.Player.play({
                            url: stream.url,
                            title: object.movie.title + ' (' + stream.quality + ')'
                        });
                    });
                    scroll.append(card);
                });
            } else if (json.voices) {
                // Берем первую озвучку и первый сезон для примера
                var voice = json.voices[0];
                var season = voice.seasons[0];
                season.episodes.forEach(function (ep) {
                    var card = Lampa.Template.get('button', { title: 'S1 / E' + ep.number });
                    card.on('hover:enter', function () {
                        _this.getStream(ep.ref);
                    });
                    scroll.append(card);
                });
            }
            
            Lampa.Controller.enable('content');
        };

        this.getStream = function(ref) {
            var body = JSON.stringify({
                source: 'filmix',
                ref: Object.assign({}, ref, { 
                    token: Lampa.Storage.get(AUTH_KEYS.token, ''), 
                    device_id: Lampa.Storage.get(AUTH_KEYS.device, '') 
                })
            });

            network.silent(api_base + '/stream', function (json) {
                if (json.ok && json.streams) {
                    Lampa.Player.play({
                        url: json.streams[0].url,
                        title: object.movie.title
                    });
                }
            }, null, body, { method: 'POST' });
        };

        this.empty = function (msg) {
            scroll.clear();
            scroll.append($('<div class="empty">'+msg+'</div>'));
        };

        this.pause = function () {};
        this.destroy = function () { network.clear(); scroll.destroy(); };
        this.render = function () { return scroll.render(); };
    }

    // Интеграция в настройки и карточку
    function start() {
        // Регистрация компонента
        Lampa.Component.add('filmix_pure', FilmixComponent);

        // Добавляем пункт в настройки Lampa
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'account') {
                var field = $('<div class="settings-param selector" data-name="filmix_token" data-type="input"><div class="settings-param__name">Filmix Token</div><div class="settings-param__value"></div><div class="settings-param__descr">Введите токен для Filmix PRO</div></div>');
                
                field.find('.settings-param__value').text(Lampa.Storage.get(AUTH_KEYS.token, 'Не установлен'));
                
                field.on('hover:enter', function () {
                    Lampa.Input.edit({
                        value: Lampa.Storage.get(AUTH_KEYS.token, ''),
                        free: true
                    }, function (new_value) {
                        if (new_value) {
                            Lampa.Storage.set(AUTH_KEYS.token, new_value);
                            field.find('.settings-param__value').text(new_value);
                        }
                    });
                });
                e.body.find('.settings-list').append(field);
            }
        });

        // Добавляем кнопку в карточку фильма
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var btn = $('<div class="full-start__button selector"><span>Filmix Pure</span></div>');
                btn.on('hover:enter', function () {
                    Lampa.Activity.push({
                        title: 'Filmix',
                        component: 'filmix_pure',
                        movie: e.data.movie,
                        page: 1
                    });
                });
                e.context.find('.full-start__buttons').append(btn);
            }
        });
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') start(); });

})();
