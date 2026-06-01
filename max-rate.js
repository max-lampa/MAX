(function () {
  'use strict';

  /* ─── Хранилище ─── */
  var KEY = 'my_ratings_v1';

  function load() {
    try { return JSON.parse(Lampa.Storage.get(KEY, '{}')); }
    catch (e) { return {}; }
  }
  function save(d) { Lampa.Storage.set(KEY, JSON.stringify(d)); }

  function getEntry(id) { return load()[id] || null; }

  function canRate(id) {
    var e = getEntry(id);
    return !e || (Date.now() - e.ts) > 86400000; /* 24 ч */
  }

  function addVote(id, score) {
    var d = load(), e = d[id];
    if (e) { e.votes++; e.sum += score; e.score = score; e.ts = Date.now(); }
    else   { d[id] = { score: score, ts: Date.now(), votes: 1, sum: score }; }
    save(d);
    return d[id];
  }

  /* ─── Стили (вставляются один раз) ─── */
  function injectCSS() {
    if (document.getElementById('myr-css')) return;
    var s = document.createElement('style');
    s.id = 'myr-css';
    s.textContent =
      '.myr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);' +
      'backdrop-filter:blur(8px);z-index:9999;display:flex;' +
      'align-items:flex-end;justify-content:center;}' +

      '.myr-sheet{width:100%;max-width:560px;background:#1e1e2c;' +
      'border-radius:28px 28px 0 0;padding:26px 22px 50px;}' +

      '.myr-title{font-size:26px;font-weight:700;color:#fff;margin:0 0 20px;}' +

      '.myr-film{display:flex;gap:16px;margin-bottom:24px;align-items:flex-start;}' +
      '.myr-poster{width:96px;min-width:96px;height:142px;border-radius:12px;' +
      'overflow:hidden;background:#26263a;flex-shrink:0;}' +
      '.myr-poster img{width:100%;height:100%;object-fit:cover;display:block;}' +
      '.myr-year{font-size:14px;color:#999;margin-bottom:5px;}' +
      '.myr-name{font-size:20px;font-weight:700;color:#fff;' +
      'margin-bottom:12px;line-height:1.2;}' +

      '.myr-stats{display:inline-flex;align-items:stretch;' +
      'background:#26263a;border-radius:10px;overflow:hidden;font-size:15px;color:#fff;}' +
      '.myr-stat{display:flex;align-items:center;gap:5px;padding:7px 12px;}' +
      '.myr-sep{width:1px;background:#444;}' +
      '.myr-gold{color:#f5a623;}' +

      '.myr-rows{margin-bottom:22px;}' +
      '.myr-row{display:flex;justify-content:center;gap:4px;margin-bottom:8px;}' +

      '.myr-star-btn{display:flex;flex-direction:column;align-items:center;gap:4px;' +
      'background:none;border:none;cursor:pointer;padding:4px 2px;' +
      'border-radius:8px;transition:transform .12s;min-width:40px;}' +
      '.myr-star-btn:active{transform:scale(.88);}' +

      '.myr-ico{font-size:32px;line-height:1;color:#3a3a5a;' +
      'transition:color .14s;user-select:none;}' +
      '.myr-ico.on{color:#f5a623;}' +
      '.myr-ico.hov{color:#f5a623;opacity:.7;}' +
      '.myr-num{font-size:12px;color:#666;}' +

      '.myr-hint{background:#26263a;border-radius:14px;padding:14px 18px;' +
      'text-align:center;font-size:14px;color:#999;line-height:1.5;}' +
      '.myr-hint.ok{background:#1e3328;color:#5dba7e;font-weight:600;}' +
      '.myr-hint.err{background:#3a1e1e;color:#e06060;}' +

      /* кнопка в карточке */
      '.myr-btn{background:#26263a !important;border:2px solid transparent !important;' +
      'transition:background .18s,border-color .18s !important;}' +
      '.myr-btn.myr-btn-on{background:#c8860a !important;' +
      'border-color:#f5a623 !important;}';
    document.head.appendChild(s);
  }

  /* ─── Модальное окно ─── */
  function openModal(card) {
    injectCSS();

    var id     = String(card.id || card.kinopoisk_id || card.imdb_id || card.title || 'unknown');
    var name   = card.title || card.name || 'Без названия';
    var year   = card.release_year || card.year || '';
    var poster = (card.poster && (card.poster.high || card.poster.medium || card.poster.low))
                 || card.poster || '';
    if (typeof poster !== 'string') poster = '';

    var hovered = 0;

    /* вычислить текущие данные */
    function entry()  { return getEntry(id); }
    function avgStr() { var e = entry(); return e && e.votes ? (e.sum/e.votes).toFixed(1) : '—'; }
    function vStr()   { var e = entry(); return e ? String(e.votes) : '0'; }
    function myScore(){ var e = entry(); return e ? e.score : 0; }

    /* ── строим HTML ── */
    var overlay = document.createElement('div');
    overlay.className = 'myr-overlay';

    var sheet = document.createElement('div');
    sheet.className = 'myr-sheet';
    overlay.appendChild(sheet);

    /* заголовок */
    var h = document.createElement('div');
    h.className = 'myr-title';
    h.textContent = 'Поставьте оценку';
    sheet.appendChild(h);

    /* строка с постером */
    var film = document.createElement('div');
    film.className = 'myr-film';
    var posterBox = document.createElement('div');
    posterBox.className = 'myr-poster';
    if (poster) {
      var img = document.createElement('img');
      img.src = poster; img.alt = '';
      posterBox.appendChild(img);
    }
    film.appendChild(posterBox);

    var info = document.createElement('div');
    info.innerHTML =
      '<div class="myr-year">' + (year ? year + ' ' : '') + '</div>' +
      '<div class="myr-name">' + name + '</div>' +
      '<div class="myr-stats">' +
        '<div class="myr-stat"><span class="myr-gold">★</span> <span id="myr-avg">' + avgStr() + '</span></div>' +
        '<div class="myr-sep"></div>' +
        '<div class="myr-stat">👤 <span id="myr-votes">' + vStr() + '</span></div>' +
      '</div>';
    film.appendChild(info);
    sheet.appendChild(film);

    /* звёзды */
    var rows = document.createElement('div');
    rows.className = 'myr-rows';

    function buildStarRows() {
      rows.innerHTML = '';
      var r1 = document.createElement('div'); r1.className = 'myr-row';
      var r2 = document.createElement('div'); r2.className = 'myr-row';

      function makeBtn(n) {
        var btn = document.createElement('button');
        btn.className = 'myr-star-btn selector';
        var ico = document.createElement('span');
        ico.className = 'myr-ico' + (n <= myScore() ? ' on' : '');
        ico.id = 'myr-ico-' + n;
        ico.textContent = '★';
        var num = document.createElement('span');
        num.className = 'myr-num';
        num.textContent = n;
        btn.appendChild(ico); btn.appendChild(num);

        btn.addEventListener('mouseenter', function(){ hovered = n; paintIcons(); });
        btn.addEventListener('mouseleave', function(){ hovered = 0; paintIcons(); });
        btn.addEventListener('click',      function(){ doVote(n); });
        btn.addEventListener('touchend',   function(ev){ ev.preventDefault(); doVote(n); });
        /* TV remote: Enter */
        btn.addEventListener('keyup', function(ev){ if (ev.keyCode===13) doVote(n); });
        return btn;
      }

      for (var i=1; i<=7; i++)  r1.appendChild(makeBtn(i));
      for (var i=8; i<=10; i++) r2.appendChild(makeBtn(i));

      rows.appendChild(r1);
      rows.appendChild(r2);
    }

    function paintIcons() {
      var sc = myScore();
      for (var i=1; i<=10; i++) {
        var el = overlay.querySelector('#myr-ico-' + i);
        if (!el) continue;
        el.className = 'myr-ico';
        if (hovered > 0) { if (i<=hovered) el.classList.add('hov'); }
        else             { if (i<=sc)      el.classList.add('on');  }
      }
    }

    buildStarRows();
    sheet.appendChild(rows);

    /* подсказка */
    var hint = document.createElement('div');
    hint.className = 'myr-hint';
    sheet.appendChild(hint);

    function setHint(msg, cls) {
      hint.textContent = msg;
      hint.className = 'myr-hint' + (cls ? ' '+cls : '');
    }

    /* начальная подсказка */
    if (!canRate(id)) {
      setHint('⏳ Вы уже оценили этот фильм. Повторно через 24 часа.', 'err');
    } else if (entry()) {
      setHint('Вы можете изменить оценку', 'ok');
    } else {
      setHint('Каждую карточку можно оценить раз в 24 часа', '');
    }

    /* голосование */
    function doVote(score) {
      if (!canRate(id)) {
        setHint('⏳ Повторно можно через 24 часа.', 'err');
        return;
      }
      var saved = addVote(id, score);
      paintIcons();

      /* обновить среднее */
      var avgEl = overlay.querySelector('#myr-avg');
      var vEl   = overlay.querySelector('#myr-votes');
      if (avgEl) avgEl.textContent = (saved.sum/saved.votes).toFixed(1);
      if (vEl)   vEl.textContent   = String(saved.votes);

      setHint('✅ Вы поставили ' + score + '/10! Средний рейтинг: ' +
              (saved.sum/saved.votes).toFixed(1), 'ok');

      /* обновить кнопку в карточке */
      refreshBtn(id);
    }

    /* закрытие по клику вне */
    overlay.addEventListener('click', function(ev){
      if (ev.target === overlay) document.body.removeChild(overlay);
    });

    document.body.appendChild(overlay);
  }

  /* ─── Кнопка «Звезда» в карточке ─── */
  function refreshBtn(id) {
    var btn = document.querySelector('.myr-btn[data-myr-id="' + id + '"]');
    if (!btn) return;
    var e = getEntry(id);
    if (e) {
      btn.classList.add('myr-btn-on');
      btn.setAttribute('title', 'Моя оценка: ' + e.score + '/10');
    } else {
      btn.classList.remove('myr-btn-on');
      btn.setAttribute('title', 'Поставить оценку');
    }
  }

  function createStarButton(card) {
    injectCSS();
    var id = String(card.id || card.kinopoisk_id || card.imdb_id || card.title || 'unknown');

    var btn = document.createElement('button');
    btn.className = 'full-start__button selector myr-btn';
    btn.setAttribute('data-myr-id', id);

    /* SVG-звезда (совместима со стилем Lampa) */
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"' +
      ' style="width:1.4em;height:1.4em;fill:currentColor;">' +
      '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77' +
      'l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

    btn.addEventListener('click', function(){ openModal(card); });
    btn.addEventListener('keyup', function(ev){ if(ev.keyCode===13) openModal(card); });

    refreshBtn(id);
    return btn;
  }

  /* ─── Подключение к Lampa ─── */
  Lampa.Listener.follow('full', function (e) {
    if (e.type !== 'complite') return;

    /* получаем данные карточки */
    var data = e.data || {};
    var card = data.movie || data.card || data;

    /* получаем DOM контейнера активности */
    var container;
    try {
      container = e.object.activity.render();
    } catch(err) {
      return;
    }

    /* ищем блок кнопок (.full-start-new__buttons) */
    var btns = container.find
      ? container.find('.full-start-new__buttons')
      : container.querySelector('.full-start-new__buttons');

    var target = (btns && (btns.jquery ? btns[0] : btns)) || null;
    if (!target) {
      /* fallback — ищем любой блок с кнопками */
      target = container.jquery
        ? (container.find('[class*="buttons"]')[0] || container[0])
        : (container.querySelector('[class*="buttons"]') || container);
    }

    /* не добавлять дважды */
    if (target && target.querySelector && target.querySelector('.myr-btn')) return;

    if (target) {
      target.appendChild(createStarButton(card));
    }
  });

  console.log('[MyRating] Плагин «Личный рейтинг» v1.2 загружен.');
})();