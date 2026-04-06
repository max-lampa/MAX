(function() {
    'use strict';

    // === СПИСОК КЛЮЧЕЙ ДЛЯ ИСТОРИИ/ИЗБРАННОГО ===
    var backup_keys = [
        'favorite', 'online_view', 'online_last_balanser', 
        'online_watched_last', 'torrents_view', 'torrents_filter_data'
    ];

    // === ГЛОБАЛЬНЫЕ ФУНКЦИИ ===
    function reloadApp(message) {
        Lampa.Noty.show((message || 'Данные восстановлены') + ' — перезагрузка через 3 сек');
        setTimeout(function() {
            try {
                if (typeof Lampa.reload === 'function') {
                    Lampa.reload();
                } else {
                    location.reload();
                }
            } catch(e) {
                location.reload();
            }
        }, 3000);
    }

    // Читаем значение из localStorage и возвращаем распарсенный объект
    function lsGet(key) {
        try {
            var raw = localStorage.getItem(key);
            if (raw === null || raw === undefined) return null;
            return JSON.parse(raw);
        } catch(e) {
            return localStorage.getItem(key);
        }
    }

    // Записываем объект в localStorage через JSON.stringify
    function lsSet(key, value) {
        try {
            if (typeof value === 'string') {
                localStorage.setItem(key, value);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
            return true;
        } catch(e) {
            console.warn('lsSet error key=' + key, e);
            return false;
        }
    }

    function downloadLocalFile(dataObj, filename) {
        try {
            var blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 1000);
            Lampa.Noty.show('✅ Файл сохранён: ' + filename);
        } catch (e) {
            Lampa.Noty.show('❌ Ошибка экспорта: ' + e.message);
            console.error(e);
        }
    }

    // Открывает диалог выбора файла — input ОБЯЗАТЕЛЬНО в DOM
    function uploadLocalFile(callback) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        document.body.appendChild(input);

        input.onchange = function(e) {
            var file = e.target.files[0];
            document.body.removeChild(input);
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    var data = JSON.parse(evt.target.result);
                    callback(data);
                } catch (err) {
                    Lampa.Noty.show('❌ Ошибка: неверный формат JSON');
                    console.error(err);
                }
            };
            reader.readAsText(file);
        };

        // Если пользователь закрыл диалог без выбора файла — убираем input
        input.addEventListener('cancel', function() {
            if (input.parentNode) document.body.removeChild(input);
        });

        input.click();
    }

    function confirmAction(callback) {
        Lampa.Select.show({
            title: 'Вы уверены?',
            nomark: true,
            items: [ 
                { title: '✅ Да, подтверждаю', action: true, selected: true }, 
                { title: '❌ Отмена', action: false } 
            ],
            onSelect: function(a) {
                // Сначала вызываем callback (открывает файловый диалог),
                // потом уже переключаем контроллер — иначе жест прерывается
                if (a.action) {
                    callback();
                }
                Lampa.Controller.toggle('settings_component');
            },
            onBack: function() { 
                Lampa.Controller.toggle('settings_component'); 
            }
        });
    }

    // === МОДУЛИ БЭКАПА ===
    var BackupModules = {
        // 1. Плагины
        plugins: {
            fileExport: function() {
                var pluginsData;
                try {
                    pluginsData = JSON.parse(localStorage.getItem('plugins') || '[]');
                } catch(e) {
                    pluginsData = [];
                }
                downloadLocalFile(pluginsData, 'lampa_plugins.json'); 
            },
            fileImport: function() {
                uploadLocalFile(function(data) {
                    localStorage.setItem('plugins', JSON.stringify(data));
                    reloadApp('✅ Плагины восстановлены');
                });
            }
        },

        // 2. История и Избранное
        data: {
            fileExport: function() {
                var exportData = {};
                backup_keys.forEach(function(k) {
                    // Читаем напрямую из localStorage для точности
                    var val = lsGet(k);
                    if (val !== null) exportData[k] = val;
                });
                downloadLocalFile(exportData, 'lampa_history.json');
            },
            fileImport: function() {
                uploadLocalFile(function(data) {
                    var count = 0;
                    backup_keys.forEach(function(k) {
                        if (data.hasOwnProperty(k) && data[k] !== null && data[k] !== undefined) {
                            // Пишем напрямую в localStorage — надёжнее чем Lampa.Storage.set
                            lsSet(k, data[k]);
                            count++;
                        }
                    });
                    reloadApp('✅ Восстановлено ' + count + ' ключей (история/избранное)');
                });
            }
        },

        // 3. Таймкоды (позиции просмотра)
        tc: {
            getStorageKey: function() {
                var key = 'file_view';
                try {
                    if (Lampa.Timeline && typeof Lampa.Timeline.filename === 'function') {
                        var k = Lampa.Timeline.filename();
                        if (k && typeof k === 'string' && k.length > 0) {
                            key = k;
                        }
                    }
                } catch(e) {}
                return key;
            },
            fileExport: function() {
                var storageKey = this.getStorageKey();
                var tcData = lsGet(storageKey) || {};
                downloadLocalFile(tcData, 'lampa_timecodes.json'); 
            },
            fileImport: function() {
                var self = this;
                uploadLocalFile(function(data) {
                    var storageKey = self.getStorageKey();
                    var local = lsGet(storageKey) || {};
                    var count = 0;
                    for (var hash in data) {
                        if (data.hasOwnProperty(hash) && data[hash] && data[hash].percent !== undefined) {
                            local[hash] = data[hash];
                            count++;
                        }
                    }
                    lsSet(storageKey, local);
                    reloadApp('✅ Таймкоды восстановлены (' + count + ' записей)');
                });
            }
        },

        // 4. Полный бэкап всего localStorage
        backup: {
            fileExport: function() {
                var backupData = {};
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (k) backupData[k] = localStorage.getItem(k);
                }
                downloadLocalFile(backupData, 'lampa_full_backup.json');
            },
            fileImport: function() {
                uploadLocalFile(function(data) {
                    var keysCount = 0;
                    for (var i in data) {
                        if (data.hasOwnProperty(i)) {
                            try {
                                // Полный бэкап хранит сырые строки localStorage
                                var val = data[i];
                                if (typeof val !== 'string') val = JSON.stringify(val);
                                localStorage.setItem(i, val);
                                keysCount++;
                            } catch (err) { 
                                console.warn('Не удалось восстановить ключ:', i, err); 
                            }
                        }
                    }
                    reloadApp('✅ Полный бэкап восстановлен (' + keysCount + ' ключей)');
                });
            }
        }
    };

    // === ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА ===
    function openSubMenu(moduleKey, titleText) {
        Lampa.Select.show({
            title: titleText,
            items: [
                { title: '💾 Сохранить в файл (Экспорт)', id: 'exp' },
                { title: '📂 Загрузить из файла (Импорт)', id: 'imp' }
            ],
            onSelect: function(a) {
                Lampa.Controller.toggle('settings_component');
                if (a.id === 'exp') {
                    // Небольшая задержка чтобы UI успел закрыться
                    setTimeout(function() {
                        BackupModules[moduleKey].fileExport();
                    }, 100);
                } else if (a.id === 'imp') {
                    setTimeout(function() {
                        confirmAction(function() { 
                            BackupModules[moduleKey].fileImport(); 
                        });
                    }, 100);
                }
            },
            onBack: function() { 
                Lampa.Controller.toggle('settings_component'); 
            }
        });
    }

    function initPlugin() {
        if (window.lampa_local_backup_plugin) return;
        window.lampa_local_backup_plugin = true;

        Lampa.SettingsApi.addComponent({
            component: 'local_backup_menu',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>',
            name: '📦 Локальный бэкап'
        });

        Lampa.SettingsApi.addParam({
            component: 'local_backup_menu', param: { type: 'button' },
            field: { name: '🧩 Плагины' },
            onChange: function() { openSubMenu('plugins', 'Плагины — экспорт/импорт'); }
        });
        Lampa.SettingsApi.addParam({
            component: 'local_backup_menu', param: { type: 'button' },
            field: { name: '⭐ Избранное / История' },
            onChange: function() { openSubMenu('data', 'Избранное и история'); }
        });
        Lampa.SettingsApi.addParam({
            component: 'local_backup_menu', param: { type: 'button' },
            field: { name: '⏱ Таймкоды (позиции просмотра)' },
            onChange: function() { openSubMenu('tc', 'Таймкоды'); }
        });
        Lampa.SettingsApi.addParam({
            component: 'local_backup_menu', param: { type: 'button' },
            field: { name: '📦 Полный бэкап (все настройки)' },
            onChange: function() { openSubMenu('backup', 'Полный бэкап localStorage'); }
        });
    }

    // ОЖИДАНИЕ ЗАГРУЗКИ LAMPA
    var checkTimer = setInterval(function() {
        if (window.Lampa && window.Lampa.SettingsApi && window.Lampa.Storage) {
            clearInterval(checkTimer);
            initPlugin();
        }
    }, 500);
})();
