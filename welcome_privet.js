(function () {
    'use strict';

    var MIN_DISPLAY_TIME = 3000;
    var startTime = Date.now();

    var images = [
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w0.webp',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w1.webp',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w2.webp'
    ];
    var randomImage = images[Math.floor(Math.random() * images.length)];
    var customLogo = 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/logoUA.png';

    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&display=swap';
    (document.head || document.documentElement).appendChild(fontLink);

    var style = document.createElement('style');
    style.innerHTML = [
        '.welcome {',
        '    background-image: url("' + randomImage + '") !important;',
        '    background-size: cover !important;',
        '    background-position: center center !important;',
        '}',
        '.lp-step {',
        '    transform: translateY(-18vh) !important;',
        '}',
        '.lp-step::before {',
        '    content: ""; display: block;',
        '    width: 330px; height: 110px; max-width: 80vw;',
        '    margin: 0 auto 25px auto;',
        '    background: url("' + customLogo + '") no-repeat center bottom;',
        '    background-size: contain;',
        '}',
        '.lp-step, .lp-status {',
        '    text-shadow: 0px 2px 5px rgba(0,0,0,0.9), 0px 0px 10px rgba(0,0,0,0.7) !important;',
        '}',

        '@keyframes greetingShine {',
        '    0%   { background-position: -300% center; }',
        '    100% { background-position: 300% center; }',
        '}',
        '@keyframes greetingFadeIn {',
        '    from { opacity: 0; transform: translateY(10px); }',
        '    to   { opacity: 1; transform: translateY(0); }',
        '}',

        '.privet-greeting-wrap {',
        '    position: absolute;',
        '    bottom: 11vh;',
        '    left: 0; right: 0;',
        '    text-align: center;',
        '    pointer-events: none;',
        '    z-index: 10;',
        '    animation: greetingFadeIn 1.2s ease forwards;',
        '}',

        '.privet-greeting-text {',
        '    display: inline-block;',
        '    font-family: "Cormorant Garamond", "Georgia", "Times New Roman", serif;',
        '    font-size: clamp(2.4rem, 7vw, 5rem);',
        '    font-weight: 700;',
        '    letter-spacing: 0.06em;',
        '    line-height: 1.1;',

        '    background: linear-gradient(',
        '        90deg,',
        '        #b8902a 0%,',
        '        #e8cc76 18%,',
        '        #fff5c0 28%,',
        '        #fffbe8 35%,',
        '        #ffd966 42%,',
        '        #e8cc76 50%,',
        '        #fff8d0 60%,',
        '        #ffe082 72%,',
        '        #c9a84c 85%,',
        '        #e8cc76 100%',
        '    );',
        '    background-size: 300% auto;',
        '    -webkit-background-clip: text;',
        '    background-clip: text;',
        '    -webkit-text-fill-color: transparent;',
        '    animation: greetingShine 4s linear infinite;',

        '    filter:',
        '        drop-shadow(0 2px 6px rgba(0,0,0,0.95))',
        '        drop-shadow(0 0 22px rgba(180,140,30,0.55))',
        '        drop-shadow(0 0 4px rgba(0,0,0,0.8));',
        '}'
    ].join('\n');

    var headOrDoc = document.head || document.documentElement;
    headOrDoc.appendChild(style);

    function injectGreeting() {
        if (document.querySelector('.privet-greeting-wrap')) return;

        var wrap = document.createElement('div');
        wrap.className = 'privet-greeting-wrap';

        var text = document.createElement('span');
        text.className = 'privet-greeting-text';
        text.textContent = '\u041f\u0440\u0438\u0432\u0435\u0442 \u0410\u043d\u0434\u0440\u0435\u0439';

        wrap.appendChild(text);

        var target = document.querySelector('.welcome');
        if (target) {
            target.style.position = target.style.position || 'relative';
            target.appendChild(wrap);
        } else {
            document.body.appendChild(wrap);
        }
    }

    function tryInjectGreeting() {
        if (document.querySelector('.welcome')) {
            injectGreeting();
        } else if (!document.querySelector('.privet-greeting-wrap')) {
            setTimeout(tryInjectGreeting, 80);
        }
    }

    if (document.body) {
        tryInjectGreeting();
    } else {
        document.addEventListener('DOMContentLoaded', tryInjectGreeting);
    }

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
