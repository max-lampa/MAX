(function () {
    'use strict';

    const PLUGIN_ID = 'adaptive_interface_size_plugin';
    const STYLE_ID = 'adaptive_interface_size_style';
    const STORAGE_KEY = 'interface_size_fixed';

    const SIZE_VALUES = ['_10', '_12', '_14', '_16', '_18', '_20', '_22', '_24', '_28', '_32'];

    const WIDTH_PRESETS = [
        { max: 900, size: '10' },
        { max: 1160, size: '12' },
        { max: 1360, size: '14' },
        { max: 1600, size: '16' },
        { max: 1920, size: '18' },
        { max: 2560, size: '20' },
        { max: 3200, size: '22' },
        { max: 3840, size: '24' },
        { max: 4480, size: '28' }
    ];

    if (window[PLUGIN_ID]) return;
    window[PLUGIN_ID] = true;

    function log() {
        // console.log('[Adaptive Interface Size]', ...arguments);
    }

    function normalizeSizeValue(value) {
        return String(value).replace(/^_/, '');
    }

    function getViewportWidth() {
        if (window.visualViewport && window.visualViewport.width) {
            return Math.round(window.visualViewport.width);
        }

        return Math.round(
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth ||
            1920
        );
    }

    function pickAutoSize() {
        const width = getViewportWidth();

        for (let i = 0; i < WIDTH_PRESETS.length; i++) {
            if (width < WIDTH_PRESETS[i].max) return WIDTH_PRESETS[i].size;
        }

        return '32';
    }

    function getStoredValue() {
        const value = String(Lampa.Storage.field(STORAGE_KEY) || '');

        if (value === '_auto') return '_auto';
        if (SIZE_VALUES.indexOf(value) >= 0) return value;

        return '_auto';
    }

    function getAppliedSize() {
        const selected = getStoredValue();
        return selected === '_auto' ? pickAutoSize() : normalizeSizeValue(selected);
    }

    function getDisplayValue() {
        const selected = getStoredValue();
        const applied = getAppliedSize();

        return selected === '_auto'
            ? 'Авто (' + applied + ')'
            : normalizeSizeValue(selected);
    }

    function ensureStyle() {
        let style = document.getElementById(STYLE_ID);

        if (!style) {
            style = document.createElement('style');
            style.id = STYLE_ID;
            document.head.appendChild(style);
        }

        style.textContent = `
            :root {
                --adaptive-interface-font-size: 16px;
            }

            html body {
                font-size: var(--adaptive-interface-font-size) !important;
            }

            .card--category {
                width: 16em !important;
            }
        `;
    }

    function applyFontSize() {
        const applied = parseInt(getAppliedSize(), 10) || 16;

        document.documentElement.style.setProperty(
            '--adaptive-interface-font-size',
            applied + 'px'
        );

        document.body.setAttribute(
            'data-interface-size-mode',
            getStoredValue() === '_auto' ? 'auto' : 'manual'
        );
        document.body.setAttribute('data-interface-size-applied', String(applied));

        log('Applied size:', applied, 'viewport width:', getViewportWidth());
    }

    function findValueNode(item) {
        if (!item || !item.length) return null;

        const selectors = [
            '.settings-param__value',
            '.settings-param-value',
            '.selector-value',
            '.selectbox-item__value',
            '.settings-folder__value',
            '.settings-item__descr',
            '.settings-item__value',
            '.settings-param .value',
            '.settings-item .value'
        ];

        for (let i = 0; i < selectors.length; i++) {
            const node = item.find(selectors[i]).first();
            if (node.length) return node;
        }

        return null;
    }

    function refreshSettingLabel() {
        try {
            const item = $('[data-name="' + STORAGE_KEY + '"]');
            const node = findValueNode(item);

            if (!node) return;

            node.text(getDisplayValue());
        } catch (e) {
            log('refreshSettingLabel error', e);
        }
    }

    function moveSettingItemToRightPlace(e) {
        if (!e || e.name !== 'interface') return;

        try {
            const item = e.body.find('[data-name="' + STORAGE_KEY + '"]');
            const anchor = e.body.find('[data-name="interface_size"]');

            if (item.length && anchor.length) {
                item.detach();
                item.insertAfter(anchor);
            }

            requestAnimationFrame(refreshSettingLabel);
        } catch (e) {
            log('moveSettingItemToRightPlace error', e);
        }
    }

    function refreshUI() {
        applyFontSize();
        refreshSettingLabel();
    }

    function debounce(fn, delay) {
        let timer = null;

        return function () {
            const ctx = this;
            const args = arguments;

            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(ctx, args);
            }, delay);
        };
    }

    function buildValues() {
        return {
            '_auto': Lampa.Lang.translate('settings_interface_size_auto'),
            '_10': '10',
            '_12': '12',
            '_14': '14',
            '_16': '16',
            '_18': '18',
            '_20': '20',
            '_22': '22',
            '_24': '24',
            '_28': '28',
            '_32': '32'
        };
    }

    function addTranslations() {
        Lampa.Lang.add({
            settings_interface_size_fixed: {
                be: 'Маштаб элементаў',
                bg: 'Мащаб на елементите',
                cs: 'Měřítko prvků',
                en: 'Element scale',
                he: 'קנה מידה של אלמנטים',
                pt: 'Escala dos elementos',
                ru: 'Масштаб элементов',
                uk: 'Масштаб елементів',
                zh: '元素缩放'
            },
            settings_interface_size_auto: {
                be: 'Аўта',
                bg: 'Авто',
                cs: 'Auto',
                en: 'Auto',
                he: 'אוטומטי',
                pt: 'Auto',
                ru: 'Авто',
                uk: 'Авто',
                zh: '自动'
            }
        });
    }

    function addSetting() {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: STORAGE_KEY,
                type: 'select',
                values: buildValues(),
                default: '_auto'
            },
            field: {
                name: Lampa.Lang.translate('settings_interface_size_fixed')
            },
            onChange: function () {
                refreshUI();

                try {
                    Lampa.Layer.update();
                } catch (e) {
                    log('Layer.update failed', e);
                }

                requestAnimationFrame(refreshSettingLabel);
            }
        });
    }

    function patchLayerUpdate() {
        const originalLayerUpdate = Lampa.Layer.update;

        Lampa.Layer.update = function (where) {
            applyFontSize();
            refreshSettingLabel();
            return originalLayerUpdate.call(this, where);
        };
    }

    function bindEvents() {
        const onResize = debounce(function () {
            if (getStoredValue() !== '_auto') return;

            refreshUI();

            try {
                Lampa.Layer.update();
            } catch (e) {
                log('Layer.update on resize failed', e);
            }
        }, 120);

        $(window)
            .off('resize.' + PLUGIN_ID)
            .on('resize.' + PLUGIN_ID, onResize);

        $(window)
            .off('orientationchange.' + PLUGIN_ID)
            .on('orientationchange.' + PLUGIN_ID, onResize);

        if (Lampa.Settings && Lampa.Settings.listener) {
            Lampa.Settings.listener.follow('open', moveSettingItemToRightPlace);
        }
    }

    function init() {
        ensureStyle();
        addTranslations();
        addSetting();
        patchLayerUpdate();
        bindEvents();

        refreshUI();

        try {
            Lampa.Layer.update();
        } catch (e) {
            log('Initial Layer.update failed', e);
        }

        requestAnimationFrame(refreshSettingLabel);
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();