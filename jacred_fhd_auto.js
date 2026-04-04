(function(){
  'use strict';

  // ===============================================
  //  JacRedRU v2.0 — Автозапуск Full HD для Lampa
  //  • Парсер: jac.red (Jacred API) — уже настроен в Lampa
  //  • TorrServer — уже настроен в Lampa
  //  • Кнопка "Full HD" → автоматический запуск без лишних попапов
  //  • Фильм: берём лучший FHD торрент, запускаем сразу
  //  • Сериал: показываем список сезонов → список эпизодов
  //  • Надёжная обработка ошибок на каждом шаге
  // ===============================================

  var PLUGIN_ID    = 'jacredru_v2';
  var MIN_SEEDERS  = 0;
  var MIN_EP_BYTES = 10 * 1024 * 1024;
  var VIDEO_EXT    = /\.(mkv|mp4|avi|ts|m2ts|mpg|mpeg|mov|wmv|flv|webm)$/i;
  var FHD_RE       = /\b(1080[pi]?|full[\.\-\s]?hd|fhd)\b/i;
  var UHD_RE       = /\b(2160[p]?|4k|uhd)\b/i;
  var PACK_COLORS  = ['#60A5FA','#A78BFA','#34D399','#F59E0B','#F472B6','#4FC3F7','#F87171','#10B981'];

  // ---------- Вспомогательные ----------
  function noty(msg, time){
    try{
      if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function')
        Lampa.Noty.show(msg, { time: time || 3000 });
    }catch(e){}
  }

  function ensureScheme(u){
    return /^https?:\/\//i.test(u) ? u : ('https://' + u);
  }

  function trimEnd(s){
    return String(s || '').replace(/\/+$/, '');
  }

  function safeName(s){
    var v = (s || 'video').replace(/[^\w\d\-]+/g, '.').replace(/\.+/g, '.').replace(/^\.+|\.+$/g, '');
    return v || 'video';
  }

  function humanSize(bytes){
    var n = Number(bytes || 0);
    if (!n) return '';
    var u = ['B','KB','MB','GB','TB']; var i = 0;
    while (n >= 1024 && i < u.length - 1){ n /= 1024; i++; }
    return (i >= 2 ? n.toFixed(1) : Math.round(n)) + '\u00a0' + u[i];
  }

  function isSerial(m){
    return !!(m && m.first_air_date && !m.release_date);
  }

  function looksLikeVideo(path){
    return VIDEO_EXT.test(String(path || ''));
  }

  function isFullHD(title){
    return FHD_RE.test(String(title || '')) || UHD_RE.test(String(title || ''));
  }

  function tmdbLang(){
    try{ return String(Lampa.Storage.get('language') || 'ru').toLowerCase(); }catch(e){ return 'ru'; }
  }

  function tmdbImg(path, size){
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return 'https://image.tmdb.org/t/p/' + (size || 'w300') + path;
  }

  function tmdbUrl(path, params){
    var qp = new URLSearchParams(params || {});
    try{
      if (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.api === 'function'){
        return Lampa.TMDB.api(path + (path.indexOf('?') >= 0 ? '&' : '?') + qp.toString());
      }
    }catch(e){}
    var KEY = '4ef0d7355d9ffb5151e987764708ce96';
    if (!qp.has('api_key')) qp.set('api_key', KEY);
    if (!qp.has('language')) qp.set('language', tmdbLang());
    return 'https://api.themoviedb.org/3/' + path + (path.indexOf('?') >= 0 ? '&' : '?') + qp.toString();
  }

  // ---------- Jacred ----------
  function jacredBase(){
    var raw = '';
    try{ raw = Lampa.Storage.field('jacred_url') || ''; }catch(e){}
    if (!raw) raw = 'https://jac.red';
    return trimEnd(ensureScheme(raw));
  }

  function parseJacredJSON(json){
    var arr = [];
    if (Array.isArray(json)) arr = json;
    else if (json && Array.isArray(json.Results)) arr = json.Results;
    else if (json && Array.isArray(json.results)) arr = json.results;
    else if (json && Array.isArray(json.items)) arr = json.items;
    return arr.map(function(x){
      var magnet = x.MagnetUri || x.MagnetUrl || x.magnet || x.magneturi || '';
      var link   = (magnet && magnet.indexOf('magnet:') === 0) ? magnet : (x.Link || x.link || x.Url || x.url || '');
      return {
        title:   String(x.Title || x.title || x.Name || x.name || ''),
        link:    link,
        magnet:  magnet,
        size:    Number(x.Size || x.size || x.Length || x.length || 0),
        seed:    Number(x.Seeders || x.seeders || x.Peers || x.peers || 0),
        tracker: String(x.Tracker || x.tracker || x.Indexer || x.indexer || '').toLowerCase()
      };
    }).filter(function(x){ return x.link && x.size > 0 && x.seed >= MIN_SEEDERS; });
  }

  function parseTorznabXML(text){
    var xml;
    try{ xml = new DOMParser().parseFromString(text, 'application/xml'); }catch(e){ return []; }
    return [].slice.call(xml.querySelectorAll('item')).map(function(it){
      var xt = function(s){ var el = it.querySelector(s); return (el && el.textContent || '').trim(); };
      var xa = function(n){
        var el = it.querySelector('torznab\\:attr[name="' + n + '"]');
        return (el && el.getAttribute('value') || '').trim();
      };
      var enc    = (it.querySelector('enclosure') && it.querySelector('enclosure').getAttribute('url')) || '';
      var magnet = xa('magneturl') || xa('magnetUrl') || '';
      var link   = (magnet && magnet.indexOf('magnet:') === 0) ? magnet : (xt('link') || enc || '');
      return {
        title:   xt('title'),
        link:    link,
        magnet:  magnet,
        dl:      enc || '',
        size:    Number(xt('size') || xa('size') || 0),
        seed:    Number(xa('seeders') || xa('peers') || 0),
        tracker: String(xa('jackettindexer') || xa('indexer') || '').toLowerCase()
      };
    }).filter(function(x){ return x.link && x.size > 0 && x.seed >= MIN_SEEDERS; });
  }

  async function jacSearch(query, isTv){
    var base = jacredBase();
    var results = [];

    // 1) JSON API jac.red
    try{
      var qp = new URLSearchParams({ query: query });
      if (isTv) qp.set('type', 'tv'); else qp.set('type', 'movie');
      var r = await fetch(base + '/api/v1.0/torrents?' + qp.toString(), { method: 'GET', credentials: 'omit' });
      if (r.ok) results = parseJacredJSON(await r.json());
    }catch(e){}

    // 2) Torznab fallback
    if (!results.length){
      try{
        var qp2 = new URLSearchParams({ t: 'search', q: query });
        var r2 = await fetch(base + '/api/v2.0/indexers/all/results/torznab/?' + qp2.toString(), { method: 'GET', credentials: 'omit' });
        if (r2.ok) results = parseTorznabXML(await r2.text());
      }catch(e){}
    }

    // 3) Jackett JSON fallback
    if (!results.length){
      try{
        var qp3 = new URLSearchParams({ Query: query });
        var r3 = await fetch(base + '/api/v2.0/indexers/all/results?' + qp3.toString(), { method: 'GET', credentials: 'omit' });
        if (r3.ok) results = parseJacredJSON(await r3.json());
      }catch(e){}
    }

    return results;
  }

  function filterFHD(items){
    var fhd = items.filter(function(x){ return isFullHD(x.title); });
    return fhd.length ? fhd : items;
  }

  async function searchFHD(query, isTv){
    var items = await jacSearch(query, isTv);
    items = filterFHD(items);
    items.sort(function(a, b){ return b.size - a.size; });
    return items;
  }

  // ---------- TorrServer ----------
  function tsBase(){
    var raw = '';
    try{ raw = Lampa.Storage.field('torrserver_url') || ''; }catch(e){}
    if (!raw){
      // Пробуем поля которые может использовать встроенный плагин
      try{ raw = Lampa.Storage.field('ts_url') || ''; }catch(e){}
    }
    if (!raw) throw new Error('TorrServer не настроен. Укажите адрес в Настройках Lampa (torrserver_url).');
    return trimEnd(ensureScheme(raw));
  }

  function tsAuthHeaders(){
    var token = '', user = '', pass = '';
    try{
      token = Lampa.Storage.field('torrserver_token') || '';
      user  = Lampa.Storage.field('torrserver_user')  || '';
      pass  = Lampa.Storage.field('torrserver_pass')  || '';
    }catch(e){}
    var headers = { 'Content-Type': 'application/json' };
    if (token){
      headers['Authorization'] = 'Bearer ' + token;
    } else if (user || pass){
      try{ headers['Authorization'] = 'Basic ' + btoa(user + ':' + pass); }catch(e){}
    }
    return headers;
  }

  function tsBaseForStream(){
    var base = tsBase();
    var user = '', pass = '';
    try{ user = Lampa.Storage.field('torrserver_user') || ''; }catch(e){}
    try{ pass = Lampa.Storage.field('torrserver_pass') || ''; }catch(e){}
    try{
      var u = new URL(base);
      if (user || pass){ u.username = user; u.password = pass; base = u.toString().replace(/\/$/, ''); }
    }catch(e){}
    return base;
  }

  function tsStreamAuthQuery(){
    var token = '';
    try{ token = Lampa.Storage.field('torrserver_token') || ''; }catch(e){}
    return token ? '&authorization=' + encodeURIComponent('Bearer ' + token) : '';
  }

  async function tsAdd(base, link, title, poster, movieFull){
    var body = {
      action:     'add',
      link:       link,
      title:      ('[FHD] ' + (title || '')).trim(),
      poster:     poster || '',
      data:       JSON.stringify({ lampa: true, movie: movieFull || {} }),
      save_to_db: false
    };
    var r = await fetch(base + '/torrents', {
      method:  'POST',
      headers: tsAuthHeaders(),
      body:    JSON.stringify(body)
    });
    if (!r.ok) throw new Error('TorrServer /torrents error ' + r.status);
    var j = {};
    try{ j = await r.json(); }catch(e){}
    var hash = j.hash || j.id || j.TorrentHash || j.InfoHash || '';
    return { hash: hash, raw: j };
  }

  function extractFiles(j){
    if (!j) return [];
    if (Array.isArray(j))             return j;
    if (Array.isArray(j.file_stats))  return j.file_stats;
    if (Array.isArray(j.FileStats))   return j.FileStats;
    if (Array.isArray(j.files))       return j.files;
    if (Array.isArray(j.Files))       return j.Files;
    if (j.stats && Array.isArray(j.stats.file_stats)) return j.stats.file_stats;
    return [];
  }

  async function tsGetFiles(base, hashOrLink){
    var headers = tsAuthHeaders();

    // Вариант 1: POST /torrents action=get
    try{
      var body = { action: 'get' };
      if (/^(magnet:|https?:)/i.test(hashOrLink)) body.link = hashOrLink;
      else body.hash = hashOrLink;
      var r = await fetch(base + '/torrents', { method: 'POST', headers: headers, body: JSON.stringify(body) });
      if (r.ok){
        var j = await r.json();
        var fs = extractFiles(j);
        if (fs.length) return { files: fs, raw: j };
      }
    }catch(e){}

    // Вариант 2: GET /stream/files
    try{
      var r2 = await fetch(base + '/stream/files?link=' + encodeURIComponent(hashOrLink), { method: 'GET', headers: headers });
      if (r2.ok){
        var j2 = await r2.json();
        var fs2 = extractFiles(j2);
        if (fs2.length) return { files: fs2, raw: j2 };
      }
    }catch(e){}

    return { files: [], raw: null };
  }

  function buildStreamUrl(hashOrLink, file){
    var base = tsBaseForStream();
    var idx = 1;
    if (file){
      var fid = (typeof file.id !== 'undefined') ? file.id : (typeof file.Id !== 'undefined' ? file.Id : null);
      var n = Number(fid);
      if (!isNaN(n) && n >= 0) idx = n + 1;
    }
    var fname = '';
    if (file && file.path){
      fname = safeName(String(file.path).split('/').pop()) + '.mkv';
    } else {
      fname = 'video.mkv';
    }
    var url = base + '/stream/' + encodeURIComponent(fname) + '?link=' + encodeURIComponent(hashOrLink) + '&index=' + idx + '&play=1';
    var auth = tsStreamAuthQuery();
    if (auth) url += auth;
    return url;
  }

  // ---------- Воспроизведение ----------
  function doPlay(streamUrl, title){
    try{
      if (window.Lampa && Lampa.Player && typeof Lampa.Player.play === 'function'){
        Lampa.Player.play({ url: streamUrl, title: title || 'Full HD', timeline: 0 });
        return;
      }
    }catch(e){}
    location.href = streamUrl;
  }

  // ---------- Стили ----------
  function injectStyles(){
    if (document.getElementById('jrfhd-style')) return;
    var css = [
      '.jrfhd-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:99999;display:flex;align-items:center;justify-content:center}',
      '.jrfhd-card{width:min(1400px,94vw);max-height:88vh;overflow:hidden;border-radius:16px;background:#111;border:1px solid rgba(255,255,255,.08);box-shadow:0 10px 50px rgba(0,0,0,.6);display:flex;flex-direction:column}',
      '.jrfhd-head{padding:18px 26px;font-size:26px;font-weight:800;background:rgba(255,255,255,.04);flex:0 0 auto;letter-spacing:.3px}',
      '.jrfhd-body{overflow-y:auto;padding:6px 8px 16px;flex:1 1 auto}',
      '.jrfhd-row{display:flex;align-items:center;gap:16px;padding:14px 16px;border-radius:12px;cursor:pointer}',
      '.jrfhd-row.focus,.jrfhd-row:hover{background:rgba(255,255,255,.07)}',
      '.jrfhd-thumb{width:192px;height:108px;border-radius:10px;background:#1a1a1a center/cover no-repeat;flex:0 0 auto}',
      '.jrfhd-info{flex:1;min-width:0}',
      '.jrfhd-title{font-size:28px;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.jrfhd-sub{margin-top:5px;opacity:.75;font-size:15px}',
      '.jrfhd-size{opacity:.9;font-weight:700;white-space:nowrap;margin-left:auto;padding-left:12px}',
      '.jrfhd-badge{display:inline-block;padding:2px 7px;border-radius:5px;background:#1565C0;color:#fff;font-size:12px;font-weight:700;margin-left:8px;vertical-align:middle}',
      '.jrfhd-pack{margin:4px 0 8px}',
      '.jrfhd-pack-hdr{padding:8px 14px;font-size:20px;font-weight:900;border-left:5px solid var(--pc,#60A5FA);border-radius:8px;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));margin-bottom:2px}',
      '.jrfhd-pack .jrfhd-row{border-left:4px solid var(--pc,#60A5FA)}',
      '.jrfhd-spin{display:flex;align-items:center;gap:14px;padding:22px;font-size:20px}',
      '.jrfhd-spinner{width:26px;height:26px;border:3px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:jrfhd-rot .8s linear infinite;flex:0 0 auto}',
      '@keyframes jrfhd-rot{to{transform:rotate(360deg)}}',
      '@media(max-width:860px){.jrfhd-thumb{width:150px;height:84px}.jrfhd-title{font-size:22px}}'
    ].join('');
    var s = document.createElement('style'); s.id = 'jrfhd-style'; s.textContent = css;
    document.head.appendChild(s);
  }

  function injectBtnStyle(){
    if (document.getElementById('jrfhd-btn-style')) return;
    var css = [
      '.full-start__button.jrfhd-btn{background:linear-gradient(135deg,#1565C0,#0D47A1)!important;color:#fff!important;border:0!important;box-shadow:0 2px 10px rgba(0,0,0,.4)!important}',
      '.full-start__button.jrfhd-btn.focus,.full-start__button.jrfhd-btn:hover{filter:brightness(1.15);transform:translateY(-2px)}'
    ].join('');
    var s = document.createElement('style'); s.id = 'jrfhd-btn-style'; s.textContent = css;
    document.head.appendChild(s);
  }

  // ---------- Модальный диалог ----------
  var _dlg = null;

  function closeDlg(){
    if (_dlg){
      try{ _dlg.remove(); }catch(e){}
      _dlg = null;
    }
    try{ document.removeEventListener('keydown', _dlgKeydown, true); }catch(e){}
    try{ if (window.Lampa && Lampa.Controller) Lampa.Controller.toggle('content'); }catch(e){}
  }

  function _dlgKeydown(e){
    var key = e.key || e.keyCode;
    if (key === 'Escape' || key === 'Backspace' || key === 'BrowserBack' || key === 8 || key === 27 || key === 461 || key === 10009){
      e.preventDefault(); closeDlg(); return;
    }
    var body = _dlg && _dlg.querySelector('.jrfhd-body');
    if (!body) return;
    var rows = [].slice.call(body.querySelectorAll('.jrfhd-row'));
    if (!rows.length) return;
    var cur = rows.findIndex(function(r){ return r.classList.contains('focus'); });
    if (cur < 0) cur = 0;
    var next = cur;
    if (key === 'ArrowDown' || key === 40){ e.preventDefault(); next = Math.min(rows.length - 1, cur + 1); }
    else if (key === 'ArrowUp' || key === 38){ e.preventDefault(); next = Math.max(0, cur - 1); }
    else if (key === 'Enter' || key === 13){ e.preventDefault(); if (rows[cur]) rows[cur].click(); return; }
    if (next !== cur){
      rows[cur].classList.remove('focus');
      rows[next].classList.add('focus');
      try{ rows[next].scrollIntoView({ block: 'nearest' }); }catch(e){}
    }
  }

  function openDlg(headText){
    injectStyles();
    closeDlg();

    var overlay = document.createElement('div'); overlay.className = 'jrfhd-overlay';
    var card    = document.createElement('div'); card.className = 'jrfhd-card';
    var head    = document.createElement('div'); head.className = 'jrfhd-head'; head.textContent = headText || '';
    var body    = document.createElement('div'); body.className = 'jrfhd-body';

    card.appendChild(head); card.appendChild(body); overlay.appendChild(card);
    document.body.appendChild(overlay);
    _dlg = overlay;

    document.addEventListener('keydown', _dlgKeydown, true);

    // Также пробуем зарегистрировать контроллер Lampa
    try{
      if (window.Lampa && Lampa.Controller){
        Lampa.Controller.add('jrfhd_dlg', {
          toggle: function(){},
          up:   function(){ _dlgKeydown({ key: 'ArrowUp',   keyCode: 38, preventDefault: function(){} }); },
          down: function(){ _dlgKeydown({ key: 'ArrowDown', keyCode: 40, preventDefault: function(){} }); },
          enter:function(){ _dlgKeydown({ key: 'Enter',     keyCode: 13, preventDefault: function(){} }); },
          back: function(){ closeDlg(); }
        });
        setTimeout(function(){ try{ Lampa.Controller.toggle('jrfhd_dlg'); }catch(e){} }, 0);
      }
    }catch(e){}

    return {
      body: body,
      setLoading: function(text){
        body.innerHTML = '';
        var d = document.createElement('div'); d.className = 'jrfhd-spin';
        var sp = document.createElement('div'); sp.className = 'jrfhd-spinner';
        var tx = document.createElement('div'); tx.textContent = text || 'Загрузка...';
        d.appendChild(sp); d.appendChild(tx); body.appendChild(d);
      },
      setContent: function(el){
        body.innerHTML = '';
        body.appendChild(el);
        var first = body.querySelector('.jrfhd-row');
        if (first){
          first.classList.add('focus');
          try{ first.scrollIntoView({ block: 'nearest' }); }catch(e){}
        }
      },
      close: closeDlg
    };
  }

  function makeRow(thumbUrl, titleHtml, subText, sizeText){
    var row = document.createElement('div'); row.className = 'jrfhd-row';
    row.setAttribute('tabindex', '0');

    var th = document.createElement('div'); th.className = 'jrfhd-thumb';
    if (thumbUrl) th.style.backgroundImage = "url('" + thumbUrl + "')";

    var info = document.createElement('div'); info.className = 'jrfhd-info';
    var tit  = document.createElement('div'); tit.className = 'jrfhd-title'; tit.innerHTML = titleHtml || '';
    var sub  = document.createElement('div'); sub.className = 'jrfhd-sub'; sub.textContent = subText || '';

    var sz = document.createElement('div'); sz.className = 'jrfhd-size'; sz.textContent = sizeText || '';

    info.appendChild(tit); info.appendChild(sub);
    row.appendChild(th); row.appendChild(info); row.appendChild(sz);

    row.addEventListener('mouseenter', function(){ var b = row.closest('.jrfhd-body'); if (b) [].forEach.call(b.querySelectorAll('.jrfhd-row.focus'), function(r){ r.classList.remove('focus'); }); row.classList.add('focus'); });
    row.addEventListener('mouseleave', function(){ row.classList.remove('focus'); });

    return row;
  }

  // ---------- Вспомогательные парсеры ----------
  function extractSeasons(title){
    var str = String(title || '');
    var out = {};
    var rng = str.match(/s(?:eason)?\s*(\d{1,2})\s*[-–]\s*(\d{1,2})/i);
    if (rng){ for (var i = Number(rng[1]); i <= Number(rng[2]); i++) out[i] = 1; }
    var re = /(?:s(?:eason)?\s*(\d{1,2})|\bS(\d{1,2})\b|(?:[^\d]|^)(\d{1,2})\s*(?:сезон|сез))/gi, m;
    while ((m = re.exec(str)) !== null){ var n = Number(m[1] || m[2] || m[3]); if (n) out[n] = 1; }
    var keys = Object.keys(out).map(Number);
    return keys.length ? keys : [1];
  }

  function parseEpNum(path, seasonHint){
    var name = String(path || '').split('/').pop();
    var m;
    m = name.match(/s(\d{1,2})e(\d{1,3})/i); if (m) return { season: Number(m[1]), ep: Number(m[2]) };
    m = name.match(/(\d{1,2})x(\d{1,3})/i);  if (m) return { season: Number(m[1]), ep: Number(m[2]) };
    m = name.match(/e[pP]?(\d{1,3})/i);       if (m) return { season: seasonHint || 1, ep: Number(m[1]) };
    m = name.match(/сери[ия]\s*(\d{1,3})/i);  if (m) return { season: seasonHint || 1, ep: Number(m[1]) };
    return { season: seasonHint || 1, ep: 0 };
  }

  function topFolder(files){
    for (var i = 0; i < files.length; i++){
      var p = String(files[i].path || '').replace(/^\/+/, '');
      if (p.indexOf('/') >= 0){ var seg = p.split('/')[0].trim(); if (seg) return seg; }
    }
    return '';
  }

  // ---------- ФИЛЬМ: автозапуск ----------
  async function runMovie(data){
    var m = data && data.movie;
    if (!m) return;
    if (isSerial(m)) return;

    var title = String(m.title || m.name || '').trim();
    var orig  = String(m.original_title || m.original_name || title).trim();
    var year  = String(m.release_date || '').slice(0, 4);
    var poster = tmdbImg(m.poster_path, 'w342');

    if (!title){ noty('Не удалось определить название', 4000); return; }

    noty('Поиск Full HD: ' + title + (year ? ' (' + year + ')' : ''));

    var queries = [
      title + (year ? ' ' + year : ''),
      orig  + (year ? ' ' + year : ''),
      title,
      orig
    ];

    var items = [];
    for (var qi = 0; qi < queries.length; qi++){
      var q = queries[qi].trim();
      if (!q) continue;
      try{ items = await searchFHD(q, false); }catch(e){}
      if (items.length) break;
    }

    if (!items.length){
      noty('Full HD не найдено для: ' + title, 5000);
      return;
    }

    var best = items[0];
    var addLink = best.magnet || best.link;

    noty(isFullHD(best.title) ? 'Найден Full HD, подключаю...' : 'Найдено: ' + humanSize(best.size) + ', подключаю...');

    var base = tsBase();
    var playLink = addLink;

    try{
      var added = await tsAdd(base, addLink, title, poster, m);
      if (added.hash) playLink = added.hash;
    }catch(e){
      // Если tsAdd упал — пробуем стримить напрямую по ссылке
      noty('TorrServer: добавлен через прямую ссылку');
    }

    var selectedFile = null;
    try{
      var resp = await tsGetFiles(base, playLink);
      var files = resp.files || [];
      var vids = files.filter(function(x){ return looksLikeVideo(x.path) && Number(x.length || 0) > 0; });
      if (vids.length){
        vids.sort(function(a, b){ return Number(b.length || 0) - Number(a.length || 0); });
        selectedFile = vids[0];
      }
    }catch(e){}

    noty('Запускаю воспроизведение...');
    var streamUrl = buildStreamUrl(playLink, selectedFile);
    doPlay(streamUrl, title);
  }

  // ---------- СЕРИАЛ: выбор сезона → эпизоды ----------
  async function runSerial(data){
    var m = data && data.movie;
    if (!m || !isSerial(m)) return;

    var title  = String(m.name || m.title || '').trim();
    var orig   = String(m.original_name || m.original_title || title).trim();
    var tvId   = m.id;
    var poster = tmdbImg(m.poster_path, 'w342');

    if (!title){ noty('Не удалось определить название сериала', 4000); return; }

    var dlg = openDlg('ПОИСК: ' + title);
    dlg.setLoading('Поиск сезонов Full HD...');

    var items = [];
    var queries = [title + ' ' + orig, title, orig];
    for (var qi = 0; qi < queries.length; qi++){
      var q = queries[qi].trim();
      if (!q) continue;
      try{ items = await searchFHD(q, true); }catch(e){}
      if (items.length) break;
    }

    if (!items.length){
      dlg.setLoading('Ничего не найдено для: ' + title);
      return;
    }

    // Группируем по сезонам
    var bySeason = {};
    for (var i = 0; i < items.length; i++){
      var it = items[i];
      var seasons = extractSeasons(it.title);
      for (var k = 0; k < seasons.length; k++){
        var sn = seasons[k];
        if (!bySeason[sn]) bySeason[sn] = [];
        bySeason[sn].push(it);
      }
    }

    var seasonNums = Object.keys(bySeason).map(Number).sort(function(a, b){ return a - b; });
    if (!seasonNums.length){
      dlg.setLoading('Сезоны не определены');
      return;
    }

    // Загружаем постеры сезонов параллельно
    var posters = {};
    await Promise.all(seasonNums.map(async function(sn){
      posters[sn] = poster;
      if (!tvId) return;
      try{
        var r = await fetch(tmdbUrl('tv/' + tvId + '/season/' + sn, { language: tmdbLang() }));
        if (r.ok){
          var j = await r.json();
          if (j && j.poster_path) posters[sn] = tmdbImg(j.poster_path, 'w300');
        }
      }catch(e){}
    }));

    // Строим список сезонов
    var frag = document.createDocumentFragment();
    for (var si = 0; si < seasonNums.length; si++){
      var sn  = seasonNums[si];
      var rels = bySeason[sn] || [];
      var maxSz = 0;
      for (var ri = 0; ri < rels.length; ri++){ if (rels[ri].size > maxSz) maxSz = rels[ri].size; }
      var fhdCnt = rels.filter(function(x){ return isFullHD(x.title); }).length;
      var sub = rels.length + ' вариант' + (rels.length === 1 ? '' : rels.length < 5 ? 'а' : 'ов') + (fhdCnt ? ' • FHD: ' + fhdCnt : '');
      var tit = 'Сезон\u00a0' + sn + (fhdCnt ? '<span class="jrfhd-badge">FHD</span>' : '');

      var row = makeRow(posters[sn], tit, sub, humanSize(maxSz));
      (function(snCopy, relsCopy, metaCopy){
        row.addEventListener('click', function(){
          showEpisodes(metaCopy, snCopy, relsCopy);
        });
      })(sn, rels, { title: title, orig: orig, tvId: tvId, poster: poster, full: m });

      frag.appendChild(row);
    }

    dlg.setContent(frag);
  }

  async function showEpisodes(meta, sn, releases){
    var dlg = openDlg('Сезон\u00a0' + sn + '\u00a0— Эпизоды: ' + meta.title);
    dlg.setLoading('Подготовка...');

    // Загружаем данные TMDB для эпизодов
    var names = {}, stills = {};
    if (meta.tvId){
      try{
        var r = await fetch(tmdbUrl('tv/' + meta.tvId + '/season/' + sn, { language: tmdbLang() }));
        if (r.ok){
          var j = await r.json();
          if (j && Array.isArray(j.episodes)){
            j.episodes.forEach(function(ep){
              names[ep.episode_number]  = ep.name || '';
              stills[ep.episode_number] = tmdbImg(ep.still_path, 'w300');
            });
          }
        }
      }catch(e){}
    }

    var base = tsBase();
    var groups = {}, order = [];

    // Для каждого релиза добавляем в TorrServer и получаем файлы
    for (var ri = 0; ri < releases.length; ri++){
      var rel = releases[ri];
      var addLink = rel.magnet || rel.link;
      var playLink = addLink;

      try{
        var added = await tsAdd(base, addLink, meta.title + ' S' + sn, meta.poster, meta.full);
        if (added.hash) playLink = added.hash;
      }catch(e){}

      try{
        var resp = await tsGetFiles(base, playLink);
        var files = resp.files || [];
        if (!files.length) continue;

        var vids = files.filter(function(x){
          return looksLikeVideo(x.path) && Number(x.length || 0) >= MIN_EP_BYTES;
        });
        if (!vids.length){
          vids = files.filter(function(x){ return looksLikeVideo(x.path); });
        }
        if (!vids.length) continue;

        var folder = topFolder(vids) || rel.title || ('Релиз ' + (ri + 1));
        if (!groups[folder]){ groups[folder] = []; order.push(folder); }

        for (var fi = 0; fi < vids.length; fi++){
          var f = vids[fi];
          var parsed = parseEpNum(f.path, sn);
          if (parsed.season && parsed.season !== sn) continue;
          var epn = parsed.ep || 0; if (!epn) continue;
          var size = Number(f.length || 0);

          var existIdx = -1;
          for (var gi = 0; gi < groups[folder].length; gi++){
            if (groups[folder][gi].ep === epn){ existIdx = gi; break; }
          }
          if (existIdx === -1){
            groups[folder].push({ ep: epn, file: f, hash: playLink, size: size });
          } else if (size > groups[folder][existIdx].size){
            groups[folder][existIdx] = { ep: epn, file: f, hash: playLink, size: size };
          }
        }
      }catch(e){}
    }

    var frag = document.createDocumentFragment();

    for (var oi = 0; oi < order.length; oi++){
      var folder = order[oi];
      var epList = groups[folder] || [];
      if (!epList.length) continue;
      epList.sort(function(a, b){ return a.ep - b.ep; });

      var color = PACK_COLORS[oi % PACK_COLORS.length];
      var wrap = document.createElement('div'); wrap.className = 'jrfhd-pack'; wrap.style.setProperty('--pc', color);

      var hdr = document.createElement('div'); hdr.className = 'jrfhd-pack-hdr'; hdr.textContent = folder;
      wrap.appendChild(hdr);

      for (var ii = 0; ii < epList.length; ii++){
        var ep = epList[ii];
        var epLabel = 'S' + String(sn).padStart(2, '0') + 'E' + String(ep.ep).padStart(2, '0');
        var epName  = names[ep.ep] || ('Серия\u00a0' + ep.ep);
        var tit2    = epLabel + '\u2002\u2014\u2002' + epName;

        var row = makeRow(stills[ep.ep] || meta.poster, tit2, folder, humanSize(ep.size));

        (function(hash, file, playTitle){
          row.addEventListener('click', function(){
            closeDlg();
            noty('Запускаю...');
            var url = buildStreamUrl(hash, file);
            doPlay(url, playTitle);
          });
        })(ep.hash, ep.file, meta.title + '\u00a0' + epLabel);

        wrap.appendChild(row);
      }
      frag.appendChild(wrap);
    }

    if (!frag.children.length){
      dlg.setLoading('Эпизоды не найдены. Попробуйте другой релиз.');
      return;
    }
    dlg.setContent(frag);
  }

  // ---------- Точка входа ----------
  async function onButtonClick(evData){
    try{
      var mv = evData && evData.movie;
      if (!mv){ noty('Нет данных о контенте', 4000); return; }
      if (isSerial(mv)){
        await runSerial(evData);
      } else {
        await runMovie(evData);
      }
    }catch(e){
      var msg = (e && e.message) ? e.message : String(e);
      if (msg && msg !== 'skip-movie' && msg !== 'skip-serial'){
        noty('JacRedFHD: ' + msg, 6000);
      }
    }
  }

  // ---------- Кнопка ----------
  function makeButton(){
    var btn = document.createElement('div');
    btn.className = 'full-start__button selector jrfhd-btn';
    btn.setAttribute('data-jrfhd', '1');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', 'Full HD');
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="26" height="26" aria-hidden="true"><path d="M18 12l24 13-24 13V12z" fill="currentColor"/></svg><span>Full HD</span>';
    return btn;
  }

  function findBar(root){
    var selectors = ['.full-start-new__buttons', '.full-start__buttons', '.full-actions', '.full-start__right', '.full-start'];
    for (var i = 0; i < selectors.length; i++){
      var found = root.querySelector(selectors[i]);
      if (found) return found;
    }
    return null;
  }

  function attachBtn(root, evData){
    if (!root || !evData || !evData.movie) return false;
    var bar = findBar(root);
    if (!bar) return false;
    if (bar.querySelector('[data-jrfhd="1"]')) return true;

    var btn = makeButton();
    btn.addEventListener('click', function(){ onButtonClick(evData); });
    btn.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.keyCode === 13) onButtonClick(evData);
    });

    // Lampa hover:enter через jQuery
    try{
      var $ = window.$ || window.jQuery;
      if ($) $(btn).on('hover:enter', function(){ onButtonClick(evData); });
    }catch(e){}

    bar.insertBefore(btn, bar.firstChild);
    try{ if (window.Lampa && Lampa.Controller) Lampa.Controller.collectionSet(bar); }catch(e){}
    return true;
  }

  // ---------- Монтирование ----------
  function mount(){
    injectBtnStyle();
    try{
      Lampa.Listener.follow('full', function(ev){
        if (!ev || ev.type !== 'complite' || !ev.object) return;
        var root;
        try{ root = ev.object.activity.render(); root = root && (root[0] || root); }catch(e){ return; }
        if (!root) return;

        if (attachBtn(root, ev.data)) return;

        try{
          var mo = new MutationObserver(function(){
            if (attachBtn(root, ev.data)) mo.disconnect();
          });
          mo.observe(root, { childList: true, subtree: true });
          setTimeout(function(){ try{ mo.disconnect(); }catch(e){} }, 10000);
        }catch(e){}
      });
    }catch(e){}
  }

  if (!window[PLUGIN_ID + '_ready']){
    window[PLUGIN_ID + '_ready'] = true;
    try{ mount(); }catch(e){}
  }

})();
