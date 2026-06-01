// themes.js — структура плагина MaksTV для Lampa

(function() {
    'use strict';

    // 1. Конфигурация плагина
    var PLUGIN_KEY  = 'makstv_themes';
    var PLUGIN_NAME = 'MaksTV Темы';

    // 2. Иконки как SVG data-URI (хранятся прямо в JS)
    var SVG_BRUSH = "data:image/svg+xml;utf8,<svg ...></svg>";

    // 3. Цветовые палитры (6 тем × параметры цветов)
    var COLORS = { red: {...}, green: {...}, violet: {...}, ... };

    // 4. Стили интерфейса (Focus Pack / Color Gallery / Gradient)
    var STYLES = { focus: {...}, gallery: {...}, gradient: {...} };

    // 5. Генератор CSS — строит стили по выбранным цвету и стилю
    function buildCSS(colorKey, styleKey) { ... }

    // 6. Применение CSS в <style> тег документа
    function applyTheme(colorKey, styleKey) { ... }

    // 7. Сохранение/загрузка настроек через Lampa.Storage
    function saveSettings(color, style) { ... }
    function loadSettings() { ... }

    // 8. Меню выбора (Lampa.Select — навигация пультом)
    function openThemeMenu() {
        Lampa.Select.show({ items: [...], onSelect: ... });
    }

    // 9. Регистрация в Настройки → Интерфейс
    function registerSettings() {
        Lampa.Settings.listener.follow('open', function(e) {
            if (e.name !== 'interface') return;
            // Добавляем кнопку "MaksTV — Выбор темы"
        });
    }

    // 10. Инициализация (ждём готовности Lampa)
    if (window.appready) init();
    else Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') init();
    });

})();