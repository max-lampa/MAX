(function () {
    'use strict';

    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {

            Lampa.SettingsApi.addParam({
                component: 'interface',
                param:   { name: 'custom_themes_simple', type: 'static' },
                field:   { name: 'Стиль оформления', description: 'Красивые темы без рамок (в стиле bylampa themes)' },
                onRender: function (node) {
                    node.addClass('focusable');
                    
                    // Реакция на пульт и enter
                    node.on('hover:enter controller:enter key:enter', function () {
                        showThemeSelector();
                    });
                }
            });
        }
    });

    function showThemeSelector() {
        var themes = [
            { title: "Сиреневый неон", main: "#bb86fc", accent: "#bb86fc88", bg: "#0f0817" },
            { title: "Розовый закат",  main: "#ff79c6", accent: "#ff79c688", bg: "#1f0f18" },
            { title: "Красный огонь",  main: "#ff5252", accent: "#ff525288", bg: "#140404" },
            { title: "Изумрудный",     main: "#4caf50", accent: "#4caf5088", bg: "#0a140e" },
            { title: "Циан волна",     main: "#00d4ff", accent: "#00d4ff88", bg: "#00151a" },
            { title: "Золотой",        main: "#ffca28", accent: "#ffca2888", bg: "#1a1400" },
            { title: "Лайм кислота",   main: "#c6ff00", accent: "#c6ff0088", bg: "#0f1400" },
            { title: "Мятный лёд",     main: "#64ffda", accent: "#64ffda88", bg: "#001a17" },
            { title: "Сбросить",       action: 'reset' }
        ];

        Lampa.Select.show({
            title: 'Выберите тему',
            items: themes,
            onSelect: function (a) {
                if (a.action === 'reset') {
                    localStorage.removeItem('active_theme_data');
                    Lampa.Noty.show('Тема сброшена');
                    setTimeout(() => location.reload(), 700);
                } else {
                    applyStyle(a);
                    localStorage.setItem('active_theme_data', JSON.stringify(a));
                    Lampa.Noty.show('Применено: ' + a.title);
                }
            },
            onBack: function () {
                Lampa.Controller.toggle('settings');
            }
        });
    }

    function applyStyle(item) {
        $('#custom-bylampa-theme').remove();

        var css = `
            :root {
                --color-main: ${item.main} !important;
                --color-accent: ${item.accent} !important;
                --focus-glow: 0 0 25px ${item.accent} !important;
            }

            body, .background, .p-background, .activity, .layer--full, .layer--cover, .menu, .settings {
                background-color: ${item.bg} !important;
                background-image: none !important;
            }

            /* Фокус без рамок — градиент + свечение */
            .focus, .selector.focus, .card.focus, .button--select.focus, 
            .menu__item.focus, .settings__row.focus, .inputbox.focus {
                background: linear-gradient(135deg, transparent, ${item.accent}22, transparent) !important;
                box-shadow: var(--focus-glow) !important;
                border: none !important;
                outline: none !important;
                transition: all 0.25s ease !important;
            }

            /* Акценты на элементах */
            .button--select, .selector__value, .progress__line, .scroll__bar {
                background: var(--color-main) !important;
            }

            .card__view, .full-start__img, .poster__img {
                border-radius: 12px !important;  /* мягкие углы как в модных темах */
                overflow: hidden !important;
            }

            /* Текст при фокусе ярче */
            .focus .card__title, .focus .menu__label {
                color: #ffffff !important;
                text-shadow: 0 0 10px ${item.main}99 !important;
            }

            /* Убираем стандартные бордеры везде */
            [class*="focus"], [class*="border"], .card, .selector {
                border: none !important;
                outline: none !important;
            }
        `;

        $('<style id="custom-bylampa-theme">' + css + '</style>').appendTo('head');
    }

    // Загрузка сохранённой темы
    var saved = localStorage.getItem('active_theme_data');
    if (saved) {
        try {
            applyStyle(JSON.parse(saved));
        } catch(e) {}
    }

})();