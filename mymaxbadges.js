(function () {
    'use strict';

    if (window.YDesignLoaded) return;
    window.YDesignLoaded = true;

    var CONFIG = {
        cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 днів
        tmdbKey: function() { return (Lampa.TMDB && Lampa.TMDB.key) ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96'; }
    };

     var rateIcons = {
        imdb: 'https://upload.wikimedia.org/wikipedia/commons/5/53/IMDB_-_SuperTinyIcons.svg',
        rt: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg',
        mc: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='11' fill='%2300c300'/%3E%3Cpolygon points='6,7 10,7 12,13 14,7 18,7 18,17 16,17 16,10 14,17 10,17 8,10 8,17 6,17' fill='white'/%3E%3C/svg%3E",
        tmdb: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tmdb.new.logo.svg',
        trakt: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Trakt.tv-favicon.svg',
        mdblist: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='%23ffffff'%3E%3Cpath d='M1.928.029A2.47 2.47 0 0 0 .093 1.673c-.085.248-.09.629-.09 10.33s.005 10.08.09 10.33a2.51 2.51 0 0 0 1.512 1.558l.276.108h20.237l.277-.108a2.51 2.51 0 0 0 1.512-1.559c.085-.25.09-.63.09-10.33s-.005-10.08-.09-10.33A2.51 2.51 0 0 0 22.395.115l-.277-.109L12.117 0C6.615-.004 2.032.011 1.929.029m7.48 8.067l2.123 2.004v1.54c0 .897-.02 1.536-.043 1.527s-.92-.845-1.995-1.86c-1.071-1.01-1.962-1.84-1.977-1.84s-.024 1.91-.024 4.248v4.25H4.911V6.085h1.188l1.183.006zm9.729 3.93v5.94h-2.63l-.01-4.25l-.013-4.25l-1.907 1.795a367 367 0 0 1-1.98 1.864c-.076.056-.08-.047-.08-1.489v-1.555l2.127-1.995l2.127-1.995l1.187-.005h1.184z'/%3E%3C/svg%3E",
        popcorn: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg',
        letterboxd: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Letterboxd_2023_logo.png'
    };

    var DefaultSettings = {
        ydesign_logo_quality: 'w300',
        ydesign_poster_quality: 'w500',
        ydesign_backdrop_quality: 'w780',
        ydesign_lang: 'ru_en',
        ydesign_slogan_lang: 'ru',
        ydesign_desc_lang: 'ru', 
        ydesign_logo_type: 'logo',
        ydesign_logo_max_h: '35',
        ydesign_logo_max_w: '80',
        ydesign_text_title_size: '1.2',
        ydesign_text_slogan_size: '0.85',
        ydesign_text_badge_size: '0.75',
        ydesign_text_rating_size: '0.8',
        ydesign_desc_size: '0.85',
        ydesign_text_add_title_size: '0.9',
        ydesign_text_genres_size: '0.75', 
        ydesign_card_type_main: 'horizontal', 
        ydesign_card_type_other: 'vertical',
        ydesign_badges_one_row: false, 
        ydesign_show_desc_horz: true, 
        ydesign_show_year: true,
        ydesign_show_seasons: true,
        ydesign_show_ua: true,
        ydesign_show_age: true,
        ydesign_show_slogan: true,
        ydesign_show_add_title: true, 
        ydesign_add_title_lang: 'auto',
        ydesign_show_genres: true, 
        ydesign_show_ratings: true,
        ydesign_lazy_load: true,
        ydesign_card_gap: '0.8',
        ydesign_badge_rows_gap: '0.4',
        ydesign_badges_gap_vert: '0.15', 
        ydesign_badges_gap_horz: '0.15', 
        ydesign_genres_gap: '0.15',
        ydesign_content_pb: '0.8',
        ydesign_slogan_padding: '0.3',
        ydesign_logo_mb: '1.2', 
        ydesign_add_title_mb: '0.3', 
        ydesign_uniform_v_gaps_vert: true, 
        ydesign_uniform_v_gap_val_vert: '0.05', 
        ydesign_uniform_v_gaps_horz: true, 
        ydesign_uniform_v_gap_val_horz: '0.30', 
        ydesign_ratings_saturate: '100', 
        ydesign_align_logo: 'center',
        ydesign_align_badges: 'center',
        ydesign_align_slogan: 'center',
        ydesign_ratings_order: 'tmdb, imdb, rt, popcorn', 
        ydesign_omdb_key: '',
        ydesign_mdblist_key: '',
        ydesign_series_redesign: true,
        ydesign_series_cards: '2',
        ydesign_hide_left_column: true, // НОВЕ НАЛАШТУВАННЯ
        ydesign_horz_ratings_row: false,
        ydesign_logo_pos_horz: 'bottom',
        ydesign_border_ratings: true, 
        ydesign_border_badges: true, 
        ydesign_uniform_badges: false,
         ydesign_badge_shape: 'pill',
         ydesign_glass_pill_bg: true,
         ydesign_color_age: true,
         ydesign_color_ua: true,
         ydesign_border_year: true,
         ydesign_border_age: true,
         ydesign_border_seasons: true,
         ydesign_border_ua: true,
         ydesign_border_genres: true,
         ydesign_v_badge_size: '0.8',
         ydesign_v_year_size: '0.8',
         ydesign_v_age_size: '0.8',
         ydesign_v_seasons_size: '0.8',
         ydesign_v_ua_size: '0.8',
         ydesign_v_genres_size: '0.8',
         ydesign_v_rating_size: '0.8',
         ydesign_v_uniform_badges: true,
         ydesign_v_badges_one_row: false,
         ydesign_v_align_badges: 'left',
         ydesign_v_badges_gap: '0.15',
         ydesign_v_badge_rows_gap: '0.3',
         ydesign_h_badge_size: '0.8',
         ydesign_h_year_size: '0.8',
         ydesign_h_age_size: '0.8',
         ydesign_h_seasons_size: '0.8',
         ydesign_h_ua_size: '0.8',
         ydesign_h_genres_size: '0.8',
         ydesign_h_rating_size: '0.8',
         ydesign_h_uniform_badges: true,
         ydesign_h_ratings_row: false,
         ydesign_h_align_badges: 'left',
         ydesign_h_badges_gap: '0.15',
         ydesign_h_badge_rows_gap: '0.3',
        ydesign_grid_items_v: '5',
        ydesign_grid_items_h: '3',
        ydesign_show_poster_title: false,
        ydesign_poster_title_lang: 'main',
        ydesign_poster_title_size: '0.85',
        ydesign_show_type_label: true,
        ydesign_type_label_corner: 'top-right',
        ydesign_type_label_size: '0.60',
        ydesign_card_border: false,
        ydesign_card_border_width: '0.20',
        ydesign_card_border_color: '#2b7fff',
        ydesign_badge_dark_bg: false,
        ydesign_focus_color: '#ffffff',
        ydesign_focus_width: '0.25'
    };

    function getSet(key) {
        var val = Lampa.Storage.get(key);
        if (val !== null && val !== undefined && val !== '') return val;
        return DefaultSettings[key];
    }

    var ApiCache = {
        get: function(key) {
            var data = Lampa.Storage.get('ydesign_cache_' + key);
            if (data && (Date.now() - data.time < CONFIG.cacheTime)) return data.val;
            return null;
        },
        set: function(key, val) {
            Lampa.Storage.set('ydesign_cache_' + key, { val: val, time: Date.now() });
        }
    };

    var IconCache = {};
    function preloadIcon(key, url) {
        return new Promise(function(resolve) {
            if (IconCache[key] || url.startsWith('data:')) {
                IconCache[key] = true;
                return resolve();
            }
            var img = new Image();
            img.onload = function() { IconCache[key] = true; resolve(); };
            img.onerror = function() { IconCache[key] = true; resolve(); }; 
            img.src = url;
        });
    }

    var LazyLoader = {
        observer: null,
        init: function() {
            if (this.observer) return;
            this.observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        if (el._lazyQueue) {
                            el._lazyQueue.forEach(fn => fn());
                            delete el._lazyQueue;
                        }
                        observer.unobserve(el);
                    }
                });
            }, { rootMargin: '150px' });
        },
        add: function(el, fn) {
            this.init();
            el._lazyQueue = [fn];
            this.observer.observe(el);
        }
    };

    function getProminentColor(imgEl, callback) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = 1; canvas.height = 1;
        try {
            var sx = 0, sy = imgEl.naturalHeight * 0.7, sw = imgEl.naturalWidth, sh = imgEl.naturalHeight * 0.3;
            ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, 1, 1);
            var data = ctx.getImageData(0, 0, 1, 1).data;
            var r = data[0], g = data[1], b = data[2];
            
            var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            if (luma > 140) { 
                var factor = 110 / luma; 
                r = Math.floor(r * factor); g = Math.floor(g * factor); b = Math.floor(b * factor);
            } else if (luma < 30) {
                r = 50; g = 50; b = 50;
            }
            callback('rgb(' + r + ',' + g + ',' + b + ')');
        } catch(e) {
            callback('rgb(50, 50, 50)'); 
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

    function checkUaVoiceover(tmdbId, type) {
        return new Promise(function(resolve) {
            var cacheKey = 'ua_api_' + tmdbId;
            var cached = ApiCache.get(cacheKey);
            if (cached !== null) return resolve(cached);

            var isSerial = (type === 'tv' || type === 'tv_series') ? 1 : 0;
            var url = 'https://wh.lme.isroot.in/?tmdb_id=' + encodeURIComponent(tmdbId) + '&serial=' + isSerial + '&silent=true';
            
            $.ajax({
                url: url, timeout: 4000,
                success: function(r) {
                    var hasUa = (r === true || r.success === true || r.status === 'success' || r.ok === true || (typeof r === 'object' && Object.keys(r).length > 0 && !r.error));
                    ApiCache.set(cacheKey, hasUa);
                    resolve(hasUa);
                },
                error: function() { resolve(false); }
            });
        });
    }

    async function fetchExternalRatings(tmdbId, type) {
        var cacheKey = 'ext_rates_v3_' + tmdbId;
        var cached = ApiCache.get(cacheKey);
        if (cached) return cached;

        var results = {};
        try {
            var extRes = await $.get('https://api.themoviedb.org/3/'+type+'/'+tmdbId+'/external_ids?api_key='+CONFIG.tmdbKey());
            var imdbId = extRes.imdb_id;
            if (!imdbId) return results;

            var omdbKey = getSet('ydesign_omdb_key').trim();
            var mdblistKey = getSet('ydesign_mdblist_key').trim();

            if (omdbKey) {
                try {
                    let omdbData = await $.get(`https://www.omdbapi.com/?apikey=${omdbKey}&i=${imdbId}`);
                    if (omdbData && omdbData.Response !== "False") {
                        if (omdbData.Metascore && omdbData.Metascore !== 'N/A') results.mc = omdbData.Metascore;
                        if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') results.imdb = omdbData.imdbRating;
                        let rt = (omdbData.Ratings || []).find(r => r.Source === 'Rotten Tomatoes');
                        if (rt) results.rt = rt.Value.replace('%', '');
                    }
                } catch(e){}
            }

            if (mdblistKey) {
                try {
                    let mdbData = await $.get(`https://mdblist.com/api/?apikey=${mdblistKey}&i=${imdbId}`);
                    if (mdbData) {
                        if (mdbData.score) results.mdblist = mdbData.score;
                        (mdbData.ratings || []).forEach(r => {
                            if (r.source === 'trakt') results.trakt = r.value;
                            if (r.source === 'letterboxd') results.letterboxd = r.value;
                            if (r.source === 'tomatoesaudience') results.popcorn = r.value;
                            if (r.source === 'metacritic' && !results.mc) results.mc = r.value;
                            if (r.source === 'tomatoes' && !results.rt) results.rt = r.value;
                            if (r.source === 'imdb' && !results.imdb) results.imdb = r.value;
                        });
                    }
                } catch(e){}
            }

            ApiCache.set(cacheKey, results);
        } catch(e){}
        return results;
    }

    function fetchExtendedData(id, type) {
        return new Promise(async function(resolve) {
            var langPref = getSet('ydesign_lang');
            var sloganLang = getSet('ydesign_slogan_lang');
            var descLang = getSet('ydesign_desc_lang');
            
            var cacheKey = type + '_' + id + '_' + langPref + '_' + sloganLang + '_' + descLang + '_v4';
            var cached = ApiCache.get(cacheKey);
            if (cached) return resolve(cached);

            try {
                var buildTmdbUrl = function(lang) {
                    return 'https://api.themoviedb.org/3/' + type + '/' + id +
                          '?api_key=' + CONFIG.tmdbKey() +
                          '&language=' + lang +
                          '&append_to_response=images,release_dates,content_ratings' +
                          '&include_image_language=uk,ru,en,null';
                };

                // Слоган и описание теперь выбираются независимо: 'ru' или 'uk'
                var sloganLangCode = (sloganLang === 'uk') ? 'uk-UA' : 'ru-RU';
                var descLangCode = (descLang === 'uk') ? 'uk-UA' : 'ru-RU';

                var langQuery = (langPref === 'uk' || langPref === 'uk_en') ? 'uk-UA'
                    : (langPref === 'en_orig') ? 'en-US'
                    : 'ru-RU'; // ru / ru_en (по умолчанию) — основной язык

                // Основной запрос должен покрывать хотя бы один из нужных языков слогана/описания
                if (langQuery !== sloganLangCode && langQuery !== descLangCode) {
                    langQuery = sloganLangCode;
                }

                var data = await $.get(buildTmdbUrl(langQuery));
                var enData = null;

                if (langPref === 'en_orig' && langQuery !== 'en-US') {
                    try { enData = await $.get(buildTmdbUrl('en-US')); } catch(e) {}
                }

                // Если слогану/описанию нужен ещё один язык (ru или uk), которого нет в основном запросе — догружаем
                var altLangCode = null;
                if (sloganLangCode !== langQuery) altLangCode = sloganLangCode;
                else if (descLangCode !== langQuery) altLangCode = descLangCode;

                var altData = null;
                if (altLangCode) {
                    try { altData = await $.get(buildTmdbUrl(altLangCode)); } catch(e) {}
                }

                var pickField = function(neededLangCode, field) {
                    if (neededLangCode === langQuery) {
                        var v = data[field];
                        if (v && String(v).trim() !== '') return v;
                        if (enData && enData[field]) return enData[field];
                        return v || '';
                    }
                    if (altData && neededLangCode === altLangCode) {
                        return altData[field] || '';
                    }
                    return data[field] || '';
                };

                var finalTagline = pickField(sloganLangCode, 'tagline');
                var finalOverview = pickField(descLangCode, 'overview'); 

                var se_str = '';
                if (type === 'tv') {
                    var ds = data.number_of_seasons;
                    var de = data.number_of_episodes;
                    if (data.last_episode_to_air) {
                        var last_ep = data.last_episode_to_air;
                        var s_obj = data.seasons ? data.seasons.find(x => x.season_number === last_ep.season_number) : null;
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
                    clean_poster: null, clean_backdrop: null, logo: null, logo_lang: null,
                    age: null, seasons: data.number_of_seasons, episodes: data.number_of_episodes,
                    tmdb_rating: data.vote_average,
                    se_str: se_str,
                    title_uk: data.title || data.name || '',
                    title_en: enData ? (enData.title || enData.name) : ''
                };

                if (data.images) {
                    var cp = data.images.posters.find(p => p.iso_639_1 === null);
                    if(cp) result.clean_poster = cp.file_path;
                    else if (data.images.posters.length) result.clean_poster = data.images.posters[0].file_path;

                    var cb = data.images.backdrops.find(p => p.iso_639_1 === null);
                    if(cb) result.clean_backdrop = cb.file_path;
                    else if (data.images.backdrops.length) result.clean_backdrop = data.images.backdrops[0].file_path;

                    var logo = null;
                    if (langPref === 'ru') {
                        // Только русский
                        logo = data.images.logos.find(l => l.iso_639_1 === 'ru');
                    } else if (langPref === 'ru_en') {
                        // Русский → Английский → любой
                        logo = data.images.logos.find(l => l.iso_639_1 === 'ru')
                            || data.images.logos.find(l => l.iso_639_1 === 'en');
                        if (!logo && data.images.logos.length) logo = data.images.logos[0];
                    } else if (langPref === 'uk') {
                        logo = data.images.logos.find(l => l.iso_639_1 === 'uk');
                    } else if (langPref === 'uk_en') {
                        logo = data.images.logos.find(l => l.iso_639_1 === 'uk')
                            || data.images.logos.find(l => l.iso_639_1 === 'en');
                        if (!logo && data.images.logos.length) logo = data.images.logos[0];
                    } else {
                        // en_orig: английский → любой
                        logo = data.images.logos.find(l => l.iso_639_1 === 'en');
                        if (!logo && data.images.logos.length) logo = data.images.logos[0];
                    }
                    if (logo) {
                        result.logo = logo.file_path;
                        result.logo_lang = logo.iso_639_1;
                    }
                }

                if (type === 'movie' && data.release_dates && data.release_dates.results) {
                    var us = data.release_dates.results.find(r => r.iso_3166_1 === 'US');
                    if (us && us.release_dates.length) result.age = us.release_dates[0].certification;
                } else if (type === 'tv' && data.content_ratings && data.content_ratings.results) {
                    var usTv = data.content_ratings.results.find(r => r.iso_3166_1 === 'US');
                    if (usTv) result.age = usTv.rating;
                }

                result.age = parseAgeRating(result.age);

                ApiCache.set(cacheKey, result);
                resolve(result);
            } catch(e) {
                resolve(null);
            }
        });
    }

    async function renderRatingsAsync(container, baseData, tmdbData, extRatings) {
        var orderStr = String(getSet('ydesign_ratings_order') || 'tmdb,imdb,kp,rt,popcorn');
        var order = orderStr.split(',').map(function(s) { return s.trim().toLowerCase(); });

        var formatR = function(v, is100) {
            if (v === null || v === undefined || v === '' || v === 'N/A') return null;
            var n = parseFloat(String(v).replace('%',''));
            if (isNaN(n)) return null;
            if (is100 || n > 10) n = n / 10;
            return n.toFixed(1);
        };

        var available = {
            tmdb: formatR(tmdbData.tmdb_rating, false),
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
        order.forEach(function(key) {
            if (available[key] && key !== 'kp' && rateIcons[key]) {
                iconsToLoad.push(preloadIcon(key, rateIcons[key]));
            }
        });
        await Promise.all(iconsToLoad);

        container.innerHTML = '';
        order.forEach(function(key) {
            if (available[key]) {
                if (key === 'kp') {
                    container.innerHTML += '<span class="ydesign-rating"><b style="color:#f60; font-weight:800; font-size:1.1em; line-height:1; display:flex; align-items:center;">Kp</b> ' + available[key] + '</span>';
                } else {
                    var iconUrl = rateIcons[key] || rateIcons.tmdb;
                    container.innerHTML += '<span class="ydesign-rating"><img src="' + iconUrl + '" /> ' + available[key] + '</span>';
                }
            }
        });
    }

    function buildCardCustomDOM(cardHtml, data) {
        var el = cardHtml[0] || cardHtml;
        var isMain = el._ydesign_isMain !== undefined ? el._ydesign_isMain : (Lampa.Activity.active() ? Lampa.Activity.active().component === 'main' : true);
        var isHorz = isMain ? getSet('ydesign_card_type_main') === 'horizontal' : getSet('ydesign_card_type_other') === 'horizontal';
        
        el.classList.add('ydesign-card');
        el.classList.remove('ydesign-vertical', 'ydesign-horizontal');
        el.classList.add(isHorz ? 'ydesign-horizontal' : 'ydesign-vertical');

        var type = data.media_type || (data.name ? 'tv' : 'movie');
        if (!data.id) return;

        var buildExtendedCard = function() {
            var view = el.querySelector('.card__view');
            if (!view) return;
            view.innerHTML = '';

            var imgLayer = document.createElement('div'); imgLayer.className = 'ydesign-img-layer';
            var gradientLayer = document.createElement('div'); gradientLayer.className = 'ydesign-gradient-layer';
            var contentLayer = document.createElement('div'); contentLayer.className = 'ydesign-content-layer';

            view.appendChild(imgLayer);
            view.appendChild(gradientLayer);
            view.appendChild(contentLayer);

            // Apple TV–style тип (Фильм / Сериал)
            if (getSet('ydesign_show_type_label')) {
                var typePill = document.createElement('div');
                typePill.className = 'ydesign-type-pill';
                typePill.innerText = (type === 'tv') ? 'Сериал' : 'Фильм';
                view.appendChild(typePill);
            }

            var bgQuality = isHorz ? getSet('ydesign_backdrop_quality') : getSet('ydesign_poster_quality');
            var initialBg = isHorz ? (data.backdrop_path || data.poster_path) : (data.poster_path || data.backdrop_path);
            
            var applyBg = function(path) {
                if (!path) return;
                var img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = function() {
                    imgLayer.style.backgroundImage = 'url(' + img.src + ')';
                    imgLayer.classList.add('loaded');
                    getProminentColor(img, function(color) {
                        // Без тумана: прозрачный фон, только тонкий градиент снизу для текста
                        view.style.backgroundColor = 'transparent';
                        var ca = color.replace('rgb(', 'rgba(').replace(')', ',');
                        gradientLayer.style.background = 'linear-gradient(to top, ' + ca + '0.92) 0%, ' + ca + '0.6) 20%, ' + ca + '0.1) 40%, transparent 60%)';
                        contentLayer.style.background = 'none';
                    });
                };
                img.src = 'https://image.tmdb.org/t/p/' + bgQuality + path;
            };

            fetchExtendedData(data.id, type).then(function(extData) {
                var bgToLoad = initialBg; 

                if (extData) {
                    var cleanBg = isHorz ? extData.clean_backdrop : extData.clean_poster;
                    if (cleanBg && cleanBg !== initialBg) bgToLoad = cleanBg;
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
                    logoImg.src = 'https://image.tmdb.org/t/p/' + getSet('ydesign_logo_quality') + extData.logo;
                    logoContainer.appendChild(logoImg);
                } else {
                    titleText.classList.remove('ydesign-fallback-text'); 
                }
                logoContainer.appendChild(titleText);
                contentLayer.appendChild(logoContainer);

                var addTitleWrap = null;
                if (getSet('ydesign_show_add_title')) {
                    addTitleWrap = document.createElement('div');
                    addTitleWrap.className = 'ydesign-add-title';
                    contentLayer.appendChild(addTitleWrap);
                }

                var updateAddTitleWrap = function() {
                    if (!addTitleWrap) return;
                    if (!extData.logo) { addTitleWrap.innerText = ' '; return; }
                    var uTitle = '';
                    var addTitleLang = getSet('ydesign_add_title_lang');
                    var ukT = extData.title_uk || mainTitle;
                    var enT = extData.title_en || data.original_title || data.original_name;

                    if (addTitleLang === 'uk') {
                        uTitle = ukT;
                    } else if (addTitleLang === 'en') {
                        uTitle = enT;
                    } else {
                        if (extData.logo_lang === 'en') uTitle = ukT;
                        else if (extData.logo_lang === 'uk' || extData.logo_lang === 'ru') uTitle = enT;
                        else uTitle = ukT;
                    }

                    if (uTitle) {
                        var fTitle = '"' + uTitle + '"';
                        if (fTitle.length > 30) fTitle = fTitle.substring(0, 30) + '...';
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
                    if(year && year !== 'unde') badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-year">' + year + '</span>';
                }
                
                if (type === 'tv' && extData.se_str) {
                    badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-seasons">' + extData.se_str + '</span>';
                } else if (type === 'tv' && extData.seasons) {
                    var str = 'S:' + extData.seasons + (extData.episodes ? ' E:' + extData.episodes : '');
                    badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-seasons">' + str + '</span>';
                }

                if (extData.age) badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-age">' + extData.age + '</span>';
                
                if (badgesWrap.innerHTML !== '') infoWrap.appendChild(badgesWrap);

                checkUaVoiceover(data.id, type).then(function(hasUa) {
                    if (hasUa) {
                        var uaBadge = document.createElement('span');
                        uaBadge.className = 'ydesign-badge ydesign-badge-ua';
                        uaBadge.innerText = 'UA';
                        badgesWrap.appendChild(uaBadge);
                        if (badgesWrap.parentNode !== infoWrap) infoWrap.insertBefore(badgesWrap, infoWrap.firstChild);
                    }
                });

                var genresWrap = null;
                if (getSet('ydesign_show_genres')) {
                    genresWrap = document.createElement('div');
                    genresWrap.className = 'ydesign-genres';
                    if (extData.genres && extData.genres.length) {
                        extData.genres.forEach(g => {
                            var gb = document.createElement('span');
                            gb.className = 'ydesign-genre-badge';
                            gb.innerText = g.name;
                            genresWrap.appendChild(gb);
                        });
                    } else {
                        genresWrap.innerText = ' ';
                    }
                }

                var ratingsWrap = document.createElement('div');
                ratingsWrap.className = 'ydesign-ratings';
                
                renderRatingsAsync(ratingsWrap, data, extData, null); 
                fetchExternalRatings(data.id, type).then(function(extRatings) {
                    if (extRatings && Object.keys(extRatings).length > 0) {
                        renderRatingsAsync(ratingsWrap, data, extData, extRatings);
                    }
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

                var slogan = null;
                if (getSet('ydesign_show_slogan')) {
                    slogan = document.createElement('div');
                    slogan.className = 'ydesign-slogan ydesign-slogan-text';
                    var sText = extData.tagline || ' ';
                    if (!isHorz && sText.trim() !== '' && sText.length > 46) {
                        sText = sText.substring(0, 44) + '...';
                    }
                    slogan.innerText = sText;
                    contentLayer.appendChild(slogan);
                }

                var desc = null;
                if (isHorz && getSet('ydesign_show_desc_horz')) {
                    desc = document.createElement('div');
                    desc.className = 'ydesign-desc-under';
                    desc.innerText = extData.overview ? extData.overview : ' '; 
                    el.appendChild(desc);
                }

                var oldPosterTitle = el.querySelector('.ydesign-poster-title-under');
                if (oldPosterTitle) oldPosterTitle.remove();
                var posterTitleEl = document.createElement('div');
                posterTitleEl.className = 'ydesign-poster-title-under';
                var pTitleLang = getSet('ydesign_poster_title_lang');
                var pTitle = mainTitle;
                if (pTitleLang === 'en') pTitle = extData.title_en || data.original_title || data.original_name || mainTitle;
                else if (pTitleLang === 'uk') pTitle = extData.title_uk || mainTitle;
                posterTitleEl.innerText = pTitle;
                el.appendChild(posterTitleEl);
            });
        };

        if (getSet('ydesign_lazy_load')) {
            LazyLoader.add(el, buildExtendedCard);
        } else {
            buildExtendedCard();
        }
    }

    function injectCSS() {
        var style = document.createElement('style');
        style.innerHTML = `
            .ydesign-active .card .card__title,
            .ydesign-active .card .card__age,
            .ydesign-active .card .card__vote { display: none !important; }

            .ydesign-active .items-line .items-cards,
            .ydesign-active .items-line .scroll__body {
                display: flex; flex-wrap: nowrap; 
                gap: var(--ydesign-card-gap, 0.8em); 
                padding-bottom: 1.5em; 
            }

            .ydesign-active .card {
                position: relative; overflow: visible;
                background-color: transparent !important;
                border: none !important; 
                transition: transform 0.08s ease;
                flex: 0 0 auto; cursor: pointer;
                will-change: transform;
            }

            .ydesign-active .card.focus {
                transform: scale(1.05); 
                z-index: 10;
            }

            /* базовый фокус — перезаписывается динамическим тегом ydesign-border-dyn */
            .ydesign-active .card.focus .card__view {
                box-shadow: 0 0 0 0.25em #ffffff, 0 12px 30px rgba(0,0,0,0.9) !important;
            }

            .ydesign-active .card .card__view {
                position: relative; top: 0; left: 0; right: 0; bottom: 0;
                width: 100%; height: 0 !important;
                border-radius: 0.8em !important;
                background-color: #0d0d0d; overflow: hidden;
                box-shadow: 0 0 0 0.25em transparent;
                transition: box-shadow 0s, transform 0.08s ease;
                transform: translateZ(0);
            }

            /* ── Тёмный фон бейджей для читаемости на светлых постерах ── */
            body.ydesign-dark-badge-bg .ydesign-badge,
            body.ydesign-dark-badge-bg .ydesign-genre-badge {
                background: rgba(0,0,0,0.58) !important;
            }
            body.ydesign-dark-badge-bg .ydesign-rating {
                background: rgba(0,0,0,0.58) !important;
                padding: 0 0.4em !important;
            }
            body.ydesign-dark-badge-bg.ydesign-border-ratings .ydesign-rating {
                background: rgba(0,0,0,0.58) !important;
            }

            .ydesign-active .card.ydesign-vertical .card__view { padding-bottom: 177.77% !important; } 
            .ydesign-active .card.ydesign-horizontal .card__view { padding-bottom: 68.75% !important; } 

            @media (min-width: 769px) {
                .ydesign-active .card.ydesign-vertical { width: calc(100% / var(--ydesign-grid-items-v, 5)); height: auto !important; }   
                .ydesign-active .card.ydesign-horizontal { width: calc(100% / var(--ydesign-grid-items-h, 3)); height: auto !important; } 
                .ydesign-active .items-line .card.ydesign-vertical { width: 18.5vw; }   
                .ydesign-active .items-line .card.ydesign-horizontal { width: 31.5vw; } 
            }

            @media (max-width: 768px) {
                .ydesign-active .card.ydesign-vertical { width: calc(100% / 2); height: auto !important; }    
                .ydesign-active .card.ydesign-horizontal { width: calc(100% / 2); height: auto !important; }  
                .ydesign-active .items-line .card.ydesign-vertical { width: 46vw; }    
                .ydesign-active .items-line .card.ydesign-horizontal { width: 94vw; }  
            }

            .ydesign-img-layer {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background-color: #222;
                background-image: url('./img/img_load.svg');
                background-size: cover !important; 
                background-repeat: no-repeat; 
                background-position: center center;
                opacity: 1; transition: background-image 0.4s ease, background-size 0.4s ease;
            }
            .ydesign-img-layer.loaded { 
                background-position: center 20%;
                background-color: transparent;
                filter: saturate(1.35) contrast(1.08) brightness(1.04);
            }
            .ydesign-horizontal .ydesign-img-layer.loaded { background-position: center center; filter: saturate(1.35) contrast(1.08) brightness(1.04); }

            .ydesign-gradient-layer {
                position: absolute; bottom: 0; left: 0; width: 100%; height: 45%;
                pointer-events: none;
            }

            /* ── Apple TV–style тип-пилюля ── */
            .ydesign-type-pill {
                position: absolute;
                top: auto; right: auto; bottom: auto; left: auto;
                z-index: 6;
                pointer-events: none;
                background: rgba(20,20,20,0.62);
                color: rgba(255,255,255,0.92);
                font-size: var(--ydesign-type-pill-size, 0.60em);
                font-weight: 700;
                letter-spacing: 0.06em;
                padding: 0.3em 0.75em;
                border-radius: 50em;
                border: 1px solid rgba(255,255,255,0.18);
                text-transform: uppercase;
                line-height: 1.2;
                box-shadow: 0 1px 6px rgba(0,0,0,0.45);
            }
            /* Углы пилюли */
            body[data-ydesign-type-corner='top-right']    .ydesign-type-pill { top: 0.45em; right: 0.45em; }
            body[data-ydesign-type-corner='top-left']     .ydesign-type-pill { top: 0.45em; left: 0.45em; }
            body[data-ydesign-type-corner='bottom-right'] .ydesign-type-pill { bottom: 0.45em; right: 0.45em; }
            body[data-ydesign-type-corner='bottom-left']  .ydesign-type-pill { bottom: 0.45em; left: 0.45em; }
            body.ydesign-hide-type-label .ydesign-type-pill { display: none !important; }

            .ydesign-content-layer {
                position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
                display: flex; flex-direction: column; justify-content: flex-end; align-items: stretch;
                padding: 1.2em 0.8em var(--ydesign-content-pb, 0.8em) 0.8em;
                box-sizing: border-box;
                z-index: 2; pointer-events: none;
            }

            /* Позиция лого/названия для горизонтальных карточек */
            .ydesign-horizontal .ydesign-content-layer {
                justify-content: var(--ydesign-content-justify-horz, flex-end);
                transform: translateY(var(--ydesign-content-shift-horz, 0%));
            }

            /* Скрыть блок рейтингов на постерах */
            body.ydesign-hide-ratings .ydesign-ratings {
                display: none !important;
            }

            .ydesign-logo-container {
                display: flex; align-items: flex-end;
                margin-bottom: var(--ydesign-logo-mb, 1.2em); 
                width: 100%; 
                height: var(--ydesign-logo-h, 35%);
                max-height: var(--ydesign-logo-h, 35%); 
                flex-shrink: 0; 
                justify-content: var(--ydesign-align-logo, center);
                position: relative;
                z-index: 10;
            }
            .ydesign-logo-container img {
                max-width: var(--ydesign-logo-w, 80%);
                max-height: 100%;
                height: auto; width: auto;
                object-fit: contain; object-position: bottom var(--ydesign-text-logo, center);
                filter: drop-shadow(0 2px 5px rgba(0,0,0,0.8));
            }
            .ydesign-text-title {
                width: var(--ydesign-logo-w, 100%);
                max-height: 100%;
                display: flex; align-items: flex-end; justify-content: var(--ydesign-align-logo, center);
                font-size: calc(var(--ydesign-title-size-val, 1.2) * 1em) !important; font-weight: 800; color: #fff; 
                text-align: var(--ydesign-text-logo, center); 
                text-shadow: 0 2px 4px rgba(0,0,0,0.9);
                line-height: 1.25; 
                padding-bottom: 0.15em; 
            }

            .ydesign-add-title {
                width: 100%;
                --ydesign-add-title-size-eff: var(--ydesign-add-title-size-val, 0.9);
                font-size: calc(var(--ydesign-add-title-size-eff) * 1em) !important;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 600; font-style: italic;
                text-align: var(--ydesign-align-logo, center);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-height: calc(var(--ydesign-add-title-size-eff) * 1.3em);
                margin-bottom: var(--ydesign-add-title-mb, 0.3em);
                text-shadow: 0 1px 3px rgba(0,0,0,0.9);
            }

            .ydesign-info-wrap {
                display: flex; width: 100%; overflow: hidden;
            }

            /* --- СУПЕР ЖОРСТКА БЛОКОВКА ВИСОТИ ТА ОБРІЗАННЯ --- */
            .ydesign-horizontal .ydesign-info-wrap,
            .ydesign-horizontal .ydesign-info-wrap-2,
            body.ydesign-badges-one-row .ydesign-vertical .ydesign-info-wrap {
                display: flex; flex-direction: row; flex-wrap: wrap;
                align-content: flex-start !important;
                align-items: flex-start !important;
                justify-content: var(--ydesign-align-badges, center);
                column-gap: var(--ydesign-badges-gap-h, 0.15em) !important;
                
                height: 1.95em !important;
                max-height: 1.95em !important;
                min-height: 1.95em !important;
                
                padding-top: 0.15em !important;
                padding-bottom: 0 !important;
                padding-left: 0.2em !important;
                padding-right: 0.2em !important;
                
                margin-left: -0.2em !important;
                margin-right: -0.2em !important;
                
                overflow: hidden !important;
                clip-path: none !important;
                transform: translateZ(0);
            }
            .ydesign-horizontal .ydesign-info-wrap-2 {
                margin-top: var(--ydesign-badge-rows-gap, 0.4em);
            }

            .ydesign-vertical .ydesign-info-wrap {
                flex-direction: column;
                align-items: var(--ydesign-align-badges, center) !important;
                height: auto !important; 
                max-height: none !important;
                overflow: visible !important;
                clip-path: none !important;
                transform: none !important;
                gap: var(--ydesign-badge-rows-gap, 0.4em);
            }

            .ydesign-vertical .ydesign-badges, 
            .ydesign-vertical .ydesign-ratings, 
            .ydesign-vertical .ydesign-genres {
                display: flex; 
                flex-wrap: wrap; 
                align-content: flex-start !important;
                align-items: flex-start !important;
                column-gap: var(--ydesign-badges-gap-v, 0.15em) !important; 
                justify-content: var(--ydesign-align-badges, center);
                width: 100% !important; 
                
                height: 1.95em !important;
                max-height: 1.95em !important;
                min-height: 1.95em !important;
                
                padding-top: 0.15em !important;
                padding-bottom: 0 !important;
                padding-left: 0.2em !important;
                padding-right: 0.2em !important;
                
                margin-left: -0.2em !important;
                margin-right: -0.2em !important;
                
                overflow: hidden !important; 
                clip-path: none !important;
                transform: translateZ(0);
            }

            body.ydesign-badges-one-row .ydesign-vertical .ydesign-genres,
            body.ydesign-badges-one-row .ydesign-vertical .ydesign-badges,
            body.ydesign-badges-one-row .ydesign-vertical .ydesign-ratings,
            .ydesign-horizontal .ydesign-badges,
            .ydesign-horizontal .ydesign-ratings { 
                display: flex;
                flex-wrap: nowrap; 
                width: auto !important; 
                height: 1.65em !important; 
                margin: 0; padding: 0; flex-shrink: 0; 
                column-gap: var(--ydesign-badges-gap-h, 0.15em) !important; 
                overflow: visible !important;
                margin-bottom: 100px !important; /* Магія: якщо цей блок переноситься, він падає на 100px вниз */
            }

            .ydesign-horizontal .ydesign-genres {
                display: flex; 
                flex-wrap: wrap; 
                align-content: flex-start !important;
                align-items: flex-start !important;
                column-gap: var(--ydesign-badges-gap-h, 0.15em) !important; 
                width: 100% !important; 
                justify-content: var(--ydesign-align-badges, center);
                
                height: 1.95em !important;
                max-height: 1.95em !important;
                min-height: 1.95em !important;
                
                padding-top: 0.15em !important;
                padding-bottom: 0 !important;
                padding-left: 0.2em !important;
                padding-right: 0.2em !important;
                
                margin-left: -0.2em !important;
                margin-right: -0.2em !important;
                
                overflow: hidden !important; 
                clip-path: none !important;
                transform: translateZ(0);
            }

            /* Контроль шрифтів */
            .ydesign-badges {
                --ydesign-badge-size-eff: var(--ydesign-badge-size-val, 0.75);
                font-size: calc(var(--ydesign-badge-size-eff) * 1em) !important;
            }
            .ydesign-ratings {
                --ydesign-rating-size-eff: var(--ydesign-rating-size-val, 0.8);
                font-size: calc(var(--ydesign-rating-size-eff) * 1em) !important;
            }
            .ydesign-genres {
                --ydesign-genres-size-eff: var(--ydesign-genres-size-val, 0.75);
                font-size: calc(var(--ydesign-genres-size-eff) * 1em) !important;
                margin-top: var(--ydesign-genres-gap, 0.15em);
                margin-bottom: var(--ydesign-genres-gap, 0.15em);
            }

            /* --- ІДЕАЛЬНА ВИСОТА БЕЙДЖІВ ТА ЦЕНТРУВАННЯ --- */
            .ydesign-badge, .ydesign-genre-badge, .ydesign-rating {
                display: inline-flex !important; 
                align-items: center !important; 
                justify-content: center !important;
                
                height: 1.65em !important; 
                min-height: 1.65em !important;
                max-height: 1.65em !important;
                
                padding: 0 0.4em !important; 
                box-sizing: border-box !important; 
                text-shadow: 0 1px 3px rgba(0,0,0,0.9) !important;
                white-space: nowrap !important;
                flex-shrink: 0 !important; 
                
                line-height: 1 !important; 
                vertical-align: top !important;
                border-radius: 0.25em !important; 
                
                /* Магія 2: якщо окремий бейдж переноситься (наприклад у жанрах), він падає на 100px вниз! */
                margin-bottom: 100px !important; 
            }

            .ydesign-badge, .ydesign-genre-badge {
                border: 1px solid rgba(255,255,255,0.6) !important;
                background: transparent !important; 
            }

            .ydesign-badge {
                font-size: 1em !important; 
                font-weight: 700 !important; color: #fff !important;
            }

            .ydesign-genre-badge {
                font-size: 1em !important; 
                font-weight: 600 !important; color: rgba(255,255,255,0.95) !important;
                border-color: rgba(255,255,255,0.4) !important;
            }
            
            .ydesign-rating {
                gap: 0.25em !important;
                font-size: 1em !important; font-weight: 700 !important; color: #fff !important;
                border: 1px solid transparent !important; 
                padding: 0 !important; 
            }

            .ydesign-rating img {
                width: 1.1em !important; 
                height: 1.1em !important; 
                object-fit: contain !important; 
                display: block !important; 
                filter: saturate(var(--ydesign-ratings-saturate, 100%)) drop-shadow(0 1px 2px rgba(0,0,0,0.8)); 
            }

            body.ydesign-border-ratings .ydesign-rating {
                border-color: rgba(255,255,255,0.6) !important;
                padding: 0 0.4em !important; 
                background: transparent !important;
            }

            /* --- УСІ БЕЙДЖІ ОДНОГО РОЗМІРУ --- */
            body.ydesign-uniform-badges .ydesign-ratings {
                --ydesign-rating-size-eff: var(--ydesign-badge-size-val, 0.75) !important;
            }
            body.ydesign-uniform-badges .ydesign-genres {
                --ydesign-genres-size-eff: var(--ydesign-badge-size-val, 0.75) !important;
            }
            body.ydesign-uniform-badges .ydesign-genre-badge {
                font-weight: 700 !important;
            }
            body.ydesign-uniform-badges .ydesign-rating img {
                width: 1.15em !important; 
                height: 1.15em !important;
            }

            /* --- УСІ ВЕРТИКАЛЬНІ ВІДСТУПИ ОДНАКОВІ (МАТЕМАТИЧНО ВИРІВНЯНИЙ РЕЖИМ) --- */
            body.ydesign-uniform-v-gaps-v .ydesign-vertical .ydesign-add-title,
            body.ydesign-uniform-v-gaps-v .ydesign-vertical .ydesign-info-wrap,
            body.ydesign-uniform-v-gaps-v .ydesign-vertical .ydesign-genres,
            body.ydesign-uniform-v-gaps-v .ydesign-vertical .ydesign-slogan {
                margin-top: 0 !important;
                margin-bottom: 0 !important;
            }
            body.ydesign-uniform-v-gaps-v:not(.ydesign-badges-one-row) .ydesign-vertical .ydesign-info-wrap {
                gap: 0 !important;
                row-gap: 0 !important;
            }
            body.ydesign-uniform-v-gaps-v .ydesign-vertical .ydesign-info-wrap > * {
                margin-top: 0 !important;
                margin-bottom: 0 !important;
            }

            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-add-title,
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-info-wrap,
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-info-wrap-2,
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-genres,
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-slogan {
                margin-top: 0 !important;
                margin-bottom: 0 !important;
            }

            body.ydesign-uniform-v-gaps-v .ydesign-vertical .ydesign-content-layer > *:not(.ydesign-logo-container) + * {
                margin-top: var(--ydesign-uniform-v-gap-v, 0.05em) !important;
            }
            body.ydesign-uniform-v-gaps-v .ydesign-vertical .ydesign-add-title {
                margin-top: calc(var(--ydesign-uniform-v-gap-v) / var(--ydesign-add-title-size-eff, 0.9)) !important;
            }
            body.ydesign-uniform-v-gaps-v .ydesign-vertical .ydesign-add-title + .ydesign-info-wrap {
                margin-top: calc(var(--ydesign-uniform-v-gap-v) / var(--ydesign-badge-size-eff, 0.75)) !important;
            }
            body.ydesign-uniform-v-gaps-v .ydesign-vertical .ydesign-add-title + .ydesign-genres {
                margin-top: calc(var(--ydesign-uniform-v-gap-v) / var(--ydesign-genres-size-eff, 0.75)) !important;
            }
            body.ydesign-uniform-v-gaps-v .ydesign-vertical .ydesign-add-title + .ydesign-slogan {
                margin-top: calc(var(--ydesign-uniform-v-gap-v) / var(--ydesign-slogan-size-eff, 0.85)) !important;
            }
            body.ydesign-uniform-v-gaps-v:not(.ydesign-badges-one-row) .ydesign-vertical .ydesign-info-wrap > .ydesign-badges + .ydesign-genres {
                margin-top: calc(var(--ydesign-uniform-v-gap-v) / var(--ydesign-genres-size-eff, 0.75)) !important;
            }
            body.ydesign-uniform-v-gaps-v:not(.ydesign-badges-one-row) .ydesign-vertical .ydesign-info-wrap > .ydesign-genres + .ydesign-ratings {
                margin-top: calc(var(--ydesign-uniform-v-gap-v) / var(--ydesign-rating-size-eff, 0.8)) !important;
            }
            body.ydesign-uniform-v-gaps-v:not(.ydesign-badges-one-row) .ydesign-vertical .ydesign-info-wrap > .ydesign-badges + .ydesign-ratings {
                margin-top: calc(var(--ydesign-uniform-v-gap-v) / var(--ydesign-rating-size-eff, 0.8)) !important;
            }
            body.ydesign-uniform-v-gaps-v .ydesign-vertical .ydesign-info-wrap + .ydesign-slogan {
                margin-top: calc(var(--ydesign-uniform-v-gap-v) / var(--ydesign-slogan-size-eff, 0.85)) !important;
            }

            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-content-layer > *:not(.ydesign-logo-container) + * {
                margin-top: var(--ydesign-uniform-v-gap-h, 0.30em) !important;
            }
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-add-title {
                margin-top: calc(var(--ydesign-uniform-v-gap-h) / var(--ydesign-add-title-size-eff, 0.9)) !important;
            }
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-add-title + .ydesign-info-wrap {
                margin-top: calc(var(--ydesign-uniform-v-gap-h) / var(--ydesign-badge-size-eff, 0.75)) !important;
            }
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-info-wrap + .ydesign-info-wrap-2 {
                margin-top: calc(var(--ydesign-uniform-v-gap-h) / var(--ydesign-rating-size-eff, 0.8)) !important;
            }
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-info-wrap + .ydesign-genres {
                margin-top: calc(var(--ydesign-uniform-v-gap-h) / var(--ydesign-genres-size-eff, 0.75)) !important;
            }
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-info-wrap-2 + .ydesign-genres {
                margin-top: calc(var(--ydesign-uniform-v-gap-h) / var(--ydesign-genres-size-eff, 0.75)) !important;
            }
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-genres + .ydesign-slogan {
                margin-top: calc(var(--ydesign-uniform-v-gap-h) / var(--ydesign-slogan-size-eff, 0.85)) !important;
            }
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-info-wrap + .ydesign-slogan {
                margin-top: calc(var(--ydesign-uniform-v-gap-h) / var(--ydesign-slogan-size-eff, 0.85)) !important;
            }
            body.ydesign-uniform-v-gaps-h .ydesign-horizontal .ydesign-info-wrap-2 + .ydesign-slogan {
                margin-top: calc(var(--ydesign-uniform-v-gap-h) / var(--ydesign-slogan-size-eff, 0.85)) !important;
            }

            .ydesign-slogan {
                width: 100%;
                --ydesign-slogan-size-eff: var(--ydesign-slogan-size-val, 0.85);
                font-size: calc(var(--ydesign-slogan-size-eff) * 1em) !important; color: #fff;
                text-align: var(--ydesign-text-slogan, center); 
                margin-top: var(--ydesign-slogan-padding, 0.3em); 
                line-height: 1.4; font-weight: 500;
                text-shadow: 0 2px 4px rgba(0,0,0,0.9);
                display: block; 
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-height: calc(var(--ydesign-slogan-size-eff) * 1.4em);
                padding-bottom: 0.1em; 
            }

            .ydesign-desc-under {
                position: relative;
                z-index: 10;
                width: 100%;
                font-size: calc(var(--ydesign-desc-size-val, 0.85) * 1em) !important;
                color: rgba(255,255,255,0.75);
                margin-top: 0.5em;
                text-align: left;
                line-height: 1.35;
                text-shadow: 0 1px 3px rgba(0,0,0,0.8);
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                height: calc(1.35em * 3) !important; 
            }

            body.ydesign-hide-year .ydesign-badge-year { display: none !important; }
            body.ydesign-hide-seasons .ydesign-badge-seasons { display: none !important; }
            body.ydesign-hide-ua .ydesign-badge-ua { display: none !important; }
            body.ydesign-hide-age .ydesign-badge-age { display: none !important; }
            body.ydesign-hide-slogan .ydesign-slogan-text { display: none !important; }

            .ydesign-poster-title-under {
                position: relative;
                z-index: 10;
                width: 100%;
                font-size: calc(var(--ydesign-poster-title-size-val, 0.85) * 1em) !important;
                color: rgba(255,255,255,0.95);
                margin-top: 0.4em;
                text-align: center;
                line-height: 1.3;
                text-shadow: 0 1px 3px rgba(0,0,0,0.8);
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            body.ydesign-hide-poster-title .ydesign-poster-title-under { display: none !important; }

            body[data-ydesign-logo="text"] .ydesign-logo-img { display: none !important; }
            body[data-ydesign-logo="text"] .ydesign-fallback-text { display: flex !important; }
            body[data-ydesign-logo="logo"] .ydesign-fallback-text { display: none !important; }

            /* ========================================================
               СТИЛІ ДЛЯ СЕРІЙ (HISTORY & PRESTIGE REDESIGN)
               Активуються класом .ydesign-series-active на body 
               ======================================================== */
            .ydesign-series-active .online-prestige--full {
                -webkit-animation: prestigeFadeIn 0.3s ease;
                animation: prestigeFadeIn 0.3s ease;
            }

            @-webkit-keyframes prestigeFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes prestigeFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .ydesign-series-active .online-prestige.online-prestige--full {
                display: inline-block !important;
                vertical-align: top !important;
                margin: 10px !important;
                position: relative !important;
                height: auto !important;
                border-radius: 12px !important;
                overflow: hidden !important;
                background-color: #1a1a1a !important;
                box-sizing: border-box !important;
                transition: transform 0.2s ease, box-shadow 0.2s ease !important;
                border: none !important;
                outline: none !important;
                box-shadow: 0 0 0 2px transparent !important;
                width: calc(50% - 20px) !important; 
                width: calc(var(--ydesign-series-width, 50%) - 20px) !important;
            }

            .ydesign-series-active .online-prestige.online-prestige--full::before {
                content: "";
                display: block !important;
                padding-top: 56.25% !important; 
            }

            .ydesign-series-active .online-prestige.online-prestige--full.focus {
                transform: scale(1.03) !important;
                box-shadow: 0 0 0 3px #fff, 0 10px 25px rgba(0,0,0,0.8) !important;
                border: none !important;
                outline: none !important;
                z-index: 10 !important;
            }

            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__img {
                position: absolute !important;
                top: 0 !important; left: 0 !important;
                width: 100% !important; height: 100% !important;
                z-index: 1 !important; border-radius: 0 !important;
            }
            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__img img {
                width: 100% !important; height: 100% !important; object-fit: cover !important;
            }

            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__body {
                position: absolute !important; top: 0 !important; bottom: 0 !important; left: 0 !important; right: 0 !important;
                z-index: 3 !important; display: flex !important; flex-direction: column !important;
                justify-content: flex-end !important; background: transparent !important;
                padding-bottom: calc(1em + 5px) !important;
            }

            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__head,
            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__footer {
                padding: 0 15px !important; position: relative !important; z-index: 4 !important;
            }
            
            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__head {
                order: 2 !important; 
                padding-right: 55px !important; 
                margin-bottom: 0 !important;
            }
            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__footer {
                order: 1 !important;
                margin-bottom: 4px !important;
            }

            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__title {
                font-size: 1.05em !important; line-height: 1.2 !important;
                white-space: normal !important; display: -webkit-box !important;
                -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important;
                overflow: hidden !important; text-overflow: ellipsis !important;
                margin-bottom: 0 !important; text-shadow: 1px 1px 3px #000 !important;
            }

            .ydesign-series-active .online-prestige .online-prestige__info {
                display: flex !important; flex-direction: column !important;
                align-items: flex-start !important; gap: 4px !important;
            }
            .ydesign-series-active .online-prestige .online-prestige__info > span {
                display: block !important; margin: 0 0 4px 0 !important;
                font-size: 0.9em !important; line-height: 1.1 !important;
                color: #ddd !important; text-shadow: 1px 1px 2px #000 !important;
            }
            .ydesign-series-active .online-prestige .online-prestige__info > span:last-child {
                margin-bottom: 0 !important;
            }

            .ydesign-series-active .online-prestige .right-top-badges {
                position: absolute !important; top: 10px !important; right: 15px !important;
                z-index: 15 !important; display: flex !important; flex-direction: column !important;
                align-items: flex-end !important; gap: 6px !important;
            }

            .ydesign-series-active .online-prestige .right-top-badges > span,
            .ydesign-series-active .online-prestige .right-top-badges .online-prestige__quality {
                background: transparent !important; padding: 0 !important;
                border-radius: 0 !important; box-shadow: none !important; border: none !important;
                font-size: 0.85em !important; 
                font-weight: 500 !important; 
                color: #fff !important; margin: 0 0 6px 0 !important;
                display: flex !important; align-items: center !important; gap: 5px !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.9), 0 0 5px rgba(0,0,0,0.6) !important; 
                line-height: 1 !important;
            }
            .ydesign-series-active .online-prestige .right-top-badges > *:last-child {
                margin-bottom: 0 !important;
            }
            .ydesign-series-active .online-prestige .right-top-badges svg {
                display: none !important;
            }

            .ydesign-series-active .online-prestige.online-prestige--full > .online-prestige__time {
                position: absolute !important; right: 15px !important;
                bottom: calc(1em + 5px) !important; 
                z-index: 10 !important;
                font-size: 0.85em !important; 
                font-weight: 500 !important;
                background: transparent !important; padding: 0 !important;
                border-radius: 0 !important; margin: 0 !important; box-shadow: none !important; border: none !important;
                color: #fff !important;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.9), 0 0 5px rgba(0,0,0,0.6) !important;
            }

            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__timeline {
                position: absolute !important; bottom: 0 !important; left: 0 !important; right: 0 !important;
                width: 100% !important; height: 1.15em !important; margin: 0 !important;
                z-index: 5 !important; background: rgba(0,0,0,0.6) !important; border-radius: 0 !important;
            }

            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__timeline::after {
                content: attr(data-percent); 
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                display: flex; align-items: center; justify-content: center;
                font-size: 0.85em; font-weight: 700; color: #ffffff; 
                text-shadow: 0 1px 2px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.7);
                z-index: 10; pointer-events: none;
            }
            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__timeline .time-line {
                width: 100% !important; height: 100% !important; background: transparent !important; margin: 0 !important; border-radius: 0 !important;
            }
            .ydesign-series-active .online-prestige.online-prestige--full .online-prestige__timeline .time-line > div {
                height: 100% !important; border-radius: 0 !important; background-color: #e50914 !important; transition: width 0.3s ease !important;
            }

            /* ========================================================
               ПРИХОВУВАННЯ ЛІВОЇ КОЛОНКИ
               ======================================================== */
            body.ydesign-hide-left-column .explorer.ydesign-has-series .explorer__left {
                display: none !important;
            }
            body.ydesign-hide-left-column .explorer.ydesign-has-series .explorer__files {
                width: 100% !important;
                flex: 1 1 100% !important;
                max-width: 100% !important;
                padding-left: 0 !important;
            }

             /* Расширенные настройки бейджей из YDesign */
             .ydesign-vertical { --ydesign-align-badges: var(--ydesign-v-align-badges, center); }
             .ydesign-horizontal { --ydesign-align-badges: var(--ydesign-h-align-badges, center); }
             .ydesign-vertical .ydesign-badges { 
                 font-size: calc(var(--ydesign-v-badge-size, 0.8) * 1em) !important;
                 column-gap: var(--ydesign-v-badges-gap, 0.15em) !important;
             }
             .ydesign-horizontal .ydesign-badges { 
                 font-size: calc(var(--ydesign-h-badge-size, 0.8) * 1em) !important;
                 column-gap: var(--ydesign-h-badges-gap, 0.15em) !important;
             }
             .ydesign-vertical .ydesign-ratings { 
                 font-size: calc(var(--ydesign-v-rating-size, 0.8) * 1em) !important;
                 column-gap: var(--ydesign-v-badges-gap, 0.15em) !important;
             }
             .ydesign-horizontal .ydesign-ratings { 
                 font-size: calc(var(--ydesign-h-rating-size, 0.8) * 1em) !important;
                 column-gap: var(--ydesign-h-badges-gap, 0.15em) !important;
             }
             .ydesign-vertical .ydesign-genres { 
                 font-size: calc(var(--ydesign-v-genres-size, 0.8) * 1em) !important;
                 column-gap: var(--ydesign-v-badges-gap, 0.15em) !important;
             }
             .ydesign-horizontal .ydesign-genres { 
                 font-size: calc(var(--ydesign-h-genres-size, 0.8) * 1em) !important;
                 column-gap: var(--ydesign-h-badges-gap, 0.15em) !important;
             }
             .ydesign-vertical .ydesign-badge-year { font-size: calc(var(--ydesign-v-year-size, 0.8) * 1em) !important; }
             .ydesign-vertical .ydesign-badge-age { font-size: calc(var(--ydesign-v-age-size, 0.8) * 1em) !important; }
             .ydesign-vertical .ydesign-badge-seasons { font-size: calc(var(--ydesign-v-seasons-size, 0.8) * 1em) !important; }
             .ydesign-vertical .ydesign-badge-ua { font-size: calc(var(--ydesign-v-ua-size, 0.8) * 1em) !important; }
             .ydesign-horizontal .ydesign-badge-year { font-size: calc(var(--ydesign-h-year-size, 0.8) * 1em) !important; }
             .ydesign-horizontal .ydesign-badge-age { font-size: calc(var(--ydesign-h-age-size, 0.8) * 1em) !important; }
             .ydesign-horizontal .ydesign-badge-seasons { font-size: calc(var(--ydesign-h-seasons-size, 0.8) * 1em) !important; }
             .ydesign-horizontal .ydesign-badge-ua { font-size: calc(var(--ydesign-h-ua-size, 0.8) * 1em) !important; }
             body.ydesign-v-uniform-badges .ydesign-vertical .ydesign-ratings,
             body.ydesign-v-uniform-badges .ydesign-vertical .ydesign-genres,
             body.ydesign-h-uniform-badges .ydesign-horizontal .ydesign-ratings,
             body.ydesign-h-uniform-badges .ydesign-horizontal .ydesign-genres {
                 font-size: inherit !important;
             }
             body.ydesign-v-badges-one-row .ydesign-vertical .ydesign-info-wrap {
                 flex-direction: row !important; flex-wrap: nowrap !important;
                 gap: 0 !important; overflow: visible !important;
             }
             body.ydesign-shape-pill .ydesign-badge,
             body.ydesign-shape-pill .ydesign-genre-badge,
             body.ydesign-shape-pill .ydesign-rating {
                 border-radius: 999px !important;
                 background: rgba(255,255,255,0.16) !important;
                 border: 1px solid rgba(255,255,255,0.62) !important;
                 box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.28) !important;
                 backdrop-filter: blur(10px) saturate(135%) !important;
                 -webkit-backdrop-filter: blur(10px) saturate(135%) !important;
             }
             body.ydesign-shape-rounded .ydesign-badge,
             body.ydesign-shape-rounded .ydesign-genre-badge,
             body.ydesign-shape-rounded .ydesign-rating { border-radius: 0.45em !important; }
             body.ydesign-shape-square .ydesign-badge,
             body.ydesign-shape-square .ydesign-genre-badge,
             body.ydesign-shape-square .ydesign-rating { border-radius: 0.12em !important; }
             body.ydesign-no-border-year .ydesign-badge-year,
             body.ydesign-no-border-age .ydesign-badge-age,
             body.ydesign-no-border-seasons .ydesign-badge-seasons,
             body.ydesign-no-border-ua .ydesign-badge-ua,
             body.ydesign-no-border-genres .ydesign-genre-badge { border-color: transparent !important; }
             body.ydesign-no-color-age .ydesign-badge-age,
             body.ydesign-no-color-ua .ydesign-badge-ua { background: transparent !important; }
             body.ydesign-glass-pill .ydesign-badge,
             body.ydesign-glass-pill .ydesign-genre-badge,
             body.ydesign-glass-pill .ydesign-rating {
                 background: rgba(255,255,255,0.14) !important;
                 backdrop-filter: blur(8px) !important;
                 -webkit-backdrop-filter: blur(8px) !important;
             }
             .ydesign-vertical .ydesign-info-wrap { row-gap: var(--ydesign-v-badge-rows-gap, 0.3em) !important; }
             .ydesign-horizontal .ydesign-info-wrap-2 { margin-top: var(--ydesign-h-badge-rows-gap, 0.3em) !important; }
        `;
        document.head.appendChild(style);
    }

    function getFlexAlign(val) {
        if (val === 'left') return 'flex-start';
        if (val === 'right') return 'flex-end';
        return 'center';
    }

    // Динамические стили рамки/фокуса: инжектируются ПОСЛЕ основного тега,
    // поэтому всегда перебивают статические !important правила.
    function updateBorderStyles() {
        var el = document.getElementById('ydesign-border-dyn');
        if (!el) {
            el = document.createElement('style');
            el.id = 'ydesign-border-dyn';
            document.head.appendChild(el);
        }

        var fc  = getSet('ydesign_focus_color')         || '#ffffff';
        var fw  = parseFloat(getSet('ydesign_focus_width'))  || 0.25;
        var bc  = getSet('ydesign_card_border_color')   || '#2b7fff';
        var bw  = parseFloat(getSet('ydesign_card_border_width')) || 0.20;
        var hasBorder = getSet('ydesign_card_border');

        var css = '';

        // Фокус-рамка — перебивает белый дефолт
        css += '.ydesign-active .card.focus .card__view {'
             + 'box-shadow:0 0 0 ' + fw + 'em ' + fc + ',0 12px 30px rgba(0,0,0,.9) !important;'
             + '}\n';

        if (hasBorder) {
            // Постоянная рамка на всех карточках
            css += 'body.ydesign-card-border .ydesign-active .card .card__view {'
                 + 'box-shadow:0 0 0 ' + bw + 'em ' + bc + ' !important;'
                 + '}\n';
            // Фокус при включённой рамке — цвет рамки + тень
            css += 'body.ydesign-card-border .ydesign-active .card.focus .card__view {'
                 + 'box-shadow:0 0 0 ' + bw + 'em ' + bc + ',0 12px 30px rgba(0,0,0,.9) !important;'
                 + '}\n';
        }

        el.textContent = css;
    }

    function applyDynamicCSS() {
        document.body.classList.add('ydesign-active');
        document.body.classList.toggle('ydesign-series-active', getSet('ydesign_series_redesign'));
        document.body.classList.toggle('ydesign-uniform-badges', getSet('ydesign_uniform_badges'));
        document.body.classList.toggle('ydesign-v-uniform-badges', getSet('ydesign_v_uniform_badges', 'ydesign_uniform_badges'));
        document.body.classList.toggle('ydesign-h-uniform-badges', getSet('ydesign_h_uniform_badges', 'ydesign_uniform_badges'));
        document.body.classList.toggle('ydesign-uniform-v-gaps-v', getSet('ydesign_uniform_v_gaps_vert'));
        document.body.classList.toggle('ydesign-uniform-v-gaps-h', getSet('ydesign_uniform_v_gaps_horz'));
        document.body.classList.toggle('ydesign-hide-left-column', getSet('ydesign_hide_left_column')); 

        // Бейджи оформляются в едином стиле Apple TV — только «пилюля».
        var badgeShape = 'pill';
        document.body.classList.remove('ydesign-shape-pill', 'ydesign-shape-rounded', 'ydesign-shape-square');
        document.body.classList.add('ydesign-shape-' + (badgeShape || 'pill'));
        document.body.classList.toggle('ydesign-no-border-year', !getSet('ydesign_border_year'));
        document.body.classList.toggle('ydesign-no-border-age', !getSet('ydesign_border_age'));
        document.body.classList.toggle('ydesign-no-border-seasons', !getSet('ydesign_border_seasons'));
        document.body.classList.toggle('ydesign-no-border-ua', !getSet('ydesign_border_ua'));
        document.body.classList.toggle('ydesign-no-border-genres', !getSet('ydesign_border_genres'));
        document.body.classList.toggle('ydesign-no-color-age', !getSet('ydesign_color_age'));
        document.body.classList.toggle('ydesign-no-color-ua', !getSet('ydesign_color_ua'));
        document.body.classList.toggle('ydesign-glass-pill', getSet('ydesign_glass_pill_bg'));

        var seriesCards = parseInt(getSet('ydesign_series_cards')) || 2;
        var seriesWidth = (100 / seriesCards) + '%';
        document.documentElement.style.setProperty('--ydesign-series-width', seriesWidth);

        document.documentElement.style.setProperty('--ydesign-grid-items-v', getSet('ydesign_grid_items_v'));
        document.documentElement.style.setProperty('--ydesign-grid-items-h', getSet('ydesign_grid_items_h'));

        document.documentElement.style.setProperty('--ydesign-logo-h', getSet('ydesign_logo_max_h') + '%');
        document.documentElement.style.setProperty('--ydesign-logo-w', getSet('ydesign_logo_max_w') + '%');
        
        document.documentElement.style.setProperty('--ydesign-title-size-val', getSet('ydesign_text_title_size'));
        document.documentElement.style.setProperty('--ydesign-add-title-size-val', getSet('ydesign_text_add_title_size'));
        document.documentElement.style.setProperty('--ydesign-slogan-size-val', getSet('ydesign_text_slogan_size'));
        document.documentElement.style.setProperty('--ydesign-badge-size-val', getSet('ydesign_text_badge_size'));
        document.documentElement.style.setProperty('--ydesign-genres-size-val', getSet('ydesign_text_genres_size'));
        document.documentElement.style.setProperty('--ydesign-rating-size-val', getSet('ydesign_text_rating_size'));
        document.documentElement.style.setProperty('--ydesign-desc-size-val', getSet('ydesign_desc_size'));
        
        document.documentElement.style.setProperty('--ydesign-uniform-v-gap-v', getSet('ydesign_uniform_v_gap_val_vert') + 'em');
        document.documentElement.style.setProperty('--ydesign-uniform-v-gap-h', getSet('ydesign_uniform_v_gap_val_horz') + 'em');
        document.documentElement.style.setProperty('--ydesign-card-gap', getSet('ydesign_card_gap') + 'em');
        document.documentElement.style.setProperty('--ydesign-badge-rows-gap', getSet('ydesign_badge_rows_gap') + 'em');
        document.documentElement.style.setProperty('--ydesign-badges-gap-v', getSet('ydesign_badges_gap_vert') + 'em'); 
        document.documentElement.style.setProperty('--ydesign-badges-gap-h', getSet('ydesign_badges_gap_horz') + 'em'); 
        document.documentElement.style.setProperty('--ydesign-v-align-badges', getSet('ydesign_v_align_badges', 'ydesign_align_badges'));
        document.documentElement.style.setProperty('--ydesign-h-align-badges', getSet('ydesign_h_align_badges', 'ydesign_align_badges'));
        document.documentElement.style.setProperty('--ydesign-v-badges-gap', getSet('ydesign_v_badges_gap', 'ydesign_badges_gap_vert') + 'em');
        document.documentElement.style.setProperty('--ydesign-h-badges-gap', getSet('ydesign_h_badges_gap', 'ydesign_badges_gap_horz') + 'em');
        document.documentElement.style.setProperty('--ydesign-v-badge-rows-gap', getSet('ydesign_v_badge_rows_gap', 'ydesign_badge_rows_gap') + 'em');
        document.documentElement.style.setProperty('--ydesign-h-badge-rows-gap', getSet('ydesign_h_badge_rows_gap', 'ydesign_badge_rows_gap') + 'em');
        document.documentElement.style.setProperty('--ydesign-v-badge-size', getSet('ydesign_v_badge_size', 'ydesign_text_badge_size'));
        document.documentElement.style.setProperty('--ydesign-h-badge-size', getSet('ydesign_h_badge_size', 'ydesign_text_badge_size'));
        document.documentElement.style.setProperty('--ydesign-v-year-size', getSet('ydesign_v_year_size', 'ydesign_v_badge_size'));
        document.documentElement.style.setProperty('--ydesign-v-age-size', getSet('ydesign_v_age_size', 'ydesign_v_badge_size'));
        document.documentElement.style.setProperty('--ydesign-v-seasons-size', getSet('ydesign_v_seasons_size', 'ydesign_v_badge_size'));
        document.documentElement.style.setProperty('--ydesign-v-ua-size', getSet('ydesign_v_ua_size', 'ydesign_v_badge_size'));
        document.documentElement.style.setProperty('--ydesign-v-genres-size', getSet('ydesign_v_genres_size', 'ydesign_text_genres_size'));
        document.documentElement.style.setProperty('--ydesign-v-rating-size', getSet('ydesign_v_rating_size', 'ydesign_text_rating_size'));
        document.documentElement.style.setProperty('--ydesign-h-year-size', getSet('ydesign_h_year_size', 'ydesign_h_badge_size'));
        document.documentElement.style.setProperty('--ydesign-h-age-size', getSet('ydesign_h_age_size', 'ydesign_h_badge_size'));
        document.documentElement.style.setProperty('--ydesign-h-seasons-size', getSet('ydesign_h_seasons_size', 'ydesign_h_badge_size'));
        document.documentElement.style.setProperty('--ydesign-h-ua-size', getSet('ydesign_h_ua_size', 'ydesign_h_badge_size'));
        document.documentElement.style.setProperty('--ydesign-h-genres-size', getSet('ydesign_h_genres_size', 'ydesign_text_genres_size'));
        document.documentElement.style.setProperty('--ydesign-h-rating-size', getSet('ydesign_h_rating_size', 'ydesign_text_rating_size'));
        document.documentElement.style.setProperty('--ydesign-genres-gap', getSet('ydesign_genres_gap') + 'em');
        
        document.documentElement.style.setProperty('--ydesign-content-pb', getSet('ydesign_content_pb') + 'em');
        document.documentElement.style.setProperty('--ydesign-slogan-padding', getSet('ydesign_slogan_padding') + 'em');
        document.documentElement.style.setProperty('--ydesign-logo-mb', getSet('ydesign_logo_mb') + 'em');
        document.documentElement.style.setProperty('--ydesign-add-title-mb', getSet('ydesign_add_title_mb') + 'em');
        document.documentElement.style.setProperty('--ydesign-ratings-saturate', getSet('ydesign_ratings_saturate') + '%');

        var alignLogo = getSet('ydesign_align_logo');
        document.documentElement.style.setProperty('--ydesign-align-logo', getFlexAlign(alignLogo));
        document.documentElement.style.setProperty('--ydesign-text-logo', alignLogo);

        document.documentElement.style.setProperty('--ydesign-align-badges', getFlexAlign(getSet('ydesign_align_badges')));

        var alignSlogan = getSet('ydesign_align_slogan');
        document.documentElement.style.setProperty('--ydesign-align-slogan', getFlexAlign(alignSlogan));
        document.documentElement.style.setProperty('--ydesign-text-slogan', alignSlogan);

        document.body.dataset.ydesignLogo = getSet('ydesign_logo_type');
        document.body.classList.toggle('ydesign-hide-year', !getSet('ydesign_show_year'));
        document.body.classList.toggle('ydesign-hide-seasons', !getSet('ydesign_show_seasons'));
        document.body.classList.toggle('ydesign-hide-ua', !getSet('ydesign_show_ua'));
        document.body.classList.toggle('ydesign-hide-age', !getSet('ydesign_show_age'));
        document.body.classList.toggle('ydesign-hide-slogan', !getSet('ydesign_show_slogan'));
        document.body.classList.toggle('ydesign-hide-type-label', !getSet('ydesign_show_type_label'));
        document.body.dataset.ydesignTypeCorner = getSet('ydesign_type_label_corner');
        document.documentElement.style.setProperty('--ydesign-type-pill-size', getSet('ydesign_type_label_size') + 'em');
        document.body.classList.toggle('ydesign-badges-one-row', getSet('ydesign_badges_one_row'));
        document.body.classList.toggle('ydesign-horz-ratings-row', getSet('ydesign_h_ratings_row', 'ydesign_horz_ratings_row'));
        
        document.body.classList.toggle('ydesign-border-ratings', getSet('ydesign_border_ratings'));
        document.body.classList.toggle('ydesign-no-border-badges', !getSet('ydesign_border_badges'));
        document.body.classList.toggle('ydesign-card-border', getSet('ydesign_card_border'));
        document.body.classList.toggle('ydesign-dark-badge-bg', getSet('ydesign_badge_dark_bg'));
        document.body.classList.toggle('ydesign-hide-ratings', !getSet('ydesign_show_ratings'));
        document.body.classList.toggle('ydesign-hide-poster-title', !getSet('ydesign_show_poster_title'));
        document.documentElement.style.setProperty('--ydesign-poster-title-size-val', getSet('ydesign_poster_title_size'));

        var logoPosHorz = getSet('ydesign_logo_pos_horz');
        var justifyMap = { bottom: 'flex-end', center: 'center', below_center: 'center' };
        var shiftMap = { bottom: '0%', center: '0%', below_center: '18%' };
        document.documentElement.style.setProperty('--ydesign-content-justify-horz', justifyMap[logoPosHorz] || 'flex-end');
        document.documentElement.style.setProperty('--ydesign-content-shift-horz', shiftMap[logoPosHorz] || '0%');

        updateBorderStyles();
    }

    function createSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({
            component: 'ydesign',
            name: 'YDesign',
            icon: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><path d="M8 8l4 4 4-4"></path><path d="M12 12v4"></path></svg>`
        });

        var qualities = { 'w92':'w92', 'w154':'w154', 'w200':'w300', 'w300':'w300', 'w500':'w500', 'w780':'w780', 'original':'Оригинал' };
        
        var textSizesExt = {}; 
        for(let i=5; i<=40; i+=1) { let v = (i/10).toFixed(1); textSizesExt[v] = v; }
        
        var gaps = {}; 
        for(let i=-20; i<=40; i+=1) { let v = (i/10).toFixed(1); gaps[v] = v + ' em'; }
        
        var tinyGaps = {}; 
        for (let i=-20; i <= 40; i+=1) { let v = (i * 0.05).toFixed(2); tinyGaps[v] = v + ' em'; }

        var microGaps = {};
        for(let i=-100; i<=200; i+=1) { 
            let v = (i/100).toFixed(2); 
            microGaps[v] = v + ' em'; 
        }

        var logoSizes = {};
        for(let i=1; i<=34; i+=3) { logoSizes[i] = i + '%'; }
        logoSizes[35] = '35%';
        [40, 50, 60, 70, 80, 90, 100].forEach(v => logoSizes[v] = v + '%');

        var saturates = { '0': '0% (Чёрно-белые)', '25': '25%', '75': '75%', '100': '100% (Цветные)' };
        var aligns = { 'left': 'По левому краю', 'center': 'По центру', 'right': 'По правому краю' };

        // 1. БАЗОВІ НАЛАШТУВАННЯ ТА КЕШ

        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_clear_cache', type: 'button' },
            field: { name: 'Очистить кэш плагина', description: 'Удаляет кэш изображений, рейтингов и проверок озвучки' },
            onChange: function() {
                var keysToRemove = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.startsWith('ydesign_cache_')) keysToRemove.push(key);
                }
                keysToRemove.forEach(function(k) { localStorage.removeItem(k); });
                Lampa.Noty.show('Кэш плагина успешно очищен (' + keysToRemove.length + ' записей)');
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_omdb_key_btn', type: 'button' },
            field: { name: 'OMDB API Key', description: getSet('ydesign_omdb_key') ? 'Установлен' : 'Не установлен' },
            onChange: function() {
                Lampa.Input.edit({ title: 'OMDB API Key', value: getSet('ydesign_omdb_key'), free: true, nosave: true }, function (new_val) {
                    if (new_val !== undefined) { Lampa.Storage.set('ydesign_omdb_key', new_val.trim()); Lampa.Settings.update(); }
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_mdblist_key_btn', type: 'button' },
            field: { name: 'MDBList API Key', description: getSet('ydesign_mdblist_key') ? 'Установлен' : 'Не установлен' },
            onChange: function() {
                Lampa.Input.edit({ title: 'MDBList API Key', value: getSet('ydesign_mdblist_key'), free: true, nosave: true }, function (new_val) {
                    if (new_val !== undefined) { Lampa.Storage.set('ydesign_mdblist_key', new_val.trim()); Lampa.Settings.update(); }
                });
            }
        });

        // 2. СІТКА ТА ТИПИ КАРТОК
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_lazy_load', type: 'trigger', default: DefaultSettings.ydesign_lazy_load }, field: { name: 'Ленивая загрузка', description: 'Загружать дополнительные данные (лого, рейтинги) только при появлении карточки на экране' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_type_main', type: 'select', values: { 'vertical':'Вертикальные (9:16)', 'horizontal':'Горизонтальные (16:11)' }, default: DefaultSettings.ydesign_card_type_main }, field: { name: 'Тип карточек (Главная)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_type_other', type: 'select', values: { 'vertical':'Вертикальные (9:16)', 'horizontal':'Горизонтальные (16:11)' }, default: DefaultSettings.ydesign_card_type_other }, field: { name: 'Тип карточек (Другие страницы)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_grid_items_v', type: 'select', values: {'4':'4', '5':'5', '6':'6', '7':'7', '8':'8'}, default: DefaultSettings.ydesign_grid_items_v }, field: { name: 'Количество карточек в сетке (Вертикальные)', description: 'Решает проблему пустого отступа справа. Карточки будут растягиваться, чтобы заполнить всё пространство.' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_grid_items_h', type: 'select', values: {'2':'2', '3':'3', '4':'4', '5':'5'}, default: DefaultSettings.ydesign_grid_items_h }, field: { name: 'Количество карточек в сетке (Горизонтальные)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_series_redesign', type: 'trigger', default: DefaultSettings.ydesign_series_redesign }, field: { name: 'Изменить вид серий', description: 'Активировать новый вид карточек внутри серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_series_cards', type: 'select', values: { '1':'1', '2':'2', '3':'3', '4':'4' }, default: DefaultSettings.ydesign_series_cards }, field: { name: 'Количество карточек серий', description: 'Сколько карточек показывать в один ряд (для нового вида серий)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_hide_left_column', type: 'trigger', default: DefaultSettings.ydesign_hide_left_column }, field: { name: 'Убрать левую колонку (Серии)', description: 'Скрывает описание и растягивает карточки серий на весь экран' } });

        // 3. ВІДОБРАЖЕННЯ ЕЛЕМЕНТІВ
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_year', type: 'trigger', default: DefaultSettings.ydesign_show_year }, field: { name: 'Показывать Год' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_seasons', type: 'trigger', default: DefaultSettings.ydesign_show_seasons }, field: { name: 'Показывать Сезоны/Серии' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_age', type: 'trigger', default: DefaultSettings.ydesign_show_age }, field: { name: 'Показывать возрастной рейтинг' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_ua', type: 'trigger', default: DefaultSettings.ydesign_show_ua }, field: { name: 'Показывать метку UA (через API)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_type_label', type: 'trigger', default: DefaultSettings.ydesign_show_type_label }, field: { name: 'Показывать тип (Фильм / Сериал)', description: 'Таблетка в стиле Apple TV в углу карточки' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_type_label_corner', type: 'select', values: { 'top-right':'Сверху справа', 'top-left':'Сверху слева', 'bottom-right':'Снизу справа', 'bottom-left':'Снизу слева' }, default: DefaultSettings.ydesign_type_label_corner }, field: { name: 'Угол таблетки' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_type_label_size', type: 'select', values: { '0.45':'Очень маленький', '0.52':'Маленький', '0.60':'Средний (по умолчанию)', '0.70':'Большой', '0.80':'Очень большой', '0.95':'Огромный' }, default: DefaultSettings.ydesign_type_label_size }, field: { name: 'Размер таблетки' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_genres', type: 'trigger', default: DefaultSettings.ydesign_show_genres }, field: { name: 'Показывать Жанры' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_ratings', type: 'trigger', default: DefaultSettings.ydesign_show_ratings }, field: { name: 'Показывать рейтинги', description: 'Скрывает блок рейтингов (IMDb, KP и т.д.) на постерах' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_slogan', type: 'trigger', default: DefaultSettings.ydesign_show_slogan }, field: { name: 'Показывать слоган' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_desc_horz', type: 'trigger', default: DefaultSettings.ydesign_show_desc_horz }, field: { name: 'Описание под карточкой (Горизонтальные)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_poster_title', type: 'trigger', default: DefaultSettings.ydesign_show_poster_title }, field: { name: 'Название под постером', description: 'Показывать название фильма или сериала под постером' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_poster_title_lang', type: 'select', values: { 'main':'Основное (по настройке языка)', 'uk':'Украинский', 'en':'Английский' }, default: DefaultSettings.ydesign_poster_title_lang }, field: { name: 'Язык названия под постером' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_poster_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_poster_title_size }, field: { name: 'Размер шрифта названия под постером' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_add_title', type: 'trigger', default: DefaultSettings.ydesign_show_add_title }, field: { name: 'Показывать дополнительное название', description: 'Украинское название над бейджами, если логотип английский' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_add_title_lang', type: 'select', values: { 'uk':'Всегда Украинский', 'en':'Всегда Английский', 'auto':'Зависит от логотипа' }, default: DefaultSettings.ydesign_add_title_lang }, field: { name: 'Язык дополнительного названия' } });

        // 4. МОВИ ТА ЯКІСТЬ
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_type', type: 'select', values: { 'logo':'Логотип (изображение)', 'text':'Текст' }, default: DefaultSettings.ydesign_logo_type }, field: { name: 'Отображение названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_lang', type: 'select', values: { 'ru_en':'Рус → Англ (рекомендуется)', 'ru':'Только Русский', 'en_orig':'Только Английский', 'uk_en':'Укр → Англ', 'uk':'Только Украинский' }, default: DefaultSettings.ydesign_lang }, field: { name: 'Язык логотипа/названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_slogan_lang', type: 'select', values: { 'ru':'Русский', 'uk':'Украинский' }, default: DefaultSettings.ydesign_slogan_lang }, field: { name: 'Язык слогана' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_desc_lang', type: 'select', values: { 'ru':'Русский', 'uk':'Украинский' }, default: DefaultSettings.ydesign_desc_lang }, field: { name: 'Язык описания под карточкой' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_poster_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_poster_quality }, field: { name: 'Качество постеров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_backdrop_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_backdrop_quality }, field: { name: 'Качество бекдропов' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_logo_quality }, field: { name: 'Качество логотипов' } });

        // 5. СТИЛІЗАЦІЯ БЕЙДЖІВ ТА РЕЙТИНГІВ
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_uniform_badges', type: 'trigger', default: DefaultSettings.ydesign_uniform_badges }, field: { name: 'Все бейджи одного размера', description: 'Рейтинги и жанры будут иметь такой же размер и высоту, как бейдж года/возраста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_badges_one_row', type: 'trigger', default: DefaultSettings.ydesign_badges_one_row }, field: { name: 'Все бейджи в 1 ряд (Вертикальные)', description: 'Рейтинги и бейджи будут расположены в один сплошной ряд' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_horz_ratings_row', type: 'trigger', default: DefaultSettings.ydesign_horz_ratings_row }, field: { name: 'Рейтинги с новой строки (Горизонтальные)', description: 'Переносит блок рейтингов под бейджи года/возраста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_pos_horz', type: 'select', values: { 'bottom':'Низ (по умолчанию)', 'center':'Центр', 'below_center':'Ниже центра' }, default: DefaultSettings.ydesign_logo_pos_horz }, field: { name: 'Положение лого (Горизонтальные)', description: 'Смещает лого/название и весь блок текста вертикально на горизонтальных карточках' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_border_ratings', type: 'trigger', default: DefaultSettings.ydesign_border_ratings }, field: { name: 'Показывать рамку для рейтингов' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_border_badges', type: 'trigger', default: DefaultSettings.ydesign_border_badges }, field: { name: 'Показывать рамку для бейджей и жанров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_badge_dark_bg', type: 'trigger', default: DefaultSettings.ydesign_badge_dark_bg }, field: { name: 'Тёмный фон бейджей', description: 'Добавляет полупрозрачный тёмный фон на бейджи, рейтинги и жанры — улучшает читаемость на светлых постерах' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_border', type: 'trigger', default: DefaultSettings.ydesign_card_border }, field: { name: 'Цветная рамка постера', description: 'Использует цвет выделения из плагина Colors' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_border_width', type: 'select', values: { '0.10':'Тонкая', '0.15':'Тонкая+', '0.20':'Средняя', '0.25':'Стандарт (фокус)', '0.30':'Толстая', '0.40':'Очень толстая' }, default: DefaultSettings.ydesign_card_border_width }, field: { name: 'Толщина рамки постера' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_border_color', type: 'select', values: { '#2b7fff':'Синий', '#fb2c36':'Красный', '#00c950':'Зелёный', '#ff6900':'Оранжевый', '#8e51ff':'Фиолетовый', '#00b8db':'Голубой', '#f6339a':'Розовый', '#f0b100':'Золотой', '#00bc7d':'Изумрудный', '#ffffff':'Белый', '#aaaaaa':'Серый' }, default: DefaultSettings.ydesign_card_border_color }, field: { name: 'Цвет рамки постера' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_focus_color', type: 'select', values: { '#2b7fff':'Синий', '#fb2c36':'Красный', '#00c950':'Зелёный', '#ff6900':'Оранжевый', '#8e51ff':'Фиолетовый', '#00b8db':'Голубой', '#f6339a':'Розовый', '#f0b100':'Золотой', '#00bc7d':'Изумрудный', '#ffffff':'Белый', '#aaaaaa':'Серый' }, default: DefaultSettings.ydesign_focus_color }, field: { name: 'Цвет рамки фокуса', description: 'Рамка вокруг карточки при выборе' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_focus_width', type: 'select', values: { '0.10':'Тонкая', '0.15':'Тонкая+', '0.20':'Средняя', '0.25':'Стандарт', '0.30':'Толстая', '0.40':'Очень толстая' }, default: DefaultSettings.ydesign_focus_width }, field: { name: 'Толщина рамки фокуса' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_ratings_saturate', type: 'select', values: saturates, default: DefaultSettings.ydesign_ratings_saturate }, field: { name: 'Насыщенность иконок рейтингов', description: 'Управляет цветовой гаммой логотипов рейтингов' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_badge_shape', type: 'select', values: { 'pill':'Пилюля', 'rounded':'Скруглённый прямоугольник', 'square':'Прямоугольник' }, default: DefaultSettings.ydesign_badge_shape }, field: { name: 'Форма бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_glass_pill_bg', type: 'trigger', default: DefaultSettings.ydesign_glass_pill_bg }, field: { name: 'Стеклянный фон бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_color_age', type: 'trigger', default: DefaultSettings.ydesign_color_age }, field: { name: 'Цветной бейдж возраста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_color_ua', type: 'trigger', default: DefaultSettings.ydesign_color_ua }, field: { name: 'Цветная метка UA' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { type: 'title' }, field: { name: 'Отдельные рамки бейджей' } });
        [
            ['ydesign_border_year', 'Рамка бейджа года'],
            ['ydesign_border_age', 'Рамка бейджа возраста'],
            ['ydesign_border_seasons', 'Рамка бейджа сезонов/серий'],
            ['ydesign_border_ua', 'Рамка метки UA'],
            ['ydesign_border_genres', 'Рамка бейджей жанров']
        ].forEach(function (item) {
            Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: item[0], type: 'trigger', default: DefaultSettings[item[0]] }, field: { name: item[1] } });
        });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { type: 'title' }, field: { name: 'Размеры бейджей: вертикальные карточки' } });
        [
            ['ydesign_v_uniform_badges', 'Все бейджи одного размера'],
            ['ydesign_v_badges_one_row', 'Все бейджи в одну строку']
        ].forEach(function (item) {
            Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: item[0], type: 'trigger', default: DefaultSettings[item[0]] }, field: { name: item[1] } });
        });
        [
            ['ydesign_v_badge_size', 'Базовый размер бейджей'],
            ['ydesign_v_year_size', 'Размер бейджа года'],
            ['ydesign_v_age_size', 'Размер бейджа возраста'],
            ['ydesign_v_seasons_size', 'Размер бейджа сезонов/серий'],
            ['ydesign_v_ua_size', 'Размер метки UA'],
            ['ydesign_v_genres_size', 'Размер бейджей жанров'],
            ['ydesign_v_rating_size', 'Размер бейджей рейтингов']
        ].forEach(function (item) {
            Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: item[0], type: 'select', values: textSizesExt, default: DefaultSettings[item[0]] }, field: { name: item[1] } });
        });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_v_align_badges', type: 'select', values: aligns, default: DefaultSettings.ydesign_v_align_badges }, field: { name: 'Выравнивание бейджей: вертикальные' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_v_badges_gap', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_v_badges_gap }, field: { name: 'Расстояние между бейджами: вертикальные' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_v_badge_rows_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_v_badge_rows_gap }, field: { name: 'Отступ между рядами: вертикальные' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { type: 'title' }, field: { name: 'Размеры бейджей: горизонтальные карточки' } });
        [
            ['ydesign_h_uniform_badges', 'Все бейджи одного размера'],
            ['ydesign_h_ratings_row', 'Рейтинги с новой строки']
        ].forEach(function (item) {
            Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: item[0], type: 'trigger', default: DefaultSettings[item[0]] }, field: { name: item[1] } });
        });
        [
            ['ydesign_h_badge_size', 'Базовый размер бейджей'],
            ['ydesign_h_year_size', 'Размер бейджа года'],
            ['ydesign_h_age_size', 'Размер бейджа возраста'],
            ['ydesign_h_seasons_size', 'Размер бейджа сезонов/серий'],
            ['ydesign_h_ua_size', 'Размер метки UA'],
            ['ydesign_h_genres_size', 'Размер бейджей жанров'],
            ['ydesign_h_rating_size', 'Размер бейджей рейтингов']
        ].forEach(function (item) {
            Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: item[0], type: 'select', values: textSizesExt, default: DefaultSettings[item[0]] }, field: { name: item[1] } });
        });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_h_align_badges', type: 'select', values: aligns, default: DefaultSettings.ydesign_h_align_badges }, field: { name: 'Выравнивание бейджей: горизонтальные' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_h_badges_gap', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_h_badges_gap }, field: { name: 'Расстояние между бейджами: горизонтальные' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_h_badge_rows_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_h_badge_rows_gap }, field: { name: 'Отступ между рядами: горизонтальные' } });
        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_ratings_order_btn', type: 'button' },
            field: { name: 'Порядок и выбор рейтингов', description: getSet('ydesign_ratings_order') },
            onChange: function() {
                Lampa.Input.edit({
                    title: 'Введите через запятую (tmdb, imdb, rt, mc, trakt, mdblist, popcorn, letterboxd, kp)',
                    value: getSet('ydesign_ratings_order'),
                    free: true, nosave: true
                }, function (new_val) {
                    if (new_val !== undefined) { Lampa.Storage.set('ydesign_ratings_order', new_val.trim().toLowerCase()); Lampa.Settings.update(); }
                });
            }
        });

        // 6. ВИРІВНЮВАННЯ
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_align_logo', type: 'select', values: aligns, default: DefaultSettings.ydesign_align_logo }, field: { name: 'Выравнивание: Логотип/Название' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_align_badges', type: 'select', values: aligns, default: DefaultSettings.ydesign_align_badges }, field: { name: 'Выравнивание: Бейджи/Рейтинги' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_align_slogan', type: 'select', values: aligns, default: DefaultSettings.ydesign_align_slogan }, field: { name: 'Выравнивание: Слоган' } });

        // 7. РОЗМІРИ ТЕКСТІВ ТА ЛОГО
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_max_h', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_logo_max_h }, field: { name: 'Макс. высота логотипа/текста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_max_w', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_logo_max_w }, field: { name: 'Макс. ширина логотипа/текста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_text_title_size }, field: { name: 'Размер текста основного названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_add_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_text_add_title_size }, field: { name: 'Размер шрифта дополнительного названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_slogan_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_text_slogan_size }, field: { name: 'Размер текста слогана' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_badge_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_text_badge_size }, field: { name: 'Размер текста бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_genres_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_text_genres_size }, field: { name: 'Размер шрифта Жанров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_rating_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_text_rating_size }, field: { name: 'Размер текста рейтингов' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_desc_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_desc_size }, field: { name: 'Размер текста описания' } });

        // 8. ВІДСТУПИ
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_uniform_v_gaps_vert', type: 'trigger', default: DefaultSettings.ydesign_uniform_v_gaps_vert }, field: { name: 'Вертикальные отступы одинаковые (Вертикальные карточки)', description: 'Расстояние между доп. названием, годом, рейтингами, жанрами и слоганом станет единым' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_uniform_v_gap_val_vert', type: 'select', values: microGaps, default: DefaultSettings.ydesign_uniform_v_gap_val_vert }, field: { name: 'Вертикальный отступ (Вертикальные карточки)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_uniform_v_gaps_horz', type: 'trigger', default: DefaultSettings.ydesign_uniform_v_gaps_horz }, field: { name: 'Вертикальные отступы одинаковые (Горизонтальные карточки)', description: 'Расстояние между доп. названием, годом, рейтингами, жанрами и слоганом станет единым' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_uniform_v_gap_val_horz', type: 'select', values: microGaps, default: DefaultSettings.ydesign_uniform_v_gap_val_horz }, field: { name: 'Вертикальный отступ (Горизонтальные карточки)' } });
        
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_badges_gap_vert', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_badges_gap_vert }, field: { name: 'Расстояние между бейджами по горизонтали (Вертикальные карточки)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_badges_gap_horz', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_badges_gap_horz }, field: { name: 'Расстояние между бейджами по горизонтали (Горизонтальные карточки)' } });
        
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_card_gap }, field: { name: 'Расстояние между карточками' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_badge_rows_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_badge_rows_gap }, field: { name: 'Отступ между строками бейджей/рейтингов', description: 'По вертикали' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_genres_gap', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_genres_gap }, field: { name: 'Отступ для блока Жанров', description: 'Сверху и снизу жанров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_content_pb', type: 'select', values: gaps, default: DefaultSettings.ydesign_content_pb }, field: { name: 'Отступ контента снизу' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_slogan_padding', type: 'select', values: gaps, default: DefaultSettings.ydesign_slogan_padding }, field: { name: 'Отступ слогана сверху' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_mb', type: 'select', values: gaps, default: DefaultSettings.ydesign_logo_mb }, field: { name: 'Отступ названия/лого от бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_add_title_mb', type: 'select', values: gaps, default: DefaultSettings.ydesign_add_title_mb }, field: { name: 'Отступ дополнительного названия от бейджей' } });

        Lampa.Settings.listener.follow('change', function(e) {
            if(e.name.indexOf('ydesign_') !== -1) {
                applyDynamicCSS(); 
                
                var cssOnlyParams = [
                    'ydesign_lazy_load', 'ydesign_grid_items_v', 'ydesign_grid_items_h',
                    'ydesign_logo_max_h', 'ydesign_logo_max_w', 'ydesign_text_title_size',
                    'ydesign_text_add_title_size', 'ydesign_text_slogan_size', 'ydesign_text_badge_size',
                    'ydesign_text_genres_size', 'ydesign_text_rating_size', 'ydesign_desc_size',
                    'ydesign_uniform_v_gap_val_vert', 'ydesign_uniform_v_gap_val_horz', 'ydesign_card_gap',
                    'ydesign_badge_rows_gap', 'ydesign_badges_gap_vert', 'ydesign_badges_gap_horz',
                    'ydesign_genres_gap', 'ydesign_content_pb', 'ydesign_slogan_padding', 'ydesign_logo_mb',
                    'ydesign_add_title_mb', 'ydesign_ratings_saturate', 'ydesign_align_logo', 'ydesign_align_badges',
                    'ydesign_align_slogan', 'ydesign_series_cards', 'ydesign_uniform_v_gaps_vert', 'ydesign_uniform_v_gaps_horz',
                    'ydesign_uniform_badges', 'ydesign_series_redesign', 'ydesign_border_ratings', 'ydesign_border_badges',
                    'ydesign_badges_one_row', 'ydesign_show_year', 'ydesign_show_seasons', 'ydesign_show_ua', 
                    'ydesign_show_age', 'ydesign_show_slogan', 'ydesign_logo_type', 'ydesign_hide_left_column',
                    'ydesign_show_type_label', 'ydesign_type_label_corner', 'ydesign_type_label_size',
                    'ydesign_card_border', 'ydesign_card_border_width', 'ydesign_card_border_color', 'ydesign_badge_dark_bg',
                    'ydesign_focus_color', 'ydesign_focus_width', 'ydesign_show_ratings', 'ydesign_logo_pos_horz',
                    'ydesign_show_poster_title', 'ydesign_poster_title_size'
                ];

                if (!cssOnlyParams.includes(e.name)) {
                    document.querySelectorAll('.ydesign-card').forEach(function(c) {
                        if (c._ydesign_data) buildCardCustomDOM(c, c._ydesign_data);
                    });
                }
            }
        });
    }

    function overrideCards() {
        var CardMaker = Lampa.Maker.map('Card');
        var originalOnVisible = CardMaker.Card.onVisible;

        CardMaker.Card.onVisible = function () {
            this.image_loaded = true;
            originalOnVisible.apply(this, arguments);

            if (this.data && this.data.id && (this.data.media_type === 'movie' || this.data.media_type === 'tv' || this.data.name || this.data.title)) {
                var el = this.html[0] || this.html;
                if (!el._ydesign_built) {
                    el._ydesign_built = true;
                    el._ydesign_data = this.data;
                    
                    var activeComp = Lampa.Activity.active() ? Lampa.Activity.active().component : 'main';
                    el._ydesign_isMain = (activeComp === 'main');

                    buildCardCustomDOM(el, this.data);
                }
            }
        };
    }

    // =======================================================
    // ЛОГІКА ДЛЯ РЕДИЗАЙНУ СЕРІЙ
    // =======================================================
    function formatPrestigeCard(card) {
        if (!getSet('ydesign_series_redesign')) return false;

        if (card.dataset.fixedLayout === "true") return false;
        card.dataset.fixedLayout = "true";

        var explorer = card.closest('.explorer');
        if (explorer && !explorer.classList.contains('ydesign-has-series')) {
            explorer.classList.add('ydesign-has-series');
        }

        if (card.classList.contains('online-prestige-watched')) {
            card.style.opacity = '0.5'; 
        }

        var splits = card.querySelectorAll('.online-prestige-split');
        splits.forEach(function(s) { s.remove(); });

        var rightTopBlock = card.querySelector('.right-top-badges');
        if (!rightTopBlock) {
            rightTopBlock = document.createElement('div');
            rightTopBlock.className = 'right-top-badges';
            card.appendChild(rightTopBlock);
        }

        var infoBlock = card.querySelector('.online-prestige__info');
        if (infoBlock && infoBlock.firstElementChild) {
            var firstSpan = infoBlock.firstElementChild;
            if (firstSpan.innerHTML.indexOf('<svg') !== -1 || firstSpan.textContent.indexOf('★') !== -1 || !isNaN(parseFloat(firstSpan.textContent))) {
                var svg = firstSpan.querySelector('svg');
                if (svg) svg.remove();
                firstSpan.innerHTML = firstSpan.innerHTML.replace(/★/g, '').trim();
                rightTopBlock.appendChild(firstSpan);
            }
        }

        var quality = card.querySelector('.online-prestige__quality');
        if (quality) rightTopBlock.appendChild(quality);

        var time = card.querySelector('.online-prestige__time');
        if (time) card.appendChild(time);

        return false;
    }

    function initSeriesLogic() {
        var observer = new MutationObserver(function(mutations) {
            if (!getSet('ydesign_series_redesign')) return;

            var focusLost = false;
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.classList && node.classList.contains('online-prestige')) {
                            if (formatPrestigeCard(node)) focusLost = true;
                        }
                        if (node.querySelectorAll) {
                            var cards = node.querySelectorAll('.online-prestige');
                            cards.forEach(function(c) {
                                if (formatPrestigeCard(c)) focusLost = true;
                            });
                        }
                    }
                });
            });

            if (focusLost) {
                setTimeout(function() {
                    var active = document.querySelector('.activity--active');
                    if (active) {
                        var nextValid = active.querySelector('.online-prestige.online-prestige--full.selector');
                        if (nextValid && window.Lampa && window.Lampa.Controller) {
                            window.Lampa.Controller.collectionFocus(nextValid, active);
                        }
                    }
                }, 20);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        setInterval(function() {
            if (!getSet('ydesign_series_redesign')) return;

            var activeCards = document.querySelectorAll('.online-prestige:not(.online-prestige-watched)');
            activeCards.forEach(function(card) {
                var line = card.querySelector('.time-line > div');
                if (line && line.style.width) {
                    var timeline = card.querySelector('.online-prestige__timeline');
                    if (timeline) {
                        var intVal = parseInt(line.style.width, 10);
                        if (!isNaN(intVal) && intVal >= 1) {
                            timeline.setAttribute('data-percent', intVal + '%');
                        } else {
                            timeline.removeAttribute('data-percent');
                        }
                    }
                }
            });
        }, 800);

        var pageJustLoaded = false;
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' || e.type === 'build') {
                pageJustLoaded = true; 
            }
        });

        setInterval(function() {
            if (!getSet('ydesign_series_redesign') || !pageJustLoaded) return;

            var active = document.querySelector('.activity--active');
            if (!active) return;

            var currentFocus = active.querySelector('.focus');
            
            if (!currentFocus || currentFocus.closest('.torrent-filter') || currentFocus.classList.contains('explorer-card__head-img')) {
                var firstCard = active.querySelector('.online-prestige.online-prestige--full.selector');
                
                if (firstCard) {
                    if (window.Lampa && window.Lampa.Controller) {
                        window.Lampa.Controller.collectionFocus(firstCard, active);
                    } else {
                        if (currentFocus) currentFocus.classList.remove('focus');
                        firstCard.classList.add('focus');
                    }
                    pageJustLoaded = false; 
                }
            } 
            else if (currentFocus && currentFocus.classList.contains('online-prestige--full')) {
                pageJustLoaded = false;
            }
        }, 150);
    }

    function init() {
        createSettings();

        // Перевірка джерела
        var currentSource = Lampa.Storage.get('source') || 'tmdb';
        if (currentSource !== 'tmdb' && currentSource !== 'cub') {
            setTimeout(function() {
                Lampa.Noty.show('Для работы YDesign необходимо выбрать источник TMDB или CUB (Текущий: ' + currentSource + ')');
            }, 3000);
            console.log('YDesign отключён: источник Lampa не является TMDB или CUB.');
            return; // Перериваємо модифікацію карток
        }

        injectCSS();
        applyDynamicCSS();
        overrideCards();
        initSeriesLogic();

        if (window.appready && Lampa.Activity && Lampa.Activity.active()) {
            setTimeout(function() {
                var act = Lampa.Activity.active();
                if (act && act.activity && act.activity.render) {
                    act.activity.render().find('.card').trigger('visible');
                }
            }, 100);
        }
        
        console.log('Lampa Plugin: YDesign успешно загружен.');
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') init(); });

})();
