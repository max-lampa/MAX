(function() {
    'use strict'; // Використання суворого режиму для запобігання помилок

    // ===================== КОНФІГУРАЦІЯ =====================
    var LQE_CONFIG = {
        CACHE_VERSION: 3, // Версія кешу для інвалідації старих даних
        LOGGING_GENERAL: false,
        LOGGING_QUALITY: false,
        LOGGING_CARDLIST: false,
        CACHE_VALID_TIME_MS: 24 * 60 * 60 * 1000,
        CACHE_REFRESH_THRESHOLD_MS: 12 * 60 * 60 * 1000,
        CACHE_KEY: 'lampa_quality_cache',
        JACRED_PROTOCOL: 'https://', // Меняем на HTTPS
        JACRED_URL: 'jacred.xyz',
        JACRED_API_KEY: '',
        // Упрощенный список прокси с приоритетом на самые надежные
        PROXY_LIST: [
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://cors.bridged.cc/',
            'https://proxy.cors.sh/'
        ],
        PROXY_TIMEOUT_MS: 5000, // Уменьшаем таймаут
        SHOW_QUALITY_FOR_TV_SERIES: true,
        MAX_PARALLEL_REQUESTS: 3, // Немного увеличиваем
        USE_FALLBACK_QUALITY: true,
        USE_DIRECT_REQUEST: true, // Пробуем прямой запрос
        REQUEST_DELAY_MS: 1000, // Задержка между запросами
        USE_QUICK_QUALITY_FOR_LISTS: true, // Быстрая оценка для списков
        PROCESS_ALL_NEW_MOVIES: true, // Обрабатывать все новые фильмы
        PROCESS_ALL_HIGH_RATED: true, // Обрабатывать все фильмы с высоким рейтингом
        
        USE_SIMPLE_QUALITY_LABELS: false,
        
        // НОВЫЕ НАСТРОЙКИ LAZY LOADING
        LAZY_LOAD_ENABLED: true,           // Включить загрузку по мере видимости
        LAZY_LOAD_ROOT_MARGIN: '100px',    // Загружать когда карточка в 100px от viewport
        LAZY_LOAD_THRESHOLD: 0.1,          // Загружать когда 10% карточки видно
        LAZY_LOAD_BATCH_SIZE: 3,           // Размер батча для одновременной загрузки
        LAZY_LOAD_DEBOUNCE_MS: 150,        // Задержка для debounce
        PRELOAD_VISIBLE_CARDS: true,       // Предзагрузка видимых карточек
        PRELOAD_NEARBY_CARDS: true,        // Предзагрузка соседних карточек
        PRELOAD_DISTANCE: 2,               // Количество карточек вокруг для предзагрузки
        
        // НОВЫЕ НАСТРОЙКИ ДЛЯ СЕРИАЛОВ
        TV_SEARCH_ENHANCED: true,           // Улучшенный поиск для сериалов
        TV_MAX_TORRENTS_ANALYZE: 15,        // Увеличиваем лимит анализа для сериалов
        TV_QUALITY_PRIORITY: true,          // Приоритет 1080p над 4K для сериалов
        TV_BACKGROUND_DELAY_MS: 500,        // Уменьшаем задержку для сериалов
        
        // Стилі для відображення якості на повній картці
        FULL_CARD_LABEL_BORDER_COLOR: '#FFFFFF',
        FULL_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        FULL_CARD_LABEL_FONT_WEIGHT: 'normal',
        FULL_CARD_LABEL_FONT_SIZE: '1.2em',
        FULL_CARD_LABEL_FONT_STYLE: 'normal',
        
        // Стилі для відображення якості на спискових картках
        LIST_CARD_LABEL_BORDER_COLOR: '#3DA18D',
        LIST_CARD_LABEL_BACKGROUND_COLOR: 'rgba(61, 161, 141, 0.9)', //Стандартна прозорість фону 0.8 (1 - фон не прозорий)
        LIST_CARD_LABEL_BACKGROUND_TRANSPARENT: false,
        LIST_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        LIST_CARD_LABEL_FONT_WEIGHT: '600',
        LIST_CARD_LABEL_FONT_SIZE: '1.1em',
        LIST_CARD_LABEL_FONT_STYLE: 'normal',
        
        // Ручні перевизначення якості для конкретних ID контенту
        MANUAL_OVERRIDES: {
            /*'90802': { quality_code: 2160, full_label: '4K WEB-DLRip' },*/
            /*'20873': { quality_code: 2160, full_label: '4K BDRip' },*/
            /*'1128655': { quality_code: 2160, full_label: '4K Web-DL' },*/
            /*'46010': { quality_code: 1080, full_label: '1080p WEB-DLRip' },*/
            /*'9564': { quality_code: 1080, full_label: '1080p BDRemux' },*/
            /*'32334': { quality_code: 1080, full_label: '1080p WEB-DLRip' },*/
            /*'21028': { quality_code: 1080, full_label: '1080p BDRemux' },*/
            /*'20932': { quality_code: 1080, full_label: '1080p HDTVRip' },*/
            /*'57778': { quality_code: 2160, full_label: '4K Web-DL' },*/
            /*'20977': { quality_code: 1080, full_label: 'HDTVRip-AVC' },*/
            /*'33645': { quality_code: 720, full_label: '720p HDTVRip' }*/
        }
    };
    var currentGlobalMovieId = null; // Змінна для відстеження поточного ID фільму

    // ===================== LAZY LOADING SYSTEM =====================

    var lazyLoadingObserver = null;
    var pendingLazyCards = new Set();
    var processedLazyCards = new Set();
    var lazyLoadDebounceTimer = null;

    /**
     * Инициализация системы lazy loading
     */
    function initializeLazyLoading() {
        if (!LQE_CONFIG.LAZY_LOAD_ENABLED) return;
        
        try {
            lazyLoadingObserver = new IntersectionObserver(
                handleIntersection,
                {
                    root: null,
                    rootMargin: LQE_CONFIG.LAZY_LOAD_ROOT_MARGIN,
                    threshold: LQE_CONFIG.LAZY_LOAD_THRESHOLD
                }
            );
            
            if (LQE_CONFIG.LOGGING_GENERAL) {
                console.log("LQE-LAZY", "Lazy loading system initialized");
            }
        } catch (e) {
            console.error("LQE-LAZY", "IntersectionObserver error:", e);
        }
    }

    /**
     * Обработчик пересечения viewport
     */
    function handleIntersection(entries) {
        if (!LQE_CONFIG.LAZY_LOAD_ENABLED) return;
        
        entries.forEach(function(entry) {
            var cardElement = entry.target;
            var cardId = cardElement.card_data ? (cardElement.card_data.id || 'unknown') : 'unknown';
            
            if (entry.isIntersecting) {
                // Карточка стала видимой
                if (!processedLazyCards.has(cardElement) && !pendingLazyCards.has(cardElement)) {
                    pendingLazyCards.add(cardElement);
                    
                    if (LQE_CONFIG.LOGGING_CARDLIST) {
                        console.log("LQE-LAZY", "Card became visible:", cardId);
                    }
                }
                
                // Предзагрузка соседних карточек
                if (LQE_CONFIG.PRELOAD_NEARBY_CARDS) {
                    preloadNearbyCards(cardElement);
                }
            } else {
                // Карточка скрылась
                if (pendingLazyCards.has(cardElement)) {
                    pendingLazyCards.delete(cardElement);
                }
            }
        });
        
        // Запускаем обработку с debounce
        scheduleLazyProcessing();
    }

    /**
     * Планирование обработки с debounce
     */
    function scheduleLazyProcessing() {
        clearTimeout(lazyLoadDebounceTimer);
        lazyLoadDebounceTimer = setTimeout(function() {
            processPendingLazyCards();
        }, LQE_CONFIG.LAZY_LOAD_DEBOUNCE_MS);
    }

    /**
     * Обработка ожидающих карточек
     */
    function processPendingLazyCards() {
        if (pendingLazyCards.size === 0) return;
        
        var cardsToProcess = Array.from(pendingLazyCards)
            .filter(function(card) {
                return card.isConnected && 
                       !card.hasAttribute('data-lqe-quality-processed') &&
                       !processedLazyCards.has(card);
            })
            .slice(0, LQE_CONFIG.LAZY_LOAD_BATCH_SIZE);
        
        if (cardsToProcess.length === 0) return;
        
        if (LQE_CONFIG.LOGGING_CARDLIST) {
            console.log("LQE-LAZY", "Processing", cardsToProcess.length, "lazy cards");
        }
        
        cardsToProcess.forEach(function(card) {
            processLazyCard(card);
            pendingLazyCards.delete(card);
            processedLazyCards.add(card);
        });
    }

    /**
     * Обработка карточки через lazy loading
     */
    function processLazyCard(cardElement) {
        if (!cardElement.isConnected) return;
        
        var cardView = cardElement.querySelector('.card__view');
        var cardData = cardElement.card_data;
        
        if (!cardData || !cardView) {
            cardElement.setAttribute('data-lqe-quality-processed', 'true');
            return;
        }
        
        var cardId = cardData.id || '';
        var isTvSeries = (getCardType(cardData) === 'tv');
        
        if (LQE_CONFIG.LOGGING_CARDLIST) {
            console.log("LQE-LAZY", "Lazy loading quality for card:", cardId, 
                       "Type:", isTvSeries ? 'TV' : 'Movie');
        }
        
        // Для TV сериалов
        if (isTvSeries) {
            if (LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false) {
                cardElement.setAttribute('data-lqe-quality-processed', 'true');
                return;
            }
            processTVSeriesLazy(cardElement, cardView, cardData, cardId);
            return;
        }
        
        // Для фильмов
        var releaseYear = cardData.release_date ? 
            parseInt(cardData.release_date.substring(0, 4)) : 0;
        processMovieLazy(cardElement, cardView, cardData, cardId, releaseYear);
    }

    /**
     * Lazy loading для фильмов
     */
    function processMovieLazy(cardElement, cardView, cardData, cardId, releaseYear) {
        var normalizedCard = {
            id: cardData.id || '',
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || '',
            vote_average: cardData.vote_average || 0
        };
        
        var cacheKey = makeCacheKey(LQE_CONFIG.CACHE_VERSION, normalizedCard.type, cardId);
        cardElement.setAttribute('data-lqe-quality-processed', 'true');

        // 1. Мгновенная оценка
        if (LQE_CONFIG.USE_INSTANT_QUALITY) {
            updateCardWithInstantQuality(cardElement, cardView, cardData);
        }

        // 2. Проверяем ручные переопределения
        var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            setTimeout(function() {
                if (document.body.contains(cardElement)) {
                    updateCardListQualityElement(cardView, null, manualOverrideData.full_label, true);
                }
            }, 50);
            return;
        }

        // 3. Проверяем кеш
        var cachedQualityData = getQualityCache(cacheKey);
        if (cachedQualityData) {
            setTimeout(function() {
                if (document.body.contains(cardElement)) {
                    updateCardListQualityElement(cardView, cachedQualityData.quality_code, cachedQualityData.full_label);
                }
            }, 80);
            return;
        }

        // 4. Фоновая проверка
        setTimeout(function() {
            if (!document.body.contains(cardElement)) return;
            
            getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                if (!document.body.contains(cardElement)) return;
                
                if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
                    saveQualityCache(cacheKey, {
                        quality_code: jrResult.quality,
                        full_label: jrResult.full_label
                    }, cardId);
                    updateCardListQualityElement(cardView, jrResult.quality, jrResult.full_label);
                }
            });
        }, 200);
    }

    /**
     * Lazy loading для TV сериалов
     */
    function processTVSeriesLazy(cardElement, cardView, cardData, cardId) {
        var normalizedCard = {
            id: cardData.id || '',
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: 'tv',
            release_date: cardData.release_date || cardData.first_air_date || '',
            vote_average: cardData.vote_average || 0
        };
        
        var cacheKey = makeCacheKey(LQE_CONFIG.CACHE_VERSION, 'tv', cardId);
        cardElement.setAttribute('data-lqe-quality-processed', 'true');

        // 1. Сначала проверяем ручные переопределения
        var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            updateCardListQualityElement(cardView, null, manualOverrideData.full_label, true);
            return;
        }

        // 2. Проверяем кеш
        var cachedQualityData = getQualityCache(cacheKey);
        if (cachedQualityData) {
            updateCardListQualityElement(cardView, cachedQualityData.quality_code, cachedQualityData.full_label);
            return;
        }

        // 3. Мгновенная оценка
        if (LQE_CONFIG.USE_INSTANT_QUALITY) {
            var instantQuality = getInstantQualityEstimate(cardData);
            updateCardListQualityElement(cardView, instantQuality.quality, instantQuality.label, true);
        }

        // 4. Фоновая проверка для сериалов
        setTimeout(function() {
            getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                if (!document.body.contains(cardElement)) return;
                
                if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
                    saveQualityCache(cacheKey, {
                        quality_code: jrResult.quality,
                        full_label: jrResult.full_label
                    }, cardId);
                    updateCardListQualityElement(cardView, jrResult.quality, jrResult.full_label);
                }
            });
        }, LQE_CONFIG.TV_BACKGROUND_DELAY_MS);
    }

    /**
     * Добавление карточки в наблюдение lazy loading
     */
    function observeCardForLazyLoading(cardElement) {
        if (!LQE_CONFIG.LAZY_LOAD_ENABLED || !lazyLoadingObserver) return;
        
        try {
            lazyLoadingObserver.observe(cardElement);
        } catch (e) {
            console.error("LQE-LAZY", "Observe card error:", e);
        }
    }

    /**
     * Прекращение наблюдения за карточкой
     */
    function unobserveCardForLazyLoading(cardElement) {
        if (!lazyLoadingObserver) return;
        
        try {
            lazyLoadingObserver.unobserve(cardElement);
            pendingLazyCards.delete(cardElement);
            processedLazyCards.delete(cardElement);
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Предзагрузка соседних карточек
     */
    function preloadNearbyCards(visibleCard) {
        if (!LQE_CONFIG.PRELOAD_NEARBY_CARDS) return;
        
        var allCards = Array.from(document.querySelectorAll('.card:not([data-lqe-quality-processed])'));
        var currentIndex = allCards.indexOf(visibleCard);
        
        if (currentIndex === -1) return;
        
        var startIndex = Math.max(0, currentIndex - LQE_CONFIG.PRELOAD_DISTANCE);
        var endIndex = Math.min(allCards.length - 1, currentIndex + LQE_CONFIG.PRELOAD_DISTANCE);
        
        for (var i = startIndex; i <= endIndex; i++) {
            var nearbyCard = allCards[i];
            if (nearbyCard !== visibleCard && 
                !nearbyCard.hasAttribute('data-lqe-quality-processed') &&
                !processedLazyCards.has(nearbyCard) &&
                !pendingLazyCards.has(nearbyCard)) {
                
                pendingLazyCards.add(nearbyCard);
            }
        }
        
        scheduleLazyProcessing();
    }

    // ===================== МАПИ ДЛЯ ПАРСИНГУ ЯКОСТІ =====================
    
    // Мапа для прямих відповідностей назв якості (fallback)
    var QUALITY_DISPLAY_MAP = {
        "WEBRip 1080p | AVC @ звук с TS": "1080P WEBRip/TS",
        "TeleSynch 1080P": "1080P TS",
        "4K Web-DL 10bit HDR P81 HEVC": "4K WEB-DL",
        "Telecine [H.264/1080P] [звук с TS] [AD]": "1080P TS",
        "WEB-DLRip @ Синема УС": "WEB-DLRip",
        "UHD Blu-ray disc 2160p": "4K Blu-ray",
        "Blu-ray disc 1080P]": "1080P Blu-ray",
        "Blu-Ray Remux (1080P)": "1080P BDRemux",
        "BDRemux 1080P] [Крупний план]": "1080P BDRemux",
        "Blu-ray disc (custom) 1080P]": "1080P BDRip",
        "DVDRip [AV1/2160p] [4K, SDR, 10-bit] [hand made Upscale AI]": "4K Upscale AI",
        "Hybrid (2160p)": "4K Hybrid",
        "Blu-ray disc] [Mastered in 4K] [Extended Cut]": "4K Blu-ray",
        "4K, HEVC, HDR / Blu-Ray Remux (2160p)": "4K BDRemux",
        "4K, HEVC, HDR, HDR10+, Dolby Vision / Hybrid (2160p)": "4K Hybrid",
        "4K, HEVC, HDR, Dolby Vision P7 / Blu-Ray Remux (2160p)": "4K BDRemux",
        "4K, HEVC, HDR, Dolby Vision / Blu-Ray Remux (2160p)": "4K BDRemux",
        "Blu-Ray Remux 2160p | 4K | HDR | Dolby Vision P7": "4K BDRemux",
        "4K, HEVC, HDR / WEB-DLRip (2160p)": "4K WEB-DLRip",
        "Blu-ray disc (custom) 1080P] [StudioCanal]": "1080P BDRip",
        "HDTVRip [H.264/720p]": "720p HDTVRip",
        "HDTVRip 720p": "720p HDTVRip",
        "2025 / ЛМ / TC": "TC", // Telecine
      
        // Стандартні варіанти якості
        "2160p": "4K", "4k": "4K", "4К": "4K", "1080p": "1080p", "1080": "1080p", 
        "1080i": "1080p", "hdtv 1080i": "1080i FHDTV", "480p": "SD", "480": "SD",
        "web-dl": "WEB-DL", "webrip": "WEBRip", "web-dlrip": "WEB-DLRip",
        "bluray": "BluRay", "bdrip": "BDRip", "bdremux": "BDRemux",
        "hdtvrip": "HDTVRip", "dvdrip": "DVDRip", "ts": "TS", "camrip": "CAMRip",
  	  
        "blu-ray remux (2160p)": "4K BDRemux", "hdtvrip 2160p": "4K HDTVRip", "hybrid 2160p": "4K Hybrid",
        "web-dlrip (2160p)": "4K WEB-DLRip",
        "1080p web-dlrip": "1080p WEB-DLRip", "webdlrip": "WEB-DLRip", "hdtvrip-avc": "HDTVRip-AVC",
        "HDTVRip (1080p)": "1080p FHDTVRip", "hdrip": "HDRip",
        "hdtvrip (720p)": "720p HDTVRip",
        "dvdrip": "DVDRip", "hdtv": "HDTV", "dsrip": "DSRip", "satrip": "SATRip",
		"telecine": "TC", "tc": "TC", "ts": "TS"
      
    };

    // Мапа для визначення роздільності з назви
    var RESOLUTION_MAP = {
        "2160p":"4K", "2160":"4K", "4k":"4K", "4к":"4K", "uhd":"4K", "ultra hd":"4K", "ultrahd":"4K", "dci 4k":"4K",
        "1440p":"QHD", "1440":"QHD", "2k":"QHD", "qhd":"QHD",
        "1080p":"1080p", "1080":"1080p", "1080i":"1080i", "full hd":"1080p", "fhd":"1080p",
        "720p":"720p", "720":"720p", "hd":"720p", "hd ready":"720p",
        "576p":"576p", "576":"576p", "pal":"576p", 
        "480p":"480p", "480":"480p", "sd":"480p", "standard definition":"480p", "ntsc":"480p",
        "360p":"360p", "360":"360p", "low":"360p"
    };
    // Мапа для визначення джерела відео
    var SOURCE_MAP = {
        "blu-ray remux":"BDRemux", "uhd bdremux":"4K BDRemux", "bdremux":"BDRemux", 
        "remux":"BDRemux", "blu-ray disc":"Blu-ray", "bluray":"Blu-ray", 
        "blu-ray":"Blu-ray", "bdrip":"BDRip", "brrip":"BDRip",
        "uhd blu-ray":"4K Blu-ray", "4k blu-ray":"4K Blu-ray",
        "web-dl":"WEB-DL", "webdl":"WEB-DL", "web dl":"WEB-DL",
        "web-dlrip":"WEB-DLRip", "webdlrip":"WEB-DLRip", "web dlrip":"WEB-DLRip",
        "webrip":"WEBRip", "web rip":"WEBRip", "hdtvrip":"HDTVRip", 
        "hdtv":"HDTVRip", "hdrip":"HDRip", "dvdrip":"DVDRip", "dvd rip":"DVDRip", 
        "dvd":"DVD", "dvdscr":"DVDSCR", "scr":"SCR", "bdscr":"BDSCR", "r5":"R5",
        "hdrip": "HDRip",
        "screener": "SCR",
        "telecine":"TC", "tc":"TC", "hdtc":"TC", "telesync":"TS", "ts":"TS", 
        "hdts":"TS", "camrip":"CAMRip", "cam":"CAMRip", "hdcam":"CAMRip",
        "vhsrip":"VHSRip", "vcdrip":"VCDRip", "dcp":"DCP", "workprint":"Workprint", 
        "preair":"Preair", "tv":"TVRip", "line":"Line Audio", "hybrid":"Hybrid", 
        "uhd hybrid":"4K Hybrid", "upscale":"Upscale", "ai upscale":"AI Upscale",
        "bd3d":"3D Blu-ray", "3d blu-ray":"3D Blu-ray"
    };
    // Мапа для спрощення повних назв якості до коротких форматів
    var QUALITY_SIMPLIFIER_MAP = {
    // Якість (роздільність)
    "2160p": "4K", "2160": "4K", "4k": "4K", "4к": "4K", "uhd": "4K", "ultra hd": "4K", "dci 4k": "4K", "ultrahd": "4K",
    "1440p": "QHD", "1440": "QHD", "2k": "QHD", "qhd": "QHD",
    "1080p": "FHD", "1080": "FHD", "1080i": "FHD", "full hd": "FHD", "fhd": "FHD",
    "720p": "HD", "720": "HD", "hd ready": "HD", "hd": "HD",
    "480p": "SD", "480": "SD", "sd": "SD", "pal": "SD", "ntsc": "SD", "576p": "SD", "576": "SD",
    "360p": "LQ", "360": "LQ",

    // Погана якість (джерело) - мають пріоритет над роздільністю при відображенні
    "camrip": "CamRip", "cam": "CamRip", "hdcam": "CamRip", "камрип": "CamRip",
    "telesync": "TS", "ts": "TS", "hdts": "TS", "телесинк": "TS",
    "telecine": "TC", "tc": "TC", "hdtc": "TC", "телесин": "TC",
    "dvdscr": "SCR", "scr": "SCR", "bdscr": "SCR", "screener": "SCR",

    // Якісні джерела
    "remux": "Remux", "bdremux": "Remux", "blu-ray remux": "Remux",
    "bluray": "BR", "blu-ray": "BR", "bdrip": "BRip", "brrip": "BRip",
    "web-dl": "WebDL", "webdl": "WebDL",
    "webrip": "WebRip", "web-dlrip": "WebDLRip", "webdlrip": "WebDLRip",
    "hdtv": "HDTV", "hdtvrip": "HDTV",
    "hdrip": "HDRip",
    "dvdrip": "DVDRip", "dvd": "DVD"
    };

    // ===================== СТИЛІ CSS =====================
    
    // Основні стилі для відображення якості
    var styleLQE = "<style id=\"lampa_quality_styles\">" +
        ".full-start-new__rate-line {" + // Контейнер для лінії рейтингу повної картки
        "visibility: hidden;" + // Приховано під час завантаження
        "flex-wrap: wrap;" + // Дозволити перенос елементів
        "gap: 0.4em 0;" + // Відступи між елементами
        "}" +
        ".full-start-new__rate-line > * {" + // Стилі для всіх дітей лінії рейтингу
        "margin-right: 0.5em;" + // Відступ праворуч
        "flex-shrink: 0;" + // Заборонити стискання
        "flex-grow: 0;" + // Заборонити розтягування
        "}" +
        ".lqe-quality {" + // Стилі для мітки якості на повній картці
        "min-width: 2.8em;" + // Мінімальна ширина
        "text-align: center;" + // Вирівнювання тексту по центру
        "text-transform: none;" + // Без трансформації тексту
        "border: 1px solid " + LQE_CONFIG.FULL_CARD_LABEL_BORDER_COLOR + " !important;" + // Колір рамки з конфігурації
        "color: " + LQE_CONFIG.FULL_CARD_LABEL_TEXT_COLOR + " !important;" + // Колір тексту
        "font-weight: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_WEIGHT + " !important;" + // Товщина шрифту
        "font-size: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_SIZE + " !important;" + // Розмір шрифту
        "font-style: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_STYLE + " !important;" + // Стиль шрифту
        "border-radius: 0.2em;" + // Закруглення кутів
        "padding: 0.3em;" + // Внутрішні відступи
        "height: 1.72em;" + // Фіксована висота
        "display: flex;" + // Flexbox для центрування
        "align-items: center;" + // Вертикальне центрування
        "justify-content: center;" + // Горизонтальне центрування
        "box-sizing: border-box;" + // Box-model
        "}" +
        ".card__view {" + // Контейнер для картки у списку
        " position: relative; " + // Відносне позиціонування
        "}" +
        ".card__quality {" + // Стилі для мітки якості на списковій картці
        " position: absolute; " + // Абсолютне позиціонування
        " bottom: 0em; " + // Відступ від низу
        " left: 5; " + // Вирівнювання по лівому краю
		" margin-left: -0.78em; " + //ВІДСТУП за лівий край 
        " background-color: " + (LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_TRANSPARENT ? "transparent" : LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR) + " !important;" + // Колір фону
        " z-index: 10;" + // Z-index для поверх інших елементів
        " width: fit-content; " + // Ширина по вмісту
        " max-width: calc(100% - 1em); " + // Максимальна ширина
        " border-radius: 0.3em 0.3em 0em 0.3em; " + // Закруглення кутів
        " overflow: hidden;" + // Обрізання переповнення
        "}" +
        ".card__quality div {" + // Стилі для тексту всередині мітки якості
        " text-transform: uppercase; " + // Великі літери
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; " + // Шрифт
        " font-weight: 700; " + // Жирний шрифт
        " letter-spacing: 0.1px; " + // Відстань між літерами
        " font-size: 0.95em; " + // Розмір шрифту
        " color: " + LQE_CONFIG.LIST_CARD_LABEL_TEXT_COLOR + " !important;" + // Колір тексту

        " white-space: nowrap;" + // Заборонити перенос тексту
        " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3); " + // Тінь тексту
        "}" +
        "</style>";
    // Додаємо стилі до DOM
    Lampa.Template.add('lampa_quality_css', styleLQE);
    $('body').append(Lampa.Template.get('lampa_quality_css', {}, true));
    // Стилі для плавного з'явлення міток якості
	var fadeStyles = "<style id='lampa_quality_fade'>" +
   		".card__quality, .full-start__status.lqe-quality {" + // Елементи для анімації
        "opacity: 0;" + // Початково прозорі
        "transition: opacity 0.22s ease-in-out;" + // Плавна зміна прозорості
    	"}" +
    	".card__quality.show, .full-start__status.lqe-quality.show {" + // Клас для показу
        "opacity: 1;" + // Повністю видимі
    	"}" +
    	".card__quality.show.fast, .full-start__status.lqe-quality.show.fast {" + // Вимкнення переходу
        "transition: none !important;" +
    	"}" +
		"</style>";

    Lampa.Template.add('lampa_quality_fade', fadeStyles);
    $('body').append(Lampa.Template.get('lampa_quality_fade', {}, true));

    // Стилі для анімації завантаження (крапки)
    var loadingStylesLQE = "<style id=\"lampa_quality_loading_animation\">" +
        ".loading-dots-container {" + // Контейнер для анімації завантаження
        "    position: absolute;" + // Абсолютне позиціонування
        "    top: 50%;" + // По центру вертикалі
        "    left: 0;" + // Лівий край
        "    right: 0;" + // Правий край
        "    text-align: left;" + // Вирівнювання тексту ліворуч
        "    transform: translateY(-50%);" + // Центрування по вертикалі
        "    z-index: 10;" + // Поверх інших елементів
        "}" +
        ".full-start-new__rate-line {" + // Лінія рейтингу
        "    position: relative;" + // Відносне позиціонування для абсолютних дітей
        "}" +
        ".loading-dots {" + // Контейнер крапок завантаження
        "    display: inline-flex;" + // Inline-flex для вирівнювання
        "    align-items: center;" + // Центрування по вертикалі
        "    gap: 0.4em;" + // Відступи між елементами
        "    color: #ffffff;" + // Колір тексту
        "    font-size: 0.7em;" + // Розмір шрифту
        "    background: rgba(0, 0, 0, 0.3);" + // Напівпрозорий фон
        "    padding: 0.6em 1em;" + // Внутрішні відступи
        "    border-radius: 0.5em;" + // Закруглення кутів
        "}" +
        ".loading-dots__text {" + // Текст "Пошук..."
        "    margin-right: 1em;" + // Відступ праворуч
        "}" +
        ".loading-dots__dot {" + // Окремі крапки
        "    width: 0.5em;" + // Ширина крапки
        "    height: 0.5em;" + // Висота крапки
        "    border-radius: 50%;" + // Кругла форма
        "    background-color: currentColor;" + // Колір як у тексту
        "    opacity: 0.3;" + // Напівпрозорість
        "    animation: loading-dots-fade 1.5s infinite both;" + // Анімація
        "}" +
        ".loading-dots__dot:nth-child(1) {" + // Перша крапка
        "    animation-delay: 0s;" + // Без затримки
        "}" +
        ".loading-dots__dot:nth-child(2) {" + // Друга крапка
        "    animation-delay: 0.5s;" + // Затримка 0.5с
        "}" +
        ".loading-dots__dot:nth-child(3) {" + // Третя крапка
        "    animation-delay: 1s;" + // Затримка 1с
        "}" +
        "@keyframes loading-dots-fade {" + // Анімація миготіння крапок
        "    0%, 90%, 100% { opacity: 0.3; }" + // Низька прозорість
        "    35% { opacity: 1; }" + // Пік видимості
        "}" +
        "@media screen and (max-width: 480px) { .loading-dots-container { -webkit-justify-content: center; justify-content: center; text-align: center; max-width: 100%; }}" + // Адаптація для мобільних
        "</style>";

    Lampa.Template.add('lampa_quality_loading_animation_css', loadingStylesLQE);
    $('body').append(Lampa.Template.get('lampa_quality_loading_animation_css', {}, true));

    // ===================== МЕРЕЖЕВІ ФУНКЦІЇ =====================
    
    /**
     * Резервний метод отримання якості через локальну базу
     */
    function getQualityFallback(normalizedCard, cardId, callback) {
        var releaseYear = normalizedCard.release_date ? 
            parseInt(normalizedCard.release_date.substring(0, 4)) : new Date().getFullYear();
        
        var estimatedQuality = 'HD';
        if (releaseYear >= 2020) estimatedQuality = 'FHD';
        if (releaseYear >= 2022) estimatedQuality = '4K';
        
        setTimeout(function() {
            callback({
                quality: estimatedQuality === '4K' ? 2160 : 
                        estimatedQuality === 'FHD' ? 1080 : 720,
                full_label: estimatedQuality + ' (estimated)'
            });
        }, 100);
    }

    /**
     * Прямой запрос к JacRed API (без прокси)
     */
    function fetchDirect(url, cardId, callback) {
        if (!LQE_CONFIG.USE_DIRECT_REQUEST) {
            callback(new Error('Direct requests disabled'));
            return;
        }

        var xhr = new XMLHttpRequest();
        var timeoutId = setTimeout(function() {
            xhr.abort();
            callback(new Error('Direct request timeout'));
        }, 3000);

        xhr.open('GET', url, true);
        xhr.setRequestHeader('Accept', 'application/json');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                clearTimeout(timeoutId);
                if (xhr.status === 200) {
                    callback(null, xhr.responseText);
                } else {
                    callback(new Error('Direct request failed: ' + xhr.status));
                }
            }
        };
        
        xhr.onerror = function() {
            clearTimeout(timeoutId);
            callback(new Error('Direct request network error'));
        };
        
        try {
            xhr.send();
        } catch (e) {
            clearTimeout(timeoutId);
            callback(e);
        }
    }

    /**
     * Упрощенная функция запроса через прокси
     */
    function fetchWithProxySimple(url, cardId, callback) {
        var proxies = LQE_CONFIG.PROXY_LIST.slice();
        var currentIndex = 0;
        var callbackCalled = false;

        function tryNext() {
            if (currentIndex >= proxies.length || callbackCalled) {
                if (!callbackCalled) {
                    callback(new Error('All proxies failed'));
                }
                return;
            }

            var proxyUrl = proxies[currentIndex] + encodeURIComponent(url);
            
            if (LQE_CONFIG.LOGGING_GENERAL) {
                console.log("LQE-LOG", "card: " + cardId + ", Trying proxy: " + proxyUrl);
            }

            var xhr = new XMLHttpRequest();
            var timeoutId = setTimeout(function() {
                xhr.abort();
                if (!callbackCalled) {
                    currentIndex++;
                    setTimeout(tryNext, 500);
                }
            }, LQE_CONFIG.PROXY_TIMEOUT_MS);

            xhr.open('GET', proxyUrl, true);
            xhr.setRequestHeader('Accept', 'application/json');
            
            xhr.onreadystancechange = function() {
                if (xhr.readyState === 4) {
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        if (xhr.status === 200) {
                            callbackCalled = true;
                            callback(null, xhr.responseText);
                        } else {
                            currentIndex++;
                            setTimeout(tryNext, 500);
                        }
                    }
                }
            };
            
            xhr.onerror = function() {
                clearTimeout(timeoutId);
                if (!callbackCalled) {
                    currentIndex++;
                    setTimeout(tryNext, 500);
                }
            };
            
            try {
                xhr.send();
            } catch (e) {
                clearTimeout(timeoutId);
                if (!callbackCalled) {
                    currentIndex++;
                    setTimeout(tryNext, 500);
                }
            }
        }

        // Сначала пробуем прямой запрос
        fetchDirect(url, cardId, function(error, data) {
            if (!error && data) {
                callback(null, data);
            } else {
                // Если прямой запрос не удался, пробуем прокси
                setTimeout(tryNext, LQE_CONFIG.REQUEST_DELAY_MS);
            }
        });
    }

    /**
     * Умный запрос с приоритетом кэша и быстрым fallback
     */
    function smartJacredRequest(apiUrl, cardId, callback) {
        // Сразу запускаем fallback в отдельном таймере
        var fallbackTriggered = false;
        var fallbackTimeout = setTimeout(function() {
            if (!fallbackTriggered) {
                fallbackTriggered = true;
                if (LQE_CONFIG.LOGGING_GENERAL) {
                    console.log("LQE-LOG", "card: " + cardId + ", Fast fallback triggered");
                }
                callback(new Error('Fast fallback'));
            }
        }, 2000); // Всего 2 секунды на получение данных

        // Основной запрос
        fetchWithProxySimple(apiUrl, cardId, function(error, data) {
            clearTimeout(fallbackTimeout);
            if (!fallbackTriggered) {
                fallbackTriggered = true;
                if (error) {
                    callback(error);
                } else {
                    callback(null, data);
                }
            }
        });
    }

    // ===================== АНІМАЦІЯ ЗАВАНТАЖЕННЯ =====================
    
    /**
     * Додає анімацію завантаження до картки
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function addLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return; // Перевірка наявності елемента
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Add loading animation");
        // Знаходимо лінію рейтингу в контексті renderElement
        var rateLine = $('.full-start-new__rate-line', renderElement);
        // Перевіряємо наявність лінії та відсутність вже доданої анімації
        if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;
        // Додаємо HTML структуру анімації
        rateLine.append(
            '<div class="loading-dots-container">' +
            '<div class="loading-dots">' +
            '<span class="loading-dots__text">Пошук...</span>' + // Текст завантаження
            '<span class="loading-dots__dot"></span>' + // Крапка 1
            '<span class="loading-dots__dot"></span>' + // Крапка 2
            '<span class="loading-dots__dot"></span>' + // Крапка 3
            '</div>' +
            '</div>'
        );
        // Робимо анімацію видимою
        $('.loading-dots-container', rateLine).css({
            'opacity': '1',
            'visibility': 'visible'
        });
    }

    /**
     * Видаляє анімацію завантаження
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function removeLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Remove loading animation");
        // Видаляємо контейнер з анімацією
        $('.loading-dots-container', renderElement).remove();
    }

    // ===================== УТІЛІТИ =====================
    
    /**
     * Визначає тип контенту (фільм/серіал)
     * @param {object} cardData - Дані картки
     * @returns {string} - 'movie' або 'tv'
     */
    function getCardType(cardData) {
        var type = cardData.media_type || cardData.type; // Отримуємо тип з даних
        if (type === 'movie' || type === 'tv') return type; // Якщо тип визначено
        return cardData.name || cardData.original_name ? 'tv' : 'movie'; // Визначаємо по наявності назви
    }

    /**
     * Очищує та нормалізує назву для пошуку
     * @param {string} title - Оригінальна назва
     * @returns {string} - Нормалізована назва
     */
    function sanitizeTitle(title) {
        if (!title) return ''; // Перевірка на пусту назву
        // Приводимо до нижнього регістру, замінюємо роздільники на пробіли, видаляємо зайві пробіли
        return title.toString().toLowerCase()
                   .replace(/[\._\-\[\]\(\),]+/g, ' ') // Заміна роздільників на пробіли
                   .replace(/\s+/g, ' ') // Видалення зайвих пробілів
                   .trim(); // Обрізка пробілів по краях
    }

    /**
     * Генерує ключ для кешу
     * @param {number} version - Версія кешу
     * @param {string} type - Тип контенту
     * @param {string} id - ID картки
     * @returns {string} - Ключ кешу
     */
    function makeCacheKey(version, type, id) {
        return version + '_' + (type === 'tv' ? 'tv' : 'movie') + '_' + id; // Форматуємо ключ
    }

    // ===================== УСКОРЕННАЯ БЫСТРАЯ ОЦЕНКА =====================

    /**
     * Улучшенная сверхбыстрая оценка качества для сериалов
     */
    function getInstantQualityEstimate(cardData) {
        var releaseYear = cardData.release_date ? 
            parseInt(cardData.release_date.substring(0, 4)) : 0;
        var currentYear = new Date().getFullYear();
        var isTvSeries = getCardType(cardData) === 'tv';
        
        // ДЛЯ СЕРИАЛОВ: более точная оценка
        if (isTvSeries) {
            var tvYear = cardData.first_air_date ? 
                parseInt(cardData.first_air_date.substring(0, 4)) : releaseYear;
            
            // УЛУЧШЕННАЯ ЛОГИКА ДЛЯ СЕРИАЛОВ:
            if (tvYear >= 2020) return { quality: 1080, label: 'FHD' };
            if (tvYear >= 2015) return { quality: 720, label: 'HD' };
            if (tvYear >= 2010) return { quality: 720, label: 'HD' };
            return { quality: 480, label: 'SD' };
        }
        
        // Для фильмов
        if (releaseYear >= 2023) return { quality: 2160, label: '4K' };
        if (releaseYear >= 2020) return { quality: 1080, label: 'FHD' };
        if (releaseYear >= 2015) return { quality: 720, label: 'HD' };
        if (releaseYear >= 2005) return { quality: 480, label: 'SD' };
        
        return { quality: 480, label: 'SD' };
    }

    /**
     * Мгновенное обновление карточки с быстрой оценкой
     */
    function updateCardWithInstantQuality(cardElement, cardView, cardData) {
        var instantQuality = getInstantQualityEstimate(cardData);
        updateCardListQualityElement(cardView, instantQuality.quality, instantQuality.label, true);
    }

    // ===================== ПАРСИНГ ЯКОСТІ =====================
    
/**
 * Спрощує повну назву якості до короткого формату (Фінальна версія)
 * @param {string} fullLabel - Повна назва якості (вибрана з найкращого релізу JacRed)
 * @param {string} originalTitle - Оригінальна назва торренту
 * @returns {string} - Спрощена назва для відображення на мітці
 */
function simplifyQualityLabel(fullLabel, originalTitle) {
    if (!fullLabel) return ''; // Перевірка на пусту назву
    
    var lowerLabel = fullLabel.toLowerCase(); // Нижній регістр для порівняння
    // var lowerTitle = (originalTitle || '').toLowerCase(); // ❌ БІЛЬШЕ НЕ ВИКОРИСТОВУЄМО (bo перебиває якісний реліз)

    // --- Крок 1: Погані якості (найвищий пріоритет) ---
    // Якщо JacRed вибрав реліз з поганою якістю - показуємо тип якості
    // Це означає що кращих варіантів немає
    
    // CamRip - найгірша якість (запис з кінотеатру камерою)
    if (/(camrip|камрип|cam\b)/.test(lowerLabel)) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to CamRip");
        return "CamRip";
    }
    
    // TS (Telesync) - погана якість (запис з проектора)
    if (/(telesync|телесинк|ts\b)/.test(lowerLabel)) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to TS");
        return "TS";
    }
    
    // TC (Telecine) - погана якість (запис з кіноплівки)
    if (/(telecine|телесин|tc\b)/.test(lowerLabel)) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to TC");
        return "TC";
    }
    
    // SCR (DVD Screener) - погана якість (промо-копія)
    if (/(dvdscr|scr\b)/.test(lowerLabel)) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to SCR");
        return "SCR";
    }

    // --- Крок 2: Якісні джерела (тільки якщо немає поганих якостей) ---
    // Якщо JacRed вибрав якісний реліз - показуємо роздільність
    
    // 4K (Ultra HD) - найвища якість
    if (/(2160p|4k|uhd|ultra hd)/.test(lowerLabel)) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to 4K");
        return "4K";
    }

    // 2К (QHD) - висока якість
    if (/(1440p|1440|2k|qhd)/.test(lowerLabel)) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to QHD");
        return "QHD";
    }
  
    // FHD (Full HD) - висока якість
    if (/(1080p|1080|fullhd|fhd)/.test(lowerLabel)) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to FHD");
        return "FHD";
    }
    
    // HD (High Definition) - середня якість
    if (/(720p|720|hd\b)/.test(lowerLabel)) {
        var hdRegex = /(720p|720|^hd$| hd |hd$)/;
        if (hdRegex.test(lowerLabel)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to HD");
            return "HD";
        }
    }
    
    // SD (Standard Definition) - базова якість
    if (/(480p|480|sd\b)/.test(lowerLabel)) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to SD");
        return "SD";
    }
    
    // LQ (Low Quality) - дуже низька якість
    if (/(360p|360|low quality|lq\b)/.test(lowerLabel)) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to LQ");
        return "LQ";
    }

    // --- Крок 3: Fallback ---
    // Якщо нічого з вищеперерахованого не знайдено, повертаємо оригінальну повну назву
    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "No simplification rules matched, keeping original:", fullLabel);
    return fullLabel;
}

    
    /**
     * Перетворює технічну назву якості на читабельну
     * @param {number} qualityCode - Код якості
     * @param {string} fullTorrentTitle - Повна назва торренту
     * @returns {string} - Відформатована назва якості
     */
    function translateQualityLabel(qualityCode, fullTorrentTitle) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "translateQualityLabel:", qualityCode, fullTorrentTitle);
        var title = sanitizeTitle(fullTorrentTitle || ''); // Нормалізуємо назву
        var titleForSearch = ' ' + title + ' '; // Додаємо пробіли для точного пошуку

        // Пошук роздільності в назві
        var resolution = '';
        var bestResKey = '';
        var bestResLen = 0;
        for (var rKey in RESOLUTION_MAP) {
            if (!RESOLUTION_MAP.hasOwnProperty(rKey)) continue; // Перевірка власної властивості
            var lk = rKey.toString().toLowerCase(); // Нижній регістр ключа
            // Шукаємо повне слово в назві
            if (titleForSearch.indexOf(' ' + lk + ' ') !== -1 || title.indexOf(lk) !== -1) {
                // Вибираємо найдовший збіг (найточніший)
                if (lk.length > bestResLen) {
                    bestResLen = lk.length;
                    bestResKey = rKey;
                }
            }
        }
        if (bestResKey) resolution = RESOLUTION_MAP[bestResKey]; // Отримуємо роздільність

        // Пошук джерела в назві
        var source = '';
        var bestSrcKey = '';
        var bestSrcLen = 0;
        for (var sKey in SOURCE_MAP) {
            if (!SOURCE_MAP.hasOwnProperty(sKey)) continue;
            var lk2 = sKey.toString().toLowerCase();
            if (titleForSearch.indexOf(' ' + lk2 + ' ') !== -1 || title.indexOf(lk2) !== -1) {
                if (lk2.length > bestSrcLen) {
                    bestSrcLen = lk2.length;
                    bestSrcKey = sKey;
                }
            }
        }
        if (bestSrcKey) source = SOURCE_MAP[bestSrcKey]; // Отримуємо джерело

        // Комбінуємо роздільність та джерело
        var finalLabel = '';
        if (resolution && source) {
            if (source.toLowerCase().includes(resolution.toLowerCase())) {
                finalLabel = source; // Якщо джерело вже містить роздільність
            } else {
                finalLabel = resolution + ' ' + source; // Комбінуємо
            }
        } else if (resolution) {
            finalLabel = resolution; // Тільки роздільність
        } else if (source) {
            finalLabel = source; // Тільки джерело
        }

        // Fallback на пряму мапу
        if (!finalLabel || finalLabel.trim() === '') {
            var bestDirectKey = '';
            var maxDirectLen = 0;
            for (var qk in QUALITY_DISPLAY_MAP) {
                if (!QUALITY_DISPLAY_MAP.hasOwnProperty(qk)) continue;
                var lkq = qk.toString().toLowerCase();
                if (title.indexOf(lkq) !== -1) {
                    if (lkq.length > maxDirectLen) {
                        maxDirectLen = lkq.length;
                        bestDirectKey = qk;
                    }
                }
            }
            if (bestDirectKey) {
                finalLabel = QUALITY_DISPLAY_MAP[bestDirectKey]; // Використовуємо пряму мапу
            }
        }

        // Останній fallback
        if (!finalLabel || finalLabel.trim() === '') {
            if (qualityCode) {
                var qc = String(qualityCode).toLowerCase();
                finalLabel = QUALITY_DISPLAY_MAP[qc] || qualityCode; // По коду або оригіналу
            } else {
                finalLabel = fullTorrentTitle || ''; // Оригінальна назва
            }
        }

        // Автоматичне спрощення якості (якщо увімкнено в конфігурації)
        if (LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS) {
            var simplifiedLabel = simplifyQualityLabel(finalLabel, fullTorrentTitle);
            if (simplifiedLabel && simplifiedLabel !== finalLabel) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified quality:", finalLabel, "→", simplifiedLabel);
                finalLabel = simplifiedLabel;
            }
        }

        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Final quality label:", finalLabel);
        return finalLabel;
    }

    // ===================== ЧЕРГА ЗАПИТІВ (Lite-черга) =====================

    var requestQueue = []; // Масив для зберігання завдань у черзі
    var activeRequests = 0; // Лічильник активних запитів

    /**
     * Додає завдання до черги та запускає обробку
     * @param {function} fn - Функція завдання (приймає callback done)
     */
    function enqueueTask(fn) {
        requestQueue.push(fn); // Додаємо завдання в кінець черги
        processQueue(); // Запускаємо обробку черги
    }

    /**
     * Обробляє чергу завдань з дотриманням обмеження паралельності
     */
    function processQueue() {
        // Перевіряємо, чи не перевищено ліміт паралельних запитів
        if (activeRequests >= LQE_CONFIG.MAX_PARALLEL_REQUESTS) return;
        var task = requestQueue.shift(); // Беремо перше завдання з черги
        if (!task) return; // Якщо черга порожня - виходимо
        
        activeRequests++; // Збільшуємо лічильник активних запитів
        
        try {
            // Виконуємо завдання з callback-функцією завершення
            task(function onTaskDone() {
                activeRequests--; // Зменшуємо лічильник
                setTimeout(processQueue, 0); // Запускаємо наступне завдання
            });
        } catch (e) {
            // Обробляємо помилки виконання завдання
            console.error("LQE-LOG", "Queue task error:", e);
            activeRequests--; // Все одно зменшуємо лічильник
            setTimeout(processQueue, 0); // Продовжуємо обробку
        }
    }

    // ===================== ПОШУК В JACRED =====================
    
    /**
     * Визначає якість з назви торренту
     * @param {string} title - Назва торренту
     * @returns {number} - Числовий код якості (2160, 1440, 1080, 720, 480, 3, 2, 1)
     */
    function extractNumericQualityFromTitle(title) {
        if (!title) return 0; // Перевірка на пусту назву
        var lower = title.toLowerCase(); // Нижній регістр для порівняння
        
        // ✅ ПРАВИЛЬНІ ПРІОРИТЕТИ:
        if (/2160p|4k/.test(lower)) return 2160; // Найвищий пріоритет - 4K
		if (/1440p|qhd|2k/.test(lower)) return 1440; // QHD
        if (/1080p/.test(lower)) return 1080; // Full HD
        if (/720p/.test(lower)) return 720; // HD
        if (/480p/.test(lower)) return 480; // SD
        // Погані якості - правильний порядок (TC > TS > CamRip):
        if (/tc|telecine/.test(lower)) return 3; // TC краще за TS
        if (/ts|telesync/.test(lower)) return 2; // TS краще за CamRip
        if (/camrip|камрип/.test(lower)) return 1; // CamRip - найгірше
        
        return 0; // Якість не визначена
    }

    /**
     * Знаходить найкращий реліз в JacRed API
     * @param {object} normalizedCard - Нормалізовані дані картки
     * @param {string} cardId - ID картки
     * @param {function} callback - Callback функція
     */
    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        enqueueTask(function (done) {
            // === ЗМІНА 1: Додано перевірку на майбутній реліз ===
            var releaseDate = normalizedCard.release_date ? new Date(normalizedCard.release_date) : null;
            if (releaseDate && releaseDate.getTime() > Date.now()) {
                if (LQE_CONFIG.LOGGING_QUALITY) {
                    console.log("LQE-QUALITY", "card: " + cardId + ", Future release. Skipping JacRed search.");
                }
                callback(null);
                done();
                return;
            }
            // === КІНЕЦЬ ЗМІНИ 1 ===

            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Searching JacRed...");

            // Перевірка налаштувань JacRed
            if (!LQE_CONFIG.JACRED_URL) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed URL not configured");
                callback(null);
                done();
                return;
            }

            // Витягуємо рік з дати релізу
            var year = '';
            if (normalizedCard.release_date && normalizedCard.release_date.length >= 4) {
                year = normalizedCard.release_date.substring(0, 4);
            }
            if (!year || isNaN(year)) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Invalid year");
                callback(null);
                done();
                return;
            }
            
            var searchYearNum = parseInt(year, 10);
            // Допоміжна функція для витягування року з назви
            function extractYearFromTitle(title) {
                var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
                var match, lastYear = 0;
                var currentYear = new Date().getFullYear();
                while ((match = regex.exec(title)) !== null) {
                    var extractedYear = parseInt(match[1], 10);
                    if (extractedYear >= 1900 && extractedYear <= currentYear + 1) {
                        lastYear = extractedYear;
                    }
                }
                return lastYear;
            }

            // Упрощенная функция пошуку в JacRed API
            function searchJacredApi(searchTitle, searchYear, exactMatch, strategyName, apiCallback) {
                var userId = Lampa.Storage.get('lampac_unic_id', '') || 'default_user';
                var apiUrl = LQE_CONFIG.JACRED_PROTOCOL + LQE_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' +
                    encodeURIComponent(searchTitle) +
                    '&year=' + searchYear +
                    (exactMatch ? '&exact=true' : '') +
                    '&uid=' + userId;
                
                if (LQE_CONFIG.LOGGING_QUALITY) {
                    console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: " + strategyName);
                }

                // Быстрый fallback для очень старых фильмов
                var releaseYear = normalizedCard.release_date ? 
                    parseInt(normalizedCard.release_date.substring(0, 4)) : 0;
                
                if (releaseYear < 2000) {
                    if (LQE_CONFIG.LOGGING_GENERAL) {
                        console.log("LQE-LOG", "card: " + cardId + ", Old movie, quick fallback");
                    }
                    getQualityFallback(normalizedCard, cardId, apiCallback);
                    return;
                }

                smartJacredRequest(apiUrl, cardId, function(error, responseText) {
                    if (error) {
                        if (LQE_CONFIG.LOGGING_GENERAL) {
                            console.log("LQE-LOG", "card: " + cardId + ", JacRed request failed, using fallback");
                        }
                        getQualityFallback(normalizedCard, cardId, apiCallback);
                        return;
                    }
    
                    try {
                        var torrents = JSON.parse(responseText);
                        if (!Array.isArray(torrents) || torrents.length === 0) {
                            if (LQE_CONFIG.LOGGING_QUALITY) {
                                console.log("LQE-QUALITY", "card: " + cardId + ", No torrents found");
                            }
                            getQualityFallback(normalizedCard, cardId, apiCallback);
                            return;
                        }

                        var bestNumericQuality = -1;
                        var bestFoundTorrent = null;

                        // Упрощенный анализ торрентов
                        for (var i = 0; i < Math.min(torrents.length, 10); i++) { // Ограничиваем анализ 10 торрентами
                            var currentTorrent = torrents[i];

                            // Быстрая проверка типа контента
                            if (normalizedCard.type === 'tv') {
                                var tTitle = currentTorrent.title.toLowerCase();
                                if (!/(сезон|season|s\d{1,2}|\d{1,2}\s*из\s*\d{1,2}|серии)/.test(tTitle)) {
                                    continue;
                                }
                            }

                            if (normalizedCard.type === 'movie') {
                                var tTitleMovie = currentTorrent.title.toLowerCase();
                                if (/(сезон|season|s\d{1,2}|\d{1,2}\s*из\s*\d{1,2}|серии)/.test(tTitleMovie)) {
                                    continue;
                                }
                            }

                            // Быстрое определение качества
                            var currentNumericQuality = currentTorrent.quality;
                            if (typeof currentNumericQuality !== 'number' || currentNumericQuality === 0) {
                                currentNumericQuality = extractNumericQualityFromTitle(currentTorrent.title);
                                if (currentNumericQuality === 0) continue;
                            }

                            if (currentNumericQuality > bestNumericQuality) {
                                bestNumericQuality = currentNumericQuality;
                                bestFoundTorrent = currentTorrent;
                            }
                        }

                        if (bestFoundTorrent) {
                            var result = {
                                quality: bestFoundTorrent.quality || bestNumericQuality,
                                full_label: bestFoundTorrent.title
                            };
                            if (LQE_CONFIG.LOGGING_QUALITY) {
                                console.log("LQE-QUALITY", "card: " + cardId + ", Best quality found: " + bestNumericQuality + "p");
                            }
                            apiCallback(result);
                        } else {
                            getQualityFallback(normalizedCard, cardId, apiCallback);
                        }

                    } catch (e) {
                        console.error("LQE-LOG", "card: " + cardId + ", JacRed parse error, using fallback");
                        getQualityFallback(normalizedCard, cardId, apiCallback);
                    }
                });
            }

            // ✅ СТРАТЕГІЇ ПОШУКУ
            var searchStrategies = [];
            // Стратегія 1: Оригінальна назва + точний рік
            if (normalizedCard.original_title && (/[a-zа-яё]/i.test(normalizedCard.original_title) || /^\d+$/.test(normalizedCard.original_title))) {
                searchStrategies.push({
                    title: normalizedCard.original_title.trim(),
                    year: year,
                    exact: true,
                    name: "OriginalTitle Exact Year"
                });
            }

            // Стратегія 2: Локалізована назва + точний рік  
            if (normalizedCard.title && (/[a-zа-яё]/i.test(normalizedCard.title) || /^\d+$/.test(normalizedCard.title))) {
                searchStrategies.push({
                    title: normalizedCard.title.trim(),
                    year: year,
                    exact: true,
                    name: "Title Exact Year"
                });
            }

            // Рекурсивная функция выполнения стратегий
            function executeNextStrategy(index) {
                if (index >= searchStrategies.length) {
                    if (LQE_CONFIG.LOGGING_QUALITY) {
                        console.log("LQE-QUALITY", "card: " + cardId + ", All strategies failed, using fallback");
                    }
                    getQualityFallback(normalizedCard, cardId, callback);
                    done();
                    return;
                }
                
                var s = searchStrategies[index];
                if (LQE_CONFIG.LOGGING_QUALITY) {
                    console.log("LQE-QUALITY", "card: " + cardId + ", Strategy " + (index + 1) + ": " + s.name);
                }
                
                // Добавляем задержку между стратегиями
                setTimeout(function() {
                    searchJacredApi(s.title, s.year, s.exact, s.name, function(result) {
                        if (result !== null) {
                            callback(result);
                            done();
                        } else {
                            executeNextStrategy(index + 1);
                        }
                    });
                }, index * 500); // Задержка увеличивается с каждой стратегией
            }

            if (searchStrategies.length > 0) {
                executeNextStrategy(0);
            } else {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", No valid search titles or strategies defined.");
                if (LQE_CONFIG.USE_FALLBACK_QUALITY) {
                    getQualityFallback(normalizedCard, cardId, callback);
                } else {
                    callback(null);
                }
                done();
            }
        });
    }

    // ===================== КЕШУВАННЯ =====================
    
    /**
     * Отримує дані з кешу
     * @param {string} key - Ключ кешу
     * @returns {object|null} - Дані кешу або null
     */
    function getQualityCache(key) {
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {}; // Отримуємо кеш або пустий об'єкт
        var item = cache[key]; // Отримуємо елемент по ключу
        var isCacheValid = item && (Date.now() - item.timestamp < LQE_CONFIG.CACHE_VALID_TIME_MS); // Перевіряємо валідність
        
        if (LQE_CONFIG.LOGGING_QUALITY) {
            console.log("LQE-QUALITY", "Cache: Checking quality cache for key:", key, "Found:", !!item, "Valid:", isCacheValid);
        }
        
        return isCacheValid ? item : null; // Повертаємо елемент або null
    }

    /**
     * Зберігає дані в кеш
     * @param {string} key - Ключ кешу
     * @param {object} data - Дані для зберігання
     * @param {string} cardId - ID картки для логування
     */
    function saveQualityCache(key, data, cardId) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Cache: Saving quality cache for key:", key, "Data:", data);
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        cache[key] = {
            quality_code: data.quality_code,
            full_label: data.full_label,
            timestamp: Date.now() // Поточний час
        };
        Lampa.Storage.set(LQE_CONFIG.CACHE_KEY, cache); // Зберігаємо в LocalStorage
    }

    /**
     * Видаляє застарілі записи кешу
     */
    function removeExpiredCacheEntries() {
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        var changed = false;
        var now = Date.now();
        
        for (var k in cache) {
            if (!cache.hasOwnProperty(k)) continue;
            var item = cache[k];
            if (!item || !item.timestamp || (now - item.timestamp) > LQE_CONFIG.CACHE_VALID_TIME_MS) {
                delete cache[k]; // Видаляємо застарілий запис
                changed = true;
            }
        }
        
        if (changed) {
            Lampa.Storage.set(LQE_CONFIG.CACHE_KEY, cache);
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Cache: Removed expired entries");
        }
    }

    // Очищаємо застарілий кеш при ініціалізації
    removeExpiredCacheEntries();
    // ===================== UI ДОПОМІЖНІ ФУНКЦІЇ =====================
    
    /**
     * Очищає елементи якості на повній картці
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function clearFullCardQualityElements(cardId, renderElement) {
        if (renderElement) {
            var existingElements = $('.full-start__status.lqe-quality', renderElement);
            if (existingElements.length > 0) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Clearing existing quality elements on full card.");
                existingElements.remove(); // Видаляємо існуючі елементи
            }
        }
    }

    /**
     * Показує заглушку завантаження якості
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function showFullCardQualityPlaceholder(cardId, renderElement) {
        if (!renderElement) return;
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (!rateLine.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cannot show placeholder, .full-start-new__rate-line not found.");
            return;
        }
        
        // Перевіряємо, чи немає вже плейсхолдера якості
        if (!$('.full-start__status.lqe-quality', rateLine).length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Adding quality placeholder on full card.");
            var placeholder = document.createElement('div');
            placeholder.className = 'full-start__status lqe-quality';
            placeholder.textContent = 'Пошук...';
            placeholder.style.opacity = '0.7';
            
            rateLine.append(placeholder); // Додаємо плейсхолдер
        } else {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Placeholder already exists on full card, skipping.");
        }
    }

    /**
     * Оновлює елемент якості на повній картці
     * @param {number} qualityCode - Код якості
     * @param {string} fullTorrentTitle - Назва торренту
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     * @param {boolean} bypassTranslation - Пропустити переклад
     */
    function updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement, bypassTranslation) {
        if (!renderElement) return;
        var element = $('.full-start__status.lqe-quality', renderElement);
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (!rateLine.length) return;

        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

        if (element.length) {
            // Оновлюємо існуючий елемент
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Updating existing element with quality "' + displayQuality + '" on full card.');
            element.text(displayQuality).css('opacity', '1').addClass('show');
        } else {
            // Створюємо новий елемент
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Creating new element with quality '" + displayQuality + "' on full card.");
            var div = document.createElement('div');
            div.className = 'full-start__status lqe-quality';
            div.textContent = displayQuality;
            rateLine.append(div);
            // Додаємо клас для анімації
            setTimeout(function(){ 
                $('.full-start__status.lqe-quality', renderElement).addClass('show'); 
            }, 20);
        }
    }

    /**
     * Оновлює елемент якості на списковій картці
     * @param {Element} cardView - DOM елемент картки
     * @param {number} qualityCode - Код якості
     * @param {string} fullTorrentTitle - Назва торренту
     * @param {boolean} bypassTranslation - Пропустити переклад
     */
    function updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle, bypassTranslation) {
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

        // Перевіряємо наявність ідентичного елемента
        var existing = cardView.querySelector('.card__quality');
        if (existing) {
            var inner = existing.querySelector('div');
            if (inner && inner.textContent === displayQuality) {
                return; // Не оновлюємо якщо текст не змінився
            }
            existing.remove(); // Видаляємо старий
        }

        // Створюємо новий елемент
        var qualityDiv = document.createElement('div');
        qualityDiv.className = 'card__quality';
        var innerElement = document.createElement('div');
        innerElement.textContent = displayQuality;
        qualityDiv.appendChild(innerElement);
        cardView.appendChild(qualityDiv);
        // Плавне з'явлення
        requestAnimationFrame(function(){ qualityDiv.classList.add('show'); });
    }

    // ===================== ОБРОБКА ПОВНОЇ КАРТКИ =====================
    
    /**
     * Обробляє якість для повної картки
     * @param {object} cardData - Дані картки
     * @param {Element} renderElement - DOM елемент
     */
    function processFullCardQuality(cardData, renderElement) {
        if (!renderElement) {
            console.error("LQE-LOG", "Render element is null in processFullCardQuality. Aborting.");
            return;
        }
        
        var cardId = cardData.id;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Processing full card. Data: ", cardData);
        // Нормалізуємо дані картки
        var normalizedCard = {
            id: cardData.id,
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Normalized full card data: ", normalizedCard);
        
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (rateLine.length) {
            // Ховаємо оригінальну лінію та додаємо анімацію завантаження
            rateLine.css('visibility', 'hidden');
            rateLine.addClass('done');
            addLoadingAnimation(cardId, renderElement);
        } else {
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", .full-start-new__rate-line not found, skipping loading animation.");
        }
        
        // Визначаємо тип контенту та створюємо ключ кешу
        var isTvSeries = (normalizedCard.type === 'tv' || normalizedCard.name);
        var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + (isTvSeries ? 'tv_' : 'movie_') + normalizedCard.id;
        // Перевіряємо ручні налаштування (найвищий пріоритет)
        var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Found manual override:", manualOverrideData);
            updateFullCardQualityElement(null, manualOverrideData.full_label, cardId, renderElement, true);
            removeLoadingAnimation(cardId, renderElement);
            rateLine.css('visibility', 'visible');
            return;
        }

        // Отримуємо дані з кешу
        var cachedQualityData = getQualityCache(cacheKey);
        // Перевіряємо, чи не вимкнено якість для серіалів
        if (!(isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality feature enabled for this content, starting processing.');
            if (cachedQualityData) {
                // Використовуємо кешовані дані
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Quality data found in cache:", cachedQualityData);
                updateFullCardQualityElement(cachedQualityData.quality_code, cachedQualityData.full_label, cardId, renderElement);
                
                // Фонове оновлення застарілого кешу
                if (Date.now() - cachedQualityData.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache is old, scheduling background refresh AND UI update.");
                    getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                        if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
                            saveQualityCache(cacheKey, {
                                quality_code: jrResult.quality,
                                full_label: jrResult.full_label
                            }, cardId);
                            updateFullCardQualityElement(jrResult.quality, jrResult.full_label, cardId, renderElement);
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Background cache and UI refresh completed.");
                        }
                    });
                }
                
                removeLoadingAnimation(cardId, renderElement);
                rateLine.css('visibility', 'visible');
            } else {
                // Новий пошук якості
                clearFullCardQualityElements(cardId, renderElement);
                showFullCardQualityPlaceholder(cardId, renderElement);
                
                getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', JacRed callback received for full card. Result:', jrResult);
                    var qualityCode = (jrResult && jrResult.quality) || null;
                    var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
                     
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: JacRed returned - qualityCode: "${qualityCode}", full label: "${fullTorrentTitle}"`);
                    
                    if (qualityCode && qualityCode !== 'NO') {
                        saveQualityCache(cacheKey, {
                            quality_code: qualityCode,
                            full_label: fullTorrentTitle
                        }, cardId);
                        updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement);
                    } else {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", 'card: ' + cardId + ', No quality found from JacRed or it was "NO". Clearing quality elements.');
                        clearFullCardQualityElements(cardId, renderElement);
                    }
                    
                    removeLoadingAnimation(cardId, renderElement);
                    rateLine.css('visibility', 'visible');
                });
            }
        } else {
            // Якість вимкнено для серіалів
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality feature disabled for TV series (as configured), skipping quality fetch.');
            clearFullCardQualityElements(cardId, renderElement);
            removeLoadingAnimation(cardId, renderElement);
            rateLine.css('visibility', 'visible');
        }
        
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Full card quality processing initiated.");
    }

    // ===================== ОБНОВЛЕННЫЙ OBSERVER =====================

    var observer = new MutationObserver(function(mutations) {
        var newCards = [];
        
        for (var m = 0; m < mutations.length; m++) {
            var mutation = mutations[m];
            if (mutation.addedNodes) {
                for (var j = 0; j < mutation.addedNodes.length; j++) {
                    var node = mutation.addedNodes[j];
                    if (node.nodeType !== 1) continue;
                     
                    if (node.classList && node.classList.contains('card')) {
                        newCards.push(node);
                    }
                     
                    try {
                        var nestedCards = node.querySelectorAll('.card');
                        if (nestedCards && nestedCards.length) {
                            for (var k = 0; k < nestedCards.length; k++) {
                                newCards.push(nestedCards[k]);
                            }
                        }
                    } catch (e) {
                        // Игнорируем ошибки селекторов
                    }
                }
            }
        }
        
        if (newCards.length) {
            if (LQE_CONFIG.LOGGING_CARDLIST) {
                console.log("LQE-CARDLIST", "Found", newCards.length, "new cards for lazy loading");
            }
            processNewCardsWithLazyLoading(newCards);
        }
    });

    /**
     * Обработка новых карточек с lazy loading
     */
    function processNewCardsWithLazyLoading(cards) {
        var uniqueCards = cards.filter(function(card) {
            return card && card.isConnected && !card.hasAttribute('data-lqe-quality-processed');
        });
        
        if (uniqueCards.length === 0) return;
        
        // Предзагрузка видимых карточек
        if (LQE_CONFIG.PRELOAD_VISIBLE_CARDS) {
            var visibleCards = uniqueCards.filter(isElementInViewport);
            visibleCards.forEach(function(card) {
                if (!pendingLazyCards.has(card) && !processedLazyCards.has(card)) {
                    pendingLazyCards.add(card);
                }
            });
        }
        
        // Добавление всех карточек в наблюдение
        uniqueCards.forEach(function(card) {
            observeCardForLazyLoading(card);
        });
        
        // Запуск обработки
        scheduleLazyProcessing();
    }

    /**
     * Проверяет, видима ли карточка в viewport
     */
    function isElementInViewport(el) {
        if (!el) return false;
        
        try {
            var rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        } catch (e) {
            return false;
        }
    }

    /**
     * Налаштовує Observer для відстеження нових карток
     */
    function attachObserver() {
        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers && containers.length) {
            for (var i = 0; i < containers.length; i++) {
                try {
                    observer.observe(containers[i], { childList: true, subtree: true });
                } catch (e) {
                    console.error("LQE-LOG", "Observer error:", e);
                }
            }
        } else {
            observer.observe(document.body, { childList: true, subtree: true }); // Fallback на весь документ
        }
    }

    // ===================== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА =====================
    
    /**
     * Ініціалізує плагін якості
     */
    function initializeLampaQualityPlugin() {
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Lampa Quality Enhancer: Initializing...");
        window.lampaQualityPlugin = true;
        
        // Инициализация lazy loading
        initializeLazyLoading();
        
        attachObserver();
        if (LQE_CONFIG.LOGGING_GENERAL) console.log('LQE-LOG: MutationObserver started');
        
        // Обработка уже существующих карточек
        setTimeout(function() {
            var existingCards = document.querySelectorAll('.card:not([data-lqe-quality-processed])');
            if (existingCards.length > 0) {
                processNewCardsWithLazyLoading(Array.from(existingCards));
            }
        }, 1000);
        
        Lampa.Listener.follow('full', function(event) {
            if (event.type == 'complite') {
                var renderElement = event.object.activity.render();
                currentGlobalMovieId = event.data.movie.id;
                
                if (LQE_CONFIG.LOGGING_GENERAL) {
                    console.log("LQE-LOG", "Full card completed for ID:", currentGlobalMovieId);
                }
                
                processFullCardQuality(event.data.movie, renderElement);
            }
        });
        
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Lampa Quality Enhancer: Initialized successfully!");
    }

    // Ініціалізуємо плагін якщо ще не ініціалізовано
    if (!window.lampaQualityPlugin) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeLampaQualityPlugin); // Чекаємо завантаження DOM
        } else {
            initializeLampaQualityPlugin(); // Ініціалізуємо негайно
        }
    }

})();