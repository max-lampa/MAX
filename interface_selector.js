(function () {
    'use strict';

    if (window.lampac_interface_selector_ready) return;
    window.lampac_interface_selector_ready = true;

    var COMPONENT = 'lampac_interface_selector';
    var SELECT_PARAM = 'lampac_interface_variant';
    var PROMPT_PARAM = 'lampac_interface_prompt_done';
    var INTERFACE_SIZE_PARAM = 'interface_size';
    var INTERFACE_SIZE_VALUE = 'small';
    var DEFAULT_ID = 'default';

    var DEFAULT_OPTION = {
        id: DEFAULT_ID,
        name: 'Стандартный стиль карточек',
        description: 'Дополнительные стили карточек выключены'
    };

    // Добавляй и переименовывай варианты здесь. status оставляем 0:
    // менеджер сам включит только выбранный стиль карточек.
    var INTERFACE_PLUGINS = [
        {
            id: 'horizontal',
            url: '{localhost}/plugins/ваш.js',
            status: 0,
            name: 'Имя отображаемое в карточке',
            description: 'Описание отображаемое в карточке'
        },
        {
            id: 'vertical_premium',
            url: '{localhost}/plugins/ваш.js',
            status: 0,
            name: '',
            description: ''
        },
        {
            id: 'classic',
            url: '{localhost}/plugins/ваш.js',
            status: 0,
            name: '{localhost}/plugins/ваш.js',
            description: ''
        }
    ];

    var ICON = '<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="4" y="6" width="30" height="24" rx="4" stroke="currentColor" stroke-width="3"/>' +
        '<path d="M10 14h18M10 20h12M10 26h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
        '</svg>';

    var accessNetwork;
    var accessPending = false;
    var choiceActive = false;
    var choiceButtons = [];
    var choiceIndex = 0;
    var choiceContainer;
    var choiceKeyDownHandler;
    var choiceKeyUpHandler;
    var choicePreviousController = null;
    var modalLocked = false;
    var modalOriginalClose;
    var hiddenLoadedUrl = '';

    var CHOICE_CONTROLLER = 'lampac_card_style_choice';
    var KEY_LEFT = [37, 21];
    var KEY_UP = [38, 19, 29460];
    var KEY_RIGHT = [39, 22];
    var KEY_DOWN = [40, 20, 29461];
    var KEY_OK = [13, 23, 66, 29443, 65376];
    var KEY_BACK = [4, 8, 27, 461, 10009, 196, 65367];

    function hasLampa() {
        return typeof window !== 'undefined' && window.Lampa && Lampa.Storage;
    }

    function host() {
        var remote = (window.lampa_url || '').toString().replace(/\/+$/, '');
        if (/^https?:\/\//i.test(remote)) return remote;

        if (window.location && window.location.host) {
            return window.location.protocol + '//' + window.location.host;
        }

        return '';
    }

    function normalizeUrl(url) {
        return (url || '').toString().replace(/\{localhost\}/g, host());
    }

    function addUrlComponent(url, component) {
        if (Lampa.Utils && Lampa.Utils.addUrlComponent) {
            return Lampa.Utils.addUrlComponent(url, component);
        }

        return url + (url.indexOf('?') === -1 ? '?' : '&') + component;
    }

    function canonicalUrl(url) {
        return normalizeUrl(url)
            .replace(/[?#].*$/, '')
            .replace(/\/+$/, '')
            .toLowerCase();
    }

    function managedUrls() {
        var urls = INTERFACE_PLUGINS.map(function (item) {
            return canonicalUrl(item.url);
        });

        return urls;
    }

    function getSelection(fallback) {
        if (!hasLampa()) return fallback || DEFAULT_ID;

        var selected = Lampa.Storage.get(SELECT_PARAM, fallback || DEFAULT_ID);
        if (!findInterface(selected)) selected = DEFAULT_ID;

        return selected;
    }

    function forceSmallInterfaceSize() {
        if (!hasLampa()) return false;

        try {
            if (Lampa.Storage.get(INTERFACE_SIZE_PARAM, '') !== INTERFACE_SIZE_VALUE) {
                Lampa.Storage.set(INTERFACE_SIZE_PARAM, INTERFACE_SIZE_VALUE);
                return true;
            }
        } catch (e) {}

        return false;
    }

    function findInterface(id) {
        if (id === DEFAULT_ID) return DEFAULT_OPTION;

        for (var i = 0; i < INTERFACE_PLUGINS.length; i++) {
            if (INTERFACE_PLUGINS[i].id === id) return INTERFACE_PLUGINS[i];
        }

        return null;
    }

    function readPluginList() {
        var list = [];

        try {
            list = Lampa.Storage.get('plugins', '[]') || [];
        } catch (e) {
            list = [];
        }

        return Array.isArray(list) ? list : [];
    }

    function cleanupManagedPlugins() {
        if (!hasLampa()) return false;

        var urls = managedUrls();
        var original = readPluginList();
        var list = [];
        var changed = false;

        original.forEach(function (plugin) {
            var url = typeof plugin === 'string' ? plugin : plugin && plugin.url;

            if (urls.indexOf(canonicalUrl(url)) !== -1) {
                changed = true;
                return;
            }

            list.push(plugin);
        });

        if (changed) {
            try {
                Lampa.Storage.set('plugins', list);
            } catch (e) {}
        }

        if (Lampa.Plugins && Lampa.Plugins.get && Lampa.Plugins.save) {
            try {
                var loaded = Lampa.Plugins.get();

                if (Array.isArray(loaded)) {
                    for (var i = loaded.length - 1; i >= 0; i--) {
                        var loadedUrl = loaded[i] && loaded[i].url;

                        if (urls.indexOf(canonicalUrl(loadedUrl)) !== -1) {
                            if (Lampa.Plugins.remove) {
                                Lampa.Plugins.remove(loaded[i]);
                            } else {
                                loaded.splice(i, 1);
                            }

                            changed = true;
                        }
                    }

                    if (changed && !Lampa.Plugins.remove) Lampa.Plugins.save();
                }
            } catch (e) {}
        }

        return changed;
    }

    function loadHiddenScript(url) {
        if (!url || hiddenLoadedUrl === canonicalUrl(url)) return;

        hiddenLoadedUrl = canonicalUrl(url);

        try {
            if (Lampa.Utils && Lampa.Utils.putScriptAsync) {
                Lampa.Utils.putScriptAsync([url], function () {}, function () {}, function () {}, true);
                return;
            }

            if (Lampa.Utils && Lampa.Utils.putScript) {
                Lampa.Utils.putScript([url], function () {}, function () {}, function () {}, true);
                return;
            }
        } catch (e) {}

        try {
            var script = document.createElement('script');
            script.src = url;
            script.async = false;
            script.setAttribute('data-lampac-interface-style', '1');
            (document.head || document.documentElement).appendChild(script);
        } catch (e) {
            hiddenLoadedUrl = '';
        }
    }

    function loadSelectedInterface(selection) {
        cleanupManagedPlugins();

        selection = selection || getSelection(DEFAULT_ID);
        if (selection === DEFAULT_ID) return false;

        var item = findInterface(selection);
        if (!item || item.id === DEFAULT_ID) return false;

        loadHiddenScript(normalizeUrl(item.url));
        return true;
    }

    function syncPlugins(selection) {
        selection = selection || getSelection(DEFAULT_ID);

        if (selection === DEFAULT_ID) return cleanupManagedPlugins();

        cleanupManagedPlugins();
        return loadSelectedInterface(selection);
    }

    function notify(message, options) {
        try {
            if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(message, options || {});
        } catch (e) {}
    }

    function reloadSoon() {
        notify('Стиль карточек применится после перезагрузки. Перезагрузка...', { time: 2500 });

        setTimeout(function () {
            window.location.reload();
        }, 900);
    }

    function selectInterface(id, needReload) {
        if (!findInterface(id)) id = DEFAULT_ID;

        Lampa.Storage.set(SELECT_PARAM, id);
        Lampa.Storage.set(PROMPT_PARAM, true);
        cleanupManagedPlugins();

        if (needReload) reloadSoon();
    }

    function selectValues() {
        var values = {};

        values[DEFAULT_ID] = DEFAULT_OPTION.name;
        INTERFACE_PLUGINS.forEach(function (item) {
            values[item.id] = item.name;
        });

        return values;
    }

    function selectItems() {
        var current = getSelection(DEFAULT_ID);
        var items = [{
            title: DEFAULT_OPTION.name,
            subtitle: DEFAULT_OPTION.description,
            value: DEFAULT_ID,
            selected: current === DEFAULT_ID
        }];

        INTERFACE_PLUGINS.forEach(function (item) {
            items.push({
                title: item.name,
                subtitle: item.description || item.url,
                value: item.id,
                selected: current === item.id
            });
        });

        return items;
    }

    function lockModal(lock) {
        if (!Lampa.Modal) return;

        if (lock) {
            if (!modalLocked) {
                modalLocked = true;
                modalOriginalClose = Lampa.Modal.close;
                Lampa.Modal.close = function () {};
            }
        } else if (modalLocked) {
            modalLocked = false;
            Lampa.Modal.close = modalOriginalClose;
        }
    }

    function setActiveButton(index) {
        if (!choiceButtons.length) return;

        var len = choiceButtons.length;
        choiceIndex = ((index % len) + len) % len;

        choiceButtons.forEach(function (button, buttonIndex) {
            if (!button || !button.length) return;
            button.toggleClass('focus', buttonIndex === choiceIndex);
        });

        // Keep focus local to this modal. Lampa collectionFocus scrolls the first
        // button to center and can push the header out of the fullscreen view.
    }

    function moveChoice(step) {
        setActiveButton(choiceIndex + step);
    }

    function confirmChoice() {
        var button = choiceButtons[choiceIndex];

        if (button && button.length) button.trigger('hover:enter');
    }

    function currentControllerName() {
        try {
            if (Lampa.Controller && Lampa.Controller.enabled) {
                var enabled = Lampa.Controller.enabled();
                return enabled && enabled.name ? enabled.name : '';
            }
        } catch (e) {}

        return '';
    }

    function enableChoiceController() {
        if (!Lampa.Controller || !Lampa.Controller.add || !Lampa.Controller.toggle || !choiceContainer) return;

        try {
            if (choicePreviousController === null) choicePreviousController = currentControllerName();

            Lampa.Controller.add(CHOICE_CONTROLLER, {
                toggle: function () {
                    if (Lampa.Controller.collectionSet) Lampa.Controller.collectionSet(choiceContainer);
                    setActiveButton(choiceIndex);
                },
                up: function () {
                    moveChoice(-1);
                },
                down: function () {
                    moveChoice(1);
                },
                left: function () {
                    moveChoice(-1);
                },
                right: function () {
                    moveChoice(1);
                },
                enter: confirmChoice,
                back: function () {
                    notify('Сначала выберите стиль карточек');
                }
            });

            Lampa.Controller.toggle(CHOICE_CONTROLLER);
        } catch (e) {}
    }

    function restoreChoiceController() {
        if (!choicePreviousController || choicePreviousController === CHOICE_CONTROLLER) {
            choicePreviousController = null;
            return;
        }

        try {
            if (Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle(choicePreviousController);
        } catch (e) {}

        choicePreviousController = null;
    }

    function stopEvent(event) {
        if (!event) return;

        if (event.preventDefault) event.preventDefault();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        if (event.stopPropagation) event.stopPropagation();

        event.cancelBubble = true;
        event.returnValue = false;
    }

    function keyCode(event) {
        return event ? event.keyCode || event.which || 0 : 0;
    }

    function keyName(event) {
        return ((event && (event.key || event.code)) || '').toString().toLowerCase();
    }

    function hasKeyCode(event, list) {
        return list.indexOf(keyCode(event)) !== -1;
    }

    function hasKeyName(event, list) {
        var name = keyName(event);

        for (var i = 0; i < list.length; i++) {
            if (name === list[i]) return true;
        }

        return false;
    }

    function isRemoteLeft(event) {
        return hasKeyCode(event, KEY_LEFT) || hasKeyName(event, ['arrowleft', 'left', 'dpadleft']);
    }

    function isRemoteUp(event) {
        return hasKeyCode(event, KEY_UP) || hasKeyName(event, ['arrowup', 'up', 'dpadup']);
    }

    function isRemoteRight(event) {
        return hasKeyCode(event, KEY_RIGHT) || hasKeyName(event, ['arrowright', 'right', 'dpadright']);
    }

    function isRemoteDown(event) {
        return hasKeyCode(event, KEY_DOWN) || hasKeyName(event, ['arrowdown', 'down', 'dpaddown']);
    }

    function isRemoteOk(event) {
        return hasKeyCode(event, KEY_OK) || hasKeyName(event, ['enter', 'ok', 'accept', 'select', 'dpadcenter', 'numpadenter']);
    }

    function isRemoteBack(event) {
        return hasKeyCode(event, KEY_BACK) || hasKeyName(event, ['escape', 'back', 'browserback', 'goback']);
    }

    function disableChoiceKeys() {
        choiceActive = false;

        if (choiceKeyDownHandler) {
            document.removeEventListener('keydown', choiceKeyDownHandler, true);
            choiceKeyDownHandler = null;
        }

        if (choiceKeyUpHandler) {
            document.removeEventListener('keyup', choiceKeyUpHandler, true);
            choiceKeyUpHandler = null;
        }
    }

    function enableChoiceKeys() {
        if (choiceKeyDownHandler) return;

        choiceKeyDownHandler = function (event) {
            if (!choiceActive) return;

            stopEvent(event);

            if (isRemoteLeft(event) || isRemoteUp(event)) {
                moveChoice(-1);
            } else if (isRemoteRight(event) || isRemoteDown(event)) {
                moveChoice(1);
            } else if (isRemoteOk(event)) {
                confirmChoice();
            } else if (isRemoteBack(event)) {
                notify('Сначала выберите стиль карточек');
            }
        };

        choiceKeyUpHandler = function (event) {
            if (choiceActive) stopEvent(event);
        };

        document.addEventListener('keydown', choiceKeyDownHandler, true);
        document.addEventListener('keyup', choiceKeyUpHandler, true);
    }

    function closeChoice() {
        disableChoiceKeys();
        lockModal(false);

        try {
            if (Lampa.Modal && Lampa.Modal.close) Lampa.Modal.close();
        } catch (e) {}

        restoreChoiceController();
        choiceContainer = null;
    }

    function resetChoiceScroll() {
        try {
            if (Lampa.Modal && Lampa.Modal.scroll && Lampa.Modal.scroll()) {
                var scroll = Lampa.Modal.scroll();

                if (scroll.reset) scroll.reset();

                if (scroll.render) {
                    var render = scroll.render(true);

                    if (render) {
                        render.scrollTop = 0;
                        render.scrollLeft = 0;
                    }
                }
            }
        } catch (e) {}

        try {
            if (choiceContainer && choiceContainer.length) choiceContainer[0].scrollTop = 0;
        } catch (e) {}
    }

    function adjustChoiceModalPosition() {
        try {
            var modal = $('.modal').last();

            modal.addClass('lampac-card-style-choice-modal').css({
                background: '#111317',
                'background-color': '#111317'
            });

            modal.find('.head-backward').css({
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                'z-index': 3
            });

            modal.find('.modal__content, .modal__body').css({
                background: '#111317',
                'background-color': '#111317'
            });

            if (window.innerWidth <= 640) {
                modal.find('.modal__content').css({
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    'max-width': '100%',
                    height: '100vh',
                    'min-height': '100vh',
                    padding: 0,
                    'border-radius': 0
                });

                modal.find('.modal__body, .modal__body .scroll').css({
                    height: '100vh',
                    'max-height': '100vh'
                });
            }

            modal.find('.modal__body .scroll__content').css({
                'max-height': '100vh',
                padding: 0
            });
        } catch (e) {}
    }

    function showChoice() {
        if (!hasLampa() || !Lampa.Modal || !Lampa.Modal.open) return;
        if (choiceActive) return;

        var html = $('<div class="lampac-card-style-choice"></div>');
        var title = $('<div class="lampac-card-style-choice__title">Стиль карточек</div>');
        var note = $('<div class="lampac-card-style-choice__note">Выберите вариант оформления. Управление Lampa будет доступно после выбора.</div>');
        var list = $('<div class="lampac-card-style-choice__list"></div>');
        var isNarrow = window.innerWidth <= 640;
        var btnStyle = {
            margin: isNarrow ? '0.45em 0' : '0.45em',
            padding: isNarrow ? '1em 1.05em' : '1.15em 1.2em',
            'min-width': isNarrow ? 0 : '18em',
            'min-height': isNarrow ? '5em' : '5.2em',
            height: 'auto',
            'text-align': 'left',
            display: 'grid',
            'grid-template-columns': isNarrow ? '1fr' : 'minmax(14em, 0.9fr) minmax(14em, 1.1fr)',
            'column-gap': isNarrow ? 0 : '3em',
            'row-gap': isNarrow ? '0.45em' : 0,
            'align-items': 'center',
            'box-sizing': 'border-box',
            'white-space': 'normal',
            width: isNarrow ? '100%' : 'calc(100% - 0.9em)'
        };

        html.css({
            width: '100%',
            'min-height': '100vh',
            height: '100vh',
            display: 'flex',
            'flex-direction': 'column',
            'align-items': 'center',
            'justify-content': 'flex-start',
            padding: isNarrow ? '3vh 5vw 5vh' : '2vh 4vw 5vh',
            'box-sizing': 'border-box',
            background: '#111317',
            'overflow-y': 'auto'
        });

        title.css({
            'font-size': isNarrow ? '2em' : '2.4em',
            'font-weight': 600,
            'margin-bottom': '0.4em',
            color: '#fff'
        });

        note.css({
            'font-size': isNarrow ? '0.95em' : '1.05em',
            'line-height': '1.45',
            'max-width': isNarrow ? '100%' : '36em',
            'text-align': 'center',
            color: '#c8cbd2',
            'margin-bottom': '1.25em'
        });

        list.css({
            display: 'flex',
            'flex-direction': 'column',
            'align-items': 'stretch',
            'max-width': isNarrow ? '100%' : '42em',
            width: '100%',
            'padding-bottom': '1em'
        });

        choiceButtons = [];

        selectItems().forEach(function (item) {
            var button = $('<div class="simple-button selector"></div>').css(btnStyle);
            var buttonTitle = $('<div></div>').text(item.title).css({
                'font-size': isNarrow ? '1em' : '1.08em',
                'font-weight': 600,
                'line-height': '1.12',
                'min-width': 0,
                'padding-right': isNarrow ? 0 : '0.25em',
                'overflow-wrap': 'break-word',
                'white-space': 'normal'
            });
            var buttonSubtitle = $('<div></div>').text(item.subtitle || '').css({
                'font-size': isNarrow ? '0.78em' : '0.75em',
                opacity: 0.72,
                'line-height': '1.15',
                'min-width': 0,
                'padding-left': isNarrow ? 0 : '0.25em',
                'overflow-wrap': 'break-word',
                'white-space': 'normal'
            });

            button.append(buttonTitle);
            if (item.subtitle) button.append(buttonSubtitle);

            button.on('hover:enter click', function () {
                closeChoice();
                selectInterface(item.value, true);
            });

            list.append(button);
            choiceButtons.push(button);
        });

        html.append(title, note, list);
        choiceContainer = html;
        choicePreviousController = currentControllerName();

        Lampa.Modal.open({
            title: '',
            html: html,
            size: 'full',
            onBack: function () {
                notify('Сначала выберите стиль карточек');
            }
        });

        lockModal(true);
        choiceActive = true;
        adjustChoiceModalPosition();
        resetChoiceScroll();
        setActiveButton(0);
        enableChoiceController();
        enableChoiceKeys();

        setTimeout(function () {
            adjustChoiceModalPosition();
            resetChoiceScroll();
        }, 50);

        setTimeout(function () {
            adjustChoiceModalPosition();
            resetChoiceScroll();
        }, 150);
    }

    function accountReadyLocal() {
        try {
            if (Lampa.Account && Lampa.Account.Permit && Lampa.Account.Permit.access) return true;
            if (Lampa.Storage.get('account_email', '')) return true;
        } catch (e) {}

        return false;
    }

    function checkLampacAccess(callback) {
        if (accountReadyLocal()) {
            callback(true);
            return;
        }

        if (!Lampa.Reguest) {
            callback(true);
            return;
        }

        if (accessPending) return;
        accessPending = true;

        try {
            accessNetwork = accessNetwork || new Lampa.Reguest();

            var url = host() + '/testaccsdb';
            var email = Lampa.Storage.get('account_email', '');
            var uid = Lampa.Storage.get('lampac_unic_id', '');

            if (email) url = addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
            if (uid) url = addUrlComponent(url, 'uid=' + encodeURIComponent(uid));

            accessNetwork.silent(url, function (result) {
                accessPending = false;
                callback(!(result && result.accsdb));
            }, function () {
                accessPending = false;
                callback(accountReadyLocal());
            });
        } catch (e) {
            accessPending = false;
            callback(accountReadyLocal());
        }
    }

    function maybePrompt() {
        if (!hasLampa()) return;
        if (Lampa.Storage.get(PROMPT_PARAM, false)) return;

        checkLampacAccess(function (allowed) {
            if (!allowed) return;
            if (Lampa.Storage.get(PROMPT_PARAM, false)) return;

            setTimeout(function () {
                showChoice();
            }, 100);
        });
    }

    function setupSettings() {
        if (!hasLampa() || !Lampa.SettingsApi) return;
        if (window.lampac_interface_selector_settings_ready) return;

        window.lampac_interface_selector_settings_ready = true;

        Lampa.SettingsApi.addComponent({
            component: COMPONENT,
            after: 'interface',
            name: 'Стиль карточек',
            icon: ICON
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT,
            param: {
                name: SELECT_PARAM,
                type: 'select',
                values: selectValues(),
                'default': DEFAULT_ID
            },
            field: {
                name: 'Вариант стиля карточек',
                description: 'Выбранный стиль загрузится после перезагрузки Lampa'
            },
            onChange: function (value) {
                selectInterface(value, true);
            }
        });

        Lampa.SettingsApi.addParam({
            component: COMPONENT,
            param: {
                name: COMPONENT + '_choice',
                type: 'button'
            },
            field: {
                name: 'Выбрать стиль карточек сейчас'
            },
            onChange: function () {
                showChoice();
            }
        });

        if (Lampa.Settings && Lampa.Settings.main && Lampa.Settings.main() && Lampa.Settings.main().update) {
            try {
                Lampa.Settings.main().update();
            } catch (e) {}
        }
    }

    function onReady() {
        forceSmallInterfaceSize();
        setupSettings();
        cleanupManagedPlugins();
        maybePrompt();
    }

    function init() {
        if (!hasLampa()) {
            setTimeout(init, 250);
            return;
        }

        setupSettings();
        forceSmallInterfaceSize();
        cleanupManagedPlugins();
        loadSelectedInterface(getSelection(DEFAULT_ID));

        if (window.appready) {
            onReady();
        } else if (Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('app', function (event) {
                if (event.type === 'ready') onReady();
            });
        } else {
            setTimeout(onReady, 1500);
        }

        if (Lampa.Storage.listener && Lampa.Storage.listener.follow) {
            Lampa.Storage.listener.follow('change', function (event) {
                if (event.name === 'account' || event.name === 'account_email' || event.name === 'account_use') {
                    maybePrompt();
                }
            });
        }
    }

    window.LampacInterfaceSelector = {
        interfaces: INTERFACE_PLUGINS,
        select: selectInterface,
        sync: syncPlugins,
        show: showChoice
    };

    init();
})();
