(function () { 'use strict'; if (window.lampac_theme_plugin) return; var STORAGE_KEY = 'lampac_theme'; var STYLE_ID = 'lampac-theme-style'; var ALL_CLASSES = ['neon--theme', 'aurora--theme', 'gold--theme', 'mono--theme', 'sunset--theme', 'glass--theme', 'appletv--theme', 'custom--theme', 'hulk--theme', 'vampire--theme', 'carbon--theme']; 

// ═══════════════════════════════════════════════════════════ // Theme CSS Generator // ═══════════════════════════════════════════════════════════ 
function buildCSS(o) { 
    var B = 'body.' + o.cls; 
    return [
        B + ' { background: ' + o.bg + ' !important; color: ' + o.text + '; }',
        B + '.black--style { background: ' + o.bgBlack + ' !important; }',
        B + ' .head__body { background: linear-gradient(180deg, ' + o.bgA95 + ' 0%, ' + o.bgA0 + ' 100%); padding-bottom: 2em; }',
        B + ' .head__title { font-weight: 600; letter-spacing: 0.02em; }',
        B + ' .head__action.focus, ' + B + ' .head__action.hover { background: ' + o.grad + '; color: ' + o.gradText + '; }',
        B + ' .head__action.active::after { background-color: ' + o.accent + '; border-color: ' + o.bg + '; }',
        B + '.menu--open .wrap__left { background: ' + o.sidebarBg + '; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-right: 1px solid ' + o.accentA08 + '; }',
        B + ' .menu__item { border-radius: 0.8em; margin: 0.15em 0.8em; transition: all 0.2s ease; }',
        B + ' .menu__item.focus, ' + B + ' .menu__item.traverse, ' + B + ' .menu__item.hover { background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; box-shadow: 0 4px 20px ' + o.accentA25 + '; }',
        B + ' .menu__item.focus .menu__ico [stroke], ' + B + ' .menu__item.focus .menu__ico path[fill], ' + B + ' .menu__item.focus .menu__ico rect[fill] { stroke: ' + o.gradText + ' !important; fill: ' + o.gradText + ' !important; }',
        B + ' .items-line__title { font-weight: 700; text-transform: uppercase; background: linear-gradient(90deg, ' + o.text + ' 0%, ' + o.accentA70 + ' 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }',
        B + ' .card__img { background-color: ' + o.cardBg + '; border-radius: 1.1em; }',
        B + ' .card.focus .card__view::after { border-color: ' + o.accent + '; box-shadow: 0 0 20px ' + o.accentA35 + ', 0 8px 32px rgba(0,0,0,0.5); border-radius: 1.5em; }',
        B + ' .card__quality { background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; font-weight: 700; }',
        
        // Кнопки и интерактив
        B + ' .full-start__button, ' + B + ' .full-start-new__button, ' + B + ' .simple-button.focus, ' + B + ' .selectbox-item.focus, ' + B + ' .selectbox-item.hover {' +
        ' background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; border: none !important; box-shadow: 0 4px 15px ' + o.accentA30 + ' !important; }',
        
        B + ' .settings__content, ' + B + ' .settings-input__content { background: ' + o.panelBg + '; backdrop-filter: blur(32px); border-left: 1px solid ' + o.accentA06 + '; }',
        B + ' .selectbox__content, ' + B + ' .modal__content { background: ' + o.modalBg + '; backdrop-filter: blur(32px); border: 1px solid ' + o.accentA08 + '; border-radius: 1.2em; }',
        B + ' .player-panel .button.focus { background: ' + o.grad + '; color: ' + o.gradText + '; }',
        B + ' .time-line > div, ' + B + ' .player-panel__position { background: ' + o.gradH + ' !important; }'
    ].join('\n'); 
}

// ═══════════════════════════════════════════════════════════ // Theme Definitions // ═══════════════════════════════════════════════════════════ 
var THEMES = {
    neon: buildCSS({ cls: 'neon--theme', bg: '#060b18', bgBlack: '#030610', text: '#e2e8f4', muted: '#8899bb', accent: '#00e5ff', accent2: '#7c4dff', grad: 'linear-gradient(135deg, #00e5ff, #7c4dff)', gradH: 'linear-gradient(90deg, #00e5ff, #7c4dff)', gradText: '#fff', cardBg: '#101828', sidebarBg: 'rgba(8,14,30,0.85)', panelBg: 'rgba(8,14,30,0.92)', modalBg: 'rgba(8,14,30,0.95)', bgA0: 'rgba(6,11,24,0)', bgA70: 'rgba(6,11,24,0.7)', bgA92: 'rgba(6,11,24,0.92)', bgA95: 'rgba(6,11,24,0.95)', accentA04: 'rgba(0,229,255,0.04)', accentA06: 'rgba(0,229,255,0.06)', accentA08: 'rgba(0,229,255,0.08)', accentA10: 'rgba(0,229,255,0.1)', accentA12: 'rgba(0,229,255,0.12)', accentA15: 'rgba(0,229,255,0.15)', accentA25: 'rgba(0,229,255,0.25)', accentA30: 'rgba(0,229,255,0.3)', accentA35: 'rgba(0,229,255,0.35)', accentA40: 'rgba(0,229,255,0.4)', accentA50: 'rgba(0,229,255,0.5)', accentA70: 'rgba(0,229,255,0.7)', }),
    aurora: buildCSS({ cls: 'aurora--theme', bg: '#0d0618', bgBlack: '#060310', text: '#ece4f8', muted: '#9988bb', accent: '#c471ed', accent2: '#12c2e9', grad: 'linear-gradient(135deg, #c471ed, #f64f59)', gradH: 'linear-gradient(90deg, #12c2e9, #c471ed, #f64f59)', gradText: '#fff', cardBg: '#170d28', sidebarBg: 'rgba(13,6,24,0.85)', panelBg: 'rgba(13,6,24,0.92)', modalBg: 'rgba(13,6,24,0.95)', bgA0: 'rgba(13,6,24,0)', bgA70: 'rgba(13,6,24,0.7)', bgA92: 'rgba(13,6,24,0.92)', bgA95: 'rgba(13,6,24,0.95)', accentA04: 'rgba(196,113,237,0.04)', accentA06: 'rgba(196,113,237,0.06)', accentA08: 'rgba(196,113,237,0.08)', accentA10: 'rgba(196,113,237,0.1)', accentA12: 'rgba(196,113,237,0.12)', accentA15: 'rgba(196,113,237,0.15)', accentA25: 'rgba(196,113,237,0.25)', accentA30: 'rgba(196,113,237,0.3)', accentA35: 'rgba(196,113,237,0.35)', accentA40: 'rgba(196,113,237,0.4)', accentA50: 'rgba(196,113,237,0.5)', accentA70: 'rgba(196,113,237,0.7)', }),
    hulk: buildCSS({ cls: 'hulk--theme', bg: '#061008', bgBlack: '#030804', text: '#e2f4e6', muted: '#88bb94', accent: '#00e676', accent2: '#00bfa5', grad: 'linear-gradient(135deg, #00e676, #00bfa5)', gradH: 'linear-gradient(90deg, #00e676, #00bfa5)', gradText: '#000', cardBg: '#0d2814', sidebarBg: 'rgba(6,16,8,0.85)', panelBg: 'rgba(6,16,8,0.92)', modalBg: 'rgba(6,16,8,0.95)', bgA0: 'rgba(6,16,8,0)', bgA70: 'rgba(6,16,8,0.7)', bgA92: 'rgba(6,16,8,0.92)', bgA95: 'rgba(6,16,8,0.95)', accentA04: 'rgba(0,230,118,0.04)', accentA06: 'rgba(0,230,118,0.06)', accentA08: 'rgba(0,230,118,0.08)', accentA10: 'rgba(0,230,118,0.1)', accentA12: 'rgba(0,230,118,0.12)', accentA15: 'rgba(0,230,118,0.15)', accentA25: 'rgba(0,230,118,0.25)', accentA30: 'rgba(0,230,118,0.3)', accentA35: 'rgba(0,230,118,0.35)', accentA40: 'rgba(0,230,118,0.4)', accentA50: 'rgba(0,230,118,0.5)', accentA70: 'rgba(0,230,118,0.7)', }),
    vampire: buildCSS({ cls: 'vampire--theme', bg: '#120505', bgBlack: '#080202', text: '#fceaea', muted: '#bb8888', accent: '#ff1744', accent2: '#b71c1c', grad: 'linear-gradient(135deg, #ff1744, #b71c1c)', gradH: 'linear-gradient(90deg, #ff1744, #b71c1c)', gradText: '#fff', cardBg: '#280d0d', sidebarBg: 'rgba(18,5,5,0.85)', panelBg: 'rgba(18,5,5,0.92)', modalBg: 'rgba(18,5,5,0.95)', bgA0: 'rgba(18,5,5,0)', bgA70: 'rgba(18,5,5,0.7)', bgA92: 'rgba(18,5,5,0.92)', bgA95: 'rgba(18,5,5,0.95)', accentA04: 'rgba(255,23,68,0.04)', accentA06: 'rgba(255,23,68,0.06)', accentA08: 'rgba(255,23,68,0.08)', accentA10: 'rgba(255,23,68,0.1)', accentA12: 'rgba(255,23,68,0.12)', accentA15: 'rgba(255,23,68,0.15)', accentA25: 'rgba(255,23,68,0.25)', accentA30: 'rgba(255,23,68,0.3)', accentA35: 'rgba(255,23,68,0.35)', accentA40: 'rgba(255,23,68,0.4)', accentA50: 'rgba(255,23,68,0.5)', accentA70: 'rgba(255,23,68,0.7)', }),
    carbon: buildCSS({ cls: 'carbon--theme', bg: '#141414', bgBlack: '#0a0a0a', text: '#e0e0e0', muted: '#888888', accent: '#ffffff', accent2: '#424242', grad: 'linear-gradient(135deg, #424242, #212121)', gradH: 'linear-gradient(90deg, #424242, #212121)', gradText: '#fff', cardBg: '#1f1f1f', sidebarBg: 'rgba(20,20,20,0.85)', panelBg: 'rgba(20,20,20,0.92)', modalBg: 'rgba(20,20,20,0.95)', bgA0: 'rgba(20,20,20,0)', bgA70: 'rgba(20,20,20,0.7)', bgA92: 'rgba(20,20,20,0.92)', bgA95: 'rgba(20,20,20,0.95)', accentA04: 'rgba(255,255,255,0.04)', accentA06: 'rgba(255,255,255,0.06)', accentA08: 'rgba(255,255,255,0.08)', accentA10: 'rgba(255,255,255,0.1)', accentA12: 'rgba(255,255,255,0.12)', accentA15: 'rgba(255,255,255,0.15)', accentA25: 'rgba(255,255,255,0.25)', accentA30: 'rgba(255,255,255,0.3)', accentA35: 'rgba(255,255,255,0.35)', accentA40: 'rgba(255,255,255,0.4)', accentA50: 'rgba(255,255,255,0.5)', accentA70: 'rgba(255,255,255,0.7)', }),
    gold: buildCSS({ cls: 'gold--theme', bg: '#110d08', bgBlack: '#0a0705', text: '#f0e8dc', muted: '#a89880', accent: '#d4a853', accent2: '#c47a30', grad: 'linear-gradient(135deg, #f6d365, #d4a853)', gradH: 'linear-gradient(90deg, #f6d365, #d4a853)', gradText: '#1a1208', cardBg: '#1e1710', sidebarBg: 'rgba(17,13,8,0.88)', panelBg: 'rgba(17,13,8,0.92)', modalBg: 'rgba(17,13,8,0.95)', bgA0: 'rgba(17,13,8,0)', bgA70: 'rgba(17,13,8,0.7)', bgA92: 'rgba(17,13,8,0.92)', bgA95: 'rgba(17,13,8,0.95)', accentA04: 'rgba(212,168,83,0.04)', accentA06: 'rgba(212,168,83,0.06)', accentA08: 'rgba(212,168,83,0.08)', accentA10: 'rgba(212,168,83,0.1)', accentA12: 'rgba(212,168,83,0.12)', accentA15: 'rgba(212,168,83,0.15)', accentA25: 'rgba(212,168,83,0.25)', accentA30: 'rgba(212,168,83,0.3)', accentA35: 'rgba(212,168,83,0.35)', accentA40: 'rgba(212,168,83,0.4)', accentA50: 'rgba(212,168,83,0.5)', accentA70: 'rgba(212,168,83,0.7)', }),
    mono: buildCSS({ cls: 'mono--theme', bg: '#000000', bgBlack: '#000000', text: '#f0f0f0', muted: '#777777', accent: '#ffffff', accent2: '#888888', grad: '#ffffff', gradH: '#ffffff', gradText: '#000000', cardBg: '#111111', sidebarBg: 'rgba(0,0,0,0.9)', panelBg: 'rgba(8,8,8,0.95)', modalBg: 'rgba(8,8,8,0.97)', bgA0: 'rgba(0,0,0,0)', bgA70: 'rgba(0,0,0,0.7)', bgA92: 'rgba(0,0,0,0.92)', bgA95: 'rgba(0,0,0,0.95)', accentA04: 'rgba(255,255,255,0.04)', accentA06: 'rgba(255,255,255,0.06)', accentA08: 'rgba(255,255,255,0.08)', accentA10: 'rgba(255,255,255,0.1)', accentA12: 'rgba(255,255,255,0.12)', accentA15: 'rgba(255,255,255,0.15)', accentA25: 'rgba(255,255,255,0.25)', accentA30: 'rgba(255,255,255,0.3)', accentA35: 'rgba(255,255,255,0.35)', accentA40: 'rgba(255,255,255,0.4)', accentA50: 'rgba(255,255,255,0.5)', accentA70: 'rgba(255,255,255,0.7)', }),
    sunset: buildCSS({ cls: 'sunset--theme', bg: '#140a0a', bgBlack: '#0a0505', text: '#f4e4e0', muted: '#bb8880', accent: '#ff6b35', accent2: '#e63946', grad: 'linear-gradient(135deg, #ff9a56, #e63946)', gradH: 'linear-gradient(90deg, #ffbe76, #ff6b35, #e63946)', gradText: '#fff', cardBg: '#241210', sidebarBg: 'rgba(20,10,10,0.88)', panelBg: 'rgba(20,10,10,0.92)', modalBg: 'rgba(20,10,10,0.95)', bgA0: 'rgba(20,10,10,0)', bgA70: 'rgba(20,10,10,0.7)', bgA92: 'rgba(20,10,10,0.92)', bgA95: 'rgba(20,10,10,0.95)', accentA04: 'rgba(255,107,53,0.04)', accentA06: 'rgba(255,107,53,0.06)', accentA08: 'rgba(255,107,53,0.08)', accentA10: 'rgba(255,107,53,0.1)', accentA12: 'rgba(255,107,53,0.12)', accentA15: 'rgba(255,107,53,0.15)', accentA25: 'rgba(255,107,53,0.25)', accentA30: 'rgba(255,107,53,0.3)', accentA35: 'rgba(255,107,53,0.35)', accentA40: 'rgba(255,107,53,0.4)', accentA50: 'rgba(255,107,53,0.5)', accentA70: 'rgba(255,107,53,0.7)', }),
    glass: buildCSS({ cls: 'glass--theme', bg: '#08080c', bgBlack: '#040408', text: '#f5f5f7', muted: '#86868b', accent: '#c8deff', accent2: '#6e6e73', grad: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(180,210,255,0.14))', gradH: 'linear-gradient(90deg, rgba(200,220,255,0.7), rgba(255,255,255,0.9))', gradText: '#fff', cardBg: 'rgba(255,255,255,0.05)', sidebarBg: 'rgba(255,255,255,0.06)', panelBg: 'rgba(255,255,255,0.07)', modalBg: 'rgba(255,255,255,0.08)', bgA0: 'rgba(8,8,12,0)', bgA70: 'rgba(8,8,12,0.7)', bgA92: 'rgba(8,8,12,0.92)', bgA95: 'rgba(8,8,12,0.95)', accentA04: 'rgba(200,222,255,0.04)', accentA06: 'rgba(200,222,255,0.06)', accentA08: 'rgba(200,222,255,0.1)', accentA10: 'rgba(200,222,255,0.12)', accentA12: 'rgba(200,222,255,0.15)', accentA15: 'rgba(200,222,255,0.18)', accentA25: 'rgba(200,222,255,0.25)', accentA30: 'rgba(200,222,255,0.3)', accentA35: 'rgba(200,222,255,0.35)', accentA40: 'rgba(200,222,255,0.4)', accentA50: 'rgba(200,222,255,0.5)', accentA70: 'rgba(200,222,255,0.7)', }) + '\n' + [ 
        'body.glass--theme::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(ellipse 80% 60% at 15% 50%, rgba(80,130,255,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 85% 20%, rgba(180,100,255,0.09) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 50% 90%, rgba(80,200,255,0.08) 0%, transparent 50%); }',
        'body.glass--theme .settings__content, body.glass--theme .settings-input__content, body.glass--theme .selectbox__content, body.glass--theme .modal__content { backdrop-filter: blur(56px) saturate(2) !important; -webkit-backdrop-filter: blur(56px) saturate(2) !important; border: 1px solid rgba(255,255,255,0.12) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(255,255,255,0.04), 0 24px 80px rgba(0,0,0,0.6); }',
        'body.glass--theme.menu--open .wrap__left { backdrop-filter: blur(56px) saturate(2) !important; -webkit-backdrop-filter: blur(56px) saturate(2) !important; border-right: 1px solid rgba(255,255,255,0.12) !important; box-shadow: inset -1px 0 0 rgba(255,255,255,0.06), 6px 0 40px rgba(0,0,0,0.4); }',
        'body.glass--theme .menu__item.focus, body.glass--theme .menu__item.traverse, body.glass--theme .menu__item.hover { backdrop-filter: blur(24px) saturate(1.6); -webkit-backdrop-filter: blur(24px) saturate(1.6); border: 1px solid rgba(255,255,255,0.15) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 24px rgba(0,0,0,0.35) !important; }',
        'body.glass--theme .full-start__button { border: 1px solid rgba(255,255,255,0.15) !important; border-radius: 0.8em; backdrop-filter: blur(20px) saturate(1.5); -webkit-backdrop-filter: blur(20px) saturate(1.5); background: rgba(255,255,255,0.07) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.1); }',
        'body.glass--theme .full-start__button.focus { border-color: rgba(255,255,255,0.25) !important; backdrop-filter: blur(28px) saturate(2) !important; -webkit-backdrop-filter: blur(28px) saturate(2) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 32px rgba(0,0,0,0.35) !important; }',
        'body.glass--theme .card__img { border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 4px 16px rgba(0,0,0,0.3); }',
        'body.glass--theme .card.focus .card__view { transform: scale(1.06); }',
        'body.glass--theme .card.focus .card__view::after { border-color: rgba(255,255,255,0.3) !important; box-shadow: 0 0 30px rgba(200,222,255,0.2), 0 12px 48px rgba(0,0,0,0.5) !important; border-radius: 1.6em; }',
        'body.glass--theme .navigation-bar__body { backdrop-filter: blur(56px) saturate(2) !important; -webkit-backdrop-filter: blur(56px) saturate(2) !important; border-top: 1px solid rgba(255,255,255,0.12) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 -8px 30px rgba(0,0,0,0.3); }',
    ].join('\n'),

    appletv: buildCSS({ cls: 'appletv--theme', bg: '#000000', bgBlack: '#000000', text: '#f5f5f7', muted: '#86868b', accent: '#e8e8ed', accent2: '#a1a1a6', grad: 'rgba(255,255,255,0.2)', gradH: 'rgba(255,255,255,0.25)', gradText: '#fff', cardBg: '#1c1c1e', sidebarBg: 'rgba(0,0,0,0.92)', panelBg: 'rgba(28,28,30,0.88)', modalBg: 'rgba(28,28,30,0.92)', bgA0: 'rgba(0,0,0,0)', bgA70: 'rgba(0,0,0,0.7)', bgA92: 'rgba(0,0,0,0.92)', bgA95: 'rgba(0,0,0,0.95)', accentA04: 'rgba(255,255,255,0.04)', accentA06: 'rgba(255,255,255,0.06)', accentA08: 'rgba(255,255,255,0.08)', accentA10: 'rgba(255,255,255,0.1)', accentA12: 'rgba(255,255,255,0.12)', accentA15: 'rgba(255,255,255,0.15)', accentA25: 'rgba(255,255,255,0.25)', accentA30: 'rgba(255,255,255,0.3)', accentA35: 'rgba(255,255,255,0.35)', accentA40: 'rgba(255,255,255,0.4)', accentA50: 'rgba(255,255,255,0.5)', accentA70: 'rgba(255,255,255,0.7)', }) + '\n' + [
        '@keyframes appleSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }',
        'body.appletv--theme .full-start__background.loaded { opacity: 0.85 !important; filter: none !important; object-fit: cover; width: 100%; height: 100%; }',
        'body.appletv--theme .full-start-new__left, body.appletv--theme .full-start__poster { display: none !important; }',
        'body.appletv--theme .full-start-new { position: relative; min-height: 92vh; display: flex; align-items: flex-end; }',
        'body.appletv--theme .full-start-new::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 75%; z-index: 0; pointer-events: none; background: linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.2) 65%, transparent 100%); }',
        'body.appletv--theme .full-start-new__body { position: relative; z-index: 1; width: 100%; padding: 0 2.5em 2em 2.5em !important; flex-direction: column !important; align-items: flex-start !important; }',
        'body.appletv--theme .full-start-new__title { font-weight: 800 !important; font-size: 3.6em !important; text-shadow: 0 4px 40px rgba(0,0,0,0.8); line-height: 1.0 !important; }',
        'body.appletv--theme .full-start__button { background: rgba(255,255,255,0.1) !important; border-radius: 2em !important; backdrop-filter: blur(14px); transition: all 0.25s cubic-bezier(.16,1,.3,1); }',
        'body.appletv--theme .full-start__button.focus { background: rgba(255,255,255,0.22) !important; transform: scale(1.05); box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important; }',
        'body.appletv--theme .menu__item.focus, body.appletv--theme .menu__item.traverse { background: rgba(255,255,255,0.12) !important; backdrop-filter: blur(14px) !important; border: 1px solid rgba(255,255,255,0.15) !important; }',
    ].join('\n'),
};

// ═══════════════════════════════════════════════════════════ // Custom Theme Engine // ═══════════════════════════════════════════════════════════ 
var CUSTOM_BG = { black: '#000000', charcoal: '#0c0c0c', navy: '#060b18', deepblue: '#08080c', purple: '#0d0618', brown: '#110d08', wine: '#140a0a' };
var CUSTOM_ACCENT = { white: '#ffffff', cyan: '#00e5ff', blue: '#448aff', purple: '#b388ff', pink: '#ff80ab', red: '#ff5252', orange: '#ff6b35', yellow: '#ffd740', green: '#69f0ae', teal: '#64ffda', gold: '#d4a853' };

function hexRgb(hex) { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; }
function cR(hex, a) { var c = hexRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

function buildCustomTheme() {
    var bgHex = CUSTOM_BG[Lampa.Storage.get('lampac_custom_bg', 'black')] || '#000000';
    var acHex = CUSTOM_ACCENT[Lampa.Storage.get('lampac_custom_accent', 'cyan')] || '#00e5ff';
    var ac2Hex = CUSTOM_ACCENT[Lampa.Storage.get('lampac_custom_accent2', 'purple')] || '#b388ff';
    var focusStyle = Lampa.Storage.get('lampac_custom_focus', 'gradient');
    var blurLvl = Lampa.Storage.get('lampac_custom_blur', 'medium');
    var cardFx = Lampa.Storage.get('lampac_custom_cards', 'both');
    var bR = hexRgb(bgHex), aR = hexRgb(acHex);
    var lum = (0.299 * aR[0] + 0.587 * aR[1] + 0.114 * aR[2]) / 255;
    var gradText = lum > 0.65 ? '#000' : '#fff';
    var grad, gradH;
    if (focusStyle === 'solid') { grad = acHex; gradH = acHex; } 
    else if (focusStyle === 'glass') { grad = 'linear-gradient(135deg, rgba(255,255,255,0.22), ' + cR(acHex, 0.12) + ')'; gradH = 'linear-gradient(90deg, ' + cR(acHex, 0.7) + ', rgba(255,255,255,0.9))'; gradText = '#fff'; } 
    else { grad = 'linear-gradient(135deg, ' + acHex + ', ' + ac2Hex + ')'; gradH = 'linear-gradient(90deg, ' + acHex + ', ' + ac2Hex + ')'; }
    
    var muted = 'rgb(' + Math.round(aR[0] * 0.4 + 128) + ',' + Math.round(aR[1] * 0.4 + 128) + ',' + Math.round(aR[2] * 0.4 + 128) + ')';
    var cardBg = 'rgb(' + Math.min(bR[0] + 18, 42) + ',' + Math.min(bR[1] + 18, 42) + ',' + Math.min(bR[2] + 18, 42) + ')';
    var bgBlack = 'rgb(' + Math.max(bR[0] - 4, 0) + ',' + Math.max(bR[1] - 4, 0) + ',' + Math.max(bR[2] - 4, 0) + ')';
    var sidebarBg = (focusStyle === 'glass') ? 'rgba(255,255,255,0.06)' : cR(bgHex, 0.85);

    var css = buildCSS({ cls: 'custom--theme', bg: bgHex, bgBlack: bgBlack, text: '#f0f0f4', muted: muted, accent: acHex, accent2: ac2Hex, grad: grad, gradH: gradH, gradText: gradText, cardBg: cardBg, sidebarBg: sidebarBg, panelBg: cR(bgHex, 0.92), modalBg: cR(bgHex, 0.95), bgA0: cR(bgHex, 0), bgA70: cR(bgHex, 0.7), bgA92: cR(bgHex, 0.92), bgA95: cR(bgHex, 0.95), accentA04: cR(acHex, 0.04), accentA06: cR(acHex, 0.06), accentA08: cR(acHex, 0.08), accentA10: cR(acHex, 0.1), accentA12: cR(acHex, 0.12), accentA15: cR(acHex, 0.15), accentA25: cR(acHex, 0.25), accentA30: cR(acHex, 0.3), accentA35: cR(acHex, 0.35), accentA40: cR(acHex, 0.4), accentA50: cR(acHex, 0.5), accentA70: cR(acHex, 0.7) });
    
    var extra = [], C = 'body.custom--theme';
    var blurMap = { none: 0, light: 16, medium: 32, heavy: 56 };
    var blurPx = blurMap[blurLvl] || 32;
    if (blurPx > 0) { var bf = 'blur(' + blurPx + 'px) saturate(1.5)'; extra.push( C + ' .settings__content, ' + C + ' .selectbox__content, ' + C + ' .modal__content { backdrop-filter: ' + bf + ' !important; -webkit-backdrop-filter: ' + bf + ' !important; }' ); }
    if (cardFx === 'scale' || cardFx === 'both') { extra.push(C + ' .card.focus .card__view { transform: scale(1.06); }'); }
    if (cardFx === 'glow' || cardFx === 'both') { extra.push(C + ' .card.focus .card__view::after { box-shadow: 0 0 25px ' + cR(acHex, 0.3) + ' !important; }'); }
    return css + '\n' + extra.join('\n');
}

// ─── Theme Application ──────────────────────────────────
function applyTheme(name) {
    var existing = document.getElementById(STYLE_ID); if (existing) existing.remove();
    var ambientEl = document.getElementById(STYLE_ID + '-ambient'); if (ambientEl) ambientEl.remove();
    ALL_CLASSES.forEach(function (c) { document.body.classList.remove(c); });
    var css = (name === 'custom') ? buildCustomTheme() : THEMES[name];
    if (css) {
        var style = document.createElement('style'); style.id = STYLE_ID; style.textContent = css;
        document.head.appendChild(style); document.body.classList.add(name + '--theme');
    }
}

// ─── Settings Registration ──────────────────────────────
function startPlugin() {
    window.lampac_theme_plugin = true;
    Lampa.Lang.add({ 
        lampac_theme_title: { ru: 'Оформление', en: 'Appearance' },
        lampac_theme_select: { ru: 'Тема оформления', en: 'Theme' }
    });

    Lampa.SettingsApi.addComponent({ component: 'theme', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67a.528.528 0 01-.13-.33c0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"/></svg>', name: Lampa.Lang.translate('lampac_theme_title') });
    
    Lampa.SettingsApi.addParam({
        component: 'theme',
        param: {
            name: STORAGE_KEY,
            type: 'select',
            values: { 
                classic: 'Классическая', 
                hulk: 'Халк (Зелёная)',
                vampire: 'Вампир (Кровавая)',
                carbon: 'Графит (Темная)',
                neon: 'Неон', 
                aurora: 'Аврора', 
                gold: 'Золото', 
                mono: 'Монохром', 
                sunset: 'Закат', 
                glass: 'Жидкое стекло', 
                appletv: 'Apple TV', 
                custom: 'Своя тема' 
            },
            default: 'classic'
        },
        field: { name: Lampa.Lang.translate('lampac_theme_select'), description: 'Выберите визуальный стиль приложения' },
        onChange: function (value) { applyTheme(value); Lampa.Storage.set(STORAGE_KEY, value); }
    });

    // Регистрация параметров для кастомной темы
    function refreshCustom() { if (Lampa.Storage.get(STORAGE_KEY, 'classic') === 'custom') applyTheme('custom'); }
    Lampa.SettingsApi.addParam({ component: 'theme', param: { name: 'lampac_custom_bg', type: 'select', values: CUSTOM_BG, default: 'black' }, field: { name: 'Цвет фона', description: 'Для кастомной темы' }, onChange: refreshCustom });
    Lampa.SettingsApi.addParam({ component: 'theme', param: { name: 'lampac_custom_accent', type: 'select', values: CUSTOM_ACCENT, default: 'cyan' }, field: { name: 'Основной акцент', description: 'Цвет кнопок и фокуса' }, onChange: refreshCustom });
    Lampa.SettingsApi.addParam({ component: 'theme', param: { name: 'lampac_custom_accent2', type: 'select', values: CUSTOM_ACCENT, default: 'purple' }, field: { name: 'Второй цвет', description: 'Для градиентов' }, onChange: refreshCustom });
    Lampa.SettingsApi.addParam({ component: 'theme', param: { name: 'lampac_custom_focus', type: 'select', values: { gradient: 'Градиент', solid: 'Сплошной', glass: 'Стекло' }, default: 'gradient' }, field: { name: 'Стиль фокуса' }, onChange: refreshCustom });

    // ─── Movie Screen & Card customization (ТВОИ НАСТРОЙКИ) ─────────────────────
    var CARD_STYLE_ID = 'lampac-card-display-style';
    function applyCardDisplay() {
        var existing = document.getElementById(CARD_STYLE_ID); if (existing) existing.remove();
        var rules = [];
        if (Lampa.Storage.get('lampac_card_quality', 'show') === 'hide') rules.push('.card__quality { display: none !important; }');
        if (Lampa.Storage.get('lampac_card_vote', 'show') === 'hide') rules.push('.card__vote { display: none !important; }');
        var radius = { small: '0.4em', medium: '1em', large: '1.6em', round: '2.2em' }[Lampa.Storage.get('lampac_card_radius', 'medium')];
        rules.push('.card__img { border-radius: ' + radius + ' !important; }');
        if (rules.length) { var style = document.createElement('style'); style.id = CARD_STYLE_ID; style.textContent = rules.join('\n'); document.head.appendChild(style); }
    }

    Lampa.SettingsApi.addComponent({ component: 'theme_cards', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>', name: 'Карточки' });
    Lampa.SettingsApi.addParam({ component: 'theme_cards', param: { name: 'lampac_card_radius', type: 'select', values: { small: 'Малое', medium: 'Среднее', large: 'Большое' }, default: 'medium' }, field: { name: 'Скругление карточек' }, onChange: applyCardDisplay });

    // Логика перемещения описания и исправления качества
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            var theme = Lampa.Storage.get(STORAGE_KEY, 'classic');
            if (theme === 'appletv') {
                setTimeout(function() {
                    var descr = document.querySelector('.full-descr__text');
                    var target = document.querySelector('.full-start-new__buttons');
                    if (descr && target && !target.parentNode.querySelector('.cinema-descr')) {
                        var clone = document.createElement('div'); clone.className = 'cinema-descr';
                        clone.textContent = descr.textContent.substring(0, 300) + '...';
                        target.parentNode.insertBefore(clone, target);
                    }
                }, 800);
            }
        }
    });

    applyTheme(Lampa.Storage.get(STORAGE_KEY, 'classic'));
    applyCardDisplay();
}

if (window.appready) startPlugin();
else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });
})();
