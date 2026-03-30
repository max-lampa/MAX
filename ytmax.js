/**
 * Kinooglad (Кінообзор) — Standalone Lampa Plugin
 * YouTube channel browser: add channels, browse videos, play via Lampa player.
 *
 * Extracted from for_1774758286111.js by cleanup pass.
 * Settings registered under own component 'kinooglad_plugin'.
 *
 * Install: paste URL into Lampa → Settings → Plugins.
 *
 * Changes:
 * - Added external player support (opens YouTube in external app/browser)
 * - Removed buffering loader (instant playback start, no waiting animation)
 */
(function () {
    'use strict';

    if (window.plugin_kinoohlyad_ready) return;

    // =========================================================
    // i18n
    // =========================================================
    var I18N = {
        loading_trailer:              { uk: 'Завантаження трейлера...',             ru: 'Загрузка трейлера...',              en: 'Loading trailer...',                    pl: 'Ładowanie zwiastuna...' },
        settings_kinooglad_name:      { uk: 'Кіноогляд',                           ru: 'Кинообзор',                         en: 'Movie review',                          pl: 'Przegląd filmowy' },
        settings_kinooglad_desc:      { uk: 'Увімкнути розділ Кіноогляд у меню.',  ru: 'Включить раздел Кинообзор в меню.', en: 'Enable Movie review section in menu.',  pl: 'Włącz sekcję Przegląd filmowy w menu.' },
        kino_settings_title:          { uk: 'Кіноогляд: Налаштування каналів YouTube', ru: 'Кинообзор: Настройки каналов YouTube', en: 'Movie review: YouTube channels settings', pl: 'Przegląd filmowy: ustawienia kanałów YouTube' },
