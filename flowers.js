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
            // Цвет для превью (вместо картинки)
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
        }
    ];
    // =========================================================

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
        const container = $('<div class="themes-browser-safe"></div>');
        let cardsContainer = $('<div class="cards-grid"></div>');
        let currentFocus = null;

        this.emit = function() {};
        this.pause = this.stop = function() {};

        this.create = function() {
            this.build();
            return container;
        };

        this.build = function() {
            // Заголовок (можно убрать, если не нужны категории)
            const header = $(`
                <div class="themes-header" style="padding: 1em; text-align: center;">
                    <div class="selector" style="display: inline-block; padding: 0.8em 2em; background: #333; border-radius: 2em;">
                        <span>Встроенные темы</span>
                    </div>
                </div>
            `);
            container.append(header);

            BUILTIN_THEMES.forEach((theme, index) => {
                const card = Lampa.Template.get('card', {
                    title: theme.title,
                    release_year: ''
                });
                card.addClass('theme-card');
                card.find('.card__img').css({
                    'background-color': theme.color,
                    'cursor': 'pointer',
                    'display': 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'color': '#fff',
                    'font-size': '2em'
                }).html('<span style="opacity:0.7;">🎨</span>'); // эмодзи как заглушка

                // Если тема уже установлена – ставим метку
                if (localStorage.getItem('selectedThemeCSS') === theme.css) {
                    addInstalledLabel(card);
                }

                card.on('hover:focus', () => {
                    currentFocus = card[0];
                    scroll.update(card, true);
                });

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
            container.append(scroll.render());

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
                    // Без категорий ничего не делаем
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

        // Вспомогательные функции
        function addInstalledLabel(card) {
            const label = $('<div class="card__quality">Установлена</div>').css({
                position: 'absolute',
                left: '-3%',
                bottom: '70%',
                padding: '0.4em 0.4em',
                background: '#ffe216',
                color: '#000',
                fontSize: '0.8em',
                borderRadius: '0.3em',
                textTransform: 'uppercase'
            });
            card.find('.card__view').append(label);
        }

        function installTheme(css, card) {
            // Удаляем предыдущую тему (по классу)
            $('style.theme-css').remove();
            // Добавляем новую
            $('<style>').addClass('theme-css').html(css).appendTo('head');
            localStorage.setItem('selectedThemeCSS', css);
            // Обновляем метки
            $('.card__quality').remove();
            addInstalledLabel(card);
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
            // Восстанавливаем стандартные настройки
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