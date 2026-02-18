!function() {
    "use strict";

    if (!window.welcomeplugin) {
        window.welcomeplugin = true;

        // Стили для приветствия
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .welcome {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 100;
                background: #000000 url('https://i.ibb.co/d0HFCFpP/IMG-20260218-142212-039.jpg') no-repeat 50% 50%;
                -webkit-background-size: cover;
                -moz-background-size: cover;
                -o-background-size: cover;
                background-size: cover;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .welcome-text {
                color: white;
                font-size: 48px;
                font-family: Arial, sans-serif;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                background: rgba(0,0,0,0.3);
                padding: 20px 40px;
                border-radius: 10px;
                text-align: center;
            }
        `;

        // Добавляем стили
        document.getElementsByTagName('head')[0].appendChild(style);

        // Создаем контейнер с текстом
        var welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome';
        var textDiv = document.createElement('div');
        textDiv.className = 'welcome-text';
        textDiv.textContent = 'Welcome Lampa Max'; // Здесь ваш текст
        welcomeDiv.appendChild(textDiv);
        document.body.appendChild(welcomeDiv);
    }
}();