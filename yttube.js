(function () {
    'use strict';

    if (window.ytdl_plugin_ready || typeof Lampa === 'undefined') return;
    window.ytdl_plugin_ready = true;

    var ICON = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" stroke-width="1.8"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/></svg>';

    var HISTORY_KEY   = 'yt_hist_v5';
    var HISTORY_LIMIT = 30;

    var PROXIES = [
        'https://allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://corsproxy.io/?'
    ];

    var INV_HOSTS = [
        'https://invidious.privacydev.net',
        'https://inv.nadeko.net',
        'https://invidious.fdn.fr',
        'https://yt.drgnz.club',
        'https://iv.datura.network'
    ];

    var currentProxy = 0;
    var currentHost  = 0;

    // ============================================================
    // ЗАПРОСЫ
    // ============================================================

    function apiGet(path, ok, fail, attempt) {
        attempt = attempt || 0;

        if (attempt >= PROXIES.length * INV_HOSTS.length) {
            fail('Все серверы недоступны. Попробуйте позже.');
            return;
        }

        currentProxy = attempt % PROXIES.length;
        currentHost  = Math.floor(attempt / PROXIES.length) % INV_HOSTS.length;

        var targetUrl = INV_HOSTS[currentHost] + path;
        var proxyUrl  = PROXIES[currentProxy] + encodeURIComponent(targetUrl);

        console.log('[YouTube] Запрос:', proxyUrl);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', proxyUrl, true);
        xhr.timeout = 15000;
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    ok(data);
                } catch (e) {
                    console.warn('[YouTube] Ошибка парсинга, пробуем следующий...');
                    apiGet(path, ok, fail, attempt + 1);
                }
            } else {
                console.warn('[YouTube] HTTP', xhr.status, '— пробуем следующий...');
                apiGet(path, ok, fail, attempt + 1);
            }
        };

        xhr.onerror = function () {
            console.warn('[YouTube] Ошибка сети — пробуем следующий...');
            apiGet(path, ok, fail, attempt + 1);
        };

        xhr.ontimeout = function () {
            console.warn('[YouTube] Таймаут — пробуем следующий...');
            apiGet(path, ok, fail, attempt + 1);
        };

        xhr.send();
    }

    // ============================================================
    // ИСТОРИЯ
    // ============================================================

    function readHistory() {
        try {
            var h = Lampa.Storage.get(HISTORY_KEY, '[]');
            var arr = typeof h === 'string' ? JSON.parse(h) : h;
            return Array.isArray(arr) ? arr : [];
        } catch (e) { return []; }
    }

    function saveHistory(item) {
        var list = readHistory().filter(function (o) {
            return o && o.videoId !== item.videoId;
        });
        list.unshift(item);
        Lampa.Storage.set(HISTORY_KEY, list.slice(0, HISTORY_LIMIT));
    }

    function clearHistory() {
        Lampa.Storage.set(HISTORY_KEY, []);
        Lampa.Noty.show('История очищена');
    }

    // ============================================================
    // УТИЛИТЫ
    // ============================================================

    function toTime(sec) {
        sec = parseInt(sec || 0, 10);
        if (!sec) return '';
        var h = Math.floor(sec / 3600);
        var m = Math.floor((sec % 3600) / 60);
        var s = sec % 60;
        var z = function (v) { return v < 10 ? '0' + v : '' + v; };
        return (h ? h + ':' + z(m) : m) + ':' + z(s);
    }

    function thumb(arr) {
        if (!arr || !arr.length) return '';
        var preferred = ['high', 'medium', 'default'];
        for (var p = 0; p < preferred.length; p++) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].quality === preferred[p]) return arr[i].url || '';
            }
        }
        return arr[arr.length - 1].url || '';
    }

    function extractId(url) {
        var patterns = [
            /[?&]v=([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/(?:shorts|embed|v)\/([a-zA-Z0-9_-]{11})/
        ];
        for (var i = 0; i < patterns.length; i++) {
            var m = url.match(patterns[i]);
            if (m) return m[1];
        }
        return null;
    }

    // ============================================================
    // ПОЛУЧЕНИЕ ПОТОКА ВИДЕО
    // ============================================================

    function getStream(data) {
        var formats  = data.formatStreams   || [];
        var adaptive = data.adaptiveFormats || [];
        var order    = ['720p', '480p', '360p', '240p', '144p', '1080p'];

        for (var q = 0; q < order.length; q++) {
            for (var i = 0; i < formats.length; i++) {
                var f = formats[i];
                if ((f.qualityLabel === order[q] || f.quality === order[q]) && f.url) {
                    console.log('[YouTube] Выбран формат:', f.qualityLabel || f.quality);
                    return f.url;
                }
            }
        }

        for (var j = 0; j < formats.length; j++) {
            if (formats[j].url) return formats[j].url;
        }

        for (var k = 0; k < adaptive.length; k++) {
            var af = adaptive[k];
            if (af.url && af.type && af.type.indexOf('video/mp4') !== -1) {
                return af.url;
            }
        }

        return '';
    }

    // ============================================================
    // ЗАГРУЗКА И ВОСПРОИЗВЕДЕНИЕ
    // ============================================================

    function loadAndPlay(videoId) {
        if (!videoId) {
            Lampa.Noty.show('Неверный ID видео');
            return;
        }

        Lampa.Noty.show('Загрузка видео...');

        var path = '/api/v1/videos/' + videoId +
            '?fields=title,author,lengthSeconds,videoThumbnails,formatStreams,adaptiveFormats,captions';

        apiGet(path, function (data) {
            var url = getStream(data);

            if (!url) {
                Lampa.Noty.show('Не удалось получить ссылку на видео');
                return;
            }

            var title     = data.title  || 'YouTube';
            var author    = data.author || '';
            var thumbnail = thumb(data.videoThumbnails);
            var duration  = data.lengthSeconds || 0;

            saveHistory({
                videoId : videoId,
                title   : title,
                author  : author,
                thumb   : thumbnail,
                dur     : duration
            });

            var subtitles = [];
            if (data.captions && Array.isArray(data.captions)) {
                subtitles = data.captions.map(function (cap) {
                    return {
                        label: cap.label || cap.languageCode || 'Sub',
                        url  : cap.url   || ''
                    };
                }).filter(function (s) { return !!s.url; });
            }

            var item = {
                title    : title,
                url      : url,
                poster   : thumbnail,
                subtitles: subtitles
            };

            try {
                if (Lampa.Timeline && Lampa.Utils) {
                    var tl = Lampa.Timeline.view(Lampa.Utils.hash('yt_' + videoId));
                    if (tl) item.timeline = tl;
                }
            } catch (e) {}

            console.log('[YouTube] Воспроизведение:', title, '| URL:', url.substring(0, 60) + '...');

            Lampa.Player.play(item);
            Lampa.Player.playlist([item]);

        }, function (err) {
            Lampa.Noty.show('Ошибка: ' + err);
        });
    }

    // ============================================================
    // ПОИСК
    // ============================================================

    function doSearch(query) {
        query = (query || '').trim();
        if (!query) return;

        if (/^https?:\/\//i.test(query)) {
            var id = extractId(query);
            if (id) {
                loadAndPlay(id);
            } else {
                Lampa.Noty.show('Некорректная ссылка на YouTube');
            }
            return;
        }

        Lampa.Noty.show('Поиск: ' + query);

        var path = '/api/v1/search?' + [
            'q='    + encodeURIComponent(query),
            'type=video',
            'fields=videoId,title,author,lengthSeconds,videoThumbnails',
            'hl=ru'
        ].join('&');

        apiGet(path, function (data) {
            var items = (Array.isArray(data) ? data : []).map(function (v) {
                var details = [];
                if (v.author)        details.push(v.author);
                if (v.lengthSeconds) details.push(toTime(v.lengthSeconds));

                return {
                    title   : v.title || 'Без названия',
                    subtitle: details.join(' · '),
                    videoId : v.videoId
                };
            }).filter(function (v) { return !!v.videoId; });

            if (!items.length) {
                Lampa.Noty.show('Ничего не найдено');
                return;
            }

            Lampa.Select.show({
                title   : 'Результаты: ' + query,
                items   : items,
                onSelect: function (item) {
                    Lampa.Select.close();
                    loadAndPlay(item.videoId);
                },
                onBack  : function () {
                    Lampa.Controller.toggle('menu');
                }
            });

        }, function (err) {
            Lampa.Noty.show('Ошибка поиска: ' + err);
        });
    }

    function askSearch() {
        Lampa.Input.edit({
            title  : 'Поиск YouTube',
            value  : '',
            free   : true,
            nosave : true
        }, doSearch);
    }

    // ============================================================
    // ИСТОРИЯ UI
    // ============================================================

    function showHistory() {
        var list = readHistory();

        if (!list.length) {
            Lampa.Noty.show('История пуста');
            return;
        }

        var items = list.map(function (v) {
            var details = [];
            if (v.author) details.push(v.author);
            if (v.dur)    details.push(toTime(v.dur));

            return {
                title   : v.title || 'YouTube',
                subtitle: details.join(' · '),
                videoId : v.videoId
            };
        });

        Lampa.Select.show({
            title   : 'История просмотра',
            items   : items,
            onSelect: function (item) {
                Lampa.Select.close();
                loadAndPlay(item.videoId);
            },
            onBack  : function () {
                showMenu();
            }
        });
    }

    // ============================================================
    // ГЛАВНОЕ МЕНЮ
    // ============================================================

    function showMenu() {
        Lampa.Select.show({
            title   : 'YouTube',
            items   : [
                { title: 'Поиск видео',       value: 'search'  },
                { title: 'История просмотра', value: 'history' },
                { title: 'Очистить историю',  value: 'clear'   },
                { title: 'О плагине',         value: 'about'   }
            ],
            onSelect: function (item) {
                Lampa.Select.close();
                if      (item.value === 'search')  askSearch();
                else if (item.value === 'history') showHistory();
                else if (item.value === 'clear')   clearHistory();
                else if (item.value === 'about') {
                    Lampa.Noty.show('YouTube плагин v5.0 — Invidious + мульти-прокси');
                }
            },
            onBack  : function () {
                Lampa.Controller.toggle('menu');
            }
        });
    }

    // ============================================================
    // КНОПКА В БОКОВОМ МЕНЮ
    // ============================================================

    function addButton() {
        if ($('.menu .menu__list [data-action="ytdl"]').length) return;

        var btn = $([
            '<li class="menu__item selector" data-action="ytdl">',
            '<div class="menu__ico">', ICON, '</div>',
            '<div class="menu__text">YouTube</div>',
            '</li>'
        ].join(''));

        btn.on('hover:enter', showMenu);
        $('.menu .menu__list').eq(0).append(btn);
    }

    // ============================================================
    // ГЛОБАЛЬНЫЙ ПОИСК LAMPA
    // ============================================================

    function registerSearch(attempt) {
        attempt = attempt || 0;
        if (window._yt_search_ok) return;

        if (!Lampa.Search || typeof Lampa.Search.addSource !== 'function') {
            if (attempt < 40) {
                setTimeout(function () { registerSearch(attempt + 1); }, 500);
            }
            return;
        }

        window._yt_search_ok = true;

        Lampa.Search.addSource({
            title : 'YouTube',
            search: function (params, done) {
                var q = params && params.query ? String(params.query).trim() : '';
                if (q.length < 2) { done([]); return; }

                var path = '/api/v1/search?' + [
                    'q='    + encodeURIComponent(q),
                    'type=video',
                    'fields=videoId,title,author,videoThumbnails',
                    'hl=ru'
                ].join('&');

                apiGet(path, function (data) {
                    var cards = (Array.isArray(data) ? data : []).slice(0, 20).map(function (v) {
                        var t = thumb(v.videoThumbnails);
                        return {
                            id            : v.videoId,
                            title         : v.title || 'Без названия',
                            original_title: v.title || '',
                            release_date  : '',
                            img           : t,
                            poster        : t,
                            source        : 'youtube',
                            videoId       : v.videoId,
                            author        : v.author || ''
                        };
                    });

                    done(cards.length ? [{
                        title  : 'YouTube',
                        results: cards
                    }] : []);

                }, function () { done([]); });
            },
            onCancel: function () {},
            params  : {
                lazy      : false,
                align_left: true,
                object    : { source: 'youtube' }
            },
            onSelect: function (params, close) {
                var el = params && params.element ? params.element : params;
                if (!el || !el.videoId) return;
                if (typeof close === 'function') close();
                loadAndPlay(el.videoId);
            }
        });
    }

    // ============================================================
    // СТАРТ
    // ============================================================

    function activate() {
        setTimeout(addButton, 800);
        registerSearch();
        console.log('[YouTube] плагин v5.0 запущен');
    }

    if (window.appready) {
        activate();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') activate();
        });
    }

})();