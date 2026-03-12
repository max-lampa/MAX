(function() {
    'use strict';
    
    // =============================================
    // НАСТРОЙКИ ПЛАГИНА – измените под свой источник
    // =============================================
    const THEMES_BASE_URL = 'https://your-server.com/themes'; // базовый URL, где лежат темы
    const THEMES_CATEGORIES = [
        { title: 'Focus Pack',      url: THEMES_BASE_URL + '/categories/stroke.json' },
        { title: 'Color Gallery',   url: THEMES_BASE_URL + '/categories/color_gallery.json' },
        { title: 'Gradient Style',  url: THEMES_BASE_URL + '/categories/gradient_style.json' }
    ];
    // =============================================

    // Применяем сохранённую тему при загрузке
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        $('body').append($('<link>', { rel: 'stylesheet', href: savedTheme, class: 'theme-css' }));
    }

    // Добавляем пункт в настройки интерфейса
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'themes_plugin', type: 'static' },
        field: {
            name: 'Темы оформления',
            description: 'Выберите и установите тему'
        },
        onRender: function(item) {
            setTimeout(() => {
                // Перемещаем пункт под "Размер интерфейса"
                $('.settings-param > div:contains("Темы оформления")')
                    .parent()
                    .insertAfter($('div[data-name="interface_size"]'));

                item.on('hover:enter', () => {
                    // Если открыты другие настройки – сначала выходим из них
                    if ($('.settings-param').length || $('.settings-folder').length) {
                        window.history.back();
                    }
                    // Затем открываем первую категорию тем
                    setTimeout(() => {
                        Lampa.Activity.push({
                            url: THEMES_CATEGORIES[0].url,
                            title: THEMES_CATEGORIES[0].title,
                            component: 'themes_browser',
                            page: 1
                        });
                    }, 100);
                });
            }, 0);
        }
    });

    // -----------------------------------------------------------------
    // Компонент для просмотра тем внутри категории
    // -----------------------------------------------------------------
    Lampa.Component.add('themes_browser', function(options) {
        const request = new Lampa.Request(); // используем правильный класс
        const scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        const container = $('<div class="themes-browser"></div>');
        let cardsContainer = $('<div class="cards-grid"></div>');
        let currentFocus = null;

        // Методы, обязательные для Lampa
        this.emit = function() {};
        this.pause = function() {};
        this.stop = function() {};

        this.create = function() {
            const self = this;
            this.activity.loader(true);

            request.silent(
                options.url,
                function(data) { self.build(data); },
                function() { // ошибка загрузки
                    const empty = new Lampa.Empty();
                    container.append(empty.render());
                    self.start = empty.start;
                    self.activity.loader(false);
                    self.activity.toggle();
                }
            );

            return container;
        };

        this.build = function(themes) {
            const self = this;

            // Шапка с кнопкой выбора категории
            const header = $(`
                <div class="themes-header">
                    <div class="selector category-button" style="display: inline-block; padding: 0.8em 2em; background: #333; border-radius: 2em;">
                        <svg width="20" height="20" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 0.5em;">
                            <path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z" fill="currentColor"/>
                            <path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z" fill="currentColor"/>
                            <path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z" fill="currentColor"/>
                        </svg>
                        <span>Категории</span>
                    </div>
                </div>
            `);
            header.find('.category-button').on('hover:enter', () => this.selectCategory());
            container.append(header);

            // Создаём карточки тем
            themes.forEach(theme => {
                const card = Lampa.Template.get('card', {
                    title: theme.title,
                    release_year: ''
                });
                card.addClass('theme-card');
                card.find('.card__img').css({
                    'background-color': '#353535a6',
                    'cursor': 'pointer'
                });

                const img = card.find('.card__img')[0];
                img.onload = () => card.addClass('card--loaded');
                img.onerror = () => { img.src = './img/img_broken.svg'; };
                img.src = theme.logo || THEMES_BASE_URL + '/default_logo.svg';

                // Если тема уже установлена – ставим метку
                if (localStorage.getItem('selectedTheme') === theme.css) {
                    addInstalledLabel(card);
                }

                // Фокус карточки
                card.on('hover:focus', () => {
                    currentFocus = card[0];
                    scroll.update(card, true);
                });

                // Нажатие на карточку – меню установки/удаления
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

            // Помещаем карточки в скролл
            scroll.append(cardsContainer);
            container.append(scroll.render());

            this.activity.loader(false);
            this.activity.toggle();
        };

        this.selectCategory = function() {
            Lampa.Select.show({
                title: 'Категории тем',
                items: THEMES_CATEGORIES,
                onSelect: cat => {
                    Lampa.Activity.push({
                        url: cat.url,
                        title: cat.title,
                        component: 'themes_browser',
                        page: 1
                    });
                },
                onBack: () => Lampa.Controller.toggle('content')
            });
        };

        this.start = function() {
            const self = this;
            Lampa.Controller.add('content', {
                toggle: () => {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(currentFocus || false, scroll.render());
                },
                left: () => Navigator.canmove('left') ? Navigator.move('left') : Lampa.Controller.toggle('menu'),
                right: () => Navigator.canmove('right') ? Navigator.move('right') : self.selectCategory(),
                up: () => {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: () => {
                    if (Navigator.canmove('down')) Navigator.move('down');
                    else if (container.find('.category-button').hasClass('focus')) Lampa.Controller.toggle('content');
                },
                back: () => Lampa.Activity.backward()
            });
            Lampa.Controller.toggle('content');
        };

        this.render = () => container;

        this.destroy = function() {
            request.clear();
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

        function installTheme(cssUrl, card) {
            // Удаляем предыдущую тему
            $('link.theme-css').remove();
            // Устанавливаем новую
            $('body').append($('<link>', { rel: 'stylesheet', href: cssUrl, class: 'theme-css' }));
            localStorage.setItem('selectedTheme', cssUrl);
            // Обновляем метки
            $('.card__quality').remove();
            addInstalledLabel(card);
            // Сохраняем и отключаем стандартные настройки оформления
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
        if (e.name === 'activity' && Lampa.Activity.active().component !== 'themes_browser') {
            setTimeout(() => $('.themes-header').remove(), 0);
        }
    });

})();