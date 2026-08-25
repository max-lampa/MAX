(function () {
    'use strict';

    if (window.YDesignLoaded) return;
    window.YDesignLoaded = true;

    // =========================================================================
    // 1. КОНФИГУРАЦИЯ И ВЕКТОРНЫЕ ИКОНКИ РЕЙТИНГОВ
    // =========================================================================
    var CONFIG = {
        name: 'Дизайн MaX',
        cacheTime: 7 * 24 * 60 * 60 * 1000,
        tmdbKey: function () {
            try {
                return (window.Lampa && Lampa.TMDB && Lampa.TMDB.key) ? Lampa.TMDB.key() : '';
            } catch (e) {
                return '';
            }
        }
    };

    var rateIcons = {
        imdb: 'https://upload.wikimedia.org/wikipedia/commons/5/53/IMDB_-_SuperTinyIcons.svg',
        rt: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg',
        mc: 'https://yarikrazor-star.github.io/lmp/mc.svg',
        tmdb: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tmdb.new.logo.svg',
        trakt: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Trakt.tv-favicon.svg',
        mdblist: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='%23ffffff'%3E%3Cpath d='M1.928.029A2.47 2.47 0 0 0 .093 1.673c-.085.248-.09.629-.09 10.33s.005 10.08.09 10.33a2.51 2.51 0 0 0 1.512 1.558l.276.108h20.237l.277-.108a2.51 2.51 0 0 0 1.512-1.559c.085-.25.09-.63.09-10.33s-.005-10.08-.09-10.33A2.51 2.51 0 0 0 22.395.115l-.277-.109L12.117 0C6.615-.004 2.032.011 1.929.029m7.48 8.067l2.123 2.004v1.54c0 .897-.02 1.536-.043 1.527s-.92-.845-1.995-1.86c-1.071-1.01-1.962-1.84-1.977-1.84s-.024 1.91-.024 4.248v4.25H4.911V6.085h1.188l1.183.006zm9.729 3.93v5.94h-2.63l-.01-4.25l-.013-4.25l-1.907 1.795a367 367 0 0 1-1.98 1.864c-.076.056-.08-.047-.08-1.489v-1.555l2.127-1.995l2.127-1.995l1.187-.005h1.184z'/%3E%3C/svg%3E",
        popcorn: 'https://yarikrazor-star.github.io/lmp/rt.svg',
        letterboxd: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Letterboxd_2023_logo.png'
    };

    var IconCache = {};
    function preloadIcon(key, url) {
        return new Promise(function (resolve) {
            if (IconCache[key] || !url || url.indexOf('data:') === 0) {
                IconCache[key] = true;
                return resolve();
            }
            var img = new Image();
            img.onload = function () { IconCache[key] = true; resolve(); };
            img.onerror = function () { IconCache[key] = true; resolve(); };
            img.src = url;
        });
    }

    // =========================================================================
    // 2. НАСТРОЙКИ ПО УМОЛЧАНИЮ
    // =========================================================================
    var DefaultSettings = {
        ydesign_card_type_main: 'horizontal',
        ydesign_card_type_other: 'vertical',
        ydesign_grid_items_v: '5',
        ydesign_grid_items_h: '3',
        ydesign_card_gap: '0.8',
        ydesign_lazy_load: false,

        ydesign_badge_shape: 'pill',
        ydesign_glass_pill_bg: true,
        ydesign_color_age: true,
        ydesign_color_ua: true,
        ydesign_border_year: true,
        ydesign_border_age: true,
        ydesign_border_seasons: true,
        ydesign_border_ua: true,
        ydesign_border_genres: true,
        ydesign_border_ratings: true,
        ydesign_ratings_order: 'tmdb, imdb, rt, popcorn',
        ydesign_ratings_saturate: '100',

        ydesign_logo_type: 'logo',
        ydesign_lang: 'ru',
        ydesign_slogan_lang: 'ru',
        ydesign_desc_lang: 'ru',
        ydesign_add_title_lang: 'ru',
        ydesign_show_poster_caption: true,
        ydesign_poster_caption_size: '0.9',
        ydesign_poster_caption_weight: '600',
        ydesign_poster_caption_style: 'normal',
         ydesign_show_type_label: true,
         ydesign_type_label_corner: 'top-right',
         ydesign_type_label_size: '0.60',
        ydesign_card_radius: 'default',
        ydesign_poster_quality: 'original',
        ydesign_backdrop_quality: 'original',
        ydesign_logo_quality: 'original',

        // Вертикальные
        ydesign_v_logo_max_h: '35',
        ydesign_v_logo_max_w: '80',
        ydesign_v_title_size: '1.5',
        ydesign_v_add_title_size: '0.9',
        ydesign_v_slogan_size: '0.7',
        ydesign_v_badge_size: '0.8',
        ydesign_v_year_size: '0.8',
        ydesign_v_age_size: '0.8',
        ydesign_v_seasons_size: '0.8',
        ydesign_v_ua_size: '0.8',
        ydesign_v_genres_size: '0.8',
        ydesign_v_rating_size: '0.8',
        ydesign_v_uniform_badges: true,
        ydesign_v_badges_one_row: false,
        ydesign_v_show_year: true,
        ydesign_v_show_seasons: true,
        ydesign_v_show_ua: true,
        ydesign_v_show_age: true,
        ydesign_v_show_genres: true,
        ydesign_v_show_slogan: true,
        ydesign_v_show_add_title: true,
        ydesign_v_align_logo: 'center',
        ydesign_v_align_add_title: 'left',
        ydesign_v_align_badges: 'left',
        ydesign_v_align_slogan: 'left',
        ydesign_v_uniform_v_gaps: true,
        ydesign_v_uniform_v_gap_val: '0.25',
        ydesign_v_badges_gap: '0.15',
        ydesign_v_badge_rows_gap: '0.3',
        ydesign_v_genres_gap: '0.0',
        ydesign_v_content_pb: '0.3',
        ydesign_v_slogan_padding: '0.3',
        ydesign_v_logo_mb: '1.2',
        ydesign_v_add_title_mb: '0.3',

        // Горизонтальные
        ydesign_h_logo_max_h: '35',
        ydesign_h_logo_max_w: '80',
        ydesign_h_title_size: '1.5',
        ydesign_h_add_title_size: '0.9',
        ydesign_h_slogan_size: '0.7',
        ydesign_h_desc_size: '1.0',
        ydesign_h_badge_size: '0.8',
        ydesign_h_year_size: '0.8',
        ydesign_h_age_size: '0.8',
        ydesign_h_seasons_size: '0.8',
        ydesign_h_ua_size: '0.8',
        ydesign_h_genres_size: '0.8',
        ydesign_h_rating_size: '0.8',
        ydesign_h_uniform_badges: true,
        ydesign_h_ratings_row: false,
        ydesign_h_show_desc: true,
        ydesign_h_show_year: true,
        ydesign_h_show_seasons: true,
        ydesign_h_show_ua: true,
        ydesign_h_show_age: true,
        ydesign_h_show_genres: true,
        ydesign_h_show_slogan: true,
        ydesign_h_show_add_title: true,
        ydesign_h_align_logo: 'center',
        ydesign_h_align_add_title: 'left',
        ydesign_h_align_badges: 'left',
        ydesign_h_align_slogan: 'left',
        ydesign_h_uniform_v_gaps: true,
        ydesign_h_uniform_v_gap_val: '0.25',
        ydesign_h_badges_gap: '0.15',
        ydesign_h_badge_rows_gap: '0.3',
        ydesign_h_genres_gap: '0.0',
        ydesign_h_content_pb: '0.3',
        ydesign_h_slogan_padding: '0.3',
        ydesign_h_logo_mb: '1.2',
        ydesign_h_add_title_mb: '0.3',

        // Серии
        ydesign_series_redesign: true,
        ydesign_series_cards: '4',
        ydesign_series_badge_size: '0.8',
        ydesign_series_title_size: '0.9',
        ydesign_series_badge_shape: 'pill',
        ydesign_series_glass_pill: true,
        ydesign_series_border_badges: true,
        ydesign_series_show_date: true,
        ydesign_series_show_voice: true,
        ydesign_series_show_rate: true,
        ydesign_series_show_time: true,

        ydesign_no_blur: true,
         ydesign_card_border: false,
         ydesign_card_border_width: '0.20',
         ydesign_card_border_color: '#2b7fff',
         ydesign_badge_dark_bg: false,
         ydesign_focus_color: '#ffffff',
         ydesign_focus_width: '0.25',
        ydesign_omdb_key: '',
        ydesign_mdblist_key: ''
    };

    function getSet(key, fallbackKey) {
        try {
            if (!window.Lampa || !Lampa.Storage) {
                if (DefaultSettings.hasOwnProperty(key)) return DefaultSettings[key];
                if (fallbackKey && DefaultSettings.hasOwnProperty(fallbackKey)) return DefaultSettings[fallbackKey];
                return undefined;
            }
            var val = Lampa.Storage.get(key);
            if (val !== null && val !== undefined && val !== '' && val !== 'undefined' && val !== 'null') return val;
            if (fallbackKey) {
                var fval = Lampa.Storage.get(fallbackKey);
                if (fval !== null && fval !== undefined && fval !== '') return fval;
            }
        } catch (e) {}
        if (DefaultSettings.hasOwnProperty(key)) return DefaultSettings[key];
        if (fallbackKey && DefaultSettings.hasOwnProperty(fallbackKey)) return DefaultSettings[fallbackKey];
        return undefined;
    }

    // =========================================================================
    // 3. РАСПОЗНАВАНИЕ ТИПА КАРТОЧЕК И МЕДИА
    // =========================================================================
    function isPersonCard(data) {
        if (!data) return false;
        if (data.media_type === 'person' || data.type === 'person') return true;
        if (data.profile_path && !data.poster_path && !data.backdrop_path) return true;
        if (data.gender !== undefined && !data.poster_path && !data.backdrop_path) return true;
        if (data.known_for_department && !data.poster_path && !data.backdrop_path) return true;
        return false;
    }

    function isSpecialPluginCard(data, html) {
        if (!data) return false;
        if (data.vinyl || data.vinyl_type) return true;
        if (['playlist', 'album', 'artist', 'radio', 'song', 'genre', 'section'].indexOf(data.media) !== -1) return true;
        if (['playlist', 'album', 'artist', 'radio', 'song', 'genre', 'section'].indexOf(data.type) !== -1) return true;
        if (html) {
            var el = html[0] || html;
            if (el && el.classList && (
                el.classList.contains('card--vinyl') || 
                el.classList.contains('card-more') || 
                el.classList.contains('card--collection') ||
                el.classList.contains('card--iptv')
            )) return true;
        }
        return false;
    }

    function isMovieCard(data, html) {
        if (!data || !data.id) return false;
        if (isSpecialPluginCard(data, html)) return false;
        if (isPersonCard(data)) return false;

        if (data.media_type === 'movie' || data.media_type === 'tv') return true;
        if (data.poster_path || data.backdrop_path) return true;
        if (data.title || (data.name && (data.first_air_date || data.seasons || data.vote_average !== undefined))) return true;

        return false;
    }

    function isTvMedia(movie) {
        if (!movie) return false;
        if (movie.media_type === 'tv') return true;
        if (movie.media_type === 'movie') return false;
        if (movie.type === 'tv' || movie.type === 'tv_series') return true;
        if (movie.type === 'movie') return false;
        if (movie.number_of_seasons !== undefined && movie.number_of_seasons !== null && movie.number_of_seasons > 0) return true;
        if (movie.seasons && movie.seasons.length > 0) return true;
        if (movie.first_air_date && !movie.release_date) return true;
        if (movie.name && !movie.title) return true;
        if (movie.original_name && !movie.original_title) return true;
        return false;
    }

    // =========================================================================
    // 4. КЕШ (ES5 Object Map)
    // =========================================================================
    var MemoryCache = {
        _data: {},
        size: 0,
        has: function(key) { return this._data.hasOwnProperty(key); },
        get: function(key) { return this._data[key]; },
        set: function(key, val) {
            if (!this.has(key)) this.size++;
            this._data[key] = val;
        },
        delete: function(key) {
            if (this.has(key)) {
                delete this._data[key];
                this.size--;
            }
        },
        clear: function() {
            this._data = {};
            this.size = 0;
        },
        keys: function() {
            var k = [];
            for (var i in this._data) {
                if (this._data.hasOwnProperty(i)) k.push(i);
            }
            return k;
        }
    };
    var MAX_MEM_CACHE = 250;

    var ApiCache = {
        get: function (key) {
            if (MemoryCache.has(key)) return MemoryCache.get(key);
            try {
                var raw = Lampa.Storage.get('ydesign_c_' + key);
                if (raw) {
                    var parsed = (typeof raw === 'string') ? JSON.parse(raw) : raw;
                    if (parsed && parsed.time && (Date.now() - parsed.time < CONFIG.cacheTime)) {
                        MemoryCache.set(key, parsed.val);
                        return parsed.val;
                    }
                }
            } catch (e) {}
            return null;
        },
        set: function (key, val) {
            if (MemoryCache.size >= MAX_MEM_CACHE) {
                var keys = MemoryCache.keys();
                if (keys.length > 0) {
                    MemoryCache.delete(keys[0]);
                }
            }
            MemoryCache.set(key, val);
            try {
                Lampa.Storage.set('ydesign_c_' + key, { val: val, time: Date.now() });
            } catch (e) {}
        }
    };

    // =========================================================================
    // 5. ДОМИНАНТНЫЙ ЦВЕТ
    // =========================================================================
    var ProminentColorStore = {};
    var sharedCanvas = null;
    var sharedCtx = null;

    function getProminentColorAsync(path) {
        if (!path) return Promise.resolve('rgb(40, 40, 45)');
        var url = (path.indexOf('http') === 0 || path.indexOf('data:') === 0) ? path : ('https://image.tmdb.org/t/p/w92' + path);

        if (ProminentColorStore[url]) return ProminentColorStore[url];

        ProminentColorStore[url] = new Promise(function (resolve) {
            var cachedColor = ApiCache.get('col_' + path);
            if (cachedColor) return resolve(cachedColor);

            var img = new Image();
            img.crossOrigin = 'Anonymous';

            img.onload = function () {
                try {
                    if (!sharedCanvas) {
                        sharedCanvas = document.createElement('canvas');
                        sharedCanvas.width = 1;
                        sharedCanvas.height = 1;
                        sharedCtx = sharedCanvas.getContext('2d', { willReadFrequently: true });
                    }
                    var sx = 0, sy = img.naturalHeight * 0.7, sw = img.naturalWidth, sh = img.naturalHeight * 0.3;
                    sharedCtx.drawImage(img, sx, sy, sw, sh, 0, 0, 1, 1);
                    var data = sharedCtx.getImageData(0, 0, 1, 1).data;
                    var r = data[0], g = data[1], b = data[2];

                    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    if (luma > 140) {
                        var factor = 110 / luma;
                        r = Math.floor(r * factor);
                        g = Math.floor(g * factor);
                        b = Math.floor(b * factor);
                    } else if (luma < 30) {
                        r = 35; g = 35; b = 40;
                    }

                    var colorResult = 'rgb(' + r + ',' + g + ',' + b + ')';
                    ApiCache.set('col_' + path, colorResult);
                    resolve(colorResult);
                } catch (e) {
                    resolve('rgb(40, 40, 45)');
                }
            };
            img.onerror = function () {
                resolve('rgb(40, 40, 45)');
            };
            img.src = url;
        });

        return ProminentColorStore[url];
    }

    // =========================================================================
    // 6. ЛЕНИВАЯ ЗАГРУЗКА
    // =========================================================================
    var LazyLoader = {
        observer: null,
        init: function () {
            if (this.observer || typeof IntersectionObserver === 'undefined') return;
            var self = this;
            try {
                this.observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            var el = entry.target;
                            if (el._lazyQueue) {
                                el._lazyQueue.forEach(function (fn) { fn(); });
                                delete el._lazyQueue;
                            }
                            self.observer.unobserve(el);
                        }
                    });
                }, { rootMargin: '200px' });
            } catch (e) {}
        },
        add: function (el, fn) {
            if (typeof IntersectionObserver === 'undefined' || !getSet('ydesign_lazy_load')) {
                fn();
                return;
            }
            this.init();
            if (!this.observer) {
                fn();
                return;
            }
            el._lazyQueue = [fn];
            this.observer.observe(el);
        }
    };

    // =========================================================================
    // 7. API И ДАННЫЕ TMDB
    // =========================================================================
    function parseAgeRating(ageStr) {
        if (!ageStr) return '16+';
        var s = String(ageStr).toUpperCase().trim();
        if (s === 'G' || s === 'TV-G' || s === 'TV-Y') return '0+';
        if (s === 'PG' || s === 'TV-PG') return '6+';
        if (s === 'TV-Y7') return '7+';
        if (s === 'PG-13') return '13+';
        if (s === 'TV-14') return '14+';
        if (s === 'R' || s === 'NC-17' || s === 'TV-MA') return '18+';
        var digits = s.replace(/\D/g, '');
        if (digits.length > 0 && digits.length <= 2) return digits + '+';
        return '16+';
    }

    function checkUaVoiceover(tmdbId, type) {
        return new Promise(function (resolve) {
            var cacheKey = 'ua_' + tmdbId;
            var cached = ApiCache.get(cacheKey);
            if (cached !== null) return resolve(cached);

            var isSerial = (type === 'tv' || type === 'tv_series') ? 1 : 0;
            var url = 'https://wh.lme.isroot.in/?tmdb_id=' + encodeURIComponent(tmdbId) + '&serial=' + isSerial + '&silent=true';

            $.ajax({
                url: url,
                timeout: 3500,
                success: function (r) {
                    var hasUa = (r === true || (r && (r.success === true || r.status === 'success' || r.ok === true || (typeof r === 'object' && Object.keys(r).length > 0 && !r.error))));
                    ApiCache.set(cacheKey, hasUa);
                    resolve(hasUa);
                },
                error: function () {
                    ApiCache.set(cacheKey, false);
                    resolve(false);
                }
            });
        });
    }

    function fetchExternalRatings(tmdbId, type) {
        var cacheKey = 'ext_rates_v5_' + tmdbId;
        var cached = ApiCache.get(cacheKey);
        if (cached) return Promise.resolve(cached);

        return new Promise(function (resolve) {
            var results = {};
            
            $.ajax({
                url: 'https://api.themoviedb.org/3/' + type + '/' + tmdbId + '/external_ids?api_key=' + CONFIG.tmdbKey(),
                timeout: 4000,
                success: function(extRes) {
                    var imdbId = extRes ? extRes.imdb_id : null;
                    if (!imdbId) {
                        ApiCache.set(cacheKey, results);
                        return resolve(results);
                    }

                    var omdbKey = String(getSet('ydesign_omdb_key') || '').trim();
                    var mdblistKey = String(getSet('ydesign_mdblist_key') || '').trim();
                    
                    var pOmdb = Promise.resolve();
                    if (omdbKey) {
                        pOmdb = new Promise(function(resOmdb) {
                            $.ajax({
                                url: 'https://www.omdbapi.com/?apikey=' + omdbKey + '&i=' + imdbId,
                                timeout: 3500,
                                success: function(omdbData) {
                                    if (omdbData && omdbData.Response !== 'False') {
                                        if (omdbData.Metascore && omdbData.Metascore !== 'N/A') results.mc = omdbData.Metascore;
                                        if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') results.imdb = omdbData.imdbRating;
                                        var rtArr = (omdbData.Ratings || []).filter(function (r) { return r.Source === 'Rotten Tomatoes'; });
                                        if (rtArr.length > 0) results.rt = rtArr[0].Value.replace('%', '');
                                    }
                                    resOmdb();
                                },
                                error: function() { resOmdb(); }
                            });
                        });
                    }

                    var pMdb = Promise.resolve();
                    if (mdblistKey) {
                        pMdb = new Promise(function(resMdb) {
                            $.ajax({
                                url: 'https://mdblist.com/api/?apikey=' + mdblistKey + '&i=' + imdbId,
                                timeout: 3500,
                                success: function(mdbData) {
                                    if (mdbData) {
                                        if (mdbData.score) results.mdblist = mdbData.score;
                                        (mdbData.ratings || []).forEach(function (r) {
                                            if (r.source === 'trakt') results.trakt = r.value;
                                            if (r.source === 'letterboxd') results.letterboxd = r.value;
                                            if (r.source === 'tomatoesaudience') results.popcorn = r.value;
                                            if (r.source === 'metacritic' && !results.mc) results.mc = r.value;
                                            if (r.source === 'tomatoes' && !results.rt) results.rt = r.value;
                                            if (r.source === 'imdb' && !results.imdb) results.imdb = r.value;
                                        });
                                    }
                                    resMdb();
                                },
                                error: function() { resMdb(); }
                            });
                        });
                    }

                    Promise.all([pOmdb, pMdb]).then(function() {
                        ApiCache.set(cacheKey, results);
                        resolve(results);
                    });
                },
                error: function() {
                    ApiCache.set(cacheKey, results);
                    resolve(results);
                }
            });
        });
    }

    function fetchExtendedData(id, type) {
        // Плагин работает только с русской локализацией.
        var langPref = 'ru';
        var sloganLang = 'ru';
        var descLang = 'ru';

        var cacheKey = 'ext_' + type + '_' + id + '_' + langPref + '_' + sloganLang + '_' + descLang + '_v6';
        var cached = ApiCache.get(cacheKey);
        if (cached) return Promise.resolve(cached);

        return new Promise(function (resolve) {
            var langQuery = 'ru-RU';
            var url = 'https://api.themoviedb.org/3/' + type + '/' + id +
                '?api_key=' + CONFIG.tmdbKey() +
                '&language=' + langQuery +
                '&append_to_response=images,release_dates,content_ratings' +
                '&include_image_language=ru,en,null';

            $.ajax({
                url: url,
                timeout: 4500,
                success: function(data) {
                    var enData = null;
                    var needEn = false;
                    if (sloganLang === 'en' || descLang === 'en' || langPref === 'en_orig') needEn = true;
                    if (sloganLang === 'ru_en' && (!data.tagline || !data.tagline.trim())) needEn = true;
                    if (descLang === 'ru_en' && (!data.overview || !data.overview.trim())) needEn = true;

                    function processData() {
                        var finalTagline = '';
                        if (sloganLang === 'ru') finalTagline = data.tagline || '';
                        else if (sloganLang === 'en') finalTagline = enData ? enData.tagline : '';
                        else finalTagline = data.tagline || (enData ? enData.tagline : '');

                        var finalOverview = '';
                        if (descLang === 'ru') finalOverview = data.overview || '';
                        else if (descLang === 'en') finalOverview = enData ? enData.overview : '';
                        else finalOverview = data.overview || (enData ? enData.overview : '');

                        var se_str = '';
                        if (type === 'tv') {
                            var ds = data.number_of_seasons;
                            var de = data.number_of_episodes;
                            if (data.last_episode_to_air) {
                                var last_ep = data.last_episode_to_air;
                                var s_objArr = data.seasons ? data.seasons.filter(function (x) { return x.season_number === last_ep.season_number; }) : [];
                                var s_obj = s_objArr.length > 0 ? s_objArr[0] : null;
                                if (s_obj) {
                                    if (last_ep.episode_number < s_obj.episode_count) {
                                        ds = last_ep.season_number;
                                        de = last_ep.episode_number + '/' + s_obj.episode_count;
                                    } else {
                                        ds = last_ep.season_number;
                                        de = s_obj.episode_count;
                                    }
                                }
                            }
                            if (ds) se_str = 'S:' + ds + (de ? ' E:' + de : '');
                        }

                        var result = {
                            tagline: finalTagline || '',
                            overview: finalOverview || '',
                            genres: data.genres || (enData ? enData.genres : []),
                            clean_poster: null,
                            clean_backdrop: null,
                            logo: null,
                            logo_lang: null,
                            age: null,
                            seasons: data.number_of_seasons,
                            episodes: data.number_of_episodes,
                            tmdb_rating: data.vote_average,
                            se_str: se_str,
                            title_ru: data.title || data.name || '',
                            title_en: enData ? (enData.title || enData.name) : ''
                        };

                        if (data.images) {
                            var posters = data.images.posters || [];
                            var backdrops = data.images.backdrops || [];
                            var logos = data.images.logos || [];

                            var cpArr = posters.filter(function (p) { return p.iso_639_1 === null; });
                            result.clean_poster = cpArr.length > 0 ? cpArr[0].file_path : (posters.length ? posters[0].file_path : null);

                            var cbArr = backdrops.filter(function (p) { return p.iso_639_1 === null; });
                            result.clean_backdrop = cbArr.length > 0 ? cbArr[0].file_path : (backdrops.length ? backdrops[0].file_path : null);

                            var logo = null;
                            if (langPref === 'ru') {
                                var ruArr = logos.filter(function (l) { return l.iso_639_1 === 'ru'; });
                                logo = ruArr.length > 0 ? ruArr[0] : null;
                            } else if (langPref === 'ru_en') {
                                var ruArr2 = logos.filter(function (l) { return l.iso_639_1 === 'ru'; });
                                var enArr2 = logos.filter(function (l) { return l.iso_639_1 === 'en'; });
                                logo = ruArr2.length > 0 ? ruArr2[0] : (enArr2.length > 0 ? enArr2[0] : null);
                            } else {
                                var enArr3 = logos.filter(function (l) { return l.iso_639_1 === 'en'; });
                                logo = enArr3.length > 0 ? enArr3[0] : null;
                            }
                            if (!logo && logos.length) logo = logos[0];

                            if (logo) {
                                result.logo = logo.file_path;
                                result.logo_lang = logo.iso_639_1;
                            }
                        }

                        if (type === 'movie' && data.release_dates && data.release_dates.results) {
                            var usArr = data.release_dates.results.filter(function (r) { return r.iso_3166_1 === 'US'; });
                            if (usArr.length > 0 && usArr[0].release_dates && usArr[0].release_dates.length) result.age = usArr[0].release_dates[0].certification;
                        } else if (type === 'tv' && data.content_ratings && data.content_ratings.results) {
                            var usTvArr = data.content_ratings.results.filter(function (r) { return r.iso_3166_1 === 'US'; });
                            if (usTvArr.length > 0) result.age = usTvArr[0].rating;
                        }

                        result.age = parseAgeRating(result.age);

                        ApiCache.set(cacheKey, result);
                        resolve(result);
                    }

                    if (needEn) {
                        $.ajax({
                            url: 'https://api.themoviedb.org/3/' + type + '/' + id + '?api_key=' + CONFIG.tmdbKey() + '&language=en-US',
                            timeout: 3500,
                            success: function (enResponse) {
                                enData = enResponse;
                                processData();
                            },
                            error: function () {
                                processData();
                            }
                        });
                    } else {
                        processData();
                    }
                },
                error: function() {
                    resolve(null);
                }
            });
        });
    }

    // =========================================================================
    // 8. РЕНДЕР БЕЙДЖЕЙ И РЕЙТИНГОВ
    // =========================================================================
    function renderRatingsAsync(container, baseData, tmdbData, extRatings) {
        return new Promise(function(resolve) {
            var orderStr = String(getSet('ydesign_ratings_order') || 'tmdb, imdb, rt, popcorn');
            var order = orderStr.split(',').map(function (s) { return s.trim().toLowerCase(); });

            var formatR = function (v, is100) {
                if (v === null || v === undefined || v === '' || v === 'N/A') return null;
                var n = parseFloat(String(v).replace('%', ''));
                if (isNaN(n)) return null;
                if (is100 || n > 10) n = n / 10;
                return n.toFixed(1);
            };

            var available = {
                tmdb: formatR(tmdbData ? tmdbData.tmdb_rating : baseData.vote_average, false),
                kp: formatR(baseData.kp_rating, false),
                imdb: formatR((extRatings && extRatings.imdb) ? extRatings.imdb : baseData.imdb_rating, false),
                rt: formatR(extRatings && extRatings.rt, true),
                mc: formatR(extRatings && extRatings.mc, true),
                trakt: formatR(extRatings && extRatings.trakt, true),
                mdblist: formatR(extRatings && extRatings.mdblist, true),
                popcorn: formatR(extRatings && extRatings.popcorn, true),
                letterboxd: (extRatings && extRatings.letterboxd) ? formatR(parseFloat(extRatings.letterboxd) * 2, false) : null
            };

            var iconsToLoad = [];
            order.forEach(function (key) {
                if (available[key] && key !== 'kp' && rateIcons[key]) {
                    iconsToLoad.push(preloadIcon(key, rateIcons[key]));
                }
            });

            Promise.all(iconsToLoad).then(function() {
                container.innerHTML = '';
                order.forEach(function (key) {
                    if (available[key]) {
                        if (key === 'kp') {
                            container.innerHTML += '<span class="ydesign-rating"><b style="color:#f60; font-weight:800; font-size:1.1em; line-height:1; display:flex; align-items:center;">Kp</b> ' + available[key] + '</span>';
                        } else {
                            var iconUrl = rateIcons[key] || rateIcons.tmdb;
                            container.innerHTML += '<span class="ydesign-rating"><img src="' + iconUrl + '" alt="' + key + '" /> ' + available[key] + '</span>';
                        }
                    }
                });
                resolve();
            });
        });
    }

    // =========================================================================
    // 9. СОЗДАНИЕ КАРТОЧЕК ФИЛЬМОВ
    // =========================================================================
    function buildCardCustomDOM(cardHtml, data) {
        var el = cardHtml[0] || cardHtml;
        var isMain = el._ydesign_isMain !== undefined ? el._ydesign_isMain : (Lampa.Activity.active() ? Lampa.Activity.active().component === 'main' : true);
        var isHorz = isMain ? getSet('ydesign_card_type_main') === 'horizontal' : getSet('ydesign_card_type_other') === 'horizontal';

        el.classList.add('ydesign-card');
        el.classList.remove('ydesign-vertical', 'ydesign-horizontal');
        el.classList.add(isHorz ? 'ydesign-horizontal' : 'ydesign-vertical');

        var type = data.media_type || (data.name ? 'tv' : 'movie');
        if (!data.id) return;
        el._ydesign_render_id = (el._ydesign_render_id || 0) + 1;
        var renderId = el._ydesign_render_id;

         var posterCaption = el.querySelector('.ydesign-poster-caption');
         if (!posterCaption) {
             posterCaption = document.createElement('div');
             posterCaption.className = 'ydesign-poster-caption';
             var nativeView = el.querySelector('.card__view');
             if (nativeView) el.insertBefore(posterCaption, nativeView.nextSibling);
         }
         var captionView = el.querySelector('.card__view');
         if (captionView && posterCaption.previousSibling !== captionView) {
             el.insertBefore(posterCaption, captionView.nextSibling);
         }
         posterCaption.innerText = data.title || data.name || data.original_title || data.original_name || '';
         posterCaption.style.display = getSet('ydesign_show_poster_caption') ? '' : 'none';

        // Фиолетовая полоска прогресса просмотра
        var progressBar = el.querySelector('.ydesign-card-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'ydesign-card-progress';
            progressBar.innerHTML = '<div class="ydesign-card-progress__fill" style="width: 0%"></div>';
            var pView = el.querySelector('.card__view');
            if (pView) pView.appendChild(progressBar);
        }

        // Проверка прогресса просмотра
        (function checkWatchProgress() {
            try {
                var cardId = data.id;
                var cardType = type;
                var progress = null;

                // Пытаемся получить прогресс из Lampa.Watch
                if (window.Lampa && Lampa.Watch) {
                    var watchKey = cardType + '_' + cardId;
                    var watchData = null;
                    if (typeof Lampa.Watch.get === 'function') {
                        watchData = Lampa.Watch.get(cardId, cardType);
                    } else if (typeof Lampa.Watch.data === 'function') {
                        watchData = Lampa.Watch.data();
                        if (watchData && watchData[watchKey]) watchData = watchData[watchKey];
                    }
                    if (watchData) {
                        if (watchData.percent) progress = parseFloat(watchData.percent);
                        else if (watchData.time && watchData.duration) {
                            progress = Math.round((watchData.time / watchData.duration) * 100);
                        } else if (watchData.progress) progress = parseFloat(watchData.progress);
                    }
                }

                // Также проверяем через Lampa.Storage
                if (progress === null && window.Lampa && Lampa.Storage) {
                    var stored = Lampa.Storage.get('watch_' + cardType + '_' + cardId);
                    if (stored) {
                        if (typeof stored === 'object') {
                            if (stored.percent) progress = parseFloat(stored.percent);
                            else if (stored.time && stored.duration) progress = Math.round((stored.time / stored.duration) * 100);
                        } else if (typeof stored === 'string' && stored.indexOf('%') !== -1) {
                            progress = parseFloat(stored);
                        }
                    }
                }

                // Проверяем через data-атрибуты карточки
                if (progress === null && el.dataset && el.dataset.watchedPercent) {
                    progress = parseFloat(el.dataset.watchedPercent);
                }

                if (progress !== null && !isNaN(progress) && progress > 0) {
                    progressBar.style.display = 'block';
                    var fillEl = progressBar.querySelector('.ydesign-card-progress__fill');
                    if (fillEl) fillEl.style.width = Math.min(100, Math.round(progress)) + '%';
                } else {
                    progressBar.style.display = 'none';
                }
            } catch (e) {}
        })();

        var prefix = isHorz ? 'ydesign_h_' : 'ydesign_v_';

        var buildExtendedCard = function () {
            if (el._ydesign_render_id !== renderId) return;
            var view = el.querySelector('.card__view');
            if (!view) return;
            view.innerHTML = '';

            var imgLayer = document.createElement('div'); imgLayer.className = 'ydesign-img-layer';
            var gradientLayer = document.createElement('div'); gradientLayer.className = 'ydesign-gradient-layer';
            var contentLayer = document.createElement('div'); contentLayer.className = 'ydesign-content-layer';

            view.appendChild(imgLayer);
            view.appendChild(gradientLayer);
            view.appendChild(contentLayer);

             if (getSet('ydesign_show_type_label')) {
                 var typePill = document.createElement('div');
                 typePill.className = 'ydesign-type-pill';
                 typePill.innerText = type === 'tv' ? 'Сериал' : 'Фильм';
                 view.appendChild(typePill);
             }

            var bgQuality = getSet('ydesign_poster_quality') || 'original';

            var applyBg = function (path) {
                if (el._ydesign_render_id !== renderId) return;
                if (!path) return;
                var fullUrl = 'https://image.tmdb.org/t/p/' + bgQuality + path;
                if (el._ydesign_bg_applied === fullUrl) return;
                el._ydesign_bg_applied = fullUrl;

                getProminentColorAsync(path).then(function (color) {
                    if (el._ydesign_render_id !== renderId) return;
                    if (color) {
                        view.style.backgroundColor = color;
                        var rgba95 = color.replace('rgb', 'rgba').replace(')', ', 0.95)');
                        // gradient removed
                        // content gradient removed
                    }

                    var img = new Image();
                     img.className = 'ydesign-sharp-image';
                     img.alt = '';
                     img.onload = function () {
                         imgLayer.classList.add('loaded');
                     };
                     imgLayer.innerHTML = '';
                     imgLayer.appendChild(img);
                     img.src = fullUrl;
                });
            };

            fetchExtendedData(data.id, type).then(function (extData) {
                if (el._ydesign_render_id !== renderId) return;
                var bgToLoad = null;
                if (extData) {
                    bgToLoad = isHorz ? (extData.clean_backdrop || data.backdrop_path || data.poster_path) : (extData.clean_poster || data.poster_path || data.backdrop_path);
                } else {
                    bgToLoad = isHorz ? (data.backdrop_path || data.poster_path) : (data.poster_path || data.backdrop_path);
                }

                if (bgToLoad) applyBg(bgToLoad);
                if (!extData) return;

                var logoContainer = document.createElement('div');
                logoContainer.className = 'ydesign-logo-container';

                var titleText = document.createElement('div');
                titleText.className = 'ydesign-text-title ydesign-fallback-text';

                var mainTitle = data.title || data.name || data.original_title || data.original_name || '';
                titleText.innerText = mainTitle;

                if (extData.logo) {
                    var logoImg = document.createElement('img');
                    logoImg.className = 'ydesign-logo-img';
                     logoImg.src = 'https://image.tmdb.org/t/p/original' + extData.logo;
                    logoImg.alt = mainTitle;
                    logoContainer.appendChild(logoImg);
                } else {
                    titleText.classList.remove('ydesign-fallback-text');
                }
                logoContainer.appendChild(titleText);
                contentLayer.appendChild(logoContainer);

                var addTitleWrap = null;
                if (getSet(prefix + 'show_add_title', 'ydesign_show_add_title')) {
                    addTitleWrap = document.createElement('div');
                    addTitleWrap.className = 'ydesign-add-title';
                    contentLayer.appendChild(addTitleWrap);
                }

                var updateAddTitleWrap = function () {
                    if (!addTitleWrap) return;
                    if (!extData.logo) { addTitleWrap.innerText = ' '; return; }
                    var uTitle = '';
                    var addTitleLang = getSet('ydesign_add_title_lang');
                     var ukT = extData.title_ru || mainTitle;
                    var enT = extData.title_en || data.original_title || data.original_name;

                     if (addTitleLang === 'ru') uTitle = ukT;
                    else if (addTitleLang === 'en') uTitle = enT;
                    else {
                        if (extData.logo_lang === 'en') uTitle = ukT;
                        else if (extData.logo_lang === 'uk' || extData.logo_lang === 'ru') uTitle = enT;
                        else uTitle = ukT;
                    }

                    if (uTitle) {
                        var fTitle = '"' + uTitle + '"';
                        if (fTitle.length > 34) fTitle = fTitle.substring(0, 32) + '...';
                        addTitleWrap.innerText = fTitle;
                    } else {
                        addTitleWrap.innerText = ' ';
                    }
                };

                updateAddTitleWrap();

                var infoWrap = document.createElement('div');
                infoWrap.className = 'ydesign-info-wrap';

                var badgesWrap = document.createElement('div');
                badgesWrap.className = 'ydesign-badges';

                if (data.release_date || data.first_air_date) {
                    var year = String(data.release_date || data.first_air_date).substring(0, 4);
                    if (year && year !== 'unde') badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-year">' + year + '</span>';
                }

                if (type === 'tv' && extData.se_str) {
                    badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-seasons">' + extData.se_str + '</span>';
                } else if (type === 'tv' && extData.seasons) {
                    var str = 'S:' + extData.seasons + (extData.episodes ? ' E:' + extData.episodes : '');
                    badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-seasons">' + str + '</span>';
                }

                if (extData.age) {
                    var ageClass = 'ydesign-age-' + extData.age.replace('+', '');
                    badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-age ' + ageClass + '">' + extData.age + '</span>';
                }

                if (badgesWrap.innerHTML !== '') infoWrap.appendChild(badgesWrap);

                checkUaVoiceover(data.id, type).then(function (hasUa) {
                    if (hasUa) {
                        var uaBadge = document.createElement('span');
                        uaBadge.className = 'ydesign-badge ydesign-badge-ua';
                        uaBadge.innerText = 'UA';
                        badgesWrap.appendChild(uaBadge);
                        if (badgesWrap.parentNode !== infoWrap) infoWrap.insertBefore(badgesWrap, infoWrap.firstChild);
                    }
                });

                var genresWrap = null;
                if (getSet(prefix + 'show_genres', 'ydesign_show_genres')) {
                    genresWrap = document.createElement('div');
                    genresWrap.className = 'ydesign-genres';
                    if (extData.genres && extData.genres.length) {
                        extData.genres.forEach(function (g) {
                            var gb = document.createElement('span');
                            gb.className = 'ydesign-genre-badge';
                            gb.innerText = g.name || g;
                            genresWrap.appendChild(gb);
                        });
                    } else {
                        genresWrap.innerText = ' ';
                    }
                }

                var ratingsWrap = document.createElement('div');
                ratingsWrap.className = 'ydesign-ratings';

                renderRatingsAsync(ratingsWrap, data, extData, null).then(function() {
                    fetchExternalRatings(data.id, type).then(function (extRatings) {
                        if (extRatings && Object.keys(extRatings).length > 0) {
                            renderRatingsAsync(ratingsWrap, data, extData, extRatings);
                        }
                    });
                });

                if (isHorz) {
                    if (getSet('ydesign_h_ratings_row', 'ydesign_horz_ratings_row')) {
                        contentLayer.appendChild(infoWrap);
                        var infoWrap2 = document.createElement('div');
                        infoWrap2.className = 'ydesign-info-wrap ydesign-info-wrap-2';
                        infoWrap2.appendChild(ratingsWrap);
                        contentLayer.appendChild(infoWrap2);
                        if (genresWrap) contentLayer.appendChild(genresWrap);
                    } else {
                        infoWrap.appendChild(ratingsWrap);
                        contentLayer.appendChild(infoWrap);
                        if (genresWrap) contentLayer.appendChild(genresWrap);
                    }
                } else {
                    if (genresWrap) infoWrap.appendChild(genresWrap);
                    infoWrap.appendChild(ratingsWrap);
                    contentLayer.appendChild(infoWrap);
                }

                var oldSlogan = contentLayer.querySelector('.ydesign-slogan');
                if (oldSlogan) oldSlogan.remove();
                var oldDesc = el.querySelector('.ydesign-desc-under');
                if (oldDesc) oldDesc.remove();

                if (getSet(prefix + 'show_slogan', 'ydesign_show_slogan')) {
                    var slogan = document.createElement('div');
                    slogan.className = 'ydesign-slogan ydesign-slogan-text';
                    var sText = extData.tagline || ' ';
                    if (!isHorz && sText.trim() !== '' && sText.length > 46) {
                        sText = sText.substring(0, 44) + '...';
                    }
                    slogan.innerText = sText;
                    contentLayer.appendChild(slogan);
                }

                if (isHorz && getSet('ydesign_h_show_desc', 'ydesign_show_desc_horz')) {
                    var desc = document.createElement('div');
                    desc.className = 'ydesign-desc-under';
                    desc.innerText = extData.overview ? extData.overview : ' ';
                    el.appendChild(desc);
                }
            });
        };

        if (getSet('ydesign_lazy_load')) {
            LazyLoader.add(el, buildExtendedCard);
        } else {
            buildExtendedCard();
        }
    }

    // =========================================================================
    // 10. CSS СТИЛИ
    // =========================================================================
    function injectCSS() {
        var style = document.getElementById('ydesign-style-block');
        if (!style) {
            style = document.createElement('style');
            style.id = 'ydesign-style-block';
            document.head.appendChild(style);
        }

        style.innerHTML = [
             "/* Безопасные визуальные улучшения из Netflix Premium Style.",
             "   Все правила ограничены карточками YDesign и не затрагивают меню. */",
             ".ydesign-active .ydesign-card {",
             "    will-change: transform !important; transform: translate3d(0,0,0);",
             "    -webkit-transform: translate3d(0,0,0);",
             "    backface-visibility: hidden; -webkit-backface-visibility: hidden;",
             "    transform-origin: center center;",
             "}",
             ".ydesign-active .items-line { position: relative !important; z-index: 1; }",
             ".ydesign-active .items-line:focus-within { z-index: 5; }",
             ".ydesign-active .scroll__body,",
             ".ydesign-active .scroll__content,",
             ".ydesign-active .items-line__body {",
             "    -webkit-backface-visibility: hidden; backface-visibility: hidden;",
             "    -webkit-overflow-scrolling: touch;",
             "}",
             "",
            ".ydesign-active .ydesign-card .card__title,",
            ".ydesign-active .ydesign-card .card__age,",
            ".ydesign-active .ydesign-card .card__vote { display: none !important; }",
             ".ydesign-poster-caption {",
             "    width: 100%; box-sizing: border-box; padding: 0.35em 0.25em 0.45em;",
             "    color: rgba(255,255,255,0.92); font-size: var(--ydesign-poster-caption-size, 0.9em) !important;",
             "    font-weight: var(--ydesign-poster-caption-weight, 600) !important;",
             "    font-style: var(--ydesign-poster-caption-style, normal) !important;",
             "    line-height: 1.2; text-align: center; white-space: nowrap;",
             "    overflow: hidden; text-overflow: ellipsis; pointer-events: none;",
             "}",
            "",
            ".ydesign-card-progress {",
            "    position: absolute !important; bottom: 0 !important; left: 0 !important; width: 100% !important; height: 4px !important;",
            "    background: rgba(155, 89, 182, 0.2) !important; z-index: 15 !important; pointer-events: none !important;",
            "    border-radius: 0 0 var(--ydesign-card-radius, 0.85em) var(--ydesign-card-radius, 0.85em) !important; overflow: hidden !important; display: none;",
            "}",
            ".ydesign-card-progress__fill {",
            "    height: 100% !important; background: #9b59b6 !important;",
            "    box-shadow: 0 0 8px rgba(155, 89, 182, 0.8) !important;",
            "    transition: width 0.3s ease !important; border-radius: 0 !important;",
            "}",
            "",
            ".ydesign-active .items-line:not(.vinyl-line) .items-cards,",
            ".ydesign-active .items-line:not(.vinyl-line) .scroll__body {",
            "    display: flex; flex-wrap: nowrap; ",
            "    gap: var(--ydesign-card-gap, 0.8em); ",
             "    padding-top: 0.65em; padding-bottom: 0.65em; ",
             "    box-sizing: border-box !important; ",
            "}",
             ".ydesign-active .items-line:not(.vinyl-line) .scroll,",
             ".ydesign-active .items-line:not(.vinyl-line) .scroll__content {",
             "    padding-top: 0.65em !important; padding-bottom: 0.65em !important;",
             "    scroll-padding-top: 0.65em; scroll-padding-bottom: 0.65em;",
             "    box-sizing: border-box !important; clip-path: none !important;",
             "}",
            "",
            ".ydesign-active .ydesign-card {",
            "    position: relative; overflow: visible;",
            "    background-color: transparent !important;",
            "    border: none !important; ",
            "    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1);",
            "    flex: 0 0 auto; cursor: pointer;",
            "    transform: translateZ(0);",
            "    backface-visibility: hidden;",
            "    box-shadow: none !important;",
            "}",
            "",
             "/* ВЫДЕЛЕНИЕ КАРТОЧКИ БЕЗ ЧЁРНОЙ ТЕНИ */",
             ".ydesign-active .ydesign-card.focus {",
             "    transform: scale(1.045) translateZ(0); ",
            "    z-index: 20;",
            "    box-shadow: none !important;",
            "}",
            "",
             ".ydesign-active .ydesign-card.focus .card__view {",
              "    outline: var(--ydesign-focus-width, 0.25em) solid var(--ydesign-focus-color, #ffffff) !important;",
              "    outline-offset: 0 !important;",
            "}",
            "",
            ".ydesign-active .ydesign-card .card__view {",
            "    position: relative; top: 0; left: 0; right: 0; bottom: 0;",
            "    width: 100%; height: 0 !important;",
            "    border-radius: var(--ydesign-card-radius, 0.85em) !important;",
            "    background-color: #1a1a1a; ",
            "    overflow: hidden;",
             "    outline: 0 solid transparent;",
             "    transition: background-color 0.4s ease, outline-width 0.22s cubic-bezier(0.16, 1, 0.3, 1), outline-color 0.22s ease;",
            "}",
            "",
            ".ydesign-active .ydesign-card.ydesign-vertical .card__view { padding-bottom: 177.77% !important; } ",
             ".ydesign-active .ydesign-card.ydesign-horizontal .card__view { padding-bottom: 68.75% !important; } ",
            "",
            "@media (min-width: 769px) {",
            "    .ydesign-active .card.ydesign-vertical { width: calc(100% / var(--ydesign-grid-items-v, 5)); height: auto !important; }   ",
            "    .ydesign-active .card.ydesign-horizontal { width: calc(100% / var(--ydesign-grid-items-h, 3)); height: auto !important; } ",
             "    .ydesign-active .items-line:not(.vinyl-line) .card.ydesign-vertical { width: 22vw; min-width: 22vw; }   ",
             "    .ydesign-active .items-line:not(.vinyl-line) .card.ydesign-horizontal { width: 34vw; min-width: 34vw; } ",
            "}",
            "",
            "@media (max-width: 768px) {",
            "    .ydesign-active .card.ydesign-vertical { width: calc(100% / 2); height: auto !important; }    ",
            "    .ydesign-active .card.ydesign-horizontal { width: calc(100% / 2); height: auto !important; }  ",
             "    .ydesign-active .items-line:not(.vinyl-line) .card.ydesign-vertical { width: 48vw; min-width: 48vw; }    ",
            "    .ydesign-active .items-line:not(.vinyl-line) .card.ydesign-horizontal { width: 94vw; }  ",
            "}",
            "",
             "/* Плашка типа контента: фильм / сериал */",
             ".ydesign-type-pill {",
             "    position: absolute; z-index: 6; pointer-events: none;",
             "    color: rgba(255,255,255,0.92); background: rgba(20,20,20,0.62);",
             "    font-size: var(--ydesign-type-pill-size, 0.60em); font-weight: 700;",
             "    letter-spacing: 0.06em; line-height: 1.2; text-transform: uppercase;",
             "    padding: 0.3em 0.75em; border: 1px solid rgba(255,255,255,0.18);",
             "    border-radius: 50em; box-shadow: 0 1px 6px rgba(0,0,0,0.45);",
             "}",
             "body[data-ydesign-type-corner='top-right'] .ydesign-type-pill { top: 0.45em; right: 0.45em; }",
             "body[data-ydesign-type-corner='top-left'] .ydesign-type-pill { top: 0.45em; left: 0.45em; }",
             "body[data-ydesign-type-corner='bottom-right'] .ydesign-type-pill { bottom: 0.45em; right: 0.45em; }",
             "body[data-ydesign-type-corner='bottom-left'] .ydesign-type-pill { bottom: 0.45em; left: 0.45em; }",
             "body.ydesign-hide-type-label .ydesign-type-pill { display: none !important; }",
             "",
             "/* Тёмная подложка для читаемости бейджей на светлых постерах */",
             "body.ydesign-dark-badge-bg .ydesign-badge,",
             "body.ydesign-dark-badge-bg .ydesign-genre-badge,",
             "body.ydesign-dark-badge-bg .ydesign-rating { background: rgba(0,0,0,0.58) !important; }",
             "body.ydesign-dark-badge-bg .ydesign-rating { padding-left: 0.4em !important; padding-right: 0.4em !important; }",
             "",
            "/* ИЗОБРАЖЕНИЯ КАРТОЧЕК */",
            ".ydesign-img-layer {",
            "    position: absolute; top: 0; left: 0; width: 100%; height: 100%;",
            "    background-color: #1a1a1a;",
            "    background-size: cover !important; background-repeat: no-repeat; background-position: center center !important;",
            "}",
             ".ydesign-sharp-image {",
             "    position: absolute !important; top: 0 !important; left: 0 !important;",
             "    width: 100% !important; height: 100% !important;",
             "    display: block !important; object-fit: cover !important; object-position: center center !important;",
             "    filter: none !important; -webkit-filter: none !important; image-rendering: high-quality !important; transform: translateZ(0); -webkit-backface-visibility: hidden;",
             "}",
            ".ydesign-img-layer::after {",
            "    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;",
            "    background-image: var(--loaded-bg, none);",
            "    background-size: cover !important; background-repeat: no-repeat; background-position: center center !important;",
            "    opacity: 0; transition: opacity 0.25s ease-in-out; z-index: 1;",
            "}",
            ".ydesign-img-layer.loaded::after { opacity: 1; }",
            "",
            ".ydesign-gradient-layer {",
            "    position: absolute; bottom: 0; left: 0; width: 100%; height: 0%; display: none;",
            "    pointer-events: none; z-index: 2;",
            "}",
            "",
            ".ydesign-content-layer {",
            "    position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;",
            "    display: flex; flex-direction: column; justify-content: flex-end; align-items: stretch;",
            "    padding: 1.2em 0.8em var(--ydesign-content-pb, 0.3em) 0.8em;",
            "    box-sizing: border-box; z-index: 3; pointer-events: none;",
            "}",
            "",
            ".ydesign-logo-container {",
            "    display: flex; align-items: flex-end;",
            "    margin-bottom: var(--ydesign-logo-mb, 1.2em) !important; ",
            "    width: 100%; height: var(--ydesign-logo-h, 35%); max-height: var(--ydesign-logo-h, 35%); ",
            "    flex-shrink: 0; justify-content: var(--ydesign-align-logo, center);",
            "    position: relative; z-index: 10;",
            "}",
            ".ydesign-logo-container img {",
            "    max-width: var(--ydesign-logo-w, 80%); max-height: 100%; height: auto; width: auto;",
            "    object-fit: contain; object-position: bottom var(--ydesign-text-logo, center);",
            "    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.85));",
            "}",
            ".ydesign-text-title {",
            "    width: var(--ydesign-logo-w, 100%); max-height: 100%;",
            "    display: flex; align-items: flex-end; justify-content: var(--ydesign-align-logo, center);",
            "    font-size: calc(var(--ydesign-title-size-val, 1.2) * 1em) !important; font-weight: 800; color: #fff; ",
            "    text-align: var(--ydesign-text-logo, center); text-shadow: 0 2px 4px rgba(0,0,0,0.95);",
            "    line-height: 1.25; padding-bottom: 0.15em; ",
            "}",
            "",
            ".ydesign-add-title {",
            "    width: 100%;",
            "    font-size: calc(var(--ydesign-add-title-size-eff, 0.9) * 1em) !important;",
            "    color: rgba(255, 255, 255, 0.9); font-weight: 600; font-style: italic;",
            "    text-align: var(--ydesign-text-add-title, center); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
            "    line-height: 1.35 !important; padding: 0.1em 0 0.25em 0 !important; margin-left: 0 !important; box-sizing: border-box !important;",
            "    min-height: calc(var(--ydesign-add-title-size-eff, 0.9) * 1.55em); margin-top: 0 !important;",
            "    margin-bottom: var(--ydesign-add-title-mb, 0.3em) !important; text-shadow: none !important;",
            "}",
            "",
            ".ydesign-slogan {",
            "    width: 100%;",
            "    font-size: calc(var(--ydesign-slogan-size-eff, 0.85) * 1em) !important; color: #fff;",
            "    text-align: var(--ydesign-text-slogan, center); ",
            "    margin: var(--ydesign-slogan-padding, 0.3em) 0 0 0 !important;",
            "    padding: 0.1em 0.35em !important; box-sizing: border-box !important; line-height: 1.35 !important; font-weight: 500;",
            "    text-shadow: none !important; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
            "    min-height: calc(var(--ydesign-slogan-size-eff, 0.85) * 1.45em);",
            "}",
            "",
            ".ydesign-info-wrap {",
            "    display: flex; width: 100%; overflow: visible !important; padding: 0 !important; margin: 0 !important;",
            "}",
            "",
            "/* КОНТЕЙНЕРЫ БЕЙДЖЕЙ */",
            ".ydesign-horizontal .ydesign-info-wrap,",
            ".ydesign-horizontal .ydesign-info-wrap-2,",
            "body.ydesign-v-badges-one-row .ydesign-vertical .ydesign-info-wrap {",
            "    display: flex; flex-direction: row; flex-wrap: wrap !important;",
            "    align-content: flex-start !important; align-items: center !important;",
            "    justify-content: var(--ydesign-align-badges, center);",
            "    column-gap: var(--ydesign-badges-gap, 0.15em) !important; row-gap: 50em !important;",
            "    height: 2.15em !important; max-height: 2.15em !important; min-height: 2.15em !important; line-height: 2.15em !important;",
            "    padding: 2px 0 !important; box-sizing: border-box !important; margin: 0 !important; overflow: hidden !important; clip-path: none !important;",
            "}",
            ".ydesign-horizontal .ydesign-info-wrap-2 { margin-top: var(--ydesign-badge-rows-gap, 0.3em) !important; }",
            "",
            ".ydesign-vertical .ydesign-info-wrap {",
            "    flex-direction: column; align-items: var(--ydesign-align-badges, center) !important;",
            "    height: auto !important; max-height: none !important; overflow: visible !important;",
            "    gap: var(--ydesign-badge-rows-gap, 0.3em) !important; padding: 0 !important; margin: 0 !important;",
            "}",
            "",
            ".ydesign-vertical .ydesign-badges, ",
            ".ydesign-vertical .ydesign-ratings,",
            ".ydesign-vertical .ydesign-genres {",
            "    display: flex !important; flex-wrap: wrap !important; align-content: flex-start !important; align-items: center !important;",
            "    column-gap: var(--ydesign-badges-gap, 0.15em) !important; row-gap: 50em !important;",
            "    justify-content: var(--ydesign-align-badges, center) !important; width: 100% !important; ",
            "    height: 2.15em !important; max-height: 2.15em !important; min-height: 2.15em !important; line-height: 2.15em !important;",
            "    padding: 2px 0 !important; box-sizing: border-box !important; margin: 0 !important; overflow: hidden !important; clip-path: none !important;",
            "}",
            "",
            "/* ОТСТУПЫ ЖАНРОВ (РУЧНОЙ РЕЖИМ) */",
            ".ydesign-vertical .ydesign-genres,",
            ".ydesign-horizontal .ydesign-genres {",
            "    margin-top: var(--ydesign-genres-gap, 0em) !important;",
            "    margin-bottom: var(--ydesign-genres-gap, 0em) !important;",
            "}",
            "",
            "body.ydesign-v-badges-one-row .ydesign-vertical .ydesign-genres,",
            "body.ydesign-v-badges-one-row .ydesign-vertical .ydesign-ratings,",
            ".ydesign-horizontal .ydesign-badges,",
            ".ydesign-horizontal .ydesign-ratings { ",
            "    display: flex !important; flex-wrap: wrap !important; align-content: flex-start !important;",
            "    width: auto !important; height: 2.15em !important; max-height: 2.15em !important; min-height: 2.15em !important; line-height: 2.15em !important;",
            "    margin: 0 !important; padding: 2px 0 !important; box-sizing: border-box !important; flex-shrink: 0 !important; ",
            "    column-gap: var(--ydesign-badges-gap, 0.15em) !important; row-gap: 50em !important; overflow: hidden !important;",
            "}",
            "",
            ".ydesign-horizontal .ydesign-genres {",
            "    display: flex !important; flex-wrap: wrap !important; align-content: flex-start !important; align-items: center !important;",
            "    column-gap: var(--ydesign-badges-gap, 0.15em) !important; row-gap: 50em !important; width: 100% !important; ",
            "    justify-content: var(--ydesign-align-badges, center) !important; height: 2.15em !important; max-height: 2.15em !important; min-height: 2.15em !important;",
            "    line-height: 2.15em !important; padding: 2px 0 !important; box-sizing: border-box !important; overflow: hidden !important; clip-path: none !important;",
            "}",
            "",
            ".ydesign-badges, .ydesign-ratings, .ydesign-genres { font-size: 1em !important; }",
            "",
            "/* ГЕОМЕТРИЯ ПИГУЛОК */",
            ".ydesign-badge, .ydesign-genre-badge, .ydesign-rating {",
            "    display: inline-flex !important; align-items: center !important; justify-content: center !important;",
            "    box-sizing: border-box !important; height: 1.85em !important; min-height: 1.85em !important; max-height: 1.85em !important; line-height: 1.1 !important; ",
            "    border: 1px solid transparent !important; background: transparent !important; padding: 0 0.50em !important; ",
            "    text-shadow: none !important; box-shadow: none !important; white-space: nowrap !important; flex-shrink: 0 !important; ",
            "    text-align: center !important; vertical-align: middle !important; border-radius: var(--ydesign-badge-radius, 50px) !important; ",
            "    max-width: 100% !important; overflow: visible !important;",
            "}",
            "",
            "/* РАЗМЕРЫ ШРИФТОВ В БЕЙДЖАХ */",
            ".ydesign-badge-year { font-size: calc(var(--ydesign-year-size-val, 0.8) * 1em) !important; font-weight: 700 !important; color: #fff !important; }",
            ".ydesign-badge-age { font-size: calc(var(--ydesign-age-size-val, 0.8) * 1em) !important; font-weight: 700 !important; color: #fff !important; }",
            ".ydesign-badge-seasons { font-size: calc(var(--ydesign-seasons-size-val, 0.8) * 1em) !important; font-weight: 700 !important; color: #fff !important; }",
            ".ydesign-badge-ua { font-size: calc(var(--ydesign-ua-size-val, 0.8) * 1em) !important; font-weight: 700 !important; color: #fff !important; }",
            ".ydesign-genre-badge { font-size: calc(var(--ydesign-genres-size-val, 0.8) * 1em) !important; font-weight: 600 !important; color: rgba(255,255,255,0.95) !important; }",
            ".ydesign-rating { font-size: calc(var(--ydesign-rating-size-val, 0.8) * 1em) !important; font-weight: 700 !important; color: #fff !important; gap: 0.25em !important; }",
            "",
            "/* ОДИНАКОВЫЙ РАЗМЕР БЕЙДЖЕЙ */",
            "body.ydesign-v-uniform-badges .ydesign-vertical .ydesign-badge,",
            "body.ydesign-v-uniform-badges .ydesign-vertical .ydesign-genre-badge,",
            "body.ydesign-v-uniform-badges .ydesign-vertical .ydesign-rating {",
            "    font-size: calc(var(--ydesign-badge-size-val, 0.8) * 1em) !important;",
            "}",
            "body.ydesign-h-uniform-badges .ydesign-horizontal .ydesign-badge,",
            "body.ydesign-h-uniform-badges .ydesign-horizontal .ydesign-genre-badge,",
            "body.ydesign-h-uniform-badges .ydesign-horizontal .ydesign-rating {",
            "    font-size: calc(var(--ydesign-badge-size-val, 0.8) * 1em) !important;",
            "}",
            "",
            "body.ydesign-shape-pill { --ydesign-badge-radius: 50px; }",
            "body.ydesign-shape-rounded { --ydesign-badge-radius: 0.35em; }",
            "body.ydesign-shape-square { --ydesign-badge-radius: 0.15em; }",
            "",
            "body.ydesign-glass-pill .ydesign-badge,",
            "body.ydesign-glass-pill .ydesign-genre-badge,",
            "body.ydesign-glass-pill .ydesign-rating {",
            "    background: rgba(255, 255, 255, 0.1) !important;",
             "    backdrop-filter: none !important; -webkit-backdrop-filter: none !important; box-shadow: none !important;",
            "}",
            "",
            ".ydesign-rating img {",
            "    width: 1.15em !important; height: 1.15em !important; object-fit: contain !important; display: block !important; ",
            "    filter: saturate(var(--ydesign-ratings-saturate, 100%)) !important; ",
            "}",
            "",
            "body.ydesign-color-age .ydesign-age-18 { color: #ff5252 !important; }",
            "body.ydesign-color-age .ydesign-age-16 { color: #ffab40 !important; }",
            "body.ydesign-color-age .ydesign-age-14, body.ydesign-color-age .ydesign-age-13 { color: #ffd740 !important; }",
            "body.ydesign-color-age .ydesign-age-6, body.ydesign-color-age .ydesign-age-0 { color: #69f0ae !important; }",
            "",
            "body.ydesign-color-ua .ydesign-badge-ua {",
            "    background: linear-gradient(135deg, rgba(0, 87, 183, 0.9) 0%, rgba(255, 215, 0, 0.85) 100%) !important;",
            "    color: #ffffff !important; font-weight: 800 !important; box-shadow: none !important;",
            "}",
            "",
            "/* РАМКИ БЕЙДЖЕЙ */",
            "body.ydesign-border-year .ydesign-badge-year { border-color: rgba(255,255,255,0.6) !important; }",
            "body.ydesign-border-seasons .ydesign-badge-seasons { border-color: rgba(255,255,255,0.6) !important; }",
            "body.ydesign-border-ua .ydesign-badge-ua { border-color: rgba(255,255,255,0.6) !important; }",
            "body.ydesign-border-genres .ydesign-genre-badge { border-color: rgba(255,255,255,0.4) !important; }",
            "body.ydesign-border-ratings .ydesign-rating { border-color: rgba(255,255,255,0.6) !important; }",
            "body.ydesign-border-age .ydesign-badge-age { border-color: rgba(255,255,255,0.6) !important; }",
            "body.ydesign-border-age.ydesign-color-age .ydesign-age-18 { border-color: rgba(244, 67, 54, 0.85) !important; }",
            "body.ydesign-border-age.ydesign-color-age .ydesign-age-16 { border-color: rgba(255, 152, 0, 0.85) !important; }",
            "body.ydesign-border-age.ydesign-color-age .ydesign-age-14, body.ydesign-border-age.ydesign-color-age .ydesign-age-13 { border-color: rgba(255, 215, 64, 0.85) !important; }",
            "body.ydesign-border-age.ydesign-color-age .ydesign-age-6, body.ydesign-border-age.ydesign-color-age .ydesign-age-0 { border-color: rgba(105, 240, 174, 0.85) !important; }",
            "",
            "/* ВЕРТИКАЛЬНЫЕ КАРТОЧКИ CSS ПЕРЕМЕННЫЕ */",
            ".ydesign-active .ydesign-card.ydesign-vertical {",
            "    --ydesign-logo-h: calc(var(--ydesign-v-logo-max-h, 35) * 1%);",
            "    --ydesign-logo-w: calc(var(--ydesign-v-logo-max-w, 80) * 1%);",
            "    --ydesign-title-size-val: var(--ydesign-v-title-size, 1.5);",
            "    --ydesign-add-title-size-eff: var(--ydesign-v-add-title-size, 0.9);",
            "    --ydesign-slogan-size-eff: var(--ydesign-v-slogan-size, 0.7);",
            "    --ydesign-badge-size-val: var(--ydesign-v-badge-size, 0.8);",
            "    --ydesign-year-size-val: var(--ydesign-v-year-size, 0.8);",
            "    --ydesign-age-size-val: var(--ydesign-v-age-size, 0.8);",
            "    --ydesign-seasons-size-val: var(--ydesign-v-seasons-size, 0.8);",
            "    --ydesign-ua-size-val: var(--ydesign-v-ua-size, 0.8);",
            "    --ydesign-genres-size-val: var(--ydesign-v-genres-size, 0.8);",
            "    --ydesign-rating-size-val: var(--ydesign-v-rating-size, 0.8);",
            "    --ydesign-logo-mb: var(--ydesign-v-logo-mb, 1.2em);",
            "    --ydesign-add-title-mb: var(--ydesign-v-add-title-mb, 0.3em);",
            "    --ydesign-badge-rows-gap: var(--ydesign-v-badge-rows-gap, 0.3em);",
            "    --ydesign-badges-gap: var(--ydesign-v-badges-gap, 0.15em);",
            "    --ydesign-genres-gap: var(--ydesign-v-genres-gap, 0em);",
            "    --ydesign-content-pb: var(--ydesign-v-content-pb, 0.3em);",
            "    --ydesign-slogan-padding: var(--ydesign-v-slogan-padding, 0.3em);",
            "    --ydesign-uniform-v-gap: var(--ydesign-v-uniform-v-gap-val, 0.25em);",
            "    --ydesign-align-logo: var(--ydesign-v-align-logo-flex, center);",
            "    --ydesign-text-logo: var(--ydesign-v-align-logo, center);",
            "    --ydesign-text-add-title: var(--ydesign-v-align-add-title, left);",
            "    --ydesign-align-badges: var(--ydesign-v-align-badges-flex, flex-start);",
            "    --ydesign-align-slogan: var(--ydesign-v-align-slogan-flex, flex-start);",
            "    --ydesign-text-slogan: var(--ydesign-v-align-slogan, left);",
            "}",
            "",
            "/* ГОРИЗОНТАЛЬНЫЕ КАРТОЧКИ CSS ПЕРЕМЕННЫЕ */",
            ".ydesign-active .ydesign-card.ydesign-horizontal {",
            "    --ydesign-logo-h: calc(var(--ydesign-h-logo-max-h, 35) * 1%);",
            "    --ydesign-logo-w: calc(var(--ydesign-h-logo-max-w, 80) * 1%);",
            "    --ydesign-title-size-val: var(--ydesign-h-title-size, 1.5);",
            "    --ydesign-add-title-size-eff: var(--ydesign-h-add-title-size, 0.9);",
            "    --ydesign-slogan-size-eff: var(--ydesign-h-slogan-size, 0.7);",
            "    --ydesign-desc-size-val: var(--ydesign-h-desc-size, 1.0);",
            "    --ydesign-badge-size-val: var(--ydesign-h-badge-size, 0.8);",
            "    --ydesign-year-size-val: var(--ydesign-h-year-size, 0.8);",
            "    --ydesign-age-size-val: var(--ydesign-h-age-size, 0.8);",
            "    --ydesign-seasons-size-val: var(--ydesign-h-seasons-size, 0.8);",
            "    --ydesign-ua-size-val: var(--ydesign-h-ua-size, 0.8);",
            "    --ydesign-genres-size-val: var(--ydesign-h-genres-size, 0.8);",
            "    --ydesign-rating-size-val: var(--ydesign-h-rating-size, 0.8);",
            "    --ydesign-logo-mb: var(--ydesign-h-logo-mb, 1.2em);",
            "    --ydesign-add-title-mb: var(--ydesign-h-add-title-mb, 0.3em);",
            "    --ydesign-badge-rows-gap: var(--ydesign-h-badge-rows-gap, 0.3em);",
            "    --ydesign-badges-gap: var(--ydesign-h-badges-gap, 0.15em);",
            "    --ydesign-genres-gap: var(--ydesign-h-genres-gap, 0em);",
            "    --ydesign-content-pb: var(--ydesign-h-content-pb, 0.3em);",
            "    --ydesign-slogan-padding: var(--ydesign-h-slogan-padding, 0.3em);",
            "    --ydesign-uniform-v-gap: var(--ydesign-h-uniform-v-gap-val, 0.25em);",
            "    --ydesign-align-logo: var(--ydesign-h-align-logo-flex, center);",
            "    --ydesign-text-logo: var(--ydesign-h-align-logo, center);",
            "    --ydesign-text-add-title: var(--ydesign-h-align-add-title, left);",
            "    --ydesign-align-badges: var(--ydesign-h-align-badges-flex, flex-start);",
            "    --ydesign-align-slogan: var(--ydesign-h-align-slogan-flex, flex-start);",
            "    --ydesign-text-slogan: var(--ydesign-h-align-slogan, left);",
            "}",
            "",
            "/* МАТЕМАТИЧЕСКИ РАВНЫЕ ОТСТУПЫ ДЛЯ V И H */",
            "body.ydesign-v-uniform-gaps .ydesign-vertical .ydesign-add-title { margin-top: var(--ydesign-uniform-v-gap, 0.25em) !important; margin-bottom: 0 !important; }",
            "body.ydesign-v-uniform-gaps .ydesign-vertical .ydesign-info-wrap { margin-top: var(--ydesign-uniform-v-gap, 0.25em) !important; margin-bottom: 0 !important; }",
            "body.ydesign-v-uniform-gaps .ydesign-vertical .ydesign-genres { margin-top: var(--ydesign-uniform-v-gap, 0.25em) !important; margin-bottom: 0 !important; }",
            "body.ydesign-v-uniform-gaps:not(.ydesign-v-badges-one-row) .ydesign-vertical .ydesign-info-wrap { gap: var(--ydesign-uniform-v-gap, 0.25em) !important; }",
            "body.ydesign-v-uniform-gaps:not(.ydesign-v-badges-one-row) .ydesign-vertical .ydesign-info-wrap > * + * { margin-top: 0 !important; margin-bottom: 0 !important; }",
            "body.ydesign-v-uniform-gaps .ydesign-vertical .ydesign-slogan { margin-top: var(--ydesign-uniform-v-gap, 0.25em) !important; margin-bottom: 0 !important; }",
            "",
            "body.ydesign-h-uniform-gaps .ydesign-horizontal .ydesign-add-title { margin-top: var(--ydesign-uniform-v-gap, 0.25em) !important; margin-bottom: 0 !important; }",
            "body.ydesign-h-uniform-gaps .ydesign-horizontal .ydesign-info-wrap,",
            "body.ydesign-h-uniform-gaps .ydesign-horizontal .ydesign-info-wrap-2 { margin-top: var(--ydesign-uniform-v-gap, 0.25em) !important; margin-bottom: 0 !important; }",
            "body.ydesign-h-uniform-gaps .ydesign-horizontal .ydesign-genres { margin-top: var(--ydesign-uniform-v-gap, 0.25em) !important; margin-bottom: 0 !important; }",
            "body.ydesign-h-uniform-gaps .ydesign-horizontal .ydesign-slogan { margin-top: var(--ydesign-uniform-v-gap, 0.25em) !important; margin-bottom: 0 !important; }",
            "",
            "/* ОПИСАНИЕ ПОД ГОРИЗОНТАЛЬНОЙ КАРТОЧКОЙ */",
            ".ydesign-desc-under {",
            "    position: relative; z-index: 10; width: 100%;",
            "    font-size: calc(var(--ydesign-desc-size-val, 0.85) * 1em) !important;",
            "    color: rgba(255,255,255,0.75); margin-top: 0.5em; text-align: left; line-height: 1.35;",
            "    text-shadow: 0 1px 3px rgba(0,0,0,0.8); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;",
            "    height: calc(1.35em * 3) !important; ",
            "}",
            "",
            "/* ВИДИМОСТЬ ЭЛЕМЕНТОВ (V) */",
            "body.ydesign-v-hide-year .ydesign-vertical .ydesign-badge-year { display: none !important; }",
            "body.ydesign-v-hide-seasons .ydesign-vertical .ydesign-badge-seasons { display: none !important; }",
            "body.ydesign-v-hide-ua .ydesign-vertical .ydesign-badge-ua { display: none !important; }",
            "body.ydesign-v-hide-age .ydesign-vertical .ydesign-badge-age { display: none !important; }",
            "body.ydesign-v-hide-slogan .ydesign-vertical .ydesign-slogan { display: none !important; }",
            "body.ydesign-v-hide-add-title .ydesign-vertical .ydesign-add-title { display: none !important; }",
            "body.ydesign-v-hide-genres .ydesign-vertical .ydesign-genres { display: none !important; }",
            "",
            "/* ВИДИМОСТЬ ЭЛЕМЕНТОВ (H) */",
            "body.ydesign-h-hide-year .ydesign-horizontal .ydesign-badge-year { display: none !important; }",
            "body.ydesign-h-hide-seasons .ydesign-horizontal .ydesign-badge-seasons { display: none !important; }",
            "body.ydesign-h-hide-ua .ydesign-horizontal .ydesign-badge-ua { display: none !important; }",
            "body.ydesign-h-hide-age .ydesign-horizontal .ydesign-badge-age { display: none !important; }",
            "body.ydesign-h-hide-slogan .ydesign-horizontal .ydesign-slogan { display: none !important; }",
            "body.ydesign-h-hide-add-title .ydesign-horizontal .ydesign-add-title { display: none !important; }",
            "body.ydesign-h-hide-genres .ydesign-horizontal .ydesign-genres { display: none !important; }",
            "body.ydesign-h-hide-desc .ydesign-horizontal .ydesign-desc-under { display: none !important; }",
            "",
            "body[data-ydesign-logo='text'] .ydesign-logo-img { display: none !important; }",
            "body[data-ydesign-logo='text'] .ydesign-fallback-text { display: flex !important; }",
            "body[data-ydesign-logo='logo'] .ydesign-fallback-text { display: none !important; }",
            "",
            "/* =========================================================================",
            "   РЕДИЗАЙН СЕРИЙ: БЕЗОПАСНЫЕ ОТСТУПЫ, ОТСУТСТВИЕ СРЕЗАНИЯ И ТЕНЕЙ",
            "   ========================================================================= */",
            ".explorer.ydesign-has-series .online-prestige.online-prestige-watched.ydesign-empty-history {",
            "    display: none !important; pointer-events: none !important; visibility: hidden !important;",
            "    height: 0 !important; margin: 0 !important; padding: 0 !important;",
            "}",
            "",
            "/* ОТКЛЮЧЕНИЕ ГРАДИЕНТОВ И МАСОК СКРОЛЛА */",
            ".explorer.ydesign-has-series .scroll--mask {",
            "    -webkit-mask-image: none !important;",
            "    mask-image: none !important;",
            "}",
            ".explorer.ydesign-has-series .scroll--mask::before,",
            ".explorer.ydesign-has-series .scroll--mask::after,",
            ".explorer.ydesign-has-series .scroll::before,",
            ".explorer.ydesign-has-series .scroll::after {",
            "    display: none !important; content: none !important;",
            "}",
            "",
            "body.ydesign-hide-left-column .explorer.ydesign-has-series .explorer__left {",
            "    display: none !important;",
            "}",
            "",
            "body.ydesign-hide-left-column .explorer.ydesign-has-series .explorer__files,",
            ".explorer.ydesign-has-series .explorer__files {",
            "    width: 100% !important; flex: 1 1 100% !important; max-width: 100% !important;",
            "    padding: 0 !important;",
            "    box-sizing: border-box !important;",
            "}",
            ".explorer.ydesign-has-series .explorer__files-head {",
            "    padding: 8px 28px 0 28px !important;",
            "    margin: 0 !important;",
            "    display: flex !important;",
            "    align-items: center !important;",
            "    flex-wrap: wrap !important;",
            "    gap: 10px !important;",
            "    width: 100% !important;",
            "    box-sizing: border-box !important;",
            "}",
            ".explorer.ydesign-has-series .explorer__files-body {",
            "    margin: 0 !important; padding: 0 !important;",
            "}",
            ".explorer.ydesign-has-series .scroll {",
            "    overflow-x: visible !important;",
            "    margin: 0 !important; padding: 0 !important;",
            "}",
            ".explorer.ydesign-has-series .scroll .scroll__content,",
            ".explorer.ydesign-has-series .scroll--mask .scroll__content,",
            ".explorer.ydesign-has-series .scroll__content {",
            "    padding-top: 6px !important;",
            "    padding-bottom: 0px !important; /* Минимальный отступ снизу */",
            "    padding-left: 10px !important;   /* Безопасный боковой отступ против среза */",
            "    padding-right: 10px !important;  /* Безопасный боковой отступ против среза */",
            "    margin: 0 !important;",
            "    box-sizing: border-box !important;",
            "}",
            ".explorer.ydesign-has-series .explorer__files .scroll__body {",
            "    padding: 0 !important; margin: 0 !important;",
            "}",
            "",
            ".ydesign-series-active .online-prestige.online-prestige--full {",
            "    display: inline-block !important; vertical-align: top !important;",
            "    margin: 8px 12px !important; position: relative !important; height: auto !important;",
            "    border-radius: var(--ydesign-card-radius, 0.85em) !important; overflow: hidden !important; background-color: #1a1a1a !important;",
            "    box-sizing: border-box !important;",
            "    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;",
            "    border: none !important; outline: none !important; ",
            "    box-shadow: none !important; /* Убрана тень с неактивных карточек */",
            "    width: calc(var(--ydesign-series-width, 50%) - 24px) !important; cursor: pointer !important; pointer-events: auto !important;",
            "}",
            ".ydesign-series-active .online-prestige.online-prestige--full::before {",
            "    content: ''; display: block !important; padding-top: 56.25% !important; ",
            "}",
            "",
            "/* ФОКУС КАРТОЧКИ СЕРИИ: ЧИСТАЯ БЕЛАЯ РАМКА БЕЗ ЧЁРНОЙ ТЕНИ */",
            ".ydesign-series-active .online-prestige.online-prestige--full.focus {",
            "    transform: scale(1.035) translateZ(0) !important;",
            "    box-shadow: 0 0 0 3.5px #ffffff !important; /* Только белая рамка */",
            "    z-index: 50 !important;",
            "}",
            "",
            ".ydesign-series-active .online-prestige.online-prestige--full .online-prestige__img {",
            "    position: absolute !important; top: 0 !important; left: 0 !important;",
            "    width: 100% !important; height: 100% !important; z-index: 1 !important; border-radius: 0 !important; pointer-events: none !important;",
            "}",
            ".ydesign-series-active .online-prestige.online-prestige--full .online-prestige__img img {",
            "    width: 100% !important; height: 100% !important; object-fit: cover !important; opacity: 1 !important; pointer-events: none !important;",
            "}",
            "",
            "/* СВЕТЛЫЙ ГРАДИЕНТ ТОЛЬКО СНИЗУ */",
            ".ydesign-series-active .online-prestige.online-prestige--full .ydesign-series-shade {",
            "    position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;",
            "    background: none !important;",
            "    z-index: 2 !important; pointer-events: none !important; transition: background 0.3s ease !important;",
            "}",
            "",
            ".ydesign-series-pill {",
            "    display: inline-flex !important; align-items: center !important; justify-content: center !important;",
            "    height: 1.85em !important; min-height: 1.85em !important; max-height: 1.85em !important; padding: 0 0.55em !important;",
            "    box-sizing: border-box !important; font-size: calc(var(--ydesign-series-badge-size-val, 0.8) * 1em) !important;",
            "    font-weight: 600 !important; color: #ffffff !important; text-shadow: none !important; box-shadow: none !important;",
            "    white-space: nowrap !important; line-height: 1.1 !important; text-align: center !important; vertical-align: middle !important;",
            "    border: 1px solid transparent !important; background: transparent !important;",
            "    border-radius: var(--ydesign-series-badge-radius, 50px) !important; pointer-events: none !important; overflow: visible !important;",
            "}",
            "",
            "body.ydesign-series-shape-pill { --ydesign-series-badge-radius: 50px; }",
            "body.ydesign-series-shape-rounded { --ydesign-series-badge-radius: 0.35em; }",
            "body.ydesign-series-shape-square { --ydesign-series-badge-radius: 0.15em; }",
            "",
            "body.ydesign-series-glass-pill .ydesign-series-pill {",
            "    background: rgba(255, 255, 255, 0.12) !important;",
             "    backdrop-filter: none !important; -webkit-backdrop-filter: none !important; box-shadow: none !important;",
            "}",
            "body.ydesign-series-border-badges .ydesign-series-pill { border-color: rgba(255, 255, 255, 0.45) !important; }",
            "",
            ".ydesign-series-top-left {",
            "    position: absolute !important; top: 10px !important; left: 12px !important; z-index: 5 !important;",
            "    display: flex !important; align-items: center !important; gap: 6px !important; pointer-events: none !important; overflow: visible !important;",
            "}",
            ".ydesign-series-top-right {",
            "    position: absolute !important; top: 10px !important; right: 12px !important; z-index: 5 !important;",
            "    display: flex !important; align-items: center !important; gap: 6px !important; pointer-events: none !important; overflow: visible !important;",
            "}",
            ".ydesign-series-bottom-left {",
            "    position: absolute !important; bottom: calc(2em + 8px) !important; left: 12px !important; right: 80px !important; z-index: 5 !important;",
            "    display: flex !important; flex-direction: column !important; align-items: flex-start !important; gap: 5px !important;",
            "    max-width: calc(100% - 92px) !important; overflow: visible !important; pointer-events: none !important;",
            "}",
            ".ydesign-series-bottom-right {",
            "    position: absolute !important; bottom: calc(2em + 8px) !important; right: 12px !important; z-index: 5 !important;",
            "    display: flex !important; align-items: center !important; pointer-events: none !important; overflow: visible !important;",
            "}",
            "",
            ".ydesign-series-voice-wrap { max-width: 100% !important; display: flex !important; overflow: visible !important; pointer-events: none !important; }",
            ".ydesign-series-voice-badge {",
            "    color: #ffffff !important; font-weight: 600 !important; max-width: 100% !important;",
            "    overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; pointer-events: none !important;",
            "}",
            ".ydesign-series-date { font-weight: 500 !important; color: #ffffff !important; opacity: 0.95 !important; pointer-events: none !important; }",
            ".ydesign-series-rate { color: #ffffff !important; font-weight: 700 !important; pointer-events: none !important; }",
            "",
            ".ydesign-series-active .online-prestige.online-prestige--full .online-prestige__title {",
            "    font-size: calc(var(--ydesign-series-title-size-val, 0.9) * 1em) !important; font-weight: 600 !important; line-height: 1.25 !important;",
            "    color: #ffffff !important; text-shadow: 0 2px 4px rgba(0,0,0,0.95) !important; margin: 0 !important; padding: 0 !important;",
            "    white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; width: 100% !important; pointer-events: none !important;",
            "}",
            "",
            ".ydesign-series-active .online-prestige.online-prestige--full .online-prestige__timeline {",
            "    position: absolute !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important;",
            "    height: 2em !important; margin: 0 !important; z-index: 12 !important;",
             "    backdrop-filter: none !important; -webkit-backdrop-filter: none !important;",
            "    border-radius: 0 0 var(--ydesign-card-radius, 0.85em) var(--ydesign-card-radius, 0.85em) !important; overflow: hidden !important; display: block !important; pointer-events: none !important; background: rgba(155,89,182,0.2) !important;",
            "}",
            ".ydesign-series-active .online-prestige.online-prestige--full .online-prestige__timeline .time-line {",
            "    width: 100% !important; height: 100% !important; background: transparent !important; margin: 0 !important; border-radius: 0 !important;",
            "    position: absolute !important; top: 0 !important; left: 0 !important; z-index: 1 !important; pointer-events: none !important;",
            "}",
            ".ydesign-series-active .online-prestige.online-prestige--full .online-prestige__timeline .time-line > div {",
            "    height: 100% !important; border-radius: 0 !important; background: #9b59b6 !important;",
            "    box-shadow: 0 0 8px rgba(155,89,182,0.8) !important; transition: width 0.3s ease !important; pointer-events: none !important;",
            "}",
            ".ydesign-series-percent-text {",
            "    position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;",
            "    width: 100% !important; height: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important;",
            "    font-size: 0.8em !important; font-weight: 700 !important; color: #ffffff !important; text-shadow: none !important; z-index: 20 !important; pointer-events: none !important; line-height: 1 !important;",
            "}"
        ].join('\n');
    }

    function getFlexAlign(val) {
        if (val === 'left') return 'flex-start';
        if (val === 'right') return 'flex-end';
        return 'center';
    }

    function updateBorderStyles() {
        var style = document.getElementById('ydesign-border-dyn');
        if (!style) {
            style = document.createElement('style');
            style.id = 'ydesign-border-dyn';
            document.head.appendChild(style);
        }

        var focusColor = getSet('ydesign_focus_color') || '#ffffff';
        var focusWidth = parseFloat(getSet('ydesign_focus_width')) || 0.25;
        var cardColor = getSet('ydesign_card_border_color') || '#2b7fff';
        var cardWidth = parseFloat(getSet('ydesign_card_border_width')) || 0.20;
        var css = '.ydesign-active .ydesign-card.focus .card__view{'
            + 'outline:' + focusWidth + 'em solid ' + focusColor + ' !important;'
            + 'outline-offset:0 !important;}';

        if (getSet('ydesign_card_border')) {
                css += 'body.ydesign-card-border .ydesign-card .card__view{'
                + 'outline:' + cardWidth + 'em solid ' + cardColor + ' !important;'
                + 'outline-offset:0 !important;}';
            css += 'body.ydesign-card-border .ydesign-card.focus .card__view{'
                + 'outline:' + focusWidth + 'em solid ' + focusColor + ' !important;'
                + 'outline-offset:0 !important;}';
        }
        style.textContent = css;
    }

    function applyDynamicCSS() {
        try {
            document.body.classList.add('ydesign-active');
            document.body.classList.toggle('ydesign-series-active', getSet('ydesign_series_redesign'));
            document.body.classList.toggle('ydesign-series-glass-pill', getSet('ydesign_series_glass_pill'));
            document.body.classList.toggle('ydesign-series-border-badges', getSet('ydesign_series_border_badges'));

            var sShape = getSet('ydesign_series_badge_shape');
            document.body.classList.remove('ydesign-series-shape-pill', 'ydesign-series-shape-rounded', 'ydesign-series-shape-square');
            document.body.classList.add('ydesign-series-shape-' + sShape);

            document.body.classList.remove('ydesign-hide-left-column');

            // Общие бейджи
            document.body.classList.toggle('ydesign-border-year', getSet('ydesign_border_year'));
            document.body.classList.toggle('ydesign-border-age', getSet('ydesign_border_age'));
            document.body.classList.toggle('ydesign-border-seasons', getSet('ydesign_border_seasons'));
            document.body.classList.toggle('ydesign-border-ua', getSet('ydesign_border_ua'));
            document.body.classList.toggle('ydesign-border-genres', getSet('ydesign_border_genres'));
            document.body.classList.toggle('ydesign-border-ratings', getSet('ydesign_border_ratings'));

            document.body.classList.toggle('ydesign-color-age', getSet('ydesign_color_age'));
            document.body.classList.toggle('ydesign-color-ua', getSet('ydesign_color_ua'));
            document.body.classList.toggle('ydesign-glass-pill', getSet('ydesign_glass_pill_bg'));
            document.body.classList.toggle('ydesign-hide-type-label', !getSet('ydesign_show_type_label'));
            document.body.dataset.ydesignTypeCorner = getSet('ydesign_type_label_corner') || 'top-right';
            var typePillSize = parseFloat(getSet('ydesign_type_label_size'));
            document.documentElement.style.setProperty('--ydesign-type-pill-size', (isNaN(typePillSize) ? 0.60 : typePillSize) + 'em');
            document.body.classList.toggle('ydesign-card-border', getSet('ydesign_card_border'));
            document.body.classList.toggle('ydesign-dark-badge-bg', getSet('ydesign_badge_dark_bg'));
            document.documentElement.style.setProperty('--ydesign-focus-color', getSet('ydesign_focus_color') || '#ffffff');
            document.documentElement.style.setProperty('--ydesign-focus-width', (parseFloat(getSet('ydesign_focus_width')) || 0.25) + 'em');

            var shape = getSet('ydesign_badge_shape');
            document.body.classList.remove('ydesign-shape-pill', 'ydesign-shape-rounded', 'ydesign-shape-square');
            document.body.classList.add('ydesign-shape-' + shape);

            document.body.dataset.ydesignLogo = getSet('ydesign_logo_type');

            // Серии
            var seriesCards = parseInt(getSet('ydesign_series_cards')) || 2;
            document.documentElement.style.setProperty('--ydesign-series-width', (100 / seriesCards) + '%');
            document.documentElement.style.setProperty('--ydesign-series-badge-size-val', getSet('ydesign_series_badge_size'));
            document.documentElement.style.setProperty('--ydesign-series-title-size-val', getSet('ydesign_series_title_size'));

            // Сетка
            document.documentElement.style.setProperty('--ydesign-grid-items-v', getSet('ydesign_grid_items_v'));
            document.documentElement.style.setProperty('--ydesign-grid-items-h', getSet('ydesign_grid_items_h'));
            document.documentElement.style.setProperty('--ydesign-card-gap', getSet('ydesign_card_gap') + 'em');
            document.documentElement.style.setProperty('--ydesign-ratings-saturate', getSet('ydesign_ratings_saturate') + '%');
            document.documentElement.style.setProperty('--ydesign-poster-caption-size', getSet('ydesign_poster_caption_size') + 'em');
            document.documentElement.style.setProperty('--ydesign-poster-caption-weight', getSet('ydesign_poster_caption_weight'));
            var captionStyle = getSet('ydesign_poster_caption_style');
            if (captionStyle === 'italic') {
                document.documentElement.style.setProperty('--ydesign-poster-caption-style', 'italic');
            } else if (captionStyle === 'bold') {
                document.documentElement.style.setProperty('--ydesign-poster-caption-style', 'normal');
                document.documentElement.style.setProperty('--ydesign-poster-caption-weight', '800');
            } else {
                document.documentElement.style.setProperty('--ydesign-poster-caption-style', 'normal');
            }

            var cardRadius = getSet('ydesign_card_radius');
            var radiusVal = '0.85em';
            if (cardRadius === 'rounded') radiusVal = '1.4em';
            else if (cardRadius === 'round') radiusVal = '2.5em';
            document.documentElement.style.setProperty('--ydesign-card-radius', radiusVal);

            // ----------------- ВЕРТИКАЛЬНЫЕ ПАРАМЕТРЫ -----------------
            document.body.classList.toggle('ydesign-v-uniform-badges', getSet('ydesign_v_uniform_badges', 'ydesign_uniform_badges'));
            document.body.classList.toggle('ydesign-v-uniform-gaps', getSet('ydesign_v_uniform_v_gaps', 'ydesign_uniform_v_gaps_vert'));
            document.body.classList.toggle('ydesign-v-badges-one-row', getSet('ydesign_v_badges_one_row', 'ydesign_badges_one_row'));

            document.body.classList.toggle('ydesign-v-hide-year', !getSet('ydesign_v_show_year', 'ydesign_show_year'));
            document.body.classList.toggle('ydesign-v-hide-seasons', !getSet('ydesign_v_show_seasons', 'ydesign_show_seasons'));
            document.body.classList.toggle('ydesign-v-hide-ua', !getSet('ydesign_v_show_ua', 'ydesign_show_ua'));
            document.body.classList.toggle('ydesign-v-hide-age', !getSet('ydesign_v_show_age', 'ydesign_show_age'));
            document.body.classList.toggle('ydesign-v-hide-genres', !getSet('ydesign_v_show_genres', 'ydesign_show_genres'));
            document.body.classList.toggle('ydesign-v-hide-slogan', !getSet('ydesign_v_show_slogan', 'ydesign_show_slogan'));
            document.body.classList.toggle('ydesign-v-hide-add-title', !getSet('ydesign_v_show_add_title', 'ydesign_show_add_title'));

            document.documentElement.style.setProperty('--ydesign-v-logo-max-h', getSet('ydesign_v_logo_max_h', 'ydesign_logo_max_h'));
            document.documentElement.style.setProperty('--ydesign-v-logo-max-w', getSet('ydesign_v_logo_max_w', 'ydesign_logo_max_w'));
            document.documentElement.style.setProperty('--ydesign-v-title-size', getSet('ydesign_v_title_size', 'ydesign_text_title_size'));
            document.documentElement.style.setProperty('--ydesign-v-add-title-size', getSet('ydesign_v_add_title_size', 'ydesign_text_add_title_size'));
            document.documentElement.style.setProperty('--ydesign-v-slogan-size', getSet('ydesign_v_slogan_size', 'ydesign_text_slogan_size'));
            document.documentElement.style.setProperty('--ydesign-v-badge-size', getSet('ydesign_v_badge_size', 'ydesign_text_badge_size'));
            document.documentElement.style.setProperty('--ydesign-v-year-size', getSet('ydesign_v_year_size', 'ydesign_text_year_size'));
            document.documentElement.style.setProperty('--ydesign-v-age-size', getSet('ydesign_v_age_size', 'ydesign_text_age_size'));
            document.documentElement.style.setProperty('--ydesign-v-seasons-size', getSet('ydesign_v_seasons_size', 'ydesign_text_seasons_size'));
            document.documentElement.style.setProperty('--ydesign-v-ua-size', getSet('ydesign_v_ua_size', 'ydesign_text_ua_size'));
            document.documentElement.style.setProperty('--ydesign-v-genres-size', getSet('ydesign_v_genres_size', 'ydesign_text_genres_size'));
            document.documentElement.style.setProperty('--ydesign-v-rating-size', getSet('ydesign_v_rating_size', 'ydesign_text_rating_size'));
            
            document.documentElement.style.setProperty('--ydesign-v-logo-mb', getSet('ydesign_v_logo_mb', 'ydesign_logo_mb') + 'em');
            document.documentElement.style.setProperty('--ydesign-v-add-title-mb', getSet('ydesign_v_add_title_mb', 'ydesign_add_title_mb') + 'em');
            document.documentElement.style.setProperty('--ydesign-v-badge-rows-gap', getSet('ydesign_v_badge_rows_gap', 'ydesign_badge_rows_gap') + 'em');
            document.documentElement.style.setProperty('--ydesign-v-badges-gap', getSet('ydesign_v_badges_gap', 'ydesign_badges_gap_vert') + 'em');
            document.documentElement.style.setProperty('--ydesign-v-genres-gap', getSet('ydesign_v_genres_gap', 'ydesign_genres_gap') + 'em');
            document.documentElement.style.setProperty('--ydesign-v-content-pb', getSet('ydesign_v_content_pb', 'ydesign_content_pb') + 'em');
            document.documentElement.style.setProperty('--ydesign-v-slogan-padding', getSet('ydesign_v_slogan_padding', 'ydesign_slogan_padding') + 'em');
            document.documentElement.style.setProperty('--ydesign-v-uniform-v-gap-val', getSet('ydesign_v_uniform_v_gap_val', 'ydesign_uniform_v_gap_val_vert') + 'em');

            var vAlignLogo = getSet('ydesign_v_align_logo', 'ydesign_align_logo');
            document.documentElement.style.setProperty('--ydesign-v-align-logo-flex', getFlexAlign(vAlignLogo));
            document.documentElement.style.setProperty('--ydesign-v-align-logo', vAlignLogo);
            document.documentElement.style.setProperty('--ydesign-v-align-add-title', getSet('ydesign_v_align_add_title', 'ydesign_align_add_title'));
            var vAlignBadges = getSet('ydesign_v_align_badges', 'ydesign_align_badges');
            document.documentElement.style.setProperty('--ydesign-v-align-badges-flex', getFlexAlign(vAlignBadges));
            var vAlignSlogan = getSet('ydesign_v_align_slogan', 'ydesign_align_slogan');
            document.documentElement.style.setProperty('--ydesign-v-align-slogan-flex', getFlexAlign(vAlignSlogan));
            document.documentElement.style.setProperty('--ydesign-v-align-slogan', vAlignSlogan);

            // ----------------- ГОРИЗОНТАЛЬНЫЕ ПАРАМЕТРЫ -----------------
            document.body.classList.toggle('ydesign-h-uniform-badges', getSet('ydesign_h_uniform_badges', 'ydesign_uniform_badges'));
            document.body.classList.toggle('ydesign-h-uniform-gaps', getSet('ydesign_h_uniform_v_gaps', 'ydesign_uniform_v_gaps_horz'));

            document.body.classList.toggle('ydesign-h-hide-desc', !getSet('ydesign_h_show_desc', 'ydesign_show_desc_horz'));
            document.body.classList.toggle('ydesign-h-hide-year', !getSet('ydesign_h_show_year', 'ydesign_show_year'));
            document.body.classList.toggle('ydesign-h-hide-seasons', !getSet('ydesign_h_show_seasons', 'ydesign_show_seasons'));
            document.body.classList.toggle('ydesign-h-hide-ua', !getSet('ydesign_h_show_ua', 'ydesign_show_ua'));
            document.body.classList.toggle('ydesign-h-hide-age', !getSet('ydesign_h_show_age', 'ydesign_show_age'));
            document.body.classList.toggle('ydesign-h-hide-genres', !getSet('ydesign_h_show_genres', 'ydesign_show_genres'));
            document.body.classList.toggle('ydesign-h-hide-slogan', !getSet('ydesign_h_show_slogan', 'ydesign_show_slogan'));
            document.body.classList.toggle('ydesign-h-hide-add-title', !getSet('ydesign_h_show_add_title', 'ydesign_show_add_title'));

            document.documentElement.style.setProperty('--ydesign-h-logo-max-h', getSet('ydesign_h_logo_max_h', 'ydesign_logo_max_h'));
            document.documentElement.style.setProperty('--ydesign-h-logo-max-w', getSet('ydesign_h_logo_max_w', 'ydesign_logo_max_w'));
            document.documentElement.style.setProperty('--ydesign-h-title-size', getSet('ydesign_h_title_size', 'ydesign_text_title_size'));
            document.documentElement.style.setProperty('--ydesign-h-add-title-size', getSet('ydesign_h_add_title_size', 'ydesign_text_add_title_size'));
            document.documentElement.style.setProperty('--ydesign-h-slogan-size', getSet('ydesign_h_slogan_size', 'ydesign_text_slogan_size'));
            document.documentElement.style.setProperty('--ydesign-h-desc-size', getSet('ydesign_h_desc_size', 'ydesign_desc_size'));
            document.documentElement.style.setProperty('--ydesign-h-badge-size', getSet('ydesign_h_badge_size', 'ydesign_text_badge_size'));
            document.documentElement.style.setProperty('--ydesign-h-year-size', getSet('ydesign_h_year_size', 'ydesign_text_year_size'));
            document.documentElement.style.setProperty('--ydesign-h-age-size', getSet('ydesign_h_age_size', 'ydesign_text_age_size'));
            document.documentElement.style.setProperty('--ydesign-h-seasons-size', getSet('ydesign_h_seasons_size', 'ydesign_text_seasons_size'));
            document.documentElement.style.setProperty('--ydesign-h-ua-size', getSet('ydesign_h_ua_size', 'ydesign_text_ua_size'));
            document.documentElement.style.setProperty('--ydesign-h-genres-size', getSet('ydesign_h_genres_size', 'ydesign_text_genres_size'));
            document.documentElement.style.setProperty('--ydesign-h-rating-size', getSet('ydesign_h_rating_size', 'ydesign_text_rating_size'));
            
            document.documentElement.style.setProperty('--ydesign-h-logo-mb', getSet('ydesign_h_logo_mb', 'ydesign_logo_mb') + 'em');
            document.documentElement.style.setProperty('--ydesign-h-add-title-mb', getSet('ydesign_h_add_title_mb', 'ydesign_add_title_mb') + 'em');
            document.documentElement.style.setProperty('--ydesign-h-badge-rows-gap', getSet('ydesign_h_badge_rows_gap', 'ydesign_badge_rows_gap') + 'em');
            document.documentElement.style.setProperty('--ydesign-h-badges-gap', getSet('ydesign_h_badges_gap', 'ydesign_badges_gap_horz') + 'em');
            document.documentElement.style.setProperty('--ydesign-h-genres-gap', getSet('ydesign_h_genres_gap', 'ydesign_genres_gap') + 'em');
            document.documentElement.style.setProperty('--ydesign-h-content-pb', getSet('ydesign_h_content_pb', 'ydesign_content_pb') + 'em');
            document.documentElement.style.setProperty('--ydesign-h-slogan-padding', getSet('ydesign_h_slogan_padding', 'ydesign_slogan_padding') + 'em');
            document.documentElement.style.setProperty('--ydesign-h-uniform-v-gap-val', getSet('ydesign_h_uniform_v_gap_val', 'ydesign_uniform_v_gap_val_horz') + 'em');

            var hAlignLogo = getSet('ydesign_h_align_logo', 'ydesign_align_logo');
            document.documentElement.style.setProperty('--ydesign-h-align-logo-flex', getFlexAlign(hAlignLogo));
            document.documentElement.style.setProperty('--ydesign-h-align-logo', hAlignLogo);
            document.documentElement.style.setProperty('--ydesign-h-align-add-title', getSet('ydesign_h_align_add_title', 'ydesign_align_add_title'));
            var hAlignBadges = getSet('ydesign_h_align_badges', 'ydesign_align_badges');
            document.documentElement.style.setProperty('--ydesign-h-align-badges-flex', getFlexAlign(hAlignBadges));
            var hAlignSlogan = getSet('ydesign_h_align_slogan', 'ydesign_align_slogan');
            document.documentElement.style.setProperty('--ydesign-h-align-slogan-flex', getFlexAlign(hAlignSlogan));
            document.documentElement.style.setProperty('--ydesign-h-align-slogan', hAlignSlogan);
            updateBorderStyles();
        } catch (e) {}
    }

    // =========================================================================
    // 11. МЕНЮ НАСТРОЕК (YDesign)
    // =========================================================================
    function createSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;

        // Все настройки уже на русском, перевод не требуется
        var nativeAddParam = Lampa.SettingsApi.addParam;

        var qualities = { 'w92': 'w92', 'w154': 'w154', 'w200': 'w200', 'w300': 'w300', 'w500': 'w500', 'w780': 'w780', 'original': 'Оригинал' };

        var textSizesExt = {};
        for (var i = 5; i <= 40; i += 1) { var v = (i / 10).toFixed(1); textSizesExt[v] = v; }

        var gaps = {};
        for (var g = -20; g <= 40; g += 1) { var gv = (g / 10).toFixed(1); gaps[gv] = gv + ' em'; }

        var tinyGaps = {};
        for (var tg = -20; tg <= 40; tg += 1) { var tgv = (tg * 0.05).toFixed(2); tinyGaps[tgv] = tgv + ' em'; }

        var microGaps = {};
        for (var mg = -100; mg <= 200; mg += 1) { var mgv = (mg / 100).toFixed(2); microGaps[mgv] = mgv + ' em'; }

        var logoSizes = {};
        for (var ls = 1; ls <= 34; ls += 3) { logoSizes[ls] = ls + '%'; }
        logoSizes[35] = '35%';
        [40, 50, 60, 70, 80, 90, 100].forEach(function (val) { logoSizes[val] = val + '%'; });

        var saturates = { '0': '0% (Чёрно-белые)', '25': '25%', '75': '75%', '100': '100% (Цветные)' };
        var aligns = { 'left': 'Слева', 'center': 'По центру', 'right': 'Справа' };
        var shapes = { 'pill': 'Капсула', 'rounded': 'Скруглённый прямоугольник (4px)', 'square': 'Прямоугольник (2px)' };

        var sectionKeys = ['ydesign_grid', 'ydesign_vertical', 'ydesign_horizontal', 'ydesign_badges_style', 'ydesign_texts', 'ydesign_series', 'ydesign_perf'];
        sectionKeys.forEach(function (compKey) {
            Lampa.Template.add('settings_' + compKey, '<div></div>');
        });

        Lampa.SettingsApi.addComponent({
            component: 'ydesign',
            name: CONFIG.name,
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><path d="M8 8l4 4 4-4"></path><path d="M12 12v4"></path></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { type: 'title' },
            field: { name: 'Разделы настроек' }
        });

        var subSections = [
            { id: 'ydesign_grid', name: '🎬 Отображение карточек и сетка', desc: 'Формат карточек, количество колонок и ленивая загрузка' },
            { id: 'ydesign_vertical', name: '📱 Вертикальные карточки', desc: 'Размеры, логотип, слоган, бейджи, отступы и выравнивание' },
            { id: 'ydesign_horizontal', name: '💻 Горизонтальные карточки', desc: 'Размеры, логотип, описание, бейджи, отступы и выравнивание' },
            { id: 'ydesign_badges_style', name: '🏷️ Стили бейджей и рейтинги', desc: 'Форма, стеклянный фон, рамки, цвета возраста и выбор рейтингов' },
            { id: 'ydesign_texts', name: '🔤 Языки, логотипы и качество', desc: 'Языки логотипа, слогана и описания, тип логотипа и качество TMDB' },
            { id: 'ydesign_series', name: '📺 Дизайн сезонов и эпизодов', desc: 'Размеры бейджей, карточки, дата, озвучка и рейтинг' },
            { id: 'ydesign_perf', name: '⚙️ API-ключи и кеш', desc: 'Ключи OMDb/MDBList и очистка кеша плагина' }
        ];

        subSections.forEach(function (sub) {
            Lampa.SettingsApi.addParam({
                component: 'ydesign',
                param: { type: 'button' },
                field: { name: sub.name, description: sub.desc },
                onChange: function () {
                    Lampa.Settings.create(sub.id, {
                        onBack: function () {
                            Lampa.Settings.create('ydesign');
                        }
                    });
                }
            });
        });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 1: СЕТКА И ТИПЫ КАРТОЧЕК (ydesign_grid)
        // -------------------------------------------------------------
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_show_poster_caption', type: 'trigger', default: DefaultSettings.ydesign_show_poster_caption }, field: { name: 'Показывать название под постером', description: 'Показывать название фильма или сериала под постером' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_poster_caption_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_poster_caption_size }, field: { name: 'Размер шрифта названия под постером', description: 'Больше или меньше шрифт названия под постером' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_poster_caption_weight', type: 'select', values: { '300': '300 (Тонкий)', '400': '400 (Обычный)', '500': '500 (Средний)', '600': '600 (Полужирный)', '700': '700 (Жирный)', '800': '800 (Очень жирный)', '900': '900 (Максимально жирный)' }, default: DefaultSettings.ydesign_poster_caption_weight }, field: { name: 'Толщина шрифта названия под постером', description: 'Жирнее или тоньше шрифт названия под постером' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_poster_caption_style', type: 'select', values: { 'normal': 'Обычный', 'italic': 'Курсив', 'bold': 'Жирный курсив' }, default: DefaultSettings.ydesign_poster_caption_style }, field: { name: 'Стиль шрифта названия под постером', description: 'Обычный, курсив или жирный курсив' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_card_radius', type: 'select', values: { 'default': 'По умолчанию', 'rounded': 'Скруглённые', 'round': 'Круглые' }, default: DefaultSettings.ydesign_card_radius }, field: { name: 'Скругление углов постеров', description: 'Форма углов карточек: по умолчанию, скруглённые или круглые' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_show_type_label', type: 'trigger', default: DefaultSettings.ydesign_show_type_label }, field: { name: 'Плашка «Фильм / Сериал»' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_type_label_corner', type: 'select', values: { 'top-right': 'Сверху справа', 'top-left': 'Сверху слева', 'bottom-right': 'Снизу справа', 'bottom-left': 'Снизу слева' }, default: DefaultSettings.ydesign_type_label_corner }, field: { name: 'Положение плашки типа' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_type_label_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_type_label_size }, field: { name: 'Размер плашки типа' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_no_blur', type: 'trigger', default: DefaultSettings.ydesign_no_blur }, field: { name: 'Четкие постеры (без размытия)', description: 'Постеры отображаются в максимальном качестве без тумана и градиентов' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_lazy_load', type: 'trigger', default: DefaultSettings.ydesign_lazy_load }, field: { name: 'Ленивая загрузка', description: 'Загружать доп. данные (логотипы, рейтинги) только при появлении карточки на экране' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_card_type_main', type: 'select', values: { 'vertical': 'Вертикальные (9:16)', 'horizontal': 'Горизонтальные (16:11)' }, default: DefaultSettings.ydesign_card_type_main }, field: { name: 'Тип карточек (Главная)' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_card_type_other', type: 'select', values: { 'vertical': 'Вертикальные (9:16)', 'horizontal': 'Горизонтальные (16:11)' }, default: DefaultSettings.ydesign_card_type_other }, field: { name: 'Тип карточек (Другие страницы)' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_grid_items_v', type: 'select', values: { '4': '4', '5': '5', '6': '6', '7': '7', '8': '8' }, default: DefaultSettings.ydesign_grid_items_v }, field: { name: 'Количество карточек в сетке (вертикальные)' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_grid_items_h', type: 'select', values: { '2': '2', '3': '3', '4': '4', '5': '5' }, default: DefaultSettings.ydesign_grid_items_h }, field: { name: 'Количество карточек в сетке (горизонтальные)' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_card_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_card_gap }, field: { name: 'Расстояние между карточками' } });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 2: ВЕРТИКАЛЬНЫЕ КАРТОЧКИ (ydesign_vertical)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { type: 'title' }, field: { name: 'Размеры логотипа и названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_logo_max_h', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_v_logo_max_h }, field: { name: 'Макс. высота логотипа/текста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_logo_max_w', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_v_logo_max_w }, field: { name: 'Макс. ширина логотипа/текста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_title_size }, field: { name: 'Размер текста основного названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_add_title', type: 'trigger', default: DefaultSettings.ydesign_v_show_add_title }, field: { name: 'Показывать доп. название' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_add_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_add_title_size }, field: { name: 'Размер доп. названия' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_slogan', type: 'trigger', default: DefaultSettings.ydesign_v_show_slogan }, field: { name: 'Показывать слоган' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_slogan_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_slogan_size }, field: { name: 'Размер слогана' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { type: 'title' }, field: { name: 'Видимость и размеры бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_year', type: 'trigger', default: DefaultSettings.ydesign_v_show_year }, field: { name: 'Показывать Год' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_seasons', type: 'trigger', default: DefaultSettings.ydesign_v_show_seasons }, field: { name: 'Показывать Сезоны/Серии' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_age', type: 'trigger', default: DefaultSettings.ydesign_v_show_age }, field: { name: 'Показывать возрастной рейтинг' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_ua', type: 'trigger', default: DefaultSettings.ydesign_v_show_ua }, field: { name: 'Показывать плашку UA' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_genres', type: 'trigger', default: DefaultSettings.ydesign_v_show_genres }, field: { name: 'Показывать Жанры' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_badges_one_row', type: 'trigger', default: DefaultSettings.ydesign_v_badges_one_row }, field: { name: 'Все бейджи в 1 ряд' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_uniform_badges', type: 'trigger', default: DefaultSettings.ydesign_v_uniform_badges }, field: { name: 'Все бейджи одного размера' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_badge_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_badge_size }, field: { name: 'Базовый размер бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_year_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_year_size }, field: { name: 'Размер бейджа Года' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_age_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_age_size }, field: { name: 'Размер бейджа Возраста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_seasons_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_seasons_size }, field: { name: 'Размер бейджа Сезонов/Серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_ua_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_ua_size }, field: { name: 'Размер бейджа UA озвучки' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_genres_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_genres_size }, field: { name: 'Размер бейджей Жанров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_rating_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_rating_size }, field: { name: 'Размер бейджей Рейтингов' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { type: 'title' }, field: { name: 'Выравнивание и Отступы' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_align_logo', type: 'select', values: aligns, default: DefaultSettings.ydesign_v_align_logo }, field: { name: 'Выравнивание: Логотип/Название' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_align_add_title', type: 'select', values: aligns, default: DefaultSettings.ydesign_v_align_add_title }, field: { name: 'Выравнивание: Доп. название' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_align_badges', type: 'select', values: aligns, default: DefaultSettings.ydesign_v_align_badges }, field: { name: 'Выравнивание: Бейджи/Рейтинги' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_align_slogan', type: 'select', values: aligns, default: DefaultSettings.ydesign_v_align_slogan }, field: { name: 'Выравнивание: Слоган' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_uniform_v_gaps', type: 'trigger', default: DefaultSettings.ydesign_v_uniform_v_gaps }, field: { name: 'Одинаковые вертикальные отступы' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_uniform_v_gap_val', type: 'select', values: microGaps, default: DefaultSettings.ydesign_v_uniform_v_gap_val }, field: { name: 'Значение вертикального отступа' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_badges_gap', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_v_badges_gap }, field: { name: 'Расстояние между бейджами по горизонтали' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_badge_rows_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_v_badge_rows_gap }, field: { name: 'Отступ между рядами бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_genres_gap', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_v_genres_gap }, field: { name: 'Отступ блока Жанров (Ручной режим)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_content_pb', type: 'select', values: gaps, default: DefaultSettings.ydesign_v_content_pb }, field: { name: 'Отступ контента снизу' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_slogan_padding', type: 'select', values: gaps, default: DefaultSettings.ydesign_v_slogan_padding }, field: { name: 'Отступ слогана сверху' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_logo_mb', type: 'select', values: gaps, default: DefaultSettings.ydesign_v_logo_mb }, field: { name: 'Отступ названия/лого от бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_add_title_mb', type: 'select', values: gaps, default: DefaultSettings.ydesign_v_add_title_mb }, field: { name: 'Отступ доп. названия от бейджей' } });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 3: ГОРИЗОНТАЛЬНЫЕ КАРТОЧКИ (ydesign_horizontal)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { type: 'title' }, field: { name: 'Размеры логотипа и названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_logo_max_h', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_h_logo_max_h }, field: { name: 'Макс. высота логотипа/текста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_logo_max_w', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_h_logo_max_w }, field: { name: 'Макс. ширина логотипа/текста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_title_size }, field: { name: 'Размер текста основного названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_add_title', type: 'trigger', default: DefaultSettings.ydesign_h_show_add_title }, field: { name: 'Показывать доп. название' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_add_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_add_title_size }, field: { name: 'Размер доп. названия' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_slogan', type: 'trigger', default: DefaultSettings.ydesign_h_show_slogan }, field: { name: 'Показывать слоган' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_slogan_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_slogan_size }, field: { name: 'Размер слогана' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_desc', type: 'trigger', default: DefaultSettings.ydesign_h_show_desc }, field: { name: 'Показывать описание под карточкой' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_desc_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_desc_size }, field: { name: 'Размер текста описания' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { type: 'title' }, field: { name: 'Видимость и размеры бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_year', type: 'trigger', default: DefaultSettings.ydesign_h_show_year }, field: { name: 'Показывать Год' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_seasons', type: 'trigger', default: DefaultSettings.ydesign_h_show_seasons }, field: { name: 'Показывать Сезоны/Серии' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_age', type: 'trigger', default: DefaultSettings.ydesign_h_show_age }, field: { name: 'Показывать возрастной рейтинг' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_ua', type: 'trigger', default: DefaultSettings.ydesign_h_show_ua }, field: { name: 'Показывать плашку UA' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_genres', type: 'trigger', default: DefaultSettings.ydesign_h_show_genres }, field: { name: 'Показывать Жанры' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_ratings_row', type: 'trigger', default: DefaultSettings.ydesign_h_ratings_row }, field: { name: 'Рейтинги с новой строки' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_uniform_badges', type: 'trigger', default: DefaultSettings.ydesign_h_uniform_badges }, field: { name: 'Все бейджи одного размера' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_badge_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_badge_size }, field: { name: 'Базовый размер бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_year_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_year_size }, field: { name: 'Размер бейджа Года' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_age_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_age_size }, field: { name: 'Размер бейджа Возраста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_seasons_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_seasons_size }, field: { name: 'Размер бейджа Сезонов/Серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_ua_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_ua_size }, field: { name: 'Размер бейджа UA озвучки' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_genres_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_genres_size }, field: { name: 'Размер бейджей Жанров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_rating_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_rating_size }, field: { name: 'Размер бейджей Рейтингов' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { type: 'title' }, field: { name: 'Выравнивание и Отступы' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_align_logo', type: 'select', values: aligns, default: DefaultSettings.ydesign_h_align_logo }, field: { name: 'Выравнивание: Логотип/Название' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_align_add_title', type: 'select', values: aligns, default: DefaultSettings.ydesign_h_align_add_title }, field: { name: 'Выравнивание: Доп. название' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_align_badges', type: 'select', values: aligns, default: DefaultSettings.ydesign_h_align_badges }, field: { name: 'Выравнивание: Бейджи/Рейтинги' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_align_slogan', type: 'select', values: aligns, default: DefaultSettings.ydesign_h_align_slogan }, field: { name: 'Выравнивание: Слоган' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_uniform_v_gaps', type: 'trigger', default: DefaultSettings.ydesign_h_uniform_v_gaps }, field: { name: 'Одинаковые вертикальные отступы' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_uniform_v_gap_val', type: 'select', values: microGaps, default: DefaultSettings.ydesign_h_uniform_v_gap_val }, field: { name: 'Значение вертикального отступа' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_badges_gap', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_h_badges_gap }, field: { name: 'Расстояние между бейджами по горизонтали' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_badge_rows_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_h_badge_rows_gap }, field: { name: 'Отступ между рядами бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_genres_gap', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_h_genres_gap }, field: { name: 'Отступ блока Жанров (Ручной режим)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_content_pb', type: 'select', values: gaps, default: DefaultSettings.ydesign_h_content_pb }, field: { name: 'Отступ контента снизу' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_slogan_padding', type: 'select', values: gaps, default: DefaultSettings.ydesign_h_slogan_padding }, field: { name: 'Отступ слогана сверху' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_logo_mb', type: 'select', values: gaps, default: DefaultSettings.ydesign_h_logo_mb }, field: { name: 'Отступ названия/лого от бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_add_title_mb', type: 'select', values: gaps, default: DefaultSettings.ydesign_h_add_title_mb }, field: { name: 'Отступ доп. названия от бейджей' } });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 4: СТИЛИ БЕЙДЖЕЙ И РЕЙТИНГИ (ydesign_badges_style)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_badge_shape', type: 'select', values: shapes, default: DefaultSettings.ydesign_badge_shape }, field: { name: 'Форма бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_glass_pill_bg', type: 'trigger', default: DefaultSettings.ydesign_glass_pill_bg }, field: { name: 'Стеклянная подложка (Liquid Glass)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_color_age', type: 'trigger', default: DefaultSettings.ydesign_color_age }, field: { name: 'Цветные бейджи возраста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_color_ua', type: 'trigger', default: DefaultSettings.ydesign_color_ua }, field: { name: 'Цветная плашка UA (Сине-жёлтая)' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_badge_dark_bg', type: 'trigger', default: DefaultSettings.ydesign_badge_dark_bg }, field: { name: 'Затемнение фона бейджей', description: 'Добавляет полупрозрачную тёмную подложку для читаемости' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { type: 'title' }, field: { name: 'Рамки для элементов' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_year', type: 'trigger', default: DefaultSettings.ydesign_border_year }, field: { name: 'Рамка для бейджа Года' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_age', type: 'trigger', default: DefaultSettings.ydesign_border_age }, field: { name: 'Рамка для бейджа Возраста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_seasons', type: 'trigger', default: DefaultSettings.ydesign_border_seasons }, field: { name: 'Рамка для бейджа Сезонов/Серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_ua', type: 'trigger', default: DefaultSettings.ydesign_border_ua }, field: { name: 'Рамка для бейджа UA озвучки' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_genres', type: 'trigger', default: DefaultSettings.ydesign_border_genres }, field: { name: 'Рамка для бейджей Жанров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_ratings', type: 'trigger', default: DefaultSettings.ydesign_border_ratings }, field: { name: 'Рамка для бейджей Рейтингов' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_card_border', type: 'trigger', default: DefaultSettings.ydesign_card_border }, field: { name: 'Цветная рамка карточки' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_card_border_width', type: 'select', values: { '0.10': 'Тонкая', '0.20': 'Средняя', '0.30': 'Толстая', '0.40': 'Очень толстая' }, default: DefaultSettings.ydesign_card_border_width }, field: { name: 'Толщина рамки карточки' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_card_border_color', type: 'select', values: { '#2b7fff': 'Синяя', '#9b59b6': 'Фиолетовая', '#00c853': 'Зелёная', '#ff9800': 'Оранжевая', '#ffffff': 'Белая', '#f44336': 'Красная' }, default: DefaultSettings.ydesign_card_border_color }, field: { name: 'Цвет рамки карточки' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { type: 'title' }, field: { name: 'Фокус постера' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_focus_width', type: 'select', values: { '0.15': 'Тонкий', '0.25': 'Средний', '0.35': 'Толстый', '0.50': 'Очень толстый' }, default: DefaultSettings.ydesign_focus_width }, field: { name: 'Толщина рамки фокуса' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_focus_color', type: 'select', values: { '#ffffff': 'Белая', '#2b7fff': 'Синяя', '#9b59b6': 'Фиолетовая', '#00c853': 'Зелёная', '#ff9800': 'Оранжевая', '#f44336': 'Красная' }, default: DefaultSettings.ydesign_focus_color }, field: { name: 'Цвет рамки фокуса' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { type: 'title' }, field: { name: 'Выбор и насыщенность рейтингов' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_ratings_saturate', type: 'select', values: saturates, default: DefaultSettings.ydesign_ratings_saturate }, field: { name: 'Насыщенность иконок рейтингов' } });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_badges_style',
            param: { name: 'ydesign_ratings_order_btn', type: 'button' },
            field: { name: 'Порядок и выбор рейтингов', description: getSet('ydesign_ratings_order') },
            onChange: function () {
                Lampa.Input.edit({
                    title: 'Введите через запятую (tmdb, imdb, rt, mc, trakt, mdblist, popcorn, letterboxd, kp)',
                    value: getSet('ydesign_ratings_order'),
                    free: true, nosave: true
                }, function (new_val) {
                    if (new_val !== undefined) {
                        Lampa.Storage.set('ydesign_ratings_order', new_val.trim().toLowerCase());
                        Lampa.Settings.update();
                    }
                });
            }
        });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 5: ЯЗЫКИ, ЛОГОТИПЫ И КАЧЕСТВО (ydesign_texts)
        // -------------------------------------------------------------
         Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_logo_type', type: 'select', values: { 'logo': 'Логотип (изображение)', 'text': 'Текст' }, default: DefaultSettings.ydesign_logo_type }, field: { name: 'Отображение названия' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_lang', type: 'select', values: { 'ru': 'Русский' }, default: DefaultSettings.ydesign_lang }, field: { name: 'Язык логотипа и названия' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_slogan_lang', type: 'select', values: { 'ru': 'Русский' }, default: DefaultSettings.ydesign_slogan_lang }, field: { name: 'Язык слогана' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_desc_lang', type: 'select', values: { 'ru': 'Русский' }, default: DefaultSettings.ydesign_desc_lang }, field: { name: 'Язык описания' } });
         Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_add_title_lang', type: 'select', values: { 'ru': 'Русский' }, default: DefaultSettings.ydesign_add_title_lang }, field: { name: 'Язык дополнительного названия' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_poster_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_poster_quality }, field: { name: 'Качество постеров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_backdrop_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_backdrop_quality }, field: { name: 'Качество фонов' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_logo_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_logo_quality }, field: { name: 'Качество логотипов' } });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 6: РЕДИЗАЙН СЕРИЙ И ЭПИЗОДОВ (ydesign_series)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_redesign', type: 'trigger', default: DefaultSettings.ydesign_series_redesign }, field: { name: 'Изменить вид серий', description: 'Активировать новый вид карточек серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_cards', type: 'select', values: { '1': '1', '2': '2', '3': '3', '4': '4' }, default: DefaultSettings.ydesign_series_cards }, field: { name: 'Количество карточек серий' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { type: 'title' }, field: { name: 'Размеры элементов на карточках серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_badge_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_series_badge_size }, field: { name: 'Размер бейджей на сериях' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_series_title_size }, field: { name: 'Размер названия серии' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { type: 'title' }, field: { name: 'Стиль и бейджи на карточках серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_badge_shape', type: 'select', values: shapes, default: DefaultSettings.ydesign_series_badge_shape }, field: { name: 'Форма бейджей на сериях' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_glass_pill', type: 'trigger', default: DefaultSettings.ydesign_series_glass_pill }, field: { name: 'Стеклянная подложка (Liquid Glass)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_border_badges', type: 'trigger', default: DefaultSettings.ydesign_series_border_badges }, field: { name: 'Рамка для бейджей серий' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_show_date', type: 'trigger', default: DefaultSettings.ydesign_series_show_date }, field: { name: 'Показывать дату выхода (сверху слева)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_show_voice', type: 'trigger', default: DefaultSettings.ydesign_series_show_voice }, field: { name: 'Показывать студию озвучки (отдельной строкой)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_show_rate', type: 'trigger', default: DefaultSettings.ydesign_series_show_rate }, field: { name: 'Показывать рейтинг (сверху справа)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_show_time', type: 'trigger', default: DefaultSettings.ydesign_series_show_time }, field: { name: 'Показывать длительность серии (снизу справа)' } });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 7: API-КЛЮЧИ И КЕШ (ydesign_perf)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({
            component: 'ydesign_perf',
            param: { name: 'ydesign_omdb_key_btn', type: 'button' },
            field: { name: 'OMDB API Key', description: getSet('ydesign_omdb_key') ? 'Установлено' : 'Не установлено' },
            onChange: function () {
                Lampa.Input.edit({ title: 'OMDB API Key', value: getSet('ydesign_omdb_key'), free: true, nosave: true }, function (new_val) {
                    if (new_val !== undefined) { Lampa.Storage.set('ydesign_omdb_key', new_val.trim()); Lampa.Settings.update(); }
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_perf',
            param: { name: 'ydesign_mdblist_key_btn', type: 'button' },
            field: { name: 'MDBList API Key', description: getSet('ydesign_mdblist_key') ? 'Установлено' : 'Не установлено' },
            onChange: function () {
                Lampa.Input.edit({ title: 'MDBList API Key', value: getSet('ydesign_mdblist_key'), free: true, nosave: true }, function (new_val) {
                    if (new_val !== undefined) { Lampa.Storage.set('ydesign_mdblist_key', new_val.trim()); Lampa.Settings.update(); }
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_perf',
            param: { name: 'ydesign_clear_cache', type: 'button' },
             field: { name: 'Очистить кеш плагина', description: 'Удаляет кеш изображений, рейтингов и проверок озвучки' },
            onChange: function () {
                MemoryCache.clear();
                var keysToRemove = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && (key.indexOf('ydesign_c_') === 0 || key.indexOf('ydesign_cache_') === 0)) keysToRemove.push(key);
                }
                keysToRemove.forEach(function (k) { localStorage.removeItem(k); });
                 Lampa.Noty.show('Кеш плагина успешно очищен (' + keysToRemove.length + ' записей)');
            }
        });
        Lampa.SettingsApi.addParam = nativeAddParam;
        Lampa.Settings.listener.follow('change', function (e) {
            if (e && e.name && e.name.indexOf('ydesign_') !== -1) {
                applyDynamicCSS();

                var nonCssParams = [
                    'ydesign_lang', 'ydesign_slogan_lang', 'ydesign_desc_lang', 'ydesign_add_title_lang',
                    'ydesign_poster_quality', 'ydesign_backdrop_quality', 'ydesign_logo_quality',
                    'ydesign_ratings_order', 'ydesign_omdb_key', 'ydesign_mdblist_key',
                    'ydesign_v_show_genres', 'ydesign_h_show_genres',
                    'ydesign_v_show_add_title', 'ydesign_h_show_add_title',
                    'ydesign_v_show_slogan', 'ydesign_h_show_slogan',
                    'ydesign_h_show_desc', 'ydesign_show_poster_caption'
                ];

                if (nonCssParams.indexOf(e.name) !== -1) {
                    document.querySelectorAll('.ydesign-card').forEach(function (c) {
                        if (c._ydesign_data) buildCardCustomDOM(c, c._ydesign_data);
                    });
                    document.querySelectorAll('.online-prestige--full').forEach(function (c) {
                        c.dataset.fixedLayout = "false";
                        formatPrestigeCard(c);
                    });
                }
            }
        });
    }

    // =========================================================================
    // 12. ПЕРЕХОПЛЕННЯ ТА РЕНДЕРИНГ КАРТОК
    // =========================================================================
    function overrideCards() {
        try {
            var CardMaker = Lampa.Maker.map('Card');
            if (!CardMaker || !CardMaker.Card) return;

            var originalOnCreate = CardMaker.Card.onCreate;
            var originalOnVisible = CardMaker.Card.onVisible;

            CardMaker.Card.onCreate = function () {
                if (isMovieCard(this.data, this.html)) {
                    if (typeof this.getPosterPath === 'function') {
                        this.nativeGetPosterPath = this.getPosterPath;
                        this.getPosterPath = function () {
                            return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                        };
                    }
                    if (typeof this.getBackgroundPath === 'function') {
                        this.nativeGetBackgroundPath = this.getBackgroundPath;
                        this.getBackgroundPath = function () {
                            return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                        };
                    }
                }

                if (typeof originalOnCreate === 'function') {
                    originalOnCreate.apply(this, arguments);
                }
            };

            CardMaker.Card.onVisible = function () {
                if (isMovieCard(this.data, this.html)) {
                    this.image_loaded = true;
                    if (this.img && !this.img.src) {
                        this.img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                    }
                    if (this.html) {
                        this.html.removeClass('card--preload').addClass('card--loaded');
                    }
                }

                if (typeof originalOnVisible === 'function') {
                    originalOnVisible.apply(this, arguments);
                }

                if (isMovieCard(this.data, this.html)) {
                    var cardEl = this.html[0] || this.html;
                    if (!cardEl._ydesign_built) {
                        cardEl._ydesign_built = true;
                        cardEl._ydesign_data = this.data;

                        var activeComp = (Lampa.Activity && Lampa.Activity.active()) ? Lampa.Activity.active().component : 'main';
                        cardEl._ydesign_isMain = (activeComp === 'main');

                        buildCardCustomDOM(cardEl, this.data);
                    }
                }
            };
        } catch (e) {}
    }

    // =========================================================================
    // 13. УЛУЧШЕННЫЙ РЕДИЗАЙН СЕРИЙ И ЭПИЗОДОВ
    // =========================================================================
    function cleanBulletsAndSymbols(str) {
        if (!str) return '';
        return str
            .replace(/[\u2022\u25CF\u00B7\u2219\u2043\u25AA\u25AB\u25C6\u2023•●·|*—–/\\]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isValidNumericRating(str) {
        if (!str) return false;
        var cleaned = str.replace(/[★\s]/g, '').trim();
        if (!/^\d+(\.\d+)?$/.test(cleaned)) return false;
        var num = parseFloat(cleaned);
        return !isNaN(num) && num > 0 && num <= 10;
    }

    function isQualityString(str) {
        if (!str) return false;
        return /^(2160p|1080p|720p|480p|360p|4k|uhd|hdr|fhd|hd|sd)$/i.test(str.trim());
    }

    function hookTemplates() {
        if (!window.Lampa || !Lampa.Template) return;
        
        if (Lampa.Template.get && !Lampa.Template._ydesign_hooked_get) {
            Lampa.Template._ydesign_hooked_get = true;
            var origGet = Lampa.Template.get;
            Lampa.Template.get = function(name, vars, like_static) {
                var res = origGet.apply(this, arguments);
                if (name === 'online_prestige_full' && vars) {
                    try {
                        if (typeof res === 'object' && res.length && res[0]) {
                            res[0]._online_data = vars;
                            res[0].data = vars;
                            if (vars.season !== undefined) res[0].dataset.season = vars.season;
                            if (vars.episode !== undefined) res[0].dataset.episode = vars.episode;
                            if (vars.voice_name) res[0].dataset.voice = vars.voice_name;
                            if (vars.quality) res[0].dataset.quality = vars.quality;
                        }
                    } catch(e) {}
                }
                return res;
            };
        }
        
        if (Lampa.Template.js && !Lampa.Template._ydesign_hooked_js) {
            Lampa.Template._ydesign_hooked_js = true;
            var origJs = Lampa.Template.js;
            Lampa.Template.js = function(name, vars) {
                var res = origJs.apply(this, arguments);
                if (name === 'online_prestige_full' && vars && res) {
                    try {
                        res._online_data = vars;
                        res.data = vars;
                        if (vars.season !== undefined) res.dataset.season = vars.season;
                        if (vars.episode !== undefined) res.dataset.episode = vars.episode;
                        if (vars.voice_name) res.dataset.voice = vars.voice_name;
                        if (vars.quality) res.dataset.quality = vars.quality;
                    } catch(e) {}
                }
                return res;
            };
        }
    }

    function getCurrentMovie() {
        if (!window.Lampa) return null;
        if (Lampa.Activity && Lampa.Activity.active) {
            var act = Lampa.Activity.active();
            if (act) {
                if (act.movie) {
                    var m1 = typeof act.movie === 'function' ? act.movie() : act.movie;
                    if (m1 && (m1.id || m1.title || m1.name)) return m1;
                }
                if (act.card) {
                    var m2 = typeof act.card === 'function' ? act.card() : act.card;
                    if (m2 && (m2.id || m2.title || m2.name)) return m2;
                }
                if (act.data && act.data.movie) return act.data.movie;
                if (act.activity) {
                    var a = act.activity;
                    if (a.movie) {
                        var m3 = typeof a.movie === 'function' ? a.movie() : a.movie;
                        if (m3 && (m3.id || m3.title || m3.name)) return m3;
                    }
                    if (a.card) {
                        var m4 = typeof a.card === 'function' ? a.card() : a.card;
                        if (m4 && (m4.id || m4.title || m4.name)) return m4;
                    }
                    if (a.object && a.object.movie) return a.object.movie;
                    if (a.props && a.props.card) return a.props.card;
                }
            }
        }
        if (window.lampa_movie) return window.lampa_movie;
        return null;
    }

    function getEpisodeNumber(card) {
        var data = card.data || card._online_data || {};
        
        if (data.episode !== undefined && data.episode !== null && data.episode !== '') {
            var epD = parseInt(data.episode, 10);
            if (!isNaN(epD) && epD > 0) return epD;
        }
        
        if (card.dataset.episode) {
            var epDs = parseInt(card.dataset.episode, 10);
            if (!isNaN(epDs) && epDs > 0) return epDs;
        }
        
        var epBadge = card.querySelector('.online-prestige__episode-number');
        if (epBadge) {
            var epBNum = parseInt(epBadge.innerText.trim(), 10);
            if (!isNaN(epBNum) && epBNum > 0) return epBNum;
        }
        
        var rawText = ((data.title || '') + ' ' + (card.querySelector('.online-prestige__title') ? card.querySelector('.online-prestige__title').innerText : '')).toLowerCase();
        
        var seMatch = /s\d+\s*e(\d+)/i.exec(rawText);
        if (seMatch) {
            var epSe = parseInt(seMatch[1], 10);
            if (!isNaN(epSe) && epSe > 0) return epSe;
        }
        
        var epMatch = /(?:епізод|серія|серия|episode|ep)\s*(\d+)|(\d+)\s*(?:епізод|серія|серия|episode|ep)/i.exec(rawText);
        if (epMatch) {
            var epM = parseInt(epMatch[1] || epMatch[2], 10);
            if (!isNaN(epM) && epM > 0) return epM;
        }
        
        var singleNumMatch = /^\s*0*(\d{1,3})\s*$/.exec(rawText.trim());
        if (singleNumMatch) {
            var epSg = parseInt(singleNumMatch[1], 10);
            if (!isNaN(epSg) && epSg > 0) return epSg;
        }
        
        if (card.parentNode) {
            var siblings = card.parentNode.querySelectorAll('.online-prestige--full');
            for (var i = 0; i < siblings.length; i++) {
                if (siblings[i] === card) {
                    return i + 1;
                }
            }
        }
        
        return null;
    }

    function getSeasonNumber(card) {
        var data = card.data || card._online_data || {};
        
        if (data.season !== undefined && data.season !== null && data.season !== '') {
            var sD = parseInt(data.season, 10);
            if (!isNaN(sD) && sD > 0) return sD;
        }
        
        if (card.dataset.season) {
            var sDs = parseInt(card.dataset.season, 10);
            if (!isNaN(sDs) && sDs > 0) return sDs;
        }
        
        var rawText = ((data.title || '') + ' ' + (card.querySelector('.online-prestige__title') ? card.querySelector('.online-prestige__title').innerText : '')).toLowerCase();
        
        var seMatch = /s(\d+)\s*e\d+/i.exec(rawText);
        if (seMatch) {
            var sSe = parseInt(seMatch[1], 10);
            if (!isNaN(sSe) && sSe > 0) return sSe;
        }
        
        var sMatch = /(?:сезон|season)\s*(\d+)|(\d+)\s*(?:сезон|season)/i.exec(rawText);
        if (sMatch) {
            var sM = parseInt(sMatch[1] || sMatch[2], 10);
            if (!isNaN(sM) && sM > 0) return sM;
        }
        
        var filterSeasonEl = document.querySelector('.filter--filter, .filter--sort, .explorer__files-head');
        if (filterSeasonEl) {
            var fText = filterSeasonEl.innerText.toLowerCase();
            var fMatch = /(?:сезон|season)\s*(\d+)|(\d+)\s*(?:сезон|season)/i.exec(fText);
            if (fMatch) {
                var sf = parseInt(fMatch[1] || fMatch[2], 10);
                if (!isNaN(sf) && sf > 0) return sf;
            }
        }
        
        return 1;
    }

    var InFlightSeasonRequests = {};
    function fetchTmdbSeason(tvId, seasonNum) {
        var cacheKey = 'tmdb_season_v7_' + tvId + '_' + seasonNum;
        var cached = ApiCache.get(cacheKey);
        if (cached) return Promise.resolve(cached);
        
        if (InFlightSeasonRequests[cacheKey]) {
            return InFlightSeasonRequests[cacheKey];
        }
        
        var tmdbKey = CONFIG.tmdbKey();
        var promise = new Promise(function (resolve) {
            var urlUk = 'https://api.themoviedb.org/3/tv/' + tvId + '/season/' + seasonNum + '?api_key=' + tmdbKey + '&language=ru-RU';
            
            $.ajax({
                url: urlUk,
                timeout: 5000,
                success: function (dataUk) {
                    var needEn = false;
                    if (dataUk && dataUk.episodes && dataUk.episodes.length) {
                        for (var i = 0; i < dataUk.episodes.length; i++) {
                            var eName = (dataUk.episodes[i].name || '').trim();
                            if (!eName || eName.indexOf('Епізод') === 0 || eName.indexOf('Эпизод') === 0 || eName.indexOf('Episode') === 0) {
                                needEn = true;
                                break;
                            }
                        }
                    }
                    
                    if (needEn) {
                        var urlEn = 'https://api.themoviedb.org/3/tv/' + tvId + '/season/' + seasonNum + '?api_key=' + tmdbKey + '&language=en-US';
                        $.ajax({
                            url: urlEn,
                            timeout: 3500,
                            success: function (dataEn) {
                                if (dataUk.episodes && dataEn.episodes) {
                                    for (var j = 0; j < dataUk.episodes.length; j++) {
                                        var epUk = dataUk.episodes[j];
                                        var epEn = null;
                                        for (var k = 0; k < dataEn.episodes.length; k++) {
                                            if (parseInt(dataEn.episodes[k].episode_number, 10) === parseInt(epUk.episode_number, 10)) {
                                                epEn = dataEn.episodes[k];
                                                break;
                                            }
                                        }
                                        if (epEn) {
                                            var uName = (epUk.name || '').trim();
                                            if (!uName || uName.indexOf('Епізод') === 0 || uName.indexOf('Эпизод') === 0 || uName === ('Episode ' + epUk.episode_number)) {
                                                epUk.name = epEn.name;
                                            }
                                            if (!epUk.overview && epEn.overview) epUk.overview = epEn.overview;
                                            if (!epUk.runtime && epEn.runtime) epUk.runtime = epEn.runtime;
                                        }
                                    }
                                }
                                ApiCache.set(cacheKey, dataUk);
                                delete InFlightSeasonRequests[cacheKey];
                                resolve(dataUk);
                            },
                            error: function () {
                                ApiCache.set(cacheKey, dataUk);
                                delete InFlightSeasonRequests[cacheKey];
                                resolve(dataUk);
                            }
                        });
                    } else {
                        ApiCache.set(cacheKey, dataUk);
                        delete InFlightSeasonRequests[cacheKey];
                        resolve(dataUk);
                    }
                },
                error: function () {
                    delete InFlightSeasonRequests[cacheKey];
                    resolve(null);
                }
            });
        });
        
        InFlightSeasonRequests[cacheKey] = promise;
        return promise;
    }

    var InFlightMovieRequests = {};
    function fetchTmdbMovie(movieId) {
        var cacheKey = 'tmdb_movie_v7_' + movieId;
        var cached = ApiCache.get(cacheKey);
        if (cached) return Promise.resolve(cached);
        
        if (InFlightMovieRequests[cacheKey]) {
            return InFlightMovieRequests[cacheKey];
        }
        
        var tmdbKey = CONFIG.tmdbKey();
        var promise = new Promise(function (resolve) {
            var urlMovie = 'https://api.themoviedb.org/3/movie/' + movieId + '?api_key=' + tmdbKey + '&language=ru-RU';
            $.ajax({
                url: urlMovie,
                timeout: 4500,
                success: function (dataM) {
                    ApiCache.set(cacheKey, dataM);
                    delete InFlightMovieRequests[cacheKey];
                    resolve(dataM);
                },
                error: function () {
                    delete InFlightMovieRequests[cacheKey];
                    resolve(null);
                }
            });
        });
        
        InFlightMovieRequests[cacheKey] = promise;
        return promise;
    }

    function getTmdbMetadata(movie, season, episode) {
        return new Promise(function (resolve) {
            if (!movie || !movie.id) return resolve(null);
            
            var isTv = isTvMedia(movie);
            
            if (isTv) {
                var sNum = (season !== null && season !== undefined && !isNaN(season) && season > 0) ? season : 1;
                
                fetchTmdbSeason(movie.id, sNum).then(function (seasonObj) {
                    var defaultRuntime = (movie.episode_run_time && movie.episode_run_time.length) ? movie.episode_run_time[0] : null;
                    
                    if (!seasonObj) {
                        return resolve({
                            isTv: true,
                            title: episode ? ('Эпизод ' + episode) : ('Сезон ' + sNum),
                            date: movie.first_air_date,
                            rate: movie.vote_average,
                            time: defaultRuntime,
                            season: sNum,
                            episode: episode
                        });
                    }
                    
                    if (episode !== null && episode !== undefined && !isNaN(episode)) {
                        var ep = null;
                        if (seasonObj.episodes && seasonObj.episodes.length) {
                            for (var i = 0; i < seasonObj.episodes.length; i++) {
                                if (parseInt(seasonObj.episodes[i].episode_number, 10) === parseInt(episode, 10)) {
                                    ep = seasonObj.episodes[i];
                                    break;
                                }
                            }
                        }
                        
                        if (ep) {
                            var epRate = (ep.vote_average !== undefined && ep.vote_average !== null && ep.vote_average > 0) ? ep.vote_average : (seasonObj.vote_average || movie.vote_average);
                            var epDate = ep.air_date || seasonObj.air_date || movie.first_air_date;
                            var epTime = ep.runtime ? ep.runtime : defaultRuntime;
                            var epTitle = ep.name || ('Эпизод ' + episode);
                            
                            resolve({
                                isTv: true,
                                title: epTitle,
                                date: epDate,
                                rate: epRate,
                                time: epTime,
                                season: sNum,
                                episode: episode
                            });
                        } else {
                            resolve({
                                isTv: true,
                                title: 'Эпизод ' + episode,
                                date: seasonObj.air_date || movie.first_air_date,
                                rate: seasonObj.vote_average || movie.vote_average,
                                time: defaultRuntime,
                                season: sNum,
                                episode: episode
                            });
                        }
                    } else {
                        resolve({
                            isTv: true,
                            title: seasonObj.name || ('Сезон ' + sNum),
                            date: seasonObj.air_date || movie.first_air_date,
                            rate: seasonObj.vote_average || movie.vote_average,
                            time: defaultRuntime,
                            season: sNum,
                            episode: null
                        });
                    }
                });
            } else {
                fetchTmdbMovie(movie.id).then(function (movieObj) {
                    var mData = movieObj || movie;
                    resolve({
                        isTv: false,
                        title: mData.title || movie.title || movie.name,
                        date: mData.release_date || movie.release_date,
                        rate: mData.vote_average || movie.vote_average,
                        time: mData.runtime || movie.runtime,
                        season: null,
                        episode: null
                    });
                });
            }
        });
    }

    function updateCardTimeline(card) {
        try {
            if (!card || !card.classList || !card.classList.contains('online-prestige--full')) return;

            var existingTimeline = card.querySelector('.online-prestige__timeline');
            var rawTl = card.querySelector('.time-line');
            var innerLine = card.querySelector('.time-line > div');

            var percent = null;

            if (innerLine && innerLine.style && innerLine.style.width) {
                var sw = innerLine.style.width.trim();
                if (sw && sw !== '0%' && sw !== '0px') {
                    var iv = parseFloat(sw);
                    if (!isNaN(iv) && iv > 0 && iv <= 100) {
                        percent = Math.round(iv);
                    }
                }
            }

            var cardData = card.data || card._online_data;
            if (percent === null && cardData && cardData.timeline && cardData.timeline.percent) {
                var dp = parseFloat(cardData.timeline.percent);
                if (!isNaN(dp) && dp > 0 && dp <= 100) {
                    percent = Math.round(dp);
                }
            }

            if (percent === null || percent <= 0) {
                if (existingTimeline) {
                    var oldText = existingTimeline.querySelector('.ydesign-series-percent-text');
                    if (oldText) oldText.remove();
                    existingTimeline.removeAttribute('data-percent');
                    if (!innerLine || !innerLine.style.width || innerLine.style.width === '0%' || innerLine.style.width === '0px') {
                        existingTimeline.style.display = 'none';
                    }
                }
                return;
            }

            var timeline = existingTimeline;
            if (!timeline && rawTl) {
                timeline = document.createElement('div');
                timeline.className = 'online-prestige__timeline';
                rawTl.parentNode.insertBefore(timeline, rawTl);
                timeline.appendChild(rawTl);
                card.appendChild(timeline);
            } else if (!timeline) {
                timeline = document.createElement('div');
                timeline.className = 'online-prestige__timeline';
                timeline.innerHTML = '<div class="time-line"><div style="width: ' + percent + '%"></div></div>';
                card.appendChild(timeline);
            } else if (timeline.parentNode !== card) {
                card.appendChild(timeline);
            }

            timeline.style.display = 'block';
            timeline.setAttribute('data-percent', percent + '%');

            var actualInnerLine = timeline.querySelector('.time-line > div');
            if (actualInnerLine) {
                actualInnerLine.style.width = percent + '%';
            }

            var percentTextEl = timeline.querySelector('.ydesign-series-percent-text');
            if (!percentTextEl) {
                percentTextEl = document.createElement('div');
                percentTextEl.className = 'ydesign-series-percent-text';
                timeline.appendChild(percentTextEl);
            }
            percentTextEl.innerText = percent + '%';
        } catch (e) {}
    }

    function formatPrestigeCard(card) {
        if (!getSet('ydesign_series_redesign')) return false;
        
        if (card.classList.contains('online-prestige-watched')) {
            var txt = (card.innerText || '').toLowerCase();
            if (txt.indexOf('истори') !== -1 || txt.indexOf('історі') !== -1 || txt.indexOf('history') !== -1) {
                card.classList.add('ydesign-empty-history');
                card.style.display = 'none';
                card.classList.remove('selector', 'focus');
                return false;
            }
        }

        if (!card.classList.contains('online-prestige--full')) {
            return false;
        }

        card.classList.add('selector');
        if (card.dataset.fixedLayout === "true") return false;
        card.dataset.fixedLayout = "true";

        var explorer = card.closest('.explorer');
        if (explorer && !explorer.classList.contains('ydesign-has-series')) {
            explorer.classList.add('ydesign-has-series');
        }

        if (card.classList.contains('online-prestige-watched')) {
            card.style.opacity = '0.55';
        }

        var shade = card.querySelector('.ydesign-series-shade');
        if (!shade) {
            shade = document.createElement('div');
            shade.className = 'ydesign-series-shade';
            card.appendChild(shade);
        }

        var imgEl = card.querySelector('.online-prestige__img img');
        if (imgEl && imgEl.src && imgEl.src.indexOf('data:') === -1) {
            getProminentColorAsync(imgEl.src).then(function (color) {
                if (color && shade) {
                    var rgba65 = color.replace('rgb', 'rgba').replace(')', ', 0.65)');
                    var rgba20 = color.replace('rgb', 'rgba').replace(')', ', 0.20)');
                    // shade gradient removed
                }
            });
        }

        var infoBlock = card.querySelector('.online-prestige__info');
        var rawText = infoBlock ? infoBlock.innerText : '';

        var monthNames = '(?:Січня|Лютого|Березня|Квітня|Травня|Червня|Липня|Серпня|Вересня|Жовтня|Листопада|Грудня|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)';
        var dateRegex = new RegExp('(\\d{1,2}\\s+' + monthNames + '(?:\\s+\\d{2,4})?|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\.\\d{1,2}\\.\\d{2,4}|\\d{4}\\s*р\\.?)', 'i');
        var dateMatch = dateRegex.exec(rawText);
        if (dateMatch) rawText = rawText.split(dateMatch[0]).join(' ');

        if (infoBlock) {
            var spans = infoBlock.querySelectorAll('span');
            for (var s = 0; s < spans.length; s++) {
                var st = spans[s].textContent.replace(/★/g, '').trim();
                if (isValidNumericRating(st)) {
                    rawText = rawText.split(spans[s].textContent).join(' ');
                    break;
                }
            }
        }
        var rateMatch = /(?:★\s*)?(\b[1-9](\.\d)?\b)/.exec(rawText);
        if (rateMatch && isValidNumericRating(rateMatch[1])) rawText = rawText.replace(rateMatch[0], ' ');

        var yearMatch = /\b(19\d\d|20\d\d)\b/.exec(rawText);
        if (yearMatch) rawText = rawText.replace(yearMatch[0], ' ');

        var timeRegex = /\b\d+\s*(?:хв|мин|min)\b/i;
        var timeMatch = timeRegex.exec(rawText);
        if (timeMatch) rawText = rawText.replace(timeMatch[0], ' ');

        var qualityEl = card.querySelector('.online-prestige__quality');
        var qualityVal = qualityEl ? cleanBulletsAndSymbols(qualityEl.innerText) : '';

        var titleEl = card.querySelector('.online-prestige__title');
        var sourceTitle = titleEl ? cleanBulletsAndSymbols(titleEl.innerText) : '';

        var cardData = card.data || card._online_data || {};
        var voiceVal = '';
        if (cardData.voice_name) {
            voiceVal = cleanBulletsAndSymbols(cardData.voice_name);
        } else {
            voiceVal = cleanBulletsAndSymbols(rawText);
        }

        if (voiceVal && (voiceVal.length > 25 || /[.,!?]/.test(voiceVal))) {
            if (sourceTitle && !isQualityString(sourceTitle)) {
                voiceVal = sourceTitle;
                sourceTitle = '';
            } else {
                voiceVal = '';
            }
        } else if (isQualityString(sourceTitle)) {
            if (!qualityVal) qualityVal = sourceTitle;
            if (voiceVal && !isQualityString(voiceVal)) {
                sourceTitle = voiceVal;
                voiceVal = '';
            } else {
                sourceTitle = '';
            }
        }

        if (voiceVal === sourceTitle) voiceVal = '';
        if (voiceVal && voiceVal.length > 32) voiceVal = voiceVal.substring(0, 30) + '...';
        if (!voiceVal && !qualityVal && sourceTitle && !isQualityString(sourceTitle)) voiceVal = sourceTitle;

        var oldBody = card.querySelector('.online-prestige__body');
        if (oldBody) oldBody.style.display = 'none';

        var topLeft = card.querySelector('.ydesign-series-top-left') || document.createElement('div');
        topLeft.className = 'ydesign-series-top-left';
        if (!topLeft.parentNode) card.appendChild(topLeft);
        topLeft.innerHTML = ''; 

        var topRight = card.querySelector('.ydesign-series-top-right') || document.createElement('div');
        topRight.className = 'ydesign-series-top-right';
        if (!topRight.parentNode) card.appendChild(topRight);
        topRight.innerHTML = '';
        if (qualityVal) {
            topRight.innerHTML = '<span class="ydesign-series-pill ydesign-series-quality">' + qualityVal + '</span>';
        }

        var movieObj = getCurrentMovie();
        var isTv = isTvMedia(movieObj);
        var movieTitle = movieObj ? (movieObj.title || movieObj.name || '') : '';

        if (voiceVal && movieTitle && voiceVal.toLowerCase() === movieTitle.toLowerCase()) {
            voiceVal = '';
        }

        var bottomLeft = card.querySelector('.ydesign-series-bottom-left') || document.createElement('div');
        bottomLeft.className = 'ydesign-series-bottom-left';
        if (!bottomLeft.parentNode) card.appendChild(bottomLeft);
        bottomLeft.innerHTML = '';

        var voiceBadgeWrap = null;
        if (voiceVal && getSet('ydesign_series_show_voice')) {
            voiceBadgeWrap = document.createElement('div');
            voiceBadgeWrap.className = 'ydesign-series-voice-wrap';
            voiceBadgeWrap.innerHTML = '<span class="ydesign-series-pill ydesign-series-voice-badge">' + voiceVal + '</span>';
            bottomLeft.appendChild(voiceBadgeWrap);
        }
        
        var cleanTitleEl = document.createElement('div');
        cleanTitleEl.className = 'online-prestige__title';

        var sNum = getSeasonNumber(card);
        var eNum = getEpisodeNumber(card);

        if (isTv) {
            if (eNum !== null) {
                cleanTitleEl.innerText = 'Эпизод ' + eNum + '...';
            } else {
                cleanTitleEl.innerText = 'Сезон ' + sNum + '...';
            }
        } else {
            cleanTitleEl.innerText = movieTitle || sourceTitle || 'Фильм';
        }
        bottomLeft.appendChild(cleanTitleEl);

        var bottomRight = card.querySelector('.ydesign-series-bottom-right') || document.createElement('div');
        bottomRight.className = 'ydesign-series-bottom-right';
        if (!bottomRight.parentNode) card.appendChild(bottomRight);
        bottomRight.innerHTML = ''; 

        getTmdbMetadata(movieObj, sNum, eNum).then(function (tmdb) {
            if (!tmdb) return;

            if (tmdb.date && getSet('ydesign_series_show_date')) {
                topLeft.innerHTML = '<span class="ydesign-series-pill ydesign-series-date">' + tmdb.date + '</span>';
            }

            if (tmdb.rate && getSet('ydesign_series_show_rate')) {
                var rFormat = parseFloat(tmdb.rate).toFixed(1);
                if (rFormat > 0) {
                    var rateHtml = '<span class="ydesign-series-pill ydesign-series-rate">★ ' + rFormat + '</span>';
                    topRight.innerHTML = rateHtml + topRight.innerHTML;
                }
            }
            
            if (tmdb.time && getSet('ydesign_series_show_time')) {
                bottomRight.innerHTML = '<span class="ydesign-series-pill ydesign-series-time">' + tmdb.time + ' хв</span>';
            }

            if (tmdb.isTv) {
                if (tmdb.title) {
                    cleanTitleEl.innerText = tmdb.title;
                    if (voiceBadgeWrap && voiceVal && voiceVal.toLowerCase() === tmdb.title.toLowerCase()) {
                        voiceBadgeWrap.remove();
                    }
                }
            } else {
                if (tmdb.title) {
                    cleanTitleEl.innerText = tmdb.title;
                }
            }
        });

        updateCardTimeline(card);

        return false;
    }

    function initSeriesLogic() {
        try {
            var pageJustLoaded = false;
            if (window.Lampa && Lampa.Listener) {
                Lampa.Listener.follow('activity', function (e) {
                    if (!getSet('ydesign_series_redesign')) return;
                    if (e.type === 'start' || e.type === 'build') {
                        pageJustLoaded = true;
                    }
                });
            }

            var seriesObserver = new MutationObserver(function (mutations) {
                if (!getSet('ydesign_series_redesign')) return;

                var hasNewCards = false;
                for (var i = 0; i < mutations.length; i++) {
                    var mutation = mutations[i];
                    for (var j = 0; j < mutation.addedNodes.length; j++) {
                        var node = mutation.addedNodes[j];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('online-prestige')) {
                                formatPrestigeCard(node);
                                hasNewCards = true;
                            }
                            if (node.querySelectorAll) {
                                var cards = node.querySelectorAll('.online-prestige');
                                if (cards.length > 0) {
                                    for (var k = 0; k < cards.length; k++) {
                                        formatPrestigeCard(cards[k]);
                                    }
                                    hasNewCards = true;
                                }
                            }
                        }
                    }
                }

                if (hasNewCards) {
                    var active = document.querySelector('.activity--active');
                    if (active) {
                        var currentFocus = active.querySelector('.focus');
                        if (!currentFocus || currentFocus.offsetParent === null || currentFocus.classList.contains('ydesign-empty-history')) {
                            var firstCard = active.querySelector('.online-prestige.online-prestige--full.selector');
                            if (firstCard && firstCard.offsetParent !== null && firstCard.style.display !== 'none') {
                                if (window.Lampa && window.Lampa.Controller) {
                                    window.Lampa.Controller.collectionFocus(firstCard, active);
                                }
                                if (currentFocus && currentFocus !== firstCard) currentFocus.classList.remove('focus');
                                firstCard.classList.add('focus');
                                if (firstCard.scrollIntoViewIfNeeded) {
                                    firstCard.scrollIntoViewIfNeeded(false);
                                } else if (firstCard.scrollIntoView) {
                                    firstCard.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                                }
                                pageJustLoaded = false;
                            }
                        }
                    }
                }
            });

            seriesObserver.observe(document.body, { childList: true, subtree: true });

            setInterval(function () {
                if (!getSet('ydesign_series_redesign')) return;

                var activeCards = document.querySelectorAll('.online-prestige--full');
                for (var cIdx = 0; cIdx < activeCards.length; cIdx++) {
                    updateCardTimeline(activeCards[cIdx]);
                }

                if (pageJustLoaded) {
                    var active = document.querySelector('.activity--active');
                    if (active) {
                        var currentFocus = active.querySelector('.focus');
                        var isBrokenFocus = !currentFocus || currentFocus.offsetParent === null || currentFocus.style.display === 'none' || currentFocus.classList.contains('ydesign-empty-history');
                        
                        if (isBrokenFocus) {
                            var firstValid = active.querySelector('.online-prestige.online-prestige--full.selector') || active.querySelector('.selector');
                            if (firstValid && firstValid.offsetParent !== null && firstValid.style.display !== 'none') {
                                if (window.Lampa && window.Lampa.Controller) {
                                    window.Lampa.Controller.collectionFocus(firstValid, active);
                                }
                                if (currentFocus && currentFocus !== firstValid) currentFocus.classList.remove('focus');
                                firstValid.classList.add('focus');
                                if (firstValid.scrollIntoViewIfNeeded) {
                                    firstValid.scrollIntoViewIfNeeded(false);
                                } else if (firstValid.scrollIntoView) {
                                    firstValid.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                                }
                                pageJustLoaded = false;
                            }
                        } else if (currentFocus && currentFocus.classList.contains('online-prestige--full')) {
                            pageJustLoaded = false;
                        }
                    }
                }
            }, 250);
        } catch (e) {}
    }

    // =========================================================================
    // 14. ГЛАВНЫЙ СТАРТ И ПРОВЕРКА ИСТОЧНИКА
    // =========================================================================
    function init() {
        try {
            hookTemplates();
            createSettings();

            var currentSource = 'tmdb';
            if (window.Lampa && Lampa.Storage) {
                currentSource = Lampa.Storage.get('source') || 'tmdb';
                if (currentSource !== 'tmdb' && currentSource !== 'cub') {
                    setTimeout(function () {
                        if (window.Lampa && Lampa.Noty) {
                            Lampa.Noty.show('Для работы «Дизайн MaX» выберите источником TMDB или CUB (сейчас: ' + currentSource + ')');
                        }
                    }, 2500);
                }
            }

            injectCSS();
            applyDynamicCSS();

            if (window.Lampa && Lampa.Storage && Lampa.Storage.listener) {
                Lampa.Storage.listener.follow('change', function (e) {
                    if (e && e.name && e.name.indexOf('ydesign_') === 0) {
                        applyDynamicCSS();
                    }
                });
            }

            overrideCards();
            initSeriesLogic();

            if (window.appready && Lampa.Activity && Lampa.Activity.active()) {
                setTimeout(function () {
                    var act = Lampa.Activity.active();
                    if (act && act.activity && act.activity.render) {
                        act.activity.render().find('.card').trigger('visible');
                    }
                }, 100);
            }

            console.log('Lampa Plugin: YDesign successfully loaded.');
        } catch (e) {
            console.error('YDesign init error:', e);
        }
    }

    hookTemplates();

    if (window.appready) {
        init();
    } else {
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') init();
            });
        } else {
            setTimeout(init, 500);
        }
    }

})();