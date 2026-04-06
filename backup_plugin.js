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

    function downloadLocalFile(dataObj, filename) {
        try {
            var blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            Lampa.Noty.show('✅ Файл успешно сохранён');
        } catch (e) {
            Lampa.Noty.show('❌ Ошибка экспорта в файл');
            console.error(e);
        }
    }

    function uploadLocalFile(callback) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function(e) {
            var file = e.target.files[0];
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
                Lampa.Controller.toggle('settings_component'); 
                if (a.action) callback(); 
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
                var pluginsData = JSON.parse(localStorage.getItem('plugins') || '[]');
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
                    exportData[k] = Lampa.Storage.get(k); 
                });
                downloadLocalFile(exportData, 'lampa_history.json');
            },
            fileImport: function() {
                uploadLocalFile(function(data) {
                    for (var k in data) {
                        if (backup_keys.indexOf(k) !== -1) {
                            // Исправлено: убран третий аргумент true,
                            // который в Lampa означает "не сохранять в localStorage"
                            Lampa.Storage.set(k, data[k]);
                        }
                    }
                    reloadApp('✅ История и избранное восстановлены');
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
                        // Исправлено: проверяем что ключ непустой
                        if (k && typeof k === 'string' && k.length > 0) {
                            key = k;
                        }
                    }
                } catch(e) {}
                return key;
            },
            fileExport: function() { 
                var tcData = Lampa.Storage.get(this.getStorageKey(), {});
                downloadLocalFile(tcData, 'lampa_timecodes.json'); 
            },
            fileImport: function() {
                var self = this;
                uploadLocalFile(function(data) {
                    var storageKey = self.getStorageKey();
                    var local = Lampa.Storage.get(storageKey, {});
                    for (var hash in data) {
                        if (data[hash] && data[hash].percent !== undefined) { 
                            local[hash] = data[hash]; 
                        }
                    }
                    // Исправлено: убран третий аргумент true,
                    // который в Lampa означает "не сохранять в localStorage"
                    Lampa.Storage.set(storageKey, local);
                    reloadApp('✅ Таймкоды восстановлены');
                });
            }
        },

        // 4. Полный бэкап всего localStorage
        backup: {
            fileExport: function() {
                var backupData = {};
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i); 
                    backupData[k] = localStorage.getItem(k);
                }
                downloadLocalFile(backupData, 'lampa_full_backup.json');
            },
            fileImport: function() {
                uploadLocalFile(function(data) {
                    var keysCount = 0;
                    for (var i in data) {
                        if (data.hasOwnProperty(i)) {
                            try { 
                                localStorage.setItem(i, data[i]); 
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

    // === ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА (РУСИФИЦИРОВАНА) ===
    function openSubMenu(moduleKey, titleText) {
        var items = [
            { title: '💾 Сохранить в файл (Экспорт)', id: 'exp' },
            { title: '📂 Загрузить из файла (Импорт)', id: 'imp' }
        ];

        Lampa.Select.show({
            title: titleText,
            items: items,
            onSelect: function(a) {
                if (a.id == 'exp') {
                    BackupModules[moduleKey].fileExport();
                    Lampa.Controller.toggle('settings_component');
                } else if (a.id == 'imp') {
                    confirmAction(function() { 
                        BackupModules[moduleKey].fileImport(); 
                    });
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

        // ГЛАВНОЕ МЕНЮ В НАСТРОЙКАХ
        Lampa.SettingsApi.addComponent({
            component: 'local_backup_menu',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>',
            name: '📦 Локальный бэкап'
        });

        // КНОПКИ ПОДМЕНЮ
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
