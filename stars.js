(function () {
  'use strict';

  var STORAGE_KEY = 'lampa_my_ratings_v1';
  var SETTINGS_KEY = 'lampa_my_ratings_settings';
  var AUTHOR = 'MaksTV';
  
  /* ── Default Settings ── */
  var DEFAULT_SETTINGS = {
    storageTime: 0, // 0 = бессрочно, или дни (30, 90, 180, 365)
    cooldownTime: 24 // часы между повторными оценками
  };

  /* ── helpers ── */
  function getSettings() {
    try {
      var s = JSON.parse(Lampa.Storage.get(SETTINGS_KEY, '{}'));
      return Object.assign({}, DEFAULT_SETTINGS, s);
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }
  
  function saveSettings(settings) {
    Lampa.Storage.set(SETTINGS_KEY, JSON.stringify(settings));
  }

  function load() {
    try { 
      var data = JSON.parse(Lampa.Storage.get(STORAGE_KEY, '{}'));
      return cleanOldRatings(data);
    }
    catch (e) { return {}; }
  }
  
  function cleanOldRatings(data) {
    var settings = getSettings();
    if (settings.storageTime === 0) return data; // бессрочное хранение
    
    var maxAge = settings.storageTime * 24 * 60 * 60 * 1000; // дни в миллисекунды
    var now = Date.now();
    var cleaned = {};
    var removed = 0;
    
    Object.keys(data).forEach(function(id) {
      if (now - data[id].ts < maxAge) {
        cleaned[id] = data[id];
      } else {
        removed++;
      }
    });
    
    if (removed > 0) {
      console.log('[MyRating] Удалено старых оценок: ' + removed);
      save(cleaned);
    }
    
    return cleaned;
  }
  
  function save(data) {
    Lampa.Storage.set(STORAGE_KEY, JSON.stringify(data));
  }
  
  function getEntry(id) { return load()[id] || null; }
  
  function canRate(id) {
    var e = getEntry(id);
    var settings = getSettings();
    var cooldown = settings.cooldownTime * 60 * 60 * 1000; // часы в миллисекунды
    return !e || (Date.now() - e.ts) > cooldown;
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
  
  function getTotalRatings() {
    return Object.keys(load()).length;
  }

  /* ── styles ── */
  var CSS = [
    '.my-rating-btn{background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);',
    'border-radius:14px;padding:12px 16px;color:#fff;font-size:20px;cursor:pointer;',
    'transition:all .3s;display:inline-flex;align-items:center;gap:8px;',
    'justify-content:center;outline:none;font-weight:600;text-shadow:0 1px 3px rgba(0,0,0,0.5);}',
    '.my-rating-btn:hover{background:rgba(255,255,255,0.25);border-color:rgba(255,255,255,0.5);',
    'transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.3);}',
    '.my-rating-btn.rated{background:linear-gradient(135deg, #f5a623 0%, #f76b1c 100%);',
    'border-color:#f5a623;box-shadow:0 4px 15px rgba(245,166,35,0.4);}',
    '.my-rating-btn.rated:hover{background:linear-gradient(135deg, #f7b733 0%, #fc7e20 100%);',
    'box-shadow:0 6px 20px rgba(245,166,35,0.6);}',
    '.my-rating-score{font-size:16px;font-weight:700;margin-left:4px;}',
    
    '.my-rating-display{background:linear-gradient(135deg, rgba(245,166,35,0.95) 0%, rgba(247,107,28,0.95) 100%);',
    'border-radius:12px;padding:14px 20px;margin:15px 0;display:inline-flex;align-items:center;gap:12px;',
    'box-shadow:0 4px 20px rgba(245,166,35,0.3);border:2px solid rgba(255,255,255,0.2);}',
    '.my-rating-display-icon{font-size:28px;line-height:1;}',
    '.my-rating-display-text{display:flex;flex-direction:column;gap:2px;}',
    '.my-rating-display-label{font-size:12px;color:rgba(255,255,255,0.85);font-weight:500;',
    'text-transform:uppercase;letter-spacing:0.5px;}',
    '.my-rating-display-value{font-size:24px;color:#fff;font-weight:700;line-height:1;',
    'text-shadow:0 2px 4px rgba(0,0,0,0.3);}',
    '.my-rating-display-stats{font-size:11px;color:rgba(255,255,255,0.75);margin-top:2px;}',
    
    '.myr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);',
    'backdrop-filter:blur(6px);z-index:9999;display:flex;',
    'align-items:flex-end;justify-content:center;}',
    '.myr-sheet{width:100%;max-width:520px;background:#1e1e24;',
    'border-radius:26px 26px 0 0;padding:28px 24px 50px;position:relative;}',
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
    'gap:3px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);',
    'border-radius:10px;cursor:pointer;padding:8px 4px;transition:all .2s;}',
    '.myr-star-btn:hover{background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.3);',
    'transform:scale(1.05);}',
    '.myr-star-ico{font-size:30px;color:#555;transition:color .15s;line-height:1;}',
    '.myr-star-ico.filled{color:#f5a623;text-shadow:0 0 10px rgba(245,166,35,0.6);}',
    '.myr-star-ico.hovered{color:#f5a623;opacity:.7;}',
    '.myr-star-num{font-size:13px;color:#ccc;font-weight:600;}',
    '.myr-hint{background:#2a2a2a;border-radius:14px;padding:14px 18px;',
    'text-align:center;font-size:14px;color:#aaa;line-height:1.5;}',
    '.myr-hint.ok{background:#1f3322;color:#5dba7e;font-weight:600;}',
    '.myr-author{position:absolute;bottom:8px;right:12px;font-size:10px;',
    'color:rgba(255,255,255,0.4);font-style:italic;}',
    
    '.myr-settings-btn{position:absolute;top:28px;right:24px;background:rgba(255,255,255,0.1);',
    'border:1px solid rgba(255,255,255,0.2);border-radius:8px;width:32px;height:32px;',
    'display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;',
    'font-size:18px;transition:all .2s;}',
    '.myr-settings-btn:hover{background:rgba(255,255,255,0.2);transform:rotate(30deg);}',
    '.myr-settings-panel{background:#252530;border-radius:14px;padding:20px;margin-bottom:20px;',
    'display:none;}',
    '.myr-settings-panel.active{display:block;}',
    '.myr-setting-row{margin-bottom:16px;}',
    '.myr-setting-row:last-child{margin-bottom:0;}',
    '.myr-setting-label{font-size:14px;color:#ccc;margin-bottom:8px;display:block;}',
    '.myr-setting-select{width:100%;background:#1e1e24;border:1px solid rgba(255,255,255,0.2);',
    'border-radius:8px;padding:10px 12px;color:#fff;font-size:14px;cursor:pointer;}',
    '.myr-setting-select:focus{outline:none;border-color:#f5a623;}',
    '.myr-setting-info{font-size:12px;color:#888;margin-top:6px;line-height:1.4;}',
    '.myr-stats-row{display:flex;justify-content:space-between;align-items:center;',
    'background:#1e1e24;border-radius:8px;padding:12px;margin-top:12px;}',
    '.myr-stats-item{text-align:center;}',
    '.myr-stats-value{font-size:18px;font-weight:700;color:#f5a623;}',
    '.myr-stats-label{font-size:11px;color:#888;margin-top:4px;}'
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
    var settings = getSettings();

    function hintHTML(msg, ok) {
      return '<div class="myr-hint' + (ok ? ' ok' : '') + '">' + msg + '</div>';
    }
    function hintText() {
      if (cooldown) {
        var timeLeft = settings.cooldownTime;
        return hintHTML('⏳ Вы уже оценили. Повторно через ' + timeLeft + ' ч.', false);
      }
      if (myScore) return hintHTML('Можно изменить оценку', true);
      return hintHTML('Каждую карточку можно оценить раз в ' + settings.cooldownTime + ' ч.', false);
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

    function getStorageText() {
      if (settings.storageTime === 0) return 'Бессрочно';
      if (settings.storageTime === 30) return '30 дней';
      if (settings.storageTime === 90) return '3 месяца';
      if (settings.storageTime === 180) return '6 месяцев';
      if (settings.storageTime === 365) return '1 год';
      return settings.storageTime + ' дней';
    }

    overlay.innerHTML =
      '<div class="myr-sheet" id="myr-sheet">' +
        '<div class="myr-settings-btn" id="myr-settings-btn">⚙</div>' +
        '<div class="myr-title">Поставьте оценку</div>' +
        
        '<div class="myr-settings-panel" id="myr-settings-panel">' +
          '<div class="myr-setting-row">' +
            '<label class="myr-setting-label">Хранить оценки</label>' +
            '<select class="myr-setting-select" id="myr-storage-time">' +
              '<option value="0"' + (settings.storageTime === 0 ? ' selected' : '') + '>Бессрочно</option>' +
              '<option value="30"' + (settings.storageTime === 30 ? ' selected' : '') + '>30 дней</option>' +
              '<option value="90"' + (settings.storageTime === 90 ? ' selected' : '') + '>3 месяца</option>' +
              '<option value="180"' + (settings.storageTime === 180 ? ' selected' : '') + '>6 месяцев</option>' +
              '<option value="365"' + (settings.storageTime === 365 ? ' selected' : '') + '>1 год</option>' +
            '</select>' +
            '<div class="myr-setting-info">После этого срока оценки будут удалены</div>' +
          '</div>' +
          '<div class="myr-setting-row">' +
            '<label class="myr-setting-label">Задержка между оценками</label>' +
            '<select class="myr-setting-select" id="myr-cooldown-time">' +
              '<option value="1"' + (settings.cooldownTime === 1 ? ' selected' : '') + '>1 час</option>' +
              '<option value="6"' + (settings.cooldownTime === 6 ? ' selected' : '') + '>6 часов</option>' +
              '<option value="12"' + (settings.cooldownTime === 12 ? ' selected' : '') + '>12 часов</option>' +
              '<option value="24"' + (settings.cooldownTime === 24 ? ' selected' : '') + '>24 часа</option>' +
              '<option value="48"' + (settings.cooldownTime === 48 ? ' selected' : '') + '>48 часов</option>' +
            '</select>' +
            '<div class="myr-setting-info">Как часто можно менять оценку одного фильма</div>' +
          '</div>' +
          '<div class="myr-stats-row">' +
            '<div class="myr-stats-item">' +
              '<div class="myr-stats-value">' + getTotalRatings() + '</div>' +
              '<div class="myr-stats-label">Всего оценок</div>' +
            '</div>' +
            '<div class="myr-stats-item">' +
              '<div class="myr-stats-value">' + getStorageText() + '</div>' +
              '<div class="myr-stats-label">Хранение</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        
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
        '<div class="myr-author">by ' + AUTHOR + '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    /* Settings toggle */
    var settingsBtn = overlay.querySelector('#myr-settings-btn');
    var settingsPanel = overlay.querySelector('#myr-settings-panel');
    settingsBtn.addEventListener('click', function() {
      settingsPanel.classList.toggle('active');
    });

    /* Settings change */
    overlay.querySelector('#myr-storage-time').addEventListener('change', function(e) {
      settings.storageTime = parseInt(e.target.value);
      saveSettings(settings);
      cleanOldRatings(load());
      overlay.querySelector('.myr-stats-value').textContent = getTotalRatings();
      var storageLabels = {0: 'Бессрочно', 30: '30 дней', 90: '3 месяца', 180: '6 месяцев', 365: '1 год'};
      overlay.querySelectorAll('.myr-stats-value')[1].textContent = storageLabels[settings.storageTime];
    });

    overlay.querySelector('#myr-cooldown-time').addEventListener('change', function(e) {
      settings.cooldownTime = parseInt(e.target.value);
      saveSettings(settings);
    });

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
          hintHTML('⏳ Повторно можно через ' + settings.cooldownTime + ' ч.', false);
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
      overlay.querySelector('.myr-stats-value').textContent = getTotalRatings();
      cooldown = true;
      updateBtn(id);
      updateRatingDisplay(id);
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

  /* ── Rating Display in Card ── */
  function updateRatingDisplay(id) {
    var display = document.querySelector('.my-rating-display[data-film-id="' + id + '"]');
    var e = getEntry(id);
    
    if (!e && display) {
      display.remove();
      return;
    }
    
    if (!e) return;
    
    if (!display) {
      var container = document.querySelector('.full-start-new__buttons, .card-full__buttons, [class*="buttons"]');
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

  /* ── Button in card ── */
  function updateBtn(id) {
    var btn = document.querySelector('.my-rating-btn[data-film-id="' + id + '"]');
    if (!btn) return;
    var e = getEntry(id);
    if (e) {
      btn.classList.add('rated');
      btn.title = 'Моя оценка: ' + e.score + '/10';
      btn.innerHTML = '★<span class="my-rating-score">' + e.score + '</span>';
    } else {
      btn.classList.remove('rated');
      btn.title = 'Поставить оценку';
      btn.innerHTML = '☆ Оценить';
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
    btn.innerHTML = e ? '★<span class="my-rating-score">' + e.score + '</span>' : '☆ Оценить';
    btn.title = e ? 'Моя оценка: ' + e.score + '/10' : 'Поставить оценку';
    if (e) btn.classList.add('rated');

    btn.addEventListener('click', function () { openModal(card); });

    btn.addEventListener('keyup', function (ev) {
      if (ev.keyCode === 13) openModal(card);
    });

    var actions = component.find('.full-start__buttons, .card-full__buttons, [class*="buttons"]').first();
    if (actions.length) {
      actions.append(btn);
    } else {
      component.append(btn);
    }
    
    updateRatingDisplay(id);
  }

  /* ── Register plugin ── */
  Lampa.Listener.follow('full', function (e) {
    if (e.type === 'complite') {
      var card = e.data && (e.data.movie || e.data.card || e.data);
      addButton(e.object.render(), card);
    }
  }); 

  console.log('[MyRating] Плагин "Личный рейтинг" загружен. Автор: ' + AUTHOR);
  console.log('[MyRating] Всего оценок: ' + getTotalRatings());
})();