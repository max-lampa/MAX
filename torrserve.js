(async function () {
    'use strict';

    Lampa.Platform.tv();

    const servers = [
        '95.174.93.5:8090',
        '90.189.153.32:8191',
        '185.235.218.109:8090',
        '212.92.252.254:8090',
        '77.110.122.115:8090'
    ];

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // Сброс статусов
    servers.forEach((_, i) => {
        Lampa.Storage.set(`FreeServ_${i + 1}`, 'NotFound');
    });

    // Проверка сервера (только HTTP, любой ответ)
    async function pingServer(host, index) {
        const url = `http://${host}/`; // проверяем корень
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            await fetch(url, {
                method: 'HEAD',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Сохраняем БАЗОВЫЙ URL без пути
            Lampa.Storage.set(`FreeServ_${index + 1}`, `http://${host}`);
            console.log(`✅ Сервер ${host} доступен`);
        } catch (e) {
            console.log(`❌ Сервер ${host} недоступен: ${e.message}`);
            Lampa.Storage.set(`FreeServ_${index + 1}`, 'NotFound');
        }
    }

    async function pollServers() {
        const promises = servers.map((s, i) => pingServer(s, i));
        await Promise.allSettled(promises);
        console.log('Проверка завершена');
    }

    function updateServersDropdown() {
        const container = $('div[data-name="freetorrserv"]');
        const select = container.find('select');
        if (!select.length) return;

        const currentVal = select.val();
        select.empty().append($('<option>', { value: '0', text: 'Выключено' }));

        servers.forEach((_, i) => {
            const stored = Lampa.Storage.get(`FreeServ_${i + 1}`);
            if (stored && stored !== 'NotFound') {
                select.append($('<option>', { value: stored, text: stored }));
            }
        });

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

        if (select.find('option').length <= 1) {
            container.hide();
        } else {
            container.show();
        }
    }

    pollServers().then(() => {
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
                name: 'TorrServer',
                description: 'Выберите сервер из списка доступных'
            },
            onChange: function (value) {
                if (value === '0') {
                    Lampa.Storage.set('torrserver_url_two', '');
                    Lampa.Storage.set('torrserver_url_two_selected', '0');
                } else {
                    // value — это полный базовый URL (без пути)
                    Lampa.Storage.set('torrserver_url_two', value);
                    Lampa.Storage.set('torrserver_url_two_selected', value);
                }
                Lampa.Storage.set('torrserver_use_link', 'two');
                Lampa.Settings.update();
                // Иногда требуется повторное обновление для поля ввода
                setTimeout(() => Lampa.Settings.update(), 50);
            },
            onRender: function (item) {
                setTimeout(() => {
                    $('.settings-param__name', item).css('color', '#f3d900');
                    $(".ad-server").hide();
                    $('div[data-name="freetorrserv"]').insertAfter('div[data-name="torrserver_use_link"]');
                }, 0);
            }
        });

        setTimeout(updateServersDropdown, 100);
    });

    Lampa.Listener.follow('settings', (e) => {
        if (e.type === 'render') setTimeout(updateServersDropdown, 50);
    });
})();