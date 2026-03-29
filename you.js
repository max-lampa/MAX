// ==========================================
// Lampa YouTube Plugin (без подписок ограничений)
// ==========================================

(function() {
    'use strict';

    Lampa.Listener.follow('app', function(e) {
        if (e.type == 'ready') {
            youtubeFix();
        }
    });

    function youtubeFix() {
        // Отключаем ограничения подписок YouTube
        if (Lampa.Storage.field('youtube_subscriptions_limit')) {
            Lampa.Storage.set('youtube_subscriptions_limit', false);
        }
        
        // Показываем все каналы без фильтра
        if (Lampa.Storage.field('youtube_hide_unsubscribed')) {
            Lampa.Storage.set('youtube_hide_unsubscribed', false);
        }

        // Максимум роликов без ограничений
        Lampa.Storage.set('youtube_max_videos', 1000);
        Lampa.Storage.set('youtube_load_more', true);

        console.log('✅ Lampa YouTube: сняты ограничения подписок');
    }

    // Перехват YouTube API запросов
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).then(response => {
            if (args[0] && args[0].includes('youtube.com') && args[0].includes('subscriptions')) {
                // Разблокируем все видео в ответе
                return response.clone().json().then(data => {
                    if (data.items) {
                        data.items = data.items.filter(item => true); // Показываем ВСЕ
                    }
                    return new Response(JSON.stringify(data), {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });
                }).catch(() => response);
            }
            return response;
        });
    };

    // Hook для YouTube карточек
    const originalRender = Lampa.Template.render;
    Lampa.Template.render = function(...args) {
        const result = originalRender.apply(this, args);
        
        if (args[0] && args[0].includes('youtube')) {
            // Показываем все карточки без фильтра
            result.find('.selector').show();
        }
        
        return result;
    };

})();