/*
 * author: 'MaksTV'
 * Упрощенная версия: оставлен только рейтинг на постере.
 * Добавлена возможность выбора позиции рейтинга (углы).
 */

(function() {
  'use strict';

  function ensureLocalStorage() {
    var available = true;

    try {
      var testKey = '__poster_rating_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
    } catch (e) {
      available = false;
    }

    if (!available) {
      var memory = {};

      window.localStorage = {
        getItem: function(key) {
          return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
        },
        setItem: function(key, value) {
          memory[key] = String(value);
        },
        removeItem: function(key) {
          delete memory[key];
        },
        clear: function() {
          memory = {};
        }
      };
    }
  }

  ensureLocalStorage();

  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function(callback, thisArg) {
      thisArg = thisArg || window;

      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }

  if (!window.Lampa) return;

  var OMDB_CACHE_KEY = 'omdb_ratings_cache';
  var TMDB_FALLBACK_KEY = '4ef0d7355d9ffb5151e987764708ce96';
  var ICON_IMDB_CARD = 'https://img.icons8.com/color/48/000000/imdb.png';
  var ICON_TMDB_CARD = 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg';

  var retryStates = {};
  var omdbRequestQueue = [];
  var isOmdbRequesting = false;

  var posterRatingStyles = '<style>' +
    'body.omdb-plugin-active .card__vote{display:none!important;opacity:0!important;visibility:hidden!important;}' +
    '.omdb-custom-rate{position:absolute;background:rgba(0,0,0,.75);color:#fff;padding:.2em .5em;border-radius:1em;display:flex;align-items:center;z-index:10;font-family:"Segoe UI",sans-serif;font-size:.9em;line-height:1;pointer-events:none;border:none;transition:box-shadow .2s,opacity .2s;}' +
    '.omdb-custom-rate span{font-weight:700;font-size:1em;}' +
    '.omdb-custom-rate img{width:1.2em;height:1.2em;margin-left:.3em;object-fit:contain;filter:drop-shadow(0 0 2px rgba(0,0,0,.5));}' +
    // Position classes
    '.omdb-pos-bottom-right{right:.4em;bottom:.4em;}' +
    '.omdb-pos-bottom-left{left:.4em;bottom:.4em;}' +
    '.omdb-pos-top-right{right:.4em;top:.4em;}' +
    '.omdb-pos-top-left{left:.4em;top:.4em;}' +
    // Glow effects
    'body.omdb-enh--glow .omdb-glow-green{box-shadow:0 0 8px rgba(46,204,113,.6)!important;}' +
    'body.omdb-enh--glow .omdb-glow-blue{box-shadow:0 0 8px rgba(96,165,250,.6)!important;}' +
    'body.omdb-enh--glow .omdb-glow-orange{box-shadow:0 0 8px rgba(245,158,11,.6)!important;}' +
    'body.omdb-enh--glow .omdb-glow-red{box-shadow:0 0 8px rgba(239,68,68,.6)!important;}' +
    '</style>';

  document.head.insertAdjacentHTML('beforeend', posterRatingStyles);

  function showNotice(message) {
    try {
      if (Lampa && typeof Lampa.Noty === 'function') return Lampa.Noty(message);
      if (Lampa && Lampa.Noty && Lampa.Noty.show) return Lampa.Noty.show(message);
    } catch (e) {}
  }

  function getStorageValue(key, fallback) {
    try {
      return Lampa.Storage.get(key, fallback);
    } catch (e) {
      return fallback;
    }
  }

  function getOmdbCache() {
    try {
      return JSON.parse(localStorage.getItem(OMDB_CACHE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function setOmdbCache(cache) {
    try {
      localStorage.setItem(OMDB_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {}
  }

  function saveOmdbCache(id, rating) {
    var cache = getOmdbCache();
    var ttlDays = parseInt(getStorageValue('omdb_cache_days', '7'), 10);

    if (isNaN(ttlDays) || ttlDays <= 0) ttlDays = 7;

    cache[id] = {
      rating: rating,
      timestamp: Date.now() + (ttlDays * 24 * 60 * 60 * 1000)
    };

    setOmdbCache(cache);
  }

  function getCachedOmdbRating(id) {
    var cache = getOmdbCache();

    if (!cache[id]) return null;

    if (Date.now() < cache[id].timestamp) {
      return cache[id].rating;
    }

    delete cache[id];
    setOmdbCache(cache);

    return null;
  }

  function clearPosterCache() {
    localStorage.removeItem(OMDB_CACHE_KEY);
    retryStates = {};
    omdbRequestQueue = [];
    showNotice('Кеш постеров очищен');
  }

  function cleanExpiredPosterCache() {
    var cache = getOmdbCache();
    var changed = false;
    var now = Date.now();

    for (var key in cache) {
      if (Object.prototype.hasOwnProperty.call(cache, key) && cache[key].timestamp < now) {
        delete cache[key];
        changed = true;
      }
    }

    if (changed) setOmdbCache(cache);
  }

  function getOmdbApiKey() {
    return String(getStorageValue('omdb_api_key', '') || '').trim();
  }

  function getTmdbApiKey() {
    var key = String(getStorageValue('tmdb_api_key', '') || '').trim();

    if (!key || key === 'c87a543116135a4120443155bf680876') {
      key = TMDB_FALLBACK_KEY;
    }

    return key;
  }

  function getCardType(data) {
    var type = data.media_type || data.type;

    if (type === 'movie' || type === 'tv') return type;

    return data.name || data.original_name || data.seasons || data.first_air_date ? 'tv' : 'movie';
  }

  function getTmdbExternalIdsUrl(type, id) {
    return 'https://api.themoviedb.org/3/' + type + '/' + id + '/external_ids?api_key=' + encodeURIComponent(getTmdbApiKey());
  }

  function setRetryState(ratingKey) {
    var state = retryStates[ratingKey] || { step: 0 };

    if (state.step === 0) {
      retryStates[ratingKey] = { step: 1, time: Date.now() + 60 * 1000 };
    } else if (state.step === 1) {
      retryStates[ratingKey] = { step: 2, time: Date.now() + 60 * 60 * 1000 };
    } else {
      saveOmdbCache(ratingKey, 'N/A');
      delete retryStates[ratingKey];
    }
  }

  function applyPosterGlowClass(element, value) {
    element.classList.remove('omdb-glow-green', 'omdb-glow-blue', 'omdb-glow-orange', 'omdb-glow-red');

    var rating = parseFloat(value);
    if (isNaN(rating)) return;

    if (rating >= 7.5) element.classList.add('omdb-glow-green');
    else if (rating >= 6.0) element.classList.add('omdb-glow-blue');
    else if (rating >= 4.0) element.classList.add('omdb-glow-orange');
    else element.classList.add('omdb-glow-red');
  }

  function getPositionClass() {
    var position = getStorageValue('omdb_poster_position', 'bottom-right');
    return 'omdb-pos-' + position;
  }

  function processOmdbQueue() {
    if (isOmdbRequesting || omdbRequestQueue.length === 0) return;

    isOmdbRequesting = true;

    if (omdbRequestQueue.length > 20) {
      omdbRequestQueue = omdbRequestQueue.slice(-20);
    }

    var task = omdbRequestQueue.shift();
    var data = task.movie;
    var type = getCardType(data);

    if (getCachedOmdbRating(task.ratingKey) !== null) {
      isOmdbRequesting = false;
      processOmdbQueue();
      return;
    }

    var tmdbRequest = new Lampa.Reguest();

    tmdbRequest.silent(getTmdbExternalIdsUrl(type, task.id), function(tmdbData) {
      try {
        var parsedTmdb = typeof tmdbData === 'string' ? JSON.parse(tmdbData) : tmdbData;
        var imdbId = parsedTmdb ? parsedTmdb.imdb_id : null;

        if (!imdbId) {
          saveOmdbCache(task.ratingKey, 'N/A');
          isOmdbRequesting = false;
          setTimeout(processOmdbQueue, 100);
          return;
        }

        var omdbApiKey = getOmdbApiKey();

        if (!omdbApiKey) {
          isOmdbRequesting = false;
          setTimeout(processOmdbQueue, 100);
          return;
        }

        var omdbUrl = 'https://www.omdbapi.com/?i=' + encodeURIComponent(imdbId) + '&apikey=' + encodeURIComponent(omdbApiKey);
        var omdbRequest = new Lampa.Reguest();

        omdbRequest.silent(omdbUrl, function(omdbData) {
          try {
            var response = typeof omdbData === 'string' ? JSON.parse(omdbData) : omdbData;
            delete retryStates[task.ratingKey];

            if (response.Response === 'True' && response.imdbRating && response.imdbRating !== 'N/A') {
              saveOmdbCache(task.ratingKey, response.imdbRating);
            } else if (response.Response === 'False' && response.Error && response.Error.indexOf('limit') > -1) {
              setRetryState(task.ratingKey);
            } else {
              saveOmdbCache(task.ratingKey, 'N/A');
            }
          } catch (e) {
            setRetryState(task.ratingKey);
          }

          isOmdbRequesting = false;
          setTimeout(processOmdbQueue, 300);
        }, function() {
          setRetryState(task.ratingKey);
          isOmdbRequesting = false;
          setTimeout(processOmdbQueue, 300);
        });
      } catch (e) {
        setRetryState(task.ratingKey);
        isOmdbRequesting = false;
        setTimeout(processOmdbQueue, 300);
      }
    }, function() {
      setRetryState(task.ratingKey);
      isOmdbRequesting = false;
      setTimeout(processOmdbQueue, 300);
    });
  }

  function renderPosterBadge(element, value, source, iconUrl) {
    if (element.style.display === 'none' || element.dataset.val !== value || element.dataset.src !== source) {
      element.dataset.val = value;
      element.dataset.src = source;
      element.style.display = 'flex';
      element.innerHTML = '<span>' + value + '</span><img src="' + iconUrl + '" alt="' + source + '">';
      applyPosterGlowClass(element, value);
    }
  }

  function updatePositionClasses() {
    var positionClass = getPositionClass();
    
    document.querySelectorAll('.omdb-custom-rate').forEach(function(element) {
      element.classList.remove('omdb-pos-bottom-right', 'omdb-pos-bottom-left', 'omdb-pos-top-right', 'omdb-pos-top-left');
      element.classList.add(positionClass);
    });
  }

  function pollPosterCards() {
    var isEnabled = getStorageValue('omdb_status', true);

    if (!isEnabled) {
      document.body.classList.remove('omdb-plugin-active', 'omdb-enh--glow');
      document.querySelectorAll('.omdb-custom-rate').forEach(function(element) {
        element.remove();
      });
      setTimeout(pollPosterCards, 1000);
      return;
    }

    document.body.classList.add('omdb-plugin-active');

    if (getStorageValue('omdb_poster_glow', true)) {
      document.body.classList.add('omdb-enh--glow');
    } else {
      document.body.classList.remove('omdb-enh--glow');
    }

    var source = getStorageValue('omdb_poster_source', 'tmdb');
    var sizeSetting = parseInt(getStorageValue('omdb_poster_size', '1'), 10);

    if (isNaN(sizeSetting)) sizeSetting = 1;

    var scaleEm = 0.9 + (sizeSetting * 0.1);
    var positionClass = getPositionClass();

    document.querySelectorAll('.card').forEach(function(card) {
      var data = card.card_data || card.dataset || {};
      var rawId = data.id || card.getAttribute('data-id') || String(card.getAttribute('data-card-id') || '0').replace('movie_', '');

      if (!rawId || rawId === '0') return;

      var id = String(rawId);
      var type = getCardType(data);
      var ratingKey = type + '_' + id;
      var customRateElement = card.querySelector('.omdb-custom-rate');

      if (!customRateElement || customRateElement.dataset.omdbId !== ratingKey) {
        if (customRateElement) customRateElement.remove();

        customRateElement = document.createElement('div');
        customRateElement.className = 'omdb-custom-rate ' + positionClass;
        customRateElement.dataset.omdbId = ratingKey;
        customRateElement.style.display = 'none';

        var parent = card.querySelector('.card__view') || card;
        var parentPosition = window.getComputedStyle ? window.getComputedStyle(parent).position : '';

        if (!parentPosition || parentPosition === 'static') {
          parent.style.position = 'relative';
        }

        parent.appendChild(customRateElement);
      } else {
        // Update position class if changed
        customRateElement.classList.remove('omdb-pos-bottom-right', 'omdb-pos-bottom-left', 'omdb-pos-top-right', 'omdb-pos-top-left');
        customRateElement.classList.add(positionClass);
      }

      if (source === 'none') {
        customRateElement.style.display = 'none';
        return;
      }

      customRateElement.style.fontSize = scaleEm + 'em';

      if (source === 'tmdb') {
        var tmdbRating = parseFloat(data.vote_average || 0);

        if (tmdbRating > 0) {
          renderPosterBadge(customRateElement, tmdbRating.toFixed(1), 'tmdb', ICON_TMDB_CARD);
        } else {
          customRateElement.style.display = 'none';
        }

        return;
      }

      if (source === 'imdb') {
        if (!getOmdbApiKey()) {
          customRateElement.style.display = 'none';
          return;
        }

        var cachedRating = getCachedOmdbRating(ratingKey);

        if (cachedRating && cachedRating !== 'N/A') {
          renderPosterBadge(customRateElement, cachedRating, 'imdb', ICON_IMDB_CARD);
          return;
        }

        customRateElement.style.display = 'none';

        if (cachedRating === null && (!retryStates[ratingKey] || Date.now() > retryStates[ratingKey].time)) {
          var alreadyInQueue = omdbRequestQueue.some(function(task) {
            return task.ratingKey === ratingKey;
          });

          if (!alreadyInQueue) {
            omdbRequestQueue.push({
              movie: data,
              id: id,
              ratingKey: ratingKey
            });
            processOmdbQueue();
          }
        }
      }
    });

    setTimeout(pollPosterCards, 500);
  }

  function addPosterRatingSettings() {
    if (window.poster_rating_settings_ready) return;

    if (!Lampa.SettingsApi) {
      setTimeout(addPosterRatingSettings, 500);
      return;
    }

    window.poster_rating_settings_ready = true;

    Lampa.SettingsApi.addComponent({
      component: 'omdb_ratings',
      name: 'Рейтинг на постере',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l3.09 6.26L22 10.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 15.14l-5-4.87 6.91-1.01L12 3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>'
    });

    Lampa.SettingsApi.addParam({
      component: 'omdb_ratings',
      param: { name: 'omdb_api_key', type: 'input', values: '', "default": '' },
      field: { name: 'OMDb API key', description: '' }
    });

    Lampa.SettingsApi.addParam({
      component: 'omdb_ratings',
      param: { name: 'omdb_status', type: 'trigger', values: '', "default": true },
      field: { name: 'Рейтинг на постере', description: '' }
    });

    Lampa.SettingsApi.addParam({
      component: 'omdb_ratings',
      param: {
        name: 'omdb_poster_source',
        type: 'select',
        values: { imdb: 'IMDb', tmdb: 'TMDb', none: 'Без рейтинга' },
        "default": 'tmdb'
      },
      field: { name: 'Источник рейтинга', description: '' }
    });

    Lampa.SettingsApi.addParam({
      component: 'omdb_ratings',
      param: {
        name: 'omdb_poster_position',
        type: 'select',
        values: { 
          'bottom-right': 'Снизу справа', 
          'bottom-left': 'Снизу слева', 
          'top-right': 'Сверху справа', 
          'top-left': 'Сверху слева' 
        },
        "default": 'bottom-right'
      },
      field: { name: 'Позиция рейтинга', description: '' },
      onChange: updatePositionClasses
    });

    Lampa.SettingsApi.addParam({
      component: 'omdb_ratings',
      param: {
        name: 'omdb_poster_size',
        type: 'select',
        values: { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4' },
        "default": '1'
      },
      field: { name: 'Размер рейтинга', description: '' }
    });

    Lampa.SettingsApi.addParam({
      component: 'omdb_ratings',
      param: { name: 'omdb_poster_glow', type: 'trigger', values: '', "default": true },
      field: { name: 'Цветное свечение', description: '' }
    });

    Lampa.SettingsApi.addParam({
      component: 'omdb_ratings',
      param: { name: 'omdb_cache_days', type: 'input', values: '', "default": '7' },
      field: { name: 'Срок хранения кеша (OMDb)', description: '' }
    });

    Lampa.SettingsApi.addParam({
      component: 'omdb_ratings',
      param: { type: 'button', name: 'omdb_clear_cache_btn' },
      field: { name: 'Очистить кеш постеров', description: '' },
      onChange: clearPosterCache
    });

    if (Lampa.Listener && Lampa.Listener.follow) {
      Lampa.Listener.follow('settings', function(event) {
        if (event.name === 'main') {
          var moveComponent = function() {
            if (!window.$) return;

            var interfaceItem = $('.settings-folder div[data-component="interface"]');
            var posterItem = $('.settings-folder div[data-component="omdb_ratings"]');

            if (interfaceItem.length && posterItem.length) {
              posterItem.insertAfter(interfaceItem);
            }
          };

          moveComponent();
          setTimeout(moveComponent, 50);
        }
      });
    }
  }

  function startPosterRatingPlugin() {
    if (window.poster_rating_plugin_started) return;

    window.poster_rating_plugin_started = true;
    cleanExpiredPosterCache();
    addPosterRatingSettings();
    pollPosterCards();
  }

  startPosterRatingPlugin();
})();
