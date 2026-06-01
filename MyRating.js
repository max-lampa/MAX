(function () {
  'use strict';

  var STORAGE_KEY = 'lampa_my_ratings_v1';

  function load() {
    try { return JSON.parse(Lampa.Storage.get(STORAGE_KEY, '{}')); }
    catch (e) { return {}; }
  }
  function save(data) { Lampa.Storage.set(STORAGE_KEY, JSON.stringify(data)); }
  function getEntry(id) { return load()[id] || null; }
  function canRate(id) {
    var e = getEntry(id);
    return !e || (Date.now() - e.ts) > 86400000;
  }
  function addVote(id, score) {
    var data = load();
    var e = data[id];
    if (e) { e.votes++; e.sum += score; e.score = score; e.ts = Date.now(); }
    else { data[id] = { score: score, ts: Date.now(), votes: 1, sum: score }; }
    save(data);
    return data[id];
  }

  var CSS = [
    /* === Кнопка оценки — светлая, pill === */
    '.my-rating-btn{',
      'background:#ffffff;border:none;border-radius:50px;',
      'padding:0 20px;height:46px;color:#111111;font-size:14px;font-weight:700;',
      'cursor:pointer;display:inline-flex;align-items:center;gap:8px;outline:none;',
      'box-shadow:0 4px 20px rgba(255,255,255,.2);',
      'transition:background .18s,transform .1s,box-shadow .18s;',
      'white-space:nowrap;flex-shrink:0;',
    '}',
    '.my-rating-btn:hover{background:#f0f0f0;transform:scale(1.04);}',
    '.my-rating-btn:active{transform:scale(.97);}',
    '.my-rating-btn.rated{background:#f5a623;color:#111;box-shadow:0 4px 22px rgba(245,166,35,.5);}',
    '.my-rating-btn.rated:hover{background:#f0a020;}',
    '.myr-btn-ico{font-size:18px;line-height:1;}',
    '.myr-btn-lbl{font-size:14px;font-weight:700;}',

    /* === Личный рейтинг на карточке === */
    '.myr-personal-badge{',
      'display:inline-flex;align-items:center;gap:5px;',
    '}',
    '.myr-sep{width:1px;height:16px;background:rgba(255,255,255,.2);display:inline-block;margin:0 4px;}',
    '.myr-pscore{font-size:inherit;font-weight:700;color:#4ade80;}',
    '.myr-plbl{font-size:11px;font-weight:600;',
      'color:rgba(74,222,128,.65);text-transform:uppercase;letter-spacing:.04em;}',
    '.myr-ptag{font-size:10px;background:rgba(74,222,128,.15);color:#4ade80;',
      'border-radius:50px;padding:2px 7px;font-weight:700;}',

    /* === Overlay + Sheet === */
    '.myr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);',
      'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
      'z-index:9999;display:flex;align-items:flex-end;justify-content:center;}',
    '.myr-sheet{width:100%;max-width:520px;background:#1e1e28;',
      'border-radius:28px 28px 0 0;padding:28px 20px 54px;',
      'box-shadow:0 -8px 40px rgba(0,0,0,.7);}',
    '.myr-title{font-size:24px;font-weight:800;color:#fff;margin:0 0 18px;}',
    '.myr-film-row{display:flex;gap:14px;margin-bottom:22px;}',
    '.myr-poster{width:88px;height:128px;border-radius:14px;',
      'overflow:hidden;background:#2a2a3a;flex-shrink:0;}',
    '.myr-poster img{width:100%;height:100%;object-fit:cover;}',
    '.myr-year{font-size:13px;color:rgba(255,255,255,.4);margin-bottom:3px;}',
    '.myr-name{font-size:19px;font-weight:700;color:#fff;margin-bottom:10px;line-height:1.2;}',
    '.myr-stats{display:inline-flex;align-items:center;',
      'background:rgba(255,255,255,.07);border-radius:12px;overflow:hidden;',
      'font-size:14px;color:#fff;}',
    '.myr-stats span{padding:6px 12px;}',
    '.myr-stats .myr-vsep{width:1px;background:rgba(255,255,255,.1);align-self:stretch;}',

    /* === Stars === */
    '.myr-grid-1{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:6px;}',
    '.myr-grid-2{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;',
      'margin:0 auto 20px;max-width:calc(3*(100%/7) + 2*4px);}',
    '.myr-star-btn{display:flex;flex-direction:column;align-items:center;gap:2px;',
      'background:none;border:none;cursor:pointer;padding:2px;',
      'transition:transform .1s;}',
    '.myr-star-btn:hover{transform:scale(1.15);}',
    '.myr-star-ico{font-size:32px;color:rgba(255,255,255,.15);',
      'transition:color .1s,text-shadow .1s;line-height:1;}',
    '.myr-star-ico.filled{color:#f5a623;text-shadow:0 0 12px rgba(245,166,35,.55);}',
    '.myr-star-ico.hovered{color:#f5a623;opacity:.75;}',
    '.myr-star-num{font-size:11px;color:rgba(255,255,255,.3);font-weight:600;}',

    /* === Hint === */
    '.myr-hint{background:rgba(255,255,255,.05);border-radius:16px;',
      'padding:13px 18px;text-align:center;font-size:13px;',
      'color:rgba(255,255,255,.4);line-height:1.5;}',
    '.myr-hint.ok{background:rgba(74,222,128,.12);',
      'border:1px solid rgba(74,222,128,.25);color:#4ade80;font-weight:700;}',
    '.myr-hint.warn{background:rgba(245,166,35,.1);',
      'border:1px solid rgba(245,166,35,.25);color:#f5a623;}',
  ].join('');

  function injectStyles() {
    if (document.getElementById('my-rating-css')) return;
    var s = document.createElement('style');
    s.id = 'my-rating-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* Вставить бейдж "Моя оценка" рядом с рейтингом на карточке */
  function injectCardBadge(root, id) {
    setTimeout(function () {
      var el = (root[0] || root);
      if (!el || !el.querySelector) return;
      /* ищем элемент с TMDB рейтингом */
      var ratingEl = el.querySelector(
        '.full-start__rate, .card__rating, [class*="rate"]:not(.myr-personal-badge)'
      );
      if (!ratingEl) return;
      var old = ratingEl.querySelector('.myr-personal-badge');
      if (old) old.remove();
      var entry = getEntry(id);
      if (!entry) return;
      var avg = (entry.sum / entry.votes).toFixed(1);
      var badge = document.createElement('span');
      badge.className = 'myr-personal-badge';
      badge.innerHTML =
        '<span class="myr-sep"></span>' +
        '<span class="myr-pscore">' + avg + '</span>' +
        '<span class="myr-plbl">Моя</span>' +
        '<span class="myr-ptag">' + entry.score + '/10</span>';
      ratingEl.appendChild(badge);
    }, 250);
  }

  function openModal(card) {
    injectStyles();
    var id      = String(card.id || card.kinopoisk_id || card.imdb_id || card.title);
    var name    = card.title || card.name || 'Без названия';
    var year    = card.release_year || card.year || '';
    var poster  = (card.poster && card.poster.high) || card.poster || '';
    var entry   = getEntry(id);
    var myScore = entry ? entry.score : 0;
    var avgStr  = entry ? (entry.sum / entry.votes).toFixed(1) : '—';
    var votes   = entry ? entry.votes : 0;
    var cooldown = !canRate(id);

    function hintHTML(msg, cls) {
      return '<div class="myr-hint ' + (cls || '') + '">' + msg + '</div>';
    }
    function hintText() {
      if (cooldown) return hintHTML('⏳ Уже оценено. Повторно через 24 часа.', 'warn');
      if (myScore) return hintHTML('Можно изменить оценку', 'ok');
      return hintHTML('Каждую карточку можно оценить раз в 24 часа', '');
    }
    function starsHTML(cur) {
      var r1 = '', r2 = '';
      for (var i = 1; i <= 10; i++) {
        var cl = i <= cur ? ' filled' : '';
        var btn = '<button class="myr-star-btn" data-n="' + i + '">' +
          '<span class="myr-star-ico' + cl + '">★</span>' +
          '<span class="myr-star-num">' + i + '</span></button>';
        if (i <= 7) r1 += btn; else r2 += btn;
      }
      return '<div class="myr-grid-1">' + r1 + '</div><div class="myr-grid-2">' + r2 + '</div>';
    }

    var overlay = document.createElement('div');
    overlay.className = 'myr-overlay';
    overlay.innerHTML =
      '<div class="myr-sheet">' +
        '<div class="myr-title">Поставьте оценку</div>' +
        '<div class="myr-film-row">' +
          '<div class="myr-poster">' + (poster ? '<img src="' + poster + '"/>' : '') + '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div class="myr-year">' + year + '</div>' +
            '<div class="myr-name">' + name + '</div>' +
            '<div class="myr-stats">' +
              '<span>★ <span id="myr-avg">' + avgStr + '</span></span>' +
              '<div class="myr-vsep"></div>' +
              '<span>👤 <span id="myr-votes">' + votes + '</span></span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div id="myr-stars">' + starsHTML(myScore) + '</div>' +
        '<div id="myr-hint">' + hintText() + '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    var starsEl = overlay.querySelector('#myr-stars');

    starsEl.addEventListener('mouseover', function (e) {
      var b = e.target.closest('.myr-star-btn');
      if (!b) return;
      var n = +b.dataset.n;
      starsEl.querySelectorAll('.myr-star-ico').forEach(function (s, i) {
        s.className = 'myr-star-ico' + (i < n ? ' hovered' : '');
      });
    });
    starsEl.addEventListener('mouseleave', function () {
      var sc = (getEntry(id) || {}).score || 0;
      starsEl.querySelectorAll('.myr-star-ico').forEach(function (s, i) {
        s.className = 'myr-star-ico' + (i < sc ? ' filled' : '');
      });
    });

    function onPick(e) {
      var b = e.target.closest('.myr-star-btn');
      if (!b) return;
      if (cooldown) {
        overlay.querySelector('#myr-hint').innerHTML = hintHTML('⏳ Повторно через 24 часа.', 'warn');
        return;
      }
      var n = +b.dataset.n;
      var saved = addVote(id, n);
      myScore = n;
      var avg2 = (saved.sum / saved.votes).toFixed(1);
      overlay.querySelector('#myr-avg').textContent = avg2;
      overlay.querySelector('#myr-votes').textContent = saved.votes;
      overlay.querySelector('#myr-stars').innerHTML = starsHTML(n);
      overlay.querySelector('#myr-hint').innerHTML =
        hintHTML('✅ Вы поставили ' + n + '/10! Средний рейтинг: ' + avg2, 'ok');
      cooldown = true;
      updateBtn(id);
    }
    starsEl.addEventListener('click', onPick);
    starsEl.addEventListener('touchend', function (e) { e.preventDefault(); onPick(e); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) document.body.removeChild(overlay);
    });
  }

  function updateBtn(id) {
    var btn = document.querySelector('.my-rating-btn[data-film-id="' + id + '"]');
    if (!btn) return;
    var e = getEntry(id);
    if (e) {
      btn.classList.add('rated');
      btn.title = 'Моя оценка: ' + e.score + '/10';
      btn.innerHTML = '<span class="myr-btn-ico">★</span><span class="myr-btn-lbl">' + e.score + '/10</span>';
    } else {
      btn.classList.remove('rated');
      btn.title = 'Поставить оценку';
      btn.innerHTML = '<span class="myr-btn-ico">☆</span><span class="myr-btn-lbl">Оценить</span>';
    }
  }

  function addButton(component, card) {
    if (!card || !card.id) return;
    var id = String(card.id);
    injectStyles();

    var btn = document.createElement('button');
    btn.className = 'my-rating-btn selector';
    btn.setAttribute('data-film-id', id);
    btn.setAttribute('tabindex', '0');
    var e = getEntry(id);
    if (e) {
      btn.classList.add('rated');
      btn.title = 'Моя оценка: ' + e.score + '/10';
      btn.innerHTML = '<span class="myr-btn-ico">★</span><span class="myr-btn-lbl">' + e.score + '/10</span>';
    } else {
      btn.title = 'Поставить оценку';
      btn.innerHTML = '<span class="myr-btn-ico">☆</span><span class="myr-btn-lbl">Оценить</span>';
    }
    btn.addEventListener('click', function () { openModal(card); });
    btn.addEventListener('keyup', function (ev) { if (ev.keyCode === 13) openModal(card); });

    var actions = component.find(
      '.full-start__buttons, .card-full__buttons, [class*="buttons"]'
    ).first();
    if (actions.length) actions.append(btn);
    else component.append(btn);

    injectCardBadge(component, id);
  }

  Lampa.Listener.follow('full', function (e) {
    if (e.type === 'complite') {
      var card = e.data && (e.data.movie || e.data.card || e.data);
      addButton(e.object.render(), card);
    }
  });

  console.log('[MyRating] v2.0 загружен.');
})();