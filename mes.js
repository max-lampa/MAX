/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           🎨 MaksTV THEMES PLUGIN for LAMPA 🎨              ║
 * ║                                                              ║
 * ║  Плагин тем для Lampa — Android TV / Android TV 9+          ║
 * ║  Поддержка пульта ДУ (D-pad navigation)                     ║
 * ║                                                              ║
 * ║  Автор : MaksTV                                              ║
 * ║  Версия: 1.0.0                                               ║
 * ║  GitHub : https://github.com/MaksTV/makstv-themes            ║
 * ║  Плагин : https://MaksTV.github.io/makstv-themes/themes.js   ║
 * ║                                                              ║
 * ║  ИКОНКИ хранятся прямо в коде (SVG data-URI) —              ║
 * ║  никаких внешних зависимостей не нужно!                      ║
 * ║                                                              ║
 * ║  Темы:                                                       ║
 * ║   • 3 стиля: Focus Pack / Color Gallery / Gradient Style     ║
 * ║   • 6 цветов: Красная / Зелёная / Фиолетовая /              ║
 * ║               Синяя / Оранжевая / Розовая                    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

(function () {
    'use strict';

    // ================================================================
    //  КОНФИГУРАЦИЯ
    // ================================================================
    var PLUGIN_KEY   = 'makstv_themes';
    var PLUGIN_NAME  = 'MaksTV Темы';
    var PLUGIN_AUTHOR = 'MaksTV';
    var PLUGIN_VERSION = '1.0.0';

    // ================================================================
    //  ИКОНКИ (SVG inline — хранятся прямо в плагине, GitHub не нужен)
    //  Если хотите внешние иконки — разместите PNG на GitHub Pages:
    //  https://MaksTV.github.io/makstv-themes/icons/brush.png
    // ================================================================
    var SVG_BRUSH = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><path fill='%23fff' d='M54 4a6 6 0 0 0-8.5 0L16 33.5l-2 12 12-2L55.5 14A6 6 0 0 0 54 4z'/><ellipse fill='%23e0a020' cx='11' cy='52' rx='7' ry='5'/></svg>";

    // ================================================================
    //  ЦВЕТОВЫЕ ПАЛИТРЫ
    // ================================================================
    var COLORS = {
        red: {
            name: 'Красная',
            emoji: '🔴',
            primary:    '#e74c3c',
            secondary:  '#c0392b',
            background: '#1a0505',
            card:       '#2a0808',
            focus_bg:   'linear-gradient(90deg,#e74c3c,#c0392b)',
            focus_text: '#fff',
            accent:     '#ff6b5b',
            shadow:     'rgba(231,76,60,0.5)',
            border:     '#e74c3c',
        },
        green: {
            name: 'Зелёная',
            emoji: '🟢',
            primary:    '#27ae60',
            secondary:  '#1e8449',
            background: '#041208',
            card:       '#082014',
            focus_bg:   'linear-gradient(90deg,#27ae60,#1e8449)',
            focus_text: '#fff',
            accent:     '#5dd98e',
            shadow:     'rgba(39,174,96,0.5)',
            border:     '#27ae60',
        },
        violet: {
            name: 'Фиолетовая',
            emoji: '🟣',
            primary:    '#9b59b6',
            secondary:  '#7d3c98',
            background: '#0e0516',
            card:       '#1a0828',
            focus_bg:   'linear-gradient(90deg,#9b59b6,#7d3c98)',
            focus_text: '#fff',
            accent:     '#c77dff',
            shadow:     'rgba(155,89,182,0.5)',
            border:     '#9b59b6',
        },
        blue: {
            name: 'Синяя',
            emoji: '🔵',
            primary:    '#2980b9',
            secondary:  '#1a5c8a',
            background: '#030d1a',
            card:       '#071828',
            focus_bg:   'linear-gradient(90deg,#2980b9,#1a5c8a)',
            focus_text: '#fff',
            accent:     '#60c2ff',
            shadow:     'rgba(41,128,185,0.5)',
            border:     '#2980b9',
        },
        orange: {
            name: 'Оранжевая',
            emoji: '🟠',
            primary:    '#f39c12',
            secondary:  '#d68910',
            background: '#150900',
            card:       '#261200',
            focus_bg:   'linear-gradient(90deg,#f39c12,#d68910)',
            focus_text: '#000',
            accent:     '#ffcb70',
            shadow:     'rgba(243,156,18,0.5)',
            border:     '#f39c12',
        },
        pink: {
            name: 'Розовая',
            emoji: '🩷',
            primary:    '#e91e8c',
            secondary:  '#c0147a',
            background: '#15000e',
            card:       '#27001a',
            focus_bg:   'linear-gradient(90deg,#e91e8c,#c0147a)',
            focus_text: '#fff',
            accent:     '#ff80cc',
            shadow:     'rgba(233,30,140,0.5)',
            border:     '#e91e8c',
        },
    };

    // ================================================================
    //  СТИЛИ (модификаторы поверх цвета)
    // ================================================================
    var STYLES = {
        focus: {
            name: 'Focus Pack',
            desc: 'Чёткий фокус, яркая подсветка элементов',
            cardRadius: '10px',
            focusShadow: true,
            glassmorphism: false,
            gradientBg: false,
        },
        gallery: {
            name: 'Color Gallery',
            desc: 'Мягкие цвета, плавные переходы',
            cardRadius: '14px',
            focusShadow: false,
            glassmorphism: true,
            gradientBg: false,
        },
        gradient: {
            name: 'Gradient Style',
            desc: 'Градиентный фон, современный вид',
            cardRadius: '16px',
            focusShadow: true,
            glassmorphism: false,
            gradientBg: true,
        },
    };

    // ================================================================
    //  ГЕНЕРАТОР CSS
    // ================================================================
    function buildCSS(colorKey, styleKey) {
        var C = COLORS[colorKey];
        var S = STYLES[styleKey];
        if (!C || !S) return '';

        var bodyBg = S.gradientBg
            ? 'linear-gradient(135deg,' + C.background + ' 0%,' + C.card + ' 100%)'
            : C.background;

        var focusShadow = S.focusShadow
            ? '0 0 0 3px ' + C.border + ', 0 4px 20px ' + C.shadow
            : '0 4px 20px ' + C.shadow;

        var cardBg = S.glassmorphism
            ? 'rgba(255,255,255,0.07)'
            : C.card;

        var cardFilter = S.glassmorphism
            ? 'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);'
            : '';

        return [
            '/* === MaksTV Themes v' + PLUGIN_VERSION + ' | Цвет: ' + C.name + ' | Стиль: ' + S.name + ' === */',

            /* Фон и текст */
            'body { background: ' + bodyBg + ' !important; color: #e0e0e0 !important; }',
            'body.black--style { background: #000 !important; }',

            /* Меню */
            '.menu { background: ' + C.card + ' !important; border-right: 2px solid ' + C.primary + '33 !important; }',
            '.menu__item { border-radius: 8px !important; transition: all .2s !important; }',
            '.menu__item.focus, .menu__item.hover, .menu__item.traverse {',
            '  background: ' + C.focus_bg + ' !important;',
            '  color: ' + C.focus_text + ' !important;',
            '  box-shadow: ' + focusShadow + ' !important;',
            '  transform: scale(1.03) !important;',
            '}',

            /* Настройки */
            '.settings__content, .settings-input__content, .selectbox__content, .modal__content {',
            '  background: ' + C.background + ' !important;',
            '  border: 1px solid ' + C.primary + '44 !important;',
            '  border-radius: 14px !important;',
            '}',
            '.settings-folder.focus, .settings-param.focus {',
            '  background: ' + C.focus_bg + ' !important;',
            '  color: ' + C.focus_text + ' !important;',
            '  box-shadow: ' + focusShadow + ' !important;',
            '  border-radius: 8px !important;',
            '}',
            '.settings-folder.focus .settings-folder__icon { filter: invert(1) !important; }',
            '.settings-param-title > span { color: ' + C.accent + ' !important; }',

            /* Карточки */
            '.card { border-radius: ' + S.cardRadius + ' !important; }',
            '.card.focus .card__view::after, .card.hover .card__view::after {',
            '  border-color: ' + C.primary + ' !important;',
            '  box-shadow: 0 0 18px ' + C.shadow + ' !important;',
            '}',

            /* Кнопки */
            '.full-start__button.focus, .simple-button.focus, .full-descr__tag.focus {',
            '  background: ' + C.focus_bg + ' !important;',
            '  color: ' + C.focus_text + ' !important;',
            '  box-shadow: ' + focusShadow + ' !important;',
            '  border-radius: 8px !important;',
            '}',

            /* Selectbox */
            '.selectbox-item.focus, .selectbox-item.hover {',
            '  background: ' + C.focus_bg + ' !important;',
            '  color: ' + C.focus_text + ' !important;',
            '  box-shadow: ' + focusShadow + ' !important;',
            '}',

            /* Персоны */
            '.full-person.focus {',
            '  box-shadow: 0 0 0 3px ' + C.primary + ' !important;',
            '  border-radius: 50% !important;',
            '}',

            /* Head (верхняя панель) */
            '.head__action.focus, .head__action.hover {',
            '  background: ' + C.focus_bg + ' !important;',
            '  box-shadow: 0 0 12px ' + C.shadow + ' !important;',
            '  border-radius: 8px !important;',
            '}',

            /* Плеер */
            '.player-panel .button.focus {',
            '  background: ' + C.focus_bg + ' !important;',
            '  box-shadow: ' + focusShadow + ' !important;',
            '  border-radius: 6px !important;',
            '}',
            '.time-line > div, .player-panel__position, .player-panel__position > div:after {',
            '  background-color: ' + C.primary + ' !important;',
            '}',

            /* IPTV */
            '.iptv-list__item.focus, .iptv-menu__list-item.focus {',
            '  background: ' + C.focus_bg + ' !important;',
            '  color: ' + C.focus_text + ' !important;',
            '  box-shadow: ' + focusShadow + ' !important;',
            '}',
            '.iptv-channel { background-color: ' + C.card + ' !important; }',
            '.iptv-channel.focus::before { border-color: ' + C.primary + ' !important; }',

            /* Торренты */
            '.torrent-item.focus::after { border-color: ' + C.primary + ' !important; }',
            '.torrent-item__size, .torrent-item__exe, .torrent-item__viewed {',
            '  background-color: ' + C.primary + ' !important;',
            '  color: ' + C.focus_text + ' !important;',
            '}',
            '.torrent-file.focus, .torrent-serial.focus {',
            '  background-color: ' + C.primary + '44 !important;',
            '}',

            /* Расширения */
            '.extensions { background: ' + C.background + ' !important; }',
            '.extensions__item, .extensions__block-add {',
            '  background-color: ' + C.card + ' !important;',
            '  ' + cardFilter,
            '  border-radius: ' + S.cardRadius + ' !important;',
            '}',
            '.extensions__item.focus:after, .extensions__block-add.focus:after {',
            '  border-color: ' + C.primary + ' !important;',
            '  box-shadow: 0 0 16px ' + C.shadow + ' !important;',
            '}',

            /* Scrollbar */
            '::-webkit-scrollbar-thumb { background: ' + C.primary + ' !important; border-radius: 4px !important; }',
            '::-webkit-scrollbar-track { background: ' + C.card + ' !important; }',

            /* Поиск */
            '.search-source.active {',
            '  background: ' + C.focus_bg + ' !important;',
            '  color: ' + C.focus_text + ' !important;',
            '}',

            /* Online-prestige */
            '.online-prestige.focus::after { border-color: ' + C.primary + ' !important; }',

            /* Settings input */
            '.settings-input__links { background-color: ' + C.primary + '33 !important; }',

            '/* === End MaksTV Themes === */',
        ].join('\n');
    }

    // ================================================================
    //  ПРИМЕНЕНИЕ ТЕМЫ
    // ================================================================
    var styleEl = null;

    function applyTheme(colorKey, styleKey) {
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'makstv-theme-styles';
            document.head.appendChild(styleEl);
        }
        if (!colorKey || colorKey === 'none') {
            styleEl.textContent = '';
            return;
        }
        styleEl.textContent = buildCSS(colorKey, styleKey || 'focus');
    }

    // ================================================================
    //  ХРАНЕНИЕ НАСТРОЕК (Lampa.Storage)
    // ================================================================
    function saveSettings(colorKey, styleKey) {
        try {
            Lampa.Storage.set(PLUGIN_KEY + '_color', colorKey);
            Lampa.Storage.set(PLUGIN_KEY + '_style', styleKey);
        } catch(e) {
            localStorage.setItem(PLUGIN_KEY + '_color', colorKey);
            localStorage.setItem(PLUGIN_KEY + '_style', styleKey);
        }
    }

    function loadSettings() {
        try {
            return {
                color: Lampa.Storage.get(PLUGIN_KEY + '_color', 'none'),
                style: Lampa.Storage.get(PLUGIN_KEY + '_style', 'focus'),
            };
        } catch(e) {
            return {
                color: localStorage.getItem(PLUGIN_KEY + '_color') || 'none',
                style: localStorage.getItem(PLUGIN_KEY + '_style') || 'focus',
            };
        }
    }

    // ================================================================
    //  МЕНЮ ВЫБОРА ТЕМЫ
    //  Строится через Lampa API с навигацией пульта
    // ================================================================
    function openThemeMenu() {
        var saved = loadSettings();
        var currentColor = saved.color;
        var currentStyle = saved.style;

        // --- HTML шаблон меню ---
        var html = '<div class="makstv-menu">';
        html += '<div class="makstv-menu__title">🎨 MaksTV Темы</div>';
        html += '<div class="makstv-menu__author">by ' + PLUGIN_AUTHOR + ' v' + PLUGIN_VERSION + '</div>';

        // Стили
        html += '<div class="makstv-menu__section">Стиль интерфейса</div>';
        html += '<div class="makstv-menu__styles">';
        Object.keys(STYLES).forEach(function(key) {
            var active = (key === currentStyle) ? ' makstv-active' : '';
            html += '<div class="makstv-btn makstv-style-btn' + active + '" data-style="' + key + '">' + STYLES[key].name + '</div>';
        });
        html += '</div>';

        // Цвета
        html += '<div class="makstv-menu__section">Цветовая тема</div>';
        html += '<div class="makstv-menu__colors">';
        html += '<div class="makstv-btn makstv-color-btn makstv-color-none' + (currentColor === 'none' ? ' makstv-active' : '') + '" data-color="none">🚫 Стандартная</div>';
        Object.keys(COLORS).forEach(function(key) {
            var C = COLORS[key];
            var active = (key === currentColor) ? ' makstv-active' : '';
            html += '<div class="makstv-btn makstv-color-btn makstv-color-' + key + active + '" data-color="' + key + '">';
            html += '<img src="' + SVG_BRUSH + '" class="makstv-icon" />';
            html += '<span>' + C.name + '</span>';
            html += '</div>';
        });
        html += '</div>';

        html += '<div class="makstv-menu__footer">Навигация: ← → ↑ ↓ пультом, OK — выбрать</div>';
        html += '</div>';

        // CSS для меню
        var menuCSS = [
            '.makstv-menu { padding:20px 24px; color:#fff; min-width:320px; }',
            '.makstv-menu__title { font-size:1.3em; font-weight:700; margin-bottom:4px; }',
            '.makstv-menu__author { font-size:0.78em; color:#888; margin-bottom:18px; }',
            '.makstv-menu__section { font-size:0.82em; color:#aaa; text-transform:uppercase;',
            '  letter-spacing:1px; margin:14px 0 8px; }',
            '.makstv-menu__styles { display:flex; flex-direction:column; gap:8px; }',
            '.makstv-menu__colors { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:4px; }',
            '.makstv-btn { border-radius:10px; padding:12px 16px; cursor:pointer;',
            '  background:rgba(255,255,255,0.07); border:2px solid transparent;',
            '  font-size:0.95em; font-weight:500; color:#ccc;',
            '  display:flex; align-items:center; gap:8px;',
            '  transition:all .2s; outline:none; }',
            '.makstv-btn.focus, .makstv-btn:focus { background:rgba(255,255,255,0.18) !important;',
            '  border-color:rgba(255,255,255,0.5) !important; color:#fff !important;',
            '  box-shadow:0 0 0 3px rgba(255,255,255,0.2); transform:scale(1.03); }',
            '.makstv-btn.makstv-active { border-color:#e0a020 !important; color:#e0a020 !important; }',
            '.makstv-btn.makstv-active.focus { border-color:#ffcc44 !important; }',
            /* Цвета кнопок */
            '.makstv-color-red    { background:linear-gradient(135deg,#3a0808,#200404) !important; }',
            '.makstv-color-green  { background:linear-gradient(135deg,#082014,#041208) !important; }',
            '.makstv-color-violet { background:linear-gradient(135deg,#1a0828,#0e0516) !important; }',
            '.makstv-color-blue   { background:linear-gradient(135deg,#071828,#030d1a) !important; }',
            '.makstv-color-orange { background:linear-gradient(135deg,#261200,#150900) !important; }',
            '.makstv-color-pink   { background:linear-gradient(135deg,#27001a,#15000e) !important; }',
            '.makstv-color-none   { grid-column:1/-1; }',
            '.makstv-icon { width:24px; height:24px; flex-shrink:0; }',
            '.makstv-menu__footer { font-size:0.72em; color:#666; margin-top:18px; text-align:center; }',
        ].join('');

        if (!document.getElementById('makstv-menu-css')) {
            var s = document.createElement('style');
            s.id = 'makstv-menu-css';
            s.textContent = menuCSS;
            document.head.appendChild(s);
        }

        // --- Открываем через Lampa Modal/Select ---
        try {
            // Используем Lampa.Select для пульта-навигации
            var items = [];

            // Секция: стили
            Object.keys(STYLES).forEach(function(key) {
                items.push({
                    title: STYLES[key].name + (key === currentStyle ? ' ✓' : ''),
                    subtitle: STYLES[key].desc,
                    value: 'style_' + key,
                });
            });

            // Разделитель
            items.push({ title: '──── Цвет темы ────', value: 'sep', noclick: true });

            // Сброс
            items.push({
                title: '🚫 Стандартная (без темы)' + (currentColor === 'none' ? ' ✓' : ''),
                value: 'color_none',
            });

            // Цвета
            Object.keys(COLORS).forEach(function(key) {
                var C = COLORS[key];
                items.push({
                    title: C.emoji + ' ' + C.name + (key === currentColor ? ' ✓' : ''),
                    value: 'color_' + key,
                });
            });

            Lampa.Select.show({
                title: '🎨 ' + PLUGIN_NAME,
                items: items,
                onSelect: function(item) {
                    if (!item || item.noclick) return;
                    var val = item.value;
                    if (val.indexOf('style_') === 0) {
                        currentStyle = val.replace('style_', '');
                    } else if (val.indexOf('color_') === 0) {
                        currentColor = val.replace('color_', '');
                    }
                    saveSettings(currentColor, currentStyle);
                    applyTheme(currentColor, currentStyle);
                    // Показать уведомление
                    try {
                        Lampa.Noty.show('MaksTV: тема применена!');
                    } catch(e) {}
                },
                onBack: function() {
                    Lampa.Controller.toggle('content');
                }
            });
        } catch(e) {
            // Fallback: простой alert для отладки
            console.warn('[MaksTV Themes] Lampa.Select недоступен:', e);
        }
    }

    // ================================================================
    //  РЕГИСТРАЦИЯ В НАСТРОЙКАХ LAMPA
    // ================================================================
    function registerSettings() {
        // Добавляем кнопку в Настройки → Интерфейс
        try {
            Lampa.Settings.listener.follow('open', function(e) {
                if (e.name !== 'interface') return;

                var btn = $('<div class="settings-param selector" data-name="makstv_themes_open">' +
                    '<div class="settings-param__left">' +
                    '<div class="settings-param__name">🎨 MaksTV — Выбор темы</div>' +
                    '<div class="settings-param__descr">Цветовые темы от MaksTV</div>' +
                    '</div>' +
                    '<div class="settings-param__right"><div class="settings-param__toggle">Открыть</div></div>' +
                    '</div>');

                btn.on('hover:enter', function() {
                    openThemeMenu();
                });

                // Добавляем в конец секции интерфейса
                e.body.find('.settings-param').last().after(btn);

                // Фокус-навигация
                Lampa.Controller.toggle('content');
            });
        } catch(e) {
            console.warn('[MaksTV Themes] Не удалось зарегистрировать в настройках:', e);
        }
    }

    // ================================================================
    //  РЕГИСТРАЦИЯ В ГЛАВНОМ МЕНЮ (опционально — через событие menu)
    // ================================================================
    function registerMenuEntry() {
        try {
            Lampa.Listener.follow('menu', function(e) {
                if (e.type !== 'start') return;
                // Добавляем пункт меню если нужно
                // (в данной версии используем только настройки)
            });
        } catch(e) {}
    }

    // ================================================================
    //  ТОЧКА ВХОДА
    // ================================================================
    function init() {
        // Загружаем сохранённую тему
        var saved = loadSettings();
        applyTheme(saved.color, saved.style);

        // Регистрируем в настройках
        registerSettings();
        registerMenuEntry();

        console.log('[MaksTV Themes v' + PLUGIN_VERSION + '] Плагин загружен. Тема: ' + saved.color + ' / ' + saved.style);
    }

    // ================================================================
    //  ЗАПУСК (ждём готовности Lampa)
    // ================================================================
    if (window.appready) {
        init();
    } else {
        try {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    init();
                }
            });
        } catch(err) {
            // Если Lampa не определена — ждём через DOMContentLoaded
            document.addEventListener('DOMContentLoaded', function() {
                if (typeof Lampa !== 'undefined') {
                    Lampa.Listener.follow('app', function(e) {
                        if (e.type === 'ready') init();
                    });
                }
            });
        }
    }

})();
