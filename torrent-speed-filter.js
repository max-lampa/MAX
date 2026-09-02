(function () {
  'use strict';

  if (window.__isrTorrentSpeedFilterInstalled) return;
  window.__isrTorrentSpeedFilterInstalled = true;

  var SETTING_ENABLED = 'torrent_speed_filter_enabled';
  var SETTING_RESERVE = 'torrent_speed_filter_reserve';
  var TEST_DURATION = 5000;
  var opening = false;

  function enabled() {
    var value = Lampa.Storage.get(SETTING_ENABLED, 'true');
    return value !== false && value !== 'false' && value !== 0 && value !== '0';
  }

  function reserveMbps() {
    var value = parseInt(Lampa.Storage.get(SETTING_RESERVE, '5'));
    return isFinite(value) && value >= 0 ? value : 5;
  }

  function addSettings() {
    if (!Lampa.SettingsApi || typeof Lampa.SettingsApi.addParam !== 'function') return;

    Lampa.SettingsApi.addParam({
      component: 'server',
      param: {
        name: SETTING_ENABLED,
        type: 'trigger',
        values: '',
        default: true
      },
      field: {
        name: 'Фильтр торрентов по скорости',
        description: 'Перед поиском измерять скорость до TorrServer и скрывать раздачи с большим битрейтом'
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'server',
      param: {
        name: SETTING_RESERVE,
        type: 'select',
        values: {
          '3': '3 Мбит/с',
          '5': '5 Мбит/с',
          '10': '10 Мбит/с',
          '15': '15 Мбит/с'
        },
        default: '5'
      },
      field: {
        name: 'Запас скорости',
        description: 'Вычитается из результата теста при выборе допустимого битрейта'
      }
    });
  }

  function testParams(onEnd, onBack) {
    var params = {
      url: Lampa.Torserver.url() + '/download/300',
      duration: TEST_DURATION,
      onEnd: onEnd,
      onBack: onBack
    };

    if (Lampa.Storage.field('torrserver_auth')) {
      params.login = Lampa.Storage.get('torrserver_login');
      params.password = Lampa.Storage.value('torrserver_password');
    }

    return params;
  }

  function canMeasure(object) {
    return object && object.component === 'torrents' && object.movie && parseFloat(object.movie.runtime) > 0;
  }

  function install() {
    if (!Lampa.Activity || !Lampa.Parser || !Lampa.Speedtest) return;

    var activityPush = Lampa.Activity.push;
    var parserGet = Lampa.Parser.get;

    Lampa.Activity.push = function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments);
      var object = args[0];

      if (opening && canMeasure(object)) return;

      if (!enabled() || !canMeasure(object) || object._speed_filter_checked) {
        return activityPush.apply(context, args);
      }

      opening = true;
      var controller = Lampa.Controller.enabled().name;
      var completed = false;

      function resume(speed, xhr) {
        if (completed) return;

        var measured = parseFloat(speed) || 0;
        completed = true;
        opening = false;
        object._speed_filter_checked = true;
        object._speed_filter_measured = measured;

        var limit = Math.floor(measured) - reserveMbps();
        if (limit > 0) object._speed_filter_limit = limit;
        else Lampa.Noty.show('Не удалось определить безопасный битрейт, показаны все раздачи', {time: 7000});

        setTimeout(function () {
          try {
            Lampa.Speedtest.close();
          } catch (e) {}
          activityPush.apply(context, args);
        }, 50);
      }

      function cancel() {
        opening = false;
        if (!completed) Lampa.Controller.toggle(controller);
      }

      Lampa.Speedtest.start(testParams(resume, cancel));
    };

    Lampa.Parser.get = function () {
      var context = this;
      var args = Array.prototype.slice.call(arguments);
      var params = args[0] || {};
      var success = args[1];
      var limit = parseFloat(params._speed_filter_limit);
      var runtime = params.movie && parseFloat(params.movie.runtime);

      if (!enabled() || !isFinite(limit) || limit <= 0 || !runtime || typeof success !== 'function') {
        return parserGet.apply(context, args);
      }

      args[1] = function (data) {
        if (!data || !Array.isArray(data.Results)) return success.apply(this, arguments);

        var output = {};
        Object.keys(data).forEach(function (key) {
          output[key] = data[key];
        });

        var removed = 0;
        var unknown = 0;
        output.Results = data.Results.filter(function (torrent) {
          var bitrate = parseFloat(Lampa.Utils.calcBitrate(torrent.Size, runtime));
          if (!isFinite(bitrate) || bitrate <= 0) {
            unknown++;
            return true;
          }
          if (bitrate > limit) {
            removed++;
            return false;
          }
          return true;
        });

        var measured = parseFloat(params._speed_filter_measured) || 0;
        var message = 'TorrServer: ' + measured.toFixed(1) + ' Мбит/с · лимит ' + limit + ' Мбит/с';
        if (removed) message += ' · скрыто ' + removed;
        if (unknown) message += ' · без битрейта ' + unknown;
        Lampa.Noty.show(message, {time: 7000});
        success.call(this, output);
      };

      return parserGet.apply(context, args);
    };
  }

  function start() {
    addSettings();
    install();
  }

  if (window.appready) start();else {
    var ready = function (event) {
      if (!event || event.type !== 'ready') return;
      Lampa.Listener.remove('app', ready);
      start();
    };
    Lampa.Listener.follow('app', ready);
  }
})();
