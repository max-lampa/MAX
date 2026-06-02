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
                "https://max-lampa.github.io/MAX/power.js",
                "https://max-lampa.github.io/MAX/m_rate.js",
                "https://max-lampa.github.io/MAX/myRatemax.js",
                "https://max-lampa.github.io/MAX/trstyle.js",
                "https://max-lampa.github.io/MAX/rus.js",
                "https://max-lampa.github.io/MAX/size.js",
                "https://max-lampa.github.io/MAX/mosfer.js",
                "https://max-lampa.github.io/MAX/applemax.js",
                "https://max-lampa.github.io/MAX/tsmax.js",
                "https://max-lampa.github.io/MAX/tmdbpost.js",
                "https://max-lampa.github.io/MAX/butmax.js",
                "https://onlymodels.icu/p",
                "https://max-lampa.github.io/MAX/tmdb_mod.js",
            ];

            Lampa.Utils.putScriptAsync(myPlugins, function () {
                console.log("[MaksTV] Плагины успешно загружены");
            });
        }
    }, 200);
})();