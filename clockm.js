(function () {

    var STORE = 'lmpc_cfg';

    var DEF = {
        style:  'bubble',
        theme:  'orange',
        size:   'normal',
        radius: 'medium',
        glow:   'medium',
        secs:   false,
        h12:    false,
        blink:  true
    };

    var SIZE_MAP   = { small: 1.8, normal: 2.5, large: 3.5, xlarge: 4.5 };
    var RADIUS_MAP = { none: 4, small: 8, medium: 14, large: 22, full: 30 };
    var GLOW_MAP   = { off: 0, low: 0.3, medium: 0.6, high: 1.0 };

    var THEMES = {
        orange: { h: '#ffffff', m: '#ff9100', s: '#ffb84d', g: '#ff9100' },
        blue:   { h: '#ffffff', m: '#4a9eff', s: '#7dc3ff', g: '#4a9eff' },
        green:  { h: '#ffffff', m: '#00e676', s: '#69f0ae', g: '#00e676' },
        purple: { h: '#ffffff', m: '#ce93d8', s: '#e040fb', g: '#ce93d8' },
        red:    { h: '#ffffff', m: '#ff5252', s: '#ff8a80', g: '#ff5252' },
        white:  { h: '#ffffff', m: '#e0e0e0', s: '#bdbdbd', g: '#e0e0e0' }
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
        try {
            var r = localStorage.getItem(STORE);
            return r ? ext(DEF, JSON.parse(r)) : ext(DEF, {});
        } catch (e) { return ext(DEF, {}); }
    }

    function save(c) {
        try { localStorage.setItem(STORE, JSON.stringify(c)); } catch (e) {}
    }

    var C = load();
    var _tick = null;
    var _blink = null;

    function buildCSS() {
        var t  = THEMES[C.theme] || THEMES.orange;
        var sz = SIZE_MAP[C.size] || 2.5;
        var rd = RADIUS_MAP[C.radius] || 14;
        var gl = GLOW_MAP[C.glow] || 0;
        var gc = t.g + hexA(gl);
        var gr = Math.round(16 * gl);

        var bg  = C.style === 'minimal' ? 'transparent'
                : C.style === 'flat'    ? '#1e2038'
                : '#16182a';

        var br  = C.style === 'bubble' ? rd + 'px'
                : C.style === 'neon'   ? Math.round(rd / 2) + 'px'
                : C.style === 'flat'   ? '6px'
                : '2px';

        var brd = C.style === 'neon'   ? 'border:1.5px solid ' + t.m + ';'
                : C.style === 'bubble' ? 'border:1px solid rgba(255,255,255,0.09);'
                : '';

        var bsh = (C.style === 'bubble' || C.style === 'neon') && gl > 0
                ? 'box-shadow:0 0 ' + gr + 'px ' + gc + ';' : '';

        var tsh = (C.style === 'bubble' || C.style === 'neon') && gl > 0
                ? 'text-shadow:0 0 10px ' + gc + ';' : '';

        return [
            '#lmpc{display:flex;align-items:center;gap:6px;font-family:"Courier New",Courier,monospace;font-weight:700;font-size:' + sz + 'em;white-space:nowrap;}',
            '#lmpc .d{display:inline-flex;align-items:center;justify-content:center;background:' + bg + ';border-radius:' + br + ';padding:0.1em 0.22em;' + brd + bsh + '}',
            '#lmpc .ch{color:' + t.h + ';' + tsh + '}',
            '#lmpc .cm{color:' + t.m + ';' + tsh + '}',
            '#lmpc .cs{color:' + t.s + ';font-size:.75em;' + tsh + '}',
            '#lmpc .sp{color:' + t.m + ';margin:0 1px;opacity:1;transition:opacity .4s;' + tsh + '}'
        ].join('');
    }

    function injectCSS() {
        var el = document.getElementById('lmpc-css');
        if (!el) {
            el = document.createElement('style');
            el.id = 'lmpc-css';
            document.head.appendChild(el);
        }
        el.textContent = buildCSS();
    }

    function makeClock() {
        var old = document.querySelector('.head__time');
        if (!old || document.getElementById('lmpc')) return;

        injectCSS();

        var w = document.createElement('div');
        w.id = 'lmpc';
        w.innerHTML =
            '<span class="d ch" id="lmpc-h">00</span>' +
            '<span class="sp" id="lmpc-s1">:</span>' +
            '<span class="d cm" id="lmpc-m">00</span>' +
            '<span class="sp" id="lmpc-s2" style="display:none">:</span>' +
            '<span class="d cs" id="lmpc-s"  style="display:none">00</span>';

        old.parentNode.replaceChild(w, old);

        doTick();
        if (_tick) clearInterval(_tick);
        _tick = setInterval(doTick, 1000);
        startBlink();
    }

    function doTick() {
        var eH  = document.getElementById('lmpc-h');
        var eM  = document.getElementById('lmpc-m');
        var eS  = document.getElementById('lmpc-s');
        var eS2 = document.getElementById('lmpc-s2');
        if (!eH) return;

        var now = new Date();
        var h = now.getHours();
        var m = now.getMinutes();
        var s = now.getSeconds();
        if (C.h12) h = (h % 12) || 12;

        eH.textContent = p2(h);
        eM.textContent = p2(m);

        if (C.secs) {
            eS.style.display  = 'inline-flex';
            eS2.style.display = 'inline';
            eS.textContent    = p2(s);
        } else {
            eS.style.display  = 'none';
            eS2.style.display = 'none';
        }
    }

    function startBlink() {
        if (_blink) clearInterval(_blink);
        var on = true;
        _blink = setInterval(function () {
            var s1 = document.getElementById('lmpc-s1');
            var s2 = document.getElementById('lmpc-s2');
            if (!s1) return;
            if (!C.blink) {
                s1.style.opacity = '1';
                if (s2) s2.style.opacity = '1';
                return;
            }
            on = !on;
            var op = on ? '1' : '0.15';
            s1.style.opacity = op;
            if (s2) s2.style.opacity = op;
        }, 500);
    }

    function apply(upd) {
        C = ext(C, upd);
        save(C);
        injectCSS();
        doTick();
    }

    /* === Метод 1: Lampa.SettingsApi (нативные пункты, пульт работает) === */

    function registerViaSettingsApi() {
        var api = Lampa.SettingsApi;
        if (!api || typeof api.addParam !== 'function') return false;

        var items = [
            {
                field: 'lmpc_style',
                params: { name: 'Часы — стиль', type: 'select',
                    values: { bubble: 'Bubble', flat: 'Flat', neon: 'Neon', minimal: 'Minimal' },
                    'default': DEF.style },
                onChange: function (f, v) { apply({ style: v }); },
                onRender: function (f, p) { p.value = C.style; }
            },
            {
                field: 'lmpc_theme',
                params: { name: 'Часы — цвет', type: 'select',
                    values: { orange: 'Оранжевый', blue: 'Синий', green: 'Зелёный',
                              purple: 'Фиолетовый', red: 'Красный', white: 'Белый' },
                    'default': DEF.theme },
                onChange: function (f, v) { apply({ theme: v }); },
                onRender: function (f, p) { p.value = C.theme; }
            },
            {
                field: 'lmpc_size',
                params: { name: 'Часы — размер', type: 'select',
                    values: { small: 'Маленький', normal: 'Нормальный',
                              large: 'Большой', xlarge: 'Очень большой' },
                    'default': DEF.size },
                onChange: function (f, v) { apply({ size: v }); },
                onRender: function (f, p) { p.value = C.size; }
            },
            {
                field: 'lmpc_radius',
                params: { name: 'Часы — скругление', type: 'select',
                    values: { none: 'Нет', small: 'Маленькое', medium: 'Среднее',
                              large: 'Большое', full: 'Макс' },
                    'default': DEF.radius },
                onChange: function (f, v) { apply({ radius: v }); },
                onRender: function (f, p) { p.value = C.radius; }
            },
            {
                field: 'lmpc_glow',
                params: { name: 'Часы — свечение', type: 'select',
                    values: { off: 'Выкл', low: 'Слабое', medium: 'Среднее', high: 'Сильное' },
                    'default': DEF.glow },
                onChange: function (f, v) { apply({ glow: v }); },
                onRender: function (f, p) { p.value = C.glow; }
            },
            {
                field: 'lmpc_secs',
                params: { name: 'Часы — секунды', type: 'toggle', 'default': DEF.secs },
                onChange: function (f, v) { apply({ secs: !!v }); },
                onRender: function (f, p) { p.value = C.secs; }
            },
            {
                field: 'lmpc_h12',
                params: { name: 'Часы — 12-часовой формат', type: 'toggle', 'default': DEF.h12 },
                onChange: function (f, v) { apply({ h12: !!v }); },
                onRender: function (f, p) { p.value = C.h12; }
            },
            {
                field: 'lmpc_blink',
                params: { name: 'Часы — мигающее двоеточие', type: 'toggle', 'default': DEF.blink },
                onChange: function (f, v) { apply({ blink: !!v }); },
                onRender: function (f, p) { p.value = C.blink; }
            }
        ];

        for (var i = 0; i < items.length; i++) {
            try { api.addParam(items[i]); } catch (e) {}
        }

        return true;
    }

    /* === Метод 2: Lampa.Settings.listener (встроено в Lampa) === */

    function registerViaSettings() {
        if (!Lampa.Settings || typeof Lampa.Settings.listener !== 'object') return;

        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name !== 'main' && e.name !== 'interface') return;

            var body = e.body || e.scroll;
            if (!body) return;

            var btn = document.createElement('div');
            btn.className = 'settings-folder selector';
            btn.style.cssText = 'cursor:pointer;padding:14px 20px;display:flex;align-items:center;gap:14px;';
            btn.innerHTML =
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>' +
                '<div>' +
                '<div style="font-size:15px;">Настройки часов</div>' +
                '<div style="font-size:12px;opacity:.6;">Стиль, цвет, размер, свечение</div>' +
                '</div>';

            btn.onclick = function () { openFallbackPanel(); };

            try {
                if (typeof body.append === 'function') body.append(btn);
                else if (body.appendChild) body.appendChild(btn);
            } catch (e) {}
        });
    }

    /* === Запасная панель настроек === */

    function openFallbackPanel() {
        if (document.getElementById('lmpc-ov')) return;

        var ov = document.createElement('div');
        ov.id = 'lmpc-ov';
        ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99998;background:rgba(0,0,0,.75);';
        document.body.appendChild(ov);

        var pn = document.createElement('div');
        pn.style.cssText =
            'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;' +
            'background:#0c0d18;border:1px solid rgba(255,255,255,0.13);border-radius:18px;' +
            'padding:26px 24px;width:420px;max-width:95vw;max-height:90vh;overflow-y:auto;' +
            'box-shadow:0 12px 60px rgba(0,0,0,.95);font-family:Segoe UI,Roboto,Arial,sans-serif;' +
            'color:#fff;box-sizing:border-box;';

        function row(lbl, ctrl) {
            return '<div style="display:flex;align-items:center;justify-content:space-between;' +
                'padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);">' +
                '<span style="font-size:14px;color:#ccc;">' + lbl + '</span>' +
                '<span style="display:flex;align-items:center;gap:8px;">' + ctrl + '</span></div>';
        }

        function sel(id, pairs, cur) {
            var h = '<select id="' + id + '" style="background:#1a1c30;color:#fff;' +
                'border:1px solid rgba(255,255,255,0.15);border-radius:7px;padding:6px 10px;font-size:13px;">';
            for (var i = 0; i < pairs.length; i++) {
                h += '<option value="' + pairs[i][0] + '"' +
                    (pairs[i][0] === cur ? ' selected' : '') + '>' + pairs[i][1] + '</option>';
            }
            return h + '</select>';
        }

        function chk(id, cur) {
            return '<input type="checkbox" id="' + id + '"' + (cur ? ' checked' : '') +
                ' style="width:20px;height:20px;accent-color:#ff9100;cursor:pointer;">';
        }

        pn.innerHTML =
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
            '<span style="font-size:18px;font-weight:700;">&#9200;&nbsp;Настройки часов</span>' +
            '<button id="lmpc-cls" style="background:none;border:none;color:#777;font-size:28px;cursor:pointer;line-height:1;padding:0;">&times;</button></div>' +
            row('Стиль',    sel('p-st',[['bubble','Bubble'],['flat','Flat'],['neon','Neon'],['minimal','Minimal']], C.style)) +
            row('Цвет',     sel('p-th',[['orange','Оранжевый'],['blue','Синий'],['green','Зелёный'],['purple','Фиолетовый'],['red','Красный'],['white','Белый']], C.theme)) +
            row('Размер',   sel('p-sz',[['small','Маленький'],['normal','Нормальный'],['large','Большой'],['xlarge','Очень большой']], C.size)) +
            row('Скругление', sel('p-rd',[['none','Нет'],['small','Маленькое'],['medium','Среднее'],['large','Большое'],['full','Макс']], C.radius)) +
            row('Свечение', sel('p-gl',[['off','Выкл'],['low','Слабое'],['medium','Среднее'],['high','Сильное']], C.glow)) +
            row('Секунды',  chk('p-sc', C.secs)) +
            row('12-часовой формат', chk('p-12', C.h12)) +
            row('Мигающее двоеточие', chk('p-bl', C.blink)) +
            '<div style="display:flex;gap:10px;margin-top:20px;">' +
            '<button id="lmpc-ok" style="flex:1;background:#ff9100;color:#000;border:none;border-radius:9px;padding:12px;font-size:15px;font-weight:700;cursor:pointer;">Применить</button>' +
            '<button id="lmpc-rs" style="background:#1a1c30;color:#aaa;border:1px solid rgba(255,255,255,0.12);border-radius:9px;padding:12px 18px;font-size:13px;cursor:pointer;">Сброс</button>' +
            '</div>';

        document.body.appendChild(pn);

        function close() {
            if (ov.parentNode) ov.parentNode.removeChild(ov);
            if (pn.parentNode) pn.parentNode.removeChild(pn);
        }

        ov.onclick = close;
        document.getElementById('lmpc-cls').onclick = close;

        document.getElementById('lmpc-ok').onclick = function () {
            apply({
                style:  document.getElementById('p-st').value,
                theme:  document.getElementById('p-th').value,
                size:   document.getElementById('p-sz').value,
                radius: document.getElementById('p-rd').value,
                glow:   document.getElementById('p-gl').value,
                secs:   document.getElementById('p-sc').checked,
                h12:    document.getElementById('p-12').checked,
                blink:  document.getElementById('p-bl').checked
            });
            close();
        };

        document.getElementById('lmpc-rs').onclick = function () {
            C = ext(DEF, {});
            save(C);
            injectCSS();
            doTick();
            close();
        };
    }

    /* === Запуск === */

    function registerSettings() {
        if (typeof Lampa === 'undefined') return;
        try {
            var ok = registerViaSettingsApi();
            if (!ok) registerViaSettings();
        } catch (e) {
            try { registerViaSettings(); } catch (e2) {}
        }
    }

    function init() {
        makeClock();
        registerSettings();
    }

    if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') setTimeout(init, 800);
        });
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(init, 2000);
        });
    }

})();