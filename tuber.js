(function () {
    'use strict';

    function init() {
        // Список каналов из оригинального Likhtar Studios
        var channels = [
            { title: 'BadComedian', id: 'UC6cq7zxyRbeT_m7TshSthRA' },
            { title: 'Кинопоиск', id: 'UC9907-Yatp_Xf7XED2_j9rA' },
            { title: 'Cut The Crap', id: 'UC696-pGatn9Mv_XU6_o0xOA' },
            { title: '...And Action!', id: 'UCmYv0_66XfR3v5K8_8W6wlg' },
            { title: 'ЧБУ', id: 'UCp29R59vO_S4qAisNghrSdw' },
            { title: 'GreenGrass', id: 'UC6M0_Xf7XED2_j9rAXf7XED2' },
            { title: 'SNDK', id: 'UC_7XED2_j9rAXf7XED2_j9rA' }
        ];

        // Добавляем пункт в левое меню
        Lampa.Component.add('kinoreview', function (object) {
            var network = new Lampa.Reguest();
            var scroll = new Lampa.Scroll({mask:true, over:true});
            var items = [];
            
            this.create = function () {
                var _this = this;
                this.activity.loader(true);
                
                // Формируем ленту
                channels.forEach(function(chan) {
                    var item = Lampa.Template.get('button', {title: chan.title});
                    item.on('hover:focus', function(){
                        // Здесь логика предпросмотра, если нужно
                    }).on('hover:enter', function(){
                        // Открываем YouTube канал через стандартный механизм Lampa
                        Lampa.Activity.push({
                            url: chan.id,
                            title: chan.title,
                            component: 'youtube',
                            page: 1
                        });
                    });
                    items.push(item);
                });

                this.activity.loader(false);
                return scroll.render();
            };

            this.render = function () {
                var _this = this;
                items.forEach(function(item){
                    scroll.append(item);
                });
                return scroll.render();
            };
        });

        // Регистрируем кнопку в меню
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                var menu_item = $('<div class="menu__item selector" data-action="kinoreview">' +
                    '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" fill="white"/></svg>' +
                    '<span class="menu__text">Кинообзоры</span>' +
                    '</div>');

                menu_item.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: '',
                        title: 'Кинообзоры',
                        component: 'kinoreview',
                        page: 1
                    });
                });

                $('.menu .menu__list').append(menu_item);
            }
        });
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();
