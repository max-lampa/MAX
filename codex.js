(function() {
    // Функция запуска плагина
    function startPlugin() {
        // 1. Премиум
        if (Lampa.Account) {
            Lampa.Account.hasPremium = function() { return true; };
        }

        // 2. Скрыть подписку в карточке (через CSS)
        var style = document.createElement('style');
        style.innerHTML = '.full-start__button.selector.button--subscribe { display: none !important; }';
        document.head.appendChild(style);

        // 3. Отключение VAST (пример)
        if (Lampa.Manifest && Lampa.Manifest.plugin) {
            var originalPlugin = Lampa.Manifest.plugin;
            Lampa.Manifest.plugin = function(url, callback) {
                if (url && url.indexOf('/plugin/vast') !== -1) {
                    return originalPlugin('{localhost}/vast.js', callback);
                }
                return originalPlugin(url, callback);
            };
        }

        // 4. Убрать кнопку комментария
        Lampa.Listener.follow('full', function(e) {
            setTimeout(function() {
                var addCommentBtn = document.querySelector('.full-start__button--comments'); // пример селектора
                if (addCommentBtn) addCommentBtn.remove();
            }, 300);
        });
    }

    // Регистрация плагина в Lampa
    if (typeof Lampa !== 'undefined' && Lampa.Plugin) {
        Lampa.Plugin.register({
            name: 'Premium Plus',
            description: 'Активация премиума, скрытие подписки и рекламы',
            version: '1.0',
            async start() {
                startPlugin();
            }
        });
    } else {
        // Если Lampa ещё не загружена, ждём
        document.addEventListener('lampa_ready', function() {
            Lampa.Plugin.register({
                name: 'Premium Plus',
                description: '...',
                version: '1.0',
                start: startPlugin
            });
        });
    }
})();