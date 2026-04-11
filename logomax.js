(function () {
	"use strict";


    if (document.currentScript && document.currentScript.src.indexOf('ko31k') === -1) {
        return;
	}

	var ОТКЛЮЧИТЬ_КЕШ = false;

	function запуститьПлагин() {
		var БЕЗОПАСНАЯ_ЗАДЕРЖКА = 200;
		var ЗАТУХАНИЕ_ТЕКСТА = 300;
		var ИЗМЕНЕНИЕ_ВЫСОТЫ = 400;
		var ПОЯВЛЕНИЕ_ИЗОБРАЖЕНИЯ = 400;

		var ОТСТУП_СВЕРХУ_EM = 0;
		var ОТСТУП_СНИЗУ_EM = 0.2;

		window.logoplugin = true;

		function анимироватьВысоту(элемент, начало, конец, длительность, колбэк) {
			var времяНачала = null;
			function шаг(временнаяМетка) {
				if (!времяНачала) времяНачала = временнаяМетка;
				var прогресс = временнаяМетка - времяНачала;
				var процент = Math.min(прогресс / длительность, 1);
				var плавность = 1 - Math.pow(1 - процент, 3);
				элемент.style.height = начало + (конец - начало) * плавность + "px";
				if (прогресс < длительность) {
					requestAnimationFrame(шаг);
				} else {
					if (колбэк) колбэк();
				}
			}
			requestAnimationFrame(шаг);
		}

		function анимироватьПрозрачность(элемент, начало, конец, длительность, колбэк) {
			var времяНачала = null;
			function шаг(временнаяМетка) {
				if (!времяНачала) времяНачала = временнаяМетка;
				var прогресс = временнаяМетка - времяНачала;
				var процент = Math.min(прогресс / длительность, 1);
				var плавность = 1 - Math.pow(1 - процент, 3);
				элемент.style.opacity = начало + (конец - начало) * плавность;
				if (прогресс < длительность) {
					requestAnimationFrame(шаг);
				} else {
					if (колбэк) колбэк();
				}
			}
			requestAnimationFrame(шаг);
		}

		function получитьКлючКеша(тип, ид, язык) {
			return "logo_cache_width_based_v1_" + тип + "_" + ид + "_" + язык;
		}

		function применитьФинальныеСтили(изображение, контейнер, есть_подзаголовок, высота_текста) {
			if (контейнер) {
				контейнер.style.height = "";
				контейнер.style.overflow = "";
				контейнер.style.display = "";
				контейнер.style.transition = "none";
				контейнер.style.boxSizing = "";
			}

			var это_мобильный = window.innerWidth < 768;
			var центрировать_на_мобильном = Lampa.Storage.get("logo_center_mobile", false);

			изображение.style.marginTop = "0.2em";
			
			if (это_мобильный && центрировать_на_мобильном) {
				изображение.style.marginLeft = "auto";
				изображение.style.marginRight = "auto";
			} else {
				изображение.style.marginLeft = "0";
				изображение.style.marginRight = "0";
			}

			изображение.style.paddingTop = ОТСТУП_СВЕРХУ_EM + "em";

			var отступ_снизу = ОТСТУП_СНИЗУ_EM;
			if (это_мобильный && есть_подзаголовок) отступ_снизу = 0.5;
			изображение.style.paddingBottom = отступ_снизу + "em";

			var использовать_высоту_текста = Lampa.Storage.get("logo_use_text_height", false);

			if (использовать_высоту_текста && высота_текста) {
				var коэффициент = parseFloat(Lampa.Storage.get("logo_height_factor", "1.0"));
				var рассчитанная_высота = высота_текста * коэффициент;

				if (это_мобильный) {
					изображение.style.maxHeight = рассчитанная_высота + "px";
					изображение.style.height = "auto";
					изображение.style.width = "100%";
				} else {
					изображение.style.height = рассчитанная_высота + "px";
					изображение.style.width = "auto";
					изображение.style.maxHeight = "none";
				}
			} else {
				var пользовательская_ширина = Lampa.Storage.get("logo_custom_width", "7"); 
				if (это_мобильный) {
					изображение.style.width = "100%";
				} else {
					изображение.style.width = пользовательская_ширина + "em";
				}
				изображение.style.height = "auto";
				изображение.style.maxHeight = "none";
			}

			изображение.style.maxWidth = "100%";
			изображение.style.boxSizing = "border-box";
			изображение.style.display = "block";
			изображение.style.objectFit = "contain";
			
			if (это_мобильный && центрировать_на_мобильном) {
				изображение.style.objectPosition = "center bottom";
			} else {
				изображение.style.objectPosition = "left bottom";
			}

			изображение.style.opacity = "1";
			изображение.style.transition = "none";
		}
		

		Lampa.Listener.follow("full", function (событие) {
			if (событие.type == "complite" && Lampa.Storage.get("logo_glav") != "1") {
				
				var это_мобильный = window.innerWidth < 768;
				var выравнивать_сверху = Lampa.Storage.get("logo_align_top", false);
				var левый_блок_старта = событие.object.activity.render().find(".full-start-new__left");
				
				if (выравнивать_сверху && !это_мобильный && левый_блок_старта.length) {
					левый_блок_старта.css("align-self", "flex-start");
				}

				var данные = событие.data.movie;
				var тип = данные.name ? "tv" : "movie";

				var элемент_заголовка = событие.object.activity
					.render()
					.find(".full-start-new__title");
				var элемент_шапки = событие.object.activity
					.render()
					.find(".full-start-new__head");
				var элемент_деталей = событие.object.activity
					.render()
					.find(".full-start-new__details");
				var элемент_подзаголовка = событие.object.activity
					.render()
					.find(".full-start-new__tagline");
				var есть_подзаголовок =
					элемент_подзаголовка.length > 0 && элемент_подзаголовка.text().trim() !== "";
				var дом_заголовок = элемент_заголовка[0];

				var язык_пользователя = Lampa.Storage.get("logo_lang", "");
				var целевой_язык = язык_пользователя ? язык_пользователя : Lampa.Storage.get("language");
				var размер = Lampa.Storage.get("logo_size", "original");

				var ключ_кеша = получитьКлючКеша(тип, данные.id, целевой_язык);

				function начатьАнимациюЛоготипа(ссылка_изображения, сохранить_в_кеш) {
					if (сохранить_в_кеш && !ОТКЛЮЧИТЬ_КЕШ)
						Lampa.Storage.set(ключ_кеша, ссылка_изображения);

					var изображение = new Image();
					изображение.src = ссылка_изображения;

					var начальная_высота_текста = 0;
					if (дом_заголовок)
						начальная_высота_текста = дом_заголовок.getBoundingClientRect().height;

					применитьФинальныеСтили(изображение, null, есть_подзаголовок, начальная_высота_текста);
					изображение.style.opacity = "0";

					var тип_анимации = Lampa.Storage.get("logo_animation_type", "css");

					изображение.onload = function () {
						setTimeout(function () {
							if (дом_заголовок)
								начальная_высота_текста = дом_заголовок.getBoundingClientRect().height;

							if (тип_анимации === "js") {
								элемент_заголовка.css({ transition: "none" });
								анимироватьПрозрачность(дом_заголовок, 1, 0, ЗАТУХАНИЕ_ТЕКСТА, function () {
									элемент_заголовка.empty();
									элемент_заголовка.append(изображение);
									элемент_заголовка.css({ opacity: "1", transition: "none" });

									var целевая_высота_контейнера =
										дом_заголовок.getBoundingClientRect().height;

									дом_заголовок.style.height = начальная_высота_текста + "px";
									дом_заголовок.style.display = "block";
									дом_заголовок.style.overflow = "hidden";
									дом_заголовок.style.boxSizing = "border-box";

									void дом_заголовок.offsetHeight;

									дом_заголовок.style.transition = "none";

									анимироватьВысоту(
										дом_заголовок,
										начальная_высота_текста,
										целевая_высота_контейнера,
										ИЗМЕНЕНИЕ_ВЫСОТЫ,
										function () {
											setTimeout(function () {
												применитьФинальныеСтили(
													изображение,
													дом_заголовок,
													есть_подзаголовок,
													начальная_высота_текста
												);
											}, ПОЯВЛЕНИЕ_ИЗОБРАЖЕНИЯ + 50);
										}
									);

									setTimeout(
										function () {
											изображение.style.transition = "none";
											анимироватьПрозрачность(изображение, 0, 1, ПОЯВЛЕНИЕ_ИЗОБРАЖЕНИЯ);
										},
										Math.max(0, ИЗМЕНЕНИЕ_ВЫСОТЫ - 100)
									);
								});
							} else {
								элемент_заголовка.css({
									transition: "opacity " + ЗАТУХАНИЕ_ТЕКСТА / 1000 + "s ease",
									opacity: "0"
								});

								setTimeout(function () {
									элемент_заголовка.empty();
									элемент_заголовка.append(изображение);
									элемент_заголовка.css({ opacity: "1", transition: "none" });

									var целевая_высота_контейнера =
										дом_заголовок.getBoundingClientRect().height;

									дом_заголовок.style.height = начальная_высота_текста + "px";
									дом_заголовок.style.display = "block";
									дом_заголовок.style.overflow = "hidden";
									дом_заголовок.style.boxSizing = "border-box";

									void дом_заголовок.offsetHeight;

									дом_заголовок.style.transition =
										"height " +
										ИЗМЕНЕНИЕ_ВЫСОТЫ / 1000 +
										"s cubic-bezier(0.4, 0, 0.2, 1)";

									requestAnimationFrame(function () {
										дом_заголовок.style.height = целевая_высота_контейнера + "px";

										setTimeout(
											function () {
												изображение.style.transition =
													"opacity " + ПОЯВЛЕНИЕ_ИЗОБРАЖЕНИЯ / 1000 + "s ease";
												изображение.style.opacity = "1";
											},
											Math.max(0, ИЗМЕНЕНИЕ_ВЫСОТЫ - 100)
										);

										setTimeout(
											function () {
												применитьФинальныеСтили(
													изображение,
													дом_заголовок,
													есть_подзаголовок,
													начальная_высота_текста
												);
											},
											ИЗМЕНЕНИЕ_ВЫСОТЫ + ПОЯВЛЕНИЕ_ИЗОБРАЖЕНИЯ + 50
										);
									});
								}, ЗАТУХАНИЕ_ТЕКСТА);
							}
						}, БЕЗОПАСНАЯ_ЗАДЕРЖКА);
					};

					изображение.onerror = function () {
						if (!ОТКЛЮЧИТЬ_КЕШ) Lampa.Storage.set(ключ_кеша, "none");
						элемент_заголовка.css({ opacity: "1", transition: "none" });
					};
				}

				var кешированная_ссылка = Lampa.Storage.get(ключ_кеша);
				if (!ОТКЛЮЧИТЬ_КЕШ && кешированная_ссылка && кешированная_ссылка !== "none") {
					var изображение_из_кеша = new Image();
					изображение_из_кеша.src = кешированная_ссылка;

					if (изображение_из_кеша.complete) {
						var начальная_высота_текста = 0;
						if (дом_заголовок)
							начальная_высота_текста = дом_заголовок.getBoundingClientRect().height;
						применитьФинальныеСтили(изображение_из_кеша, null, есть_подзаголовок, начальная_высота_текста);
						элемент_заголовка.empty().append(изображение_из_кеша);
						элемент_заголовка.css({ opacity: "1", transition: "none" });
						return;
					} else {
						начатьАнимациюЛоготипа(кешированная_ссылка, false);
						return;
					}
				}

				элемент_заголовка.css({ opacity: "1", transition: "none" });

				if (данные.id != "") {
					var начальная_высота_текста = 0;
					requestAnimationFrame(function () {
						if (дом_заголовок)
							начальная_высота_текста = дом_заголовок.getBoundingClientRect().height;
					});

					var ссылка_api = Lampa.TMDB.api(
						тип +
							"/" +
							данные.id +
							"/images?api_key=" +
							Lampa.TMDB.key() +
							"&include_image_language=" +
							целевой_язык +
							",en,null"
					);

					$.get(ссылка_api, function (данные_api) {
						var итоговый_логотип = null;
						if (данные_api.logos && данные_api.logos.length > 0) {
							for (var i = 0; i < данные_api.logos.length; i++) {
								if (данные_api.logos[i].iso_639_1 == целевой_язык) {
									итоговый_логотип = данные_api.logos[i].file_path;
									break;
								}
							}
							if (!итоговый_логотип) {
								for (var j = 0; j < данные_api.logos.length; j++) {
									if (данные_api.logos[j].iso_639_1 == "en") {
										итоговый_логотип = данные_api.logos[j].file_path;
										break;
									}
								}
							}
							if (!итоговый_логотип) итоговый_логотип = данные_api.logos[0].file_path;
						}

						if (итоговый_логотип) {
							var ссылка_изображения = Lampa.TMDB.image(
								"/t/p/" + размер + итоговый_логотип.replace(".svg", ".png")
							);
							начатьАнимациюЛоготипа(ссылка_изображения, true);
						} else {
							if (!ОТКЛЮЧИТЬ_КЕШ) Lampa.Storage.set(ключ_кеша, "none");
						}
					}).fail(function () {});
				}
			}
		});
	}

	var КОМПОНЕНТ_ЛОГОТИП = "logo_settings_nested";

	Lampa.Template.add("settings_" + КОМПОНЕНТ_ЛОГОТИП, "<div></div>");

	Lampa.SettingsApi.addParam({
	  component: "interface",
	  param: { type: "button" },
	  field: {
		name: "Логотипы",
		description: "Настройки отображения логотипов"
	  },
	  onChange: function () {
		Lampa.Settings.create(КОМПОНЕНТ_ЛОГОТИП);
		Lampa.Controller.enabled().controller.back = function () {
		  Lampa.Settings.create("interface");
		};
	  }
	});

	Lampa.SettingsApi.addParam({
		component: КОМПОНЕНТ_ЛОГОТИП,
		param: { name: "logo_back_to_int", type: "static" },
		field: { name: "Назад", description: "Вернуться в настройки интерфейса" },
		onRender: function (элемент) {
			элемент.on("hover:enter", function () {
				Lampa.Settings.create("interface");
			});
		}
	});

	Lampa.SettingsApi.addParam({
		component: КОМПОНЕНТ_ЛОГОТИП,
		param: {
			name: "logo_glav",
			type: "select",
			values: { 1: "'Скрыть'", 0: "'Показать'" },
			default: "0"
		},
		field: {
			name: "Логотипы вместо названий",
			description: "Отображать логотипы фильмов вместо текста"
		}
	});

	Lampa.SettingsApi.addParam({
		component: КОМПОНЕНТ_ЛОГОТИП,
		param: {
			name: "logo_lang",
			type: "select",
			values: {
				"": "Как в Lampa",
				ru: "Русский",
				en: "English",
				uk: "Українська",
				be: "Беларуская",
				kz: "Қазақша",
				pt: "Português",
				es: "Español",
				fr: "Français",
				de: "Deutsch",
				it: "Italiano"
			},
			default: ""
		},
		field: {
			name: "Язык логотипа",
			description: "Приоритетный язык для поиска логотипа"
		}
	});

	Lampa.SettingsApi.addParam({
		component: КОМПОНЕНТ_ЛОГОТИП,
		param: {
			name: "logo_size",
			type: "select",
			values: {
				w300: "w300",
				w500: "w500",
				w780: "w780",
				original: "Оригинал"
			},
			default: "original"
		},
		field: {
			name: "Размер логотипа",
			description: "Разрешение загружаемого изображения"
		}
	});

	Lampa.SettingsApi.addParam({
		component: КОМПОНЕНТ_ЛОГОТИП,
		param: {
			name: "logo_animation_type",
			type: "select",
			values: { js: "JavaScript", css: "CSS" },
			default: "css"
		},
		field: {
			name: "Тип анимации логотипов",
			description: "Способ анимации логотипов"
		}
	});

	Lampa.SettingsApi.addParam({
		component: КОМПОНЕНТ_ЛОГОТИП,
		param: { name: "logo_use_text_height", type: "trigger", default: false },
		field: {
			name: "Логотип по высоте текста",
			description: "Размер логотипа формируется относительно высоты текста"
		}
	});

	Lampa.SettingsApi.addParam({
		component: КОМПОНЕНТ_ЛОГОТИП,
		param: { name: "logo_center_mobile", type: "trigger", default: false },
		field: {
			name: "По центру на телефоне",
			description: "Центрирует логотип по горизонтали на мобильных устройствах"
		}
	});

	Lampa.SettingsApi.addParam({
		component: КОМПОНЕНТ_ЛОГОТИП,
		param: { name: "logo_align_top", type: "trigger", default: false },
		field: {
			name: "Постер всегда сверху",
			description: "Выравнивает постер по верхнему краю (TV/PC)"
		}
	});

	Lampa.SettingsApi.addParam({
		component: КОМПОНЕНТ_ЛОГОТИП,
		param: {
			name: "logo_height_factor",
			type: "select",
			values: {
				"1.0": "1.0", "1.1": "1.1", "1.2": "1.2", "1.3": "1.3",
				"1.4": "1.4", "1.5": "1.5", "1.6": "1.6", "1.7": "1.7",
				"1.8": "1.8", "1.9": "1.9", "2.0": "2.0", "2.1": "2.1",
				"2.2": "2.2", "2.3": "2.3", "2.4": "2.4", "2.5": "2.5",
				"2.6": "2.6", "2.7": "2.7", "2.8": "2.8", "2.9": "2.9",
				"3.0": "3.0"
			},
			default: "1.0"
		},
		field: {
			name: "Коэффициент высоты",
			description: "Работает для настройки 'по высоте текста'"
		}
	});

	Lampa.SettingsApi.addParam({
		component: КОМПОНЕНТ_ЛОГОТИП,
		param: {
			name: "logo_custom_width",
			type: "select",
			values: {
				"2": "2em", "3": "3em", "4": "4em", "5": "5em", "6": "6em",
				"7": "7em", "8": "8em", "9": "9em", "10": "10em"
			},
			default: "7"
		},
		field: {
			name: "Ширина логотипа",
			description: "Когда выключена настройка 'по высоте текста'"
		}
	});
	
	Lampa.SettingsApi.addParam({
		component: КОМПОНЕНТ_ЛОГОТИП,
		param: { name: "logo_clear_cache", type: "button" },
		field: {
			name: "Сбросить кеш логотипов",
			description: "Нажмите для очистки кеша изображений"
		},
		onChange: function () {
			Lampa.Select.show({
				title: "Сбросить кеш?",
				items: [{ title: "Да", confirm: true }, { title: "Нет" }],
				onSelect: function (выбор) {
					if (выбор.confirm) {
						var ключи = [];
						for (var i = 0; i < localStorage.length; i++) {
							var ключ = localStorage.key(i);
							if (ключ.indexOf("logo_cache_width_based_v1_") !== -1) {
								ключи.push(ключ);
							}
						}
						ключи.forEach(function (ключ) {
							localStorage.removeItem(ключ);
						});
						window.location.reload();
					} else {
						Lampa.Controller.toggle("settings_component");
					}
				},
				onBack: function () {
					Lampa.Controller.toggle("settings_component");
				}
			});
		}
	});

	if (!window.logoplugin) запуститьПлагин();
})();