(function () {
    'use strict';

    function CustomThemesPlugin() {
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var html = $('<div></div>');
        var container = $('<div class="category-full"></div>');
        var info;
        var lastFocus;

        // ВАША РАСШИРЕННАЯ ПАЛИТРА
        var myCustomStyles = [
            { title: "Сиреневый неон", id: "theme_purple", main: "#bb86fc", bg: "#120d1c" },
            { title: "Розовый зефир", id: "theme_pink", main: "#ff85a2", bg: "#2b1b1e" },
            { title: "Кровавая луна", id: "theme_blood", main: "#ff0000", bg: "#1a0505" },
            { title: "Изумрудный город", id: "theme_green", main: "#2ecc71", bg: "#0d1a12" },
            { title: "Морская волна", id: "theme_cyan", main: "#00f2ff", bg: "#001a1a" },
            { title: "Золото инков", id: "theme_gold", main: "#ffd700", bg: "#1a1600" },
            { title: "Оранжевый закат", id: "theme_orange", main: "#ff6600", bg: "#1c0b00" },
            { title: "Глубокий синий", id: "theme_deepblue", main: "#3498db", bg: "#050b1a" },
            { title: "Фиолетовый шторм", id: "theme_violet", main: "#8e44ad", bg: "#13061a" },
            { title: "Киберпанк Желтый", id: "theme_cyber", main: "#f3f315", bg: "#111111" }
        ];

        this.create = function () {
            this.activity.loader(true);
            this.build(myCustomStyles);
            return this.render();
        };

        function applyStyle(item) {
            $('#custom-theme-style').remove();
            var css = `
                :root { --color-main: ${item.main} !important; }
                body, .background, .p-background, .activity, .layer, .scroll { 
                    background-color: ${item.bg} !important; 
                    background-image: none !important; 
                }
                .focus, .button.focus, .selector.focus { 
                    border: 3px solid ${item.main} !important; 
                    box-shadow: 0 0 15px ${item.main}cc !important;
                    outline: none !important;
                }
                .menu__item.active, .settings-param.active, .head__settings-item.active { 
                    color: ${item.main} !important; 
                }
                .is--active, .status--active, .progress__line, .scroll__bar { 
                    background-color: ${item.main} !important; 
                }
                .info__title, .card__title { color: #fff !important; }
            `;
            $('<style id="custom-theme-style">' + css + '</style>').appendTo('head');
        }

        this.append = function (data) {
            data.forEach(function (item) {
                var card = Lampa.Template.get("card", { title: item.title, release_year: '' });
                card.addClass("card--collection");
                
                // Превью цвета на карточке
                card.find('.card__img').css({
                    'background-color': item.bg,
                    'border-bottom': '10px solid ' + item.main
                });

                if (localStorage.getItem("active_theme_id") === item.id) {
                    card.find('.card__view').append('<div class="card__quality" style="background:'+item.main+'; color:#000; font-weight:bold">АКТИВНА</div>');
                }

                card.on('hover:focus', function () {
                    lastFocus = card[0];
                    scroll.update(card, true);
                    info.find('.info__title').text(item.title);
                });

                card.on('hover:enter', function () {
                    Lampa.Select.show({
                        title: item.title,
                        items: [
                            { title: 'Применить стиль', action: 'apply' },
                            { title: 'Сбросить (Reload)', action: 'reset' }
                        ],
                        onSelect: function (a) {
                            if (a.action == 'apply') {
                                applyStyle(item);
                                localStorage.setItem('active_theme_id', item.id);
                                localStorage.setItem('active_theme_data', JSON.stringify(item));
                                Lampa.Noty.show('Стиль "' + item.title + '" активирован');
                                Lampa.Activity.backward();
                            } else {
                                $('#custom-theme-style').remove();
                                localStorage.removeItem('active_theme_id');
                                localStorage.removeItem('active_theme_data');
                                location.reload();
                            }
                        },
                        onBack: function(){ Lampa.Controller.toggle('content'); }
                    });
                });
                container.append(card);
            });
        };

        this.build = function (data) {
            Lampa.Background.change('');
            Lampa.Template.add('info_themes_v3', '<div class="info layer--width"><div class="info__left"><div class="info__title">Выберите палитру</div></div></div>');
            info = Lampa.Template.get("info_themes_v3");
            scroll.render().addClass('layer--wheight').data("mheight", info);
            html.append(info).append(scroll.render());
            this.append(data);
            scroll.append(container);
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.start = function () {
            Lampa.Controller.add("content", {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(lastFocus || false, scroll.render());
                },
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

    // КНОПКА В НАСТРОЙКАХ
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: { name: "custom_themes_ext", type: "static" },
                field: { name: "Мои темы (10 цветов)", description: "Полная смена оформления Lampa" },
                onRender: function (item) {
                    item.on("hover:enter", function () {
                        Lampa.Activity.push({ title: "Палитра", component: "my_themes_plugin", page: 1 });
                    });
                }
            });
        }
    });

    // ПРИМЕНЕНИЕ ПРИ СТАРТЕ
    var saved = localStorage.getItem('active_theme_data');
    if (saved) {
        try {
            var item = JSON.parse(saved);
            $('<style id="custom-theme-style">' +
                ':root { --color-main: ' + item.main + ' !important; }' +
                'body, .background, .p-background { background-color: ' + item.bg + ' !important; background-image: none !important; }' +
                '.focus { border: 2px solid ' + item.main + ' !important; }' +
              '</style>').appendTo('head');
        } catch(e) {}
    }
})();