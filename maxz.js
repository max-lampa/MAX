(function() {
    "use strict";

    var hideLampaStyle = document.createElement('style');
    hideLampaStyle.innerHTML = `
        body > div[class*="preloader"], .preloader, .lampa__preloader, .prepare, #preloader { 
            display: none !important; 
            opacity: 0 !important; 
            visibility: hidden !important; 
        }
        
        .my-welcome-screen {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 2147483647 !important;
            background: #000000 url('https://i.postimg.cc/qvydYDfS/Max-a-Po-etomu-primeru-sde.png') no-repeat 50% 50%;
            background-size: cover;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.8s ease;
        }

        .my-welcome-text {
            color: white;
            font-size: 48px;
            font-family: 'Roboto', Arial, sans-serif;
            font-weight: bold;
            text-align: center;
            text-shadow: 0px 4px 12px rgba(0, 0, 0, 1), 0px 0px 10px rgba(0, 0, 0, 0.7);
            padding: 20px;
            user-select: none;
            transform: translateY(20px);
            transition: transform 1s ease;
        }

        .my-welcome-screen.visible {
            opacity: 1;
        }

        .my-welcome-screen.visible .my-welcome-text {
            transform: translateY(0);
        }
    `;
    document.documentElement.appendChild(hideLampaStyle);

    if (!window.welcomeplugin) {
        window.welcomeplugin = true;

        var init = function() {
            var welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'my-welcome-screen';
            
            var textDiv = document.createElement('div');
            textDiv.className = 'my-welcome-text';
            textDiv.textContent = 'Welcome Lampa Max🍿';
            
            welcomeDiv.appendChild(textDiv);
            document.body.appendChild(welcomeDiv);

            setTimeout(function() {
                welcomeDiv.classList.add('visible');
            }, 50);

            var isRemoved = false;
            var removeWelcome = function() {
                if (isRemoved) return;
                isRemoved = true;
                
                welcomeDiv.style.opacity = '0';
                setTimeout(function() {
                    if (welcomeDiv.parentNode) welcomeDiv.parentNode.removeChild(welcomeDiv);
                    if (hideLampaStyle.parentNode) hideLampaStyle.parentNode.removeChild(hideLampaStyle);
                }, 800);
            };

            var minDisplayTime = 7000; // 7 секунд
            var startTime = Date.now();

            var tryHide = function() {
                var elapsed = Date.now() - startTime;
                if (elapsed >= minDisplayTime) {
                    removeWelcome();
                } else {
                    setTimeout(removeWelcome, minDisplayTime - elapsed);
                }
            };

            setTimeout(tryHide, minDisplayTime);
            
            window.addEventListener('keydown', removeWelcome, { once: true });
            window.addEventListener('click', removeWelcome, { once: true });

            if (window.Lampa && window.Lampa.Listener) {
                window.Lampa.Listener.follow('app', function(e) {
                    if (e.type === 'ready') tryHide();
                });
            }
        };

        if (document.body) init();
        else document.addEventListener('DOMContentLoaded', init);
    }
})();