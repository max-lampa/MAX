(function () {
    'use strict';

    function CustomThemesPlugin() {
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var html = $('<div></div>');
        var container = $('<div class="category-full"></div>');
        var info;
        var lastFocus;

        // ВАША РАСШИРЕННАЯ ПАЛИТРА (15 СТИЛЕЙ)
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
            { title: "Киберпанк Желтый", id: "theme_cyber", main: "#f3f315", bg: "#0b0b0b" },
            { title: "Мятный лед", id: "theme_mint", main: "#aaffff", bg: "#001c1c" },
            { title: "Сакура", id: "theme_sakura", main: "#ffc0cb", bg: "#1a0d12" },
            { title: "Ночной город", id: "theme_night", main: "#3d5afe", bg: "#0d0d1a" },
            { title: "Лесной мох", id: "theme_moss", main: "#8bc34a", bg: "#0d1208" },
            { title: "Аметист", id: "theme_amethyst", main: "#9c27b0", bg: "#12081a" }
        ];

        this.create = function () {
            this.activity.loader(true);
            this.build(myCustomStyles);
            return this.render();
        };

        function applyStyle(item) {
            $('#custom-theme-style').remove();
            var css = `
                :root { 
                    --color-main: ${item.main} !important; 
                }
                body, .background, .p-background, .activity, .layer, .scroll, .card__info-inner { 
                    background-color: ${item.bg} !important; 
                    background-image: none !important; 
                }
                .focus, .button.focus, .selector.focus { 
                    border: 3px solid ${item.main} !important; 
                    box-shadow: 0 0 15px ${item.main}66 !important;
                    outline: none !important;
                }
                .menu__item.active, .settings-param.active, .head__settings-item.active, .full-start__button.focus { 
                    color: ${item.main} !important; 
                }
                .is--active, .status--active, .progress__line, .scroll__bar, .settings-param__status, .card__quality { 
                    background-color: ${item.main} !important; 
                    color: #000 !important;
                }
                .info__title, .card__title, .settings-param__name { color: #fff !important; }
            `;
            $('<style id="custom-theme-style">' + css + '</style>').appendTo('head');
        }

        this.append = function (data) {
            var _this = this;
            data.forEach(function (item) {
                // Создаем текстовый элемент вместо тяжелой карточки
                var line = $(`
                    <div class="settings-param selector" style="display:flex; align-items:center; padding: 15px; margin-bottom: 5px; border-radius: 8px;">
                        <div style="width: 25px; height: 25px; background: ${item.main}; border: 2px solid #fff; border-radius: 50%; margin-right: 20px;"></div>
                        <div class="settings-param__name" style="font-size: 1.4em;">${item.title}</div>
                        ${localStorage.getItem("active_theme_id") === item.id ? '<div class="settings-param__status" style="margin-left: auto; padding: 4px 10px; border-radius: 4px; font-weight: bold;">Активна</div>' : ''}
                    </div>
                `);

                line.on('hover:focus', function () {
                    lastFocus = line[0];
                    scroll.update(line, true);
                });

                line.on('hover:enter', function () {
                    applyStyle(item);
                    localStorage.setItem('active_theme_id', item.id);
                    localStorage.setItem('active_theme_data', JSON.stringify(item));
                    Lampa.Noty.show('Стиль "' + item.title + '" активирован');
                    // Перерисовка текущего экрана для обновления меток "Активна"
                    Lampa.Activity.replace({ title: "Палитра", component: "my_themes_plugin", page: 1 });
                });

                container.append(line);
            });
            
            // Кнопка сброса в конце
            var reset = $(`
                <div class="settings-param selector" style="margin-top: 30px; text-align: center; color: #ff4444 !important;">
                    <div class="settings-param__name">СБРОСИТЬ ВСЁ (RELOAD)</div>
                </div>
            `);
            reset.on('hover:enter', function() {
                localStorage.removeItem('active_theme_id');
                localStorage.removeItem('active_theme_data');
                location.reload();
            });
            container.append(reset);
        };

        this.build = function (data) {
            Lampa.Background.change('');
            Lampa.Template.add('info_themes_v4', '<div class="info layer--width"><div class="info__left"><div class="info__title">Настройка оформления</div></div></div>');
            info = Lampa.Template.get("info_themes_v4");
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

    // Добавляем в настройки
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: { name: "custom_themes_v7", type: "static" },
                field: { name: "Мои темы (v7)", description: "15 цветовых схем. Полная совместимость с пультом." },
                onRender: function (item) {
                    item.on("hover:enter", function () {
                        Lampa.Activity.push({ title: "Палитра", component: "my_themes_plugin", page: 1 });
                    });
                }
            });
        }
    });

    // Авто-запуск при включении
    var saved = localStorage.getItem('active_theme_data');
    if (saved) {
        try {
            var itm = JSON.parse(saved);
            $('<style id="custom-theme-style">' +
                ':root { --color-main: ' + itm.main + ' !important; }' +
                'body, .background, .p-background { background-color: ' + itm.bg + ' !important; background-image: none !important; }' +
                '.focus { border: 3px solid ' + itm.main + ' !important; }' +
              '</style>').appendTo('head');
        } catch(e) {}
    }
})();