(function () {
    'use strict';

    /* в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
       Filmix РїР»Р°РіРёРЅ РґР»СЏ Lampa
       РђРІС‚РѕСЂРёР·Р°С†РёСЏ РїРѕ Р»РѕРіРёРЅСѓ Рё РїР°СЂРѕР»СЋ (РЅРµ С‚РѕРєРµРЅСѓ)
    в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */

    var PLUGIN_KEY  = 'filmix';
    var PLUGIN_TITLE = 'Filmix';
    var API_URL     = 'https://filmix.ac';

    /* в”Ђв”Ђ РЈС‚РёР»РёС‚С‹ С…СЂР°РЅРёР»РёС‰Р° в”Ђв”Ђ */
    function s(key, val) {
        if (val === undefined) return Lampa.Storage.get(PLUGIN_KEY + '_' + key, '');
        Lampa.Storage.set(PLUGIN_KEY + '_' + key, val);
    }

    /* в”Ђв”Ђ РЎРµС‚РµРІРѕР№ Р·Р°РїСЂРѕСЃ (СЃС‚Р°РЅРґР°СЂС‚РЅС‹Р№ fetch) в”Ђв”Ђ */
    function api(path, body, ok, err) {
        var token   = s('token');
        var headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        var opts = { method: body ? 'POST' : 'GET', headers: headers };
        if (body) {
            opts.body = Object.keys(body)
                .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(body[k]); })
                .join('&');
        }

        fetch(API_URL + path, opts)
            .then(function (r) { return r.json(); })
            .then(function (json) {
                if (json && json.error) throw new Error(json.error.message || 'РћС€РёР±РєР° Filmix');
                ok(json);
            })
            .catch(function (e) { (err || function () {})(e.message || String(e)); });
    }

    /* в”Ђв”Ђ РђРІС‚РѕСЂРёР·Р°С†РёСЏ в”Ђв”Ђ */
    function authorize(login, password, ok, err) {
        if (!login || !password) { (err || function () {})('Р’РІРµРґРёС‚Рµ Р»РѕРіРёРЅ Рё РїР°СЂРѕР»СЊ'); return; }
        api(
            '/api/oauth/token',
            { grant_type: 'password', username: login, password: password, client_id: 'lampa' },
            function (data) {
                if (!data.access_token) { (err || function () {})('РўРѕРєРµРЅ РЅРµ РїРѕР»СѓС‡РµРЅ'); return; }
                s('token',         data.access_token);
                s('refresh_token', data.refresh_token || '');
                s('login',    login);
                s('password', password);
                (ok || function () {})(data);
            },
            err
        );
    }

    function logout() {
        s('token', ''); s('refresh_token', '');
        Lampa.Noty.show(PLUGIN_TITLE + ': РІС‹ РІС‹С€Р»Рё РёР· Р°РєРєР°СѓРЅС‚Р°');
        Lampa.Storage.set(PLUGIN_KEY + '_status_text', 'РќРµ Р°РІС‚РѕСЂРёР·РѕРІР°РЅ');
    }

    /* в”Ђв”Ђ РђРІС‚РѕРѕР±РЅРѕРІР»РµРЅРёРµ С‚РѕРєРµРЅР° в”Ђв”Ђ */
    function restoreSession() {
        var login    = s('login');
        var password = s('password');
        if (login && password && !s('token')) {
            authorize(login, password, function () {
                Lampa.Noty.show(PLUGIN_TITLE + ': Р°РІС‚РѕСЂРёР·РѕРІР°РЅ РєР°Рє ' + login);
            }, function () {});
        }
    }

    /* в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
       РќРђРЎРўР РћР™РљР: РєРѕРјРїРѕРЅРµРЅС‚ СЃ Р»РѕРіРёРЅРѕРј / РїР°СЂРѕР»РµРј
    в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */

    /* CSS */
    var style = document.createElement('style');
    style.textContent = [
        '.fmx-wrap{padding:1em 0}',
        '.fmx-row{display:flex;align-items:center;gap:.6em;margin-bottom:.8em;flex-wrap:wrap}',
        '.fmx-row label{min-width:90px;color:rgba(255,255,255,.7);font-size:.9em}',
        '.fmx-inp{flex:1;min-width:180px;background:rgba(255,255,255,.07);color:#fff;',
        '  border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:.4em .7em;font-size:.9em}',
        '.fmx-inp:focus{outline:none;border-color:#e50914}',
        '.fmx-btn{padding:.4em 1.1em;border:none;border-radius:6px;cursor:pointer;font-size:.88em;font-weight:600}',
        '.fmx-btn-ok{background:#e50914;color:#fff}.fmx-btn-ok:hover{background:#c40812}',
        '.fmx-btn-out{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2)}',
        '.fmx-btn-out:hover{background:rgba(255,255,255,.18)}',
        '.fmx-status{font-size:.82em;color:rgba(255,255,255,.5)}'
    ].join('');
    document.head.appendChild(style);

    /* РљРѕРјРїРѕРЅРµРЅС‚-РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ РґР»СЏ РІРєР»Р°РґРєРё РЅР°СЃС‚СЂРѕРµРє */
    function FilmixSettingsPanel() {
        var login_saved  = s('login');
        var token_saved  = s('token');

        var wrap = document.createElement('div');
        wrap.className = 'fmx-wrap';
        wrap.innerHTML = [
            '<div class="fmx-row">',
            '  <label>Р›РѕРіРёРЅ</label>',
            '  <input class="fmx-inp" id="fmx_login" type="text" autocomplete="off" placeholder="Р’Р°С€ Р»РѕРіРёРЅ Filmix" value="' + Lampa.Utils.escapeHtml(login_saved) + '">',
            '</div>',
            '<div class="fmx-row">',
            '  <label>РџР°СЂРѕР»СЊ</label>',
            '  <input class="fmx-inp" id="fmx_pass"  type="password" autocomplete="off" placeholder="Р’Р°С€ РїР°СЂРѕР»СЊ Filmix">',
            '</div>',
            '<div class="fmx-row">',
            '  <button class="fmx-btn fmx-btn-ok"  id="fmx_auth_btn">Р’РѕР№С‚Рё</button>',
            '  <button class="fmx-btn fmx-btn-out" id="fmx_logout_btn">Р’С‹Р№С‚Рё</button>',
            '</div>',
            '<div class="fmx-row">',
            '  <span class="fmx-status" id="fmx_status">' +
                (token_saved ? 'вњ” РђРІС‚РѕСЂРёР·РѕРІР°РЅ: ' + Lampa.Utils.escapeHtml(login_saved) : 'вњ— РќРµ Р°РІС‚РѕСЂРёР·РѕРІР°РЅ') +
             '</span>',
            '</div>'
        ].join('');

        function $id(id) { return wrap.querySelector('#' + id); }

        $id('fmx_auth_btn').addEventListener('click', function () {
            var login = $id('fmx_login').value.trim();
            var pass  = $id('fmx_pass').value.trim();
            $id('fmx_status').textContent = 'РђРІС‚РѕСЂРёР·Р°С†РёСЏвЂ¦';
            authorize(
                login, pass,
                function () {
                    $id('fmx_status').textContent = 'вњ” РђРІС‚РѕСЂРёР·РѕРІР°РЅ: ' + login;
                    Lampa.Noty.show(PLUGIN_TITLE + ': СѓСЃРїРµС€РЅРѕ Р°РІС‚РѕСЂРёР·РѕРІР°РЅ!', { time: 3000 });
                },
                function (msg) {
                    $id('fmx_status').textContent = 'вњ— РћС€РёР±РєР°: ' + msg;
                    Lampa.Noty.show(PLUGIN_TITLE + ': ' + msg, { time: 4000 });
                }
            );
        });

        $id('fmx_logout_btn').addEventListener('click', function () {
            logout();
            $id('fmx_status').textContent = 'вњ— РќРµ Р°РІС‚РѕСЂРёР·РѕРІР°РЅ';
            $id('fmx_login').value = '';
            $id('fmx_pass').value  = '';
        });

        this.render  = function () { return $(wrap); };
        this.destroy = function () { wrap.remove(); };
    }

    /* в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
       РРЎРўРћР§РќРРљ РћРќР›РђР™Рќ: РєР°С‚Р°Р»РѕРі Рё РїРѕРёСЃРє
    в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */

    /* РњР°РїРїРёРЅРі TMDB в†’ Filmix РїРѕРёСЃРє */
    function filmixSearch(title, year, cb_ok, cb_err) {
        api(
            '/api/v2/search?q=' + encodeURIComponent(title) + (year ? '&year=' + year : '') + '&limit=5',
            null,
            function (data) { cb_ok(data.results || []); },
            cb_err
        );
    }

    /* РџРѕР»СѓС‡РµРЅРёРµ СЃСЃС‹Р»РѕРє РґР»СЏ РїР»РµРµСЂР° */
    function filmixStreams(filmixId, cb_ok, cb_err) {
        api(
            '/api/v2/movie/' + filmixId + '/streams',
            null,
            function (data) { cb_ok(data.streams || data.files || []); },
            cb_err
        );
    }

    /* в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
       РРЅС‚РµРіСЂР°С†РёСЏ РІРѕ РІРєР»Р°РґРєСѓ РћРќР›РђР™Рќ РєР°СЂС‚РѕС‡РєРё С„РёР»СЊРјР°
    в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */
    function hookFullCard() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;

            var object    = e.object;
            var component = object.activity && object.activity.component;
            if (!component || !component.addSource) return;

            component.addSource({
                id:    PLUGIN_KEY,
                title: PLUGIN_TITLE,
                active: false,
                onOpen: function () {
                    if (!s('token')) {
                        Lampa.Noty.show(PLUGIN_TITLE + ': СЃРЅР°С‡Р°Р»Р° РІРѕР№РґРёС‚Рµ РІ Р°РєРєР°СѓРЅС‚ (РќР°СЃС‚СЂРѕР№РєРё в†’ Filmix)', { time: 4000 });
                        return;
                    }
                    var card  = object.card;
                    var title = card.title || card.name || '';
                    var year  = (card.release_date || card.first_air_date || '').slice(0, 4);

                    Lampa.Noty.show(PLUGIN_TITLE + ': РїРѕРёСЃРє В«' + title + 'В»вЂ¦', { time: 2000 });

                    filmixSearch(title, year, function (results) {
                        if (!results.length) {
                            Lampa.Noty.show(PLUGIN_TITLE + ': С„РёР»СЊРј РЅРµ РЅР°Р№РґРµРЅ', { time: 3000 });
                            return;
                        }
                        var first = results[0];
                        filmixStreams(first.id, function (streams) {
                            if (!streams.length) {
                                Lampa.Noty.show(PLUGIN_TITLE + ': РЅРµС‚ РґРѕСЃС‚СѓРїРЅС‹С… РїРѕС‚РѕРєРѕРІ', { time: 3000 });
                                return;
                            }
                            /* РџРµСЂРµРґР°С‘Рј РїРµСЂРІС‹Р№ СЂР°Р±РѕС‡РёР№ РїРѕС‚РѕРє РІ РїР»РµРµСЂ Lampa */
                            var stream = streams[0];
                            Lampa.Player.play({
                                url:     stream.url || stream.link || stream,
                                title:   title,
                                poster:  card.poster_path
                                    ? 'https://image.tmdb.org/t/p/w500' + card.poster_path
                                    : ''
                            });
                        }, function (msg) {
                            Lampa.Noty.show(PLUGIN_TITLE + ': ' + msg, { time: 3000 });
                        });
                    }, function (msg) {
                        Lampa.Noty.show(PLUGIN_TITLE + ': ' + msg, { time: 3000 });
                    });
                }
            });
        });
    }

    /* в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
       Р РµРіРёСЃС‚СЂР°С†РёСЏ РїР»Р°РіРёРЅР°
    в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */
    function init() {
        if (!window.Lampa) { console.warn('[Filmix] Lampa РЅРµ РЅР°Р№РґРµРЅР°'); return; }

        /* 1. Р’РєР»Р°РґРєР° РІ РќР°СЃС‚СЂРѕР№РєР°С… */
        Lampa.SettingsApi.addComponent({
            component: PLUGIN_KEY,
            name: PLUGIN_TITLE,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>'
        });

        /* РџРѕР»Рµ Р»РѕРіРёРЅР° */
        Lampa.SettingsApi.addParam({
            component: PLUGIN_KEY,
            param: { name: 'filmix_login', type: 'input', default: s('login') },
            field: { name: 'Р›РѕРіРёРЅ' },
            onChange: function (v) { s('login', v); }
        });

        /* РџРѕР»Рµ РїР°СЂРѕР»СЏ */
        Lampa.SettingsApi.addParam({
            component: PLUGIN_KEY,
            param: { name: 'filmix_password', type: 'input', default: '' },
            field: { name: 'РџР°СЂРѕР»СЊ' },
            onChange: function (v) { s('password', v); }
        });

        /* РљРЅРѕРїРєР°-РґРµР№СЃС‚РІРёРµ С‡РµСЂРµР· select */
        Lampa.SettingsApi.addParam({
            component: PLUGIN_KEY,
            param: {
                name:   'filmix_action',
                type:   'select',
                values: { login: 'Р’РѕР№С‚Рё РІ Р°РєРєР°СѓРЅС‚', logout: 'Р’С‹Р№С‚Рё РёР· Р°РєРєР°СѓРЅС‚Р°' },
                default: 'login'
            },
            field: { name: 'Р”РµР№СЃС‚РІРёРµ' },
            onChange: function (value) {
                if (value === 'login') {
                    var login    = Lampa.Storage.get('filmix_login', '');
                    var password = Lampa.Storage.get('filmix_password', '');
                    if (!login || !password) {
                        Lampa.Noty.show(PLUGIN_TITLE + ': Р·Р°РїРѕР»РЅРёС‚Рµ Р»РѕРіРёРЅ Рё РїР°СЂРѕР»СЊ РІС‹С€Рµ', { time: 3000 });
                        return;
                    }
                    Lampa.Noty.show(PLUGIN_TITLE + ': Р°РІС‚РѕСЂРёР·Р°С†РёСЏвЂ¦', { time: 2000 });
                    authorize(login, password,
                        function () { Lampa.Noty.show(PLUGIN_TITLE + ': Р°РІС‚РѕСЂРёР·РѕРІР°РЅ РєР°Рє ' + login + ' вњ”', { time: 3000 }); },
                        function (msg) { Lampa.Noty.show(PLUGIN_TITLE + ': РѕС€РёР±РєР° вЂ” ' + msg, { time: 4000 }); }
                    );
                } else if (value === 'logout') {
                    logout();
                }
            }
        });

        /* РЎС‚Р°С‚СѓСЃ Р°РІС‚РѕСЂРёР·Р°С†РёРё (read-only label) */
        Lampa.SettingsApi.addParam({
            component: PLUGIN_KEY,
            param: { name: 'filmix_status_text', type: 'input', default: s('token') ? ('РђРІС‚РѕСЂРёР·РѕРІР°РЅ: ' + s('login')) : 'РќРµ Р°РІС‚РѕСЂРёР·РѕРІР°РЅ' },
            field: { name: 'РЎС‚Р°С‚СѓСЃ' },
            onChange: function () {}
        });

        /* 2. Р”РѕР±Р°РІР»СЏРµРј Filmix РєР°Рє РёСЃС‚РѕС‡РЅРёРє РІ РєР°СЂС‚РѕС‡РєРµ С„РёР»СЊРјР° */
        hookFullCard();

        /* 3. Р’РѕСЃСЃС‚Р°РЅР°РІР»РёРІР°РµРј СЃРµСЃСЃРёСЋ РїСЂРё Р·Р°РїСѓСЃРєРµ */
        restoreSession();

        console.log('[' + PLUGIN_TITLE + '] РїР»Р°РіРёРЅ Р·Р°РіСЂСѓР¶РµРЅ');
    }

    /* Р—Р°РїСѓСЃРєР°РµРј СЃСЂР°Р·Сѓ РёР»Рё Р¶РґС‘Рј РіРѕС‚РѕРІРЅРѕСЃС‚Рё Lampa */
    if (window.Lampa && Lampa.Listener) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            var tries = 0;
            var wait  = setInterval(function () {
                tries++;
                if (window.Lampa && Lampa.Listener) { clearInterval(wait); init(); }
                else if (tries > 30) { clearInterval(wait); console.warn('[Filmix] Lampa С‚Р°Рє Рё РЅРµ Р·Р°РіСЂСѓР·РёР»Р°СЃСЊ'); }
            }, 300);
        });
    }

})();