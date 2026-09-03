(function () {
  'use strict';

  if (window.LampaTorrentUIFinalRestore) return;

  var ROOT = 'lampa-torrents-final-restore';
  var STYLE = 'lampa-torrents-final-restore-css';
  var K = {
    enabled: 'lt_final_enabled',
    auto: 'lt_final_auto',
    mode: 'lt_final_mode',
    focus: 'lt_final_focus'
  };

  var st = {
    mode: 'wide',
    sort: 'seeds',
    provider: 'all',
    focus: 0,
    selected: 0,
    items: []
  };

  var observer = null;
  var timer = 0;
  var lastHost = null;
  var lastSig = '';
  var closedUntil = 0;
  var manualClosed = false;
  var keyTarget = null;

  var hosts = '.explorer__files-body,.torrent,[class*="torrent-list"],[class*="torrent__list"]';
  var items = '.torrent-item,.torrent-item__item,[class*="torrent-item"]';

  function get(k, d) {
    try {
      return window.Lampa && Lampa.Storage ? Lampa.Storage.get(k, d) : d;
    } catch (e) {
      return d;
    }
  }

  function set(k, v) {
    try {
      if (window.Lampa && Lampa.Storage) Lampa.Storage.set(k, v);
    } catch (e) {}
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[c];
    });
  }

  function pick(n, selectors) {
    for (var i = 0; i < selectors.length; i++) {
      var x = n.querySelector(selectors[i]);
      if (x && x.textContent.trim()) return x.textContent.trim();
    }
    return '';
  }

  function num(v) {
    var n = String(v || '').replace(/[^0-9]/g, '');
    return n ? Number(n) : 0;
  }

  function norm(x) {
    x = x || {};
    return {
      name: x.name || x.title || x.filename || 'Раздача',
      quality: x.quality || x.resolution || 'FHD',
      size: x.size || x.filesize || '0 ГБ',
      seeds: Number(x.seeds || x.seed || x.seeders || x.peers || 0),
      season: x.season || 'Сезон 1',
      source: x.source || x.tracker || 'WEB-DL',
      studio: x.studio || x.voice || x.voiceName || 'Lampa',
      provider: x.provider || x.studio || x.tracker || x.source || 'Lampa',
      native: x.native || null
    };
  }

  function parse(n) {
    var title = pick(n, [
      '.torrent-item__title',
      '.torrent-item__name',
      '[data-title]',
      '.torrent-item__info'
    ]);
    var size = pick(n, ['.torrent-item__size', '[class*="size"]']);
    var seed = pick(n, [
      '.torrent-item__seeders',
      '.torrent-item__seeds',
      '[class*="seed"]',
      '[class*="peer"]'
    ]);
    var quality = pick(n, [
      '.torrent-item__quality',
      '[class*="quality"]',
      '[class*="resolution"]'
    ]) || 'FHD';
    var source = pick(n, [
      '.torrent-item__tracker',
      '.torrent-item__source',
      '.torrent-item__provider',
      '[data-source]',
      '[class*="tracker"]'
    ]) || 'WEB-DL';
    var meta = pick(n, ['.torrent-item__details', '.torrent-item__meta']);

    return norm({
      name: title || n.textContent.trim().slice(0, 150),
      size: size,
      seeds: num(seed),
      quality: quality,
      source: source,
      provider: source,
      studio: meta.replace(title, '').replace(size, '').trim().split(/\s{2,}| · |•/)[0] || 'Lampa',
      native: n
    });
  }

  function demo() {
    return [
      norm({
        name: '[S01] (2024) WEB-DL 1080p',
        quality: 'FHD',
        size: '22,58 ГБ',
        seeds: 1134,
        source: 'WEB-DL',
        studio: 'LostFilm',
        provider: 'LostFilm'
      }),
      norm({
        name: 'The Gentlemen / Джентльмены (2020) WEB-DL',
        quality: 'FHD',
        size: '18,09 ГБ',
        seeds: 5491,
        source: 'WEB-DL',
        studio: 'HDRеzka',
        provider: 'HDRеzka'
      }),
      norm({
        name: 'The Gentlemen 2024 S01 2160p UHD BluRay',
        quality: '4K',
        size: '64,31 ГБ',
        seeds: 328,
        source: 'UHD',
        studio: 'HDR',
        provider: 'HDR'
      }),
      norm({
        name: 'Джентльмены, полный сезон, дубляж',
        quality: 'HD',
        size: '9,42 ГБ',
        seeds: 842,
        source: 'WEB-DL',
        studio: 'Дубляж',
        provider: 'Дубляж'
      })
    ];
  }

  function inject() {
    if (document.getElementById(STYLE)) return;

    var s = document.createElement('style');
    s.id = STYLE;
    s.textContent = [
      '.ltrf{position:fixed;inset:0;z-index:99990;overflow:auto;background:#11131c;color:#f5f2f8;font-family:Arial,Helvetica,sans-serif}',
      '.ltrf:before{content:"";position:fixed;inset:0;z-index:-2;background:linear-gradient(115deg,#17131f,#101821 58%,#101119)}',
      '.ltrf:after{content:"";position:fixed;inset:0;z-index:-1;opacity:.36;background:radial-gradient(ellipse at 18% 18%,#6b2d3a 0,transparent 24%),radial-gradient(ellipse at 70% 8%,#243c48 0,transparent 29%),radial-gradient(ellipse at 82% 75%,#402448 0,transparent 32%)}',
      '.ltrf *{box-sizing:border-box}',
      '.ltrf-in{width:min(1500px,100%);margin:auto;padding:48px 5.2vw 72px}',
      '.ltrf-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}',
      '.ltrf-label{font-size:20px;letter-spacing:.22em;text-transform:uppercase;color:#a477ef}',
      '.ltrf-label:before{content:"";display:inline-block;width:27px;height:2px;background:#a477ef;vertical-align:middle;margin:0 12px 4px 0;box-shadow:0 0 16px #945fe7}',
      '.ltrf-actions{display:flex;gap:10px}',
      '.ltrf-btn{min-height:48px;padding:0 16px;border:1px solid #51495f;border-radius:12px;background:#282531;color:#ddd7e5;font-size:14px;cursor:pointer}',
      '.ltrf-btn:focus,.ltrf-chip:focus,.ltrf-row:focus{outline:none}',
      '.ltrf-restore{color:#e1b5bc;border-color:#875563}',
      '.ltrf-close{width:48px;padding:0;border-radius:50%;font-size:26px}',
      '.ltrf-title{margin:0 0 30px;font-size:clamp(34px,5vw,58px);font-weight:400;line-height:1;letter-spacing:-.055em}',
      '.ltrf-chips{display:flex;gap:12px;overflow:auto;padding:0 0 25px;scrollbar-width:none}',
      '.ltrf-chip{white-space:nowrap;padding:12px 28px;border:0;border-radius:999px;background:#36353d;color:#e5e2e7;font-size:22px;cursor:pointer}',
      '.ltrf-chip.active{background:#6842a7;color:#fff;box-shadow:0 0 0 1px #a475f0 inset}',
      '.ltrf-sources{display:flex;align-items:center;gap:10px;overflow:auto;padding:0 0 25px;scrollbar-width:none}',
      '.ltrf-source{white-space:nowrap;padding:10px 20px;border:1px solid #4a5061;border-radius:999px;background:#202635;color:#d9dce5;font-size:18px;cursor:pointer}',
      '.ltrf-source.active{border-color:#a475f0;background:#493175;color:#fff;box-shadow:0 0 0 1px #a475f0 inset}',
      '.ltrf-found{margin-bottom:17px;color:#b0b2bf;font-size:24px}',
      '.ltrf-found strong{color:#faf8ff;font-weight:400}',
      '.ltrf-list{display:flex;flex-direction:column;gap:9px}',
      '.ltrf-row{display:grid;grid-template-columns:180px minmax(0,1fr) 185px;min-height:124px;overflow:hidden;border:1px solid #3e4558;background:#292f42;cursor:pointer}',
      '.ltrf-row.selected{border-color:#8261c0;background:#2d354b}',
      '.ltrf-focus{outline:3px solid #bd91ff!important;outline-offset:5px;box-shadow:0 0 0 7px #8d5edb44!important}',
      '.ltrf-fill{outline:0!important;box-shadow:0 0 0 5px #eee inset!important;background:#eee!important;color:#17131f!important}',
      '.ltrf-fill .ltrf-tag{color:#17131f;background:#ddd}',
      '.ltrf-quality{display:flex;align-items:center;padding-left:36px;border-right:1px solid #464d5e;font-size:39px;font-weight:700}',
      '.ltrf-detail{min-width:0;padding:18px 25px}',
      '.ltrf-name{margin-bottom:12px;overflow:hidden;color:#bcbcc9;font-size:20px;white-space:nowrap;text-overflow:ellipsis}',
      '.ltrf-tag{display:inline-block;margin:0 8px 8px 0;padding:10px 16px;border-radius:12px;background:#5334a0;color:#c5a7ff;font-size:18px}',
      '.ltrf-tag.cyan{background:#244664;color:#61bdf0}',
      '.ltrf-tag.dim{background:#303849;color:#989dab}',
      '.ltrf-stat{padding:22px 29px 0 5px;text-align:right}',
      '.ltrf-size{font-size:29px;font-weight:700;white-space:nowrap}',
      '.ltrf-seeds{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-top:14px;color:#40e784;font-size:21px}',
      '.ltrf-bars{display:flex;align-items:flex-end;gap:3px;height:19px}',
      '.ltrf-bars i{display:block;width:4px;border-radius:5px;background:#40e784}',
      '.ltrf-bars i:nth-child(1){height:6px}.ltrf-bars i:nth-child(2){height:10px}.ltrf-bars i:nth-child(3){height:15px}.ltrf-bars i:nth-child(4){height:19px}',
      '.ltrf-empty{display:none;padding:44px 20px;border:1px dashed #555a6c;border-radius:16px;text-align:center;color:#aeb0bd}',
      '.ltrf-empty strong{display:block;margin-bottom:7px;color:#fff}',
      '.ltrf-help{margin-top:18px;color:#9294a4;font-size:13px}',
      '.ltrf-help kbd{padding:4px 7px;border:1px solid #4c4d5b;border-radius:5px;background:#272936;color:#e2dfeb}',
      '.ltrf.compact .ltrf-in{width:min(1160px,100%);padding-top:34px}',
      '.ltrf.compact .ltrf-title{font-size:42px;margin-bottom:22px}',
      '.ltrf.compact .ltrf-chips{padding-bottom:18px}',
      '.ltrf.compact .ltrf-chip{padding:10px 20px;font-size:16px}',
      '.ltrf.compact .ltrf-sources{padding-bottom:18px}',
      '.ltrf.compact .ltrf-source{padding:8px 14px;font-size:14px}',
      '.ltrf.compact .ltrf-found{font-size:18px}',
      '.ltrf.compact .ltrf-row{grid-template-columns:110px minmax(0,1fr) 145px;min-height:82px}',
      '.ltrf.compact .ltrf-quality{padding-left:22px;font-size:26px}',
      '.ltrf.compact .ltrf-detail{padding:12px 17px}',
      '.ltrf.compact .ltrf-name{margin-bottom:7px;font-size:15px}',
      '.ltrf.compact .ltrf-tag{padding:6px 10px;border-radius:8px;font-size:12px}',
      '.ltrf.compact .ltrf-stat{padding:15px 20px 0 4px}',
      '.ltrf.compact .ltrf-size{font-size:19px}',
      '.ltrf.compact .ltrf-seeds{margin-top:7px;font-size:15px}',
      '@media(max-width:700px){.ltrf-in{padding:25px 14px 44px}.ltrf-label{font-size:15px}.ltrf-actions{gap:6px}.ltrf-btn{padding:0 10px;font-size:11px}.ltrf-title,.ltrf.compact .ltrf-title{font-size:35px;margin-bottom:20px}.ltrf-chips{padding-bottom:17px}.ltrf-chip,.ltrf.compact .ltrf-chip{padding:10px 17px;font-size:15px}.ltrf-sources{padding-bottom:19px}.ltrf-source,.ltrf.compact .ltrf-source{padding:8px 14px;font-size:14px}.ltrf-found,.ltrf.compact .ltrf-found{font-size:17px}.ltrf-row,.ltrf.compact .ltrf-row{grid-template-columns:61px minmax(0,1fr);min-height:0}.ltrf-quality,.ltrf.compact .ltrf-quality{min-height:88px;padding-left:13px;font-size:17px}.ltrf-detail,.ltrf.compact .ltrf-detail{padding:14px 12px}.ltrf-name,.ltrf.compact .ltrf-name{font-size:13px}.ltrf-tag,.ltrf.compact .ltrf-tag{padding:7px 9px;border-radius:8px;font-size:11px}.ltrf-stat,.ltrf.compact .ltrf-stat{grid-column:2;padding:0 12px 14px;text-align:left}.ltrf-size,.ltrf.compact .ltrf-size{font-size:17px}.ltrf-seeds,.ltrf.compact .ltrf-seeds{justify-content:flex-start;font-size:15px}.ltrf-help{display:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  function list() {
    var a = st.items.filter(function (x) {
      return st.provider === 'all' || x.provider === st.provider;
    });
    if (st.sort === 'size') {
      a.sort(function (x, y) {
        return parseFloat(String(y.size).replace(',', '.')) - parseFloat(String(x.size).replace(',', '.'));
      });
    } else if (st.sort === 'date') {
      a.reverse();
    } else if (st.sort === 'all') {
      a.sort(function (x, y) {
        return String(x.name).localeCompare(String(y.name), 'ru');
      });
    } else {
      a.sort(function (x, y) {
        return y.seeds - x.seeds;
      });
    }
    return a;
  }

  function providers() {
    var result = ['all'];
    st.items.forEach(function (x) {
      var value = x.provider || 'Lampa';
      if (result.indexOf(value) < 0) result.push(value);
    });
    return result;
  }

  function focusables(r) {
    return [
      r.querySelector('.ltrf-mode'),
      r.querySelector('.ltrf-restore'),
      r.querySelector('.ltrf-close')
    ].concat([].slice.call(r.querySelectorAll('.ltrf-chip')))
      .concat([].slice.call(r.querySelectorAll('.ltrf-source')))
      .concat([].slice.call(r.querySelectorAll('.ltrf-row')));
  }

  function focusType(el) {
    if (!el) return '';
    if (el.classList.contains('ltrf-row')) return 'row';
    if (el.classList.contains('ltrf-chip')) return 'chip';
    if (el.classList.contains('ltrf-source')) return 'source';
    return 'button';
  }

  function applyFocus(el) {
    var r = document.getElementById(ROOT);
    if (!r || !el) return;

    r.querySelectorAll('.ltrf-focus,.ltrf-fill').forEach(function (x) {
      x.classList.remove('ltrf-focus', 'ltrf-fill');
    });
    el.classList.add(get(K.focus, 'ring') === 'fill' ? 'ltrf-fill' : 'ltrf-focus');
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    keyTarget = el;
  }

  function render() {
    var r = document.getElementById(ROOT);
    if (!r) return;

    r.classList.toggle('compact', st.mode === 'compact');
    var a = list();
    r.querySelector('.ltrf-list').innerHTML = a.map(function (x, i) {
      return '<article class="ltrf-row ' + (i === st.selected ? 'selected ' : '') +
        '" data-i="' + i + '" tabindex="-1">' +
        '<div class="ltrf-quality">' + esc(x.quality) + '</div>' +
        '<div class="ltrf-detail"><div class="ltrf-name">' + esc(x.name) + '</div>' +
        '<span class="ltrf-tag">' + esc(x.season) + '</span>' +
        '<span class="ltrf-tag cyan">' + esc(x.source) + '</span>' +
        '<span class="ltrf-tag dim">' + esc(x.studio) + '</span></div>' +
        '<div class="ltrf-stat"><div class="ltrf-size">' + esc(x.size) + '</div>' +
        '<div class="ltrf-seeds"><span class="ltrf-bars"><i></i><i></i><i></i><i></i></span>' +
        esc(x.seeds) + '</div></div></article>';
    }).join('');

    r.querySelector('.ltrf-found').innerHTML =
      'Раздач: <strong>' + a.length + '</strong>';
    r.querySelector('.ltrf-list').style.display = a.length ? 'flex' : 'none';
    r.querySelector('.ltrf-empty').style.display = a.length ? 'none' : 'block';
    r.querySelector('.ltrf-mode').textContent =
      st.mode === 'wide' ? 'Компактный вид' : 'Широкий вид';

    var sourceHtml = providers().map(function (value) {
      var label = value === 'all' ? 'Все источники' : value;
      return '<button type="button" class="ltrf-source ' +
        (value === st.provider ? 'active' : '') +
        '" data-provider="' + esc(value) + '">' + esc(label) + '</button>';
    }).join('');
    r.querySelector('.ltrf-sources').innerHTML = sourceHtml;

    var chips = r.querySelectorAll('.ltrf-chip');
    chips.forEach(function (x) {
      x.classList.toggle('active', x.dataset.sort === st.sort);
    });

    var f = focusables(r);
    if (!f.length) return;
    st.focus = Math.max(0, Math.min(st.focus, f.length - 1));
    applyFocus(f[st.focus]);
  }

  function close(manual) {
    var r = document.getElementById(ROOT);
    if (r) r.remove();
    window.removeEventListener('keydown', key, true);
    keyTarget = null;
    closedUntil = Date.now() + 900;
    if (manual !== false) manualClosed = true;
  }

  function restore() {
    set(K.enabled, false);
    set(K.auto, false);
    close();
    try {
      if (Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle('content');
      if (Lampa.Activity && Lampa.Activity.refresh) Lampa.Activity.refresh(true);
    } catch (e) {}
  }

  function activate() {
    var r = document.getElementById(ROOT);
    if (!r) return;

    var f = focusables(r);
    var el = f[st.focus];
    if (!el) return;

    if (el.classList.contains('ltrf-mode')) {
      st.mode = st.mode === 'wide' ? 'compact' : 'wide';
      set(K.mode, st.mode);
      render();
    } else if (el.classList.contains('ltrf-restore')) {
      restore();
    } else if (el.classList.contains('ltrf-close')) {
      close();
    } else if (el.classList.contains('ltrf-chip')) {
      st.sort = el.dataset.sort || 'seeds';
      st.selected = 0;
      render();
    } else if (el.classList.contains('ltrf-source')) {
      st.provider = el.dataset.provider || 'all';
      st.selected = 0;
      render();
    } else if (el.classList.contains('ltrf-row')) {
      st.selected = Number(el.dataset.i) || 0;
      openNative(st.selected);
    }
  }

  function openNative(index) {
    var a = list();
    var item = a[index];
    var native = item && item.native;
    if (!native) return;

    close();
    setTimeout(function () {
      try {
        if (typeof native.click === 'function') {
          native.click();
        } else {
          native.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          }));
        }
      } catch (e) {
        try {
          native.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
        } catch (ignore) {}
      }
    }, 0);
  }

  function keyName(e) {
    var code = e && (e.keyCode || e.which);
    var key = e && (e.key || e.code);

    if (code === 19 || key === 'ArrowUp' || key === 'DPAD_UP') return 'up';
    if (code === 20 || key === 'ArrowDown' || key === 'DPAD_DOWN') return 'down';
    if (code === 21 || key === 'ArrowLeft' || key === 'DPAD_LEFT') return 'left';
    if (code === 22 || key === 'ArrowRight' || key === 'DPAD_RIGHT') return 'right';
    if (code === 23 || code === 66 || key === 'Enter' || key === 'NumpadEnter' ||
        key === ' ' || key === 'Spacebar' || key === 'DPAD_CENTER') return 'ok';
    if (code === 4 || key === 'Escape' || key === 'Backspace' || key === 'BrowserBack') return 'back';
    return '';
  }

  function move(direction) {
    var r = document.getElementById(ROOT);
    if (!r) return;

    var f = focusables(r);
    var el = f[st.focus];
    var type = focusType(el);
    var next = st.focus;
    var headerCount = 3;
    var chipStart = headerCount;
    var chipEnd = chipStart + r.querySelectorAll('.ltrf-chip').length - 1;
    var sourceStart = chipEnd + 1;
    var sourceEnd = sourceStart + r.querySelectorAll('.ltrf-source').length - 1;
    var rowStart = sourceEnd + 1;
    var rowCount = r.querySelectorAll('.ltrf-row').length;

    if (direction === 'left' || direction === 'right') {
      if (type === 'button') {
        next = direction === 'right' ? Math.min(2, st.focus + 1) : Math.max(0, st.focus - 1);
      } else if (type === 'chip') {
        next = direction === 'right'
          ? Math.min(chipEnd, st.focus + 1)
          : Math.max(chipStart, st.focus - 1);
      } else if (type === 'source') {
        next = direction === 'right'
          ? Math.min(sourceEnd, st.focus + 1)
          : Math.max(sourceStart, st.focus - 1);
      }
    } else if (direction === 'down') {
      if (type === 'button') {
        next = chipStart;
      } else if (type === 'chip') {
        next = sourceStart;
      } else if (type === 'source') {
        next = rowCount ? rowStart : st.focus;
      } else if (type === 'row') {
        next = rowCount ? Math.min(rowStart + rowCount - 1, st.focus + 1) : st.focus;
      }
    } else if (direction === 'up') {
      if (type === 'row') {
        next = st.focus === rowStart ? sourceStart : Math.max(rowStart, st.focus - 1);
      } else if (type === 'source') {
        next = chipStart;
      } else if (type === 'chip') {
        next = 0;
      }
    }

    if (next !== st.focus) {
      st.focus = next;
      applyFocus(f[st.focus]);
    }
  }

  function key(e) {
    if (!document.getElementById(ROOT)) return;

    var action = keyName(e);
    if (!action) return;

    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    if (action === 'back') {
      close();
    } else if (action === 'ok') {
      activate();
    } else {
      move(action);
    }
  }

  function bindClick(r) {
    r.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('.ltrf-btn,.ltrf-chip,.ltrf-source,.ltrf-row') : null;
      if (!el || !r.contains(el)) return;

      var f = focusables(r);
      var index = f.indexOf(el);
      if (index >= 0) st.focus = index;
      if (el.classList.contains('ltrf-row')) st.selected = Number(el.dataset.i) || 0;
      activate();
    }, true);
  }

  function open(data, card) {
    if (get(K.enabled, true) === false) return;

    inject();
    close(false);
    manualClosed = false;
    st.items = (data && data.length ? data : demo()).map(norm);
    st.mode = get(K.mode, 'wide') === 'compact' ? 'compact' : 'wide';
    st.sort = 'seeds';
    st.provider = 'all';
    st.focus = 0;
    st.selected = 0;

    var title = card && (card.title || card.name) ? card.title || card.name : 'Раздачи';
    var r = document.createElement('div');
    r.id = ROOT;
    r.className = 'ltrf';
    r.tabIndex = 0;
    r.innerHTML =
      '<div class="ltrf-in">' +
      '<div class="ltrf-head"><div class="ltrf-label">Торренты</div>' +
      '<div class="ltrf-actions">' +
      '<button type="button" class="ltrf-btn ltrf-mode">Компактный вид</button>' +
      '<button type="button" class="ltrf-btn ltrf-restore">Штатный интерфейс</button>' +
      '<button type="button" class="ltrf-btn ltrf-close" aria-label="Закрыть">×</button>' +
      '</div></div><main>' +
      '<h1 class="ltrf-title">' + esc(title) + '</h1>' +
      '<nav class="ltrf-chips" aria-label="Сортировка">' +
      '<button type="button" class="ltrf-chip active" data-sort="seeds">Сиды</button>' +
      '<button type="button" class="ltrf-chip" data-sort="size">Размер</button>' +
      '<button type="button" class="ltrf-chip" data-sort="date">Дата</button>' +
      '<button type="button" class="ltrf-chip" data-sort="all">Все сезоны</button>' +
      '</nav><div class="ltrf-sources" aria-label="Источники"></div>' +
      '<div class="ltrf-found"></div><div class="ltrf-list"></div>' +
      '<div class="ltrf-empty"><strong>Нет раздач</strong>Вернитесь назад или выберите другой источник.</div>' +
      '<div class="ltrf-help"><kbd>↑</kbd><kbd>↓</kbd> навигация&nbsp;&nbsp;' +
      '<kbd>OK</kbd> открыть&nbsp;&nbsp;<kbd>BACK</kbd> закрыть</div>' +
      '</main></div>';

    document.body.appendChild(r);
    bindClick(r);
    window.addEventListener('keydown', key, true);
    r.addEventListener('keydown', key, true);
    r.addEventListener('focus', function () {
      applyFocus(focusables(r)[st.focus]);
    });
    render();
    r.focus();
  }

  function findHost() {
    var a = document.querySelectorAll(hosts);
    for (var i = 0; i < a.length; i++) {
      if (a[i].querySelector(items)) return a[i];
    }
    return null;
  }

  function getCard() {
    try {
      var a = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
      var c = a && a.activity && a.activity.component;
      return c && (c.movie || c.card || c.data) || null;
    } catch (e) {
      return null;
    }
  }

  function connect(force) {
    if (manualClosed || Date.now() < closedUntil || get(K.auto, true) === false ||
        document.getElementById(ROOT)) return;

    var h = findHost();
    if (!h) return;

    var ns = h.querySelectorAll(items);
    var a = [];
    var seen = {};
    for (var i = 0; i < ns.length; i++) {
      var x = parse(ns[i]);
      if (x.name && !seen[x.name]) {
        seen[x.name] = 1;
        a.push(x);
      }
    }
    if (!a.length) return;

    var sig = a.map(function (x) {
      return x.name + '|' + x.size + '|' + x.seeds;
    }).join('||');
    if (!force && h === lastHost && sig === lastSig) return;

    lastHost = h;
    lastSig = sig;
    open(a, getCard());
  }

  function schedule(force) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      connect(!!force);
    }, 180);
  }

  function observe() {
    if (observer) observer.disconnect();
    manualClosed = false;
    lastHost = null;
    lastSig = '';
    if (!document.body || !window.MutationObserver) return;

    observer = new MutationObserver(function (m) {
      if (document.getElementById(ROOT) || Date.now() < closedUntil) return;
      for (var i = 0; i < m.length; i++) {
        if (m[i].addedNodes.length || m[i].removedNodes.length) {
          schedule(false);
          break;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    schedule(true);
  }

  function settings() {
    try {
      if (!Lampa.SettingsApi) return;
      Lampa.SettingsApi.addComponent({
        component: 'lt_final_restore_settings',
        icon: '⚙',
        name: 'Torrent UI'
      });
      Lampa.SettingsApi.addParam({
        component: 'lt_final_restore_settings',
        param: { name: K.enabled, type: 'trigger', default: true },
        field: {
          name: 'Включить Torrent UI',
          description: 'Использовать новый интерфейс торрентов'
        }
      });
      Lampa.SettingsApi.addParam({
        component: 'lt_final_restore_settings',
        param: { name: K.auto, type: 'trigger', default: true },
        field: {
          name: 'Автоподключение',
          description: 'Подключаться к текущему torrent-компоненту'
        }
      });
      Lampa.SettingsApi.addParam({
        component: 'lt_final_restore_settings',
        param: {
          name: K.mode,
          type: 'select',
          values: { wide: 'Широкий режим', compact: 'Компактный режим' },
          default: 'wide'
        },
        field: {
          name: 'Режим списка',
          description: 'Плотность отображения раздач'
        },
        onChange: function (v) {
          if (v === 'wide' || v === 'compact') {
            st.mode = v;
            set(K.mode, v);
            render();
          }
        }
      });
      Lampa.SettingsApi.addParam({
        component: 'lt_final_restore_settings',
        param: {
          name: K.focus,
          type: 'select',
          values: { ring: 'Фокус-кольцо', fill: 'Заполнение' },
          default: 'ring'
        },
        field: {
          name: 'Стиль фокуса',
          description: 'Вид выделения с пульта'
        },
        onChange: render
      });
    } catch (e) {}
  }

  function start() {
    if (!window.Lampa) return;
    settings();
    try {
      if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('activity', function (e) {
          if (e.type === 'start' || e.type === 'archive') observe();
          if (e.type === 'destroy') {
            if (observer) observer.disconnect();
            observer = null;
            close(false);
          }
        });
      }
      if (Lampa.Controller && Lampa.Controller.listener &&
          Lampa.Controller.listener.follow) {
        Lampa.Controller.listener.follow('toggle', function () {
          if (!document.getElementById(ROOT)) schedule(true);
        });
      }
    } catch (e) {}
    observe();
  }

  window.LampaTorrentUIFinalRestore = {
    open: open,
    close: close,
    restore: restore,
    connect: function () { schedule(true); },
    disconnect: function () {
      if (observer) observer.disconnect();
      observer = null;
      window.removeEventListener('keydown', key, true);
    },
    setItems: function (a) {
      st.items = (a || []).map(norm);
      render();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}());