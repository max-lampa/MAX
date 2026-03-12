(function() {
    'use strict';

    if (typeof Lampa === 'undefined') return;

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
        $('#max-style-tag').remove();
        if (css) $('<style id="max-style-tag">').html(css).appendTo('head');
    }

    const saved = localStorage.getItem('max_theme_data');
    if (saved) applyTheme(saved);

    // Добавляем пункт в настройки интерфейса
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'max_themes_btn', type: 'static' },
        field: { name: 'Тема MaX', description: 'Выбрать цветовую схему интерфейса' },
        onRender: function(item) {
            console.log('Тема MaX: onRender вызван');
            setTimeout(() => {
                const button = item.node || $('.settings-param[data-name="max_themes_btn"]');
                if (button.length) {
                    console.log('Тема MaX: кнопка найдена, добавляем в интерфейс');
                    // Находим контейнер всех настроек интерфейса и добавляем кнопку в конец
                    const settingsContainer = $('.settings[data-component="interface"] .settings__list');
                    if (settingsContainer.length) {
                        settingsContainer.append(button);
                    } else {
                        // Запасной вариант – вставить после размера интерфейса
                        button.insertAfter($('.settings-param[data-name="interface_size"]'));
                    }

                    // Удаляем старый обработчик, чтобы не было дублей
                    button.off('hover:enter');
                    // Добавляем обработчик через Lampa.Listener (надёжнее)
                    Lampa.Listener.add('settings_interface_click', function(e) {
                        if ($(e.target).closest('.settings-param[data-name="max_themes_btn"]').length) {
                            console.log('Тема MaX: нажатие на кнопку');
                            Lampa.Activity.push({
                                component: 'max_browser',
                                title: 'Темы оформления',
                                page: 1
                            });
                        }
                    });
                } else {
                    console.log('Тема MaX: кнопка не найдена');
                }
            }, 300);
        }
    });

    Lampa.Component.add('max_browser', function() {
        let scroll = new Lampa.Scroll({ mask: true, over: true });
        let container = $('<div class="max-list"></div>');
        let items = [];
        let last_focus;

        this.create = function() {
            console.log('Тема MaX: создание списка тем');
            let list = $('<div class="category-full" style="display: flex; flex-wrap: wrap; padding: 1.5em;"></div>');
            BUILTIN_THEMES.forEach((theme) => {
                let card = $(`
                    <div class="card card--collection focusable" style="width: 23%; margin: 1%;">
                        <div class="card__view">
                            <div class="card__img" style="background-color: ${theme.color}; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; font-size: 2.2em; border-radius: 8px; border: 2px solid rgba(255,255,255,0.15);">🎨</div>
                            <div class="card__title" style="text-align: center; font-size: 1.1em; margin-top: 0.8em; white-space: nowrap; overflow: hidden;">${theme.title}</div>
                        </div>
                    </div>
                `);

                if (localStorage.getItem('max_theme_data') === theme.css) {
                    card.find('.card__view').append('<div class="card__quality" style="background: #ffe216; color: #000; top: 10px; left: 10px;">Активна</div>');
                }

                card.on('hover:focus', (e) => {
                    last_focus = e.target;
                    scroll.update($(e.target), true);
                });

                card.on('hover:enter', () => {
                    console.log('Тема MaX: выбрана тема ' + theme.title);
                    localStorage.setItem('max_theme_data', theme.css);
                    Lampa.Storage.set('background', false);
                    Lampa.Storage.set('glass_style', false);
                    applyTheme(theme.css);
                    Lampa.Activity.backward();
                });

                list.append(card);
                items.push(card);
            });
            scroll.append(list);
            container.append(scroll.render());
            return container;
        };

        this.start = function() {
            console.log('Тема MaX: запуск компонента');
            Lampa.Controller.add('content', {
                toggle: () => {
                    Lampa.Controller.collectionSet(container);
                    Lampa.Controller.collectionFocus(last_focus || items[0][0], container);
                },
                back: () => Lampa.Activity.backward()
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = this.stop = function() {};
        this.destroy = function() {
            scroll.destroy();
            container.remove();
        };
        this.render = function() { return container; };
    });
})();