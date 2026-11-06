(function(){
'use strict';
if(window.__ne_plugin)return;window.__ne_plugin=true;

var CK='ne_cache',TTL=30*60*1000,MAXS=40;
var BTN=null,LIST=[],NPREV=0,NANN=false,BUSY=false,WAIT=[],TOASTT=null;

var TR={
  uk:{title:'Нові серії',one:'НОВА СЕРІЯ',many:'НОВІ СЕРІЇ',t1:'Вийшла нова серія: ',tn:'Вийшли нові серії у серіалах: ',none:'Нових серій немає',nohist:'В історії ще немає серіалів',check:'Перевіряю серіали…'},
  ru:{title:'Новые серии',one:'НОВАЯ СЕРИЯ',many:'НОВЫЕ СЕРИИ',t1:'Вышла новая серия: ',tn:'Вышли новые серии в сериалах: ',none:'Новых серий нет',nohist:'В истории пока нет сериалов',check:'Проверяю сериалы…'},
  en:{title:'New episodes',one:'NEW EPISODE',many:'NEW EPISODES',t1:'New episode: ',tn:'New episodes in series: ',none:'No new episodes',nohist:'No series in history yet',check:'Checking series…'}
};
function lang(){var l='uk';try{l=Lampa.Storage.get('language','uk')||'uk'}catch(e){}return TR[l]?l:(l==='be'?'ru':'en')}
function T(k){return TR[lang()][k]}

/* ---------- кеш відповідей TMDB ---------- */
function loadCache(){try{return JSON.parse(localStorage.getItem(CK))||{}}catch(e){return{}}}
function saveCache(c){try{localStorage.setItem(CK,JSON.stringify(c))}catch(e){}}

/* ---------- серіали з історії Lampa ---------- */
function isTV(c){return !!(c&&c.id&&(c.name||c.original_name||c.first_air_date||c.number_of_seasons))}
function histTV(){var h=[];try{h=Lampa.Favorite.get({type:'history'})||[]}catch(e){}return h.filter(isTV).slice(0,MAXS)}

/* ---------- запит до TMDB: останні вийшлі серії та кількість серій у сезонах ---------- */
function fetchInfo(card,cb){
  var url;
  try{url=Lampa.TMDB.api('tv/'+card.id+'?api_key='+Lampa.TMDB.key()+'&language='+(lang()==='uk'?'uk':lang()))}catch(e){return cb(null)}
  function ok(j){
    if(!j||!j.last_episode_to_air)return cb(null);
    var S=(j.seasons||[]).filter(function(s){return s.season_number>0}).map(function(s){return{n:s.season_number,c:s.episode_count||0}});
    cb({ts:Date.now(),last:{s:j.last_episode_to_air.season_number,e:j.last_episode_to_air.episode_number},seasons:S});
  }
  try{var net=new Lampa.Reguest();net.silent(url,ok,function(){cb(null)})}
  catch(e){fetch(url).then(function(r){return r.json()}).then(ok).catch(function(){cb(null)})}
}

/* ---------- чи дивилась ця серія (як у самій Lampa: хеш + Timeline) ---------- */
function seen(titles,s,e){
  for(var i=0;i<titles.length;i++){
    var h=Lampa.Utils.hash([s,s>10?':':'',e,titles[i]].join(''));
    var v=Lampa.Timeline.view(h);
    if(v&&(v.percent>0||v.time>0))return true;
  }
  return false;
}
/* нове = вийшло після останньої серії, яку ти починав(ла) дивитись */
function calc(card,info){
  var titles=[],S=info.seasons.slice().sort(function(a,b){return a.n-b.n}),L=info.last,ws=0,we=0,i,e,n=0,next;
  [card.original_title,card.original_name,card.name,card.title].forEach(function(t){if(t&&titles.indexOf(t)<0)titles.push(t)});
  for(i=S.length-1;i>=0&&!ws;i--){
    var s=S[i];if(s.n>L.s)continue;
    var top=s.n===L.s?L.e:s.c;
    for(e=top;e>=1;e--)if(seen(titles,s.n,e)){ws=s.n;we=e;break}
  }
  if(!ws)return null;
  if(ws===L.s&&we>=L.e)return null;
  S.forEach(function(s){
    if(s.n<ws||s.n>L.s)return;
    var from=s.n===ws?we:0,to=s.n===L.s?L.e:s.c;
    if(to>from)n+=to-from;
  });
  if(n<1)return null;
  var cs=0;S.forEach(function(s){if(s.n===ws)cs=s.c});
  if(ws===L.s||we<cs)next={s:ws,e:we+1};
  else{next={s:L.s,e:1};for(i=0;i<S.length;i++)if(S[i].n>ws){next={s:S[i].n,e:1};break}}
  return{n:n,next:next,last:L};
}

function recompute(){
  var c=loadCache(),out=[];
  try{histTV().forEach(function(card){var i=c[card.id];if(!i)return;var r=calc(card,i);if(r)out.push({card:card,r:r})})}catch(e){}
  LIST=out;updateUI();return out;
}

/* ---------- оновлення з мережі (до 3 запитів одночасно) ---------- */
function refresh(force,done){
  if(done)WAIT.push(done);
  if(BUSY)return;BUSY=true;
  var c=loadCache(),need=histTV().filter(function(x){return force||!c[x.id]||Date.now()-c[x.id].ts>TTL}),idx=0,act=0;
  function fin(){BUSY=false;saveCache(c);recompute();var w=WAIT;WAIT=[];w.forEach(function(f){try{f()}catch(e){}})}
  function pump(){
    if(idx>=need.length&&!act)return fin();
    while(act<3&&idx<need.length)(function(card){
      idx++;act++;
      fetchInfo(card,function(info){if(info)c[card.id]=info;else if(c[card.id])c[card.id].ts=Date.now();act--;pump()});
    })(need[idx]);
  }
  if(!need.length)return fin();
  pump();
}

/* ---------- кнопка «кіноплівка» у шапці + рожеве повідомлення ---------- */
var ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M7 2v20M17 2v20M3 7h4M3 12h4M3 17h4M17 7h4M17 12h4M17 17h4"/></svg>';
function toast(txt){
  var t=$('.ne-toast');if(!t.length)t=$('<div class="ne-toast"></div>').appendTo('body');
  t.text(txt).show();
  var r=BTN&&BTN[0]?BTN[0].getBoundingClientRect():{bottom:60,right:window.innerWidth-40};
  t.css({top:Math.round(r.bottom+12)+'px',right:Math.max(8,Math.round(window.innerWidth-r.right-8))+'px'});
  clearTimeout(TOASTT);TOASTT=setTimeout(function(){t.hide()},7000);
}
function updateUI(){
  var n=LIST.length;
  if(BTN){BTN.find('.ne-count').text(n).css('display',n?'block':'none');BTN.toggleClass('has',!!n)}
  var busy=false;try{busy=Lampa.Player&&Lampa.Player.opened&&Lampa.Player.opened()}catch(e){}
  if(n>0&&(n>NPREV||!NANN)&&BTN&&!busy){
    NANN=true;
    toast(n===1?T('t1')+(LIST[0].card.name||LIST[0].card.title||''):T('tn')+n);
  }
  NPREV=n;
}
function addButton(){
  if(BTN&&$.contains(document.documentElement,BTN[0]))return true;
  var bar=$('.head__actions');if(!bar.length)return false;
  BTN=$('<div class="head__action selector ne-btn" title="'+T('title')+'">'+ICON+'<div class="ne-count"></div></div>');
  var anchor=bar.find('.notice--icon,.open--notice').first();
  if(!anchor.length)anchor=bar.find('.open--settings').first();
  if(anchor.length)anchor.before(BTN);else bar.append(BTN);
  var lock=0;
  BTN.on('hover:enter click',function(){if(Date.now()-lock<400)return;lock=Date.now();openPage()});
  return true;
}
function openPage(){
  try{var a=Lampa.Activity.active();if(a&&a.component==='ne_page'){return}}catch(e){}
  Lampa.Activity.push({url:'',title:T('title'),component:'ne_page',page:1});
}

/* ---------- сторінка «Нові серії» ---------- */
function Page(object){
  var scroll=new Lampa.Scroll({mask:true,over:true,step:250}),html=$('<div></div>'),body=$('<div class="category-full"></div>'),last,self=this;
  function build(){
    body.empty();
    var list=recompute();
    if(!list.length){
      var tv=histTV().length;
      body.append($('<div class="selector ne-empty">'+(tv?T('none'):T('nohist'))+'</div>'));
    }
    list.forEach(function(it){
      var card=new Lampa.Card(it.card,{card_category:true});card.create();
      var el=card.render(),v=el.find('.card__view');
      v.append('<div class="ne-badge">'+(it.r.n===1?T('one'):T('many'))+'</div>');
      v.append('<div class="ne-ep">S'+it.r.next.s+' E'+it.r.next.e+(it.r.n>1?' +'+(it.r.n-1):'')+'</div>');
      el.on('hover:focus',function(e){last=e.target;scroll.update($(e.target),true)});
      el.on('hover:enter',function(){
        Lampa.Activity.push({url:'',component:'full',id:it.card.id,method:'tv',card:it.card,source:it.card.source||'tmdb'});
      });
      body.append(el);
    });
    self.activity.loader(false);self.activity.toggle();
  }
  this.create=function(){
    self.activity.loader(true);
    if(scroll.minus)scroll.minus();
    scroll.append(body);html.append(scroll.render());
    refresh(false,build);
    return this.render();
  };
  this.start=function(){
    if(Lampa.Activity.active().activity!==self.activity)return;
    Lampa.Controller.add('ne_page',{
      toggle:function(){Lampa.Controller.collectionSet(scroll.render());Lampa.Controller.collectionFocus(last||false,scroll.render())},
      left:function(){if(Lampa.Navigator.canmove('left'))Lampa.Navigator.move('left');else Lampa.Controller.toggle('menu')},
      right:function(){Lampa.Navigator.move('right')},
      up:function(){if(Lampa.Navigator.canmove('up'))Lampa.Navigator.move('up');else Lampa.Controller.toggle('head')},
      down:function(){if(Lampa.Navigator.canmove('down'))Lampa.Navigator.move('down')},
      back:function(){Lampa.Activity.backward()}
    });
    Lampa.Controller.toggle('ne_page');
  };
  this.pause=function(){};this.stop=function(){};
  this.render=function(){return html};
  this.destroy=function(){scroll.destroy();html.remove();body.remove()};
}

var CSS=''
+'.ne-btn{position:relative}'
+'.ne-btn svg,.ne-btn svg *{fill:none!important;stroke:currentColor}'
+'.ne-btn.has svg{color:#ff3d5a;filter:drop-shadow(0 0 .45em rgba(255,61,90,.95))}'
+'.ne-count{display:none;position:absolute;right:-.2em;top:-.2em;min-width:1.5em;height:1.5em;padding:0 .35em;box-sizing:border-box;border-radius:.75em;background:#ff3d5a;color:#fff;font-size:.8em;font-weight:800;line-height:1.5em;text-align:center;box-shadow:0 0 .8em rgba(255,61,90,.7)}'
+'.ne-toast{display:none;position:fixed;z-index:99999;white-space:nowrap;padding:.6em 1.1em;border-radius:.7em;background:#ff3d5a;color:#fff;font-size:1.35em;font-weight:800;box-shadow:0 0 1.6em rgba(255,61,90,.85),0 0 0 .1em rgba(255,255,255,.35)}'
+'.ne-badge{position:absolute;right:.4em;top:.4em;z-index:3;padding:.2em .6em;border-radius:.35em;background:#ff3d5a;color:#fff;font-size:1em;font-weight:800;letter-spacing:.03em;box-shadow:0 0 1em rgba(255,61,90,.6)}'
+'.ne-ep{position:absolute;left:.4em;bottom:.4em;z-index:3;padding:.15em .55em;border-radius:.35em;background:rgba(0,0,0,.7);color:#fff;font-size:1em;font-weight:700}'
+'.ne-empty{padding:1.2em 1.5em;font-size:1.5em;opacity:.7}';

function start(){
  $('<style></style>').text(CSS).appendTo('head');
  Lampa.Component.add('ne_page',Page);
  var tries=0,iv=setInterval(function(){
    if(addButton()||++tries>60){clearInterval(iv);if(BTN){updateUI();refresh(false)}}
  },500);
  setInterval(function(){addButton();refresh(false)},10*60*1000);
  setInterval(recompute,60*1000);
  try{Lampa.Player.listener.follow('destroy',function(){setTimeout(recompute,800)})}catch(e){}
}
var w=setInterval(function(){
  if(window.Lampa&&Lampa.Listener&&window.$&&Lampa.Component){
    clearInterval(w);
    if(window.appready)start();
    else Lampa.Listener.follow('app',function(e){if(e.type==='ready')start()});
  }
},200);
})();
