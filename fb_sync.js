(function() {
    'use strict';

    window.lampac_firebase_reloading = false;
    window.lampac_firebase_initial_pull_done = false;

    // === НАЛАШТУВАННЯ АВТОРИЗАЦІЇ FIREBASE ===
    var FB_AUTH = {
        apiKey: '', 
        email: '',                
        password: '',               
        dbUrl: ''
    };

    var sync_keys = [
        'favorite', 'online_view', 'online_last_balanser', 
        'online_watched_last', 'torrents_view', 'torrents_filter_data'
    ];

    // === СИСТЕМА АВТОРИЗАЦІЇ ТА ЗАПИТІВ ===
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
        if (fb_idToken && Date.now() < fb_tokenExpire) {
            return callback(fb_idToken);
        }
        
        fb_auth_queue.push({ onSuccess: callback, onError: errorCallback });
        if (fb_auth_pending) return;
        
        fb_auth_pending = true;
        
        $.ajax({
            url: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + FB_AUTH.apiKey,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email: FB_AUTH.email, password: FB_AUTH.password, returnSecureToken: true }),
            timeout: 15000,
            success: function(res) {
                if (res && res.idToken) {
                    fb_idToken = res.idToken;
                    fb_tokenExpire = Date.now() + (res.expiresIn * 1000) - 60000;
                    fb_auth_pending = false;
                    while (fb_auth_queue.length > 0) { fb_auth_queue.shift().onSuccess(fb_idToken); }
                }
            },
            error: function() {
                fb_auth_pending = false;
                while (fb_auth_queue.length > 0) { 
                    var q = fb_auth_queue.shift();
                    if (q.onError) q.onError();
                }
                Lampa.Noty.show('Помилка авторизації Firebase');
            }
        });
    }

    function fbRequest(method, path, dataObj, onSuccess, onError) {
        getAuthToken(function(token) {
            var cacheBuster = method === 'GET' ? '&_t=' + Date.now() : '';
            var reqOpts = {
                url: FB_AUTH.dbUrl + path + '.json?auth=' + token + cacheBuster,
                type: method,
                contentType: 'application/json; charset=utf-8', 
                timeout: 30000, 
                success: onSuccess,
                error: function(err) {
                    console.log("Firebase Request Error:", err);
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
            Lampa.Noty.show('Файл успішно збережено');
        } catch (e) { Lampa.Noty.show('Помилка експорту на цьому пристрої'); }
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
                    catch (err) { Lampa.Noty.show('Помилка формату файлу!'); }
                };
                reader.readAsText(file);
            };
            input.click();
        } catch(e) { Lampa.Noty.show('Пристрій не підтримує завантаження файлів'); }
    }

    function updateMenuStatus(id, text) {
        if ($('#' + id).length) $('#' + id).text(text);
    }

    function confirmAction(callback) {
        setTimeout(function() {
            Lampa.Select.show({
                title: Lampa.Lang.translate('sure') || 'Ви впевнені?', nomark: true,
                items:[ { title: 'Так', action: true, selected: true }, { title: 'Скасувати' } ],
                onSelect: function(a) { 
                    if (a.action) callback();
                    setTimeout(function() { Lampa.Controller.toggle('settings_component'); }, 10);
                },
                onBack: function() { Lampa.Controller.toggle('settings_component'); }
            });
        }, 50);
    }

    // ==========================================
    // 1. ПЛАГІНИ, ІСТОРІЯ, ТАЙМКОДИ 
    // ==========================================
    var PluginsSync = {
        goPush: function(manual) {
            if (manual) Lampa.Noty.show('Відправка плагінів...');
            try {
                var pluginsData = localStorage.getItem('plugins');
                if (!pluginsData || typeof pluginsData !== 'string' || pluginsData.trim() === '') pluginsData = '[]';
                var now = Date.now();
                Lampa.Storage.set('fb_plugins_ts', now, true);

                fbRequest('PUT', 'plugins_sync', { data: pluginsData, _timestamp: now }, 
                    function() {
                        if (manual) Lampa.Noty.show('Плагіни збережено у хмару');
                        var text = new Date().toLocaleString('uk-UA') + ' (Відправка)';
                        Lampa.Storage.set('fb_plugins_last_time', text); updateMenuStatus('fb_status_plugins', text);
                    }, function() { if (manual) Lampa.Noty.show('Помилка відправки плагінів'); }
                );
            } catch (e) { if (manual) Lampa.Noty.show('Script Error під час відправки плагінів'); }
        },
        goPull: function(manual) { 
            if (manual) Lampa.Noty.show('Отримання плагінів...');
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
                            var text = new Date().toLocaleString('uk-UA') + ' (Отримання)';
                            Lampa.Storage.set('fb_plugins_last_time', text); updateMenuStatus('fb_status_plugins', text);
                            reloadApp(manual ? 'Плагіни відновлено' : '🔄 Синхронізація плагінів');
                        } else if (manual) Lampa.Noty.show('У вас найновіші плагіни');
                    } else if (manual) Lampa.Noty.show('Хмара порожня');
                } catch(e) { Lampa.Noty.show('Помилка обробки плагінів'); }
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
                Lampa.Storage.set('fb_plugins_ts', Date.now(), true); reloadApp('Файл плагінів завантажено');
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
                var text = new Date().toLocaleString('uk-UA') + ' (Авто)';
                Lampa.Storage.set('fb_sync_last_time', text); updateMenuStatus('fb_status_sync', text);
            });
        },
        goPush: function(manual) {
            if (manual) Lampa.Noty.show('Відправка історії та обраного...');
            var toPush = this.getPushData(true);
            if (!toPush) { if (manual) Lampa.Noty.show('Немає даних для відправки'); return; }
            
            fbRequest('PATCH', 'global_sync', toPush, function() {
                if (manual) Lampa.Noty.show('Дані відправлено');
                var text = new Date().toLocaleString('uk-UA') + ' (Відправка)';
                Lampa.Storage.set('fb_sync_last_time', text); updateMenuStatus('fb_status_sync', text);
            }, function() { if (manual) Lampa.Noty.show('Помилка відправки'); });
        },
        goPull: function(manual) { 
            if (manual) Lampa.Noty.show('Отримання даних...');
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
                        var text = new Date().toLocaleString('uk-UA') + ' (Отримання)'; 
                        Lampa.Storage.set('fb_sync_last_time', text, true); 
                        updateMenuStatus('fb_status_sync', text);
                        reloadApp(manual ? 'Дані завантажено' : '🔄 Синхронізація даних');
                    } else if (manual) Lampa.Noty.show('У вас найсвіжіші дані');
                    
                    setTimeout(function() { DataSync.isSyncingNow = false; }, 500);
                } else if (manual) Lampa.Noty.show('Хмара порожня');
            });
        },
        fileExport: function() { var d = {}; sync_keys.forEach(function(k) { d[k] = Lampa.Storage.get(k); }); downloadLocalFile(d, 'lampa_history.json'); },
        fileImport: function() { uploadLocalFile(function(data) {
            var now = Date.now(), localTs = DataSync.getLocalTs();
            for (var k in data) { if (sync_keys.indexOf(k) !== -1) { Lampa.Storage.set(k, data[k], false); localTs[k] = now; } }
            Lampa.Storage.set('fb_sync_timestamps', localTs, true);
            reloadApp('Файл Історії/Обраного застосовано');
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
                    var text = new Date().toLocaleString('uk-UA') + ' (Авто)'; 
                    Lampa.Storage.set('fb_tc_last_time', text); updateMenuStatus('fb_status_tc', text);
                });
            }
        },
        goPush: function(manual) {
            if (manual) Lampa.Noty.show('Відправка таймкодів...');
            var toPush = this.getPushData(true);
            if (!toPush) { if (manual) Lampa.Noty.show('Немає таймкодів'); return; }
            
            fbRequest('PATCH', 'global_timecodes', toPush, function() {
                if (manual) Lampa.Noty.show('Таймкоди відправлено');
                var text = new Date().toLocaleString('uk-UA') + ' (Відправка)'; 
                Lampa.Storage.set('fb_tc_last_time', text); updateMenuStatus('fb_status_tc', text);
            }, function() { if (manual) Lampa.Noty.show('Помилка відправки таймкодів'); });
        },
        goPull: function(manual) { 
            if (manual) Lampa.Noty.show('Отримання таймкодів...');
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
                        var text = new Date().toLocaleString('uk-UA') + ' (Отримання)'; 
                        Lampa.Storage.set('fb_tc_last_time', text, true); updateMenuStatus('fb_status_tc', text);
                        reloadApp(manual ? 'Таймкоди завантажено' : '🔄 Синхронізація Таймкодів');
                    } else if (manual) Lampa.Noty.show('Таймкоди актуальні');
                } else if (manual) Lampa.Noty.show('Хмара порожня');
            });
        },
        fileExport: function() { downloadLocalFile(this.getAll(), 'lampa_timecodes.json'); },
        fileImport: function() { uploadLocalFile(function(data) {
            var local = TimecodesSync.getAll(), now = Date.now();
            for (var hash in data) { if (data[hash] && data[hash].percent !== undefined) { data[hash]._timestamp = now; local[hash] = data[hash]; } }
            TimecodesSync.saveAll(local); reloadApp('Файл таймкодів імпортовано');
        }); }
    };

    // ==========================================
    // ПРОФІЛІ ПОВНОГО БЕКАПУ
    // ==========================================
    function getBackupPath(profileId) {
        if (profileId === 'tv') return 'global_backup_tv';
        if (profileId === 'phone') return 'global_backup_phone';
        return 'global_backup'; 
    }

    var FullBackup = {
        goPush: function(manual, profileId) {
            if (manual) Lampa.Noty.show('Підготовка повного бекапу (' + profileId + ')...');
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
                if (manual) Lampa.Noty.show('Помилка доступу до сховища');
                return;
            }

            var totalChunks = chunks.length;
            if (totalChunks === 0) {
                if (manual) Lampa.Noty.show('Сховище порожнє, немає що зберігати');
                return;
            }

            var currentChunk = 0;

            function sendNextChunk() {
                if (currentChunk >= totalChunks) {
                    fbRequest('PUT', basePath + '/meta', { total: totalChunks, _timestamp: Date.now() }, function() {
                        if (manual) Lampa.Noty.show('Бекап створено у хмарі (' + totalChunks + ' частин)');
                    });
                    return;
                }
                if (manual) Lampa.Noty.show('Відправка бекапу... (' + (currentChunk + 1) + '/' + totalChunks + ')');
                
                fbRequest('PUT', basePath + '/chunks/' + currentChunk, { data: JSON.stringify(chunks[currentChunk]) }, function() {
                    currentChunk++;
                    setTimeout(sendNextChunk, 100);
                }, function() {
                    if (manual) Lampa.Noty.show('Помилка відправки частини ' + (currentChunk + 1));
                });
            }

            if (manual) Lampa.Noty.show('Очищення старого бекапу...');
            fbRequest('DELETE', basePath, null, function() { sendNextChunk(); }, function() { sendNextChunk(); });
        },
        goPull: function(manual, profileId) {
            if (manual) Lampa.Noty.show('Пошук бекапу в хмарі (' + profileId + ')...');
            var basePath = getBackupPath(profileId);

            fbRequest('GET', basePath + '/meta', null, function(meta) {
                if (meta && meta.total) {
                    var totalChunks = meta.total;
                    var currentChunk = 0;
                    var keysCount = 0;

                    function getNextChunk() {
                        if (currentChunk >= totalChunks) {
                            reloadApp('Бекап відновлено (' + keysCount + ' ключів)');
                            return;
                        }
                        if (manual) Lampa.Noty.show('Отримання бекапу... (' + (currentChunk + 1) + '/' + totalChunks + ')');
                        
                        fbRequest('GET', basePath + '/chunks/' + currentChunk, null, function(chunkRes) {
                            if (chunkRes && chunkRes.data) {
                                try {
                                    var data = typeof chunkRes.data === 'string' ? JSON.parse(chunkRes.data) : chunkRes.data;
                                    for (var i in data) { try { localStorage.setItem(i, data[i]); keysCount++; } catch (err) {} }
                                    currentChunk++;
                                    setTimeout(getNextChunk, 100);
                                } catch (e) {
                                    if (manual) Lampa.Noty.show('Помилка обробки частини ' + (currentChunk + 1));
                                }
                            } else {
                                if (manual) Lampa.Noty.show('Помилка: частина ' + (currentChunk + 1) + ' порожня');
                            }
                        }, function() {
                            if (manual) Lampa.Noty.show('Помилка мережі при завантаженні частини ' + (currentChunk + 1));
                        });
                    }
                    getNextChunk();
                } else {
                    if (manual) Lampa.Noty.show('Завантаження старого формату бекапу...');
                    fbRequest('GET', basePath, null, function(json) {
                        if (json && json.data) {
                            try {
                                var data = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
                                var keysCount = 0;
                                for (var i in data) { try { localStorage.setItem(i, data[i]); keysCount++; } catch (err) {} }
                                reloadApp('Бекап відновлено (' + keysCount + ' ключів)');
                            } catch (e) { Lampa.Noty.show('Помилка парсингу бекапу'); }
                        } else if (manual) Lampa.Noty.show(Lampa.Lang.translate('nodata') || 'Дані відсутні');
                    });
                }
            }, function() {
                if (manual) Lampa.Noty.show('Помилка доступу до хмари');
            });
        },
        fileExport: function() { try { var b = {}; for (var i = 0; i < localStorage.length; i++) { try { var k = localStorage.key(i); b[k] = localStorage.getItem(k); } catch (e) {} } downloadLocalFile(b, 'lampa_full_backup.json'); } catch(e) {} },
        fileImport: function() { uploadLocalFile(function(data) { var c = 0; for (var i in data) { try { localStorage.setItem(i, data[i]); c++; } catch (err) {} } reloadApp('Локальний бекап відновлено (' + c + ' ключів)'); }); }
    };

    function openBackupMenu() {
        Lampa.Select.show({
            title: 'Повний Бекап (Профілі)',
            items: [
                { title: '⬆️ Відправити в хмару', id: 'push' },
                { title: '⬇️ Отримати з хмари', id: 'pull' },
                { title: '💾 Зберегти у файл', id: 'exp' },
                { title: '📂 Завантажити з файлу', id: 'imp' }
            ],
            onSelect: function(a) {
                if (a.id == 'exp') { FullBackup.fileExport(); Lampa.Controller.toggle('settings_component'); }
                else if (a.id == 'imp') { confirmAction(function() { FullBackup.fileImport(); }); }
                else {
                    setTimeout(function() {
                        Lampa.Select.show({
                            title: a.id == 'push' ? 'Відправити бекап: Оберіть профіль' : 'Отримати бекап: Оберіть профіль',
                            items: [
                                { title: '💻 Профіль: ПК (Основний)', id: 'pc' },
                                { title: '📺 Профіль: ТВ', id: 'tv' },
                                { title: '📱 Профіль: Телефон', id: 'phone' }
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
    // 1.5 ПОЛНА СИНХРОНІЗАЦІЯ (УСЕ РАЗОМ)
    // ==========================================
    var UnifiedSync = {
        goPush: function(manual) {
            if (manual) Lampa.Noty.show('Відправка всіх даних...');
            var totalRequests = 3, completedRequests = 0, errors = 0;

            function checkDone() {
                completedRequests++;
                if (completedRequests >= totalRequests) {
                    if (errors === 0 && manual) Lampa.Noty.show('Усі дані успішно відправлено в хмару');
                    else if (manual) Lampa.Noty.show('Деякі дані не вдалося відправити');
                }
            }

            var now = Date.now(), pluginsData = localStorage.getItem('plugins');
            if (!pluginsData || typeof pluginsData !== 'string' || pluginsData.trim() === '') pluginsData = '[]';
            
            Lampa.Storage.set('fb_plugins_ts', now, true);
            fbRequest('PUT', 'plugins_sync', { data: pluginsData, _timestamp: now }, function() {
                var text = new Date().toLocaleString('uk-UA') + ' (Відправка)';
                Lampa.Storage.set('fb_plugins_last_time', text); updateMenuStatus('fb_status_plugins', text);
                checkDone();
            }, function() { errors++; checkDone(); });

            var syncData = DataSync.getPushData(true);
            if (syncData) {
                fbRequest('PATCH', 'global_sync', syncData, function() {
                    var text = new Date().toLocaleString('uk-UA') + ' (Відправка)';
                    Lampa.Storage.set('fb_sync_last_time', text); updateMenuStatus('fb_status_sync', text);
                    checkDone();
                }, function() { errors++; checkDone(); });
            } else { checkDone(); }

            var tcData = TimecodesSync.getPushData(true);
            if (tcData) {
                fbRequest('PATCH', 'global_timecodes', tcData, function() {
                    var text = new Date().toLocaleString('uk-UA') + ' (Відправка)';
                    Lampa.Storage.set('fb_tc_last_time', text); updateMenuStatus('fb_status_tc', text);
                    checkDone();
                }, function() { errors++; checkDone(); });
            } else { checkDone(); }
        },
        goPull: function(manual) {
            if (manual) Lampa.Noty.show('Завантаження всіх даних...');
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
                            var textPlugins = new Date().toLocaleString('uk-UA') + ' (Отримання)';
                            Lampa.Storage.set('fb_plugins_last_time', textPlugins, true); 
                            updateMenuStatus('fb_status_plugins', textPlugins);
                        }
                        if (pendingUpdates.sync) {
                            for (var key in pendingUpdates.sync.data) {
                                Lampa.Storage.set(key, pendingUpdates.sync.data[key], false);
                            }
                            Lampa.Storage.set('fb_sync_timestamps', pendingUpdates.sync.ts, true);
                            var textSync = new Date().toLocaleString('uk-UA') + ' (Отримання)'; 
                            Lampa.Storage.set('fb_sync_last_time', textSync, true); 
                            updateMenuStatus('fb_status_sync', textSync);
                        }
                        if (pendingUpdates.tc) {
                            Lampa.Storage.set(TimecodesSync.getStorageKey(), pendingUpdates.tc, true);
                            var textTc = new Date().toLocaleString('uk-UA') + ' (Отримання)'; 
                            Lampa.Storage.set('fb_tc_last_time', textTc, true); 
                            updateMenuStatus('fb_status_tc', textTc);
                        }
                        
                        try { if (typeof Lampa.Storage.save === 'function') Lampa.Storage.save(); } catch(e) {}

                        Lampa.Noty.show((manual ? 'Усі дані відновлено з хмари' : '🔄 Синхронізація даних') + ' (3 сек)');
                        setTimeout(function() { window.location.reload(); }, 3000);
                    } else if (manual) Lampa.Noty.show('У вас вже найсвіжіші дані');
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
    // 2. СИСТЕМА КАСТОМНИХ ПОСИЛАНЬ
    // ==========================================
    var CustomLinkSync = {
        sendUrl: function(returnCtrl) {
            var rc = returnCtrl || 'settings_component';
            setTimeout(function() {
                Lampa.Input.edit({ title: 'Введіть URL для передачі', value: '', free: true, nosave: true }, function (new_val) {
                    if (new_val) {
                        Lampa.Noty.show('Відправка посилання...');
                        fbRequest('PUT', 'global_custom_link', { url: new_val, _timestamp: Date.now() }, function() {
                            Lampa.Noty.show('Посилання збережено у хмару');
                        }, function() { Lampa.Noty.show('Помилка збереження посилання'); });
                    }
                    setTimeout(function() { Lampa.Controller.toggle(rc); }, 10);
                });
            }, 300);
        },
        playUrl: function(returnCtrl) {
            var rc = returnCtrl || 'settings_component';
            Lampa.Noty.show('Завантаження посилання з хмари...');
            fbRequest('GET', 'global_custom_link', null, function(data) {
                if (data && data.url) {
                    var video = { title: 'Трансляція з хмари', url: data.url };
                    Lampa.Player.play(video); Lampa.Player.playlist([video]);
                } else { 
                    Lampa.Noty.show('Посилання не знайдено в хмарі'); 
                    setTimeout(function() { Lampa.Controller.toggle(rc); }, 10);
                }
            }, function() { 
                Lampa.Noty.show('Помилка завантаження посилання'); 
                setTimeout(function() { Lampa.Controller.toggle(rc); }, 10);
            });
        }
    };

    // ==========================================
    // 3. ЄДИНЕ ОНОВЛЕННЯ ПРИ ЗАПУСКУ
    // ==========================================
    function initialUnifiedPull() {
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

                    Lampa.Noty.show('🔄 Синхронізація: завантажено нові дані з хмари (3 сек)');
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
    // 4. КНОПКА ВИХОДУ ТА СИНХРОНІЗАЦІЇ
    // ==========================================
    function appExit() {
        if (Lampa.Platform.is('apple_tv')) window.location.assign('exit://exit');
        if (Lampa.Platform.is("tizen")) tizen.application.getCurrentApplication().exit();
        if (Lampa.Platform.is("webos")) window.close();
        if (Lampa.Platform.is("android")) Lampa.Android.exit();
        if (Lampa.Platform.is("orsay")) Lampa.Orsay.exit();
        if (Lampa.Platform.is("nw")) nw.Window.get().close();
        window.close();
    }

    function syncAndExit() {
        Lampa.Noty.show('Синхронізація перед виходом...');
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

        var ico = '<svg version="1.1" viewBox="0 0 512 512" style="width: 2.2em; height: 2.2em;" xml:space="preserve"><path fill="currentColor" d="M256,5.1c138.6,0,250.9,112.3,250.9,250.9S394.6,506.9,256,506.9S5.1,394.6,5.1,256S117.4,5.1,256,5.1z M256,40.1C136.7,40.1,40.1,136.7,40.1,256S136.7,471.9,256,471.9S471.9,375.3,471.9,256S375.3,40.1,256,40.1z M311.4,176.6 c6.7-6.7,17.5-6.7,24.2,0c6.7,6.7,6.7,17.5,0,24.2l-55.1,55.1l55.1,55c6.7,6.7,6.7,17.5,0,24.2c-6.7,6.7-17.5,6.7-24.2,0L256.3,280 l-55.1,55.1c-6,6-15.4,6.6-22.1,1.8l-2.2-1.8c-6.7-6.7-6.7-17.5,0-24.2l55.1-55l-55.1-55c-6.7-6.7-6.7-17.5,0-24.2s17.5-6.7,24.2,0 l55.1,55.1L311.4,176.6z"/></svg>';
        var exit_btn = $('<div class="head__action selector open--exit_custom" title="Вихід / Хмара">' + ico + '</div>');
        
        exit_btn.on("hover:enter click", function () {
            Lampa.Select.show({
                title: 'Вихід / Хмара',
                items:[
                    { title: '🚪 Вийти з Lampa', id: 'exit' },
                    { title: '🔄 Синхронізація та вихід', id: 'sync_exit' },
                    { title: '📤 Відправити посилання', id: 'send_cloud' },
                    { title: '▶️ Відтворити з хмари', id: 'play_cloud' }
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
    // 6. СИНХРОНІЗАЦІЯ НАЛАШТУВАНЬ ПЛАГІНУ (Парсинг коду)
    // ==========================================
    var PluginSettingsSync = {
        openMenu: function() {
            var pData = localStorage.getItem('plugins'), plugins = [];
            try { if (pData) plugins = JSON.parse(pData); } catch(e) {}
            if (!plugins || plugins.length === 0) { Lampa.Noty.show('Немає встановлених плагінів'); return; }

            var items = plugins.map(function(p, index) {
                var name = p.name || p.url || 'Плагін ' + (index + 1);
                return { title: '🧩 ' + name, plugin: p, name: name };
            });

            Lampa.Select.show({
                title: 'Синхр. налаштувань плагіна',
                items: items,
                onSelect: function(a) { PluginSettingsSync.processPlugin(a.plugin, a.name); },
                onBack: function() { Lampa.Controller.toggle('settings_component'); }
            });
        },
        
        processPlugin: function(plugin, pName) {
            Lampa.Noty.show('Аналіз коду плагіну...');
            
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
                    title: 'Налаштування: ' + pName,
                    items: [ { title: '⬆️ Відправити знайдене в хмару', id: 'push' }, { title: '⬇️ Завантажити з хмари', id: 'pull' } ],
                    onSelect: function(action) {
                        setTimeout(function() {
                            Lampa.Input.edit({
                                title: 'Знайдені ключі (через кому):',
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

            if (count === 0) { Lampa.Noty.show('Не знайдено жодних даних для цих ключів'); return; }

            Lampa.Noty.show('Відправка налаштувань (' + count + ' записів)...');
            fbRequest('PUT', 'plugin_settings_' + safeId, { data: JSON.stringify(data), _timestamp: Date.now() }, function() {
                Lampa.Noty.show('Налаштування плагіну збережено у хмару!');
            });
        },

        pullSettings: function(safeId, keysString) {
            Lampa.Noty.show('Пошук налаштувань в хмарі...');
            fbRequest('GET', 'plugin_settings_' + safeId, null, function(res) {
                if (res && res.data) {
                    try {
                        var data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                        var count = 0;
                        for (var k in data) { localStorage.setItem(k, data[k]); count++; }
                        reloadApp('Налаштування плагіну завантажено (' + count + ' записів)');
                    } catch(e) { Lampa.Noty.show('Помилка формату'); }
                } else { Lampa.Noty.show('В хмарі немає збережених налаштувань для цього плагіну'); }
            });
        }
    };


    // ==========================================
    // ІНІЦІАЛІЗАЦІЯ ІНТЕРФЕЙСУ
    // ==========================================
    var ModulesObj = { 'plugins': PluginsSync, 'sync': DataSync, 'tc': TimecodesSync };

    function openSubMenu(moduleKey, titleText) {
        Lampa.Select.show({
            title: titleText,
            items:[
                { title: '⬆️ Відправити в хмару', id: 'push' }, { title: '⬇️ Отримати з хмари', id: 'pull' },
                { title: '💾 Зберегти у файл', id: 'exp' }, { title: '📂 Завантажити з файлу', id: 'imp' }
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
                name: 'Синхронізація (Firebase)'
            });

            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: '📤 Відправити все в хмару (Повна синхронізація)' }, onChange: function() { confirmAction(function() { UnifiedSync.goPush(true); }); } });
            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: '📥 Отримати все з хмари (Повна синхронізація)' }, onChange: function() { confirmAction(function() { UnifiedSync.goPull(true); }); } });
            
            Lampa.SettingsApi.addParam({
                component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: '🔗 Робота з посиланнями' },
                onChange: function() { 
                    Lampa.Select.show({
                        title: 'Робота з посиланням', items:[ { title: '📤 Передати посилання', id: 'send' }, { title: '▶️ Відтворити посилання', id: 'play' } ],
                        onSelect: function(a) { 
                            if (a.id == 'send') CustomLinkSync.sendUrl('settings_component'); 
                            else CustomLinkSync.playUrl('settings_component'); 
                        },
                        onBack: function() { Lampa.Controller.toggle('settings_component'); }
                    });
                }
            });

            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: '🔌 Налаштування конкретних плагінів' }, onChange: function() { PluginSettingsSync.openMenu(); } });

            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: '🧩 Плагіни <span id="fb_status_plugins" style="float:right; color:#a9a9a9; font-size: 0.9em;">' + Lampa.Storage.get('fb_plugins_last_time', 'Ніколи') + '</span>' }, onChange: function() { openSubMenu('plugins', 'Плагіни'); } });
            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: '⭐ Обране / Історія <span id="fb_status_sync" style="float:right; color:#a9a9a9; font-size: 0.9em;">' + Lampa.Storage.get('fb_sync_last_time', 'Ніколи') + '</span>' }, onChange: function() { openSubMenu('sync', 'Обране та Історія'); } });
            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: '⏱ Таймкоди <span id="fb_status_tc" style="float:right; color:#a9a9a9; font-size: 0.9em;">' + Lampa.Storage.get('fb_tc_last_time', 'Ніколи') + '</span>' }, onChange: function() { openSubMenu('tc', 'Таймкоди'); } });
            Lampa.SettingsApi.addParam({ component: 'firebase_unified_menu', param: { type: 'button' }, field: { name: '📦 Повний Бекап (Усі налаштування)' }, onChange: function() { openBackupMenu(); } });

            Lampa.Listener.follow('settings', function(e) {
                if (e.name == 'firebase_unified_menu') {
                    updateMenuStatus('fb_status_plugins', Lampa.Storage.get('fb_plugins_last_time', 'Ніколи'));
                    updateMenuStatus('fb_status_sync', Lampa.Storage.get('fb_sync_last_time', 'Ніколи'));
                    updateMenuStatus('fb_status_tc', Lampa.Storage.get('fb_tc_last_time', 'Ніколи'));
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

            // ЗАПУСК ЄДИНОГО ОНОВЛЕННЯ ДАНИХ ПРИ СТАРТІ
            initialUnifiedPull();
            
        } catch(e) { console.log("Firebase Sync Plugin Init Error: ", e); }
    }

    var checkTimer = setInterval(function() {
        if (window.Lampa && window.Lampa.SettingsApi && window.Lampa.Storage && typeof window.Lampa.Platform !== "undefined") {
            if ($('.head__actions').length && !$('.head__action.open--exit_custom').length) addTopMenuExitBtn();
            if (!window.lampac_firebase_unified_plugin) initPlugin();
            if (window.lampac_firebase_unified_plugin && $('.head__action.open--exit_custom').length) clearInterval(checkTimer);
        }
    }, 500);

})();