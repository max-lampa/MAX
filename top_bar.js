(function () {
  'use strict';

  var Storage = Lampa.Storage;
  var Lang = Lampa.Lang;
  var Params = Lampa.Params;
  var Modal = Lampa.Modal;
  var Controller = Lampa.Controller;

  var PLAYER_TYPES = ['online', 'iptv', 'torrent'];
  var MODAL_CONFIG = {
    size: 'medium',
    align: 'center'
  };

  var lastFocus = null;
  var previousController = null;

  Lang.add({
    top_bar_player_switch: {
      en: 'Player switcher',
      ru: 'Смена плеера'
    },
    top_bar_player_online: {
      en: 'Online',
      ru: 'Онлайн'
    },
    top_bar_player_iptv: {
      en: 'IPTV',
      ru: 'IPTV'
    },
    top_bar_player_torrent: {
      en: 'Torrents',
      ru: 'Торренты'
    },
    top_bar_player_current: {
      en: 'Current player',
      ru: 'Текущий'
    }
  });

  var playerIcon = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg>';

  function getAvailablePlayers(type) {
    var paramName = type === 'online' ? 'player' : 'player_' + type;
    var playersData = Params.values[paramName];
    
    if (!playersData) {
      return { inner: Lang.translate('settings_param_player_inner') };
    }

    var players = {};
    for (var key in playersData) {
      if (playersData.hasOwnProperty(key)) {
        players[key] = Lang.translate(playersData[key]);
      }
    }
    
    return players;
  }

  function getPlayerName(key, players) {
    return players[key] || key;
  }

  function getStorageKey(type) {
    return type === 'online' ? 'player' : 'player_' + type;
  }

  function getCurrentPlayer(type) {
    return Storage.field(getStorageKey(type)) || 'inner';
  }

  function setPlayer(type, value) {
    Storage.set(getStorageKey(type), value);
  }

  function createMenuItem(name, descr, onClick, isActive) {
    var item = $('<div class="settings-param selector"></div>');
    item.append('<div class="settings-param__name">' + name + '</div>');
    if (descr) {
      item.append('<div class="settings-param__descr">' + descr + '</div>');
    }
    if (isActive) {
      item.addClass('settings-param--active');
    }
    if (onClick) {
      item.on('hover:enter', onClick);
    }
    return item;
  }

  function saveFocusContext() {
    var enabled = Controller.enabled();
    if (enabled && enabled.name !== 'modal') {
      previousController = enabled.name;
    }
  }

  function restoreFocusContext() {
    if (previousController) {
      Controller.toggle(previousController);
      previousController = null;
    }
    lastFocus = null;
  }

  function openModal(title, html, onBack) {
    if (Controller.enabled().name === 'modal') {
      Modal.close();
      setTimeout(function () {
        var modalHtml = prepareModalHtml(html);
        Modal.open({
          title: title,
          html: modalHtml,
          size: MODAL_CONFIG.size,
          align: MODAL_CONFIG.align,
          onBack: onBack
        });
      }, 100);
      return;
    }

    saveFocusContext();
    var modalHtml = prepareModalHtml(html);
    Modal.open({
      title: title,
      html: modalHtml,
      size: MODAL_CONFIG.size,
      align: MODAL_CONFIG.align,
      onBack: onBack
    });
  }

  function prepareModalHtml(html) {
    html.find('.selector').on('hover:focus', function (e) {
      lastFocus = e.target;
    });
    return html;
  }

  function showPlayerSelect(playerType) {
    var availablePlayers = getAvailablePlayers(playerType);
    var currentPlayer = getCurrentPlayer(playerType);
    var html = $('<div></div>');

    for (var key in availablePlayers) {
      if (!availablePlayers.hasOwnProperty(key)) continue;

      var isCurrent = key === currentPlayer;
      var playerName = availablePlayers[key];
      var descr = isCurrent ? Lang.translate('top_bar_player_current') : null;

      var item = createMenuItem(
        playerName,
        descr,
        function (playerKey) {
          return function () {
            setPlayer(playerType, playerKey);
            Modal.close();
            restoreFocusContext();
          };
        }(key),
        isCurrent
      );

      html.append(item);
    }

    openModal(
      Lang.translate('top_bar_player_' + playerType),
      html,
      function () {
        Modal.close();
        restoreFocusContext();
      }
    );
  }

  function showMainMenu() {
    var html = $('<div></div>');

    PLAYER_TYPES.forEach(function (type) {
      var title = Lang.translate('top_bar_player_' + type);
      var availablePlayers = getAvailablePlayers(type);
      var currentPlayerKey = getCurrentPlayer(type);
      var currentPlayerName = getPlayerName(currentPlayerKey, availablePlayers);

      var item = createMenuItem(
        title,
        currentPlayerName,
        function (playerType) {
          return function () {
            showPlayerSelect(playerType);
          };
        }(type)
      );

      html.append(item);
    });

    openModal(Lang.translate('top_bar_player_switch'), html, function () {
      Modal.close();
      restoreFocusContext();
    });
  }

  function init() {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') {
        setTimeout(function () {
          var button = Lampa.Head.addIcon(playerIcon, showMainMenu);
          button.addClass('open--player-switch');

          var headActions = Lampa.Head.render().find('.head__actions');
          var settingsButton = headActions.find('.open--settings');

          if (settingsButton.length) {
            settingsButton.before(button);
          }
        }, 1000);
      }
    });
  }

  if (window.Lampa) {
    init();
  }

})();
