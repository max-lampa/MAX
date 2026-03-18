(function() {
    'use strict';

    function applyPatches() {
        console.log('[PremiumUnlock] Применяем патчи...');

        // ===== 1. Активация премиума (расширенные закладки) =====
        // Перехватываем все возможные проверки премиума
        if (Lampa.Account) {
            Lampa.Account.hasPremium = function() { return true; };
            if (Lampa.Account.user) Lampa.Account.user.premium = true;
        }

        if (Lampa.Premium) {
            Lampa.Premium.isPremium = true;
            if (Lampa.Premium.check) Lampa.Premium.check = function() { return true; };
            if (Lampa.Premium.has) Lampa.Premium.has = function() { return true; };
        }

        // Для модов Cub
        if (window.Cub) {
            if (Cub.Premium) {
                Cub.Premium.isActive = true;
                Cub.Premium.has = function() { return true; };
            } else {
                Cub.Premium = { isActive: true, has: function() { return true; } };
            }
            if (typeof Cub.checkPremium === 'function') {
                Cub.checkPremium = function() { return true; };
            }
        }

        // Хранилище – принудительно ставим флаги
        Lampa.Storage.set('premium', true);
        Lampa.Storage.set('user', { premium: true, is_premium: 1 });
        Lampa.Storage.set('account', { premium: true });

        // ===== 2. Скрытие кнопки подписки в карточке =====
        function hideSubscribeButton() {
            let style = document.getElementById('premium-hide-style');
            if (!style) {
                style = document.createElement('style');
                style.id = 'premium-hide-style';
                style.textContent = `
                    .full-start__button.selector.button--subscribe,
                    .full-start__button--subscribe,
                    button.button--subscribe {
                        display: none !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        hideSubscribeButton();

        // ===== 3. Отключение VAST-рекламы =====
        // Перехватываем загрузку VAST-плагина и подменяем URL на пустой
        if (Lampa.Manifest && Lampa.Manifest.plugin) {
            const originalPlugin = Lampa.Manifest.plugin;
            Lampa.Manifest.plugin = function(url, callback) {
                if (url && url.includes('/plugin/vast')) {
                    console.log('[PremiumUnlock] VAST заблокирован');
                    // Вместо рекламы возвращаем пустой скрипт
                    return originalPlugin('{localhost}/vast.js', callback);
                }
                return originalPlugin(url, callback);
            };
        }

        // Дополнительно: подавляем возможные вызовы рекламы через плеер
        if (Lampa.Player && Lampa.Player.ad) {
            Lampa.Player.ad = {};
        }

        // ===== 4. Убираем кнопку «Добавить комментарий» =====
        // Вариант через CSS (проще и надёжнее, если кнопка имеет уникальный класс)
        function hideCommentButton() {
            let style = document.getElementById('premium-comment-style');
            if (!style) {
                style = document.createElement('style');
                style.id = 'premium-comment-style';
                style.textContent = `
                    .full__block.comments .comments-add,
                    .full__comments-add,
                    button.comments-add,
                    .full-start__button--comments {
                        display: none !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        hideCommentButton();

        // Если кнопка добавляется динамически, отслеживаем появление карточки
        Lampa.Listener.follow('full', function(e) {
            setTimeout(function() {
                let btn = document.querySelector('.full__comments-add, .comments-add, .full-start__button--comments');
                if (btn) btn.style.display = 'none';
            }, 300);
        });

        console.log('[PremiumUnlock] Все патчи применены.');
    }

    // Регистрация плагина
    function registerPlugin() {
        if (typeof Lampa !== 'undefined' && Lampa.Plugin) {
            Lampa.Plugin.register({
                name: 'Premium Unlock All',
                description: 'Активация премиума, скрытие подписки, отключение рекламы и комментариев',
                version: '1.5',
                async start() {
                    applyPatches();
                }
            });
        } else {
            document.addEventListener('lampa_ready', function() {
                Lampa.Plugin.register({
                    name: 'Premium Unlock All',
                    description: 'Активация премиума и скрытие элементов',
                    version: '1.5',
                    start: applyPatches
                });
            });
        }
    }

    // Запускаем регистрацию
    registerPlugin();
})();