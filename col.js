(function () {
    'use strict';

    function CustomThemesPlugin() {
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var html = $('<div></div>');
        var container = $('<div class="my_themes category-full"></div>');
        var info;
        var lastFocus;

        var myCustomStyles = [
            { title: "Сиреневый неон", id: "theme_purple", main_color: "#bb86fc", bg_color: "#120d1c", logo: "https://placehold.co/300x450/bb86fc/ffffff?text=Purple+Neon" },
            { title: "Розовый зефир", id: "theme_pink", main_color: "#ff85a2", bg_color: "#2b1b1e", logo: "https://placehold.co/300x450/ff85a2/ffffff?text=Pink+Candy" },
            { title: "Кровавая луна", id: "theme_blood", main_color: "#ff0000", bg_color: "#1a0505", logo: "https://placehold.co/300x450/990000/ffffff?text=Blood+Red" },
            { title: "Изумрудный город", id: "theme_green", main_color: "#2ecc71", bg_color: "#0d1a12", logo: "https://placehold.co/300x450/2ecc71/ffffff?text=Emerald+Green" }
        ];

        this.create = function () {
            this.activity.loader(true);
            this.build(myCustomStyles);
            return this.render();
        };

        this.append = function (data) {
            var _this = this;
            data.forEach(function (item) {
                var card = Lampa.Template.get("card", { title: item.title, release_year: '' });
                card.addClass("card--collection");
                var img = card.find(".card__img")[0];
                img.onload = function () { card.addClass("card--loaded"); };
                img.src = item.logo;

                if (localStorage.getItem("active_theme_id") === item.id) {
                    var label = $('<div class="card__quality">Активна</div>');
                    card.find('.card__view').append(label);
                    label.css({ 'position': "absolute", 'left': "5px", 'bottom': "10px", 'padding': "4px 8px", 'background': '#fff', 'color': '#000', 'borderRadius': "4px", 'fontSize': "12px" });
                }

                card.on('hover:focus', function () {
                    lastFocus = card[0];
                    scroll.update(card, true);
                    info.find('.info__title').text(item.title);
                });

                card.on("hover:enter", function () {
                    Lampa.Select.show({
                        title: item.title,
                        items: [{ title: "Применить", action: 'set' }, { title: "Сбросить всё", action: 'reset' }],
                        onSelect: function (btn) {
                            if (btn.action === 'set') {
                                $('#custom-dynamic-theme').remove();
                                $('body').append('<style id="custom-dynamic-theme">:root { --color-main: '+item.main_color+' !important; } body { background-color: '+item.bg_color+' !important; } .focus { outline: 0.35em solid '+item.main_color+' !important; }</style>');
                                localStorage.setItem('active_theme_id', item.id);
                                localStorage.setItem('active_theme_data', JSON.stringify(item));
                            } else {
                                $('#custom-dynamic-theme').remove();
                                localStorage.removeItem("active_theme_id");
                                localStorage.removeItem("active_theme_data");
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
            Lampa.Template.add('info_tpl', '<div class="info layer--width"><div class="info__left"><div class="info__title">Мои темы</div></div></div>');
            info = Lampa.Template.get("info_tpl");
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

    // Регистрация компонента
    Lampa.Component.add('my_themes_plugin', CustomThemesPlugin);

    // Функция добавления кнопки в правое меню настроек
    function addBtn() {
        if ($('.head__settings').length) {
            if ($('.menu-add-themes').length) return;
            var btn = $('<div class="head__settings-item selector menu-add-themes"><span>Мои темы</span></div>');
            btn.on('hover:enter', function () {
                Lampa.Activity.push({ title: "Мои темы", component: "my_themes_plugin", page: 1 });
            });
            $('.head__settings').prepend(btn);
        }
    }

    // Безопасный запуск
    var waitLampa = setInterval(function() {
        if (typeof Lampa !== 'undefined' && $('.head__settings').length) {
            addBtn();
            // Не очищаем интервал, так как правое меню может перерисовываться
        }
    }, 2000);

    // Применение темы при старте
    try {
        var saved = localStorage.getItem('active_theme_data');
        if (saved) {
            var item = JSON.parse(saved);
            $('body').append('<style id="custom-dynamic-theme">:root { --color-main: '+item.main_color+' !important; } body { background-color: '+item.bg_color+' !important; } .focus { outline: 0.35em solid '+item.main_color+' !important; }</style>');
        }
    } catch(e) {}

})();
