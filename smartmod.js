(function () {
  'use strict';

  if (window.smartonline_plugin_v1)
    return;

  window.smartonline_plugin_v1 = true;

  var PLAYBACK_TIMEOUT_MS = 12000;
  var CONFIRM_OK_MS = 15000;
  var WAIT_INTERVAL_MS = 300;
  var WAIT_MAX_TRIES = 120;
  var STATS_KEY = 'lampac_smart_stats_v1';
  var CLARIFICATION_KEY = 'clarification_search';
  var FAIL_NOTIFY_KEY = 'lampac_smart_fail_notified_v1';
  var MANIFEST_SYNC_LIMIT = 6;
  var CFG_NOTIFY_RUNTIME = 'lampac_smart_notify_runtime';
  var CFG_VOICE_MODE = 'lampac_smart_voice_mode';
  var CFG_QUALITY_TARGET = 'lampac_smart_quality_target';
  var CFG_TIMEOUT_FAIL = 'lampac_smart_timeout_fail';
  var CFG_TIMEOUT_CONFIRM = 'lampac_smart_timeout_confirm';
  var CFG_STATS_SCOPE = 'lampac_smart_stats_scope';

  var runtime = {
    playback: null,
    playerHooksReady: false,
    fullHookReady: false,
    headButtonReady: false,
    manifestReady: false,
    componentReady: false,
    started: false,
    loadingBase: false,
    waitStarted: false,
    manifestTimer: null,
    manifestSyncCount: 0,
    settingsReady: false,
    baseComponentCache: ''
  };

  var SMART_MANIFEST_VERSION = '1.1.0';

  function detectBaseComponentFromManifest() {
    if (!window.Lampa || !Lampa.Manifest)
      return '';

    var plugins = Lampa.Manifest.plugins;
    var list = Array.isArray(plugins) ? plugins : [plugins];
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p || !p.component || p.component === 'iptv')
        continue;

      var text = (p.name || '') + ' ' + (p.description || '');
      if (/online|\u043E\u043D\u043B\u0430\u0439\u043D|nextgen|lampa|serial|film|movie|\u0444\u0438\u043B\u044C\u043C|\u0441\u0435\u0440\u0456\u0430\u043B/i.test(text))
        return p.component;
    }

    return '';
  }

  function baseComponentName() {
    if (window.lampac_base_component_name)
      return window.lampac_base_component_name;

    if (runtime.baseComponentCache && window.Lampa && Lampa.Component && Lampa.Component.get && Lampa.Component.get(runtime.baseComponentCache))
      return runtime.baseComponentCache;

    var detected = detectBaseComponentFromManifest();
    if (!detected && window.Lampa && Lampa.Component && Lampa.Component.get) {
      var candidates = ['lampac', 'LampaUaNg', 'online'];
      for (var i = 0; i < candidates.length; i++) {
        if (Lampa.Component.get(candidates[i])) {
          detected = candidates[i];
          break;
        }
      }
    }

    if (detected)
      runtime.baseComponentCache = detected;

    return runtime.baseComponentCache || 'lampac';
  }

  function smartComponentName() {
    return window.lampac_smart_component_name || (baseComponentName() + '_smart');
  }

  function notify(text) {
    if (window.Lampa && Lampa.Noty && Lampa.Noty.show)
      Lampa.Noty.show(text);
  }

  function settingValue(name, def) {
    if (!window.Lampa || !Lampa.Storage)
      return def;

    var val = Lampa.Storage.get(name, def);
    return val === undefined || val === null || val === '' ? def : val;
  }

  function settingBool(name, def) {
    var val = settingValue(name, def);
    if (typeof val === 'boolean')
      return val;
    return String(val) === 'true';
  }

  function settingInt(name, def) {
    var val = parseInt(settingValue(name, String(def)), 10);
    return isNaN(val) ? def : val;
  }

  function shouldNotifyRuntime() {
    return settingBool(CFG_NOTIFY_RUNTIME, false);
  }

  function getVoiceMode() {
    return String(settingValue(CFG_VOICE_MODE, 'ru'));
  }

  function getPlaybackTimeoutMs() {
    return Math.max(4, settingInt(CFG_TIMEOUT_FAIL, Math.round(PLAYBACK_TIMEOUT_MS / 1000))) * 1000;
  }

  function getConfirmTimeoutMs() {
    return Math.max(6, settingInt(CFG_TIMEOUT_CONFIRM, Math.round(CONFIRM_OK_MS / 1000))) * 1000;
  }

  function notifyOnce(key, text) {
    if (!window.Lampa || !Lampa.Storage) {
      notify(text);
      return;
    }

    if (Lampa.Storage.get(key, false))
      return;

    Lampa.Storage.set(key, true);
    notify(text);
  }

  function notifyRuntime(text) {
    if (shouldNotifyRuntime())
      notify(text);
  }

  function normalize(value) {
    return (value || '')
      .toString()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function keyify(value) {
    return normalize(value).replace(/[^a-z0-9\u0400-\u04FF]+/gi, '_').replace(/^_+|_+$/g, '') || 'unknown';
  }

  function getStats() {
    var data = Lampa.Storage.get(STATS_KEY, {});

    if (!Lampa.Arrays.isObject(data))
      data = {};
    if (!Lampa.Arrays.isObject(data.sources))
      data.sources = {};
    if (!Lampa.Arrays.isObject(data.voices))
      data.voices = {};

    return data;
  }

  function saveStats(data) {
    Lampa.Storage.set(STATS_KEY, data);
  }

  function statWeightByKey(data, type, key) {
    if (!key)
      return 0;

    var stat = data[type][key];
    if (!stat)
      return 0;

    return (stat.success || 0) * 8 - (stat.fail || 0) * 5;
  }

  function scopedStatsKey(type, key, context) {
    if (!key)
      return key;

    var scope = String(settingValue(CFG_STATS_SCOPE, 'media'));
    if (scope === 'global' || !context || !context.mediaType)
      return key;

    if (type === 'voices')
      return key + '::' + context.mediaType + '::' + (context.sourceKey || 'default');

    return key + '::' + context.mediaType;
  }

  function updateStats(type, key, success, context) {
    if (!key)
      return;

    var data = getStats();
    if (!Lampa.Arrays.isObject(data[type][key]))
      data[type][key] = { success: 0, fail: 0 };

    data[type][key][success ? 'success' : 'fail']++;

    var scoped = scopedStatsKey(type, key, context);
    if (scoped !== key) {
      if (!Lampa.Arrays.isObject(data[type][scoped]))
        data[type][scoped] = { success: 0, fail: 0 };
      data[type][scoped][success ? 'success' : 'fail']++;
    }

    saveStats(data);
  }

  function statsWeight(type, key, context) {
    if (!key)
      return 0;

    var data = getStats();
    var base = statWeightByKey(data, type, key);
    var scoped = scopedStatsKey(type, key, context);
    if (scoped === key)
      return base;

    return Math.round(base * 0.4 + statWeightByKey(data, type, scoped));
  }

  function preferredQuality() {
    var target = String(settingValue(CFG_QUALITY_TARGET, '1080'));
    if (target !== 'player') {
      var forced = parseInt(target, 10);
      if (!isNaN(forced) && forced > 0)
        return forced;
    }

    return parseInt(Lampa.Storage.get('video_quality_default', '1080'), 10) || 1080;
  }

  function getClarification(movie) {
    var id = Lampa.Utils.hash(movie.number_of_seasons ? movie.original_name : movie.original_title);
    var all = Lampa.Storage.get(CLARIFICATION_KEY, {});

    if (!Lampa.Arrays.isObject(all))
      all = {};

    return all[id];
  }

  function detectQuality(value) {
    var text = normalize(value);
    if (!text)
      return 0;

    if (/(2160|4k|uhd)/i.test(text))
      return 2160;
    if (/1080/i.test(text))
      return 1080;
    if (/720/i.test(text))
      return 720;
    if (/480/i.test(text))
      return 480;

    return 0;
  }

  function isUkrainianVoice(name) {
    var text = normalize(name);
    if (!text)
      return false;

    return /(aniua|uaflix|uaserial|uakino|\u0443\u043A\u0440|\u0443\u043A\u0440\u0430\u0457\u043D|\u0443\u043A\u0440\u0430\u0438\u043D|ua dub|ua-dub|ukr|rhs|red head sound)/i.test(text);
  }

  function isRussianVoice(name) {
    var text = normalize(name);
    if (!text)
      return false;
    return /(\u0440\u0443\u0441|\u0440\u043E\u0441|russian|lostfilm|novamedia|amedia|hdrezka)/i.test(text);
  }

  function voiceWeight(name) {
    var text = normalize(name);
    var score = 0;
    var mode = getVoiceMode();

    if (!text)
      return score;

    if (isUkrainianVoice(text)) {
      if (mode === 'ua')
        score += 120;
      else if (mode === 'ru')
        score -= 20;
      else if (mode === 'balanced')
        score += 20;
      else
        score += 0;
    }
    if (isRussianVoice(text)) {
      if (mode === 'ru')
        score += 120;
      else if (mode === 'ua')
        score -= 20;
      else if (mode === 'balanced')
        score += 20;
    }
    if (/(\u0434\u0443\u0431\u043B\u044F\u0436|dub\b|\u043E\u0437\u0432\u0443\u0447)/i.test(text))
      score += 18;
    if (/(\u043E\u0440\u0438\u0433\u0456\u043D\u0430\u043B|original)/i.test(text))
      score -= 8;
    if (/(\u0441\u0443\u0431\u0442|sub\b|subtitle)/i.test(text))
      score -= 18;

    return score;
  }
    function sourceWeight(source) {
    var text = normalize(source);
    if (/jacktor/.test(text))
      return 6;
    if (/animeon/.test(text))
      return 5;
    if (/bamboo/.test(text))
      return 4;
    return 0;
  }

  function getActiveSource() {
    return Lampa.Storage.get('active_balanser', '') || Lampa.Storage.get('online_balanser', '');
  }

  function itemQuality(item) {
    var max = 0;

    if (item && item.quality && Lampa.Arrays.isObject(item.quality)) {
      Lampa.Arrays.getKeys(item.quality).forEach(function (q) {
        max = Math.max(max, detectQuality(q + ' ' + item.quality[q]));
      });
    }

    max = Math.max(max, detectQuality(item && item.text));
    max = Math.max(max, detectQuality(item && item.url));
    max = Math.max(max, detectQuality(item && item.stream));

    return max;
  }

  function rankVoices(buttons, sourceName, context) {
    var sourceKey = keyify(sourceName);
    var voiceMode = getVoiceMode();

    return buttons.map(function (button, index) {
      var title = button.text || '';
      var score = voiceWeight(title) + statsWeight('voices', keyify(title), context) + statsWeight('sources', sourceKey, context);

      if (button.active)
        score += 1;

      return {
        index: index,
        title: title,
        url: button.url,
        active: !!button.active,
        score: score,
        isUkrainian: isUkrainianVoice(title)
      };
    }).sort(function (a, b) {
      if (voiceMode === 'ua' && a.isUkrainian !== b.isUkrainian)
        return a.isUkrainian ? -1 : 1;
      if (voiceMode === 'ru' && a.isRussian !== b.isRussian)
        return a.isRussian ? -1 : 1;
      return b.score - a.score;
    });
  }

  function bestVoice(buttons, sourceName, context) {
    return rankVoices(buttons, sourceName, context)[0] || null;
  }

  function buildQueue(videos, sourceName, fallbackVoice, context) {
    var prefQuality = preferredQuality();
    var map = {};
    var voiceMode = getVoiceMode();

    videos.forEach(function (item) {
      var voiceName = item.voice_name || item.text || fallbackVoice || '';
      var voiceKey = keyify(voiceName);
      var sourceKey = keyify(sourceName);
      var quality = itemQuality(item);
      var urlHint = normalize(item.url || item.stream || '');
      var score = 0;

      if (!item || (!item.url && !item.stream))
        return;

      score += voiceWeight(voiceName);
      score += sourceWeight(sourceName);
      score += statsWeight('voices', voiceKey, context);
      score += statsWeight('sources', sourceKey, context);
      score += quality ? Math.round(quality / 120) : 0;
      score += item.method === 'play' ? 10 : 4;
      if (quality && quality >= prefQuality)
        score += 10;
      if (/m3u8/.test(urlHint))
        score += 4;
      if (/mp4/.test(urlHint))
        score += 2;
      if (/iframe|embed/.test(urlHint))
        score -= 4;

      var candidate = {
        id: Lampa.Utils.hash([sourceKey, voiceKey, item.url || item.stream || item.text || Math.random()].join('::')),
        item: item,
        sourceKey: sourceKey,
        sourceName: sourceName || '',
        voiceKey: voiceKey,
        voiceName: voiceName,
        statsContext: context,
        quality: quality,
        score: score,
        isUkrainian: isUkrainianVoice(voiceName),
        isRussian: isRussianVoice(voiceName)
      };

      if (!map[candidate.id] || map[candidate.id].score < candidate.score)
        map[candidate.id] = candidate;
    });

    return Object.keys(map).map(function (id) {
      return map[id];
    }).sort(function (a, b) {
      if (voiceMode === 'ua' && a.isUkrainian !== b.isUkrainian)
        return a.isUkrainian ? -1 : 1;
      return b.score - a.score;
    });
  }

  function clearPlayback(playback) {
    if (!playback)
      return;

    clearTimeout(playback.failTimer);
    clearTimeout(playback.cleanupTimer);
    if (runtime.playback === playback)
      runtime.playback = null;
  }

  function activityComponentInstance(activity) {
    if (!activity || !activity.activity || !activity.activity.component)
      return null;

    return typeof activity.activity.component === 'function'
      ? activity.activity.component()
      : activity.activity.component;
  }

  function failPlayback(playback, reason) {
    if (!playback || playback.failing)
      return;

    playback.failing = true;
    clearTimeout(playback.failTimer);
    clearTimeout(playback.cleanupTimer);

    if (playback.candidate) {
      updateStats('sources', playback.candidate.sourceKey, false, playback.candidate.statsContext);
      updateStats('voices', playback.candidate.voiceKey, false, playback.candidate.statsContext);
    }

    setTimeout(function () {
      playback.failing = false;
      playNextCandidate(playback.instance, playback.state, reason || 'fail');
    }, 250);
  }

  function buildPlayElement(instance, candidate, json, jsonCall) {
    var play = instance.toPlayElement(candidate.item);

    play.url = json.url;
    play.headers = jsonCall.headers || json.headers;
    play.quality = jsonCall.quality || candidate.item.qualitys || candidate.item.quality;
    play.segments = jsonCall.segments || candidate.item.segments;
    play.hls_manifest_timeout = jsonCall.hls_manifest_timeout || json.hls_manifest_timeout;
    play.subtitles = json.subtitles;
    play.subtitles_call = jsonCall.subtitles_call || json.subtitles_call;
    play.isonline = true;
    play._lampacSmartId = candidate.id;

    if (json.vast && json.vast.url) {
      play.vast_url = json.vast.url;
      play.vast_msg = json.vast.msg;
      play.vast_region = json.vast.region;
      play.vast_platform = json.vast.platform;
      play.vast_screen = json.vast.screen;
    }

    instance.orUrlReserve(play);
    if (play.quality && Lampa.Arrays.isObject(play.quality))
      instance.setDefaultQuality(play);

    return play;
  }

  function playNextCandidate(instance, state, reason) {
    if (!state || state.manualMode)
      return;

    state.autoStarted = true;
    state.queueIndex++;

    if (!state.queue.length || state.queueIndex >= state.queue.length) {
      if (runtime.playback && runtime.playback.state === state)
        clearPlayback(runtime.playback);

      if (state.tryNextVoice && state.tryNextVoice())
        return;

      notifyRuntime(Lampa.Lang.translate('lampac_smart_manual_needed'));
      return;
    }

    var candidate = state.queue[state.queueIndex];
    state.currentCandidate = candidate;

    if (reason && reason !== 'autostart')
      notifyRuntime(Lampa.Lang.translate('lampac_smart_retrying'));

    instance.getFileUrl(candidate.item, function (json, jsonCall) {
      if (!json || !json.url) {
        failPlayback({
          instance: instance,
          state: state,
          candidate: candidate
        }, 'resolve');
        return;
      }

      var play = buildPlayElement(instance, candidate, json, jsonCall || {});
      var playback = {
        instance: instance,
        state: state,
        candidate: candidate,
        play: play,
        readyAt: 0,
        failing: false,
        failTimer: null,
        cleanupTimer: null
      };

      runtime.playback = playback;

      if (Lampa.Storage.field('player') === 'inner') {
        playback.failTimer = setTimeout(function () {
          failPlayback(playback, 'timeout');
        }, getPlaybackTimeoutMs());
      }

      Lampa.Player.play(play);
      if (play.subtitles_call)
        instance.loadSubtitles(play.subtitles_call);
      if (candidate.item.mark)
        candidate.item.mark();
    }, true);
  }

  function installPlayerHooks() {
    if (runtime.playerHooksReady)
      return true;
    if (!Lampa.Player || !Lampa.Player.listener || !Lampa.Player.listener.follow)
      return false;

    runtime.playerHooksReady = true;

    Lampa.Player.listener.follow('start', function (data) {
      var playback = runtime.playback;
      if (!playback || !data || data._lampacSmartId !== playback.candidate.id)
        return;

      if (Lampa.Storage.field('player') !== 'inner') {
        updateStats('sources', playback.candidate.sourceKey, true, playback.candidate.statsContext);
        updateStats('voices', playback.candidate.voiceKey, true, playback.candidate.statsContext);
        clearPlayback(playback);
      }
    });

    Lampa.Player.listener.follow('ready', function (data) {
      var playback = runtime.playback;
      if (!playback || !data || data._lampacSmartId !== playback.candidate.id)
        return;

      playback.readyAt = Date.now();
      clearTimeout(playback.failTimer);
      updateStats('sources', playback.candidate.sourceKey, true, playback.candidate.statsContext);
      updateStats('voices', playback.candidate.voiceKey, true, playback.candidate.statsContext);
      playback.cleanupTimer = setTimeout(function () {
        clearPlayback(playback);
      }, getConfirmTimeoutMs() + 5000);
    });

    Lampa.Player.listener.follow('error', function () {
      var playback = runtime.playback;
      if (!playback)
        return;

      if (playback.readyAt && Date.now() - playback.readyAt > getConfirmTimeoutMs()) {
        clearPlayback(playback);
        return;
      }

      try {
        if (Lampa.Player.close)
          Lampa.Player.close();
      } catch (e) {}

      failPlayback(playback, 'player-error');
    });

    Lampa.Player.listener.follow('ended', function () {
      if (runtime.playback)
        clearPlayback(runtime.playback);
    });

    return true;
  }

  function smartActivity(movie) {
    var clarification = getClarification(movie);

    return {
      url: '',
      title: Lampa.Lang.translate('lampac_smart_watch'),
      component: smartComponentName(),
      search: clarification ? clarification : movie.title,
      search_one: movie.title,
      search_two: movie.original_title,
      movie: movie,
      page: 1,
      clarification: clarification ? true : false
    };
  }

  function addHeadButton() {
    if (runtime.headButtonReady)
      return;

    runtime.headButtonReady = true;

    var button = $('<div class="head__action selector lampac-smart-manual" style="display:none;"><span style="font-size:1.05em;font-weight:700;">MAN</span></div>');

    button.on('hover:enter', function () {
      var active = Lampa.Activity.active();
      if (!active || active.component !== smartComponentName())
        return;

      var component = activityComponentInstance(active);
      if (component && component._lampacSmart && component._lampacSmart.enableManual)
        component._lampacSmart.enableManual();

      Lampa.Activity.replace({
        component: baseComponentName()
      });
    });

    $('.head .open--search').after(button);

    Lampa.Listener.follow('activity', function (e) {
      if (!e || e.type !== 'start')
        return;

      setTimeout(function () {
        var active = Lampa.Activity.active();
        if (active && active.component === smartComponentName())
          button.show();
        else
          button.hide();
      }, 0);
    });
  }

  function addFullButton() {
    if (runtime.fullHookReady)
      return;

    runtime.fullHookReady = true;

    function buildButton(movie) {
      var btn = $(
        '<div class="full-start__button full-start-new__button selector view--online lampac-smart-button" data-subtitle="' + Lampa.Lang.translate('lampac_smart_descr') + '">' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">' +
            '<path d="M13.5 2 4 14h6l-1.5 8L18 10h-6l1.5-8Z"></path>' +
          '</svg>' +
          '<span>' + Lampa.Lang.translate('lampac_smart_watch') + '</span>' +
        '</div>'
      );

      btn.on('hover:enter', function () {
        Lampa.Activity.push(smartActivity(movie));
      });

      return btn;
    }

    function hasSmartInScope(scope) {
      if (!scope || !scope.length)
        return false;
      return scope.find('.lampac-smart-button').length > 0;
    }

    function insertNearAnchor(anchor, movie) {
      if (!anchor || !anchor.length || !movie)
        return;

      var root = anchor.eq(0);
      var panel = root.closest('.full-start, .full, .activity, .full-start-new').eq(0);
      if (panel.length && hasSmartInScope(panel))
        return;
      if (!panel.length && root.parent().find('.lampac-smart-button').length)
        return;

      var btn = buildButton(movie);
      var parent = root.parent();
      if (parent && parent.length && parent.is('[class*="buttons"]'))
        root.after(btn);
      else
        root.append(btn);
    }

    function addButton(data) {
      if (!data || !data.render || !data.render.length || !data.movie)
        return;

      var render = data.render;
      var viewTorrent = render.find('.view--torrent');
      if (viewTorrent.length) {
        insertNearAnchor(viewTorrent.eq(0), data.movie);
        return;
      }

      var firstOnlineButton = render.find('.lampac--button, .full-start__button.view--online').eq(0);
      if (firstOnlineButton.length) {
        insertNearAnchor(firstOnlineButton, data.movie);
        return;
      }

      var buttons = render.find('.full-start__buttons, .full-start-new__buttons, [class*="full-start"][class*="buttons"]').eq(0);
      if (buttons.length) {
        if (!hasSmartInScope(buttons))
          buttons.append(buildButton(data.movie));
        return;
      }

      var firstAction = render.find('.button--play, .full-start__button, .full-start-new__button, .selector').eq(0);
      if (firstAction.length) {
        insertNearAnchor(firstAction, data.movie);
        return;
      }

      insertNearAnchor(render.eq(0), data.movie);
    }

    function injectFromActive() {
      try {
        var active = Lampa.Activity.active();
        if (!active || active.component !== 'full' || !active.activity || !active.activity.render)
          return;

        addButton({
          render: active.activity.render(),
          movie: active.card
        });
      } catch (e) {}
    }

    Lampa.Listener.follow('full', function (e) {
      if (e.type === 'complite') {
        addButton({
          render: e.object.activity.render().find('.view--torrent'),
          movie: e.data.movie
        });
      }
    });

    Lampa.Listener.follow('activity', function (e) {
      if (e && e.type === 'start')
        setTimeout(injectFromActive, 30);
    });

    injectFromActive();

    runtime.fullTicker = setInterval(injectFromActive, 1500);
  }

  function addLang() {
    Lampa.Lang.add({
      lampac_smart_watch: { ru: 'Smart Online', en: 'Smart Online', uk: 'Smart Online', zh: 'Smart Online' },
      lampac_smart_descr: { ru: '\u0410\u0432\u0442\u043E \u0432\u044B\u0431\u043E\u0440 \u043F\u043E\u0442\u043E\u043A\u0430', en: 'Auto stream select', uk: '\u0410\u0432\u0442\u043E\u0432\u0438\u0431\u0456\u0440 \u043F\u043E\u0442\u043E\u043A\u0443', zh: 'Auto stream select' },
      lampac_smart_retrying: { ru: '\u041F\u043E\u0442\u043E\u043A \u043D\u0435 \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u043B\u0441\u044F, \u043F\u0440\u043E\u0431\u0443\u044E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439', en: 'Stream failed, trying next', uk: '\u041F\u043E\u0442\u0456\u043A \u043D\u0435 \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0432\u0441\u044F, \u043F\u0440\u043E\u0431\u0443\u044E \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u0438\u0439', zh: 'Stream failed, trying next' },
      lampac_smart_manual_needed: { ru: '\u0410\u0432\u0442\u043E\u0432\u044B\u0431\u043E\u0440 \u043D\u0435 \u0441\u0440\u0430\u0431\u043E\u0442\u0430\u043B, \u043F\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u0432 \u0440\u0443\u0447\u043D\u043E\u0439 \u0440\u0435\u0436\u0438\u043C', en: 'Autoselect failed, switch to MAN', uk: '\u0410\u0432\u0442\u043E\u0432\u0438\u0431\u0456\u0440 \u043D\u0435 \u0441\u043F\u0440\u0430\u0446\u044E\u0432\u0430\u0432, \u043F\u0435\u0440\u0435\u0439\u0434\u0456\u0442\u044C \u0443 \u0440\u0443\u0447\u043D\u0438\u0439 \u0440\u0435\u0436\u0438\u043C', zh: 'Autoselect failed, switch to MAN' },
      lampac_smart_manual: { ru: '\u0420\u0443\u0447\u043D\u043E\u0439 \u0440\u0435\u0436\u0438\u043C', en: 'Manual mode', uk: '\u0420\u0443\u0447\u043D\u0438\u0439 \u0440\u0435\u0436\u0438\u043C', zh: 'Manual mode' },
      lampac_smart_settings_title: { ru: '\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 Smart Online', en: 'Smart Online settings', uk: '\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F Smart Online', zh: 'Smart Online settings' },
      lampac_smart_settings_noty: { ru: '\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0441\u043B\u0443\u0436\u0435\u0431\u043D\u044B\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F', en: 'Runtime notifications', uk: '\u041F\u043E\u043A\u0430\u0437\u0443\u0432\u0430\u0442\u0438 \u0441\u043B\u0443\u0436\u0431\u043E\u0432\u0456 \u0441\u043F\u043E\u0432\u0456\u0449\u0435\u043D\u043D\u044F', zh: 'Runtime notifications' },
      lampac_smart_settings_voice: { ru: '\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442 \u043E\u0437\u0432\u0443\u0447\u043A\u0438', en: 'Voice priority', uk: '\u041F\u0440\u0456\u043E\u0440\u0438\u0442\u0435\u0442 \u043E\u0437\u0432\u0443\u0447\u043A\u0438', zh: 'Voice priority' },
      lampac_smart_settings_quality: { ru: '\u0426\u0435\u043B\u0435\u0432\u043E\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E', en: 'Target quality', uk: '\u0426\u0456\u043B\u044C\u043E\u0432\u0430 \u044F\u043A\u0456\u0441\u0442\u044C', zh: 'Target quality' },
      lampac_smart_settings_fail_timeout: { ru: '\u0422\u0430\u0439\u043C\u0430\u0443\u0442 \u043D\u0435\u0443\u0434\u0430\u0447\u043D\u043E\u0433\u043E \u0441\u0442\u0430\u0440\u0442\u0430 (\u0441\u0435\u043A.)', en: 'Fail timeout (sec)', uk: '\u0422\u0430\u0439\u043C\u0430\u0443\u0442 \u043D\u0435\u0432\u0434\u0430\u043B\u043E\u0433\u043E \u0441\u0442\u0430\u0440\u0442\u0443 (\u0441\u0435\u043A.)', zh: 'Fail timeout (sec)' },
      lampac_smart_settings_confirm_timeout: { ru: '\u0422\u0430\u0439\u043C\u0430\u0443\u0442 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F (\u0441\u0435\u043A.)', en: 'Confirm timeout (sec)', uk: '\u0422\u0430\u0439\u043C\u0430\u0443\u0442 \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043D\u044F (\u0441\u0435\u043A.)', zh: 'Confirm timeout (sec)' },
      lampac_smart_settings_scope: { ru: '\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0438', en: 'Stats profile', uk: '\u041F\u0440\u043E\u0444\u0456\u043B\u044C \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0438', zh: 'Stats profile' },
      lampac_smart_settings_clear_stats: { ru: '\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0443 Smart', en: 'Reset Smart stats', uk: '\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u0438 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0443 Smart', zh: 'Reset Smart stats' },
      lampac_smart_settings_cleared: { ru: '\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 Smart \u043E\u0447\u0438\u0449\u0435\u043D\u0430', en: 'Smart stats reset', uk: '\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0443 Smart \u043E\u0447\u0438\u0449\u0435\u043D\u043E', zh: 'Smart stats reset' }
    });
  }

  function registerSettings() {
    if (runtime.settingsReady)
      return true;
    if (!window.Lampa || !Lampa.SettingsApi)
      return false;

    runtime.settingsReady = true;

    Lampa.SettingsApi.addComponent({
      component: 'smart_online',
      name: '\u0421\u043C\u0430\u0440\u0442 Online',
      icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 2L4 14H10L8.5 22L18 10H12L13.5 2Z" fill="white"/></svg>'
    });

    Lampa.SettingsApi.addParam({
      component: 'smart_online',
      param: { type: 'title' },
      field: { name: Lampa.Lang.translate('lampac_smart_settings_title') }
    });

    Lampa.SettingsApi.addParam({
      component: 'smart_online',
      param: {
        name: CFG_NOTIFY_RUNTIME,
        type: 'trigger',
        "default": false
      },
      field: { name: Lampa.Lang.translate('lampac_smart_settings_noty') }
    });

    Lampa.SettingsApi.addParam({
      component: 'smart_online',
      param: {
        name: CFG_VOICE_MODE,
        type: 'select',
        values: {
          ru: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439 \u0432 \u043F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442\u0435',
          ua: '\u0423\u043A\u0440\u0430\u0438\u043D\u0441\u043A\u0438\u0439',
          balanced: '\u0421\u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E',
          neutral: '\u041D\u0435\u0439\u0442\u0440\u0430\u043B\u044C\u043D\u043E'
        },
        "default": 'ru'
      },
      field: { name: Lampa.Lang.translate('lampac_smart_settings_voice') }
    });

    Lampa.SettingsApi.addParam({
      component: 'smart_online',
      param: {
        name: CFG_QUALITY_TARGET,
        type: 'select',
        values: {
          player: '#{settings_player_quality}',
          '2160': '2160p',
          '1080': '1080p',
          '720': '720p',
          '480': '480p'
        },
        "default": '1080'
      },
      field: { name: Lampa.Lang.translate('lampac_smart_settings_quality') }
    });

    Lampa.SettingsApi.addParam({
      component: 'smart_online',
      param: {
        name: CFG_TIMEOUT_FAIL,
        type: 'select',
        values: { '8': '8', '12': '12', '16': '16', '20': '20' },
        "default": '12'
      },
      field: { name: Lampa.Lang.translate('lampac_smart_settings_fail_timeout') }
    });

    Lampa.SettingsApi.addParam({
      component: 'smart_online',
      param: {
        name: CFG_TIMEOUT_CONFIRM,
        type: 'select',
        values: { '10': '10', '15': '15', '20': '20', '25': '25' },
        "default": '15'
      },
      field: { name: Lampa.Lang.translate('lampac_smart_settings_confirm_timeout') }
    });

    Lampa.SettingsApi.addParam({
      component: 'smart_online',
      param: {
        name: CFG_STATS_SCOPE,
        type: 'select',
        values: {
          media: '\u041F\u043E \u0442\u0438\u043F\u0443 \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0430',
          global: '\u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u044B\u0439'
        },
        "default": 'media'
      },
      field: { name: Lampa.Lang.translate('lampac_smart_settings_scope') }
    });

    Lampa.SettingsApi.addParam({
      component: 'smart_online',
      param: { type: 'button' },
      field: { name: Lampa.Lang.translate('lampac_smart_settings_clear_stats') },
      onChange: function onChange() {
        Lampa.Storage.set(STATS_KEY, { sources: {}, voices: {} });
        notify(Lampa.Lang.translate('lampac_smart_settings_cleared'));
      }
    });

    return true;
  }

  function registerManifest() {
    if (!window.Lampa || !Lampa.Manifest)
      return false;

    runtime.manifestReady = true;
    window.smartonline_plugin = true;

    var manifest = {
      type: 'video',
      version: '',
      name: 'Smart Online',
      description: '\u0410\u0432\u0442\u043E\u0432\u0438\u0431\u0456\u0440 \u043F\u043E\u0442\u043E\u043A\u0443',
      apn: '',
      component: smartComponentName(),
      onContextMenu: function onContextMenu() {
        return {
          name: Lampa.Lang.translate('lampac_smart_watch'),
          description: ''
        };
      },
      onContextLauch: function onContextLauch(object) {
        var smartReady = !!(Lampa.Component && Lampa.Component.get && Lampa.Component.get(smartComponentName()));
        if (!smartReady)
          smartReady = installComponent();

        if (smartReady) {
          Lampa.Activity.push(smartActivity(object));
          return;
        }

        Lampa.Activity.push({
          url: '',
          title: Lampa.Lang.translate('title_online') || 'Online',
          component: baseComponentName(),
          search: object.title,
          search_one: object.title,
          search_two: object.original_title,
          movie: object,
          page: 1
        });
      }
    };

    var plugins = Lampa.Manifest.plugins;
    if (Array.isArray(plugins)) {
      var replaced = false;
      for (var i = 0; i < plugins.length; i++) {
        var p = plugins[i];
        if (!p)
          continue;
        if (p.name === 'Smart Online' || p.name === 'Smart \u041E\u043D\u043B\u0430\u0439\u043D' || p.component === smartComponentName()) {
          if (p.name === manifest.name && p.component === manifest.component && String(p.version || '') === String(manifest.version || '') && p.description === manifest.description)
            return true;
          plugins[i] = manifest;
          replaced = true;
          break;
        }
      }
      if (!replaced)
        plugins.push(manifest);
    } else if (plugins && typeof plugins === 'object') {
      if (plugins.name === 'Smart Online' || plugins.name === 'Smart \u041E\u043D\u043B\u0430\u0439\u043D' || plugins.component === smartComponentName()) {
        if (plugins.name !== manifest.name || plugins.component !== manifest.component || String(plugins.version || '') !== String(manifest.version || '') || plugins.description !== manifest.description)
          Lampa.Manifest.plugins = manifest;
      } else
        Lampa.Manifest.plugins = [plugins, manifest];
    } else {
      Lampa.Manifest.plugins = manifest;
    }
    return true;
  }

  function scheduleManifestSync() {
    if (runtime.manifestTimer)
      return;

    runtime.manifestSyncCount = 0;
    runtime.manifestTimer = setInterval(function () {
      runtime.manifestSyncCount++;
      registerManifest();

      if (runtime.manifestSyncCount >= MANIFEST_SYNC_LIMIT) {
        clearInterval(runtime.manifestTimer);
        runtime.manifestTimer = null;
      }
    }, 2000);
  }

  function installComponent() {
    if (runtime.componentReady)
      return true;
    if (!Lampa.Component || !Lampa.Component.get)
      return false;

    var BaseLampac = Lampa.Component.get(baseComponentName());
    if (!BaseLampac)
      return false;

    runtime.componentReady = true;

    function SmartLampac(object) {
      BaseLampac.call(this, object);

      var self = this;
      var baseParse = this.parse;
      var state = {
        manualMode: false,
        autoStarted: false,
        autoTimer: null,
        queue: [],
        queueIndex: -1,
        currentCandidate: null,
        lastVoiceUrl: '',
        sourceName: '',
        voiceQueue: [],
        voiceIndex: -1,
        voiceSignature: '',
        statsContext: {
          mediaType: object.movie && object.movie.number_of_seasons ? 'tv' : 'movie',
          sourceKey: ''
        }
      };

      function stopAuto() {
        clearTimeout(state.autoTimer);
        state.autoTimer = null;
      }

      function enableManual() {
        state.manualMode = true;
        stopAuto();
        if (runtime.playback && runtime.playback.state === state)
          clearPlayback(runtime.playback);
        notifyRuntime(Lampa.Lang.translate('lampac_smart_manual'));
      }

      function syncVoiceQueue(parsed) {
        if (!parsed || !parsed.buttons || !parsed.buttons.length)
          return;

        state.statsContext = state.statsContext || {
          mediaType: object.movie && object.movie.number_of_seasons ? 'tv' : 'movie',
          sourceKey: keyify(state.sourceName || '')
        };

        var queue = rankVoices(parsed.buttons, state.sourceName, state.statsContext);
        var signature = queue.map(function (voice) {
          return voice.url;
        }).join('|');

        if (signature !== state.voiceSignature) {
          state.voiceQueue = queue;
          state.voiceSignature = signature;
          var currentIndex = -1;
          if (state.lastVoiceUrl) {
            for (var i = 0; i < queue.length; i++) {
              if (queue[i].url === state.lastVoiceUrl) {
                currentIndex = i;
                break;
              }
            }
          }

          state.voiceIndex = currentIndex >= 0 ? currentIndex : 0;
        } else if (state.voiceIndex < 0) {
          state.voiceIndex = 0;
        }
      }

      function tryVoiceByIndex(index) {
        var candidate = state.voiceQueue[index];
        if (!candidate || !candidate.url)
          return false;

        state.voiceIndex = index;

        if (candidate.active) {
          state.autoStarted = false;
          state.queue = [];
          state.queueIndex = -1;
          state.currentCandidate = null;
          state.lastVoiceUrl = candidate.url;
          self.replaceChoice({
            voice: candidate.index,
            voice_name: candidate.title,
            voice_url: candidate.url
          });
          return false;
        }

        if (state.lastVoiceUrl === candidate.url)
          return false;

        state.lastVoiceUrl = candidate.url;
        state.autoStarted = false;
        state.queue = [];
        state.queueIndex = -1;
        state.currentCandidate = null;
        self.replaceChoice({
          voice: candidate.index,
          voice_name: candidate.title,
          voice_url: candidate.url
        });
        self.request(candidate.url);
        return true;
      }

      state.tryNextVoice = function () {
        if (!state.voiceQueue.length)
          return false;

        var nextIndex = state.voiceIndex + 1;
        if (nextIndex >= state.voiceQueue.length)
          return false;

        return tryVoiceByIndex(nextIndex);
      };

      function inspect(str) {
        var json = Lampa.Arrays.decodeJson(str, {});
        if (Lampa.Arrays.isObject(str) && str.rch)
          return { rch: true };
        if (json.rch)
          return { rch: true };

        try {
          var items = self.parseJsonDate(str, '.videos__item');
          var buttons = self.parseJsonDate(str, '.videos__button');

          return {
            items: items,
            buttons: buttons,
            videos: items.filter(function (item) {
              return item.method === 'play' || item.method === 'call';
            })
          };
        } catch (e) {
          return null;
        }
      }

      function maybeSwitchVoice(parsed) {
        if (!parsed || !parsed.buttons || !parsed.buttons.length || state.manualMode)
          return false;

        state.sourceName = getActiveSource();
        state.statsContext = state.statsContext || {
          mediaType: object.movie && object.movie.number_of_seasons ? 'tv' : 'movie',
          sourceKey: ''
        };
        state.statsContext.sourceKey = keyify(state.sourceName || '');
        syncVoiceQueue(parsed);

        var best = bestVoice(parsed.buttons, state.sourceName, state.statsContext);
        if (!best || !best.url)
          return false;

        if (state.voiceIndex < 0)
          state.voiceIndex = 0;

        return tryVoiceByIndex(state.voiceIndex);
      }

      function maybeAutoplay(parsed) {
        if (!parsed || !parsed.videos || !parsed.videos.length)
          return;
        if (state.manualMode || state.autoStarted)
          return;
        if (object.movie && object.movie.name)
          return;

        stopAuto();
        state.sourceName = getActiveSource();

        state.autoTimer = setTimeout(function () {
          if (state.manualMode || state.autoStarted)
            return;

          state.autoStarted = false;
          state.currentCandidate = null;
          state.statsContext = state.statsContext || {
            mediaType: object.movie && object.movie.number_of_seasons ? 'tv' : 'movie',
            sourceKey: ''
          };
          state.statsContext.sourceKey = keyify(state.sourceName || '');
          state.queue = buildQueue(parsed.videos, state.sourceName, self.getChoice().voice_name || '', state.statsContext);
          state.queueIndex = -1;

          if (!state.queue.length)
            return;

          playNextCandidate(self, state, 'autostart');
        }, 150);
      }

      this._lampacSmart = {
        enableManual: enableManual
      };

      this.parse = function (str) {
        var parsed = inspect(str);

        if (parsed && maybeSwitchVoice(parsed))
          return;

        var result = baseParse.call(this, str);
        if (parsed && parsed.videos && parsed.videos.length)
          maybeAutoplay(parsed);
        return result;
      };
    }

    SmartLampac.prototype = Object.create(BaseLampac.prototype);
    SmartLampac.prototype.constructor = SmartLampac;

    Lampa.Component.add(smartComponentName(), SmartLampac);
    return true;
  }

  function ensureRuntime() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;

      var playerReady = installPlayerHooks();
      var componentReady = installComponent();
      var manifestReady = registerManifest();
      var settingsReady = registerSettings();

      if (!componentReady && !runtime.loadingBase) {
        ensureBaseOnline(function () {});
      }

      if (componentReady && manifestReady && settingsReady && (playerReady || tries >= WAIT_MAX_TRIES)) {
        clearInterval(timer);
      } else if (tries >= WAIT_MAX_TRIES * 2) {
        clearInterval(timer);
      }
    }, WAIT_INTERVAL_MS);
  }

  function buildOnlineScriptUrl() {
    var token = '';
    var localhost = 'http://bwa.ad/rc';

    if (token)
      return localhost + '/online/js/' + token;
    return localhost + '/online.js';
  }

  function loadScript(url, done) {
    var script = document.createElement('script');
    script.src = url;
    script.async = true;

    script.onload = function () {
      if (done)
        done(true);
    };

    script.onerror = function () {
      if (done)
        done(false);
    };

    document.head.appendChild(script);
  }

  function ensureBaseOnline(done) {
    if (window.lampac_plugin) {
      done(true);
      return;
    }

    if (runtime.loadingBase) {
      var wait = 0;
      var timer = setInterval(function () {
        wait++;
        if (window.lampac_plugin) {
          clearInterval(timer);
          done(true);
        } else if (wait >= WAIT_MAX_TRIES) {
          clearInterval(timer);
          done(false);
        }
      }, WAIT_INTERVAL_MS);
      return;
    }

    runtime.loadingBase = true;
    loadScript(buildOnlineScriptUrl(), function (ok) {
      runtime.loadingBase = false;
      done(ok && !!window.lampac_plugin);
    });
  }

  function start() {
    if (runtime.started)
      return;

    runtime.started = true;
    window.smartonline_started = true;
    window.smartonline_plugin = true;
    addLang();
    registerSettings();
    installPlayerHooks();
    installComponent();
    registerManifest();
    addFullButton();
    addHeadButton();
    ensureRuntime();
    scheduleManifestSync();
  }

  function waitLampac() {
    if (runtime.waitStarted)
      return;

    runtime.waitStarted = true;
    var tries = 0;
    var timer = setInterval(function () {
      tries++;

      if (window.Lampa) {
        clearInterval(timer);
        runtime.waitStarted = false;
        ensureBaseOnline(function (ok) {
          start();

          if (!ok && shouldNotifyRuntime())
            notifyOnce(FAIL_NOTIFY_KEY, '\u0421\u043C\u0430\u0440\u0442 Online: \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0431\u0430\u0437\u043E\u0432\u044B\u0439 online-\u043F\u043B\u0430\u0433\u0438\u043D');
        });
      } else if (tries >= WAIT_MAX_TRIES) {
        clearInterval(timer);
        runtime.waitStarted = false;
      }
    }, WAIT_INTERVAL_MS);
  }
  waitLampac();

  if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready')
        waitLampac();
    });
  }
})();
