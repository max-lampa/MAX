(function () {
  'use strict';

  if (window.premiumconnect_bootstrap_v3)
    return;

  window.premiumconnect_bootstrap_v3 = true;

  // ИЗМЕНЕНО: адрес удалён, теперь используется текущий домен
  var BASE_URL = ('' || '').replace(/\/+$/, '');
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

  function noty(text) {
    try {
      if (window.Lampa && Lampa.Noty && Lampa.Noty.show)
        Lampa.Noty.show(String(text || ''));
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

  function detectFilmixPro() {
    var info = getStorage('filmix_status', {});
    if (!info || typeof info !== 'object')
      return true;

    return !!(info.is_pro || info.is_pro_plus);
  }

  function setFilmixStatus(pro) {
    setStorage('filmix_status', {
      is_pro: !!pro,
      is_pro_plus: false
    });
  }

  function readCurrentState() {
    return {
      filmixToken: String(getStorage('filmix_token', '') || '').trim(),
      filmixPro: detectFilmixPro(),
      rezkaCookie: String(getStorage('online_mod_rezka2_cookie', '') || '').trim()
    };
  }

  function applyPortalState(state) {
    if (!state || typeof state !== 'object')
      return;

    if (state.filmixToken !== undefined && state.filmixToken !== null)
      setStorage('filmix_token', String(state.filmixToken || ''));

    if (state.filmixPro !== undefined)
      setFilmixStatus(!!state.filmixPro);

    if (state.rezkaCookie !== undefined && state.rezkaCookie !== null)
      setStorage('online_mod_rezka2_cookie', String(state.rezkaCookie || ''));
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
      if (name === 'filmix_token' || name === 'online_mod_rezka2_cookie' || name === 'filmix_status')
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
      title: 'Filmix авторизація',
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

  function checkFilmixAuth(token, options) {
    options = options || {};

    var filmixToken = String(token || getStorage('filmix_token', '') || '').trim();
    if (!filmixToken) {
      if (!options.silent)
        noty('Filmix token не задано');
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
      var pro = !!res.json.pro;

      if (authorized) {
        setStorage('filmix_token', filmixToken);
        setFilmixStatus(pro);
        pushState(true);

        if (!options.silent)
          noty(pro ? 'Filmix Premium підключено' : 'Filmix авторизовано');
      } else if (!options.silent) {
        noty('Код ще не підтверджено у Filmix');
      }

      return {
        ok: true,
        authorized: authorized,
        pro: pro
      };
    }).catch(function () {
      if (!options.skipLoading && window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();

      if (!options.silent)
        noty('Помилка перевірки Filmix авторизації');

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
          updateAuthStatus('Час очікування вичерпано. Натисніть "Перевірити Filmix авторизацію".', 'error');
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
        noty('Не вдалося отримати код Filmix');
        return;
      }

      if (!openFilmixAuthModal(res.json)) {
        noty('Не вдалося відкрити вікно Filmix авторизації');
        return;
      }

      runFilmixPolling();
    }).catch(function () {
      if (Lampa.Loading)
        Lampa.Loading.stop();
      noty('Помилка мережі при отриманні коду Filmix');
    });
  }

  function inputFilmixToken() {
    if (!window.Lampa || !Lampa.Input || !Lampa.Input.edit)
      return;

    var current = String(getStorage('filmix_token', '') || '').trim();

    Lampa.Input.edit({
      title: 'Введіть Filmix token',
      value: current,
      free: true,
      nosave: true
    }, function (value) {
      var token = String(value || '').trim();
      if (!token) {
        noty('Filmix token не змінено');
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
        noty('Не вдалося видалити Filmix token');
        return;
      }

      setStorage('filmix_token', '');
      setStorage('filmix_status', {});
      pendingFilmixToken = '';
      lastStateHash = JSON.stringify(readCurrentState());
      noty('Filmix token видалено');
    }).catch(function () {
      if (window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();
      noty('Помилка видалення Filmix token');
    });
  }

  function checkCurrentFilmixToken() {
    var token = String(getStorage('filmix_token', '') || '').trim();
    if (!token) {
      noty('Filmix token не задано');
      return;
    }

    checkFilmixAuth(token, { silent: false });
  }

  function rezkaLogin(login, password) {
    var user = String(login || '').trim();
    var pass = String(password || '').trim();
    if (!user || !pass) {
      noty('Rezka логін або пароль не задано');
      return;
    }

    if (window.Lampa && Lampa.Loading)
      Lampa.Loading.start();

    fetchJson(withAccount(BASE_URL + '/lite/premconnect/rezka/login'), {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: user, password: pass })
    }).then(function (res) {
      if (window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();

      if (!res.ok || !res.json || !res.json.ok || !res.json.cookie) {
        noty('Не вдалося авторизувати Rezka');
        return;
      }

      setStorage('online_mod_rezka2_login', user);
      setStorage('online_mod_rezka2_cookie', String(res.json.cookie || '').trim());
      pushState(true);
      noty('Rezka Premium підключено');
    }).catch(function () {
      if (window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();
      noty('Помилка мережі Rezka');
    });
  }

  function inputRezkaLogin() {
    if (!window.Lampa || !Lampa.Input || !Lampa.Input.edit)
      return;

    var currentLogin = String(getStorage('online_mod_rezka2_login', '') || '').trim();

    Lampa.Input.edit({
      title: 'Введіть Rezka логін',
      value: currentLogin,
      free: true,
      nosave: true
    }, function (login) {
      var user = String(login || '').trim();
      if (!user) {
        noty('Rezka логін не задано');
        return;
      }

      Lampa.Input.edit({
        title: 'Введіть Rezka пароль',
        value: '',
        free: true,
        nosave: true
      }, function (password) {
        var pass = String(password || '').trim();
        if (!pass) {
          noty('Rezka пароль не задано');
          return;
        }

        rezkaLogin(user, pass);
      });
    });
  }

  function checkCurrentRezkaAuth() {
    var localCookie = String(getStorage('online_mod_rezka2_cookie', '') || '').trim();

    if (window.Lampa && Lampa.Loading)
      Lampa.Loading.start();

    fetchJson(withAccount(BASE_URL + '/lite/premconnect/state'), {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin'
    }).then(function (res) {
      if (window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();

      if (res.ok && res.json && res.json.ok && res.json.state) {
        var cookie = String(res.json.state.rezkaCookie || '').trim();
        if (cookie)
          setStorage('online_mod_rezka2_cookie', cookie);

        if (cookie)
          noty('Rezka Premium підключено');
        else
          noty('Rezka не авторизовано');
        return;
      }

      if (localCookie)
        noty('Rezka cookie задано локально');
      else
        noty('Rezka не авторизовано');
    }).catch(function () {
      if (window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();

      if (localCookie)
        noty('Rezka cookie задано локально');
      else
        noty('Помилка перевірки Rezka');
    });
  }

  function resetRezkaCookie() {
    if (window.Lampa && Lampa.Loading)
      Lampa.Loading.start();

    fetchJson(withAccount(BASE_URL + '/lite/premconnect/state'), {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clearRezka: true })
    }).then(function (res) {
      if (window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();

      if (!res.ok || !res.json || !res.json.ok) {
        noty('Не вдалося видалити Rezka cookie');
        return;
      }

      setStorage('online_mod_rezka2_cookie', '');
      lastStateHash = JSON.stringify(readCurrentState());
      noty('Rezka cookie видалено');
    }).catch(function () {
      if (window.Lampa && Lampa.Loading)
        Lampa.Loading.stop();
      noty('Помилка видалення Rezka cookie');
    });
  }

  function addLang() {
    if (!window.Lampa || !Lampa.Lang || !Lampa.Lang.add)
      return;

    Lampa.Lang.add({
      premconnect_component: {
        ru: 'Premium Connect',
        uk: 'Premium Connect',
        en: 'Premium Connect'
      },
      premconnect_start_filmix: {
        ru: 'Запустить Filmix авторизацию (код)',
        uk: 'Запустити Filmix авторизацію (код)',
        en: 'Start Filmix code auth'
      },
      premconnect_section_title: {
        ru: 'Premium Connect',
        uk: 'Premium Connect',
        en: 'Premium Connect'
      },
      premconnect_input_filmix: {
        ru: 'Ввести Filmix token',
        uk: 'Ввести Filmix token',
        en: 'Enter Filmix token'
      },
      premconnect_check_filmix: {
        ru: 'Проверить Filmix авторизацию',
        uk: 'Перевірити Filmix авторизацію',
        en: 'Check Filmix authorization'
      },
      premconnect_reset_filmix: {
        ru: 'Сбросить Filmix token',
        uk: 'Скинути Filmix token',
        en: 'Reset Filmix token'
      },
      premconnect_input_rezka: {
        ru: 'Ввести Rezka логін/пароль',
        uk: 'Ввести Rezka логін/пароль',
        en: 'Enter Rezka login/password'
      },
      premconnect_check_rezka: {
        ru: 'Проверить Rezka авторизацию',
        uk: 'Перевірити Rezka авторизацію',
        en: 'Check Rezka authorization'
      },
      premconnect_reset_rezka: {
        ru: 'Сбросить Rezka cookie',
        uk: 'Скинути Rezka cookie',
        en: 'Reset Rezka cookie'
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
    var currentRezkaCookie = String(getStorage('online_mod_rezka2_cookie', '') || '').trim();
    var rezkaState = currentRezkaCookie ? 'задано' : 'не задано';

    Lampa.SettingsApi.addComponent({
      component: componentName,
      name: 'Premium Connect',
      icon: '<svg width="80" height="80" viewBox="0 0 24 24" fill="none"><path d="M12 2L9.7 8.6L2.8 8.8L8.3 12.9L6.2 19.6L12 15.8L17.8 19.6L15.7 12.9L21.2 8.8L14.3 8.6L12 2Z" fill="white"/></svg>',
      before: 'plugins'
    });

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

    Lampa.SettingsApi.addParam({
      component: componentName,
      param: { type: 'button' },
      field: { name: Lampa.Lang.translate('premconnect_reset_filmix') },
      onChange: function () {
        resetFilmixToken();
      }
    });

    Lampa.SettingsApi.addParam({
      component: componentName,
      param: { type: 'button' },
      field: { name: Lampa.Lang.translate('premconnect_input_rezka') + ' (' + rezkaState + ')' },
      onChange: function () {
        inputRezkaLogin();
      }
    });

    Lampa.SettingsApi.addParam({
      component: componentName,
      param: { type: 'button' },
      field: { name: Lampa.Lang.translate('premconnect_check_rezka') },
      onChange: function () {
        checkCurrentRezkaAuth();
      }
    });

    Lampa.SettingsApi.addParam({
      component: componentName,
      param: { type: 'button' },
      field: { name: Lampa.Lang.translate('premconnect_reset_rezka') },
      onChange: function () {
        resetRezkaCookie();
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
    hookStorageSet();
    ensurePremOnlineLoaded(function () {
      initUi();
      pullState();
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