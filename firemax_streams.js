// @name Заставка — Атмосфера
// @version 2.0.0
// @description Заставка с IPTV-потоками (природа, камин, релакс)
// @author проект MaxTV | LampaUa.
(function () {
    'use strict';

    // === СПИСОК ПОТОКОВ ===
    var streams = [
        { name: 'Камин',           url: 'http://iptv.prosto.tv:7000/ch318/video.m3u8' },
        { name: 'Огонь',           url: 'http://iptv.prosto.tv:7000/ch331/video.m3u8' },
        { name: 'Аквариум',        url: 'http://iptv.prosto.tv:7000/ch325/video.m3u8' },
        { name: 'Водопад',         url: 'http://iptv.prosto.tv:7000/ch329/video.m3u8' },
        { name: 'Лес',             url: 'http://iptv.prosto.tv:7000/ch330/video.m3u8' },
        { name: 'Река',            url: 'http://iptv.prosto.tv:7000/ch338/video.m3u8' },
        { name: 'Озеро',           url: 'http://iptv.prosto.tv:7000/ch341/video.m3u8' },
        { name: 'Горы',            url: 'http://iptv.prosto.tv:7000/ch340/video.m3u8' },
        { name: 'Пляж',            url: 'http://iptv.prosto.tv:7000/ch332/video.m3u8' },
        { name: 'Зима',            url: 'http://iptv.prosto.tv:7000/ch327/video.m3u8' },
        { name: 'Ночь',            url: 'http://iptv.prosto.tv:7000/ch349/video.m3u8' },
        { name: 'Пейзаж',          url: 'http://iptv.prosto.tv:7000/ch343/video.m3u8' },
        { name: 'Подводный мир',   url: 'http://iptv.prosto.tv:7000/ch305/video.m3u8' },
        { name: 'Тропики',         url: 'http://iptv.prosto.tv:7000/ch335/video.m3u8' },
        { name: 'Джунгли',         url: 'http://iptv.prosto.tv:7000/ch339/video.m3u8' },
        { name: 'Релакс',          url: 'http://iptv.prosto.tv:7000/ch328/video.m3u8' },
        { name: 'Природа',         url: 'https://tgn.bozztv.com/betterlife/betternature/betternature/index.m3u8' },
        { name: 'Stingray Nature', url: 'https://stream.ads.ottera.tv/cl/240211cn4j7g65sur7fq378vpg/1920x1080_5711200_3_f.m3u8' },
        { name: 'Cozy Vibes',      url: 'https://d2esizdt2xkmhp.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-qw5vkd4gzoaia/SONO60.m3u8' }
    ];

    // Значения для выпадающего списка каналов
    var streamValues = { 'random': 'Случайный' };
    streams.forEach(function(s, i) { streamValues[String(i)] = s.name; });

    var timer;
    var screensaverDiv = null;
    var currentStreamIndex = 0;
    var tryList = [];

    // === ВЫБОР ПОТОКА ===
    function buildTryList() {
        var chosen = Lampa.Storage.get('fireplace_stream', 'random');
        if (chosen === 'random') {
            // Перемешиваем, чтобы каждый раз показывался другой
            tryList = streams.slice().sort(function() { return Math.random() - 0.5; });
        } else {
            var idx = parseInt(chosen);
            // Начинаем с выбранного, затем пробуем остальные как запасные
            var rest = streams.slice();
            var main = rest.splice(idx, 1);
            tryList = main.concat(rest);
        }
        currentStreamIndex = 0;
    }

    // === ЛОГИКА ЗАСТАВКИ ===
    function showFireplace() {
        if (screensaverDiv) return;
        if (window.Lampa && Lampa.Activity && Lampa.Activity.active() && Lampa.Activity.active().component === 'player') return;

        var soundSetting = Lampa.Storage.get('fireplace_sound');
        var isSoundEnabled = (soundSetting !== 'false' && soundSetting !== false);
        var volumeLevel = parseInt(Lampa.Storage.get('fireplace_volume', '70')) / 100;

        buildTryList();
        screensaverDiv = document.createElement('div');
        screensaverDiv.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:9999999;';

        var video = document.createElement('video');
        video.style = 'width:100%;height:100%;object-fit:cover;';
        video.volume = volumeLevel;
        if (!isSoundEnabled) video.muted = true;

        // Подпись канала (снизу по центру, плавно исчезает)
        var label = document.createElement('div');
        label.style = 'position:absolute;bottom:40px;left:50%;transform:translateX(-50%);color:#fff;font-family:sans-serif;font-size:20px;text-shadow:0 1px 6px rgba(0,0,0,0.8);opacity:0;transition:opacity 0.6s;pointer-events:none;';
        screensaverDiv.appendChild(video);
        screensaverDiv.appendChild(label);

        // Подсказка «ОК для звука»
        var hint = document.createElement('div');
        hint.style = 'position:absolute;bottom:30px;right:30px;color:#fff;font-family:sans-serif;font-size:18px;opacity:0;transition:opacity 0.5s;';
        hint.innerText = 'Нажмите ОК для звука';
        screensaverDiv.appendChild(hint);

        document.body.appendChild(screensaverDiv);

        loadStream(video, label, hint, isSoundEnabled);
    }

    function loadStream(video, label, hint, isSoundEnabled) {
        if (currentStreamIndex >= tryList.length) {
            // Все потоки не доступны — скрываем заставку
            hideFireplace();
            return;
        }

        var stream = tryList[currentStreamIndex];
        video.src = stream.url;

        // Показываем название канала на 4 секунды
        label.innerText = stream.name;
        label.style.opacity = '0.75';
        setTimeout(function() { if (label) label.style.opacity = '0'; }, 4000);

        var onError = function() {
            video.removeEventListener('error', onError);
            currentStreamIndex++;
            loadStream(video, label, hint, isSoundEnabled);
        };
        video.addEventListener('error', onError);

        var playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(function() {
                video.muted = true;
                var p2 = video.play();
                if (p2 !== undefined) {
                    p2.catch(function() {
                        // Поток действительно не воспроизводится — пробуем следующий
                        video.removeEventListener('error', onError);
                        currentStreamIndex++;
                        loadStream(video, label, hint, isSoundEnabled);
                    });
                }
                if (isSoundEnabled) hint.style.opacity = '0.6';
            });
        }
    }

    function hideFireplace() {
        if (screensaverDiv) {
            var v = screensaverDiv.querySelector('video');
            if (v) { v.pause(); v.src = ''; }
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

    // === НАСТРОЙКИ ===
    function addSettings() {
        if (window.Lampa && Lampa.SettingsApi) {
            Lampa.SettingsApi.addComponent({
                component: 'fireplace_settings',
                name: 'Атмосфера',
                icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
            });

            Lampa.SettingsApi.addParam({
                component: 'fireplace_settings',
                param: {
                    name: 'fireplace_stream',
                    type: 'select',
                    values: streamValues,
                    default: 'random'
                },
                field: {
                    name: 'Канал заставки',
                    description: 'Выберите поток или оставьте "Случайный"'
                }
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
                    description: 'Время бездействия до включения заставки'
                },
                onChange: function() { resetTimer(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'fireplace_settings',
                param: {
                    name: 'fireplace_sound',
                    type: 'select',
                    values: { 'true': 'Включено', 'false': 'Отключено' },
                    default: 'true'
                },
                field: {
                    name: 'Звук',
                    description: 'Включить или отключить звук потока'
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
                    description: 'Уровень громкости'
                }
            });
        }
    }

    // === ОБРАБОТКА СОБЫТИЙ ===
    var events = ['keydown', 'mousemove', 'click', 'touchstart', 'wheel'];
    events.forEach(function(e) {
        window.addEventListener(e, function(ev) {
            if (screensaverDiv) {
                var v = screensaverDiv.querySelector('video');
                var sSetting = Lampa.Storage.get('fireplace_sound');
                var sEnabled = (sSetting !== 'false' && sSetting !== false);

                // Включаем звук по нажатию ОК, если он был заглушён браузером
                if (v && v.muted && sEnabled && (ev.type === 'keydown' || ev.type === 'click')) {
                    v.muted = false;
                    var h = screensaverDiv.querySelector('div:last-child');
                    if (h) h.style.opacity = '0';
                    ev.preventDefault();
                    return;
                }

                hideFireplace();
            } else {
                resetTimer();
            }
        });
    });

    // === ЗАПУСК ===
    if (window.appready) {
        addSettings();
        resetTimer();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                addSettings();
                resetTimer();
            }
        });
    }
})();
