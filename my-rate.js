(function () {
  'use strict';

  var STORAGE_KEY = 'lampa_my_ratings_v1';

  /* ── helpers ── */
  function load() {
    try { return JSON.parse(Lampa.Storage.get(STORAGE_KEY, '{}')); }
    catch (e) { return {}; }
  }
  function save(data) {
    Lampa.Storage.set(STORAGE_KEY, JSON.stringify(data));
  }
  function getEntry(id) { return load()[id] || null; }
  function canRate(id) {
    var e = getEntry(id);
    return !e || (Date.now() - e.ts) > 86400000;
  }
  function addVote(id, score) {
    var data = load();
    var e = data[id];
    if (e) {
      e.votes++;
      e.sum += score;
      e.score = score;
      e.ts = Date.now();
    } else {
      data[id] = { score: score, ts: Date.now(), votes: 1, sum: score };
    }
    save(data);
    return data[id];
  }

  /* ── styles ── */
  var CSS = [
    '.my-rating-btn{background:#2a2a2a;border:none;border-radius:14px;',
    'padding:12px 16px;color:#fff;font-size:20px;cursor:pointer;',
    'transition:background .2s;display:inline-flex;align-items:center;',
    'justify-content:center;outline:none;}',
    '.my-rating-btn.rated{background:#f5a623;color:#fff;}',
    '.myr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);',
    'backdrop-filter:blur(6px);z-index:9999;display:flex;',
    'align-items:flex-end;justify-content:center;}',
    '.myr-sheet{width:100%;max-width:520px;background:#1e1e24;',
    'border-radius:26px 26px 0 0;padding:28px 24px 50px;}',
    '.myr-title{font-size:26px;font-weight:700;color:#fff;margin:0 0 20px;}',
    '.myr-film-row{display:flex;gap:16px;margin-bottom:26px;}',
    '.myr-poster{width:100px;height:148px;border-radius:12px;',
    'overflow:hidden;background:#2a2a2a;flex-shrink:0;}',
    '.myr-poster img{width:100%;height:100%;object-fit:cover;}',
    '.myr-year{font-size:14px;color:#aaa;margin-bottom:4px;}',
    '.myr-name{font-size:20px;font-weight:700;color:#fff;margin-bottom:10px;}',
    '.myr-stats{display:inline-flex;align-items:center;',
    'background:#2a2a2a;border-radius:10px;overflow:hidden;font-size:15px;color:#fff;}',
    '.myr-stats span{padding:6px 12px;}',
    '.myr-stats .sep{width:1px;background:#444;align-self:stretch;}',
    '.myr-grid-1{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:10px;}',
    '.myr-grid-2{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;',
    'margin:0 auto 22px;max-width:calc(3*(100%/7) + 2*6px);}',
    '.myr-star-btn{display:flex;flex-direction:column;align-items:center;',
    'gap:3px;background:none;border:none;cursor:pointer;padding:2px;}',
    '.myr-star-ico{font-size:30px;color:#555;transition:color .15s;line-height:1;}',
    '.myr-star-ico.filled{color:#f5a623;}',
    '.myr-star-ico.hovered{color:#f5a623;opacity:.7;}',
    '.myr-star-num{font-size:12px;color:#888;}',
    '.myr-hint{background:#2a2a2a;border-radius:14px;padding:14px 18px;',
    'text-align:center;font-size:14px;color:#aaa;line-height:1.5;}',
    '.myr-hint.ok{background:#1f3322;color:#5dba7e;font-weight:600;}'
  ].join('');

  function injectStyles() {
    if (document.getElementById('my-rating-css')) return;
    var s = document.createElement('style');
    s.id = 'my-rating-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── Modal ── */
  function openModal(card) {
    injectStyles();
    var id   = String(card.id || card.kinopoisk_id || card.imdb_id || card.title);
    var name = card.title || card.name || 'Без названия';
    var year = card.release_year || card.year || '';
    var poster = (card.poster && card.poster.high) || card.poster || '';

    var overlay = document.createElement('div');
    overlay.className = 'myr-overlay';

    var entry = getEntry(id);
    var myScore = entry ? entry.score : 0;
    var avgStr = entry && entry.votes
      ? (entry.sum / entry.votes).toFixed(1) : '—';
    var votesStr = entry ? entry.votes : 0;
    var cooldown = !canRate(id);

    function hintHTML(msg, ok) {
      return '<div class="myr-hint' + (ok ? ' ok' : '') + '">' + msg + '</div>';
    }
    function hintText() {
      if (cooldown) return hintHTML('⏳ Вы уже оценили. Повторно через 24 часа.', false);
      if (myScore) return hintHTML('Можно изменить оценку', true);
      return hintHTML('Каждую карточку можно оценить раз в 24 часа', false);
    }
    function starsHTML(current) {
      var r1 = '', r2 = '';
      for (var i = 1; i <= 10; i++) {
        var cls = i <= current ? ' filled' : '';
        var star = '<button class="myr-star-btn" data-n="' + i + '">' +
          '<span class="myr-star-ico' + cls + '">★</span>' +
          '<span class="myr-star-num">' + i + '</span></button>';
        if (i <= 7) r1 += star; else r2 += star;
      }
      return '<div class="myr-grid-1">' + r1 + '</div>' +
             '<div class="myr-grid-2">' + r2 + '</div>';
    }

    overlay.innerHTML =
      '<div class="myr-sheet" id="myr-sheet">' +
        '<div class="myr-title">Поставьте оценку</div>' +
        '<div class="myr-film-row">' +
          '<div class="myr-poster"><img src="' + poster + '" /></div>' +
          '<div>' +
            '<div class="myr-year">' + year + '</div>' +
            '<div class="myr-name">' + name + '</div>' +
            '<div class="myr-stats">' +
              '<span>★ <span id="myr-avg">' + avgStr + '</span></span>' +
              '<div class="sep"></div>' +
              '<span>👤 <span id="myr-votes">' + votesStr + '</span></span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div id="myr-stars">' + starsHTML(myScore) + '</div>' +
        '<div id="myr-hint">' + hintText() + '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    /* hover */
    var starsEl = overlay.querySelector('#myr-stars');
    starsEl.addEventListener('mouseover', function(e) {
      var b = e.target.closest('.myr-star-btn');
      if (!b) return;
      var n = +b.dataset.n;
      starsEl.querySelectorAll('.myr-star-ico').forEach(function(s, idx) {
        s.className = 'myr-star-ico' + (idx < n ? ' hovered' : '');
      });
    });
    starsEl.addEventListener('mouseleave', function() {
      var cur = getEntry(id);
      var sc = cur ? cur.score : 0;
      starsEl.querySelectorAll('.myr-star-ico').forEach(function(s, idx) {
        s.className = 'myr-star-ico' + (idx < sc ? ' filled' : '');
      });
    });

    /* click / touch */
    function onPick(e) {
      var b = e.target.closest('.myr-star-btn');
      if (!b) return;
      if (cooldown) {
        overlay.querySelector('#myr-hint').innerHTML =
          hintHTML('⏳ Повторно можно через 24 часа.', false);
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
        hintHTML('✅ Вы поставили ' + n + '/10! Средний рейтинг: ' + avg2, true);
      cooldown = true;
      /* update button in card */
      updateBtn(id);
    }
    starsEl.addEventListener('click', onPick);
    starsEl.addEventListener('touchend', function(e) {
      e.preventDefault(); onPick(e);
    });

    /* close on overlay click */
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }

  /* ── Button in card ── */
  function updateBtn(id) {
    var btn = document.querySelector('.my-rating-btn[data-film-id="' + id + '"]');
    if (!btn) return;
    var e = getEntry(id);
    if (e) {
      btn.classList.add('rated');
      btn.title = 'Моя оценка: ' + e.score + '/10';
      btn.innerHTML = '★';
    } else {
      btn.classList.remove('rated');
      btn.title = 'Поставить оценку';
      btn.innerHTML = '☆';
    }
  }

  /* ── Hook into Lampa ── */
  function addButton(component, card) {
    if (!card || !card.id) return;
    var id = String(card.id);
    injectStyles();

    var btn = document.createElement('button');
    btn.className = 'my-rating-btn selector';
    btn.setAttribute('data-film-id', id);
    btn.setAttribute('tabindex', '0');
    var e = getEntry(id);
    btn.innerHTML = e ? '★' : '☆';
    btn.title = e ? 'Моя оценка: ' + e.score + '/10' : 'Поставить оценку';
    if (e) btn.classList.add('rated');

    btn.addEventListener('click', function () { openModal(card); });

    /* Lampa focus/select */
    btn.addEventListener('keyup', function (ev) {
      if (ev.keyCode === 13) openModal(card);
    });

    /* Find actions container */
    var actions = component.find('.full-start__buttons, .card-full__buttons, [class*="buttons"]').first();
    if (actions.length) {
      actions.append(btn);
    } else {
      /* fallback: append to component root */
      component.append(btn);
    }
  }

  /* ── Register plugin ── */
  Lampa.Listener.follow('full', function (e) {
    if (e.type === 'complite') {
      var card = e.data && (e.data.movie || e.data.card || e.data);
      addButton(e.object.render(), card);
    }
  });

  console.log('[MyRating] Плагин "Личный рейтинг" загружен.');
})();