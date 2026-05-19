(function () {
    'use strict';

    // 1. Конфигурация ресурсов
    var images = [
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w0.jpg',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w1.jpg',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w2.jpg',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w3.jpg',
        'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/w4.jpg'
    ];

    var randomImage = images[Math.floor(Math.random() * images.length)];
    var customLogo = 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/logoUA.png';

    var MIN_DISPLAY_TIME = 4000; // Минимум 4 секунды показа
    var startTime = Date.now();

    // 2. Стили (Удаляем всё стандартное, включая круглый знак Lampa)
    var style = document.createElement('style');
    style.innerHTML = [
        /* Прячем стандартную Лампу, её логотип, крутилки и шаги */
        '.welcome, .welcome__img, .welcome__logo, .lp-step, .lp-status, .loader, .preloader { display: none !important; opacity: 0 !important; visibility: hidden !important; }',
        
        '#my-custom-loader {',
        '    position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
        '    background: #0a0a0f url("' + randomImage + '") no-repeat center center;',
        '    background-size: cover;', // Постер на весь экран
        '    z-index: 9999999; display: flex; flex-direction: column;',
        '    align-items: center; justify-content: center;',
        '    font-family: sans-serif;',
        '}',

        '#my-loader-logo {',
        '    width: 350px; height: 120px; max-width: 85vw;',
        '    background: url("' + customLogo + '") no-repeat center center;',
        '    background-size: contain; margin-bottom: 20px;',
        '}',

        '#my-loader-welcome {',
        '    font-size: 3.2em; font-weight: bold; color: #fff;',
        '    text-shadow: 0 4px 15px rgba(0,0,0,0.8), 0 0 30px rgba(255,255,255,0.2);',
        '    text-align: center; margin-bottom: 20px; letter-spacing: 2px;',
        '    position: relative; overflow: hidden;',
        '}',

        /* Эффект сияния (блеск на тексте) */
        '#my-loader-welcome::after {',
        '    content: ""; position: absolute; top: 0; left: -150%; width: 100%; height: 100%;',
        '    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);',
        '    animation: shine-move 3s infinite;',
        '}',
        '@keyframes shine-move { 100% { left: 150%; } }',

        '#my-loader-step { font-size: 1.6em; color: #fff; text-shadow: 0 2px 10px #000; text-align: center; font-weight: 300; }',
        '#my-loader-status { font-size: 1em; color: rgba(255,255,255,0.7); margin-top: 10px; text-align: center; }'
    ].join('\n');
    
    document.documentElement.appendChild(style);

    // 3. Создание структуры лоадера
    var loaderDiv = document.createElement('div');
    loaderDiv.id = 'my-custom-loader';
    loaderDiv.innerHTML = '<div id="my-loader-logo"></div>' +
                          '<div id="my-loader-welcome">Welcome MAKS</div>' +
                          '<div id="my-loader-step">Завантаження...</div>' +
                          '<div id="my-loader-status"></div>';

    // Вставка в Body
    function injectLoader() {
        if (document.body) {
            document.body.insertBefore(loaderDiv, document.body.firstChild);
        } else {
            requestAnimationFrame(injectLoader);
        }
    }
    injectLoader();

    // 4. Логика удаления
    var isRemoved = false;
    function triggerRemoval() {
        if (isRemoved) return;
        isRemoved = true;

        var elapsed = Date.now() - startTime;
        var remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);

        setTimeout(function() {
            var myLoader = document.getElementById('my-custom-loader');
            if (myLoader) {
                myLoader.style.transition = 'opacity 1s ease, transform 1s ease';
                myLoader.style.opacity = '0';
                myLoader.style.transform = 'scale(1.05)';
                setTimeout(function() { 
                    if (myLoader.parentNode) myLoader.parentNode.removeChild(myLoader); 
                }, 1000);
            }
        }, remaining);
    }

    // 5. Мониторинг состояния приложения
    var checkLampa = setInterval(function() {
        // Синхронизируем текст прогресса из оригинальных скрытых полей
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

        // Если Lampa сообщила о готовности
        if (window.appready === true || (window.Lampa && window.Lampa.App && window.Lampa.App.ready)) {
            clearInterval(checkLampa);
            triggerRemoval();
        }
    }, 100);

    // Дополнительный перехват через слушатель Lampa
    if (window.Lampa && window.Lampa.Listener) {
        window.Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                clearInterval(checkLampa);
                triggerRemoval();
            }
        });
    }

    // Предохранитель (если загрузка зависла)
    setTimeout(function() {
        clearInterval(checkLampa);
        triggerRemoval();
    }, 20000);

})();