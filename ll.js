(function () {
  'use strict';

  if (window.local_lists_plugin_ready) return;
  window.local_lists_plugin_ready = true;

  var STORAGE_KEY = 'local_lists_data';
  var GIST_TOKEN_KEY = 'local_lists_github_token';
  var GIST_ID_KEY = 'local_lists_gist_id';
  var TRANSPARENT_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  // ── Іконки SVG ────────────────────────────────────────────────────────
  var ICON_SETTINGS = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
  var ICON_KEY = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  var ICON_UP = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
  var ICON_DOWN = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  var ICON_CHECKED = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect><polyline points="7 12 11 16 17 8"></polyline></svg>';
  var ICON_UNCHECKED = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" ry="3" opacity="0.4"></rect></svg>';
  var ICON_STAR_SVG = '<svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.6162 7.10981L15.8464 7.55198L16.3381 7.63428L22.2841 8.62965C22.8678 8.72736 23.0999 9.44167 22.6851 9.86381L18.4598 14.1641L18.1104 14.5196L18.184 15.0127L19.0748 20.9752C19.1622 21.5606 18.5546 22.002 18.025 21.738L12.6295 19.0483L12.1833 18.8259L11.7372 19.0483L6.34171 21.738C5.81206 22.002 5.20443 21.5606 5.29187 20.9752L6.18264 15.0127L6.25629 14.5196L5.9069 14.1641L1.68155 9.86381C1.26677 9.44167 1.49886 8.72736 2.08255 8.62965L8.02855 7.63428L8.52022 7.55198L8.75043 7.10981L11.5345 1.76241C11.8078 1.23748 12.5589 1.23748 12.8322 1.76241L15.6162 7.10981Z" stroke="currentColor" stroke-width="2.2"></path></svg>';

  function addLang() {
    if (!Lampa.Lang || !Lampa.Lang.add) return;
    Lampa.Lang.add({
      settings_local_lists_settings: { uk: 'Налаштування списків', ru: 'Настройки списков', en: 'Lists Settings' },
      local_lists_title: { uk: 'Мої списки', ru: 'Мои списки', en: 'My Lists' },
      local_lists_button: { uk: 'Списки', ru: 'Списки', en: 'Lists' },
      local_lists_settings: { uk: 'Налаштування списків', ru: 'Настройки списков', en: 'Lists Settings' },
      local_lists_github_auth: { uk: 'GitHub Token', ru: 'GitHub Token', en: 'GitHub Token' },
      local_lists_no_token: { 
        uk: 'Спочатку потрібна авторизація (вкажіть GitHub Token)', 
        ru: 'Сначала требуется авторизация (укажите GitHub Token)', 
        en: 'Authorization required first (specify GitHub Token)' 
      },
      local_lists_cloud_backup: { uk: 'Синхронізувати з хмарою (списки + вибране)', ru: 'Синхронизировать с облаком (списки + избранное)', en: 'Sync with Cloud (lists + favorites)' },
      local_lists_cloud_overwrite: { uk: 'Перезаписати списки в хмарі', ru: 'Перезаписать списки в облаке', en: 'Overwrite lists in Cloud' },
      local_lists_cloud_overwrite_confirm: { uk: 'Перезаписати хмару поточними списками та закладками?', ru: 'Перезаписать облако текущими списками и закладками?', en: 'Overwrite cloud with current lists and favorites?' },
      local_lists_cloud_overwritten: { uk: 'Дані в хмарі успішно перезаписано', ru: 'Данные в облаке успешно перезаписаны', en: 'Cloud data successfully overwritten' },
      local_lists_cloud_restore: { uk: 'Відновити з хмари', ru: 'Восстановить из облака', en: 'Restore from Cloud' },
      local_lists_cloud_restore_confirm: { uk: 'Замінити локальні списки та закладки даними з хмари?', ru: 'Заменить локальные списки и закладки данными из облака?', en: 'Replace local lists and favorites with cloud data?' },
      local_lists_cloud_restored: { uk: 'Дані з хмари успішно відновлено', ru: 'Данные из облака успешно восстановлены', en: 'Data successfully restored from cloud' },
      local_lists_create: { uk: 'Створити список', ru: 'Создать список', en: 'Create list' },
      local_lists_new_name: { uk: 'Назва списку', ru: 'Название списка', en: 'List name' },
      local_lists_added: { uk: 'Додано', ru: 'Добавлено', en: 'Added' },
      local_lists_removed: { uk: 'Вилучено', ru: 'Удалено', en: 'Removed' },
      local_lists_remove_item: { uk: 'Вилучити список', ru: 'Удалить список', en: 'Remove list' },
      local_lists_remove_card: { uk: 'Вилучити фільм', ru: 'Удалить фильм', en: 'Remove movie' },
      local_lists_import_trakt: { uk: 'Імпорт з Trakt.tv', ru: 'Импорт с Trakt.tv', en: 'Import from Trakt.tv' },
      local_lists_import_pick_file: { uk: 'Оберіть ZIP-архів експорту Trakt.tv', ru: 'Выберите ZIP-архив экспорта Trakt.tv', en: 'Select Trakt.tv export ZIP' },
      local_lists_import_reading: { uk: 'Читаю архів…', ru: 'Читаю архив…', en: 'Reading archive…' },
      local_lists_import_progress: { uk: 'Імпортую списки…', ru: 'Импортирую списки…', en: 'Importing lists…' },
      local_lists_import_done: { uk: 'Імпорт завершено', ru: 'Импорт завершён', en: 'Import complete' },
      local_lists_import_error: { uk: 'Не вдалося прочитати архів', ru: 'Не удалось прочитать архив', en: 'Failed to read archive' },
      local_lists_import_no_lists: { uk: 'У архіві не знайдено файл lists-lists.json', ru: 'В архиве не найден файл lists-lists.json', en: 'lists-lists.json not found in archive' },
      local_lists_edit_menu: { uk: 'Редагувати списки', ru: 'Редактировать списки', en: 'Edit Lists' }
    });
  }

  function tr(key) { return (Lampa.Lang && Lampa.Lang.translate) ? Lampa.Lang.translate(key) : key; }

  function escapeHtml(str) {
    return (str == null ? '' : String(str))
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isPerson(data) {
    return !!data && !!(data.profile_path || data.known_for_department || typeof data.gender !== 'undefined');
  }

  function resolvePoster(path) {
    if (!path) return './img/img_broken.svg';
    if (path.indexOf('http') === 0) return path;
    return 'https://image.tmdb.org/t/p/w300' + path;
  }

  function normalizeCard(raw) {
    var source = raw.movie || raw.card || raw.data || raw || {};
    var poster = source.poster_path || source.img || '';
    var idNum = isNaN(source.id) ? source.id : parseInt(source.id, 10);
    return {
      id: idNum,
      method: source.method || (source.first_air_date ? 'tv' : 'movie'),
      title: source.title || source.name || '',
      poster_path: poster,
      img: resolvePoster(poster),
      release_date: source.release_date || source.first_air_date || ''
    };
  }

  // ── Автоматична нормалізація структури закладок під двигун Lampa ──────
  function normalizeFavorite(rawFav) {
    if (!rawFav || typeof rawFav !== 'object') return { card: [] };

    var norm = {
      card: [],
      book: [],
      like: [],
      history: [],
      look: [],
      continued: [],
      viewed: [],
      scheduled: [],
      thrown: []
    };

    var cardMap = {};

    // 1. Збираємо існуючий масив card, якщо він є
    if (Array.isArray(rawFav.card)) {
      rawFav.card.forEach(function (c) {
        if (c && c.id != null) {
          var n = normalizeCard(c);
          cardMap[String(n.id)] = n;
        }
      });
    }

    // 2. Скануємо абсолютно всі гілки (like, book, history і т.д.)
    Object.keys(rawFav).forEach(function (key) {
      if (key === 'card') return;

      var val = rawFav[key];
      if (!Array.isArray(val)) {
        norm[key] = val;
        return;
      }

      norm[key] = [];

      val.forEach(function (item) {
        if (!item) return;

        if (typeof item === 'object' && item.id != null) {
          // Якщо всередині гілки лежить повна картка — витягуємо її в cardMap
          var n = normalizeCard(item);
          if (!cardMap[String(n.id)]) {
            cardMap[String(n.id)] = n;
          }
          if (norm[key].indexOf(n.id) === -1) {
            norm[key].push(n.id);
          }
        } else {
          // Якщо це вже числовий ID
          var idNum = isNaN(item) ? item : parseInt(item, 10);
          if (norm[key].indexOf(idNum) === -1) {
            norm[key].push(idNum);
          }
        }
      });
    });

    // 3. Формуємо обов'язковий системний масив norm.card
    for (var k in cardMap) {
      norm.card.push(cardMap[k]);
    }

    return norm;
  }

  function countFavCards(fav) {
    if (!fav || typeof fav !== 'object') return 0;
    if (Array.isArray(fav.card) && fav.card.length) return fav.card.length;
    var total = 0;
    for (var k in fav) {
      if (Array.isArray(fav[k])) total += fav[k].length;
    }
    return total;
  }

  function getNativeFavorites() {
    var fav = null;

    try {
      if (Lampa.Favorite && typeof Lampa.Favorite.all === 'function') {
        var mem = Lampa.Favorite.all();
        if (mem && typeof mem === 'object' && Object.keys(mem).length > 0) {
          fav = JSON.parse(JSON.stringify(mem));
        }
      }
    } catch (e) {}

    if (!fav || Object.keys(fav).length === 0) {
      var sFav = Lampa.Storage.get('favorite', null);
      if (typeof sFav === 'string') {
        try { sFav = JSON.parse(sFav); } catch (e) {}
      }
      if (sFav && typeof sFav === 'object' && Object.keys(sFav).length > 0) {
        fav = sFav;
      }
    }

    if (!fav || Object.keys(fav).length === 0) {
      var sFav2 = Lampa.Storage.get('fav', null);
      if (typeof sFav2 === 'string') {
        try { sFav2 = JSON.parse(sFav2); } catch (e) {}
      }
      if (sFav2 && typeof sFav2 === 'object' && Object.keys(sFav2).length > 0) {
        fav = sFav2;
      }
    }

    return normalizeFavorite(fav);
  }

  function updateNativeFavorites(fav) {
    if (!fav || typeof fav !== 'object') return;
    var normalized = normalizeFavorite(fav);

    // 1. Оновлюємо оперативну пам'ять Lampa
    try {
      if (Lampa.Favorite && typeof Lampa.Favorite.all === 'function') {
        var inMem = Lampa.Favorite.all();
        if (inMem && typeof inMem === 'object') {
          for (var k in inMem) {
            if (Object.prototype.hasOwnProperty.call(inMem, k)) delete inMem[k];
          }
          for (var key in normalized) {
            if (Object.prototype.hasOwnProperty.call(normalized, key)) inMem[key] = normalized[key];
          }
        }
      }
    } catch (e) {}

    // 2. Зберігаємо у сховище обидва ключі у нормалізованому вигляді
    Lampa.Storage.set('favorite', normalized);
    Lampa.Storage.set('fav', normalized);

    // 3. Зберігаємо стан через нативні методи Lampa
    try {
      if (Lampa.Favorite && typeof Lampa.Favorite.save === 'function') {
        Lampa.Favorite.save();
      }
      if (Lampa.Favorite && typeof Lampa.Favorite.init === 'function') {
        Lampa.Favorite.init();
      }
      if (Lampa.Favorite && Lampa.Favorite.listener && typeof Lampa.Favorite.listener.send === 'function') {
        Lampa.Favorite.listener.send('update', { type: 'all' });
      }
    } catch (e) {}
  }

  var Lists = {
    getAll: function () { return Lampa.Storage.get(STORAGE_KEY, []); },
    getVisible: function () {
      return this.getAll().filter(function (l) { return !l.hidden; });
    },
    save: function (l) { Lampa.Storage.set(STORAGE_KEY, l); },
    get: function (id) { return this.getAll().filter(function(l){ return l.id === id; })[0]; },
    create: function (name) {
      var l = this.getAll();
      var newList = { id: 'list_' + Date.now(), name: name, hidden: false, items: [] };
      l.push(newList); this.save(l); return newList;
    },
    remove: function (id) { 
      this.save(this.getAll().filter(function(l){ return l.id !== id; })); 
    },
    addItem: function (listId, card) {
      if (!card || card.id == null) return;
      var l = this.getAll();
      var list = l.filter(function(i){ return i.id === listId; })[0];
      if (!list) return;
      var n = normalizeCard(card);
      if (list.items.some(function(i){ return String(i.id) === String(n.id); })) return;
      list.items.push(n); 
      this.save(l);
    },
    removeItem: function (listId, itemId) {
      if (itemId == null) return;
      var l = this.getAll();
      var list = l.filter(function(i){ return i.id === listId; })[0];
      if (!list) return;
      list.items = list.items.filter(function(i){ return String(i.id) !== String(itemId); });
      this.save(l);
    },
    isCardInAny: function (id) {
      if (id == null) return false;
      var all = this.getAll();
      for (var i = 0; i < all.length; i++) {
        if (all[i].items && all[i].items.some(function (it) { return String(it.id) === String(id); })) {
          return true;
        }
      }
      return false;
    }
  };

  function refreshCardIcon(object) {
    if (!object || !object.card || !object.data || isPerson(object.data)) return;
    var $iconHolder = $('.card__icons-inner', object.card);
    if (!$iconHolder.length) return;

    var id = object.data.id;
    var inList = Lists.isCardInAny(id);

    var $starIcon = $('.icon--star', $iconHolder);
    var hasIcon = $starIcon.length !== 0;
    var hasHiddenIcon = hasIcon && $starIcon.hasClass('hide');

    if (inList) {
      if (!hasIcon) {
        $iconHolder.prepend(Lampa.Template.get('local-lists-star-icon'));
      } else if (hasHiddenIcon) {
        $starIcon.removeClass('hide');
      }
    } else {
      if (hasIcon && !hasHiddenIcon) {
        $starIcon.addClass('hide');
      }
    }
  }

  function getActiveCard() {
    var active = Lampa.Activity.active();
    if (active) {
      if (active.card) return active.card;
      if (active.activity && active.activity.card) return active.activity.card;
    }
    return null;
  }

  function refreshBookmarkIcon() {
    var card = getActiveCard();
    if (!card) return;

    var inList = Lists.isCardInAny(card.id);
    var favStates = inList ? {} : (Lampa.Favorite ? Lampa.Favorite.check(card) : {});
    var anyFavorite = inList || Object.keys(favStates).filter(function (favType) {
      return favType !== 'history' && favType !== 'any';
    }).some(function (favType) {
      return !!favStates[favType];
    });

    var active = Lampa.Activity.active();
    if (active && active.activity) {
      var $svg = $(".button--book svg path", active.activity.render());
      if (anyFavorite) {
        $svg.attr('fill', 'currentColor');
      } else {
        $svg.attr('fill', 'transparent');
      }
    }
  }

  // ── Smart Merge ────────────────────────────────────────────────────────
  function mergeCardItems(localItems, remoteItems) {
    localItems = Array.isArray(localItems) ? localItems : [];
    remoteItems = Array.isArray(remoteItems) ? remoteItems : [];
    var map = {};
    var res = [];

    remoteItems.concat(localItems).forEach(function (item) {
      if (!item || item.id == null) return;
      var key = String(item.id);
      if (!map[key]) {
        map[key] = Object.assign({}, item);
        res.push(map[key]);
      } else {
        Object.assign(map[key], item);
      }
    });

    return res;
  }

  function mergeLists(localLists, remoteLists) {
    localLists = Array.isArray(localLists) ? localLists : [];
    remoteLists = Array.isArray(remoteLists) ? remoteLists : [];
    var result = [];
    var matchedRemoteIndices = {};

    localLists.forEach(function (locList) {
      var rIndex = -1;
      for (var i = 0; i < remoteLists.length; i++) {
        if (matchedRemoteIndices[i]) continue;
        var r = remoteLists[i];
        if (r.id === locList.id || (r.name && locList.name && r.name.trim().toLowerCase() === locList.name.trim().toLowerCase())) {
          rIndex = i;
          break;
        }
      }

      if (rIndex !== -1) {
        matchedRemoteIndices[rIndex] = true;
        var remList = remoteLists[rIndex];
        result.push({
          id: locList.id || remList.id,
          name: locList.name || remList.name,
          hidden: locList.hidden !== undefined ? locList.hidden : (remList.hidden || false),
          items: mergeCardItems(locList.items, remList.items)
        });
      } else {
        result.push(locList);
      }
    });

    remoteLists.forEach(function (remList, idx) {
      if (!matchedRemoteIndices[idx]) {
        result.push(remList);
      }
    });

    return result;
  }

  function mergeFavorites(localFav, remoteFav) {
    var normL = normalizeFavorite(localFav);
    var normR = normalizeFavorite(remoteFav);

    var cardMap = {};
    var mergedCards = [];

    // 1. Об'єднуємо всі картки фільмів
    normR.card.concat(normL.card).forEach(function (c) {
      if (!c || c.id == null) return;
      var key = String(c.id);
      if (!cardMap[key]) {
        cardMap[key] = Object.assign({}, c);
        mergedCards.push(cardMap[key]);
      } else {
        Object.assign(cardMap[key], c);
      }
    });

    var merged = {
      card: mergedCards
    };

    var allKeys = Object.keys(normL).concat(Object.keys(normR));
    var processed = {};

    // 2. Об'єднуємо ID у категоріях
    allKeys.forEach(function (key) {
      if (key === 'card' || processed[key]) return;
      processed[key] = true;

      var arrL = Array.isArray(normL[key]) ? normL[key] : [];
      var arrR = Array.isArray(normR[key]) ? normR[key] : [];

      var idMap = {};
      var list = [];

      arrR.concat(arrL).forEach(function (id) {
        if (id == null) return;
        var sId = String(id);
        if (!idMap[sId]) {
          idMap[sId] = true;
          list.push(isNaN(id) ? id : parseInt(id, 10));
        }
      });

      merged[key] = list;
    });

    return merged;
  }

  // ── GitHub Cloud ───────────────────────────────────────────────────────
  var Cloud = {
    checkAuth: function () {
      var token = (Lampa.Storage.get(GIST_TOKEN_KEY, '') || '').trim();
      if (!token) {
        Lampa.Noty.show(tr('local_lists_no_token'));
        return false;
      }
      return token;
    },

    request: function (method, url, data, callback, errorCallback) {
      var token = this.checkAuth();
      if (!token) {
        Lampa.Loading.stop();
        return;
      }

      $.ajax({
        url: url,
        method: method,
        headers: {
          'Authorization': 'token ' + token,
          'Accept': 'application/vnd.github.v3+json'
        },
        data: data ? JSON.stringify(data) : null,
        success: callback,
        error: function (xhr) {
          if (errorCallback) {
            errorCallback(xhr);
          } else {
            Lampa.Loading.stop();
            Lampa.Noty.show('GitHub Error (' + (xhr ? xhr.status : 'unknown') + ')');
          }
        }
      });
    },

    getGist: function (callback) {
      var _this = this;
      var id = Lampa.Storage.get(GIST_ID_KEY, '');

      if (id) {
        this.request('GET', 'https://api.github.com/gists/' + id, null, function (res) {
          callback(res);
        }, function (xhr) {
          if (xhr && xhr.status === 404) {
            Lampa.Storage.set(GIST_ID_KEY, '');
            _this.findGist(callback);
          } else {
            Lampa.Loading.stop();
            Lampa.Noty.show('GitHub Error');
          }
        });
      } else {
        this.findGist(callback);
      }
    },

    findGist: function (callback) {
      var _this = this;
      this.request('GET', 'https://api.github.com/gists?per_page=100', null, function (res) {
        if (Array.isArray(res)) {
          var found = res.filter(function (g) {
            return g.files && (
              g.files['lampa_local_lists.json'] || 
              g.files['lampa_native_favorite.json'] || 
              g.files['local_lists_data.json']
            );
          })[0];
          if (found) {
            Lampa.Storage.set(GIST_ID_KEY, found.id);
            _this.request('GET', 'https://api.github.com/gists/' + found.id, null, callback);
            return;
          }
        }
        callback(null);
      });
    },

    backup: function () {
      if (!this.checkAuth()) return;

      var _this = this;
      Lampa.Loading.start();

      this.getGist(function (gist) {
        var remoteLists = [];
        var remoteFav = {};

        if (gist && gist.files) {
          var fLists = gist.files['lampa_local_lists.json'] || gist.files['local_lists_data.json'];
          if (fLists) {
            try { 
              var parsed = JSON.parse(fLists.content);
              if (parsed && parsed.ll_data) {
                remoteLists = parsed.ll_data;
                if (parsed.lampa_fav && !gist.files['lampa_native_favorite.json']) {
                  remoteFav = parsed.lampa_fav;
                }
              } else if (Array.isArray(parsed)) {
                remoteLists = parsed;
              }
            } catch (e) {}
          }
          if (gist.files['lampa_native_favorite.json']) {
            try { remoteFav = JSON.parse(gist.files['lampa_native_favorite.json'].content); } catch (e) {}
          }
        }

        var localFav = getNativeFavorites();
        var mergedLists = mergeLists(Lists.getAll(), remoteLists);
        var mergedFav = mergeFavorites(localFav, remoteFav);

        Lists.save(mergedLists);
        updateNativeFavorites(mergedFav);

        var data = {
          description: 'Lampa Local Lists & Favorites Sync',
          files: {
            'lampa_local_lists.json': { content: JSON.stringify(mergedLists, null, 2) },
            'lampa_native_favorite.json': { content: JSON.stringify(mergedFav, null, 2) }
          }
        };

        var gistId = gist ? gist.id : Lampa.Storage.get(GIST_ID_KEY, '');

        _this.request(
          gistId ? 'PATCH' : 'POST',
          gistId ? 'https://api.github.com/gists/' + gistId : 'https://api.github.com/gists',
          data,
          function (res) {
            Lampa.Storage.set(GIST_ID_KEY, res.id);
            Lampa.Loading.stop();
            Lampa.Noty.show('Синхронізовано: списків — ' + mergedLists.length + ', закладок — ' + countFavCards(mergedFav));

            var cur = Lampa.Activity.active();
            if (cur && (cur.component === 'bookmarks' || cur.component === 'local_lists_root')) {
              Lampa.Activity.replace();
            }
          }
        );
      });
    },

    overwrite: function () {
      if (!this.checkAuth()) return;

      var _this = this;
      var curController = (Lampa.Controller.enabled && Lampa.Controller.enabled()) ? Lampa.Controller.enabled().name : 'settings';

      Lampa.Select.show({
        title: tr('local_lists_cloud_overwrite_confirm'),
        items: [
          { title: (Lampa.Lang && Lampa.Lang.translate('settings_param_yes')) || 'Так', id: 'yes' },
          { title: (Lampa.Lang && Lampa.Lang.translate('settings_param_no')) || 'Ні', id: 'no' }
        ],
        onSelect: function (a) {
          if (a.id === 'yes') {
            Lampa.Loading.start();

            var currentLists = Lists.getAll();
            var currentFav = getNativeFavorites();

            var data = {
              description: 'Lampa Local Lists & Favorites Sync',
              files: {
                'lampa_local_lists.json': { content: JSON.stringify(currentLists, null, 2) },
                'lampa_native_favorite.json': { content: JSON.stringify(currentFav, null, 2) }
              }
            };

            _this.getGist(function (gist) {
              var gistId = gist ? gist.id : Lampa.Storage.get(GIST_ID_KEY, '');

              _this.request(
                gistId ? 'PATCH' : 'POST',
                gistId ? 'https://api.github.com/gists/' + gistId : 'https://api.github.com/gists',
                data,
                function (res) {
                  Lampa.Storage.set(GIST_ID_KEY, res.id);
                  Lampa.Loading.stop();
                  Lampa.Noty.show(tr('local_lists_cloud_overwritten') + ' (закладок: ' + countFavCards(currentFav) + ')');
                }
              );
            });
          }
          Lampa.Controller.toggle(curController);
        },
        onBack: function () {
          Lampa.Controller.toggle(curController);
        }
      });
    },

    restore: function () {
      if (!this.checkAuth()) return;

      var _this = this;
      var curController = (Lampa.Controller.enabled && Lampa.Controller.enabled()) ? Lampa.Controller.enabled().name : 'settings';

      Lampa.Select.show({
        title: tr('local_lists_cloud_restore_confirm'),
        items: [
          { title: (Lampa.Lang && Lampa.Lang.translate('settings_param_yes')) || 'Так', id: 'yes' },
          { title: (Lampa.Lang && Lampa.Lang.translate('settings_param_no')) || 'Ні', id: 'no' }
        ],
        onSelect: function (a) {
          if (a.id === 'yes') {
            Lampa.Loading.start();

            _this.getGist(function (gist) {
              if (!gist || !gist.files) {
                Lampa.Loading.stop();
                Lampa.Noty.show('Not found');
                return;
              }

              var remoteLists = null;
              var remoteFav = null;

              var fLists = gist.files['lampa_local_lists.json'] || gist.files['local_lists_data.json'];
              if (fLists) {
                try {
                  var parsed = JSON.parse(fLists.content);
                  if (parsed && parsed.ll_data) {
                    remoteLists = parsed.ll_data;
                    if (parsed.lampa_fav && !gist.files['lampa_native_favorite.json']) {
                      remoteFav = parsed.lampa_fav;
                    }
                  } else if (Array.isArray(parsed)) {
                    remoteLists = parsed;
                  }
                } catch (e) {}
              }

              if (gist.files['lampa_native_favorite.json']) {
                try { remoteFav = JSON.parse(gist.files['lampa_native_favorite.json'].content); } catch (e) {}
              }

              if (!remoteLists && !remoteFav) {
                Lampa.Loading.stop();
                Lampa.Noty.show('Invalid backup data');
                return;
              }

              if (Array.isArray(remoteLists)) {
                Lists.save(remoteLists);
              }

              if (remoteFav && typeof remoteFav === 'object') {
                updateNativeFavorites(remoteFav);
              }

              var countLists = Array.isArray(remoteLists) ? remoteLists.length : 0;
              var countFav = countFavCards(remoteFav);

              Lampa.Loading.stop();
              Lampa.Noty.show('Відновлено: списків — ' + countLists + ', закладок — ' + countFav + '. Перезавантаження…');

              setTimeout(function () {
                if (window.location && window.location.reload) {
                  window.location.reload();
                } else if (Lampa.Activity && Lampa.Activity.reload) {
                  Lampa.Activity.reload();
                }
              }, 1600);
            });
          }
          Lampa.Controller.toggle(curController);
        },
        onBack: function () {
          Lampa.Controller.toggle(curController);
        }
      });
    }
  };

  // ── Trakt.tv Import ───────────────────────────────────────────────────
  var TraktImport = {
    _jszipPromise: null,

    ensureJSZip: function () {
      if (window.JSZip) return Promise.resolve();
      if (this._jszipPromise) return this._jszipPromise;
      this._jszipPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        s.onload = function () { resolve(); };
        s.onerror = function () { reject(new Error('JSZip load failed')); };
        document.head.appendChild(s);
      });
      return this._jszipPromise;
    },

    pickFile: function () {
      return new Promise(function (resolve, reject) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip';
        input.style.display = 'none';
        input.addEventListener('change', function () {
          var file = input.files && input.files[0];
          document.body.removeChild(input);
          if (file) resolve(file); else reject(new Error('no file'));
        });
        document.body.appendChild(input);
        input.click();
      });
    },

    readFileAsArrayBuffer: function (file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = function () { reject(reader.error); };
        reader.readAsArrayBuffer(file);
      });
    },

    tmdbFetch: function (id, method) {
      return new Promise(function (resolve) {
        try {
          var path = (method === 'tv' ? 'tv/' : 'movie/') + id;
          var url = Lampa.TMDB.api(path + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'uk'));
          var network = new Lampa.Reguest();
          network.silent(url, function (data) { resolve(data || null); }, function () { resolve(null); });
        } catch (e) { resolve(null); }
      });
    },

    mapLimit: function (items, limit, iterator) {
      return new Promise(function (resolve) {
        var results = new Array(items.length);
        var next = 0, active = 0, done = 0;
        if (!items.length) return resolve(results);
        function runNext() {
          if (done >= items.length) return resolve(results);
          while (active < limit && next < items.length) {
            (function (i) {
              active++; next++;
              iterator(items[i]).then(function (r) {
                results[i] = r; active--; done++; runNext();
              });
            })(next);
          }
        }
        runNext();
      });
    },

    extractItems: function (rawArr) {
      var out = [];
      (rawArr || []).forEach(function (raw) {
        var isMovie = raw.type === 'movie';
        var src = raw.movie || raw.show || {};
        var tmdbId = src.ids && src.ids.tmdb;
        if (!tmdbId) return;
        out.push({
          id: tmdbId,
          method: isMovie ? 'movie' : 'tv',
          title: src.title || '',
          year: src.year || ''
        });
      });
      return out;
    },

    importItemsInto: function (listId, rawItems) {
      var _this = this;
      var items = this.extractItems(rawItems);
      var skipped = rawItems.length - items.length;
      return this.mapLimit(items, 4, function (it) {
        return _this.tmdbFetch(it.id, it.method).then(function (data) {
          var card = {
            id: it.id,
            method: it.method,
            title: (data && (data.title || data.name)) || it.title,
            poster_path: (data && data.poster_path) || '',
            release_date: (data && (data.release_date || data.first_air_date)) || (it.year ? it.year + '-01-01' : '')
          };
          Lists.addItem(listId, card);
        });
      }).then(function () { return { imported: items.length, skipped: skipped }; });
    },

    findOrCreateList: function (name) {
      var existing = Lists.getAll().filter(function (l) { return l.name === name; })[0];
      return existing || Lists.create(name);
    },

    run: function () {
      var _this = this;
      this.pickFile().then(function (file) {
        Lampa.Loading.start();
        Lampa.Noty.show(tr('local_lists_import_reading'));
        return _this.ensureJSZip().then(function () {
          return _this.readFileAsArrayBuffer(file);
        }).then(function (buf) {
          return window.JSZip.loadAsync(buf);
        });
      }).then(function (zip) {
        Lampa.Noty.show(tr('local_lists_import_progress'));
        var jobs = [];

        var listsFile = zip.file('lists-lists.json');
        var metaPromise = listsFile ? listsFile.async('string').then(JSON.parse) : Promise.resolve(null);

        return metaPromise.then(function (metas) {
          if (!metas) {
            Lampa.Loading.stop();
            Lampa.Noty.show(tr('local_lists_import_no_lists'));
            return null;
          }
          metas.forEach(function (meta) {
            var traktId = meta.ids && meta.ids.trakt;
            if (!traktId) return;
            var matches = zip.file(new RegExp('^lists-list-' + traktId + '-'));
            if (!matches.length) return;
            jobs.push(
              matches[0].async('string').then(JSON.parse).then(function (rawItems) {
                var list = _this.findOrCreateList(meta.name);
                return _this.importItemsInto(list.id, rawItems);
              })
            );
          });

          ['lists-watchlist.json', 'lists-favorites.json'].forEach(function (fname, idx) {
            var f = zip.file(fname);
            if (!f) return;
            jobs.push(
              f.async('string').then(JSON.parse).then(function (rawItems) {
                if (!rawItems || !rawItems.length) return { imported: 0, skipped: 0 };
                var name = idx === 0 ? 'Trakt Watchlist' : 'Trakt Favorites';
                var list = _this.findOrCreateList(name);
                return _this.importItemsInto(list.id, rawItems);
              })
            );
          });

          return Promise.all(jobs);
        });
      }).then(function (results) {
        if (!results) return;
        Lampa.Loading.stop();
        var total = results.reduce(function (a, r) { return a + (r ? r.imported : 0); }, 0);
        Lampa.Noty.show(tr('local_lists_import_done') + ': ' + total);
        if (Lampa.Activity.active().component === 'bookmarks' || Lampa.Activity.active().component === 'local_lists_root') {
          Lampa.Activity.replace();
        }
      }).catch(function (e) {
        Lampa.Loading.stop();
        if (e && e.message === 'no file') return;
        Lampa.Noty.show(tr('local_lists_import_error'));
      });
    }
  };

  // ── Компонент редагування (порядок, приховування) ─────────────────────
  function EditListsComponent() {
    var _this = this;
    var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
    var html = $('<div class="local-lists-editor"></div>');
    var body = $('<div class="local-lists-editor__body"></div>');

    this.create = function () {
      this.build();
      return this.render();
    };

    this.build = function (targetFocus) {
      body.empty();
      var lists = Lists.getAll();

      if (lists.length === 0) {
        body.append('<div class="empty__title" style="padding: 3em; text-align: center; opacity: 0.5;">' + (tr('empty_title') || 'Порожньо') + '</div>');
      }

      lists.forEach(function (list, index) {
        var isHidden = !!list.hidden;
        var row = $(
          '<div class="ll-edit-row' + (isHidden ? ' ll-edit-row--hidden' : '') + '">' +
            '<div class="ll-edit-row__title">' + escapeHtml(list.name) + '</div>' +
            '<div class="ll-edit-row__controls"></div>' +
          '</div>'
        );

        var controls = row.find('.ll-edit-row__controls');

        var btnUp = $('<div class="selector ll-edit-btn" data-list-id="' + list.id + '" data-action="up" title="Up">' + ICON_UP + '</div>');
        var btnDown = $('<div class="selector ll-edit-btn" data-list-id="' + list.id + '" data-action="down" title="Down">' + ICON_DOWN + '</div>');
        var btnVis = $('<div class="selector ll-edit-btn" data-list-id="' + list.id + '" data-action="vis" title="Visibility">' + (isHidden ? ICON_UNCHECKED : ICON_CHECKED) + '</div>');

        if (index === 0) btnUp.addClass('ll-edit-btn--disabled');
        if (index === lists.length - 1) btnDown.addClass('ll-edit-btn--disabled');

        btnUp.on('hover:focus', function () { scroll.update($(this)); });
        btnDown.on('hover:focus', function () { scroll.update($(this)); });
        btnVis.on('hover:focus', function () { scroll.update($(this)); });

        btnUp.on('hover:enter', function () {
          if (index > 0) {
            var all = Lists.getAll();
            var tmp = all[index];
            all[index] = all[index - 1];
            all[index - 1] = tmp;
            Lists.save(all);
            _this.build({ id: list.id, action: 'up' });
          }
        });

        btnDown.on('hover:enter', function () {
          var all = Lists.getAll();
          if (index < all.length - 1) {
            var tmp = all[index];
            all[index] = all[index + 1];
            all[index + 1] = tmp;
            Lists.save(all);
            _this.build({ id: list.id, action: 'down' });
          }
        });

        btnVis.on('hover:enter', function () {
          var all = Lists.getAll();
          all[index].hidden = !all[index].hidden;
          Lists.save(all);
          _this.build({ id: list.id, action: 'vis' });
        });

        controls.append(btnUp, btnDown, btnVis);
        body.append(row);
      });

      scroll.clear();
      scroll.append(body);

      Lampa.Controller.collectionSet(scroll.render());
      var focusTarget = null;
      if (targetFocus) {
        focusTarget = body.find('.selector[data-list-id="' + targetFocus.id + '"][data-action="' + targetFocus.action + '"]').get(0);
      }
      if (!focusTarget) {
        focusTarget = body.find('.selector:not(.ll-edit-btn--disabled)').get(0);
      }
      if (focusTarget) {
        Lampa.Controller.collectionFocus(focusTarget, scroll.render());
      }
    };

    this.start = function () {
      Lampa.Controller.add('content', {
        toggle: function () {
          Lampa.Controller.collectionSet(scroll.render());
          var first = body.find('.selector:not(.ll-edit-btn--disabled)').get(0) || body.find('.selector').get(0);
          if (first) Lampa.Controller.collectionFocus(first, scroll.render());
        },
        left: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        up: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('up')) Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('down')) Navigator.move('down');
        },
        right: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('right')) Navigator.move('right');
        },
        back: function () {
          Lampa.Activity.backward();
        }
      });
      Lampa.Controller.toggle('content');
    };

    this.pause = function () {};
    this.stop = function () {};

    this.render = function (js) { return js ? html : html[0]; };
    this.destroy = function () {
      scroll.destroy();
      html.remove();
      var cur = Lampa.Activity.active();
      if (cur && (cur.component === 'bookmarks' || cur.component === 'local_lists_root')) {
        Lampa.Activity.replace();
      }
    };
    scroll.minus();
    html.append(scroll.render());
  }

  // ── Налаштування ──────────────────────────────────────────────────────
  function registerSettings() {
    if (!Lampa.SettingsApi) return;

    Lampa.SettingsApi.addComponent({
      component: 'local_lists_settings',
      name: tr('local_lists_settings'),
      icon: ICON_SETTINGS
    });

    Lampa.SettingsApi.addParam({
      component: 'local_lists_settings',
      param: {
        name: 'll_param_edit',
        type: 'button'
      },
      field: {
        name: tr('local_lists_edit_menu'),
        description: 'Зміна порядку відображення та приховування списків'
      },
      onChange: function () {
        Lampa.Activity.push({
          component: 'local_lists_edit',
          title: tr('local_lists_edit_menu')
        });
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'local_lists_settings',
      param: {
        name: 'll_param_token',
        type: 'button'
      },
      field: {
        name: tr('local_lists_github_auth'),
        description: 'Натисніть, щоб ввести особистий токен GitHub'
      },
      onRender: function (item) {
        var token = Lampa.Storage.get(GIST_TOKEN_KEY, '');
        var label = token ? '••••••••' : '---';
        item.find('.settings-param__value').text(label);
      },
      onChange: function () {
        Lampa.Input.edit({
          title: tr('local_lists_github_auth'),
          value: Lampa.Storage.get(GIST_TOKEN_KEY, ''),
          free: true,
          nosave: true
        }, function (value) {
          var trimmed = (value || '').trim();
          Lampa.Storage.set(GIST_TOKEN_KEY, trimmed);
          Lampa.Settings.update();
        });
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'local_lists_settings',
      param: {
        name: 'll_param_sync',
        type: 'button'
      },
      field: {
        name: tr('local_lists_cloud_backup'),
        description: 'Об\'єднати локальні списки і закладки з хмарою GitHub'
      },
      onChange: function () {
        Cloud.backup();
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'local_lists_settings',
      param: {
        name: 'll_param_overwrite',
        type: 'button'
      },
      field: {
        name: tr('local_lists_cloud_overwrite'),
        description: 'Замінити всі дані в хмарі поточними локальними списками та закладками'
      },
      onChange: function () {
        Cloud.overwrite();
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'local_lists_settings',
      param: {
        name: 'll_param_restore',
        type: 'button'
      },
      field: {
        name: tr('local_lists_cloud_restore'),
        description: 'Повністю замінити локальні списки та закладки даними з хмари'
      },
      onChange: function () {
        Cloud.restore();
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'local_lists_settings',
      param: {
        name: 'll_param_trakt',
        type: 'button'
      },
      field: {
        name: tr('local_lists_import_trakt'),
        description: 'Імпортувати списки з архіву експорту Trakt.tv (.zip)'
      },
      onChange: function () {
        TraktImport.run();
      }
    });
  }

  // ── Компоненти інтерфейсу ─────────────────────────────────────────────
  function RootComponent() {
    var _this = this;
    var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
    var html = $('<div class="local-lists-root"></div>');
    var body = $('<div class="local-lists-root__grid category-full"></div>');

    this.create = function () {
      this.build();
      return this.render();
    };

    this.build = function () {
      body.empty();
      var lists = Lists.getVisible();
      lists.forEach(function (l) {
        var cover = (l.items && l.items.length) ? l.items[0].img : './img/img_broken.svg';
        var item = $('<div class="selector local-lists-root__card"><div class="local-lists-root__poster"><img src="'+escapeHtml(cover)+'" onerror="this.src=\'./img/img_broken.svg\'"><div class="local-lists-root__badge">'+l.items.length+'</div></div><div class="local-lists-root__title">'+escapeHtml(l.name)+'</div></div>');
        item.on('hover:focus', function () { scroll.update($(this)); });
        item.on('hover:enter', function() { Lampa.Activity.push({ component: 'local_lists_detail', list_id: l.id, title: l.name }); });
        item.on('hover:long', function() {
           Lampa.Select.show({
             title: l.name,
             items: [
               { title: tr('local_lists_remove_item'), id: 'del' },
               { title: tr('local_lists_edit_menu'), id: 'edit' }
             ],
             onSelect: function(a) {
               if (a.id === 'del') {
                 Lists.remove(l.id);
                 _this.build();
               } else if (a.id === 'edit') {
                 Lampa.Activity.push({ component: 'local_lists_edit', title: tr('local_lists_edit_menu') });
               }
               Lampa.Controller.toggle('content');
             },
             onBack: function(){ Lampa.Controller.toggle('content'); }
           });
        });
        body.append(item);
      });

      var addBtn = $('<div class="selector local-lists-root__card"><div class="local-lists-root__poster local-lists-root__poster--add"><span>+</span></div><div class="local-lists-root__title">'+tr('local_lists_create')+'</div></div>');
      addBtn.on('hover:focus', function () { scroll.update($(this)); });
      addBtn.on('hover:enter', function() { Lampa.Input.edit({ title: tr('local_lists_new_name'), value: '', free: true, nosave: true, nomic: true }, function(v) { if(v){ Lists.create(v); _this.build(); } Lampa.Controller.toggle('content'); }); });
      body.append(addBtn);

      scroll.clear();
      scroll.append(body);
    };

    this.start = function () {
      Lampa.Controller.add('content', {
        toggle: function () { Lampa.Controller.collectionSet(scroll.render()); Lampa.Controller.collectionFocus(body.find('.selector').get(0), scroll.render()); },
        left: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        up: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('up')) Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('down')) Navigator.move('down');
        },
        right: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('right')) Navigator.move('right');
        },
        back: function () { Lampa.Activity.backward(); }
      });
      Lampa.Controller.toggle('content');
    };

    this.render = function (js) { return js ? html : html[0]; };
    this.destroy = function () { scroll.destroy(); html.remove(); };
    scroll.minus(); html.append(scroll.render());
  }

  function DetailComponent(object) {
    var _this = this;
    var listId = object.list_id;
    var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
    var html = $('<div class="local-lists-detail"></div>');
    var body = $('<div class="category-full"></div>');

    this.create = function () { this.build(); return this.render(); };

    this.build = function () {
      body.empty();
      var list = Lists.get(listId);
      if (list && list.items && list.items.length) {
        list.items.forEach(function (item) {
          var card = new Lampa.Card(item, { card_category: true });
          card.create();
          var $cardEl = $(card.render());
          body.append($cardEl);
          if (card.visible) card.visible();
          $cardEl.on('hover:focus', function () { scroll.update($(this)); });

          card.onEnter = function () {
            Lampa.Activity.push({ component: 'full', id: item.id, method: item.method, card: item });
          };
          card.onMenu = function () {
            Lampa.Select.show({
              title: item.title,
              items: [{ title: tr('local_lists_remove_card'), id: 'remove' }],
              onSelect: function (a) {
                if (a.id === 'remove') {
                  Lists.removeItem(listId, item.id);
                  _this.build();
                }
                Lampa.Controller.toggle('content');
              },
              onBack: function () {
                Lampa.Controller.toggle('content');
              }
            });
          };

          $cardEl.off('hover:enter.local_detail').on('hover:enter.local_detail', function (e) {
            if (e) e.stopPropagation();
            card.onEnter();
          });
          $cardEl.off('hover:long.local_detail').on('hover:long.local_detail', function (e) {
            if (e) e.stopPropagation();
            card.onMenu();
          });
        });
      } else {
        var empty = $('<div class="empty__title" style="padding: 3em; text-align: center; opacity: 0.5; font-size: 1.3em;">' + (tr('empty_title') || 'Порожньо') + '</div>');
        body.append(empty);
      }
      scroll.clear(); scroll.append(body);
    };

    this.start = function () {
      Lampa.Controller.add('content', {
        toggle: function () { 
          Lampa.Controller.collectionSet(scroll.render()); 
          var first = body.find('.selector').get(0);
          if (first) Lampa.Controller.collectionFocus(first, scroll.render()); 
        },
        left: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        up: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('up')) Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('down')) Navigator.move('down');
        },
        right: function () {
          if (typeof Navigator !== 'undefined' && Navigator.canmove('right')) Navigator.move('right');
        },
        back: function () { Lampa.Activity.backward(); }
      });
      Lampa.Controller.toggle('content');
    };

    this.render = function (js) { return js ? html : html[0]; };
    this.destroy = function () { scroll.destroy(); html.remove(); };
    scroll.minus(); html.append(scroll.render());
  }

  // ── Рядок «Мої списки» у розділі «Закладки» ─────────────────────────
  function findListsRow() {
    var titleText = tr('local_lists_title');
    var $titles = $('.line__title, .card-line__title, .items-line__title');
    var $found = null;
    $titles.each(function () {
      if ($(this).text().trim() === titleText) {
        $found = $(this).closest('.line, .card-line, .items-line');
        return false;
      }
    });
    return $found;
  }

  function applyRowCardHandlers() {
    var $row = findListsRow();
    if (!$row || !$row.length) return;

    var lists = Lists.getVisible();
    var $cards = $row.find('.card');
    if (!$cards.length) return;

    $cards.each(function (index) {
      var $card = $(this);

      if (index < lists.length) {
        var list = lists[index];
        $card.addClass('local-lists-card card--loaded');
        $card.data('local-list-id', list.id);

        if (!$card.find('.local-lists-counter-badge').length) {
          var count = (list.items && list.items.length) || 0;
          $card.find('.card__view').append('<div class="local-lists-counter-badge">' + count + '</div>');
        }

        $card.off('hover:enter.local_lists hover:long.local_lists');
        $card.off('hover:enter hover:long');

        $card.on('hover:enter.local_lists', function (e) {
          if (e) e.stopPropagation();
          Lampa.Activity.push({
            component: 'local_lists_detail',
            list_id: list.id,
            title: list.name
          });
        });

        $card.on('hover:long.local_lists', function (e) {
          if (e) e.stopPropagation();
          Lampa.Select.show({
            title: list.name,
            items: [
              { title: tr('local_lists_remove_item'), id: 'del' },
              { title: tr('local_lists_edit_menu'), id: 'edit' }
            ],
            onSelect: function (a) {
              if (a.id === 'del') {
                Lists.remove(list.id);
                if (Lampa.Activity.active() && Lampa.Activity.active().component === 'bookmarks') {
                  Lampa.Activity.replace();
                }
              } else if (a.id === 'edit') {
                Lampa.Activity.push({ component: 'local_lists_edit', title: tr('local_lists_edit_menu') });
              }
              Lampa.Controller.toggle('content');
            },
            onBack: function () {
              Lampa.Controller.toggle('content');
            }
          });
        });
      } else {
        $card.addClass('local-lists-card-add card--loaded');
        $card.find('img').remove();
        $card.find('.card__img-broken').remove();

        if (!$card.find('.local-lists-add-icon').length) {
          $card.find('.card__view').empty().append('<div class="local-lists-add-icon">+</div>');
        }

        $card.off('hover:enter.local_lists hover:long.local_lists');
        $card.off('hover:enter hover:long');

        $card.on('hover:enter.local_lists', function (e) {
          if (e) e.stopPropagation();
          Lampa.Input.edit({
            title: tr('local_lists_new_name'),
            value: '',
            free: true,
            nosave: true,
            nomic: true
          }, function (name) {
            if (name && name.trim()) {
              Lists.create(name.trim());
              if (Lampa.Activity.active() && Lampa.Activity.active().component === 'bookmarks') {
                Lampa.Activity.replace();
              }
            }
            Lampa.Controller.toggle('content');
          });
        });
      }
    });
  }

  function scheduleCardHandlers() {
    setTimeout(applyRowCardHandlers, 40);
    setTimeout(applyRowCardHandlers, 150);
    setTimeout(applyRowCardHandlers, 400);
    setTimeout(applyRowCardHandlers, 800);
  }

  function registerListsContentRow() {
    if (!Lampa.ContentRows || !Lampa.ContentRows.add) return;

    Lampa.ContentRows.add({
      index: 1,
      name: 'local_lists_row_overview',
      screen: ['bookmarks'],
      call: function () {
        var lists = Lists.getVisible();
        var results = [];

        lists.forEach(function (list) {
          var first = (list.items && list.items.length) ? list.items[0] : null;
          var poster = first ? (first.poster_path || '') : '';
          var img = first ? (first.img || resolvePoster(first.poster_path)) : './img/img_broken.svg';

          results.push({
            id: list.id,
            list_id: list.id,
            title: list.name,
            name: list.name,
            items_count: (list.items && list.items.length) || 0,
            poster_path: poster,
            img: img
          });
        });

        results.push({
          id: 'create_new_list',
          title: tr('local_lists_create'),
          name: tr('local_lists_create'),
          items_count: '+',
          img: TRANSPARENT_PIXEL
        });

        scheduleCardHandlers();

        return [{
          title: tr('local_lists_title'),
          results: results
        }];
      }
    });
  }

  // ── Лонг-тап на картці в каталозі ────────────────────────────────────
  function extendCardMenuAndIcons() {
    var cardModule = Lampa.Maker.map('Card');
    if (!cardModule) return;

    var onFavoriteUpdate = cardModule.Favorite.onUpdate;
    cardModule.Favorite.onUpdate = function () {
      var self = this;
      if (onFavoriteUpdate) onFavoriteUpdate.apply(self);
      if (isPerson(self.data)) return;

      refreshCardIcon({
        data: self.data,
        card: self.html
      });
    };

    var onMenuCreate = cardModule.Menu.onCreate;
    cardModule.Menu.onCreate = function () {
      var self = this;

      var favoriteMenuList = this.menu_list.filter(function (menu) {
        return menu.title === Lampa.Lang.translate('settings_input_links') ||
               menu.title === Lampa.Lang.translate('title_book') ||
               menu.title === Lampa.Lang.translate('menu_bookmarks');
      })[0];

      if (!favoriteMenuList || isPerson(self.data)) {
        return onMenuCreate ? onMenuCreate.apply(this, arguments) : undefined;
      }

      var favoriteMenu = favoriteMenuList.menu;

      favoriteMenuList.menu = function () {
        var newItems = Lists.getVisible().map(function (list) {
          var isChecked = list.items && list.items.some(function (it) { 
            return String(it.id) === String(self.data.id); 
          });

          return {
            checkbox: true,
            checked: isChecked ? self.data.id : undefined,
            onCheck: function () {
              var freshList = Lists.get(list.id);
              var exists = freshList && freshList.items && freshList.items.some(function (it) { 
                return String(it.id) === String(self.data.id); 
              });

              if (exists) {
                Lists.removeItem(list.id, self.data.id);
                Lampa.Noty.show(tr('local_lists_removed'));
              } else {
                Lists.addItem(list.id, self.data);
                Lampa.Noty.show(tr('local_lists_added'));
              }

              if (cardModule.Favorite && cardModule.Favorite.onUpdate) {
                cardModule.Favorite.onUpdate.apply(self);
              }
            },
            title: list.name
          };
        });

        var oldMenuItems = favoriteMenu.apply(favoriteMenuList).map(function (menuItem) {
          if (!menuItem.onCheck) return menuItem;
          var origOnCheck = menuItem.onCheck;
          menuItem.onCheck = function () {
            origOnCheck.apply(this, arguments);
            if (cardModule.Favorite && cardModule.Favorite.onUpdate) {
              cardModule.Favorite.onUpdate.apply(self);
            }
          };
          return menuItem;
        });

        return newItems.concat(oldMenuItems);
      };

      if (onMenuCreate) onMenuCreate.apply(this, arguments);
    };
  }

  // ── Меню «Вибране» у картці фільму (кнопка закладки) ─────────────────
  function extendFullCardMenu(card) {
    if (!card || card.id == null) return;

    var $selectbox = $('body > .selectbox');
    if (!$selectbox.length) return;

    $selectbox.find('.local-lists-menu-item').remove();

    var bookmarkMenuItem = $selectbox.find('.selectbox-item__title').filter(function () {
      return $(this).text() === Lampa.Lang.translate('title_book');
    });

    var lists = Lists.getVisible();

    lists.forEach(function (list) {
      var isChecked = list.items && list.items.some(function (it) { 
        return String(it.id) === String(card.id); 
      });

      var $menuItem = $(
        '<div class="selectbox-item selector local-lists-menu-item' + (isChecked ? ' selectbox-item--checked' : '') + '">' +
          '<div class="selectbox-item__title">' + escapeHtml(list.name) + '</div>' +
          '<div class="selectbox-item__checkbox"></div>' +
        '</div>'
      );

      if (bookmarkMenuItem.length) {
        $menuItem.insertBefore(bookmarkMenuItem.parent());
      } else {
        $selectbox.find('.scroll__body').prepend($menuItem);
      }

      $menuItem.on('hover:enter', function () {
        var freshList = Lists.get(list.id);
        var inList = freshList && freshList.items && freshList.items.some(function (it) { 
          return String(it.id) === String(card.id); 
        });

        if (inList) {
          Lists.removeItem(list.id, card.id);
          $(this).removeClass('selectbox-item--checked');
          Lampa.Noty.show(tr('local_lists_removed'));
        } else {
          Lists.addItem(list.id, card);
          $(this).addClass('selectbox-item--checked');
          Lampa.Noty.show(tr('local_lists_added'));
        }

        refreshBookmarkIcon();
      });
    });

    Lampa.Controller.collectionSet($selectbox.find('.scroll__body'));

    setTimeout(function () {
      var $menuItems = $selectbox.find('.selector');
      if ($menuItems.length > 0) {
        Lampa.Controller.focus($menuItems.get(0));
        if (typeof Navigator !== 'undefined') Navigator.focus($menuItems.get(0));
      }
    }, 10);
  }

  function startPlugin() {
    addLang();
    registerSettings();

    Lampa.Template.add('local-lists-star-icon-svg', ICON_STAR_SVG);
    Lampa.Template.add('local-lists-star-icon', '<div class="card__icon icon--star">' + ICON_STAR_SVG + '</div>');

    $('body').append(
      '<style>' +
        '.card__icon { position: relative; }' +
        '.icon--star svg { position: absolute; height: 60%; width: 60%; top: 50%; left: 50%; transform: translate(-50%, -50%); }' +
        '.local-lists-root__grid{display:flex;flex-wrap:wrap;gap:1.6em;padding:1.6em 2.5em;}' +
        '.local-lists-root__card{width:12em;}' +
        '.local-lists-root__poster{width:100%;padding-top:150%;position:relative;border-radius:.9em;overflow:hidden;background:#222;box-sizing:border-box;border:3px solid transparent;}' +
        '.local-lists-root__poster img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;}' +
        '.local-lists-root__poster--add{background:rgba(255,255,255,.05);}' +
        '.local-lists-root__poster--add span{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:3em;opacity:.5;}' +
        '.local-lists-root__badge{position:absolute;top:.5em;left:.5em;background:rgba(0,0,0,0.65);color:#fff;font-size:0.85em;padding:0.15em 0.6em;border-radius:1em;z-index:1;}' +
        '.local-lists-root__title{margin-top:0.6em;font-size:1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
        '.local-lists-root__card.focus .local-lists-root__poster{border-color:#fff;}' +

        /* Картка створення списку (+) */
        '.local-lists-card-add .card__view{' +
          'position:relative !important;' +
          'background:rgba(255,255,255,0.06) !important;' +
          'border:2px dashed rgba(255,255,255,0.3) !important;' +
          'box-sizing:border-box !important;' +
        '}' +
        '.local-lists-card-add .card__view > *:not(.local-lists-add-icon){display:none !important;}' +
        '.local-lists-card-add img, .local-lists-card-add svg:not(.local-lists-add-icon svg), .local-lists-card-add .card__img-broken{display:none !important;}' +
        '.local-lists-add-icon{' +
          'position:absolute !important;' +
          'top:0 !important;' +
          'left:0 !important;' +
          'width:100% !important;' +
          'height:100% !important;' +
          'display:flex !important;' +
          'align-items:center !important;' +
          'justify-content:center !important;' +
          'font-size:3.8em !important;' +
          'line-height:1 !important;' +
          'color:rgba(255,255,255,0.7) !important;' +
          'font-weight:200 !important;' +
          'user-select:none !important;' +
          'pointer-events:none !important;' +
        '}' +
        '.local-lists-card-add.focus .local-lists-add-icon{color:#ffffff !important;transform:scale(1.15);transition:transform 0.2s;}' +

        /* Бейдж із лічильником */
        '.local-lists-counter-badge{position:absolute !important;top:0.6em !important;right:0.6em !important;background:rgba(0,0,0,0.75) !important;color:#ffffff !important;font-size:0.85em !important;font-weight:bold !important;padding:0.15em 0.55em !important;border-radius:0.5em !important;z-index:3 !important;pointer-events:none !important;box-shadow:0 2px 4px rgba(0,0,0,0.6);}' +

        /* Меню налаштувань */
        '.local-lists-settings-list{display:flex !important;flex-direction:column !important;align-items:stretch !important;width:100% !important;min-width:100% !important;box-sizing:border-box !important;padding:1.4em 0 0.3em 0 !important;}' +
        '.local-lists-item{display:flex !important;flex-direction:row !important;align-items:center !important;justify-content:flex-start !important;width:100% !important;height:3.8em !important;min-height:3.8em !important;padding:0 1.4em !important;margin:0.2em 0 !important;background:transparent !important;border-radius:0.6em !important;cursor:pointer !important;transition:background 0.15s ease !important;}' +
        '.local-lists-item.focus{background:rgba(255,255,255,0.12) !important;}' +
        '.local-lists-item__icon{display:flex !important;align-items:center !important;justify-content:center !important;margin-right:1.3em !important;width:28px !important;min-width:28px !important;height:28px !important;}' +
        '.local-lists-item__icon svg{width:26px !important;height:26px !important;stroke:#ffffff !important;display:block !important;}' +
        '.local-lists-item__name{display:flex !important;align-items:center !important;font-size:1.2em !important;font-weight:400 !important;color:#ffffff !important;white-space:nowrap !important;}' +
        '.local-lists-item__val{margin-left:0.8em !important;font-size:0.85em !important;color:rgba(255,255,255,0.5) !important;}' +

        /* Меню редагування списків (порядок, приховування) */
        '.local-lists-editor{width:100%;height:100%;box-sizing:border-box;}' +
        '.local-lists-editor__body{max-width:54em;margin:0 auto;padding:1.6em 2em;box-sizing:border-box;}' +
        '.ll-edit-row{display:flex;align-items:center;justify-content:space-between;padding:0.7em 1.2em;background:rgba(255,255,255,0.05);margin-bottom:0.6em;border-radius:0.8em;box-sizing:border-box;transition:opacity 0.2s, background 0.2s;}' +
        '.ll-edit-row--hidden{opacity:0.45;}' +
        '.ll-edit-row__title{flex-grow:1;font-size:1.25em;font-weight:400;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:1em;}' +
        '.ll-edit-row__controls{display:flex;align-items:center;gap:0.4em;flex-shrink:0;}' +
        '.ll-edit-btn{display:flex;align-items:center;justify-content:center;width:2.8em;height:2.8em;background:rgba(255,255,255,0.06);border-radius:0.6em;cursor:pointer;transition:all 0.15s ease;}' +
        '.ll-edit-btn svg{stroke:#fff;display:block;}' +
        '.ll-edit-btn.focus{background:#fff !important;}' +
        '.ll-edit-btn.focus svg{stroke:#000 !important;}' +
        '.ll-edit-btn--disabled{opacity:0.2 !important;pointer-events:none !important;}' +
      '</style>'
    );

    Lampa.Component.add('local_lists_root', RootComponent);
    Lampa.Component.add('local_lists_detail', DetailComponent);
    Lampa.Component.add('local_lists_edit', EditListsComponent);

    registerListsContentRow();
    extendCardMenuAndIcons();

    $(document).on('hover:focus', '.card', function () {
      var $card = $(this);
      if ($card.hasClass('local-lists-card') || $card.hasClass('local-lists-card-add') ||
          $card.closest('.line, .card-line').find('.line__title, .card-line__title').text().trim() === tr('local_lists_title')) {
        applyRowCardHandlers();
      }
    });

    Lampa.Storage.listener.follow('change', function (event) {
      if (event.name !== 'activity') return;
      var active = Lampa.Activity.active();
      if (!active || active.component !== 'bookmarks') return;

      scheduleCardHandlers();

      var $render = active.activity.render();
      if ($render.find('.local-lists-register-btn').length) return;

      var $firstRegister = $render.find('.register').first();
      if (!$firstRegister.length) return;

      var lists = Lists.getVisible();
      var $register = Lampa.Template.js('register').addClass('selector').addClass('local-lists-register-btn');
      $register.find('.register__name').text(tr('local_lists_title'));
      $register.find('.register__counter').text(lists.length);
      $register.on('hover:enter', function () {
        Lampa.Activity.push({ component: 'local_lists_root' });
      });

      $firstRegister.before($register);
    });

    Lampa.Listener.follow('full', function (e) {
      if (e.type !== 'complite') return;
      refreshBookmarkIcon();

      var active = Lampa.Activity.active();
      var render = (active && active.activity) ? active.activity.render() : (e.object && e.object.activity ? e.object.activity.render() : null);
      if (!render) return;

      var $bookBtn = render.find('.button--book');
      if (!$bookBtn.length || $bookBtn.data('local-lists-bound')) return;
      $bookBtn.data('local-lists-bound', true);

      $bookBtn.on('hover:enter', function () {
        var card = (e.object && e.object.card) || getActiveCard();
        extendFullCardMenu(card);
      });
    });
  }

  if (window.appready) {
    startPlugin();
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') startPlugin();
    });
  }
})();
