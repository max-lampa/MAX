(function () {
  'use strict';

  var BASE = 'https://max-lampa.github.io/MAX/themes';

  var CATEGORIES = [
    { title: 'Focus Pack',     url: BASE + '/categories/stroke.json' },
    { title: 'Color Gallery',  url: BASE + '/categories/color_gallery.json' },
    { title: 'Gradient Style', url: BASE + '/categories/gradient_style.json' }
  ];

  // ── Восстанавливаем тему при запуске ────────────────────────
  function restoreTheme() {
    var saved = localStorage.getItem('selectedTheme');
    if (saved) {
      $('head').append('<link rel="stylesheet" data-theme="1" href="' + saved + '">');
    }
  }

  // ── Установить тему ─────────────────────────────────────────
  function installTheme(cssUrl) {
    $('link[data-theme]').remove();
    $('head').append('<link rel="stylesheet" data-theme="1" href="' + cssUrl + '">');
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
  }

  // ── Удалить тему ────────────────────────────────────────────
  function removeTheme() {
    $('link[data-theme]').remove();
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
  }

  // ── Компонент карточек тем ───────────────────────────────────
  function ThemesComponent(params) {

    // Добавляем event emitter (без него Lampa падает с this.emit is not a function)
    var _listeners = {};
    this.on = function (event, fn) {
      if (!_listeners[event]) _listeners[event] = [];
      _listeners[event].push(fn);
      return this;
    };
    this.emit = function (event, data) {
      (_listeners[event] || []).forEach(function (fn) { fn(data); });
      return this;
    };
    this.off = function (event, fn) {
      if (_listeners[event]) {
        _listeners[event] = _listeners[event].filter(function (f) { return f !== fn; });
      }
      return this;
    };

    var self = this;
    var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
    var cards  = [];
    var wrap   = $('<div></div>');
    var grid   = $('<div class="my_themes category-full"></div>');
    var infoEl;
    var lastFocused;

    // ── create ───────────────────────────────────────────────
    this.create = function () {
      this.activity.loader(true);

      fetch(params.url)
        .then(function (r) { return r.json(); })
        .then(self.build.bind(self))
        .catch(function () {
          var empty = new Lampa.Empty();
          wrap.append(empty.render());
          self.start = empty.start.bind(empty);
          self.activity.loader(false);
          self.activity.toggle();
        });

      return this.render();
    };

    // ── append cards ─────────────────────────────────────────
    this.append = function (themes) {
      themes.forEach(function (theme) {
        var card = Lampa.Template.get('card', { title: theme.title, release_year: '' });
        card.addClass('card--collection');
        card.find('.card__img').css({ cursor: 'pointer', 'background-color': '#353535a6' });
        card.css({ 'text-align': 'center' });

        var img = card.find('.card__img')[0];
        img.onload  = function () { card.addClass('card--loaded'); };
        img.onerror = function () { img.src = './img/img_broken.svg'; };
        img.src = theme.logo;

        // Метка «Установлена»
        function markInstalled() {
          if (card.find('.card__quality').length) return;
          var badge = $('<div class="card__quality">Установлена</div>');
          card.find('.card__view').append(badge);
          badge.css({
            position: 'absolute', left: '-3%', bottom: '70%',
            padding: '0.4em', background: '#ffe216', color: '#000',
            fontSize: '0.8em', borderRadius: '0.3em', textTransform: 'uppercase'
          });
        }

        if (localStorage.getItem('selectedTheme') === theme.css) markInstalled();

        card.on('hover:focus', function () {
          lastFocused = card[0];
          scroll.update(card, true);
          if (infoEl) infoEl.find('.info__title').text(theme.title);
        });

        var cssUrl = theme.css;
        card.on('hover:enter', function () {
          Lampa.Select.show({
            title: theme.title,
            items: [{ title: 'Установить' }, { title: 'Удалить' }],
            onBack:   function () { Lampa.Controller.toggle('content'); },
            onSelect: function (item) {
              if (item.title === 'Установить') {
                installTheme(cssUrl);
                $('.card__quality').remove();
                markInstalled();
              } else {
                removeTheme();
                $('.card__quality').remove();
              }
              Lampa.Controller.toggle('content');
            }
          });
        });

        grid.append(card);
        cards.push(card);
      });
    };

    // ── build (после загрузки JSON) ──────────────────────────
    this.build = function (data) {
      Lampa.Background.change('');

      // Стили адаптивной сетки
      var style = '<style>' +
        '@media(max-width:2560px){.my_themes .card--collection{width:14.2%!important;}' +
        '.scroll__content{padding:1.5em 0!important;}.info{height:9em!important;}}' +
        '@media(max-width:580px){.info__right{display:contents!important;}' +
        '.my_themes .card--collection{width:25%!important;}}' +
        '@media(max-width:385px){.my_themes .card--collection{width:33.3%!important;}}' +
        '</style>';

      // Кнопка «Категории тем» с SVG-иконкой
      var catBtn = $('<div class="full-start__button selector view--category">' + style +
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:1.5em;height:1.5em;vertical-align:middle;margin-right:0.4em">' +
        '<path d="M20,10H4c-1.1,0-2,.9-2,2s.9,2,2,2h16c1.1,0,2-.9,2-2S21.1,10,20,10z" fill="currentColor"/>' +
        '<path d="M4,8h12c1.1,0,2-.9,2-2S17.1,4,16,4H4C2.9,4,2,4.9,2,6S2.9,8,4,8z" fill="currentColor"/>' +
        '<path d="M16,16H4c-1.1,0-2,.9-2,2s.9,2,2,2h12c1.1,0,2-.9,2-2S17.1,16,16,16z" fill="currentColor"/>' +
        '</svg>' +
        '<span>Категории тем</span></div>');

      infoEl = $('<div class="info layer--width">' +
        '<div class="info__left"><div class="info__title"></div><div class="info__title-original"></div></div>' +
        '<div class="info__right"></div>' +
        '</div>');

      infoEl.find('.info__right').append(catBtn);

      catBtn.on('hover:enter hover:click', function () { self.selectGroup(); });

      scroll.render().addClass('layer--wheight').data('mheight', infoEl);

      wrap.append(infoEl);
      wrap.append(scroll.render());

      self.append(data);
      scroll.append(grid);

      grid.append('<div style="height:25em;"></div>');

      self.activity.loader(false);
      self.activity.toggle();
    };

    // ── Выбор категории ─────────────────────────────────────
    this.selectGroup = function () {
      Lampa.Select.show({
        title: 'Категории тем',
        items: CATEGORIES,
        onSelect: function (cat) {
          Lampa.Activity.push({ url: cat.url, title: cat.title, component: 'my_themes', page: 1 });
        },
        onBack: function () { Lampa.Controller.toggle('content'); }
      });
    };

    // ── start ────────────────────────────────────────────────
    this.start = function () {
      Lampa.Controller.add('content', {
        toggle: function () {
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(lastFocused || false, scroll.render());
        },
        left:  function () { Navigator.canmove('left')  ? Navigator.move('left')  : Lampa.Controller.toggle('menu'); },
        right: function () { Navigator.canmove('right') ? Navigator.move('right') : self.selectGroup(); },
        up: function () {
          if (Navigator.canmove('up')) {
            Navigator.move('up');
          } else if (infoEl && !infoEl.find('.view--category').hasClass('focus')) {
            Lampa.Controller.collectionSet(infoEl);
            Navigator.move('right');
          } else {
            Lampa.Controller.toggle('head');
          }
        },
        down: function () {
          if (Navigator.canmove('down')) {
            Navigator.move('down');
          } else if (infoEl && infoEl.find('.view--category').hasClass('focus')) {
            Lampa.Controller.toggle('content');
          }
        },
        back: function () { Lampa.Activity.backward(); }
      });

      Lampa.Controller.toggle('content');
    };

    this.pause   = function () {};
    this.stop    = function () {};
    this.render  = function () { return wrap; };

    this.destroy = function () {
      scroll.destroy();
      wrap.remove();
      grid.remove();
      if (infoEl) infoEl.remove();
      cards   = null;
      wrap    = null;
      grid    = null;
      infoEl  = null;
      _listeners = {};
    };
  }

  // ── Регистрация и настройки ──────────────────────────────────
  function initPlugin() {
    restoreTheme();

    Lampa.Component.add('my_themes', ThemesComponent);

    Lampa.SettingsApi.addParam({
      component: 'interface',
      param:  { name: 'my_themes', type: 'static' },
      field:  { name: 'Мои темы', description: 'Измени палитру элементов приложения' },
      onRender: function (elem) {
        setTimeout(function () {
          $('.settings-param > div:contains("Мои темы")')
            .parent()
            .insertAfter($('div[data-name="interface_size"]'));

          elem.on('hover:enter', function () {
            setTimeout(function () {
              if ($('.settings-param').length || $('.settings-folder').length) {
                window.history.back();
              }
            }, 50);

            setTimeout(function () {
              var saved = Lampa.Storage.get('themesCurrent');
              var activity = (saved && saved !== '')
                ? JSON.parse(JSON.stringify(saved))
                : { url: BASE + '/categories/stroke.json', title: 'Focus Pack', component: 'my_themes', page: 1 };

              Lampa.Activity.push(activity);
              Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
            }, 100);
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
