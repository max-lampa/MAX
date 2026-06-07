(function () {
    'use strict';

    if (window.mod_apple_buttons_loaded) return;
    window.mod_apple_buttons_loaded = true;

    var MOD = 'mod_';

    function isEnabled(mod) {
        return Lampa.Storage.get(MOD + 'enable_' + mod, true);
    }

    var appleIcon = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>';

    // ==========================================
    // ЦВЕТОВЫЕ ТЕМЫ
    // ==========================================

    var colorThemes = {
        'default': {
            name: 'По умолчанию',
            container_bg: 'rgba(22,24,30,.28)',
            container_border: 'rgba(255,255,255,.10)',
            container_shadow: 'inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.92)',
            button_hover_bg: 'rgba(255,255,255,.14)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,255,255,.10)'
        },
        'blue': {
            name: 'Синяя',
            container_bg: 'rgba(0,122,255,.15)',
            container_border: 'rgba(0,122,255,.3)',
            container_shadow: 'inset 0 1px 0 rgba(0,122,255,.2), 0 8px 18px rgba(0,122,255,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(0,122,255,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(0,122,255,.3)'
        },
        'green': {
            name: 'Зелёная',
            container_bg: 'rgba(52,199,89,.15)',
            container_border: 'rgba(52,199,89,.3)',
            container_shadow: 'inset 0 1px 0 rgba(52,199,89,.2), 0 8px 18px rgba(52,199,89,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(52,199,89,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(52,199,89,.3)'
        },
        'purple': {
            name: 'Фиолетовая',
            container_bg: 'rgba(175,82,222,.15)',
            container_border: 'rgba(175,82,222,.3)',
            container_shadow: 'inset 0 1px 0 rgba(175,82,222,.2), 0 8px 18px rgba(175,82,222,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(175,82,222,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(175,82,222,.3)'
        },
        'red': {
            name: 'Красная',
            container_bg: 'rgba(255,59,48,.15)',
            container_border: 'rgba(255,59,48,.3)',
            container_shadow: 'inset 0 1px 0 rgba(255,59,48,.2), 0 8px 18px rgba(255,59,48,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(255,59,48,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,59,48,.3)'
        },
        'orange': {
            name: 'Оранжевая',
            container_bg: 'rgba(255,149,0,.15)',
            container_border: 'rgba(255,149,0,.3)',
            container_shadow: 'inset 0 1px 0 rgba(255,149,0,.2), 0 8px 18px rgba(255,149,0,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(255,149,0,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,149,0,.3)'
        },
        'pink': {
            name: 'Розовая',
            container_bg: 'rgba(255,45,85,.15)',
            container_border: 'rgba(255,45,85,.3)',
            container_shadow: 'inset 0 1px 0 rgba(255,45,85,.2), 0 8px 18px rgba(255,45,85,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(255,45,85,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,45,85,.3)'
        },
        'gold': {
            name: 'Золотая',
            container_bg: 'rgba(255,204,0,.15)',
            container_border: 'rgba(255,204,0,.3)',
            container_shadow: 'inset 0 1px 0 rgba(255,204,0,.2), 0 8px 18px rgba(255,204,0,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(255,204,0,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,204,0,.3)'
        },
        'dark': {
            name: 'Тёмная',
            container_bg: 'rgba(0,0,0,.6)',
            container_border: 'rgba(255,255,255,.05)',
            container_shadow: 'inset 0 1px 0 rgba(255,255,255,.05), 0 8px 18px rgba(0,0,0,.4)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.9)',
            button_hover_bg: 'rgba(255,255,255,.1)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,255,255,.05)'
        },
        'light': {
            name: 'Светлая',
            container_bg: 'rgba(255,255,255,.25)',
            container_border: 'rgba(255,255,255,.4)',
            container_shadow: 'inset 0 1px 0 rgba(255,255,255,.3), 0 8px 18px rgba(255,255,255,.1)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,1)',
            button_hover_bg: 'rgba(255,255,255,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(255,255,255,.4)'
        },
        'cyan': {
            name: 'Голубая',
            container_bg: 'rgba(50,173,230,.15)',
            container_border: 'rgba(50,173,230,.3)',
            container_shadow: 'inset 0 1px 0 rgba(50,173,230,.2), 0 8px 18px rgba(50,173,230,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(50,173,230,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(50,173,230,.3)'
        },
        'mint': {
            name: 'Мятная',
            container_bg: 'rgba(0,199,190,.15)',
            container_border: 'rgba(0,199,190,.3)',
            container_shadow: 'inset 0 1px 0 rgba(0,199,190,.2), 0 8px 18px rgba(0,199,190,.15)',
            button_bg: 'transparent',
            button_color: 'rgba(255,255,255,.95)',
            button_hover_bg: 'rgba(0,199,190,.3)',
            button_hover_shadow: 'inset 0 1px 0 rgba(0,199,190,.3)'
        }
    };

    // ==========================================
    // ГЕНЕРАЦИЯ ДИНАМИЧЕСКИХ СТИЛЕЙ
    // ==========================================

    function generateThemeStyles() {
        var theme = Lampa.Storage.get('m_button_theme', 'default');
        var colors = colorThemes[theme] || colorThemes['default'];
        
        return `
            /* Apple Style — кнопки карточки фильма */
            body.mod-buttons-apple .full-start__buttons,
            body.mod-buttons-apple .full-start-new__buttons {
                display: inline-flex !important; align-items: center; justify-content: flex-start;
                padding: 0.35em 0.4em !important; border-radius: 999px !important; margin-top: 1em;
                background: ${colors.container_bg} !important; 
                border: 1px solid ${colors.container_border} !important;
                box-shadow: ${colors.container_shadow} !important;
                backdrop-filter: blur(18px) saturate(140%) !important; 
                -webkit-backdrop-filter: blur(18px) saturate(140%) !important;
                width: max-content; flex-wrap: wrap !important; gap: 0.25em !important;
                font-size: var(--mod-btn-size, 1em) !important;
            }
            body.mod-buttons-apple-lite .full-start__buttons,
            body.mod-buttons-apple-lite .full-start-new__buttons {
                background: rgba(30, 32, 40, 0.98) !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.6) !important;
                backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
            }
            body.mod-buttons-apple .full-start__button,
            body.mod-buttons-apple .full-start-new__button {
                border: 0 !important; 
                background: ${colors.button_bg} !important; 
                color: ${colors.button_color} !important;
                height: 2.8em !important; min-height: 2.8em !important;
                display: inline-flex !important; align-items: center; justify-content: center;
                padding: 0 1.2em !important; border-radius: 999px !important;
                transition: background .2s ease, box-shadow .2s ease !important; 
                margin: 0 !important;
                font-weight: bold; font-size: inherit !important; box-shadow: none !important;
            }
            body.mod-buttons-apple .full-start__button.hidden,
            body.mod-buttons-apple .full-start-new__button.hidden,
            body.mod-buttons-apple .full-start__button.hide,
            body.mod-buttons-apple .full-start-new__button.hide,
            body.mod-buttons-apple .full-start__button[style*="display: none"],
            body.mod-buttons-apple .full-start-new__button[style*="display: none"],
            body.mod-buttons-apple .full-start__button[style*="display:none"],
            body.mod-buttons-apple .full-start-new__button[style*="display:none"] {
                display: none !important;
            }
            body.mod-buttons-apple .ua-sites-container {
                display: inline-flex !important; align-items: center; gap: 0.25em !important;
                margin: 0 !important; padding: 0 !important;
                background: transparent !important; border: none !important; box-shadow: none !important;
            }
            body.mod-buttons-apple .ua-btn-item {
                border: 0 !important; 
                background: ${colors.button_bg} !important; 
                color: ${colors.button_color} !important;
                height: 2.8em !important; min-height: 2.8em !important; width: 2.8em !important;
                display: inline-flex !important; align-items: center; justify-content: center;
                border-radius: 999px !important; 
                transition: background .2s ease, box-shadow .2s ease !important;
                margin: 0 !important; padding: 0 !important; box-shadow: none !important; 
                font-size: inherit !important;
            }
            body.mod-buttons-apple .full-start__button.focus,
            body.mod-buttons-apple .full-start__button:hover,
            body.mod-buttons-apple .ua-btn-item.focus,
            body.mod-buttons-apple .ua-btn-item:hover,
            body.mod-buttons-apple .ua-btn-item.active.focus {
                background: ${colors.button_hover_bg} !important;
                box-shadow: ${colors.button_hover_shadow} !important;
                transform: none !important; 
                color: #fff !important;
            }
            body.mod-buttons-apple .ua-btn-item.active { transform: none !important; }
            body.mod-buttons-apple .full-start__button svg { 
                width: 1.2em !important; height: 1.2em !important; margin-right: 0.4em !important; 
            }
            body.mod-buttons-apple .full-start__button.button--options svg { margin-right: 0 !important; }
            body.mod-buttons-apple .full-start__button.button--options { padding: 0 0.8em !important; }
            body.mod-buttons-apple .ua-btn-item img,
            body.mod-buttons-apple .ua-btn-item svg { 
                width: 1.5em !important; height: 1.5em !important; border-radius: 0 !important; 
                display: block; filter: none !important; 
            }
            body.mod-buttons-apple .ua-btn-item.loading svg { 
                animation: spin-badge 1.5s linear infinite !important; 
            }

            @media screen and (orientation: portrait), screen and (max-width: 767px) {
                body.mod-buttons-apple .full-start__buttons,
                body.mod-buttons-apple .full-start-new__buttons { 
                    justify-content: center !important; width: 100% !important; 
                    margin-left: 0 !important; margin-right: 0 !important; 
                }
            }

            div[data-component="m_buttons"] { display: none !important; }
        `;
    }

    // Инициализация стилей
    var styleElement = $('<style id="mod-apple-buttons-styles"></style>');
    $('head').append(styleElement);

    function updateStyles() {
        styleElement.text(generateThemeStyles());
    }

    updateStyles();

    // ==========================================
    // УПРАВЛЕНИЕ КЛАССАМИ BODY
    // ==========================================

    function updateBodyClasses() {
        var btnStyle = Lampa.Storage.get('m_button_style', 'normal');
        var btnSize  = Lampa.Storage.get('m_button_size', '1em');

        $('body').removeClass('mod-buttons-apple mod-buttons-apple-lite');
        
        if (btnStyle === 'apple') {
            $('body').addClass('mod-buttons-apple');
        }
        if (btnStyle === 'apple_lite') {
            $('body').addClass('mod-buttons-apple mod-buttons-apple-lite');
        }

        document.documentElement.style.setProperty('--mod-btn-size', btnSize);
        updateStyles();
    }

    updateBodyClasses();

    // ==========================================
    // СОЗДАНИЕ НАСТРОЕК
    // ==========================================

    function createSettings() {
        var MAIN_C = 'mod_apple_buttons';

        Lampa.SettingsApi.addComponent({
            component: MAIN_C,
            name: "Apple Style",
            icon: appleIcon
        });

        Lampa.SettingsApi.addParam({
            component: MAIN_C,
            param: {
                name: 'm_button_style',
                type: 'select',
                values: {
                    'normal': 'Обычный (Lampa)',
                    'apple': 'Apple Style (с размытием)',
                    'apple_lite': 'Apple Lite (без размытия)'
                },
                default: 'normal'
            },
            field: {
                name: 'Стиль кнопок',
                description: 'Внешний вид кнопок плеера, закладок и т.д.'
            },
            onChange: function () {
                updateBodyClasses();
            }
        });

        Lampa.SettingsApi.addParam({
            component: MAIN_C,
            param: {
                name: 'm_button_size',
                type: 'select',
                values: {
                    '0.8em': '0.8em (Мини)',
                    '0.9em': '0.9em (Мелкий)',
                    '1em': '1em (Стандарт)',
                    '1.1em': '1.1em (Больше)',
                    '1.2em': '1.2em (Крупный)',
                    '1.4em': '1.4em (Гигантский)'
                },
                default: '1em'
            },
            field: {
                name: 'Размер кнопок',
                description: 'Работает для Apple-стилей'
            },
            onChange: function () {
                updateBodyClasses();
            }
        });

        // Цветовая тема
        var themeValues = {};
        Object.keys(colorThemes).forEach(function(key) {
            themeValues[key] = colorThemes[key].name;
        });

        Lampa.SettingsApi.addParam({
            component: MAIN_C,
            param: {
                name: 'm_button_theme',
                type: 'select',
                values: themeValues,
                default: 'default'
            },
            field: {
                name: 'Цветовая тема',
                description: 'Окрас кнопок (работает только для Apple-стилей)'
            },
            onChange: function () {
                updateBodyClasses();
            }
        });
    }

    if (window.appready) {
        createSettings();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                createSettings();
            }
        });
    }

})();