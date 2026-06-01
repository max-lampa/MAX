(function () {
  "use strict";

  Lampa.Platform.tv();

  function initThemes() {
    // Применяем сохранённую тему при загрузке
    var savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      var themeLink = $(
        '<link rel="stylesheet" href="' + savedTheme + '">'
      );
      $("head").append(themeLink);
    }

    // Добавляем пункт настроек "Мои темы"
    Lampa.SettingsApi.addParam({
      component: "interface",
      param: {
        name: "my_themes",
        type: "static",
      },
      field: {
        name: "Мои темы",
        description: "Измени палитру элементов приложения",
      },
      onRender: function (item) {
        setTimeout(function () {
          // Перемещаем пункт после "Размер интерфейса"
          $('.settings-param > div:contains("Мои темы")')
            .parent()
            .insertAfter($('div[data-name="interface_size"]'));

          item.on("hover:enter", function () {
            // Закрываем настройки если открыты
            setTimeout(function () {
              if (
                $(".settings-param").length ||
                $(".settings-folder").length
              ) {
                window.history.back();
              }
            }, 50);

            // Загружаем текущую категорию или дефолтную
            setTimeout(function () {
              var themesCurrentRaw = Lampa.Storage.get("themesCurrent");
              var themesCurrent;

              if (
                themesCurrentRaw &&
                themesCurrentRaw !== "" &&
                themesCurrentRaw !== "null"
              ) {
                try {
                  if (typeof themesCurrentRaw === "string") {
                    themesCurrent = JSON.parse(themesCurrentRaw);
                  } else {
                    themesCurrent = themesCurrentRaw;
                  }
                  if (
                    !themesCurrent ||
                    !themesCurrent.url ||
                    !themesCurrent.component
                  ) {
                    throw new Error("Invalid theme data");
                  }
                } catch (e) {
                  console.error("Error parsing themesCurrent:", e);
                  themesCurrent = {
                    url: "https://lampa-themes.github.io/themes/categories/stroke.json",
                    title: "Focus Pack",
                    component: "my_themes",
                    page: 1,
                  };
                }
              } else {
                themesCurrent = {
                  url: "https://lampa-themes.github.io/themes/categories/stroke.json",
                  title: "Focus Pack",
                  component: "my_themes",
                  page: 1,
                };
              }

              Lampa.Activity.push(themesCurrent);

              var extractedObj = Lampa.Activity.extractObject(
                Lampa.Activity.active()
              );
              var currentData = {
                url: extractedObj.url,
                title: extractedObj.title,
                component: extractedObj.component,
                page: extractedObj.page || 1,
              };
              Lampa.Storage.set(
                "themesCurrent",
                JSON.stringify(currentData)
              );
            }, 100);
          });
        }, 0);
      },
    });

    // ===== Компонент отображения тем =====
    function ThemesComponent(object) {
      var network = new Lampa.Reguest();
      var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
      var items = [];
      var body = $("<div></div>");
      var cardContainer = $("<div></div>");
      var info;
      var lastFocused;

      // Список категорий
      var categories = [
        {
          title: "Focus Pack",
          url: "https://lampa-themes.github.io/themes/categories/stroke.json",
        },
        {
          title: "Color Gallery",
          url: "https://lampa-themes.github.io/themes/categories/color_gallery.json",
        },
        {
          title: "Gradient Style",
          url: "https://lampa-themes.github.io/themes/categories/gradient_style.json",
        },
      ];

      // === Создание (загрузка данных) ===
      this.create = function () {
        var self = this;
        this.activity.loader(true);

        network.silent(
          object.url,
          this.build.bind(this),
          function () {
            var empty = new Lampa.Empty();
            body.append(empty.render());
            self.start = empty.start;
            self.activity.loader(false);
            self.activity.toggle();
          }
        );

        return this.render();
      };

      // === Добавление карточек тем ===
      this.append = function (data) {
        data.forEach(function (theme) {
          var card = Lampa.Template.get("card", {
            title: theme.title,
            release_year: "",
          });
          card.addClass("card--collection");
          card.find(".card__img").css({
            cursor: "pointer",
            "background-color": "#353535a6",
          });
          card.css({ "text-align": "center" });

          var img = card.find(".card__img")[0];
          img.onload = function () {
            card.addClass("card--loaded");
          };
          img.onerror = function () {
            img.src = "./img/img_broken.svg";
          };
          img.src = theme.logo;

          $(".info__title").remove();

          // Метка "Установлена"
          function addInstalledBadge() {
            var badge = document.createElement("div");
            badge.innerText = "Установлена";
            badge.classList.add("card__quality");
            card.find(".card__view").append(badge);
            $(badge).css({
              position: "absolute",
              left: "70%",
              bottom: "-3%",
              padding: "0.4em 0.4em",
              background: "#ffe216",
              color: "#000",
              fontSize: "0.8em",
              WebkitBorderRadius: "0.3em",
              MozBorderRadius: "0.3em",
              borderRadius: "0.3em",
              textTransform: "uppercase",
            });
          }

          // Проверяем, установлена ли эта тема
          var currentTheme = localStorage.getItem("selectedTheme");
          if (currentTheme && theme.css === currentTheme) {
            addInstalledBadge();
          }

          // Фокус на карточке
          card.on("hover:focus", function () {
            lastFocused = card[0];
            scroll.update(card, true);
            info.find(".info__title").text(theme.title);
          });

          var themeCss = theme.css;

          // Клик по карточке — меню установки/удаления
          card.on("hover:enter", function () {
            var menuItems = [];
            menuItems.push({ title: "Установить" });
            menuItems.push({ title: "Удалить" });

            Lampa.Select.show({
              title: theme.title,
              items: menuItems,
              onBack: function () {
                Lampa.Controller.toggle("content");
              },
              onSelect: function (selected) {
                if (selected.title === "Установить") {
                  // Удаляем старую тему
                  $(
                    'link[rel="stylesheet"][href^="https://lampa-themes.github.io/themes/css/"]'
                  ).remove();

                  // Добавляем новую
                  var newLink = $(
                    '<link rel="stylesheet" href="' + themeCss + '">'
                  );
                  $("head").append(newLink);
                  localStorage.setItem("selectedTheme", themeCss);
                  console.log("Тема установлена:", themeCss);

                  // Удаляем все старые метки
                  if ($(".card__quality").length > 0) {
                    $(".card__quality").remove();
                  }
                  addInstalledBadge();

                  // Сохраняем/управляем фоном
                  var myBg = localStorage.getItem("myBackground");
                  if (myBg) {
                    Lampa.Storage.set("myBackground", myBg);
                    Lampa.Storage.set("background", false);
                  } else {
                    Lampa.Storage.set("myBackground", true);
                    Lampa.Storage.set("background", false);
                  }

                  // Сохраняем/управляем стеклянным стилем
                  var myGlass = localStorage.getItem("glass_style");
                  if (myGlass) {
                    Lampa.Storage.set("myGlassStyle", myGlass);
                    Lampa.Storage.set("glass_style", false);
                  } else {
                    Lampa.Storage.set("myGlassStyle", true);
                    Lampa.Storage.set("glass_style", false);
                  }

                  // Сохраняем/управляем чёрным стилем
                  var myBlack = localStorage.getItem("black_style");
                  if (myBlack) {
                    Lampa.Storage.set("myBlackStyle", myBlack);
                    Lampa.Storage.set("black_style", false);
                  } else {
                    Lampa.Storage.set("myBlackStyle", false);
                    Lampa.Storage.set("black_style", false);
                  }

                  Lampa.Controller.toggle("content");
                } else if (selected.title === "Удалить") {
                  // Удаляем тему
                  $(
                    'link[rel="stylesheet"][href^="https://lampa-themes.github.io/themes/css/"]'
                  ).remove();
                  localStorage.removeItem("selectedTheme");
                  $(".card__quality").remove();

                  // Восстанавливаем фон
                  if (localStorage.getItem("myBackground") !== null) {
                    Lampa.Storage.set(
                      "background",
                      Lampa.Storage.get("myBackground")
                    );
                  }
                  localStorage.removeItem("myBackground");

                  // Восстанавливаем стеклянный стиль
                  if (localStorage.getItem("myGlassStyle") !== null) {
                    Lampa.Storage.set(
                      "glass_style",
                      Lampa.Storage.get("myGlassStyle")
                    );
                  }
                  localStorage.removeItem("myGlassStyle");

                  // Восстанавливаем чёрный стиль
                  if (localStorage.getItem("myBlackStyle") !== null) {
                    Lampa.Storage.set(
                      "black_style",
                      Lampa.Storage.get("myBlackStyle")
                    );
                  }
                  localStorage.removeItem("myBlackStyle");

                  Lampa.Controller.toggle("content");
                }
              },
            });
          });

          cardContainer.append(card);
          items.push(card);
        });
      };

      // === Построение интерфейса ===
      this.build = function (data) {
        var self = this;

        Lampa.Background.change("");

        // Регистрируем шаблон стилей
        Lampa.Template.add(
          "button_category",
          '\
          <style>\
            .my_themes .card--collection {\
              display: inline-block;\
              vertical-align: top;\
              width: 20% !important;\
              margin: 0 0 20px 0 !important;\
              padding: 0 10px !important;\
              box-sizing: border-box !important;\
            }\
            .my_themes .scroll__content {\
              display: flex !important;\
              flex-wrap: wrap !important;\
              margin: 0 -10px !important;\
              padding: 20px !important;\
            }\
            /* Планшеты */\
            @media screen and (max-width: 1200px) {\
              .my_themes .card--collection { width: 25% !important; }\
            }\
            @media screen and (max-width: 900px) {\
              .my_themes .card--collection { width: 33.3% !important; }\
            }\
            /* Большие телефоны */\
            @media screen and (max-width: 768px) {\
              .my_themes .card--collection { width: 33.3% !important; }\
            }\
            /* Средние телефоны */\
            @media screen and (max-width: 600px) {\
              .my_themes .card--collection { width: 50% !important; }\
            }\
            /* Маленькие телефоны */\
            @media screen and (max-width: 480px) {\
              .my_themes .card--collection { width: 50% !important; }\
              .my_themes .scroll__content {\
                padding: 15px 10px !important;\
                margin: 0 -5px !important;\
              }\
              .my_themes .card--collection {\
                padding: 0 5px !important;\
                margin: 0 0 15px 0 !important;\
              }\
            }\
            /* Очень маленькие телефоны */\
            @media screen and (max-width: 360px) {\
              .my_themes .card--collection { width: 50% !important; }\
            }\
            .info__right { display: contents !important; }\
            .info { height: 9em !important; }\
            .info__title-original { font-size: 1.2em; }\
          </style>\
          <div class="view--category" style="padding: 0;">\
            Категории тем\
          </div>\n\
        '
        );

        // Регистрируем шаблон инфо-блока
        Lampa.Template.add(
          "info_tvtv",
          '<div class="info layer--width"><div class="info__right"><div class="info__title"></div></div></div>'
        );

        var categoryButton = Lampa.Template.get("button_category");
        info = Lampa.Template.get("info_tvtv");
        info.find(".info__right").append(categoryButton);

        // Обработчик клика по "Категории тем"
        info.find(".view--category").on("hover:enter hover:click", function () {
          self.selectGroup();
        });

        scroll.render().addClass("layer--wheight").data("mheight", info);
        body.append(info.append());
        body.append(scroll.render());

        this.append(data);
        scroll.append(cardContainer);

        // Добавляем класс для стилизации
        var wrapper = '<div class="my_themes"></div>';
        $(".my_themes").append(wrapper);

        this.activity.loader(false);
        this.activity.toggle();
      };

      // === Выбор категории ===
      this.selectGroup = function () {
        Lampa.Select.show({
          title: "Категории тем",
          items: categories,
          onSelect: function (selected) {
            Lampa.Activity.push({
              url: selected.url,
              title: selected.title,
              component: "my_themes",
              page: 1,
            });

            var extractedObj = Lampa.Activity.extractObject(
              Lampa.Activity.active()
            );
            var currentData = {
              url: extractedObj.url,
              title: extractedObj.title,
              component: extractedObj.component,
              page: extractedObj.page || 1,
            };
            Lampa.Storage.set(
              "themesCurrent",
              JSON.stringify(currentData)
            );
          },
          onBack: function () {
            Lampa.Controller.toggle("content");
          },
        });
      };

      // === Управление навигацией ===
      this.start = function () {
        var self = this;

        Lampa.Controller.add("content", {
          toggle: function () {
            Lampa.Controller.collectionSet(scroll.render());
            Lampa.Controller.collectionFocus(
              lastFocused || false,
              scroll.render()
            );
          },
          left: function () {
            if (Navigator.canmove("left")) {
              Navigator.move("left");
            } else {
              Lampa.Controller.toggle("menu");
            }
          },
          right: function () {
            if (Navigator.canmove("right")) {
              Navigator.move("right");
            } else {
              self.selectGroup();
            }
          },
          up: function () {
            if (Navigator.canmove("up")) {
              Navigator.move("up");
            } else {
              if (
                !info.find(".view--category").hasClass("focus")
              ) {
                Lampa.Controller.collectionSet(info);
                Navigator.move("right");
              } else {
                Lampa.Controller.toggle("head");
              }
            }
          },
          down: function () {
            if (Navigator.canmove("down")) {
              Navigator.move("down");
            } else {
              if (
                info.find(".view--category").hasClass("focus")
              ) {
                Lampa.Controller.toggle("content");
              }
            }
          },
          back: function () {
            Lampa.Activity.backward();
          },
        });

        Lampa.Controller.toggle("content");
      };

      this.pause = function () {};
      this.stop = function () {};

      this.render = function () {
        return body;
      };

      this.destroy = function () {
        network.clear();
        scroll.destroy();
        if (info) info.remove();
        body.remove();
        cardContainer.remove();
        network = null;
        items = null;
        body = null;
        cardContainer = null;
        info = null;
      };
    }

    // Регистрируем компонент
    Lampa.Component.add("my_themes", ThemesComponent);
  }

  // === Запуск плагина ===
  if (window.appready) {
    initThemes();
  } else {
    Lampa.Listener.follow("app", function (event) {
      if (event.type === "ready") {
        initThemes();
      }
    });
  }
})();