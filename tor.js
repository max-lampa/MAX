(async function () {
  'use strict';

  // Сообщаем системе о ТВ-платформе
  Lampa.Platform.tv();

  // -------- Список серверов (исправлен синтаксис) --------
  const servers = [
    '51.77.71.63:8090',
    '213.176.74.63:8443',
    '89.22.236.63:8443',
    '95.81.127.99:8443',
    '185.235.218.109:8090',
    '212.92.252.254:8090',
    '77.110.122.115:8090',
    '77.38.185.156:8090',
    '62.60.186.181:8443', // Добавлена запятая
    '77.110.122.115:8090'
  ];

  // -------- Предварительная очистка статусов --------
  servers.forEach((_, i) => {
    Lampa.Storage.set(`FreeServ_${i + 1}`, 'Checking...');
  });

  // -------- Функция проверки с таймаутом --------
  async function pingServer(url, index) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 секунды на ответ

      const response = await fetch(`http://${url}/echo`, { signal: controller.signal });
      
      if (response.ok) {
        Lampa.Storage.set(`FreeServ_${index + 1}`, url);
      } else {
        Lampa.Storage.set(`FreeServ_${index + 1}`, 'Offline');
      }
      clearTimeout(timeoutId);
    } catch (e) {
      Lampa.Storage.set(`FreeServ_${index + 1}`, 'Offline');
    }
  }

  // Опрос всех серверов
  servers.forEach((url, i) => pingServer(url, i));

  // -------- Скрытие нерабочих серверов в меню --------
  setInterval(() => {
    $('.selectbox-item.selector > div:contains("Offline")').parent().hide();
    $('.selectbox-item.selector > div:contains("Checking...")').parent().hide();
  }, 300);

  // -------- Добавление в настройки Lampa --------
  const initPlugin = () => {
    Lampa.SettingsApi.addParam({
      component: 'server',
      param: {
        name: 'freetorrserv',
        type: 'select',
        values: servers.reduce((acc, url, i) => {
          acc[i + 1] = url; 
          return acc;
        }, { 0: 'Выключено' }),
        default: 0
      },
      field: {
        name: 'Публичный TorrServer',
        description: 'Выберите рабочий сервер из списка проверенных'
      },
      onChange: function (value) {
        if (value == '0') {
          Lampa.Storage.set('torrserver_url_two', '');
        } else {
          const selectedUrl = servers[parseInt(value) - 1];
          Lampa.Storage.set('torrserver_url_two', 'http://' + selectedUrl);
          Lampa.Storage.set('torrserver_use_link', 'two');
        }
        Lampa.Settings.update();
      },
      onRender: function (item) {
        setTimeout(() => {
          if ($('div[data-name="freetorrserv"]').length > 1) item.hide();
          $('.settings-param__name', item).css('color', '#f3d900');
          // Ставим плагин сразу после выбора основной ссылки
          item.insertAfter('div[data-name="torrserver_use_link"]');
        }, 10);
      }
    });
  };

  // Запуск при готовности системы
  if (window.Lampa && Lampa.SettingsApi) {
    setTimeout(initPlugin, 1000);
  } else {
    document.addEventListener('lampa:ready', initPlugin);
  }

})();
