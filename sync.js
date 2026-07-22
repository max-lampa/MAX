(function() {
    'use strict';

    window.lampac_firebase_reloading = false;
    window.lampac_firebase_initial_pull_done = false;

    // === НАСТРОЙКИ АВТОРИЗАЦИИ FIREBASE ===
    // Учётные данные хранятся в Lampa.Storage и настраиваются через меню плагина
    function getFBAuth() {
        return {
            apiKey:   (Lampa.Storage.get('fb_apiKey',   '') || '').trim(),
            email:    (Lampa.Storage.get('fb_email',    '') || '').trim(),
            password: (Lampa.Storage.get('fb_password', '') || '').trim(),
            dbUrl:    (Lampa.Storage.get('fb_dbUrl',    '') || '').trim()
        };
    }

    function isAuthConfigured() {
        var a = getFBAuth();
        return a.apiKey && a.email && a.password && a.dbUrl;
    }

    var sync_keys = [
        'favorite', 'online_view', 'online_last_balanser',
        'online_watched_last', 'torrents_view', 'torrents_filter_data'
    ];

    // === СИСТЕМА АВТОРИЗАЦИИ И ЗАПРОСОВ ===
    var fb_idToken = null;
    var fb_tokenExpire = 0;
    var fb_auth_pending = false;
    var fb_auth_queue = [];

    function safeClone(obj) {
        if (!obj) return {};
        try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return {}; }
    }

    function isDataDifferent(data1, data2) {
        try {
            var s1 = typeof data1 === 'string' ? data1 : JSON.stringify(data1);
            var s2 = typeof data2 === 'string' ? data2 : JSON.stringify(data2);
            return JSON.stringify(JSON.parse(s1)) !== JSON.stringify(JSON.parse(s2));
        } catch(e) {
            return data1 !== data2;
        }
    }

    function getAuthToken(callback, errorCallback) {
        if (!isAuthConfigured()) {
            Lampa.Noty.show('Firebase: укажите данные авторизации в настройках плагина');
            if (errorCallback) errorCallback();
            return;
        }

        // Сбрасываем токен при смене учётных данных
        var auth = getFBAuth();
        var credKey = auth.email + '|' + auth.apiKey;
        if (fb_idToken && Date.now() < fb_tokenExpire && fb_auth_credKey === credKey) {
            return callback(fb_idToken);
        }

        fb_auth_queue.push({ onSuccess: callback, onError: errorCallback });
        if (fb_auth_pending) return;

        fb_auth_pending = true;
        fb_idToken = null;

        $.ajax({
            url: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + auth.apiKey,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email: auth.email, password: auth.password, returnSecureToken: true }),
            timeout: 15000,
            success: function(res) {
                if (res && res.idToken) {
                    fb_idToken = res.idToken;
                    fb_auth_credKey = credKey;
                    fb_tokenExpire = Date.now() + (parseInt(res.expiresIn) * 1000) - 60000;
                    fb_auth_pending = false;
                    while (fb_auth_queue.length > 0) { fb_auth_queue.shift().onSuccess(fb_idToken); }
                } else {
                    fb_auth_pending = false;
                    while (fb_auth_queue.length > 0) {
                        var q = fb_auth_queue.shift();
                        if (q.onError) q.onError();
                    }
                    Lampa.Noty.show('Firebase: неверный ответ сервера авторизации');
                }
            },
            error: function(xhr) {
                fb_auth_pending = false;
                while (fb_auth_queue.length > 0) {
                    var q = fb_auth_queue.shift();
                    if (q.onError) q.onError();
                }
                var msg = 'Ошибка авторизации Firebase';
                try {
                    var errData = JSON.parse(xhr.responseText);
                    if (errData && errData.error && errData.error.message) {
                        msg += ': ' + errData.error.message;
                    }
                } catch(e) {}
                Lampa.Noty.show(msg);
            }
        });
    }

    var fb_auth_credKey = '';

    function getDbUrl() {
        var u = (Lampa.Storage.get('fb_dbUrl', '') || '').trim();
        // Убираем завершающий слэш
        return u.replace(/\/+$/, '');
    }

    function fbRequest(method, path, dataObj, onSuccess, onError) {
        getAuthToken(function(token) {
            var cacheBuster = method === 'GET' ? '&_t=' + Date.now() : '';
            var reqOpts = {
                url: getDbUrl() + '/' + path + '.json?auth=' + token + cacheBuster,
                type: method,
                contentType: 'application/json; charset=utf-8',
                timeout: 30000,
                success: onSuccess,
                error: function(err) {
                    console.log('Firebase Request Error [' + method + ' ' + path + ']:', err);
                    if (onError) onError(err);
                }
            };

            if (dataObj !== null && dataObj !== undefined) {
                try { reqOpts.data = JSON.stringify(dataObj); } catch(e) { if(onError) onError(e); return; }
            }
            $.ajax(reqOpts);
        }, function() { if (onError) onError(); });
    }

    function reloadApp(message) {
        if (window.lampac_firebase_reloading) return;
        window.lampac_firebase_reloading = true;
        try { if (typeof Lampa.Storage.save === 'function') Lampa.Storage.save(); } catch(e) {}
        Lampa.Noty.show(message + ' (3 сек)');
        setTimeout(function() { window.location.reload(); }, 3000);
    }

    function downloadLocalFile(dataObj, filename) {
        try {
            var blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            setTimeout(function() { URL.revokeObjectURL(url); }, 100);
            Lampa.Noty.show('Файл успешно сохранён');
        } catch (e) { Lampa.Noty.show('Ошибка экспорта на этом устройстве'); }
    }

    function uploadLocalFile(callback) {
        try {
            var input = document.createElement('input');
            input.type = 'file'; input.accept = '.json';
            input.onchange = function(e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(evt) {
                    try { callback(JSON.parse(evt.target.result)); }
                    catch (err) { Lampa.Noty.show('Ошибка формата файла!'); }
                };
                reader.readAsText(file);
            };
            input.click();
        } catch(e) { Lampa.Noty.show('Устройство не поддерживает загрузку файлов'); }
    }

    function updateMenuStatus(id, text) {
        if ($('#' + id).length) $('#' + id).text(text);
    }

    function confirmAction(callback) {
        setTimeout(function() {
            Lampa.Select.show({
                title: 'Вы уверены?',
                nomark: true,
                items: [
                    { title: 'Да', action: true, selected: true },
                    { title: 'Отмена' }
                ],
                onSelect: function(a) {
                    if (a.action) callback();
                    setTimeout(function() { Lampa.Controller.toggle('settings_component'); }, 10);
                },
                onBack: function() { Lampa.Controller.toggle('settings_component'); }
            });
        }, 50);
    }

    // ==========================================
    // 1. ПЛАГИНЫ, ИСТОРИЯ, ТАЙМКОДЫ
    // ==========================================
    var PluginsSync = {
        goPush: function(manual) {
            if (manual) Lampa.Noty.show('Отправка плагинов...');
            try {
                var pluginsData = localStorage.getItem('plugins');
                if (!pluginsData || typeof pluginsData !== 'string' || pluginsData.trim() === '') pluginsData = '[]';
                var now = Date.now();
                Lampa.Storage.set('fb_plugins_ts', now, true);

                fbRequest('PUT', 'plugins_sync', { data: pluginsData, _timestamp: now },
                    function() {
                        if (manual) Lampa.Noty.show('Плагины сохранены в облаке');
                        var text = new Date().toLocaleString('ru-RU') + ' (Отправка)';
                        Lampa.Storage.set('fb_plugins_last_time', text); updateMenuStatus('fb_status_plugins', text);
                    }, function() { if (manual) Lampa.Noty.show('Ошибка отправки плагинов'); }
                );
            } catch (e) { if (manual) Lampa.Noty.show('Ошибка скрипта при отправке плагинов'); }
        },
        goPull: function(manual) {
            if (manual) Lampa.Noty.show('Получение плагинов...');
            fbRequest('GET', 'plugins_sync', null, function(json) {
                try {
                    if (json && json.data) {
                        var cloudDataStr = typeof json.data === 'string' ? json.data : JSON.stringify(json.data);
                        var cloudTs = parseInt(json._timestamp) || 0;
                        var localTs = parseInt(Lampa.Storage.get('fb_plugins_ts', 0)) || 0;
                        var localData = localStorage.getItem('plugins') || '[]';

                        if (manual || (cloudTs > localTs && isDataDifferent(cloudDataStr, localData))) {
                            try { localStorage.setItem('plugins', cloudDataStr); } catch(e) {}
                            Lampa.Storage.set('fb_plugins_ts', cloudTs, true);
                            var text = new Date().toLocaleString('ru-RU') + ' (Получение)';
                            Lampa.Storage.set('fb_plugins_last_time', text); updateMenuStatus('fb_status_plugins', text);
                            reloadApp(manual ? 'Плагины восстановлены' : 'Синхронизация плагинов');
                        } else if (manual) Lampa.Noty.show('У вас актуальные плагины');
                    } else if (manual) Lampa.Noty.show('Облако пустое');
                } catch(e) { Lampa.Noty.show('Ошибка обработки плагинов'); }
            });
        },
        fileExport: function() {
            var pData = localStorage.getItem('plugins');
            if (!pData || typeof pData !== 'string' || pData.trim() === '') pData = '[]';
            downloadLocalFile(JSON.parse(pData), 'lampa_plugins.json');
        },
        fileImport: function() {
            uploadLocalFile(function(data) {
                try { localStorage.setItem('plugins', JSON.stringify(data)); } catch(e) {}
                Lampa.Storage.set('fb_plugins_ts', Date.now(), true); reloadApp('Файл плагинов загружен');
            });
        }
    };

    var DataSync = {
        pushTimers: {}, isSyncingNow: false, memoryCache: {},
        getLocalTs: function() { return safeClone(Lampa.Storage.get('fb_sync_timestamps', {})); },
        saveLocalTs: function(ts) { Lampa.Storage.set('fb_sync_timestamps', ts, true); },

        getPushData: function(forceAll) {
            var updateObj = {}, now = Date.now(), localTs = this.getLocalTs(), hasChanges = false;
            sync_keys.forEach(function(key) {
                var localData = Lampa.Storage.get(key);
                if (localData !== undefined && localData !== null) {
                    var str = JSON.stringify(localData);
                    if (DataSync.memoryCache[key] !== str || forceAll) {
                        var currentTs = parseInt(localTs[key]) || 0;
                        var newTs = Math.max(now, currentTs + 1);
                        updateObj[key] = { data: localData, _timestamp: newTs };
                        localTs[key] = newTs;
                        DataSync.memoryCache[key] = str;
                        hasChanges = true;
                    }
                }
            });
            if (hasChanges) this.saveLocalTs(localTs);
            return hasChanges ? updateObj : null;
        },

        pushSingle: function(key) {
            var localData = Lampa.Storage.get(key);
            if (localData === undefined || localData === null) return;

            var str = JSON.stringify(localData);
            if (this.memoryCache[key] === str) return;
            this.memoryCache[key] = str;

            var now = Date.now(), updateObj = {};
            var ts = this.getLocalTs(), currentTs = parseInt(ts[key]) || 0;
            var newTs = Math.max(now, currentTs + 1);

            updateObj[key] = { data: localData, _timestamp: newTs };
            ts[key] = newTs;
            this.saveLocalTs(ts);

            fbRequest('PATCH', 'global_sync', updateObj, function() {
                var text = new Date().toLocaleString('ru-RU') + ' (Авто)';
                Lampa.Storage.set('fb_sync_last_time', text); updateMenuStatus('fb_status_sync', text);
            });
        },
        goPush: function(manual) {
            if (manual) Lampa.Noty.show('Отправка истории и избранного...');
            var toPush = this.getPushData(true);
            if (!toPush) { if (manual) Lampa.Noty.show('Нет данных для отправки'); return; }

            fbRequest('PATCH', 'global_sync', toPush, function() {
                if (manual) Lampa.Noty.show('Данные отправлены');
                var text = new Date().toLocaleString('ru-RU') + ' (Отправка)';
                Lampa.Storage.set('fb_sync_last_time', text); updateMenuStatus('fb_status_sync', text);
            }, function() { if (manual) Lampa.Noty.show('Ошибка отправки'); });
        },
        goPull: function(manual) {
            if (manual) Lampa.Noty.show('Получение данных...');
            fbRequest('GET', 'global_sync', null, function(cloud) {
                if (cloud) {
                    var localTs = DataSync.getLocalTs(), hasChanges = false;
                    DataSync.isSyncingNow = true;

                    for (var key in cloud) {
                        if (sync_keys.indexOf(key) !== -1 && cloud[key] && cloud[key]._timestamp !== undefined) {
                            var cTs = parseInt(cloud[key]._timestamp) || 0, lTs = parseInt(localTs[key]) || 0;
                            var isDiff = isDataDifferent(cloud[key].data, Lampa.Storage.get(key));
                            if (cTs > lTs && cloud[key].data && isDiff) {
                                Lampa.Storage.set(key, cloud[key].data, false);
                                DataSync.memoryCache[key] = JSON.stringify(cloud[key].data);
                                localTs[key] = cTs;
                                hasChanges = true;
                            }
                        }
                    }
                    if (hasChanges) {
                        Lampa.Storage.set('fb_sync_timestamps', localTs, true);
                        var text = new Date().toLocaleString('ru-RU') + ' (Получение)';
                        Lampa.Storage.set('fb_sync_last_time', text, true);
                        updateMenuStatus('fb_status_sync', text);
                        reloadApp(manual ? 'Данные загружены' : 'Синхронизация данных');
                    } else if (manual) Lampa.Noty.show('У вас актуальные данные');

                    setTimeout(function() { DataSync.isSyncingNow = false; }, 500);
                } else if (manual) Lampa.Noty.show('Облако пустое');
            });
        },
        fileExport: function() { var d = {}; sync_keys.forEach(function(k) { d[k] = Lampa.Storage.get(k); }); downloadLocalFile(d, 'lampa_history.json'); },
        fileImport: function() { uploadLocalFile(function(data) {
            var now = Date.now(), localTs = DataSync.getLocalTs();
            for (var k in data) { if (sync_keys.indexOf(k) !== -1) { Lampa.Storage.set(k, data[k], false); localTs[k] = now; } }
            Lampa.Storage.set('fb_sync_timestamps', localTs, true);
            reloadApp('Файл истории/избранного применён');
        }); }
    };

    var TimecodesSync = {
        memoryCache: {},
        getStorageKey: function() { return (typeof Lampa.Timeline === 'object' && typeof Lampa.Timeline.filename === 'function') ? Lampa.Timeline.filename() : 'file_view'; },
        getAll: function() { return safeClone(Lampa.Storage.get(this.getStorageKey(), {})); },
        saveAll: function(data) { Lampa.Storage.set(this.getStorageKey(), data, true); },

        getPushData: function(forceAll) {
            var all = this.getAll();
            var toPush = {}, hasChanges = false, now = Date.now();
            for (var hash in all) {
                var item = all[hash];
                if (!item || item.percent === undefined || isNaN(item.percent)) continue;

                var str = JSON.stringify({ d: item.duration, t: item.time, p: item.percent });
                if (this.memoryCache[hash] !== str || forceAll) {
                    if (this.memoryCache[hash] !== str || !item._timestamp) {
                        item._timestamp = Math.max(now, (parseInt(item._timestamp) || 0) + 1);
                        this.memoryCache[hash] = str;
                        hasChanges = true;
                    }
                    toPush[hash] = item;
                }
            }
            if (hasChanges) this.saveAll(all);
            return Object.keys(toPush).length > 0 ? toPush : null;
        },

        autoPush: function() {
            if (!window.lampac_firebase_initial_pull_done || window.lampac_firebase_reloading) return;
            var toPush = TimecodesSync.getPushData(false);
            if (toPush) {
                fbRequest('PATCH', 'global_timecodes', toPush, function() {
                    var text = new Date().toLocaleString('ru-RU') + ' (Авто)';
                    Lampa.Storage.set('fb_tc_last_time', text); updateMenuStatus('fb_status_tc', text);
                });
            }
        },
        goPush: function(manual) {
            if (manual) Lampa.Noty.show('Отправка таймкодов...');
            var toPush = this.getPushData(true);
            if (!toPush) { if (manual) Lampa.Noty.show('Нет таймкодов'); return; }

            fbRequest('PATCH', 'global_timecodes', toPush, function() {
                if (manual) Lampa.Noty.show('Таймкоды отправлены');
                var text = new Date().toLocaleString('ru-RU') + ' (Отправка)';
                Lampa.Storage.set('fb_tc_last_time', text); updateMenuStatus('fb_status_tc', text);
            }, function() { if (manual) Lampa.Noty.show('Ошибка отправки таймкодов'); });
        },
        goPull: function(manual) {
            if (manual) Lampa.Noty.show('Получение таймкодов...');
            fbRequest('GET', 'global_timecodes', null, function(remote) {
                if (remote) {
                    var local = TimecodesSync.getAll(), hasChanges = false;
                    for (var hash in remote) {
                        var rItem = remote[hash];
                        if (!rItem || typeof rItem !== 'object' || rItem.percent === undefined) continue;

                        var lItem = local[hash];
                        var rTs = parseInt(rItem._timestamp) || 0;
                        var lTs = parseInt(lItem && lItem._timestamp) || 0;

                        if (rTs > lTs) {
                            local[hash] = rItem;
                            hasChanges = true;
                            TimecodesSync.memoryCache[hash] = JSON.stringify({ d: rItem.duration, t: rItem.time, p: rItem.percent });
                        }
                    }
                    if (hasChanges) {
                        TimecodesSync.saveAll(local);
                        var text = new Date().toLocaleString('ru-RU') + ' (Получение)';
                        Lampa.Storage.set('fb_tc_last_time', text, true); updateMenuStatus('fb_status_tc', text);
                        reloadApp(manual ? 'Таймкоды загружены' : 'Синхронизация таймкодов');
                    } else if (manual) Lampa.Noty.show('Таймкоды актуальны');
                } else if (manual) Lampa.Noty.show('Облако пустое');
            });
        },
        fileExport: function() { downloadLocalFile(this.getAll(), 'lampa_timecodes.json'); },
        fileImport: function() { uploadLocalFile(function(data) {
            var local = TimecodesSync.getAll(), now = Date.now();
            for (var hash in data) { if (data[hash] && data[hash].percent !== undefined) { data[hash]._timestamp = now; local[hash] = data[hash]; } }
            TimecodesSync.saveAll(local); reloadApp('Файл таймкодов импортирован');
        }); }
    };

    // ==========================================
    // ПРОФИЛИ ПОЛНОГО БЭКАПА
    // ==========================================
    function getBackupPath(profileId) {
        if (profileId === 'tv') return 'global_backup_tv';
        if (profileId === 'phone') return 'global_backup_phone';
        return 'global_backup';
    }

    var FullBackup = {
        goPush: function(manual, profileId) {
            if (manual) Lampa.Noty.show('Подготовка полного бэкапа (' + profileId + ')...');
            var chunks = [];
            var currentChunkData = {};
            var currentChunkSize = 0;
            var MAX_CHUNK_SIZE = 500000;
            var basePath = getBackupPath(profileId);

            try {
                for (var i = 0; i < localStorage.length; i++) {
                    try {
                        var k = localStorage.key(i);
                        if (k) {
                            var val = localStorage.getItem(k);
                            if (val !== null && typeof val === 'string') {
                                var size = k.length + val.length;
                                if (currentChunkSize + size > MAX_CHUNK_SIZE && Object.keys(currentChunkData).length > 0) {
                                    chunks.push(currentChunkData);
                                    currentChunkData = {};
                                    currentChunkSize = 0;
                                }
                                currentChunkData[k] = val;
                                currentChunkSize += size;
                            }
                        }
                    } catch(errItem) {}
                }
                if (Object.keys(currentChunkData).length > 0) {
                    chunks.push(currentChunkData);
                }
            } catch(e) {
                if (manual) Lampa.Noty.show('Ошибка доступа к хранилищу');
                return;
            }

            var totalChunks = chunks.length;
            if (totalChunks === 0) {
                if (manual) Lampa.Noty.show('Хранилище пустое, нечего сохранять');
                return;
            }

            var currentChunk = 0;

            function sendNextChunk() {
                if (currentChunk >= totalChunks) {
                    fbRequest('PUT', basePath + '/meta', { total: totalChunks, _timestamp: Date.now() }, function() {
                        if (manual) Lampa.Noty.show('Бэкап создан в облаке (' + totalChunks + ' частей)');
                    });
                    return;
                }
                if (manual) Lampa.Noty.show('Отправка бэкапа... (' + (currentChunk + 1) + '/' + totalChunks + ')');

                fbRequest('PUT', basePath + '/chunks/' + currentChunk, { data: JSON.stringify(chunks[currentChunk]) }, function() {
                    currentChunk++;
                    setTimeout(sendNextChunk, 100);
                }, function() {
                    if (manual) Lampa.Noty.show('Ошибка отправки части ' + (currentChunk + 1));
                });
            }

            if (manual) Lampa.Noty.show('Очистка старого бэкапа...');
            fbRequest('DELETE', basePath, null, function() { sendNextChunk(); }, function() { sendNextChunk(); });
        },
        goPull: function(manual, profileId) {
            if (manual) Lampa.Noty.show('Поиск бэкапа в облаке (' + profileId + ')...');
            var basePath = getBackupPath(profileId);

            fbRequest('GET', basePath + '/meta', null, function(meta) {
                if (meta && meta.total) {
                    var totalChunks = meta.total;
                    var currentChunk = 0;
                    var keysCount = 0;

                    function getNextChunk() {
                        if (currentChunk >= totalChunks) {
                            reloadApp('Бэкап восстановлен (' + keysCount + ' ключей)');
                            return;
                        }
                        if (manual) Lampa.Noty.show('Получение бэкапа... (' + (currentChunk + 1) + '/' + totalChunks + ')');

                        fbRequest('GET', basePath + '/chunks/' + currentChunk, null, function(chunkRes) {
                            if (chunkRes && chunkRes.data) {
                                try {
                                    var data = typeof chunkRes.data === 'string' ? JSON.parse(chunkRes.data) : chunkRes.data;
                                    for (var i in data) { try { localStorage.setItem(i, data[i]); keysCount++; } catch (err) {} }
                                    currentChunk++;
                                    setTimeout(getNextChunk, 100);
                                } catch (e) {
                                    if (manual) Lampa.Noty.show('Ошибка обработки части ' + (currentChunk + 1));
                                }
                            } else {
                                if (manual) Lampa.Noty.show('Ошибка: часть ' + (currentChunk + 1) + ' пустая');
                            }
                        }, function() {
                            if (manual) Lampa.Noty.show('Ошибка сети при загрузке части ' + (currentChunk + 1));
                        });
                    }
                    getNextChunk();
                } else {
                    if (manual) Lampa.Noty.show('Загрузка старого формата бэкапа...');
                    fbRequest('GET', basePath, null, function(json) {
                        if (json && json.data) {
                            try {
                                var data = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
                                var keysCount = 0;
                                for (var i in data) { try { localStorage.setItem(i, data[i]); keysCount++; } catch (err) {} }
                                reloadApp('Бэкап восстановлен (' + keysCount + ' ключей)');
                            } catch (e) { Lampa.Noty.show('Ошибка парсинга бэкапа'); }
                        } else if (manual) Lampa.Noty.show('Данные отсутствуют');
                    });
                }
            }, function() {
                if (manual) Lampa.Noty.show('Ошибка доступа к облаку');
            });
        },
        fileExport: function() { try { var b = {}; for (var i = 0; i < localStorage.length; i++) { try { var k = localStorage.key(i); b[k] = localStorage.getItem(k); } catch (e) {} } downloadLocalFile(b, 'lampa_full_backup.json'); } catch(e) {} },
        fileImport: function() { uploadLocalFile(function(data) { var c = 0; for (var i in data) { try { localStorage.setItem(i, data[i]); c++; } catch (err) {} } reloadApp('Локальный бэкап восстановлен (' + c + ' ключей)'); }); }
    };

    function openBackupMenu() {
        Lampa.Select.show({
            title: 'Полный бэкап (Профили)',
            items: [
                { title: 'Отправить в облако', id: 'push' },
                { title: 'Получить из облака', id: 'pull' },
                { title: 'Сохранить в файл', id: 'exp' },
                { title: 'Загрузить из файла', id: 'imp' }
            ],
            onSelect: function(a) {
                if (a.id == 'exp') { FullBackup.fileExport(); Lampa.Controller.toggle('settings_component'); }
                else if (a.id == 'imp') { confirmAction(function() { FullBackup.fileImport(); }); }
                else {
                    setTimeout(function() {
                        Lampa.Select.show({
                            title: a.id == 'push' ? 'Отправить бэкап: выберите профиль' : 'Получить бэкап: выберите профиль',
                            items: [
                                { title: 'Профиль: ПК (основной)', id: 'pc' },
                                { title: 'Профиль: ТВ', id: 'tv' },
                                { title: 'Профиль: Телефон', id: 'phone' }
                            ],
                            onSelect: function(prof) {
                                confirmAction(function() {
                                    if (a.id == 'push') FullBackup.goPush(true, prof.id);
                                    else FullBackup.goPull(true, prof.id);
                                });
                            },
                            onBack: function() { openBackupMenu(); }
                        });
                    }, 50);
                }
            },
            onBack: function() { Lampa.Controller.toggle('settings_component'); }
        });
    }

    // ==========================================
    // 1.5 ПОЛНАЯ СИНХРОНИЗАЦИЯ (ВСЁ ВМЕСТЕ)
    // ==========================================
    var UnifiedSync = {
        goPush: function(manual) {
            if (manual) Lampa.Noty.show('Отправка всех данных...');
            var totalRequests = 3, completedRequests = 0, errors = 0;

            function checkDone() {
                completedRequests++;
                if (completedRequests >= totalRequests) {
                    if (errors === 0 && manual) Lampa.Noty.show('Все данные успешно отправлены в облако');
                    else if (manual) Lampa.Noty.show('Некоторые данные не удалось отправить');
                }
            }

            var now = Date.now(), pluginsData = localStorage.getItem('plugins');
            if (!pluginsData || typeof pluginsData !== 'string' || pluginsData.trim() === '') pluginsData = '[]';

            Lampa.Storage.set('fb_plugins_ts', now, true);
            fbRequest('PUT', 'plugins_sync', { data: pluginsData, _timestamp: now }, function() {
                var text = new Date().toLocaleString('ru-RU') + ' (Отправка)';
                Lampa.Storage.set('fb_plugins_last_time', text); updateMenuStatus('fb_status_plugins', text);
                checkDone();
            }, function() { errors++; checkDone(); });

            var syncData = DataSync.getPushData(true);
            if (syncData) {
                fbRequest('PATCH', 'global_sync', syncData, function() {
                    var text = new Date().toLocaleString('ru-RU') + ' (Отправка)';
                    Lampa.Storage.set('fb_sync_last_time', text); updateMenuStatus('fb_status_sync', text);
                    checkDone();
                }, function() { errors++; checkDone(); });
            } else { checkDone(); }

            var tcData = TimecodesSync.getPushData(true);
            if (tcData) {
                fbRequest('PATCH', 'global_timecodes', tcData, function() {
                    var text = new Date().toLocaleString('ru-RU') + ' (Отправка)';
                    Lampa.Storage.set('fb_tc_last_time', text); updateMenuStatus('fb_status_tc', text);
                    checkDone();
                }, function() { errors++; checkDone(); });
            } else { checkDone(); }
        },
        goPull: function(manual) {
            if (manual) Lampa.Noty.show('Загрузка всех данных...');
            var totalRequests = 3, completedRequests = 0, needsReload = false;
            var pendingUpdates = { plugins: null, sync: null, tc: null };

            function checkDone() {
                completedRequests++;
                if (completedRequests >= totalRequests) {
                    if (needsReload) {
                        window.lampac_firebase_reloading = true;

                        if (pendingUpdates.plugins) {
                            try { localStorage.setItem('plugins', pendingUpdates.plugins.data); } catch(e){}
                            Lampa.Storage.set('fb_plugins_ts', pendingUpdates.plugins.ts, true);
                            var textPlugins = new Date().toLocaleString('ru-RU') + ' (Получение)';
                            Lampa.Storage.set('fb_plugins_last_time', textPlugins, true);
                            updateMenuStatus('fb_status_plugins', textPlugins);
                        }
                        if (pendingUpdates.sync) {
                            for (var key in pendingUpdates.sync.data) {
                                Lampa.Storage.set(key, pendingUpdates.sync.data[key], false);
                            }
                            Lampa.Storage.set('fb_sync_timestamps', pendingUpdates.sync.ts, true);
                            var textSync = new Date().toLocaleString('ru-RU') + ' (Получение)';
                            Lampa.Storage.set('fb_sync_last_time', textSync, true);
                            updateMenuStatus('fb_status_sync', textSync);
                        }
                        if (pendingUpdates.tc) {
                            Lampa.Storage.set(TimecodesSync.getStorageKey(), pendingUpdates.tc, true);
                            var textTc = new Date().toLocaleString('ru-RU') + ' (Получение)';
                            Lampa.Storage.set('fb_tc_last_time', textTc, true);
                            updateMenuStatus('fb_status_tc', textTc);
                        }

                        try { if (typeof Lampa.Storage.save === 'function') Lampa.Storage.save(); } catch(e) {}

                        Lampa.Noty.show((manual ? 'Все данные восстановлены из облака' : 'Синхронизация данных') + ' (3 сек)');
                        setTimeout(function() { window.location.reload(); }, 3000);
                    } else if (manual) Lampa.Noty.show('У вас уже актуальные данные');
                }
            }

            fbRequest('GET', 'plugins_sync', null, function(json) {
                if (json && json.data) {
                    var cloudDataStr = typeof json.data === 'string' ? json.data : JSON.stringify(json.data);
                    var cloudTs = parseInt(json._timestamp) || 0;
                    var localTs = parseInt(Lampa.Storage.get('fb_plugins_ts', 0)) || 0;
                    var localData = localStorage.getItem('plugins') || '[]';

                    if (cloudTs > localTs && isDataDifferent(cloudDataStr, localData)) {
                        pendingUpdates.plugins = { data: cloudDataStr, ts: cloudTs };
                        needsReload = true;
                    }
                }
                checkDone();
            }, checkDone);

            fbRequest('GET', 'global_sync', null, function(cloud) {
                if (cloud) {
                    var localTs = DataSync.getLocalTs(), hasChanges = false, syncDataToApply = {};
                    for (var key in cloud) {
                        if (sync_keys.indexOf(key) !== -1 && cloud[key] && cloud[key]._timestamp !== undefined) {
                            var cTs = parseInt(cloud[key]._timestamp) || 0, lTs = parseInt(localTs[key]) || 0;
                            var isDiff = isDataDifferent(cloud[key].data, Lampa.Storage.get(key));
                            if (cTs > lTs && cloud[key].data && isDiff) {
                                syncDataToApply[key] = cloud[key].data;
                                DataSync.memoryCache[key] = JSON.stringify(cloud[key].data);
                                localTs[key] = cTs; hasChanges = true;
                            }
                        }
                    }
                    if (hasChanges) { pendingUpdates.sync = { data: syncDataToApply, ts: localTs }; needsReload = true; }
                }
                checkDone();
            }, checkDone);

            fbRequest('GET', 'global_timecodes', null, function(remote) {
                if (remote) {
                    var local = TimecodesSync.getAll(), hasChanges = false;
                    for (var hash in remote) {
                        var rItem = remote[hash];
                        if (!rItem || typeof rItem !== 'object' || rItem.percent === undefined) continue;

                        var lItem = local[hash], rTs = parseInt(rItem._timestamp) || 0, lTs = parseInt(lItem && lItem._timestamp) || 0;
                        if (rTs > lTs) {
                            local[hash] = rItem; hasChanges = true;
                            TimecodesSync.memoryCache[hash] = JSON.stringify({ d: rItem.duration, t: rItem.time, p: rItem.percent });
                        }
                    }
                    if (hasChanges) { pendingUpdates.tc = local; needsReload = true; }
                }
                checkDone();
            }, checkDone);
        }
    };

    // ==========================================
    // 2. СИСТЕМА КАСТОМНЫХ ССЫЛОК
    // ==========================================
    var CustomLinkSync = {
        sendUrl: function(returnCtrl) {
            var rc = returnCtrl || 'settings_component';
            setTimeout(function() {
                Lampa.Input.edit({ title: 'Введите URL для передачи', value: '', free: true, nosave: true }, function (new_val) {
                    if (new_val) {
                        Lampa.Noty.show('Отправка ссылки...');
                        fbRequest('PUT', 'global_custom_link', { url: new_val, _timestamp: Date.now() }, function() {
                            Lampa.Noty.show('Ссылка сохранена в облаке');
                        }, function() { Lampa.Noty.show('Ошибка сохранения ссылки'); });
                    }
                    setTimeout(function() { Lampa.Controller.toggle(rc); }, 10);
                });
            }, 300);
        },
        playUrl: function(returnCtrl) {
            var rc = returnCtrl || 'settings_component';
            Lampa.Noty.show('Загрузка ссылки из облака...');
            fbRequest('GET', 'global_custom_link', null, function(data) {
                if (data && data.url) {
                    var video = { title: 'Трансляция из облака', url: data.url };
                    Lampa.Player.play(video); Lampa.Player.playlist([video]);
                } else {
                    Lampa.Noty.show('Ссылка не найдена в облаке');
                    setTimeout(function() { Lampa.Controller.toggle(rc); }, 10);
                }
            }, function() {
                Lampa.Noty.show('Ошибка загрузки ссылки');
                setTimeout(function() { Lampa.Controller.toggle(rc); }, 10);
            });
        }
    };

    // ==========================================
    // 3. ЕДИНОЕ ОБНОВЛЕНИЕ ПРИ ЗАПУСКЕ
    // ==========================================
    function initialUnifiedPull() {
        if (!isAuthConfigured()) {
            window.lampac_firebase_initial_pull_done = true;
            return;
        }

        var needsReload = false, totalRequests = 3, completedRequests = 0;
        var pendingUpdates = { plugins: null, sync: null, tc: null };

        function checkDone() {
            completedRequests++;
            if (completedRequests >= totalRequests) {
                if (needsReload) {
                    window.lampac_firebase_reloading = true;

                    if (pendingUpdates.plugins) {
                        try { localStorage.setItem('plugins', pendingUpdates.plugins.data); } catch(e){}
                        Lampa.Storage.set('fb_plugins_ts', pendingUpdates.plugins.ts, true);
                    }
                    if (pendingUpdates.sync) {
                        for (var key in pendingUpdates.sync.data) {
                            Lampa.Storage.set(key, pendingUpdates.sync.data[key], false);
                        }
                        Lampa.Storage.set('fb_sync_timestamps', pendingUpdates.sync.ts, true);
                    }
                    if (pendingUpdates.tc) {
                        Lampa.Storage.set(TimecodesSync.getStorageKey(), pendingUpdates.tc, true);
                    }

                    try { if (typeof Lampa.Storage.save === 'function') Lampa.Storage.save(); } catch(e) {}

                    Lampa.Noty.show('Синхронизация: загружены новые данные из облака (3 сек)');
                    setTimeout(function() { window.location.reload(); }, 3000);
                } else {
                    window.lampac_firebase_initial_pull_done = true;
                }
            }
        }

        fbRequest('GET', 'plugins_sync', null, function(pData) {
            if (pData && pData.data) {
                var cloudDataStr = typeof pData.data === 'string' ? pData.data : JSON.stringify(pData.data);
                var cTs = parseInt(pData._timestamp) || 0;
                var lTs = parseInt(Lampa.Storage.get('fb_plugins_ts', 0)) || 0;
                var lData = localStorage.getItem('plugins') || '[]';

                if (cTs > lTs && isDataDifferent(cloudDataStr, lData)) {
                    pendingUpdates.plugins = { data: cloudDataStr, ts: cTs };
                    needsReload = true;
                }
            }
            checkDone();
        }, checkDone);

        fbRequest('GET', 'global_sync', null, function(sData) {
            if (sData) {
                var lTsSync = DataSync.getLocalTs(), hasChangesSync = false, syncDataToApply = {};
                for (var key in sData) {
                    if (sync_keys.indexOf(key) !== -1 && sData[key] && sData[key]._timestamp !== undefined) {
                        var cTsSync = parseInt(sData[key]._timestamp) || 0, lTsKey = parseInt(lTsSync[key]) || 0;
                        var isDiff = isDataDifferent(sData[key].data, Lampa.Storage.get(key));

                        if (cTsSync > lTsKey && sData[key].data && isDiff) {
                            syncDataToApply[key] = sData[key].data;
                            DataSync.memoryCache[key] = JSON.stringify(sData[key].data);
                            lTsSync[key] = cTsSync; hasChangesSync = true;
                        }
                    }
                }
                if (hasChangesSync) { pendingUpdates.sync = { data: syncDataToApply, ts: lTsSync }; needsReload = true; }
            }
            checkDone();
        }, checkDone);

        fbRequest('GET', 'global_timecodes', null, function(tcData) {
            if (tcData) {
                var localTc = TimecodesSync.getAll(), hasChangesTc = false;
                for (var hash in tcData) {
                    var rItem = tcData[hash];
                    if (!rItem || typeof rItem !== 'object' || rItem.percent === undefined) continue;

                    var lItem = localTc[hash], rTsTc = parseInt(rItem._timestamp) || 0, lTsTc = parseInt(lItem && lItem._timestamp) || 0;
                    if (rTsTc > lTsTc) {
                        localTc[hash] = rItem; hasChangesTc = true;
                        TimecodesSync.memoryCache[hash] = JSON.stringify({ d: rItem.duration, t: rItem.time, p: rItem.percent });
                    }
                }
                if (hasChangesTc) { pendingUpdates.tc = localTc; needsReload = true; }
            }
            checkDone();
        }, checkDone);
    }

    // ==========================================
    // 4. КНОПКА ВЫХОДА И СИНХРОНИЗАЦИИ
    // ==========================================
    function appExit() {
        if (Lampa.Platform.is('apple_tv')) window.location.assign('exit://exit');
        if (Lampa.Platform.is('tizen')) tizen.application.getCurrentApplication().exit();
        if (Lampa.Platform.is('webos')) window.close();
        if (Lampa.Platform.is('android')) Lampa.Android.exit();
        if (Lampa.Platform.is('orsay')) Lampa.Orsay.exit();
        if (Lampa.Platform.is('nw')) nw.Window.get().close();
        window.close();
    }

    function syncAndExit() {
        Lampa.Noty.show('Синхронизация перед выходом...');
        var totalRequests = 2, completedRequests = 0;
        var exitTimeout = setTimeout(appExit, 5000);

        function checkDone() {
            completedRequests++;
            if (completedRequests >= totalRequests) { clearTimeout(exitTimeout); appExit(); }
        }

        var syncData = DataSync.getPushData(false);
        if (syncData) fbRequest('PATCH', 'global_sync', syncData, checkDone, checkDone); else checkDone();

        var tcData = TimecodesSync.getPushData(false);
        if (tcData) fbRequest('PATCH', 'global_timecodes', tcData, checkDone, checkDone); else checkDone();
    }

    function addTopMenuExitBtn() {
        if ($('.head__action.open--exit_custom').length) return;

        var ico = '<svg version="1.1" viewBox="0 0 512 512" style="width: 2.2em; height: 2.2em;" xml:space="preserve"><path fill="currentColor" d="M256,5.1c138.6,0,250.9,112.3,250.9,250.9S394.6,506.9,256,506.9S5.1,394.6,5.1,256S117.4,5.1,256,5.1z M256,40.1C136.7,40.1,40.1,136.7,40.1,256S136.7,471.9,256,471.9S471.9,375.3,471.9,256S375.3,40.1,256,40.1z M311.4,176.6 c6.7-6.7,17.5-6.7,24.2,0c6.7,6.7,6.7,17.5,0,24.2l-55.1,55.1l55.1,55c6.7,6.7,6.7,17.5,0,24.2c-6.7-6.7-17.5,6.7-24.2,0L256.3,280 l-55.1,55.1c-6,6-15.4,6.6-22.1,1.8l-2.2-1.8c-6.7-6.7-6.7-17.5,0-24.2l55.1-55l-55.1-55c-6.7-6.7-6.7-17.5,0-24.2s17.5-6.7,24.2,0 l55.1,55.1L311.4,176.6z"/></svg>';
        var exit_btn = $('<div class="head__action selector open--exit_custom" title="Выход / Облако">' + ico + '</div>');

        exit_btn.on('hover:enter click', function () {
            Lampa.Select.show({
                title: 'Выход / Облако',
                items: [
                    { title: 'Выйти из Lampa', id: 'exit' },
                    { title: 'Синхронизация и выход', id: 'sync_exit' },
                    { title: 'Отправить ссылку', id: 'send_cloud' },
                    { title: 'Воспроизвести из облака', id: 'play_cloud' }
                ],
                onSelect: function(a) {
                    if (a.id == 'exit') appExit();
                    else if (a.id == 'sync_exit') syncAndExit();
                    else if (a.id == 'send_cloud') CustomLinkSync.sendUrl('head');
                    else if (a.id == 'play_cloud') CustomLinkSync.playUrl('head');
                },
                onBack: function() { Lampa.Controller.toggle('head'); }
            });
        });

        if ($('.head__actions').length) $('.head__actions').append(exit_btn);
        else $('.head').append(exit_btn);
    }

    // ==========================================
    // 5. НАСТРОЙКИ АВТОРИЗАЦИИ FIREBASE
    // ==========================================
    function openAuthSettings() {
        setTimeout(function() {
            Lampa.Select.show({
                title: 'Настройки Firebase',
                items: [
                    { title: 'API Key: ' + (Lampa.Storage.get('fb_apiKey', '') ? '***' : 'не задан'), id: 'apiKey' },
                    { title: 'Email: ' + (Lampa.Storage.get('fb_email', '') || 'не задан'), id: 'email' },
                    { title: 'Пароль: ' + (Lampa.Storage.get('fb_password', '') ? '***' : 'не задан'), id: 'password' },
                    { title: 'Database URL: ' + (Lampa.Storage.get('fb_dbUrl', '') || 'не задан'), id: 'dbUrl' },
                    { title: '-- Проверить подключение', id: 'test' },
                    { title: '-- Очистить все данные авторизации', id: 'clear' }
                ],
                onSelect: function(a) {
                    if (a.id === 'test') {
                        if (!isAuthConfigured()) {
                            Lampa.Noty.show('Заполните все поля авторизации');
                            setTimeout(function() { openAuthSettings(); }, 50);
                            return;
                        }
                        // Сбрасываем кешированный токен для принудительной проверки
                        fb_idToken = null; fb_tokenExpire = 0; fb_auth_credKey = '';
                        Lampa.Noty.show('Проверка подключения...');
                        getAuthToken(function() {
                            Lampa.Noty.show('Firebase: авторизация успешна!');
                        }, function() {
                            // Ошибка уже показана в getAuthToken
                        });
                        setTimeout(function() { Lampa.Controller.toggle('settings_component'); }, 10);
                        return;
                    }
                    if (a.id === 'clear') {
                        confirmAction(function() {
                            Lampa.Storage.set('fb_apiKey', '', true);
                            Lampa.Storage.set('fb_email', '', true);
                            Lampa.Storage.set('fb_password', '', true);
                            Lampa.Storage.set('fb_dbUrl', '', true);
                            fb_idToken = null; fb_tokenExpire = 0; fb_auth_credKey = '';
                            Lampa.Noty.show('Данные авторизации очищены');
                        });
                        return;
                    }
                    var titles = {
                        apiKey: 'Firebase API Key',
                        email: 'Email для Firebase',
                        password: 'Пароль Firebase',
                        dbUrl: 'Database URL (https://xxx.firebaseio.com)'
                    };
                    setTimeout(function() {
                        Lampa.Input.edit({
                            title: titles[a.id] || a.id,
                            value: Lampa.Storage.get('fb_' + a.id, '') || '',
                            free: true,
                            nosave: true
                        }, function(val) {
                            if (val !== undefined && val !== null) {
                                Lampa.Storage.set('fb_' + a.id, val.trim(), true);
                                // Сбрасываем токен при изменении учётных данных
                                fb_idToken = null; fb_tokenExpire = 0; fb_auth_credKey = '';
                                Lampa.Noty.show('Сохранено');
                            }
                            setTimeout(function() { openAuthSettings(); }, 50);
                        });
                    }, 300);
                },
                onBack: function() { Lampa.Controller.toggle('settings_component'); }
            });
        }, 50);
    }

    // ==========================================
    // 6. СИНХРОНИЗАЦИЯ НАСТРОЕК ПЛАГИНОВ
    // ==========================================
    var PluginSettingsSync = {
        openMenu: function() {
            var pData = localStorage.getItem('plugins'), plugins = [];
            try { if (pData) plugins = JSON.parse(pData); } catch(e) {}
            if (!plugins || plugins.length === 0) { Lampa.Noty.show('Нет установленных плагинов'); return; }

            var items = plugins.map(function(p, index) {
                var name = p.name || p.url || 'Плагин ' + (index + 1);
                return { title: name, plugin: p, name: name };
            });

            Lampa.Select.show({
                title: 'Синхронизация настроек плагина',
                items: items,
                onSelect: function(a) { PluginSettingsSync.processPlugin(a.plugin, a.name); },
                onBack: function() { Lampa.Controller.toggle('settings_component'); }
            });
        },

        processPlugin: function(plugin, pName) {
            Lampa.Noty.show('Анализ кода плагина...');

            var fallbackPrefix = pName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '') || 'plugin_data';

            if (plugin.url && plugin.url.indexOf('http') === 0) {
                $.ajax({
                    url: plugin.url,
                    dataType: 'text',
                    timeout: 5000,
                    success: function(code) {
                        var foundKeys = [];
                        var regex = /(?:Storage\.get|Storage\.set|localStorage\.getItem|localStorage\.setItem|Lampa\.Storage\.get|Lampa\.Storage\.set)\s*\(\s*['"]([^'"]+)['"]/g;
                        var match;
                        while ((match = regex.exec(code)) !== null) {
                            var k = match[1];
                            if (['true','false','0','1','','plugins','torrents_view'].indexOf(k) === -1) {
                                if (foundKeys.indexOf(k) === -1) foundKeys.push(k);
                            }
                        }

                        var existingKeys = [];
                        foundKeys.forEach(function(fk) {
                            for (var i = 0; i < localStorage.length; i++) {
                                var locKey = localStorage.key(i);
                                if (locKey === fk || locKey.indexOf(fk + '_') === 0) {
                                    if (existingKeys.indexOf(locKey) === -1) existingKeys.push(locKey);
                                }
                            }
                        });

                        var resultString = existingKeys.length > 0 ? existingKeys.join(',') : fallbackPrefix;
                        PluginSettingsSync.showSyncAction(pName, resultString);
                    },
                    error: function() { PluginSettingsSync.showSyncAction(pName, fallbackPrefix); }
                });
            } else { PluginSettingsSync.showSyncAction(pName, fallbackPrefix); }
        },

        showSyncAction: function(pName, keysString) {
            setTimeout(function() {
                Lampa.Select.show({
                    title: 'Настройки: ' + pName,
                    items: [
                        { title: 'Отправить в облако', id: 'push' },
                        { title: 'Загрузить из облака', id: 'pull' }
                    ],
                    onSelect: function(action) {
                        setTimeout(function() {
                            Lampa.Input.edit({
                                title: 'Найденные ключи (через запятую):',
                                value: keysString, free: true, nosave: true
                            }, function (finalKeys) {
                                if (finalKeys) {
                                    var safeId = pName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                                    if (action.id === 'push') PluginSettingsSync.pushSettings(safeId, finalKeys);
                                    else PluginSettingsSync.pullSettings(safeId, finalKeys);
                                }
                                setTimeout(function() { Lampa.Controller.toggle('settings_component'); }, 10);
                            });
                        }, 300);
                    },
                    onBack: function() { PluginSettingsSync.openMenu(); }
                });
            }, 50);
        },

        pushSettings: function(safeId, keysString) {
            var keys = keysString.split(',').map(function(k){return k.trim();}).filter(Boolean);
            var data = {}, count = 0;

            keys.forEach(function(k) {
                for (var i = 0; i < localStorage.length; i++) {
                    var localKey = localStorage.key(i);
                    if (localKey === k || localKey.indexOf(k + '_') === 0) {
                        data[localKey] = localStorage.getItem(localKey);
                        count++;
                    }
                }
            });

            if (count === 0) { Lampa.Noty.show('Не найдено данных для этих ключей'); return; }

            Lampa.Noty.show('Отправка настроек (' + count + ' записей)...');
            fbRequest('PUT', 'plugin_settings_' + safeId, { data: JSON.stringify(data), _timestamp: Date.now() }, function() {
                Lampa.Noty.show('Настройки плагина сохранены в облаке!');
            });
        },

        pullSettings: function(safeId, keysString) {
            Lampa.Noty.show('Поиск настроек в облаке...');
            fbRequest('GET', 'plugin_settings_' + safeId, null, function(res) {
                if (res && res.data) {
                    try {
                        var data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                        var count = 0;
                        for (var k in data) { localStorage.setItem(k, data[k]); count++; }
                        reloadApp('Настройки плагина загружены (' + count + ' записей)');
                    } catch(e) { Lampa.Noty.show('Ошибка формата'); }
                } else { Lampa.Noty.show('В облаке нет сохранённых настроек для этого плагина'); }
            });
        }
    };


    // ==========================================
    // ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА
    // ==========================================
    var ModulesObj = { 'plugins': PluginsSync, 'sync': DataSync, 'tc': TimecodesSync };

    function openSubMenu(moduleKey, titleText) {
        Lampa.Select.show({
            title: titleText,
            items: [
                { title: 'Отправить в облако', id: 'push' },
                { title: 'Получить из облака', id: 'pull' },
                { title: 'Сохранить в файл', id: 'exp' },
                { title: 'Загрузить из файла', id: 'imp' }
            ],
            onSelect: function(a) {
                if (a.id == 'exp') { ModulesObj[moduleKey].fileExport(); Lampa.Controller.toggle('settings_component'); }
                else if (a.id == 'push') { confirmAction(function() { ModulesObj[moduleKey].goPush(true); }); }
                else if (a.id == 'pull') { confirmAction(function() { ModulesObj[moduleKey].goPull(true); }); }
                else if (a.id == 'imp') { confirmAction(function() { ModulesObj[moduleKey].fileImport(); }); }
            },
            onBack: function() { Lampa.Controller.toggle('settings_component'); }
        });
    }

    function initPlugin() {
        try {
            window.lampac_firebase_unified_plugin = true;

            Lampa.SettingsApi.addComponent({
                component: 'firebase_unified_menu',
                icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.1158 20.1477 10.1691 17.8016 10.0101C17.3697 6.61114 14.4746 4 11 4C7.13401 4 4 7.13401 4 11C4 11.237 4.01183 11.4713 4.03487 11.7018C2.30252 12.3582 1 14.0253 1 16C1 18.2091 2.79086 20 5 20H17H17.5Z"></path><path d="M12 12V21M12 12L9 15M12 12L15 15"></path></svg>',
                name: 'Синхронизация (Firebase)'
            });

            // --- Статус авторизации ---
            var authStatus = isAuthConfigured() ? 'настроена' : 'НЕ НАСТРОЕНА';
            Lampa.SettingsApi.addParam({
                component: 'firebase_unified_menu',
                param: { type: 'button' },
                field: { name: 'Авторизация Firebase (' + authStatus + ')' },
                onChange: function() { openAuthSettings(); }
            });

            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: 'Отправить всё в облако (полная синхронизация)' }, onChange: function() { confirmAction(function() { UnifiedSync.goPush(true); }); } });
            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: 'Получить всё из облака (полная синхронизация)' }, onChange: function() { confirmAction(function() { UnifiedSync.goPull(true); }); } });

            Lampa.SettingsApi.addParam({
                component: 'firebase_unified_menu',
                param: { type: 'button' },
                field: { name: 'Работа со ссылками' },
                onChange: function() {
                    Lampa.Select.show({
                        title: 'Работа со ссылкой',
                        items: [
                            { title: 'Передать ссылку', id: 'send' },
                            { title: 'Воспроизвести ссылку', id: 'play' }
                        ],
                        onSelect: function(a) {
                            if (a.id == 'send') CustomLinkSync.sendUrl('settings_component');
                            else CustomLinkSync.playUrl('settings_component');
                        },
                        onBack: function() { Lampa.Controller.toggle('settings_component'); }
                    });
                }
            });

            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: 'Настройки отдельных плагинов' }, onChange: function() { PluginSettingsSync.openMenu(); } });
            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: 'Плагины <span id="fb_status_plugins" style="float:right; color:#a9a9a9; font-size: 0.9em;">' + (Lampa.Storage.get('fb_plugins_last_time', '') || 'Никогда') + '</span>' }, onChange: function() { openSubMenu('plugins', 'Плагины'); } });
            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: 'Избранное / История <span id="fb_status_sync" style="float:right; color:#a9a9a9; font-size: 0.9em;">' + (Lampa.Storage.get('fb_sync_last_time', '') || 'Никогда') + '</span>' }, onChange: function() { openSubMenu('sync', 'Избранное и история'); } });
            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: 'Таймкоды <span id="fb_status_tc" style="float:right; color:#a9a9a9; font-size: 0.9em;">' + (Lampa.Storage.get('fb_tc_last_time', '') || 'Никогда') + '</span>' }, onChange: function() { openSubMenu('tc', 'Таймкоды'); } });
            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: 'Полный бэкап (все настройки)' }, onChange: function() { openBackupMenu(); } });

            Lampa.Listener.follow('settings', function(e) {
                if (e.name == 'firebase_unified_menu') {
                    updateMenuStatus('fb_status_plugins', Lampa.Storage.get('fb_plugins_last_time', '') || 'Никогда');
                    updateMenuStatus('fb_status_sync', Lampa.Storage.get('fb_sync_last_time', '') || 'Никогда');
                    updateMenuStatus('fb_status_tc', Lampa.Storage.get('fb_tc_last_time', '') || 'Никогда');
                }
            });

            Lampa.Storage.listener.follow('change', function(e) {
                if (!window.lampac_firebase_initial_pull_done || window.lampac_firebase_reloading || DataSync.isSyncingNow) return;
                if (sync_keys.indexOf(e.name) !== -1) {
                    clearTimeout(DataSync.pushTimers[e.name]);
                    DataSync.pushTimers[e.name] = setTimeout(function() { DataSync.pushSingle(e.name); }, 1500);
                }
            });

            var allTc = TimecodesSync.getAll();
            for (var hash in allTc) {
                if (allTc[hash] && allTc[hash].percent !== undefined) {
                    TimecodesSync.memoryCache[hash] = JSON.stringify({ d: allTc[hash].duration, t: allTc[hash].time, p: allTc[hash].percent });
                }
            }
            sync_keys.forEach(function(key) {
                var data = Lampa.Storage.get(key);
                if (data) DataSync.memoryCache[key] = JSON.stringify(data);
            });

            setInterval(TimecodesSync.autoPush, 60000);

            // ЗАПУСК СИНХРОНИЗАЦИИ ПРИ СТАРТЕ
            initialUnifiedPull();

        } catch(e) { console.log('Firebase Sync Plugin Init Error: ', e); }
    }

    var checkTimer = setInterval(function() {
        if (window.Lampa && window.Lampa.SettingsApi && window.Lampa.Storage && typeof window.Lampa.Platform !== 'undefined') {
            if ($('.head__actions').length && !$('.head__action.open--exit_custom').length) addTopMenuExitBtn();
            if (!window.lampac_firebase_unified_plugin) initPlugin();
            if (window.lampac_firebase_unified_plugin && $('.head__action.open--exit_custom').length) clearInterval(checkTimer);
        }
    }, 500);

})();
