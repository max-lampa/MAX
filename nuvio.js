/**
 * Nuvio Badges Plugin for Lampa
 * Отображает бейджи качества/источника на торрентах и онлайн-источниках
 * Данные: https://gist.githubusercontent.com/anupamparida/f1877b01573637c1616d81de0e80a2cc/raw/17e5d1cca70e45a030e036cfb23fac145f0ab6f6/Nuvio_badges.json
 * @version 1.0.0
 */
(function () {
    'use strict';

    var PLUGIN_NAME   = 'nuvio_badges';
    var BADGES_URL    = 'https://gist.githubusercontent.com/anupamparida/f1877b01573637c1616d81de0e80a2cc/raw/17e5d1cca70e45a030e036cfb23fac145f0ab6f6/Nuvio_badges.json';
    var badgesData    = null;
    var loadPromise   = null;

    // ── Конвертация цвета #AARRGGBB → rgba() ──────────────────────────────────
    function hexToRgba(hex) {
        if (!hex || hex === '#00000000') return 'transparent';
        hex = hex.replace('#', '');
        if (hex.length === 8) {
            var a = parseInt(hex.substring(0, 2), 16) / 255;
            var r = parseInt(hex.substring(2, 4), 16);
            var g = parseInt(hex.substring(4, 6), 16);
            var b = parseInt(hex.substring(6, 8), 16);
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')';
        }
        if (hex.length === 6) {
            var r2 = parseInt(hex.substring(0, 2), 16);
            var g2 = parseInt(hex.substring(2, 4), 16);
            var b2 = parseInt(hex.substring(4, 6), 16);
            return 'rgb(' + r2 + ',' + g2 + ',' + b2 + ')';
        }
        return hex;
    }

    // ── Загрузка JSON с бейджами ───────────────────────────────────────────────
    function loadBadges() {
        if (loadPromise) return loadPromise;
        loadPromise = new Promise(function (resolve, reject) {
            if (badgesData) { resolve(badgesData); return; }
            var cached = Lampa.Storage.get(PLUGIN_NAME + '_cache', '');
            var cachedAt = Lampa.Storage.get(PLUGIN_NAME + '_cached_at', 0);
            var now = Date.now();
            // Кэш на 24 часа
            if (cached && (now - cachedAt) < 86400000) {
                try { badgesData = JSON.parse(cached); resolve(badgesData); return; }
                catch (e) {}
            }
            $.ajax({
                url: BADGES_URL,
                type: 'GET',
                dataType: 'json',
                timeout: 10000,
                success: function (data) {
                    badgesData = data;
                    try {
                        Lampa.Storage.set(PLUGIN_NAME + '_cache', JSON.stringify(data));
                        Lampa.Storage.set(PLUGIN_NAME + '_cached_at', Date.now());
                    } catch (e) {}
                    resolve(data);
                },
                error: function () { reject(new Error('Nuvio Badges: не удалось загрузить JSON')); }
            });
        });
        return loadPromise;
    }

    // ── Проверка: включена ли группа в настройках ─────────────────────────────
    function isGroupEnabled(groupId) {
        var key = PLUGIN_NAME + '_group_' + groupId;
        var val = Lampa.Storage.get(key, 'true');
        return val !== 'false';
    }

    // ── Подбор бейджей для строки текста ──────────────────────────────────────
    function matchBadges(text) {
        if (!badgesData || !text) return [];
        var result = [];
        badgesData.filters.forEach(function (filter) {
            if (!filter.isEnabled) return;
            if (!isGroupEnabled(filter.groupId)) return;
            try {
                // Паттерн из JSON содержит (?i) — заменяем на флаг i
                var patternStr = filter.pattern.replace(/^(?i)/, '');
                var rx = new RegExp(patternStr, 'i');
                if (rx.test(text)) result.push(filter);
            } catch (e) { /* невалидный regex — пропускаем */ }
        });
        return result;
    }

    // ── Рендер одного бейджа ──────────────────────────────────────────────────
    function renderBadge(filter) {
        var borderColor = hexToRgba(filter.borderColor);
        var tagColor    = hexToRgba(filter.tagColor);
        var textColor   = filter.textColor || '#ffffff';
        var isFilled    = filter.tagStyle === 'filled';

        var bg     = isFilled ? (tagColor !== 'transparent' ? tagColor : 'rgba(0,0,0,0.5)') : 'transparent';
        var border = borderColor !== 'transparent' ? '1px solid ' + borderColor : '1px solid rgba(255,255,255,0.15)';

        var $badge = $('<span class="nuvio-badge"></span>').css({
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '3px',
            padding:        '2px 7px',
            borderRadius:   '4px',
            fontSize:       '10px',
            fontWeight:     '700',
            letterSpacing:  '0.4px',
            background:     bg,
            border:         border,
            color:          textColor,
            marginRight:    '4px',
            marginBottom:   '2px',
            verticalAlign:  'middle',
            lineHeight:     '1.6',
            textTransform:  'uppercase',
            whiteSpace:     'nowrap',
            backdropFilter: 'blur(4px)'
        });

        if (filter.imageURL) {
            var $img = $('<img/>').attr('src', filter.imageURL).css({
                width:       '14px',
                height:      '14px',
                objectFit:   'contain',
                borderRadius:'2px',
                flexShrink:  '0'
            }).on('error', function () { $(this).hide(); });
            $badge.append($img);
        }

        $badge.append($('<span>' + filter.name + '</span>'));
        return $badge;
    }

    // ── Враппер контейнера бейджей ────────────────────────────────────────────
    function getBadgeContainer($parent, id) {
        var $existing = $parent.find('.nuvio-badges-wrap[data-id="' + id + '"]');
        if ($existing.length) return $existing;
        var $wrap = $('<div class="nuvio-badges-wrap"></div>').attr('data-id', id).css({
            display:    'flex',
            flexWrap:   'wrap',
            gap:        '3px',
            marginTop:  '4px',
            marginBottom:'2px'
        });
        $parent.append($wrap);
        return $wrap;
    }

    // ── Стили (глобальные) ────────────────────────────────────────────────────
    function injectStyles() {
        if ($('#nuvio-badges-styles').length) return;
        $('<style id="nuvio-badges-styles">' +
            '.nuvio-badge { cursor: default; user-select: none; }' +
            '.nuvio-badge:hover { filter: brightness(1.2); }' +
            '.nuvio-badges-wrap { line-height: 1; }' +
        '</style>').appendTo('head');
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ТОРРЕНТЫ
    // Lampa отправляет событие 'torrent' с типами: start, render, item
    // ═════════════════════════════════════════════════════════════════════════
    function handleTorrentItem(item, render) {
        var title = '';
        if (item) {
            title = item.title || item.name || item.tracker || '';
        }
        if (!title && render) {
            var $el = $(render);
            title = $el.find('.torrent-item__title, .torrent__title, .title, h4').first().text() || $el.text();
        }
        if (!title) return;

        var badges = matchBadges(title);
        if (!badges.length) return;

        var $container = $(render);
        var $titleEl   = $container.find('.torrent-item__title, .torrent__title, .title').first();
        var $target    = $titleEl.length ? $titleEl.parent() : $container;

        var $wrap = getBadgeContainer($target, 'torrent_' + encodeURIComponent(title.substring(0, 30)));
        $wrap.empty();
        badges.forEach(function (f) { $wrap.append(renderBadge(f)); });
    }

    function setupTorrentListener() {
        Lampa.Listener.follow('torrent', function (e) {
            loadBadges().then(function () {
                if (e.type === 'item' && e.element && e.data) {
                    handleTorrentItem(e.data, e.element);
                }
                if (e.type === 'render' && e.render) {
                    // Обход всех уже отрендеренных элементов
                    $(e.render).find('.torrent-item, .torrent__item, [data-title]').each(function () {
                        var $el    = $(this);
                        var title  = $el.data('title') || $el.find('.torrent-item__title,.torrent__title,.title').first().text();
                        if (!title) return;
                        var badges = matchBadges(title);
                        if (!badges.length) return;
                        var $wrap  = getBadgeContainer($el, 'torrent_' + encodeURIComponent(title.substring(0, 30)));
                        $wrap.empty();
                        badges.forEach(function (f) { $wrap.append(renderBadge(f)); });
                    });
                }
            }).catch(function () {});
        });
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ОНЛАЙН-ИСТОЧНИКИ
    // Перехватываем события 'full' (карточка фильма) и 'online' (выбор источника)
    // ═════════════════════════════════════════════════════════════════════════

    // Вешаем бейджи на кнопки онлайн-источников
    function decorateOnlineButtons($scope) {
        $scope.find('.online--button, .online__button, [data-source]').each(function () {
            var $btn   = $(this);
            if ($btn.find('.nuvio-badges-wrap').length) return;
            var label  = $btn.find('.online--button-label, .label, span').first().text()
                       + ' ' + ($btn.data('source') || '') + ' ' + $btn.attr('data-title', '');
            var title  = $btn.text() + ' ' + ($btn.data('source') || '');
            var badges = matchBadges(title);
            if (!badges.length) return;
            var $wrap  = $('<div class="nuvio-badges-wrap"></div>').css({ display:'flex', flexWrap:'wrap', gap:'2px', marginTop:'3px' });
            badges.forEach(function (f) { $wrap.append(renderBadge(f)); });
            $btn.append($wrap);
        });
    }

    // Вешаем бейджи на активный онлайн-плеер / header
    function decorateOnlinePlayer($scope, movieData) {
        if (!$scope || !$scope.length) return;
        var title = '';
        if (movieData) {
            title = (movieData.title || '') + ' ' + (movieData.original_title || '');
        }

        // Ищем ярлыки качества внутри онлайн-плеера
        $scope.find('.player--quality, .quality-item, [data-quality]').each(function () {
            var $el      = $(this);
            if ($el.find('.nuvio-badges-wrap').length) return;
            var qualText = $el.text() + ' ' + ($el.data('quality') || '');
            var badges   = matchBadges(qualText);
            if (!badges.length) return;
            var $wrap    = $('<span class="nuvio-badges-wrap" style="margin-left:6px;display:inline-flex;gap:2px;vertical-align:middle;"></span>');
            badges.forEach(function (f) { $wrap.append(renderBadge(f)); });
            $el.append($wrap);
        });

        // Бейджи на заголовок источника в header
        $scope.find('.online--header, .online-head, .source-title').each(function () {
            var $el      = $(this);
            if ($el.find('.nuvio-badges-wrap').length) return;
            var srcText  = $el.text();
            var badges   = matchBadges(srcText + ' ' + title);
            if (!badges.length) return;
            var $wrap    = $('<span class="nuvio-badges-wrap" style="margin-left:8px;display:inline-flex;gap:2px;vertical-align:middle;"></span>');
            badges.forEach(function (f) { $wrap.append(renderBadge(f)); });
            $el.append($wrap);
        });
    }

    function setupOnlineListener() {
        // Событие открытия карточки фильма
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            loadBadges().then(function () {
                var $render  = e.object && e.object.activity ? e.object.activity.render() : null;
                var movieData= e.data ? e.data.movie : null;
                if ($render && $render.length) {
                    decorateOnlineButtons($render);
                    decorateOnlinePlayer($render, movieData);
                    // Повторная проверка через 1.5с (источники могут грузиться асинхронно)
                    setTimeout(function () {
                        decorateOnlineButtons($render);
                        decorateOnlinePlayer($render, movieData);
                    }, 1500);
                    setTimeout(function () {
                        decorateOnlineButtons($render);
                        decorateOnlinePlayer($render, movieData);
                    }, 4000);
                }
            }).catch(function () {});
        });

        // Событие онлайн-просмотра (выбор источника/эпизода)
        Lampa.Listener.follow('online', function (e) {
            loadBadges().then(function () {
                if (e.type === 'start' || e.type === 'complite' || e.type === 'render') {
                    var $render = e.render ? $(e.render) : null;
                    if ($render && $render.length) {
                        decorateOnlineButtons($render);
                        decorateOnlinePlayer($render, e.movie || null);
                    }
                }
                // Событие выбора файла/серии — проверяем title
                if ((e.type === 'file' || e.type === 'episode') && e.data) {
                    var title = e.data.title || e.data.name || '';
                    var badges = matchBadges(title);
                    if (badges.length && e.render) {
                        var $wrap = getBadgeContainer($(e.render), 'online_' + encodeURIComponent(title.substring(0,30)));
                        $wrap.empty();
                        badges.forEach(function (f) { $wrap.append(renderBadge(f)); });
                    }
                }
            }).catch(function () {});
        });

        // Событие плеера — декорируем информацию о файле
        Lampa.Listener.follow('player', function (e) {
            loadBadges().then(function () {
                if (e.type === 'start' && e.file) {
                    var title = e.file.title || e.file.name || '';
                    if (!title) return;
                    var badges = matchBadges(title);
                    if (!badges.length) return;
                    // Вставляем бейджи в оверлей плеера
                    var $overlay = $('.player--info, .player--title').first();
                    if ($overlay.length && !$overlay.find('.nuvio-badges-wrap').length) {
                        var $wrap = $('<div class="nuvio-badges-wrap" style="display:flex;flex-wrap:wrap;gap:3px;margin-top:6px;"></div>');
                        badges.forEach(function (f) { $wrap.append(renderBadge(f)); });
                        $overlay.append($wrap);
                    }
                }
            }).catch(function () {});
        });
    }

    // ═════════════════════════════════════════════════════════════════════════
    // НАСТРОЙКИ ПЛАГИНА
    // ═════════════════════════════════════════════════════════════════════════
    function registerSettings() {
        if (!Lampa.SettingsApi) return;
        Lampa.SettingsApi.addComponent({
            component: PLUGIN_NAME,
            name:      'Nuvio Badges',
            icon:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 7A1.5 1.5 0 0 1 7 5.5h10A1.5 1.5 0 0 1 18.5 7v2.086l1.707 1.707a1 1 0 0 1 0 1.414L18.5 13.914V17a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 17v-3.086l-1.707-1.707a1 1 0 0 1 0-1.414L5.5 9.086V7z"/></svg>'
        });

        loadBadges().then(function (data) {
            data.groups.forEach(function (group) {
                var key = PLUGIN_NAME + '_group_' + group.id;
                Lampa.SettingsApi.addParam({
                    component: PLUGIN_NAME,
                    param: {
                        name:    key,
                        type:    'toggle',
                        default: true
                    },
                    field: {
                        name: group.name,
                        description: 'Показывать бейджи группы «' + group.name + '»'
                    },
                    onChange: function (v) {
                        Lampa.Storage.set(key, String(v));
                    }
                });
            });
        }).catch(function () {});
    }

    // ═════════════════════════════════════════════════════════════════════════
    // ИНИЦИАЛИЗАЦИЯ
    // ═════════════════════════════════════════════════════════════════════════
    function init() {
        injectStyles();
        // Предзагрузка данных
        loadBadges().then(function () {
            console.log('[Nuvio Badges] JSON загружен, фильтров: ' + badgesData.filters.length);
        }).catch(function (err) {
            console.warn('[Nuvio Badges]', err.message);
        });

        setupTorrentListener();
        setupOnlineListener();
        registerSettings();

        // Если плагин загружен когда карточка уже открыта
        try {
            var active = Lampa.Activity.active();
            if (active && active.component === 'full') {
                loadBadges().then(function () {
                    var $render = active.activity.render();
                    decorateOnlineButtons($render);
                    decorateOnlinePlayer($render, active.card);
                }).catch(function () {});
            }
        } catch (e) {}

        console.log('[Nuvio Badges] Плагин инициализирован');
    }

    // ── Точка входа ───────────────────────────────────────────────────────────
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();