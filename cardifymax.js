(function () {
    "use strict";

    // ─────────────────────────────────────────────────────────────────────────
    // Вспомогательные функции (deobfuscated)
    // ─────────────────────────────────────────────────────────────────────────

    function State(object) {
        this.state = object.state;
        this.start = function () { this.dispath(this.state); };
        this.dispath = function (action_name) {
            var action = object.transitions[action_name];
            if (action) { action.call(this, this); }
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // YouTube-плеер для трейлеров
    // ─────────────────────────────────────────────────────────────────────────

    var Player = (function () {
        function Player(object, video, isBgMode) {
            var _this = this;
            this.paused = false;
            this.display = false;
            this.ended = false;
            this.isBgMode = isBgMode;
            this.video = video;
            this.listener = Lampa.Subscribe();

            var controlsHtml = !this.isBgMode
                ? '<div class="cardify-trailer__controlls">' +
                  '<div class="cardify-trailer__title"></div>' +
                  '<div class="cardify-trailer__remote">' +
                  '<div class="cardify-trailer__remote-icon">' +
                  '<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="M32.5196 7.22042L26.7992 12.9408C27.8463 14.5217 28.4561 16.4175 28.4561 18.4557C28.4561 20.857 27.6098 23.0605 26.1991 24.7844L31.8718 30.457C34.7226 27.2724 36.4561 23.0667 36.4561 18.4561C36.4561 14.2059 34.983 10.2998 32.5196 7.22042Z" fill="white" fill-opacity="0.28"/>' +
                  '<path d="M29.6917 32.5196L23.971 26.7989C22.3901 27.846 20.4943 28.4557 18.4561 28.4557C16.4179 28.4557 14.5221 27.846 12.9412 26.7989L7.22042 32.5196C10.2998 34.983 14.2059 36.4561 18.4561 36.4561C22.7062 36.4561 26.6123 34.983 29.6917 32.5196Z" fill="white" fill-opacity="0.28"/>' +
                  '<path d="M5.04033 30.4571L10.7131 24.7844C9.30243 23.0605 8.4561 20.857 8.4561 18.4557C8.4561 16.4175 9.06588 14.5217 10.113 12.9408L4.39251 7.22037C1.9291 10.2998 0.456055 14.2059 0.456055 18.4561C0.456054 23.0667 2.18955 27.2724 5.04033 30.4571Z" fill="white" fill-opacity="0.28"/>' +
                  '<path d="M6.45507 5.04029C9.63973 2.18953 13.8455 0.456055 18.4561 0.456055C23.0667 0.456054 27.2724 2.18955 30.4571 5.04034L24.7847 10.7127C23.0609 9.30207 20.8573 8.45575 18.4561 8.45575C16.0549 8.45575 13.8513 9.30207 12.1275 10.7127L6.45507 5.04029Z" fill="white" fill-opacity="0.28"/>' +
                  '</svg>' +
                  '</div>' +
                  '<div class="cardify-trailer__remote-text">' + Lampa.Lang.translate("cardify_enable_sound") + '</div>' +
                  '</div>' +
                  '</div>'
                : '';

            this.html = $(
                '<div class="cardify-trailer">' +
                '<div class="cardify-trailer__youtube">' +
                '<div class="cardify-trailer__youtube-iframe"></div>' +
                '<div class="cardify-trailer__youtube-line one"></div>' +
                '<div class="cardify-trailer__youtube-line two"></div>' +
                '</div>' +
                controlsHtml +
                '</div>'
            );
        }

        Player.prototype.initYoutube = function () {
            var _this = this;
            this.youtube = new window.YT.Player(
                this.html.find(".cardify-trailer__youtube-iframe")[0],
                {
                    height: window.innerHeight * 2,
                    width: window.innerWidth,
                    playerVars: {
                        controls: 0, showinfo: 0, autohide: 1,
                        modestbranding: 1, autoplay: 0, disablekb: 1,
                        fs: 0, enablejsapi: 1, playsinline: 1, rel: 0,
                        suggestedQuality: "hd1080",
                        setPlaybackQuality: "hd1080",
                        mute: 1
                    },
                    videoId: this.video.id,
                    events: {
                        onReady: function (event) {
                            _this.loaded = true;
                            var iframe = $(_this.youtube.getIframe());

                            var blurVal = parseInt(Lampa.Storage.field("cardify_trailers_blur")) || 0;
                            if (blurVal > 0) {
                                iframe.css('filter', 'blur(' + blurVal + 'px)');
                            }

                            var zoomVal = Lampa.Storage.field("cardify_trailers_zoom") || "0";
                            if (zoomVal === true) zoomVal = "33";
                            if (zoomVal === false) zoomVal = "0";
                            if (zoomVal !== "0") {
                                var scaleMap = { "25": 1.25, "33": 1.33, "40": 1.40, "45": 1.45, "50": 1.50 };
                                var scale = scaleMap[zoomVal] || 1;
                                iframe.css('transform', 'scale(' + scale + ') translateZ(0)');
                            }

                            _this.listener.send("loaded");
                        },
                        onStateChange: function (state) {
                            if (state.data == window.YT.PlayerState.PLAYING) {
                                _this.paused = false;
                                clearInterval(_this.timer);
                                _this.timer = setInterval(function () {
                                    var left = _this.youtube.getDuration() - _this.youtube.getCurrentTime();
                                    if (left <= 2) {
                                        clearInterval(_this.timer);
                                        _this.listener.send("ended");
                                    }
                                }, 100);
                                _this.listener.send("play");
                                if (window.cardify_fist_unmute && !_this.isBgMode) _this.unmute();
                            }
                            if (state.data == window.YT.PlayerState.PAUSED) {
                                _this.paused = true;
                                clearInterval(_this.timer);
                                _this.listener.send("paused");
                            }
                            if (state.data == window.YT.PlayerState.ENDED) {
                                _this.listener.send("ended");
                            }
                            if (state.data == window.YT.PlayerState.BUFFERING) {
                                state.target.setPlaybackQuality("hd1080");
                            }
                        },
                        onError: function (e) {
                            _this.loaded = false;
                            _this.listener.send("error");
                        }
                    }
                }
            );
        };

        Player.prototype.play = function () { try { this.youtube.playVideo(); } catch (e) {} };
        Player.prototype.pause = function () { try { this.youtube.pauseVideo(); } catch (e) {} };
        Player.prototype.unmute = function () {
            try {
                if (this.isBgMode) return;
                this.youtube.unMute();
                this.html.find(".cardify-trailer__remote").remove();
                window.cardify_fist_unmute = true;
            } catch (e) {}
        };
        Player.prototype.show = function () { this.html.addClass("display"); this.display = true; };
        Player.prototype.hide = function () { this.html.removeClass("display"); this.display = false; };
        Player.prototype.render = function () { return this.html; };
        Player.prototype.destroy = function () {
            this.loaded = false;
            this.display = false;
            try { this.youtube.destroy(); } catch (e) {}
            clearInterval(this.timer);
            this.html.remove();
        };

        return Player;
    })();

    // ─────────────────────────────────────────────────────────────────────────
    // Трейлер (логика состояний)
    // ─────────────────────────────────────────────────────────────────────────

    var Trailer = (function () {
        function Trailer(object, video, isBgMode) {
            var _this = this;
            object.activity.trailer_ready = true;
            this.object = object;
            this.video = video;
            this.isBgMode = isBgMode;
            this.background = this.object.activity.render().find(".full-start__background");
            this.startblock = this.object.activity.render().find(".cardify");
            this.head = $(".head");
            this.timelauch = isBgMode ? 100 : 5000;

            this.state = new State({
                state: "start",
                transitions: {
                    start: function (state) {
                        clearTimeout(_this.timer_load);
                        if (_this.player.display) state.dispath("play");
                        else if (_this.player.loaded) {
                            _this.timer_load = setTimeout(function () { state.dispath("load"); }, _this.timelauch);
                        }
                    },
                    load: function (state) {
                        if (_this.player.loaded &&
                            Lampa.Controller.enabled().name == "full_start" &&
                            _this.same()) state.dispath("play");
                    },
                    play: function () { _this.player.play(); },
                    toggle: function (state) {
                        if (_this.isBgMode) return;
                        clearTimeout(_this.timer_load);
                        if (Lampa.Controller.enabled().name == "cardify_trailer") {
                            // ничего
                        } else if (Lampa.Controller.enabled().name == "full_start" && _this.same()) {
                            state.start();
                        } else if (_this.player.display) {
                            state.dispath("hide");
                        }
                    },
                    hide: function () {
                        _this.player.pause();
                        _this.player.hide();
                        _this.background.removeClass("nodisplay");
                        if (!_this.isBgMode) {
                            _this.startblock.removeClass("nodisplay");
                            _this.head.removeClass("nodisplay");
                        }
                    }
                }
            });
            this.start();
        }

        Trailer.prototype.same = function () {
            return Lampa.Activity.active().activity === this.object.activity;
        };

        Trailer.prototype.controll = function () {
            if (this.isBgMode) return;
            var _this = this;
            var out = function () {
                _this.state.dispath("hide");
                Lampa.Controller.toggle("full_start");
            };
            Lampa.Controller.add("cardify_trailer", {
                toggle: function () { Lampa.Controller.clear(); },
                enter: function () { _this.player.unmute(); },
                left: out, up: out, down: out, right: out,
                back: function () { _this.player.destroy(); out(); }
            });
            Lampa.Controller.toggle("cardify_trailer");
        };

        Trailer.prototype.start = function () {
            var _this = this;
            var toggle = function (e) { _this.state.dispath("toggle"); };
            var destroy = function (e) {
                if (e.type == "destroy" && e.object.activity === _this.object.activity) remove();
            };
            var remove = function () {
                Lampa.Listener.remove("activity", destroy);
                Lampa.Controller.listener.remove("toggle", toggle);
                if (window.cardifyBgPlayer === _this.player) window.cardifyBgPlayer = null;
                _this.destroy();
            };

            Lampa.Listener.follow("activity", destroy);
            Lampa.Controller.listener.follow("toggle", toggle);

            this.player = new Player(this.object, this.video, this.isBgMode);
            if (this.isBgMode) window.cardifyBgPlayer = this.player;

            this.player.listener.follow("loaded", function () { _this.state.start(); });
            this.player.listener.follow("play", function () {
                clearTimeout(_this.timer_show);
                _this.timer_show = setTimeout(function () {
                    _this.player.show();
                    _this.background.addClass("nodisplay");
                    if (!_this.isBgMode) {
                        _this.startblock.addClass("nodisplay");
                        _this.head.addClass("nodisplay");
                        _this.controll();
                    }
                }, _this.isBgMode ? 100 : 500);
            });

            this.player.listener.follow("ended,error", function () {
                if (_this.isBgMode) { _this.player.play(); return; }
                _this.state.dispath("hide");
                if (Lampa.Controller.enabled().name !== "full_start") Lampa.Controller.toggle("full_start");
                setTimeout(remove, 300);
            });

            var $render = this.object.activity.render();
            var $overlay = $render.find('.cardify-effects-overlay');
            if (this.isBgMode && $overlay.length) {
                $overlay.before(this.player.render());
            } else {
                $render.find(".activity__body").prepend(this.player.render());
            }

            var checkYT = setInterval(function () {
                if (window.YT && window.YT.Player) {
                    clearInterval(checkYT);
                    _this.player.initYoutube();
                }
            }, 100);

            if (!window.YT && !window.cardify_yt_injecting) {
                window.cardify_yt_injecting = true;
                Lampa.Utils.putScript(['https://www.youtube.com/iframe_api'], function () {});
            }
        };

        Trailer.prototype.destroy = function () {
            clearTimeout(this.timer_load);
            clearTimeout(this.timer_show);
            this.player.destroy();
        };

        return Trailer;
    })();

    // ─────────────────────────────────────────────────────────────────────────
    // Вспомогательные функции
    // ─────────────────────────────────────────────────────────────────────────

    function getTrailerVideo(data) {
        var vids = data.videos || (data.movie && data.movie.videos) || (data.tv && data.tv.videos);
        if (vids && vids.results && vids.results.length) {
            var items = vids.results.map(function (el) {
                return {
                    title: Lampa.Utils.shortText(el.name, 50),
                    id: el.key,
                    code: el.iso_639_1,
                    time: new Date(el.published_at).getTime(),
                    url: "https://www.youtube.com/watch?v=" + el.key,
                    img: "https://img.youtube.com/vi/" + el.key + "/default.jpg",
                    name_orig: (el.name || "").toLowerCase()
                };
            });
            items.sort(function (a, b) { return a.time > b.time ? -1 : a.time < b.time ? 1 : 0; });

            var my_lang = items.filter(function (n) { return n.code == Lampa.Storage.field("tmdb_lang"); });
            var en_lang = items.filter(function (n) { return n.code == "en" && my_lang.indexOf(n) == -1; });
            var al_lang = [].concat(my_lang).concat(en_lang);

            if (al_lang.length) {
                var best = al_lang.find(function (n) {
                    return n.name_orig.indexOf("official trailer") !== -1 ||
                           n.name_orig.indexOf("официальный трейлер") !== -1 ||
                           n.name_orig.indexOf("официальный трейлер") !== -1;
                });
                if (!best) best = al_lang.find(function (n) {
                    return n.name_orig.indexOf("trailer") !== -1 || n.name_orig.indexOf("трейлер") !== -1;
                });
                return best || al_lang[0];
            }
        }
    }

    function loadOriginalPoster(e, render) {
        var quality = Lampa.Storage.field('cardify_slideshow_quality') || 'w1280';
        var bgImg = render.find("img.full-start__background");
        var backdropPath = null;

        if (e.data && e.data.movie && e.data.movie.backdrop_path) {
            backdropPath = e.data.movie.backdrop_path;
        } else if (e.data && e.data.tv && e.data.tv.backdrop_path) {
            backdropPath = e.data.tv.backdrop_path;
        } else if (e.object && e.object.card && e.object.card.backdrop_path) {
            backdropPath = e.object.card.backdrop_path;
        } else if (bgImg.length && bgImg.attr("src")) {
            var srcMatch = bgImg.attr("src").match(/\/([^\/]+\.jpg)$/);
            if (srcMatch) backdropPath = "/" + srcMatch[1];
        }

        if (backdropPath && bgImg.length) {
            var targetUrl = "https://image.tmdb.org/t/p/" + quality + backdropPath;
            if (bgImg[0]) {
                bgImg[0].onerror = function () {
                    this.onerror = null;
                    this.src = "./img/img_broken.svg";
                };
            }
            var tempImg = new Image();
            tempImg.onload = function () { bgImg.attr("src", targetUrl); };
            tempImg.onerror = function () {};
            tempImg.src = targetUrl;
        }
    }

    function updateCardifyStyles() {
        var logoSize = Lampa.Storage.field("cardify_logo_size") || "3";
        var textPadding = Lampa.Storage.field("cardify_text_padding") || "2";
        var titleSize = Lampa.Storage.field("cardify_title_size") || "3";
        var descSize = Lampa.Storage.field("cardify_desc_size") || "1.2";

        var dynamicStyle = document.getElementById("cardify-dynamic-style");
        if (!dynamicStyle) {
            dynamicStyle = document.createElement("style");
            dynamicStyle.id = "cardify-dynamic-style";
            document.head.appendChild(dynamicStyle);
        }
        dynamicStyle.textContent =
            ".cardify-logo img, .cardify-logo svg { width: " + logoSize + "em; height: auto; }\n" +
            ".cardify__left { padding-left: " + textPadding + "em; }\n" +
            ".full-start-new__title { font-size: " + titleSize + "em !important; }\n" +
            ".full-descr__text { font-size: " + descSize + "em !important; }\n";
    }

    function updateCardifyVisibility() {
        var hideStatus = Lampa.Storage.field("cardify_show_status") === false || Lampa.Storage.field("cardify_show_status") === "false";
        var hidePg = Lampa.Storage.field("cardify_show_pg") === false || Lampa.Storage.field("cardify_show_pg") === "false";
        var hideRating = Lampa.Storage.field("cardify_show_rating") === false || Lampa.Storage.field("cardify_show_rating") === "false";
        var hideDescription = Lampa.Storage.field("cardify_show_description") === false || Lampa.Storage.field("cardify_show_description") === "false";

        $('body').toggleClass('cardify-hide-status', hideStatus);
        $('body').toggleClass('cardify-hide-pg', hidePg);
        $('body').toggleClass('cardify-hide-rating', hideRating);
        $('body').toggleClass('cardify-hide-description', hideDescription);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Основная логика обработки карточки
    // ─────────────────────────────────────────────────────────────────────────

    function processCard(e) {
        if (e.type !== "complete") return;

        var render = e.object.activity.render();
        var bg = render.find(".full-start__background");
        var component = e.object.activity.component;
        bg.addClass("cardify__background");

        if (render.find('.cardify-effects-overlay').length === 0) {
            bg.last().after('<div class="cardify-effects-overlay"></div>');
        }

        // Показываем логотип из materials (если есть в данных)
        var logoUrl = null;
        var movieData = (e.data && e.data.movie) || (e.data && e.data.tv) || (e.object && e.object.card);
        if (movieData && movieData.images && movieData.images.logos && movieData.images.logos.length) {
            var logos = movieData.images.logos;
            var currentLang = Lampa.Storage.field('tmdb_lang') || 'ru';
            var myLangLogo = logos.find(function (l) { return l.iso_639_1 === currentLang; });
            var enLangLogo = logos.find(function (l) { return l.iso_639_1 === 'en'; });
            var bestLogo = myLangLogo || enLangLogo || logos[0];
            if (bestLogo && bestLogo.file_path) {
                logoUrl = Lampa.TMDB.image('t/p/w300' + bestLogo.file_path);
            }
        }

        // Блок лого
        var logoBlock = render.find('.cardify-logo');
        if (logoUrl) {
            if (logoBlock.length === 0) {
                logoBlock = $('<div class="cardify-logo"></div>');
                render.find('.full-start-new__title').before(logoBlock);
            }
            logoBlock.html('<img src="' + logoUrl + '" alt="" onerror="this.style.display=\'none\'">');
        } else {
            logoBlock.remove();
        }

        // Перемещение описания
        var details = render.find(".full-start-new__details");
        if (details.length) {
            var nextEpisodeSpan = null;
            details.children("span").each(function () {
                var $span = $(this);
                if (!$span.hasClass("full-start-new__split") && $span.text().indexOf("/") !== -1) {
                    nextEpisodeSpan = $span;
                    return false;
                }
            });
            if (nextEpisodeSpan) {
                var prevSplit = nextEpisodeSpan.prev(".full-start-new__split");
                var nextSplit = nextEpisodeSpan.next(".full-start-new__split");
                nextEpisodeSpan.detach();
                if (prevSplit.length && nextSplit.length) { nextSplit.remove(); }
                else { prevSplit.remove(); nextSplit.remove(); }
                nextEpisodeSpan.css("width", "100%");
                details.append(nextEpisodeSpan);
            }
        }

        loadOriginalPoster(e, render);

        if (Lampa.Storage.field("cardify_move_text")) {
            if (!(window.innerHeight > window.innerWidth || Lampa.Platform.is('mobile'))) {
                render.find('.items-line__title').each(function () {
                    if ($(this).text().trim().toLowerCase() === 'детально') {
                        $(this).closest('.items-line__head').hide();
                    }
                });

                var description = render.find('.full-descr__text');
                var mainContainer = render.find('.full-start-new__body');

                if (description.length && mainContainer.length && render.find('.custom-ghost-main').length === 0) {
                    mainContainer.css('position', 'relative');
                    var wrapper = $('<div class="custom-ghost-main"></div>');
                    wrapper.css({
                        'position': 'absolute',
                        'top': '0',
                        'right': '0',
                        'width': '40vw',
                        'z-index': '9999',
                        'pointer-events': 'none',
                        'box-sizing': 'border-box'
                    });
                    description.css({
                        'line-height': '1.4',
                        'color': '#ffffff',
                        'text-shadow': '1px 1px 3px rgba(0,0,0,0.9)'
                    });
                    wrapper.append(description);
                    mainContainer.append(wrapper);
                }
            }
        }

        // IntersectionObserver для скролл-эффекта
        var titleEl = render.find('.full-start-new__title')[0];
        if (titleEl && typeof IntersectionObserver !== 'undefined') {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var $overlay = render.find('.cardify-effects-overlay');
                    if (entry.isIntersecting) $overlay.removeClass('cardify-scrolled');
                    else $overlay.addClass('cardify-scrolled');
                });
            }, { threshold: 0 });
            observer.observe(titleEl);
            var stopObserver = function (a) {
                if (a.type == 'destroy' && a.object.activity === e.object.activity) {
                    observer.disconnect();
                    Lampa.Listener.remove('activity', stopObserver);
                }
            };
            Lampa.Listener.follow('activity', stopObserver);
        }

        // Дополнение строк (rows)
        if (component && component.rows && component.items && component.scroll && component.emit) {
            var add = component.rows.slice(component.items.length);
            if (add.length) {
                component.fragment = document.createDocumentFragment();
                add.forEach(function (row) { component.emit("createAndAppend", row); });
                component.scroll.append(component.fragment);
                if (Lampa.Layer) Lampa.Layer.visible(component.scroll.render());
            }
        }

        // Исправление opacity фона
        var fixOpacity = function () {
            if (!e || !e.object || !e.object.activity || typeof e.object.activity.render !== 'function') return;
            var renderEl = e.object.activity.render();
            if (!renderEl) return;
            var $bg = renderEl.find(".full-start__background");
            if ($bg.length) $bg.stop(true, true).css("opacity", "1");
        };
        fixOpacity();
        setTimeout(fixOpacity, 300);
        setTimeout(fixOpacity, 1000);

        // Фоновый трейлер
        var isBgTrailers = Lampa.Storage.field("cardify_trailers_bg");
        var run_slideshow = Lampa.Storage.field("cardify_run_slideshow");

        if (isBgTrailers) {
            var tr = getTrailerVideo(e.data);
            if (tr && Lampa.Manifest.app_digital >= 220) {
                if (Lampa.Activity.active().activity === e.object.activity) {
                    new Trailer(e.object, tr, isBgTrailers);
                } else {
                    var follow = function (a) {
                        if (a.type == "start" &&
                            a.object.activity === e.object.activity &&
                            !e.object.activity.trailer_ready) {
                            Lampa.Listener.remove("activity", follow);
                            new Trailer(e.object, tr, isBgTrailers);
                        }
                    };
                    Lampa.Listener.follow("activity", follow);
                }
            } else {
                isBgTrailers = false;
            }
        }

        // Слайдшоу фоновых изображений
        if (run_slideshow && !isBgTrailers) {
            var movie_data = e.data.movie || e.data.tv || (e.object && e.object.card);
            if (movie_data && movie_data.id) {
                var item_id = movie_data.id;
                var media_type = 'movie';
                if (e.object && e.object.method === 'tv') media_type = 'tv';
                else if (e.data && e.data.tv && !e.data.movie) media_type = 'tv';
                else if (movie_data.name && !movie_data.title) media_type = 'tv';

                var current_lang = Lampa.Storage.field('tmdb_lang') || 'ru';
                var include_languages = current_lang + ',xx,null,en';

                Lampa.Api.sources.tmdb.get(
                    media_type + '/' + item_id + '/images?include_image_language=' + include_languages,
                    {},
                    function (images_data) {
                        if (images_data && images_data.backdrops && images_data.backdrops.length > 0) {
                            var lang_backdrops = [], no_lang_backdrops = [], other_backdrops = [];

                            images_data.backdrops.forEach(function (backdrop) {
                                var lang = backdrop.iso_639_1;
                                if (lang === current_lang) lang_backdrops.push(backdrop);
                                else if (!lang || lang === 'xx' || lang === 'null') no_lang_backdrops.push(backdrop);
                                else other_backdrops.push(backdrop);
                            });

                            var final_backdrops = [].concat(lang_backdrops);
                            if (final_backdrops.length < 5 && no_lang_backdrops.length > 0) {
                                final_backdrops = final_backdrops.concat(no_lang_backdrops.slice(0, 5 - final_backdrops.length));
                            }
                            if (final_backdrops.length < 5 && other_backdrops.length > 0) {
                                other_backdrops.sort(function (a, b) { return (b.vote_average || 0) - (a.vote_average || 0); });
                                final_backdrops = final_backdrops.concat(other_backdrops.slice(0, 5 - final_backdrops.length));
                            }
                            final_backdrops = final_backdrops.slice(0, 15);

                            if (final_backdrops.length > 1) {
                                if (window.cardifyRotationTimer) clearInterval(window.cardifyRotationTimer);

                                var current_index = 0;
                                var is_active = true;
                                window.cardifyCurrentItemId = item_id;

                                var quality = Lampa.Storage.field('cardify_slideshow_quality') || 'w1280';
                                var duration = parseInt(Lampa.Storage.field('cardify_slideshow_duration')) || 8000;

                                window.cardifyRotationTimer = setInterval(function () {
                                    if (!is_active || window.cardifyCurrentItemId !== item_id) {
                                        clearInterval(window.cardifyRotationTimer);
                                        return;
                                    }
                                    current_index = (current_index + 1) % final_backdrops.length;
                                    var backdrop_url = Lampa.TMDB.image('t/p/' + quality + final_backdrops[current_index].file_path);

                                    var $render = e.object.activity.render();
                                    var $currentBg = $render.find('.full-start__background').last();
                                    if ($currentBg.length === 0) return;

                                    var img = new Image();
                                    img.onload = function () {
                                        if (!is_active || window.cardifyCurrentItemId !== item_id) return;
                                        var $newBg = $currentBg.clone();
                                        $newBg.attr('src', backdrop_url);
                                        $newBg.css({ 'opacity': '0', 'transition': 'opacity 1.5s ease-in-out', 'transform': 'translateZ(0)' });

                                        var $overlay = $render.find('.cardify-effects-overlay');
                                        if ($overlay.length) $overlay.before($newBg);
                                        else $currentBg.after($newBg);

                                        $newBg[0].offsetHeight;
                                        $newBg.css('opacity', '1');
                                        $currentBg.css({ 'transition': 'opacity 1.5s ease-in-out', 'opacity': '0' });

                                        setTimeout(function () {
                                            if (!is_active || window.cardifyCurrentItemId !== item_id) return;
                                            $currentBg.remove();
                                            $render.find('.full-start__background').not($newBg).remove();
                                        }, 1550);
                                    };
                                    img.onerror = function () {};
                                    img.src = backdrop_url;
                                }, duration);

                                var stop_rotation = function (a) {
                                    if (a.type == 'destroy' && a.object.activity === e.object.activity) {
                                        is_active = false;
                                        if (window.cardifyRotationTimer) clearInterval(window.cardifyRotationTimer);
                                        Lampa.Listener.remove('activity', stop_rotation);
                                    }
                                };
                                Lampa.Listener.follow('activity', stop_rotation);
                            }
                        }
                    }
                );
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Инициализация плагина
    // ─────────────────────────────────────────────────────────────────────────

    function startPlugin() {
        if (!Lampa.Platform.screen("tv")) return;

        // Переводы (все на русском по умолчанию)
        Lampa.Lang.add({
            cardify_enable_sound: {
                ru: "Включить звук",
                en: "Enable sound",
                uk: "Увімкнути звук"
            }
        });

        // Шаблон карточки
        Lampa.Template.add(
            "full_start_new",
            '<div class="full-start-new cardify">\n' +
            '  <div class="full-start-new__body">\n' +
            '    <div class="full-start-new__left hide">\n' +
            '      <div class="full-start-new__poster">\n' +
            '        <img class="full-start-new__img full--poster" />\n' +
            '      </div>\n' +
            '    </div>\n' +
            '    <div class="full-start-new__right">\n' +
            '      <div class="cardify__left">\n' +
            '        <div class="full-start-new__head"></div>\n' +
            '        <div class="cardify-logo"></div>\n' +
            '        <div class="full-start-new__title">{title}</div>\n' +
            '        <div class="full-start-new__rate-line rate-fix">\n' +
            '          <div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>\n' +
            '          <div class="full-start__rate rate--imdb hide"><div></div><div>IMDB</div></div>\n' +
            '          <div class="full-start__rate rate--kp hide"><div></div><div>KP</div></div>\n' +
            '          <div class="full-start__rate rate--cub hide"><div></div><div>CUB</div></div>\n' +
            '        </div>\n' +
            '        <div class="cardify__details">\n' +
            '          <div class="full-start-new__details"></div>\n' +
            '        </div>\n' +
            '        <div class="full-start-new__buttons">\n' +
            '          <div class="full-start__button selector button--play">\n' +
            '            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
            '              <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>\n' +
            '              <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>\n' +
            '            </svg>\n' +
            '            <span>#{title_watch}</span>\n' +
            '          </div>\n' +
            '          <div class="full-start__button selector button--trailer hide">\n' +
            '            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
            '              <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>\n' +
            '              <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>\n' +
            '            </svg>\n' +
            '            <span>#{title_trailer}</span>\n' +
            '          </div>\n' +
            '        </div>\n' +
            '        <div class="full-start__status"></div>\n' +
            '        <div class="full-start__pg hide"></div>\n' +
            '      </div>\n' +
            '      <div class="cardify__right">\n' +
            '        <div class="full-start-new__reactions"></div>\n' +
            '      </div>\n' +
            '    </div>\n' +
            '  </div>\n' +
            '</div>'
        );

        // ── CSS ──────────────────────────────────────────────────────────────
        var style =
            '<style>' +
            '.cardify{transition:all .3s}' +
            '.cardify .full-start-new__body{height:80vh}' +
            '.cardify .full-start-new__right{display:flex;align-items:flex-end}' +
            '.cardify .full-start-new__title{text-shadow:0 0 .1em rgba(0,0,0,0.3)}' +
            '.cardify__left{flex-grow:1}' +
            '.cardify__right{display:flex;align-items:center;flex-shrink:0;position:relative}' +
            '.cardify__details{display:flex}' +
            '.cardify .full-start-new__reactions,.cardify .reaction__count{display:none !important}' +
            '.cardify .full-start-new__rate-line.rate-fix{margin:1em 0 1.7em 0}' +
            '.full-start-new__details{margin:0 0 1.4em -0.3em}' +
            '.full-start-new__rate-line{margin:0;margin-left:3.5em}' +
            '.cardify .full-start-new__rate-line>*:last-child{margin-right:0 !important}' +
            '.cardify__background{left:0;will-change:opacity,transform;transform:translateZ(0)}' +
            '.cardify__background.nodisplay{opacity:0 !important}' +
            '.cardify.nodisplay{transform:translate3d(0,50%,0);opacity:0}' +
            '.head.nodisplay{transform:translate3d(0,-100%,0)}' +
            'body:not(.menu--open) .cardify__background{mask-image:linear-gradient(to bottom,white 50%,rgba(255,255,255,0) 100%);-webkit-mask-image:-webkit-linear-gradient(top,white 50%,rgba(255,255,255,0) 100%)}' +
            '.cardify-logo{margin-bottom:0.5em;min-height:0}' +
            '.cardify-logo img{max-height:4em;width:auto;object-fit:contain;display:block}' +
            '.cardify-trailer{opacity:0;transition:opacity .3s;position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;will-change:opacity}' +
            '.cardify-trailer__youtube{background-color:#000;position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:0}' +
            '.cardify-trailer__youtube iframe{border:0;width:100%;height:100%;flex-shrink:0;z-index:0;transition:transform 0.3s;pointer-events:none;will-change:transform}' +
            '.cardify-trailer__youtube-line{position:fixed;height:6.2em;background-color:#000;width:100%;left:0;display:none;z-index:2}' +
            '.cardify-trailer__youtube-line.one{top:0}' +
            '.cardify-trailer__youtube-line.two{bottom:0}' +
            '.cardify-trailer__controlls{position:fixed;left:1.5em;right:1.5em;bottom:1.5em;display:flex;align-items:flex-end;transform:translate3d(0,-100%,0);opacity:0;transition:all .3s;z-index:10}' +
            '.cardify-trailer__title{flex-grow:1;padding-right:5em;font-size:4em;font-weight:600;text-shadow:2px 2px 4px #000;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}' +
            '.cardify-trailer__remote{flex-shrink:0;display:flex;align-items:center}' +
            '.cardify-trailer__remote-icon{flex-shrink:0;width:2.5em;height:2.5em}' +
            '.cardify-trailer__remote-text{margin-left:1em;text-shadow:1px 1px 2px #000}' +
            '.cardify-trailer.display{opacity:1}' +
            '.cardify-trailer.display .cardify-trailer__controlls{transform:translate3d(0,0,0);opacity:1}' +
            // Скрытие элементов
            'body.cardify-hide-status .full-start__status{display:none !important}' +
            'body.cardify-hide-pg .full-start__pg{display:none !important}' +
            'body.cardify-hide-rating .full-start-new__rate-line.rate-fix{display:none !important}' +
            'body.cardify-hide-description .full-descr,.full-descr__text{display:none !important}' +
            '</style>';

        $("body").append(style);

        // Иконка для меню настроек (SVG — прямоугольник с полосками)
        var icon =
            '<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="1.5" y="1.5" width="33" height="25" rx="3.5" stroke="white" stroke-width="3"/>' +
            '<rect x="5" y="14" width="17" height="4" rx="2" fill="white"/>' +
            '<rect x="5" y="20" width="10" height="3" rx="1.5" fill="white"/>' +
            '<rect x="25" y="20" width="6" height="3" rx="1.5" fill="white"/>' +
            '</svg>';

        Lampa.SettingsApi.addComponent({
            component: "cardify",
            icon: icon,
            name: "Cardify+"
        });

        // ── Настройки плагина (все на русском) ───────────────────────────────

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: { name: "cardify_trailers_bg", type: "trigger", default: false },
            field: {
                name: "Фоновое видео (трейлер)",
                description: "Автоматически воспроизводить трейлер на фоне без звука"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailers_blur",
                type: "select",
                values: { "0": "Выключено", "1": "1px", "2": "2px", "3": "3px", "4": "4px", "5": "5px", "10": "10px" },
                default: "0"
            },
            field: {
                name: "Размытие фонового видео",
                description: "Применить blur к фоновому плееру"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailers_zoom",
                type: "select",
                values: { "0": "Выключено", "25": "25%", "33": "33%", "40": "40%", "45": "45%", "50": "50%" },
                default: "0"
            },
            field: {
                name: "Масштаб видео",
                description: "Увеличить видео, чтобы скрыть чёрные полосы"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: { name: "cardify_run_slideshow", type: "trigger", default: true },
            field: {
                name: "Слайдшоу фоновых изображений",
                description: "Плавная смена постеров (отключается при включённом видеофоне)"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_slideshow_quality",
                type: "select",
                values: { w780: "Стандартное (W780)", w1280: "Высокое (W1280)", original: "Оригинал" },
                default: "w1280"
            },
            field: { name: "Качество фоновых изображений" }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_slideshow_duration",
                type: "select",
                values: { 5000: "5 секунд", 8000: "8 секунд", 10000: "10 секунд", 15000: "15 секунд" },
                default: 8000
            },
            field: { name: "Интервал смены изображений" }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: { name: "cardify_move_text", type: "trigger", default: true },
            field: {
                name: "Перенос описания вправо",
                description: "Компактный вид: перемещает описание в правый верхний угол (для широких экранов)"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: { name: "cardify_show_description", type: "trigger", default: true },
            field: {
                name: "Показывать описание",
                description: "Скрыть или показать текст описания на карточке/постере"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: { name: "cardify_show_status", type: "trigger", default: true },
            field: { name: "Показывать статус" }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: { name: "cardify_show_rating", type: "trigger", default: true },
            field: { name: "Показывать рейтинги" }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: { name: "cardify_show_pg", type: "trigger", default: true },
            field: { name: "Показывать возрастной рейтинг" }
        });

        // ── Размер логотипа ──────────────────────────────────────────────────
        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_logo_size",
                type: "select",
                values: { "2": "Маленький", "3": "Средний", "4": "Большой", "5": "Очень большой", "6": "Огромный" },
                default: "3"
            },
            field: {
                name: "Размер логотипа",
                description: "Управляет размером логотипа фильма/сериала"
            }
        });

        // ── Отступы текста ───────────────────────────────────────────────────
        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_text_padding",
                type: "select",
                values: { "0": "Нет", "1": "Маленький", "2": "Средний", "3": "Большой", "4": "Очень большой" },
                default: "2"
            },
            field: {
                name: "Отступ текста слева",
                description: "Горизонтальный отступ текстового блока от края"
            }
        });

        // ── Размер заголовка ─────────────────────────────────────────────────
        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_title_size",
                type: "select",
                values: { "2": "Маленький", "2.5": "Средне-маленький", "3": "Средний", "3.5": "Средне-большой", "4": "Большой", "5": "Очень большой" },
                default: "3"
            },
            field: {
                name: "Размер заголовка",
                description: "Размер шрифта названия фильма/сериала"
            }
        });

        // ── Размер текста описания ───────────────────────────────────────────
        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_desc_size",
                type: "select",
                values: { "0.9": "Очень маленький", "1.0": "Маленький", "1.2": "Средний", "1.4": "Средне-большой", "1.6": "Большой", "1.8": "Очень большой" },
                default: "1.2"
            },
            field: {
                name: "Размер текста описания",
                description: "Размер шрифта описания фильма/сериала"
            }
        });

        // ── Применение видимости и динамических стилей при старте ────────────
        updateCardifyVisibility();
        updateCardifyStyles();

        // Слушаем изменения настроек
        Lampa.Storage.listener.follow('change', function (e) {
            var visibilityKeys = ['cardify_show_status', 'cardify_show_pg', 'cardify_show_rating', 'cardify_show_description'];
            var styleKeys = ['cardify_logo_size', 'cardify_text_padding', 'cardify_title_size', 'cardify_desc_size'];

            if (visibilityKeys.indexOf(e.name) !== -1) updateCardifyVisibility();
            if (styleKeys.indexOf(e.name) !== -1) updateCardifyStyles();
        });

        // ── Подписка на событие загрузки карточки ────────────────────────────
        Lampa.Listener.follow('full', function (e) {
            processCard(e);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Запуск: ждём готовности приложения
    // ─────────────────────────────────────────────────────────────────────────
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }

})();
