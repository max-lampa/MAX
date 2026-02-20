(function () {
    'use strict';

    function init() {
        if (!window.Lampa) return;

        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name == 'interface') {
                var s = $('<div class="settings-param selector" data-type="select" data-name="qb_size"><div class="settings-param__name">Размер иконок качества</div><div class="settings-param__value"></div></div>');
                var c = $('<div class="settings-param selector" data-type="select" data-name="qb_color"><div class="settings-param__name">Цвет иконок качества</div><div class="settings-param__value"></div></div>');
                var r = $('<div class="settings-param checkbox" data-name="qb_ratings"><div class="settings-param__name">Показывать рейтинги</div><div class="settings-param__value"></div></div>');
                
                var container = e.body.find('[data-name="card_view"]');
                if(container.length) {
                    container.after(c, s, r);
                    Lampa.Settings.serial(s);
                    Lampa.Settings.serial(c);
                    Lampa.Settings.serial(r);
                }
            }
        });

        Lampa.Storage.setDefault('qb_size', 'medium');
        Lampa.Storage.setDefault('qb_color', 'original');
        Lampa.Storage.setDefault('qb_ratings', true);

        var path = 'https://raw.githubusercontent.com/FoxStudio24/lampa/main/Quality/Quality_ico/';

        function draw() {
            $('.card:not(.qb-ok)').addClass('qb-ok').each(function() {
                var card = $(this);
                var item = card.data('item');
                
                if (item) {
                    // Сначала рисуем рейтинги (они есть в данных TMDB сразу)
                    if (Lampa.Storage.field('qb_ratings')) {
                        var ratings_html = $('<div class="qb-ratings-cont"></div>');
                        if (item.vote_average) {
                            var vote = parseFloat(item.vote_average).toFixed(1);
                            var color = vote >= 7 ? '#3bb33b' : '#aaa';
                            ratings_html.append('<div class="qb-rat-item" style="background:'+color+'">KP: '+vote+'</div>');
                        }
                        card.find('.card__view').append(ratings_html);
                    }

                    // Затем опрашиваем парсер для иконок качества
                    if (Lampa.Storage.field('parser_use')) {
                        Lampa.Parser.get({ search: item.title || item.name, movie: item, page: 1 }, function(res) {
                            if (res && res.Results) {
                                var best = { res: '', hdr: false, dv: false, audio: '', dub: false };
                                res.Results.slice(0, 15).forEach(function(r) {
                                    var t = (r.Title || '').toLowerCase();
                                    if (t.indexOf('4k') > -1 || t.indexOf('2160') > -1) best.res = '4K';
                                    else if ((t.indexOf('1080') > -1 || t.indexOf('fhd') > -1) && best.res !== '4K') best.res = 'FULL HD';
                                    if (t.indexOf('dv') > -1 || t.indexOf('vision') > -1) best.dv = true;
                                    if (t.indexOf('hdr') > -1) best.hdr = true;
                                    if (t.indexOf('7.1') > -1) best.audio = '7.1';
                                    else if (t.indexOf('5.1') > -1 && best.audio !== '7.1') best.audio = '5.1';
                                    if (t.indexOf('dub') > -1 || t.indexOf('дубл') > -1) best.dub = true;
                                });

                                var html = $('<div class="qb-cont"></div>');
                                var sz = Lampa.Storage.field('qb_size');
                                var cl = Lampa.Storage.field('qb_color');
                                
                                if (best.res) html.append('<img src="'+path+best.res+'.svg" class="qb-i qb-'+sz+' qb-c-'+cl+'">');
                                if (best.dv) html.append('<img src="'+path+'Dolby Vision.svg" class="qb-i qb-'+sz+' qb-c-'+cl+'">');
                                else if (best.hdr) html.append('<img src="'+path+'HDR.svg" class="qb-i qb-'+sz+' qb-c-'+cl+'">');
                                if (best.audio) html.append('<img src="'+path+best.audio+'.svg" class="qb-i qb-'+sz+' qb-c-'+cl+'">');
                                if (best.dub) html.append('<img src="'+path+'DUB.svg" class="qb-i qb-'+sz+' qb-c-'+cl+'">');
                                
                                if (html.children().length) card.find('.card__view').append(html);
                            }
                        });
                    }
                }
            });
        }

        setInterval(draw, 3000);

        $('body').append('<style>\
            .qb-cont { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; z-index: 20; pointer-events: none; }\
            .qb-ratings-cont { position: absolute; top: 8px; left: 8px; display: flex; flex-direction: column; gap: 4px; z-index: 20; }\
            .qb-rat-item { font-size: 10px; font-weight: bold; color: #fff; padding: 2px 5px; border-radius: 3px; text-shadow: 0 1px 2px rgba(0,0,0,0.5); box-shadow: 0 2px 4px rgba(0,0,0,0.3); }\
            .qb-i { display: block; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.8)); }\
            .qb-small { height: 12px; }\
            .qb-medium { height: 18px; }\
            .qb-large { height: 26px; }\
            .qb-c-white { filter: brightness(0) invert(1) drop-shadow(0 2px 2px #000); }\
            .qb-c-gold { filter: sepia(1) saturate(5) hue-rotate(10deg) brightness(1.1) drop-shadow(0 2px 2px #000); }\
            .card__view { position: relative; overflow: hidden; }\
        </style>');
    }

    if (window.Lampa) init();
    else {
        var t = setInterval(function() {
            if (window.Lampa) { clearInterval(t); init(); }
        }, 200);
    }
})();
