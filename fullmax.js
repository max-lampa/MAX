(function () {
    'use strict';

    if (window.YDesignLoaded) return;
    window.YDesignLoaded = true;

    var CONFIG = {
        cacheTime: 7 * 24 * 60 * 60 * 1000,
        tmdbKey: function () {
            return (window.Lampa && Lampa.TMDB && Lampa.TMDB.key) ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96';
        }
    };

    var rateIcons = {
        imdb: 'https://upload.wikimedia.org/wikipedia/commons/5/53/IMDB_-_SuperTinyIcons.svg',
        rt: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg',
        mc: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Metacritic_logo_Roundel.svg',
        tmdb: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tmdb.new.logo.svg',
        trakt: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Trakt.tv-favicon.svg',
        mdblist: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='%23ffffff'%3E%3Cpath d='M1.928.029A2.47 2.47 0 0 0 .093 1.673c-.085.248-.09.629-.09 10.33s.005 10.08.09 10.33a2.51 2.51 0 0 0 1.512 1.558l.276.108h20.237l.277-.108a2.51 2.51 0 0 0 1.512-1.559c.085-.25.09-.63.09-10.33s-.005-10.08-.09-10.33A2.51 2.51 0 0 0 22.395.115l-.277-.109L12.117 0C6.615-.004 2.032.011 1.929.029m7.48 8.067l2.123 2.004v1.54c0 .897-.02 1.536-.043 1.527s-.92-.845-1.995-1.86c-1.071-1.01-1.962-1.84-1.977-1.84s-.024 1.91-.024 4.248v4.25H4.911V6.085h1.188l1.183.006zm9.729 3.93v5.94h-2.63l-.01-4.25l-.013-4.25l-1.907 1.795a367 367 0 0 1-1.98 1.864c-.076.056-.08-.047-.08-1.489v-1.555l2.127-1.995l2.127-1.995l1.187-.005h1.184z'/%3E%3C/svg%3E",
        popcorn: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Rotten_Tomatoes_positive_audience.svg',
        letterboxd: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Letterboxd_2023_logo.png'
    };

    var DefaultSettings = {
        ydesign_logo_quality: 'w500',
        ydesign_poster_quality: 'original',
        ydesign_backdrop_quality: 'original',
        ydesign_lang: 'ru_en',
        ydesign_slogan_lang: 'ru_en',
        ydesign_desc_lang: 'ru_en',
        ydesign_logo_max_h: '35',
        ydesign_logo_max_w: '80',
        ydesign_text_title_size: '1.2',
        ydesign_text_slogan_size: '0.85',
        ydesign_text_badge_size: '0.75',
        ydesign_text_rating_size: '0.8',
        ydesign_desc_size: '0.85',
        ydesign_title_below_size: '0.92',
        ydesign_poster_breathing: true,
        ydesign_poster_breathing_scale: '1.05',
        ydesign_poster_breathing_speed: '12',
        ydesign_card_border_width: '1',
        ydesign_card_focus_border_width: '3',
        ydesign_card_border_theme: 'cyan',
        ydesign_card_border_custom_color: '#22d3ee',
        ydesign_card_type_main: 'horizontal',
        ydesign_card_type_other: 'vertical',
        ydesign_badges_one_row: false,
        ydesign_show_desc_horz: true,
        ydesign_show_title_below: true,
        ydesign_show_year: true,
        ydesign_show_seasons: true,
        ydesign_show_age: true,
        ydesign_show_slogan: true,
        ydesign_lazy_load: true,
        ydesign_card_gap: '0.8',
        ydesign_badge_rows_gap: '0.4',
        ydesign_content_pb: '0.8',
        ydesign_slogan_padding: '0.3',
        ydesign_logo_mb: '0.9',
        ydesign_ratings_saturate: '100',
        ydesign_align_logo: 'center',
        ydesign_align_badges: 'center',
        ydesign_align_slogan: 'center',
        ydesign_ratings_order: 'tmdb, imdb, rt, popcorn',
        ydesign_omdb_key: '',
        ydesign_mdblist_key: ''
    };

    function getSet(key) {
        var val = Lampa.Storage.get(key);
        if (val !== null && val !== undefined && val !== '') return val;
        return DefaultSettings[key];
    }

    function getBool(key) {
        var val = getSet(key);
        if (val === true || val === 'true' || val === 1 || val === '1') return true;
        if (val === false || val === 'false' || val === 0 || val === '0' || val === '' || val === null || val === undefined) return false;
        return !!val;
    }

    function sanitizeCssColor(value, fallback) {
        var color = String(value || '').trim();
        if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) return color;
        if (/^rgba?\(([^)]+)\)$/i.test(color)) return color;
        if (/^hsla?\(([^)]+)\)$/i.test(color)) return color;
        return fallback;
    }

    function hexToRgba(hex, alpha) {
        var normalized = String(hex || '').replace('#', '').trim();
        if (normalized.length === 3) {
            normalized = normalized[0] + normalized[0] + normalized[1] + normalized[1] + normalized[2] + normalized[2];
        }

        if (!/^[0-9a-f]{6}$/i.test(normalized)) return 'rgba(34,211,238,' + alpha + ')';

        var r = parseInt(normalized.substring(0, 2), 16);
        var g = parseInt(normalized.substring(2, 4), 16);
        var b = parseInt(normalized.substring(4, 6), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    function colorWithAlpha(color, alpha) {
        var safe = sanitizeCssColor(color, '#22d3ee');
        var rgb = safe.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
        var rgba = safe.match(/^rgba\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d.]+)\s*\)$/i);

        if (rgb) return 'rgba(' + rgb[1] + ',' + rgb[2] + ',' + rgb[3] + ',' + alpha + ')';
        if (rgba) return 'rgba(' + rgba[1] + ',' + rgba[2] + ',' + rgba[3] + ',' + alpha + ')';
        if (safe.indexOf('#') === 0) return hexToRgba(safe, alpha);
        return safe;
    }

    function getThemeColor(theme) {
        var map = {
            cyan: '#22d3ee',
            violet: '#8b5cf6',
            emerald: '#10b981',
            amber: '#f59e0b',
            rose: '#f43f5e',
            white: '#ffffff',
            blue: '#3b82f6',
            custom: sanitizeCssColor(getSet('ydesign_card_border_custom_color'), '#22d3ee')
        };

        return map[theme] || map.cyan;
    }

    function getCardBorderColor() {
        return getThemeColor(String(getSet('ydesign_card_border_theme') || 'cyan').trim().toLowerCase());
    }

    function requestJson(url) {
        return new Promise(function (resolve, reject) {
            if (!window.$ || !$.ajax) {
                reject(new Error('jQuery is not available'));
                return;
            }

            $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json',
                timeout: 20000,
                success: function (data) {
                    resolve(data);
                },
                error: function (xhr, status, error) {
                    reject(error || status || new Error('Request failed'));
                }
            });
        });
    }

    function safeArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function noop() {}

    function removeNodes(root, selector) {
        var nodes = root.querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
        }
    }

    var ApiCache = {
        get: function (key) {
            var data = Lampa.Storage.get('ydesign_cache_' + key);
            if (data && data.time && (Date.now() - data.time < CONFIG.cacheTime)) return data.val;
            return null;
        },
        set: function (key, val) {
            Lampa.Storage.set('ydesign_cache_' + key, { val: val, time: Date.now() });
        }
    };

    var LazyLoader = {
        observer: null,
        init: function () {
            if (this.observer || !('IntersectionObserver' in window)) return;

            this.observer = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;

                    var el = entry.target;
                    var queue = el._lazyQueue || [];
                    delete el._lazyQueue;

                    for (var i = 0; i < queue.length; i++) {
                        try {
                            queue[i]();
                        } catch (e) {}
                    }

                    observer.unobserve(el);
                });
            }, { rootMargin: '180px' });
        },
        add: function (el, fn) {
            if (!getBool('ydesign_lazy_load') || !('IntersectionObserver' in window)) {
                fn();
                return;
            }

            this.init();
            if (!this.observer) {
                fn();
                return;
            }

            if (!el._lazyQueue) el._lazyQueue = [];
            el._lazyQueue.push(fn);
            this.observer.observe(el);
        }
    };

    function getProminentColor(imgEl, callback) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx || !imgEl.naturalWidth || !imgEl.naturalHeight) {
            callback('rgb(24,24,24)');
            return;
        }

        canvas.width = 6;
        canvas.height = 6;

        try {
            var sx = 0;
            var sy = Math.max(0, Math.floor(imgEl.naturalHeight * 0.65));
            var sw = imgEl.naturalWidth;
            var sh = Math.max(1, Math.floor(imgEl.naturalHeight * 0.35));

            ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, 6, 6);

            var pixels = ctx.getImageData(0, 0, 6, 6).data;
            var r = 0;
            var g = 0;
            var b = 0;
            var count = 0;

            for (var i = 0; i < pixels.length; i += 4) {
                r += pixels[i];
                g += pixels[i + 1];
                b += pixels[i + 2];
                count++;
            }

            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);

            var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            if (luma > 90) {
                var down = 90 / luma;
                r = Math.round(r * down);
                g = Math.round(g * down);
                b = Math.round(b * down);
            }

            if (luma < 20) {
                r = Math.max(r, 20);
                g = Math.max(g, 20);
                b = Math.max(b, 20);
            }

            callback('rgb(' + r + ',' + g + ',' + b + ')');
        } catch (e) {
            callback('rgb(24,24,24)');
        }
    }

    function parseAgeRating(ageStr) {
        if (!ageStr) return '16+';

        var s = String(ageStr).toUpperCase().trim();
        if (s === 'G' || s === 'TV-G' || s === 'TV-Y') return '0+';
        if (s === 'PG' || s === 'TV-PG') return '6+';
        if (s === 'TV-Y7') return '7+';
        if (s === 'PG-13') return '13+';
        if (s === 'TV-14') return '14+';
        if (s === 'R' || s === 'NC-17' || s === 'TV-MA') return '18+';

        var digitsOnly = s.replace(/\D/g, '');
        if (digitsOnly.length > 0 && digitsOnly.length <= 2) return digitsOnly + '+';

        return '16+';
    }

    function getLangQuery(pref) {
        if (pref === 'ru' || pref === 'ru_en') return 'ru-RU';
        if (pref === 'uk' || pref === 'uk_en') return 'uk-UA';
        return 'en-US';
    }

    function pickNeutralImage(list) {
        var items = safeArray(list);
        var first = null;

        for (var i = 0; i < items.length; i++) {
            if (!first) first = items[i];
            if (items[i] && items[i].iso_639_1 === null) return items[i];
        }

        return first;
    }

    function pickLogoByLanguage(logos, langPref) {
        logos = safeArray(logos);
        if (!logos.length) return null;

        function findByLang(lang) {
            for (var i = 0; i < logos.length; i++) {
                if (logos[i] && logos[i].iso_639_1 === lang) return logos[i];
            }
            return null;
        }

        var logo = null;

        if (langPref === 'ru') {
            logo = findByLang('ru');
        } else if (langPref === 'uk') {
            logo = findByLang('uk');
        } else if (langPref === 'ru_en' || langPref === 'uk_en') {
            logo = findByLang('ru') || findByLang('uk') || findByLang('en');
        } else {
            logo = findByLang('en');
        }

        return logo || logos[0] || null;
    }

    function findMovieCertification(results) {
        results = safeArray(results);
        for (var i = 0; i < results.length; i++) {
            var row = results[i];
            if (!row || row.iso_3166_1 !== 'US') continue;

            var dates = safeArray(row.release_dates);
            for (var j = 0; j < dates.length; j++) {
                if (dates[j] && dates[j].certification) return dates[j].certification;
            }
        }
        return null;
    }

    function findTvCertification(results) {
        results = safeArray(results);
        for (var i = 0; i < results.length; i++) {
            if (results[i] && results[i].iso_3166_1 === 'US' && results[i].rating) return results[i].rating;
        }
        return null;
    }

    function fetchExtendedData(id, type) {
        return new Promise(function (resolve) {
            var langPref = getSet('ydesign_lang');
            var sloganLang = getSet('ydesign_slogan_lang');
            var descLang = getSet('ydesign_desc_lang');
            var cacheKey = type + '_' + id + '_' + langPref + '_' + sloganLang + '_' + descLang;
            var cached = ApiCache.get(cacheKey);

            if (cached) {
                resolve(cached);
                return;
            }

            var mainLangQuery = getLangQuery(langPref || sloganLang || descLang);
            var url = 'https://api.themoviedb.org/3/' + type + '/' + id +
                '?api_key=' + CONFIG.tmdbKey() +
                '&language=' + mainLangQuery +
                '&append_to_response=images,release_dates,content_ratings' +
                '&include_image_language=ru,uk,en,null';

            requestJson(url).then(function (data) {
                data = data || {};

                var needEn = false;
                if (sloganLang === 'en' || descLang === 'en' || langPref === 'en_orig') needEn = true;
                if ((sloganLang === 'ru_en' || sloganLang === 'uk_en') && (!data.tagline || !String(data.tagline).trim())) needEn = true;
                if ((descLang === 'ru_en' || descLang === 'uk_en') && (!data.overview || !String(data.overview).trim())) needEn = true;

                function buildResult(enData) {
                    enData = enData || {};

                    var finalTagline = '';
                    if (sloganLang === 'ru' || sloganLang === 'uk') finalTagline = data.tagline || '';
                    else if (sloganLang === 'en') finalTagline = enData.tagline || '';
                    else finalTagline = data.tagline || enData.tagline || '';

                    var finalOverview = '';
                    if (descLang === 'ru' || descLang === 'uk') finalOverview = data.overview || '';
                    else if (descLang === 'en') finalOverview = enData.overview || '';
                    else finalOverview = data.overview || enData.overview || '';

                    var posters = safeArray(data.images && data.images.posters);
                    var backdrops = safeArray(data.images && data.images.backdrops);
                    var logos = safeArray(data.images && data.images.logos);

                    var result = {
                        tagline: finalTagline || '',
                        overview: finalOverview || '',
                        clean_poster: null,
                        clean_backdrop: null,
                        logo: null,
                        age: null,
                        seasons: data.number_of_seasons || 0,
                        episodes: data.number_of_episodes || 0,
                        tmdb_rating: data.vote_average || 0
                    };

                    var cleanPoster = pickNeutralImage(posters);
                    var cleanBackdrop = pickNeutralImage(backdrops);
                    var logo = pickLogoByLanguage(logos, langPref);

                    if (cleanPoster) result.clean_poster = cleanPoster.file_path;
                    if (cleanBackdrop) result.clean_backdrop = cleanBackdrop.file_path;
                    if (logo) result.logo = logo.file_path;

                    if (type === 'movie') {
                        result.age = findMovieCertification(data.release_dates && data.release_dates.results);
                    } else {
                        result.age = findTvCertification(data.content_ratings && data.content_ratings.results);
                    }

                    result.age = parseAgeRating(result.age);

                    ApiCache.set(cacheKey, result);
                    resolve(result);
                }

                if (needEn) {
                    requestJson('https://api.themoviedb.org/3/' + type + '/' + id + '?api_key=' + CONFIG.tmdbKey() + '&language=en-US')
                        .then(function (enData) {
                            buildResult(enData || {});
                        })
                        .catch(function () {
                            buildResult(null);
                        });
                } else {
                    buildResult(null);
                }
            }).catch(function () {
                resolve(null);
            });
        });
    }

    function fetchExternalRatings(tmdbId, type) {
        return new Promise(function (resolve) {
            var cacheKey = 'ext_rates_v5_' + type + '_' + tmdbId;
            var cached = ApiCache.get(cacheKey);
            if (cached) {
                resolve(cached);
                return;
            }

            var results = {};
            var omdbKey = String(getSet('ydesign_omdb_key') || '').trim();
            var mdblistKey = String(getSet('ydesign_mdblist_key') || '').trim();

            if (!omdbKey && !mdblistKey) {
                ApiCache.set(cacheKey, results);
                resolve(results);
                return;
            }

            requestJson('https://api.themoviedb.org/3/' + type + '/' + tmdbId + '/external_ids?api_key=' + CONFIG.tmdbKey())
                .then(function (extRes) {
                    var imdbId = extRes && extRes.imdb_id;
                    if (!imdbId) {
                        ApiCache.set(cacheKey, results);
                        resolve(results);
                        return;
                    }

                    var tasks = [];

                    if (omdbKey) {
                        tasks.push(
                            requestJson('https://www.omdbapi.com/?apikey=' + encodeURIComponent(omdbKey) + '&i=' + encodeURIComponent(imdbId))
                                .then(function (omdbData) {
                                    if (omdbData && omdbData.Response !== 'False') {
                                        if (omdbData.Metascore && omdbData.Metascore !== 'N/A') results.mc = omdbData.Metascore;
                                        if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') results.imdb = omdbData.imdbRating;

                                        var ratings = safeArray(omdbData.Ratings);
                                        for (var i = 0; i < ratings.length; i++) {
                                            if (ratings[i] && ratings[i].Source === 'Rotten Tomatoes') {
                                                results.rt = String(ratings[i].Value || '').replace('%', '');
                                                break;
                                            }
                                        }
                                    }
                                })
                                .catch(noop)
                        );
                    }

                    if (mdblistKey) {
                        tasks.push(
                            requestJson('https://mdblist.com/api/?apikey=' + encodeURIComponent(mdblistKey) + '&i=' + encodeURIComponent(imdbId))
                                .then(function (mdbData) {
                                    if (!mdbData) return;

                                    if (mdbData.score) results.mdblist = mdbData.score;

                                    var ratings = safeArray(mdbData.ratings);
                                    for (var i = 0; i < ratings.length; i++) {
                                        var r = ratings[i] || {};
                                        if (r.source === 'trakt') results.trakt = r.value;
                                        if (r.source === 'letterboxd') results.letterboxd = r.value;
                                        if (r.source === 'tomatoesaudience') results.popcorn = r.value;
                                        if (r.source === 'metacritic' && !results.mc) results.mc = r.value;
                                        if (r.source === 'tomatoes' && !results.rt) results.rt = r.value;
                                        if (r.source === 'imdb' && !results.imdb) results.imdb = r.value;
                                    }
                                })
                                .catch(noop)
                        );
                    }

                    Promise.all(tasks).then(function () {
                        ApiCache.set(cacheKey, results);
                        resolve(results);
                    });
                })
                .catch(function () {
                    resolve(results);
                });
        });
    }

    function formatValue(value, digits, suffix) {
        if (value === null || value === undefined || value === '' || isNaN(parseFloat(value))) return null;
        return parseFloat(value).toFixed(digits) + (suffix || '');
    }

    function renderRatings(container, baseData, tmdbData, extRatings) {
        var orderStr = String(getSet('ydesign_ratings_order') || 'tmdb, imdb, rt, popcorn');
        var order = orderStr.split(',').map(function (s) { return s.trim().toLowerCase(); });

        var available = {
            tmdb: formatValue(tmdbData && tmdbData.tmdb_rating, 1),
            kp: formatValue(baseData && baseData.kp_rating, 1),
            imdb: extRatings && extRatings.imdb ? formatValue(extRatings.imdb, 1) : formatValue(baseData && baseData.imdb_rating, 1),
            rt: extRatings && extRatings.rt ? formatValue(extRatings.rt, 0, '%') : null,
            mc: extRatings && extRatings.mc ? formatValue(extRatings.mc, 0) : null,
            trakt: extRatings && extRatings.trakt ? formatValue(extRatings.trakt, 1) : null,
            mdblist: extRatings && extRatings.mdblist ? formatValue(extRatings.mdblist, 1) : null,
            popcorn: extRatings && extRatings.popcorn ? formatValue(extRatings.popcorn, 0, '%') : null,
            letterboxd: extRatings && extRatings.letterboxd ? formatValue(parseFloat(extRatings.letterboxd) * 2, 1) : null
        };

        container.innerHTML = '';

        for (var i = 0; i < order.length; i++) {
            var key = order[i];
            if (!available[key]) continue;

            if (key === 'kp') {
                container.innerHTML += '<span class="ydesign-rating"><b style="color:#ff8a00;font-weight:800;font-size:1.1em;">Кп</b> ' + available[key] + '</span>';
            } else {
                var iconUrl = rateIcons[key] || rateIcons.tmdb;
                container.innerHTML += '<span class="ydesign-rating"><img src="' + iconUrl + '" alt="' + key + '" /> ' + available[key] + '</span>';
            }
        }
    }

    function getTitle(data) {
        return data.title || data.name || data.original_title || data.original_name || '';
    }

    function getCardType(data) {
        if (data.media_type === 'tv') return 'tv';
        if (data.media_type === 'movie') return 'movie';
        if (data.name && !data.title) return 'tv';
        return 'movie';
    }

    function getYear(data) {
        var value = String(data.release_date || data.first_air_date || '');
        if (!value) return '';
        var year = value.substring(0, 4);
        return year === 'unde' ? '' : year;
    }

    function createBaseExt(data) {
        return {
            tagline: '',
            overview: '',
            clean_poster: null,
            clean_backdrop: null,
            logo: null,
            age: parseAgeRating(data.age || data.certification || null),
            seasons: data.number_of_seasons || 0,
            episodes: data.number_of_episodes || 0,
            tmdb_rating: data.vote_average || 0
        };
    }

    function buildCardCustomDOM(cardEl, data) {
        var el = cardEl && (cardEl[0] || cardEl);
        if (!el || !data || !data.id) return;

        var active = (Lampa.Activity && Lampa.Activity.active) ? Lampa.Activity.active() : null;
        var activeComp = active && active.component ? active.component : 'main';
        var isHorz = activeComp === 'main'
            ? getSet('ydesign_card_type_main') === 'horizontal'
            : getSet('ydesign_card_type_other') === 'horizontal';

        el.classList.add('ydesign-card');
        el.classList.remove('ydesign-vertical', 'ydesign-horizontal');
        el.classList.add(isHorz ? 'ydesign-horizontal' : 'ydesign-vertical');

        var view = el.querySelector('.card__view');
        if (!view) return;

        removeNodes(el, '.ydesign-desc-under, .ydesign-title-under');
        view.innerHTML = '';

        var imgLayer = document.createElement('div');
        imgLayer.className = 'ydesign-img-layer';

        var darkOverlay = document.createElement('div');
        darkOverlay.className = 'ydesign-dark-overlay';

        var gradientLayer = document.createElement('div');
        gradientLayer.className = 'ydesign-gradient-layer';

        var contentLayer = document.createElement('div');
        contentLayer.className = 'ydesign-content-layer';

        view.appendChild(imgLayer);
        view.appendChild(darkOverlay);
        view.appendChild(gradientLayer);
        view.appendChild(contentLayer);

        var type = getCardType(data);
        var titleValue = getTitle(data);
        var baseExt = createBaseExt(data);
        var buildToken = Date.now() + '_' + Math.random();
        el._ydesign_render_token = buildToken;

        var initialBg = isHorz
            ? (data.backdrop_path || data.poster_path)
            : (data.poster_path || data.backdrop_path);

        function applyBg(path) {
            if (!path) return;

            var quality = isHorz ? getSet('ydesign_backdrop_quality') : getSet('ydesign_poster_quality');
            var src = 'https://image.tmdb.org/t/p/' + quality + path;
            var img = new Image();
            img.crossOrigin = 'Anonymous';

            img.onload = function () {
                if (el._ydesign_render_token !== buildToken) return;

                imgLayer.style.backgroundImage = 'url(' + src + ')';
                imgLayer.classList.add('loaded');

                getProminentColor(img, function (color) {
                    if (el._ydesign_render_token !== buildToken) return;

                    var soft = color.replace('rgb', 'rgba').replace(')', ',0.72)');
                    var mid = color.replace('rgb', 'rgba').replace(')', ',0.42)');
                    view.style.backgroundColor = '#0f0f10';
                    gradientLayer.style.background = 'linear-gradient(to top, ' + soft + ' 0%, ' + mid + ' 30%, rgba(0,0,0,0.16) 68%, rgba(0,0,0,0) 100%)';
                });
            };

            img.onerror = noop;
            img.src = src;
        }

        function appendTitleBelow() {
            if (!getBool('ydesign_show_title_below') || !titleValue) return;

            var titleUnder = document.createElement('div');
            titleUnder.className = 'ydesign-title-under';
            titleUnder.innerText = titleValue;
            el.appendChild(titleUnder);
        }

        function appendDescription(extData) {
            if (!isHorz || !getBool('ydesign_show_desc_horz')) return;

            var desc = document.createElement('div');
            desc.className = 'ydesign-desc-under';
            desc.innerText = extData && extData.overview ? extData.overview : ' ';
            el.appendChild(desc);
        }

        function renderOverlay(extData, extRatings) {
            if (el._ydesign_render_token !== buildToken) return;

            extData = extData || baseExt;
            removeNodes(el, '.ydesign-desc-under, .ydesign-title-under');
            contentLayer.innerHTML = '';

            var logoContainer = document.createElement('div');
            logoContainer.className = 'ydesign-logo-container';

            if (extData.logo) {
                var logoImg = document.createElement('img');
                logoImg.className = 'ydesign-logo-img';
                logoImg.src = 'https://image.tmdb.org/t/p/' + getSet('ydesign_logo_quality') + extData.logo;
                logoImg.alt = titleValue;
                logoContainer.appendChild(logoImg);
            } else {
                var titleText = document.createElement('div');
                titleText.className = 'ydesign-text-title';
                titleText.innerText = titleValue;
                logoContainer.appendChild(titleText);
            }

            contentLayer.appendChild(logoContainer);

            var infoWrap = document.createElement('div');
            infoWrap.className = 'ydesign-info-wrap';

            var badgesWrap = document.createElement('div');
            badgesWrap.className = 'ydesign-badges';

            var year = getYear(data);
            if (year) {
                badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-year">' + year + '</span>';
            }

            if (type === 'tv' && extData.seasons) {
                var seasonText = 'С:' + extData.seasons + (extData.episodes ? ' Э:' + extData.episodes : '');
                badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-seasons">' + seasonText + '</span>';
            }

            if (extData.age) {
                badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-age">' + extData.age + '</span>';
            }

            if (badgesWrap.innerHTML) infoWrap.appendChild(badgesWrap);

            var ratingsWrap = document.createElement('div');
            ratingsWrap.className = 'ydesign-ratings';
            renderRatings(ratingsWrap, data, extData, extRatings || null);
            infoWrap.appendChild(ratingsWrap);
            contentLayer.appendChild(infoWrap);

            if (getBool('ydesign_show_slogan')) {
                var slogan = document.createElement('div');
                slogan.className = 'ydesign-slogan ydesign-slogan-text';
                slogan.innerText = extData.tagline ? extData.tagline : ' ';
                contentLayer.appendChild(slogan);
            }

            appendTitleBelow();
            appendDescription(extData);
        }

        renderOverlay(baseExt, null);
        if (initialBg) applyBg(initialBg);

        function buildExtendedCard() {
            fetchExtendedData(data.id, type).then(function (extData) {
                if (el._ydesign_render_token !== buildToken) return;

                var finalExt = extData || baseExt;
                var cleanBg = isHorz ? finalExt.clean_backdrop : finalExt.clean_poster;

                if (cleanBg && cleanBg !== initialBg) applyBg(cleanBg);
                renderOverlay(finalExt, null);

                fetchExternalRatings(data.id, type).then(function (extRatings) {
                    if (el._ydesign_render_token !== buildToken) return;
                    renderOverlay(finalExt, extRatings && Object.keys(extRatings).length ? extRatings : null);
                });
            });
        }

        LazyLoader.add(el, buildExtendedCard);
    }

    function injectCSS() {
        if (document.getElementById('ydesign-styles')) return;

        var style = document.createElement('style');
        style.id = 'ydesign-styles';
        style.innerHTML = `
            .ydesign-active .card .card__title,
            .ydesign-active .card .card__age,
            .ydesign-active .card .card__vote {
                display: none !important;
            }

            .ydesign-active .items-line .items-cards,
            .ydesign-active .items-line .scroll__body {
                display: flex;
                flex-wrap: nowrap;
                gap: var(--ydesign-card-gap, 0.8em);
                padding-bottom: 1.5em;
            }

            .ydesign-active .card {
                position: relative;
                overflow: visible;
                background: transparent !important;
                border: none !important;
                transition: transform 0.2s ease;
                flex: 0 0 auto;
                cursor: pointer;
            }

            .ydesign-active .card.focus {
                transform: scale(1.04);
                z-index: 10;
            }

            .ydesign-active .card.focus .card__view {
                box-shadow:
                    0 0 0 var(--ydesign-card-focus-border-width, 3px) var(--ydesign-card-border-color, #22d3ee),
                    0 0 24px var(--ydesign-card-border-glow-color, rgba(34,211,238,0.4)),
                    0 14px 36px rgba(0,0,0,0.72) !important;
            }

            .ydesign-active .card .card__view {
                position: relative;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 0 !important;
                border-radius: 0.9em !important;
                background-color: #0f0f10;
                overflow: hidden;
                box-shadow: 0 0 0 var(--ydesign-card-border-width, 1px) var(--ydesign-card-border-color, #22d3ee);
                transition: background-color 0.35s ease, box-shadow 0.2s ease;
                filter: none !important;
                backdrop-filter: none !important;
            }

            .ydesign-active .card.ydesign-vertical .card__view {
                padding-bottom: 177.77% !important;
            }

            .ydesign-active .card.ydesign-horizontal .card__view {
                padding-bottom: 68.75% !important;
            }

            @media (min-width: 769px) {
                .ydesign-active .card.ydesign-vertical {
                    width: 18.5vw;
                    height: auto !important;
                }

                .ydesign-active .card.ydesign-horizontal {
                    width: 31.5vw;
                    height: auto !important;
                }
            }

            @media (max-width: 768px) {
                .ydesign-active .card.ydesign-vertical {
                    width: 46vw;
                    height: auto !important;
                }

                .ydesign-active .card.ydesign-horizontal {
                    width: 94vw;
                    height: auto !important;
                }
            }

            @keyframes ydesignPosterBreath {
                0%, 100% {
                    transform: scale(1) translateZ(0);
                }
                50% {
                    transform: scale(var(--ydesign-poster-breath-scale, 1.05)) translateZ(0);
                }
            }

            .ydesign-dark-overlay {
                position: absolute;
                inset: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.18), rgba(0,0,0,0.06));
                pointer-events: none;
                z-index: 1;
                filter: none !important;
                backdrop-filter: none !important;
            }

            .ydesign-img-layer {
                position: absolute;
                inset: 0;
                background-color: #111214;
                background-image: linear-gradient(135deg, #1a1b1f 0%, #0f1012 100%);
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center center;
                transition: background-image 0.35s ease, background-position 0.35s ease, transform 0.45s ease;
                filter: none !important;
                backdrop-filter: none !important;
                image-rendering: auto;
                transform: scale(1) translateZ(0);
                transform-origin: center center;
                will-change: transform;
                backface-visibility: hidden;
            }

            .ydesign-img-layer.loaded {
                background-size: cover;
                background-position: center center;
            }

            body.ydesign-poster-breathing .card:not(.focus) .ydesign-img-layer.loaded {
                animation: none;
                transform: scale(1) translateZ(0);
            }

            body.ydesign-poster-breathing .card.focus .ydesign-img-layer.loaded {
                animation: ydesignPosterBreath var(--ydesign-poster-breath-duration, 12s) ease-in-out infinite;
            }

            .ydesign-gradient-layer {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: 62%;
                pointer-events: none;
                z-index: 2;
                filter: none !important;
                backdrop-filter: none !important;
            }

            .ydesign-content-layer {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: stretch;
                padding: 1.05em 0.82em var(--ydesign-content-pb, 0.8em) 0.82em;
                box-sizing: border-box;
                z-index: 3;
                pointer-events: none;
                background: transparent !important;
            }

            .ydesign-logo-container {
                display: flex;
                align-items: flex-end;
                margin-bottom: var(--ydesign-logo-mb, 0.9em);
                width: 100%;
                height: var(--ydesign-logo-h, 35%);
                max-height: var(--ydesign-logo-h, 35%);
                flex-shrink: 0;
                justify-content: var(--ydesign-align-logo, center);
            }

            .ydesign-logo-container img {
                max-width: var(--ydesign-logo-w, 80%);
                max-height: 100%;
                height: auto;
                width: auto;
                object-fit: contain;
                filter: drop-shadow(0 2px 5px rgba(0,0,0,0.85));
            }

            .ydesign-text-title {
                width: var(--ydesign-logo-w, 100%);
                max-height: 100%;
                display: flex;
                align-items: flex-end;
                justify-content: var(--ydesign-align-logo, center);
                font-size: var(--ydesign-title-size, 1.2em);
                font-weight: 800;
                color: #fff;
                text-align: var(--ydesign-text-logo, center);
                text-shadow: 0 2px 8px rgba(0,0,0,0.95);
                line-height: 1.25;
                padding-bottom: 0.1em;
                word-break: break-word;
            }

            .ydesign-info-wrap {
                display: flex;
                width: 100%;
                overflow: hidden;
            }

            .ydesign-vertical .ydesign-info-wrap {
                flex-direction: column;
                align-items: var(--ydesign-align-badges, center);
                gap: var(--ydesign-badge-rows-gap, 0.4em);
            }

            .ydesign-horizontal .ydesign-info-wrap {
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: var(--ydesign-align-badges, center);
                align-items: center;
                gap: 0.4em;
            }

            body.ydesign-badges-one-row .ydesign-vertical .ydesign-info-wrap {
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: var(--ydesign-align-badges, center);
                align-items: center;
                gap: 0.4em;
            }

            .ydesign-horizontal .ydesign-badges,
            .ydesign-horizontal .ydesign-ratings,
            body.ydesign-badges-one-row .ydesign-vertical .ydesign-badges,
            body.ydesign-badges-one-row .ydesign-vertical .ydesign-ratings {
                width: auto;
                flex-shrink: 1;
            }

            .ydesign-badges,
            .ydesign-ratings {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                white-space: nowrap;
                gap: 0.4em;
                width: 100%;
                justify-content: var(--ydesign-align-badges, center);
                overflow: hidden;
                margin-bottom: 0;
            }

            .ydesign-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: var(--ydesign-badge-size, 0.75em);
                font-weight: 700;
                color: #fff;
                padding: 0.24em 0.42em;
                border: 1px solid rgba(255,255,255,0.6);
                border-radius: 0.34em;
                background: rgba(0,0,0,0.28);
                box-sizing: border-box;
                text-shadow: 0 1px 4px rgba(0,0,0,0.95);
            }

            .ydesign-rating {
                display: flex;
                align-items: center;
                gap: 0.24em;
                font-size: var(--ydesign-rating-size, 0.8em);
                font-weight: 700;
                color: #fff;
                text-shadow: 0 1px 4px rgba(0,0,0,0.95);
            }

            .ydesign-rating img {
                width: 1.1em;
                height: 1.1em;
                object-fit: contain;
                filter: saturate(var(--ydesign-ratings-saturate, 100%)) drop-shadow(0 1px 3px rgba(0,0,0,0.95));
            }

            .ydesign-slogan {
                width: 100%;
                font-size: var(--ydesign-slogan-size, 0.85em);
                color: rgba(255,255,255,0.92);
                text-align: var(--ydesign-text-slogan, center);
                margin-top: var(--ydesign-slogan-padding, 0.3em);
                line-height: 1.4;
                font-weight: 500;
                text-shadow: 0 2px 6px rgba(0,0,0,0.95);
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                min-height: calc(var(--ydesign-slogan-size, 0.85em) * 1.4 * 2);
                padding-bottom: 0.1em;
            }

            .ydesign-title-under {
                position: relative;
                z-index: 10;
                width: 100%;
                margin-top: 0.58em;
                font-size: var(--ydesign-title-below-size, 0.92em);
                font-weight: 700;
                color: rgba(255,255,255,0.98);
                line-height: 1.35;
                text-align: left;
                white-space: normal;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .ydesign-desc-under {
                position: relative;
                z-index: 10;
                width: 100%;
                font-size: var(--ydesign-desc-size, 0.85em);
                color: rgba(255,255,255,0.76);
                margin-top: 0.42em;
                text-align: left;
                line-height: 1.35;
                white-space: normal;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                min-height: calc(var(--ydesign-desc-size, 0.85em) * 1.35 * 3);
                padding-bottom: 0.1em;
            }

            body.ydesign-hide-year .ydesign-badge-year { display: none !important; }
            body.ydesign-hide-seasons .ydesign-badge-seasons { display: none !important; }
            body.ydesign-hide-age .ydesign-badge-age { display: none !important; }
            body.ydesign-hide-slogan .ydesign-slogan-text { display: none !important; }
        `;

        document.head.appendChild(style);
    }

    function getFlexAlign(val) {
        if (val === 'left') return 'flex-start';
        if (val === 'right') return 'flex-end';
        return 'center';
    }

    function applyDynamicCSS() {
        document.body.classList.add('ydesign-active');
        document.documentElement.style.setProperty('--ydesign-logo-h', getSet('ydesign_logo_max_h') + '%');
        document.documentElement.style.setProperty('--ydesign-logo-w', getSet('ydesign_logo_max_w') + '%');
        document.documentElement.style.setProperty('--ydesign-title-size', getSet('ydesign_text_title_size') + 'em');
        document.documentElement.style.setProperty('--ydesign-slogan-size', getSet('ydesign_text_slogan_size') + 'em');
        document.documentElement.style.setProperty('--ydesign-badge-size', getSet('ydesign_text_badge_size') + 'em');
        document.documentElement.style.setProperty('--ydesign-rating-size', getSet('ydesign_text_rating_size') + 'em');
        document.documentElement.style.setProperty('--ydesign-desc-size', getSet('ydesign_desc_size') + 'em');
        document.documentElement.style.setProperty('--ydesign-title-below-size', getSet('ydesign_title_below_size') + 'em');
        document.documentElement.style.setProperty('--ydesign-card-gap', getSet('ydesign_card_gap') + 'em');
        document.documentElement.style.setProperty('--ydesign-badge-rows-gap', getSet('ydesign_badge_rows_gap') + 'em');
        document.documentElement.style.setProperty('--ydesign-content-pb', getSet('ydesign_content_pb') + 'em');
        document.documentElement.style.setProperty('--ydesign-slogan-padding', getSet('ydesign_slogan_padding') + 'em');
        document.documentElement.style.setProperty('--ydesign-logo-mb', getSet('ydesign_logo_mb') + 'em');
        document.documentElement.style.setProperty('--ydesign-ratings-saturate', getSet('ydesign_ratings_saturate') + '%');
        document.documentElement.style.setProperty('--ydesign-poster-breath-scale', getSet('ydesign_poster_breathing_scale'));
        document.documentElement.style.setProperty('--ydesign-poster-breath-duration', getSet('ydesign_poster_breathing_speed') + 's');
        document.documentElement.style.setProperty('--ydesign-card-border-width', getSet('ydesign_card_border_width') + 'px');
        document.documentElement.style.setProperty('--ydesign-card-focus-border-width', getSet('ydesign_card_focus_border_width') + 'px');

        var borderColor = getCardBorderColor();
        document.documentElement.style.setProperty('--ydesign-card-border-color', borderColor);
        document.documentElement.style.setProperty('--ydesign-card-border-glow-color', colorWithAlpha(borderColor, 0.42));

        var alignLogo = getSet('ydesign_align_logo');
        document.documentElement.style.setProperty('--ydesign-align-logo', getFlexAlign(alignLogo));
        document.documentElement.style.setProperty('--ydesign-text-logo', alignLogo);
        document.documentElement.style.setProperty('--ydesign-align-badges', getFlexAlign(getSet('ydesign_align_badges')));

        var alignSlogan = getSet('ydesign_align_slogan');
        document.documentElement.style.setProperty('--ydesign-align-slogan', getFlexAlign(alignSlogan));
        document.documentElement.style.setProperty('--ydesign-text-slogan', alignSlogan);

        document.body.classList.toggle('ydesign-hide-year', !getBool('ydesign_show_year'));
        document.body.classList.toggle('ydesign-hide-seasons', !getBool('ydesign_show_seasons'));
        document.body.classList.toggle('ydesign-hide-age', !getBool('ydesign_show_age'));
        document.body.classList.toggle('ydesign-hide-slogan', !getBool('ydesign_show_slogan'));
        document.body.classList.toggle('ydesign-badges-one-row', getBool('ydesign_badges_one_row'));
        document.body.classList.toggle('ydesign-poster-breathing', getBool('ydesign_poster_breathing'));
    }

    function rerenderBuiltCards() {
        var cards = document.querySelectorAll('.ydesign-card');
        for (var i = 0; i < cards.length; i++) {
            if (cards[i] && cards[i]._ydesign_data) buildCardCustomDOM(cards[i], cards[i]._ydesign_data);
        }
    }

    function createSettings(retry) {
        retry = retry || 0;

        if (window.YDesignSettingsCreated) return;
        if (!window.Lampa || !Lampa.SettingsApi || !Lampa.Settings || !Lampa.Storage) {
            if (retry < 10) setTimeout(function () { createSettings(retry + 1); }, 400);
            return;
        }

        window.YDesignSettingsCreated = true;

        Lampa.SettingsApi.addComponent({
            component: 'ydesign',
            name: 'Дизайн',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><path d="M8 8l4 4 4-4"></path><path d="M12 12v4"></path></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_clear_cache', type: 'button' },
            field: {
                name: 'Очистить кеш плагина',
                description: 'Удаляет кеш изображений, рейтингов и проверок'
            },
            onChange: function () {
                var keysToRemove = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.indexOf('ydesign_cache_') === 0) keysToRemove.push(key);
                }
                for (var j = 0; j < keysToRemove.length; j++) localStorage.removeItem(keysToRemove[j]);
                Lampa.Noty.show('Кеш плагина очищен (' + keysToRemove.length + ' записей)');
            }
        });

        var qualities = {
            'w92': 'w92',
            'w154': 'w154',
            'w185': 'w185',
            'w342': 'w342',
            'w500': 'w500',
            'w780': 'w780',
            'original': 'Оригинал'
        };

        var textSizes = {};
        for (var i = 5; i <= 30; i++) {
            var val = (i / 10).toFixed(1);
            textSizes[val] = val;
        }

        var gaps = {};
        for (var k = 0; k <= 15; k++) {
            gaps[(k / 10).toFixed(1)] = (k / 10).toFixed(1) + ' em';
        }

        var logoSizes = {};
        for (var l = 1; l <= 34; l += 3) logoSizes[l] = l + '%';
        logoSizes[35] = '35%';
        [40, 50, 60, 70, 80, 90, 100].forEach(function (v) { logoSizes[v] = v + '%'; });

        var logoMbGaps = {};
        for (var m = -10; m <= 50; m += 5) {
            var gapVal = (m / 10).toFixed(1);
            logoMbGaps[gapVal] = gapVal + ' em';
        }

        var saturates = {
            '0': '0% (Ч/Б)',
            '25': '25%',
            '75': '75%',
            '100': '100% (Норма)',
            '150': '150% (Ярче)'
        };

        var breathingScales = {
            '1.02': '1.02x (очень мягко)',
            '1.04': '1.04x',
            '1.05': '1.05x (оптимально)',
            '1.06': '1.06x',
            '1.08': '1.08x (сильнее)'
        };

        var breathingSpeeds = {
            '8': '8 сек',
            '12': '12 сек',
            '16': '16 сек',
            '20': '20 сек'
        };

        var borderWidths = {
            '0': '0 px',
            '1': '1 px',
            '2': '2 px',
            '3': '3 px',
            '4': '4 px'
        };

        var focusBorderWidths = {
            '1': '1 px',
            '2': '2 px',
            '3': '3 px',
            '4': '4 px',
            '5': '5 px',
            '6': '6 px'
        };

        var borderThemes = {
            cyan: 'Cyan',
            violet: 'Violet',
            emerald: 'Emerald',
            amber: 'Amber',
            rose: 'Rose',
            blue: 'Blue',
            white: 'White',
            custom: 'Свой цвет'
        };

        var aligns = {
            'left': 'Слева',
            'center': 'По центру',
            'right': 'Справа'
        };

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_lazy_load', type: 'trigger', default: DefaultSettings.ydesign_lazy_load }, field: { name: 'Ленивая загрузка', description: 'Загружать данные карточек только при появлении на экране' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_type_main', type: 'select', values: { 'vertical': 'Вертикальные (9:16)', 'horizontal': 'Горизонтальные (16:11)' }, default: DefaultSettings.ydesign_card_type_main }, field: { name: 'Тип карточек (Главная)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_type_other', type: 'select', values: { 'vertical': 'Вертикальные (9:16)', 'horizontal': 'Горизонтальные (16:11)' }, default: DefaultSettings.ydesign_card_type_other }, field: { name: 'Тип карточек (Другие страницы)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_badges_one_row', type: 'trigger', default: DefaultSettings.ydesign_badges_one_row }, field: { name: 'Все бейджи в 1 ряд (Вертикальные)' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_desc_horz', type: 'trigger', default: DefaultSettings.ydesign_show_desc_horz }, field: { name: 'Описание под карточкой (Горизонтальные)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_title_below', type: 'trigger', default: DefaultSettings.ydesign_show_title_below }, field: { name: 'Название под карточкой' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_poster_breathing', type: 'trigger', default: DefaultSettings.ydesign_poster_breathing }, field: { name: 'Дыхание постера', description: 'Работает только на карточке в фокусе' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_poster_breathing_scale', type: 'select', values: breathingScales, default: DefaultSettings.ydesign_poster_breathing_scale }, field: { name: 'Сила дыхания постера' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_poster_breathing_speed', type: 'select', values: breathingSpeeds, default: DefaultSettings.ydesign_poster_breathing_speed }, field: { name: 'Скорость дыхания постера' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_border_width', type: 'select', values: borderWidths, default: DefaultSettings.ydesign_card_border_width }, field: { name: 'Толщина рамки карточки' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_focus_border_width', type: 'select', values: focusBorderWidths, default: DefaultSettings.ydesign_card_focus_border_width }, field: { name: 'Толщина рамки в фокусе' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_border_theme', type: 'select', values: borderThemes, default: DefaultSettings.ydesign_card_border_theme }, field: { name: 'Тема цвета рамки' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_title_below_size', type: 'select', values: textSizes, default: DefaultSettings.ydesign_title_below_size }, field: { name: 'Размер названия под карточкой' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_desc_size', type: 'select', values: textSizes, default: DefaultSettings.ydesign_desc_size }, field: { name: 'Размер текста описания' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_card_gap }, field: { name: 'Расстояние между карточками' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_badge_rows_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_badge_rows_gap }, field: { name: 'Отступ между строками бейджей/рейтингов' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_content_pb', type: 'select', values: gaps, default: DefaultSettings.ydesign_content_pb }, field: { name: 'Отступ контента снизу' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_slogan_padding', type: 'select', values: gaps, default: DefaultSettings.ydesign_slogan_padding }, field: { name: 'Отступ слогана сверху' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_mb', type: 'select', values: logoMbGaps, default: DefaultSettings.ydesign_logo_mb }, field: { name: 'Отступ логотипа от бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_ratings_saturate', type: 'select', values: saturates, default: DefaultSettings.ydesign_ratings_saturate }, field: { name: 'Насыщенность иконок рейтингов' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_align_logo', type: 'select', values: aligns, default: DefaultSettings.ydesign_align_logo }, field: { name: 'Выравнивание: Логотип/Название' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_align_badges', type: 'select', values: aligns, default: DefaultSettings.ydesign_align_badges }, field: { name: 'Выравнивание: Бейджи/Рейтинги' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_align_slogan', type: 'select', values: aligns, default: DefaultSettings.ydesign_align_slogan }, field: { name: 'Выравнивание: Слоган' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_lang', type: 'select', values: { 'ru': 'Только Русский', 'ru_en': 'Рус → Англ → Ориг', 'uk': 'Только Украинский', 'uk_en': 'Укр → Англ → Ориг', 'en_orig': 'Англ → Ориг' }, default: DefaultSettings.ydesign_lang }, field: { name: 'Язык логотипа/названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_slogan_lang', type: 'select', values: { 'ru': 'Только Русский', 'ru_en': 'Рус (Англ. если нет)', 'uk': 'Только Украинский', 'uk_en': 'Укр (Англ. если нет)', 'en': 'Только Английский' }, default: DefaultSettings.ydesign_slogan_lang }, field: { name: 'Язык слогана' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_desc_lang', type: 'select', values: { 'ru': 'Только Русский', 'ru_en': 'Рус (Англ. если нет)', 'uk': 'Только Украинский', 'uk_en': 'Укр (Англ. если нет)', 'en': 'Только Английский' }, default: DefaultSettings.ydesign_desc_lang }, field: { name: 'Язык описания под карточкой' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_poster_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_poster_quality }, field: { name: 'Качество постеров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_backdrop_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_backdrop_quality }, field: { name: 'Качество бэкдропов' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_logo_quality }, field: { name: 'Качество логотипов' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_max_h', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_logo_max_h }, field: { name: 'Макс. высота логотипа/текста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_max_w', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_logo_max_w }, field: { name: 'Макс. ширина логотипа/текста' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_title_size', type: 'select', values: textSizes, default: DefaultSettings.ydesign_text_title_size }, field: { name: 'Размер текста названия (если нет логотипа)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_slogan_size', type: 'select', values: textSizes, default: DefaultSettings.ydesign_text_slogan_size }, field: { name: 'Размер текста слогана' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_badge_size', type: 'select', values: textSizes, default: DefaultSettings.ydesign_text_badge_size }, field: { name: 'Размер текста бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_rating_size', type: 'select', values: textSizes, default: DefaultSettings.ydesign_text_rating_size }, field: { name: 'Размер текста рейтингов' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_year', type: 'trigger', default: DefaultSettings.ydesign_show_year }, field: { name: 'Показывать Год' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_seasons', type: 'trigger', default: DefaultSettings.ydesign_show_seasons }, field: { name: 'Показывать Сезоны/Серии' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_age', type: 'trigger', default: DefaultSettings.ydesign_show_age }, field: { name: 'Показывать возрастной рейтинг' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_slogan', type: 'trigger', default: DefaultSettings.ydesign_show_slogan }, field: { name: 'Показывать слоган' } });

        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_card_border_custom_color_btn', type: 'button' },
            field: {
                name: 'Свой цвет рамки',
                description: sanitizeCssColor(getSet('ydesign_card_border_custom_color'), '#22d3ee')
            },
            onChange: function () {
                Lampa.Input.edit({ title: 'Свой цвет рамки (#22d3ee / rgb / rgba)', value: getSet('ydesign_card_border_custom_color'), free: true, nosave: true }, function (newVal) {
                    if (newVal !== undefined) {
                        Lampa.Storage.set('ydesign_card_border_custom_color', sanitizeCssColor(newVal, '#22d3ee'));
                        applyDynamicCSS();
                        Lampa.Settings.update();
                    }
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_omdb_key_btn', type: 'button' },
            field: {
                name: 'OMDB API Key',
                description: getSet('ydesign_omdb_key') ? 'Установлен' : 'Не установлен'
            },
            onChange: function () {
                Lampa.Input.edit({ title: 'OMDB API Key', value: getSet('ydesign_omdb_key'), free: true, nosave: true }, function (newVal) {
                    if (newVal !== undefined) {
                        Lampa.Storage.set('ydesign_omdb_key', String(newVal).trim());
                        Lampa.Settings.update();
                    }
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_mdblist_key_btn', type: 'button' },
            field: {
                name: 'MDBList API Key',
                description: getSet('ydesign_mdblist_key') ? 'Установлен' : 'Не установлен'
            },
            onChange: function () {
                Lampa.Input.edit({ title: 'MDBList API Key', value: getSet('ydesign_mdblist_key'), free: true, nosave: true }, function (newVal) {
                    if (newVal !== undefined) {
                        Lampa.Storage.set('ydesign_mdblist_key', String(newVal).trim());
                        Lampa.Settings.update();
                    }
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_ratings_order_btn', type: 'button' },
            field: {
                name: 'Порядок и выбор рейтингов',
                description: getSet('ydesign_ratings_order')
            },
            onChange: function () {
                Lampa.Input.edit({
                    title: 'Введите через запятую (tmdb, imdb, rt, mc, trakt, mdblist, popcorn, letterboxd, kp)',
                    value: getSet('ydesign_ratings_order'),
                    free: true,
                    nosave: true
                }, function (newVal) {
                    if (newVal !== undefined) {
                        Lampa.Storage.set('ydesign_ratings_order', String(newVal).trim().toLowerCase());
                        Lampa.Settings.update();
                    }
                });
            }
        });

        Lampa.Settings.listener.follow('change', function (e) {
            var name = String((e && e.name) || '');
            if (name.indexOf('ydesign_') === -1) return;

            applyDynamicCSS();

            var rerenderKeys = [
                'ydesign_lang',
                'ydesign_slogan_lang',
                'ydesign_desc_lang',
                'ydesign_card_type_main',
                'ydesign_card_type_other',
                'ydesign_show_desc_horz',
                'ydesign_show_title_below',
                'ydesign_title_below_size',
                'ydesign_text_title_size',
                'ydesign_logo_quality',
                'ydesign_poster_quality',
                'ydesign_backdrop_quality',
                'ydesign_logo_max_h',
                'ydesign_logo_max_w'
            ];

            if (rerenderKeys.indexOf(name) !== -1) rerenderBuiltCards();
        });
    }

    function overrideCards(retry) {
        retry = retry || 0;

        if (window.YDesignCardsPatched) return;
        if (!window.Lampa || !Lampa.Maker || !Lampa.Maker.map) {
            if (retry < 10) setTimeout(function () { overrideCards(retry + 1); }, 400);
            return;
        }

        var CardMaker = Lampa.Maker.map('Card');
        if (!CardMaker || !CardMaker.Card || !CardMaker.Card.onVisible) {
            if (retry < 10) setTimeout(function () { overrideCards(retry + 1); }, 400);
            return;
        }

        window.YDesignCardsPatched = true;
        var originalOnVisible = CardMaker.Card.onVisible;

        CardMaker.Card.onVisible = function () {
            if (originalOnVisible) originalOnVisible.apply(this, arguments);

            if (!this || !this.data || !this.data.id) return;

            var type = getCardType(this.data);
            if (type !== 'movie' && type !== 'tv') return;

            var el = this.html && (this.html[0] || this.html);
            if (!el) return;

            el._ydesign_data = this.data;
            if (!el._ydesign_built) el._ydesign_built = true;
            buildCardCustomDOM(el, this.data);
        };
    }

    function pingCurrentCards() {
        try {
            if (!window.$) return;
            $('.card').trigger('visible');
        } catch (e) {}
    }

    function init() {
        if (window.YDesignStarted) return;
        if (!window.Lampa || !Lampa.Storage) return;

        window.YDesignStarted = true;
        injectCSS();
        applyDynamicCSS();
        createSettings();
        overrideCards();

        setTimeout(pingCurrentCards, 150);
        setTimeout(pingCurrentCards, 700);
    }

    if (window.appready) {
        init();
    } else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e && e.type === 'ready') init();
        });
    }
})();
