(function () {
    'use strict';

    if (document.currentScript && document.currentScript.src.indexOf('ko31k') === -1) {
        return;
    }

    if (typeof Lampa === 'undefined') return;

    // ========== 1. ПЕРЕВІРКА SMART TV ==========
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

    // ========== 2. НАЛАШТУВАННЯ ТА ДИНАМІЧНІ СТИЛІ ==========
    const LOGO_CACHE_PREFIX = 'logo_cache_ultimate_v7_';

    function applyDynamicStyles() {
        try {
            const root = document.documentElement;
            
            // Висота логотипів
            const h = Lampa.Storage.get('ni_logo_height', '');
            if (h) {
                root.style.setProperty('--ni-logo-max-h', h);
            } else {
                root.style.removeProperty('--ni-logo-max-h');
            }

            // Висота логотипів на картках
            const hc = Lampa.Storage.get('ni_card_logo_height', '4.5vh');
            root.style.setProperty('--ni-card-logo-h', hc);

            // Ліміт рядків опису
            root.style.setProperty('--ni-desc-lines', Lampa.Storage.get('ni_desc_lines', '7'));
            
            // Розмір шрифту опису
            root.style.setProperty('--ni-desc-font-size', Lampa.Storage.get('ni_desc_font_size', '0.87em'));

            // Відступ від інфо-блоку
            root.style.setProperty('--ni-info-margin', Lampa.Storage.get('ni_info_margin', '0'));

            // Керування відображенням
            const body = document.body;
            body.classList.toggle('ni-hide-rate', !Lampa.Storage.get('ni_show_rate', true));
            body.classList.toggle('ni-hide-pg', !Lampa.Storage.get('ni_show_pg', true));
            body.classList.toggle('ni-hide-year', !Lampa.Storage.get('ni_show_year', true));
            body.classList.toggle('ni-hide-runtime', !Lampa.Storage.get('ni_show_runtime', true));
            body.classList.toggle('ni-hide-card-logos', !Lampa.Storage.get('ni_card_logos', true));
            body.classList.toggle('ni-hide-captions', !Lampa.Storage.get('ni_card_captions', true));
            
            // Розкладка інфо-блоку
            const layout = Lampa.Storage.get('ni_info_layout', '2col');
            body.classList.toggle('ni-layout-1col', layout === '1col');
            body.classList.toggle('ni-layout-2col', layout === '2col');
            body.classList.toggle('ni-layout-title-only', layout === 'title_only');
            body.classList.toggle('ni-layout-none', layout === 'none');

            // Орієнтація карток
            const cardType = Lampa.Storage.get('ni_card_type', 'horizontal');
            body.classList.toggle('ni-cards-vertical', cardType === 'vertical');

            // Відображення логотипів
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
            name: 'Новий Інтерфейс',
            icon: `<svg viewBox="0 -1 22 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>interface / 10 - interface, distribute, vertically, align icon</title> <g id="Free-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"> <g transform="translate(-820.000000, -600.000000)" id="Group" stroke="currentColor" stroke-width="2"> <g transform="translate(819.000000, 598.000000)" id="Shape"> <line x1="2" y1="21" x2="22" y2="21"> </line> <line x1="2" y1="3" x2="22" y2="3"> </line> <path d="M17,17 L7,17 C5.8954305,17 5,16.1045695 5,15 L5,9 C5,7.8954305 5.8954305,7 7,7 L17,7 C18.1045695,7 19,7.8954305 19,9 L19,15 C19,16.1045695 18.1045695,17 17,17 Z"> </path> </g> </g> </g> </g></svg>`
        });

        const add = (cfg) => { try { Lampa.SettingsApi.addParam(cfg); } catch (e) {} };

        // --- ОСНОВНІ НАЛАШТУВАННЯ ІНТЕРФЕЙСУ ---
        add({
            component: 'new_interface',
            param: { name: 'ni_card_type', type: 'select', values: { horizontal: 'Широкі (Горизонтальні)', vertical: 'Стандартні (Вертикальні)' }, default: 'horizontal' },
            field: { name: 'Орієнтація карток', description: 'Формат постерів<br>(Зміна автоматично перезавантажить сторінку)' },
            onChange: function() { window.location.reload(); }
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_info_layout', type: 'select', values: { '2col': 'У дві колонки (Опис справа)', '1col': 'В одну колонку (Опис зліва)', 'title_only': 'Тільки назва/логотип', 'none': 'Не показувати інфо-блок' }, default: '2col' },
            field: { name: 'Дизайн інфо-блоку', description: 'Розташування тексту зверху екрана.' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_info_margin_btn', type: 'button' },
            field: { 
                name: 'Відступ від інфо-блоку', 
                description: 'Вказуйте значення у vh, em або px (наприклад: 5vh або -2em).<br>За замовчуванням: 0' 
            },
            onChange: function () {
                if (typeof Lampa.Input !== 'undefined') {
                    Lampa.Input.edit({
                        title: 'Введіть відступ (напр. 5vh, -2em)',
                        value: Lampa.Storage.get('ni_info_margin', '0'),
                        free: true,
                        nosave: true,
                        onChange: function (val) {
                            // Динамічно показуємо зміну прямо під час вводу
                            document.documentElement.style.setProperty('--ni-info-margin', val);
                        }
                    }, function (new_value) {
                        if (new_value !== undefined) {
                            // Зберігаємо і застосовуємо
                            Lampa.Storage.set('ni_info_margin', new_value);
                            applyDynamicStyles();
                        } else {
                            // Якщо скасували ввід (натиснули Назад) — повертаємо старе значення
                            applyDynamicStyles();
                        }
                    });
                }
            }
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_desc_lines', type: 'select', values: { '2': '2 рядки', '3': '3 рядки', '4': '4 рядки', '5': '5 рядків', '7': '7 рядків', '10': '10 рядків' }, default: '6' },
            field: { name: 'Ліміт рядків опису', description: 'Максимальна кількість рядків в описі фільму' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { 
                name: 'ni_desc_font_size', 
                type: 'select', 
                values: { '0.7em': 'Мінімальний (0.7em)', '0.75em': '0.75em', '0.8em': '0.8em', '0.87em': 'Стандартний (0.87em)', '0.9em': '0.9em', '0.95em': '0.95em', '1em': '1em', '1.05em': '1.05em', '1.1em': '1.1em', '1.15em': '1.15em', '1.2em': 'Великий (1.2em)', '1.3em': 'Дуже великий (1.3em)', '1.4em': 'Максимальний (1.4em)' }, 
                default: '0.87em' 
            },
            field: { name: 'Розмір шрифту опису', description: 'Керування розміром тексту в інфо-блоці' },
            onChange: applyDynamicStyles
        });

        // --- ВІДОБРАЖЕННЯ ЕЛЕМЕНТІВ ---
        add({
            component: 'new_interface',
            param: { name: 'ni_show_year', type: 'trigger', default: true },
            field: { name: 'Показувати рік та країну', description: 'Відображення року випуску та країни' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_show_rate', type: 'trigger', default: true },
            field: { name: 'Показувати рейтинг', description: 'Відображення оцінки фільму' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_show_runtime', type: 'trigger', default: true },
            field: { name: 'Показувати тривалість', description: 'Відображення тривалості фільму' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_show_pg', type: 'trigger', default: true },
            field: { name: 'Показувати віковий рейтинг (PG)', description: 'Відображення обмежень за віком (наприклад, 16+)' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_card_captions', type: 'trigger', default: true },
            field: { name: 'Підписи під картками', description: 'Показувати текстові назви під постерами' },
            onChange: applyDynamicStyles
        });

        // --- НАЛАШТУВАННЯ ЛОГОТИПІВ НА КАРТКАХ ---
        add({
            component: 'new_interface',
            param: { name: 'ni_card_logos', type: 'trigger', default: true },
            field: { name: 'Логотипи на картках', description: 'Показувати графічні лого поверх постерів' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: {
                name: 'ni_card_logo_height',
                type: 'select',
                values: { '3vh': 'Маленький (3vh)', '4.5vh': 'Стандартний (4.5vh)', '6vh': 'Великий (6vh)', '8vh': 'Дуже великий (8vh)', '12vh': 'Максимальний (12vh)' },
                default: '4.5vh'
            },
            field: { name: 'Розмір логотипів на картках', description: 'Керування висотою зображення всередині постера' },
            onChange: applyDynamicStyles
        });

        // --- НАЛАШТУВАННЯ ЛОГОТИПІВ ---
        add({
            component: 'new_interface',
            param: { 
                name: 'ni_logo_glav', 
                type: 'select', 
                values: { 'both': 'Показати Обидва', 'info': 'Тільки в Інфо-блоці', 'full': 'Тільки в Повній картці', 'none': 'Приховати' }, 
                default: 'both' 
            },
            field: { name: 'Логотипи (Інфо-блок та Повна картка)', description: 'Де відображати графічні логотипи замість тексту' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: {
                name: 'ni_logo_lang',
                type: 'select',
                values: { '': 'Як в Lampa', en: 'English', uk: 'Українська', be: 'Беларуская', kz: 'Қазақша', pt: 'Português', es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano' },
                default: ''
            },
            field: { name: 'Мова логотипа', description: 'Пріоритетна мова для пошуку логотипа' }
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_logo_size', type: 'select', values: { w300: 'w300', w500: 'w500', w780: 'w780', original: 'Оригінал' }, default: 'original' },
            field: { name: 'Якість логотипа', description: 'Роздільна здатність завантажуваного зображення' }
        });

        add({
            component: 'new_interface',
            param: {
                name: 'ni_logo_height',
                type: 'select',
                values: { '': 'Авто (стандарт)', '1.5em': '1.5em', '2em': '2em', '2.5em': '2.5em', '3em': '3em', '4em': '4em', '5em': '5em', '6em': '6em', '7em': '7em', '8em': '8em', '10em': '10em' },
                default: ''
            },
            field: { name: 'Висота логотипів в інфо-блоці', description: 'Максимальний розмір зображення в Інфо-блоці' },
            onChange: applyDynamicStyles
        });

        add({
            component: 'new_interface',
            param: { name: 'ni_logo_clear_cache', type: 'button' },
            field: { name: 'Очистити кеш логотипів', description: 'Натисніть для видалення збережених зображень' },
            onChange: function () {
                Lampa.Select.show({
                    title: 'Очистити кеш?',
                    items: [{ title: 'Так', confirm: true }, { title: 'Ні' }],
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

    // ========== 3. ДИНАМІЧНИЙ РУШІЙ ЛОГОТИПІВ ==========
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

    // Обробка повної картки фільму
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

    // ========== 4. ОБРОБКА ТЕКСТУ ПІД КАРТКОЮ ==========
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

    // ========== 5. ЛОГІКА ДЛЯ LAMPA v3.0.0+ ==========
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
            const element = args && args[0];
            if (this.__newInterfaceEnabled && element) {
                if (Lampa.Storage.get('ni_card_type', 'horizontal') === 'horizontal' && Array.isArray(element.results)) {
                    Lampa.Utils.extendItemsParams(element.results, { style: { name: 'wide' } });
                }
            }
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

        if (Lampa.Storage.get('ni_card_type', 'horizontal') === 'horizontal') {
            card.params = card.params || {};
            card.params.style = card.params.style || {};
            if (!card.params.style.name) card.params.style.name = 'wide';
        }

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

    // ========== 6. КЛАС ОПИСУ (InterfaceInfo) ==========
    class InterfaceInfo {
        constructor() { this.html = null; this.timer = null; this.network = new Lampa.Reguest(); this.loaded = {}; }

        create() {
            if (this.html) return;
            this.html = $(`<div class="new-interface-info">
                <div class="new-interface-info__body">
                    <div class="new-interface-info__left">
                        <div class="new-interface-info__head"></div>
                        <div class="new-interface-info__title"></div>
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

    // ========== 7. ПІДТРИМКА СТАРИХ ВЕРСІЙ (Lampa < 3.0.0) ==========
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
            if (step > 0) _this2.down();else if (active > 0) _this2.up();
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
        
        let isWide = Lampa.Storage.get('ni_card_type', 'horizontal') === 'horizontal';

        var item = new Lampa.InteractionLine(element, {
          url: element.url,
          card_small: true,
          cardClass: element.cardClass,
          genres: object.genres,
          object: object,
          card_wide: isWide,
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
        
        item.items.forEach(card => {
            if (card && card.use) {
                const origVisible = card.onVisible;
                const origUpdate = card.onUpdate;
                card.use({
                    onVisible() { if(origVisible) origVisible.call(card); updateCardTitle(card); Logo.applyToCard(card); },
                    onUpdate() { if(origUpdate) origUpdate.call(card); updateCardTitle(card); Logo.applyToCard(card); }
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

    // ========== 8. ГЛОБАЛЬНІ CSS СТИЛІ ==========
    function addStyleV3() {
        if (addStyleV3.added) return;
        addStyleV3.added = true;

        Lampa.Template.add('new_interface_ultimate_styles', `<style>
        :root {
            --ni-logo-max-h-auto: 8.5em; /* Дефолтна висота в em */
            --ni-logo-max-h: var(--ni-logo-max-h-user, var(--ni-logo-max-h-auto));
            --ni-card-logo-h: 4.5vh;
            --ni-desc-lines: 7;
            --ni-desc-font-size: 0.87em;
            --ni-info-margin: 0;
        }
        
        /* Висота інфо-блоку залежно від орієнтації карток */
        body.ni-cards-vertical .new-interface { position: relative; --ni-info-h: clamp(14em, 32vh, 24em); }
        body:not(.ni-cards-vertical) .new-interface { position: relative; --ni-info-h: clamp(18em, 46vh, 34em); }

        @keyframes ni-fade { from { opacity: 0; } to { opacity: 1; } }

        /* --- КЕРУВАННЯ ВІДОБРАЖЕННЯМ ЧЕРЕЗ НАЛАШТУВАННЯ --- */
        body.ni-layout-none .new-interface-info { display: none !important; }
        body.ni-layout-none .new-interface { --ni-info-h: 0px !important; }

        /* Тільки назва/логотип */
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
        
        /* Підписи під картками */
        body.ni-hide-captions .new-interface .card__view ~ .card__title,
        body.ni-hide-captions .new-interface .card__view ~ .card__name,
        body.ni-hide-captions .new-interface .card__view ~ .card__text,
        body.ni-hide-captions .new-interface .card__view ~ .card__details,
        body.ni-hide-captions .new-interface .card__view ~ .card__year,
        body.ni-hide-captions .new-interface .card__bottom { display: none !important; }
        body.ni-hide-captions .new-interface .card > *:not(.card__view):not(.card__promo) { display: none !important; }

        /* Прибираємо "сміття" Lampa поверх логотипів на картках */
        body:not(.ni-hide-card-logos) .new-interface-card-title { display: none !important; }

        /* --- КАРТКИ: Горизонтальні vs Вертикальні --- */
        body:not(.ni-cards-vertical) .new-interface .card.card--wide,
        body:not(.ni-cards-vertical) .new-interface .card--small.card--wide { width: 18.3em !important; }
        body:not(.ni-cards-vertical) .new-interface .card-more__box,
        body:not(.ni-cards-vertical) .new-interface .card.card--wide + .card-more .card-more__box { padding-bottom: 95%; }
        
        body.ni-cards-vertical html:not(.is-smarttv) .new-interface { --ni-card-w: clamp(120px, 7.6vw, 170px); }
        body.ni-cards-vertical html:not(.is-smarttv) .new-interface .card--small,
        body.ni-cards-vertical html:not(.is-smarttv) .new-interface .card-more { width: var(--ni-card-w) !important; }
        body.ni-cards-vertical html:not(.is-smarttv) .new-interface .card-more__box { padding-bottom: 150%; }

        /* Динамічні Логотипи на картках */
        .new-interface .card .card__view { position: relative; }
        .new-interface-card-logo { display: none; position: absolute; left: 0; top: 0; right: 0; bottom: 0; box-sizing: border-box; pointer-events: none; z-index: 1; border-radius: inherit; overflow: hidden; }
        .new-interface-card-logo::before { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 60%; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); z-index: -1; }
        body:not(.ni-hide-card-logos) .card.has-logo .new-interface-card-logo { display: block; }
        body:not(.ni-hide-card-logos) .card.has-logo .new-interface-card-title { display: none !important; }
        .new-interface .new-interface-card-logo img { position: absolute; bottom: 0.45em; left: 5%; right: 5%; display: block; max-width: 90%; max-height: min(var(--ni-card-logo-h), 92%); width: auto; height: auto; object-fit: contain; object-position: center bottom; margin: 0 auto; }

        /* --- ІНФО-БЛОК --- */
        .new-interface-info { position: relative; padding: 1.5em; height: var(--ni-info-h); overflow: hidden; z-index: 3; margin-bottom: var(--ni-info-margin); }
        .new-interface-info:before { display: none !important; }
        
        .new-interface-info__body { position: relative; z-index: 1; width: min(96%, 78em); padding-top: 1.1em; height: 100%; box-sizing: border-box; }
        
        /* Розкладка 2 колонки (Flexbox для притискання до правого краю) */
        body.ni-layout-2col .new-interface-info__body { display: flex; justify-content: space-between; gap: 2em; align-items: flex-start; width: 100%; max-width: 100%; padding-right: 1.5em; }
        body.ni-layout-2col .new-interface-info__left { flex: 1; min-width: 0; }
        body.ni-layout-2col .new-interface-info__right { flex: 0 0 40%; max-width: 36em; padding-top: 0; padding-bottom: clamp(0.8em, 2.4vh, 2.0em); display: flex; flex-direction: column; margin-left: auto; }
        body.ni-layout-2col .new-interface-info__textblock { display: flex; flex-direction: column; gap: 0.55em; }
        
        /* Розкладка 1 колонка */
        body.ni-layout-1col .new-interface-info__body { display: flex; flex-direction: column; max-width: 70em; gap: 0.5em; }
        body.ni-layout-1col .new-interface-info__left { flex: 0 0 auto; }
        body.ni-layout-1col .new-interface-info__right { padding-top: 0.5em; flex: 1 1 auto; overflow: hidden; display: flex; flex-direction: column; }
        body.ni-layout-1col .new-interface-info__textblock { margin-top: 0; display: flex; flex-direction: column; gap: 0.5em; }
        body.ni-layout-1col .new-interface-info__description { max-width: 60%; } /* Зменшено на чверть */
        
        .new-interface-info__head { color: rgba(255, 255, 255, 0.6); margin-bottom: 1em; font-size: 1.3em; min-height: 1em; }
        .new-interface-info__head span { color: #fff; }
        .new-interface-info__title { font-size: clamp(2.6em, 4.0vw, 3.6em); font-weight: 600; margin-bottom: 0.3em; line-height: 1.25; }
        
        /* Динамічні Логотипи Інфо-блоку та Повної картки */
        .ni-title-logo-wrap { display: none; font-size: 1rem; margin-bottom: 0.5em; }
        body.ni-logo-info-on .new-interface-info__title.has-logo .ni-title-logo-wrap { display: block; }
        body.ni-logo-info-on .new-interface-info__title.has-logo .ni-title-text { display: none !important; }
        
        body.ni-logo-full-on .full-start-new__title.has-logo .ni-title-logo-wrap,
        body.ni-logo-full-on .full-start__title.has-logo .ni-title-logo-wrap { display: block; }
        body.ni-logo-full-on .full-start-new__title.has-logo .ni-title-text,
        body.ni-logo-full-on .full-start__title.has-logo .ni-title-text { display: none !important; }

        .new-interface-info__title-logo, .new-interface-full-logo { max-width: 100%; max-height: var(--ni-logo-max-h); display: block; object-fit: contain; object-position: left bottom; }
        .new-interface-full-logo { margin-top: 0.25em; }
        
        /* Щільне групування метаданих */
        .new-interface-info__meta-top { display: flex; align-items: center; justify-content: flex-start; gap: 0.75em; flex-wrap: nowrap; min-height: 1.9em; min-width: 0; }
        .new-interface-info__genres { flex: 0 1 auto; font-size: 1.1em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } 
        .new-interface-info__runtime { flex: 0 0 auto; font-size: 1.05em; }
        .new-interface-info__dot { flex: 0 0 auto; font-size: 0.85em; opacity: 0.75; }
        .new-interface-info__pg .full-start__pg { font-size: 0.95em; }

        .new-interface-info__description { font-size: var(--ni-desc-font-size); font-weight: 300; line-height: 1.38; color: rgba(255, 255, 255, 0.90); text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45); overflow: hidden; display: -webkit-box; -webkit-line-clamp: var(--ni-desc-lines); line-clamp: var(--ni-desc-lines); -webkit-box-orient: vertical; }

        .new-interface .full-start__background { height: 108%; top: -6em; }
        .new-interface .full-start__rate { font-size: 1.3em; margin-right: 0; }
        .new-interface .card__promo, .new-interface .card .card-watched { display: none !important; }
        
        /* Зсув ліній вгору/вниз залежно від орієнтації */
        'body.ni-cards-vertical html:not(.is-smarttv) .new-interface-h { --ni-line-head-shift: -2vh; --ni-line-body-shift: -3vh; }' +
        'body.ni-cards-vertical html.is-smarttv .new-interface-h { --ni-line-head-shift: 0; --ni-line-body-shift: 0; }' +
        'body:not(.ni-cards-vertical) .new-interface-h { --ni-line-head-shift: 0; --ni-line-body-shift: 0; }' +

        /* КОМПЕНСАЦІЯ: Опускаємо рядки вниз, якщо підписи вимкнені */
        'body.ni-hide-captions:not(.ni-cards-vertical) .new-interface-h { --ni-line-head-shift: 5vh; --ni-line-body-shift: 5vh; }' +
        'body.ni-hide-captions.ni-cards-vertical html:not(.is-smarttv) .new-interface-h { --ni-line-head-shift: 2vh; --ni-line-body-shift: 2vh; }' +
        'body.ni-hide-captions.ni-cards-vertical html.is-smarttv .new-interface-h { --ni-line-head-shift: 4vh; --ni-line-body-shift: 4vh; }' +

        '.new-interface-h .items-line__head { position: relative; top: var(--ni-line-head-shift); z-index: 2; }' +
        '.new-interface-h .items-line__body > .scroll.scroll--horizontal { position: relative; top: var(--ni-line-body-shift); z-index: 1; }' +

        /* Світла тема */
        body.light--version .new-interface-info__head { color: rgba(0, 0, 0, 0.7); }
        body.light--version .new-interface-info__head span { color: #111; }
        body.light--version .new-interface-info__title, body.light--version .new-interface-info__rate { color: #111; }
        body.light--version .new-interface-info__description { color: rgba(0, 0, 0, 0.9); text-shadow: none; }
        body.light--version .new-interface-card-title { color: #111; }

        /* --- АДАПТАЦІЯ ПІД МЕНШІ ЕКРАНИ ТА ВІКНА --- */
        @media (max-height: 820px) {
            body.ni-cards-vertical .new-interface { --ni-info-h: clamp(14em, 32vh, 22em); }
            body:not(.ni-cards-vertical) .new-interface { --ni-info-h: clamp(16em, 42vh, 28em); }
            body.ni-cards-vertical html:not(.is-smarttv) .new-interface { --ni-card-w: clamp(110px, 7.2vw, 160px); }
            .new-interface-info__right { padding-top: clamp(0.15em, 1.8vh, 1.2em); }
            .new-interface-info__title { font-size: clamp(2.4em, 3.6vw, 3.1em); }
            .new-interface-info__description { -webkit-line-clamp: 5; line-clamp: 5; margin-top: 0; }
        }
        </style>`);

        $('body').append(Lampa.Template.get('new_interface_ultimate_styles', {}, true));
    }

    // ========== ІНІЦІАЛІЗАЦІЯ ==========
    if (Lampa.Manifest.app_digital >= 300) {
        startPluginV3();
    } else {
        if (!window.plugin_interface_ready) {
            addStyleV3();
            startLegacyPlugin();
        }
    }

    
})();
