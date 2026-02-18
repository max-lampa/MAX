(async function () {
    'use strict';

    // ### 2026 ### freetorservlist
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

    // -------- сброс статусов --------
    servers.forEach((_, i) => {
        Lampa.Storage.set(`FreeServ_${i + 1}`, 'NotFound');
    });

    // -------- проверка сервера (http + https) --------
    async function pingServer(url, index) {
        for (const protocol of ['https:', 'http:']) {
            try {
                await fetch(`${protocol}//${url}/`, {
                    method: 'HEAD',
                    mode: 'no-cors'
                });
                Lampa.Storage.set(`FreeServ_${index + 1}`, url);
                return;
            } catch (e) {
                // пробуем следующий протокол
            }
        }
        Lampa.Storage.set(`FreeServ_${index + 1}`, 'NotFound');
    }

    // -------- опрос всех серверов с ожиданием --------
    async function pollServers() {
        const promises = servers.map((s, i) => pingServer(s, i));
        await Promise.allSettled(promises);
    }

    // -------- обновление выпадающего списка в настройках --------
    function updateServersDropdown() {
        const select = $('div[data-name="freetorrserv"] select');
        if (!select.length) return;

        select.empty().append($('<option>', { value: 0, text: 'Выключено' }));

        servers.forEach((server, i) => {
            const status = Lampa.Storage.get(`FreeServ_${i + 1}`);
            if (status && status !== 'NotFound') {
                select.append($('<option>', { value: i + 1, text: status }));
            }
        });

        const saved = Lampa.Storage.get('torrserver_url_two_selected');
        if (saved) select.val(saved);

        const container = $('div[data-name="freetorrserv"]');
        if (select.find('option').length <= 1) container.hide();
        else container.show();
    }

    // -------- запуск проверки и создание пункта настроек --------
    pollServers().then(() => {
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
                description: 'Нажмите для выбора сервера из списка найденных'
            },
            onChange: function (value) {
                if (value === '0') {
                    Lampa.Storage.set('torrserver_url_two', '');
                    Lampa.Storage.set('torrserver_url_two_selected', '0');
                } else {
                    const idx = Number(value) - 1;
                    Lampa.Storage.set('torrserver_url_two', servers[idx]);
                    Lampa.Storage.set('torrserver_url_two_selected', value);
                }
                Lampa.Storage.set('torrserver_use_link', 'two');
                Lampa.Settings.update();
            },
            onRender: function (item) {
                setTimeout(() => {
                    if ($('div[data-name="freetorrserv"]').length > 1) {
                        $(item).hide();
                    } else {
                        $('.settings-param__name', item).css('color', '#f3d900');
                        $(".ad-server").hide();
                        $('div[data-name="freetorrserv"]').insertAfter('div[data-name="torrserver_use_link"]');
                    }
                }, 0);
            }
        });

        setTimeout(updateServersDropdown, 100);
    });

    Lampa.Listener.follow('settings', (e) => {
        if (e.type === 'render') setTimeout(updateServersDropdown, 50);
    });
})();