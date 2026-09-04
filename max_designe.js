(function () {
    'use strict';

    // Плагин: MaxDesigne
    // Автор: MaksTV

    if (window.YDesignLoaded) return;
    window.YDesignLoaded = true;

    // =========================================================================
    // 1. КОНФИГУРАЦИЯ, АВТОР И ВЕКТОРНЫЕ ИКОНКИ РЕЙТИНГОВ
    // =========================================================================
    var CONFIG = {
        name: 'MaxDesigne',
        author: 'MaksTV',
        cacheTime: 7 * 24 * 60 * 60 * 1000,
        tmdbKey: function () {
            try {
                return (window.Lampa && Lampa.TMDB && Lampa.TMDB.key) ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96';
            } catch (e) {
                return '4ef0d7355d9ffb5151e987764708ce96';
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
        ydesign_card_type_main: 'vertical',
        ydesign_card_type_other: 'vertical',
        ydesign_grid_items_v: '5',
        ydesign_grid_items_h: '3',
        ydesign_card_gap: '0.8',
        ydesign_lazy_load: false,

        ydesign_badge_shape: 'pill',
        ydesign_glass_pill_bg: true,
        ydesign_badge_darken: true,
        ydesign_badge_darken_level: '0.35',
        ydesign_color_age: true,
        ydesign_color_ua: true,
        ydesign_border_year: true,
        ydesign_border_age: true,
        ydesign_border_seasons: true,
        ydesign_border_ua: true,
        ydesign_border_genres: true,
        ydesign_border_ratings: true,
        ydesign_ratings_order: 'tmdb, popcorn, mc, ',
        ydesign_ratings_saturate: '100',
        ydesign_poster_saturation: '1.35',
        ydesign_poster_contrast: '1.10',
        ydesign_poster_ratio: '2:3',
        ydesign_preset: 'bright',

        // Шрифти
        ydesign_font: 'golos-montserrat',
        ydesign_font_family: '',
        ydesign_font_css: '',

        // Верхние бейджи
        ydesign_notch_show: true,
        ydesign_notch_bg: true,
        ydesign_notch_border: true,
        ydesign_notch_uniform_size: true,
        ydesign_notch_size: '0.5',
        ydesign_notch_type_size: '0.5',
        ydesign_notch_standard_size: '0.5',
        ydesign_notch_custom_size: '0.5',
        ydesign_notch_show_type: true,
        ydesign_notch_show_standard: true,
        ydesign_notch_show_custom: true,
        ydesign_notch_std_monochrome: false,

        ydesign_logo_type: 'logo',
        ydesign_lang: 'ru',
        ydesign_slogan_lang: 'ru',
        ydesign_desc_lang: 'ru',
        ydesign_add_title_lang: 'auto',
        ydesign_poster_quality: 'w780',
        ydesign_backdrop_quality: 'w500',
        ydesign_logo_quality: 'w500',

        // Вертикальни
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
        ydesign_v_uniform_v_gaps: false,
        ydesign_v_uniform_v_gap_val: '0.05',
        ydesign_v_badges_gap: '0.15',
        ydesign_v_badge_rows_gap: '0.3',
        ydesign_v_genres_gap: '-0.35',
        ydesign_v_content_pb: '0.3',
        ydesign_v_slogan_padding: '0.3',
        ydesign_v_logo_mb: '1.0',
        ydesign_v_add_title_mb: '0.3',

        // Горизонильни
        ydesign_h_logo_max_h: '35',
        ydesign_h_logo_max_w: '80',
        ydesign_h_title_size: '1.8',
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
        ydesign_h_uniform_v_gaps: false,
        ydesign_h_uniform_v_gap_val: '0.00',
        ydesign_h_badges_gap: '0.15',
        ydesign_h_badge_rows_gap: '-0.3',
        ydesign_h_genres_gap: '0.0',
        ydesign_h_content_pb: '0.3',
        ydesign_h_slogan_padding: '0.3',
        ydesign_h_logo_mb: '1.2',
        ydesign_h_add_title_mb: '0.3',

        // Сериї
        ydesign_series_redesign: true,
        ydesign_series_cards: '4',
        ydesign_hide_left_column: true,
        ydesign_series_badge_size: '0.8',
        ydesign_series_title_size: '0.9',
        ydesign_series_badge_shape: 'pill',
        ydesign_series_glass_pill: true,
        ydesign_series_border_badges: false,
        ydesign_series_show_date: true,
        ydesign_series_show_voice: true,
        ydesign_series_show_rate: true,
        ydesign_series_show_time: true,

        ydesign_omdb_key: '',
        ydesign_mdblist_key: ''
    };

    function getSet(key, fallbackKey) {
        try {
            if (!window.Lampa || !Lampa.Storage) {
                if (DefaultSettings.hasOwnProperty(key)) return DefaultSettings[key];
                if (fallbackKey && DefaultSettings.hasOwnProperty(fallbackKey)) return DefaultSettings[fallbackKey];
                return '';
            }
            var val = Lampa.Storage.get(key);
            if (val !== null && val !== undefined && val !== '' && val !== 'undefined') return val;
            if (fallbackKey) {
                var fval = Lampa.Storage.get(fallbackKey);
                if (fval !== null && fval !== undefined && fval !== '' && fval !== 'undefined') return fval;
            }
        } catch (e) {}
        if (DefaultSettings.hasOwnProperty(key)) return DefaultSettings[key];
        if (fallbackKey && DefaultSettings.hasOwnProperty(fallbackKey)) return DefaultSettings[fallbackKey];
        return '';
    }

    // =========================================================================
    // 3. РОЗПІЗНАВАННЯ ТИПУ КАРТОК ТА МЕДІА
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

    function isTvMedia(movie, cardEl, extData) {
        if (!movie && !cardEl && !extData) return false;

        if (extData) {
            if (extData.seasons || extData.se_str || extData.number_of_seasons) return true;
            if (extData.type === 'tv' || extData.media_type === 'tv') return true;
            if (extData.type === 'movie' || extData.media_type === 'movie') return false;
        }

        if (movie) {
            if (movie.media_type === 'tv' || movie.type === 'tv' || movie.type === 'tv_series') return true;
            if (movie.media_type === 'movie' || movie.type === 'movie') return false;
            if (movie.number_of_seasons !== undefined && movie.number_of_seasons !== null && movie.number_of_seasons > 0) return true;
            if (movie.seasons && movie.seasons.length > 0) return true;
            if (movie.number_of_episodes !== undefined && movie.number_of_episodes !== null && movie.number_of_episodes > 0) return true;

            // TMDB специфика: сериали завжди мають first_air_date или original_name, фильми - николи
            if (movie.first_air_date) return true;
            if (movie.original_name) return true;
            if (movie.name && !movie.title) return true;
        }

        if (cardEl) {
            if (cardEl.classList) {
                if (cardEl.classList.contains('card--tv') || cardEl.classList.contains('tv')) return true;
                if (cardEl.classList.contains('card--movie') || cardEl.classList.contains('movie')) return false;
            }
            if (cardEl.querySelector) {
                var typeDiv = cardEl.querySelector('.card__type');
                if (typeDiv) {
                    var txt = (typeDiv.innerText || typeDiv.textContent || '').trim().toUpperCase();
                    if (txt === 'TV' || txt === 'СЕРІАЛ' || txt === 'СЕРИАЛ') return true;
                    if (txt === 'MOV' || txt === 'ФІЛЬМ' || txt === 'ФИЛЬМ') return false;
                }
            }
        }

        return false;
    }

    // =========================================================================
    // 3.1. ТИПОГРАФІКА ТА ШРИФТИ (NETFLIX UI)
    // =========================================================================
    var YDESIGN_FONT_FALLBACK = '"SegoeUI","Helvetica Neue",Helvetica,Arial,sans-serif';

    var YDESIGN_FONTS = {
        'golos-montserrat': {
            css: 'family=Golos+Text:wght@400..900&family=Montserrat:wght@600..900',
            ui: '"Golos Text"',
            display: '"Montserrat"',
            numeric: '"Montserrat"',
            caps: true
        },
        'golos': {
            css: 'family=Golos+Text:wght@400..900',
            ui: '"Golos Text"',
            display: '"Golos Text"',
            numeric: '"Golos Text"',
            caps: false
        },
        'manrope': {
            css: 'family=Manrope:wght@400..800',
            ui: '"Manrope"',
            display: '"Manrope"',
            numeric: '"Manrope"',
            caps: false
        },
        'montserrat': {
            css: 'family=Montserrat:wght@400..900',
            ui: '"Montserrat"',
            display: '"Montserrat"',
            numeric: '"Montserrat"',
            caps: true
        },
        'inter': {
            css: 'family=Inter:wght@400..900',
            ui: '"Inter"',
            display: '"Inter"',
            numeric: '"Inter"',
            caps: false
        },
        'inter-montserrat': {
            css: 'family=Inter:wght@400..900&family=Montserrat:wght@600..900',
            ui: '"Inter"',
            display: '"Montserrat"',
            numeric: '"Montserrat"',
            caps: true
        }
    };

    function fontActive() {
        var key = '' + getSet('ydesign_font');
        if (key === 'off') return null;

        if (key === 'custom') {
            var family = ('' + getSet('ydesign_font_family')).trim();
            if (!family) return null;
            var quoted = /[",]/.test(family) ? family : '"' + family + '"';
            return {
                url: ('' + getSet('ydesign_font_css')).trim(),
                ui: quoted,
                display: quoted,
                numeric: quoted,
                caps: false
            };
        }

        var preset = YDESIGN_FONTS[key] || YDESIGN_FONTS['golos-montserrat'];
        return {
            url: 'https://fonts.googleapis.com/css2?' + preset.css + '&display=swap',
            ui: preset.ui,
            display: preset.display,
            numeric: preset.numeric,
            caps: preset.caps
        };
    }

    function fontLink(url) {
        var link = document.getElementById('ydesign-font-link');
        if (!url) {
            if (link && link.parentNode) link.parentNode.removeChild(link);
            return;
        }
        if (!link) {
            link = document.createElement('link');
            link.id = 'ydesign-font-link';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.onerror = function () {
                console.log('YDesign', 'Font load failed:', url);
            };
            document.head.appendChild(link);
        }
        if (link.getAttribute('href') !== url) link.setAttribute('href', url);
    }

    function cssFont(font) {
        var ui   = font.ui + ',' + YDESIGN_FONT_FALLBACK;
        var disp = font.display + ',' + font.ui + ',' + YDESIGN_FONT_FALLBACK;
        var num  = font.numeric + ',Arial,Helvetica,sans-serif';

        var rules = [
            'body.ydesign--font, body.ydesign--font input, body.ydesign--font textarea, body.ydesign--font button, body.ydesign--font .simple-keyboard-input { font-family: ' + ui + ' !important; }',

            'body.ydesign--font .items-line__title,',
            'body.ydesign--font .full-start-new__title,',
            'body.ydesign--font .full-start__title,',
            'body.ydesign--font .settings__head,',
            'body.ydesign--font .search-box__title,',
            'body.ydesign--font .card__title,',
            'body.ydesign--font .ydesign-text-title,',
            'body.ydesign--font .nfx-bb__title,',
            'body.ydesign--font .nfx-row__title,',
            'body.ydesign--font .empty__title { font-family: ' + disp + ' !important; }',

            'body.ydesign--font .nfx-card__rank > span { font-family: ' + num + ' !important; }',
            'body.ydesign--font .items-line__title, body.ydesign--font .nfx-row__title { font-weight: 800; letter-spacing: -.005em; }',
            'body.ydesign--font .full-start-new__title, body.ydesign--font .full-start__title { font-weight: 800; }',
            'body.ydesign--font .ydesign-card-notch { font-family: ' + ui + ' !important; }'
        ];

        if (font.caps) {
            rules.push('body.ydesign--font .full-start-new__title, body.ydesign--font .full-start__title, body.ydesign--font .nfx-bb__title { letter-spacing: .015em; }');
        }

        return rules.join('\n');
    }

    function fontApply() {
        var font = fontActive();
        var styleEl = document.getElementById('ydesign-font-css');

        if (!font) {
            fontLink('');
            if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
            document.body.classList.remove('ydesign--font');
            return;
        }

        fontLink(font.url);

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'ydesign-font-css';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = cssFont(font);
        document.body.classList.add('ydesign--font');
    }

    // =========================================================================
    // 3.2. ВЕРХНІЙ БЛОК-ВИРІЗ КАРТКИ ("ЧОЛКА") ТА МІТКИ
    // =========================================================================
    function getMediaTypeName(data, cardEl, extData) {
        var isTv = isTvMedia(data, cardEl, extData) || (data && (data.media_type === 'tv' || data.type === 'tv'));
        var lang = (window.Lampa && Lampa.Storage) ? (Lampa.Storage.get('language', 'uk') || 'uk') : 'uk';
        if (lang === 'en') return isTv ? 'Series' : 'Movie';
        if (lang === 'ru') return isTv ? 'Сериал' : 'Фильм';
        return isTv ? 'Сериал' : 'Фильм';
    }

    function getCustomFavTags(data, cardEl) {
        if (!data) return [];
        var tags = [];
        var seen = {};

        function addTag(name) {
            if (!name) return;
            var trimmed = String(name).trim();
            if (trimmed && !seen[trimmed]) {
                seen[trimmed] = true;
                tags.push(trimmed);
            }
        }

        // 1. Ситуси и метки перегляду Lampa (look, viewed, scheduled, continued, thrown)
        try {
            if (window.Lampa && Lampa.Favorite && Lampa.Favorite.check) {
                var favStatus = Lampa.Favorite.check(data) || {};
                var markKeys = ['look', 'viewed', 'scheduled', 'continued', 'thrown'];
                var markDict = {
                    look: 'Смотрю',
                    viewed: 'Переглянуто',
                    scheduled: 'Заплановано',
                    continued: 'Продовжую',
                    thrown: 'Кинуто'
                };
                for (var i = 0; i < markKeys.length; i++) {
                    var mk = markKeys[i];
                    if (favStatus[mk]) {
                        var markTitle = (window.Lampa && Lampa.Lang && Lampa.Lang.translate) ? Lampa.Lang.translate('title_' + mk) : '';
                        if (!markTitle || markTitle.indexOf('title_') === 0) {
                            markTitle = markDict[mk] || mk;
                        }
                        addTag(markTitle);
                    }
                }
            }
        } catch (e) {}

        // 2. Списки и метки з розширення custom-favs
        try {
            var cf = (window.Lampa && Lampa.Storage) ? Lampa.Storage.get('custom_favorite', {}) : {};
            if (cf && cf.customTypes && data.id) {
                var systemFields = ['card', 'migrationVersion'];
                var dataIdStr = String(data.id);
                for (var typeName in cf.customTypes) {
                    if (systemFields.indexOf(typeName) !== -1) continue;
                    var uid = cf.customTypes[typeName];
                    var list = cf[uid];
                    if (Array.isArray(list)) {
                        for (var j = 0; j < list.length; j++) {
                            if (String(list[j]) === dataIdStr) {
                                addTag(typeName);
                                break;
                            }
                        }
                    }
                }
            }
        } catch (e) {}

        // 3. Якщо у картци вже був наявний елемент .card__marker
        try {
            if (cardEl && cardEl.querySelector) {
                var markerSpan = cardEl.querySelector('.card__marker span');
                if (markerSpan && markerSpan.innerText) {
                    addTag(markerSpan.innerText);
                }
            }
        } catch (e) {}

        return tags;
    }

    function getStandardFavoriteIconsHtml(data) {
        if (!data || !data.id) return '';
        var iconsHtml = '';
        try {
            var favStatus = (window.Lampa && Lampa.Favorite && Lampa.Favorite.check) ? Lampa.Favorite.check(data) : {};
            var isWatched = false;
            try {
                if (window.Lampa && Lampa.Timeline && Lampa.Timeline.watched) {
                    isWatched = Lampa.Timeline.watched(data);
                }
            } catch (e) {}

            // 1. Закладки (book)
            if (favStatus.book) {
                iconsHtml += '<svg class="ydesign-notch-icon ydesign-notch-icon-book" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>';
            }
            // 2. Нравится (like)
            if (favStatus.like) {
                iconsHtml += '<svg class="ydesign-notch-icon ydesign-notch-icon-like" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
            }
            // 3. Позже (wath)
            if (favStatus.wath) {
                iconsHtml += '<svg class="ydesign-notch-icon ydesign-notch-icon-wath" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 13H11V7h1.5v6.2l3.75 2.25-.75 1.23-4-2.48z"/></svg>';
            }
            // 4. История перегляду (history / watched)
            if (favStatus.history || isWatched) {
                iconsHtml += '<svg class="ydesign-notch-icon ydesign-notch-icon-history" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>';
            }
        } catch (e) {}

        if (iconsHtml) {
            var isMono = !!getSet('ydesign_notch_std_monochrome');
            return '<span class="ydesign-notch-std-list' + (isMono ? ' ydesign-notch-mono' : '') + '">' + iconsHtml + '</span>';
        }
        return '';
    }

    function renderCardNotchContent(data, cardEl, extData) {
        if (!data || !getSet('ydesign_notch_show')) return '';

        var html = '';

        // 1-а група: Тип медиа (Фильм или Сериал)
        if (getSet('ydesign_notch_show_type')) {
            var typeName = getMediaTypeName(data, cardEl, extData);
            if (typeName) {
                html += '<span class="ydesign-notch-type">' + typeName + '</span>';
            }
        }

        // 2-а група: Синдартни метки (закладки, подобається, пизнише, история)
        if (getSet('ydesign_notch_show_standard')) {
            var stdIcons = getStandardFavoriteIconsHtml(data);
            if (stdIcons) {
                html += stdIcons;
            }
        }

        // 3-я група: Кастомни метки и ситуси перегляду (Смотрю, Переглянуто, custom-favs)
        if (getSet('ydesign_notch_show_custom')) {
            var customTags = getCustomFavTags(data, cardEl);
            if (customTags && customTags.length > 0) {
                customTags.forEach(function (tag) {
                    html += '<span class="ydesign-notch-custom">' + tag + '</span>';
                });
            }
        }

        return html;
    }

    function updateCardNotch(cardEl, data, extData) {
        if (!cardEl) return;
        var view = cardEl.querySelector ? cardEl.querySelector('.card__view') : null;
        if (!view) return;

        var notchEl = view.querySelector('.ydesign-card-notch');
        if (!getSet('ydesign_notch_show')) {
            if (notchEl) notchEl.style.display = 'none';
            return;
        }

        var contentHtml = renderCardNotchContent(data, cardEl, extData);
        if (!contentHtml) {
            if (notchEl) {
                notchEl.innerHTML = '';
                notchEl.style.display = 'none';
            }
            return;
        }

        if (!notchEl) {
            notchEl = document.createElement('div');
            notchEl.className = 'ydesign-card-notch';
            view.appendChild(notchEl);
        }

        notchEl.innerHTML = contentHtml;
        notchEl.style.display = '';
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
    // 5. ДОМІНАНТНИЙ КОЛІР
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
    // 6. ЛІНИВЕ ЗАВАНТАЖЕННЯ
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
    // 7. API ТА ДАНІ TMDB
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
        var langPref = getSet('ydesign_lang');
        var sloganLang = getSet('ydesign_slogan_lang');
        var descLang = getSet('ydesign_desc_lang');

        var cacheKey = 'ext_' + type + '_' + id + '_' + langPref + '_' + sloganLang + '_' + descLang + '_v5';
        var cached = ApiCache.get(cacheKey);
        if (cached) return Promise.resolve(cached);

        return new Promise(function (resolve) {
            var langQuery = (sloganLang === 'uk' || descLang === 'uk' || langPref === 'uk' || langPref === 'uk_en') ? 'uk-UA' : 'ru-RU';
            var url = 'https://api.themoviedb.org/3/' + type + '/' + id +
                '?api_key=' + CONFIG.tmdbKey() +
                '&language=' + langQuery +
                '&append_to_response=images,release_dates,content_ratings' +
                '&include_image_language=ru,uk,en,null';

            $.ajax({
                url: url,
                timeout: 4500,
                success: function(data) {
                    var enData = null;
                    var needEn = false;
                    if (sloganLang === 'en' || descLang === 'en' || langPref === 'en_orig') needEn = true;
                    if ((sloganLang === 'uk_en' || sloganLang === 'ru') && (!data.tagline || !data.tagline.trim())) needEn = true;
                    if ((descLang === 'uk_en' || descLang === 'ru') && (!data.overview || !data.overview.trim())) needEn = true;

                    function processData() {
                        var finalTagline = '';
                        if (sloganLang === 'uk' || sloganLang === 'ru') finalTagline = data.tagline || '';
                        else if (sloganLang === 'en') finalTagline = enData ? enData.tagline : '';
                        else finalTagline = data.tagline || (enData ? enData.tagline : '');

                        var finalOverview = '';
                        if (descLang === 'uk' || descLang === 'ru') finalOverview = data.overview || '';
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
                            title_uk: data.title || data.name || '',
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
                            if (langPref === 'uk' || langPref === 'ru') {
                                var ukArr = logos.filter(function (l) { return l.iso_639_1 === langPref; });
                                logo = ukArr.length > 0 ? ukArr[0] : null;
                            } else if (langPref === 'uk_en') {
                                var ukArr2 = logos.filter(function (l) { return l.iso_639_1 === 'uk'; });
                                var enArr2 = logos.filter(function (l) { return l.iso_639_1 === 'en'; });
                                logo = ukArr2.length > 0 ? ukArr2[0] : (enArr2.length > 0 ? enArr2[0] : null);
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
    // 8. РЕНДЕР БЕЙДЖІВ ТА РЕЙТИНГІВ
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
    // 9. СТВОРЕННЯ КАРТОК ФІЛЬМІВ
    // =========================================================================
    function buildCardCustomDOM(cardHtml, data) {
        var el = cardHtml[0] || cardHtml;
        var isMain = el._ydesign_isMain !== undefined ? el._ydesign_isMain : (Lampa.Activity.active() ? Lampa.Activity.active().component === 'main' : true);
        var isHorz = isMain ? getSet('ydesign_card_type_main') === 'horizontal' : getSet('ydesign_card_type_other') === 'horizontal';

        el.classList.add('ydesign-card');
        el.classList.remove('ydesign-vertical', 'ydesign-horizontal');
        el.classList.add(isHorz ? 'ydesign-horizontal' : 'ydesign-vertical');

        var type = isTvMedia(data, el) ? 'tv' : (data.media_type || 'movie');
        if (!data.media_type) data.media_type = type;
        if (!data.id) return;

        var prefix = isHorz ? 'ydesign_h_' : 'ydesign_v_';

        el._ydesign_updateNotch = function () {
            updateCardNotch(el, data, el._ydesign_extData);
        };

        var buildExtendedCard = function () {
            var view = el.querySelector('.card__view');
            if (!view) return;
            view.innerHTML = '';

            var imgLayer = document.createElement('div'); imgLayer.className = 'ydesign-img-layer';
            var gradientLayer = document.createElement('div'); gradientLayer.className = 'ydesign-gradient-layer';
            var contentLayer = document.createElement('div'); contentLayer.className = 'ydesign-content-layer';

            view.appendChild(imgLayer);
            view.appendChild(gradientLayer);
            view.appendChild(contentLayer);
            updateCardNotch(el, data, el._ydesign_extData);

            var bgQuality = isHorz ? getSet('ydesign_backdrop_quality') : getSet('ydesign_poster_quality');

            var applyBg = function (path) {
                if (!path) return;
                var fullUrl = 'https://image.tmdb.org/t/p/' + bgQuality + path;
                if (el._ydesign_bg_applied === fullUrl) return;
                el._ydesign_bg_applied = fullUrl;

                getProminentColorAsync(path).then(function (color) {
                    if (color) {
                        view.style.backgroundColor = color;
                        var rgba95 = color.replace('rgb', 'rgba').replace(')', ', 0.95)');
                        gradientLayer.style.background = 'linear-gradient(to top, ' + color + ' 0%, ' + rgba95 + ' 45%, transparent 100%)';
                        contentLayer.style.background = 'linear-gradient(to top, ' + color + ' 10%, transparent 100%)';
                    }

                    var img = new Image();
                    img.onload = function () {
                        imgLayer.style.setProperty('--loaded-bg', 'url(' + fullUrl + ')');
                        imgLayer.classList.add('loaded');
                    };
                    img.src = fullUrl;
                });
            };

            fetchExtendedData(data.id, type).then(function (extData) {
                if (extData) {
                    el._ydesign_extData = extData;
                    updateCardNotch(el, data, extData);
                }
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
                    logoImg.src = 'https://image.tmdb.org/t/p/' + getSet('ydesign_logo_quality') + extData.logo;
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
                    var ukT = extData.title_uk || mainTitle;
                    var enT = extData.title_en || data.original_title || data.original_name;

                    if (addTitleLang === 'uk') uTitle = ukT;
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

                var hideOverflowingBadges = function() {
                    if (!contentLayer || !contentLayer.isConnected) return;
                    var containers = contentLayer.querySelectorAll('.ydesign-info-wrap, .ydesign-info-wrap-2, .ydesign-badges, .ydesign-genres, .ydesign-ratings');
                    for (var c = 0; c < containers.length; c++) {
                        var cont = containers[c];
                        var children = cont.children;
                        if (children.length > 1) {
                            var style = window.getComputedStyle(cont);
                            if (style.flexDirection !== 'row') continue;
                            var firstTop = children[0].offsetTop;
                            for (var i = 1; i < children.length; i++) {
                                if (children[i].offsetTop > firstTop + 12) {
                                    children[i].style.opacity = '0';
                                    children[i].style.pointerEvents = 'none';
                                } else {
                                    children[i].style.opacity = '1';
                                    children[i].style.pointerEvents = 'auto';
                                }
                            }
                        }
                    }
                };

                if (typeof ResizeObserver !== 'undefined') {
                    var ro = new ResizeObserver(hideOverflowingBadges);
                    ro.observe(contentLayer);
                }
                setTimeout(hideOverflowingBadges, 150);
                setTimeout(hideOverflowingBadges, 800);
            });
        };

        if (getSet('ydesign_lazy_load')) {
            LazyLoader.add(el, buildExtendedCard);
        } else {
            buildExtendedCard();
        }
    }

    // =========================================================================
    // 10. CSS СТИЛІ
    // =========================================================================
    function injectCSS() {
        var style = document.getElementById('ydesign-style-block');
        if (!style) {
            style = document.createElement('style');
            style.id = 'ydesign-style-block';
            document.head.appendChild(style);
        }

        style.innerHTML = [
            ".ydesign-active .ydesign-card .card__title,",
            ".ydesign-active .ydesign-card .card__age,",
            ".ydesign-active .ydesign-card .card__vote { display: none !important; }",
            "",
            ".ydesign-active .items-line:not(.vinyl-line) .items-cards,",
            ".ydesign-active .items-line:not(.vinyl-line) .scroll__body {",
            "    display: flex; flex-wrap: nowrap; ",
            "    gap: var(--ydesign-card-gap, 0.8em); ",
            "    padding-bottom: 0; ",
            "}",
            "",
            ".ydesign-active { --ydesign-poster-saturation: " + getSet('ydesign_poster_saturation') + "; --ydesign-poster-contrast: " + getSet('ydesign_poster_contrast') + "; }",
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
            "/* ВИДІЛЕННЯ КАРТКИ БЕЗ ЧОРНОЇ ТІНІ */",
            ".ydesign-active .ydesign-card.focus {",
            "    transform: scale(1.045) translateZ(0); ",
            "    z-index: 20;",
            "    box-shadow: none !important;",
            "}",
            "",
            ".ydesign-active .ydesign-card.focus .card__view {",
            "    box-shadow: 0 0 0 4px #ffffff !important;",
            "}",
            "",
            "body.is--touch .ydesign-active .ydesign-card.focus {",
            "    transform: none !important; ",
            "}",
            "body.is--touch .ydesign-active .ydesign-card.focus .card__view {",
            "    box-shadow: none !important;",
            "}",
            "",
            ".ydesign-active .ydesign-card .card__view {",
            "    position: relative; top: 0; left: 0; right: 0; bottom: 0;",
            "    width: 100%; height: 0 !important;",
            "    border-radius: 0.85em !important;",
            "    background-color: #1a1a1a; ",
            "    overflow: hidden;",
            "    box-shadow: 0 0 0 4px transparent;",
            "    transition: background-color 0.4s ease, box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1);",
            "}",
            "",
            ".ydesign-active .ydesign-card.ydesign-vertical .card__view { padding-bottom: 150% !important; } ",
            ".ydesign-active .ydesign-card.ydesign-horizontal .card__view { padding-bottom: 68.75% !important; } ",
            "",
            "@media (min-width: 769px) {",
            "    .ydesign-active .card.ydesign-vertical { width: calc(100% / var(--ydesign-grid-items-v, 5)); height: auto !important; }   ",
            "    .ydesign-active .card.ydesign-horizontal { width: calc(100% / var(--ydesign-grid-items-h, 3)); height: auto !important; } ",
            "    .ydesign-active .items-line:not(.vinyl-line) .card.ydesign-vertical { width: 18.5vw; }   ",
            "    .ydesign-active .items-line:not(.vinyl-line) .card.ydesign-horizontal { width: 31.5vw; } ",
            "}",
            "",
            "@media (max-width: 768px) {",
            "    .ydesign-active .card.ydesign-vertical { width: calc(100% / 2); height: auto !important; }    ",
            "    .ydesign-active .card.ydesign-horizontal { width: 100%; height: auto !important; }  ",
            "    .ydesign-active .items-line:not(.vinyl-line) .card.ydesign-vertical { width: 46vw; }    ",
            "    .ydesign-active .items-line:not(.vinyl-line) .card.ydesign-horizontal { width: 94vw; }  ",
            "}",
            "",
            "/* ЗОБРАЖЕННЯ КАРТОК */",
            ".ydesign-img-layer {",
            "    position: absolute; top: 0; left: 0; width: 100%; height: 100%;",
            "    background-color: #1a1a1a;",
            "    background-image: url('./img/img_load.svg');",
            "    background-size: cover !important; background-repeat: no-repeat; background-position: center center !important;",
            "    filter: saturate(var(--ydesign-poster-saturation, 1.35)) contrast(var(--ydesign-poster-contrast, 1.10)) !important;",
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
            "    position: absolute; bottom: 0; left: 0; width: 100%; height: 60%;",
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
            "/* КОНТЕЙНЕРИ БЕЙДЖІВ */",
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
            "/* ВІДСТУПИ ЖАНРІВ (РУЧНИЙ РЕЖИМ) */",
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
            "/* ГЕОМЕТРІЯ ПІГУЛОК */",
            ".ydesign-badge, .ydesign-genre-badge, .ydesign-rating {",
            "    display: inline-flex !important; align-items: center !important; justify-content: center !important;",
            "    box-sizing: border-box !important; height: 1.85em !important; min-height: 1.85em !important; max-height: 1.85em !important; line-height: 1.1 !important; ",
            "    border: 1px solid transparent !important; background: transparent !important; padding: 0 0.50em !important; ",
            "    text-shadow: none !important; box-shadow: none !important; white-space: nowrap !important; flex-shrink: 0 !important; ",
            "    text-align: center !important; vertical-align: middle !important; border-radius: var(--ydesign-badge-radius, 50px) !important; ",
            "    max-width: 100% !important; overflow: visible !important;",
            "    background: rgba(0, 0, 0, var(--ydesign-badge-darken, 0)) !important;",
            "}",
            "",
            "/* РОЗМІРИ ШРИФТІВ У БЕЙДЖАХ */",
            ".ydesign-badge-year { font-size: calc(var(--ydesign-year-size-val, 0.8) * 1em) !important; font-weight: 700 !important; color: #fff !important; }",
            ".ydesign-badge-age { font-size: calc(var(--ydesign-age-size-val, 0.8) * 1em) !important; font-weight: 700 !important; color: #fff !important; }",
            ".ydesign-badge-seasons { font-size: calc(var(--ydesign-seasons-size-val, 0.8) * 1em) !important; font-weight: 700 !important; color: #fff !important; }",
            ".ydesign-badge-ua { font-size: calc(var(--ydesign-ua-size-val, 0.8) * 1em) !important; font-weight: 700 !important; color: #fff !important; }",
            ".ydesign-genre-badge { font-size: calc(var(--ydesign-genres-size-val, 0.8) * 1em) !important; font-weight: 600 !important; color: rgba(255,255,255,0.95) !important; }",
            ".ydesign-rating { font-size: calc(var(--ydesign-rating-size-val, 0.8) * 1em) !important; font-weight: 700 !important; color: #fff !important; gap: 0.25em !important; }",
            "",
            "/* ОДНАКОВИЙ РОЗМІР БЕЙДЖІВ */",
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
            "    -webkit-box-shadow: none !important;",
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
            "/* РАМКИ БЕЙДЖІВ */",
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
            "/* ВЕРХНІЙ БЛОК БЕЙДЖІВ КАРТКИ */",
            ".ydesign-card-notch {",
            "    position: absolute !important; top: 0 !important; left: 50% !important;",
            "    transform: translateX(-50%) !important; z-index: 25 !important;",
            "    display: inline-flex !important; align-items: center !important; justify-content: center !important;",
            "    gap: 0.4em !important; padding: 0.18em 0.6em !important;",
            "    box-sizing: border-box !important; white-space: nowrap !important; pointer-events: none !important;",
            "    max-width: 92% !important; overflow: hidden !important;",
            "    margin: 0 !important; margin-top: 0 !important;",
            "    border-top: none !important; border-radius: 0 0 0.65em 0.65em !important;",
            "    border-top-left-radius: 0 !important; border-top-right-radius: 0 !important;",
            "    border-bottom-left-radius: 0.65em !important; border-bottom-right-radius: 0.65em !important;",
            "    transition: all 0.2s ease !important;",
            "}",
            "body.ydesign-notch-hide .ydesign-card-notch { display: none !important; }",
            "body.ydesign-notch-bg .ydesign-card-notch {",
            "    background: rgba(255, 255, 255, 0.12) !important;",
            "    -webkit-",
            "}",
            "body:not(.ydesign-notch-bg) .ydesign-card-notch {",
            "    background: transparent !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important;",
            "}",
            "body.ydesign-notch-border .ydesign-card-notch {",
            "    border-left: 1px solid rgba(255, 255, 255, 0.6) !important;",
            "    border-right: 1px solid rgba(255, 255, 255, 0.6) !important;",
            "    border-bottom: 1px solid rgba(255, 255, 255, 0.6) !important;",
            "    border-top: none !important;",
            "}",
            "body:not(.ydesign-notch-border) .ydesign-card-notch { border: none !important; }",
            ".ydesign-notch-type {",
            "    font-size: var(--ydesign-notch-type-size, 0.5em) !important;",
            "    font-weight: 400 !important; color: #ffffff !important;",
            "    text-transform: uppercase !important; letter-spacing: 0.04em !important;",
            "    line-height: 1 !important; white-space: nowrap !important; flex-shrink: 0 !important;",
            "}",
            ".ydesign-notch-std-list {",
            "    display: inline-flex !important; align-items: center !important; gap: 0.25em !important; flex-shrink: 0 !important;",
            "}",
            ".ydesign-notch-icon {",
            "    display: inline-block !important;",
            "    width: var(--ydesign-notch-std-size, 0.5em) !important; height: var(--ydesign-notch-std-size, 0.5em) !important;",
            "    vertical-align: middle !important; flex-shrink: 0 !important;",
            "}",
            "body.ydesign-notch-mono .ydesign-notch-icon,",
            ".ydesign-notch-mono .ydesign-notch-icon {",
            "    color: rgba(255, 255, 255, 0.92) !important;",
            "}",
            "body:not(.ydesign-notch-mono) .ydesign-notch-icon-book { color: #ffd166 !important; }",
            "body:not(.ydesign-notch-mono) .ydesign-notch-icon-like { color: #ff4757 !important; }",
            "body:not(.ydesign-notch-mono) .ydesign-notch-icon-wath { color: #00d2d3 !important; }",
            "body:not(.ydesign-notch-mono) .ydesign-notch-icon-history { color: #be95ff !important; }",
            ".ydesign-notch-custom {",
            "    font-size: var(--ydesign-notch-custom-size, 0.5em) !important;",
            "    font-weight: 400 !important; color: #ffffff !important;",
            "    text-transform: uppercase !important; letter-spacing: 0.04em !important;",
            "    background: transparent !important; padding: 0 !important; border: none !important; border-radius: 0 !important;",
            "    line-height: 1 !important; white-space: nowrap !important; flex-shrink: 0 !important;",
            "}",
            "",
            "/* ВЕРТИКАЛЬНЫЕ КАРТКИ CSS ЗМІННІ */",
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
            "/* ГОРИЗОНТАЛЬНЫЕ КАРТКИ CSS ЗМІННІ */",
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
            "/* МАТЕМАТИЧНО РІВНІ ВІДСТУПИ ДЛЯ V ТА H */",
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
            "/* ОПИС ПІД ГОРИЗОНТАЛЬНОЮ КАРТКОЮ */",
            ".ydesign-desc-under {",
            "    position: relative; z-index: 10; width: 100%;",
            "    font-size: calc(var(--ydesign-desc-size-val, 0.85) * 1em) !important;",
            "    color: rgba(255,255,255,0.75); margin-top: 0.5em; text-align: left; line-height: 1.35;",
            "    text-shadow: 0 1px 3px rgba(0,0,0,0.8); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;",
            "    height: calc(1.35em * 3) !important; ",
            "}",
            "",
            "/* ВИДИМІСТЬ ЕЛЕМЕНТІВ (V) */",
            "body.ydesign-v-hide-year .ydesign-vertical .ydesign-badge-year { display: none !important; }",
            "body.ydesign-v-hide-seasons .ydesign-vertical .ydesign-badge-seasons { display: none !important; }",
            "body.ydesign-v-hide-ua .ydesign-vertical .ydesign-badge-ua { display: none !important; }",
            "body.ydesign-v-hide-age .ydesign-vertical .ydesign-badge-age { display: none !important; }",
            "body.ydesign-v-hide-slogan .ydesign-vertical .ydesign-slogan { display: none !important; }",
            "body.ydesign-v-hide-add-title .ydesign-vertical .ydesign-add-title { display: none !important; }",
            "body.ydesign-v-hide-genres .ydesign-vertical .ydesign-genres { display: none !important; }",
            "",
            "/* ВИДИМІСТЬ ЕЛЕМЕНТІВ (H) */",
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
            "   РЕДИЗАЙН СЕРІЙ: БЕЗПЕЧНІ ВІДСТУПИ, ВІДСУТНІСТЬ ЗРІЗАННЯ ТА ТІНЕЙ",
            "   ========================================================================= */",
            ".explorer.ydesign-has-series .online-prestige.online-prestige-watched.ydesign-empty-history {",
            "    display: none !important; pointer-events: none !important; visibility: hidden !important;",
            "    height: 0 !important; margin: 0 !important; padding: 0 !important;",
            "}",
            "",
            "/* ВИМКНЕННЯ ГРАДІЄНТІВ ТА МАСОК СКРОЛУ */",
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
            "    padding-bottom: 0px !important; /* Минимальний видступ знизу */",
            "    padding-left: 10px !important;   /* Безпечний бичний видступ проти зризання */",
            "    padding-right: 10px !important;  /* Безпечний бичний видступ проти зризання */",
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
            "    border-radius: 0.85em !important; overflow: hidden !important; background-color: #1a1a1a !important;",
            "    box-sizing: border-box !important;",
            "    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;",
            "    border: none !important; outline: none !important; ",
            "    box-shadow: none !important; /* Прибрано тинь з неактивних карточек */",
            "    width: calc(var(--ydesign-series-width, 50%) - 24px) !important; cursor: pointer !important; pointer-events: auto !important;",
            "}",
            ".ydesign-series-active .online-prestige.online-prestige--full::before {",
            "    content: ''; display: block !important; padding-top: 56.25% !important; ",
            "}",
            "",
            "/* ФОКУС КАРТКИ СЕРІЇ: ЧИСТА БІЛА РАМКА БЕЗ ЧОРНОЇ ТІНІ */",
            ".ydesign-series-active .online-prestige.online-prestige--full.focus {",
            "    transform: scale(1.035) translateZ(0) !important;",
            "    box-shadow: 0 0 0 3.5px #ffffff !important; /* Тильки била рамка */",
            "    z-index: 50 !important;",
            "}",
            "body.is--touch .ydesign-series-active .online-prestige.online-prestige--full.focus {",
            "    transform: none !important;",
            "    box-shadow: none !important;",
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
            "/* СВІТЛИЙ ГРАДІЄНТ ТІЛЬКИ ЗНИЗУ */",
            ".ydesign-series-active .online-prestige.online-prestige--full .ydesign-series-shade {",
            "    position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;",
            "    background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 35%, transparent 65%) !important;",
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
            "    -webkit-box-shadow: none !important;",
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
            "    position: absolute !important; bottom: calc(1.15em + 8px) !important; left: 12px !important; right: 80px !important; z-index: 5 !important;",
            "    display: flex !important; flex-direction: column !important; align-items: flex-start !important; gap: 5px !important;",
            "    max-width: calc(100% - 92px) !important; overflow: visible !important; pointer-events: none !important;",
            "}",
            ".ydesign-series-bottom-right {",
            "    position: absolute !important; bottom: calc(1.15em + 8px) !important; right: 12px !important; z-index: 5 !important;",
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
            "    height: 1.15em !important; margin: 0 !important; z-index: 12 !important;",
            "    background: rgba(255, 255, 255, 0.22) !important; -webkit-",
            "    border-radius: 0 0 0.85em 0.85em !important; overflow: hidden !important; display: block !important; pointer-events: none !important;",
            "}",
            ".ydesign-series-active .online-prestige.online-prestige--full .online-prestige__timeline .time-line {",
            "    width: 100% !important; height: 100% !important; background: transparent !important; margin: 0 !important; border-radius: 0 !important;",
            "    position: absolute !important; top: 0 !important; left: 0 !important; z-index: 1 !important; pointer-events: none !important;",
            "}",
            ".ydesign-series-active .online-prestige.online-prestige--full .online-prestige__timeline .time-line > div {",
            "    height: 100% !important; border-radius: 0 !important; background: #ffffff !important;",
            "    box-shadow: 0 0 8px rgba(255,255,255,0.7) !important; transition: width 0.3s ease !important; pointer-events: none !important;",
            "}",
            ".ydesign-series-percent-text {",
            "    position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;",
            "    width: 100% !important; height: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important;",
            "    font-size: 0.8em !important; font-weight: 500 !important; color: #000000 !important; text-shadow: none !important; z-index: 20 !important; pointer-events: none !important; line-height: 1 !important;",
            "}"
        ].join('\n');
    }

    function getFlexAlign(val) {
        if (val === 'left') return 'flex-start';
        if (val === 'right') return 'flex-end';
        return 'center';
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

            document.body.classList.toggle('ydesign-hide-left-column', getSet('ydesign_hide_left_column'));

            // Загальни бейджи
            document.body.classList.toggle('ydesign-border-year', getSet('ydesign_border_year'));
            document.body.classList.toggle('ydesign-border-age', getSet('ydesign_border_age'));
            document.body.classList.toggle('ydesign-border-seasons', getSet('ydesign_border_seasons'));
            document.body.classList.toggle('ydesign-border-ua', getSet('ydesign_border_ua'));
            document.body.classList.toggle('ydesign-border-genres', getSet('ydesign_border_genres'));
            document.body.classList.toggle('ydesign-border-ratings', getSet('ydesign_border_ratings'));

            document.body.classList.toggle('ydesign-color-age', getSet('ydesign_color_age'));
            document.body.classList.toggle('ydesign-color-ua', getSet('ydesign_color_ua'));
            document.body.classList.toggle('ydesign-glass-pill', getSet('ydesign_glass_pill_bg'));
            document.body.classList.toggle('ydesign-badge-darken', !!getSet('ydesign_badge_darken'));
            document.documentElement.style.setProperty('--ydesign-badge-darken', getSet('ydesign_badge_darken') ? (getSet('ydesign_badge_darken_level') || '0.35') : '0');

            var shape = getSet('ydesign_badge_shape');
            document.body.classList.remove('ydesign-shape-pill', 'ydesign-shape-rounded', 'ydesign-shape-square');
            document.body.classList.add('ydesign-shape-' + shape);

            document.body.dataset.ydesignLogo = getSet('ydesign_logo_type');

            // Сериї
            var seriesCards = parseInt(getSet('ydesign_series_cards')) || 2;
            document.documentElement.style.setProperty('--ydesign-series-width', (100 / seriesCards) + '%');
            document.documentElement.style.setProperty('--ydesign-series-badge-size-val', getSet('ydesign_series_badge_size'));
            document.documentElement.style.setProperty('--ydesign-series-title-size-val', getSet('ydesign_series_title_size'));

            // Сетка
            document.documentElement.style.setProperty('--ydesign-grid-items-v', getSet('ydesign_grid_items_v'));
            document.documentElement.style.setProperty('--ydesign-grid-items-h', getSet('ydesign_grid_items_h'));
            document.documentElement.style.setProperty('--ydesign-card-gap', getSet('ydesign_card_gap') + 'em');
            document.documentElement.style.setProperty('--ydesign-ratings-saturate', getSet('ydesign_ratings_saturate') + '%');

            // Верхние бейджи
            document.body.classList.toggle('ydesign-notch-hide', !getSet('ydesign_notch_show'));
            document.body.classList.toggle('ydesign-notch-bg', !!getSet('ydesign_notch_bg'));
            document.body.classList.toggle('ydesign-notch-border', !!getSet('ydesign_notch_border'));
            document.body.classList.toggle('ydesign-notch-mono', !!getSet('ydesign_notch_std_monochrome'));

            var nUniform = !!getSet('ydesign_notch_uniform_size');
            var nSize = getSet('ydesign_notch_size') || '0.5';
            var nTypeSize = nUniform ? nSize : (getSet('ydesign_notch_type_size') || '0.5');
            var nStdSize = nUniform ? nSize : (getSet('ydesign_notch_standard_size') || '0.5');
            var nCustSize = nUniform ? nSize : (getSet('ydesign_notch_custom_size') || '0.5');

            document.documentElement.style.setProperty('--ydesign-notch-type-size', nTypeSize + 'em');
            document.documentElement.style.setProperty('--ydesign-notch-std-size', nStdSize + 'em');
            document.documentElement.style.setProperty('--ydesign-notch-custom-size', nCustSize + 'em');

            // ----------------- ВЕРТИКАЛЬНЫЕ ПАРАМЕТРИ -----------------
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

            // ----------------- ГОРИЗОНТАЛЬНЫЕ ПАРАМЕТРИ -----------------
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
        } catch (e) {}
    }

    // =========================================================================
    // 11. МЕНЮ НАЛАШТУВАНЬ (YDesign)
    // =========================================================================
    function applyPreset(preset) {
        var presets = {
            bright: {
                ydesign_poster_saturation: '1.5', ydesign_poster_contrast: '1.2',
                ydesign_badge_shape: 'pill', ydesign_glass_pill_bg: true,
        ydesign_badge_darken: true,
        ydesign_badge_darken_level: '0.35',
                ydesign_notch_bg: true, ydesign_notch_border: true,
                ydesign_color_age: true, ydesign_color_ua: true,
                ydesign_border_year: true, ydesign_border_age: true,
                ydesign_border_seasons: true, ydesign_border_ua: true,
                ydesign_border_genres: true, ydesign_border_ratings: true,
                ydesign_card_gap: '0.8', ydesign_v_badges_one_row: false
            },
            minimal: {
                ydesign_poster_saturation: '1.15', ydesign_poster_contrast: '1.05',
                ydesign_badge_shape: 'square', ydesign_glass_pill_bg: false,
                ydesign_notch_bg: false, ydesign_notch_border: false,
                ydesign_color_age: false, ydesign_color_ua: false,
                ydesign_border_year: false, ydesign_border_age: false,
                ydesign_border_seasons: false, ydesign_border_ua: false,
                ydesign_border_genres: false, ydesign_border_ratings: false,
                ydesign_card_gap: '0.4', ydesign_v_badges_one_row: true
            },
            cinema: {
                ydesign_poster_saturation: '1.35', ydesign_poster_contrast: '1.1',
                ydesign_badge_shape: 'rounded', ydesign_glass_pill_bg: false,
                ydesign_notch_bg: false, ydesign_notch_border: true,
                ydesign_color_age: true, ydesign_color_ua: true,
                ydesign_border_year: true, ydesign_border_age: true,
                ydesign_border_seasons: true, ydesign_border_ua: true,
                ydesign_border_genres: true, ydesign_border_ratings: true,
                ydesign_card_gap: '0.6', ydesign_v_badges_one_row: false
            }
        };
        var values = presets[preset] || presets.bright;
        if (window.Lampa && Lampa.Storage) {
            Object.keys(values).forEach(function (key) { Lampa.Storage.set(key, values[key]); });
        }
        injectCSS();
        applyDynamicCSS();
        if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Пресет оформления применён');
    }

    function getUserSettingsForTransfer() {
        var result = {
            format: 'YDesign settings',
            version: 1,
            exportedAt: new Date().toISOString(),
            settings: {}
        };
        try {
            for (var i = 0; i < localStorage.length; i += 1) {
                var key = localStorage.key(i);
                if (key && key.indexOf('ydesign_') === 0 && key.indexOf('ydesign_c_') !== 0 && key.indexOf('ydesign_cache_') !== 0) {
                    result.settings[key] = localStorage.getItem(key);
                }
            }
        } catch (e) {}
        return result;
    }

    function exportUserSettings() {
        var data = getUserSettingsForTransfer();
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'ydesign-настройки.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Настройки экспортированы');
    }

    function importUserSettings(file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var data = JSON.parse(reader.result);
                var values = data && data.settings ? data.settings : data;
                if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('bad format');
                var count = 0;
                Object.keys(values).forEach(function (key) {
                    if (key.indexOf('ydesign_') === 0 && key.indexOf('ydesign_c_') !== 0 && key.indexOf('ydesign_cache_') !== 0) {
                        Lampa.Storage.set(key, values[key]);
                        count += 1;
                    }
                });
                if (!count) throw new Error('empty');
                injectCSS();
                applyDynamicCSS();
                fontApply();
                if (window.Lampa && Lampa.Settings) Lampa.Settings.update();
                if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Импортировано настроек: ' + count + '. Перезапустите приложение для полного применения.');
            } catch (e) {
                if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Не удалось импортировать настройки');
            }
        };
        reader.readAsText(file, 'utf-8');
    }

    function chooseSettingsFile() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';
        input.style.display = 'none';
        input.onchange = function () {
            importUserSettings(input.files && input.files[0]);
            if (input.parentNode) input.parentNode.removeChild(input);
        };
        document.body.appendChild(input);
        input.click();
    }

    function createSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;

        var qualities = { 'w92': 'w92', 'w154': 'w154', 'w200': 'w200', 'w300': 'w300', 'w500': 'w500', 'w780': 'w780', 'original': 'Оригинал' };

        var textSizesExt = {};
        for (var i = 3; i <= 40; i += 1) { var v = (i / 10).toFixed(1); textSizesExt[v] = v; }

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

        var saturates = { '0': '0% (Черно-белые)', '25': '25%', '75': '75%', '100': '100% (Цветные)' };
        var aligns = { 'left': 'Слева', 'center': 'По центру', 'right': 'Справа' };
        var shapes = { 'pill': 'Капсула (Сучасний Pill Capsule)', 'rounded': 'Прямокутний скруглений (4px)', 'square': 'Прямокутний (2px)' };

        var sectionKeys = ['ydesign_grid', 'ydesign_vertical', 'ydesign_horizontal', 'ydesign_notch', 'ydesign_badges_style', 'ydesign_fonts', 'ydesign_texts', 'ydesign_series', 'ydesign_perf'];
        sectionKeys.forEach(function (compKey) {
            Lampa.Template.add('settings_' + compKey, '<div></div>');
        });

        Lampa.SettingsApi.addComponent({
            component: 'ydesign',
            name: CONFIG.name + ' • ' + CONFIG.author,
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><path d="M8 8l4 4 4-4"></path><path d="M12 12v4"></path></svg>'
        });


        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { type: 'title' },
            field: { name: 'Разделы настроек' }
        });

        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_export_settings', type: 'button' },
            field: { name: 'Экспорт настроек', description: 'Скачать пользовательские настройки в JSON-файл' },
            onChange: function () { exportUserSettings(); }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_import_settings', type: 'button' },
            field: { name: 'Импорт настроек', description: 'Загрузить настройки из JSON-файла' },
            onChange: function () { chooseSettingsFile(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'ydesign',
            param: { name: 'ydesign_preset', type: 'select', values: { 'bright': 'Яркий', 'minimal': 'Минималистичный', 'cinema': 'Кино' }, default: DefaultSettings.ydesign_preset },
            field: { name: 'Пресет оформления', description: 'Быстро применяет готовый стиль карточек и постеров' },
            onChange: function (value) { applyPreset(value); }
        });

        var subSections = [
            { id: 'ydesign_grid', name: '🎬 Отображение карточек и Сетка', desc: 'Формат карточек на главной/других страниц, килькисть колонок и линиве заваниження' },
            { id: 'ydesign_vertical', name: '📱 Вертикальни картки', desc: 'Окреми налаштування розмирив, логотипа, слогана, бейджей, видступив и виривнювання' },
            { id: 'ydesign_horizontal', name: '💻 Горизонильни картки', desc: 'Окреми налаштування розмирив, логотипа, описания пид карткою, бейджей, видступив и виривнювання' },
            { id: 'ydesign_notch', name: '✂️ Верхние бейджи', desc: 'Верхнией блок виризу: тип (Фильм/Сериал), синдартни метки, ситус перегляду' },
            { id: 'ydesign_badges_style', name: '🏷️ Стили бейджей', desc: 'Форма капсул, подложка, рамки и цвета меток' },
            { id: 'ydesign_fonts', name: '🔤 Шрифти', desc: 'Выбор шрифтив Google Fonts для всеєї програми' },
            { id: 'ydesign_texts', name: '🔤 Языки, Логотипы и Качество', desc: 'Выбор языков (лого, слоган, опис), тип логотипа и якисть изображений TMDB' },
            { id: 'ydesign_series', name: '📺 Редизайн Серий и Эпизодов', desc: 'Размери бейджей и тексту, килькисть карточек, стиль пигулок, даи, озвучка, рейтинг' },
            { id: 'ydesign_perf', name: '⚙️ API Ключи, Кэш и Поддержка', desc: 'OMDb/MDBList ключи, очищення кешу плагина и QR поддержки' }
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
        // ПОДКАТЕГОРИЯ 1: СІТКА ТА ТИПИ КАРТОК (ydesign_grid)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_lazy_load', type: 'trigger', default: DefaultSettings.ydesign_lazy_load }, field: { name: 'Ленивая загрузка', description: 'Загружать дополнительные дани (лого, рейтинги) тильки при появлении картки на экране' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_card_type_main', type: 'select', values: { 'vertical': 'Вертикальни (9:16)', 'horizontal': 'Горизонильни (16:11)' }, default: DefaultSettings.ydesign_card_type_main }, field: { name: 'Тип карточек (Головна)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_card_type_other', type: 'select', values: { 'vertical': 'Вертикальни (9:16)', 'horizontal': 'Горизонильни (16:11)' }, default: DefaultSettings.ydesign_card_type_other }, field: { name: 'Тип карточек (Інши сторинки)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_grid_items_v', type: 'select', values: { '4': '4', '5': '5', '6': '6', '7': '7', '8': '8' }, default: DefaultSettings.ydesign_grid_items_v }, field: { name: 'Количество карточек у ситци (Вертикальни)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_grid_items_h', type: 'select', values: { '2': '2', '3': '3', '4': '4', '5': '5' }, default: DefaultSettings.ydesign_grid_items_h }, field: { name: 'Количество карточек у ситци (Горизонильни)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_card_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_card_gap }, field: { name: 'Расстояние миж картками' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_poster_ratio', type: 'select', values: { '2:3': 'Вертикальные 2:3', '9:16': 'Вертикальные 9:16' }, default: DefaultSettings.ydesign_poster_ratio }, field: { name: 'Пропорции постеров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_poster_saturation', type: 'select', values: { '1': 'Обычная', '1.15': 'Насыщенная', '1.35': 'Очень насыщенная', '1.5': 'Максимальная' }, default: DefaultSettings.ydesign_poster_saturation }, field: { name: 'Насыщенность постеров' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_grid', param: { name: 'ydesign_poster_contrast', type: 'select', values: { '1': 'Обычный', '1.1': 'Выразительный', '1.2': 'Высокий' }, default: DefaultSettings.ydesign_poster_contrast }, field: { name: 'Контраст постеров' } });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 2: ВЕРТИКАЛЬНЫЕ КАРТКИ (ydesign_vertical)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { type: 'title' }, field: { name: 'Размери логотипа и названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_logo_max_h', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_v_logo_max_h }, field: { name: 'Макс. висои логотипа/тексту' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_logo_max_w', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_v_logo_max_w }, field: { name: 'Макс. ширина логотипа/тексту' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_title_size }, field: { name: 'Размер тексту основної названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_add_title', type: 'trigger', default: DefaultSettings.ydesign_v_show_add_title }, field: { name: 'Показывать додаткову назву' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_add_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_add_title_size }, field: { name: 'Размер додаткової названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_slogan', type: 'trigger', default: DefaultSettings.ydesign_v_show_slogan }, field: { name: 'Показывать слоган' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_slogan_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_slogan_size }, field: { name: 'Размер слогана' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { type: 'title' }, field: { name: 'Видимисть и розмири бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_year', type: 'trigger', default: DefaultSettings.ydesign_v_show_year }, field: { name: 'Показывать Рик' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_seasons', type: 'trigger', default: DefaultSettings.ydesign_v_show_seasons }, field: { name: 'Показывать Сезони/Сериї' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_age', type: 'trigger', default: DefaultSettings.ydesign_v_show_age }, field: { name: 'Показывать виковий рейтинг' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_ua', type: 'trigger', default: DefaultSettings.ydesign_v_show_ua }, field: { name: 'Показывать метку UA' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_show_genres', type: 'trigger', default: DefaultSettings.ydesign_v_show_genres }, field: { name: 'Показывать Жанры' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_badges_one_row', type: 'trigger', default: DefaultSettings.ydesign_v_badges_one_row }, field: { name: 'Уси бейджи в 1 ряд' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_uniform_badges', type: 'trigger', default: DefaultSettings.ydesign_v_uniform_badges }, field: { name: 'Уси бейджи одного розмиру' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_badge_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_badge_size }, field: { name: 'Базовий розмир бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_year_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_year_size }, field: { name: 'Размер бейджу Року' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_age_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_age_size }, field: { name: 'Размер бейджу Вику' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_seasons_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_seasons_size }, field: { name: 'Размер бейджу Сезонов/Серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_ua_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_ua_size }, field: { name: 'Размер бейджу UA озвучки' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_genres_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_genres_size }, field: { name: 'Размер бейджей Жанрив' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_rating_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_v_rating_size }, field: { name: 'Размер бейджей Рейтингив' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { type: 'title' }, field: { name: 'Выравнивание и Отступи' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_align_logo', type: 'select', values: aligns, default: DefaultSettings.ydesign_v_align_logo }, field: { name: 'Выравнивание: Логотип/Назва' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_align_add_title', type: 'select', values: aligns, default: DefaultSettings.ydesign_v_align_add_title }, field: { name: 'Выравнивание: Дополнительная назва' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_align_badges', type: 'select', values: aligns, default: DefaultSettings.ydesign_v_align_badges }, field: { name: 'Выравнивание: Бейджи/Рейтинги' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_align_slogan', type: 'select', values: aligns, default: DefaultSettings.ydesign_v_align_slogan }, field: { name: 'Выравнивание: Слоган' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_uniform_v_gaps', type: 'trigger', default: DefaultSettings.ydesign_v_uniform_v_gaps }, field: { name: 'Математично однакови вертикальни видступи' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_uniform_v_gap_val', type: 'select', values: microGaps, default: DefaultSettings.ydesign_v_uniform_v_gap_val }, field: { name: 'Значення вертикального видступу' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_badges_gap', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_v_badges_gap }, field: { name: 'Расстояние миж бейджами по горизонили' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_badge_rows_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_v_badge_rows_gap }, field: { name: 'Отступ миж рядками бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_genres_gap', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_v_genres_gap }, field: { name: 'Отступ для блоку Жанрив (Ручний режим)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_content_pb', type: 'select', values: gaps, default: DefaultSettings.ydesign_v_content_pb }, field: { name: 'Отступ контенту знизу' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_slogan_padding', type: 'select', values: gaps, default: DefaultSettings.ydesign_v_slogan_padding }, field: { name: 'Отступ слогана зверху' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_logo_mb', type: 'select', values: gaps, default: DefaultSettings.ydesign_v_logo_mb }, field: { name: 'Отступ названия/лого вид бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_vertical', param: { name: 'ydesign_v_add_title_mb', type: 'select', values: gaps, default: DefaultSettings.ydesign_v_add_title_mb }, field: { name: 'Отступ додаткової названия вид бейджей' } });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 3: ГОРИЗОНТАЛЬНЫЕ КАРТКИ (ydesign_horizontal)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { type: 'title' }, field: { name: 'Размери логотипа и названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_logo_max_h', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_h_logo_max_h }, field: { name: 'Макс. висои логотипа/тексту' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_logo_max_w', type: 'select', values: logoSizes, default: DefaultSettings.ydesign_h_logo_max_w }, field: { name: 'Макс. ширина логотипа/тексту' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_title_size }, field: { name: 'Размер тексту основної названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_add_title', type: 'trigger', default: DefaultSettings.ydesign_h_show_add_title }, field: { name: 'Показывать додаткову назву' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_add_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_add_title_size }, field: { name: 'Размер додаткової названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_slogan', type: 'trigger', default: DefaultSettings.ydesign_h_show_slogan }, field: { name: 'Показывать слоган' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_slogan_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_slogan_size }, field: { name: 'Размер слогана' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_desc', type: 'trigger', default: DefaultSettings.ydesign_h_show_desc }, field: { name: 'Показывать опис пид карткою' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_desc_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_desc_size }, field: { name: 'Размер тексту описания' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { type: 'title' }, field: { name: 'Видимисть и розмири бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_year', type: 'trigger', default: DefaultSettings.ydesign_h_show_year }, field: { name: 'Показывать Рик' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_seasons', type: 'trigger', default: DefaultSettings.ydesign_h_show_seasons }, field: { name: 'Показывать Сезони/Сериї' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_age', type: 'trigger', default: DefaultSettings.ydesign_h_show_age }, field: { name: 'Показывать виковий рейтинг' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_ua', type: 'trigger', default: DefaultSettings.ydesign_h_show_ua }, field: { name: 'Показывать метку UA' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_show_genres', type: 'trigger', default: DefaultSettings.ydesign_h_show_genres }, field: { name: 'Показывать Жанры' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_ratings_row', type: 'trigger', default: DefaultSettings.ydesign_h_ratings_row }, field: { name: 'Рейтинги з нового рядка' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_uniform_badges', type: 'trigger', default: DefaultSettings.ydesign_h_uniform_badges }, field: { name: 'Уси бейджи одного розмиру' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_badge_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_badge_size }, field: { name: 'Базовий розмир бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_year_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_year_size }, field: { name: 'Размер бейджу Року' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_age_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_age_size }, field: { name: 'Размер бейджу Вику' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_seasons_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_seasons_size }, field: { name: 'Размер бейджу Сезонов/Серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_ua_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_ua_size }, field: { name: 'Размер бейджу UA озвучки' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_genres_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_genres_size }, field: { name: 'Размер бейджей Жанрив' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_rating_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_h_rating_size }, field: { name: 'Размер бейджей Рейтингив' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { type: 'title' }, field: { name: 'Выравнивание и Отступи' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_align_logo', type: 'select', values: aligns, default: DefaultSettings.ydesign_h_align_logo }, field: { name: 'Выравнивание: Логотип/Назва' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_align_add_title', type: 'select', values: aligns, default: DefaultSettings.ydesign_h_align_add_title }, field: { name: 'Выравнивание: Дополнительная назва' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_align_badges', type: 'select', values: aligns, default: DefaultSettings.ydesign_h_align_badges }, field: { name: 'Выравнивание: Бейджи/Рейтинги' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_align_slogan', type: 'select', values: aligns, default: DefaultSettings.ydesign_h_align_slogan }, field: { name: 'Выравнивание: Слоган' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_uniform_v_gaps', type: 'trigger', default: DefaultSettings.ydesign_h_uniform_v_gaps }, field: { name: 'Математично однакови вертикальни видступи' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_uniform_v_gap_val', type: 'select', values: microGaps, default: DefaultSettings.ydesign_h_uniform_v_gap_val }, field: { name: 'Значення вертикального видступу' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_badges_gap', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_h_badges_gap }, field: { name: 'Расстояние миж бейджами по горизонили' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_badge_rows_gap', type: 'select', values: gaps, default: DefaultSettings.ydesign_h_badge_rows_gap }, field: { name: 'Отступ миж рядками бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_genres_gap', type: 'select', values: tinyGaps, default: DefaultSettings.ydesign_h_genres_gap }, field: { name: 'Отступ для блоку Жанрив (Ручний режим)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_content_pb', type: 'select', values: gaps, default: DefaultSettings.ydesign_h_content_pb }, field: { name: 'Отступ контенту знизу' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_slogan_padding', type: 'select', values: gaps, default: DefaultSettings.ydesign_h_slogan_padding }, field: { name: 'Отступ слогана зверху' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_logo_mb', type: 'select', values: gaps, default: DefaultSettings.ydesign_h_logo_mb }, field: { name: 'Отступ названия/лого вид бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_horizontal', param: { name: 'ydesign_h_add_title_mb', type: 'select', values: gaps, default: DefaultSettings.ydesign_h_add_title_mb }, field: { name: 'Отступ додаткової названия вид бейджей' } });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ: ВЕРХНІ БЕЙДЖІ (ydesign_notch)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_show', type: 'trigger', default: DefaultSettings.ydesign_notch_show },
            field: { name: 'Показывать верхни бейджи', description: 'Блок-вириз зверху посередини картки' }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_bg', type: 'trigger', default: DefaultSettings.ydesign_notch_bg },
            field: { name: 'Скляна подложка', description: 'Напивпрозоре скло для блоку' }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_border', type: 'trigger', default: DefaultSettings.ydesign_notch_border },
            field: { name: 'Контурная рамка', description: 'Рамка по контуру блоку (одна на весь блок)' }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_std_monochrome', type: 'trigger', default: DefaultSettings.ydesign_notch_std_monochrome },
            field: { name: 'Монохромные иконки миток', description: 'Видображати синдартни иконки билим кольором замисть ризнокольорових' }
        });

        Lampa.SettingsApi.addParam({ component: 'ydesign_notch', param: { type: 'title' }, field: { name: 'Размери бейджей у блоци' } });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_uniform_size', type: 'trigger', default: DefaultSettings.ydesign_notch_uniform_size },
            field: { name: 'Все одного розмиру', description: 'Однакова величина всех елементив или окремо для кожного блоку' }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_notch_size },
            field: { name: 'Общий розмир бейджей', description: 'Диє, коли увимкнено вариант "Все одного розмиру"' }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_type_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_notch_type_size },
            field: { name: 'Размер типу (Фильм/Сериал)', description: 'Размер шрифту першого блоку типу' }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_standard_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_notch_standard_size },
            field: { name: 'Размер синдартних миток', description: 'Размер иконок закладок, подобається, пизнише, историї' }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_custom_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_notch_custom_size },
            field: { name: 'Размер метки ситусу/custom-favs', description: 'Размер тексту бейджа ситусу перегляду (Смотрю тощо)' }
        });

        Lampa.SettingsApi.addParam({ component: 'ydesign_notch', param: { type: 'title' }, field: { name: 'Групи бейджей у блоци' } });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_show_type', type: 'trigger', default: DefaultSettings.ydesign_notch_show_type },
            field: { name: '1. Тип медиа (Фильм / Сериал)', description: 'Перший блок рядка' }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_show_standard', type: 'trigger', default: DefaultSettings.ydesign_notch_show_standard },
            field: { name: '2. Синдартни метки Lampa', description: 'Другий блок: закладки, подобається, пизнише, история' }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_notch',
            param: { name: 'ydesign_notch_show_custom', type: 'trigger', default: DefaultSettings.ydesign_notch_show_custom },
            field: { name: '3. Метки ситусу (Смотрю / custom-favs)', description: 'Третий блок: ситус перегляду и списки custom-favs' }
        });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 4: СТИЛІ БЕЙДЖІВ ТА РЕЙТИНГИ (ydesign_badges_style)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_badge_shape', type: 'select', values: shapes, default: DefaultSettings.ydesign_badge_shape }, field: { name: 'Форма бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_glass_pill_bg', type: 'trigger', default: DefaultSettings.ydesign_glass_pill_bg }, field: { name: 'Скляна подложка (Liquid Glass)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_badge_darken', type: 'trigger', default: DefaultSettings.ydesign_badge_darken }, field: { name: 'Затемнять бейджи на постерах', description: 'Добавляет затемнённый фон для лучшей читаемости' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_badge_darken_level', type: 'select', values: { '0.15': 'Лёгкое', '0.25': 'Среднее', '0.35': 'Сильное', '0.5': 'Очень сильное', '0.7': 'Максимальное' }, default: DefaultSettings.ydesign_badge_darken_level }, field: { name: 'Степень затемнения бейджей' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_color_age', type: 'trigger', default: DefaultSettings.ydesign_color_age }, field: { name: 'Цветные бейджи вику' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_color_ua', type: 'trigger', default: DefaultSettings.ydesign_color_ua }, field: { name: 'Кольорова плашка UA (Синьо-жови)' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { type: 'title' }, field: { name: 'Окреми рамки для елементив' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_year', type: 'trigger', default: DefaultSettings.ydesign_border_year }, field: { name: 'Рамка для бейджу Року' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_age', type: 'trigger', default: DefaultSettings.ydesign_border_age }, field: { name: 'Рамка для бейджу Вику' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_seasons', type: 'trigger', default: DefaultSettings.ydesign_border_seasons }, field: { name: 'Рамка для бейджу Сезонов/Серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_ua', type: 'trigger', default: DefaultSettings.ydesign_border_ua }, field: { name: 'Рамка для бейджу UA озвучки' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_genres', type: 'trigger', default: DefaultSettings.ydesign_border_genres }, field: { name: 'Рамка для бейджей Жанрив' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_border_ratings', type: 'trigger', default: DefaultSettings.ydesign_border_ratings }, field: { name: 'Рамка для бейджей Рейтингив' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_badges_style', param: { name: 'ydesign_ratings_saturate', type: 'select', values: saturates, default: DefaultSettings.ydesign_ratings_saturate }, field: { name: 'Насиченисть иконок рейтингив' } });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ: ШРИФТИ (ydesign_fonts)
        // -------------------------------------------------------------
        var fontOptions = {
            'golos-montserrat': 'Golos Text + Montserrat (рекомендовано)',
            'golos': 'Golos Text',
            'manrope': 'Manrope',
            'montserrat': 'Montserrat',
            'inter': 'Inter',
            'inter-montserrat': 'Inter + Montserrat',
            'custom': 'Свий шрифт',
            'off': 'Як у Lampa (SegoeUI)'
        };

        Lampa.SettingsApi.addParam({
            component: 'ydesign_fonts',
            param: { name: 'ydesign_font', type: 'select', values: fontOptions, default: DefaultSettings.ydesign_font },
            field: { name: 'Шрифт интерфейсу', description: 'Заванижується з Google Fonts, диє на всю програму' }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_fonts',
            param: { name: 'ydesign_font_family_btn', type: 'button' },
            field: { name: 'Назва власного шрифту', description: getSet('ydesign_font_family') || 'Не вказано (наприклад: Golos Sharp)' },
            onChange: function () {
                Lampa.Input.edit({ title: 'Назва власного шрифту', value: getSet('ydesign_font_family'), free: true, nosave: true }, function (new_val) {
                    if (new_val !== undefined) {
                        Lampa.Storage.set('ydesign_font_family', new_val.trim());
                        fontApply();
                        Lampa.Settings.update();
                    }
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_fonts',
            param: { name: 'ydesign_font_css_btn', type: 'button' },
            field: { name: 'URL CSS власного шрифту', description: getSet('ydesign_font_css') || 'Не вказано (наприклад: http://.../font.css)' },
            onChange: function () {
                Lampa.Input.edit({ title: 'URL CSS власного шрифту', value: getSet('ydesign_font_css'), free: true, nosave: true }, function (new_val) {
                    if (new_val !== undefined) {
                        Lampa.Storage.set('ydesign_font_css', new_val.trim());
                        fontApply();
                        Lampa.Settings.update();
                    }
                });
            }
        });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 5: МОВИ, ЛОГОТИПИ ТА ЯКІСТЬ (ydesign_texts)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_logo_type', type: 'select', values: { 'logo': 'Логотип (зображення)', 'text': 'Текст' }, default: DefaultSettings.ydesign_logo_type }, field: { name: 'Отображение названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_lang', type: 'select', values: { 'ru': 'Русский', 'uk': 'Украинский' }, default: DefaultSettings.ydesign_lang }, field: { name: 'Мова логотипа/названия' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_slogan_lang', type: 'select', values: { 'ru': 'Русский', 'uk': 'Украинский' }, default: DefaultSettings.ydesign_slogan_lang }, field: { name: 'Мова слогана' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_desc_lang', type: 'select', values: { 'ru': 'Русский', 'uk': 'Украинский' }, default: DefaultSettings.ydesign_desc_lang }, field: { name: 'Мова описания пид карткою' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_add_title_lang', type: 'select', values: { 'ru': 'Всегда русский', 'uk': 'Всегда украинский', 'auto': 'Зависит от логотипа' }, default: DefaultSettings.ydesign_add_title_lang }, field: { name: 'Мова додаткової названия' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_poster_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_poster_quality }, field: { name: 'Качество постерив' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_backdrop_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_backdrop_quality }, field: { name: 'Качество бекдропив' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_texts', param: { name: 'ydesign_logo_quality', type: 'select', values: qualities, default: DefaultSettings.ydesign_logo_quality }, field: { name: 'Качество логотипив' } });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 6: РЕДИЗАЙН СЕРІЙ ТА ЕПІЗОДІВ (ydesign_series)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_redesign', type: 'trigger', default: DefaultSettings.ydesign_series_redesign }, field: { name: 'Зминити вигляд серий', description: 'Активувати новий вигляд карточек всередини серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_cards', type: 'select', values: { '1': '1', '2': '2', '3': '3', '4': '4' }, default: DefaultSettings.ydesign_series_cards }, field: { name: 'Количество карточек серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_hide_left_column', type: 'trigger', default: DefaultSettings.ydesign_hide_left_column }, field: { name: 'Прибрати ливу колонку (Сериї)', description: 'Приховує опис и розтягує картки серий на весь екран' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { type: 'title' }, field: { name: 'Размери елементив на картках серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_badge_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_series_badge_size }, field: { name: 'Размер бейджей на сериях' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_title_size', type: 'select', values: textSizesExt, default: DefaultSettings.ydesign_series_title_size }, field: { name: 'Размер названия сериї' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { type: 'title' }, field: { name: 'Стиль и бейджи на картках серий' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_badge_shape', type: 'select', values: shapes, default: DefaultSettings.ydesign_series_badge_shape }, field: { name: 'Форма бейджей на сериях' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_glass_pill', type: 'trigger', default: DefaultSettings.ydesign_series_glass_pill }, field: { name: 'Скляна подложка (Liquid Glass)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_border_badges', type: 'trigger', default: DefaultSettings.ydesign_series_border_badges }, field: { name: 'Рамка для бейджей серий' } });

        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_show_date', type: 'trigger', default: DefaultSettings.ydesign_series_show_date }, field: { name: 'Показывать дату виходу (зверху ливоруч)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_show_voice', type: 'trigger', default: DefaultSettings.ydesign_series_show_voice }, field: { name: 'Показывать студию озвучки (окремим рядком)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_show_rate', type: 'trigger', default: DefaultSettings.ydesign_series_show_rate }, field: { name: 'Показывать рейтинг (зверху праворуч)' } });
        Lampa.SettingsApi.addParam({ component: 'ydesign_series', param: { name: 'ydesign_series_show_time', type: 'trigger', default: DefaultSettings.ydesign_series_show_time }, field: { name: 'Показывать тривалисть сериї (знизу праворуч)' } });

        // -------------------------------------------------------------
        // ПОДКАТЕГОРИЯ 7: API КЛЮЧІ, КЕШ ТА ПІДТРИМКА (ydesign_perf)
        // -------------------------------------------------------------
        Lampa.SettingsApi.addParam({
            component: 'ydesign_perf',
            param: { name: 'ydesign_omdb_key_btn', type: 'button' },
            field: { name: 'OMDB API Key', description: getSet('ydesign_omdb_key') ? 'Всиновлено' : 'Не всиновлено' },
            onChange: function () {
                Lampa.Input.edit({ title: 'OMDB API Key', value: getSet('ydesign_omdb_key'), free: true, nosave: true }, function (new_val) {
                    if (new_val !== undefined) { Lampa.Storage.set('ydesign_omdb_key', new_val.trim()); Lampa.Settings.update(); }
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_perf',
            param: { name: 'ydesign_mdblist_key_btn', type: 'button' },
            field: { name: 'MDBList API Key', description: getSet('ydesign_mdblist_key') ? 'Всиновлено' : 'Не всиновлено' },
            onChange: function () {
                Lampa.Input.edit({ title: 'MDBList API Key', value: getSet('ydesign_mdblist_key'), free: true, nosave: true }, function (new_val) {
                    if (new_val !== undefined) { Lampa.Storage.set('ydesign_mdblist_key', new_val.trim()); Lampa.Settings.update(); }
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'ydesign_perf',
            param: { name: 'ydesign_clear_cache', type: 'button' },
            field: { name: 'Очистити кеш плагина', description: 'Видаляє кеш изображений, рейтингив и перевирок озвучки' },
            onChange: function () {
                MemoryCache.clear();
                var keysToRemove = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && (key.indexOf('ydesign_c_') === 0 || key.indexOf('ydesign_cache_') === 0)) keysToRemove.push(key);
                }
                keysToRemove.forEach(function (k) { localStorage.removeItem(k); });
                Lampa.Noty.show('Кэш плагина успишно очищено (' + keysToRemove.length + ' записив)');
            }
        });

        Lampa.Settings.listener.follow('change', function (e) {
            if (e && e.name && e.name.indexOf('ydesign_') !== -1) {
                if (e.name === 'ydesign_font' || e.name === 'ydesign_font_family' || e.name === 'ydesign_font_css') {
                    fontApply();
                }

                applyDynamicCSS();

                var notchCardParams = [
                    'ydesign_notch_show', 'ydesign_notch_show_type',
                    'ydesign_notch_show_standard', 'ydesign_notch_show_custom',
                    'ydesign_notch_std_monochrome'
                ];
                if (notchCardParams.indexOf(e.name) !== -1) {
                    document.querySelectorAll('.ydesign-card').forEach(function (c) {
                        if (c._ydesign_updateNotch) c._ydesign_updateNotch();
                    });
                }

                var nonCssParams = [
                    'ydesign_preset', 'ydesign_poster_saturation', 'ydesign_poster_contrast', 'ydesign_badge_darken', 'ydesign_badge_darken_level',
                    'ydesign_lang', 'ydesign_slogan_lang', 'ydesign_desc_lang', 'ydesign_add_title_lang',
                    'ydesign_poster_quality', 'ydesign_backdrop_quality', 'ydesign_logo_quality',
                    'ydesign_ratings_order', 'ydesign_omdb_key', 'ydesign_mdblist_key',
                    'ydesign_v_show_genres', 'ydesign_h_show_genres',
                    'ydesign_v_show_add_title', 'ydesign_h_show_add_title',
                    'ydesign_v_show_slogan', 'ydesign_h_show_slogan',
                    'ydesign_h_show_desc'
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

            if (CardMaker.Favorite) {
                var originalFavoriteOnUpdate = CardMaker.Favorite.onUpdate;
                CardMaker.Favorite.onUpdate = function () {
                    if (typeof originalFavoriteOnUpdate === 'function') {
                        originalFavoriteOnUpdate.apply(this, arguments);
                    }
                    if (this.html) {
                        var cardEl = this.html[0] || this.html;
                        if (cardEl && cardEl._ydesign_updateNotch) {
                            cardEl._ydesign_updateNotch();
                        }
                    }
                };
            }

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
    // 13. ПОКРАЩЕНИЙ РЕДИЗАЙН СЕРІЙ ТА ЕПІЗОДІВ
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
        
        var epMatch = /(?:епизод|серия|серия|episode|ep)\s*(\d+)|(\d+)\s*(?:епизод|серия|серия|episode|ep)/i.exec(rawText);
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
            var urlUk = 'https://api.themoviedb.org/3/tv/' + tvId + '/season/' + seasonNum + '?api_key=' + tmdbKey + '&language=uk-UA';
            
            $.ajax({
                url: urlUk,
                timeout: 5000,
                success: function (dataUk) {
                    var needEn = false;
                    if (dataUk && dataUk.episodes && dataUk.episodes.length) {
                        for (var i = 0; i < dataUk.episodes.length; i++) {
                            var eName = (dataUk.episodes[i].name || '').trim();
                            if (!eName || eName.indexOf('Епизод') === 0 || eName.indexOf('Эпизод') === 0 || eName.indexOf('Episode') === 0) {
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
                                            if (!uName || uName.indexOf('Епизод') === 0 || uName.indexOf('Эпизод') === 0 || uName === ('Episode ' + epUk.episode_number)) {
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
            var urlMovie = 'https://api.themoviedb.org/3/movie/' + movieId + '?api_key=' + tmdbKey + '&language=uk-UA';
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
                            title: episode ? ('Епизод ' + episode) : ('Сезон ' + sNum),
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
                            var epTitle = ep.name || ('Епизод ' + episode);
                            
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
                                title: 'Епизод ' + episode,
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
            if (txt.indexOf('истори') !== -1 || txt.indexOf('истори') !== -1 || txt.indexOf('history') !== -1) {
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
                    shade.style.background = 'linear-gradient(to top, ' + rgba65 + ' 0%, ' + rgba20 + ' 35%, transparent 65%)';
                }
            });
        }

        var infoBlock = card.querySelector('.online-prestige__info');
        var rawText = infoBlock ? infoBlock.innerText : '';

        var monthNames = '(?:Сичня|Лютого|Березня|Квитня|Травня|Червня|Липня|Серпня|Вересня|Жовтня|Листопада|Грудня|января|февраля|мари|апреля|мая|июня|июля|авгуси|сентября|октября|ноября|декабря|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)';
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
                cleanTitleEl.innerText = 'Епизод ' + eNum + '...';
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
    // 14. ГОЛОВНИЙ СТАРТ ТА ПЕРЕВІРКА ДЖЕРЕЛА
    // =========================================================================
    var YDesignRecovery = {
        installed: false,
        recovering: false,
        attempts: 0,
        timer: null,
        lastError: 0
    };

    function recoverYDesign(reason) {
        var now = Date.now();
        if (YDesignRecovery.recovering || now - YDesignRecovery.lastError < 1500) return;
        YDesignRecovery.lastError = now;
        YDesignRecovery.recovering = true;
        try {
            var style = document.getElementById('ydesign-style-block');
            if (!style) injectCSS();
            applyDynamicCSS();
            fontApply();
            document.body.classList.add('ydesign-active');
            document.querySelectorAll('.ydesign-card').forEach(function (card) {
                try {
                    if (card._ydesign_data) buildCardCustomDOM(card, card._ydesign_data);
                    if (card._ydesign_updateNotch) card._ydesign_updateNotch();
                } catch (e) {}
            });
            if (window.Lampa && Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
            if (window.Lampa && Lampa.Noty && reason === 'init') Lampa.Noty.show('YDesign восстановлен после сбоя');
        } catch (e) {
            YDesignRecovery.attempts += 1;
        }
        setTimeout(function () { YDesignRecovery.recovering = false; }, 500);
    }

    function installRecovery() {
        if (YDesignRecovery.installed) return;
        YDesignRecovery.installed = true;
        window.addEventListener('error', function (event) {
            var source = event && event.filename ? String(event.filename) : '';
            if (source.indexOf('ydesign') !== -1 || (event && event.error && String(event.error.stack || '').indexOf('ydesign') !== -1)) {
                recoverYDesign('error');
            }
        });
        window.addEventListener('unhandledrejection', function (event) {
            var text = event && event.reason ? String(event.reason.stack || event.reason) : '';
            if (text.indexOf('YDesign') !== -1 || text.indexOf('ydesign') !== -1) recoverYDesign('promise');
        });
        YDesignRecovery.timer = setInterval(function () {
            if (!document.body || document.hidden) return;
            var active = document.body.classList.contains('ydesign-active');
            var style = document.getElementById('ydesign-style-block');
            if (active && !style) recoverYDesign('watchdog');
        }, 5000);
    }

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
                            Lampa.Noty.show('Для роботи YDesign потрибно обрати джерелом TMDB или CUB (Поточне: ' + currentSource + ')');
                        }
                    }, 2500);
                }
            }

            injectCSS();
            applyDynamicCSS();
            fontApply();

            if (window.Lampa && Lampa.Storage && Lampa.Storage.listener) {
                Lampa.Storage.listener.follow('change', function (e) {
                    if (e && e.name && e.name.indexOf('ydesign_') === 0) {
                        applyDynamicCSS();
                        if (e.name === 'ydesign_font' || e.name === 'ydesign_font_family' || e.name === 'ydesign_font_css') {
                            fontApply();
                        }
                    }
                });
            }

            if (window.Lampa && Lampa.Listener) {
                Lampa.Listener.follow('state:changed', function (e) {
                    if (e && (e.target === 'favorite' || e.name === 'favorite')) {
                        document.querySelectorAll('.ydesign-card').forEach(function (c) {
                            if (c._ydesign_updateNotch) {
                                if (!e.card || (c._ydesign_data && c._ydesign_data.id == e.card.id)) {
                                    c._ydesign_updateNotch();
                                }
                            }
                        });
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

            console.log('Lampa Plugin: ' + CONFIG.name + ' by ' + CONFIG.author + ' successfully loaded.');
        } catch (e) {
            console.error('YDesign init error:', e);
            if (YDesignRecovery.attempts < 3) {
                YDesignRecovery.attempts += 1;
                setTimeout(function () { recoverYDesign('init'); init(); }, 1200 * YDesignRecovery.attempts);
            }
        }
    }

    hookTemplates();
    installRecovery();

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
