(function () {
    'use strict';

    // Плагин работает только на Android TV / TV-приставках
    if (!Lampa.Device.isTV()) return;

    // Кеш логотипов
    var logoCache = {};
    var slideshowTimer;
    var pluginPath = 'https://crowley24.github.io/NewIcons/';

    // Настройки по умолчанию (адаптированы для ТВ)
    var settings_list = [
        { id: 'tv_interface_animation', default: true },
        { id: 'tv_interface_slideshow', default: true },
        { id: 'tv_interface_slideshow_time', default: '15000' },
        { id: 'tv_interface_slideshow_quality', default: 'w1280' },
        { id: 'tv_interface_logo_size', default: '180' },
        { id: 'tv_interface_logo_quality', default: 'w500' },
        { id: 'tv_interface_show_tagline', default: true },
        { id: 'tv_interface_blocks_gap', default: '16px' },
        { id: 'tv_interface_ratings_size', default: '0.6em' },
        { id: 'tv_interface_studios', default: true },
        { id: 'tv_interface_studios_bg_opacity', default: '0.15' },
        { id: 'tv_interface_quality', default: true },
        { id: 'tv_interface_enabled', default: true } // мастер-переключатель
    ];

    // Инициализация настроек
    settings_list.forEach(function (opt) {
        if (Lampa.Storage.get(opt.id, 'unset') === 'unset') {
            Lampa.Storage.set(opt.id, opt.default);
        }
    });

    // Иконки для качества
    var svgIcons = {
        '4K': pluginPath + '4K.svg',
        '2K': pluginPath + '2K.svg',
        'FULL HD': pluginPath + 'FULL HD.svg',
        'HD': pluginPath + 'HD.svg',
        'HDR': pluginPath + 'HDR.svg',
        'Dolby Vision': pluginPath + 'Dolby Vision.svg',
        '7.1': pluginPath + '7.1.svg',
        '5.1': pluginPath + '5.1.svg',
        '4.0': pluginPath + '4.0.svg',
        '2.0': pluginPath + '2.0.svg',
        'DUB': pluginPath + 'DUB.svg',
        'UKR': pluginPath + 'UKR.svg'
    };

    var ratingIcons = {
        tmdb: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tmdb.new.logo.svg',
        cub: 'https://raw.githubusercontent.com/yumata/lampa/9381985ad4371d2a7d5eb5ca8e3daf0f32669eb7/img/logo-icon.svg'
    };

    // -------------------- СТИЛИ ИНТЕРФЕЙСА (TV) --------------------
    function applyStyles() {
        // Удаляем старые стили
        var oldStyle = document.getElementById('tv-interface-styles');
        if (oldStyle) oldStyle.parentNode.removeChild(oldStyle);

        // Если плагин отключён — ничего не делаем
        if (!Lampa.Storage.get('tv_interface_enabled', true)) return;

        // Добавляем класс tv-mode к body
        document.body.classList.add('tv-mode');

        var isAnimationEnabled = Lampa.Storage.get('tv_interface_animation');
        var bgOpacity = Lampa.Storage.get('tv_interface_studios_bg_opacity', '0.15');
        var rSize = Lampa.Storage.get('tv_interface_ratings_size', '0.6em');
        var lHeight = Lampa.Storage.get('tv_interface_logo_size', '180');
        var showTagline = Lampa.Storage.get('tv_interface_show_tagline');
        var blocksGap = Lampa.Storage.get('tv_interface_blocks_gap', '16px');

        var style = document.createElement('style');
        style.id = 'tv-interface-styles';

        var css = `
            @keyframes kenBurnsEffect {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            @keyframes qb_in {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Стили применяются только при наличии класса tv-mode */
            body.tv-mode .full-start-new__details,
            body.tv-mode .full-start-new__poster {
                position: relative !important;
                overflow: hidden !important;
                background: #000;
                z-index: 1;
                height: 70vh !important;
                pointer-events: none !important;
            }
            body.tv-mode .full-start-new__poster img {
                ${isAnimationEnabled ? 'animation: kenBurnsEffect 25s ease-in-out infinite !important;' : ''}
                transform-origin: center center !important;
                transition: opacity 1.5s ease-in-out !important;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                mask-image: linear-gradient(to bottom, #000 0%, #000 60%, transparent 100%) !important;
                -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 60%, transparent 100%) !important;
            }
            body.tv-mode .full-start-new__right {
                background: none !important;
                margin-top: -180px !important;
                z-index: 2 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                padding: 0 20px !important;
                gap: ${blocksGap} !important;
            }
            body.tv-mode .full-start-new__right > div:first-child {
                margin: 0 !important;
                font-size: 1.2em !important;
                opacity: 0.8;
                order: 1;
            }
            body.tv-mode .full-start-new__title {
                width: 100% !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                margin: 10px 0 !important;
                min-height: 80px;
                order: 2;
                overflow: visible !important;
            }
            body.tv-mode .full-start-new__title img {
                height: auto !important;
                max-height: ${lHeight}px !important;
                width: auto !important;
                max-width: 80vw !important;
                object-fit: contain !important;
                filter: drop-shadow(0 0 20px rgba(0,0,0,0.9));
                margin: 0 !important;
            }
            body.tv-mode .full-start-new__tagline {
                display: ${showTagline ? 'block' : 'none'} !important;
                font-style: italic !important;
                opacity: 0.85 !important;
                font-size: 1.3em !important;
                margin: 0 !important;
                color: #fff !important;
                text-align: center !important;
                order: 3;
            }
            body.tv-mode .plugin-ratings-row {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                gap: 16px;
                margin: 0 !important;
                font-size: calc(${rSize} * 2.8);
                width: 100%;
                order: 4;
            }
            body.tv-mode .plugin-rating-item,
            body.tv-mode .plugin-extra-info {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 700;
                color: #fff;
            }
            body.tv-mode .plugin-rating-item img {
                height: 1.2em;
                width: auto;
            }
            body.tv-mode .plugin-extra-info {
                font-weight: 400;
                opacity: 0.9;
            }
            body.tv-mode .plugin-info-block {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: ${blocksGap};
                margin: 0 !important;
                width: 100%;
                order: 5;
            }
            body.tv-mode .studio-row,
            body.tv-mode .quality-row {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
                width: 100%;
            }
            body.tv-mode .studio-item {
                height: 4em !important;
                opacity: 0;
                animation: qb_in 0.4s ease forwards;
                padding: 8px 16px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                ${bgOpacity !== '0' ? `background: rgba(255, 255, 255, ${bgOpacity}); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);` : ''}
            }
            body.tv-mode .quality-item {
                height: 3em;
                opacity: 0;
                animation: qb_in 0.4s ease forwards;
            }
            body.tv-mode .studio-item img,
            body.tv-mode .quality-item img {
                height: 100%;
                width: auto;
                object-fit: contain;
            }
            body.tv-mode .full-start-new__buttons {
                display: flex !important;
                justify-content: center !important;
                gap: 20px !important;
                width: 100% !important;
                margin-top: 10px !important;
                order: 6;
            }
            body.tv-mode .full-start-new .full-start__button {
                background: none !important;
                border: none !important;
                box-shadow: none !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                width: 90px !important;
            }
            body.tv-mode .full-start-new .full-start__button svg,
            body.tv-mode .full-start-new .full-start__button img {
                width: 36px !important;
                height: 36px !important;
                margin-bottom: 8px !important;
                fill: #fff !important;
            }
            body.tv-mode .full-start-new .full-start__button span {
                font-size: 12px !important;
                text-transform: uppercase !important;
                opacity: 0.8 !important;
            }
            /* Делаем возрастные рейтинги и прочую информацию видимой */
            body.tv-mode .full-start-new__age,
            body.tv-mode .full-start__age,
            body.tv-mode [class*="rating-count"],
            body.tv-mode [class*="status"] {
                display: flex !important;
            }
        `;

        style.textContent = css;
        document.head.appendChild(style);
    }

    // -------------------- ЛОГИКА РЕЙТИНГОВ --------------------
    function getRatingColor(val) {
        var n = parseFloat(val);
        if (n >= 7.5) return '#2ecc71';
        if (n >= 6) return '#feca57';
        if (n > 0) return '#ff4d4d';
        return '#fff';
    }

    function getCubRating(e) {
        if (!e.data || !e.data.reactions || !e.data.reactions.result) return null;
        var reactionCoef = { fire: 10, nice: 7.5, think: 5, bore: 2.5, shit: 0 };
        var sum = 0, cnt = 0;
        e.data.reactions.result.forEach(function(r) {
            if (r.counter) {
                sum += (r.counter * reactionCoef[r.type]);
                cnt += r.counter;
            }
        });
        if (cnt >= 5) {
            var isTv = e.object.method === 'tv';
            var avg = isTv ? 7.4 : 6.5;
            var m = isTv ? 50 : 150;
            return ((avg * m + sum) / (m + cnt)).toFixed(1);
        }
        return null;
    }

    function formatRuntime(minutes) {
        if (!minutes) return '';
        var h = Math.floor(minutes / 60);
        var m = minutes % 60;
        return (h > 0 ? h + 'ч ' : '') + m + 'мин';
    }

    function renderRatings(container, e) {
        container.find('.plugin-ratings-row').remove();
        var $row = $('<div class="plugin-ratings-row"></div>');
        var movie = e.data.movie;

        var tmdb = parseFloat(movie.vote_average || 0).toFixed(1);
        if (tmdb > 0) {
            $row.append('<div class="plugin-rating-item"><img src="'+ratingIcons.tmdb+'"> <span style="color:'+getRatingColor(tmdb)+'">'+tmdb+'</span></div>');
        }
        var cub = getCubRating(e);
        if (cub) {
            $row.append('<div class="plugin-rating-item"><img src="' + ratingIcons.cub + '"> <span style="color:' + getRatingColor(cub) + '">' + cub + '</span></div>');
        }

        var runtime = formatRuntime(movie.runtime || movie.episode_run_time);
        var genres = (movie.genres || []).slice(0, 1).map(function(g){ return g.name; }).join(', ');
        if (runtime || genres) {
            var info = (runtime ? runtime : '') + (runtime && genres ? ' • ' : '') + (genres ? genres : '');
            $row.append('<div class="plugin-extra-info">' + info + '</div>');
        }

        var $target = container.find('.full-start-new__tagline');
        if (!$target.length || !Lampa.Storage.get('tv_interface_show_tagline')) {
            $target = container.find('.full-start-new__title');
        }
        $target.after($row);
    }

    // -------------------- ЛОГИКА СТУДИЙ --------------------
    function renderStudioLogos(container, data) {
        if (!Lampa.Storage.get('tv_interface_studios')) return;
        var logos = [];
        [data.networks, data.production_companies].forEach(function(source) {
            if (source) source.forEach(function(item) {
                if (item.logo_path) {
                    var url = Lampa.Api.img(item.logo_path, 'w200');
                    if (!logos.some(function(l) { return l.url === url; })) {
                        logos.push({ url: url, name: item.name });
                    }
                }
            });
        });

        logos.forEach(function(logo) {
            var id = 'lg_' + Math.random().toString(36).substr(2, 9);
            container.append('<div class="studio-item" id="'+id+'"><img src="'+logo.url+'" loading="lazy"></div>');
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = this.width;
                canvas.height = this.height;
                ctx.drawImage(this, 0, 0);
                try {
                    var d = ctx.getImageData(0,0,canvas.width,canvas.height).data;
                    var r=0, g=0, b=0, c=0;
                    for(var i=0; i<d.length; i+=4) {
                        if(d[i+3]>50) {
                            r+=d[i]; g+=d[i+1]; b+=d[i+2]; c++;
                        }
                    }
                    if(c > 0 && (0.299*r + 0.587*g + 0.114*b) / c < 40) {
                        $('#'+id+' img').css('filter', 'brightness(0) invert(1)');
                    }
                } catch(e) {}
            };
            img.src = logo.url;
        });
    }

    // -------------------- АНАЛИЗ КАЧЕСТВА --------------------
    function getBestResults(results) {
        var best = {
            resolution: null,
            hdr: false,
            dolbyVision: false,
            dub: false,
            ukr: false
        };
        if (!results) return best;
        results.slice(0, 15).forEach(function(item) {
            var t = (item.Title || '').toLowerCase();
            if (t.indexOf('ukr')>=0 || t.indexOf('укр')>=0) best.ukr = true;
            var res = t.indexOf('4k')>=0 ? '4K' : t.indexOf('2k')>=0 ? '2K' : t.indexOf('1080')>=0 ? 'FULL HD' : t.indexOf('720')>=0 ? 'HD' : null;
            if (res && (!best.resolution || ['HD', 'FULL HD', '2K', '4K'].indexOf(res) > ['HD', 'FULL HD', '2K', '4K'].indexOf(best.resolution))) {
                best.resolution = res;
            }
            if (t.indexOf('vision')>=0 || t.indexOf(' dv ')>=0) best.dolbyVision = true;
            if (t.indexOf('hdr')>=0) best.hdr = true;
            if (t.indexOf('dub')>=0 || t.indexOf('дуб')>=0) best.dub = true;
        });
        return best;
    }

    // -------------------- ЗАГРУЗКА ЛОГОТИПА --------------------
    function loadMovieLogo(movie, $container) {
        var movieId = movie.id + (movie.name ? '_tv' : '_movie');
        if (logoCache[movieId]) {
            $container.html('<img src="' + logoCache[movieId] + '">');
            return;
        }

        $.ajax({
            url: 'https://api.themoviedb.org/3/' + (movie.name ? 'tv' : 'movie') + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key(),
            success: function(res) {
                // Приоритет языков: русский, украинский, английский
                var langPriority = ['ru', 'uk', 'en'];
                var logo = null;
                for (var i = 0; i < langPriority.length; i++) {
                    logo = res.logos.filter(l => l.iso_639_1 === langPriority[i])[0];
                    if (logo) break;
                }
                if (!logo) logo = res.logos[0]; // любой

                if (logo) {
                    var url = Lampa.TMDB.image('/t/p/' + Lampa.Storage.get('tv_interface_logo_quality', 'w500') + logo.file_path.replace('.svg', '.png'));
                    logoCache[movieId] = url;
                    $container.html('<img src="' + url + '">');
                }

                if (res.backdrops && res.backdrops.length > 1) {
                    startPosterSlideshow($('.full-start-new__poster'), res.backdrops.slice(0, 15));
                }
            }
        });
    }

    // -------------------- СЛАЙД-ШОУ --------------------
    function startPosterSlideshow($poster, items) {
        if (!Lampa.Storage.get('tv_interface_slideshow')) return;
        var index = 0;
        clearInterval(slideshowTimer);
        slideshowTimer = setInterval(function() {
            index = (index + 1) % items.length;
            var imgUrl = Lampa.TMDB.image('/t/p/' + Lampa.Storage.get('tv_interface_slideshow_quality', 'w1280') + items[index].file_path);
            var $current = $poster.find('img').first();
            var nextImg = new Image();
            nextImg.onload = function() {
                var $next = $('<img src="' + imgUrl + '" style="opacity: 0; transition: opacity 1.5s ease-in-out;">');
                $poster.append($next);
                setTimeout(function() {
                    $next.css('opacity', '1');
                    $current.css('opacity', '0');
                    setTimeout(function(){ $current.remove(); }, 1500);
                }, 100);
            };
            nextImg.src = imgUrl;
        }, parseInt(Lampa.Storage.get('tv_interface_slideshow_time', '15000')));
    }

    // -------------------- ИНИЦИАЛИЗАЦИЯ --------------------
    function init() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'destroy') {
                clearInterval(slideshowTimer);
                return;
            }

            // Применяем только если плагин включён
            if (!Lampa.Storage.get('tv_interface_enabled', true)) return;

            // Реагируем на завершение загрузки страницы фильма
            if (e.type === 'complite' || e.type === 'complete') {
                var movie = e.data.movie;
                var $render = e.object.activity.render();

                loadMovieLogo(movie, $render.find('.full-start-new__title'));
                renderRatings($render.find('.full-start-new__right'), e);

                $('.plugin-info-block').remove();
                var $info = $('<div class="plugin-info-block"><div class="studio-row"></div><div class="quality-row"></div></div>');
                $render.find('.full-start-new__right').append($info);
                renderStudioLogos($info.find('.studio-row'), movie);

                if (Lampa.Storage.get('tv_interface_quality') && Lampa.Parser.get) {
                    Lampa.Parser.get({
                        search: movie.title || movie.name,
                        movie: movie,
                        page: 1
                    }, function(res) {
                        if (res && res.Results) {
                            var b = getBestResults(res.Results);
                            var list = [];
                            if (b.resolution) list.push(b.resolution);
                            if (b.dolbyVision) list.push('Dolby Vision');
                            else if (b.hdr) list.push('HDR');
                            if (b.dub) list.push('DUB');
                            if (b.ukr) list.push('UKR');
                            list.forEach(function(t, i) {
                                if (svgIcons[t]) {
                                    $info.find('.quality-row').append('<div class="quality-item" style="animation-delay:'+(i*0.1)+'s"><img src="'+svgIcons[t]+'"></div>');
                                }
                            });
                        }
                    });
                }
            }
        });
    }

    // -------------------- ПАНЕЛЬ НАСТРОЕК --------------------
    function setupSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'tv_interface',
            name: 'ТВ интерфейс',
            icon: '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9 8h2v8H9zm4 0h2v8h-2z" fill="white"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: { name: 'tv_interface_enabled', type: 'trigger', default: true },
            field: { name: 'Включить ТВ интерфейс' },
            onChange: function() {
                if (Lampa.Storage.get('tv_interface_enabled')) {
                    document.body.classList.add('tv-mode');
                    applyStyles();
                } else {
                    document.body.classList.remove('tv-mode');
                    var oldStyle = document.getElementById('tv-interface-styles');
                    if (oldStyle) oldStyle.parentNode.removeChild(oldStyle);
                }
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: { name: 'tv_interface_animation', type: 'trigger', default: true },
            field: { name: 'Анимация постера' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: { name: 'tv_interface_slideshow', type: 'trigger', default: true },
            field: { name: 'Слайд-шоу постера' }
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: {
                name: 'tv_interface_slideshow_time',
                type: 'select',
                values: { '10000': '10с', '15000': '15с', '20000': '20с' },
                default: '15000'
            },
            field: { name: 'Интервал слайд-шоу' }
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: {
                name: 'tv_interface_slideshow_quality',
                type: 'select',
                values: { 'w300': '300px', 'w780': '780px', 'w1280': '1280px', 'original': 'Оригинал' },
                default: 'w1280'
            },
            field: { name: 'Качество фона слайд-шоу' }
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: {
                name: 'tv_interface_logo_size',
                type: 'select',
                values: { '150': 'Малый', '180': 'Средний', '210': 'Большой', '240': 'Очень большой' },
                default: '180'
            },
            field: { name: 'Высота логотипа' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: {
                name: 'tv_interface_logo_quality',
                type: 'select',
                values: { 'w300': '300px', 'w500': '500px', 'original': 'Оригинал' },
                default: 'w500'
            },
            field: { name: 'Качество логотипа' }
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: { name: 'tv_interface_show_tagline', type: 'trigger', default: true },
            field: { name: 'Показывать слоган' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: {
                name: 'tv_interface_blocks_gap',
                type: 'select',
                values: { '8px': 'Компактный', '16px': 'Стандартный', '24px': 'Просторный', '32px': 'Панорамный' },
                default: '16px'
            },
            field: { name: 'Отступы между блоками' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: {
                name: 'tv_interface_ratings_size',
                type: 'select',
                values: { '0.5em': 'Малый', '0.6em': 'Средний', '0.7em': 'Большой', '0.8em': 'Максимальный' },
                default: '0.6em'
            },
            field: { name: 'Размер рейтингов' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: { name: 'tv_interface_studios', type: 'trigger', default: true },
            field: { name: 'Показывать студии' }
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: {
                name: 'tv_interface_studios_bg_opacity',
                type: 'select',
                values: { '0': 'Выключен', '0.08': 'Легкий', '0.2': 'Средний', '0.4': 'Светлый' },
                default: '0.15'
            },
            field: { name: 'Фон студий' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'tv_interface',
            param: { name: 'tv_interface_quality', type: 'trigger', default: true },
            field: { name: 'Показывать качество' }
        });
    }

    // -------------------- ЗАПУСК --------------------
    function startPlugin() {
        applyStyles();
        setupSettings();
        init();
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();