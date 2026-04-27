(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    var PROXIES = [
        'https://cors.lampa.stream/',
        'https://cors.eu.org/',
        'https://corsproxy.io/?url='
    ];

    function getTmdbKey() {
        return (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96');
    }

    function getTmdbEndpoint(path) {
        var url = Lampa.TMDB.api(path);
        if (url.indexOf('api_key') === -1) url += (url.indexOf('?') !== -1 ? '&' : '?') + 'api_key=' + getTmdbKey();
        if (url.indexOf('http') !== 0) url = 'https://api.themoviedb.org/3/' + url;
        return url;
    }

    async function getImdbIdForTmdb(tmdbId, type) {
        if (!tmdbId) return null;
        var cacheKey = 'ru_main_imdb_' + tmdbId;
        var cached = Lampa.Storage.get(cacheKey);
        var now = Date.now();
        if (cached && (now - cached.time) < 4 * 24 * 60 * 60 * 1000) return cached.id;

        var endpoint = getTmdbEndpoint(type + '/' + tmdbId + '/external_ids');
        try {
            var res = await fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); });
            if (res && res.imdb_id) {
                Lampa.Storage.set(cacheKey, { id: res.imdb_id, time: now });
                return res.imdb_id;
            }
        } catch (e) {}
        return null;
    }

    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'ru_mainpage_alt',
            name: 'Альтернативный вид',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'ru_mainpage_alt',
            param: { name: 'ru_alt_design_enable', type: 'trigger', default: false },
            field: { name: 'Включить альтернативный вид', description: 'Новый дизайн карточек и изображения из easyratingsdb' }
        });

        Lampa.SettingsApi.addParam({
            component: 'ru_mainpage_alt',
            param: { name: 'ru_alt_apikey_btn', type: 'button' },
            field: { name: 'easyratingsdb API ключ', description: 'Нажмите, чтобы ввести ваш ключ' }
        });

        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'ru_mainpage_alt') {
                e.body.find('[data-name="ru_alt_apikey_btn"]').on('hover:enter', function () {
                    var currentKey = Lampa.Storage.get('ru_alt_design_apikey') || '';
                    Lampa.Input.edit({
                        title: 'API ключ easyratingsdb', value: currentKey, free: true, nosave: true
                    }, function (new_val) {
                        if (new_val !== undefined) {
                            Lampa.Storage.set('ru_alt_design_apikey', new_val.trim());
                            Lampa.Noty.show('Ключ сохранён. Изменения применены.');
                        }
                    });
                });
            }
        });
    }

    function start() {
        addSettings();

        var CardMaker = Lampa.Maker.map('Card');
        var originalOnVisible = CardMaker.Card.onVisible;

        CardMaker.Card.onVisible = function () {
            var html = this.html;
            var data = this.data;
            if (!html || !data) return;

            originalOnVisible.apply(this, arguments);

            var view = html.querySelector('.card__view');
            var useAltDesign = Lampa.Storage.get('ru_alt_design_enable') === true;
            var altToken = Lampa.Storage.get('ru_alt_design_apikey');

            if (useAltDesign && view) {
                html.classList.add('ru-alt-card');
            } else if (html.classList) {
                html.classList.remove('ru-alt-card');
            }

            var vote = html.getElementsByClassName('card__vote');
            if (useAltDesign) {
                for (var v = 0; v < vote.length; v++) {
                    vote[v].style.setProperty('display', 'none', 'important');
                    vote[v].style.setProperty('opacity', '0', 'important');
                }
                var ratings = html.getElementsByClassName('card-rating');
                for (var r = 0; r < ratings.length; r++) {
                    ratings[r].style.setProperty('display', 'none', 'important');
                }
            }

            var isWideCard    = html.classList && (html.classList.contains('card--wide-custom') || html.classList.contains('card--history-custom'));

            if (useAltDesign && data.id && altToken) {
                getImdbIdForTmdb(data.id, data.media_type || (data.name ? 'tv' : 'movie')).then(function (imdb) {
                    if (imdb) {
                        if (isWideCard) {
                            var bg = 'https://easyratingsdb.com/' + altToken + '/backdrop/' + imdb + '.jpg';
                            view.style.backgroundImage = 'url(' + bg + ')';
                            data.custom_full_bg = bg;
                        } else {
                            var img = html.querySelector('.card__img');
                            if (img) {
                                var newImg = img.cloneNode(true);
                                img.parentNode.replaceChild(newImg, img);

                                newImg.onload = null;
                                newImg.onerror = function () {
                                    this.src = PROXIES[0] + Lampa.TMDB.image('t/p/w300' + data.poster_path);
                                };
                                newImg.src = 'https://easyratingsdb.com/' + altToken + '/poster/' + imdb + '.jpg';
                            }
                        }
                    }
                });
            }
        };
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });

})();
