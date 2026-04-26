/*!
 * LogoMax — Lampa interface plugin
 * ----------------------------------
 * Стильный инфо-блок, динамические логотипы фильмов и сериалов,
 * подписи под карточками и расширенные настройки внешнего вида.
 *
 * Изменения в этой сборке:
 *   • Удалена настройка «Ориентация карточек» — широкие (горизонтальные)
 *     постеры больше не используются, всегда применяются стандартные
 *     (вертикальные) карточки.
 *   • Удалён весь связанный с широкими постерами код и CSS.
 *   • Добавлен переключатель «Показывать слоган» — управляет выводом
 *     слогана фильма (TMDB tagline) в инфо-блоке.
 *   • Добавлен переключатель «Показывать описание» — позволяет полностью
 *     скрыть текст описания (overview) в инфо-блоке.
 *   • Добавлен переключатель «Логотипы в стиле бабл» — округлая
 *     «таблетка» с полупрозрачным фоном и блюром позади логотипов
 *     (на карточках, в инфо-блоке и в полной карточке).
 *   • Плагин подписан под названием LogoMax.
 */
(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // ========== 1. ОПРЕДЕЛЕНИЕ SMART TV ==========
    markSmartTV();

    function markSmartTV() {
        try {
            var ua = (navigator && navigator.userAgent) ? navigator.userAgent : '';
            var isTv = false;

            if (typeof Lampa !== 'undefined' && Lampa.Platform) {
                try {
                    if (typeof Lampa.Platform.is === 'function') {
                        isTv = isTv || Lampa.Platform.is('tv') || Lampa.Platform.is('smarttv') || Lampa.Platform.is('tizen') || Lampa.Platform.is('webos') || Lampa.Platform.is('netcast');
                    }
                    if (typeof Lampa.Platform.tv === 'function') {
                        isTv = isTv || !!Lampa.Platform.tv();
                    }
                    if (typeof Lampa.Platform.device === 'string') {
                        isTv = isTv || /tv|tizen|webos|netcast|smart/i.test(Lampa.Platform.device);
                    }
                } catch (e) {}
            }

            if (!isTv) {
                isTv = /(SMART-TV|SmartTV|HbbTV|NetCast|Tizen|Web0S|WebOS|Viera|BRAVIA|Android TV|AFTB|AFTT|AFTM|Fire TV)/i.test(ua);
            }

            if (isTv && document && document.documentElement) {
                document.documentElement.classList.add('is-smarttv');
            }
        } catch (e) {}
    }

    // ========== 2. НАСТРОЙКИ И ДИНАМИЧЕСКИЕ СТИЛИ ==========
    const LOGO_CACHE_PREFIX = 'logomax_logo_cache_v1_';

    function applyDynamicStyles() {
        try {
            const root = document.documentElement;

            // Высота логотипов
            const h = Lampa.Storage.get('ni_logo_height', '');
            if (h) {
                root.style.setProperty('--ni-logo-max-h', h);
            } else {
                root.style.removeProperty('--ni-logo-max-h');
            }

            // Высота логотипов на карточках
            const hc = Lampa.Storage.get('ni_card_logo_height', '4.5vh');
            root.style.setProperty('--ni-card-logo-h', hc);

            // Лимит строк описания
            root.style.setProperty('--ni-desc-lines', Lampa.Storage.get('ni_desc_lines', '7'));

            // Размер шрифта описания
            root.style.setProperty('--ni-desc-font-size', Lampa.Storage.get('ni_desc_font_size', '0.87em'));

            // Отступ от инфо-блока
            root.style.setProperty('--ni-info-margin', Lampa.Storage.get('ni_info_margin', '0'));

            // Управление отображением
            const body = document.body;
            body.classList.toggle('ni-hide-rate', !Lampa.Storage.get('ni_show_rate', true));
            body.classList.toggle('ni-hide-pg', !Lampa.Storage.get('ni_show_pg', true));
            body.classList.toggle('ni-hide-year', !Lampa.Storage.get('ni_show_year', true));
            body.classList.toggle('ni-hide-runtime', !Lampa.Storage.get('ni_show_runtime', true));
            body.classList.toggle('ni-hide-card-logos', !Lampa.Storage.get('ni_card_logos', true));
            body.classList.toggle('ni-hide-captions', !Lampa.Storage.get('ni_card_captions', true));
            body.classList.toggle('ni-hide-tagline', !Lampa.Storage.get('ni_show_tagline', true));
            body.classList.toggle('ni-hide-description', !Lampa.Storage.get('ni_show_description', true));
            body.classList.toggle('ni-hide-main-backdrop', !Lampa.Storage.get('ni_show_main_backdrop', true));

            // Раскладка инфо-блока
            const layout = Lampa.Storage.get('ni_info_layout', '2col');
            body.classList.toggle('ni-layout-1col', layout === '1col');
            body.classList.toggle('ni-layout-2col', layout === '2col');
            body.classList.toggle('ni-layout-title-only', layout === 'title_only');
            body.classList.toggle('ni-layout-none', layout === 'none');

            // Отображение логотипов
            const logoGlav = Lampa.Storage.get('ni_logo_glav', 'both');
            body.classList.toggle('ni-logo-info-on', logoGlav === 'both' || logoGlav === 'info');
            body.classList.toggle('ni-logo-full-on', logoGlav === 'both' || logoGlav === 'full');

        } catch (e) {}
    }

    function initUltimateSettings() {
        if (window.__ni_ultimate_settings_ready) return;
        window.__ni_ultimate_settings_ready = true;

        if (!Lampa.SettingsApi || typeof Lampa.SettingsApi.addParam !== 'function') return;

        Lampa.SettingsApi.addComponent({
            component: 'new_interface',
            name: 'LogoMax',
            icon: `<svg viewBox="0 -1 22 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>interface / 10 - interface, distribute, vertically, align icon</title> <g id="Free-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"> <g transform="translate(-820.000000, -600.000000)" id="Group" stroke="currentColor" stroke-width="2"> <g transform="translate(819.000000, 598.000000)" id="Shape"> <line x1="2" y1="21" x2="22" y2="21"> </line> <line x1="2" y1="3" x2="22" y2="3"> </line> <path d="M17,17 L7,17 C5.8954305,17 5,16.1045695 5,15 L5,9 C5,7.8954305 5.8954305,7 7,7 L17,7 C18.1045695,7 19,7.8954305 19,9 L19,15 C19,16.1045695 18.1045695,17 17,17 Z"> </path> </g> </g> </g> </g></svg>`
        });

        const add = (cfg) => { try { Lampa.SettingsApi.addParam(cfg); } catch (e) {} };

        // --- ОСНОВНЫЕ НАСТРОЙКИ ИНТЕРФЕЙСА ---
        add({
            component: 'new_interface',
            param: { name: 'ni_info_layout', type: 'select', values: { '2col': 'В две колонки (Описание справа)', '1col': 'В одну колонку (Описание слева)', 'title_only': 'Только название/логотип', 'none': 'Не показывать инфо-блок' }, default: '2col' },
            field: { name: 'Дизайн инфо-блока', description: 'Расположение текста вверху экрана.' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_info_margin_btn', type: 'button' },
            field: {
                name: 'Отступ от инфо-блока',
                description: 'Укажите значение в vh, em или px (например: 5vh или -2em).<br>По умолчанию: 0'
            },
            onChange: function () {
                if (typeof Lampa.Input !== 'undefined') {
                    Lampa.Input.edit({
                        title: 'Введите отступ (напр. 5vh, -2em)',
                        value: Lampa.Storage.get('ni_info_margin', '0'),
                        free: true,
                        nosave: true,
                        onChange: function (val) {
                            // Динамически показываем изменение прямо во время ввода
                            document.documentElement.style.setProperty('--ni-info-margin', val);
                        }
                    }, function (new_value) {
                        if (new_value !== undefined) {
                            // Сохраняем и применяем
                            Lampa.Storage.set('ni_info_margin', new_value);
                            applyDynamicStyles();
                        } else {
                            // Если отменили ввод (нажали Назад) — возвращаем старое значение
                            applyDynamicStyles();
                        }
                    });
                }
            }
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_desc_lines', type: 'select', values: { '2': '2 строки', '3': '3 строки', '4': '4 строки', '5': '5 строк', '7': '7 строк', '10': '10 строк' }, default: '6' },
            field: { name: 'Лимит строк описания', description: 'Максимальное количество строк в описании фильма' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: {
                name: 'ni_desc_font_size',
                type: 'select',
                values: { '0.7em': 'Минимальный (0.7em)', '0.75em': '0.75em', '0.8em': '0.8em', '0.87em': 'Стандартный (0.87em)', '0.9em': '0.9em', '0.95em': '0.95em', '1em': '1em', '1.05em': '1.05em', '1.1em': '1.1em', '1.15em': '1.15em', '1.2em': 'Большой (1.2em)', '1.3em': 'Очень большой (1.3em)', '1.4em': 'Максимальный (1.4em)' },
                default: '0.87em'
            },
            field: { name: 'Размер шрифта описания', description: 'Управление размером текста в инфо-блоке' },
            onChange: applyDynamicStyles
        });

        // --- ОТОБРАЖЕНИЕ ЭЛЕМЕНТОВ ---
        add({
            component: 'new_interface',
            param: { name: 'ni_show_year', type: 'trigger', default: true },
            field: { name: 'Показывать год и страну', description: 'Отображение года выпуска и страны' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_show_rate', type: 'trigger', default: true },
            field: { name: 'Показывать рейтинг', description: 'Отображение оценки фильма' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_show_runtime', type: 'trigger', default: true },
            field: { name: 'Показывать продолжительность', description: 'Отображение продолжительности фильма' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_show_pg', type: 'trigger', default: true },
            field: { name: 'Показывать возрастной рейтинг (PG)', description: 'Отображение возрастных ограничений (например, 16+)' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_card_captions', type: 'trigger', default: true },
            field: { name: 'Подписи под карточками', description: 'Показывать текстовые названия под постерами' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_show_tagline', type: 'trigger', default: true },
            field: { name: 'Показывать слоган', description: 'Отображать слоган фильма (tagline) в инфо-блоке' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_show_description', type: 'trigger', default: true },
            field: { name: 'Показывать описание', description: 'Отображать текст описания (overview) в инфо-блоке' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_show_main_backdrop', type: 'trigger', default: true },
            field: { name: 'Обложка на главной', description: 'Показывать фоновую обложку на главном экране (на полной карточке остаётся)' },
            onChange: applyDynamicStyles
        });

        // --- НАСТРОЙКИ ЛОГОТИПОВ НА КАРТОЧКАХ ---
        add({
            component: 'new_interface',
            param: { name: 'ni_card_logos', type: 'trigger', default: true },
            field: { name: 'Логотипы на карточках', description: 'Показывать графические логотипы поверх постеров' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: {
                name: 'ni_card_logo_height',
                type: 'select',
                values: { '3vh': 'Маленький (3vh)', '4.5vh': 'Стандартный (4.5vh)', '6vh': 'Большой (6vh)', '8vh': 'Очень большой (8vh)', '12vh': 'Максимальный (12vh)' },
                default: '4.5vh'
            },
            field: { name: 'Размер логотипов на карточках', description: 'Управление высотой изображения внутри постера' },
            onChange: applyDynamicStyles
        });

        // --- НАСТРОЙКИ ЛОГОТИПОВ ---
        add({
            component: 'new_interface',
            param: {
                name: 'ni_logo_glav',
                type: 'select',
                values: { 'both': 'Показать оба', 'info': 'Только в инфо-блоке', 'full': 'Только в полной карточке', 'none': 'Скрыть' },
                default: 'both'
            },
            field: { name: 'Логотипы (Инфо-блок и Полная карточка)', description: 'Где отображать графические логотипы вместо текста' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: {
                name: 'ni_logo_lang',
                type: 'select',
                values: { '': 'Как в Lampa', en: 'English', ru: 'Русский', uk: 'Українська', be: 'Беларуская', kz: 'Қазақша', pt: 'Português', es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano' },
                default: ''
            },
            field: { name: 'Язык логотипа', description: 'Приоритетный язык для поиска логотипа' }
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_logo_size', type: 'select', values: { w300: 'w300', w500: 'w500', w780: 'w780', original: 'Оригинал' }, default: 'original' },
            field: { name: 'Качество логотипа', description: 'Разрешение загружаемого изображения' }
        });

        add({
            component: 'new_interface',
            param: {
                name: 'ni_logo_height',
                type: 'select',
                values: { '': 'Авто (стандарт)', '1.5em': '1.5em', '2em': '2em', '2.5em': '2.5em', '3em': '3em', '4em': '4em', '5em': '5em', '6em': '6em', '7em': '7em', '8em': '8em', '10em': '10em' },
                default: ''
            },
            field: { name: 'Высота логотипов в инфо-блоке', description: 'Максимальный размер изображения в Инфо-блоке' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_logo_clear_cache', type: 'button' },
            field: { name: 'Очистить кэш логотипов', description: 'Нажмите для удаления сохранённых изображений' },
            onChange: function () {
                Lampa.Select.show({
                    title: 'Очистить кэш?',
                    items: [{ title: 'Да', confirm: true }, { title: 'Нет' }],
                    onSelect: function (e) {
                        if (e.confirm) {
                            const keys = [];
                            for (let i = 0; i < localStorage.length; i++) {
                                const k = localStorage.key(i);
                                if (k && k.indexOf(LOGO_CACHE_PREFIX) !== -1) keys.push(k);
                            }
                            keys.forEach((k) => localStorage.removeItem(k));
                            window.location.reload();
                        } else {
                            Lampa.Controller.toggle('settings_component');
                        }
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('settings_component');
                    }
                });
            }
        });

        applyDynamicStyles();
    }

    // ========== 3. ДИНАМИЧЕСКИЙ ДВИЖОК ЛОГОТИПОВ ==========
    class LogoEngine {
        constructor() { this.pending = {}; }

        lang() {
            const forced = (Lampa.Storage.get('ni_logo_lang', '') || '') + '';
            const base = forced || (Lampa.Storage.get('language') || 'en') + '';
            return (base.split('-')[0] || 'en');
        }

        size() { return (Lampa.Storage.get('ni_logo_size', 'original') || 'original') + ''; }
        cacheKey(type, id, lang) { return `${LOGO_CACHE_PREFIX}${type}_${id}_${lang}`; }

        preload(item) { this.getLogoUrl(item, () => { }, { preload: true }); }

        flush(key, value) {
            const list = this.pending[key] || [];
            delete this.pending[key];
            list.forEach((fn) => { try { if (fn) fn(value); } catch (e) { } });
        }

        resolveFromImages(item, lang) {
            try {
                if (!item || !item.images || !Array.isArray(item.images.logos) || !item.images.logos.length) return null;
                const logos = item.images.logos.slice();
                const pick = (iso) => {
                    for (let i = 0; i < logos.length; i++) {
                        if (logos[i] && logos[i].iso_639_1 === iso) return logos[i].file_path;
                    }
                    return null;
                };
                return pick(lang) || pick('en') || (logos[0] && logos[0].file_path) || null;
            } catch (e) { return null; }
        }

        getLogoUrl(item, cb, options) {
            try {
                if (!item || !item.id) return cb && cb(null);
                const source = item.source || 'tmdb';
                if (source !== 'tmdb' && source !== 'cub') return cb && cb(null);
                if (!Lampa.TMDB || typeof Lampa.TMDB.api !== 'function' || typeof Lampa.TMDB.key !== 'function') return cb && cb(null);

                const type = (item.media_type === 'tv' || item.name) ? 'tv' : 'movie';
                const lang = this.lang();
                const key = this.cacheKey(type, item.id, lang);

                const cached = localStorage.getItem(key);
                if (cached) {
                    if (cached === 'none') return cb && cb(null);
                    return cb && cb(cached);
                }

                const fromDetails = this.resolveFromImages(item, lang);
                if (fromDetails) {
                    const size = this.size();
                    const normalized = (fromDetails + '').replace('.svg', '.png');
                    const logoUrl = Lampa.TMDB.image('/t/p/' + size + normalized);
                    localStorage.setItem(key, logoUrl);
                    return cb && cb(logoUrl);
                }

                if (this.pending[key]) {
                    this.pending[key].push(cb);
                    return;
                }

                this.pending[key] = [cb];

                if (typeof $ === 'undefined' || !$.get) {
                    localStorage.setItem(key, 'none');
                    this.flush(key, null);
                    return;
                }

                const url = Lampa.TMDB.api(`${type}/${item.id}/images?api_key=${Lampa.TMDB.key()}&include_image_language=${lang},en,null`);

                $.get(url, (res) => {
                    let filePath = null;
                    if (res && Array.isArray(res.logos) && res.logos.length) {
                        for (let i = 0; i < res.logos.length; i++) {
                            if (res.logos[i] && res.logos[i].iso_639_1 === lang) { filePath = res.logos[i].file_path; break; }
                        }
                        if (!filePath) {
                            for (let i = 0; i < res.logos.length; i++) {
                                if (res.logos[i] && res.logos[i].iso_639_1 === 'en') { filePath = res.logos[i].file_path; break; }
                            }
                        }
                        if (!filePath) filePath = res.logos[0] && res.logos[0].file_path;
                    }

                    if (filePath) {
                        const size = this.size();
                        const normalized = (filePath + '').replace('.svg', '.png');
                        const logoUrl = Lampa.TMDB.image('/t/p/' + size + normalized);
                        localStorage.setItem(key, logoUrl);
                        this.flush(key, logoUrl);
                    } else {
                        localStorage.setItem(key, 'none');
                        this.flush(key, null);
                    }
                }).fail(() => {
                    localStorage.setItem(key, 'none');
                    this.flush(key, null);
                });
            } catch (e) { if (cb) cb(null); }
        }

        setImageSizing(img) {
            if (!img) return;
            img.style.height = ''; img.style.width = ''; img.style.maxHeight = ''; img.style.maxWidth = '';
            img.style.objectFit = 'contain'; img.style.objectPosition = 'left bottom';
        }

        applyToInfo(ctx, item, titleText) {
            if (!ctx || !ctx.title || !item) return;

            const titleEl = ctx.title[0] || ctx.title;
            if (!titleEl) return;

            const requestId = (titleEl.__ni_logo_req_id || 0) + 1;
            titleEl.__ni_logo_req_id = requestId;

            if (!titleEl.querySelector('.ni-title-text')) {
                titleEl.innerHTML = `<span class="ni-title-text"></span><div class="ni-title-logo-wrap" style="animation: ni-fade 0.4s ease;"></div>`;
            }
            titleEl.querySelector('.ni-title-text').textContent = titleText;
            titleEl.classList.remove('has-logo');
            titleEl.querySelector('.ni-title-logo-wrap').innerHTML = '';

            this.getLogoUrl(item, (url) => {
                if (titleEl.__ni_logo_req_id !== requestId) return;
                if (!titleEl.isConnected) return;
                if (!url) return;

                const img = new Image();
                img.className = 'new-interface-info__title-logo';
                img.alt = titleText;
                img.src = url;
                this.setImageSizing(img);

                const wrap = titleEl.querySelector('.ni-title-logo-wrap');
                wrap.innerHTML = '';
                wrap.appendChild(img);
                titleEl.classList.add('has-logo');
            });
        }

        applyToCard(card) {
            if (!card || !card.data || typeof card.render !== 'function') return;

            const jq = card.render(true);
            const root = (jq && jq[0]) ? jq[0] : jq;
            if (!root) return;

            const view = root.querySelector('.card__view') || root;
            const titleText = ((card.data.title || card.data.name || card.data.original_title || card.data.original_name || '') + '').trim();

            const reqId = (card.__ni_logo_req_id || 0) + 1;
            card.__ni_logo_req_id = reqId;

            let wrap = view.querySelector('.new-interface-card-logo');
            if (!wrap) {
                wrap = document.createElement('div');
                wrap.className = 'new-interface-card-logo';
                wrap.style.animation = 'ni-fade 0.4s ease';
                view.appendChild(wrap);
            }

            root.classList.remove('has-logo');
            wrap.innerHTML = '';

            this.getLogoUrl(card.data, (url) => {
                if (card.__ni_logo_req_id !== reqId) return;
                if (!root.isConnected) return;
                if (!url) return;

                const img = new Image();
                img.alt = titleText;
                img.src = url;
                this.setImageSizing(img);

                wrap.appendChild(img);
                root.classList.add('has-logo');
            });
        }

        applyToFull(activity, item) {
            try {
                if (!activity || typeof activity.render !== 'function' || !item) return;

                const container = activity.render();
                if (!container || typeof container.find !== 'function') return;

                const titleNode = container.find('.full-start-new__title, .full-start__title');
                if (!titleNode || !titleNode.length) return;

                const titleEl = titleNode[0];
                const titleText = ((item.title || item.name || item.original_title || item.original_name || '') + '').trim() || (titleNode.text() + '');

                if (!titleEl.__ni_full_title_text) titleEl.__ni_full_title_text = titleText;
                const originalText = titleEl.__ni_full_title_text;

                if (!titleEl.querySelector('.ni-title-text')) {
                    titleEl.innerHTML = `<span class="ni-title-text">${originalText}</span><div class="ni-title-logo-wrap" style="animation: ni-fade 0.4s ease;"></div>`;
                } else {
                    titleEl.querySelector('.ni-title-text').textContent = originalText;
                }
                titleEl.classList.remove('has-logo');
                titleEl.querySelector('.ni-title-logo-wrap').innerHTML = '';

                const requestId = (titleEl.__ni_logo_req_id || 0) + 1;
                titleEl.__ni_logo_req_id = requestId;

                this.getLogoUrl(item, (url) => {
                    if (titleEl.__ni_logo_req_id !== requestId) return;
                    if (!titleEl.isConnected) return;
                    if (!url) return;

                    const img = new Image();
                    img.className = 'new-interface-full-logo';
                    img.alt = originalText;
                    img.src = url;

                    this.setImageSizing(img);

                    const wrap = titleEl.querySelector('.ni-title-logo-wrap');
                    wrap.appendChild(img);
                    titleEl.classList.add('has-logo');
                });
            } catch (e) {}
        }
    }

    const Logo = new LogoEngine();
    initUltimateSettings();

    // Обработка полной карточки фильма
    function hookFullTitleLogos() {
        if (window.__ni_full_logo_hooked) return;
        window.__ni_full_logo_hooked = true;

        if (!Lampa.Listener || typeof Lampa.Listener.follow !== 'function') return;

        Lampa.Listener.follow('full', function (e) {
            try {
                if (!e || e.type !== 'complite') return;
                if (!e.object || !e.object.activity) return;

                const data = (e.data && (e.data.movie || e.data)) ? (e.data.movie || e.data) : null;
                if (!data) return;

                Logo.applyToFull(e.object.activity, data);
            } catch (err) {}
        });
    }
    hookFullTitleLogos();

    // ========== 4. ОБРАБОТКА ТЕКСТА ПОД КАРТОЧКОЙ ==========
    function updateCardTitle(card) {
        if (!card || typeof card.render !== 'function') return;
        const element = card.render(true);
        if (!element) return;

        if (!element.isConnected) {
            clearTimeout(card.__newInterfaceLabelTimer);
            card.__newInterfaceLabelTimer = setTimeout(() => updateCardTitle(card), 50);
            return;
        }

        clearTimeout(card.__newInterfaceLabelTimer);
        const text = (card.data && (card.data.title || card.data.name || card.data.original_title || card.data.original_name)) ? (card.data.title || card.data.name || card.data.original_title || card.data.original_name).trim() : '';
        const seek = element.querySelector('.new-interface-card-title');

        if (!text) {
            if (seek && seek.parentNode) seek.parentNode.removeChild(seek);
            card.__newInterfaceLabel = null;
            return;
        }

        let label = seek || card.__newInterfaceLabel;
        if (!label) {
            label = document.createElement('div');
            label.className = 'new-interface-card-title';
        }

        const year = (card.data.release_date || card.data.first_air_date || '').substring(0, 4);
        label.innerHTML = '';

        if (year && year !== '') {
            const yearSpan = document.createElement('span');
            yearSpan.className = 'card-year';
            yearSpan.textContent = year;
            yearSpan.style.cssText = 'display: block; font-size: 0.9em; color: rgba(255, 255, 255, 0.7); margin-bottom: 0.2em;';
            label.appendChild(yearSpan);
        }

        if (text && text !== '') {
            const titleSpan = document.createElement('span');
            titleSpan.className = 'card-title-text';
            titleSpan.textContent = text;
            titleSpan.style.cssText = 'display: block; font-size: 1em; color: #fff; font-weight: 500; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;';
            label.appendChild(titleSpan);
        }

        label.style.display = 'block';
        label.style.height = '3.5em';
        label.style.overflow = 'hidden';
        label.style.marginTop = '0.5em';

        if (!label.parentNode || label.parentNode !== element) {
            if (label.parentNode) label.parentNode.removeChild(label);
            element.appendChild(label);
        }
        card.__newInterfaceLabel = label;
    }

    // ========== 5. ЛОГИКА ДЛЯ LAMPA v3.0.0+ ==========
    function startPluginV3() {
        if (!Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) return;
        if (window.plugin_interface_ready_v3) return;
        window.plugin_interface_ready_v3 = true;

        addStyleV3();

        const mainMap = Lampa.Maker.map('Main');
        if (!mainMap || !mainMap.Items || !mainMap.Create) return;

        wrap(mainMap.Items, 'onInit', function (original, args) {
            if (original) original.apply(this, args);
            this.__newInterfaceEnabled = (this.object && (this.object.source === 'tmdb' || this.object.source === 'cub') && window.innerWidth >= 767);
        });

        wrap(mainMap.Create, 'onCreate', function (original, args) {
            if (original) original.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            const state = ensureState(this);
            state.attach();
        });

        wrap(mainMap.Create, 'onCreateAndAppend', function (original, args) {
            return original ? original.apply(this, args) : undefined;
        });

        wrap(mainMap.Items, 'onAppend', function (original, args) {
            if (original) original.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            const item = args && args[0];
            const element = args && args[1];
            if (item && element) attachLineHandlers(this, item, element);
        });

        wrap(mainMap.Items, 'onDestroy', function (original, args) {
            if (this.__newInterfaceState) {
                this.__newInterfaceState.destroy();
                delete this.__newInterfaceState;
            }
            delete this.__newInterfaceEnabled;
            if (original) original.apply(this, args);
        });
    }

    function ensureState(main) {
        if (main.__newInterfaceState) return main.__newInterfaceState;
        const state = createInterfaceState(main);
        main.__newInterfaceState = state;
        return state;
    }

    function createInterfaceState(main) {
        const info = new InterfaceInfo();
        info.create();
        const background = document.createElement('img');
        background.className = 'full-start__background';

        return {
            main, info, background, infoElement: null, backgroundTimer: null, backgroundLast: '', attached: false,
            attach() {
                if (this.attached) return;
                const container = main.render(true);
                if (!container) return;

                container.classList.add('new-interface', 'new-interface-h');

                if (!background.parentElement) {
                    container.insertBefore(background, container.firstChild || null);
                }

                const infoNode = info.render(true);
                this.infoElement = infoNode;

                if (infoNode && infoNode.parentNode !== container) {
                    if (background.parentElement === container) {
                        container.insertBefore(infoNode, background.nextSibling);
                    } else {
                        container.insertBefore(infoNode, container.firstChild || null);
                    }
                }
                main.scroll.minus(infoNode);
                this.attached = true;
            },
            update(data) {
                if (!data) return;
                info.update(data);
                this.updateBackground(data);
            },
            updateBackground(data) {
                const path = data && data.backdrop_path ? Lampa.Api.img(data.backdrop_path, 'w1280') : '';
                if (!path || path === this.backgroundLast) return;

                clearTimeout(this.backgroundTimer);
                this.backgroundTimer = setTimeout(() => {
                    background.classList.remove('loaded');
                    background.onload = () => background.classList.add('loaded');
                    background.onerror = () => background.classList.remove('loaded');
                    this.backgroundLast = path;
                    setTimeout(() => { background.src = this.backgroundLast; }, 300);
                }, 1000);
            },
            reset() { info.empty(); },
            destroy() {
                clearTimeout(this.backgroundTimer);
                info.destroy();
                const container = main.render(true);
                if (container) container.classList.remove('new-interface');
                if (this.infoElement && this.infoElement.parentNode) this.infoElement.parentNode.removeChild(this.infoElement);
                if (background && background.parentNode) background.parentNode.removeChild(background);
                this.attached = false;
            }
        };
    }

    function decorateCard(state, card) {
        if (!card || card.__newInterfaceCard || typeof card.use !== 'function' || !card.data) return;
        card.__newInterfaceCard = true;

        card.use({
            onFocus() { state.update(card.data); },
            onHover() { state.update(card.data); },
            onTouch() { state.update(card.data); },
            onVisible() { updateCardTitle(card); Logo.applyToCard(card); },
            onUpdate() { updateCardTitle(card); Logo.applyToCard(card); },
            onDestroy() {
                clearTimeout(card.__newInterfaceLabelTimer);
                if (card.__newInterfaceLabel && card.__newInterfaceLabel.parentNode) {
                    card.__newInterfaceLabel.parentNode.removeChild(card.__newInterfaceLabel);
                }
                card.__newInterfaceLabel = null;
                delete card.__newInterfaceCard;
            }
        });
        updateCardTitle(card);
        Logo.applyToCard(card);
    }

    function attachLineHandlers(main, line, element) {
        if (line.__newInterfaceLine) return;
        line.__newInterfaceLine = true;

        const state = ensureState(main);
        const applyToCard = (card) => decorateCard(state, card);

        if (element && Array.isArray(element.results)) {
            element.results.slice(0, 5).forEach((item) => {
                state.info.load(item, { preload: true });
                Logo.preload(item);
            });
        }

        line.use({
            onInstance(card) { applyToCard(card); },
            onActive(card, itemData) {
                const current = (card && card.data) ? card.data : null;
                if (current) state.update(current);
            },
            onToggle() {
                setTimeout(() => {
                    const container = line && typeof line.render === 'function' ? line.render(true) : null;
                    if (!container) return;
                    const focus = container.querySelector('.selector.focus') || container.querySelector('.focus');
                    let current = focus;
                    while (current && !current.card_data) { current = current.parentNode; }
                    if (current && current.card_data) state.update(current.card_data);
                }, 32);
            },
            onMore() { state.reset(); },
            onDestroy() { state.reset(); delete line.__newInterfaceLine; }
        });

        if (Array.isArray(line.items) && line.items.length) {
            line.items.forEach(applyToCard);
        }

        if (line.last) {
            let lastData = line.last && line.last.jquery ? line.last[0] : line.last;
            while (lastData && !lastData.card_data) lastData = lastData.parentNode;
            if (lastData && lastData.card_data) state.update(lastData.card_data);
        }
    }

    function wrap(target, method, handler) {
        if (!target) return;
        const original = typeof target[method] === 'function' ? target[method] : null;
        target[method] = function (...args) { return handler.call(this, original, args); };
    }

    // ========== 6. КЛАСС ОПИСАНИЯ (InterfaceInfo) ==========
    class InterfaceInfo {
        constructor() { this.html = null; this.timer = null; this.network = new Lampa.Reguest(); this.loaded = {}; }

        create() {
            if (this.html) return;
            this.html = $(`<div class="new-interface-info">
                <div class="new-interface-info__body">
                    <div class="new-interface-info__left">
                        <div class="new-interface-info__head"></div>
                        <div class="new-interface-info__title"></div>
                        <div class="new-interface-info__tagline"></div>
                    </div>
                    <div class="new-interface-info__right">
                        <div class="new-interface-info__textblock">
                            <div class="new-interface-info__meta">
                                <div class="new-interface-info__meta-top">
                                    <div class="new-interface-info__rate"></div>
                                    <span class="new-interface-info__dot dot-rate-genre">&#9679;</span>
                                    <div class="new-interface-info__genres"></div>
                                    <span class="new-interface-info__dot dot-genre-runtime">&#9679;</span>
                                    <div class="new-interface-info__runtime"></div>
                                    <span class="new-interface-info__dot dot-runtime-pg">&#9679;</span>
                                    <div class="new-interface-info__pg"></div>
                                </div>
                            </div>
                            <div class="new-interface-info__description"></div>
                        </div>
                    </div>
                </div>
            </div>`);
        }

        render(js) {
            if (!this.html) this.create();
            return js ? this.html[0] : this.html;
        }

        update(data) {
            if (!data) return;
            if (!this.html) this.create();

            this.html.find('.new-interface-info__head,.new-interface-info__genres,.new-interface-info__runtime').text('---');
            this.html.find('.new-interface-info__rate,.new-interface-info__pg').empty();
            this.html.find('.new-interface-info__title').text(data.title || data.name || '');
            this.html.find('.new-interface-info__tagline').text(data.tagline || '');
            this.html.find('.new-interface-info__description').text(data.overview || Lampa.Lang.translate('full_notext'));
            Lampa.Background.change(Lampa.Utils.cardImgBackground(data));
            this.load(data);
        }

        load(data, options) {
            if (!data || !data.id) return;
            const source = data.source || 'tmdb';
            if (source !== 'tmdb' && source !== 'cub') return;
            if (!Lampa.TMDB || typeof Lampa.TMDB.api !== 'function' || typeof Lampa.TMDB.key !== 'function') return;

            const preload = options && options.preload;
            const type = data.media_type === 'tv' || data.name ? 'tv' : 'movie';
            const language = Lampa.Storage.get('language');
            const shortLang = (language || 'en').split('-')[0];
            const url = Lampa.TMDB.api(`${type}/${data.id}?api_key=${Lampa.TMDB.key()}&append_to_response=content_ratings,release_dates,images&include_image_language=${shortLang},en,null&language=${language}`);

            this.currentUrl = url;

            if (this.loaded[url]) {
                if (!preload) this.draw(this.loaded[url]);
                return;
            }

            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.network.clear();
                this.network.timeout(5000);
                this.network.silent(url, (movie) => {
                    this.loaded[url] = movie;
                    if (!preload && this.currentUrl === url) this.draw(movie);
                });
            }, 0);
        }

        draw(movie) {
            if (!movie || !this.html) return;

            const create = ((movie.release_date || movie.first_air_date || '0000') + '').slice(0, 4);
            const vote = parseFloat((movie.vote_average || 0) + '').toFixed(1);
            const head = [];
            const sources = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb ? Lampa.Api.sources.tmdb : null;
            const countries = sources && typeof sources.parseCountries === 'function' ? sources.parseCountries(movie) : [];
            const pg = sources && typeof sources.parsePG === 'function' ? sources.parsePG(movie) : '';

            if (create !== '0000') head.push(`<span>${create}</span>`);
            if (countries && countries.length) head.push(countries.join(', '));
            const genreText = (Array.isArray(movie.genres) && movie.genres.length) ? movie.genres.map((item) => Lampa.Utils.capitalizeFirstLetter(item.name)).join(' | ') : '';
            const runtimeText = movie.runtime ? Lampa.Utils.secondsToTime(movie.runtime * 60, true) : '';

            this.html.find('.new-interface-info__head').empty().append(head.join(', '));

            if (vote > 0) this.html.find('.new-interface-info__rate').html(`<div class="full-start__rate"><div>${vote}</div></div>`);
            else this.html.find('.new-interface-info__rate').empty();

            this.html.find('.new-interface-info__genres').text(genreText);
            this.html.find('.new-interface-info__runtime').text(runtimeText);
            this.html.find('.new-interface-info__pg').html(pg ? `<span class="full-start__pg">${pg}</span>` : '');
            this.html.find('.new-interface-info__tagline').text(movie.tagline || '');

            const dot1 = this.html.find('.dot-rate-genre');
            const dot2 = this.html.find('.dot-genre-runtime');
            const dot3 = this.html.find('.dot-runtime-pg');

            this.html.find('.new-interface-info__genres').toggle(!!genreText);
            this.html.find('.new-interface-info__runtime').toggle(!!runtimeText);
            this.html.find('.new-interface-info__pg').toggle(!!pg);

            dot1.toggle(!!(vote > 0 && genreText));
            dot2.toggle(!!(genreText && (runtimeText || pg)));
            dot3.toggle(!!(runtimeText && pg));

            this.html.find('.new-interface-info__description').text(movie.overview || Lampa.Lang.translate('full_notext'));

            const titleNode = this.html.find('.new-interface-info__title');
            const titleText = movie.title || movie.name || '';

            Logo.applyToInfo({
                wrapper: this.html,
                title: titleNode,
                head: this.html.find('.new-interface-info__head')
            }, movie, titleText);
        }

        empty() {
            if (!this.html) return;
            this.html.find('.new-interface-info__head,.new-interface-info__genres,.new-interface-info__runtime').text('---');
            this.html.find('.new-interface-info__rate').empty();
        }

        destroy() {
            clearTimeout(this.timer);
            this.network.clear();
            this.loaded = {};
            if (this.html) { this.html.remove(); this.html = null; }
        }
    }

    // ========== 7. ПОДДЕРЖКА СТАРЫХ ВЕРСИЙ (Lampa < 3.0.0) ==========
    function createLegacy() {
        var html;
        var timer;
        var network = new Lampa.Reguest();
        var loaded = {};

        this.create = function () {
            html = $(`<div class="new-interface-info">
                <div class="new-interface-info__body">
                    <div class="new-interface-info__left">
                        <div class="new-interface-info__head"></div>
                        <div class="new-interface-info__title"></div>
                        <div class="new-interface-info__tagline"></div>
                    </div>
                    <div class="new-interface-info__right">
                        <div class="new-interface-info__textblock">
                            <div class="new-interface-info__meta">
                                <div class="new-interface-info__meta-top">
                                    <div class="new-interface-info__rate"></div>
                                    <span class="new-interface-info__dot dot-rate-genre">&#9679;</span>
                                    <div class="new-interface-info__genres"></div>
                                    <span class="new-interface-info__dot dot-genre-runtime">&#9679;</span>
                                    <div class="new-interface-info__runtime"></div>
                                    <span class="new-interface-info__dot dot-runtime-pg">&#9679;</span>
                                    <div class="new-interface-info__pg"></div>
                                </div>
                            </div>
                            <div class="new-interface-info__description"></div>
                        </div>
                    </div>
                </div>
            </div>`);
        };

        this.update = function (data) {
            html.find('.new-interface-info__head,.new-interface-info__genres,.new-interface-info__runtime').text('---');
            html.find('.new-interface-info__rate').empty();
            html.find('.new-interface-info__pg').empty();
            html.find('.new-interface-info__title').text(data.title || data.name || '');
            html.find('.new-interface-info__tagline').text(data.tagline || '');
            html.find('.new-interface-info__description').text(data.overview || Lampa.Lang.translate('full_notext'));
            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
            this.load(data);
        };

        this.draw = function (data) {
            var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
            var vote = parseFloat((data.vote_average || 0) + '').toFixed(1);
            var head = [];
            var countries = Lampa.Api.sources.tmdb.parseCountries(data);
            var pg = Lampa.Api.sources.tmdb.parsePG(data);

            if (create !== '0000') head.push('<span>' + create + '</span>');
            if (countries.length > 0) head.push(countries.join(', '));

            var genreText = data.genres && data.genres.length > 0 ? data.genres.map(function (item) {
                return Lampa.Utils.capitalizeFirstLetter(item.name);
            }).join(' | ') : '';

            var runtimeText = data.runtime ? Lampa.Utils.secondsToTime(data.runtime * 60, true) : '';

            html.find('.new-interface-info__head').empty().append(head.join(', '));

            if (vote > 0) html.find('.new-interface-info__rate').html('<div class="full-start__rate"><div>' + vote + '</div></div>');
            else html.find('.new-interface-info__rate').empty();

            html.find('.new-interface-info__genres').text(genreText);
            html.find('.new-interface-info__runtime').text(runtimeText);
            html.find('.new-interface-info__pg').html(pg ? '<span class="full-start__pg">' + pg + '</span>' : '');
            html.find('.new-interface-info__tagline').text(data.tagline || '');

            var dot1 = html.find('.dot-rate-genre');
            var dot2 = html.find('.dot-genre-runtime');
            var dot3 = html.find('.dot-runtime-pg');

            html.find('.new-interface-info__genres').toggle(!!genreText);
            html.find('.new-interface-info__runtime').toggle(!!runtimeText);
            html.find('.new-interface-info__pg').toggle(!!pg);

            dot1.toggle(!!(vote > 0 && genreText));
            dot2.toggle(!!(genreText && (runtimeText || pg)));
            dot3.toggle(!!(runtimeText && pg));

            var titleNode = html.find('.new-interface-info__title');
            var titleText = (data.title || data.name || '') + '';

            Logo.applyToInfo({
                wrapper: html,
                title: titleNode,
                head: html.find('.new-interface-info__head')
            }, data, titleText);
        };

        this.load = function (data) {
            var _this = this;
            clearTimeout(timer);
            var url = Lampa.TMDB.api((data.name ? 'tv' : 'movie') + '/' + data.id + '?api_key=' + Lampa.TMDB.key() + '&append_to_response=content_ratings,release_dates&language=' + Lampa.Storage.get('language'));
            if (loaded[url]) return this.draw(loaded[url]);
            timer = setTimeout(function () {
                network.clear();
                network.timeout(5000);
                network.silent(url, function (movie) {
                    loaded[url] = movie;
                    _this.draw(movie);
                });
            }, 300);
        };

        this.render = function () { return html; };
        this.empty = function () {};
        this.destroy = function () { html.remove(); loaded = {}; html = null; };
    }

    function componentLegacy(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
        var items = [];
        var html = $('<div class="new-interface new-interface-h"><img class="full-start__background"></div>');
        var active = 0;
        var newlampa = Lampa.Manifest.app_digital >= 166;
        var info;
        var lezydata;
        var viewall = Lampa.Storage.field('card_views_type') == 'view' || Lampa.Storage.field('navigation_type') == 'mouse';
        var background_img = html.find('.full-start__background');
        var background_last = '';
        var background_timer;

        this.create = function () {};

        this.empty = function () {
            var button;
            if (object.source == 'tmdb') {
                button = $('<div class="empty__footer"><div class="simple-button selector">' + Lampa.Lang.translate('change_source_on_cub') + '</div></div>');
                button.find('.selector').on('hover:enter', function () {
                    Lampa.Storage.set('source', 'cub');
                    Lampa.Activity.replace({ source: 'cub' });
                });
            }
            var empty = new Lampa.Empty();
            html.append(empty.render(button));
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.loadNext = function () {
            var _this = this;
            if (this.next && !this.next_wait && items.length) {
                this.next_wait = true;
                this.next(function (new_data) {
                    _this.next_wait = false;
                    new_data.forEach(_this.append.bind(_this));
                    Lampa.Layer.visible(items[active + 1].render(true));
                }, function () { _this.next_wait = false; });
            }
        };

        this.push = function () {};

        this.build = function (data) {
            var _this2 = this;
            lezydata = data;
            info = new createLegacy(object);
            info.create();
            scroll.minus(info.render());
            data.slice(0, viewall ? data.length : 2).forEach(this.append.bind(this));
            html.append(info.render());
            html.append(scroll.render());

            if (newlampa) {
                Lampa.Layer.update(html);
                Lampa.Layer.visible(scroll.render(true));
                scroll.onEnd = this.loadNext.bind(this);
                scroll.onWheel = function (step) {
                    if (!Lampa.Controller.own(_this2)) _this2.start();
                    if (step > 0) _this2.down(); else if (active > 0) _this2.up();
                };
            }

            this.activity.loader(false);
            this.activity.toggle();
        };

        this.background = function (elem) {
            var new_background = Lampa.Api.img(elem.backdrop_path, 'w1280');
            clearTimeout(background_timer);
            if (new_background == background_last) return;
            background_timer = setTimeout(function () {
                background_img.removeClass('loaded');
                background_img[0].onload = function () { background_img.addClass('loaded'); };
                background_img[0].onerror = function () { background_img.removeClass('loaded'); };
                background_last = new_background;
                setTimeout(function () { background_img[0].src = background_last; }, 300);
            }, 1000);
        };

        this.append = function (element) {
            var _this3 = this;
            if (element.ready) return;
            element.ready = true;

            var item = new Lampa.InteractionLine(element, {
                url: element.url,
                card_small: true,
                cardClass: element.cardClass,
                genres: object.genres,
                object: object,
                card_wide: false,
                nomore: element.nomore
            });
            item.create();
            item.onDown = this.down.bind(this);
            item.onUp = this.up.bind(this);
            item.onBack = this.back.bind(this);

            item.onToggle = function () { active = items.indexOf(item); };
            if (this.onMore) item.onMore = this.onMore.bind(this);

            item.onFocus = function (elem) { info.update(elem); _this3.background(elem); };
            item.onHover = function (elem) { info.update(elem); _this3.background(elem); };

            item.onFocusMore = info.empty.bind(info);

            item.items.forEach(function (card) {
                if (card && card.use) {
                    var origVisible = card.onVisible;
                    var origUpdate = card.onUpdate;
                    card.use({
                        onVisible: function () { if (origVisible) origVisible.call(card); updateCardTitle(card); Logo.applyToCard(card); },
                        onUpdate: function () { if (origUpdate) origUpdate.call(card); updateCardTitle(card); Logo.applyToCard(card); }
                    });
                }
            });

            scroll.append(item.render());
            items.push(item);
        };

        this.back = function () { Lampa.Activity.backward(); };

        this.down = function () {
            active++;
            active = Math.min(active, items.length - 1);
            if (!viewall) lezydata.slice(0, active + 2).forEach(this.append.bind(this));
            items[active].toggle();
            scroll.update(items[active].render());
        };

        this.up = function () {
            active--;
            if (active < 0) { active = 0; Lampa.Controller.toggle('head'); }
            else { items[active].toggle(); scroll.update(items[active].render()); }
        };

        this.start = function () {
            var _this4 = this;
            Lampa.Controller.add('content', {
                link: this,
                toggle: function toggle() {
                    if (_this4.activity.canRefresh()) return false;
                    if (items.length) items[active].toggle();
                },
                update: function update() {},
                left: function left() { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                right: function right() { Navigator.move('right'); },
                up: function up() { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                down: function down() { if (Navigator.canmove('down')) Navigator.move('down'); },
                back: this.back
            });
            Lampa.Controller.toggle('content');
        };

        this.refresh = function () { this.activity.loader(true); this.activity.need_refresh = true; };
        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () {
            network.clear();
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            if (info) info.destroy();
            html.remove();
            items = null; network = null; lezydata = null;
        };
    }

    function startLegacyPlugin() {
        window.plugin_interface_ready = true;
        var old_interface = Lampa.InteractionMain;
        var new_interface = componentLegacy;

        Lampa.InteractionMain = function (object) {
            var use = new_interface;
            if (!(object.source == 'tmdb' || object.source == 'cub')) use = old_interface;
            if (window.innerWidth < 767) use = old_interface;
            if (Lampa.Manifest.app_digital < 153) use = old_interface;
            return new use(object);
        };
    }

    // ========== 8. ГЛОБАЛЬНЫЕ CSS СТИЛИ ==========
    function addStyleV3() {
        if (addStyleV3.added) return;
        addStyleV3.added = true;

        Lampa.Template.add('new_interface_ultimate_styles', `<style>
        :root {
            --ni-logo-max-h-auto: 8.5em;
            --ni-logo-max-h: var(--ni-logo-max-h-user, var(--ni-logo-max-h-auto));
            --ni-card-logo-h: 4.5vh;
            --ni-desc-lines: 7;
            --ni-desc-font-size: 0.87em;
            --ni-info-margin: 0;
        }

        /* Высота инфо-блока (стандартные вертикальные карточки) */
        .new-interface { position: relative; --ni-info-h: clamp(14em, 32vh, 24em); }

        @keyframes ni-fade { from { opacity: 0; } to { opacity: 1; } }

        /* --- УПРАВЛЕНИЕ ОТОБРАЖЕНИЕМ ЧЕРЕЗ НАСТРОЙКИ --- */
        body.ni-layout-none .new-interface-info { display: none !important; }
        body.ni-layout-none .new-interface { --ni-info-h: 0px !important; }

        /* Только название/логотип */
        body.ni-layout-title-only .new-interface-info__right,
        body.ni-layout-title-only .new-interface-info__head { display: none !important; }

        body.ni-hide-rate .new-interface-info__rate,
        body.ni-hide-rate .dot-rate-genre { display: none !important; }
        body.ni-hide-pg .new-interface-info__pg,
        body.ni-hide-pg .dot-runtime-pg { display: none !important; }
        body.ni-hide-year .new-interface-info__head,
        body.ni-hide-year .card-year { display: none !important; }
        body.ni-hide-runtime .new-interface-info__runtime,
        body.ni-hide-runtime .dot-genre-runtime { display: none !important; }

        /* Подписи под карточками */
        body.ni-hide-captions .new-interface .card__view ~ .card__title,
        body.ni-hide-captions .new-interface .card__view ~ .card__name,
        body.ni-hide-captions .new-interface .card__view ~ .card__text,
        body.ni-hide-captions .new-interface .card__view ~ .card__details,
        body.ni-hide-captions .new-interface .card__view ~ .card__year,
        body.ni-hide-captions .new-interface .card__bottom { display: none !important; }
        body.ni-hide-captions .new-interface .card > *:not(.card__view):not(.card__promo) { display: none !important; }

        /* Убираем "мусор" Lampa поверх логотипов на карточках */
        body:not(.ni-hide-card-logos) .new-interface-card-title { display: none !important; }

        /* --- КАРТОЧКИ: только стандартные (вертикальные) --- */
        html:not(.is-smarttv) .new-interface { --ni-card-w: clamp(120px, 7.6vw, 170px); }
        html:not(.is-smarttv) .new-interface .card--small,
        html:not(.is-smarttv) .new-interface .card-more { width: var(--ni-card-w) !important; }
        html:not(.is-smarttv) .new-interface .card-more__box { padding-bottom: 150%; }

        /* Динамические логотипы на карточках */
        .new-interface .card .card__view { position: relative; }
        .new-interface-card-logo { display: none; position: absolute; left: 0; top: 0; right: 0; bottom: 0; box-sizing: border-box; pointer-events: none; z-index: 1; border-radius: inherit; overflow: hidden; }
        .new-interface-card-logo::before { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 60%; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); z-index: -1; }
        body:not(.ni-hide-card-logos) .card.has-logo .new-interface-card-logo { display: block; }
        body:not(.ni-hide-card-logos) .card.has-logo .new-interface-card-title { display: none !important; }
        .new-interface .new-interface-card-logo img { position: absolute; bottom: 0.45em; left: 5%; right: 5%; display: block; max-width: 90%; max-height: min(var(--ni-card-logo-h), 92%); width: auto; height: auto; object-fit: contain; object-position: center bottom; margin: 0 auto; }

        /* --- ИНФО-БЛОК --- */
        .new-interface-info { position: relative; padding: 1.5em; height: var(--ni-info-h); overflow: hidden; z-index: 3; margin-bottom: var(--ni-info-margin); }
        .new-interface-info:before { display: none !important; }

        .new-interface-info__body { position: relative; z-index: 1; width: min(96%, 78em); padding-top: 1.1em; height: 100%; box-sizing: border-box; }

        /* Раскладка 2 колонки (Flexbox) */
        body.ni-layout-2col .new-interface-info__body { display: flex; justify-content: space-between; gap: 2em; align-items: flex-start; width: 100%; max-width: 100%; padding-right: 1.5em; }
        body.ni-layout-2col .new-interface-info__left { flex: 1; min-width: 0; }
        body.ni-layout-2col .new-interface-info__right { flex: 0 0 40%; max-width: 36em; padding-top: 0; padding-bottom: clamp(0.8em, 2.4vh, 2.0em); display: flex; flex-direction: column; margin-left: auto; }
        body.ni-layout-2col .new-interface-info__textblock { display: flex; flex-direction: column; gap: 0.55em; }

        /* Раскладка 1 колонка */
        body.ni-layout-1col .new-interface-info__body { display: flex; flex-direction: column; max-width: 70em; gap: 0.5em; }
        body.ni-layout-1col .new-interface-info__left { flex: 0 0 auto; }
        body.ni-layout-1col .new-interface-info__right { padding-top: 0.5em; flex: 1 1 auto; overflow: hidden; display: flex; flex-direction: column; }
        body.ni-layout-1col .new-interface-info__textblock { margin-top: 0; display: flex; flex-direction: column; gap: 0.5em; }
        body.ni-layout-1col .new-interface-info__description { max-width: 60%; }

        .new-interface-info__head { color: rgba(255, 255, 255, 0.6); margin-bottom: 1em; font-size: 1.3em; min-height: 1em; }
        .new-interface-info__head span { color: #fff; }
        .new-interface-info__title { font-size: clamp(2.6em, 4.0vw, 3.6em); font-weight: 600; margin-bottom: 0.3em; line-height: 1.25; }

        /* Динамические логотипы инфо-блока и полной карточки */
        .ni-title-logo-wrap { display: none; font-size: 1rem; margin-bottom: 0.5em; }
        body.ni-logo-info-on .new-interface-info__title.has-logo .ni-title-logo-wrap { display: block; }
        body.ni-logo-info-on .new-interface-info__title.has-logo .ni-title-text { display: none !important; }

        body.ni-logo-full-on .full-start-new__title.has-logo .ni-title-logo-wrap,
        body.ni-logo-full-on .full-start__title.has-logo .ni-title-logo-wrap { display: block; }
        body.ni-logo-full-on .full-start-new__title.has-logo .ni-title-text,
        body.ni-logo-full-on .full-start__title.has-logo .ni-title-text { display: none !important; }

        .new-interface-info__title-logo, .new-interface-full-logo { max-width: 100%; max-height: var(--ni-logo-max-h); display: block; object-fit: contain; object-position: left bottom; }
        .new-interface-full-logo { margin-top: 0.25em; }

        /* Плотная группировка метаданных */
        .new-interface-info__meta-top { display: flex; align-items: center; justify-content: flex-start; gap: 0.75em; flex-wrap: nowrap; min-height: 1.9em; min-width: 0; }
        .new-interface-info__genres { flex: 0 1 auto; font-size: 1.1em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .new-interface-info__runtime { flex: 0 0 auto; font-size: 1.05em; }
        .new-interface-info__dot { flex: 0 0 auto; font-size: 0.85em; opacity: 0.75; }
        .new-interface-info__pg .full-start__pg { font-size: 0.95em; }

        .new-interface-info__description { font-size: var(--ni-desc-font-size); font-weight: 300; line-height: 1.38; color: rgba(255, 255, 255, 0.90); text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45); overflow: hidden; display: -webkit-box; -webkit-line-clamp: var(--ni-desc-lines); line-clamp: var(--ni-desc-lines); -webkit-box-orient: vertical; }

        .new-interface .full-start__background { height: 108%; top: -6em; }
        body.ni-hide-main-backdrop .new-interface .full-start__background,
        body.ni-hide-main-backdrop .new-interface > .full-start__background,
        body.ni-hide-main-backdrop .new-interface-h .full-start__background { display: none !important; opacity: 0 !important; visibility: hidden !important; }
        .new-interface .full-start__rate { font-size: 1.3em; margin-right: 0; }
        .new-interface .card__promo, .new-interface .card .card-watched { display: none !important; }

        /* Сдвиг строк вверх/вниз */
        html:not(.is-smarttv) .new-interface-h { --ni-line-head-shift: -2vh; --ni-line-body-shift: -3vh; }
        html.is-smarttv .new-interface-h { --ni-line-head-shift: 0; --ni-line-body-shift: 0; }

        /* КОМПЕНСАЦИЯ: Опускаем строки вниз, если подписи отключены */
        body.ni-hide-captions html:not(.is-smarttv) .new-interface-h { --ni-line-head-shift: 2vh; --ni-line-body-shift: 2vh; }
        body.ni-hide-captions html.is-smarttv .new-interface-h { --ni-line-head-shift: 4vh; --ni-line-body-shift: 4vh; }

        .new-interface-h .items-line__head { position: relative; top: var(--ni-line-head-shift); z-index: 2; }
        .new-interface-h .items-line__body > .scroll.scroll--horizontal { position: relative; top: var(--ni-line-body-shift); z-index: 1; }

        /* Светлая тема */
        body.light--version .new-interface-info__head { color: rgba(0, 0, 0, 0.7); }
        body.light--version .new-interface-info__head span { color: #111; }
        body.light--version .new-interface-info__title, body.light--version .new-interface-info__rate { color: #111; }
        body.light--version .new-interface-info__description { color: rgba(0, 0, 0, 0.9); text-shadow: none; }
        body.light--version .new-interface-card-title { color: #111; }

        /* --- СЛОГАН (TAGLINE) --- */
        .new-interface-info__tagline { font-size: 1.05em; font-style: italic; font-weight: 300; color: rgba(255, 255, 255, 0.78); margin: 0.2em 0 0.6em; line-height: 1.3; max-width: 90%; text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45); }
        .new-interface-info__tagline:empty { display: none !important; }
        body.ni-hide-tagline .new-interface-info__tagline,
        body.ni-hide-tagline .full-start__tagline,
        body.ni-hide-tagline .full-start-new__tagline,
        body.ni-hide-tagline .full-start-new__tagline-text,
        body.ni-hide-tagline .full-start__tagline-text,
        body.ni-hide-tagline .full-start-new__sub-tagline,
        body.ni-hide-tagline [class*="full-start"][class*="tagline"] { display: none !important; }
        body.light--version .new-interface-info__tagline { color: rgba(0, 0, 0, 0.75); text-shadow: none; }

        /* --- СКРЫТИЕ ОПИСАНИЯ (OVERVIEW) --- */
        body.ni-hide-description .new-interface-info__description { display: none !important; }

        /* --- АДАПТАЦИЯ ПОД МЕНЬШИЕ ЭКРАНЫ И ОКНА --- */
        @media (max-height: 820px) {
            .new-interface { --ni-info-h: clamp(14em, 32vh, 22em); }
            html:not(.is-smarttv) .new-interface { --ni-card-w: clamp(110px, 7.2vw, 160px); }
            .new-interface-info__right { padding-top: clamp(0.15em, 1.8vh, 1.2em); }
            .new-interface-info__title { font-size: clamp(2.4em, 3.6vw, 3.1em); }
            .new-interface-info__description { -webkit-line-clamp: 5; line-clamp: 5; margin-top: 0; }
            .new-interface-info__tagline { font-size: 0.95em; }
        }
        </style>`);

        $('body').append(Lampa.Template.get('new_interface_ultimate_styles', {}, true));
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    if (Lampa.Manifest.app_digital >= 300) {
        startPluginV3();
    } else {
        if (!window.plugin_interface_ready) {
            addStyleV3();
            startLegacyPlugin();
        }
    }

})();

/* =====================================================================
 * Marks Only — встроенный модуль (метки на постерах: качество, озвучка, рейтинг)
 * Источник: uafixmax (JacRed + UaFix), интегрирован в Logomax.
 * Добавлена настройка позиции меток: верх-лево, верх-право, низ-лево, низ-право.
 * ===================================================================== */
(function () {
    'use strict';

    if (typeof Lampa === 'undefined') {
        console.error('Marks: Lampa not found');
        return;
    }

    var POSITIONS = {
        'top-left':     'Сверху слева',
        'top-right':    'Сверху справа',
        'bottom-left':  'Снизу слева',
        'bottom-right': 'Снизу справа'
    };

    var SIZES = {
        'small':  'Мелкие',
        'medium': 'Средние',
        'large':  'Крупные'
    };

    var RADIUS = {
        'square': 'Без скругления',
        'small':  'Лёгкое',
        'medium': 'Среднее',
        'large':  'Сильное',
        'pill':   'Пилюля (полностью круглые края)'
    };

    function applyMarksPosition() {
        try {
            var body = document.body;
            var pos = Lampa.Storage.get('marks_position', 'top-left');
            Object.keys(POSITIONS).forEach(function (k) {
                body.classList.toggle('marks-pos-' + k, k === pos);
            });
            var size = Lampa.Storage.get('marks_size', 'medium');
            Object.keys(SIZES).forEach(function (k) {
                body.classList.toggle('marks-size-' + k, k === size);
            });
            var radius = Lampa.Storage.get('marks_radius', 'small');
            Object.keys(RADIUS).forEach(function (k) {
                body.classList.toggle('marks-radius-' + k, k === radius);
            });
        } catch (e) {}
    }

    function setupMarksSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

        Lampa.SettingsApi.addComponent({
            component: 'marks_flags',
            name: 'Метки на постерах',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21h6m-3-18v1m-6.36 1.64l.7.71m12.02-.71l-.7.71M4 12H3m18 0h-1M8 12a4 4 0 108 0 4 4 0 00-8 0zm-1 5h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { type: 'title' },
            field: { name: 'Положение и состав меток' }
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'marks_position', type: 'select', values: POSITIONS, default: 'top-left' },
            field: { name: 'Сторона карточки', description: 'С какой стороны постера показывать метки' },
            onChange: applyMarksPosition
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'marks_size', type: 'select', values: SIZES, default: 'medium' },
            field: { name: 'Размер меток', description: 'Мелкие / средние / крупные' },
            onChange: applyMarksPosition
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'marks_radius', type: 'select', values: RADIUS, default: 'small' },
            field: { name: 'Скругление меток', description: 'Степень скругления углов значков' },
            onChange: applyMarksPosition
        });

        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_ru', type: 'trigger', default: true },
            field: { name: 'Русская озвучка (🇷🇺)' }
        });
        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_ua', type: 'trigger', default: true },
            field: { name: 'Украинская озвучка (🇺🇦)' }
        });
        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_en', type: 'trigger', default: true },
            field: { name: 'Английская озвучка (🇬🇧)' }
        });
        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_4k', type: 'trigger', default: true },
            field: { name: 'Качество 4K' }
        });
        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_fhd', type: 'trigger', default: true },
            field: { name: 'Качество FHD/HD' }
        });
        Lampa.SettingsApi.addParam({
            component: 'marks_flags',
            param: { name: 'badge_hdr', type: 'trigger', default: true },
            field: { name: 'HDR / Dolby Vision' }
        });
    }

    function initMarksJacRed() {
        var workingProxy = null;
        var proxies = [
            'https://myfinder.kozak-bohdan.workers.dev/?key=lmp_2026_JacRed_K9xP7aQ4mV2E&url=',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?url='
        ];

        function fetchWithProxy(url, callback) {
            try {
                var network = new Lampa.Reguest();
                network.timeout(10000);
                network.silent(url, function (json) {
                    var text = typeof json === 'string' ? json : JSON.stringify(json);
                    workingProxy = 'direct';
                    callback(null, text);
                }, function () { tryProxies(url, callback); });
            } catch (e) { tryProxies(url, callback); }
        }

        function tryProxies(url, callback) {
            var proxyList = (workingProxy && workingProxy !== 'direct') ? [workingProxy] : proxies;
            function tryProxy(index) {
                if (index >= proxyList.length) { callback(new Error('No proxy worked')); return; }
                var p = proxyList[index];
                var target = p.indexOf('url=') > -1 ? p + encodeURIComponent(url) : p + url;
                var xhr = new XMLHttpRequest();
                xhr.open('GET', target, true);
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) { workingProxy = p; callback(null, xhr.responseText); }
                    else tryProxy(index + 1);
                };
                xhr.onerror = function () { tryProxy(index + 1); };
                xhr.timeout = 10000;
                xhr.ontimeout = function () { tryProxy(index + 1); };
                xhr.send();
            }
            tryProxy(0);
        }

        var _jacredCache = {};

        function getBestJacred(card, callback) {
            var cacheKey = 'jacred_v3_' + card.id;
            if (_jacredCache[cacheKey]) { callback(_jacredCache[cacheKey]); return; }
            try {
                var raw = Lampa.Storage.get(cacheKey, '');
                if (raw && typeof raw === 'object' && raw._ts && (Date.now() - raw._ts < 48 * 60 * 60 * 1000)) {
                    _jacredCache[cacheKey] = raw; callback(raw); return;
                }
            } catch (e) {}

            var title = (card.original_title || card.title || card.name || '').toLowerCase();
            var year = (card.release_date || card.first_air_date || '').substr(0, 4);
            if (!title || !year) { callback(null); return; }

            var releaseDate = new Date(card.release_date || card.first_air_date);
            if (releaseDate && releaseDate.getTime() > Date.now()) { callback(null); return; }

            var apiUrl = 'https://jr.maxvol.pro/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;
            fetchWithProxy(apiUrl, function (err, data) {
                if (err || !data) { callback(null); return; }
                try {
                    var parsed;
                    try { parsed = JSON.parse(data); } catch (e) { callback(null); return; }
                    if (parsed.contents) { try { parsed = JSON.parse(parsed.contents); } catch (e) {} }
                    var results = Array.isArray(parsed) ? parsed : (parsed.Results || []);
                    if (!results.length) {
                        var emptyData = { empty: true, _ts: Date.now() };
                        _jacredCache[cacheKey] = emptyData;
                        try { Lampa.Storage.set(cacheKey, emptyData); } catch (e) {}
                        callback(null); return;
                    }
                    var best = { resolution: 'SD', ukr: false, rus: false, eng: false, hdr: false };
                    var resOrder = ['SD', 'HD', 'FHD', '2K', '4K'];
                    results.forEach(function (item) {
                        var t = (item.title || '').toLowerCase();
                        var currentRes = 'SD';
                        if (t.indexOf('4k') >= 0 || t.indexOf('2160') >= 0 || t.indexOf('uhd') >= 0) currentRes = '4K';
                        else if (t.indexOf('2k') >= 0 || t.indexOf('1440') >= 0) currentRes = '2K';
                        else if (t.indexOf('1080') >= 0 || t.indexOf('fhd') >= 0 || t.indexOf('full hd') >= 0) currentRes = 'FHD';
                        else if (t.indexOf('720') >= 0 || t.indexOf('hd') >= 0) currentRes = 'HD';
                        if (resOrder.indexOf(currentRes) > resOrder.indexOf(best.resolution)) best.resolution = currentRes;
                        if (t.indexOf('ukr') >= 0 || t.indexOf('укр') >= 0 || t.indexOf('ua') >= 0 || t.indexOf('ukrainian') >= 0) best.ukr = true;
                        if (t.indexOf('rus') >= 0 || t.indexOf('russian') >= 0 || t.indexOf('ru') >= 0) best.rus = true;
                        if (t.indexOf('eng') >= 0 || t.indexOf('english') >= 0 || t.indexOf('multi') >= 0) best.eng = true;
                        if (t.indexOf('dolby vision') >= 0 || t.indexOf('dolbyvision') >= 0) { best.hdr = true; best.dolbyVision = true; }
                        else if (t.indexOf('hdr') >= 0) best.hdr = true;
                    });
                    if (card.original_language === 'uk') best.ukr = true;
                    if (card.original_language === 'ru') best.rus = true;
                    if (card.original_language === 'en') best.eng = true;
                    best._ts = Date.now();
                    _jacredCache[cacheKey] = best;
                    try { Lampa.Storage.set(cacheKey, best); } catch (e) {}
                    callback(best);
                } catch (e) { callback(null); }
            });
        }

        function createBadge(cssClass, content) {
            var badge = document.createElement('div');
            badge.classList.add('card__mark');
            badge.classList.add('card__mark--' + cssClass);
            badge.textContent = content;
            return badge;
        }

        function injectFullCardMarks(movie, renderEl) {
            if (!movie || !movie.id || !renderEl) return;
            var $render = $(renderEl);
            var rateLine = $render.find('.full-start-new__rate-line').first();
            if (!rateLine.length) return;
            if (rateLine.find('.jacred-info-marks-v2').length) return;
            var marksContainer = $('<div class="jacred-info-marks-v2"></div>');
            rateLine.prepend(marksContainer);
            getBestJacred(movie, function (data) {
                if (data && !data.empty) renderInfoRowBadges(marksContainer, data);
            });
        }

        function initFullCardMarks() {
            if (!Lampa.Listener || !Lampa.Listener.follow) return;
            Lampa.Listener.follow('full', function (e) {
                if (e.type !== 'complite') return;
                var movie = e.data && e.data.movie;
                var renderEl = e.object && e.object.activity && e.object.activity.render && e.object.activity.render();
                injectFullCardMarks(movie, renderEl);
            });
            setTimeout(function () {
                try {
                    var act = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
                    if (!act || act.component !== 'full') return;
                    var movie = act.card || act.movie;
                    var renderEl = act.activity && act.activity.render && act.activity.render();
                    injectFullCardMarks(movie, renderEl);
                } catch (err) {}
            }, 300);
        }

        function processCards() {
            $('.card:not(.jacred-mark-processed-v2)').each(function () {
                var card = $(this);
                card.addClass('jacred-mark-processed-v2');
                var movie = card[0].heroMovieData || card.data('item') || (card[0] && (card[0].card_data || card[0].item)) || null;
                if (movie && movie.id && !movie.size) {
                    addMarksToContainer(card, movie, '.card__view');
                }
            });
        }

        function observeCardRows() {
            var observer = new MutationObserver(function () { processCards(); });
            observer.observe(document.body, { childList: true, subtree: true });
            processCards();
        }

        function renderInfoRowBadges(container, data) {
            container.empty();
            if (data.rus && Lampa.Storage.get('badge_ru', true)) { container.append($('<div class="full-start__pg"></div>').text('🇷🇺')); }
            if (data.ukr && Lampa.Storage.get('badge_ua', true)) { container.append($('<div class="full-start__pg"></div>').text('🇺🇦')); }
            if (data.eng && Lampa.Storage.get('badge_en', true)) { container.append($('<div class="full-start__pg"></div>').text('🇬🇧')); }
            if (data.resolution && data.resolution !== 'SD') {
                var resText = data.resolution;
                if (resText === 'FHD') resText = '1080p';
                else if (resText === 'HD') resText = '720p';
                container.append($('<div class="full-start__pg"></div>').text(resText));
            }
            if (data.hdr) container.append($('<div class="full-start__pg"></div>').text(data.dolbyVision ? 'Dolby Vision' : 'HDR'));
        }

        var _uafixCache = {};

        function checkUafixDirect(movie, callback) {
            var query = movie.original_title || movie.original_name || movie.title || movie.name || '';
            if (!query) return callback(false);
            var searchUrl = 'https://uafix.net/index.php?do=search&subaction=search&story=' + encodeURIComponent(query);
            fetchWithProxy(searchUrl, function (err, html) {
                if (err || !html) return callback(false);
                var hasResults = html.indexOf('знайдено') >= 0 && html.indexOf('0 відповідей') < 0;
                callback(hasResults);
            });
        }

        function checkUafix(movie, callback) {
            if (!movie || !movie.id) return callback(false);
            var key = 'uafix_v2_' + movie.id;
            if (_uafixCache[key] !== undefined) return callback(_uafixCache[key]);
            var storageVal = Lampa.Storage.get(key, '');
            if (storageVal !== '') {
                var isFound = (storageVal === 'true' || storageVal === true);
                _uafixCache[key] = isFound;
                return callback(isFound);
            }
            checkUafixDirect(movie, function (found) {
                _uafixCache[key] = found;
                try { Lampa.Storage.set(key, found ? 'true' : 'false'); } catch (e) {}
                callback(found);
            });
        }

        function addMarksToContainer(element, movie, viewSelector) {
            var containerParent = viewSelector ? element.find(viewSelector) : element;
            if (!containerParent.length) containerParent = element;
            var marksContainer = containerParent.find('.card-marks');
            if (!marksContainer.length) {
                marksContainer = $('<div class="card-marks"></div>');
                containerParent.append(marksContainer);
            }
            if (movie.has_ua !== undefined || movie.quality !== undefined) {
                var staticData = {
                    ukr: movie.has_ua === true,
                    rus: false,
                    resolution: movie.quality || 'SD',
                    hdr: movie.is_hdr === true,
                    eng: false
                };
                renderBadges(marksContainer, staticData, movie);
                return;
            }
            getBestJacred(movie, function (data) {
                if (!data) data = { empty: true };
                checkUafix(movie, function (hasUafix) {
                    if (hasUafix && data) { data.ukr = true; data.empty = false; }
                    if (data && !data.empty) renderBadges(marksContainer, data, movie);
                });
            });
        }

        function renderBadges(container, data, movie) {
            container.empty();
            if (data.rus && Lampa.Storage.get('badge_ru', true)) container.append(createBadge('ru', '🇷🇺'));
            if (data.ukr && Lampa.Storage.get('badge_ua', true)) container.append(createBadge('ua', '🇺🇦'));
            if (data.eng && Lampa.Storage.get('badge_en', true)) container.append(createBadge('en', '🇬🇧'));
            if (data.resolution && data.resolution !== 'SD') {
                if (data.resolution === '4K' && Lampa.Storage.get('badge_4k', true)) container.append(createBadge('4k', '4K'));
                else if (data.resolution === 'FHD' && Lampa.Storage.get('badge_fhd', true)) container.append(createBadge('fhd', 'FHD'));
                else if (data.resolution === 'HD' && Lampa.Storage.get('badge_fhd', true)) container.append(createBadge('hd', 'HD'));
                else if (Lampa.Storage.get('badge_fhd', true)) container.append(createBadge('hd', data.resolution));
            }
            if (data.hdr && Lampa.Storage.get('badge_hdr', true)) container.append(createBadge('hdr', 'HDR'));
            if (movie) {
                var rating = parseFloat(movie.imdb_rating || movie.kp_rating || movie.vote_average || 0);
                if (rating > 0) {
                    var rBadge = document.createElement('div');
                    rBadge.classList.add('card__mark', 'card__mark--rating');
                    rBadge.innerHTML = '<span class="mark-star">★</span>' + rating.toFixed(1);
                    container.append(rBadge);
                }
            }
        }

        var style = document.createElement('style');
        style.innerHTML = `
            .card .card__type { left: -0.2em !important; }

            /* Базовый контейнер меток — позиционирование задаётся классом на body */
            .card-marks {
                position: absolute;
                display: flex;
                flex-direction: column;
                gap: 0.15em;
                z-index: 10;
                pointer-events: none;
                max-width: 70%;
            }

            /* === Положения меток === */
            /* По умолчанию (без класса) — сверху слева, как раньше */
            body:not(.marks-pos-top-left):not(.marks-pos-top-right):not(.marks-pos-bottom-left):not(.marks-pos-bottom-right) .card-marks,
            body.marks-pos-top-left .card-marks {
                top: 2.7em; left: -0.2em; right: auto; bottom: auto;
                align-items: flex-start;
            }
            body.marks-pos-top-right .card-marks {
                top: 2.7em; right: -0.2em; left: auto; bottom: auto;
                align-items: flex-end;
            }
            body.marks-pos-bottom-left .card-marks {
                bottom: 0.6em; left: -0.2em; right: auto; top: auto;
                align-items: flex-start;
            }
            body.marks-pos-bottom-right .card-marks {
                bottom: 0.6em; right: -0.2em; left: auto; top: auto;
                align-items: flex-end;
            }

            /* На карточках фильмов в верхней позиции сдвигаем выше (нет ленты top) */
            body:not(.marks-pos-top-left):not(.marks-pos-top-right):not(.marks-pos-bottom-left):not(.marks-pos-bottom-right) .card:not(.card--tv):not(.card--movie) .card-marks,
            body:not(.marks-pos-top-left):not(.marks-pos-top-right):not(.marks-pos-bottom-left):not(.marks-pos-bottom-right) .card--movie .card-marks,
            body.marks-pos-top-left .card:not(.card--tv):not(.card--movie) .card-marks,
            body.marks-pos-top-left .card--movie .card-marks,
            body.marks-pos-top-right .card:not(.card--tv):not(.card--movie) .card-marks,
            body.marks-pos-top-right .card--movie .card-marks {
                top: 1.4em;
            }

            .card__mark {
                padding: 0.35em 0.45em;
                font-size: 0.8em;
                font-weight: 800;
                line-height: 1;
                letter-spacing: 0.03em;
                border-radius: 0.3em;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                align-self: flex-start;
                border: 1px solid rgba(255,255,255,0.15);
            }
            body.marks-pos-top-right .card__mark,
            body.marks-pos-bottom-right .card__mark { align-self: flex-end; }

            /* === Размер меток === */
            body.marks-size-small  .card__mark { font-size: 0.65em; padding: 0.25em 0.35em; }
            body.marks-size-medium .card__mark { font-size: 0.8em;  padding: 0.35em 0.45em; }
            body.marks-size-large  .card__mark { font-size: 1.0em;  padding: 0.45em 0.6em; }
            body.marks-size-small  .card__mark--ru,
            body.marks-size-small  .card__mark--ua,
            body.marks-size-small  .card__mark--en { font-size: 0.85em; padding: 0.2em 0.3em; }
            body.marks-size-medium .card__mark--ru,
            body.marks-size-medium .card__mark--ua,
            body.marks-size-medium .card__mark--en { font-size: 1em; padding: 0.25em 0.35em; }
            body.marks-size-large  .card__mark--ru,
            body.marks-size-large  .card__mark--ua,
            body.marks-size-large  .card__mark--en { font-size: 1.25em; padding: 0.3em 0.45em; }
            body.marks-size-small  .card__mark--rating { font-size: 0.6em; }
            body.marks-size-large  .card__mark--rating { font-size: 0.95em; }

            /* === Скругление меток === */
            body.marks-radius-square .card__mark { border-radius: 0 !important; }
            body.marks-radius-small  .card__mark { border-radius: 0.3em !important; }
            body.marks-radius-medium .card__mark { border-radius: 0.55em !important; }
            body.marks-radius-large  .card__mark { border-radius: 0.85em !important; }
            body.marks-radius-pill   .card__mark { border-radius: 999px !important; }

            .card__mark--ru  { background: linear-gradient(135deg, #b71c1c, #f44336); color: #fff; border-color: rgba(244,67,54,0.4); }
            .card__mark--ua  { background: linear-gradient(135deg, #1565c0, #42a5f5); color: #fff; border-color: rgba(66,165,245,0.4); }
            .card__mark--en  { background: linear-gradient(135deg, #37474f, #78909c); color: #fff; border-color: rgba(120,144,156,0.4); }
            .card__mark--4k  { background: linear-gradient(135deg, #e65100, #ff9800); color: #fff; border-color: rgba(255,152,0,0.4); }
            .card__mark--fhd { background: linear-gradient(135deg, #4a148c, #ab47bc); color: #fff; border-color: rgba(171,71,188,0.4); }
            .card__mark--hd  { background: linear-gradient(135deg, #1b5e20, #66bb6a); color: #fff; border-color: rgba(102,187,106,0.4); }
            .card__mark--hdr { background: linear-gradient(135deg, #f57f17, #ffeb3b); color: #000; border-color: rgba(255,235,59,0.4); }
            .card__mark--rating {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: #ffd700;
                border-color: rgba(255,215,0,0.3);
                font-size: 0.75em;
                white-space: nowrap;
            }
            .card__mark--rating .mark-star { margin-right: 0.15em; font-size: 0.9em; }
            .card.jacred-mark-processed-v2 .card__vote { display: none !important; }
            .jacred-info-marks-v2 { display: flex; flex-direction: row; gap: 0.5em; margin-right: 1em; align-items: center; }
            .card__mark--ru, .card__mark--ua, .card__mark--en { font-size: 1em; padding: 0.25em 0.35em; }
        `;
        document.head.appendChild(style);

        initFullCardMarks();
        observeCardRows();
    }

    function init() {
        setupMarksSettings();
        applyMarksPosition();
        initMarksJacRed();
    }

    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
