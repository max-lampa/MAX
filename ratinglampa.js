(function () {
  'use strict';

  var PLUGIN_NAME  = 'LampaRating';
  var STORE_KEY    = 'lampa_rating_data';
  var VOTED_KEY    = 'lampa_rating_voted';
  var SETTINGS_KEY = 'lampa_rating_settings';

  /* ── Хранилище ── */
  function loadData()   { try { return JSON.parse(localStorage.getItem(STORE_KEY)   || '{}'); } catch(e){ return {}; } }
  function saveData(d)  { try { localStorage.setItem(STORE_KEY,   JSON.stringify(d)); } catch(e){} }
  function loadVoted()  { try { return JSON.parse(localStorage.getItem(VOTED_KEY)   || '{}'); } catch(e){ return {}; } }
  function saveVoted(v) { try { localStorage.setItem(VOTED_KEY,   JSON.stringify(v)); } catch(e){} }
  function loadSettings()  { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch(e){ return {}; } }
  function saveSettings(s) { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch(e){} }
  function getSetting(k,d) { var s=loadSettings(); return s[k]!==undefined?s[k]:d; }
  function setSetting(k,v) { var s=loadSettings(); s[k]=v; saveSettings(s); }

  /* ── Ключ карточки ── */
  function cardKey(card) {
    var id   = (card.id   || (card.movie && card.movie.id))   || '';
    var type = (card.type || (card.movie && card.movie.type)) || 'movie';
    return type + '_' + id;
  }

  /* ── Рейтинг ── */
  function getRating(key) {
    var d = loadData();
    return d[key] || { score: 0, count: 0 };
  }
  function addVote(key, score) {
    var d = loadData();
    if (!d[key]) d[key] = { score: 0, count: 0 };
    var r = d[key];
    r.score = Math.round(((r.score * r.count + score) / (r.count + 1)) * 10) / 10;
    r.count += 1;
    d[key] = r;
    saveData(d);
    return r;
  }

  /* ── 24-часовое ограничение ── */
  function canVote(key)  { var v=loadVoted(); return !v[key] || (Date.now()-v[key])>86400000; }
  function markVoted(key){ var v=loadVoted(); v[key]=Date.now(); saveVoted(v); }

  /* ── Флаги стран ── */
  var FLAGS = {
    'США':'🇺🇸','USA':'🇺🇸','Россия':'🇷🇺','Russia':'🇷🇺',
    'Великобритания':'🇬🇧','UK':'🇬🇧','Германия':'🇩🇪','Франция':'🇫🇷',
    'Ирландия':'🇮🇪','Канада':'🇨🇦','Австралия':'🇦🇺','Япония':'🇯🇵',
    'Китай':'🇨🇳','Корея':'🇰🇷','Индия':'🇮🇳','Испания':'🇪🇸','Италия':'🇮🇹'
  };
  function getFlag(countries) {
    if (!countries || !countries.length) return '';
    var n = (countries[0] && countries[0].ru) || countries[0] || '';
    return FLAGS[n] || '';
  }

  /* ── CSS для модала ── */
  var css = [
    '.lr-ov{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.75);z-index:99999;display:flex;align-items:flex-end;justify-content:center}',
    '.lr-pn{background:#1c1c1e;border-radius:20px 20px 0 0;width:100%;max-width:520px;padding:28px 24px 40px;box-sizing:border-box}',
    '.lr-h2{font-size:26px;font-weight:300;color:#fff;margin-bottom:22px}',
    '.lr-ir{display:flex;gap:16px;margin-bottom:28px;align-items:flex-start}',
    '.lr-post{width:110px;height:160px;object-fit:cover;border-radius:10px;flex-shrink:0;background:#222}',
    '.lr-mt{flex:1;display:flex;flex-direction:column;gap:6px;padding-top:4px}',
    '.lr-yr{font-size:15px;color:#ccc}',
    '.lr-ti{font-size:21px;font-weight:600;color:#fff;line-height:1.2}',
    '.lr-sb{display:inline-flex;align-items:center;gap:8px;border:1px solid #444;border-radius:20px;padding:6px 14px;margin-top:6px}',
    '.lr-ss{color:#f5a623;font-size:18px}',
    '.lr-sv,.lr-sc{color:#fff;font-size:17px;font-weight:600}',
    '.lr-sd{color:#444;font-size:18px}',
    '.lr-sg{display:grid;grid-template-columns:repeat(7,1fr);gap:4px 0;margin-bottom:24px;text-align:center}',
    '.lr-sc2{display:flex;flex-direction:column;align-items:center;cursor:pointer;padding:4px 2px}',
    '.lr-si{font-size:32px;color:transparent;-webkit-text-stroke:2px #bbb;transition:all .15s;line-height:1;user-select:none}',
    '.lr-si.lit{color:#f5a623;-webkit-text-stroke:0;font-size:36px}',
    '.lr-si.sel{color:#f5a623;-webkit-text-stroke:0}',
    '.lr-sn{font-size:12px;color:#888;margin-top:3px}',
    '.lr-nt{background:#2a2a2c;border-radius:12px;text-align:center;padding:14px 20px;font-size:14px;color:#888;line-height:1.5}',
    '.lr-nt.ok{color:#2ecc71;background:#0d2a1a}',
    '.lr-badge{display:inline-flex;align-items:center;gap:4px;font-size:inherit;color:#fff;margin-left:4px}',
    '.lr-badge b{color:#fff}',
    '.lr-badge span{color:#888;font-size:.85em}',
    '.lr-star-action{width:52px;height:52px;border-radius:12px;background:#1e1e1e;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:26px;color:#fff;transition:background .2s;border:none;outline:none}',
    '.lr-star-action:hover{background:#2a2a2a}',
    '.lr-star-action.voted{color:#f5a623}',
  ].join('');

  function injectCSS() {
    if (document.getElementById('lr-css')) return;
    var s = document.createElement('style');
    s.id = 'lr-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ── Модальное окно ── */
  function showModal(card, onVoted) {
    injectCSS();
    var key    = cardKey(card);
    var movie  = card.movie || card;
    var title  = movie.title || movie.ru_title || movie.name || '';
    var year   = movie.year || '';
    var poster = movie.poster || movie.img || '';
    var flag   = getFlag(movie.production_countries || movie.country || []);
    var rating = getRating(key);
    var voted  = !canVote(key);
    var sel    = 0;

    function mk(tag, cls, style) {
      var el = document.createElement(tag);
      if (cls) el.className = cls;
      if (style) el.style.cssText = style;
      return el;
    }
    function tx(el, t) { el.textContent = t; return el; }

    var ov = mk('div','lr-ov');
    var pn = mk('div','lr-pn');

    pn.appendChild(tx(mk('div','lr-h2'),'Поставьте оценку'));

    var ir = mk('div','lr-ir');
    var po = mk('img','lr-post');
    po.src = poster;
    po.alt = title;
    var mt = mk('div','lr-mt');
    tx(mk('div','lr-yr'),'') ; var yrEl=mt.appendChild(mk('div','lr-yr')); yrEl.textContent = year+(flag?' '+flag:'');
    mt.appendChild(tx(mk('div','lr-ti'),title));
    var sb = mk('div','lr-sb');
    tx(mk('span','lr-ss'),'★').split; sb.appendChild(tx(mk('span','lr-ss'),'★'));
    var svEl=tx(mk('span','lr-sv'), rating.count>0?rating.score.toFixed(1):'—'); sb.appendChild(svEl);
    sb.appendChild(tx(mk('span','lr-sd'),'|'));
    sb.appendChild(tx(mk('span'),'👤'));
    var scEl=tx(mk('span','lr-sc'),String(rating.count)); sb.appendChild(scEl);
    mt.appendChild(sb);
    ir.appendChild(po); ir.appendChild(mt);
    pn.appendChild(ir);

    var sg = mk('div','lr-sg');
    var starEls=[];
    function setH(n){ starEls.forEach(function(si,i){ si.className='lr-si'+(i<n?' lit':''); }); }
    function setS(n){ starEls.forEach(function(si,i){ si.className='lr-si'+(i<n?' sel':''); }); }

    for (var i=1;i<=10;i++) {
      (function(n){
        var cell=mk('div','lr-sc2');
        var si=mk('div','lr-si'); si.textContent='★'; starEls.push(si);
        var sn=mk('div','lr-sn'); sn.textContent=n;
        cell.appendChild(si); cell.appendChild(sn);
        if(!voted){
          cell.addEventListener('mouseenter',function(){setH(n);});
          cell.addEventListener('mouseleave',function(){setS(sel);});
          cell.addEventListener('click',function(){
            sel=n; setS(n);
            var res=addVote(key,n); markVoted(key); voted=true;
            svEl.textContent=res.score.toFixed(1);
            scEl.textContent=res.count;
            ntEl.textContent='Спасибо! Ваша оценка сохранена.';
            ntEl.classList.add('ok');
            if(typeof onVoted==='function') onVoted(res);
            setTimeout(close,1300);
          });
        } else { cell.style.cursor='default'; }
        sg.appendChild(cell);
      })(i);
    }
    pn.appendChild(sg);

    var ntEl=mk('div','lr-nt');
    ntEl.textContent=voted?'Вы уже оценили. Следующая оценка через 24 часа.':'Каждую карточку можно оценить раз в 24 часа';
    pn.appendChild(ntEl);

    ov.appendChild(pn);
    document.body.appendChild(ov);

    function close(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }
    ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
  }

  /* ── Кнопка-звезда в action bar ── */
  function injectStarBtn(card, actionsEl) {
    if (!actionsEl || actionsEl.querySelector('.lr-star-action')) return;
    injectCSS();
    var key = cardKey(card);
    var btn = document.createElement('div');
    btn.className = 'lr-star-action' + (canVote(key) ? '' : ' voted');
    btn.innerHTML = canVote(key) ? '&#9734;' : '&#9733;';
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      showModal(card, function() {
        btn.innerHTML = '&#9733;';
        btn.classList.add('voted');
      });
    });
    actionsEl.appendChild(btn);
  }

  /* ── Рейтинг LAMPA в строке рейтингов ── */
  function injectRatingBadge(card, rateRowEl) {
    if (!rateRowEl || rateRowEl.querySelector('.lr-badge')) return;
    if (!getSetting('show_rating', true)) return;
    injectCSS();
    var key = cardKey(card);
    var r   = getRating(key);
    var badge = document.createElement('span');
    badge.className = 'lr-badge';
    var bv = document.createElement('b');
    bv.textContent = r.count > 0 ? r.score.toFixed(1) : '—';
    var bl = document.createElement('span');
    bl.textContent = ' LAMPA';
    badge.appendChild(bv);
    badge.appendChild(bl);
    rateRowEl.appendChild(badge);
  }

  /* ── Настройки ── */
  function registerSettings() {
    if (typeof Lampa === 'undefined' || !Lampa.SettingsApi) return;
    Lampa.SettingsApi.add({
      component: PLUGIN_NAME,
      name: 'Рейтинг LAMPA',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
      fields: {
        show_cover:  { name: 'Показать обложку',          type: 'toggle', default: true },
        show_rating: { name: 'Показывать оценки LAMPA',   type: 'toggle', default: true },
        show_logo:   { name: 'Логотип вместо названия',   type: 'toggle', default: true },
        show_lgbt:   { name: 'Показывать LGBT контент',   type: 'toggle', default: true },
      },
      onStart:   function()     { return loadSettings(); },
      onChange:  function(f, v) { setSetting(f, v); },
    });
  }

  /* ── Хук на страницу карточки ── */
  function hookFull() {
    if (typeof Lampa === 'undefined') return;
    Lampa.Listener.follow('full', function(e) {
      if (e.type !== 'complite') return;
      var render = e.object && e.object.activity && e.object.activity.render && e.object.activity.render();
      if (!render) return;
      var card = e.object.card || (e.object.activity && e.object.activity.card);
      if (!card) return;
      var actEl  = render.find('.full-start__buttons,.full__actions,.view--full .actions-list').get(0);
      var rateEl = render.find('.full-start__rate,.full__rate,.info__rate').get(0);
      if (actEl)  injectStarBtn(card, actEl);
      if (rateEl) injectRatingBadge(card, rateEl);
    });
  }

  /* ── Инициализация ── */
  function init() {
    registerSettings();
    hookFull();
    console.log('[LampaRating] loaded');
  }

  if (typeof Lampa !== 'undefined' && Lampa.Listener) {
    init();
  } else {
    var _t = setInterval(function() {
      if (typeof Lampa !== 'undefined' && Lampa.Listener) { clearInterval(_t); init(); }
    }, 200);
    setTimeout(function(){ clearInterval(_t); }, 15000);
  }

})();