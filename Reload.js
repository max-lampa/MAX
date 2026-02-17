(function() {    
  'use strict';    
      
  function waitForLampa(callback) {    
    if (window.Lampa && Lampa.Storage && Lampa.Lang && Lampa.Activity) {    
      callback();    
    } else {    
      setTimeout(function() { waitForLampa(callback); }, 100);    
    }    
  }    
      
  waitForLampa(function() {    
    if (window.action_menu_plugin) return;    
    window.action_menu_plugin = true;    
        
    console.log('[ActionMenu] Ініціалізація плагіна');    
        
    // Локалізація    
    Lampa.Lang.add({    
      action_menu: {    
        en: 'Actions',    
        uk: 'Дії',    
        ru: 'Действия'    
      },  
      reload_button: {    
        en: 'Reload',    
        uk: 'Перезагрузка',    
        ru: 'Перезагрузка'    
      },  
      logout_button: {    
        en: 'Exit',    
        uk: 'Вихід',    
        ru: 'Выход'    
      }  
    });    
        
    // Функції дій  
    function doReload() {  
      window.location.reload();  
    }  
      
    function doLogout() {  
      try {
        // Попытка закрыть приложение через внутренние методы Lampa
        if (window.Lampa && Lampa.Android) {
          if (typeof Lampa.Android.exitApp === 'function') {
            Lampa.Android.exitApp();
            return;
          }

          if (typeof Lampa.Android.exit === 'function') {
            Lampa.Android.exit();
            return;
          }
        }

        if (window.Lampa && Lampa.App && typeof Lampa.App.exit === 'function') {
          Lampa.App.exit();
          return;
        }

        // Попытка корректно закрыть приложение на Android (WebView bridge)
        if (window.Android && typeof window.Android.exitApp === 'function') {
          window.Android.exitApp();
          return;
        }

        if (window.Android && typeof window.Android.exit === 'function') {
          window.Android.exit();
          return;
        }

        if (navigator && navigator.app && typeof navigator.app.exitApp === 'function') {
          navigator.app.exitApp();
          return;
        }

        if (typeof window.close === 'function') {
          window.close();
          return;
        }
      } catch (e) {
        // игнорируем ошибки, чтобы не уронить приложение
      }

      // Фолбэк: просто вернуться в шапку, если закрыть приложение нельзя
      if (Lampa && Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
        Lampa.Controller.toggle('head');
      }
    }  
      
    // Показати меню дій  
    function showActionMenu() {  
      Lampa.Select.show({  
        title: Lampa.Lang.translate('action_menu'),  
        items: [  
          {  
            title: Lampa.Lang.translate('reload_button'),  
            reload: true  
          },  
          {  
            title: Lampa.Lang.translate('logout_button'),  
            logout: true  
          }  
        ],  
        onSelect: function(item) {  
          if (item.reload) {  
            doReload();  
          } else if (item.logout) {  
            doLogout();  
          }  
        },  
        onBack: function() {  
          Lampa.Controller.toggle('head');  
        }  
      });  
    }  
        
    // Створення основної кнопки меню з іконкою power/reload  
    function createActionButton() {    
      var button = document.createElement('div');    
      button.className = 'head__action action-menu-button selector';    
      button.innerHTML = `    
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">    
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>  
          <line x1="12" y1="2" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>  
        </svg>    
      `;    
          
      button.style.cssText = `    
        display: inline-flex;    
        align-items: center;    
        justify-content: center;  
        padding: 0.5em;    
        margin-left: 1em;    
        cursor: pointer;    
        border-radius: 8px;    
        transition: background 0.2s;  
        width: 2.5em;  
        height: 2.5em;  
      `;    
          
      // Обробник для пульта  
      $(button).on('hover:enter', function() {    
        showActionMenu();  
      });    
          
      // Обробник для миші    
      button.addEventListener('click', function() {    
        showActionMenu();  
      });    
          
      // Hover ефекти для пульта    
      $(button).on('hover:focus', function() {    
        button.style.background = 'rgba(255, 255, 255, 0.1)';    
      });    
          
      $(button).on('hover:hover', function() {    
        button.style.background = 'rgba(255, 255, 255, 0.1)';    
      });    
          
      $(button).on('hover:blur', function() {    
        button.style.background = 'transparent';    
      });    
          
      // Hover ефекти для миші    
      button.addEventListener('mouseenter', function() {    
        button.style.background = 'rgba(255, 255, 255, 0.1)';    
      });    
          
      button.addEventListener('mouseleave', function() {    
        button.style.background = 'transparent';    
      });    
          
      return button;    
    }    
        
    // Додавання кнопки в header  
    function insertButton() {    
      var header = document.querySelector('.head');    
      if (!header) {    
        setTimeout(insertButton, 100);    
        return;    
      }    
          
      var actions = header.querySelector('.head__actions');    
      if (actions) {    
        var button = createActionButton();  
        actions.appendChild(button);  
        console.log('[ActionMenu] Кнопку меню додано в header');    
      }    
    }    
        
    // Ініціалізація    
    if (Lampa.Listener) {    
      Lampa.Listener.follow('app', function(e) {    
        if (e.type === 'ready') {    
          insertButton();    
        }    
      });    
    } else {    
      setTimeout(insertButton, 1000);    
    }    
  });    
})();