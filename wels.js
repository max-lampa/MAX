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
        /* Скрываем всё стандартное: логотип-круг, надписи и фон */
        '.welcome, .welcome__img, .welcome__logo, .lp-step, .lp-status, .loader, .preloader { display: none !important; opacity: 0 !important; visibility: hidden !important; }',
        
        '#my-lampa-loader {',
        '    position: fixed; top: 0; left: 0; right: 0; bottom: 0;',
        '    background-image: url("' + randomImage + '");',
        '    background-size: cover; background-position: center center; background-color: #0a0a0f;',
        '    z-index: 9999999; display: flex; flex-direction: column;',
        '    align-items: center; justify-content: center;',
        '    font-family: sans-serif;',
        '}',

        '#my-loader-logo {',
        '    width: 330px; height: 110px; max-width: 85vw;',
        '    background: url("' + customLogo + '") no-repeat center bottom;',
        '    background-size: contain; margin-bottom: 10px;',
        '}',

        /* Стиль приветствия */
        '#my-loader-welcome {',
        '    font-size: 3.5em; font-weight: bold; color: #fff;',
        '    text-shadow: 0px 4px 15px rgba(0,0,0,0.8);',
        '    margin-bottom: 25px; position: relative; overflow: hidden;',
        '    padding: 0 20px;',
        '}',

        /* Эффект блика (сияния) на тексте */
        '#my-loader-welcome::after {',
        '    content: ""; position: absolute; top: 0; left: -150%; width: 100%; height: 100%;',
        '    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);',
        '    animation: glint 3s infinite;',
        '}',

        '@keyframes glint {',
        '    0% { left: -150%; }',
        '    30% { left: 150%; }',
        '    100% { left: 150%; }',
        '}',

        '#my-loader-step { font-size: 1.6em; color: #fff; text-shadow: 0px 2px 8px #000; text-align: center; font-weight: 300; }',
        '#my-loader-status { font-size: 0.9em; opacity: 0.6; color: #fff; margin-top: 8px; text-align: center; }'
    ].join('\n');
    
    document.documentElement.appendChild(style);

    var loaderDiv = document.createElement('div');
    loaderDiv.id = 'my-lampa-loader';
    loaderDiv.innerHTML = '<div id="my-loader-logo"></div>' +
                          '<div id="my-loader-welcome">Вітаю, МАКС</div>' +
                          '<div id="my-loader-step">Завантаження...</div>' +
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
                myLoader.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                myLoader.style.opacity = '0';
                myLoader.style.transform = 'scale(1.05)';
                setTimeout(function() { 
                    if (myLoader.parentNode) myLoader.parentNode.removeChild(myLoader); 
                }, 800);
            }
        }, remaining);
    }

    var checkLampa = setInterval(function() {
        var origStep = document.querySelector('.lp-step');
        var origStatus = document.querySelector('.lp-status');
        var myStep = document.getElementById('my-loader-step');
        var myStatus = document.getElementById('my-loader-status');

        if (origStep && myStep && origStep.innerText.trim()) {
            myStep.innerText = origStep.innerText;
        }
        if (origStatus && myStatus && origStatus.innerText.trim()) {
            myStatus.innerText = origStatus.innerText;
        }

        if (window.appready === true || (window.Lampa && window.Lampa.App && window.Lampa.App.ready)) {
            clearInterval(checkLampa);
            triggerRemoval();
        }
    }, 100);

    if (window.Lampa && window.Lampa.Listener) {
        window.Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
                clearInterval(checkLampa);
                triggerRemoval();
            }
        });
    }

    setTimeout(function() {
        clearInterval(checkLampa);
        triggerRemoval();
    }, 15000);

})();