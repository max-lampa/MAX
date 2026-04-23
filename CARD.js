(function () {
    'use strict';

    if (window.lampishe_plugin_ready) return;
    window.lampishe_plugin_ready = true;

    var PLUGIN_NAME = 'LAMP!MAX';
    var PLUGIN_VERSION = '1.4.0';

    /* =========================================================
       ШРИФТЫ
       ========================================================= */
    var FONTS = {
        system:     { name: 'Системный',    family: "'Helvetica Neue', 'Roboto', Arial, sans-serif", google: null },
        roboto:     { name: 'Roboto',       family: "'Roboto', sans-serif",        google: 'Roboto:wght@400;700;900' },
        inter:      { name: 'Inter',        family: "'Inter', sans-serif",         google: 'Inter:wght@400;700;900' },
        montserrat: { name: 'Montserrat',   family: "'Montserrat', sans-serif",    google: 'Montserrat:wght@400;700;900' },
        bebas:      { name: 'Bebas Neue',   family: "'Bebas Neue', sans-serif",    google: 'Bebas+Neue' },
        oswald:     { name: 'Oswald',       family: "'Oswald', sans-serif",        google: 'Oswald:wght@400;600;700' },
        rubik:      { name: 'Rubik',        family: "'Rubik', sans-serif",         google: 'Rubik:wght@400;700;900' }
    };

    function currentFont() {
        var k = getStorage('lampishe_font', 'system');
        return FONTS[k] || FONTS.system;
    }

    function loadFont() {
        var f = currentFont();
        if (!f.google) return;
        var id = 'lampishe-font-' + f.google.replace(/[^a-z0-9]/gi, '');
        if (document.getElementById(id)) return;
        var link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=' + f.google + '&display=swap';
        document.head.appendChild(link);
    }

    /* =========================================================
       ТЕМЫ (акцентные цвета — два оттенка для градиента)
       ========================================================= */
    var THEMES = {
        sunset:  { name: 'Закат (красно-оранжевый)', c1: '#ff2d55', c2: '#ff9500', accent: '#ff2d55' },
        violet:  { name: 'Фиолетовый неон',           c1: '#af52de', c2: '#ff2d55', accent: '#af52de' },
        ocean:   { name: 'Океан',                     c1: '#0a84ff', c2: '#64d2ff', accent: '#0a84ff' },
        emerald: { name: 'Изумруд',                   c1: '#30d158', c2: '#64d2ff', accent: '#30d158' },
        gold:    { name: 'Золото',                    c1: '#ffd60a', c2: '#ff9500', accent: '#ffd60a' },
        rose:    { name: 'Роза',                      c1: '#ff375f', c2: '#ff9f0a', accent: '#ff375f' },
        mono:    { name: 'Графит',                    c1: '#a1a1aa', c2: '#e5e5e7', accent: '#a1a1aa' }
    };

    var SIZES = {
        small:  { name: 'Маленький', hero: '1.6em', card: '1.0em', logo: '1.05em' },
        medium: { name: 'Средний',   hero: '2.2em', card: '1.1em', logo: '1.25em' },
        large:  { name: 'Большой',   hero: '2.8em', card: '1.2em', logo: '1.45em' },
        xlarge: { name: 'Огромный',  hero: '3.6em', card: '1.3em', logo: '1.7em'  }
    };

    // Сила анимаций: off — выключены, soft — лёгкие, juicy — сочные (по умолчанию)
    var ANIM = {
        off:   { name: 'Выключены',
                 cardScale: 1.0, cardLift: '0px', imgScale: 1.0,
                 glow: false, shine: false, cardIn: false, hueShift: false, heroIn: false,
                 cardTransition: '0s', heroTransition: '0s' },
        soft:  { name: 'Лёгкие',
                 cardScale: 1.05, cardLift: '-3px', imgScale: 1.03,
                 glow: false, shine: true, cardIn: true, hueShift: true, heroIn: true,
                 cardTransition: '.3s', heroTransition: '.5s' },
        juicy: { name: 'Сочные',
                 cardScale: 1.10, cardLift: '-6px', imgScale: 1.08,
                 glow: true, shine: true, cardIn: true, hueShift: true, heroIn: true,
                 cardTransition: '.45s', heroTransition: '.8s' }
    };

    function getStorage(key, def) {
        try {
            if (window.Lampa && Lampa.Storage) {
                var v = Lampa.Storage.get(key, def);
                return (v === undefined || v === null || v === '') ? def : v;
            }
        } catch (e) {}
        try {
            var ls = localStorage.getItem(key);
            return ls || def;
        } catch (e) { return def; }
    }
    function setStorage(key, val) {
        try { if (window.Lampa && Lampa.Storage) Lampa.Storage.set(key, val); } catch (e) {}
        try { localStorage.setItem(key, val); } catch (e) {}
    }

    function currentTheme() {
        var k = getStorage('lampishe_theme', 'sunset');
        return THEMES[k] || THEMES.sunset;
    }
    function currentSize() {
        var k = getStorage('lampishe_size', 'medium');
        return SIZES[k] || SIZES.medium;
    }
    function colorTitleFromPoster() {
        return getStorage('lampishe_poster_color', 'true') === 'true';
    }
    function currentAnim() {
        var k = getStorage('lampishe_anim', 'juicy');
        return ANIM[k] || ANIM.juicy;
    }

    /* =========================================================
       СТИЛИ
       ========================================================= */
    function buildCss() {
        var t = currentTheme();
        var s = currentSize();
        var a = currentAnim();
        var f = currentFont();
        return `
        :root {
            --lampishe-c1: ${t.c1};
            --lampishe-c2: ${t.c2};
            --lampishe-accent: ${t.accent};
            --lampishe-hero-size: ${s.hero};
            --lampishe-card-title: ${s.card};
            --lampishe-logo-size: ${s.logo};
            --lampishe-card-scale: ${a.cardScale};
            --lampishe-card-lift: ${a.cardLift};
            --lampishe-img-scale: ${a.imgScale};
            --lampishe-card-tr: ${a.cardTransition};
            --lampishe-hero-tr: ${a.heroTransition};
            --lampishe-font: ${f.family};
        }
        .head__logo, .lampishe-logo,
        .full-start-new__title, .full-start__title,
        .items-line__title, .category-full__title,
        .lampishe-preview__title, .lampishe-preview__logo {
            font-family: var(--lampishe-font) !important;
        }

        /* ===== ЛОГО LAMP!MAX ===== */
        ${a.hueShift ? '' : '.lampishe-logo, .head__logo { animation: none !important; }'}
        ${a.heroIn ? '' : '.full-start-new__title, .full-start__title, .full-start-new__rate-line, .full-start__rate, .full-start-new__details > * { animation: none !important; }'}
        ${a.cardIn ? '' : '.items-cards .card, .category-full .card { animation: none !important; }'}
        ${a.glow ? '' : '.card.focus .card__view, .card.hover .card__view, .card-more.focus .card-more__box { animation: none !important; }'}
        ${a.shine ? '' : '.card .card__view::before { display: none !important; }'}

        .head__logo,
        .lampishe-logo {
            position: relative;
            display: inline-flex !important;
            align-items: center;
            font-family: 'Helvetica Neue', 'Roboto', Arial, sans-serif !important;
            font-weight: 900 !important;
            font-size: var(--lampishe-logo-size) !important;
            letter-spacing: 0.04em !important;
            text-transform: uppercase;
            background: linear-gradient(92deg, var(--lampishe-c1), var(--lampishe-c2), var(--lampishe-c1));
            background-size: 220% 220%;
            -webkit-background-clip: text !important;
            background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            color: transparent !important;
            filter: drop-shadow(0 2px 12px rgba(0,0,0,.35));
            animation: lampisheHueShift 6s ease-in-out infinite;
            transition: transform .35s cubic-bezier(.2,.9,.25,1), filter .35s ease;
        }
        .head__logo:hover, .head__logo.focus {
            transform: scale(1.05);
            filter: drop-shadow(0 4px 18px var(--lampishe-c1));
        }
        @keyframes lampisheHueShift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* ===== ШАПКА ===== */
        .head {
            background: linear-gradient(180deg, rgba(0,0,0,.65), rgba(0,0,0,0)) !important;
            border: none !important;
        }
        .head__action.focus, .head__action:hover {
            background: linear-gradient(135deg, var(--lampishe-c1), var(--lampishe-c2)) !important;
            box-shadow: 0 6px 22px color-mix(in srgb, var(--lampishe-c1) 55%, transparent);
            border-radius: 1.2em !important;
            transform: scale(1.08);
            transition: all .35s cubic-bezier(.2,.9,.25,1);
        }

        /* ===== ПОСТЕРЫ — анимация ===== */
        .card, .card-more {
            transition: transform var(--lampishe-card-tr) cubic-bezier(.2,.9,.25,1.05),
                        box-shadow var(--lampishe-card-tr) ease, filter var(--lampishe-card-tr) ease !important;
            will-change: transform;
        }
        .card .card__view, .card-more .card-more__box {
            position: relative; overflow: hidden;
            border-radius: 1.1em;
            transition: transform var(--lampishe-card-tr) cubic-bezier(.2,.9,.25,1.05),
                        box-shadow var(--lampishe-card-tr) ease, filter var(--lampishe-card-tr) ease;
        }
        .card .card__img, .card-more .card-more__box img {
            transition: transform var(--lampishe-hero-tr) cubic-bezier(.2,.9,.25,1) !important;
            border-radius: 1.1em;
        }
        .card.focus, .card.hover, .card-more.focus {
            z-index: 5;
            transform: scale(var(--lampishe-card-scale)) translateY(var(--lampishe-card-lift)) !important;
        }
        .card.focus .card__view, .card.hover .card__view, .card-more.focus .card-more__box {
            box-shadow:
                0 0 0 3px var(--lampishe-c1),
                0 18px 48px -8px color-mix(in srgb, var(--lampishe-c1) 55%, transparent),
                0 0 60px color-mix(in srgb, var(--lampishe-c2) 35%, transparent) !important;
            filter: saturate(1.2) contrast(1.05);
            animation: lampisheGlow 2.4s ease-in-out infinite;
        }
        .card.focus .card__img, .card.hover .card__img { transform: scale(var(--lampishe-img-scale)); }
        @keyframes lampisheGlow {
            0%, 100% { box-shadow: 0 0 0 3px var(--lampishe-c1), 0 18px 48px -8px color-mix(in srgb, var(--lampishe-c1) 55%, transparent), 0 0 60px color-mix(in srgb, var(--lampishe-c2) 35%, transparent); }
            50%      { box-shadow: 0 0 0 3px var(--lampishe-c2), 0 22px 60px -6px color-mix(in srgb, var(--lampishe-c2) 55%, transparent), 0 0 80px color-mix(in srgb, var(--lampishe-c1) 55%, transparent); }
        }
        .card .card__view::before {
            content:''; position:absolute; top:0; left:-120%;
            width:60%; height:100%;
            background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,.18) 45%, rgba(255,255,255,.45) 50%, rgba(255,255,255,.18) 55%, transparent 100%);
            transform: skewX(-18deg);
            transition: left .9s ease;
            pointer-events:none; z-index:3;
        }
        .card.focus .card__view::before, .card.hover .card__view::before { left:140%; }

        /* Бейджи рейтинга */
        .card__vote {
            background: linear-gradient(135deg, var(--lampishe-c1), var(--lampishe-c2)) !important;
            color:#fff !important; font-weight:800 !important;
            border-radius:.55em !important; padding:.25em .55em !important;
            box-shadow: 0 4px 14px color-mix(in srgb, var(--lampishe-c1) 50%, transparent);
            border:none !important;
        }
        .card__type {
            background: linear-gradient(135deg, var(--lampishe-c2), var(--lampishe-c1)) !important;
            color:#fff !important; font-weight:800 !important;
            border-radius:.4em !important; border:none !important;
        }
        .card__title { font-size: var(--lampishe-card-title) !important; }

        /* Заголовки разделов */
        .items-line__title, .category-full__title, .full-start__title { font-weight:800 !important; }

        /* ===== HERO заголовок (фильм) ===== */
        .full-start-new__title, .full-start__title {
            font-weight: 900 !important;
            font-size: var(--lampishe-hero-size) !important;
            line-height: 1.02 !important;
            letter-spacing: .005em;
            text-transform: uppercase;
            background: linear-gradient(180deg, #ffffff 0%, #cfcfd6 100%);
            -webkit-background-clip: text; background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 4px 20px rgba(0,0,0,.45);
            animation: lampisheHeroIn .8s cubic-bezier(.2,.9,.25,1) both;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            word-break: break-word;
            max-width: 100%;
        }
        /* когда применяется цвет постера */
        .full-start-new__title.lampishe-poster-color,
        .full-start__title.lampishe-poster-color {
            background: linear-gradient(135deg, var(--lampishe-poster-c1, var(--lampishe-c1)) 0%, var(--lampishe-poster-c2, var(--lampishe-c2)) 100%);
            -webkit-background-clip: text; background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        @keyframes lampisheHeroIn {
            from { opacity:0; transform: translateY(22px) scale(.97); filter: blur(6px); }
            to   { opacity:1; transform: translateY(0)    scale(1);   filter: blur(0); }
        }
        .full-start-new__rate-line, .full-start__rate {
            animation: lampisheHeroIn 1s .15s cubic-bezier(.2,.9,.25,1) both;
        }
        .full-start-new__details > * {
            animation: lampisheHeroIn 1s .25s cubic-bezier(.2,.9,.25,1) both;
        }
        .full-start-new__rate, .full-start__rate {
            background: color-mix(in srgb, var(--lampishe-c1) 18%, transparent) !important;
            border: 1px solid color-mix(in srgb, var(--lampishe-c1) 55%, transparent) !important;
            border-radius:.8em !important; padding:.35em .8em !important;
        }

        /* На узких экранах ужимаем hero чтобы не вылезал */
        @media (max-width: 720px) {
            .full-start-new__title, .full-start__title {
                font-size: calc(var(--lampishe-hero-size) * 0.7) !important;
                -webkit-line-clamp: 3;
            }
        }
        @media (max-width: 480px) {
            .full-start-new__title, .full-start__title {
                font-size: calc(var(--lampishe-hero-size) * 0.55) !important;
            }
        }

        /* ===== Меню ===== */
        .menu__item.focus, .menu__item.hover {
            background: linear-gradient(135deg, var(--lampishe-c1), var(--lampishe-c2)) !important;
            box-shadow: 0 8px 22px color-mix(in srgb, var(--lampishe-c1) 45%, transparent);
            transform: translateX(6px);
            transition: all .35s cubic-bezier(.2,.9,.25,1);
        }
        .menu__item { transition: all .3s ease; border-radius: 0 1.4em 1.4em 0; }

        /* ===== Каскадное появление карточек ===== */
        .items-cards .card, .category-full .card {
            animation: lampisheCardIn .55s cubic-bezier(.2,.9,.25,1) both;
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
            from { opacity:0; transform: translateY(36px) scale(.93); filter: blur(5px); }
            to   { opacity:1; transform: translateY(0)    scale(1);   filter: blur(0); }
        }

        .full-start__background, .full-start-new__background {
            transition: opacity 1.2s ease, transform 6s ease !important;
            transform: scale(1.06);
        }
        .full-start__background.loaded, .full-start-new__background.loaded {
            transform: scale(1);
        }

        /* ===== Превью в настройках ===== */
        .lampishe-preview {
            display: flex;
            gap: 1.4em;
            align-items: center;
            padding: 1.2em 1.4em;
            margin: 0 0 1em 0;
            border-radius: 1.2em;
            background: linear-gradient(135deg, rgba(0,0,0,.55), rgba(0,0,0,.25));
            border: 1px solid color-mix(in srgb, var(--lampishe-c1) 40%, transparent);
            box-shadow: 0 10px 36px -10px color-mix(in srgb, var(--lampishe-c1) 55%, transparent),
                        inset 0 0 0 1px rgba(255,255,255,.04);
            overflow: hidden;
            position: relative;
        }
        .lampishe-preview::after {
            content: ''; position: absolute; inset: 0;
            background: radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--lampishe-c1) 22%, transparent), transparent 55%),
                        radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--lampishe-c2) 22%, transparent), transparent 55%);
            pointer-events: none;
        }
        .lampishe-preview__poster {
            position: relative;
            width: 7em; height: 10em; flex: 0 0 auto;
            border-radius: .8em;
            overflow: hidden;
            background: linear-gradient(135deg, var(--lampishe-c1), var(--lampishe-c2));
            box-shadow: 0 0 0 3px var(--lampishe-c1),
                        0 12px 32px -6px color-mix(in srgb, var(--lampishe-c1) 55%, transparent),
                        0 0 50px color-mix(in srgb, var(--lampishe-c2) 40%, transparent);
            ${currentAnim().glow ? 'animation: lampisheGlow 2.4s ease-in-out infinite;' : ''}
        }
        .lampishe-preview__poster::before {
            content: ''; position: absolute; inset: 0;
            background: radial-gradient(circle at 30% 25%, rgba(255,255,255,.35), transparent 60%),
                        linear-gradient(160deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.4));
        }
        .lampishe-preview__rate {
            position: absolute; top: .5em; right: .5em;
            background: linear-gradient(135deg, var(--lampishe-c1), var(--lampishe-c2));
            color: #fff; font-weight: 800;
            font-size: .8em; padding: .2em .5em;
            border-radius: .4em;
            box-shadow: 0 4px 12px color-mix(in srgb, var(--lampishe-c1) 55%, transparent);
        }
        .lampishe-preview__info { flex: 1 1 auto; min-width: 0; position: relative; z-index: 1; }
        .lampishe-preview__meta {
            font-size: .85em; opacity: .7; margin-bottom: .35em;
            font-weight: 600;
        }
        .lampishe-preview__title {
            font-weight: 900;
            font-size: calc(var(--lampishe-hero-size) * 0.55);
            line-height: 1.05;
            text-transform: uppercase;
            letter-spacing: .01em;
            background: linear-gradient(135deg, var(--lampishe-c1), var(--lampishe-c2));
            -webkit-background-clip: text; background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 4px 16px rgba(0,0,0,.4);
            margin-bottom: .4em;
            word-break: break-word;
        }
        .lampishe-preview__sub {
            font-size: .8em; opacity: .6;
        }
        .lampishe-preview__logo {
            font-weight: 900;
            font-size: calc(var(--lampishe-logo-size) * 0.95);
            letter-spacing: .04em;
            text-transform: uppercase;
            background: linear-gradient(92deg, var(--lampishe-c1), var(--lampishe-c2), var(--lampishe-c1));
            background-size: 220% 220%;
            -webkit-background-clip: text; background-clip: text;
            -webkit-text-fill-color: transparent;
            ${currentAnim().hueShift ? 'animation: lampisheHueShift 6s ease-in-out infinite;' : ''}
            margin-bottom: .35em;
        }
        `;
    }

    function applyStyles() {
        var st = document.getElementById('lampishe-style');
        if (!st) {
            st = document.createElement('style');
            st.id = 'lampishe-style';
            document.head.appendChild(st);
        }
        st.textContent = buildCss();
    }

    /* =========================================================
       ЛОГО
       ========================================================= */
    function applyLogo() {
        var attempts = 0;
        var iv = setInterval(function () {
            attempts++;
            var logo = document.querySelector('.head__logo');
            if (logo) {
                if (logo.getAttribute('data-lampishe') !== '1') {
                    logo.setAttribute('data-lampishe', '1');
                    logo.innerHTML = 'LAMP<span style="color: var(--lampishe-c2); -webkit-text-fill-color: var(--lampishe-c2); background: none;">!</span>MAX';
                    logo.classList.add('lampishe-logo');
                }
                clearInterval(iv);
            }
            if (attempts > 60) clearInterval(iv);
        }, 250);
    }

    /* =========================================================
       ЦВЕТ ЗАГОЛОВКА ИЗ ПОСТЕРА
       Берём картинку фона / постера, считаем 2 доминирующих цвета
       и применяем их как градиент к заголовку.
       ========================================================= */
    function pickColorsFromImage(img, cb) {
        try {
            var canvas = document.createElement('canvas');
            var w = canvas.width = 40;
            var h = canvas.height = 40;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            var data = ctx.getImageData(0, 0, w, h).data;

            var buckets = {};
            for (var i = 0; i < data.length; i += 4) {
                var r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
                if (a < 200) continue;
                // уменьшаем палитру
                var rr = r >> 5, gg = g >> 5, bb = b >> 5;
                // отсекаем слишком тёмные/светлые/серые
                var max = Math.max(r, g, b), min = Math.min(r, g, b);
                if (max < 50 || min > 220) continue;
                if (max - min < 25) continue;
                var key = rr + '_' + gg + '_' + bb;
                if (!buckets[key]) buckets[key] = { c: 0, r: 0, g: 0, b: 0 };
                buckets[key].c++;
                buckets[key].r += r; buckets[key].g += g; buckets[key].b += b;
            }
            var arr = [];
            for (var k in buckets) {
                var o = buckets[k];
                arr.push({
                    count: o.c,
                    r: Math.round(o.r / o.c),
                    g: Math.round(o.g / o.c),
                    b: Math.round(o.b / o.c)
                });
            }
            arr.sort(function (a, b) { return b.count - a.count; });
            if (arr.length === 0) return cb(null);
            var c1 = arr[0];
            var c2 = arr[1] || arr[0];
            // если очень похожи — берём третий
            if (arr[2] && Math.abs(c1.r - c2.r) + Math.abs(c1.g - c2.g) + Math.abs(c1.b - c2.b) < 60) {
                c2 = arr[2];
            }
            cb({
                c1: 'rgb(' + boost(c1.r) + ',' + boost(c1.g) + ',' + boost(c1.b) + ')',
                c2: 'rgb(' + boost(c2.r) + ',' + boost(c2.g) + ',' + boost(c2.b) + ')'
            });
        } catch (e) { cb(null); }
    }
    function boost(v) {
        // подкручиваем насыщенность / яркость, чтобы цвет «играл» на заголовке
        v = Math.round(v * 1.15);
        if (v < 110) v = 110;
        if (v > 255) v = 255;
        return v;
    }

    function colorizeHeroTitle() {
        if (!colorTitleFromPoster()) return;
        var title = document.querySelector('.full-start-new__title, .full-start__title');
        if (!title) return;

        var bg = document.querySelector('.full-start-new__background-image, .full-start__background, .full-start-new__background');
        var src = null;
        if (bg) {
            if (bg.tagName === 'IMG') src = bg.src;
            else {
                var inner = bg.querySelector('img');
                if (inner) src = inner.src;
                else {
                    var bgi = window.getComputedStyle(bg).backgroundImage;
                    var m = bgi && bgi.match(/url\(["']?(.+?)["']?\)/);
                    if (m) src = m[1];
                }
            }
        }
        if (!src) return;

        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            pickColorsFromImage(img, function (cols) {
                if (!cols) return;
                title.style.setProperty('--lampishe-poster-c1', cols.c1);
                title.style.setProperty('--lampishe-poster-c2', cols.c2);
                title.classList.add('lampishe-poster-color');
            });
        };
        img.onerror = function () {};
        img.src = src;
    }

    /* =========================================================
       FADE-IN постеров
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
                if (img.closest('.full-start__background, .full-start-new__background, .full-start-new__poster')) {
                    setTimeout(colorizeHeroTitle, 200);
                }
            }
        }, true);
    }

    // Флаг, чтобы параметры не добавлялись повторно
    var settingsRegistered = false;

    /* =========================================================
       НАСТРОЙКИ Lampa: тема, размер, цвет из постера
       ========================================================= */
    function registerSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        
        // Предотвращаем повторную регистрацию параметров
        if (settingsRegistered) return;
        settingsRegistered = true;

        Lampa.SettingsApi.addComponent({
            component: 'lampishe',
            name: PLUGIN_NAME,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>'
        });

        // тема
        var themeValues = {};
        Object.keys(THEMES).forEach(function (k) { themeValues[k] = THEMES[k].name; });
        Lampa.SettingsApi.addParam({
            component: 'lampishe',
            param: { name: 'lampishe_theme', type: 'select', values: themeValues, default: 'sunset' },
            field: { name: 'Цветовая тема', description: 'Акцентный цвет интерфейса' },
            onChange: function (v) { setStorage('lampishe_theme', v); applyStyles(); refreshPreview(); }
        });

        // размер
        var sizeValues = {};
        Object.keys(SIZES).forEach(function (k) { sizeValues[k] = SIZES[k].name; });
        Lampa.SettingsApi.addParam({
            component: 'lampishe',
            param: { name: 'lampishe_size', type: 'select', values: sizeValues, default: 'medium' },
            field: { name: 'Размер шрифта', description: 'Размер заголовков, лого и подписей карточек' },
            onChange: function (v) { setStorage('lampishe_size', v); applyStyles(); refreshPreview(); }
        });

        // шрифт
        var fontValues = {};
        Object.keys(FONTS).forEach(function (k) { fontValues[k] = FONTS[k].name; });
        Lampa.SettingsApi.addParam({
            component: 'lampishe',
            param: { name: 'lampishe_font', type: 'select', values: fontValues, default: 'system' },
            field: { name: 'Шрифт', description: 'Шрифт для заголовков, лого и названий разделов' },
            onChange: function (v) { setStorage('lampishe_font', v); loadFont(); applyStyles(); refreshPreview(); }
        });

        // сила анимаций
        var animValues = {};
        Object.keys(ANIM).forEach(function (k) { animValues[k] = ANIM[k].name; });
        Lampa.SettingsApi.addParam({
            component: 'lampishe',
            param: { name: 'lampishe_anim', type: 'select', values: animValues, default: 'juicy' },
            field: { name: 'Сила анимаций', description: 'Выключите или ослабьте на слабых ТВ-боксах' },
            onChange: function (v) { setStorage('lampishe_anim', v); applyStyles(); refreshPreview(); }
        });

        // авто-цвет заголовка из постера
        Lampa.SettingsApi.addParam({
            component: 'lampishe',
            param: { name: 'lampishe_poster_color', type: 'trigger', default: true },
            field: { name: 'Цвет заголовка из постера', description: 'Автоматически окрашивать название фильма в цвета постера' },
            onChange: function (v) {
                setStorage('lampishe_poster_color', v ? 'true' : 'false');
                if (!v) {
                    document.querySelectorAll('.lampishe-poster-color').forEach(function (el) {
                        el.classList.remove('lampishe-poster-color');
                    });
                } else {
                    colorizeHeroTitle();
                }
            }
        });

        // Превью — вставляется при открытии раздела LAMP!MAX
        if (Lampa.Listener) {
            Lampa.Listener.follow('settings_component', function (e) {
                if (e.type === 'open' && e.name === 'lampishe') {
                    setTimeout(injectPreview, 30);
                }
            });
        }
    }

    function buildPreviewHtml() {
        var t = currentTheme();
        return '' +
            '<div class="lampishe-preview" id="lampishe-preview">' +
                '<div class="lampishe-preview__poster">' +
                    '<div class="lampishe-preview__rate">8.4</div>' +
                '</div>' +
                '<div class="lampishe-preview__info">' +
                    '<div class="lampishe-preview__logo">LAMP<span style="color:' + t.c2 + ';-webkit-text-fill-color:' + t.c2 + ';background:none;">!</span>MAX</div>' +
                    '<div class="lampishe-preview__meta">2026 • США</div>' +
                    '<div class="lampishe-preview__title">Превью</div>' +
                    '<div class="lampishe-preview__sub">Так будет выглядеть оформление</div>' +
                '</div>' +
            '</div>';
    }

    function injectPreview() {
        // Удаляем старое превью, чтобы не дублировалось
        var old = document.getElementById('lampishe-preview');
        if (old && old.parentElement) old.parentElement.removeChild(old);
        
        var container = document.querySelector('.settings-param__name') ? document.querySelector('.settings__content .scroll__body, .settings .scroll__body, .settings-param-content, .settings-content') : null;
        // более надёжно — берём контейнер с параметрами
        if (!container) {
            var anyParam = document.querySelector('[data-name^="lampishe_"], [data-name="lampishe_theme"]');
            if (anyParam) container = anyParam.parentElement;
        }
        if (!container) return;
        
        // вставляем сверху
        var wrap = document.createElement('div');
        wrap.innerHTML = buildPreviewHtml();
        container.insertBefore(wrap.firstChild, container.firstChild);
    }

    function refreshPreview() {
        var existing = document.getElementById('lampishe-preview');
        if (!existing) return;
        var t = currentTheme();
        existing.outerHTML = buildPreviewHtml();
    }

    /* =========================================================
       СТАРТ
       ========================================================= */
    function startup() {
        loadFont();
        applyStyles();
        bindImageFade();
        applyLogo();
        registerSettings();

        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') { applyLogo(); applyStyles(); }
            });
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite' || e.type === 'build') {
                    applyLogo();
                    setTimeout(colorizeHeroTitle, 600);
                }
            });
            Lampa.Listener.follow('activity', function (e) {
                if (e.type === 'archive' || e.type === 'start') {
                    setTimeout(colorizeHeroTitle, 700);
                }
            });
        }

        if (window.Lampa && Lampa.Plugin && Lampa.Plugin.add) {
            try {
                Lampa.Plugin.add(PLUGIN_NAME, {
                    name: PLUGIN_NAME,
                    version: PLUGIN_VERSION,
                    description: 'Сочные анимации постеров, цветной заголовок из постера, темы и выбор размера шрифта.'
                });
            } catch (e) {}
        }

        console.log('%c LAMP!MAX v' + PLUGIN_VERSION + ' loaded ', 'background:linear-gradient(90deg,#ff2d55,#af52de);color:#fff;padding:4px 10px;border-radius:6px;font-weight:bold;');
    }

    if (window.appready) startup();
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startup();
        });
        setTimeout(startup, 800);
    } else {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(startup, 100);
        } else {
            document.addEventListener('DOMContentLoaded', startup);
        }
    }
})();