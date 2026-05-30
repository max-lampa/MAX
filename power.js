(function() {  
    setTimeout(function() {  
        const clearBtnId = 'CLEARCACHE';  
        const exitBtnId = 'EXITBUTTON';  
  
        // Видалення існуючих кнопок  
        $('#' + clearBtnId).remove();  
        $('#' + exitBtnId).remove();  
  
        // Додавання базових стилів тільки для наших кнопок  
        function addStyles() {  
            if (document.getElementById('cache-exit-style')) return;  
              
            const css = `  
                #${clearBtnId} svg path { fill: #2196f3 !important; }  
                #${exitBtnId} svg path { fill: #f44336 !important; }  
                .head__action { transition: none !important; }  
            `;  
              
            const style = document.createElement('style');  
            style.id = 'cache-exit-style';  
            style.textContent = css;  
            document.head.appendChild(style);  
        }  
  
        // Додавання стилів  
        addStyles();  
  
        // Додавання кнопки очищення кешу  
        $('.head__actions').append(`  
            <div id="${clearBtnId}" class="head__action selector m-clear-cache" title="Очистити кеш">  
                <svg width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">  
                    <path d="M8 3.1l1.4 2.2-1.6 1.1 1.3 0.3 2.8 0.6 0.6-2.7 0.4-1.4-1.8 1.1-2-3.3h-2.2l-2.6 4.3 1.7 1z"/>  
                    <path d="M16 12l-2.7-4.3-1.7 1 2 3.3h-2.6v-2l-3 3 3 3v-2h3.7z"/>  
                    <path d="M2.4 12v0l1.4-2.3 1.7 1.1-0.9-4.2-2.8 0.7-1.3 0.3 1.6 1-2.1 3.4 1.3 2h5.7v-2z"/>  
                </svg>  
            </div>  
        `);  
  
        // Додавання кнопки виходу  
        $('.head__actions').append(`  
            <div id="${exitBtnId}" class="head__action selector m-exit-app" title="Вихід">  
                <svg width="24" height="24" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">  
                    <path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm.06,17.68a1.28,1.28,0,0,1-1.29-1.28V8.65a1.29,1.29,0,0,1,2.58,0V18.4A1.28,1.28,0,0,1,18.06,19.68ZM18,27.79A9.88,9.88,0,0,1,12.17,9.85a1.4,1.4,0,0,1,1.94.31,1.37,1.37,0,0,1-.31,1.92,7.18,7.18,0,1,0,11.43,5.8,7.07,7.07,0,0,0-3-5.76A1.37,1.37,0,0,1,22,10.2a1.4,1.4,0,0,1,1.94-.29A9.88,9.88,0,0,1,18,27.79Z"/>  
                </svg>  
            </div>  
        `);  
  
        // Обробник очищення кешу  
        $('#' + clearBtnId).on('hover:enter hover:click hover:touch', function() {  
            try {  
                if (typeof Lampa !== 'undefined' && Lampa.Storage && typeof Lampa.Storage.clear === 'function') {  
                    Lampa.Storage.clear(false);  
                    setTimeout(() => location.reload(), 300);  
                }  
            } catch (e) {  
                console.error('Помилка очищення кешу:', e);  
            }  
        });  
  
        // Обробник виходу з програми  
        $('#' + exitBtnId).on('hover:enter hover:click hover:touch', function() {  
            try {  
                if (typeof Lampa !== 'undefined') {  
                    if (Lampa.Platform.is('apple_tv')) window.location.assign('exit://exit');  
                    if (Lampa.Platform.is('tizen')) tizen.application.getCurrentApplication().exit();  
                    if (Lampa.Platform.is('webos') && typeof window.close == 'function') window.close();  
                    if (Lampa.Platform.is('android')) Lampa.Android.exit();  
                    if (Lampa.Platform.is('orsay')) Lampa.Orsay.exit();  
                    if (Lampa.Platform.is('netcast')) window.NetCastBack();  
                    if (Lampa.Platform.is('noname')) window.history.back();  
                }  
            } catch (e) {  
                console.error('Помилка виходу:', e);  
            }  
        });  
  
        // Реєстрація спрощеного плагіна  
        if (window.plugin) {  
            window.plugin('cache_exit_plugin', {  
                type: 'component',  
                name: 'Кеш + Вихід в шапці',  
                version: '5.0.0',  
                author: 'Oleksandr',  
                description: 'Тільки кнопки очищення кешу та виходу'  
            });  
        }  
  
    }, 500);  
})();
