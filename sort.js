/**
 * Channels Sort — плагин для Lampa
 * Версия: 1.1
 * Изменяет порядок каналов (строк) на главной странице и страницах категорий.
 *
 * Каналы выявляются автоматически при первой загрузке каждого раздела.
 * Порядок сохраняется отдельно для каждого раздела (Главная / Фильмы / Сериалы / и т.д.).
 * Настройки встроены в секцию «Каналы» стандартных настроек Lampa.
 *
 * Ограничение: сортировка действует в пределах одного батча (6 каналов за раз).
 * Если канал из 2-го батча нужно поставить перед каналом из 1-го — это не сработает,
 * так как 1-й батч рендерится раньше. В большинстве случаев первый батч охватывает
 * все важные каналы.
 */
(function () {
    'use strict';

    if (window.__channels_sort_loaded) return;
    window.__channels_sort_loaded = true;

    var STORAGE_DISCOVERED = 'channels_sort_discovered'; // объект {screenKey: [titles]}
    var STORAGE_ORDER      = 'channels_sort_order';      // объект {screenKey: [titles]}

    // Человекочитаемые названия разделов (расширенный список для TMDB)
    var SCREEN_LABELS = {
        'main'  : 'Главная страница',
        'movie' : 'Фильмы',
        'tv'    : 'Сериалы',
        'cat_now_playing': 'Фильмы - Сейчас в кинотеатрах',
        'cat_popular': 'Фильмы - Популярные',
        'cat_top_rated': 'Фильмы - Высокий рейтинг',
        'cat_upcoming': 'Фильмы - Ожидаемые',
        'cat_airing_today': 'Сериалы - Сегодня в эфире',
        'cat_on_the_air': 'Сериалы - В эфире',
        'cat_popular_tv': 'Сериалы - Популярные',
        'cat_top_rated_tv': 'Сериалы - Высокий рейтинг',
        'cat_trending_day': 'Тренды - За день',
        'cat_trending_week': 'Тренды - За неделю',
        'cat_action': 'Жанр - Боевик',
        'cat_comedy': 'Жанр - Комедия',
        'cat_drama': 'Жанр - Драма',
        'cat_horror': 'Жанр - Ужасы',
        'cat_thriller': 'Жанр - Триллер',
        'cat_romance': 'Жанр - Романтика',
        'cat_sci_fi': 'Жанр - Фантастика',
        'cat_fantasy': 'Жанр - Фэнтези',
        'cat_animation': 'Жанр - Анимация',
        'cat_documentary': 'Жанр - Документальный',
        'cat_crime': 'Жанр - Криминал',
        'cat_family': 'Жанр - Семейный',
        'cat_adventure': 'Жанр - Приключения',
        'cat_mystery': 'Жанр - Детектив',
        'cat_western': 'Жанр - Вестерн',
        'cat_war': 'Жанр - Военный',
        'cat_history': 'Жанр - Исторический',
        'cat_music': 'Жанр - Музыка'
    };

    // Словарь: название канала → имя плагина (заполняется через перехват ContentRows.add)
    var _pluginInfoMap = {};

    // ── Ключ раздела ──────────────────────────────────────────────────────────

    function getScreenKey(apiMethod, params) {
        if (apiMethod === 'main') return 'main';
        var url = (params && params.url) || '';
        
        // Основные разделы
        if (!url || url === 'movie') return 'movie';
        if (url === 'tv') return 'tv';
        
        // TMDB категории фильмов
        if (url.indexOf('now_playing') >= 0) return 'cat_now_playing';
        if (url.indexOf('upcoming') >= 0) return 'cat_upcoming';
        if (url.indexOf('top_rated') >= 0 && url.indexOf('movie') >= 0) return 'cat_top_rated';
        if (url.indexOf('popular') >= 0 && url.indexOf('movie') >= 0) return 'cat_popular';
        
        // TMDB категории сериалов
        if (url.indexOf('airing_today') >= 0) return 'cat_airing_today';
        if (url.indexOf('on_the_air') >= 0) return 'cat_on_the_air';
        if (url.indexOf('popular') >= 0 && url.indexOf('tv') >= 0) return 'cat_popular_tv';
        if (url.indexOf('top_rated') >= 0 && url.indexOf('tv') >= 0) return 'cat_top_rated_tv';
        
        // Тренды
        if (url.indexOf('trending') >= 0) {
            if (url.indexOf('day') >= 0) return 'cat_trending_day';
            if (url.indexOf('week') >= 0) return 'cat_trending_week';
        }
        
        // Жанры (определение по ID жанра)
        if (url.indexOf('genre') >= 0 || url.indexOf('with_genres') >= 0) {
            if (url.indexOf('28') >= 0) return 'cat_action';
            if (url.indexOf('35') >= 0) return 'cat_comedy';
            if (url.indexOf('18') >= 0) return 'cat_drama';
            if (url.indexOf('27') >= 0) return 'cat_horror';
            if (url.indexOf('53') >= 0) return 'cat_thriller';
            if (url.indexOf('10749') >= 0) return 'cat_romance';
            if (url.indexOf('878') >= 0) return 'cat_sci_fi';
            if (url.indexOf('14') >= 0) return 'cat_fantasy';
            if (url.indexOf('16') >= 0) return 'cat_animation';
            if (url.indexOf('99') >= 0) return 'cat_documentary';
            if (url.indexOf('80') >= 0) return 'cat_crime';
            if (url.indexOf('10751') >= 0) return 'cat_family';
            if (url.indexOf('12') >= 0) return 'cat_adventure';
            if (url.indexOf('9648') >= 0) return 'cat_mystery';
            if (url.indexOf('37') >= 0) return 'cat_western';
            if (url.indexOf('10752') >= 0) return 'cat_war';
            if (url.indexOf('36') >= 0) return 'cat_history';
            if (url.indexOf('10402') >= 0) return 'cat_music';
        }
        
        // Для нестандартных категорий — нормализованная версия URL
        return 'cat_' + url.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    }

    function getScreenLabel(key) {
        return SCREEN_LABELS[key] || key;
    }

    // ── Хранилище ──────────────────────────────────────────────────────────────

    function isPlainObject(v) {
        return v && typeof v === 'object' && !Array.isArray(v);
    }

    function getAllDiscovered() {
        var v = Lampa.Storage.get(STORAGE_DISCOVERED, {});
        return isPlainObject(v) ? v : {};
    }

    function getAllOrders() {
        var v = Lampa.Storage.get(STORAGE_ORDER, {});
        return isPlainObject(v) ? v : {};
    }

    function getDiscovered(screenKey) {
        var v = getAllDiscovered()[screenKey];
        return Array.isArray(v) ? v : [];
    }

    function getOrder(screenKey) {
        var v = getAllOrders()[screenKey];
        return Array.isArray(v) ? v : [];
    }

    function setOrder(screenKey, arr) {
        var all = getAllOrders();
        all[screenKey] = arr;
        Lampa.Storage.set(STORAGE_ORDER, all);
    }

    function addDiscovered(screenKey, title) {
        if (!title) return;
        var all = getAllDiscovered();
        if (!Array.isArray(all[screenKey])) all[screenKey] = [];
        if (all[screenKey].indexOf(title) === -1) {
            all[screenKey].push(title);
            Lampa.Storage.set(STORAGE_DISCOVERED, all);
        }
    }

    // Возвращает все screenKey, для которых есть выявленные каналы
    function getKnownScreenKeys() {
        var all = getAllDiscovered();
        var keys = [];
        for (var k in all) {
            if (all.hasOwnProperty(k) && Array.isArray(all[k]) && all[k].length) keys.push(k);
        }
        return keys;
    }

    // ── Перехват ContentRows.add для записи информации о плагине ───────────────

    function interceptContentRows() {
        if (!Lampa.ContentRows || typeof Lampa.ContentRows.add !== 'function') return;
        var origAdd = Lampa.ContentRows.add;
        Lampa.ContentRows.add = function (row) {
            if (row && row.title && row.name) {
                _pluginInfoMap[row.title] = row.name;
            }
            return origAdd.call(this, row);
        };
    }

    // ── Сортировка массива data ────────────────────────────────────────────────

    function sortData(screenKey, data) {
        if (!Array.isArray(data) || !data.length) return data;

        // Выявляем новые каналы для этого раздела
        data.forEach(function (d) {
            if (d && d.title) addDiscovered(screenKey, d.title);
        });

        var order = getOrder(screenKey);
        if (!order.length) return data;

        // Сортируем; каналы без позиции идут в конец
        return data.slice().sort(function (a, b) {
            var ia = order.indexOf(a.title);
            var ib = order.indexOf(b.title);
            if (ia === -1) ia = 99999;
            if (ib === -1) ib = 99999;
            return ia - ib;
        });
    }

    // ── Перехват Api.main и Api.category ─────────────────────────────────────

    function makeWrapper(screenKey, oncomplite) {
        if (typeof oncomplite !== 'function') return oncomplite;
        return function (data) {
            return oncomplite(sortData(screenKey, data));
        };
    }

    function interceptApi() {
        if (!Lampa.Api) return;

        if (typeof Lampa.Api.main === 'function') {
            var origMain = Lampa.Api.main;
            Lampa.Api.main = function (params, oncomplite, onerror) {
                var key = getScreenKey('main', params);
                return origMain.call(this, params, makeWrapper(key, oncomplite), onerror);
            };
        }

        if (typeof Lampa.Api.category === 'function') {
            var origCategory = Lampa.Api.category;
            Lampa.Api.category = function (params, oncomplite, onerror) {
                var key = getScreenKey('category', params);
                return origCategory.call(this, params, makeWrapper(key, oncomplite), onerror);
            };
        }
    }

    // ── Редактор: выбор раздела ────────────────────────────────────────────────

    function openEditor() {
        var keys = getKnownScreenKeys();

        if (!keys.length) {
            Lampa.Noty.show('Сначала откройте различные разделы — каналы выявятся автоматически');
            return;
        }

        // Если только один раздел — сразу открываем редактор, минуя Select
        if (keys.length === 1) {
            openScreenEditor(keys[0]);
            return;
        }

        var items = keys.map(function (key) {
            return { title: getScreenLabel(key), screenKey: key };
        });

        Lampa.Select.show({
            title: 'Выберите раздел',
            items: items,
            onBack: function () {
                Lampa.Controller.toggle('settings_component');
            },
            onSelect: function (item) {
                openScreenEditor(item.screenKey);
            }
        });
    }

    // ── Редактор: порядок каналов для одного раздела ──────────────────────────

    function openScreenEditor(screenKey) {
        var discovered  = getDiscovered(screenKey);
        var savedOrder  = getOrder(screenKey);

        // Формируем текущий список: сохраненный порядок, затем неизвестные
        var currentOrder = [];
        savedOrder.forEach(function (t) {
            if (discovered.indexOf(t) >= 0) currentOrder.push(t);
        });
        discovered.forEach(function (t) {
            if (currentOrder.indexOf(t) === -1) currentOrder.push(t);
        });

        var list = $('<div class="menu-edit-list"></div>');
        var _changed = false;

        function updateOrder() {
            var newOrder = [];
            list.find('.menu-edit-list__item[data-channel]').each(function () {
                newOrder.push($(this).data('channel'));
            });
            setOrder(screenKey, newOrder);
            _changed = true;
        }

        currentOrder.forEach(function (title) {
            var pluginInfo = _pluginInfoMap[title] || '';
            var subtitleHtml = pluginInfo
                ? '<span style="display:block;font-size:0.72em;opacity:0.5;font-weight:normal;margin-top:0.15em;">' + pluginInfo + '</span>'
                : '';

            var row = $(
                '<div class="menu-edit-list__item" data-channel="' + title + '">' +
                    '<div class="menu-edit-list__title">' + title + subtitleHtml + '</div>' +
                    '<div class="menu-edit-list__move move-up selector">' +
                        '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                            '<path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="menu-edit-list__move move-down selector">' +
                        '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                            '<path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
                        '</svg>' +
                    '</div>' +
                '</div>'
            );

            row.find('.move-up').on('hover:enter', function () {
                var prev = row.prev('.menu-edit-list__item[data-channel]');
                if (prev.length) { row.insertBefore(prev); updateOrder(); }
            });

            row.find('.move-down').on('hover:enter', function () {
                var next = row.next('.menu-edit-list__item[data-channel]');
                if (next.length) { row.insertAfter(next); updateOrder(); }
            });

            list.append(row);
        });

        var resetBtn = $('<div class="selector folder-reset-button">Сбросить порядок для этого раздела</div>');
        resetBtn.on('hover:enter', function () {
            setOrder(screenKey, []);
            Lampa.Modal.close();
            window.location.reload();
        });
        list.append(resetBtn);

        Lampa.Modal.open({
            title: 'Каналы: ' + getScreenLabel(screenKey),
            html: list,
            size: 'small',
            onBack: function () {
                Lampa.Modal.close();
                if (_changed) {
                    window.location.reload();
                } else {
                    Lampa.Controller.toggle('settings_component');
                }
            }
        });
    }

    // ── Встраивание в секцию «Каналы» ────────────────────────────────────────

    // content_rows.settings() удаляет и перестраивает свои params при каждом открытии
    // главного меню настроек (e.name === 'main'). Мы добавляем свои params сразу после
    // через setTimeout(0), пока пользователь еще не нажал «Каналы».

    function addParamsToContentRows() {
        Lampa.SettingsApi.addParam({
            component: 'content_rows',
            param: { name: 'channels_sort_sep', type: 'title', default: '' },
            field: { name: 'Сортировка каналов' }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_rows',
            param: { name: 'channels_sort_edit', type: 'button', default: '' },
            field: {
                name: 'Редактор порядка',
                description: 'Открыть редактор порядка каналов (отдельно для каждого раздела)'
            },
            onChange: openEditor
        });

        Lampa.SettingsApi.addParam({
            component: 'content_rows',
            param: { name: 'channels_sort_reset_all', type: 'button', default: '' },
            field: {
                name: 'Сбросить все порядки',
                description: 'Вернуть стандартный порядок каналов во всех разделах'
            },
            onChange: function () {
                Lampa.Storage.set(STORAGE_ORDER, {});
                Lampa.Noty.show('Порядок каналов сброшен во всех разделах');
                setTimeout(function () { window.location.reload(); }, 500);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'content_rows',
            param: { name: 'channels_sort_clear', type: 'button', default: '' },
            field: {
                name: 'Очистить список каналов',
                description: 'Удалить все сохраненные названия каналов для повторного выявления'
            },
            onChange: function () {
                Lampa.Storage.set(STORAGE_DISCOVERED, {});
                Lampa.Storage.set(STORAGE_ORDER, {});
                Lampa.Noty.show('Список каналов очищен');
                setTimeout(function () { window.location.reload(); }, 500);
            }
        });
    }

    function createSettings() {
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'main') {
                // content_rows.settings() уже выполнилась синхронно — добавляем после нее
                setTimeout(addParamsToContentRows, 0);
            }
        });
    }

    // ── Старт плагина ─────────────────────────────────────────────────────────

    function startPlugin() {
        interceptApi();
        createSettings();
    }

    var _timer = setInterval(function () {
        if (typeof Lampa === 'undefined') return;
        clearInterval(_timer);
        // Перехватываем ContentRows.add как можно раньше — до того как плагины регистрируют каналы
        interceptContentRows();
        if (window.appready) {
            startPlugin();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') startPlugin();
            });
        }
    }, 100);
})();