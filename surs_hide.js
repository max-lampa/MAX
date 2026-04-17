(function() { 'use strict';  
  
    var settingsToggled = false;  
    var allHiddenElements = [];  
    var keySequence = [38, 38, 39, 39, 40, 40, 38];  
    var keyIndex = 0;  
    var hideTimeout = null;  
    var lastKeyTime = 0;  
    var SEQUENCE_TIMEOUT = 2500;  
  
    function hideTitle($element) {  
        var $title = $element.prev('.settings-param-title');  
        if ($title.length) $title.hide();  
    }  
  
    // Боковое меню - все пункты из src/interaction/menu/menu.js  
    var sideMenuSelectors = [  
        //"[data-action=main]",          // Главная   
        "[data-action=feed]",          // Лента  
        //"[data-action=movie]",         // Фильмы  
        "[data-action=cartoon]",       // Мультфильмы  
        //"[data-action=tv]",            // ТВ   
        "[data-action=myperson]",      // Персоны  
       // "[data-action=catalog]",       // Каталог  
       // "[data-action=filter]",        // Фильтр   
        "[data-action=relise]",        // Новинки  
        "[data-action=anime]",         // Аниме  
        //"[data-action=favorite]",      // Закладки  
        //"[data-action=history]",       // История  
        "[data-action=subscribes]",    // Подписки  
        "[data-action=timetable]",     // Расписание
        "[data-action=mytorrents]",    // Торренты  
        "[data-action=about]",         // О приложении  
        "[data-action=sport]",         // Спорт
        // "[data-action=console]",      // Консоль (закомментировано)  
        "[data-action=edit]"           // Редактор  
    ];  
  
    // Основные компоненты настроек
    var settingsSelectors = [  
        'div[data-component="account"]',           // Аккаунт  
        'div[data-component="interface"]',         // Интерфейс  
       // 'div[data-component="player"]',            // Плеер  
        'div[data-component="plugins"]',           // Плагины  
        'div[data-component="tmdb"]',              // TMDB  
        'div[data-component="parser"]',            // Парсер  
        'div[data-component="server"]',            // TorrServer  
        'div[data-component="content_rows"]',      // Строки контента  
        'div[data-component="data"]',              // Данные  
        'div[data-component="parental_control"]',  // Родительский контроль  
        'div[data-component="lampac_profiles"]',   // Профили   
        'div[data-component="backup"]',            // Резервное копирование  

        'div[data-component="shots"]',             // шортсы  
        //'div[data-component="more"]',              // Другие настройки  
       // 'div[data-component="sisi"]',              // Sisi  
        //'div[data-component="appletv"]'            // Apple TV  
    ];  
  
    // Элементы шапки  
    var headerElements = [  
        ".open--feed",  
        ".open--premium",  
        ".open--notice",  
        ".open--profile",  
        ".christmas__button",  
        ".icon--blink",  
        ".head__action.notice--icon",

  
    ];  
    
    
    var fullCardElements = [  
    //'.button--play',        // Кнопка "Смотреть"  
    //'.button--book',        // Кнопка "Закладки"  
    '.button--reaction',    // Кнопка "Реакции"  
    '.button--subscribe',   // Кнопка "Подписаться"   
    '.button--options',     // Кнопка с тремя точками (options)  
   // '.view--torrent',       // Кнопка "Торренты"  
    '.view--trailer',       // Кнопка "Трейлеры"  
    '.shots-view-button',   // Кнопка "Shots" (из плагина shots)  
   // '.button--priority'     // Приоритетная кнопка (добавляется динамически)  
];

  
    // Настройки аккаунта
    var accountSettings = [  
        '[data-name="account_use"]',               // Использовать аккаунт  
        '[data-name="cub_domain"]',                // Домен CUB  
        '.settings--account-user-info',            // Информация о пользователе  
        '.settings--account-user-profile',         // Профиль пользователя  
        '.settings--account-user-out',             // Выход  
        '.settings--account-device-add',           // Добавить устройство  
        '.settings--account-user-sync',            // Синхронизация  
        '.settings--account-user-backup'           // Резервное копирование  
    ];  
  
    // Настройки интерфейса
    var interfaceSettings = [  
        '[data-name="card_interfice_cover"]',      // Обложка на карточках  
        '[data-name="advanced_animation"]',        // Продвинутая анимация  
        '[data-name="glass_opacity"]',             // Прозрачность стекла  
        '[data-name="light_version"]',             // Легкая версия  
        '[data-name="card_interfice_reactions"]',  // Реакции на карточках  
        '[data-name="interface_size"]',            // Размер интерфейса  
        '[data-name="background_type"]',           // Тип фона  
        '[data-name="black_style"]',               // Черный стиль  
        '[data-name="interface_sound_level"]',     // Уровень звука интерфейса  
        '[data-name="mask"]',                      // Маска  
        '[data-name="scroll_type"]',               // Тип скролла  
        '[data-name="card_views_type"]',           // Тип просмотра карточек  
        '[data-name="hide_outside_the_screen"]',   // Скрывать за экраном  
        '[data-name="menu_always"]',               // Всегда показывать меню - ДОБАВЛЕНО  
        '[data-name="animation"]',                 // Анимация - ДОБАВЛЕНО  
        { selector: '[data-name="card_interfice_type"]', additional: hideTitle },  
        { selector: '[data-name="background"]', additional: hideTitle },  
        { selector: '[data-name="glass_style"]', additional: hideTitle },  
        { selector: '[data-name="card_interfice_poster"]', additional: hideTitle },  
        { selector: '[data-name="interface_sound_play"]', additional: hideTitle }  
    ];  
  
    // Настройки плеера
    var playerSettings = [  
        //'[data-name="player_timecode"]',           // Таймкод  
        //'[data-name="player_rewind"]',             // Перемотка  
        //'[data-name="player_subs_size"]',          // Размер субтитров  
        '[data-name="player_scale_method"]',       // Масштабирование  
        //'[data-name="player_hls_method"]',        // Метод HLS (закомментировано)  
        '[data-name="subtitles_size"]',            // Размер субтитров  
        '[data-name="subtitles_backdrop"]',        // Фон субтитров  
        '[data-name="player"]',                    // Тип плеера  
       // '[data-name="player_iptv"]',               // Плеер IPTV - ДОБАВЛЕНО  
        '[data-name="player_torrent"]',            // Плеер торрентов   
        '[data-name="player_normalization"]',      // Нормализация звука  
        //'[data-name="playlist_next"]',             // Следующий эпизод  
        '[data-name="player_launch_trailers"]',    // Запуск трейлеров  
        '[data-name="subtitles_stroke"]',          // Обводка субтитров  
        //'[data-name="player_nw_path"]',            // Путь к плееру NW.js  
        //'[data-name="vlc_api_password"]',          // Пароль VLC API  
        //'[data-name="vlc_fullscreen"]',            // Полноэкранный режим VLC  
        //'[data-name="reset_player"]',              // Сброс плеера  
        { selector: '[data-name="subtitles_start"]', additional: hideTitle },  
        { selector: '[data-name="video_quality_default"]', additional: hideTitle }  
    ];  
  
    // Настройки парсера из src/templates/settings/parser.js  
    var parserSettings = [  
        '[data-name="parser_use"]',                // Использовать парсер  
        '[data-name="parser_torrent_type"]',       // Тип парсера торрентов  
        '[data-name="parser_use_link"]',           // Использовать ссылку  
        '[data-name="jackett_url"]',               // URL Jackett  
        '[data-name="jackett_key"]',               // Ключ Jackett  
        '[data-name="jackett_url_two"]',           // Дополнительный URL Jackett  
        '[data-name="jackett_key_two"]',           // Дополнительный ключ Jackett  
        '[data-name="jackett_interview"]',         // Интервью Jackett  
        '[data-name="prowlarr_url"]',              // URL Prowlarr  
        '[data-name="prowlarr_key"]',              // Ключ Prowlarr  
        '[data-name="prowlarr_url_two"]',          // Дополнительный URL Prowlarr  
        '[data-name="prowlarr_key_two"]',          // Дополнительный ключ Prowlarr  
        '[data-name="parse_lang"]',                // Язык поиска  
        '[data-name="parse_timeout"]',             // Таймаут запроса  
        '[data-name="parse_in_search"]'            // Показывать в поиске  
    ];  
  
    // Настройки TorrServer
    var serverSettings = [  
        //'[data-name="torrserver_use_link"]',       // Использовать ссылку  
       // '[data-name="torrserver_link"]',           // Ссылка на сервер  
       // '[data-name="torrserver_link_two"]',       // Дополнительная ссылка  
        '[data-name="torrserver_auth"]',           // Аутентификация  
        '[data-name="torrserver_login"]',          // Логин  
        '[data-name="torrserver_password"]',       // Пароль  
        '[data-name="torrserver_use_cache"]',      // Использовать кеш  
        '[data-name="torrserver_preload"]',        // Предзагрузка  
        '[data-name="torrserver_use_local"]',      // Использовать локальный  
        '[data-name="torrserver_use_remote"]',     // Использовать удаленный  
        '[data-name="torrserver_custom"]',         // Настройки клиента  
        '[data-name="torrserver_client"]',         // Тип клиента  
        '[data-name="torrserver_reconnect"]'       // Переподключение  
    ];  
  
    // Дополнительные настройки
    var moreSettings = [  
        '[data-name="source"]',                    // Источник  
       // '[data-name="cache_images"]',              // Кеш изображений  
        '[data-name="device_name"]',               // Имя устройства  
        '[data-name="export"]',                    // Экспорт  
        '[data-name="terminal"]',                  // Терминал  
        '.helper--start-again',  
        '[data-name="screensaver_type"]',          // Тип скринсейвера  
        '[data-name="screensaver_time"]',          // Время скринсейвера  
        '[data-name="time_offset"]',               // Смещение времени  
        '[data-name="pages_save_total"]',          // Сохранять страниц  
        '[data-name="card_quality"]',              // Качество на карточках  
        '[data-name="card_episodes"]',             // Эпизоды на карточках  
        '[data-name="start_page"]',                // Стартовая страница  
        '[data-name="protocol"]',                  // Протокол  
        //'[data-name="request_caching"]',           // Кеширование запросов   
       // '[data-name="screensaver"]',               // Скринсейвер   
        //'[data-name="navigation_type"]',           // Тип навигации 
       // '[data-name="keyboard_type"]',             // Тип клавиатуры  
        '[data-name="helper"]',                    // Помощник  
        { selector: '[data-name="helper"]', additional: hideTitle }  
    ];  
  
    // Настройки родительского контроля 
    var parentalControlSettings = [  
       // '.parental-control-toggle',                // Переключатель родительского контроля  
       // '.parental-control-change',                // Изменить PIN  
        //'[data-name="parental_control_time"]',     // Время запроса PIN  
        //'.parental-control-personal-list'          // Персональные коды  
    ];  
  
    // Настройки TMDB 
    var tmdbSettings = [  
        //'[data-name="tmdb_lang"]',                 // Язык TMDB  
        //'[data-name="tmdb_proxy"]',                // Прокси TMDB  
        //'[data-name="tmdb_posters"]',              // Постеры TMDB  
        //'[data-name="proxy_tmdb_auto"]',           // Автопрокси TMDB  
       // '[data-name="proxy_tmdb"]',                // Прокси TMDB API  
        //'[data-name="tmdb_proxy_api"]',            // Прокси API TMDB  
        //'[data-name="tmdb_proxy_image"]'           // Прокси изображений TMDB  
    ];  
  

  
    function buildAllHidden() {  
        var list = [];  
        function add(arr) {  
            arr.forEach(function(item) {  
                if (typeof item === 'object' && item.selector) {  
                    list.push(item.selector);  
                } else if (typeof item === 'string') {  
                    list.push(item);  
                }  
            });  
        }  
        add(sideMenuSelectors);  
        add(settingsSelectors);  
        add(headerElements);  
        add(interfaceSettings);  
        add(playerSettings);  
        add(parserSettings);  
        add(serverSettings);  
        add(moreSettings);  
        add(parentalControlSettings);  
        add(accountSettings);  
        add(tmdbSettings);  
        return list;  
    }  
  
    allHiddenElements = buildAllHidden();  
  
    function hideElements(selectors) {  
        $(selectors.join(', ')).hide();  
    }  
  
function processSettings(items, body) {  
    // Сохраняем текущий фокус перед скрытием  
    var currentFocus = document.activeElement;  
      
    items.forEach(function(item) {  
        var selector = typeof item === 'object' ? item.selector : item;  
        var $el = body.find(selector);  
        if ($el.length) {  
            $el.hide();  
            if (typeof item === 'object' && item.additional) {  
                item.additional($el);  
            }  
        }  
    });  
      
    // Восстанавливаем фокус на первом видимом элементе  
    setTimeout(function() {  
        var firstVisible = body.find('.settings-param.selector:visible, .settings-folder.selector:visible').first();  
        if (firstVisible.length) {  
            Lampa.Controller.collectionSet(body);  
            Lampa.Controller.collectionFocus(firstVisible[0], body);  
        }  
    }, 10);  
}
  
function hideSettingsComponents() {  
    Lampa.Settings.listener.follow('open', function(e) {  
        if (e.name === 'main' && !settingsToggled) {  
            settingsToggled = true;  
            setTimeout(function() {  
                // Сохраняем текущий фокус перед скрытием  
                var currentFocus = document.activeElement;  
                  
                $('div[data-component="player"]').before($('div[data-component="account_menu"]'));  
                $('div[data-component="sisi"]').after($('div[data-component="account"]'));  
            }, 10);  
              
            setTimeout(function() {  
                hideElements(settingsSelectors);  
                  
                // Находим первый видимый элемент и фокусируемся на нём  
                var firstVisible = $('.settings-folder.selector:visible').first();  
                if (firstVisible.length) {  
                    Lampa.Controller.collectionSet($('.settings-folder.selector:visible').parent());  
                    Lampa.Controller.collectionFocus(firstVisible[0], $('.settings-folder.selector:visible').parent());  
                } else {  
                    // Если нет видимых элементов, переключаемся на другой контроллер  
                    Lampa.Controller.toggle('head');  
                }  
            }, 50);  
        }  
        if (e.name === 'account') processSettings(accountSettings, e.body);  
        if (e.name === 'interface') processSettings(interfaceSettings, e.body);  
        if (e.name === 'player') processSettings(playerSettings, e.body);  
        if (e.name === 'parser') processSettings(parserSettings, e.body);  
        if (e.name === 'server') processSettings(serverSettings, e.body);  
        if (e.name === 'more') processSettings(moreSettings, e.body);  
        if (e.name === 'parental_control') processSettings(parentalControlSettings, e.body);  
        if (e.name === 'tmdb') processSettings(tmdbSettings, e.body);  
        if (e.name === 'plugins') processSettings(pluginsSettings, e.body);  
        if (e.name === 'content_rows') processSettings(contentRowsSettings, e.body);  
        if (e.name === 'data') processSettings(dataSettings, e.body);  
        if (e.name === 'lampac_profiles') processSettings(lampacProfilesSettings, e.body);  
        if (e.name === 'backup') processSettings(backupSettings, e.body);  
        if (e.name === 'lnum_settings') processSettings(lnumSettings, e.body);  
        if (e.name === 'shots') processSettings(shotsSettings, e.body);  
        if (e.name === 'sisi') processSettings(sisiSettings, e.body);  
        if (e.name === 'appletv') processSettings(appletvSettings, e.body);  
    });  
}

function hideFullCardButtons() {  
    Lampa.Listener.follow('full', function(e) {  
        if (e.type === 'complite') {  
            // Скрываем кнопки после полной загрузки карточки  
            setTimeout(function() {  
                hideElements(fullCardElements);  
            }, 100);  
        }  
    });  
}  
  
    function hideAllElementsAfterTimeout() {  
        if (hideTimeout) clearTimeout(hideTimeout);  
        hideTimeout = setTimeout(function() {  
            hideElements(allHiddenElements);  
            Lampa.Noty.show('Элементы снова скрыты');  
        }, 90000);  
    }  
  
    function showHiddenElements() {  
        $(document).on('keydown', function(e) {  
            var now = Date.now();  
            if (now - lastKeyTime > SEQUENCE_TIMEOUT) {  
                keyIndex = 0;  
            }  
            lastKeyTime = now;  
            if (e.keyCode === keySequence[keyIndex]) {  
                keyIndex++;  
                if (keyIndex === keySequence.length) {  
                    keyIndex = 0;  
                    $(allHiddenElements.join(', ')).show();  
                    Lampa.Noty.show('Алохаморе... элементы отображены!');  
                    hideAllElementsAfterTimeout();  
                }  
            } else {  
                keyIndex = 0;  
            }  
        });  
    }  
  
    function addReloadButton() {  
        var btn = '<div id="RELOAD" class="head__action selector reload-screen">' +  
            '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +  
            '<path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,0,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z"/>' +  
            '</svg></div>';  
        $('#app > div.head > div > div.head__actions').append(btn);  
        $('#RELOAD').on('hover:enter hover:click hover:touch', function() {  
            location.reload();  
        });  
    }  
  
    // Дополнительные настройки для компонентов  
    var contentRowsSettings = [  
        '[data-name="content_rows_main"]',         // Основные строки контента  
        '[data-name="content_rows_category"]',     // Строки категорий  
        '[data-name="content_rows_search"]',       // Строки поиска  
        '[data-name="content_rows_filter"]'        // Строки фильтра  
    ];  
  
    var dataSettings = [  
        '[data-name="data_clear_cache"]',          // Очистить кеш  
        '[data-name="data_clear_bookmarks"]',      // Очистить закладки  
        '[data-name="data_clear_history"]',        // Очистить историю  
        '[data-name="data_clear_all"]'             // Очистить все данные  
    ];  
  
    var lampacProfilesSettings = [  
        '[data-name="profile_create"]',            // Создать профиль  
        '[data-name="profile_edit"]',              // Редактировать профиль  
        '[data-name="profile_delete"]',            // Удалить профиль  
        '[data-name="profile_switch"]'             // Переключить профиль  
    ];  
  
    var backupSettings = [  
        '[data-name="backup_create"]',             // Создать резервную копию  
        '[data-name="backup_restore"]',            // Восстановить из копии  
        '[data-name="backup_auto"]',               // Автоматическое резервирование  
        '[data-name="backup_cloud"]'               // Облачное резервирование  
    ];  
    
    var appletvSettings = [  
        '[data-name="appletv_enable"]',            // Включить Apple TV  
        '[data-name="appletv_server"]',            // Сервер Apple TV  
        '[data-name="appletv_quality"]',           // Качество Apple TV  
        '[data-name="appletv_cache"]'              // Кеш Apple TV  
    ];  
  
    function init() {  
        hideSettingsComponents();  
        hideFullCardButtons(); 
        hideElements(headerElements);  
        hideElements(sideMenuSelectors);  
        showHiddenElements();  
        addReloadButton();  
    }  
  
    if (window.appready) {  
        init();  
    } else {  
        Lampa.Listener.follow('app', function(e) {  
            if (e.type === 'ready') init();  
        });  
    }  
})();