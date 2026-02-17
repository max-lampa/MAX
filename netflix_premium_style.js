(function () {
    'use strict';

    /* ============================================================
     * NETFLIX PREMIUM STYLE v5.1
     * Cinematic Red Accent, Smooth Rows, Movie Logo Headers
     * ============================================================ */

    /* ------------------------------------------------------------------
     * QUICK NAVIGATION (швидкий пошук по файлу)
     * 1) UTILS + SETTINGS                  -> getBool / settings
     * 2) MENU HELPERS                      -> ensureMenuSubsectionsVisible
     * 3) LOGO PIPELINE (TMDB + fallback)   -> resolveLogoViaTmdb / applyFullCardLogo
     * 4) CARDS + SCROLL                    -> processCard / enableSmoothRowScroll
     * 5) DOM OBSERVER                      -> scanNode / startObserver
     * 6) CSS THEME (CUSTOMIZE)             -> injectStyles
     * 7) SETTINGS UI + INIT                -> initSettingsUI / init
     *
     * Шукати по тегам:
     * - "CUSTOMIZE"      : точки для швидкого кастому
     * - "BLOCK:"         : великі логічні блоки
     * - "SAFEGUARD:"     : місця із захистом від дублю/гонок
     * ------------------------------------------------------------------ */

    /* BLOCK: Utils */
    function getBool(key, def) {
        var v = Lampa.Storage.get(key, def);
        if (typeof v === 'string') v = v.trim().toLowerCase();
        return v === true || v === 'true' || v === 1 || v === '1';
    }

    function clamp(num, min, max) {
        return Math.max(min, Math.min(max, num));
    }

    function escapeSvgText(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    function cleanTitle(text) {
        return String(text || '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /* 1. LOCALIZATION */
    Lampa.Lang.add({
        netflix_premium_title: { en: 'Netflix Premium Style', uk: 'Netflix Преміум Стиль' },
        netflix_enable: { en: 'Enable Netflix Premium style', uk: 'Увімкнути Netflix Преміум стиль' },
        netflix_use_backdrops: { en: 'Use backdrops (landscape)', uk: 'Використовувати backdrops (горизонтальні)' },
        netflix_show_logos: { en: 'Replace full-card title with logo', uk: 'Заміняти заголовок картки на лого' },
        netflix_smooth_scroll: { en: 'Extra smooth row scrolling', uk: 'Дуже плавний скрол рядів' },
        netflix_round_corners: { en: 'Rounded corners', uk: 'Заокруглені кути' },
        netflix_card_height: { en: 'Card height', uk: 'Висота карток' }
    });

    /* 2. SETTINGS */
    /* CUSTOMIZE: дефолтні опції плагіна */
    var settings = {
        enabled: getBool('netflix_premium_enabled', true),
        useBackdrops: getBool('netflix_use_backdrops', true),
        showLogos: getBool('netflix_show_logos', true),
        smoothScroll: getBool('netflix_smooth_scroll', true),
        roundCorners: getBool('netflix_round_corners', true),
        cardHeight: Lampa.Storage.get('netflix_card_height', 'medium')
    };

    /* BLOCK: Runtime state (службові змінні сесії) */
    var rowScrollState = new WeakMap(); // Пер-ряд стан плавного скролу
    var domObserver = null;             // Один глобальний MutationObserver
    var lastFullMovie = null;           // Останній movie з full-екрана
    var lastFullMovieKey = '';          // SAFEGUARD: для асинхронного logo-апдейту
    var DISABLE_LOGO_CACHE = false;     // CUSTOMIZE: true = відключити cache логотипів
    var logoRequests = {};              // SAFEGUARD: дедуп паралельних TMDB запитів

    /* BLOCK: Selectors / Fallback dictionaries */
    /* CUSTOMIZE: якщо в іншій темі назви меню мають інші класи, додайте їх сюди */
    var MENU_TEXT_SELECTORS = '.menu__item-name, .menu__item-text, .menu__item-title, .menu__item-label, .menu__item-value';
    var SECTION_TITLE_SELECTORS = '.scroll__title, .category-title';
    /* CUSTOMIZE: словник fallback-лейблів для пунктів меню без нормального тексту */
    var MENU_FALLBACK_LABELS = [
        { match: 'watching', label: 'Дивляться' },
        { match: 'watch', label: 'Дивляться' },
        { match: 'popular', label: 'Популярно' },
        { match: 'trend', label: 'Тренди' },
        { match: 'recommend', label: 'Рекомендовано' },
        { match: 'recomend', label: 'Рекомендовано' },
        { match: 'movie', label: 'Фільми' },
        { match: 'film', label: 'Фільми' },
        { match: 'serial', label: 'Серіали' },
        { match: 'show', label: 'Серіали' },
        { match: 'tv', label: 'Серіали' },
        { match: 'anime', label: 'Аніме' },
        { match: 'new', label: 'Новинки' },
        { match: 'top', label: 'Топ' },
        { match: 'history', label: 'Історія' },
        { match: 'favorite', label: 'Обране' },
        { match: 'bookmarks', label: 'Закладки' }
    ];

    /* BLOCK: Card/movie data normalization */
    function getCardData(card) {
        return card.card_data ||
            card.data ||
            card.movie ||
            card._data ||
            (card.onnoderemove && card.onnoderemove.data) ||
            null;
    }

    function getMovieTitle(movie, fallback) {
        return cleanTitle(
            (movie && (movie.title || movie.name || movie.original_title || movie.original_name)) ||
            fallback ||
            ''
        );
    }

    function getMovieType(movie) {
        return movie && movie.name ? 'tv' : 'movie';
    }

    /* SAFEGUARD: унікальний ключ для синхронізації async-лого */
    function getMovieKey(movie) {
        if (!movie || !movie.id) return '';
        return getMovieType(movie) + ':' + movie.id;
    }

    /* BLOCK: TMDB logo request helpers */
    function getLogoCacheKey(type, id, lang) {
        return 'logo_cache_width_based_v1_' + type + '_' + id + '_' + lang;
    }

    function getTargetLogoLanguage() {
        var userLang = Lampa.Storage.get('logo_lang', '');
        return userLang || Lampa.Storage.get('language', 'en') || 'en';
    }

    function getTargetLogoSize() {
        return Lampa.Storage.get('logo_size', 'original') || 'original';
    }

    function pickLogoPath(dataApi, targetLang) {
        if (!dataApi || !Array.isArray(dataApi.logos) || !dataApi.logos.length) return '';

        var logos = dataApi.logos;
        for (var i = 0; i < logos.length; i++) {
            if (logos[i] && logos[i].iso_639_1 === targetLang && logos[i].file_path) return logos[i].file_path;
        }

        for (var j = 0; j < logos.length; j++) {
            if (logos[j] && logos[j].iso_639_1 === 'en' && logos[j].file_path) return logos[j].file_path;
        }

        return logos[0] && logos[0].file_path ? logos[0].file_path : '';
    }

    function flushLogoQueue(queueKey, url) {
        var queue = logoRequests[queueKey] || [];
        delete logoRequests[queueKey];
        for (var i = 0; i < queue.length; i++) queue[i](url || '');
    }

    /* BLOCK: TMDB logo resolver
     * 1) читає кеш
     * 2) дедупає одночасні запити
     * 3) тягне /images і повертає готовий URL logo
     */
    function resolveLogoViaTmdb(movie, done) {
        if (!movie || !movie.id || !Lampa.TMDB || typeof $ === 'undefined' || typeof $.get !== 'function') {
            done('');
            return;
        }

        var type = getMovieType(movie);
        var lang = getTargetLogoLanguage();
        var size = getTargetLogoSize();
        var cacheKey = getLogoCacheKey(type, movie.id, lang);
        var requestKey = cacheKey + '::' + size;

        if (!DISABLE_LOGO_CACHE) {
            var cachedUrl = Lampa.Storage.get(cacheKey);
            if (cachedUrl && cachedUrl !== 'none') {
                done(cachedUrl);
                return;
            }
            if (cachedUrl === 'none') {
                done('');
                return;
            }
        }

        if (logoRequests[requestKey]) {
            logoRequests[requestKey].push(done);
            return;
        }

        logoRequests[requestKey] = [done];

        var url = Lampa.TMDB.api(
            type + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key() + '&include_image_language=' + lang + ',en,null'
        );

        $.get(url, function (dataApi) {
            var finalLogo = pickLogoPath(dataApi, lang);
            if (!finalLogo) {
                if (!DISABLE_LOGO_CACHE) Lampa.Storage.set(cacheKey, 'none');
                flushLogoQueue(requestKey, '');
                return;
            }

            var imgUrl = Lampa.TMDB.image('/t/p/' + size + finalLogo.replace('.svg', '.png'));
            if (!DISABLE_LOGO_CACHE) Lampa.Storage.set(cacheKey, imgUrl);
            flushLogoQueue(requestKey, imgUrl);
        }).fail(function () {
            flushLogoQueue(requestKey, '');
        });
    }

    /* BLOCK: Menu label cleanup */
    function resolveMenuFallbackLabel(rawValue) {
        var raw = cleanTitle(rawValue || '');
        if (!raw) return '';

        var lower = raw.toLowerCase();
        for (var i = 0; i < MENU_FALLBACK_LABELS.length; i++) {
            if (lower.indexOf(MENU_FALLBACK_LABELS[i].match) !== -1) return MENU_FALLBACK_LABELS[i].label;
        }

        return raw;
    }

    function getMenuLabelScore(text) {
        /* Кращий score -> більша ймовірність, що це основний людський лейбл */
        var score = (text || '').length;
        if (/[А-Яа-яЁёЇїІіЄєҐґ]/.test(text)) score += 100;
        if (/^[a-z0-9_-]+$/i.test(text)) score -= 20;
        return score;
    }

    /* SAFEGUARD: прибирає "Головна main" / "Серіали serial" і дубльовані хвости */
    function cleanMenuPrimaryLabel(text) {
        var out = cleanTitle(text || '');
        if (!out) return '';

        var dup = out.match(/^(.+?)\s+\1$/i);
        if (dup && dup[1]) out = cleanTitle(dup[1]);

        var tail = out.match(/^(.*)\s+([a-z][a-z0-9_-]{1,20})$/i);
        if (tail && tail[1] && /[А-Яа-яЁёЇїІіЄєҐґ]/.test(tail[1])) out = cleanTitle(tail[1]);

        return out;
    }

    function ensureMenuPrimaryLabelNode(item) {
        var label = item.querySelector('.nfx-menu-primary-label');
        if (!label) {
            label = document.createElement('span');
            label.className = 'nfx-menu-primary-label';
            item.appendChild(label);
        }
        return label;
    }

    /* BLOCK: Section title placement (завжди над рядом карток) */
    function isSectionTitleElement(node) {
        if (!node || !node.classList) return false;
        return node.classList.contains('scroll__title') || node.classList.contains('category-title');
    }

    function getFirstDirectSectionTitle(parent) {
        if (!parent || !parent.children) return null;
        for (var i = 0; i < parent.children.length; i++) {
            if (isSectionTitleElement(parent.children[i])) return parent.children[i];
        }
        return null;
    }

    function ensureSectionTitlesAboveCards(root) {
        var scope = root && root.querySelectorAll ? root : document;
        var lines = [];

        if (scope.classList && scope.classList.contains('items-line')) lines = [scope];
        else lines = scope.querySelectorAll('.items-line');

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var parent = line.parentElement;
            if (!parent) continue;

            var prev = line.previousElementSibling;
            var next = line.nextElementSibling;
            var title = null;

            if (isSectionTitleElement(prev)) title = prev;
            else if (isSectionTitleElement(next)) title = next;
            else title = getFirstDirectSectionTitle(parent);

            if (!title) continue;

            if (title !== line.previousElementSibling) parent.insertBefore(title, line);
            parent.classList.add('nfx-section-wrap');
            title.classList.add('nfx-section-title');
        }
    }

    /* BLOCK: Menu normalization
     * Залишає один primary label на пункт меню, інше ховає.
     */
    function ensureMenuSubsectionsVisible(root) {
        var scope = root && root.querySelectorAll ? root : document;
        var items = [];

        if (scope.classList && scope.classList.contains('menu__item')) items = [scope];
        else items = scope.querySelectorAll('.menu__item');

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (!item || !item.classList) continue;

            item.classList.add('nfx-menu-item');
            var legacySub = item.querySelector('.nfx-menu-subsection');
            if (legacySub) legacySub.remove();

            var textNodes = item.querySelectorAll(MENU_TEXT_SELECTORS);
            var entries = [];

            for (var j = 0; j < textNodes.length; j++) {
                var text = cleanTitle(textNodes[j].textContent || '');
                textNodes[j].classList.remove('nfx-menu-primary', 'nfx-menu-secondary');
                if (!text) {
                    textNodes[j].classList.add('nfx-menu-secondary');
                    textNodes[j].style.display = 'none';
                    textNodes[j].style.opacity = '0';
                    textNodes[j].style.visibility = 'hidden';
                    textNodes[j].style.width = '0';
                    textNodes[j].style.maxWidth = '0';
                    continue;
                }

                var nodeScore = getMenuLabelScore(text);
                /* SAFEGUARD: menu__item-value зазвичай технічне поле (slug/alias). */
                if (textNodes[j].classList.contains('menu__item-value')) nodeScore -= 260;
                /* CUSTOMIZE: вага полів пріоритету при виборі primary label */
                if (textNodes[j].classList.contains('menu__item-name')) nodeScore += 70;
                if (textNodes[j].classList.contains('menu__item-text')) nodeScore += 45;
                if (textNodes[j].classList.contains('menu__item-title')) nodeScore += 35;

                entries.push({
                    node: textNodes[j],
                    text: text,
                    score: nodeScore
                });
            }

            if (entries.length) {
                var primary = entries[0];
                for (var k = 1; k < entries.length; k++) {
                    if (entries[k].score > primary.score) primary = entries[k];
                }

                for (var z = 0; z < entries.length; z++) {
                    var node = entries[z].node;
                    var isPrimary = node === primary.node;
                    node.classList.add(isPrimary ? 'nfx-menu-primary' : 'nfx-menu-secondary');
                    node.style.display = isPrimary ? 'block' : 'none';
                    node.style.opacity = isPrimary ? '1' : '0';
                    node.style.visibility = isPrimary ? 'visible' : 'hidden';
                    node.style.width = isPrimary ? 'auto' : '0';
                    node.style.maxWidth = isPrimary ? 'none' : '0';
                }

                var primaryText = cleanMenuPrimaryLabel(primary.text);
                var primaryNode = ensureMenuPrimaryLabelNode(item);
                primaryNode.textContent = primaryText || resolveMenuFallbackLabel(primary.text);

                continue;
            }

            var hint =
                item.getAttribute('data-title') ||
                item.getAttribute('data-name') ||
                item.getAttribute('data-action') ||
                item.getAttribute('title') ||
                (item.dataset ? (item.dataset.title || item.dataset.name || item.dataset.action || item.dataset.route) : '') ||
                '';

            var label = resolveMenuFallbackLabel(hint);
            if (!label) {
                var stale = item.querySelector('.nfx-menu-primary-label');
                if (stale) stale.remove();
                continue;
            }

            var injected = ensureMenuPrimaryLabelNode(item);
            injected.textContent = label;
        }
    }

    /* BLOCK: Logo source resolver (supports direct URL, relative path, nested objects) */
    function normalizeLogoCandidate(value) {
        if (!value) return '';

        if (typeof value === 'object') {
            value = value.url || value.file_path || value.logo || value.path || '';
        }

        if (!value || typeof value !== 'string') return '';

        if (value.indexOf('data:image') === 0) return value;
        if (value.indexOf('http://') === 0 || value.indexOf('https://') === 0) return value;
        if (value.charAt(0) === '/') return 'https://image.tmdb.org/t/p/w500' + value;
        return '';
    }

    /* BLOCK: Read logo from movie payload before requesting TMDB */
    function getMovieLogoUrl(movie) {
        if (!movie || typeof movie !== 'object') return '';

        var direct = [
            movie.logo,
            movie.logo_path,
            movie.clearlogo,
            movie.clear_logo,
            movie.img_logo,
            movie.image_logo
        ];

        for (var i = 0; i < direct.length; i++) {
            var found = normalizeLogoCandidate(direct[i]);
            if (found) return found;
        }

        var nested = [];
        if (movie.images) {
            nested.push(movie.images.logo, movie.images.clearlogo, movie.images.clear_logo);
            if (Array.isArray(movie.images.logos) && movie.images.logos.length) nested.push(movie.images.logos[0]);
        }
        if (Array.isArray(movie.logos) && movie.logos.length) nested.push(movie.logos[0]);

        for (var j = 0; j < nested.length; j++) {
            var nestedFound = normalizeLogoCandidate(nested[j]);
            if (nestedFound) return nestedFound;
        }

        return '';
    }

    /* BLOCK: Fallback logo generator (SVG based on title text) */
    function buildTextLogoDataUrl(title) {
        var source = cleanTitle(title || 'Movie');
        var text = escapeSvgText(source.length > 40 ? source.slice(0, 40).trim() + '...' : source);
        var fontSize = source.length > 24 ? 76 : 92;

        var svg =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 320">' +
                '<defs>' +
                    '<linearGradient id="nfxg" x1="0" y1="0" x2="1" y2="0">' +
                        '<stop offset="0%" stop-color="#ffffff"/>' +
                        '<stop offset="100%" stop-color="#f3f3f3"/>' +
                    '</linearGradient>' +
                '</defs>' +
                '<rect width="100%" height="100%" fill="transparent"/>' +
                '<g transform="skewX(-7) translate(40 0)">' +
                    '<text x="700" y="214" text-anchor="middle" ' +
                        'font-family="Arial Black,Helvetica,sans-serif" font-size="' + fontSize + '" ' +
                        'font-weight="900" letter-spacing="2" fill="#91070f" opacity="0.72">' + text + '</text>' +
                    '<text x="700" y="200" text-anchor="middle" ' +
                        'font-family="Arial Black,Helvetica,sans-serif" font-size="' + fontSize + '" ' +
                        'font-weight="900" letter-spacing="2" fill="url(#nfxg)">' + text + '</text>' +
                '</g>' +
            '</svg>';

        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    /* BLOCK: Replace poster with backdrop in card rows */
    function applyBackdrop(card, data) {
        if (!settings.useBackdrops || !data || !data.backdrop_path) return;

        var img = card.querySelector('.card__img');
        if (!img) return;

        var backdropUrl = 'https://image.tmdb.org/t/p/w780' + data.backdrop_path;
        if (img.dataset.nfxBackdropUrl === backdropUrl) return;

        var preload = new Image();
        preload.onload = function () {
            img.src = backdropUrl;
            img.dataset.nfxBackdropUrl = backdropUrl;
            card.classList.add('card--has-backdrop');
        };
        preload.onerror = function () {
            card.classList.remove('card--has-backdrop');
        };
        preload.src = backdropUrl;
    }

    /* BLOCK: Idempotent card processing (safe for repeated observer runs) */
    function processCard(card) {
        if (!settings.enabled) return;
        if (!card || !card.classList || !card.classList.contains('card')) return;
        if (card.dataset.nfxProcessed === 'true') return;

        var data = getCardData(card);
        applyBackdrop(card, data);
        card.dataset.nfxProcessed = 'true';
    }

    /* BLOCK: Smooth row animation frame loop */
    function animateLineScroll(line, state) {
        state.current += (state.target - state.current) * 0.18;
        line.scrollLeft = state.current;

        if (Math.abs(state.target - state.current) < 0.5) {
            line.scrollLeft = state.target;
            state.current = state.target;
            state.raf = 0;
            return;
        }

        state.raf = requestAnimationFrame(function () {
            animateLineScroll(line, state);
        });
    }

    /* BLOCK: Wheel -> horizontal smooth scroll for .items-line */
    function enableSmoothRowScroll(line) {
        if (!line || !line.classList || !line.classList.contains('items-line')) return;
        if (line.dataset.nfxSmoothBound === 'true') return;

        line.dataset.nfxSmoothBound = 'true';
        var state = {
            target: line.scrollLeft || 0,
            current: line.scrollLeft || 0,
            raf: 0
        };

        rowScrollState.set(line, state);

        line.addEventListener('wheel', function (event) {
            if (!settings.enabled || !settings.smoothScroll) return;

            var maxScroll = Math.max(0, line.scrollWidth - line.clientWidth);
            if (!maxScroll) return;

            var mostlyVertical = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
            if (!mostlyVertical) return;

            event.preventDefault();
            var delta = (event.deltaY + event.deltaX) * 0.95;

            state.target = clamp(state.target + delta, 0, maxScroll);
            if (!state.raf) {
                state.raf = requestAnimationFrame(function () {
                    animateLineScroll(line, state);
                });
            }
        }, { passive: false });
    }

    /* BLOCK: Full page title -> logo transform */
    function applyFullCardLogo(movie) {
        if (!settings.enabled) return;

        var titleNodes = document.querySelectorAll('.full-start-new__title, .full-start__title');
        if (!titleNodes.length) return;

        var movieKey = getMovieKey(movie);
        if (movieKey) lastFullMovieKey = movieKey;
        var directLogoUrl = getMovieLogoUrl(movie);
        var shouldFetchTmdbLogo = settings.showLogos && !directLogoUrl;
        var pendingTitles = [];

        for (var i = 0; i < titleNodes.length; i++) {
            var titleEl = titleNodes[i];
            if (!titleEl || !titleEl.classList) continue;

            if (!settings.showLogos) {
                restoreOriginalTitle(titleEl);
                continue;
            }

            var fallbackText = titleEl.dataset.nfxOriginalTitle || titleEl.textContent || '';
            var titleText = getMovieTitle(movie, fallbackText);
            if (!titleText) continue;

            if (!titleEl.dataset.nfxOriginalHtml) titleEl.dataset.nfxOriginalHtml = titleEl.innerHTML;
            if (!titleEl.dataset.nfxOriginalTitle) titleEl.dataset.nfxOriginalTitle = cleanTitle(titleEl.textContent || titleText);

            var fallbackLogo = buildTextLogoDataUrl(titleText);
            var initialLogoUrl = directLogoUrl || fallbackLogo;

            titleEl.classList.add('nfx-title--with-logo');
            titleEl.setAttribute('aria-label', titleText);
            titleEl.dataset.nfxMovieKey = movieKey || '';
            titleEl.innerHTML = '';

            var holder = document.createElement('div');
            holder.className = 'nfx-full-logo-holder';

            var logoImg = document.createElement('img');
            logoImg.className = 'nfx-full-logo';
            logoImg.alt = titleText;
            logoImg.loading = 'eager';
            logoImg.decoding = 'async';
            logoImg.referrerPolicy = 'no-referrer';
            logoImg.dataset.fallbackLogo = fallbackLogo;
            logoImg.dataset.nfxMovieKey = movieKey || '';
            logoImg.onerror = function () {
                this.onerror = null;
                this.src = this.dataset.fallbackLogo || buildTextLogoDataUrl(this.alt || 'Movie');
            };
            logoImg.src = initialLogoUrl;

            holder.appendChild(logoImg);
            titleEl.appendChild(holder);
            pendingTitles.push(titleEl);
        }

        if (shouldFetchTmdbLogo && movie && movie.id) {
            resolveLogoViaTmdb(movie, function (tmdbLogoUrl) {
                if (!tmdbLogoUrl) return;
                if (movieKey && lastFullMovieKey && movieKey !== lastFullMovieKey) return;

                for (var k = 0; k < pendingTitles.length; k++) {
                    var logoNode = pendingTitles[k].querySelector('.nfx-full-logo');
                    if (!logoNode) continue;
                    if (movieKey && logoNode.dataset.nfxMovieKey !== movieKey) continue;
                    logoNode.src = tmdbLogoUrl;
                }
            });
        }
    }

    /* BLOCK: Restore one title node back to default html/text */
    function restoreOriginalTitle(titleEl) {
        if (!titleEl || !titleEl.classList) return;
        if (!titleEl.classList.contains('nfx-title--with-logo')) return;

        var originalHtml = titleEl.dataset.nfxOriginalHtml;
        titleEl.classList.remove('nfx-title--with-logo');
        titleEl.removeAttribute('aria-label');

        if (typeof originalHtml === 'string') {
            titleEl.innerHTML = originalHtml;
        } else if (titleEl.dataset.nfxOriginalTitle) {
            titleEl.textContent = titleEl.dataset.nfxOriginalTitle;
        }
    }

    /* BLOCK: Restore all transformed title nodes */
    function restoreAllTitles() {
        var nodes = document.querySelectorAll('.nfx-title--with-logo');
        for (var i = 0; i < nodes.length; i++) restoreOriginalTitle(nodes[i]);
    }

    /* BLOCK: Central router for newly added DOM nodes */
    function scanNode(node) {
        if (!node || node.nodeType !== 1) return;

        if (node.classList.contains('card')) processCard(node);
        if (node.classList.contains('items-line')) enableSmoothRowScroll(node);
        if (node.classList.contains('items-line') || isSectionTitleElement(node)) ensureSectionTitlesAboveCards(node);
        if (node.classList.contains('menu') || node.classList.contains('menu__list') || node.classList.contains('menu__item')) {
            ensureMenuSubsectionsVisible(node);
        }

        if (node.classList.contains('full-start-new__title') || node.classList.contains('full-start__title')) {
            applyFullCardLogo(lastFullMovie);
        }

        var cards = node.querySelectorAll('.card');
        for (var i = 0; i < cards.length; i++) processCard(cards[i]);

        var rows = node.querySelectorAll('.items-line');
        for (var j = 0; j < rows.length; j++) {
            enableSmoothRowScroll(rows[j]);
            ensureSectionTitlesAboveCards(rows[j]);
        }

        if (node.querySelector('.menu__item')) ensureMenuSubsectionsVisible(node);
        if (node.querySelector(SECTION_TITLE_SELECTORS) || node.querySelector('.items-line')) ensureSectionTitlesAboveCards(node);
        if (node.querySelector('.full-start-new__title, .full-start__title')) applyFullCardLogo(lastFullMovie);
    }

    /* BLOCK: Global MutationObserver bootstrap */
    function startObserver() {
        if (domObserver || !document.body) return;

        domObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) scanNode(added[j]);
            }
        });

        domObserver.observe(document.body, { childList: true, subtree: true });
        scanNode(document.body);
    }

    /* BLOCK: Listen full-card events and re-apply logo at safe delays */
    function bindFullListener() {
        if (window.__netflix_full_listener_bound) return;
        window.__netflix_full_listener_bound = true;

        if (!Lampa.Listener || !Lampa.Listener.follow) return;

        Lampa.Listener.follow('full', function (event) {
            if (!settings.enabled) return;
            if (event && event.type && event.type !== 'complite') return;

            if (event && event.data && event.data.movie) {
                lastFullMovie = event.data.movie;
                lastFullMovieKey = getMovieKey(lastFullMovie);
            }
            var delays = [0, 120, 350, 700];

            for (var i = 0; i < delays.length; i++) {
                (function (delay) {
                    setTimeout(function () {
                        applyFullCardLogo(lastFullMovie);
                    }, delay);
                })(delays[i]);
            }
        });
    }

    /* BLOCK: Force re-run card processing for current DOM */
    function refreshCards() {
        var cards = document.querySelectorAll('.card');
        for (var i = 0; i < cards.length; i++) {
            delete cards[i].dataset.nfxProcessed;
            processCard(cards[i]);
        }
    }

    /* 3. CSS INJECTION
     * CUSTOMIZE: основний блок візуального кастому.
     * Першим ділом дивіться :root змінні і секції нижче.
     */
    function injectStyles() {
        var old = document.getElementById('netflix_premium_styles');
        if (old) old.remove();

        if (!settings.enabled) {
            restoreAllTitles();
            return;
        }

        /* CUSTOMIZE: presets висоти карток */
        var heights = {
            small: '170px',
            medium: '220px',
            large: '272px',
            xlarge: '340px'
        };

        var h = heights[settings.cardHeight] || heights.medium;
        var radius = settings.roundCorners ? '14px' : '4px';

        var css = `
            /* ===== BLOCK: THEME TOKENS (GLOBAL) ===== */
            :root {
                --nfx-height: ${h};
                --nfx-width: calc(var(--nfx-height) * 1.7778);
                --nfx-bg: #090909;
                --nfx-bg-soft: #171717;
                --nfx-card-bg: #1a1a1a;
                --nfx-red: #e50914;
                --nfx-red-rgb: 229, 9, 20;
                --nfx-red-deep: #b20710;
                --nfx-text: #f5f5f1;
                --nfx-muted: #b9b9b9;
                --nfx-radius: ${radius};
                --focus: var(--nfx-red);
                --focus-rgb: 229, 9, 20;
                --accent: var(--nfx-red);
            }

            /* ===== BLOCK: BASE SCROLL ===== */
            html,
            body,
            .scroll,
            .items,
            .items-line {
                scroll-behavior: smooth !important;
            }

            /* ===== BLOCK: GLOBAL BACKGROUND ===== */
            body {
                background:
                    radial-gradient(1200px 520px at 5% -10%, rgba(var(--nfx-red-rgb), 0.16), transparent 62%),
                    radial-gradient(900px 400px at 90% 0%, rgba(255, 255, 255, 0.04), transparent 65%),
                    linear-gradient(180deg, #070707 0%, #0b0b0b 30%, #111111 100%) !important;
                color: var(--nfx-text) !important;
                font-family: "Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
            }

            .background__gradient {
                background: linear-gradient(
                    to right,
                    rgba(7, 7, 7, 0.98) 0%,
                    rgba(7, 7, 7, 0.85) 35%,
                    rgba(7, 7, 7, 0.45) 62%,
                    transparent 100%
                ) !important;
            }

            /* ===== BLOCK: SECTION HEADERS ===== */
            .scroll__title,
            .category-title {
                padding-left: 4% !important;
                color: var(--nfx-text) !important;
                font-size: 1.46em !important;
                font-weight: 700 !important;
                letter-spacing: 0.02em !important;
                margin: 12px 0 8px !important;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6) !important;
            }

            .nfx-section-wrap {
                display: block !important;
                width: 100% !important;
            }

            .nfx-section-wrap > .nfx-section-title {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                width: 100% !important;
                box-sizing: border-box !important;
                padding-left: 4% !important;
                padding-right: 4% !important;
                margin-top: 12px !important;
                margin-bottom: 8px !important;
            }

            .nfx-section-wrap > .items-line {
                padding-top: 12px !important;
            }

            /* ===== BLOCK: HORIZONTAL ROW LAYOUT ===== */
            .items-line {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                gap: 18px !important;
                overflow-x: auto !important;
                overflow-y: visible !important;
                padding: 28px 4% 36px !important;
                margin-bottom: 0 !important;
                -webkit-overflow-scrolling: touch !important;
                scroll-snap-type: x proximity !important;
                scroll-padding-left: 4% !important;
                scroll-padding-right: 4% !important;
                overscroll-behavior-x: contain !important;
            }

            .items-line::-webkit-scrollbar {
                height: 0 !important;
                width: 0 !important;
                display: none !important;
            }

            /* ===== BLOCK: CARD VISUAL ===== */
            .card {
                flex: 0 0 var(--nfx-width) !important;
                width: var(--nfx-width) !important;
                height: var(--nfx-height) !important;
                margin: 0 !important;
                overflow: visible !important;
                background: transparent !important;
                border-radius: var(--nfx-radius) !important;
                z-index: 1 !important;
                scroll-snap-align: start !important;
                transition: z-index 0s 0.32s !important;
            }

            .card__view {
                width: 100% !important;
                height: 100% !important;
                padding-bottom: 0 !important;
                border-radius: var(--nfx-radius) !important;
                overflow: hidden !important;
                position: relative !important;
                background: var(--nfx-card-bg) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                transition: transform 0.32s cubic-bezier(0.2, 0.85, 0.22, 1),
                            box-shadow 0.32s ease,
                            border-color 0.32s ease !important;
                box-shadow: 0 6px 18px rgba(0, 0, 0, 0.44) !important;
            }

            .card__view::before {
                content: '' !important;
                position: absolute !important;
                left: 0 !important;
                right: 0 !important;
                top: 0 !important;
                height: 42% !important;
                background: linear-gradient(to bottom, rgba(var(--nfx-red-rgb), 0.16), transparent) !important;
                opacity: 0 !important;
                pointer-events: none !important;
                transition: opacity 0.32s ease !important;
                z-index: 1 !important;
            }

            .card__view::after {
                content: '' !important;
                position: absolute !important;
                inset: 0 !important;
                background: linear-gradient(to top, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.28) 48%, transparent 100%) !important;
                border-radius: var(--nfx-radius) !important;
                pointer-events: none !important;
                z-index: 1 !important;
            }

            .card__img {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                transform: scale(1.01) !important;
                transition: transform 0.5s ease !important;
            }

            .card__title {
                position: absolute !important;
                left: 12px !important;
                right: 12px !important;
                bottom: 10px !important;
                z-index: 2 !important;
                color: #fff !important;
                font-size: 14px !important;
                font-weight: 800 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.06em !important;
                line-height: 1.16 !important;
                text-shadow: 0 2px 12px rgba(0, 0, 0, 0.88) !important;
                display: -webkit-box !important;
                -webkit-box-orient: vertical !important;
                -webkit-line-clamp: 2 !important;
                overflow: hidden !important;
            }

            .card.focus .card__view,
            .card.hover .card__view,
            .card:hover .card__view {
                transform: scale(1.12) !important;
                border-color: rgba(var(--nfx-red-rgb), 0.85) !important;
                box-shadow: 0 16px 34px rgba(0, 0, 0, 0.72), 0 0 0 2px rgba(var(--nfx-red-rgb), 0.6) !important;
            }

            .card.focus .card__view::before,
            .card.hover .card__view::before,
            .card:hover .card__view::before {
                opacity: 1 !important;
            }

            .card.focus .card__img,
            .card.hover .card__img,
            .card:hover .card__img {
                transform: scale(1.05) !important;
            }

            .card.focus,
            .card.hover,
            .card:hover {
                z-index: 120 !important;
                transition: z-index 0s 0s !important;
            }

            .card.focus .card__view::after,
            .card.hover .card__view::after {
                box-shadow: 0 0 0 2px rgba(var(--nfx-red-rgb), 0.7), 0 0 24px rgba(var(--nfx-red-rgb), 0.4) !important;
            }

            .card__age,
            .card__vote,
            .card__quality {
                display: none !important;
            }

            /* ===== BLOCK: PANELS / SURFACES ===== */
            .menu,
            .menu__list,
            .head,
            .head__split,
            .settings__content,
            .settings-input__content,
            .selectbox__content,
            .modal__content,
            .full-start,
            .full-start-new {
                background: rgba(15, 15, 15, 0.88) !important;
                backdrop-filter: blur(7px) !important;
            }

            /* ===== BLOCK: FOCUSABLE ELEMENTS ===== */
            .menu__item,
            .settings-folder,
            .settings-param,
            .selectbox-item,
            .full-start__button,
            .full-descr__tag,
            .player-panel .button,
            .simple-button,
            .custom-online-btn,
            .custom-torrent-btn,
            .main2-more-btn,
            .torrent-item,
            .files__item,
            .menu__version {
                border-radius: 10px !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease !important;
            }

            /* ===== BLOCK: LEFT MENU NORMALIZATION ===== */
            .menu {
                min-width: 17.8em !important;
            }

            .menu__list {
                overflow-y: auto !important;
                padding-right: 4px !important;
            }

            .menu__item.nfx-menu-item {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-start !important;
                gap: 0.62em !important;
                min-height: 2.48em !important;
                white-space: nowrap !important;
                padding-left: 0.72em !important;
                padding-right: 0.92em !important;
            }

            .menu__item.nfx-menu-item .nfx-menu-primary-label {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
                width: auto !important;
                max-width: none !important;
                font-size: 1em !important;
                font-weight: 600 !important;
                letter-spacing: 0.02em !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                color: #f3f3f3 !important;
            }

            .menu__item.nfx-menu-item .menu__item-name,
            .menu__item.nfx-menu-item .menu__item-text,
            .menu__item.nfx-menu-item .menu__item-title,
            .menu__item.nfx-menu-item .menu__item-label,
            .menu__item.nfx-menu-item .menu__item-value,
            .menu__item.nfx-menu-item .nfx-menu-secondary {
                display: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
                width: 0 !important;
                max-width: 0 !important;
            }

            .menu__item.nfx-menu-item .menu__item-icon {
                flex: 0 0 auto !important;
            }

            .menu__item.focus,
            .menu__item.hover,
            .menu__item.traverse,
            .settings-folder.focus,
            .settings-param.focus,
            .selectbox-item.focus,
            .full-start__button.focus,
            .full-descr__tag.focus,
            .player-panel .button.focus,
            .simple-button.focus,
            .custom-online-btn.focus,
            .custom-torrent-btn.focus,
            .main2-more-btn.focus,
            .button.focus,
            .menu__version.focus,
            .torrent-item.focus,
            .files__item.focus {
                background: linear-gradient(92deg, rgba(var(--nfx-red-rgb), 0.96), var(--nfx-red-deep)) !important;
                color: #fff !important;
                border-color: rgba(var(--nfx-red-rgb), 0.95) !important;
                box-shadow: 0 0 0 1px rgba(var(--nfx-red-rgb), 0.9), 0 10px 24px rgba(var(--nfx-red-rgb), 0.34) !important;
                transform: translateY(-1px) !important;
            }

            .menu__item.focus .menu__item-icon,
            .menu__item.hover .menu__item-icon {
                color: #fff !important;
            }

            .menu__item.focus .nfx-menu-primary-label {
                color: #fff !important;
            }

            .settings-input__input,
            input[type="text"],
            input[type="password"] {
                background: rgba(26, 26, 26, 0.96) !important;
                border: 1px solid rgba(255, 255, 255, 0.12) !important;
                color: #fff !important;
                border-radius: 9px !important;
            }

            .settings-input__input:focus,
            input[type="text"]:focus,
            input[type="password"]:focus {
                border-color: rgba(var(--nfx-red-rgb), 0.95) !important;
                box-shadow: 0 0 0 2px rgba(var(--nfx-red-rgb), 0.24) !important;
            }

            /* ===== BLOCK: FULL CARD LOGO + SUPPORT TEXT ===== */
            .full-start__title,
            .full-start-new__title {
                min-height: clamp(98px, 15vw, 210px) !important;
                display: flex !important;
                align-items: flex-end !important;
                width: min(94vw, 1100px) !important;
            }

            .nfx-title--with-logo {
                color: transparent !important;
                text-shadow: none !important;
                letter-spacing: normal !important;
                display: block !important;
                width: 100% !important;
            }

            .nfx-full-logo-holder {
                width: min(92vw, 980px) !important;
                max-width: 100% !important;
                min-height: clamp(92px, 12vw, 190px) !important;
                display: inline-flex !important;
                align-items: flex-end !important;
            }

            .nfx-full-logo {
                width: auto !important;
                max-width: 100% !important;
                height: clamp(96px, 14.6vw, 230px) !important;
                max-height: clamp(96px, 14.6vw, 230px) !important;
                object-fit: contain !important;
                filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 16px rgba(var(--nfx-red-rgb), 0.3)) !important;
            }

            .full-start__tagline,
            .full-start-new__tagline,
            .ifx-original-title {
                display: block !important;
                width: fit-content !important;
                max-width: min(88vw, 900px) !important;
                margin-top: 12px !important;
                padding: 10px 14px !important;
                border-left: 2px solid rgba(var(--nfx-red-rgb), 0.64) !important;
                border-radius: 8px !important;
                background: linear-gradient(90deg, rgba(12, 12, 12, 0.82), rgba(12, 12, 12, 0.46)) !important;
                color: rgba(245, 245, 245, 0.78) !important;
                font-size: clamp(15px, 1.2vw, 24px) !important;
                font-weight: 500 !important;
                line-height: 1.34 !important;
                letter-spacing: 0.01em !important;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35) !important;
                backdrop-filter: blur(4px) !important;
            }

            .full-start__head,
            .full-start-new__head {
                opacity: 0.78 !important;
                margin-bottom: 6px !important;
            }

            ::selection {
                background: rgba(var(--nfx-red-rgb), 0.38) !important;
            }

            ::-webkit-scrollbar {
                width: 8px !important;
                height: 8px !important;
            }

            ::-webkit-scrollbar-track {
                background: #111 !important;
            }

            ::-webkit-scrollbar-thumb {
                background: #2c2c2c !important;
                border-radius: 8px !important;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: var(--nfx-red) !important;
            }
        `;

        var style = document.createElement('style');
        style.id = 'netflix_premium_styles';
        style.textContent = css;
        document.head.appendChild(style);

        console.log('[Netflix Premium] v5.1 styles injected');
    }

    /* BLOCK: Reactive setting updates (called from patched Storage.set) */
    function applySetting(key) {
        if (key === 'netflix_premium_enabled') settings.enabled = getBool(key, true);
        if (key === 'netflix_use_backdrops') settings.useBackdrops = getBool(key, true);
        if (key === 'netflix_show_logos') settings.showLogos = getBool(key, true);
        if (key === 'netflix_smooth_scroll') settings.smoothScroll = getBool(key, true);
        if (key === 'netflix_round_corners') settings.roundCorners = getBool(key, true);
        if (key === 'netflix_card_height') settings.cardHeight = Lampa.Storage.get('netflix_card_height', 'medium');

        injectStyles();

        if (!settings.enabled) {
            restoreAllTitles();
            return;
        }

        refreshCards();
        ensureSectionTitlesAboveCards(document);
        ensureMenuSubsectionsVisible(document);
        applyFullCardLogo(lastFullMovie);
    }

    /* 4. UI INIT */
    /* BLOCK: Settings screen component + params */
    function initSettingsUI() {
        if (window.__netflix_settings_ready) return;
        window.__netflix_settings_ready = true;

        var component = 'netflix_premium';

        Lampa.SettingsApi.addComponent({
            component: component,
            name: Lampa.Lang.translate('netflix_premium_title'),
            icon: '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M363.3 48h-60v340l-140-340h-76v416h60v-340l140 340h76v-416z"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: component,
            param: { name: 'netflix_premium_enabled', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('netflix_enable') }
        });

        Lampa.SettingsApi.addParam({
            component: component,
            param: { name: 'netflix_use_backdrops', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('netflix_use_backdrops') }
        });

        Lampa.SettingsApi.addParam({
            component: component,
            param: { name: 'netflix_show_logos', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('netflix_show_logos') }
        });

        Lampa.SettingsApi.addParam({
            component: component,
            param: { name: 'netflix_smooth_scroll', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('netflix_smooth_scroll') }
        });

        Lampa.SettingsApi.addParam({
            component: component,
            param: { name: 'netflix_round_corners', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('netflix_round_corners') }
        });

        Lampa.SettingsApi.addParam({
            component: component,
            param: {
                name: 'netflix_card_height',
                type: 'select',
                values: {
                    small: 'Small (170px)',
                    medium: 'Medium (220px)',
                    large: 'Large (272px)',
                    xlarge: 'True 4K (340px)'
                },
                default: 'medium'
            },
            field: { name: Lampa.Lang.translate('netflix_card_height') }
        });
    }

    /* BLOCK: Patch Lampa.Storage.set for instant live apply */
    function patchStorage() {
        if (window.__netflix_storage_patched) return;
        window.__netflix_storage_patched = true;

        var originalSet = Lampa.Storage.set;
        Lampa.Storage.set = function (key, val) {
            var result = originalSet.apply(this, arguments);
            if (key.indexOf('netflix_') === 0) applySetting(key, val);
            return result;
        };
    }

    /* BLOCK: Plugin startup sequence */
    function init() {
        if (window.netflix_premium_initialized) return;
        window.netflix_premium_initialized = true;

        initSettingsUI();
        patchStorage();
        injectStyles();
        startObserver();
        bindFullListener();
        refreshCards();
        ensureSectionTitlesAboveCards(document);
        ensureMenuSubsectionsVisible(document);

        if (Lampa.Plugin) {
            /* Реєстрація плагіна в списку Extensions */
            Lampa.Plugin.display({
                name: 'Netflix Premium Style',
                version: '5.1.0',
                description: 'Cinematic red UI + smooth scroll + logo titles',
                type: 'style',
                author: 'Lampac Agent',
                onstart: init
            });
        }

        console.log('[Netflix Premium] v5.1 ready');
    }

    /* BLOCK: Safe boot (відкладений старт, якщо Lampa ще не ініціалізована) */
    if (window.Lampa) init();
    else {
        var timer = setInterval(function () {
            if (typeof Lampa !== 'undefined') {
                clearInterval(timer);
                init();
            }
        }, 200);
    }
})();
