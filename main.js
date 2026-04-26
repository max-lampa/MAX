(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // ============================================================
    //  ГЛАВНАЯ RU — чистая русскоязычная версия плагина для Lampa
    // ============================================================

    var CONFIG = {
        tmdbApiKey: '',
        cacheTime: 23 * 60 * 60 * 1000,
        language: 'ru',
        endpoint: 'https://wh.lme.isroot.in/',
        timeout: 10000,
        queue: { maxParallel: 10 },
        cache: {
            key: 'ru_main_wh_cache_v1',
            size: 3000,
            positiveTtl: 1000 * 60 * 60 * 24,
            negativeTtl: 1000 * 60 * 60 * 6
        }
    };

    var PROXIES = [
        'https://cors.lampa.stream/',
        'https://cors.eu.org/',
        'https://corsproxy.io/?url='
    ];

    var DEFAULT_ROWS_SETTINGS = [
        { id: 'ru_row_history',     title: 'История просмотра',       defOrder: '1', default: true },
        { id: 'ru_row_movies_new',  title: 'Новинки фильмов',          defOrder: '2', default: true },
        { id: 'ru_row_series_new',  title: 'Новинки сериалов',         defOrder: '3', default: true },
        { id: 'ru_row_collections', title: 'Подборки',                 defOrder: '4', default: true },
        { id: 'ru_row_kinobaza',    title: 'Новинки стримингов',       defOrder: '5', default: true },
        { id: 'ru_row_community',   title: 'Скрытые жемчужины',        defOrder: '6', default: true },
        { id: 'ru_row_movies_pop',  title: 'Популярные фильмы',        defOrder: '7', default: true },
        { id: 'ru_row_series_pop',  title: 'Популярные сериалы',       defOrder: '8', default: true },
        { id: 'ru_row_random',      title: 'Случайные фильмы',         defOrder: '9', default: true }
    ];

    var listCache = {};
    var tmdbItemCache = {};
    var itemUrlCache = {};
    var seasonsCache = {};

    Lampa.Lang.add({
        main:       'Главная RU',
        title_main: 'Главная RU',
        title_tmdb: 'Главная RU'
    });

    // ----------------------------------------------------------------
    //  Безопасное хранилище
    // ----------------------------------------------------------------
    var safeStorage = (function () {
        var memoryStore = {};
        try {
            if (typeof window.localStorage !== 'undefined') {
                var testKey = '__ru_main_test__';
                window.localStorage.setItem(testKey, '1');
                window.localStorage.removeItem(testKey);
                return window.localStorage;
            }
        } catch (e) {}
        return {
            getItem: function (k) { return Object.prototype.hasOwnProperty.call(memoryStore, k) ? memoryStore[k] : null; },
            setItem: function (k, v) { memoryStore[k] = String(v); },
            removeItem: function (k) { delete memoryStore[k]; }
        };
    })();

    try { seasonsCache = JSON.parse(safeStorage.getItem('ru_main_season_cache') || '{}'); } catch (e) {}

    // ----------------------------------------------------------------
    //  Утилиты
    // ----------------------------------------------------------------
    function debounce(func, wait) {
        var timer;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () { func.apply(context, args); }, wait);
        };
    }

    function Cache(config) {
        var self = this;
        var storage = {};

        function cleanupExpired() {
            var now = Date.now(), changed = false, keys = Object.keys(storage);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i], node = storage[key];
                if (!node || !node.timestamp || typeof node.value !== 'boolean') {
                    delete storage[key]; changed = true; continue;
                }
                var ttl = node.value ? config.positiveTtl : config.negativeTtl;
                if (node.timestamp <= now - ttl) { delete storage[key]; changed = true; }
            }
            if (changed) self.save();
        }

        self.save = debounce(function () { Lampa.Storage.set(config.key, storage); }, 400);

        self.init = function () {
            storage = Lampa.Storage.get(config.key, {}) || {};
            cleanupExpired();
        };

        self.get = function (id) {
            var node = storage[id];
            if (!node || !node.timestamp || typeof node.value !== 'boolean') return null;
            var ttl = node.value ? config.positiveTtl : config.negativeTtl;
            if (node.timestamp > Date.now() - ttl) return node.value;
            delete storage[id]; self.save(); return null;
        };

        self.set = function (id, value) {
            cleanupExpired();
            storage[id] = { timestamp: Date.now(), value: !!value };
            self.save();
        };
    }

    // ----------------------------------------------------------------
    //  Менеджер фонового изображения
    // ----------------------------------------------------------------
    var BgManager = {
        container: null,
        layer1: null,
        layer2: null,
        currentLayer: 1,
        activeUrl: '',
        timer: null,

        init: function () {
            if (this.container) return;
            this.container = document.createElement('div');
            this.container.id = 'ru-bg-container';

            this.layer1 = document.createElement('div');
            this.layer1.className = 'ru-bg-layer active';
            this.layer2 = document.createElement('div');
            this.layer2.className = 'ru-bg-layer';

            this.container.appendChild(this.layer1);
            this.container.appendChild(this.layer2);
            document.body.appendChild(this.container);
        },

        change: function (url, instant) {
            if (!url || this.activeUrl === url) return;

            clearTimeout(this.timer);
            var _this = this;

            var execute = function () {
                _this.activeUrl = url;
                var nextLayer   = _this.currentLayer === 1 ? _this.layer2 : _this.layer1;
                var activeLayer = _this.currentLayer === 1 ? _this.layer1 : _this.layer2;

                nextLayer.style.backgroundImage = 'url(' + url + ')';
                nextLayer.classList.add('active');
                activeLayer.classList.remove('active');

                _this.currentLayer = _this.currentLayer === 1 ? 2 : 1;
            };

            if (instant) execute();
            else this.timer = setTimeout(execute, 0);
        },

        hide: function () { if (this.container) this.container.style.display = 'none'; },
        show: function () { if (this.container) this.container.style.display = 'block'; }
    };

    // ----------------------------------------------------------------
    //  Очередь сетевых запросов
    // ----------------------------------------------------------------
    var requestQueue = {
        activeCount: 0,
        queue: [],
        maxParallel: CONFIG.queue.maxParallel,

        add: function (task) { this.queue.push(task); this.process(); },

        process: function () {
            var _this = this;
            while (this.activeCount < this.maxParallel && this.queue.length) {
                var task = this.queue.shift();
                this.activeCount++;
                Promise.resolve()
                    .then(task)
                    .catch(function () {})
                    .finally(function () { _this.activeCount--; _this.process(); });
            }
        }
    };

    // ----------------------------------------------------------------
    //  HTTP-помощники
    // ----------------------------------------------------------------
    async function fetchHtml(url) {
        for (var i = 0; i < PROXIES.length; i++) {
            var proxy = PROXIES[i];
            try {
                var proxyUrl = proxy.indexOf('?url=') !== -1 ? proxy + encodeURIComponent(url) : proxy + url;
                var res = await fetch(proxyUrl);
                if (res.ok) {
                    var text = await res.text();
                    if (text && text.length > 500 && text.indexOf('<html') !== -1 && text.indexOf('just a moment...') === -1) {
                        return text;
                    }
                }
            } catch (e) {}
        }
        return '';
    }

    function getTmdbKey() {
        var custom = (Lampa.Storage.get('ru_main_tmdb_apikey') || '').trim();
        return custom || CONFIG.tmdbApiKey || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96');
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

    function safeFetch(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve({
                            ok: true,
                            json: function () { return Promise.resolve(JSON.parse(xhr.responseText)); }
                        });
                    } else {
                        reject(new Error('HTTP ' + xhr.status));
                    }
                }
            };
            xhr.onerror = function () { reject(new Error('Сетевая ошибка')); };
            xhr.send(null);
        });
    }

    function fetchCommunityWatches(url) {
        return new Promise(function (resolve, reject) {
            if (window.Lampa && Lampa.Network) {
                Lampa.Network.silent(url, resolve, reject);
            } else {
                safeFetch(url).then(function (r) { return r.json(); }).then(resolve).catch(reject);
            }
        });
    }

    async function fetchTmdbWithFallback(type, id) {
        var endpoint = getTmdbEndpoint(type + '/' + id + '?language=ru');
        var res = await fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); }).catch(function () { return null; });

        if (res && (!res.overview || res.overview.trim() === '')) {
            var enEndpoint = getTmdbEndpoint(type + '/' + id + '?language=en');
            var enRes = await fetch(PROXIES[0] + enEndpoint).then(function (r) { return r.json(); }).catch(function () { return null; });
            if (enRes && enRes.overview) res.overview = enRes.overview;
        }
        return res;
    }

    // ----------------------------------------------------------------
    //  Информация о сериалах (для бейджа сезона)
    // ----------------------------------------------------------------
    function fetchSeriesData(tmdbId) {
        return new Promise(function (resolve, reject) {
            var now = (new Date()).getTime();
            if (seasonsCache[tmdbId] && (now - seasonsCache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(seasonsCache[tmdbId].data);
            }

            if (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.tv === 'function') {
                Lampa.TMDB.tv(tmdbId, function (data) {
                    seasonsCache[tmdbId] = { data: data, timestamp: now };
                    try { safeStorage.setItem('ru_main_season_cache', JSON.stringify(seasonsCache)); } catch (e) {}
                    resolve(data);
                }, reject, { language: CONFIG.language });
            } else {
                var url = 'https://api.themoviedb.org/3/tv/' + tmdbId + '?api_key=' + getTmdbKey() + '&language=' + CONFIG.language;
                safeFetch(url).then(function (r) { return r.json(); }).then(function (data) {
                    seasonsCache[tmdbId] = { data: data, timestamp: now };
                    try { safeStorage.setItem('ru_main_season_cache', JSON.stringify(seasonsCache)); } catch (e) {}
                    resolve(data);
                }).catch(reject);
            }
        });
    }

    function renderSeasonBadge(cardHtml, tmdbData, targetContainer) {
        if (!tmdbData || !tmdbData.last_episode_to_air) return;
        var last = tmdbData.last_episode_to_air;
        var currentSeason = (tmdbData.seasons || []).filter(function (s) {
            return s.season_number === last.season_number;
        })[0];

        if (currentSeason && last.season_number > 0) {
            var isComplete = currentSeason.episode_count > 0 && last.episode_number >= currentSeason.episode_count;
            var text = isComplete
                ? 'S' + last.season_number
                : 'S' + last.season_number + ' ' + last.episode_number + '/' + currentSeason.episode_count;

            var view = cardHtml.querySelector('.card__view');
            if (!view) return;
            var finalContainer = view.querySelector('.card-left-badges') || targetContainer || view;

            var typeBadge = cardHtml.querySelector('.card__type');
            if (!typeBadge) {
                typeBadge = document.createElement('div');
                typeBadge.className = 'card__type';
                finalContainer.appendChild(typeBadge);
            } else if (typeBadge.parentNode !== finalContainer) {
                finalContainer.appendChild(typeBadge);
            }

            typeBadge.innerHTML = text;
            typeBadge.classList.add('card__type--season');

            if (Lampa.Storage.get('ru_alt_design_enable') !== true) {
                typeBadge.style.backgroundColor = isComplete ? 'rgba(46, 204, 113, 0.8)' : 'rgba(170, 20, 20, 0.8)';
            } else {
                typeBadge.style.backgroundColor = '';
            }

            typeBadge.style.display = 'flex';
        }
    }

    function getColor(rating, alpha) {
        var rgb = '';
        if      (rating >= 0   && rating <= 3)  rgb = '231, 76, 60';
        else if (rating > 3    && rating <= 5)  rgb = '230, 126, 34';
        else if (rating > 5    && rating <= 6.5) rgb = '241, 196, 15';
        else if (rating > 6.5  && rating < 8)   rgb = '52, 152, 219';
        else if (rating >= 8   && rating <= 10) rgb = '46, 204, 113';
        return rgb ? 'rgba(' + rgb + ', ' + alpha + ')' : null;
    }

    // ----------------------------------------------------------------
    //  Парсинг внешних источников
    // ----------------------------------------------------------------
    function extractItemLinks(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var links = [];
        doc.querySelectorAll('a[href]').forEach(function (a) {
            var href = a.getAttribute('href');
            if (href && href.match(/\/\d+-[^/]+\.html$/) && href.indexOf('#') === -1) {
                var fullUrl = href.indexOf('http') === 0 ? href : 'https://uaserials.com' + href;
                if (links.indexOf(fullUrl) === -1) links.push(fullUrl);
            }
        });
        return links;
    }

    function extractCollections(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var results = [];
        var seen = {};

        doc.querySelectorAll('a[href*="/collections/"]').forEach(function (a) {
            var href = a.getAttribute('href');
            if (href && href.match(/\/collections\/\d+/) && href.indexOf('/page/') === -1) {
                var fullUrl = href.indexOf('http') === 0 ? href : 'https://uaserials.com' + href;

                var title = '';
                var img = a.querySelector('img');
                if (img) title = img.getAttribute('alt') || '';
                if (!title) title = a.textContent.trim();

                if (!title) {
                    var parent = a.closest('.short, .collection-item, article');
                    if (parent) {
                        var titleEl = parent.querySelector('.short-title, .title, .name, h2, h3, .collection-title');
                        if (titleEl) title = titleEl.textContent.trim();
                    }
                }

                title = title.replace(/[\n\r]+/g, ' ').replace(/\s*\d+\s*$/, '').trim();

                if (title && title.length > 2 && !seen[fullUrl]) {
                    seen[fullUrl] = true;
                    results.push({ title: title, url: fullUrl });
                }
            }
        });
        return results;
    }

    function extractKinobazaItems(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var results = [];
        var seen = {};

        doc.querySelectorAll('h4.text-muted.h6.d-inline-block').forEach(function (h4) {
            var enTitle = h4.textContent.trim();
            var parent = h4.parentElement;
            var small = null;
            var container = parent;

            for (var i = 0; i < 5; i++) {
                if (!container || container.tagName === 'BODY') break;
                small = container.querySelector('small.text-muted');
                if (small && small.textContent.match(/\(\d{4}\)/)) break;
                small = null;
                container = container.parentElement;
            }
            var yearMatch = small ? small.textContent.match(/\((\d{4})\)/) : null;
            var year = yearMatch ? yearMatch[1] : null;

            var searchContext = container ? container.textContent : (parent ? parent.textContent : '');
            var isTv = /Серіал|сезон|епізод|Мінісеріал|Сериал|серия|сезон/i.test(searchContext);
            var expectedType = isTv ? 'tv' : 'movie';

            var key = enTitle + year + expectedType;
            if (enTitle && year && !seen[key]) {
                seen[key] = true;
                results.push({ title: enTitle, year: year, type: expectedType });
            }
        });

        if (results.length === 0) {
            doc.querySelectorAll('a[href^="/titles/"]').forEach(function (a) {
                var title = a.textContent.trim();
                if (title.length > 1) {
                    var year = null;
                    var parent = a.parentElement;
                    var container = parent;
                    for (var i = 0; i < 4; i++) {
                        if (!container || container.tagName === 'BODY') break;
                        var text = container.textContent;
                        var ym = text.match(/(?:^|\s|\()((?:19|20)\d{2})(?:\)|\s|$)/);
                        if (ym) { year = ym[1]; break; }
                        container = container.parentElement;
                    }

                    if (!year) {
                        var hrefMatch = a.getAttribute('href').match(/(?:19|20)\d{2}/);
                        if (hrefMatch) year = hrefMatch[0];
                    }

                    var searchContext = container ? container.textContent : (parent ? parent.textContent : '');
                    var isTv = /Серіал|сезон|епізод|Мінісеріал|Сериал|серия|сезон/i.test(searchContext);
                    var expectedType = isTv ? 'tv' : 'movie';

                    if (year) {
                        var key = title + year + expectedType;
                        if (!seen[key]) {
                            seen[key] = true;
                            results.push({ title: title, year: year, type: expectedType });
                        }
                    }
                }
            });
        }

        return results;
    }

    async function getImdbId(url) {
        if (itemUrlCache[url]) return itemUrlCache[url];
        var html = await fetchHtml(url);
        var match = html.match(/imdb\.com\/title\/(tt\d+)/i);
        var id = match ? match[1] : null;
        if (id) itemUrlCache[url] = id;
        return id;
    }

    async function processInQueue(items, processFn, concurrency) {
        if (!concurrency) concurrency = 5;
        var results = new Array(items.length);
        var index = 0;

        async function worker() {
            while (index < items.length) {
                var currentIndex = index++;
                try {
                    var res = await processFn(items[currentIndex]);
                    if (res) results[currentIndex] = res;
                } catch (e) {}
            }
        }

        var workers = [];
        for (var i = 0; i < concurrency; i++) workers.push(worker());
        await Promise.all(workers);
        return results.filter(Boolean);
    }

    async function processSingleItem(url) {
        var imdb = await getImdbId(url);
        if (!imdb) return null;
        if (tmdbItemCache[imdb]) return tmdbItemCache[imdb];

        var endpoint = getTmdbEndpoint('find/' + imdb + '?external_source=imdb_id&language=ru');
        try {
            var data = await fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); });
            var res = null;
            if (data.movie_results && data.movie_results.length > 0) { res = data.movie_results[0]; res.media_type = 'movie'; }
            else if (data.tv_results && data.tv_results.length > 0)  { res = data.tv_results[0];    res.media_type = 'tv'; }

            if (res && (!res.overview || res.overview.trim() === '')) {
                var enEndpoint = getTmdbEndpoint('find/' + imdb + '?external_source=imdb_id&language=en');
                var enData = await fetch(PROXIES[0] + enEndpoint).then(function (r) { return r.json(); });
                var enRes = (enData.movie_results && enData.movie_results.length > 0)
                    ? enData.movie_results[0]
                    : (enData.tv_results && enData.tv_results.length > 0 ? enData.tv_results[0] : null);
                if (enRes && enRes.overview) res.overview = enRes.overview;
            }

            if (res) tmdbItemCache[imdb] = res;
            return res;
        } catch (e) { return null; }
    }

    async function searchTmdbByTitleAndYear(title, year, expectedType) {
        var cacheKey = 'kinobaza_search_' + title + '_' + year + '_' + (expectedType || 'any');
        if (tmdbItemCache[cacheKey]) return tmdbItemCache[cacheKey];

        var endpointsToTry = [];
        if (expectedType === 'tv')         endpointsToTry.push('search/tv', 'search/multi');
        else if (expectedType === 'movie') endpointsToTry.push('search/movie', 'search/multi');
        else                                endpointsToTry.push('search/multi');

        for (var i = 0; i < endpointsToTry.length; i++) {
            var path = endpointsToTry[i];
            var endpoint = getTmdbEndpoint(path + '?query=' + encodeURIComponent(title) + '&language=ru');
            try {
                var data = await fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); });
                if (data && data.results && data.results.length > 0) {
                    var res = data.results.find(function (r) {
                        if (expectedType && r.media_type && r.media_type !== expectedType && path === 'search/multi') return false;
                        var rYear = (r.release_date || r.first_air_date || '').substring(0, 4);
                        return rYear === year || rYear === (parseInt(year) - 1).toString() || rYear === (parseInt(year) + 1).toString();
                    });

                    if (!res) {
                        res = data.results.find(function (r) {
                            if (expectedType && r.media_type && r.media_type !== expectedType && path === 'search/multi') return false;
                            var t1 = (r.original_title || r.original_name || '').toLowerCase();
                            var t2 = title.toLowerCase();
                            return t1 === t2;
                        });
                    }

                    if (res) {
                        if (!res.overview || res.overview.trim() === '') {
                            var enEndpoint = getTmdbEndpoint(path + '?query=' + encodeURIComponent(title) + '&language=en');
                            var enData = await fetch(PROXIES[0] + enEndpoint).then(function (r) { return r.json(); });
                            var enRes = (enData.results || []).find(function (r) { return r.id === res.id; });
                            if (enRes && enRes.overview) res.overview = enRes.overview;
                        }
                        if (!res.media_type) res.media_type = expectedType || (res.first_air_date ? 'tv' : 'movie');
                        tmdbItemCache[cacheKey] = res;
                        return res;
                    }
                }
            } catch (e) {}
        }
        return null;
    }

    async function fetchCatalogPage(url, limit) {
        if (!limit) limit = 15;
        if (listCache[url]) return listCache[url];
        var listHtml = await fetchHtml(url);
        var links = extractItemLinks(listHtml).slice(0, limit);
        var tmdbItems = await processInQueue(links, processSingleItem, 5);

        var unique = {};
        var finalItems = tmdbItems.filter(function (item) {
            if (!item || !item.id || !item.backdrop_path) return false;
            if (unique[item.id]) return false;
            unique[item.id] = true;
            return true;
        });

        if (finalItems.length > 0) listCache[url] = finalItems;
        return finalItems;
    }

    async function fetchKinobazaCatalog(url, limit, noCache) {
        if (!noCache && listCache[url]) return listCache[url];
        var html = await fetchHtml(url);
        var items = extractKinobazaItems(html);

        var tmdbItems = await processInQueue(items, async function (item) {
            return await searchTmdbByTitleAndYear(item.title, item.year, item.type);
        }, 5);

        var unique = {};
        var finalItems = tmdbItems.filter(function (item) {
            if (!item || !item.id || !item.backdrop_path) return false;
            if (unique[item.id]) return false;
            unique[item.id] = true;
            return true;
        });

        if (limit) finalItems = finalItems.slice(0, limit);
        if (!noCache && finalItems.length > 0) listCache[url] = finalItems;
        return finalItems;
    }

    async function getLmeTmdbItems(items) {
        var promises = items.map(async function (item) {
            if (!item) return null;

            var type, id;
            if (item.id && typeof item.id === 'string' && item.id.indexOf(':') !== -1) {
                var parts = item.id.split(':');
                type = parts[0];
                id = parts[1];
            } else if (item.source_id && item.type) {
                type = item.type;
                id = item.source_id;
            } else if (item.id && (item.media_type || item.type)) {
                type = item.media_type || item.type;
                id = item.id;
            } else {
                return null;
            }

            var tmdbData = await fetchTmdbWithFallback(type, id);
            if (tmdbData && !tmdbData.error && tmdbData.backdrop_path) {
                tmdbData.media_type = type;
                return tmdbData;
            }
            return null;
        });
        var results = await Promise.all(promises);
        return results.filter(Boolean);
    }

    // ----------------------------------------------------------------
    //  Логотипы
    // ----------------------------------------------------------------
    function fetchLogo(movie, itemElement) {
        var mType = movie.media_type || (movie.name ? 'tv' : 'movie');
        var useAltDesign = Lampa.Storage.get('ru_alt_design_enable') === true;
        var isWideCard = itemElement.hasClass('card--wide-custom') || itemElement.hasClass('card--history-custom');

        if (useAltDesign && isWideCard) {
            // В альт-режиме на главной грузим только чистый бекдроп — без логотипов
            itemElement.find('.card-custom-logo, .card-custom-logo-text, .card-api-logo-bottom').remove();
            return;
        }

        function applyTextLogo() {
            itemElement.find('.card-custom-logo').remove();
            if (itemElement.find('.card-custom-logo-text').length === 0) {
                var textLogo = document.createElement('div');
                textLogo.className = 'card-custom-logo-text';
                var txt = movie.title || movie.name;
                var langPref = Lampa.Storage.get('ru_logo_lang', 'ru_en');
                if (langPref === 'en' || langPref === 'text_en') {
                    txt = movie.original_title || movie.original_name || txt;
                }
                textLogo.innerText = txt;
                itemElement.find('.card__view').append(textLogo);
            }
        }

        function applyTmdbLogo(url) {
            if (url && url !== 'none') {
                itemElement.find('.card-custom-logo-text').remove();
                var img = itemElement.find('.card-custom-logo')[0];
                if (!img) {
                    img = document.createElement('img');
                    img.className = 'card-custom-logo';
                    itemElement.find('.card__view').append(img);
                }
                img.onload = null;
                img.onerror = function () {
                    this.style.display = 'none';
                    applyTextLogo();
                };
                img.style.display = 'block';
                img.src = url;
            } else {
                applyTextLogo();
            }
        }

        var langPref = Lampa.Storage.get('ru_logo_lang', 'ru_en');
        var quality  = Lampa.Storage.get('ru_img_quality', 'w300');

        if (langPref === 'text_ru' || langPref === 'text_en') {
            applyTextLogo();
        } else {
            var cacheKey = 'ru_logo_v1_' + quality + '_' + langPref + '_' + mType + '_' + movie.id;
            var cachedUrl = Lampa.Storage.get(cacheKey);

            if (cachedUrl) {
                applyTmdbLogo(cachedUrl);
            } else {
                var endpoint = getTmdbEndpoint(mType + '/' + movie.id + '/images?include_image_language=ru,en,null');
                fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); }).then(function (res) {
                    var finalLogo = 'none';
                    if (res.logos && res.logos.length > 0) {
                        var found = null;
                        if (langPref === 'ru')      found = res.logos.find(function (l) { return l.iso_639_1 === 'ru'; });
                        else if (langPref === 'en') found = res.logos.find(function (l) { return l.iso_639_1 === 'en'; });
                        else                         found = res.logos.find(function (l) { return l.iso_639_1 === 'ru'; })
                                                          || res.logos.find(function (l) { return l.iso_639_1 === 'en'; });

                        if (found) finalLogo = PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + found.file_path);
                    }
                    Lampa.Storage.set(cacheKey, finalLogo);
                    applyTmdbLogo(finalLogo);
                }).catch(function () {
                    Lampa.Storage.set(cacheKey, 'none');
                    applyTmdbLogo('none');
                });
            }
        }
    }

    // ----------------------------------------------------------------
    //  Карточки-кнопки
    // ----------------------------------------------------------------
    function makeTitleButtonItem(title, url, iconUrl) {
        return {
            title: title,
            is_title_btn: true,
            url: url,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', { title: title }, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--title-btn');
                        item.empty();

                        if (!url) {
                            item.removeClass('selector focusable');
                            item.addClass('card--title-btn-static');
                        }

                        var iconHtml = iconUrl ? '<img src="' + iconUrl + '" class="title-btn-icon" onerror="this.style.display=\'none\'" />' : '';
                        item.append('<div class="title-btn-text">' + iconHtml + title + '</div>');
                    },
                    onlyEnter: function () {
                        if (url) {
                            Lampa.Activity.push({
                                url: url,
                                title: title,
                                component: 'category_full',
                                page: 1,
                                source: 'ru_main_source'
                            });
                        }
                    }
                }
            }
        };
    }

    function makeCollectionButtonItem(collection) {
        return {
            title: collection.title,
            is_collection_btn: true,
            url: collection.url,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', { title: collection.title }, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--collection-btn');
                        item.empty();
                        item.append('<div class="collection-title">' + collection.title + '</div>');
                    },
                    onlyEnter: function () {
                        Lampa.Activity.push({
                            url: collection.url,
                            title: collection.title,
                            component: 'category_full',
                            page: 1,
                            source: 'ru_main_source',
                            is_ru_collection: true
                        });
                    }
                }
            }
        };
    }

    function makeFavoriteCardItem(bgUrl, fullBgUrl) {
        return {
            title: 'Избранное',
            is_title_btn: true,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', { title: 'Избранное' }, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--history-custom');
                        var view = item.find('.card__view');
                        view.empty();

                        if (bgUrl) {
                            view.css({
                                'background-image': 'url(' + bgUrl + ')',
                                'background-size': 'cover',
                                'background-position': 'center',
                                'padding-bottom': '56.25%',
                                'height': '0',
                                'position': 'relative'
                            });
                        } else {
                            view.css({
                                'background-color': 'rgba(40,40,40,0.8)',
                                'padding-bottom': '56.25%',
                                'height': '0',
                                'position': 'relative'
                            });
                        }

                        view.append('<div class="favorite-card-overlay"><div class="favorite-card-text">Избранное</div></div>');
                    },
                    onlyEnter: function () {
                        Lampa.Activity.push({
                            url: '',
                            title: 'Избранное',
                            component: 'favorite',
                            type: 'book',
                            page: 1
                        });
                    }
                }
            }
        };
    }

    function makeHistoryButtonCardItem(bgUrl, fullBgUrl) {
        return {
            title: 'История',
            is_title_btn: true,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', { title: 'История' }, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--history-custom');
                        var view = item.find('.card__view');
                        view.empty();

                        if (bgUrl) {
                            view.css({
                                'background-image': 'url(' + bgUrl + ')',
                                'background-size': 'cover',
                                'background-position': 'center',
                                'padding-bottom': '56.25%',
                                'height': '0',
                                'position': 'relative'
                            });
                        } else {
                            view.css({
                                'background-color': 'rgba(40,40,40,0.8)',
                                'padding-bottom': '56.25%',
                                'height': '0',
                                'position': 'relative'
                            });
                        }

                        view.append('<div class="favorite-card-overlay"><div class="favorite-card-text">История</div></div>');
                    },
                    onlyEnter: function () {
                        Lampa.Activity.push({
                            url: '',
                            title: 'История',
                            component: 'favorite',
                            type: 'history',
                            page: 1
                        });
                    }
                }
            }
        };
    }

    function makeHistoryCardItem(movie) {
        return {
            title: movie.title || movie.name,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', movie, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--history-custom');
                        var view = item.find('.card__view');
                        view.empty();

                        var quality = Lampa.Storage.get('ru_img_quality', 'w300');
                        var imgPath = movie.backdrop_path || movie.poster_path;
                        if (imgPath) {
                            var imgUrl = PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + imgPath);
                            view.css({
                                'background-image': 'url(' + imgUrl + ')',
                                'background-size': 'cover',
                                'background-position': 'center',
                                'padding-bottom': '56.25%',
                                'height': '0',
                                'position': 'relative'
                            });
                        }

                        var fullBgUrl = imgPath ? PROXIES[0] + Lampa.TMDB.image('t/p/w1280' + imgPath) : '';
                        var updateBg = function () { if (fullBgUrl) BgManager.change(fullBgUrl); };
                        item.on('hover:focus', updateBg);
                        item.on('mouseenter', updateBg);
                    },
                    onlyEnter: function () {
                        var mType = movie.media_type || (movie.name ? 'tv' : 'movie');
                        Lampa.Activity.push({
                            url: '',
                            component: 'full',
                            id: movie.id,
                            method: mType,
                            card: movie,
                            source: movie.source || 'tmdb'
                        });
                    }
                }
            }
        };
    }

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

                        var quality = Lampa.Storage.get('ru_img_quality', 'w300');
                        var imgUrl = PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + movie.backdrop_path);
                        view.css({
                            'background-image': 'url(' + imgUrl + ')',
                            'background-size': 'cover',
                            'background-position': 'center',
                            'padding-bottom': '56.25%',
                            'height': '0',
                            'position': 'relative'
                        });

                        view.append('<div class="card-backdrop-overlay"></div>');

                        var useAltDesign = Lampa.Storage.get('ru_alt_design_enable') === true;
                        var voteVal = parseFloat(movie.vote_average);
                        if (!useAltDesign && !isNaN(voteVal) && voteVal > 0) {
                            var voteDiv = document.createElement('div');
                            voteDiv.className = 'card__vote';
                            voteDiv.innerText = voteVal.toFixed(1);
                            view.append(voteDiv);
                        }

                        // Бейдж года (с учётом настройки скрытия)
                        var hideYear = Lampa.Storage.get('ru_hide_year_badge') === true;
                        if (!hideYear) {
                            var yearStr = (movie.release_date || movie.first_air_date || '').toString().substring(0, 4);
                            if (yearStr && yearStr.length === 4) {
                                var ageDiv = document.createElement('div');
                                ageDiv.className = 'card-badge-age';
                                ageDiv.innerText = yearStr;
                                view.append(ageDiv);
                            }
                        }

                        fetchLogo(movie, item);

                        var descText = movie.overview || 'Описание отсутствует.';
                        item.append('<div class="custom-title-bottom">' + (movie.title || movie.name) + '</div>');
                        item.append('<div class="custom-overview-bottom">' + descText + '</div>');

                        var fullBgUrl = movie.backdrop_path ? PROXIES[0] + Lampa.TMDB.image('t/p/w300' + movie.backdrop_path) : '';

                        if (fullBgUrl && !window.ru_initial_bg_set) {
                            window.ru_initial_bg_set = true;
                            BgManager.change(fullBgUrl, true);
                        }

                        var updateBg = function () {
                            var finalBg = movie.custom_full_bg || fullBgUrl;
                            if (finalBg) BgManager.change(finalBg);
                        };
                        item.on('hover:focus', updateBg);
                        item.on('mouseenter', updateBg);
                    },
                    onlyEnter: function () {
                        var mType = movie.media_type || (movie.name ? 'tv' : 'movie');
                        Lampa.Activity.push({
                            url: '',
                            component: 'full',
                            id: movie.id,
                            method: mType,
                            card: movie,
                            source: movie.source || 'tmdb'
                        });
                    }
                }
            }
        };
    }

    // ----------------------------------------------------------------
    //  Загрузчики строк
    // ----------------------------------------------------------------
    function loadHistoryRow(callback) {
        var hist = [];
        var allFavs = {};
        try {
            if (window.Lampa && Lampa.Favorite && typeof Lampa.Favorite.all === 'function') {
                allFavs = Lampa.Favorite.all() || {};
                if (allFavs.history) hist = allFavs.history;
            }
        } catch (e) {}

        var results = [];

        var randFavImg = '', randFavBgFull = '';
        try {
            var favItems = [];
            if (allFavs.book) favItems = favItems.concat(allFavs.book);
            if (allFavs.like) favItems = favItems.concat(allFavs.like);

            var validFavs = favItems.filter(function (item) { return item && (item.backdrop_path || item.poster_path); });
            if (validFavs.length > 0) {
                var randItem = validFavs[Math.floor(Math.random() * validFavs.length)];
                var quality = Lampa.Storage.get('ru_img_quality', 'w300');
                var imgUrlPath = randItem.backdrop_path || randItem.poster_path;
                randFavImg    = imgUrlPath ? (PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + imgUrlPath)) : '';
                randFavBgFull = imgUrlPath ? (PROXIES[0] + Lampa.TMDB.image('t/p/w1280' + imgUrlPath)) : '';
            }
        } catch (e) {}

        var randHistImg = '', randHistBgFull = '';
        try {
            var validHist = (allFavs.history || []).filter(function (item) { return item && (item.backdrop_path || item.poster_path); });
            if (validHist.length > 0) {
                var randItem2 = validHist[Math.floor(Math.random() * validHist.length)];
                var quality2 = Lampa.Storage.get('ru_img_quality', 'w300');
                var imgUrlPath2 = randItem2.backdrop_path || randItem2.poster_path;
                randHistImg    = imgUrlPath2 ? (PROXIES[0] + Lampa.TMDB.image('t/p/' + quality2 + imgUrlPath2)) : '';
                randHistBgFull = imgUrlPath2 ? (PROXIES[0] + Lampa.TMDB.image('t/p/w1280' + imgUrlPath2)) : '';
            }
        } catch (e) {}

        var showFav = Lampa.Storage.get('ru_show_fav_card');
        if (showFav === null || showFav === undefined || showFav === '' || showFav === true || showFav === 'true') {
            results.push(makeFavoriteCardItem(randFavImg, randFavBgFull));
        }

        var showHistBtn = Lampa.Storage.get('ru_show_history_btn');
        if (showHistBtn === null || showHistBtn === undefined || showHistBtn === '' || showHistBtn === true || showHistBtn === 'true') {
            results.push(makeHistoryButtonCardItem(randHistImg, randHistBgFull));
        }

        if (hist && hist.length > 0) {
            var unique = {};
            var validItems = hist.filter(function (h) {
                if (h && h.id && (h.title || h.name) && !unique[h.id]) {
                    unique[h.id] = true;
                    return true;
                }
                return false;
            }).slice(0, 20);

            if (validItems.length > 0) {
                results = results.concat(validItems.map(makeHistoryCardItem));
            }
        }

        if (results.length > 0) {
            callback({
                results: results,
                title: '',
                ru_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        } else {
            callback({ results: [] });
        }
    }

    async function loadRow(urlId, loadUrl, title, callback) {
        try {
            var items = await fetchCatalogPage(loadUrl, 15);
            var mapped = items.map(makeWideCardItem);
            callback({
                results: mapped,
                title: '',
                source: 'ru_main_source',
                ru_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        } catch (e) { callback({ results: [] }); }
    }

    async function loadKinobazaRow(urlId, loadUrl, title, callback) {
        try {
            var fetchUrl = loadUrl + '1';
            var items = await fetchKinobazaCatalog(fetchUrl, 15);
            var mapped = items.map(makeWideCardItem);
            callback({
                results: mapped,
                title: '',
                source: 'ru_main_source',
                ru_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        } catch (e) { callback({ results: [] }); }
    }

    async function loadCollectionsRow(urlId, loadUrl, title, callback) {
        try {
            var html = await fetchHtml(loadUrl);
            var items = extractCollections(html);
            items.sort(function () { return 0.5 - Math.random(); });
            var mapped = items.slice(0, 7).map(makeCollectionButtonItem);

            callback({
                results: mapped,
                title: '',
                source: 'ru_main_source',
                ru_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        } catch (e) { callback({ results: [] }); }
    }

    async function loadCommunityGemsRow(callback) {
        try {
            var listUrl = 'https://wh.lme.isroot.in/v2/top?period=7d&top=asc&min_rating=7&per_page=15&page=1';
            var res = await safeFetch(listUrl).then(function (r) { return r.json(); }).catch(function () { return { items: [] }; });
            var items = Array.isArray(res) ? res : (res.items || []);

            var tmdbItems = await getLmeTmdbItems(items);
            var mappedResults = tmdbItems.map(makeWideCardItem);

            callback({
                results: mappedResults,
                title: '',
                source: 'ru_main_source',
                ru_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        } catch (e) { callback({ results: [] }); }
    }

    async function loadRandomMoviesRow(callback) {
        try {
            var baseRandomUrl = 'https://kinobaza.com.ua/titles?q=&search_type=&order_by=random&display=&user_rated_year=0&user_seen_year=0&type=&tv_status=&ys=&ye=&rating=1&rating_max=10&votes=&imdb_rating=7&imdb_rating_max=10&imdb_votes=5000&metacritic_min=&metacritic_max=&tomato_min=&tomato_max=&age_min=&age_max=&per_page=30&distributor=&translated=has_ukr_audio';
            var fetchUrl = baseRandomUrl + '&_t=' + Date.now();

            var movies = await fetchKinobazaCatalog(fetchUrl, 5, true);

            callback({
                results: movies.map(makeWideCardItem),
                title: '',
                ru_content_row: true,
                params: { items: { mapping: 'line', view: 5 } }
            });
        } catch (e) { callback({ results: [] }); }
    }

    // ----------------------------------------------------------------
    //  Тост загрузки
    // ----------------------------------------------------------------
    function getOrCreateLoadingToast() {
        var toast = document.getElementById('ru-loading-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ru-loading-toast';
            toast.innerText = 'Загрузка новых карточек...';
            toast.style.cssText = 'display:none; position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:rgba(40,40,40,0.95); color:#fff; padding:12px 24px; border-radius:8px; z-index:99999; font-size:1.2em; font-weight:bold; pointer-events:none; box-shadow: 0 4px 10px rgba(0,0,0,0.5); opacity:0; transition: opacity 0.3s ease;';
            document.body.appendChild(toast);
        }
        return toast;
    }

    function showLoadingToast() {
        var toast = getOrCreateLoadingToast();
        toast.style.display = 'block';
        void toast.offsetWidth;
        toast.style.opacity = '1';
    }

    function hideLoadingToast() {
        var toast = getOrCreateLoadingToast();
        toast.style.opacity = '0';
        setTimeout(function () {
            if (toast.style.opacity === '0') toast.style.display = 'none';
        }, 300);
    }

    // ----------------------------------------------------------------
    //  Постраничная загрузка для category_full
    // ----------------------------------------------------------------
    async function fetchPageData(targetPage, baseUrl, isLME, isKinobazaOnline, isRuCollection, isCollectionsList, params) {
        var pageMapped = [];
        var pageTotal = 50;

        if (isLME) {
            var listUrl = 'https://wh.lme.isroot.in/v2/top?period=7d&top=asc&min_rating=7&per_page=20&page=' + targetPage;
            var res = await fetchCommunityWatches(listUrl).catch(function () { return { items: [] }; });
            var items = Array.isArray(res) ? res : (res.items || []);
            pageTotal = res.total_pages || 10;
            pageMapped = await getLmeTmdbItems(items);
        } else if (isCollectionsList) {
            if (targetPage > 1) return { mapped: [], total: 1 };
            var listUrl2 = baseUrl;
            if (listCache[listUrl2]) {
                pageMapped = listCache[listUrl2];
            } else {
                var html = await fetchHtml(listUrl2);
                var collItems = extractCollections(html);
                pageMapped = collItems.map(makeCollectionButtonItem);
                if (pageMapped.length > 0) listCache[listUrl2] = pageMapped;
            }
            pageTotal = 1;
        } else if (isRuCollection) {
            var listUrl3 = params.url;
            if (targetPage > 1) {
                if (listUrl3.endsWith('.html')) listUrl3 = listUrl3.replace('.html', '/page/' + targetPage + '/');
                else                              listUrl3 = listUrl3.replace(/\/$/, '') + '/page/' + targetPage + '/';
            }
            if (listCache[listUrl3]) {
                pageMapped = listCache[listUrl3];
            } else {
                var pcItems = await fetchCatalogPage(listUrl3, 20);
                pageMapped = pcItems;
                if (pageMapped.length > 0) listCache[listUrl3] = pageMapped;
            }
        } else if (isKinobazaOnline) {
            var listUrl4 = baseUrl + targetPage;
            pageMapped = await fetchKinobazaCatalog(listUrl4, 30);
        } else {
            var listUrl5 = targetPage === 1 ? baseUrl : baseUrl + 'page/' + targetPage + '/';
            pageMapped = await fetchCatalogPage(listUrl5, 20);
        }

        return { mapped: pageMapped, total: pageTotal };
    }

    Lampa.Api.sources.ru_main_source = {
        list: async function (params, oncomplete, onerror) {
            var requestedPage = params.page || 1;
            var baseUrl = '';
            var isLME = false;
            var isKinobazaOnline = false;
            var isRuCollection = params.is_ru_collection;
            var isCollectionsList = false;

            if      (params.url === 'ru_movies_new')   baseUrl = 'https://uaserials.com/films/p/';
            else if (params.url === 'ru_movies_pop')   baseUrl = 'https://uaserials.my/filmss/w/';
            else if (params.url === 'ru_series_new')   baseUrl = 'https://uaserials.com/series/p/';
            else if (params.url === 'ru_series_pop')   baseUrl = 'https://uaserials.com/series/w/';
            else if (params.url === 'kinobaza_streaming') {
                baseUrl = 'https://kinobaza.com.ua/online?q=&search_type=&order_by=date_desc&display=&user_rated_year=0&user_seen_year=0&type=&tv_status=&ys=&ye=&rating=1&rating_max=10&votes=&imdb_rating=1&imdb_rating_max=10&imdb_votes=&metacritic_min=&metacritic_max=&tomato_min=&tomato_max=&age_min=&age_max=&per_page=30&distributor=&translated=has_ukr_audio&page=';
                isKinobazaOnline = true;
            }
            else if (params.url === 'ru_collections_list') {
                isCollectionsList = true;
                baseUrl = 'https://uaserials.com/collections/';
            }
            else if (params.url === 'ru_community') isLME = true;
            else if (!isRuCollection) return onerror();

            if (requestedPage > 1) showLoadingToast();

            try {
                var mapped = [];
                var totalPages = 50;

                async function fetchSafe(targetPage) {
                    try {
                        return await fetchPageData(targetPage, baseUrl, isLME, isKinobazaOnline, isRuCollection, isCollectionsList, params);
                    } catch (e) {
                        return { mapped: [], total: 50 };
                    }
                }

                if (requestedPage === 1) {
                    var both = await Promise.all([fetchSafe(1), fetchSafe(2)]);
                    mapped = both[0].mapped.concat(both[1].mapped);
                    totalPages = both[0].total;
                } else {
                    var res2 = await fetchSafe(requestedPage + 1);
                    mapped = res2.mapped;
                    totalPages = res2.total;
                }

                if (requestedPage > 1) hideLoadingToast();

                if (mapped.length > 0) {
                    oncomplete({ results: mapped, page: requestedPage, total_pages: totalPages });
                } else {
                    onerror();
                }
            } catch (e) {
                if (requestedPage > 1) hideLoadingToast();
                onerror();
            }
        }
    };

    // ----------------------------------------------------------------
    //  Настройки
    // ----------------------------------------------------------------
    function createSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({
            component: 'ru_mainpage',
            name: 'Главная RU',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'ru_mainpage',
            param: { name: 'ru_show_fav_card', type: 'trigger', default: true },
            field: { name: 'Карточка «Избранное» в истории', description: 'Показывать быстрый доступ к Избранному первым в строке истории' }
        });

        Lampa.SettingsApi.addParam({
            component: 'ru_mainpage',
            param: { name: 'ru_show_history_btn', type: 'trigger', default: true },
            field: { name: 'Карточка «История» в истории', description: 'Показывать быстрый доступ к Истории рядом с Избранным' }
        });

        // === Бейджи на постере (новые опции) ===
        Lampa.SettingsApi.addParam({
            component: 'ru_mainpage',
            param: { name: 'ru_hide_year_badge', type: 'trigger', default: false },
            field: { name: 'Скрыть дату на постере', description: 'Не показывать год на карточках' }
        });

        Lampa.SettingsApi.addParam({
            component: 'ru_mainpage',
            param: { name: 'ru_hide_season_badge', type: 'trigger', default: false },
            field: { name: 'Скрыть сезон на постере', description: 'Не показывать бейдж текущего сезона/серии' }
        });

        Lampa.SettingsApi.addParam({
            component: 'ru_mainpage',
            param: { name: 'ru_swap_badges', type: 'trigger', default: false },
            field: { name: 'Поменять местами дату и сезон', description: 'Переставить бейджи года и сезона' }
        });

        Lampa.SettingsApi.addParam({
            component: 'ru_mainpage',
            param: { name: 'ru_hide_vote', type: 'trigger', default: false },
            field: { name: 'Скрыть рейтинг TMDB на постере', description: 'Не показывать оценку TMDB на карточках' }
        });

        var langValues = {
            'ru':      'Только русский',
            'ru_en':   'Рус + Англ (по умолчанию)',
            'en':      'Только английский',
            'text_ru': 'Всегда текст (Рус)',
            'text_en': 'Всегда текст (Англ)'
        };
        Lampa.SettingsApi.addParam({
            component: 'ru_mainpage',
            param: { name: 'ru_logo_lang', type: 'select', values: langValues, default: 'ru_en' },
            field: { name: 'Язык логотипов', description: 'Выберите приоритет языка для логотипов' }
        });

        var qualValues = {
            'w300':     'w300 (по умолчанию)',
            'w500':     'w500',
            'w780':     'w780',
            'original': 'Оригинал'
        };
        Lampa.SettingsApi.addParam({
            component: 'ru_mainpage',
            param: { name: 'ru_img_quality', type: 'select', values: qualValues, default: 'w300' },
            field: { name: 'Качество изображений (Фон/Лого)', description: 'Влияет на скорость загрузки страницы' }
        });

        var orderValues = {
            '1': 'Позиция 1', '2': 'Позиция 2', '3': 'Позиция 3',
            '4': 'Позиция 4', '5': 'Позиция 5', '6': 'Позиция 6',
            '7': 'Позиция 7', '8': 'Позиция 8', '9': 'Позиция 9'
        };

        DEFAULT_ROWS_SETTINGS.forEach(function (r) {
            Lampa.SettingsApi.addParam({
                component: 'ru_mainpage',
                param: { name: r.id, type: 'trigger', default: r.default },
                field: { name: 'Включить / Выключить: ' + r.title, description: 'Показывать эту строку на главной' }
            });
            Lampa.SettingsApi.addParam({
                component: 'ru_mainpage',
                param: { name: r.id + '_order', type: 'select', values: orderValues, default: r.defOrder },
                field: { name: 'Порядок: ' + r.title, description: 'Каким по счёту выводить эту строку' }
            });
        });

        Lampa.SettingsApi.addParam({
            component: 'ru_mainpage',
            param: { name: 'ru_main_tmdb_btn', type: 'button' },
            field: { name: 'Свой TMDB API ключ', description: 'Нажмите, чтобы ввести ключ (используется в первую очередь)' }
        });

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
            if (e.name === 'ru_mainpage') {
                e.body.find('[data-name="ru_main_tmdb_btn"]').on('hover:enter', function () {
                    var currentKey = Lampa.Storage.get('ru_main_tmdb_apikey') || '';
                    Lampa.Input.edit({
                        title: 'Введите TMDB API ключ', value: currentKey, free: true, nosave: true
                    }, function (new_val) {
                        if (new_val !== undefined) {
                            Lampa.Storage.set('ru_main_tmdb_apikey', new_val.trim());
                            Lampa.Noty.show('TMDB ключ сохранён. Перезапустите приложение.');
                        }
                    });
                });
            } else if (e.name === 'ru_mainpage_alt') {
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

    // ----------------------------------------------------------------
    //  Замещаем главный API источник Lampa
    // ----------------------------------------------------------------
    function overrideApi() {
        Lampa.Api.sources.tmdb.main = function (params, oncomplite, onerror) {
            var rowDefs = [
                { id: 'ru_row_history',     defOrder: 1, type: 'history',         url: '',                       title: 'История просмотра',     icon: '' },
                { id: 'ru_row_movies_new',  defOrder: 2, type: 'uas',             url: 'ru_movies_new',          loadUrl: 'https://uaserials.com/films/p/',  title: 'Новинки фильмов',  icon: '' },
                { id: 'ru_row_series_new',  defOrder: 3, type: 'uas',             url: 'ru_series_new',          loadUrl: 'https://uaserials.com/series/p/', title: 'Новинки сериалов', icon: '' },
                { id: 'ru_row_collections', defOrder: 4, type: 'uas_collections', url: 'ru_collections_list',    loadUrl: 'https://uaserials.com/collections/', title: 'Подборки',       icon: '' },
                { id: 'ru_row_kinobaza',    defOrder: 5, type: 'kinobaza',        url: 'kinobaza_streaming',     loadUrl: 'https://kinobaza.com.ua/online?q=&search_type=&order_by=date_desc&display=&user_rated_year=0&user_seen_year=0&type=&tv_status=&ys=&ye=&rating=1&rating_max=10&votes=&imdb_rating=1&imdb_rating_max=10&imdb_votes=&metacritic_min=&metacritic_max=&tomato_min=&tomato_max=&age_min=&age_max=&per_page=30&distributor=&translated=has_ukr_audio&page=', title: 'Новинки стримингов', icon: '' },
                { id: 'ru_row_community',   defOrder: 6, type: 'community',       url: 'ru_community',           title: 'Скрытые жемчужины',     icon: '' },
                { id: 'ru_row_movies_pop',  defOrder: 7, type: 'uas',             url: 'ru_movies_pop',          loadUrl: 'https://uaserials.my/filmss/w/',  title: 'Популярные фильмы',  icon: '' },
                { id: 'ru_row_series_pop',  defOrder: 8, type: 'uas',             url: 'ru_series_pop',          loadUrl: 'https://uaserials.com/series/w/', title: 'Популярные сериалы', icon: '' },
                { id: 'ru_row_random',      defOrder: 9, type: 'random',          url: '',                       title: 'Случайные фильмы',      icon: '' }
            ];

            var activeRows = [];
            for (var i = 0; i < rowDefs.length; i++) {
                var def = rowDefs[i];
                var defSetting = DEFAULT_ROWS_SETTINGS.find(function (r) { return r.id === def.id; });
                var defaultEnabled = defSetting ? defSetting.default : true;

                var enabled = Lampa.Storage.get(def.id);
                if (enabled === null || enabled === undefined || enabled === '') enabled = defaultEnabled;
                else if (enabled === 'false') enabled = false;
                else if (enabled === 'true')  enabled = true;

                var orderVal = Lampa.Storage.get(def.id + '_order');
                var order = parseInt(orderVal);
                if (isNaN(order)) order = def.defOrder;

                if (enabled) activeRows.push(Object.assign({}, def, { order: order }));
            }
            activeRows.sort(function (a, b) { return a.order - b.order; });

            var parts_data = [];

            activeRows.forEach(function (def) {
                if (def.type !== 'history') {
                    parts_data.push(function (cb) {
                        cb({
                            results: [makeTitleButtonItem(def.title, def.url, def.icon)],
                            title: '',
                            ru_title_row: true,
                            params: { items: { mapping: 'line', view: 1 } }
                        });
                    });
                }

                parts_data.push(function (cb) {
                    if      (def.type === 'history')          loadHistoryRow(cb);
                    else if (def.type === 'uas')              loadRow(def.url, def.loadUrl, def.title, cb);
                    else if (def.type === 'kinobaza')         loadKinobazaRow(def.url, def.loadUrl, def.title, cb);
                    else if (def.type === 'uas_collections')  loadCollectionsRow(def.url, def.loadUrl, def.title, cb);
                    else if (def.type === 'community')        loadCommunityGemsRow(cb);
                    else if (def.type === 'random')           loadRandomMoviesRow(cb);
                });
            });

            if (parts_data.length === 0) {
                parts_data.push(function (cb) { loadRow('ru_movies_new', 'https://uaserials.com/films/p/', 'Новинки фильмов', cb); });
            }

            Lampa.Api.partNext(parts_data, 2, oncomplite, onerror);
        };
    }

    // ----------------------------------------------------------------
    //  Запуск
    // ----------------------------------------------------------------
    function start() {
        if (window.ru_main_loaded) return;
        window.ru_main_loaded = true;

        if (!Lampa.Storage.get('ru_main_init_v1')) {
            Lampa.Storage.set('ru_main_init_v1', true);
            DEFAULT_ROWS_SETTINGS.forEach(function (r) {
                var current = Lampa.Storage.get(r.id);
                if (current === null || current === undefined || current === '') {
                    Lampa.Storage.set(r.id, r.default);
                }
            });
            var sfc = Lampa.Storage.get('ru_show_fav_card');
            if (sfc === null || sfc === undefined || sfc === '') Lampa.Storage.set('ru_show_fav_card', true);

            var shb = Lampa.Storage.get('ru_show_history_btn');
            if (shb === null || shb === undefined || shb === '') Lampa.Storage.set('ru_show_history_btn', true);
        }

        BgManager.init();

        createSettings();

        var style = document.createElement('style');
        style.innerHTML = [
            '.card .card__age { display: none !important; }',
            '',
            '.card__view .card-badge-age {',
            '    display: block !important; right: 0 !important; top: 0 !important; padding: 0.2em 0.45em !important;',
            '    background: rgba(0, 0, 0, 0.6) !important;',
            '    position: absolute !important; margin-top: 0 !important; font-size: 1.1em !important;',
            '    z-index: 10 !important; color: #fff !important; font-weight: bold !important;',
            '}',
            '',
            '.card--wide-custom { width: 25em !important; margin-right: 0.2em !important; margin-bottom: 0 !important; position: relative; cursor: pointer; transition: transform 0.2s ease, z-index 0.2s ease; z-index: 1; }',
            '.card--wide-custom .card__view { border-radius: 0.4em !important; overflow: hidden !important; box-shadow: 0 3px 6px rgba(0,0,0,0.5); }',
            '.card--wide-custom .card-backdrop-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); pointer-events: none; border-radius: 0.4em !important; z-index: 1; }',
            '.card--wide-custom.focus { z-index: 99 !important; transform: scale(1.08) !important; }',
            '.card--wide-custom.focus .card__view { box-shadow: 0 10px 25px rgba(0,0,0,0.9) !important; border: 3px solid #fff !important; outline: none !important; }',
            '.card--wide-custom.focus .card__view::after, .card--wide-custom.focus .card__view::before { display: none !important; content: none !important; }',
            '',
            '.card-custom-logo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70% !important; height: 70% !important; max-width: 70% !important; max-height: 70% !important; padding: 0 !important; margin: 0 !important; object-fit: contain; z-index: 5; filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.8)); pointer-events: none; transition: filter 0.3s ease; }',
            '.card-custom-logo-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; max-height: 70%; text-align: center; font-size: 2em; font-weight: 600; color: #fff; text-shadow: none !important; z-index: 5; pointer-events: none; word-wrap: break-word; white-space: normal; line-height: 1.2; font-family: sans-serif; display: flex; align-items: center; justify-content: center; }',
            '',
            '.card--wide-custom > div:not(.card__view):not(.custom-title-bottom):not(.custom-overview-bottom) { display: none !important; }',
            '.custom-title-bottom { width: 100%; text-align: left; font-size: 1.1em; font-weight: bold; margin-top: 0.3em; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 0.2em; display: block !important; visibility: visible !important; opacity: 1 !important; }',
            '.custom-overview-bottom { width: 100%; text-align: left; font-size: 0.85em; color: #bbb; line-height: 1.2; margin-top: 0.2em; padding: 0 0.2em; display: -webkit-box !important; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: normal; visibility: visible !important; opacity: 1 !important; }',
            '',
            '.card__vote { right: 0 !important; bottom: 0 !important; padding: 0.2em 0.45em !important; z-index: 2; position: absolute !important; font-weight: bold; background: rgba(0,0,0,0.6); }',
            '.card__type { position: absolute !important; left: 0 !important; top: 0 !important; width: auto !important; height: auto !important; line-height: 1 !important; padding: 0.3em !important; background: rgba(0, 0, 0, 0.5) !important; display: flex !important; align-items: center; justify-content: center; z-index: 2; color: #fff !important; transition: background 0.3s !important; }',
            '.card__type svg { width: 1.5em !important; height: 1.5em !important; }',
            '.card__type.card__type--season { font-size: 1.1em !important; font-weight: bold !important; padding: 0.2em 0.45em !important; font-family: Roboto, Arial, sans-serif !important; }',
            '',
            '.card--wide-custom .card-badge-age { border-radius: 0 0 0 0.5em !important; }',
            '.card--wide-custom .card__vote     { border-radius: 0.5em 0 0 0 !important; }',
            '.card--wide-custom .card__type     { border-radius: 0 0 0.5em 0 !important; }',
            '',
            '/* Стандартные вертикальные карточки */',
            'body:not(.ru-alt-design-active) .card:not(.card--wide-custom):not(.card--history-custom) .card-badge-age { border-radius: 0 0.8em 0 0.8em !important; }',
            'body:not(.ru-alt-design-active) .card:not(.card--wide-custom):not(.card--history-custom) .card__vote     { border-radius: 0.8em 0 0.8em 0 !important; }',
            'body:not(.ru-alt-design-active) .card:not(.card--wide-custom):not(.card--history-custom) .card__type     { border-radius: 0.8em 0 0.8em 0 !important; }',
            '',
            '/* === Скрыть дату на постере (по настройке) === */',
            'body.ru-hide-year .card-badge-age { display: none !important; visibility: hidden !important; opacity: 0 !important; }',
            '',
            '/* === Скрыть бейдж сезона/серии на постере (по настройке) === */',
            'body.ru-hide-season .card__type.card__type--season { display: none !important; visibility: hidden !important; opacity: 0 !important; }',
            '',
            '/* === Скрыть рейтинг TMDB на постере (по настройке) === */',
            'body.ru-hide-vote .card__vote { display: none !important; visibility: hidden !important; opacity: 0 !important; }',
            '',
            '/* === Поменять местами дату и сезон === */',
            '/* По умолчанию: год — справа сверху, сезон — слева сверху. При свопе меняем углы. */',
            'body.ru-swap-badges .card-badge-age { left: 0 !important; right: auto !important; border-radius: 0 0 0.5em 0 !important; }',
            'body.ru-swap-badges .card__type     { right: 0 !important; left: auto !important; border-radius: 0 0 0 0.5em !important; }',
            'body.ru-swap-badges .card--wide-custom .card-badge-age { border-radius: 0 0 0.5em 0 !important; }',
            'body.ru-swap-badges .card--wide-custom .card__type     { border-radius: 0 0 0 0.5em !important; }',
            'body.ru-swap-badges.ru-alt-design-active .card.ru-alt-card .card-left-badges .card-badge-age { order: 2 !important; }',
            'body.ru-swap-badges.ru-alt-design-active .card.ru-alt-card .card-left-badges .card__type     { order: 1 !important; }',
            '',
            '/* --- АЛЬТЕРНАТИВНЫЙ ДИЗАЙН (глобально для всех карточек) --- */',
            '',
            '/* 1. Скрытие рейтинга на всех карточках */',
            'body.ru-alt-design-active .card__vote,',
            'body.ru-alt-design-active .card-rating,',
            'body.ru-alt-design-active .card .card__vote { display: none !important; opacity: 0 !important; visibility: hidden !important; }',
            '',
            '/* 2. Снятие затемнений на широких бекдропах (главная) */',
            'body.ru-alt-design-active .card--wide-custom .card-backdrop-overlay { display: none !important; background: transparent !important; }',
            'body.ru-alt-design-active .card--wide-custom .card__view::after,',
            'body.ru-alt-design-active .card--wide-custom .card__view::before { display: none !important; content: none !important; }',
            '',
            '/* 3. Скрытие всех логотипов на главной странице (широкие карточки) */',
            'body.ru-alt-design-active .card--wide-custom .card-custom-logo,',
            'body.ru-alt-design-active .card--wide-custom .card-custom-logo-text { display: none !important; visibility: hidden !important; opacity: 0 !important; }',
            '',
            '/* 4. Контейнер для бейджей слева (вертикальные и широкие карточки) */',
            '.card.ru-alt-card .card-left-badges {',
            '    position: absolute !important; left: 0.3em !important; top: 0.55em !important;',
            '    display: flex !important; flex-direction: column !important; gap: 0.2em !important;',
            '    z-index: 20 !important; align-items: flex-start !important; pointer-events: none !important;',
            '    background: transparent !important;',
            '}',
            '',
            '/* 5. Овальные бейджи (таблетки) */',
            '.card.ru-alt-card .card-left-badges > div {',
            '    position: static !important; margin: 0 !important;',
            '    height: 1.8em !important; min-height: 1.8em !important; width: auto !important;',
            '    border-radius: 2em !important;',
            '    display: flex !important; align-items: center !important; justify-content: center !important;',
            '    background: rgba(0, 0, 0, 0.55) !important;',
            '    padding: 0 0.6em !important; font-size: 0.7em !important; font-weight: 700 !important;',
            '    color: #fff !important; box-shadow: none !important; line-height: 1 !important;',
            '    border: 1px solid rgba(255,255,255,0.15) !important; box-sizing: border-box !important;',
            '}',
            '',
            '/* Порядок бейджей */',
            '.card.ru-alt-card .card-left-badges .card-badge-age { order: 1 !important; }',
            '.card.ru-alt-card .card-left-badges .card__type     { order: 2 !important; }',
            '',
            '/* Скрытие всех бейджей на карточках истории */',
            '.card--history-custom .card-left-badges,',
            '.card--history-custom .card__vote,',
            '.card--history-custom .card-badge-age,',
            '.card--history-custom .card__type {',
            '    display: none !important; visibility: hidden !important; opacity: 0 !important;',
            '}',
            '',
            '.items-line[data-ru-title-row="true"]   .items-line__head { display: none !important; }',
            '.items-line[data-ru-content-row="true"] .items-line__head { display: none !important; }',
            '',
            '.items-line[data-ru-title-row="true"] { margin-top: 0 !important; margin-bottom: 0.5em !important; padding-top: 0 !important; padding-bottom: 0 !important; }',
            '.items-line[data-ru-title-row="true"] .items-line__body { margin: 0 !important; padding: 0 !important; }',
            '.items-line[data-ru-title-row="true"] .scroll__item    { margin: 0 !important; padding: 0 !important; }',
            '',
            '.items-line[data-ru-content-row="true"] { margin-top: 0.1em !important; margin-bottom: 0.5em !important; padding-top: 0 !important; padding-bottom: 0 !important; }',
            '.items-line[data-ru-content-row="true"] .items-line__body { margin: 0 !important; padding: 0 !important; }',
            '.items-line[data-ru-content-row="true"] .scroll__item    { margin: 0 !important; padding: 0 !important; }',
            '',
            '.card--title-btn {',
            '    width: 100vw !important; max-width: 100% !important; height: auto !important;',
            '    background: transparent !important; border-radius: 1.5em !important;',
            '    margin: 0.2em 0 !important; display: flex !important; align-items: center !important;',
            '    justify-content: flex-start !important; padding: 0.5em 1.5em !important;',
            '    cursor: pointer !important; border: 2px solid transparent !important;',
            '    box-shadow: none !important; box-sizing: border-box !important;',
            '    transition: transform 0.2s ease, border 0.2s ease, background 0.2s ease !important;',
            '}',
            '.card--title-btn.focus { background: rgba(255, 255, 255, 0.05) !important; border: 2px solid #fff !important; transform: scale(1.01) !important; }',
            '.title-btn-text { display: flex !important; align-items: center !important; font-size: 1.4em !important; font-weight: bold !important; color: #777 !important; border: none !important; padding: 0 !important; line-height: 1.2 !important; text-align: left !important; transition: color 0.2s ease, transform 0.2s ease !important; }',
            '.title-btn-icon { height: 1.1em !important; width: auto !important; margin-right: 0.5em !important; filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.5)) !important; }',
            '.card--title-btn.focus .title-btn-text { color: #fff !important; text-shadow: none !important; }',
            '.card--title-btn-static { cursor: default !important; }',
            '.card--title-btn-static .title-btn-text { opacity: 0.5 !important; }',
            '.card--title-btn .card__view, .card--title-btn .card__view::after, .card--title-btn .card__view::before { display: none !important; }',
            '',
            '.card--collection-btn { width: 16em !important; height: 7em !important; background: rgba(40,40,40,0.8) !important; border-radius: 0.8em !important; margin-right: 0.8em !important; margin-bottom: 0.8em !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; padding: 1em !important; cursor: pointer !important; border: 2px solid transparent !important; box-shadow: 0 4px 6px rgba(0,0,0,0.3) !important; transition: transform 0.2s ease, background 0.2s ease, border 0.2s ease !important; text-align: center !important; box-sizing: border-box !important; position: relative; }',
            '.card--collection-btn.focus { background: rgba(60,60,60,0.9) !important; border: 2px solid #fff !important; transform: scale(1.05) !important; z-index: 99 !important; }',
            '.card--collection-btn .collection-title { font-size: 1.1em !important; font-weight: bold !important; color: #fff !important; line-height: 1.3 !important; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }',
            '.card--collection-btn .card__view, .card--collection-btn .card__view::after, .card--collection-btn .card__view::before { display: none !important; }',
            '',
            '.card--history-custom { width: 16em !important; margin-right: 0.8em !important; margin-bottom: 0 !important; position: relative; cursor: pointer; transition: transform 0.2s ease, z-index 0.2s ease; z-index: 1; }',
            '.card--history-custom .card__view { border-radius: 0.8em !important; overflow: hidden !important; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }',
            '.card--history-custom.focus { z-index: 99 !important; transform: scale(1.08) !important; }',
            '.card--history-custom.focus .card__view { box-shadow: 0 10px 25px rgba(0,0,0,0.9) !important; border: 2px solid #fff !important; outline: none !important; }',
            '.card--history-custom.focus .card__view::after, .card--history-custom.focus .card__view::before { display: none !important; content: none !important; }',
            '.card--history-custom > div:not(.card__view) { display: none !important; }',
            '.favorite-card-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.45); z-index: 2; }',
            '.favorite-card-text { color: #fff; font-size: 1.5em; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.6); }',
            '',
            '#ru-bg-container { position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; z-index: 1; pointer-events: none; background-color: #000; display: none; }',
            '.ru-bg-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; opacity: 0; transition: opacity 1s ease-in-out; filter: blur(10px) brightness(0.4); transform: scale(1.05); }',
            '.ru-bg-layer.active { opacity: 1; }',
            '',
            'body.ru-main-active .background { display: none !important; opacity: 0 !important; }',
            'body.ru-main-active .wrap { position: relative; z-index: 2; }',
            '',
            '@media (orientation: portrait), (max-width: 768px) {',
            '    .card--wide-custom    { width: 14em !important; }',
            '    .card--history-custom { width: 14em !important; }',
            '    .card--collection-btn { width: 14em !important; height: auto !important; aspect-ratio: 16/9; }',
            '    .card--wide-custom .custom-overview-bottom { display: none !important; }',
            '    .card--wide-custom .custom-title-bottom    { font-size: 1em !important; margin-top: 0.1em; }',
            '    .items-line[data-ru-title-row="true"]   { margin-bottom: 0 !important; }',
            '    .items-line[data-ru-content-row="true"] { margin-bottom: 0.2em !important; }',
            '    .card--title-btn { margin: 0 !important; padding: 0.2em 1em !important; min-height: 2em !important; }',
            '    .title-btn-text  { font-size: 1.1em !important; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);

        // ----- Слушатели -----
        Lampa.Listener.follow('line', function (e) {
            if (e.type === 'create' && e.data && e.line && e.line.render) {
                var el = e.line.render();
                if (e.data.ru_title_row)   el.attr('data-ru-title-row', 'true');
                if (e.data.ru_content_row) el.attr('data-ru-content-row', 'true');
            }
        });

        var initialFocusHandled = true;

        function applyBodyFlags() {
            var body = document.body;
            // Альт-дизайн
            if (Lampa.Storage.get('ru_alt_design_enable') === true) body.classList.add('ru-alt-design-active');
            else                                                     body.classList.remove('ru-alt-design-active');

            // Скрытия и своп бейджей
            if (Lampa.Storage.get('ru_hide_year_badge')   === true) body.classList.add('ru-hide-year');
            else                                                     body.classList.remove('ru-hide-year');

            if (Lampa.Storage.get('ru_hide_season_badge') === true) body.classList.add('ru-hide-season');
            else                                                     body.classList.remove('ru-hide-season');

            if (Lampa.Storage.get('ru_swap_badges')       === true) body.classList.add('ru-swap-badges');
            else                                                     body.classList.remove('ru-swap-badges');

            if (Lampa.Storage.get('ru_hide_vote')         === true) body.classList.add('ru-hide-vote');
            else                                                     body.classList.remove('ru-hide-vote');
        }

        // Реакция на изменение настроек в реальном времени
        Lampa.Storage.listener.follow('change', function (e) {
            if (e.name === 'ru_alt_design_enable' ||
                e.name === 'ru_hide_year_badge'   ||
                e.name === 'ru_hide_season_badge' ||
                e.name === 'ru_swap_badges'       ||
                e.name === 'ru_hide_vote') {
                applyBodyFlags();
            }
        });

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                initialFocusHandled = false;
                window.ru_initial_bg_set = false;

                var isMain = e.component === 'main' || e.component === 'tmdb';
                if (isMain || !e.component) {
                    document.body.classList.add('ru-main-active');
                    BgManager.show();
                } else {
                    document.body.classList.remove('ru-main-active');
                    BgManager.hide();
                }

                applyBodyFlags();
            }
        });

        Lampa.Listener.follow('controller', function (e) {
            if (e.type === 'focus' && !initialFocusHandled) {
                initialFocusHandled = true;
                var target = $(e.target);
                if (target.hasClass('card--title-btn')) {
                    setTimeout(function () { Lampa.Controller.move('down'); }, 20);
                }
            }
        });

        // ----- Перехват рендера карточек -----
        var CardMaker = Lampa.Maker.map('Card');
        var originalOnVisible = CardMaker.Card.onVisible;

        CardMaker.Card.onVisible = function () {
            var html = this.html;
            var data = this.data;
            if (!html || !data) return;

            var cardInstance = this;

            var isWideCard      = (html.classList && html.classList.contains('card--wide-custom'))    || $(html).hasClass('card--wide-custom');
            var isHistoryCard   = (html.classList && html.classList.contains('card--history-custom')) || $(html).hasClass('card--history-custom');
            var isTitleBtn      = (html.classList && html.classList.contains('card--title-btn'))      || $(html).hasClass('card--title-btn');
            var isCollectionBtn = (html.classList && html.classList.contains('card--collection-btn')) || $(html).hasClass('card--collection-btn');

            var isSpecialCard = isTitleBtn || isCollectionBtn || data.is_title_btn || data.is_collection_btn;

            if (!isSpecialCard) originalOnVisible.apply(this, arguments);
            else                this.visible = true;

            if (isSpecialCard) return;

            var view = html.querySelector('.card__view');
            var useAltDesign = Lampa.Storage.get('ru_alt_design_enable') === true;
            var altToken = Lampa.Storage.get('ru_alt_design_apikey');

            var targetContainer = view;

            // Контейнер для овальных бейджей слева (альт-дизайн)
            if (useAltDesign && view) {
                html.classList.add('ru-alt-card');
                targetContainer = view.querySelector('.card-left-badges');
                if (!targetContainer) {
                    targetContainer = document.createElement('div');
                    targetContainer.className = 'card-left-badges';
                    view.appendChild(targetContainer);
                }
            } else if (html.classList) {
                html.classList.remove('ru-alt-card');
            }

            // Жёсткое скрытие стандартного рейтинга TMDB в альт-режиме
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
            } else if (vote.length > 0 && !isWideCard && !isHistoryCard) {
                var color = getColor(parseFloat(vote[0].textContent.trim()), 0.8);
                if (color) vote[0].style.backgroundColor = color;
            }

            // Альт-дизайн — постеры/бекдропы из easyratingsdb
            if (useAltDesign && data.id && altToken) {
                getImdbIdForTmdb(data.id, data.media_type || (data.name ? 'tv' : 'movie')).then(function (imdb) {
                    if (imdb) {
                        if (isWideCard || isHistoryCard) {
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

            // Бейдж года (с учётом скрытия)
            var hideYear = Lampa.Storage.get('ru_hide_year_badge') === true;
            if (view && data && !hideYear) {
                var ageBadge = view.querySelector('.card-badge-age');
                if (!ageBadge) {
                    var yearStr = (data.release_date || data.first_air_date || '').toString().substring(0, 4);
                    if (yearStr && yearStr.length === 4) {
                        ageBadge = document.createElement('div');
                        ageBadge.className = 'card-badge-age';
                        ageBadge.innerText = yearStr;
                        targetContainer.appendChild(ageBadge);
                    }
                } else if (ageBadge.parentNode !== targetContainer) {
                    targetContainer.appendChild(ageBadge);
                }
            } else if (hideYear && view) {
                var existingAge = view.querySelector('.card-badge-age');
                if (existingAge) existingAge.remove();
            }

            // На всякий случай удаляем старые бейджи флагов, если остались от прежней версии
            var oldFlag = html.querySelector('.card__ru_flag, .card__ua_flag');
            if (oldFlag) oldFlag.remove();

            // Бейдж сезона (с учётом скрытия)
            var hideSeason = Lampa.Storage.get('ru_hide_season_badge') === true;
            if (!hideSeason && (data.media_type === 'tv' || data.name || data.number_of_seasons) && data.id) {
                fetchSeriesData(data.id).then(function (tmdbData) {
                    if (cardInstance.html && cardInstance.html.parentNode && cardInstance.data === data) {
                        renderSeasonBadge(cardInstance.html, tmdbData, targetContainer);
                    }
                }).catch(function () {});
            } else if (hideSeason) {
                var existingSeason = html.querySelector('.card__type--season');
                if (existingSeason) existingSeason.remove();
            }
        };

        overrideApi();
        applyBodyFlags();
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });

})();
