(function() {
    'use strict';

    // =========================================================
    // ВСТРОЕННЫЕ ТЕМЫ – добавьте свои или измените существующие
    // =========================================================
    const BUILTIN_THEMES = [
        {
            title: 'Тёмная классика',
            css: `
                body { background-color: #111; color: #eee; }
                .card { background: #222; border-color: #333; }
                .focus .card { background: #335; }
            `,
            color: '#222222'
        },
        {
            title: 'Светлая тема',
            css: `
                body { background-color: #f0f0f0; color: #222; }
                .card { background: #fff; border-color: #ccc; }
                .focus .card { background: #ddf; }
            `,
            color: '#f0f0f0'
        },
        {
            title: 'Синий акцент',
            css: `
                body { background-color: #001122; color: #ccddee; }
                .card { background: #112233; border-color: #224466; }
                .focus .card { background: #1a3355; }
            `,
            color: '#001122'
        },
        {
            title: 'Зелёная листва',
            css: `
                body { background-color: #112211; color: #ccddcc; }
                .card { background: #223322; border-color: #335533; }
                .focus .card { background: #2a442a; }
            `,
            color: '#112211'
        },
        {
            title: 'Красный закат',
            css: `
                body { background-color: #221111; color: #ddcccc; }
                .card { background: #332222; border-color: #553333; }
                .focus .card { background: #442a2a; }
            `,
            color: '#221111'
        },
        {
            title: 'Фиолетовый туман',
            css: `
                body { background-color: #1a1122; color: #d9ccdd; }
                .card { background: #2a2233; border-color: #443355; }
                .focus .card { background: #332a44; }
            `,
            color: '#1a1122'
        }
    ];

    // Применяем сохранённую тему при загрузке
    const savedTheme = localStorage.getItem('selectedThemeCSS');
    if (savedTheme) {
        $('<style>').addClass('theme-css').html(savedTheme).appendTo('head');
    }

    // Пункт в настройках интерфейса
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'themes_safe', type: 'static' },
        field: {
            name: 'Темы оформления (безопасные)',
            description: 'Встроенные темы без внешних серверов'
        },
        onRender: function(item) {
            setTimeout(() => {
                $('.settings-param > div:contains("Темы оформления (безопасные)")')
                    .parent()
                    .insertAfter($('div[data-name="interface_size"]'));

                item.on('hover:enter', () => {
                    if ($('.settings-param').length || $('.settings-folder').length) {
                        window.history.back();
                    }
                    setTimeout(() => {
                        Lampa.Activity.push({
                            component: 'themes_browser_safe',
                            page: 1
                        });
                    }, 100);
                });
            }, 0);
        }
    });

    // Компонент для просмотра встроенных тем
    Lampa.Component.add('themes_browser_safe', function() {
        const scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        const container = $('<div class="themes-browser-safe" style="height: 100%; display: flex; flex-direction: column;"></div>');
        const cardsContainer = $('<div class="cards-grid" style="padding: 1em; display: flex; flex-wrap: wrap;"></div>');
        let currentFocus = null;

        this.emit = function() {};
        this.pause = this.stop = function() {};

        this.create = function() {
            this.build();
            return container;
        };

        this.build = function() {
            // Заголовок
            const header = $(`
                <div class="themes-header" style="padding: 1em; text-align: center; flex-shrink: 0;">
                    <div class="selector" style="display: inline-block; padding: 0.8em 2em; background: #333; border-radius: 2em;">
                        <span>Встроенные темы (${BUILTIN_THEMES.length} шт.)</span>
                    </div>
                </div>
            `);
            container.append(header);

            // Контейнер для скролла
            const scrollContainer = scroll.render();
            scrollContainer.css({
                'flex': '1',
                'min-height': '0',
                'height': 'auto'
            });
            container.append(scrollContainer);

            // Создаём карточки вручную, без Lampa.Template
            BUILTIN_THEMES.forEach((theme, index) => {
                const card = $(`
                    <div class="card card--collection focusable" style="width: 14.2%; margin: 0.5%; text-align: center;">
                        <div class="card__view" style="position: relative;">
                            <div class="card__img" style="background-color: ${theme.color}; aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; font-size: 2em; color: #fff; border-radius: 4px;">
                                <span>🎨</span>
                            </div>
                            <div class="card__title" style="padding: 0.5em 0;">${theme.title}</div>
                        </div>
                    </div>
                `);

                // Если тема установлена, добавляем метку
                if (localStorage.getItem('selectedThemeCSS') === theme.css) {
                    const label = $(`
                        <div class="card__quality" style="position: absolute; left: -3%; bottom: 70%; padding: 0.4em; background: #ffe216; color: #000; font-size: 0.8em; border-radius: 0.3em; text-transform: uppercase;">
                            Установлена
                        </div>
                    `);
                    card.find('.card__view').append(label);
                }

                // Обработчики фокуса
                card.on('hover:focus', () => {
                    currentFocus = card[0];
                    scroll.update(card, true);
                });

                // Обработчик нажатия
                card.on('hover:enter', () => {
                    Lampa.Select.show({
                        title: '',
                        items: [
                            { title: 'Установить' },
                            { title: 'Удалить' }
                        ],
                        onBack: () => Lampa.Controller.toggle('content'),
                        onSelect: item => {
                            if (item.title === 'Установить') {
                                installTheme(theme.css, card);
                            } else if (item.title === 'Удалить') {
                                uninstallTheme(card);
                            }
                        }
                    });
                });

                cardsContainer.append(card);
            });

            scroll.append(cardsContainer);
            setTimeout(() => scroll.update(), 100);

            this.activity.loader(false);
            this.activity.toggle();
        };

        this.start = function() {
            Lampa.Controller.add('content', {
                toggle: () => {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(currentFocus || false, scroll.render());
                },
                left: () => Navigator.canmove('left') ? Navigator.move('left') : Lampa.Controller.toggle('menu'),
                right: () => {
                    if (Navigator.canmove('right')) Navigator.move('right');
                },
                up: () => {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: () => {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: () => Lampa.Activity.backward()
            });
            Lampa.Controller.toggle('content');
        };

        this.render = () => container;

        this.destroy = function() {
            scroll.destroy();
            container.remove();
        };

        // Функции установки/удаления
        function installTheme(css, card) {
            $('style.theme-css').remove();
            $('<style>').addClass('theme-css').html(css).appendTo('head');
            localStorage.setItem('selectedThemeCSS', css);
            $('.card__quality').remove();
            const label = $(`
                <div class="card__quality" style="position: absolute; left: -3%; bottom: 70%; padding: 0.4em; background: #ffe216; color: #000; font-size: 0.8em; border-radius: 0.3em; text-transform: uppercase;">
                    Установлена
                </div>
            `);
            card.find('.card__view').append(label);

            // Сохраняем и отключаем стандартные настройки
            if (Lampa.Storage.get('background') === true) {
                Lampa.Storage.set('myBackground', Lampa.Storage.get('background'));
                Lampa.Storage.set('background', 'false');
            }
            if (Lampa.Storage.get('glass_style') === true) {
                Lampa.Storage.set('myGlassStyle', Lampa.Storage.get('glass_style'));
                Lampa.Storage.set('glass_style', 'false');
            }
            if (Lampa.Storage.get('black_style') === true) {
                Lampa.Storage.set('myBlackStyle', Lampa.Storage.get('black_style'));
                Lampa.Storage.set('black_style', 'false');
            }
            Lampa.Controller.toggle('content');
        }

        function uninstallTheme(card) {
            $('style.theme-css').remove();
            localStorage.removeItem('selectedThemeCSS');
            $('.card__quality').remove();

            if (localStorage.getItem('myBackground')) {
                Lampa.Storage.set('background', Lampa.Storage.get('myBackground'));
                localStorage.removeItem('myBackground');
            }
            if (localStorage.getItem('myGlassStyle')) {
                Lampa.Storage.set('glass_style', Lampa.Storage.get('myGlassStyle'));
                localStorage.removeItem('myGlassStyle');
            }
            if (localStorage.getItem('myBlackStyle')) {
                Lampa.Storage.set('black_style', Lampa.Storage.get('myBlackStyle'));
                localStorage.removeItem('myBlackStyle');
            }
            Lampa.Controller.toggle('content');
        }
    });

    // Очистка при выходе
    Lampa.Storage.listener.follow('change', e => {
        if (e.name === 'activity' && Lampa.Activity.active().component !== 'themes_browser_safe') {
            setTimeout(() => $('.themes-header').remove(), 0);
        }
    });
})();