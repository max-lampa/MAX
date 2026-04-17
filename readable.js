(function () {
    // Безопасные утилиты
    var ColorPlugin = {
        id: 'color_plugin',
        settings: {
            enabled: true,
            main_color: '#ff5722',
            highlight_enabled: true,
            dimming_enabled: false
        },
        storage_prefix: 'color_plugin_',
        styleEl: null,
        pickerEl: null,
        rafApply: null
    };

    // Load saved settings
    function loadSettings() {
        try {
            if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.get === 'function') {
                Object.keys(ColorPlugin.settings).forEach(function (k) {
                    var v = Lampa.Storage.get(ColorPlugin.storage_prefix + k);
                    if (typeof v !== 'undefined' && v !== null) {
                        if (v === 'true' || v === 'false') {
                            ColorPlugin.settings[k] = v === 'true';
                        } else {
                            ColorPlugin.settings[k] = v;
                        }
                    }
                });
            } else if (window.localStorage) {
                Object.keys(ColorPlugin.settings).forEach(function (k) {
                    var v = localStorage.getItem(ColorPlugin.storage_prefix + k);
                    if (v !== null && typeof v !== 'undefined') {
                        if (v === 'true' || v === 'false') {
                            ColorPlugin.settings[k] = v === 'true';
                        } else {
                            ColorPlugin.settings[k] = v;
                        }
                    }
                });
            }
        } catch (e) {
            console.warn('ColorPlugin loadSettings error', e);
        }
    }

    // Save single setting
    function saveSetting(key, value) {
        ColorPlugin.settings[key] = value;
        var sVal = (typeof value === 'boolean') ? value.toString() : value;
        try {
            if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.set === 'function') {
                Lampa.Storage.set(ColorPlugin.storage_prefix + key, sVal);
            }
            if (window.localStorage) localStorage.setItem(ColorPlugin.storage_prefix + key, sVal);
        } catch (e) {
            /* ignore storage errors */
        }
        scheduleApplyStyles();
    }

    // Debounced apply styles (rAF)
    function scheduleApplyStyles() {
        if (ColorPlugin.rafApply) cancelAnimationFrame(ColorPlugin.rafApply);
        ColorPlugin.rafApply = requestAnimationFrame(function () {
            applyStyles();
            // if Lampa has a UI render refresh
            if (window.Lampa && Lampa.Settings && typeof Lampa.Settings.render === 'function') {
                Lampa.Settings.render();
            }
            ColorPlugin.rafApply = null;
        });
    }

    // Apply CSS variables / styles to page
    function applyStyles() {
        if (!ColorPlugin.styleEl) {
            ColorPlugin.styleEl = document.createElement('style');
            ColorPlugin.styleEl.setAttribute('data-color-plugin', 'true');
            document.head.appendChild(ColorPlugin.styleEl);
        }
        if (!ColorPlugin.settings.enabled) {
            ColorPlugin.styleEl.textContent = ''; // clear styles
            return;
        }

        // Example variables and rules — адаптируйте селекторы под тему Lampa, если надо
        var main = ColorPlugin.settings.main_color || '#ff5722';
        var highlight = ColorPlugin.settings.highlight_enabled ? lighten(main, 0.2) : main;
        var dim = ColorPlugin.settings.dimming_enabled ? 'rgba(0,0,0,0.45)' : 'transparent';

        // CSS: используем CSS-переменные, выделение фокуса, подсветки карточек и overlay dim
        ColorPlugin.styleEl.textContent = ''
            + ':root{--plugin-main-color:' + main + ';--plugin-highlight:' + highlight + ';--plugin-dim:' + dim + '}'
            // Основная подсветка для активных элементов
            + '.content .card:focus, .content .card.active { outline: 2px solid var(--plugin-main-color) !important; box-shadow: 0 0 12px var(--plugin-highlight) !important; }'
            + '.list .title, .list .subtitle { color: var(--plugin-main-color) !important; }'
            + '.overlay-color-dim { position:fixed; inset:0; pointer-events:none; background:' + dim + '; z-index:9998; }'
            + '.color-plugin-picker { position: fixed; left:50%; top:50%; transform:translate(-50%,-50%); z-index:9999; background: #0f0f0f; color:#fff; padding:16px; border-radius:8px; max-width:720px; width:92%; box-shadow: 0 8px 30px rgba(0,0,0,0.6); }'
            + '.color-plugin-picker h3{ margin:0 0 12px 0; font-size:18px }'
            + '.color-grid{ display:grid; grid-template-columns: repeat(auto-fill,minmax(48px,1fr)); gap:8px; }'
            + '.color-cell{ width:48px; height:48px; border-radius:6px; cursor:pointer; outline:none; }'
            + '.color-cell.focus{ transform: scale(1.08); box-shadow:0 0 10px rgba(255,255,255,0.12); border:2px solid #fff; }'
            + '.color-actions{ display:flex; gap:8px; margin-top:12px; justify-content:flex-end }'
            + '.color-button{ background:#222; color:#fff; padding:8px 12px; border-radius:6px; cursor:pointer }'
            + '.color-button:focus{ outline:2px solid var(--plugin-main-color) }'
            ;
    }

    // Simple color lighten helper (works with hex)
    function lighten(hex, lum) {
        try {
            hex = String(hex).replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            lum = lum || 0;

            var rgb = "#", c, i;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substr(i * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += ("00" + c).substr(c.length);
            }
            return rgb;
        } catch (e) {
            return hex;
        }
    }

    // Create color picker modal
    function openColorPicker() {
        // Prevent multiple
        if (ColorPlugin.pickerEl) return;

        // Palette: набор цветов для ТВ — достаточно крупная сетка
        var palette = [
            '#000000','#222222','#444444','#666666','#888888','#aaaaaa','#cccccc','#ffffff',
            '#ff0000','#ff7f00','#ffff00','#7fff00','#00ff00','#00ff7f','#00ffff','#007fff',
            '#0000ff','#7f00ff','#ff00ff','#ff007f',
            '#ff5722','#ff9800','#ffc107','#8bc34a','#4caf50','#009688','#03a9f4','#2196f3',
            '#3f51b5','#9c27b0','#e91e63','#f44336','#795548','#607d8b'
        ];

        // Modal root
        var container = document.createElement('div');
        container.className = 'color-plugin-picker';
        container.setAttribute('role', 'dialog');
        container.setAttribute('aria-modal', 'true');
        container.innerHTML = '<h3>' + (window.Lampa && Lampa.Lang ? Lampa.Lang.translate('main_color') : 'Choose color') + '</h3>';

        var grid = document.createElement('div');
        grid.className = 'color-grid';
        grid.setAttribute('tabindex', '-1');

        // build cells
        palette.forEach(function (c, idx) {
            var cell = document.createElement('button');
            cell.className = 'color-cell';
            cell.style.background = c;
            cell.setAttribute('data-color', c);
            cell.setAttribute('data-index', idx);
            cell.setAttribute('aria-label', c);
            cell.setAttribute('tabindex', '-1');
            grid.appendChild(cell);
        });

        // actions
        var actions = document.createElement('div');
        actions.className = 'color-actions';
        var btnCancel = document.createElement('button');
        btnCancel.className = 'color-button';
        btnCancel.textContent = (window.Lampa && Lampa.Lang ? Lampa.Lang.translate('close') : 'Close');
        var btnSelect = document.createElement('button');
        btnSelect.className = 'color-button';
        btnSelect.textContent = (window.Lampa && Lampa.Lang ? Lampa.Lang.translate('save') : 'Select');

        actions.appendChild(btnCancel);
        actions.appendChild(btnSelect);

        container.appendChild(grid);
        container.appendChild(actions);

        document.body.appendChild(container);
        ColorPlugin.pickerEl = container;

        // overlay for dimming if enabled
        if (ColorPlugin.settings.dimming_enabled) {
            var overlay = document.createElement('div');
            overlay.className = 'overlay-color-dim';
            overlay.setAttribute('data-color-plugin-overlay', 'true');
            document.body.appendChild(overlay);
        }

        // Focus/navigation state
        var cells = Array.prototype.slice.call(grid.querySelectorAll('.color-cell'));
        var cols = Math.max(6, Math.floor((grid.clientWidth || 480) / 56)); // estimate, dynamic adjust not strictly necessary
        var focused = Math.max(0, cells.findIndex(function (c) { return c.getAttribute('data-color') === ColorPlugin.settings.main_color; }));
        if (focused === -1) focused = 0;
        setFocusOnCell(cells, focused);

        // Key handling: arrow keys + Enter + Back
        function onKey(e) {
            var code = e.keyCode || e.which;
            // remote key codes often map to arrow keys and backspace/escape/enter
            var handled = true;
            if (code === 37) { // left
                focused = Math.max(0, focused - 1);
            } else if (code === 39) { // right
                focused = Math.min(cells.length - 1, focused + 1);
            } else if (code === 38) { // up
                focused = Math.max(0, focused - cols);
            } else if (code === 40) { // down
                focused = Math.min(cells.length - 1, focused + cols);
            } else if (code === 13) { // enter
                selectColor(cells[focused].getAttribute('data-color'));
            } else if (code === 8 || code === 461 || code === 27) { // backspace / android back / esc
                closePicker();
            } else {
                handled = false;
            }
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
                setFocusOnCell(cells, focused);
            }
        }

        // Mouse/Click support
        function onClickCell(e) {
            var c = e.currentTarget.getAttribute('data-color');
            selectColor(c);
        }

        cells.forEach(function (cell, idx) {
            cell.addEventListener('click', onClickCell);
            cell.addEventListener('focus', function () { setFocusOnCell(cells, idx); });
        });

        btnCancel.addEventListener('click', closePicker);
        btnSelect.addEventListener('click', function () {
            var c = cells[focused] && cells[focused].getAttribute('data-color');
            if (c) selectColor(c);
        });

        // Focus visually
        function setFocusOnCell(list, idx) {
            list.forEach(function (el) { el.classList.remove('focus'); });
            var el = list[idx];
            if (!el) return;
            el.classList.add('focus');
            // ensure visible
            el.scrollIntoView({block: 'nearest', inline: 'nearest'});
            // move DOM focus to the cell for accessibility
            try { el.focus(); } catch (e) {}
        }

        function selectColor(c) {
            // user selected: save and close
            saveSetting('main_color', c);
            closePicker();
        }

        function closePicker() {
            // cleanup
            document.removeEventListener('keydown', onKey, true);
            cells.forEach(function (cell) {
                cell.removeEventListener('click', onClickCell);
            });
            if (ColorPlugin.pickerEl) {
                var ov = document.querySelector('[data-color-plugin-overlay]');
                if (ov) ov.parentNode.removeChild(ov);
                ColorPlugin.pickerEl.parentNode.removeChild(ColorPlugin.pickerEl);
                ColorPlugin.pickerEl = null;
            }
        }

        // attach handler
        setTimeout(function () {
            // delay to avoid immediate back close
            document.addEventListener('keydown', onKey, true);
        }, 50);
    }

    // Helper: get element by Lampa Settings item (render callback may provide jQuery-like)
    function showOrHideItem(item, visible) {
        if (!item) return;
        if (typeof item.css === 'function') {
            item.css('display', visible ? 'block' : 'none');
            return;
        }
        try {
            if (item.style) item.style.display = visible ? 'block' : 'none';
        } catch (e) {}
    }

    // Register settings in Lampa.SettingsApi
    function registerSettings() {
        if (!window.Lampa || !Lampa.SettingsApi || !Lampa.SettingsApi.addParam) {
            console.warn('ColorPlugin: Lampa.SettingsApi not found');
            return;
        }

        // enabled toggle
        Lampa.SettingsApi.addParam({
            component: ColorPlugin.id,
            param: {
                name: ColorPlugin.storage_prefix + 'enabled',
                type: 'trigger',
                default: ColorPlugin.settings.enabled.toString()
            },
            field: {
                name: Lampa.Lang.translate('enable_plugin') || 'Enable plugin',
                description: Lampa.Lang.translate('enable_plugin_description') || ''
            },
            onRender: function (item) {
                // always visible
                if (item && typeof item.css === 'function') item.css('display', 'block');
            },
            onChange: function (value) {
                var v = (value === 'true' || value === true);
                saveSetting('enabled', v);
            }
        });

        // main color button
        Lampa.SettingsApi.addParam({
            component: ColorPlugin.id,
            param: {
                name: ColorPlugin.storage_prefix + 'main_color',
                type: 'button'
            },
            field: {
                name: Lampa.Lang.translate('main_color') || 'Main color',
                description: Lampa.Lang.translate('main_color_description') || ''
            },
            onRender: function (item) {
                showOrHideItem(item, !!ColorPlugin.settings.enabled);
            },
            onChange: function () {
                openColorPicker();
            }
        });

        // highlight toggle
        Lampa.SettingsApi.addParam({
            component: ColorPlugin.id,
            param: {
                name: ColorPlugin.storage_prefix + 'highlight_enabled',
                type: 'trigger',
                default: ColorPlugin.settings.highlight_enabled.toString()
            },
            field: {
                name: Lampa.Lang.translate('enable_highlight') || 'Enable highlight',
                description: Lampa.Lang.translate('enable_highlight_description') || ''
            },
            onRender: function (item) {
                showOrHideItem(item, !!ColorPlugin.settings.enabled);
            },
            onChange: function (value) {
                saveSetting('highlight_enabled', value === 'true');
            }
        });

        // dimming toggle
        Lampa.SettingsApi.addParam({
            component: ColorPlugin.id,
            param: {
                name: ColorPlugin.storage_prefix + 'dimming_enabled',
                type: 'trigger',
                default: ColorPlugin.settings.dimming_enabled.toString()
            },
            field: {
                name: Lampa.Lang.translate('enable_dimming') || 'Enable dimming',
                description: Lampa.Lang.translate('enable_dimming_description') || ''
            },
            onRender: function (item) {
                showOrHideItem(item, !!ColorPlugin.settings.enabled);
            },
            onChange: function (value) {
                saveSetting('dimming_enabled', value === 'true');
            }
        });
    }

    // Initialize plugin
    function init() {
        loadSettings();
        applyStyles();
        registerSettings();

        // ensure that when user changes settings in other ways, we can re-apply
        // expose openColorPicker for external calls
        window.ColorPlugin = window.ColorPlugin || {};
        window.ColorPlugin.openColorPicker = openColorPicker;
        window.ColorPlugin.settings = ColorPlugin.settings;
    }

    // Run init when Lampa ready
    if (window.Lampa && Lampa.SettingsApi) {
        init();
    } else {
        // wait for Lampa to be ready (simple poll)
        var tries = 0;
        var readyInterval = setInterval(function () {
            tries++;
            if (window.Lampa && Lampa.SettingsApi) {
                clearInterval(readyInterval);
                init();
            } else if (tries > 50) {
                clearInterval(readyInterval);
                // still initialize basic functionality for direct page usage
                init();
            }
        }, 200);
    }
})();
