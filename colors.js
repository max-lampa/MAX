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
            data.forEach(function (item) {
                var card = Lampa.Template.get("card", { title: item.title, release_year: '' });
                card.addClass("card--collection");
                var img = card.find(".card__img")[0];
                img.onload = function () { card.addClass("card--loaded"); };
                img.src = item.logo;

                if (localStorage.getItem("active_theme_id") === item.id) markInstalled(card);

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
                            if (btn.action === 'set') { generateAndApplyTheme(item); markInstalled(card); }
                            else { resetTheme(); }
                            Lampa.Controller.toggle("content");
                        },
                        onBack: function () { Lampa.Controller.toggle('content'); }
                    });
                });
                container.append(card);
            });
        };

        function markInstalled(card) {
            $(".theme-status").remove();
            var label = $('<div class="card__quality theme-status">Активна</div>');
            card.find('.card__view').append(label);
            label.css({ 'position': "absolute", 'left': "5px", 'bottom': "10px", 'padding': "4px 8px", 'background': '#fff', 'color': '#000', 'borderRadius': "4px", 'fontSize': "12px" });
        }

        function generateAndApplyTheme(item) {
            $('#custom-dynamic-theme').remove();
            $('body').append(`<style id="custom-dynamic-theme">
                :root { --color-main: ${item.main_color} !important; } 
                body { background-color: ${item.bg_color} !important; } 
                .focus { outline: 0.35em solid ${item.main_color} !important; box-shadow: 0 0 20px ${item.main_color}66; } 
                .menu__item.active { color: ${item.main_color} !important; }
                .button.focus { background: ${item.main_color} !important; color: #fff !important; }
                .is--active, .status--active { background-color: ${item.main_color} !important; }
            </style>`);
            localStorage.setItem('active_theme_id', item.id);
            localStorage.setItem('active_theme_data', JSON.stringify(item));
        }

        function resetTheme() {
            $('#custom-dynamic-theme').remove();
            localStorage.removeItem("active_theme_id");
            localStorage.removeItem("active_theme_data");
            location.reload();
        }

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

    // Внедрение в ПРАВОЕ меню (Settings Menu)
    function injectToRightMenu() {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                // Таймер нужен, чтобы Lampa успела отрисовать структуру меню
                setInterval(function() {
                    if ($('.head__settings').length && !$('.head__settings .menu-add-themes').length) {
                        var btn = $('<div class="head__settings-item selector menu-add-themes
