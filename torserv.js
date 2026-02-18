(async function () {
  'use strict';

  ///
  ///2026
  ///torservlist 

  Lampa.Platform.tv();

  // -------- список серверов --------
  const servers = [
'95.174.93.5:8090',
'90.189.153.32:8191',
'lom.my.to:8080',
'185.235.218.109:8090',
'212.92.252.254:8090',
'77.110.122.115:8090'
  ];

  // -------- вспомогательная задержка --------
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  // -------- сбрасываем статусы --------
  servers.forEach((_, i) => {
    Lampa.Storage.set(`FreeServ_${i+1}`, 'NotFound');
  });

  // -------- проверка сервера --------
  async function pingServer(url, index) {
    try {
      await fetch(`http://${url}/echo`);
      Lampa.Storage.set(`FreeServ_${index+1}`, url);
    } catch (e) {
      Lampa.Storage.set(`FreeServ_${index+1}`, 'NotFound');
    }
  }

  // -------- поочерёдный опрос --------
  async function pollServers() {
    for (let i = 0; i < servers.length; i++) {
  
      pingServer(servers[i], i);
    }
  }

  // -------- скрываем NotFound в выпадающих списках --------
  setInterval(() => {
    const el = $('.selectbox-item.selector > div:contains("NotFound")');
    if (el.length > 0) el.parent('div').hide();
  }, 100);

  // запускаем опрос
  pollServers();

  // -------- создаём пункт настроек --------
  setTimeout(() => {
    Lampa.SettingsApi.addParam({
      component: 'server',
      param: {
        name: 'freetorrserv',
        type: 'select',
        values: servers.reduce((acc, _, i) => {
          acc[i + 1] = Lampa.Storage.get(`FreeServ_${i+1}`) + '';
          return acc;
        }, {}),
        default: 0
      },
      field: {
        name: 'TorrServer',
        description: 'Нажмите для выбора сервера из списка найденных'
      },
      onChange: function (value) {
        if (value === '0') {
          Lampa.Storage.set('torrserver_url_two', '');
        } else {
          const idx = Number(value) - 1;
          Lampa.Storage.set('torrserver_url_two', servers[idx]);
        }

        Lampa.Storage.set('torrserver_use_link', 'two');
        Lampa.Settings.update();
      },
      onRender: function (item) {
        setTimeout(function () {
          if ($('div[data-name="freetorrserv"]').length > 1) item.hide();
          $('.settings-param__name', item).css('color', 'f3d900');
		  $(".ad-server").hide();
          $('div[data-name="freetorrserv"]').insertAfter(
            'div[data-name="torrserver_use_link"]'
          );
        }, 0);
      }
    });
  }, 5000);

})();