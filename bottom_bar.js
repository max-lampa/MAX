(function () {
  'use strict';

  if (window.bottom_bar_pro) return;
  window.bottom_bar_pro = true;

  var BAR = '.navigation-bar__body';
  var ITEM = '.navigation-bar__item';
  var MAX = 8;
  var COMP = 'bottom_bar';

  // ---------- СТИЛИ ----------
  // & = класс стиля, @I = селектор кнопки
  var STYLE_DEFS = {
    glass: {
      name: 'Стекло',
      bar: 'padding:8px 10px;background:transparent;',
      item: 'background:linear-gradient(to top,rgba(70,70,75,.35),rgba(30,30,35,.25));border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:inset 0 0 6px rgba(0,0,0,.45);',
      act: 'background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.7);color:#fff;transform:translateY(-3px);box-shadow:0 4px 14px rgba(255,255,255,.15),inset 0 0 6px rgba(0,0,0,.3);'
    },
    dock: {
      name: 'Плавающий док',
      bar: 'margin:0 12px 12px;padding:6px;border-radius:28px;background:rgba(24,24,28,.72);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.08);box-shadow:0 8px 28px rgba(0,0,0,.55);',
      item: 'border-radius:22px;',
      act: 'background:rgba(255,255,255,.16);color:#fff;box-shadow:0 0 14px rgba(255,255,255,.15);'
    },
    flat: {
      name: 'Плоский',
      bar: 'padding:0 6px;background:rgba(18,18,20,.94);border-top:1px solid rgba(255,255,255,.08);',
      item: 'height:56px;',
      act: 'color:#fff;',
      extra: '& @I.active::after,& @I.focus::after{content:"";position:absolute;top:0;left:22%;right:22%;height:3px;border-radius:0 0 3px 3px;background:#fff;}'
    },
    neon: {
      name: 'Неон',
      bar: 'padding:8px 10px;background:rgba(8,8,12,.88);border-top:1px solid rgba(255,255,255,.35);box-shadow:0 -4px 22px rgba(255,255,255,.12);',
      item: 'border:1px solid rgba(255,255,255,.18);border-radius:12px;',
      act: 'border-color:#fff;color:#fff;background:rgba(255,255,255,.06);box-shadow:0 0 8px #fff,0 0 18px rgba(255,255,255,.55),inset 0 0 10px rgba(255,255,255,.25);text-shadow:0 0 8px #fff;'
    },
    pill: {
      name: 'Таблетка',
      bar: 'margin:0 12px 12px;padding:5px;border-radius:40px;background:rgba(28,28,32,.92);box-shadow:0 6px 22px rgba(0,0,0,.55);',
      item: 'border-radius:40px;',
      act: 'background:rgba(255,255,255,.22);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35);'
    },
    ios: {
      name: 'iOS',
      bar: 'padding:6px 8px 10px;background:rgba(20,20,22,.72);-webkit-backdrop-filter:blur(25px) saturate(180%);backdrop-filter:blur(25px) saturate(180%);border-top:1px solid rgba(255,255,255,.14);',
      item: 'opacity:.6;border-radius:10px;',
      act: 'opacity:1;color:#fff;transform:scale(1.07);'
    },
    aurora: {
      name: 'Аврора',
      bar: 'margin:0 10px 10px;padding:8px;border-radius:22px;background:linear-gradient(120deg,rgba(60,25,110,.9),rgba(10,60,95,.9),rgba(95,25,80,.9),rgba(60,25,110,.9));background-size:300% 300%;animation:bbAurora 9s ease infinite;border:1px solid rgba(255,255,255,.15);',
      item: 'background:rgba(255,255,255,.06);border-radius:14px;',
      act: 'background:rgba(255,255,255,.22);color:#fff;box-shadow:0 0 16px rgba(255,255,255,.25);'
    },
    minimal: {
      name: 'Минимал',
      bar: 'padding:4px 8px 8px;background:linear-gradient(to top,rgba(0,0,0,.85),rgba(0,0,0,0));',
      item: 'opacity:.6;',
      act: 'opacity:1;color:#fff;transform:translateY(-2px);',
      extra: '& @I.active::after,& @I.focus::after{content:"";position:absolute;bottom:1px;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:#fff;box-shadow:0 0 8px #fff;}'
    },
    bubble: {
      name: 'Пузыри',
      bar: 'padding:8px 12px 12px;background:transparent;justify-content:space-around;',
      item: 'flex:1 1 0;max-width:52px;height:auto;aspect-ratio:1/1;align-self:center;padding:0;border-radius:50%;background:rgba(40,40,45,.88);border:1px solid rgba(255,255,255,.12);box-shadow:0 4px 12px rgba(0,0,0,.5);',
      act: 'background:rgba(255,255,255,.24);border-color:#fff;color:#fff;transform:scale(1.12);box-shadow:0 0 16px rgba(255,255,255,.3);',
      extra: '& @I .navigation-bar__label{display:none;}& @I .navigation-bar__icon{margin:0;}&.bb-nolabels @I{height:auto;}'
    },
    outline: {
      name: 'Контур',
      bar: 'padding:8px 10px;background:rgba(14,14,16,.6);',
      item: 'border:1.5px solid rgba(255,255,255,.3);border-radius:12px;',
      act: 'border-color:#fff;background:rgba(255,255,255,.1);color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.1);'
    },
    gradient: {
      name: 'Градиент',
      bar: 'margin:0 8px 8px;padding:7px;border-radius:20px;background:linear-gradient(135deg,rgba(30,30,70,.96),rgba(75,40,95,.96));box-shadow:0 6px 20px rgba(0,0,0,.5);',
      item: 'border-radius:14px;',
      act: 'background:rgba(255,255,255,.17);color:#fff;'
    },
    island: {
      name: 'Остров',
      bar: 'margin:0 12px 14px;padding:6px;border-radius:34px;background:#000;border:1px solid rgba(255,255,255,.12);box-shadow:0 6px 24px rgba(0,0,0,.7);',
      item: 'border-radius:28px;transition:flex .35s ease,background .25s,transform .2s,color .25s;',
      act: 'flex:2.2 1 0;background:rgba(255,255,255,.14);color:#fff;',
      extra: '& @I .navigation-bar__label{display:none;}& @I.active .navigation-bar__label,& @I.focus .navigation-bar__label{display:block;}'
    },
    cyber: {
      name: 'Кибер',
      bar: 'padding:8px 12px;background:rgba(10,10,14,.92);border-top:2px solid rgba(255,255,255,.7);',
      item: 'background:rgba(255,255,255,.07);clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%);',
      act: 'background:rgba(255,255,255,.26);color:#fff;text-shadow:0 0 8px rgba(255,255,255,.8);'
    },
    ice: {
      name: 'Лёд',
      bar: 'margin:0 10px 10px;padding:6px;border-radius:24px;background:rgba(255,255,255,.14);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.28);',
      item: 'border-radius:18px;',
      act: 'background:rgba(255,255,255,.28);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.4);'
    },
    glow: {
      name: 'Сияние',
      bar: 'padding:0 6px;background:rgba(14,14,17,.96);',
      item: 'overflow:hidden;',
      act: 'color:#fff;',
      extra: '& @I.active::before,& @I.focus::before{content:"";position:absolute;left:0;right:0;bottom:0;height:75%;background:radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.4),rgba(255,255,255,0) 70%);pointer-events:none;}& @I.active::after,& @I.focus::after{content:"";position:absolute;left:18%;right:18%;bottom:0;height:2px;background:#fff;box-shadow:0 0 10px #fff;}'
    },
    carbon: {
      name: 'Карбон',
      bar: 'padding:6px 8px;background:repeating-linear-gradient(45deg,#141414 0,#141414 4px,#1b1b1b 4px,#1b1b1b 8px);border-top:1px solid #333;',
      item: 'border:1px solid #2d2d2d;border-radius:6px;background:rgba(0,0,0,.35);',
      act: 'border-color:#fff;color:#fff;box-shadow:inset 0 -3px 0 #fff;'
    },
    keys: {
      name: 'Клавиши',
      bar: 'padding:8px 10px;background:rgba(16,16,18,.92);',
      item: 'background:linear-gradient(#4a4a50,#2c2c31);border:1px solid #555;border-bottom:4px solid #1a1a1d;border-radius:10px;box-shadow:0 2px 4px rgba(0,0,0,.5);',
      act: 'background:linear-gradient(#6a6a72,#44444a);border-bottom-width:2px;transform:translateY(2px);color:#fff;box-shadow:inset 0 0 10px rgba(255,255,255,.15);'
    }
  };

  var STYLES = {};
  Object.keys(STYLE_DEFS).forEach(function (k) { STYLES[k] = STYLE_DEFS[k].name; });

  function imp(s) { return s.replace(/;\s*/g, ' !important; ').trim(); }

  function buildStyleCss() {
    var out = '';
    Object.keys(STYLE_DEFS).forEach(function (k) {
      var d = STYLE_DEFS[k], c = '.bb-' + k;
      if (d.bar)  out += BAR + c + '{' + imp(d.bar) + '}';
      if (d.item) out += c + ' ' + ITEM + '{' + imp(d.item) + '}';
      if (d.act)  out += c + ' ' + ITEM + '.active,' + c + ' ' + ITEM + '.focus{' + imp(d.act) + '}';
      if (d.extra) out += imp(d.extra).replace(/&/g, c).replace(/@I/g, ITEM);
    });
    return out;
  }

  var BASE_CSS = `
  :root { --bb-rgb: 255,255,255; }
  @keyframes bbAurora { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

  ${BAR}.bb {
    display: flex !important;
    align-items: stretch;
    justify-content: space-between;
    gap: 4px;
    box-sizing: border-box;
    overflow: visible !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    animation: none;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }
  .bb ${ITEM} {
    flex: 1 1 0 !important;
    min-width: 0 !important;
    height: 58px !important;
    margin: 0 !important;
    padding: 4px 2px !important;
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    opacity: 1 !important;
    clip-path: none;
    transition: background .25s, border-color .25s, transform .2s, color .25s, opacity .25s;
    -webkit-tap-highlight-color: transparent;
    touch-action: none;
    -webkit-user-select: none; user-select: none;
    -webkit-touch-callout: none;
  }
  .bb ${ITEM}.bb-hidden { display: none !important; }
  .bb .navigation-bar__icon {
    width: 26px !important; height: 26px !important;
    display: flex; align-items: center; justify-content: center;
    margin: 0 0 3px !important;
  }
  .bb .navigation-bar__icon svg { width: 24px !important; height: 24px !important; }
  .bb .navigation-bar__label {
    font-size: 10px !important; line-height: 1.1;
    max-width: 100%; padding: 0 2px; opacity: .85;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .bb.bb-nolabels .navigation-bar__label { display: none !important; }
  .bb.bb-nolabels ${ITEM} { height: 48px !important; }
  .bb.bb-nolabels .navigation-bar__icon { margin: 0 !important; }
  `;

  var DRAG_CSS = `
  .bb ${ITEM}.bb-drag {
    transition: none !important;
    z-index: 20;
    background: rgba(255,255,255,.25) !important;
    border: 1px solid rgba(255,255,255,.9) !important;
    color: #fff;
    opacity: 1 !important;
    box-shadow: 0 10px 24px rgba(0,0,0,.6), 0 0 16px rgba(255,255,255,.3) !important;
  }`;

  // ---------- УТИЛИТЫ ----------
  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function sget(k, d) {
    try {
      var v = Lampa.Storage.get(k, d);
      return (v === undefined || v === null || v === '') ? d : v;
    } catch (e) { return d; }
  }
  function sset(k, v) { try { Lampa.Storage.set(k, v); } catch (e) {} }
  function flag(k, d) { var v = sget(k, d); return v === true || v === 'true'; }

  function labelOf(el) {
    var l = el.querySelector('.navigation-bar__label');
    return l ? l.textContent.trim() : (el.dataset.action || 'Кнопка');
  }
  function nativeId(el) { return el.dataset.action || ('n:' + labelOf(el)); }
  function idOf(el) { return el.hasAttribute('data-bb') ? 'menu:' + el.dataset.action : nativeId(el); }

  var defaults = { order: [] };
  var catalog = [];
  var menuItems = [];
  var customs = {};
  var obs = null;
  var booted = false;

  function getOrder() {
    var v = sget('bb_order', '');
    if (typeof v === 'string' && v) { try { v = JSON.parse(v); } catch (e) { v = null; } }
    return Array.isArray(v) ? v.slice() : defaults.order.slice();
  }
  function setOrder(a) { sset('bb_order', JSON.stringify(a)); }

  // ---------- СКАНИРОВАНИЕ ----------
  function scanNative() {
    var bar = qs(BAR), res = [];
    if (!bar) return res;
    Array.prototype.forEach.call(bar.children, function (el) {
      if (el.matches(ITEM) && !el.hasAttribute('data-bb')) res.push({ id: nativeId(el), el: el });
    });
    return res;
  }

  function scanMenu(skip) {
    var seen = {}, out = [];
    qsa('.menu__item[data-action]').forEach(function (el) {
      var a = el.dataset.action;
      if (!a || seen[a] || skip['' + a]) return;
      seen[a] = 1;
      var t = el.querySelector('.menu__text');
      var name = t ? t.textContent.trim() : a;
      if (name === 'Редактировать') return;
      var s = el.querySelector('.menu__ico svg');
      if (!s) return;
      out.push({ id: 'menu:' + a, action: a, name: name, svg: s.outerHTML });
    });
    return out;
  }

  function customEl(id) {
    if (customs[id]) return customs[id];
    var entry = menuItems.filter(function (m) { return m.id === id; })[0];
    if (!entry) return null;

    var el = document.createElement('div');
    el.className = 'navigation-bar__item';
    el.setAttribute('data-bb', '1');
    el.dataset.action = entry.action;
    el.innerHTML = '<div class="navigation-bar__icon">' + entry.svg + '</div><div class="navigation-bar__label"></div>';
    el.querySelector('.navigation-bar__label').textContent = entry.name;
    el.addEventListener('click', function () {
      var m = qs('.menu__item[data-action="' + entry.action + '"]');
      if (m) m.click();
    });
    customs[id] = el;
    return el;
  }

  // ---------- ОТРИСОВКА ----------
  function render() {
    var bar = qs(BAR);
    if (!bar) return;
    if (obs) obs.disconnect();

    try {
      var nat = {};
      Array.prototype.forEach.call(bar.children, function (el) {
        if (el.matches(ITEM) && !el.hasAttribute('data-bb')) nat[nativeId(el)] = el;
      });

      function build(order) {
        var used = {}, res = [];
        order.forEach(function (id) {
          if (used[id]) return;
          var el = nat[id] || customEl(id);
          if (el) { used[id] = 1; res.push(el); }
        });
        return res.slice(0, MAX);
      }

      var els = build(getOrder());
      if (!els.length) els = build(defaults.order);

      Array.prototype.forEach.call(bar.children, function (el) {
        if (el.matches(ITEM)) el.classList.add('bb-hidden');
      });
      els.forEach(function (el) {
        el.classList.remove('bb-hidden');
        bar.appendChild(el);
      });

      var style = sget('bb_style', 'glass');
      if (!STYLES[style]) style = 'glass';
      bar.classList.add('bb');
      Object.keys(STYLES).forEach(function (s) { bar.classList.remove('bb-' + s); });
      bar.classList.add('bb-' + style);
      bar.classList.toggle('bb-nolabels', !flag('bb_labels', true));
    } catch (e) {
      console.log('bottom_bar render error', e);
    }

    if (obs) obs.observe(bar, { childList: true });
  }

  function later() { setTimeout(render, 50); }

  // ---------- ВЫБОР КНОПОК (один экран) ----------
  function openPicker() {
    var order = getOrder();

    function open(focusId) {
      var items = catalog.map(function (c) {
        var on = order.indexOf(c.id) >= 0;
        return { title: (on ? '✓   ' : '○   ') + c.name, id: c.id, selected: c.id === focusId };
      });

      Lampa.Select.show({
        title: 'Кнопки панели (максимум ' + MAX + ')',
        items: items,
        onBack: function () {
          try { Lampa.Controller.toggle('settings_component'); } catch (e) {}
        },
        onSelect: function (a) {
          var i = order.indexOf(a.id);
          if (i >= 0) {
            if (order.length <= 2) {
              try { Lampa.Noty.show('Должно остаться минимум 2 кнопки'); } catch (e) {}
              setTimeout(function () { open(a.id); }, 100);
              return;
            }
            order.splice(i, 1);
          } else {
            if (order.length >= MAX) {
              try { Lampa.Noty.show('Максимум ' + MAX + ' кнопок'); } catch (e) {}
              setTimeout(function () { open(a.id); }, 100);
              return;
            }
            order.push(a.id);
          }
          setOrder(order);
          render();
          setTimeout(function () { open(a.id); }, 100);
        }
      });
    }

    open();
  }

  function resetAll() {
    setOrder(defaults.order);
    sset('bb_style', 'glass');
    sset('bb_labels', 'true');
    try { Lampa.Settings.update(); } catch (e) {}
    render();
    try { Lampa.Noty.show('Нижняя панель сброшена'); } catch (e) {}
  }

  function registerSettings() {
    if (!Lampa.SettingsApi) return;

    Lampa.SettingsApi.addComponent({
      component: COMP,
      name: 'Нижняя панель',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="14" width="18" height="6" rx="3"/><circle cx="8" cy="17" r="0.6"/><circle cx="12" cy="17" r="0.6"/><circle cx="16" cy="17" r="0.6"/><path d="M5 9h14M8 5h8"/></svg>'
    });

    Lampa.SettingsApi.addParam({
      component: COMP,
      param: { name: 'bb_style', type: 'select', values: STYLES, default: 'glass' },
      field: { name: 'Стиль панели', description: 'Всего стилей: ' + Object.keys(STYLES).length },
      onChange: later
    });

    Lampa.SettingsApi.addParam({
      component: COMP,
      param: { name: 'bb_pick', type: 'button' },
      field: { name: 'Кнопки на панели', description: 'Выбрать, какие кнопки показывать. Порядок меняется зажатием прямо на панели' },
      onChange: openPicker
    });

    Lampa.SettingsApi.addParam({
      component: COMP,
      param: { name: 'bb_labels', type: 'trigger', default: true },
      field: { name: 'Подписи под иконками' },
      onChange: later
    });

    Lampa.SettingsApi.addParam({
      component: COMP,
      param: { name: 'bb_reset', type: 'button' },
      field: { name: 'Сбросить на стандартные', description: 'Вернуть кнопки, порядок и стиль' },
      onChange: resetAll
    });
  }

  // ---------- ПЕРЕТАСКИВАНИЕ ЗАЖАТИЕМ ----------
  function setupDrag() {
    var HOLD = 350, TOL = 10;
    var timer = null, pend = null, drag = null, swallow = false;

    function visible() {
      var bar = qs(BAR);
      if (!bar) return [];
      return Array.prototype.filter.call(bar.children, function (el) {
        return el.matches(ITEM) && !el.classList.contains('bb-hidden');
      });
    }

    function begin() {
      if (!pend) return;
      var el = pend.el;
      var list = visible();
      var from = list.indexOf(el);
      if (from < 0) { pend = null; return; }

      drag = {
        el: el, list: list, from: from, to: from, id: pend.id, startX: pend.lastX,
        rects: list.map(function (x) {
          var r = x.getBoundingClientRect();
          return { left: r.left, width: r.width };
        })
      };
      pend = null;
      swallow = true;
      try { el.setPointerCapture(drag.id); } catch (x) {}
      el.classList.add('bb-drag');
      el.style.transform = 'scale(1.08)';
      if (navigator.vibrate) navigator.vibrate(15);
    }

    function shift() {
      var f = drag.from, t = drag.to;
      drag.list.forEach(function (el, i) {
        if (i === f) return;
        var j = i;
        if (f < t && i > f && i <= t) j = i - 1;
        else if (f > t && i >= t && i < f) j = i + 1;
        el.style.transform = j === i ? '' : 'translateX(' + (drag.rects[j].left - drag.rects[i].left) + 'px)';
      });
    }

    function onDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      var it = e.target.closest && e.target.closest(ITEM);
      if (!it || !it.parentElement || !it.parentElement.matches(BAR)) return;
      if (it.classList.contains('bb-hidden') || drag) return;

      clearTimeout(timer);
      pend = { el: it, id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX };
      timer = setTimeout(begin, HOLD);
    }

    function onMove(e) {
      if (drag) {
        if (e.pointerId !== drag.id) return;
        e.preventDefault();

        var rects = drag.rects, last = rects.length - 1;
        var r0 = rects[drag.from];
        var dx = e.clientX - drag.startX;
        dx = Math.max(rects[0].left - r0.left, Math.min(rects[last].left - r0.left, dx));

        var center = r0.left + r0.width / 2 + dx;
        var to = last;
        for (var i = 0; i < rects.length; i++) {
          if (center < rects[i].left + rects[i].width) { to = i; break; }
        }

        drag.el.style.transform = 'translateX(' + dx + 'px) scale(1.08)';
        if (to !== drag.to) { drag.to = to; shift(); }
        return;
      }

      if (pend && e.pointerId === pend.id) {
        pend.lastX = e.clientX;
        if (Math.abs(e.clientX - pend.x) > TOL || Math.abs(e.clientY - pend.y) > TOL) {
          clearTimeout(timer);
          pend = null;
        }
      }
    }

    function finish(cancel) {
      clearTimeout(timer);
      pend = null;
      if (!drag) return;

      var d = drag;
      drag = null;
      var el = d.el;
      var to = cancel ? d.from : d.to;

      try { el.releasePointerCapture(d.id); } catch (x) {}
      el.classList.remove('bb-drag');
      el.style.transform = 'translateX(' + (d.rects[to].left - d.rects[d.from].left) + 'px)';

      setTimeout(function () {
        var order = d.list.slice();
        order.splice(d.from, 1);
        order.splice(to, 0, el);

        d.list.forEach(function (x) { x.style.transition = 'none'; x.style.transform = ''; });
        if (to !== d.from) {
          setOrder(order.map(idOf));
          render();
        }

        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            d.list.forEach(function (x) { x.style.transition = ''; });
          });
        });
        setTimeout(function () { swallow = false; }, 350);
      }, 220);
    }

    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', function () { finish(false); });
    document.addEventListener('pointercancel', function () { finish(true); });

    document.addEventListener('click', function (e) {
      if (!swallow) return;
      e.stopPropagation();
      e.preventDefault();
    }, true);

    document.addEventListener('contextmenu', function (e) {
      var it = e.target.closest && e.target.closest(ITEM);
      if (it && it.parentElement && it.parentElement.matches(BAR)) e.preventDefault();
    });
  }

  // ---------- ЗАПУСК ----------
  function boot() {
    if (booted) return;
    var bar = qs(BAR);
    if (!bar) return;
    booted = true;

    var st = document.createElement('style');
    st.id = 'bottom-bar-pro-style';
    st.textContent = BASE_CSS + buildStyleCss() + DRAG_CSS;
    document.head.appendChild(st);

    var natives = scanNative();
    var nativeIds = {};
    natives.forEach(function (n) { nativeIds[n.id] = 1; });
    menuItems = scanMenu(nativeIds);

    catalog = natives.map(function (n) { return { id: n.id, name: labelOf(n.el) }; })
      .concat(menuItems.map(function (m) { return { id: m.id, name: m.name }; }));

    defaults.order = natives.slice(0, MAX).map(function (n) { return n.id; });

    if (!sget('bb_order', '')) setOrder(defaults.order);

    registerSettings();
    setupDrag();

    obs = new MutationObserver(function () { setTimeout(render, 200); });
    render();
    setTimeout(render, 1500);
  }

  function ready() {
    var bar = qs(BAR);
    return !!(bar && bar.querySelector(ITEM) && window.Lampa && Lampa.Storage && qs('.menu__item[data-action]'));
  }

  function waitAndBoot() {
    if (ready()) { setTimeout(boot, 800); return; }

    var mo = new MutationObserver(function () {
      if (ready()) { mo.disconnect(); setTimeout(boot, 800); }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });

    setTimeout(function () {
      if (!booted && qs(BAR) && qs(BAR).querySelector(ITEM)) { mo.disconnect(); boot(); }
    }, 8000);
  }

  waitAndBoot();
})();
