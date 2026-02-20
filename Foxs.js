(function () {
    'use strict';
    function init() {
        if (!window.Lampa || window.qb_loaded) return;
        window.qb_loaded = true;

        // Настройки
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'interface') {
                var s = $('<div class="settings-param selector" data-type="select" data-name="qb_size"><div class="settings-param__name">Размер иконок</div><div class="settings-param__value"></div></div>');
                e.body.find('[data-name="card_view"]').after(s);
                Lampa.Settings.serial(s);
            }
        });

        Lampa.Storage.setDefault('qb_size', 'medium');
        Lampa.Params.select('qb_size', {'small': 'Мелкий', 'medium': 'Средний'}, 'medium');

        setInterval(function() {
            $('.card:not(.qb-ok)').addClass('qb-ok').each(function() {
                var card = $(this);
                var item = card.data('item');
                if (item) {
                    var view = card.find('.card__view');
                    
                    // 1. РЕЙТИНГ (появляется сразу)
                    if (item.vote_average && !card.find('.qb-rat').length) {
                        var v = parseFloat(item.vote_average).toFixed(1);
                        var col = v >= 7 ? '#3bb33b' : '#777';
                        view.append('<div class="qb-rat" style="position:absolute;top:8px;left:8px;background:'+col+';color:#fff;font-size:11px;font-weight:bold;padding:2px 6px;border-radius:4px;z-index:20;box-shadow:0 2px 4px rgba(0,0,0,0.5);">'+v+'</div>');
                    }

                    // 2. КАЧЕСТВО (через парсер)
                    if (Lampa.Storage.field('parser_use')) {
                        Lampa.Parser.get({ search: item.title || item.name, movie: item, page: 1 }, function(res) {
                            if (res && res.Results && !card.find('.qb-res-cont').length) {
                                var b = {res:'', hdr:false};
                                res.Results.slice(0,10).forEach(function(r){
                                    var t = (r.Title||'').toLowerCase();
                                    if(t.indexOf('4k')>-1 || t.indexOf('2160')>-1) b.res='4K';
                                    if(t.indexOf('hdr')>-1) b.hdr=true;
                                });
                                
                                if(b.res || b.hdr) {
                                    var sz = Lampa.Storage.field('qb_size') === 'small' ? '10px' : '12px';
                                    var html = $('<div class="qb-res-cont" style="position:absolute;top:8px;right:8px;display:flex;gap:4px;z-index:20;"></div>');
                                    
                                    if(b.res) html.append('<div style="background:#e50914;color:#fff;font-size:'+sz+';font-weight:bold;padding:2px 5px;border-radius:3px;box-shadow:0 2px 4px rgba(0,0,0,0.5);">'+b.res+'</div>');
                                    if(b.hdr) html.append('<div style="background:#ff9500;color:#fff;font-size:'+sz+';font-weight:bold;padding:2px 5px;border-radius:3px;box-shadow:0 2px 4px rgba(0,0,0,0.5);">HDR</div>');
                                    
                                    view.append(html);
                                }
                            }
                        });
                    }
                }
            });
        }, 3000);
    }

    if (window.Lampa) init();
    else {
        var t = setInterval(function() { if (window.Lampa) { clearInterval(t); init(); } }, 200);
    }
})();
