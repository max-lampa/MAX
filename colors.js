(function () {
    'use strict';

    function CustomThemesPlugin() {
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var html = $('<div class="settings-list layer--wheight"></div>'); // Убрали лишние классы рамок
        var container = $('<div class="settings-list__content"></div>');
        var lastFocus;

        var myCustomStyles = [
            { title: "Сиреневый неон", id: "theme_purple", main: "#bb86fc", bg: "#120d1c" },
            { title: "Розовый зефир", id: "theme_pink", main: "#ff85a2", bg: "#2b1b1e" },
            { title: "Кровавая луна", id: "theme_blood", main: "#ff0000", bg: "#1a0505" },
            { title: "Изумрудный город", id: "theme_green", main: "#2ecc71", bg: "#0d1a12" },
            { title: "Морская волна", id: "theme_cyan", main: "#00f2ff", bg: "#001a1a" },
            { title: "Золото инков", id: "theme_gold", main: "#ffd700", bg: "#1a1600" },
            { title: "Киберпанк", id: "theme_cyber", main: "#f3f315", bg: "#0b0b0b" },
            { title: "Мятный лед", id: "theme_mint", main: "#aaffff", bg: "#001c1c" },
            { title: "Сакура", id: "theme_sakura", main: "#ffc0cb", bg: "#1a0d12" },
            { title: "Аметист", id: "theme_amethyst", main: "#9c27b0", bg: "#12081a" }
        ];

        this.create = function () {
            var _this = this;
            this.activity.loader(true);
            
            myCustomStyles.forEach(function (item) {
                var is_active = localStorage.getItem("active_theme_id") === item.id;
                var line = $(`
                    <div class="settings-param selector">
                        <div class="settings-param__name">${item.title}</div>
                        <div class="settings-param__value" style="color:${item.main} !important">${is_active ? 'Активна' : 'Выбрать'}</div>
                        <div style="width: 12px; height: 12px; background: ${item.main}; border-radius: 50%; margin-left: 10px;"></div>
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
                    Lampa.Noty.show('Тема изменена: ' + item.title);
                    // Перезагружаем только активность, чтобы обновить надпись "Активна"
                    Lampa.Activity.replace({ title: "Темы", component: "custom_themes_v9", page: 1 });
                });

                container.append(line);
            });

            scroll.append(container);
            html.append(scroll.render());
            this.activity.loader(false);
            this.activity.toggle();
        };

        function applyStyle(item) {
            $('#custom-theme-style').remove();
            var css = `
                :root { --color-main: ${item.main} !important; }
                body, .background, .p-background, .activity, .layer, .scroll { 
                    background-color: ${item.bg} !important; 
                    background-image: none !important; 
                }
                .focus, .selector.focus { 
                    background: rgba(255,255,255,0.08) !important;
                    color: ${item.main} !important;
                }
                .is--active, .status--active, .progress__line, .scroll__bar { 
                    background-color: ${item.main} !important; 
                }
            `;
            $('<style id="custom-theme-style">' + css + '</style>').appendTo('head');
        }

        this.start = function () {
            Lampa.Controller.add("content", {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.collectionFocus(lastFocus || container.find('.selector')[0], html);
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

    Lampa.Component.add('custom_themes_v9', CustomThemesPlugin);

    // Регистрация в Интерфейсе
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: { name: "custom_themes_final", type: "static" },
                field: { name: "Темы оформления", description: "Исправлен фокус пульта и рамки" },
                onRender: function (item) {
                    item.on("hover:enter", function () {
                        Lampa.Activity.push({ title: "Выбор темы", component: "custom_themes_v9", page: 1 });
                    });
                }
            });
        }
    });

    // Авто-старт сохраненной темы
    var saved = localStorage.getItem('active_theme_data');
    if (saved) {
        try {
            var itm = JSON.parse(saved);
            $('<style id="custom-theme-style">:root { --color-main: '+itm.main+' !important; } body, .background, .p-background { background-color: '+itm.bg+' !important; background-image: none !important; }</style>').appendTo('head');
        } catch(e) {}
    }
})();