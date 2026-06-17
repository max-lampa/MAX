(function () {
    "use strict";

    // ========================
    // Автор: MaksTV
    // Описание: Загрузчик пользовательских плагинов для Lampa
    // ========================

    // При необходимости можно отключать блокировку ЛГБТ (но обычно не нужно)
    // window.lampa_settings.disable_features.lgbt = true;

    var timer = setInterval(function () {
        if (typeof Lampa !== "undefined") {
            clearInterval(timer);

            // Список ВАШИХ проверенных плагинов (только HTTPS!)
            var myPlugins = [
                "https://max-lampa.github.io/MAX/colors.js",
                "https://max-lampa.github.io/MAX/applemax.js",
                "https://max-lampa.github.io/MAX/fullmaks.js",
                "https://max-lampa.github.io/MAX/AppleStyle.js",
                "https://max-lampa.github.io/MAX/power.js",
            ];

            Lampa.Utils.putScriptAsync(myPlugins, function () {
                console.log("[MaksTV] Плагины успешно загружены");
            });
        }
    }, 200);
})();