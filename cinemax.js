(function() {
    "use strict";

    var STYLE = [
        "body.cinema-torrent-ui { background:#0d1015!important; }",
        "body.cinema-torrent-ui .background { opacity:.12!important; }",
        "body.cinema-torrent-ui .head { background:linear-gradient(180deg,#11151cf5,#11151c00); }",
        "",
        "body.cinema-torrent-ui .explorer { color:#f4f5f7; }",
        "body.cinema-torrent-ui .explorer__card { padding:1em 1em 1.5em 1.5em; }",
        "body.cinema-torrent-ui .explorer-card { position:relative; padding:1.3em; overflow:hidden; border:1px solid #ffffff1f; border-radius:1.4em; background:linear-gradient(180deg,#0d101520 0,#0d101580 9em,#0d1015f2 17em,#0d1015f5 100%),#151b25; }",
        "body.cinema-torrent-ui .explorer-card__head { margin-bottom:1.6em; }",
        "body.cinema-torrent-ui .explorer-card__head-img > img { border-radius:.7em; box-shadow:0 .8em 2em #0008; object-fit:cover; }",
        "body.cinema-torrent-ui .explorer-card__head-img.focus::after { border-color:#f2f4f6; border-width:.22em; border-radius:1em; }",
        "body.cinema-torrent-ui .explorer-card__head-create { color:#d3dbe5; }",
        "body.cinema-torrent-ui .explorer-card__head-rate > svg, body.cinema-torrent-ui .explorer-card__head-rate > span { color:#f1d59a; }",
        "body.cinema-torrent-ui .explorer-card__head-age { border-color:#ffffff40; border-radius:.45em; color:#d3dbe5; }",
        "body.cinema-torrent-ui .explorer-card__title { font-weight:600; letter-spacing:-.02em; overflow-wrap:anywhere; }",
        "body.cinema-torrent-ui .explorer-card__genres { color:#bdc8d8; margin-bottom:1.2em; }",
        "body.cinema-torrent-ui .explorer-card__descr { color:#c7cdd5; }",
        "",
        "body.cinema-torrent-ui .explorer__files .torrent-filter { display:flex; flex-wrap:wrap; gap:.6em; margin-bottom:.4em; }",
        "body.cinema-torrent-ui .explorer__files .torrent-filter .simple-button { margin:0; height:auto; min-height:44px; padding:.35em .5em .35em .9em; font-size:1em; color:#f4f5f7; background:#ffffff0a; border:1px solid #ffffff1a; border-radius:.8em; }",
        "body.cinema-torrent-ui .explorer__files .torrent-filter .simple-button > span { margin:0 .6em 0 0; font-size:.8em; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#8f9bad; }",
        "body.cinema-torrent-ui .explorer__files .torrent-filter .simple-button > div:not(.hide) { margin:0; padding:.35em .75em; font-size:.95em; color:#f4f5f7; background:#ffffff17; border-radius:.55em; }",
        "body.cinema-torrent-ui .explorer__files .torrent-filter .simple-button > svg { margin-right:.5em; }",
        "body.cinema-torrent-ui .explorer__files .torrent-filter .simple-button.focus, body.cinema-torrent-ui .explorer__files .torrent-filter .simple-button.hover { color:#fff; background:#ffffff18; border-color:#f2f4f6; outline:2px solid #f2f4f6; outline-offset:-2px; }",
        "body.cinema-torrent-ui .explorer__files .torrent-filter .simple-button.focus > span { color:#f4f5f7; }",
        "",
        "body.cinema-torrent-ui .explorer .watched-history { background:#ffffff08; border:1px solid #ffffff14; border-radius:1em; }",
        "body.cinema-torrent-ui .explorer .watched-history.focus, body.cinema-torrent-ui .explorer .watched-history.hover { background:#ffffff14; border-color:#f2f4f6; }",
        "body.cinema-torrent-ui .explorer .watched-history.focus:after { top:-.3em; left:-.3em; right:-.3em; bottom:-.3em; border:.2em solid #f2f4f6; border-radius:1.25em; }",
        "body.cinema-torrent-ui .explorer .torrent-item { padding:1.1em 1.2em; background:#ffffff08; border:1px solid #ffffff14; border-radius:1em; }",
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
        "body.cinema-torrent-ui .modal__content { color:#f4f5f7; background:linear-gradient(145deg,#1d2127,#121418); border:1px solid #ffffff24; border-radius:1.4em; box-shadow:0 1em 4em #0008; }",
        "body.cinema-torrent-ui .modal__title { font-weight:500; letter-spacing:-.01em; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial, body.cinema-torrent-ui .torrent-files .torrent-file { overflow:hidden; background:#ffffff08; border:1px solid #ffffff14; border-radius:1em; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial + .torrent-serial, body.cinema-torrent-ui .torrent-files .torrent-file + .torrent-file { margin-top:.7em; }",
        "body.cinema-torrent-ui .torrent-files .torrent-serial__img { border-radius:0; object-fit:cover; }",
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
        " body.cinema-torrent-ui .torrent-files { display:grid; grid-template-columns:repeat(auto-fill,minmax(14em,1fr)); gap:1em; }",
        " body.cinema-torrent-ui .torrent-files .torrnet-folder-name, body.cinema-torrent-ui .torrent-files .torrent-file { grid-column:1/-1; padding:.4em 0 0; }",
        " body.cinema-torrent-ui .torrent-files .tracks-metainfo, body.cinema-torrent-ui .torrent-files .tracks-loading { grid-column:1/-1; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial + .torrent-serial { margin-top:0; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial { display:block; position:relative; padding-bottom:0; aspect-ratio:16/9; background:#1e2630; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial__img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:0; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial__content { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end; padding:.7em .8em .65em; overflow:hidden; background:linear-gradient(0deg,#0d1015f0 0%,#0d1015a0 38%,#0d101500 70%); }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial__body { float:none; max-width:none; margin:0; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial__title { font-size:1.1em; line-height:1.25; font-weight:600; color:#fff; white-space:normal; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; text-shadow:0 1px .6em #000a; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial__line, body.cinema-torrent-ui .torrent-files .torrent-serial__exe, body.cinema-torrent-ui .torrent-files .torrent-serial__clear { display:none; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial__detail { position:absolute; top:.5em; right:.5em; float:none; margin:0; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial__size { font-size:.85em; padding:.15em .5em; background:#0d1015c8; border-color:#ffffff30; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial__size:empty { display:none; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial__episode { left:.5em; top:.5em; font-size:.95em; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial .time-line { position:static; width:auto; top:auto; left:auto; margin-top:.5em; height:.25em; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial .time-line > div { height:.25em; }",
        "}",
        "",
        "body.cinema-torrent-ui .modal:has(.torrent-files):not(.cinema-files-logo) .modal__head { display:none; }",
        "body.cinema-torrent-ui .modal:has(.torrent-files) .modal__content { display:flex; flex-direction:column; box-sizing:border-box; max-height:calc(100vh - max(2.5em,env(safe-area-inset-top) + 1em)); max-height:calc(100dvh - max(2.5em,env(safe-area-inset-top) + 1em)); }",
        "body.cinema-torrent-ui .modal:has(.torrent-files) .modal__head { flex:none; }",
        "body.cinema-torrent-ui .modal:has(.torrent-files) .modal__body, body.cinema-torrent-ui .modal:has(.torrent-files) .modal__body > .scroll { display:flex; flex-direction:column; flex:1 1 auto; min-height:0; }",
        "body.cinema-torrent-ui .modal:has(.torrent-files) .modal__body .scroll__content { flex:1 1 auto; min-height:0; max-height:none!important; }",
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
        "/* Nova torrent layout */",
        "body.cinema-torrent-ui .nova-plus-root .explorer__files-body, body.cinema-torrent-ui .nova-plus-scope .explorer__files-body { padding-left:.95em; padding-right:.95em; }",
        "body.cinema-torrent-ui .nova-plus-root .explorer-card, body.cinema-torrent-ui .nova-plus-scope .explorer-card { border-radius:1.15em; background:linear-gradient(180deg,#111823f2 0,#0d1015f5 100%); box-shadow:inset 0 0 0 1px #ffffff0a,0 .8em 2em #0005; }",
        "body.cinema-torrent-ui .nova-plus-root .explorer-card__head-img > img, body.cinema-torrent-ui .nova-plus-scope .explorer-card__head-img > img { border-radius:.9em; box-shadow:0 .8em 2em #0008; }",
        "body.cinema-torrent-ui .nova-plus-root .explorer__files .torrent-filter, body.cinema-torrent-ui .nova-plus-scope .explorer__files .torrent-filter { padding:.35em .2em .65em; }",
        "body.cinema-torrent-ui .nova-plus-root .explorer__files .torrent-filter .simple-button, body.cinema-torrent-ui .nova-plus-scope .explorer__files .torrent-filter .simple-button { background:#ffffff0b; border-color:#ffffff15; border-radius:.75em; box-shadow:inset 0 0 0 1px #ffffff05; }",
        "body.cinema-torrent-ui .nova-plus-root .explorer__files .torrent-filter .simple-button.focus, body.cinema-torrent-ui .nova-plus-root .explorer__files .torrent-filter .simple-button.hover, body.cinema-torrent-ui .nova-plus-scope .explorer__files .torrent-filter .simple-button.focus, body.cinema-torrent-ui .nova-plus-scope .explorer__files .torrent-filter .simple-button.hover { background:#ffffff18; }",
        "body.cinema-torrent-ui .nova-plus-root .explorer .torrent-item, body.cinema-torrent-ui .nova-plus-scope .explorer .torrent-item { background:#ffffff08; border-color:#ffffff12; border-radius:.85em; box-shadow:inset 0 0 0 1px #ffffff04; }",
        "body.cinema-torrent-ui .nova-plus-root .explorer .torrent-item.focus, body.cinema-torrent-ui .nova-plus-root .explorer .torrent-item.hover, body.cinema-torrent-ui .nova-plus-scope .explorer .torrent-item.focus, body.cinema-torrent-ui .nova-plus-scope .explorer .torrent-item.hover { background:#ffffff14; border-color:#f2f4f6; }",
        "body.cinema-torrent-ui .nova-plus-root .torrent-files, body.cinema-torrent-ui .nova-plus-scope .torrent-files { gap:.8em; }",
        "body.cinema-torrent-ui .nova-plus-root .torrent-files .torrent-serial, body.cinema-torrent-ui .nova-plus-root .torrent-files .torrent-file, body.cinema-torrent-ui .nova-plus-scope .torrent-files .torrent-serial, body.cinema-torrent-ui .nova-plus-scope .torrent-files .torrent-file { border-color:#ffffff12; border-radius:.85em; box-shadow:inset 0 0 0 1px #ffffff04; }",
        "body.cinema-torrent-ui .nova-plus-root .torrent-files .torrent-serial.focus, body.cinema-torrent-ui .nova-plus-root .torrent-files .torrent-serial.hover, body.cinema-torrent-ui .nova-plus-root .torrent-files .torrent-file.focus, body.cinema-torrent-ui .nova-plus-root .torrent-files .torrent-file.hover, body.cinema-torrent-ui .nova-plus-scope .torrent-files .torrent-serial.focus, body.cinema-torrent-ui .nova-plus-scope .torrent-files .torrent-serial.hover, body.cinema-torrent-ui .nova-plus-scope .torrent-files .torrent-file.focus, body.cinema-torrent-ui .nova-plus-scope .torrent-files .torrent-file.hover { background:#ffffff16; border-color:#f2f4f6; }",
        "body.cinema-torrent-ui .nova-plus-root .torrent-files .torrent-serial__content, body.cinema-torrent-ui .nova-plus-scope .torrent-files .torrent-serial__content { background:linear-gradient(0deg,#0d1015f5 0%,#0d1015aa 42%,#0d101500 74%); }",
        "body.cinema-torrent-ui .nova-plus-root .torrent-files .torrent-serial__title, body.cinema-torrent-ui .nova-plus-scope .torrent-files .torrent-serial__title { letter-spacing:-.01em; }",
        "body.cinema-torrent-ui .nova-plus-root .torrent-files .torrnet-folder-name, body.cinema-torrent-ui .nova-plus-scope .torrent-files .torrnet-folder-name { padding:.45em .2em .15em; font-size:.85em; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#8f9bad; }",
        "body.cinema-torrent-ui .nova-plus-root .tracks-metainfo__info > div, body.cinema-torrent-ui .nova-plus-scope .tracks-metainfo__info > div { border-radius:.7em; background:#ffffff08; }",
        "body.cinema-torrent-ui .nova-plus-root .nova-plus__panel--overlay .torrent-files, body.cinema-torrent-ui .nova-plus-scope .nova-plus__panel--overlay .torrent-files { padding-bottom:1em; }",
        "body.cinema-torrent-ui .nova-plus-root .nova-plus__bar, body.cinema-torrent-ui .nova-plus-root > .nova__rows > .nova-toolbar { gap:.5em; }",
        "",
        "@media screen and (max-width:640px) {",
        " body.cinema-torrent-ui .explorer__card { padding:.8em; }",
        " body.cinema-torrent-ui .explorer-card { padding:1em; border-radius:1.1em; }",
        " body.cinema-torrent-ui .torrent-files { gap:.7em; }",
        " body.cinema-torrent-ui .torrent-files .torrent-serial__title { font-size:1em; }",
        " body.cinema-torrent-ui .nova-plus-root .explorer__files-body, body.cinema-torrent-ui .nova-plus-scope .explorer__files-body { padding-left:.65em; padding-right:.65em; }",
        " body.cinema-torrent-ui .nova-plus-root .torrent-files, body.cinema-torrent-ui .nova-plus-scope .torrent-files { gap:.6em; }",
        "}",
        "@media (prefers-reduced-motion:reduce) { body.cinema-torrent-ui *, body.cinema-torrent-ui *:before, body.cinema-torrent-ui *:after { transition:none!important; animation:none!important; } }"
    ].join("\n");

    function boot() {
        if (!window.Lampa || window.lampaCinemaTorrentInterface) return;

        var style = document.createElement("style");
        style.id = "cinema-torrent-interface-style";
        style.textContent = STYLE;
        document.head.appendChild(style);

        function updateScope() {
            var active = !!document.querySelector(".explorer, .explorer-card, .torrent-files, .nova-plus-scope .explorer__files-body, .nova-plus-root .explorer__files-body");
            document.body.classList.toggle("cinema-torrent-ui", active);
        }

        var observer = new MutationObserver(updateScope);
        observer.observe(document.body, { childList: true, subtree: true });
        updateScope();

        window.lampaCinemaTorrentInterface = {
            version: "20260926.1",
            destroy: function() {
                observer.disconnect();
                style.remove();
                document.body.classList.remove("cinema-torrent-ui");
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