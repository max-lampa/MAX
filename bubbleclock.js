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