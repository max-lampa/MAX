(function () {
    'use strict';

    if (window.YDesignLoaded) return;
    window.YDesignLoaded = true;

    var CONFIG = {
        cacheTime: 7 * 24 * 60 * 60 * 1000,
        tmdbKey: function () {
            return (Lampa.TMDB && Lampa.TMDB.key) ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96';
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
        ydesign_logo_quality: 'w300',
        ydesign_poster_quality: 'w500',
        ydesign_backdrop_quality: 'w780',
        ydesign_lang: 'ru_en',
        ydesign_slogan_lang: 'ru_en',
        ydesign_desc_lang: 'ru_en',
        ydesign_logo_type: 'logo',
        ydesign_logo_max_h: '35',
        ydesign_logo_max_w: '80',
        ydesign_text_title_size: '1.2',
        ydesign_text_slogan_size: '0.85',
        ydesign_text_badge_size: '0.75',
        ydesign_text_rating_size: '0.8',
        ydesign_desc_size: '0.85',
        ydesign_card_type_main: 'horizontal',
        ydesign_card_type_other: 'vertical',
        ydesign_badges_one_row: false,
        ydesign_show_desc_horz: true,
        ydesign_show_year: true,
        ydesign_show_seasons: true,
        ydesign_show_ua: false,
        ydesign_show_age: true,
        ydesign_show_slogan: true,
        ydesign_lazy_load: true,
        ydesign_card_gap: '0.8',
        ydesign_badge_rows_gap: '0.4',
        ydesign_content_pb: '0.8',
        ydesign_slogan_padding: '0.3',
        ydesign_logo_mb: '1.2',
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

    var ApiCache = {
        get: function (key) {
            var data = Lampa.Storage.get('ydesign_cache_' + key);
            if (data && (Date.now() - data.time < CONFIG.cacheTime)) return data.val;
            return null;
        },
        set: function (key, val) {
            Lampa.Storage.set('ydesign_cache_' + key, { val: val, time: Date.now() });
        }
    };

    var LazyLoader = {
        observer: null,
        init: function () {
            if (this.observer) return;
            this.observer = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        if (el._lazyQueue) {
                            el._lazyQueue.forEach(function (fn) { fn(); });
                            delete el._lazyQueue;
                        }
                        observer.unobserve(el);
                    }
                });
            }, { rootMargin: '150px' });
        },
        add: function (el, fn) {
            this.init();
            el._lazyQueue = [fn];
            this.observer.observe(el);
        }
    };

    // Получение насыщенного тёмного цвета из нижней части изображения
    function getProminentColor(imgEl, callback) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = 1;
        canvas.height = 1;
        try {
            var sx = 0, sy = imgEl.naturalHeight * 0.75,
                sw = imgEl.naturalWidth, sh = imgEl.naturalHeight * 0.25;
            ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, 1, 1);
            var data = ctx.getImageData(0, 0, 1, 1).data;
            var r = data[0], g = data[1], b = data[2];

            var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            // Делаем цвет тёмным и насыщенным: не даём осветляться
            if (luma > 60) {
                // Сильно затемняем, чтобы не было осветления карточки
                var factor = 45 / luma;
                r = Math.max(0, Math.floor(r * factor));
                g = Math.max(0, Math.floor(g * factor));
                b = Math.max(0, Math.floor(b * factor));
            } else if (luma < 8) {
                r = 18; g = 18; b = 18;
            }

            // Усиливаем насыщенность: находим доминирующий канал и усиливаем разницу
            var maxC = Math.max(r, g, b);
            var minC = Math.min(r, g, b);
            if (maxC > 0 && maxC - minC > 5) {
                var satFactor = 1.8;
                var avg = (r + g + b) / 3;
                r = Math.min(255, Math.max(0, Math.round(avg + (r - avg) * satFactor)));
                g = Math.min(255, Math.max(0, Math.round(avg + (g - avg) * satFactor)));
                b = Math.min(255, Math.max(0, Math.round(avg + (b - avg) * satFactor)));
                // Ещё раз контролируем яркость после насыщения
                var newLuma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                if (newLuma > 55) {
                    var f2 = 45 / newLuma;
                    r = Math.max(0, Math.floor(r * f2));
                    g = Math.max(0, Math.floor(g * f2));
                    b = Math.max(0, Math.floor(b * f2));
                }
            }

            callback('rgb(' + r + ',' + g + ',' + b + ')');
        } catch (e) {
            callback('rgb(18, 18, 18)');
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

    function fetchExtendedData(id, type) {
        return new Promise(function (resolve) {
            var langPref = getSet('ydesign_lang');
            var sloganLang = getSet('ydesign_slogan_lang');
            var descLang = getSet('ydesign_desc_lang');

            var cacheKey = type + '_' + id + '_' + langPref + '_' + sloganLang + '_' + descLang;
            var cached = ApiCache.get(cacheKey);
            if (cached) return resolve(cached);

            // Определяем нужный язык для запроса
            function getLangQuery(pref) {
                if (pref === 'ru' || pref === 'ru_en') return 'ru-RU';
                if (pref === 'uk' || pref === 'uk_en') return 'uk-UA';
                return 'en-US';
            }

            var mainLangQuery = getLangQuery(langPref || sloganLang || descLang);

            var url = 'https://api.themoviedb.org/3/' + type + '/' + id +
                '?api_key=' + CONFIG.tmdbKey() +
                '&language=' + mainLangQuery +
                '&append_to_response=images,release_dates,content_ratings' +
                '&include_image_language=ru,uk,en,null';

            $.get(url).then(function (data) {
                var enData = null;

                var needEn = false;
                if (sloganLang === 'en' || descLang === 'en' || langPref === 'en_orig') needEn = true;
                if ((sloganLang === 'ru_en' || sloganLang === 'uk_en') && (!data.tagline || data.tagline.trim() === '')) needEn = true;
                if ((descLang === 'ru_en' || descLang === 'uk_en') && (!data.overview || data.overview.trim() === '')) needEn = true;

                function buildResult(enD) {
                    var finalTagline = '';
                    if (sloganLang === 'ru' || sloganLang === 'uk') finalTagline = data.tagline || '';
                    else if (sloganLang === 'en') finalTagline = enD ? enD.tagline : '';
                    else finalTagline = data.tagline || (enD ? enD.tagline : '');

                    var finalOverview = '';
                    if (descLang === 'ru' || descLang === 'uk') finalOverview = data.overview || '';
                    else if (descLang === 'en') finalOverview = enD ? enD.overview : '';
                    else finalOverview = data.overview || (enD ? enD.overview : '');

                    var result = {
                        tagline: finalTagline || '',
                        overview: finalOverview || '',
                        clean_poster: null,
                        clean_backdrop: null,
                        logo: null,
                        age: null,
                        seasons: data.number_of_seasons,
                        episodes: data.number_of_episodes,
                        tmdb_rating: data.vote_average
                    };

                    if (data.images) {
                        var cp = data.images.posters.find(function (p) { return p.iso_639_1 === null; });
                        if (cp) result.clean_poster = cp.file_path;
                        else if (data.images.posters.length) result.clean_poster = data.images.posters[0].file_path;

                        var cb = data.images.backdrops.find(function (p) { return p.iso_639_1 === null; });
                        if (cb) result.clean_backdrop = cb.file_path;
                        else if (data.images.backdrops.length) result.clean_backdrop = data.images.backdrops[0].file_path;

                        var logo = null;
                        if (langPref === 'ru') {
                            logo = data.images.logos.find(function (l) { return l.iso_639_1 === 'ru'; });
                        } else if (langPref === 'ru_en' || langPref === 'uk_en') {
                            logo = data.images.logos.find(function (l) { return l.iso_639_1 === 'ru'; }) ||
                                   data.images.logos.find(function (l) { return l.iso_639_1 === 'uk'; }) ||
                                   data.images.logos.find(function (l) { return l.iso_639_1 === 'en'; });
                            if (!logo && data.images.logos.length) logo = data.images.logos[0];
                        } else {
                            logo = data.images.logos.find(function (l) { return l.iso_639_1 === 'en'; });
                            if (!logo && data.images.logos.length) logo = data.images.logos[0];
                        }
                        if (logo) result.logo = logo.file_path;
                    }

                    if (type === 'movie' && data.release_dates && data.release_dates.results) {
                        var us = data.release_dates.results.find(function (r) { return r.iso_3166_1 === 'US'; });
                        if (us && us.release_dates.length) result.age = us.release_dates[0].certification;
                    } else if (type === 'tv' && data.content_ratings && data.content_ratings.results) {
                        var usTv = data.content_ratings.results.find(function (r) { return r.iso_3166_1 === 'US'; });
                        if (usTv) result.age = usTv.rating;
                    }

                    result.age = parseAgeRating(result.age);

                    ApiCache.set(cacheKey, result);
                    resolve(result);
                }

                if (needEn) {
                    $.get('https://api.themoviedb.org/3/' + type + '/' + id + '?api_key=' + CONFIG.tmdbKey() + '&language=en-US')
                        .then(function (d) { buildResult(d); })
                        .catch(function () { buildResult(null); });
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
            var cacheKey = 'ext_rates_v4_' + tmdbId;
            var cached = ApiCache.get(cacheKey);
            if (cached) return resolve(cached);

            var results = {};

            $.get('https://api.themoviedb.org/3/' + type + '/' + tmdbId + '/external_ids?api_key=' + CONFIG.tmdbKey())
                .then(function (extRes) {
                    var imdbId = extRes.imdb_id;
                    if (!imdbId) { ApiCache.set(cacheKey, results); return resolve(results); }

                    var omdbKey = getSet('ydesign_omdb_key').trim();
                    var mdblistKey = getSet('ydesign_mdblist_key').trim();

                    var tasks = [];

                    if (omdbKey) {
                        tasks.push(
                            $.get('https://www.omdbapi.com/?apikey=' + omdbKey + '&i=' + imdbId)
                                .then(function (omdbData) {
                                    if (omdbData && omdbData.Response !== 'False') {
                                        if (omdbData.Metascore && omdbData.Metascore !== 'N/A') results.mc = omdbData.Metascore;
                                        if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') results.imdb = omdbData.imdbRating;
                                        var rt = (omdbData.Ratings || []).find(function (r) { return r.Source === 'Rotten Tomatoes'; });
                                        if (rt) results.rt = rt.Value.replace('%', '');
                                    }
                                }).catch(function () {})
                        );
                    }

                    if (mdblistKey) {
                        tasks.push(
                            $.get('https://mdblist.com/api/?apikey=' + mdblistKey + '&i=' + imdbId)
                                .then(function (mdbData) {
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
                                }).catch(function () {})
                        );
                    }

                    Promise.all(tasks).then(function () {
                        ApiCache.set(cacheKey, results);
                        resolve(results);
                    });
                })
                .catch(function () { resolve(results); });
        });
    }

    function renderRatings(container, baseData, tmdbData, extRatings) {
        var orderStr = String(getSet('ydesign_ratings_order') || 'tmdb,imdb,rt,popcorn');
        var order = orderStr.split(',').map(function (s) { return s.trim().toLowerCase(); });

        var available = {
            tmdb: tmdbData.tmdb_rating ? parseFloat(tmdbData.tmdb_rating).toFixed(1) : null,
            kp: baseData.kp_rating ? parseFloat(baseData.kp_rating).toFixed(1) : null,
            imdb: (extRatings && extRatings.imdb)
                ? parseFloat(extRatings.imdb).toFixed(1)
                : (baseData.imdb_rating ? parseFloat(baseData.imdb_rating).toFixed(1) : null),
            rt: (extRatings && extRatings.rt) ? parseFloat(extRatings.rt).toFixed(0) + '%' : null,
            mc: (extRatings && extRatings.mc) ? parseFloat(extRatings.mc).toFixed(0) : null,
            trakt: (extRatings && extRatings.trakt) ? parseFloat(extRatings.trakt).toFixed(1) : null,
            mdblist: (extRatings && extRatings.mdblist) ? parseFloat(extRatings.mdblist).toFixed(1) : null,
            popcorn: (extRatings && extRatings.popcorn) ? parseFloat(extRatings.popcorn).toFixed(0) + '%' : null,
            letterboxd: (extRatings && extRatings.letterboxd) ? (parseFloat(extRatings.letterboxd) * 2).toFixed(1) : null
        };

        container.innerHTML = '';
        order.forEach(function (key) {
            if (available[key]) {
                if (key === 'kp') {
                    container.innerHTML += '<span class="ydesign-rating"><b style="color:#f60; font-weight:800; font-size:1.1em;">Кп</b> ' + available[key] + '</span>';
                } else {
                    var iconUrl = rateIcons[key] || rateIcons.tmdb;
                    container.innerHTML += '<span class="ydesign-rating"><img src="' + iconUrl + '" /> ' + available[key] + '</span>';
                }
            }
        });
    }

    function buildCardCustomDOM(cardEl, data) {
        var el = cardEl[0] || cardEl;
        var activeComp = Lampa.Activity.active() ? Lampa.Activity.active().component : 'main';
        var isHorz = activeComp === 'main'
            ? getSet('ydesign_card_type_main') === 'horizontal'
            : getSet('ydesign_card_type_other') === 'horizontal';

        el.classList.add('ydesign-card');
        el.classList.remove('ydesign-vertical', 'ydesign-horizontal');
        el.classList.add(isHorz ? 'ydesign-horizontal' : 'ydesign-vertical');

        var view = el.querySelector('.card__view');
        if (!view) return;
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

        var type = data.media_type || (data.name ? 'tv' : 'movie');
        if (!data.id) return;

        var bgQuality = isHorz ? getSet('ydesign_backdrop_quality') : getSet('ydesign_poster_quality');
        var initialBg = isHorz
            ? (data.backdrop_path || data.poster_path)
            : (data.poster_path || data.backdrop_path);

        function applyBg(path) {
            if (!path) return;
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                imgLayer.style.backgroundImage = 'url(' + img.src + ')';
                imgLayer.classList.add('loaded');
                getProminentColor(img, function (color) {
                    // Строим тёмный насыщенный градиент
                    var colorRgba = color.replace('rgb', 'rgba').replace(')', ', 0.97)');
                    var colorRgba80 = color.replace('rgb', 'rgba').replace(')', ', 0.80)');
                    view.style.backgroundColor = color;
                    gradientLayer.style.background =
                        'linear-gradient(to top, ' + color + ' 0%, ' + colorRgba + ' 30%, ' + colorRgba80 + ' 55%, transparent 100%)';
                    contentLayer.style.background =
                        'linear-gradient(to top, ' + color + ' 15%, rgba(0,0,0,0.5) 60%, transparent 100%)';
                });
            };
            img.src = 'https://image.tmdb.org/t/p/' + bgQuality + path;
        }

        function buildExtendedCard() {
            fetchExtendedData(data.id, type).then(function (extData) {
                var bgToLoad = initialBg;

                if (extData) {
                    var cleanBg = isHorz ? extData.clean_backdrop : extData.clean_poster;
                    if (cleanBg && cleanBg !== initialBg) {
                        bgToLoad = cleanBg;
                    }
                }

                if (bgToLoad) applyBg(bgToLoad);
                if (!extData) return;

                // Логотип / название
                var logoContainer = document.createElement('div');
                logoContainer.className = 'ydesign-logo-container';

                var titleText = document.createElement('div');
                titleText.className = 'ydesign-text-title ydesign-fallback-text';
                titleText.innerText = data.title || data.name || data.original_title || data.original_name || '';

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

                // Инфо-блок
                var infoWrap = document.createElement('div');
                infoWrap.className = 'ydesign-info-wrap';

                var badgesWrap = document.createElement('div');
                badgesWrap.className = 'ydesign-badges';

                if (data.release_date || data.first_air_date) {
                    var year = String(data.release_date || data.first_air_date).substring(0, 4);
                    if (year && year !== 'unde') {
                        badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-year">' + year + '</span>';
                    }
                }

                if (type === 'tv' && extData.seasons) {
                    var str = 'С:' + extData.seasons + (extData.episodes ? ' Э:' + extData.episodes : '');
                    badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-seasons">' + str + '</span>';
                }

                if (extData.age) {
                    badgesWrap.innerHTML += '<span class="ydesign-badge ydesign-badge-age">' + extData.age + '</span>';
                }

                if (badgesWrap.innerHTML !== '') infoWrap.appendChild(badgesWrap);

                var ratingsWrap = document.createElement('div');
                ratingsWrap.className = 'ydesign-ratings';
                renderRatings(ratingsWrap, data, extData, null);
                infoWrap.appendChild(ratingsWrap);
                contentLayer.appendChild(infoWrap);

                // Подгружаем внешние рейтинги
                fetchExternalRatings(data.id, type).then(function (extRatings) {
                    if (extRatings && Object.keys(extRatings).length > 0) {
                        renderRatings(ratingsWrap, data, extData, extRatings);
                    }
                });

                // Слоган
                var oldSlogan = contentLayer.querySelector('.ydesign-slogan');
                if (oldSlogan) oldSlogan.remove();
                var oldDesc = el.querySelector('.ydesign-desc-under');
                if (oldDesc) oldDesc.remove();

                if (getSet('ydesign_show_slogan')) {
                    var slogan = document.createElement('div');
                    slogan.className = 'ydesign-slogan ydesign-slogan-text';
                    slogan.innerText = extData.tagline ? extData.tagline : ' ';
                    contentLayer.appendChild(slogan);
                }

                // Описание под горизонтальной карточкой
                if (isHorz && getSet('ydesign_show_desc_horz')) {
                    var desc = document.createElement('div');
                    desc.className = 'ydesign-desc-under';
                    desc.innerText = extData.overview ? extData.overview : ' ';
                    el.appendChild(desc);
                }
            });
        }

        if (getSet('ydesign_lazy_load')) {
            LazyLoader.add(el, buildExtendedCard);
        } else {
            buildExtendedCard();
        }
    }

    function injectCSS() {
        var style = document.createElement('style');
        style.id = 'ydesign-styles';
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
                transition: transform 0.2s ease;
                flex: 0 0 auto; cursor: pointer;
            }

            .ydesign-active .card.focus {
                transform: scale(1.05);
                z-index: 10;
            }

            .ydesign-active .card.focus .card__view {
                box-shadow: 0 0 0 3px rgba(255,255,255,0.85), 0 12px 40px rgba(0,0,0,0.95) !important;
            }

            .ydesign-active .card .card__view {
                position: relative; top: 0; left: 0; right: 0; bottom: 0;
                width: 100%; height: 0 !important;
                border-radius: 0.8em !important;
                background-color: #0d0d0d;
                overflow: hidden;
                box-shadow: 0 0 0 3px transparent;
                transition: background-color 0.5s ease, box-shadow 0.2s ease;
            }

            .ydesign-active .card.ydesign-vertical .card__view { padding-bottom: 177.77% !important; }
            .ydesign-active .card.ydesign-horizontal .card__view { padding-bottom: 68.75% !important; }

            @media (min-width: 769px) {
                .ydesign-active .card.ydesign-vertical { width: 18.5vw; height: auto !important; }
                .ydesign-active .card.ydesign-horizontal { width: 31.5vw; height: auto !important; }
            }

            @media (max-width: 768px) {
                .ydesign-active .card.ydesign-vertical { width: 46vw; height: auto !important; }
                .ydesign-active .card.ydesign-horizontal { width: 94vw; height: auto !important; }
            }

            /* Тёмный оверлей поверх изображения для насыщенности */
            .ydesign-dark-overlay {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.28);
                pointer-events: none;
                z-index: 1;
            }

            .ydesign-img-layer {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background-color: #0d0d0d;
                background-image: url('./img/img_load.svg');
                background-size: 30%;
                background-repeat: no-repeat;
                background-position: center center;
                opacity: 1;
                transition: background-image 0.4s ease, background-size 0.4s ease;
            }
            .ydesign-img-layer.loaded {
                background-size: cover;
                background-position: center 20%;
                background-color: transparent;
            }
            .ydesign-horizontal .ydesign-img-layer.loaded { background-position: center center; }

            .ydesign-gradient-layer {
                position: absolute; bottom: 0; left: 0; width: 100%; height: 75%;
                pointer-events: none;
                z-index: 2;
            }

            .ydesign-content-layer {
                position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
                display: flex; flex-direction: column; justify-content: flex-end; align-items: stretch;
                padding: 1.2em 0.8em var(--ydesign-content-pb, 0.8em) 0.8em;
                box-sizing: border-box;
                z-index: 3; pointer-events: none;
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
                object-fit: contain;
                filter: drop-shadow(0 2px 6px rgba(0,0,0,1)) drop-shadow(0 0 12px rgba(0,0,0,0.8));
            }
            .ydesign-text-title {
                width: var(--ydesign-logo-w, 100%);
                max-height: 100%;
                display: flex; align-items: flex-end;
                justify-content: var(--ydesign-align-logo, center);
                font-size: var(--ydesign-title-size, 1.2em);
                font-weight: 800; color: #fff;
                text-align: var(--ydesign-text-logo, center);
                text-shadow: 0 2px 8px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8);
                line-height: 1.25;
                padding-bottom: 0.15em;
            }

            .ydesign-info-wrap {
                display: flex; width: 100%; overflow: hidden;
            }

            .ydesign-vertical .ydesign-info-wrap {
                flex-direction: column;
                align-items: var(--ydesign-align-badges, center);
                gap: var(--ydesign-badge-rows-gap, 0.4em);
            }

            .ydesign-horizontal .ydesign-info-wrap {
                flex-direction: row; flex-wrap: nowrap;
                justify-content: var(--ydesign-align-badges, center);
                align-items: center; gap: 0.4em;
            }

            body.ydesign-badges-one-row .ydesign-vertical .ydesign-info-wrap {
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: var(--ydesign-align-badges, center);
                align-items: center;
                gap: 0.4em;
            }

            .ydesign-horizontal .ydesign-badges, .ydesign-horizontal .ydesign-ratings,
            body.ydesign-badges-one-row .ydesign-vertical .ydesign-badges,
            body.ydesign-badges-one-row .ydesign-vertical .ydesign-ratings {
                width: auto; flex-shrink: 1;
            }

            .ydesign-badges, .ydesign-ratings {
                display: flex; flex-direction: row; flex-wrap: nowrap; white-space: nowrap;
                gap: 0.4em; width: 100%;
                justify-content: var(--ydesign-align-badges, center);
                overflow: hidden; margin-bottom: 0;
            }

            .ydesign-badge {
                display: inline-flex; align-items: center; justify-content: center;
                font-size: var(--ydesign-badge-size, 0.75em);
                font-weight: 700; color: #fff;
                padding: 0.25em 0.4em;
                border: 1px solid rgba(255,255,255,0.65);
                border-radius: 0.3em;
                background: rgba(0,0,0,0.4);
                box-sizing: border-box;
                text-shadow: 0 1px 4px rgba(0,0,0,1);
            }

            .ydesign-rating {
                display: flex; align-items: center; gap: 0.2em;
                font-size: var(--ydesign-rating-size, 0.8em);
                font-weight: 700; color: #fff;
                text-shadow: 0 1px 4px rgba(0,0,0,1);
            }
            .ydesign-rating img {
                width: 1.1em; height: 1.1em; object-fit: contain;
                filter: saturate(var(--ydesign-ratings-saturate, 100%)) drop-shadow(0 1px 3px rgba(0,0,0,1));
            }

            .ydesign-slogan {
                width: 100%;
                font-size: var(--ydesign-slogan-size, 0.85em); color: rgba(255,255,255,0.9);
                text-align: var(--ydesign-text-slogan, center);
                margin-top: var(--ydesign-slogan-padding, 0.3em);
                line-height: 1.4; font-weight: 500;
                text-shadow: 0 2px 6px rgba(0,0,0,1);
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                min-height: calc(var(--ydesign-slogan-size, 0.85em) * 1.4 * 2);
                padding-bottom: 0.2em;
            }

            .ydesign-desc-under {
                position: relative;
                z-index: 10;
                width: 100%;
                font-size: var(--ydesign-desc-size, 0.85em);
                color: rgba(255,255,255,0.7);
                margin-top: 0.5em;
                text-align: left;
                line-height: 1.35;
                text-shadow: 0 1px 4px rgba(0,0,0,1);
                white-space: normal;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                min-height: calc(var(--ydesign-desc-size, 0.85em) * 1.35 * 3);
                padding-bottom: 0.2em;
            }

            body.ydesign-hide-year .ydesign-badge-year { display: none !important; }
            body.ydesign-hide-seasons .ydesign-badge-seasons { display: none !important; }
            body.ydesign-hide-age .ydesign-badge-age { display: none !important; }
            body.ydesign-hide-slogan .ydesign-slogan-text { display: none !important; }

            body[data-ydesign-logo="text"] .ydesign-logo-img { display: none !important; }
            body[data-ydesign-logo="text"] .ydesign-fallback-text { display: flex !important; }
            body[data-ydesign-logo="logo"] .ydesign-fallback-text { display: none !important; }
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
        document.documentElement.style.setProperty('--ydesign-card-gap', getSet('ydesign_card_gap') + 'em');
        document.documentElement.style.setProperty('--ydesign-badge-rows-gap', getSet('ydesign_badge_rows_gap') + 'em');
        document.documentElement.style.setProperty('--ydesign-content-pb', getSet('ydesign_content_pb') + 'em');
        document.documentElement.style.setProperty('--ydesign-slogan-padding', getSet('ydesign_slogan_padding') + 'em');
        document.documentElement.style.setProperty('--ydesign-logo-mb', getSet('ydesign_logo_mb') + 'em');
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
        document.body.classList.toggle('ydesign-hide-age', !getSet('ydesign_show_age'));
        document.body.classList.toggle('ydesign-hide-slogan', !getSet('ydesign_show_slogan'));
        document.body.classList.toggle('ydesign-badges-one-row', getSet('ydesign_badges_one_row'));
    }

    function createSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;

        Lampa.SettingsApi.addComponent({
            component: 'ydesign',
            name: 'YDesign',
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
                    if (key && key.startsWith('ydesign_cache_')) keysToRemove.push(key);
                }
                keysToRemove.forEach(function (k) { localStorage.removeItem(k); });
                Lampa.Noty.show('Кеш плагина очищен (' + keysToRemove.length + ' записей)');
            }
        });

        var qualities = {
            'w92': 'w92', 'w154': 'w154', 'w200': 'w200',
            'w300': 'w300', 'w500': 'w500', 'w780': 'w780', 'original': 'Оригинал'
        };

        var textSizes = {};
        for (var i = 5; i <= 30; i++) { var v = (i / 10).toFixed(1); textSizes[v] = v; }

        var gaps = {};
        for (var i = 0; i <= 15; i++) { gaps[(i / 10).toFixed(1)] = (i / 10).toFixed(1) + ' em'; }

        var logoSizes = {};
        for (var i = 1; i <= 34; i += 3) logoSizes[i] = i + '%';
        logoSizes[35] = '35%';
        [40, 50, 60, 70, 80, 90, 100].forEach(function (v) { logoSizes[v] = v + '%'; });

        var logoMbGaps = {};
        for (var i = -10; i <= 50; i += 5) {
            var vv = (i / 10).toFixed(1);
            logoMbGaps[vv] = vv + ' em';
        }

        var saturates = {
            '0': '0% (Чёрно-белые)',
            '25': '25%',
            '75': '75%',
            '100': '100% (Цветные)',
            '150': '150% (Яркие)'
        };

        var aligns = { 'left': 'Слева', 'center': 'По центру', 'right': 'Справа' };

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_lazy_load', type: 'trigger', default: DefaultSettings.ydesign_lazy_load }, field: { name: 'Ленивая загрузка', description: 'Загружать данные (лого, рейтинги) только при появлении карточки на экране' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_type_main', type: 'select', values: { 'vertical': 'Вертикальные (9:16)', 'horizontal': 'Горизонтальные (16:11)' }, default: DefaultSettings.ydesign_card_type_main }, field: { name: 'Тип карточек (Главная)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_card_type_other', type: 'select', values: { 'vertical': 'Вертикальные (9:16)', 'horizontal': 'Горизонтальные (16:11)' }, default: DefaultSettings.ydesign_card_type_other }, field: { name: 'Тип карточек (Другие страницы)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_badges_one_row', type: 'trigger', default: DefaultSettings.ydesign_badges_one_row }, field: { name: 'Все бейджи в 1 ряд (Вертикальные)', description: 'Рейтинги и бейджи будут в одну строку' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_desc_horz', type: 'trigger', default: DefaultSettings.ydesign_show_desc_horz }, field: { name: 'Описание под карточкой (Горизонтальные)' } });
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

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_type', type: 'select', values: { 'logo': 'Логотип (изображение)', 'text': 'Текст' }, default: DefaultSettings.ydesign_logo_type }, field: { name: 'Отображение названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_lang', type: 'select', values: { 'ru': 'Только Русский', 'ru_en': 'Рус → Англ → Ориг', 'uk': 'Только Украинский', 'uk_en': 'Укр → Англ → Ориг', 'en_orig': 'Англ → Ориг' }, default: DefaultSettings.ydesign_lang }, field: { name: 'Язык логотипа/названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_slogan_lang', type: 'select', values: { 'ru': 'Только Русский', 'ru_en': 'Рус (Англ. если нет)', 'uk': 'Только Украинский', 'uk_en': 'Укр (Англ. если нет)', 'en': 'Только Английский' }, default: DefaultSettings.ydesign_slogan_lang }, field: { name: 'Язык слогана' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_desc_lang', type: 'select', values: { 'ru': 'Только Русский', 'ru_en': 'Рус (Англ. если нет)', 'uk': 'Только Украинский', 'uk_en': 'Укр (Англ. если нет)', 'en': 'Только Английский' }, default: DefaultSettings.ydesign_desc_lang }, field: { name: 'Язык описания под карточкой' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_poster_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_poster_quality }, field: { name: 'Качество постеров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_backdrop_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_backdrop_quality }, field: { name: 'Качество бэкдропов' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_logo_quality }, field: { name: 'Качество логотипов' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_max_h', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_logo_max_h }, field: { name: 'Макс. высота логотипа/текста' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_logo_max_w', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_logo_max_w }, field: { name: 'Макс. ширина логотипа/текста' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_title_size', type: 'select', values: textSizes, default: DefaultSettings.ydesign_text_title_size }, field: { name: 'Размер текста названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_slogan_size', type: 'select', values: textSizes, default: DefaultSettings.ydesign_text_slogan_size }, field: { name: 'Размер текста слогана' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_badge_size', type: 'select', values: textSizes, default: DefaultSettings.ydesign_text_badge_size }, field: { name: 'Размер текста бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_text_rating_size', type: 'select', values: textSizes, default: DefaultSettings.ydesign_text_rating_size }, field: { name: 'Размер текста рейтингов' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_year', type: 'trigger', default: DefaultSettings.ydesign_show_year }, field: { name: 'Показывать Год' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_seasons', type: 'trigger', default: DefaultSettings.ydesign_show_seasons }, field: { name: 'Показывать Сезоны/Серии' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_age', type: 'trigger', default: DefaultSettings.ydesign_show_age }, field: { name: 'Показывать возрастной рейтинг' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign', param: { name: 'ydesign_show_slogan', type: 'trigger', default: DefaultSettings.ydesign_show_slogan }, field: { name: 'Показывать слоган' } });

        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_omdb_key_btn', type: 'button' },
            field: {
                name: 'OMDB API Key',
                description: getSet('ydesign_omdb_key') ? 'Установлен' : 'Не установлен'
            },
            onChange: function () {
                Lampa.Input.edit({ title: 'OMDB API Key', value: getSet('ydesign_omdb_key'), free: true, nosave: true }, function (new_val) {
                    if (new_val !== undefined) {
                        Lampa.Storage.set('ydesign_omdb_key', new_val.trim());
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
                Lampa.Input.edit({ title: 'MDBList API Key', value: getSet('ydesign_mdblist_key'), free: true, nosave: true }, function (new_val) {
                    if (new_val !== undefined) {
                        Lampa.Storage.set('ydesign_mdblist_key', new_val.trim());
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
                    free: true, nosave: true
                }, function (new_val) {
                    if (new_val !== undefined) {
                        Lampa.Storage.set('ydesign_ratings_order', new_val.trim().toLowerCase());
                        Lampa.Settings.update();
                    }
                });
            }
        });

        Lampa.Settings.listener.follow('change', function (e) {
            if (e.name.indexOf('ydesign_') !== -1) {
                applyDynamicCSS();
                if (['ydesign_lang', 'ydesign_slogan_lang', 'ydesign_desc_lang',
                    'ydesign_logo_type', 'ydesign_card_type_main',
                    'ydesign_card_type_other', 'ydesign_show_desc_horz'].indexOf(e.name) !== -1) {
                    document.querySelectorAll('.ydesign-card').forEach(function (c) {
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

            if (this.data && this.data.id &&
                (this.data.media_type === 'movie' || this.data.media_type === 'tv' ||
                 this.data.name || this.data.title)) {
                var el = this.html[0] || this.html;
                if (!el._ydesign_built) {
                    el._ydesign_built = true;
                    el._ydesign_data = this.data;
                    buildCardCustomDOM(el, this.data);
                }
            }
        };
    }

    function init() {
        injectCSS();
        applyDynamicCSS();
        createSettings();
        overrideCards();

        if (window.appready && Lampa.Activity && Lampa.Activity.active()) {
            setTimeout(function () {
                var act = Lampa.Activity.active();
                if (act && act.activity && act.activity.render) {
                    act.activity.render().find('.card').trigger('visible');
                }
            }, 100);
        }
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();