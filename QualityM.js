(function () {
    'use strict';
    function init() {
        if (!window.Lampa || window.qb_loaded) return;
        window.qb_loaded = true;

        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'interface') {
                var s = $('<div class="settings-param selector" data-type="select" data-name="qb_size"><div class="settings-param__name">Размер иконок</div><div class="settings-param__value"></div></div>');
                var c = $('<div class="settings-param selector" data-type="select" data-name="qb_color"><div class="settings-param__name">Цвет иконок</div><div class="settings-param__value"></div></div>');
                e.body.find('[data-name="card_view"]').after(s, c);
                Lampa.Settings.serial(s); Lampa.Settings.serial(c);
            }
        });

        Lampa.Storage.setDefault('qb_size', 'medium');
        Lampa.Storage.setDefault('qb_color', 'original');

        var path = 'https://raw.githubusercontent.com/FoxStudio24/lampa/main/Quality/Quality_ico/';

        setInterval(function() {
            $('.card:not(.qb-ok)').addClass('qb-ok').each(function() {
                var card = $(this);
                var item = card.data('item');
                if (item) {
                    // Рейтинг (сразу)
                    if (item.vote_average) {
                        var v = parseFloat(item.vote_average).toFixed(1);
                        var col = v >= 7 ? '#3bb33b' : '#aaa';
                        card.find('.card__view').append('<div style="position:absolute;top:8px;left:8px;background:'+col+';color:#fff;font-size:10px;padding:2px 5px;border-radius:3px;z-index:20;">'+v+'</div>');
                    }
                    // Качество (через парсер)
                    if (Lampa.Storage.field('parser_use')) {
                        Lampa.Parser.get({ search: item.title || item.name, movie: item, page: 1 }, function(res) {
                            if (res && res.Results) {
                                var b = {res:'', hdr:false};
                                res.Results.slice(0,10).forEach(function(r){
                                    var t = (r.Title||'').toLowerCase();
                                    if(t.indexOf('4k')>-1) b.res='4K';
                                    if(t.indexOf('hdr')>-1) b.hdr=true;
                                });
                                var sz = Lampa.Storage.field('qb_size') === 'small' ? '12px' : '18px';
                                var flt = Lampa.Storage.field('qb_color') === 'gold' ? 'sepia(1) saturate(5)' : 'none';
                                var html = $('<div style="position:absolute;top:8px;right:8px;display:flex;gap:4px;z-index:20;"></div>');
                                if(b.res) html.append('<img src="'+path+b.res+'.svg" style="height:'+sz+';filter:'+flt+'">');
                                if(b.hdr) html.append('<img src="'+path+'HDR.svg" style="height:'+sz+';filter:'+flt+'">');
                                card.find('.card__view').append(html);
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
