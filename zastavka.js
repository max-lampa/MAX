(function () {
    'use strict';

    var STORAGE_KEY = 'welcome_splash_seconds';
    var DEFAULT_SEC = 15;

    // MIN_DISPLAY_TIME обновляется из настроек Lampa
    var MIN_DISPLAY_TIME = DEFAULT_SEC * 1000;
    var startTime = Date.now();

    var images = [
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w0.webp',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w1.webp',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w2.webp'
    ];
    var randomImage = images[Math.floor(Math.random() * images.length)];
    var customLogo = 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/logoUA.png';

    // ── Шрифт ──────────────────────────────────────────────────────────────
    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&display=swap';
    (document.head || document.documentElement).appendChild(fontLink);

    // ── Стили ──────────────────────────────────────────────────────────────
    var css = '';

    css += '.welcome{';
    css += 'background-image:url("' + randomImage + '")!important;';
    css += 'background-size:cover!important;';
    css += 'background-position:center center!important;';
    css += '}';

    css += '.lp-step{transform:translateY(-18vh)!important;}';

    css += '.lp-step::before{';
    css += 'content:"";display:block;';
    css += 'width:330px;height:110px;max-width:80vw;';
    css += 'margin:0 auto 25px auto;';
    css += 'background:url("' + customLogo + '") no-repeat center bottom;';
    css += 'background-size:contain;';
    css += '}';

    css += '.lp-step,.lp-status{';
    css += 'text-shadow:0px 2px 5px rgba(0,0,0,.9),0px 0px 10px rgba(0,0,0,.7)!important;';
    css += '}';

    // Скрыть жёлто-синий знак Lampa на главной
    css += '.icon--lampa,';
    css += '.lampa-logo,';
    css += '.interface__logo,';
    css += '.head__logo,';
    css += '.layer--top .logo,';
    css += '.interface--logo,';
    css += '[data-name="lampa_logo"]{display:none!important;}';

    css += '@keyframes pgShine{';
    css += '0%{background-position:-250% center}';
    css += '100%{background-position:250% center}';
    css += '}';

    css += '@keyframes pgFadeIn{';
    css += 'from{opacity:0;transform:translateY(12px)}';
    css += 'to{opacity:1;transform:translateY(0)}';
    css += '}';

    css += '#pg-greeting{';
    css += 'position:fixed;';
    css += 'bottom:10vh;';
    css += 'left:0;right:0;';
    css += 'text-align:center;';
    css += 'z-index:99999;';
    css += 'pointer-events:none;';
    css += 'animation:pgFadeIn 1.2s ease forwards;';
    css += '}';

    css += '#pg-greeting span{';
    css += 'display:inline-block;';
    css += 'font-family:"Cormorant Garamond",Georgia,"Times New Roman",serif;';
    css += 'font-size:clamp(2.2rem,6.5vw,4.8rem);';
    css += 'font-weight:700;';
    css += 'letter-spacing:.07em;';
    css += 'background:linear-gradient(90deg,';
    css += '#7a5500 0%,#c9a84c 12%,#f5e27a 22%,#fffbe5 30%,';
    css += '#ffe066 38%,#f5e27a 46%,#fffbe5 54%,#ffd84c 62%,';
    css += '#c9a84c 78%,#7a5500 100%);';
    css += 'background-size:250% auto;';
    css += '-webkit-background-clip:text;';
    css += 'background-clip:text;';
    css += '-webkit-text-fill-color:transparent;';
    css += 'animation:pgShine 3.8s linear infinite;';
    css += 'text-shadow:none;';
    css += 'filter:drop-shadow(0 3px 8px rgba(0,0,0,.95)) drop-shadow(0 0 18px rgba(180,130,20,.5));';
    css += '}';

    var styleEl = document.createElement('style');
    styleEl.innerHTML = css;
    (document.head || document.documentElement).appendChild(styleEl);

    // ── Приветствие ────────────────────────────────────────────────────────
    function injectGreeting() {
        if (document.getElementById('pg-greeting')) return;
        var wrap = document.createElement('div');
        wrap.id = 'pg-greeting';
        var span = document.createElement('span');
        span.textContent = '\u041f\u0440\u0438\u0432\u0435\u0442 \u0410\u043d\u0434\u0440\u0435\u0439';
        wrap.appendChild(span);
        document.body.appendChild(wrap);
    }

    if (document.body) {
        injectGreeting();
    } else {
        document.addEventListener('DOMContentLoaded', injectGreeting);
    }

    // ── Настройки Lampa: выбор времени заставки ────────────────────────────
    function addLampaSettings() {
        if (window.Lampa && window.Lampa.SettingsApi && !window.pgSettingsAdded) {
            window.pgSettingsAdded = true;

            // Считать сохранённое значение и применить сразу
            var saved = parseInt(window.Lampa.Storage.get(STORAGE_KEY, String(DEFAULT_SEC)), 10);
            if (saved && saved > 0) MIN_DISPLAY_TIME = saved * 1000;

            window.Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    name: STORAGE_KEY,
                    type: 'select',
                    values: {
                        '15': '15 \u0441\u0435\u043a\u0443\u043d\u0434',
                        '30': '30 \u0441\u0435\u043a\u0443\u043d\u0434',
                        '45': '45 \u0441\u0435\u043a\u0443\u043d\u0434'
                    },
                    'default': String(DEFAULT_SEC)
                },
                field: {
                    name: '\u0412\u0440\u0435\u043c\u044f \u0437\u0430\u0441\u0442\u0430\u0432\u043a\u0438',
                    description: '\u0421\u043a\u043e\u043b\u044c\u043a\u043e \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c \u044d\u043a\u0440\u0430\u043d \u043f\u0440\u0438\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u044f'
                },
                onChange: function (value) {
                    var sec = parseInt(value, 10);
                    if (sec > 0) MIN_DISPLAY_TIME = sec * 1000;
                }
            });
        } else if (!window.pgSettingsAdded) {
            setTimeout(addLampaSettings, 100);
        }
    }
    addLampaSettings();

    // ── Задержка fadeOut обложки ───────────────────────────────────────────
    function delayFadeOut() {
        if (typeof $ !== 'undefined' && $.fn && $.fn.fadeOut && !window.myBgFadeHooked) {
            window.myBgFadeHooked = true;
            var origFadeOut = $.fn.fadeOut;

            $.fn.fadeOut = function (speed, callback) {
                if (this.hasClass && this.hasClass('welcome')) {
                    var $el = this;
                    var elapsed = Date.now() - startTime;
                    var remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);

                    setTimeout(function () {
                        var g = document.getElementById('pg-greeting');
                        if (g) {
                            g.style.transition = 'opacity 0.5s';
                            g.style.opacity = '0';
                            setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 600);
                        }
                        origFadeOut.call($el, speed, callback);
                    }, remaining);
                    return this;
                }
                return origFadeOut.apply(this, arguments);
            };
        } else if (!window.myBgFadeHooked) {
            setTimeout(delayFadeOut, 50);
        }
    }
    delayFadeOut();

    // ── Задержка уничтожения LoadingProgress ──────────────────────────────
    function delayTexts() {
        if (window.Lampa && window.Lampa.LoadingProgress && !window.myTextsHooked) {
            window.myTextsHooked = true;
            var origDestroy = window.Lampa.LoadingProgress.destroy;

            window.Lampa.LoadingProgress.destroy = function () {
                var self = this, args = arguments;
                var elapsed = Date.now() - startTime;
                var remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);

                setTimeout(function () {
                    var $progressContainer = $('.lp-step').parent();
                    if ($progressContainer.length && typeof $ !== 'undefined' && $.fn.fadeOut) {
                        $progressContainer.fadeOut(500, function () {
                            if (origDestroy) origDestroy.apply(self, args);
                        });
                    } else {
                        if (origDestroy) origDestroy.apply(self, args);
                    }
                }, remaining);
            };
        } else if (!window.myTextsHooked) {
            setTimeout(delayTexts, 50);
        }
    }
    delayTexts();

})();
