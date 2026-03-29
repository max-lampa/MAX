(function () {

    var STORE = 'lmpc_cfg';

    var DEF = {
        style: 'bubble', theme: 'orange', size: 'normal',
        radius: 'medium', glow: 'medium',
        secs: false, h12: false, blink: true
    };

    var SIZE_MAP   = { small: 1.8, normal: 2.5, large: 3.5, xlarge: 4.5 };
    var RADIUS_MAP = { none: 4, small: 8, medium: 14, large: 22, full: 30 };
    var GLOW_MAP   = { off: 0, low: 0.3, medium: 0.6, high: 1.0 };

    var THEMES = {
        orange: { h:'#ffffff', m:'#ff9100', s:'#ffb84d', g:'#ff9100' },
        blue:   { h:'#ffffff', m:'#4a9eff', s:'#7dc3ff', g:'#4a9eff' },
        green:  { h:'#ffffff', m:'#00e676', s:'#69f0ae', g:'#00e676' },
        purple: { h:'#ffffff', m:'#ce93d8', s:'#e040fb', g:'#ce93d8' },
        red:    { h:'#ffffff', m:'#ff5252', s:'#ff8a80', g:'#ff5252' },
        white:  { h:'#ffffff', m:'#e0e0e0', s:'#bdbdbd', g:'#e0e0e0' }
    };

    function p2(n) { return (n < 10 ? '0' : '') + n; }
    function ext(a, b) {
        var r = {}, k;
        for (k in a) { if (a.hasOwnProperty(k)) r[k] = a[k]; }
        for (k in b) { if (b.hasOwnProperty(k)) r[k] = b[k]; }
        return r;
    }
    function hexA(v) {
        var n = Math.round(Math.max(0, Math.min(1, v)) * 255);
        return (n < 16 ? '0' : '') + n.toString(16);
    }

    function load() {
        try { var r = localStorage.getItem(STORE); return r ? ext(DEF, JSON.parse(r)) : ext(DEF, {}); }
        catch (e) { return ext(DEF, {}); }
    }
    function save(c) { try { localStorage.setItem(STORE, JSON.stringify(c)); } catch (e) {} }

    var C = load();
    var _tick = null, _blink = null;

    function buildCSS() {
        var t  = THEMES[C.theme] || THEMES.orange;
        var sz = SIZE_MAP[C.size] || 2.5;
        var rd = RADIUS_MAP[C.radius] || 14;
        var gl = GLOW_MAP[C.glow] || 0.6;
        var gc = t.g + hexA(gl);
        var gr = Math.round(16 * gl);
        var bg = C.style==='minimal' ? 'transparent' : C.style==='flat' ? '#1e2038' : '#16182a';
        var br = C.style==='bubble' ? rd+'px' : C.style==='neon' ? Math.round(rd/2)+'px' : C.style==='flat' ? '6px' : '2px';
        var brd = C.style==='neon' ? 'border:1.5px solid '+t.m+';' : C.style==='bubble' ? 'border:1px solid rgba(255,255,255,0.09);' : '';
        var bsh = (C.style==='bubble'||C.style==='neon') && gl>0 ? 'box-shadow:0 0 '+gr+'px '+gc+';' : '';
        var tsh = (C.style==='bubble'||C.style==='neon') && gl>0 ? 'text-shadow:0 0 10px '+gc+';' : '';
        return '#lmpc{display:flex;align-items:center;gap:6px;font-family:"Courier New",Courier,monospace;font-weight:700;font-size:'+sz+'em;white-space:nowrap;}'+
               '#lmpc .d{display:inline-flex;align-items:center;justify-content:center;background:'+bg+';border-radius:'+br+';padding:0.1em 0.22em;'+brd+bsh+'}'+
               '#lmpc .ch{color:'+t.h+';'+tsh+'}'+
               '#lmpc .cm{color:'+t.m+';'+tsh+'}'+
               '#lmpc .cs{color:'+t.s+';font-size:.75em;'+tsh+'}'+
               '#lmpc .sp{color:'+t.m+';margin:0 1px;opacity:1;transition:opacity .4s;'+tsh+'}';
    }

    function injectCSS() {
        var el = document.getElementById('lmpc-css');
        if (!el) { el = document.createElement('style'); el.id='lmpc-css'; document.head.appendChild(el); }
        el.textContent = buildCSS();
    }

    function makeClock() {
        var old = document.querySelector('.head__time');
        if (!old || document.getElementById('lmpc')) return;
        injectCSS();
        var w = document.createElement('div');
        w.id = 'lmpc';
        w.innerHTML =
            '<span class="d ch" id="lmpc-h">00</span>'+
            '<span class="sp" id="lmpc-s1">:</span>'+
            '<span class="d cm" id="lmpc-m">00</span>'+
            '<span class="sp" id="lmpc-s2" style="display:none">:</span>'+
            '<span class="d cs" id="lmpc-s" style="display:none">00</span>';
        old.parentNode.replaceChild(w, old);
        doTick();
        if (_tick) clearInterval(_tick);
        _tick = setInterval(doTick, 1000);
        startBlink();
    }

    function doTick() {
        var eH=document.getElementById('lmpc-h'), eM=document.getElementById('lmpc-m'),
            eS=document.getElementById('lmpc-s'), eS2=document.getElementById('lmpc-s2');
        if (!eH) return;
        var now=new Date(), h=now.getHours(), m=now.getMinutes(), s=now.getSeconds();
        if (C.h12) h = (h%12)||12;
        eH.textContent=p2(h); eM.textContent=p2(m);
        if (C.secs) { eS.style.display='inline-flex'; eS2.style.display='inline'; eS.textContent=p2(s); }
        else { eS.style.display='none'; eS2.style.display='none'; }
    }

    function startBlink() {
        if (_blink) clearInterval(_blink);
        var on = true;
        _blink = setInterval(function () {
            var s1=document.getElementById('lmpc-s1'), s2=document.getElementById('lmpc-s2');
            if (!s1) return;
            if (!C.blink) { s1.style.opacity='1'; if(s2) s2.style.opacity='1'; return; }
            on=!on; var op=on?'1':'0.15';
            s1.style.opacity=op; if(s2) s2.style.opacity=op;
        }, 500);
    }

    function apply(upd) { C=ext(C,upd); save(C); injectCSS(); doTick(); }

    function registerSettings() {
        if (typeof Lampa==='undefined' || !Lampa.SettingsApi || typeof Lampa.SettingsApi.addParam!=='function') return;

        Lampa.SettingsApi.addParam({ field:'lmpc_title',
            params:{ name:'Настройки часов', type:'title' },
            onChange:function(){}, onRender:function(){} });

        Lampa.SettingsApi.addParam({ field:'lmpc_style',
            params:{ name:'Стиль часов', type:'select',
                values:{ bubble:'Bubble (пузырь)', flat:'Flat (плоский)', neon:'Neon (неон)', minimal:'Minimal' },
                'default': DEF.style },
            onChange:function(f,v){ apply({style:v}); },
            onRender:function(f,p){ p.value=C.style; } });

        Lampa.SettingsApi.addParam({ field:'lmpc_theme',
            params:{ name:'Цвет часов', type:'select',
                values:{ orange:'Оранжевый', blue:'Синий', green:'Зелёный', purple:'Фиолетовый', red:'Красный', white:'Белый' },
                'default': DEF.theme },
            onChange:function(f,v){ apply({theme:v}); },
            onRender:function(f,p){ p.value=C.theme; } });

        Lampa.SettingsApi.addParam({ field:'lmpc_size',
            params:{ name:'Размер', type:'select',
                values:{ small:'Маленький', normal:'Нормальный', large:'Большой', xlarge:'Очень большой' },
                'default': DEF.size },
            onChange:function(f,v){ apply({size:v}); },
            onRender:function(f,p){ p.value=C.size; } });

        Lampa.SettingsApi.addParam({ field:'lmpc_radius',
            params:{ name:'Скругление (bubble)', type:'select',
                values:{ none:'Нет', small:'Маленькое', medium:'Среднее', large:'Большое', full:'Максимальное' },
                'default': DEF.radius },
            onChange:function(f,v){ apply({radius:v}); },
            onRender:function(f,p){ p.value=C.radius; } });

        Lampa.SettingsApi.addParam({ field:'lmpc_glow',
            params:{ name:'Свечение', type:'select',
                values:{ off:'Выкл', low:'Слабое', medium:'Среднее', high:'Сильное' },
                'default': DEF.glow },
            onChange:function(f,v){ apply({glow:v}); },
            onRender:function(f,p){ p.value=C.glow; } });

        Lampa.SettingsApi.addParam({ field:'lmpc_secs',
            params:{ name:'Показывать секунды', type:'toggle', 'default': DEF.secs },
            onChange:function(f,v){ apply({secs:v}); },
            onRender:function(f,p){ p.value=C.secs; } });

        Lampa.SettingsApi.addParam({ field:'lmpc_h12',
            params:{ name:'12-часовой формат', type:'toggle', 'default': DEF.h12 },
            onChange:function(f,v){ apply({h12:v}); },
            onRender:function(f,p){ p.value=C.h12; } });

        Lampa.SettingsApi.addParam({ field:'lmpc_blink',
            params:{ name:'Мигающее двоеточие', type:'toggle', 'default': DEF.blink },
            onChange:function(f,v){ apply({blink:v}); },
            onRender:function(f,p){ p.value=C.blink; } });
    }

    function init() { makeClock(); registerSettings(); }

    if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) { if (e.type==='ready') setTimeout(init, 800); });
    } else {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 2000); });
    }

})();