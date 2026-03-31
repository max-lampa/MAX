/**
 * Управление кнопками в полной карточке Lampa
 * Версия: 1.1.1
 *
 * Реализовано:
 * - порядок кнопок и их группировка;
 * - скрытие/показ кнопок;
 * - режимы отображения текста на кнопках;
 * - папки для объединения кнопок;
 * - стабильная сортировка и дедупликация полных дублей онлайн-кнопок.
 *
 * Совместимость:
 * - ES5-совместимая реализация для старых WebView/устройств;
 * - polyfill для базовых Array-методов;
 * - сохранение настроек в Lampa.Storage.
 */

(function() {
    'use strict';

    // Защита от двойной инициализации
    if (window.__LampaButtonsInitGuard) return;
    window.__LampaButtonsInitGuard = true;

    // Polyfill-ы для совместимости со старыми устройствами
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            var T, k;
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            if (arguments.length > 1) T = thisArg;
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }

    if (!Array.prototype.filter) {
        Array.prototype.filter = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var res = [];
            var T = thisArg;
            var k = 0;
            while (k < len) {
                if (k in O) {
                    var kValue = O[k];
                    if (callback.call(T, kValue, k, O)) res.push(kValue);
                }
                k++;
            }
            return res;
        };
    }

    if (!Array.prototype.find) {
        Array.prototype.find = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var T = thisArg;
            var k = 0;
            while (k < len) {
                var kValue = O[k];
                if (callback.call(T, kValue, k, O)) return kValue;
                k++;
            }
            return undefined;
        };
    }

    if (!Array.prototype.some) {
        Array.prototype.some = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var T = thisArg;
            var k = 0;
            while (k < len) {
                if (k in O && callback.call(T, O[k], k, O)) return true;
                k++;
            }
            return false;
        };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (len === 0) return -1;
            var n = fromIndex | 0;
            if (n >= len) return -1;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in O && O[k] === searchElement) return k;
                k++;
            }
            return -1;
        };
    }

    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    if (!Array.prototype.findIndex) {
        Array.prototype.findIndex = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var T = thisArg;
            var k = 0;
            while (k < len) {
                if (callback.call(T, O[k], k, O)) return k;
                k++;
            }
            return -1;
        };
    }

    var LAMPAC_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"></path></svg>';

    var EXCLUDED_CLASSES = ['button--play', 'button--edit-order', 'button--folder'];

    // Функция локализации
    function getTranslation(key) {
        var translated = Lampa.Lang.translate(key);
        return translated && translated !== key ? translated : key.replace('buttons_plugin_', '');
    }

    // Добавляем переводы для элементов интерфейса плагина
    Lampa.Lang.add({
        buttons_plugin_button_order: {
            ru: 'Порядок кнопок',
            en: 'Buttons order',
            zh: '按钮顺序'
        },
        buttons_plugin_reset_default: {
            ru: 'Сбросить по умолчанию',
            en: 'Reset to default',
            zh: '重置为默认'
        },
        buttons_plugin_button_editor: {
            ru: 'Редактор кнопок',
            en: 'Buttons editor',
            zh: '按钮编辑器'
        },
        buttons_plugin_button_editor_enabled: {
            ru: 'Редактор кнопок включен',
            en: 'Buttons editor enabled',
            zh: '按钮编辑器已启用'
        },
        buttons_plugin_button_editor_disabled: {
            ru: 'Редактор кнопок выключен',
            en: 'Buttons editor disabled',
            zh: '按钮编辑器已禁用'
        },
        buttons_plugin_button_unknown: {
            ru: 'Кнопка',
            en: 'Button',
            zh: '按钮'
        },
        buttons_plugin_folder_name: {
            ru: 'Название папки',
            en: 'Folder name',
            zh: '文件夹名称'
        },
        buttons_plugin_folder_created: {
            ru: 'Папка создана',
            en: 'Folder created',
            zh: '文件夹已创建'
        },
        buttons_plugin_folder_deleted: {
            ru: 'Папка удалена',
            en: 'Folder deleted',
            zh: '文件夹已删除'
        },
        buttons_plugin_folder_order: {
            ru: 'Порядок кнопок в папке',
            en: 'Buttons order in folder',
            zh: '文件夹中的按钮顺序'
        },
        buttons_plugin_create_folder: {
            ru: 'Создать папку',
            en: 'Create folder',
            zh: '创建文件夹'
        },
        buttons_plugin_select_buttons: {
            ru: 'Выберите кнопки для папки',
            en: 'Select buttons for folder',
            zh: '选择文件夹的按钮'
        },
        buttons_plugin_min_2_buttons: {
            ru: 'Выберите минимум 2 кнопки',
            en: 'Select at least 2 buttons',
            zh: '至少选择2个按钮'
        },
        buttons_plugin_edit_order: {
            ru: 'Изменить порядок',
            en: 'Edit order',
            zh: '编辑顺序'
        },
        buttons_plugin_settings_reset: {
            ru: 'Настройки сброшены',
            en: 'Settings reset',
            zh: '设置已重置'
        },
        buttons_plugin_move: {
            ru: 'Сдвиг',
            en: 'Move',
            zh: '移动'
        },
        buttons_plugin_view: {
            ru: 'Вид',
            en: 'View',
            zh: '视图'
        },
        buttons_plugin_show: {
            ru: 'Показ',
            en: 'Show',
            zh: '显示'
        },
        buttons_plugin_change_icon: {
            ru: 'Изменить иконку',
            en: 'Change icon',
            zh: '更改图标'
        },
        buttons_plugin_select_icon: {
            ru: 'Выбор иконки',
            en: 'Choose icon',
            zh: '选择图标'
        },
        buttons_plugin_icon_color: {
            ru: 'Цвет иконок',
            en: 'Icon color',
            zh: '图标颜色'
        },
        buttons_plugin_default: {
            ru: 'Стандартный',
            en: 'Default',
            zh: '默认'
        },
        buttons_plugin_hex_color: {
            ru: 'Ввести HEX код',
            en: 'Enter HEX color',
            zh: '输入 HEX 颜色'
        },
        buttons_plugin_edit_name: {
            ru: 'Изменить название',
            en: 'Rename button',
            zh: '重命名按钮'
        },
        buttons_plugin_button_name: {
            ru: 'Название кнопки',
            en: 'Button name',
            zh: '按钮名称'
        },
        buttons_plugin_online: {
            ru: 'Онлайн',
            en: 'Online',
            zh: '在线'
        },
        buttons_plugin_save_close: {
            ru: 'СОХРАНИТЬ И ЗАКРЫТЬ',
            en: 'SAVE AND CLOSE',
            zh: '保存并关闭'
        },
        buttons_plugin_actions: {
            ru: 'Действия',
            en: 'Actions',
            zh: '操作'
        },
        buttons_plugin_folder_icon: {
            ru: 'Иконка папки',
            en: 'Folder icon',
            zh: '文件夹图标'
        },
        buttons_plugin_folder_color: {
            ru: 'Цвет папки',
            en: 'Folder color',
            zh: '文件夹颜色'
        },
        buttons_plugin_add_custom_svg: {
            ru: 'Добавить свою SVG',
            en: 'Add custom SVG',
            zh: '添加自定义 SVG'
        },
        buttons_plugin_import_icons_json: {
            ru: 'Импорт SVG JSON',
            en: 'Import SVG JSON',
            zh: '导入 SVG JSON'
        },
        buttons_plugin_export_icons_json: {
            ru: 'Экспорт SVG JSON',
            en: 'Export SVG JSON',
            zh: '导出 SVG JSON'
        },
        buttons_plugin_clear_my_icons: {
            ru: 'Очистить мои SVG',
            en: 'Clear my SVG',
            zh: '清除我的 SVG'
        },
        buttons_plugin_my_icons: {
            ru: 'Мои SVG',
            en: 'My SVG',
            zh: '我的 SVG'
        },
        buttons_plugin_svg_code: {
            ru: 'SVG код',
            en: 'SVG code',
            zh: 'SVG 代码'
        },
        buttons_plugin_invalid_svg: {
            ru: 'Некорректный SVG',
            en: 'Invalid SVG',
            zh: '无效 SVG'
        },
        buttons_plugin_import_failed: {
            ru: 'Некорректный JSON',
            en: 'Invalid JSON',
            zh: '无效 JSON'
        },
        buttons_plugin_imported_icons: {
            ru: 'Иконок импортировано',
            en: 'Icons imported',
            zh: '已导入图标'
        },
        buttons_plugin_no_my_icons: {
            ru: 'Нет пользовательских SVG',
            en: 'No custom SVG icons',
            zh: '没有自定义 SVG 图标'
        },
        buttons_plugin_icons_cleared: {
            ru: 'Мои SVG очищены',
            en: 'Custom SVG icons cleared',
            zh: '已清除自定义 SVG 图标'
        },
        buttons_plugin_editor_footer: {
            ru: '',
            en: ''
        }
    });

    var DEFAULT_GROUPS = [
        { name: 'online', patterns: ['online', 'lampac', 'modss', 'showy'] },
        { name: 'torrent', patterns: ['torrent'] },
        { name: 'trailer', patterns: ['trailer', 'rutube'] },
        { name: 'shots', patterns: ['shots'] },
        { name: 'book', patterns: ['book'] },
        { name: 'reaction', patterns: ['reaction'] },
        { name: 'subscribe', patterns: ['subscribe'] }
    ];

    // Фиксированная палитра для выбора цвета иконок
    var ICON_COLOR_PALETTE = [
        '#ef5350', '#f44336', '#e53935', '#d32f2f', '#ff9800', '#ff8f00', '#fb8c00', '#ef6c00', '#ffeb3b', '#fdd835',
        '#fbc02d', '#f57f17', '#66bb6a', '#4caf50', '#43a047', '#2e7d32', '#45a798', '#35b9cf', '#1cb4d0', '#16a5b8',
        '#0f8f9d', '#479add', '#2e91dd', '#2e86d2', '#256abc', '#7d55df', '#ab47bc', '#9c27b0', '#8e24aa', '#6d1fa6',
        '#e91e63', '#e91e63', '#db1a6f', '#b81468', '#e0e0e0', '#c9c9c9', '#000000'
    ];

    // Расширенная библиотека иконок для ручного выбора
    var ICON_LIBRARY = [
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="8,5 19,12 8,19"></polygon></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19"></polygon></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><polygon points="10,8 16,12 10,16"></polygon></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><polygon points="10,9 16,12 10,15"></polygon></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="16" rx="2"></rect><polygon points="10,9 16,12 10,15" fill="#111"></polygon></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18v10H3z"></path><path d="M8 19h8"></path><path d="M10 7v-2h4v2"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18v12H3z"></path><path d="M7 10h10"></path><path d="M7 14h6"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M7 9h10"></path><path d="M7 13h7"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16v12H4z"></path><path d="M9 9l6 3-6 3z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 7.5a2.5 2.5 0 0 0-1.8-1.8C17.6 5.2 12 5.2 12 5.2s-5.6 0-7.2.5A2.5 2.5 0 0 0 3 7.5 26 26 0 0 0 2.5 12a26 26 0 0 0 .5 4.5 2.5 2.5 0 0 0 1.8 1.8c1.6.5 7.2.5 7.2.5s5.6 0 7.2-.5a2.5 2.5 0 0 0 1.8-1.8 26 26 0 0 0 .5-4.5 26 26 0 0 0-.5-4.5z"></path><polygon points="10,9 16,12 10,15" fill="#111"></polygon></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="12" rx="3"></rect><polygon points="10,9 16,12 10,15" fill="#111"></polygon></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l10-5-10-5v10z"></path><path d="M3 3l18 18"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 3.8L18 8l-3 2.9.7 4.1L12 13l-3.7 2 .7-4.1L6 8l4.1-1.2z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l1-5.4L4.2 7.7l5.4-.8z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h12l1 16-7-4-7 4z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12l1 18-7-4-7 4z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 1 0-12 0v4l-2 3h16l-2-3z"></path><path d="M10 19a2 2 0 0 0 4 0"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8a6 6 0 1 0-12 0v4l-2 3h16l-2-3z"></path><circle cx="12" cy="19" r="2"></circle></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3h12l4 4v14H4z"></path><path d="M16 3v4h4"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M7 3v4M17 3v4M3 10h18"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16v12H4z"></path><path d="M8 7V3M16 7V3"></path><path d="M8 12h8M8 15h5"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 3"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 3" stroke="#111" stroke-width="2" fill="none"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="5" width="19" height="14" rx="2"></rect><text x="12" y="15" text-anchor="middle" font-size="8" fill="currentColor" stroke="none">HD</text></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="5" width="19" height="14" rx="2"></rect><text x="12" y="15" text-anchor="middle" font-size="7" fill="currentColor" stroke="none">4K</text></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="5" width="16" height="14" rx="2"></rect><path d="M2 9h2M2 12h2M2 15h2M20 9h2M20 12h2M20 15h2"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18v10H3z"></path><path d="M7 7v10M17 7v10"></path><path d="M10 10l4 2-4 2z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16v12H4z"></path><path d="M9 9l6 3-6 3z"></path><path d="M4 9h16"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h16v10H4z"></path><path d="M8 6h8"></path><path d="M9 12l5 2-5 2z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h16"></path><path d="M4 13h16"></path><path d="M4 17h16"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h10v10H7z"></path><path d="M4 4h3M17 4h3M4 20h3M17 20h3"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 3v3M12 18v3M3 12h3M18 12h3"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 7l6 5-6 5z"></path><path d="M3 3h18v18H3z" fill="none" stroke="currentColor" stroke-width="2"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 9l6 3-6 3z"></path><path d="M4 4h16v16H4z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 7h14v10H5z"></path><path d="M9 9l6 3-6 3z" fill="#111"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18v14H3z"></path><path d="M7 5v14M17 5v14"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h14v16H5z"></path><path d="M8 8h8M8 12h8M8 16h5"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h16l-2 10H6z"></path><path d="M9 9V6a3 3 0 0 1 6 0v3"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h12l2 4H4z"></path><path d="M4 8h16v12H4z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h12l2 4H4z"></path><path d="M4 8h16v12H4z"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12l3 5v13H3V8z"></path><path d="M9 12h6M9 16h6"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 6h14v12H5z"></path><path d="M5 10h14"></path><path d="M9 3v3M15 3v3"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 5h8v14H8z"></path><path d="M6 9h2M6 12h2M6 15h2M16 9h2M16 12h2M16 15h2"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h18"></path><path d="M3 14h18"></path><path d="M7 6v12M17 6v12"></path></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle><polygon points="10,8 16,12 10,16" fill="#111"></polygon></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10,8 16,12 10,16"></polygon><circle cx="12" cy="12" r="6"></circle></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v14H4z"></path><text x="12" y="15" text-anchor="middle" font-size="8" fill="currentColor" stroke="none">TV</text></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><text x="12" y="15" text-anchor="middle" font-size="8" fill="currentColor" stroke="none">U</text></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><text x="12" y="15" text-anchor="middle" font-size="8" fill="currentColor" stroke="none">T</text></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><text x="12" y="15" text-anchor="middle" font-size="8" fill="currentColor" stroke="none">N</text></svg>',
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M11 10L15 12L11 14V10Z" fill="currentColor"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4V10C7 12.7614 9.23858 15 12 15C14.7614 15 17 12.7614 17 10V4" stroke="currentColor" stroke-width="1.8"/><path d="M7 4H10V8H7V4ZM14 4H17V8H14V4Z" fill="currentColor"/><path d="M12 14V20" stroke="currentColor" stroke-width="1.8"/><path d="M9.5 17.5L12 20L14.5 17.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 7L7.2 3.8H11.2L7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 7L13.7 3.8H17.7L13.5 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 11L15 13.5L11 16V11Z" fill="currentColor"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4C5.9 4 5 4.9 5 6V20L12 16.8L19 20V6C19 4.9 18.1 4 17 4H7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.2 6.2C9.3 6.2 10.3 6.7 11 7.5C11.7 6.7 12.7 6.2 13.8 6.2C15.9 6.2 17.6 7.9 17.6 10C17.6 13.6 13.7 15.8 11 18C8.3 15.8 4.4 13.6 4.4 10C4.4 7.9 6.1 6.2 8.2 6.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M18 8H21M19.5 6.5V9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4C9.8 4 8 5.8 8 8V11.7C8 12.6 7.7 13.5 7.1 14.2L6 15.5H18L16.9 14.2C16.3 13.5 16 12.6 16 11.7V8C16 5.8 14.2 4 12 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10.5 18C10.8 18.9 11.3 19.4 12 19.4C12.7 19.4 13.2 18.9 13.5 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M19 4V7M17.5 5.5H20.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    ];

    var currentButtons = [];
    var allButtonsCache = [];
    var allButtonsOriginal = [];
    var currentContainer = null;

    function uniqueArray(values) {
        var result = [];
        var seen = {};
        (values || []).forEach(function(v) {
            var key = String(v);
            if (seen[key]) return;
            seen[key] = true;
            result.push(v);
        });
        return result;
    }

    // Вспомогательная функция поиска кнопки
    function findButton(btnId) {
        // Сначала берём актуальные кнопки текущего экрана, затем fallback на клон-оригиналы.
        // Это критично для папок: иначе может запускаться callback от предыдущего тайтла.
        var btn = allButtonsCache.find(function(b) { return getBtnIdentifier(b) === btnId; });
        if (!btn) {
            btn = allButtonsOriginal.find(function(b) { return getBtnIdentifier(b) === btnId; });
        }
        return btn;
    }

    // Вспомогательная функция получения всех ID кнопок в папках
    function getButtonsInFolders() {
        var folders = getFolders();
        var buttonsInFolders = [];
        folders.forEach(function(folder) {
            buttonsInFolders = buttonsInFolders.concat(folder.buttons);
        });
        return buttonsInFolders;
    }

    function getCustomOrder() {
        var order = Lampa.Storage.get('button_custom_order', []);
        if (!Array.isArray(order)) return [];
        var clean = uniqueArray(order);
        if (clean.length !== order.length) setCustomOrder(clean);
        return clean;
    }

    function setCustomOrder(order) {
        Lampa.Storage.set('button_custom_order', order);
    }

    function getItemOrder() {
        var order = Lampa.Storage.get('button_item_order', []);
        if (!Array.isArray(order)) return [];
        var clean = [];
        var seen = {};
        order.forEach(function(item) {
            if (!item || !item.type || !item.id) return;
            var key = item.type + ':' + item.id;
            if (seen[key]) return;
            seen[key] = true;
            clean.push(item);
        });
        if (clean.length !== order.length) setItemOrder(clean);
        return clean;
    }

    function setItemOrder(order) {
        Lampa.Storage.set('button_item_order', order);
    }

    function getHiddenButtons() {
        var hidden = Lampa.Storage.get('button_hidden', []);
        if (!Array.isArray(hidden)) return [];
        var clean = uniqueArray(hidden);
        if (clean.length !== hidden.length) setHiddenButtons(clean);
        return clean;
    }

    function setHiddenButtons(hidden) {
        Lampa.Storage.set('button_hidden', hidden);
    }

    function getButtonDisplayModes() {
        return Lampa.Storage.get('button_display_modes', {});
    }

    function setButtonDisplayModes(modes) {
        Lampa.Storage.set('button_display_modes', modes);
    }

    function getButtonDisplayMode(btnId) {
        var modes = getButtonDisplayModes();
        return modes[btnId] || 1; // По умолчанию режим 1 (стандартный)
    }

    function setButtonDisplayMode(btnId, mode) {
        var modes = getButtonDisplayModes();
        modes[btnId] = mode;
        setButtonDisplayModes(modes);
    }

    function getButtonCustomNames() {
        return Lampa.Storage.get('button_custom_names', {});
    }

    function setButtonCustomNames(names) {
        Lampa.Storage.set('button_custom_names', names || {});
    }

    function getButtonCustomName(btnId) {
        var names = getButtonCustomNames();
        return names && typeof names[btnId] === 'string' ? names[btnId] : '';
    }

    function setButtonCustomName(btnId, value) {
        var names = getButtonCustomNames();
        if (value) names[btnId] = value;
        else delete names[btnId];
        setButtonCustomNames(names);
    }

    function getButtonCustomIcons() {
        return Lampa.Storage.get('button_custom_icons', {});
    }

    function setButtonCustomIcons(icons) {
        Lampa.Storage.set('button_custom_icons', icons || {});
    }

    function getButtonDefaultIcons() {
        return Lampa.Storage.get('button_default_icons', {});
    }

    function setButtonDefaultIcons(icons) {
        Lampa.Storage.set('button_default_icons', icons || {});
    }

    function getUserIconLibrary() {
        var icons = Lampa.Storage.get('button_user_icons', []);
        if (!Array.isArray(icons)) icons = [];
        var clean = [];
        var seen = {};
        var changed = false;

        icons.forEach(function(svgHtml) {
            var sanitized = sanitizeUserSvgMarkup(svgHtml);
            var normalized = normalizeSvgMarkup(sanitized);
            if (!normalized) {
                changed = true;
                return;
            }
            if (seen[normalized]) {
                changed = true;
                return;
            }
            seen[normalized] = true;
            clean.push(sanitized);
            if (sanitized !== svgHtml) changed = true;
        });

        if (changed || clean.length !== icons.length) {
            Lampa.Storage.set('button_user_icons', clean);
        }

        return clean;
    }

    function setUserIconLibrary(icons) {
        Lampa.Storage.set('button_user_icons', Array.isArray(icons) ? icons : []);
    }

    function addUserIconToLibrary(svgHtml) {
        var sanitized = sanitizeUserSvgMarkup(svgHtml);
        if (!sanitized) return '';

        var icons = getUserIconLibrary();
        var normalized = normalizeSvgMarkup(sanitized);
        var exists = icons.some(function(icon) {
            return normalizeSvgMarkup(icon) === normalized;
        });
        if (!exists) {
            icons.push(sanitized);
            setUserIconLibrary(icons);
        }

        return sanitized;
    }

    function importUserIconsFromJson(rawJson) {
        var text = String(rawJson || '').trim();
        if (!text) return { ok: false, added: 0, total: 0 };

        var parsed;
        try {
            parsed = JSON.parse(text);
        } catch(e) {
            return { ok: false, added: 0, total: 0 };
        }

        var list = [];
        if (Array.isArray(parsed)) {
            list = parsed;
        } else if (parsed && Array.isArray(parsed.icons)) {
            list = parsed.icons;
        } else {
            return { ok: false, added: 0, total: 0 };
        }

        var merged = getUserIconLibrary().slice();
        var seen = {};
        merged.forEach(function(icon) {
            seen[normalizeSvgMarkup(icon)] = true;
        });

        var total = 0;
        var added = 0;
        list.forEach(function(item) {
            total++;
            var sanitized = sanitizeUserSvgMarkup(item);
            var normalized = normalizeSvgMarkup(sanitized);
            if (!normalized || seen[normalized]) return;
            seen[normalized] = true;
            merged.push(sanitized);
            added++;
        });

        if (added > 0) setUserIconLibrary(merged);
        return { ok: true, added: added, total: total };
    }

    function exportUserIconsToJson() {
        return JSON.stringify({
            version: 1,
            icons: getUserIconLibrary()
        }, null, 2);
    }

    function getButtonGlobalIconColor() {
        var value = Lampa.Storage.get('button_icon_color_global', '');
        var normalized = normalizeHexColor(value);
        if (value && !normalized) {
            Lampa.Storage.set('button_icon_color_global', '');
            return '';
        }
        return normalized || '';
    }

    function setButtonGlobalIconColor(color) {
        Lampa.Storage.set('button_icon_color_global', color || '');
    }

    function getButtonIconColors() {
        var colors = Lampa.Storage.get('button_icon_colors', {});
        if (!colors || typeof colors !== 'object') return {};
        var clean = {};
        var changed = false;
        for (var key in colors) {
            if (!colors.hasOwnProperty(key)) continue;
            var normalized = normalizeHexColor(colors[key]);
            if (!normalized) {
                changed = true;
                continue;
            }
            clean[key] = normalized;
            if (colors[key] !== normalized) changed = true;
        }
        if (changed) Lampa.Storage.set('button_icon_colors', clean);
        return clean;
    }

    function setButtonIconColors(colors) {
        Lampa.Storage.set('button_icon_colors', colors || {});
    }

    function getFolders() {
        return Lampa.Storage.get('button_folders', []);
    }

    function setFolders(folders) {
        Lampa.Storage.set('button_folders', folders);
    }

    function getFolderCustomIcons() {
        return Lampa.Storage.get('button_folder_custom_icons', {});
    }

    function setFolderCustomIcons(icons) {
        Lampa.Storage.set('button_folder_custom_icons', icons || {});
    }

    function getFolderIconColors() {
        var colors = Lampa.Storage.get('button_folder_icon_colors', {});
        if (!colors || typeof colors !== 'object') return {};
        return colors;
    }

    function setFolderIconColors(colors) {
        Lampa.Storage.set('button_folder_icon_colors', colors || {});
    }

    function hasClassToken(classes, token) {
        var re = new RegExp('(^|\\s)' + token + '(?:--button)?(\\s|$)', 'i');
        return re.test(classes || '');
    }

    function hasWordToken(text, token) {
        var re = new RegExp('(^|\\b)' + token + '(\\b|$)', 'i');
        return re.test(text || '');
    }

    function getBtnIdentifier(button) {
        var cached = button && button.attr ? button.attr('data-btn-id') : '';
        if (cached) return cached;

        var classes = button.attr('class') || '';
        var rawText = button.attr('data-original-text') || '';
        if (!rawText) {
            rawText = button.find('span').first().text().trim();
            if (rawText) button.attr('data-original-text', rawText);
        }
        var text = String(rawText || '').replace(/\s+/g, '_');
        var subtitle = button.attr('data-subtitle') || '';
        var action = button.attr('data-action') || '';
        var href = button.attr('href') || '';
        var onclick = button.attr('onclick') || '';

        if (hasClassToken(classes, 'modss') || hasWordToken(rawText, 'modss') || hasWordToken(rawText, 'mods')) {
            return 'modss_online_button';
        }

        if (hasClassToken(classes, 'showy') || hasWordToken(rawText, 'showy')) {
            return 'showy_online_button';
        }

        var viewClasses = classes.split(' ').filter(function(c) {
            if (c === 'selector' || c === 'focus' || c === 'hidden') return false;
            if (c.indexOf('button-mode-') === 0) return false;
            return c.indexOf('view--') === 0 || c.indexOf('button--') === 0;
        }).join('_');

        if (!viewClasses && !text && !action && !href && !onclick) {
            button.attr('data-btn-id', 'button_unknown');
            return 'button_unknown';
        }

        var stableTail = action || href || onclick || text || 'unknown';
        var id = (viewClasses || 'button') + '_' + stableTail;

        if (subtitle) {
            id = id + '_' + subtitle.replace(/\s+/g, '_').substring(0, 30);
        }

        id = id.toLowerCase().replace(/[^\w\-]+/g, '_');
        button.attr('data-btn-id', id);
        return id;
    }

    function detectBtnCategory(button) {
        var classes = button.attr('class') || '';

        // Специальная проверка для Shots выполняется первой
        if (classes.indexOf('shots-view-button') !== -1 || classes.indexOf('shots') !== -1) {
            return 'shots';
        }

        for (var i = 0; i < DEFAULT_GROUPS.length; i++) {
            var group = DEFAULT_GROUPS[i];
            for (var j = 0; j < group.patterns.length; j++) {
                if (classes.indexOf(group.patterns[j]) !== -1) {
                    return group.name;
                }
            }
        }

        return 'other';
    }

    function shouldSkipBtn(button) {
        var classes = button.attr('class') || '';
        for (var i = 0; i < EXCLUDED_CLASSES.length; i++) {
            if (classes.indexOf(EXCLUDED_CLASSES[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function groupBtnsByType(container) {
        var allButtons = container.find('.full-start__button').not('.button--edit-order, .button--folder, .button--play');

        var categories = {
            online: [],
            torrent: [],
            trailer: [],
            shots: [],
            book: [],
            reaction: [],
            subscribe: [],
            other: []
        };

        allButtons.each(function() {
            var $btn = $(this);

            // Пропускаем кнопки из .person-start__bottom (info, subscribe)
            if ($btn.closest('.person-start__bottom').length) {
                return;
            }

            if (shouldSkipBtn($btn)) return;

            var type = detectBtnCategory($btn);

            if (type === 'online' && $btn.hasClass('lampac--button') && !$btn.hasClass('modss--button') && !$btn.hasClass('showy--button')) {
                var svgElement = $btn.find('svg').first();
                if (svgElement.length && !svgElement.hasClass('modss-online-icon')) {
                    svgElement.replaceWith(LAMPAC_ICON);
                }
            }

            if (categories[type]) {
                categories[type].push($btn);
            } else {
                categories.other.push($btn);
            }
        });

        return categories;
    }

    function arrangeBtnsByOrder(buttons) {
        var customOrder = getCustomOrder();

        var priority = [];
        var regular = [];

        buttons.forEach(function(btn) {
            var id = getBtnIdentifier(btn);
            if (id === 'modss_online_button' || id === 'showy_online_button') {
                priority.push(btn);
            } else {
                regular.push(btn);
            }
        });

        priority.sort(function(a, b) {
            var idA = getBtnIdentifier(a);
            var idB = getBtnIdentifier(b);
            if (idA === 'modss_online_button') return -1;
            if (idB === 'modss_online_button') return 1;
            if (idA === 'showy_online_button') return -1;
            if (idB === 'showy_online_button') return 1;
            return 0;
        });

        if (!customOrder.length) {
            regular.sort(function(a, b) {
                var typeOrder = ['online', 'torrent', 'trailer', 'shots', 'book', 'reaction', 'subscribe', 'other'];
                var typeA = detectBtnCategory(a);
                var typeB = detectBtnCategory(b);
                var indexA = typeOrder.indexOf(typeA);
                var indexB = typeOrder.indexOf(typeB);
                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;
                return indexA - indexB;
            });
            return priority.concat(regular);
        }

        var sorted = [];
        var remaining = regular.slice();

        customOrder.forEach(function(id) {
            for (var i = 0; i < remaining.length; i++) {
                if (getBtnIdentifier(remaining[i]) === id) {
                    sorted.push(remaining[i]);
                    remaining.splice(i, 1);
                    break;
                }
            }
        });

        return priority.concat(sorted).concat(remaining);
    }

    function getOnlineDedupeKey(btn) {
        var classes = (btn.attr('class') || '')
            .split(/\s+/)
            .filter(function(c) {
                return c &&
                    c !== 'selector' &&
                    c !== 'focus' &&
                    c !== 'hover' &&
                    c !== 'active' &&
                    c !== 'hidden' &&
                    c.indexOf('button-mode-') !== 0;
            })
            .sort()
            .join('.');
        var provider = getOnlineProviderToken(btn);
        var subtitle = (btn.attr('data-subtitle') || '').toLowerCase().replace(/\s+/g, ' ').trim();
        var action = (btn.attr('data-action') || '').toLowerCase().trim();
        var href = (btn.attr('href') || '').toLowerCase().trim();
        var onclick = (btn.attr('onclick') || '').toLowerCase().trim();
        var icon = getBtnIconSignature(btn);
        // Важно: ключ не зависит от текста названия кнопки
        return [provider, classes, subtitle, action, href, onclick, icon].join('|');
    }

    function getOnlineProviderToken(btn) {
        var classes = (btn.attr('class') || '').toLowerCase();
        var text = (btn.find('span').text() || '').toLowerCase();

        if (classes.indexOf('modss') !== -1 || text.indexOf('modss') !== -1) return 'modss';
        if (classes.indexOf('showy') !== -1 || text.indexOf('showy') !== -1) return 'showy';
        if (classes.indexOf('lampac') !== -1 || text.indexOf('lampac') !== -1) return 'lampac';
        return 'generic';
    }

    function getBtnIconSignature(btn) {
        var svg = btn.find('svg').first();
        if (!svg.length) return 'no_svg';
        var html = (svg.prop('outerHTML') || '').replace(/\s+/g, ' ').trim();
        if (!html) return 'no_svg';
        return 'svg:' + html.length + ':' + html.substring(0, 120);
    }

    function getOnlineSoftDedupeKey(btn) {
        var subtitle = (btn.attr('data-subtitle') || '').toLowerCase().replace(/\s+/g, ' ').trim();
        var action = (btn.attr('data-action') || '').toLowerCase().trim();
        var href = (btn.attr('href') || '').toLowerCase().trim();
        var onclick = (btn.attr('onclick') || '').toLowerCase().trim();
        var provider = getOnlineProviderToken(btn);
        var icon = getBtnIconSignature(btn);
        return [provider, subtitle, action, href, onclick, icon].join('|');
    }

    function dedupeOnlineButtons(buttons) {
        var seenKeys = {};
        var seenSoftKeys = {};
        var result = [];

        buttons.forEach(function(btn) {
            var id = getBtnIdentifier(btn);
            var type = detectBtnCategory(btn);

            // Удаляем только полные дублирующиеся онлайн-кнопки по стабильной подписи
            if (type === 'online' && id !== 'button_unknown') {
                var dedupeKey = getOnlineDedupeKey(btn);
                if (seenKeys[dedupeKey]) return;
                seenKeys[dedupeKey] = true;

                // Дополнительная защита от технических дублей одного онлайн-источника.
                // В generic-случае без data-action/href не объединяем, чтобы не потерять разные плагины
                // с одинаковым названием.
                var provider = getOnlineProviderToken(btn);
                var action = (btn.attr('data-action') || '').toLowerCase().trim();
                var href = (btn.attr('href') || '').toLowerCase().trim();
                var canSoftDedupe = provider !== 'generic' || !!action || !!href;

                if (canSoftDedupe) {
                    var softKey = getOnlineSoftDedupeKey(btn);
                    if (seenSoftKeys[softKey]) return;
                    seenSoftKeys[softKey] = true;
                }
            }

            result.push(btn);
        });

        return result;
    }

    function collectOrderedButtons(container) {
        // Единая точка подготовки набора кнопок:
        // группировка -> сортировка -> дедупликация дублей онлайн-кнопок
        var categories = groupBtnsByType(container);
        var allButtons = []
            .concat(categories.online)
            .concat(categories.torrent)
            .concat(categories.trailer)
            .concat(categories.shots)
            .concat(categories.book)
            .concat(categories.reaction)
            .concat(categories.subscribe)
            .concat(categories.other);

        allButtons = arrangeBtnsByOrder(allButtons);
        allButtons = dedupeOnlineButtons(allButtons);
        allButtonsCache = allButtons;
        return allButtons;
    }

    function applyBtnVisibility(buttons) {
        var hidden = getHiddenButtons();
        buttons.forEach(function(btn) {
            var id = getBtnIdentifier(btn);
            if (hidden.indexOf(id) !== -1) {
                btn.addClass('hidden');
            } else {
                btn.removeClass('hidden');
            }
        });
    }

    function applyButtonDisplayModes(buttons) {
        buttons.forEach(function(btn) {
            var id = getBtnIdentifier(btn);
            var mode = getButtonDisplayMode(id);

            // Удаляем все классы режимов
            btn.removeClass('button-mode-1 button-mode-2 button-mode-3');

            // Добавляем класс текущего режима
            btn.addClass('button-mode-' + mode);

            // Универсальная обработка кнопок с нестандартной структурой:
            // проверяем, есть ли текстовые ноды или span вне SVG.
            var hasTextContent = false;
            btn.contents().each(function() {
                if ((this.nodeType === 3 && this.nodeValue.trim()) ||
                    (this.nodeName === 'SPAN' && !$(this).parent().is('svg') && !$(this).hasClass('text-wrapper'))) {
                    hasTextContent = true;
                    return false; // break
                }
            });

            if (hasTextContent) {
                // Сначала разворачиваем ранее обёрнутые текстовые ноды
                btn.find('.text-wrapper').each(function() {
                    $(this).replaceWith($(this).contents());
                });

                // Получаем все текстовые ноды и span-элементы (вне SVG и служебных классов)
                var nodesToWrap = [];
                btn.contents().each(function() {
                    if (this.nodeType === 3 && this.nodeValue.trim()) { // Text node
                        nodesToWrap.push(this);
                    } else if (this.nodeName === 'SPAN' &&
                               !$(this).parent().is('svg') &&
                               !$(this).hasClass('text-wrapper') &&
                               !$(this).hasClass('shots-view-button__title') &&
                               !$(this).hasClass('shots-view-button__count')) {
                        // Для span-элемента добавляем класс вместо обёртки
                        $(this).addClass('text-wrapper');
                    }
                });

                // Оборачиваем только текстовые ноды в .text-wrapper
                nodesToWrap.forEach(function(node) {
                    $(node).wrap('<span class="text-wrapper"></span>');
                });
            }
        });
    }

    function normalizeSvgMarkup(svgHtml) {
        return String(svgHtml || '').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
    }

    function sanitizeSvgMarkup(svgHtml) {
        if (!svgHtml) return '';
        var root = $(svgHtml).first();
        if (!root || !root.length) return '';
        root.removeAttr('style');
        root.removeAttr('data-custom-color');
        root.find('*').each(function() {
            this.removeAttribute('style');
            this.removeAttribute('data-custom-color');
        });
        return root.prop('outerHTML');
    }

    function sanitizeUserSvgMarkup(svgHtml) {
        var raw = String(svgHtml || '').trim();
        if (!raw) return '';

        var root = $(raw).first();
        if (!root || !root.length) return '';

        if ((root.prop('tagName') || '').toLowerCase() !== 'svg') {
            var found = root.find('svg').first();
            if (!found || !found.length) return '';
            root = found;
        }

        root = root.clone();

        root.find('script,foreignObject,iframe,object,embed,meta,link,style').remove();

        var allNodes = root.find('*');
        allNodes = allNodes.add(root);
        allNodes.each(function() {
            var attrs = this.attributes;
            if (!attrs) return;

            for (var i = attrs.length - 1; i >= 0; i--) {
                var name = attrs[i].name;
                var value = attrs[i].value || '';
                var lowerName = name.toLowerCase();
                var lowerValue = String(value).toLowerCase().trim();

                if (lowerName.indexOf('on') === 0) {
                    this.removeAttribute(name);
                    continue;
                }

                if (lowerName === 'href' || lowerName === 'xlink:href') {
                    if (lowerValue.indexOf('javascript:') === 0 || lowerValue.indexOf('data:') === 0 || lowerValue.indexOf('http://') === 0 || lowerValue.indexOf('https://') === 0) {
                        this.removeAttribute(name);
                        continue;
                    }
                }
            }
        });

        return sanitizeSvgMarkup(root.prop('outerHTML'));
    }

    function normalizeButtonTextWrappers(btn) {
        if (!btn || !btn.length) return;

        btn.find('.text-wrapper').each(function() {
            $(this).replaceWith($(this).contents());
        });

        var nodesToWrap = [];
        btn.contents().each(function() {
            if (this.nodeType === 3 && this.nodeValue && this.nodeValue.trim()) {
                nodesToWrap.push(this);
            } else if (this.nodeName === 'SPAN' &&
                       !$(this).parent().is('svg') &&
                       !$(this).hasClass('text-wrapper') &&
                       !$(this).hasClass('shots-view-button__title') &&
                       !$(this).hasClass('shots-view-button__count')) {
                $(this).addClass('text-wrapper');
            }
        });

        nodesToWrap.forEach(function(node) {
            $(node).wrap('<span class="text-wrapper"></span>');
        });
    }

    function setButtonVisibleText(btn, text) {
        if (!btn || !btn.length) return;
        normalizeButtonTextWrappers(btn);

        var wrappers = btn.find('.text-wrapper');
        if (wrappers.length) {
            wrappers.first().text(text);
            wrappers.slice(1).remove();
            return;
        }

        var textSpan = btn.find('span').filter(function() {
            var $s = $(this);
            return !$s.parent().is('svg') &&
                   !$s.hasClass('shots-view-button__title') &&
                   !$s.hasClass('shots-view-button__count');
        }).first();

        if (textSpan.length) {
            textSpan.text(text);
            return;
        }

        btn.append('<span class="text-wrapper">' + text + '</span>');
    }

    function applyCustomButtonNames(buttons) {
        var names = getButtonCustomNames();
        buttons.forEach(function(btn) {
            var btnId = getBtnIdentifier(btn);
            var customName = names[btnId];
            if (!customName) return;
            setButtonVisibleText(btn, customName);
        });
    }

    function applyCustomButtonIcons(buttons) {
        var customIcons = getButtonCustomIcons();
        var defaultIcons = getButtonDefaultIcons();
        var defaultsUpdated = false;
        var customUpdated = false;

        buttons.forEach(function(btn) {
            var btnId = getBtnIdentifier(btn);
            var firstSvg = btn.find('svg').first();

            if (firstSvg.length && !defaultIcons[btnId]) {
                defaultIcons[btnId] = sanitizeSvgMarkup(firstSvg.prop('outerHTML'));
                defaultsUpdated = true;
            }

            if (customIcons[btnId]) {
                var cleanedCustom = sanitizeSvgMarkup(customIcons[btnId]);
                if (cleanedCustom !== customIcons[btnId]) {
                    customIcons[btnId] = cleanedCustom;
                    customUpdated = true;
                }
                var customSvg = $(cleanedCustom);
                if (firstSvg.length) firstSvg.replaceWith(customSvg);
                else btn.prepend(customSvg);
                return;
            }

            if (!defaultIcons[btnId]) return;

            var cleanedDefault = sanitizeSvgMarkup(defaultIcons[btnId]);
            if (cleanedDefault !== defaultIcons[btnId]) {
                defaultIcons[btnId] = cleanedDefault;
                defaultsUpdated = true;
            }

            var currentSvg = btn.find('svg').first();
            var currentHtml = currentSvg.length ? currentSvg.prop('outerHTML') : '';
            if (normalizeSvgMarkup(currentHtml) !== normalizeSvgMarkup(cleanedDefault)) {
                var defaultSvg = $(cleanedDefault);
                if (currentSvg.length) currentSvg.replaceWith(defaultSvg);
                else btn.prepend(defaultSvg);
            }
        });

        if (defaultsUpdated) {
            setButtonDefaultIcons(defaultIcons);
        }
        if (customUpdated) {
            setButtonCustomIcons(customIcons);
        }
    }

    function applyButtonIconColors(buttons) {
        var globalColor = getButtonGlobalIconColor();
        var perButtonColors = getButtonIconColors();

        buttons.forEach(function(btn) {
            var btnId = getBtnIdentifier(btn);
            var color = perButtonColors[btnId] || globalColor || '';
            var svg = btn.find('svg').first();
            if (!svg.length) return;

            if (color) {
                svg.css('color', color);
                svg.attr('data-custom-color', color);
            } else {
                svg.css('color', '');
                svg.removeAttr('style');
                svg.removeAttr('data-custom-color');
            }
        });
    }

    function animateBtnFadeIn(buttons) {
        buttons.forEach(function(btn, index) {
            btn.css({
                'opacity': '0',
                'animation': 'button-fade-in 0.4s ease forwards',
                'animation-delay': (index * 0.08) + 's'
            });
        });
    }

    function buildEditorBtn() {
        var btn = $('<div class="full-start__button selector button--edit-order" style="order: 9999;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 29" fill="none"><use xlink:href="#sprite-edit"></use></svg>' +
            '</div>');

        btn.on('hover:enter', function() {
            openEditDialog();
        });

        // Проверяем настройки и скрываем кнопку, если редактор выключен
        if (Lampa.Storage.get('buttons_editor_enabled') === false) {
            btn.hide();
        }

        return btn;
    }

    function saveOrder() {
        var order = [];
        currentButtons.forEach(function(btn) {
            order.push(getBtnIdentifier(btn));
        });
        setCustomOrder(order);
    }

    function saveItemOrder() {
        var order = [];
        var items = $('.menu-edit-list .menu-edit-list__item').not('.menu-edit-list__create-folder');

        items.each(function() {
            var $item = $(this);
            var itemType = $item.data('itemType');

            if (itemType === 'folder') {
                order.push({
                    type: 'folder',
                    id: $item.data('folderId')
                });
            } else if (itemType === 'button') {
                order.push({
                    type: 'button',
                    id: $item.data('buttonId')
                });
            }
        });

        setItemOrder(order);
    }

    function applyChanges() {
        if (!currentContainer) return;

        var allButtons = collectOrderedButtons(currentContainer);

        var folders = getFolders();
        var foldersUpdated = false;

        folders.forEach(function(folder) {
            var updatedButtons = [];
            var usedButtons = [];

            folder.buttons.forEach(function(oldBtnId) {
                var found = false;

                for (var i = 0; i < allButtons.length; i++) {
                    var btn = allButtons[i];
                    var newBtnId = getBtnIdentifier(btn);

                    if (usedButtons.indexOf(newBtnId) !== -1) continue;

                    if (newBtnId === oldBtnId) {
                        updatedButtons.push(newBtnId);
                        usedButtons.push(newBtnId);
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    for (var i = 0; i < allButtons.length; i++) {
                        var btn = allButtons[i];
                        var newBtnId = getBtnIdentifier(btn);

                        if (usedButtons.indexOf(newBtnId) !== -1) continue;

                        var text = btn.find('span').text().trim();
                        var classes = btn.attr('class') || '';

                        if ((oldBtnId.indexOf('modss') !== -1 || oldBtnId.indexOf('MODS') !== -1) &&
                            (classes.indexOf('modss') !== -1 || text.indexOf('MODS') !== -1)) {
                            updatedButtons.push(newBtnId);
                            usedButtons.push(newBtnId);
                            found = true;
                            break;
                        } else if ((oldBtnId.indexOf('showy') !== -1 || oldBtnId.indexOf('Showy') !== -1) &&
                                   (classes.indexOf('showy') !== -1 || text.indexOf('Showy') !== -1)) {
                            updatedButtons.push(newBtnId);
                            usedButtons.push(newBtnId);
                            found = true;
                            break;
                        }
                    }
                }
            });

            if (updatedButtons.length !== folder.buttons.length ||
                updatedButtons.some(function(id, i) { return id !== folder.buttons[i]; })) {
                folder.buttons = updatedButtons;
                foldersUpdated = true;
            }
        });

        if (foldersUpdated) {
            setFolders(folders);
        }

        // Оптимизация: формируем buttonsInFolders один раз
        var buttonsInFolders = [];
        folders.forEach(function(folder) {
            buttonsInFolders = buttonsInFolders.concat(folder.buttons);
        });

        var filteredButtons = allButtons.filter(function(btn) {
            return buttonsInFolders.indexOf(getBtnIdentifier(btn)) === -1;
        });

        currentButtons = filteredButtons;
        applyBtnVisibility(filteredButtons);
        applyButtonDisplayModes(filteredButtons);
        applyCustomButtonNames(filteredButtons);
        applyCustomButtonIcons(allButtons);
        applyButtonIconColors(allButtons);

        var targetContainer = currentContainer.find('.full-start-new__buttons');
        if (!targetContainer.length) return;

        targetContainer.find('.full-start__button').not('.button--edit-order').detach();

        var itemOrder = getItemOrder();
        var visibleButtons = [];

        if (itemOrder.length > 0) {
            var addedFolders = [];
            var addedButtons = [];

            itemOrder.forEach(function(item) {
                if (item.type === 'folder') {
                    var folder = folders.find(function(f) { return f.id === item.id; });
                    if (folder) {
                        var folderBtn = createFolderButton(folder);
                        targetContainer.append(folderBtn);
                        visibleButtons.push(folderBtn);
                        addedFolders.push(folder.id);
                    }
                } else if (item.type === 'button') {
                    var btnId = item.id;
                    if (buttonsInFolders.indexOf(btnId) === -1) {
                        var btn = currentButtons.find(function(b) { return getBtnIdentifier(b) === btnId; });
                        if (btn && !btn.hasClass('hidden')) {
                            targetContainer.append(btn);
                            visibleButtons.push(btn);
                            addedButtons.push(btnId);
                        }
                    }
                }
            });

            currentButtons.forEach(function(btn) {
                var btnId = getBtnIdentifier(btn);
                if (addedButtons.indexOf(btnId) === -1 && !btn.hasClass('hidden') && buttonsInFolders.indexOf(btnId) === -1) {
                    var insertBefore = null;
                    var btnType = detectBtnCategory(btn);
                    var typeOrder = ['online', 'torrent', 'trailer', 'shots', 'book', 'reaction', 'subscribe', 'other'];
                    var btnTypeIndex = typeOrder.indexOf(btnType);
                    if (btnTypeIndex === -1) btnTypeIndex = 999;

                    if (btnId === 'modss_online_button' || btnId === 'showy_online_button') {
                        var firstNonPriority = targetContainer.find('.full-start__button').not('.button--edit-order, .button--folder').filter(function() {
                            var id = getBtnIdentifier($(this));
                            return id !== 'modss_online_button' && id !== 'showy_online_button';
                        }).first();

                        if (firstNonPriority.length) {
                            insertBefore = firstNonPriority;
                        }

                        if (btnId === 'showy_online_button') {
                            var modsBtn = targetContainer.find('.full-start__button').filter(function() {
                                return getBtnIdentifier($(this)) === 'modss_online_button';
                            });
                            if (modsBtn.length) {
                                insertBefore = modsBtn.next();
                                if (!insertBefore.length || insertBefore.hasClass('button--edit-order')) {
                                    insertBefore = null;
                                }
                            }
                        }
                    } else {
                        targetContainer.find('.full-start__button').not('.button--edit-order, .button--folder').each(function() {
                            var existingBtn = $(this);
                            var existingId = getBtnIdentifier(existingBtn);

                            if (existingId === 'modss_online_button' || existingId === 'showy_online_button') {
                                return true;
                            }

                            var existingType = detectBtnCategory(existingBtn);
                            var existingTypeIndex = typeOrder.indexOf(existingType);
                            if (existingTypeIndex === -1) existingTypeIndex = 999;

                            if (btnTypeIndex < existingTypeIndex) {
                                insertBefore = existingBtn;
                                return false;
                            }
                        });
                    }

                    if (insertBefore && insertBefore.length) {
                        btn.insertBefore(insertBefore);
                    } else {
                        var editBtn = targetContainer.find('.button--edit-order');
                        if (editBtn.length) {
                            btn.insertBefore(editBtn);
                        } else {
                            targetContainer.append(btn);
                        }
                    }
                    visibleButtons.push(btn);
                }
            });

            folders.forEach(function(folder) {
                if (addedFolders.indexOf(folder.id) === -1) {
                    var folderBtn = createFolderButton(folder);
                    targetContainer.append(folderBtn);
                    visibleButtons.push(folderBtn);
                }
            });
        } else {
            currentButtons.forEach(function(btn) {
                var btnId = getBtnIdentifier(btn);
                if (!btn.hasClass('hidden') && buttonsInFolders.indexOf(btnId) === -1) {
                    targetContainer.append(btn);
                    visibleButtons.push(btn);
                }
            });

            folders.forEach(function(folder) {
                var folderBtn = createFolderButton(folder);
                targetContainer.append(folderBtn);
                visibleButtons.push(folderBtn);
            });
        }

        animateBtnFadeIn(visibleButtons);

        var editBtn = targetContainer.find('.button--edit-order');
        if (editBtn.length) {
            editBtn.detach();
            targetContainer.append(editBtn);
        }

        saveOrder();

        setTimeout(function() {
            if (currentContainer) {
                setupButtonNavigation(currentContainer);
            }
        }, 100);
    }

    function capitalizeText(str) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getBtnDisplayText(btn, allButtons) {
        var btnId = getBtnIdentifier(btn);
        var customName = getButtonCustomName(btnId);
        if (customName) {
            return customName;
        }

        var text = btn.find('span').text().trim();
        var classes = btn.attr('class') || '';
        var subtitle = btn.attr('data-subtitle') || '';

        if (!text) {
            var viewClass = classes.split(' ').find(function(c) {
                return c.indexOf('view--') === 0 || c.indexOf('button--') === 0;
            });
            if (viewClass) {
                text = viewClass.replace('view--', '').replace('button--', '').replace(/_/g, ' ');
                text = capitalizeText(text);
            } else {
                text = getTranslation('buttons_plugin_button_unknown');
            }
            return text;
        }

        var sameTextCount = 0;
        allButtons.forEach(function(otherBtn) {
            if (otherBtn.find('span').text().trim() === text) {
                sameTextCount++;
            }
        });

        if (sameTextCount > 1) {
            if (subtitle) {
                return text + ' <span style="opacity:0.5">(' + subtitle.substring(0, 30) + ')</span>';
            }

            var viewClass = classes.split(' ').find(function(c) {
                return c.indexOf('view--') === 0;
            });
            if (viewClass) {
                var identifier = viewClass.replace('view--', '').replace(/_/g, ' ');
                identifier = capitalizeText(identifier);
                return text + ' <span style="opacity:0.5">(' + identifier + ')</span>';
            }
        }

        return text;
    }

    function createFolderButton(folder) {
        var folderCustomIcons = getFolderCustomIcons();
        var folderIconColors = getFolderIconColors();

        var icon;
        if (folderCustomIcons[folder.id]) {
            icon = folderCustomIcons[folder.id];
        } else {
            var firstBtnId = folder.buttons[0];
            var firstBtn = findButton(firstBtnId);
            icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
                '</svg>';

            if (firstBtn) {
                var _cfbCustIcons = getButtonCustomIcons();
                if (_cfbCustIcons[firstBtnId]) {
                    icon = _cfbCustIcons[firstBtnId];
                } else {
                    var btnIcon = firstBtn.find('svg').first();
                    if (btnIcon.length) {
                        icon = btnIcon.prop('outerHTML');
                    }
                }
            }
        }

        var btn = $('<div class="full-start__button selector button--folder" data-folder-id="' + folder.id + '">' +
            icon +
            '<span>' + folder.name + '</span>' +
        '</div>');

        var folderColor = folderIconColors[folder.id] || '';
        if (folderColor) {
            btn.find('svg').first().css('color', folderColor);
        }

        btn.on('hover:enter', function() {
            openFolderMenu(folder);
        });

        return btn;
    }

    function rerenderButtonsWithEditorRestore() {
        if (currentContainer) {
            currentContainer.data('buttons-processed', false);
            reorderButtons(currentContainer);
        }
        refreshController();
        setTimeout(function() {
            openEditDialog();
        }, 120);
    }

    function normalizeHexColor(value) {
        var color = String(value || '').trim();
        if (!color) return '';
        if (color.charAt(0) !== '#') color = '#' + color;
        if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) return '';
        return color.toUpperCase();
    }

    function collectAvailableIcons(btnId) {
        var unique = {};
        var icons = [];
        var customIcons = getButtonCustomIcons();
        var defaultIcons = getButtonDefaultIcons();
        var userIcons = getUserIconLibrary();

        function addIcon(svgHtml) {
            var sanitized = sanitizeSvgMarkup(svgHtml);
            var normalized = normalizeSvgMarkup(sanitized);
            if (!normalized || unique[normalized]) return;
            unique[normalized] = true;
            icons.push(sanitized);
        }

        addIcon(LAMPAC_ICON);
        ICON_LIBRARY.forEach(addIcon);
        userIcons.forEach(addIcon);

        if (btnId && defaultIcons[btnId]) addIcon(defaultIcons[btnId]);
        if (btnId && customIcons[btnId]) addIcon(customIcons[btnId]);
        if (btnId) {
            var currentBtn = findButton(btnId);
            if (currentBtn && currentBtn.length) {
                var currentSvg = currentBtn.find('svg').first();
                if (currentSvg.length) addIcon(currentSvg.prop('outerHTML'));
            }
        }

        return icons;
    }

    function openButtonRenameDialog(btnId) {
        var currentName = getButtonCustomName(btnId) || '';
        Lampa.Modal.close();

        setTimeout(function() {
            Lampa.Input.edit({
                free: true,
                title: getTranslation('buttons_plugin_button_name'),
                nosave: true,
                value: currentName,
                nomic: true
            }, function(value) {
                value = (value || '').trim();
                setButtonCustomName(btnId, value);
                rerenderButtonsWithEditorRestore();
            });
        }, 120);
    }

    function openUserIconToolsDialog(handlers) {
        var userIcons = getUserIconLibrary();

        function reopenPicker() {
            if (handlers && handlers.reopen) handlers.reopen();
        }

        function applySelectedIcon(svgHtml) {
            if (handlers && handlers.onSelectIcon) handlers.onSelectIcon(svgHtml);
            else reopenPicker();
        }

        var items = [
            { title: getTranslation('buttons_plugin_add_custom_svg'), action: 'add' },
            { title: getTranslation('buttons_plugin_import_icons_json'), action: 'import' },
            { title: getTranslation('buttons_plugin_export_icons_json'), action: 'export' },
            { title: getTranslation('buttons_plugin_clear_my_icons'), action: 'clear' }
        ];

        Lampa.Select.show({
            title: getTranslation('buttons_plugin_my_icons') + ' (' + userIcons.length + ')',
            items: items,
            onSelect: function(item) {
                if (item.action === 'add') {
                    setTimeout(function() {
                        Lampa.Input.edit({
                            free: true,
                            title: getTranslation('buttons_plugin_svg_code'),
                            nosave: true,
                            value: '',
                            nomic: true
                        }, function(value) {
                            var savedSvg = addUserIconToLibrary(value);
                            if (!savedSvg) {
                                Lampa.Noty.show(getTranslation('buttons_plugin_invalid_svg'));
                                reopenPicker();
                                return;
                            }
                            applySelectedIcon(savedSvg);
                        });
                    }, 120);
                    return;
                }

                if (item.action === 'import') {
                    setTimeout(function() {
                        var importPlaceholder = '{\n  "version": 1,\n  "icons": []\n}';
                        Lampa.Input.edit({
                            free: true,
                            title: getTranslation('buttons_plugin_import_icons_json'),
                            nosave: true,
                            value: '',
                            nomic: true
                        }, function(value) {
                            var result = importUserIconsFromJson(value);
                            if (!result.ok) {
                                Lampa.Noty.show(getTranslation('buttons_plugin_import_failed'));
                            } else {
                                Lampa.Noty.show(getTranslation('buttons_plugin_imported_icons') + ': ' + result.added);
                            }
                            reopenPicker();
                        });

                        setTimeout(function() {
                            var field = $('.inputbox textarea:visible, .inputbox input:visible').first();
                            if (!field.length) return;
                            field.val('');
                            field.attr('placeholder', importPlaceholder);
                            field.off('focus.buttonsImportHint').on('focus.buttonsImportHint', function() {
                                $(this).attr('placeholder', '');
                                $(this).off('focus.buttonsImportHint');
                            });
                        }, 0);
                    }, 120);
                    return;
                }

                if (item.action === 'export') {
                    setTimeout(function() {
                        Lampa.Input.edit({
                            free: true,
                            title: getTranslation('buttons_plugin_export_icons_json'),
                            nosave: true,
                            value: exportUserIconsToJson(),
                            nomic: true
                        }, function() {
                            reopenPicker();
                        });
                    }, 120);
                    return;
                }

                if (item.action === 'clear') {
                    if (!userIcons.length) {
                        Lampa.Noty.show(getTranslation('buttons_plugin_no_my_icons'));
                        reopenPicker();
                        return;
                    }
                    setUserIconLibrary([]);
                    Lampa.Noty.show(getTranslation('buttons_plugin_icons_cleared'));
                    reopenPicker();
                }
            },
            onBack: function() {
                reopenPicker();
            }
        });
    }

    function appendUserIconToolsMoreItem(grid, handlers) {
        var moreItem = $('<div class="selector icon-picker-item icon-picker-item--more">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
                '<circle cx="6" cy="12" r="2"></circle>' +
                '<circle cx="12" cy="12" r="2"></circle>' +
                '<circle cx="18" cy="12" r="2"></circle>' +
            '</svg>' +
        '</div>');
        moreItem.on('hover:enter', function() {
            Lampa.Modal.close();
            setTimeout(function() {
                openUserIconToolsDialog(handlers);
            }, 120);
        });
        grid.append(moreItem);
    }

    function openIconPickerDialog(btnId) {
        var allIcons = collectAvailableIcons(btnId);
        var customIcons = getButtonCustomIcons();
        var defaultIcons = getButtonDefaultIcons();
        var selectedIcon = customIcons[btnId] || '';
        var defaultIcon = defaultIcons[btnId] || '';
        var selectedNormalized = normalizeSvgMarkup(selectedIcon || defaultIcon);

        var wrap = $('<div class="icon-picker-wrap"></div>');
        var currentPreview = selectedIcon || defaultIcon || '';

        function applySelectedIcon(svgHtml) {
            customIcons[btnId] = svgHtml;
            setButtonCustomIcons(customIcons);
            rerenderButtonsWithEditorRestore();
        }

        var defaultItem = $('<div class="menu-edit-list__item selector icon-picker-default">' +
            '<div class="menu-edit-list__icon"></div>' +
            '<div class="menu-edit-list__title">' + getTranslation('buttons_plugin_default') + '</div>' +
        '</div>');

        if (currentPreview) {
            defaultItem.find('.menu-edit-list__icon').append($(currentPreview));
        }

        defaultItem.on('hover:enter', function() {
            delete customIcons[btnId];
            setButtonCustomIcons(customIcons);
            Lampa.Modal.close();
            rerenderButtonsWithEditorRestore();
        });

        wrap.append(defaultItem);

        var grid = $('<div class="icon-picker-grid"></div>');
        allIcons.forEach(function(svgHtml) {
            var item = $('<div class="selector icon-picker-item"></div>');
            item.append($(svgHtml));
            if (normalizeSvgMarkup(svgHtml) === selectedNormalized && selectedNormalized) {
                item.addClass('active');
            }
            item.on('hover:enter', function() {
                Lampa.Modal.close();
                applySelectedIcon(svgHtml);
            });
            grid.append(item);
        });
        appendUserIconToolsMoreItem(grid, {
            reopen: function() {
                openIconPickerDialog(btnId);
            },
            onSelectIcon: function(svgHtml) {
                applySelectedIcon(svgHtml);
            }
        });

        wrap.append(grid);

        Lampa.Modal.open({
            title: getTranslation('buttons_plugin_select_icon'),
            html: wrap,
            size: 'medium',
            onBack: function() {
                Lampa.Modal.close();
                openEditDialog();
            }
        });
        applyBtnPluginModalClass();
    }

    function setIconColorValue(btnId, color) {
        if (btnId) {
            var perBtn = getButtonIconColors();
            if (color) perBtn[btnId] = color;
            else delete perBtn[btnId];
            setButtonIconColors(perBtn);
        } else {
            setButtonGlobalIconColor(color || '');
        }
    }

    function openIconColorDialog(btnId) {
        var currentColor = btnId ? (getButtonIconColors()[btnId] || getButtonGlobalIconColor() || '') : getButtonGlobalIconColor();
        var wrap = $('<div class="icon-color-wrap"></div>');

        var defaultItem = $('<div class="menu-edit-list__item selector icon-color-default">' +
            '<div class="menu-edit-list__icon"><div class="icon-color-dot-preview"></div></div>' +
            '<div class="menu-edit-list__title">' + getTranslation('buttons_plugin_default') + '</div>' +
        '</div>');
        if (currentColor) {
            defaultItem.find('.icon-color-dot-preview').css('background-color', currentColor);
        }

        defaultItem.on('hover:enter', function() {
            setIconColorValue(btnId, '');
            Lampa.Modal.close();
            rerenderButtonsWithEditorRestore();
        });
        wrap.append(defaultItem);

        var hexItem = $('<div class="menu-edit-list__item selector icon-color-hex">' +
            '<div class="menu-edit-list__title">' + getTranslation('buttons_plugin_hex_color') + '</div>' +
            '<div class="menu-edit-list__value">#</div>' +
        '</div>');
        hexItem.on('hover:enter', function() {
            Lampa.Modal.close();
            setTimeout(function() {
                Lampa.Input.edit({
                    free: true,
                    title: getTranslation('buttons_plugin_hex_color'),
                    nosave: true,
                    value: currentColor || '',
                    nomic: true
                }, function(value) {
                    var normalized = normalizeHexColor(value);
                    if (!normalized) {
                        openIconColorDialog(btnId);
                        return;
                    }
                    setIconColorValue(btnId, normalized);
                    rerenderButtonsWithEditorRestore();
                });
            }, 120);
        });
        wrap.append(hexItem);

        var grid = $('<div class="icon-color-grid"></div>');
        ICON_COLOR_PALETTE.forEach(function(color) {
            var item = $('<div class="selector icon-color-item"><div class="icon-color-dot"></div></div>');
            item.find('.icon-color-dot').css('background-color', color);
            if (color === currentColor) item.addClass('active');
            item.on('hover:enter', function() {
                setIconColorValue(btnId, color);
                Lampa.Modal.close();
                rerenderButtonsWithEditorRestore();
            });
            grid.append(item);
        });
        wrap.append(grid);

        Lampa.Modal.open({
            title: getTranslation('buttons_plugin_icon_color'),
            html: wrap,
            size: 'medium',
            onBack: function() {
                Lampa.Modal.close();
                openEditDialog();
            }
        });
        applyBtnPluginModalClass();
    }

    function openFolderIconPickerDialog(folderId) {
        var folderCustomIcons = getFolderCustomIcons();
        var allIcons = collectAvailableIcons(null);
        var selectedIcon = folderCustomIcons[folderId] || '';
        var selectedNormalized = normalizeSvgMarkup(selectedIcon);

        var wrap = $('<div class="icon-picker-wrap"></div>');

        function applySelectedFolderIcon(svgHtml) {
            folderCustomIcons[folderId] = svgHtml;
            setFolderCustomIcons(folderCustomIcons);
            rerenderButtonsWithEditorRestore();
        }

        var defaultItem = $('<div class="menu-edit-list__item selector icon-picker-default">' +
            '<div class="menu-edit-list__icon"></div>' +
            '<div class="menu-edit-list__title">' + getTranslation('buttons_plugin_default') + '</div>' +
        '</div>');

        defaultItem.on('hover:enter', function() {
            delete folderCustomIcons[folderId];
            setFolderCustomIcons(folderCustomIcons);
            Lampa.Modal.close();
            rerenderButtonsWithEditorRestore();
        });
        wrap.append(defaultItem);

        var grid = $('<div class="icon-picker-grid"></div>');
        allIcons.forEach(function(svgHtml) {
            var item = $('<div class="selector icon-picker-item"></div>');
            item.append($(svgHtml));
            if (normalizeSvgMarkup(svgHtml) === selectedNormalized && selectedNormalized) {
                item.addClass('active');
            }
            item.on('hover:enter', function() {
                Lampa.Modal.close();
                applySelectedFolderIcon(svgHtml);
            });
            grid.append(item);
        });
        appendUserIconToolsMoreItem(grid, {
            reopen: function() {
                openFolderIconPickerDialog(folderId);
            },
            onSelectIcon: function(svgHtml) {
                applySelectedFolderIcon(svgHtml);
            }
        });
        wrap.append(grid);

        Lampa.Modal.open({
            title: getTranslation('buttons_plugin_folder_icon'),
            html: wrap,
            size: 'medium',
            onBack: function() {
                Lampa.Modal.close();
                openEditDialog();
            }
        });
        applyBtnPluginModalClass();
    }

    function openFolderIconColorDialog(folderId) {
        var folderColors = getFolderIconColors();
        var currentColor = folderColors[folderId] || '';
        var wrap = $('<div class="icon-color-wrap"></div>');

        var defaultItem = $('<div class="menu-edit-list__item selector icon-color-default">' +
            '<div class="menu-edit-list__icon"><div class="icon-color-dot-preview"></div></div>' +
            '<div class="menu-edit-list__title">' + getTranslation('buttons_plugin_default') + '</div>' +
        '</div>');
        if (currentColor) {
            defaultItem.find('.icon-color-dot-preview').css('background-color', currentColor);
        }

        defaultItem.on('hover:enter', function() {
            delete folderColors[folderId];
            setFolderIconColors(folderColors);
            Lampa.Modal.close();
            rerenderButtonsWithEditorRestore();
        });
        wrap.append(defaultItem);

        var hexItem = $('<div class="menu-edit-list__item selector icon-color-hex">' +
            '<div class="menu-edit-list__title">' + getTranslation('buttons_plugin_hex_color') + '</div>' +
            '<div class="menu-edit-list__value">#</div>' +
        '</div>');
        hexItem.on('hover:enter', function() {
            Lampa.Modal.close();
            setTimeout(function() {
                Lampa.Input.edit({
                    free: true,
                    title: getTranslation('buttons_plugin_hex_color'),
                    nosave: true,
                    value: currentColor || '',
                    nomic: true
                }, function(value) {
                    var normalized = normalizeHexColor(value);
                    if (!normalized) {
                        openFolderIconColorDialog(folderId);
                        return;
                    }
                    folderColors[folderId] = normalized;
                    setFolderIconColors(folderColors);
                    rerenderButtonsWithEditorRestore();
                });
            }, 120);
        });
        wrap.append(hexItem);

        var grid = $('<div class="icon-color-grid"></div>');
        ICON_COLOR_PALETTE.forEach(function(color) {
            var item = $('<div class="selector icon-color-item"><div class="icon-color-dot"></div></div>');
            item.find('.icon-color-dot').css('background-color', color);
            if (color === currentColor) item.addClass('active');
            item.on('hover:enter', function() {
                folderColors[folderId] = color;
                setFolderIconColors(folderColors);
                Lampa.Modal.close();
                rerenderButtonsWithEditorRestore();
            });
            grid.append(item);
        });
        wrap.append(grid);

        Lampa.Modal.open({
            title: getTranslation('buttons_plugin_folder_color'),
            html: wrap,
            size: 'medium',
            onBack: function() {
                Lampa.Modal.close();
                openEditDialog();
            }
        });
        applyBtnPluginModalClass();
    }

    function openFolderMenu(folder) {
        var items = [];

        folder.buttons.forEach(function(btnId) {
            var btn = findButton(btnId);
            if (btn) {
                var displayName = getBtnDisplayText(btn, allButtonsOriginal);
                var _fmCustIcons = getButtonCustomIcons();
                var _fmColors = getButtonIconColors();
                var _fmGlobal = getButtonGlobalIconColor();
                var _fmSvg;
                if (_fmCustIcons[btnId]) {
                    _fmSvg = $(_fmCustIcons[btnId]);
                } else {
                    var _fmEl = btn.find('svg').first();
                    _fmSvg = _fmEl.length ? _fmEl.clone() : null;
                }
                var _fmColor = _fmColors[btnId] || _fmGlobal || '';
                if (_fmSvg && _fmColor) _fmSvg.css('color', _fmColor);
                var icon = _fmSvg ? _fmSvg.prop('outerHTML') : '';
                var subtitle = btn.attr('data-subtitle') || '';

                var item = {
                    title: displayName.replace(/<[^>]*>/g, ''),
                    button: btn,
                    btnId: btnId
                };

                if (icon) {
                    item.template = 'selectbox_icon';
                    item.icon = icon;
                }

                if (subtitle) {
                    item.subtitle = subtitle;
                }

                items.push(item);
            }
        });

        items.push({
            title: getTranslation('buttons_plugin_edit_order'),
            edit: true
        });

        Lampa.Select.show({
            title: folder.name,
            items: items,
            onSelect: function(item) {
                if (item.edit) {
                    openFolderEditDialog(folder);
                } else {
                    item.button.trigger('hover:enter');
                }
            },
            onBack: function() {
                Lampa.Controller.toggle('full_start');
            }
        });
    }

    function rerenderAndOpenFolderEdit(folder) {
        if (currentContainer) {
            currentContainer.data('buttons-processed', false);
            reorderButtons(currentContainer);
        }
        refreshController();
        setTimeout(function() {
            var folders = getFolders();
            var updatedFolder = folders.filter(function(f) { return f.id === folder.id; })[0] || folder;
            openFolderEditDialog(updatedFolder);
        }, 120);
    }

    function openFolderButtonIconPickerDialog(btnId, folder) {
        var allIcons = collectAvailableIcons(btnId);
        var customIcons = getButtonCustomIcons();
        var defaultIcons = getButtonDefaultIcons();
        var selectedIcon = customIcons[btnId] || '';
        var defaultIcon = defaultIcons[btnId] || '';
        var selectedNormalized = normalizeSvgMarkup(selectedIcon || defaultIcon);

        var wrap = $('<div class="icon-picker-wrap"></div>');

        function applySelectedIcon(svgHtml) {
            customIcons[btnId] = svgHtml;
            setButtonCustomIcons(customIcons);
            rerenderAndOpenFolderEdit(folder);
        }

        var defaultItem = $('<div class="menu-edit-list__item selector icon-picker-default">' +
            '<div class="menu-edit-list__icon"></div>' +
            '<div class="menu-edit-list__title">' + getTranslation('buttons_plugin_default') + '</div>' +
        '</div>');
        if (selectedIcon || defaultIcon) {
            defaultItem.find('.menu-edit-list__icon').append($(selectedIcon || defaultIcon));
        }
        defaultItem.on('hover:enter', function() {
            delete customIcons[btnId];
            setButtonCustomIcons(customIcons);
            Lampa.Modal.close();
            rerenderAndOpenFolderEdit(folder);
        });
        wrap.append(defaultItem);

        var grid = $('<div class="icon-picker-grid"></div>');
        allIcons.forEach(function(svgHtml) {
            var item = $('<div class="selector icon-picker-item"></div>');
            item.append($(svgHtml));
            if (normalizeSvgMarkup(svgHtml) === selectedNormalized && selectedNormalized) {
                item.addClass('active');
            }
            item.on('hover:enter', function() {
                Lampa.Modal.close();
                applySelectedIcon(svgHtml);
            });
            grid.append(item);
        });
        appendUserIconToolsMoreItem(grid, {
            reopen: function() {
                openFolderButtonIconPickerDialog(btnId, folder);
            },
            onSelectIcon: function(svgHtml) {
                applySelectedIcon(svgHtml);
            }
        });
        wrap.append(grid);

        Lampa.Modal.open({
            title: getTranslation('buttons_plugin_select_icon'),
            html: wrap,
            size: 'medium',
            onBack: function() {
                Lampa.Modal.close();
                openFolderEditDialog(folder);
            }
        });
        applyBtnPluginModalClass();
    }

    function openFolderButtonIconColorDialog(btnId, folder) {
        var perButtonColors = getButtonIconColors();
        var currentColor = perButtonColors[btnId] || getButtonGlobalIconColor() || '';
        var wrap = $('<div class="icon-color-wrap"></div>');

        var defaultItem = $('<div class="menu-edit-list__item selector icon-color-default">' +
            '<div class="menu-edit-list__icon"><div class="icon-color-dot-preview"></div></div>' +
            '<div class="menu-edit-list__title">' + getTranslation('buttons_plugin_default') + '</div>' +
        '</div>');
        if (currentColor) defaultItem.find('.icon-color-dot-preview').css('background-color', currentColor);
        defaultItem.on('hover:enter', function() {
            setIconColorValue(btnId, '');
            Lampa.Modal.close();
            rerenderAndOpenFolderEdit(folder);
        });
        wrap.append(defaultItem);

        var hexItem = $('<div class="menu-edit-list__item selector icon-color-hex">' +
            '<div class="menu-edit-list__title">' + getTranslation('buttons_plugin_hex_color') + '</div>' +
            '<div class="menu-edit-list__value">#</div>' +
        '</div>');
        hexItem.on('hover:enter', function() {
            Lampa.Modal.close();
            setTimeout(function() {
                Lampa.Input.edit({
                    free: true,
                    title: getTranslation('buttons_plugin_hex_color'),
                    nosave: true,
                    value: currentColor || '',
                    nomic: true
                }, function(value) {
                    var normalized = normalizeHexColor(value);
                    if (!normalized) {
                        openFolderButtonIconColorDialog(btnId, folder);
                        return;
                    }
                    setIconColorValue(btnId, normalized);
                    rerenderAndOpenFolderEdit(folder);
                });
            }, 120);
        });
        wrap.append(hexItem);

        var grid = $('<div class="icon-color-grid"></div>');
        ICON_COLOR_PALETTE.forEach(function(color) {
            var item = $('<div class="selector icon-color-item"><div class="icon-color-dot"></div></div>');
            item.find('.icon-color-dot').css('background-color', color);
            if (color === currentColor) item.addClass('active');
            item.on('hover:enter', function() {
                setIconColorValue(btnId, color);
                Lampa.Modal.close();
                rerenderAndOpenFolderEdit(folder);
            });
            grid.append(item);
        });
        wrap.append(grid);

        Lampa.Modal.open({
            title: getTranslation('buttons_plugin_icon_color'),
            html: wrap,
            size: 'medium',
            onBack: function() {
                Lampa.Modal.close();
                openFolderEditDialog(folder);
            }
        });
        applyBtnPluginModalClass();
    }

    function openFolderEditDialog(folder) {
        var list = $('<div class="menu-edit-list"></div>');

        folder.buttons.forEach(function(btnId) {
            var btn = findButton(btnId);
            if (btn) {
                var displayName = getBtnDisplayText(btn, allButtonsOriginal);
                var _feCustIcons = getButtonCustomIcons();
                var _feColors = getButtonIconColors();
                var _feGlobal = getButtonGlobalIconColor();
                var _feIconEl = btn.find('svg').first();
                var icon;
                if (_feCustIcons[btnId]) {
                    icon = $(_feCustIcons[btnId]);
                } else {
                    icon = _feIconEl.length ? _feIconEl.clone() : $('<svg></svg>');
                }
                var _feColor = _feColors[btnId] || _feGlobal || '';
                if (_feColor) icon.css('color', _feColor);

                var item = $('<div class="menu-edit-list__item">' +
                    '<div class="menu-edit-list__icon"></div>' +
                    '<div class="menu-edit-list__title">' + displayName + '</div>' +
                    '<div class="menu-edit-list__icon-change selector">' +
                        '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                            '<rect x="3" y="4" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect>' +
                            '<circle cx="9" cy="10" r="2" fill="currentColor"></circle>' +
                            '<path d="M5.5 19L11 13.5L14.5 17L18 13.5L22 18" stroke="currentColor" stroke-width="2" fill="none"></path>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="menu-edit-list__icon-color selector">' +
                        '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                            '<path d="M13 22a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1 4 4 0 1 0 0-8 1 1 0 0 1 0-2 6 6 0 1 1 0 12v1a1 1 0 0 1-1 1z" fill="currentColor"></path>' +
                            '<circle cx="17.5" cy="6.5" r="2.2" fill="currentColor"></circle>' +
                            '<circle cx="8" cy="6.5" r="1.7" fill="currentColor"></circle>' +
                            '<circle cx="5.8" cy="11.8" r="1.4" fill="currentColor"></circle>' +
                        '</svg>' +
                    '</div>' +
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
                '</div>');

                item.find('.menu-edit-list__icon').append(icon);
                item.data('btnId', btnId);

                item.find('.menu-edit-list__icon-change').on('hover:enter', function() {
                    Lampa.Modal.close();
                    setTimeout(function() {
                        openFolderButtonIconPickerDialog(btnId, folder);
                    }, 120);
                });

                item.find('.menu-edit-list__icon-color').on('hover:enter', function() {
                    Lampa.Modal.close();
                    setTimeout(function() {
                        openFolderButtonIconColorDialog(btnId, folder);
                    }, 120);
                });

                item.find('.move-up').on('hover:enter', function() {
                    var prev = item.prev();
                    if (prev.length) {
                        item.insertBefore(prev);
                        saveFolderButtonOrder(folder, list);
                    }
                });

                item.find('.move-down').on('hover:enter', function() {
                    var next = item.next();
                    if (next.length) {
                        item.insertAfter(next);
                        saveFolderButtonOrder(folder, list);
                    }
                });

                list.append(item);
            }
        });

        Lampa.Modal.open({
            title: getTranslation('buttons_plugin_folder_order'),
            html: list,
            size: 'medium',
            scroll_to_center: true,
            onBack: function() {
                Lampa.Modal.close();
                updateFolderIcon(folder);
                openFolderMenu(folder);
            }
        });
        applyBtnPluginModalClass();
    }

    function saveFolderButtonOrder(folder, list) {
        var newOrder = [];
        list.find('.menu-edit-list__item').each(function() {
            var btnId = $(this).data('btnId');
            newOrder.push(btnId);
        });

        folder.buttons = newOrder;

        var folders = getFolders();
        for (var i = 0; i < folders.length; i++) {
            if (folders[i].id === folder.id) {
                folders[i].buttons = newOrder;
                break;
            }
        }
        setFolders(folders);

        updateFolderIcon(folder);
    }

    function updateFolderIcon(folder) {
        if (!folder.buttons || folder.buttons.length === 0) return;

        var folderCustomIcons = getFolderCustomIcons();
        var folderIconColors = getFolderIconColors();
        var folderColor = folderIconColors[folder.id] || '';

        var folderBtn = currentContainer.find('.button--folder[data-folder-id="' + folder.id + '"]');
        if (!folderBtn.length) return;

        var newSvg;
        if (folderCustomIcons[folder.id]) {
            newSvg = $(folderCustomIcons[folder.id]);
        } else {
            var firstBtnId = folder.buttons[0];
            var firstBtn = findButton(firstBtnId);
            if (firstBtn) {
                var _ufiCustIcons = getButtonCustomIcons();
                if (_ufiCustIcons[firstBtnId]) {
                    newSvg = $(_ufiCustIcons[firstBtnId]);
                } else {
                    var iconElement = firstBtn.find('svg').first();
                    if (iconElement.length) {
                        newSvg = iconElement.clone();
                    }
                }
            }
            if (!newSvg) {
                newSvg = $('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
                '</svg>');
            }
        }

        if (folderColor) newSvg.css('color', folderColor);
        folderBtn.find('svg').replaceWith(newSvg);
    }

    function createFolder(name, buttonIds) {
        var folders = getFolders();
        var folder = {
            id: 'folder_' + Date.now(),
            name: name,
            buttons: buttonIds
        };
        folders.push(folder);
        setFolders(folders);
        return folder;
    }

    function deleteFolder(folderId) {
        var folders = getFolders();
        folders = folders.filter(function(f) { return f.id !== folderId; });
        setFolders(folders);
    }

    function openCreateFolderDialog() {
        Lampa.Input.edit({
            free: true,
            title: getTranslation('buttons_plugin_folder_name'),
            nosave: true,
            value: '',
            nomic: true
        }, function(folderName) {
            if (!folderName || !folderName.trim()) {
                Lampa.Noty.show(getTranslation('buttons_plugin_folder_name'));
                openEditDialog();
                return;
            }
            openSelectButtonsDialog(folderName.trim());
        });
    }

    function openSelectButtonsDialog(folderName) {
        var selectedButtons = [];
        var list = $('<div class="menu-edit-list"></div>');

        var buttonsInFolders = getButtonsInFolders();
        var sortedButtons = dedupeOnlineButtons(arrangeBtnsByOrder(allButtonsOriginal.slice()));

        sortedButtons.forEach(function(btn) {
            var btnId = getBtnIdentifier(btn);

            if (buttonsInFolders.indexOf(btnId) !== -1) {
                return;
            }

            var displayName = getBtnDisplayText(btn, sortedButtons);
            var iconElement = btn.find('svg').first();
            var icon = iconElement.length ? iconElement.clone() : $('<svg></svg>');

            var item = $('<div class="menu-edit-list__item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + displayName + '</div>' +
                '<div class="menu-edit-list__toggle selector">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                        '<path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>' +
                    '</svg>' +
                '</div>' +
            '</div>');

            item.find('.menu-edit-list__icon').append(icon);

            item.find('.menu-edit-list__toggle').on('hover:enter', function() {
                var index = selectedButtons.indexOf(btnId);
                if (index !== -1) {
                    selectedButtons.splice(index, 1);
                    item.find('.dot').attr('opacity', '0');
                } else {
                    selectedButtons.push(btnId);
                    item.find('.dot').attr('opacity', '1');
                }
            });

            list.append(item);
        });

        var createBtn = $('<div class="selector folder-create-confirm">' +
            '<div style="text-align: center; padding: 1em;">' + getTranslation('buttons_plugin_create_folder') + ' "' + folderName + '"</div>' +
        '</div>');

        createBtn.on('hover:enter', function() {
            if (selectedButtons.length < 2) {
                Lampa.Noty.show(getTranslation('buttons_plugin_min_2_buttons'));
                return;
            }

            var folder = createFolder(folderName, selectedButtons);

            var itemOrder = getItemOrder();

            if (itemOrder.length === 0) {
                currentButtons.forEach(function(btn) {
                    itemOrder.push({
                        type: 'button',
                        id: getBtnIdentifier(btn)
                    });
                });
            }

            var folderAdded = false;

            for (var i = 0; i < selectedButtons.length; i++) {
                var btnId = selectedButtons[i];

                for (var j = 0; j < itemOrder.length; j++) {
                    if (itemOrder[j].type === 'button' && itemOrder[j].id === btnId) {
                        if (!folderAdded) {
                            itemOrder[j] = {
                                type: 'folder',
                                id: folder.id
                            };
                            folderAdded = true;
                        } else {
                            itemOrder.splice(j, 1);
                            j--;
                        }
                        break;
                    }
                }

                for (var k = 0; k < currentButtons.length; k++) {
                    if (getBtnIdentifier(currentButtons[k]) === btnId) {
                        currentButtons.splice(k, 1);
                        break;
                    }
                }
            }

            if (!folderAdded) {
                itemOrder.push({
                    type: 'folder',
                    id: folder.id
                });
            }

            setItemOrder(itemOrder);

            Lampa.Modal.close();
            Lampa.Noty.show(getTranslation('buttons_plugin_folder_created') + ' "' + folderName + '"');

            if (currentContainer) {
                currentContainer.data('buttons-processed', false);
                reorderButtons(currentContainer);
            }
            refreshController();
        });

        list.append(createBtn);

        Lampa.Modal.open({
            title: getTranslation('buttons_plugin_select_buttons'),
            html: list,
            size: 'medium',
            scroll_to_center: true,
            onBack: function() {
                Lampa.Modal.close();
                openEditDialog();
            }
        });
        applyBtnPluginModalClass();
    }

    function applyBtnPluginModalClass() {
        setTimeout(function() {
            try {
                Lampa.Controller.toggle('modal');
            } catch(e) {}
        }, 50);
    }

    function openEditDialog() {
        if (currentContainer) {
            var allButtons = collectOrderedButtons(currentContainer);

            var folders = getFolders();
            var buttonsInFolders = [];
            folders.forEach(function(folder) {
                buttonsInFolders = buttonsInFolders.concat(folder.buttons);
            });

            var filteredButtons = allButtons.filter(function(btn) {
                return buttonsInFolders.indexOf(getBtnIdentifier(btn)) === -1;
            });

            currentButtons = filteredButtons;
        }

        var list = $('<div class="menu-edit-list"></div>');
        var hidden = getHiddenButtons();
        var folders = getFolders();
        var itemOrder = getItemOrder();

        var createFolderBtn = $('<div class="menu-edit-list__item menu-edit-list__create-folder selector">' +
            '<div class="menu-edit-list__icon">' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
                    '<line x1="12" y1="11" x2="12" y2="17"></line>' +
                    '<line x1="9" y1="14" x2="15" y2="14"></line>' +
                '</svg>' +
            '</div>' +
            '<div class="menu-edit-list__title">' + getTranslation('buttons_plugin_create_folder') + '</div>' +
        '</div>');

        createFolderBtn.on('hover:enter', function() {
            Lampa.Modal.close();
            openCreateFolderDialog();
        });

        list.append(createFolderBtn);

        var iconColorBtn = $('<div class="menu-edit-list__item menu-edit-list__icon-color-global selector">' +
            '<div class="menu-edit-list__icon">' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M12 22a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1 4 4 0 0 0 0-8 1 1 0 0 1 0-2 6 6 0 0 1 0 12v1a1 1 0 0 1-1 1z"></path>' +
                    '<path d="M16.5 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"></path>' +
                    '<path d="M8 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"></path>' +
                    '<path d="M4.5 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"></path>' +
                    '<path d="M7.5 14a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"></path>' +
                '</svg>' +
            '</div>' +
            '<div class="menu-edit-list__title">' + getTranslation('buttons_plugin_icon_color') + '</div>' +
        '</div>');

        iconColorBtn.on('hover:enter', function() {
            Lampa.Modal.close();
            setTimeout(function() {
                openIconColorDialog(null);
            }, 120);
        });

        list.append(iconColorBtn);

        // Баннер глобального режима отображения кнопок
        var viewModeNames = ['', 'Стандартный', 'Только иконки', 'Иконки + текст'];
        var currentGlobalMode = parseInt(Lampa.Storage.get('button_global_view_mode', 1)) || 1;
        var viewModeBanner = $('<div class="view-mode-banner selector">' +
            '<div class="view-mode-banner__title">Вид кнопок: <b>' + viewModeNames[currentGlobalMode] + '</b></div>' +
            '<div class="view-mode-banner__hint">1/2/3 — режим для каждой кнопки (работает в «Стандартный»)</div>' +
        '</div>');
        viewModeBanner.on('hover:enter', function() {
            currentGlobalMode = currentGlobalMode >= 3 ? 1 : currentGlobalMode + 1;
            Lampa.Storage.set('button_global_view_mode', currentGlobalMode);
            viewModeBanner.find('.view-mode-banner__title').html('Вид кнопок: <b>' + viewModeNames[currentGlobalMode] + '</b>');
            currentButtons.forEach(function(btn) {
                var btnId = getBtnIdentifier(btn);
                setButtonDisplayMode(btnId, currentGlobalMode);
                btn.removeClass('button-mode-1 button-mode-2 button-mode-3');
                btn.addClass('button-mode-' + currentGlobalMode);
            });
        });
        list.append(viewModeBanner);

        function createFolderItem(folder) {
            var folderCustomIcons = getFolderCustomIcons();
            var folderIconColors = getFolderIconColors();
            var folderDisplayIconHtml = folderCustomIcons[folder.id] ||
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
                '</svg>';

            var item = $('<div class="menu-edit-list__item folder-item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + folder.name + ' <span style="opacity:0.5">(' + folder.buttons.length + ')</span></div>' +
                '<div class="menu-edit-list__icon-change selector">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<rect x="3" y="4" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect>' +
                        '<circle cx="9" cy="10" r="2" fill="currentColor"></circle>' +
                        '<path d="M5.5 19L11 13.5L14.5 17L18 13.5L22 18" stroke="currentColor" stroke-width="2" fill="none"></path>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__icon-color selector">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M13 22a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1 4 4 0 1 0 0-8 1 1 0 0 1 0-2 6 6 0 1 1 0 12v1a1 1 0 0 1-1 1z" fill="currentColor"></path>' +
                        '<circle cx="17.5" cy="6.5" r="2.2" fill="currentColor"></circle>' +
                        '<circle cx="8" cy="6.5" r="1.7" fill="currentColor"></circle>' +
                        '<circle cx="5.8" cy="11.8" r="1.4" fill="currentColor"></circle>' +
                    '</svg>' +
                '</div>' +
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
                '<div class="menu-edit-list__delete selector">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                        '<path d="M9.5 9.5L16.5 16.5M16.5 9.5L9.5 16.5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
                    '</svg>' +
                '</div>' +
            '</div>');

            var displayIconEl = $(folderDisplayIconHtml);
            var folderColor = folderIconColors[folder.id] || '';
            if (folderColor) displayIconEl.css('color', folderColor);
            item.find('.menu-edit-list__icon').append(displayIconEl);

            item.data('folderId', folder.id);
            item.data('itemType', 'folder');

            item.find('.menu-edit-list__icon-change').on('hover:enter', function() {
                Lampa.Modal.close();
                setTimeout(function() {
                    openFolderIconPickerDialog(folder.id);
                }, 120);
            });

            item.find('.menu-edit-list__icon-color').on('hover:enter', function() {
                Lampa.Modal.close();
                setTimeout(function() {
                    openFolderIconColorDialog(folder.id);
                }, 120);
            });

            item.find('.move-up').on('hover:enter', function() {
                var prev = item.prev();
                while (prev.length && (prev.hasClass('menu-edit-list__create-folder') || prev.hasClass('menu-edit-list__icon-color-global') || prev.hasClass('view-mode-banner'))) {
                    prev = prev.prev();
                }
                if (prev.length) {
                    item.insertBefore(prev);
                    saveItemOrder();
                }
            });

            item.find('.move-down').on('hover:enter', function() {
                var next = item.next();
                while (next.length && (next.hasClass('folder-reset-button') || next.hasClass('folder-save-button'))) {
                    next = next.next();
                }
                if (next.length) {
                    item.insertAfter(next);
                    saveItemOrder();
                }
            });

            item.find('.menu-edit-list__delete').on('hover:enter', function() {
                var folderId = folder.id;
                var folderButtons = folder.buttons.slice();

                deleteFolder(folderId);

                var itemOrder = getItemOrder();
                var newItemOrder = [];

                for (var i = 0; i < itemOrder.length; i++) {
                    if (itemOrder[i].type === 'folder' && itemOrder[i].id === folderId) {
                        continue;
                    }
                    if (itemOrder[i].type === 'button') {
                        var isInFolder = false;
                        for (var j = 0; j < folderButtons.length; j++) {
                            if (itemOrder[i].id === folderButtons[j]) {
                                isInFolder = true;
                                break;
                            }
                        }
                        if (isInFolder) {
                            continue;
                        }
                    }
                    newItemOrder.push(itemOrder[i]);
                }

                setItemOrder(newItemOrder);

                var customOrder = getCustomOrder();
                var newCustomOrder = [];
                for (var i = 0; i < customOrder.length; i++) {
                    var found = false;
                    for (var j = 0; j < folderButtons.length; j++) {
                        if (customOrder[i] === folderButtons[j]) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        newCustomOrder.push(customOrder[i]);
                    }
                }
                setCustomOrder(newCustomOrder);

                item.remove();
                Lampa.Noty.show(getTranslation('buttons_plugin_folder_deleted'));

                setTimeout(function() {
                    if (currentContainer) {
                        currentContainer.find('.button--play, .button--edit-order, .button--folder').remove();
                        currentContainer.data('buttons-processed', false);

                        var targetContainer = currentContainer.find('.full-start-new__buttons');
                        var existingButtons = targetContainer.find('.full-start__button').toArray();

                        allButtonsOriginal.forEach(function(originalBtn) {
                            var btnId = getBtnIdentifier(originalBtn);
                            var exists = false;

                            for (var i = 0; i < existingButtons.length; i++) {
                                if (getBtnIdentifier($(existingButtons[i])) === btnId) {
                                    exists = true;
                                    break;
                                }
                            }

                            if (!exists) {
                                var clonedBtn = originalBtn.clone(true, true);
                                clonedBtn.css({
                                    'opacity': '1',
                                    'animation': 'none'
                                });
                                targetContainer.append(clonedBtn);
                            }
                        });

                        reorderButtons(currentContainer);

                        setTimeout(function() {
                            var updatedItemOrder = [];
                            targetContainer.find('.full-start__button').not('.button--edit-order').each(function() {
                                var $btn = $(this);
                                if ($btn.hasClass('button--folder')) {
                                    var fId = $btn.attr('data-folder-id');
                                    updatedItemOrder.push({
                                        type: 'folder',
                                        id: fId
                                    });
                                } else {
                                    var btnId = getBtnIdentifier($btn);
                                    updatedItemOrder.push({
                                        type: 'button',
                                        id: btnId
                                    });
                                }
                            });
                            setItemOrder(updatedItemOrder);

                            var allButtons = collectOrderedButtons(currentContainer);

                            var folders = getFolders();
                            var buttonsInFolders = [];
                            folders.forEach(function(folder) {
                                buttonsInFolders = buttonsInFolders.concat(folder.buttons);
                            });

                            var filteredButtons = allButtons.filter(function(btn) {
                                return buttonsInFolders.indexOf(getBtnIdentifier(btn)) === -1;
                            });

                            currentButtons = filteredButtons;

                            folderButtons.forEach(function(btnId) {
                                var btn = allButtons.find(function(b) { return getBtnIdentifier(b) === btnId; });
                                if (btn) {
                                    var btnItem = createButtonItem(btn);

                                    var inserted = false;
                                    list.find('.menu-edit-list__item').not('.menu-edit-list__create-folder, .folder-reset-button').each(function() {
                                        var $existingItem = $(this);
                                        var existingType = $existingItem.data('itemType');

                                        if (existingType === 'button') {
                                            var existingBtnId = $existingItem.data('buttonId');
                                            var existingIndex = updatedItemOrder.findIndex(function(item) {
                                                return item.type === 'button' && item.id === existingBtnId;
                                            });
                                            var newIndex = updatedItemOrder.findIndex(function(item) {
                                                return item.type === 'button' && item.id === btnId;
                                            });

                                            if (newIndex !== -1 && existingIndex !== -1 && newIndex < existingIndex) {
                                                btnItem.insertBefore($existingItem);
                                                inserted = true;
                                                return false;
                                            }
                                        }
                                    });

                                    if (!inserted) {
                                        var resetButton = list.find('.folder-reset-button');
                                        if (resetButton.length) {
                                            btnItem.insertBefore(resetButton);
                                        } else {
                                            list.append(btnItem);
                                        }
                                    }
                                }
                            });

                            setTimeout(function() {
                                try {
                                    Lampa.Controller.toggle('modal');
                                } catch(e) {}
                            }, 100);
                        }, 100);
                    }
                }, 50);
            });

            return item;
        }

        function createButtonItem(btn) {
            var displayName = getBtnDisplayText(btn, currentButtons);
            var icon = btn.find('svg').first().clone();
            var btnId = getBtnIdentifier(btn);
            var isHidden = hidden.indexOf(btnId) !== -1;
            var displayMode = getButtonDisplayMode(btnId);
            var canRename = true;

            var item = $('<div class="menu-edit-list__item' + (isHidden ? ' item-hidden' : '') + '">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + displayName + '</div>' +
                '<div class="menu-edit-list__rename selector' + (canRename ? '' : ' disabled-control') + '">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M4 18.5V22H7.5L18.8 10.7L15.3 7.2L4 18.5Z" stroke="currentColor" stroke-width="2" fill="none"></path>' +
                        '<path d="M14.6 7.9L18.1 11.4" stroke="currentColor" stroke-width="2"></path>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__icon-change selector">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<rect x="3" y="4" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect>' +
                        '<circle cx="9" cy="10" r="2" fill="currentColor"></circle>' +
                        '<path d="M5.5 19L11 13.5L14.5 17L18 13.5L22 18" stroke="currentColor" stroke-width="2" fill="none"></path>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__icon-color selector">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M13 22a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1 4 4 0 1 0 0-8 1 1 0 0 1 0-2 6 6 0 1 1 0 12v1a1 1 0 0 1-1 1z" fill="currentColor"></path>' +
                        '<circle cx="17.5" cy="6.5" r="2.2" fill="currentColor"></circle>' +
                        '<circle cx="8" cy="6.5" r="1.7" fill="currentColor"></circle>' +
                        '<circle cx="5.8" cy="11.8" r="1.4" fill="currentColor"></circle>' +
                    '</svg>' +
                '</div>' +
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
                '<div class="menu-edit-list__display-mode selector" data-mode="' + displayMode + '">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                        '<text x="13" y="17" text-anchor="middle" fill="currentColor" font-size="12" font-weight="bold" class="mode-number">' + displayMode + '</text>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__toggle toggle selector">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                        '<path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="' + (isHidden ? '0' : '1') + '" stroke-linecap="round"/>' +
                    '</svg>' +
                '</div>' +
            '</div>');

            item.find('.menu-edit-list__icon').append(icon);
            item.data('button', btn);
            item.data('buttonId', btnId);
            item.data('itemType', 'button');

            item.find('.menu-edit-list__rename').on('hover:enter', function() {
                if (!canRename) return;
                openButtonRenameDialog(btnId);
            });

            item.find('.menu-edit-list__icon-change').on('hover:enter', function() {
                Lampa.Modal.close();
                setTimeout(function() {
                    openIconPickerDialog(btnId);
                }, 120);
            });

            item.find('.menu-edit-list__icon-color').on('hover:enter', function() {
                Lampa.Modal.close();
                setTimeout(function() {
                    openIconColorDialog(btnId);
                }, 120);
            });

            item.find('.move-up').on('hover:enter', function() {
                var prev = item.prev();
                while (prev.length && (prev.hasClass('menu-edit-list__create-folder') || prev.hasClass('menu-edit-list__icon-color-global') || prev.hasClass('view-mode-banner'))) {
                    prev = prev.prev();
                }
                if (prev.length) {
                    item.insertBefore(prev);
                    var btnIndex = currentButtons.indexOf(btn);
                    if (btnIndex > 0) {
                        currentButtons.splice(btnIndex, 1);
                        currentButtons.splice(btnIndex - 1, 0, btn);
                    }
                    saveItemOrder();
                }
            });

            item.find('.move-down').on('hover:enter', function() {
                var next = item.next();
                while (next.length && (next.hasClass('folder-reset-button') || next.hasClass('folder-save-button'))) {
                    next = next.next();
                }
                if (next.length) {
                    item.insertAfter(next);
                    var btnIndex = currentButtons.indexOf(btn);
                    if (btnIndex < currentButtons.length - 1) {
                        currentButtons.splice(btnIndex, 1);
                        currentButtons.splice(btnIndex + 1, 0, btn);
                    }
                    saveItemOrder();
                }
            });

            item.find('.menu-edit-list__display-mode').on('hover:enter', function() {
                var currentMode = parseInt($(this).attr('data-mode')) || 1;
                var newMode = currentMode >= 3 ? 1 : currentMode + 1;

                $(this).attr('data-mode', newMode);
                $(this).find('.mode-number').text(newMode);

                setButtonDisplayMode(btnId, newMode);

                // Применяем режим к кнопке
                btn.removeClass('button-mode-1 button-mode-2 button-mode-3');
                btn.addClass('button-mode-' + newMode);
            });

            item.find('.toggle').on('hover:enter', function() {
                var hidden = getHiddenButtons();
                var index = hidden.indexOf(btnId);

                if (index !== -1) {
                    hidden.splice(index, 1);
                    btn.removeClass('hidden');
                    item.find('.dot').attr('opacity', '1');
                    item.removeClass('item-hidden');
                } else {
                    hidden.push(btnId);
                    btn.addClass('hidden');
                    item.find('.dot').attr('opacity', '0');
                    item.addClass('item-hidden');
                }

                setHiddenButtons(hidden);
            });

            return item;
        }

        if (itemOrder.length > 0) {
            itemOrder.forEach(function(item) {
                if (item.type === 'folder') {
                    var folder = folders.find(function(f) { return f.id === item.id; });
                    if (folder) {
                        list.append(createFolderItem(folder));
                    }
                } else if (item.type === 'button') {
                    var btn = currentButtons.find(function(b) { return getBtnIdentifier(b) === item.id; });
                    if (btn) {
                        list.append(createButtonItem(btn));
                    }
                }
            });

            currentButtons.forEach(function(btn) {
                var btnId = getBtnIdentifier(btn);
                var found = itemOrder.some(function(item) {
                    return item.type === 'button' && item.id === btnId;
                });
                if (!found) {
                    list.append(createButtonItem(btn));
                }
            });

            folders.forEach(function(folder) {
                var found = itemOrder.some(function(item) {
                    return item.type === 'folder' && item.id === folder.id;
                });
                if (!found) {
                    list.append(createFolderItem(folder));
                }
            });
        } else {
            folders.forEach(function(folder) {
                list.append(createFolderItem(folder));
            });

            currentButtons.forEach(function(btn) {
                list.append(createButtonItem(btn));
            });
        }

        var resetBtn = $('<div class="selector folder-reset-button">' +
            '<div style="text-align: center; padding: 1em;">' + getTranslation('buttons_plugin_reset_default') + '</div>' +
        '</div>');

        resetBtn.on('hover:enter', function() {
            Lampa.Storage.set('button_custom_order', []);
            Lampa.Storage.set('button_hidden', []);
            Lampa.Storage.set('button_folders', []);
            Lampa.Storage.set('button_item_order', []);
            Lampa.Storage.set('button_display_modes', {});
            Lampa.Storage.set('button_custom_names', {});
            Lampa.Storage.set('button_custom_icons', {});
            Lampa.Storage.set('button_user_icons', []);
            Lampa.Storage.set('button_icon_color_global', '');
            Lampa.Storage.set('button_icon_colors', {});
            Lampa.Storage.set('button_folder_custom_icons', {});
            Lampa.Storage.set('button_folder_icon_colors', {});
            Lampa.Modal.close();
            Lampa.Noty.show(getTranslation('buttons_plugin_settings_reset'));

            setTimeout(function() {
                if (currentContainer) {
                    currentContainer.find('.button--play, .button--edit-order, .button--folder').remove();
                    currentContainer.data('buttons-processed', false);

                    var targetContainer = currentContainer.find('.full-start-new__buttons');
                    var existingButtons = targetContainer.find('.full-start__button').toArray();

                    allButtonsOriginal.forEach(function(originalBtn) {
                        var btnId = getBtnIdentifier(originalBtn);
                        var exists = false;

                        for (var i = 0; i < existingButtons.length; i++) {
                            if (getBtnIdentifier($(existingButtons[i])) === btnId) {
                                exists = true;
                                break;
                            }
                        }

                        if (!exists) {
                            var clonedBtn = originalBtn.clone(true, true);
                            clonedBtn.css({
                                'opacity': '1',
                                'animation': 'none'
                            });
                            targetContainer.append(clonedBtn);
                        }
                    });

                    reorderButtons(currentContainer);
                    refreshController();
                }
            }, 100);
        });

        var saveCloseBtn = $('<div class="selector folder-save-button">' +
            '<div style="text-align: center; padding: 1em; font-weight: 700;">' + getTranslation('buttons_plugin_save_close') + '</div>' +
        '</div>');

        saveCloseBtn.on('hover:enter', function() {
            Lampa.Modal.close();
            applyChanges();
            Lampa.Controller.toggle('full_start');
        });

        var actionsWrap = $('<div class="buttons-order-actions"></div>');
        actionsWrap.append(resetBtn);
        actionsWrap.append(saveCloseBtn);

        var orderWrap = $('<div class="buttons-order-wrap"></div>');
        orderWrap.addClass('btns-plugin-modal-content');
        orderWrap.append(list);
        orderWrap.append(actionsWrap);

        $('body').addClass('btns-plugin-open');
        Lampa.Modal.open({
            title: getTranslation('buttons_plugin_button_order'),
            html: orderWrap,
            size: 'medium',
            scroll_to_center: true,
            onBack: function() {
                $('body').removeClass('btns-plugin-open');
                Lampa.Modal.close();
                applyChanges();
                Lampa.Controller.toggle('full_start');
            }
        });
        applyBtnPluginModalClass();
    }

    function reorderButtons(container) {
        var targetContainer = container.find('.full-start-new__buttons');
        if (!targetContainer.length) return false;

        currentContainer = container;
        container.find('.button--play, .button--edit-order, .button--folder').remove();

        var allButtons = collectOrderedButtons(container);

        var folders = getFolders();
        var buttonsInFolders = [];
        folders.forEach(function(folder) {
            buttonsInFolders = buttonsInFolders.concat(folder.buttons);
        });

        // Обновляем "оригиналы" при каждом открытии full-карточки.
        // Иначе папка держит первый сохранённый callback и открывает предыдущий фильм/сериал.
        // Но сохраняем предыдущие оригиналы кнопок в папках — они уже не в DOM и collectOrderedButtons их не найдёт.
        var prevFolderOriginals = allButtonsOriginal.filter(function(btn) {
            return buttonsInFolders.indexOf(getBtnIdentifier(btn)) !== -1;
        });
        allButtonsOriginal = [];
        allButtons.forEach(function(btn) {
            allButtonsOriginal.push(btn.clone(true, true));
        });
        prevFolderOriginals.forEach(function(orig) {
            var btnId = getBtnIdentifier(orig);
            var already = allButtonsOriginal.some(function(b) { return getBtnIdentifier(b) === btnId; });
            if (!already) allButtonsOriginal.push(orig);
        });

        var filteredButtons = allButtons.filter(function(btn) {
            return buttonsInFolders.indexOf(getBtnIdentifier(btn)) === -1;
        });

        currentButtons = filteredButtons;
        applyBtnVisibility(filteredButtons);
        applyButtonDisplayModes(filteredButtons);
        applyCustomButtonNames(filteredButtons);
        applyCustomButtonIcons(allButtons);
        applyButtonIconColors(allButtons);

        targetContainer.children().detach();

        var visibleButtons = [];
        var itemOrder = getItemOrder();

        if (itemOrder.length > 0) {
            var addedFolders = [];
            var addedButtons = [];

            itemOrder.forEach(function(item) {
                if (item.type === 'folder') {
                    var folder = folders.find(function(f) { return f.id === item.id; });
                    if (folder) {
                        var folderBtn = createFolderButton(folder);
                        targetContainer.append(folderBtn);
                        visibleButtons.push(folderBtn);
                        addedFolders.push(folder.id);
                    }
                } else if (item.type === 'button') {
                    var btn = filteredButtons.find(function(b) { return getBtnIdentifier(b) === item.id; });
                    if (btn && !btn.hasClass('hidden')) {
                        targetContainer.append(btn);
                        visibleButtons.push(btn);
                        addedButtons.push(getBtnIdentifier(btn));
                    }
                }
            });

            filteredButtons.forEach(function(btn) {
                var btnId = getBtnIdentifier(btn);
                if (addedButtons.indexOf(btnId) === -1 && !btn.hasClass('hidden')) {
                    var insertBefore = null;
                    var btnType = detectBtnCategory(btn);
                    var typeOrder = ['online', 'torrent', 'trailer', 'shots', 'book', 'reaction', 'subscribe', 'other'];
                    var btnTypeIndex = typeOrder.indexOf(btnType);
                    if (btnTypeIndex === -1) btnTypeIndex = 999;

                    if (btnId === 'modss_online_button' || btnId === 'showy_online_button') {
                        var firstNonPriority = targetContainer.find('.full-start__button').not('.button--edit-order, .button--folder').filter(function() {
                            var id = getBtnIdentifier($(this));
                            return id !== 'modss_online_button' && id !== 'showy_online_button';
                        }).first();

                        if (firstNonPriority.length) {
                            insertBefore = firstNonPriority;
                        }

                        if (btnId === 'showy_online_button') {
                            var modsBtn = targetContainer.find('.full-start__button').filter(function() {
                                return getBtnIdentifier($(this)) === 'modss_online_button';
                            });
                            if (modsBtn.length) {
                                insertBefore = modsBtn.next();
                                if (!insertBefore.length || insertBefore.hasClass('button--edit-order')) {
                                    insertBefore = null;
                                }
                            }
                        }
                    } else {
                        targetContainer.find('.full-start__button').not('.button--edit-order, .button--folder').each(function() {
                            var existingBtn = $(this);
                            var existingId = getBtnIdentifier(existingBtn);

                            if (existingId === 'modss_online_button' || existingId === 'showy_online_button') {
                                return true;
                            }

                            var existingType = detectBtnCategory(existingBtn);
                            var existingTypeIndex = typeOrder.indexOf(existingType);
                            if (existingTypeIndex === -1) existingTypeIndex = 999;

                            if (btnTypeIndex < existingTypeIndex) {
                                insertBefore = existingBtn;
                                return false;
                            }
                        });
                    }

                    if (insertBefore && insertBefore.length) {
                        btn.insertBefore(insertBefore);
                    } else {
                        targetContainer.append(btn);
                    }
                    visibleButtons.push(btn);
                }
            });

            folders.forEach(function(folder) {
                if (addedFolders.indexOf(folder.id) === -1) {
                    var folderBtn = createFolderButton(folder);
                    targetContainer.append(folderBtn);
                    visibleButtons.push(folderBtn);
                }
            });
        } else {
            folders.forEach(function(folder) {
                var folderBtn = createFolderButton(folder);
                targetContainer.append(folderBtn);
                visibleButtons.push(folderBtn);
            });

            filteredButtons.forEach(function(btn) {
                if (!btn.hasClass('hidden')) {
                    targetContainer.append(btn);
                    visibleButtons.push(btn);
                }
            });
        }

        var editButton = buildEditorBtn();
        targetContainer.append(editButton);
        visibleButtons.push(editButton);

        animateBtnFadeIn(visibleButtons);

        setTimeout(function() {
            setupButtonNavigation(container);
        }, 100);

        return true;
    }

    function setupButtonNavigation(container) {
        // Lampa автоматически обрабатывает навигацию для flex-wrap: wrap.
        // Здесь только принудительно обновляем контроллер.
        if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
            try {
                Lampa.Controller.toggle('full_start');
            } catch(e) {}
        }
    }

    function refreshController() {
        if (!Lampa.Controller || typeof Lampa.Controller.toggle !== 'function') return;

        setTimeout(function() {
            try {
                Lampa.Controller.toggle('full_start');
            } catch(e) {}
        }, 50);
    }

    function init() {
        var style = $('<style>' +
            '@keyframes button-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }' +
            '.btns-plugin-open .modal .modal__content { max-width: 27.5em !important; width: 27.5em !important; margin-left: auto !important; margin-right: auto !important; left: 50% !important; transform: translateX(-50%) !important; position: relative !important; }' +
            '.btns-plugin-open .modal .modal__body { max-height: 78vh !important; overflow-y: auto !important; }' +
            '@media screen and (max-width: 520px) { .btns-plugin-open .modal .modal__content { width: 96vw !important; max-width: 96vw !important; left: 2vw !important; transform: none !important; margin-left: 0 !important; margin-right: 0 !important; } }' +
            '.full-start-new__buttons .full-start__button { opacity: 0; }' +
            '.full-start__button.hidden { display: none !important; }' +
            '.button--folder { cursor: pointer; }' +
            '.full-start-new__buttons { ' +
                'display: flex !important; ' +
                'flex-direction: row !important; ' +
                'flex-wrap: wrap !important; ' +
                'gap: 0.5em !important; ' +
            '}' +
            '.full-start-new__buttons.buttons-loading .full-start__button { visibility: hidden !important; }' +
            '.menu-edit-list__create-folder, .menu-edit-list__icon-color-global, .view-mode-banner { background: rgba(255,255,255,0.1); border: 2px solid transparent; border-radius: 0.4em; margin-bottom: 0.6em; }' +
            '.menu-edit-list__create-folder.focus, .menu-edit-list__icon-color-global.focus, .view-mode-banner.focus { border-color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.16); }' +
            '.menu-edit-list__delete { width: 1.95em; height: 1.95em; display: flex; align-items: center; justify-content: center; cursor: pointer; }' +
            '.menu-edit-list__delete svg { width: 1.0em !important; height: 1.0em !important; }' +
            '.menu-edit-list__delete.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.folder-item .menu-edit-list__move { margin-right: 0; }' +
            '.folder-create-confirm { background: rgba(100,200,100,0.3); margin-top: 1em; border-radius: 0.3em; }' +
            '.folder-create-confirm.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.folder-reset-button { background: rgba(200,100,100,0.3); margin-top: 1em; border-radius: 0.3em; }' +
            '.folder-reset-button.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.folder-save-button { background: #29b765; margin-top: 0.9em; border-radius: 0.35em; color: #fff; }' +
            '.folder-save-button.focus { border: 3px solid rgba(255,255,255,0.9); }' +
            '.folder-save-button > div { letter-spacing: 0.01em; }' +
            '.menu-edit-list__move { width: 1.95em; height: 1.95em; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 0.2em; }' +
            '.menu-edit-list__move svg { width: 0.95em !important; height: 0.95em !important; }' +
            '.menu-edit-list__move.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.menu-edit-list__toggle { width: 1.95em; height: 1.95em; display: flex; align-items: center; justify-content: center; cursor: pointer; }' +
            '.menu-edit-list__toggle svg { width: 1.0em !important; height: 1.0em !important; }' +
            '.menu-edit-list__toggle.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.menu-edit-list__display-mode { width: 1.95em; height: 1.95em; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 0.2em; }' +
            '.menu-edit-list__display-mode svg { width: 1.0em !important; height: 1.0em !important; }' +
            '.menu-edit-list__display-mode.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; background: rgba(255,255,255,0.9); }' +
            '.menu-edit-list__display-mode.focus svg { color: #000 !important; }' +
            '.menu-edit-list__display-mode.focus rect { stroke: #000 !important; }' +
            '.menu-edit-list__display-mode.focus text { fill: #000 !important; }' +
            '.menu-edit-list__rename, .menu-edit-list__icon-change, .menu-edit-list__icon-color { width: 1.95em; height: 1.95em; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 0.18em; flex-shrink: 0; }' +
            '.menu-edit-list__rename svg, .menu-edit-list__icon-change svg, .menu-edit-list__icon-color svg { width: 1.0em !important; height: 1.0em !important; }' +
            '.menu-edit-list__rename.focus, .menu-edit-list__icon-change.focus, .menu-edit-list__icon-color.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.menu-edit-list__rename.disabled-control { opacity: 0.28; }' +
            '.buttons-order-wrap { width: 100%; max-width: 26em; margin: 0 auto; box-sizing: border-box; }' +
            '.buttons-order-actions { margin-top: 0.7em; }' +
            '.buttons-order-actions .folder-reset-button { margin-top: 0; }' +
            '.buttons-order-actions .folder-save-button { margin-top: 0.55em; }' +
            '.buttons-order-wrap__footer { margin-top: 0.75em; text-align: center; font-size: 0.76em; opacity: 0.6; letter-spacing: 0.01em; }' +
            '.icon-picker-wrap { width: 100%; max-width: 26em; margin: 0 auto; box-sizing: border-box; }' +
            '.icon-color-wrap { width: 100%; max-width: 26em; margin: 0 auto; box-sizing: border-box; }' +
            '.icon-picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(3.2em, 1fr)); gap: 0.5em; margin-top: 0.8em; }' +
            '.icon-picker-item { height: 3.5em; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.06); border-radius: 0.45em; }' +
            '.icon-picker-item svg { width: 1.6em !important; height: 1.6em !important; }' +
            '.icon-picker-item.focus { border: 2px solid rgba(255,255,255,0.85); }' +
            '.icon-picker-item.active { box-shadow: 0 0 0 2px #29b765 inset; }' +
            '.icon-picker-grid .icon-picker-item--more { height: 3.5em !important; min-height: 3.5em; max-height: 3.5em; padding: 0 !important; }' +
            '.icon-picker-item--more svg { width: 1.6em !important; height: 1.6em !important; }' +
            '.icon-picker-default { margin-bottom: 0.7em; }' +
            '.icon-color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(2.2em, 1fr)); gap: 0.6em; margin-top: 0.9em; }' +
            '.icon-color-item { width: 2.3em; height: 2.3em; border-radius: 50%; display: flex; align-items: center; justify-content: center; }' +
            '.icon-color-item.focus { outline: 3px solid rgba(255,255,255,0.9); outline-offset: 2px; }' +
            '.icon-color-item.active { outline: 3px solid #29b765; outline-offset: 2px; }' +
            '.icon-color-dot { width: 2.1em; height: 2.1em; border-radius: 50%; }' +
            '.icon-color-dot-preview { width: 1.8em; height: 1.8em; border-radius: 50%; background: rgba(255,255,255,0.6); border: 2px solid rgba(255,255,255,0.8); }' +
            '.icon-color-hex .menu-edit-list__value { margin-left: auto; opacity: 0.65; }' +
            '.view-mode-banner { padding: 0.7em 1em; cursor: pointer; }' +
            '.view-mode-banner__title { font-size: 1.0em; margin-bottom: 0.2em; }' +
            '.view-mode-banner__hint { font-size: 0.78em; opacity: 0.55; }' +
            '.menu-edit-list__create-folder { margin-bottom: 1em; }' +
            '.menu-edit-list { max-height: none; overflow-y: visible; padding-right: 0.15em; }' +
            '.menu-edit-list__item { display: flex; align-items: center; position: relative; margin-bottom: 0.38em; padding: 0.08em 0.2em; border-radius: 0.35em; min-width: 0; }' +
            '.menu-edit-list__item:nth-child(odd) { background: rgba(255,255,255,0.07); }' +
            '.menu-edit-list__item .menu-edit-list__icon { flex-shrink: 0; }' +
            '.menu-edit-list__item .menu-edit-list__title { flex: 0 1 9em; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 0.25em; font-size: 1.0em; }' +
            '.menu-edit-list__item .menu-edit-list__rename, .menu-edit-list__item .menu-edit-list__icon-change, .menu-edit-list__item .menu-edit-list__icon-color, .menu-edit-list__item .menu-edit-list__move, .menu-edit-list__item .menu-edit-list__display-mode, .menu-edit-list__item .menu-edit-list__toggle { flex-shrink: 0; }' +
            '.menu-edit-list__item.item-hidden { opacity: 0.4; }' +
            '.menu-edit-list__item.item-hidden .menu-edit-list__title { opacity: 0.6; }' +
            '.menu-edit-list__item.item-hidden .menu-edit-list__icon { opacity: 0.5; }' +
            '' +
            '/* Режим 1: Стандартный (иконка, текст при наведении) */' +
            '.full-start__button.button-mode-1 .text-wrapper { display: none !important; }' +
            '.full-start__button.button-mode-1:hover .text-wrapper, .full-start__button.button-mode-1.focus .text-wrapper { display: inline !important; }' +
            '.full-start__button.button-mode-1 > span:not(.text-wrapper) { opacity: 0 !important; transition: opacity 0.3s; }' +
            '.full-start__button.button-mode-1:hover > span:not(.text-wrapper), .full-start__button.button-mode-1.focus > span:not(.text-wrapper) { opacity: 1 !important; }' +
            '' +
            '/* Режим 2: Только иконка (текст всегда скрыт) */' +
            '.full-start__button.button-mode-2 .text-wrapper { display: none !important; }' +
            '.full-start__button.button-mode-2 > span:not(.text-wrapper) { display: none !important; }' +
            '' +
            '/* Режим 3: Иконка + текст всегда */' +
            '.full-start__button.button-mode-3 .text-wrapper { display: inline !important; }' +
            '.full-start__button.button-mode-3 > span:not(.text-wrapper) { opacity: 1 !important; display: inline !important; }' +
        '</style>');
        $('body').append(style);

        Lampa.Listener.follow('full', function(e) {
            if (e.type !== 'complite') return;

            var container = e.object.activity.render();
            var targetContainer = container.find('.full-start-new__buttons');
            if (targetContainer.length) {
                targetContainer.addClass('buttons-loading');
            }

            setTimeout(function() {
                try {
                    if (!container.data('buttons-processed')) {
                        container.data('buttons-processed', true);
                        if (reorderButtons(container)) {
                            if (targetContainer.length) {
                                targetContainer.removeClass('buttons-loading');
                            }
                            refreshController();
                        }
                    }
                } catch(err) {
                    if (targetContainer.length) {
                        targetContainer.removeClass('buttons-loading');
                    }
                }
            }, 400);
        });
    }

    // Добавляем настройку в раздел «Интерфейс»
    if (Lampa.SettingsApi) {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'buttons_editor_enabled',
                type: 'trigger',
                default: true
            },
            field: {
                name: getTranslation('buttons_plugin_button_editor')
            },
            onChange: function(value) {
                setTimeout(function() {
                    var currentValue = Lampa.Storage.get('buttons_editor_enabled', true);
                    if (currentValue) {
                        $('.button--edit-order').show();
                        Lampa.Noty.show(getTranslation('buttons_plugin_button_editor_enabled'));
                    } else {
                        $('.button--edit-order').hide();
                        Lampa.Noty.show(getTranslation('buttons_plugin_button_editor_disabled'));
                    }
                }, 100);
            },
            onRender: function(element) {
                setTimeout(function() {
                    // Вставляем после «Показать реакции» в разделе «Карточка»
                    var reactionsParam = $('div[data-name="card_interfice_reactions"]');
                    if (reactionsParam.length) {
                        reactionsParam.after(element);
                    } else {
                        // Резервный вариант: вставляем после «Размер интерфейса»
                        $('div[data-name="interface_size"]').after(element);
                    }
                }, 0);
            }
        });
    }

    init();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {};
    }
})();
