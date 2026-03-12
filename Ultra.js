(function() {
    'use strict';

    // Проверка: загружена ли Lampa
    if (typeof Lampa === 'undefined') {
        console.error('Flora: Lampa is not defined');
        return;
    }

    const BUILTIN_THEMES = [
        { title: 'Тёмная классика', color: '#111111', css: `body { background-color: #111; color: #eee; } .card { background: #222; border-color: #333; } .focus .card { background: #335; }` },
        { title: 'Светлая тема', color: '#f0f0f0', css: `body { background-color: #f0f0f0; color: #222; } .card { background: #fff; border-color: #ccc; } .focus .card { background: #ddf; }` },
        { title: 'Глубокий океан', color: '#001a33', css: `body { background-color: #000b14; color: #a3d5ff; } .card { background: #001a33; border-color: #003366; } .focus .card { background: #004080; }` },
        { title: 'Зелёный лес', color: '#1a2e1a', css: `body { background-color: #0d140d; color: #bdecbd; } .card { background: #1a2e1a; border-color: #2d4d2d; } .focus .card { background: #3d663d; }` },
        { title: 'Винная полночь', color: '#2b0a0a', css: `body { background-color: #140505; color: #ffb3b3; } .card { background: #2b0a0a; border-color: #4d1414; } .focus .card { background: #661a1a; }` },
        { title: 'Фиолетовый неон', color: '#1a0a2b', css: `body { background-color: #0a0414; color: #e0b3ff; } .card { background: #1a0a2b; border-color: #331452; } .focus .card { background: #4d1f7a; }` },
        { title: 'Матрица', color: '#000000', css: `body { background-color: #000; color: #00ff41; } .card { background: #050505; border-color: #008f11; } .focus .card { background: #003b00; border-color: #00ff41; }` },
        { title: 'Киберпанк', color: '#ffee00', css: `body { background-color: #1a1a00; color: #ffee00; } .card { background: #2b2b00; border-color: #ff0055; } .focus .card { background: #ff0055; color: #000; }` },
        { title: 'Мягкий шоколад', color: '#1f1612', css: `body { background-color: #140e0b; color: #d9c5b2; } .card { background: #1f1612; border-color: #3b2a22; } .focus .card { background: #523a2f; }` },
        { title: 'Арктика', color: '#d1e5e5', css: `body { background-color: #d1e5e5; color: #2c3e50; } .card { background: #eef6f6; border-color: #bdd5d5; } .focus .card { background: #3498db; color: #fff; }` },
        { title: 'Королевское золото', color: '#d4af37', css: `body { background-color: #1a160c; color: #d4af37; } .card { background: #262112; border-color: #594d2a; } .focus .card { background: #8c7942; color: #fff; }` },
        { title: 'Графит', color: '#333333', css: `body { background-color: #222; color: #bbb; } .card { background: #2c2c2c; border-color: #444; } .focus .card { background: #555; }` },
        { title: 'Розовый фламинго', color: '#ff85a2', css: `body { background-color: #2b1018; color: #ffccd5; } .card { background: #4d1d2b; border-color: #ff85a2; } .focus .card { background: #ff85a2; color: #000; }` },
        { title: 'Кофейный микс', color: '#3d2b1f', css: `body { background-color: #1f140d; color: #f5ebe0; } .card { background: #3d2b1f; border-color: #634735; } .focus .card { background: #8e5d3e; }` },
        { title: 'Ядовитый плющ', color: '#004d00', css: `body { background-color: #001a00; color: #00ff00; } .card { background: #002b00; border-color: #004d00; } .focus .card { background: #00ff00; color: #000; }` },
        { title: 'Синее пламя', color: '#0000ff', css: `body { background-color: #00001a; color: #66ccff; } .card { background: #00004d; border-color: #0000ff; } .focus .card { background: #0000ff; color: #fff; }` },
        { title: 'Оранжевый закат', color: '#ff6600', css: `body { background-color: #1a0a00; color: #ffcc99; } .card { background: #4d1f00; border-color: #ff6600; } .focus .card { background: #ff6600; color: #000; }` },
        { title: 'Морская пена', color: '#a3e4d7', css: `body { background-color: #1a2e2b; color: #a3e4d7; } .card { background: #2e4d48; border-color: #48c9b0; } .focus .card { background: #1abc9c; color: #fff; }` },
        { title: 'Баклажан', color: '#4a235a', css: `body { background-color: #1b121e; color: #ebdef0; } .card { background: #4a235a; border-color: #7d3c98; } .focus .card { background: #af7ac5; }` },
        { title: 'Сталь', color: '#566573', css: `body { background-color: #1c2833; color: #d5dbdb; } .card { background: #2c3e50; border-color: #566573; } .focus .card { background: #85929e; }` }
    ];

    function applyTheme(css) {
        try {
            $('#flora-style-tag').remove();
            if (css) {
                $('<style id="flora-style-tag">').html(css).appendTo('head');
            }
        } catch(e) { console.error('Flora: Apply error', e); }
    }

    // Инициализация
    try {
        const saved = localStorage.getItem('flora_theme_data');
        if (saved) applyTheme(saved);

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'flora_themes_list', type: 'static' },
            field: {
                name: 'Визуальные темы (Flora)',
                description: 'Выбор цветовой схемы интерфейса (20 вариантов)'
            },
            onRender: function(item) {
                setTimeout(() => {
                    if (item.node) {
                        item.node.insertAfter($('.settings-param[data-name="interface_size"]'));
                        item.on('hover:enter', () => {
                            Lampa.Activity.push({
                                component: 'flora_view',
                                title: 'Темы оформления',
                                page: 1
                            });
                        });
                    }
                }, 100);
            }
        });

        Lampa.Component.add('flora_view', function() {
            let scroll = new Lampa.Scroll({ mask: true, over: true });
            let container = $('<div class="flora-browser"></div>');
            let items = [];
            let last_focus;

            this.create = function() {
                let list = $('<div class="category-full"></div>');
                
                BUILTIN_THEMES.forEach((theme) => {
                    let card = $(`
                        <div class="card card--collection focusable" style="width: 23%; margin: 1%;">
                            <div class="card__view">
                                <div class="card__img" style="background-color: ${theme.color}; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; font-size: 2em; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">🎨</div>
                                <div class="card__title" style="text-align: center; font-size: 0.9em; margin-top: 6px;">${theme.title}</div>
                            </div>
                        </div>
                    `);

                    if (localStorage.getItem('flora_theme_data') === theme.css) {
                        card.find('.card__view').append('<div class="card__quality" style="background: #ffe216; color: #000; left: 5px; top: 5px; opacity: 1;">Активна</div>');
                    }

                    card.on('hover:focus', (e) => {
                        last_focus = e.target;
                        scroll.update($(e.target), true);
                    });

                    card.on('hover:enter', () => {
                        this.showMenu(theme);
                    });

                    list.append(card);
                    items.push(card);
                });

                scroll.append(list);
                container.append(scroll.render());
                return container;
            };

            this.showMenu = function(theme) {
                Lampa.Select.show({
                    title: theme.title,
                    items: [
                        { title: 'Применить тему', action: 'set' },
                        { title: 'Сбросить всё', action: 'reset' }
                    ],
                    onSelect: (item) => {
                        if (item.action === 'set') {
                            localStorage.setItem('flora_theme_data', theme.css);
                            Lampa.Storage.set('background', false);
                            Lampa.Storage.set('glass_style', false);
                            applyTheme(theme.css);
                        } else {
                            localStorage.removeItem('flora_theme_data');
                            Lampa.Storage.set('background', true);
                            applyTheme(null);
                        }
                        Lampa.Activity.backward(); 
                    },
                    onBack: () => Lampa.Controller.toggle('content')
                });
            };

            this.start = function() {
                Lampa.Controller.add('content', {
                    toggle: () => {
                        Lampa.Controller.collectionSet(container);
                        Lampa.Controller.collectionFocus(last_focus || items[0][0], container);
                    },
                    left: () => Navigator.move('left'),
                    right: () => Navigator.move('right'),
                    up: () => Navigator.move('up'),
                    down: () => Navigator.move('down'),
                    back: () => Lampa.Activity.backward()
                });
                Lampa.Controller.toggle('content');
            };

            this.pause = this.stop = function() {};
            this.destroy = function() {
                scroll.destroy();
                container.remove();
                items = [];
            };
            this.render = function() { return container; };
        });
    } catch(err) {
        console.error('Flora: Global Error', err);
    }
})();
