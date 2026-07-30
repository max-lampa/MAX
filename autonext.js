(function () {
    'use strict';

    var currentHash = null;
    var currentEpisodeIndex = -1;
    var lastSeenTime = -1; 
    var timeStalledCount = 0; 
    var nextEpisodeTriggered = false;
    var currentSelector = ''; 
    var playbackStarted = false; // <-- НОВИЙ ПРАПОРЕЦЬ ЗАХИСТУ

    function updateLastTime() {
        if (currentHash) {
            var fileViews = Lampa.Storage.get('file_view', {});
            var info = fileViews[currentHash];
            lastSeenTime = (info && info.time) ? info.time : 0;
        }
    }

    // 1. Ловимо клік по серії
    $(document).on('click hover:enter', '.torrent-list > .online-prestige.selector, .torrent-files > .torrent-serial.selector, .torrent-files > .torrent-item.selector', function () {
        
        if ($(this).hasClass('online-prestige')) currentSelector = '.torrent-list > .online-prestige.selector';
        else if ($(this).hasClass('torrent-serial')) currentSelector = '.torrent-files > .torrent-serial.selector';
        else currentSelector = '.torrent-files > .torrent-item.selector';

        var $allEpisodes = $(currentSelector);
        currentEpisodeIndex = $allEpisodes.index(this);
        
        nextEpisodeTriggered = false;
        timeStalledCount = 0;
        playbackStarted = false; // Блокуємо сканер до початку реального відтворення

        var domHash = $(this).find('.time-line').attr('data-hash');
        if (domHash) {
            currentHash = domHash;
            updateLastTime();
        }
    });

    function playNextEpisode() {
        if (currentEpisodeIndex === -1 || !currentSelector) return;

        var $allEpisodes = $(currentSelector);
        var nextIndex = currentEpisodeIndex + 1;
        
        if (nextIndex < $allEpisodes.length) {
            var $next = $allEpisodes.eq(nextIndex);
            currentEpisodeIndex = nextIndex;
            timeStalledCount = 0;
            playbackStarted = false; // Блокуємо сканер для наступної серії
            
            var el = $next[0];
            if (el) el.dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true }));

            setTimeout(function() { nextEpisodeTriggered = false; }, 5000);
        } else {
            Lampa.Noty.show('Автоперехід: Це остання серія');
        }
    }

    function initAutoNext() {
        // 2. Перехоплюємо плеєр для торрентів
        var originalPlay = Lampa.Player.play;
        Lampa.Player.play = function (data) {
            if (data && data.timeline && data.timeline.hash) {
                currentHash = data.timeline.hash;
                updateLastTime(); 
                playbackStarted = false; // Скидаємо прапорець
            }
            if (originalPlay) originalPlay.apply(this, arguments);
        };

        // 3. Розумний сканер
        setInterval(function() {
            if (!currentHash || nextEpisodeTriggered || currentEpisodeIndex === -1) return;

            var fileViews = Lampa.Storage.get('file_view', {});
            var info = fileViews[currentHash];

            if (info && info.duration && info.duration > 60) {
                var currentTime = info.time || 0;
                var percentWatched = currentTime / info.duration;
                var timeLeft = info.duration - currentTime;

                // --- ФІКС: Чекаємо, поки відео РЕАЛЬНО почне грати у цій сесії ---
                if (!playbackStarted) {
                    // Якщо час змінився відносно стартового - значить VLC запустився і передає дані
                    if (Math.abs(currentTime - lastSeenTime) >= 1) {
                        playbackStarted = true;
                        lastSeenTime = currentTime;
                    }
                    return; // Далі не йдемо, сканер поки що "спить"
                }
                // -----------------------------------------------------------------

                if (Math.abs(currentTime - lastSeenTime) < 2) { 
                    timeStalledCount++; 
                } else {
                    timeStalledCount = 0; 
                    lastSeenTime = currentTime;
                }

                if (timeStalledCount >= 2 && (percentWatched > 0.85 || timeLeft <= 180)) {
                    nextEpisodeTriggered = true;
                    Lampa.Noty.show('Серія завершена. Запуск наступної...');
                    playNextEpisode();
                }
            }
        }, 2000);

        console.log('Lampa Auto-Next: Універсальний сканер (Фікс переглянутих) активовано');
    }

    if (window.appready) initAutoNext();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') initAutoNext();
        });
    }
})();
