(function () {
  'use strict';

  var SOURCE_BASE = 'https://mastermagic98.github.io/l_plugins/themes';
  var AUTHOR = 'MaksTV';
  var COMPONENT = 'my_themes';

  function normalizeAssetUrl(url) {
    if (!url || typeof url !== 'string') return '';

    var clean = url.trim();

    try {
      var parsed = new URL(clean, SOURCE_BASE);
      if (parsed.pathname.indexOf('/themes/') === 0) {
        return SOURCE_BASE + parsed.pathname.replace(/^\/themes/, '') + (parsed.search || '');
      }
    } catch (e) {}

    if (clean.indexOf('/themes/') === 0) {
      return SOURCE_BASE + clean.replace(/^\/themes/, '');
    }

    if (clean.indexOf('themes/') === 0) {
      return SOURCE_BASE + '/' + clean.replace(/^themes\//, '');
    }

    return clean;
  }

  function parseSavedActivity() {
    var value = Lampa.Storage.get('themesCurrent', '');
    if (!value) return null;

    if (typeof value === 'object') return value;

    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  function saveStylesStateBeforeTheme() {
    if (Lampa.Storage.get('background') === true) {
      localStorage.setItem('myBackground', '1');
      Lampa.Storage.set('background', false);
    }

    if (Lampa.Storage.get('glass_style') === true) {
      localStorage.setItem('myGlassStyle', '1');
      Lampa.Storage.set('glass_style', false);
    }

    if (Lampa.Storage.get('black_style') === true) {
      localStorage.setItem('myBlackStyle', '1');
      Lampa.Storage.set('black_style', false);
    }
  }

  function restoreStylesStateAfterTheme() {
    if (localStorage.getItem('myBackground')) {
      Lampa.Storage.set('background', true);
      localStorage.removeItem('myBackground');
    }

    if (localStorage.getItem('myGlassStyle')) {
      Lampa.Storage.set('glass_style', true);
      localStorage.removeItem('myGlassStyle');
    }

    if (localStorage.getItem('myBlackStyle')) {
      Lampa.Storage.set('black_style', true);
      localStorage.removeItem('myBlackStyle');
    }
  }

  function clearThemeLinks() {
    $('link[data-themes-plugin="makstv"]').remove();
    $('link[rel="stylesheet"][href*="/themes/css/"]').remove();
  }

  function installTheme(cssUrl) {
    var url = normalizeAssetUrl(cssUrl);
    if (!url) return;

    clearThemeLinks();
    $('body').append('<link data-themes-plugin="makstv" rel="stylesheet" href="' + url + '">');
    localStorage.setItem('selectedTheme', url);
    saveStylesStateBeforeTheme();
  }

  function removeTheme() {
    clearThemeLinks();
    localStorage.removeItem('selectedTheme');
    restoreStylesStateAfterTheme();
  }

  function applySavedTheme() {
    var selected = localStorage.getItem('selectedTheme');
    if (!selected) return;
    installTheme(selected);
  }

  function ThemesActivity(params) {
    var network = new Lampa.Reguest();
    var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
    var body = $('<div class="themes-layer"></div>');
    var list = $('<div class="items-cards"></div>');
    var items = [];
    var activeCard = null;
    var selectedCss = localStorage.getItem('selectedTheme') || '';
    var categoryButton = $('<div class="selector view--category" style="padding:.6em 1em;display:inline-flex;align-items:center;margin:0 0 1em 0;">Категории тем</div>');
    var categories = [
      { title: 'Focus Pack', url: SOURCE_BASE + '/categories/stroke.json' },
      { title: 'Color Gallery', url: SOURCE_BASE + '/categories/color_gallery.json' },
      { title: 'Gradient Style', url: SOURCE_BASE + '/categories/gradient_style.json' }
    ];

    function showInstalledMark(card) {
      card.find('.card__quality').remove();
      card.find('.card__view').append('<div class="card__quality" style="position:absolute;left:-3%;bottom:70%;padding:.4em .4em;background:#ffe216;color:#000;font-size:.8em;border-radius:.3em;text-transform:uppercase;">Установлена</div>');
    }

    function clearInstalledMarks() {
      $('.card__quality').remove();
    }

    function selectGroup() {
      Lampa.Select.show({
        title: 'Категории тем',
        items: categories,
        onBack: function () {
          Lampa.Controller.toggle('content');
        },
        onSelect: function (item) {
          Lampa.Activity.push({
            url: item.url,
            title: item.title,
            component: COMPONENT,
            page: 1
          });
          Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
        }
      });
    }

    this.create = function () {
      var self = this;

      this.activity.loader(true);
      network.silent(
        normalizeAssetUrl(params.url),
        this.build.bind(this),
        function () {
          var empty = new Lampa.Empty();
          body.append(empty.render());

          // Bind empty.start to keep the required context and avoid this.emit errors.
          self.start = empty.start ? empty.start.bind(empty) : function () {};
          self.activity.loader(false);
          self.activity.toggle();
        }
      );

      return this.render();
    };

    this.append = function (themes) {
      themes.forEach(function (theme) {
        var card = Lampa.Template.get('card', {
          title: theme.title || 'Theme',
          release_year: ''
        });

        var logo = normalizeAssetUrl(theme.logo || '');
        var css = normalizeAssetUrl(theme.css || '');

        card.addClass('card--collection');
        card.find('.card__img').css({ cursor: 'pointer', 'background-color': '#353535a6' });
        card.css({ 'text-align': 'center' });

        var image = card.find('.card__img')[0];
        image.onload = function () {
          card.addClass('card--loaded');
        };
        image.onerror = function () {
          image.src = './img/img_broken.svg';
        };
        image.src = logo;

        if (selectedCss && css === selectedCss) {
          showInstalledMark(card);
        }

        card.on('hover:focus', function () {
          activeCard = card[0];
          scroll.update(card, true);
        });

        card.on('hover:enter', function () {
          Lampa.Select.show({
            title: '',
            items: [{ title: 'Установить' }, { title: 'Удалить' }],
            onBack: function () {
              Lampa.Controller.toggle('content');
            },
            onSelect: function (option) {
              if (option.title === 'Установить') {
                installTheme(css);
                selectedCss = normalizeAssetUrl(css);
                clearInstalledMarks();
                showInstalledMark(card);
              }

              if (option.title === 'Удалить') {
                removeTheme();
                selectedCss = '';
                clearInstalledMarks();
              }

              Lampa.Controller.toggle('content');
            }
          });
        });

        list.append(card);
        items.push(card);
      });
    };

    this.build = function (response) {
      var data = Array.isArray(response) ? response : [];

      Lampa.Background.change('');

      body.append(categoryButton);
      scroll.render().addClass('layer--wheight');
      body.append(scroll.render());
      this.append(data);
      scroll.append(list);

      categoryButton.on('hover:enter hover:click', function () {
        selectGroup();
      });

      this.activity.loader(false);
      this.activity.toggle();
    };

    this.start = function () {
      var self = this;

      Lampa.Controller.add('content', {
        toggle: function () {
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(activeCard || false, scroll.render());
        },
        left: function () {
          if (Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        right: function () {
          if (Navigator.canmove('right')) Navigator.move('right');
          else selectGroup();
        },
        up: function () {
          if (Navigator.canmove('up')) Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down: function () {
          if (Navigator.canmove('down')) Navigator.move('down');
        },
        back: function () {
          Lampa.Activity.backward();
        }
      });

      Lampa.Controller.toggle('content');
    };

    this.pause = function () {};
    this.stop = function () {};

    this.render = function () {
      return body;
    };

    this.destroy = function () {
      network.clear();
      scroll.destroy();
      body.remove();
      list.remove();
      items = null;
    };
  }

  function startPlugin() {
    Lampa.Platform.tv();
    applySavedTheme();

    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: {
        name: COMPONENT,
        type: 'static'
      },
      field: {
        name: 'Мои темы',
        description: 'Измени палитру элементов приложения. Автор: ' + AUTHOR
      },
      onRender: function (item) {
        setTimeout(function () {
          $('.settings-param > div:contains("Мои темы")').parent().insertAfter($('div[data-name="interface_size"]'));

          item.on('hover:enter', function () {
            setTimeout(function () {
              if ($('.settings-param').length || $('.settings-folder').length) {
                window.history.back();
              }
            }, 50);

            setTimeout(function () {
              var saved = parseSavedActivity() || {
                url: SOURCE_BASE + '/categories/stroke.json',
                title: 'Focus Pack',
                component: COMPONENT,
                page: 1
              };

              saved.url = normalizeAssetUrl(saved.url);
              saved.component = COMPONENT;

              Lampa.Activity.push(saved);
              Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
            }, 100);
          });
        }, 0);
      }
    });

    Lampa.Component.add(COMPONENT, ThemesActivity);

    Lampa.Storage.listener.follow('change', function (event) {
      if (event.name === 'activity' && Lampa.Activity.active().component !== COMPONENT) {
        setTimeout(function () {
          $('#button_category').remove();
        }, 0);
      }
    });
  }

  if (window.appready) {
    startPlugin();
  } else {
    Lampa.Listener.follow('app', function (event) {
      if (event.type === 'ready') startPlugin();
    });
  }
})();
