(function() {
    'use strict';

    // --- КЛЮЧИ ХРАНЕНИЯ ---
    var CARD_RADIUS_KEY = 'lampac_card_radius';        // скругление
    var CARD_TITLE_SIZE_KEY = 'lampac_card_title_size'; // размер названия
    var CARD_QUALITY_KEY = 'lampac_card_quality';       // бейдж качества
    var CARD_VOTE_KEY = 'lampac_card_vote';             // бейдж рейтинга
    var CARD_YEAR_KEY = 'lampac_card_year';             // год (показывать/скрыть/только при фокусе)
    var CARD_DENSITY_KEY = 'lampac_card_density';       // плотность сетки
    var CARD_FOCUS_SCALE_KEY = 'lampac_card_focus_scale'; // масштаб при фокусе
    var STYLE_ID = 'lampac-custom-card-styles';

    // --- ЗНАЧЕНИЯ ПО УМОЛЧАНИЮ ---
    var defaultRadius = 'medium';       // среднее
    var defaultTitleSize = 'normal';    // обычный
    var defaultQuality = 'show';
    var defaultVote = 'show';
    var defaultYear = 'show';
    var defaultDensity = 'balance';
    var defaultFocusScale = 'normal';

    // --- ФУНКЦИЯ ПРИМЕНЕНИЯ СТИЛЕЙ ---
    function applyCardStyles() {
        // Удаляем старый стиль
        var oldStyle = document.getElementById(STYLE_ID);
        if (oldStyle) oldStyle.remove();

        var rules = [];

        // 1. Скругление углов
        var radiusMap = {
            small: '0.4em',
            medium: '1em',
            large: '1.6em',
            round: '2.2em'
        };
        var radiusVal = radiusMap[Lampa.Storage.get(CARD_RADIUS_KEY, defaultRadius)];
        if (radiusVal) {
            rules.push('.card__img { border-radius: ' + radiusVal + ' !important; }');
            rules.push('.card__view::after { border-radius: calc(' + radiusVal + ' + 0.3em) !important; }');
        }

        // 2. Размер шрифта названия
        var titleSizeMap = {
            small: '0.82em',
            normal: '',
            large: '1.1em'
        };
        var titleSize = titleSizeMap[Lampa.Storage.get(CARD_TITLE_SIZE_KEY, defaultTitleSize)];
        if (titleSize) {
            rules.push('.card__title { font-size: ' + titleSize + ' !important; }');
        }

        // 3. Бейдж качества
        if (Lampa.Storage.get(CARD_QUALITY_KEY, defaultQuality) === 'hide') {
            rules.push('.card__quality { display: none !important; }');
        }

        // 4. Бейдж рейтинга
        if (Lampa.Storage.get(CARD_VOTE_KEY, defaultVote) === 'hide') {
            rules.push('.card__vote { display: none !important; }');
        }

        // 5. Год
        var yearSetting = Lampa.Storage.get(CARD_YEAR_KEY, defaultYear);
        if (yearSetting === 'hide') {
            rules.push('.card__age { display: none !important; }');
        } else if (yearSetting === 'focus') {
            rules.push('.card__age { opacity: 0; max-height: 0; overflow: hidden; transition: .18s ease; }');
            rules.push('.card.focus .card__age, .card.hover .card__age, .card.traverse .card__age { opacity: 1; max-height: 2em; }');
        }

        // 6. Плотность сетки
        var density = Lampa.Storage.get(CARD_DENSITY_KEY, defaultDensity);
        if (density === 'compact') {
            rules.push('.items-line .card { margin-right: 0.28em !important; }');
            rules.push('.items-line .card .card__view { transform: scale(0.94); transform-origin: center top; }');
        } else if (density === 'large') {
            rules.push('.items-line .card { margin-right: 0.72em !important; }');
            rules.push('.items-line .card .card__view { transform: scale(1.04); transform-origin: center top; }');
        }

        // 7. Масштаб при фокусе
        var scaleMap = {
            soft: '1.03',
            normal: '1.06',
            strong: '1.09',
            xstrong: '1.12'
        };
        var scale = scaleMap[Lampa.Storage.get(CARD_FOCUS_SCALE_KEY, defaultFocusScale)] || '1.06';
        rules.push('.card.focus .card__view { transform: scale(' + scale + ') !important; }');

        // Создаём элемент <style> и добавляем в head
        if (rules.length) {
            var style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = rules.join('\n');
            document.head.appendChild(style);
        }
    }

    // --- РЕГИСТРАЦИЯ НАСТРОЕК ---
    function registerSettings() {
        // Проверяем, доступен ли SettingsApi
        if (!window.Lampa || !Lampa.SettingsApi) {
            console.error('Lampa.SettingsApi не найден. Настройки не будут добавлены.');
            return;
        }

        // Добавляем языковые строки (опционально)
        Lampa.Lang.add({
            lampac_cards_title: { ru: 'Карточки', en: 'Cards', uk: 'Картки' },
            lampac_cards_radius: { ru: 'Скругление углов', en: 'Corner radius', uk: 'Заокруглення кутів' },
            lampac_cards_title_size: { ru: 'Размер названия', en: 'Title size', uk: 'Розмір назви' },
            lampac_cards_quality: { ru: 'Бейдж качества', en: 'Quality badge', uk: 'Значок якості' },
            lampac_cards_vote: { ru: 'Рейтинг', en: 'Rating', uk: 'Рейтинг' },
            lampac_cards_year: { ru: 'Год', en: 'Year', uk: 'Рік' },
            lampac_cards_density: { ru: 'Плотность сетки', en: 'Grid density', uk: 'Щільність сітки' },
            lampac_cards_focus_scale: { ru: 'Увеличение при фокусе', en: 'Focus scale', uk: 'Збільшення при фокусі' }
        });

        // Иконка для раздела (можно заменить на свою)
        var icon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z"/></svg>';

        // Создаём родительский компонент "Оформление", если его нет
        if (!Lampa.SettingsApi.components['theme']) {
            Lampa.SettingsApi.addComponent({
                component: 'theme',
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67a.528.528 0 01-.13-.33c0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zM5.5 12c-.83 0-1.5-.67-1.5-1.5S4.67 9 5.5 9 7 9.67 7 10.5 6.33 12 5.5 12zm3-4C7.67 8 7 7.33 7 6.5S7.67 5 8.5 5s1.5.67 1.5 1.5S9.33 8 8.5 8zm7 0c-.83 0-1.5-.67-1.5-1.5S14.67 5 15.5 5s1.5.67 1.5 1.5S16.33 8 15.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
                name: 'Оформление',
            });
        }

        // Создаём подраздел "Карточки"
        Lampa.SettingsApi.addComponent({
            component: 'theme_cards',
            icon: icon,
            name: Lampa.Lang.translate('lampac_cards_title') || 'Карточки',
        });

        // --- Параметры (все внутри 'theme_cards') ---

        // Скругление углов
        Lampa.SettingsApi.addParam({
            component: 'theme_cards',
            param: {
                name: CARD_RADIUS_KEY,
                type: 'select',
                values: {
                    small: 'Малое',
                    medium: 'Среднее',
                    large: 'Большое',
                    round: 'Максимальное'
                },
                default: defaultRadius,
            },
            field: {
                name: Lampa.Lang.translate('lampac_cards_radius') || 'Скругление углов',
                description: 'Радиус скругления рамки постера'
            },
            onChange: applyCardStyles,
        });

        // Размер названия
        Lampa.SettingsApi.addParam({
            component: 'theme_cards',
            param: {
                name: CARD_TITLE_SIZE_KEY,
                type: 'select',
                values: {
                    small: 'Маленький',
                    normal: 'Обычный',
                    large: 'Большой'
                },
                default: defaultTitleSize,
            },
            field: {
                name: Lampa.Lang.translate('lampac_cards_title_size') || 'Размер названия',
                description: 'Размер шрифта под карточкой'
            },
            onChange: applyCardStyles,
        });

        // Бейдж качества
        Lampa.SettingsApi.addParam({
            component: 'theme_cards',
            param: {
                name: CARD_QUALITY_KEY,
                type: 'select',
                values: { show: 'Показывать', hide: 'Скрыть' },
                default: defaultQuality,
            },
            field: {
                name: Lampa.Lang.translate('lampac_cards_quality') || 'Бейдж качества',
                description: 'Значки 4K, HD на постере'
            },
            onChange: applyCardStyles,
        });

        // Рейтинг
        Lampa.SettingsApi.addParam({
            component: 'theme_cards',
            param: {
                name: CARD_VOTE_KEY,
                type: 'select',
                values: { show: 'Показывать', hide: 'Скрыть' },
                default: defaultVote,
            },
            field: {
                name: Lampa.Lang.translate('lampac_cards_vote') || 'Рейтинг',
                description: 'Оценка на постере'
            },
            onChange: applyCardStyles,
        });

        // Год
        Lampa.SettingsApi.addParam({
            component: 'theme_cards',
            param: {
                name: CARD_YEAR_KEY,
                type: 'select',
                values: {
                    show: 'Показывать',
                    focus: 'Только при фокусе',
                    hide: 'Скрыть'
                },
                default: defaultYear,
            },
            field: {
                name: Lampa.Lang.translate('lampac_cards_year') || 'Год',
                description: 'Год выпуска под названием'
            },
            onChange: applyCardStyles,
        });

        // Плотность сетки
        Lampa.SettingsApi.addParam({
            component: 'theme_cards',
            param: {
                name: CARD_DENSITY_KEY,
                type: 'select',
                values: {
                    compact: 'Компактная',
                    balance: 'Сбалансированная',
                    large: 'Крупная'
                },
                default: defaultDensity,
            },
            field: {
                name: Lampa.Lang.translate('lampac_cards_density') || 'Плотность сетки',
                description: 'Расстояние между карточками'
            },
            onChange: applyCardStyles,
        });

        // Масштаб при фокусе
        Lampa.SettingsApi.addParam({
            component: 'theme_cards',
            param: {
                name: CARD_FOCUS_SCALE_KEY,
                type: 'select',
                values: {
                    soft: 'Мягкий (1.03)',
                    normal: 'Нормальный (1.06)',
                    strong: 'Сильный (1.09)',
                    xstrong: 'Очень сильный (1.12)'
                },
                default: defaultFocusScale,
            },
            field: {
                name: Lampa.Lang.translate('lampac_cards_focus_scale') || 'Увеличение при фокусе',
                description: 'Насколько карточка увеличивается при наведении'
            },
            onChange: applyCardStyles,
        });
    }

    // --- ИНИЦИАЛИЗАЦИЯ ПЛАГИНА ---
    function startPlugin() {
        // Регистрируем настройки
        registerSettings();

        // Применяем стили при загрузке
        applyCardStyles();

        // Обновляем стили при открытии страницы с карточками
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                setTimeout(applyCardStyles, 300);
            }
        });

        // Также обновляем при смене категории (например, при переходе по разделам)
        Lampa.Listener.follow('render', function(e) {
            if (e.type === 'complite' && e.url && e.url.indexOf('category') !== -1) {
                setTimeout(applyCardStyles, 200);
            }
        });

        console.log('Плагин карточек активирован');
    }

    // --- АВТОЗАПУСК ПОСЛЕ ГОТОВНОСТИ LAMPA ---
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();