(function () {
  'use strict';

  Lampa.Platform.tv();

  function initPlugin() {

    // Восстанавливаем сохранённую тему при запуске
    var savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      var themeLink = $('<link rel="stylesheet" href="' + savedTheme + '">');
      $('body').append(themeLink);
    }

    // Добавляем пункт "Мои темы" в раздел "Интерфейс" настроек
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
          // Перемещаем пункт сразу после параметра interface_size
          $('.settings-param > div:contains("Мои темы")')
            .parent()
            .insertAfter($('div[data-name="interface_size"]'));

          elem.on('hover:enter', function () {
            // Закрываем текущий экран настроек
            setTimeout(function () {
              if ($('.settings-param').length || $('.settings-folder').length) {
                window.history.back();
              }
            }, 50);

            // Открываем активность просмотра тем
            setTimeout(function () {
              var current = Lampa.Storage.get('themesCurrent');
              var activity;

              if (current !== '') {
                activity = JSON.parse(JSON.stringify(current));
              } else {
                activity = {
                  url: 'https://bylampa.github.io/themes/categories/stroke.json',
                  title: 'Focus Pack',
                  component: 'my_themes',
                  page: 1
                };
              }

              Lampa.Activity.push(activity);
              Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
            }, 100);
          });
        }, 0);
      }
    });

    // ─────────────────────────────────────────────────────────────
    // Компонент my_themes — экран выбора тем
    // ─────────────────────────────────────────────────────────────
    function ThemesComponent(params) {
      var request   = new Lampa.Reguest();
      var scroll    = new Lampa.Scroll({ mask: true, over: true, step: 250 });
      var cards     = [];
      var wrap      = $('<div></div>');
      var grid      = $('<div class="my_themes category-full"></div>');
      var infoBlock;
      var lastFocused;

      var categories = [
        { title: 'Focus Pack',     url: 'https://max-lampa.github.io/MAX/themes/categories/stroke.json' },
        { title: 'Color Gallery',  url: 'https://max-lampa.github.io/MAX/themes/categories/color_gallery.json' },
        { title: 'Gradient Style', url: 'https://max-lampa.github.io/MAX/themes/categories/gradient_style.json' }
      ];

      // ── Запуск ──────────────────────────────────────────────────
      this.create = function () {
        var self = this;
        this.activity.loader(true);

        request.silent(
          params.url,
          this.build.bind(this),
          function () {
            var empty = new Lampa.Empty();
            wrap.append(empty.render());
            self.start = empty.start;
            self.activity.loader(false);
            self.activity.toggle();
          }
        );

        return this.render();
      };

      // ── Рендер карточек ─────────────────────────────────────────
      this.append = function (items) {
        items.forEach(function (theme) {
          var card = Lampa.Template.get('card', {
            title: theme.title,
            release_year: ''
          });

          card.addClass('card--collection');
          card.find('.card__img').css({
            cursor: 'pointer',
            'background-color': '#353535a6'
          });
          card.css({ 'text-align': 'center' });

          var img = card.find('.card__img')[0];
          img.onload  = function () { card.addClass('card--loaded'); };
          img.onerror = function () { img.src = './img/img_broken.svg'; };
          img.src = theme.logo;

          $('.info__title').remove();

          // Метка «Установлена»
          function markInstalled() {
            var badge = document.createElement('div');
            badge.innerText = 'Установлена';
            badge.classList.add('card__quality');
            card.find('.card__view').append(badge);
            $(badge).css({
              position: 'absolute',
              left: '-3%',
              bottom: '70%',
              padding: '0.4em 0.4em',
              background: '#ffe216',
              color: '#000',
              fontSize: '0.8em',
              WebkitBorderRadius: '0.3em',
              MozBorderRadius: '0.3em',
              borderRadius: '0.3em',
              textTransform: 'uppercase'
            });
          }

          // Отмечаем уже установленную тему
          var active = localStorage.getItem('selectedTheme');
          if (active && theme.css === active) {
            markInstalled();
          }

          // Фокус карточки
          card.on('hover:focus', function () {
            lastFocused = card[0];
            scroll.update(card, true);
            infoBlock.find('.info__title').text(theme.title);
          });

          // Выбор действия при нажатии
          var cssUrl = theme.css;
          card.on('hover:enter', function () {
            Lampa.Select.show({
              title: '',
              items: [{ title: 'Установить' }, { title: 'Удалить' }],
              onBack: function () {
                Lampa.Controller.toggle('content');
              },
              onSelect: function (item) {
                if (item.title === 'Установить') {
                  // Удаляем старую тему
                  $('link[rel="stylesheet"][href^="https://max-lampa.github.io/MAX/themes/css/"]').remove();

                  // Подключаем новую
                  var link = $('<link rel="stylesheet" href="' + cssUrl + '">');
                  $('body').append(link);
                  localStorage.setItem('selectedTheme', cssUrl);

                  // Обновляем метку
                  $('.card__quality').remove();
                  markInstalled();

                  // Сохраняем и отключаем конфликтующие настройки
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

                  Lampa.Controller.toggle('content');

                } else if (item.title === 'Удалить') {
                  // Снимаем тему
                  $('link[rel="stylesheet"][href^="https://max-lampa.github.io/MAX/themes/css/"]').remove();
                  localStorage.removeItem('selectedTheme');
                  $('.card__quality').remove();

                  // Восстанавливаем сохранённые настройки
                  if (localStorage.getItem('myBackground')) {
                    Lampa.Storage.set('background', Lampa.Storage.get('myBackground'));
                  }
                  localStorage.removeItem('myBackground');

                  if (localStorage.getItem('myGlassStyle')) {
                    Lampa.Storage.set('glass_style', Lampa.Storage.get('myGlassStyle'));
                  }
                  localStorage.removeItem('myGlassStyle');

                  if (localStorage.getItem('myBlackStyle')) {
                    Lampa.Storage.set('black_style', Lampa.Storage.get('myBlackStyle'));
                  }
                  localStorage.removeItem('myBlackStyle');

                  Lampa.Controller.toggle('content');
                }
              }
            });
          });

          grid.append(card);
          cards.push(card);
        });
      };

      // ── Сборка экрана после загрузки JSON ───────────────────────
      this.build = function (data) {
        var self = this;
        Lampa.Background.change('');

        // Шаблон кнопки «Категории тем»
        Lampa.Template.add('button_category',
          "<div id='button_category'>" +
          "<style>" +
          "@media screen and (max-width: 2560px){" +
            ".themes .card--collection{width:14.2%!important;}" +
            ".scroll__content{padding:1.5em 0!important;}" +
            ".info{height:9em!important;}" +
            ".info__title-original{font-size:1.2em;}" +
          "}" +
          "@media screen and (max-width: 580px){" +
            ".info__right{display:contents!important;}" +
            ".themes .card--collection{width:25%!important;}" +
          "}" +
          "@media screen and (max-width: 385px){" +
            ".info__right{display:contents!important;}" +
            ".themes .card--collection{width:33.3%!important;}" +
          "}" +
          "</style>" +
          "<div class='full-start__button selector view--category'>" +
          "<svg style='enable-background:new 0 0 512 512;' version='1.1' viewBox='0 0 24 24' " +
               "xml:space='preserve' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>" +
            "<g id='info'/>" +
            "<g id='icons'><g id='menu'>" +
              "<path d='M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z' fill='currentColor'/>" +
              "<path d='M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z' fill='currentColor'/>" +
              "<path d='M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z' fill='currentColor'/>" +
            "</g></g>" +
          "</svg>" +
          " <span>Категории тем</span>" +
          "</div></div>"
        );

        // Шаблон информационной панели
        Lampa.Template.add('info_themes',
          "<div class='info layer--width'>" +
            "<div class='info__left'>" +
              "<div class='info__title'></div>" +
              "<div class='info__title-original'></div>" +
              "<div class='info__create'></div>" +
            "</div>" +
            "<div class='info__right'>" +
              "<div id='stantion_filtr'></div>" +
            "</div>" +
          "</div>"
        );

        var categoryBtn = Lampa.Template.get('button_category');
        infoBlock = Lampa.Template.get('info_themes');
        infoBlock.find('#stantion_filtr').append(categoryBtn);

        // Кнопка «Категории тем»
        infoBlock.find('.view--category').on('hover:enter hover:click', function () {
          self.selectGroup();
        });

        scroll.render()
          .addClass('layer--wheight')
          .data('mheight', infoBlock);

        wrap.append(infoBlock);
        wrap.append(scroll.render());

        this.append(data);
        scroll.append(grid);

        // Нижний отступ для прокрутки
        $('.my_themes').append('<div id="spacer" style="height:25em;"></div>');

        this.activity.loader(false);
        this.activity.toggle();
      };

      // ── Выбор категории ─────────────────────────────────────────
      this.selectGroup = function () {
        Lampa.Select.show({
          title: 'Категории тем',
          items: categories,
          onSelect: function (cat) {
            Lampa.Activity.push({
              url: cat.url,
              title: cat.title,
              component: 'my_themes',
              page: 1
            });
            Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
          },
          onBack: function () {
            Lampa.Controller.toggle('content');
          }
        });
      };

      // ── Управление ──────────────────────────────────────────────
      this.start = function () {
        var self = this;

        Lampa.Controller.add('content', {
          toggle: function () {
            Lampa.Controller.collectionSet(scroll.render());
            Lampa.Controller.collectionFocus(lastFocused || false, scroll.render());
          },
          left: function () {
            if (Navigator.canmove('left')) {
              Navigator.move('left');
            } else {
              Lampa.Controller.toggle('menu');
            }
          },
          right: function () {
            if (Navigator.canmove('right')) {
              Navigator.move('right');
            } else {
              self.selectGroup();
            }
          },
          up: function () {
            if (Navigator.canmove('up')) {
              Navigator.move('up');
            } else if (!infoBlock.find('.view--category').hasClass('focus')) {
              Lampa.Controller.collectionSet(infoBlock);
              Navigator.move('right');
            } else {
              Lampa.Controller.toggle('head');
            }
          },
          down: function () {
            if (Navigator.canmove('down')) {
              Navigator.move('down');
            } else if (infoBlock.find('.view--category').hasClass('focus')) {
              Lampa.Controller.toggle('content');
            }
          },
          back: function () {
            Lampa.Activity.backward();
          }
        });

        Lampa.Controller.toggle('content');
      };

      this.pause   = function () {};
      this.stop    = function () {};
      this.render  = function () { return wrap; };

      this.destroy = function () {
        request.clear();
        scroll.destroy();
        if (infoBlock) infoBlock.remove();
        wrap.remove();
        grid.remove();
        request = null;
        cards   = null;
        wrap    = null;
        grid    = null;
        infoBlock = null;
      };
    }

    // Регистрируем компонент
    Lampa.Component.add('my_themes', ThemesComponent);

    // Убираем кнопку категорий при выходе из экрана тем
    Lampa.Storage.listener.follow('change', function (event) {
      if (event.name === 'activity') {
        if (Lampa.Activity.active().component !== 'my_themes') {
          setTimeout(function () {
            $('#button_category').remove();
          }, 0);
        }
      }
    });
  }

  // Запускаем плагин когда приложение готово
  if (window.appready) {
    initPlugin();
  } else {
    Lampa.Listener.follow('app', function (event) {
      if (event.type === 'ready') {
        initPlugin();
      }
    });
  }

})();
