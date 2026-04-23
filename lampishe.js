(function () {
    'use strict';

    if (window.lampishe_plugin_ready) return;
    window.lampishe_plugin_ready = true;

    var PLUGIN_NAME = 'LAMP!SHE';
    var PLUGIN_VERSION = '1.0.0';

    /* =========================================================
       1. СТИЛИ: лого, постеры, шапка, карточки, анимации
       ========================================================= */
    function injectStyles() {
        var css = `
        /* ===== LOGO LAMP!SHE (сочный градиент для ATV) ===== */
        .head__logo,
        .settings--account .settings-folder__name,
        .lampishe-logo {
            position: relative;
            display: inline-flex !important;
            align-items: center;
            font-family: 'Helvetica Neue', 'Roboto', Arial, sans-serif !important;
            font-weight: 900 !important;
            font-size: 1.6em !important;
            letter-spacing: 0.04em !important;
            text-transform: uppercase;
            background: linear-gradient(92deg,
                #ff2d55 0%,
                #ff3b30 25%,
                #ff9500 50%,
                #ff2d55 75%,
                #af52de 100%);
            background-size: 300% 300%;
            -webkit-background-clip: text !important;
            background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            color: transparent !important;
            text-shadow: 0 0 18px rgba(255, 45, 85, .35);
            filter: drop-shadow(0 2px 14px rgba(255, 60, 90, .35));
            animation: lampisheHueShift 6s ease-in-out infinite;
            transition: transform .35s cubic-bezier(.2,.9,.25,1), filter .35s ease;
        }
        .head__logo:hover,
        .head__logo.focus { 
            transform: scale(1.06);
            filter: drop-shadow(0 4px 22px rgba(255, 60, 90, .65));
        }

        @keyframes lampisheHueShift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* ===== ШАПКА (header) ===== */
        .head {
            background: linear-gradient(180deg, rgba(0,0,0,.65), rgba(0,0,0,0)) !important;
            border: none !important;
            backdrop-filter: blur(12px);
        }
        .head__action.focus,
        .head__action:hover {
            background: linear-gradient(135deg, #ff2d55, #af52de) !important;
            box-shadow: 0 6px 22px rgba(255,45,85,.55);
            border-radius: 1.2em !important;
            transform: scale(1.08);
            transition: all .35s cubic-bezier(.2,.9,.25,1);
        }

        /* ===== ПОСТЕРЫ — СОЧНАЯ АНИМАЦИЯ ===== */
        .card,
        .card-more {
            transition:
                transform .45s cubic-bezier(.2, .9, .25, 1.05),
                box-shadow .45s ease,
                filter .45s ease !important;
            will-change: transform;
        }
        .card .card__view,
        .card-more .card-more__box {
            position: relative;
            overflow: hidden;
            border-radius: 1.1em;
            transition: transform .45s cubic-bezier(.2,.9,.25,1.05),
                        box-shadow .45s ease,
                        filter .45s ease;
        }
        .card .card__img,
        .card-more .card-more__box img {
            transition: transform .9s cubic-bezier(.2,.9,.25,1) !important;
            border-radius: 1.1em;
        }

        /* HOVER / FOCUS — главная фишка */
        .card.focus,
        .card.hover,
        .card-more.focus {
            z-index: 5;
            transform: scale(1.12) translateY(-8px) !important;
        }
        .card.focus .card__view,
        .card.hover .card__view,
        .card-more.focus .card-more__box {
            box-shadow:
                0 0 0 3px rgba(255, 45, 85, .9),
                0 18px 48px -8px rgba(255, 45, 85, .55),
                0 0 60px rgba(175, 82, 222, .35) !important;
            filter: saturate(1.25) contrast(1.05);
            animation: lampisheGlow 2.4s ease-in-out infinite;
        }
        .card.focus .card__img,
        .card.hover .card__img {
            transform: scale(1.08);
        }

        @keyframes lampisheGlow {
            0%, 100% {
                box-shadow:
                    0 0 0 3px rgba(255, 45, 85, .9),
                    0 18px 48px -8px rgba(255, 45, 85, .55),
                    0 0 60px rgba(175, 82, 222, .35);
            }
            50% {
                box-shadow:
                    0 0 0 3px rgba(255, 149, 0, .95),
                    0 22px 60px -6px rgba(255, 149, 0, .55),
                    0 0 80px rgba(255, 45, 85, .55);
            }
        }

        /* Блик-перелив поверх постера */
        .card .card__view::before {
            content: '';
            position: absolute;
            top: 0; left: -120%;
            width: 60%; height: 100%;
            background: linear-gradient(110deg,
                transparent 0%,
                rgba(255,255,255,.18) 45%,
                rgba(255,255,255,.45) 50%,
                rgba(255,255,255,.18) 55%,
                transparent 100%);
            transform: skewX(-18deg);
            transition: left .9s ease;
            pointer-events: none;
            z-index: 3;
        }
        .card.focus .card__view::before,
        .card.hover .card__view::before {
            left: 140%;
        }

        /* Рейтинг — сочный «таблетка-бейдж» как на скринах */
        .card__vote {
            background: linear-gradient(135deg, #ff2d55, #ff9500) !important;
            color: #fff !important;
            font-weight: 800 !important;
            border-radius: .55em !important;
            padding: .25em .55em !important;
            box-shadow: 0 4px 14px rgba(255,45,85,.5);
            border: none !important;
        }
        .card__type {
            background: linear-gradient(135deg, #af52de, #ff2d55) !important;
            color: #fff !important;
            font-weight: 800 !important;
            border-radius: .4em !important;
            box-shadow: 0 4px 12px rgba(175,82,222,.5);
            border: none !important;
        }

        /* ===== «Сейчас смотрят», категории ===== */
        .items-line__title,
        .category-full__title,
        .scroll__body > .empty-title,
        .full-start__title {
            font-weight: 800 !important;
            letter-spacing: .02em;
        }

        /* Главный «герой»-баннер ВЕНОМ-стиль */
        .full-start-new__title,
        .full-start__title {
            font-weight: 900 !important;
            font-size: 4.2em !important;
            line-height: .95 !important;
            letter-spacing: .01em;
            text-transform: uppercase;
            background: linear-gradient(180deg, #ffffff 0%, #c8c8d0 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 8px 28px rgba(0,0,0,.55);
            animation: lampisheHeroIn .9s cubic-bezier(.2,.9,.25,1) both;
        }
        @keyframes lampisheHeroIn {
            from { opacity: 0; transform: translateY(28px) scale(.96); filter: blur(8px); }
            to   { opacity: 1; transform: translateY(0)    scale(1);   filter: blur(0); }
        }

        .full-start-new__rate-line,
        .full-start__rate {
            animation: lampisheHeroIn 1.1s .15s cubic-bezier(.2,.9,.25,1) both;
        }
        .full-start-new__details > * {
            animation: lampisheHeroIn 1.1s .25s cubic-bezier(.2,.9,.25,1) both;
        }

        /* Плашка рейтинга TMDB как на скрине 2 */
        .full-start-new__rate,
        .full-start__rate {
            background: rgba(0, 200, 200, .15) !important;
            border: 1px solid rgba(0, 200, 200, .55) !important;
            border-radius: .8em !important;
            padding: .4em .9em !important;
            backdrop-filter: blur(10px);
        }

        /* ===== Меню (sidebar) ===== */
        .menu__item.focus,
        .menu__item.hover {
            background: linear-gradient(135deg, rgba(255,45,85,.85), rgba(175,82,222,.85)) !important;
            box-shadow: 0 8px 22px rgba(255,45,85,.45);
            transform: translateX(6px);
            transition: all .35s cubic-bezier(.2,.9,.25,1);
        }
        .menu__item {
            transition: all .3s ease;
            border-radius: 0 1.4em 1.4em 0;
        }

        /* ===== Плавная появляемость списков карточек ===== */
        .items-cards .card,
        .category-full .card {
            animation: lampisheCardIn .6s cubic-bezier(.2,.9,.25,1) both;
        }
        .items-cards .card:nth-child(2)  { animation-delay: .04s; }
        .items-cards .card:nth-child(3)  { animation-delay: .08s; }
        .items-cards .card:nth-child(4)  { animation-delay: .12s; }
        .items-cards .card:nth-child(5)  { animation-delay: .16s; }
        .items-cards .card:nth-child(6)  { animation-delay: .20s; }
        .items-cards .card:nth-child(7)  { animation-delay: .24s; }
        .items-cards .card:nth-child(8)  { animation-delay: .28s; }
        .items-cards .card:nth-child(9)  { animation-delay: .32s; }
        .items-cards .card:nth-child(10) { animation-delay: .36s; }

        @keyframes lampisheCardIn {
            from { opacity: 0; transform: translateY(40px) scale(.92); filter: blur(6px); }
            to   { opacity: 1; transform: translateY(0)    scale(1);   filter: blur(0); }
        }

        /* ===== Плавный фон-blur за «героем» ===== */
        .full-start__background,
        .full-start-new__background {
            transition: opacity 1.2s ease, transform 6s ease !important;
            transform: scale(1.06);
        }
        .full-start__background.loaded,
        .full-start-new__background.loaded {
            transform: scale(1);
        }

        /* ===== Виджет погоды (как 0°C пасмурно на скрине 2) ===== */
        .lampishe-weather {
            display: inline-flex;
            align-items: center;
            gap: .5em;
            padding: 0 .9em;
            font-weight: 700;
            color: #fff;
            opacity: .92;
        }
        .lampishe-weather__temp {
            font-size: 1.25em;
            background: linear-gradient(135deg, #ffffff, #b7d8ff);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .lampishe-weather__desc {
            font-size: .8em;
            opacity: .7;
            text-transform: lowercase;
        }
        .lampishe-weather__sep {
            opacity: .35;
            margin: 0 .6em;
        }

        /* На совсем мелких экранах оставляем только лого без перегруза */
        @media (max-width: 580px) {
            .lampishe-weather { display: none; }
        }
        `;

        var style = document.createElement('style');
        style.id = 'lampishe-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    /* =========================================================
       2. ЗАМЕНА ЛОГО на «LAMP!SHE»
       ========================================================= */
    function applyLogo() {
        var attempts = 0;
        var iv = setInterval(function () {
            attempts++;
            var logo = document.querySelector('.head__logo');
            if (logo) {
                logo.innerHTML = 'LAMP<span style="color:#ff9500;-webkit-text-fill-color:#ff9500;">!</span>SHE';
                logo.classList.add('lampishe-logo');
                clearInterval(iv);
            }
            if (attempts > 60) clearInterval(iv);
        }, 250);
    }

    /* =========================================================
       3. ВИДЖЕТ ПОГОДЫ в шапке (open-meteo, без ключа)
       ========================================================= */
    function injectWeather() {
        var attempts = 0;
        var iv = setInterval(function () {
            attempts++;
            var head = document.querySelector('.head__actions') || document.querySelector('.head');
            if (head && !document.querySelector('.lampishe-weather')) {
                var box = document.createElement('div');
                box.className = 'lampishe-weather';
                box.innerHTML = '<span class="lampishe-weather__temp">--°</span>' +
                                '<span class="lampishe-weather__desc">погода</span>' +
                                '<span class="lampishe-weather__sep">|</span>';
                head.insertBefore(box, head.firstChild);
                fetchWeather(box);
                clearInterval(iv);
            }
            if (attempts > 60) clearInterval(iv);
        }, 300);
    }

    function fetchWeather(box) {
        try {
            // 1) определяем координаты по IP (без ключа)
            fetch('https://ipapi.co/json/').then(function (r) { return r.json(); }).then(function (geo) {
                var lat = geo.latitude, lon = geo.longitude;
                if (!lat || !lon) return;
                // 2) погода
                var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
                          '&longitude=' + lon + '&current_weather=true';
                fetch(url).then(function (r) { return r.json(); }).then(function (w) {
                    if (!w || !w.current_weather) return;
                    var t = Math.round(w.current_weather.temperature);
                    var code = w.current_weather.weathercode;
                    var desc = weatherCodeToText(code);
                    box.querySelector('.lampishe-weather__temp').textContent = t + '°C';
                    box.querySelector('.lampishe-weather__desc').textContent = desc;
                });
            });
        } catch (e) { /* тихо */ }
    }

    function weatherCodeToText(code) {
        var map = {
            0: 'ясно',
            1: 'малооблачно', 2: 'переменная облачность', 3: 'пасмурно',
            45: 'туман', 48: 'туман',
            51: 'морось', 53: 'морось', 55: 'морось',
            61: 'дождь', 63: 'дождь', 65: 'ливень',
            71: 'снег', 73: 'снег', 75: 'снегопад',
            80: 'ливни', 81: 'ливни', 82: 'ливни',
            95: 'гроза', 96: 'гроза', 99: 'гроза'
        };
        return map[code] || 'пасмурно';
    }

    /* =========================================================
       4. ATV / ANDROID TV — детект для усиления свечения
       ========================================================= */
    function detectATV() {
        var ua = navigator.userAgent.toLowerCase();
        var isATV = /tv|androidtv|smart-tv|appletv|webos|tizen|netcast/.test(ua);
        if (isATV) {
            document.body.classList.add('lampishe-atv');
            // На ТВ делаем свечение и масштаб ещё сочнее
            var extra = document.createElement('style');
            extra.textContent = `
                .lampishe-atv .card.focus { transform: scale(1.18) translateY(-12px) !important; }
                .lampishe-atv .head__logo { font-size: 1.9em !important; }
            `;
            document.head.appendChild(extra);
        }
    }

    /* =========================================================
       5. ХУК на загрузку постеров — плавное появление
       ========================================================= */
    function bindImageFade() {
        document.addEventListener('load', function (e) {
            var img = e.target;
            if (!img || img.tagName !== 'IMG') return;
            if (img.closest && (img.closest('.card') || img.closest('.full-start__background') || img.closest('.full-start-new__background'))) {
                img.style.opacity = 0;
                img.style.transition = 'opacity .7s ease, transform 1.2s ease';
                requestAnimationFrame(function () {
                    img.style.opacity = 1;
                    var bg = img.closest('.full-start__background, .full-start-new__background');
                    if (bg) bg.classList.add('loaded');
                });
            }
        }, true);
    }

    /* =========================================================
       6. ИНТЕГРАЦИЯ С Lampa
       ========================================================= */
    function startup() {
        injectStyles();
        detectATV();
        bindImageFade();
        applyLogo();
        injectWeather();

        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    applyLogo();
                    injectWeather();
                }
            });
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite' || e.type === 'build') {
                    applyLogo();
                }
            });
        }

        // Регистрируем плагин в меню «О плагинах», если поддерживается
        if (window.Lampa && Lampa.Plugin && Lampa.Plugin.add) {
            try {
                Lampa.Plugin.add(PLUGIN_NAME, {
                    name: PLUGIN_NAME,
                    version: PLUGIN_VERSION,
                    description: 'Сочные анимации постеров, красочное лого LAMP!SHE для ATV, виджет погоды и плавные переходы.'
                });
            } catch (e) { /* ignore */ }
        }

        console.log('%c LAMP!SHE plugin loaded ', 'background:linear-gradient(90deg,#ff2d55,#af52de);color:#fff;padding:4px 10px;border-radius:6px;font-weight:bold;');
    }

    if (window.appready) startup();
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startup();
        });
        // на всякий случай — если Lampa уже стартанула
        setTimeout(startup, 800);
    } else {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(startup, 100);
        } else {
            document.addEventListener('DOMContentLoaded', startup);
        }
    }
})();
