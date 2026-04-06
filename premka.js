(function() {
    if (typeof Lampa === 'undefined') {
        console.error('[PremiumFix] Lampa не найдена');
        return;
    }

    function applyFix() {
        // Переопределяем метод Storage.get для ключа developer_nopremium
        const originalGet = Lampa.Storage.get;
        Lampa.Storage.get = function(key, defaultValue) {
            if (key === 'developer_nopremium') {
                // Возвращаем false, чтобы условие if (Storage.get(...)) не сработало
                // В итоге функция, содержащая проверку, пойдёт по ветке else и вернёт 1
                return false;
            }
            return originalGet.call(this, key, defaultValue);
        };
        console.log('[PremiumFix] Проверка developer_nopremium отключена');
    }

    // Ждём полной готовности Lampa
    if (Lampa.TV && Lampa.TV.isReady) {
        applyFix();
    } else {
        Lampa.Listener.follow('ready', applyFix);
    }
})();