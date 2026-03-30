(function () {
    'use strict';

    var KEY_SIZE   = 'bubble_clock_size';
    var KEY_WIDTH  = 'bubble_clock_scale';
    var KEY_RADIUS = 'bubble_clock_radius';
    var KEY_COLOR_H = 'bubble_clock_color_hours';
    var KEY_COLOR_M = 'bubble_clock_color_minutes';
    var KEY_COLOR_DOT = 'bubble_clock_color_dot';

    var COLOR_PALETTE = {
        '#ffffff': 'Белый',
        '#ff9100': 'Оранжевый',
        '#ff4444': 'Красный',
        '#44ff88': 'Зелёный',
        '#44aaff': 'Синий',
        '#ff44ff': 'Розовый',
        '#ffff44': 'Жёлтый',
        '#aaaaaa': 'Серый'
    };

    var settings_list = [
        { id: KEY_SIZE,      default: '1.5' },
        { id: KEY_WIDTH,     default: '1.0' },
        { id: KEY_RADIUS,    default: '20' },
        { id: KEY_COLOR_H,   default: '#ffffff' },
        { id: KEY_COLOR_M,   default: '#ff9100' },
        { id: KEY_COLOR_DOT, default: '#ff9100' }
    ];

    settings_list.forEach(function (opt) {
        if (Lampa.Storage.get(opt.id, 'unset') === 'unset') {
            Lampa.Storage.set(opt.id, opt.default);
        }
    });

    var blinkInterval = null;

    function applyStyles() {
        var clock = $('#custom-bubble-clock');
        if (!clock.length) return;

        var size   = Lampa.Storage.get(KEY_SIZE, '1.5');
        var scale  = Lampa.Storage.get(KEY_WIDTH, '1.0');
        var colorH = Lampa.Storage.get(KEY_COLOR_H, '#ffffff');
        var colorM = Lampa.Storage.get(KEY_COLOR_M, '#ff9100');
        var colorD = Lampa.Storage.get(KEY_COLOR_DOT, '#ff9100');

        clock.css({
            'font-size': size + 'em',
            'transform': 'scaleX(' + scale + ')',
            'transform-origin': 'right center'
        });

        clock.find('.clock-unit').eq(0).css('color', colorH);
        clock.find('.clock-unit').eq(1).css('color', colorM);
        clock.find('#clock-dots').css('color', colorD);
    }

    function startBlink() {
        if (blinkInterval) clearInterval(blinkInterval);
        blinkInterval = setInterval(function () {
            var dots = $('#clock-dots');
            if (dots.length) {
                dots.css('opacity', dots.css('opacity') === '0' ? '1' : '0');
            }
        }, 500);
    }

    Lampa.Component.add('bubble_clock_menu', function (object) {
        var scroll = new Lampa.Scroll({mask: true, over: true});

        this.create = function () {
            this.list = $('<div class="category-full"></div>');

            var sizeValues   = { '1.0': '1.0', '1.5': '1.5', '2.0': '2.0', '2.5': '2.5', '3.0': '3.0' };
            var scaleValues  = { '0.5': '0.5', '1.0': '1.0', '1.5': '1.5', '2.0': '2.0' };

            var numParams = [
                { title: 'Размер шрифта', name: KEY_SIZE,  values: sizeValues,  default: '1.5' },
                { title: 'Ширина (Scale)', name: KEY_WIDTH, values: scaleValues, default: '1.0' }
            ];

            numParams.forEach(function (item) {
                var value = Lampa.Storage.get(item.name, item.default);

                var row = $('<div class="settings-param selector" style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">' +
                    '<div class="settings-param__name">' + item.title + '</div>' +
                    '<div class="settings-param__value" style="color:#ff9100; font-size:1.2em;">' + value + '</div>' +
                '</div>');

                row.on('click tap hover:enter', function () {
                    var keys = Object.keys(item.values);
                    var idx = keys.indexOf(Lampa.Storage.get(item.name, item.default));
                    var next = keys[(idx + 1) % keys.length];
                    Lampa.Storage.set(item.name, next);
                    row.find('.settings-param__value').text(next);
                    applyStyles();
                });

                this.list.append(row);
            }.bind(this));

            var colorParams = [
                { title: 'Цвет часов', name: KEY_COLOR_H,   default: '#ffffff' },
                { title: 'Цвет минут', name: KEY_COLOR_M,   default: '#ff9100' },
                { title: 'Цвет точек', name: KEY_COLOR_DOT, default: '#ff9100' }
            ];

            colorParams.forEach(function (item) {
                var value = Lampa.Storage.get(item.name, item.default);

                var swatches = '';
                Object.keys(COLOR_PALETTE).forEach(function (hex) {
                    var border = (hex === value) ? '3px solid #fff' : '3px solid transparent';
                    swatches += '<span class="color-swatch" data-color="' + hex + '" style="display:inline-block; width:22px; height:22px; border-radius:50%; background:' + hex + '; margin:0 4px; border:' + border + '; cursor:pointer; vertical-align:middle;"></span>';
                });

                var row = $('<div class="settings-param" style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">' +
                    '<div class="settings-param__name" style="margin-bottom:8px;">' + item.title + '</div>' +
                    '<div class="color-swatches">' + swatches + '</div>' +
                '</div>');

                row.find('.color-swatch').on('click tap', function () {
                    var chosen = $(this).data('color');
                    Lampa.Storage.set(item.name, chosen);
                    row.find('.color-swatch').css('border', '3px solid transparent');
                    $(this).css('border', '3px solid #fff');
                    applyStyles();
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

        var colorH = Lampa.Storage.get(KEY_COLOR_H, '#ffffff');
        var colorM = Lampa.Storage.get(KEY_COLOR_M, '#ff9100');
        var colorD = Lampa.Storage.get(KEY_COLOR_DOT, '#ff9100');

        var clock = $([
            '<div id="custom-bubble-clock" style="display:flex; align-items:center; font-weight:900; margin-left:10px; z-index:100; pointer-events:none;">',
                '<div class="clock-unit" style="color:' + colorH + '; padding:2px 6px; margin:0 1px; letter-spacing:1px;">00</div>',
                '<div id="clock-dots" style="color:' + colorD + '; margin:0 2px; font-weight:900; line-height:1;">:</div>',
                '<div class="clock-unit" style="color:' + colorM + '; padding:2px 6px; margin:0 1px; letter-spacing:1px;">00</div>',
            '</div>'
        ].join(''));

        head.replaceWith(clock);

        function updateTime() {
            var now = new Date();
            clock.find('.clock-unit').eq(0).text(now.getHours().toString().padStart(2, '0'));
            clock.find('.clock-unit').eq(1).text(now.getMinutes().toString().padStart(2, '0'));
        }

        updateTime();
        setInterval(updateTime, 10000);

        startBlink();
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
                values: { '1.0': '1.0', '1.5': '1.5', '2.0': '2.0', '2.5': '2.5', '3.0': '3.0' },
                default: '1.5'
            },
            field: { name: 'Размер шрифта', description: 'Размер шрифту годинника' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'bubble_clock_menu',
            param: {
                name: KEY_WIDTH,
                type: 'select',
                values: { '0.5': '0.5', '1.0': '1.0', '1.5': '1.5', '2.0': '2.0' },
                default: '1.0'
            },
            field: { name: 'Ширина (Scale)', description: 'Масштаб ширини годинника' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'bubble_clock_menu',
            param: {
                name: KEY_COLOR_H,
                type: 'select',
                values: {
                    '#ffffff': 'Белый',
                    '#ff9100': 'Оранжевый',
                    '#ff4444': 'Красный',
                    '#44ff88': 'Зелёный',
                    '#44aaff': 'Синий',
                    '#ff44ff': 'Розовый',
                    '#ffff44': 'Жёлтый',
                    '#aaaaaa': 'Серый'
                },
                default: '#ffffff'
            },
            field: { name: 'Цвет часов', description: 'Колір цифр годин' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'bubble_clock_menu',
            param: {
                name: KEY_COLOR_M,
                type: 'select',
                values: {
                    '#ffffff': 'Белый',
                    '#ff9100': 'Оранжевый',
                    '#ff4444': 'Красный',
                    '#44ff88': 'Зелёный',
                    '#44aaff': 'Синий',
                    '#ff44ff': 'Розовый',
                    '#ffff44': 'Жёлтый',
                    '#aaaaaa': 'Серый'
                },
                default: '#ff9100'
            },
            field: { name: 'Цвет минут', description: 'Колір цифр хвилин' },
            onChange: applyStyles
        });

        Lampa.SettingsApi.addParam({
            component: 'bubble_clock_menu',
            param: {
                name: KEY_COLOR_DOT,
                type: 'select',
                values: {
                    '#ffffff': 'Белый',
                    '#ff9100': 'Оранжевый',
                    '#ff4444': 'Красный',
                    '#44ff88': 'Зелёный',
                    '#44aaff': 'Синий',
                    '#ff44ff': 'Розовый',
                    '#ffff44': 'Жёлтый',
                    '#aaaaaa': 'Серый'
                },
                default: '#ff9100'
            },
            field: { name: 'Цвет точек', description: 'Колір двокрапки між годинами і хвилинами' },
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