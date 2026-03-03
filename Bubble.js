(function () {  
    'use strict';  
  
    var KEY_SIZE = 'bubble_clock_size';  
    var KEY_WIDTH = 'bubble_clock_scale';  
    var KEY_RADIUS = 'bubble_clock_radius';  
  
    var settings_list = [  
        { id: KEY_SIZE, default: '1.5' },  
        { id: KEY_WIDTH, default: '1.0' },  
        { id: KEY_RADIUS, default: '20' }  
    ];  
  
    settings_list.forEach(function (opt) {  
        if (Lampa.Storage.get(opt.id, 'unset') === 'unset') {  
            Lampa.Storage.set(opt.id, opt.default);  
        }  
    });  
  
    function applyStyles() {  
        var clock = $('#custom-bubble-clock');  
        if (clock.length) {  
            var size = Lampa.Storage.get(KEY_SIZE, '1.5');  
            var scale = Lampa.Storage.get(KEY_WIDTH, '1.0');  
            var radius = Lampa.Storage.get(KEY_RADIUS, '20');  
  
            clock.css({  
                'font-size': size + 'em',  
                'transform': 'scaleX(' + scale + ')',  
                'transform-origin': 'right center'  
            });  
            clock.find('.clock-unit').css('border-radius', radius + 'px');  
        }  
    }  
  
    Lampa.Component.add('bubble_clock_menu', function (object) {  
        var _this = this;  
        var scroll = new Lampa.Scroll({mask: true, over: true});  
          
        this.create = function () {  
            this.list = $('<div class="category-full"></div>');  
  
            var params = [  
                { title: 'Размер шрифта', name: KEY_SIZE, default: '1.5' },  
                { title: 'Ширина (Scale)', name: KEY_WIDTH, default: '1.0' },  
                { title: 'Скругление (Bubble)', name: KEY_RADIUS, default: '20' }  
            ];  
  
            params.forEach(function (item) {  
                var value = Lampa.Storage.get(item.name, item.default);  
                var row = $('<div class="settings-param selector" style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">' +  
                    '<div class="settings-param__name">' + item.title + '</div>' +  
                    '<div class="settings-param__value" style="color: #ff9100; font-size: 1.2em;">' + value + '</div>' +  
                '</div>');  
  
                row.on('click tap hover:enter', function () {  
                    Lampa.Input.box('Значение', value, function (new_val) {  
                        if (new_val) {  
                            Lampa.Storage.set(item.name, new_val);  
                            row.find('.settings-param__value').text(new_val);  
                            applyStyles();  
                        }  
                    });  
                });  
  
                this.list.append(row);  
            }.bind(this));  
  
            return scroll.render();  
        };  
          
        this.toggle = function () {  
            Lampa.Controller.collectionSet(this.render());  
            Lampa.Controller.toggle('content');  
        };  
          
        this.render = function () {  
            scroll.append(this.list);  
            return scroll.render();  
        };  
    });  
  
    function createClock() {  
        if ($('#custom-bubble-clock').length) return;  
        var head = $('.head__time');  
        if (!head.length) return;  
  
        var clock = $('<div id="custom-bubble-clock" style="display:flex; align-items:center; font-weight:bold; margin-left:10px; z-index:100; pointer-events: none;">' +  
            '<div class="clock-unit" style="color:#fff; background:rgba(255,255,255,0.25); padding:2px 10px; margin:0 2px;">00</div>' +  
            '<div style="color:#ff9100; margin:0 2px;">:</div>' +  
            '<div class="clock-unit" style="color:#ff9100; background:rgba(255,255,255,0.25); padding:2px 10px; margin:0 2px;">00</div>' +  
        '</div>');  
  
        head.replaceWith(clock);  
  
        setInterval(function () {  
            var now = new Date();  
            clock.find('.clock-unit').eq(0).text(now.getHours().toString().padStart(2, '0'));  
            clock.find('.clock-unit').eq(1).text(now.getMinutes().toString().padStart(2, '0'));  
        }, 5000);  
  
        applyStyles();  
    }  
  
    function setupSettings() {  
        Lampa.SettingsApi.addComponent({  
            component: 'bubble_clock_menu',  
            name: 'Часы Bubble',  
            icon: '<svg height="24" viewBox="0 0 24 24" width="24" fill="#fff"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.1.8-1.2-4.5-2.7V7z"/></svg>'  
        });  
  
        Lampa.SettingsApi.addParam({  
            component: 'bubble_clock_menu',  
            param: {  
                name: KEY_SIZE,  
                type: 'select',  
                values: {  
                    '1.0': '1.0',  
                    '1.5': '1.5',  
                    '2.0': '2.0',  
                    '2.5': '2.5',  
                    '3.0': '3.0'  
                },  
                default: '1.5'  
            },  
            field: {  
                name: 'Размер шрифта',  
                description: 'Размер шрифту годинника'  
            },  
            onChange: applyStyles  
        });  
  
        Lampa.SettingsApi.addParam({  
            component: 'bubble_clock_menu',  
            param: {  
                name: KEY_WIDTH,  
                type: 'select',  
                values: {  
                    '0.5': '0.5',  
                    '1.0': '1.0',  
                    '1.5': '1.5',  
                    '2.0': '2.0'  
                },  
                default: '1.0'  
            },  
            field: {  
                name: 'Ширина (Scale)',  
                description: 'Масштаб ширини годинника'  
            },  
            onChange: applyStyles  
        });  
  
        Lampa.SettingsApi.addParam({  
            component: 'bubble_clock_menu',  
            param: {  
                name: KEY_RADIUS,  
                type: 'select',  
                values: {  
                    '10': '10',  
                    '15': '15',  
                    '20': '20',  
                    '25': '25',  
                    '30': '30'  
                },  
                default: '20'  
            },  
            field: {  
                name: 'Скруглення (Bubble)',  
                description: 'Радіус скруглення кутів'  
            },  
            onChange: applyStyles  
        });  
    }  
  
    function init() {  
        createClock();  
    }  
  
    function startPlugin() {  
        setupSettings();  
        init();  
    }  
  
    if (window.appready) startPlugin();  
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });  
})();
