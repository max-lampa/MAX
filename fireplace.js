// @name         Камин
// @version      1.0.0
// @description  Заставка
// @author       проєкт MaxTV | LampaUa.

(function () {
    'use strict';

    // === НАЛАШТУВАННЯ ВІДЕО ===
    var videoUrl = 'https://archive.org/download/TheBestFireplaceVideo3HoursHD/The%20Best%20Fireplace%20Video%20%283%20hours%29%20HD.mp4';
    
    var timer;
    var screensaverDiv = null;

    // --- ЛОГІКА ЗАСТАВКИ ---
    function showFireplace() {
        if (screensaverDiv) return;
        if (window.Lampa && Lampa.Activity && Lampa.Activity.active() && Lampa.Activity.active().component === 'player') return;

        // Гнучка перевірка налаштувань (обробляє і рядок, і булеве значення)
        var soundSetting = Lampa.Storage.get('fireplace_sound');
        var isSoundEnabled = (soundSetting !== 'false' && soundSetting !== false);
        var volumeLevel = parseInt(Lampa.Storage.get('fireplace_volume', '70')) / 100;

        screensaverDiv = document.createElement('div');
        screensaverDiv.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:9999999;';

        var video = document.createElement('video');
        video.src = videoUrl;
        video.loop = true;
        video.style = 'width:100%;height:100%;object-fit:cover;';
        video.volume = volumeLevel;

        var hint = document.createElement('div');
        hint.style = 'position:absolute;bottom:30px;right:30px;color:#fff;font-family:sans-serif;font-size:18px;opacity:0;transition:opacity 0.5s;';
        hint.innerText = 'Натисніть ОК для звуку';

        screensaverDiv.appendChild(video);
        screensaverDiv.appendChild(hint);
        document.body.appendChild(screensaverDiv);

        // Якщо користувач вимкнув звук у налаштуваннях - одразу глушимо
        if (!isSoundEnabled) {
            video.muted = true;
        }

        var playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(function () {
                // Спрацьовує, якщо система заблокувала автозапуск зі звуком
                video.muted = true;
                video.play();
                // Показуємо підказку "Натисніть ОК", тільки якщо звук реально увімкнений у налаштуваннях
                if (isSoundEnabled) {
                    hint.style.opacity = '0.6';
                }
            });
        }
    }

    function hideFireplace() {
        if (screensaverDiv) {
            screensaverDiv.remove();
            screensaverDiv = null;
        }
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(timer);
        var timeoutMinutes = parseInt(Lampa.Storage.get('fireplace_timeout', '5'));
        timer = setTimeout(showFireplace, timeoutMinutes * 60 * 1000);
    }

    // --- РЕЄСТРАЦІЯ В МЕНЮ НАЛАШТУВАНЬ LAMPA ---
    function addSettings() {
        if (window.Lampa && Lampa.SettingsApi) {
            Lampa.SettingsApi.addComponent({
                component: 'fireplace_settings',
                name: 'Камін',
                icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
            });

            Lampa.SettingsApi.addParam({
                component: 'fireplace_settings',
                param: {
                    name: 'fireplace_timeout',
                    type: 'select',
                    values: { '1': '1 хвилина', '2': '2 хвилини', '3': '3 хвилини', '5': '5 хвилин', '10': '10 хвилин', '15': '15 хвилин' },
                    default: '5'
                },
                field: { name: 'Час активації', description: 'Час бездіяльності до увімкнення каміна' },
                onChange: function() { resetTimer(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'fireplace_settings',
                param: {
                    name: 'fireplace_sound',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { name: 'Звук потріскування', description: 'Увімкнути чи вимкнути звук вогню' }
            });

            Lampa.SettingsApi.addParam({
                component: 'fireplace_settings',
                param: {
                    name: 'fireplace_volume',
                    type: 'select',
                    values: { '10': '10%', '30': '30%', '50': '50%', '70': '70%', '90': '90%', '100': '100%' },
                    default: '70'
                },
                field: { name: 'Гучність', description: 'Рівень гучності потріскування' }
            });
        }
    }

    // --- ОБРОБКА ПОДІЙ ---
    var events = ['keydown', 'mousemove', 'click', 'touchstart', 'wheel'];
    events.forEach(function (e) {
        window.addEventListener(e, function(ev) {
            if (screensaverDiv) {
                var v = screensaverDiv.querySelector('video');
                var sSetting = Lampa.Storage.get('fireplace_sound');
                var sEnabled = (sSetting !== 'false' && sSetting !== false);

                // Якщо звук у налаштуваннях УВІМКНЕНО, але відео зараз без звуку (через блокування) -> вмикаємо по кліку
                if (v && v.muted && sEnabled && (ev.type === 'keydown' || ev.type === 'click')) {
                    v.muted = false;
                    var h = screensaverDiv.querySelector('div');
                    if (h) h.remove();
                    ev.preventDefault();
                    return;
                }
                hideFireplace();
            } else {
                resetTimer();
            }
        });
    });

    // --- ЗАПУСК ---
    if (window.appready) {
        addSettings();
        resetTimer();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                addSettings();
                resetTimer();
            }
        });
    }

})();