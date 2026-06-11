(function () {
    'use strict';

    var PLUGIN_ID = 'nuvio_badges';
    var COMPONENT_ID = 'nuvio_badges_component';
    var SOURCE_URL = 'https://gist.githubusercontent.com/anupamparida/f1877b01573637c1616d81de0e80a2cc/raw/17e5d1cca70e45a030e036cfb23fac145f0ab6f6/Nuvio_badges.json';

    var state = {
        loaded: false,
        enabled: true,
        filters: [],
        disabledMap: {},
        observer: null,
        scanTimer: 0
    };

    function storageGet(key, fallback) {
        try {
            if (window.Lampa && Lampa.Storage) return Lampa.Storage.get(key, fallback);
        } catch (e) {}
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e2) {
            return fallback;
        }
    }

    function storageSet(key, value) {
        try {
            if (window.Lampa && Lampa.Storage) {
                Lampa.Storage.set(key, value);
                return;
            }
        } catch (e) {}
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e2) {}
    }

    function argbToCss(color, fallback) {
        if (!color || typeof color !== 'string') return fallback || 'transparent';
        if (!/^#[0-9a-fA-F]{8}$/.test(color)) return color;

        var a = parseInt(color.slice(1, 3), 16) / 255;
        var r = parseInt(color.slice(3, 5), 16);
        var g = parseInt(color.slice(5, 7), 16);
        var b = parseInt(color.slice(7, 9), 16);

        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a.toFixed(3) + ')';
    }

    function compilePattern(pattern, name) {
        if (!pattern || typeof pattern !== 'string') {
            return new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        }

        var cleaned = pattern.replace(/\(\?i\)/g, '');
        try {
            return new RegExp(cleaned, 'iu');
        } catch (e) {
            try {
                return new RegExp(cleaned, 'i');
            } catch (e2) {
                return new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            }
        }
    }

    function injectStyles() {
        if (document.getElementById('nuvio-badges-style')) return;

        var style = document.createElement('style');
        style.id = 'nuvio-badges-style';
        style.textContent = '' +
            '.nuvio-badges{display:inline-flex;flex-wrap:wrap;gap:4px;margin-left:8px;vertical-align:middle}' +
            '.nuvio-badge{display:inline-flex;align-items:center;height:18px;line-height:18px;padding:0 6px;border-radius:5px;font-size:11px;font-weight:600;letter-spacing:.2px;box-sizing:border-box;border:1px solid transparent}' +
            '.nuvio-badge img{height:12px;max-width:58px;display:block}';
        document.head.appendChild(style);
    }

    function fetchJson(url, onSuccess, onError) {
        if (window.Lampa && Lampa.Reguest && typeof Lampa.Reguest.native === 'function') {
            Lampa.Reguest.native(url, function (data) {
                try {
                    var parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    onSuccess(parsed);
                } catch (e) {
                    onError(e);
                }
            }, onError, false, { dataType: 'text' });
            return;
        }

        fetch(url)
            .then(function (r) { return r.json(); })
            .then(onSuccess)
            .catch(onError);
    }

    function normalizeText(text) {
        return String(text || '').replace(/\s+/g, ' ').trim();
    }

    function getActiveFilters() {
        return state.filters.filter(function (f) {
            return !state.disabledMap[f.id];
        });
    }

    function renderBadgesForNode(node) {
        if (!state.enabled || !state.loaded || !node || !node.isConnected) return;

        var text = normalizeText(node.textContent);
        if (!text) return;

        var host = node.parentElement || node;
        if (!host) return;

        var old = host.querySelector(':scope > .nuvio-badges');
        if (old) old.remove();

        var matches = [];
        var active = getActiveFilters();

        for (var i = 0; i < active.length; i++) {
            var filter = active[i];
            try {
                if (filter.regex.test(text)) matches.push(filter);
            } catch (e) {}
        }

        if (!matches.length) return;

        var wrap = document.createElement('span');
        wrap.className = 'nuvio-badges';

        for (var j = 0; j < matches.length; j++) {
            var item = matches[j];
            var badge = document.createElement('span');
            badge.className = 'nuvio-badge';
            badge.style.background = argbToCss(item.tagColor || item.color, 'rgba(0,0,0,.2)');
            badge.style.borderColor = argbToCss(item.borderColor, 'transparent');
            badge.style.color = argbToCss(item.textColor, '#fff');
            badge.title = item.name;

            if (item.imageURL) {
                var img = document.createElement('img');
                img.src = item.imageURL;
                img.alt = item.name;
                img.loading = 'lazy';
                img.referrerPolicy = 'no-referrer';
                badge.appendChild(img);
            } else {
                badge.textContent = item.name;
            }

            wrap.appendChild(badge);
        }

        host.appendChild(wrap);
    }

    function findCandidateNodes(root) {
        var selectors = [
            '.online-prestige__title',
            '.online-prestige__name',
            '.online__title',
            '.online__name',
            '.torrent-item__name',
            '.selectbox-item__name',
            '.files__item-name',
            '.explorer-card__title',
            '.full-start-new__title',
            '.search-source__title',
            '[data-title]',
            '[class*="name"]',
            '[class*="title"]'
        ];

        var scope = root && root.querySelectorAll ? root : document;
        var out = [];

        for (var i = 0; i < selectors.length; i++) {
            var list = scope.querySelectorAll(selectors[i]);
            for (var j = 0; j < list.length; j++) {
                var el = list[j];
                if (!el || !el.textContent) continue;
                if (el.classList.contains('nuvio-badges')) continue;
                out.push(el);
            }
        }

        return out;
    }

    function rescan(root) {
        if (!state.enabled || !state.loaded) return;
        var nodes = findCandidateNodes(root);
        for (var i = 0; i < nodes.length; i++) renderBadgesForNode(nodes[i]);
    }

    function scheduleRescan(root) {
        clearTimeout(state.scanTimer);
        state.scanTimer = setTimeout(function () {
            rescan(root || document);
        }, 120);
    }

    function startObserver() {
        if (state.observer || !document.body) return;

        state.observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
                    scheduleRescan(document);
                    return;
                }
            }
        });

        state.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: false
        });
    }

    function registerSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;

        try {
            Lampa.SettingsApi.addComponent({
                component: COMPONENT_ID,
                name: 'Nuvio badges',
                icon: '<svg width="512" height="512" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 4h14a1 1 0 0 1 1 1v8a6 6 0 0 1-12 0V6H6v7a6 6 0 0 0 12 0V6H5a1 1 0 1 1 0-2Z" fill="currentColor"/></svg>'
            });
        } catch (e) {}

        try {
            Lampa.SettingsApi.addParam({
                component: COMPONENT_ID,
                param: {
                    name: PLUGIN_ID + '_enabled',
                    type: 'select',
                    values: {
                        true: 'Вкл',
                        false: 'Выкл'
                    },
                    default: String(state.enabled)
                },
                field: {
                    name: 'Показывать бейджи'
                },
                onChange: function (value) {
                    state.enabled = String(value) === 'true';
                    storageSet(PLUGIN_ID + '_enabled', state.enabled);
                    scheduleRescan(document);
                }
            });
        } catch (e2) {}

        for (var i = 0; i < state.filters.length; i++) {
            (function (filter) {
                try {
                    Lampa.SettingsApi.addParam({
                        component: COMPONENT_ID,
                        param: {
                            name: PLUGIN_ID + '_badge_' + filter.id,
                            type: 'select',
                            values: {
                                true: 'Вкл',
                                false: 'Выкл'
                            },
                            default: String(!state.disabledMap[filter.id])
                        },
                        field: {
                            name: filter.name
                        },
                        onChange: function (value) {
                            var isOn = String(value) === 'true';
                            state.disabledMap[filter.id] = !isOn;
                            storageSet(PLUGIN_ID + '_disabled', state.disabledMap);
                            scheduleRescan(document);
                        }
                    });
                } catch (e3) {}
            })(state.filters[i]);
        }
    }

    function prepareFilters(data) {
        var filters = Array.isArray(data && data.filters) ? data.filters : [];

        state.filters = filters
            .filter(function (f) { return f && f.id && f.name; })
            .map(function (f) {
                return {
                    id: String(f.id),
                    name: String(f.name),
                    imageURL: f.imageURL || '',
                    tagColor: f.tagColor || f.color || '#00000000',
                    borderColor: f.borderColor || '#00000000',
                    textColor: f.textColor || '#FFFFFFFF',
                    regex: compilePattern(f.pattern || '', String(f.name))
                };
            });
    }

    function start() {
        state.enabled = storageGet(PLUGIN_ID + '_enabled', true) !== false;
        state.disabledMap = storageGet(PLUGIN_ID + '_disabled', {}) || {};

        injectStyles();

        fetchJson(SOURCE_URL, function (json) {
            prepareFilters(json);
            state.loaded = true;
            registerSettings();
            startObserver();
            scheduleRescan(document);
            console.log('[' + PLUGIN_ID + '] loaded filters:', state.filters.length);
        }, function (err) {
            console.error('[' + PLUGIN_ID + '] load error', err);
        });
    }

    function initPlugin() {
        if (window.__nuvioBadgesReady) return;
        window.__nuvioBadgesReady = true;
        start();
    }

    if (window.appready) initPlugin();
    else {
        document.addEventListener('lampa:ready', initPlugin);
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (event) {
                if (event && event.type === 'ready') initPlugin();
            });
        }
    }
})();