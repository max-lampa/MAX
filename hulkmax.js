(function () { 'use strict'; if (window.lampac_theme_plugin) return; var STORAGE_KEY = 'lampac_theme'; var STYLE_ID = 'lampac-theme-style'; var ALL_CLASSES = ['neon--theme', 'aurora--theme', 'gold--theme', 'mono--theme', 'sunset--theme', 'glass--theme', 'appletv--theme', 'hulk--theme', 'vampire--theme', 'carbon--theme']; 

function buildCSS(o) { 
    var B = 'body.' + o.cls; 
    return [
        B + ' { background: ' + o.bg + ' !important; color: ' + o.text + '; }',
        B + '.black--style { background: ' + o.bgBlack + ' !important; }',
        B + ' .head__body { background: linear-gradient(180deg, ' + o.bgA95 + ' 0%, ' + o.bgA0 + ' 100%); }',
        B + ' .head__action.focus { background: ' + o.grad + '; color: ' + o.gradText + '; }',
        B + '.menu--open .wrap__left { background: ' + o.sidebarBg + '; backdrop-filter: blur(24px); border-right: 1px solid ' + o.accentA08 + '; }',
        B + ' .menu__item.focus { background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; box-shadow: 0 4px 20px ' + o.accentA25 + '; }',
        B + ' .menu__item.focus .menu__ico [stroke] { stroke: ' + o.gradText + ' !important; }',
        B + ' .menu__item.focus .menu__ico [fill] { fill: ' + o.gradText + ' !important; }',
        B + ' .items-line__title { color: ' + o.accent + '; font-weight: 700; text-transform: uppercase; }',
        B + ' .card.focus .card__view::after { border-color: ' + o.accent + '; box-shadow: 0 0 20px ' + o.accentA35 + '; }',
        B + ' .card__quality { background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; border: none !important; }',
        B + ' .full-start__button, ' + B + ' .full-start-new__button, ' + B + ' .simple-button.focus {' +
        ' background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; border: none !important; border-radius: 0.8em !important; font-weight: 700 !important; box-shadow: 0 4px 15px ' + o.accentA25 + ' !important; }',
        B + ' .full-start__button.focus, ' + B + ' .full-start-new__button.focus { transform: scale(1.05) !important; filter: brightness(1.2) !important; box-shadow: 0 6px 25px ' + o.accentA50 + ' !important; }',
        B + ' .player-panel .button.focus { background: ' + o.grad + '; color: ' + o.gradText + '; }',
        B + ' .time-line > div, .player-panel__position { background: ' + o.grad + ' !important; }',
        B + ' .settings__content, .selectbox__content, .modal__content { background: ' + o.modalBg + '; backdrop-filter: blur(32px); border: 1px solid ' + o.accentA08 + '; }',
        B + ' .selectbox-item.focus { background: ' + o.grad + '; color: ' + o.gradText + '; }'
    ].join('\n'); 
}

var THEMES = {
    hulk: buildCSS({ cls: 'hulk--theme', bg: '#061008', bgBlack: '#030804', text: '#e2f4e6', accent: '#00e676', grad: 'linear-gradient(135deg, #00e676, #00bfa5)', gradText: '#000', sidebarBg: 'rgba(6,16,8,0.85)', modalBg: 'rgba(6,16,8,0.95)', bgA0: 'rgba(6,16,8,0)', bgA95: 'rgba(6,16,8,0.95)', accentA08: 'rgba(0,230,118,0.08)', accentA25: 'rgba(0,230,118,0.25)', accentA35: 'rgba(0,230,118,0.35)', accentA50: 'rgba(0,230,118,0.5)' }),
    neon: buildCSS({ cls: 'neon--theme', bg: '#060b18', bgBlack: '#030610', text: '#e2e8f4', accent: '#00e5ff', grad: 'linear-gradient(135deg, #00e5ff, #7c4dff)', gradText: '#fff', sidebarBg: 'rgba(8,14,30,0.85)', modalBg: 'rgba(8,14,30,0.95)', bgA0: 'rgba(6,11,24,0)', bgA95: 'rgba(6,11,24,0.95)', accentA08: 'rgba(0,229,255,0.08)', accentA25: 'rgba(0,229,255,0.25)', accentA35: 'rgba(0,229,255,0.35)', accentA50: 'rgba(0,229,255,0.5)' }),
    vampire: buildCSS({ cls: 'vampire--theme', bg: '#120505', bgBlack: '#080202', text: '#fceaea', accent: '#ff1744', grad: 'linear-gradient(135deg, #ff1744, #b71c1c)', gradText: '#fff', sidebarBg: 'rgba(18,5,5,0.85)', modalBg: 'rgba(18,5,5,0.95)', bgA0: 'rgba(18,5,5,0)', bgA95: 'rgba(18,5,5,0.95)', accentA08: 'rgba(255,23,68,0.08)', accentA25: 'rgba(255,23,68,0.25)', accentA35: 'rgba(255,23,68,0.35)', accentA50: 'rgba(255,23,68,0.5)' }),
    aurora: buildCSS({ cls: 'aurora--theme', bg: '#0d0618', bgBlack: '#060310', text: '#ece4f8', accent: '#c471ed', grad: 'linear-gradient(135deg, #c471ed, #12c2e9)', gradText: '#fff', sidebarBg: 'rgba(13,6,24,0.85)', modalBg: 'rgba(13,6,24,0.95)', bgA0: 'rgba(13,6,24,0)', bgA95: 'rgba(13,6,24,0.95)', accentA08: 'rgba(196,113,237,0.08)', accentA25: 'rgba(196,113,237,0.25)', accentA35: 'rgba(196,113,237,0.35)', accentA50: 'rgba(196,113,237,0.5)' }),
    gold: buildCSS({ cls: 'gold--theme', bg: '#110d08', bgBlack: '#0a0705', text: '#f0e8dc', accent: '#d4a853', grad: 'linear-gradient(135deg, #f6d365, #d4a853)', gradText: '#1a1208', sidebarBg: 'rgba(17,13,8,0.85)', modalBg: 'rgba(17,13,8,0.95)', bgA0: 'rgba(17,13,8,0)', bgA95: 'rgba(17,13,8,0.95)', accentA08: 'rgba(212,168,83,0.08)', accentA25: 'rgba(212,168,83,0.25)', accentA35: 'rgba(212,168,83,0.35)', accentA50: 'rgba(212,168,83,0.5)' }),
    carbon: buildCSS({ cls: 'carbon--theme', bg: '#141414', bgBlack: '#0a0a0a', text: '#e0e0e0', accent: '#ffffff', grad: 'linear-gradient(135deg, #424242, #212121)', gradText: '#fff', sidebarBg: 'rgba(20,20,20,0.85)', modalBg: 'rgba(20,20,20,0.95)', bgA0: 'rgba(20,20,20,0)', bgA95: 'rgba(20,20,20,0.95)', accentA08: 'rgba(255,255,255,0.08)', accentA25: 'rgba(255,255,255,0.25)', accentA35: 'rgba(255,255,255,0.35)', accentA50: 'rgba(255,255,255,0.5)' }),
    sunset: buildCSS({ cls: 'sunset--theme', bg: '#120a06', bgBlack: '#080503', text: '#fceee8', accent: '#ff7043', grad: 'linear-gradient(135deg, #ff7043, #f4511e)', gradText: '#fff', sidebarBg: 'rgba(18,10,6,0.85)', modalBg: 'rgba(18,10,6,0.95)', bgA0: 'rgba(18,10,6,0)', bgA95: 'rgba(18,10,6,0.95)', accentA08: 'rgba(255,112,67,0.08)', accentA25: 'rgba(255,112,67,0.25)', accentA35: 'rgba(255,112,67,0.35)', accentA50: 'rgba(255,112,67,0.5)' }),
    mono: buildCSS({ cls: 'mono--theme', bg: '#000000', bgBlack: '#000000', text: '#ffffff', accent: '#ffffff', grad: 'linear-gradient(180deg, #ffffff, #cccccc)', gradText: '#000', sidebarBg: 'rgba(10,10,10,0.9)', modalBg: 'rgba(5,5,5,0.98)', bgA0: 'rgba(0,0,0,0)', bgA95: 'rgba(0,0,0,0.95)', accentA08: 'rgba(255,255,255,0.08)', accentA25: 'rgba(255,255,255,0.25)', accentA35: 'rgba(255,255,255,0.35)', accentA50: 'rgba(255,255,255,0.5)' })
};

function applyTheme(name) {
    var existing = document.getElementById(STYLE_ID); if (existing) existing.remove();
    ALL_CLASSES.forEach(function (c) { document.body.classList.remove(c); });
    var css = THEMES[name];
    if (css) {
        var style = document.createElement('style'); style.id = STYLE_ID; style.textContent = css;
        document.head.appendChild(style); document.body.classList.add(name + '--theme');
    }
}

function startPlugin() {
    window.lampac_theme_plugin = true;
    Lampa.SettingsApi.addComponent({ component: 'theme', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67a.528.528 0 01-.13-.33c0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"/></svg>', name: 'Оформление' });
    Lampa.SettingsApi.addParam({
        component: 'theme',
        param: {
            name: STORAGE_KEY,
            type: 'select',
            values: {
                classic: 'Оригинал',
                hulk: 'Халк (Зелёная)',
                vampire: 'Кровавая (Красная)',
                neon: 'Неон (Синяя)',
                aurora: 'Аврора (Фиолет)',
                gold: 'Золото',
                sunset: 'Закат (Оранжевая)',
                carbon: 'Графит (Серая)',
                mono: 'Монохром'
            },
            default: 'classic'
        },
        field: { name: 'Выберите тему', description: 'Стиль интерфейса и кнопок' },
        onChange: function (v) { applyTheme(v); Lampa.Storage.set(STORAGE_KEY, v); }
    });
    applyTheme(Lampa.Storage.get(STORAGE_KEY, 'classic'));
}

if (window.appready) startPlugin();
else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });
})();
