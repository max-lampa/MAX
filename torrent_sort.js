(function () {
  'use strict';

  if (window.nova_torrent_sort) return;
  window.nova_torrent_sort = true;

  var KEY = 'nova_torrent_sort_mode';
  var observer = null;
  var timer = null;
  var active = null;

  function storageGet(key, fallback) {
    try { return Lampa.Storage.get(key, fallback); } catch (e) { return fallback; }
  }

  function storageSet(key, value) {
    try { Lampa.Storage.set(key, value); } catch (e) {}
  }

  function numberFrom(value) {
    var match = String(value || '').replace(/[, ]/g, '').match(/-?\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  }

  function seeders(node) {
    var value = $(node).find('.torrent-item__seeds,.torrent-item__seeders').first().text();
    if (!value) value = $(node).find('.torrent-item__details').text().match(/(?:seed|сид|разд)[^\d-]*(-?\d+)/i);
    return numberFrom(value && value[1] ? value[1] : value);
  }

  function size(node) {
    var value = $(node).find('.torrent-item__size').first().text();
    var match = String(value || '').replace(',', '.').match(/(-?\d+(?:\.\d+)?)\s*(kb|kib|mb|mib|gb|gib|tb|tib)?/i);
    if (!match) return 0;
    var units = { kb: 1, kib: 1, mb: 2, mib: 2, gb: 3, gib: 3, tb: 4, tib: 4 };
    return parseFloat(match[1]) * Math.pow(1024, units[(match[2] || 'mb').toLowerCase()] || 2);
  }

  function label(mode) {
    return mode === 'size' ? 'Размер' : 'Сидеры';
  }

  function currentTorrentRoot() {
    var activity;
    try { activity = Lampa.Activity.active(); } catch (e) { return $(); }
    if (!activity || !activity.activity) return $();
    var root;
    try { root = $(activity.activity.render()); } catch (e) { return $(); }
    var items = root.find('.torrent-item');
    return items.length ? root : $();
  }

  function sortItems(mode, root) {
    root = root && root.length ? root : currentTorrentRoot();
    var list = root.find('.torrent-item').parent().first();
    var items = root.find('.torrent-item').get();
    if (!items.length) return;

    items.sort(function (a, b) {
      var av = mode === 'size' ? size(a) : seeders(a);
      var bv = mode === 'size' ? size(b) : seeders(b);
      if (bv !== av) return bv - av;
      return $(a).find('.torrent-item__title').text().localeCompare(
        $(b).find('.torrent-item__title').text(), 'ru', { sensitivity: 'base' }
      );
    });

    var parent = $(items[0]).parent();
    if (!parent.length) parent = list;
    items.forEach(function (item) { parent.append(item); });
    active = mode;
    updateButtons(root);
  }

  function makeButton(mode) {
    var node = $('<div class="simple-button selector nova-torrent-sort" tabindex="0">' +
      '<span>' + label(mode) + '</span><div class="nova-torrent-sort__mode"></div></div>');
    node.attr('data-nova-sort', mode);
    node.on('hover:enter', function () {
      storageSet(KEY, mode);
      sortItems(mode, currentTorrentRoot());
    });
    return node;
  }

  function updateButtons(root) {
    root.find('.nova-torrent-sort').each(function () {
      var node = $(this);
      var mode = node.attr('data-nova-sort');
      node.toggleClass('focus', mode === active);
      node.find('.nova-torrent-sort__mode').text(mode === active ? ' ✓' : '');
    });
  }

  function addButtons(root) {
    if (root.find('.nova-torrent-sort').length) return;
    var bar = root.find('.torrent-filter,.explorer__files-head').first();
    if (!bar.length) return;
    bar.append(makeButton('seeders')).append(makeButton('size'));
    active = storageGet(KEY, 'seeders') === 'size' ? 'size' : 'seeders';
    updateButtons(root);
    sortItems(active, root);
  }

  function scan() {
    var root = currentTorrentRoot();
    if (!root.length) return;
    addButtons(root);
    if (active) sortItems(active, root);
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(scan, 80);
  }

  function startObserver() {
    if (!window.MutationObserver || observer) return;
    var activity;
    try { activity = Lampa.Activity.active(); } catch (e) { return; }
    if (!activity || !activity.activity) return;
    var target;
    try { target = activity.activity.render()[0]; } catch (e) { return; }
    if (!target) return;
    observer = new MutationObserver(function () { schedule(); });
    observer.observe(target, { childList: true, subtree: true });
  }

  function stopObserver() {
    if (observer) observer.disconnect();
    observer = null;
    clearTimeout(timer);
  }

  function css() {
    if ($('#nova-torrent-sort-css').length) return;
    $('<style id="nova-torrent-sort-css">' +
      '.nova-torrent-sort{display:inline-flex!important;align-items:center;margin-left:.5em!important}' +
      '.nova-torrent-sort.focus{background:rgba(255,255,255,.2)}' +
      '.nova-torrent-sort__mode{margin-left:.25em;color:#7ed996}' +
      '</style>').appendTo('head');
  }

  css();
  try {
    Lampa.Listener.follow('activity', function (event) {
      if (event.type === 'start' || event.type === 'archive') {
        stopObserver();
        active = null;
        setTimeout(function () { scan(); startObserver(); }, 120);
      }
      if (event.type === 'destroy') stopObserver();
    });
  } catch (e) {}

  setTimeout(function () { scan(); startObserver(); }, 250);
}());
