(function () {
  "use strict";

  if (window.androidFavBridgePlugin) return;
  window.androidFavBridgePlugin = true;

  // Android TV: каналы из избранного LAMPA.
  //
  // Показывает на главном экране Android TV каналы с карточками из избранного LAMPA:
  // Смотрю, Продолжить, Просмотрено, История, Нравится, Закладки, Запланировано, Брошено.
  //
  // Требования: приложение LAMPA для Android (плагин использует его интерфейс AndroidJS).
  // В браузере и на других платформах плагин ничего не делает.
  //
  // Подключение: LAMPA -> Настройки -> Расширения -> добавить адрес этого файла.
  // Android TV сам показывает только первый канал приложения; остальные включаются в лаунчере
  // через «Настроить каналы».
  //
  // Как работает: при запуске плагин передаёт избранное приложению и по очереди обновляет каналы;
  // при изменении избранного передаёт новые данные, а нужный канал приложение обновляет само.
  // Новые карточки появляются на главном экране с задержкой, которую задаёт Android TV.

  var KEY = "favorite";

  // Максимум карточек в одном канале.
  var CHANNEL_CAP = 100;

  // Списки избранного, которые передаются приложению.
  var LISTS = ["history", "viewed", "wath", "book", "like", "look", "continued", "thrown", "scheduled"];

  // Каналы в порядке обновления при запуске. Ряд «Смотреть далее» (wath) приложение ведёт само,
  // поэтому его здесь нет; данные для него передаются вместе с остальными списками.
  var CHANNELS = ["look", "continued", "viewed", "history", "like", "book", "scheduled", "thrown"];

  // Интервал между обновлениями каналов при запуске, мс.
  var SEQ_GAP = 5000;

  // Задержка передачи данных после изменения избранного, мс: ждём паузу PUSH_DEBOUNCE,
  // но не дольше PUSH_MAX_WAIT от первого изменения в серии.
  var PUSH_DEBOUNCE = 300;
  var PUSH_MAX_WAIT = 1500;

  function log() {
    try {
      if (window.console && console.log)
        console.log.apply(console, ["[android_fav_bridge]"].concat([].slice.call(arguments)));
    } catch (e) {}
  }

  function hasBridge() {
    return typeof AndroidJS !== "undefined" &&
           AndroidJS &&
           typeof AndroidJS.storageChange === "function";
  }

  function canUpdateChannel() {
    return typeof AndroidJS !== "undefined" &&
           AndroidJS &&
           typeof AndroidJS.updateChannel === "function";
  }

  // Избранное LAMPA из localStorage.
  function rawFavorite() {
    try { return localStorage.getItem(KEY) || "{}"; }
    catch (e) { return "{}"; }
  }

  // Значение как строка; пустые значения не попадают в JSON.
  function s(v) { return (v === null || v === undefined) ? undefined : String(v); }

  // Карточка только с полями, которые нужны каналу Android TV, в ожидаемых приложением типах:
  // строки, а рейтинг — число (если он задан).
  function trimCard(c) {
    var o = {
      id: s(c.id),
      source: s(c.source),
      type: s(c.type),
      title: s(c.title),
      name: s(c.name),
      original_title: s(c.original_title),
      original_name: s(c.original_name),
      img: s(c.img),
      background_image: s(c.background_image),
      release_date: s(c.release_date),
      first_air_date: s(c.first_air_date),
      release_year: s(c.release_year)
    };
    var va = (typeof c.vote_average === "number") ? c.vote_average : parseFloat(c.vote_average);
    if (isFinite(va)) o.vote_average = va;
    return o;
  }

  // Избранное для передачи приложению: не больше CHANNEL_CAP последних id в каждом списке
  // и только карточки из этих списков.
  function buildTrimmedFavorite() {
    var fav;
    try { fav = JSON.parse(rawFavorite()); } catch (e) { return null; }
    if (!fav) return null;

    var out = {}, need = {};
    for (var i = 0; i < LISTS.length; i++) {
      var arr = fav[LISTS[i]];
      if (arr && arr.length) {
        var capped = arr.slice(0, CHANNEL_CAP); // новые записи в LAMPA идут первыми
        out[LISTS[i]] = capped;
        for (var k = 0; k < capped.length; k++) need[String(capped[k])] = 1;
      }
    }

    out.card = [];
    if (fav.card) {
      for (var c = 0; c < fav.card.length; c++) {
        var card = fav.card[c];
        if (card && need[String(card.id)]) out.card.push(trimCard(card));
      }
    }
    return out;
  }

  // Передаёт избранное приложению. Данные отправляются каждый раз, без сравнения с предыдущей
  // отправкой: при изменении избранного приложение обновляет их и со своей стороны.
  function pushFavorite() {
    if (!hasBridge()) { log("AndroidJS недоступен — плагин неактивен"); return null; }

    var trimmed = buildTrimmedFavorite();
    if (!trimmed) { log("favorite не разобрать"); return null; }

    var value = JSON.stringify(trimmed);
    try {
      AndroidJS.storageChange(JSON.stringify({ name: KEY, value: value }));
      log("favorite -> native, КБ:", Math.round(value.length / 1024));
    } catch (e) {
      log("ошибка storageChange:", e);
      return null;
    }
    return trimmed;
  }

  // ---- Передача данных после изменения избранного (не ждёт обновления каналов при запуске). ----

  var pushTimer = null;
  var pushWindowStart = 0;

  // Серия изменений передаётся одной отправкой, но не реже раза в PUSH_MAX_WAIT.
  function schedulePush() {
    var now = Date.now();
    if (pushTimer) clearTimeout(pushTimer);
    else pushWindowStart = now;

    var left = pushWindowStart + PUSH_MAX_WAIT - now;
    var wait = Math.max(0, Math.min(PUSH_DEBOUNCE, left));

    pushTimer = setTimeout(function () {
      pushTimer = null;
      pushFavorite();
    }, wait);
  }

  // ---- Обновление каналов при запуске. ----

  // Каналы, заполненные в прошлый раз: если список избранного стал пустым, его канал очищается.
  var KNOWN_KEY = "android_fav_bridge_known";
  function getKnown() { try { return JSON.parse(localStorage.getItem(KNOWN_KEY) || "[]"); } catch (e) { return []; } }
  function setKnown(a) { try { localStorage.setItem(KNOWN_KEY, JSON.stringify(a)); } catch (e) {} }

  // Одновременно выполняется одно обновление; повторный запрос выполнится после текущего.
  var syncing = false;
  var pending = false;
  var fullTimer = null;

  function requestFull(delay) {
    if (fullTimer) clearTimeout(fullTimer);
    fullTimer = setTimeout(function () { fullTimer = null; runFull(); }, delay);
  }

  function runFull() {
    if (syncing) { pending = true; return; }
    syncing = true;
    fullSync(function () {
      syncing = false;
      if (pending) { pending = false; requestFull(1500); }
    });
  }

  // Передаёт избранное и по очереди обновляет каналы: непустые заполняются, опустевшие очищаются.
  function fullSync(done) {
    var trimmed = pushFavorite();
    if (!trimmed || !canUpdateChannel()) return done && done();

    var withData = [];
    for (var i = 0; i < CHANNELS.length; i++) {
      var arr = trimmed[CHANNELS[i]];
      if (arr && arr.length) withData.push(CHANNELS[i]);
    }

    var known = getKnown(), toClear = [];
    for (var j = 0; j < known.length; j++)
      if (withData.indexOf(known[j]) < 0 && CHANNELS.indexOf(known[j]) >= 0) toClear.push(known[j]);

    var toUpdate = withData.concat(toClear);
    log("обновляю каналы:", withData.join(",") || "-", "| очистить:", toClear.join(",") || "-");
    updateSequentially(toUpdate, 0, function () { setKnown(withData); done && done(); });
  }

  // Обновляет каналы по одному с интервалом SEQ_GAP.
  function updateSequentially(list, i, done) {
    if (!list || i >= list.length) { return done && done(); }
    try { AndroidJS.updateChannel(list[i]); }
    catch (e) { log("updateChannel " + list[i] + " ошибка:", e); }
    setTimeout(function () { updateSequentially(list, i + 1, done); }, SEQ_GAP);
  }

  function startPlugin() {
    if (window.Lampa && Lampa.Manifest) {
      Lampa.Manifest.plugins = {
        type: "other",
        version: "2.10.0",
        name: "Android TV: каналы из избранного",
        description: "Наполняет каналы Android TV (История, Просмотрено, Смотрю, Закладки и др.) из избранного LAMPA."
      };
    }

    // При изменении избранного — передать новые данные.
    try {
      Lampa.Storage.listener.follow("change", function (e) {
        if (e && e.name === KEY) schedulePush();
      });
    } catch (e) { log("не удалось подписаться на change:", e); }

    // После запуска LAMPA — обновить все каналы.
    function fire() { requestFull(1500); }
    if (window.appready) fire();
    else Lampa.Listener.follow("app", function (e) {
      if (e.type === "ready") fire();
    });
  }

  function waitForLampa(callback, attempt) {
    if (window.Lampa && Lampa.Storage && Lampa.Listener) {
      callback();
      return;
    }
    if ((attempt || 0) > 40) return;
    setTimeout(function () { waitForLampa(callback, (attempt || 0) + 1); }, 300);
  }

  waitForLampa(startPlugin);
})();
