(function () {
    'use strict';

    if (window.ytdl_plugin_ready || typeof Lampa === 'undefined') return;
    window.ytdl_plugin_ready = true;

    // Публичные Invidious серверы (работают без развертывания!)
    var INVIDIOUS_INSTANCES = [
        'https://invidious.io',
        'https://vid.puffyan.us',
        'https://yewtu.be',
        'https://invidious.snopyta.org',
        'https://invidious.kavin.rocks',
        'https://inv.riverside.rocks',
        'https://invidious.tiekoetter.com'
    ];

    var currentInstance = 0;
    var HISTORY_KEY = 'ytdl_history_v2';
    var HISTORY_LIMIT = 30;
    var loadingActive = false;

    var ICON = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" stroke-width="1.8"/>' +
        '<path d="M10 9l5 3-5 3V9z" fill="currentColor"/>' +
        '</svg>';

    function getCurrentHost() {
        return INVIDIOUS_INSTANCES[currentInstance];
    }

    function nextInstance() {
        currentInstance = (currentInstance + 1) % INVIDIOUS_INSTANCES.length;
        console.log('[YouTube] Переключение на сервер:', getCurrentHost());
    }

    function invidiousRequest(path, success, failure, retries) {
        retries = retries || 0;
        var url = getCurrentHost() + path;

        var network = new Lampa.Reguest();
        network.timeout(15000);
        
        network.native(url, function(response) {
            try {
                var data = typeof response === 'string' ? JSON.parse(response) : response;
                success(data);
            } catch (e) {
                failure('Ошибка парсинга ответа');
            }
        }, function(error) {
            console.error('[YouTube] Ошибка запроса к', getCurrentHost(), error);
            
            if (retries < 2) {
                nextInstance();
                setTimeout(function() {
                    invidiousRequest(path, success, failure, retries + 1);
                }, 500);
            } else {
                failure('Все серверы недоступны. Попробуйте позже.');
            }
        });

        return network;
    }

    function loadingStart(message) {
        if (loadingActive) return;
        loadingActive = true;
        try {
            Lampa.Loading.start(function () { loadingStop(); }, message || 'Завантаження...');
        } catch (error) {
            loadingActive = false;
        }
    }

    function loadingStop() {
        if (!loadingActive) return;
        loadingActive = false;
        try {
            Lampa.Loading.stop();
        } catch (error) {}
    }

    function readHistory() {
        var history = Lampa.Storage.get(HISTORY_KEY, []);
        return Array.isArray(history) ? history : [];
    }

    function saveHistory(item) {
        var history = readHistory().filter(function (old) {
            return old && old.videoId !== item.videoId;
        });
        history.unshift(item);
        Lampa.Storage.set(HISTORY_KEY, history.slice(0, HISTORY_LIMIT));
    }

    function secondsToText(seconds) {
        seconds = parseInt(seconds || 0, 10);
        if (!seconds) return '';
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var rest = seconds % 60;
        var pad2 = function (value) { return value < 10 ? '0' + value : String(value); };
        return (hours ? hours + ':' + pad2(minutes) : minutes) + ':' + pad2(rest);
    }

    function extractVideoId(url) {
        var patterns = [
            /[?&]v=([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/(?:shorts|embed)\/([a-zA-Z0-9_-]{11})/
        ];

        for (var i = 0; i < patterns.length; i++) {
            var match = url.match(patterns[i]);
            if (match) return match[1];
        }
        return null;
    }

    function timelineForUrl(videoId) {
        if (!Lampa.Timeline || !Lampa.Utils) return null;
        var key = 'yt_' + videoId;
        return Lampa.Timeline.view(Lampa.Utils.hash(key));
    }

    function searchVideos(query, callback) {
        loadingStart('Пошук відео...');
        
        var path = '/api/v1/search?q=' + encodeURIComponent(query) + '&type=video&fields=videoId,title,author,lengthSeconds,videoThumbnails';
        
        invidiousRequest(path, function(data) {
            loadingStop();
            
            var items = (Array.isArray(data) ? data : []).map(function(item) {
                var thumbnail = '';
                if (item.videoThumbnails && item.videoThumbnails.length > 0) {
                    thumbnail = item.videoThumbnails[0].url;
                }
                
                return {
                    videoId: item.videoId,
                    title: item.title || 'Без назви',
                    author: item.author || '',
                    duration: item.lengthSeconds || 0,
                    thumbnail: thumbnail,
                    url: 'https://www.youtube.com/watch?v=' + item.videoId
                };
            });
            
            callback(items);
        }, function(error) {
            loadingStop();
            Lampa.Noty.show(error);
            callback([]);
        });
    }

    function getVideoInfo(videoId, callback) {
        loadingStart('Завантаження відео...');
        
        var path = '/api/v1/videos/' + videoId;
        
        invidiousRequest(path, function(data) {
            loadingStop();
            
            // Находим stream URL
            var streamUrl = '';
            var formats = data.formatStreams || [];
            
            // Ищем формат 360p или берем первый доступный
            var format360 = formats.find(function(f) { 
                return f.qualityLabel === '360p' || f.quality === 'medium'; 
            });
            
            if (format360 && format360.url) {
                streamUrl = format360.url;
            } else if (formats.length > 0 && formats[0].url) {
                streamUrl = formats[0].url;
            }
            
            // Субтитры
            var subtitles = [];
            if (data.captions && Array.isArray(data.captions)) {
                subtitles = data.captions.map(function(cap) {
                    return {
                        label: cap.label || cap.languageCode || 'Unknown',
                        url: cap.url || ''
                    };
                });
            }
            
            var thumbnail = '';
            if (data.videoThumbnails && data.videoThumbnails.length > 0) {
                thumbnail = data.videoThumbnails[0].url;
            }
            
            callback({
                videoId: videoId,
                title: data.title || 'YouTube',
                author: data.author || '',
                streamUrl: streamUrl,
                thumbnail: thumbnail,
                duration: data.lengthSeconds || 0,
                subtitles: subtitles,
                description: data.description || ''
            });
            
        }, function(error) {
            loadingStop();
            Lampa.Noty.show(error);
        });
    }

    function playVideo(videoId, title) {
        getVideoInfo(videoId, function(video) {
            if (!video.streamUrl) {
                Lampa.Noty.show('Не вдалося отримати посилання на відео');
                return;
            }
            
            // Сохраняем в историю
            saveHistory({
                videoId: video.videoId,
                title: video.title,
                author: video.author,
                thumbnail: video.thumbnail,
                duration: video.duration
            });
            
            // Подготовка для плеера
            var playerData = {
                title: video.title,
                url: video.streamUrl,
                subtitles: video.subtitles || []
            };
            
            // Timeline
            var timeline = timelineForUrl(video.videoId);
            if (timeline) playerData.timeline = timeline;
            
            // Запуск плеера
            Lampa.Player.play(playerData);
            Lampa.Player.playlist([playerData]);
        });
    }

    function showResults(items, title) {
        if (!items || items.length === 0) {
            Lampa.Noty.show('Нічого не знайдено');
            return;
        }

        var formattedItems = items.map(function(item) {
            var details = [];
            if (item.author) details.push(item.author);
            if (item.duration) details.push(secondsToText(item.duration));
            
            return {
                title: item.title,
                subtitle: details.join(' • '),
                videoId: item.videoId,
                url: item.url
            };
        });

        Lampa.Select.show({
            title: title || 'YouTube',
            items: formattedItems,
            onSelect: function (item) {
                Lampa.Select.close();
                playVideo(item.videoId, item.title);
            },
            onBack: function () {
                Lampa.Controller.toggle('menu');
            }
        });
    }

    function search(query) {
        query = (query || '').trim();
        if (!query) return;

        // Если это прямая ссылка на видео
        if (/^https?:\/\//i.test(query)) {
            var videoId = extractVideoId(query);
            if (videoId) {
                playVideo(videoId, 'YouTube');
            } else {
                Lampa.Noty.show('Некоректне посилання');
            }
            return;
        }

        // Поиск
        searchVideos(query, function(items) {
            showResults(items, 'Результати: ' + query);
        });
    }

    function askSearch() {
        Lampa.Input.edit({
            title: 'Пошук YouTube',
            value: '',
            free: true,
            nosave: true
        }, search);
    }

    function showHistory() {
        var history = readHistory();
        if (history.length === 0) {
            Lampa.Noty.show('Історія порожня');
            return;
        }

        var items = history.map(function(item) {
            var details = [];
            if (item.author) details.push(item.author);
            if (item.duration) details.push(secondsToText(item.duration));
            
            return {
                title: item.title || 'YouTube',
                subtitle: details.join(' • '),
                videoId: item.videoId
            };
        });

        Lampa.Select.show({
            title: 'Історія YouTube',
            items: items,
            onSelect: function (item) {
                Lampa.Select.close();
                playVideo(item.videoId, item.title);
            },
            onBack: function () {
                Lampa.Controller.toggle('menu');
            }
        });
    }

    function clearHistory() {
        Lampa.Storage.set(HISTORY_KEY, []);
        Lampa.Noty.show('Історія очищена');
    }

    function showMenu() {
        Lampa.Select.show({
            title: 'YouTube',
            items: [
                { title: '🔍 Пошук', value: 'search' },
                { title: '📺 Історія', value: 'history' },
                { title: '🗑️ Очистити історію', value: 'clear' },
                { title: 'ℹ️ Про плагін', value: 'about' }
            ],
            onSelect: function(item) {
                Lampa.Select.close();
                
                if (item.value === 'search') {
                    askSearch();
                } else if (item.value === 'history') {
                    showHistory();
                } else if (item.value === 'clear') {
                    clearHistory();
                } else if (item.value === 'about') {
                    Lampa.Noty.show('YouTube плагін v2.0 - Безкоштовно через Invidious');
                }
            },
            onBack: function() {
                Lampa.Controller.toggle('menu');
            }
        });
    }

    function addMenu() {
        if ($('.menu .menu__list [data-action="ytdl"]').length) return;

        var button = $('<li class="menu__item selector" data-action="ytdl">' +
            '<div class="menu__ico">' + ICON + '</div>' +
            '<div class="menu__text">YouTube</div>' +
            '</li>');

        button.on('hover:enter', showMenu);

        $('.menu .menu__list').eq(0).append(button);
    }

    function registerGlobalSearch(attempt) {
        attempt = attempt || 0;
        if (window.ytdl_global_search_ready) return;
        if (!Lampa.Search || typeof Lampa.Search.addSource !== 'function') {
            if (attempt < 20) setTimeout(function () { registerGlobalSearch(attempt + 1); }, 500);
            return;
        }

        window.ytdl_global_search_ready = true;
        
        var searchRequest = null;
        
        Lampa.Search.addSource({
            title: 'YouTube',
            search: function (params, oncomplete) {
                var query = params && params.query ? String(params.query).trim() : '';
                
                if (searchRequest && searchRequest.clear) searchRequest.clear();
                
                if (query.length < 2) {
                    oncomplete([]);
                    return;
                }

                var path = '/api/v1/search?q=' + encodeURIComponent(query) + '&type=video&fields=videoId,title,author,videoThumbnails';
                
                searchRequest = invidiousRequest(path, function(data) {
                    var cards = (Array.isArray(data) ? data : []).slice(0, 20).map(function(item, index) {
                        var thumbnail = '';
                        if (item.videoThumbnails && item.videoThumbnails.length > 0) {
                            thumbnail = item.videoThumbnails[0].url;
                        }
                        
                        return {
                            id: item.videoId || ('yt-' + index),
                            title: item.title || 'Без назви',
                            original_title: item.title || '',
                            release_date: '',
                            img: thumbnail,
                            poster: thumbnail,
                            source: 'youtube',
                            videoId: item.videoId,
                            author: item.author || ''
                        };
                    });
                    
                    oncomplete(cards.length ? [{
                        title: 'YouTube: ' + query,
                        results: cards
                    }] : []);
                }, function() {
                    oncomplete([]);
                });
            },
            onCancel: function () {
                if (searchRequest && searchRequest.clear) searchRequest.clear();
            },
            params: {
                lazy: false,
                align_left: true,
                object: { source: 'youtube' }
            },
            onSelect: function (params, close) {
                var element = params && params.element ? params.element : params;
                if (!element || !element.videoId) return;
                if (typeof close === 'function') close();
                playVideo(element.videoId, element.title);
            }
        });
    }

    function activate() {
        setTimeout(addMenu, 500);
        registerGlobalSearch();
        console.log('[YouTube] Плагін завантажено v2.0 - Прямий доступ через Invidious');
        Lampa.Noty.show('YouTube плагін готовий до роботи!');
    }

    if (window.appready) activate();
    else Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') activate();
    });
})();
