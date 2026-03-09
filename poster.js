(function() {
    'use strict';

    // Константы (используются в функциях)
    var STORAGE_KEY = 'lampac_theme'; // может понадобиться для определения темы
    var CARD_STYLE_ID = 'lampac-card-display-style';
    var SCREEN_STYLE_ID = 'lampac-screen-style'; // используется в applyScreenStyle, но тут не включён

    // Вспомогательные функции для работы с цветом (из оригинального кода)
    function hexRgb(hex) {
        return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    }

    function cR(hex, a) {
        var c = hexRgb(hex);
        return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
    }

    // ========== НАСТРОЙКИ КАРТОЧЕК ==========
    function applyCardDisplay() {
        var existing = document.getElementById(CARD_STYLE_ID);
        if (existing) existing.parentNode.removeChild(existing);

        var rules = [];

        // Скрытие элементов
        if (Lampa.Storage.get('lampac_card_quality', 'show') === 'hide') {
            rules.push('.card__quality { display: none !important; }');
        }
        if (Lampa.Storage.get('lampac_card_vote', 'show') === 'hide') {
            rules.push('.card__vote { display: none !important; }');
        }
        if (Lampa.Storage.get('lampac_card_title', 'show') === 'hide') {
            rules.push('.card__title { display: none !important; }');
        }
        if (Lampa.Storage.get('lampac_card_year', 'show') === 'hide') {
            rules.push('.card__age { display: none !important; }');
        } else if (Lampa.Storage.get('lampac_card_year', 'show') === 'focus') {
            rules.push('.card__age { opacity: 0; max-height: 0; overflow: hidden; transition: .18s ease; }');
            rules.push('.card.focus .card__age, .card.hover .card__age, .card.traverse .card__age { opacity: 1; max-height: 2em; }');
        }

        // Радиус скругления
        var radiusMap = { small: '0.4em', medium: '1em', large: '1.6em', round: '2.2em' };
        var radius = radiusMap[Lampa.Storage.get('lampac_card_radius', 'medium')];
        if (radius) {
            rules.push('.card__img { border-radius: ' + radius + ' !important; }');
            rules.push('.card__view::after { border-radius: calc(' + radius + ' + 0.3em) !important; }');
        }

        // Размер шрифта названия
        var titleSizeMap = { small: '0.82em', normal: '', large: '1.1em' };
        var titleSize = titleSizeMap[Lampa.Storage.get('lampac_card_title_size', 'normal')];
        if (titleSize) {
            rules.push('.card__title { font-size: ' + titleSize + ' !important; }');
        }

        // Плотность сетки
        var density = Lampa.Storage.get('lampac_card_density', 'balance');
        if (density === 'compact') {
            rules.push('.items-line .card { margin-right: 0.28em !important; }');
            rules.push('.items-line .card .card__view { transform: scale(0.94); transform-origin: center top; }');
        } else if (density === 'large') {
            rules.push('.items-line .card { margin-right: 0.72em !important; }');
            rules.push('.items-line .card .card__view { transform: scale(1.04); transform-origin: center top; }');
        }

        // Масштаб при фокусе
        var focusScaleMap = { soft: '1.03', normal: '1.06', strong: '1.09', xstrong: '1.12' };
        var focusScale = focusScaleMap[Lampa.Storage.get('lampac_card_focus_scale', 'normal')] || '1.06';
        rules.push('.card.focus .card__view { transform: scale(' + focusScale + ') !important; transition: transform .22s ease, box-shadow .22s ease; }');

        // Стиль рейтинга
        var voteStyle = Lampa.Storage.get('lampac_card_vote_style', 'default');
        if (voteStyle === 'colored') {
            rules.push('.card__vote { padding: 0.2em 0.5em; border-radius: 0.4em; font-weight: 700; }');
            rules.push('.card__vote--good { background: rgba(76,175,80,0.85); color: #fff; }');
            rules.push('.card__vote--bad { background: rgba(244,67,54,0.85); color: #fff; }');
            rules.push('.card__vote--average { background: rgba(255,152,0,0.85); color: #fff; }');
        } else if (voteStyle === 'pill') {
            rules.push('.card__vote {' +
                '  background: rgba(0,0,0,0.65); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);' +
                '  padding: 0.15em 0.5em; border-radius: 2em; font-weight: 600;' +
                '  border: 1px solid rgba(255,255,255,0.15);' +
                '}');
        }

        // Fallback для карточек без постера
        if (Lampa.Storage.get('lampac_card_no_poster', 'fallback') === 'fallback') {
            rules.push('.card.lampac-card-fallback .card__img {' +
                "content:''; background: linear-gradient(135deg,#1a1f2b,#10141d) !important;" +
                '}');
        }

        if (rules.length) {
            var style = document.createElement('style');
            style.id = CARD_STYLE_ID;
            style.type = 'text/css';
            style.textContent = rules.join('\n');
            document.head.appendChild(style);
        }
        applyCardEnhancements(); // дополнительная обработка (скрытие просмотренных, fallback)
    }

    // Проверка, есть ли у карточки постер (по src изображения)
    function cardHasNoPoster(card) {
        var img = card && card.querySelector('.card__img');
        if (!img) return true;
        var src = img.currentSrc || img.src || '';
        if (!src) return true;
        return /img_broken\.svg|img_load\.svg/i.test(src);
    }

    // Применяет скрытие просмотренных и fallback для карточек без постера
    function applyCardEnhancements() {
        var hideViewed = Lampa.Storage.get('lampac_card_hide_viewed', 'off') === 'on';
        var noPosterMode = Lampa.Storage.get('lampac_card_no_poster', 'fallback');
        var cards = document.querySelectorAll('.card');

        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            card.classList.remove('lampac-card-fallback');
            card.style.display = '';

            if (hideViewed) {
                var viewed = card.querySelector('.icon--history, .card__marker--viewed, .card__marker--look');
                if (viewed) {
                    card.style.display = 'none';
                    continue;
                }
            }

            if (cardHasNoPoster(card)) {
                if (noPosterMode === 'hide') {
                    card.style.display = 'none';
                    continue;
                } else if (noPosterMode === 'fallback') {
                    card.classList.add('lampac-card-fallback');
                    var img = card.querySelector('.card__img');
                    if (img) {
                        img.src = './img/img_broken.svg';
                    }
                }
            }
        }
    }

    // ========== МОБИЛЬНЫЙ ЭКРАН: ПОСТЕР И ЦВЕТ ФОНА ==========

    // Нормализация цвета, извлечённого из постера, для использования в CSS
    function normalizeMobilePosterColor(rgb) {
        if (!rgb || rgb.length < 3) return { rgb: '24,34,44', hex: '#18222c' };
        var r = Math.max(0, Math.min(255, Math.round(rgb[0] * 0.72)));
        var g = Math.max(0, Math.min(255, Math.round(rgb[1] * 0.72)));
        var b = Math.max(0, Math.min(255, Math.round(rgb[2] * 0.78)));
        var max = Math.max(r, g, b);
        if (max < 46) {
            var boost = 46 - max;
            r = Math.min(255, r + boost);
            g = Math.min(255, g + boost);
            b = Math.min(255, b + boost);
        }
        var rgbStr = [r, g, b].join(',');
        var hex = '#' + [r, g, b].map(function (n) {
            var h = n.toString(16);
            return h.length === 1 ? '0' + h : h;
        }).join('');
        return { rgb: rgbStr, hex: hex };
    }

    // Установка CSS-переменных для цвета фона мобильной карточки
    function setMobilePosterBgVars(color) {
        var root = document.documentElement;
        if (!root) return;
        var value = color || { rgb: '24,34,44', hex: '#18222c' };
        root.style.setProperty('--lampac-mobile-poster-rgb', value.rgb);
        root.style.setProperty('--lampac-mobile-poster-bg', value.hex);
    }

    // Анализ изображения постера для извлечения доминирующего цвета
    function applyPosterBackgroundFromImage(img) {
        if (!img || !img.complete) {
            setMobilePosterBgVars();
            return;
        }

        try {
            // Проверяем, нужно ли использовать цвет постера (настройка lampac_screen_mobile_bg)
            var mobileBgSetting = Lampa.Storage.get('lampac_screen_mobile_bg', '');
            var defaultBg = Lampa.Storage.get(STORAGE_KEY, 'classic') === 'classic' ? 'poster' : 'black';
            if ((mobileBgSetting || defaultBg) !== 'poster') return;

            var c = document.createElement('canvas');
            c.width = 18;
            c.height = 18;
            var x = c.getContext('2d', { willReadFrequently: true });
            x.drawImage(img, 0, 0, 18, 18);

            var data = x.getImageData(0, 6, 18, 10).data; // берём нижнюю часть для усреднения
            var r = 0, g = 0, b = 0, count = 0;
            for (var i = 0; i < data.length; i += 4) {
                var alpha = data[i + 3];
                if (alpha < 40) continue;
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }

            if (!count) {
                setMobilePosterBgVars();
                return;
            }

            setMobilePosterBgVars(normalizeMobilePosterColor([r / count, g / count, b / count]));
        } catch (e) {
            setMobilePosterBgVars();
        }
    }

    // Сбор кандидатов URL постера из карточки и DOM
    function buildMobilePosterCandidates(card, root) {
        var urls = [];
        var path = card && (card.poster_path || card.backdrop_path);
        var tmdb = window.Lampa && Lampa.TMDB && Lampa.TMDB.image;

        function pushUnique(url) {
            if (!url) return;
            if (urls.indexOf(url) === -1) urls.push(url);
        }

        function normalizePath(p) {
            if (!p) return '';
            if (/^https?:\/\//i.test(p)) return p;
            return p.charAt(0) === '/' ? p : ('/' + p);
        }

        var norm = normalizePath(path);
        if (/^https?:\/\//i.test(norm)) {
            pushUnique(norm);
        } else if (norm && tmdb) {
            // Пробуем разные форматы URL TMDB
            pushUnique(Lampa.TMDB.image('w780' + norm));
            pushUnique(Lampa.TMDB.image('/t/p/w780' + norm));
            pushUnique(Lampa.TMDB.image('original' + norm));
            pushUnique(Lampa.TMDB.image('/t/p/original' + norm));
        }

        var domImg = root && (root.querySelector('img.full-start__background') || root.querySelector('.full-start-new__img') || root.querySelector('.full-start__img'));
        if (domImg && domImg.src) pushUnique(domImg.src);

        return urls;
    }

    // Загрузка постера с перебором URL-кандидатов
    function loadPosterWithFallback(img, urls, onFail) {
        if (!img || !urls || !urls.length) {
            if (onFail) onFail();
            return;
        }
        var index = 0;
        img.onerror = function () {
            index++;
            if (index >= urls.length) {
                img.onerror = null;
                if (onFail) onFail();
                return;
            }
            img.src = urls[index];
        };
        img.src = urls[index];
    }

    // Создание/обновление мобильной карточки с постером
    function renderMobilePosterCard() {
        if (window.innerWidth > 600) return;
        if (Lampa.Storage.get('lampac_screen_mobile_layout', 'poster') !== 'poster') {
            restoreMobileInfoBlock(); // функция не включена в эту вырезку, но можно оставить заглушку
            cleanupMobilePosterCard();
            setMobilePosterBgVars();
            return;
        }

        var root = document.querySelector('.full-start-new');
        var body = root && root.querySelector('.full-start-new__body');
        var right = root && root.querySelector('.full-start-new__right');
        if (!root || !body || !right) return;

        var anchor = body.querySelector('.lampac-mobile-right-anchor');
        if (!anchor) {
            anchor = document.createElement('div');
            anchor.className = 'lampac-mobile-right-anchor';
            body.insertBefore(anchor, right);
        }

        var activity = Lampa.Activity.active();
        var card = activity && activity.card;
        var candidates = buildMobilePosterCandidates(card, root);
        if (!candidates.length) return;

        var posterCard = body.querySelector('.lampac-mobile-poster-card');
        if (!posterCard) {
            posterCard = document.createElement('div');
            posterCard.className = 'lampac-mobile-poster-card';
            posterCard.innerHTML = '<img alt="" />';
            body.insertBefore(posterCard, anchor.nextSibling);
        }

        if (right.parentNode !== body) body.appendChild(right);
        if (posterCard.nextSibling !== right) body.insertBefore(right, posterCard.nextSibling);
        right.classList.remove('lampac-mobile-right-on-poster');

        var img = posterCard.querySelector('img');
        if (!img) return;

        if (img.getAttribute('data-card') === String(card && card.id || '') && img.getAttribute('data-ok') === '1') return;
        img.setAttribute('data-card', String(card && card.id || ''));
        img.setAttribute('data-ok', '0');

        img.onload = function () {
            img.setAttribute('data-ok', '1');
            posterCard.style.display = '';
            applyPosterBackgroundFromImage(img);
            applyAutoContrast(); // см. ниже
        };
        loadPosterWithFallback(img, candidates, function () {
            restoreMobileInfoBlock();
            posterCard.style.display = 'none';
            setMobilePosterBgVars();
        });
    }

    // Автоматический контраст текста на основе яркости постера
    function applyAutoContrast() {
        if (Lampa.Storage.get('lampac_screen_auto_contrast', 'on') !== 'on') return;
        var root = document.querySelector('.full-start-new');
        if (!root) return;
        var img = root.querySelector('.lampac-mobile-poster-card img') || root.querySelector('img.full-start__background');
        if (!img || !img.complete) return;

        try {
            var c = document.createElement('canvas');
            c.width = 12;
            c.height = 12;
            var x = c.getContext('2d');
            x.drawImage(img, 0, 0, 12, 12);
            var data = x.getImageData(0, 0, 12, 12).data;
            var sum = 0;
            for (var i = 0; i < data.length; i += 4) {
                sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            }
            var avg = sum / (data.length / 4);
            if (avg > 150) root.classList.add('lampac-contrast-strong');
            else root.classList.remove('lampac-contrast-strong');
        } catch (e) {
            root.classList.add('lampac-contrast-strong');
        }
    }

    // Очистка мобильной карточки (для переключения режимов)
    function cleanupMobilePosterCard() {
        var cardEl = document.querySelector('.lampac-mobile-poster-card');
        if (cardEl && cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
    }

    // Заглушка для restoreMobileInfoBlock (если нужна полная логика, её можно добавить)
    function restoreMobileInfoBlock() {
        // В оригинале здесь возвращается стандартное расположение информации
    }

    // Жест смахивания вверх для открытия постера на весь экран
    function setupMobilePosterSwipeOpen() {
        if (window.innerWidth > 600) return;
        if (window.__lampac_mobile_swipe_bound) return;

        var startY = 0;
        var startX = 0;
        var tracking = false;

        document.addEventListener('touchstart', function (e) {
            if (window.innerWidth > 600) return;
            if (!e.touches || !e.touches[0]) return;
            if (!atTopOfMovieScreen()) return; // функция проверки, что скролл вверху

            var root = getActiveFullRoot();
            if (!root) return;
            var target = e.target;
            if (!target) return;
            var inCurrentScreen = target.closest('.full-start-new');
            if (!inCurrentScreen || inCurrentScreen !== root) return;
            var inPoster = target.closest('.lampac-mobile-poster-card') || target.closest('.full-start-new__body');
            if (!inPoster) return;

            tracking = true;
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchmove', function (e) {
            if (!tracking || window.innerWidth > 600) return;
            if (!e.touches || !e.touches[0]) return;
            var dy = e.touches[0].clientY - startY;
            var dx = Math.abs(e.touches[0].clientX - startX);
            if (dy > 70 && dx < 55) {
                tracking = false;
                openMobilePosterFullscreen();
            }
        }, { passive: true });

        document.addEventListener('touchend', function () { tracking = false; }, { passive: true });
        window.__lampac_mobile_swipe_bound = true;
    }

    // Открытие постера на весь экран (затемнение)
    function openMobilePosterFullscreen() {
        closeMobilePosterFullscreen();
        var root = getActiveFullRoot();
        if (!root) return;
        var img = root.querySelector('.lampac-mobile-poster-card img') || root.querySelector('img.full-start__background') || root.querySelector('.full-start-new__img') || root.querySelector('.full-start__img');
        var src = img && (img.currentSrc || img.src);
        if (!src) return;

        var overlay = document.createElement('div');
        overlay.id = 'lampac-mobile-poster-fullscreen';
        overlay.style.cssText = [
            'position:fixed',
            'inset:0',
            'z-index:2147483647',
            'background:rgba(0,0,0,.96)',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'padding:0',
            'cursor:pointer'
        ].join(';');

        var poster = document.createElement('img');
        poster.src = src;
        poster.alt = '';
        poster.style.cssText = 'max-width:100vw; max-height:100vh; width:auto; height:auto; object-fit:contain; display:block;';
        overlay.appendChild(poster);

        var close = function () { closeMobilePosterFullscreen(); };
        overlay.addEventListener('click', close);
        overlay.addEventListener('touchend', close, { passive: true });
        document.body.appendChild(overlay);
        document.body.classList.add('lampac-poster-fs-open');
    }

    function closeMobilePosterFullscreen() {
        var old = document.getElementById('lampac-mobile-poster-fullscreen');
        if (old && old.parentNode) old.parentNode.removeChild(old);
        document.body.classList.remove('lampac-poster-fs-open');
    }

    // Вспомогательные функции для определения положения скролла и активного экрана
    function atTopOfMovieScreen() {
        var activeScroll = document.querySelector('.activity.activity--active .scroll--mask') ||
            document.querySelector('.activity.activity--active .scroll__mask') ||
            document.querySelector('.activity.activity--active .scroll__body') ||
            document.querySelector('.activity.activity--active .scroll__content') ||
            document.querySelector('.activity--active .scroll--mask') ||
            document.querySelector('.activity--active .scroll__mask') ||
            document.querySelector('.activity--active .scroll__body') ||
            document.querySelector('.activity--active .scroll__content');
        if (activeScroll && typeof activeScroll.scrollTop === 'number') {
            return activeScroll.scrollTop <= 2;
        }
        var docTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        return docTop <= 2;
    }

    function getActiveFullRoot() {
        return document.querySelector('.activity.activity--active .full-start-new') ||
            document.querySelector('.activity--active .full-start-new') ||
            document.querySelector('.full-start-new');
    }

    // Инициализация при загрузке страницы фильма
    function initPosterAndCardFeatures() {
        // Устанавливаем начальные CSS-переменные для фона
        setMobilePosterBgVars();

        // Применяем настройки карточек
        applyCardDisplay();

        // Подписываемся на события Lampa для обновления при открытии фильма
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(function () {
                    applyCardEnhancements(); // обновить видимость карточек
                    renderMobilePosterCard(); // создать мобильную карточку
                    applyAutoContrast(); // применить контраст
                    setupMobilePosterSwipeOpen(); // активировать свайп
                }, 400);
                setTimeout(function () {
                    renderMobilePosterCard();
                    applyAutoContrast();
                }, 1200);
            }
        });

        // Также можно слушать изменения настроек (если нужно обновлять на лету)
        // (здесь опущено для краткости)
    }

    // Экспорт (если нужно вызвать вручную)
    window.lampacCardUtils = {
        applyCardDisplay: applyCardDisplay,
        applyCardEnhancements: applyCardEnhancements,
        renderMobilePosterCard: renderMobilePosterCard,
        applyAutoContrast: applyAutoContrast,
        setupMobilePosterSwipeOpen: setupMobilePosterSwipeOpen,
        init: initPosterAndCardFeatures
    };

    // Автоматический запуск при готовности Lampa
    if (window.appready) {
        initPosterAndCardFeatures();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initPosterAndCardFeatures();
        });
    }

})();