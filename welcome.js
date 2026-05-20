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
        '}'
    ].join('\n');
    
    var headOrDoc = document.head || document.documentElement;
    headOrDoc.appendChild(style);
    function delayFadeOut() {
        if (typeof $ !== 'undefined' && $.fn && $.fn.fadeOut && !window.myBgFadeHooked) {
            window.myBgFadeHooked = true;
            var origFadeOut = $.fn.fadeOut;
            
            $.fn.fadeOut = function(speed, callback) {
                if (this.hasClass && this.hasClass('welcome')) {
                    var $el = this;
                    var elapsed = Date.now() - startTime;
                    var remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
                    
                    setTimeout(function() {
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
            
            window.Lampa.LoadingProgress.destroy = function() {
                var self = this, args = arguments;
                var elapsed = Date.now() - startTime;
                var remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
                
                setTimeout(function() {
                    var $progressContainer = $('.lp-step').parent();
                    if ($progressContainer.length && typeof $ !== 'undefined' && $.fn.fadeOut) {
                        $progressContainer.fadeOut(500, function() {
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
