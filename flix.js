(function () {
  'use strict';

  if (window.premiumconnect_bootstrap_v3)
    return;

  window.premiumconnect_bootstrap_v3 = true;

  var BASE_URL = ('http://lampa.mooo.com' || '').replace(/\/+$/, '');
  var TOKEN = '';
  var PUSH_DELAY_MS = 1200;
  var WAIT_INTERVAL_MS = 250;
  var WAIT_MAX_TRIES = 160;
  var POLL_INTERVAL_MS = 4000;
  var POLL_MAX_TRIES = 30;

  var pushTimer = 0;
  var pollTimer = 0;
  var pollTries = 0;
  var lastStateHash = '';
  var pendingFilmixToken = '';
  var authModalRoot = null;
  var modalReturnController = 'settings_component';

  // ========== НАЛАШТУВАННЯ ЛОГІНУ/ПАРОЛЮ ==========
  var AUTH_ENABLED = true;
  var DEFAULT_LOGIN = '';
  var DEFAULT_PASSWORD = '';
  // ================================================

  function noty(text) {
    try {
      if (window.Lampa && Lampa.Noty && Lampa.Noty.show)
        Lampa.Noty.show(String(text || ''));
    } catch (e) {}
  }

  function updatePluginMeta() {
    if (!window.Lampa || !Lampa.Plugins || !Lampa.Plugins.get) return;

    try {
      var plugins = Lampa.Plugins.get();
      var descr = 'Підключення Premium Filmix та синхронізація токена.';
      var changed = false;

      for (var i = 0; i < plugins.length; i++) {
        var plugin = plugins[i];
        var url = String(plugin && plugin.url || '');

        if (/\/premconnect(?:\.v\d+)?\.js(?:[?#].*)?$/i.test(url)) {
          if (plugin.author !== 'LampaUA') {
            plugin.author = 'LampaUA';
            changed = true;
          }
          if (plugin.descr !== descr) {
            plugin.descr = descr;
            changed = true;
          }
        }
      }

      if (changed && Lampa.Plugins.save) Lampa.Plugins.save();
    } catch (e) {}
  }

  function addUrlParam(url, key, value) {
    if (value === undefined || value === null || value === '')
      return url;

    return url + (url.indexOf('?') >= 0 ? '&' : '?') + encodeURIComponent(key) + '=' + encodeURIComponent(value);
  }

  function withAccount(url) {
    var u = String(url || '');
    var uid = '';

    try {
      uid = String(Lampa.Storage.get('lampac_unic_id', '') || '').trim();
    } catch (e) {}

    if (/^\d{6,}$/.test(TOKEN)) {
      uid = TOKEN;
      try {
        Lampa.Storage.set('lampac_unic_id', uid);
      } catch (e) {}
    }

    try {
      u = addUrlParam(u, 'account_email', Lampa.Storage.get('account_email', ''));
      u = addUrlParam(u, 'uid', uid);
      u = addUrlParam(u, 'nws_id', Lampa.Storage.get('lampac_nws_id', ''));
    } catch (e) {}

    if (TOKEN && u.indexOf('token=') === -1)
      u = addUrlParam(u, 'token', TOKEN);

    return u;
  }

  function fetchJson(url, options) {
    return fetch(url, options || {}).then(function (resp) {
      return resp.text().then(function (text) {
        var json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {}

        return {
          ok: resp.ok,
          status: resp.status,
          json: json
        };
      });
    });
  }

  function getStorage(name, fallback) {
    try {
      return Lampa.Storage.get(name, fallback);
    } catch (e) {
      return fallback;
    }
  }

  function setStorage(name, value) {
    try {
      Lampa.Storage.set(name, value);
    } catch (e) {}
  }

  function normalizeFilmixTier(value) {
    var t = String(value || '').toLowerCase().replace(/\+/g, '_plus').trim();
    if (t === 'pro_plus' || t === 'pro' || t === '720' || t === 'none') return t;
    return '';
  }

  function detectFilmixTier() {
    var info = getStorage('filmix_status', {});
    if (!info || typeof info !== 'object') return 'pro';

    var tier = normalizeFilmixTier(info.tier);
    if (tier) return tier;
    if (info.is_pro_plus) return 'pro_plus';
    if (info.is_pro) return 'pro';
    return '720';
  }

  function setFilmixStatus(tier) {
    var t = normalizeFilmixTier(tier) || 'pro';
    setStorage('filmix_status', {
      tier: t,
      is_pro: (t === 'pro' || t === 'pro_plus'),
      is_pro_plus: (t === 'pro_plus')
    });
  }

  function readCurrentState() {
    var tier = detectFilmixTier();
    return {
      filmixToken: String(getStorage('filmix_token', '') || '').trim(),
      filmixTier: tier,
      filmixPro: (tier === 'pro' || tier === 'pro_plus')
    };
  }

  function applyPortalState(state) {
    if (!state || typeof state !== 'object')
      return;

    if (state.filmixToken !== undefined && state.filmixToken !== null)
      setStorage('filmix_token', String(state.filmixToken || ''));

    if (state.filmixTier !== undefined && state.filmixTier !== null) {
      setFilmixStatus(state.filmixTier);
    } else if (state.filmixPro !== undefined) {
      setFilmixStatus(!!state.filmixPro ? 'pro' : '720');
    }
  }

  function pullState() {
    var url = withAccount(BASE_URL + '/lite/premconnect/state');

    fetchJson(url, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin'
    }).then(function (res) {
      if (!res.ok || !res.json || !res.json.ok || !res.json.state)
        return;

      applyPortalState(res.json.state);
      lastStateHash = JSON.stringify(readCurrentState());
    }).catch(function () {});
  }

  function pushState(force) {
    var state = readCurrentState();
    var hash = JSON.stringify(state);

    if (!force && hash === lastStateHash)
      return;

    var url = withAccount(BASE_URL + '/lite/premconnect/state');
    lastStateHash = hash;

    fetchJson(url, {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    }).then(function (res) {
      if (!res.ok || !res.json || !res.json.ok)
        lastStateHash = '';
    }).catch(function () {
      lastStateHash = '';
    });
  }

  function schedulePush() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      pushState(false);
    }, PUSH_DELAY_MS);
  }

  function hookStorageSet() {
    if (window.premiumconnect_storage_hooked)
      return;

    window.premiumconnect_storage_hooked = true;

    var originalSet = Lampa.Storage && Lampa.Storage.set;
    if (typeof originalSet !== 'function')
      return;

    Lampa.Storage.set = function (name, value) {
      var result = originalSet.apply(this, arguments);
      if (name === 'filmix_token' || name === 'filmix_status')
        schedulePush();
      return result;
    };
  }

  function ensurePremOnlineLoaded(ready) {
    if (window.online_mod || window.online_mod_ready || window.__premonline_loaded_by_premiumconnect) {
      ready();
      return;
    }

    var script = document.createElement('script');
    script.src = BASE_URL + '/premonline.js?v=' + Date.now();
    script.async = true;
    script.onload = function () {
      window.__premonline_loaded_by_premiumconnect = true;
      ready();
    };
    script.onerror = function () {
      ready();
    };
    document.head.appendChild(script);
  }

  function copyText(text) {
    var value = String(text || '').trim();
    if (!value)
      return Promise.reject(new Error('empty'));

    if (navigator.clipboard && navigator.clipboard.writeText)
      return navigator.clipboard.writeText(value);

    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', 'readonly');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok)
          resolve();
        else
          reject(new Error('copy failed'));
      } catch (e) {
        reject(e);
      }
    });
  }

  function closeAuthModal() {
    clearTimeout(pollTimer);
    pollTries = 0;
    authModalRoot = null;
    try {
      if (window.Lampa && Lampa.Modal && Lampa.Modal.close)
        Lampa.Modal.close();
    } catch (e) {}

    setTimeout(function () {
      try {
        if (!window.Lampa || !Lampa.Controller || !Lampa.Controller.toggle)
          return;

        var target = String(modalReturnController || '').trim();
        if (!target)
          target = 'settings_component';

        try {
          Lampa.Controller.toggle(target);
          return;
        } catch (e1) {}

        try {
          Lampa.Controller.toggle('settings');
          return;
        } catch (e2) {}

        try {
          Lampa.Controller.toggle('content');
        } catch (e3) {}
      } catch (e) {}
    }, 10);
  }

  function updateAuthStatus(text, type) {
    if (!authModalRoot)
      return;

    var line = authModalRoot.querySelector('.premconnect-auth__status');
    if (!line)
      return;

    line.textContent = String(text || '');
    line.classList.remove('is-ok', 'is-error');
    if (type === 'ok')
      line.classList.add('is-ok');
    else if (type === 'error')
      line.classList.add('is-error');
  }

  function ensureAuthStyles() {
    if (document.getElementById('premconnect-auth-style'))
      return;

    var style = document.createElement('style');
    style.id = 'premconnect-auth-style';
    style.textContent = '' +
      '.premconnect-auth{padding:0.2em 0 0.4em;}' +
      '.premconnect-auth__subtitle{font-size:1.18em;line-height:1.35;color:#d9dde8;margin:0 0 1em;}' +
      '.premconnect-auth__code{font-size:2em;font-weight:700;letter-spacing:0.2em;background:#2e5e61;border-radius:.35em;color:#e9f9f7;text-align:center;padding:.45em .3em;margin:0 0 .8em;}' +
      '.premconnect-auth__bar{position:relative;height:.34em;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden;margin:0 0 .9em;}' +
      '.premconnect-auth__bar::after{content:"";position:absolute;left:-40%;top:0;width:40%;height:100%;background:#fff;opacity:.9;animation:premconnectBar 1.2s linear infinite;}' +
      '.premconnect-auth__status{font-size:1.08em;line-height:1.35;color:#aeb7c6;min-height:1.35em;}' +
      '.premconnect-auth__status.is-ok{color:#a6f2a5;}' +
      '.premconnect-auth__status.is-error{color:#ff8f8f;}' +
      '.premconnect-auth__input{width:100%;background:#1a2634;border:1px solid #3a4a5a;border-radius:.35em;color:#fff;padding:.6em .8em;margin:0 0 .6em;font-size:1em;}' +
      '.premconnect-auth__input:focus{outline:none;border-color:#5c8a8e;}' +
      '.premconnect-auth__label{display:block;color:#9aa5b5;font-size:.95em;margin:0 0 .3em;}' +
      '@keyframes premconnectBar{0%{left:-40%;}100%{left:100%;}}' +
      '@media (max-width:700px){.premconnect-auth__subtitle{font-size:1.05em;}.premconnect-auth__code{font-size:1.55em;}}';
    document.head.appendChild(style);
  }

  function openFilmixAuthModal(payload) {
    if (!window.Lampa || !Lampa.Modal || !Lampa.Modal.open)
      return false;

    ensureAuthStyles();

    try {
      if (Lampa.Controller && Lampa.Controller.enabled) {
        var current = Lampa.Controller.enabled();
        if (current && current.name && current.name !== 'modal')
          modalReturnController = current.name;
      }
    } catch (e) {}

    var code = String(payload.user_code || '').trim();
    var consoleUrl = String(payload.consoleUrl || 'https://filmix.my/consoles').trim();
    pendingFilmixToken = String(payload.token || '').trim();

    var root = document.createElement('div');
    root.className = 'premconnect-auth';
    root.innerHTML = '' +
      '<div class="premconnect-auth__subtitle">Введіть код на сторінці ' + consoleUrl + '</div>' +
      '<div class="premconnect-auth__code">' + code + '</div>' +
      '<div class="premconnect-auth__bar"></div>' +
      '<div class="premconnect-auth__status">Очікуємо підтвердження...</div>';

    authModalRoot = root;

    Lampa.Modal.open({
      title: 'Преміум авторизація',
      align: 'left',
      html: window.$ ? $(root) : root,
      onBack: function () {
        closeAuthModal();
      },
      buttons: [
        {
          name: 'Скопіювати код',
          onSelect: function () {
            copyText(code)
              .then(function () { noty('Код скопійовано'); })
              .catch(function () { noty('Не вдалося скопіювати код'); });
          }
        },
        {
          name: 'Закрити',
          onSelect: function () {
            closeAuthModal();
          }
        }
      ]
    });

    return true;
  }

  // ========== НОВІ ФУНКЦІЇ ДЛЯ ЛОГІНУ/ПАРОЛЮ ==========

  function getAuthCredentials() {
    return {
      login: String(getStorage('premconnect_login', DEFAULT_LOGIN) || '').trim(),
      password: String(getStorage('premconnect_password', DEFAULT_PASSWORD) || '').trim()
    };
  }

  function setAuthCredentials(login, password) {
    setStorage('premconnect_login', String(login || '').trim());
    setStorage('premconnect_password', String(password || '').trim());
  }

  function loginWithCredentials(login, password, options) {
    options = options || {};

    if (!login || !password) {
      if (!options.silent)
        noty('Введіть логін та пароль');
      return Promise.resolve({ ok: false, authorized: false });
    }

    if (!options.skipLoading && window.Lampa && Lampa.Loading)
      Lampa.Loading.start();

    var url = withAccount(BASE_URL + '/lite/premconnect/filmix/login');

    return fetchJson(url, {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: login, password: password })
    }).then(function (res) {
      if (!options.skipLoading && window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();

      if (!res.ok || !res.json) {
        if (!options.silent)
          noty('Помилка авторизації');
        return { ok: false, authorized: false };
      }

      if (res.json.error) {
        if (!options.silent)
          noty(res.json.error || 'Помилка авторизації');
        return { ok: false, authorized: false, error: res.json.error };
      }

      if (!res.json.ok || !res.json.token) {
        if (!options.silent)
          noty('Невірний логін або пароль');
        return { ok: false, authorized: false };
      }

      var token = String(res.json.token || '').trim();
      var tier = normalizeFilmixTier(res.json.tier);
      if (!tier) {
        var proPlus = !!res.json.proPlus;
        var pro = !!res.json.pro;
        tier = proPlus ? 'pro_plus' : (pro ? 'pro' : '720');
      }

      setStorage('filmix_token', token);
      setFilmixStatus(tier);
      setAuthCredentials(login, password);
      pushState(true);

      if (!options.silent)
        noty('Авторизація успішна! ' + (tier === 'pro_plus' ? 'PRO+' : (tier === 'pro' ? 'PRO' : '720')));

      return {
        ok: true,
        authorized: true,
        token: token,
        tier: tier,
        pro: (tier === 'pro' || tier === 'pro_plus')
      };
    }).catch(function (err) {
      if (!options.skipLoading && window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();

      if (!options.silent)
        noty('Помилка мережі при авторизації');

      return { ok: false, authorized: false, error: err.message };
    });
  }

  function openLoginModal() {
    if (!window.Lampa || !Lampa.Modal || !Lampa.Modal.open)
      return;

    ensureAuthStyles();

    var creds = getAuthCredentials();

    var root = document.createElement('div');
    root.className = 'premconnect-auth';
    root.innerHTML = '' +
      '<div class="premconnect-auth__subtitle">Введіть логін та пароль від Filmix</div>' +
      '<label class="premconnect-auth__label">Логін (email або username)</label>' +
      '<input type="text" class="premconnect-auth__input" id="premconnect-login" placeholder="Ваш логін" value="' + (creds.login || '') + '" />' +
      '<label class="premconnect-auth__label">Пароль</label>' +
      '<input type="password" class="premconnect-auth__input" id="premconnect-password" placeholder="Ваш пароль" value="' + (creds.password || '') + '" />' +
      '<div class="premconnect-auth__status"></div>';

    authModalRoot = root;

    Lampa.Modal.open({
      title: 'Вхід по логіну/паролю',
      align: 'left',
      html: window.$ ? $(root) : root,
      onBack: function () {
        closeAuthModal();
      },
      buttons: [
        {
          name: 'Увійти',
          onSelect: function () {
            var loginInput = root.querySelector('#premconnect-login');
            var passwordInput = root.querySelector('#premconnect-password');
            var login = loginInput ? loginInput.value : '';
            var password = passwordInput ? passwordInput.value : '';

            if (!login || !password) {
              updateAuthStatus('Заповніть всі поля', 'error');
              return;
            }

            updateAuthStatus('Авторизація...', '');

            loginWithCredentials(login, password, { silent: true, skipLoading: true })
              .then(function (result) {
                if (result.ok && result.authorized) {
                  updateAuthStatus('Успішно авторизовано!', 'ok');
                  setTimeout(function () {
                    closeAuthModal();
                  }, 1000);
                } else {
                  updateAuthStatus(result.error || 'Невірний логін або пароль', 'error');
                }
              });
          }
        },
        {
          name: 'Скасувати',
          onSelect: function () {
            closeAuthModal();
          }
        }
      ]
    });

    // Фокус на перше поле вводу
    setTimeout(function () {
      var loginInput = root.querySelector('#premconnect-login');
      if (loginInput) loginInput.focus();
    }, 100);
  }

  function inputLogin() {
    if (!window.Lampa || !Lampa.Input || !Lampa.Input.edit)
      return;

    var current = String(getStorage('premconnect_login', DEFAULT_LOGIN) || '').trim();

    Lampa.Input.edit({
      title: 'Введіть логін',
      value: current,
      free: true,
      nosave: true
    }, function (value) {
      var login = String(value || '').trim();
      setStorage('premconnect_login', login);
      noty(login ? 'Логін збережено' : 'Логін очищено');
    });
  }

  function inputPassword() {
    if (!window.Lampa || !Lampa.Input || !Lampa.Input.edit)
      return;

    var current = String(getStorage('premconnect_password', DEFAULT_PASSWORD) || '').trim();

    Lampa.Input.edit({
      title: 'Введіть пароль',
      value: current,
      free: true,
      nosave: true
    }, function (value) {
      var password = String(value || '').trim();
      setStorage('premconnect_password', password);
      noty(password ? 'Пароль збережено' : 'Пароль очищено');
    });
  }

  function quickLogin() {
    var creds = getAuthCredentials();
    if (!creds.login || !creds.password) {
      openLoginModal();
      return;
    }
    loginWithCredentials(creds.login, creds.password, { silent: false });
  }

  // ========== КІНЕЦЬ НОВИХ ФУНКЦІЙ ==========

  function checkFilmixAuth(token, options) {
    options = options || {};

    var filmixToken = String(token || getStorage('filmix_token', '') || '').trim();
    if (!filmixToken) {
      if (!options.silent)
        noty('Token не задано');
      return Promise.resolve({ ok: false, authorized: false });
    }

    if (!options.skipLoading && window.Lampa && Lampa.Loading)
      Lampa.Loading.start();

    var url = withAccount(addUrlParam(BASE_URL + '/lite/premconnect/filmix/check', 'filmixToken', filmixToken));

    return fetchJson(url, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin'
    }).then(function (res) {
      if (!options.skipLoading && window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();

      if (!res.ok || !res.json || !res.json.ok)
        return { ok: false, authorized: false };

      var authorized = !!res.json.authorized;
      var tier = normalizeFilmixTier(res.json.tier);
      if (!tier) {
        var proPlus = !!res.json.proPlus;
        var pro = !!res.json.pro;
        tier = proPlus ? 'pro_plus' : (pro ? 'pro' : '720');
      }

      if (authorized) {
        setStorage('filmix_token', filmixToken);
        setFilmixStatus(tier);
        pushState(true);

        if (!options.silent)
          noty('Преміум ' + (tier === 'pro_plus' ? 'PRO+' : (tier === 'pro' ? 'PRO' : '720')) + ' підключено');
      } else if (!options.silent) {
        noty('Код ще не підтверджено');
      }

      return {
        ok: true,
        authorized: authorized,
        tier: tier,
        pro: (tier === 'pro' || tier === 'pro_plus')
      };
    }).catch(function () {
      if (!options.skipLoading && window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();

      if (!options.silent)
        noty('Помилка перевірки авторизації');

      return { ok: false, authorized: false };
    });
  }

  function runFilmixPolling() {
    clearTimeout(pollTimer);
    pollTries = 0;

    var token = String(pendingFilmixToken || '').trim();
    if (!token || !authModalRoot)
      return;

    var tick = function () {
      if (!authModalRoot)
        return;

      pollTries++;

      checkFilmixAuth(token, { silent: true, skipLoading: true }).then(function (status) {
        if (!authModalRoot)
          return;

        if (status && status.ok && status.authorized) {
          updateAuthStatus('Авторизацію підтверджено. Токен збережено.', 'ok');
          clearTimeout(pollTimer);
          setTimeout(function () {
            closeAuthModal();
          }, 1100);
          return;
        }

        if (pollTries >= POLL_MAX_TRIES) {
          updateAuthStatus('Час очікування вичерпано. Натисніть "Перевірити авторизацію".', 'error');
          clearTimeout(pollTimer);
          return;
        }

        updateAuthStatus('Очікуємо підтвердження... (' + pollTries + '/' + POLL_MAX_TRIES + ')', '');
        pollTimer = setTimeout(tick, POLL_INTERVAL_MS);
      });
    };

    tick();
  }

  function startFilmixCodeFlow() {
    if (!window.Lampa)
      return;

    if (Lampa.Loading)
      Lampa.Loading.start();

    fetchJson(withAccount(BASE_URL + '/lite/premconnect/filmix/code'), {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin'
    }).then(function (res) {
      if (Lampa.Loading)
        Lampa.Loading.stop();

      if (!res.ok || !res.json || !res.json.ok || !res.json.user_code || !res.json.token) {
        noty('Не вдалося отримати код');
        return;
      }

      if (!openFilmixAuthModal(res.json)) {
        noty('Не вдалося відкрити вікно авторизації');
        return;
      }

      runFilmixPolling();
    }).catch(function () {
      if (Lampa.Loading)
        Lampa.Loading.stop();
      noty('Помилка мережі при отриманні коду');
    });
  }

  function inputFilmixToken() {
    if (!window.Lampa || !Lampa.Input || !Lampa.Input.edit)
      return;

    var current = String(getStorage('filmix_token', '') || '').trim();

    Lampa.Input.edit({
      title: 'Введіть token',
      value: current,
      free: true,
      nosave: true
    }, function (value) {
      var token = String(value || '').trim();
      if (!token) {
        noty('Token не змінено');
        return;
      }

      setStorage('filmix_token', token);
      pendingFilmixToken = token;
      pushState(true);
      checkFilmixAuth(token, { silent: false });
    });
  }

  function resetFilmixToken() {
    if (window.Lampa && Lampa.Loading)
      Lampa.Loading.start();

    fetchJson(withAccount(BASE_URL + '/lite/premconnect/state'), {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clearFilmix: true })
    }).then(function (res) {
      if (window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();

      if (!res.ok || !res.json || !res.json.ok) {
        noty('Не вдалося видалити token');
        return;
      }

      setStorage('filmix_token', '');
      setStorage('filmix_status', {});
      setStorage('premconnect_login', '');
      setStorage('premconnect_password', '');
      pendingFilmixToken = '';
      lastStateHash = JSON.stringify(readCurrentState());
      noty('Token та дані авторизації видалено');
    }).catch(function () {
      if (window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();
      noty('Помилка видалення token');
    });
  }

  function checkCurrentFilmixToken() {
    var token = String(getStorage('filmix_token', '') || '').trim();
    if (!token) {
      noty('Token не задано');
      return;
    }

    checkFilmixAuth(token, { silent: false });
  }

  function syncFilmixTierSilent() {
    var token = String(getStorage('filmix_token', '') || '').trim();
    if (!token) return;
    checkFilmixAuth(token, { silent: true, skipLoading: true }).then(function () {});
  }

  function addLang() {
    if (!window.Lampa || !Lampa.Lang || !Lampa.Lang.add)
      return;

    Lampa.Lang.add({
      premconnect_component: {
        ru: 'Premium Filmix',
        uk: 'Premium Filmix',
        en: 'Premium Filmix'
      },
      premconnect_start_filmix: {
        ru: '↻ Запустить авторизацию (код)',
        uk: '↻ Запустити авторизацію (код)',
        en: '↻ Start Authorization (Code)'
      },
      premconnect_section_title: {
        ru: 'Premium Filmix',
        uk: 'Premium Filmix',
        en: 'Premium Filmix'
      },
      premconnect_input_filmix: {
        ru: '⌨ Ввести token',
        uk: '⌨ Ввести token',
        en: '⌨ Enter Token'
      },
      premconnect_check_filmix: {
        ru: '✓ Проверить авторизацию',
        uk: '✓ Перевірити авторизацію',
        en: '✓ Check Authorization'
      },
      premconnect_reset_filmix: {
        ru: '✕ Сбросить token',
        uk: '✕ Скинути token',
        en: '✕ Reset Token'
      },
      premconnect_login_section: {
        ru: 'Авторизация по логину/паролю',
        uk: 'Авторизація по логіну/паролю',
        en: 'Login/Password Authorization'
      },
      premconnect_quick_login: {
        ru: '🔑 Быстрый вход',
        uk: '🔑 Швидкий вхід',
        en: '🔑 Quick Login'
      },
      premconnect_open_login_modal: {
        ru: '👤 Вход по логину/паролю',
        uk: '👤 Вхід по логіну/паролю',
        en: '👤 Login with Credentials'
      },
      premconnect_input_login: {
        ru: '⌨ Ввести логин',
        uk: '⌨ Ввести логін',
        en: '⌨ Enter Login'
      },
      premconnect_input_password: {
        ru: '⌨ Ввести пароль',
        uk: '⌨ Ввести пароль',
        en: '⌨ Enter Password'
      }
    });
  }

  function addSettingsUi() {
    if (!window.Lampa || !Lampa.SettingsApi || window.premiumconnect_settings_added)
      return false;

    window.premiumconnect_settings_added = true;
    var componentName = 'premiumconnect';

    var currentToken = String(getStorage('filmix_token', '') || '').trim();
    var tokenState = currentToken ? 'задано' : 'не задано';

    var creds = getAuthCredentials();
    var loginState = creds.login ? 'задано' : 'не задано';
    var passwordState = creds.password ? 'задано' : 'не задано';

    Lampa.SettingsApi.addComponent({
      component: componentName,
      name: 'Premium Filmix',
      icon: '<svg width="80" height="80" viewBox="0 0 24 24" fill="none"><path d="M12 2L9.7 8.6L2.8 8.8L8.3 12.9L6.2 19.6L12 15.8L17.8 19.6L15.7 12.9L21.2 8.8L14.3 8.6L12 2Z" fill="white"/></svg>',
      before: 'plugins'
    });

    // Секція авторизації по коду
    Lampa.SettingsApi.addParam({
      component: componentName,
      param: { type: 'title' },
      field: { name: Lampa.Lang.translate('premconnect_section_title') }
    });

    Lampa.SettingsApi.addParam({
      component: componentName,
      param: { type: 'button' },
      field: { name: Lampa.Lang.translate('premconnect_start_filmix') },
      onChange: function () {
        startFilmixCodeFlow();
      }
    });

    Lampa.SettingsApi.addParam({
      component: componentName,
      param: { type: 'button' },
      field: { name: Lampa.Lang.translate('premconnect_input_filmix') + ' (' + tokenState + ')' },
      onChange: function () {
        inputFilmixToken();
      }
    });

    Lampa.SettingsApi.addParam({
      component: componentName,
      param: { type: 'button' },
      field: { name: Lampa.Lang.translate('premconnect_check_filmix') },
      onChange: function () {
        checkCurrentFilmixToken();
      }
    });

    // Секція авторизації по логіну/паролю
    if (AUTH_ENABLED) {
      Lampa.SettingsApi.addParam({
        component: componentName,
        param: { type: 'title' },
        field: { name: Lampa.Lang.translate('premconnect_login_section') }
      });

      Lampa.SettingsApi.addParam({
        component: componentName,
        param: { type: 'button' },
        field: { name: Lampa.Lang.translate('premconnect_open_login_modal') },
        onChange: function () {
          openLoginModal();
        }
      });

      Lampa.SettingsApi.addParam({
        component: componentName,
        param: { type: 'button' },
        field: { name: Lampa.Lang.translate('premconnect_quick_login') },
        onChange: function () {
          quickLogin();
        }
      });

      Lampa.SettingsApi.addParam({
        component: componentName,
        param: { type: 'button' },
        field: { name: Lampa.Lang.translate('premconnect_input_login') + ' (' + loginState + ')' },
        onChange: function () {
          inputLogin();
        }
      });

      Lampa.SettingsApi.addParam({
        component: componentName,
        param: { type: 'button' },
        field: { name: Lampa.Lang.translate('premconnect_input_password') + ' (' + passwordState + ')' },
        onChange: function () {
          inputPassword();
        }
      });
    }

    // Кнопка скидання
    Lampa.SettingsApi.addParam({
      component: componentName,
      param: { type: 'button' },
      field: { name: Lampa.Lang.translate('premconnect_reset_filmix') },
      onChange: function () {
        resetFilmixToken();
      }
    });

    return true;
  }

  function initUi() {
    addLang();

    var retries = 0;
    var timer = setInterval(function () {
      retries++;
      if (addSettingsUi() || retries > 80)
        clearInterval(timer);
    }, 400);
  }

  function start() {
    updatePluginMeta();
    hookStorageSet();
    ensurePremOnlineLoaded(function () {
      initUi();
      pullState();
      setTimeout(function () {
        syncFilmixTierSilent();
      }, 1200);
      setTimeout(function () {
        pushState(false);
      }, 2500);
    });
  }

  function waitLampa() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (window.Lampa && Lampa.Storage && Lampa.SettingsApi) {
        clearInterval(timer);
        start();
      } else if (tries > WAIT_MAX_TRIES) {
        clearInterval(timer);
      }
    }, WAIT_INTERVAL_MS);
  }

  waitLampa();
})();