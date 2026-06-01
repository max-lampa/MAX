(function () {
  'use strict';

  var STORAGE_KEY = 'lampa_my_ratings_v1';
  var AUTHOR = 'MaksTV';

  /* ── helpers ── */
  function load() {
    try { return JSON.parse(Lampa.Storage.get(STORAGE_KEY, '{}')); }
    catch (e) { return {}; }
  }
  
  function save(data) {
    Lampa.Storage.set(STORAGE_KEY, JSON.stringify(data));
  }
  
  function getEntry(id) { 
    return load()[id] || null; 
  }
  
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
  var CSS = `
    .my-rating-btn {
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 14px;
      padding: 12px 20px;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    .my-rating-btn:hover {
      background: rgba(255,255,255,0.25);
      border-color: rgba(255,255,255,0.5);
      transform: translateY(-2px);
    }
    .my-rating-btn.rated {
      background: linear-gradient(135deg, #f5a623 0%, #f76b1c 100%);
      border-color: #f5a623;
      box-shadow: 0 4px 15px rgba(245,166,35,0.4);
    }
    .my-rating-btn.rated:hover {
      background: linear-gradient(135deg, #f7b733 0%, #fc7e20 100%);
      box-shadow: 0 6px 20px rgba(245,166,35,0.6);
    }
    
    .my-rating-display {
      background: linear-gradient(135deg, rgba(245,166,35,0.95) 0%, rgba(247,107,28,0.95) 100%);
      border-radius: 12px;
      padding: 16px 24px;
      margin: 15px 0;
      display: inline-flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 4px 20px rgba(245,166,35,0.3);
      border: 2px solid rgba(255,255,255,0.2);
    }
    .my-rating-display-icon {
      font-size: 32px;
      line-height: 1;
    }
    .my-rating-display-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .my-rating-display-label {
      font-size: 12px;
      color: rgba(255,255,255,0.85);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .my-rating-display-value {
      font-size: 26px;
      color: #fff;
      font-weight: 700;
      line-height: 1;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .my-rating-display-stats {
      font-size: 11px;
      color: rgba(255,255,255,0.75);
    }
    
    .myr-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .myr-sheet {
      width: 100%;
      max-width: 520px;
      background: #1e1e24;
      border-radius: 26px 26px 0 0;
      padding: 28px 24px 50px;
      position: relative;
    }
    .myr-title {
      font-size: 26px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 20px;
    }
    .myr-film-row {
      display: flex;
      gap: 16px;
      margin-bottom: 26px;
    }
    .myr-poster {
      width: 100px;
      height: 148px;
      border-radius: 12px;
      overflow: hidden;
      background: #2a2a2a;
      flex-shrink: 0;
    }
    .myr-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .myr-year {
      font-size: 14px;
      color: #aaa;
      margin-bottom: 4px;
    }
    .myr-name {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 10px;
    }
    .myr-stats {
      display: inline-flex;
      align-items: center;
      background: #2a2a2a;
      border-radius: 10px;
      overflow: hidden;
      font-size: 15px;
      color: #fff;
    }
    .myr-stats span {
      padding: 6px 12px;
    }
    .myr-stats .sep {
      width: 1px;
      background: #444;
      align-self: stretch;
    }
    .myr-grid-1 {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }
    .myr-grid-2 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 0 auto 22px;
      max-width: calc(3 * (100% / 7) + 2 * 8px);
    }
    .myr-star-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px;
      cursor: pointer;
      padding: 10px 4px;
      transition: all 0.2s;
    }
    .myr-star-btn:hover {
      background: rgba(255,255,255,0.18);
      border-color: rgba(255,255,255,0.3);
      transform: scale(1.08);
    }
    .myr-star-ico {
      font-size: 32px;
      color: #555;
      transition: color 0.15s;
      line-height: 1;
    }
    .myr-star-ico.filled {
      color: #f5a623;
      text-shadow: 0 0 12px rgba(245,166,35,0.6);
    }
    .myr-star-ico.hovered {
      color: #f5a623;
      opacity: 0.7;
    }
    .myr-star-num {
      font-size: 14px;
      color: #ddd;
      font-weight: 600;
    }
    .myr-hint {
      background: #2a2a2a;
      border-radius: 14px;
      padding: 14px 18px;
      text-align: center;
      font-size: 14px;
      color: #aaa;
      line-height: 1.5;
    }
    .myr-hint.ok {
      background: #1f3322;
      color: #5dba7e;
      font-weight: 600;
    }
    .myr-author {
      position: absolute;
      bottom: 10px;
      right: 14px;
      font-size: 10px;
      color: rgba(255,255,255,0.4);
      font-style: italic;
    }
  `;

  function injectStyles() {
    if (document.getElementById('my-rating-css')) return;
    var style = document.createElement('style');
    style.id = 'my-rating-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ── Modal ── */
  function openModal(card) {
    injectStyles();
    
    var id = String(card.id || card.kinopoisk_id || card.imdb_id || '');
    if (!id) return;
    
    var name = card.title || card.name || 'Без названия';
    var year = card.release_year || card.year || '';
    var poster = '';
    if (card.poster) {
      poster = card.poster.high || card.poster.medium || card.poster;
    }

    var overlay = document.createElement('div');
    overlay.className = 'myr-overlay';

    var entry = getEntry(id);
    var myScore = entry ? entry.score : 0;
    var avgStr = entry && entry.votes ? (entry.sum / entry.votes).toFixed(1) : '—';
    var votesStr = entry ? entry.votes : 0;
    var cooldown = !canRate(id);

    function hintHTML(msg, ok) {
      return '<div class="myr-hint' + (ok ? ' ok' : '') + '">' + msg + '</div>';
    }
    
    function hintText() {
      if (cooldown) return hintHTML('⏳ Вы уже оценили. Повторно через 24 часа.', false);
      if (myScore) return hintHTML('✅ Можно изменить оценку', true);
      return hintHTML('Каждую карточку можно оценить раз в 24 часа', false);
    }
    
    function starsHTML(current) {
      var r1 = '', r2 = '';
      for (var i = 1; i <= 10; i++) {
        var cls = i <= current ? ' filled' : '';
        var star = '<button class="myr-star-btn" data-n="' + i + '">' +
          '<span class="myr-star-ico' + cls + '">★</span>' +
          '<span class="myr-star-num">' + i + '</span></button>';
        if (i <= 7) r1 += star; 
        else r2 += star;
      }
      return '<div class="myr-grid-1">' + r1 + '</div><div class="myr-grid-2">' + r2 + '</div>';
    }

    overlay.innerHTML =
      '<div class="myr-sheet">' +
        '<div class="myr-title">Поставьте оценку</div>' +
        '<div class="myr-film-row">' +
          '<div class="myr-poster">' + (poster ? '<img src="' + poster + '" />' : '') + '</div>' +
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
        '<div class="myr-author">by ' + AUTHOR + '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    var starsEl = overlay.querySelector('#myr-stars');

    // Hover effect
    starsEl.addEventListener('mouseover', function(e) {
      var btn = e.target.closest('.myr-star-btn');
      if (!btn) return;
      var n = +btn.dataset.n;
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

    // Click
    function onPick(e) {
      var btn = e.target.closest('.myr-star-btn');
      if (!btn) return;
      
      if (cooldown) {
        overlay.querySelector('#myr-hint').innerHTML = hintHTML('⏳ Повторно можно через 24 часа.', false);
        return;
      }
      
      var n = +btn.dataset.n;
      var saved = addVote(id, n);
      myScore = n;
      var avg2 = (saved.sum / saved.votes).toFixed(1);
      
      overlay.querySelector('#myr-avg').textContent = avg2;
      overlay.querySelector('#myr-votes').textContent = saved.votes;
      overlay.querySelector('#myr-stars').innerHTML = starsHTML(n);
      overlay.querySelector('#myr-hint').innerHTML = hintHTML('✅ Вы поставили ' + n + '/10! Средний: ' + avg2, true);
      
      cooldown = true;
      updateBtn(id);
      updateRatingDisplay(id);
    }
    
    starsEl.addEventListener('click', onPick);

    // Close
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }

  /* ── Rating Display ── */
  function updateRatingDisplay(id) {
    var display = document.querySelector('.my-rating-display[data-film-id="' + id + '"]');
    var e = getEntry(id);
    
    if (!e && display) {
      display.remove();
      return;
    }
    
    if (!e) return;
    
    if (!display) {
      var container = document.querySelector('.full-start__buttons');
      if (!container) {
        container = document.querySelector('[class*="full-start"]');
      }
      if (!container) return;
      
      display = document.createElement('div');
      display.className = 'my-rating-display';
      display.setAttribute('data-film-id', id);
      container.parentNode.insertBefore(display, container);
    }
    
    var avg = (e.sum / e.votes).toFixed(1);
    display.innerHTML = 
      '<div class="my-rating-display-icon">★</div>' +
      '<div class="my-rating-display-text">' +
        '<div class="my-rating-display-label">Моя оценка</div>' +
        '<div class="my-rating-display-value">' + e.score + '/10</div>' +
        '<div class="my-rating-display-stats">Средняя: ' + avg + ' • Голосов: ' + e.votes + '</div>' +
      '</div>';
  }

  /* ── Button ── */
  function updateBtn(id) {
    var btn = document.querySelector('.my-rating-btn[data-film-id="' + id + '"]');
    if (!btn) return;
    
    var e = getEntry(id);
    if (e) {
      btn.classList.add('rated');
      btn.title = 'Моя оценка: ' + e.score + '/10';
      btn.innerHTML = '★ ' + e.score;
    } else {
      btn.classList.remove('rated');
      btn.title = 'Поставить оценку';
      btn.innerHTML = '☆ Оценить';
    }
  }

  function addButton(component, card) {
    if (!card) return;
    
    var id = String(card.id || card.kinopoisk_id || card.imdb_id || '');
    if (!id) return;
    
    injectStyles();

    var btn = document.createElement('button');
    btn.className = 'my-rating-btn selector';
    btn.setAttribute('data-film-id', id);
    
    var e = getEntry(id);
    btn.innerHTML = e ? '★ ' + e.score : '☆ Оценить';
    btn.title = e ? 'Моя оценка: ' + e.score + '/10' : 'Поставить оценку';
    if (e) btn.classList.add('rated');

    btn.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      openModal(card);
    });

    var actions = component.find('.full-start__buttons').eq(0);
    if (actions.length) {
      actions.append(btn);
      updateRatingDisplay(id);
    }
  }

  /* ── Init ── */
  Lampa.Listener.follow('full', function(e) {
    if (e.type === 'complite') {
      var card = e.data && (e.data.movie || e.data.card || e.data);
      if (card) {
        addButton(e.object.render(), card);
      }
    }
  });

  console.log('[MyRating] Плагин загружен. Автор: ' + AUTHOR);
})();