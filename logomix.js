(function () {
	"use strict";

    if (document.currentScript && document.currentScript.src.indexOf('ko31k') === -1) {
        return;
	}

	var DISABLE_CACHE = false;

	function startPlugin() {
		var SAFE_DELAY = 200;
		var FADE_OUT_TEXT = 300;
		var MORPH_HEIGHT = 400;
		var FADE_IN_IMG = 400;
		var PADDING_TOP_EM = 0;
		var PADDING_BOTTOM_EM = 0.2;

		window.logoplugin = true;

		function animateHeight(element, start, end, duration, callback) {
			var startTime = null;
			function step(timestamp) {
				if (!startTime) startTime = timestamp;
				var progress = timestamp - startTime;
				var percent = Math.min(progress / duration, 1);
				var ease = 1 - Math.pow(1 - percent, 3);
				element.style.height = start + (end - start) * ease + "px";
				if (progress < duration) {
					requestAnimationFrame(step);
				} else {
					if (callback) callback();
				}
			}
			requestAnimationFrame(step);
		}

		function animateOpacity(element, start, end, duration, callback) {
			var startTime = null;
			function step(timestamp) {
				if (!startTime) startTime = timestamp;
				var progress = timestamp - startTime;
				var percent = Math.min(progress / duration, 1);
				var ease = 1 - Math.pow(1 - percent, 3);
				element.style.opacity = start + (end - start) * ease;
				if (progress < duration) {
					requestAnimationFrame(step);
				} else {
					if (callback) callback();
				}
			}
			requestAnimationFrame(step);
		}

		function getCacheKey(type, id, lang) {
			return "logo_cache_width_based_v1_" + type + "_" + id + "_" + lang;
		}

		function applyFinalStyles(img, container, has_tagline, text_height) {
			if (container) {
				container.style.height = "";
				container.style.overflow = "";
				container.style.display = "";
				container.style.transition = "none";
				container.style.boxSizing = "";
			}

			var is_mobile = window.innerWidth < 768;
			var center_mobile = Lampa.Storage.get("logo_center_mobile", false);

			img.style.marginTop = "0.2em";
			
			if (is_mobile && center_mobile) {
				img.style.marginLeft = "auto";
				img.style.marginRight = "auto";
			} else {
				img.style.marginLeft = "0";
				img.style.marginRight = "0";
			}

			img.style.paddingTop = PADDING_TOP_EM + "em";

			var pb = PADDING_BOTTOM_EM;
			if (is_mobile && has_tagline) pb = 0.5;
			img.style.paddingBottom = pb + "em";

			var use_text_height = Lampa.Storage.get("logo_use_text_height", false);

			if (use_text_height && text_height) {
				var factor = parseFloat(Lampa.Storage.get("logo_height_factor", "1.0"));
				var calc_height = text_height * factor;

				if (is_mobile) {
					img.style.maxHeight = calc_height + "px";
					img.style.height = "auto";
					img.style.width = "100%";
				} else {
					img.style.height = calc_height + "px";
					img.style.width = "auto";
					img.style.maxHeight = "none";
				}
			} else {
				var custom_width = Lampa.Storage.get("logo_custom_width", "7"); 
				if (is_mobile) {
					img.style.width = "100%";
				} else {
					img.style.width = custom_width + "em";
				}
				img.style.height = "auto";
				img.style.maxHeight = "none";
			}

			img.style.maxWidth = "100%";
			img.style.boxSizing = "border-box";
			img.style.display = "block";
			img.style.objectFit = "contain";
			
			if (is_mobile && center_mobile) {
				img.style.objectPosition = "center bottom";
			} else {
				img.style.objectPosition = "left bottom";
			}

			img.style.opacity = "1";
			img.style.transition = "none";
		}

		Lampa.Listener.follow("full", function (e) {
			if (e.type == "complite" && Lampa.Storage.get("logo_glav") != "1") {
				
				var is_mobile = window.innerWidth < 768;
				var align_top = Lampa.Storage.get("logo_align_top", false);
				var full_start_left = e.object.activity.render().find(".full-start-new__left");
				
				if (align_top && !is_mobile && full_start_left.length) {
					full_start_left.css("align-self", "flex-start");
				}

				var data = e.data.movie;
				var type = data.name ? "tv" : "movie";

				var title_elem = e.object.activity.render().find(".full-start-new__title");
				var tagline_elem = e.object.activity.render().find(".full-start-new__tagline");
				var has_tagline = tagline_elem.length > 0 && tagline_elem.text().trim() !== "";
				var dom_title = title_elem[0];

				var user_lang = Lampa.Storage.get("logo_lang", "");
				var target_lang = user_lang ? user_lang : Lampa.Storage.get("language");
				var size = Lampa.Storage.get("logo_size", "original");
				var cache_key = getCacheKey(type, data.id, target_lang);

				function startLogoAnimation(img_url, save_to_cache) {
					if (save_to_cache && !DISABLE_CACHE) Lampa.Storage.set(cache_key, img_url);

					var img = new Image();
					img.src = img_url;

					var start_text_height = 0;
					if (dom_title) start_text_height = dom_title.getBoundingClientRect().height;

					applyFinalStyles(img, null, has_tagline, start_text_height);
					img.style.opacity = "0";

					var animation_type = Lampa.Storage.get("logo_animation_type", "css");

					img.onload = function () {
						setTimeout(function () {
							if (dom_title) start_text_height = dom_title.getBoundingClientRect().height;

							if (animation_type === "js") {
								title_elem.css({ transition: "none" });
								animateOpacity(dom_title, 1, 0, FADE_OUT_TEXT, function () {
									title_elem.empty();
									title_elem.append(img);
									title_elem.css({ opacity: "1", transition: "none" });

									var target_container_height = dom_title.getBoundingClientRect().height;

									dom_title.style.height = start_text_height + "px";
									dom_title.style.display = "block";
									dom_title.style.overflow = "hidden";
									dom_title.style.boxSizing = "border-box";

									void dom_title.offsetHeight;
									dom_title.style.transition = "none";

									animateHeight(dom_title, start_text_height, target_container_height, MORPH_HEIGHT, function () {
										setTimeout(function () {
											applyFinalStyles(img, dom_title, has_tagline, start_text_height);
										}, FADE_IN_IMG + 50);
									});

									setTimeout(function () {
										img.style.transition = "none";
										animateOpacity(img, 0, 1, FADE_IN_IMG);
									}, Math.max(0, MORPH_HEIGHT - 100));
								});
							} else {
								title_elem.css({
									transition: "opacity " + FADE_OUT_TEXT / 1000 + "s ease",
									opacity: "0"
								});

								setTimeout(function () {
									title_elem.empty();
									title_elem.append(img);
									title_elem.css({ opacity: "1", transition: "none" });

									var target_container_height = dom_title.getBoundingClientRect().height;

									dom_title.style.height = start_text_height + "px";
									dom_title.style.display = "block";
									dom_title.style.overflow = "hidden";
									dom_title.style.boxSizing = "border-box";

									void dom_title.offsetHeight;

									dom_title.style.transition = "height " + MORPH_HEIGHT / 1000 + "s cubic-bezier(0.4, 0, 0.2, 1)";

									requestAnimationFrame(function () {
										dom_title.style.height = target_container_height + "px";

										setTimeout(function () {
											img.style.transition = "opacity " + FADE_IN_IMG / 1000 + "s ease";
											img.style.opacity = "1";
										}, Math.max(0, MORPH_HEIGHT - 100));

										setTimeout(function () {
											applyFinalStyles(img, dom_title, has_tagline, start_text_height);
										}, MORPH_HEIGHT + FADE_IN_IMG + 50);
									});
								}, FADE_OUT_TEXT);
							}
						}, SAFE_DELAY);
					};

					img.onerror = function () {
						if (!DISABLE_CACHE) Lampa.Storage.set(cache_key, "none");
						title_elem.css({ opacity: "1", transition: "none" });
					};
				}

				var cached_url = Lampa.Storage.get(cache_key);
				if (!DISABLE_CACHE && cached_url && cached_url !== "none") {
					var img_cache = new Image();
					img_cache.src = cached_url;

					if (img_cache.complete) {
						var start_text_height = 0;
						if (dom_title) start_text_height = dom_title.getBoundingClientRect().height;
						applyFinalStyles(img_cache, null, has_tagline, start_text_height);
						title_elem.empty().append(img_cache);
						title_elem.css({ opacity: "1", transition: "none" });
						return;
					} else {
						startLogoAnimation(cached_url, false);
						return;
					}
				}

				title_elem.css({ opacity: "1", transition: "none" });

				if (data.id != "") {
					var url = Lampa.TMDB.api(type + "/" + data.id + "/images?api_key=" + Lampa.TMDB.key() + "&include_image_language=" + target_lang + ",en,null");

					$.get(url, function (data_api) {
						var final_logo = null;
						if (data_api.logos && data_api.logos.length > 0) {
							for (var i = 0; i < data_api.logos.length; i++) {
								if (data_api.logos[i].iso_639_1 == target_lang) {
									final_logo = data_api.logos[i].file_path;
									break;
								}
							}
							if (!final_logo) {
								for (var j = 0; j < data_api.logos.length; j++) {
									if (data_api.logos[j].iso_639_1 == "en") {
										final_logo = data_api.logos[j].file_path;
										break;
									}
								}
							}
							if (!final_logo) final_logo = data_api.logos[0].file_path;
						}

						if (final_logo) {
							var img_url = Lampa.TMDB.image("/t/p/" + size + final_logo.replace(".svg", ".png"));
							startLogoAnimation(img_url, true);
						} else {
							if (!DISABLE_CACHE) Lampa.Storage.set(cache_key, "none");
						}
					}).fail(function () {});
				}
			}
		});
	}

	var LOGO_COMPONENT = "logo_settings_nested";
	Lampa.Template.add("settings_" + LOGO_COMPONENT, "<div></div>");

	Lampa.SettingsApi.addParam({
	  component: "interface",
	  param: { type: "button" },
	  field: { name: "Логотипи", description: "Налаштування відображення логотипів" },
	  onChange: function () {
		Lampa.Settings.create(LOGO_COMPONENT);
		Lampa.Controller.enabled().controller.back = function () { Lampa.Settings.create("interface"); };
	  }
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_back_to_int", type: "static" },
		field: { name: "Назад", description: "Повернутися в налаштування інтерфейсу" },
		onRender: function (item) { item.on("hover:enter", function () { Lampa.Settings.create("interface"); }); }
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_glav", type: "select", values: { 1: "'Приховати'", 0: "'Відобразити'" }, default: "0" },
		field: { name: "Логотипи замість назв", description: "Відображає логотипи фільмів замість тексту" }
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_lang", type: "select", values: { "": "Як в Lampa", ru: "Русский", en: "English", uk: "Українська", be: "Беларуская", kz: "Қазақша", pt: "Português", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano" }, default: "" },
		field: { name: "Мова логотипу", description: "Пріоритетна мова для пошуку логотипу" }
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_size", type: "select", values: { w300: "w300", w500: "w500", w780: "w780", original: "Оригінал" }, default: "original" },
		field: { name: "Розмір логотипу", description: "Роздільна здатність завантажуваного зображення" }
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_animation_type", type: "select", values: { js: "JavaScript", css: "CSS" }, default: "css" },
		field: { name: "Тип анімації логотипів", description: "Спосіб анімації логотипів" }
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_use_text_height", type: "trigger", default: false },
		field: { name: "Логотип по висоті тексту", description: "Розмір логотипа формується відносно висоти тексту" }
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_center_mobile", type: "trigger", default: false },
		field: { name: "По центру на телефоні", description: "Центрує логотип по горизонталі на мобільних пристроях" }
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_align_top", type: "trigger", default: false },
		field: { name: "Постер завжди зверху", description: "Вирівнює постер по верхньому краю (TV/PC)" }
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_height_factor", type: "select", values: { "1.0": "1.0", "1.1": "1.1", "1.2": "1.2", "1.3": "1.3", "1.4": "1.4", "1.5": "1.5", "1.6": "1.6", "1.7": "1.7", "1.8": "1.8", "1.9": "1.9", "2.0": "2.0", "2.1": "2.1", "2.2": "2.2", "2.3": "2.3", "2.4": "2.4", "2.5": "2.5", "2.6": "2.6", "2.7": "2.7", "2.8": "2.8", "2.9": "2.9", "3.0": "3.0" }, default: "1.0" },
		field: { name: "Коефіцієнт висоти", description: "Працює для налатшування 'по висоті тексту'" }
	});

	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_custom_width", type: "select", values: { "2": "2em", "3": "3em", "4": "4em", "5": "5em", "6": "6em", "7": "7em", "8": "8em", "9": "9em", "10": "10em" }, default: "7" },
		field: { name: "Ширина логотипа", description: "Коли вимкнено налаштування 'по висоті тексту'" }
	});
	
	Lampa.SettingsApi.addParam({
		component: LOGO_COMPONENT,
		param: { name: "logo_clear_cache", type: "button" },
		field: { name: "Скинути кеш логотипів", description: "Натисніть для очищення кешу зображень" },
		onChange: function () {
			Lampa.Select.show({
				title: "Скинути кеш?",
				items: [{ title: "Так", confirm: true }, { title: "Ні" }],
				onSelect: function (a) {
					if (a.confirm) {
						var keys = [];
						for (var i = 0; i < localStorage.length; i++) {
							var key = localStorage.key(i);
							if (key.indexOf("logo_cache_width_based_v1_") !== -1) keys.push(key);
						}
						keys.forEach(function (key) { localStorage.removeItem(key); });
						window.location.reload();
					} else {
						Lampa.Controller.toggle("settings_component");
					}
				},
				onBack: function () { Lampa.Controller.toggle("settings_component"); }
			});
		}
	});

	if (!window.logoplugin) startPlugin();
})();