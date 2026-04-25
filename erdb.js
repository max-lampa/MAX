/*!
 * ERDB Posters for Lampa
 * Подмена постеров/фонов/логотипов на изображения с рейтингами от Easy Ratings Database
 * https://easyratingsdb.com
 *
 * Установка в Lampa:
 *   Настройки -> Расширения -> Добавить плагин
 *   URL: <адрес где размещён этот файл>/erdb.js
 *
 * Затем: Настройки -> ERDB Постеры -> вставьте свой токен Tk-... из конфигуратора ERDB
 */
(function () {
    'use strict';

    if (window.erdb_plugin_ready) return;
    window.erdb_plugin_ready = true;

    var PLUGIN_ID = 'erdb_posters';
    var DEFAULT_BASE = 'https://easyratingsdb.com';
    var DEFAULTS = {
        token: '',
        base: DEFAULT_BASE,
        enable_poster: true,
        enable_backdrop: true,
        enable_logo: false,
        enable_thumbnail: true,
        enable_quality: true,
        cache_buster: '',
        profiles: [],
        active_profile: ''
    };

    /* ------------------------- утилиты ------------------------- */

    function get(key) {
        var v = Lampa.Storage.get('erdb_' + key, '__none__');
        if (v === '__none__') return DEFAULTS[key];
        return v;
    }

    function set(key, value) {
        Lampa.Storage.set('erdb_' + key, value);
    }

    function normBase(base) {
        if (!base) base = DEFAULT_BASE;
        return String(base).replace(/\/+$/, '');
    }

    function tokenOk(t) {
        return typeof t === 'string' && /^Tk-/.test(t);
    }

    /* ------------------------- профили ------------------------- */

    function uid() {
        return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    }

    function getProfiles() {
        var p = get('profiles');
        if (!Array.isArray(p)) p = [];
        return p;
    }

    function saveProfiles(list) {
        set('profiles', list || []);
    }

    function migrateLegacy() {
        // Если есть старый одиночный токен и нет профилей — создаём профиль "Основной"
        var list = getProfiles();
        var legacyToken = Lampa.Storage.get('erdb_token', '');
        if (!list.length && tokenOk(legacyToken)) {
            list = [{
                id: uid(),
                name: 'Основной',
                token: String(legacyToken).trim(),
                base: normBase(Lampa.Storage.get('erdb_base', DEFAULT_BASE))
            }];
            saveProfiles(list);
            set('active_profile', list[0].id);
        }
        return list;
    }

    function getActiveProfile() {
        var list = getProfiles();
        if (!list.length) return null;
        var id = get('active_profile');
        var found = id ? list.filter(function (p) { return p.id === id; })[0] : null;
        return found || list[0];
    }

    function setActiveProfile(id) {
        set('active_profile', id);
        // Сброс кеша картинок чтобы Lampa перезапросила с новым токеном
        set('cache_buster', String(Date.now()));
    }

    function activeToken() {
        var p = getActiveProfile();
        if (p && tokenOk(p.token)) return p.token;
        var legacy = Lampa.Storage.get('erdb_token', '');
        return tokenOk(legacy) ? legacy : '';
    }

    function activeBase() {
        var p = getActiveProfile();
        if (p && p.base) return normBase(p.base);
        return normBase(Lampa.Storage.get('erdb_base', DEFAULT_BASE));
    }

    function addProfile(name, token, base) {
        var list = getProfiles();
        var prof = {
            id: uid(),
            name: String(name || 'Профиль ' + (list.length + 1)).trim(),
            token: String(token || '').trim(),
            base: normBase(base || DEFAULT_BASE)
        };
        list.push(prof);
        saveProfiles(list);
        if (!getActiveProfile() || list.length === 1) setActiveProfile(prof.id);
        return prof;
    }

    function updateProfile(id, patch) {
        var list = getProfiles();
        var i = -1;
        list.forEach(function (p, idx) { if (p.id === id) i = idx; });
        if (i < 0) return null;
        if (patch.name !== undefined) list[i].name = String(patch.name).trim() || list[i].name;
        if (patch.token !== undefined) list[i].token = String(patch.token).trim();
        if (patch.base !== undefined) list[i].base = normBase(patch.base);
        saveProfiles(list);
        if (get('active_profile') === id) set('cache_buster', String(Date.now()));
        return list[i];
    }

    function removeProfile(id) {
        var list = getProfiles().filter(function (p) { return p.id !== id; });
        saveProfiles(list);
        if (get('active_profile') === id) {
            set('active_profile', list[0] ? list[0].id : '');
            set('cache_buster', String(Date.now()));
        }
    }

    function buildUrl(type, id) {
        var token = activeToken();
        if (!tokenOk(token) || !type || !id) return null;
        var url = activeBase() + '/' + token + '/' + type + '/' + id + '.jpg';
        var cb = get('cache_buster');
        if (cb) url += '?v=' + encodeURIComponent(cb);
        return url;
    }

    function makeId(card, opts) {
        if (!card) return null;
        opts = opts || {};

        if (opts.episode && card.imdb_id && opts.season != null && opts.episode != null) {
            return card.imdb_id + ':' + opts.season + ':' + opts.episode;
        }

        if (card.imdb_id && /^tt\d+/.test(card.imdb_id)) {
            return card.imdb_id;
        }

        if (card.id) {
            var mt = card.media_type || (card.name && !card.title ? 'tv' : 'movie');
            if (mt === 'tv' || mt === 'series') return 'tmdb:tv:' + card.id;
            return 'tmdb:movie:' + card.id;
        }
        return null;
    }

    /* ----------------------- бейджи качества ----------------------- */

    var QUALITY_PATTERNS = [
        { key: '4k', label: '4K', test: /\b(4k|2160p|uhd)\b/i, cls: 'erdb-q-4k' },
        { key: 'hdr', label: 'HDR', test: /\b(hdr10\+?|hdr)\b/i, cls: 'erdb-q-hdr' },
        { key: 'dv', label: 'DV', test: /\b(dolby[\s_-]?vision|dovi|dv)\b/i, cls: 'erdb-q-dv' },
        { key: 'atmos', label: 'ATMOS', test: /\b(atmos)\b/i, cls: 'erdb-q-atmos' },
        { key: 'remux', label: 'REMUX', test: /\b(remux)\b/i, cls: 'erdb-q-remux' },
        { key: 'bluray', label: 'BluRay', test: /\b(bluray|bdrip|bdremux)\b/i, cls: 'erdb-q-blu' },
        { key: 'webdl', label: 'WEB-DL', test: /\b(web[-_]?dl|webrip)\b/i, cls: 'erdb-q-web' },
        { key: '1080p', label: '1080p', test: /\b(1080p|fullhd|fhd)\b/i, cls: 'erdb-q-1080' }
    ];

    function detectQuality(card) {
        if (!card) return [];
        var src = [];
        var fields = ['quality', 'releaseQuality', 'release_quality', 'release', 'torrent_title', 'file', 'name', 'title', 'original_title', 'original_name'];
        fields.forEach(function (f) {
            if (card[f]) src.push(String(card[f]));
        });
        if (card.cub && card.cub.quality) src.push(String(card.cub.quality));
        var text = src.join(' | ');
        if (!text) return [];

        var found = [];
        var seen = {};
        QUALITY_PATTERNS.forEach(function (p) {
            if (p.test.test(text) && !seen[p.key]) {
                // не дублируем 1080p если есть 4K
                seen[p.key] = true;
                found.push(p);
            }
        });
        // если есть 4K — выкинем 1080p
        if (seen['4k']) found = found.filter(function (p) { return p.key !== '1080p'; });
        return found;
    }

    function renderQualityOverlay(cardEl, card) {
        if (!get('enable_quality')) return;
        if (!cardEl) return;
        var badges = detectQuality(card);
        if (!badges.length) return;

        var view = cardEl.querySelector ? cardEl.querySelector('.card__view') : null;
        if (!view) view = cardEl;
        if (!view) return;

        // удалим прежний оверлей
        var prev = view.querySelector('.erdb-quality');
        if (prev) prev.parentNode.removeChild(prev);

        var wrap = document.createElement('div');
        wrap.className = 'erdb-quality';
        badges.slice(0, 5).forEach(function (b) {
            var chip = document.createElement('span');
            chip.className = 'erdb-quality__chip ' + b.cls;
            chip.textContent = b.label;
            wrap.appendChild(chip);
        });
        view.appendChild(wrap);
    }

    function injectQualityCss() {
        if (document.getElementById('erdb-style')) return;
        var s = document.createElement('style');
        s.id = 'erdb-style';
        s.textContent = [
            '.erdb-quality{position:absolute;left:6px;right:6px;bottom:6px;display:flex;flex-wrap:wrap;gap:4px;justify-content:center;pointer-events:none;z-index:5}',
            '.erdb-quality__chip{font-size:0.7em;line-height:1;padding:4px 6px;border-radius:6px;color:#fff;font-weight:700;letter-spacing:0.4px;background:rgba(0,0,0,0.7);text-shadow:0 1px 2px rgba(0,0,0,0.6);box-shadow:0 1px 4px rgba(0,0,0,0.4)}',
            '.erdb-q-4k{background:linear-gradient(135deg,#f59e0b,#b45309)}',
            '.erdb-q-hdr{background:linear-gradient(135deg,#0ea5e9,#0369a1)}',
            '.erdb-q-dv{background:linear-gradient(135deg,#7c3aed,#4c1d95)}',
            '.erdb-q-atmos{background:linear-gradient(135deg,#0f766e,#134e4a)}',
            '.erdb-q-remux{background:linear-gradient(135deg,#dc2626,#7f1d1d)}',
            '.erdb-q-blu{background:linear-gradient(135deg,#1d4ed8,#1e3a8a)}',
            '.erdb-q-web{background:linear-gradient(135deg,#475569,#1f2937)}',
            '.erdb-q-1080{background:linear-gradient(135deg,#16a34a,#14532d)}',
            '.card__view{position:relative}'
        ].join('\n');
        document.head.appendChild(s);
    }

    /* ----------------------- замена постеров карточек ----------------------- */

    function replaceCardImage(cardEl, card) {
        if (!cardEl || !card) return;
        if (!get('enable_poster')) {
            renderQualityOverlay(cardEl, card);
            return;
        }

        var id = makeId(card);
        var url = buildUrl('poster', id);
        if (url) {
            var img = cardEl.querySelector ? cardEl.querySelector('.card__img') : null;
            if (img) {
                var fallback = img.getAttribute('src') || card.poster_path || card.img;
                img.onerror = function () {
                    img.onerror = null;
                    if (fallback) img.src = fallback;
                };
                img.src = url;
                if (card) card.img = url;
            }
        }
        renderQualityOverlay(cardEl, card);
    }

    /* ----------------------- замена изображений в "full" ----------------------- */

    function patchFull(data) {
        var card = data && (data.movie || data.card || data.data);
        if (!card) return;

        var rootEl = data.object && data.object.activity && data.object.activity.render
            ? data.object.activity.render()
            : null;

        if (get('enable_poster')) {
            var posterUrl = buildUrl('poster', makeId(card));
            if (posterUrl) {
                card.img = posterUrl;
                if (card.poster_path !== undefined) card.poster_path = posterUrl;
                if (rootEl) {
                    var posters = rootEl.find ? rootEl.find('.full-start__poster img, .full-start-new__poster img, .full-start__poster, .full-start-new__poster') : [];
                    posters.each(function () {
                        var $el = Lampa.$(this);
                        if (this.tagName === 'IMG') this.src = posterUrl;
                        else $el.css('background-image', 'url("' + posterUrl + '")');
                    });
                }
            }
        }

        if (get('enable_backdrop')) {
            var backdropUrl = buildUrl('backdrop', makeId(card));
            if (backdropUrl) {
                card.background_image = backdropUrl;
                if (card.backdrop_path !== undefined) card.backdrop_path = backdropUrl;
                if (rootEl) {
                    var bg = rootEl.find ? rootEl.find('.full-start__background, .full-start-new__background') : [];
                    bg.each(function () {
                        Lampa.$(this).css('background-image', 'url("' + backdropUrl + '")');
                    });
                }
                try { Lampa.Background.change(backdropUrl); } catch (e) {}
            }
        }
    }

    /* ----------------------- эпизоды (thumbnail) ----------------------- */

    function patchEpisodes(data) {
        if (!get('enable_thumbnail')) return;
        var card = data && (data.card || data.movie);
        if (!card || !card.imdb_id) return;
        try {
            var html = data.html || (data.object && data.object.html);
            if (!html || !html.find) return;
            html.find('.episode').each(function () {
                var $ep = Lampa.$(this);
                var s = parseInt($ep.attr('data-season') || $ep.find('[data-season]').attr('data-season'));
                var e = parseInt($ep.attr('data-episode') || $ep.find('[data-episode]').attr('data-episode'));
                if (!s || !e) return;
                var url = buildUrl('thumbnail', makeId(card, { episode: e, season: s }));
                if (!url) return;
                var img = $ep.find('.episode__img img, .full-episode__img img, img')[0];
                if (img) {
                    var fb = img.src;
                    img.onerror = function () { img.onerror = null; if (fb) img.src = fb; };
                    img.src = url;
                }
            });
        } catch (err) { /* silent */ }
    }

    /* ----------------------- проверка токена ----------------------- */

    function testToken() {
        var token = activeToken();
        if (!tokenOk(token)) {
            Lampa.Noty && Lampa.Noty.show('ERDB: токен активного профиля не задан или неверного формата (должен начинаться с Tk-)');
            return;
        }
        var url = buildUrl('poster', 'tt0133093'); // The Matrix
        if (!url) return;
        var prof = getActiveProfile();
        Lampa.Noty && Lampa.Noty.show('ERDB: проверяю профиль «' + (prof ? prof.name : '—') + '»…');
        var img = new Image();
        img.onload = function () {
            Lampa.Noty && Lampa.Noty.show('ERDB: токен работает ✓ (' + img.naturalWidth + '×' + img.naturalHeight + ')');
        };
        img.onerror = function () {
            Lampa.Noty && Lampa.Noty.show('ERDB: ошибка — токен не принят сервером');
        };
        img.src = url;
    }

    function clearImageCache() {
        set('cache_buster', String(Date.now()));
        Lampa.Noty && Lampa.Noty.show('ERDB: кеш изображений сброшен');
    }

    function openConfigurator() {
        var url = activeBase() + '/configurator';
        try {
            if (window.Lampa && Lampa.Modal) {
                Lampa.Modal.open({
                    title: 'ERDB конфигуратор',
                    html: Lampa.$('<div style="padding:1.5em;text-align:center;font-size:1.1em">Откройте в браузере:<br><br><b style="word-break:break-all">' + url + '</b><br><br>Залогиньтесь, настройте бейджи качества (Stream Badges) и провайдеры рейтингов, скопируйте Tk-... токен и вставьте его в настройки плагина.</div>'),
                    size: 'medium',
                    onBack: function () { Lampa.Modal.close(); Lampa.Controller.toggle('settings_component'); }
                });
            } else {
                window.open(url, '_blank');
            }
        } catch (e) { window.open(url, '_blank'); }
    }

    /* ----------------------- регистрация настроек ----------------------- */

    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: PLUGIN_ID,
            name: 'ERDB Постеры',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2"/></svg>'
        });

        // Управление профилями
        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'erdb_profiles_btn', type: 'button' },
            field: {
                name: 'Профили токенов',
                description: 'Несколько Tk-токенов с разным оформлением — быстро переключайтесь между ними'
            },
            onChange: function () { openProfilesManager(); },
            onRender: function (item) {
                setTimeout(function () {
                    var prof = getActiveProfile();
                    var total = getProfiles().length;
                    var label = total ? (total + ' шт., активный: ' + (prof ? prof.name : '—')) : 'нет профилей';
                    item.find('.settings-param__value').text(label);
                }, 0);
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'erdb_switch_btn', type: 'button' },
            field: {
                name: 'Переключить профиль',
                description: 'Быстрый выбор активного профиля из списка'
            },
            onChange: function () { openProfileSwitcher(); },
            onRender: function (item) {
                setTimeout(function () {
                    var prof = getActiveProfile();
                    item.find('.settings-param__value').text(prof ? prof.name : '—');
                }, 0);
            }
        });

        // действия
        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'erdb_test', type: 'button' },
            field: { name: 'Проверить активный токен', description: 'Запросит тестовый постер у активного профиля' },
            onChange: testToken
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'erdb_open', type: 'button' },
            field: { name: 'Открыть конфигуратор ERDB', description: 'Где включаются бейджи качества и провайдеры рейтингов' },
            onChange: openConfigurator
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'erdb_clear', type: 'button' },
            field: { name: 'Сбросить кеш изображений', description: 'Заставит Lampa перезапросить картинки у ERDB' },
            onChange: clearImageCache
        });

        // переключатели типов изображений
        var toggles = [
            { key: 'enable_poster', label: 'Постеры с рейтингами', desc: 'Заменять обложки фильмов и сериалов на ERDB-постеры' },
            { key: 'enable_backdrop', label: 'Фоны (backdrop)', desc: 'Заменять фоновые изображения карточки' },
            { key: 'enable_thumbnail', label: 'Превью эпизодов', desc: 'Заменять кадры эпизодов сериалов' },
            { key: 'enable_logo', label: 'Логотипы тайтлов', desc: 'Подменять стилизованный логотип фильма/сериала' }
        ];
        toggles.forEach(function (t) {
            Lampa.SettingsApi.addParam({
                component: PLUGIN_ID,
                param: { name: 'erdb_' + t.key, type: 'trigger', 'default': DEFAULTS[t.key] },
                field: { name: t.label, description: t.desc },
                onChange: function (value) { set(t.key, value); }
            });
        });

        // бейджи качества — клиентский оверлей
        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'erdb_enable_quality', type: 'trigger', 'default': DEFAULTS.enable_quality },
            field: {
                name: 'Бейджи качества на карточках',
                description: '4K / HDR / DV / Atmos / REMUX поверх постеров — определяются по данным карточки в Lampa. Бейджи на ERDB-картинках включаются на самом сайте в конфигураторе.'
            },
            onChange: function (value) { set('enable_quality', value); }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_ID,
            param: { name: 'erdb_about', type: 'static' },
            field: {
                name: 'О плагине',
                description: 'ERDB v1.1 — постеры с рейтингами + клиентские бейджи качества. Получите токен на easyratingsdb.com.'
            }
        });
    }

    /* ----------------------- пункт меню на главном экране ----------------------- */

    function buildMenuItem() {
        var html = Lampa.$([
            '<li class="menu__item selector" data-action="erdb">',
                '<div class="menu__ico">',
                    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
                        '<polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2"/>',
                    '</svg>',
                '</div>',
                '<div class="menu__text">ERDB</div>',
            '</li>'
        ].join(''));

        html.on('hover:enter', function () {
            openMenuPanel();
        });

        return html;
    }

    function attachMenuItem() {
        try {
            var $menu = Lampa.$('.menu .menu__list').eq(0);
            if (!$menu.length) return false;
            if ($menu.find('[data-action="erdb"]').length) return true;
            $menu.append(buildMenuItem());
            return true;
        } catch (e) { return false; }
    }

    function ensureMenuItem() {
        if (attachMenuItem()) return;
        // ждём готовности меню
        var tries = 0;
        var iv = setInterval(function () {
            tries++;
            if (attachMenuItem() || tries > 40) clearInterval(iv);
        }, 250);
    }

    /* ----------------------- панель управления ERDB ----------------------- */

    function rowHtml(label, value, action) {
        return '<div class="erdb-row selector" data-act="' + action + '">' +
            '<div class="erdb-row__lbl">' + label + '</div>' +
            '<div class="erdb-row__val">' + value + '</div>' +
        '</div>';
    }

    function panelStateHtml() {
        var token = activeToken();
        var tokenView = tokenOk(token) ? '••••' + String(token).slice(-4) : 'не задан';
        var on = function (k) { return get(k) ? 'ВКЛ' : 'выкл'; };
        var prof = getActiveProfile();
        var profiles = getProfiles();

        var profilesRow = '';
        if (profiles.length > 1) {
            var chips = profiles.map(function (p) {
                var cls = 'erdb-prof-chip selector' + (prof && p.id === prof.id ? ' is-active' : '');
                return '<div class="' + cls + '" data-act="switch:' + p.id + '">' + escapeHtml(p.name) + '</div>';
            }).join('');
            profilesRow = '<div class="erdb-panel__profiles">' + chips + '</div>';
        }

        return [
            '<div class="erdb-panel">',
                '<div class="erdb-panel__head">',
                    '<div class="erdb-panel__title">ERDB Постеры</div>',
                    '<div class="erdb-panel__sub">Профиль: <b>' + (prof ? escapeHtml(prof.name) : '—') + '</b> &nbsp;·&nbsp; Токен: <b>' + tokenView + '</b> &nbsp;·&nbsp; Сервер: ' + escapeHtml(activeBase()) + '</div>',
                '</div>',
                profilesRow,
                '<div class="erdb-panel__grid">',
                    rowHtml('Постеры', on('enable_poster'), 'toggle_poster'),
                    rowHtml('Фоны', on('enable_backdrop'), 'toggle_backdrop'),
                    rowHtml('Превью эпизодов', on('enable_thumbnail'), 'toggle_thumbnail'),
                    rowHtml('Логотипы', on('enable_logo'), 'toggle_logo'),
                    rowHtml('Бейджи качества', on('enable_quality'), 'toggle_quality'),
                '</div>',
                '<div class="erdb-panel__actions">',
                    '<div class="erdb-btn selector" data-act="profiles">Профили</div>',
                    '<div class="erdb-btn selector" data-act="test">Проверить токен</div>',
                    '<div class="erdb-btn selector" data-act="clear">Сбросить кеш</div>',
                    '<div class="erdb-btn selector" data-act="settings">Настройки</div>',
                    '<div class="erdb-btn selector" data-act="site">Конфигуратор ERDB</div>',
                '</div>',
                '<div class="erdb-panel__hint">Бейджи качества на самих картинках включаются на сайте ERDB в разделе Stream Badges. Несколько профилей — для разных оформлений (минимализм / насыщенный / только рейтинги и т.п.).</div>',
            '</div>'
        ].join('');
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function injectPanelCss() {
        if (document.getElementById('erdb-panel-style')) return;
        var s = document.createElement('style');
        s.id = 'erdb-panel-style';
        s.textContent = [
            '.erdb-panel{padding:1.5em;color:#fff;font-family:inherit}',
            '.erdb-panel__head{margin-bottom:1.2em}',
            '.erdb-panel__title{font-size:1.6em;font-weight:700;margin-bottom:0.3em}',
            '.erdb-panel__sub{opacity:0.7;font-size:0.95em}',
            '.erdb-panel__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.6em;margin-bottom:1.2em}',
            '.erdb-row{display:flex;justify-content:space-between;align-items:center;padding:0.9em 1em;background:rgba(255,255,255,0.06);border-radius:0.6em;border:2px solid transparent;cursor:pointer}',
            '.erdb-row.focus,.erdb-row.hover{border-color:#f59e0b;background:rgba(245,158,11,0.18)}',
            '.erdb-row__lbl{font-weight:600}',
            '.erdb-row__val{font-size:0.85em;letter-spacing:1px;opacity:0.85;text-transform:uppercase}',
            '.erdb-panel__actions{display:flex;flex-wrap:wrap;gap:0.6em;margin-bottom:1em}',
            '.erdb-btn{padding:0.9em 1.3em;background:linear-gradient(135deg,#f59e0b,#b45309);color:#fff;border-radius:0.6em;font-weight:700;cursor:pointer;border:2px solid transparent}',
            '.erdb-btn.focus,.erdb-btn.hover{border-color:#fff;transform:translateY(-2px)}',
            '.erdb-panel__hint{opacity:0.55;font-size:0.85em;margin-top:0.5em;line-height:1.4}',
            '.erdb-panel__profiles{display:flex;flex-wrap:wrap;gap:0.5em;margin-bottom:1em}',
            '.erdb-prof-chip{padding:0.6em 1em;border-radius:1.5em;background:rgba(255,255,255,0.06);border:2px solid transparent;font-weight:600;cursor:pointer;font-size:0.9em}',
            '.erdb-prof-chip.is-active{background:linear-gradient(135deg,#f59e0b,#b45309);color:#fff}',
            '.erdb-prof-chip.focus,.erdb-prof-chip.hover{border-color:#fff}',
            '.erdb-mgr{padding:1.5em;color:#fff}',
            '.erdb-mgr__title{font-size:1.4em;font-weight:700;margin-bottom:1em}',
            '.erdb-mgr__list{display:flex;flex-direction:column;gap:0.6em;margin-bottom:1em}',
            '.erdb-mgr__item{display:flex;justify-content:space-between;align-items:center;padding:1em;background:rgba(255,255,255,0.06);border-radius:0.6em;border:2px solid transparent;cursor:pointer}',
            '.erdb-mgr__item.focus,.erdb-mgr__item.hover{border-color:#f59e0b}',
            '.erdb-mgr__item.is-active{background:rgba(245,158,11,0.2)}',
            '.erdb-mgr__name{font-weight:700;font-size:1.05em}',
            '.erdb-mgr__meta{opacity:0.65;font-size:0.85em;margin-top:0.2em}',
            '.erdb-mgr__btns{display:flex;gap:0.4em}',
            '.erdb-mgr__btn{padding:0.5em 0.9em;background:rgba(255,255,255,0.08);border-radius:0.5em;font-size:0.85em;border:2px solid transparent;cursor:pointer}',
            '.erdb-mgr__btn.focus,.erdb-mgr__btn.hover{border-color:#fff}',
            '.erdb-mgr__btn.is-danger{background:rgba(220,38,38,0.25)}',
            '.erdb-mgr__add{margin-top:0.5em;padding:1em;background:linear-gradient(135deg,#0ea5e9,#0369a1);border-radius:0.6em;text-align:center;font-weight:700;cursor:pointer;border:2px solid transparent}',
            '.erdb-mgr__add.focus,.erdb-mgr__add.hover{border-color:#fff}',
            '.erdb-mgr__empty{padding:2em;text-align:center;opacity:0.6;font-style:italic}'
        ].join('\n');
        document.head.appendChild(s);
    }

    function openMenuPanel() {
        injectPanelCss();
        var $html = Lampa.$('<div>' + panelStateHtml() + '</div>');

        function refresh() {
            $html.html(panelStateHtml());
            bindPanelActions($html);
        }

        function bindPanelActions(root) {
            root.find('[data-act]').each(function () {
                var $el = Lampa.$(this);
                var act = $el.attr('data-act');
                $el.on('hover:enter', function () {
                    handleAction(act, refresh);
                });
            });
        }

        bindPanelActions($html);

        Lampa.Modal.open({
            title: '',
            html: $html,
            size: 'large',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('menu');
            }
        });
    }

    function handleAction(act, refresh) {
        if (act === 'toggle_poster') { set('enable_poster', !get('enable_poster')); refresh(); return; }
        if (act === 'toggle_backdrop') { set('enable_backdrop', !get('enable_backdrop')); refresh(); return; }
        if (act === 'toggle_thumbnail') { set('enable_thumbnail', !get('enable_thumbnail')); refresh(); return; }
        if (act === 'toggle_logo') { set('enable_logo', !get('enable_logo')); refresh(); return; }
        if (act === 'toggle_quality') { set('enable_quality', !get('enable_quality')); refresh(); return; }
        if (act === 'test') { testToken(); return; }
        if (act === 'clear') { clearImageCache(); refresh(); return; }
        if (act === 'site') { openConfigurator(); return; }
        if (act === 'profiles') { Lampa.Modal.close(); openProfilesManager(); return; }
        if (act && act.indexOf('switch:') === 0) {
            var id = act.split(':')[1];
            setActiveProfile(id);
            var p = getActiveProfile();
            Lampa.Noty && Lampa.Noty.show('ERDB: активен профиль «' + (p ? p.name : '—') + '»');
            refresh();
            return;
        }
        if (act === 'settings') {
            Lampa.Modal.close();
            Lampa.Settings.show({ category: PLUGIN_ID });
            return;
        }
    }

    /* ----------------------- быстрый переключатель профиля ----------------------- */

    function openProfileSwitcher() {
        var list = getProfiles();
        if (!list.length) {
            Lampa.Noty && Lampa.Noty.show('ERDB: нет ни одного профиля. Откройте «Профили токенов».');
            return;
        }
        var active = getActiveProfile();
        var items = list.map(function (p) {
            return {
                title: (active && p.id === active.id ? '● ' : '○ ') + p.name,
                subtitle: tokenOk(p.token) ? '••••' + p.token.slice(-4) + '  ·  ' + p.base : 'токен не задан',
                profile: p
            };
        });
        Lampa.Select.show({
            title: 'Активный профиль ERDB',
            items: items,
            onBack: function () { Lampa.Controller.toggle('settings_component'); },
            onSelect: function (item) {
                setActiveProfile(item.profile.id);
                Lampa.Noty && Lampa.Noty.show('ERDB: активен профиль «' + item.profile.name + '»');
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    /* ----------------------- менеджер профилей ----------------------- */

    function profileItemHtml(p, active) {
        var isActive = active && p.id === active.id;
        var tokenView = tokenOk(p.token) ? '••••' + p.token.slice(-4) : 'токен не задан';
        return [
            '<div class="erdb-mgr__item' + (isActive ? ' is-active' : '') + '">',
                '<div>',
                    '<div class="erdb-mgr__name">' + (isActive ? '● ' : '○ ') + escapeHtml(p.name) + '</div>',
                    '<div class="erdb-mgr__meta">' + tokenView + ' &nbsp;·&nbsp; ' + escapeHtml(p.base) + '</div>',
                '</div>',
                '<div class="erdb-mgr__btns">',
                    (isActive ? '' : '<div class="erdb-mgr__btn selector" data-pact="activate" data-pid="' + p.id + '">Активировать</div>'),
                    '<div class="erdb-mgr__btn selector" data-pact="rename" data-pid="' + p.id + '">Имя</div>',
                    '<div class="erdb-mgr__btn selector" data-pact="token" data-pid="' + p.id + '">Токен</div>',
                    '<div class="erdb-mgr__btn selector" data-pact="base" data-pid="' + p.id + '">Сервер</div>',
                    '<div class="erdb-mgr__btn is-danger selector" data-pact="delete" data-pid="' + p.id + '">Удалить</div>',
                '</div>',
            '</div>'
        ].join('');
    }

    function profileManagerHtml() {
        var list = getProfiles();
        var active = getActiveProfile();
        var body;
        if (!list.length) {
            body = '<div class="erdb-mgr__empty">Профилей пока нет. Создайте первый ниже.</div>';
        } else {
            body = '<div class="erdb-mgr__list">' + list.map(function (p) { return profileItemHtml(p, active); }).join('') + '</div>';
        }
        return [
            '<div class="erdb-mgr">',
                '<div class="erdb-mgr__title">Профили ERDB</div>',
                body,
                '<div class="erdb-mgr__add selector" data-pact="add">+ Добавить профиль</div>',
            '</div>'
        ].join('');
    }

    function promptInput(title, value, onDone) {
        var keyboard = new Lampa.Input(title, String(value || ''), function (val) {
            onDone(val);
        });
        keyboard.create && keyboard.create();
    }

    function openProfilesManager() {
        injectPanelCss();
        var $html = Lampa.$('<div>' + profileManagerHtml() + '</div>');

        function refresh() {
            $html.html(profileManagerHtml());
            bindMgrActions($html);
        }

        function bindMgrActions(root) {
            root.find('[data-pact]').each(function () {
                var $el = Lampa.$(this);
                var act = $el.attr('data-pact');
                var pid = $el.attr('data-pid');
                $el.on('hover:enter', function () { handleProfileAction(act, pid, refresh); });
            });
        }

        bindMgrActions($html);

        Lampa.Modal.open({
            title: '',
            html: $html,
            size: 'large',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('menu');
            }
        });
    }

    function handleProfileAction(act, pid, refresh) {
        if (act === 'add') {
            promptInput('Имя нового профиля', 'Профиль ' + (getProfiles().length + 1), function (name) {
                if (!name) return refresh();
                promptInput('Tk-... токен', '', function (token) {
                    if (!token) {
                        addProfile(name, '', DEFAULT_BASE);
                        Lampa.Noty && Lampa.Noty.show('ERDB: профиль создан без токена — добавьте его позже');
                        refresh();
                        return;
                    }
                    if (!tokenOk(token)) {
                        Lampa.Noty && Lampa.Noty.show('ERDB: токен должен начинаться с Tk-');
                        return refresh();
                    }
                    addProfile(name, token, DEFAULT_BASE);
                    Lampa.Noty && Lampa.Noty.show('ERDB: профиль «' + name + '» добавлен и активирован');
                    refresh();
                });
            });
            return;
        }
        if (!pid) return;
        if (act === 'activate') {
            setActiveProfile(pid);
            var p = getActiveProfile();
            Lampa.Noty && Lampa.Noty.show('ERDB: активен профиль «' + (p ? p.name : '—') + '»');
            refresh();
            return;
        }
        if (act === 'rename') {
            var prof = getProfiles().filter(function (p) { return p.id === pid; })[0];
            if (!prof) return;
            promptInput('Новое имя', prof.name, function (name) {
                if (name) updateProfile(pid, { name: name });
                refresh();
            });
            return;
        }
        if (act === 'token') {
            var prof2 = getProfiles().filter(function (p) { return p.id === pid; })[0];
            if (!prof2) return;
            promptInput('Tk-... токен', prof2.token || '', function (val) {
                if (val && !tokenOk(val)) {
                    Lampa.Noty && Lampa.Noty.show('ERDB: токен должен начинаться с Tk-');
                    return refresh();
                }
                updateProfile(pid, { token: val });
                refresh();
            });
            return;
        }
        if (act === 'base') {
            var prof3 = getProfiles().filter(function (p) { return p.id === pid; })[0];
            if (!prof3) return;
            promptInput('Адрес сервера ERDB', prof3.base || DEFAULT_BASE, function (val) {
                updateProfile(pid, { base: val || DEFAULT_BASE });
                refresh();
            });
            return;
        }
        if (act === 'delete') {
            Lampa.Select.show({
                title: 'Удалить профиль?',
                items: [
                    { title: 'Да, удалить', val: 'yes' },
                    { title: 'Отмена', val: 'no' }
                ],
                onBack: function () { refresh(); },
                onSelect: function (item) {
                    if (item.val === 'yes') {
                        removeProfile(pid);
                        Lampa.Noty && Lampa.Noty.show('ERDB: профиль удалён');
                    }
                    refresh();
                }
            });
            return;
        }
    }

    /* ----------------------- подписки на события Lampa ----------------------- */

    function bind() {
        Lampa.Listener.follow('card', function (e) {
            if (e.type !== 'build') return;
            try {
                var data = e.object && (e.object.data || e.data) || e.data;
                var node = null;
                if (e.object && e.object.card) node = e.object.card[0] || e.object.card;
                if (!node && e.object && e.object.card_render) node = e.object.card_render();
                if (node && data) replaceCardImage(node, data);
            } catch (err) { /* silent */ }
        });

        Lampa.Listener.follow('full', function (e) {
            if (!tokenOk(activeToken())) return;
            if (e.type === 'complite' || e.type === 'build') {
                try { patchFull(e.data || e); } catch (err) { /* silent */ }
            }
        });

        Lampa.Listener.follow('full_episode', function (e) {
            if (!tokenOk(activeToken())) return;
            if (e.type === 'build' || e.type === 'complite') {
                try { patchEpisodes(e); } catch (err) { /* silent */ }
            }
        });

        Lampa.Listener.follow('line', function (e) {
            if (e.type !== 'append') return;
            setTimeout(function () {
                try {
                    var items = e.items || [];
                    items.forEach(function (it) {
                        if (!it || !it.card) return;
                        var node = it.card[0] || it.card;
                        replaceCardImage(node, it.data || it);
                    });
                } catch (err) { /* silent */ }
            }, 50);
        });
    }

    /* ----------------------- запуск ----------------------- */

    function startPlugin() {
        injectQualityCss();
        injectPanelCss();
        migrateLegacy();
        addSettings();
        bind();
        ensureMenuItem();

        // На некоторых экранах меню перестраивается — следим
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') ensureMenuItem();
        });

        Lampa.Manifest && Lampa.Manifest.plugins && Lampa.Manifest.plugins.push({
            type: 'video',
            version: '1.3.0',
            name: 'ERDB Posters',
            description: 'Постеры с рейтингами + бейджи качества + пункт меню + профили токенов',
            component: PLUGIN_ID
        });
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
