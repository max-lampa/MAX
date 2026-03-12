(function () {
    'use strict';
    Lampa.Platform.tv();

    // ----------------------------------------------------------------------
    // НАСТРОЙКИ ИСТОЧНИКА ТЕМ – замените на свой URL и категории
    // ----------------------------------------------------------------------
    const THEMES_BASE_URL = 'https://your-themes-source.com'; // Например: 'https://bylampa.github.io/themes'
    const CATEGORIES = [
        { title: 'Focus Pack',      url: THEMES_BASE_URL + '/categories/stroke.json' },
        { title: 'Color Gallery',   url: THEMES_BASE_URL + '/categories/color_gallery.json' },
        { title: 'Gradient Style',  url: THEMES_BASE_URL + '/categories/gradient_style.json' }
    ];
    // ----------------------------------------------------------------------

    // Применяем сохранённую тему при загрузке
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        $('body').append($('<link>', { rel: 'stylesheet', href: savedTheme, class: 'theme-css' }));
    }

    // Добавляем пункт в настройки интерфейса
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'my_themes', type: 'static' },
        field: {
            name: 'Мои темы',
            description: 'Измени палитру элементов приложения'
        },
        onRender: function (item) {
            setTimeout(() => {
                $('.settings-param > div:contains("Мои темы")')
                    .parent()
                    .insertAfter($('div[data-name="interface_size"]'));

                item.on('hover:enter', () => {
                    setTimeout(() => {
                        if ($('.settings-param').length || $('.settings-folder').length) {
                            window.history.back();
                        }
                    }, 50);

                    setTimeout(() => {
                        let current = Lampa.Storage.get('themesCurrent');
                        if (!current || current === '') {
                            current = {
                                url: CATEGORIES[0].url,
                                title: CATEGORIES[0].title,
                                component: 'my_themes',
                                page: 1
                            };
                        } else {
                            try {
                                current = JSON.parse(current);
                            } catch (e) {
                                current = CATEGORIES[0];
                            }
                        }
                        Lampa.Activity.push(current);
                        Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
                    }, 100);
                });
            }, 0);
        }
    });

    // ----------------------------------------------------------------------
    // КОМПОНЕНТ my_themes
    // ----------------------------------------------------------------------
    function ThemesComponent(options) {
        // Используем Lampa.Reguest (с опечаткой, как в оригинале)
        const request = new Lampa.Reguest();
        const scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        const cards = [];
        const container = $('<div></div>');
        const cardsContainer = $('<div class="my_themes category-full"></div>');

        // Инициализируем infoBlock пустым элементом, чтобы избежать undefined
        let infoBlock = $('<div style="display:none;"></div>');
        let currentFocusedCard = null;

        // Заглушка для emit (требуется Lampa)
        this.emit = function() {};

        this.create = function () {
            const self = this;
            this.activity.loader(true);

            request.silent(
                options.url,
                data => self.build(data),
                () => {
                    // Ошибка загрузки – показываем заглушку
                    const empty = new Lampa.Empty();
                    container.append(empty.render());
                    self.start = empty.start;
                    self.activity.loader(false);
                    self.activity.toggle();
                }
            );

            return this.render();
        };

        // Добавление карточек тем
        this.append = function (themes) {
            themes.forEach(theme => {
                const card = Lampa.Template.get('card', {
                    title: theme.title,
                    release_year: ''
                });
                card.addClass('card--collection');
                card.find('.card__img').css({
                    cursor: 'pointer',
                    'background-color': '#353535a6'
                });
                card.css({ 'text-align': 'center' });

                const img = card.find('.card__img')[0];
                img.onload = () => card.addClass('card--loaded');
                img.onerror = () => { img.src = './img/img_broken.svg'; };
                img.src = theme.logo;

                if (localStorage.getItem('selectedTheme') === theme.css) {
                    addInstalledLabel(card);
                }

                card.on('hover:focus', () => {
                    currentFocusedCard = card[0];
                    scroll.update(card, true);
                    if (infoBlock && infoBlock.length) {
                        infoBlock.find('.info__title').text(theme.title);
                    }
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
                cards.push(card);
            });
        };

        // Построение интерфейса после загрузки данных
        this.build = function (data) {
            const self = this;
            Lampa.Background.change('');

            // Шаблоны
            Lampa.Template.add('button_category', `
                <div id="button_category">
                    <style>
                        @media screen and (max-width: 2560px) {
                            .themes .card--collection { width: 14.2% !important; }
                            .scroll__content { padding: 1.5em 0 !important; }
                            .info { height: 9em !important; }
                            .info__title-original { font-size: 1.2em; }
                        }
                        @media screen and (max-width: 385px) {
                            .info__right { display: contents !important; }
                            .themes .card--collection { width: 33.3% !important; }
                        }
                        @media screen and (max-width: 580px) {
                            .info__right { display: contents !important; }
                            .themes .card--collection { width: 25% !important; }
                        }
                    </style>
                    <div class="full-start__button selector view--category">
                        <svg style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 24 24">
                            <g id="icons">
                                <g id="menu">
                                    <path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z" fill="currentColor"/>
                                    <path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z" fill="currentColor"/>
                                    <path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z" fill="currentColor"/>
                                </g>
                            </g>
                        </svg>
                        <span>Категории тем</span>
                    </div>
                </div>
            `);

            Lampa.Template.add('info_tvtv', `
                <div class="info layer--width">
                    <div class="info__left">
                        <div class="info__title"></div>
                        <div class="info__title-original"></div>
                        <div class="info__create"></div>
                    </div>
                    <div class="info__right">
                        <div id="stantion_filtr"></div>
                    </div>
                </div>
            `);

            const buttonCategory = Lampa.Template.get('button_category');
            // Заменяем временный infoBlock настоящим
            infoBlock = Lampa.Template.get('info_tvtv');
            infoBlock.find('#stantion_filtr').append(buttonCategory);
            infoBlock.find('.view--category').on('hover:enter hover:click', () => self.selectGroup());

            scroll.render().addClass('layer--wheight').data('mheight', infoBlock);
            container.append(infoBlock);
            container.append(scroll.render());

            this.append(data);
            scroll.append(cardsContainer);

            $('.my_themes').append('<div id="spacer" style="height: 25em;"></div>');
            this.activity.loader(false);
            this.activity.toggle();
        };

        // Показать выбор категории
        this.selectGroup = function () {
            Lampa.Select.show({
                title: 'Категории тем',
                items: CATEGORIES,
                onSelect: cat => {
                    Lampa.Activity.push({
                        url: cat.url,
                        title: cat.title,
                        component: 'my_themes',
                        page: 1
                    });
                    Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
                },
                onBack: () => Lampa.Controller.toggle('content')
            });
        };

        // Навигация
        this.start = function () {
            const self = this;
            Lampa.Controller.add('content', {
                toggle: () => {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(currentFocusedCard || false, scroll.render());
                },
                left: () => Navigator.canmove('left') ? Navigator.move('left') : Lampa.Controller.toggle('menu'),
                right: () => Navigator.canmove('right') ? Navigator.move('right') : self.selectGroup(),
                up: () => {
                    // Если infoBlock ещё не в DOM, работаем только со скроллом
                    if (!infoBlock || !infoBlock.parent().length) {
                        Lampa.Controller.collectionSet(scroll.render());
                        return;
                    }
                    if (Navigator.canmove('up')) {
                        Navigator.move('up');
                    } else {
                        if (!infoBlock.find('.view--category').hasClass('focus')) {
                            Lampa.Controller.collectionSet(infoBlock);
                            Navigator.move('right');
                        } else {
                            Lampa.Controller.toggle('head');
                        }
                    }
                },
                down: () => {
                    if (!infoBlock || !infoBlock.parent().length) {
                        Lampa.Controller.collectionSet(scroll.render());
                        return;
                    }
                    if (Navigator.canmove('down')) {
                        Navigator.move('down');
                    } else if (infoBlock.find('.view--category').hasClass('focus')) {
                        Lampa.Controller.toggle('content');
                    }
                },
                back: () => Lampa.Activity.backward()
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};

        this.render = () => container;

        this.destroy = function () {
            request.clear();
            scroll.destroy();
            if (infoBlock) infoBlock.remove();
            container.remove();
            cardsContainer.remove();
        };

        // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
        function addInstalledLabel(card) {
            const label = document.createElement('div');
            label.innerText = 'Установлена';
            label.classList.add('card__quality');
            $(label).css({
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

        function installTheme(cssUrl, card) {
            $('link.theme-css').remove();
            $('body').append($('<link>', {
                rel: 'stylesheet',
                href: cssUrl,
                class: 'theme-css'
            }));
            localStorage.setItem('selectedTheme', cssUrl);
            console.log('Тема установлена:', cssUrl);
            $('.card__quality').remove();
            addInstalledLabel(card);

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
            $('link.theme-css').remove();
            localStorage.removeItem('selectedTheme');
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
    }

    Lampa.Component.add('my_themes', ThemesComponent);

    // Убираем кнопку категорий при выходе из раздела тем
    Lampa.Storage.listener.follow('change', event => {
        if (event.name === 'activity' && Lampa.Activity.active().component !== 'my_themes') {
            setTimeout(() => $('#button_category').remove(), 0);
        }
    });

    // Автозапуск (если требуется)
    if (!window.appready) {
        Lampa.Listener.follow('app', event => {
            if (event.type === 'ready') {
                // ничего не делаем
            }
        });
    }
})();