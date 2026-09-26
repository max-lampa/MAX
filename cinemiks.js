(function() {
    "use strict";

    var STYLE = [
        "body.cinema-torrent-ui .explorer .torrent-item { color:#f4f5f7; padding:1.1em 1.2em; background:#ffffff08; border:1px solid #ffffff14; border-radius:1em; }",
        "body.cinema-torrent-ui .explorer .torrent-item + .torrent-item { margin-top:.7em; }",
        "body.cinema-torrent-ui .explorer .torrent-item__title { font-size:1.15em; font-weight:500; line-height:1.35; color:#eef1f5; word-break:normal; overflow-wrap:anywhere; }",
        "body.cinema-torrent-ui .explorer .torrent-item__ffprobe > div { background:#ffffff12; border:1px solid #ffffff1f; border-radius:.5em; }",
        "body.cinema-torrent-ui .explorer .torrent-item__ffprobe > div.m-general { font-size:1em; outline:none; border-color:#ffffff30; border-radius:.6em; overflow:hidden; }",
        "body.cinema-torrent-ui .explorer .torrent-item__ffprobe > div.m-general > div:nth-child(1) { padding:.45em .65em; font-size:1em; font-weight:700; background:#ffffff26; border-radius:0; }",
        "body.cinema-torrent-ui .explorer .torrent-item__ffprobe > div.m-general > div:nth-child(2) { padding:.45em .7em; }",
        "body.cinema-torrent-ui .explorer .torrent-item__ffprobe > div.m-resolution { background:#ffffff1c; box-shadow:none; }",
        "body.cinema-torrent-ui .explorer .torrent-item__details { color:#a1aaba; font-weight:500; }",
        "body.cinema-torrent-ui .explorer .torrent-item__seeds > span { color:#7ee2a8; background:#1f7a4d4d; border-radius:.4em; }",
        "body.cinema-torrent-ui .explorer .torrent-item__grabs > span { color:#d3dbe5; background:#ffffff17; border-radius:.4em; }",
        "body.cinema-torrent-ui .explorer .torrent-item__size { color:#fff; background:#ffffff1f; border:1px solid #ffffff38; border-radius:.5em; }",
        "body.cinema-torrent-ui .explorer .torrent-item.focus, body.cinema-torrent-ui .explorer .torrent-item.hover { background:#ffffff12; border-color:#f2f4f6; }",
        "body.cinema-torrent-ui .explorer .torrent-item.focus:after { top:-.3em; left:-.3em; right:-.3em; bottom:-.3em; border:.2em solid #f2f4f6; border-radius:1.25em; }",
        "body.cinema-torrent-ui .explorer .torrent-item__viewed { background:#de3041; color:#fff; }",
        "",
        "body.cinema-torrent-ui .torrent-files .torrent-serial, body.cinema-torrent-ui .torrent-files .torrent-file { overflow:hidden; background:#ffffff08; border:1px solid #ffffff14; border-radius:1em; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial + .torrent-serial, body.cinema-torrent-ui .torrent-files .torrent-file + .torrent-file { margin-top:.7em; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial__img { display:block; max-width:100%; height:auto; object-fit:cover; border-radius:0; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial__episode { left:.45em; top:.45em; padding:.2em .55em; font-size:1.15em; background:#0d1015d0; border:1px solid #ffffff24; border-radius:.5em; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial__title { font-size:1.4em; font-weight:500; color:#eef1f5; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial__line { color:#aab5c5; font-weight:400; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial__line b { color:#d3dbe5; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial__size, body.cinema-torrent-ui .torrent-files .torrent-file__size { font-size:1.1em; color:#fff; background:#ffffff1c; border:1px solid #ffffff30; border-radius:.5em; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial__exe { font-size:1em; color:#8f9bad; }",
        "body.cinema-torrent-ui .torrent-files .time-line { background-color:#ffffff30; }",
        "body.cinema-torrent-ui .torrent-files .time-line > div { background-color:#de3041; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial.focus, body.cinema-torrent-ui .torrent-files .torrent-serial.hover, body.cinema-torrent-ui .torrent-files .torrent-file.focus, body.cinema-torrent-ui .torrent-files .torrent-file.hover { background:#ffffff14; border-color:#f2f4f6; outline:2px solid #f2f4f6; outline-offset:-2px; }",
        "body.cinema-torrent-ui .torrent-files .torrnet-folder-name { font-size:1em; line-height:1.35; padding:0 0 .2em; color:#8f9bad; opacity:1; }",
        "",
        "@supports (aspect-ratio:16/9) {",
        " body.cinema-torrent-ui .torrent-files { display:grid; grid-template-columns:repeat(var(--cinema-torrent-grid-columns,auto-fill),minmax(14em,1fr)); gap:1em; align-items:start; }",
        " body.cinema-torrent-ui .torrent-files .torrnet-folder-name, body.cinema-torrent-ui .torrent-files .torrent-file, body.cinema-torrent-ui .torrent-files .tracks-metainfo, body.cinema-torrent-ui .torrent-files .tracks-loading { grid-column:1/-1; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial { min-width:0; }",
        "}",
        "",
        "body.cinema-torrent-ui .tracks-metainfo__label { font-size:.85em; letter-spacing:.08em; text-transform:uppercase; color:#8f9bad; opacity:1; }",
        "body.cinema-torrent-ui .tracks-metainfo__info > div { color:#e6ebf2; background:#ffffff08; border:1px solid #ffffff14; border-radius:.8em; }",
        "body.cinema-torrent-ui .tracks-metainfo__info > div.focus, body.cinema-torrent-ui .tracks-metainfo__info > div.hover { background:#ffffff14; border-color:#f2f4f6; outline:2px solid #f2f4f6; outline-offset:-2px; }",
        "body.cinema-torrent-ui .tracks-metainfo__column--num, body.cinema-torrent-ui .tracks-metainfo__column--rate, body.cinema-torrent-ui .tracks-metainfo__column--channels, body.cinema-torrent-ui .tracks-metainfo__column--codec { color:#aab5c5; }",
        "body.cinema-torrent-ui .tracks-metainfo__column--lang { font-weight:600; }",
        "body.cinema-torrent-ui .tracks-metainfo__line + .tracks-metainfo__line { margin-top:1.4em; }",
        "body.cinema-torrent-ui .tracks-metainfo__info { padding-top:.6em; }",
        "body.cinema-torrent-ui .tracks-metainfo__info > div + div { margin-top:.5em; }",
        "",
        "@media screen and (max-width:640px) {",
        " body.cinema-torrent-ui .torrent-files { gap:.7em; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial__title { font-size:1em; }",
        "}",
        "@media (prefers-reduced-motion:reduce) { body.cinema-torrent-ui *:before, body.cinema-torrent-ui *:after { transition:none!important; animation:none!important; } }"
    ].join("\n");

    function removeLegacyStyles() {
        [ "cinema-pilot-style", "cinema-torrent-interface-style" ].forEach(function(id) {
            var node = document.getElementById(id);
            if (node) node.remove();
        });
        [
            "cinema-pilot",
            "cinema-pilot-home",
            "cinema-pilot-detail",
            "cinema-pilot-catalog",
            "cinema-nova",
            "cinema-torrent-ui"
        ].forEach(function(name) {
            document.body.classList.remove(name);
        });
    }

    function boot() {
        if (!window.Lampa) return;
        if (window.lampaCinemaTorrentInterface && typeof window.lampaCinemaTorrentInterface.destroy === "function") {
            window.lampaCinemaTorrentInterface.destroy();
        }

        removeLegacyStyles();

        var COLUMNS_KEY = "cinema_torrent_columns";
        var style = document.createElement("style");
        style.id = "cinema-torrent-interface-style";
        style.textContent = STYLE;
        document.head.appendChild(style);

        function columnsValue() {
            var value = Lampa.Storage && Lampa.Storage.value ? Lampa.Storage.value(COLUMNS_KEY, "auto") : "auto";
            return /^(auto|1|2|3|4)$/.test(String(value)) ? String(value) : "auto";
        }

        function applyColumns() {
            var value = columnsValue();
            document.body.style.setProperty("--cinema-torrent-grid-columns", value === "auto" ? "auto-fill" : value);
        }

        function addSettings() {
            if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent || !Lampa.SettingsApi.addParam) return;
            Lampa.SettingsApi.addComponent({
                component: "cinema_torrent_ui",
                name: "Nova — Торренты"
            });
            Lampa.SettingsApi.addParam({
                component: "cinema_torrent_ui",
                param: {
                    name: COLUMNS_KEY,
                    type: "select",
                    values: {
                        auto: "Авто",
                        1: "1 колонка",
                        2: "2 колонки",
                        3: "3 колонки",
                        4: "4 колонки"
                    },
                    default: "auto"
                },
                field: {
                    name: "Колонки файлов",
                    description: "Количество колонок в сетке файлов торрента."
                },
                onChange: applyColumns
            });
        }

        function updateScope() {
            var active = !!document.querySelector(".torrent-files, .explorer__files, .nova-plus-scope .explorer__files-body, .nova-plus-root .explorer__files-body");
            var scoped = document.body.classList.contains("cinema-torrent-ui");
            if (active !== scoped) document.body.classList.toggle("cinema-torrent-ui", active);
        }

        applyColumns();
        addSettings();
        var observer = new MutationObserver(updateScope);
        observer.observe(document.body, { childList:true, subtree:true });
        updateScope();

        window.lampaCinemaTorrentInterface = {
            version: "20260926.3",
            destroy: function() {
                observer.disconnect();
                style.remove();
                document.body.classList.remove("cinema-torrent-ui");
                document.body.style.removeProperty("--cinema-torrent-grid-columns");
                delete window.lampaCinemaTorrentInterface;
            }
        };
    }

    if (window.appready) boot();
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow("app", function(e) {
            if (e && e.type === "ready") boot();
        });
    }
})();