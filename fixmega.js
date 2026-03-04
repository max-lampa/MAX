/**
 * Lampac Ultimate Theme Plugin
 * Full Version: Includes 10 Themes, Custom Editor, and Card Settings
 */
(function () { 
    'use strict'; 

    if (window.lampac_theme_plugin) return; 

    var STORAGE_KEY = 'lampac_theme'; 
    var STYLE_ID = 'lampac-theme-style'; 
    var ALL_CLASSES = ['neon--theme', 'aurora--theme', 'gold--theme', 'mono--theme', 'sunset--theme', 'glass--theme', 'appletv--theme', 'custom--theme', 'hulk--theme', 'vampire--theme', 'carbon--theme']; 

    // --- СЛОВАРИ ДЛЯ МЕНЮ ---
    var BG_NAMES = { black: 'Черный глубокий', charcoal: 'Угольный', navy: 'Темно-синий', deepblue: 'Полночь', purple: 'Баклажан', brown: 'Шоколад', wine: 'Винный' };
    var ACCENT_NAMES = { white: 'Белый', cyan: 'Циан', blue: 'Синий', purple: 'Фиолетовый', pink: 'Розовый', red: 'Красный', orange: 'Оранжевый', yellow: 'Желтый', green: 'Зеленый', teal: 'Бирюза', gold: 'Золото' };
    
    var CUSTOM_BG = { black: '#000000', charcoal: '#0c0c0c', navy: '#060b18', deepblue: '#08080c', purple: '#0d0618', brown: '#110d08', wine: '#140a0a' };
    var CUSTOM_ACCENT = { white: '#ffffff', cyan: '#00e5ff', blue: '#448aff', purple: '#b388ff', pink: '#ff80ab', red: '#ff5252', orange: '#ff6b35', yellow: '#ffd740', green: '#69f0ae', teal: '#64ffda', gold: '#d4a853' };

    function hexRgb(hex) { 
        var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); 
        return [r, g, b]; 
    }
    
    function cR(hex, a) { 
        var c = hexRgb(hex); 
        return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; 
    }

    // --- ПОЛНЫЙ ГЕНЕРАТОР CSS ---
    function buildCSS(o) { 
        var B = 'body.' + o.cls; 
        return [
            B + ' { background: ' + o.bg + ' !important; color: ' + o.text + '; }',
            B + '.black--style { background: ' + o.bgBlack + ' !important; }',
            B + ' .head__body { background: linear-gradient(180deg, ' + o.bgA95 + ' 0%, ' + o.bgA0 + ' 100%); padding-bottom: 2em; }',
            B + ' .head__action.focus, ' + B + ' .head__action.hover { background: ' + o.grad + '; color: ' + o.gradText + '; }',
            B + '.menu--open .wrap__left { background: ' + o.sidebarBg + '; backdrop-filter: blur(24px); border-right: 1px solid ' + o.accentA08 + '; }',
            B + ' .menu__item.focus, ' + B + ' .menu__item.hover { background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; box-shadow: 0 4px 20px ' + o.accentA25 + '; }',
            B + ' .items-line__title { font-weight: 700; background: linear-gradient(90deg, ' + o.text + ' 0%, ' + o.accentA70 + ' 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }',
            B + ' .card.focus .card__view::after { border-color: ' + o.accent + '; box-shadow: 0 0 20px ' + o.accentA35 + '; }',
            B + ' .card__quality { background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; font-weight: 700; }',
            B + ' .full-start__button.focus, ' + B + ' .full-start-new__button.focus, ' + B + ' .simple-button.focus, ' + B + ' .selectbox-item.focus { background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; box-shadow: 0 4px 15px ' + o.accentA30 + ' !important; }',
            B + ' .settings__content, ' + B + ' .modal__content { background: ' + o.panelBg + '; backdrop-filter: blur(32px); border: 1px solid ' + o.accentA08 + '; }',
            B + ' .time-line > div, ' + B + ' .player-panel__position { background: ' + o.grad + ' !important; }'
        ].join('\n'); 
    }

    // --- ПРЕСЕТЫ ---
    var THEMES = {
        neon: buildCSS({ cls: 'neon--theme', bg: '#060b18', bgBlack: '#030610', text: '#e2e8f4', accent: '#00e5ff', grad: 'linear-gradient(135deg, #00e5ff, #7c4dff)', gradText: '#fff', sidebarBg: 'rgba(8,14,30,0.85)', panelBg: 'rgba(8,14,30,0.92)', bgA0: 'rgba(6,11,24,0)', bgA95: 'rgba(6,11,24,0.95)', accentA08: 'rgba(0,229,255,0.08)', accentA25: 'rgba(0,229,255,0.25)', accentA30: 'rgba(0,229,255,0.3)', accentA35: 'rgba(0,229,255,0.35)', accentA70: 'rgba(0,229,255,0.7)' }),
        hulk: buildCSS({ cls: 'hulk--theme', bg: '#061008', bgBlack: '#030804', text: '#e2f4e6', accent: '#00e676', grad: 'linear-gradient(135deg, #00e676, #00bfa5)', gradText: '#000', sidebarBg: 'rgba(6,16,8,0.85)', panelBg: 'rgba(6,16,8,0.92)', bgA0: 'rgba(6,16,8,0)', bgA95: 'rgba(6,16,8,0.95)', accentA08: 'rgba(0,230,118,0.08)', accentA25: 'rgba(0,230,118,0.25)', accentA30: 'rgba(0,230,118,0.3)', accentA35: 'rgba(0,230,118,0.35)', accentA70: 'rgba(0,230,118,0.7)' }),
        vampire: buildCSS({ cls: 'vampire--theme', bg: '#120505', bgBlack: '#080202', text: '#fceaea', accent: '#ff1744', grad: 'linear-gradient(135deg, #ff1744, #b71c1c)', gradText: '#fff', sidebarBg: 'rgba(18,5,5,0.85)', panelBg: 'rgba(18,5,5,0.92)', bgA0: 'rgba(18,5,5,0)', bgA95: 'rgba(18,5,5,0.95)', accentA08: 'rgba(255,23,68,0.08)', accentA25: 'rgba(255,23,68,0.25)', accentA30: 'rgba(255,23,68,0.3)', accentA35: 'rgba(255,23,68,0.35)', accentA70: 'rgba(255,23,68,0.7)' }),
        carbon: buildCSS({ cls: 'carbon--theme', bg: '#141414', bgBlack: '#0a0a0a', text: '#e0e0e0', accent: '#ffffff', grad: 'linear-gradient(135deg, #424242, #212121)', gradText: '#fff', sidebarBg: 'rgba(20,20,20,0.85)', panelBg: 'rgba(20,20,20,0.92)', bgA0: 'rgba(20,20,20,0)', bgA95: 'rgba(20,20,20,0.95)', accentA08: 'rgba(255,255,255,0.08)', accentA25: 'rgba(255,255,255,0.25)', accentA30: 'rgba(255,255,255,0.3)', accentA35: 'rgba(255,255,255,0.35)', accentA70: 'rgba(255,255,255,0.7)' }),
        aurora: buildCSS({ cls: 'aurora--theme', bg: '#0d0618', bgBlack: '#060310', text: '#ece4f8', accent: '#c471ed', grad: 'linear-gradient(135deg, #12c2e9, #c471ed, #f64f59)', gradText: '#fff', sidebarBg: 'rgba(13,6,24,0.85)', panelBg: 'rgba(13,6,24,0.92)', bgA0: 'rgba(13,6,24,0)', bgA95: 'rgba(13,6,24,0.95)', accentA08: 'rgba(196,113,237,0.08)', accentA25: 'rgba(196,113,237,0.25)', accentA30: 'rgba(196,113,237,0.3)', accentA35: 'rgba(196,113,237,0.35)', accentA70: 'rgba(196,113,237,0.7)' }),
        glass: buildCSS({ cls: 'glass--theme', bg: '#08080c', bgBlack: '#040408', text: '#f5f5f7', accent: '#c8deff', grad: 'rgba(255,255,255,0.12)', gradText: '#fff', sidebarBg: 'rgba(255,255,255,0.06)', panelBg: 'rgba(25,25,30,0.85)', bgA0: 'rgba(8,8,12,0)', bgA95: 'rgba(8,8,12,0.95)', accentA08: 'rgba(200,222,255,0.15)', accentA25: 'rgba(200,222,255,0.25)', accentA30: 'rgba(200,222,255,0.3)', accentA35: 'rgba(200,222,255,0.35)', accentA70: 'rgba(200,222,255,0.7)' }),
        appletv: buildCSS({ cls: 'appletv--theme', bg: '#000000', bgBlack: '#000000', text: '#f5f5f7', accent: '#ffffff', grad: 'rgba(255,255,255,0.15)', gradText: '#fff', sidebarBg: 'rgba(0,0,0,0.92)', panelBg: 'rgba(28,28,30,0.88)', bgA0: 'rgba(0,0,0,0)', bgA95: 'rgba(0,0,0,0.95)', accentA08: 'rgba(255,255,255,0.08)', accentA25: 'rgba(255,255,255,0.25)', accentA30: 'rgba(255,255,255,0.3)', accentA35: 'rgba(255,255,255,0.35)', accentA70: 'rgba(255,255,255,0.7)' })
    };

    function buildCustomTheme() {
        var bgHex = CUSTOM_BG[Lampa.Storage.get('lampac_custom_bg', 'black')] || '#000000';
        var acHex = CUSTOM_ACCENT[Lampa.Storage.get('lampac_custom_accent', 'cyan')] || '#00e5ff';
        var ac2Hex = CUSTOM_ACCENT[Lampa.Storage.get('lampac_custom_accent2', 'purple')] || '#b388ff';
        return buildCSS({ cls: 'custom--theme', bg: bgHex, bgBlack: bgHex, text: '#f0f0f4', accent: acHex, grad: 'linear-gradient(135deg, ' + acHex + ', ' + ac2Hex + ')', gradText: '#fff', sidebarBg: cR(bgHex, 0.85), panelBg: cR(bgHex, 0.92), bgA0: cR(bgHex, 0), bgA95: cR(bgHex, 0.95), accentA08: cR(acHex, 0.08), accentA25: cR(acHex, 0.25), accentA30: cR(acHex, 0.3), accentA35: cR(acHex, 0.35), accentA70: cR(acHex, 0.7) });
    }

    function applyTheme(name) {
        var existing = document.getElementById(STYLE_ID); if (existing) existing.remove();
        ALL_CLASSES.forEach(function (c) { document.body.classList.remove(c); });
        var css = (name === 'custom') ? buildCustomTheme() : THEMES[name];
        if (css) {
            var style = document.createElement('style'); style.id = STYLE_ID; style.textContent = css;
            document.head.appendChild(style); document.body.classList.add(name + '--theme');
        }
    }

    function applyCardDisplay() {
        var id = 'lampac-card-display-style'; var ex = document.getElementById(id); if (ex) ex.remove();
        var radius = { small: '0.4em', medium: '1em', large: '1.6em' }[Lampa.Storage.get('lampac_card_radius', 'medium')];
        var style = document.createElement('style'); style.id = id;
        style.textContent = '.card__img, .card.focus .card__view::after { border-radius: ' + radius + ' !important; }';
        document.head.appendChild(style);
    }

    function startPlugin() {
        window.lampac_theme_plugin = true;
        Lampa.SettingsApi.addComponent({ component: 'theme_main', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>', name: 'Оформление' });
        Lampa.SettingsApi.addParam({ component: 'theme_main', param: { name: STORAGE_KEY, type: 'select', values: { classic: 'Классика', neon: 'Неон', aurora: 'Аврора', hulk: 'Халк', vampire: 'Вампир', carbon: 'Графит', gold: 'Золото', glass: 'Стекло', appletv: 'Apple TV', custom: 'Своя тема' }, default: 'classic' }, field: { name: 'Тема' }, onChange: applyTheme });
        Lampa.SettingsApi.addParam({ component: 'theme_main', param: { name: 'lampac_custom_bg', type: 'select', values: BG_NAMES, default: 'black' }, field: { name: 'Фон (Своя)' }, onChange: function() { applyTheme('custom'); } });
        Lampa.SettingsApi.addParam({ component: 'theme_main', param: { name: 'lampac_custom_accent', type: 'select', values: ACCENT_NAMES, default: 'cyan' }, field: { name: 'Акцент 1' }, onChange: function() { applyTheme('custom'); } });
        Lampa.SettingsApi.addParam({ component
