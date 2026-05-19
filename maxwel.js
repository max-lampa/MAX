(function () {
    'use strict';

    var images = [
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w0.jpg',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w1.jpg',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w2.jpg',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w3.jpg',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w4.jpg'
    ];

    var randomImage = images[Math.floor(Math.random() * images.length)];
    var customLogo = 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/logoUA.png';

    var MIN_DISPLAY_TIME = 4000; 
    var startTime = Date.now();

    var style = document.createElement('style');
    style.innerHTML = [
        '.welcome .welcome__img, .lp-step, .lp-status { display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; }',
        
        '#my-lampa-loader {',
        '    position: fixed; top: 0; left: 0; right: 0; bottom: 0;',
        '    background-image: url("' + randomImage + '");',
        '    background-size: cover; background-position: center center; background-color: #0a0a0f;',
        '    z-index: 99999; display: flex; flex-direction: column;',
        '    align-items: center; justify-content: center;',
        '    padding-bottom: 5vh;',
        '}',

        '#my-loader-logo {',
        '    width: 330px; height: 110px; max-width: 80vw;',
        '    background: url("' + customLogo + '") no-repeat center bottom;',
        '    background-size: contain; margin-bottom: 25px;',
        '}',

        '@keyframes shine {',
        '    0% { left: -100%; }',
        '    100% { left: 100%; }',
        '}',

        '#my-loader-welcome {',
        '    font-size: 3em;',
        '    font-weight: bold;',
        '    color: #fff;',
        '    text-shadow: 0px 3px 10px rgba(0,0,0,0.9), 0px 0px 30px rgba(255,255,255,0.8), 0px 0px 50px rgba(255,255,255,0.5);',
        '    text-align: center;',
        '    margin-bottom: 30px;',
        '    letter-spacing: 3px;',
        '    position: relative;',
        '    overflow: hidden;',
        '}',

        '#my-loader-welcome::before {',
        '    content: "";',
        '    position: absolute;',
        '    top: 0;',
        '    left: -100%;',
        '    width: 100%;',
        '    height: 100%;',
        '    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);',
        '    animation: shine 2s infinite;',
        '}',

        '#my-loader-step { font-size: 1.5em; line-height: 1.6; color: #fff; text-shadow: 0px 2px 5px rgba(0,0,0,0.9); text-align: center; }',
        '#my-loader-status { font-size: 0.9em; opacity: 0.7; color: #fff; text-shadow: 0px 2px 5px rgba(0,0,0,0.9); margin-top: 5px; text-align: center; }'
    ].join('\n');
    
    var headOrDoc = document.head || document.documentElement;
    headOrDoc.appendChild(style);

    var loaderDiv = document.createElement('div');
    loaderDiv.id = 'my-lampa-loader';
    loaderDiv.innerHTML = '<div id="my-loader-logo"></div>' +
                          '<div id="my-loader-welcome">Welcome MAKS</div>' +
                          '<div id="my-loader-step">Підготовка...</div>' +
                          '<div id="my-loader-status"></div>';

    function injectHtml() {
        if (document.body) {
            document.body.insertBefore(loaderDiv, document.body.firstChild);
        } else {
            requestAnimationFrame(injectHtml);
        }
    }
    injectHtml();

    var isRemoved = false;
    var removalTriggered = false;

    function triggerRemoval() {
        if (removalTriggered) return;
        removalTriggered = true;

        var elapsed = Date.now() - startTime;
        var remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);

        setTimeout(function() {
            if (isRemoved) return;
            isRemoved = true;
            
            var myLoader = document.getElementById('my-lampa-loader');
            if (myLoader) {
                myLoader.style.transition = 'opacity 0.6s ease';
                myLoader.style.opacity = '0';
                setTimeout(function() { 
                    if (myLoader.parentNode) myLoader.parentNode.removeChild(myLoader); 
                }, 600);
            }
        }, remaining);
    }

    var checkLampa = setInterval(function() {
        
        var origStep = document.querySelector('.lp-step');
        var origStatus = document.querySelector('.lp-status');
        var myStep = document.getElementById('my-loader-step');
        var myStatus = document.getElementById('my-loader-status');

        if (origStep && myStep && origStep.innerText) {
            myStep.innerText = origStep.innerText;
        }
        if (origStatus && myStatus && origStatus.innerText) {
            myStatus.innerText = origStatus.innerText;
        }

        if (window.appready === true) {
            clearInterval(checkLampa);
            triggerRemoval();
            return;
        }

        var originalWelcome = document.querySelector('.welcome');
        if (!originalWelcome && document.body) {
            clearInterval(checkLampa);
            triggerRemoval();
            return;
        }

        if (window.Lampa && window.Lampa.Listener && !window.listenerHooked) {
            window.listenerHooked = true;
            window.Lampa.Listener.follow('app', function(e) {
                if (e.type == 'ready') {
                    clearInterval(checkLampa);
                    triggerRemoval();
                }
            });
        }
    }, 50);

    setTimeout(function() {
        clearInterval(checkLampa);
        triggerRemoval();
    }, 15000);

})();