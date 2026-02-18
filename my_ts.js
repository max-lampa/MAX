(async function () {
    'use strict';

    Lampa.Platform.tv();

    // Список серверов (без пустых строк)
    const servers = [
        '95.174.93.5:8090',
        '90.189.153.32:8191',
        '185.235.218.109:8090',
        '212.92.252.254:8090',
        '77.110.122.115:8090'
    ];

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // Сбрасываем статусы (на случай перезапуска)
    servers.forEach((_, i) => {
        Lampa.Storage.set(`FreeServ_${i + 1}`, 'NotFound');
    });

    // Проверка одного сервера с таймаутом и определением рабочего протокола
    async function pingServer(host, index) {
        const testUrl = (protocol) => `${protocol}//${host}/echo`; // или другой тестовый путь
        for (const protocol of ['https:', 'http:']) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // таймаут 3 сек

                const response = await fetch(testUrl(protocol), {
                    method: 'GET',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    // Сохраняем полный URL с протоколом
                    Lampa.Storage.set(`FreeServ_${index + 1}`, testUrl(protocol));
                    return;
                }
            } catch (e) {
                // Ошибка сети или таймаут — пробуем следующий протокол
            }
        }
        Lampa.Storage.set(`FreeServ_${index + 1}`, 'NotFound');
    }

    // Опрос всех серверов
    async function pollServers() {
        const promises = servers.map((s, i) => pingServer(s, i));
        await Promise.allSettled(promises);
    }

    // Функция обновления выпадающего списка в настройках
    function updateServersDropdown() {
        const container = $('div[data-name="freetorrserv"]');
        const select = container.find('select');
        if (!select.length) return;

        // Сохраняем текущее выбранное значение
        const currentVal = select.val();

        // Перестраиваем options
        select.empty().append($('<option>', { value: '0', text: 'Выключено' }));

        servers.forEach((_, i) => {
            const stored = Lampa.Storage.get(`FreeServ_${i + 1}`);
            if (stored && stored !== 'NotFound') {
                // Используем сохранённый полный URL как значение и текст
                select.append($('<option>', { value: stored, text: stored }));
            }
        });

        // Восстанавливаем выбор, если он был
        if (currentVal && select.find(`option[value="${currentVal}"]`).length) {
            select.val(currentVal);
        } else {
            const saved = Lampa.Storage.get('torrserver_url_two_selected');
            if (saved && select.find(`option[value="${saved}"]`).length) {
                select.val(saved);
            } else {
                select.val('0');
            }
        }

        // Показываем или скрываем контейнер в зависимости от наличия серверов
        if (select.find('option').length <= 1) {
            container.hide();
        } else {
            container.show();
        }
    }

    // Запускаем проверку и добавляем параметр
    pollServers().then(() => {
        // Удаляем возможный старый блок перед добавлением нового
        $('div[data-name="freetorrserv"]').remove();

        Lampa.SettingsApi.addParam({
            component: 'server',
            param: {
                name: 'freetorrserv',
                type: 'select',
                values: servers.reduce((acc, _, i) => {
                    const s = Lampa.Storage.get(`FreeServ_${i + 1}`);
                    acc[i + 1] = (s && s !== 'NotFound') ? s : null;
                    return acc;
                }, {}),
                default: 0
            },
            field: {
                name: 'Бесплатный TorrServer #free',
                description: 'Выберите сервер из списка доступных'
            },
            onChange: function (value) {
                if (value === '0') {
                    Lampa.Storage.set('torrserver_url_two', '');
                    Lampa.Storage.set('torrserver_url_two_selected', '0');
                } else {
                    // value — это полный URL, сохранённый в option
                    Lampa.Storage.set('torrserver_url_two', value);
                    Lampa.Storage.set('torrserver_url_two_selected', value);
                }
                Lampa.Storage.set('torrserver_use_link', 'two');
                Lampa.Settings.update();
            },
            onRender: function (item) {
                // Убираем лишнюю логику скрытия, просто позиционируем блок
                setTimeout(() => {
                    $('.settings-param__name', item).css('color', '#f3d900');
                    $(".ad-server").hide();
                    $('div[data-name="freetorrserv"]').insertAfter('div[data-name="torrserver_use_link"]');
                }, 0);
            }
        });

        // Первоначальное обновление списка
        setTimeout(updateServersDropdown, 100);
    });

    // Следим за перерисовкой настроек
    Lampa.Listener.follow('settings', (e) => {
        if (e.type === 'render') setTimeout(updateServersDropdown, 50);
    });
})();