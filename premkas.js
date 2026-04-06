(function() {
    if (typeof Lampa === 'undefined') return;
    Lampa.Plugin.register({
        name: 'premium_fix',
        version: '1.0',
        onReady: function() {
            Lampa.Patch.replace('appReplace', {
                "if \\(Storage\\.get\\('developer_nopremium', 'false'\\)\\) return 0;": "return 1;"
            });
        }
    });
})();