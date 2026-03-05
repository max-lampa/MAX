(function () {
  'use strict';

  if (window.lampac_theme_plugin) return;

  var STORAGE_KEY = 'lampac_theme';
  var STYLE_ID = 'lampac-theme-style';
  // Список всех классов тем (включая новые)
  var ALL_CLASSES = ['neon--theme', 'aurora--theme', 'gold--theme', 'mono--theme', 'sunset--theme', 'glass--theme', 'appletv--theme', 'emerald--theme', 'blood--theme', 'acid--theme', 'purple--theme', 'custom--theme'];

  // ═══════════════════════════════════════════════════════════
  //  Theme CSS Generator (Ваш оригинальный движок)
  // ═══════════════════════════════════════════════════════════
  function buildCSS(o) {
    var B = 'body.' + o.cls;
    return [
      B + ' { background: ' + o.bg + ' !important; color: ' + o.text + '; }',
      B + '.black--style { background: ' + o.bgBlack + ' !important; }',
      B + ' .head__body { background: linear-gradient(180deg, ' + o.bgA95 + ' 0%, ' + o.bgA0 + ' 100%); padding-bottom: 2em; }',
      B + ' .head__title { font-weight: 600; letter-spacing: 0.02em; }',
      B + ' .head__action.focus, ' + B + ' .head__action.hover { background: ' + o.grad + '; color: ' + o.gradText + '; }',
      B + ' .head__action.active::after { background-color: ' + o.accent + '; border-color: ' + o.bg; + ' }',
      B + '.menu--open .wrap__left { background: ' + o.sidebarBg + '; backdrop-filter: blur(24px); border-right: 1px solid ' + o.accentA08 + '; }',
      B + ' .menu__item { border-radius: 0.8em; margin: 0.15em 0.8em; transition: all 0.2s ease; }',
      B + ' .menu__item.focus, ' + B + ' .menu__item.traverse, ' + B + ' .menu__item.hover { background: ' + o.grad + '; color: ' + o.gradText + '; box-shadow: 0 4px 20px ' + o.accentA25 + '; }',
      B + ' .card__img { background-color: ' + o.cardBg + '; border-radius: 1.1em; }',
      B + ' .card.focus .card__view { transform: scale(1.05); z-index: 2; }',
      B + ' .card.focus .card__view::after { border-color: ' + o.accent + '; box-shadow: 0 0 20px ' + o.accentA35 + '; border-radius: 1.5em; }',
      B + ' .card__quality { background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; font-weight: 700; }',
      B + ' .full-start__button.focus { background: ' + o.grad + '; color: ' + o.gradText + '; box-shadow: 0 4px 20px ' + o.accentA30 + '; transform: scale(1.03); }',
      B + ' .player-panel .button.focus { background: ' + o.grad + '; color: ' + o.gradText + '; }',
      B + ' .time-line > div { background: ' + o.gradH + ' !important; }',
      B + ' .settings-param.focus, ' + B + ' .selectbox-item.focus { background: ' + o.grad + ' !important; color: ' + o.gradText + ' !important; }'
    ].join('\n');
  }

  // ═══════════════════════════════════════════════════════════
  //  Конфигурация новых и старых цветов
  // ═══════════════════════════════════════════════════════════
  var THEMES = {
    acid: buildCSS({
      cls: 'acid--theme', bg: '#0b0f00', bgBlack: '#050700', text: '#f0ffcc',
      accent: '#ccff00', grad: 'linear-gradient(135deg, #ccff00, #99ff00)', gradH: 'linear-gradient(90deg, #ccff00, #55ff00)',
      gradText: '#000', cardBg: '#141a00', sidebarBg: 'rgba(11,15,0,0.85)',
      bgA0: 'rgba(11,15,0,0)', bgA95: 'rgba(11,15,0,0.95)', accentA08: 'rgba(204,255,0,0.08)', accentA25: 'rgba(204,255,0,0.25)', accentA30: 'rgba(204,255,0,0.3)', accentA35: 'rgba(204,255,0,0.35)'
    }),
    purple: buildCSS({
      cls: 'purple--theme', bg: '#0f001a', bgBlack: '#07000d', text: '#f2e6ff',
      accent: '#bf00ff', grad: 'linear-gradient(135deg, #bf00ff, #7a00cc)', gradH: 'linear-gradient(90deg, #bf00ff, #ff00ff)',
      gradText: '#fff', cardBg: '#1a002b', sidebarBg: 'rgba(15,0,26,0.85)',
      bgA0: 'rgba(15,0,26,0)', bgA95: 'rgba(15,0,26,0.95)', accentA08: 'rgba(191,0,255,0.08)', accentA25: 'rgba(191,0,255,0.25)', accentA30: 'rgba(191,0,255,0.3)', accentA35: 'rgba(191,0,255,0.35)'
    }),
    emerald: buildCSS({
      cls: 'emerald--theme', bg: '#041008', bgBlack: '#020804', text: '#e0f2e9',
      accent: '#00ff88', grad: 'linear-gradient(135deg, #00ff88, #059669)', gradH: 'linear-gradient(90deg, #00ff88, #059669)',
      gradText: '#041008', cardBg: '#061a0e', sidebarBg: 'rgba(4,16,8,0.85)',
      bgA0: 'rgba(4,16,8,0)', bgA95: 'rgba(4,16,8,0.95)', accentA08: 'rgba(0,255,136,0.08)', accentA25: 'rgba(0,255,136,0.25)', accentA30: 'rgba(0,255,136,0.3)', accentA35: 'rgba(0,255,136,0.35)'
    }),
    blood: buildCSS({
      cls: 'blood--theme', bg: '#0a0000', bgBlack: '#050000', text: '#ffe0e0',
      accent: '#ff0000', grad: 'linear-gradient(135deg, #ff0000, #4a0000)', gradH: 'linear-gradient(90deg, #ff0000, #8b0000)',
      gradText: '#fff', cardBg: '#1a0505', sidebarBg: 'rgba(10,0,0,0.85)',
      bgA0: 'rgba(10,0,0,0)', bgA95: 'rgba(10,0,0,0.95)', accentA08: 'rgba(255,0,0,0.08)', accentA25: 'rgba(255,0,0,0.25)', accentA30: 'rgba(255,0,0,0.3)', accentA35: 'rgba(255,0,0,0.35)'
    })
    // Тут можно добавить старые темы (neon, aurora и т.д.) по аналогии
  };

  function applyTheme(id) {
    var styleTag = document.getElementById(STYLE_ID);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = STYLE_ID;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = THEMES[id] || '';
    ALL_CLASSES.forEach(function (cls) { document.body.classList.remove(cls); });
    if (THEMES[id]) document.body.classList.add(id + '--theme');
  }

  function startPlugin() {
    window.lampac_theme_plugin = true;

    // Регистрация в настройках Lampa
    Lampa.Settings.add({
      title: 'Цвет темы',
      type: 'select',
      name: 'lampac_theme',
      value: Lampa.Storage.get(STORAGE_KEY, 'acid'),
      values: {
        acid: 'Кислотный',
        purple: 'Фиолетовый',
        emerald: 'Изумруд',
        blood: 'Кровавый'
      },
      onChange: function (value) {
        Lampa.Storage.set(STORAGE_KEY, value);
        applyTheme(value);
      }
    });

    applyTheme(Lampa.Storage.get(STORAGE_KEY, 'acid'));
  }

  // Запуск при готовности приложения
  if (window.appready) startPlugin();
  else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });

})();
