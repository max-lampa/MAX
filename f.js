(function () {
    'use strict';

    var PLUGIN_NAME = 'filmix';
    var PLUGIN_TITLE = 'Filmix';
    var API_BASE = 'https://filmix.ac';
    var USER_AGENT = 'Lampa/1.0';

    /* в”Ђв”Ђв”Ђ Storage helpers в”Ђв”Ђв”Ђ */
    function store(key, value) {
        if (value === undefined) {
            return Lampa.Storage.get(PLUGIN_NAME + '_' + key, '');
        }
        Lampa.Storage.set(PLUGIN_NAME + '_' + key, value);
    }

    function getToken()    { return store('token'); }
    function getLogin()    { return store('login'); }
    function getPassword() { return store('password'); }

    /* в”Ђв”Ђв”Ђ Filmix API в”Ђв”Ђв”Ђ */
    function filmixRequest(endpoint, params, callback, errback) {
        var url = API_BASE + endpoint;
        var token = getToken();

        var headers = {
            'User-Agent': USER_AGENT,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }

        var body = Object.keys(params || {})
            .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); })
            .join('&');

        Lampa.Utils.fetch(url, {
            method: body ? 'POST' : 'GET',
            headers: headers,
            body: body || undefined
        })
        .then(function (resp) { return resp.json(); })
        .then(function (json) {
            if (json && json.error) {
                (errback || function () {})(json.error.message || 'Filmix error');
            } else {
                (callback || function () {})(json);
            }
        })
        .catch(function (e) {
            (errback || function () {})(e.message || 'Network error');
        });
    }

    /* в”Ђв”Ђв”Ђ Auth в”Ђв”Ђв”Ђ */
    function authorize(login, password, onSuccess, onError) {
        filmixRequest(
            '/api/oauth/token',
            {
                grant_type: 'password',
                username: login,
                password: password,
                client_id: 'lampa'
            },
            function (data) {
                if (data && data.access_token) {
                    store('token', data.access_token);
                    store('login', login);
                    store('password', password);
                    if (data.refresh_token) store('refresh_token', data.refresh_token);
                    (onSuccess || function () {})(data);
                } else {
                    (onError || function () {})('РќРµРІРµСЂРЅС‹Р№ РѕС‚РІРµС‚ СЃРµСЂРІРµСЂР°');
                }
            },
            onError
        );
    }

    function refreshToken(onSuccess, onError) {
        var rt = store('refresh_token');
        if (!rt) {
            authorize(getLogin(), getPassword(), onSuccess, onError);
            return;
        }
        filmixRequest(
            '/api/oauth/token',
            { grant_type: 'refresh_token', refresh_token: rt },
            function (data) {
                if (data && data.access_token) {
                    store('token', data.access_token);
                    if (data.refresh_token) store('refresh_token', data.refresh_token);
                    (onSuccess || function () {})(data);
                } else {
                    (onError || function () {})('РќРµ СѓРґР°Р»РѕСЃСЊ РѕР±РЅРѕРІРёС‚СЊ С‚РѕРєРµРЅ');
                }
            },
            onError
        );
    }

    function logout() {
        store('token', '');
        store('refresh_token', '');
        Lampa.Noty.show('Filmix: РІС‹РїРѕР»РЅРµРЅ РІС‹С…РѕРґ РёР· Р°РєРєР°СѓРЅС‚Р°');
    }

    /* в”Ђв”Ђв”Ђ Settings component в”Ђв”Ђв”Ђ */
    function SettingsComponent() {
        var html = Lampa.Template.get('filmix_settings', {
            login: getLogin(),
            password: getPassword(),
            token: getToken() ? 'вњ” РўРѕРєРµРЅ РїРѕР»СѓС‡РµРЅ' : 'вњ— РќРµ Р°РІС‚РѕСЂРёР·РѕРІР°РЅ'
        });

        function handleAuth() {
            var loginVal    = html.find('[name="filmix_login"]').val().trim();
            var passwordVal = html.find('[name="filmix_password"]').val().trim();

            if (!loginVal || !passwordVal) {
                Lampa.Noty.show('Filmix: РІРІРµРґРёС‚Рµ Р»РѕРіРёРЅ Рё РїР°СЂРѕР»СЊ', { time: 3000 });
                return;
            }

            Lampa.Noty.show('Filmix: Р°РІС‚РѕСЂРёР·Р°С†РёСЏвЂ¦', { time: 2000 });

            authorize(
                loginVal,
                passwordVal,
                function () {
                    html.find('.filmix-status').text('вњ” РђРІС‚РѕСЂРёР·РѕРІР°РЅ: ' + loginVal);
                    Lampa.Noty.show('Filmix: Р°РІС‚РѕСЂРёР·Р°С†РёСЏ СѓСЃРїРµС€РЅР°!', { time: 3000 });
                },
                function (msg) {
                    html.find('.filmix-status').text('вњ— РћС€РёР±РєР°: ' + msg);
                    Lampa.Noty.show('Filmix: ' + msg, { time: 4000 });
                }
            );
        }

        function handleLogout() {
            logout();
            html.find('.filmix-status').text('вњ— РќРµ Р°РІС‚РѕСЂРёР·РѕРІР°РЅ');
            html.find('[name="filmix_login"]').val('');
            html.find('[name="filmix_password"]').val('');
        }

        html.find('.filmix-btn-auth').on('click', handleAuth);
        html.find('.filmix-btn-logout').on('click', handleLogout);

        this.render = function () { return html; };
        this.destroy = function () { html.remove(); };
    }

    /* в”Ђв”Ђв”Ђ HTML template в”Ђв”Ђв”Ђ */
    Lampa.Template.add('filmix_settings', [
        '<div class="filmix-settings">',
        '  <div class="filmix-settings__row">',
        '    <label>Р›РѕРіРёРЅ</label>',
        '    <input class="filmix-input" name="filmix_login" type="text" placeholder="Р›РѕРіРёРЅ Filmix" value="{login}" autocomplete="off" />',
        '  </div>',
        '  <div class="filmix-settings__row">',
        '    <label>РџР°СЂРѕР»СЊ</label>',
        '    <input class="filmix-input" name="filmix_password" type="password" placeholder="РџР°СЂРѕР»СЊ Filmix" value="{password}" autocomplete="off" />',
        '  </div>',
        '  <div class="filmix-settings__row filmix-settings__actions">',
        '    <button class="filmix-btn filmix-btn-auth">Р’РѕР№С‚Рё</button>',
        '    <button class="filmix-btn filmix-btn-logout filmix-btn--secondary">Р’С‹Р№С‚Рё</button>',
        '  </div>',
        '  <div class="filmix-settings__row">',
        '    <span class="filmix-status">{token}</span>',
        '  </div>',
        '</div>'
    ].join(''));

    /* в”Ђв”Ђв”Ђ CSS в”Ђв”Ђв”Ђ */
    var css = [
        '.filmix-settings { padding: 1em; max-width: 420px; }',
        '.filmix-settings__row { display:flex; align-items:center; gap:.7em; margin-bottom:.9em; flex-wrap:wrap; }',
        '.filmix-settings__row label { min-width:80px; color:var(--lampa-text,#ddd); font-size:.95em; }',
        '.filmix-input { flex:1; background:var(--lampa-background-secondary,#1a1a2e); color:var(--lampa-text,#eee);',
        '  border:1px solid var(--lampa-border,#444); border-radius:6px; padding:.45em .7em; font-size:.95em; }',
        '.filmix-input:focus { outline:none; border-color:#e50914; }',
        '.filmix-btn { padding:.45em 1.2em; border:none; border-radius:6px; cursor:pointer; font-size:.9em; font-weight:600; transition:background .2s; }',
        '.filmix-btn-auth { background:#e50914; color:#fff; }',
        '.filmix-btn-auth:hover { background:#c40812; }',
        '.filmix-btn--secondary { background:var(--lampa-background-secondary,#333); color:var(--lampa-text,#ddd); border:1px solid var(--lampa-border,#555); }',
        '.filmix-btn--secondary:hover { background:#444; }',
        '.filmix-status { font-size:.85em; color:#aaa; }'
    ].join('\n');

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    /* в”Ђв”Ђв”Ђ Plugin search / catalog integration в”Ђв”Ђв”Ђ */
    function onSearch(query, params) {
        var token = getToken();
        if (!token) {
            Lampa.Noty.show('Filmix: СЃРЅР°С‡Р°Р»Р° РІРѕР№РґРёС‚Рµ РІ Р°РєРєР°СѓРЅС‚', { time: 3000 });
            return;
        }

        filmixRequest(
            '/api/v2/search',
            { q: query, page: params.page || 1 },
            function (data) {
                var items = (data.results || []).map(function (item) {
                    return {
                        id: item.id,
                        title: item.title || item.original_title,
                        original_title: item.original_title,
                        poster: item.poster,
                        year: item.year,
                        type: item.type === 'tv-series' ? 'tv' : 'movie',
                        source: PLUGIN_NAME
                    };
                });
                params.callback({ results: items, total_pages: data.total_pages || 1 });
            },
            function (msg) {
                Lampa.Noty.show('Filmix: ' + msg, { time: 3000 });
                params.callback({ results: [], total_pages: 1 });
            }
        );
    }

    /* в”Ђв”Ђв”Ђ Plugin registration в”Ђв”Ђв”Ђ */
    if (window.Lampa) {
        /* Settings tab */
        Lampa.SettingsApi.addComponent({
            component: PLUGIN_NAME,
            name: PLUGIN_TITLE,
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN_NAME,
            param: {
                name: 'filmix_auth_block',
                type: 'component',
                component: SettingsComponent
            },
            field: {
                name: PLUGIN_TITLE + ' вЂ” РђРІС‚РѕСЂРёР·Р°С†РёСЏ'
            },
            onChange: function () {}
        });

        /* Source / search hook */
        if (Lampa.Listener) {
            Lampa.Listener.follow('source', function (e) {
                if (e.name === PLUGIN_NAME) onSearch(e.query || '', e);
            });
        }

        /* Auto-refresh token on startup if we have credentials stored */
        if (getLogin() && getPassword() && !getToken()) {
            authorize(getLogin(), getPassword(), function () {
                Lampa.Noty.show('Filmix: Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё Р°РІС‚РѕСЂРёР·РѕРІР°РЅ РєР°Рє ' + getLogin(), { time: 3000 });
            }, function () {});
        }

        console.log('[' + PLUGIN_TITLE + '] plugin loaded');
    } else {
        console.warn('[' + PLUGIN_TITLE + '] Lampa not found вЂ” plugin not registered');
    }

    /* в”Ђв”Ђв”Ђ Public API (for other plugins) в”Ђв”Ђв”Ђ */
    window.FilmixPlugin = {
        authorize: authorize,
        logout: logout,
        refreshToken: refreshToken,
        request: filmixRequest,
        getToken: getToken,
        isAuthorized: function () { return !!getToken(); }
    };

})();