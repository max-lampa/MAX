(function () {
    'use strict';

    // --- Защит от повторного запуска плагина ---
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === НАСТРОЙКИ ПЛАГИНА ===
    var CONFIG = {
        tmdbApiKey: '96b971de61c81e42187407e7da28d97f',
        cacheTime: 12 * 60 * 60 * 1000,
        enabled: true,
        language: 'uk',
        translateTV: true // Новая настройка для перевода TV
    };

    // === МУЛЬТИЯЗЫЧНЫЕ ТЕКСТЫ СТАТУСОВ ===
    var STATUS_TRANSLATIONS = {
        ru: {
            sequel: 'Сиквел',
            series: 'Сериал',
            ended: 'Завершился',
            canceled: 'Отменено',
            tomorrow: 'Завтра',
            inWeek: 'Через неделю',
            inDays: 'Через %d дн.',
            movie: 'Фильм',
            tv: 'Сериал' // Изменено с СЕРИАЛ на Сериал
        },
        en: {
            sequel: 'Sequel',
            series: 'Series',
            ended: 'Ended',
            canceled: 'Canceled',
            tomorrow: 'Tomorrow',
            inWeek: 'In a week',
            inDays: 'In %d days',
            movie: 'Movie',
            tv: 'Series' // Изменено с SERIES на Series
        },
        uk: {
            sequel: 'Сіквел',
            series: 'Серіал',
            ended: 'Завершився',
            canceled: 'Скасовано',
            tomorrow: 'Завтра',
            inWeek: 'Через тиждень',
            inDays: 'Через %d дн.',
            movie: 'Фільм',
            tv: 'Серіал' // Изменено с СЕРІАЛ на Серіал
        },
        be: {
            sequel: 'Сіквел',
            series: 'Серыял',
            ended: 'Скончыўся',
            canceled: 'Скасавана',
            tomorrow: 'Заўтра',
            inWeek: 'Праз тыдзень',
            inDays: 'Праз %d дн.',
            movie: 'Фільм',
            tv: 'Серыял' // Изменено с СЕРЫЯЛ на Серыял
        },
        zh: {
            sequel: '续集',
            series: '剧集',
            ended: '已完结',
            canceled: '已取消',
            tomorrow: '明天有新剧集',
            inWeek: '一周后',
            inDays: '%d天后',
            movie: '电影',
            tv: '剧集'
        },
        pt: {
            sequel: 'Sequência',
            series: 'Série',
            ended: 'Terminado',
            canceled: 'Cancelado',
            tomorrow: 'Amanhã',
            inWeek: 'Em uma semana',
            inDays: 'Em %d dias',
            movie: 'Filme',
            tv: 'Série' // Изменено с SÉRIE на Série
        },
        bg: {
            sequel: 'Сиквел',
            series: 'Сериал',
            ended: 'Приключил',
            canceled: 'Отменен',
            tomorrow: 'Утре',
            inWeek: 'След седмица',
            inDays: 'След %d дни',
            movie: 'Филм',
            tv: 'Сериал' // Изменено с СЕРИАЛ на Сериал
        },
        cs: {
            sequel: 'Pokračování',
            series: 'Seriál',
            ended: 'Ukončeno',
            canceled: 'Zrušeno',
            tomorrow: 'Zítra',
            inWeek: 'Za týden',
            inDays: 'Za %d dn.',
            movie: 'Film',
            tv: 'Seriál' // Изменено с SERIÁL на Seriál
        },
        he: {
            sequel: 'סִקְוֶל',
            series: 'סִדְרָה',
            ended: 'הסתיים',
            canceled: 'בוטל',
            tomorrow: 'מחר',
            inWeek: 'בעוד שבוע',
            inDays: 'בעוד %d ימים',
            movie: 'סרט',
            tv: 'סִדְרָה'
        }
    };

    // Глобальная переменная для хранения текущего языка
    var currentLanguage = null;

    // === ФУНКЦИЯ ОПРЕДЕЛЕНИЯ ЯЗЫКА ПРИЛОЖЕНИЯ (ОДИН РАЗ ПРИ ИНИЦИАЛИЗАЦИИ) ===
    function initAppLanguage() {
        if (currentLanguage) return currentLanguage;
        
        var lang = 'ru';
        console.log('SeasonBadgePlugin: Инициализация языка...');

        // 1. Пробуем получить язык из Lampa приложения
        try {
            if (window.Lampa && Lampa.Manager) {
                console.log('SeasonBadgePlugin: Lampa найдена, ищем язык...');
                
                if (Lampa.Settings && Lampa.Settings.get) {
                    var settingsLang = Lampa.Settings.get('language') || Lampa.Settings.get('lang');
                    if (settingsLang && STATUS_TRANSLATIONS[settingsLang]) {
                        lang = settingsLang;
                        console.log('SeasonBadgePlugin: Язык из Lampa Settings -', lang);
                        currentLanguage = lang;
                        return lang;
                    }
                }
                
                if (Lampa.Storage && Lampa.Storage.get) {
                    var storageLang = Lampa.Storage.get('language') || Lampa.Storage.get('lang');
                    if (storageLang && STATUS_TRANSLATIONS[storageLang]) {
                        lang = storageLang;
                        console.log('SeasonBadgePlugin: Язык из Lampa Storage -', lang);
                        currentLanguage = lang;
                        return lang;
                    }
                }
                
                if (Lampa.Manager.getter && typeof Lampa.Manager.getter === 'function') {
                    try {
                        var managerLang = Lampa.Manager.getter('language') || Lampa.Manager.getter('lang');
                        if (managerLang && STATUS_TRANSLATIONS[managerLang]) {
                            lang = managerLang;
                            console.log('SeasonBadgePlugin: Язык из Lampa Manager -', lang);
                            currentLanguage = lang;
                            return lang;
                        }
                    } catch (e) {
                        console.log('SeasonBadgePlugin: Ошибка получения языка из Manager', e);
                    }
                }
            }
        } catch (e) {
            console.log('SeasonBadgePlugin: Ошибка получения языка из Lampa', e);
        }
        
        // 2. Пробуем получить язык из localStorage
        try {
            var lampaLangKeys = ['lampa_language', 'lampa_lang', 'lampa__language', 'lampa__lang'];
            for (var i = 0; i < lampaLangKeys.length; i++) {
                var key = lampaLangKeys[i];
                var value = localStorage.getItem(key);
                if (value && STATUS_TRANSLATIONS[value]) {
                    lang = value;
                    console.log('SeasonBadgePlugin: Язык из localStorage (' + key + ') -', lang);
                    currentLanguage = lang;
                    return lang;
                }
            }
            
            var generalKeys = ['app_language', 'app_lang', 'language', 'lang', 'user_language'];
            for (var j = 0; j < generalKeys.length; j++) {
                var genKey = generalKeys[j];
                var genValue = localStorage.getItem(genKey);
                if (genValue && STATUS_TRANSLATIONS[genValue]) {
                    lang = genValue;
                    console.log('SeasonBadgePlugin: Язык из localStorage (' + genKey + ') -', lang);
                    currentLanguage = lang;
                    return lang;
                }
            }
        } catch (e) {
            console.log('SeasonBadgePlugin: Ошибка получения языка из localStorage', e);
        }
        
        // 3. Пробуем определить язык браузера
        try {
            var browserLang = (navigator.language || navigator.userLanguage || 'ru').substring(0, 2);
            if (STATUS_TRANSLATIONS[browserLang]) {
                lang = browserLang;
                console.log('SeasonBadgePlugin: Язык из браузера -', lang);
                currentLanguage = lang;
                return lang;
            }
        } catch (e) {
            console.log('SeasonBadgePlugin: Ошибка определения языка браузера', e);
        }
        
        console.log('SeasonBadgePlugin: Используется язык по умолчанию -', lang);
        currentLanguage = lang;
        return lang;
    }

    // === ФУНКЦИЯ ПЕРЕВОДА СТАТУСОВ ===
    function translateStatus(key, params) {
        if (!currentLanguage) {
            initAppLanguage();
        }
        
        var translation = STATUS_TRANSLATIONS[currentLanguage] || STATUS_TRANSLATIONS.ru;
        var text = translation[key] || STATUS_TRANSLATIONS.ru[key] || key;
        
        if (params && params.length > 0) {
            for (var i = 0; i < params.length; i++) {
                text = text.replace('%d', params[i]);
            }
        }
        
        return text;
    }

    // === ФУНКЦИЯ ПЕРЕВОДА TV НА КАРТОЧКАХ (точная копия из плагина themes) ===
    function translateTVCaption() {
        if (!CONFIG.translateTV) return;
        
        var tv_caption = translateStatus('tv'); // Получаем перевод для TV
        
        // Создаем стиль точно как в плагине themes
        var styleId = 'seasonbadge-translate-tv';
        var existingStyle = document.getElementById(styleId);
        if (existingStyle) existingStyle.remove();
        
        var translateTVStyle = `
        <style id="${styleId}">
            /* ТОЧНО КАК В ПЛАГИНЕ THEMES: скрываем ВСЕ метки типа */
            .card--tv .card__type,
            .card__type {
                display: none !important;
            }
            
            .card__type::after {
                display: none !important;
            }
        </style>`;
        
        document.head.insertAdjacentHTML('beforeend', translateTVStyle);
    }

    // === СТИЛИ ДЛЯ МЕТОК ===
    var style = document.createElement('style');
    style.textContent = `
    /* === СТИЛЬ ДЛЯ МЕТКИ ТИПА КОНТЕНТА (левый верхний угол) === */
    .card--content-type {
        position: absolute;
        top: 5px;
        left: 0;
        margin-left: -0.25em;
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0.2em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
        font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
        font-weight: 700;
        font-size: 0.85em;
        padding: 0.3em 0.3em;
        white-space: nowrap;
        text-align: center;
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
        text-transform: capitalize; /* Добавляем capitalize для правильного отображения */
    }
    
    /* Цветовые варианты для типа контента */
    .card--content-type.movie {
        background-color: rgba(33, 150, 243, 0.9);
        color: #ffffff;
    }
    
    .card--content-type.tv {
        background-color: rgba(156, 39, 176, 0.9);
        color: #ffffff;
    }
    
    .card--content-type.show {
        opacity: 1;
    }

    /* Стиль для ЗАВЕРШЕННЫХ сезонов */
    .card--season-complete {
        position: absolute;
        left: 0;
        margin-left: -0.25em;
        bottom: 43px;
        background-color: rgba(61, 161, 141, 0.9);
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0.2em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
    
    /* Стиль для НЕЗАВЕРШЕННЫХ сезонов */
    .card--season-progress {
        position: absolute;
        left: 0;
        margin-left: -0.25em;
        bottom: 43px;
        background-color: rgba(255, 193, 7, 0.9);
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0.2em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
    
    /* Общие стили для текста в метках сезона */
    .card--season-complete div,
    .card--season-progress div {
        text-transform: uppercase;
        font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;  
        font-weight: 700;
        font-size: 0.85em;
        padding: 0.3em 0.3em;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
        text-align: center;
    }
    
    .card--season-complete div {
        color: #ffffff;
    }
    
    .card--season-progress div {
        color: #000000;
    }
    
    .card--season-complete.show,
    .card--season-progress.show {
        opacity: 1;
    }
    
    /* === СТИЛИ ДЛЯ МЕТКИ СТАТУСА СЕРИАЛА === */
    .card--series-status {
        position: absolute;
        right: 0;
        margin-right: -0.25em;
        bottom: 43px;
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0.2em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
        font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
        font-weight: 700;
        font-size: 0.85em;
        padding: 0.3em 0.3em;
        white-space: nowrap;
        text-align: center;
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
    }
    
    /* Цветовые варианты для статусов */
    .card--series-status.orange {
        background-color: rgba(255, 152, 0, 0.9);
        color: #000000;
    }
    
    .card--series-status.purple {
        background-color: rgba(156, 39, 176, 0.9);
        color: #ffffff;
    }
    
    .card--series-status.blue {
        background-color: rgba(33, 150, 243, 0.9);
        color: #ffffff;
    }
    
    .card--series-status.green {
        background-color: rgba(76, 175, 80, 0.9);
        color: #ffffff;
    }
    
    .card--series-status.red {
        background-color: rgba(244, 67, 54, 0.9);
        color: #ffffff;
    }
    
    .card--series-status.show {
        opacity: 1;
    }
    
    /* Адаптация для мобильных устройств */
    @media (max-width: 768px) {
        .card--content-type {
            top: 4px;
            margin-left: -0.15em;
            font-size: 0.75em;
            padding: 0.25em 0.2em;
            border-radius: 0.18em;
        }
        
        .card--season-complete,
        .card--season-progress {
            bottom: 43px;
            margin-left: -0.15em;
            border-radius: 0.18em;
        }
        
        .card--season-complete div,
        .card--season-progress div {
            font-size: 0.75em;
            padding: 0.25em 0.2em;
        }
        
        .card--series-status {
            bottom: 43px;
            margin-right: -0.15em;
            font-size: 0.75em;
            padding: 0.25em 0.2em;
            border-radius: 0.18em;
        }
    }

    @media (max-width: 480px) {
        .card--content-type {
            top: 3px;
            margin-left: -0.1em;
            font-size: 0.7em;
            padding: 0.2em 0.15em;
            border-radius: 0.15em;
        }
        
        .card--season-complete,
        .card--season-progress {
            bottom: 43px;
            margin-left: -0.1em;
            border-radius: 0.15em;
        }
        
        .card--season-complete div,
        .card--season-progress div {
            font-size: 0.7em;
            padding: 0.2em 0.15em;
        }
        
        .card--series-status {
            bottom: 43px;
            margin-right: -0.1em;
            font-size: 0.7em;
            padding: 0.2em 0.15em;
            border-radius: 0.15em;
        }
    }
    `;
    document.head.appendChild(style);

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

    function getMediaType(cardData) {
        if (!cardData) return 'unknown';
        if (cardData.name || cardData.first_air_date) return 'tv';
        if (cardData.title || cardData.release_date) return 'movie';
        return 'unknown';
    }

    function createContentTypeBadge(mediaType) {
        var contentTypeBadge = document.createElement('div');
        contentTypeBadge.className = 'card--content-type ' + mediaType;
        
        var text = mediaType === 'movie' ? translateStatus('movie') : translateStatus('tv');
        contentTypeBadge.textContent = text;
        
        return contentTypeBadge;
    }

    var cache = JSON.parse(localStorage.getItem('seasonBadgeCache') || '{}');

    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(cache[tmdbId].data);
            }

            if (!CONFIG.tmdbApiKey || CONFIG.tmdbApiKey === 'ваш_tmdb_api_key_тут') {
                return reject(new Error('Пожалуйста, вставьте корректный TMDB API ключ'));
            }

            // Используем глобальный currentLanguage вместо вызова getAppLanguage()
            var url = 'https://api.themoviedb.org/3/tv/' + tmdbId + '?api_key=' + CONFIG.tmdbApiKey + '&language=' + currentLanguage;
            
            // Используем XMLHttpRequest вместо fetch для совместимости со старыми устройствами
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            if (data.success === false) {
                                reject(new Error(data.status_message));
                                return;
                            }

                            cache[tmdbId] = { 
                                data: data, 
                                timestamp: Date.now() 
                            };
                            localStorage.setItem('seasonBadgeCache', JSON.stringify(cache));
                            resolve(data);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error('HTTP error ' + xhr.status));
                    }
                }
            };
            xhr.onerror = function() {
                reject(new Error('Network error'));
            };
            xhr.send();
        });
    }

    function getSeasonProgress(tmdbData) {
        if (!tmdbData || !tmdbData.seasons || !tmdbData.last_episode_to_air) return false;
        
        var lastEpisode = tmdbData.last_episode_to_air;
        var currentSeason = null;
        
        for (var i = 0; i < tmdbData.seasons.length; i++) {
            var season = tmdbData.seasons[i];
            if (season.season_number === lastEpisode.season_number && season.season_number > 0) {
                currentSeason = season;
                break;
            }
        }
        
        if (!currentSeason) return false;
        
        var totalEpisodes = currentSeason.episode_count || 0;
        var airedEpisodes = lastEpisode.episode_number || 0;
        
        return {
            seasonNumber: lastEpisode.season_number,
            airedEpisodes: airedEpisodes,
            totalEpisodes: totalEpisodes,
            isComplete: airedEpisodes >= totalEpisodes
        };
    }

    function getSeriesStatus(tmdbData) {
        if (!tmdbData) return null;

        var status = tmdbData.status;
        var lastAirDate = tmdbData.last_air_date;
        var nextEpisode = tmdbData.next_episode_to_air;
        
        var statusType = 'blue';
        var statusText = translateStatus('series');
        
        if (status === 'Returning Series') {
            statusType = 'orange';
            statusText = translateStatus('sequel');
        } 
        else if (status === 'Ended') {
            statusType = 'green';
            statusText = translateStatus('ended');
        } 
        else if (status === 'Canceled' || status === 'Cancelled') {
            statusType = 'red';
            statusText = translateStatus('canceled');
        }
        
        if (nextEpisode && nextEpisode.air_date) {
            var nextAirDate = new Date(nextEpisode.air_date);
            var today = new Date();
            var diffTime = nextAirDate - today;
            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 0 && diffDays <= 30) {
                statusType = 'purple';
                if (diffDays === 1) {
                    statusText = translateStatus('tomorrow');
                } else if (diffDays === 7) {
                    statusText = translateStatus('inWeek');
                } else {
                    statusText = translateStatus('inDays', [diffDays]);
                }
            }
        }
        
        return {
            type: statusType,
            text: statusText
        };
    }

    function createBadge(content, isComplete, loading) {
        var badge = document.createElement('div');
        var badgeClass = isComplete ? 'card--season-complete' : 'card--season-progress';
        badge.className = badgeClass + (loading ? ' loading' : '');
        
        var symbol = '';
        if (!loading) {
            symbol = isComplete ? ' ✓' : ' ⏱';
        }
        
        var innerDiv = document.createElement('div');
        innerDiv.textContent = content + symbol;
        badge.appendChild(innerDiv);
        
        return badge;
    }

    function createStatusBadge(text, type) {
        var statusBadge = document.createElement('div');
        statusBadge.className = 'card--series-status ' + type;
        statusBadge.textContent = text;
        return statusBadge;
    }

    function addSeasonBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;

        if (!cardEl.card_data) {
            // Используем setTimeout вместо requestAnimationFrame для старых устройств
            setTimeout(function() { addSeasonBadge(cardEl); }, 100);
            return;
        }

        var data = cardEl.card_data;
        var mediaType = getMediaType(data);
        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        // Удаление предыдущих меток
        var oldBadges = view.querySelectorAll('.card--content-type, .card--season-complete, .card--season-progress, .card--series-status');
        for (var i = 0; i < oldBadges.length; i++) {
            if (oldBadges[i].parentNode) {
                oldBadges[i].parentNode.removeChild(oldBadges[i]);
            }
        }

        // Создание метки типа контенту
        if (mediaType === 'movie' || mediaType === 'tv') {
            var contentTypeBadge = createContentTypeBadge(mediaType);
            view.appendChild(contentTypeBadge);
            
            setTimeout(function() {
                contentTypeBadge.classList.add('show');
            }, 50);
        }

        // Для серіалів додаємо додаткові мітки
        if (mediaType === 'tv') {
            var badge = createBadge('...', false, true);
            view.appendChild(badge);

            cardEl.setAttribute('data-season-processed', 'loading');

            fetchSeriesData(data.id)
                .then(function(tmdbData) {
                    var progressInfo = getSeasonProgress(tmdbData);
                    var statusInfo = getSeriesStatus(tmdbData);
                    
                    if (progressInfo) {
                        var content = '';
                        var isComplete = progressInfo.isComplete;
                        
                        if (isComplete) {
                            content = 'S' + progressInfo.seasonNumber;
                        } else {
                            content = 'S' + progressInfo.seasonNumber + ' ' + progressInfo.airedEpisodes + '/' + progressInfo.totalEpisodes;
                        }
                        
                        // Видаляємо старий badge
                        if (badge.parentNode) {
                            badge.parentNode.removeChild(badge);
                        }
                        
                        // Створюємо новий badge
                        badge = createBadge(content, isComplete, false);
                        view.appendChild(badge);

                        setTimeout(function() {
                            badge.classList.add('show');
                        }, 50);

                        cardEl.setAttribute('data-season-processed', isComplete ? 'complete' : 'in-progress');
                    } else {
                        if (badge.parentNode) {
                            badge.parentNode.removeChild(badge);
                        }
                        cardEl.setAttribute('data-season-processed', 'error');
                    }
                    
                    if (statusInfo) {
                        var statusBadge = createStatusBadge(statusInfo.text, statusInfo.type);
                        view.appendChild(statusBadge);
                        
                        setTimeout(function() {
                            statusBadge.classList.add('show');
                        }, 100);
                    }
                })
                .catch(function(error) {
                    console.log('SeasonBadgePlugin ошибка:', error.message);
                    if (badge.parentNode) {
                        badge.parentNode.removeChild(badge);
                    }
                    cardEl.setAttribute('data-season-processed', 'error');
                });
        } else {
            cardEl.setAttribute('data-season-processed', 'not-tv');
        }
    }

    // === СИСТЕМА НАБЛЮДЕНИЯ ЗА НОВЫМИ КАРТОЧКАМИ ===
    var observer = null;
    
    // Проверяем поддержку MutationObserver
    if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                var addedNodes = mutation.addedNodes;
                if (addedNodes) {
                    for (var j = 0; j < addedNodes.length; j++) {
                        var node = addedNodes[j];
                        if (node.nodeType !== 1) continue;

                        if (node.classList && node.classList.contains('card')) {
                            addSeasonBadge(node);
                        }

                        if (node.querySelectorAll) {
                            var cards = node.querySelectorAll('.card');
                            for (var k = 0; k < cards.length; k++) {
                                addSeasonBadge(cards[k]);
                            }
                        }
                    }
                }
            }
        });
    }

    function initPlugin() {
        if (!CONFIG.enabled) return;

        // ИНИЦИАЛИЗАЦИЯ ЯЗЫКА ОДИН РАЗ ПРИ ЗАПУСКЕ ПЛАГИНА
        initAppLanguage();
        
        // ПРИМЕНЯЕМ ПЕРЕВОД TV НА КАРТОЧКАХ (как в плагине themes)
        translateTVCaption();

        // Если MutationObserver не поддерживается, используем fallback
        if (!observer) {
            console.log('SeasonBadgePlugin: MutationObserver не поддерживается, используется fallback');
            // Периодическая проверка новых карточек
            setInterval(function() {
                var newCards = document.querySelectorAll('.card:not([data-season-processed])');
                for (var i = 0; i < newCards.length; i++) {
                    addSeasonBadge(newCards[i]);
                }
            }, 1000);
        } else {
            var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');

            if (containers.length > 0) {
                for (var i = 0; i < containers.length; i++) {
                    try {
                        observer.observe(containers[i], {
                            childList: true,
                            subtree: true
                        });
                    } catch (e) {
                        console.log('Ошибка наблюдения за контейнером:', e);
                    }
                }
            } else {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        }

        // Обработка существующих карточек
        var existingCards = document.querySelectorAll('.card:not([data-season-processed])');
        for (var j = 0; j < existingCards.length; j++) {
            (function(index) {
                setTimeout(function() { addSeasonBadge(existingCards[index]); }, index * 300);
            })(j);
        }
    }

    // === СИСТЕМА ЗАПУСКА ПЛАГИНА ===
    function startPlugin() {
        if (document.readyState === 'loading') {
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', initPlugin);
            } else if (document.attachEvent) {
                document.attachEvent('onreadystatechange', function() {
                    if (document.readyState === 'complete') {
                        initPlugin();
                    }
                });
            }
        } else {
            // Если документ уже загружен
            if (window.appready) {
                initPlugin();
            } 
            else if (window.Lampa && Lampa.Listener) {
                Lampa.Listener.follow('app', function(e) {
                    if (e.type === 'ready') initPlugin();
                });
            } 
            else {
                setTimeout(initPlugin, 2000);
            }
        }
    }

    // Запускаем плагин
    startPlugin();

})();
