(function(){
  'use strict';

  // ===============================================
  //  JacRedRU v1.1 — Исправленный поиск сериалов
  //  • Парсер: jac.red (Jacred API)
  //  • Только Full HD (1080p) контент
  //  • Интерфейс полностью на русском языке
  //  • Поиск ТОЛЬКО по оригинальному названию (англ.)
  //  • Автоматический fallback без type=
  //  • Настраиваемый минимальный размер эпизода
  // ===============================================

  // ---------- Константы и настройки ----------
  var MIN_SEEDERS  = 1;
  // Читаем минимальный размер эпизода из хранилища (MB)
  var MIN_EP_MB = 500;
  try {
    var stored = Lampa.Storage.field('jacred_min_ep_mb');
    if (stored && !isNaN(parseFloat(stored))) MIN_EP_MB = parseFloat(stored);
  } catch(e) {}
  var MIN_EP_BYTES = MIN_EP_MB * 1024 * 1024;

  var VIDEO_EXT    = /(\.(mkv|mp4|avi|ts|m2ts|mpg|mpeg|mov|wmv))$/i;
  var FHD_RE       = /\b(1080[pi]?|full.?hd|fhd|uhd|2160[p]?|4k)\b/i;

  var PACK_COLORS = ['#60A5FA','#A78BFA','#34D399','#F59E0B','#F472B6','#4FC3F7','#F87171','#10B981','#EAB308','#C084FC'];

  function noty(m, t){ try{ if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show==='function') Lampa.Noty.show(m, {time: t||2500}); }catch(e){} }
  function ensureScheme(u){ return /^https?:\/\//i.test(u) ? u : ('https://'+u); }
  function trimEnd(s){ return String(s||'').replace(/\/+$/,''); }
  function safeName(s){
    var v = (s||'video').replace(/[^\w\d]+/g,'.').replace(/\.+/g,'.').replace(/^\.+|\.+$/g,'');
    return v || 'video';
  }
  function isSerial(m){
    return !!(m && m.first_air_date && !m.release_date);
  }
  function looksLikeVideo(path){ return VIDEO_EXT.test(String(path||'')); }
  function isFullHD(title){ return FHD_RE.test(String(title||'')); }

  function tmdbLang(){
    try{ return String((Lampa.Storage.get('language')||'ru')).toLowerCase(); }catch(e){ return 'ru'; }
  }
  function tmdbImg(path, size){
    if (!path) return '';
    var p = String(path);
    if (/^https?:\/\//i.test(p)) return p;
    return 'https://image.tmdb.org/t/p/' + (size || 'w300') + p;
  }
  function tmdbUrl(path, params){
    var qp = new URLSearchParams(params||{});
    try{
      if (typeof Lampa!=='undefined' && Lampa.TMDB && typeof Lampa.TMDB.api==='function'){
        return Lampa.TMDB.api(path + (path.indexOf('?')>=0?'&':'?') + qp.toString());
      }
    }catch(e){}
    var KEY = '4ef0d7355d9ffb5151e987764708ce96';
    var base = 'https://api.themoviedb.org/3/';
    if (!qp.has('api_key')) qp.set('api_key', KEY);
    if (!qp.has('language')) qp.set('language', tmdbLang());
    return base + path + (path.indexOf('?')>=0?'&':'?') + qp.toString();
  }

  // ---------- Jacred (jac.red) ----------
  function jacredBase(){
    var raw = '';
    try{ raw = Lampa.Storage.field('jacred_url')||''; }catch(e){}
    if (!raw) raw = 'https://jac.red';
    return trimEnd(ensureScheme(raw));
  }

  // Парсинг JSON от jac.red
  function parseJacredJSON(json){
    var arr = [];
    if (Array.isArray(json)) arr = json;
    else if (json && Array.isArray(json.Results)) arr = json.Results;
    else if (json && Array.isArray(json.results)) arr = json.results;
    else if (json && Array.isArray(json.items)) arr = json.items;

    var items = arr.map(function(x){
      var magnet = x.MagnetUri || x.MagnetUrl || x.magnet || x.magneturi || '';
      var link   = (magnet && magnet.indexOf('magnet:')===0) ? magnet : (x.Link||x.link||x.Url||x.url||'');
      var size   = Number(x.Size||x.size||x.Length||x.length||0);
      var seed   = Number(x.Seeders||x.seeders||x.Peers||x.peers||0);
      var title  = String(x.Title||x.title||x.Name||x.name||'');
      var tracker= String(x.Tracker||x.tracker||x.Indexer||x.indexer||'').toLowerCase();
      return { title:title, link:link, magnet:magnet, size:size, seed:seed, tracker:tracker };
    }).filter(function(x){
      return x.link && x.size > 0 && x.seed >= MIN_SEEDERS;
    });
    return items;
  }

  // Парсинг Torznab XML (запасной вариант)
  function parseTorznabXML(text){
    var xml; try{ xml = new DOMParser().parseFromString(text,'application/xml'); }catch(e){ return []; }
    var items = [].slice.call(xml.querySelectorAll('item')).map(function(it){
      var xt = function(s){ var el=it.querySelector(s); return (el&&el.textContent||'').trim(); };
      var xa = function(n){
        var el = it.querySelector('torznab\\:attr[name="'+n+'"]');
        return (el && el.getAttribute('value') || '').trim();
      };
      var enc    = (it.querySelector('enclosure') && it.querySelector('enclosure').getAttribute('url')) || '';
      var magnet = xa('magneturl') || xa('magnetUrl') || '';
      var link   = (magnet && magnet.indexOf('magnet:')===0) ? magnet : (xt('link') || enc || '');
      var size   = Number(xt('size') || xa('size') || 0);
      var seed   = Number(xa('seeders') || xa('peers') || 0);
      var title  = xt('title');
      var tracker= String(xa('jackettindexer')||xa('indexer')||'').toLowerCase();
      return { title:title, link:link, magnet:magnet, dl:enc||'', size:size, seed:seed, tracker:tracker };
    }).filter(function(x){ return x.link && x.size > 0 && x.seed >= MIN_SEEDERS; });
    return items;
  }

  // Основной поиск через jac.red — теперь с приоритетом оригинального названия
  async function jacSearch(query, isSerial){
    var base = jacredBase();
    var results = [];

    // 1) JSON API с указанием типа (если передан)
    try{
      var qp = new URLSearchParams({ query: query });
      if (isSerial === true) qp.set('type', 'tv');
      else if (isSerial === false) qp.set('type', 'movie');
      var url1 = base + '/api/v1.0/torrents?' + qp.toString();
      console.log('[JacRedRU] Запрос 1:', url1);
      var r1 = await fetch(url1, { method:'GET', credentials:'omit', mode:'cors' });
      if (r1.ok){
        var j = await r1.json();
        results = parseJacredJSON(j);
      }
    }catch(e){ console.warn('[JacRedRU] Ошибка запроса 1', e); }

    // 2) Если ничего не нашли, пробуем без параметра type (расширенный поиск)
    if (!results.length){
      try{
        var qp2 = new URLSearchParams({ query: query });
        var url2 = base + '/api/v1.0/torrents?' + qp2.toString();
        console.log('[JacRedRU] Fallback запрос (без type):', url2);
        var r2 = await fetch(url2, { method:'GET', credentials:'omit', mode:'cors' });
        if (r2.ok){
          var j2 = await r2.json();
          results = parseJacredJSON(j2);
        }
      }catch(e){ console.warn('[JacRedRU] Ошибка fallback', e); }
    }

    // 3) Torznab fallback
    if (!results.length){
      try{
        var qp3 = new URLSearchParams({ t:'search', q: query });
        var url3 = base + '/api/v2.0/indexers/all/results/torznab/?' + qp3.toString();
        console.log('[JacRedRU] Torznab запрос:', url3);
        var r3 = await fetch(url3, { method:'GET', credentials:'omit', mode:'cors' });
        if (r3.ok){
          var txt = await r3.text();
          results = parseTorznabXML(txt);
        }
      }catch(e){}
    }

    console.log('[JacRedRU] Найдено результатов:', results.length);
    return results;
  }

  // Фильтрация: сначала Full HD, иначе всё что есть
  function filterFHD(items){
    var fhd = items.filter(function(x){ return isFullHD(x.title); });
    if (fhd.length) return fhd;
    return items;
  }

  // Поиск с приоритетом Full HD + сортировка по размеру
  async function searchFHD(query, isTV){
    var items = await jacSearch(query, isTV);
    items = filterFHD(items);
    items.sort(function(a,b){ return b.size - a.size; });
    return items;
  }

  // ---------- TorrServer ----------
  function tsBase(){
    var raw = '';
    try{ raw = Lampa.Storage.field('torrserver_url')||''; }catch(e){}
    if (!raw) throw new Error('Укажи torrserver_url в Настройках');
    return trimEnd(ensureScheme(raw));
  }
  function tsAuthHeaders(){
    var token='', user='', pass='';
    try{
      token = Lampa.Storage.field('torrserver_token')||'';
      user  = Lampa.Storage.field('torrserver_user')||'';
      pass  = Lampa.Storage.field('torrserver_pass')||'';
    }catch(e){}
    var headers = { 'Content-Type':'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    else if (user || pass){
      var btoaSafe = function(s){
        try{ return btoa(s); }catch(_){ try{ return (typeof Buffer!=='undefined'?Buffer.from(s,'utf-8').toString('base64'):''); }catch(_2){ return ''; } }
      };
      headers['Authorization'] = 'Basic ' + btoaSafe(user+':'+pass);
    }
    return headers;
  }
  function tsBaseForStream(){
    var base = tsBase();
    var user='', pass='';
    try{ user = Lampa.Storage.field('torrserver_user')||''; pass = Lampa.Storage.field('torrserver_pass')||''; }catch(e){}
    try{
      var u = new URL(base);
      if (user || pass){ u.username=user; u.password=pass; base=u.toString().replace(/\/$/,''); }
    }catch(e){}
    return base;
  }
  function tsStreamAuthQuery(){
    var token=''; try{ token = Lampa.Storage.field('torrserver_token')||''; }catch(e){}
    return token ? '&authorization=' + encodeURIComponent('Bearer '+token) : '';
  }

  // ---------- TMDB данные ----------
  function getMoviePayload(data){
    var m = data && data.movie; if (!m) throw new Error('Нет data.movie');
    if (isSerial(m)) throw new Error('skip-serial');
    var title = String(m.title||m.name||'').trim();
    var orig  = String(m.original_title||m.original_name||title).trim();
    var year  = String(m.release_date||'0000').slice(0,4);
    if (!title) throw new Error('Не определено название фильма');
    var poster = tmdbImg(m.poster_path, 'w342');
    return { title:title, orig:orig, year:year, poster:poster, full:m };
  }
  function getShowPayload(data){
    var m = data && data.movie; if (!m) throw new Error('Нет data.movie');
    if (!isSerial(m)) throw new Error('skip-movie');
    var title = String(m.name||m.title||'').trim();
    var orig  = String(m.original_name||m.original_title||title).trim();
    var tvId  = m.id;
    var poster= tmdbImg(m.poster_path, 'w342');
    return { title:title, orig:orig, tvId:tvId, poster:poster, full:m };
  }

  // ---------- TorrServer API ----------
  async function tsAdd(base, addLink, metaTitle, metaPoster, metaFull){
    var url  = base + '/torrents';
    var body = { action:'add', link:addLink, title:('[LAMPA] '+(metaTitle||'')).trim(), poster: metaPoster||'', data: JSON.stringify({lampa:true,movie:metaFull||{}}), save_to_db:false };
    var r = await fetch(url, { method:'POST', headers: tsAuthHeaders(), body: JSON.stringify(body) });
    var j = {}; try{ j = await r.json(); }catch(e){}
    var hash = j.hash || j.id || j.link || j.data || j.result || '';
    return { hash:hash, id:hash, raw:j };
  }
  function pickFileStats(j){
    if (!j) return [];
    if (Array.isArray(j)) return j;
    if (Array.isArray(j.file_stats)) return j.file_stats;
    if (Array.isArray(j.FileStats)) return j.FileStats;
    if (Array.isArray(j.files)) return j.files;
    if (Array.isArray(j.Files)) return j.Files;
    if (j.stats && Array.isArray(j.stats.file_stats)) return j.stats.file_stats;
    return [];
  }
  async function tsFiles(base, linkOrHash){
    var headers = tsAuthHeaders();
    try{
      var body = { action:'get' };
      if (/^(magnet:|https?:)/i.test(linkOrHash)) body.link = linkOrHash; else body.hash = linkOrHash;
      var r1 = await fetch(base+'/torrents', { method:'POST', headers: headers, body: JSON.stringify(body) });
      if (r1.ok){
        var j1 = await r1.json(); var fs1 = pickFileStats(j1);
        if (fs1.length) return { files:fs1, raw:j1 };
      }
    }catch(e){}
    try{
      var r2 = await fetch(base+'/stream/files?link='+encodeURIComponent(linkOrHash), { method:'GET', headers: headers });
      if (r2.ok){
        var j2 = await r2.json(); var fs2 = pickFileStats(j2);
        if (fs2.length) return { files:fs2, raw:j2 };
      }
    }catch(e){}
    return { files:[], raw:null };
  }

  function closeAllModals(){
    try{ var els=document.querySelectorAll('.jacredru-modal'); for (var i=0;i<els.length;i++) els[i].remove(); }catch(e){}
    try{ if (window.Lampa && Lampa.Modal && typeof Lampa.Modal.close==='function') Lampa.Modal.close(); }catch(e){}
  }

  function tsPlayById(hash, file, title){
    closeAllModals();
    var baseForStream = tsBaseForStream();
    var fname = safeName((String(file.path||'').split('/').pop()||title||'video')) + '.mkv';
    var idx = 1;
    if (file){
      var fid = (typeof file.id!=='undefined') ? file.id : (typeof file.Id!=='undefined' ? file.Id : null);
      var n = Number(fid);
      idx = isNaN(n) ? 1 : (n + 1);
    }
    var url = baseForStream + '/stream/' + encodeURIComponent(fname) + '?link=' + encodeURIComponent(hash) + '&index=' + idx + '&play=1';
    var qAuth = tsStreamAuthQuery(); if (qAuth) url += qAuth;
    try{
      if (window.Lampa && Lampa.Player && typeof Lampa.Player.play==='function'){
        Lampa.Player.play({ url:url, title: title||fname, timeline:0 });
      } else location.href = url;
    }catch(e){ location.href = url; }
  }

  // ---------- Стили ----------
  function injectStyles(){
    if (document.getElementById('jacredru-style')) return;
    var css = ''
      + '.jacredru-body{padding:4px 8px 12px 8px;overflow:auto;max-height:calc(88vh - 72px)}'
      + '.jacredru-row{display:flex;align-items:center;gap:18px;padding:16px;border-radius:12px}'
      + '.jacredru-row.selector{cursor:pointer}'
      + '.jacredru-row.selector.focus{outline:none;background:rgba(255,255,255,.06)}'
      + '.jacredru-thumb{width:200px;height:112px;border-radius:10px;background:#222 center/cover no-repeat;flex:0 0 auto}'
      + '.jacredru-title{font-size:30px;font-weight:800}'
      + '.jacredru-sub{opacity:.8;margin-top:6px}'
      + '.jacredru-size{margin-left:auto;opacity:.9;font-weight:700}'
      + '.jacredru-fhd-badge{display:inline-block;padding:2px 8px;border-radius:6px;background:#1565C0;color:#fff;font-size:13px;font-weight:700;margin-left:8px;vertical-align:middle}'
      + '@media (max-width:860px){ .jacredru-thumb{width:160px;height:90px} .jacredru-title{font-size:24px} }'
      + '.jacredru-pack{--pack:#60A5FA;margin:6px 0 10px}'
      + '.jacredru-pack-title{display:flex;align-items:center;gap:10px;padding:10px 14px;font-size:22px;font-weight:900;border-left:6px solid var(--pack);border-radius:10px;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03));color:#fff}'
      + '.jacredru-folder{padding:3px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);}'
      + '.jacredru-pack .jacredru-row{border-left:4px solid var(--pack)}'
      + '.jacredru-pack .jacredru-row.selector.focus{box-shadow:inset 0 0 0 2px var(--pack)}'
      + '.jacredru-loader{display:flex;align-items:center;gap:14px;padding:22px;font-size:22px}'
      + '.jacredru-fallback{position:fixed;left:0;right:0;top:0;bottom:0;background:rgba(0,0,0,.72);z-index:99999;display:flex;align-items:center;justify-content:center}'
      + '.jacredru-card{width:min(1450px,94vw);max-height:88vh;overflow:hidden;border-radius:16px;background:#111;border:1px solid rgba(255,255,255,.06);box-shadow:0 10px 40px rgba(0,0,0,.5)}'
      + '.jacredru-head{padding:20px 28px;font-size:28px;font-weight:800;letter-spacing:.3px;background:rgba(255,255,255,.04)}'
      + '@keyframes jrloader{to{transform:rotate(360deg)}}';
    var s = document.createElement('style'); s.id='jacredru-style'; s.textContent=css; document.head.appendChild(s);
  }

  function injectBtnStyles(){
    if (document.getElementById('jacredru-btn-style')) return;
    var css = ''
      + '.full-start__button.jacredru-btn{background:linear-gradient(135deg,#1565C0 0%,#0D47A1 100%)!important;color:#fff!important;border:0!important;outline:0!important;box-shadow:0 2px 8px rgba(0,0,0,.35)!important}'
      + '.full-start__button.jacredru-btn.selector.focus,.full-start__button.jacredru-btn:hover{filter:brightness(1.12);transform:translateY(-1px)}'
      + '.full-start__button.jacredru-btn svg{color:currentColor}';
    var s = document.createElement('style'); s.id='jacredru-btn-style'; s.textContent=css; document.head.appendChild(s);
  }

  // ---------- Фокус ----------
  function setFocus(container, el){
    if (!container) return;
    var $ = window.$ || window.jQuery;
    var nodes = container.querySelectorAll('.selector');
    for (var i=0;i<nodes.length;i++) nodes[i].classList.remove('focus');
    if (el){
      try{ el.classList.add('focus'); el.setAttribute('tabindex','0'); el.focus({preventScroll:true}); }catch(e){}
      try{ el.scrollIntoView({block:'nearest', inline:'nearest'}); }catch(e){}
      if ($) $(el).trigger('hover:focus');
    }
  }
  function focusFirst(container){
    if (!container) return;
    var el = container.querySelector('.selector');
    if (el) setFocus(container, el);
  }
  function moveFocus(container, dir){
    if (!container) return;
    var nodes = Array.prototype.slice.call(container.querySelectorAll('.selector'));
    if (!nodes.length) return;
    var idx = Math.max(0, nodes.findIndex(function(n){ return n.classList.contains('focus'); }));
    if (idx<0) idx=0;
    var next = idx;
    if (dir==='down'||dir==='right') next = Math.min(nodes.length-1, idx+1);
    else if (dir==='up'||dir==='left') next = Math.max(0, idx-1);
    if (next !== idx) setFocus(container, nodes[next]);
  }

  // ---------- Модальное окно ----------
  function openModal(title){
    injectStyles();
    closeAllModals();

    var $ = window.$ || window.jQuery;
    var $body = $ ? $('<div class="jacredru-body"></div>') : null;

    var usingLampa = false;
    try{
      if (window.Lampa && Lampa.Modal && typeof Lampa.Modal.open==='function' && $){
        Lampa.Modal.open({
          title: String(title||''),
          html: $body,
          size: 'large',
          onBack: function(){
            try{ Lampa.Modal.close(); }catch(e){}
            try{ Lampa.Controller.toggle('content'); }catch(e){}
          }
        });
        usingLampa = true;
      }
    }catch(e){ usingLampa = false; }

    var fallback = null, fallbackBody = null, fallbackClose = function(){};
    var fallbackKeydown = null;
    if (!usingLampa){
      var root = document.createElement('div'); root.className='jacredru-fallback jacredru-modal';
      var card = document.createElement('div'); card.className='jacredru-card';
      var head = document.createElement('div'); head.className='jacredru-head'; head.textContent=String(title||'');
      var body = document.createElement('div'); body.className='jacredru-body';
      card.appendChild(head); card.appendChild(body); root.appendChild(card);
      document.body.appendChild(root);
      fallback = root; fallbackBody = body;

      fallbackKeydown = function(e){
        var code = e.key || e.keyCode;
        if (code==='Escape'||code==='Backspace'||code==='BrowserBack'||code==='GoBack'||code===8||code===27||code===10009||code===461){
          e.preventDefault(); fallbackClose(); return;
        }
        if (code==='ArrowDown'||code===40){ e.preventDefault(); moveFocus(fallbackBody,'down'); return; }
        if (code==='ArrowUp'  ||code===38){ e.preventDefault(); moveFocus(fallbackBody,'up');   return; }
        if (code==='ArrowLeft'||code===37){ e.preventDefault(); moveFocus(fallbackBody,'left'); return; }
        if (code==='ArrowRight'||code===39){ e.preventDefault(); moveFocus(fallbackBody,'right');return; }
        if (code==='Enter'||code===13){
          e.preventDefault();
          var cur = fallbackBody.querySelector('.selector.focus');
          if (cur){
            var $$ = window.$ || window.jQuery;
            if ($$) $$(cur).trigger('hover:enter');
            else cur.click();
          }
        }
      };
      document.addEventListener('keydown', fallbackKeydown, true);
      fallbackClose = function(){
        try{ document.removeEventListener('keydown', fallbackKeydown, true); }catch(e){}
        try{ fallback.parentNode && fallback.parentNode.removeChild(fallback); }catch(e){}
        try{ if (window.Lampa && Lampa.Controller) Lampa.Controller.toggle('content'); }catch(e){}
      };
    }

    try{
      if (usingLampa && window.Lampa && Lampa.Controller && typeof Lampa.Controller.add==='function'){
        Lampa.Controller.add('jacredru_modal',{
          toggle: function(){
            try{
              if ($body) Lampa.Controller.collectionSet($body);
              focusFirst($body && $body[0]);
            }catch(e){}
          },
          up:    function(){ try{ moveFocus($body && $body[0],'up');    }catch(e){} },
          down:  function(){ try{ moveFocus($body && $body[0],'down');  }catch(e){} },
          left:  function(){ try{ moveFocus($body && $body[0],'left');  }catch(e){} },
          right: function(){ try{ moveFocus($body && $body[0],'right'); }catch(e){} },
          enter: function(){
            try{
              var el = $body && $body.find('.selector.focus').get(0);
              if (!el) el = $body && $body.find('.selector').get(0);
              if (el){
                var $$ = window.$ || window.jQuery;
                if ($$) $$(el).trigger('hover:enter');
                else el.click();
              }
            }catch(e){}
          },
          back: function(){
            try{
              if (usingLampa){ Lampa.Modal.close(); Lampa.Controller.toggle('content'); }
            }catch(e){}
          }
        });
        setTimeout(function(){ try{ Lampa.Controller.toggle('jacredru_modal'); }catch(e){} }, 0);
      }
    }catch(e){}

    function setItems(itemsFragment){
      if (usingLampa){
        try{
          $body.empty().append(itemsFragment);
          Lampa.Controller.collectionSet($body);
          Lampa.Controller.toggle('jacredru_modal');
          focusFirst($body[0]);
        }catch(e){}
      } else {
        try{
          fallbackBody.innerHTML='';
          fallbackBody.appendChild(itemsFragment);
          focusFirst(fallbackBody);
        }catch(e){}
      }
    }
    function setLoading(text){
      if (usingLampa){
        var row = $('<div class="jacredru-loader"><div style="width:26px;height:26px;border:3px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:jrloader .8s linear infinite;flex:0 0 auto"></div><div>'+(text||'Загрузка...')+'</div></div>');
        $body.empty().append(row);
        try{ Lampa.Controller.collectionSet($body); Lampa.Controller.toggle('jacredru_modal'); focusFirst($body[0]); }catch(e){}
      } else {
        var d = document.createElement('div'); d.className='jacredru-loader'; d.textContent = String(text||'Загрузка...');
        fallbackBody.innerHTML=''; fallbackBody.appendChild(d);
      }
    }
    function closeAll(){
      if (usingLampa){ try{ Lampa.Modal.close(); }catch(e){} }
      else { fallbackClose(); }
    }

    return { setItems:setItems, setLoading:setLoading, close:closeAll, bodyNode: usingLampa ? ($body && $body[0]) : fallbackBody };
  }

  // ---------- UI строители ----------
  function makePackHeader(text){
    var $ = window.$ || window.jQuery;
    if ($) return $('<div class="jacredru-pack-title"><span class="jacredru-folder">'+(text||'Релиз')+'</span></div>');
    var div = document.createElement('div'); div.className='jacredru-pack-title';
    var badge = document.createElement('span'); badge.className='jacredru-folder'; badge.textContent=String(text||'Релиз');
    div.appendChild(badge); return div;
  }

  function makeEpisodeRow(epNum, name, stillUrl, sizeText, tail){
    var $ = window.$ || window.jQuery;
    var title = 'S'+String(epNum.season||1)+'E'+String(epNum.ep||0).padStart(2,'0')+' — '+(name||('Серия '+(epNum.ep||'')));
    if ($){
      return $('<div class="jacredru-row selector" tabindex="0">'
        +'<div class="jacredru-thumb" style="background-image:url(\''+(stillUrl||'')+'\')"></div>'
        +'<div>'
          +'<div class="jacredru-title">'+title+'</div>'
          +'<div class="jacredru-sub">'+(tail||'')+'</div>'
        +'</div>'
        +'<div class="jacredru-size">'+(sizeText||'')+'</div>'
      +'</div>');
    } else {
      var row = document.createElement('div'); row.className='jacredru-row selector'; row.tabIndex=0;
      var th  = document.createElement('div'); th.className='jacredru-thumb'; th.style.backgroundImage="url('"+(stillUrl||"")+"')";
      var mid = document.createElement('div');
      var t   = document.createElement('div'); t.className='jacredru-title'; t.textContent=title;
      var sub = document.createElement('div'); sub.className='jacredru-sub'; sub.textContent=String(tail||'');
      var sz  = document.createElement('div'); sz.className='jacredru-size'; sz.textContent=String(sizeText||'');
      mid.appendChild(t); mid.appendChild(sub); row.appendChild(th); row.appendChild(mid); row.appendChild(sz);
      return row;
    }
  }

  // ---------- Вспомогательные парсеры ----------
  function humanSize(bytes){
    if (bytes===null || typeof bytes==='undefined') return '';
    var u=['B','KB','MB','GB','TB']; var i=0; var n=Number(bytes);
    while(n>=1024 && i<u.length-1){ n/=1024; i++; }
    return (i>=2 ? n.toFixed(1) : Math.round(n)) + ' ' + u[i];
  }

  function extractSeasonsFromTitle(s){
    var str = String(s||'');
    var out = {};
    var rng = str.match(/s(?:eason)?\s*(\d{1,2})\s*[-–…]\s*(\d{1,2})/i);
    if (rng){ var a=Number(rng[1]), b=Number(rng[2]); for(var i=a;i<=b;i++) out[i]=1; }
    var re = /(?:s(?:eason)?\s*(\d{1,2})|\bS(\d{1,2})\b|(?:[^\d]|^)(\d{1,2})\s*(?:сезон|сез))/gi, m;
    while((m=re.exec(str))!==null){ var n=Number(m[1]||m[2]||m[3]); if(n) out[n]=1; }
    var keys = Object.keys(out).map(function(x){return Number(x);});
    if (!keys.length) keys=[1];
    return keys;
  }

  // Улучшенный парсинг номера эпизода
  function parseEpisodeNum(path, seasonHint){
    var name = String(path||'').split('/').pop();
    // S01E05
    var m = name.match(/[Ss](\d{1,2})[Ee](\d{1,3})/i); if (m) return { season:Number(m[1]), ep:Number(m[2]) };
    // 1x05
    m = name.match(/(\d{1,2})x(\d{1,3})/i);      if (m) return { season:Number(m[1]), ep:Number(m[2]) };
    // ep05, episode 5
    m = name.match(/[Ee]p(?:isode)?\s*(\d{1,3})/i); if (m) return { season:seasonHint||1, ep:Number(m[1]) };
    // Серия 5, 5 серия, 5 эпизод
    m = name.match(/(\d{1,3})\s*(?:сери[яи]|эпизод)/i); if (m) return { season:seasonHint||1, ep:Number(m[1]) };
    // просто число в имени (если нет других маркеров) – но только если оно не похоже на год
    var simple = name.match(/(?:^|[^\d])(\d{1,2})(?:[^\d]|$)/);
    if (simple && parseInt(simple[1]) <= 30) return { season:seasonHint||1, ep:parseInt(simple[1]) };
    return { season:seasonHint||0, ep:0 };
  }

  function topFolderFromFiles(files){
    for (var i=0;i<(files||[]).length;i++){
      var f = files[i];
      var p = String(f.path||'').replace(/^\/+/,'');
      if (p.indexOf('/')>=0){ var seg=p.split('/')[0].trim(); if (seg) return seg; }
    }
    return '';
  }

  // ---------- Поток для СЕРИАЛА ----------
  async function showSeasons(meta){
    // Ищем ТОЛЬКО по оригинальному названию (англ.)
    var query = meta.orig;
    noty('Поиск сезонов: ' + query);

    var items = await searchFHD(query, true);
    if (!items.length){
      // fallback: пробуем без указания типа (тип авто)
      items = await searchFHD(query, undefined);
    }
    if (!items.length) throw new Error('Ничего не найдено на jac.red для "'+query+'"');

    var bySeason = {};
    for (var i=0;i<items.length;i++){
      var it = items[i];
      var seasons = extractSeasonsFromTitle(it.title);
      for (var k=0;k<seasons.length;k++){
        var s = seasons[k];
        if (!bySeason[s]) bySeason[s]=[];
        bySeason[s].push(it);
      }
    }

    var seasonNums = Object.keys(bySeason).map(function(x){return Number(x);}).sort(function(a,b){return a-b;});
    if (!seasonNums.length) throw new Error('Сезоны не найдены');

    var posters = {};
    await Promise.all(seasonNums.map(async function(sn){
      try{
        var r = await fetch(tmdbUrl('tv/'+meta.tvId+'/season/'+sn, { language: tmdbLang() }));
        if (r.ok){
          var j = await r.json();
          posters[sn] = (j && j.poster_path) ? tmdbImg(j.poster_path, 'w300') : (meta.poster||'');
        } else posters[sn] = meta.poster||'';
      }catch(e){ posters[sn] = meta.poster||''; }
    }));

    var dlg = openModal('ВЫБЕРИТЕ СЕЗОН');
    var $ = window.$ || window.jQuery;
    var frag = document.createDocumentFragment();

    for (var si=0;si<seasonNums.length;si++){
      var sn = seasonNums[si];
      var rels = bySeason[sn] || [];
      var bestSize = '';
      if (rels.length){
        var maxSize = 0;
        for (var ri=0;ri<rels.length;ri++){ var sz=Number(rels[ri].size||0); if (sz>maxSize) maxSize=sz; }
        bestSize = humanSize(maxSize);
      }
      var thumb = posters[sn] ? "background-image:url('"+posters[sn]+"')" : 'background:#222';
      var fhdCount = rels.filter(function(x){ return isFullHD(x.title); }).length;
      var subText = 'Вариантов: '+rels.length + (fhdCount ? ' • Full HD: '+fhdCount : '');

      if ($){
        var row = $('<div class="jacredru-row selector" tabindex="0">'
          +'<div class="jacredru-thumb" style="'+thumb+'"></div>'
          +'<div>'
            +'<div class="jacredru-title">СЕЗОН '+sn+(fhdCount?'<span class="jacredru-fhd-badge">FHD</span>':'')+'</div>'
            +'<div class="jacredru-sub">'+subText+'</div>'
          +'</div>'
          +'<div class="jacredru-size">'+(bestSize||'')+'</div>'
        +'</div>');
        (function(snCopy, relsCopy){
          row.on('hover:enter click keydown', function(e){
            if (e.type==='keydown' && e.key!=='Enter' && e.keyCode!==13) return;
            fetchEpisodesAggregated(meta, snCopy, relsCopy);
          });
        })(sn, rels);
        frag.appendChild(row[0]);
      } else {
        var row2 = document.createElement('div'); row2.className='jacredru-row selector'; row2.tabIndex=0;
        var th2=document.createElement('div'); th2.className='jacredru-thumb'; th2.style=thumb;
        var mid2=document.createElement('div');
        var t2=document.createElement('div'); t2.className='jacredru-title'; t2.textContent='СЕЗОН '+sn;
        var sub2=document.createElement('div'); sub2.className='jacredru-sub'; sub2.textContent=subText;
        var sz2=document.createElement('div'); sz2.className='jacredru-size'; sz2.textContent=bestSize||'';
        mid2.appendChild(t2); mid2.appendChild(sub2); row2.appendChild(th2); row2.appendChild(mid2); row2.appendChild(sz2);
        (function(snCopy, relsCopy, el){
          el.addEventListener('click', function(){ fetchEpisodesAggregated(meta, snCopy, relsCopy); });
          el.addEventListener('keydown', function(e){ if (e.key==='Enter'||e.keyCode===13) fetchEpisodesAggregated(meta, snCopy, relsCopy); });
        })(sn, rels, row2);
        frag.appendChild(row2);
      }
    }

    dlg.setItems(frag);
  }

  async function fetchEpisodesAggregated(meta, sn, releases){
    var dlg = openModal('СЕЗОН '+sn+' — Эпизоды');
    dlg.setLoading('Подготовка релизов...');

    var tmdbSeason=null, names={}, stills={};
    try{
      var r=await fetch(tmdbUrl('tv/'+meta.tvId+'/season/'+sn,{language:tmdbLang()}));
      if(r.ok) tmdbSeason=await r.json();
    }catch(e){}
    if (tmdbSeason && Array.isArray(tmdbSeason.episodes)){
      for (var i=0;i<tmdbSeason.episodes.length;i++){
        var ep = tmdbSeason.episodes[i];
        names[ep.episode_number] = ep.name||'';
        stills[ep.episode_number] = tmdbImg(ep.still_path,'w300');
      }
    }

    var base = tsBase();
    var groups = {}, order = [];

    for (var ri=0;ri<releases.length;ri++){
      var rel = releases[ri];
      var link = rel.magnet || rel.link; var hash = link;
      try{
        var added = await tsAdd(base, link, meta.title+' (S'+sn+')', '', meta.full);
        if (added.hash) hash = added.hash;
      }catch(e){ console.warn('[JacRedRU] tsAdd error', e); }

      try{
        var resp = await tsFiles(base, hash);
        var files = resp.files || [];
        if (!files.length) continue;
        var vids = files.filter(function(x){ return looksLikeVideo(x.path) && Number(x.length||0) >= MIN_EP_BYTES; });
        if (!vids.length){
          // если нет видео >= MIN_EP_BYTES, берём любые видео (меньшего размера)
          vids = files.filter(function(x){ return looksLikeVideo(x.path) && Number(x.length||0) > 0; });
        }
        if (!vids.length) continue;

        var folder = topFolderFromFiles(vids) || rel.title || 'Релиз';
        if (!groups[folder]){ groups[folder]=[]; order.push(folder); }

        for (var fi=0;fi<vids.length;fi++){
          var f = vids[fi];
          var parsed = parseEpisodeNum(f.path, sn);
          if (parsed.season && parsed.season !== sn) continue;
          var epn = parsed.ep||0; if (!epn) continue;
          var size = Number(f.length||0);
          var existedIndex = -1;
          for (var j=0;j<groups[folder].length;j++){ if (groups[folder][j].ep===epn){ existedIndex=j; break; } }
          if (existedIndex===-1){
            groups[folder].push({ ep:epn, file:f, hash:hash, size:size, folder:folder });
          } else {
            if (size > groups[folder][existedIndex].size){
              groups[folder][existedIndex] = { ep:epn, file:f, hash:hash, size:size, folder:folder };
            }
          }
        }
      }catch(e){ console.warn('[JacRedRU] tsFiles error', e); }
    }

    var $ = window.$ || window.jQuery;
    var frag = document.createDocumentFragment();

    for (var oi=0;oi<order.length;oi++){
      var folder = order[oi];
      var items = groups[folder]||[];
      if (!items.length) continue;
      items.sort(function(a,b){ return a.ep-b.ep; });

      var color = PACK_COLORS[oi % PACK_COLORS.length];
      var wrap = document.createElement('div'); wrap.className='jacredru-pack'; wrap.style.setProperty('--pack', color);

      var header = makePackHeader(folder);
      wrap.appendChild(header instanceof Element ? header : header[0]);

      for (var ii=0;ii<items.length;ii++){
        var it = items[ii];
        var rowEl = makeEpisodeRow({season:sn, ep:it.ep}, names[it.ep]||('Серия '+it.ep), stills[it.ep]||'', humanSize(it.size), folder);
        (function(h, fObj, titleStr, el){
          if ($){
            $(rowEl).on('hover:enter click keydown', function(e){
              if (e.type==='keydown' && e.key!=='Enter' && e.keyCode!==13) return;
              tsPlayById(h, fObj, titleStr);
            });
            wrap.appendChild(rowEl[0]);
          } else {
            el.addEventListener('click', function(){ tsPlayById(h, fObj, titleStr); });
            el.addEventListener('keydown', function(e){ if (e.key==='Enter'||e.keyCode===13) tsPlayById(h, fObj, titleStr); });
            wrap.appendChild(el);
          }
        })(it.hash, it.file, (meta.title+' S'+sn+'E'+String(it.ep).padStart(2,'0')), (rowEl instanceof Element?rowEl:rowEl[0]));
      }

      frag.appendChild(wrap);
    }

    if (!frag.children.length){
      dlg.setLoading('Серии не найдены (≥'+MIN_EP_MB+'MB). Попробуй другой релиз.');
      return;
    }
    dlg.setItems(frag);
  }

  // ---------- Поток для ФИЛЬМА ----------
  async function runMovie(data){
    var meta = getMoviePayload(data);

    var queries = [
      meta.orig + ' ' + meta.year,
      meta.orig,
      meta.title + ' ' + meta.year,
      meta.title
    ];

    var items = [];
    for (var qi=0;qi<queries.length;qi++){
      items = await searchFHD(queries[qi].trim(), false);
      if (items.length) break;
    }
    if (!items.length) throw new Error('Ничего не найдено в Full HD на jac.red');

    var best = items[0];
    var addLink = best.magnet || best.link;

    noty('Поиск: ' + meta.title + (isFullHD(best.title) ? ' [Full HD]' : ''));

    var base = tsBase();
    var linkParam = addLink;
    try{
      var added = await tsAdd(base, addLink, meta.title, meta.poster, meta.full);
      if (added.hash) linkParam = added.hash;
    }catch(e){ linkParam = addLink; }

    var selectedFile = null;
    try{
      var resp = await tsFiles(base, linkParam);
      var files = (resp && resp.files) || [];
      var vids = files.filter(function(x){ return looksLikeVideo(x.path) && Number(x.length||0) > 0; });
      if (vids.length){
        vids.sort(function(a,b){ return Number(b.length||0) - Number(a.length||0); });
        selectedFile = vids[0];
      }
    }catch(e){}

    noty('Запускаю воспроизведение...');
    closeAllModals();

    var baseForStream = tsBaseForStream();
    var baseName = selectedFile && selectedFile.path ? String(selectedFile.path).split('/').pop() : (meta.title||'video');
    var fname = safeName(baseName) + '.mkv';
    var idx = 1;
    if (selectedFile){
      var fid = (typeof selectedFile.id!=='undefined') ? selectedFile.id : (typeof selectedFile.Id!=='undefined' ? selectedFile.Id : null);
      var n = Number(fid);
      if (!isNaN(n)) idx = n + 1;
    }
    var url = baseForStream + '/stream/' + encodeURIComponent(fname) + '?link=' + encodeURIComponent(linkParam) + '&index=' + idx + '&play=1';
    var qAuth = tsStreamAuthQuery(); if (qAuth) url += qAuth;
    try{
      if (window.Lampa && Lampa.Player && typeof Lampa.Player.play==='function'){
        Lampa.Player.play({ url:url, title: meta.title||fname, timeline:0 });
      } else location.href = url;
    }catch(e){ location.href = url; }
  }

  // ---------- Точка входа ----------
  async function runPlay(evData){
    try{
      var mv = evData && evData.movie;
      if (!mv) return;
      if (isSerial(mv)){
        var meta = getShowPayload(evData);
        await showSeasons(meta);
      } else {
        await runMovie(evData);
      }
    }catch(e){
      if (String(e && e.message)==='skip-movie' || String(e && e.message)==='skip-serial') return;
      noty('JacRedRU: ' + (e && e.message || String(e)), 4000);
      console.error('[JacRedRU]', e);
    }
  }

  // ---------- Кнопка и монтирование ----------
  function findButtonsBar(root){
    var bar = root.find('.full-start-new__buttons').eq(0); if (bar && bar.length) return bar;
    bar = root.find('.full-start__buttons').eq(0);         if (bar && bar.length) return bar;
    bar = root.find('.full-actions').eq(0);                if (bar && bar.length) return bar;
    return root.find('.full-start__right, .full-start').eq(0);
  }

  function makeButton(){
    var $ = window.$ || window.jQuery;
    return $('<div class="full-start__button selector jacredru-btn" data-jacredru-icon="1" tabindex="0" aria-label="JacRedRU">'
      +'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="28" height="28" aria-hidden="true"><path d="M20 15l20 10-20 10V15z" fill="currentColor"/></svg>'
      +'<span>Full HD</span>'
    +'</div>');
  }

  function attachButtonOnce(root, ev){
    var m = ev && ev.data && ev.data.movie; if (!m) return true;
    var bar = findButtonsBar(root); if (!bar || !bar.length) return false;
    if (bar.find('[data-jacredru-icon="1"]').length) return true;
    var btn = makeButton();
    var click = function(){ runPlay(ev.data); };
    btn.on('hover:enter', click);
    btn.on('click', click);
    btn.on('keydown', function(e){ if (e.key==='Enter'||e.keyCode===13) click(); });
    bar.prepend(btn);
    try{ Lampa.Controller.collectionSet(bar); }catch(e){}
    return true;
  }

  function mountPlugin(){
    injectBtnStyles();
    try{
      Lampa.Listener.follow('full', function(ev){
        if (!ev || ev.type !== 'complite' || !ev.object) return;
        var root = ev.object.activity.render();
        if (attachButtonOnce(root, ev)) return;
        try{
          var target = root[0] || root;
          var mo = new MutationObserver(function(){ if (attachButtonOnce(root, ev)) mo.disconnect(); });
          mo.observe(target, {childList:true, subtree:true});
          setTimeout(function(){ try{ mo.disconnect(); }catch(e){} }, 8000);
        }catch(e){}
      });
    }catch(e){}
  }

  if (!window.plugin_jacredru_ready){ window.plugin_jacredru_ready = true; try{ mountPlugin(); }catch(e){} }
})();