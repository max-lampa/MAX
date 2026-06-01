/**
 * MaksTV Themes Plugin for Lampa
 * Автор: MaksTV | Версия: 1.0.0
 */
(function () {
    'use strict';

    var PLUGIN_KEY = 'makstv_themes';
    var PLUGIN_NAME = 'MaksTV Темы';
    var PLUGIN_AUTHOR = 'MaksTV';
    var PLUGIN_VERSION = '1.0.0';

    /* Цветовые палитры */
    var COLORS = {
        red: {
            name: 'Красная',
            primary: '#e74c3c',
            secondary: '#c0392b',
            background: '#1a0505',
            card: '#2a0808',
            focus_bg: 'linear-gradient(90deg,#e74c3c,#c0392b)',
            focus_text: '#fff',
            accent: '#ff6b5b',
            shadow: 'rgba(231,76,60,0.5)',
            border: '#e74c3c'
        },
        green: {
            name: 'Зелёная',
            primary: '#27ae60',
            secondary: '#1e8449',
            background: '#041208',
            card: '#082014',
            focus_bg: 'linear-gradient(90deg,#27ae60,#1e8449)',
            focus_text: '#fff',
            accent: '#5dd98e',
            shadow: 'rgba(39,174,96,0.5)',
            border: '#27ae60'
        },
        violet: {
            name: 'Фиолетовая',
            primary: '#9b59b6',
            secondary: '#7d3c98',
            background: '#0e0516',
            card: '#1a0828',
            focus_bg: 'linear-gradient(90deg,#9b59b6,#7d3c98)',
            focus_text: '#fff',
            accent: '#c77dff',
            shadow: 'rgba(155,89,182,0.5)',
            border: '#9b59b6'
        },
        blue: {
            name: 'Синяя',
            primary: '#2980b9',
            secondary: '#1a5c8a',
            background: '#030d1a',
            card: '#071828',
            focus_bg: 'linear-gradient(90deg,#2980b9,#1a5c8a)',
            focus_text: '#fff',
            accent: '#60c2ff',
            shadow: 'rgba(41,128,185,0.5)',
            border: '#2980b9'
        },
        orange: {
            name: 'Оранжевая',
            primary: '#f39c12',
            secondary: '#d68910',
            background: '#150900',
            card: '#261200',
            focus_bg: 'linear-gradient(90deg,#f39c12,#d68910)',
            focus_text: '#000',
            accent: '#ffcb70',
            shadow: 'rgba(243,156,18,0.5)',
            border: '#f39c12'
        },
        pink: {
            name: 'Розовая',
            primary: '#e91e8c',
            secondary: '#c0147a',
            background: '#15000e',
            card: '#27001a',
            focus_bg: 'linear-gradient(90deg,#e91e8c,#c0147a)',
            focus_text: '#fff',
            accent: '#ff80cc',
            shadow: 'rgba(233,30,140,0.5)',
            border: '#e91e8c'
        }
    };

    /* Стили интерфейса */
    var STYLES = {
        focus: {
            name: 'Focus Pack',
            desc: 'Чёткий фокус, яркая подсветка элементов',
            cardRadius: '10px',
            focusShadow: true,
            glassmorphism: false,
            gradientBg: false
        },
        gallery: {
            name: 'Color Gallery',
            desc: 'Мягкие цвета, плавные переходы',
            cardRadius: '14px',
            focusShadow: false,
            glassmorphism: true,
            gradientBg: false
        },
        gradient: {
            name: 'Gradient Style',
            desc: 'Градиентный фон, современный вид',
            cardRadius: '16px',
            focusShadow: true,
            glassmorphism: false,
            gradientBg: true
        }
    };

    /* Генератор CSS — строит полный CSS по выбранным цвету и стилю */
    function buildCSS(colorKey, styleKey) {
        var C = COLORS[colorKey];
        var S = STYLES[styleKey];
        if (!C || !S) return '';

        var bodyBg = S.gradientBg
            ? 'linear-gradient(135deg,' + C.background + ' 0%,' + C.card + ' 100%)'
            : C.background;

        var fShadow = S.focusShadow
            ? '0 0 0 3px ' + C.border + ', 0 4px 20px ' + C.shadow
            : '0 4px 20px ' + C.shadow;

        var cardBg = S.glassmorphism ? 'rgba(255,255,255,0.07)' : C.card;
        var cardFilter = S.glassmorphism
            ? 'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);'
            : '';

        var css = [];

        css.push('/* MaksTV Themes v' + PLUGIN_VERSION + ' | ' + C.name + ' | ' + S.name + ' */');

        /* Фон */
        css.push('body{background:' + bodyBg + ' !important;color:#e0e0e0 !important;}');
        css.push('body.black--style{background:#000 !important;}');

        /* Меню */
        css.push('.menu{background:' + C.card + ' !important;border-right:2px solid ' + C.primary + '33 !important;}');
        css.push('.menu__item{border-radius:8px !important;transition:all .2s !important;}');
        css.push('.menu__item.focus,.menu__item.hover,.menu__item.traverse{');
        css.push('  background:' + C.focus_bg + ' !important;color:' + C.focus_text + ' !important;');
        css.push('  box-shadow:' + fShadow + ' !important;transform:scale(1.03) !important;}');

        /* Настройки */
        css.push('.settings__content,.settings-input__content,.selectbox__content,.modal__content{');
        css.push('  background:' + C.background + ' !important;border:1px solid ' + C.primary + '44 !important;border-radius:14px !important;}');
        css.push('.settings-folder.focus,.settings-param.focus{');
        css.push('  background:' + C.focus_bg + ' !important;color:' + C.focus_text + ' !important;');
        css.push('  box-shadow:' + fShadow + ' !important;border-radius:8px !important;}');
        css.push('.settings-folder.focus .settings-folder__icon{filter:invert(1) !important;}');
        css.push('.settings-param-title>span{color:' + C.accent + ' !important;}');

        /* Карточки */
        css.push('.card{border-radius:' + S.cardRadius + ' !important;}');
        css.push('.card.focus .card__view::after,.card.hover .card__view::after{');
        css.push('  border-color:' + C.primary + ' !important;box-shadow:0 0 18px ' + C.shadow + ' !important;}');

        /* Кнопки */
        css.push('.full-start__button.focus,.simple-button.focus,.full-descr__tag.focus{');
        css.push('  background:' + C.focus_bg + ' !important;color:' + C.focus_text + ' !important;');
        css.push('  box-shadow:' + fShadow + ' !important;border-radius:8px !important;}');

        /* Selectbox */
        css.push('.selectbox-item.focus,.selectbox-item.hover{');
        css.push('  background:' + C.focus_bg + ' !important;color:' + C.focus_text + ' !important;');
        css.push('  box-shadow:' + fShadow + ' !important;}');

        /* Персоны */
        css.push('.full-person.focus{box-shadow:0 0 0 3px ' + C.primary + ' !important;border-radius:50% !important;}');

        /* Верхняя панель */
        css.push('.head__action.focus,.head__action.hover{');
        css.push('  background:' + C.focus_bg + ' !important;box-shadow:0 0 12px ' + C.shadow + ' !important;border-radius:8px !important;}');

        /* Плеер */
        css.push('.player-panel .button.focus{');
        css.push('  background:' + C.focus_bg + ' !important;box-shadow:' + fShadow + ' !important;border-radius:6px !important;}');
        css.push('.time-line>div,.player-panel__position,.player-panel__position>div:after{background-color:' + C.primary + ' !important;}');

        /* IPTV */
        css.push('.iptv-list__item.focus,.iptv-menu__list-item.focus{');
        css.push('  background:' + C.focus_bg + ' !important;color:' + C.focus_text + ' !important;box-shadow:' + fShadow + ' !important;}');
        css.push('.iptv-channel{background-color:' + C.card + ' !important;}');
        css.push('.iptv-channel.focus::before{border-color:' + C.primary + ' !important;}');

        /* Торренты */
        css.push('.torrent-item.focus::after{border-color:' + C.primary + ' !important;}');
        css.push('.torrent-item__size,.torrent-item__exe,.torrent-item__viewed{');
        css.push('  background-color:' + C.primary + ' !important;color:' + C.focus_text + ' !important;}');
        css.push('.torrent-file.focus,.torrent-serial.focus{background-color:' + C.primary + '44 !important;}');

        /* Расширения */
        css.push('.extensions{background:' + C.background + ' !important;}');
        css.push('.extensions__item,.extensions__block-add{');
        css.push('  background-color:' + cardBg + ' !important;' + cardFilter);
        css.push('  border-radius:' + S.cardRadius + ' !important;}');
        css.push('.extensions__item.focus:after,.extensions__block-add.focus:after{');
        css.push('  border-color:' + C.primary + ' !important;box-shadow:0 0 16px ' + C.shadow + ' !important;}');

        /* Scrollbar */
        css.push('::-webkit-scrollbar-thumb{background:' + C.primary + ' !important;border-radius:4px !important;}');
        css.push('::-webkit-scrollbar-track{background:' + C.card + ' !important;}');

        /* Поиск */
        css.push('.search-source.active{background:' + C.focus_bg + ' !important;color:' + C.focus_text + ' !important;}');
        css.push('.online-prestige.focus::after{border-color:' + C.primary + ' !important;}');
        css.push('.settings-input__links{background-color:' + C.primary + '33 !important;}');

        return css.join('\n');
    }

    /* Применение CSS в document */
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

    /* Сохранение настроек */
    function saveSettings(colorKey, styleKey) {
        try {
            Lampa.Storage.set(PLUGIN_KEY + '_color', colorKey);
            Lampa.Storage.set(PLUGIN_KEY + '_style', styleKey);
        } catch(e) {
            localStorage.setItem(PLUGIN_KEY + '_color', colorKey);
            localStorage.setItem(PLUGIN_KEY + '_style', styleKey);
        }
    }

    /* Загрузка настроек */
    function loadSettings() {
        try {
            return {
                color: Lampa.Storage.get(PLUGIN_KEY + '_color', 'none'),
                style: Lampa.Storage.get(PLUGIN_KEY + '_style', 'focus')
            };
        } catch(e) {
            return {
                color: localStorage.getItem(PLUGIN_KEY + '_color') || 'none',
                style: localStorage.getItem(PLUGIN_KEY + '_style') || 'focus'
            };
        }
    }

    /* Меню выбора темы (навигация пультом) */
    function openThemeMenu() {
        var saved = loadSettings();
        var currentColor = saved.color;
        var currentStyle = saved.style;
        var items = [];

        /* Секция: стили */
        var styleKeys = Object.keys(STYLES);
        for (var si = 0; si < styleKeys.length; si++) {
            var sk = styleKeys[si];
            items.push({
                title: STYLES[sk].name + (sk === currentStyle ? ' ✓' : ''),
                subtitle: STYLES[sk].desc,
                value: 'style_' + sk
            });
        }

        items.push({ title: '──── Цвет темы ────', value: 'sep', noclick: true });

        items.push({
            title: '🚫 Стандартная (без темы)' + (currentColor === 'none' ? ' ✓' : ''),
            value: 'color_none'
        });

        /* Цвета */
        var colorKeys = Object.keys(COLORS);
        for (var ci = 0; ci < colorKeys.length; ci++) {
            var ck = colorKeys[ci];
            items.push({
                title: COLORS[ck].name + (ck === currentColor ? ' ✓' : ''),
                value: 'color_' + ck
            });
        }

        Lampa.Select.show({
            title: PLUGIN_NAME,
            items: items,
            onSelect: function (item) {
                if (!item || item.noclick) return;
                var val = item.value;
                if (val.indexOf('style_') === 0) {
                    currentStyle = val.replace('style_', '');
                } else if (val.indexOf('color_') === 0) {
                    currentColor = val.replace('color_', '');
                }
                saveSettings(currentColor, currentStyle);
                applyTheme(currentColor, currentStyle);
                try { Lampa.Noty.show('MaksTV: тема применена!'); } catch(e) {}
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
            }
        });
    }

    /* Регистрация в Настройки → Интерфейс */
    function registerSettings() {
        try {
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name !== 'interface') return;

                var btn = $('<div class="settings-param selector" data-name="makstv_themes_open">' +
                    '<div class="settings-param__left">' +
                    '<div class="settings-param__name">🎨 MaksTV — Выбор темы</div>' +
                    '<div class="settings-param__descr">Цветовые темы от MaksTV</div>' +
                    '</div>' +
                    '<div class="settings-param__right"><div class="settings-param__toggle">Открыть</div></div>' +
                    '</div>');

                btn.on('hover:enter', function () {
                    openThemeMenu();
                });

                e.body.find('.settings-param').last().after(btn);

                setTimeout(function () {
                    try { Lampa.Controller.toggle('content'); } catch(ex) {}
                }, 200);
            });
        } catch(e) {
            console.warn('[MaksTV Themes] Ошибка регистрации:', e);
        }
    }

    /* Инициализация */
    function init() {
        var saved = loadSettings();
        applyTheme(saved.color, saved.style);
        registerSettings();
        console.log('[MaksTV Themes v' + PLUGIN_VERSION + '] Загружен. Тема: ' + saved.color + ' / ' + saved.style);
    }

    /* Запуск */
    if (window.appready) {
        init();
    } else {
        try {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') init();
            });
        } catch(err) {
            document.addEventListener('DOMContentLoaded', function () {
                if (typeof Lampa !== 'undefined') {
                    Lampa.Listener.follow('app', function (e) {
                        if (e.type === 'ready') init();
                    });
                }
            });
        }
    }

})();