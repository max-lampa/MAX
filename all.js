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
                "https://max-lampa.github.io/MAX/mypost.js",
                "https://max-lampa.github.io/MAX/ai.js",
                "https://max-lampa.github.io/MAX/foreign.js",
                "https://max-lampa.github.io/MAX/myRatemax.js",
                "https://max-lampa.github.io/MAX/tstyle.js",
                "https://max-lampa.github.io/MAX/rus.js",
                "https://max-lampa.github.io/MAX/size.js",
                "https://max-lampa.github.io/MAX/mosfer.js",
                "https://max-lampa.github.io/MAX/mult.js",
                "https://max-lampa.github.io/MAX/upcoming.js",
                "https://max-lampa.github.io/MAX/tmdbpost.js",
                "https://lampa.li/on.js",
                "https://",
                "https://max-lampa.github.io/MAX/content.js",
            ];

            Lampa.Utils.putScriptAsync(myPlugins, function () {
                console.log("[MaksTV] Плагины успешно загружены");
            });
        }
    }, 200);
})();