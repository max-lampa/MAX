(function () {
  "use strict";

  Lampa.Platform.tv();

  function initThemes() {
    var savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      var themeLink = $('');
      $("head").append(themeLink);
    }

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
          $('.settings-param > div:contains("Мои темы")')
            .parent()
            .insertAfter($('div[data-name="interface_size"]'));

          item.on("hover:enter", function () {
            setTimeout(function () {
              if ($(".settings-param").length || $(".settings-folder").length) {
                window.history.back();
              }
            }, 50);

            setTimeout(function () {
              var themesCurrentRaw = Lampa.Storage.get("themesCurrent");
              var themesCurrent;
              var defaultTheme = {
                url: "https://lampa-themes.github.io/themes/categories/stroke.json",
                title: "Focus Pack",
                component: "my_themes",
                page: 1,
              };

              if (themesCurrentRaw && themesCurrentRaw !== "" && themesCurrentRaw !== "null") {
                try {
                  themesCurrent = typeof themesCurrentRaw === "string"
                    ? JSON.parse(themesCurrentRaw)
                    : themesCurrentRaw;
                  if (!themesCurrent || !themesCurrent.url || !themesCurrent.component) {
                    throw new Error("Invalid theme data");
                  }
                } catch (e) {
                  console.error("Error parsing themesCurrent:", e);
                  themesCurrent = defaultTheme;
                }
              } else {
                themesCurrent = defaultTheme;
              }

              try {
                Lampa.Activity.push(themesCurrent);

                // --- ИСПРАВЛЕНИЕ: безопасное получение активити ---
                var active = Lampa.Activity.active ? Lampa.Activity.active() : null;
                if (active) {
                  var extractedObj = Lampa.Activity.extractObject
                    ? Lampa.Activity.extractObject(active)
                    : active;
                  if (extractedObj) {
                    var currentData = {
                      url: extractedObj.url || themesCurrent.url,
                      title: extractedObj.title || themesCurrent.title,
                      component: extractedObj.component || "my_themes",
                      page: extractedObj.page || 1,
                    };
                    Lampa.Storage.set("themesCurrent", JSON.stringify(currentData));
                  }
                }
              } catch (e) {
                console.error("Error pushing activity:", e);
              }
            }, 100);
          });
        }, 0);
      },
    });

    // ===== Компонент отображения тем =====
    function ThemesComponent(object) {
      // --- ИСПРАВЛЕНИЕ: fallback для Reguest/Request ---
      var Req = (typeof Lampa.Reguest !== "undefined") ? Lampa.Reguest : Lampa.Request;
      var network = new Req();
      var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
      var items = [];
      var body = $("
");
      var cardContainer = $("
");
      var info;
      var lastFocused;

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

      this.create = function () {
        var self = this;
        this.activity.loader(true);

        network.silent(
          object.url,
          function (data) {
            self.build(data);
          },
          function (err) {
            console.error("Themes load error:", err);
            try {
              var empty = new Lampa.Empty();
              body.append(empty.render());
              self.activity.loader(false);
              // --- ИСПРАВЛЕНИЕ: безопасный вызов toggle ---
              if (self.activity && typeof self.activity.toggle === "function") {
                self.activity.toggle();
              }
            } catch (e) {
              console.error("Empty render error:", e);
            }
          }
        );

        return this.render();
      };

      this.append = function (data) {
        if (!Array.isArray(data)) {
          console.error("Invalid theme data:", data);
          return;
        }

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
          if (img) {
            img.onload = function () { card.addClass("card--loaded"); };
            img.onerror = function () { img.src = "./img/img_broken.svg"; };
            img.src = theme.logo || "";
          }

          $(".info__title").remove();

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
              borderRadius: "0.3em",
              textTransform: "uppercase",
            });
          }

          var currentTheme = localStorage.getItem("selectedTheme");
          if (currentTheme && theme.css === currentTheme) {
            addInstalledBadge();
          }

          card.on("hover:focus", function () {
            lastFocused = card[0];
            scroll.update(card, true);
            if (info) info.find(".info__title").text(theme.title || "");
          });

          var themeCss = theme.css;

          card.on("hover:enter", function () {
            Lampa.Select.show({
              title: theme.title,
              items: [{ title: "Установить" }, { title: "Удалить" }],
              onBack: function () {
                Lampa.Controller.toggle("content");
              },
              onSelect: function (selected) {
                if (selected.title === "Установить") {
                  $('link[rel="stylesheet"][href^="https://lampa-themes.github.io/themes/css/"]').remove();
                  $("head").append($(''));
                  localStorage.setItem("selectedTheme", themeCss);

                  $(".card__quality").remove();
                  addInstalledBadge();

                  var myBg = localStorage.getItem("myBackground");
                  if (myBg) {
                    Lampa.Storage.set("myBackground", myBg);
                  } else {
                    Lampa.Storage.set("myBackground", true);
                  }
                  Lampa.Storage.set("background", false);

                  var myGlass = localStorage.getItem("glass_style");
                  if (myGlass) {
                    Lampa.Storage.set("myGlassStyle", myGlass);
                  } else {
                    Lampa.Storage.set("myGlassStyle", true);
                  }
                  Lampa.Storage.set("glass_style", false);

                  var myBlack = localStorage.getItem("black_style");
                  Lampa.Storage.set("myBlackStyle", myBlack || false);
                  Lampa.Storage.set("black_style", false);

                  Lampa.Controller.toggle("content");

                } else if (selected.title === "Удалить") {
                  $('link[rel="stylesheet"][href^="https://lampa-themes.github.io/themes/css/"]').remove();
                  localStorage.removeItem("selectedTheme");
                  $(".card__quality").remove();

                  if (localStorage.getItem("myBackground") !== null) {
                    Lampa.Storage.set("background", Lampa.Storage.get("myBackground"));
                  }
                  localStorage.removeItem("myBackground");

                  if (localStorage.getItem("myGlassStyle") !== null) {
                    Lampa.Storage.set("glass_style", Lampa.Storage.get("myGlassStyle"));
                  }
                  localStorage.removeItem("myGlassStyle");

                  if (localStorage.getItem("myBlackStyle") !== null) {
                    Lampa.Storage.set("black_style", Lampa.Storage.get("myBlackStyle"));
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

      this.build = function (data) {
        var self = this;

        Lampa.Background.change("");

        Lampa.Template.add(
          "button_category",
          '\
          
Категории тем
'
        );

        Lampa.Template.add(
          "info_tvtv",
          '
'
        );

        var categoryButton = Lampa.Template.get("button_category");
        info = Lampa.Template.get("info_tvtv");
        info.find(".info__right").append(categoryButton);

        info.find(".view--category").on("hover:enter hover:click", function () {
          self.selectGroup();
        });

        scroll.render().addClass("layer--wheight").data("mheight", info);
        body.append(info);
        body.append(scroll.render());

        this.append(data);
        scroll.append(cardContainer);

        // --- ИСПРАВЛЕНИЕ: безопасный вызов loader и toggle ---
        try {
          this.activity.loader(false);
          if (typeof this.activity.toggle === "function") {
            this.activity.toggle();
          }
        } catch (e) {
          console.error("Activity toggle error:", e);
        }
      };

      this.selectGroup = function () {
        Lampa.Select.show({
          title: "Категории тем",
          items: categories,
          onSelect: function (selected) {
            try {
              Lampa.Activity.push({
                url: selected.url,
                title: selected.title,
                component: "my_themes",
                page: 1,
              });

              var active = Lampa.Activity.active ? Lampa.Activity.active() : null;
              if (active) {
                var extractedObj = Lampa.Activity.extractObject
                  ? Lampa.Activity.extractObject(active)
                  : active;
                if (extractedObj) {
                  Lampa.Storage.set("themesCurrent", JSON.stringify({
                    url: extractedObj.url || selected.url,
                    title: extractedObj.title || selected.title,
                    component: extractedObj.component || "my_themes",
                    page: extractedObj.page || 1,
                  }));
                }
              }
            } catch (e) {
              console.error("selectGroup push error:", e);
            }
          },
          onBack: function () {
            Lampa.Controller.toggle("content");
          },
        });
      };

      // --- ИСПРАВЛЕНИЕ: убран this.emit, используем только Lampa API ---
      this.start = function () {
        var self = this;

        Lampa.Controller.add("content", {
          toggle: function () {
            Lampa.Controller.collectionSet(scroll.render());
            Lampa.Controller.collectionFocus(lastFocused || false, scroll.render());
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
              if (info && !info.find(".view--category").hasClass("focus")) {
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
              if (info && info.find(".view--category").hasClass("focus")) {
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
        try { network.clear(); } catch(e) {}
        try { scroll.destroy(); } catch(e) {}
        if (info) { try { info.remove(); } catch(e) {} }
        try { body.remove(); } catch(e) {}
        try { cardContainer.remove(); } catch(e) {}
        network = null;
        items = null;
        body = null;
        cardContainer = null;
        info = null;
      };
    }

    Lampa.Component.add("my_themes", ThemesComponent);
  }

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