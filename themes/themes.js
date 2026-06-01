(function () {
  'use strict';

  var BASE = 'https://max-lampa.github.io/MAX/themes';

  var CATEGORIES = [
    {
      title: 'Focus Pack',
      url: BASE + '/categories/stroke.json'
    },
    {
      title: 'Color Gallery',
      url: BASE + '/categories/color_gallery.json'
    },
    {
      title: 'Gradient Style',
      url: BASE + '/categories/gradient_style.json'
    }
  ];

  // Восстанавливаем тему при запуске
  function restoreTheme() {
    var saved = localStorage.getItem('selectedTheme');
    if (saved) {
      $('head').append('<link rel="stylesheet" href="' + saved + '">');
    }
  }

  // Загружаем JSON через fetch
  function loadJSON(url, callback) {
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(callback)
      .catch(function () {
        Lampa.Noty.show('Не удалось загрузить темы');
      });
  }

  // Установить тему
  function installTheme(cssUrl) {
    $('link[data-theme]').remove();
    var link = $('<link rel="stylesheet" data-theme="1">').attr('href', cssUrl);
    $('head').append(link);
    localStorage.setItem('selectedTheme', cssUrl);

    if (Lampa.Storage.get('background') == true) {
      Lampa.Storage.set('myBackground', Lampa.Storage.get('background'));
      Lampa.Storage.set('background', 'false');
    }
    if (Lampa.Storage.get('glass_style') == true) {
      Lampa.Storage.set('myGlassStyle', Lampa.Storage.get('glass_style'));
      Lampa.Storage.set('glass_style', 'false');
    }
    if (Lampa.Storage.get('black_style') == true) {
      Lampa.Storage.set('myBlackStyle', Lampa.Storage.get('black_style'));
      Lampa.Storage.set('black_style', 'false');
    }
    Lampa.Noty.show('Тема установлена');
  }

  // Снять тему
  function removeTheme() {
    $('link[data-theme]').remove();
    $('link[rel="stylesheet"][href^="' + BASE + '"]').remove();
    localStorage.removeItem('selectedTheme');

    if (localStorage.getItem('myBackground')) {
      Lampa.Storage.set('background', Lampa.Storage.get('myBackground'));
      localStorage.removeItem('myBackground');
    }
    if (localStorage.getItem('myGlassStyle')) {
      Lampa.Storage.set('glass_style', Lampa.Storage.get('myGlassStyle'));
      localStorage.removeItem('myGlassStyle');
    }
    if (localStorage.getItem('myBlackStyle')) {
      Lampa.Storage.set('black_style', Lampa.Storage.get('myBlackStyle'));
      localStorage.removeItem('myBlackStyle');
    }
    Lampa.Noty.show('Тема удалена');
  }

  // Показываем список тем из категории
  function showThemes(categoryUrl) {
    loadJSON(categoryUrl, function (themes) {
      var current = localStorage.getItem('selectedTheme');
      var items = themes.map(function (t) {
        var label = t.title;
        if (t.css === current) label = '✓ ' + label;
        return { title: label, css: t.css };
      });
      items.push({ title: '✕ Удалить текущую тему', remove: true });

      Lampa.Select.show({
        title: 'Выбери тему',
        items: items,
        onBack: function () {
          Lampa.Controller.toggle('settings_component');
        },
        onSelect: function (item) {
          if (item.remove) {
            removeTheme();
            Lampa.Controller.toggle('settings_component');
          } else {
            Lampa.Select.show({
              title: item.title,
              items: [{ title: 'Установить' }, { title: 'Отмена' }],
              onBack: function () {
                showThemes(categoryUrl);
              },
              onSelect: function (action) {
                if (action.title === 'Установить') {
                  installTheme(item.css);
                }
                Lampa.Controller.toggle('settings_component');
              }
            });
          }
        }
      });
    });
  }

  // Показываем выбор категории
  function showCategories() {
    Lampa.Select.show({
      title: 'Мои темы',
      items: CATEGORIES,
      onBack: function () {
        Lampa.Controller.toggle('settings_component');
      },
      onSelect: function (cat) {
        showThemes(cat.url);
      }
    });
  }

  function initPlugin() {
    restoreTheme();

    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: {
        name: 'my_themes',
        type: 'static'
      },
      field: {
        name: 'Мои темы',
        description: 'Измени палитру элементов приложения'
      },
      onRender: function (elem) {
        setTimeout(function () {
          $('.settings-param > div:contains("Мои темы")')
            .parent()
            .insertAfter($('div[data-name="interface_size"]'));

          elem.on('hover:enter', function () {
            showCategories();
          });
        }, 0);
      }
    });
  }

  if (window.appready) {
    initPlugin();
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') initPlugin();
    });
  }

})();
