(function () {
    'use strict';

    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {

            Lampa.SettingsApi.addParam({
                component: 'interface',
                param:   { name: 'custom_themes_simple', type: 'static' },
                field:   { name: 'Стиль оформления', description: '10 красивых тем одним кликом' },
                onRender: function (node) {

                    // Делаем элемент фокусируемым и кликабельным
                    node.addClass('focusable').on('hover:focus', function () {
                        Lampa.Controller.add('custom_themes', {
                            invisible: true
                        });
                    });

                    // Самое главное — реакция на OK / Enter с пульта
                    node.on('hover:enter controller:enter key:enter', function () {
                        showThemeSelector();
                    });
                }
            });
        }
    });

    function showThemeSelector() {
        var themes = [
            { title: "Сиреневый"     , main: "#bb86fc", bg: "#120d1c" },
            { title: "Розовый"       , main: "#ff85a2", bg: "#2b1b1e" },
            { title: "Кровавая луна" , main: "#ff1744", bg: "#140000" },
            { title: "Изумруд"       , main: "#2ecc71", bg: "#0d1a12" },
            { title: "Морская волна" , main: "#00e5ff", bg: "#001a1a" },
            { title: "Золотой песок" , main: "#ffc107", bg: "#1a1400" },
            { title: "Киберпанк"     , main: "#ffff00", bg: "#0d0d0d" },
            { title: "Мятный лед"    , main: "#a5f2f3", bg: "#001f1f" },
            { title: "Неон фиолет"   , main: "#d500f9", bg: "#11001a" },
            { title: "Сбросить всё", action: 'reset' }
        ];

        Lampa.Select.show({
            title: 'Выберите стиль',
            items: themes,
            onSelect: function (a) {
                if (a.action === 'reset') {
                    localStorage.removeItem('active_theme_data');
                    Lampa.Noty.show('Тема сброшена');
                    setTimeout(() => location.reload(), 800);
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
        $('#custom-theme-style').remove();

        var css = `
            :root {
                --color-main: ${item.main} !important;
                --color-accent: ${item.main}cc !important;
            }
            body, .background, .p-background, .activity, .layer--full, .layer--cover {
                background-color: ${item.bg} !important;
                background-image: none !important;
            }
            .focus, .selector.focus, .card.focus, .button--select.focus {
                border: 3px solid var(--color-main) !important;
                box-shadow: 0 0 20px var(--color-accent) !important;
            }
            .menu__item.focus, .settings__row.focus {
                background: linear-gradient(to right, ${item.main}22, transparent) !important;
            }
        `;

        $('<style id="custom-theme-style">' + css + '</style>').appendTo('head');
    }

    // Применяем сохранённую тему при запуске
    var saved = localStorage.getItem('active_theme_data');
    if (saved) {
        try {
            applyStyle(JSON.parse(saved));
        } catch(e) {}
    }

})();