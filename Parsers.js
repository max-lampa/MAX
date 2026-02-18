// IIFE - самовикликаюча функція для ізоляції плагіна
(function () {
  'use strict';

  /* =========================
   * 1) Локалізація
   * ========================= */
  function translate() {
    Lampa.Lang.add({
      bat_parser: {
        ru: 'Каталог парсеров',
        en: 'Parsers catalog',
        uk: 'Каталог парсерів',
        zh: '解析器目录'
      },
      bat_parser_description: {
        ru: 'Нажмите для выбора парсера из',
        en: 'Click to select a parser from',
        uk: 'Натисніть для вибору парсера з',
        zh: '点击从目录中选择解析器'
      },
      bat_parser_current: {
        ru: 'Текущий выбор:',
        en: 'Current selection:',
        uk: 'Поточний вибір:',
        zh: '当前选择：'
      },
      bat_parser_none: {
        ru: 'Не выбран',
        en: 'Not selected',
        uk: 'Не вибрано',
        zh: '未选择'
      },
      bat_parser_selected_label: {
        ru: 'Выбрано:',
        en: 'Selected:',
        uk: 'Обрано:',
        zh: '已选择：'
      },

      bat_check_parsers: {
        ru: 'Проверить доступность парсеров',
        en: 'Check parsers availability',
        uk: 'Перевірити доступність парсерів',
        zh: '检查解析器可用性'
      },
      bat_check_parsers_desc: {
        ru: 'Выполняет проверку доступности парсеров',
        en: 'Checks parsers availability',
        uk: 'Виконує перевірку доступності парсерів',
        zh: '执行解析器可用性检查'
      },

      bat_check_search: {
        ru: 'Проверить доступность поиска',
        en: 'Check search availability',
        uk: 'Перевірити доступність пошуку',
        zh: '检查搜索可用性'
      },
      bat_check_search_desc: {
        ru: 'Выполняет проверку доступности поиска торрентов',
        en: 'Checks torrent search availability',
        uk: 'Виконує перевірку доступності пошуку торентів',
        zh: '执行种子搜索可用性检查'
      },

      bat_check_done: {
        ru: 'Проверку завершено',
        en: 'Check completed',
        uk: 'Перевірку завершено',
        zh: '检查完成'
      },

      // HEALTH (сервер)
      bat_status_checking_server: {
        ru: 'Проверка сервера…',
        en: 'Checking server…',
        uk: 'Перевірка сервера…',
        zh: '检查服务器…'
      },
      bat_status_server_ok: {
        ru: 'Сервер доступен',
        en: 'Server available',
        uk: 'Сервер доступний',
        zh: '服务器可用'
      },
      bat_status_server_warn: {
        ru: 'Сервер отвечает (ограничения)',
        en: 'Server responds (restrictions)',
        uk: 'Сервер відповідає (обмеження)',
        zh: '服务器有响应（受限）'
      },
      
      bat_status_server_bad: {
        ru: 'Сервер недоступен',
        en: 'Server unavailable',
        uk: 'Сервер недоступний',
        zh: '服务器不可用'
      },

      bat_status_unknown: {
        ru: 'Не проверен',
        en: 'Unchecked',
        uk: 'Не перевірено',
        zh: '未检查'
      },

      // SEARCH (2 стани)
      bat_status_checking_search: {
        ru: 'Проверка поиска…',
        en: 'Checking search…',
        uk: 'Перевірка пошуку…',
        zh: '检查搜索…'
      },
      bat_status_search_ok: {
        ru: 'Поиск работает',
        en: 'Search works',
        uk: 'Пошук працює',
        zh: '搜索可用'
      },
      bat_status_search_bad: {
        ru: 'Поиск не работает',
        en: 'Search does not work',
        uk: 'Пошук не працює',
        zh: '搜索不可用'
      }
    });
  }

  var Lang = { translate: translate };

  /* =========================
   * 2) Список парсерів
   * ========================= */
  var parsersInfo = [
    {
      base: 'lampa_ua',
      name: 'LampaUA (toloka, mazepa, utopia)',
      settings: { url: 'jackettua.mooo.com', key: 'ua', parser_torrent_type: 'jackett' }
    },
    {
      base: 'spawnum_duckdns_org_49117',
      name: 'SpawnUA (toloka, mazepa only)',
      settings: { url: 'http://spawnum.duckdns.org:49117', key: '2', parser_torrent_type: 'jackett' }
    }, 
    {
      base: 'spawnum_duckdns_org_59117',
      name: 'SpawnUA (toloka, mazepa, etc.)',
      settings: { url: 'http://spawnum_duckdns_org_59117', key: '2', parser_torrent_type: 'jackett' }
    },
    {
      base: 'jacred_pro',
      name: 'Jacred.pro',
      settings: { url: 'jacred.pro', key: '', parser_torrent_type: 'jackett' }
    },
    {
      base: 'jacred_xyz',
      name: 'Jacred.xyz',
      settings: { url: 'jacred.xyz', key: '', parser_torrent_type: 'jackett' }
    },
    {
      base: 'maxvol_pro',
      name: 'Maxvol.pro',
      settings: { url: 'jac.maxvol.pro', key: '1', parser_torrent_type: 'jackett' }
    }
    
    /*{
      base: 'spawnpp_ua',
      name: 'Spawnpp-UA',
      settings: { url: 'spawn.pp.ua:59117', key: '2', parser_torrent_type: 'jackett' }
    }*/

    
  ];

  /* =========================
   * 3) Константи/хелпери
   * ========================= */
  var STORAGE_KEY = 'bat_url_two';
  var NO_PARSER = 'no_parser';

  // Кольори
  var COLOR_OK = '#1aff00';
  var COLOR_BAD = '#ff2e36';
  var COLOR_WARN = '#f3d900';
  var COLOR_UNKNOWN = '#8c8c8c';

  // Кеш: health 30 сек, search 15 хв
  var cache = {
    data: {},
    ttlHealth: 30 * 1000,
    ttlSearch: 15 * 60 * 1000,
    get: function (key) {
      var v = this.data[key];
      if (v && Date.now() < v.expiresAt) return v;
      return null;
    },
    set: function (key, value, ttl) {
      this.data[key] = { value: value, expiresAt: Date.now() + ttl };
    }
  };

  function notifyDone() {
    var text = Lampa.Lang.translate('bat_check_done');
    try {
      if (Lampa.Noty && typeof Lampa.Noty.show === 'function') {
        Lampa.Noty.show(text);
        return;
      }
      if (Lampa.Toast && typeof Lampa.Toast.show === 'function') {
        Lampa.Toast.show(text);
        return;
      }
    } catch (e) {}
    alert(text);
  }

  function getSelectedBase() {
    return Lampa.Storage.get(STORAGE_KEY, NO_PARSER);
  }

  function getParserByBase(base) {
    return parsersInfo.find(function (p) { return p.base === base; });
  }

  function applySelectedParser(base) {
    if (!base || base === NO_PARSER) return false;

    var p = getParserByBase(base);
    if (!p || !p.settings) return false;

    var settings = p.settings;
    var type = settings.parser_torrent_type || 'jackett';

    Lampa.Storage.set(type === 'prowlarr' ? 'prowlarr_url' : 'jackett_url', settings.url);
    Lampa.Storage.set(type === 'prowlarr' ? 'prowlarr_key' : 'jackett_key', settings.key || '');
    Lampa.Storage.set('parser_torrent_type', type);

    return true;
  }

  function updateSelectedLabelInSettings() {
    var base = getSelectedBase();
    var parser = getParserByBase(base);
    var name = parser ? parser.name : Lampa.Lang.translate('bat_parser_none');
    var text = Lampa.Lang.translate('bat_parser_selected_label') + " " + name;
    $('.bat-parser-selected').text(text);
  }

  // Протоколи: якщо протокол вже заданий у url — лише ""
  function protocolCandidatesFor(url) {
    if (/^https?:\/\//i.test(url)) return [''];
    return ['https://', 'http://']; // спочатку https
  }

  // Послідовно пробуємо URL і повертаємо перший результат:
  // - ok=true для 2xx
  // - ok=false, network=false якщо server відповів кодом (401/403/404/500…)
  // - ok=false, network=true якщо status 0/timeout на всіх спробах
  function ajaxTryUrls(urls, timeout) {
    return new Promise(function (resolve) {
      var idx = 0;

      function attempt() {
        if (idx >= urls.length) {
          resolve({ ok: false, xhr: null, url: null, network: true });
          return;
        }

        var url = urls[idx++];
        $.ajax({
          url: url,
          method: 'GET',
          timeout: timeout,
          success: function (data, textStatus, xhr) {
            resolve({ ok: true, xhr: xhr, url: url, data: data });
          },
          error: function (xhr) {
            var status = xhr && typeof xhr.status === 'number' ? xhr.status : 0;
            var isNetwork = (status === 0);
            if (isNetwork) attempt();
            else resolve({ ok: false, xhr: xhr, url: url, network: false });
          }
        });
      }

      attempt();
    });
  }

  /* =========================
   * 4) Перевірки
   * ========================= */

  // HEALTH candidates
  function healthUrlCandidates(parser) {
    var key = encodeURIComponent(parser.settings.key || '');
    var type = parser.settings.parser_torrent_type || 'jackett';

    var path = (type === 'prowlarr')
      ? '/api/v1/health?apikey=' + key
      : '/api/v2.0/indexers/status:healthy/results?apikey=' + key;

    var url = parser.settings.url;
    var protos = protocolCandidatesFor(url);

    return protos.map(function (p) { return p + url + path; });
  }

  // HEALTH 3-статуси:
  // - OK (зелений): 2xx (endpoint реально відпрацював)
  // - WARN (жовтий): сервер відповів HTTP, але не 2xx (401/403/404/5xx) -> “сервер відповідає, але є проблема”
  // - BAD (червоний): network/timeout (status 0) -> сервер недоступний
  function runHealthChecks(parsers) {
    var map = {}; // base -> {color,labelKey}

    var requests = parsers.map(function (parser) {
      return new Promise(function (resolve) {
        var urls = healthUrlCandidates(parser);
        var cacheKey = 'health::' + parser.base + '::' + urls.join('|');
        var cached = cache.get(cacheKey);

        if (cached) {
          map[parser.base] = cached.value;
          resolve();
          return;
        }

        ajaxTryUrls(urls, 5000).then(function (res) {
          var val;

          if (res.ok) {
            val = { color: COLOR_OK, labelKey: 'bat_status_server_ok' };
          } else if (res.network === false) {
            val = { color: COLOR_WARN, labelKey: 'bat_status_server_warn' };
          } else {
            val = { color: COLOR_BAD, labelKey: 'bat_status_server_bad' };
          }

          map[parser.base] = val;
          cache.set(cacheKey, val, cache.ttlHealth);
          resolve();
        });
      });
    });

    return Promise.all(requests).then(function () { return map; });
  }

  // SEARCH candidates (2 стани)
  function deepSearchUrlCandidates(parser, query) {
    var key = encodeURIComponent(parser.settings.key || '');
    var q = encodeURIComponent(query);

    var path =
      '/api/v2.0/indexers/all/results' +
      '?apikey=' + key +
      '&Query=' + q +
      '&Category=2000';

    var url = parser.settings.url;
    var protos = protocolCandidatesFor(url);

    return protos.map(function (p) { return p + url + path; });
  }

  function runDeepSearchChecks(parsers) {
    var map = {}; // base -> {color,labelKey}

    var SAFE_QUERIES = ['1080p', 'bluray', 'x264', '2022'];
    var query = SAFE_QUERIES[Math.floor(Math.random() * SAFE_QUERIES.length)];

    var requests = parsers.map(function (parser) {
      return new Promise(function (resolve) {
        var urls = deepSearchUrlCandidates(parser, query);
        var cacheKey = 'search::' + parser.base;
        var cached = cache.get(cacheKey);

        if (cached) {
          map[parser.base] = cached.value;
          resolve();
          return;
        }

        ajaxTryUrls(urls, 6000).then(function (res) {
          var val = res.ok
            ? { color: COLOR_OK, labelKey: 'bat_status_search_ok' }
            : { color: COLOR_BAD, labelKey: 'bat_status_search_bad' };

          map[parser.base] = val;
          cache.set(cacheKey, val, cache.ttlSearch);
          resolve();
        });
      });
    });

    return Promise.all(requests).then(function () { return map; });
  }

  /* =========================
   * 5) Модалка (UI) + “лампочка”
   * ========================= */

  function injectStyleOnce() {
    if (window.__bat_parser_modal_style__) return;
    window.__bat_parser_modal_style__ = true;

    var css =
      ".bat-parser-modal{display:flex;flex-direction:column;gap:1em}" +
      ".bat-parser-modal__head{display:flex;align-items:center;justify-content:space-between;gap:1em}" +
      ".bat-parser-modal__current-label{font-size:.9em;opacity:.7}" +
      ".bat-parser-modal__current-value{font-size:1.1em}" +

      ".bat-parser-modal__list{display:flex;flex-direction:column;gap:.6em}" +
      ".bat-parser-modal__item{display:flex;align-items:center;justify-content:space-between;gap:1em;padding:.8em 1em;border-radius:.7em;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}" +
      ".bat-parser-modal__item.is-selected,.bat-parser-modal__item.focus{border-color:#fff}" +

      ".bat-parser-modal__left{display:flex;align-items:center;gap:.65em;min-width:0}" +
      ".bat-parser-modal__dot{width:.55em;height:.55em;border-radius:50%;background:" + COLOR_UNKNOWN + ";box-shadow:0 0 .6em rgba(0,0,0,.35);flex:0 0 auto}" +
      ".bat-parser-modal__name{font-size:1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".bat-parser-modal__status{font-size:.85em;opacity:.75;text-align:right;flex:0 0 auto}" +

      ".bat-parser-modal__actions{display:flex;gap:.6em;flex-wrap:wrap}" +
      ".bat-parser-modal__action{padding:.55em .9em;border-radius:.6em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2)}" +
      ".bat-parser-modal__action.focus{border-color:#fff}";

    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function buildParserItem(base, name) {
    var item = $(
      "<div class='bat-parser-modal__item selector' data-base='" + base + "'>" +
        "<div class='bat-parser-modal__left'>" +
          "<span class='bat-parser-modal__dot'></span>" +
          "<div class='bat-parser-modal__name'></div>" +
        "</div>" +
        "<div class='bat-parser-modal__status'></div>" +
      "</div>"
    );

    item.find('.bat-parser-modal__name').text(name);
    item.find('.bat-parser-modal__status').text(Lampa.Lang.translate('bat_status_unknown'));
    item.find('.bat-parser-modal__dot').css('background-color', COLOR_UNKNOWN);

    return item;
  }

  function setItemStatus(item, color, labelKey) {
    item.find('.bat-parser-modal__dot').css('background-color', color);
    item.find('.bat-parser-modal__status').text(Lampa.Lang.translate(labelKey));
  }

  function applySelection(list, base) {
    list.find('.bat-parser-modal__item').removeClass('is-selected');
    list.find("[data-base='" + base + "']").addClass('is-selected');
  }

  function updateCurrentLabel(wrapper, base) {
    var parser = getParserByBase(base);
    var label = parser ? parser.name : Lampa.Lang.translate('bat_parser_none');
    wrapper.find('.bat-parser-modal__current-value').text(label);
  }

  function openParserModal() {
    injectStyleOnce();

    var selected = getSelectedBase();

    var modal = $(
      "<div class='bat-parser-modal'>" +
        "<div class='bat-parser-modal__head'>" +
          "<div class='bat-parser-modal__current'>" +
            "<div class='bat-parser-modal__current-label'></div>" +
            "<div class='bat-parser-modal__current-value'></div>" +
          "</div>" +
        "</div>" +
        "<div class='bat-parser-modal__list'></div>" +
        "<div class='bat-parser-modal__actions'></div>" +
      "</div>"
    );

    modal.find('.bat-parser-modal__current-label').text(Lampa.Lang.translate('bat_parser_current'));
    updateCurrentLabel(modal, selected);

    var list = modal.find('.bat-parser-modal__list');

    // "Не вибрано"
    var noneItem = buildParserItem(NO_PARSER, Lampa.Lang.translate('bat_parser_none'));
    noneItem.on('hover:enter', function () {
      Lampa.Storage.set(STORAGE_KEY, NO_PARSER);
      applySelection(list, NO_PARSER);
      updateCurrentLabel(modal, NO_PARSER);
      updateSelectedLabelInSettings();
    });
    list.append(noneItem);

    // Парсери
    parsersInfo.forEach(function (p) {
      var item = buildParserItem(p.base, p.name);

      item.on('hover:enter', function () {
        Lampa.Storage.set(STORAGE_KEY, p.base);
        applySelectedParser(p.base);
        applySelection(list, p.base);
        updateCurrentLabel(modal, p.base);
        updateSelectedLabelInSettings();
      });

      list.append(item);
    });

    applySelection(list, selected);

    // Кнопки
    var actions = modal.find('.bat-parser-modal__actions');

    var btnHealth = $("<div class='bat-parser-modal__action selector'></div>");
    btnHealth.text(Lampa.Lang.translate('bat_check_parsers'));

    var btnSearch = $("<div class='bat-parser-modal__action selector'></div>");
    btnSearch.text(Lampa.Lang.translate('bat_check_search'));

    actions.append(btnHealth).append(btnSearch);

    function applyMapToList(statusMap) {
      list.find('.bat-parser-modal__item').each(function () {
        var it = $(this);
        var base = it.data('base');

        if (base === NO_PARSER) {
          setItemStatus(it, COLOR_UNKNOWN, 'bat_status_unknown');
          return;
        }

        var st = statusMap[base];
        if (!st) {
          setItemStatus(it, COLOR_UNKNOWN, 'bat_status_unknown');
          return;
        }

        setItemStatus(it, st.color, st.labelKey);
      });
    }

    // HEALTH UI
    function runHealthUI() {
      list.find('.bat-parser-modal__item').each(function () {
        var it = $(this);
        var base = it.data('base');
        if (base === NO_PARSER) setItemStatus(it, COLOR_UNKNOWN, 'bat_status_unknown');
        else setItemStatus(it, COLOR_WARN, 'bat_status_checking_server');
      });

      return runHealthChecks(parsersInfo).then(function (map) {
        applyMapToList(map);
        notifyDone();
      });
    }

    // SEARCH UI (для всіх)
    function runSearchUI() {
      list.find('.bat-parser-modal__item').each(function () {
        var it = $(this);
        var base = it.data('base');
        if (base === NO_PARSER) return;
        setItemStatus(it, COLOR_WARN, 'bat_status_checking_search');
      });

      return runDeepSearchChecks(parsersInfo).then(function (map) {
        applyMapToList(map);
        notifyDone();
      });
    }

    btnHealth.on('hover:enter', function () {
      runHealthUI();
    });

    btnSearch.on('hover:enter', function () {
      runSearchUI();
    });

    // Відкрити модалку
    var firstSelectable = list.find('.bat-parser-modal__item').first();

    Lampa.Modal.open({
      title: Lampa.Lang.translate('bat_parser'),
      html: modal,
      size: 'medium',
      scroll_to_center: true,
      select: firstSelectable,
      onBack: function () {
        Lampa.Modal.close();
        Lampa.Controller.toggle('settings_component');
      }
    });

    // Авто: тільки HEALTH при відкритті
    runHealthUI();
  }

  /* =========================
   * 6) Інтеграція в Налаштування → Парсер
   * ========================= */
  function parserSetting() {
    applySelectedParser(getSelectedBase());

    Lampa.SettingsApi.addParam({
      component: 'parser',
      param: { name: 'bat_parser_manage', type: 'button' },
      field: {
        name: Lampa.Lang.translate('bat_parser'),
        description:
          Lampa.Lang.translate('bat_parser_description') + " " + parsersInfo.length +
          "<div class='bat-parser-selected' style='margin-top:.35em;opacity:.85'></div>"
      },
      onChange: function () {
        openParserModal();
      },
      onRender: function (item) {
        setTimeout(function () {
          if (Lampa.Storage.field('parser_use')) item.show();
          else item.hide();

          // жовтий колір
          $('.settings-param__name', item).css('color', COLOR_WARN);

          updateSelectedLabelInSettings();

          var parserUse = $('div[data-name="parser_use"]').first();
          if (parserUse.length) item.insertAfter(parserUse);
        });
      }
    });
  }

  var Parser = { parserSetting: parserSetting };

  /* =========================
   * 7) Запуск плагіна
   * ========================= */
  Lampa.Platform.tv();

  function add() {
    Lang.translate();
    Parser.parserSetting();
  }

  function startPlugin() {
    window.plugin_batpublictorr_ready = true;

    if (window.appready) add();
    else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') add();
      });
    }
  }

  if (!window.plugin_batpublictorr_ready) startPlugin();


})();
