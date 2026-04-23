(function () {
    'use strict';

    if (window.lampishe_plugin_ready) return;
    window.lampishe_plugin_ready = true;

    var PLUGIN_NAME = 'LAMP!SHE';
    var PLUGIN_VERSION = '2.2.0';

    // Палитра букв логотипа (яркая, читается на тёмном фоне)
    var LOGO_LETTER_COLORS = ['#ff2d55','#ff9500','#ffd60a','#30d158','#0a84ff','#5e5ce6','#af52de','#ff375f','#64d2ff'];

    function buildLogoHtml() {
        // L A M P ! S H E  (с «!» как акцентом)
        var letters = ['L','A','M','P','!','S','H','E'];
        var html = '';
        letters.forEach(function (ch, i) {
            var color = LOGO_LETTER_COLORS[i % LOGO_LETTER_COLORS.length];
            var cls = 'l' + (ch === '!' ? ' bang' : '');
            html += '<span class="' + cls + '" style="--c:' + color + ';color:' + color + ';">' + ch + '</span>';
        });
        return html;
    }

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
        blood:   { name: 'Кровавый',                  c1: '#8b0000', c2: '#ff1744', accent: '#b3001b' },
        purple:  { name: 'Фиолетовый',                c1: '#6a0dad', c2: '#b388ff', accent: '#7c4dff' },
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

        /* ===== ЛОГО LAMP!SHE ===== */
        ${a.hueShift ? '' : '.lampishe-logo, .head__logo { animation: none !important; }'}
        ${a.heroIn ? '' : '.full-start-new__title, .full-start__title, .full-start-new__rate-line, .full-start__rate, .full-start-new__details > * { animation: none !important; }'}
        ${a.cardIn ? '' : '.items-cards .card, .category-full .card { animation: none !important; }'}
        ${a.glow ? '' : '.card.focus .card__view, .card.hover .card__view, .card-more.focus .card-more__box { animation: none !important; }'}
        ${a.shine ? '' : '.card .card__view .lampishe-shine { display: none !important; }'}

        .head__logo,
        .lampishe-logo {
            position: relative;
            display: inline-flex !important;
            align-items: center;
            gap: 0;
            font-weight: 900 !important;
            font-size: var(--lampishe-logo-size) !important;
            letter-spacing: 0.04em !important;
            text-transform: uppercase;
            filter: drop-shadow(0 2px 10px rgba(0,0,0,.45));
            transition: transform .35s cubic-bezier(.2,.9,.25,1), filter .35s ease;
        }
        .head__logo:hover, .head__logo.focus {
            transform: scale(1.05);
            filter: drop-shadow(0 4px 18px var(--lampishe-c1));
        }
        .lampishe-logo .l {
            position: relative;
            display: inline-block;
            color: var(--c, #fff);
            background: linear-gradient(180deg,
                #ffffff 0%,
                color-mix(in srgb, var(--c, #fff) 35%, #ffffff) 28%,
                var(--c, #fff) 55%,
                color-mix(in srgb, var(--c, #fff) 70%, #000) 100%);
            -webkit-background-clip: text;
                    background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
            text-shadow:
                0 0 18px color-mix(in srgb, var(--c, #fff) 75%, transparent),
                0 0 38px color-mix(in srgb, var(--c, #fff) 45%, transparent),
                0 2px 0 rgba(0,0,0,.35);
            filter: drop-shadow(0 0 8px color-mix(in srgb, var(--c, #fff) 55%, transparent))
                    drop-shadow(0 3px 4px rgba(0,0,0,.55));
            ${a.hueShift ? 'animation: lampisheLetter 4.8s ease-in-out infinite;' : ''}
            transition: transform .25s ease;
        }
        /* блик «жидкое стекло» бегущий по логотипу */
        .lampishe-logo::after {
            content: '';
            position: absolute; inset: -10% -5%;
            background: linear-gradient(115deg,
                transparent 30%,
                rgba(255,255,255,.55) 48%,
                rgba(255,255,255,.85) 50%,
                rgba(255,255,255,.55) 52%,
                transparent 70%);
            mix-blend-mode: overlay;
            transform: translateX(-120%);
            ${a.shine ? 'animation: lampisheLogoShine 4.5s ease-in-out infinite;' : ''}
            pointer-events: none;
            border-radius: 12px;
        }
        @keyframes lampisheLogoShine {
            0%, 70%, 100% { transform: translateX(-120%); opacity: 0; }
            78%           { opacity: 1; }
            92%           { transform: translateX(120%);  opacity: 0; }
        }
        .lampishe-logo .l.bang { transform: translateY(-0.04em) scale(1.12); }
        .lampishe-logo .l.gap  { width: .35em; }

        ${a.hueShift ? `
        @keyframes lampisheLetter {
            0%, 100% { transform: translateY(0)        scale(1);    filter: brightness(1); }
            25%      { transform: translateY(-0.06em)  scale(1.06); filter: brightness(1.25); }
            50%      { transform: translateY(0.03em)   scale(.98);  filter: brightness(.9); }
            75%      { transform: translateY(-0.03em)  scale(1.04); filter: brightness(1.15); }
        }
        .lampishe-logo .l:nth-child(1) { animation-delay: 0s; }
        .lampishe-logo .l:nth-child(2) { animation-delay: .15s; }
        .lampishe-logo .l:nth-child(3) { animation-delay: .30s; }
        .lampishe-logo .l:nth-child(4) { animation-delay: .45s; }
        .lampishe-logo .l:nth-child(5) { animation-delay: .60s; }
        .lampishe-logo .l:nth-child(6) { animation-delay: .75s; }
        .lampishe-logo .l:nth-child(7) { animation-delay: .90s; }
        .lampishe-logo .l:nth-child(8) { animation-delay: 1.05s; }
        .lampishe-logo .l:nth-child(9) { animation-delay: 1.20s; }
        ` : ''}

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
            border-radius: 1.25em;
            background:
                linear-gradient(135deg,
                    color-mix(in srgb, var(--lampishe-c1) 14%, transparent) 0%,
                    color-mix(in srgb, var(--lampishe-c2) 10%, transparent) 100%),
                rgba(255,255,255,.04);
            backdrop-filter: blur(14px) saturate(1.25);
            -webkit-backdrop-filter: blur(14px) saturate(1.25);
            border: 1px solid rgba(255,255,255,.10);
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,.22),
                inset 0 -1px 0 rgba(0,0,0,.35),
                0 10px 28px -10px rgba(0,0,0,.65);
            transition: transform var(--lampishe-card-tr) cubic-bezier(.2,.9,.25,1.05),
                        box-shadow var(--lampishe-card-tr) ease,
                        filter var(--lampishe-card-tr) ease,
                        border-color var(--lampishe-card-tr) ease;
        }
        /* верхний глянцевый блик «жидкое стекло» */
        .card .card__view::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 55%;
            background: linear-gradient(180deg,
                rgba(255,255,255,.32) 0%,
                rgba(255,255,255,.12) 35%,
                rgba(255,255,255,0) 100%);
            border-radius: 1.25em 1.25em 50% 50% / 1.25em 1.25em 18% 18%;
            opacity: .75;
            pointer-events: none;
            mix-blend-mode: overlay;
            z-index: 3;
            transition: opacity .5s ease, transform .6s cubic-bezier(.2,.9,.25,1);
        }
        .card .card__img, .card-more .card-more__box img {
            transition: transform var(--lampishe-hero-tr) cubic-bezier(.2,.9,.25,1),
                        filter var(--lampishe-hero-tr) ease !important;
            border-radius: 1.25em;
        }
        .card.focus, .card.hover, .card-more.focus {
            z-index: 5;
            transform: scale(var(--lampishe-card-scale)) translateY(var(--lampishe-card-lift)) !important;
        }
        .card.focus .card__view, .card.hover .card__view, .card-more.focus .card-more__box {
            border-color: color-mix(in srgb, var(--lampishe-c1) 70%, transparent) !important;
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,.45),
                inset 0 -1px 0 rgba(0,0,0,.3),
                0 0 0 2px color-mix(in srgb, var(--lampishe-c1) 85%, transparent),
                0 22px 60px -10px color-mix(in srgb, var(--lampishe-c1) 65%, transparent),
                0 0 80px color-mix(in srgb, var(--lampishe-c2) 50%, transparent) !important;
            filter: saturate(1.3) contrast(1.08) brightness(1.05);
            animation: lampisheGlow 2.4s ease-in-out infinite;
        }
        .card.focus .card__view::before, .card.hover .card__view::before {
            opacity: 1;
            transform: translateY(-2%) scale(1.02);
        }

        /* ===== FLUID WAVE — «дыхание» жидкого стекла при фокусе ===== */
        ${a.glow ? `
        .card.focus .card__view, .card.hover .card__view, .card-more.focus .card-more__box {
            animation: lampisheGlow 2.4s ease-in-out infinite,
                       lampisheFluidMorph 5.5s ease-in-out infinite;
        }
        .card.focus .card__img, .card.hover .card__img {
            animation: lampisheFluidBreathe 4.8s ease-in-out infinite;
            transform-origin: 50% 55%;
        }
        .card.focus .card__view::before, .card.hover .card__view::before {
            animation: lampisheFluidHighlight 5.5s ease-in-out infinite;
        }
        @keyframes lampisheFluidMorph {
            0%, 100% { border-radius: 1.25em 1.25em 1.25em 1.25em / 1.25em 1.25em 1.25em 1.25em; }
            33%      { border-radius: 1.45em 1.15em 1.35em 1.15em / 1.15em 1.45em 1.15em 1.35em; }
            66%      { border-radius: 1.15em 1.45em 1.15em 1.35em / 1.35em 1.15em 1.45em 1.15em; }
        }
        @keyframes lampisheFluidBreathe {
            0%, 100% { transform: scale(var(--lampishe-img-scale)) translate3d(0, 0, 0); filter: saturate(1.15) brightness(1.05); }
            50%      { transform: scale(calc(var(--lampishe-img-scale) * 1.025)) translate3d(0, -0.6%, 0); filter: saturate(1.25) brightness(1.10); }
        }
        @keyframes lampisheFluidHighlight {
            0%, 100% { transform: translate3d(-3%, -1%, 0) scale(1.02); opacity: .95; }
            50%      { transform: translate3d( 3%, -3%, 0) scale(1.06); opacity: 1; }
        }
        ` : `
        .card.focus .card__img, .card.hover .card__img {
            transform: scale(var(--lampishe-img-scale));
            filter: saturate(1.15) brightness(1.05);
        }
        `}

        /* ===== ТИТУЛЬНЫЙ ЛОГОТИП ФИЛЬМА НА КАРТОЧКЕ ===== */
        .card .card__view { position: relative; }
        .card .card__view::after {
            content: '';
            position: absolute; left:0; right:0; bottom: 0;
            height: 60%;
            background: linear-gradient(180deg,
                rgba(0,0,0,0) 0%,
                rgba(0,0,0,.45) 55%,
                rgba(0,0,0,.92) 100%);
            opacity: 0;
            transition: opacity .6s ease;
            pointer-events: none;
            z-index: 2;
        }
        .card.lampishe-has-logo .card__view::after { opacity: 1; }

        .lampishe-card-logo {
            position: absolute;
            left: 6%; right: 6%; bottom: 7%;
            margin: 0 auto;
            max-width: 88%;
            max-height: 38%;
            width: auto; height: auto;
            object-fit: contain;
            filter: drop-shadow(0 4px 14px rgba(0,0,0,.85))
                    drop-shadow(0 0 18px color-mix(in srgb, var(--lampishe-c1) 55%, transparent));
            opacity: 0;
            transform: translateY(10px) scale(.92);
            transition: opacity .7s ease, transform .9s cubic-bezier(.2,.9,.25,1);
            pointer-events: none;
            z-index: 4;
            display: block;
        }
        .lampishe-card-logo.loaded {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        .card.focus .lampishe-card-logo,
        .card.hover .lampishe-card-logo {
            transform: translateY(-3px) scale(1.04);
            filter: drop-shadow(0 6px 22px rgba(0,0,0,.95))
                    drop-shadow(0 0 26px color-mix(in srgb, var(--lampishe-c2) 75%, transparent));
        }
        /* прячем стандартное текстовое название, когда есть лого */
        .card.lampishe-has-logo .card__title { display: none !important; }

        /* ===== HERO ЛОГОТИП (Netflix-стиль) ===== */
        .lampishe-hero-logo {
            display: block;
            max-width: 60%;
            max-height: 28vh;
            width: auto; height: auto;
            object-fit: contain;
            margin: 0 0 .6em 0;
            opacity: 0;
            transform: translateY(24px) scale(.94);
            transition: opacity 1s ease, transform 1.1s cubic-bezier(.2,.9,.25,1);
            filter: drop-shadow(0 6px 22px rgba(0,0,0,.85))
                    drop-shadow(0 0 30px color-mix(in srgb, var(--lampishe-c1) 45%, transparent));
        }
        .lampishe-hero-logo.loaded {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        @media (max-width: 720px) {
            .lampishe-hero-logo { max-width: 75%; max-height: 22vh; }
        }
        /* когда есть hero-лого — прячем текстовый заголовок */
        .full-start--has-logo .full-start-new__title,
        .full-start--has-logo .full-start__title {
            display: none !important;
        }
        @keyframes lampisheGlow {
            0%, 100% { box-shadow: 0 0 0 3px var(--lampishe-c1), 0 18px 48px -8px color-mix(in srgb, var(--lampishe-c1) 55%, transparent), 0 0 60px color-mix(in srgb, var(--lampishe-c2) 35%, transparent); }
            50%      { box-shadow: 0 0 0 3px var(--lampishe-c2), 0 22px 60px -6px color-mix(in srgb, var(--lampishe-c2) 55%, transparent), 0 0 80px color-mix(in srgb, var(--lampishe-c1) 55%, transparent); }
        }
        /* «жидкий» бегущий блик при фокусе — отдельный слой через card__img wrap */
        .card .card__view .lampishe-shine {
            content:''; position:absolute; top:0; left:-120%;
            width:60%; height:100%;
            background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,.22) 45%, rgba(255,255,255,.55) 50%, rgba(255,255,255,.22) 55%, transparent 100%);
            transform: skewX(-18deg);
            transition: left 1.1s ease;
            pointer-events:none; z-index:4;
            mix-blend-mode: screen;
        }
        .card.focus .card__view .lampishe-shine,
        .card.hover .card__view .lampishe-shine { left:140%; }

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

        .full-start__background, .full-start-new__background,
        .full-start-new__background-image {
            transition: opacity 1.2s ease !important;
            transform-origin: 50% 50%;
            will-change: transform;
        }
        ${a.heroIn ? `
        .full-start__background.loaded, .full-start-new__background.loaded,
        .full-start-new__background-image.loaded {
            animation: lampisheParallax 28s ease-in-out infinite alternate;
        }
        @keyframes lampisheParallax {
            0%   { transform: scale(1.10) translate3d(-1.2%, -0.8%, 0); }
            25%  { transform: scale(1.13) translate3d( 0.8%, -1.2%, 0); }
            50%  { transform: scale(1.16) translate3d( 1.4%,  0.6%, 0); }
            75%  { transform: scale(1.13) translate3d(-0.6%,  1.2%, 0); }
            100% { transform: scale(1.10) translate3d(-1.4%, -0.4%, 0); }
        }
        ` : `
        .full-start__background.loaded, .full-start-new__background.loaded,
        .full-start-new__background-image.loaded {
            transform: scale(1.05);
        }
        `}
        /* мягкий цветной виньетинг от темы по краям hero — кинематографичный эффект */
        .full-start-new__reactive::before,
        .full-start::before {
            content: '';
            position: absolute; inset: 0;
            pointer-events: none;
            background:
                radial-gradient(ellipse at 0% 100%, color-mix(in srgb, var(--lampishe-c1) 22%, transparent) 0%, transparent 45%),
                radial-gradient(ellipse at 100% 0%, color-mix(in srgb, var(--lampishe-c2) 18%, transparent) 0%, transparent 50%);
            z-index: 1;
            opacity: 0;
            transition: opacity 1.4s ease;
        }
        .full-start-new__reactive.loaded::before,
        .full-start.loaded::before { opacity: 1; }

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
            font-size: calc(var(--lampishe-logo-size) * 0.95) !important;
            margin-bottom: .35em;
            display: inline-flex;
        }

        /* ===== SPLASH-ЭКРАН (стартовая заставка) ===== */
        .lampishe-splash {
            position: fixed; inset: 0; z-index: 999999;
            display: flex; align-items: center; justify-content: center;
            background: radial-gradient(ellipse at center,
                color-mix(in srgb, var(--lampishe-c1) 18%, #000) 0%,
                #000 70%);
            opacity: 1;
            transition: opacity .8s ease;
            overflow: hidden;
        }
        .lampishe-splash.hide { opacity: 0; pointer-events: none; }
        .lampishe-splash::before, .lampishe-splash::after {
            content: '';
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: .55;
            animation: lampisheSplashOrb 6s ease-in-out infinite;
        }
        .lampishe-splash::before {
            width: 55vmin; height: 55vmin;
            background: var(--lampishe-c1);
            top: -10%; left: -10%;
        }
        .lampishe-splash::after {
            width: 60vmin; height: 60vmin;
            background: var(--lampishe-c2);
            bottom: -15%; right: -10%;
            animation-delay: -2.5s;
        }
        @keyframes lampisheSplashOrb {
            0%, 100% { transform: translate3d(0,0,0) scale(1); }
            50%      { transform: translate3d(6%,-4%,0) scale(1.15); }
        }
        .lampishe-splash__logo {
            position: relative; z-index: 2;
            font-size: clamp(3rem, 12vw, 9rem) !important;
            text-align: center;
        }
        .lampishe-splash__logo .l {
            opacity: 0;
            transform: translateY(40px) scale(.6) rotateX(60deg);
            animation: lampisheSplashLetter .9s cubic-bezier(.2,1.6,.3,1) forwards;
        }
        .lampishe-splash__logo .l:nth-child(1) { animation-delay: .05s; }
        .lampishe-splash__logo .l:nth-child(2) { animation-delay: .15s; }
        .lampishe-splash__logo .l:nth-child(3) { animation-delay: .25s; }
        .lampishe-splash__logo .l:nth-child(4) { animation-delay: .35s; }
        .lampishe-splash__logo .l:nth-child(5) { animation-delay: .45s; }
        .lampishe-splash__logo .l:nth-child(6) { animation-delay: .55s; }
        .lampishe-splash__logo .l:nth-child(7) { animation-delay: .65s; }
        .lampishe-splash__logo .l:nth-child(8) { animation-delay: .75s; }
        .lampishe-splash__logo .l:nth-child(9) { animation-delay: .85s; }
        @keyframes lampisheSplashLetter {
            0%   { opacity: 0; transform: translateY(40px) scale(.6) rotateX(60deg); filter: blur(8px); }
            60%  { opacity: 1; transform: translateY(-6px) scale(1.08) rotateX(-8deg); filter: blur(0); }
            100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0); filter: blur(0); }
        }
        .lampishe-splash__sub {
            position: absolute; bottom: 14%; left: 0; right: 0;
            text-align: center;
            font-size: clamp(.8rem, 1.6vw, 1.1rem);
            letter-spacing: .35em;
            color: rgba(255,255,255,.6);
            text-transform: uppercase;
            opacity: 0;
            animation: lampisheSplashSub 1s ease forwards .9s;
        }
        @keyframes lampisheSplashSub {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* ===== ШИРОКИЙ ЭКРАН CARDIFY (открытие карточки) ===== */
        .full, .activity--full {
            animation: lampisheCardifyIn .7s cubic-bezier(.2,.9,.25,1) both;
        }
        @keyframes lampisheCardifyIn {
            0%   { opacity: 0; transform: scale(.92); filter: blur(14px); clip-path: inset(20% 8% 20% 8% round 2em); }
            60%  { opacity: 1; filter: blur(0); }
            100% { opacity: 1; transform: scale(1); filter: blur(0); clip-path: inset(0 0 0 0 round 0); }
        }
        .full-start-new, .full-start {
            position: relative;
            min-height: 92vh;
        }
        .full-start-new__background, .full-start__background,
        .full-start-new__background-image {
            min-height: 100vh !important;
            background-size: cover !important;
            background-position: center 18% !important;
        }
        /* затемняющий «кинематографичный» градиент по краям hero */
        .full-start-new__reactive::after,
        .full-start::after {
            content:''; position: absolute; inset: 0;
            pointer-events: none; z-index: 1;
            background:
                linear-gradient(180deg, rgba(0,0,0,.55) 0%, transparent 22%, transparent 55%, rgba(0,0,0,.92) 100%),
                linear-gradient(90deg,  rgba(0,0,0,.7)  0%, transparent 35%, transparent 65%, rgba(0,0,0,.4)  100%);
        }
        .full-start-new__details, .full-start__details,
        .full-start-new__title, .full-start__title,
        .full-start-new__rate-line, .full-start__rate,
        .full-start-new__buttons, .full-start__buttons,
        .lampishe-hero-logo {
            position: relative; z-index: 3;
        }
        .full-start-new__buttons .full-start-new__button,
        .full-start__buttons .selector {
            backdrop-filter: blur(10px) saturate(1.2);
            -webkit-backdrop-filter: blur(10px) saturate(1.2);
            background: rgba(255,255,255,.08) !important;
            border: 1px solid rgba(255,255,255,.18) !important;
            border-radius: 1em !important;
            transition: all .35s cubic-bezier(.2,.9,.25,1) !important;
        }
        .full-start-new__buttons .full-start-new__button.focus,
        .full-start__buttons .selector.focus {
            background: linear-gradient(135deg, var(--lampishe-c1), var(--lampishe-c2)) !important;
            border-color: transparent !important;
            box-shadow: 0 14px 40px -10px color-mix(in srgb, var(--lampishe-c1) 75%, transparent),
                        0 0 50px color-mix(in srgb, var(--lampishe-c2) 45%, transparent) !important;
            transform: translateY(-3px) scale(1.04);
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
                    logo.innerHTML = buildLogoHtml();
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

    /* =========================================================
       ТИТУЛЬНЫЕ ЛОГО ФИЛЬМОВ НА КАРТОЧКАХ (TMDB)
       ========================================================= */
    var logoCache = {};
    var logoNoneCache = {};

    function cardLogosEnabled() {
        return getStorage('lampishe_card_logos', 'true') === 'true';
    }

    function pickBestLogo(logos) {
        if (!logos || !logos.length) return null;
        // приоритет: ru → en → null (без языка) → первый попавшийся
        var ru = logos.filter(function (l) { return l.iso_639_1 === 'ru'; });
        var en = logos.filter(function (l) { return l.iso_639_1 === 'en'; });
        var nl = logos.filter(function (l) { return !l.iso_639_1 || l.iso_639_1 === 'xx' || l.iso_639_1 === null; });
        // сортируем по голосам/размеру
        var sorter = function (a, b) { return (b.vote_average || 0) - (a.vote_average || 0) || (b.width || 0) - (a.width || 0); };
        if (ru.length) return ru.sort(sorter)[0];
        if (en.length) return en.sort(sorter)[0];
        if (nl.length) return nl.sort(sorter)[0];
        return logos.sort(sorter)[0];
    }

    function getTmdbBase() {
        try {
            if (window.Lampa && Lampa.TMDB && Lampa.TMDB.image) {
                // Возвращает полную ссылку на CDN постеров
                return null; // используем Lampa.TMDB.image() напрямую
            }
        } catch (e) {}
        return 'https://image.tmdb.org';
    }

    function buildTmdbApiUrl(type, id) {
        var path = type + '/' + id + '/images?include_image_language=ru,en,null';
        try {
            if (window.Lampa && Lampa.TMDB && Lampa.TMDB.api) {
                return Lampa.TMDB.api(path);
            }
        } catch (e) {}
        // запасной вариант — публичный TMDB ключ Lampa (используется в большинстве сборок)
        var key = '4ef0d7355d9ffb5151e987764708ce96';
        try {
            var stored = (window.Lampa && Lampa.Storage) ? Lampa.Storage.get('tmdb_api_key', key) : key;
            if (stored) key = stored;
        } catch (e) {}
        return 'https://api.themoviedb.org/3/' + path + '&api_key=' + key;
    }

    function buildLogoImageUrl(filePath) {
        try {
            if (window.Lampa && Lampa.TMDB && Lampa.TMDB.image) {
                return Lampa.TMDB.image('/t/p/w500' + filePath);
            }
        } catch (e) {}
        return 'https://image.tmdb.org/t/p/w500' + filePath;
    }

    function fetchAndApplyCardLogo(cardEl, type, id) {
        if (!cardEl || !id || !type) return;
        if (cardEl.querySelector('.lampishe-card-logo')) return;
        var key = type + '_' + id;
        if (logoNoneCache[key]) return;

        function place(src) {
            if (!cardEl || !src) return;
            if (cardEl.querySelector('.lampishe-card-logo')) return;
            var view = cardEl.querySelector('.card__view') || cardEl;
            var img = document.createElement('img');
            img.className = 'lampishe-card-logo';
            img.alt = '';
            img.onload = function () {
                cardEl.classList.add('lampishe-has-logo');
                requestAnimationFrame(function () { img.classList.add('loaded'); });
            };
            img.onerror = function () { img.remove(); };
            img.src = src;
            view.appendChild(img);
        }

        if (logoCache[key]) {
            place(logoCache[key]);
            return;
        }

        var url = buildTmdbApiUrl(type, id);
        if (!url) return;
        try {
            fetch(url).then(function (r) { return r.json(); }).then(function (data) {
                var best = pickBestLogo(data && data.logos);
                if (!best) { logoNoneCache[key] = true; return; }
                var src = buildLogoImageUrl(best.file_path);
                logoCache[key] = src;
                place(src);
            }).catch(function () { logoNoneCache[key] = true; });
        } catch (e) {}
    }

    function processCardElement(cardEl) {
        if (!cardEl || !cardEl.classList || !cardEl.classList.contains('card')) return;
        // вставляем слой бегущего блика «жидкое стекло» один раз
        try {
            var view = cardEl.querySelector('.card__view');
            if (view && !view.querySelector('.lampishe-shine')) {
                var sh = document.createElement('div');
                sh.className = 'lampishe-shine';
                view.appendChild(sh);
            }
        } catch (e) {}
        if (cardEl.getAttribute('data-lampishe-logo-tried') === '1') return;

        // достаём данные карточки через jQuery (Lampa везде использует $.data на DOM-элементе)
        var data = null;
        try {
            if (window.$ && $(cardEl).data) data = $(cardEl).data('card-data') || $(cardEl).data('object') || $(cardEl).data();
        } catch (e) {}
        // ищем id и тип в DOM-атрибутах как fallback
        var id = (data && (data.id || (data.movie && data.movie.id))) || cardEl.getAttribute('data-id');
        var type = null;
        if (data) {
            if (data.media_type) type = data.media_type;
            else if (data.name && !data.title) type = 'tv';
            else if (data.title) type = 'movie';
            else if (data.first_air_date && !data.release_date) type = 'tv';
            else type = 'movie';
        } else {
            type = cardEl.getAttribute('data-type') || 'movie';
        }
        if (!id) return;
        cardEl.setAttribute('data-lampishe-logo-tried', '1');
        fetchAndApplyCardLogo(cardEl, type, id);
    }

    var cardObserver = null;
    function startCardObserver() {
        if (cardObserver) return;
        cardObserver = new MutationObserver(function (mutations) {
            if (!cardLogosEnabled()) return;
            mutations.forEach(function (m) {
                m.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    if (node.classList && node.classList.contains('card')) processCardElement(node);
                    if (node.querySelectorAll) {
                        node.querySelectorAll('.card').forEach(processCardElement);
                    }
                });
            });
        });
        cardObserver.observe(document.body, { childList: true, subtree: true });
        // обрабатываем уже существующие карточки
        if (cardLogosEnabled()) {
            document.querySelectorAll('.card').forEach(processCardElement);
        }
    }

    function bindCardLogoEvents() {
        if (!window.Lampa || !Lampa.Listener) return;
        // самый надёжный канал — событие card.build (передаёт object и body)
        Lampa.Listener.follow('card', function (e) {
            if (!cardLogosEnabled()) return;
            if ((e.type === 'build' || e.type === 'visible') && e.object) {
                var el = (e.body && e.body[0]) || e.body || e.element;
                if (!el) return;
                el.setAttribute('data-lampishe-logo-tried', '1');
                var d = e.object;
                var type = d.media_type || (d.name && !d.title ? 'tv' : 'movie');
                fetchAndApplyCardLogo(el, type, d.id);
            }
        });
    }

    function heroLogoEnabled() {
        return getStorage('lampishe_hero_logo', 'true') === 'true';
    }

    function applyHeroLogo() {
        if (!heroLogoEnabled()) return;
        // ищем активный hero-блок
        var hero = document.querySelector('.full-start-new, .full-start');
        if (!hero) return;
        if (hero.querySelector('.lampishe-hero-logo')) return;

        // достаём данные текущей активности
        var data = null;
        try {
            if (window.Lampa && Lampa.Activity) {
                var active = Lampa.Activity.active();
                if (active && active.activity && active.activity.card) data = active.activity.card;
                else if (active && active.card) data = active.card;
                else if (active && active.movie) data = active.movie;
            }
        } catch (e) {}
        if (!data || !data.id) return;

        var type = data.media_type || (data.name && !data.title ? 'tv' : 'movie');
        var key = type + '_' + data.id;

        function place(src) {
            var hero2 = document.querySelector('.full-start-new, .full-start');
            if (!hero2 || hero2.querySelector('.lampishe-hero-logo')) return;
            var titleEl = hero2.querySelector('.full-start-new__title, .full-start__title');
            if (!titleEl) return;
            var img = document.createElement('img');
            img.className = 'lampishe-hero-logo';
            img.alt = '';
            img.onload = function () {
                hero2.classList.add('full-start--has-logo');
                requestAnimationFrame(function () { img.classList.add('loaded'); });
            };
            img.onerror = function () { img.remove(); };
            img.src = src;
            titleEl.parentNode.insertBefore(img, titleEl);
        }

        if (logoCache[key]) { place(logoCache[key]); return; }
        if (logoNoneCache[key]) return;

        var url = buildTmdbApiUrl(type, data.id);
        if (!url) return;
        try {
            fetch(url).then(function (r) { return r.json(); }).then(function (d) {
                var best = pickBestLogo(d && d.logos);
                if (!best) { logoNoneCache[key] = true; return; }
                var src = buildLogoImageUrl(best.file_path);
                logoCache[key] = src;
                place(src);
            }).catch(function () { logoNoneCache[key] = true; });
        } catch (e) {}
    }

    /* =========================================================
       ЗВУКИ НАВИГАЦИИ (Web Audio, без внешних файлов)
       ========================================================= */
    var audioCtx = null;
    var lastSoundAt = 0;
    function getAudioCtx() {
        if (audioCtx) return audioCtx;
        try {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            audioCtx = new Ctx();
        } catch (e) { return null; }
        return audioCtx;
    }
    function soundsEnabled() { return getStorage('lampishe_sounds', 'true') === 'true'; }
    function soundVolume() {
        var v = parseFloat(getStorage('lampishe_sound_vol', '0.35'));
        if (isNaN(v)) v = 0.35;
        return Math.max(0, Math.min(1, v));
    }
    function playTone(freq, dur, type, gainMul) {
        if (!soundsEnabled()) return;
        var now = Date.now();
        if (now - lastSoundAt < 30) return; // антидребезг
        lastSoundAt = now;
        var ctx = getAudioCtx();
        if (!ctx) return;
        try {
            if (ctx.state === 'suspended') ctx.resume();
            var t = ctx.currentTime;
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = type || 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.55), t + dur);
            var peak = soundVolume() * (gainMul || 1) * 0.6;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + dur + 0.02);
        } catch (e) {}
    }
    function soundFocus()  { playTone(880, 0.07, 'triangle', 0.6); }
    function soundEnter()  { playTone(660, 0.12, 'sine', 1.0); setTimeout(function(){ playTone(990, 0.10, 'sine', 0.8); }, 55); }
    function soundBack()   { playTone(330, 0.12, 'triangle', 0.9); }

    var soundsBound = false;
    function bindNavigationSounds() {
        if (soundsBound) return;
        soundsBound = true;

        // фокус по навигации (Lampa Controller)
        try {
            if (window.Lampa && Lampa.Controller && Lampa.Listener) {
                Lampa.Listener.follow('controller', function (e) {
                    if (!soundsEnabled()) return;
                    if (e.type === 'toggle') soundFocus();
                });
            }
        } catch (e) {}

        // глобальный fallback: смена focus класса
        document.addEventListener('mouseover', function (ev) {
            if (!soundsEnabled()) return;
            var t = ev.target;
            if (t && t.closest && (t.closest('.card') || t.closest('.selector'))) soundFocus();
        }, true);

        // клавиши пульта/клавиатуры
        document.addEventListener('keydown', function (ev) {
            if (!soundsEnabled()) return;
            var k = ev.keyCode;
            if (k === 37 || k === 38 || k === 39 || k === 40) soundFocus();   // стрелки
            else if (k === 13) soundEnter();                                   // Enter / OK
            else if (k === 8 || k === 27 || k === 461) soundBack();            // Back / Esc
        }, true);

        // первый клик/тап разблокирует AudioContext (требование браузеров)
        var unlock = function () {
            var ctx = getAudioCtx();
            if (ctx && ctx.state === 'suspended') ctx.resume();
            document.removeEventListener('click', unlock, true);
            document.removeEventListener('keydown', unlock, true);
        };
        document.addEventListener('click', unlock, true);
        document.addEventListener('keydown', unlock, true);
    }

    function showSplash() {
        if (getStorage('lampishe_splash', 'true') !== 'true') return;
        if (document.getElementById('lampishe-splash')) return;
        var el = document.createElement('div');
        el.id = 'lampishe-splash';
        el.className = 'lampishe-splash';
        el.innerHTML =
            '<div class="lampishe-splash__logo lampishe-logo">' + buildLogoHtml() + '</div>' +
            '<div class="lampishe-splash__sub">media center</div>';
        var place = function () {
            (document.body || document.documentElement).appendChild(el);
            setTimeout(function () { el.classList.add('hide'); }, 1900);
            setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 2900);
        };
        if (document.body) place();
        else document.addEventListener('DOMContentLoaded', place, { once: true });
    }

    function clearAllHeroLogos() {
        document.querySelectorAll('.lampishe-hero-logo').forEach(function (n) { n.remove(); });
        document.querySelectorAll('.full-start--has-logo').forEach(function (n) { n.classList.remove('full-start--has-logo'); });
    }

    function clearAllCardLogos() {
        document.querySelectorAll('.lampishe-card-logo').forEach(function (n) { n.remove(); });
        document.querySelectorAll('.card.lampishe-has-logo').forEach(function (n) { n.classList.remove('lampishe-has-logo'); });
        document.querySelectorAll('[data-lampishe-logo-tried]').forEach(function (n) { n.removeAttribute('data-lampishe-logo-tried'); });
    }

    /* =========================================================
       НАСТРОЙКИ Lampa: тема, размер, цвет из постера
       ========================================================= */
    function registerSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;

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

        // лого фильмов на карточках
        Lampa.SettingsApi.addParam({
            component: 'lampishe',
            param: { name: 'lampishe_card_logos', type: 'trigger', default: true },
            field: { name: 'Лого фильмов на постерах', description: 'Показывать официальное название-логотип поверх постера (TMDB)' },
            onChange: function (v) {
                setStorage('lampishe_card_logos', v ? 'true' : 'false');
                if (!v) clearAllCardLogos();
                else document.querySelectorAll('.card').forEach(processCardElement);
            }
        });

        // стартовая заставка
        Lampa.SettingsApi.addParam({
            component: 'lampishe',
            param: { name: 'lampishe_splash', type: 'trigger', default: true },
            field: { name: 'Стартовая заставка', description: 'Показывать заставку LAMP!SHE при запуске приложения' },
            onChange: function (v) {
                setStorage('lampishe_splash', v ? 'true' : 'false');
                if (v) showSplash();
            }
        });

        // звуки навигации
        Lampa.SettingsApi.addParam({
            component: 'lampishe',
            param: { name: 'lampishe_sounds', type: 'trigger', default: true },
            field: { name: 'Звуки навигации', description: 'Мягкие щелчки при перемещении по меню, OK и «Назад»' },
            onChange: function (v) {
                setStorage('lampishe_sounds', v ? 'true' : 'false');
                if (v) { bindNavigationSounds(); soundEnter(); }
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'lampishe',
            param: {
                name: 'lampishe_sound_vol',
                type: 'select',
                values: { '0.15': 'Тихо', '0.35': 'Средне', '0.6': 'Громко', '0.9': 'Очень громко' },
                default: '0.35'
            },
            field: { name: 'Громкость звуков', description: 'Уровень громкости звуков навигации' },
            onChange: function (v) { setStorage('lampishe_sound_vol', v); soundFocus(); }
        });

        // лого на главном баннере (Netflix-стиль)
        Lampa.SettingsApi.addParam({
            component: 'lampishe',
            param: { name: 'lampishe_hero_logo', type: 'trigger', default: true },
            field: { name: 'Лого на главном баннере', description: 'Заменять текстовое название фильма на официальный логотип (как в Netflix)' },
            onChange: function (v) {
                setStorage('lampishe_hero_logo', v ? 'true' : 'false');
                if (!v) clearAllHeroLogos();
                else applyHeroLogo();
            }
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

        // Превью — вставляется при открытии раздела LAMP!SHE
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
                    '<div class="lampishe-preview__logo lampishe-logo">' + buildLogoHtml() + '</div>' +
                    '<div class="lampishe-preview__meta">2026 • США</div>' +
                    '<div class="lampishe-preview__title">Превью</div>' +
                    '<div class="lampishe-preview__sub">Так будет выглядеть оформление</div>' +
                '</div>' +
            '</div>';
    }

    function injectPreview() {
        var container = document.querySelector('.settings-param__name') ? document.querySelector('.settings__content .scroll__body, .settings .scroll__body, .settings-param-content, .settings-content') : null;
        // более надёжно — берём контейнер с параметрами
        if (!container) {
            var anyParam = document.querySelector('[data-name^="lampishe_"], [data-name="lampishe_theme"]');
            if (anyParam) container = anyParam.parentElement;
        }
        if (!container) return;
        // удаляем старое превью
        var old = document.getElementById('lampishe-preview');
        if (old && old.parentElement) old.parentElement.removeChild(old);
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
        bindCardLogoEvents();
        startCardObserver();
        bindNavigationSounds();
        showSplash();

        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') { applyLogo(); applyStyles(); }
            });
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite' || e.type === 'build') {
                    applyLogo();
                    setTimeout(function () { colorizeHeroTitle(); applyHeroLogo(); }, 600);
                }
            });
            Lampa.Listener.follow('activity', function (e) {
                if (e.type === 'archive' || e.type === 'start') {
                    setTimeout(function () { colorizeHeroTitle(); applyHeroLogo(); }, 700);
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

        console.log('%c LAMP!SHE v' + PLUGIN_VERSION + ' loaded ', 'background:linear-gradient(90deg,#ff2d55,#af52de);color:#fff;padding:4px 10px;border-radius:6px;font-weight:bold;');
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
