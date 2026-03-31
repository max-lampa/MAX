// @name Камин
// @version 1.0.1
// @description Заставка
// @author проект MaxTV | LampaUa.
(function () {
    'use strict';

    // === СПИСОК ДОСТУПНЫХ ВИДЕО ===
    var videoSources = {
        'fireplace1': 'https://archive.org/download/TheBestFireplaceVideo3HoursHD/The%20Best%20Fireplace%20Video%20%283%20hours%29%20HD.mp4',
        'fireplace2': 'https://archive.org/download/FireplaceForChristmas1HourAmbientalFireplaceFULLHD/Fireplace%20for%20Christmas%20-%201%20hour%20Ambiental%20fireplace%20FULL%20HD.mp4'
    };

    var timer;
    var screensaverDiv = null;

    // Получение текущего URL видео из настроек
    function getVideoUrl() {
        var selected = Lampa.Storage.get('fireplace_source', 'fireplace1');
        return videoSources[selected] || videoSources['fireplace1'];
    }

    // --- ЛОГИКА ЗАСТАВКИ ---
    function showFireplace() {
        if (screensaverDiv) return;
        if (window.Lampa && Lampa.Activity && Lampa.Activity.active() && Lampa.Activity.active().component === 'player') return;

        // Гибкая проверка настроек (обрабатывает и строку, и булево значение)
        var soundSetting = Lampa.Storage.get('fireplace_sound');
        var isSoundEnabled = (soundSetting !== 'false' && soundSetting !== false);
        var volumeLevel = parseInt(Lampa.Storage.get('fireplace_volume', '70')) / 100;

        screensaverDiv = document.createElement('div');
        screensaverDiv.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:9999999;';

        var video = document.createElement('video');
        video.src = getVideoUrl();
        video.loop = true;
        video.style = 'width:100%;height:100%;object-fit:cover;';
        video.volume = volumeLevel;

        var hint = document.createElement('div');
        hint.style = 'position:absolute;bottom:30px;right:30px;color:#fff;font-family:sans-serif;font-size:18px;opacity:0;transition:opacity 0.5s;';
        hint.innerText = 'Нажмите ОК для звука';

        screensaverDiv.appendChild(video);
        screensaverDiv.appendChild(hint);
        document.body.appendChild(screensaverDiv);

        // Если пользователь отключил звук в настройках — сразу глушим
        if (!isSoundEnabled) {
            video.muted = true;
        }

        var playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(function () {
                // Срабатывает, если система заблокировала автозапуск со звуком
                video.muted = true;
                video.play();
                // Показываем подсказку «Нажмите ОК», только если звук реально включён в настройках
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

    // --- РЕГИСТРАЦИЯ В МЕНЮ НАСТРОЕК LAMPA ---
    function addSettings() {
        if (window.Lampa && Lampa.SettingsApi) {
            Lampa.SettingsApi.addComponent({
                component: 'fireplace_settings',
                name: 'Камин',
                icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
            });

            Lampa.SettingsApi.addParam({
                component: 'fireplace_settings',
                param: {
                    name: 'fireplace_timeout',
                    type: 'select',
                    values: {
                        '1': '1 минута',
                        '2': '2 минуты',
                        '3': '3 минуты',
                        '5': '5 минут',
                        '10': '10 минут',
                        '15': '15 минут'
                    },
                    default: '5'
                },
                field: {
                    name: 'Время активации',
                    description: 'Время бездействия до включения камина'
                },
                onChange: function() {
                    resetTimer();
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'fireplace_settings',
                param: {
                    name: 'fireplace_source',
                    type: 'select',
                    values: {
                        'fireplace1': 'Камин классический (3 часа)',
                        'fireplace2': 'Камин рождественский (1 час)'
                    },
                    default: 'fireplace1'
                },
                field: {
                    name: 'Источник видео',
                    description: 'Выберите видео с камином'
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'fireplace_settings',
                param: {
                    name: 'fireplace_sound',
                    type: 'select',
                    values: {
                        'true': 'Включено',
                        'false': 'Отключено'
                    },
                    default: 'true'
                },
                field: {
                    name: 'Звук потрескивания',
                    description: 'Включить или отключить звук огня'
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'fireplace_settings',
                param: {
                    name: 'fireplace_volume',
                    type: 'select',
                    values: {
                        '10': '10%',
                        '30': '30%',
                        '50': '50%',
                        '70': '70%',
                        '90': '90%',
                        '100': '100%'
                    },
                    default: '70'
                },
                field: {
                    name: 'Громкость',
                    description: 'Уровень громкости потрескивания'
                }
            });
        }
    }

    // --- ОБРАБОТКА СОБЫТИЙ ---
    var events = ['keydown', 'mousemove', 'click', 'touchstart', 'wheel'];
    events.forEach(function (e) {
        window.addEventListener(e, function(ev) {
            if (screensaverDiv) {
                var v = screensaverDiv.querySelector('video');
                var sSetting = Lampa.Storage.get('fireplace_sound');
                var sEnabled = (sSetting !== 'false' && sSetting !== false);

                // Если звук в настройках ВКЛЮЧЁН, но видео сейчас без звука (из-за блокировки) -> включаем по клику
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