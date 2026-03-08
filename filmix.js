(function () {
    'use strict';

    var api_base = 'https://bbe.lme.isroot.in/api/v2';

    // Ключи авторизации
    var AUTH_KEYS = {
        filmixToken: 'BO_FILMIX_TOKEN',
        filmixDeviceId: 'BO_FILMIX_DEVICE_ID'
    };

    // Вспомогательные функции Lampa
    function read(key) {
        return (Lampa.Storage.get(key, '') || '').toString().trim();
    }

    function ensureDeviceId() {
        var deviceId = read(AUTH_KEYS.filmixDeviceId);
        if (!deviceId) {
            deviceId = Lampa.Utils.uid(16);
            Lampa.Storage.set(AUTH_KEYS.filmixDeviceId, deviceId);
        }
        return deviceId;
    }

    function getAuth() {
        var token = read(AUTH_KEYS.filmixToken);
        var deviceId = ensureDeviceId();
        return { token: token, device_id: deviceId };
    }

    // Основной компонент поиска и отображения
    function FilmixComponent(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var files = new Lampa.Explorer(object);
        var filter = new Lampa.Filter(object);
        var results = [];
        var episodes_cache = {};
        var choice = { season: 0, voice: 0 };

        this.create = function () {
            this.search();
            return files.render();
        };

        this.search = function () {
            var auth = getAuth();
            var url = api_base + '/search?source=filmix&title=' + encodeURIComponent(object.movie.title || object.movie.name);
            if (auth.token) url += '&filmix_token=' + encodeURIComponent(auth.token);
            if (auth.device_id) url += '&filmix_device_id=' + encodeURIComponent(auth.device_id);

            network.silent(url, (json) => {
                if (json && json.ok && json.items && json.items.length) {
                    this.loadContent(json.items[0].ref);
                } else {
                    files.empty();
                }
            }, () => files.empty());
        };

        this.loadContent = function (ref) {
            var auth = getAuth();
            var url = api_base + '/content';
            var body = {
                source: 'filmix',
                full: true,
                ref: Object.assign({}, ref, { token: auth.token, device_id: auth.device_id })
            };

            network.silent(url, (json) => {
                if (json && json.ok) {
                    if (json.type === 'series') this.drawSeries(json);
                    else this.drawMovie(json);
                }
            }, null, JSON.stringify(body), { method: 'POST' });
        };

        this.drawMovie = function (json) {
            var items = (json.streams || []).map((s, i) => ({
                title: s.title || 'Поток ' + (i + 1),
                quality: s.quality,
                ref: s.ref || json.stream_ref
            }));

            files.draw(items, {
                onEnter: (item) => this.play(item)
            });
        };

        this.drawSeries = function (json) {
            // Упрощенная логика отрисовки серий первого сезона/озвучки
            var voice = json.voices[0];
            var season = voice.seasons[0];
            var episodes = season.episodes.map(e => ({
                title: e.title || ('Серия ' + e.number),
                ref: e.ref
            }));

            files.draw(episodes, {
                onEnter: (item) => this.play(item)
            });
        };

        this.play = function (item) {
            var auth = getAuth();
            var url = api_base + '/stream';
            var body = {
                source: 'filmix',
                ref: Object.assign({}, item.ref, { token: auth.token, device_id: auth.device_id })
            };

            network.silent(url, (json) => {
                if (json && json.ok && json.streams) {
                    var play_url = json.streams[0].url;
                    // Lampa поддерживает формат [720p]url,[1080p]url
                    Lampa.Player.play({
                        url: play_url,
                        title: item.title
                    });
                }
            }, null, JSON.stringify(body), { method: 'POST' });
        };
    }

    // Регистрация в меню Lampa
    function startPlugin() {
        Lampa.Component.add('filmix_pure', FilmixComponent);

        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var btn = $('<div class="full-start__button selector"><span>Filmix Pure</span></div>');
                btn.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: '',
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

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
