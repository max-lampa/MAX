(function () {
    'use strict';

    function CustomThemesPlugin() {
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var html = $('<div></div>');
        var container = $('<div class="my_themes category-full"></div>');
        var info;
        var lastFocus;

        var myCustomStyles = [
            { title: "Сиреневый неон", id: "theme_purple", main_color: "#bb86fc", bg_color: "#120d1c" },
            { title: "Розовый зефир", id: "theme_pink", main_color: "#ff85a2", bg_color: "#2b1b1e" },
            { title: "Кровавая луна", id: "theme_blood", main_color: "#ff0000", bg_color: "#1a0505" },
            { title: "Изумрудный город", id: "theme_green", main_color: "#2ecc71", bg_color: "#0d1a12" }
        ];

        this.create = function () {
            this.activity.loader(true);
            this.build(myCustomStyles);
            return this.render();
        };

        function injectFullCSS(item) {
            $('#custom-dynamic-theme').remove();
            var style = '<style id="custom-dynamic-theme">' +
                ':root { --color-main: ' + item.main_color + ' !important; }' +
                'body, .background, .p-background, .activity, .layer { background-color: ' + item.bg_color + ' !important; background-image: none !important; }' +
                '.focus, .button.focus, .selector.focus { border: 3px solid ' + item.main_color + ' !important; outline: none !important; box-shadow: 0 0 20px ' + item.main_color + '66 !important; }' +
                '.menu__item.active, .head__settings-item.active, .settings-param.active { color: ' + item.main_color + ' !important; }' +
                '.is--active, .status--active, .progress__line, .scroll__bar, .settings-param__status { background-color: ' + item.main_color + ' !important; }' +
                '.info__title, .card__title { color: #fff !important; }' +
                '</style>';
            $('body').append(style);
        }

        this.append = function (data) {
            var _this = this;
            data.forEach(function (item) {
                var card = Lampa.Template.get("card", { title: item.title, release_year: '' });
                card.addClass("card--collection");
                card.find('.card__img').css('background-color', item.bg_color);
                
                if (localStorage.getItem("active_theme_id") === item.id) {
                    card.find('.card__view').append('<div style="position:absolute;left:5px;bottom:10px;padding:4px 8px;background:'+item.main_color+';color:#000;border-radius:4px;font-size:12px;font-weight:bold;">Активна</div>');
                }

                card.on('hover:focus', function () {
                    lastFocus = card[0];
                    scroll.update(card, true);
                    info.find('.info__title').text(item.title);
                });

                card.on("hover:enter", function () {
                    Lampa.Select.show({
                        title: item.title,
                        items: [{ title: "Применить", action: 'set' }, { title: "Сбросить", action: 'reset' }],
                        onSelect: function (btn) {
                            if (btn.action === 'set') {
                                injectFullCSS(item);
                                localStorage.setItem('active_theme_id', item.id);
                                localStorage.setItem('active_theme_data', JSON.stringify(item));
                            } else {
                                $('#custom-dynamic-theme').remove();
                                localStorage.removeItem("active_theme_id");
                                localStorage.removeItem("active_theme_data");
                                location.reload();
                            }
                            Lampa.Controller.toggle("content");
                        },
                        onBack: function () { Lampa.Controller.toggle('content'); }
                    });
                });
                container.append(card);
            });
        };

        this.build = function (data) {
            Lampa.Background.change('');
            Lampa.Template.add('info_themes', '<div class="info layer--width"><div class="info__left"><div class="info__title">Мои темы</div></div></div>');
            info = Lampa.Template.get("info_themes");
            scroll.render().addClass('layer--wheight').data("mheight", info);
            html.append(info).append(scroll.render());
            this.append(data);
            scroll.append(container);
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.start = function () {
            Lampa.Controller.add("content", {
                toggle: function () { Lampa.Controller.collectionSet(scroll.render()); Lampa.Controller.collectionFocus(lastFocus || false, scroll.render()); },
                left: function () { Lampa.Controller.toggle('menu'); },
                up: function () { Lampa.Controller.toggle("head"); },
                back: function () { Lampa.Activity.backward(); }
            });
            Lampa.Controller.toggle("content");
        };

        this.render = function () { return html; };
        this.destroy = function () { scroll.destroy(); html.remove(); };
    }

    Lampa.Component.add('my_themes_plugin', CustomThemesPlugin);

    // ОФИЦИАЛЬНАЯ РЕГИСТРАЦИЯ В НАСТРОЙКАХ
    function setupSettings() {
        Lampa.SettingsApi.addParam({
            component: "interface",
            param: { name: "custom_themes_btn", type: "static" },
            field: { name: "Цветные темы", description: "Нажмите для выбора (Розовый, Сиреневый и др.)" },
            onRender: function (item) {
                item.on("hover:enter", function () {
                    Lampa.Activity.push({ title: "Мои темы", component: "my_themes_plugin", page: 1 });
                });
            }
        });
    }

    // Запуск через официальный слушатель приложения
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            setupSettings();
        }
    });

    // Применение темы при старте
    try {
        var saved = localStorage.getItem('active_theme_data');
        if (saved) {
            var item = JSON.parse(saved);
            $('body').append('<style id="custom-dynamic-theme">:root { --color-main: '+item.main_color+' !important; } body, .background, .p-background { background-color: '+item.bg_color+' !important; background-image: none !important; } .focus { border: 2px solid '+item.main_color+' !important; }</style>');
        }
    } catch(e) {}

})();
